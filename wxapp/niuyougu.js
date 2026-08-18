/*
------------------------------------------
@Description: 牛油谷 - 微信小程序静默登录 + 每日签到
cron: 24 8 * * *
------------------------------------------
变量名：niuyougu
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxfa2a1ee65e3c9122，host app.niuyougu.com.cn）：
  登录  POST /api/user/wxlogin   form: token=&code=<code>&channelId=0
        -> code==0, data.token / data.nickname
  签到  POST /api/user/sign      form: token=<token>&eid=1&_t=<毫秒>
        -> code==0 成功；code==-2 今日已签到（这是成功语义，不是失败）
  资料  POST /api/user/getUserInfo  form: token=<token>
注意 token 是放在 body 里的，不是请求头。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("牛油谷");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "niuyougu";
const MINI_APP_ID = "wxfa2a1ee65e3c9122";
const BASE = "https://app.niuyougu.com.cn";
const TOKEN_CACHE_FILE = path.join(__dirname, "niuyougu_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x28003036) MiniProgramEnv/android";

const EP_LOGIN = "/api/user/wxlogin";
const EP_SIGN = "/api/user/sign";
const EP_USER = "/api/user/getUserInfo";
const CODE_ALREADY_SIGNED = -2;

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

function form(obj) {
    return Object.entries(obj)
        .map(([k, v]) => `${k}=${encodeURIComponent(v === undefined || v === null ? "" : v)}`)
        .join("&");
}

const isOk = (res) => Number(res?.code) === 0;
const msgOf = (res) => res?.msg || res?.message || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|already/i.test(String(t || ""));
const isAuthError = (t) => /登录|token|未授权|失效|过期|重新/i.test(String(t || ""));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.nickname = "";
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    async request(apiPath, body = {}) {
        const res = await axios.request({
            method: "POST",
            url: `${BASE}${apiPath}`,
            data: form(body),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": USER_AGENT,
                Referer: `https://servicewechat.com/${MINI_APP_ID}/0/page-frame.html`,
            },
            timeout: 20000,
            validateStatus: () => true,
        });
        if (res.status !== 200) throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        return res.data;
    }

    /** wcs.getCode 在 status:false 时也 resolve，必须自己判失败，否则取码限流会被误报成登录失败 */
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
        const res = await this.request(EP_LOGIN, { token: "", code, channelId: 0 });
        if (!isOk(res)) throw new Error(`登录失败: ${msgOf(res)}`);
        const d = res.data || {};
        this.token = d.token || "";
        this.nickname = d.nickname || "";
        if (!this.token) throw new Error(`登录未返回 token: ${short(res)}`);
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, nickname: this.nickname, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${this.nickname ? `: ${this.nickname}` : ""}`);
    }

    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            this.nickname = cached.nickname || "";
            if (await this.queryUser(false)) {
                this.log("使用缓存token");
                return;
            }
            this.log("缓存token失效，重新登录");
            this.token = "";
        }
        if (!this.token) await this.login();
    }

    async queryUser(needLog = true) {
        const res = await this.request(EP_USER, { token: this.token });
        if (!isOk(res)) {
            if (needLog) this.log(`读取资料失败: ${msgOf(res)}`);
            return false;
        }
        const d = res.data || {};
        this.nickname = d.nickname || this.nickname;
        if (needLog) {
            const bits = [];
            if (d.nickname) bits.push(d.nickname);
            for (const k of ["integral", "points", "score", "balance", "coin"]) {
                if (d[k] !== undefined) bits.push(`${k}=${d[k]}`);
            }
            this.log(`会员: ${bits.join(" ") || short(d, 120)}`);
        }
        return true;
    }

    async sign(retry = true) {
        const res = await this.request(EP_SIGN, { token: this.token, eid: 1, _t: Date.now() });
        if (isOk(res)) return this.log("✅ 签到成功");
        if (Number(res?.code) === CODE_ALREADY_SIGNED || isAlreadyDone(msgOf(res))) {
            return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        }
        if (retry && isAuthError(msgOf(res))) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            return this.sign(false);
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
