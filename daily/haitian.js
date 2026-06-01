/*
------------------------------------------
@Author: sm
@Date: 2026.06.01
@Description:  海天美味馆小程序
cron: 30 11 * * *
------------------------------------------
#Notice:
变量名 haitian
变量值：wx_server 里的 openid/账号标识，多账号&或换行
需要配置：wx_server_url、wx_auth

⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此免责声明。
*/

const { Env } = require("../tools/env.js");
const $ = new Env("海天美味馆小程序");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ckName = "haitian";
const strSplitor = "#";
const MINI_APP_ID = "wx7a890ea13f50d7b6";
const PAGE_VERSION = "772";
const API_BASE = "https://cmallapi.xkmm.cn/buyer-api";
const BASE_API = "https://cmallapi.xkmm.cn/base-api";
const TOKEN_CACHE_FILE = path.join(__dirname, "haitian_token_cache.json");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_15 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.70(0x1800462d) NetType/WIFI Language/zh_CN";

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
    const value = String(token || "");
    return value ? `${value.slice(0, 6)}***${value.slice(-6)}` : "";
}

function maskPhone(phone = "") {
    return String(phone || "").replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}

function randomUuid(len = 20) {
    const chars = "abcdef0123456789";
    let value = "";
    for (let i = 0; i < len; i++) value += chars[Math.floor(Math.random() * chars.length)];
    return value;
}

function isTokenError(message) {
    return /401|403|token|登录|授权|失效|过期|no-show-toast/i.test(String(message || ""));
}

class Task {
    constructor(env) {
        this.index = $.userIdx++;
        this.raw = String(env || "").trim();
        this.user = this.raw.split(strSplitor);
        this.accountId = this.user[0].trim();
        this.token = "";
        this.refreshToken = "";
        this.communityToken = "";
        this.uuid = randomUuid();
        this.activity_code = "";
        this.userFlag = false;
        this.userInfo = {};
        this.isLegacyToken = this.user.length >= 2;
        if (this.isLegacyToken) {
            this.token = this.user[0].trim();
            this.uuid = this.user[1].trim() || this.uuid;
            this.accountId = `legacy:${shortToken(this.token)}`;
        }
    }

    async run() {
        if (this.isLegacyToken) {
            $.log(`账号[${this.index}] 检测到旧版 authorization#uuid 格式，先迁移到缓存`);
            this.saveCachedToken();
        } else {
            const cached = this.getCachedToken();
            if (cached?.accessToken) {
                this.applyToken(cached);
                $.log(`账号[${this.index}] 使用缓存token: ${shortToken(this.token)}`);
                if (!(await this.checkToken())) {
                    this.removeCachedToken();
                    $.log(`账号[${this.index}] 缓存token失效，重新CODE登录`);
                }
            }

            if (!this.token) {
                await this.loginByWxCode();
                if (!this.token) return;
            }
        }

        await this.getUserInfo();
        if (!this.userFlag) return;

        await this.task_1();
        await this.task_2();
        await this.getSignActivity();

        if (this.activity_code) {
            await this.signIn();
            await this.getLotteryTaskList();
            await this.getLotteryNum();
        }
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
            accessToken: this.token,
            refreshToken: this.refreshToken,
            communityToken: this.communityToken,
            uuid: this.uuid,
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
        this.communityToken = "";
        this.userInfo = {};
    }

    applyToken(data = {}) {
        this.token = data.accessToken || data.token || "";
        this.refreshToken = data.refreshToken || "";
        this.communityToken = data.communityToken || "";
        this.uuid = data.uuid || this.uuid;
        this.userInfo = data.userInfo || {};
    }

    headers(extra = {}, auth = true, isJson = false) {
        const headers = {
            "Connection": "keep-alive",
            "envVersion": "release",
            "Content-Type": isJson ? "application/json" : "application/x-www-form-urlencoded",
            "uuid": this.uuid,
            "Accept-Encoding": "gzip,compress,br,deflate",
            "User-Agent": defaultUserAgent,
            "Referer": `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
            ...extra,
        };
        if (auth) {
            headers.Authorization = this.token;
            if (this.communityToken) headers["X-Haday-Token"] = this.communityToken;
        }
        return headers;
    }

    async request(pathname, { method = "GET", params, data, auth = true, isJson = false, base = API_BASE } = {}) {
        const options = {
            method,
            url: `${base}${pathname}`,
            params,
            headers: this.headers({}, auth, isJson),
            timeout: 20000,
            validateStatus: () => true,
        };
        if (data !== undefined) options.data = isJson ? data : new URLSearchParams(data).toString();

        const { data: result, status } = await axios.request(options);
        if (status === 401 || status === 403) throw new Error(`HTTP ${status}: ${result?.message || JSON.stringify(result)}`);
        if (status < 200 || status >= 300) throw new Error(`HTTP ${status}: ${JSON.stringify(result)}`);
        if (result && typeof result === "object" && result.code && !["200", "0"].includes(String(result.code))) {
            throw new Error(`${result.code} ${result.message || result.msg || JSON.stringify(result)}`.trim());
        }
        return result;
    }

    async getOperateData() {
        if (!process.env.wx_auth) throw new Error("缺少 wx_auth，无法从 wx_server 获取登录数据");
        const url = (process.env.wx_server_url || "http://192.168.31.196:8787").replace(/\/$/, "");
        const { data } = await axios.post(`${url}/wx/operatedata`, {
            appid: MINI_APP_ID,
            openid: this.accountId,
        }, {
            headers: { auth: process.env.wx_auth },
            timeout: 45000,
            validateStatus: () => true,
        });
        const result = data?.data || {};
        if (!data?.status || !result.code || !result.encryptedData || !result.iv) {
            throw new Error(`wx_server 未返回完整登录数据: ${JSON.stringify(data)}`);
        }
        return result;
    }

    async getArticleIds() {
        try {
            const result = await this.request("/pages/REGISTRATION_AGREEMENT,PRIVACY_PROTECTION_CLAUSE/articles/list", {
                base: BASE_API,
                auth: false,
            });
            const ids = Array.isArray(result) ? result.map(item => item.article_id).filter(Boolean) : [];
            return ids.join(",");
        } catch (e) {
            $.log(`账号[${this.index}] 获取协议ID失败，继续登录: ${e.message || e}`);
            return "";
        }
    }

    async loginByWxCode() {
        try {
            const wxData = await this.getOperateData();
            const articleIds = await this.getArticleIds();
            const params = {
                edata: wxData.encryptedData,
                iv: wxData.iv,
                code: wxData.code,
                uuid: this.uuid,
                article_ids: articleIds,
                app_versions: "1.0.0",
            };
            const result = await this.request("/wechat/mini/phoneNew/login", {
                method: "POST",
                params,
                auth: false,
            });
            const token = result?.access_token || result?.accessToken || "";
            if (!result?.success || !token) throw new Error(`登录响应未返回token: ${JSON.stringify(result)}`);
            this.token = token;
            this.refreshToken = result.refresh_token || result.refreshToken || "";
            await this.loginCommunityToken().catch(() => {});
            this.saveCachedToken();
            $.log(`账号[${this.index}] CODE登录成功: ${shortToken(this.token)}`);
        } catch (e) {
            $.log(`账号[${this.index}] CODE登录失败: ${e.message || e}`);
        }
    }

    async loginCommunityToken() {
        if (!this.token) return;
        const result = await this.request("/wx/auth/loginByToken", {
            method: "POST",
            base: "https://cmallwap.xkmm.cn/haday",
            data: { access_token: this.token },
            auth: false,
            isJson: true,
        });
        this.communityToken = result?.data || result || "";
        this.saveCachedToken();
    }

    async checkToken() {
        try {
            await this.request("/members");
            return true;
        } catch (e) {
            return false;
        }
    }

    async getUserInfo() {
        try {
            const result = await this.request("/members");
            if (result?.member_id) {
                this.userInfo = result;
                this.saveCachedToken();
                $.log(`🌸账号[${this.index}] [${result.member_id}][${maskPhone(result.mobile)}] 当前积分[${result.consum_point}]🎉`);
                this.userFlag = true;
            } else {
                $.log(`🌸账号[${this.index}] 查询-失败:${JSON.stringify(result)}❌`);
            }
        } catch (e) {
            const message = e.message || e;
            $.log(`🌸账号[${this.index}] 查询-失败:${message}❌`);
            if (isTokenError(message)) this.removeCachedToken();
        }
    }

    async getSignActivity() {
        try {
            const result = await this.request("/sign/activity/code", {
                params: { activityCode: "" },
            });
            if (result?.activity_code) {
                $.log(`获取活动信息成功，活动ID：${result.activity_code}`);
                this.activity_code = result.activity_code;
            } else {
                $.log(`获取活动信息失败:${JSON.stringify(result)}❌`);
            }
        } catch (e) {
            $.log(`获取活动信息失败:${e.message || e}❌`);
        }
    }

    async signIn() {
        try {
            const result = await this.request("/sign/activity/sign", {
                method: "POST",
                isJson: true,
                data: { activity_code: this.activity_code, fill_date: "" },
            });
            if (result?.is_sign === true || result?.success === true) {
                $.log("签到成功");
            } else {
                $.log(`签到失败 [${result?.message || JSON.stringify(result)}]`);
            }
        } catch (e) {
            const message = String(e.message || e);
            if (/已签|重复/.test(message)) {
                $.log("今日已签到");
                return;
            }
            $.log(`签到失败 [${message}]`);
        }
    }

    async task_1() {
        try {
            const result = await this.request("/members/browsePage", {
                method: "POST",
                data: {},
            });
            if (result?.code == 200 || result?.statusCode == 200 || result === "") {
                $.log("浏览界面 操作成功");
            } else {
                $.log(`浏览界面 操作失败[${JSON.stringify(result)}]`);
            }
        } catch (e) {
            $.log(`浏览界面 操作失败[${e.message || e}]`);
        }
    }

    async task_2() {
        try {
            const result = await this.request("/members/commnity/brosing/duration/add", {
                method: "POST",
                params: { seconds: 10 },
                data: {},
            });
            if (result?.statusCode == 200 || result?.code == 200 || result === "") {
                $.log("浏览社区 操作成功");
            } else {
                $.log(`浏览社区 操作失败 貌似是正常的 [${JSON.stringify(result)}]`);
            }
        } catch (e) {
            $.log(`浏览社区 操作失败 貌似是正常的 [${e.message || e}]`);
        }
    }

    async doLottery() {
        try {
            const result = await this.request("/lucky/activity/extract", {
                params: { activityCode: `jfcj${this.activity_code}` },
            });
            if (result?.lucky_record_vo) {
                $.log(`🌸账号[${this.index}]🕊抽奖结果:${result.lucky_record_vo.prize_name}🎉`);
            } else {
                $.log(`🌸账号[${this.index}] 抽奖-失败:${JSON.stringify(result)}❌`);
            }
        } catch (e) {
            $.log(`🌸账号[${this.index}] 抽奖-失败:${e.message || e}❌`);
        }
    }

    async getLotteryTaskList() {
        try {
            const result = await this.request(`/lucky/task/package/jfcj${this.activity_code}`);
            if (result?.member_id) {
                $.log(`🌸账号[${this.index}]🕊抽奖次数任务🎉`);
                for (const task of result.task_list || []) {
                    if (task.today_available_task_number >= 1 && task.today_obtained_task_number < task.today_available_task_number) {
                        if (task.task_key === "LOGIN") {
                            $.log(`🌸账号[${this.index}]🕊正在完成任务:${task.task_name}🎉`);
                            const res = await this.request(`/lucky/task/getLoginOpporturnity/jfcj${this.activity_code}`, {
                                method: "PUT",
                                data: {},
                            });
                            $.log(JSON.stringify(res));
                        }
                        if (task.task_key === "BROWSE_PAGE_TASK") {
                            $.log(`🌸账号[${this.index}]🕊正在完成任务:${task.task_name}🎉`);
                            await this.lotteryTaskBrowser(task.link);
                        }
                    }
                }
            } else {
                $.log(`🌸账号[${this.index}] 抽奖次数任务-失败:${JSON.stringify(result)}❌`);
            }
        } catch (e) {
            $.log(`🌸账号[${this.index}] 抽奖次数任务-失败:${e.message || e}❌`);
        }
    }

    async lotteryTaskBrowser(link) {
        await this.request(`/lucky/task/browse/page/start/jfcj${this.activity_code}`, {
            params: { pageUrl: link },
        }).catch(() => {});
        await $.wait(20 * 1000);
        await this.request(`/lucky/task/browse/page/end/jfcj${this.activity_code}`, {
            params: { pageUrl: link },
        }).catch(() => {});
    }

    async getLotteryNum() {
        try {
            const result = await this.request("/lucky/activity/opporturnity", {
                params: { activityCode: `jfcj${this.activity_code}` },
            });
            if (result?.can_use > 0) {
                $.log(`当前剩余抽奖次数：${result.can_use}`);
                for (let can = 0; can < result.can_use; can++) {
                    await this.doLottery();
                }
            } else {
                $.log("当前剩余抽奖次数0");
            }
        } catch (e) {
            $.log(`查询抽奖次数失败:${e.message || e}`);
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
        const { data: res } = await axios.request({
            url: "https://ghproxy.net/https://raw.githubusercontent.com/smallfawn/Note/refs/heads/main/Notice.json",
            headers: { "User-Agent": defaultUserAgent },
            timeout: 3000,
        });
        $.log(res);
        return res;
    } catch (e) {}
}
