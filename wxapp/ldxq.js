/*
------------------------------------------
@Description: 绿动新球 - 微信小程序静默登录 + 每日签到
cron: 15 8 * * *
------------------------------------------
变量名：ldxq
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxa61a45f180dec800，host lvdong.fzjingzhou.com）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录；鉴权用 token，放在每个请求 body 里）
请求体均为 application/x-www-form-urlencoded；无签名。

登录  POST /api/login/getWxMiniProgramSessionKey  {code, gdtVid:"", token:""}
        -> code==1000，data.token（=后续 token）
签到  POST /api/Person/sign  {token}
        -> code==1000 签到成功（msg 里带“签到成功/已签到”）；code==1001 视为已签/成功
资料  POST /api/Person/index  {token}
        -> code==1000，data.nickname / data.score
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("绿动新球签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "ldxq";
const MINI_APP_ID = "wxa61a45f180dec800";
const API_HOST = "lvdong.fzjingzhou.com";
const BASE = `https://${API_HOST}`;
const TOKEN_CACHE_FILE = path.join(__dirname, "ldxq_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/api/login/getWxMiniProgramSessionKey";
const EP_SIGN = "/api/Person/sign";
const EP_USERINFO = "/api/Person/index";

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
function short(v, n = 240) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function formEncode(obj) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(obj || {})) p.append(k, v == null ? "" : String(v));
    return p.toString();
}

const isAlreadyDone = (t) => /已签|已经签|签到过|重复|今日已|已完成|already/i.test(String(t || ""));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    async request(apiPath, body) {
        const res = await axios.request({
            method: "POST", url: `${BASE}${apiPath}`, data: formEncode(body),
            headers: {
                Host: API_HOST, "Content-Type": "application/x-www-form-urlencoded",
                Platform: "MP-WEIXIN", "User-Agent": UA, xweb_xhr: "1", Accept: "*/*",
                "Accept-Language": "zh-CN,zh;q=0.9",
                Referer: `https://servicewechat.com/${MINI_APP_ID}/4/page-frame.html`,
            },
            timeout: 20000, validateStatus: () => true,
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
        const res = await this.request(EP_LOGIN, { code, gdtVid: "", token: "" });
        const d = (res && typeof res.data === "object") ? res.data : {};
        const token = d.token || (res || {}).token;
        if (Number(res?.code) === 1000 && token) {
            this.token = String(token);
            const cache = readCache();
            cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
            writeCache(cache);
            this.log("登录成功");
            return;
        }
        const msg = res?.msg || res?.message || short(res);
        // code==1000 但 token/data 为空：code2session 被服务端接受，但该 openid 未注册/绑定会员，未下发 token
        if (Number(res?.code) === 1000 && !token) throw new Error("NO_ACCOUNT:服务端已接受 code(code=1000) 但未下发 token，该微信号未注册绿动新球会员");
        if (/未注册|未绑定|未激活|请先|注册/.test(String(msg))) throw new Error(`NO_ACCOUNT:${msg}`);
        throw new Error(`登录失败: ${msg}`);
    }
    async userInfo() {
        try {
            const res = await this.request(EP_USERINFO, { token: this.token });
            if (Number(res?.code) === 1000) {
                const d = res.data || {};
                this.log(`👤 昵称:${d.nickname ?? "-"}，积分:${d.score ?? "-"}`);
            }
        } catch (e) { /* 资料失败不影响签到 */ }
    }
    async sign(retry = true) {
        const res = await this.request(EP_SIGN, { token: this.token });
        const code = Number(res?.code);
        const msg = res?.msg || res?.message || short(res);
        if (code === 1000) {
            if (isAlreadyDone(msg)) return this.log(`✅ 今日已签到（${msg}）`);
            return this.log(`✅ 签到成功（${msg}）`);
        }
        if (code === 1001 || isAlreadyDone(msg)) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && /token|登录|未授权|失效|过期|未登录|鉴权|重新登录/i.test(String(msg))) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msg}（code:${res?.code}）`);
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
            await this.userInfo();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在绿动新球注册/绑定，先在小程序里登录一次再跑（${String(e.message).slice(10)}）`);
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
