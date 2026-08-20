/*
------------------------------------------
@Description: 得物(Dewu/Poizon) 种树 - 微信小程序静默登录 + 每日签到
cron: 30 8 * * *
------------------------------------------
变量名：dw
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx3c12cdd0ae8b1a7b，host app.dewu.com）：
（迁移自 YYB-GO 得物种树脚本，原脚本已 code 登录）

两套签名/两处放置（关键差异）：
  登录签名 loginSign：对 body 排序键拼接 key+fmt(v)（bool→true/false，null 跳过），
                      末尾追加 SW_APP_SIGN_SECRET 后 MD5；sign 放在【body】里。
  业务签名 bizSign  ：对参数排序键拼接 key+str(v)（null→""），末尾追加 SIGN_SECRET
                      后 MD5；sign 放在【query ?sign=】里。POST 签 body，GET 签 query。
                      空 body/空 query 时 sign = MD5(SIGN_SECRET)。

登录  POST /api/v1/h5/user_core/mapi/users/wechat/login
        body={type:"wxapp",code,deviceId,newFlow:true,hitGray:true,bizType:""}+sign(loginSign)
        头带 SK/ltk/AppId:wxapp/xsn 等固定应用常量，不带 token
        -> resp.header['x-auth-token']（去 "Bearer "）= 后续 x-auth-token 头
           && body.code==200，body.data.loginInfo.loginToken = duToken/cookieToken
状态  GET  /hacking-tree/v1/sign/list      -> data.list 里 day==currentDay && IsSignIn ⇒ 今日已签
签到  POST /hacking-tree/v1/sign/sign_in {}
        -> HTTP200 && body.code==200 ⇒ 成功(data.Num=获得水滴)；body.code==711110001 ⇒ 今日已签
鉴权失效：body.code==11001 / msg含"校验失败" / code==700 / msg含"未登录/请先登录" ⇒ 重登重试
风控：body.code==485 且 data.sessionId / msg含"请校验验证码" ⇒ 命中滑块(当前 IP 被得物风控，
      非脚本 bug，需 App 内手动签到或换网络重跑)。403/404/485「网络拥堵/前方拥挤」为瞬时限流，退避重试。
SIGN_SECRET / SW_APP_SIGN_SECRET / SW_APP_SK / SW_APP_LTK / AUTH_SK / device_model 均为该
小程序固定应用常量（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("得物种树签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "dw";
const MINI_APP_ID = "wx3c12cdd0ae8b1a7b";
const BASE = "https://app.dewu.com";

// 业务签名密钥（种树 hacking-tree 接口）
const SIGN_SECRET = "048a9c4943398714b356a696503d2d36";
// 小程序登录签名密钥
const SW_APP_SIGN_SECRET = "19bc545a393a25177083d4a748807cc0";
const LOGIN_PATH = "/api/v1/h5/user_core/mapi/users/wechat/login";
// 登录专用固定头（应用常量）
const SW_APP_SK = "9U7MQhgnG8oZXxFz88rUDzxlHf8BQe4pNv5y7wMGKqoChmYNNPA4D56K2C4i066BtQ6yv8CKBW8vbXCdLdDH8MnN271p";
const SW_APP_LTK = "eMKkwoHDnMOrCMKcw6PDsMKRP8KUworCgsOue8OmwpbCkcKnNTjCk3fDk8OrLcOKa1TCnHrDjVDCh8Ogw7s9cMOLcCjCoMOyw5I=";
const SW_APP_XSN = "eef229c26f5fa8169ed16f4f66c360d3";
// 业务头固定应用常量
const AUTH_SK = "9U0cRrTwOLG5X6xThcbMQQUWKTkAjqOvr3CEVpaSot2bnNdNBTRzNio1SDIt5Dr5Pt3Ogq91fX6rrGJuhEW12WnBJ51u";
const DEVICE_MODEL = "2512BPNDAC";

const EP_SIGN_LIST = "/hacking-tree/v1/sign/list";
const EP_SIGN_IN = "/hacking-tree/v1/sign/sign_in";

const TOKEN_CACHE_FILE = path.join(__dirname, "dw_token_cache.json");
const LOGIN_UA =
    "Mozilla/5.0 (Linux; Android 16; 2308CPXD0C Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Version/4.0 Chrome/146.0.7680.178 Mobile Safari/537.36 XWEB/1460249 " +
    "MMWEBSDK/20260202 MMWEBID/6435 MicroMessenger/8.0.70.3060(0x28004652) WeChat/arm64 Weixin " +
    "NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android";
const BIZ_UA =
    "Mozilla/5.0 (Linux; U; Android 14; zh-CN; " + DEVICE_MODEL + " Build/UKQ1.230917.001) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/100.0.4896.58 UWS/5.18.11.0 " +
    "Mobile Safari/537.36/duapp/5.91.5(android;14)";

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
function md5(str) {
    return crypto.createHash("md5").update(String(str), "utf8").digest("hex");
}
function uuid4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
}

// 登录签名：排序键拼接 key+fmt(v)（bool→true/false，null/undefined 跳过），末尾追加密钥后 MD5。
function loginSign(params, secret) {
    const fmt = (v) => {
        if (v === null || v === undefined) return "";
        if (typeof v === "boolean") return v ? "true" : "false";
        if (typeof v === "object") return JSON.stringify(v);
        return String(v);
    };
    let text = "";
    for (const k of Object.keys(params).sort()) {
        if (params[k] === null || params[k] === undefined) continue;
        text += k + fmt(params[k]);
    }
    return md5(text + secret);
}

// 业务签名：排序键拼接 key+str(v)（null→""），末尾追加密钥后 MD5。空对象 => MD5(SIGN_SECRET)。
function bizSign(params) {
    const p = params || {};
    let raw = "";
    for (const k of Object.keys(p).sort()) {
        const v = p[k];
        raw += k + (v === null || v === undefined ? "" : String(v));
    }
    return md5(raw + SIGN_SECRET);
}

function isAuthErr(data) {
    if (!data || typeof data !== "object") return false;
    const code = Number(data.code);
    const msg = String(data.msg || data.message || "");
    if (code === 11001 || code === 700) return true;
    return /校验失败|未登录|请先登录|token失效|会话/i.test(msg);
}
// 真正的滑块人机验证（需 App 内手动过），命中即视为当前 IP 被风控。
function isHardCaptcha(data) {
    if (!data || typeof data !== "object") return false;
    if (Number(data.code) === 485 && data.data && data.data.sessionId) return true;
    return /请校验验证码/.test(String(data.msg || ""));
}
const TRANSIENT_CODES = new Set([403, 404, 485]);

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.xAuthToken = "";
        this.loginToken = "";
        this.captcha = false;
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
        const body = { type: "wxapp", code, deviceId: uuid4(), newFlow: true, hitGray: true, bizType: "" };
        body.sign = loginSign(body, SW_APP_SIGN_SECRET);
        const headers = {
            Host: "app.dewu.com",
            Connection: "keep-alive",
            appVersion: "4.4.0",
            "content-type": "application/json",
            SK: SW_APP_SK,
            ltk: SW_APP_LTK,
            skt: "xdr1",
            miniappversion: "5.96.1",
            "Wxapp-Login-Token": "",
            AppId: "wxapp",
            "wxapp-route-id": "undefined",
            platform: "h5",
            xsn: SW_APP_XSN,
            charset: "utf-8",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/586/page-frame.html`,
            "User-Agent": LOGIN_UA,
        };
        const res = await axios.request({
            method: "POST", url: BASE + LOGIN_PATH, data: body, headers,
            timeout: 20000, validateStatus: () => true,
        });
        let xAuth = String(res.headers["x-auth-token"] || res.headers["X-Auth-Token"] || "").replace("Bearer ", "").trim();
        const data = res.data || {};
        let loginToken = "";
        if (Number(data.code) === 200) {
            loginToken = ((data.data || {}).loginInfo || {}).loginToken || "";
        }
        if (!xAuth || !loginToken) {
            const msg = data.msg || data.message || short(data);
            // 未绑定手机号/未注册的优雅提示：实测该微信号未绑手机 -> code=745 "请先绑定手机号"，
            // 此时登录不返回 token（并非脚本错误，需先在得物 App/小程序里绑定手机号登录一次）。
            if (Number(data.code) === 745 || /注册|未激活|绑定|授权|手机号/.test(String(msg))) {
                this.unregistered = true;
                throw new Error(`NO_ACCOUNT:${msg}`);
            }
            throw new Error(`登录失败(code=${data.code} 无token): ${msg}`);
        }
        this.xAuthToken = xAuth;
        this.loginToken = String(loginToken);
        const cache = readCache();
        cache[this.account.openid] = { xAuthToken: this.xAuthToken, loginToken: this.loginToken, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    bizHeaders() {
        return {
            "x-auth-token": this.xAuthToken,
            duToken: this.loginToken,
            cookieToken: this.loginToken,
            device_model: DEVICE_MODEL,
            deviceTrait: DEVICE_MODEL,
            SK: AUTH_SK,
            ua: "duapp/5.91.5(android;14)",
            appid: "h5",
            networktype: "wifi",
            channel: "du",
            appVersion: "5.91.5",
            emu: "0",
            countryCode: "CN",
            isRoot: "0",
            imei: "",
            platform: "h5",
            isProxy: "0",
            Origin: "https://cdn-m.dewu.com",
            "X-Requested-With": "com.shizhuang.duapp",
            Referer: "https://cdn-m.dewu.com/",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            Accept: "*/*",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            Cookie: `duToken=${this.loginToken}`,
            "User-Agent": BIZ_UA,
        };
    }
    // GET：sign 源=query 参数（此处均为空），sign 放到 query。
    async bizGet(apiPath, params = {}) {
        const query = { ...params, sign: bizSign(params) };
        const res = await axios.request({
            method: "GET", url: BASE + apiPath, params: query, headers: this.bizHeaders(),
            timeout: 20000, validateStatus: () => true,
        });
        return { status: res.status, data: res.data || {} };
    }
    // POST：sign 源=body，sign 放到 query。带瞬时反爬(403/404/485)退避重试。
    async bizPost(apiPath, body = {}, extraHeaders = {}) {
        const query = { sign: bizSign(body) };
        const headers = { ...this.bizHeaders(), ...extraHeaders };
        let last = { status: 0, data: {} };
        const retries = 3;
        for (let attempt = 0; attempt <= retries; attempt++) {
            if (attempt > 0) {
                const wait = Math.round((Math.pow(2, attempt - 1) * 6 + Math.random() * 3) * 1000);
                this.log(`  [重试 ${attempt}/${retries}] ${(wait / 1000).toFixed(1)}s 后重发 ${apiPath}`);
                await new Promise((r) => setTimeout(r, wait));
            }
            const res = await axios.request({
                method: "POST", url: BASE + apiPath, params: query, data: body, headers,
                timeout: 20000, validateStatus: () => true,
            });
            last = { status: res.status, data: res.data || {} };
            if (isHardCaptcha(last.data)) return last; // 滑块不重试
            if (TRANSIENT_CODES.has(res.status)) continue;
            const biz = Number(last.data && last.data.code);
            if (TRANSIENT_CODES.has(biz)) continue;
            return last;
        }
        return last;
    }
    async checkSignedToday() {
        const { data } = await this.bizGet(EP_SIGN_LIST);
        if (isAuthErr(data)) return { auth: true };
        try {
            const d = data.data || {};
            for (const item of d.list || []) {
                if (item.day === d.currentDay && item.IsSignIn) return { signed: true };
            }
        } catch (e) {}
        return { signed: false, ok: Number(data.code) === 200 };
    }
    async sign(retry = true) {
        // 1) 先查签到列表，若今日已签直接返回
        const chk = await this.checkSignedToday();
        if (chk.auth) {
            if (retry) { this.log("会话失效，重新登录后重试"); this.xAuthToken = ""; this.loginToken = ""; await this.login(); return this.sign(false); }
            return this.log("❌ 鉴权失效，重登后仍失败");
        }
        if (chk.signed) return this.log("✅ 今日已签到");
        // 2) 执行签到
        const { status, data } = await this.bizPost(EP_SIGN_IN, {});
        if (isHardCaptcha(data)) {
            this.captcha = true;
            return this.log(`🚫 触发滑块验证码，当前 IP 被得物风控，请在 App 内手动签到或换网络重跑（非脚本错误）: ${short(data.msg)}`);
        }
        if (Number(data.code) === 711110001) return this.log("✅ 今日已签到（服务端确认）");
        if (status === 200 && Number(data.code) === 200) {
            const num = (data.data || {}).Num;
            return this.log(`✅ 签到成功${num !== undefined ? `，获得水滴 ${num}` : ""}`);
        }
        const msg = data.msg || data.message || short(data);
        if (/已签|签到过|重复|已完成/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && isAuthErr(data)) {
            this.log("会话失效，重新登录后重试");
            this.xAuthToken = ""; this.loginToken = "";
            await this.login();
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msg} (code=${data.code})`);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.xAuthToken && cached.xAuthToken && cached.loginToken) {
            this.xAuthToken = cached.xAuthToken;
            this.loginToken = cached.loginToken;
            this.log("使用缓存token");
            return;
        }
        if (!this.xAuthToken) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号未在得物绑定手机号/注册（${String(e.message).replace(/^NO_ACCOUNT:/, "")}），先在得物小程序里登录并绑定手机号一次再跑`);
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
