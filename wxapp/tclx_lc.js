/*
------------------------------------------
@Author: sm
@Date: 2026.06.09
@Description: 同程旅行里程签到 登录/查询/签到
cron: 21 8 * * *
------------------------------------------
变量名：tclx_lc
变量值：wx_server里的openid/账号标识，多账号用 & 或换行
依赖变量：wx_server_url、wx_auth
------------------------------------------
接口契约（wx.17u.cn / tcmobileapi.17usoft.com）：
  登录 POST /wechatappapi/wxUser/login {code, scene:1001}
       -> content.{openId, memberId, sectoken}；sectoken 用于后续鉴权头
  日历 POST /wxmpsign/sign/signCalendar {beginDate, endDate}
       -> data.{canSign, today, todaySigned, dateInfo[{date, mileage, isSigned}]}
  状态 POST /wxmpsign/sign/getSignInfo {}
       -> data.{todaySigned, canSign, signMileage, signDays,
                periodContinuedSignDays, tomorrowMileage}
  签到 POST /wxmpsign/sign/saveSignInfo {}   -> code==200
  里程 POST /mallgatewayapi/userApi/mileages/remain {osType:2}
       -> data.{remainMileageTitle(里程余额), memberGrade, exchangeRate}
说明：签到成功后小程序内签到按钮会切换为「做任务，赚里程积分」，该任务中心页
  位于分包 page/AC/sign/ 内。smallcat 的 /wx/downloadurl 仅返回主包（文档参数
  只有 openid/appid/version_type，无分包选项），分包 js 解包后为空壳，任务中心
  的接口无法从源码还原；不做接口盲猜。故本脚本只完成每日签到（里程由签到直接
  发放：今日 signMileage，次日 tomorrowMileage），任务中心请在小程序内手动完成。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("同程旅行里程签到");
const axios = require("axios");

const CK_NAME = "tclx_lc";
const APP = { name: "同程旅行里程签到", appid: "wx336dcaf6a1ecf632" };
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

function getFiveDays() {
    const days = [];
    for (let i = -2; i <= 2; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        days.push(formatDate(d));
    }
    return days;
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
    const headers = { auth: WX_AUTH, "content-type": "application/json" };
    let lastMsg = "";
    for (let attempt = 0; attempt < 4; attempt++) {
        if (attempt) {
            // smallcat 偶发 "获取失败"(会话抖动)，刷新会话后间隔重试
            try {
                await request({ method: "POST", url: `${WX_SERVER_URL}/wx/refresh`, headers, data: { appid, openid } });
            } catch (e) {
                // 刷新失败不阻断，继续重试取 code
            }
            await new Promise((r) => setTimeout(r, 3000));
        }
        const { status, data } = await request({
            method: "POST",
            url: `${WX_SERVER_URL}/wx/code`,
            headers,
            data: { appid, openid },
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

class Tongcheng {
    constructor(openid) {
        this.openid = openid;
        this.loginInfo = {};
    }

    headers(extra = {}) {
        const sectoken = this.loginInfo.sectoken || "";
        return {
            apmat: `${this.loginInfo.openId || this.openid}|${new Date().toISOString().slice(0, 16).replace(/[-T:]/g, "")}|${Math.floor(Math.random() * 1000000)}`,
            TCSecTk: sectoken,
            TCxcxVersion: "10.8.7",
            platform: "WX_MP",
            osType: "2",
            secToken: sectoken,
            "TC-MALL-PLATFORM-CODE": "WX_MP",
            "TC-MALL-USER-TOKEN": sectoken,
            ...extra,
        };
    }

    async login() {
        const code = await getWxCode(APP.appid, this.openid);
        const res = await request({
            method: "POST",
            url: "https://wx.17u.cn/wechatappapi/wxUser/login",
            headers: { "content-type": "application/json" },
            data: { code, scene: 1001 },
        });
        const content = res.data?.content || res.data?.data || {};
        if (res.status !== 200 || !content.openId) throw new Error(`登录失败 HTTP ${res.status}: ${short(res.data)}`);
        this.loginInfo = {
            openId: content.openId,
            encryOpenId: content.encryOpenId,
            aesOpenId: content.aesOpenId,
            unionId: content.unionId,
            aesUnionId: content.aesUnionId,
            memberId: content.memberId,
            sectoken: content.sectoken,
        };
        return `openId=${content.openId} memberId=${content.memberId || ""}`;
    }

    async query() {
        const mileage = await request({
            method: "POST",
            url: "https://tcmobileapi.17usoft.com/mallgatewayapi/userApi/mileages/remain",
            headers: this.headers({
                "content-type": "application/json",
                "TC-MALL-DEPT-CODE": "iH3PGf9ZucSMMEYi4keylA==",
                "TC-MALL-CLIENT": "API_CLIENT",
                "TC-MALL-OS-TYPE": "Android",
            }),
            data: { osType: 2 },
        });
        const d = mileage.data?.data || {};
        const remain = d.remainMileageTitle;
        if (remain === undefined) return `里程查询失败: ${short(mileage.data, 120)}`;
        return `里程余额=${remain} 会员等级=${d.memberGrade || "未知"} 兑换比例=${d.exchangeRate ?? "未知"}`;
    }

    async sign() {
        const days = getFiveDays();
        const calendar = await request({
            method: "POST",
            url: "https://wx.17u.cn/wxmpsign/sign/signCalendar",
            headers: this.headers({ "content-type": "application/json" }),
            data: { beginDate: days[0], endDate: days[4] },
        });
        const signInfo = await request({
            method: "POST",
            url: "https://wx.17u.cn/wxmpsign/sign/getSignInfo",
            headers: this.headers({ "content-type": "application/json" }),
            data: {},
        });
        const info = signInfo.data?.data || {};
        const cal = calendar.data?.data || {};
        const today = cal.today || formatDate();
        const todayInfo = (cal.dateInfo || []).find((x) => x.date === today) || {};
        const streak = info.periodContinuedSignDays ?? cal.periodContinuedSignDays ?? "未知";

        // 幂等预检：今日已签则不再提交
        if (info.todaySigned || cal.todaySigned || todayInfo.isSigned) {
            return `今日已签到，连续=${streak}天 今日里程=${todayInfo.mileage ?? info.signMileage ?? "未知"}`;
        }
        if (info.canSign === 0 && cal.canSign === 0) {
            return `当前不可签到(canSign=0)，请在小程序内查看活动状态`;
        }

        const sign = await request({
            method: "POST",
            url: "https://wx.17u.cn/wxmpsign/sign/saveSignInfo",
            headers: this.headers({ "content-type": "application/json" }),
            data: {},
        });
        if (sign.data?.code !== 200) {
            return `签到失败: ${sign.data?.msg || short(sign.data, 160)}`;
        }
        // 复核签到结果（服务端为准），并提示任务中心需手动完成
        const after = await request({
            method: "POST",
            url: "https://wx.17u.cn/wxmpsign/sign/getSignInfo",
            headers: this.headers({ "content-type": "application/json" }),
            data: {},
        });
        const a = after.data?.data || {};
        if (!a.todaySigned) return `签到接口返回成功但状态未更新: ${short(sign.data, 160)}`;
        return (
            `签到成功，获得里程=${todayInfo.mileage ?? info.signMileage ?? "未知"} ` +
            `连续=${a.periodContinuedSignDays ?? streak}天 明日里程=${a.tomorrowMileage ?? "未知"}` +
            `（签到后按钮切换的「做任务，赚里程积分」任务中心在分包内，接口无法还原，请在小程序内手动完成）`
        );
    }
}

async function runAccount(openid, index) {
    $.log(`\n========== ${APP.name} 账号[${index}] ${openid} ==========`);
    const runner = new Tongcheng(openid);
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
