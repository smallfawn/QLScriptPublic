/*
------------------------------------------
@Description: 微信支付-提现笔笔省 - 微信小程序静默登录 + 每日领券(提现免费券)
cron: 12 11 * * *
------------------------------------------
变量名：wxzf
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxdb3c0e388702f785，host discount.wxpapp.wechatpay.cn）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录；登录用 wx.login code 放 jscode 头，GET）

登录  GET  /txbbs-user/user/login          头 jscode:<code>
        -> errcode==0，data.session_token（=后续 Session-Token 头）
余额  GET  /txbbs-mall/cashoutfree/getbalance   头 Session-Token
        -> errcode==0，data.balance(分，//100=元 提现免费券)
列券  GET  /txbbs-mall/gift/listgifts?longitude=0&latitude=0
        -> errcode==0，data.gift_info_list
领券  POST /txbbs-mall/gift/redeemgift     {gift_id}
        -> errcode==0（仅领 gift_type==GT_COUPON 且 gift_status==GS_AVAILABLE）
本程序无 daily-sign 端点，每日动作为“领取可用的提现免费券”。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("提现笔笔省领券");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "wxzf";
const MINI_APP_ID = "wxdb3c0e388702f785";
const HOST = "discount.wxpapp.wechatpay.cn";
const BASE = `https://${HOST}`;
const TOKEN_CACHE_FILE = path.join(__dirname, "wxzf_token_cache.json");
const UA =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 XWEB/1340129 MMWEBSDK/20240301 MMWEBID/9871 " +
    "MicroMessenger/8.0.48.2580(0x28003036) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android";

const EP_LOGIN = "/txbbs-user/user/login";
const EP_BALANCE = "/txbbs-mall/cashoutfree/getbalance";
const EP_GIFTS = "/txbbs-mall/gift/listgifts?longitude=0&latitude=0";
const EP_REDEEM = "/txbbs-mall/gift/redeemgift";

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
function short(v, n = 300) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
// 成功码：优先 errcode，再兜底其它常见壳
function okCode(res) {
    if (!res || typeof res !== "object") return false;
    for (const k of ["errcode", "code", "errno", "ret", "resultCode", "status"]) {
        if (res[k] !== undefined && res[k] !== null) {
            const v = res[k];
            if (v === 0 || v === "0" || v === 200 || v === "200" || v === true || v === "success") return true;
            return false; // 该壳存在但非成功
        }
    }
    return false;
}
function msgOf(res) {
    if (!res || typeof res !== "object") return short(res);
    return res.msg || res.message || res.errmsg || res.retInfo || res.error || short(res);
}
const NEED_REGISTER = /未注册|未激活|未绑定|请先|去授权|去登录|授权|绑定手机|实名|开通/;
const TOKEN_INVALID = /token|登录|未授权|失效|过期|未登录|鉴权|请重新|401|session/i;

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    async request(method, apiPath, { body, jscode } = {}) {
        const headers = {
            Host: HOST, authority: HOST, "User-Agent": UA, Accept: "*/*",
            "Content-Type": "application/json", xweb_xhr: "1",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/1/page-frame.html`,
        };
        if (jscode) headers.jscode = jscode;
        if (this.token) headers["Session-Token"] = this.token;
        const res = await axios.request({
            method, url: `${BASE}${apiPath}`, data: method === "POST" ? (body || {}) : undefined,
            headers, timeout: 20000, validateStatus: () => true,
        });
        if (res.status !== 200) {
            if (res.data && typeof res.data === "object") return res.data;
            throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        }
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
        const res = await this.request("GET", EP_LOGIN, { jscode: code });
        if (!okCode(res)) {
            const msg = msgOf(res);
            if (NEED_REGISTER.test(String(msg))) { this.unregistered = true; throw new Error(`NO_ACCOUNT:${msg}`); }
            throw new Error(`登录失败: ${msg}`);
        }
        const d = res.data || {};
        this.token = String(d.session_token || d.sessionToken || d.token || "");
        if (!this.token) {
            // errcode==0 但无 token：常见为未注册/需在小程序内先授权
            this.unregistered = true;
            throw new Error(`NO_ACCOUNT:登录成功但未返回 session_token（${short(res)}）`);
        }
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    async getBalance() {
        const res = await this.request("GET", EP_BALANCE);
        if (okCode(res)) return { ok: true, yuan: Math.floor(Number((res.data || {}).balance || 0) / 100), raw: res };
        return { ok: false, msg: msgOf(res), raw: res };
    }
    async listGifts() {
        const res = await this.request("GET", EP_GIFTS);
        if (okCode(res)) return { ok: true, gifts: (res.data || {}).gift_info_list || [], raw: res };
        return { ok: false, msg: msgOf(res), raw: res };
    }
    async redeem(giftId) {
        const res = await this.request("POST", EP_REDEEM, { body: { gift_id: giftId } });
        if (okCode(res)) {
            const info = (res.data || {}).gift_info || {};
            const name = (info.coupon_info || {}).name || info.name || "优惠券";
            return { ok: true, name };
        }
        return { ok: false, msg: msgOf(res) };
    }
    // 每日动作：查余额 -> 领可用券 -> 再查余额
    async doTask(retry = true) {
        // 1) 余额（同时校验 token 是否有效）
        let bal = await this.getBalance();
        if (!bal.ok) {
            if (retry && TOKEN_INVALID.test(String(bal.msg))) {
                this.log("会话失效，重新登录后重试");
                this.token = "";
                const cache = readCache(); delete cache[this.account.openid]; writeCache(cache);
                await this.login();
                return this.doTask(false);
            }
            if (NEED_REGISTER.test(String(bal.msg))) { this.log(`⚠️ 未注册/未激活（${bal.msg}）`); this.unregistered = true; return; }
            this.log(`❌ 查询余额失败: ${bal.msg}`);
            return;
        }
        this.log(`当前提现免费券余额: ${bal.yuan} 元`);

        // 2) 列券并领取可用券
        const gl = await this.listGifts();
        if (!gl.ok) { this.log(`❌ 获取券列表失败: ${gl.msg}`); return; }
        const avail = gl.gifts.filter((g) => g && g.gift_type === "GT_COUPON" && g.gift_status === "GS_AVAILABLE");
        if (!avail.length) {
            this.log(`✅ 今日无可领取的提现免费券（共 ${gl.gifts.length} 项，均已领/不可领）`);
        } else {
            let got = 0;
            for (const g of avail) {
                const r = await this.redeem(g.gift_id);
                if (r.ok) { got++; this.log(`✅ 领取成功: ${r.name}`); }
                else this.log(`❌ 领取失败(${g.gift_id}): ${r.msg}`);
                await $.wait(1500, 2500);
            }
            this.log(got ? `✅ 本次共领取 ${got} 张提现免费券` : "❌ 可领券均领取失败");
        }

        // 3) 再查余额
        const bal2 = await this.getBalance();
        if (bal2.ok) this.log(`领取后提现免费券余额: ${bal2.yuan} 元`);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) { this.token = cached.token; this.log("使用缓存token"); return; }
        if (!this.token) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.doTask();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在“提现笔笔省”注册/激活，先在小程序里打开授权一次再跑（${String(e.message).replace(/^NO_ACCOUNT:/, "")}）`);
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
