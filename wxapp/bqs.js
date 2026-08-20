/*
------------------------------------------
@Description: 倍轻松(BREO) - 微信小程序静默登录 + 每日签到(打卡)
cron: 12 9 * * *
------------------------------------------
变量名：bqs
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx61457400e4212cec，host breoplus.breo.cn）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录；两步登录 → JWT token）

两步登录（openId/unionId 由 code 登录端自行下发，非 smallcat 加密态）：
  1) GET  /app/minic/login/{code}            头 appHeaders(无token)
         -> code=="200" && data.{uid,openId,unionId,...}
  2) POST /breo-app/customer/loginByUid      头 appHeaders   body={uid,openId,unionId}
         -> success===true|code∈(0000,200) && result.token（JWT，缓存复用）
签到  POST /breo-app/user/po-task-info/punch 头 taskHeaders(token)  无 body
         -> success===true（result.point/grow）；重复签到 success:false + message 提示
浏览商城（每日附带任务，best-effort，不影响判定）
  POST /breo-app/user/po-task-info/mall      头 taskHeaders(token)
应用级常量：host / 端点 / channel:Breo / version 等，非个人凭证。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("倍轻松签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "bqs";
const MINI_APP_ID = "wx61457400e4212cec";
const PAGE_VERSION = "390";
const LOGIN_BASE = "https://breoplus.breo.cn/app/minic";
const APP_BASE = "https://breoplus.breo.cn/breo-app";
const TOKEN_CACHE_FILE = path.join(__dirname, "bqs_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = (code) => `${LOGIN_BASE}/login/${encodeURIComponent(code)}`;
const EP_LOGIN_BY_UID = `${APP_BASE}/customer/loginByUid`;
const EP_PUNCH = `${APP_BASE}/user/po-task-info/punch`;
const EP_MALL = `${APP_BASE}/user/po-task-info/mall`;

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

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
function short(v, n = 220) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function isSuccess(r) {
    if (!r || typeof r !== "object") return false;
    return r.success === true || ["0000", "200", "200.0"].includes(String(r.code));
}
function isAuthErr(msg) {
    return /40101|40102|token|登录|未登录|授权|过期|失效|未认证|请重新/i.test(String(msg || ""));
}

function appHeaders(token) {
    const h = {
        "User-Agent": UA,
        "Content-Type": "application/json",
        deviceInfo: "{}",
        Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
    };
    if (token) h.token = token;
    return h;
}
function taskHeaders(token) {
    return {
        token,
        "device-type": "Xiaomi",
        "device-version": "10",
        channel: "Breo",
        version_code: "30201",
        version: "3.2.1",
        encrypt: "1",
        "Content-Type": "application/json; charset=UTF-8",
        Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
        "User-Agent": UA,
    };
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
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
    async login() {
        const code = await this.getCode();
        // 第一步：code 换取 uid / openId / unionId
        const r1 = await axios.request({
            method: "GET", url: EP_LOGIN(code), headers: appHeaders(),
            timeout: 20000, validateStatus: () => true,
        });
        const d1 = r1.data || {};
        if (String(d1.code) !== "200" || !d1.data) throw new Error(`code登录失败: ${short(d1)}`);
        const u = d1.data || {};
        const uid = u.uid, openId = u.openId, unionId = u.unionId;
        if (!uid) throw new Error(`登录响应缺少uid: ${short(d1)}`);
        // 第二步：uid 换取业务 token
        const r2 = await axios.request({
            method: "POST", url: EP_LOGIN_BY_UID, headers: appHeaders(),
            data: { uid, openId, unionId }, timeout: 20000, validateStatus: () => true,
        });
        const d2 = r2.data || {};
        const result = d2.result || {};
        if (!isSuccess(d2) || !result.token) {
            const msg = d2.message || d2.msg || short(d2);
            if (/注册|未激活|绑定|会员/.test(String(msg))) { this.unregistered = true; throw new Error(`NO_ACCOUNT:${msg}`); }
            throw new Error(`业务token登录失败: ${msg}`);
        }
        this.token = String(result.token);
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, uid, openId, unionId, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${u.nickname ? `：${u.nickname}` : u.telephone ? `：${u.telephone}` : ""}`);
    }
    async punch() {
        const res = await axios.request({
            method: "POST", url: EP_PUNCH, headers: taskHeaders(this.token),
            data: "", timeout: 20000, validateStatus: () => true,
        });
        return res.data || {};
    }
    async browseMall() {
        try {
            const res = await axios.request({
                method: "POST", url: EP_MALL, headers: taskHeaders(this.token),
                data: "", timeout: 20000, validateStatus: () => true,
            });
            const r = res.data || {};
            if (r.success === true) {
                const rw = r.result || {};
                this.log(`🛒 浏览商城完成（+${rw.point ?? 0}点 / +${rw.grow ?? 0}成长）`);
            } else {
                const msg = r.message || r.msg || short(r);
                if (/已|重复|完成/.test(String(msg))) this.log(`🛒 商城任务今日已完成（${msg}）`);
            }
        } catch (e) { /* 附带任务失败不影响签到判定 */ }
    }
    async sign(retry = true) {
        const res = await this.punch();
        if (res.success === true) {
            const rw = res.result || {};
            return this.log(`✅ 签到成功（+${rw.point ?? 0}点 / +${rw.grow ?? 0}成长）`);
        }
        const msg = res.message || res.msg || short(res);
        if (/已签|签到过|重复|已经|今日已|已完成/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && isAuthErr(msg)) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            const cache = readCache();
            if (cache[this.account.openid]) { delete cache[this.account.openid]; writeCache(cache); }
            await this.login();
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msg}`);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) { this.token = cached.token; this.log("使用缓存token"); return; }
        if (!this.token) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
            await this.browseMall();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在倍轻松注册/激活会员（${String(e.message).replace(/^NO_ACCOUNT:/, "")}），先在小程序里登录一次再跑`);
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
