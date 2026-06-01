/*
------------------------------------------
@Author: sm
@Date: 2026.06.01
@Description:  七彩虹微信小程序 签到&点赞
cron: 30 10 * * *
------------------------------------------
#Notice:
变量名：colorful
变量值：wx_server 里的 openid/账号标识，多账户&或换行
需要配置：wx_server_url、wx_auth

说明：小程序当前登录链路为 wx.login code -> /api/User/OnLogin 获取 OpenId，
首次换取业务 Token 还需要微信手机号授权 code；现有 wx_server 只能提供 wx.login code。
脚本会复用本地 token 缓存，缓存失效或首次运行时会自动验证 code 登录能力并给出明确原因。

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
const $ = new Env("colorful七彩虹");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("../wxapp/wcs.js");

const ckName = "colorful";
const strSplitor = "#";
const MINI_APP_ID = "wx49018277e65fc3e1";
const PAGE_VERSION = "91";
const API_BASE = "https://interface.skycolorful.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "colorful_token_cache.json");
const defaultUserAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf254173b) XWEB/19027";

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

function shortToken(token = "") {
    const value = String(token || "").replace(/^Bearer\s+/i, "");
    return value ? `${value.slice(0, 6)}***${value.slice(-6)}` : "";
}

function maskPhone(phone = "") {
    return String(phone).replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function md5(str) {
    return crypto.createHash("md5").update(str).digest("hex");
}

function isTokenError(message) {
    return /401|403|token|登录|授权|未登录|无效|过期|失效/i.test(String(message || ""));
}

function isSuccess(result) {
    return Number(result?.Code) === 0 && result?.Success !== false;
}

class Task {
    constructor(env) {
        this.index = $.userIdx++;
        this.raw = String(env || "").trim();
        this.user = this.raw.split(strSplitor);
        this.accountId = this.user[0].trim();
        this.token = "";
        this.refreshToken = "";
        this.openId = "";
        this.userInfo = {};
        this.signStatus = false;
        this.isLegacyToken = this.user.length >= 2;
        if (this.isLegacyToken) {
            this.token = this.user[0].trim();
            this.refreshToken = this.user[1].trim();
            this.accountId = `legacy:${shortToken(this.token)}`;
        }
    }

    async run() {
        if (this.isLegacyToken) {
            $.log(`账号[${this.index}] 检测到旧版 token 格式，将仅用于迁移缓存`);
            this.saveCachedToken();
        } else {
            const cached = this.getCachedToken();
            if (cached?.token) {
                this.applyToken(cached);
                $.log(`账号[${this.index}] 使用缓存token: ${shortToken(this.token)}`);
                if (!(await this.checkToken())) {
                    this.removeCachedToken();
                    $.log(`账号[${this.index}] 缓存token失效，重新尝试CODE登录`);
                }
            }

            if (!this.token) {
                await this.loginByWxCode();
                if (!this.token) return;
            }
        }

        await this.getUserInfo();
        await this.getSignInfo();

        if (this.signStatus) {
            $.log(`账号[${this.index}] 今日已签到`);
            return;
        }
        await this.signInV2();
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
            refreshToken: this.refreshToken,
            openId: this.openId,
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
        this.refreshToken = "";
        this.userInfo = {};
    }

    applyToken(data = {}) {
        this.token = data.token || data.Token || "";
        this.refreshToken = data.refreshToken || data.RefreshToken || "";
        this.openId = data.openId || data.OpenId || "";
        this.userInfo = data.userInfo || data.UserInfo || {};
    }

    signedHeaders(extra = {}, auth = true) {
        const appid = "815d8026-9a52-4445-a42c-a5443134232e";
        const requestId = crypto.randomUUID ? crypto.randomUUID() : $.uuid();
        const ticks = Date.now();
        const headers = {
            "User-Agent": defaultUserAgent,
            "Referer": `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Content-Type": "application/json",
            "requestId": requestId,
            "AppId": appid,
            "Ticks": String(ticks),
            "Sign": md5(appid + ticks + requestId + "2b5c01fb-7640-401a-8188-43a13190a626"),
            "source": "Wx",
            "UcSource": "30",
            "User-from": "xcx",
            "version": "2.0.0",
            "xweb_xhr": "1",
            ...extra,
        };
        if (auth) {
            headers.Authorization = this.token ? `Bearer ${this.token}` : "";
            headers["X-Authorization"] = this.refreshToken ? `Bearer ${this.refreshToken}` : "";
        }
        return headers;
    }

    async request(apiPath, { method = "GET", data, params, auth = true } = {}) {
        const options = {
            method,
            url: new URL(apiPath, API_BASE).toString(),
            params,
            headers: this.signedHeaders({}, auth),
            timeout: 15000,
            validateStatus: () => true,
        };
        if (data !== undefined) options.data = data;
        const { data: result, status, headers } = await axios.request(options);
        if (headers?.["access-token"]) this.token = headers["access-token"];
        if (headers?.["x-access-token"]) this.refreshToken = headers["x-access-token"];
        if (status === 401 || status === 403) throw new Error(`HTTP ${status}: ${result?.Message || JSON.stringify(result)}`);
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);
        if (!isSuccess(result)) throw new Error(`${result?.Code ?? ""} ${result?.Message || result?.msg || JSON.stringify(result)}`.trim());
        if (this.token) this.saveCachedToken();
        return result;
    }

    async getLoginCode() {
        if (!process.env.wx_auth) throw new Error("缺少 wx_auth，无法从 wx_server 获取 code");
        const { data } = await wechat.getCode(this.raw);
        const code = data?.code || data?.data?.code;
        if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
        return code;
    }

    async loginByWxCode() {
        try {
            const code = await this.getLoginCode();
            const result = await this.request("/api/User/OnLogin", {
                method: "POST",
                auth: false,
                data: { Code: code },
            });
            this.openId = result?.Data?.OpenId || "";
            const token = result?.Data?.Token || result?.Data?.token || "";
            const refreshToken = result?.Data?.RefreshToken || result?.Data?.refreshToken || "";
            if (token) {
                this.token = token;
                this.refreshToken = refreshToken;
                this.saveCachedToken();
                $.log(`账号[${this.index}] CODE登录成功: ${shortToken(this.token)}`);
                return;
            }
            throw new Error(`OnLogin仅返回OpenId=${this.openId || "空"}，首次业务登录仍需要微信手机号授权code`);
        } catch (e) {
            $.log(`账号[${this.index}] CODE登录失败: ${e.message || e}`);
        }
    }

    async checkToken() {
        try {
            await this.request("/api/User/RefreshLoginTime", {
                method: "POST",
                data: { phone: "" },
            });
            return true;
        } catch (e) {
            return false;
        }
    }

    async signInV2() {
        try {
            const result = await this.request("/api/User/SignV2", {
                method: "POST",
                data: {},
            });
            $.log(`🌸账号[${this.index}]🕊签到${result.Message || "成功"}🎉`);
        } catch (e) {
            const message = String(e.message || e);
            if (/已签到|已签|重复/.test(message)) {
                $.log(`🌸账号[${this.index}] 今日已签到`);
                return;
            }
            $.log(`🌸账号[${this.index}] 签到失败:${message}❌`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }

    async getSignInfo() {
        try {
            const result = await this.request("/api/User/IsSignV2");
            this.signStatus = Boolean(result?.Data?.IsSign);
        } catch (e) {
            const message = String(e.message || e);
            $.log(`账号[${this.index}] 查询签到状态失败: ${message}`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }

    async getUserInfo() {
        try {
            const result = await this.request("/api/User/GetUserInfo");
            this.userInfo = result?.Data || {};
            this.saveCachedToken();
            $.log(`🌸账号[${this.index}]昵称:${this.userInfo.NickName || maskPhone(this.userInfo.Mobile) || "未知"} 积分:${this.userInfo.Point ?? "未知"}`);
        } catch (e) {
            const message = String(e.message || e);
            $.log(`账号[${this.index}] 查询用户失败: ${message}`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }
}

// 暂停主运行：当前七彩虹后端首次换取业务 Token 需要微信手机号授权 code，
// 现有 wx_server 只能提供 wx.login code，恢复前不要自动执行任务。
// !(async () => {
//     await getNotice();
//     $.checkEnv(ckName);
//
//     for (const user of $.userList) {
//         await new Task(user).run();
//     }
// })()
//     .catch((e) => console.log(e))
//     .finally(() => $.done());

async function getNotice() {
    try {
        const options = {
            url: "https://ghproxy.net/https://raw.githubusercontent.com/smallfawn/Note/refs/heads/main/Notice.json",
            headers: {
                "User-Agent": defaultUserAgent,
            },
            timeout: 3000,
        };
        const { data: res } = await axios.request(options);
        $.log(res);
        return res;
    } catch (e) {}
}
