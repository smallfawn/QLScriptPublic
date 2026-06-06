/*
------------------------------------------
@Author: sm
@Date: 2026.06.06
@Description: 视软 ytb2 小程序统一登录查询签到
cron: 50 8 * * *
------------------------------------------
变量名：ytb2_all
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行

也兼容单小程序变量名：rdsgyjd

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("视软ytb2统一签到");
const axios = require("axios");
const WeChatServer = require("./wcs.js");

const CK_NAME = "ytb2_all";
const API_BASE = "https://ytb2.zs-shiruan.cn/api";
const LOGIN_BASE = "https://ytb2.zs-shiruan.cn/api-v2";
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

const APPS = [
    {
        ck: "rdsgyjd",
        name: "热带时光家庭娱乐中心阳江店",
        appid: "wx0a73bcd6f11e05e3",
        storeId: "2014496",
        signActId: "13417",
    },
].map((app) => ({
    apiBase: process.env[`${app.ck}_api_base`] || API_BASE,
    loginBase: process.env[`${app.ck}_login_base`] || LOGIN_BASE,
    ...app,
    appid: process.env[`${app.ck}_appid`] || app.appid,
    storeId: process.env[`${app.ck}_store_id`] || app.storeId,
    signActId: process.env[`${app.ck}_sign_act_id`] || app.signActId,
}));

function splitAccounts(value = "") {
    return String(value)
        .split(/\n|&/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function unique(items = []) {
    return [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))];
}

function parseUnifiedEnv() {
    const raw = process.env[CK_NAME] || "";
    const result = { global: [], byKey: {} };
    for (const item of splitAccounts(raw)) {
        const idx = item.indexOf("=");
        if (idx === -1) {
            result.global.push(item);
            continue;
        }
        const key = item.slice(0, idx).trim().toLowerCase();
        const value = item.slice(idx + 1).trim();
        if (!key || !value) continue;
        result.byKey[key] = result.byKey[key] || [];
        result.byKey[key].push(value);
    }
    result.global = unique(result.global);
    return result;
}

const unifiedEnv = parseUnifiedEnv();

function getAccounts(app) {
    const keys = [app.ck, app.appid, app.name].map((item) => item.toLowerCase());
    const accounts = [];
    if (unifiedEnv.global.length) accounts.push(...unifiedEnv.global);
    for (const key of keys) accounts.push(...(unifiedEnv.byKey[key] || []));
    accounts.push(...splitAccounts(process.env[app.ck] || ""));
    return unique(accounts);
}

function maskPhone(phone = "") {
    return String(phone).replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function assetValue(memberInfo = {}, keys = [], names = []) {
    const assets = Array.isArray(memberInfo.assets) ? memberInfo.assets : [];
    for (const item of assets) {
        if (keys.includes(item.key) || names.includes(item.name)) return item.num ?? 0;
    }
    return 0;
}

function findSignActId(source) {
    let found = "";
    const walk = (value) => {
        if (found || value === null || value === undefined) return;
        if (typeof value === "string") {
            const match = value.match(/sign-in\/sign-in\?[^"']*actid=(\d+)/i);
            if (match) found = match[1];
            return;
        }
        if (Array.isArray(value)) {
            for (const item of value) walk(item);
            return;
        }
        if (typeof value === "object") {
            for (const item of Object.values(value)) walk(item);
        }
    };
    walk(source);
    return found;
}

class Task {
    constructor(app, account, index) {
        this.app = app;
        this.account = account;
        this.index = index;
        this.shiruanKey = "";
        this.openid = "";
        this.mobile = "";
        this.templateUrl = "";
        this.signActId = app.signActId || "";
        this.summary = {
            appName: app.name,
            member: "未查询",
            assets: "未查询",
            sign: "未执行",
        };
        this.wechat = new WeChatServer({
            url: process.env.wx_server_url || "http://192.168.31.196:8787",
            appid: app.appid,
            auth: process.env.wx_auth,
        });
    }

    log(message) {
        $.log(`[${this.app.name}][账号${this.index}] ${message}`);
    }

    headers(extra = {}) {
        return {
            "content-type": "application/json",
            "User-Agent": USER_AGENT,
            ...extra,
        };
    }

    authHeaders(extra = {}) {
        return this.headers({
            shiruanKey: this.shiruanKey,
            miniAppid: this.app.appid,
            ...extra,
        });
    }

    async getCode() {
        const res = await this.wechat.getCode(this.account);
        const data = res?.data;
        return data?.data?.code || data?.code || data?.data || data;
    }

    async login() {
        const code = await this.getCode();
        const { data } = await axios.post(
            `${this.app.loginBase}/mini/preLogin-new`,
            {
                app_id: this.app.appid,
                store_id: this.app.storeId || "",
                code,
            },
            {
                headers: this.headers(),
                timeout: 30000,
            }
        );
        if (data?.code !== 200) throw new Error(`登录失败: ${data?.msg || JSON.stringify(data)}`);
        this.shiruanKey = data.data?.shiruan_key || "";
        this.openid = data.data?.openid || "";
        this.mobile = data.data?.mobile || "";
        this.templateUrl = data.data?.templateUrl || "";
        this.log(`登录成功: ${maskPhone(this.mobile)} openId=${this.openid}`);
    }

    async detectSignActId() {
        if (this.signActId) return this.signActId;
        if (!this.templateUrl) return "";
        try {
            const { data } = await axios.get(this.templateUrl, {
                headers: this.headers(),
                timeout: 30000,
            });
            this.signActId = findSignActId(data);
            if (this.signActId) this.log(`识别签到活动ID: ${this.signActId}`);
        } catch (e) {
            this.log(`读取模板失败: ${e.message || e}`);
        }
        return this.signActId;
    }

    async queryAssets() {
        const { data } = await axios.post(
            `${this.app.apiBase}/mini/user-asset`,
            {},
            {
                headers: this.authHeaders(),
                timeout: 30000,
            }
        );
        if (data?.code !== 200) throw new Error(`查询失败: ${data?.msg || JSON.stringify(data)}`);
        const info = data.data?.member_info || {};
        const phone = info.leag_tel || data.data?.mobile || this.mobile;
        const card = info.card_no || info.leag_no || "未知会员";
        const coin = assetValue(info, ["coin_bal"], ["代币"]);
        const point = assetValue(info, ["score"], ["积分", "娃娃积分"]);
        const ticket = assetValue(info, ["tick_bal", "new_ticket"], ["奖票", "特殊奖票"]);
        const gateTicket = assetValue(info, ["ticket_amount"], ["门票"]);
        this.summary.member = `${card} ${maskPhone(phone)}`;
        this.summary.assets = `代币=${coin} 积分=${point} 彩票=${ticket} 门票=${gateTicket}`;
        this.log(`会员: ${this.summary.member} ${this.summary.assets}`);
    }

    async sign() {
        const actId = await this.detectSignActId();
        if (!actId) {
            this.summary.sign = "未找到签到活动ID";
            this.log(this.summary.sign);
            return;
        }
        try {
            const info = await axios.get(`${this.app.apiBase}/marketing/sign-info?marketing_activity_id=${actId}`, {
                headers: this.authHeaders(),
                timeout: 30000,
            });
            if (info.data?.code === 200) {
                const d = info.data.data || {};
                const activityName = d.activity?.name || actId;
                this.log(`签到活动: ${activityName} 已签=${d.is_sign_today || 0} 累计=${d.sign_day || 0}天`);
                if (Number(d.is_sign_today) === 1) {
                    this.summary.sign = `今日已签到 累计=${d.sign_day || 0}天`;
                    return;
                }
            } else {
                this.log(`签到状态查询: ${info.data?.msg || JSON.stringify(info.data)}`);
            }

            const { data } = await axios.get(`${this.app.apiBase}/marketing/new-sign?marketing_activity_id=${actId}`, {
                headers: this.authHeaders(),
                timeout: 30000,
            });
            const gifts = Array.isArray(data?.data?.gifts)
                ? data.data.gifts.map((item) => `${item.num ?? item.gift_num ?? ""}${item.asset_name || item.name || ""}`.trim()).filter(Boolean)
                : [];
            this.summary.sign = `${data?.msg || "签到返回"}${gifts.length ? `: ${gifts.join("、")}` : ""}`;
            this.log(this.summary.sign);
        } catch (e) {
            this.summary.sign = `签到失败: ${e.message || e}`;
            this.log(this.summary.sign);
        }
    }

    async run() {
        try {
            await this.login();
            await this.queryAssets();
            await this.sign();
            await this.queryAssets();
        } catch (e) {
            this.summary.sign = `执行失败: ${e.message || e}`;
            this.log(this.summary.sign);
        }
        return this.summary;
    }
}

!(async () => {
    const plan = APPS.map((app) => ({ app, accounts: getAccounts(app) })).filter((item) => item.accounts.length);
    const totalAccounts = plan.reduce((sum, item) => sum + item.accounts.length, 0);
    $.log(`共找到${plan.length}个小程序，${totalAccounts}个执行账号`);
    if (!plan.length) {
        $.log(`未配置 ${CK_NAME} 或单小程序变量`);
        return;
    }

    const summaries = [];
    for (const { app, accounts } of plan) {
        $.log(`\n========== ${app.name} (${app.ck}) ==========`);
        let index = 1;
        for (const account of accounts) {
            summaries.push(await new Task(app, account, index++).run());
        }
    }

    $.log("\n========== 执行汇总 ==========");
    for (const item of summaries) {
        $.log(`${item.appName}: ${item.member} ${item.assets} 签到=${item.sign}`);
    }
})()
    .catch((e) => $.log(e.message || e))
    .finally(() => $.done());
