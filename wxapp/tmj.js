/*
------------------------------------------
@Author: sm
@Date: 2026.05.31
@Description: 谭木匠会员俱乐部签到
cron: 36 8 * * *
------------------------------------------
变量名：tmj
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("谭木匠会员俱乐部签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const MINI_APP_ID = "wxc6f9e3b38b25b840";
const PAGE_VERSION = "44";
const API_BASE = "https://mall-mobile-v6.vecrp.com/mobile";
const SECRET_KEY = "R6WbJ830wNsEdjH9GumwKYiYxHz0K9QD";
const TOKEN_CACHE_FILE = path.join(__dirname, "tmj_token_cache.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

let ckName = "tmj";

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

function sha1(text) {
    return crypto.createHash("sha1").update(String(text)).digest("hex");
}

function signPayload(data) {
    const keys = Object.keys(data).sort((a, b) => {
        const left = `${a}${data[a]}`;
        const right = `${b}${data[b]}`;
        if (left > right) return 1;
        if (left < right) return -1;
        return 0;
    });
    return sha1(keys.map((key) => `${key}${data[key]}`).join(""));
}

function todayInfo() {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const pad = (n) => String(n).padStart(2, "0");
    return {
        year: y,
        month: m,
        day,
        today: `${y}-${pad(m)}-${pad(day)}`,
        startDate: `${y}-${m}-01`,
        endDate: `${y}-${m}-${new Date(y, m, 0).getDate()}`,
    };
}

function normalizeDate(value) {
    const text = String(value || "").slice(0, 10);
    const parts = text.split("-");
    if (parts.length !== 3) return text;
    return `${parts[0]}-${String(Number(parts[1])).padStart(2, "0")}-${String(Number(parts[2])).padStart(2, "0")}`;
}

function isTokenError(message) {
    return /token|登录|授权|invalid|expire|过期|401|403/i.test(String(message || ""));
}

function getRows(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.rows)) return result.rows;
    if (Array.isArray(result?.records)) return result.records;
    if (Array.isArray(result?.list)) return result.list;
    return [];
}

class Task {
    constructor(openid) {
        this.index = $.userIdx++;
        this.openid = String(openid || "").trim();
        this.token = "";
        this.shopId = "";
        this.shopName = "";
        this.integralAccount = "";
        this.signActivityId = "";
        this.signTitle = "";
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

        await this.ensureIntegralAccount();
        await this.findSignActivity();
        await this.loadSignInfo();
        await this.doSign();
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
            shopId: this.shopId,
            shopName: this.shopName,
            integralAccount: this.integralAccount,
            signActivityId: this.signActivityId,
            signTitle: this.signTitle,
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
        this.shopId = "";
        this.shopName = "";
        this.integralAccount = "";
        this.signActivityId = "";
    }

    applyToken(data = {}) {
        this.token = data.token || data.mobileToken || "";
        this.shopId = data.shopId || "";
        this.shopName = data.shopName || "";
        this.integralAccount = data.integralAccount || "";
        this.signActivityId = data.signActivityId || "";
        this.signTitle = data.signTitle || "";
    }

    getHeaders(sign, ts) {
        return {
            "User-Agent": USER_AGENT,
            "Referer": `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json;charset=UTF-8",
            "appid": MINI_APP_ID,
            "token": this.token,
            "ts": ts,
            "startTime": ts,
            "sign": sign,
            "X-TracedId": crypto.randomUUID(),
        };
    }

    async request(apiPath, data = {}, method = "GET") {
        const payload = data || {};
        const ts = Date.now();
        const signData = method === "POST"
            ? { body: JSON.stringify(payload), secretKey: SECRET_KEY, ts }
            : { ...payload, secretKey: SECRET_KEY, ts };
        const options = {
            method,
            url: `${API_BASE}${apiPath}`,
            headers: this.getHeaders(signPayload(signData), ts),
            timeout: 20000,
            validateStatus: () => true,
        };
        if (method === "GET") options.params = payload;
        else options.data = payload;

        const { status, data: result } = await axios.request(options);
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);
        if (!result || result.success !== true) {
            const err = new Error(result?.msg || result?.message || JSON.stringify(result));
            err.code = result?.code;
            throw err;
        }
        return result.result;
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
            const data = await this.request("/wxAppLogin", {
                code,
                appid: MINI_APP_ID,
                shopId: null,
                envVersion: "",
                isEnterpriseWx: false,
                scene: "",
                referrerInfo: "",
            }, "POST");
            this.applyToken({
                token: data?.mobileToken,
                shopId: data?.shopId,
                shopName: data?.shopName,
            });
            this.saveCachedToken();
            $.log(`账号[${this.index}] 登录成功: ${this.shopName || this.shopId || "未知门店"}`);
        } catch (e) {
            $.log(`账号[${this.index}] 登录失败: ${e.message || e}`);
        }
    }

    async checkToken() {
        try {
            await this.ensureIntegralAccount(true);
            return true;
        } catch (e) {
            return false;
        }
    }

    async ensureIntegralAccount(silent = false) {
        const data = await this.request("/activity/common/queryIntegralSystemList", {
            shopId: this.shopId,
            earnSpendType: 1,
        });
        const first = Array.isArray(data) ? data[0] : null;
        this.integralAccount = first?.integralAccount || this.integralAccount;
        if (!silent) {
            $.log(`账号[${this.index}] 积分体系: ${first?.systemName || "未知"} ${first?.integralAlias || ""}`);
        }
        this.saveCachedToken();
    }

    async findSignActivity() {
        if (!this.integralAccount) await this.ensureIntegralAccount(true);
        const data = await this.request("/activity/common/queryActivityList", {
            earnSpendType: 1,
            shopId: this.shopId,
            pageNo: 1,
            pageSize: 10,
            integralAccount: this.integralAccount,
            activityType: 3,
        }, "POST");
        const activity = getRows(data).find((item) => String(item.activityType) === "3" && item.canJoin !== false);
        if (!activity?.activityId) throw new Error("未找到可参与的签到活动");
        this.signActivityId = activity.activityId;
        this.signTitle = activity.title || "每日签到";
        $.log(`账号[${this.index}] 签到活动: ${this.signTitle}`);
        this.saveCachedToken();
    }

    async loadSignInfo() {
        if (!this.signActivityId) await this.findSignActivity();
        const data = await this.request("/activity/sign/loadActivityInfo", {
            activityId: this.signActivityId,
            source: 1,
            shopId: this.shopId,
        });
        this.signTitle = data?.title || this.signTitle;
        const integral = data?.integral ?? data?.awardDescMobileList?.[0]?.awardDescList?.[0]?.integrationNum ?? "未知";
        $.log(`账号[${this.index}] 签到状态: ${data?.canJoin === false ? "不可参与" : "可参与"} 奖励${integral}积分`);
        this.saveCachedToken();
    }

    async queryMonthSign() {
        const date = todayInfo();
        return await this.request("/activity/sign/querySignInfoList", {
            activityId: this.signActivityId,
            startDate: date.startDate,
            endDate: date.endDate,
        }, "POST");
    }

    async doSign() {
        try {
            const date = todayInfo();
            const monthInfo = await this.queryMonthSign();
            const signedList = Array.isArray(monthInfo?.signDateList) ? monthInfo.signDateList : [];
            if (signedList.some((item) => normalizeDate(item) === date.today)) {
                $.log(`账号[${this.index}] 今日已签到`);
                return;
            }

            const data = await this.request("/activity/sign/sign", {
                activityId: this.signActivityId,
                shopId: this.shopId,
                signDate: date.today,
            }, "POST");
            const integral = data?.integral ?? data?.memberDayIntegral ?? "未知";
            $.log(`账号[${this.index}] 签到成功: +${integral}积分`);
        } catch (e) {
            const message = String(e.message || e);
            if (/已签|重复|already/i.test(message)) {
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
