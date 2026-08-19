/*
------------------------------------------
@Description: 群脉 MAI / quncrm 平台通用 - 微信小程序静默登录 + 会员签到
              一份脚本覆盖所有用群脉 SaaS 的品牌小程序（问问农会员、…）
cron: 49 8 * * *
------------------------------------------
变量名：quncrm
变量值：openid#appid#accountId[#备注]，一行一个小程序，多行或 & 分隔
       openid    = wx_server 里的账号标识（同一个 openid 能给所有 appid 取码）
       appid     = 该小程序 appid
       accountId = 群脉租户 id，取自解包 app-config.json 的 ext.maiAccountId
                   （24 位十六进制，例：634f5f28a0e71c29500b0313）
       例：owNAX6vp****#wxc5d513880ace81a4#634f5f28a0e71c29500b0313#问问农会员

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（oauth.quncrm.com + consumer-api.quncrm.com）：

登录  POST https://oauth.quncrm.com/<accountId>/v2/weapp/oauth
        {scope:"base", code, watermark:{appid:<小程序 appid>}, is_group:"false"}
        -> {accessToken(JWT), channelId, openId, member:{id, originFrom, socials, ...}}
        **accountId 在 URL 路径里**（解包 signinWeapp: `${oauthApiBaseUrl}/${accountId}`）

鉴权方式很特别：**accessToken 不是请求头，是 query 参数**（解包里 request 拦截器统一
往 params 里塞 `accountId` + `accessToken`，h5ChannelId 存在时还塞 channelId）。

活动  GET  /modules/campaigncenter/signin/page    -> {id, title, type:"signin", status}
        签到活动 id 从这里发现（只读、免参），不写死
状态  GET  /modules/campaigncenter/signin/stats   -> 连签/累计等
签到  POST /modules/campaigncenter/signin  {}     （实测空 body 即可，没有必填参数）
明细  GET  /modules/campaigncenter/signin/detail?campaignId=<id>

失败信封 {name, message, status, code, errors}。**关键业务码：400105 =
errors.campaign.memberFilter.code == "memberBanned"，即"活动仅针对部分用户开放"**
—— 这是运营给活动配的人群定向，不是脚本缺陷、也不是没注册（member 存在），
脚本按 ⚠️ 输出并跳过，不做任何绕过。

不做：/modules/campaigncenter/signin/share（分享得奖励）、抽奖类活动。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("群脉平台签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "quncrm";
const OAUTH_BASE = "https://oauth.quncrm.com";
const CONSUMER_BASE = "https://consumer-api.quncrm.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "quncrm_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x28003036) MiniProgramEnv/android";

const EP_OAUTH = "/v2/weapp/oauth";
const EP_PAGE = "/modules/campaigncenter/signin/page";
const EP_STATS = "/modules/campaigncenter/signin/stats";
const EP_SIGN = "/modules/campaigncenter/signin";

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
    const [openid, appid, accountId, remark] = String(raw).split("#").map((s) => (s || "").trim());
    return { openid, appid, accountId, remark: remark || "" };
}

function short(v, n = 200) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}

/** 成功就是 2xx 且没有 status>=400 的错误信封 */
const isOk = (res) => !!res && !(Number(res.status) >= 400);
const msgOf = (res) => res?.message || res?.name || short(res);
const codeOf = (res) => Number(res?.code || 0);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
/** 400105 / memberBanned = 活动人群定向没包含这个会员 */
const isMemberBanned = (res) =>
    codeOf(res) === 400105 ||
    String(res?.errors?.campaign?.memberFilter?.code || "") === "memberBanned";
const isAuthError = (res) => Number(res?.status) === 401 || /token|登录|未授权|过期/i.test(msgOf(res));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.wechat = new WeChatServer({
            url: process.env.wx_server_url || "http://192.168.31.196:8787",
            appid: this.account.appid,
            auth: process.env.wx_auth || "",
        });
    }

    log(text) {
        const tag = this.account.remark || this.account.appid || "";
        $.log(`账号[${this.index}]${tag ? `[${tag}]` : ""} ${text}`);
    }

    async request(url, { method = "GET", body = null, query = null, withAuth = true } = {}) {
        const params = { ...(query || {}) };
        if (withAuth) {
            // 群脉把身份放 query：accountId + accessToken
            params.accountId = this.account.accountId;
            if (this.token) params.accessToken = this.token;
        }
        const res = await axios.request({
            method,
            url,
            data: method === "GET" ? undefined : body || {},
            params,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json, text/plain, */*",
                "User-Agent": USER_AGENT,
                Referer: `https://servicewechat.com/${this.account.appid}/0/page-frame.html`,
                xweb_xhr: "1",
            },
            timeout: 20000,
            validateStatus: () => true,
        });
        if (res.status < 200 || res.status >= 300) {
            // 业务结论在 4xx 体里（memberBanned / 已签到 都是这么回的）
            if (res.data && typeof res.data === "object") return res.data;
            throw new Error(`${url} HTTP ${res.status}: ${short(res.data)}`);
        }
        return res.data;
    }

    /** wcs.getCode 在 status:false 时也 resolve，必须自己判失败，否则取码限流会被误报成登录失败 */
    async getCode() {
        const { data } = await this.wechat.getCode(this.account.openid);
        if (data && data.status === false) {
            throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        }
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }

    get cacheKey() {
        return `${this.account.openid}#${this.account.appid}`;
    }

    async login() {
        const code = await this.getCode();
        const res = await this.request(`${OAUTH_BASE}/${this.account.accountId}${EP_OAUTH}`, {
            method: "POST",
            withAuth: false,
            body: { scope: "base", code, watermark: { appid: this.account.appid }, is_group: "false" },
        });
        if (!isOk(res) || !res.accessToken) throw new Error(`登录失败: ${msgOf(res)}`);
        this.token = String(res.accessToken);
        const member = res.member || {};
        const cache = readCache();
        cache[this.cacheKey] = { token: this.token, memberId: member.id, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${member.id ? `（会员 ${String(member.id).slice(0, 8)}…）` : "（无会员档案）"}`);
    }

    /** 读签到活动；会话失效返回 null */
    async signinPage(needLog = true) {
        const res = await this.request(CONSUMER_BASE + EP_PAGE);
        if (!isOk(res)) {
            if (isAuthError(res)) return null;
            if (needLog) this.log(`读取签到活动失败: ${msgOf(res)}`);
            return { failed: true, res };
        }
        if (needLog) this.log(`签到活动: ${res.title || res.name || res.id}（${res.status || "-"}）`);
        return res;
    }

    async ensureLogin() {
        const cached = readCache()[this.cacheKey] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            const p = await this.signinPage(false);
            if (p !== null) {
                this.log("使用缓存token");
                return p;
            }
            this.log("缓存token失效，重新登录");
            this.token = "";
        }
        if (!this.token) await this.login();
        return null;
    }

    async sign(page) {
        if (page === null || page === undefined) page = await this.signinPage();
        if (page === null) {
            this.log("❌ 会话无效，签到跳过");
            return;
        }
        if (page.failed) {
            if (isMemberBanned(page.res)) {
                this.log(`⚠️ ${msgOf(page.res)} —— 这是活动的人群定向（memberBanned），登录/会员都正常，不是脚本问题`);
                return;
            }
            this.log(`❌ 读取签到活动失败: ${msgOf(page.res)}`);
            return;
        }
        const stats = await this.request(CONSUMER_BASE + EP_STATS);
        if (!isOk(stats) && isMemberBanned(stats)) {
            this.log(`⚠️ ${msgOf(stats)} —— 这是活动的人群定向（memberBanned），登录/会员都正常，不是脚本问题`);
            return;
        }
        if (isOk(stats)) this.log(`签到状态: ${short(stats, 140)}`);
        const res = await this.request(CONSUMER_BASE + EP_SIGN, { method: "POST", body: {} });
        if (isOk(res)) {
            this.log(`✅ 签到成功${res.bonus || res.point ? `，+${res.bonus || res.point}` : ""}`);
            return;
        }
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        if (isMemberBanned(res)) {
            this.log(`⚠️ ${msgOf(res)} —— 这是活动的人群定向（memberBanned），不做绕过`);
            return;
        }
        this.log(`❌ 签到失败: ${msgOf(res)}`);
    }

    async run() {
        if (!this.account.openid || !this.account.appid || !this.account.accountId) {
            this.log("跳过：变量值要写成 openid#appid#accountId[#备注]");
            return;
        }
        try {
            const page = await this.ensureLogin();
            await this.sign(page);
        } catch (e) {
            this.log(`执行失败: ${e.message || e}`);
        }
    }
}

!(async () => {
    $.checkEnv(ckName);
    if (!$.userCount) {
        $.log(`未找到变量 ${ckName}`);
        return;
    }
    for (let i = 0; i < $.userList.length; i++) {
        await new Task($.userList[i]).run();
        if (i < $.userList.length - 1) await $.wait(1500, 3000);
    }
})()
    .catch((e) => $.log(e.message || e))
    .finally(() => $.done());
