/*
------------------------------------------
@Description: 伊家乐享会（伊利数字化）- 微信小程序静默登录 + 每日签到
cron: 42 8 * * *
------------------------------------------
变量名：yjlxh
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxd606233dfaf91cae，host msmarket.msx.digitalyili.com/gateway/api）：

信封 {status, data, error, contextId}，成功 status===true。请求要带一组**微信云托管网关
模拟头**（X-WX-HTTP-MODE:REROUTE / x-wx-route-tag:<网关域> / x-envoy-expected-rq-timeout-ms
等）+ 固定头 tenant-id:1820778859526668290。网关域 a1d5e5ea9-wx621112590b635086.sh.wxgateway.com
（注意路由标签里的 appid 是伊利矩阵主号 wx621112590b635086，不是本店 appid）。

登录  POST /auth/account/login  {jsCode:<wx code>}
        -> data.{accessToken, userInfo, registerKey}
        **只有已注册会员才回 data.accessToken**；未注册时只回 registerKey + userInfo
        （userInfo 里没有会员身份，需走注册流程），此时无法签到。
        accessToken 之后放请求头 access-token。
资料  GET  /auth/account/user/info
积分  GET  /member/point
状态  GET  /member/sign/status ; 配置 /member/sign/config
签到  POST /member/daily/sign  {}   -> status===true 即成功

⚠️ 实测：登录链路 + 网关头**已实测连通**（服务端回 status:true 并给出 userInfo），
但本测试号未在伊家乐享会注册会员，服务端只回 registerKey 不发 accessToken，
因此签到接口未能实测，只按解包/采集契约实现。已注册的号跑起来即可验证。
不做：每日分享得分、上传微信步数、任务中心里的浏览/广告类任务。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("伊家乐享会");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "yjlxh";
const MINI_APP_ID = "wxd606233dfaf91cae";
const HOST = "https://msmarket.msx.digitalyili.com/gateway/api";
const TENANT_ID = "1820778859526668290";
const GATEWAY_DOMAIN = "a1d5e5ea9-wx621112590b635086.sh.wxgateway.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "yjlxh_token_cache.json");
const MOBILE_UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) " +
    "Mobile/15E148 MicroMessenger/8.0.58(0x18003a35) NetType/WIFI Language/zh_CN MiniProgramEnv/iOS";

const EP_LOGIN = "/auth/account/login";
const EP_USER = "/auth/account/user/info";
const EP_POINT = "/member/point";
const EP_SIGN_STATUS = "/member/sign/status";
const EP_SIGN = "/member/daily/sign";

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

function readCache() {
    try {
        if (!fs.existsSync(TOKEN_CACHE_FILE)) return {};
        return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {};
    } catch (e) {
        return {};
    }
}

function writeCache(cache) {
    try {
        fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
    } catch (e) {
        $.log(`写入token缓存失败: ${e.message || e}`);
    }
}

function parseAccount(raw = "") {
    const [id, remark] = String(raw).split("#").map((s) => (s || "").trim());
    return { openid: id, remark: remark || "" };
}

function short(v, n = 200) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}

const isOk = (res) => !!res && res.status === true;
const msgOf = (res) => res?.error || res?.message || res?.msg || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isAuthError = (res) => /token|登录|未授权|失效|过期|401/i.test(msgOf(res));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    gatewayHeaders() {
        const callId = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
        return {
            "X-WX-HTTP-MODE": "REROUTE",
            "X-WX-CONF-VERSION": "0",
            "x-wx-call-id": callId,
            "x-wx-route-tag": GATEWAY_DOMAIN,
            "x-envoy-expected-rq-timeout-ms": "15000",
        };
    }

    async request(apiPath, { method = "GET", body = null, query = null, token = "" } = {}) {
        const headers = {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            Origin: "https://servicewechat.com",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/122/page-frame.html`,
            "User-Agent": MOBILE_UA,
            "access-token": token || "",
            scene: "",
            "source-type": "",
            "tenant-id": TENANT_ID,
            xweb_xhr: "1",
            ...this.gatewayHeaders(),
        };
        const isGet = method.toUpperCase() === "GET";
        const qs = isGet && query
            ? "?" + Object.entries(query).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")
            : "";
        const res = await axios.request({
            method,
            url: `${HOST}${apiPath}${qs}`,
            data: isGet ? undefined : body || {},
            headers,
            timeout: 20000,
            validateStatus: () => true,
        });
        if (res.status !== 200) {
            if (res.data && typeof res.data === "object") return res.data;
            throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        }
        return res.data;
    }

    /** wcs.getCode 在 status:false 时也 resolve，必须自己判失败，否则取码限流会被误报成登录失败 */
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) {
            throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        }
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }

    async login() {
        const code = await this.getCode();
        const res = await this.request(EP_LOGIN, { method: "POST", body: { jsCode: code } });
        if (!isOk(res)) throw new Error(`登录失败: ${msgOf(res)}`);
        const d = res.data || {};
        this.token = String(d.accessToken || "");
        if (!this.token) {
            // 只回 registerKey 不回 accessToken = 该微信号未注册会员
            this.unregistered = !!d.registerKey;
            throw new Error("NO_TOKEN");
        }
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }

    /** 读积分/签到状态；会话失效返回 null */
    async signStatus(needLog = true) {
        const res = await this.request(EP_SIGN_STATUS, { token: this.token });
        if (!isOk(res)) {
            if (isAuthError(res)) return null;
            if (needLog) this.log(`读取签到状态失败: ${msgOf(res)}`);
            return { failed: true, res };
        }
        const d = res.data || {};
        if (needLog) {
            const pt = await this.request(EP_POINT, { token: this.token });
            const point = isOk(pt) ? (pt.data && (pt.data.point ?? pt.data.total ?? pt.data.amount)) : undefined;
            this.log(`签到状态: ${short(d, 100)}${point !== undefined ? `，积分 ${point}` : ""}`);
        }
        // 常见字段：todaySigned / signed / isSign
        const signed = d.todaySigned === true || d.signed === true || d.isSign === true || Number(d.signStatus) === 1;
        return { signed, data: d };
    }

    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            const s = await this.signStatus(false);
            if (s !== null) {
                this.log("使用缓存token");
                return s;
            }
            this.log("缓存token失效，重新登录");
            this.token = "";
        }
        if (!this.token) await this.login();
        return null;
    }

    async sign(pre) {
        if (pre === null || pre === undefined) pre = await this.signStatus();
        if (pre === null) {
            this.log("❌ 会话无效，签到跳过");
            return;
        }
        if (pre.failed) {
            this.log(`❌ 读取签到状态失败: ${msgOf(pre.res)}`);
            return;
        }
        if (pre.signed) {
            this.log("✅ 今日已签到");
            return;
        }
        const res = await this.request(EP_SIGN, { method: "POST", body: {}, token: this.token });
        if (isOk(res)) {
            const d = res.data || {};
            const gain = d.point ?? d.score ?? d.addPoint;
            this.log(`✅ 签到成功${gain !== undefined ? `，+${gain}` : ""}`);
            return;
        }
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        this.log(`❌ 签到失败: ${msgOf(res)}`);
    }

    async run() {
        if (!this.account.openid) {
            this.log("跳过：变量值里没有 openid");
            return;
        }
        try {
            const pre = await this.ensureLogin();
            await this.sign(pre);
        } catch (e) {
            if (String(e.message) === "NO_TOKEN") {
                this.log("⚠️ 登录成功但服务端只发 registerKey 没发 access-token —— 该微信号还没在伊家乐享会注册会员，先在小程序里注册一次再跑");
                return;
            }
            this.log(`执行失败: ${e.message || e}`);
        }
    }
}

!(async () => {
    $.checkEnv(ckName);
    if (!$.userCount) {
        $.log(`未找到变量 ${ckName}`);
        return;
    }
    for (let i = 0; i < $.userList.length; i++) {
        await new Task($.userList[i]).run();
        if (i < $.userList.length - 1) await $.wait(1500, 3000);
    }
})()
    .catch((e) => $.log(e.message || e))
    .finally(() => $.done());
