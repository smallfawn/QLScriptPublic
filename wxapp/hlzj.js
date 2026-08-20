/*
------------------------------------------
@Description: 海澜之家(种树游戏) - 微信小程序静默登录 + 每日签到
cron: 20 8 * * *
------------------------------------------
变量名：hlzj
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
hlzj_invite    可选，authorized-login 的 invite_user_id（邀请人），默认空
------------------------------------------
契约（appid wx315431cc3b5e930f，业务 gmdevpro.hlzjppgl.cn）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

签名(POST 体)：body 加 {nonce(20位混合),timestamp(ms字符串),
  sign = md5("ff"+nonce+"nn"+timestamp+userId+"mm")}；userId=登录拿到的游戏用户id，登录时为空
换unionId  POST https://wxa-tp.ezrpro.com/myvip/Base/User/WxAppOnLoginNew
             body {code(smallcat新鲜code,仅此一次code2session),CommonIdType:"",CommonId:"",
                   ShopId:0,CommonIdSource:0,Latitude:0,Longitude:0,PingId,PingDate}
             头 ezr-sp:2 / ezr-source:weapp / ezr-brand-id:5896 / ezr-client-name / Referer
             -> Success==true，Result.UnionId（服务端做的 code->session，非老式encryptedData解密）
登录  POST /server/api/authorized-login {union_id,invite_user_id}(带签名,头不带token)
        -> code==200，data.token / data.user_info.id(=userId) / data.user_info.tree_id
状态  POST /server/api/day-list {} 头 Authorization:Bearer -> code==200，data.day_sign_status(true=已签)
签到  POST /server/api/day-sign  {} -> code==200，data.water_num / data.day_sign_list.day_num
额外  POST /server/api/user/get-today-water {}（每日电力奖励，best-effort 非致命）
ezr-brand-id、CONVERT_URL、BASE_URL 均为该小程序固定应用常量（非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("海澜之家签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "hlzj";
const MINI_APP_ID = "wx315431cc3b5e930f";
const EZR_BRAND_ID = "5896";
const CONVERT_URL = "https://wxa-tp.ezrpro.com/myvip/Base/User/WxAppOnLoginNew";
const CONVERT_HOST = "wxa-tp.ezrpro.com";
const BASE_URL = "https://gmdevpro.hlzjppgl.cn";
const BIZ_HOST = "gmdevpro.hlzjppgl.cn";
const INVITE_ID = process.env.hlzj_invite || "";
const TOKEN_CACHE_FILE = path.join(__dirname, "hlzj_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/server/api/authorized-login";
const EP_DAY_LIST = "/server/api/day-list";
const EP_DAY_SIGN = "/server/api/day-sign";
const EP_TODAY_WATER = "/server/api/user/get-today-water";

const SIGNATURE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

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
function short(v, n = 220) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function md5(str) {
    return crypto.createHash("md5").update(String(str), "utf8").digest("hex");
}
function randChars(len) {
    let s = "";
    for (let i = 0; i < len; i++) s += SIGNATURE_CHARS[Math.floor(Math.random() * SIGNATURE_CHARS.length)];
    return s;
}
function getPingDate() {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
// 业务签名体：md5("ff"+nonce+"nn"+timestamp+userId+"mm")
function createSignedBody(data, userId) {
    const nonce = randChars(20);
    const timestamp = Date.now().toString();
    return { ...data, nonce, timestamp, sign: md5(`ff${nonce}nn${timestamp}${userId || ""}mm`) };
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.unionId = "";
        this.userId = "";
        this.treeId = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }
    // 用新鲜 code 走厂商服务端 code->session 换取 unionId（非老式 encryptedData 解密）
    async convertCodeToUnion(code) {
        const headers = {
            Host: CONVERT_HOST,
            "Content-Type": "application/json",
            "ezr-sp": "2",
            "ezr-source": "weapp",
            "ezr-brand-id": EZR_BRAND_ID,
            "uber-trace-id": `${randChars(16)}:${randChars(16)}:0:1`,
            "ezr-client-name": "EZR.FE.MultiMall.Mini",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/38/page-frame.html`,
            "User-Agent": UA,
            "Accept-Encoding": "gzip, deflate, br",
            charset: "utf-8",
        };
        const payload = {
            code, CommonIdType: "", CommonId: "", ShopId: 0, CommonIdSource: 0,
            Latitude: 0, Longitude: 0, PingId: randChars(32), PingDate: getPingDate(),
        };
        const res = await axios.request({ method: "POST", url: CONVERT_URL, data: payload, headers, timeout: 20000, validateStatus: () => true });
        const data = res.data || {};
        if (!data.Success) throw new Error(`code换unionId失败: ${data.Msg || short(data)}`);
        const r = data.Result || {};
        if (!r.UnionId) throw new Error(`code换unionId未返回UnionId: ${short(data)}`);
        return String(r.UnionId);
    }
    async bizRequest(apiPath, bodyData = {}, { delToken = false } = {}) {
        const headers = {
            Host: BIZ_HOST,
            "Content-Type": "application/json",
            Accept: "*/*",
            Origin: BASE_URL,
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "User-Agent": UA,
            Referer: `https://servicewechat.com/${MINI_APP_ID}/38/page-frame.html`,
        };
        if (!delToken && this.token) headers.Authorization = `Bearer ${this.token}`;
        const data = createSignedBody(bodyData, this.userId || "");
        const res = await axios.request({ method: "POST", url: `${BASE_URL}${apiPath}`, data, headers, timeout: 20000, validateStatus: () => true });
        return res.data || {};
    }
    isAuthErr(resp) {
        const code = Number(resp && resp.code);
        const msg = String((resp && (resp.message || resp.msg)) || "");
        if ([309, 401, 403, 4001, 4003].includes(code)) return true;
        return /token|登录|未授权|失效|过期|未登录|鉴权|授权|会话/i.test(msg);
    }
    // day-sign 门禁：登录只拿到游客身份，未注册商城会员/未绑定手机号则签不了
    isUnregistered(msg) {
        return /未注册.*会员|注册商城会员|绑定手机号|未绑定手机|未激活|请先.*绑定|请先.*注册/.test(String(msg));
    }
    async login() {
        const code = await this.getCode();
        this.unionId = await this.convertCodeToUnion(code);
        this.log(`换取 unionId 成功: ${this.unionId.slice(0, 6)}...`);
        this.userId = ""; // 登录请求以空 userId 签名
        const res = await this.bizRequest(EP_LOGIN, { union_id: this.unionId, invite_user_id: INVITE_ID }, { delToken: true });
        if (Number(res.code) !== 200) {
            const msg = res.message || res.msg || short(res);
            if (/注册|未激活|会员|绑定/.test(String(msg))) { this.unregistered = true; throw new Error(`NO_ACCOUNT:${msg}`); }
            throw new Error(`授权登录失败: ${msg}`);
        }
        const d = res.data || {};
        const info = d.user_info || {};
        this.token = String(d.token || "");
        this.userId = info.id !== undefined && info.id !== null ? String(info.id) : "";
        this.treeId = info.tree_id !== undefined && info.tree_id !== null ? String(info.tree_id) : "";
        if (!this.token || !this.userId) throw new Error(`授权登录未返回token/userId: ${short(res)}`);
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, unionId: this.unionId, userId: this.userId, treeId: this.treeId, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${info.nick_name ? `（${info.nick_name}）` : ""}`);
    }
    async claimWater() {
        // 每日电力奖励，best-effort，不影响签到判定
        try {
            const res = await this.bizRequest(EP_TODAY_WATER, {});
            if (Number(res.code) === 200 && res.data) {
                this.log(`🎁 已领取今日电力：${res.data.get_water ?? "?"}`);
            }
        } catch (e) { /* ignore */ }
    }
    async sign(retry = true) {
        const list = await this.bizRequest(EP_DAY_LIST, {});
        if (Number(list.code) === 200) {
            if (list.data && list.data.day_sign_status) {
                await this.claimWater();
                return this.log("✅ 今日已签到");
            }
        } else if (this.isUnregistered(list.message || list.msg)) {
            this.unregistered = true;
            throw new Error(`NO_ACCOUNT:${list.message || list.msg}`);
        } else if (retry && this.isAuthErr(list)) {
            this.log("会话失效，重新登录后重试");
            this.token = ""; this.userId = "";
            await this.login();
            return this.sign(false);
        } else if (Number(list.code) !== 200) {
            this.log(`day-list 返回异常，仍尝试签到: ${short(list)}`);
        }

        const res = await this.bizRequest(EP_DAY_SIGN, {});
        if (Number(res.code) === 200) {
            const d = res.data || {};
            const days = (d.day_sign_list && d.day_sign_list.day_num) ?? "?";
            await this.claimWater();
            return this.log(`✅ 签到成功，电力+${d.water_num ?? "?"}，已连续签到 ${days} 天`);
        }
        const msg = res.message || res.msg || short(res);
        if (/已签|签到过|重复|已完成/.test(String(msg))) { await this.claimWater(); return this.log(`✅ 今日已签到（${msg}）`); }
        if (this.isUnregistered(msg)) { this.unregistered = true; throw new Error(`NO_ACCOUNT:${msg}`); }
        if (retry && this.isAuthErr(res)) {
            this.log("会话失效，重新登录后重试");
            this.token = ""; this.userId = "";
            await this.login();
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msg}`);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            this.unionId = cached.unionId || "";
            this.userId = cached.userId || "";
            this.treeId = cached.treeId || "";
            this.log("使用缓存token");
            return;
        }
        if (!this.token) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在海澜之家注册/激活（${String(e.message).replace(/^NO_ACCOUNT:/, "")}），先在小程序里登录一次再跑`);
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
