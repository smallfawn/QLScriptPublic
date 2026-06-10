/*
------------------------------------------
@Author: sm
@Date: 2026.06.01
@Description:  国乐酱酒小程序
cron: 30 9 * * *
------------------------------------------
#Notice:
变量名: gyjj
变量值：wx_server 里的 openid/账号标识，多账号&或换行
需要配置：wx_server_url、wx_auth

⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
*/

const { Env } = require("../tools/env.js");
const $ = new Env("国乐酱酒");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ckName = "gyjj";
const strSplitor = "#";
const MINI_APP_ID = "wxeff120e4d11594c0";
const PAGE_VERSION = "87";
const API_BASE = "https://member.guoyuejiu.com/api";
const TOKEN_CACHE_FILE = path.join(__dirname, "gyjj_token_cache.json");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_15 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.70(0x1800462d) NetType/WIFI Language/zh_CN";

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

function shortToken(token = "") {
    const value = String(token || "").replace(/^Mer/i, "");
    return value ? `${value.slice(0, 6)}***${value.slice(-6)}` : "";
}

function isTokenError(message) {
    return /1011|401|403|token|登录|授权|失效|过期/i.test(String(message || ""));
}

class Task {
    constructor(env) {
        this.index = $.userIdx++;
        this.raw = String(env || "").trim();
        this.user = this.raw.split(strSplitor);
        this.accountId = this.user[0].trim();
        this.token = "";
        this.sessionKey = "";
        this.userId = "";
        this.userInfo = {};
        this.isLegacyToken = /^Mer|eyJ/i.test(this.accountId) || this.user.length >= 2;
        if (this.isLegacyToken) {
            this.token = this.accountId.replace(/^Mer/i, "");
            this.accountId = `legacy:${shortToken(this.token)}`;
        }
    }

    async run() {
        if (this.isLegacyToken) {
            $.log(`账号[${this.index}] 检测到旧版token格式，先迁移到缓存`);
            this.saveCachedToken();
        } else {
            const cached = this.getCachedToken();
            if (cached?.token) {
                this.applyToken(cached);
                $.log(`账号[${this.index}] 使用缓存token: ${shortToken(this.token)}`);
                if (!(await this.checkToken())) {
                    this.removeCachedToken();
                    $.log(`账号[${this.index}] 缓存token失效，重新CODE登录`);
                }
            }

            if (!this.token) {
                await this.loginByWxCode();
                if (!this.token) return;
            }
        }

        await this.sign();
        await this.account();
    }

    cacheKey() {
        return this.isLegacyToken ? this.accountId : this.raw;
    }

    getCachedToken() {
        const cache = readTokenCache();
        return cache[this.cacheKey()] || null;
    }

    saveCachedToken() {
        if (!this.token) return;
        const cache = readTokenCache();
        cache[this.cacheKey()] = {
            token: this.token,
            sessionKey: this.sessionKey,
            userId: this.userId,
            userInfo: this.userInfo,
            updatedAt: new Date().toISOString(),
        };
        writeTokenCache(cache);
    }

    removeCachedToken() {
        const cache = readTokenCache();
        if (cache[this.cacheKey()]) {
            delete cache[this.cacheKey()];
            writeTokenCache(cache);
        }
        this.token = "";
        this.sessionKey = "";
        this.userId = "";
        this.userInfo = {};
    }

    applyToken(data = {}) {
        this.token = String(data.token || data.authorization || "").replace(/^Mer/i, "");
        this.sessionKey = data.sessionKey || "";
        this.userId = data.userId || "";
        this.userInfo = data.userInfo || {};
    }

    headers(extra = {}) {
        return {
            "content-Type": "application/json",
            Authorization: `Mer${this.token}`,
            "User-Agent": defaultUserAgent,
            Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            ...extra,
        };
    }

    async request(pathname, { method = "GET", data, params, auth = true, headers = {} } = {}) {
        const options = {
            method,
            url: `${API_BASE}${pathname}`,
            params,
            data,
            headers: auth ? this.headers(headers) : {
                "content-Type": "application/json",
                "User-Agent": defaultUserAgent,
                Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
                ...headers,
            },
            timeout: 20000,
            validateStatus: () => true,
        };
        const { data: result, status } = await axios.request(options);
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);
        if (Number(result?.code) !== 0) throw new Error(`${result?.code ?? ""} ${result?.message || JSON.stringify(result)}`.trim());
        return result;
    }

    async getOperateData() {
        if (!process.env.wx_auth) throw new Error("缺少 wx_auth，无法从 wx_server 获取登录数据");
        const url = (process.env.wx_server_url || "http://192.168.31.196:8787").replace(/\/$/, "");
        const { data } = await axios.post(`${url}/wx/getuserinfo`, {
            appid: MINI_APP_ID,
            openid: this.raw,
        }, {
            headers: { auth: process.env.wx_auth },
            timeout: 45000,
            validateStatus: () => true,
        });
        const result = data?.data || {};
        if (!data?.status || !result.code) throw new Error(`wx_server 未返回code: ${JSON.stringify(data)}`);
        let userInfo = {};
        try {
            userInfo = JSON.parse(result.data || "{}");
        } catch (e) {}
        return { code: result.code, userInfo };
    }

    async loginByWxCode() {
        try {
            const wxData = await this.getOperateData();
            const user = wxData.userInfo || {};
            const payload = {
                avatarUrl: user.avatarUrl || "",
                city: user.city || "",
                country: user.country || "",
                gender: user.gender || 0,
                nickName: user.nickName || user.nickname || "微信用户",
                province: user.province || "",
                code: wxData.code,
                source: 2,
            };
            const result = await this.request("/user/wxLogin", {
                method: "POST",
                data: payload,
                auth: false,
            });
            const data = result?.data || {};
            if (!data.authorization) throw new Error(`登录响应未返回authorization: ${JSON.stringify(result)}`);
            this.token = data.authorization;
            this.sessionKey = data.sessionKey || "";
            this.userId = data.userId || "";
            this.saveCachedToken();
            $.log(`账号[${this.index}] CODE登录成功: ${shortToken(this.token)}`);
        } catch (e) {
            $.log(`账号[${this.index}] CODE登录失败: ${e.message || e}`);
        }
    }

    async checkToken() {
        try {
            await this.request("/user/info");
            return true;
        } catch (e) {
            return false;
        }
    }

    async sign() {
        try {
            const result = await this.request("/sign/daily/sign");
            $.log(`🕊账号[${this.index}] 签到成功：签到[${result.data?.spanSumDays ?? "未知"}]天🎉`);
        } catch (e) {
            const message = String(e.message || e);
            if (/已签|重复|今日/.test(message)) {
                $.log(`🕊账号[${this.index}] 今日已签到`);
                return;
            }
            $.log(`🕊账号[${this.index}] 签到失败:${message}⛔`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }

    async account() {
        try {
            const result = await this.request("/user/info");
            this.userInfo = result.data || {};
            this.saveCachedToken();
            $.log(`🕊账号[${this.index}] 查询成功:总积分[${result.data?.score ?? "未知"}]🎉`);
        } catch (e) {
            const message = String(e.message || e);
            $.log(`🕊账号[${this.index}] 查询失败:${message}🚫`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }
}

!(async () => {
    await getNotice();
    $.checkEnv(ckName);

    for (const user of $.userList) {
        await new Task(user).run();
    }
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

async function getNotice() {
    try {
        const { data: res } = await axios.request({
            url: "https://ghproxy.net/https://raw.githubusercontent.com/smallfawn/Note/refs/heads/main/Notice.json",
            headers: { "User-Agent": defaultUserAgent },
            timeout: 3000,
        });
        $.log(res);
        return res;
    } catch (e) {}
}
