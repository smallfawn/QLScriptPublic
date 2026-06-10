/*
------------------------------------------
@Author: sm
@Date: 2026.06.09
@Description: 米萌生活 登录/查询/签到/观看视频得米豆
cron: 30 8 * * *
------------------------------------------
变量名：mimengshenghuo
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值

可选变量：
mimeng_video_times  限制每个账号本次最多执行几次视频任务，默认完成当天剩余次数
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("米萌生活");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CK_NAME = "mimengshenghuo";
const APP = { name: "米萌生活", appid: "wx9939a74ee8a8522a" };
const GQL_URL = "https://shd.luxingiot.com/graphql";
const WX_SERVER_URL = (process.env.wx_server_url || "http://192.168.31.196:8787").replace(/\/$/, "");
const WX_AUTH = process.env.wx_auth || "";
const DEFAULT_OPENID = process.env.wx_openid || "";
const TOKEN_CACHE_FILE = path.join(__dirname, "mimengshenghuo_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

function splitAccounts(value = "") {
    return String(value)
        .split(/\n|&/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function short(value, max = 260) {
    if (value === undefined || value === null) return "";
    const text = typeof value === "string" ? value : JSON.stringify(value);
    return text.length > max ? `${text.slice(0, max)}...` : text;
}

function maskToken(token = "") {
    const value = String(token || "");
    return value.length > 16 ? `${value.slice(0, 8)}***${value.slice(-6)}` : `${value.slice(0, 4)}***`;
}

function readTokenCache() {
    try {
        if (!fs.existsSync(TOKEN_CACHE_FILE)) return {};
        return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {};
    } catch {
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

async function getWxCode(openid) {
    if (!WX_AUTH) throw new Error("未配置 wx_auth");
    const { status, data } = await request({
        method: "POST",
        url: `${WX_SERVER_URL}/wx/code`,
        headers: { auth: WX_AUTH, "content-type": "application/json" },
        data: { appid: APP.appid, openid },
    });
    const code = data?.data?.code || data?.code;
    if (status !== 200 || !code) throw new Error(`获取code失败 HTTP ${status}: ${short(data)}`);
    return code;
}

function operationName(query) {
    const match = /(query|mutation)\s*?([\w\d\-_]+)?\s*?(\(.*?\))?\s*?\{/.exec(query);
    return match && match[2] ? match[2] : "";
}

class Mimeng {
    constructor(openid, index) {
        this.openid = openid;
        this.index = index;
        this.token = "";
        this.viewer = {};
        this.socialApp = {};
        this.checkIn = null;
        this.videoTask = null;
    }

    cacheKey() {
        return this.openid;
    }

    getCachedToken() {
        const cache = readTokenCache();
        return cache[this.cacheKey()]?.token || "";
    }

    saveCachedToken() {
        if (!this.token) return;
        const cache = readTokenCache();
        cache[this.cacheKey()] = {
            token: this.token,
            uid: this.viewer.uid || "",
            points: this.viewer.wallet?.points ?? "",
            updatedAt: new Date().toISOString(),
        };
        writeTokenCache(cache);
    }

    removeCachedToken() {
        const cache = readTokenCache();
        delete cache[this.cacheKey()];
        writeTokenCache(cache);
        this.token = "";
    }

    async gql(query, variables = {}, token = this.token, allowFail = false) {
        const body = { query, variables };
        const opName = operationName(query);
        if (opName) body.operationName = opName;

        const headers = {
            "content-type": "application/json",
            "x-provider-id": APP.appid,
            Referer: `https://servicewechat.com/${APP.appid}/21/page-frame.html`,
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await request({
            method: "POST",
            url: GQL_URL,
            headers,
            data: body,
        });

        const errors = res.data?.errors || [];
        if ((res.status !== 200 || errors.length) && !allowFail) {
            throw new Error(`GraphQL失败 HTTP ${res.status}: ${short(res.data)}`);
        }
        return res.data;
    }

    async login() {
        const cached = this.getCachedToken();
        if (cached) {
            this.token = cached;
            $.log(`账号[${this.index}] 使用缓存token: ${maskToken(this.token)}`);
            const ok = await this.checkToken();
            if (ok) return;
            $.log(`账号[${this.index}] 缓存token失效，重新登录`);
            this.removeCachedToken();
        }

        const code = await getWxCode(this.openid);
        const res = await this.gql(
            `mutation codeLogin($client_id: String! $code: String!) {
                login(client_id: $client_id, code: $code)
            }`,
            { client_id: APP.appid, code },
            "",
            true
        );
        const token = res?.data?.login || "";
        if (!token) throw new Error(`登录未返回token: ${short(res)}`);
        this.token = token;
        $.log(`账号[${this.index}] 登录成功: ${maskToken(this.token)}`);
    }

    async checkToken() {
        const res = await this.gql(
            `query ViewerBalance {
                viewer {
                    uid
                    wallet {
                        points
                    }
                }
            }`,
            {},
            this.token,
            true
        );
        return Boolean(res?.data?.viewer?.uid);
    }

    async queryHome() {
        const res = await this.gql(
            `query home($client_id: String!) {
                viewer {
                    uid
                    wallet {
                        points
                    }
                    todoActivityRecords {
                        id
                        progress
                        rewarded_at
                        completed_at
                        completed_at_today
                        completed_at_yesterday
                        activity {
                            auto_reward
                            button_action
                            full_rules {
                                reward_desc
                                reward_mode
                                reward_type
                                rule_desc
                            }
                            type
                            name
                            need_times
                            id
                            icon
                            description
                            cycle_quota
                            button_name
                            url
                        }
                    }
                }
                socialApp(client_id: $client_id) {
                    name
                    config
                }
            }`,
            { client_id: APP.appid }
        );

        this.viewer = res.data.viewer || {};
        this.socialApp = res.data.socialApp || {};
        const records = this.viewer.todoActivityRecords || [];
        this.checkIn = records.find((item) => item.activity?.name === "每日签到") || null;
        this.videoTask =
            records.find((item) => /视频/.test(item.activity?.name || "") || item.activity?.button_action === "seeVideo") || null;

        $.log(`查询：uid=${this.viewer.uid || "未知"} 米豆=${this.viewer.wallet?.points ?? "未知"} 小程序=${this.socialApp.name || APP.name}`);
        if (this.checkIn) {
            $.log(
                `签到任务：id=${this.checkIn.activity.id} 今日${this.checkIn.completed_at_today ? "已完成" : "未完成"} progress=${this.checkIn.progress}/${this.checkIn.activity.cycle_quota}`
            );
        } else {
            $.log("签到任务：未找到");
        }
        if (this.videoTask) {
            $.log(
                `视频任务：id=${this.videoTask.activity.id} 今日${this.videoTask.completed_at_today ? "已完成" : "未完成"} progress=${this.videoTask.progress}/${this.videoTask.activity.cycle_quota}`
            );
        } else {
            $.log("视频任务：未找到");
        }
    }

    async pointsRecords() {
        const res = await this.gql(
            `query records {
                viewer {
                    pointsRecords(page: 1) {
                        data {
                            amount
                            balance
                            action
                            created_at
                            in_out
                            reward_type
                        }
                    }
                }
            }`,
            {},
            this.token,
            true
        );
        const records = res?.data?.viewer?.pointsRecords?.data || [];
        if (records.length) {
            const text = records
                .slice(0, 5)
                .map((item) => `${item.created_at} ${item.action} ${item.amount} 余额=${item.balance}`)
                .join(" | ");
            $.log(`米豆明细：${text}`);
        }
    }

    async activityPush(activityId, label) {
        const res = await this.gql(
            `mutation activity($activity_id: Int!) {
                activityPush(id: $activity_id) {
                    code
                    message
                    reward_log {
                        action
                        reward_type
                        amount
                        balance
                    }
                }
            }`,
            { activity_id: Number(activityId) },
            this.token,
            true
        );
        const result = res?.data?.activityPush;
        if (!result) return `${label}失败: ${short(res)}`;
        if (Number(result.code) === 0) {
            const log = result.reward_log || {};
            return `${label}成功：${log.action || label} +${log.amount ?? 0}米豆，余额=${log.balance ?? "未知"}`;
        }
        return `${label}失败：${result.message || short(result)}`;
    }

    async doSign() {
        if (!this.checkIn) return "未找到签到任务";
        if (this.checkIn.completed_at_today) return "今日已签到";
        return this.activityPush(this.checkIn.activity.id, "签到");
    }

    async doVideo() {
        if (!this.videoTask) return ["未找到视频任务"];
        const total = Number(this.videoTask.activity?.cycle_quota || 0);
        const progress = Number(this.videoTask.progress || 0);
        const remaining = Math.max(0, total - progress);
        if (!remaining) return ["视频任务今日已完成"];

        const limit = Number(process.env.mimeng_video_times || remaining);
        const times = Math.max(0, Math.min(remaining, Number.isFinite(limit) ? limit : remaining));
        const results = [];
        for (let i = 0; i < times; i++) {
            results.push(await this.activityPush(this.videoTask.activity.id, `视频任务[${i + 1}/${times}]`));
            await $.wait(1200);
        }
        return results;
    }

    async run() {
        await this.login();
        await this.queryHome();
        $.log(`签到：${await this.doSign()}`);
        const videos = await this.doVideo();
        for (const result of videos) $.log(`观看视频：${result}`);
        await this.queryHome();
        await this.pointsRecords();
        this.saveCachedToken();
    }
}

async function runAccount(openid, index) {
    $.log(`\n========== ${APP.name} 账号[${index}] ${openid} ==========`);
    const runner = new Mimeng(openid, index);
    try {
        await runner.run();
    } catch (e) {
        $.log(`账号[${index}] 执行失败：${e.message || e}`);
    }
}

(async () => {
    const accounts = splitAccounts(process.env[CK_NAME] || DEFAULT_OPENID || "");
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
