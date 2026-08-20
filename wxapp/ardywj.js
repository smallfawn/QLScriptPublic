/*
------------------------------------------
@Description: 爱康(iKang)会员 - 微信小程序静默登录 + 每日签到
cron: 53 8 * * *
------------------------------------------
变量名：ardywj
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx342d760f674b013b，host api.ikbang.cn，前缀 /v2）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

请求签名：每请求带头 token / timestamp / sign
  sign = md5(`${API_BASE}${path}${timestamp}${payload}${APP_KEY}${token||""}`)
  payload：POST=JSON.stringify(params)，GET=排序querystring，无参=""；APP_KEY=A749380BBD5A4D93B55B4BE245A42988（应用固定key）
登录  POST /app/auth/authorization {code, type:"register", acceptCode:""}
        -> code==1，result.token/userId；mobileAuthStatus!=1 或无 token = 未完成手机号授权（未注册）
状态  GET /iclick-new/signIn/getSignInInfo -> result.currentSignIn(true=今日已签)/continuityDay/totalSignInScore
签到  POST /iclick-new/signIn/sign {} -> result=获得积分
响应壳：{code:1, result, description}
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("爱康会员签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "ardywj";
const MINI_APP_ID = "wx342d760f674b013b";
const API_BASE = "https://api.ikbang.cn/v2";
const APP_KEY = "A749380BBD5A4D93B55B4BE245A42988";
const TOKEN_CACHE_FILE = path.join(__dirname, "ardywj_token_cache.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/7.0.20.1781 MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/app/auth/authorization";
const EP_SIGN_INFO = "/iclick-new/signIn/getSignInInfo";
const EP_SIGN = "/iclick-new/signIn/sign";

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
function md5(text) {
    return crypto.createHash("md5").update(String(text)).digest("hex");
}
function stringifyQuery(params) {
    return Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
}
function makeSign(urlPath, method, params, timestamp, token = "") {
    let payload = "";
    if (params) payload = method === "POST" ? JSON.stringify(params) : stringifyQuery(params);
    return md5(`${API_BASE}${urlPath}${timestamp}${payload}${APP_KEY}${token || ""}`);
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
    async apiRequest(method, urlPath, params = null) {
        const timestamp = String(Date.now());
        const sign = makeSign(urlPath, method, params, timestamp, this.token);
        const res = await axios.request({
            method,
            url: `${API_BASE}${urlPath}`,
            data: method === "POST" ? params : undefined,
            params: method === "GET" ? params : undefined,
            timeout: 20000,
            validateStatus: () => true,
            headers: {
                token: this.token,
                sign,
                timestamp,
                "Content-Type": "application/json",
                "User-Agent": USER_AGENT,
                Referer: `https://servicewechat.com/${MINI_APP_ID}/127/page-frame.html`,
            },
        });
        return res.data;
    }
    assertOk(res, action) {
        if (!res || Number(res.code) !== 1) throw new Error(`${action}失败: ${res?.description || res?.msg || short(res)}`);
        return res.result;
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
        const result = this.assertOk(await this.apiRequest("POST", EP_LOGIN, { code, type: "register", acceptCode: "" }), "登录授权");
        if (Number(result.mobileAuthStatus) !== 1 || !result.token) {
            this.unregistered = true;
            throw new Error("NO_AUTH:账号未完成手机号授权");
        }
        this.token = result.token;
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${result.userName ? ` (${result.userName})` : ""}`);
    }
    async getSignInfo() {
        return this.assertOk(await this.apiRequest("GET", EP_SIGN_INFO), "查询签到信息");
    }
    async sign() {
        let before;
        try {
            before = await this.getSignInfo();
        } catch (e) {
            // token 失效则重登一次
            if (/token|登录|未授权|失效|过期/i.test(String(e.message))) {
                this.token = "";
                await this.login();
                before = await this.getSignInfo();
            } else throw e;
        }
        if (before.currentSignIn) {
            return this.log(`✅ 今日已签到，连续 ${before.continuityDay ?? "?"} 天，总签到积分 ${before.totalSignInScore ?? "?"}`);
        }
        const score = this.assertOk(await this.apiRequest("POST", EP_SIGN, {}), "签到");
        const after = await this.getSignInfo().catch(() => ({}));
        this.log(`✅ 签到成功，获得 ${score ?? "?"} 积分，连续 ${after.continuityDay ?? "?"} 天`);
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
            if (String(e.message).startsWith("NO_AUTH")) {
                this.log("⚠️ 该微信号还没在爱康完成手机号授权/注册，先在小程序里登录授权一次再跑");
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
