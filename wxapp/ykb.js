/*
------------------------------------------
@Author: sm
@Date: 2026.05.31
@Description: 盈客宝电玩小程序签到
cron: 25 8 * * *
------------------------------------------
变量名：ykb
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("盈客宝电玩签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const MINI_APP_ID = "wxcd8a2d92245ee75b";
const API_BASE = "https://pw.gzych.vip";
const TEMPLATE_VERSION = "game_2.30.4";
const WECHAT_VERSION = process.env.ykb_wechat_version || "3.9.12";
const MOBILE_PLATFORM = process.env.ykb_mobile_platform || "windows";
const TOKEN_CACHE_FILE = path.join(__dirname, "ykb_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

let ckName = "ykb";

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

function maskPhone(phone = "") {
    return String(phone).replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function monthRange() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
    return {
        BeginDate: firstDay - 15 * 24 * 60 * 60 * 1000,
        EndDate: nextMonth - 1000 + 15 * 24 * 60 * 60 * 1000,
    };
}

function shortToken(token = "") {
    const value = String(token).replace(/^Token\s+/i, "");
    return value ? `${value.slice(0, 4)}***${value.slice(-4)}` : "";
}

class Task {
    constructor(account) {
        this.index = $.userIdx++;
        this.account = String(account || "").trim();
        this.token = "";
        this.openId = "";
        this.mallCode = "";
        this.h5Prefix = "";
        this.customerName = "";
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

        await this.getMemberInfo();
        await this.signIn();
    }

    getCachedToken() {
        const cache = readTokenCache();
        const item = cache[this.account];
        if (!item || !item.token) return null;
        return item;
    }

    saveCachedToken() {
        if (!this.token) return;
        const cache = readTokenCache();
        cache[this.account] = {
            token: this.token,
            openId: this.openId,
            mallCode: this.mallCode,
            h5Prefix: this.h5Prefix,
            customerName: this.customerName,
            updatedAt: new Date().toISOString(),
        };
        writeTokenCache(cache);
    }

    removeCachedToken() {
        const cache = readTokenCache();
        if (cache[this.account]) {
            delete cache[this.account];
            writeTokenCache(cache);
        }
        this.token = "";
    }

    applyToken(data = {}) {
        this.token = data.token || data.Token || "";
        this.openId = data.openId || data.OpenId || "";
        this.mallCode = data.mallCode || data.MallCode || "";
        this.h5Prefix = data.h5Prefix || data.RoterPrefix || "";
        this.customerName = data.customerName || data.CustomerName || "";
    }

    getHeaders(extra = {}) {
        const headers = {
            "User-Agent": USER_AGENT,
            "Referer": `https://servicewechat.com/${MINI_APP_ID}/3/page-frame.html`,
            "Accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            ...extra,
        };
        if (this.token) headers.Authorization = this.token;
        return headers;
    }

    async request({ method = "GET", apiPath, params = {}, data = {}, skipToken = false }) {
        const options = {
            method,
            url: `${API_BASE}${apiPath.startsWith("/") ? apiPath : `/${apiPath}`}`,
            headers: this.getHeaders(),
            timeout: 20000,
            validateStatus: () => true,
        };
        if (skipToken) delete options.headers.Authorization;
        if (method === "GET") options.params = params;
        else options.data = data;

        const { data: result, status } = await axios.request(options);
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);

        const responseStatus = result && result.ResponseStatus;
        if (!responseStatus) return result;

        const code = Number(responseStatus.ErrorCode);
        if (code !== 0) {
            const msg = responseStatus.Message || JSON.stringify(result);
            const err = new Error(`${msg}(${responseStatus.ErrorCode})`);
            err.code = responseStatus.ErrorCode;
            err.raw = result;
            throw err;
        }
        return result.Data;
    }

    async getLoginCode() {
        const { data } = await wechat.getCode(this.account);
        const code = data?.code || data?.data?.code;
        if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
        return code;
    }

    async loginByWxCode() {
        try {
            const code = await this.getLoginCode();
            const data = await this.request({
                method: "POST",
                apiPath: "/ykb_huiyuan/api/v3/MembeGameLogin/appletLogin",
                skipToken: true,
                data: {
                    Code: code,
                    AppId: MINI_APP_ID,
                    WechatVersion: WECHAT_VERSION,
                    MobilePlatform: MOBILE_PLATFORM,
                    MallCode: this.mallCode || "",
                    TemplateVersion: TEMPLATE_VERSION,
                    extra: { q: "" },
                },
            });
            this.applyToken(data);
            this.saveCachedToken();
            $.log(`账号[${this.index}] 登录成功: ${this.customerName || ""} openId=${this.openId || ""}`);
        } catch (e) {
            $.log(`账号[${this.index}] 登录失败: ${e.message || e}`);
        }
    }

    async checkToken() {
        try {
            await this.request({ apiPath: "/ykb_huiyuan/api/v1/MemberMine/Info" });
            return true;
        } catch (e) {
            return false;
        }
    }

    async getMemberInfo() {
        try {
            const data = await this.request({ apiPath: "/ykb_huiyuan/api/v1/MemberMine/Info" });
            const name = data?.Name || data?.NickName || this.customerName || "未知";
            const phone = data?.Phone ? ` ${maskPhone(data.Phone)}` : "";
            $.log(`账号[${this.index}] 会员: ${name}${phone} 代币=${data?.ARTotalIntegral ?? 0}`);
        } catch (e) {
            $.log(`账号[${this.index}] 查询会员信息失败: ${e.message || e}`);
            if (/token|登录|授权|非法请求|1500000004/i.test(String(e.message || e))) this.removeCachedToken();
        }
    }

    async getSignDetail() {
        return this.request({
            apiPath: "/ykb_huiyuan/api/v1/MemberCheckIn/GetDetail",
            params: monthRange(),
        });
    }

    async signIn() {
        try {
            let detail = await this.getSignDetail();
            const dailyReward = Array.isArray(detail?.RewardRules)
                ? detail.RewardRules.find((item) => item.CycleType === "Daily")
                : null;
            const rewardText = dailyReward ? `${dailyReward.Amount}${dailyReward.RewardAlias || ""}` : "未知";
            $.log(`账号[${this.index}] 签到状态: 已连续${detail?.Days ?? 0}天 今日奖励=${rewardText}`);

            if (detail?.IsCheckIn) {
                $.log(`账号[${this.index}] 今日已签到`);
                return;
            }

            const result = await this.request({
                apiPath: "/ykb_huiyuan/api/v1/MemberCheckIn/Submit",
            });
            $.log(`账号[${this.index}] 签到成功${result?.Message ? `: ${result.Message}` : ""}`);

            detail = await this.getSignDetail();
            $.log(`账号[${this.index}] 签到后累计: ${detail?.Days ?? 0}天`);
        } catch (e) {
            $.log(`账号[${this.index}] 签到失败: ${e.message || e}`);
            if (/token|登录|授权|非法请求|1500000004/i.test(String(e.message || e))) this.removeCachedToken();
        }
    }
}

!(async () => {
    $.checkEnv(ckName);
    for (const account of $.userList) {
        await new Task(account).run();
    }
})()
    .catch((e) => $.log(e.message || e))
    .finally(() => $.done());
