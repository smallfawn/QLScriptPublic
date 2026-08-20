/*
------------------------------------------
@Description: 东风日产 人车生活 - 微信小程序静默登录 + 每日签到
cron: 42 9 * * *
------------------------------------------
变量名：dfrc
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxe3fd49854884240e）：
（迁移自 YYB-GO 系脚本 东风日产.py，原脚本已 code 登录）

登录  GET https://ariya-api.dongfeng-nissan.com.cn/toc-login-service/nissan/v2/user/login/{code}
        ?wxUuid=..&sourcecode=&smartcode=   头 Accept-Encoding:identity
        -> rows/data { oneid, api_token(wxapi JWT), token(ariya 短 hex), openid }
        无 oneid = 未注册/未激活会员
查询  POST https://ariya-api.../dfn-growth/rest/ly-mp-growth-service/ly/mgs/checkin/signList
        body {brandCode:1,channel:"2",startTime,endTime}（ariya 签名）
        -> result=="1"，rows[*].signTime.startsWith(今天) 即已签
签到  GET  https://wxapi.dongfeng-nissan.com.cn/api/small/v4/signin/mgs/checkin/signSave?wxUuid=..
        头 Authorization:Bearer {api_token}, urid:{openid}
        -> code==10000 成功 / code==10010 或含"已" 今日已签
成长  POST https://ariya-api.../dfn-growth/rest/ly-mp-growth-service/ly/mgs/growth/growthvalue/medal
        body {}（ariya 签名） -> result=="1"，data.growthScore

ariya 签名（抓包已复现）：range 固定 "1"，body 不参与签名
  sign = SHA512(clientid + timestamp(ms) + token + noncestr + "1" + oneid)
  头：appCode:nissan appSkin:NISSANAPP clientid:nissanminiapp noncestr oneid uuid=oneid
      range:1 sign timestamp token
clientid/appCode/appSkin 是这家小程序固定应用常量（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("东风日产签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "dfrc";
const MINI_APP_ID = "wxe3fd49854884240e";
const PAGE_VERSION = "1285";
const ARIYA_BASE = "https://ariya-api.dongfeng-nissan.com.cn";
const WXAPI_BASE = "https://wxapi.dongfeng-nissan.com.cn";
const CLIENT_ID = "nissanminiapp";
const APP_CODE = "nissan";
const APP_SKIN = "NISSANAPP";
const TOKEN_CACHE_FILE = path.join(__dirname, "dfrc_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a1b)XWEB/14185";
const REFERER = `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`;

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
// 复刻小程序 getNonce：32 位大写 hex，第 13 位（index 12）固定为 4
function genNoncestr() {
    const chars = "0123456789abcdef";
    const arr = [];
    for (let i = 0; i < 32; i++) arr.push(i === 12 ? "4" : chars[Math.floor(Math.random() * 16)]);
    return arr.join("").toUpperCase();
}
function randomUuid(len = 20) {
    const chars = "abcdef0123456789";
    let s = "";
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}
function sha512(text) {
    return crypto.createHash("sha512").update(text, "utf8").digest("hex");
}
function chinaDateStr() {
    const d = new Date(Date.now() + 8 * 3600 * 1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
// 从多层壳里挖登录返回体（rows / data）
function digData(result) {
    if (!result || typeof result !== "object") return {};
    for (const key of ["rows", "data"]) {
        const v = result[key];
        if (v && typeof v === "object" && !Array.isArray(v)) return v;
    }
    return {};
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.openid = this.account.openid; // smallcat 账号变量值本身就是 openid
        this.oneid = "";
        this.token = "";      // ariya 短 hex token（ariya 签名头用）
        this.apiToken = "";   // wxapi JWT（signSave 用）
        this.wxUuid = randomUuid();
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
        const res = await axios.request({
            method: "GET",
            url: `${ARIYA_BASE}/toc-login-service/nissan/v2/user/login/${encodeURIComponent(code)}`,
            params: { wxUuid: this.wxUuid, sourcecode: "", smartcode: "" },
            headers: {
                Accept: "*/*", "Accept-Encoding": "identity",
                "User-Agent": UA, Referer: REFERER, xweb_xhr: "1",
            },
            timeout: 20000, validateStatus: () => true,
        });
        const result = res.data;
        this.log(`登录响应: ${short(result, 300)}`);
        const data = digData(result);
        this.oneid = String(
            data.oneid || data.oneId || data.ly_user_id || data.uuid || data.uid ||
            data.userId || data.memberId || (result && result.oneid) || "");
        this.token = String(data.token || data.access_token || data.api_token || (result && result.token) || "");
        this.apiToken = String(data.api_token || "");
        const oid = data.openid || data.openId || "";
        if (oid) this.openid = oid;
        if (!this.oneid) {
            // 未取到成长体系标识 oneid：多为该微信号未在东风日产注册/激活会员
            throw new Error(`NO_ACCOUNT:登录未返回 oneid`);
        }
        const cache = readCache();
        cache[this.account.openid] = {
            oneid: this.oneid, token: this.token, apiToken: this.apiToken,
            openid: this.openid, updatedAt: new Date().toISOString(),
        };
        writeCache(cache);
        this.log(`登录成功 oneid=${short(this.oneid, 16)} token=${this.token ? "有" : "无"} jwt=${this.apiToken ? "有" : "无"}`);
    }
    // wxapi 域名 GET（JWT 鉴权）
    async wxapiGet(apiPath) {
        const sep = apiPath.includes("?") ? "&" : "?";
        const res = await axios.request({
            method: "GET",
            url: `${WXAPI_BASE}${apiPath}${sep}wxUuid=${this.wxUuid}`,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${this.apiToken || this.token}`,
                "Content-Type": "application/json",
                "User-Agent": UA, Referer: REFERER,
                urid: this.openid || "", xweb_xhr: "1",
            },
            timeout: 20000, validateStatus: () => true,
        });
        return res.data || {};
    }
    // ariya 域名 POST（自动签名）
    async ariyaPost(apiPath, body) {
        const ts = Date.now();
        const nonce = genNoncestr();
        const rng = "1";
        const sign = sha512(`${CLIENT_ID}${ts}${this.token}${nonce}${rng}${this.oneid}`);
        const bodyStr = body != null ? JSON.stringify(body) : "";
        const res = await axios.request({
            method: "POST",
            url: `${ARIYA_BASE}${apiPath}`,
            data: bodyStr || undefined,
            headers: {
                Accept: "*/*", "Accept-Encoding": "identity",
                "Content-Type": "application/json",
                "User-Agent": UA, Referer: REFERER,
                appCode: APP_CODE, appSkin: APP_SKIN, clientid: CLIENT_ID,
                noncestr: nonce, oneid: this.oneid, uuid: this.oneid,
                range: rng, sign, timestamp: String(ts), token: this.token, xweb_xhr: "1",
            },
            timeout: 20000, validateStatus: () => true,
        });
        return res.data || {};
    }
    async sign(retry = true) {
        // 1) 先查今日签到记录（ariya 签名）
        const today = chinaDateStr();
        try {
            const sl = await this.ariyaPost(
                "/dfn-growth/rest/ly-mp-growth-service/ly/mgs/checkin/signList",
                { brandCode: 1, channel: "2", startTime: today, endTime: today });
            if (sl && String(sl.result) === "1") {
                for (const row of (sl.rows || [])) {
                    if (String(row.signTime || "").startsWith(today)) return this.log(`✅ 今日已签到`);
                }
            }
        } catch (e) { /* 查询失败不阻塞签到 */ }

        // 2) 执行签到（wxapi JWT，GET，无 body）
        const res = await this.wxapiGet("/api/small/v4/signin/mgs/checkin/signSave");
        const code = res.code;
        const msg = res.message || res.msg || short(res);
        if (code === 10000) return this.log(`✅ 签到成功`);
        if (code === 10010 || /已签|签到过|重复|已有签到/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && /token|登录|未授权|失效|过期|未登录|鉴权|unauth|invalid/i.test(String(msg)) || res.code === 401 || res.status === 401) {
            this.log("会话失效，重新登录后重试");
            this.token = ""; this.apiToken = ""; this.oneid = "";
            await this.login();
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msg}`);
    }
    async queryGrowth() {
        try {
            const res = await this.ariyaPost(
                "/dfn-growth/rest/ly-mp-growth-service/ly/mgs/growth/growthvalue/medal", {});
            if (res && String(res.result) === "1") {
                const d = res.data || {};
                if (d.growthScore !== undefined) this.log(`成长值: ${d.growthScore}${d.levelName ? `（${d.levelName}）` : ""}`);
            }
        } catch (e) { /* 非关键 */ }
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.oneid && cached.oneid) {
            this.oneid = cached.oneid; this.token = cached.token || "";
            this.apiToken = cached.apiToken || ""; this.openid = cached.openid || this.openid;
            this.log("使用缓存登录态");
            return;
        }
        if (!this.oneid) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
            await this.queryGrowth();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log("⚠️ 该微信号还没在东风日产人车生活注册/激活会员，先在小程序里登录一次再跑");
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
