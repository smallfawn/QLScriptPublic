/*
------------------------------------------
@Author: sm
@Date: 2026.06.01
@Description:  千金健康生活微信小程序签到
cron: 30 8 * * *
------------------------------------------
#Notice:
变量名 qianjinjiankang
变量值：wx_server 里的 openid/账号标识，多账户&或换行
依赖变量：wx_server_url、wx_auth

⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充本声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
*/

const { Env } = require("../tools/env.js");
const $ = new Env("千金健康生活微信小程序签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ckName = "qianjinjiankang";
const strSplitor = "#";
const MINI_APP_ID = "wxf5a93358ebb65e29";
const PAGE_VERSION = "35";
const API_BASE = "https://rs-crm.qjyy.com";
const WX_API_BASE = "https://ops-crm.qjyy.com/api/wechat";
const TASK_PACK_ACTIVITY_ID = 12;
const SIGN_TASK_CODE = "8361ec6193a74fabb3a9f67b73858f7b";
const TOKEN_CACHE_FILE = path.join(__dirname, "qianjinjiankang_token_cache.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13)";

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
    return token ? `${token.slice(0, 8)}***${token.slice(-6)}` : "";
}

function maskPhone(phone = "") {
    const text = String(phone || "");
    return /^1\d{10}$/.test(text) ? `${text.slice(0, 3)}****${text.slice(7)}` : text;
}

function getContent(result) {
    return result?.content || result?.data || result || {};
}

function isTokenError(e) {
    return /401|403|token|登录|授权|ERR_USER_TOKEN_ERROR|用户令牌/i.test(String(e?.message || e || ""));
}

class Task {
    constructor(env) {
        this.index = $.userIdx++;
        this.user = String(env || "").trim().split(strSplitor);
        this.openid = (this.user[0] || "").trim();
        this.token = "";
        this.tenId = "";
        this.wxOpenid = "";
        this.customerInfo = {};
    }

    async run() {
        const cached = this.getCachedToken();
        if (cached?.accessToken) {
            this.applyToken(cached);
            $.log(`账号[${this.index}] 使用缓存token: ${shortToken(this.token)}`);
            if (!(await this.checkToken())) {
                $.log(`账号[${this.index}] 缓存token失效，重新登录`);
                this.removeCachedToken();
            }
        }

        if (!this.token) {
            await this.loginByWxCode();
            if (!this.token) return;
        }

        await this.getCustomerInfo();
        await this.signIn();
    }

    getCachedToken() {
        const cache = readTokenCache();
        return cache[this.openid] || null;
    }

    saveCachedToken() {
        if (!this.token || !this.tenId) return;
        const cache = readTokenCache();
        cache[this.openid] = {
            accessToken: this.token,
            tenId: this.tenId,
            wxOpenid: this.wxOpenid,
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
        this.tenId = "";
        this.wxOpenid = "";
    }

    applyToken(data = {}) {
        this.token = data.accessToken || data.token || "";
        this.tenId = data.tenId || data.tenid || "";
        this.wxOpenid = data.wxOpenid || data.openid || "";
    }

    headers(extra = {}) {
        return {
            "content-type": "application/json; charset=UTF-8",
            Authorization: this.token || "",
            wxAppId: MINI_APP_ID,
            Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            "User-Agent": USER_AGENT,
            ...extra,
        };
    }

    async request(method, url, data = {}, options = {}) {
        const req = {
            method,
            url,
            headers: this.headers(options.headers || {}),
            timeout: options.timeout || 30000,
            validateStatus: () => true,
        };
        if (method === "GET") req.params = data;
        else req.data = data || {};

        const { data: result, status } = await axios.request(req);
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);
        if (!result || ![0, 200].includes(Number(result.code))) {
            throw new Error(`${result?.code ?? ""} ${result?.message || result?.msg || JSON.stringify(result)}`.trim());
        }
        return getContent(result);
    }

    async api(pathname, data = {}, method = "POST") {
        if (!this.tenId) throw new Error("缺少tenId，无法请求业务接口");
        return this.request(method, `${API_BASE}${pathname}?tenid=${this.tenId}`, data);
    }

    async getOperateData() {
        const wxServerUrl = process.env.wx_server_url;
        const wxAuth = process.env.wx_auth;
        if (!wxServerUrl || !wxAuth) throw new Error("未配置 wx_server_url 或 wx_auth");

        const { data } = await axios.post(
            `${wxServerUrl.replace(/\/$/, "")}/wx/getuserinfo`,
            { appid: MINI_APP_ID, openid: this.openid },
            {
                headers: { auth: wxAuth },
                timeout: 45000,
                validateStatus: () => true,
            },
        );
        const result = data?.data || {};
        if (!data?.status || !result.code) {
            throw new Error(`wx_server 未返回code: ${JSON.stringify(data)}`);
        }
        return result;
    }

    async loginByWxCode() {
        try {
            const wxData = await this.getOperateData();
            const data = await this.request("GET", `${WX_API_BASE}/user/auth/mini`, {
                code: wxData.code,
                appId: MINI_APP_ID,
                app: 503,
            }, { headers: { Authorization: "" } });

            this.token = data.accessToken || "";
            this.tenId = data.tenId || "";
            this.wxOpenid = data.openid || "";
            if (!this.token || !this.tenId) throw new Error(`登录响应缺少token/tenId: ${JSON.stringify(data)}`);

            this.saveCachedToken();
            $.log(`账号[${this.index}] CODE登录成功: tenId=${this.tenId} openid=${this.wxOpenid}`);
        } catch (e) {
            $.log(`账号[${this.index}] CODE登录失败: ${e.message || e}`);
        }
    }

    async checkToken() {
        try {
            await this.getCustomerInfo(false);
            return true;
        } catch (e) {
            return false;
        }
    }

    async getCustomerInfo(log = true) {
        const data = await this.api("/api/crm/rest/v2/customer/info", {});
        this.customerInfo = data || {};
        if (log) {
            $.log(`账号[${this.index}] 会员: ${this.customerInfo.cstName || this.customerInfo.cstId || ""} ${maskPhone(this.customerInfo.phone || "")} 积分=${this.customerInfo.pointall ?? this.customerInfo.points ?? "未知"}`);
        }
        return data;
    }

    async getSignTaskStatus() {
        return this.api("/api/crm/iactivity/taskPack/status", {
            activityId: TASK_PACK_ACTIVITY_ID,
            taskCode: SIGN_TASK_CODE,
        });
    }

    async signIn() {
        try {
            const status = await this.getSignTaskStatus();
            $.log(`账号[${this.index}] 签到状态: status=${status.status ?? ""} buttonType=${status.buttonType || ""}`);
            if ([1, 2, 55].includes(Number(status.status)) || /已完成|已签到/i.test(String(status.buttonType || ""))) {
                $.log(`账号[${this.index}] 今日已签到`);
                return;
            }

            const data = await this.api("/api/crm/iactivity/taskPack/participate", {
                activityId: TASK_PACK_ACTIVITY_ID,
                taskCode: SIGN_TASK_CODE,
            });
            const awards = (data.givenRecords || []).map((item) => item.awardName).filter(Boolean).join("+");
            $.log(`账号[${this.index}] 签到成功${awards ? `，获得${awards}` : ""}`);
        } catch (e) {
            const message = e.message || String(e);
            $.log(`账号[${this.index}] 签到失败: ${message}`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }
}

!(async () => {
    $.checkEnv(ckName);
    for (const item of $.userList) {
        if (!item) continue;
        const task = new Task(item);
        await task.run();
        await $.wait(1000);
    }
})()
    .catch((e) => $.log(e.message || e))
    .finally(() => $.done());
