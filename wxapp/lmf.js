/*
------------------------------------------
@Description: 绿蜜蜂 - 微信小程序静默登录 + 每日签到
cron: 22 8 * * *
------------------------------------------
变量名：lmf
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx6fcde446296d9588，host lmf.lvmifo.com）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

两级 token：
  access-token（应用级，全账号共用）：
    signature = md5(`app_id=<ID>&app_secret=<SECRET>&device_id=<dev>&rand_str=<RAND>&timestamp=<ts秒>`)
    device_id = `<ts秒><4位随机>`
    POST /api/5a60c77b79875?appType=WX_APP  form{app_id,device_id,rand_str,timestamp,signature}
        -> code==1，data.access_token
  user-token（账号级，用 wx.login code 换）：
    POST /api/5e05692405c63  头 access-token  form{code}
        -> code==1，data.utoken；无 utoken = 未注册/失败
签到  GET /api/5dca57afa379e?m=toSign  头 access-token + user-token
        -> code==1 成功（data.get_integral/get_red_packet）；已签在 msg
校验  GET /api/5dca57afa379e?m=getUserInfo -> code==1（用于校验缓存 user-token）
APP_ID/APP_SECRET/RAND_STR 是这家小程序固定应用签名常量（原脚本硬编码，非个人凭证；
微信 code2session 由 lmf.lvmifo.com 服务端完成，无需微信 AppSecret）。
注：原脚本另有自动提现(cashApply)，涉及资金转出，本迁移只做签到，不含提现。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("绿蜜蜂签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "lmf";
const MINI_APP_ID = "wx6fcde446296d9588";
const PAGE_VERSION = "320";
const API_BASE = "https://lmf.lvmifo.com/api";
const API_VERSION = "v1.0.0";
const APP_ID = "75762944";
const APP_SECRET = "ZNsLuCwAnnrDuQuyvTQcGpthsmASHSeG";
const RAND_STR = "lv_mi_feng_uni_app";
const ACCESS_TTL_MS = 2 * 3600 * 1000; // access-token 缓存 2 小时
const TOKEN_CACHE_FILE = path.join(__dirname, "lmf_token_cache.json");
const ACCESS_KEY = "__access__";
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";
const REFERER = `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`;

const EP_ACCESS = "/5a60c77b79875?appType=WX_APP";
const EP_UTOKEN = "/5e05692405c63";
const EP_USERINFO = "/5dca57afa379e?m=getUserInfo";
const EP_SIGN = "/5dca57afa379e?m=toSign";

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
function md5(s) {
    return crypto.createHash("md5").update(s, "utf8").digest("hex");
}
function buildHeaders(accessToken = "", userToken = "") {
    return {
        Accept: "*/*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: REFERER,
        "User-Agent": UA,
        "access-token": accessToken,
        "user-token": userToken,
        version: API_VERSION,
        xweb_xhr: "1",
        lat: "",
        lng: "",
        "this-shop-id": "0",
    };
}
function formEncode(obj) {
    const p = new URLSearchParams();
    for (const k of Object.keys(obj)) p.append(k, String(obj[k]));
    return p.toString();
}

// ---- 应用级 access-token（全账号共用，带缓存/自动刷新） ----
let SHARED_ACCESS = "";
async function fetchAccessToken() {
    const timestamp = Math.floor(Date.now() / 1000);
    const deviceId = `${timestamp}${Math.floor(Math.random() * 9000) + 1000}`;
    const material =
        `app_id=${APP_ID}&app_secret=${APP_SECRET}&device_id=${deviceId}` +
        `&rand_str=${RAND_STR}&timestamp=${timestamp}`;
    const signature = md5(material);
    const body = { app_id: APP_ID, device_id: deviceId, rand_str: RAND_STR, timestamp, signature };
    const res = await axios.request({
        method: "POST", url: `${API_BASE}${EP_ACCESS}`, data: formEncode(body),
        headers: buildHeaders(), timeout: 20000, validateStatus: () => true,
    });
    const d = res.data || {};
    if (Number(d.code) === 1 && d.data && d.data.access_token) {
        return String(d.data.access_token);
    }
    throw new Error(`获取 access-token 失败: ${d.msg || short(d)}`);
}
async function getAccessToken(forceRefresh = false) {
    if (!forceRefresh && SHARED_ACCESS) return SHARED_ACCESS;
    const cache = readCache();
    const acc = cache[ACCESS_KEY] || {};
    if (!forceRefresh && acc.token && Number(acc.expireTime) > Date.now()) {
        SHARED_ACCESS = String(acc.token);
        return SHARED_ACCESS;
    }
    const token = await fetchAccessToken();
    cache[ACCESS_KEY] = { token, expireTime: Date.now() + ACCESS_TTL_MS };
    writeCache(cache);
    SHARED_ACCESS = token;
    return token;
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = ""; // user-token (utoken)
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
    async fetchUserToken(accessToken, code) {
        const res = await axios.request({
            method: "POST", url: `${API_BASE}${EP_UTOKEN}`, data: formEncode({ code }),
            headers: buildHeaders(accessToken), timeout: 20000, validateStatus: () => true,
        });
        return res.data || {};
    }
    async login() {
        let accessToken = await getAccessToken();
        const code = await this.getCode();
        let res = await this.fetchUserToken(accessToken, code);
        // access-token 失效时刷新一次重试（换 token 需要新的 code）
        if (Number(res.code) !== 1) {
            const msg = String(res.msg || res.message || "");
            if (/access|token|签名|signature|设备|device|过期|失效|重新/i.test(msg)) {
                this.log("access-token 可能失效，刷新后重试");
                accessToken = await getAccessToken(true);
                const code2 = await this.getCode();
                res = await this.fetchUserToken(accessToken, code2);
            }
        }
        if (Number(res.code) === 1 && res.data && res.data.utoken) {
            this.token = String(res.data.utoken);
            const cache = readCache();
            cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
            writeCache(cache);
            this.log("登录成功");
            return;
        }
        // code!=1 且无 utoken：多为该微信号未注册绿蜜蜂
        throw new Error(`NO_ACCOUNT:登录未返回 utoken（可能未注册）: ${res.msg || res.message || short(res)}`);
    }
    async validateUserToken() {
        try {
            const accessToken = await getAccessToken();
            const res = await axios.request({
                method: "GET", url: `${API_BASE}${EP_USERINFO}`,
                headers: buildHeaders(accessToken, this.token), timeout: 20000, validateStatus: () => true,
            });
            return Number((res.data || {}).code) === 1;
        } catch (e) { return false; }
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            if (await this.validateUserToken()) { this.log("使用缓存token"); return; }
            this.log("缓存token失效，重新登录");
            this.token = "";
        }
        if (!this.token) await this.login();
    }
    async doSign(accessToken) {
        const res = await axios.request({
            method: "GET", url: `${API_BASE}${EP_SIGN}`,
            headers: buildHeaders(accessToken, this.token), timeout: 20000, validateStatus: () => true,
        });
        return res.data || {};
    }
    async sign(retry = true) {
        const accessToken = await getAccessToken();
        const res = await this.doSign(accessToken);
        if (Number(res.code) === 1) {
            const d = res.data || {};
            const parts = [];
            if (d.get_integral !== undefined) parts.push(`积分+${d.get_integral}`);
            if (d.get_red_packet !== undefined) parts.push(`余额+${d.get_red_packet}`);
            return this.log(`✅ 签到成功${parts.length ? "，" + parts.join("，") : ""}`);
        }
        const msg = res.msg || res.message || short(res);
        if (/已签|签到过|重复|已完成|今日/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && /token|登录|未授权|失效|过期|未登录|鉴权|重新/i.test(String(msg))) {
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
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log("⚠️ 该微信号还没在绿蜜蜂注册/登录，先在小程序里登录一次再跑");
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
