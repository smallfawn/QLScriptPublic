/*
------------------------------------------
@Description: OPPO商城 - 微信小程序静默登录 + 每日累计签到
cron: 12 8 * * *
------------------------------------------
变量名：oppo2
变量值：wx_server 里的 openid，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx9c825da1a7ba062e，OPPO商城 / 与既有 oppo.js 的 wxe705… 是两个不同小程序）：
（迁移自 YYB-GO 系脚本 OPPO.py，原脚本已 code 登录）

签名（仅登录 pre-auth 用）：
  data = {loginType,code, appKey, timestamp(ms), nonce(uuid)}，去空 → 按 key 升序 k=v& 拼接
  sign = md5( 上串 + "&key=" + SIGN_KEY )
登录两步：
  1) POST https://id.opposhop.cn/api/bind-login/pre-auth
       body {loginType:"wechat",code,appKey,timestamp,nonce,sign}  头 source_type/s_channel/s_version
       -> success==true，data.openId、data.encryptedSession
  2) GET  https://msec.opposhop.cn/users/web/member/info
       头 NEWOPPOSID=encryptedSession、openid=openId
       -> code==200，data.sessionId、data.aesSessionId（=最终会话；未注册会员时拿不到 → ⚠️）
业务（hd.opposhop.cn，头 Cookie: NEWOPPOSID=sessionId; newopkey=aesSessionId + openid，无需 sign）：
  校验/积分 GET  /api/cn/oapi/marketing/member/queryMemberCreditInfo -> code==200
  签到详情 GET  /api/cn/oapi/marketing/cumulativeSignIn/getSignInDetail?activityId= -> data.todaySignIn / signInDayNum
  签到     POST /api/cn/oapi/marketing/cumulativeSignIn/signIn {activityId,creditsAddActionId,business:1} -> code==200
活动 id 按月轮换：优先从签到落地页 https://hd.opposhop.cn/bp/b371ce270f7509f0 里发现 SignIn 楼层 activityId，
  发现失败回落到内置 FALLBACK_SIGN_ACTIVITY_ID。
APP_KEY/SIGN_KEY/CREDITS_ADD_ACTION_ID/活动 id 均为该小程序固定应用常量（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("OPPO商城签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "oppo2";
const MINI_APP_ID = "wx9c825da1a7ba062e";
const PAGE_VERSION = "592";

// ---- 固定应用常量（非个人凭证）----
const APP_KEY = "H7N4jMYgvNopNk7csDDhnM";
const SIGN_KEY = "uyIVtwnGi3Qyf8dtGJ1d6g==";
const CREDITS_ADD_ACTION_ID = "1788913e6d9e4683b8b9ab0088733560";
const FALLBACK_SIGN_ACTIVITY_ID = "2083099953777090560";

// ---- 端点 ----
const PRE_AUTH_URL = "https://id.opposhop.cn/api/bind-login/pre-auth";
const MEMBER_INFO_URL = "https://msec.opposhop.cn/users/web/member/info";
const HD_BASE = "https://hd.opposhop.cn";
const API_CREDIT = `${HD_BASE}/api/cn/oapi/marketing/member/queryMemberCreditInfo`;
const API_SIGN_DETAIL = `${HD_BASE}/api/cn/oapi/marketing/cumulativeSignIn/getSignInDetail`;
const API_SIGN_IN = `${HD_BASE}/api/cn/oapi/marketing/cumulativeSignIn/signIn`;
const LANDING_PAGE =
    "https://hd.opposhop.cn/bp/b371ce270f7509f0?nightModelEnable=true&us=wode&um=qiandaobanner&colorScheme=light";

const TOKEN_CACHE_FILE = path.join(__dirname, "oppo2_token_cache.json");
const UA =
    "Mozilla/5.0 (Linux; Android 16; 2308CPXD0C Build/BP2A.250605.031.A3; wv) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/146.0.7680.178 " +
    "Mobile Safari/537.36 XWEB/1460249 MMWEBSDK/20260502 MMWEBID/6435 " +
    "MicroMessenger/8.0.76.3141(0x28004C3C) WeChat/arm64 Weixin NetType/WIFI " +
    "Language/zh_CN ABI/arm64 MiniProgramEnv/android";
const H5_UA =
    "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/107.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.30";
const REFERER = `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`;

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
function short(v, n = 260) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
}
// 与 OPPO.py generate_sign 一致：加 appKey/timestamp(ms)/nonce → 去空 → key 升序 k=v& → +&key= → md5
function generateSign(params) {
    const data = { ...params, appKey: APP_KEY, timestamp: Date.now(), nonce: uuidv4() };
    const filtered = {};
    for (const k of Object.keys(data)) {
        const v = data[k];
        if (v !== null && v !== undefined && v !== "") filtered[k] = v;
    }
    const raw = Object.keys(filtered).sort().map((k) => `${k}=${filtered[k]}`).join("&");
    const sign = crypto.createHash("md5").update(raw + `&key=${SIGN_KEY}`).digest("hex");
    return { sign, timestamp: filtered.timestamp, nonce: filtered.nonce };
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.sessionId = "";
        this.aesSessionId = "";
        this.openId = "";
        this.signActivityId = FALLBACK_SIGN_ACTIVITY_ID;
        this.creditsAddActionId = CREDITS_ADD_ACTION_ID;
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
    // 业务请求（hd.opposhop.cn），带 Cookie 会话头，无需 sign
    async bizRequest(method, url, { params, data } = {}) {
        const headers = {
            Cookie: `NEWOPPOSID=${this.sessionId}; newopkey=${this.aesSessionId}`,
            openid: this.openId,
            source_type: "503",
            s_channel: "program_wx",
            s_version: "080457",
            "User-Agent": UA,
            Referer: "https://hd.opposhop.cn/bp/b371ce270f7509f0?us=wode&um=qiandaobanner",
            Accept: "application/json, text/plain, */*",
        };
        if (method.toUpperCase() === "POST") headers["Content-Type"] = "application/json";
        const res = await axios.request({
            method, url, params, data,
            headers, timeout: 25000, validateStatus: () => true,
        });
        return res.data || {};
    }
    async login() {
        const code = await this.getCode();
        // 1) pre-auth
        const { sign, timestamp, nonce } = generateSign({ loginType: "wechat", code });
        const preRes = await axios.request({
            method: "POST", url: PRE_AUTH_URL,
            data: { loginType: "wechat", code, appKey: APP_KEY, timestamp, nonce, sign },
            headers: {
                "Content-Type": "application/json", "User-Agent": UA, Referer: REFERER,
                source_type: "503", s_channel: "program_wx", s_version: "80457",
            },
            timeout: 20000, validateStatus: () => true,
        });
        const pre = preRes.data || {};
        if (!pre.success) throw new Error(`pre-auth 失败: ${short(pre)}`);
        const preData = pre.data || {};
        this.openId = preData.openId || "";
        const encryptedSession = preData.encryptedSession || "";
        if (!encryptedSession) throw new Error(`pre-auth 无 encryptedSession: ${short(pre)}`);
        this.log(`pre-auth 成功 openId=${this.openId || "未知"}`);

        // 2) member/info 换最终会话
        const miRes = await axios.request({
            method: "GET", url: MEMBER_INFO_URL,
            headers: {
                NEWOPPOSID: encryptedSession, openid: this.openId,
                source_type: "503", s_channel: "program_wx", s_version: "80457",
                "User-Agent": UA, Referer: REFERER,
            },
            timeout: 20000, validateStatus: () => true,
        });
        const info = miRes.data || {};
        if (Number(info.code) !== 200) {
            // 未注册 OPPO 商城会员时常见拿不到会话
            throw new Error(`NO_ACCOUNT:member/info code=${info.code} ${info.message || info.errorMessage || short(info)}`);
        }
        const inner = info.data || {};
        this.sessionId = inner.sessionId || "";
        this.aesSessionId = inner.aesSessionId || "";
        if (!this.sessionId || !this.aesSessionId) {
            throw new Error(`NO_ACCOUNT:member/info 缺 sessionId/aesSessionId: ${short(info)}`);
        }
        const cache = readCache();
        cache[this.account.openid] = { sessionId: this.sessionId, aesSessionId: this.aesSessionId, openId: this.openId, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    async isLoginValid() {
        try {
            const data = await this.bizRequest("GET", API_CREDIT);
            return Number(data.code) === 200;
        } catch (e) { return false; }
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.sessionId && cached.sessionId && cached.aesSessionId) {
            this.sessionId = cached.sessionId; this.aesSessionId = cached.aesSessionId; this.openId = cached.openId || "";
            if (await this.isLoginValid()) { this.log("使用缓存会话"); return; }
            this.log("缓存会话失效，重新登录");
            this.sessionId = this.aesSessionId = ""; this.openId = "";
        }
        if (!this.sessionId) await this.login();
    }
    async showCredit() {
        try {
            const data = await this.bizRequest("GET", API_CREDIT);
            if (Number(data.code) === 200) {
                const d = data.data || {};
                this.log(`当前积分: ${d.amount ?? "?"} 等级: ${d.userLevel ?? "?"}`);
            }
        } catch (e) {}
    }
    // 从签到落地页发现当期活动 id（只读，失败回落常量）
    async discoverActivityId() {
        try {
            const res = await axios.request({
                method: "GET", url: LANDING_PAGE,
                headers: { "User-Agent": H5_UA, Accept: "text/html,*/*", Referer: LANDING_PAGE },
                responseType: "text", transformResponse: [(v) => v],
                timeout: 15000, validateStatus: () => true,
            });
            const html = typeof res.data === "string" ? res.data : "";
            if (res.status !== 200 || !html) { this.log("活动发现: 页面不可读，用内置 id"); return; }
            const anchor = html.search(/"type"\s*:\s*"SignIn"/);
            if (anchor < 0) { this.log("活动发现: 无 SignIn 楼层，用内置 id"); return; }
            const seg = html.slice(anchor, anchor + 2500);
            const idM = seg.match(/"activityInfo"\s*:\s*\{[^{}]*"activityId"\s*:\s*"(\d+)"/);
            const nameM = seg.match(/"activityName"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            const actM = seg.match(/"creditsAddActionId"\s*:\s*"([0-9a-f]{32})"/);
            if (!idM) { this.log("活动发现: SignIn 楼层无 activityId，用内置 id"); return; }
            this.signActivityId = idM[1];
            if (actM) this.creditsAddActionId = actM[1];
            this.log(`当期签到活动: ${nameM ? nameM[1] : "未命名"} (activityId=${this.signActivityId})`);
        } catch (e) {
            this.log(`活动发现失败: ${e.message || e}，用内置 id`);
        }
    }
    async signDetail() {
        const data = await this.bizRequest("GET", API_SIGN_DETAIL, { params: { activityId: this.signActivityId } });
        if (Number(data.code) === 200) return data.data || {};
        return {};
    }
    async sign() {
        const detail = await this.signDetail();
        if (detail.todaySignIn === true) {
            return this.log(`✅ 今日已签到，累计【${detail.signInDayNum ?? "?"}】天`);
        }
        const data = await this.bizRequest("POST", API_SIGN_IN, {
            data: { activityId: String(this.signActivityId), creditsAddActionId: String(this.creditsAddActionId), business: 1 },
        });
        if (Number(data.code) !== 200) {
            const msg = String(data.message || data.errorMessage || short(data));
            if (/已签|重复|已经签到|今日已/.test(msg)) return this.log(`✅ 今日已签到（${msg}）`);
            return this.log(`❌ 签到失败: ${msg}`);
        }
        const info = data.data || {};
        if (info && info.receiveStatus === false) {
            const fail = String(info.receiveFailMsg || "领取失败");
            if (/已签|重复|今日/.test(fail)) return this.log(`✅ 今日已签到（${fail}）`);
            return this.log(`❌ 签到领取失败: ${fail}`);
        }
        const detail2 = await this.signDetail();
        const days = detail2.signInDayNum ?? detail.signInDayNum ?? "?";
        const award = info.awardValue;
        if (award !== undefined && award !== null) return this.log(`✅ 签到成功，获得【${award}】积分，累计【${days}】天`);
        return this.log(`✅ 签到成功，累计【${days}】天`);
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.showCredit();
            await this.discoverActivityId();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在 OPPO商城 注册/激活会员，先在小程序里登录一次再跑（${String(e.message).replace(/^NO_ACCOUNT:/, "")}）`);
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
