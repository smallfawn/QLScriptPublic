/*
------------------------------------------
@Description: 安吉尔(净水器)会员 - 微信小程序静默登录 + 每月签到
cron: 25 8 * * *
------------------------------------------
变量名：ajier
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx c4a1f99a6c90c1a4，host userone.angelgroup.com.cn）：
（迁移自 YYB-GO 系抓包脚本，原脚本已 code 登录）

登录  POST /api/member/app/wxLogin   JSON {sourceType:1, code:<wx code>}
        头 behavior:"{}" / merchantId:"10000" / content-type json
        -> code==200，data.token + data.buyerUserId
签到  POST /api/member/marketSign/signTable  JSON {checkInDateStart, checkInDateEnd, month, userId}
        头 Authorization: Bearer <token> + 同上固定头；成功码 200
        （signTable 传当月起止 + userId，服务端据此记签到；日期格式 YYYY-MM-DD HH:mm:ss）
积分  POST /api/member/v1/user/queryInfo（可选，未强用）
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("安吉尔会员");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "ajier";
const MINI_APP_ID = "wxc4a1f99a6c90c1a4";
const BASE = "https://userone.angelgroup.com.cn";
const TOKEN_CACHE_FILE = path.join(__dirname, "ajier_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/134.0.0.0 " +
    "Mobile Safari/537.36 MicroMessenger/8.0.76.3141(0x28004C3C) MiniProgramEnv/android";

const EP_LOGIN = "/api/member/app/wxLogin";
const EP_SIGN = "/api/member/marketSign/signTable";

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

function pad(n) {
    return n < 10 ? "0" + n : "" + n;
}

/** 当月起止（本地时间），格式 YYYY-MM-DD HH:mm:ss */
function monthRange() {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const last = new Date(y, m, 0).getDate();
    return {
        start: `${y}-${pad(m)}-01 00:00:00`,
        end: `${y}-${pad(m)}-${pad(last)} 23:59:59`,
        month: m,
    };
}

const isOk = (res) => Number(res?.code) === 200 || res?.success === true;
const msgOf = (res) => res?.message || res?.msg || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isAuthError = (res) => /登录|token|未授权|失效|过期|401|未登录/i.test(msgOf(res)) || Number(res?.code) === 401;

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.userId = "";
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    baseHeaders(extra = {}) {
        return {
            behavior: "{}",
            merchantId: "10000",
            "content-type": "application/json",
            charset: "utf-8",
            Accept: "*/*",
            "User-Agent": USER_AGENT,
            Referer: `https://servicewechat.com/${MINI_APP_ID}/76/page-frame.html`,
            ...extra,
        };
    }

    async request(apiPath, body, withAuth = false) {
        const headers = this.baseHeaders(withAuth && this.token ? { Authorization: `Bearer ${this.token}` } : {});
        const res = await axios.request({
            method: "POST",
            url: `${BASE}${apiPath}`,
            data: body || {},
            headers,
            timeout: 20000,
            validateStatus: () => true,
        });
        if (res.status !== 200) {
            if (res.data && typeof res.data === "object") return res.data;
            throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        }
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
        const res = await this.request(EP_LOGIN, { sourceType: 1, code });
        if (!isOk(res)) throw new Error(`登录失败: ${msgOf(res)}`);
        const d = res.data || {};
        this.token = String(d.token || "");
        this.userId = String(d.buyerUserId || d.userId || "");
        if (!this.token) throw new Error(`登录未返回 token: ${short(res)}`);
        // 有 token 但无 buyerUserId（phone 也为 null）= 该微信号未注册会员，签不了
        this.unregistered = !this.userId;
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, userId: this.userId, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${this.unregistered ? "（该微信号未注册会员）" : ""}`);
    }

    async sign(retry = true) {
        const r = monthRange();
        const res = await this.request(EP_SIGN, {
            checkInDateStart: r.start,
            checkInDateEnd: r.end,
            month: r.month,
            userId: this.userId,
        }, true);
        if (isOk(res)) return this.log(`✅ 签到成功${res.message ? `：${res.message}` : ""}`);
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        if (retry && isAuthError(res)) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msgOf(res)}`);
    }

    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token && cached.userId) {
            this.token = cached.token;
            this.userId = cached.userId;
            this.log("使用缓存token");
            return;
        }
        if (!this.token) await this.login();
    }

    async run() {
        if (!this.account.openid) {
            this.log("跳过：变量值里没有 openid");
            return;
        }
        try {
            await this.ensureLogin();
            if (this.unregistered) {
                this.log("⚠️ 该微信号还没在安吉尔注册会员（登录只发到 token、无 userId），先在小程序里注册一次再跑");
                return;
            }
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
