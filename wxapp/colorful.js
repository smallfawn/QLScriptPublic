/*
------------------------------------------
@Author: sm
@Date: 2026.06.01
@Description:  七彩虹微信小程序 签到
cron: 30 10 * * *
------------------------------------------
#Notice:
变量名：colorful
变量值：wx_server 里的 openid/账号标识，多账户&或换行；也兼容旧格式 token#refreshToken
需要配置：wx_server_url、wx_auth

可选变量：
  colorful_phone_login  是否允许用 /wx/getphonenumber 自动首登，默认 1(开启)。
                        七彩虹只有这一条首登路，等同小程序里点“手机号快捷登录”；
                        不想授权就置 0，然后按 token#refreshToken 手填变量。

登录链路（逆自反编译包 wx49018277e65fc3e1 主包，逐行核对）：
  wx.login code -> POST /api/User/OnLogin {Code}          -> 只返回 Data.OpenId
  手机号授权 code + 上一步 OpenId
    -> POST /api/User/DecryptPhoneNumber {OpenId, Code}    -> Data.Token / Data.RefreshToken
  components/login-modal/login-modal.js:255-345
  即：OnLogin 只是拿 OpenId(源码里存为 sessionAuthIdTool)，唯一发业务 Token 的接口
  是 DecryptPhoneNumber，主包里没有账号密码/短信登录端点（那个页面在空壳分包里）。
  所以没有手机号授权时，只能用缓存或手填 token 运行。

⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
*/

const { Env } = require("../tools/env.js");
const $ = new Env("colorful七彩虹");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("../wxapp/wcs.js");

const ckName = "colorful";
const strSplitor = "#";
const MINI_APP_ID = "wx49018277e65fc3e1";
const PAGE_VERSION = "91";
const API_BASE = "https://interface.skycolorful.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "colorful_token_cache.json");
// 手机号授权首登开关：默认开启(1)。七彩虹只有这一条首登路，等同小程序里点“手机号快捷登录”；
// 不想把手机号授权给七彩虹就置 0，然后自行填 token#refreshToken。
const PHONE_LOGIN = !/^(0|false|no|off)$/i.test(String(process.env.colorful_phone_login ?? "1"));
const WX_SERVER_URL = process.env.wx_server_url || "";
const defaultUserAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf254173b) XWEB/19027";

// 端点(common/vendor.js:2836、10820-10832、19617-19625)
const EP_ON_LOGIN = "/api/User/OnLogin"; // POST {Code}          auth 无
const EP_PHONE_LOGIN = "/api/User/DecryptPhoneNumber"; // POST {OpenId, Code}
const EP_USER_INFO = "/api/User/GetUserInfo"; // GET
const EP_IS_SIGN = "/api/User/IsSignV2"; // GET  -> Data.IsSign
const EP_SIGN = "/api/User/SignV2"; // POST 无 body

// 响应放行码：vendor.js:14036 a = [0,52001,52002,50001,51001,51002,40100,40101]
// 客户端把这些 Code + Success 视为成功，其余一律 reject
const SUCCESS_CODES = new Set([0, 52001, 52002, 50001, 51001, 51002, 40100, 40101]);

const wechat = new WeChatServer({
    url: WX_SERVER_URL || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

function readTokenCache() {
    try {
        if (!fs.existsSync(TOKEN_CACHE_FILE)) return {};
        return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {};
    } catch (e) {
        return {};
    }
}

function writeTokenCache(cache) {
    try {
        fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
    } catch (e) {
        $.log(`写入token缓存失败: ${e.message || e}`);
    }
}

function shortToken(token = "") {
    const value = String(token || "").replace(/^Bearer\s+/i, "");
    return value ? `${value.slice(0, 6)}***${value.slice(-6)}` : "";
}

function maskPhone(phone = "") {
    return String(phone).replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function md5(str) {
    return crypto.createHash("md5").update(str).digest("hex");
}

function isTokenError(message) {
    return /401|403|token|登录|授权|未登录|无效|过期|失效/i.test(String(message || ""));
}

// 幂等：服务端对重复签到的文案不止一种，"已签" 匹配不到 "已经签到过了"
function isAlreadySigned(message) {
    return /已签|已经签|签到过|重复|already/i.test(String(message || ""));
}

function isSuccess(result) {
    return SUCCESS_CODES.has(Number(result?.Code)) && result?.Success !== false;
}

class Task {
    constructor(env) {
        this.index = $.userIdx++;
        this.raw = String(env || "").trim();
        this.user = this.raw.split(strSplitor);
        this.accountId = this.user[0].trim();
        this.token = "";
        this.refreshToken = "";
        this.openId = "";
        this.userInfo = {};
        this.signStatus = false;
        // 旧格式 token#refreshToken：第一段是 JWT 而不是 openid
        this.isLegacyToken = this.user.length >= 2 && /^ey[A-Za-z0-9_-]{10,}\./.test(this.accountId);
        if (this.isLegacyToken) {
            this.token = this.user[0].trim();
            this.refreshToken = this.user[1].trim();
            this.accountId = `legacy:${shortToken(this.token)}`;
        }
    }

    async run() {
        if (!(await this.prepareToken())) return;

        await this.getSignInfo();
        if (this.signStatus) {
            $.log(`🌸账号[${this.index}] 今日已签到`);
        } else {
            await this.signInV2();
        }
        await this.getUserInfo();
    }

    /** 取到可用 token 返回 true；顺序：变量手填 -> 本地缓存 -> code 登录 -> 手机号授权 */
    async prepareToken() {
        if (this.isLegacyToken) {
            $.log(`账号[${this.index}] 使用变量里手填的 token: ${shortToken(this.token)}`);
            this.saveCachedToken();
            if (await this.checkToken()) return true;
            $.log(`账号[${this.index}] 变量里的 token 已失效，请重新获取`);
            this.removeCachedToken();
            return false;
        }

        const cached = this.getCachedToken();
        if (cached?.token) {
            this.applyToken(cached);
            $.log(`账号[${this.index}] 使用缓存token: ${shortToken(this.token)}`);
            if (await this.checkToken()) return true;
            this.removeCachedToken();
            $.log(`账号[${this.index}] 缓存token失效，重新登录`);
        }

        if (!(await this.loginByWxCode())) return false;
        if (this.token) return await this.checkToken();

        if (!PHONE_LOGIN) {
            $.log(
                `账号[${this.index}] 没有可用 token：七彩虹唯一的首登接口 ${EP_PHONE_LOGIN} 需要微信手机号授权 code(小程序里就是“手机号快捷登录”)，而你把 colorful_phone_login 置成了 0。\n` +
                    `  两种办法二选一：\n` +
                    `  1) 允许手机号授权 -> 去掉 colorful_phone_login 或置 1，脚本自动用 wx_server 的 /wx/getphonenumber 首登；\n` +
                    `  2) 继续不授权 -> 自行抓一次小程序请求，把 Authorization/X-Authorization 的两段值按 token${strSplitor}refreshToken 填进 ${ckName} 变量`
            );
            return false;
        }
        return await this.loginByPhoneNumber();
    }

    cacheKey() {
        return this.isLegacyToken ? this.accountId : this.raw;
    }

    getCachedToken() {
        const cache = readTokenCache();
        return cache[this.cacheKey()] || null;
    }

    saveCachedToken() {
        if (!this.token) return;
        const cache = readTokenCache();
        cache[this.cacheKey()] = {
            token: this.token,
            refreshToken: this.refreshToken,
            openId: this.openId,
            userInfo: this.userInfo,
            updatedAt: new Date().toISOString(),
        };
        writeTokenCache(cache);
    }

    removeCachedToken() {
        const cache = readTokenCache();
        if (cache[this.cacheKey()]) {
            delete cache[this.cacheKey()];
            writeTokenCache(cache);
        }
        this.token = "";
        this.refreshToken = "";
        this.userInfo = {};
    }

    applyToken(data = {}) {
        this.token = data.token || data.Token || "";
        this.refreshToken = data.refreshToken || data.RefreshToken || "";
        this.openId = data.openId || data.OpenId || "";
        this.userInfo = data.userInfo || data.UserInfo || {};
    }

    /** 固定头 + Sign：vendor.js:13995-14015 g() 与 14041-14049 请求头拼装 */
    signedHeaders(extra = {}, auth = true) {
        const appid = "815d8026-9a52-4445-a42c-a5443134232e";
        const requestId = crypto.randomUUID ? crypto.randomUUID() : $.uuid();
        const ticks = Date.now();
        const headers = {
            "User-Agent": defaultUserAgent,
            "Referer": `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Content-Type": "application/json",
            "requestId": requestId,
            "AppId": appid,
            "Ticks": String(ticks),
            "Sign": md5(appid + ticks + requestId + "2b5c01fb-7640-401a-8188-43a13190a626"),
            "source": "Wx",
            "UcSource": "30",
            "User-from": "xcx",
            "version": "2.0.0",
            "xweb_xhr": "1",
            ...extra,
        };
        if (auth) {
            headers.Authorization = this.token ? `Bearer ${this.token}` : "";
            headers["X-Authorization"] = this.refreshToken ? `Bearer ${this.refreshToken}` : "";
        }
        return headers;
    }

    async request(apiPath, { method = "GET", data, params, auth = true } = {}) {
        const options = {
            method,
            url: new URL(apiPath, API_BASE).toString(),
            params,
            headers: this.signedHeaders({}, auth),
            timeout: 15000,
            validateStatus: () => true,
        };
        if (data !== undefined) options.data = data;
        const { data: result, status, headers } = await axios.request(options);
        // token 会随响应头轮换：vendor.js:14052-14054
        if (headers?.["access-token"]) this.token = headers["access-token"];
        if (headers?.["x-access-token"]) this.refreshToken = headers["x-access-token"];
        if (status === 401 || status === 403) throw new Error(`HTTP ${status}: ${result?.Message || JSON.stringify(result)}`);
        if (status !== 200) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);
        if (!isSuccess(result)) throw new Error(`${result?.Code ?? ""} ${result?.Message || result?.msg || JSON.stringify(result)}`.trim());
        if (this.token) this.saveCachedToken();
        return result;
    }

    /**
     * 从 wx_server 取一次性 code。
     * wcs.getCode 在 status:false 时也会 resolve，必须自己判失败，
     * 否则 smallcat 的取码限流会被误当成七彩虹登录失败。
     */
    async getServerCode(endpoint = "/wx/code") {
        if (!process.env.wx_auth) throw new Error("缺少 wx_auth，无法从 wx_server 取 code");
        let data;
        if (endpoint === "/wx/code") {
            ({ data } = await wechat.getCode(this.accountId));
        } else {
            const url = (WX_SERVER_URL || "http://192.168.31.196:8787").replace(/\/+$/, "") + endpoint;
            ({ data } = await axios.post(
                url,
                { appid: MINI_APP_ID, openid: this.accountId },
                { headers: { auth: process.env.wx_auth }, timeout: 30000 }
            ));
        }
        if (data?.status === false) throw new Error(`wx_server ${endpoint} 取码失败: ${data?.message || data?.error || "未知原因"}`);
        const code = data?.code || data?.data?.code;
        if (!code) throw new Error(`wx_server ${endpoint} 未返回 code`);
        return code;
    }

    /** OnLogin 只换 OpenId(源码里是 sessionAuthIdTool)，个别账号可能直接带 Token */
    async loginByWxCode() {
        try {
            const code = await this.getServerCode("/wx/code");
            const result = await this.request(EP_ON_LOGIN, {
                method: "POST",
                auth: false,
                data: { Code: code },
            });
            this.openId = result?.Data?.OpenId || "";
            const token = result?.Data?.Token || result?.Data?.token || "";
            if (token) {
                this.token = token;
                this.refreshToken = result?.Data?.RefreshToken || result?.Data?.refreshToken || "";
                this.saveCachedToken();
                $.log(`账号[${this.index}] CODE登录成功: ${shortToken(this.token)}`);
            }
            if (!this.openId && !this.token) throw new Error("OnLogin 未返回 OpenId");
            return true;
        } catch (e) {
            $.log(`账号[${this.index}] CODE登录失败: ${e.message || e}`);
            return false;
        }
    }

    /** 唯一发业务 Token 的入口，需要微信手机号授权 code（用户已显式开启 colorful_phone_login） */
    async loginByPhoneNumber() {
        try {
            const phoneCode = await this.getServerCode("/wx/getphonenumber");
            const result = await this.request(EP_PHONE_LOGIN, {
                method: "POST",
                auth: false,
                data: { OpenId: this.openId, Code: phoneCode },
            });
            this.token = result?.Data?.Token || this.token;
            this.refreshToken = result?.Data?.RefreshToken || this.refreshToken;
            if (!this.token) throw new Error(`登录成功但未返回 Token: ${result?.Message || ""}`);
            this.saveCachedToken();
            $.log(`账号[${this.index}] 手机号授权登录成功: ${shortToken(this.token)}`);
            return true;
        } catch (e) {
            $.log(`账号[${this.index}] 手机号授权登录失败: ${e.message || e}`);
            return false;
        }
    }

    /** 只读校验：客户端登录后也是先 getUInfo(vendor.js:12568) */
    async checkToken() {
        try {
            const result = await this.request(EP_USER_INFO);
            this.userInfo = result?.Data || {};
            this.saveCachedToken();
            return true;
        } catch (e) {
            return false;
        }
    }

    async signInV2() {
        try {
            const result = await this.request(EP_SIGN, { method: "POST" });
            $.log(`🌸账号[${this.index}]🕊签到${result.Message || "成功"}🎉`);
        } catch (e) {
            const message = String(e.message || e);
            if (isAlreadySigned(message)) {
                $.log(`🌸账号[${this.index}] 今日已签到`);
                return;
            }
            $.log(`🌸账号[${this.index}] 签到失败:${message}❌`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }

    async getSignInfo() {
        try {
            const result = await this.request(EP_IS_SIGN);
            this.signStatus = Boolean(result?.Data?.IsSign);
        } catch (e) {
            const message = String(e.message || e);
            $.log(`账号[${this.index}] 查询签到状态失败: ${message}`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }

    async getUserInfo() {
        try {
            const result = await this.request(EP_USER_INFO);
            this.userInfo = result?.Data || {};
            this.saveCachedToken();
            $.log(`🌸账号[${this.index}]昵称:${this.userInfo.NickName || maskPhone(this.userInfo.Mobile) || "未知"} 积分:${this.userInfo.Point ?? "未知"}`);
        } catch (e) {
            const message = String(e.message || e);
            $.log(`账号[${this.index}] 查询用户失败: ${message}`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }
}

!(async () => {
    await getNotice();
    $.checkEnv(ckName);

    for (const user of $.userList) {
        await new Task(user).run();
    }
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

async function getNotice() {
    try {
        const options = {
            url: "https://ghproxy.net/https://raw.githubusercontent.com/smallfawn/Note/refs/heads/main/Notice.json",
            headers: {
                "User-Agent": defaultUserAgent,
            },
            timeout: 3000,
        };
        const { data: res } = await axios.request(options);
        $.log(res);
        return res;
    } catch (e) {}
}
