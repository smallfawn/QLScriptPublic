/*
------------------------------------------
@Description: demogic(GIC)会员 - 微信小程序静默登录 + 每日签到
cron: 41 8 * * *
------------------------------------------
变量名：hxek
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxa1f1fa3785a47c7d，host hope.demogic.com，GIC/demogic 通用会员中台）：
（迁移自 YYB-GO 系抓包脚本，原脚本已 code 登录）

鉴权模型：无 token。每个请求带 memberId + MD5 sign。
  sign = md5(`timestamp=<ts>transId=<APPID><ts>secret=<SECRET>random=<rand>memberId=<mid>`)
  ts = 北京时间 "YYYY-MM-DD HH:mm:ss"；SECRET/ENTERPRISE_ID 是这家中台的固定接口签名密钥（原脚本硬编码，非 appsecret）
登录  POST /gic-wx-app/on_login.json  form: systemInfo,jcode=<code>,memberId=-1,random,appid,transId,sign(memberId=-1),timestamp,...
        -> extract_member_id：data.memberId / response.memberId / response.member.id / data.data.* 任一有值=已注册
        取不到 memberId = 该微信号未在此品牌注册会员
签到  POST /gic-wx-app/member_sign.json  form: memberId,enterpriseId,random,sign(memberId),timestamp,transId,...
        头 sign: <ENTERPRISE_ID>；errcode==0 成功（response.memberSign.integralCount/continuousCount）；已签靠 errmsg 兜底
不做：任务/积分商城。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("demogic会员");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "hxek";
const MINI_APP_ID = "wxa1f1fa3785a47c7d";
const BASE = "https://hope.demogic.com";
const SECRET = "damogic8888";
const ENTERPRISE_ID = "ff8080817d9fbda8017dc20674f47fb6";
const TOKEN_CACHE_FILE = path.join(__dirname, "hxek_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/gic-wx-app/on_login.json";
const EP_SIGN = "/gic-wx-app/member_sign.json";

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
        $.log(`写入缓存失败: ${e.message || e}`);
    }
}
function parseAccount(raw = "") {
    const [id, remark] = String(raw).split("#").map((s) => (s || "").trim());
    return { openid: id, remark: remark || "" };
}
function short(v, n = 200) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function pad(n) {
    return n < 10 ? "0" + n : "" + n;
}
/** 北京时间 "YYYY-MM-DD HH:mm:ss"（用 UTC+8 偏移，避免依赖运行机时区） */
function chinaTs() {
    const d = new Date(Date.now() + 8 * 3600 * 1000);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}
function md5(s) {
    return crypto.createHash("md5").update(s, "utf8").digest("hex");
}
function makeSign(ts, rand, memberId) {
    return md5(`timestamp=${ts}transId=${MINI_APP_ID}${ts}secret=${SECRET}random=${rand}memberId=${memberId}`);
}
function systemInfo() {
    return JSON.stringify({
        SDKVersion: "3.16.0", batteryLevel: "0", brand: "microsoft",
        fontSizeSetting: "-1", language: "zh_CN", model: "microsoft",
        pixelRatio: 1, platform: "windows", screenHeight: 780,
        screenWidth: 414, statusBarHeight: 20, system: "Windows 10 x64",
        version: "4.1.9.35", windowHeight: 716, windowWidth: 414, benchmarkLevel: -1,
        theme: "light",
    });
}
function form(obj) {
    return Object.entries(obj)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v === undefined || v === null ? "" : v)}`)
        .join("&");
}
function launchOptions(scene) {
    return JSON.stringify({ path: "pages/authorize/authorize", query: {}, scene, referrerInfo: {}, apiCategory: "default" });
}
/** 从登录响应里挖 memberId（多路径兜底） */
function extractMemberId(data) {
    if (!data || typeof data !== "object") return "";
    const cand = [data.memberId, data.member_id];
    const r = data.response;
    if (r && typeof r === "object") {
        cand.push(r.memberId, r.member_id);
        if (r.member && typeof r.member === "object") cand.push(r.member.memberId, r.member.member_id, r.member.id);
        if (r.user && typeof r.user === "object") cand.push(r.user.memberId, r.user.member_id, r.user.id);
    }
    const inner = data.data;
    if (inner && typeof inner === "object") cand.push(inner.memberId, inner.member_id);
    const hit = cand.find((v) => v !== undefined && v !== null && String(v) !== "" && String(v) !== "-1");
    return hit ? String(hit) : "";
}

const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.memberId = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    async request(apiPath, body, extraHeaders = {}) {
        const headers = {
            Host: "hope.demogic.com",
            Connection: "keep-alive",
            "User-Agent": UA,
            channelEntrance: "wx_app",
            xweb_xhr: "1",
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "*/*",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/89/page-frame.html`,
            "Accept-Language": "zh-CN,zh;q=0.9",
            ...extraHeaders,
        };
        const res = await axios.request({
            method: "POST", url: `${BASE}${apiPath}`, data: form(body),
            headers, timeout: 20000, validateStatus: () => true,
        });
        if (res.status !== 200) {
            if (res.data && typeof res.data === "object") return res.data;
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
        const ts = chinaTs();
        const rand = Math.floor(1000000 + Math.random() * 8999999);
        const body = {
            systemInfo: systemInfo(), jcode: code, openid: "", scene: "1027",
            memberId: "-1", cliqueId: "-1", cliqueMemberId: "-1", useClique: "0",
            enterpriseId: "", unionid: "", wxOpenid: "",
            random: String(rand), appid: MINI_APP_ID, transId: `${MINI_APP_ID}${ts}`,
            sign: makeSign(ts, rand, "-1"), timestamp: ts, gicWxaVersion: "3.9.74",
            launchOptions: launchOptions(1027),
        };
        const res = await this.request(EP_LOGIN, body, { sign: "" });
        this.memberId = extractMemberId(res);
        if (!this.memberId) {
            this.unregistered = true;
            throw new Error(`NO_MEMBER:${res?.errmsg || res?.msg || short(res)}`);
        }
        const cache = readCache();
        cache[this.account.openid] = { memberId: this.memberId, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功 (memberId ***${this.memberId.slice(-4)})`);
    }
    async sign() {
        const ts = chinaTs();
        const rand = Math.floor(1000000 + Math.random() * 8999999);
        const body = {
            memberId: this.memberId, cliqueId: "-1", cliqueMemberId: "-1", useClique: "0",
            enterpriseId: ENTERPRISE_ID, random: String(rand), sign: makeSign(ts, rand, this.memberId),
            timestamp: ts, transId: `${MINI_APP_ID}${ts}`, gicWxaVersion: "3.9.74",
            launchOptions: launchOptions(1256),
        };
        const res = await this.request(EP_SIGN, body, { sign: ENTERPRISE_ID });
        const errcode = res?.errcode;
        if (Number(errcode) === 0) {
            const ms = (res.response || {}).memberSign || {};
            return this.log(`✅ 签到成功${ms.integralCount !== undefined ? `，积分 ${ms.integralCount}` : ""}${ms.continuousCount !== undefined ? `，连续 ${ms.continuousCount} 天` : ""}`);
        }
        const errmsg = res?.errmsg || res?.msg || (res?.response || {}).errmsg || short(res);
        if (isAlreadyDone(errmsg)) return this.log(`✅ 今日已签到（${errmsg}）`);
        this.log(`❌ 签到失败(errcode=${errcode}): ${errmsg}`);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.memberId && cached.memberId) {
            // memberId 稳定，可直接用；但为保签到 sign 时效仍每次现算 ts/sign，故缓存仅省一次登录
            this.memberId = cached.memberId;
            this.log("使用缓存 memberId");
            return;
        }
        if (!this.memberId) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_MEMBER")) {
                this.log(`⚠️ 该微信号还没在此品牌(demogic)注册会员（登录取不到 memberId：${e.message.slice(10)}），先在小程序里注册一次再跑`);
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
