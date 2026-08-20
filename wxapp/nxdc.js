/*
------------------------------------------
@Description: 奈雪(pin-dao) - 微信小程序静默登录 + 每日签到
cron: 45 8 * * *
------------------------------------------
变量名：nxdc
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxab7430e6e8b9a4ab，登录 tm-api.pin-dao.cn / 业务 tm-web.pin-dao.cn）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

每个请求体经 build_request_data：加 nonce/timestamp/openId(固定应用常量)/signature
  signature = base64(hmac_sha1(SIGN_SECRET, `nonce=<n>&openId=<OPEN_ID>&timestamp=<ts>`))
登录  POST /passport/authenticate/wxapp/verify/grc  {appId,dAId:"",type:3,wxappCode:code,regChannelCode:"|1027"}
        -> token（data.token / data.data.token 等）；无 token = 未注册/失败
状态  POST /user/sign/records {signDate:"YYYY-MM-01", startDate:today} 头 Authorization:Bearer -> code0，data.status(已签)/signCount
签到  POST /user/sign/save {signDate:today} -> code0 && data.flag 成功
OPEN_ID/SIGN_SECRET 是这家小程序固定应用常量（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("奈雪签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "nxdc";
const MINI_APP_ID = "wxab7430e6e8b9a4ab";
const OPEN_ID = "QL6ZOftGzbziPlZwfiXM";
const SIGN_SECRET = "sArMTldQ9tqU19XIRDMWz7BO5WaeBnrezA";
const LOGIN_URL = "https://tm-api.pin-dao.cn/passport/authenticate/wxapp/verify/grc";
const WEB_BASE = "https://tm-web.pin-dao.cn";
const TOKEN_CACHE_FILE = path.join(__dirname, "nxdc_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
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
function randomIntString(n) {
    let s = "";
    for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
    return s;
}
function hmacSha1Base64(secret, message) {
    return crypto.createHmac("sha1", secret).update(message, "utf8").digest("base64");
}
function buildRequestData(extra) {
    const nonce = randomIntString(6);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = hmacSha1Base64(SIGN_SECRET, `nonce=${nonce}&openId=${OPEN_ID}&timestamp=${timestamp}`);
    const common = {
        platform: "wxapp", version: "6.0.42", imei: "", osn: "microsoft", sv: "Windows 10 x64",
        lat: "", lng: "", lang: "zh_CN", currency: "CNY", timeZone: "",
        nonce: Number(nonce), openId: OPEN_ID, timestamp, signature,
    };
    const params = {
        businessType: 1, brand: 26000252, tenantId: 1, channel: 2,
        stallType: null, storeId: "", storeType: "", cityId: "",
        ...(extra || {}),
    };
    return { common, params };
}
function chinaDateParts() {
    const d = new Date(Date.now() + 8 * 3600 * 1000);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
}
function extractToken(data) {
    if (!data || typeof data !== "object") return "";
    const inner = data.data || {};
    for (const k of ["token", "accessToken", "access_token", "authToken", "memberToken"]) {
        const v = data[k] || inner[k];
        if (v && String(v) !== "null") return String(v);
    }
    return "";
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
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
    async login() {
        const code = await this.getCode();
        const body = buildRequestData({ appId: MINI_APP_ID, dAId: "", type: 3, wxappCode: code, regChannelCode: "|1027" });
        const res = await axios.request({
            method: "POST", url: LOGIN_URL, data: JSON.stringify(body),
            headers: { Host: "tm-api.pin-dao.cn", Authorization: "Bearer null", "User-Agent": UA, xweb_xhr: "1", storeId: "", "Content-Type": "application/json", iv: randomIntString(16), Accept: "*/*", Referer: `https://servicewechat.com/${MINI_APP_ID}/1/page-frame.html` },
            timeout: 20000, validateStatus: () => true,
        });
        this.token = extractToken(res.data);
        if (!this.token) throw new Error(`登录未返回 token（可能未注册）: ${short(res.data)}`);
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    async callApi(url, body) {
        const payload = buildRequestData(body || {});
        const res = await axios.request({
            method: "POST", url, data: JSON.stringify(payload),
            headers: { "User-Agent": UA, Authorization: `Bearer ${this.token}`, Referer: `${WEB_BASE}/`, Origin: WEB_BASE, "Content-Type": "application/json" },
            timeout: 20000, validateStatus: () => true,
        });
        return res.data || {};
    }
    async sign() {
        const { y, m, d } = chinaDateParts();
        const signDate = `${y}-${String(m).padStart(2, "0")}-01`;
        const today = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const rec = await this.callApi(`${WEB_BASE}/user/sign/records`, { signDate, startDate: today });
        if (Number(rec.code) !== 0) return this.log(`❌ 查询签到失败：${rec.message || short(rec)}`);
        const data = rec.data || {};
        if (data.status) return this.log(`✅ 今日已签到，累计 ${data.signCount ?? "?"} 天`);
        const save = await this.callApi(`${WEB_BASE}/user/sign/save`, { signDate: today });
        if (Number(save.code) === 0 && (save.data || {}).flag) return this.log(`✅ 签到成功，累计 ${(save.data || {}).signCount ?? data.signCount ?? "?"} 天`);
        const msg = save.message || save.msg || short(save);
        if (/已签|签到过|重复/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        this.log(`❌ 签到失败: ${msg}`);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) { this.token = cached.token; this.log("使用缓存token"); return; }
        if (!this.token) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (/未返回 token/.test(String(e.message))) { this.log("⚠️ 登录未拿到 token（该微信号可能未注册奈雪会员），先在小程序里注册一次再跑"); return; }
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
