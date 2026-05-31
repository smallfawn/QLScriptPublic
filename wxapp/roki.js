/*
------------------------------------------
@Author: sm
@Date: 2026.05.31
@Description: 老板电器 ROKI 小程序签到
cron: 30 8 * * *
------------------------------------------
变量名：roki
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("老板电器ROKI签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const MINI_APP_ID = "wxba70fb8e3eb3aab9";
const API_BASE = process.env.roki_api_base || "https://aio.myroki.com/api/v1/mini-app";
const APP_ENV = process.env.roki_app_env || "release";
const ROKI_APP_ID = "roki_app";
const SIGN_SECRET = "ee8694419924a22f04ac0e01368683521daa659f";
const AES_SECRET = "1234567890123456";
const APP_VERSION = 5000;
const TOKEN_CACHE_FILE = path.join(__dirname, "roki_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

let ckName = "roki";

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

function readTokenCache() {
    try {
        if (!fs.existsSync(TOKEN_CACHE_FILE)) return {};
        return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {};
    } catch (e) {
        return {};
    }
}

function writeTokenCache(cache) {
    try {
        fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
    } catch (e) {
        $.log(`写入token缓存失败: ${e.message || e}`);
    }
}

function maskPhone(phone = "") {
    return String(phone).replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function shortValue(value = "") {
    const text = String(value || "");
    return text ? `${text.slice(0, 4)}***${text.slice(-4)}` : "";
}

function getSignString(params) {
    return Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join("&");
}

function signRequest(timestamp) {
    const payload = {
        aesEncryptSecret: AES_SECRET,
        appId: ROKI_APP_ID,
        nonce: AES_SECRET,
        secret: SIGN_SECRET,
        timestamp,
    };
    const raw = getSignString(payload);
    return encodeURIComponent(crypto.createHmac("sha256", SIGN_SECRET).update(raw).digest("base64"));
}

function isTokenError(error) {
    return /token|登录|授权|401|10001|unauthorized/i.test(String(error && (error.message || error)));
}

class Task {
    constructor(account) {
        this.index = $.userIdx++;
        this.account = String(account || "").trim();
        this.token = "";
        this.aiToken = "";
        this.expireTime = 0;
        this.userInfo = {};
    }

    async run() {
        const cached = this.getCachedToken();
        if (cached) {
            this.applyToken(cached);
            $.log(`账号[${this.index}] 使用缓存token: ${shortValue(this.token)}`);
            if (!(await this.checkToken())) {
                this.removeCachedToken();
                $.log(`账号[${this.index}] 缓存token失效，重新登录`);
            }
        }

        if (!this.token) {
            await this.loginByWxCode();
            if (!this.token) return;
        }

        await this.getUserInfo();
        await this.signIn();
        await this.getRecentSignIn();
        await this.getMemberPoints();
    }

    getCachedToken() {
        const cache = readTokenCache();
        const item = cache[this.account];
        if (!item || !item.token) return null;
        if (item.expireTime && Number(item.expireTime) < Date.now()) return null;
        return item;
    }

    saveCachedToken() {
        if (!this.token) return;
        const cache = readTokenCache();
        cache[this.account] = {
            token: this.token,
            aiToken: this.aiToken,
            expireTime: this.expireTime,
            userId: this.userInfo.id || "",
            mobile: this.userInfo.mobile || "",
            updatedAt: new Date().toISOString(),
        };
        writeTokenCache(cache);
    }

    removeCachedToken() {
        const cache = readTokenCache();
        if (cache[this.account]) {
            delete cache[this.account];
            writeTokenCache(cache);
        }
        this.token = "";
        this.aiToken = "";
        this.expireTime = 0;
    }

    applyToken(data = {}) {
        this.token = data.token || "";
        this.aiToken = data.aiToken || "";
        this.expireTime = Number(data.expireTime || 0);
    }

    getHeaders(extra = {}) {
        const timestamp = Date.now();
        const headers = {
            "User-Agent": USER_AGENT,
            "Referer": `https://servicewechat.com/${MINI_APP_ID}/454/page-frame.html`,
            "Accept": "application/json, text/plain, */*",
            "Content-type": "application/json",
            "X-App-Env": APP_ENV,
            "X-USER-TOKEN": this.token || "",
            "app-id": ROKI_APP_ID,
            timestamp,
            nonce: AES_SECRET,
            secret: AES_SECRET,
            signature: signRequest(timestamp),
            "app-version": APP_VERSION,
            ...extra,
        };
        return headers;
    }

    async request({ method = "GET", apiPath, params = {}, data = {}, skipToken = false }) {
        const upperMethod = method.toUpperCase();
        const headers = this.getHeaders();
        if (skipToken) headers["X-USER-TOKEN"] = "";

        const options = {
            method: upperMethod,
            url: `${API_BASE}${apiPath.startsWith("/") ? apiPath : `/${apiPath}`}`,
            headers,
            timeout: 20000,
            validateStatus: () => true,
        };
        if (upperMethod === "GET") options.params = params;
        else options.data = data;

        const { data: result, status } = await axios.request(options);
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);

        const code = result && result.code;
        if (code && ![200, 0].includes(Number(code))) {
            const err = new Error(result.message || result.msg || JSON.stringify(result));
            err.code = code;
            err.raw = result;
            throw err;
        }
        return result;
    }

    async getLoginCode() {
        if (!process.env.wx_auth) throw new Error("缺少 wx_auth，无法从 wx_server 获取 code");
        const { data } = await wechat.getCode(this.account);
        const code = data && (data.code || (data.data && data.data.code));
        if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
        return code;
    }

    async loginByWxCode() {
        try {
            const code = await this.getLoginCode();
            const result = await this.request({
                method: "POST",
                apiPath: "/user/login",
                skipToken: true,
                data: {
                    code,
                    param: {
                        "qr-code": "",
                    },
                },
            });
            const data = result.data || {};
            this.applyToken(data);
            if (!this.token) throw new Error(`登录响应未返回 token: ${JSON.stringify(result)}`);
            this.saveCachedToken();
            $.log(`账号[${this.index}] 登录成功: token=${shortValue(this.token)}`);
        } catch (e) {
            $.log(`账号[${this.index}] 登录失败: ${e.message || e}`);
        }
    }

    async checkToken() {
        try {
            await this.getUserInfo(false);
            return true;
        } catch (e) {
            return false;
        }
    }

    async getUserInfo(needLog = true) {
        const result = await this.request({ apiPath: "/user/profile" });
        this.userInfo = result.data || {};
        this.saveCachedToken();
        if (needLog) {
            const name = this.userInfo.nickName || this.userInfo.nickname || this.userInfo.name || this.userInfo.id || "未知";
            const mobile = this.userInfo.mobile ? ` ${maskPhone(this.userInfo.mobile)}` : "";
            const points = this.userInfo.points ?? this.userInfo.memberPoints ?? "未知";
            $.log(`账号[${this.index}] 用户: ${name}${mobile} 积分=${points} 今日签到=${this.userInfo.todayIsCheckIn ? "是" : "否"}`);
        }
        return this.userInfo;
    }

    async signIn() {
        try {
            if (Number(this.userInfo.todayIsCheckIn) === 1 || this.userInfo.todayIsCheckIn === true) {
                $.log(`账号[${this.index}] 今日已签到`);
                return;
            }

            const result = await this.request({
                method: "POST",
                apiPath: "/user/check-in-record/check-in",
                data: {},
            });
            $.log(`账号[${this.index}] 签到成功: ${result.message || result.msg || "ok"}`);
            await this.getUserInfo(false);
        } catch (e) {
            $.log(`账号[${this.index}] 签到失败: ${e.message || e}`);
            if (isTokenError(e)) this.removeCachedToken();
        }
    }

    async getRecentSignIn() {
        try {
            const result = await this.request({ apiPath: "/user/check-in-record/recent/record" });
            const data = result.data || {};
            const days = data.consecutiveDays ?? data.continuousDays ?? data.days ?? "未知";
            $.log(`账号[${this.index}] 连续签到: ${days}天`);
        } catch (e) {
            $.log(`账号[${this.index}] 查询签到记录失败: ${e.message || e}`);
        }
    }

    async getMemberPoints() {
        try {
            const result = await this.request({ apiPath: "/user/member/points" });
            const data = result.data || {};
            const points = data.points ?? data.availablePoints ?? data.totalPoints ?? data;
            $.log(`账号[${this.index}] 当前积分: ${typeof points === "object" ? JSON.stringify(points) : points}`);
        } catch (e) {
            $.log(`账号[${this.index}] 查询积分失败: ${e.message || e}`);
        }
    }
}

!(async () => {
    $.checkEnv(ckName);
    for (const account of $.userList) {
        await new Task(account).run();
    }
})()
    .catch((e) => $.log(e.message || e))
    .finally(() => $.done());
