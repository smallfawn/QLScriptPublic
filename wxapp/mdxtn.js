/*
------------------------------------------
@Description: 美的小天鹅 - 微信小程序静默登录 + 每日任务/签到
cron: 12 11 * * *
------------------------------------------
变量名：mdxtn
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx33856a6b31431c6e）：
（迁移自 YYB-GO 系脚本，原脚本 code 登录，无个人凭证）

登录三步：
 1) wcs 取 wx code
 2) POST https://mcsp.midea.com/api/cms_bff/mcsp-uc-mvip-bff/app/login/wx/mini/getLoginInfo.do
      body {jsCode:code, platformType:"WX_LS_MINI", loginMode:1}
      -> code=="000000"，data.ucAccessToken（+openId/unionId/c4aUid，均由服务端下发）
 3) POST https://littleswanmp.midea.com/api/auth/login/uc_token
      Content-Type x-www-form-urlencoded，头 ucAccessToken=<ucToken>，体 uc_token=<ucToken>
      -> code==200，content.access_token（=后续 Bearer token）

业务头：Content-Type application/json / ucAccessToken=<ucToken> / authorization: Bearer <access_token>
每日任务中心（含签到等日常任务）：
  主任务  POST /api/web/mobile/swanPrize/queryPrizeRuleUserComplete {ruleType:"1",ruleClass:"3"}
          -> content[]（isUserCompleted 标记）；未完成: beginTask{ruleId} -> completeTask{ruleId}
  精灵任务 POST /api/web/mobile/avatarRule/queryPrizeRuleUserComplete {ruleTypeId:"1",ruleClassId:"2",seq:0}
          -> content[]；未完成: avatarRule/beginTask -> avatarRule/completeTask
  日常动作 swan/feedGrass、swan/userGainWorkPrize、swan/swanStartWorking（喂草/领工作奖励/开工）
成功码：code==200（部分任务接口 0/"0"/"200" 亦可）；已完成任务标记 isUserCompleted。
（无写死个人 token/手机号；ucAccessToken/access_token 均运行时由 code 换取）
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("美的小天鹅");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "mdxtn";
const MINI_APP_ID = "wx33856a6b31431c6e";
const PAGE_VERSION = "1";
const UC_LOGIN_URL =
    "https://mcsp.midea.com/api/cms_bff/mcsp-uc-mvip-bff/app/login/wx/mini/getLoginInfo.do";
const BASE_URL = "https://littleswanmp.midea.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "mdxtn_token_cache.json");
const TOKEN_TTL_MS = 2 * 3600 * 1000; // ucAccessToken 约 2 小时
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
function short(v, n = 240) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}
function isOkCode(res) {
    if (!res || typeof res !== "object") return false;
    const c = res.code;
    return c === 200 || c === 0 || c === "200" || c === "0" || c === "000000" || res.success === true;
}
function urlencode(obj) {
    return Object.keys(obj)
        .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
        .join("&");
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.ucToken = "";
        this.token = ""; // littleswan access_token (Bearer)
        this.done = 0;
        this.signHit = false; // 是否命中"签到"类任务
    }
    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }
    bizHeaders() {
        return {
            "Content-Type": "application/json",
            ucAccessToken: this.ucToken,
            authorization: `Bearer ${this.token}`,
            "User-Agent": UA,
            Accept: "*/*",
            Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
        };
    }
    async post(url, data, headers) {
        const res = await axios.request({
            method: "POST", url, data, headers, timeout: 20000, validateStatus: () => true,
        });
        return res.data;
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
        // Step 2: code -> ucAccessToken
        const ucRes = await this.post(
            UC_LOGIN_URL,
            { jsCode: code, platformType: "WX_LS_MINI", loginMode: 1 },
            { "Content-Type": "application/json", "User-Agent": UA, Accept: "*/*" }
        );
        if (String(ucRes?.code) !== "000000" || !ucRes?.data) {
            throw new Error(`获取 ucAccessToken 失败: ${ucRes?.msg || ucRes?.message || short(ucRes)}`);
        }
        this.ucToken = String(ucRes.data.ucAccessToken || "");
        if (!this.ucToken) throw new Error(`登录未返回 ucAccessToken: ${short(ucRes)}`);

        // Step 3: ucAccessToken -> littleswan access_token
        const atRes = await this.post(
            `${BASE_URL}/api/auth/login/uc_token`,
            urlencode({ uc_token: this.ucToken }),
            {
                "Content-Type": "application/x-www-form-urlencoded",
                ucAccessToken: this.ucToken,
                "User-Agent": UA,
                Accept: "*/*",
                Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            }
        );
        if (!isOkCode(atRes)) {
            const msg = atRes?.chnDesc || atRes?.msg || atRes?.message || short(atRes);
            if (/未注册|注册|会员|not.*regist|no.*user|绑定/i.test(String(msg))) {
                this.unregistered = true;
                throw new Error(`NO_ACCOUNT:${msg}`);
            }
            throw new Error(`获取 access_token 失败: ${msg}`);
        }
        this.token = String(atRes?.content?.access_token || atRes?.data?.access_token || "");
        if (!this.token) {
            this.unregistered = true;
            throw new Error(`NO_ACCOUNT:登录未返回 access_token（该微信号可能未在小天鹅注册）: ${short(atRes)}`);
        }
        const cache = readCache();
        cache[this.account.openid] = { ucToken: this.ucToken, token: this.token, updatedAt: Date.now() };
        writeCache(cache);
        this.log("登录成功");
    }
    // 通用任务中心：查询 -> 未完成逐个 begin -> complete
    async runTaskCenter(label, queryPath, beginPath, completePath, queryBody) {
        let res;
        try {
            res = await this.post(`${BASE_URL}${queryPath}`, JSON.stringify(queryBody), this.bizHeaders());
        } catch (e) {
            this.log(`${label} 查询异常: ${e.message || e}`);
            return;
        }
        if (!isOkCode(res)) {
            this.log(`${label} 查询失败: ${res?.chnDesc || res?.msg || short(res)}`);
            return;
        }
        const list = Array.isArray(res.content) ? res.content : [];
        const undoneList = list.filter((t) => !t.isUserCompleted);
        this.log(`${label} 共 ${list.length} 个任务，未完成 ${undoneList.length} 个`);
        for (const t of undoneList) {
            const rid = String(t.id);
            const rname = t.ruleName || t.prizeName || rid;
            if (/签到|每日签到|打卡/.test(String(rname))) this.signHit = true;
            // 任务需按 timeInterval(秒) 停留后才能领取，遵循原脚本；上限 15s 防卡死
            const ti = Math.min(15, Math.max(2, Number(t.timeInterval || 0) || 2));
            try {
                await this.post(`${BASE_URL}${beginPath}`, JSON.stringify({ ruleId: rid }), this.bizHeaders());
                await $.wait(ti * 1000, ti * 1000 + 800);
                const cr = await this.post(`${BASE_URL}${completePath}`, JSON.stringify({ ruleId: rid }), this.bizHeaders());
                if (isOkCode(cr)) {
                    this.done++;
                    const c = cr.content || {};
                    const delta = c.changeValue;
                    this.log(`  ✅ 完成任务: ${rname}${delta ? ` +${delta}${c.prizeName || c.ruleName || ""}` : ""}`);
                } else {
                    this.log(`  ⚠️ 任务未领取: ${rname} (${cr?.chnDesc || cr?.msg || short(cr)})`);
                }
            } catch (e) {
                this.log(`  ⚠️ 任务出错: ${rname} (${e.message || e})`);
            }
            await $.wait(800, 1500);
        }
    }
    // 小天鹅日常动作（喂草 / 领工作奖励 / 开工），旧天鹅活动若已下线(500)则静默跳过
    async swanDaily() {
        let swanAlive = false;
        try {
            const info = (await axios.request({
                method: "GET", url: `${BASE_URL}/api/web/mobile/swan/getSwanByToken`,
                headers: this.bizHeaders(), timeout: 20000, validateStatus: () => true,
            })).data;
            if (isOkCode(info) && info.content) {
                swanAlive = true;
                const c = info.content;
                this.log(`  天鹅[${c.swanNick || "?"}] 草 ${c.grassAmount ?? "?"} / 贝壳 ${c.shellAmount ?? "?"}`);
                const grass = Math.min(Number(c.grassAmount || 0), 5);
                for (let i = 0; i < grass; i++) {
                    const fg = await this.post(`${BASE_URL}/api/web/mobile/swan/feedGrass`, "{}", this.bizHeaders());
                    if (isOkCode(fg)) { this.done++; this.log(`  ✅ 第${i + 1}次喂草，贝壳 ${fg.content?.shellAmount ?? "?"}`); }
                    else break;
                    await $.wait(600, 1200);
                }
            }
        } catch (e) { this.log(`  喂草跳过: ${e.message || e}`); }
        if (!swanAlive) { this.log("  旧天鹅日常活动不可用，跳过喂草/工作间"); return; }
        try {
            await this.post(`${BASE_URL}/api/web/mobile/swan/userGainWorkPrize`, "{}", this.bizHeaders());
            await this.post(`${BASE_URL}/api/web/mobile/swan/swanStartWorking`, "{}", this.bizHeaders());
            this.log("  ✅ 领工作奖励 + 开工完成");
        } catch (e) { this.log(`  工作间跳过: ${e.message || e}`); }
    }
    async sign() {
        // 主任务中心（含签到等日常任务）
        await this.runTaskCenter(
            "主任务",
            "/api/web/mobile/swanPrize/queryPrizeRuleUserComplete",
            "/api/web/mobile/swanPrize/beginTask",
            "/api/web/mobile/swanPrize/completeTask",
            { ruleType: "1", ruleClass: "3" }
        );
        // 日常动作
        await this.swanDaily();
        // 召唤精灵任务中心
        await this.runTaskCenter(
            "精灵任务",
            "/api/web/mobile/avatarRule/queryPrizeRuleUserComplete",
            "/api/web/mobile/avatarRule/beginTask",
            "/api/web/mobile/avatarRule/completeTask",
            { ruleTypeId: "1", ruleClassId: "2", seq: 0 }
        );
        if (this.signHit) this.log(`✅ 每日签到任务已处理，本次共完成 ${this.done} 项日常`);
        else this.log(`✅ 每日任务完成，本次共完成 ${this.done} 项日常`);
        try {
            const p = await this.post(`${BASE_URL}/api/web/mobile/avatar/getUserPoints`, "{}", this.bizHeaders());
            if (isOkCode(p)) this.log(`  当前积分: ${p.content}`);
        } catch (e) {}
    }
    async ensureLogin() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.token && cached.token && cached.updatedAt && Date.now() - cached.updatedAt < TOKEN_TTL_MS) {
            this.token = cached.token; this.ucToken = cached.ucToken || ""; this.log("使用缓存token"); return;
        }
        if (!this.token) await this.login();
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log(`⚠️ 该微信号还没在美的小天鹅注册/登录过，先在小程序里登录一次再跑（${String(e.message).replace(/^NO_ACCOUNT:/, "")}）`);
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
