/*
------------------------------------------
@Description: 深圳春茧未来荟(深圳体育湾春茧) - 微信小程序静默登录 + 每日签到
cron: 40 8 * * *
------------------------------------------
变量名：szgc
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx6b10d95e92283e1c，host program.springcocoon.com，ABP/ASP.NET Boilerplate 框架，Cookie 会话鉴权）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录；鉴权走 requests.Session 的 Cookie，非 token）

关键：这是 cookie-session 流程，本脚本自带极简 CookieJar + 手动跟随重定向来复刻 requests.Session 行为。
登录  POST /szbay/Weixin/Home/MiniProgramLoginAsync  {Code:code, TenancyName:"szbay", AppId:appid}
        -> success===true（服务端下发鉴权 cookie；不返回 token，认证完全靠 cookie）
XSRF  GET  /szbay/AppInteract/SignIn/Index  -> 下发 XSRF-TOKEN cookie，回填到 X-XSRF-TOKEN 头
签到  POST /szbay/api/services/app/SignInRecord/SignInAsync
        {id:"6c3a00f6-b9f0-44a3-b8a0-d5d709de627d", webApiUniqueID:"404e4880-25da-255b-f6e3-cded50d2cb52"}
        -> success===true，result.listSignInRuleData[0].point 为本次积分；
           已签/失败 success===false，error.message 提示
TenancyName/AppId/id/webApiUniqueID 均为该小程序固定应用常量（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("深圳春茧未来荟签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");
const WeChatServer = require("./wcs.js");

// 复刻原脚本 TLSAdapter：该服务器要求 OP_LEGACY_SERVER_CONNECT + SECLEVEL=1
// 否则 Node(OpenSSL3) 报 "unsafe legacy renegotiation disabled"
const httpsAgent = new https.Agent({
    keepAlive: true,
    secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
    ciphers: "DEFAULT@SECLEVEL=1",
});

const ckName = "szgc";
const MINI_APP_ID = "wx6b10d95e92283e1c";
const HOST = "program.springcocoon.com";
const BASE = `https://${HOST}`;
const TENANCY_NAME = "szbay";
const SIGN_ID = "6c3a00f6-b9f0-44a3-b8a0-d5d709de627d";
const SIGN_WEBAPI_UNIQUE_ID = "404e4880-25da-255b-f6e3-cded50d2cb52";
const TOKEN_CACHE_FILE = path.join(__dirname, "szgc_token_cache.json");
const UA =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 XWEB/1340129 MMWEBSDK/20240301 MMWEBID/9871 " +
    "MicroMessenger/8.0.48.2580(0x28003036) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android";

const EP_LOGIN = "/szbay/Weixin/Home/MiniProgramLoginAsync";
const EP_XSRF = "/szbay/AppInteract/SignIn/Index";
const EP_SIGN = "/szbay/api/services/app/SignInRecord/SignInAsync";

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
function short(v, n = 240) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|签过|today|already/i.test(String(t || ""));

// 极简 CookieJar（单 host），复刻 requests.Session 的 cookie 累积
class CookieJar {
    constructor() { this.jar = {}; }
    setFromResponse(res) {
        const sc = res && res.headers && res.headers["set-cookie"];
        if (!sc) return;
        const arr = Array.isArray(sc) ? sc : [sc];
        for (const line of arr) {
            const first = String(line).split(";")[0];
            const idx = first.indexOf("=");
            if (idx <= 0) continue;
            const name = first.slice(0, idx).trim();
            const val = first.slice(idx + 1).trim();
            if (val === "" || /^deleted$/i.test(val)) { delete this.jar[name]; continue; }
            this.jar[name] = val;
        }
    }
    header() { return Object.entries(this.jar).map(([k, v]) => `${k}=${v}`).join("; "); }
    get(name) { return this.jar[name]; }
    load(obj) { if (obj && typeof obj === "object") this.jar = { ...obj }; }
    dump() { return { ...this.jar }; }
    size() { return Object.keys(this.jar).length; }
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.jar = new CookieJar();
        this.xsrf = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    // 底层请求：maxRedirects:0 + 手动跟随，逐跳累积 cookie（复刻 requests.Session）
    async raw(method, apiPath, { data, extraHeaders } = {}, depth = 0) {
        const headers = {
            Host: HOST,
            "User-Agent": UA,
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "zh-CN,zh;q=0.9",
            ...(this.jar.size() ? { Cookie: this.jar.header() } : {}),
            ...(this.xsrf ? { "X-XSRF-TOKEN": this.xsrf } : {}),
            ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
            ...(extraHeaders || {}),
        };
        const res = await axios.request({
            method, url: `${BASE}${apiPath}`, data,
            headers, timeout: 20000, maxRedirects: 0, validateStatus: () => true, httpsAgent,
        });
        this.jar.setFromResponse(res);
        if ([301, 302, 303, 307, 308].includes(res.status) && res.headers.location && depth < 5) {
            let loc = res.headers.location;
            let nextPath = loc;
            if (/^https?:\/\//i.test(loc)) { try { nextPath = new URL(loc).pathname + (new URL(loc).search || ""); } catch (e) { nextPath = loc; } }
            const nextMethod = [307, 308].includes(res.status) ? method : "GET";
            const nextData = nextMethod === "GET" ? undefined : data;
            return this.raw(nextMethod, nextPath, { data: nextData, extraHeaders }, depth + 1);
        }
        return res;
    }
    parseBody(res) {
        let body = res.data;
        if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { /* keep string */ } }
        return body;
    }
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }
    async login() {
        this.jar = new CookieJar();
        this.xsrf = "";
        const code = await this.getCode();
        const res = await this.raw("POST", EP_LOGIN, { data: { Code: code, TenancyName: TENANCY_NAME, AppId: MINI_APP_ID } });
        const body = this.parseBody(res) || {};
        if (body.success === true) {
            // bindEmpID 为空 = 微信已登录但未绑定/注册会员，签到会「请先登录」
            const r = body.result || {};
            this.bindEmpID = r.bindEmpID || r.bindEmpId || r.BindEmpID || null;
            if (!this.bindEmpID) {
                this.unregistered = true;
                throw new Error("NO_ACCOUNT:微信已授权但未绑定会员(bindEmpID为空)，登录页会跳转注册");
            }
            this.log("登录成功");
            const cache = readCache();
            cache[this.account.openid] = { cookies: this.jar.dump(), updatedAt: new Date().toISOString() };
            writeCache(cache);
            return;
        }
        const msg = (body.error && body.error.message) || body.message || short(body);
        if (/未注册|未绑定|完善|注册会员|绑定手机|激活/.test(String(msg))) {
            this.unregistered = true;
            throw new Error(`NO_ACCOUNT:${msg}`);
        }
        throw new Error(`登录失败(HTTP ${res.status}): ${msg}`);
    }
    async prepareXsrf() {
        const res = await this.raw("GET", EP_XSRF, {});
        const token = this.jar.get("XSRF-TOKEN");
        if (token) {
            this.xsrf = token;
            const cache = readCache();
            if (cache[this.account.openid]) { cache[this.account.openid].cookies = this.jar.dump(); writeCache(cache); }
            return true;
        }
        this.log(`⚠️ 未获取到 XSRF-TOKEN（HTTP ${res.status}），继续尝试签到`);
        return false;
    }
    isAuthErr(res, body) {
        if (res && (res.status === 401 || res.status === 403)) return true;
        if (body && body.unAuthorizedRequest === true) return true;
        const msg = (body && body.error && body.error.message) || (body && body.message) || "";
        return /未登录|登录已过期|重新登录|未授权|无权|尚未登录|会话|身份|token/i.test(String(msg));
    }
    async sign(retry = true) {
        const res = await this.raw("POST", EP_SIGN, { data: { id: SIGN_ID, webApiUniqueID: SIGN_WEBAPI_UNIQUE_ID } });
        const body = this.parseBody(res) || {};
        if (body.success === true) {
            const rule = (((body.result || {}).listSignInRuleData) || [])[0] || {};
            const point = rule.point;
            return this.log(`✅ 签到成功${point !== undefined ? `，获得 ${point} 积分` : ""}`);
        }
        const msg = (body.error && body.error.message) || body.message || short(body);
        if (isAlreadyDone(msg)) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && this.isAuthErr(res, body)) {
            this.log("会话失效，重新登录后重试");
            const cache = readCache(); delete cache[this.account.openid]; writeCache(cache);
            await this.login();
            await this.prepareXsrf();
            return this.sign(false);
        }
        // 若从缓存直接进来且 XSRF/会话不对，给一次全新登录机会
        if (retry) {
            this.log(`首次签到返回：${msg}，尝试全新登录后重试`);
            await this.login();
            await this.prepareXsrf();
            return this.sign(false);
        }
        this.log(`❌ 签到失败(HTTP ${res.status}): ${msg}`);
    }
    async ensureSession() {
        const cached = readCache()[this.account.openid] || {};
        if (cached.cookies && Object.keys(cached.cookies).length) {
            this.jar.load(cached.cookies);
            this.log("使用缓存会话");
            return;
        }
        await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureSession();
            await this.prepareXsrf();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在【深圳春茧未来荟】注册/完善会员（${String(e.message).replace(/^NO_ACCOUNT:/, "")}），先在小程序里登录一次再跑`);
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
