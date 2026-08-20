/*
------------------------------------------
@Description: 拼多多果园(多多果园) - 微信小程序 code 静默登录 + 每日签到(+浇水)
cron: 26 9,13 * * *
------------------------------------------
变量名：pddgy
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wx32540bd863b27570，重风控站点）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录）

登录  POST https://api.pinduoduo.com/login
        body = {code, has_auth:false, app_id:33, support_enhance_type:3, xcx_version:"v8.6.21"}
        -> data.access_token / data.uid(=pdd_user_id) / data.uin；并回收 Set-Cookie
        Cookie = PDDAccessToken=<access_token>; pdd_user_id=<uid>; pdd_user_uin=<uin>; <Set-Cookie>
        鉴权=纯 Cookie（业务请求无 HMAC/签名），业务 URL 追加 ?pdduid=<uid>
        风控：error_code 54002=人机验证(滑块/图形码)、43042=风控拦截 → 无法绕过判 blocked
首页  POST /proxy/api/api/manor-query/proxy/home/page {..., tubetoken}
        -> tubetoken(签到/浇水必需) / water_amount；error_code 40001 = Cookie 失效
签到  POST /proxy/api/api/manor/common/apply/activity?pdduid=<uid>
        body = {type:201811, params:{ui_id:3,type:2}, fun_id:"wechat_app_home", tubetoken, fun_pl:2}
        -> error_code==0 / success==true 成功；已签常见 error_msg 含「已签/重复/已领取」
浇水  POST /proxy/api/api/manor/water/cost {..., cost_water_amount:10, tubetoken}（附带，非核心，失败不影响签到判定）
app_id=33 / xcx_version / activity type 201811 均为该小程序固定应用常量（原脚本硬编码，非个人凭证）。
业务基址 https://mobile.yangkeduo.com/proxy/api/api ，登录基址 https://api.pinduoduo.com 。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("拼多多果园签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "pddgy";
const MINI_APP_ID = "wx32540bd863b27570";
const XCX_VERSION = "v8.6.21";
const PDD_APP_ID = 33;
const API_BASE = "https://api.pinduoduo.com";
const ORCHARD_BASE = "https://mobile.yangkeduo.com";
const MANOR_BASE = ORCHARD_BASE + "/proxy/api/api";
const CHECKIN_TYPE = 201811;
const MAX_WATER_TIMES = 20; // 附带浇水上限（非核心）
const TOKEN_CACHE_FILE = path.join(__dirname, "pddgy_token_cache.json");
const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 " +
    "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF XWEB/19895 miniProgram/wx32540bd863b27570";

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
function asObj(d) {
    if (d && typeof d === "object") return d;
    if (typeof d === "string") { try { return JSON.parse(d); } catch { return {}; } }
    return {};
}
function extractUid(cookieStr) {
    const m = /pdd_user_id=(\d+)/.exec(cookieStr || "");
    return m ? m[1] : "";
}
function okCode(res) {
    if (!res) return false;
    if (res.success === true) return true;
    if (Number(res.error_code) === 0 && (res.error_code === 0 || res.error_code === "0")) return true;
    if (res.code === 0) return true;
    return false;
}
function respMsg(res) {
    if (!res) return "";
    return res.error_msg || res.msg || res.message || res.errorMsg || "";
}

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.cookieStr = "";
        this.pdduid = "";
        this.tubetoken = "";
        this.water = 0;
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
        this.log(`获取code: ${short(code, 12)}...`);
        const loginBody = {
            code,
            has_auth: false,
            app_id: PDD_APP_ID,
            support_enhance_type: 3,
            xcx_version: XCX_VERSION,
        };
        const res = await axios.request({
            method: "POST",
            url: API_BASE + "/login",
            data: JSON.stringify(loginBody),
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "User-Agent": UA,
                Accept: "*/*",
                Referer: `https://servicewechat.com/${MINI_APP_ID}/1840/page-frame.html`,
                "x-xcx-queries": `mini_program_name=pdd;mp_theme_version=${XCX_VERSION}`,
                xweb_xhr: "1",
            },
            timeout: 20000,
            validateStatus: () => true,
        });
        const result = asObj(res.data);
        this.log(`登录返回: ${short(result, 260)}`);

        // 风控拦截：无 anti-content 无法绕过（滑块/图形验证码）
        const ec = Number(result.error_code);
        if (ec === 54002) { this.blocked = true; throw new Error("BLOCKED:登录触发54002人机验证(滑块/图形验证码)，无 anti-content 无法绕过"); }
        if (ec === 43042) { this.blocked = true; throw new Error("BLOCKED:43042风控验证失败，当前账号被风控拦截"); }

        const root = result.data || result;
        const accessToken = root.access_token || root.token;
        const uid = String(root.uid || root.user_id || "");
        const uin = root.uin || "";
        const acid = root.acid || "";
        if (!uid || !accessToken) {
            // 无 token/uid 又非已知风控码：如信息含验证/风控类，同样按 blocked 处理
            const msg = respMsg(result) || short(result);
            if (/验证|风控|拦截|滑块|verify|forbidden|安全/i.test(String(msg)) || ec === 40001) {
                this.blocked = true;
                throw new Error(`BLOCKED:登录被风控(error_code=${ec}) ${msg}`);
            }
            throw new Error(`登录未返回 uid/access_token: ${short(result)}`);
        }

        let setCookieStr = "";
        const sc = res.headers && res.headers["set-cookie"];
        if (sc) {
            const arr = Array.isArray(sc) ? sc : [sc];
            setCookieStr = arr.map((c) => String(c).split(";")[0]).join("; ");
        }
        const parts = [`PDDAccessToken=${accessToken}`, `pdd_user_id=${uid}`];
        if (uin) parts.push(`pdd_user_uin=${uin}`);
        if (acid) parts.push(`acid=${acid}`);
        if (setCookieStr) parts.push(setCookieStr);

        this.cookieStr = parts.join("; ");
        this.pdduid = uid;
        const cache = readCache();
        cache[this.account.openid] = { cookieStr: this.cookieStr, uid, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功 uid=${uid}`);
    }
    async manorPost(apiPath, body) {
        const url = `${MANOR_BASE}${apiPath}${apiPath.includes("?") ? "&" : "?"}pdduid=${this.pdduid}`;
        const res = await axios.request({
            method: "POST",
            url,
            data: JSON.stringify(body || {}),
            headers: {
                "User-Agent": UA,
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json;charset=UTF-8",
                Origin: ORCHARD_BASE,
                Referer: `${ORCHARD_BASE}/garden_index_lz_0.html`,
                Cookie: this.cookieStr,
            },
            timeout: 20000,
            validateStatus: () => true,
        });
        return asObj(res.data);
    }
    // 首页：刷新 tubetoken + 水滴，同时用作 Cookie 有效性探测
    async getHomePage() {
        const body = {
            mission_type: 0, fun_id: "wechat_app_home", message_source: null,
            page_type: "HOME_PAGE", push_source_mission_type: 0, fruit_config_version: "",
            unlock_scene_version: "", app_home_click_icon_type: null, tubetoken: this.tubetoken,
            push_act_source: null, need_show_home_popup: true, fun_pl: 2,
        };
        const result = await this.manorPost("/manor-query/proxy/home/page", body);
        if (!result || Object.keys(result).length === 0) return false;
        const ec = Number(result.error_code);
        if (ec === 40001) { this.log(`  首页校验失败(40001)，Cookie 可能已过期`); return false; }
        if (result.tubetoken) this.tubetoken = result.tubetoken;
        if (result.water_amount != null) this.water = result.water_amount;
        return !!this.tubetoken;
    }
    async getWater() {
        const result = await this.manorPost("/manor-gateway/manor/query/user/water?is_back=1", {});
        return (result && result.water_amount) || 0;
    }
    async checkin() {
        const body = {
            type: CHECKIN_TYPE,
            params: { ui_id: 3, type: 2 },
            fun_id: "wechat_app_home",
            tubetoken: this.tubetoken,
            fun_pl: 2,
        };
        const res = await this.manorPost("/manor/common/apply/activity", body);
        if (okCode(res)) {
            const reward = res.water || res.reward_amount || (res.data && (res.data.water || res.data.reward_amount)) || "";
            this.log(`✅ 签到成功${reward ? `，+${reward}水滴` : ""}`);
            return { ok: true };
        }
        const msg = respMsg(res) || short(res);
        if (/已签|签到过|重复|已领取|已完成|already|repeat/i.test(String(msg))) {
            this.log(`✅ 今日已签到（${msg}）`);
            return { ok: true, already: true };
        }
        // 风控类反馈
        if (/验证|风控|拦截|滑块|verify|forbidden/i.test(String(msg)) || Number(res.error_code) === 54002) {
            this.blocked = true;
            this.log(`⛔ 签到被风控拦截: ${msg}`);
            return { ok: false, blocked: true, msg };
        }
        this.log(`❌ 签到失败: ${msg}`);
        return { ok: false, msg };
    }
    // 附带浇水（非核心：失败/风控都不影响签到判定）
    async waterTree() {
        try {
            let water = await this.getWater();
            if (water < 10) { this.log(`  [浇水] 水滴 ${water} 不足10，跳过`); return; }
            const count = Math.min(MAX_WATER_TIMES, Math.floor(water / 10));
            let watered = 0;
            let curr = water;
            for (let i = 0; i < count; i++) {
                const body = {
                    atw: true, location_auth: false, last_stay_time: Math.floor(Math.random() * 40) + 10,
                    can_trigger_random_mission: false, product_scene: 0, minor: false,
                    ext_params: { can_trigger201824: true }, mission_type: 0, cost_water_amount: 10,
                    merge_cost: false, fun_id: "wechat_app_home", lower_end_device: false,
                    cost_water_competition_in_scene_icon: false, is_small_screen: true,
                    tubetoken: this.tubetoken, fun_pl: 2,
                };
                const r = await this.manorPost("/manor/water/cost", body);
                const left = r && r.now_water_amount;
                if (left != null && left < curr) { curr = left; watered++; if (left < 10) break; await $.wait(200, 400); }
                else break;
            }
            this.log(`  [浇水] 完成 ${watered} 次，剩余水滴 ${curr}`);
        } catch (e) {
            this.log(`  [浇水] 跳过: ${e.message || e}`);
        }
    }
    async ensureSession() {
        const cached = readCache()[this.account.openid] || {};
        if (!this.cookieStr && cached.cookieStr) {
            this.cookieStr = cached.cookieStr;
            this.pdduid = cached.uid || extractUid(this.cookieStr);
            this.log("使用缓存Cookie");
            if (await this.getHomePage()) { this.log(`缓存有效，水滴=${this.water}`); return; }
            this.log("缓存失效，重新登录");
            this.cookieStr = ""; this.pdduid = ""; this.tubetoken = "";
        }
        if (!this.cookieStr) {
            await this.login();
            if (!this.pdduid) this.pdduid = extractUid(this.cookieStr);
            if (!(await this.getHomePage())) throw new Error("登录后首页加载失败(可能风控/Cookie无效)");
            this.log(`当前水滴=${this.water}`);
        }
    }
    async run() {
        if (!this.account.openid) { this.log("跳过：变量值里没有 openid"); return; }
        try {
            await this.ensureSession();
            const r = await this.checkin();
            await $.wait(500, 1000);
            if (!r.blocked) await this.waterTree();
        } catch (e) {
            const em = String(e.message || e);
            if (em.startsWith("BLOCKED")) {
                this.log(`⛔ ${em.replace(/^BLOCKED:/, "")}（拼多多重风控，需在小程序内手动过验证，脚本无法绕过）`);
                return;
            }
            this.log(`执行失败: ${em}`);
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
