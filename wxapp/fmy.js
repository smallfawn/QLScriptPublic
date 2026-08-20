/*
------------------------------------------
@Description: 飞蚂蚁旧衣回收 - 微信小程序静默登录 + 每日签到
cron: 37 8 * * *
------------------------------------------
变量名：fmy
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx501990400906c9ff，host openapp.fmy90.com）：
（迁移自 YYB-GO 系抓包脚本；原脚本已是 code 登录，天然适配 smallcat 取码）

登录  POST /auth/wx/login   form: code=<wx code>&platformKey=<PK>&version=V2.00.01&vital=&partner_platform_key=
        -> code==200，token 在 data.token（新用户）或 data.userInfo.token（老用户），
        兼容 data.access_token。firstLogin==1 且 data.user 为空数组 = 新号未完成注册（签到会 401）
签到  POST /sign/new/do   JSON: {version:"V2.00.01", platformKey:<PK>, mini_scene:1089, partner_ext_infos:""}
        鉴权头 authorization: Bearer <token>；成功码 200，重复签回 {code:400,"今天已经签到过啦~"}

platformKey F2EE24892FBF66F0AFF8C0EB532A9394 是这家小程序的固定平台标识（原脚本硬编码）。
实测：号1 签到成功（会员 userId 14320122，userTotalBeans 10）；重复签到「今天已经签到过啦~」。
不做：豆子兑换/其它任务。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("飞蚂蚁旧衣回收");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "fmy";
const MINI_APP_ID = "wx501990400906c9ff";
const BASE = "https://openapp.fmy90.com";
const PLATFORM_KEY = "F2EE24892FBF66F0AFF8C0EB532A9394";
const APP_VERSION = "V2.00.01";
const TOKEN_CACHE_FILE = path.join(__dirname, "fmy_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/auth/wx/login";
const EP_SIGN = "/sign/new/do";

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

const isOk = (res) => Number(res?.code) === 200;
const msgOf = (res) => res?.message || res?.msg || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isAuthError = (res) => Number(res?.code) === 401 || /登录失败|重新登录|token|未登录/i.test(msgOf(res));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    async request(apiPath, { method = "POST", body = null, formBody = null } = {}) {
        const headers = {
            "User-Agent": USER_AGENT,
            "device-version": "Windows 10 x64",
            "device-model": "microsoft",
            Accept: "*/*",
            xweb_xhr: "1",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/506/page-frame.html`,
        };
        if (this.token) headers.authorization = `Bearer ${this.token}`;
        let data;
        if (formBody) {
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            data = form(formBody);
        } else {
            headers["Content-Type"] = "application/json";
            data = body || {};
        }
        const res = await axios.request({
            method,
            url: `${BASE}${apiPath}`,
            data,
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
        const res = await this.request(EP_LOGIN, {
            formBody: { code, platformKey: PLATFORM_KEY, version: APP_VERSION, vital: "", partner_platform_key: "" },
        });
        if (!isOk(res)) throw new Error(`登录失败: ${msgOf(res)}`);
        const d = res.data || {};
        this.token = String(d.token || (d.userInfo || {}).token || d.access_token || "");
        if (!this.token) throw new Error(`登录未返回 token: ${short(res)}`);
        // firstLogin==1 且 user 为空 = 新号未完成注册，签到会 401
        this.newUser = Number(d.firstLogin) === 1 && (!d.user || (Array.isArray(d.user) && d.user.length === 0));
        const u = d.user || d.userInfo || {};
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${u.userId ? ` (userId ${u.userId}, 环保豆 ${u.userTotalBeans ?? "-"})` : this.newUser ? "（新号，未完成注册）" : ""}`);
    }

    async sign(retry = true) {
        const res = await this.request(EP_SIGN, {
            body: { version: APP_VERSION, platformKey: PLATFORM_KEY, mini_scene: 1089, partner_ext_infos: "" },
        });
        if (isOk(res)) {
            const amt = (res.data || {}).sign_red_amount;
            this.log(`✅ 签到成功${amt ? `，红包 ${amt}` : ""}`);
            return;
        }
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        if (retry && isAuthError(res)) {
            // 缓存 token 失效，重登一次
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            if (this.newUser) {
                this.log("⚠️ 该微信号是新号、还没在飞蚂蚁完成注册，签到需先在小程序里注册一次");
                return;
            }
            return this.sign(false);
        }
        if (Number(res?.code) === 401) {
            this.log("⚠️ 该微信号还没在飞蚂蚁注册会员（签到回 401），先在小程序里注册一次再跑");
            return;
        }
        this.log(`❌ 签到失败: ${msgOf(res)}`);
    }

    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            this.log("使用缓存token");
            return;
        }
        if (!this.token) await this.login();
    }

    async run() {
        if (!this.account.openid) {
            this.log("跳过：变量值里没有 openid");
            return;
        }
        try {
            await this.ensureLogin();
            if (this.newUser) {
                this.log("⚠️ 该微信号是新号、还没在飞蚂蚁完成注册，先在小程序里注册一次再跑");
                return;
            }
            await this.sign();
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
