/*
------------------------------------------
@Description: 全棉时代 - 微信小程序静默登录 + 每日签到
cron: 51 11 * * *
------------------------------------------
变量名：qmsd
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxdfcaa44b1aa891a7，host nmp.pureh2b.com）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

请求头：token=<登录返回token> / code=<客户端设备UUID，本脚本按openid生成并缓存，非个人凭证>
        content-type / user-agent(微信) / referer(servicewechat)
登录  GET /api/wx/main/login?code=<wx.login的code>（头 token 为空）
        -> 成功: 返回体含 token + member；token=后续鉴权，member.availablePoint=积分
        -> 失败/未注册: 返回 {message:...} 无 token
签到ID POST /api/new/navigation/category/query {pageNum,pageSize,venueType:"MAIN",categoryId:"010002"}
        -> 从 componentList 的 redirectInfo.info 里解析 signId(形如 QD\d+)；失败回退默认 QD 号
签到详情 GET /api/new/member/sign/index?signId=<signId>
        -> data.signMember.signDateList 含今天(UTC+8) = 已签；signDays=累计天数
签到  POST /api/new/member/sign/signIn {signType:1, signInId:<signId>}
        -> 返回数组：长度>0 取 [0].rewardPoint(本次积分)；空数组=今日已签
appid 是固定应用标识；code 头为客户端设备 UUID（本脚本自动生成缓存，不使用作者的）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("全棉时代签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "qmsd";
const MINI_APP_ID = "wxdfcaa44b1aa891a7";
const PAGE_VERSION = "1376";
const API_HOST = "https://nmp.pureh2b.com";
const DEFAULT_SIGN_ID = process.env.QMSD_SIGN_ID || "QD26060001";
const TOKEN_CACHE_FILE = path.join(__dirname, "qmsd_token_cache.json");
const UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) " +
    "Mobile/15E148 MicroMessenger/8.0.34(0x18002230) NetType/WIFI Language/zh_CN";

const EP_LOGIN = "/api/wx/main/login";
const EP_CATEGORY = "/api/new/navigation/category/query";
const EP_NAV = "/api/new/navigation/nav/query";
const EP_SIGN_INDEX = "/api/new/member/sign/index";
const EP_SIGN_IN = "/api/new/member/sign/signIn";

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

function readCache() {
    try { if (!fs.existsSync(TOKEN_CACHE_FILE)) return {}; return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {}; } catch (e) { return {}; }
}
function writeCache(c) {
    try { fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(c, null, 2), "utf8"); } catch (e) { $.log(`写入缓存失败: ${e.message || e}`); }
}
function parseAccount(raw = "") {
    const [id, remark] = String(raw).split("#").map((s) => (s || "").trim());
    return { openid: id, remark: remark || "" };
}
function short(v, n = 300) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function uuidV4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
function chinaToday() {
    return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}
function parseSignIdFromInfo(info) {
    if (!info || typeof info !== "string") return "";
    const m = info.match(/[?&]id=([^&]+)/i) || info.match(/(QD\d+)/i);
    return m ? decodeURIComponent(m[1]) : "";
}
function findSignIdInObject(obj) {
    if (!obj) return "";
    if (typeof obj === "string") return parseSignIdFromInfo(obj);
    if (Array.isArray(obj)) {
        for (const item of obj) { const id = findSignIdInObject(item); if (id) return id; }
        return "";
    }
    if (typeof obj === "object") {
        if (obj.redirectInfo && obj.redirectInfo.info) {
            const id = parseSignIdFromInfo(obj.redirectInfo.info); if (id) return id;
        }
        for (const k of Object.keys(obj)) { const id = findSignIdInObject(obj[k]); if (id) return id; }
    }
    return "";
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.deviceCode = "";
        this.signId = DEFAULT_SIGN_ID;
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    headers(extra = {}) {
        return {
            host: "nmp.pureh2b.com",
            connection: "keep-alive",
            tag: "v3.0",
            token: this.token || "",
            code: this.deviceCode,
            "content-type": "application/json;charset=UTF-8",
            accept: "*/*",
            "user-agent": UA,
            referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            ...extra,
        };
    }
    async request(method, apiPath, { params, data } = {}) {
        const res = await axios.request({
            method, url: `${API_HOST}${apiPath}`, params, data,
            headers: this.headers(), timeout: 20000, validateStatus: () => true,
        });
        if (res.status !== 200 && (!res.data || typeof res.data !== "object")) {
            throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        }
        return res.data;
    }
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }
    async login() {
        const code = await this.getCode();
        const res = await this.request("GET", EP_LOGIN, { params: { code } });
        if (res && res.token && res.member) {
            this.token = String(res.token);
            const pts = res.member.availablePoint;
            this.log(`登录成功✅ 积分:${pts !== undefined ? pts : "?"}`);
            const cache = readCache();
            cache[this.account.openid] = { token: this.token, deviceCode: this.deviceCode, updatedAt: new Date().toISOString() };
            writeCache(cache);
            return;
        }
        const msg = (res && (res.message || res.msg)) || short(res);
        // bind:"no" / member:null（有 openid 但无会员）= 该微信号未注册/未绑定全棉时代会员
        if ((res && (res.bind === "no" || res.member === null || res.member === undefined) && (res.openid || res.token)) ||
            /未注册|注册|未绑定|绑定|会员|no\b/.test(String(msg))) {
            this.unregistered = true;
            throw new Error(`NO_ACCOUNT:${res && res.bind === "no" ? "bind=no(未绑定会员)" : msg}`);
        }
        throw new Error(`登录未返回 token: ${msg}`);
    }
    async fetchSignId() {
        try {
            const cat = await this.request("POST", EP_CATEGORY, {
                data: { pageNum: 1, pageSize: 10, venueType: "MAIN", categoryId: "010002" },
            });
            if (cat && cat.code == 200 && cat.data) {
                let signId = findSignIdInObject(cat.data.componentList);
                if (signId) { this.log(`自动获取签到ID✅ ${signId}（首页组件）`); this.signId = signId; return; }
                let navId = "";
                try { navId = (JSON.parse(cat.data.pageConfig || "{}") || {}).topNavigationId || ""; } catch (e) {}
                if (navId) {
                    const nav = await this.request("GET", EP_NAV, { params: { navigationId: navId } });
                    if (nav && nav.code == 200) {
                        signId = findSignIdInObject(nav.data);
                        if (signId) { this.log(`自动获取签到ID✅ ${signId}（顶部导航）`); this.signId = signId; return; }
                    }
                }
            }
        } catch (e) {
            this.log(`自动获取签到ID异常：${e.message || e}`);
        }
        this.log(`自动获取签到ID失败，使用默认：${this.signId}`);
    }
    async signStatus() {
        // 返回 true = 今日已签
        try {
            const res = await this.request("GET", EP_SIGN_INDEX, { params: { signId: this.signId } });
            if (res && res.signMember) {
                const days = res.signMember.signDays || 0;
                const list = res.signMember.signDateList || [];
                this.log(`签到详情✅ 累计${days}天`);
                return list.includes(chinaToday());
            }
            this.log(`签到详情❌：${short(res)}`);
        } catch (e) {
            this.log(`签到详情异常：${e.message || e}`);
        }
        return false;
    }
    async doSign() {
        const res = await this.request("POST", EP_SIGN_IN, { data: { signType: 1, signInId: this.signId } });
        if (Array.isArray(res)) {
            if (res.length > 0) {
                const point = res[0].rewardPoint || 0;
                return this.log(`✅ 签到成功，积分 +${point}`);
            }
            return this.log("✅ 今日已签到");
        }
        const msg = (res && (res.message || res.msg)) || short(res);
        if (/已签|签到过|重复|已完成/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        this.log(`❌ 签到失败：${msg}`);
    }
    ensureDeviceCode() {
        const cached = readCache()[this.account.openid] || {};
        this.deviceCode = cached.deviceCode || uuidV4();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            this.ensureDeviceCode();
            await this.login();
            await $.wait(1000);
            await this.fetchSignId();
            await $.wait(1000);
            if (await this.signStatus()) {
                this.log("✅ 今日已签到，跳过");
                return;
            }
            await $.wait(1000);
            await this.doSign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在全棉时代注册/绑定会员，先在小程序里登录一次再跑（${String(e.message).slice(11)}）`);
                return;
            }
            this.log(`执行失败: ${e.message || e}`);
        }
    }
}

!(async () => {
    $.checkEnv(ckName);
    if (!$.userCount) { $.log(`未找到变量 ${ckName}`); return; }
    for (let i = 0; i < $.userList.length; i++) {
        await new Task($.userList[i]).run();
        if (i < $.userList.length - 1) await $.wait(1500, 3000);
    }
})().catch((e) => $.log(e.message || e)).finally(() => $.done());
