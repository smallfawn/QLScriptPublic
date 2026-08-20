/*
------------------------------------------
@Description: 红人库 - 微信小程序静默登录 + 每日签到
cron: 34 10 * * *
------------------------------------------
变量名：rrk
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx44356198837c0121，host xapi.weimob.com，微盟 onecrm/signgift）：
（迁移自 YYB-GO 系抓包脚本，原脚本已 code 登录）

登录  POST /fe/mapi/user/loginX  JSON {appid, code, basicInfo:{bosId,cid,tcode:"weimob",vid},
        env:"production", extendInfo:{source:1}, is_pre_fetch_open:true, parentVid:0,
        pid:<bosId>, storeId:"0", queryAuthConfig:true}
        -> errcode==0；token 取 token/accessToken/access_token/jwt（放头 X-WX-Token），wid 取 data.wid
签状态 POST /api3/onecrm/mactivity/sign/misc/sign/activity/c/signMainInfo -> data.hasSign(true=今日已签)
签到  POST /api3/onecrm/mactivity/sign/misc/sign/activity/core/c/sign -> errcode==0
        （重复签 errcode 60070013000332 视为已签），奖励 data.fixedReward.points / data.extraReward.points
积分  POST /api3/onecrm/point/myPoint/getSimpleAccountInfo -> data.availablePoint（附带信息）
        两业务请求 basicInfo 带完整商户配置，body.customInfo.wid = 登录返回的 wid

vid/bosId/cid/merchantId/productInstanceId/productVersionId 等是这家小程序绑定的固定商户配置
（原脚本硬编码，非个人凭证）；wid 由 code 登录动态返回（不照搬原脚本里写死的作者 wid）。
未注册：loginX errcode!=0 或拿不到 token。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("红人库签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "rrk";
const MINI_APP_ID = "wx44356198837c0121";
const BASE = "https://xapi.weimob.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "rrk_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 " +
    "Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/fe/mapi/user/loginX";
const EP_SIGN_STATUS = "/api3/onecrm/mactivity/sign/misc/sign/activity/c/signMainInfo";
const EP_SIGN = "/api3/onecrm/mactivity/sign/misc/sign/activity/core/c/sign";
const EP_POINT = "/api3/onecrm/point/myPoint/getSimpleAccountInfo";

// —— 这家小程序绑定的固定商户配置（原脚本硬编码常量，非个人凭证）——
const WEIMOB = {
    bosId: "4020386662105",
    cid: "114397105",
    vid: 6015049204105,
    vidType: 2,
    productId: 146,
    productInstanceId: 1021082105,
    productVersionId: "10003",
    merchantId: 2000027614105,
    tcode: "weimob",
};

const SIGN_BASIC_INFO = {
    vid: WEIMOB.vid,
    vidType: WEIMOB.vidType,
    bosId: Number(WEIMOB.bosId),
    productId: WEIMOB.productId,
    productInstanceId: WEIMOB.productInstanceId,
    productVersionId: WEIMOB.productVersionId,
    merchantId: WEIMOB.merchantId,
    tcode: WEIMOB.tcode,
    cid: Number(WEIMOB.cid),
};

// 积分接口用的 basicInfo（productId 1 / usercenter 实例）
const POINT_BASIC_INFO = {
    vid: WEIMOB.vid,
    vidType: WEIMOB.vidType,
    bosId: Number(WEIMOB.bosId),
    productId: 1,
    productInstanceId: 1021218105,
    productVersionId: "36000",
    merchantId: WEIMOB.merchantId,
    tcode: WEIMOB.tcode,
    cid: Number(WEIMOB.cid),
};

const SIGN_EXTEND_INFO = {
    wxTemplateId: 7912,
    analysis: [],
    bosTemplateId: 1000001980,
    childTemplateIds: [
        { customId: 90004, version: "crm@0.1.62" },
        { customId: 90002, version: "ec@67.1" },
        { customId: 90006, version: "hudong@0.0.227" },
        { customId: 90008, version: "cms@0.0.503" },
    ],
    quickdeliver: { enable: "false" },
    youshu: { enable: "false" },
    source: 1,
    channelsource: 5,
    refer: "onecrm-signgift",
    mpScene: 1302,
};

// 业务请求需带这组微盟网关路由头，否则网关无法定位 vid 对应的 OneCRM 签到实例
const MERCHANT_HEADERS = {
    "x-wmsdk-vid": String(WEIMOB.vid),
    "x-biz-id": String(WEIMOB.productId),
    "x-component-is": "onecrm/signgift",
    "cloud-bosid": WEIMOB.bosId,
    "weimob-bosId": WEIMOB.bosId,
    "weimob-cid": WEIMOB.cid,
};

// 登录只需商户 bos/cid 头
const LOGIN_HEADERS = {
    "weimob-bosId": WEIMOB.bosId,
    "weimob-cid": WEIMOB.cid,
};

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
function parseAccount(raw = "") {
    const [id, remark] = String(raw).split("#").map((s) => (s || "").trim());
    return { openid: id, remark: remark || "" };
}
function short(v, n = 200) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function extractToken(data) {
    if (!data || typeof data !== "object") return "";
    const d = data.data || {};
    for (const key of ["token", "accessToken", "access_token", "jwt"]) {
        const val = data[key] || d[key];
        if (val && String(val) !== "null") return String(val);
    }
    return "";
}

const isOk = (res) => Number(res?.errcode) === 0;
const msgOf = (res) => res?.errmsg || res?.msg || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|60070013000332|already/i.test(String(t || ""));
const isAuthError = (res) => /登录|token|未授权|失效|过期|未登录|1041|401|403/i.test(msgOf(res));
const needMember = (t) => /注册|未激活|会员|绑定|授权/.test(String(t || ""));
// 活动时间窗口相关（已结束/未开始/下线/不存在/无在用实例）——签到活动轮换或下线时命中
const isActivityClosed = (t) => /活动未开始|活动已结束|活动不存在|活动已下线|活动未开启|活动已过期|活动结束|在用的OneCRM实例|OneCRM实例为空|60070012100039/.test(String(t || ""));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.wid = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    headers(extra = {}) {
        const h = {
            Host: "xapi.weimob.com",
            "User-Agent": UA,
            "Content-Type": "application/json",
            Accept: "*/*",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/93/page-frame.html`,
            "Accept-Language": "zh-CN,zh;q=0.9",
            ...extra,
        };
        if (this.token) h["X-WX-Token"] = this.token;
        return h;
    }
    async request(apiPath, body, extra = {}) {
        const res = await axios.request({
            method: "POST", url: `${BASE}${apiPath}`, data: body || {},
            headers: this.headers(extra), timeout: 20000, validateStatus: () => true,
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
        const body = {
            appid: MINI_APP_ID,
            basicInfo: { bosId: WEIMOB.bosId, cid: WEIMOB.cid, tcode: "weimob", vid: String(WEIMOB.vid) },
            env: "production",
            extendInfo: { source: 1 },
            is_pre_fetch_open: true,
            parentVid: 0,
            pid: WEIMOB.bosId,
            storeId: "0",
            code,
            queryAuthConfig: true,
        };
        const res = await this.request(EP_LOGIN, body, LOGIN_HEADERS);
        this.token = extractToken(res);
        this.wid = String((res && res.data && res.data.wid) || "");
        if (!isOk(res) || !this.token) {
            this.unregistered = true;
            throw new Error(`NO_TOKEN:${msgOf(res)}`);
        }
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, wid: this.wid, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${this.wid ? ` (wid ${this.wid})` : ""}`);
    }
    bizBody() {
        return {
            appid: MINI_APP_ID,
            basicInfo: { ...SIGN_BASIC_INFO },
            extendInfo: { ...SIGN_EXTEND_INFO },
            queryParameter: "null",
            i18n: { language: "zh", timezone: "8" },
            pid: "",
            storeId: "",
            customInfo: { source: 0, wid: this.wid },
        };
    }
    async checkSigned() {
        const res = await this.request(EP_SIGN_STATUS, this.bizBody(), MERCHANT_HEADERS);
        if (isOk(res)) {
            const d = res.data || {};
            return {
                ok: true,
                signed: d.hasSign === true || d.isSign === true,
                days: d.activityCumulativeSignDays ?? d.monthCumulativeSignDays ?? d.signedDate,
            };
        }
        return { ok: false, res };
    }
    async doSign() {
        return this.request(EP_SIGN, this.bizBody(), MERCHANT_HEADERS);
    }
    async queryPoints() {
        try {
            const body = {
                appid: MINI_APP_ID,
                basicInfo: { ...POINT_BASIC_INFO },
                extendInfo: { ...SIGN_EXTEND_INFO, refer: "cms-usercenter" },
                queryParameter: "null",
                i18n: { language: "zh", timezone: "8" },
                pid: "",
                storeId: "",
                targetBasicInfo: { productInstanceId: WEIMOB.productInstanceId },
                request: {},
            };
            const res = await this.request(EP_POINT, body, MERCHANT_HEADERS);
            if (isOk(res) && res.data) {
                this.log(`积分 可用 ${res.data.availablePoint ?? 0}`);
            }
        } catch (e) { /* 积分为附带信息，失败不影响签到结论 */ }
    }
    async sign(retry = true) {
        const st = await this.checkSigned();
        if (st.ok && st.signed) {
            this.log(`✅ 今日已签到${st.days ? `，累计 ${st.days} 天` : ""}`);
            await this.queryPoints();
            return;
        }
        if (!st.ok) {
            if (isActivityClosed(msgOf(st.res)) || isActivityClosed(st.res && st.res.errcode)) {
                this.log(`⚠️ 该商户当前无在用的 OneCRM 签到实例/活动已下线（${msgOf(st.res)}）——登录、会员、积分接口均正常，仅签到活动被商户下线或轮换；服务端按 vid 解析活动为空，需商户重新上线签到活动（或从小程序抓取新的 productInstanceId/version）后方可签到`);
                await this.queryPoints();
                return;
            }
            if (retry && isAuthError(st.res)) {
                this.log("会话失效，重新登录后重试");
                this.token = ""; this.wid = "";
                await this.reloginOrMark();
                return this.sign(false);
            }
            if (needMember(msgOf(st.res))) { this.unregistered = true; throw new Error(`NO_MEMBER:${msgOf(st.res)}`); }
            // 查询状态失败但非鉴权/会员问题：继续直接尝试签到
            this.log(`查询签到状态失败（${msgOf(st.res)}），直接尝试签到`);
        }

        const res = await this.doSign();
        if (isOk(res)) {
            const d = res.data || {};
            const fr = d.fixedReward || {};
            const er = d.extraReward || {};
            const rewards = [];
            if ((fr.points || 0) > 0) rewards.push(`${fr.points}${d.pointName || "积分"}`);
            if ((fr.growth || 0) > 0) rewards.push(`${fr.growth}${d.growthName || "成长值"}`);
            if ((fr.amount || 0) > 0) rewards.push(`${fr.amount}元`);
            if ((er.points || 0) > 0) rewards.push(`额外${er.points}${d.pointName || "积分"}`);
            this.log(`✅ 签到成功${rewards.length ? `：${rewards.join("、")}` : ""}`);
            await this.queryPoints();
            return;
        }
        if (isAlreadyDone(msgOf(res)) || isAlreadyDone(res && res.errcode)) {
            this.log(`✅ 今日已签到（${msgOf(res)}）`);
            await this.queryPoints();
            return;
        }
        if (isActivityClosed(msgOf(res))) {
            this.log(`⚠️ 签到活动当前未开启/已结束（${msgOf(res)}）——该商户签到活动已轮换或到期，需从小程序重新抓取 productInstanceId/productVersionId 后更新配置；登录与状态查询均正常`);
            return;
        }
        if (retry && isAuthError(res)) {
            this.log("会话失效，重新登录后重试");
            this.token = ""; this.wid = "";
            await this.reloginOrMark();
            return this.sign(false);
        }
        if (needMember(msgOf(res))) { this.unregistered = true; throw new Error(`NO_MEMBER:${msgOf(res)}`); }
        this.log(`❌ 签到失败: ${msgOf(res)}`);
    }
    async reloginOrMark() {
        try {
            await this.login();
        } catch (e) {
            if (String(e.message).startsWith("NO_TOKEN")) { this.unregistered = true; throw new Error(`NO_MEMBER:${e.message.slice(9)}`); }
            throw e;
        }
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            this.wid = cached.wid || "";
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
            const m = String(e.message || e);
            if (m.startsWith("NO_TOKEN") || m.startsWith("NO_MEMBER")) {
                this.log(`⚠️ 该微信号还没在红人库注册会员（${m.replace(/^NO_(TOKEN|MEMBER):/, "")}），先在小程序里注册一次再跑`);
                return;
            }
            this.log(`执行失败: ${m}`);
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
