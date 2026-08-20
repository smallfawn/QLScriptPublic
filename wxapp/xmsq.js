/*
------------------------------------------
@Description: 小米社区 - 微信小程序登录 + 每日签到
cron: 15 8 * * *
------------------------------------------
变量名：xmsq
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx240a4a764023c444，登录 account.xiaomi.com / 业务 api.vip.miui.com）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

登录（纯 wx code，无需小米账号密码/passToken 外部凭证）：
  0) 取微信 getUserInfo 加密资料：POST wx_server/wx/getuserinfo {appid,openid}
       -> data.{cloud_id,encryptedData,iv,signature,data(明文profile)}
  1) POST account.xiaomi.com/pass/sns/wxapp/v2/code
       form {code, appid, sid:"wx_vip", userInfo:"true", _locale:"zh_CN"}
       -> code==0，data.wxSToken（微信登录临时票据）
  2) set-cookie deviceId / wxSToken；并把 userInfo 写进 cookie（url-encoded JSON:
       {cloudID,encryptedData,iv,signature,userInfo,rawData,errMsg}）
       ★ 关键：缺 userInfo cookie 时 tokenLogin 只会 302 到 serviceLogin、无法签发会话
  3) POST account.xiaomi.com/pass/sns/wxapp/v3/tokenLogin
       form {sid:"wx_vip", appid, callback:"", authType:"1", wxSToken, _locale}，不跟随重定向
       -> 返回 JSON 含 passToken/userId/cUserId（存缓存）
          code=20003 用户不存在=该微信未注册小米账号；code=24023 用户密码未设置=账号未激活
  4) set-cookie passToken/userId/cUserId
  5) GET account.xiaomi.com/pass/serviceLogin?sid=wx_vip&_json=true -> code0，location(STS地址)
  6) GET <STS地址> -> {S:"OK"}，set-cookie wx_vip_ph（社区会话票据）
签到（api.vip.miui.com，用 ?wx_vip_ph= 作为会话）：
  查询 GET /mtop/planet/wechat/checkin/mypagedata -> entity.data[].title=="每日签到" 的 button=="已签到" 即已签
  签到 POST /mtop/planet/wechat/member/addCommunityGrowUpPointByActionV2  form {action:"WECHAT_CHECKIN_TASK"}
        -> message=="success" 成功
sid="wx_vip"、action="WECHAT_CHECKIN_TASK" 是这家小程序固定应用常量（原脚本硬编码，非个人凭证）。
passToken/userId/cUserId 为登录后本机生成的会话票据，按 openid 存本地缓存 xmsq_token_cache.json。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("小米社区签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "xmsq";
const MINI_APP_ID = "wx240a4a764023c444";
const PAGE_VERSION = "73";
const ACCOUNT = "https://account.xiaomi.com";
const BASE = "https://api.vip.miui.com";
const SID = "wx_vip";
const TOKEN_CACHE_FILE = path.join(__dirname, "xmsq_token_cache.json");
const UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) " +
    "Mobile/15E148 MicroMessenger/8.0.73(0x18004939) NetType/WIFI Language/zh_CN";
const REFERER = `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`;

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

const DEBUG = process.env.XMSQ_DEBUG === "1";

function readCache() {
    try { if (!fs.existsSync(TOKEN_CACHE_FILE)) return {}; return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {}; } catch (e) { return {}; }
}
function writeCache(c) {
    try { fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(c, null, 2), "utf8"); } catch (e) { $.log(`写入缓存失败: ${e.message || e}`); }
}
function parseAccount(raw = "") {
    const [id, remark] = String(raw).split("#").map((s) => (s || "").trim());
    return { openid: id, remark: remark || "" };
}
function short(v, n = 300) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
// 小米部分 JSON 接口以 &&&START&&& 开头
function parseXiaomiJson(text) {
    if (text == null) return {};
    if (typeof text === "object") return text;
    let t = String(text);
    if (t.startsWith("&&&START&&&")) t = t.slice("&&&START&&&".length);
    try { return JSON.parse(t); } catch (e) { return { __raw: t }; }
}

class CookieJar {
    constructor() { this.map = {}; }
    setFromResponse(res) {
        const sc = res && res.headers && res.headers["set-cookie"];
        if (!sc) return;
        for (const line of sc) {
            const seg = String(line).split(";")[0];
            const eq = seg.indexOf("=");
            if (eq < 0) continue;
            const name = seg.slice(0, eq).trim();
            const val = seg.slice(eq + 1).trim();
            if (name) this.map[name] = val;
        }
    }
    set(name, val) { this.map[name] = String(val); }
    get(name) { return this.map[name]; }
    header() { return Object.entries(this.map).map(([k, v]) => `${k}=${v}`).join("; "); }
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.jar = new CookieJar();
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }
    // 取微信 getUserInfo 加密资料（小米登录前需把它写进 userInfo cookie，否则 tokenLogin 302 无法签发会话）
    async getUserInfoBlob() {
        try {
            const res = await axios.post(`${wechat.serverUrl}/wx/getuserinfo`, { appid: MINI_APP_ID, openid: this.account.openid },
                { headers: { auth: wechat.auth }, timeout: 20000, validateStatus: () => true });
            const d = res.data && res.data.data;
            if (!res.data || res.data.status === false || !d || !d.encryptedData) return null;
            let profile = {}; try { profile = JSON.parse(d.data); } catch (e) {}
            // rawData 用微信原样返回串（保持 signature 有效）；cloud_id → cloudID
            return { cloudID: d.cloud_id, encryptedData: d.encryptedData, iv: d.iv, signature: d.signature, userInfo: profile, rawData: d.data, errMsg: "getUserInfo:ok" };
        } catch (e) { return null; }
    }
    async req(method, url, { form, params, allowRedirect = true } = {}) {
        const headers = {
            "User-Agent": UA,
            Referer: REFERER,
            Origin: "https://servicewechat.com",
            Accept: "*/*",
        };
        const cookie = this.jar.header();
        if (cookie) headers.Cookie = cookie;
        let data;
        if (form) {
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            data = new URLSearchParams(form).toString();
        }
        const res = await axios.request({
            method, url, data, params,
            headers,
            timeout: 20000,
            responseType: "text",
            transformResponse: (r) => r,
            maxRedirects: allowRedirect ? 5 : 0,
            validateStatus: () => true,
        });
        this.jar.setFromResponse(res);
        if (DEBUG) this.log(`  «${method} ${url.replace(/^https?:\/\/[^/]+/, "")}» HTTP ${res.status} :: ${short(res.data, 260)}`);
        return res;
    }

    // ── 登录：纯 wx code(+微信userInfo) → wxSToken → passToken → serviceLogin → STS → wx_vip_ph ──
    async login() {
        const code = await this.getCode();
        const userInfoBlob = await this.getUserInfoBlob();
        this.jar.set("deviceId", `wp_${$.uuid()}`);

        // 1) 微信 code 换 wxSToken
        const r1 = await this.req("POST", `${ACCOUNT}/pass/sns/wxapp/v2/code`, {
            form: { code, appid: MINI_APP_ID, sid: SID, userInfo: "true", _locale: "zh_CN" },
        });
        const b1 = parseXiaomiJson(r1.data);
        if (b1.code !== 0) {
            const desc = b1.description || b1.desc || b1.message || short(b1);
            throw new Error(`NO_ACCOUNT:微信换取小米登录票据失败(code=${b1.code}, ${desc})`);
        }
        const wxSToken = b1.data && b1.data.wxSToken;
        if (!wxSToken) throw new Error(`NO_ACCOUNT:小米登录响应缺少 wxSToken: ${short(b1)}`);
        this.jar.set("wxSToken", wxSToken);
        // 关键：把微信 userInfo 写进 cookie，tokenLogin 才会返回 JSON 会话（缺它会 302）
        if (userInfoBlob) this.jar.set("userInfo", encodeURIComponent(JSON.stringify(userInfoBlob)));

        // 2) 建立小米账号会话（返回 passToken；老账号可能 302，退回本地缓存）
        const r2 = await this.req("POST", `${ACCOUNT}/pass/sns/wxapp/v3/tokenLogin`, {
            form: { sid: SID, appid: MINI_APP_ID, callback: "", authType: "1", wxSToken, _locale: "zh_CN" },
            allowRedirect: false,
        });
        let session = {};
        if (r2.status >= 300 && r2.status < 400) {
            const cached = readCache()[this.account.openid] || {};
            if (!cached.passToken || !cached.userId) {
                throw new Error("小米账号已有登录态但本地缺少首登票据，请在真机小程序登录一次以生成缓存后再跑");
            }
            session = cached;
            this.log("已加载本地缓存会话票据");
        } else {
            const b2 = parseXiaomiJson(r2.data);
            if (!b2.passToken) {
                // 常见账号态：用户不存在 / 未设置密码（微信绑定的小米账号未完成注册激活）
                if (b2.code === 20003) throw new Error(`NO_ACCOUNT:小米账号不存在(20003 ${b2.description || "用户不存在"})`);
                if (b2.code === 24023) throw new Error(`NOT_ACTIVATED:小米账号未设置密码(24023 用户密码未设置)`);
                throw new Error(`小米会话建立失败: ${short(b2)}`);
            }
            session = { passToken: b2.passToken, userId: b2.userId, cUserId: b2.cUserId };
            const cache = readCache();
            cache[this.account.openid] = { ...session, updatedAt: new Date().toISOString() };
            writeCache(cache);
        }
        for (const k of ["passToken", "userId", "cUserId"]) {
            if (session[k]) this.jar.set(k, session[k]);
        }

        // 3) serviceLogin 拿 STS 跳转地址
        const r3 = await this.req("GET", `${ACCOUNT}/pass/serviceLogin`, {
            params: { sid: SID, _json: "true", _locale: "zh_CN" },
        });
        const b3 = parseXiaomiJson(r3.data);
        const stsUrl = b3.location;
        if (b3.code !== 0 || !stsUrl) throw new Error(`serviceLogin 失败: ${short(b3)}`);

        // 4) STS 登录，拿 wx_vip_ph 社区会话票据
        const r4 = await this.req("GET", stsUrl);
        const b4 = parseXiaomiJson(r4.data);
        if (b4.S !== "OK") throw new Error(`STS 登录失败: ${short(b4)}`);
        const ph = this.jar.get("wx_vip_ph");
        if (!ph) throw new Error(`STS 未返回 wx_vip_ph: ${short(b4)}`);
        this.ph = ph;
        this.log("登录成功");
    }

    // ── 业务：查询 + 签到 ──
    async apiGet(apiPath) {
        const res = await this.req("GET", `${BASE}${apiPath}`, { params: { wx_vip_ph: this.ph } });
        return parseXiaomiJson(res.data);
    }
    async apiPostForm(apiPath, form) {
        const res = await this.req("POST", `${BASE}${apiPath}`, { params: { wx_vip_ph: this.ph }, form });
        return parseXiaomiJson(res.data);
    }
    async sign() {
        const status = await this.apiGet("/mtop/planet/wechat/checkin/mypagedata");
        if (status.code === 401) throw new Error("SESSION_INVALID:小米登录态无效");
        const buttons = (status.entity && status.entity.data) || [];
        const already = Array.isArray(buttons) && buttons.some(
            (item) => item && item.title === "每日签到" &&
                ((item.buttons && item.buttons[0] && item.buttons[0].button) === "已签到")
        );
        if (already) return this.log("✅ 今日已签到，无需重复执行");

        const res = await this.apiPostForm("/mtop/planet/wechat/member/addCommunityGrowUpPointByActionV2", { action: "WECHAT_CHECKIN_TASK" });
        if (res.message === "success") {
            const entity = res.entity || {};
            return this.log(`✅ 签到成功${entity.title ? `，${entity.title}` : "，获得成长值"}`);
        }
        const msg = res.message || res.description || res.desc || short(res);
        if (/已签|签到过|重复|已完成/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        this.log(`❌ 签到失败: ${msg}`);
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.login();
            await this.sign();
        } catch (e) {
            const m = String(e.message || e);
            if (m.startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号尚未注册小米账号/社区，请先在小程序里用微信登录并完成注册再跑。详情：${m.replace(/^NO_ACCOUNT:/, "")}`);
                return;
            }
            if (m.startsWith("NOT_ACTIVATED")) {
                this.log(`⚠️ 微信绑定的小米账号未激活（未设置密码），请在小米社区/账号中心完成账号设置后再跑。详情：${m.replace(/^NOT_ACTIVATED:/, "")}`);
                return;
            }
            this.log(`执行失败: ${m}`);
        }
    }
}

!(async () => {
    $.checkEnv(ckName);
    if (!$.userCount) { $.log(`未找到变量 ${ckName}`); return; }
    for (let i = 0; i < $.userList.length; i++) {
        await new Task($.userList[i]).run();
        if (i < $.userList.length - 1) await $.wait(1500, 3000);
    }
})().catch((e) => $.log(e.message || e)).finally(() => $.done());
