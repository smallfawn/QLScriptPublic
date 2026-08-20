/*
------------------------------------------
@Description: 唯品会 - 微信小程序静默登录 + 每日签到（唯品币签到）
cron: 40 7,19 * * *
------------------------------------------
变量名：wph
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxe9714e742209d35f，host mapi.vip.com / weixin-api.vip.com / act-ug.vip.com）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录，登录只用 wx.login code，不需要 encryptedData）

登录1(拿 VIP_TANK/userId)  POST https://mapi.vip.com/vips-mobile/rest/auth/third_party/trylogin/v1?api_key=API_KEY
   body: baseData + {hash, code, event:2, deviceId:marsCid, context:'{"iv":"","encryptedData":""}',
                     source_app_type:"shop_weixin_mina", login_type:"WEIXIN_SMALL_APP", third_type:"WEIXIN"}
   -> code===1 && data.tokenId(=VIP_TANK)、data.userId
登录2(拿 vip openid)        POST https://weixin-api.vip.com/v4/LiteApp/getUserInfo?api_key=API_KEY
   body: baseData + {code, iv:"", encryptedData:"", hash}
   -> code===0 && data.openid(=vip 侧 openid，服务端由 code 派生，非明文微信 openid)、data.unionid
状态  POST https://act-ug.vip.com/checkInAward/withSign/info?api_key=API_KEY  body baseData+{openid:vipOpenid,actId:ACT_ID,biz_code:"old"}
        -> code===1，data.checkInList[isCheckInDay==1].isCheckIn==1 表示今日已签
签到  POST https://act-ug.vip.com/checkInAward/withSign/checkin?api_key=API_KEY 同上 body -> code===1

请求签名（仅 act-ug 签到接口带）：
  secret = aes-128-cbc-decrypt(base64(SIGN_SECRET_ENC), key="weixin_smallmina", iv="weixin"+10*0x00)
  paramHash = sha1( 参数按 key 升序、剔除 api_key、拼成 k=v&... ，对象值 JSON.stringify )
  api_sign  = sha1( path + paramHash + VIP_TANK + marsCid + secret )
  Authorization: OAuth api_sign=<api_sign>；Cookie: mars_cid/userId/warehouse/VIP_TANK/wap_consumer
  X-Traceid: <cookie>;__need_sign=1

API_KEY / HASH / ACT_ID / SIGN_SECRET_ENC / marsCid算法 均为该小程序固定应用常量（原脚本硬编码，非个人凭证）。
marsCid 为设备号，首次生成后按账号缓存复用（登录与签名都要用同一个）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("唯品会签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "wph";
const MINI_APP_ID = "wxe9714e742209d35f";
const PACKAGE_VERSION = "1371";
const MINI_APP_VERSION = "2.19.13.20260731";
const API_KEY = "ce29a51aa5c94a318755b2529dcb8e0b";
const HASH = "ptx26";
const ACT_ID = "H3gRnE1Xi18=";
const SIGN_SECRET_ENC = "Ql4mW09F3urBNdzBLfK6UuRTqj22Bta7eEKTO7n5jFf9uU6FZZmcfe/gurOAOB+o";
const DEFAULT_WAREHOUSE = "VIP_NH";
const DEFAULT_PROVINCE = "104104";
const DEFAULT_AREA = "104104101";
const TOKEN_CACHE_FILE = path.join(__dirname, "wph_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
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
function short(v, n = 300) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function mask(v = "") {
    v = String(v || "");
    if (!v) return "";
    if (v.length <= 12) return `${v.slice(0, 3)}***`;
    return `${v.slice(0, 6)}***${v.slice(-6)}`;
}
function sha1(text) {
    return crypto.createHash("sha1").update(String(text)).digest("hex");
}
// @wxnpm/wx-randcode 同款格式：13位时间戳_32位hex(带校验位)
function createMarsCid() {
    const timestamp = Date.now().toString();
    const randomHex = crypto.randomBytes(16).toString("hex");
    let sum = [...timestamp].reduce((total, value) => total + Number(value), 0);
    const checksumIndex = sum % 32;
    for (let i = 0; i < randomHex.length; i++) {
        if (i !== checksumIndex) sum += parseInt(randomHex[i], 16);
    }
    const checksum = (sum % 16).toString(16);
    return `${timestamp}_${randomHex.slice(0, checksumIndex)}${checksum}${randomHex.slice(checksumIndex + 1)}`;
}
function normalizeMarsCid(value) {
    const candidate = String(value || "").trim();
    return /^\d{13}_[0-9a-f]{32}$/i.test(candidate) ? candidate : createMarsCid();
}
function aesDecryptBase64(text) {
    const key = Buffer.from("weixin_smallmina");
    const iv = Buffer.concat([Buffer.from("weixin"), Buffer.alloc(10)]);
    const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    let out = decipher.update(text, "base64", "utf8");
    out += decipher.final("utf8");
    return out;
}
function form(data = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null) continue;
        params.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
    }
    return params.toString();
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.openid = this.account.openid;
        this.token = "";
        this.userId = "";
        this.vipOpenid = "";
        this.unionid = "";
        this.marsCid = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    baseData() {
        return {
            app_name: "shop_weixin_mina",
            client: "wechat_mini_program",
            source_app: "shop_weixin_mina",
            api_key: API_KEY,
            app_version: "4.0",
            client_type: "wap",
            format: "json",
            mobile_platform: "2",
            ver: "2.0",
            standby_id: "native",
            union_mark: "",
            sd_tuijian: "",
            mobile_channel: "nature",
            mars_cid: this.marsCid,
            warehouse: DEFAULT_WAREHOUSE,
            fdc_area_id: DEFAULT_AREA,
            province_id: DEFAULT_PROVINCE,
            wap_consumer: "A1",
            t: Math.floor(Date.now() / 1000),
            net: "WIFI",
            width: 375,
            height: 667,
            phone_model: "Windows",
            phone_brand: "microsoft",
            sys_version: "Windows 10",
            is_default_area: "1",
            app_theme_mode: "0",
            app_theme_action: "0",
            req_scene: 0,
        };
    }
    cookie() {
        return [
            `mars_cid=${this.marsCid}`,
            this.userId ? `userId=${this.userId}` : "",
            `warehouse=${DEFAULT_WAREHOUSE}`,
            this.token ? `VIP_TANK=${this.token}` : "",
            "wap_consumer=A1",
        ].filter(Boolean).join(";");
    }
    paramHash(data = {}) {
        const sorted = Object.keys(data).sort().reduce((obj, key) => { obj[key] = data[key]; return obj; }, {});
        const text = Object.keys(sorted)
            .filter((key) => key !== "api_key")
            .map((key) => {
                let value = sorted[key];
                if (typeof value === "object") value = JSON.stringify(value);
                return `${key}=${value}`;
            })
            .join("&");
        return sha1(text);
    }
    signedHeaders(url, data) {
        const pathOnly = url.replace(/^http(s)?:\/\/.*?\//, "/");
        const secret = aesDecryptBase64(SIGN_SECRET_ENC);
        const apiSign = sha1(`${pathOnly}${this.paramHash(data)}${this.token}${this.marsCid}${secret}`);
        const cookie = this.cookie();
        return {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: cookie,
            "X-Traceid": `${cookie};__need_sign=1`,
            Authorization: `OAuth api_sign=${apiSign}`,
        };
    }
    async request(url, data, headers) {
        const res = await axios.request({
            method: "POST",
            url,
            data: form(data),
            timeout: 30000,
            validateStatus: () => true,
            headers: {
                Accept: "application/json, text/plain, */*",
                "User-Agent": UA,
                Referer: `https://servicewechat.com/${MINI_APP_ID}/${PACKAGE_VERSION}/page-frame.html`,
                ...(headers || {}),
            },
        });
        return { status: res.status, data: res.data };
    }
    async getCode() {
        const { data } = await wechat.getCode(this.openid);
        if (data && data.status === false) throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }
    // 登录1：trylogin -> VIP_TANK + userId
    async autoLogin(code) {
        const data = {
            ...this.baseData(),
            hash: HASH,
            code,
            event: 2,
            deviceId: this.marsCid,
            context: JSON.stringify({ iv: "", encryptedData: "" }),
            source_app_type: "shop_weixin_mina",
            login_type: "WEIXIN_SMALL_APP",
            third_type: "WEIXIN",
        };
        const { status, data: res } = await this.request(
            `https://mapi.vip.com/vips-mobile/rest/auth/third_party/trylogin/v1?api_key=${API_KEY}`,
            data,
            { "Content-Type": "application/x-www-form-urlencoded", Cookie: this.cookie() }
        );
        if (status !== 200 || Number(res?.code) !== 1 || !res?.data?.tokenId) {
            // code 70202 / "没有绑定唯品会账户" = 该微信号未绑定/未注册唯品会账户
            const msg = String(res?.msg || "");
            if (Number(res?.code) === 70202 || /没有绑定|未绑定|绑定唯品会/.test(msg)) {
                this.unregistered = true;
                throw new Error("NO_ACCOUNT:未绑定唯品会账户");
            }
            throw new Error(`自动登录失败 HTTP ${status}: ${short(res)}`);
        }
        this.token = res.data.tokenId;
        this.userId = String(res.data.userId || "");
        this.log(`登录成功 userId=${this.userId || "-"} VIP_TANK=${mask(this.token)}`);
    }
    // 登录2：getUserInfo -> vip openid（服务端由 code 派生，非明文微信 openid）
    async getVipWechatInfo(code) {
        const data = { ...this.baseData(), code, iv: "", encryptedData: "", hash: HASH };
        const { status, data: res } = await this.request(
            `https://weixin-api.vip.com/v4/LiteApp/getUserInfo?api_key=${API_KEY}`,
            data,
            { "Content-Type": "application/x-www-form-urlencoded", Cookie: this.cookie() }
        );
        if (status !== 200 || Number(res?.code) !== 0 || !res?.data?.openid) {
            throw new Error(`获取唯品会openid失败 HTTP ${status}: ${short(res)}`);
        }
        this.vipOpenid = res.data.openid;
        this.unionid = res.data.unionid || this.unionid;
        this.log(`唯品会openid获取成功: ${mask(this.vipOpenid)}`);
    }
    saveCache() {
        const cache = readCache();
        cache[this.openid] = {
            ...(cache[this.openid] || {}),
            token: this.token || (cache[this.openid] || {}).token || "",
            userId: this.userId || (cache[this.openid] || {}).userId || "",
            vipOpenid: this.vipOpenid || (cache[this.openid] || {}).vipOpenid || "",
            unionid: this.unionid || (cache[this.openid] || {}).unionid || "",
            marsCid: this.marsCid,
            updatedAt: new Date().toISOString(),
        };
        writeCache(cache);
    }
    removeLoginCache() {
        const cache = readCache();
        if (cache[this.openid]) {
            delete cache[this.openid].token;
            delete cache[this.openid].userId;
            writeCache(cache);
        }
    }
    async login() {
        // trylogin 与 getUserInfo 各自需要一个未消耗的 wx.login code，分别取
        const code1 = await this.getCode();
        await this.autoLogin(code1);
        this.saveCache();
        const code2 = await this.getCode();
        await this.getVipWechatInfo(code2);
        this.saveCache();
    }
    async ensureLogin() {
        const cached = readCache()[this.openid] || {};
        this.marsCid = normalizeMarsCid(cached.marsCid || this.marsCid);
        this.token = this.token || cached.token || "";
        this.userId = this.userId || cached.userId || "";
        this.vipOpenid = this.vipOpenid || cached.vipOpenid || "";
        this.unionid = this.unionid || cached.unionid || "";
        if (this.token && this.userId && this.vipOpenid) {
            this.log(`使用缓存登录态 userId=${this.userId} VIP_TANK=${mask(this.token)}`);
            this.saveCache();
            return;
        }
        await this.login();
    }
    async signInfo() {
        const url = "https://act-ug.vip.com/checkInAward/withSign/info";
        const data = { ...this.baseData(), openid: this.vipOpenid, actId: ACT_ID, biz_code: "old" };
        const { status, data: res } = await this.request(`${url}?api_key=${API_KEY}`, data, this.signedHeaders(url, data));
        if (status !== 200 || Number(res?.code) !== 1) {
            if (Number(res?.code) === 10013 || Number(res?.code) === -2) { this.removeLoginCache(); throw new Error("SESSION_EXPIRED"); }
            throw new Error(`签到查询失败 HTTP ${status}: ${short(res)}`);
        }
        const info = res.data || {};
        const today = (info.checkInList || []).find((item) => Number(item.isCheckInDay) === 1) || {};
        this.log(
            `签到信息: 今日${Number(today.isCheckIn) === 1 ? "已签" : "未签"}，累计${info.numTotal ?? "-"}天，连续${info.nonStopNum ?? "-"}天，已得唯品币${info.awardVipcoinTotal ?? "-"}`
        );
        return info;
    }
    async doCheckin() {
        const url = "https://act-ug.vip.com/checkInAward/withSign/checkin";
        const data = { ...this.baseData(), openid: this.vipOpenid, actId: ACT_ID, biz_code: "old" };
        const { status, data: res } = await this.request(`${url}?api_key=${API_KEY}`, data, this.signedHeaders(url, data));
        if (status !== 200 || Number(res?.code) !== 1) {
            const msg = String(res?.msg || res?.msgSpecial || "");
            if (/已签|重复|already/i.test(msg)) { this.log(`✅ 今日已签到（${msg}）`); return; }
            if (Number(res?.code) === 10013 || Number(res?.code) === -2) { this.removeLoginCache(); throw new Error("SESSION_EXPIRED"); }
            throw new Error(`签到失败 HTTP ${status}: ${short(res)}`);
        }
        const result = res.data || {};
        this.log(`✅ 签到成功，获得${result.awardAmount ?? result.awardValDesc ?? "唯品币"}，累计${result.numTotal ?? "-"}天，连续${result.nonStopNum ?? "-"}天`);
    }
    async sign() {
        const before = await this.signInfo();
        const today = (before.checkInList || []).find((item) => Number(item.isCheckInDay) === 1) || {};
        if (Number(today.isCheckIn) === 1) { this.log("✅ 今日已签到"); return; }
        await this.doCheckin();
        // 重新查询以输出准确的累计/连续天数
        try { await this.signInfo(); } catch (e) {}
    }
    async run() {
        if (!this.openid) { this.log("跳过：变量值里没有 openid"); return; }
        this.log(`开始执行 ${mask(this.openid)}`);
        try {
            await this.ensureLogin();
            await this.sign();
            this.saveCache();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log("⚠️ 该微信号还没绑定唯品会账户，先在唯品会小程序里登录/绑定一次再跑");
                return;
            }
            if (String(e.message) === "SESSION_EXPIRED") {
                // 缓存态失效，清缓存后整链重来一次
                this.log("会话失效，重新登录后重试");
                try {
                    this.token = ""; this.userId = ""; this.vipOpenid = ""; this.unionid = "";
                    await this.login();
                    await this.sign();
                    this.saveCache();
                    return;
                } catch (e2) {
                    this.log(`执行失败: ${e2.message || e2}`);
                    return;
                }
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
