/*
------------------------------------------
@Description: 洽洽会员俱乐部 - 微信小程序静默登录 + 每日签到
cron: 39 8 * * *
------------------------------------------
变量名：qqhyjlb
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxc72491b6cd007333，两段登录）：
（迁移自 YYB-GO 系脚本 + 解包坐实：mobile 的 userId 就是 upms 的 loginId，非旧版硬编码 hash）

① upms 登录（vip.qiaqiafood.com）POST /upms/wechat/login/code form{code,tenantId:1,appId,componentAppId}
     -> status=="0"，data.data.loginId（=下一步 userId）+ token
② mobile 登录（qq-tasting-hall.qiaqiafood.com/mobile）POST /wechat/login form{code:<新code>,userId:loginId} 头 from_env:app
     -> status=="0"，Set-Cookie SESSION + data.customer.id；「用户状态不可用」= 该号未在洽洽 mobile 侧激活/注册
业务：mobilePost 带 Cookie SESSION + Authorization token + body.userId=loginId
签到  POST /promotion/sign/sign（先 /promotion/sign/list 判当天是否已签，signTime 前10位==今天）
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("洽洽会员俱乐部");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "qqhyjlb";
const MINI_APP_ID = "wxc72491b6cd007333";
const TENANT_ID = "1";
const VIP_BASE = "https://vip.qiaqiafood.com";
const MOBILE_BASE = "https://qq-tasting-hall.qiaqiafood.com/mobile";
const TOKEN_CACHE_FILE = path.join(__dirname, "qqhyjlb_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

function readCache() {
    try {
        if (!fs.existsSync(TOKEN_CACHE_FILE)) return {};
        return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {};
    } catch (e) {
        return {};
    }
}
function writeCache(cache) {
    try {
        fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
    } catch (e) {
        $.log(`写入缓存失败: ${e.message || e}`);
    }
}
function parseAccount(raw = "") {
    const [id, remark] = String(raw).split("#").map((s) => (s || "").trim());
    return { openid: id, remark: remark || "" };
}
function short(v, n = 200) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function formBody(obj) {
    return Object.entries(obj)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v === undefined || v === null ? "" : v)}`)
        .join("&");
}
function today() {
    const d = new Date(Date.now() + 8 * 3600 * 1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
function getSessionId(headers = {}) {
    const cookies = headers["set-cookie"] || headers["Set-Cookie"];
    const list = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
    for (const c of list) {
        const m = /SESSION=([^;]+)/.exec(c);
        if (m) return m[1];
    }
    return "";
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.session = { token: "", sessionId: "", userId: "" };
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    commonHeaders(extra = {}) {
        return {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": USER_AGENT,
            Referer: `https://servicewechat.com/${MINI_APP_ID}/516/page-frame.html`,
            ...extra,
        };
    }
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }
    async loginUpms() {
        const code = await this.getCode();
        const res = await axios.post(`${VIP_BASE}/upms/wechat/login/code`,
            formBody({ code, tenantId: TENANT_ID, appId: MINI_APP_ID, componentAppId: MINI_APP_ID }),
            { headers: this.commonHeaders({ Authorization: this.session.token || "" }), timeout: 20000, validateStatus: () => true });
        const d = res.data || {};
        if (res.status !== 200 || String(d.status) !== "0") throw new Error(`upms登录失败: ${d.msg || `HTTP ${res.status}`}`);
        const payload = (d.data && d.data.data) || d.data || {};
        this.session.token = payload.token || this.session.token || "";
        this.session.userId = String(payload.loginId || (payload.account || {}).loginId || "");
        if (!this.session.userId) throw new Error(`upms未返回 loginId: ${short(d)}`);
    }
    async loginMobile() {
        const code = await this.getCode();
        const res = await axios.post(`${MOBILE_BASE}/wechat/login`,
            formBody({ code, userId: this.session.userId }),
            { headers: this.commonHeaders({ from_env: "app" }), timeout: 20000, validateStatus: () => true });
        const d = res.data || {};
        if (String(d.status) !== "0") {
            // 「用户状态不可用」= 该号未在洽洽 mobile 侧激活/注册
            this.unregistered = /用户状态不可用|不可用|未注册|未激活/.test(String(d.msg || ""));
            throw new Error(`NO_MOBILE:${d.msg || short(d)}`);
        }
        const sid = getSessionId(res.headers);
        if (sid) this.session.sessionId = sid;
        const cust = (d.data || {}).customer || {};
        if (!this.session.sessionId) throw new Error(`mobile登录未拿到 SESSION: ${short(d)}`);
        this.log(`登录成功${cust.nickName ? `（${cust.nickName}）` : ""}`);
    }
    async login() {
        await this.loginUpms();
        await this.loginMobile();
        const cache = readCache();
        cache[this.account.openid] = { ...this.session, updatedAt: new Date().toISOString() };
        writeCache(cache);
    }
    async mobilePost(apiPath, data = {}) {
        if (!this.session.sessionId) throw new Error("缺少SESSION");
        const res = await axios.post(`${MOBILE_BASE}${apiPath}`,
            formBody({ ...(data || {}), userId: this.session.userId }),
            { headers: this.commonHeaders({ Cookie: `SESSION=${this.session.sessionId}`, Authorization: this.session.token || "", from_env: "app" }), timeout: 20000, validateStatus: () => true });
        const sid = getSessionId(res.headers);
        if (sid) this.session.sessionId = sid;
        return res.data;
    }
    async sign() {
        const list = (await this.mobilePost("/promotion/sign/list"))?.data || [];
        const signedToday = Array.isArray(list) && list.some((it) => String(it?.signTime || "").slice(0, 10) === today());
        if (signedToday) {
            const last = list[list.length - 1] || {};
            return this.log(`✅ 今日已签到，连续 ${last.signContinuousDay || 0} 天`);
        }
        const res = await this.mobilePost("/promotion/sign/sign");
        if (String(res?.status) === "0") {
            const point = (res.data || {}).point;
            return this.log(`✅ 签到成功${point ? `，积分+${point}` : ""}`);
        }
        const msg = res?.msg || short(res);
        if (/已签到|每天只能签到一次|重复|今日已/.test(msg)) return this.log(`✅ 今日已签到（${msg}）`);
        this.log(`❌ 签到失败: ${msg}`);
    }
    async checkSession() {
        try {
            const r = await this.mobilePost("/promotion/sign/list");
            return String(r?.status) === "0" || Array.isArray(r?.data);
        } catch (e) {
            return false;
        }
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.session.sessionId && cached.sessionId) {
            this.session = { token: cached.token || "", sessionId: cached.sessionId, userId: cached.userId || "" };
            if (await this.checkSession()) { this.log("使用缓存登录态"); return; }
            this.session = { token: "", sessionId: "", userId: "" };
        }
        if (!this.session.sessionId) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_MOBILE")) {
                this.log(`⚠️ 该微信号还没在洽洽会员(mobile侧)激活/注册（${e.message.slice(10)}），先在小程序里完成手机号登录/注册一次再跑`);
                return;
            }
            this.log(`执行失败: ${e.message || e}`);
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
