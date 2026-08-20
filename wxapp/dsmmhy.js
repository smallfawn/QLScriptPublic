/*
------------------------------------------
@Description: 袋鼠妈妈会员商城 - 微信小程序静默登录 + 每日签到（有赞平台）
cron: 12 8 * * *
------------------------------------------
变量名：dsmmhy
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行分隔（可加 #备注）

依赖变量：
wx_server_url  默认 http://192.168.31.196:8787
wx_auth        必填，wx_server 鉴权值
------------------------------------------
契约（appid wxb27b46293d405a20，有赞店铺 kdtId=44587018，登录 uic.youzan.com / 业务 h5.youzan.com）：
（迁移自 YYB-GO 系脚本，原脚本已 code 登录；与本仓 youzan.js 通用登录同构）

  登录  POST https://uic.youzan.com/passport/general/auth.json?kdt_id=44587018&app_id=<appid>
        body {appId, code, platformName:"weapp", signature:"windows", clientBiz:"weapp_wsc",
              inWsc:true, kdtId, extraBizData:{enterOptions{...},guideBizDataMap,sceneData}}
        -> code==0，data.accessToken（=后续 token）、data.sessionId（=sid）、data.kdtId（真实店铺号）
        access_token 之后作为查询参数 access_token= 带在每个 h5.youzan.com 请求上（不是 cookie）
  会话  GET  https://h5.youzan.com/wscaccount/api/authorize/data.json  -> code==0 会话有效
  活动  GET  https://h5.youzan.com/wscump/checkin/check-in-info.json   -> data.checkInId（实时签到活动 id，防轮换）
  状态  GET  https://h5.youzan.com/wscump/checkin/get_activity_by_yzuid_v2.json?checkinId=  -> data.isCheckin(已签)
  签到  GET  https://h5.youzan.com/wscump/checkin/checkinV2.json?checkinId=&...
        -> code==0 成功（data.list[].infos.title 为奖励）；已签到走 msg / data.success==false&desc；
           code==1000000002「userId must be >= 1」= 该微信号还没在该店注册会员（账号态，不是脚本缺陷）
  KDT_ID=44587018 / CHECKIN_ID=17019 是这家店铺的固定应用常量（原脚本硬编码，非个人凭证）。
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("袋鼠妈妈会员商城签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "dsmmhy";
const MINI_APP_ID = "wxb27b46293d405a20";
const KDT_ID = "44587018";
const CHECKIN_ID = "17019"; // 兜底；脚本优先用 check-in-info.json 的实时 checkinId（有赞活动 id 可能轮换）
const UIC = "https://uic.youzan.com";
const H5 = "https://h5.youzan.com";
const WEAPP_VERSION = "2.232.5.101";
const TOKEN_CACHE_FILE = path.join(__dirname, "dsmmhy_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 " +
    "Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
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
        $.log(`写入token缓存失败: ${e.message || e}`);
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

const isOk = (res) => Number(res?.code) === 0;
const msgOf = (res) => res?.msg || res?.message || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isNotMember = (res) =>
    Number(res?.code) === 1000000002 || /userId must be|未注册|请先注册|注册会员|开通会员|没有会员/i.test(msgOf(res));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.cred = null;
    }

    log(text) {
        $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${text}`);
    }

    get kdt() {
        return (this.cred && this.cred.kdtId) || KDT_ID || "";
    }

    headers() {
        return {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
            "User-Agent": USER_AGENT,
            "Extra-Data": JSON.stringify({
                is_weapp: 1,
                sid: (this.cred && this.cred.sid) || "",
                version: WEAPP_VERSION,
                client: "weapp",
                bizEnv: "wsc",
            }),
            Referer: `https://servicewechat.com/${MINI_APP_ID}/39/page-frame.html`,
        };
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
        const body = {
            appId: MINI_APP_ID,
            code,
            platformName: "weapp",
            signature: "windows",
            clientBiz: "weapp_wsc",
            inWsc: true,
            kdtId: KDT_ID,
            extraBizData: {
                enterOptions: {
                    extKdtId: Number(KDT_ID) || 0,
                    path: "pages/home/dashboard/index",
                    query: {},
                    scene: 1005,
                    referrerInfo: {},
                    hostExtraData: {},
                    apiCategory: "default",
                },
                guideBizDataMap: { from_params: "" },
                sceneData: {},
            },
        };
        const { data } = await axios.post(
            `${UIC}/passport/general/auth.json?kdt_id=${KDT_ID}&app_id=${MINI_APP_ID}`,
            body,
            { headers: this.headers(), timeout: 20000, validateStatus: () => true }
        );
        if (!isOk(data) || !(data.data || {}).accessToken) {
            if (isNotMember(data)) {
                this.unregistered = true;
                throw new Error("NO_ACCOUNT:登录未注册");
            }
            throw new Error(`有赞登录失败: ${msgOf(data)}`);
        }
        const d = data.data;
        this.cred = {
            accessToken: d.accessToken,
            sid: d.sessionId || "",
            kdtId: String(d.kdtId || KDT_ID),
        };
        const cache = readCache();
        cache[this.account.openid] = { ...this.cred, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功（店铺 kdtId=${this.cred.kdtId}${d.nickname ? `，${d.nickname}` : ""}）`);
    }

    async h5Get(apiPath, params = {}) {
        const q = new URLSearchParams({
            store_id: "",
            app_id: MINI_APP_ID,
            kdt_id: this.kdt,
            access_token: this.cred.accessToken,
            appId: MINI_APP_ID,
            kdtId: this.kdt,
            ...params,
        }).toString();
        const { data } = await axios.get(`${H5}${apiPath}?${q}`, {
            headers: this.headers(),
            timeout: 15000,
            validateStatus: () => true,
        });
        return data;
    }

    async checkSession() {
        try {
            const res = await this.h5Get("/wscaccount/api/authorize/data.json");
            return isOk(res);
        } catch (e) {
            return false;
        }
    }

    async ensureLogin() {
        const cached = readCache()[this.account.openid];
        if (!this.cred && cached && cached.accessToken) {
            this.cred = { accessToken: cached.accessToken, sid: cached.sid, kdtId: cached.kdtId };
            if (await this.checkSession()) {
                this.log("使用缓存ck");
                return;
            }
            this.log("缓存ck失效，重新登录");
            this.cred = null;
        }
        if (!this.cred) await this.login();
    }

    // 优先取实时 checkinId（防活动 id 轮换），失败回落到硬编码
    async resolveCheckinId() {
        try {
            const info = await this.h5Get("/wscump/checkin/check-in-info.json");
            if (isOk(info)) {
                const d = info.data || {};
                const cid = d.checkInId || d.checkinId || d.check_in_id || "";
                if (cid) return String(cid);
            } else if (isNotMember(info)) {
                this.notMember = true;
            }
        } catch (e) {}
        return CHECKIN_ID;
    }

    async sign() {
        const checkinId = await this.resolveCheckinId();
        if (this.notMember) {
            return this.log("⚠️ 该微信号还没在袋鼠妈妈注册会员（有赞签到要先注册），请在小程序里注册一次再跑");
        }
        if (!checkinId) {
            this.log("⚠️ 未取到 checkinId，只登录不签到");
            return;
        }

        // 预查签到状态，避免重复请求
        try {
            const act = await this.h5Get("/wscump/checkin/get_activity_by_yzuid_v2.json", { checkinId });
            if (isOk(act) && (act.data || {}).isCheckin) {
                return this.log(`✅ 今日已签到，连续 ${(act.data || {}).continuesDay ?? "?"} 天`);
            }
            if (isNotMember(act)) {
                return this.log("⚠️ 该微信号还没在袋鼠妈妈注册会员（有赞签到要先注册），请在小程序里注册一次再跑");
            }
        } catch (e) {}

        const res = await this.h5Get("/wscump/checkin/checkinV2.json", { checkinId });
        if (isOk(res)) {
            const d = res.data || {};
            if (d.success === false) {
                if (isAlreadyDone(d.desc)) return this.log(`✅ 今日已签到（${d.desc}）`);
                if (/手机号未授权|未授权手机|请先授权|未注册|未绑定|绑定手机/.test(String(d.desc || ""))) {
                    return this.log(`⚠️ 该微信号还没在袋鼠妈妈(有赞)授权手机号/注册会员（${d.desc}），先在小程序里授权登录一次再跑`);
                }
                return this.log(`❌ 签到失败: ${d.desc || msgOf(res)}`);
            }
            const award = (d.list || [])
                .map((x) => x?.infos?.title || x?.infos?.desc || "")
                .filter(Boolean)
                .join(", ");
            return this.log(`✅ 签到成功${award ? `: ${award}` : ""}${d.desc ? `（${d.desc}）` : ""}`);
        }
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        if (isNotMember(res)) {
            return this.log("⚠️ 该微信号还没在袋鼠妈妈注册会员（有赞签到要先注册），请在小程序里注册一次再跑");
        }
        if (/手机号未授权|未授权手机|请先授权|未注册|未绑定|绑定手机/.test(String(msgOf(res)))) {
            return this.log(`⚠️ 该微信号还没在袋鼠妈妈(有赞)授权手机号/注册会员（${msgOf(res)}），先在小程序里授权登录一次再跑`);
        }
        this.log(`❌ 签到失败: ${msgOf(res)}`);
    }

    async run() {
        if (!this.account.openid) {
            this.log("跳过：变量值里没有 openid");
            return;
        }
        try {
            await this.ensureLogin();
            await this.sign();
        } catch (e) {
            if (String(e.message).startsWith("NO_ACCOUNT")) {
                this.log("⚠️ 该微信号还没在袋鼠妈妈注册会员（有赞登录未激活），请在小程序里登录注册一次再跑");
                return;
            }
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
