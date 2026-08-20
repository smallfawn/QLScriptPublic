/*
------------------------------------------
@Description: 金典有机生活 - 微信小程序静默登录 + 每日签到
cron: 30 11 * * *
------------------------------------------
变量名：jdyj
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxf32616183fb4511e，host msmarket.msx.digitalyili.com）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录；纯 code 登录，无签名机制）

判定成功：data.status===true 或 data.success===true
登录  POST /auth/account/login {jsCode: code}（头不带 token）
        -> data.data.accessToken（=后续 token，放请求头 access-token）
状态  GET  /member/sign/status  -> data.data.signed / data.data.signedDays
签到  POST /member/daily/sign  {}  -> data.data.dailySign.{bonusPoint,bonusGrowth}
用户  GET  /auth/account/user/info  （校验缓存 token 是否有效）

请求头（数字化伊利网关直连，非个人凭证的固定应用常量）：
  access-token=<token>，tenant-id=1718857849685876737，scene=1008
  X-WX-HTTP-MODE:REROUTE / x-wx-route-tag:<GATEWAY_DOMAIN> / x-wx-appid:<APPID> 等网关模拟头
TENANT_ID / GATEWAY_DOMAIN 是这家小程序固定应用常量（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("金典有机生活签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "jdyj";
const MINI_APP_ID = "wxf32616183fb4511e";
const HOST = "https://msmarket.msx.digitalyili.com/gateway/api";
const GATEWAY_DOMAIN = "a1d5e7a41-wx621112590b635086.sh.wxgateway.com";
const TENANT_ID = "1718857849685876737";
const SCENE = "1008";
const TOKEN_CACHE_FILE = path.join(__dirname, "jdyj_token_cache.json");
const UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) " +
    "Mobile/15E148 MicroMessenger/8.0.58(0x18003a35) NetType/WIFI MiniProgramEnv/iOS";

const EP_LOGIN = "/auth/account/login";
const EP_USERINFO = "/auth/account/user/info";
const EP_SIGN_STATUS = "/member/sign/status";
const EP_SIGN = "/member/daily/sign";

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
function short(v, n = 240) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function randomStr(n) {
    const cs = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: n }, () => cs[Math.floor(Math.random() * cs.length)]).join("");
}
function isSuccess(d) {
    return Boolean(d && typeof d === "object" && (d.status === true || d.success === true));
}
function errMsg(d) {
    if (!d) return "未知错误";
    if (typeof d === "string") return d;
    return d.message || d.msg || (d.error && (d.error.msg || d.error.message)) || short(d);
}
const isAlreadyDone = (t) => /已签到|已领取|已完成|今日已|已经|重复|repeat/i.test(String(t || ""));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    buildHeaders(withToken = true) {
        return {
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Content-Type": "application/json",
            Origin: "https://servicewechat.com",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/release/page-frame.html`,
            "User-Agent": UA,
            "access-token": withToken ? String(this.token || "") : "",
            "atv-page": "",
            "forward-appid": "",
            "register-source": "",
            scene: SCENE,
            "source-type": "",
            "tenant-id": TENANT_ID,
            xweb_xhr: "1",
            "X-WX-HTTP-MODE": "REROUTE",
            "X-WX-CONF-VERSION": "0",
            "x-wx-call-id": `${Date.now()}-${randomStr(8)}`,
            "x-wx-route-tag": GATEWAY_DOMAIN,
            "x-wx-source": "wx_client",
            "x-wx-appid": MINI_APP_ID,
            "x-envoy-expected-rq-timeout-ms": "15000",
        };
    }
    async request(apiPath, { method = "GET", body = null, withToken = true } = {}) {
        let url = `${HOST}${apiPath}`;
        const isGet = method.toUpperCase() === "GET";
        const opts = {
            method,
            url,
            headers: this.buildHeaders(withToken),
            timeout: 20000,
            validateStatus: () => true,
        };
        if (!isGet) opts.data = JSON.stringify(body ?? {});
        const res = await axios.request(opts);
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
        const res = await this.request(EP_LOGIN, { method: "POST", body: { jsCode: code }, withToken: false });
        if (!isSuccess(res)) throw new Error(`登录失败: ${errMsg(res)}`);
        const info = res.data || {};
        this.token = String(info.accessToken || info.token || "");
        if (!this.token) throw new Error(`登录未返回 accessToken（可能未注册）: ${short(res)}`);
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            const test = await this.request(EP_USERINFO, { method: "GET" }).catch(() => null);
            if (isSuccess(test)) { this.log("使用缓存token"); return; }
            this.log("缓存token失效，重新登录");
            this.token = "";
        }
        if (!this.token) await this.login();
    }
    async sign(retry = true) {
        // 先查状态，已签直接返回
        const st = await this.request(EP_SIGN_STATUS, { method: "GET" });
        if (isSuccess(st) && st.data && st.data.signed) {
            return this.log(`✅ 今日已签到，累计 ${st.data.signedDays ?? "?"} 天`);
        }
        // 状态查询失败若为鉴权问题则重登
        if (!isSuccess(st)) {
            const smsg = errMsg(st);
            if (retry && /token|登录|未授权|失效|过期|未登录|鉴权|401|unauthorized/i.test(String(smsg))) {
                this.log("会话失效，重新登录后重试");
                this.token = "";
                await this.login();
                return this.sign(false);
            }
        }
        const res = await this.request(EP_SIGN, { method: "POST", body: {} });
        if (isSuccess(res)) {
            const d = res.data || {};
            const ds = d.dailySign || {};
            const cont = d.continuationSign || {};
            const parts = [];
            if (Number(ds.bonusPoint)) parts.push(`+${ds.bonusPoint}积分`);
            if (Number(ds.bonusGrowth)) parts.push(`+${ds.bonusGrowth}成长值`);
            if (Number(cont.bonusPoint)) parts.push(`连签+${cont.bonusPoint}积分`);
            if (Number(cont.bonusGrowth)) parts.push(`连签+${cont.bonusGrowth}成长值`);
            return this.log(`✅ 签到成功${parts.length ? "，" + parts.join("，") : ""}`);
        }
        const msg = errMsg(res);
        if (isAlreadyDone(msg)) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && /token|登录|未授权|失效|过期|未登录|鉴权|401|unauthorized/i.test(String(msg))) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msg}`);
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            const m = String(e.message || e);
            if (/未注册|未返回 accessToken/.test(m)) {
                this.log("⚠️ 该微信号还没在金典有机生活注册会员，先在小程序里登录注册一次再跑");
                return;
            }
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
