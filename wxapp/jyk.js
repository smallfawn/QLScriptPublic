/*
------------------------------------------
@Description: 旧衣客(JYK) - 微信小程序静默登录 + 每日签到
cron: 22 9 * * *
------------------------------------------
变量名：jyk
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx3f0209cc35a953a4，host jyk.scjyx.com）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

登录  POST /api/index/get_openid {code, pid:"", device_info:"android_MEIZU_22_370"}
        -> errno==0，data.access_token；头 Authorization: Bearer <token> + X-Payconfig-Id:2
状态  GET /api/checkin/home -> data.{enabled, today_signed, can_sign}
签到  ① POST /api/checkin/prepare -> data.ad_token
      ② POST /api/checkin/sign {ad_token} -> errno==0 成功
响应壳：{errno:0, data}；errno!=0 视为失败/未开启。只做普通签到，不做广告签到。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("旧衣客签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "jyk";
const MINI_APP_ID = "wx3f0209cc35a953a4";
const TARGET_VERSION = "68";
const BASE_URL = "https://jyk.scjyx.com";
const PAYCONFIG_ID = "2";
const PID = "";
const DEVICE_INFO = "android_MEIZU_22_370";
const TOKEN_CACHE_FILE = path.join(__dirname, "jyk_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 " +
    "Chrome/107.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.5 MiniProgramEnv/android";

const EP_LOGIN = "/api/index/get_openid";
const EP_HOME = "/api/checkin/home";
const EP_PREPARE = "/api/checkin/prepare";
const EP_SIGN = "/api/checkin/sign";

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

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    headers() {
        const h = {
            "content-type": "application/json",
            "X-Payconfig-Id": PAYCONFIG_ID,
            Referer: `https://servicewechat.com/${MINI_APP_ID}/${TARGET_VERSION}/page-frame.html`,
            "User-Agent": USER_AGENT,
        };
        if (this.token) h.Authorization = `Bearer ${this.token}`;
        return h;
    }
    async request(method, apiPath, payload) {
        const res = await axios.request({
            method,
            url: `${BASE_URL}${apiPath}`,
            data: method === "POST" ? payload || {} : undefined,
            headers: this.headers(),
            timeout: 20000,
            validateStatus: () => true,
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
        const res = await this.request("POST", EP_LOGIN, { code, pid: PID, device_info: DEVICE_INFO });
        if (Number(res?.errno) !== 0) throw new Error(`登录失败: ${res?.errmsg || res?.msg || short(res)}`);
        const info = res.data || {};
        this.token = String(info.access_token || "");
        if (!this.token) throw new Error(`登录未返回 access_token: ${short(res)}`);
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    async home() {
        const res = await this.request("GET", EP_HOME);
        if (Number(res?.errno) !== 0) throw new Error(`home失败: ${res?.errmsg || short(res)}`);
        return res.data || {};
    }
    async prepareAndSign() {
        const prepared = await this.request("POST", EP_PREPARE);
        if (Number(prepared?.errno) !== 0) return this.log(`❌ 普通签到 prepare 失败: ${short(prepared)}`);
        const adToken = String((prepared.data || {}).ad_token || "");
        if (!adToken) return this.log("❌ 普通签到 prepare 未返回 ad_token");
        const signed = await this.request("POST", EP_SIGN, { ad_token: adToken });
        if (Number(signed?.errno) === 0) {
            const d = signed.data || {};
            return this.log(`✅ 签到成功${d.score !== undefined ? `，获得 ${d.score} 积分` : ""}${d.integral !== undefined ? `，积分 ${d.integral}` : ""}`);
        }
        if (/已签|签到过|重复|已完成/.test(String(signed?.errmsg || signed?.msg || ""))) return this.log(`✅ 今日已签到（${signed.errmsg || signed.msg}）`);
        this.log(`❌ 签到失败: ${signed?.errmsg || signed?.msg || short(signed)}`);
    }
    async sign() {
        let home;
        try {
            home = await this.home();
        } catch (e) {
            if (/token|登录|未授权|失效|过期|401/i.test(String(e.message))) {
                this.token = "";
                await this.login();
                home = await this.home();
            } else throw e;
        }
        if (!home.enabled) return this.log("普通签到未开启");
        if (home.today_signed || !home.can_sign) return this.log("✅ 今日已签到或不可签");
        await this.prepareAndSign();
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
            await this.sign();
        } catch (e) {
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
