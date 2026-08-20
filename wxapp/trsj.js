/*
------------------------------------------
@Description: 甜润世界 - 微信小程序静默登录 + 每日签到(签到有奖 + 石斛签到)
cron: 5 9,12,20 * * *
------------------------------------------
变量名：trsj
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx210e40a77dbe7a27，host m.ahzyssl.com）：
（迁移自 YYB-GO 系脚本 TRSJ.py，原脚本已 code 登录，无签名/无手机号）

登录  GET /wx/user/appletLogin?code=<wx.login code>（无签名，UA 用 WMPF）
        -> code==200，data 即 applet_auth_token（后续所有请求放 Authorization 头，裸 token 非 Bearer）
验证  GET /applet/user/getUserBaseInfo -> code==200，data.userName（用来判定 ck 有效 / 未注册）
签到有奖(主签到)
  查询  GET  /applet/user/signIn/getUserSignInLog -> data.userSignInList[]{signInDate,signInStatus==1 表已签}
  签到  POST /applet/user/signIn -> code==200 成功（已签走 msg)
石斛签到(次签到，best-effort，非致命)
  状态  GET  /applet/game/dendrobium/get -> code==200&data 已种植；code==500/msg含"没有正在培养" 未种植
  播种  GET  /applet/game/dendrobium/sowing （原脚本带作者个人 inviteUserId 邀请码，已剔除）
  查询  GET  /applet/game/dendrobium/signIn/getUserSignInLog -> data.todaySignInStatus
  签到  GET  /applet/game/dendrobium/signIn -> code==200 成功
原脚本的推文浏览/买肥料/自动施肥属养成任务，非签到，已略去。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("甜润世界签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "trsj";
const MINI_APP_ID = "wx210e40a77dbe7a27";
const API_HOST = "https://m.ahzyssl.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "trsj_token_cache.json");
const BUSINESS_UA =
    "Mozilla/5.0 (Linux; Android 14; PJE110) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/142.0.0.0 Mobile Safari/537.36 MiniProgramEnv/android";
const LOGIN_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 " +
    "Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/wx/user/appletLogin";
const EP_USERINFO = "/applet/user/getUserBaseInfo";
const EP_SIGN_LOG = "/applet/user/signIn/getUserSignInLog";
const EP_SIGN = "/applet/user/signIn";
const EP_DEN_GET = "/applet/game/dendrobium/get";
const EP_DEN_SOW = "/applet/game/dendrobium/sowing";
const EP_DEN_SIGN_LOG = "/applet/game/dendrobium/signIn/getUserSignInLog";
const EP_DEN_SIGN = "/applet/game/dendrobium/signIn";

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
function chinaToday() {
    const d = new Date(Date.now() + 8 * 3600 * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.unregistered = false;
        this.signed = false; // 主签到(签到有奖)是否达成(含今日已签)
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    async request(method, apiPath, { data, params, auth = true } = {}) {
        const headers = {
            Host: "m.ahzyssl.com",
            Connection: "keep-alive",
            charset: "utf-8",
            "Content-Type": "application/json;charset=utf-8",
            "User-Agent": BUSINESS_UA,
            Referer: `https://servicewechat.com/${MINI_APP_ID}/page-frame.html`,
            Accept: "*/*",
        };
        if (auth && this.token) headers.Authorization = this.token;
        const res = await axios.request({
            method, url: `${API_HOST}${apiPath}`, data, params, headers,
            timeout: 20000, validateStatus: () => true,
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
    async login() {
        const code = await this.getCode();
        const res = await axios.request({
            method: "GET", url: `${API_HOST}${EP_LOGIN}`, params: { code },
            headers: {
                Host: "m.ahzyssl.com", "User-Agent": LOGIN_UA, Accept: "*/*",
                Referer: `https://servicewechat.com/${MINI_APP_ID}/page-frame.html`,
            },
            timeout: 20000, validateStatus: () => true,
        });
        const body = res.data || {};
        if (body.code === 200 && body.data) {
            this.token = String(body.data);
            const cache = readCache();
            cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
            writeCache(cache);
            this.log("登录成功");
            return;
        }
        const msg = body.msg || body.message || short(body);
        if (/未注册|未绑定|未激活|不存在|请先|注册/.test(String(msg))) {
            this.unregistered = true;
            throw new Error("NO_ACCOUNT:未注册甜润世界");
        }
        throw new Error(`登录失败(HTTP ${res.status}): ${msg}`);
    }
    async verify() {
        // 用 getUserBaseInfo 验证 ck；未注册的号这里往往拿不到 data
        try {
            const res = await this.request("GET", EP_USERINFO);
            if (res && res.code === 200 && res.data) {
                this.log(`ck 有效：${(res.data.userName || res.data.nickName || "用户")}`);
                return true;
            }
            const msg = res?.msg || res?.message || short(res);
            if (/未注册|未绑定|未激活|不存在|无权限|登录/.test(String(msg))) { this.unregistered = true; }
            this.log(`ck 验证异常：${short(res)}`);
            return false;
        } catch (e) {
            this.log(`ck 验证请求失败：${e.message || e}`);
            return false;
        }
    }
    async signAward() {
        // 主签到：签到有奖
        const rec = await this.request("GET", EP_SIGN_LOG);
        if (!rec || rec.code !== 200) {
            const msg = rec?.msg || rec?.message || short(rec);
            if (/未注册|未绑定|未激活|不存在|登录|授权/.test(String(msg))) this.unregistered = true;
            this.log(`❌ 查询签到有奖状态失败：${msg}`);
            return;
        }
        const list = (rec.data && rec.data.userSignInList) || [];
        const today = chinaToday();
        if (list.some((i) => i.signInDate === today && i.signInStatus === 1)) {
            this.signed = true;
            this.log("✅ 签到有奖：今日已签到");
            return;
        }
        const doSign = await this.request("POST", EP_SIGN, { data: {} });
        if (doSign && doSign.code === 200) {
            this.signed = true;
            this.log(`✅ 签到有奖：签到成功${doSign.msg ? `（${doSign.msg}）` : ""}`);
            return;
        }
        const msg = doSign?.msg || doSign?.message || short(doSign);
        if (/已签|签到过|重复|已完成/.test(String(msg))) {
            this.signed = true;
            this.log(`✅ 签到有奖：今日已签到（${msg}）`);
            return;
        }
        this.log(`❌ 签到有奖失败：${msg}`);
    }
    async dendrobiumSign() {
        // 次签到：石斛签到（best-effort，需先种植；不带作者邀请码）
        try {
            const info = await this.request("GET", EP_DEN_GET);
            let planted = !!(info && info.code === 200 && info.data);
            if (!planted && info && (info.code === 500 || /没有正在培养/.test(info.msg || ""))) {
                const sow = await this.request("GET", EP_DEN_SOW);
                planted = !!(sow && sow.code === 200);
                this.log(planted ? "🌱 石斛播种成功" : `🌱 石斛播种未成功：${sow?.msg || short(sow)}`);
            }
            const rec = await this.request("GET", EP_DEN_SIGN_LOG);
            if (rec && rec.data && rec.data.todaySignInStatus) {
                this.log("✅ 石斛签到：今日已签到");
                return;
            }
            const s = await this.request("GET", EP_DEN_SIGN);
            if (s && s.code === 200) {
                this.log(`✅ 石斛签到：签到成功${s.msg ? `（${s.msg}）` : ""}`);
                return;
            }
            const msg = s?.msg || s?.message || short(s);
            if (/已签|签到过|重复|已完成/.test(String(msg))) { this.log(`✅ 石斛签到：今日已签到（${msg}）`); return; }
            this.log(`⚠️ 石斛签到未成功：${msg}`);
        } catch (e) {
            this.log(`⚠️ 石斛签到跳过：${e.message || e}`);
        }
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            if (await this.verify()) { this.log("使用缓存token"); return; }
            this.token = ""; // 缓存失效，重新登录
        }
        if (!this.token) {
            await this.login();
            await this.verify();
        }
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            if (this.unregistered) {
                this.log("⚠️ 该微信号还没在甜润世界注册/激活会员，先在小程序里登录一次再跑");
                return;
            }
            await this.signAward();
            await this.dendrobiumSign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log("⚠️ 该微信号还没在甜润世界注册/激活会员，先在小程序里登录一次再跑");
                return;
            }
            this.log(`执行失败：${e.message || e}`);
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
