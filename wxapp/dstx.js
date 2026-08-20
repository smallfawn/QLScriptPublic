/*
------------------------------------------
@Description: 都市甜心(pospal) - 微信小程序静默登录 + 每日签到
cron: 47 8 * * *
------------------------------------------
变量名：dstx
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx46abbbcfa7cf571a，pospal SaaS，host wxservice-stg62.pospal.cn）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

STORE_IDS=["5545556","4815863"] 逐个尝试（都市甜心的门店）。
授权  POST /wxapi/customeraccount/Auth {storeId:int, signInMode:1, code}（不带 PSPLVISITORID）
        -> 提取 reloginToken（作为后续 PSPLVISITORID 头）
识别  POST /wxapi/customeraccount/FindLoginInfo {storeId,isRefresh,...} -> customerUid（有=该门店已识别会员）
查询  POST /wxapi/customeraccount/FindCheckinPointsNew {range:1} -> result[].todayChecked
签到  POST /wxapi/customeraccount/Checkin {longitude:0,latitude:0,address:"",isMemberCard:false,memberCardNo:""}
        -> successed==true 成功
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("都市甜心签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "dstx";
const MINI_APP_ID = "wx46abbbcfa7cf571a";
const HOST = "wxservice-stg62.pospal.cn";
const BASE = `https://${HOST}`;
const STORE_IDS = ["5545556", "4815863"];
const TOKEN_CACHE_FILE = path.join(__dirname, "dstx_token_cache.json");
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
/** 递归在嵌套对象里找任一 key 的首个非空值 */
function findValueByKeys(data, keys) {
    const seen = new Set();
    const stack = [data];
    while (stack.length) {
        const cur = stack.pop();
        if (!cur || typeof cur !== "object" || seen.has(cur)) continue;
        seen.add(cur);
        for (const [k, v] of Object.entries(cur)) {
            if (keys.has(k) && v !== null && v !== undefined && String(v) !== "") return String(v);
            if (v && typeof v === "object") stack.push(v);
        }
    }
    return "";
}
const RELOGIN_KEYS = new Set(["reloginToken", "ReloginToken", "reLoginToken", "VISITORSESSION"]);
const UID_KEYS = new Set(["customerUid", "customer_uid", "customerUID", "customerId", "customer_id", "uid"]);

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    headers(storeId, visitorUid, mode = "RegularOrder|package", includeVisitor = true) {
        const h = {
            Host: HOST, Connection: "keep-alive", PSPLVISITORAUTO: "API",
            VERSIONINFO: "NC|2026.4.9", STOREID: String(storeId), xweb_xhr: "1",
            APPTYPE: "1", POSPALSTOREMODE: mode, "User-Agent": UA,
            "Content-Type": "application/json", Accept: "*/*",
        };
        if (includeVisitor) h.PSPLVISITORID = visitorUid || "";
        return h;
    }
    async request(apiPath, body, headers) {
        const res = await axios.request({ method: "POST", url: `${BASE}${apiPath}`, data: body || {}, headers, timeout: 20000, validateStatus: () => true });
        if (res.status !== 200) { if (res.data && typeof res.data === "object") return res.data; return { successed: false, messages: `HTTP ${res.status}` }; }
        return res.data;
    }
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }
    async authStore(storeId) {
        const code = await this.getCode();
        const data = await this.request("/wxapi/customeraccount/Auth", { storeId: Number(storeId), signInMode: 1, code }, this.headers(storeId, null, "RegularOrder|takeout", false));
        return findValueByKeys(data, RELOGIN_KEYS);
    }
    async findLoginInfo(storeId, reloginToken) {
        const data = await this.request("/wxapi/customeraccount/FindLoginInfo", {
            storeId: Number(storeId), isRefresh: true, showCardAge: true, isMemCenter: true,
            incShoppingCard: false, agreementVersion: "20220523", incBirthdayChangeCount: false,
        }, this.headers(storeId, reloginToken));
        return { uid: findValueByKeys(data, UID_KEYS), data };
    }
    async login() {
        for (const storeId of STORE_IDS) {
            const reloginToken = await this.authStore(storeId);
            if (!reloginToken) continue;
            const { uid } = await this.findLoginInfo(storeId, reloginToken);
            if (uid) {
                const cache = readCache();
                cache[this.account.openid] = { storeId, reloginToken, uid, updatedAt: new Date().toISOString() };
                writeCache(cache);
                this.log(`登录识别成功 门店 ${storeId}`);
                return { storeId, reloginToken, uid };
            }
        }
        return null;
    }
    async sign(sess) {
        const { storeId, reloginToken } = sess;
        // 查询今日是否已签
        const q = await this.request("/wxapi/customeraccount/FindCheckinPointsNew", { range: 1 }, this.headers(storeId, reloginToken));
        const pts = q.result;
        if (Array.isArray(pts) && pts.some((p) => p && p.todayChecked)) return this.log("✅ 今日已签到");
        const res = await this.request("/wxapi/customeraccount/Checkin", { longitude: 0, latitude: 0, address: "", isMemberCard: false, memberCardNo: "" }, this.headers(storeId, reloginToken));
        if (res.successed) return this.log("✅ 签到成功");
        const msg = res.messages || short(res);
        if (/已签|签到过|重复|已完成/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        this.log(`❌ 签到失败: ${msg}`);
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            const sess = await this.login();
            if (!sess) { this.log("⚠️ 微信授权成功，但该微信号未在都市甜心任一门店注册会员，先在小程序里注册一次再跑"); return; }
            await this.sign(sess);
        } catch (e) {
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
