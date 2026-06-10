/*
------------------------------------------
@Author: sm
@Date: 2026.06.09
@Description: 优点云创 每日签到/看广告视频/信息查询
cron: 24 8 * * *
------------------------------------------
变量名：ydyc
变量值：wx_server 里的 openid，多账号用 & 或换行

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const axios = require("axios");

const $ = new Env("优点云创");

const CK_NAME = "ydyc";
const APP = { name: "优点云创", appid: "wx96eb3beaea480465", version: 1 };
const WX_SERVER_URL = (process.env.wx_server_url || "http://192.168.31.196:8787").replace(/\/$/, "");
const WX_AUTH = process.env.wx_auth || "";
const API_URL = "https://youdianyunchuan.weimbo.com/api/index.php?ackey=GZYTAPPLET";
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

function splitAccounts(value = "") {
    return String(value)
        .split(/\n|&/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function short(value, max = 500) {
    if (value === undefined || value === null) return "";
    const text = typeof value === "string" ? value : JSON.stringify(value);
    return text.length > max ? `${text.slice(0, max)}...` : text;
}

function parseAccount(raw = "") {
    const text = String(raw || "").trim();
    if (!text) return {};
    if (text.startsWith("{")) {
        const data = JSON.parse(text);
        return { openid: data.openid || data.openId || "", remark: data.remark || data.name || "" };
    }
    const [openid, remark] = text.split("#").map((item) => item.trim());
    return { openid, remark };
}

function parseProgress(title = "") {
    const match = String(title || "").match(/\((\d+)\s*\/\s*(\d+)\)/);
    if (!match) return null;
    return { done: Number(match[1]), total: Number(match[2]) };
}

function findTask(info = {}, keyword = "") {
    const list = Array.isArray(info.adv_arr) ? info.adv_arr : [];
    return list.find((item) => String(item.title || "").includes(keyword)) || null;
}

async function request(options) {
    const res = await axios.request({
        timeout: 25000,
        validateStatus: () => true,
        ...options,
        headers: {
            "User-Agent": USER_AGENT,
            Accept: "application/json, text/plain, */*",
            "content-type": "application/json",
            Referer: `https://servicewechat.com/${APP.appid}/${APP.version}/page-frame.html`,
            ...(options.headers || {}),
        },
    });
    return { status: res.status, data: res.data, headers: res.headers || {} };
}

async function getWxCode(openid) {
    if (!WX_AUTH) throw new Error("未配置 wx_auth，无法从 wx_server 获取 code");
    const { status, data } = await request({
        method: "POST",
        url: `${WX_SERVER_URL}/wx/code`,
        headers: { auth: WX_AUTH },
        data: { appid: APP.appid, openid },
    });
    const code = data?.data?.code || data?.code;
    if (status !== 200 || !code) throw new Error(`获取 code 失败 HTTP ${status}: ${short(data)}`);
    return code;
}

class YouDianYunChuang {
    constructor(rawAccount, index) {
        this.index = index;
        this.account = parseAccount(rawAccount);
        this.session = "";
        this.openid = "";
    }

    log(message) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${message}`);
    }

    async api(data = {}) {
        const { status, data: result } = await request({
            method: "POST",
            url: API_URL,
            headers: { "3rdSession": this.session || "" },
            data,
        });
        if (status !== 200) throw new Error(`${data.action || "接口"} HTTP ${status}: ${short(result)}`);
        return result;
    }

    async call(data = {}) {
        const result = await this.api(data);
        if (!result?.Status) throw new Error(`${data.action || "接口"} 失败: ${short(result?.Data || result)}`);
        return result.Data;
    }

    async login() {
        if (!this.account.openid) throw new Error("账号格式错误，请配置 wx_server 里的 openid");
        const code = await getWxCode(this.account.openid);
        const data = await this.call({ action: "WxLogin", code });
        this.session = data.r3dkey || "";
        this.openid = data.openid || "";
        if (!this.session) throw new Error(`登录响应缺少 r3dkey: ${short(data)}`);
        this.log(`登录成功 openid=${this.openid || "未知"}`);
    }

    async queryUser() {
        const data = await this.call({ action: "userInfoData" });
        const user = data.user || {};
        const money = data.u_money || {};
        this.log(
            `用户信息: ${user.id || ""} ${user.name || ""}，积分: ${money.jifen ?? 0}，金币: ${money.jinbi ?? 0}，红包: ${
                money.hongbao ?? 0
            }，佣金: ${money.yongjin ?? 0}，优惠券: ${money.yhquan ?? 0}`
        );
        return data;
    }

    async querySignInfo() {
        const data = await this.call({ action: "getIntegralInfo", type: "sign" });
        const signTask = Array.isArray(data.sign_arr) ? data.sign_arr.map((item) => `${item.status === "1" ? "已签" : "未签"}:${item.score}`).join(", ") : "";
        this.log(`签到信息: 积分=${data.user_jf ?? 0}，${data.qiands || ""}${signTask ? `，签到档位: ${signTask}` : ""}`);
        return data;
    }

    async queryIntegralInfo(type = "") {
        const data = await this.call({ action: "getIntegralInfo2", type });
        const signTask = findTask(data, "每日签到");
        const adTask = findTask(data, "看广告视频");
        this.log(
            `任务进度: 积分=${data.user_jf ?? 0}，${signTask?.title || "每日签到 -"}，${adTask?.title || "看广告视频 -"}`
        );
        return data;
    }

    async doSignOnce() {
        const result = await this.api({ action: "userQiandao" });
        if (result?.Status) {
            const data = result.Data || {};
            this.log(`签到结果: 成功，获得 ${data.add_jf ?? "-"} 积分，当前积分 ${data.user_jf ?? "-"}`);
            return true;
        }
        this.log(`签到结果: ${short(result?.Data || result)}`);
        return false;
    }

    async doAdRewardOnce() {
        const result = await this.api({ action: "IntegralGiveReward" });
        if (result?.Status) {
            this.log(`广告视频结果: ${short(result.Data)}`);
            return true;
        }
        this.log(`广告视频结果: ${short(result?.Data || result)}`);
        return false;
    }

    async runSign() {
        const info = await this.queryIntegralInfo();
        const task = findTask(info, "每日签到");
        const progress = parseProgress(task?.title);
        if (progress && progress.done >= progress.total) return this.log("签到任务: 今日次数已完成");

        await this.querySignInfo();
        await this.doSignOnce();
    }

    async runAdRewards() {
        for (let i = 0; i < 3; i++) {
            const info = await this.queryIntegralInfo(i === 0 ? "" : "jifen");
            const task = findTask(info, "看广告视频");
            const progress = parseProgress(task?.title);
            if (progress && progress.done >= progress.total) {
                this.log("广告视频任务: 今日次数已完成");
                return;
            }
            const ok = await this.doAdRewardOnce();
            if (!ok) return;
            await $.wait(1000, 2000);
        }
    }

    async run() {
        try {
            this.log(`开始执行 ${APP.name}`);
            await this.login();
            await this.queryUser();
            await this.runSign();
            await this.runAdRewards();
            await this.queryIntegralInfo("jifen");
            await this.queryUser();
        } catch (e) {
            this.log(`执行失败: ${e.message || e}`);
        }
    }
}

async function main() {
    $.checkEnv(CK_NAME);
    if (!$.userCount) {
        $.log(`未找到变量 ${CK_NAME}`);
        return;
    }
    for (let i = 0; i < $.userList.length; i++) {
        const task = new YouDianYunChuang($.userList[i], i + 1);
        await task.run();
        if (i < $.userList.length - 1) await $.wait(1500, 3000);
    }
}

main()
    .catch((e) => $.log(`脚本异常: ${e.message || e}`))
    .finally(() => $.done());
