/*
------------------------------------------
@Description: RIO 微醺俱乐部 - 微信小程序静默登录 + 每日签到
cron: 33 8 * * *
------------------------------------------
变量名：rio
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx225b10f204323da5，host club.rioalc.com，API 前缀 /api/miniprogram）：
（迁移自 YYB-GO 系抓包脚本，原脚本已 code 登录）

登录  POST /api/miniprogram/auth  JSON {code:<wx code>, redirect_path:"/pages/welcome/loading-page?..."}
        -> code==200，data.api_token（+ nick_name/phone/points）；未注册回 code!=200（如 5001）
签到  POST /api/miniprogram/user-sign-click  JSON {}   头 Authorization: Bearer <api_token>
        -> code==200 "签到成功"
实测：号1 登录成功(初饮萌新)→签到成功；号2 未注册(5001)。
不做：任务列表/发帖等。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("RIO微醺俱乐部");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "rio";
const MINI_APP_ID = "wx225b10f204323da5";
const API_BASE = "https://club.rioalc.com/api/miniprogram";
const REDIRECT = "/pages/welcome/loading-page?nocheck=&type_lk=3&path=%2Fpages%2Findex%2Findex";
const TOKEN_CACHE_FILE = path.join(__dirname, "rio_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 " +
    "Chrome/134.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x28003036) MiniProgramEnv/android";

const EP_LOGIN = "/auth";
const EP_SIGN = "/user-sign-click";

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

const isOk = (res) => Number(res?.code) === 200;
const msgOf = (res) => res?.message || res?.msg || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isAuthError = (res) => Number(res?.code) === 401 || /登录|token|未授权|失效|过期/i.test(msgOf(res));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    async request(apiPath, body) {
        const headers = {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/json",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/0/page-frame.html`,
        };
        if (this.token) headers.Authorization = `Bearer ${this.token}`;
        const res = await axios.request({
            method: "POST", url: `${API_BASE}${apiPath}`, data: body || {},
            headers, timeout: 20000, validateStatus: () => true,
        });
        if (res.status !== 200) {
            if (res.data && typeof res.data === "object") return res.data;
            throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        }
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
        const res = await this.request(EP_LOGIN, { code, redirect_path: REDIRECT });
        const d = res.data || {};
        this.token = String(d.api_token || "");
        if (!isOk(res) || !this.token) {
            // code!=200 / 无 api_token = 未注册会员
            this.unregistered = true;
            throw new Error(`NO_TOKEN:${msgOf(res)}`);
        }
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${d.nick_name ? `: ${d.nick_name}` : ""}${d.points !== undefined ? `，积分 ${d.points}` : ""}`);
    }
    async sign(retry = true) {
        const res = await this.request(EP_SIGN, {});
        if (isOk(res)) return this.log(`✅ 签到成功${res.message ? `：${res.message}` : ""}`);
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        if (retry && isAuthError(res)) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            try { await this.login(); } catch (e) { if (String(e.message).startsWith("NO_TOKEN")) { this.log(`⚠️ 未注册会员: ${e.message.slice(8)}`); return; } throw e; }
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msgOf(res)}`);
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
            if (String(e.message).startsWith("NO_TOKEN")) {
                this.log(`⚠️ 该微信号还没在 RIO 俱乐部注册会员（登录 ${e.message.slice(8)}），先在小程序里注册一次再跑`);
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
