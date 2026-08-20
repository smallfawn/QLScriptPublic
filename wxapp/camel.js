/*
------------------------------------------
@Author: sm
@Description: 骆驼 CAMEL（有赞微商城）每日签到得积分
cron: 18 8 * * *
------------------------------------------
变量名：camel
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行（可加 #备注，仅取 # 前的 openid）
依赖变量：wx_server_url、wx_auth
------------------------------------------
接口契约（h5.youzan.com，有赞 SaaS 通用签到，与本仓库 yz19.js / wanyazhenxuan.js 同一套）：
  静默登录 POST /wscshop/weapp/authorize.json  {appId, clientBiz:"weapp_wsc", code}
        -> code==0，data.{accessToken|access_token, sessionId, kdtId, nick_name, mobile}
  签到活动 GET  /wscump/checkin/show_checkin_page_v2.json -> {checkinId, isShow}
  执行签到 GET  /wscump/checkin/checkinV2.json?checkinId=<id>
        -> {desc, list[{infos:{title}}]}；重复签到报「已达最大参与次数」
  积分余额 GET  /wscump/integral/user_points.json -> {current_points|real_points}
  公共 query：app_id / kdt_id / access_token；公共头：Extra-Data(sid/version/...)
  统一响应：code==0 成功，否则 msg 为错误原因
------------------------------------------
常量来源（原 YYB-GO 版 CAMEL.js 抓取，均为应用级固定常量，非个人凭证）：
  MINI_APP_ID=wxa82836302320ca29、kdtId=182479100（签到商城）、userVersion=3.197.5.102
  FALLBACK_CHECKIN_ID=5540097（show_checkin_page 未返回时兜底）
说明：登录仅用 wx.login code（authorize.json 内部做 code2session），smallcat 取码即可，
  不需要明文 openId/unionId，也不涉及加密手机号。签到页在分包内，接口沿用本仓库已验证
  可用的有赞通用签到契约，未做接口盲猜。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("骆驼CAMEL签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const MINI_APP_ID = "wxa82836302320ca29";
const CLIENT_BIZ = "weapp_wsc";
const KDT_ID = "182479100";
const USER_VERSION = "3.197.5.102";
const PAGE_VERSION = "32"; // Referer 里的版本号，仅用于伪装来源，不参与校验
const FALLBACK_CHECKIN_ID = "5540097"; // show_checkin_page 未返回 checkinId 时兜底
const API_BASE = "https://h5.youzan.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "camel_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

const ckName = "camel";
const WX_SERVER_URL = (process.env.wx_server_url || "http://192.168.31.196:8787").replace(/\/$/, "");
const WX_AUTH = process.env.wx_auth || "";

function short(value, max = 200) {
    if (value === undefined || value === null) return "";
    const text = typeof value === "string" ? value : JSON.stringify(value);
    return text.length > max ? `${text.slice(0, max)}...` : text;
}

function readTokenCache() {
    try {
        if (!fs.existsSync(TOKEN_CACHE_FILE)) return {};
        return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {};
    } catch (e) {
        return {};
    }
}

function writeTokenCache(cache) {
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

function maskPhone(phone = "") {
    return String(phone).replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function pickToken(data = {}) {
    return data.accessToken || data.access_token || "";
}

function isTokenError(message) {
    return /access_token|token|登录|invalid session|session/i.test(String(message || ""));
}

function isRepeatCheckin(message) {
    return /已达最大参与次数|已签到|重复签到|今日已参与|已经签到|已参与/.test(String(message || ""));
}

// smallcat 偶发 "获取失败"(运行时会话抖动)：刷新会话后间隔重试，最多 4 次
async function getWxCode(openid) {
    if (!WX_AUTH) throw new Error("未配置 wx_auth");
    const headers = { auth: WX_AUTH, "Content-Type": "application/json" };
    const body = { appid: MINI_APP_ID, openid };
    let lastMsg = "";
    for (let attempt = 0; attempt < 4; attempt++) {
        if (attempt) {
            try {
                await axios.request({
                    method: "POST",
                    url: `${WX_SERVER_URL}/wx/refresh`,
                    headers,
                    data: body,
                    timeout: 30000,
                    validateStatus: () => true,
                });
            } catch (e) {
                // 刷新失败不阻断，继续重试取 code
            }
            await new Promise((r) => setTimeout(r, 3000));
        }
        const { status, data } = await axios.request({
            method: "POST",
            url: `${WX_SERVER_URL}/wx/code`,
            headers,
            data: body,
            timeout: 30000,
            validateStatus: () => true,
        });
        if (data && data.status === false) {
            lastMsg = data.message || "获取失败";
            continue;
        }
        const code = data?.code || data?.data?.code;
        if (status === 200 && code) return code;
        lastMsg = `HTTP ${status}: ${short(data)}`;
    }
    throw new Error(`获取code失败(已重试): ${lastMsg}`);
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.openid = this.account.openid;
        this.token = "";
        this.sessionId = "";
        this.cookie = "";
        this.kdtId = KDT_ID;
        this.userInfo = {};
        this.checkinId = "";
        this.isShow = false;
        this.signedBefore = false;
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    async run() {
        if (!this.openid) {
            this.log("跳过：变量值里没有 openid");
            return;
        }

        const cached = this.getCachedToken();
        if (cached) {
            this.applyToken(cached);
            this.log("使用缓存token");
            if (!(await this.checkToken())) {
                this.removeCachedToken();
                this.log("缓存token失效，重新登录");
            }
        }

        if (!this.token) {
            await this.loginByWxCode();
            if (!this.token) return;
        }

        await this.showCheckinPage();
        await this.doCheckin();
        await this.getPoints();
    }

    getCachedToken() {
        const cache = readTokenCache();
        return cache[this.openid] || null;
    }

    saveCachedToken() {
        if (!this.token) return;
        const cache = readTokenCache();
        cache[this.openid] = {
            accessToken: this.token,
            sessionId: this.sessionId,
            kdtId: this.kdtId,
            cookie: this.cookie,
            mobile: this.userInfo.mobile || "",
            nickName: this.userInfo.nick_name || this.userInfo.nickName || "",
            updatedAt: new Date().toISOString(),
        };
        writeTokenCache(cache);
    }

    removeCachedToken() {
        const cache = readTokenCache();
        if (cache[this.openid]) {
            delete cache[this.openid];
            writeTokenCache(cache);
        }
        this.token = "";
        this.sessionId = "";
        this.cookie = "";
    }

    applyToken(data = {}) {
        this.token = pickToken(data);
        this.sessionId = data.sessionId || data.session_id || "";
        this.kdtId = String(data.kdtId || data.kdt_id || KDT_ID);
        // 登录响应本身不带 cookie 字段，此时不要覆盖 request() 从 Set-Cookie 抓到的值
        if (data.cookie) this.cookie = data.cookie;
    }

    getHeaders(extra = {}) {
        const headers = {
            "User-Agent": USER_AGENT,
            "Referer": `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            "Accept": "*/*",
            "Extra-Data": JSON.stringify({
                sid: this.sessionId || "",
                version: USER_VERSION,
                clientType: "weapp-miniprogram",
                client: "weapp",
                bizEnv: "wsc",
            }),
            ...extra,
        };
        if (this.cookie) headers.Cookie = this.cookie;
        return headers;
    }

    getBaseParams(params = {}) {
        return {
            app_id: MINI_APP_ID,
            kdt_id: this.kdtId,
            access_token: this.token,
            ...params,
        };
    }

    async request({ method = "GET", path: apiPath, params = {}, data = {}, skipToken = false }) {
        const options = {
            method,
            url: `${API_BASE}${apiPath.startsWith("/") ? apiPath : `/${apiPath}`}`,
            headers: this.getHeaders(method === "POST" ? { "Content-Type": "application/json" } : {}),
            timeout: 15000,
            validateStatus: () => true,
        };
        options.params = skipToken ? params : this.getBaseParams(params);
        if (method !== "GET") options.data = data;

        const { data: result, status, headers } = await axios.request(options);
        if (headers && headers["set-cookie"]) {
            this.cookie = headers["set-cookie"].map((item) => item.split(";")[0]).join("; ");
        }
        if (status !== 200) throw new Error(`HTTP ${status}: ${short(result)}`);
        if (!result || result.code !== 0) throw new Error(result?.msg || short(result));
        return result.data;
    }

    async loginByWxCode() {
        try {
            const code = await getWxCode(this.openid);
            const data = await this.request({
                method: "POST",
                path: "/wscshop/weapp/authorize.json",
                skipToken: true,
                data: {
                    appId: MINI_APP_ID,
                    clientBiz: CLIENT_BIZ,
                    code,
                },
            });
            this.applyToken(data);
            this.userInfo = data || {};
            if (!this.token) throw new Error(`登录响应未包含 accessToken: ${short(data)}`);
            this.saveCachedToken();
            this.log(
                `登录成功: ${data.nick_name || data.nickName || ""} ${maskPhone(data.mobile) || ""}`
            );
        } catch (e) {
            this.log(`登录失败: ${e.message || e}`);
        }
    }

    async checkToken() {
        try {
            await this.request({ path: "/wscump/integral/user_points.json" });
            return true;
        } catch (e) {
            return false;
        }
    }

    async showCheckinPage() {
        try {
            const data = await this.request({ path: "/wscump/checkin/show_checkin_page_v2.json" });
            this.checkinId = data?.checkinId || FALLBACK_CHECKIN_ID;
            this.isShow = !!data?.isShow;
            // 幂等预检：仅当服务端明确给出「今日已签」标记时才跳过提交
            this.signedBefore =
                data?.todayCheckin === true || data?.isCheckin === true || data?.hasCheckinToday === true;
            this.log(
                `签到活动: checkinId=${this.checkinId || "未获取"} isShow=${this.isShow}` +
                    (this.signedBefore ? " 今日已签" : "")
            );
        } catch (e) {
            $.log(`账号[${this.index}] 获取签到活动失败: ${e.message || e}`);
            if (isTokenError(e.message || e)) this.removeCachedToken();
            // 页面接口失败时仍尝试兜底 checkinId
            if (!this.checkinId) this.checkinId = FALLBACK_CHECKIN_ID;
        }
    }

    async doCheckin() {
        if (!this.checkinId) {
            this.log("未获取到 checkinId，跳过签到");
            return;
        }
        if (this.signedBefore) {
            this.log("✅ 今日已签到，跳过提交");
            return;
        }
        try {
            const data = await this.request({
                path: "/wscump/checkin/checkinV2.json",
                params: { checkinId: this.checkinId },
            });
            const awards = (data?.list || [])
                .map((item) => item?.infos?.title || item?.title)
                .filter(Boolean)
                .join(", ");
            this.log(`✅ 签到成功: ${data?.desc || ""}${awards ? ` ${awards}` : ""}`);
        } catch (e) {
            const message = String(e.message || e);
            if (isRepeatCheckin(message)) {
                this.log(`✅ 今日已签到（${message}）`);
                return;
            }
            // 有赞签到要求先授权手机号/注册会员：属账号未注册态，非签到失败
            if (/手机号未授权|未授权手机|请先授权|未注册|未绑定|绑定手机|会员/.test(message)) {
                this.log(`⚠️ 该微信号还没在骆驼(有赞)授权手机号/注册会员（${message}），先在小程序里授权登录一次再跑`);
                return;
            }
            this.log(`❌ 签到失败: ${message}`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }

    async getPoints() {
        try {
            const data = await this.request({ path: "/wscump/integral/user_points.json" });
            this.log(`当前积分: ${data?.current_points ?? data?.real_points ?? "未知"}`);
        } catch (e) {
            this.log(`查询积分失败: ${e.message || e}`);
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
