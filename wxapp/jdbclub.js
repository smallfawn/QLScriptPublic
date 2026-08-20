/*
------------------------------------------
@Description: 加多宝Club(JDB俱乐部) - 微信小程序静默登录 + 每日签到
cron: 5 10 * * *
------------------------------------------
变量名：jdbclub
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx8371875e443e177f，host api-mp.jdbchina.com）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录；鉴权双 token：unique_identity + apitoken）

响应统一壳：{success:bool, msg, data}
登录  POST /geement.authjextra/api/v1/loginsession/2weichatmicroprogram
        form: jscode=<wx.login code> & app_id & client_code   -> data.token (= unique_identity)
授权  GET  /geement.authjextra/api/v1/common/nanoprogramauth
        query: app_id & client_code & jscode=<第二个 wx.login code>  -> data (= apitoken；失败则用 token 兜底)
业务头 unique_identity=token / apitoken=apitoken||token
用户  GET  /geement.usercenter/api/v1/user/information -> data.extra_memberinfo.member_status(1=会员)
手机  POST /geement.authjextra/api/v1/loginsession/2weichatmicroprogram/getuserphonenumberwithcheckid
        form: code=<新式手机号 phoneCode(/wx/getphonenumber)> & app_id & client_code -> data.check_id / data.phone_number
注册  POST /geement.usercenter/api/v1/user/informationvbyfiled  (json，附 check_id) -> data.register_member_result.member_id
签到活动 GET /geement.marketingplay/api/v1/signin?status=30&pageNum=1&pageSize=1 -> data[0].activitydto.id
签到状态 GET /geement.marketingplay/api/v1/signin/userinfo?task_id=<id> -> total_signindays / latest_signin_time
签到    POST /geement.marketingplay/api/v1/signin/signbyuser  form: task_id=<id>  -> success

CLIENT_CODE 是该小程序固定应用标识（原脚本硬编码，非个人凭证）。
手机号走新式 phoneCode(/wx/getphonenumber 的 data.code)，后端解密，不涉及老式 encryptedData+iv 配对。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("加多宝Club签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "jdbclub";
const MINI_APP_ID = "wx8371875e443e177f";
const CLIENT_CODE = "CLI2113448692";
const PAGE_VERSION = "45";
const BASE_URL = "https://api-mp.jdbchina.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "jdbclub_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const EP_LOGIN = "/geement.authjextra/api/v1/loginsession/2weichatmicroprogram";
const EP_AUTH = "/geement.authjextra/api/v1/common/nanoprogramauth";
const EP_GET_PHONE = "/geement.authjextra/api/v1/loginsession/2weichatmicroprogram/getuserphonenumberwithcheckid";
const EP_REGISTER = "/geement.usercenter/api/v1/user/informationvbyfiled";
const EP_USER_INFO = "/geement.usercenter/api/v1/user/information";
const EP_SIGNIN_LIST = "/geement.marketingplay/api/v1/signin";
const EP_SIGNIN_USERINFO = "/geement.marketingplay/api/v1/signin/userinfo";
const EP_SIGNIN_DO = "/geement.marketingplay/api/v1/signin/signbyuser";

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
function formEncode(obj) {
    return Object.keys(obj).map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join("&");
}
function chinaDateStr() {
    const d = new Date(Date.now() + 8 * 3600 * 1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.apitoken = "";
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
    async getPhoneCode() {
        const { data } = await axios.post(
            `${wechat.serverUrl}/wx/getphonenumber`,
            { appid: MINI_APP_ID, openid: this.account.openid },
            { headers: { auth: wechat.auth }, timeout: 60000, validateStatus: () => true }
        );
        if (!data || data.status === false) { this.log(`获取手机号 code 失败: ${short(data)}`); return ""; }
        const phoneCode = data?.data?.code || data?.code || "";
        if (!phoneCode) { this.log(`wx_server 未返回手机号 code: ${short(data)}`); return ""; }
        return phoneCode;
    }
    // method: GET/POST；opts: {params, form, json, withToken}
    async request(method, apiPath, { params, form, json, withToken = true } = {}) {
        const headers = {
            "User-Agent": UA,
            Accept: "*/*",
            xweb_xhr: "1",
            "Sec-Fetch-Site": "cross-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            "Accept-Language": "zh-CN,zh;q=0.9",
        };
        if (withToken && this.token) {
            headers["unique_identity"] = this.token;
            headers["apitoken"] = this.apitoken || this.token;
        }
        let data;
        if (form) { headers["Content-Type"] = "application/x-www-form-urlencoded"; data = formEncode(form); }
        else if (json) { headers["Content-Type"] = "application/json"; data = JSON.stringify(json); }
        const res = await axios.request({
            method, url: `${BASE_URL}${apiPath}`, params, data, headers,
            timeout: 20000, validateStatus: () => true,
        });
        if (res.data && typeof res.data === "object") return res.data;
        return { success: false, msg: `HTTP ${res.status}: ${short(res.data)}` };
    }
    async login() {
        const loginCode = await this.getCode();
        const res = await this.request("POST", EP_LOGIN, {
            form: { jscode: loginCode, app_id: MINI_APP_ID, client_code: CLIENT_CODE },
            withToken: false,
        });
        const token = res?.data?.token;
        if (!token) throw new Error(`登录未返回 token（可能未注册/取码失败）: ${short(res)}`);
        this.token = String(token);
        this.log("登录成功");
        // 第二个 code 换 apitoken（失败则用 token 兜底）
        try {
            const authCode = await this.getCode();
            const authRes = await this.request("GET", EP_AUTH, {
                params: { app_id: MINI_APP_ID, client_code: CLIENT_CODE, jscode: authCode },
                withToken: false,
            });
            this.apitoken = (authRes && authRes.data) ? String(authRes.data) : this.token;
        } catch (e) {
            this.log(`apitoken 获取异常，用 token 兜底: ${e.message || e}`);
            this.apitoken = this.token;
        }
        const cache = readCache();
        cache[this.account.openid] = { token: this.token, apitoken: this.apitoken, updatedAt: new Date().toISOString() };
        writeCache(cache);
    }
    async ensureMember() {
        const info = await this.request("GET", EP_USER_INFO);
        if (!info?.success) { this.log(`查询用户信息失败: ${info?.msg || short(info)}`); return false; }
        const ud = info.data || {};
        const memberInfo = ud.extra_memberinfo || {};
        if (memberInfo.member_status === 1) {
            const mid = (memberInfo.memberdto || {}).m_id || "";
            this.log(`已是会员${mid ? ` (ID:${mid})` : ""}`);
            return true;
        }
        this.log("尚未注册会员，尝试手机验证+注册");
        const phoneCode = await this.getPhoneCode();
        if (!phoneCode) { this.unregistered = true; return false; }
        const phoneResp = await this.request("POST", EP_GET_PHONE, {
            form: { code: phoneCode, app_id: MINI_APP_ID, client_code: CLIENT_CODE },
        });
        if (!phoneResp?.success) { this.log(`手机号验证失败: ${phoneResp?.msg || short(phoneResp)}`); this.unregistered = true; return false; }
        const checkId = phoneResp.data?.check_id;
        const phoneNumber = phoneResp.data?.phone_number || "";
        if (!checkId) { this.log("手机号验证未返回 check_id"); this.unregistered = true; return false; }
        const regResp = await this.request("POST", EP_REGISTER, {
            json: {
                custom_fields: phoneNumber ? [{ id: "phone", field_valuestr: phoneNumber }] : [],
                register_member: true,
                register_member_phonenumbercheckdto: { system_checkid: checkId },
                member_sourceinfo: { source_key01: "jdbmember001", source_key02: "加多宝小程序虚拟门店", source_key03: "", source_key04: "" },
            },
        });
        if (regResp?.success) {
            const mid = (regResp.data?.register_member_result || {}).member_id || "";
            this.log(`注册会员成功${mid ? ` (ID:${mid})` : ""}`);
            return true;
        }
        this.log(`注册会员失败: ${regResp?.msg || short(regResp)}`);
        this.unregistered = true;
        return false;
    }
    async signin() {
        const list = await this.request("GET", EP_SIGNIN_LIST, { params: { status: 30, pageNum: 1, pageSize: 1 } });
        if (!list?.success) { this.log(`❌ 获取签到活动失败: ${list?.msg || short(list)}`); return; }
        const arr = list.data || [];
        if (!arr.length) { this.log("暂无进行中的签到活动"); return; }
        const activityId = arr[0]?.activitydto?.id;
        if (!activityId) { this.log("❌ 签到失败: 未返回活动 ID"); return; }
        this.log(`签到活动 ID: ${activityId}`);

        const ui = await this.request("GET", EP_SIGNIN_USERINFO, { params: { task_id: activityId } });
        let total = 0, already = false;
        if (ui?.success) {
            const ud = ui.data || {};
            total = ud.total_signindays || 0;
            const cont = ud.continuity_signindays || 0;
            this.log(`累计 ${total} 天，连续 ${cont} 天`);
            const latest = String(ud.latest_signin_time || "");
            if (latest.startsWith(chinaDateStr())) already = true;
        }
        if (already) { this.log(`✅ 今日已签到 (累计${total}天)`); return; }

        const resp = await this.request("POST", EP_SIGNIN_DO, { form: { task_id: activityId } });
        if (resp?.success) { this.log(`✅ 签到成功 (累计${total + 1}天)`); return; }
        const msg = resp?.msg || short(resp);
        if (/已完成签到|已经签到|已签|重复/.test(String(msg))) { this.log(`✅ 今日已签到（${msg}）`); return; }
        this.log(`❌ 签到失败: ${msg}`);
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token) { this.token = cached.token; this.apitoken = cached.apitoken || cached.token; this.log("使用缓存token"); return; }
        if (!this.token) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            const isMember = await this.ensureMember();
            if (!isMember && this.unregistered) {
                this.log("⚠️ 该微信号还没在加多宝Club注册会员（手机号验证/注册未通过），先在小程序里登录注册一次再跑");
                // 仍尝试签到一次，若接口本身允许则可签
            }
            await this.signin();
        } catch (e) {
            if (/未返回 token/.test(String(e.message))) {
                this.log("⚠️ 登录未拿到 token（该微信号可能未注册加多宝Club），先在小程序里注册一次再跑");
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
