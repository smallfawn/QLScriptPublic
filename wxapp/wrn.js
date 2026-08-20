/*
------------------------------------------
@Description: 薇诺娜专柜商城 - 微信小程序静默登录 + 每日签到
cron: 41 8 * * *
------------------------------------------
变量名：wrn
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx250394ab3f680bfa，host api.qiumeiapp.com；迁移自 YYB-GO 系脚本，原脚本已 code 登录）：

登录三步：
  1) wx_server 取 wx.login code
  2) 用 code 换明文 openId/unionId：GET https://zhls.qq.com/wxlogin/getOpenId?appid=&js_code=
       -> 返回 {openId, unionId}（腾讯侧 jscode2session 中转，非个人凭证）
  3) wx_server 取新式手机号 phoneCode，快速登录：
       POST https://api.qiumeiapp.com/zgxcx/10001/zgxcxUserFastLogin (x-www-form-urlencoded)
       body: code=<phoneCode>&unionid=<unionId>&xcxOpenid=<openId>&zgCounterId=0&vm1Code=&registerSource=0
       -> code==200，data.zgUserToken（=后续 appUserToken）
签到  POST https://api.qiumeiapp.com/zg-activity/zg-daily/zgSigninNew (form) appUserToken=<token>
        -> code==200 签到成功 / code==703 今日已签 / code==600 token失效(自动重登)
zgCounterId/vm1Code/registerSource/sysCode 均为应用级固定常量（原脚本硬编码，非个人凭证）。
手机号采用"新式 phoneCode"（服务端用小程序自身 access_token 换手机号，不与 wx.login code 配对），可迁移。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("薇诺娜签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "wrn";
const MINI_APP_ID = "wx250394ab3f680bfa";
const WX_SERVER_URL = process.env.wx_server_url || "http://192.168.31.196:8787";
const WX_AUTH = process.env.wx_auth || "";

const GETOPENID_URL = "https://zhls.qq.com/wxlogin/getOpenId";
const LOGIN_URL = "https://api.qiumeiapp.com/zgxcx/10001/zgxcxUserFastLogin";
const BASE_URL = "https://api.qiumeiapp.com/zg-activity/zg-daily/";
const EP_SIGN = "zgSigninNew";
const TOKEN_CACHE_FILE = path.join(__dirname, "wrn_token_cache.json");
const UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) " +
    "Mobile/15E148 MicroMessenger/8.0.56(0x18003830) NetType/WIFI Language/zh_CN";

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
function short(v, n = 240) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}

const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isTokenBad = (t) => /token|登录|未授权|失效|过期|未登录|鉴权|重新登陆|重新登录/i.test(String(t || ""));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
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
    async getOpenIdUnionId(jsCode) {
        const res = await axios.request({
            method: "GET", url: GETOPENID_URL, params: { appid: MINI_APP_ID, js_code: jsCode },
            headers: { "User-Agent": UA, Accept: "*/*", Referer: `https://servicewechat.com/${MINI_APP_ID}/637/page-frame.html` },
            timeout: 20000, validateStatus: () => true,
        });
        const d = (res && res.data) || {};
        const openId = d.openId || d.openid || d.OpenId;
        const unionId = d.unionId || d.unionid || d.UnionId;
        if (!openId || !unionId) throw new Error(`getOpenId 换取失败(HTTP ${res.status}): ${short(d)}`);
        return { openId: String(openId), unionId: String(unionId) };
    }
    async getPhoneCode() {
        const res = await axios.request({
            method: "POST", url: `${WX_SERVER_URL}/wx/getphonenumber`,
            data: { openid: this.account.openid, appid: MINI_APP_ID },
            headers: { auth: WX_AUTH, "Content-Type": "application/json" },
            timeout: 30000, validateStatus: () => true,
        });
        const d = (res && res.data) || {};
        if (d.status === false) throw new Error(`取手机号失败: ${d.message || short(d)}`);
        const code = d.code || d?.data?.code || d.phoneCode || d?.raw?.code;
        if (!code || typeof code !== "string") throw new Error(`取手机号未返回 phoneCode: ${short(d)}`);
        return code;
    }
    async login() {
        const jsCode = await this.getCode();
        const { openId, unionId } = await this.getOpenIdUnionId(jsCode);
        this.log(`换取 openId/unionId 成功`);
        const phoneCode = await this.getPhoneCode();
        this.log(`取手机号 phoneCode 成功`);
        const form =
            `code=${encodeURIComponent(phoneCode)}` +
            `&unionid=${encodeURIComponent(unionId)}` +
            `&xcxOpenid=${encodeURIComponent(openId)}` +
            `&zgCounterId=0&vm1Code=&registerSource=0`;
        const res = await axios.request({
            method: "POST", url: LOGIN_URL, data: form,
            headers: {
                Host: "api.qiumeiapp.com", "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": UA, Accept: "*/*",
                Referer: `https://servicewechat.com/${MINI_APP_ID}/753/page-frame.html`,
            },
            timeout: 20000, validateStatus: () => true,
        });
        const d = (res && res.data) || {};
        const token = (d.data && (d.data.zgUserToken || d.data.token || d.data.appUserToken)) || d.zgUserToken;
        if (Number(d.code) === 200 && token) {
            this.token = String(token);
            const cache = readCache();
            cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
            writeCache(cache);
            this.log("登录成功");
            return;
        }
        throw new Error(`登录失败(code=${d.code}): ${d.msg || d.message || short(d)}`);
    }
    async signRequest() {
        const res = await axios.request({
            method: "POST", url: `${BASE_URL}${EP_SIGN}`, data: `appUserToken=${encodeURIComponent(this.token)}`,
            headers: {
                Host: "api.qiumeiapp.com", "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": UA, Accept: "*/*",
                Referer: `https://servicewechat.com/${MINI_APP_ID}/637/page-frame.html`,
            },
            timeout: 20000, validateStatus: () => true,
        });
        return (res && res.data) || {};
    }
    async sign(retry = true) {
        const d = await this.signRequest();
        const code = Number(d.code);
        if (code === 200) return this.log(`✅ 签到成功${d.data && d.data.integral !== undefined ? `，积分 ${d.data.integral}` : ""}`);
        if (code === 703) return this.log(`✅ 今日已签到`);
        const msg = d.msg || d.message || short(d);
        if (isAlreadyDone(msg)) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && (code === 600 || isTokenBad(msg))) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            return this.sign(false);
        }
        this.log(`❌ 签到失败(code=${d.code}): ${msg}`);
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
            const m = String(e.message || e);
            if (/getOpenId 换取失败/.test(m)) { this.log(`⚠️ 无法用 code 换取明文 openId/unionId：${m}`); return; }
            if (/取手机号/.test(m)) { this.log(`⚠️ 该微信号未开通手机号授权或取号失败：${m}`); return; }
            this.log(`执行失败: ${m}`);
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
