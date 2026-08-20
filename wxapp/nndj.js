/*
------------------------------------------
@Description: 牛牛短剧 - 微信小程序 code 登录 + 每日签到
cron: 16 10,22 * * *
------------------------------------------
变量名：nndj
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxcb95401f250e9a53，host api.tianjinzhitongdaohe.com/sqx_fast）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

无请求签名。token 放请求头 token。成功码 code===0，已签在 msg。
登录 第1步 GET  /app/Login/wxLogin?code=<code>（不带 token）
       -> code0，data.open_id(或openId)/data.unionId(或unionid)（后端 code2session 出的明文，非本地凭证）
     第2步 POST /app/Login/insertWxUser（json，不带 token）
       {openId,unionId,userName,avatar,sex:1,phone:"",inviterCode:"",qdCode:""}
       -> 顶层 token（=后续 token 头），顶层 user（含 userId）。无 token = 未注册/失败
       （insertWxUser 是自动注册+登录，通常都能拿到 token）
签到 GET /app/integral/signIn?date=YYYY-MM-DD 头 token -> code0 成功；msg 含"已签"=今日已签
积分 GET /app/integral/selectByUserId -> data.integralNum
校验 GET /app/user/selectUserById（缓存 token 有效性）
insertWxUser 里的 avatar 是应用默认头像 URL（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("牛牛短剧签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "nndj";
const MINI_APP_ID = "wxcb95401f250e9a53";
const API_BASE = "https://api.tianjinzhitongdaohe.com/sqx_fast";
const PAGE_VERSION = "19";
const DEFAULT_AVATAR = "https://nnduanju.oss-cn-beijing.aliyuncs.com/01image/re-512.png";
const TOKEN_CACHE_FILE = path.join(__dirname, "nndj_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

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
function short(v, n = 200) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function randomUserName() {
    const cs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let s = "";
    for (let i = 0; i < 6; i++) s += cs[Math.floor(Math.random() * cs.length)];
    return `用户${s}`;
}
function chinaToday() {
    const d = new Date(Date.now() + 8 * 3600 * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.user = {};
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    async request({ method = "GET", apiPath, params = {}, data = null, useToken = true }) {
        const headers = {
            "User-Agent": UA,
            "Referer": `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            "Accept": "application/json, text/plain, */*",
            "Content-Type": data ? "application/json" : "application/x-www-form-urlencoded",
        };
        if (useToken && this.token) headers.token = this.token;
        const res = await axios.request({
            method,
            url: `${API_BASE}${apiPath.startsWith("/") ? apiPath : `/${apiPath}`}`,
            headers,
            params: method === "GET" ? params : undefined,
            data: method === "GET" ? undefined : (data || {}),
            timeout: 20000,
            validateStatus: () => true,
        });
        if (res.status !== 200 && (!res.data || typeof res.data !== "object"))
            throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        return res.data || {};
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
        // 第1步：code -> 后端 code2session 拿明文 openId/unionId
        const wx = await this.request({ apiPath: "/app/Login/wxLogin", params: { code }, useToken: false });
        if (!wx || wx.code !== 0) throw new Error(`wxLogin失败: ${wx?.msg || short(wx)}`);
        const wd = wx.data || {};
        const openId = wd.open_id || wd.openId || "";
        const unionId = wd.unionId || wd.unionid || "";
        if (!openId) throw new Error(`wxLogin未返回openId: ${short(wx)}`);
        // 第2步：注册/登录换 token
        const reg = await this.request({
            method: "POST",
            apiPath: "/app/Login/insertWxUser",
            useToken: false,
            data: {
                openId, unionId,
                userName: randomUserName(),
                avatar: DEFAULT_AVATAR,
                sex: 1, phone: "", inviterCode: "", qdCode: "",
            },
        });
        if (!reg || reg.code !== 0) {
            const msg = reg?.msg || reg?.message || short(reg);
            if (/未注册|不存在|绑定|激活/.test(String(msg))) throw new Error(`NO_ACCOUNT:${msg}`);
            throw new Error(`insertWxUser失败: ${msg}`);
        }
        this.token = String(reg.token || reg.data?.token || "");
        this.user = reg.user || reg.data?.user || reg.data || {};
        if (!this.token) throw new Error(`NO_ACCOUNT:登录未返回token`);
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, user: this.user, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${this.user.userName ? `：${this.user.userName}` : ""}`);
    }
    async checkToken() {
        try {
            const res = await this.request({ apiPath: "/app/user/selectUserById" });
            if (res && res.code === 0) { this.user = res.data || this.user; return true; }
            return false;
        } catch (e) { return false; }
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            this.user = cached.user || {};
            this.log("使用缓存token");
            if (await this.checkToken()) return;
            this.log("缓存token失效，重新登录");
            this.token = "";
        }
        if (!this.token) await this.login();
    }
    async getPoints(label) {
        try {
            const res = await this.request({ apiPath: "/app/integral/selectByUserId" });
            if (res && res.code === 0) this.log(`${label}: ${res.data?.integralNum ?? "未知"} 积分`);
        } catch (e) { /* 非关键 */ }
    }
    async sign(retry = true) {
        const res = await this.request({ apiPath: "/app/integral/signIn", params: { date: chinaToday() } });
        if (res && res.code === 0) return this.log(`✅ 签到成功${res.msg && res.msg !== "success" ? `（${res.msg}）` : ""}`);
        const msg = res?.msg || res?.message || short(res);
        if (/已签|签到过|重复|已经签|今日.*签|已完成/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && /token|登录|未授权|失效|过期|未登录|鉴权|401/i.test(String(msg))) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msg}`);
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.getPoints("签到前");
            await this.sign();
            await this.getPoints("签到后");
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在牛牛短剧注册（${String(e.message).replace(/^NO_ACCOUNT:/, "")}），先在小程序里登录一次再跑`);
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
