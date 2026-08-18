/*
------------------------------------------
@Description: 有赞店铺通用签到（临水玉泉 / TOI / 七点五 等有赞小程序共用）
cron: 15 8 * * *
------------------------------------------
变量名：youzan
变量值：每行一个账号，格式  openid#appid#kdtId#checkinId[#备注]
        - openid   wx_server 里保存的账号标识
        - appid    小程序 appid
        - kdtId    有赞店铺号（可留空，登录后会用服务端回显的 kdtId 兜底）
        - checkinId 签到活动 id（在小程序「签到」页抓 checkinV2.json?checkinId= 得到）
        多账号/多店换行分隔。示例：
          owXXXX#wx21293beab739d5c3#44353481#15129#临水玉泉
          owXXXX#wxbb5a91aacbab57f2#97827637#2163238#TOI

依赖变量：wx_server_url（默认 http://192.168.31.196:8787）、wx_auth（必填）
------------------------------------------
契约（有赞统一登录，所有店同构，只有 kdtId/checkinId 不同）：
  登录  POST https://uic.youzan.com/passport/general/auth.json?kdt_id=&app_id=
        body {appId, code, platformName:"weapp", clientBiz:"weapp_wsc", inWsc:true, kdtId, extraBizData:{...}}
        -> code==0，data.accessToken / data.sessionId；data.kdtId 是真实店铺号
        access_token 之后作为查询参数 access_token= 带在每个 h5.youzan.com 请求上（不是 cookie）
  资料  GET  https://h5.youzan.com/wscaccount/api/authorize/data.json   -> code==0 表示会话有效
  签到  GET  https://h5.youzan.com/wscump/checkin/checkinV2.json?checkinId=&...
        -> code==0 成功；已签到走 msg；
           code==1000000002「userId must be >= 1」表示这个微信号还没在该店注册会员
           （有赞签到强依赖已注册会员，账号态问题，不是脚本缺陷）
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("有赞通用签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "youzan";
const UIC = "https://uic.youzan.com";
const H5 = "https://h5.youzan.com";
const WEAPP_VERSION = "2.233.4";
const TOKEN_CACHE_FILE = path.join(__dirname, "youzan_token_cache.json");
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 " +
    "Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF";

const wechat = new WeChatServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: "",
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
    const parts = String(raw).split("#").map((s) => (s || "").trim());
    return {
        openid: parts[0] || "",
        appid: parts[1] || "",
        kdtId: parts[2] || "",
        checkinId: parts[3] || "",
        remark: parts[4] || "",
    };
}

function short(v, n = 200) {
    const t = typeof v === "string" ? v : JSON.stringify(v);
    return !t ? "" : t.length > n ? `${t.slice(0, n)}...` : t;
}

const isOk = (res) => Number(res?.code) === 0;
const msgOf = (res) => res?.msg || res?.message || short(res);
const isAlreadyDone = (t) => /已签|已经签|签到过|重复|已完成|already/i.test(String(t || ""));
const isNotMember = (res) =>
    Number(res?.code) === 1000000002 || /userId must be|未注册|请先注册|注册会员|开通会员/i.test(msgOf(res));

class Task {
    constructor(raw) {
        this.index = $.userIdx++;
        this.account = parseAccount(raw);
        this.cred = null;
    }

    log(text) {
        const tag = this.account.remark || this.account.appid || `账号${this.index}`;
        $.log(`[${tag}] ${text}`);
    }

    headers() {
        return {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
            "User-Agent": USER_AGENT,
            Referer: `https://servicewechat.com/${this.account.appid}/0/page-frame.html`,
        };
    }

    get kdt() {
        return (this.cred && this.cred.kdtId) || this.account.kdtId || "";
    }

    async getCode() {
        // 通用脚本要按账号自己的 appid 取码
        const server = new WeChatServer({ url: wechat.serverUrl, appid: this.account.appid, auth: wechat.auth });
        const { data } = await server.getCode(this.account.openid);
        if (data && data.status === false) {
            throw new Error(`wx_server 取code失败: ${data.message || short(data)}`);
        }
        const code = data?.data?.code || data?.code;
        if (!code || typeof code !== "string") throw new Error(`wx_server 未返回 code: ${short(data)}`);
        return code;
    }

    async login() {
        const code = await this.getCode();
        const kdt = this.account.kdtId || "0";
        const body = {
            appId: this.account.appid,
            code,
            platformName: "weapp",
            signature: "windows",
            clientBiz: "weapp_wsc",
            inWsc: true,
            kdtId: kdt,
            extraBizData: {
                enterOptions: {
                    extKdtId: Number(kdt) || 0,
                    path: "pages/home/dashboard/index",
                    query: {},
                    scene: 1007,
                    referrerInfo: {},
                    apiCategory: "default",
                },
                guideBizDataMap: { from_params: "" },
                sceneData: {},
            },
        };
        const { data } = await axios.post(
            `${UIC}/passport/general/auth.json?kdt_id=${kdt}&app_id=${this.account.appid}`,
            body,
            { headers: this.headers(), timeout: 20000, validateStatus: () => true }
        );
        if (!isOk(data) || !(data.data || {}).accessToken) {
            throw new Error(`有赞登录失败: ${msgOf(data)}`);
        }
        const d = data.data;
        this.cred = {
            accessToken: d.accessToken,
            sid: d.sessionId,
            kdtId: String(d.kdtId || kdt),
        };
        const cache = readCache();
        cache[`${this.account.openid}#${this.account.appid}`] = { ...this.cred, updatedAt: new Date().toISOString() };
        writeCache(cache);
        this.log(`登录成功（店铺 kdtId=${this.cred.kdtId}）`);
    }

    async h5Get(apiPath, params = {}) {
        const q = new URLSearchParams({
            app_id: this.account.appid,
            kdt_id: this.kdt,
            access_token: this.cred.accessToken,
            appId: this.account.appid,
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
        const res = await this.h5Get("/wscaccount/api/authorize/data.json");
        return isOk(res);
    }

    async ensureLogin() {
        const key = `${this.account.openid}#${this.account.appid}`;
        const cached = readCache()[key];
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

    async sign() {
        if (!this.account.checkinId) {
            this.log("⚠️ 未配置 checkinId，只登录不签到（在小程序签到页抓 checkinV2.json?checkinId= 补上）");
            return;
        }
        const res = await this.h5Get("/wscump/checkin/checkinV2.json", { checkinId: this.account.checkinId });
        if (isOk(res)) {
            const d = res.data || {};
            const gain = d.point ?? d.points ?? d.reward ?? "";
            this.log(`✅ 签到成功${gain !== "" ? `: +${gain}` : ""}`);
            return;
        }
        if (isAlreadyDone(msgOf(res))) return this.log(`✅ 今日已签到（${msgOf(res)}）`);
        if (isNotMember(res)) {
            return this.log("⚠️ 该微信号还没在这家店注册会员（有赞签到要先注册），请在小程序里注册一次再跑");
        }
        this.log(`❌ 签到失败: ${msgOf(res)}`);
    }

    async run() {
        if (!this.account.openid || !this.account.appid) {
            this.log("跳过：变量值格式应为 openid#appid#kdtId#checkinId[#备注]");
            return;
        }
        try {
            await this.ensureLogin();
            await this.sign();
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
