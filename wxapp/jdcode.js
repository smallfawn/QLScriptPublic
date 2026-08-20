/*
------------------------------------------
@Description: 京东(JDCode) - 微信小程序静默登录 + 采集 JD_COOKIE(pt_key/pt_pin)
cron: 0 0,6,12,18 * * *
------------------------------------------
变量名：jdcode
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx2f5d8f9715c59d10，host wq.jd.com）：
（迁移自 YYB-GO 系脚本 JDCode.py；本质不是签到，而是“京东小程序 code 登录 → 采集 pt_key/pt_pin(=JD_COOKIE)”）

登录  GET https://wq.jd.com/mlogin/wxapp/login_lt
        query: appid=<APPID> & code=<wx.login code> & type=silent & isIgnoreCookie=false ...
        成功(该微信已绑定京东账号)：Set-Cookie 返回 pt_key / pt_pin，body.info.pin 非空
        未绑定：retCode=21 / retMsg="get apppwd failed"，info.pin/skey/unionid 全空，仅返回 sfstoken

⚠️ 该脚本非日常签到脚本，产出物是京东账号会话凭证 JD_COOKIE(pt_key;pt_pin)。
   静默登录仅在“该微信 openid 已绑定京东账号”时才会下发 pt 票据；未绑定时无法凭微信 code 生成。
   绑定/首登需要京东账号(账号密码/短信/passToken) 或 老式 getUserInfo 的 encryptedData+iv
   与同一未消耗 code 做 code2session — smallcat 均无法提供（见文末实测），故对测试号判 blocked。
   APPID 为该小程序固定应用标识（原脚本硬编码，非个人凭证）；pt_key/pt_pin 为每次运行现取，脚本不内置任何个人凭证。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("京东Code采集");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "jdcode";
const MINI_APP_ID = "wx2f5d8f9715c59d10"; // JD_PT_APPID：login_lt 的 appid（须与取 code 的 appid 一致）
const PAGE_VERSION = "873";
const LOGIN_URL = "https://wq.jd.com/mlogin/wxapp/login_lt";
const COOKIE_CACHE_FILE = path.join(__dirname, "jdcode_cookie_cache.json");
const UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) " +
    "Mobile/15E148 MicroMessenger/8.0.49 NetType/WIFI Language/zh_CN miniProgram/" + MINI_APP_ID;

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

function readCache() {
    try { if (!fs.existsSync(COOKIE_CACHE_FILE)) return {}; return JSON.parse(fs.readFileSync(COOKIE_CACHE_FILE, "utf8")) || {}; } catch (e) { return {}; }
}
function writeCache(c) {
    try { fs.writeFileSync(COOKIE_CACHE_FILE, JSON.stringify(c, null, 2), "utf8"); } catch (e) { $.log(`写入缓存失败: ${e.message || e}`); }
}
function parseAccount(raw = "") {
    const [id, remark] = String(raw).split("#").map((s) => (s || "").trim());
    return { openid: id, remark: remark || "" };
}
function short(v, n = 300) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function mask(v) {
    const s = String(v || "");
    return s.length <= 8 ? s.replace(/./g, "*") : `${s.slice(0, 4)}****${s.slice(-4)}`;
}
// 从 Set-Cookie 数组里提取指定 cookie 名的值
function pickCookie(setCookies, name) {
    for (const c of setCookies || []) {
        const m = new RegExp(`(?:^|[;,\\s])${name}=([^;]+)`).exec(String(c));
        if (m) return m[1];
    }
    return "";
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
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
    async loginLt(code) {
        const params = {
            appid: MINI_APP_ID, code, type: "silent", isPopup: "false",
            isIgnoreCookie: "false", isOfficialPin: "false", loginColor: "{}",
            returnUrl: "pages/my/index/index", deviceName: "iPhone", deviceOS: "iOS",
            deviceOSVersion: "17.0", deviceVersion: "8.0.49", g_tk: "0", g_ty: "ls",
        };
        const res = await axios.get(LOGIN_URL, {
            params,
            headers: {
                "User-Agent": UA,
                Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
                Accept: "application/json,text/plain,*/*",
            },
            timeout: 20000, maxRedirects: 0, validateStatus: () => true,
        });
        let body = res.data;
        if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = { raw: body }; } }
        return { status: res.status, setCookies: res.headers["set-cookie"] || [], body: body || {} };
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            const code = await this.getCode();
            const { status, setCookies, body } = await this.loginLt(code);
            const info = (body && body.info) || {};
            const ptKey = pickCookie(setCookies, "pt_key");
            const ptPin = pickCookie(setCookies, "pt_pin") || info.pin || "";

            // 已绑定京东账号：静默登录会下发 pt_key/pt_pin
            if (ptKey && ptPin) {
                const jdCookie = `pt_key=${ptKey};pt_pin=${ptPin};`;
                const cache = readCache();
                cache[this.account.openid] = { pin: ptPin, jdCookie, updatedAt: new Date().toISOString() };
                writeCache(cache);
                this.log(`✅ 采集 JD_COOKIE 成功：pin=${ptPin} pt_key=${mask(ptKey)}（已写入本地缓存 ${path.basename(COOKIE_CACHE_FILE)}）`);
                this.log("   提示：如需同步到青龙 JD_COOKIE，请自行接入青龙 Open API（QL_URL/QL_CLIENT_ID/QL_CLIENT_SECRET）。");
                return;
            }

            // 未绑定京东账号：login_lt 返回 get apppwd failed / pin 为空
            const retMsg = body.retMsg || body.retmsg || "";
            const retCode = body.retCode ?? body.retcode;
            if (String(retMsg).includes("apppwd") || String(retCode) === "21" || (!info.pin && info.pinStatus === 0)) {
                this.log(`⚠️ 该微信未绑定京东账号（login_lt retCode=${retCode} ${retMsg}），无法凭微信 code 静默取得 pt_key/pt_pin。`);
                this.log("   需先在京东小程序内用【京东账号(账号密码/短信/passToken)】登录一次完成绑定，或提供老式 getUserInfo encryptedData（smallcat 无法提供）。此为京东账号红线，判 blocked。");
                return;
            }
            this.log(`❌ login_lt 未返回 pt 票据 (HTTP ${status})：${short(body)}`);
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
