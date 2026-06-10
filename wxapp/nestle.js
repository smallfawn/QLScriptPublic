/*
------------------------------------------
@Author: sm
@Date: 2026.06.09
@Description: 雀巢会员俱乐部 登录/信息查询/签到
cron: 20 8 * * *
------------------------------------------
变量名：nestle
变量值：wx_server 里的 openid，多账号用 & 或换行

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("雀巢会员俱乐部");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CK_NAME = "nestle";
const APP = { name: "雀巢会员俱乐部", appid: "wxc5db704249c9bb31" };
const API_BASE = "https://crm.nestlechinese.com/openapi/";
const WX_SERVER_URL = (process.env.wx_server_url || "http://192.168.31.196:8787").replace(/\/$/, "");
const WX_AUTH = process.env.wx_auth || "";
const TOKEN_CACHE_FILE = path.join(__dirname, "nestle_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

function splitAccounts(value = "") {
    return String(value)
        .split(/\n|&/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function short(value, max = 260) {
    if (value === undefined || value === null) return "";
    const text = typeof value === "string" ? value : JSON.stringify(value);
    return text.length > max ? `${text.slice(0, max)}...` : text;
}

function maskToken(token = "") {
    const value = String(token || "");
    if (!value) return "";
    return value.length > 20 ? `${value.slice(0, 12)}***${value.slice(-8)}` : `${value.slice(0, 6)}***`;
}

function maskPhone(phone = "") {
    return String(phone || "").replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function readTokenCache() {
    try {
        if (!fs.existsSync(TOKEN_CACHE_FILE)) return {};
        return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {};
    } catch {
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

function decodeJwt(token = "") {
    try {
        const payload = String(token).split(".")[1];
        if (!payload) return {};
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
    } catch {
        return {};
    }
}

function firstValue(...values) {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return "";
}

async function request(options) {
    const res = await axios.request({
        timeout: 20000,
        validateStatus: () => true,
        ...options,
        headers: {
            "User-Agent": USER_AGENT,
            Accept: "application/json, text/plain, */*",
            ...(options.headers || {}),
        },
    });
    return { status: res.status, headers: res.headers || {}, data: res.data };
}

async function getWxCode(openid) {
    if (!WX_AUTH) throw new Error("未配置 wx_auth，无法从 wx_server 获取 code");
    const { status, data } = await request({
        method: "POST",
        url: `${WX_SERVER_URL}/wx/code`,
        headers: { auth: WX_AUTH, "content-type": "application/json" },
        data: { appid: APP.appid, openid },
    });
    const code = data?.data?.code || data?.code;
    if (status !== 200 || !code) throw new Error(`获取code失败 HTTP ${status}: ${short(data)}`);
    return code;
}

class NestleMember {
    constructor(openid, index) {
        this.openid = openid;
        this.index = index;
        this.authorization = "";
        this.jwt = {};
        this.userInfo = {};
        this.pointsInfo = {};
        this.signInfo = {};
    }

    cacheKey() {
        return this.openid;
    }

    getCachedToken() {
        const cache = readTokenCache();
        const item = cache[this.cacheKey()];
        if (!item?.authorization || !item?.expiresAt) return "";
        if (Date.now() > Number(item.expiresAt) - 5 * 60 * 1000) return "";
        return item.authorization;
    }

    saveCachedToken() {
        if (!this.authorization) return;
        const exp = Number(this.jwt.exp || 0) * 1000;
        const cache = readTokenCache();
        cache[this.cacheKey()] = {
            authorization: this.authorization,
            userId: this.jwt.user_id || "",
            unionid: this.jwt.unionid || "",
            openid: this.jwt.mini_openid || this.openid,
            expiresAt: exp || Date.now() + 50 * 60 * 1000,
            updatedAt: new Date().toISOString(),
        };
        writeTokenCache(cache);
    }

    async login() {
        const cached = this.getCachedToken();
        if (cached) {
            this.authorization = cached;
            this.jwt = decodeJwt(cached.replace(/^Bearer\s+/i, ""));
            $.log(`登录：使用缓存 token ${maskToken(this.authorization)}`);
            return;
        }

        const code = await getWxCode(this.openid);
        const body = new URLSearchParams({
            client_id: "wechatMini",
            client_secret: "secret",
            grant_type: "wechat_auth_code",
            auth_code: code,
        });
        const { status, data } = await request({
            method: "POST",
            url: `${API_BASE}identityservice/connect/token`,
            headers: { "content-type": "application/x-www-form-urlencoded" },
            data: body.toString(),
        });
        const accessToken = data?.access_token || "";
        const tokenType = data?.token_type || "Bearer";
        if (status !== 200 || !accessToken) throw new Error(`登录失败 HTTP ${status}: ${short(data)}`);
        this.authorization = `${tokenType} ${accessToken}`;
        this.jwt = decodeJwt(accessToken);
        $.log(
            `登录：成功 ${maskToken(this.authorization)}，user_id=${this.jwt.user_id || "0"}，openid=${this.jwt.mini_openid || this.openid}`
        );
        this.saveCachedToken();
    }

    async api(method, endpoint, data = {}, allowFail = false) {
        const res = await request({
            method,
            url: `${API_BASE}${endpoint}`,
            headers: {
                "content-type": "application/json",
                Authorization: this.authorization,
                displayVersion: "0",
            },
            data: method === "GET" ? undefined : data,
            params: method === "GET" ? data : undefined,
        });
        if (!allowFail && (res.status < 200 || res.status >= 300)) {
            throw new Error(`${endpoint} HTTP ${res.status}: ${short(res.data)}`);
        }
        return res.data;
    }

    async queryUser() {
        const res = await this.api("GET", "member/api/User/GetUserInfo", {}, true);
        if (Number(res?.errcode) !== 200) {
            $.log(`用户信息：查询失败 ${short(res)}`);
            return;
        }
        this.userInfo = res.data || {};
        const user = this.userInfo;
        const name = firstValue(user.nickname, user.nickName, user.name, user.user_name, "未知");
        const mobile = maskPhone(firstValue(user.mobile, user.phone, user.tel));
        const userId = firstValue(user.userid, user.user_id, this.jwt.user_id, "未知");
        const level = firstValue(user.level_name, user.member_level_name, user.grade_name, user.memberLevelName, "未知");
        $.log(`用户信息：${name}${mobile ? ` ${mobile}` : ""}，会员ID=${userId}，等级=${level}`);
    }

    async queryPoints(prefix = "巢币") {
        const res = await this.api("POST", "pointsservice/api/Points/getuserbalance", {}, true);
        if (Number(res?.errcode) !== 200) {
            $.log(`${prefix}：查询失败 ${short(res)}`);
            return;
        }
        this.pointsInfo = res.data || {};
        const points = firstValue(
            this.pointsInfo.balance,
            this.pointsInfo.points,
            this.pointsInfo.point,
            this.pointsInfo.available_points,
            this.pointsInfo.total_points,
            this.pointsInfo.amount,
            this.pointsInfo
        );
        $.log(`${prefix}：${typeof points === "object" ? short(points, 220) : points}`);
    }

    currentMonthFirstDay() {
        const now = new Date();
        const year = now.getFullYear();
        const month = `${now.getMonth() + 1}`.padStart(2, "0");
        return `${year}-${month}-01`;
    }

    async querySign(prefix = "签到信息") {
        const res = await this.api(
            "POST",
            "activityservice/api/sign2025/getlist",
            { rule_id: 1, time: this.currentMonthFirstDay(), goods_rule_id: 1 },
            true
        );
        if (Number(res?.errcode) !== 200) {
            $.log(`${prefix}：查询失败 ${short(res)}`);
            return;
        }
        this.signInfo = res.data || {};
        const today = String(this.signInfo.time || "").replace(/T/g, " ").slice(0, 10);
        const signedDays = Array.isArray(this.signInfo.list) ? this.signInfo.list.length : firstValue(this.signInfo.sign_day, 0);
        const todaySigned = Array.isArray(this.signInfo.list)
            ? this.signInfo.list.some((item) => String(item.sign_time || "").slice(0, 10) === today)
            : "";
        const status = todaySigned === "" ? "" : todaySigned ? "，今日已签" : "，今日未签";
        $.log(`${prefix}：日期=${today || "未知"}，本月已签=${signedDays}${status}`);
    }

    async sign() {
        const res = await this.api("POST", "activityservice/api/sign2025/sign", { rule_id: 1, goods_rule_id: 1 }, true);
        if (Number(res?.errcode) === 200) {
            const data = res.data || {};
            $.log(`签到：成功，获得巢币=${firstValue(data.sign_points, data.points, data.point, "未知")}，连续=${firstValue(data.sign_day, "未知")}`);
            return;
        }
        const msg = res?.errmsg || res?.msg || short(res);
        if (/已签|重复|already/i.test(String(msg))) $.log(`签到：今日已签到，${msg}`);
        else $.log(`签到：失败，${short(res)}`);
    }

    async run() {
        $.log(`\n========== ${APP.name} 账号[${this.index}] ${this.openid} ==========`);
        await this.login();
        await this.queryUser();
        await this.queryPoints("签到前巢币");
        await this.querySign("签到前");
        await this.sign();
        await this.queryPoints("签到后巢币");
        await this.querySign("签到后");
        this.saveCachedToken();
    }
}

(async () => {
    const accounts = splitAccounts(process.env[CK_NAME] || process.env.wx_openid || "");
    if (!accounts.length) {
        $.log(`未配置 ${CK_NAME}`);
        await $.done();
        return;
    }
    $.log(`共找到${accounts.length}个账号`);
    for (let i = 0; i < accounts.length; i++) {
        const runner = new NestleMember(accounts[i], i + 1);
        try {
            await runner.run();
        } catch (e) {
            $.log(`账号[${i + 1}] 执行失败：${e.message || e}`);
        }
        await $.wait(800);
    }
    await $.done();
})().catch(async (e) => {
    $.log(`脚本异常：${e.stack || e.message || e}`);
    await $.done();
});
