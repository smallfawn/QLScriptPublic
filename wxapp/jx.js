/*
------------------------------------------
@Description: 酒仙(jiuxian) - 微信小程序静默登录 + 每日签到领金币
cron: 40 8 * * *
------------------------------------------
变量名：jx
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx244a18142bb0c78a，host newappuser.jiuxian.com）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录；无签名，鉴权全靠 token）

所有请求把一组固定应用参数放进 query（appKey/appVersion/apiVersion/areaId/
  appChannel/deviceType/equipmentType/longi/lati/... 均为该小程序固定应用常量），
  已登录后再带 token（既进 query 也进 header）。响应壳统一 success=="1"，业务数据在 result。
登录  GET /xiaochengxu/jscode2session.htm  query 追加 {jscode:code, encryptedData:"", iv:""}
        -> success=="1"，result.token（后续鉴权 token）、result.userId
        无 token/userId 视为未绑定/未激活酒仙会员 -> ⚠️
状态  GET /memberChannel/memberInfo.htm  query 带 token
        -> success=="1"，result.isSignTody(true=今日已签)
签到  GET /memberChannel/userSign.htm    query 带 token
        -> success=="1"，result.receivedGoldNums(本次所得金币)；重复签到 errMsg 提示已签
appKey/appVersion/areaId/equipmentType 等是该小程序固定应用常量（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("酒仙签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "jx";
const MINI_APP_ID = "wx244a18142bb0c78a";
const PAGE_VERSION = "153";
const USER_BASE = "https://newappuser.jiuxian.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "jx_token_cache.json");
const WX_SERVER_URL = process.env.wx_server_url || "http://192.168.31.196:8787";
const WX_AUTH = process.env.wx_auth || "";

// —— 该小程序固定应用常量（原脚本硬编码，非个人凭证） ——
const APP_KEY = "feff3071-7bff-4fda-b535-c9ebdf245f53";
const APP_VERSION = "9.2.21";
const API_VERSION = "1.0";
const APP_CHANNEL = "xiaochengxu";
const DEVICE_TYPE = "XIAOCHENGXU";
const AREA_ID = "698";
const LONGI = "113.26435852050781";
const LATI = "23.129079818725586";
const EQUIPMENT_TYPE =
    '{"CPUType":"Intel(R) Core(TM) i7-8086K CPU @ 4.00GHz","benchmarkLevel":-1,' +
    '"brand":"microsoft","memorySize":32682.14453125,"model":"microsoft",' +
    '"platform":"windows","system":"Windows 11 x64","statusBarHeight":20,' +
    '"SDKVersion":"3.17.0","PCKernelVersion":"2.5.5"}';

const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/xiaochengxu/jscode2session.htm";
const EP_MEMBER_INFO = "/memberChannel/memberInfo.htm";
const EP_SIGN = "/memberChannel/userSign.htm";

const wechat = new WeChatServer({
    url: WX_SERVER_URL,
    appid: MINI_APP_ID,
    auth: WX_AUTH,
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
function short(v, n = 220) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function isOk(d) {
    return d && (String(d.success) === "1" || String(d.success) === "true");
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.userId = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    commonParams(token = "") {
        return {
            appKey: APP_KEY,
            appVersion: APP_VERSION,
            apiVersion: API_VERSION,
            areaId: AREA_ID,
            channelCode: "0, 1",
            appChannel: APP_CHANNEL,
            cpsId: "",
            deviceType: DEVICE_TYPE,
            pushToken: "",
            supportWebp: "2",
            token: token || "",
            longi: LONGI,
            lati: LATI,
            equipmentType: EQUIPMENT_TYPE,
            screenReslolution: "414x780",
            sysVersion: "Windows 11 x64",
        };
    }
    headers(token = "", extra) {
        const h = {
            "User-Agent": UA,
            xweb_xhr: "1",
            "Content-Type": "application/json",
            Accept: "*/*",
            "Sec-Fetch-Site": "cross-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            "Accept-Language": "zh-CN,zh;q=0.9",
        };
        if (token) h.token = token;
        return Object.assign(h, extra || {});
    }
    async apiGet(apiPath, { token = this.token, extraParams, extraHeaders } = {}) {
        const params = Object.assign(this.commonParams(token), extraParams || {});
        const res = await axios.request({
            method: "GET",
            url: `${USER_BASE}${apiPath}`,
            params,
            headers: this.headers(token, extraHeaders),
            timeout: 20000,
            validateStatus: () => true,
        });
        if (res.status !== 200 && !(res.data && typeof res.data === "object")) {
            throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        }
        return res.data || {};
    }
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }
    async fetchPhone() {
        // 老式 encryptedData/iv 手机号授权（与本 openid 的登录 code 同一 session_key，jscode2session 用来绑定账号）
        const res = await axios.request({
            method: "POST", url: `${WX_SERVER_URL}/wx/getphonenumber`,
            data: { openid: this.account.openid, appid: MINI_APP_ID },
            headers: { auth: WX_AUTH }, timeout: 30000, validateStatus: () => true,
        });
        const d = res.data || {};
        if (d.status === false) throw new Error(`取手机号失败: ${d.message || short(d)}`);
        const raw = d?.data?.raw || d?.raw || {};
        const enc = raw.encryptedData || d?.encryptedData || "";
        const iv = raw.iv || d?.iv || "";
        if (!enc || !iv) throw new Error(`取手机号失败(无 encryptedData): ${short(d)}`);
        return { enc, iv };
    }
    async jscode2session(enc, iv) {
        const code = await this.getCode();
        return this.apiGet(EP_LOGIN, {
            token: "",
            extraParams: { jscode: code, encryptedData: enc || "", iv: iv || "" },
            extraHeaders: { secure: "false" },
        });
    }
    async login() {
        // 1) 先普通 code 登录：openid 已绑定过酒仙账号时直接回 userId
        let res = await this.jscode2session("", "");
        let result = isOk(res) ? (res.result || {}) : {};
        // 2) 仅有 token 无 userId = 该 openid 未绑定酒仙 -> 手机号授权绑定一次
        if (!(result.token && result.userId)) {
            if (!isOk(res)) {
                const msg = res.errMsg || res.message || res.msg || short(res);
                throw new Error(`登录失败: errCode=${res.errCode ?? ""} ${msg}`);
            }
            this.log("首次登录未绑定账号，走手机号授权绑定...");
            let phone;
            try { phone = await this.fetchPhone(); }
            catch (e) { this.unregistered = true; throw new Error(`NO_ACCOUNT:未绑定酒仙且${e.message}`); }
            res = await this.jscode2session(phone.enc, phone.iv);
            result = isOk(res) ? (res.result || {}) : {};
        }
        this.token = String(result.token || "");
        this.userId = String(result.userId || "");
        if (!this.token || !this.userId) {
            const msg = res.errMsg || res.message || res.msg || short(res);
            this.unregistered = true;
            throw new Error(`NO_ACCOUNT:手机号授权后仍未拿到 userId（可能授权/绑定被拒）: ${msg || short(res)}`);
        }
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, userId: this.userId, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    isAuthErr(resp) {
        const msg = String((resp && (resp.errMsg || resp.message || resp.msg)) || "");
        const code = String((resp && (resp.errCode || resp.code)) || "");
        if (/token|登录|未授权|失效|过期|未登录|鉴权|重新登录/i.test(msg)) return true;
        if (["401", "403", "-1", "10086"].includes(code) && /token|登录/i.test(msg)) return true;
        return false;
    }
    async sign(retry = true) {
        // 先查状态
        const info = await this.apiGet(EP_MEMBER_INFO);
        if (isOk(info)) {
            const result = info.result || {};
            if (result.isSignTody === true || result.isSignTody === 1 || String(result.isSignTody) === "true") {
                return this.log("✅ 今日已签到");
            }
        } else if (retry && this.isAuthErr(info)) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            return this.sign(false);
        }
        // 执行签到
        const res = await this.apiGet(EP_SIGN);
        if (isOk(res)) {
            const gold = (res.result || {}).receivedGoldNums;
            return this.log(`🎉 签到成功${gold !== undefined && gold !== null ? `，本次 +${gold} 金币` : ""}`);
        }
        const msg = res.errMsg || res.message || res.msg || short(res);
        if (/已签|签到过|重复|已完成|今日/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && this.isAuthErr(res)) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msg}`);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            this.userId = cached.userId || "";
            this.log("使用缓存token");
            return;
        }
        if (!this.token) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没绑定/激活酒仙会员（${String(e.message).replace(/^NO_ACCOUNT:/, "")}），先在小程序里登录一次再跑`);
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
