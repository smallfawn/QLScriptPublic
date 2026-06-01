/*
------------------------------------------
@Author: sm
@Date: 2026.06.01
@Description:  康师傅畅饮社
cron: 30 10 * * *
------------------------------------------
#Notice:
康师傅畅饮社小程序
变量名 ksfcys
变量值：wx_server 里的 openid/账号标识，多账户&或换行
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
const $ = new Env("康师傅畅饮社");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("../wxapp/wcs.js");

const ckName = "ksfcys";
const MINI_APP_ID = "wx54f3e6a00f7973a7";
const API_BASE = "https://club.biqr.cn/";
const FORUM_BASE = "https://nclub.gdshcm.com/pro/";
const TOKEN_CACHE_FILE = path.join(__dirname, "kangshifu_token_cache.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf254173b) XWEB/19027";
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
    const value = String(token);
    return value ? `${value.slice(0, 6)}***${value.slice(-6)}` : "";
}

function maskPhone(phone = "") {
    return String(phone).replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function isSuccess(result) {
    return Number(result?.code) === 0;
}

function isTokenError(message) {
    return /(^|[^0-9])600([^0-9]|$)|4002|token|登录|授权|未登录|无效|过期/i.test(String(message || ""));
}

function formBody(data = {}) {
    return new URLSearchParams(data).toString();
}

class Task {
    constructor(openid) {
        this.index = $.userIdx++;
        this.openid = String(openid || "").trim();
        this.token = "";
        this.member = {};
    }

    async run() {
        const cached = this.getCachedToken();
        if (cached?.token) {
            this.token = cached.token;
            this.member = cached.member || {};
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

        await this.memberInfo();
        await this.signIn();
        await this.memberInfo("签到后");
    }

    getCachedToken() {
        const cache = readTokenCache();
        return cache[this.openid] || null;
    }

    saveCachedToken() {
        if (!this.token) return;
        const cache = readTokenCache();
        cache[this.openid] = {
            token: this.token,
            member: this.member,
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
        this.member = {};
    }

    headers(extra = {}) {
        const headers = {
            "User-Agent": USER_AGENT,
            "Accept": "application/json, text/plain, */*",
            "xweb_xhr": "1",
            "Referer": "https://servicewechat.com/wx54f3e6a00f7973a7/816/page-frame.html",
            "Accept-Language": "zh-CN,zh;q=0.9",
            ...extra,
        };
        if (this.token) headers.token = this.token;
        return headers;
    }

    async request(baseURL, apiPath, { method = "GET", data, params, auth = true, form = false } = {}) {
        const options = {
            method,
            url: new URL(apiPath, baseURL).toString(),
            params,
            headers: this.headers(form ? {
                "Content-Type": "application/x-www-form-urlencoded;",
            } : {}),
            timeout: 15000,
            validateStatus: () => true,
        };
        if (!auth) delete options.headers.token;
        if (data !== undefined) options.data = form ? formBody(data) : data;

        const { data: result, status } = await axios.request(options);
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);
        if (!isSuccess(result)) throw new Error(`${result?.code ?? ""} ${result?.msg || result?.error || JSON.stringify(result)}`.trim());
        return result;
    }

    async getLoginCode() {
        if (!process.env.wx_auth) throw new Error("缺少 wx_auth，无法从 wx_server 获取 code");
        const { data } = await wechat.getCode(this.openid);
        const code = data?.code || data?.data?.code;
        if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
        return code;
    }

    async loginByWxCode() {
        try {
            const code = await this.getLoginCode();
            const result = await this.request(FORUM_BASE, "whale-member/api/login/login", {
                method: "POST",
                auth: false,
                data: {
                    code,
                    inviterId: "",
                    inviterType: "",
                    inviterMatchUserId: "",
                    spUrl: "",
                },
            });
            const token = result?.data?.token || "";
            if (!token) throw new Error(`登录响应未返回token: ${JSON.stringify(result)}`);
            this.token = token;
            this.member = result?.data?.member || {};
            this.saveCachedToken();
            $.log(`账号[${this.index}] 登录成功: ${this.member.nickname || maskPhone(this.member.phone) || this.member.id || ""}`);
        } catch (e) {
            $.log(`账号[${this.index}] 登录失败: ${e.message || e}`);
        }
    }

    async checkToken() {
        try {
            await this.getMemberInfo();
            return true;
        } catch (e) {
            return false;
        }
    }

    async getMemberInfo() {
        const result = await this.request(FORUM_BASE, "whale-member/api/member/getMemberInfo", {
            params: { token: this.token },
        });
        this.member = result?.data || this.member || {};
        this.saveCachedToken();
        return this.member;
    }

    async memberInfo(prefix = "当前") {
        try {
            const data = await this.getMemberInfo();
            const name = data?.nickname || maskPhone(data?.phone) || data?.id || "";
            const integral = data?.integral ?? data?.point ?? data?.points ?? data?.score ?? "未知";
            $.log(`账号[${this.index}] ${prefix}用户: ${name}，积分: ${integral}`);
        } catch (e) {
            const message = String(e.message || e);
            $.log(`账号[${this.index}] 查询用户失败: ${message}`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }

    async getSignStatus() {
        const result = await this.request(API_BASE, "api/signIn/integralSignInList", {
            method: "POST",
            data: { token: this.token },
            form: true,
        });
        return result?.data || {};
    }

    async signIn() {
        try {
            const status = await this.getSignStatus();
            if (status?.signIs) {
                $.log(`账号[${this.index}] 今日已签到`);
                return;
            }

            const result = await this.request(API_BASE, "api/signIn/integralSignIn", {
                method: "POST",
                data: {},
                form: true,
            });
            $.log(`账号[${this.index}] 签到成功: ${result?.msg || "成功"}`);
        } catch (e) {
            const message = String(e.message || e);
            if (/已签到|已签|重复/.test(message)) {
                $.log(`账号[${this.index}] 今日已签到`);
                return;
            }
            $.log(`账号[${this.index}] 签到失败: ${message}`);
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
