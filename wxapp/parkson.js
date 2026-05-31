/*
------------------------------------------
@Author: sm
@Date: 2026.05.31
@Description: parkson 小程序签到
cron: 35 8 * * *
------------------------------------------
变量名：parkson
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("parkson 小程序签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const MINI_APP_ID = "wx89a714fb03b61b99";
const APP_VERSION = "2.30.3";
const ENV_VERSION = "release";
const API_BASE = "https://smp-api.iyouke.com/dtapi";
const TOKEN_CACHE_FILE = path.join(__dirname, "parkson_token_cache.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

let ckName = "parkson";

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

function formatDate(date = new Date(), separator = "-") {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return [y, m, d].join(separator);
}

class Task {
    constructor(openid) {
        this.index = $.userIdx++;
        this.openid = String(openid || "").trim();
        this.accessToken = "";
        this.authorization = "";
        this.userInfo = {};
    }

    async run() {
        const cached = this.getCachedToken();
        if (cached) {
            this.applyToken(cached);
            $.log(`账号[${this.index}] 使用缓存token`);
            if (!(await this.checkToken())) {
                this.removeCachedToken();
                $.log(`账号[${this.index}] 缓存token失效，重新登录`);
            }
        }

        if (!this.accessToken) {
            await this.loginByWxCode();
            if (!this.accessToken) return;
        }

        await this.getPointsInfo();
        await this.getSignList();
        await this.doSign();
        await this.getPointsInfo();
    }

    getCachedToken() {
        const cache = readTokenCache();
        return cache[this.openid] || null;
    }

    saveCachedToken() {
        if (!this.accessToken) return;
        const cache = readTokenCache();
        cache[this.openid] = {
            accessToken: this.accessToken,
            authorization: this.authorization,
            userId: this.userInfo.userId || "",
            nickName: this.userInfo.nickName || "",
            userMobile: this.userInfo.userMobile || "",
            updatedAt: new Date().toISOString(),
        };
        writeTokenCache(cache);
    }

    removeCachedToken() {
        const cache = readTokenCache();
        if (cache[this.openid]) {
            delete cache[this.openid];
            writeTokenCache(cache);
        }
        this.accessToken = "";
        this.authorization = "";
    }

    applyToken(data = {}) {
        this.accessToken = data.accessToken || data.access_token || "";
        this.authorization = data.authorization || (this.accessToken ? `bearer${this.accessToken}` : "");
        this.userInfo = data;
    }

    getHeaders(extra = {}) {
        const headers = {
            "User-Agent": USER_AGENT,
            "Referer": `https://servicewechat.com/${MINI_APP_ID}/42/page-frame.html`,
            "Accept": "application/json, text/plain, */*",
            appId: MINI_APP_ID,
            version: APP_VERSION,
            envVersion: ENV_VERSION,
            "xy-extra-data": `appid=${MINI_APP_ID};version=${APP_VERSION};envVersion=${ENV_VERSION};`,
            ...extra,
        };
        if (this.authorization) headers.Authorization = this.authorization;
        return headers;
    }

    async request({ method = "POST", apiPath, params = {}, data = {}, skipToken = false }) {
        const options = {
            method,
            url: `${API_BASE}${apiPath}`,
            headers: this.getHeaders(method === "POST" ? { "Content-Type": "application/json" } : {}),
            timeout: 15000,
            validateStatus: () => true,
        };
        if (method === "GET") options.params = params;
        else options.data = data;
        if (skipToken) delete options.headers.Authorization;

        const { status, data: result } = await axios.request(options);
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);
        if (result && typeof result === "object" && result.error !== undefined && result.error !== 0) {
            const err = new Error(result.errorMsg || result.msg || JSON.stringify(result));
            err.code = result.error;
            throw err;
        }
        return result?.data ?? result;
    }

    async getLoginCode() {
        const { data } = await wechat.getCode(this.openid);
        const code = data?.code || data?.data?.code;
        if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
        return code;
    }

    async loginByWxCode() {
        try {
            const code = await this.getLoginCode();
            const data = await this.request({
                apiPath: "/appLogin",
                skipToken: true,
                data: {
                    appType: 1,
                    principal: code,
                },
            });
            this.applyToken(data);
            this.saveCachedToken();
            $.log(`账号[${this.index}] 登录成功: userId=${data.userId || ""}`);
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

    async getUserInfo(log = true) {
        const data = await this.request({
            method: "GET",
            apiPath: "/p/user/userInfo",
        });
        this.userInfo = {
            ...this.userInfo,
            ...data,
        };
        this.saveCachedToken();
        if (log) $.log(`账号[${this.index}] 用户: ${data.nickName || ""} ${data.memberName || ""}`);
        return data;
    }

    async getPointsInfo() {
        try {
            const data = await this.request({
                method: "GET",
                apiPath: "/pointsSign/user/pointsInfo/query",
            });
            $.log(`账号[${this.index}] 积分: ${data?.pointsNums ?? "未知"} 连签=${data?.seriesDays ?? 0} 今日=${data?.signTodayResult ? "已签" : "未签"}`);
            return data;
        } catch (e) {
            $.log(`账号[${this.index}] 查询积分失败: ${e.message || e}`);
            if (/token|登录|授权|401/i.test(String(e.message || e))) this.removeCachedToken();
        }
    }

    async getSignList() {
        try {
            const data = await this.request({
                method: "GET",
                apiPath: "/pointsSign/user/sign/list",
                params: { v4Flag: true },
            });
            const today = formatDate();
            const todayItem = Array.isArray(data) ? data.find((item) => item?.isToday || item?.dateStr === today) : null;
            this.todayDate = todayItem?.dateStr || today;
            this.isTodaySign = Number(todayItem?.daySignStatus) === 2;
            $.log(`账号[${this.index}] 签到状态: ${this.todayDate} ${this.isTodaySign ? "已签" : "未签"}`);
        } catch (e) {
            $.log(`账号[${this.index}] 查询签到状态失败: ${e.message || e}`);
            if (/token|登录|授权|401/i.test(String(e.message || e))) this.removeCachedToken();
        }
    }

    async doSign() {
        if (this.isTodaySign) {
            $.log(`账号[${this.index}] 今日已签到`);
            return;
        }
        try {
            const date = (this.todayDate || formatDate()).replace(/-/g, "/");
            const data = await this.request({
                method: "GET",
                apiPath: "/pointsSign/user/sign",
                params: { date },
            });
            $.log(`账号[${this.index}] 签到成功: +${data?.signReward ?? "未知"}积分`);
        } catch (e) {
            const message = String(e.message || e);
            if (/已签|重复|今日.*签/i.test(message)) {
                $.log(`账号[${this.index}] 今日已签到`);
                return;
            }
            $.log(`账号[${this.index}] 签到失败: ${message}`);
            if (/token|登录|授权|401/i.test(message)) this.removeCachedToken();
        }
    }
}

!(async () => {
    $.checkEnv(ckName);
    for (const openid of $.userList) {
        await new Task(openid).run();
    }
})()
    .catch((e) => $.log(e.message || e))
    .finally(() => $.done());
