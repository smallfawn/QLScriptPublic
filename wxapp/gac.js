/*
------------------------------------------
@Description: 广汽丰田新能源 - 微信小程序静默登录 + 每日签到
cron: 26 11,17 * * *
------------------------------------------
变量名：gac
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxd8a42d1c0c59c15d）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

两段式登录：
  1) 小程序登录  POST https://xcx.nevapp.gtmc.com.cn/wxapp/nev-prod/bff-nev-wxapp/auth/login?code=<code>
       头 apiVersion:1.4.0 -> header.code==10000000，body.token(xcxToken)、body.openId
  2) 换网关token POST https://gw.nevapp.gtmc.com.cn/ha/iam/api/sec/oauth/token
       体(AES-128-CBC，key/iv 随机，key@DS@iv 经 RSA-PKCS1v1.5 公钥加密)：
         {grant_type:'password', username:<常量占位>, password:xcxToken, auth_type:'newminipg'}
       头 Authorization:Basic bmV2YXBwOnNlY3JldA== / appId / timestamp / nonce /
          sig=md5(ts+'Basic bmV2YXBwOnNlY3JldA=='+nonce+APP_ID+APP_SIG_SECRET)
       响应 AES 加密(encryptData/encryptKey) -> body.accessToken(gwToken, JWT)
签到  POST https://gw.nevapp.gtmc.com.cn/main/api/marketing/lgn/task/sec/signinV2 {gtmcUid:'',fromApplication:'0'}
       头 Authorization:<gwToken> / appId / sig=md5(ts+tokenRaw+nonce+APP_ID+APP_SIG_SECRET)
       -> header.code==10000000
查签到本 GET /main/api/marketing/lgn/sec/usersign/getAttendanceBook?beginTime&endTime -> body.todayHasSigned
APP_ID/APP_SIG_SECRET/RSA公私钥/Basic 串 均为该小程序固定应用常量（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("广汽丰田新能源签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "gac";
const MINI_APP_ID = "wxd8a42d1c0c59c15d";
const API_VERSION = "1.4.0";
const PAGE_VERSION = "138";

const GW_BASE = "https://gw.nevapp.gtmc.com.cn";
const XCX_BASE = "https://xcx.nevapp.gtmc.com.cn/wxapp/nev-prod/bff-nev-wxapp";
const APP_ID = "ecb4fdd3-da09-408a-913b-44d311d03105";
const APP_SIG_SECRET = "611ac848-be11-404e-b7a3-54f735d2eb3e";
const BASIC_AUTH = "Basic bmV2YXBwOnNlY3JldA=="; // base64("nevapp:secret") 应用固定
// oauth password grant 的 username：原脚本写死，password 才是每号 xcxToken。
// 允许用变量覆盖以便验证其是否 load-bearing；默认沿用原脚本占位值。
const OAUTH_USERNAME = process.env.gac_oauth_user || "18825160040";
const DIAG = process.env.gac_diag === "1";

// 小程序内嵌固定 RSA 密钥对（应用级，用于请求/响应 AES 密钥的 RSA 包裹，非个人凭证）
const PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA49jxpFBAoEslNYrHb0wT8nCpGBn3hvjgToNkp7lFpsSeRS7WbHoFJEvmf1U83cHrbTzRFRowPft/FGBw6/6dZcmMjMgz1n0FWlqk0d7QjEDL+t9Dj9tH9e/qdGfJ3bzR0ZgpgQMpKpx5I5fcEgzMYnHWGLZBY+v+PlPTN/1mz0nnRtIIxb8YuZZFvadfGTC8jeD7tMERpd5zENml5cLbVujENsag9AIpvLdvR6fSewi3l9QmssWpty50UpcAWsvAs+ExRYyUe/s1lwfSdSciW6Lrj4sp4MMaWifdTQUbKKEeuRugEqJSDrxhxoybEbSbl2CYaTR8kifZ1n+lcAh6cQIDAQAB";
const PRIVATE_KEY = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCUEPwXFgsGTngqifX48k/5CRBNVA2/mLJhl+fP7Z0UHrSQmI31rtXcb9zN6PMG0jvNxk0oLvrUgf1K/lfgDp0noUQpCbHqkCk0CGQogSIVr/ktu5lhev0/P+9pkFfXrrZWKYhBk/z7r/XYvmsm4TVyFhge5WZqfY+HXhFmzJEu9lhq9VACXsfXJ6O778Dj3fF6hHsyNsai+qGNL31bdObxJG8EhWNcwK0ejCa8XzsscasbjZ/AhTwAQf9kxT9diCZv2vWvK5QtDhxMbqyQ6lFE8Ew9jaAHYnp2jxh3CwcAMp9B0+Ne4JOBaY7IjH9ENqMC29cYnhxNhj3ZGcbEu6lpAgMBAAECggEBAISKY66iu8GscmLZ1kY/Whk55M7jw97TaDJ2UTrOn8KH7ehVtxXKqIPH2qaztQBRJtl/fkfPLhcWOU9tN+pICqOT9zipBgtLeqaqMEYVuhYhzPMEMDuTZai9qakcXZWjPnMIgID7YQVHsNGROse15yq13mehv7jpppZtPTSBQCEBZAw+SFNS4KVfBDKNntlesEuLJHGWWXnqxWwK3YA4IdUAJjT5kDEiYQs7uy2FHqdcZnw7hV/Tt3OWDqrOB8zoZVhEg9dLvqpBaUi6yh9ihUYJBtFegmsFSY7MazHQjYnY8bcEcoma22c3AZbGeRwTwrNrlL0/UvF60L1njx4xhSUCgYEA0Xgh4mFSrp5E0UbMvy5TnpayH1hcaJNFjyGgQGdwgnE69gzR1Grqv+ihSjTbPvQHu9IGnuXb6Pdm/tuj2ml4xTJ9OnTe2/x/TzMIserNfRD1v6prxjNgZc+YDEebxHTWDBtCNpdbOEy27yO4fc9UvIoIbgG5eDTcMwCtiIt+98sCgYEAtPUPBqegfiDzyBP7l2hxhGwFgIrsFYIg3lJwwlyYpZEt8p/TMwPAMb2k+nfQPtyS6T2bBGr2PAKUAubD1SrwGE4ndXO4SDB814ll93ZrE7X18iyoGBwbgpjGMONK3nbS2z+2WrFEtQZaUuLiiZp+hnxk5uW7EQ5RnToOaUTPtRsCgYBNUOhA5Odd6LFCBb4BOxpGSR1KEJVbTDC6mhDKdOPEYgL/WtAAdc5cM4OFHmlmnTBVlTo4YGOBZAAyReP+9DtNnks2zniL/nEHTLEC6sYaSa5Lpp3NNJ16NtvKfIv0QaPYKB+Sgt96smY7cpXgaiy+wrxFzoEk623zrWZgJg0hbQKBgFMkEO5O0CeDPl6cB8lt/FIKS5Dew0+yhSWAnTw/zQatKH5EPoY+3+w6pPVLXUu0jm9JldK2zkGOMbEPk8R6QOv55JlLPM02MfXZtBa5usLIpKLLL8Q8Dcu4I79MfxatY33GzSLoNZgyvgc9JTZx3FYwCzAnNwbEHG1vwjVNn10nAoGASPxDtahASVh/IN6sjFR1soU8fuzEzThpnchfNVp3BeROR/8fXyfyBk3hKGmh6PY41XttKrGBwCaztCwA6zoTv7/SmzqNCzknq4uFbr9o455T0+0gtBKS6vFv1zCnvyMXjcmyCvB7gIRnhoq5W/z9l8VtAagNi9JOhZpjCl7Ep70=";

const CACHE_FILE = path.join(__dirname, "gac_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";
const REFERER = `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`;

const pubPem = `-----BEGIN PUBLIC KEY-----\n${PUBLIC_KEY.match(/.{1,64}/g).join("\n")}\n-----END PUBLIC KEY-----`;
const priPem = `-----BEGIN PRIVATE KEY-----\n${PRIVATE_KEY.match(/.{1,64}/g).join("\n")}\n-----END PRIVATE KEY-----`;
const priJwk = crypto.createPrivateKey(priPem).export({ format: "jwk" });
const b64uToBuf = (s) => Buffer.from(String(s).replace(/-/g, "+").replace(/_/g, "/"), "base64");
const b64uToBigInt = (s) => BigInt(`0x${b64uToBuf(s).toString("hex") || "0"}`);
const priN = b64uToBigInt(priJwk.n);
const priD = b64uToBigInt(priJwk.d);
const priKlen = b64uToBuf(priJwk.n).length;

function modPow(base, exp, mod) {
    let b = base % mod, e = exp, r = 1n;
    while (e > 0n) { if (e & 1n) r = (r * b) % mod; e >>= 1n; b = (b * b) % mod; }
    return r;
}
function rsaEncryptPkcs1V15(plain) {
    return crypto.publicEncrypt({ key: pubPem, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(String(plain))).toString("base64");
}
function rsaDecryptPkcs1V15(encB64) {
    const c = BigInt(`0x${Buffer.from(encB64, "base64").toString("hex") || "0"}`);
    const m = modPow(c, priD, priN);
    let hex = m.toString(16);
    if (hex.length % 2) hex = `0${hex}`;
    let em = Buffer.from(hex, "hex");
    if (em.length < priKlen) em = Buffer.concat([Buffer.alloc(priKlen - em.length, 0), em]);
    if (em.length < 11 || em[0] !== 0x00 || em[1] !== 0x02) throw new Error("RSA解密填充头错误");
    let i = 2;
    while (i < em.length && em[i] !== 0x00) i++;
    if (i < 10 || i >= em.length) throw new Error("RSA解密填充分隔错误");
    return em.slice(i + 1).toString("utf8");
}

const rand = (n = 6) => { let s = ""; while (s.length < n) s += Math.random().toString(36).slice(2); return s.slice(0, n); };
const md5 = (s) => crypto.createHash("md5").update(s).digest("hex");

function aesEncrypt(obj) {
    const key = rand(16), iv = rand(16), keyiv = `${key}@DS@${iv}`;
    const cipher = crypto.createCipheriv("aes-128-cbc", Buffer.from(key), Buffer.from(iv));
    let enc = cipher.update(typeof obj === "string" ? obj : JSON.stringify(obj), "utf8", "base64");
    enc += cipher.final("base64");
    return { encryptKey: rsaEncryptPkcs1V15(keyiv), encryptData: enc };
}
function aesDecrypt(encData, encKey) {
    const keyiv = rsaDecryptPkcs1V15(encKey);
    const [key, iv] = keyiv.split("@DS@");
    const dec = crypto.createDecipheriv("aes-128-cbc", Buffer.from(key), Buffer.from(iv));
    let out = dec.update(encData, "base64", "utf8");
    out += dec.final("utf8");
    return out;
}

function readCache() {
    try { if (!fs.existsSync(CACHE_FILE)) return {}; return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) || {}; } catch (e) { return {}; }
}
function writeCache(c) {
    try { fs.writeFileSync(CACHE_FILE, JSON.stringify(c, null, 2), "utf8"); } catch (e) { $.log(`写入缓存失败: ${e.message || e}`); }
}
function parseAccount(raw = "") {
    const [id, remark] = String(raw).split("#").map((s) => (s || "").trim());
    return { openid: id, remark: remark || "" };
}
function short(v, n = 220) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function parseJwt(token) {
    try {
        const raw = String(token || "").replace(/^Bearer\s+/i, "").trim();
        const p = raw.split(".")[1];
        return JSON.parse(Buffer.from(p.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    } catch { return {}; }
}

async function jreq(method, url, { headers = {}, data } = {}) {
    const res = await axios.request({
        method, url,
        data: data === undefined ? undefined : (typeof data === "string" ? data : JSON.stringify(data)),
        headers, timeout: 25000, validateStatus: () => true,
    });
    return { status: res.status, data: res.data };
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.xcxToken = "";
        this.gwToken = "";
        this.gacOpenId = "";
        this.deviceId = md5(this.account.openid || rand(16)).slice(0, 16);
        this.unregistered = false;
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
    // 第一段：小程序 code 登录
    async xcxLogin(code) {
        const url = `${XCX_BASE}/auth/login?code=${encodeURIComponent(code)}&clickUrl=${encodeURIComponent("/pages/index/index")}&clickId=`;
        const { data } = await jreq("POST", url, {
            data: { code, clickUrl: "/pages/index/index", clickId: "" },
            headers: { "User-Agent": UA, "content-type": "application/json", apiVersion: API_VERSION, Referer: REFERER },
        });
        if (data?.header?.code !== 10000000) {
            const m = data?.header?.message || short(data);
            // 「请先同意隐私政策」= 需在小程序里一次性授权隐私协议(wx用户交互，无法脚本化)；未注册类同样归 ⚠️
            if (/隐私政策|隐私协议|同意.*协议|未注册|未绑定|未实名|完善|注册会员|绑定手机/.test(String(m))) {
                this.unregistered = true;
                throw new Error(`NO_ACCOUNT:${m}`);
            }
            throw new Error(`小程序登录失败: ${m}`);
        }
        if (!data?.body?.token) throw new Error(`小程序登录返回无token: ${short(data?.body)}`);
        this.xcxToken = data.body.token;
        this.gacOpenId = data.body.openId || "";
        this.log(`小程序登录成功 openId=${this.gacOpenId || "?"} tokenLen=${this.xcxToken.length}`);
        if (DIAG) this.log(`[DIAG] xcxToken jwt=${short(parseJwt(this.xcxToken))}`);
        return data.body;
    }
    // 第二段：换网关 token（返回解密后的 plain，供上层判断成功/未注册）
    async exchangeGwRaw(username, password) {
        const timestamp = Date.now();
        const nonce = rand(6);
        const sig = md5(`${timestamp}${BASIC_AUTH}${nonce}${APP_ID}${APP_SIG_SECRET}`);
        const body = aesEncrypt({ grant_type: "password", username, password, auth_type: "newminipg" });
        const { data } = await jreq("POST", `${GW_BASE}/ha/iam/api/sec/oauth/token`, {
            data: body,
            headers: {
                "User-Agent": UA, "content-type": "application/json", Authorization: BASIC_AUTH,
                appId: APP_ID, timestamp, xweb_xhr: "1", nonce, sig, deviceId: this.deviceId,
                operateSystem: "h5", appVersion: "", Referer: REFERER,
            },
        });
        let plain = data;
        if (data?.encryptData && data?.encryptKey) {
            try { plain = JSON.parse(aesDecrypt(data.encryptData, data.encryptKey)); }
            catch (e) { throw new Error(`网关token响应解密失败: ${e.message} raw=${short(data)}`); }
        }
        return plain;
    }
    async exchangeGw() {
        const plain = await this.exchangeGwRaw(OAUTH_USERNAME, this.xcxToken);
        const code = plain?.header?.code;
        const msg = plain?.header?.message || plain?.header?.msg || "";
        if (code !== 10000000 || !plain?.body?.accessToken) {
            // 登录链已通（拿到 xcxToken），但网关侧无账号 => 未注册/未绑定
            if (/未注册|未绑定|不存在|未实名|no.?account|not.?found|会员|注册/i.test(String(msg)) || code === 10000404 || code === 10001002) {
                this.unregistered = true;
                throw new Error(`NO_ACCOUNT:网关侧无账号(${code} ${msg})`);
            }
            throw new Error(`换取网关token失败: code=${code} msg=${msg} ${short(plain)}`);
        }
        this.gwToken = plain.body.accessToken;
        this.log(`网关token成功 tokenLen=${String(this.gwToken).length}`);
        if (DIAG) this.log(`[DIAG] gwToken jwt=${short(parseJwt(this.gwToken))}`);
        return this.gwToken;
    }
    // 认证后的网关请求
    async gwReq(method, apiPath, query = {}, body = undefined) {
        const qs = Object.keys(query).length ? `?${new URLSearchParams(query).toString()}` : "";
        const ts = Date.now();
        const nonce = rand(6);
        const raw = String(this.gwToken).replace(/^Bearer\s+/i, "").trim();
        const sig = md5(`${ts}${raw}${nonce}${APP_ID}${APP_SIG_SECRET}`);
        const headers = {
            "content-type": "application/json", appId: APP_ID, Authorization: this.gwToken,
            timestamp: String(ts), xweb_xhr: "1", sig, nonce, appVersion: "3.22",
            operateSystem: "h5", deviceId: this.deviceId, "User-Agent": UA, Referer: REFERER,
        };
        const send = method === "GET" ? undefined : (Object.keys(body || {}).length ? aesEncrypt(body) : {});
        const { data } = await jreq(method, `${GW_BASE}${apiPath}${qs}`, { headers, data: send });
        let d = data;
        if (d?.encryptData && d?.encryptKey) d = JSON.parse(aesDecrypt(d.encryptData, d.encryptKey));
        return d;
    }
    async attendance() {
        // 本周一~周日范围（原脚本用 ISO 日期）
        const n = new Date(Date.now() + 8 * 3600 * 1000);
        const day = n.getUTCDay();
        const s = new Date(n); s.setUTCDate(n.getUTCDate() - day);
        const e = new Date(s); e.setUTCDate(s.getUTCDate() + 6);
        const f = (x) => x.toISOString().slice(0, 10);
        const d = await this.gwReq("GET", "/main/api/marketing/lgn/sec/usersign/getAttendanceBook", { beginTime: f(s), endTime: f(e), noLoad: "true" });
        if (d?.header?.code !== 10000000) throw new Error(`查签到本失败: ${d?.header?.code} ${d?.header?.message || short(d)}`);
        return d.body || {};
    }
    async doSignin() {
        const d = await this.gwReq("POST", "/main/api/marketing/lgn/task/sec/signinV2", { noLoad: "true", noTip: "true" }, { gtmcUid: "", fromApplication: "0" });
        return d;
    }
    async sign() {
        let book;
        try { book = await this.attendance(); }
        catch (e) { book = null; this.log(`查签到本异常，直接尝试签到（${e.message}）`); }
        if (book && book.todayHasSigned) return this.log(`✅ 今日已签到${book.continuousDays ? `，已连续 ${book.continuousDays} 天` : ""}`);

        const r = await this.doSignin();
        if (r?.header?.code === 10000000) {
            const pt = r.body?.point ?? r.body?.integral ?? r.body?.score;
            return this.log(`✅ 签到成功${pt !== undefined ? `，+${pt}` : ""}`);
        }
        const msg = r?.header?.message || r?.header?.msg || short(r);
        if (/已签|签到过|重复|已完成|repeat/i.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        this.log(`❌ 签到失败: ${msg}`);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        const exp = parseJwt(cached.gwToken || "").exp || 0;
        if (cached.gwToken && exp > Math.floor(Date.now() / 1000) + 60) {
            this.gwToken = cached.gwToken;
            try { const b = await this.attendance(); this.log("使用缓存token"); return b; }
            catch (e) { this.log(`缓存token失效，重新登录（${e.message}）`); this.gwToken = ""; }
        }
        const code = await this.getCode();
        await this.xcxLogin(code);

        if (DIAG) await this.diagProbe();

        await this.exchangeGw();
        const cache = readCache();
        cache[this.account.openid] = { xcxToken: this.xcxToken, gwToken: this.gwToken, gacOpenId: this.gacOpenId, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log("登录成功");
    }
    // 诊断：用同一 xcxToken 换不同 username / 破坏 password，判断 username(手机号) 是否 load-bearing
    async diagProbe() {
        const idOf = (p) => { const j = parseJwt(p?.body?.accessToken || ""); return `code=${p?.header?.code} msg=${p?.header?.message || ""} jwt=${short(j, 260)}`; };
        try { this.log(`[DIAG] A 原username+真token => ${idOf(await this.exchangeGwRaw(OAUTH_USERNAME, this.xcxToken))}`); } catch (e) { this.log(`[DIAG] A err ${e.message}`); }
        try { this.log(`[DIAG] B 假username(13000000000)+真token => ${idOf(await this.exchangeGwRaw("13000000000", this.xcxToken))}`); } catch (e) { this.log(`[DIAG] B err ${e.message}`); }
        try { this.log(`[DIAG] C 空username+真token => ${idOf(await this.exchangeGwRaw("", this.xcxToken))}`); } catch (e) { this.log(`[DIAG] C err ${e.message}`); }
        try { this.log(`[DIAG] D 原username+破坏token => ${idOf(await this.exchangeGwRaw(OAUTH_USERNAME, this.xcxToken + "x"))}`); } catch (e) { this.log(`[DIAG] D err ${e.message}`); }
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                const cause = String(e.message).replace(/^NO_ACCOUNT:/, "");
                if (/隐私/.test(cause)) this.log(`⚠️ 该微信号需先在广汽小程序里同意隐私政策/授权一次（${cause}），这是一次性用户操作，之后再跑即可`);
                else this.log(`⚠️ 该微信号还没在广汽注册/绑定会员（${cause}），先在小程序里登录一次再跑`);
                return;
            }
            this.log(`执行失败: ${e.message || e}`);
        }
    }
}

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

!(async () => {
    $.checkEnv(ckName);
    if (!$.userCount) { $.log(`未找到变量 ${ckName}`); return; }
    for (let i = 0; i < $.userList.length; i++) {
        await new Task($.userList[i]).run();
        if (i < $.userList.length - 1) await $.wait(1500, 3000);
    }
})().catch((e) => $.log(e.message || e)).finally(() => $.done());
