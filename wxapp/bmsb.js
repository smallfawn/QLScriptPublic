/*
------------------------------------------
@Description: 宝妈上班(wolf) - 微信小程序静默登录 + 自动赚取贡献值
cron: 17 8 * * *
------------------------------------------
变量名：bmsb
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
可选：
bmsb_max_runs  单账号最多领取次数，默认 20（服务端到上限会自动停）
------------------------------------------
契约（wx appid wxe6cb23a7f02277ed，UniCloud spaceId mp-50d375d9-...，网关 api.next.bspapp.com/client）：
（迁移自 YYB-GO 系脚本，基于 DCloud UniCloud API；已 Node 实测通）

签名：x-serverless-sign = HMAC-MD5(CLIENT_SECRET, 顶层字段按key排序 "k=v" 过滤空值后 & 连接)
① accessToken：POST /client {method:"serverless.auth.user.anonymousAuthorize",params:"{}",spaceId,timestamp} → data.accessToken(600s)
② 云函数：POST /client {method:"serverless.function.runtime.invoke",
     params:JSON({functionTarget,functionArgs:{...,clientInfo,uniIdToken}}),spaceId,timestamp,token}
     头 x-basement-token:token
登录  uni-id-co / loginByWeixin params:[{code}] → data.newToken.token（uniIdToken JWT，~72h）
uid   DCloud-clientDB 查 uni-id-users where '_id'==$cloudEnv_uid → uid
赚取  wolf-order / createContribution params:[{uid}] → data.errCode==0「发放成功」cons:250；到上限 errCode!=0
CLIENT_SECRET/spaceId/UNI_APPID 是应用固定配置（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("宝妈上班");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "bmsb";
const WX_APPID = "wxe6cb23a7f02277ed";
const UNI_APPID = "__UNI__AE9315F";
const APP_NAME = "张团--小程序22";
const API_URL = "https://api.next.bspapp.com/client";
const SPACE_ID = "mp-50d375d9-5c5e-4271-8517-b09cb093334b";
const CLIENT_SECRET = "Gf/DmFLzvUNIqaty2aIXEQ==";
const MAX_RUNS = Number(process.env.bmsb_max_runs || 20);
const TOKEN_CACHE_FILE = path.join(__dirname, "bmsb_token_cache.json");

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: WX_APPID,
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
        $.log(`写入缓存失败: ${e.message || e}`);
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
function genSign(body) {
    const parts = Object.keys(body).sort().filter((k) => String(body[k]) !== "").map((k) => `${k}=${body[k]}`);
    return crypto.createHmac("md5", CLIENT_SECRET).update(parts.join("&"), "utf8").digest("hex");
}
function headers(extra) {
    return {
        "Content-Type": "application/json",
        charset: "utf-8",
        "User-Agent": "Mozilla/5.0 (Linux; Android 12; Redmi K30 Pro Build/SKQ1.211006.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/146.0.7680.178 Mobile Safari/537.36 MicroMessenger/8.0.71",
        Referer: `https://servicewechat.com/${WX_APPID}/3/page-frame.html`,
        ...(extra || {}),
    };
}
function buildClientInfo() {
    return {
        PLATFORM: "mp-weixin", OS: "android", APPID: UNI_APPID,
        DEVICEID: String(Math.floor(Math.random() * 9e18 + 1e18)), scene: 1011,
        appId: UNI_APPID, appName: APP_NAME, appVersion: "1.0.0", appVersionCode: "100",
        appLanguage: "zh-Hans", hostVersion: "8.0.71", hostName: "WeChat", uniPlatform: "mp-weixin",
        uniCompilerVersion: "5.07", uniRuntimeVersion: "5.07", deviceType: "phone",
        deviceBrand: "redmi", deviceModel: "Redmi K30 Pro", osName: "android", osVersion: "12",
        locale: "zh-Hans", LOCALE: "zh-Hans",
    };
}
/** JWT 剩余小时数，无法解析返回 null */
function jwtRemainingHours(token) {
    try {
        let p = String(token).split(".")[1];
        p += "=".repeat((4 - (p.length % 4)) % 4);
        const payload = JSON.parse(Buffer.from(p.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
        return (payload.exp - Math.floor(Date.now() / 1000)) / 3600;
    } catch (e) {
        return null;
    }
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.accessToken = "";
        this.accessExpire = 0;
        this.uniIdToken = "";
        this.uid = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    async getAccessToken() {
        if (this.accessToken && Date.now() < this.accessExpire - 30000) return this.accessToken;
        const body = { method: "serverless.auth.user.anonymousAuthorize", params: "{}", spaceId: SPACE_ID, timestamp: Date.now() };
        const res = await axios.post(API_URL, body, { headers: headers({ "x-serverless-sign": genSign(body) }), timeout: 20000, validateStatus: () => true });
        const d = res.data || {};
        if (!d.success || !(d.data || {}).accessToken) throw new Error(`accessToken 获取失败: ${short(d)}`);
        this.accessToken = d.data.accessToken;
        this.accessExpire = Date.now() + (d.data.expiresInSecond || 600) * 1000;
        return this.accessToken;
    }
    async callApi(functionTarget, functionArgs, retry = true) {
        const token = await this.getAccessToken();
        const args = { ...functionArgs, clientInfo: buildClientInfo(), uniIdToken: this.uniIdToken || "" };
        const body = {
            method: "serverless.function.runtime.invoke",
            params: JSON.stringify({ functionTarget, functionArgs: args }),
            spaceId: SPACE_ID, timestamp: Date.now(), token,
        };
        const res = await axios.post(API_URL, body, { headers: headers({ "x-basement-token": token, "x-serverless-sign": genSign(body) }), timeout: 20000, validateStatus: () => true });
        const d = res.data || {};
        if (retry && !d.success && (d.error || {}).code === "GATEWAY_INVALID_TOKEN") {
            this.accessToken = ""; this.accessExpire = 0;
            return this.callApi(functionTarget, functionArgs, false);
        }
        return d;
    }
    async getCode() {
        const { data } = await wechat.getCode(this.account.openid);
        if (data && data.status === false) throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }
    async loginByWeixin() {
        const code = await this.getCode();
        const res = await this.callApi("uni-id-co", { method: "loginByWeixin", params: [{ code }] });
        const token = res?.data?.newToken?.token || res?.data?.token;
        if (!res?.success || !token) throw new Error(`loginByWeixin 失败: ${short(res)}`);
        this.uniIdToken = token;
        const cache = readCache();
        cache[this.account.openid] = { uniIdToken: token, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功（uniIdToken 已获取）");
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (cached.uniIdToken) {
            const h = jwtRemainingHours(cached.uniIdToken);
            if (h !== null && h > 1) { this.uniIdToken = cached.uniIdToken; this.log(`使用缓存token（剩余 ${h.toFixed(1)}h）`); return; }
        }
        await this.loginByWeixin();
    }
    async extractUid() {
        const res = await this.callApi("DCloud-clientDB", {
            command: { $db: [
                { $method: "collection", $param: ["uni-id-users"] },
                { $method: "where", $param: ["'_id' == $cloudEnv_uid"] },
                { $method: "field", $param: ["uid,_id,mobile,nickname,my_invite_code,money,score,level"] },
                { $method: "get", $param: [] },
            ] },
        });
        const u = ((res?.data || {}).data || [])[0] || {};
        this.uid = String(u.uid || u._id || "");
        if (u.nickname !== undefined || u.score !== undefined) this.log(`昵称 ${u.nickname ?? "-"} | 积分 ${u.score ?? "-"} | 余额 ${u.money ?? "-"}`);
        return this.uid;
    }
    async createContribution() {
        return this.callApi("wolf-order", { method: "createContribution", params: [{ uid: this.uid }] });
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            if (!(await this.extractUid())) { this.log("⚠️ 未能获取 uid（该微信号可能未注册），跳过"); return; }
            let earned = 0, ok = 0, fails = 0;
            for (let i = 0; i < MAX_RUNS; i++) {
                const res = await this.createContribution();
                if (!res || !res.success) {
                    if (++fails >= 3) { this.log("连续3次失败，终止"); break; }
                    await $.wait(8000, 15000); continue;
                }
                const d = res.data || {};
                if (Number(d.errCode) === 0) {
                    const inner = d.data || {};
                    earned += inner.cons || 0; ok++; fails = 0;
                    this.log(`[${i + 1}/${MAX_RUNS}] 发放成功 贡献值 ${inner.cons ?? "?"}（今日第 ${inner.count ?? "?"} 次）`);
                    await $.wait(10000, 18000);
                } else {
                    const em = d.errMsg || short(d);
                    if (/频繁|稍后|too frequent|请等待|间隔/i.test(em)) {
                        // 限频：等待更久后重试，不计入连续失败
                        this.log(`[${i + 1}/${MAX_RUNS}] 限频（${em}），等待后重试`);
                        await $.wait(12000, 22000);
                        continue;
                    }
                    // 达上限/其它业务错误，停止
                    this.log(`已停止：${em}`);
                    break;
                }
            }
            this.log(`✅ 完成，本次成功 ${ok} 次，累计贡献值 +${earned}`);
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
        if (i < $.userList.length - 1) await $.wait(2000, 4000);
    }
})().catch((e) => $.log(e.message || e)).finally(() => $.done());
