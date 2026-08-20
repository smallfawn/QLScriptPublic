/*
------------------------------------------
@Description: 途虎养车 - 微信小程序静默登录 + 每日签到
cron: 24 8 * * *
------------------------------------------
变量名：thyc
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx27d20205249c56a3，host cl-gateway.tuhu.cn）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

鉴权：纯 code 静默登录，无签名。登录换取 userSession，后续请求头 Authorization: Bearer <userSession>
登录  POST /cl-user-auth-login/login/authSilentSign  {channel:"WXAPP",code}
        -> code==10000，data.userSession（=后续 token）、data.nickName
状态  POST /cl-common-api/api/member/getSignInInfo  {channel:"WXAPP"} 头 Authorization:Bearer
        -> code==10000，data.signInStatus(已签)/userIntegral(积分)
签到  POST /cl-common-api/api/dailyCheckIn/userCheckIn  {channel:"WXAPP"}
        -> code==10000，data.rewardIntegral/continuousDays
authSilentSign 为静默登录，通常任意微信 code 均可自动建号，无需明文 openid/unionid。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("途虎养车签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "thyc";
const MINI_APP_ID = "wx27d20205249c56a3";
const PAGE_VERSION = "1319";
const API_HOST = "https://cl-gateway.tuhu.cn";
const TOKEN_CACHE_FILE = path.join(__dirname, "thyc_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/cl-user-auth-login/login/authSilentSign";
const EP_SIGN_INFO = "/cl-common-api/api/member/getSignInInfo";
const EP_SIGN_SUBMIT = "/cl-common-api/api/dailyCheckIn/userCheckIn";
const OK_CODE = 10000;

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
function toInt(v) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : 0; }

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        // 设备指纹类字段每号随机生成，不复用原作者值
        this.distinctId = $.uuid();
        this.deviceId = `${Date.now()}-${$.randomNumber(7)}-0f6cb850fc64da-24853921`;
        this.fingerprint = `sMPVY${Math.floor(Date.now() / 1000)}QPV2wLVhl8f`;
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    headers(withAuth) {
        const h = {
            Host: "cl-gateway.tuhu.cn",
            Connection: "keep-alive",
            xweb_xhr: "1",
            distinct_id: this.distinctId,
            currentPage: "memberMallPackage/pages/pointCenter/pointCenter",
            deviceId: this.deviceId,
            authType: "oauth",
            api_level: "2",
            vehicleClass: "CAR",
            channel: "wechat-miniprogram",
            "Content-Type": "application/json",
            fingerprint: this.fingerprint,
            "User-Agent": UA,
            version: "7.62.8",
            Accept: "*/*",
            "Sec-Fetch-Site": "cross-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            "Accept-Language": "zh-CN,zh;q=0.9",
        };
        if (withAuth && this.token) h.Authorization = `Bearer ${this.token}`;
        return h;
    }
    async request(apiPath, data, { withAuth = true } = {}) {
        const res = await axios.request({
            method: "POST", url: `${API_HOST}${apiPath}`, data: data || {},
            headers: this.headers(withAuth), timeout: 20000, validateStatus: () => true,
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
        const res = await this.request(EP_LOGIN, { channel: "WXAPP", code }, { withAuth: false });
        if (Number(res?.code) !== OK_CODE) throw new Error(`登录失败: ${res?.message || res?.msg || short(res)}`);
        const info = res.data || {};
        this.token = String(info.userSession || "");
        if (!this.token) {
            // 静默登录未返回 session：多半是该微信号未在途虎注册/激活
            this.unregistered = true;
            throw new Error(`NO_ACCOUNT:登录未返回 userSession: ${short(res)}`);
        }
        const nick = info.nickName || "微信用户";
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功（${nick}）`);
    }
    async getSignInfo() {
        const res = await this.request(EP_SIGN_INFO, { channel: "WXAPP" });
        if (Number(res?.code) !== OK_CODE) return { ok: false, res };
        const d = res.data || {};
        return { ok: true, signed: !!d.signInStatus, integral: toInt(d.userIntegral), res };
    }
    async submitSign() {
        const res = await this.request(EP_SIGN_SUBMIT, { channel: "WXAPP" });
        if (Number(res?.code) === OK_CODE) {
            const d = res.data || {};
            return { ok: true, reward: toInt(d.rewardIntegral), days: toInt(d.continuousDays), res };
        }
        return { ok: false, msg: res?.message || res?.msg || short(res), res };
    }
    async sign(retry = true) {
        const info = await this.getSignInfo();
        if (!info.ok) {
            const msg = info.res?.message || info.res?.msg || short(info.res);
            if (retry && /token|登录|未授权|失效|过期|未登录|鉴权|401/i.test(String(msg))) {
                this.log("会话失效，重新登录后重试");
                this.token = "";
                await this.login();
                return this.sign(false);
            }
            return this.log(`❌ 查询签到状态失败: ${msg}`);
        }
        if (info.signed) return this.log(`✅ 今日已签到，当前积分 ${info.integral}`);
        this.log(`未签到，当前积分 ${info.integral}，开始签到...`);
        const r = await this.submitSign();
        if (r.ok) return this.log(`✅ 签到成功 +${r.reward} 积分，连续签到 ${r.days} 天`);
        if (/已签|签到过|重复|已完成/.test(String(r.msg))) return this.log(`✅ 今日已签到（${r.msg}）`);
        this.log(`❌ 签到失败: ${r.msg}`);
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
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log("⚠️ 该微信号还没在途虎养车注册/激活，先在小程序里登录一次再跑");
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
