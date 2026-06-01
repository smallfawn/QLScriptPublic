/*
------------------------------------------
@Author: sm
@Date: 2026.06.01
@Description: 梦想家TSE微信小程序签到
cron: 30 8 * * *
------------------------------------------
变量名：mengxiangjia
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行
依赖变量：wx_server_url、wx_auth
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("梦想家TSE微信小程序签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ckName = "mengxiangjia";
const MINI_APP_ID = "wx696605f7e70c1e24";
const VERSION = "2.30.6";
const API_BASE = "https://smp-api.iyouke.com/dtapi";
const TOKEN_CACHE_FILE = path.join(__dirname, "mengxiangjia_token_cache.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

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

function maskToken(token = "") {
    const value = String(token || "");
    return value ? `${value.slice(0, 6)}***${value.slice(-6)}` : "";
}

function formatSignDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
}

function isTokenError(message = "") {
    return /401|403|token|登录|授权|未登录|invalid/i.test(String(message));
}

class Task {
    constructor(openid) {
        this.index = $.userIdx++;
        this.openid = String(openid || "").trim();
        this.loginResult = {};
    }

    get accessToken() {
        return this.loginResult.access_token || this.loginResult.accessToken || "";
    }

    async run() {
        const cached = this.getCachedToken();
        if (cached?.access_token || cached?.accessToken) {
            this.loginResult = cached;
            $.log(`账号[${this.index}] 使用缓存token: ${maskToken(this.accessToken)}`);
            if (!(await this.checkToken())) {
                this.removeCachedToken();
                $.log(`账号[${this.index}] 缓存token失效，重新code登录`);
            }
        }

        if (!this.accessToken) {
            await this.loginByWxCode();
            if (!this.accessToken) return;
        }

        await this.getPointsInfo("签到前");
        await this.getSignConfig();
        const today = await this.getTodaySignItem();
        if (today?.daySignStatus === 2) {
            $.log(`账号[${this.index}] 今日已签到`);
        } else {
            await this.signIn(today?.dateStr);
        }
        await this.getPointsInfo("签到后");
    }

    getCachedToken() {
        const cache = readTokenCache();
        return cache[this.openid] || null;
    }

    saveCachedToken() {
        if (!this.accessToken) return;
        const cache = readTokenCache();
        cache[this.openid] = {
            ...this.loginResult,
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
        this.loginResult = {};
    }

    headers(withToken = true) {
        const headers = {
            "User-Agent": USER_AGENT,
            "Referer": `https://servicewechat.com/${MINI_APP_ID}/5/page-frame.html`,
            "Accept": "application/json, text/plain, */*",
            "appId": MINI_APP_ID,
            "version": VERSION,
            "envVersion": "release",
        };
        if (withToken && this.accessToken) headers.Authorization = `bearer${this.accessToken}`;
        return headers;
    }

    async request({ method = "GET", apiPath, data = {}, params = {}, needToken = true }) {
        const options = {
            method,
            url: `${API_BASE}${apiPath}`,
            headers: this.headers(needToken),
            timeout: 15000,
            validateStatus: () => true,
        };
        if (method.toUpperCase() === "GET") options.params = params;
        else options.data = data;

        const { status, data: result } = await axios.request(options);
        if (status !== 200) throw new Error(`HTTP ${status}: ${typeof result === "string" ? result.slice(0, 200) : JSON.stringify(result)}`);
        if (result && Object.prototype.hasOwnProperty.call(result, "error") && Number(result.error) !== 0) {
            const err = new Error(result.errorMsg || result.error_msg || result.message || JSON.stringify(result));
            err.code = result.error;
            throw err;
        }
        return result;
    }

    async getWxCode() {
        const wxServerUrl = process.env.wx_server_url;
        const wxAuth = process.env.wx_auth;
        if (!wxServerUrl || !wxAuth) throw new Error("未配置 wx_server_url 或 wx_auth");

        const { status, data } = await axios.post(
            `${wxServerUrl.replace(/\/$/, "")}/wx/operatedata`,
            { appid: MINI_APP_ID, openid: this.openid },
            {
                headers: {
                    auth: wxAuth,
                    "content-type": "application/json",
                },
                timeout: 15000,
                validateStatus: () => true,
            }
        );
        const code = data?.code || data?.data?.code;
        if (status !== 200 || !code) throw new Error(`wx_server 获取code失败: HTTP ${status} ${JSON.stringify(data)}`);
        return code;
    }

    async loginByWxCode() {
        try {
            const code = await this.getWxCode();
            const data = await this.request({
                method: "POST",
                apiPath: "/appLogin",
                needToken: false,
                data: {
                    principal: code,
                    appType: 1,
                },
            });
            this.loginResult = data || {};
            this.saveCachedToken();
            $.log(`账号[${this.index}] 登录成功: userId=${data?.userId || ""} token=${maskToken(this.accessToken)}`);
        } catch (e) {
            $.log(`账号[${this.index}] 登录失败: ${e.message || e}`);
        }
    }

    async checkToken() {
        try {
            await this.getPointsInfo("缓存校验");
            return true;
        } catch (e) {
            return false;
        }
    }

    async getSignConfig() {
        try {
            const result = await this.request({ apiPath: "/pointsSign/config/query" });
            const data = result?.data || {};
            $.log(`账号[${this.index}] 签到配置: ${Number(data.signEnable) === 1 ? "已开启" : "未开启"} 日签${data.signReward ?? ""}积分`);
            return data;
        } catch (e) {
            $.log(`账号[${this.index}] 获取签到配置失败: ${e.message || e}`);
            return {};
        }
    }

    async getTodaySignItem() {
        try {
            const result = await this.request({
                apiPath: "/pointsSign/user/sign/list",
                params: { v4Flag: true },
            });
            const list = Array.isArray(result?.data) ? result.data : [];
            const today = list.find((item) => item?.isToday) || {};
            $.log(`账号[${this.index}] 今日签到状态: ${today.dateStr || ""} status=${today.daySignStatus ?? "未知"}`);
            return today;
        } catch (e) {
            $.log(`账号[${this.index}] 获取签到列表失败: ${e.message || e}`);
            return {};
        }
    }

    async getPointsInfo(label = "积分") {
        const result = await this.request({ apiPath: "/pointsSign/user/pointsInfo/query" });
        const data = result?.data || {};
        $.log(`账号[${this.index}] ${label}: ${data.pointsNums ?? "未知"}积分 连签${data.seriesDays ?? 0}天 今日${data.signTodayResult ? "已签" : "未签"}`);
        return data;
    }

    async signIn(dateStr) {
        const date = dateStr ? dateStr.replace(/-/g, "/") : formatSignDate();
        try {
            const result = await this.request({
                apiPath: "/pointsSign/user/sign",
                params: { date },
            });
            const data = result?.data || {};
            $.log(`账号[${this.index}] 签到成功: +${data.signReward ?? 0}积分${data.extraSignReward ? ` 额外+${data.extraSignReward}` : ""}`);
        } catch (e) {
            const message = String(e.message || e);
            if (/已签到|重复签到/.test(message)) {
                $.log(`账号[${this.index}] 今日已签到`);
                return;
            }
            $.log(`账号[${this.index}] 签到失败: ${message}`);
            if (isTokenError(message)) this.removeCachedToken();
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
