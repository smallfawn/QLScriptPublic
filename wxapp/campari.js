/*
------------------------------------------
@Author: sm
@Date: 2026.05.31
@Description: 金巴厘杯中空间签到
cron: 31 8 * * *
------------------------------------------
变量名：campari
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("金巴厘杯中空间签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const MINI_APP_ID = "wx059d0e2508ab7045";
const PAGE_VERSION = "70";
const API_BASE = "https://camparicrm.81680.cn";
const TOKEN_CACHE_FILE = path.join(__dirname, "campari_token_cache.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

let ckName = "campari";

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

function isTokenError(message) {
    return /token|授权|登录|401|403|expire|过期|失效/i.test(String(message || ""));
}

function rewardText(flowList) {
    if (!Array.isArray(flowList) || !flowList.length) return "";
    const last = flowList[flowList.length - 1] || {};
    const point = last.leftPoint;
    const day = last.signInDay;
    return [
        point !== undefined ? `积分+${point}` : "",
        day !== undefined ? `连续${day}天` : "",
    ].filter(Boolean).join("，");
}

class Task {
    constructor(openid) {
        this.index = $.userIdx++;
        this.openid = String(openid || "").trim();
        this.session = {};
    }

    async run() {
        const cached = this.getCachedToken();
        if (cached) {
            this.session = cached;
            $.log(`账号[${this.index}] 使用缓存token`);
            if (!(await this.checkToken())) {
                $.log(`账号[${this.index}] 缓存token失效，尝试刷新`);
                if (!(await this.refreshToken())) {
                    this.removeCachedToken();
                    $.log(`账号[${this.index}] 刷新失败，重新登录`);
                }
            }
        }

        if (!this.session.token) {
            await this.loginByWxCode();
            if (!this.session.token) return;
        }

        await this.doSign();
        this.saveCachedToken();
    }

    getCachedToken() {
        const cache = readTokenCache();
        return cache[this.openid] || null;
    }

    saveCachedToken() {
        if (!this.session.token) return;
        const cache = readTokenCache();
        cache[this.openid] = {
            token: this.session.token,
            openid: this.session.openid || "",
            sessionKey: this.session.sessionKey || "",
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
        this.session = {};
    }

    getHeaders(token = this.session.token) {
        const headers = {
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
            "Referer": `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
        };
        if (token) headers.Authorization = `Bearer ${token}`;
        return headers;
    }

    async request(apiPath, data = {}, token = this.session.token) {
        const res = await axios.post(`${API_BASE}${apiPath}`, data || {}, {
            headers: this.getHeaders(token),
            timeout: 20000,
            validateStatus: () => true,
        });
        if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
        if (Number(res.data?.code) !== 200) {
            const error = new Error(res.data?.msg || `接口错误: ${res.data?.code || "unknown"}`);
            error.data = res.data;
            throw error;
        }
        return res.data;
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
            const res = await this.request(`/cgs-api/wxApi/getCodeToSession/${encodeURIComponent(code)}`, {}, "");
            const data = res.data || {};
            this.session = {
                token: data.token || "",
                openid: data.openid || "",
                sessionKey: data.session_key || "",
            };
            if (!this.session.token) throw new Error("登录未返回token");
            this.saveCachedToken();
            $.log(`账号[${this.index}] 登录成功`);
        } catch (e) {
            $.log(`账号[${this.index}] 登录失败: ${e.message || e}`);
        }
    }

    async refreshToken() {
        if (!this.session.openid) return false;
        try {
            const res = await this.request("/cgs-api/wxApi/wechatLogin", { openid: this.session.openid }, "");
            const token = res.data?.token || res.token;
            if (!token) return false;
            this.session.token = token;
            this.saveCachedToken();
            return true;
        } catch (e) {
            return false;
        }
    }

    async getSignInfo() {
        const res = await this.request("/cgs-api/wxApi/wechatUser/wechatInfoSignIn");
        return res.data || {};
    }

    async checkToken() {
        try {
            await this.getSignInfo();
            return true;
        } catch (e) {
            return false;
        }
    }

    async doSign() {
        try {
            const info = await this.getSignInfo();
            const text = rewardText(info.pointFlowList);
            if (info.todaySignInFlag) {
                $.log(`账号[${this.index}] 今日已签到${text ? `，${text}` : ""}`);
                return;
            }
            $.log(`账号[${this.index}] 签到完成${text ? `，${text}` : ""}`);
        } catch (e) {
            const message = e.message || e;
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
