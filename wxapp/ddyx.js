/*
------------------------------------------
@Description: 铛铛一下(旧衣服回收) - 微信小程序静默登录 + 每日签到
cron: 32 8 * * *
------------------------------------------
变量名：ddyx
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxe378d2d7636c180e，host vues.dd1x.cn）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录；鉴权用 token，放在请求头 token 里）

登录  GET /wechat/login?code=<code>&channelId=154  （头不带 token）
        -> 返回 token（token/accessToken/access_token/jwt，可能在 data / data.data / data.data.user 层）
签到  GET /api/v2/sign_join  头 token:<token>
        -> code==0 成功，data.name（签到名称）；重复签到 code!=0 且 msg 含"已签"类提示
CHANNEL_ID(154) 是该小程序渠道应用常量（原脚本默认值，非个人凭证）。
说明：原脚本还含抽奖/查余额/提现(移动真实资金)逻辑，签到脚本仅保留每日签到，
      不迁移提现等资金操作。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("铛铛一下签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "ddyx";
const MINI_APP_ID = "wxe378d2d7636c180e";
const BASE_URL = "https://vues.dd1x.cn";
const CHANNEL_ID = process.env.DD1X_CHANNEL_ID || "154";
const PAGE_VERSION = "824";
const TOKEN_CACHE_FILE = path.join(__dirname, "ddyx_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/wechat/login";
const EP_SIGN = "/api/v2/sign_join";

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
function extractToken(data) {
    if (!data || typeof data !== "object") return "";
    const keys = ["token", "accessToken", "access_token", "jwt"];
    const layers = [data, data.data && typeof data.data === "object" ? data.data : null];
    const inner = data.data && typeof data.data === "object" ? data.data : {};
    if (inner.user && typeof inner.user === "object") layers.push(inner.user);
    for (const layer of layers) {
        if (!layer) continue;
        for (const k of keys) {
            const v = layer[k];
            if (v && String(v) !== "null" && String(v) !== "undefined") return String(v);
        }
    }
    return "";
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
    headers(withToken = false) {
        const h = {
            "User-Agent": UA,
            "Content-Type": "application/json",
            Accept: "*/*",
            xweb_xhr: "1",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            "Accept-Language": "zh-CN,zh;q=0.9",
        };
        if (withToken && this.token) h.token = this.token;
        return h;
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
            method: "GET", url: `${BASE_URL}${EP_LOGIN}`,
            params: { code, channelId: CHANNEL_ID },
            headers: this.headers(false), timeout: 20000, validateStatus: () => true,
        });
        const body = res.data || {};
        this.token = extractToken(body);
        if (!this.token) {
            const msg = (body && (body.msg || body.message)) || short(body);
            // 登录返回但拿不到 token：可能该微信号未注册/未绑定
            if (/注册|未绑定|绑定|授权|激活|会员|实名/.test(String(msg))) {
                this.unregistered = true;
                throw new Error(`NO_ACCOUNT:${msg}`);
            }
            throw new Error(`登录未返回 token（可能未注册）: ${short(body)}`);
        }
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    isAuthErr(resp) {
        const code = Number(resp && resp.code);
        const msg = String((resp && (resp.msg || resp.message)) || "");
        if ([401, 403, 4001, 4003, 10401].includes(code)) return true;
        return /token|登录|未授权|失效|过期|未登录|鉴权|会话|请先登录/i.test(msg);
    }
    async sign(retry = true) {
        const res = await axios.request({
            method: "GET", url: `${BASE_URL}${EP_SIGN}`,
            headers: this.headers(true), timeout: 20000, validateStatus: () => true,
        });
        const body = res.data || {};
        if (Number(body.code) === 0) {
            const d = body.data || {};
            const name = (d && (d.name || d.title)) || "";
            return this.log(`✅ 签到成功${name ? `：${name}` : ""}`);
        }
        const msg = body.msg || body.message || short(body);
        if (/已签|签到过|重复|已完成|已参与|今日/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && this.isAuthErr(body)) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            return this.sign(false);
        }
        if (/注册|未绑定|绑定|激活|会员|实名/.test(String(msg))) { this.unregistered = true; throw new Error(`NO_ACCOUNT:${msg}`); }
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
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在铛铛一下注册/绑定（${String(e.message).replace(/^NO_ACCOUNT:/, "")}），先在小程序里登录一次再跑`);
                return;
            }
            if (/未返回 token/.test(String(e.message))) { this.log("⚠️ 登录未拿到 token（该微信号可能未注册铛铛一下），先在小程序里注册一次再跑"); return; }
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
