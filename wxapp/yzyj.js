/*
------------------------------------------
@Description: 微盟onecrm(fansquan)会员 - 微信小程序静默登录 + 每日签到
cron: 45 8 * * *
------------------------------------------
变量名：yzyj
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxa61f98248d20178b，host xapi.weimob.com，微盟 onecrm/signgift）：
（迁移自 YYB-GO 系抓包脚本，原脚本已 code 登录）

登录  POST /fe/mapi/user/loginX  JSON {appid, code, basicInfo:{bosId,cid,tcode:"weimob",vid}, env:"production",
        extendInfo:{source:1}, is_pre_fetch_open:true, parentVid:0, pid:"", storeId:"", queryAuthConfig:true}
        -> errcode==0，token 取 token/accessToken/access_token/jwt（或 data.*）；token 放头 X-WX-Token
签状态 POST /api3/onecrm/mactivity/sign/misc/sign/activity/c/signMainInfo  -> data.isSign（true=今日已签）
签到  POST /api3/onecrm/mactivity/sign/misc/sign/activity/core/c/sign  -> errcode==0 && data.isSign 成功
        （两请求都带一组 weimob 商户头：x-wmsdk-vid / cloud-project-name:fansquan / x-component-is:onecrm/signgift / cloud-bosid 等）

vid/bosId/merchantId/productInstanceId/wid 等是这家小程序绑定的固定商户配置（原脚本硬编码，非个人凭证）。
未注册：loginX errcode!=0 或拿不到 token。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("微盟会员签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "yzyj";
const MINI_APP_ID = "wxa61f98248d20178b";
const BASE = "https://xapi.weimob.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "yzyj_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 " +
    "Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/fe/mapi/user/loginX";
const EP_SIGN_STATUS = "/api3/onecrm/mactivity/sign/misc/sign/activity/c/signMainInfo";
const EP_SIGN = "/api3/onecrm/mactivity/sign/misc/sign/activity/core/c/sign";

// —— 这家小程序绑定的固定商户配置（原脚本硬编码常量，非个人凭证）——
const VID = 6016741943359;
const BOS_ID = 4022115200359;
const MERCHANT_ID = 2000230069359;
const CID = 821033359;
const PRODUCT_INSTANCE_ID = 15532102359;
const WID = 11983225884;
const MERCHANT_HEADERS = {
    "x-wmsdk-vid": String(VID),
    "x-biz-id": "146",
    "cloud-project-name": "fansquan",
    "x-component-is": "onecrm/signgift",
    "cloud-bosid": String(BOS_ID),
    "weimob-bosId": String(BOS_ID),
};
const SIGN_BASIC_INFO = {
    vid: VID, vidType: 2, bosId: BOS_ID, productId: 146,
    productInstanceId: PRODUCT_INSTANCE_ID, productVersionId: "10003",
    merchantId: MERCHANT_ID, tcode: "weimob", cid: CID,
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
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isAuthError = (res) => /登录|token|未授权|失效|过期|未登录/i.test(msgOf(res));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
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
            Referer: `https://servicewechat.com/${MINI_APP_ID}/109/page-frame.html`,
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
            basicInfo: { bosId: String(BOS_ID), cid: String(CID), tcode: "weimob", vid: String(VID) },
            env: "production", extendInfo: { source: 1 },
            is_pre_fetch_open: true, parentVid: 0, pid: "", storeId: "",
            code, queryAuthConfig: true,
        };
        const res = await this.request(EP_LOGIN, body);
        this.token = extractToken(res);
        if (!isOk(res) || !this.token) {
            this.unregistered = true;
            throw new Error(`NO_TOKEN:${msgOf(res)}`);
        }
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    async checkSigned() {
        const body = { appid: MINI_APP_ID, basicInfo: SIGN_BASIC_INFO, extendInfo: { wxTemplateId: 7930 } };
        const res = await this.request(EP_SIGN_STATUS, body, MERCHANT_HEADERS);
        if (isOk(res)) return !!(res.data || {}).isSign;
        return false;
    }
    async doSign() {
        const body = {
            appid: MINI_APP_ID,
            basicInfo: SIGN_BASIC_INFO,
            extendInfo: {
                wxTemplateId: 8105, analysis: [], bosTemplateId: 1000002154,
                childTemplateIds: [
                    { customId: 90004, version: "crm@0.1.81" },
                    { customId: 90002, version: "ec@80.0" },
                    { customId: 90006, version: "hudong@0.0.251" },
                    { customId: 90008, version: "cms@0.0.524" },
                    { customId: 90070, version: "1.0.12" },
                ],
                quickdeliver: { enable: true }, youshu: { enable: false },
                source: 1, channelsource: 5, refer: "onecrm-signgift", mpScene: 1005,
            },
            queryParameter: null,
            i18n: { language: "zh", timezone: "8" },
            pid: "", storeId: "",
            customInfo: { source: 0, wid: WID },
        };
        return this.request(EP_SIGN, body, MERCHANT_HEADERS);
    }
    async sign(retry = true) {
        if (await this.checkSigned()) return this.log("✅ 今日已签到");
        const res = await this.doSign();
        if (isOk(res)) {
            const d = res.data || {};
            const r = d.rewardInfo || {};
            if (d.isSign) {
                const pts = r.integral || r.score || 0;
                return this.log(`✅ 签到成功：${r.rewardName || "签到奖励"}${pts ? ` +${pts}积分` : ""}`);
            }
            return this.log(`✅ 已签到（${short(d)}）`);
        }
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        if (retry && isAuthError(res)) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            try { await this.login(); } catch (e) { if (String(e.message).startsWith("NO_TOKEN")) { this.log(`⚠️ 未注册: ${e.message.slice(9)}`); return; } throw e; }
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msgOf(res)}`);
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
            if (String(e.message).startsWith("NO_TOKEN")) {
                this.log(`⚠️ 该微信号还没在此微盟商户注册会员（登录 ${e.message.slice(9)}），先在小程序里注册一次再跑`);
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
