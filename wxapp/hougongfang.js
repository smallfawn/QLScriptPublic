/*
------------------------------------------
@Description: 厚工坊 - 微信小程序静默登录 + 每日签到
cron: 40 8 * * *
------------------------------------------
变量名：hougongfang
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx5dd1e38d5312e70b，host api.hgf1862.com）：
  登录  GET  /YUN/api/onLogin.aspx?opt=onLogin&code=<code>
          -> status==1，取 SessionID；之后带请求头 sessionid: <SessionID>
  签到  POST /YUN/Game/2021/QianDao/QianDaoAjax_By28.aspx?op=now&vers=<YYYYMMDD>
          （参数只在查询串上，body 为空）-> status==1
  这个后端的成功码是 status==1，提示在 msg
  签到那个接口是按 Cookie 校验会话的（user=SessionID=<id>），只给请求头不够
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("厚工坊");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "hougongfang";
const MINI_APP_ID = "wx5dd1e38d5312e70b";
const BASE = "https://api.hgf1862.com";

const TOKEN_CACHE_FILE = path.join(__dirname, "hougongfang_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x28003036) MiniProgramEnv/android";

const EP_LOGIN = "/YUN/api/onLogin.aspx";
const EP_SIGN = "/YUN/Game/2021/QianDao/QianDaoAjax_By28.aspx";
const EP_USER = null;

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

/** 该后端的成功判定 */
const isOk = (res) => Number(res?.status) === 1;
const msgOf = (res) => res?.msg || res?.message || res?.msg || short(res);
/** 每天跑一次，「已签到」必须当成成功而不是失败 */
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isAuthError = (t) => /登录|token|未授权|未登录|失效|过期|重新|401/i.test(String(t || ""));
/** 账号态：这个微信号还没在该平台注册/绑定 —— 不是脚本缺陷，别打 ❌ */
const isNotRegistered = (t) => /未注册|未绑定|请先注册|请先绑定|not regist/i.test(String(t || ""));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.signedToday = false;
        // 设备号按 openid 稳定派生：同一账号每次跑都一样，避免被当成新设备
        this.deviceId = "d_" + require("crypto").createHash("md5")
            .update(String(this.account.openid || raw)).digest("hex").slice(0, 16);
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    async request(apiPath, body = null, withAuth = true, method = "POST", query = null, epHeaders = null) {
        const isForm = false;
        const headers = {
            "Content-Type": isForm ? "application/x-www-form-urlencoded" : "application/json",
            "User-Agent": USER_AGENT,
            Referer: `https://servicewechat.com/${MINI_APP_ID}/0/page-frame.html`,
            Accept: "application/json, text/plain, */*",
            xweb_xhr: "1",
            ...(epHeaders || {}),
        };
        if (withAuth && this.token) headers["sessionid"] = this.token;        if (withAuth && this.token) headers["Cookie"] = `user=SessionID=${this.token}`;

        const payload = body || {};

        const isGet = String(method).toUpperCase() === "GET";
        // query 独立于 body：有些接口是 POST 但参数只在查询串上
        const qs = query ? form(query) : (isGet && Object.keys(payload).length ? form(payload) : "");
        const res = await axios.request({
            method: isGet ? "GET" : "POST",
            url: `${BASE}${apiPath}${qs ? `?${qs}` : ""}`,
            data: isGet ? undefined : (isForm ? form(payload) : payload),
            headers,
            timeout: 20000,
            validateStatus: () => true,
        });
        if (res.status < 200 || res.status >= 300) {
            // 业务结论常常躺在 4xx/5xx 的 JSON 体里（"今日已签到" 见过 400 也见过 500），
            // 有 JSON 体就交给下游按业务码判，别在这一层抛掉
            if (res.data && typeof res.data === "object") return res.data;
            throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        }
        return res.data;
    }

    /**
     * wcs.getCode 在 status:false 时也会 resolve，必须自己判失败，
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
        const res = await this.request(EP_LOGIN, {}, false, "GET", { opt: "onLogin", code }, null);
        if (!isOk(res)) throw new Error(`登录失败: ${msgOf(res)}`);
        this.token = (res.SessionID || res.sessionID || (res.data || {}).SessionID) || "";

        if (!this.token) throw new Error(`登录未返回 token: ${short(res)}`);
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }

    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
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
        if (!EP_USER) return true;
        const res = await this.request(EP_USER, {}, true, "POST", null, null);
        if (!isOk(res)) {
            if (needLog) this.log(`读取资料失败: ${msgOf(res)}`);
            return false;
        }
        // 有的家没有 data/body 包装，响应体本身就是数据（zippo 的 profile 就是）
        const d = res.data || res.datas || res.body || res || {};
        if (needLog) {
            const bits = [];
            for (const k of ["nickname", "nickName", "name", "memberId", "integral", "points",
                             "point", "score", "credits", "balance", "coin", "amount"]) {
                if (d && d[k] !== undefined && d[k] !== null && d[k] !== "") bits.push(`${k}=${d[k]}`);
            }
            this.log(`会员: ${bits.join(" ") || short(d, 120)}`);
        }
        return true;
    }

    async sign(retry = true) {
        const res = await this.request(EP_SIGN, {}, true, "POST", { op: "now", vers: new Date().toISOString().slice(0,10).replace(/-/g, "") }, null);
        if (isOk(res)) return this.log("✅ 签到成功");
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        if (isNotRegistered(msgOf(res))) {
            return this.log(`⚠️ ${msgOf(res)} —— 该微信号还没在该平台注册会员，先在小程序里注册一次再跑`);
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
