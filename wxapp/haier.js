/*
------------------------------------------
@Description: 海尔智家 - 微信小程序静默登录 + 每日签到
cron: 55 8 * * *
------------------------------------------
变量名：haier
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxe24b2f1f4e378891，host zj.haier.net）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

签名：sign = sha256(path + JSON.stringify(body) + HA_APP_ID + HA_APP_KEY + timestamp)（仅 jscode2session 带 sign）
请求头：appId=HA_APP_ID / appKey=HA_APP_KEY / timestamp / platForm:sc-mp-wx-zjapp / clientId / accessToken=accountToken=ak=token
登录  POST /api-gw/oauthserver/applet/v1/jscode2session {code}（带 sign，头不带 token）
        -> retCode=="00000"，data.tokenInfo.accountToken（=后续 token）
签到  POST /api-gw/zjBaseServer/daily/sign {} -> retCode=="00000"，data.totalSignDay
HA_APP_ID/HA_APP_KEY 是这家小程序固定应用标识（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("海尔智家签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "haier";
const MINI_APP_ID = "wxe24b2f1f4e378891";
const PAGE_VERSION = "475";
const HA_APP_ID = "MB-SHEZJAPPWXXCX-0000";
const HA_APP_KEY = "79ce99cc7f9804663939676031b8a427";
const API_HOST = "https://zj.haier.net";
const TOKEN_CACHE_FILE = path.join(__dirname, "haier_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/api-gw/oauthserver/applet/v1/jscode2session";
const EP_USERINFO = "/api-gw/oauthserver/applet/v1/userinfo/query";
const EP_SIGN = "/api-gw/zjBaseServer/daily/sign";

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
function short(v, n = 200) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function randomString(n) {
    const cs = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: n }, () => cs[Math.floor(Math.random() * cs.length)]).join("");
}
function sign256(p, body, timestamp) {
    const bodyStr = body ? JSON.stringify(body) : "";
    return crypto.createHash("sha256").update(p + bodyStr + HA_APP_ID + HA_APP_KEY + timestamp).digest("hex");
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.clientId = `${Date.now()}${randomString(12)}`;
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    async request(apiPath, data, { isSign256 = false, delToken = false } = {}) {
        const timestamp = Date.now();
        const headers = {
            host: "zj.haier.net", "Content-Type": "application/json;charset=UTF-8",
            appId: HA_APP_ID, appKey: HA_APP_KEY, timestamp, platForm: "sc-mp-wx-zjapp", ENV: "",
            accessToken: delToken ? "" : this.token, accountToken: delToken ? "" : this.token, ak: delToken ? "" : this.token,
            clientId: this.clientId, accept: "*/*", "user-agent": UA,
            referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
        };
        if (isSign256) headers.sign = sign256(apiPath, data, timestamp);
        const res = await axios.request({ method: "POST", url: `${API_HOST}${apiPath}`, data: data || {}, headers, timeout: 20000, validateStatus: () => true });
        if (res.status !== 200) { if (res.data && typeof res.data === "object") return res.data; throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`); }
        return res.data;
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
        const res = await this.request(EP_LOGIN, { code }, { isSign256: true, delToken: true });
        if (res?.retCode !== "00000" && res?.code !== 200 && !res?.success) throw new Error(`登录失败: ${res?.retInfo || res?.message || short(res)}`);
        const info = (res.data && res.data.tokenInfo) || res.data || {};
        this.token = String(info.accountToken || "");
        if (!this.token) {
            // 有 openId/unionId 但无 accountToken = 该微信号未注册海尔智家会员
            const oid = (res.data || {}).openId || info.openId || (res.data || {}).unionId || info.unionId;
            if (oid) { this.unregistered = true; throw new Error("NO_ACCOUNT:未注册海尔智家会员"); }
            throw new Error(`登录未返回 accountToken: ${short(res)}`);
        }
        try { await this.request(EP_USERINFO, {}); } catch (e) {}
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    async sign(retry = true) {
        const res = await this.request(EP_SIGN, {});
        if (res?.retCode === "00000") {
            const d = res.data || {};
            return this.log(`✅ 签到成功${d.totalSignDay !== undefined ? `，已连续 ${d.totalSignDay} 天` : ""}`);
        }
        const msg = res?.retInfo || res?.message || res?.msg || short(res);
        if (/已签|签到过|重复|已完成/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && /token|登录|未授权|失效|过期|未登录|鉴权/i.test(String(msg))) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
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
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log("⚠️ 该微信号还没在海尔智家注册会员，先在小程序里登录注册一次再跑");
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
