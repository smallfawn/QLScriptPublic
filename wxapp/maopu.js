/*
------------------------------------------
@Description: 毛铺草本荟 - 微信小程序静默登录 + 每日签到
cron: 43 8 * * *
------------------------------------------
变量名：maopu
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxefd0fe341e06b815，host mpb.jingjiu.com/proxy-he）：

信封 {code, data, message}，成功码 0。

登录  POST /jp/api/loginauto
        {code, unionid:"", user_id:"", user_sources:"0", system:{...}, itime, isource}
        itime = 秒级时间戳；isource 见解包 utils/parse.js 的 parseTokenParams：
          isource = md5(code + "DI9ynKTdfWqF").slice(0,16) + md5(code + itime + "DI9ynKTdfWqF").slice(-16)
        （这个包里的 md5 输出是**大写**十六进制，见 utils/md5.js 末尾的 toUpperCase()）
        -> data.{access_token, session_key, user_id, unionid, mobile, name}
        之后所有请求带请求头 Authorization: <access_token>（裸值）+ x-version: 0.0.1

状态  POST /api/FlanSignInDaily/mains  {}   ← 不需要签名
        -> data.{user.point, sign_in_today, sign_in_day_continue, rule}
        实测未签时 sign_in_today = -1（>0 视为今天已签）

签到  POST /api/FlanSignInDaily/adds  {date:"YYYY-MM-DD"}  ← **需要签名头**
        见解包 utils/sign/getAppSign.js：只把白名单里的 key 参与拼接
          c = apptime + ("date" + date) + "DYSHJS^M&.YXZRGS" + access_token
          appsign = md5(c) 取**后 10 位**（大写），apptime = 秒级时间戳
        同一套签名头也用于 /api/FlanArticle/articleView 等（白名单换成 article_id）

账号态：本测试号登录后服务端自动建了会员（name 形如「会员xxxxxxxx」、mobile 为 null），
但签到回 {code:-1000,"完善个人信息后才能参与"} —— 要先在小程序里补个人信息（手机号等）。
脚本按 ⚠️ 提示，不代填资料、不代过手机号授权。

不做：阅读文章赚积分（/api/FlanArticle/articleView，属刷任务）、抽奖。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("毛铺草本荟");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "maopu";
const MINI_APP_ID = "wxefd0fe341e06b815";
const BASE = "https://mpb.jingjiu.com/proxy-he";
const X_VERSION = "0.0.1";
const SALT_SIGN = "DYSHJS^M&.YXZRGS";
const SALT_LOGIN = "DI9ynKTdfWqF";
const TOKEN_CACHE_FILE = path.join(__dirname, "maopu_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x28003036) MiniProgramEnv/android";

const EP_LOGIN = "/jp/api/loginauto";
const EP_STATE = "/api/FlanSignInDaily/mains";
const EP_SIGN = "/api/FlanSignInDaily/adds";

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

/** 包里的 md5 输出大写，签名要跟它一致 */
const md5 = (s) => crypto.createHash("md5").update(String(s), "utf8").digest("hex").toUpperCase();

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

function today() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const isOk = (res) => res && Number(res.code) === 0;
const codeOf = (res) => Number(res?.code);
const msgOf = (res) => res?.message || res?.msg || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isAuthError = (res) => /登录|token|未授权|未登录|失效|过期/.test(msgOf(res)) || codeOf(res) === 401;
/** -1000 完善个人信息后才能参与：账号态门槛，不是脚本缺陷 */
const NEED_PROFILE = -1000;

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    /** 只有需要签名的接口才传 signKeys（白名单里的 key 才参与拼接，顺序按 body 的 key 顺序） */
    async request(apiPath, { body = null, withAuth = true, signKeys = null } = {}) {
        const payload = body || {};
        const headers = {
            "content-type": "application/json",
            "x-version": X_VERSION,
            Accept: "application/json, text/plain, */*",
            "User-Agent": USER_AGENT,
            Referer: `https://servicewechat.com/${MINI_APP_ID}/318/page-frame.html`,
            xweb_xhr: "1",
        };
        if (withAuth && this.token) headers.Authorization = this.token;
        if (signKeys && withAuth) {
            const apptime = Math.round(Date.now() / 1000);
            let joined = "";
            for (const k of Object.keys(payload)) {
                if (signKeys.includes(k)) joined += `${k}${payload[k]}`;
            }
            headers.apptime = String(apptime);
            headers.appsign = md5(`${apptime}${joined}${SALT_SIGN}${this.token}`).slice(-10);
        }
        const res = await axios.request({
            method: "POST",
            url: `${BASE}${apiPath}`,
            data: payload,
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
        const itime = Math.floor(Date.now() / 1000);
        const isource = md5(`${code}${SALT_LOGIN}`).slice(0, 16) + md5(`${code}${itime}${SALT_LOGIN}`).slice(-16);
        const res = await this.request(EP_LOGIN, {
            withAuth: false,
            body: {
                code,
                unionid: "",
                user_id: "",
                user_sources: "0",
                system: { platform: "android", system: "Android 12", model: "M2012K11AC", SDKVersion: "3.4.5" },
                itime,
                isource,
            },
        });
        if (!isOk(res)) throw new Error(`登录失败: ${msgOf(res)}`);
        const d = res.data || {};
        this.token = String(d.access_token || "");
        if (!this.token) throw new Error(`登录未返回 access_token: ${short(res)}`);
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${d.name ? `: ${d.name}` : ""}`);
    }

    /** 返回 {signedToday, point, days}；会话失效返回 null */
    async state(needLog = true) {
        const res = await this.request(EP_STATE, { body: {} });
        if (!isOk(res)) {
            if (needLog && !isAuthError(res)) this.log(`读取签到状态失败: ${msgOf(res)}`);
            return null;
        }
        const d = res.data || {};
        const t = Number(d.sign_in_today);
        const info = {
            // 实测未签时是 -1；>0 视为今天已签
            signedToday: Number.isFinite(t) && t > 0,
            point: (d.user || {}).point,
            days: d.sign_in_day_continue,
        };
        if (needLog) {
            this.log(`积分 ${info.point ?? "-"}，连签 ${info.days ?? "-"} 天，今日${info.signedToday ? "已签" : "未签"}`);
        }
        return info;
    }

    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            const info = await this.state(false);
            if (info !== null) {
                this.log("使用缓存token");
                return info;
            }
            this.log("缓存token失效，重新登录");
            this.token = "";
        }
        if (!this.token) await this.login();
        return null;
    }

    async sign(info) {
        if (info === null || info === undefined) info = await this.state();
        if (info === null) {
            this.log("❌ 会话无效，签到跳过");
            return;
        }
        if (info.signedToday) {
            this.log("✅ 今日已签到");
            return;
        }
        const date = today();
        const res = await this.request(EP_SIGN, { body: { date }, signKeys: ["date"] });
        if (isOk(res)) {
            const gained = (res.data || {}).point ?? (res.data || {}).points;
            this.log(`✅ 签到成功${gained ? `，+${gained} 积分` : ""}`);
            await this.state();
            return;
        }
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        if (codeOf(res) === NEED_PROFILE) {
            this.log(`⚠️ ${msgOf(res)} —— 登录和签名都通了，是账号资料没填全（手机号等），先在小程序里完善个人信息再跑`);
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
            const info = await this.ensureLogin();
            await this.sign(info);
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
