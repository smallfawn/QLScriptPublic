/*
------------------------------------------
@Description: 社服益寿活动 - 微信小程序静默登录 + 每日签到
cron: 22 8 * * *
------------------------------------------
变量名：shefuyishou
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx8ac1f54b8fc39c6c，host ylapi.luckystarpay.com）：
  登录  POST /api/silenceLogin  {code}          -> code==0, data.token
        之后所有请求带请求头 x-token: <token>
  资料  POST /api/getUserInfo                   -> data.userInfo.credits
  签到  POST /api/userSign                      -> code==0 成功；已签到走 message
成功码是 code==0（不是 200），失败时 message 里给原因。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("社服益寿活动");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");
const WeChatServer = require("./wcs.js");

const ckName = "shefuyishou";
const MINI_APP_ID = "wx8ac1f54b8fc39c6c";
const BASE = "https://ylapi.luckystarpay.com";
// 该站 TLS 证书已过期（服务端问题），Node 默认会以 certificate has expired 直接拒连。
// 小程序端照常访问，这里仅对本站放宽证书校验以恢复可用性（不影响其它请求）。
const httpsAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });
const TOKEN_CACHE_FILE = path.join(__dirname, "shefuyishou_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x28003036) MiniProgramEnv/android";

const EP_LOGIN = "/api/silenceLogin";
const EP_USER = "/api/getUserInfo";
const EP_SIGN = "/api/userSign";

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
        $.log(`写入token缓存失败: ${e.message || e}`);
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

function isOk(res) {
    return Number(res?.code) === 0;
}

function msgOf(res) {
    return res?.message || res?.msg || short(res);
}

/** 每天跑一次，「已签到」必须当成成功而不是失败 */
function isAlreadyDone(text) {
    return /已签|已经签|签到过|重复|already/i.test(String(text || ""));
}

function isAuthError(text) {
    return /登录|token|未授权|失效|过期|重新/i.test(String(text || ""));
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.credits = null;
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    headers() {
        return {
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
            Referer: `https://servicewechat.com/${MINI_APP_ID}/0/page-frame.html`,
            ...(this.token ? { "x-token": this.token } : {}),
        };
    }

    async request(method, apiPath, data = null) {
        const res = await axios.request({
            method,
            url: `${BASE}${apiPath}`,
            data,
            headers: this.headers(),
            timeout: 20000,
            validateStatus: () => true,
            httpsAgent,
        });
        if (res.status !== 200) throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        return res.data;
    }

    /**
     * wcs.getCode 在 status:false 时也会 resolve，必须显式判失败，
     * 否则 wx_server 的取码限流会被误报成目标站登录失败。
     */
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) {
            throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        }
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }

    async login() {
        const code = await this.getCode();
        const res = await this.request("POST", EP_LOGIN, { code });
        if (!isOk(res)) throw new Error(`登录失败: ${msgOf(res)}`);
        this.token = (res.data || {}).token || "";
        if (!this.token) throw new Error(`登录未返回 token: ${short(res)}`);
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }

    async ensureLogin() {
        if (!this.token) this.token = (readCache()[this.account.openid] || {}).token || "";
        if (this.token && (await this.queryUser(false))) return true;
        this.token = "";
        await this.login();
        return true;
    }

    async queryUser(needLog = true) {
        const res = await this.request("POST", EP_USER);
        if (!isOk(res)) {
            if (needLog) this.log(`读取资料失败: ${msgOf(res)}`);
            return false;
        }
        const info = (res.data || {}).userInfo || {};
        this.credits = info.credits;
        if (needLog) this.log(`积分: ${info.credits ?? "未知"}`);
        return true;
    }

    async sign() {
        const res = await this.request("POST", EP_SIGN);
        if (isOk(res)) {
            this.log("✅ 签到成功");
            return;
        }
        if (isAlreadyDone(msgOf(res))) {
            this.log(`✅ 今日已签到（${msgOf(res)}）`);
            return;
        }
        if (isAuthError(msgOf(res))) {
            // 缓存的 token 过期，重登一次再签（只重试一次，避免刷取码额度）
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            const again = await this.request("POST", EP_SIGN);
            if (isOk(again)) return this.log("✅ 签到成功");
            if (isAlreadyDone(msgOf(again))) return this.log(`✅ 今日已签到（${msgOf(again)}）`);
            this.log(`❌ 签到失败: ${msgOf(again)}`);
            return;
        }
        this.log(`❌ 签到失败: ${msgOf(res)}`);
    }

    async run() {
        if (!this.account.openid) {
            this.log("跳过：变量值里没有 openid");
            return;
        }
        try {
            await this.ensureLogin();
            await this.queryUser();
            await this.sign();
            await this.queryUser();
        } catch (e) {
            this.log(`执行失败: ${e.message || e}`);
        }
    }
}

!(async () => {
    $.checkEnv(ckName);
    if (!$.userCount) {
        $.log(`未找到变量 ${ckName}`);
        return;
    }
    for (let i = 0; i < $.userList.length; i++) {
        await new Task($.userList[i]).run();
        if (i < $.userList.length - 1) await $.wait(1500, 3000);
    }
})()
    .catch((e) => $.log(e.message || e))
    .finally(() => $.done());
