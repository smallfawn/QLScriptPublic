/*
------------------------------------------
@Author: sm
@Date: 2026.05.31
@Description: 顾家小程序签到
cron: 41 8 * * *
------------------------------------------
变量名：gujiajiaju
变量值：wx_server 里的 openid/账号标识，多账号用 & 或换行
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const $ = new Env("顾家小程序签到");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const WeChatServer = require("./wcs.js");

const MINI_APP_ID = "wx0770280d160f09fe";
const PAGE_VERSION = "286";
const API_BASE = "https://mc.kukahome.com/club-server";
const INTEGRAL_BASE = "https://mc.kukahome.com/integral-server";
const BRAND_CODE = "K001";
const SMALL_APPLICATION_ID = "667516";
const SMALL_CRYPTO = "FH3yRrHG2RfexND8";
const VERSION_NUMBER = "2.8.6";
const TOKEN_CACHE_FILE = path.join(__dirname, "gujiajiaju_token_cache.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF";

let ckName = "gujiajiaju";

const wechat = new WeChatServer({
  url: process.env.wx_server_url || "http://192.168.31.196:8787",
  appid: MINI_APP_ID,
  auth: process.env.wx_auth || "",
});

function md5(input) {
  return crypto.createHash("md5").update(String(input)).digest("hex");
}

function readTokenCache() {
  try {
    if (!fs.existsSync(TOKEN_CACHE_FILE)) return {};
    return JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8")) || {};
  } catch {
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

function isObject(val) {
  return Object.prototype.toString.call(val) === "[object Object]";
}

function buildParameterBase(data) {
  if (!data) return null;
  if (Array.isArray(data) || typeof data === "string") return null;
  if (!isObject(data)) return null;
  const keys = Object.keys(data).sort((a, b) => {
    const ac = [...a].map((ch) => ch.charCodeAt(0));
    const bc = [...b].map((ch) => ch.charCodeAt(0));
    for (let i = 0; i < Math.min(ac.length, bc.length); i++) {
      if (ac[i] !== bc[i]) return ac[i] - bc[i];
    }
    return ac.length - bc.length;
  });
  const pairs = [];
  for (const key of keys) {
    const value = data[key];
    if (value === null || value === undefined || value === "") continue;
    if (Array.isArray(value)) continue;
    if (typeof value === "object" && value !== null) {
      pairs.push(`${key}=${JSON.stringify(value)}`);
      continue;
    }
    if (typeof value === "number" && value === 0) {
      pairs.push(`${key}=0`);
      continue;
    }
    pairs.push(`${key}=${value}`);
  }
  return pairs.length ? pairs.join("&") : null;
}

function buildParameterSign(data, timestamp) {
  const base = buildParameterBase(data);
  if (!base) return "";
  const salt = String(timestamp).substring(4, 10);
  return md5(md5(base) + salt);
}

class Task {
  constructor(openid) {
    this.index = $.userIdx++;
    this.openid = String(openid || "").trim();
    this.tmpToken = "";
    this.accessToken = "";
    this.memberId = "";
    this.userInfo = {};
  }

  cacheKey() {
    return this.openid;
  }

  getCachedToken() {
    const cache = readTokenCache();
    return cache[this.cacheKey()] || null;
  }

  saveCachedToken() {
    if (!this.accessToken || !this.memberId) return;
    const cache = readTokenCache();
    cache[this.cacheKey()] = {
      accessToken: this.accessToken,
      memberId: this.memberId,
      nickName: this.userInfo.nickName || "",
      mobile: this.userInfo.mobile || "",
      updatedAt: new Date().toISOString(),
    };
    writeTokenCache(cache);
  }

  clearCachedToken() {
    const cache = readTokenCache();
    delete cache[this.cacheKey()];
    writeTokenCache(cache);
    this.tmpToken = "";
    this.accessToken = "";
    this.memberId = "";
    this.userInfo = {};
  }

  applyToken(data = {}) {
    this.accessToken = data.accessToken || data.token || this.accessToken;
    this.memberId = String(data.memberId || this.memberId || "");
  }

  async request({ method = "POST", url, data = {}, params = {}, withAuth = true, withTmpToken = true }) {
    const timestamp = Date.now();
    const sign = md5(`${SMALL_APPLICATION_ID}${SMALL_CRYPTO}${timestamp}`).toLowerCase();
    const bodyForSign = method.toUpperCase() === "GET" ? params : data;
    const parameterSign = buildParameterSign(bodyForSign, timestamp);
    const headers = {
      "User-Agent": USER_AGENT,
      Referer: `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      "X-Customer": this.memberId || "",
      brandCode: BRAND_CODE,
      appid: SMALL_APPLICATION_ID,
      sign,
      timestamp,
      versionNumber: VERSION_NUMBER,
    };
    if (parameterSign) headers.parameterSign = parameterSign;
    if (withAuth && this.accessToken) headers.AccessToken = this.accessToken;
    if (withTmpToken && this.tmpToken) headers.tmpToken = this.tmpToken;

    const res = await axios.request({
      method,
      url,
      data,
      params,
      headers,
      timeout: 20000,
      validateStatus: () => true,
    });

    if (res.status !== 200) {
      throw new Error(`HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    }
    const result = res.data || {};
    if (result.code !== undefined && ![0, 401, 402, 515].includes(Number(result.code))) {
      throw new Error(result.message || result.msg || JSON.stringify(result));
    }
    return result;
  }

  async getWxCode() {
    const { data } = await wechat.getCode(this.openid);
    const code = data?.code || data?.data?.code;
    if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
    return code;
  }

  async login() {
    const code = await this.getWxCode();
    const identify = await this.request({
      method: "POST",
      url: `${API_BASE}/api/user/identify`,
      params: { code },
      withAuth: false,
      withTmpToken: false,
    });
    if (identify.code !== 0 || !identify.data) {
      throw new Error(`identify失败: ${identify.message || JSON.stringify(identify)}`);
    }
    if (Number(identify.data.status) !== 4) {
      throw new Error(`登录状态异常: status=${identify.data.status}`);
    }
    this.tmpToken = identify.data.token || "";
    if (!this.tmpToken) throw new Error("identify未返回tmpToken");

    const auth = await this.request({
      method: "POST",
      url: `${API_BASE}/api/user/authorizeLogin`,
      data: { source: "顾家小程序", contentName: "" },
      withAuth: false,
      withTmpToken: true,
    });
    if (auth.code !== 0 || !auth.data?.token) {
      throw new Error(`authorizeLogin失败: ${auth.message || JSON.stringify(auth)}`);
    }
    this.accessToken = auth.data.token;
    this.memberId = String(auth.data.memberId || "");
    this.tmpToken = "";
  }

  async getUserInfo() {
    const info = await this.request({
      method: "POST",
      url: `${API_BASE}/api/user/info`,
      data: {},
      withAuth: true,
      withTmpToken: false,
    });
    if (!info.data) throw new Error("user/info返回为空");
    this.userInfo = info.data;
    this.applyToken(info.data);
    const name = this.userInfo.nickName || this.userInfo.name || this.memberId || "未知";
    $.log(`账号[${this.index}] 用户: ${name}`);
  }

  async ensureLogin() {
    const cached = this.getCachedToken();
    if (cached) {
      this.applyToken(cached);
      $.log(`账号[${this.index}] 使用缓存token`);
      try {
        await this.getUserInfo();
        return;
      } catch {
        this.clearCachedToken();
        $.log(`账号[${this.index}] 缓存失效，重新登录`);
      }
    }
    await this.login();
    await this.getUserInfo();
    this.saveCachedToken();
    $.log(`账号[${this.index}] 登录成功 memberId=${this.memberId}`);
  }

  async checkCalendar() {
    try {
      const ret = await this.request({
        method: "GET",
        url: `${INTEGRAL_BASE}/user/sign/calendar`,
        params: {},
      });
      $.log(`账号[${this.index}] 日历查询: code=${ret.code}`);
    } catch (e) {
      $.log(`账号[${this.index}] 日历查询失败: ${e.message || e}`);
    }
  }

  async sign() {
    try {
      const ret = await this.request({
        method: "POST",
        url: `${INTEGRAL_BASE}/scenePoint/scene/point`,
        data: {
          scene: "sign",
          brandCode: BRAND_CODE,
        },
      });
      if (ret.code === 0) {
        $.log(`账号[${this.index}] 签到成功`);
        return;
      }
      const msg = ret.message || ret.msg || JSON.stringify(ret);
      if (/已签|重复|already|今日/.test(msg)) {
        $.log(`账号[${this.index}] 今日已签到`);
        return;
      }
      throw new Error(msg);
    } catch (e) {
      const msg = e.message || String(e);
      if (/已签|重复|already|今日/.test(msg)) {
        $.log(`账号[${this.index}] 今日已签到`);
        return;
      }
      throw e;
    }
  }

  async run() {
    try {
      await this.ensureLogin();
      await this.checkCalendar();
      await this.sign();
      this.saveCachedToken();
    } catch (e) {
      const msg = e.message || String(e);
      $.log(`账号[${this.index}] 执行失败: ${msg}`);
      if (/401|token|登录|失效|过期/i.test(msg)) this.clearCachedToken();
    }
  }
}

!(async () => {
  $.checkEnv(ckName);
  for (const openid of $.userList) {
    await new Task(openid).run();
  }
})()
  .catch((e) => $.log(e.message || e))
  .finally(() => $.done());
