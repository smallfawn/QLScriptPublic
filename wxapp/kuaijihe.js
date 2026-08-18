/*
------------------------------------------
@Description: 快集合 - 微信小程序登录 + 每日签到
cron: 52 8 * * *
------------------------------------------
变量名：kuaijihe
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx02092e8c44221583，host exp2.jintaocms.top，所有请求 form 编码）：

登录分两段（第一段只换 openid，第二段才发会话）：
  ① POST /app/Exp/wxappLoginCode   form code=<wx code>
       -> code==1，data.openid（这是站点侧的 openid）
  ② POST /app/Exp/wxappLogin2      form siright=1&open_id=<上面的 openid>
       -> code==1，data.user_id / data.token / data.mobile

签到次数  POST /app/Exp/getUserCheckin  form token&user_id   -> data 就是当前已签次数
签到      POST /app/Exp/useCheckin      form num=<当前次数+1>&token&user_id
          注意 num 不是"第几天"，是"当前次数+1"，所以必须先查再签，不能写死。

token / user_id 都放在 body 里，不是请求头。成功码 code==1，提示在 msg。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("快集合");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "kuaijihe";
const MINI_APP_ID = "wx02092e8c44221583";
const BASE = "https://exp2.jintaocms.top";
const TOKEN_CACHE_FILE = path.join(__dirname, "kuaijihe_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x28003036) MiniProgramEnv/android";

const EP_LOGIN_CODE = "/app/Exp/wxappLoginCode";
const EP_LOGIN2 = "/app/Exp/wxappLogin2";
const EP_CHECKIN_NUM = "/app/Exp/getUserCheckin";
const EP_CHECKIN = "/app/Exp/useCheckin";

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

function short(v, n = 200) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}

function form(obj) {
    return Object.entries(obj)
        .map(([k, v]) => `${k}=${encodeURIComponent(v === undefined || v === null ? "" : v)}`)
        .join("&");
}

function maskPhone(p = "") {
    return String(p).replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

const isOk = (res) => Number(res?.code) === 1;
const msgOf = (res) => res?.msg || res?.message || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isAuthError = (t) => /登录|token|未授权|未登录|失效|过期|重新/i.test(String(t || ""));
const isNotRegistered = (t) => /未注册|未绑定|请先注册|请先绑定|not regist/i.test(String(t || ""));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.userId = "";
        this.mobile = "";
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    async request(apiPath, body = {}) {
        const res = await axios.request({
            method: "POST",
            url: `${BASE}${apiPath}`,
            data: form(body),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
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
        const first = await this.request(EP_LOGIN_CODE, { code });
        if (!isOk(first)) throw new Error(`换取 openid 失败: ${msgOf(first)}`);
        const siteOpenid = (first.data || {}).openid;
        if (!siteOpenid) throw new Error(`第一段登录没返回 openid: ${short(first)}`);

        const second = await this.request(EP_LOGIN2, { siright: 1, open_id: siteOpenid });
        if (!isOk(second)) throw new Error(`登录失败: ${msgOf(second)}`);
        const d = second.data || {};
        this.token = String(d.token || "");
        this.userId = String(d.user_id || "");
        this.mobile = String(d.mobile || "");
        if (!this.token || !this.userId) throw new Error(`登录未返回 token/user_id: ${short(second)}`);

        const cache = readCache();
        cache[this.account.openid] = {
            token: this.token, userId: this.userId, mobile: this.mobile,
            updatedAt: new Date().toISOString(),
        };
        writeCache(cache);
        this.log(`登录成功${this.mobile ? `: ${maskPhone(this.mobile)}` : ""}`);
    }

    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token && cached.userId) {
            this.token = cached.token;
            this.userId = cached.userId;
            this.mobile = cached.mobile || "";
            if ((await this.signCount(false)) !== null) {
                this.log("使用缓存会话");
                return;
            }
            this.log("缓存会话失效，重新登录");
            this.token = "";
        }
        if (!this.token) await this.login();
    }

    /** 返回当前已签次数；读不到返回 null（用来判断会话是否还活着） */
    async signCount(needLog = true) {
        const res = await this.request(EP_CHECKIN_NUM, { token: this.token, user_id: this.userId });
        if (!isOk(res)) {
            if (needLog) this.log(`读取签到次数失败: ${msgOf(res)}`);
            return null;
        }
        const n = Number(res.data ?? 0);
        if (needLog) this.log(`当前已签 ${Number.isNaN(n) ? 0 : n} 次`);
        return Number.isNaN(n) ? 0 : n;
    }

    async sign(retry = true) {
        const count = await this.signCount();
        if (count === null) {
            this.log("❌ 签到跳过：拿不到当前签到次数（num 依赖它，不能写死）");
            return;
        }
        const res = await this.request(EP_CHECKIN, {
            num: count + 1,
            token: this.token,
            user_id: this.userId,
        });
        if (isOk(res)) {
            const d = res.data || {};
            const gain = d.points ?? d.score ?? d.integral ?? "";
            this.log(`✅ 签到成功${gain !== "" ? `: +${gain}` : ""}`);
            return;
        }
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        if (isNotRegistered(msgOf(res))) {
            return this.log(`⚠️ ${msgOf(res)} —— 该微信号还没在快集合注册，先在小程序里注册一次再跑`);
        }
        if (retry && isAuthError(msgOf(res))) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
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
