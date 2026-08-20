/*
------------------------------------------
@Description: 一汽丰田丰享汇 - 微信小程序静默登录 + 会员签到
cron: 28 8 * * *
------------------------------------------
变量名：fxh
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxdc0171c19d8ff575，host fxh.ftms.com.cn）：
  登录  POST /fxh-bff/app/wx/scx/login
        {jsCode:<code>, nickName:"微信用户", gender:0, language/city/province/country:"",
         avatarUrl:"", iv:"", signature:"", headImg:""}
        -> code==200, data.token；同时把 token 放进请求头 Authorization 和 sessionKey
           昵称在 data.customerInfoCacheDto.name
  积分  POST /fxh-bff/app/membership/pointsSum
  签到  POST /fxh-bff/app/membership/signIn      -> code==200 成功
注：原始实现里 signature 是一串写死的 sha1（别人抓包留下的用户资料签名），
    这里留空——那个值对本账号没有意义，也不该照抄别人的。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("一汽丰田丰享汇");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "fxh";
const MINI_APP_ID = "wxdc0171c19d8ff575";
const BASE = "https://fxh.ftms.com.cn";
const TOKEN_CACHE_FILE = path.join(__dirname, "fxh_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x28003036) MiniProgramEnv/android";

const EP_LOGIN = "/fxh-bff/app/wx/scx/login";
const EP_POINTS = "/fxh-bff/app/membership/pointsSum";
const EP_SIGN = "/fxh-bff/app/membership/signIn";

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

function short(v, n = 220) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}

const isOk = (res) => Number(res?.code) === 200 || res?.success === true;
const msgOf = (res) => res?.message || res?.msg || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|already/i.test(String(t || ""));
const isAuthError = (t) => /登录|token|未授权|失效|过期|重新|401/i.test(String(t || ""));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.name = "";
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    async request(apiPath, data = {}) {
        const res = await axios.request({
            method: "POST",
            url: `${BASE}${apiPath}`,
            data,
            headers: {
                "Content-Type": "application/json",
                "User-Agent": USER_AGENT,
                Referer: `https://servicewechat.com/${MINI_APP_ID}/0/page-frame.html`,
                ...(this.token ? { Authorization: this.token, sessionKey: this.token } : {}),
            },
            timeout: 20000,
            validateStatus: () => true,
        });
        if (res.status !== 200) throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        return res.data;
    }

    /** wcs.getCode 在 status:false 时也 resolve，必须自己判失败 */
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
        const jsCode = await this.getCode();
        const res = await this.request(EP_LOGIN, {
            nickName: "微信用户",
            gender: 0,
            language: "",
            city: "",
            province: "",
            country: "",
            avatarUrl: "",
            iv: "",
            signature: "",
            jsCode,
            headImg: "",
        });
        if (!isOk(res)) throw new Error(`登录失败: ${msgOf(res)}`);
        const d = res.data || {};
        this.token = d.token || "";
        this.name = (d.customerInfoCacheDto || {}).name || "";
        if (!this.token) {
            // 服务端会用 code=200 + hasLogin:false + token:null 表示「这个微信号还没注册」，
            // 不是脚本坏了，也不是 code 无效（customerId 是正常返回的）。
            if (d.hasLogin === false) {
                throw new Error(
                    "该微信号还没在丰享汇注册/绑定（服务端返回 hasLogin:false），" +
                    "需先在小程序「一汽丰田丰享汇」里手动完成注册后再跑"
                );
            }
            throw new Error(`登录未返回 token: ${short(res)}`);
        }
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, name: this.name, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${this.name ? `: ${this.name}` : ""}`);
    }

    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            this.name = cached.name || "";
            if (await this.queryPoints(false)) {
                this.log("使用缓存token");
                return;
            }
            this.log("缓存token失效，重新登录");
            this.token = "";
        }
        if (!this.token) await this.login();
    }

    async queryPoints(needLog = true) {
        // 查积分是附带信息，端点 404/异常不该中断签到主流程
        let res;
        try {
            res = await this.request(EP_POINTS, {});
        } catch (e) {
            if (needLog) this.log(`读取积分跳过: ${e.message || e}`);
            return false;
        }
        if (!isOk(res)) {
            if (needLog) this.log(`读取积分失败: ${msgOf(res)}`);
            return false;
        }
        const d = res.data;
        const points = d && typeof d === "object" ? d.pointsSum ?? d.points ?? d.total ?? short(d, 80) : d;
        if (needLog) this.log(`会员: ${this.name || "未知"} 积分: ${points ?? "未知"}`);
        return true;
    }

    async sign(retry = true) {
        const res = await this.request(EP_SIGN, {});
        if (isOk(res)) return this.log("✅ 签到成功");
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        if (retry && isAuthError(msgOf(res))) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            return this.sign(false);
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
            await this.queryPoints();
            await this.sign();
            await this.queryPoints();
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
