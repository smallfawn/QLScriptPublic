/*
------------------------------------------
@Description: 嘉立创(JLC) - 微信小程序静默登录 + 每日签到（豆豆）
cron: 57 8 * * *
------------------------------------------
变量名：jlc
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx6c7b851c877dba42，业务 m.jlc.com / 鉴权 passport.jlc.com）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录，纯 wx.login code 换 token，无需明文 openId/encryptedData）

secretkey：动态 keyId，POST https://m.jlc.com/api/integrated/secret/update {keyId?}
             -> code==200，data.keyId（作为后续所有请求头 secretkey）；29001/29003/HTTP460 表示过期需重取
CAS 换码（passport.jlc.com，appId=JLC_MOBILE_APP）：
  1) POST /api/cas/sso/login/check-applet-login {appId, appletAuthCode:<wx.login code>}
        -> code==200，data.token（applet_login_token）；data.isLoginBind/bind===false = 该微信未绑定嘉立创账号
  2) POST /api/cas/sso/login/applet-silent-login {token:<applet_login_token>, appId}
        -> 响应内递归取 "AC-" 前缀串 = cas_code
登录  POST https://m.jlc.com/api/login/login-by-code  multipart 表单 code=<cas_code>，头带 secretkey / X-JLC-AccessToken:NONE
        -> token 在响应头 X-Jlc-Accesstoken 或 body data.accessToken/token
状态  GET /api/activity/sign/getCurrentUserSignInConfig?platformType=MP-WEIXIN
        -> success，data.haveSignIn(已签)/haveReceive/day(连续天数)
签到  GET /api/activity/sign/signIn?platformType=MP-WEIXIN&source=2 -> success，data.gainNum
七天领取 GET /api/activity/sign/receiveVoucher?platformType=MP-WEIXIN （day==7 && haveSignIn && !haveReceive）
豆豆总数 GET /api/activity/front/getCustomerIntegral -> data.integralVoucher
CAS_APP_ID/platformType/source 为该小程序固定应用常量（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("嘉立创签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const WeChatServer = require("./wcs.js");

const ckName = "jlc";
const MINI_APP_ID = "wx6c7b851c877dba42";
const PAGE_VERSION = "154";
const BASE_URL = "https://m.jlc.com";
const CAS_BASE_URL = "https://passport.jlc.com";
const CAS_APP_ID = "JLC_MOBILE_APP";
const PLATFORM_TYPE = "MP-WEIXIN";
const SOURCE = "2";
const MP_ENV = "release";
const MP_VERSION = "1.117.4";

const SECRET_UPDATE_URL = BASE_URL + "/api/integrated/secret/update";
const CAS_CHECK_URL = CAS_BASE_URL + "/api/cas/sso/login/check-applet-login";
const CAS_LOGIN_URL = CAS_BASE_URL + "/api/cas/sso/login/applet-silent-login";
const LOGIN_URL = BASE_URL + "/api/login/login-by-code";
const SECRET_EXPIRED_CODES = [29001, 29003];

const TOKEN_CACHE_FILE = path.join(__dirname, "jlc_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

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
// 递归从 CAS 响应里取 "AC-" 前缀授权码
function extractCasAuthCode(payload) {
    if (typeof payload === "string") return payload.startsWith("AC-") ? payload : null;
    if (Array.isArray(payload)) {
        for (const v of payload) { const c = extractCasAuthCode(v); if (c) return c; }
        return null;
    }
    if (payload && typeof payload === "object") {
        for (const k of Object.keys(payload)) { const c = extractCasAuthCode(payload[k]); if (c) return c; }
        return null;
    }
    return null;
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.secret = "";
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
    // 动态获取/刷新 secretkey(keyId)
    async refreshSecret(previousKey = "") {
        const headers = {
            accept: "application/json, text/plain, */*",
            "content-type": "application/json;charset=UTF-8",
            "X-JLC-AccessToken": this.token || "NONE",
            "X-JLC-ClientType": PLATFORM_TYPE,
            "X-JLC-MP-AppId": MINI_APP_ID,
            "X-JLC-MP-Env": MP_ENV,
            "X-JLC-MP-Version": MP_VERSION,
            origin: BASE_URL,
            referer: BASE_URL + "/",
            "user-agent": UA,
        };
        const body = previousKey ? { keyId: previousKey } : {};
        const res = await axios.request({ method: "POST", url: SECRET_UPDATE_URL, data: body, headers, timeout: 30000, validateStatus: () => true });
        const data = res.data || {};
        const keyId = (data.data && data.data.keyId) || null;
        if (Number(data.code) !== 200 || !keyId) throw new Error(`更新secretkey失败: ${short(data.message || data)}`);
        this.secret = String(keyId);
        return this.secret;
    }
    // wx.login code -> CAS AC- 授权码
    async getCasAuthCode() {
        const wxCode = await this.getCode();
        const headers = {
            accept: "application/json, text/plain, */*",
            "content-type": "application/json",
            referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            "user-agent": UA,
        };
        // 1) check-applet-login
        const checkRes = await axios.request({
            method: "POST", url: CAS_CHECK_URL,
            data: { appId: CAS_APP_ID, appletAuthCode: wxCode }, headers,
            timeout: 30000, validateStatus: () => true,
        });
        const checkData = checkRes.data || {};
        const checkInfo = checkData.data || {};
        const appletLoginToken = checkInfo && checkInfo.token;
        if (Number(checkData.code) !== 200 || !appletLoginToken) {
            throw new Error(`CAS检查小程序登录失败: ${short(checkData.message || checkData.msg || checkData)}`);
        }
        if (checkInfo.isLoginBind === false || checkInfo.bind === false) {
            throw new Error("NO_ACCOUNT:嘉立创账号尚未绑定当前微信");
        }
        // 2) applet-silent-login
        const loginHeaders = { ...headers, referer: `${CAS_BASE_URL}/m/login/mp-login?appId=${CAS_APP_ID}` };
        const loginRes = await axios.request({
            method: "POST", url: CAS_LOGIN_URL,
            data: { token: appletLoginToken, appId: CAS_APP_ID }, headers: loginHeaders,
            timeout: 30000, validateStatus: () => true,
        });
        const loginData = loginRes.data || {};
        const casCode = extractCasAuthCode(loginData);
        if (Number(loginData.code) !== 200 || !casCode) {
            throw new Error(`CAS小程序静默登录失败: ${short(loginData.message || loginData.msg || loginData)}`);
        }
        return casCode;
    }
    // 用 CAS AC- code 登录，密钥过期自动刷新重试
    async login() {
        await this.refreshSecret();
        const errors = [];
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const casCode = await this.getCasAuthCode();
                const form = new FormData();
                form.append("code", casCode);
                const headers = {
                    ...form.getHeaders(),
                    accept: "application/json, text/plain, */*",
                    referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
                    "X-JLC-AccessToken": "NONE",
                    "X-JLC-ClientType": PLATFORM_TYPE,
                    "X-JLC-MP-AppId": MINI_APP_ID,
                    "X-JLC-MP-Env": MP_ENV,
                    "X-JLC-MP-Version": MP_VERSION,
                    secretkey: this.secret,
                    xweb_xhr: "1",
                    "user-agent": UA,
                };
                const res = await axios.request({ method: "POST", url: LOGIN_URL, data: form, headers, timeout: 30000, validateStatus: () => true });
                // token: 响应头优先，其次 body
                let token = res.headers["x-jlc-accesstoken"] || res.headers["X-Jlc-Accesstoken"];
                let secret = res.headers["secretkey"] || this.secret;
                const payload = res.data || {};
                const candidates = [];
                if (payload && typeof payload.data === "object" && payload.data) candidates.push(payload.data);
                candidates.push(payload);
                for (const item of candidates) {
                    if (!item || typeof item !== "object") continue;
                    token = token || item.accessToken || item.token || item.access_token;
                    secret = item.secretkey || item.secretKey || secret;
                }
                if (token && String(token).toUpperCase() !== "NONE") {
                    this.token = String(token);
                    this.secret = String(secret || this.secret);
                    const cache = readCache();
                    cache[this.account.openid] = { token: this.token, secret: this.secret, updatedAt: new Date().toISOString() };
                    writeCache(cache);
                    this.log("登录成功");
                    return;
                }
                const detail = `第${attempt + 1}次: status=${res.status}, body=${short(payload)}`;
                errors.push(detail);
                const respCode = Number(payload && payload.code);
                if (attempt === 0 && (SECRET_EXPIRED_CODES.includes(respCode) || res.status === 460)) {
                    await this.refreshSecret(this.secret);
                    this.log("登录未通过，已刷新secretkey并用新CAS授权码重试");
                    continue;
                }
                break;
            } catch (e) {
                if (String(e.message).startsWith("NO_ACCOUNT")) throw e;
                errors.push(`第${attempt + 1}次: ${e.message || e}`);
                break;
            }
        }
        throw new Error(`CAS登录失败；${errors.join("；")}`);
    }
    // 业务 GET，密钥过期自动刷新重试一次
    async apiGet(apiPath, params) {
        let data = {};
        for (let attempt = 0; attempt < 2; attempt++) {
            const headers = {
                accept: "application/json, text/plain, */*",
                "content-type": "application/json;charset=UTF-8",
                "x-jlc-accesstoken": this.token,
                secretkey: this.secret,
                origin: BASE_URL,
                referer: BASE_URL + "/",
                "user-agent": UA,
            };
            const res = await axios.request({ method: "GET", url: BASE_URL + apiPath, params, headers, timeout: 20000, validateStatus: () => true });
            data = res.data || {};
            if (attempt === 0 && SECRET_EXPIRED_CODES.includes(Number(data.code))) {
                await this.refreshSecret(this.secret);
                continue;
            }
            return data;
        }
        return data;
    }
    async getSignStatus() {
        return this.apiGet("/api/activity/sign/getCurrentUserSignInConfig", { platformType: PLATFORM_TYPE });
    }
    async doSignIn() {
        return this.apiGet("/api/activity/sign/signIn", { platformType: PLATFORM_TYPE, source: SOURCE });
    }
    async receiveVoucher() {
        return this.apiGet("/api/activity/sign/receiveVoucher", { platformType: PLATFORM_TYPE });
    }
    async getIntegral() {
        return this.apiGet("/api/activity/front/getCustomerIntegral", {});
    }
    async validateToken() {
        try {
            const st = await this.getSignStatus();
            return st && st.success === true;
        } catch (e) { return false; }
    }
    extractStreakDay(d) {
        for (const k of ["day", "continuousDay", "continueDay", "signDay"]) {
            const v = d && d[k];
            if (typeof v === "number") return v;
            if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
        }
        return null;
    }
    async sign(retry = true) {
        // 1) 查状态
        let st = await this.getSignStatus();
        if (!st || st.success !== true) {
            if (retry && this.isAuthErr(st)) {
                this.log("会话失效，重新登录后重试");
                this.token = "";
                await this.login();
                return this.sign(false);
            }
            return this.log(`❌ 查询签到状态失败: ${short(st)}`);
        }
        let d = st.data || {};
        let haveSignIn = d.haveSignIn === true;
        let haveReceive = d.haveReceive === true;
        let streak = this.extractStreakDay(d);
        // 2) 签到
        if (haveSignIn) {
            this.log(`✅ 今日已签到${streak != null ? `，已连续 ${streak} 天` : ""}`);
        } else {
            const si = await this.doSignIn();
            if (si && si.success === true) {
                const gain = (si.data && si.data.gainNum) || 0;
                this.log(`✅ 签到成功，本次获得 ${gain} 豆豆`);
                const st2 = await this.getSignStatus();
                if (st2 && st2.success === true) {
                    d = st2.data || {};
                    haveSignIn = d.haveSignIn === true;
                    haveReceive = d.haveReceive === true;
                    streak = this.extractStreakDay(d);
                }
            } else {
                const msg = (si && (si.message || si.msg)) || short(si);
                if (/已签|签到过|重复|已完成/.test(String(msg))) this.log(`✅ 今日已签到（${msg}）`);
                // 嘉立创服务端风控：账号已登录且接口鉴权正常，但签到被判"疑似违反规则"
                else if (/违反签到规则|疑似|风控|联系工作人员/.test(String(msg))) {
                    this.log(`🚫 被嘉立创风控拦截（${msg}）：登录/鉴权均正常、账号已绑定，此为服务端对账号或运行环境的判定，脚本层无法绕过（可尝试先在小程序手动签一次或换网络）`);
                } else this.log(`❌ 签到失败: ${msg}`);
            }
        }
        // 3) 第七天领取
        if (streak === 7 && haveSignIn && !haveReceive) {
            const rv = await this.receiveVoucher();
            if (rv && rv.success === true) this.log(`✅ 连续第7天领取成功：+${short(rv.data)} 豆豆`);
            else this.log(`❌ 第七天领取失败: ${short(rv && (rv.message || rv.msg) || rv)}`);
        } else if (streak === 7 && haveSignIn && haveReceive) {
            this.log("✅ 连续第7天奖励已领取");
        }
        // 4) 查豆豆总数
        const ct = await this.getIntegral();
        if (ct && ct.success === true) {
            const cd = ct.data || {};
            this.log(`📊 当前豆豆总数：${cd.integralVoucher ?? "?"}${cd.expireTime ? `，有效期至 ${cd.expireTime}` : ""}`);
        }
    }
    isAuthErr(resp) {
        const code = Number(resp && resp.code);
        const msg = String((resp && (resp.message || resp.msg)) || "");
        if ([401, 403, 460].includes(code)) return true;
        return /token|登录|未授权|失效|过期|未登录|鉴权/i.test(msg);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            this.secret = cached.secret || "";
            if (!this.secret) { try { await this.refreshSecret(); } catch (e) {} }
            if (await this.validateToken()) { this.log("使用缓存token"); return; }
            this.log("缓存token失效，重新登录");
            this.token = "";
        }
        if (!this.token) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没绑定嘉立创账号（${String(e.message).replace(/^NO_ACCOUNT:/, "")}），先在小程序里登录绑定一次再跑`);
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
