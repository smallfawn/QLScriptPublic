/*
------------------------------------------
@Description: 玛氏宠享会 - 微信小程序静默登录(code) + 每日签到
cron: 28 9 * * *
------------------------------------------
变量名：mscxh
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxd96d7e6249780c6a，host petcare-consumer.marschina.com）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

请求签名(GET/POST 通用)：把本次请求的全部业务参数按 key 升序拼成 `k=v&k=v`，
  末尾接 salt "GQWwdCoVdn7SXtdf"，MD5 十六进制 => signature（signature 本身不参与签名串）。
公共参数：store_id=42 / _version=2.8.9 / _platform=wx / timestamp=秒级
登录  POST /index.php?r=api/passport/login
        参数(同时进 query 与 form body)：code,type=p,login_first=1,channel=default,store_id=42,
        timestamp,_version,_platform (+signature)
        -> code==0；token=data.access_token；nickname=data.nickname
积分  GET  /index.php  r=api/user/member  access_token... -> code==0，data.user_info.integral
签到  GET  /index.php  r=api/integralmall/integralmall/register&type=1  access_token...
        -> code==0，data.integral(本次积分)；已签到时 code!=0 且 msg 提示
salt / store_id 是这家小程序固定应用常量（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("玛氏宠享会签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "mscxh";
const MINI_APP_ID = "wxd96d7e6249780c6a";
const HOST = "petcare-consumer.marschina.com";
const API_URL = `https://${HOST}/index.php`;
const STORE_ID = "42";
const SIGN_SALT = "GQWwdCoVdn7SXtdf";
const VERSION = "2.8.9";
const PLATFORM = "wx";
const TOKEN_CACHE_FILE = path.join(__dirname, "mscxh_token_cache.json");
const UA =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 XWEB/1340129 MMWEBSDK/20240301 MMWEBID/9871 " +
    "MicroMessenger/8.0.48.2580(0x28003036) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android";

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
function nowSec() { return Math.floor(Date.now() / 1000); }
function normalize(data) {
    if (typeof data === "string") { try { return JSON.parse(data); } catch (e) { return { raw: data }; } }
    return data || {};
}
// 原脚本签名：sorted(k=v&...) + salt 后 md5；signature 不参与签名串
function signParams(obj) {
    const keys = Object.keys(obj).sort();
    const base = keys.map((k) => `${k}=${obj[k]}`).join("&");
    const signature = crypto.createHash("md5").update(base + SIGN_SALT, "utf8").digest("hex");
    return { ...obj, signature };
}
function formEncode(obj) {
    const p = new URLSearchParams();
    for (const k of Object.keys(obj)) p.append(k, String(obj[k]));
    return p.toString();
}
function codeOf(res) {
    for (const k of ["code", "errno", "status", "ret", "resultCode"]) {
        if (res && res[k] !== undefined && res[k] !== null) return Number(res[k]);
    }
    return NaN;
}
function msgOf(res) {
    return (res && (res.msg || res.message || res.errmsg || res.info)) || "";
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.nickname = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }
    // GET 业务请求：全部参数进 query（含 signature）
    async get(bizParams) {
        const signed = signParams(bizParams);
        const res = await axios.request({
            method: "GET", url: API_URL, params: signed,
            headers: { "User-Agent": UA, authority: HOST, Accept: "application/json, text/plain, */*" },
            timeout: 20000, validateStatus: () => true,
        });
        return normalize(res.data);
    }
    async login() {
        const code = await this.getCode();
        const signed = signParams({
            store_id: STORE_ID, r: "api/passport/login",
            code, type: "p", login_first: "1", channel: "default",
            timestamp: nowSec(), _version: VERSION, _platform: PLATFORM,
        });
        const res = await axios.request({
            method: "POST", url: API_URL, params: signed, data: formEncode(signed),
            headers: {
                "User-Agent": UA, authority: HOST,
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json, text/plain, */*",
            },
            timeout: 20000, validateStatus: () => true,
        });
        const body = normalize(res.data);
        if (codeOf(body) === 0 && body.data && body.data.access_token) {
            this.token = String(body.data.access_token);
            this.nickname = body.data.nickname || "";
            const cache = readCache();
            cache[this.account.openid] = { token: this.token, nickname: this.nickname, updatedAt: new Date().toISOString() };
            writeCache(cache);
            this.log(`登录成功${this.nickname ? `（${this.nickname}）` : ""}`);
            return;
        }
        const msg = msgOf(body);
        if (/未注册|不存在|未绑定|请先|注册|激活/.test(String(msg))) {
            this.unregistered = true;
            throw new Error(`NO_ACCOUNT:${msg}`);
        }
        throw new Error(`登录未返回 access_token: ${msg || short(body)}`);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) { this.token = cached.token; this.nickname = cached.nickname || ""; this.log("使用缓存token"); return; }
        if (!this.token) await this.login();
    }
    baseParams(extra) {
        return {
            store_id: STORE_ID, access_token: this.token,
            timestamp: nowSec(), _version: VERSION, _platform: PLATFORM,
            ...(extra || {}),
        };
    }
    async queryPoints() {
        try {
            const res = await this.get(this.baseParams({ r: "api/user/member", type: "p" }));
            if (codeOf(res) === 0 && res.data && res.data.user_info) {
                this.log(`当前积分: ${res.data.user_info.integral}`);
            }
            return res;
        } catch (e) { return null; }
    }
    async sign(retry = true) {
        const res = await this.get(this.baseParams({ r: "api/integralmall/integralmall/register", type: 1 }));
        if (codeOf(res) === 0) {
            const got = res.data && res.data.integral !== undefined ? `，获得 ${res.data.integral} 积分` : "";
            return this.log(`✅ 签到成功${got}`);
        }
        const msg = msgOf(res) || short(res);
        if (/已签|签过|签到过|重复|已完成|明天|已经/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && /token|登录|未授权|失效|过期|未登录|鉴权|重新登录/i.test(String(msg))) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            return this.sign(false);
        }
        // 「请先授权」等 = 需先在小程序授权/注册会员，账号态非签到失败
        if (/请先授权|请授权|未注册|未绑定|绑定手机|完善.*信息|注册会员/.test(String(msg))) {
            return this.log(`⚠️ 该微信号还没在玛氏宠享会授权/注册会员（${msg}），先在小程序里授权登录一次再跑`);
        }
        this.log(`❌ 签到失败: ${msg}`);
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.queryPoints();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在玛氏宠享会注册/绑定（${String(e.message).slice(10)}），先在小程序里登录一次再跑`);
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
