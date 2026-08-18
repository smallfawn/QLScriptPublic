/*
------------------------------------------
@Description: iyouke / dtminds 平台通用 - 微信小程序静默登录 + 每日签到
              一份脚本覆盖同平台的所有店铺小程序（KSOEUR、交个朋友、林痣晴Min…）
cron: 39 8 * * *
------------------------------------------
变量名：iyouke
变量值：openid#appid[#备注]，一行一个店铺，多行或 & 分隔
       openid  = wx_server 里的账号标识（同一个 openid 能给所有 appid 取码）
       appid   = 该店铺小程序的 appid（同时作为必需的 appId 请求头）
       例：owNAX6vp****#wx00796053aa93af0c#KSOEUR

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（host smp-api.iyouke.com，所有路径都带 /dtapi 前缀）：

登录  POST /dtapi/appLogin  {appType:1, principal:<wx code>}
        appType 1 = MINI（解包 AppType 枚举：MINI:1, MP:2…；2 是公众号 H5，别用）
        -> {access_token, userId, openId, unionid, expires_in}
        鉴权头 Authorization: "bearer"+access_token —— **中间没有空格**，
        解包里就是 "bearer".concat(access_token)，写成 "bearer xxx" 会 401
        请求头 appId=<店铺 appid> 是**必需**的（不带回 {error:-99,"参数异常【1】"}）；
        version/envVersion 实测可省（它们来自小程序 ext 配置，只用于灰度/埋点）

开关  GET  /dtapi/pointsSign/config/queryShopSignEnable   -> data 布尔，该店有没有开签到
状态  GET  /dtapi/pointsSign/user/pointsInfo/query
        -> data.{pointsNums 积分, seriesDays 连签天数, signTodayResult 今天签没签}
        signTodayResult 就是幂等判据，够用了，不用先去撞签到接口
日历  GET  /dtapi/pointsSign/user/sign/list?v4Flag=true
        -> data[] 每天一条 {id, dateStr:"YYYY-MM-DD", daySignStatus, isToday}
        daySignStatus 枚举(解包)：1 missed 2 signed 3 waiting 4 cycle 5 forward
                                 6 couldSupply 7 supply
签到  GET  /dtapi/pointsSign/user/sign?date=YYYY%2FMM%2FDD
        **日期是斜杠不是横杠**：日历给的是 2026-08-18，签到要 2026/08/18(%2F)，
        发横杠会被 Spring 挡在参数绑定层，回一个 message 为空的 400，极难看出原因
        -> {success:true, data:{signReward, extraSignReward}}

信封：成功 {error:0, data:…, success:true}；失败 {error:-99, errorMsg:"…", success:false}
不做：/pointsSign/user/sign/supply 之类的补签（要花 supplySignNeedPoints 积分）、
      积分商城兑换、签到抽奖 —— 只做每天一次的幂等签到。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("iyouke平台签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "iyouke";
const BASE = "https://smp-api.iyouke.com/dtapi";
const TOKEN_CACHE_FILE = path.join(__dirname, "iyouke_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x28003036) MiniProgramEnv/android";

const EP_LOGIN = "/appLogin";
const EP_SIGN_ENABLE = "/pointsSign/config/queryShopSignEnable";
const EP_POINTS = "/pointsSign/user/pointsInfo/query";
const EP_SIGN_LIST = "/pointsSign/user/sign/list";
const EP_SIGN = "/pointsSign/user/sign";

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
    const [openid, appid, remark] = String(raw).split("#").map((s) => (s || "").trim());
    return { openid, appid, remark: remark || "" };
}

function short(v, n = 200) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}

const isOk = (res) => res && !res.__unauthorized && res.success !== false && Number(res.error || 0) === 0;
const msgOf = (res) => res?.errorMsg || res?.error_msg || res?.message || short(res);

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.unbound = false;
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

    async request(apiPath, { method = "GET", body = null, query = null, withAuth = true, rawQuery = "" } = {}) {
        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
            "User-Agent": USER_AGENT,
            Referer: `https://servicewechat.com/${this.account.appid}/0/page-frame.html`,
            xweb_xhr: "1",
            // 这一项是必需的，服务端靠它认店铺
            appId: this.account.appid,
        };
        if (withAuth && this.token) headers.Authorization = this.token;
        // date 得保持 %2F 原样，不能被再编码一次，所以留了 rawQuery 这条路
        const qs = rawQuery
            ? rawQuery
            : query
                ? Object.entries(query).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")
                : "";
        const res = await axios.request({
            method,
            url: `${BASE}${apiPath}${qs ? `?${qs}` : ""}`,
            data: method === "GET" ? undefined : body || {},
            headers,
            timeout: 20000,
            validateStatus: () => true,
        });
        if (res.status !== 200) {
            // 401 不当异常抛：它的常态是"这个微信号在该店铺还没绑定会员，只拿到匿名 token"
            if (res.status === 401) return { __unauthorized: true, errorMsg: short(res.data, 80) };
            throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
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
        const res = await this.request(EP_LOGIN, {
            method: "POST",
            body: { appType: 1, principal: code },
            withAuth: false,
        });
        if (!isOk(res) || !res.access_token) throw new Error(`登录失败: ${msgOf(res)}`);
        this.token = `bearer${res.access_token}`;
        // 解包里 loginSuccess 就是按 userId 有无写 hadBindUser 的：没有 userId = 这个号
        // 在该店铺还没绑定会员，发下来的只是匿名 token，签到类接口会一律 401
        this.unbound = !res.userId;
        const cache = readCache();
        cache[this.cacheKey] = { token: this.token, userId: res.userId, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${res.userId ? ` (userId ${res.userId})` : "（该店铺未绑定会员）"}`);
    }

    /** 读积分/连签/今日是否已签；读不到返回 null（用于判断缓存 token 还活着没） */
    async points(needLog = true) {
        const res = await this.request(EP_POINTS);
        if (!isOk(res)) {
            if (needLog) this.log(`读取积分失败: ${msgOf(res)}`);
            return null;
        }
        const d = res.data || {};
        if (needLog) {
            this.log(`积分 ${d.pointsNums ?? "-"}，连签 ${d.seriesDays ?? "-"} 天，今日${d.signTodayResult ? "已签" : "未签"}`);
        }
        return d;
    }

    async ensureLogin() {
        const cached = readCache()[this.cacheKey] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            if ((await this.points(false)) !== null) {
                this.log("使用缓存token");
                return;
            }
            this.log("缓存token失效，重新登录");
            this.token = "";
        }
        if (!this.token) await this.login();
    }

    /** 今天那一格：日期字符串直接用服务端给的，不本地拼日期（时区/月末都不会错） */
    async todayCell() {
        const res = await this.request(EP_SIGN_LIST, { query: { v4Flag: "true" } });
        if (!isOk(res)) {
            this.log(`读取签到日历失败: ${msgOf(res)}`);
            return null;
        }
        const rows = Array.isArray(res.data) ? res.data : [];
        const cell = rows.find((r) => r && r.isToday);
        if (!cell || !cell.dateStr) {
            this.log(`签到日历里没有今天（共 ${rows.length} 条），不本地造日期`);
            return null;
        }
        return cell;
    }

    async sign() {
        if (this.unbound) {
            this.log("⚠️ 该微信号还没在这个店铺注册/绑定会员（登录只发到匿名 token，签到接口一律 401），先在小程序里注册一次再跑");
            return;
        }
        const enable = await this.request(EP_SIGN_ENABLE);
        if (isOk(enable) && enable.data === false) {
            this.log("该店铺没开每日签到，跳过");
            return;
        }
        const info = await this.points();
        if (info && info.signTodayResult) {
            this.log("✅ 今日已签到");
            return;
        }
        const cell = await this.todayCell();
        if (!cell) return;
        if (Number(cell.daySignStatus) === 2) {
            this.log("✅ 今日已签到（日历状态 signed）");
            return;
        }
        // 签到接口只吃斜杠日期
        const dateParam = String(cell.dateStr).replace(/-/g, "%2F");
        const res = await this.request(EP_SIGN, { rawQuery: `date=${dateParam}` });
        if (isOk(res)) {
            const d = res.data || {};
            const gain = Number(d.signReward || 0) + Number(d.extraSignReward || 0);
            this.log(`✅ 签到成功${gain ? `，+${gain} 积分` : ""}`);
            await this.points();
            return;
        }
        this.log(`❌ 签到失败: ${msgOf(res)}`);
    }

    async run() {
        if (!this.account.openid || !this.account.appid) {
            this.log("跳过：变量值要写成 openid#appid[#备注]");
            return;
        }
        try {
            await this.ensureLogin();
            await this.sign();
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
