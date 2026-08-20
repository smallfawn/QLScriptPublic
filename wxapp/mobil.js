/*
------------------------------------------
@Description: 美孚臻享俱乐部 - 微信小程序静默登录 + 每日签到
cron: 33 8 * * *
------------------------------------------
变量名：mobil
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx46f9572cac706c22，host www.rewards.mobil.com.cn，SHOPWIND/Yii2 框架）：
（迁移自 YYB-GO 系脚本 美孚.js，原脚本已 code 登录，无签名，token 放头）

所有请求走 /web/index.php?_mall_id=1&r=<route>；token 放 X-Access-Token 头，会话 cookie 随任务保持。
登录  POST r=api/passport/login   form{code}   -> code==0，data.access_token(=token)、data.ulp_user_id
会员  GET  r=api/kc/user/user-info               -> code==0，data.ulp_user_id / data.ulp_user_info(会员态)
任务  GET  r=api/kc/user/user-task               -> data.data.need_improve_user_info(1=需完善信息=未注册会员)
状态  GET  r=api/kc/user/user-sign-info          -> code==0，data.now_date_is_sign(今日是否已签)
签到  POST r=api/kc/user/sign-in   form(空)      -> code==0 && data.now_date_is_sign
成功码 code==0。
  -1 或 msg 含 登录失效/未登录 = mall token 失效(重登重试一次)。
  -9  且 msg 含 "ulp:请先登录"  = 会员积分平台(ulp/mefoto) 未登录/未注册 —— 该微信号在商城已登录，但
      尚未在美孚会员体系注册(ulp_user_id=0 / need_improve_user_info=1)，签到需先在小程序内完善会员信息。
      按技能规则优雅报 ⚠️(不代注册、不崩溃)。
  -11 或 msg 含 风险识别/验证码 = 风控图形验证码(按技能规则不绕过，如实报告)。
MALL_ID / APP_VERSION 是应用级常量（原脚本硬编码，非个人凭证）；不发送 X-User-Id。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("美孚臻享俱乐部签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "mobil";
const MINI_APP_ID = "wx46f9572cac706c22";
const BASE_URL = "https://www.rewards.mobil.com.cn";
const MALL_ID = "1";
const APP_VERSION = "4.8.9";
const PAGE_VERSION = "120";
const TOKEN_CACHE_FILE = path.join(__dirname, "mobil_token_cache.json");
const WX_UA =
    "Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.122 " +
    "Mobile Safari/537.36 XWEB/1260059 MMWEBSDK/20240501 MMWEBID/3628 " +
    "MicroMessenger/8.0.50.2701(0x28003252) WeChat/arm64 Weixin NetType/WIFI " +
    "Language/zh_CN ABI/arm64 MiniProgramEnv/android";

const COMMON_HEADERS = {
    Host: "www.rewards.mobil.com.cn",
    Connection: "keep-alive",
    Accept: "application/json, text/plain, */*",
    charset: "utf-8",
    "User-Agent": WX_UA,
    "X-Form-Id-List": "[]",
    "X-App-Platform": "wxapp",
    "X-Requested-With": "XMLHttpRequest",
    "X-channel": "WXapp",
    "X-App-Version": APP_VERSION,
    Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
};

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
function toObj(v) {
    if (v && typeof v === "object") return v;
    if (typeof v === "string") { try { return JSON.parse(v); } catch (e) { return { _raw: v }; } }
    return {};
}
function msgOf(r) {
    if (!r || typeof r !== "object") return "";
    return String(r.msg || r.message || r.error || r.errmsg || r._raw || "");
}
function getByPath(src, keys) {
    let cur = src;
    for (const k of keys) { if (!cur || typeof cur !== "object" || !(k in cur)) return undefined; cur = cur[k]; }
    return cur;
}
function extractToken(res) {
    const paths = [
        ["data", "access_token"], ["data", "accessToken"], ["data", "token"],
        ["data", "user", "access_token"], ["data", "user", "accessToken"], ["data", "user", "token"],
        ["data", "user_info", "access_token"], ["data", "user_info", "accessToken"], ["data", "user_info", "token"],
        ["access_token"], ["accessToken"], ["token"],
    ];
    for (const p of paths) { const v = getByPath(res, p); if (typeof v === "string" && v.trim()) return v.trim(); }
    return "";
}
// -9 ulp:请先登录 = 会员积分平台(ulp/mefoto)未登录/未注册，不是 mall token 失效
function isUlpUnregistered(r) {
    const msg = msgOf(r);
    if (Number(r && r.code) === -9 && /ulp/i.test(msg)) return true;
    return /ulp[:：]\s*请先登录/i.test(msg);
}
// mall 层 token 失效（排除 ulp 会员态误伤）
function isLoginExpired(r) {
    if (!r) return false;
    const msg = msgOf(r);
    if (/ulp/i.test(msg)) return false;
    if (Number(r.code) === -1) return true;
    return /登录失效|未登录|token\s*(失效|过期|无效)|invalid.*token|请重新登录/i.test(msg);
}
function needsCaptcha(r) {
    if (!r) return false;
    if (Number(r.code) === -11) return true;
    return /风险识别|验证码|校验码|滑块/.test(msgOf(r));
}
// user-info(data.ulp_user_id / ulp_user_info) 判定会员是否已建立
function hasUlpMember(userInfo) {
    const d = (userInfo && userInfo.data) || {};
    if (Number(d.ulp_user_id) > 0) return true;
    if (Array.isArray(d.ulp_user_info)) return d.ulp_user_info.length > 0;
    return !!d.ulp_user_info;
}

const UNREG_MSG =
    "⚠️ 该微信号已完成商城登录，但尚未在美孚臻享俱乐部注册会员（ulp_user_id=0 / need_improve_user_info=1，" +
    "服务端返回 -9 ulp:请先登录）。签到需先在小程序内完善会员信息/绑定手机号注册后再跑。";

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.cookieJar = {};
        this.justLoggedIn = false;
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    cookieString() {
        return Object.entries(this.cookieJar)
            .filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== "deleted")
            .map(([k, v]) => `${k}=${v}`).join("; ");
    }
    updateCookie(setCookie) {
        if (!setCookie) return;
        const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
        for (const item of arr) {
            const pair = String(item).split(";")[0];
            const i = pair.indexOf("=");
            if (i <= 0) continue;
            const k = pair.slice(0, i).trim();
            const v = pair.slice(i + 1).trim();
            if (k) this.cookieJar[k] = v;
        }
    }
    async request(route, { method = "GET", body, contentType = "form", query, useToken = true } = {}) {
        const url = new URL("/web/index.php", BASE_URL);
        url.searchParams.set("_mall_id", MALL_ID);
        url.searchParams.set("r", route);
        for (const [k, v] of Object.entries(query || {})) {
            if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
        }
        const headers = { ...COMMON_HEADERS };
        if (useToken && this.token) headers["X-Access-Token"] = this.token;
        const ck = this.cookieString();
        if (ck) headers.Cookie = ck;

        let data = body;
        if (body !== undefined) {
            if (contentType === "json") {
                headers["Content-Type"] = "application/json";
                data = typeof body === "string" ? body : JSON.stringify(body);
            } else {
                headers["Content-Type"] = "application/x-www-form-urlencoded";
                data = typeof body === "string" ? body : new URLSearchParams(body).toString();
            }
        }
        const res = await axios.request({
            method: method || (body === undefined ? "GET" : "POST"),
            url: url.toString(),
            data,
            headers,
            timeout: 20000,
            maxRedirects: 5,
            validateStatus: () => true,
        });
        this.updateCookie(res.headers && res.headers["set-cookie"]);
        const obj = toObj(res.data);
        if (res.status < 200 || res.status >= 300) {
            // 业务结论有时躺在 4xx/5xx 的 JSON 体里；有 code/msg 就交给业务判定
            if (obj && (("code" in obj) || ("msg" in obj) || ("message" in obj))) return obj;
            throw new Error(`${route} HTTP ${res.status}: ${short(res.data)}`);
        }
        return obj;
    }
    async safeRequest(route, opts) {
        try { return await this.request(route, opts); } catch (e) { return { code: 500, msg: e.message || String(e) }; }
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
        this.token = "";
        const res = await this.request("api/passport/login", { method: "POST", body: { code }, useToken: false });
        if (Number(res.code) !== 0) throw new Error(`业务登录失败: ${msgOf(res) || short(res)}`);
        const token = extractToken(res);
        if (!token) throw new Error(`登录未返回 token: ${short(res)}`);
        this.token = token;
        this.ulpUserId = Number(getByPath(res, ["data", "ulp_user_id"]) || 0);
        this.justLoggedIn = true;
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, cookieJar: this.cookieJar, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    async ensureLogin() {
        if (this.token) return;
        const cached = readCache()[this.account.openid] || {};
        if (cached.token) {
            this.token = cached.token;
            if (cached.cookieJar && typeof cached.cookieJar === "object") this.cookieJar = { ...cached.cookieJar };
            this.log("使用缓存token");
            return;
        }
        await this.login();
    }
    // 只读预检：返回 unregistered / signed / unsigned / expired / unknown
    async precheck() {
        const info = await this.safeRequest("api/kc/user/user-info", { method: "GET" });
        if (isLoginExpired(info)) return "expired";
        if (isUlpUnregistered(info)) return "unregistered";
        if (Number(info.code) === 0) {
            const d = info.data || {};
            const member = hasUlpMember(info);
            const name = d.nickname || d.nick_name || d.mobile || "";
            if (member) this.log(`会员校验通过${name ? `（${name}）` : ""}`);
            const task = await this.safeRequest("api/kc/user/user-task", { method: "GET" });
            const needImprove = Number(getByPath(task, ["data", "data", "need_improve_user_info"])) === 1;
            if (!member || needImprove) return "unregistered";
        } else {
            this.log(`会员信息异常：${msgOf(info) || short(info)}`);
        }

        const s = await this.safeRequest("api/kc/user/user-sign-info", { method: "GET" });
        if (isLoginExpired(s)) return "expired";
        if (isUlpUnregistered(s)) return "unregistered";
        if (Number(s.code) === 0) {
            return (s.data || {}).now_date_is_sign ? "signed" : "unsigned";
        }
        return "unknown";
    }
    reportSign(res) {
        if (Number(res.code) === 0) {
            const d = res.data || {};
            const days = d.sign_continue_text || d.sign_continue_day || d.sign_continue || "";
            const points = d.sign_once_point || d.point || "";
            if (d.now_date_is_sign) {
                this.log(`✅ 签到成功${days ? `，已累计签到 ${days} 天` : ""}${points ? `，本次 +${points} 积分` : ""}`);
            } else {
                this.log(`✅ 签到已处理：${short(res)}`);
            }
            return "ok";
        }
        const msg = msgOf(res);
        if (isUlpUnregistered(res)) { this.log(UNREG_MSG); return "unregistered"; }
        if (/已签|已经签|签到过|重复|already/i.test(msg)) { this.log(`✅ 今日已签到（${msg}）`); return "ok"; }
        if (needsCaptcha(res)) { this.log(`⚠️ 触发风控图形验证码（${msg || "风险识别"}）；按规则不自动绕过，请稍后手动在小程序内签到或降低频率`); return "captcha"; }
        this.log(`❌ 签到失败：${msg || short(res)}`);
        return "fail";
    }
    async doSign() {
        return this.request("api/kc/user/sign-in", { method: "POST", body: "" });
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();

            let state = await this.precheck();
            if (state === "expired" && !this.justLoggedIn) {
                this.log("token 失效，重新登录后重试");
                await this.login();
                state = await this.precheck();
            }
            if (state === "unregistered") { this.log(UNREG_MSG); return; }
            if (state === "signed") { this.log("✅ 今日已签到"); return; }

            await $.wait(1500, 3500);
            let res = await this.doSign();

            if (isLoginExpired(res) && !this.justLoggedIn) {
                this.log("签到时 token 失效，重新登录后重试");
                await this.login();
                await $.wait(1500, 3000);
                res = await this.doSign();
            }
            this.reportSign(res);
        } catch (e) {
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
