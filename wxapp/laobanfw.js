/*
------------------------------------------
@Description: 老板服务微商城 - 微信小程序登录 + 每日签到
cron: 46 8 * * *
------------------------------------------
变量名：laobanfw
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxc8c90950cf4546f6，host vip.foxech.com，base /index.php/api）：

每个请求的 body 里都要带一对 timestamp + token，token 是**请求签名**：
    timestamp = 毫秒
    token     = md5(String(timestamp) + "ae1fd50f" + 站点openid)
  注意：这里的 "token" 不是会话凭证，而是每次请求现算的签名；
        真正的会话身份是站点自己发的 openid（登录时拿到，之后每个请求都要带）。
        登录那一次 openid 还没有，按源码就是拼空串参与 md5。

登录  POST /common/get_openid
        {timestamp, openid:"", seat_code:"", code, invite_code:"", sinvite_code:"", token}
        -> code==200，站点 openid 在 data.userinfo.openid
资料  POST /member/get_member_info   {timestamp, openid, seat_code:"", token}
签到  POST /member/user_sign         {timestamp, openid, seat_code:"", token}

成功码是 code==200，提示在 msg。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("老板服务微商城");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "laobanfw";
const MINI_APP_ID = "wxc8c90950cf4546f6";
const BASE = "https://vip.foxech.com/index.php/api";
const SALT = "ae1fd50f";
const TOKEN_CACHE_FILE = path.join(__dirname, "laobanfw_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x28003036) MiniProgramEnv/android";

const EP_LOGIN = "/common/get_openid";
const EP_USER = "/member/get_member_info";
const EP_SIGN = "/member/user_sign";

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

function readCache() {
    try {
        if (!fs.existsSync(TOKEN_CACHE_FILE)) return {};
        return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {};
    } catch (e) {
        return {};
    }
}

function writeCache(cache) {
    try {
        fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
    } catch (e) {
        $.log(`写入token缓存失败: ${e.message || e}`);
    }
}

function parseAccount(raw = "") {
    const [id, remark] = String(raw).split("#").map((s) => (s || "").trim());
    return { openid: id, remark: remark || "" };
}

function short(v, n = 220) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}

const md5 = (s) => crypto.createHash("md5").update(String(s), "utf8").digest("hex");
const isOk = (res) => Number(res?.code) === 200;
const msgOf = (res) => res?.msg || res?.message || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isAuthError = (t) => /登录|授权|openid|未登录|失效|过期|重新/i.test(String(t || ""));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.siteOpenid = "";
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    /** 按源码顺序补 timestamp 再算签名：md5(timestamp + salt + openid) */
    signed(extra = {}) {
        const payload = { openid: this.siteOpenid || "", seat_code: "", ...extra };
        payload.timestamp = Date.now();
        payload.token = md5(`${payload.timestamp}${SALT}${payload.openid || ""}`);
        return payload;
    }

    async request(apiPath, payload) {
        const res = await axios.request({
            method: "POST",
            url: `${BASE}${apiPath}`,
            data: payload,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json, text/plain, */*",
                "User-Agent": USER_AGENT,
                Referer: `https://servicewechat.com/${MINI_APP_ID}/0/page-frame.html`,
                xweb_xhr: "1",
            },
            timeout: 20000,
            validateStatus: () => true,
        });
        if (res.status !== 200) throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        return res.data;
    }

    /** wcs.getCode 在 status:false 时也 resolve，必须自己判失败，否则取码限流会被误报成登录失败 */
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) {
            throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        }
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }

    async login() {
        const code = await this.getCode();
        this.siteOpenid = "";   // 登录那次签名用空 openid，照源码
        const res = await this.request(EP_LOGIN, this.signed({ code, invite_code: "", sinvite_code: "" }));
        if (!isOk(res)) throw new Error(`登录失败: ${msgOf(res)}`);
        const openid = ((res.data || {}).userinfo || {}).openid || (res.data || {}).openid || "";
        if (!openid) throw new Error(`登录未返回站点 openid: ${short(res)}`);
        this.siteOpenid = String(openid);
        const cache = readCache();
        cache[this.account.openid] = { siteOpenid: this.siteOpenid, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }

    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.siteOpenid && cached.siteOpenid) {
            this.siteOpenid = cached.siteOpenid;
            if (await this.queryUser(false)) {
                this.log("使用缓存会话");
                return;
            }
            this.log("缓存会话失效，重新登录");
            this.siteOpenid = "";
        }
        if (!this.siteOpenid) await this.login();
    }

    async queryUser(needLog = true) {
        const res = await this.request(EP_USER, this.signed());
        if (!isOk(res)) {
            if (needLog) this.log(`读取会员信息失败: ${msgOf(res)}`);
            return false;
        }
        const d = res.data || {};
        // 会员字段是套在 data.info 里的（data 顶层是 times / level_icon 这类展示字段）
        const info = d.info || d.userinfo || d.member || d;
        if (needLog) {
            const bits = [];
            for (const k of ["nickname", "nickName", "mobile", "score", "integral", "points", "balance", "money"]) {
                if (info && info[k] !== undefined && info[k] !== null && info[k] !== "") bits.push(`${k}=${info[k]}`);
            }
            if (d.times !== undefined) bits.push(`签到次数=${d.times}`);
            this.log(`会员: ${bits.join(" ") || short(info, 120)}`);
        }
        return true;
    }

    async sign(retry = true) {
        const res = await this.request(EP_SIGN, this.signed());
        if (isOk(res)) {
            const d = res.data || {};
            const gain = d.score ?? d.add_score ?? d.integral ?? "";
            this.log(`✅ 签到成功${gain !== "" ? `: +${gain}` : ""}`);
            return;
        }
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        if (retry && isAuthError(msgOf(res))) {
            this.log("会话失效，重新登录后重试");
            this.siteOpenid = "";
            await this.login();
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msgOf(res)}`);
    }

    async run() {
        if (!this.account.openid) {
            this.log("跳过：变量值里没有 openid");
            return;
        }
        try {
            await this.ensureLogin();
            await this.queryUser();
            await this.sign();
        } catch (e) {
            this.log(`执行失败: ${e.message || e}`);
        }
    }
}

!(async () => {
    $.checkEnv(ckName);
    if (!$.userCount) {
        $.log(`未找到变量 ${ckName}`);
        return;
    }
    for (let i = 0; i < $.userList.length; i++) {
        await new Task($.userList[i]).run();
        if (i < $.userList.length - 1) await $.wait(1500, 3000);
    }
})()
    .catch((e) => $.log(e.message || e))
    .finally(() => $.done());
