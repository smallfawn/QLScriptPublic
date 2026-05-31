/*
------------------------------------------
@Author: sm
@Date: 2026.05.31
@Description: 花生帮粉丝俱乐部签到任务
cron: 41 8 * * *
------------------------------------------
变量名：wb
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("花生帮粉丝俱乐部签到任务");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const MINI_APP_ID = "wx841a8e9e6972a9a6";
const PAGE_VERSION = "102";
const API_BASE = "https://restapi.supercarrier8.com";
const ENTERPRISE_NO = "131932658387";
const TOKEN_CACHE_FILE = path.join(__dirname, "wb_token_cache.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";
const TARGET_TASKS = {
    i_0002: "浏览微信推文",
    i_0003: "观看视频",
    i_0006: "浏览四格漫画",
};

let ckName = "wb";

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

function md5(text) {
    return crypto.createHash("md5").update(String(text)).digest("hex");
}

function base64(value) {
    if (!value) return "";
    const text = typeof value === "string" ? value : JSON.stringify(value);
    return Buffer.from(text, "utf8").toString("base64");
}

function getSign(method, apiPath, params, timestamp) {
    let valueText = "";
    const keys = Object.keys(params || {}).sort();
    for (const key of keys) {
        let value = params[key];
        if (value === "" || value === null || value === undefined) continue;
        if (typeof value !== "string") {
            if (Object.prototype.toString.call(value) === "[object Object]") {
                Object.keys(value).forEach((itemKey) => {
                    if (value[itemKey] === null) delete value[itemKey];
                });
            }
            value = JSON.stringify(value);
        }
        valueText += value;
    }
    const paramSign = base64(valueText);
    return md5(base64(`${method.toUpperCase()}${apiPath}${paramSign}${timestamp}`));
}

function formatMonth() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function isTokenError(message) {
    return /2032401|token|登录|授权|invalid|expire|过期|401|403/i.test(String(message || ""));
}

class Task {
    constructor(openid) {
        this.index = $.userIdx++;
        this.openid = String(openid || "").trim();
        this.token = "";
        this.appOpenid = "";
        this.userId = "";
        this.userType = 0;
        this.mobile = "";
        this.currentJf = 0;
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

        if (!this.token) {
            await this.loginByWxCode();
            if (!this.token) return;
        }

        await this.getUser();
        await this.signIn();
        await this.doTargetTasks();
        this.saveCachedToken();
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
            appOpenid: this.appOpenid,
            userId: this.userId,
            userType: this.userType,
            mobile: this.mobile,
            currentJf: this.currentJf,
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
        this.appOpenid = "";
        this.userId = "";
        this.userType = 0;
    }

    applyToken(data = {}) {
        this.token = data.token || "";
        this.appOpenid = data.appOpenid || data.openid || "";
        this.userId = data.userId || data.id || "";
        this.userType = data.userType || 0;
        this.mobile = data.mobile || "";
        this.currentJf = data.currentJf || 0;
    }

    getHeaders(method, apiPath, payload) {
        const timestamp = String(Date.now());
        return {
            "User-Agent": USER_AGENT,
            "Referer": `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "X-Request-Lang": "zh-CN",
            "Authorization": this.token || "",
            "x-request-ts": timestamp,
            "x-request-sign": getSign(method, `/${apiPath}`, payload, timestamp),
        };
    }

    async request(apiPath, data = {}, method = "GET", options = {}) {
        const payload = options.enterpriseNo ? { ...data } : { enterpriseNo: ENTERPRISE_NO, ...data };
        const requestOptions = {
            method,
            url: `${API_BASE}/${apiPath}`,
            headers: this.getHeaders(method, apiPath, payload),
            timeout: 20000,
            validateStatus: () => true,
        };
        if (method.toUpperCase() === "GET") requestOptions.params = payload;
        else requestOptions.data = payload;

        const { status, data: result } = await axios.request(requestOptions);
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);
        if (!options.allowAnyCode && result?.code !== 200) {
            const err = new Error(result?.message || JSON.stringify(result));
            err.code = result?.code;
            throw err;
        }
        return result;
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
            const wxLogin = await this.request("marketing/v1/wechat-user-auth/miniapp-login", {
                authorizerAppid: MINI_APP_ID,
                jsCode: code,
            }, "GET");
            this.appOpenid = wxLogin.data?.openid || "";
            const login = await this.request("marketing/v1/customer-login/wechat-openid", {
                serviceSign: wxLogin.data?.serviceSign,
                openid: this.appOpenid,
                appId: MINI_APP_ID,
                appType: 2,
            }, "POST");
            this.applyToken({
                token: login.data?.token,
                appOpenid: this.appOpenid,
                userId: login.data?.id,
                userType: login.data?.userType,
                mobile: login.data?.mobile || "",
            });
            this.saveCachedToken();
            $.log(`账号[${this.index}] 登录成功: userId=${this.userId || "未知"}`);
        } catch (e) {
            $.log(`账号[${this.index}] 登录失败: ${e.message || e}`);
        }
    }

    async checkToken() {
        try {
            if (!this.token || !this.appOpenid) return false;
            await this.getUser(true);
            return true;
        } catch (e) {
            return false;
        }
    }

    async getUser(silent = false) {
        const result = await this.request("marketing/shyx/marketing/v1/cus/get-user-info", {
            openId: this.appOpenid,
            enterpriseNo: ENTERPRISE_NO,
        }, "GET");
        const user = result.data || {};
        this.userId = user.id || this.userId;
        this.mobile = user.mobile || this.mobile;
        this.currentJf = user.currentJf ?? this.currentJf;
        this.saveCachedToken();
        if (!silent) $.log(`账号[${this.index}] 用户: userId=${this.userId || "未知"} 能量${this.currentJf ?? 0}`);
        return user;
    }

    async signIn() {
        try {
            const monthInfo = await this.request("marketing/cusSign/v1/getUserSignInfo", {
                signMonth: formatMonth(),
            }, "GET");
            const signList = Array.from(new Set(monthInfo.data?.signDateList || []));
            $.log(`账号[${this.index}] 签到记录: 本月${signList.length}天 连续${monthInfo.data?.continuousSignDays || 0}天`);

            const justSign = await this.request("marketing/sign/woBeiCus/v1/justSign", {}, "POST", { allowAnyCode: true });
            if (justSign.code !== 200 && /已签|签到/.test(String(justSign.message || ""))) {
                $.log(`账号[${this.index}] 今日已签到`);
                return;
            }
            if (justSign.code !== 200) throw new Error(justSign.message || JSON.stringify(justSign));
            if (justSign.data === 0 || justSign.data === "0") {
                $.log(`账号[${this.index}] 今日已签到`);
                return;
            }

            const callback = await this.request("marketing/v1/client-sign/sign-callback", {
                enterpriseNo: ENTERPRISE_NO,
                userId: this.userId,
            }, "GET", { allowAnyCode: true });
            if (callback.code === 200) {
                const rewards = Array.isArray(callback.data) ? callback.data : [];
                const energy = rewards.find((item) => String(item.rewardType) === "1" || String(item.rewardType) === "2");
                $.log(`账号[${this.index}] 签到成功: +${energy?.rewardValue || justSign.data || "未知"}能量`);
            } else {
                $.log(`账号[${this.index}] 签到回调失败: ${callback.message || callback.code}`);
            }
        } catch (e) {
            const message = e.message || e;
            if (/已签|今日已签到|重复/.test(String(message))) {
                $.log(`账号[${this.index}] 今日已签到`);
                return;
            }
            $.log(`账号[${this.index}] 签到失败: ${message}`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }

    async getTaskList() {
        const result = await this.request("marketing/sign/marketing/v1/cus/get-user-task-list", {
            UserID: this.userId,
            UserType: this.userType,
        }, "GET");
        return Array.isArray(result.data) ? result.data : [];
    }

    async setTaskOk(task) {
        return await this.request("marketing/sign/marketing/v1/cus/set-task-ok", {
            taskId: task.id,
            userId: this.userId,
            mode: "1",
        }, "POST", { allowAnyCode: true });
    }

    async completeTask(task) {
        return await this.request("marketing/sign/marketing/v1/cus/task-complete", {
            taskId: task.id,
            userId: this.userId,
        }, "POST", { allowAnyCode: true });
    }

    async doTargetTasks() {
        try {
            const taskList = await this.getTaskList();
            const tasks = taskList.filter((task) => TARGET_TASKS[task.indexNo]);
            if (!tasks.length) {
                $.log(`账号[${this.index}] 未找到目标任务`);
                return;
            }

            for (const task of tasks) {
                const taskName = task.taskName || TARGET_TASKS[task.indexNo];
                if (String(task.status) === "2") {
                    $.log(`账号[${this.index}] ${taskName}: 已完成`);
                    continue;
                }

                if (String(task.status) === "0") {
                    const ok = await this.setTaskOk(task);
                    if (ok.code !== 200) {
                        $.log(`账号[${this.index}] ${taskName}: 标记完成失败 ${ok.message || ok.code}`);
                        continue;
                    }
                }

                const complete = await this.completeTask(task);
                if (complete.code === 200) {
                    $.log(`账号[${this.index}] ${taskName}: 领取成功 +${task.awardsValue || "未知"}能量`);
                } else if (complete.code === 21210108) {
                    $.log(`账号[${this.index}] ${taskName}: 奖励已领取`);
                } else {
                    $.log(`账号[${this.index}] ${taskName}: 领取失败 ${complete.message || complete.code}`);
                }
            }
        } catch (e) {
            const message = e.message || e;
            $.log(`账号[${this.index}] 任务中心失败: ${message}`);
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
