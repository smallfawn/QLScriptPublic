/*
------------------------------------------
@Description: 巅峰美缝师 - 微信小程序静默登录 + 每日签到
cron: 12 9 * * *
------------------------------------------
变量名：dfmfs
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx444ddc3d46767f9d，host api.dfmeifeng.com）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

登录  GET /wechat/miniapp/wechat/login?code=<code>&memberId=  （不带 token）
        -> code==200，data.login===true，data.access_token（=后续 token），data.isNew
鉴权头（登录后）：Authorization: Bearer <access_token>；t = md5(access_token + "YYYY-MM-DD")（北京时区，小写hex）
绑手机（仅新用户，新式 phoneCode）：GET /wechat/miniapp/wechat/getPhoneNoInfo?code=<phoneCode>&openid=&memberId= -> data.access_token（刷新）
签到状态  GET /wechat/miniapp/signin/getSignInfo -> data.todaySignIn / data.continuousDay
签到      POST /wechat/miniapp/signin/signIn {}  -> code==200/0
积分      GET /wechat/miniapp/member/getInfo -> data.balancePoints
成功码判定：code∈[200,0] 或 Success/success===true。
登录本质是 jscode2session（仅需 code，不需明文 openid/unionid），故可迁移；新式 phoneCode 不与 login code 配对，故绑手机不受 blocked-4b 限制。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("巅峰美缝师签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "dfmfs";
const MINI_APP_ID = "wx444ddc3d46767f9d";
const API_BASE = "https://api.dfmeifeng.com";
const HOST = "api.dfmeifeng.com";
const PAGE_VERSION = "71";
const TOKEN_CACHE_FILE = path.join(__dirname, "dfmfs_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/wechat/miniapp/wechat/login";
const EP_GET_PHONE = "/wechat/miniapp/wechat/getPhoneNoInfo";
const EP_GET_INFO = "/wechat/miniapp/member/getInfo";
const EP_SIGN_INFO = "/wechat/miniapp/signin/getSignInfo";
const EP_SIGN_IN = "/wechat/miniapp/signin/signIn";

const WX_SERVER_URL = process.env.wx_server_url || "http://192.168.31.196:8787";
const WX_AUTH = process.env.wx_auth || "";

const wechat = new WeChatServer({ url: WX_SERVER_URL, appid: MINI_APP_ID, auth: WX_AUTH });

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
function md5(s) { return crypto.createHash("md5").update(String(s), "utf8").digest("hex"); }
function chinaDateStr() {
    const d = new Date(Date.now() + 8 * 3600 * 1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
function genT(token) { return token ? md5(token + chinaDateStr()) : ""; }
function isOk(res) {
    if (!res || typeof res !== "object") return false;
    if (res.code === 200 || res.code === 0 || res.code === "200" || res.code === "0") return true;
    if (res.Success === true || res.success === true) return true;
    return false;
}
function pickMsg(res) {
    if (!res || typeof res !== "object") return short(res);
    return res.msg || res.message || res.Message || res.retInfo || res.errMsg || short(res);
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
    headers(withToken = true) {
        const h = {
            Accept: "*/*", "Content-Type": "application/json", Host: HOST,
            "User-Agent": UA, xweb_xhr: "1",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
        };
        if (withToken && this.token) {
            h.Authorization = `Bearer ${this.token}`;
            h.t = genT(this.token);
        }
        return h;
    }
    async req(method, apiPath, { withToken = true, data = undefined } = {}) {
        const res = await axios.request({
            method, url: `${API_BASE}${apiPath}`, data: method === "POST" ? (data || {}) : undefined,
            headers: this.headers(withToken), timeout: 20000, validateStatus: () => true,
        });
        if (res.status !== 200 && !(res.data && typeof res.data === "object")) {
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
    async getPhoneCode() {
        try {
            const res = await axios.request({
                method: "POST", url: `${WX_SERVER_URL}/wx/getphonenumber`,
                data: { openid: this.account.openid, appid: MINI_APP_ID },
                headers: { auth: WX_AUTH, "Content-Type": "application/json" },
                timeout: 30000, validateStatus: () => true,
            });
            const d = res.data || {};
            return d?.data?.code || d?.code || "";
        } catch (e) { this.log(`取手机号code异常: ${e.message || e}`); return ""; }
    }
    async login() {
        const code = await this.getCode();
        const res = await this.req("GET", `${EP_LOGIN}?code=${encodeURIComponent(code)}&memberId=`, { withToken: false });
        if (!isOk(res)) throw new Error(`登录失败: ${pickMsg(res)}`);
        const data = res.data || {};
        this.token = String(data.access_token || "");
        if (!this.token) throw new Error(`登录未返回 access_token: ${short(res)}`);
        const isNew = data.login !== true || data.isNew === true;
        if (data.isNew === true) {
            this.log("🆕 新用户，尝试绑定手机号刷新token");
            const phoneCode = await this.getPhoneCode();
            if (phoneCode) {
                const pr = await this.req("GET", `${EP_GET_PHONE}?code=${encodeURIComponent(phoneCode)}&openid=&memberId=`);
                const nt = pr?.data?.access_token;
                if (nt) { this.token = String(nt); this.log("✅ 手机号绑定成功，token已刷新"); }
                else this.log(`ℹ️ 绑定手机号未刷新token: ${pickMsg(pr)}`);
            } else {
                this.log("ℹ️ 未取到手机号code，跳过绑定");
            }
        }
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${isNew ? "（新用户）" : ""}`);
    }
    async points() {
        try {
            const res = await this.req("GET", EP_GET_INFO);
            if (isOk(res)) return (res.data || {}).balancePoints;
        } catch (e) {}
        return undefined;
    }
    async sign(retry = true) {
        // 更精确的会话失效判定（不含裸"过期"，避免误判"活动有效期已过期"）
        const isAuth = (m) => /未登录|重新登录|登录已?过期|登录失效|token|未授权|鉴权|401|会话失效|请先登录/i.test(String(m || ""));
        // 活动态门禁：日常活动有效期过期/需扫产品红包码延长（账号/产品态，非签到失败）
        const isActivityGate = (m) => /活动.*(过期|失效|结束)|有效期已过期|扫.*红包码|扫.*(延长|激活)/.test(String(m || ""));
        // 状态
        const info = await this.req("GET", EP_SIGN_INFO);
        if (isOk(info)) {
            const d = info.data || {};
            if (d.todaySignIn === true) return this.log(`✅ 今日已签到（连续 ${d.continuousDay ?? "?"} 天）`);
        } else if (retry && isAuth(pickMsg(info))) {
            this.log("会话失效，重新登录后重试");
            this.token = ""; await this.login(); return this.sign(false);
        }
        // 签到
        const before = await this.points();
        const res = await this.req("POST", EP_SIGN_IN, { data: {} });
        if (isOk(res)) {
            const after = await this.points();
            const delta = (typeof before === "number" && typeof after === "number") ? ` (+${after - before})` : "";
            return this.log(`✅ 签到成功${after !== undefined ? `，当前积分 ${after}${delta}` : ""}`);
        }
        const msg = pickMsg(res);
        if (/已签|签到过|重复|已完成|今日已/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        if (isActivityGate(msg)) return this.log(`⚠️ 该微信号的日常活动有效期已过期，需先在小程序里扫产品顶部红包码激活/延长后再签（${msg}）`);
        if (retry && isAuth(msg)) {
            this.log("会话失效，重新登录后重试");
            this.token = ""; await this.login(); return this.sign(false);
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
