/*
------------------------------------------
@Description: 企迈云商 qmai 平台通用 - 微信小程序静默登录 + 每日签到
              一份脚本覆盖所有用企迈(qmai)的餐饮品牌小程序（林里/爷爷不泡茶/…）
cron: 51 8 * * *
------------------------------------------
变量名：qmai
变量值：openid#appid#storeId#activityId[#备注]，一行一个店铺，多行或 & 分隔
       openid     = wx_server 里的账号标识
       appid      = 该小程序 appid
       storeId    = 门店 id，取自解包 app-config.json 的 ext.storeId（例：212501）
       activityId = 签到活动 id。运营给每个店固定配一个，从签到页 URL 抓一次即可：
                    进小程序签到页，抓 webapi.qmai.cn/web/cmk-center/sign/* 请求体里的 activityId
                    （例：爷爷不泡茶=983701274523176960）。没有它服务端回「活动id为空」。
       例：owNAX6ky****#wx26c7aaacfa017719#212501#<活动id>#林里

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（webapi.qmai.cn/web，信封 {status, code, message, data}，成功 status===true）：

★ 这家对 webapi.qmai.cn 全站**强制 AES-GCM 请求体加密**（解包 requestEncryptSdk）：
  - key = 宽松 base64 解码 "mN6KpXq8Sv2WxYz9LdFcRgHjMnBvCtDxZaS3QwE5rT0yU7I4O1A"
          取前 32 字节（解包模块 93 的 master key + 模块内 M() 的归一化逻辑）
  - 明文 = JSON.stringify(body)，body 会被自动补 appid（解包 j(): e.appid||(e.appid=x.appid)）
  - 12 字节随机 iv，aad="" (aadEnabled 默认关)
  - 请求体 = {"payload": base64(ciphertext‖tag)}
  - 头 QM-Encrypt-Meta = base64(JSON{version:"1.0.0", timestamp:ms, iv:base64(iv)})
  - 响应同样加密：{"payload":...} + 响应头 QM-Encrypt-Meta 带解密用的 iv
  keyVersion "1.0.0" 来自解包 ee.master.keyVersion。这是加密不是风控，可复刻。

固定头：Qm-From:wechat / Qm-From-Type:catering / store-id:<storeId> / Accept:v=1.0

登录  POST /account-center/oauth/mini-app-login  明文 {code, eVersion:"1.0", appid}
        -> data.{token, user, store}；token 放后续请求头 Qm-User-Token
状态  POST /cmk-center/sign/userSignStatistics  {activityId, appid}  -> 今日签到/连签
签到  POST /cmk-center/sign/takePartInSign      {activityId, appid}  -> status===true 即成功

⚠️ 实测：AES-GCM 加密握手 + 登录**已实测通过**（token/memberId 到手，登录 status:true）。
签到接口要 activityId（每店固定），本测试号未持有 linli 店的 activityId，所以
takePartInSign 本身未实测，只按契约实现。填对 storeId+activityId 的号跑起来即可验证。
不做：邀请/抽奖/兑换等营销插件。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("企迈qmai平台签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "qmai";
const BASE = "https://webapi.qmai.cn/web";
const KEY_RAW = "mN6KpXq8Sv2WxYz9LdFcRgHjMnBvCtDxZaS3QwE5rT0yU7I4O1A";
const KEY_VERSION = "1.0.0";
const META_HEADER = "QM-Encrypt-Meta";
const TOKEN_CACHE_FILE = path.join(__dirname, "qmai_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Version/4.0 Chrome/134.0.6998.136 Mobile Safari/537.36 MicroMessenger/8.0.48.2580(0x28003036) MiniProgramEnv/android";

const EP_LOGIN = "/account-center/oauth/mini-app-login";
const EP_STATS = "/cmk-center/sign/userSignStatistics";
const EP_SIGN = "/cmk-center/sign/takePartInSign";

/** 解包 M(): 宽松 base64 解码，非 32 字节则取前 32 补零 */
function deriveKey(raw) {
    let b;
    try {
        b = Buffer.from(raw.replace(/^key-/i, ""), "base64");
    } catch (e) {
        b = Buffer.from(raw, "utf8");
    }
    if (b.length === 32) return b;
    const out = Buffer.alloc(32);
    b.copy(out, 0, 0, Math.min(b.length, 32));
    return out;
}
const KEY = deriveKey(KEY_RAW);

/** AES-256-GCM：返回 base64(ciphertext‖16字节tag) */
function gcmEncrypt(plaintext, iv) {
    const c = crypto.createCipheriv("aes-256-gcm", KEY, iv);
    const enc = Buffer.concat([c.update(plaintext, "utf8"), c.final()]);
    return Buffer.concat([enc, c.getAuthTag()]).toString("base64");
}
function gcmDecrypt(b64, iv) {
    const buf = Buffer.from(b64, "base64");
    const tag = buf.subarray(buf.length - 16);
    const data = buf.subarray(0, buf.length - 16);
    const d = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(data), d.final()]).toString("utf8");
}
/** 宽松 base64 → Buffer（补齐 padding） */
const b64relax = (s) => Buffer.from(s + "=".repeat((4 - (s.length % 4)) % 4), "base64");

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
    const [openid, appid, storeId, activityId, remark] = String(raw).split("#").map((s) => (s || "").trim());
    return { openid, appid, storeId, activityId, remark: remark || "" };
}

function short(v, n = 200) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}

const isOk = (res) => !!res && res.status === true && Number(res.code || 0) === 0;
const codeOf = (res) => Number(res?.code);
const msgOf = (res) => res?.message || res?.msg || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isAuthError = (res) => codeOf(res) === 401 || /token|登录|未授权|失效|过期/i.test(msgOf(res));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.wechat = new WeChatServer({
            url: process.env.wx_server_url || "http://192.168.31.196:8787",
            appid: this.account.appid,
            auth: process.env.wx_auth || "",
        });
    }

    log(text) {
        const tag = this.account.remark || this.account.appid || "";
        $.log(`账号[${this.index}]${tag ? `[${tag}]` : ""} ${text}`);
    }

    headers(tok = "") {
        return {
            Accept: "v=1.0",
            "store-id": this.account.storeId,
            "Qm-From-Type": "catering",
            "Qm-From": "wechat",
            "content-type": "application/json",
            "Qm-User-Token": tok || "",
            "Accept-Language": "zh",
            "User-Agent": USER_AGENT,
            Referer: `https://servicewechat.com/${this.account.appid}/0/page-frame.html`,
            xweb_xhr: "1",
        };
    }

    /** 加密请求 + 解密响应 */
    async request(apiPath, body, tok = "") {
        const payloadObj = { ...body };
        if (!payloadObj.appid) payloadObj.appid = this.account.appid; // 解包 j() 自动补 appid
        const iv = crypto.randomBytes(12);
        const ts = Date.now();
        const cipher = gcmEncrypt(JSON.stringify(payloadObj), iv);
        const meta = Buffer.from(
            JSON.stringify({ version: KEY_VERSION, timestamp: ts, iv: iv.toString("base64") })
        ).toString("base64");
        const headers = this.headers(tok);
        headers[META_HEADER] = meta;
        const res = await axios.request({
            method: "POST",
            url: `${BASE}${apiPath}`,
            data: { payload: cipher },
            headers,
            timeout: 20000,
            validateStatus: () => true,
        });
        if (res.status !== 200) {
            if (res.data && typeof res.data === "object") return res.data;
            throw new Error(`${apiPath} HTTP ${res.status}: ${short(res.data)}`);
        }
        const data = res.data;
        // 响应可能是明文（错误信封）或加密 {payload}
        if (data && typeof data === "object" && typeof data.payload === "string") {
            const rmeta = res.headers[META_HEADER.toLowerCase()] || res.headers[META_HEADER];
            if (!rmeta) throw new Error(`${apiPath}: 响应加密但缺 ${META_HEADER}`);
            const mj = JSON.parse(b64relax(rmeta).toString("utf8"));
            const riv = b64relax(mj.iv);
            return JSON.parse(gcmDecrypt(data.payload, riv));
        }
        return data;
    }

    /** wcs.getCode 在 status:false 时也 resolve，必须自己判失败，否则取码限流会被误报成登录失败 */
    async getCode() {
        const { data } = await this.wechat.getCode(this.account.openid);
        if (data && data.status === false) {
            throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        }
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }

    get cacheKey() {
        return `${this.account.openid}#${this.account.appid}`;
    }

    async login() {
        const code = await this.getCode();
        const res = await this.request(EP_LOGIN, { code, eVersion: "1.0" });
        if (!isOk(res) || !(res.data || {}).token) throw new Error(`登录失败: ${msgOf(res)}`);
        this.token = String(res.data.token);
        const member = res.data.user || {};
        const cache = readCache();
        cache[this.cacheKey] = { token: this.token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功${member.memberId || member.id ? `（会员 ${String(member.memberId || member.id).slice(0, 8)}…）` : ""}`);
    }

    /** 读签到状态；会话失效返回 null */
    async stats(needLog = true) {
        const res = await this.request(EP_STATS, { activityId: this.account.activityId }, this.token);
        if (!isOk(res)) {
            if (isAuthError(res)) return null;
            if (needLog) this.log(`读取签到状态失败: ${msgOf(res)}`);
            return { failed: true, res };
        }
        const d = res.data || {};
        if (needLog) this.log(`签到状态: ${short(d, 140)}`);
        // 常见字段：todaySign / isSign / continuousDays
        const signed = d.todaySign === true || d.isSign === true || Number(d.todaySignStatus) === 1;
        return { signed, data: d };
    }

    async ensureLogin() {
        const cached = readCache()[this.cacheKey] || {};
        if (!this.token && cached.token) {
            this.token = cached.token;
            const s = await this.stats(false);
            if (s !== null) {
                this.log("使用缓存token");
                return s;
            }
            this.log("缓存token失效，重新登录");
            this.token = "";
        }
        if (!this.token) await this.login();
        return null;
    }

    async sign(pre) {
        if (pre === null || pre === undefined) pre = await this.stats();
        if (pre === null) {
            this.log("❌ 会话无效，签到跳过");
            return;
        }
        if (pre.failed) {
            this.log(`❌ 读取签到状态失败: ${msgOf(pre.res)}`);
            return;
        }
        if (pre.signed) {
            this.log("✅ 今日已签到");
            return;
        }
        const res = await this.request(EP_SIGN, { activityId: this.account.activityId }, this.token);
        if (isOk(res)) {
            const d = res.data || {};
            const gain = d.point ?? d.integral ?? d.reward;
            this.log(`✅ 签到成功${gain !== undefined ? `，+${gain}` : ""}`);
            return;
        }
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        this.log(`❌ 签到失败: ${msgOf(res)}`);
    }

    async run() {
        if (!this.account.openid || !this.account.appid || !this.account.storeId || !this.account.activityId) {
            this.log("跳过：变量值要写成 openid#appid#storeId#activityId[#备注]（activityId 从签到页抓一次）");
            return;
        }
        try {
            const pre = await this.ensureLogin();
            await this.sign(pre);
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
