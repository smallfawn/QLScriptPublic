/*
------------------------------------------
@Description: 天机观 - 微信小程序静默登录 + 每日签到
cron: 9 9,14 * * *
------------------------------------------
变量名：tjg
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx7829675630d0305e，host xcx.tianjiguan.cn）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

无签名、无加密：纯 code 换 token，token 走 query(?token=) + 请求头 x-access-token。
登录  POST /api/user/autoLogin   body: code=<code>（application/x-www-form-urlencoded）
        -> code==1，data.token（=后续 token）；code!=1 或无 token = 未注册/失败
用户  GET  /api/user/userinfo?token=<token>  头 x-access-token:<token> -> code==1，data{nickname,mobile,score}
签到  GET  /api/user/sign?token=<token>       头 x-access-token:<token> -> code==1，msg（已签在 msg）
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("天机观签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "tjg";
const MINI_APP_ID = "wx7829675630d0305e";
const BASE_URL = "https://xcx.tianjiguan.cn";
const TOKEN_CACHE_FILE = path.join(__dirname, "tjg_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/api/user/autoLogin";
const EP_USERINFO = "/api/user/userinfo";
const EP_SIGN = "/api/user/sign";

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
function baseHeaders(token) {
    return {
        host: "xcx.tianjiguan.cn",
        "x-access-token": token || "",
        "x-requested-with": "XMLHttpRequest",
        "user-agent": UA,
        xweb_xhr: "1",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        accept: "*/*",
        referer: `https://servicewechat.com/${MINI_APP_ID}/8/page-frame.html`,
        "accept-language": "zh-CN,zh;q=0.9",
    };
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
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }
    async login() {
        const code = await this.getCode();
        const res = await axios.request({
            method: "POST", url: `${BASE_URL}${EP_LOGIN}`,
            data: `code=${encodeURIComponent(code)}`,
            headers: baseHeaders(""),
            timeout: 20000, validateStatus: () => true,
        });
        const d = res.data || {};
        if (Number(d.code) === 1) this.token = String((d.data || {}).token || "");
        if (!this.token) throw new Error(`登录未返回 token（可能未注册）: ${short(d)}`);
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    async getUserInfo() {
        const res = await axios.request({
            method: "GET", url: `${BASE_URL}${EP_USERINFO}`,
            params: { token: this.token },
            headers: baseHeaders(this.token),
            timeout: 15000, validateStatus: () => true,
        });
        return res.data || {};
    }
    async sign(retry = true) {
        const res = await axios.request({
            method: "GET", url: `${BASE_URL}${EP_SIGN}`,
            params: { token: this.token },
            headers: baseHeaders(this.token),
            timeout: 15000, validateStatus: () => true,
        });
        const d = res.data || {};
        if (Number(d.code) === 1) return this.log(`✅ 签到成功：${d.msg || "成功"}`);
        const msg = d.msg || short(d);
        if (/已签|签到过|重复|已完成|明天|已经/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        // 运行态校验：sign/share 这类发奖接口被服务端拦（seeAd/userinfo 正常）——非账号问题、非会话失效
        if (/请求校验失败|重新打开小程序|校验失败/.test(String(msg))) {
            return this.log(`🚫 被天机观运行态校验拦截（${msg}）：发奖接口(sign/share)需小程序运行态校验，服务端脚本无法满足；userinfo/seeAd 正常，账号已注册，非脚本或账号问题`);
        }
        // 精确会话失效（不含裸"重新"，避免误判"请重新打开小程序"）
        if (retry && /请登录后操作|未登录|登录已?过期|登录失效|token失效|未授权|鉴权|401/i.test(String(msg))) {
            this.log("会话失效，重新登录后重试");
            this.token = "";
            await this.login();
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msg}`);
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
            try {
                const ui = await this.getUserInfo();
                if (Number(ui.code) === 1) {
                    const u = ui.data || {};
                    this.log(`用户: ${u.nickname || ""} 积分: ${u.score ?? "?"}`);
                } else if (/token|登录|未授权|失效|过期|未登录|鉴权/i.test(String(ui.msg || ""))) {
                    // 缓存token失效，重登
                    this.token = "";
                    await this.login();
                }
            } catch (e) {}
            await this.sign();
        } catch (e) {
            if (/未返回 token/.test(String(e.message))) { this.log("⚠️ 登录未拿到 token（该微信号可能未注册天机观），先在小程序里登录注册一次再跑"); return; }
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
