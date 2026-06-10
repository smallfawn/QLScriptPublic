/*
------------------------------------------
@Author: sm
@Date: 2026.06.09
@Description: 杰士邦会员中心 登录/查询/签到
cron: 22 8 * * *
------------------------------------------
变量名：jsbhuiyuan
变量值：wx_server里的openid/账号标识，多账号用 & 或换行
依赖变量：wx_server_url、wx_auth
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("杰士邦会员中心");
const axios = require("axios");

const CK_NAME = "jsbhuiyuan";
const APP = {
    name: "杰士邦会员中心",
    appid: "wx5966681b4a895dee",
    shopId: "467028",
    signActivityId: "156947",
};
const WX_SERVER_URL = (process.env.wx_server_url || "http://192.168.31.196:8787").replace(/\/$/, "");
const WX_AUTH = process.env.wx_auth || "";
const DEFAULT_OPENID = process.env.wx_openid || "";
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

function short(value, max = 220) {
    if (value === undefined || value === null) return "";
    const text = typeof value === "string" ? value : JSON.stringify(value);
    return text.length > max ? `${text.slice(0, max)}...` : text;
}

function formatDate(date = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

async function request(options) {
    const res = await axios.request({
        timeout: 20000,
        validateStatus: () => true,
        ...options,
        headers: {
            "User-Agent": USER_AGENT,
            Accept: "application/json, text/plain, */*",
            ...(options.headers || {}),
        },
    });
    return { status: res.status, headers: res.headers || {}, data: res.data };
}

async function getWxCode(appid, openid) {
    if (!WX_AUTH) throw new Error("未配置 wx_auth");
    const { status, data } = await request({
        method: "POST",
        url: `${WX_SERVER_URL}/wx/code`,
        headers: { auth: WX_AUTH, "content-type": "application/json" },
        data: { appid, openid },
    });
    const code = data?.code || data?.data?.code || data?.phoneCode || data?.data?.phoneCode;
    if (status !== 200 || !code) throw new Error(`获取code失败 HTTP ${status}: ${short(data)}`);
    return code;
}

class JsbHuiyuan {
    constructor(openid) {
        this.openid = openid;
        this.base = "https://api.vshop.hchiv.cn/jfmb";
        this.global = {
            appId: APP.appid,
            shopId: APP.shopId,
            openId: "",
            shopNick: "",
            mainShopNick: "",
            unionid: "",
            phoneNumber: "",
            jsession: "",
            clientToken: "",
            securePlatId: "",
            sourceShopId: "",
        };
    }

    buildData(data = {}, reqType = 2) {
        const timestamp = Date.now();
        const common = {
            appId: this.global.appId,
            openId: this.global.openId || this.openid,
            shopNick: this.global.shopNick || "",
            timestamp,
            interfaceSource: 0,
        };
        return reqType === 2 ? { ...common, ...data } : { ...data };
    }

    async api(path, data = {}, { reqType = 2, raw = false } = {}) {
        const headers = {
            "content-type": "application/json",
            appenv: "test",
        };
        if (this.global.jsession) headers.cookie = this.global.jsession;
        if (this.global.clientToken) headers.Authorization = `Bearer ${this.global.clientToken}`;
        const body = this.buildData(typeof data === "string" ? JSON.parse(data) : data, reqType);
        const timestamp = Date.now();
        const query =
            reqType === 2
                ? `?sideType=3&mob=${encodeURIComponent(this.global.phoneNumber || "")}&appId=${encodeURIComponent(this.global.appId)}&shopNick=${encodeURIComponent(this.global.mainShopNick || this.global.appId)}&timestamp=${timestamp}${this.global.guideNo ? `&guideNo=${encodeURIComponent(this.global.guideNo)}` : ""}${this.global.securePlatId ? `&securePlatId=${encodeURIComponent(this.global.securePlatId)}` : ""}${this.global.sourceShopId ? `&sourceShopId=${encodeURIComponent(this.global.sourceShopId)}` : ""}`
                : "";
        const res = await request({
            method: "POST",
            url: `${this.base}${path}${query}`,
            headers,
            data: body,
        });
        const setCookie = res.headers["set-cookie"];
        if (Array.isArray(setCookie) && setCookie[0]) this.global.jsession = setCookie[0].split(";")[0];
        const token = res.data?.data?.clientToken || res.data?.data?.data?.clientToken;
        if (token) this.global.clientToken = token;
        const securePlatId = res.data?.data?.data?.securePlatId || res.data?.securePlatId;
        if (securePlatId) this.global.securePlatId = securePlatId;
        return raw ? res : res.data;
    }

    async login() {
        const code = await getWxCode(APP.appid, this.openid);
        const auth = await this.api("/cloud/member/wechatlogin/authLoginApplet", {
            wxInfo: code,
            extend: "{}",
            sessionIdForWxShop: "",
        });
        const data = auth?.data || {};
        this.global.openId = data.openId || data.openid || this.openid;
        this.global.unionid = data.unionId || data.unionid || "";
        return `authLoginApplet=${short(auth)}`;
    }

    async query() {
        const shop = await this.api("/cloud/member/shop/getShopInfo", {});
        const shopData = shop?.data?.data || shop?.data || {};
        if (shopData.sellerId) this.global.shopId = String(shopData.sellerId);
        if (shopData.mainShopNick) this.global.mainShopNick = shopData.mainShopNick;
        if (shopData.shopNick) this.global.shopNick = shopData.shopNick;
        const card = await this.api("/api/customize/get-card-info.do", {});
        const client = await this.api("/cloud/member/tblogin/getClientInfo", {});
        const d = card?.data || {};
        const c = client?.data || {};
        return `用户=${c.client_name || c.user_mob || d.name || "未知"} 积分=${d.residualIntegral ?? c.residualIntegral ?? "未知"} 等级=${d.currLevelName || c.member_level_str || ""} shop=${shopData.shopTitle || shopData.title || short(shopData || shop, 80)}`;
    }

    async sign() {
        const activityId = APP.signActivityId;
        const info = await this.api("/cloud/activity/sign/load-sign", { activityId });
        const infoBody = info?.data || {};
        const signInfo = infoBody?.data || {};
        if (Number(infoBody.code) !== 200) return `签到活动查询失败 activityId=${activityId}: ${short(info)}`;

        const ruleRes = await this.api("/cloud/activity/sign/getSignPrizeRules", { activityId });
        const rules = Array.isArray(ruleRes?.data?.data)
            ? ruleRes.data.data
                  .filter((item) => item && (item.ruleName || item.prizeName))
                  .map((item) => `${item.ruleName || ""}${item.prizeName ? `-${item.prizeName}` : ""}`)
                  .join("，")
            : "";

        if (signInfo.signed) {
            return `今日已签到 activityId=${activityId} 连续=${signInfo.continuousSignNum ?? 0} 累计=${signInfo.totalSignNum ?? 0}${rules ? ` 规则=${rules}` : ""}`;
        }

        const sign = await this.api("/cloud/activity/sign/add-sign", { activityId });
        const body = sign?.data || {};
        const data = body?.data || {};
        if (Number(body.code) === 200) {
            const prizes = Array.isArray(data.prizeList) && data.prizeList.length ? ` 奖励=${data.prizeList.map((x) => x.prizeName || x.name || short(x, 40)).join("，")}` : "";
            return `签到成功 activityId=${activityId} +${data.integralCount ?? "未知"}积分 连续=${data.continuousSignNum ?? 0} 累计=${data.totalSignNum ?? 0}${prizes}`;
        }
        if (/已签|重复/.test(String(body.message || sign?.message || ""))) {
            return `今日已签到 activityId=${activityId}: ${short(sign)}`;
        }
        return `签到失败 activityId=${activityId}: ${short(sign)}`;
    }
}

async function runAccount(openid, index) {
    $.log(`\n========== ${APP.name} 账号[${index}] ${openid} ==========`);
    const runner = new JsbHuiyuan(openid);
    try {
        $.log(`登录：${await runner.login()}`);
        $.log(`查询：${await runner.query()}`);
        $.log(`签到：${await runner.sign()}`);
    } catch (e) {
        $.log(`执行失败：${e.message || e}`);
    }
}

(async () => {
    const accounts = (process.env[CK_NAME] || DEFAULT_OPENID || "")
        .split((process.env[CK_NAME] || "").includes("\n") ? "\n" : "&")
        .map((x) => x.trim())
        .filter(Boolean);
    if (!accounts.length) {
        $.log(`未配置 ${CK_NAME}`);
        await $.done();
        return;
    }
    $.log(`共找到${accounts.length}个账号`);
    for (let i = 0; i < accounts.length; i++) {
        await runAccount(accounts[i], i + 1);
        await $.wait(800);
    }
    await $.done();
})().catch(async (e) => {
    $.log(`脚本异常：${e.stack || e.message || e}`);
    await $.done();
});
