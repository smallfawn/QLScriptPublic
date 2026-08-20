/*
------------------------------------------
@Description: 美的会员(M-VIP) - 微信小程序静默登录 + 每日签到
cron: 32 8 * * *
------------------------------------------
变量名：mdhy
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx49a622805968d156，登录 mcsp.midea.com / 业务 mvip.midea.cn）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录，无需手机号/加密数据）

登录  POST https://mcsp.midea.com/api/cms_bff/mcsp-uc-mvip-bff/app/login/wx/mini/getLoginInfo.do
        头 appId/appsecret/apikey/miniAppVersion（美的 API 网关应用级常量，非个人凭证）
        体 {jsCode:code, loginMode:1, platformType:"WX_MEIDIDAOJIA_MINI", _timeStamp}
        -> 深挖 ucAccessToken(accessToken/token/...)；uid/sukey 取自 set-cookie 或响应字段
        既无 ucAccessToken 又无 uid/sukey cookie = 未在美的会员注册/绑定 -> ⚠️
签到1 GET  https://mvip.midea.cn/my/score/create_daily_score  头 cookie:uid=;sukey=
        -> errcode==0 成功；errmsg 含「已签/已经」= 今日已签
签到2 POST https://mvip.midea.cn/mscp_mscp/api/cms_api/activity-center-im-service/im-svr/im/game/page/sign
        头 ucAccessToken/apiKey(应用级常量)；体 restParams{gameId:22,actvId,rootCode:MDHY,appCode:MDHY_XCX}
        -> code/status/resultCode ∈ {0,200,success} 成功；msg 含「已签」= 今日已签
积分  GET  https://mvip.midea.cn/next/mucuserinfo/getmucuserinfo  头 cookie -> data.userinfo.VipGrow（仅展示）
LOGIN_APP_ID/SECRET/API_KEY、SIGN2_API_KEY、actvId 均为该小程序固定应用常量（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("美的会员签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "mdhy";
const MINI_APP_ID = "wx49a622805968d156";
const PAGE_VERSION = "554";
const LOGIN_APP_ID = "ee07f27990db48109efcccd322d3a873";
const LOGIN_APP_SECRET = "2646746f07bb46199aff49002e6dce81";
const LOGIN_API_KEY = "b6db9d5cf2d449538d3a0dd5d77b2e35";
const SIGN2_API_KEY = "3660663068894a0d9fea574c2673f3c0";
const LOGIN_URL =
    "https://mcsp.midea.com/api/cms_bff/mcsp-uc-mvip-bff/app/login/wx/mini/getLoginInfo.do";
const MVIP_BASE = "https://mvip.midea.cn";
const EP_SIGN1 = "/my/score/create_daily_score";
const EP_SIGN2 =
    "/mscp_mscp/api/cms_api/activity-center-im-service/im-svr/im/game/page/sign";
const EP_USERINFO = "/next/mucuserinfo/getmucuserinfo";
const TOKEN_CACHE_FILE = path.join(__dirname, "mdhy_token_cache.json");

// 签到2 活动级常量（原脚本硬编码，非个人凭证）
const SIGN2_GAME_ID = 22;
const SIGN2_ACTV_ID = "401671388248692763";
const SIGN2_ROOT_CODE = "MDHY";
const SIGN2_APP_CODE = "MDHY_XCX";

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
function short(v, n = 300) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function mask(v) {
    v = String(v || "");
    if (v.length <= 12) return v;
    return `${v.slice(0, 6)}...${v.slice(-6)}`;
}
// 深挖响应中的目标字段（第一个非空命中）
function findValueDeep(obj, keys) {
    if (!obj || typeof obj !== "object") return null;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") return obj[key];
    }
    for (const value of Object.values(obj)) {
        if (value && typeof value === "object") {
            const found = findValueDeep(value, keys);
            if (found) return found;
        }
    }
    return null;
}
// 从 set-cookie 头里挑 uid/sukey
function extractCookies(headers) {
    const setCookie = headers && headers["set-cookie"];
    if (!setCookie) return "";
    const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
    const parts = [];
    for (const item of arr) {
        const first = String(item).split(";")[0];
        if (/^(uid|sukey)=/i.test(first)) parts.push(first);
    }
    return parts.length ? parts.join(";") + ";" : "";
}
function chinaDateParts() {
    const d = new Date(Date.now() + 8 * 3600 * 1000);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
}
// 通用「传输层成功码」判定（code/errcode ∈ 0/200/000000/success ...）
function isSuccessCode(resp) {
    if (!resp || typeof resp !== "object") return false;
    for (const k of ["code", "errcode", "errno", "status", "resultCode", "ret", "success"]) {
        if (resp[k] === undefined) continue;
        const v = resp[k];
        if (v === 0 || v === 200 || v === true) return true;
        if (typeof v === "string" && (/^0+$/.test(v) || /^(200|success|ok)$/i.test(v))) return true;
    }
    return false;
}
function respMsg(resp) {
    if (!resp || typeof resp !== "object") return short(resp);
    return resp.errmsg || resp.msg || resp.message || resp.retInfo || resp.desc || short(resp);
}
function isAlreadySigned(msg) {
    return /已签|签到过|重复|已经签|已完成|今日已/.test(String(msg || ""));
}
function isAuthErr(resp) {
    const msg = respMsg(resp);
    const code = resp && (resp.code ?? resp.errcode ?? resp.status);
    if ([401, 403, 4001, 4003, 10401, "401", "403"].includes(code)) return true;
    return /token|登录|未授权|失效|过期|未登录|鉴权|会话|请重新/i.test(String(msg));
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";   // ucAccessToken
        this.cookie = "";  // uid=..;sukey=..;
        this.signed = false;
        this.unregistered = false;
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
        const res = await axios.request({
            method: "POST",
            url: LOGIN_URL,
            headers: {
                Host: "mcsp.midea.com",
                appId: LOGIN_APP_ID,
                appsecret: LOGIN_APP_SECRET,
                apikey: LOGIN_API_KEY,
                userKey: "",
                miniAppVersion: "3.0.269",
                "X-Tingyun": "c=M|cJgYzP0tKW8",
                xweb_xhr: "1",
                "User-Agent": UA,
                "Content-Type": "application/json",
                Accept: "*/*",
                Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
                "Accept-Language": "zh-CN,zh;q=0.9",
            },
            data: {
                jsCode: code,
                loginMode: 1,
                platformType: "WX_MEIDIDAOJIA_MINI",
                _timeStamp: Date.now(),
            },
            timeout: 20000,
            validateStatus: () => true,
        });
        const data = res.data;
        this.log(`登录返回字段: ${Object.keys(data || {}).join(",") || short(data)}`);
        if (process.env.MDHY_DEBUG) this.log(`[DEBUG登录raw] ${short(data, 900)}`);

        const tk = findValueDeep(data, ["ucAccessToken", "accessToken", "token", "userToken", "access_token"]);
        this.token = tk ? String(tk) : "";

        let cookie = extractCookies(res.headers);
        if (!cookie) {
            const uid = findValueDeep(data, ["uid", "userId", "userCode"]);
            const sukey = findValueDeep(data, ["sukey", "suKey"]);
            if (uid && sukey) cookie = `uid=${uid};sukey=${sukey};`;
        }
        this.cookie = cookie || "";

        if (!this.token && !this.cookie) {
            // 登录接口通了但既无 token 又无 uid/sukey：该微信号未在美的会员注册/绑定
            this.unregistered = true;
            throw new Error(`NO_ACCOUNT:${respMsg(data)}`);
        }

        this.log(`登录成功 token=${this.token ? mask(this.token) : "无"} cookie=${this.cookie ? mask(this.cookie) : "无"}`);
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, cookie: this.cookie, updatedAt: new Date().toISOString() };
        writeCache(cache);
    }
    async getUserInfo() {
        if (!this.cookie) return null;
        try {
            const { data } = await axios.request({
                method: "GET",
                url: `${MVIP_BASE}${EP_USERINFO}`,
                headers: {
                    Host: "mvip.midea.cn", Connection: "keep-alive", charset: "utf-8",
                    cookie: this.cookie, "User-Agent": UA, "Content-Type": "application/json",
                    Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
                },
                timeout: 20000, validateStatus: () => true,
            });
            if (Number(data?.errcode) === 0) {
                const info = data?.data?.userinfo || {};
                return { points: info.VipGrow ?? "?", mobile: info.Mobile || "-" };
            }
        } catch (e) {}
        return null;
    }
    // 签到1：老版美的会员 H5 每日积分（uid/sukey cookie）——本 appid 登录一般不下发该 cookie，有则顺带签
    async sign1() {
        if (!this.cookie) return; // 无 cookie 静默跳过（本 appid 走 ucAccessToken 的签到2）
        const { data } = await axios.request({
            method: "GET",
            url: `${MVIP_BASE}${EP_SIGN1}`,
            headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                cookie: this.cookie, "User-Agent": UA,
                Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            },
            timeout: 20000, validateStatus: () => true,
        });
        if (Number(data?.errcode) === 0) { this.signed = true; return this.log("✅ 签到1(每日积分)成功"); }
        const msg = respMsg(data);
        if (isAlreadySigned(msg)) { this.signed = true; return this.log(`✅ 签到1 今日已签（${msg}）`); }
        this.log(`签到1未成功: ${msg}`);
    }
    // 签到2：互动营销游戏中心每日签到（ucAccessToken）——本 appid 的主签到
    async sign2() {
        if (!this.token) return { skip: true };
        const { data } = await axios.request({
            method: "POST",
            url: `${MVIP_BASE}${EP_SIGN2}`,
            headers: {
                "User-Agent": UA, Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json", ucAccessToken: this.token,
                intercept: "1", apiKey: SIGN2_API_KEY, Origin: MVIP_BASE,
                "X-Requested-With": "com.tencent.mm",
                Referer: `${MVIP_BASE}/mscp_weixin/apps/h5-pro-wx-interaction-marketing/`,
                "Accept-Language": "zh-CN,zh;q=0.9",
            },
            data: {
                headParams: { language: "CN", originSystem: "MCSP", timeZone: "", userCode: "", tenantCode: "", userKey: "TEST_", transactionId: "" },
                pagination: null,
                restParams: { gameId: SIGN2_GAME_ID, actvId: SIGN2_ACTV_ID, rootCode: SIGN2_ROOT_CODE, appCode: SIGN2_APP_CODE, imUserId: "", uid: "", openId: "", unionId: "" },
            },
            timeout: 20000, validateStatus: () => true,
        });
        const msg = respMsg(data);
        if (process.env.MDHY_DEBUG) this.log(`[DEBUG签到2raw] ${short(data, 900)}`);
        if (isSuccessCode(data)) {
            // code 000000/操作成功 = 请求被接受；data.result 区分「本次新签」与「今日已签(幂等)」
            const r = (data && data.data) || {};
            if (r.result === true || r.rewardSendSuccess === true) {
                this.signed = true;
                const days = r.consecutiveDays ?? r.accumulativeDays;
                return this.log(`✅ 签到2成功${days != null ? `，连续 ${days} 天` : ""}`);
            }
            this.signed = true;
            return this.log(`✅ 签到2 今日已签到（${msg}）`);
        }
        if (isAlreadySigned(msg)) { this.signed = true; return this.log(`✅ 签到2 今日已签（${msg}）`); }
        return { authErr: isAuthErr(data), msg };
    }
    async sign(retry = true) {
        await this.sign1();
        if (this.cookie) await $.wait(1500, 3000);
        const r2 = await this.sign2();
        if (r2 && r2.skip && !this.signed) return this.log("⚠️ 无 ucAccessToken 且无 cookie，无法签到");
        if (r2 && r2.authErr && retry) {
            this.log("会话失效，重新登录后重试签到");
            this.token = ""; this.cookie = "";
            await this.login();
            return this.sign(false);
        }
        if (r2 && r2.msg && !this.signed) this.log(`⚠️ 签到2未成功: ${r2.msg}`);
        const ui = await this.getUserInfo();
        if (ui) this.log(`当前成长值/积分: ${ui.points}`);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && !this.cookie && (cached.token || cached.cookie)) {
            this.token = cached.token || "";
            this.cookie = cached.cookie || "";
            this.log("使用缓存token");
            return;
        }
        if (!this.token && !this.cookie) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在美的会员注册/绑定（${String(e.message).replace(/^NO_ACCOUNT:/, "")}），先在小程序里登录一次再跑`);
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
