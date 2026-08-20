/*
------------------------------------------
@Description: Ole 超市(华润 crvole) - 微信小程序静默登录 + 每日签到
cron: 16 6,18 * * *
------------------------------------------
变量名：olecs
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx6c61aaeba1551439，host ole-app.crvole.com.cn）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录；纯 code→session，无会员注册闸门）

公共头：appVersion / channel:wxmini / os:android / Tenant:VGDT / Tenant-Channel:OLE
        + unique(设备UUID,按openid派生) + Device-Name + traceId(微秒时间戳)
        业务请求再加 sessionId + oleWxOpenId
登录  POST /vgdt_app_api/v1/vgdt-fea-app-member/front_api/wechat_auths/code/mini_program {code}
        -> state_code==200，data.user_session(=sessionId) / data.open_id(=oleWxOpenId)
门店  POST /vgdt_app_api/v1/vgdt-fea-app-entershop/front_api/enter_shops/shop {location,...}
        -> state_code==200，data.shop_code（按 LOCATION 就近匹配门店，用于签到入参）
状态  GET  /vgdt_app_api/v1/vgdt-fea-app-member/front_api/member_sign
        -> state_code==200，data.sign_of_day=="Y"(已签) / data.total_integral(积分)
签到  POST /vgdt_app_api/v1/vgdt-fea-app-member/front_api/member_sign {enter_shop_code}
        -> state_code==200
LOCATION 为就近门店解析坐标(应用级配置，非个人凭证)。unique 按 openid 派生，未照搬作者设备号。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("Ole超市签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "olecs";
const MINI_APP_ID = "wx6c61aaeba1551439";
const BASE_URL = "https://ole-app.crvole.com.cn";
// 就近门店解析坐标（应用级配置，用于 enter_shops 匹配 shop_code，非个人凭证）
const LOCATION = "119.17437689887153,26.149126519097223";
const TOKEN_CACHE_FILE = path.join(__dirname, "olecs_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/vgdt_app_api/v1/vgdt-fea-app-member/front_api/wechat_auths/code/mini_program";
const EP_SHOP = "/vgdt_app_api/v1/vgdt-fea-app-entershop/front_api/enter_shops/shop";
const EP_SIGN = "/vgdt_app_api/v1/vgdt-fea-app-member/front_api/member_sign";

const COMMON_HEADERS = {
    appVersion: "1.10.32",
    channel: "wxmini",
    os: "android",
    Tenant: "VGDT",
    "Tenant-Channel": "OLE",
    "content-type": "application/json",
};

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

function readCache() {
    try { if (!fs.existsSync(TOKEN_CACHE_FILE)) return {}; return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {}; } catch (e) { return {}; }
}
function writeCache(c) {
    try { fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(c, null, 2), "utf8"); } catch (e) { $.log(`写入缓存失败: ${e.message || e}`); }
}
function parseAccount(raw = "") {
    const [id, remark] = String(raw).split("#").map((s) => (s || "").trim());
    return { openid: id, remark: remark || "" };
}
function short(v, n = 200) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
// 按 openid 派生稳定的 weapp 设备 UUID（不照搬作者设备号）
function deviceUnique(openid) {
    const h = crypto.createHash("md5").update("ole-weapp-" + String(openid)).digest("hex");
    return `weapp-${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}
function traceId() {
    return String(Date.now() * 1000 + Math.floor(Math.random() * 1000));
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.unique = deviceUnique(this.account.openid);
        this.sessionId = "";
        this.oleWxOpenId = "";
        this.shopCode = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    async request(method, apiPath, data, { withSession = true } = {}) {
        const headers = {
            ...COMMON_HEADERS,
            unique: this.unique,
            "Device-Name": "666888",
            traceId: traceId(),
            "user-agent": UA,
            referer: `https://servicewechat.com/${MINI_APP_ID}/100/page-frame.html`,
        };
        if (withSession) {
            headers.sessionId = this.sessionId;
            headers.oleWxOpenId = this.oleWxOpenId;
        }
        const res = await axios.request({
            method,
            url: `${BASE_URL}${apiPath}`,
            headers,
            data: method === "GET" ? undefined : (data || {}),
            timeout: 20000,
            validateStatus: () => true,
        });
        return res.data;
    }
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }
    async login() {
        const code = await this.getCode();
        const res = await this.request("POST", EP_LOGIN, { code }, { withSession: false });
        const okState = Number(res?.state_code) === 200 || res?.success === true;
        const d = (res && res.data) || {};
        const session = d.user_session || d.userSession || d.sessionId || d.session;
        const openId = d.open_id || d.openId || d.oleWxOpenId;
        if (!okState || !session || !openId) {
            const memberId = d.member_id || d.memberId;
            // state_code:200 但无 session/member_id（member_id:null, inquire:"N"）= 该微信号未注册 OLE 会员
            if (okState && !session && (memberId === null || memberId === undefined || d.inquire === "N" || res?.data?.auto_register !== undefined)) {
                this.unregistered = true;
                throw new Error(`NO_ACCOUNT:登录返回无 session/member_id（该微信号未注册 OLE 会员）`);
            }
            throw new Error(`登录失败: ${res?.message || res?.msg || short(res)}`);
        }
        this.sessionId = String(session);
        this.oleWxOpenId = String(openId);
        const cache = readCache();
        cache[this.account.openid] = { sessionId: this.sessionId, oleWxOpenId: this.oleWxOpenId, shop_code: this.shopCode || "", updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    async getShopCode() {
        if (this.shopCode) return this.shopCode;
        const payload = {
            location: LOCATION,
            address_longitude: "", location_name: "", province: "", city: "", district: "",
            address: "", house_number: "", receive_mobile: "", receive_name: "",
            region_name: "", region_id: "", select: false,
        };
        const res = await this.request("POST", EP_SHOP, payload);
        if (Number(res?.state_code) === 200 && res?.data?.shop_code) {
            this.shopCode = String(res.data.shop_code);
            this.log(`门店编码: ${this.shopCode}`);
            const cache = readCache();
            if (cache[this.account.openid]) { cache[this.account.openid].shop_code = this.shopCode; writeCache(cache); }
            return this.shopCode;
        }
        this.log(`获取门店编码失败: ${res?.message || short(res)}`);
        return "";
    }
    async checkSign() {
        return this.request("GET", EP_SIGN, null);
    }
    async doSign() {
        return this.request("POST", EP_SIGN, { enter_shop_code: this.shopCode || "" });
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.sessionId && cached.sessionId && cached.oleWxOpenId) {
            this.sessionId = cached.sessionId;
            this.oleWxOpenId = cached.oleWxOpenId;
            this.shopCode = cached.shop_code || "";
            this.log("使用缓存session");
            return;
        }
        if (!this.sessionId) await this.login();
    }
    // 判断响应是否为会话失效
    static isSessionInvalid(res) {
        const code = Number(res?.state_code);
        const msg = String(res?.message || res?.msg || "");
        if (code === 401 || code === 403) return true;
        return /登录|会话|session|token|未授权|鉴权|失效|过期|请重新/i.test(msg);
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();

            let status = await this.checkSign();
            // 缓存 session 失效 → 重新登录后重查一次
            if (Number(status?.state_code) !== 200 && Task.isSessionInvalid(status)) {
                this.log("session失效，重新登录后重试");
                this.sessionId = ""; this.oleWxOpenId = ""; this.shopCode = "";
                await this.login();
                status = await this.checkSign();
            }
            if (Number(status?.state_code) !== 200 || !status?.data) {
                this.log(`⚠️ 查询签到状态异常（可能未激活会员/接口变动）: ${status?.message || short(status)}`);
                return;
            }

            const info = status.data;
            if (info.sign_of_day === "Y") {
                this.log(`✅ 今日已签到，积分: ${info.total_integral ?? "?"}`);
                return;
            }

            // 未签 → 取门店编码后签到
            await this.getShopCode();
            let res = await this.doSign();

            // 首签失败 → 刷新门店编码后重试1次
            if (Number(res?.state_code) !== 200) {
                this.log(`首次签到失败(${res?.message || short(res)})，刷新门店编码后重试`);
                this.shopCode = "";
                await this.getShopCode();
                res = await this.doSign();
            }

            if (Number(res?.state_code) === 200) {
                const d = res.data || {};
                const gain = d.integral ?? d.add_integral ?? d.point ?? "";
                this.log(`✅ 签到成功${gain !== "" ? `，获得积分 ${gain}` : ""}${d.total_integral !== undefined ? `，累计 ${d.total_integral}` : ""}`);
                return;
            }
            const msg = res?.message || res?.msg || short(res);
            if (/已签|签到过|重复|已完成/.test(String(msg))) { this.log(`✅ 今日已签到（${msg}）`); return; }
            this.log(`❌ 签到失败: ${msg}`);
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在 OLE 注册会员（${String(e.message).replace(/^NO_ACCOUNT:/, "")}），先在小程序里登录注册一次再跑`);
                return;
            }
            this.log(`执行失败: ${e.message || e}`);
        }
    }
}

!(async () => {
    $.checkEnv(ckName);
    if (!$.userCount) { $.log(`未找到变量 ${ckName}`); return; }
    for (let i = 0; i < $.userList.length; i++) {
        await new Task($.userList[i]).run();
        if (i < $.userList.length - 1) await $.wait(1500, 3000);
    }
})().catch((e) => $.log(e.message || e)).finally(() => $.done());
