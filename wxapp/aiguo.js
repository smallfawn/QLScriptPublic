/*
------------------------------------------
@Description: 爱裹旧衣回收 - 微信小程序静默登录 + 每日签到
cron: 46 8 * * *
------------------------------------------
变量名：aiguo
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx4ff260333d3c5ddd，host alipay.haliaeetus.cn）：

一个 host 下按模块分前缀：回收侧 /recy/...、福利积分侧 /fuli/...（解包 globalRequest
的第 4 个参数就是这个前缀）。信封 {status, msg, data}，**成功码 200**，401 是没权限。
固定头：Authorization:<token 裸值> / plateForm:WX / channelNo:"" / content-type:json

时间戳 GET  /fuli/currentTime            -> 响应体就是**裸的毫秒时间戳文本**（不是 JSON）
登录  POST /recy/api/user/identityIdByAuthCode
        {data:{authCode:<wx code>}, m:<上面的时间戳>, s:<签名>}
        签名很别致（解包 main.js 的 prototype.sign）：
          s = md5( (m + JSON.stringify(data)) 这个串**按字符排序**后 trim )
        —— 是把字符串的字符逐个排序再 md5，没有盐。
        -> data.{identityId, unionId, accessToken, token?}
        **只有已注册的账号才会回 data.token**，它才是后续所有请求的 Authorization。
        未注册时只有 identityId/accessToken，拿它们去打业务接口一律
        {status:401,"No access,Permission verification failed!"}
        （源码里这种情况会走 getRegisterCellphoneAuthCode 手机号注册，脚本不代做）

状态  GET  /fuli/api/fuli/signedInfo     -> 今日签到状态（需 token）
签到  GET  /fuli/api/fuli/signed         -> status==200 即签到成功
积分  POST /fuli/api/jf/account          -> 积分账户

⚠️ 实测状态：登录链路+签名**已实测通过**（服务端回 200 并给出 identityId）；
但本测试号未在爱裹注册，服务端不发 token，因此**签到接口本身未能实测**，
只按解包契约实现。已注册的号跑起来即可验证。
不做：/api/earnPoint/doTask（做任务赚积分）、/api/clockIn/add1（另一套打卡）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("爱裹旧衣回收");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "aiguo";
const MINI_APP_ID = "wx4ff260333d3c5ddd";
const BASE = "https://alipay.haliaeetus.cn";
const TOKEN_CACHE_FILE = path.join(__dirname, "aiguo_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x28003036) MiniProgramEnv/android";

const EP_TIME = "/fuli/currentTime";
const EP_LOGIN = "/recy/api/user/identityIdByAuthCode";
const EP_SIGN_INFO = "/fuli/api/fuli/signedInfo";
const EP_SIGN = "/fuli/api/fuli/signed";
const EP_ACCOUNT = "/fuli/api/jf/account";

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

const md5 = (s) => crypto.createHash("md5").update(String(s), "utf8").digest("hex");
/** 解包里的 sign()：把字符串的字符排序后拼回去再 trim */
const sortChars = (s) => String(s).split("").sort().join("").replace(/^\s+|\s+$/g, "");

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

const isOk = (res) => res && Number(res.status) === 200;
const statusOf = (res) => Number(res?.status);
const msgOf = (res) => res?.msg || res?.message || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
/** 401 = 没有有效 token（未注册或会话过期都会走到这里） */
const isNoAccess = (res) => statusOf(res) === 401 || /No access|Permission verification/i.test(msgOf(res));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    async request(apiPath, { method = "GET", body = null, withAuth = true, raw = false } = {}) {
        const headers = {
            "Content-Type": "application/json",
            Accept: "*/*",
            "User-Agent": USER_AGENT,
            Referer: `https://servicewechat.com/${MINI_APP_ID}/245/page-frame.html`,
            plateForm: "WX",
            channelNo: "",
            xweb_xhr: "1",
        };
        headers.Authorization = withAuth ? this.token || "" : "";
        const res = await axios.request({
            method,
            url: `${BASE}${apiPath}`,
            data: method === "GET" ? undefined : body || {},
            headers,
            timeout: 20000,
            validateStatus: () => true,
        });
        if (res.status !== 200) {
            if (res.data && typeof res.data === "object") return res.data;
            throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        }
        // /fuli/currentTime 回的是裸时间戳文本，不是 JSON
        return raw ? String(res.data).trim() : res.data;
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
        const m = await this.request(EP_TIME, { withAuth: false, raw: true });
        if (!/^\d{10,}$/.test(m)) throw new Error(`currentTime 不是时间戳: ${short(m, 60)}`);
        const data = { authCode: code };
        const s = md5(sortChars(`${m}${JSON.stringify(data)}`));
        const res = await this.request(EP_LOGIN, { method: "POST", withAuth: false, body: { data, m, s } });
        if (!isOk(res)) throw new Error(`登录失败: ${msgOf(res)}`);
        const d = res.data || {};
        this.token = String(d.token || "");
        if (!this.token) {
            // 服务端明确只回 identityId/accessToken，没有 token —— 这是"未注册"的表现
            this.unregistered = !!d.identityId;
            throw new Error("NO_TOKEN");
        }
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }

    /** 读今日签到状态；没权限返回 null */
    async signedInfo(needLog = true) {
        const res = await this.request(EP_SIGN_INFO);
        if (!isOk(res)) {
            if (needLog && !isNoAccess(res)) this.log(`读取签到状态失败: ${msgOf(res)}`);
            return null;
        }
        const d = res.data;
        if (needLog) this.log(`签到状态: ${short(d, 120)}`);
        return d === undefined || d === null ? {} : d;
    }

    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            if ((await this.signedInfo(false)) !== null) {
                this.log("使用缓存token");
                return;
            }
            this.log("缓存token失效，重新登录");
            this.token = "";
        }
        if (!this.token) await this.login();
    }

    async sign() {
        const res = await this.request(EP_SIGN);
        if (isOk(res)) {
            this.log("✅ 签到成功");
            const acc = await this.request(EP_ACCOUNT, { method: "POST", body: {} });
            if (isOk(acc)) this.log(`积分: ${short(acc.data, 100)}`);
            return;
        }
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        if (isNoAccess(res)) {
            this.log(`⚠️ ${msgOf(res)} —— 会话没有权限，多半是该微信号还没在爱裹注册（注册要手机号），先在小程序里注册一次再跑`);
            return;
        }
        this.log(`❌ 签到失败: ${msgOf(res)}`);
    }

    async run() {
        if (!this.account.openid) {
            this.log("跳过：变量值里没有 openid");
            return;
        }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (String(e.message) === "NO_TOKEN") {
                this.log("⚠️ 登录成功但服务端没发 token —— 该微信号还没在爱裹注册会员（注册要手机号），先在小程序里注册一次再跑");
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
