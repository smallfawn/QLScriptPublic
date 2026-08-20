/*
------------------------------------------
@Description: 名创优品(MINISO) - 微信小程序静默登录 + 每日签到
cron: 30 8 * * *
------------------------------------------
变量名：mcyp
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx2a212470bade49bf）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

登录  POST https://cdn-storeexpress.miniso.com/wechat/login
      body = AES-128-CBC(hex) 加密的 {code, appid, isreturnuserinfo:1}
        AES key=0f9f...(16B hex) iv=3132...(即 "1234567890123455") CBC/Pkcs7 → 密文hex 作为原始 body
      头 signature = MD5(SIGN_PREFIX + time + "#" + nonce).大写；nonce/time 同头
      -> data.code==200 && data.data.skey；返回 skey/openid/unionid/uid/mobile
签到  基址 https://api-saas.miniso.com/task-manage-platform
      业务头带 content-skey/content-openid/content-unionid/content-uid + time/nonce/signature
      每请求 signature = MD5(<签名基串> + time + nonce).大写（无密钥，纯拼接校验）
      查询  GET  /api/activity/signInTask/taskDetail?activityId=18   base="signInTaskDetail"+activityId
              -> data.code==200，data.todaySignInFinishFlag(1=已签)/signInFinishDays/taskId
      签到  POST /api/activity/signInTask/award/receive  body={activityId:"18",taskId}  base=JSON.stringify(body)
              -> data.code==200 成功
AES key/iv、SIGN_PREFIX、activityId 均为该小程序固定应用常量（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("名创优品签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "mcyp";
const MINI_APP_ID = "wx2a212470bade49bf";
const AES_KEY_HEX = "0f9f8b1e791f754d2ded9dfb38a4b628";
const AES_IV_HEX = "31323334353637383930313233343535";
const SIGN_PREFIX = "#storeexpress1.0#ffe232&t%4df!67sx55eas#";
const LOGIN_URL = "https://cdn-storeexpress.miniso.com/wechat/login";
const API_HOST = "https://api-saas.miniso.com";
const DEFAULT_STORE_ID = "Z6XV";
const ACTIVITY_ID = 18;
const TOKEN_CACHE_FILE = path.join(__dirname, "mcyp_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

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
function short(v, n = 220) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function md5Upper(str) {
    return crypto.createHash("md5").update(String(str), "utf8").digest("hex").toUpperCase();
}
function aesEncryptHex(plainText) {
    const key = Buffer.from(AES_KEY_HEX, "hex");
    const iv = Buffer.from(AES_IV_HEX, "hex");
    const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
    return Buffer.concat([cipher.update(Buffer.from(plainText, "utf8")), cipher.final()]).toString("hex");
}
function genLoginNonce() {
    const chars = "1234567890qwertyuiopasdfghjklzxc";
    let r = "";
    for (let i = 0; i < 32; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
    return r;
}
function genNonce() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let r = "";
    for (let i = 0; i < 32; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
    return r;
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.skey = "";
        this.openid = "";
        this.unionid = "";
        this.uid = "";
        this.storeId = DEFAULT_STORE_ID;
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
        const time = Date.now().toString();
        const nonce = genLoginNonce();
        const signature = md5Upper(`${SIGN_PREFIX}${time}#${nonce}`);
        const plainBody = JSON.stringify({ code, appid: MINI_APP_ID, isreturnuserinfo: 1 });
        const encryptedBody = aesEncryptHex(plainBody);
        const headers = {
            "content-type": "application/json",
            version: "storeexpress1.0",
            "tenant-code": "MINISO",
            "can-flash-send": "false",
            "content-sceneid": "1027",
            "x-client-source": "MINISO_WX_MINI",
            "content-longitude": "[object Undefined]",
            "content-latitude": "[object Undefined]",
            "content-weappcode": "",
            "content-appcode": "",
            "content-uid": "",
            "content-skey": "",
            "content-openid": "",
            "content-unionid": "",
            nonce, time, signature,
            charset: "utf-8",
            referer: `https://servicewechat.com/${MINI_APP_ID}/1110/page-frame.html`,
            "user-agent": UA,
        };
        const res = await axios.request({
            method: "POST", url: LOGIN_URL, data: encryptedBody, headers,
            timeout: 20000, validateStatus: () => true,
        });
        const body = res.data || {};
        if (Number(body.code) === 200 && body.data && body.data.skey) {
            const d = body.data;
            this.skey = String(d.skey);
            this.openid = String(d.openid || "");
            this.unionid = String(d.unionid || "");
            this.uid = String(d.uid || "");
            this.storeId = DEFAULT_STORE_ID;
            const cache = readCache();
            cache[this.account.openid] = {
                skey: this.skey, openid: this.openid, unionid: this.unionid,
                uid: this.uid, storeId: this.storeId, updatedAt: new Date().toISOString(),
            };
            writeCache(cache);
            this.log("登录成功");
            return;
        }
        // 登录返回但无 skey：区分「未注册/需先激活会员」与普通失败
        const msg = body.message || body.msg || short(body);
        if (Number(body.code) !== 200 && /注册|未激活|会员|绑定|授权/.test(String(msg))) {
            this.unregistered = true;
            throw new Error(`NO_ACCOUNT:${msg}`);
        }
        throw new Error(`登录失败: ${msg}`);
    }
    bizHeaders() {
        return {
            host: "api-saas.miniso.com",
            "content-type": "application/json",
            version: "storeexpress1.0",
            "tenant-code": "MINISO",
            tenant: "MINISO",
            "x-mi-version": "5.1.64",
            "x-client-source": "MINISO_WX_MINI",
            "content-weappcode": "52",
            "content-appcode": "51",
            "content-sceneid": "1256",
            "content-pagetype": "%E6%BD%AC%E7%8E%A9%E7%AD%BE%E5%88%B0%E9%A1%B5%E9%9D%A2",
            "content-pagename": "%E6%BD%AC%E7%8E%A9%E7%AD%BE%E5%88%B0%E9%A1%B5%E9%9D%A2",
            "x-mi-store-id": this.storeId,
            "content-skey": this.skey,
            "content-openid": this.openid,
            "content-unionid": this.unionid,
            "content-uid": this.uid,
            "content-latitude": "[object Undefined]",
            "content-longitude": "[object Undefined]",
            "x-mi-city": "",
            "user-agent": UA,
            accept: "*/*",
            referer: `https://servicewechat.com/${MINI_APP_ID}/1084/page-frame.html`,
            "can-flash-send": "true",
        };
    }
    async bizGet(url, signBase) {
        const time = Date.now();
        const nonce = genNonce();
        const headers = { ...this.bizHeaders(), time, nonce, signature: md5Upper(String(signBase) + time + nonce) };
        const res = await axios.request({ method: "GET", url, headers, timeout: 20000, validateStatus: () => true });
        return res.data || {};
    }
    async bizPostJson(url, bodyObj) {
        const time = Date.now();
        const nonce = genNonce();
        const payload = JSON.stringify(bodyObj);
        const headers = { ...this.bizHeaders(), time, nonce, signature: md5Upper(payload + time + nonce) };
        const res = await axios.request({ method: "POST", url, data: payload, headers, timeout: 20000, validateStatus: () => true });
        return res.data || {};
    }
    isAuthErr(resp) {
        const code = Number(resp && resp.code);
        const msg = String((resp && (resp.message || resp.msg)) || "");
        if ([401, 403, 4001, 4003, 10401].includes(code)) return true;
        return /token|登录|未授权|失效|过期|未登录|鉴权|skey|会话/i.test(msg);
    }
    async getSignInTaskDetail() {
        const url = `${API_HOST}/task-manage-platform/api/activity/signInTask/taskDetail?activityId=${ACTIVITY_ID}`;
        return this.bizGet(url, "signInTaskDetail" + ACTIVITY_ID);
    }
    async completeSignIn(taskId) {
        const url = `${API_HOST}/task-manage-platform/api/activity/signInTask/award/receive`;
        return this.bizPostJson(url, { activityId: String(ACTIVITY_ID), taskId });
    }
    async sign(retry = true) {
        const detail = await this.getSignInTaskDetail();
        if (Number(detail.code) !== 200) {
            if (retry && this.isAuthErr(detail)) {
                this.log("会话失效，重新登录后重试");
                this.skey = "";
                await this.login();
                return this.sign(false);
            }
            const msg = detail.message || detail.msg || short(detail);
            if (/注册|未激活|会员|绑定/.test(String(msg))) { this.unregistered = true; throw new Error(`NO_ACCOUNT:${msg}`); }
            return this.log(`❌ 获取签到任务详情失败: ${msg}`);
        }
        const task = detail.data || {};
        if (task.taskId === undefined || task.taskId === null) {
            return this.log(`❌ 未拿到签到任务(taskId)，活动可能已结束或 activityId(${ACTIVITY_ID}) 需更新: ${short(detail)}`);
        }
        if (task.todaySignInFinishFlag === 1 || task.todaySignInFinishFlag === true) {
            return this.log(`✅ 今日已签到，连续签到 ${task.signInFinishDays ?? "?"} 天`);
        }
        const nextDay = (task.signInFinishDays || 0) + 1;
        const res = await this.completeSignIn(task.taskId);
        if (Number(res.code) === 200) {
            return this.log(`✅ 签到成功，第 ${nextDay} 天`);
        }
        const msg = res.message || res.msg || short(res);
        if (/已签|签到过|重复|已完成|已领取/.test(String(msg))) return this.log(`✅ 今日已签到（${msg}）`);
        if (retry && this.isAuthErr(res)) {
            this.log("会话失效，重新登录后重试");
            this.skey = "";
            await this.login();
            return this.sign(false);
        }
        this.log(`❌ 签到失败: ${msg}`);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.skey && cached.skey) {
            this.skey = cached.skey;
            this.openid = cached.openid || "";
            this.unionid = cached.unionid || "";
            this.uid = cached.uid || "";
            this.storeId = cached.storeId || DEFAULT_STORE_ID;
            this.log("使用缓存token");
            return;
        }
        if (!this.skey) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在名创优品注册/激活会员（${String(e.message).replace(/^NO_ACCOUNT:/, "")}），先在小程序里登录一次再跑`);
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
