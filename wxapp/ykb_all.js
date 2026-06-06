/*
------------------------------------------
@Author: sm
@Date: 2026.06.05
@Description: ykb_huiyuan 小程序统一登录查询签到
cron: 45 8 * * *
------------------------------------------
变量名：ykb_all
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行

也兼容原单脚本变量名：ykb、lqcwyl、ayldf 等

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("ykb_huiyuan统一签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const CK_NAME = "ykb_all";
const API_BASE = "https://pw.gzych.vip";
const TOKEN_CACHE_FILE = path.join(__dirname, "ykb_all_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

const APPS = [
    { ck: "ayldf", name: "爱游乐东方", appid: "wxf133aa0a4f191ffc", templateVersion: "game_2.32.0" },
    { ck: "ayljz", name: "爱游乐胶州", appid: "wx52005ba8c71a756a", templateVersion: "game_2.32.0" },
    { ck: "aylpld", name: "爱游乐蓬莱店", appid: "wxb4afba83d5ceadae", templateVersion: "game_2.31.0" },
    { ck: "bbwjtqzylzx", name: "宝贝王家庭亲子娱乐中心", appid: "wx61935615c3edb2d0", templateVersion: "game_2.24.3" },
    { ck: "bbwcqncly", name: "宝贝王重庆南川乐园", appid: "wx8fef16e51ca130db", templateVersion: "game_2.15.1" },
    { ck: "bbwhhxp", name: "宝贝王怀化溆浦店", appid: "wxbb9a887cca8663c2", templateVersion: "game_2.30.4" },
    { ck: "cwkjjtyl", name: "超玩空间家庭娱乐", appid: "wx1c59744a3a6ffef8", templateVersion: "game_2.30.4" },
    { ck: "dewbl", name: "第e玩+宝龙店", appid: "wx88fd603ba1ae66a2", templateVersion: "game_2.33.7" },
    { ck: "dlbfhx", name: "大连缤纷幻想", appid: "wx78b4c1140cefdcb0", templateVersion: "game_2.30.1" },
    { ck: "ddmxly", name: "迪迪冒险乐园", appid: "wxcd4a69c8c70a5419", templateVersion: "game_2.15.1" },
    { ck: "ddmxlyjzd", name: "迪迪冒险乐园玖洲道店", appid: "wx70dceb5a4f6daa56", templateVersion: "game_2.15.1" },
    { ck: "dqjtyl", name: "豆趣家庭娱乐中心", appid: "wxc9a77835500632bc", templateVersion: "game_2.23.3" },
    { ck: "fcgxmcws", name: "防城港星梦潮玩社", appid: "wx6683f77a42e1595e", templateVersion: "game_2.30.4" },
    { ck: "fckwjnhdmly", name: "丰城市酷玩嘉年华动漫乐园", appid: "wxb8739c52e9702339", templateVersion: "game_2.20.6" },
    { ck: "fmwg", name: "飞马王国", appid: "wx9703d60d09a566e7", templateVersion: "game_2.15.1" },
    { ck: "fxjnh", name: "纷享X嘉年华", appid: "wxcdbcf18be89c4d47", templateVersion: "game_2.15.1" },
    { ck: "hblytx", name: "湖北乐游天下", appid: "wxf65bcc2eb8c4eeff", templateVersion: "game_2.16.1" },
    { ck: "hlsglc", name: "欢乐拾光乐昌店", appid: "wx5f972a9b4cd13634", templateVersion: "game_2.24.6" },
    { ck: "jddzdtw", name: "机动地带电玩城", appid: "wx0e5c8715d36d15e6", templateVersion: "game_2.30.4" },
    { ck: "jqdw", name: "鲸奇电玩中心", appid: "wxa6dc5cc49b137460", templateVersion: "game_2.30.1" },
    { ck: "jsdwj", name: "九顺大玩家", appid: "wxf99906d27f33fc1d", templateVersion: "game_2.30.2" },
    { ck: "kwkjshhqg", name: "酷玩空间上海环球港店", appid: "wxb08bbd1dd73a27ab", templateVersion: "game_2.32.0" },
    { ck: "kwkjshsjh", name: "酷玩空间上海世纪汇店", appid: "wxd1ca01877cfd33eb", templateVersion: "game_2.33.3" },
    { ck: "kwxqjbel", name: "酷玩猩球金宝二楼店", appid: "wx405ee9e38f6a2038", templateVersion: "game_2.30.2" },
    { ck: "kwxqjbsl", name: "酷玩猩球金宝三楼店", appid: "wxf79a0dc11791d955", templateVersion: "game_2.30.4" },
    { ck: "lmrjxdqxg", name: "蓝梦日记炫动柒栖谷店", appid: "wxa23df268c16943d7", templateVersion: "game_2.33.5" },
    { ck: "lqclnd", name: "乐其城柳南店", appid: "wx25a19136c041f337", templateVersion: "game_2.33.7" },
    { ck: "lqcwgcd", name: "乐其潮玩广场店", appid: "wx1f4ee737668cf5a1", templateVersion: "game_2.33.7" },
    { ck: "lqcwyl", name: "乐其潮玩玉林店", appid: "wxf0e4c545914bd807", templateVersion: "game_2.33.7" },
    { ck: "lzsczqcjl", name: "柳州市城中区超级乐", appid: "wxd4521567cc4b39c0", templateVersion: "game_2.33.7" },
    { ck: "mhdcwdw", name: "梦幻岛潮玩电玩", appid: "wx226c9fbd60679a74", templateVersion: "game_2.15.1" },
    { ck: "mhelhyzhd", name: "萌孩儿乐园海洋振华店", appid: "wx420705aa0369e3f9", templateVersion: "game_2.28.0" },
    { ck: "mqyyc", name: "米其游艺城", appid: "wx0ce00dae4a87ad54", templateVersion: "game_2.30.1" },
    { ck: "mcyxcw", name: "麻涌嬉游潮玩家庭娱乐中心", appid: "wx4d303dc69f029e4e", templateVersion: "game_2.30.2" },
    { ck: "mydyl", name: "梦游岛娱乐", appid: "wxb7ad7be346c73a5e", templateVersion: "game_2.30.4" },
    { ck: "phtkzcwy", name: "平湖天空之城吾悦", appid: "wx387274288d2dcbc2", templateVersion: "game_2.15.1" },
    { ck: "ppxjtczly", name: "派派星家庭成长乐园", appid: "wxce55874aeb73adc2", templateVersion: "game_2.30.4" },
    { ck: "qqyydmly", name: "奇奇游艺动漫乐园", appid: "wx17446921ce05b350", templateVersion: "game_2.24.5" },
    { ck: "qqyyly", name: "奇奇游艺乐园", appid: "wx1cb50cac06c8f487", templateVersion: "game_2.30.1" },
    { ck: "rdsgdlhq", name: "热带时光大沥黄岐店", appid: "wxb1993ab85850dc69", templateVersion: "game_2.30.4" },
    { ck: "rdsghp", name: "热带时光黄埔店", appid: "wxa5ad3ec98ea33db0", templateVersion: "game_2.30.1" },
    { ck: "rdsgsz", name: "热带时光家庭娱乐中心深圳店", appid: "wxc6b29b0eaf5331b8", templateVersion: "game_2.27.0" },
    { ck: "sgcwly", name: "拾光潮玩乐园", appid: "wxbffd1cdbe3f11d33", templateVersion: "game_2.23.3" },
    { ck: "sgsscw", name: "拾光松鼠潮玩店", appid: "wx2823161452551c9e", templateVersion: "game_2.29.3" },
    { ck: "tdxly", name: "泰迪熊乐园", appid: "wx5cfc933a4a2a93f4", templateVersion: "game_2.30.2" },
    { ck: "topwjycccpark", name: "TOP玩家 银川cc park店", appid: "wxc86c913d8d9a4ab4", templateVersion: "game_2.15.1" },
    { ck: "wjfb", name: "玩家风暴", appid: "wx27625bb2d9a8384e", templateVersion: "game_2.15.1" },
    { ck: "xjddw", name: "X机地电玩", appid: "wx1652d4e11cc0a1c2", templateVersion: "game_2.23.3" },
    { ck: "xcdwhtgcd", name: "猩潮电玩恒天广场店", appid: "wx2ad6d80d65b237af", templateVersion: "game_2.19.3" },
    { ck: "xnhhwdbbw", name: "西宁海湖万达宝贝王", appid: "wx7a3335dc207999f3", templateVersion: "game_2.27.0" },
    { ck: "xqlddylc", name: "享区乐到底游乐场", appid: "wx070d007b211099d9", templateVersion: "game_2.24.5" },
    { ck: "ybxwcw", name: "月伴星玩潮玩店", appid: "wxb5e0812b9a0ccc8c", templateVersion: "game_2.30.4" },
    { ck: "ykb", name: "太空橙电玩城", appid: "wxcd8a2d92245ee75b", templateVersion: "game_2.30.4" },
    { ck: "ylsyzqqjwlc", name: "玉林市玉州区奇迹未来城潮漫电玩", appid: "wx4e02b4d9520d6df1", templateVersion: "game_2.28.0" },
    { ck: "ylycmdwd", name: "壹零壹潮漫电玩店", appid: "wx49deb1f94bab5091", templateVersion: "game_2.30.4" },
    { ck: "yyhwqldcw", name: "酉阳红卫桥乐动潮玩", appid: "wx263d7c4bbca7feca", templateVersion: "game_2.30.2" },
    { ck: "zbbbwl", name: "重百宝贝王乐园", appid: "wx9dc5d73cb2d62bdc", templateVersion: "game_2.30.4" },
    { ck: "zjmxwt", name: "终极梦想沃特", appid: "wx733a59c79a4bb702", templateVersion: "game_2.31.0" },
].map((app) => ({
    apiBase: process.env[`${app.ck}_api_base`] || API_BASE,
    wechatVersion: process.env[`${app.ck}_wechat_version`] || "3.9.12",
    mobilePlatform: process.env[`${app.ck}_mobile_platform`] || "windows",
    ...app,
    appid: process.env[`${app.ck}_appid`] || app.appid,
    templateVersion: process.env[`${app.ck}_template_version`] || app.templateVersion,
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

function shortToken(token = "") {
    const value = String(token).replace(/^Token\s+/i, "");
    return value ? `${value.slice(0, 4)}***${value.slice(-4)}` : "";
}

function maskPhone(phone = "") {
    return String(phone).replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function monthRange() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
    return {
        BeginDate: firstDay - 15 * 24 * 60 * 60 * 1000,
        EndDate: nextMonth - 1000 + 15 * 24 * 60 * 60 * 1000,
    };
}

function normalizeStatus(status = "") {
    const map = {
        Completed: "Complete",
        Failed: "Fail",
        Going: "Going",
        Complete: "Complete",
        Fail: "Fail",
    };
    return map[status] || status;
}

function rewardText(rewards = []) {
    if (!Array.isArray(rewards) || rewards.length === 0) return "";
    return rewards
        .map((item) => {
            const num = item.Num ?? item.Amount ?? "";
            const name = item.RewardName || item.Name || item.RewardAlias || item.RewardType || "";
            return `${num}${name}`.trim();
        })
        .filter(Boolean)
        .join("、");
}

function firstValue(source = {}, keys = []) {
    for (const key of keys) {
        const value = source?.[key];
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return 0;
}

function isAuthError(e) {
    return /token|登录|授权|非法请求|1500000004/i.test(String(e?.message || e || ""));
}

class Task {
    constructor(app, account, index) {
        this.app = app;
        this.index = index;
        this.account = String(account || "").trim();
        this.token = "";
        this.openId = "";
        this.mallCode = "";
        this.h5Prefix = "";
        this.customerName = "";
        this.summary = {
            appName: app.name,
            account: this.account,
            member: "未查询",
            assets: "未查询",
            sign: "未执行",
        };
        this.wechat = new WeChatServer({
            url: process.env.wx_server_url || "http://192.168.31.196:8787",
            appid: app.appid,
            auth: process.env.wx_auth || "",
        });
    }

    prefix() {
        return `[${this.app.name}][账号${this.index}]`;
    }

    log(message) {
        $.log(`${this.prefix()} ${message}`);
    }

    cacheKey() {
        return `${this.app.appid}:${this.account}`;
    }

    getCachedToken() {
        const cache = readTokenCache();
        return cache[this.cacheKey()] || null;
    }

    saveCachedToken() {
        if (!this.token) return;
        const cache = readTokenCache();
        cache[this.cacheKey()] = {
            token: this.token,
            openId: this.openId,
            mallCode: this.mallCode,
            h5Prefix: this.h5Prefix,
            customerName: this.customerName,
            appid: this.app.appid,
            appName: this.app.name,
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

    applyToken(data = {}) {
        this.token = data.token || data.Token || "";
        this.openId = data.openId || data.OpenId || "";
        this.mallCode = data.mallCode || data.MallCode || "";
        this.h5Prefix = data.h5Prefix || data.RoterPrefix || "";
        this.customerName = data.customerName || data.CustomerName || "";
    }

    headers(extra = {}) {
        const headers = {
            "User-Agent": USER_AGENT,
            "Referer": `https://servicewechat.com/${this.app.appid}/1/page-frame.html`,
            "Accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            ...extra,
        };
        if (this.token) headers.Authorization = this.token;
        return headers;
    }

    async request({ method = "GET", apiPath, params = {}, data = {}, skipToken = false }) {
        const options = {
            method,
            url: `${this.app.apiBase}${apiPath.startsWith("/") ? apiPath : `/${apiPath}`}`,
            headers: this.headers(),
            timeout: 20000,
            validateStatus: () => true,
        };
        if (skipToken) delete options.headers.Authorization;
        if (method === "GET") options.params = params;
        else options.data = data;

        const { data: result, status } = await axios.request(options);
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);

        const responseStatus = result && result.ResponseStatus;
        if (responseStatus) {
            const code = Number(responseStatus.ErrorCode);
            if (code !== 0) {
                const err = new Error(`${responseStatus.Message || JSON.stringify(result)}(${responseStatus.ErrorCode})`);
                err.raw = result;
                throw err;
            }
            return result.Data;
        }

        if (typeof result?.code !== "undefined" && Number(result.code) !== 0 && Number(result.code) !== 200) {
            throw new Error(result.msg || result.message || JSON.stringify(result));
        }
        return result?.Data ?? result?.data ?? result;
    }

    async run() {
        const cached = this.getCachedToken();
        if (cached) {
            this.applyToken(cached);
            this.log(`使用缓存token ${shortToken(this.token)}`);
            if (!(await this.checkToken())) {
                this.removeCachedToken();
                this.log("缓存token失效，重新登录");
            }
        }

        if (!this.token) await this.login();
        if (!this.token) {
            this.summary.sign = "登录失败";
            return this.summary;
        }

        await this.getMemberInfo();
        const done = await this.tryMemberCheckIn();
        if (!done) await this.tryTaskSign();
        return this.summary;
    }

    async checkToken() {
        try {
            await this.request({ apiPath: "/ykb_huiyuan/api/v1/MemberMine/Info" });
            return true;
        } catch {
            return false;
        }
    }

    async getLoginCode() {
        if (!process.env.wx_auth) throw new Error("未配置 wx_auth，无法通过 wx_server 获取 code");
        const { data } = await this.wechat.getCode(this.account);
        const code = data?.code || data?.data?.code;
        if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
        return code;
    }

    async login() {
        const loginApis = [
            "/ykb_huiyuan/api/v3/MembeGameLogin/appletLogin",
            "/ykbmini/api/v1/HomeAny/appletLogin",
        ];

        for (const apiPath of loginApis) {
            try {
                const code = await this.getLoginCode();
                const data = await this.request({
                    method: "POST",
                    apiPath,
                    skipToken: true,
                    data: {
                        Code: code,
                        AppId: this.app.appid,
                        WechatVersion: this.app.wechatVersion,
                        MobilePlatform: this.app.mobilePlatform,
                        MallCode: this.mallCode || "",
                        TemplateVersion: this.app.templateVersion,
                        extra: { q: "" },
                    },
                });
                this.applyToken(data);
                if (!this.token) throw new Error(`登录响应无Token: ${JSON.stringify(data)}`);
                this.saveCachedToken();
                this.log(`登录成功(${apiPath}): ${this.customerName || ""} openId=${this.openId || ""}`);
                return;
            } catch (e) {
                this.log(`登录接口 ${apiPath} 失败: ${e.message || e}`);
            }
        }
    }

    async getMemberInfo() {
        try {
            const data = await this.request({ apiPath: "/ykb_huiyuan/api/v1/MemberMine/Info" });
            const name = data?.Name || data?.NickName || this.customerName || "未知";
            const phone = data?.Phone ? ` ${maskPhone(data.Phone)}` : "";
            const assets = await this.getAssets(data);
            this.summary.member = `${name}${phone}`;
            this.summary.assets = `代币=${assets.coin} 金币=${assets.goldCoin} 积分=${assets.integral} 彩票=${assets.ticket} 优惠券=${assets.coupon}`;
            this.log(`会员: ${this.summary.member} ${this.summary.assets}`);
        } catch (e) {
            this.summary.member = `查询失败: ${e.message || e}`;
            this.log(`查询会员信息失败: ${e.message || e}`);
            if (isAuthError(e)) this.removeCachedToken();
        }
    }

    async getAssets(memberInfo = {}) {
        const assets = {
            coin: firstValue(memberInfo, ["MyScrip", "Coin", "CoinAmount", "Scrip", "Balance"]),
            goldCoin: firstValue(memberInfo, ["GoldCoin", "GoldCoinAmount"]),
            integral: firstValue(memberInfo, ["ARTotalIntegral", "Integral", "Exchange", "Points"]),
            ticket: firstValue(memberInfo, ["Ticket", "TicketPackage", "TicketCount", "Lottery"]),
            coupon: firstValue(memberInfo, ["Coupon", "CouponCount"]),
        };

        try {
            const data = await this.request({ apiPath: "/ykb_huiyuan/api/v1/Member/GetMemberStoredValue" });
            const list = [
                ...(Array.isArray(data) ? data : []),
                ...(Array.isArray(data?.List) ? data.List : []),
                ...(Array.isArray(data?.Data) ? data.Data : []),
                ...(Array.isArray(data?.LeaguerValues) ? data.LeaguerValues : []),
                ...(Array.isArray(data?.Data?.LeaguerValues) ? data.Data.LeaguerValues : []),
                ...(Array.isArray(data?.StoredValueList) ? data.StoredValueList : []),
            ];
            const source = Array.isArray(data) ? {} : data || {};
            assets.coin = firstValue(source, ["BalanceNum", "MyScrip", "Coin", "CoinAmount", "Scrip", "Balance", "StoredCoin", "GameCoin"]);
            assets.goldCoin = firstValue(source, ["GoldCoin", "GoldCoinAmount"]);
            assets.integral = firstValue(source, ["ARTotalIntegral", "Integral", "Exchange", "Points", "Point"]);
            assets.ticket = firstValue(source, ["Ticket", "TicketPackage", "TicketCount", "Lottery", "LotteryTicket"]);
            assets.coupon = firstValue(source, ["Coupon", "CouponCount"]);
            for (const item of list) {
                const type = String(item.Equity || item.Type || item.StoredValueType || item.StoreCategory || item.Category || item.Name || item.Title || item.Key || "");
                const amount = firstValue(item, ["BalanceNum", "Balance", "AllAmount", "Amount", "Num", "Count", "Value", "Total", "Available", "StoredValue"]);
                if (/GoldCoin|金币/i.test(type)) assets.goldCoin = amount;
                else if (/Ticket|TicketPackage|彩票|票/i.test(type)) assets.ticket = amount;
                else if (/Coupon|优惠券|券/i.test(type)) assets.coupon = amount;
                else if (/Integral|Point|积分|Exchange/i.test(type)) assets.integral = amount;
                else if (/Coin|代币|MyScrip|币/i.test(type)) assets.coin = amount;
            }
        } catch (e) {
            this.log(`查询储值资产失败: ${e.message || e}`);
        }

        return assets;
    }

    async tryMemberCheckIn() {
        try {
            const detail = await this.request({
                apiPath: "/ykb_huiyuan/api/v1/MemberCheckIn/GetDetail",
                params: monthRange(),
            });
            const dailyReward = Array.isArray(detail?.RewardRules)
                ? detail.RewardRules.find((item) => item.CycleType === "Daily")
                : null;
            const dailyText = dailyReward ? `${dailyReward.Amount}${dailyReward.RewardAlias || ""}` : "未知";
            this.log(`会员签到状态: 已连续${detail?.Days ?? 0}天 今日奖励=${dailyText}`);

            if (detail?.IsCheckIn) {
                this.summary.sign = "今日已签到";
                this.log("今日已签到");
                return true;
            }

            const result = await this.request({
                apiPath: "/ykb_huiyuan/api/v1/MemberCheckIn/Submit",
            });
            const after = await this.request({
                apiPath: "/ykb_huiyuan/api/v1/MemberCheckIn/GetDetail",
                params: monthRange(),
            });
            this.summary.sign = `签到成功 signed=${!!after?.IsCheckIn}`;
            this.log(`签到成功${result?.Message ? `: ${result.Message}` : ""} signed=${!!after?.IsCheckIn}`);
            return true;
        } catch (e) {
            this.summary.sign = `会员签到失败: ${e.message || e}`;
            this.log(`会员签到接口不可用，改用任务签到: ${e.message || e}`);
            if (isAuthError(e)) this.removeCachedToken();
            return false;
        }
    }

    async getTaskList(taskType = "AllTask") {
        const data = await this.request({
            apiPath: "/hdb/api/v1/ClientTask/GetTaskListFromYDG",
            params: { TaskType: taskType },
        });
        return data?.List || data?.Data?.List || data?.list || [];
    }

    isSignTask(task = {}) {
        return /签到|每日|天天|登录|打卡|check.?in|sign/i.test(
            [task.TaskName, task.Name, task.Remark, task.Title, task.TaskType, task.TypeName].filter(Boolean).join(" ")
        );
    }

    async getTaskDetail(task) {
        if (task.UserTaskID) {
            return this.request({
                apiPath: "/hdb/api/v1/ClientTask/GetUserTaskDetail",
                params: { UserTaskID: task.UserTaskID },
            });
        }
        return this.request({
            apiPath: "/hdb/api/v1/ClientTask/GetTaskDetail",
            params: { TaskID: task.TaskID },
        });
    }

    async receiveTask(taskDetail, sourceTask) {
        const userTaskId = taskDetail?.UserTaskId || taskDetail?.UserTaskID || sourceTask?.UserTaskID || "";
        if (!userTaskId) throw new Error("缺少 UserTaskId");
        const data = await this.request({
            method: "POST",
            apiPath: "/hdb/api/v1/ClientTask/ReceiveTaskRewards",
            data: { UserTaskId: userTaskId },
        });
        const text = rewardText(data?.Rewards || data?.RewardList || []);
        this.summary.sign = `任务奖励已领取${text ? `: ${text}` : ""}`;
        this.log(`领取任务奖励成功${text ? `: ${text}` : ""}`);
    }

    async handleTask(task) {
        const name = task.TaskName || task.Name || task.TaskID || "未知任务";
        let detail = await this.getTaskDetail(task);
        detail.Status = normalizeStatus(detail.Status);
        this.log(`任务「${name}」状态=${detail.Status || "未知"}`);

        if (detail.Status === "Complete") {
            if (detail.RewardReceiveStatus === "UnReceive") await this.receiveTask(detail, task);
            else this.summary.sign = `任务已完成: ${name}`;
            return;
        }

        if (!task.TaskID) return;
        const challenge = await this.request({
            method: "POST",
            apiPath: "/hdb/api/v1/ClientTask/ReceiveTask",
            data: { ID: task.TaskID },
        });
        const userTaskId = challenge?.UserTaskId || challenge?.UserTaskID;
        if (userTaskId) {
            detail = await this.getTaskDetail({ UserTaskID: userTaskId });
            detail.Status = normalizeStatus(detail.Status);
            if (detail.Status === "Complete" && detail.RewardReceiveStatus === "UnReceive") {
                await this.receiveTask(detail, { ...task, UserTaskID: userTaskId });
            } else {
                this.summary.sign = `任务状态=${detail.Status || "未知"}`;
            }
        }
    }

    async tryTaskSign() {
        try {
            const tasks = await this.getTaskList();
            const signTasks = tasks.filter((task) => this.isSignTask(task));
            if (!signTasks.length) {
                this.summary.sign = "未找到签到/每日任务";
                this.log("未找到签到/每日任务");
                return;
            }
            for (const task of signTasks) await this.handleTask(task);
        } catch (e) {
            this.summary.sign = `任务签到失败: ${e.message || e}`;
            this.log(`任务签到失败: ${e.message || e}`);
        }
    }
}

!(async () => {
    const plan = APPS.map((app) => ({ app, accounts: getAccounts(app) })).filter((item) => item.accounts.length);
    const totalAccounts = plan.reduce((sum, item) => sum + item.accounts.length, 0);
    $.log(`共找到${plan.length}个小程序，${totalAccounts}个执行账号`);
    if (!plan.length) {
        $.log(`未配置 ${CK_NAME} 或原单脚本变量`);
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
