/*
------------------------------------------
@Author: sm
@Date: 2026.05.31
@Description: 龙湖天街小程序签到
cron: 35 8 * * *
------------------------------------------
变量名：longfor
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值

可选变量：
longfor_dx_token     手动指定顶象 constID
longfor_gps          指定 gps，经纬度格式：longitude,latitude
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("龙湖天街签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const MINI_APP_ID = "wx50282644351869da";
const PAGE_VERSION = "506";
const API_VERSION = "v1_25_0";
const APP_VERSION = "1.25.0";
const CHANNEL = "C2";
const BU_CODE = "C20400";
const BASE_HOST = "https://gw2c-hw-open.longfor.com/supera";
const MEMBER_HOST = `${BASE_HOST}/member`;
const TASK_HOST = "https://gw2c-hw-open.longfor.com/lmarketing-task-api-mvc-prod";
const MEMBER_GAIA_KEY = "98717e7a-a039-46af-8143-be7558a089c0";
const TASK_GAIA_KEY = "c06753f1-3e68-437d-b592-b94656ea5517";
const MINI_SIGN_SECRET = "Q74eKtH5LePYfSjIiflUbCL2gxjTa7rF";
const DX_MINI_CONFIG = {
    appId: "d1a43734fc59aeae9f1562dbd70fdf54",
    server: "https://ly-sta.longhu.net/udid/w1",
    cache: true,
    gps: true,
};
const DX_ALPHABET = "S0DOZN9bBJyPV-qczRa3oYvhGlUMrdjW7m2CkE5_FuKiTQXnwe6pg8fs4HAtIL1x=";
const DX_LID_KEY = "_dx_uzZo5y";
const DX_TOKEN_KEY = "_dx_raAh8q";
const DX_STORAGE = new Map();
const DX_KEY_MAP = {
    SDKVersion: "sv",
    accuracy: "ac",
    altitude: "att",
    available: "al",
    batteryLevel: "bl",
    benchmarkLevel: "bml",
    brand: "bd",
    BSSID: "bs",
    collectTime: "ct",
    discovering: "dc",
    fontSizeSetting: "fss",
    horizontalAccuracy: "ha",
    language: "lang",
    latitude: "lt",
    longitude: "lgt",
    model: "md",
    networkType: "nt",
    pixelRatio: "pr",
    platform: "pf",
    screenHeight: "sh",
    screenWidth: "sw",
    secure: "se",
    speed: "sp",
    signalStrength: "ss",
    statusBarHeight: "",
    supportMode: "sm",
    system: "sy",
    SSID: "si",
    version: "vs",
    verticalAccuracy: "va",
    windowHeight: "wh",
    windowWidth: "ww",
    gps: "gps",
};
const TOKEN_CACHE_FILE = path.join(__dirname, "longfor_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

let ckName = "longfor";

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

function readCache() {
    try {
        if (!fs.existsSync(TOKEN_CACHE_FILE)) return {};
        return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {};
    } catch (e) {
        return {};
    }
}

function writeCache(cache) {
    try {
        fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
    } catch (e) {
        $.log(`写入token缓存失败: ${e.message || e}`);
    }
}

function shortValue(value = "") {
    const text = String(value || "");
    return text ? `${text.slice(0, 4)}***${text.slice(-4)}` : "";
}

function uuid() {
    return crypto.randomUUID().replace(/-/g, "");
}

function canonicalize(data = {}) {
    return Object.keys(data || {})
        .sort()
        .map((key) => {
            let value = data[key];
            if (Array.isArray(value)) {
                let text = "[";
                if (!value.length) text += "]";
                value.forEach((item, index) => {
                    if (Array.isArray(item)) text += JSON.stringify(item);
                    else if (typeof item === "object" && item !== null) text += `{${canonicalize(item)}}`;
                    else text += item;
                    text += index < value.length - 1 ? "," : "]";
                });
                value = text;
            } else if (typeof value === "object" && value !== null) {
                value = `{${canonicalize(value)}}`;
            }
            return `${value}`.trim() && `${value}` !== "null" ? `${key}=${value}` : "";
        })
        .filter(Boolean)
        .join("|");
}

function miniSign(data) {
    const timestamp = Date.now().toString();
    const body = canonicalize(JSON.parse(JSON.stringify(data || {})));
    const raw = `${body ? `${body}&` : ""}${timestamp}&${MINI_SIGN_SECRET}`;
    return {
        "X-LONGZHU-TimeStamp": timestamp,
        "X-Client-Type": "microApp",
        "X-LONGZHU-Sign": crypto.createHash("md5").update(raw).digest("hex"),
    };
}

function dxMakeLocalId(length = 32) {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let value = "";
    for (let i = 0; i < length; i++) value += chars.charAt(Math.floor(Math.random() * chars.length));
    return value;
}

function dxEncrypt(data) {
    const text = JSON.stringify(data) || "";
    let output = "";
    for (let index = 0; index < text.length; ) {
        const first = text.charCodeAt(index++);
        const second = text.charCodeAt(index++);
        const third = text.charCodeAt(index++);
        const a = first >> 2;
        const b = ((first & 3) << 4) | (second >> 4);
        let c = ((second & 15) << 2) | (third >> 6);
        let d = third & 63;
        if (Number.isNaN(second)) c = d = 64;
        else if (Number.isNaN(third)) d = 64;
        output += DX_ALPHABET.charAt(a) + DX_ALPHABET.charAt(b) + DX_ALPHABET.charAt(c) + DX_ALPHABET.charAt(d);
    }
    return output;
}

function dxSelectMethod(param) {
    return param && param.length > 1024 ? "POST" : "GET";
}

function dxShorten(data = {}) {
    const output = {};
    for (const key in data) output[DX_KEY_MAP[key] ? DX_KEY_MAP[key] : key] = data[key];
    return output;
}

function dxSystemInfo() {
    return {
        brand: "microsoft",
        model: "Windows WeChat",
        pixelRatio: 1,
        screenWidth: 414,
        screenHeight: 896,
        windowWidth: 414,
        windowHeight: 896,
        statusBarHeight: 0,
        language: "zh_CN",
        version: "8.0.58",
        system: "Windows 10 x64",
        platform: "windows",
        fontSizeSetting: 16,
        SDKVersion: "3.9.12",
        benchmarkLevel: 1,
        batteryLevel: 100,
    };
}

async function dxCollect(options = {}) {
    const start = Date.now();
    const data = {
        networkType: "wifi",
        ...dxSystemInfo(),
    };
    if (options.gps) data.gps = process.env.longfor_gps || "116.397128,39.916527";
    data.collectTime = Date.now() - start;
    return dxShorten(data);
}

class MiniDxConstId {
    constructor(options = {}) {
        this.options = { ...DX_MINI_CONFIG, ...options };
        this.options.appId = this.options.appId || this.options.appKey;
        if (!this.options.server || !this.options.appId) throw new Error("missing dx server/appId");
    }

    getToken() {
        return DX_STORAGE.get(DX_TOKEN_KEY) || "";
    }

    setToken(token) {
        DX_STORAGE.set(DX_TOKEN_KEY, token);
    }

    async getLid() {
        const lid = DX_STORAGE.get(DX_LID_KEY) || `${Date.now()}${dxMakeLocalId()}`;
        DX_STORAGE.set(DX_LID_KEY, lid);
        return lid;
    }

    mergeOptions(extra = {}) {
        const data = { ...extra };
        ["appId", "userId", "openId", "scene"].forEach((key) => {
            if (this.options[key]) data[key] = encodeURIComponent(this.options[key]);
        });
        data.appKey = data.appId;
        delete data.appId;
        return data;
    }

    async request(param, token = "") {
        const method = dxSelectMethod(param);
        const options = {
            method,
            url: this.options.server,
            headers: {
                Param: method === "POST" ? "" : param,
                "If-None-Match": token,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 15000,
            validateStatus: () => true,
        };
        if (method === "POST") options.data = new URLSearchParams({ Param: param }).toString();
        else options.params = { Param: "" };
        const { data } = await axios.request(options);
        return data;
    }

    async detect() {
        const lid = await this.getLid();
        const collected = await dxCollect(this.options);
        const param = dxEncrypt(this.mergeOptions({ lid, ...collected }));
        const data = await this.request(param, "");
        if (Number(data.status) === 2) {
            this.setToken(data.data);
            return data.data;
        }
        throw new Error(`dx status: ${data.status}`);
    }

    async generate() {
        const lid = await this.getLid();
        const param = dxEncrypt(this.mergeOptions({ lid, cache: !!this.options.cache }));
        const data = await this.request(param, this.getToken());
        const status = Number(data.status);
        if (status === 1 || status === 2) {
            this.setToken(data.data);
            return data.data;
        }
        if (status === -4 && data.data) {
            DX_STORAGE.set(DX_LID_KEY, data.data);
            return this.detect();
        }
        return this.detect();
    }
}

async function getDxToken() {
    if (process.env.longfor_dx_token) return process.env.longfor_dx_token;
    return new MiniDxConstId().generate();
}

function ok(code) {
    return ["200", "0000", "10000"].includes(String(code));
}

function tokenError(error) {
    return /token|登录|授权|未登录|801007|900005|900006/i.test(String(error?.message || error));
}

class Task {
    constructor(account) {
        this.index = $.userIdx++;
        this.account = String(account || "").trim();
        this.token = "";
        this.lmid = "";
        this.expire = 0;
        this.activityNo = "";
    }

    applyToken(data = {}) {
        this.token = data.token || "";
        this.lmid = data.lmid || "";
        this.expire = Number(data.expire || 0);
    }

    getCachedToken() {
        const item = readCache()[this.account];
        if (!item?.token) return null;
        if (item.expireAt && Number(item.expireAt) < Date.now() + 60000) return null;
        return item;
    }

    saveCachedToken() {
        if (!this.token) return;
        const cache = readCache();
        cache[this.account] = {
            token: this.token,
            lmid: this.lmid,
            expireAt: this.expire ? Date.now() + this.expire * 1000 : 0,
            updatedAt: new Date().toISOString(),
        };
        writeCache(cache);
    }

    removeCachedToken() {
        const cache = readCache();
        if (cache[this.account]) {
            delete cache[this.account];
            writeCache(cache);
        }
        this.token = "";
        this.lmid = "";
        this.expire = 0;
    }

    miniHeaders(data = null, member = false) {
        const headers = {
            "User-Agent": USER_AGENT,
            "Referer": `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            "Content-Type": "application/json",
            "lmToken": this.token || "",
            "X-LF-Bucode": BU_CODE,
            "X-LF-App-Version": APP_VERSION,
            "X-LF-RequestId": uuid(),
            "X-LF-Channel": CHANNEL,
            "X-LF-Api-Version": API_VERSION,
        };
        if (member) headers["X-Gaia-Api-Key"] = MEMBER_GAIA_KEY;
        if (data) Object.assign(headers, miniSign(data));
        return headers;
    }

    taskHeaders(dxToken = "") {
        const headers = {
            "User-Agent": USER_AGENT,
            "Referer": "https://longzhu.longfor.com/longball-homeh5/",
            "Content-Type": "application/json;charset=UTF-8",
            "X-GAIA-API-KEY": TASK_GAIA_KEY,
            "token": this.token,
            "X-LF-UserToken": this.token,
            "X-LF-Channel": CHANNEL,
            "X-LF-Bu-Code": BU_CODE,
        };
        if (dxToken) {
            headers["X-LF-DXRisk-Token"] = dxToken;
            headers["X-LF-DXRisk-Source"] = 3;
            headers["X-LF-DXRisk-Captcha-Token"] = "";
        }
        return headers;
    }

    async miniPost(url, data, member = false) {
        const { data: result, status } = await axios.post(url, data, {
            headers: this.miniHeaders(data, member),
            timeout: 20000,
            validateStatus: () => true,
        });
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);
        if (!ok(result?.code)) {
            const err = new Error(result?.msg || result?.message || JSON.stringify(result));
            err.code = result?.code;
            throw err;
        }
        return result.data;
    }

    async taskPost(pathname, data, dxToken = "") {
        const { data: result, status } = await axios.post(`${TASK_HOST}${pathname}`, data, {
            headers: this.taskHeaders(dxToken),
            timeout: 20000,
            validateStatus: () => true,
        });
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);
        return result;
    }

    async getLoginCode() {
        if (!process.env.wx_auth) throw new Error("缺少 wx_auth，无法从 wx_server 获取 code");
        const { data } = await wechat.getCode(this.account);
        const code = data?.code || data?.data?.code;
        if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
        return code;
    }

    async loginByWxCode() {
        const checkData = {
            appId: MINI_APP_ID,
            thirdType: "WX_APPLET",
            fingerprint: "",
            authCode: await this.getLoginCode(),
        };
        const check = await this.miniPost(`${BASE_HOST}/mine/${API_VERSION}/publicApi/login/checkLoginType`, checkData);
        const loginData = {
            appId: MINI_APP_ID,
            authCode: await this.getLoginCode(),
            isNew: false,
            thirdType: "WX_APPLET",
            fingerprint: "",
            ticket: check?.ticket || "",
        };
        const login = await this.miniPost(`${BASE_HOST}/mine/${API_VERSION}/publicApi/login/loginByMiniApp`, loginData);
        this.applyToken(login);
        if (!this.token) throw new Error(`登录响应未返回 token: ${JSON.stringify(login)}`);
        this.saveCachedToken();
        $.log(`账号[${this.index}] 登录成功: token=${shortValue(this.token)} lmid=${shortValue(this.lmid)}`);
    }

    findActivityNo(payload) {
        return (JSON.stringify(payload || {}).match(/activity_no=([0-9]+)/) || [])[1] || "";
    }

    async getPageConfig() {
        const data = await this.miniPost(
            `${MEMBER_HOST}/api/bff/pages/${API_VERSION}/publicApi/v1/pageConfig`,
            { pageCode: "C2mine" },
            true
        );
        this.activityNo = this.findActivityNo(data);
        return data;
    }

    async checkToken() {
        try {
            await this.getPageConfig();
            return true;
        } catch (e) {
            return false;
        }
    }

    async getPageInfo() {
        const result = await this.taskPost("/openapi/task/v1/signature/page-info", { activity_no: this.activityNo });
        if (!ok(result?.code)) throw new Error(result?.message || result?.msg || JSON.stringify(result));
        return result.data || {};
    }

    todaySigned(pageInfo) {
        const today = Array.isArray(pageInfo?.seven_days_signs) ? pageInfo.seven_days_signs[0] : {};
        return Number(today?.sign_status) === 20;
    }

    rewardText(rewards = []) {
        if (!Array.isArray(rewards)) return "";
        return rewards
            .map((item) => {
                const num = item?.reward_num || item?.num || item?.amount;
                const name = item?.reward_name || item?.reward_type_name || item?.unit || "";
                return num ? `${name}${num}` : "";
            })
            .filter(Boolean)
            .join(",");
    }

    async signIn() {
        await this.getPageConfig();
        if (!this.activityNo) throw new Error("未在会员页配置中找到签到 activity_no");

        const pageInfo = await this.getPageInfo();
        $.log(`账号[${this.index}] 活动: ${pageInfo.task_name || "签到"} 今日=${this.todaySigned(pageInfo) ? "已签到" : "未签到"}`);
        if (this.todaySigned(pageInfo)) return;

        const dxToken = await getDxToken();
        $.log(`账号[${this.index}] 风控指纹${dxToken ? "获取成功" : "获取失败，直接尝试"}`);

        const result = await this.taskPost("/openapi/task/v1/signature/clock", { activity_no: this.activityNo }, dxToken);
        if (!ok(result?.code)) {
            const err = new Error(result?.message || result?.msg || JSON.stringify(result));
            err.code = result?.code;
            throw err;
        }
        $.log(`账号[${this.index}] 签到成功${this.rewardText(result?.data?.reward_info) ? `: ${this.rewardText(result.data.reward_info)}` : ""}`);
    }

    async run() {
        const cached = this.getCachedToken();
        if (cached) {
            this.applyToken(cached);
            $.log(`账号[${this.index}] 使用缓存token: ${shortValue(this.token)}`);
            if (!(await this.checkToken())) {
                this.removeCachedToken();
                $.log(`账号[${this.index}] 缓存token失效，重新登录`);
            }
        }
        if (!this.token) await this.loginByWxCode();
        if (!this.token) return;

        try {
            await this.signIn();
        } catch (e) {
            $.log(`账号[${this.index}] 签到失败${e.code ? `(${e.code})` : ""}: ${e.message || e}`);
            if (tokenError(e)) this.removeCachedToken();
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
