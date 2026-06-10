/*
艾瑞调研问卷 - 每日签到
cron: 30 8 * * *

变量名：airui
变量值：wx_server 中保存的 openid/账号标识，多账号用 & 或换行分隔
      也支持 openid#token 或仅 token
依赖变量：wx_server_url、wx_auth
*/

const { Env } = require("../tools/env.js");
const $ = new Env("艾瑞调研问卷");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "airui";
const MINI_APP_ID = "wx342d760f674b013b";
const API_BASE = "https://api.ikbang.cn/v2";
const APP_KEY = "A749380BBD5A4D93B55B4BE245A42988";
const TOKEN_CACHE_FILE = path.join(__dirname, "airui_token_cache.json");

const wechat = new WeChatServer({
  url: process.env.wx_server_url || "http://192.168.31.196:8787",
  appid: MINI_APP_ID,
  auth: process.env.wx_auth || "your-api-key",
});

function readCache() {
  try {
    if (!fs.existsSync(TOKEN_CACHE_FILE)) return {};
    return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {};
  } catch {
    return {};
  }
}

function writeCache(cache) {
  try {
    fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
  } catch (e) {
    $.log(`token缓存写入失败: ${e.message || e}`);
  }
}

function md5(text) {
  return crypto.createHash("md5").update(String(text)).digest("hex");
}

function mask(value = "") {
  value = String(value);
  if (!value) return "";
  if (value.length <= 12) return `${value.slice(0, 3)}***`;
  return `${value.slice(0, 6)}***${value.slice(-6)}`;
}

function parseAccount(raw) {
  const text = String(raw || "").trim();
  if (!text) return { openid: "", token: "" };

  if (text.startsWith("{")) {
    try {
      const data = JSON.parse(text);
      return {
        openid: data.openid || data.openId || data.account || "",
        token: data.token || "",
      };
    } catch {}
  }

  for (const sep of ["#", "|"]) {
    if (text.includes(sep)) {
      const [openid, ...rest] = text.split(sep);
      return { openid: openid.trim(), token: rest.join(sep).trim() };
    }
  }

  if (/^[A-F0-9]{64,}$/i.test(text)) return { openid: "", token: text };
  return { openid: text, token: "" };
}

function stringifyQuery(params = {}) {
  return new URLSearchParams(params).toString();
}

function makeSign(urlPath, method, params, timestamp, token = "") {
  let payload = "";
  if (params) {
    payload = method === "POST" ? JSON.stringify(params) : stringifyQuery(params);
  }
  return md5(`${API_BASE}${urlPath}${timestamp}${payload}${APP_KEY}${token || ""}`);
}

async function apiRequest(method, urlPath, { token = "", params = null } = {}) {
  const timestamp = String(Date.now());
  const sign = makeSign(urlPath, method, params, timestamp, token);
  const res = await axios({
    method,
    url: `${API_BASE}${urlPath}`,
    data: method === "POST" ? params : undefined,
    params: method === "GET" ? params : undefined,
    timeout: 15000,
    validateStatus: () => true,
    headers: {
      token,
      sign,
      timestamp,
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 MicroMessenger MiniProgramEnv/Windows",
      Referer: `https://servicewechat.com/${MINI_APP_ID}/127/page-frame.html`,
    },
  });
  return res.data;
}

function assertOk(res, action) {
  if (!res || Number(res.code) !== 1) {
    throw new Error(`${action}失败: ${res?.description || res?.msg || JSON.stringify(res)}`);
  }
  return res.result;
}

class Task {
  constructor(raw) {
    this.index = $.userIdx++;
    const account = parseAccount(raw);
    this.openid = account.openid;
    this.token = account.token || "";
    this.userId = "";
    this.cacheKey = this.openid || (this.token ? md5(this.token).slice(0, 16) : `account_${this.index}`);
  }

  getCached() {
    return readCache()[this.cacheKey] || {};
  }

  saveCache(extra = {}) {
    const cache = readCache();
    cache[this.cacheKey] = {
      ...(cache[this.cacheKey] || {}),
      ...(this.token ? { token: this.token } : {}),
      ...(this.userId ? { userId: this.userId } : {}),
      ...extra,
      updatedAt: new Date().toISOString(),
    };
    writeCache(cache);
  }

  removeToken() {
    const cache = readCache();
    if (cache[this.cacheKey]) {
      delete cache[this.cacheKey].token;
      writeCache(cache);
    }
  }

  async getWxCode() {
    if (!this.openid) throw new Error("缺少 openid，无法自动登录");
    const { data } = await wechat.getCode(this.openid);
    if (!data?.status) throw new Error(data?.message || "wx_server 获取 code 失败");
    const code = data.data?.code || data.code;
    if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
    return code;
  }

  async login() {
    const code = await this.getWxCode();
    const result = assertOk(
      await apiRequest("POST", "/app/auth/authorization", {
        params: {
          code,
          type: "register",
          acceptCode: "",
        },
      }),
      "登录授权"
    );

    if (Number(result.mobileAuthStatus) !== 1 || !result.token) {
      throw new Error("账号未完成手机号授权，需先在小程序登录一次");
    }

    this.token = result.token;
    this.userId = result.userId || "";
    this.saveCache({
      openid: result.openid || "",
      unionid: result.unionid || "",
      userName: result.userName || "",
      inviteCode: result.inviteCode || "",
    });
    $.log(`账号[${this.index}] 登录成功: ${mask(this.userId || this.token)}`);
  }

  async ensureLogin() {
    if (!this.token) this.token = this.getCached().token || "";
    if (this.token) return;
    await this.login();
  }

  async requestWithRelogin(method, urlPath, options = {}) {
    await this.ensureLogin();
    const res = await apiRequest(method, urlPath, { ...options, token: this.token });
    if (Number(res?.code) === -3 && this.openid) {
      $.log(`账号[${this.index}] token失效，重新登录`);
      this.removeToken();
      await this.login();
      return apiRequest(method, urlPath, { ...options, token: this.token });
    }
    return res;
  }

  async getUserInfo() {
    try {
      const info = assertOk(
        await this.requestWithRelogin("GET", "/iclick-new/usercenter/getUserDetails"),
        "查询用户信息"
      );
      this.userId = info.userId || this.userId;
      this.saveCache({ userName: info.userName || "", totalPoints: info.totalPoints || "" });
      $.log(`账号[${this.index}] 用户: ${info.userName || mask(info.userId || "")}，积分 ${info.totalPoints ?? "未知"}`);
      return info;
    } catch (e) {
      $.log(`账号[${this.index}] 用户信息查询失败: ${e.message || e}`);
      return {};
    }
  }

  async getSignInfo() {
    return assertOk(
      await this.requestWithRelogin("GET", "/iclick-new/signIn/getSignInInfo"),
      "查询签到信息"
    );
  }

  async submitSign() {
    return assertOk(await this.requestWithRelogin("POST", "/iclick-new/signIn/sign"), "签到");
  }

  async run() {
    $.log(`\n账号[${this.index}] ${mask(this.openid || this.cacheKey)}`);
    await this.ensureLogin();
    await this.getUserInfo();

    const before = await this.getSignInfo();
    if (before.currentSignIn) {
      $.log(`账号[${this.index}] 今日已签到，连续 ${before.continuityDay ?? "未知"} 天，总签到积分 ${before.totalSignInScore ?? "未知"}`);
      return;
    }

    const score = await this.submitSign();
    const after = await this.getSignInfo();
    $.log(`账号[${this.index}] 签到成功，获得 ${score ?? "未知"} 积分，连续 ${after.continuityDay ?? "未知"} 天，总签到积分 ${after.totalSignInScore ?? "未知"}`);
  }
}

!(async () => {
  $.checkEnv(ckName);
  if (!$.userCount) return;
  for (const account of $.userList) {
    try {
      await new Task(account).run();
    } catch (e) {
      $.log(`账号执行失败: ${e.message || e}`);
    }
  }
})()
  .catch((e) => $.log(`脚本异常: ${e.message || e}`))
  .finally(() => $.done && $.done());
