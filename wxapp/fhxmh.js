/*
------------------------------------------
@Author: sm
@Date: 2026.06.09
@Description: 飞鹤星妈会 登录/查询/签到
cron: 20 8 * * *
------------------------------------------
变量名：fhxmh
变量值：wx_server里的openid/账号标识，多账号用 & 或换行
依赖变量：wx_server_url、wx_auth
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("飞鹤星妈会");
const axios = require("axios");

const CK_NAME = "fhxmh";
const APP = { name: "飞鹤星妈会", appid: "wxc83b55d61c7fc51d" };
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

function getByPath(obj, path) {
    return String(path)
        .split(".")
        .reduce((cur, key) => (cur && cur[key] !== undefined ? cur[key] : undefined), obj);
}

function findFirst(obj, predicate, depth = 0) {
    if (!obj || depth > 8) return null;
    if (Array.isArray(obj)) {
        for (const item of obj) {
            const found = findFirst(item, predicate, depth + 1);
            if (found) return found;
        }
        return null;
    }
    if (typeof obj === "object") {
        if (predicate(obj)) return obj;
        for (const value of Object.values(obj)) {
            const found = findFirst(value, predicate, depth + 1);
            if (found) return found;
        }
    }
    return null;
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

class FeiheMom {
    constructor(openid) {
        this.openid = openid;
        this.base = "https://momclub.feihe.com/capis";
        this.token = "";
    }

    async api({ method = "GET", path, data, allowFail = false }) {
        const opts = {
            method,
            url: `${this.base}${path}`,
            headers: {
                Authorization: this.token,
                locale: "zh_CN",
                "content-type": "application/json",
            },
        };
        if (method === "GET") opts.params = data || {};
        else opts.data = data === undefined ? {} : data;
        const res = await request(opts);
        const ok = res.status === 200 && ["00000", "000000", "A00002"].includes(String(res.data?.code));
        if (!ok && !allowFail) throw new Error(`HTTP ${res.status}: ${short(res.data)}`);
        return res.data;
    }

    async login() {
        const code = await getWxCode(APP.appid, this.openid);
        const res = await request({
            method: "POST",
            url: `${this.base}/social/ma`,
            headers: { "content-type": "application/json", locale: "zh_CN" },
            data: code,
            transformRequest: [(data) => data],
        });
        const token = res.data?.data?.tokenInfo?.accessToken || res.data?.data?.accessToken || "";
        if (res.status !== 200 || !token) throw new Error(`登录失败 HTTP ${res.status}: ${short(res.data)}`);
        this.token = token;
        return `token=${token.slice(0, 8)}***`;
    }

    async query() {
        const member = await this.api({ path: "/c/user/memberInfo", allowFail: true });
        const user = await this.api({ path: "/p/user/userInfo", allowFail: true });
        const data = member?.data || user?.data || {};
        const score = data.score || data.points || data.integral || data.availableScore || data.totalScore;
        const name = data.nickName || data.nickname || data.memberName || data.mobile || data.phone || "";
        return `用户=${name || "未知"} 积分=${score ?? "未知"} member=${short(member?.data || member, 120)}`;
    }

    async sign() {
        const todo = await this.api({
            path: "/c/activity/todo/list",
            data: { mockTime: Date.now() },
            allowFail: true,
        });
        const checkTodo =
            getByPath(todo, "data.checkInTodo") ||
            findFirst(todo?.data, (item) => item && (item.checkInExtra || /签到|打卡|check/i.test(`${item.taskName || item.name || item.title || ""}`)));
        const activityId = checkTodo?.id || checkTodo?.activityId || checkTodo?.taskId;
        if (!activityId) return `未找到签到任务: ${short(todo)}`;
        const todaySigned =
            checkTodo?.todaySigned ||
            checkTodo?.signed ||
            checkTodo?.finish ||
            checkTodo?.completed ||
            checkTodo?.status === 1 ||
            checkTodo?.state === 1;
        if (todaySigned) return `今日已签到 activityId=${activityId}`;
        const sign = await this.api({
            method: "POST",
            path: "/c/activity/todo/checkIn",
            data: { activityId, mockTime: Date.now() },
            allowFail: true,
        });
        return `签到接口返回: ${short(sign)}`;
    }
}

async function runAccount(openid, index) {
    $.log(`\n========== ${APP.name} 账号[${index}] ${openid} ==========`);
    const runner = new FeiheMom(openid);
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
