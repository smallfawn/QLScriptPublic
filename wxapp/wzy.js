/*
------------------------------------------
@Description: 喂自由(达能爱他美育儿中心) - 微信小程序静默登录 + 每日签到
cron: 16 10 * * *
------------------------------------------
变量名：wzy
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx75813e4a771649e5，host phapi.nutriciaeln.com.cn）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

网关头：x-ca-key=CA_KEY / x-ca-signature-method:HmacSHA256 / x-ca-timestamp(ms) /
        x-ca-nonce:"" / x-ca-signature:""（原脚本签名/nonce 为空，网关不校验签名，无需 HMAC）
        version:1.0 / Authorization:Bearer <token>（登录后）
登录  POST /auth/v1/miniapp/login {code,appid}
        -> code==200，data.access_token(=token)；同时 data.uuid/expirTime/openId/unionId
        有 openId 但无 access_token = 该微信号未在喂自由注册会员
状态  POST /activity/v1/miniapp/sign/MGM_SIGN {} -> code==200，data.continueDays / data.signList(末项 status==1=今日已签)
签到  POST /activity/v1/miniapp/sign/sign/MGM_SIGN {} -> 外层 code==200；
        内层 data.code=="10002"=今日已签，data.code==200 && data.value==1=签到成功
        内层 data.code=="10001"/text=="活动已结束"=当前无每日签到活动
CA_KEY / ACTIVITY_CODE(MGM_SIGN) 是该小程序固定应用常量（原脚本硬编码，非个人凭证）。

现状（2026-08 实测，号1 owNAX6vpz…）：code 登录/取 token/自由金查询全部正常，但每日签到
  /activity/v1/miniapp/sign/sign/<任意code> 一律返回 {code:"10001","text":"活动已结束"}
  （连 BOGUS 码也一样），且任务列表只剩一次性/可重复任务(完善信息/扫罐码/体验工具/看知识/
  浏览专题)+邀请有礼月榜，无每日签到 → 喂自由已整体下线每日签到，当前判 not_sign。
  脚本保留完整签到流程：一旦官方重新上线签到活动即可直接生效。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("喂自由签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "wzy";
const MINI_APP_ID = "wx75813e4a771649e5";
const BASE_URL = "https://phapi.nutriciaeln.com.cn";
const CA_KEY = "203753385";
const VERSION = "1.0";
const ACTIVITY_CODE = "MGM_SIGN";
const PAGE_VERSION = "100";
const TOKEN_CACHE_FILE = path.join(__dirname, "wzy_token_cache.json");
const UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " +
    "(KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.75(0x18004b2b) NetType/WIFI Language/zh_CN";

const EP_LOGIN = "/auth/v1/miniapp/login";
const EP_SIGN_DETAIL = `/activity/v1/miniapp/sign/${ACTIVITY_CODE}`;
const EP_SIGN = `/activity/v1/miniapp/sign/sign/${ACTIVITY_CODE}`;
const EP_CREDIT = "/activity/v1/miniapp/credit/getUserCredit";
const EP_USERINFO = "/user/v1/miniapp/member/my";

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
function short(v, n = 220) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
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
    buildHeaders() {
        const headers = {
            Host: "phapi.nutriciaeln.com.cn",
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent": UA,
            "x-ca-key": CA_KEY,
            "x-ca-signature-method": "HmacSHA256",
            "x-ca-timestamp": String(Date.now()),
            "x-ca-nonce": "",
            "x-ca-signature": "",
            "x-ca-signature-headers": "x-ca-timestamp,x-ca-key,x-ca-nonce,x-ca-signature-method",
            version: VERSION,
            web_id: "",
            deviceId: "",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
        };
        if (this.token) headers.Authorization = `Bearer ${this.token}`;
        return headers;
    }
    async request(method, apiPath, data) {
        const res = await axios.request({
            method,
            url: `${BASE_URL}${apiPath}`,
            data: method === "POST" ? (data || {}) : undefined,
            params: method === "GET" ? data : undefined,
            headers: this.buildHeaders(),
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
    async login() {
        const code = await this.getCode();
        const res = await this.request("POST", EP_LOGIN, { code, appid: MINI_APP_ID });
        const data = res.data || {};
        const token = data.access_token || data.accessToken || "";
        if (Number(res.code) === 200 && token) {
            this.token = String(token);
            const cache = readCache();
            cache[this.account.openid] = {
                token: this.token,
                uuid: data.uuid || "",
                expirTime: data.expirTime || "",
                updatedAt: new Date().toISOString(),
            };
            writeCache(cache);
            this.log("登录成功");
            return;
        }
        // 有 openId/unionId 但无 access_token = 该微信号未在喂自由注册会员
        const oid = data.openId || data.unionId;
        const msg = res.msg || res.message || short(res);
        if (oid && !token) { this.unregistered = true; throw new Error(`NO_ACCOUNT:登录返回 openId 但无 token`); }
        if (Number(res.code) !== 200 && /注册|未激活|会员|绑定|授权|未登录/.test(String(msg))) {
            this.unregistered = true;
            throw new Error(`NO_ACCOUNT:${msg}`);
        }
        throw new Error(`登录失败: ${msg}`);
    }
    isAuthErr(resp) {
        const code = Number(resp && resp.code);
        const msg = String((resp && (resp.msg || resp.message)) || "");
        if ([401, 403, 4001, 4003, 10401].includes(code)) return true;
        return /token|登录|未授权|失效|过期|未登录|鉴权|无效/i.test(msg);
    }
    async getSignDetail() {
        const res = await this.request("POST", EP_SIGN_DETAIL, {});
        return res;
    }
    async doSign() {
        return this.request("POST", EP_SIGN, {});
    }
    async logCredit() {
        try {
            const res = await this.request("GET", EP_CREDIT, null);
            if (Number(res.code) === 200) {
                const credit = (res.data || {}).credit;
                if (credit !== undefined) this.log(`自由金余额: ${credit}`);
            }
        } catch (e) { /* 非致命 */ }
    }
    async sign(retry = true) {
        // 先查状态（拿连续天数 + 今日是否已签）
        const detail = await this.getSignDetail();
        if (Number(detail.code) !== 200) {
            if (retry && this.isAuthErr(detail)) {
                this.log("会话失效，重新登录后重试");
                this.token = "";
                await this.login();
                return this.sign(false);
            }
            const dmsg = detail.msg || detail.message || short(detail);
            if (/注册|未激活|会员|绑定/.test(String(dmsg))) { this.unregistered = true; throw new Error(`NO_ACCOUNT:${dmsg}`); }
            // 状态查询失败不阻断，继续尝试直接签到
            this.log(`签到状态查询失败(${dmsg})，直接尝试签到`);
        }
        const dData = detail.data || {};
        const continueDays = dData.continueDays;
        const signList = Array.isArray(dData.signList) ? dData.signList : [];
        const todaySigned = signList.length > 0 && signList[signList.length - 1].status === 1;
        if (todaySigned) {
            return this.log(`✅ 今日已签到${continueDays !== undefined ? `，已连续 ${continueDays} 天` : ""}`);
        }

        const r = await this.doSign();
        const d = r.data || {};
        const innerCode = String(d.code);
        const text = d.text || "";
        if (Number(r.code) === 200) {
            // 10001 / “活动已结束”：服务端当前无每日签到活动（喂自由已把签到活动整体下线，仅剩一次性任务+邀请榜）
            if (innerCode === "10001" || /活动已结束|活动不存在|活动未开始|暂未开始/.test(String(text))) {
                return this.log(`ℹ️ 当前无每日签到活动（${text || "活动已结束"}）——喂自由已下线每日签到，改为一次性任务/邀请榜`);
            }
            if (innerCode === "10002") return this.log(`✅ 今日已签到（${text || "已签"}）`);
            if (innerCode === "200" && Number(d.value) === 1) return this.log(`✅ 签到成功${text ? `：${text}` : ""}${continueDays !== undefined ? `，已连续 ${(continueDays || 0) + 1} 天` : ""}`);
            if (/成功|已签|签到过|重复/.test(String(text))) return this.log(`✅ 签到成功（${text}）`);
            return this.log(`签到结果：${text || short(r)}`);
        }
        const msg = r.msg || r.message || short(r);
        if (/已签|签到过|重复|已完成/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && this.isAuthErr(r)) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            return this.sign(false);
        }
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
            await this.logCredit();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在喂自由注册会员（${String(e.message).replace(/^NO_ACCOUNT:/, "")}），先在小程序里登录注册一次再跑`);
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
