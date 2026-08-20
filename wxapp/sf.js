/*
------------------------------------------
@Description: 顺丰速运 - 微信小程序静默登录 + 每日签到（自动签到领包）
cron: 20 8 * * *
------------------------------------------
变量名：sf
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（迁移自 YYB-GO 顺丰 Python，纯服务端可完成）：
  小程序 appid = wxd4185d00bf7e08ac，publicId(原始ID) = gh_f9d9fca26a50
  1) 取 wx code：wx_server /wx/code（appid=小程序）
  2) UCMP 登录：GET https://ucmp.sf-express.com/wxaccess/weixin/appOnLogin?code=<code>&publicId=<publicId>
        -> JSON {sessionId, openid}（顺丰服务端做 code2session，无需明文 openid/手机号）
  3) 换绑补全业务 Cookie：GET .../wechat-act/weixin/activity/sfnewactivity?...&suuid=<sessionId>
        跟随重定向，收集 Cookie：sessionId / _login_mobile_ / _login_user_id_
        （拿不到 _login_mobile_/_login_user_id_ = 该微信号未注册/未绑定顺丰会员）
  4) 每日签到：POST https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/
        ~memberNonactivity~integralTaskSignPlusService~automaticSignFetchPackage
        body {comeFrom:"vioin", channelFrom:"WEIXIN"}
  业务签名（每个 mcs-mimp 请求头）：
        signature = md5(`token=${TOKEN}&timestamp=${ms}&sysCode=${SYS_CODE}`)
        头 {syscode:SYS_CODE, timestamp, signature}
        TOKEN=wwesldfs29aniversaryvdld29  SYS_CODE=MCS-MIMP-CORE （应用级固定常量，非个人凭证）
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("顺丰速运签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "sf";
const MINI_APP_ID = "wxd4185d00bf7e08ac"; // 小程序 appid（getCode 用）
const PUBLIC_ID = "gh_f9d9fca26a50"; // 小程序原始ID（appOnLogin 用）
const PAGE_VERSION = "663";
const TOKEN = "wwesldfs29aniversaryvdld29"; // 应用级签名 token（固定常量）
const SYS_CODE = "MCS-MIMP-CORE";
const UCMP_BASE = "https://ucmp.sf-express.com";
const MCS_BASE = "https://mcs-mimp-web.sf-express.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "sf_token_cache.json");

const UA_MP =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/19027";
const UA_H5 =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 " +
    "MicroMessenger/8.0.69(0x1800452d) NetType/WIFI Language/zh_CN";

// 签到接口
const EP_SIGN =
    "/mcs-mimp/commonPost/~memberNonactivity~integralTaskSignPlusService~automaticSignFetchPackage";

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
function md5(s) { return crypto.createHash("md5").update(s).digest("hex"); }
function signHeaders() {
    const timestamp = String(Date.now());
    const signature = md5(`token=${TOKEN}&timestamp=${timestamp}&sysCode=${SYS_CODE}`);
    return { syscode: SYS_CODE, timestamp, signature };
}

// -------- cookie jar helpers (manual, no tough-cookie) --------
function absorbSetCookie(setCookie, jar) {
    if (!setCookie) return;
    const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
    for (const line of arr) {
        const first = String(line).split(";")[0];
        const idx = first.indexOf("=");
        if (idx > 0) {
            const k = first.slice(0, idx).trim();
            const v = first.slice(idx + 1).trim();
            if (k && v && v !== "deleted") jar[k] = v;
        }
    }
}
function cookieHeader(jar) {
    return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ");
}
async function getFollow(url, jar, headers, maxHops = 10) {
    let curUrl = url;
    let res = null;
    for (let hop = 0; hop < maxHops; hop++) {
        res = await axios.request({
            method: "GET", url: curUrl,
            headers: { ...headers, Cookie: cookieHeader(jar) },
            maxRedirects: 0, timeout: 25000, validateStatus: () => true,
        });
        absorbSetCookie(res.headers["set-cookie"], jar);
        if (res.status >= 300 && res.status < 400 && res.headers.location) {
            curUrl = new URL(res.headers.location, curUrl).toString();
            continue;
        }
        break;
    }
    return res;
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.jar = {}; // 业务 cookie jar
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
    async appOnLogin(code) {
        const res = await axios.request({
            method: "GET", url: `${UCMP_BASE}/wxaccess/weixin/appOnLogin`,
            params: { code, publicId: PUBLIC_ID },
            headers: {
                "User-Agent": UA_MP, Accept: "application/json, text/plain, */*",
                Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            },
            timeout: 25000, validateStatus: () => true,
        });
        absorbSetCookie(res.headers["set-cookie"], this.jar);
        const j = res.data || {};
        const sessionId = j.sessionId || j.sessionID || (j.obj && j.obj.sessionId);
        const openid = j.openid || j.openId || (j.obj && j.obj.openid);
        if (!sessionId) throw new Error(`appOnLogin 未返回 sessionId: ${short(j)}`);
        return { sessionId, openid };
    }
    async enrichCookie(sessionId) {
        // 换绑补全 _login_mobile_ / _login_user_id_
        this.jar.suuid = sessionId;
        const bizCode = JSON.stringify({
            path: "/up-member/newPoints", linkCode: "SFAC20230803190840424",
            supportShare: "YES", subCategoryCode: "1", from: "mypoint", categoryCode: "1",
        });
        const url = `${UCMP_BASE}/wechat-act/weixin/activity/sfnewactivity?bizCode=${encodeURIComponent(bizCode)}`
            + `&regSource=mypoint&citycode=025&cityname=${encodeURIComponent("广州")}&wxapp-version=V17.49&suuid=${sessionId}`;
        const res = await getFollow(url, this.jar, {
            "User-Agent": UA_H5,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        });
        // 兜底再访问会员首页补 cookie
        try {
            await getFollow(`${MCS_BASE}/mcs-mimp/app/index.html`, this.jar, { "User-Agent": UA_H5 });
        } catch (e) {}
        return res;
    }
    async login() {
        const code = await this.getCode();
        const { sessionId } = await this.appOnLogin(code);
        this.jar.sessionId = sessionId;
        await this.enrichCookie(sessionId);
        this.fromCache = false;
        const mobile = this.jar._login_mobile_ || "";
        if (mobile) {
            const cache = readCache();
            cache[this.account.openid] = { jar: this.jar, updatedAt: new Date().toISOString() };
            writeCache(cache);
            this.log("登录成功（已绑定顺丰会员）");
        } else {
            this.log("UCMP 会话已建立，但未拿到绑定手机号（疑似未注册/未绑定）");
        }
    }
    async mcsPost(apiPath, body) {
        const res = await axios.request({
            method: "POST", url: `${MCS_BASE}${apiPath}`, data: body || {},
            headers: {
                Host: "mcs-mimp-web.sf-express.com", "User-Agent": UA_MP,
                Accept: "application/json, text/plain, */*", "Content-Type": "application/json",
                channel: "xcxpart", platform: "MINI_PROGRAM", "accept-language": "zh-CN,zh;q=0.9",
                Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
                Cookie: cookieHeader(this.jar), ...signHeaders(),
            },
            timeout: 25000, validateStatus: () => true,
        });
        absorbSetCookie(res.headers["set-cookie"], this.jar);
        return res.data || {};
    }
    async sign(retry = true) {
        const res = await this.mcsPost(EP_SIGN, { comeFrom: "vioin", channelFrom: "WEIXIN" });
        if (res && res.success) {
            const obj = res.obj || {};
            const packets = obj.integralTaskSignPackageVOList || [];
            const countDay = obj.countDay ?? obj.countDays ?? "-";
            if (obj.hasFinishSign === 1) return this.log(`✅ 今日已签到，本周累计【${countDay}】天`);
            if (packets.length) return this.log(`✅ 签到成功：【${packets[0].packetName}】，本周累计【${countDay}】天`);
            return this.log(`✅ 签到完成，本周累计【${countDay}】天`);
        }
        const code = res && (res.errorCode || res.code);
        const msg = (res && (res.errorMessage || res.msg)) || short(res);
        if (/已签|签到过|重复|已完成/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);

        const sessionErr = String(code) === "100111" ||
            /用户信息失效|退出重新进入|未登录|登录失效|未授权|请登录|会话失效|会员/i.test(String(msg));
        if (sessionErr) {
            const hasMobile = !!(this.jar && this.jar._login_mobile_);
            if (retry && this.fromCache) {
                this.log(`缓存会话失效，重新登录后重试：${msg}`);
                this.jar = {};
                await this.login();
                return this.sign(false);
            }
            if (!hasMobile) { this.unregistered = true; throw new Error("NO_ACCOUNT:未注册/未绑定顺丰会员"); }
        }
        this.log(`❌ 签到失败: ${msg}`);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (cached.jar && cached.jar.sessionId && cached.jar._login_mobile_) {
            this.jar = cached.jar; this.fromCache = true; this.log("使用缓存会话"); return;
        }
        await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log("⚠️ 该微信号还没在顺丰速运注册/绑定会员，先在小程序里登录绑定手机号再跑");
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
