/*
------------------------------------------
@Author: sm
@Date: 2026.06.01
@Description: fsdlb 微信小程序逢三得利吧 签到积分
cron: 30 9 * * *
------------------------------------------
变量名：fsdlb
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行
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
const $ = new Env("逢三得利吧小程序");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("../wxapp/wcs.js");

let ckName = "fsdlb";
const MINI_APP_ID = "wxb33ed03c6c715482";
const MERCHANT_APP_NAME = "20230130307725";
const TEMPLATE_VERSION = "0.6.4";
const X_VERSION = "2.3.5";
const CLIENT_ID = "saas-wechat-app";
const APP_PUBLISH_TYPE = 1;
const MINIAPP_ID = 159;
const API_BASE = "https://xiaodian.miyatech.com/api";
const TOKEN_CACHE_FILE = path.join(__dirname, "fsdlb_token_cache.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";
const defaultUserAgent = USER_AGENT;

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
    const value = String(token).replace(/^bearer\s+/i, "");
    return value ? `${value.slice(0, 6)}***${value.slice(-6)}` : "";
}

function maskPhone(phone = "") {
    return String(phone).replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function pickToken(data = {}) {
    return data?.tokenInfo?.access_token || data.accessToken || data.access_token || data.token || "";
}

function isSuccess(result) {
    return String(result?.code) === "200";
}

function isTokenError(message) {
    return /401|403|M401|M403|token|登录|授权|未登录|无效|过期/i.test(String(message || ""));
}

class Task {
    constructor(openid) {
        this.index = $.userIdx++;
        this.openid = String(openid || "").trim();
        this.token = "";
        this.userInfo = {};
    }

    async run() {
        const cached = this.getCachedToken();
        if (cached) {
            this.applyToken(cached);
            $.log(`账号[${this.index}] 使用缓存token: ${shortToken(this.token)}`);
            if (!(await this.checkToken())) {
                this.removeCachedToken();
                $.log(`账号[${this.index}] 缓存token失效，重新登录`);
            }
        }

        if (!this.token) {
            await this.loginByWxCode();
            if (!this.token) return;
        }

        await this.info();
        await this.signIn();
    }

    getCachedToken() {
        const cache = readTokenCache();
        return cache[this.openid] || null;
    }

    saveCachedToken() {
        if (!this.token) return;
        const cache = readTokenCache();
        cache[this.openid] = {
            accessToken: this.token,
            userInfo: this.userInfo,
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
        this.token = "";
        this.userInfo = {};
    }

    applyToken(data = {}) {
        this.token = pickToken(data);
        this.userInfo = data.userInfo || data.thirdUsrIf || {};
    }

    getHeaders(extra = {}, auth = true) {
        const headers = {
            componentSend: "1",
            "HH-FROM": MERCHANT_APP_NAME,
            "HH-APP": MINI_APP_ID,
            "HH-VERSION": TEMPLATE_VERSION,
            "X-VERSION": X_VERSION,
            "Content-Type": "application/json",
            appPublishType: APP_PUBLISH_TYPE,
            "HH-CI": CLIENT_ID,
            "MARKETING-PLAN-NO": "",
            "USER-ENTRANCE-CHANNEL": "",
            "USER-ENTRANCE-CHANNEL-KEY": "",
            "ONE-ID": this.userInfo.oneId || "",
            groupPosId: "",
            "User-Agent": USER_AGENT,
            ...extra,
        };
        if (auth && this.token) headers.Authorization = `bearer ${this.token}`;
        return headers;
    }

    async request({ method = "GET", path: apiPath, data, params, auth = true }) {
        const options = {
            method,
            url: `${API_BASE}${apiPath.startsWith("/") ? apiPath : `/${apiPath}`}`,
            headers: this.getHeaders({}, auth),
            timeout: 15000,
            validateStatus: () => true,
        };
        if (params) options.params = params;
        if (data !== undefined) options.data = data;

        const { data: result, status } = await axios.request(options);
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);
        if (!isSuccess(result)) throw new Error(result?.msg || JSON.stringify(result));
        return result.data;
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
                method: "POST",
                path: "/user/login/wx-jc",
                auth: false,
                data: {
                    jsCode: code,
                    clientId: CLIENT_ID,
                    myUnionId: "",
                    appPublishType: APP_PUBLISH_TYPE,
                },
            });
            this.token = pickToken(data);
            this.userInfo = data?.thirdUsrIf || {};
            if (!this.token) throw new Error(`登录响应未返回token: ${JSON.stringify(data)}`);
            this.saveCachedToken();
            $.log(`账号[${this.index}] 登录成功: ${maskPhone(this.userInfo.phone) || this.userInfo.oid || ""}`);
        } catch (e) {
            $.log(`账号[${this.index}] 登录失败: ${e.message || e}`);
        }
    }

    async checkToken() {
        try {
            await this.request({
                path: "/user/auth/member/integral/union/flow/list",
                params: { pageNo: 1, pageSize: 1, dataType: "SCORE" },
            });
            return true;
        } catch (e) {
            return false;
        }
    }

    async signIn() {
        try {
            const data = await this.request({
                method: "POST",
                path: "/coupon/auth/signIn",
                data: {
                    miniappId: MINIAPP_ID,
                },
            });
            $.log(`🕊账号[${this.index}] 签到成功:${data?.integralToastText || "成功"}🎉`);
        } catch (e) {
            const message = String(e.message || e);
            if (/已签到|已签|重复/.test(message)) {
                $.log(`🕊账号[${this.index}] 今日已签到`);
                return;
            }
            $.log(`🕊账号[${this.index}] 签到失败:${message}🚫`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }

    async info() {
        try {
            const data = await this.request({
                path: "/user/auth/member/integral/union/flow/list",
                params: { pageNo: 1, pageSize: 10, dataType: "SCORE" },
            });
            $.log(`🕊账号[${this.index}] 查询成功:总积分[${data?.totalScore ?? "未知"}]🎉`);
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

    for (const openid of $.userList) {
        await new Task(openid).run();
    }
})()
    .catch((e) => $.log(e.message || e))
    .finally(() => $.done());

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
    } catch (e) { }
}
