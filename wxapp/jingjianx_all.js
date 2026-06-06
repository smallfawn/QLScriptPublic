/*
------------------------------------------
@Author: sm
@Date: 2026.06.05
@Description: jingjianx 小程序统一登录查询签到
cron: 30 8 * * *
------------------------------------------
变量名：jingjianx_all
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行

也兼容原单脚本变量名，如 xswj、dywj、afdacw、super101cmdwyd 等。
总变量可用 appid=openid、变量名=openid、小程序名=openid 指定单个小程序账号。

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("jingjianx统一签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const CK_NAME = "jingjianx_all";
const WX_SERVER_URL = process.env.wx_server_url || "http://192.168.31.196:8787";
const WX_AUTH = process.env.wx_auth || "";
const CACHE_FILE = path.join(__dirname, "jingjianx_all_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

const APPS = [
    {
        ck: "cwsjnbyyz",
        name: "潮玩社 JN北园银座店",
        appid: "wx533baf4b9428d47f",
        chainId: "8684",
        shops: [{ shopId: "15666", shopName: "潮玩社 JN北园银座店" }],
    },
    {
        ck: "afdacw",
        name: "阿凡达潮玩荟家庭娱乐中心",
        appid: "wxea93bab38fc144d1",
        chainId: "10967",
        shops: [
            { shopId: "21380", shopName: "阿凡达潮玩荟文水店" },
            { shopId: "21094", shopName: "阿凡达潮玩荟太原迎春街店" },
            { shopId: "20169", shopName: "阿凡达潮玩荟忻州店" },
            { shopId: "19075", shopName: "阿凡达潮玩荟榆次店" },
        ],
    },
    {
        ck: "dywj",
        name: "D1玩家",
        appid: "wxcced0bb82c738dd1",
        chainId: "3708",
        shops: [
            { shopId: "7960", shopName: "D1玩家-大丰保利店" },
            { shopId: "18811", shopName: "D1玩家友谊广场店" },
            { shopId: "14082", shopName: "D1玩家-大丰汇融店" },
            { shopId: "13473", shopName: "D1玩家-阳光新业店" },
            { shopId: "13190", shopName: "D1玩家-龙湖金楠天街店" },
            { shopId: "19190", shopName: "酷啦啦-甘孜店" },
            { shopId: "12302", shopName: "D1玩家-龙湖锦宸店" },
        ],
    },
    {
        ck: "gxdwj",
        name: "高新大玩家",
        appid: "wx7ec8c4f08046df18",
        chainId: "11279",
        shops: [{ shopId: "19642", shopName: "高新大玩家" }],
    },
    {
        ck: "dwjjxyl",
        name: "大玩家匠心娱乐",
        appid: "wxf64d5e147f9cc3b6",
        chainId: "9663",
        shops: [{ shopId: "17093", shopName: "大玩家匠心娱乐" }],
    },
    {
        ck: "wjsldwjxy",
        name: "玩家森林大玩家XY",
        appid: "wx6136bd123a990614",
        chainId: "9095",
        shops: [{ shopId: "18894", shopName: "玩家森林大玩家XY" }],
    },
    {
        ck: "jswjbzjk",
        name: "极速玩家巴中经开店",
        appid: "wx174a477493da1aeb",
        chainId: "4748",
        shops: [{ shopId: "19081", shopName: "极速玩家巴中经开店" }],
    },
    {
        ck: "jyxmhdylly",
        name: "嘉鱼县梦幻岛游乐园",
        appid: "wxb7fcdb0c375bac0c",
        chainId: "10762",
        shops: [{ shopId: "18752", shopName: "嘉鱼县梦幻岛游乐园" }],
    },
    {
        ck: "qccwc",
        name: "七彩潮玩城",
        appid: "wx72727cb43e04f838",
        chainId: "7243",
        shops: [{ shopId: "12860", shopName: "七彩潮玩城" }],
    },
    {
        ck: "jhjtylclc",
        name: "吉合家庭娱乐超乐场",
        appid: "wxdc43cd8bfcfd00ad",
        chainId: "3580",
        shops: [{ shopId: "8551", shopName: "吉合家庭娱乐超乐场" }],
    },
    {
        ck: "super101cmdwyd",
        name: "SUPER101潮漫电玩宜都店",
        appid: "wx1031a0ff78dbb777",
        chainId: "3091",
        shops: [{ shopId: "13516", shopName: "SUPER101潮漫电玩宜都店" }],
    },
    {
        ck: "wx_three_sign",
        name: "城市星空颖上恒太",
        appid: "wxab97f393b22fc3f0",
        chainId: "3900",
        shops: [{ shopId: "7726", shopName: "城市星空颖上恒太" }],
    },
    {
        ck: "wjcq",
        name: "维京传奇长春店",
        appid: "wxf4a3dae0d0cfd841",
        chainId: "11383",
        shops: [{ shopId: "19820", shopName: "维京传奇长春店" }],
    },
    {
        ck: "xswj",
        name: "像素玩家电玩城",
        appid: "wx16ad44c68249d573",
        chainId: "10557",
        shops: [{ shopId: "18417", shopName: "像素玩家电玩城" }],
    },
    {
        ck: "xblfysx",
        name: "星贝乐阜阳商厦中心店",
        appid: "wxf0a7f75ab1670953",
        chainId: "3900",
        shops: [{ shopId: "17457", shopName: "星贝乐阜阳商厦中心店" }],
    },
    {
        ck: "zjdmc",
        name: "中嘉动漫创美店",
        appid: "wx97b6b57988678880",
        chainId: "8006",
        shops: [{ shopId: "21310", shopName: "中嘉动漫创美店" }],
    },
    {
        ck: "zjdmzj",
        name: "中嘉动漫城樽憬店",
        appid: "wx334c4ec677c62f96",
        chainId: "8006",
        shops: [{ shopId: "16741", shopName: "中嘉动漫城樽憬店" }],
    },
];

for (const app of APPS) {
    app.apiBase = process.env[`${app.ck}_api_base`] || "https://capi.jingjianx.vip";
    app.chainId = process.env[`${app.ck}_chainid`] || app.chainId;
    app.version = process.env[`${app.ck}_version`] || "release";
    const shopIds = (process.env[`${app.ck}_shop_ids`] || "")
        .split(/[,，&;\n]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    if (shopIds.length) {
        app.shops = app.shops
            .filter((shop) => shopIds.includes(String(shop.shopId)))
            .concat(
                shopIds
                    .filter((id) => !app.shops.some((shop) => String(shop.shopId) === id))
                    .map((id) => ({ shopId: id, shopName: `门店${id}` }))
            );
    }
}

function readCache() {
    try {
        if (!fs.existsSync(CACHE_FILE)) return {};
        return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) || {};
    } catch {
        return {};
    }
}

function writeCache(cache) {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
    } catch (e) {
        $.log(`写入token缓存失败: ${e.message || e}`);
    }
}

function shortToken(token = "") {
    const value = String(token).replace(/^Bearer\s+/i, "");
    return value ? `${value.slice(0, 4)}***${value.slice(-4)}` : "";
}

function maskPhone(phone = "") {
    return String(phone).replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function createGuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function isToday(dateText = "") {
    if (!dateText) return false;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return String(dateText).startsWith(`${y}-${m}-${d}`);
}

function addStoreAsset(assets, category, value, name = "") {
    const amount = Number(value || 0);
    const label = String(name || "");
    if (label) {
        if (/积分|Point/i.test(label)) assets.integral += amount;
        else if (/彩票|票/.test(label)) assets.ticket += amount;
        else if (/游戏币|本币|代币/.test(label)) assets.coin += amount;
        return;
    }
    if ([101, 102, 103].includes(Number(category))) assets.coin += amount;
    else if (Number(category) === 105) assets.integral += amount;
    else if ([104, 106, 1001, 1002, 1003].includes(Number(category))) assets.ticket += amount;
}

function parseEntries(raw = "") {
    if (!raw.trim()) return [];
    if (/^\s*[\[{]/.test(raw)) {
        try {
            const data = JSON.parse(raw);
            if (Array.isArray(data)) return data.map(String).filter(Boolean);
            if (data && typeof data === "object") {
                return Object.entries(data).map(([key, value]) => `${key}=${value}`);
            }
        } catch {
            return [];
        }
    }
    return raw
        .split(/[\n&;|]+/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function resolveAccounts(app, totalEntries) {
    const entries = totalEntries.length ? totalEntries : parseEntries(process.env[app.ck] || "");
    const mapped = [];
    const common = [];
    for (const entry of entries) {
        const index = entry.indexOf("=");
        if (index > 0) {
            const key = entry.slice(0, index).trim();
            const value = entry.slice(index + 1).trim();
            if (value && [app.appid, app.ck, app.name].includes(key)) mapped.push(value);
        } else {
            common.push(entry);
        }
    }
    return mapped.length ? mapped : common;
}

class AppContext {
    constructor(app) {
        this.app = app;
        this.wx = new WeChatServer({
            url: WX_SERVER_URL,
            appid: app.appid,
            auth: WX_AUTH,
        });
    }

    async getCode(openid) {
        if (!WX_AUTH) throw new Error("未配置 wx_auth，无法通过 wx_server 获取 code");
        const { data } = await this.wx.getCode(openid);
        const code = data?.code || data?.data?.code;
        if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
        return code;
    }

    headers(shopId = "", token = "", extra = {}) {
        const headers = {
            "User-Agent": USER_AGENT,
            "Referer": `https://servicewechat.com/${this.app.appid}/1/page-frame.html`,
            "content-type": "application/json",
            "JJ-CHAINID": this.app.chainId,
            "BDSZH-SHOPID": shopId,
            "JJ-SHOPID": shopId,
            "JJ-MiniAppVersion": this.app.version,
            "JJ-AppId": this.app.appid,
            ...extra,
        };
        if (token) headers.Authorization = `Bearer ${token}`;
        return headers;
    }

    async request({ method = "GET", apiPath, shopId = "", token = "", params = {}, data = {}, bizCode = "" }) {
        const options = {
            method,
            url: `${this.app.apiBase}${apiPath}`,
            headers: this.headers(shopId, token, bizCode ? { "JJ-BizCode": bizCode } : {}),
            timeout: 20000,
            validateStatus: () => true,
        };
        if (method === "GET") options.params = params;
        else options.data = data;

        const { data: result, status } = await axios.request(options);
        if (status > 400) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);
        return result;
    }
}

class ShopTask {
    constructor(ctx, shop, account, index) {
        this.ctx = ctx;
        this.app = ctx.app;
        this.shop = {
            shopId: String(shop.shopId),
            shopName: String(shop.shopName || `门店${shop.shopId}`).trim(),
        };
        this.account = String(account || "").trim();
        this.index = index;
        this.token = "";
        this.isMember = false;
        this.member = null;
        this.loginShopName = "";
    }

    prefix() {
        return `[${this.app.name}][${this.shop.shopName}][账号${this.index}]`;
    }

    cacheKey() {
        return `${this.app.appid}:${this.account}:${this.shop.shopId}`;
    }

    getCachedToken() {
        const cache = readCache();
        return cache[this.cacheKey()] || null;
    }

    saveToken() {
        if (!this.token) return;
        const cache = readCache();
        cache[this.cacheKey()] = {
            token: this.token,
            isMember: this.isMember,
            member: this.member,
            shopId: this.shop.shopId,
            shopName: this.loginShopName || this.shop.shopName,
            appid: this.app.appid,
            appName: this.app.name,
            updatedAt: new Date().toISOString(),
        };
        writeCache(cache);
    }

    clearToken() {
        const cache = readCache();
        delete cache[this.cacheKey()];
        writeCache(cache);
        this.token = "";
    }

    applyLogin(data = {}) {
        this.token = data.token || "";
        this.isMember = !!data.isMember;
        this.member = data.member || null;
        this.loginShopName = data.shopName || "";
    }

    async run() {
        const result = {
            appName: this.app.name,
            shopName: this.shop.shopName,
            loginShopName: "",
            member: false,
            memberText: "",
            assets: { coin: 0, integral: 0, ticket: 0, coupon: 0 },
            sign: "未执行",
        };

        const cached = this.getCachedToken();
        if (cached) {
            this.token = cached.token || "";
            this.isMember = !!cached.isMember;
            this.member = cached.member || null;
            this.loginShopName = cached.shopName || "";
            $.log(`${this.prefix()} 使用缓存token ${shortToken(this.token)}`);
            if (!(await this.checkToken())) {
                this.clearToken();
                $.log(`${this.prefix()} 缓存token失效，重新登录`);
            }
        }

        if (!this.token) await this.login();
        if (!this.token) {
            result.sign = "登录失败";
            $.log(`${this.prefix()} 结果=${result.sign}`);
            return result;
        }

        const memberText = this.member
            ? `${this.member.nickName || this.member.name || this.member.memberName || "member"}${this.member.phone ? ` ${maskPhone(this.member.phone)}` : ""}`
            : "非会员";
        const assets = this.isMember ? await this.getAssets() : result.assets;
        result.loginShopName = this.loginShopName || this.shop.shopName;
        result.member = this.isMember;
        result.memberText = memberText;
        result.assets = assets;

        $.log(
            `${this.prefix()} 查询: 登录门店=${result.loginShopName} member=${this.isMember} ${memberText} 代币=${assets.coin} 积分=${assets.integral} 彩票=${assets.ticket} 优惠券=${assets.coupon}`
        );

        if (!this.isMember) {
            result.sign = "非会员跳过";
            $.log(`${this.prefix()} 签到: ${result.sign}`);
            return result;
        }

        result.sign = await this.sign();
        $.log(`${this.prefix()} 签到: ${result.sign}`);
        return result;
    }

    async checkToken() {
        try {
            const result = await this.ctx.request({
                apiPath: "/signed/capp/signed/getreward",
                shopId: this.shop.shopId,
                token: this.token,
            });
            return !!result.success;
        } catch {
            return false;
        }
    }

    async login() {
        try {
            const code = await this.ctx.getCode(this.account);
            const result = await this.ctx.request({
                method: "POST",
                apiPath: "/capp/account/login",
                shopId: this.shop.shopId,
                data: { code },
            });
            if (!result.success) throw new Error(result.msg || JSON.stringify(result));
            this.applyLogin(result.data || {});
            if (!this.token) throw new Error(`登录响应无token: ${JSON.stringify(result)}`);
            this.saveToken();
            $.log(`${this.prefix()} 登录成功 token=${shortToken(this.token)}`);
        } catch (e) {
            $.log(`${this.prefix()} 登录失败: ${e.message || e}`);
        }
    }

    async getAssets() {
        const assets = { coin: 0, integral: 0, ticket: 0, coupon: 0 };
        const accountNames = {};
        try {
            const account = await this.ctx.request({
                apiPath: "/basic/shop/xcx/scene/getaccount",
                shopId: this.shop.shopId,
                token: this.token,
            });
            const list = Array.isArray(account?.data) ? account.data : [];
            for (const item of list) accountNames[Number(item.key)] = item.value;
        } catch (e) {
            $.log(`${this.prefix()} 查询账户类型失败: ${e.message || e}`);
        }

        try {
            const store = await this.ctx.request({
                apiPath: "/member/capp/member/store/get",
                shopId: this.shop.shopId,
                token: this.token,
            });
            const list = Array.isArray(store?.data) ? store.data : [];
            for (const item of list) addStoreAsset(assets, item.storeCategory, item.value, accountNames[Number(item.storeCategory)]);
        } catch (e) {
            $.log(`${this.prefix()} 查询资产失败: ${e.message || e}`);
        }
        try {
            const coupon = await this.ctx.request({
                apiPath: "/coupon/capp/membercoupon/count",
                shopId: this.shop.shopId,
                token: this.token,
            });
            if (coupon?.success) assets.coupon = Number(coupon.data || 0);
        } catch (e) {
            $.log(`${this.prefix()} 查询优惠券失败: ${e.message || e}`);
        }
        return assets;
    }

    async getReward() {
        const result = await this.ctx.request({
            apiPath: "/signed/capp/signed/getreward",
            shopId: this.shop.shopId,
            token: this.token,
        });
        if (!result.success) throw new Error(result.msg || JSON.stringify(result));
        return result.data || {};
    }

    async getProgress(signType) {
        const apiPath = Number(signType) === 0 ? "/signed/capp/signed/getprogress" : "/signed/capp/signed/getnewprogress";
        const result = await this.ctx.request({
            apiPath,
            shopId: this.shop.shopId,
            token: this.token,
        });
        if (!result.success) throw new Error(result.msg || JSON.stringify(result));
        return result.data || {};
    }

    getSignedState(reward, progress) {
        const signType = Number(reward.signCycle || 0);
        const signMode = Number(reward.signMode || 1);

        if (signType === 0) {
            return {
                signType,
                signMode,
                signed: !progress.isSigning,
                currentDay: progress.signInDays || 0,
                apiPath: "/signed/capp/signed/confirm",
            };
        }

        if (signMode === 2 && progress.totalDay) {
            return {
                signType,
                signMode,
                signed: !progress.totalDay.isSigning,
                currentDay: progress.totalDay.signInDays || 0,
                apiPath: "/signed/capp/signed/newconfirm",
            };
        }

        if (signMode === 3 && Array.isArray(progress.dailyDay)) {
            return {
                signType,
                signMode,
                signed: progress.dailyDay.some((item) => isToday(item.signDate)),
                currentDay: progress.dailyDay.length,
                apiPath: "/signed/capp/signed/newconfirm",
            };
        }

        return {
            signType,
            signMode,
            signed: progress.totalDay ? !progress.totalDay.isSigning : false,
            currentDay: progress.totalDay?.signInDays || 0,
            apiPath: "/signed/capp/signed/newconfirm",
        };
    }

    async sign() {
        try {
            const reward = await this.getReward();
            if (!reward.isEnabled) return "未开启签到";

            const progress = await this.getProgress(reward.signCycle);
            const state = this.getSignedState(reward, progress);
            $.log(`${this.prefix()} 签到状态: signType=${state.signType} signMode=${state.signMode} currentDay=${state.currentDay} signed=${state.signed}`);

            if (state.signed) return "今日已签到";

            const result = await this.ctx.request({
                method: "POST",
                apiPath: state.apiPath,
                shopId: this.shop.shopId,
                token: this.token,
                data: { longitude: 0, latitude: 0 },
                bizCode: createGuid(),
            });
            if (!result.success) throw new Error(result.msg || JSON.stringify(result));
            const data = result.data || {};
            return `签到成功${data.rewardName || data.prizeName ? ` 奖励=${data.rewardName || data.prizeName}` : ""}`;
        } catch (e) {
            return `签到失败: ${e.message || e}`;
        }
    }
}

!(async () => {
    const totalEntries = parseEntries(process.env[CK_NAME] || "");
    const summaries = [];

    for (const app of APPS) {
        const accounts = resolveAccounts(app, totalEntries);
        if (!accounts.length) {
            $.log(`[${app.name}] 未配置账号，跳过`);
            continue;
        }

        $.log(`\n===== ${app.name} appid=${app.appid} chainId=${app.chainId} 门店数=${app.shops.length} =====`);
        const ctx = new AppContext(app);
        for (const shop of app.shops) {
            let index = 1;
            for (const account of accounts) {
                summaries.push(await new ShopTask(ctx, shop, account, index++).run());
            }
        }
    }

    if (!summaries.length) {
        $.log(`未找到账号，请配置 ${CK_NAME} 或原单脚本变量名`);
        return;
    }

    $.log("\n========== jingjianx 签到汇总 ==========");
    for (const item of summaries) {
        $.log(
            `${item.appName} | ${item.loginShopName || item.shopName} | ${item.memberText || "未知用户"} | 代币=${item.assets.coin} 积分=${item.assets.integral} 彩票=${item.assets.ticket} 优惠券=${item.assets.coupon} | ${item.sign}`
        );
    }
})()
    .catch((e) => $.log(e.message || e))
    .finally(() => $.done());
