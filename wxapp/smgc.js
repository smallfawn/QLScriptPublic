/*
------------------------------------------
@Description: 上美广场(SM广场) - 微信小程序静默登录 + 每日签到（多城市）
cron: 20 9,21 * * *
------------------------------------------
变量名：smgc
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
smgc_malls     可选，只跑指定城市（逗号分隔，如“成都,厦门”或用MallID）；不填=全部5城
------------------------------------------
契约（appid wx383a677b99e64655，平台 mallcoo，host m.mallcoo.cn）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录；无签名机制）

平台为“猫酷/mallcoo”多商场会员系统，5个SM广场各是独立 MallID：
  成都=11544 晋江=12135 扬州=12540 厦门=11086 重庆=12305
每个商场需各自 code 登录（code2session 单次消耗），token+projectId 逐商场缓存。

项目  POST /api/home/Mall/GetProjectConfigIDStandard  {MallID,Header:{Token:null,systemInfo}}（不需登录）
        -> m==1，d = ProjectConfigID
登录  POST /a/liteapp/api/identitys/LoginForThirdV2
        {MallID,Code:<wx code>,AppID,OpenID:"",NotVCodeAndGraphicVCode:true,SNSType:8,Header:{Token:null,systemInfo}}
        -> m==1，d.Token（=后续 token），d.NickName；无 Token 视为未注册/需绑定
鉴权头 后续请求 Header.Token = `${Token},${ProjectConfigID}`
状态  POST /api/user/user/GetNoticeFavoriteAndCheckinCount {MallId,Header:{Token:auth,...}}
        -> m==1，d.IsOpenCheckin / d.IsCheckInToday
签到  POST /api/user/User/CheckinV2 {MallID,Header:{Token:auth,...}} -> m==1，d.Msg
积分  POST /api/user/user/GetUserAndMallCard {MallId,...} -> m==1，d.Bonus
成功码 m==1；错误信息在 e。MallID/城市为固定应用常量，非个人凭证。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("上美广场签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "smgc";
const MINI_APP_ID = "wx383a677b99e64655";
const BASE_URL = "https://m.mallcoo.cn";
const TOKEN_CACHE_FILE = path.join(__dirname, "smgc_token_cache.json");

const EP_PROJECT = "/api/home/Mall/GetProjectConfigIDStandard";
const EP_LOGIN = "/a/liteapp/api/identitys/LoginForThirdV2";
const EP_CHECK = "/api/user/user/GetNoticeFavoriteAndCheckinCount";
const EP_SIGN = "/api/user/User/CheckinV2";
const EP_ACCOUNT = "/api/user/user/GetUserAndMallCard";

const MALLS = [
    { name: "成都", id: 11544 },
    { name: "晋江", id: 12135 },
    { name: "扬州", id: 12540 },
    { name: "厦门", id: 11086 },
    { name: "重庆", id: 12305 },
];

const mallFilter = String(process.env.smgc_malls || "")
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
const ACTIVE_MALLS = mallFilter.length
    ? MALLS.filter((m) => mallFilter.includes(m.name) || mallFilter.includes(String(m.id)))
    : MALLS;

const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/16133";

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

function systemInfo() {
    return {
        model: "microsoft",
        SDKVersion: "3.8.10",
        system: "Windows 10 x64",
        version: "4.0.6.21",
        miniVersion: "DZ.2.5.64.1.SM.24",
    };
}

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
function isAuthErr(msg) {
    return /token|登录|未登录|未授权|鉴权|失效|过期|重新登录|请先登录|未授权|invalid/i.test(String(msg || ""));
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.token = "";
        this.projectId = "";
        this.nickName = "";
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    cacheKey(mall) { return `${this.account.openid}#${mall.id}`; }

    async post(apiPath, payload, { auth = true } = {}) {
        const header = { systemInfo: systemInfo() };
        header.Token = auth ? `${this.token},${this.projectId}` : null;
        const body = Object.assign({}, payload, { Header: header });
        const res = await axios.request({
            method: "POST",
            url: `${BASE_URL}${apiPath}`,
            data: JSON.stringify(body),
            headers: {
                "user-agent": UA,
                "xweb_xhr": "1",
                "content-type": "application/json",
                accept: "*/*",
                referer: `https://servicewechat.com/${MINI_APP_ID}/15/page-frame.html`,
                "accept-language": "zh-CN,zh;q=0.9",
            },
            timeout: 30000,
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

    async getProjectId(mall) {
        const data = await this.post(EP_PROJECT, { MallID: mall.id }, { auth: false });
        if (data && data.m === 1 && (data.d || data.d === 0)) return data.d;
        throw new Error(`[${mall.name}] 获取项目ID失败: ${data ? (data.e || short(data)) : "无响应"}`);
    }

    async doLogin(mall, cachedProjectId) {
        this.projectId = cachedProjectId || (await this.getProjectId(mall));
        const code = await this.getCode();
        const data = await this.post(
            EP_LOGIN,
            { MallID: mall.id, Code: code, AppID: MINI_APP_ID, OpenID: "", NotVCodeAndGraphicVCode: true, SNSType: 8 },
            { auth: false }
        );
        if (!data || data.m !== 1) {
            const e = data ? (data.e || short(data)) : "无响应";
            if (/未注册|绑定|手机号|会员|注册|授权|用户不存在|不存在|未找到用户|暂无数据|无数据/.test(String(e))) { this.unregistered = true; throw new Error(`NO_ACCOUNT:${e}`); }
            throw new Error(`[${mall.name}] 登录失败: ${e}`);
        }
        const d = data.d || {};
        this.token = String(d.Token || "");
        this.nickName = d.NickName || "";
        if (!this.token) { this.unregistered = true; throw new Error(`NO_ACCOUNT:登录未返回Token(可能未注册/需绑定手机号)`); }
        const cache = readCache();
        cache[this.cacheKey(mall)] = { token: this.token, projectId: this.projectId, nickName: this.nickName, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`[${mall.name}] 登录成功${this.nickName ? ` (${this.nickName})` : ""}`);
    }

    async ensureLogin(mall) {
        this.token = ""; this.projectId = ""; this.nickName = "";
        const cached = readCache()[this.cacheKey(mall)] || {};
        if (cached.token && (cached.projectId || cached.projectId === 0)) {
            this.token = cached.token; this.projectId = cached.projectId; this.nickName = cached.nickName || "";
            this.log(`[${mall.name}] 使用缓存token`);
            return;
        }
        await this.doLogin(mall, cached.projectId);
    }

    clearCache(mall) {
        const cache = readCache();
        delete cache[this.cacheKey(mall)];
        writeCache(cache);
    }

    async accountInfo(mall) {
        try {
            const data = await this.post(EP_ACCOUNT, { MallId: mall.id });
            if (data && data.m === 1) return (data.d || {}).Bonus;
        } catch (e) {}
        return undefined;
    }

    async doSign(mall, retry = true) {
        // 1. 查询签到状态
        const st = await this.post(EP_CHECK, { MallId: mall.id });
        if (!st || st.m !== 1) {
            const e = st ? (st.e || short(st)) : "无响应";
            if (retry && isAuthErr(e)) {
                this.log(`[${mall.name}] 会话失效，重新登录后重试`);
                this.clearCache(mall);
                await this.doLogin(mall);
                return this.doSign(mall, false);
            }
            return this.log(`[${mall.name}] ❌ 查询签到状态失败: ${e}`);
        }
        const d = st.d || {};
        if (!d.IsOpenCheckin) return this.log(`[${mall.name}] ⚠️ 该商场未开放签到，跳过`);
        if (d.IsCheckInToday) {
            const pts = await this.accountInfo(mall);
            return this.log(`[${mall.name}] ✅ 今日已签到${pts !== undefined ? `，积分 ${pts}` : ""}`);
        }
        // 2. 执行签到
        const sr = await this.post(EP_SIGN, { MallID: mall.id });
        if (sr && sr.m === 1) {
            const msg = (sr.d || {}).Msg || "签到成功";
            const pts = await this.accountInfo(mall);
            return this.log(`[${mall.name}] ✅ 签到成功：${msg}${pts !== undefined ? `，积分 ${pts}` : ""}`);
        }
        const e = sr ? (sr.e || short(sr)) : "无响应";
        if (/已签|签到过|重复|已完成/.test(String(e))) return this.log(`[${mall.name}] ✅ 今日已签到（${e}）`);
        if (retry && isAuthErr(e)) {
            this.log(`[${mall.name}] 会话失效，重新登录后重试`);
            this.clearCache(mall);
            await this.doLogin(mall);
            return this.doSign(mall, false);
        }
        this.log(`[${mall.name}] ❌ 签到失败: ${e}`);
    }

    async runMall(mall) {
        try {
            await this.ensureLogin(mall);
            await this.doSign(mall);
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`[${mall.name}] ⚠️ 该微信号未在此SM广场注册会员（${String(e.message).slice(10)}），先在小程序里登录/绑定一次再跑`);
                return;
            }
            this.log(`[${mall.name}] 执行失败: ${e.message || e}`);
        }
    }

    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        for (let i = 0; i < ACTIVE_MALLS.length; i++) {
            await this.runMall(ACTIVE_MALLS[i]);
            if (i < ACTIVE_MALLS.length - 1) await $.wait(1500, 3000);
        }
    }
}

!(async () => {
    $.checkEnv(ckName);
    if (!$.userCount) { $.log(`未找到变量 ${ckName}`); return; }
    $.log(`本次将处理 ${ACTIVE_MALLS.length} 个SM广场：${ACTIVE_MALLS.map((m) => m.name).join("、")}`);
    for (let i = 0; i < $.userList.length; i++) {
        await new Task($.userList[i]).run();
        if (i < $.userList.length - 1) await $.wait(1500, 3000);
    }
})().catch((e) => $.log(e.message || e)).finally(() => $.done());
