/*
------------------------------------------
@Description: 旧衣小二（旧衣回收）- 微信小程序登录 + 每日签到
cron: 38 8 * * *
------------------------------------------
变量名：jyxe
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值

可选开关：
jyxe_phone_login  默认 1。这家的登录接口**必须带手机号授权 code**（见下），
                  置 0 则不走手机号授权，只能用缓存 token 跑（首登会失败）。
------------------------------------------
契约（appid wx426d52c8130b8559，host jiuyixiaoer.fzjingzhou.com）：

请求全部 form 编码 + 固定头 platform: MP-WEIXIN。
**token 不是请求头，是 body 参数 `token`**；未登录时用包里那个占位值
wek2020123456788wek（解包 f552 模块的请求拦截器里写死的 noauth token）。
信封 {code, msg, time, token, data}，**成功码 1000**，1001 是业务失败。

登录  POST /api/login/wxMiniProgramOauth
        form: code=<wx.login code>&phoneCode=<手机号授权 code>&token=wek2020123456788wek
        **必须带 phoneCode**：只发 code 时服务端 PHP 直接报
        {"code":1001,"msg":"Undefined index: phoneCode"} —— 这个报错把缺的参数名暴露出来了。
        -> data.token（后续会话）+ data.personInfo{score, sign_in_num, days, mobile, ...}
状态  POST /api/Person/index   form: token=<token>
        -> data.sign_in_num（今日签到次数，>0 视为已签），score 是积分
签到  POST /api/Person/sign    form: token=<token>
        -> code==1000 且 data=="1" 即成功；重复签到回 {code:1001,"今日已签到"}

实测（2026-08-19）：登录成功 → 签到成功，积分 30→31、sign_in_num 0→1，
复签回「今日已签到」。缓存 token 可直接读 /api/Person/index，**不必每次都烧手机号授权**。
不做：金币/兑换/邀请等其它任务。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("旧衣小二");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "jyxe";
const MINI_APP_ID = "wx426d52c8130b8559";
const BASE = "https://jiuyixiaoer.fzjingzhou.com";
const NOAUTH_TOKEN = "wek2020123456788wek";
const PHONE_LOGIN = String(process.env.jyxe_phone_login ?? "1") !== "0";
const TOKEN_CACHE_FILE = path.join(__dirname, "jyxe_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x28003036) MiniProgramEnv/android";

const EP_LOGIN = "/api/login/wxMiniProgramOauth";
const EP_INDEX = "/api/Person/index";
const EP_SIGN = "/api/Person/sign";

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

function form(obj) {
    return Object.entries(obj)
        .map(([k, v]) => `${k}=${encodeURIComponent(v === undefined || v === null ? "" : v)}`)
        .join("&");
}

function maskPhone(p = "") {
    return String(p).replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

const isOk = (res) => Number(res?.code) === 1000;
const msgOf = (res) => res?.msg || res?.message || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isAuthError = (t) => /登录|token|未授权|未登录|失效|过期|重新/i.test(String(t || ""));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    async request(apiPath, body = {}) {
        const res = await axios.request({
            method: "POST",
            url: `${BASE}${apiPath}`,
            data: form(body),
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                platform: "MP-WEIXIN",
                Accept: "application/json, text/plain, */*",
                "User-Agent": USER_AGENT,
                Referer: `https://servicewechat.com/${MINI_APP_ID}/0/page-frame.html`,
                xweb_xhr: "1",
            },
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

    /** 手机号授权 code —— 这家登录接口的必填项。wcs.js 只有 getCode，这里自己发 /wx/getphonenumber */
    async getPhoneCode() {
        const url = (process.env.wx_server_url || "http://192.168.31.196:8787") + "/wx/getphonenumber";
        const res = await axios.request({
            method: "POST",
            url,
            data: { appid: MINI_APP_ID, openid: this.account.openid },
            headers: { auth: process.env.wx_auth || "" },
            timeout: 30000,
            validateStatus: () => true,
        });
        const data = res.data || {};
        if (data.status === false) {
            throw new Error(`wx_server 取手机号授权code失败: ${data.message || short(data)}`);
        }
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回手机号code: ${short(data)}`);
        return code;
    }

    async login() {
        if (!PHONE_LOGIN) {
            throw new Error("缓存token无效且 jyxe_phone_login=0：这家首登必须手机号授权，置 1 后重跑");
        }
        const code = await this.getCode();
        const phoneCode = await this.getPhoneCode();
        const res = await this.request(EP_LOGIN, { code, phoneCode, token: NOAUTH_TOKEN });
        if (!isOk(res)) throw new Error(`登录失败: ${msgOf(res)}`);
        const d = res.data || {};
        this.token = String(d.token || "");
        if (!this.token) throw new Error(`登录未返回 token: ${short(res)}`);
        const pi = d.personInfo || {};
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${pi.mobile ? `: ${maskPhone(pi.mobile)}` : ""}`);
        return pi;
    }

    /** 读个人信息；会话失效返回 null */
    async personIndex(needLog = true) {
        const res = await this.request(EP_INDEX, { token: this.token });
        if (!isOk(res)) {
            if (needLog && !isAuthError(msgOf(res))) this.log(`读取个人信息失败: ${msgOf(res)}`);
            return null;
        }
        const d = res.data || {};
        if (needLog) {
            this.log(`积分 ${d.score ?? "-"}，加入 ${d.days ?? "-"} 天，今日签到次数 ${d.sign_in_num ?? "-"}`);
        }
        return d;
    }

    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            const d = await this.personIndex(false);
            if (d !== null) {
                this.log("使用缓存token");
                return d;
            }
            this.log("缓存token失效，重新登录");
            this.token = "";
        }
        if (!this.token) return await this.login();
        return null;
    }

    async sign(pre) {
        if (pre === null || pre === undefined) pre = await this.personIndex();
        if (pre === null) {
            this.log("❌ 会话无效，签到跳过");
            return;
        }
        if (Number(pre.sign_in_num || 0) > 0) {
            this.log("✅ 今日已签到");
            return;
        }
        const res = await this.request(EP_SIGN, { token: this.token });
        if (isOk(res)) {
            this.log("✅ 签到成功");
            await this.personIndex();
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
