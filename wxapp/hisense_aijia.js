/*
海信爱家 - 签到/查询
cron: 30 8 * * *

变量名：hisense_aijia
变量值：
  1. wx_server 中保存的 openid，多账号用 & 或换行分隔
  2. customerId#accessToken
  3. openid#customerId#accessToken
  4. JSON：{"openid":"...","customerId":"...","accessToken":"...","refreshToken":"...","loginKey":"..."}

依赖变量：wx_server_url、wx_auth
可选变量：hisense_aijia_customerId、hisense_aijia_token、hisense_aijia_refreshToken、hisense_aijia_loginKey、hisense_aijia_sign_task_id
说明：openid 首次自动登录会通过 wx_server 的 /wx/getphonenumber 获取手机号授权 code。
*/

const { Env } = require("../tools/env.js");
const $ = new Env("海信爱家");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "hisense_aijia";
const MINI_APP_ID = "wxf488d623a17cd7b5";
const PACKAGE_VERSION = "115";
const MINI_ID = "105";
const APP_PACKAGE = "com.hisense.miniapp-aiot";
const FEATURE_CODE = "86100300000100100000fffe";
const APP_VERSION = "m_p.16.000";
const DEFAULT_VALUE = "-1";
const DEFAULT_LICENSE = "-1";
const SOURCE_TYPE = 21;
const SIGN_APP_KEY = "commonweb";
const POINT_BASE = "https://mobile-aiot.hismarttv.com";
const WXTV_BASE = "https://public-wxtv.hismarttv.com";
const MINI_MOBI_BASE = "https://mini-mobi.hismarttv.com";
const ACCOUNT_BASE = "https://portal-account.hismarttv.com";
const SIGN_LIB_PATH =
  "C:/Users/86056/AppData/Roaming/Tencent/xwechat/radium/users/b0ef81749f07b62f5cfab8d1240b6c6a/applet/packages/wxf488d623a17cd7b5/115/OUTPUT/wxf488d623a17cd7b5/pkg_main/common/3rd_libs/sign.js";
const TOKEN_CACHE_FILE = path.join(__dirname, "hisense_aijia_token_cache.json");

const signLib = require(SIGN_LIB_PATH);
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
  value = String(value || "");
  if (!value) return "";
  if (value.length <= 12) return `${value.slice(0, 3)}***`;
  return `${value.slice(0, 6)}***${value.slice(-6)}`;
}

function short(value, limit = 500) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text && text.length > limit ? `${text.slice(0, limit)}...` : text;
}

function randHex(len = 4) {
  return Math.floor(Math.random() * Math.pow(16, len)).toString(16);
}

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateDeviceId() {
  const identifier = (`0${MINI_ID}0${Date.now().toString(16)}${randHex(8)}${randHex(8)}`).slice(0, 32);
  return `${FEATURE_CODE}${identifier}`;
}

function pureGuid() {
  return uuid().replace(/-/g, "");
}

function buildSign(data, postAndJSON) {
  return signLib(data || {}, { appKey: SIGN_APP_KEY, postAndJSON });
}

function encryptByAppKey(value) {
  if (!value) return "";
  return signLib.encryptByAppKey(String(value), SIGN_APP_KEY);
}

function decryptByAppKey(value) {
  if (!value) return "";
  try {
    return signLib.decryptByAppKey(String(value), SIGN_APP_KEY);
  } catch {
    return value;
  }
}

function cleanPayload(data = {}) {
  return Object.entries(data).reduce((obj, [key, val]) => {
    if (val === undefined || val === null || Number.isNaN(val)) return obj;
    obj[key] = val;
    return obj;
  }, {});
}

function parseAccount(raw) {
  const text = String(raw || "").trim();
  if (!text) return {};

  if (text.startsWith("{")) {
    try {
      const data = JSON.parse(text);
      return {
        openid: data.openid || data.openId || data.account || "",
        customerId: data.customerId || data.userId || "",
        accessToken: data.accessToken || data.token || "",
        refreshToken: data.refreshToken || "",
        loginKey: data.loginKey || "",
        phone: data.phone || data.mobilePhone || "",
        phoneCode: data.phoneCode || "",
        encryptedData: data.encryptedData || "",
        iv: data.iv || "",
        loginCode: data.loginCode || data.code || "",
      };
    } catch {}
  }

  if (text.includes("#") || text.includes("|")) {
    const sep = text.includes("#") ? "#" : "|";
    const parts = text.split(sep).map((v) => v.trim()).filter(Boolean);
    if (parts.length >= 3) return { openid: parts[0], customerId: parts[1], accessToken: parts.slice(2).join(sep) };
    if (parts.length === 2) {
      if (parts[0].startsWith("o")) return { openid: parts[0], accessToken: parts[1] };
      return { customerId: parts[0], accessToken: parts[1] };
    }
  }

  if (text.startsWith("o")) return { openid: text };
  return { accessToken: text };
}

function isTokenError(data) {
  const text = short(data, 1000) || "";
  const code = data?.resultCode ?? data?.code;
  return /token|登录|未登录|失效|access/i.test(text) || ["A00001", "B0101", "B0102", "401", 401].includes(code);
}

function requestHeaders(contentType = "application/json") {
  return {
    Accept: "*/*",
    "content-type": contentType,
    "User-Agent": "Mozilla/5.0 MicroMessenger MiniProgramEnv/Windows",
    Referer: `https://servicewechat.com/${MINI_APP_ID}/${PACKAGE_VERSION}/page-frame.html`,
  };
}

function addSearch(url, params = {}) {
  const u = new URL(url);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") u.searchParams.set(key, String(val));
  });
  return u.toString();
}

async function request(method, base, urlPath, data = {}, options = {}) {
  const url = urlPath.startsWith("http") ? urlPath : `${base}${urlPath}`;
  const postAndJSON = method.toUpperCase() === "POST" && (options.contentType || "application/json").includes("json");
  const payload = cleanPayload({ _t: Date.now(), ...(data || {}) });
  const headers = requestHeaders(options.contentType || "application/json");

  if (options.signType === "WEB_CN_GW") {
    headers["X-Sign-For"] = buildSign(payload, postAndJSON);
    headers.appKey = SIGN_APP_KEY;
  } else if (options.signType === "WEB_CN") {
    payload.sign = buildSign(payload, postAndJSON);
    payload.appKey = SIGN_APP_KEY;
  }

  const config = {
    method,
    url,
    timeout: options.timeout || 30000,
    validateStatus: () => true,
    headers,
  };
  if (method.toUpperCase() === "GET") config.params = payload;
  else config.data = payload;

  const res = await axios(config);
  return { status: res.status, data: res.data, text: typeof res.data === "string" ? res.data : JSON.stringify(res.data) };
}

function extractSceneParam(res, sceneCode) {
  const pageParams = res?.pageParams || res?.data?.pageParams || [];
  if (Array.isArray(pageParams)) {
    const item = pageParams.find((v) => v.sceneCode === sceneCode) || pageParams[0] || {};
    return normalizeMaybeJson(item);
  }
  return normalizeMaybeJson(res?.[sceneCode] || res?.data || res || {});
}

function normalizeMaybeJson(value) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  if (!value || typeof value !== "object") return value;
  const out = Array.isArray(value) ? [] : {};
  for (const [key, val] of Object.entries(value)) out[key] = normalizeMaybeJson(val);
  return out;
}

function findTaskId(value) {
  if (!value || typeof value !== "object") return "";
  if (value.mpSignInfo?.taskId) return value.mpSignInfo.taskId;
  if (value.taskId && /sign|签到/i.test(JSON.stringify(value).slice(0, 300))) return value.taskId;
  for (const val of Object.values(value)) {
    const found = findTaskId(val);
    if (found) return found;
  }
  return "";
}

function formatSignStatus(status = {}) {
  const today = status.signedToday ? "已签" : "未签";
  const days = status.keepSigningDays ?? 0;
  const rewards = Array.isArray(status.rewardSignTaskList) ? status.rewardSignTaskList : [];
  const next = rewards[Math.max(0, Number(days) || 0)] || rewards[0] || {};
  const point = Number(next.rewardType) === 130 ? next.rewardNum : "";
  return `今日${today}，连续${days}天${point !== "" ? `，下次奖励${point}积分` : ""}`;
}

class Task {
  constructor(raw) {
    this.index = $.userIdx++;
    const account = parseAccount(raw);
    this.openid = account.openid || "";
    this.customerId = account.customerId || process.env.hisense_aijia_customerId || "";
    this.accessToken = account.accessToken || process.env.hisense_aijia_token || "";
    this.refreshToken = account.refreshToken || process.env.hisense_aijia_refreshToken || "";
    this.loginKey = account.loginKey || process.env.hisense_aijia_loginKey || "";
    this.phone = account.phone || "";
    this.phoneCode = account.phoneCode || "";
    this.encryptedData = account.encryptedData || "";
    this.iv = account.iv || "";
    this.loginCode = account.loginCode || "";
    this.deviceId = generateDeviceId();
    this.cacheKey = this.openid || this.customerId || (this.accessToken ? md5(this.accessToken).slice(0, 16) : `account_${this.index}`);
  }

  getCached() {
    return readCache()[this.cacheKey] || {};
  }

  saveCache(extra = {}) {
    const cache = readCache();
    cache[this.cacheKey] = {
      ...(cache[this.cacheKey] || {}),
      ...(this.openid ? { openid: this.openid } : {}),
      ...(this.customerId ? { customerId: this.customerId } : {}),
      ...(this.accessToken ? { accessToken: this.accessToken } : {}),
      ...(this.refreshToken ? { refreshToken: this.refreshToken } : {}),
      ...(this.loginKey ? { loginKey: this.loginKey } : {}),
      ...(this.phone ? { phone: this.phone } : {}),
      ...extra,
      updatedAt: new Date().toISOString(),
    };
    writeCache(cache);
  }

  removeToken() {
    const cache = readCache();
    if (cache[this.cacheKey]) {
      delete cache[this.cacheKey].accessToken;
      writeCache(cache);
    }
  }

  loadCache() {
    const cached = this.getCached();
    this.openid = this.openid || cached.openid || "";
    this.customerId = this.customerId || cached.customerId || "";
    this.accessToken = this.accessToken || cached.accessToken || "";
    this.refreshToken = this.refreshToken || cached.refreshToken || "";
    this.loginKey = this.loginKey || cached.loginKey || "";
    this.phone = this.phone || cached.phone || "";
  }

  async getWxCode() {
    if (!this.openid) throw new Error("缺少 openid，无法从 wx_server 获取 code");
    const { data } = await wechat.getCode(this.openid);
    if (!data?.status) throw new Error(data?.message || "wx_server 获取 code 失败");
    const code = data.data?.code || data.code;
    if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
    return code;
  }

  async getPhoneNumberData() {
    if (!this.openid) throw new Error("缺少 openid，无法从 wx_server 获取手机号授权 code");
    const { data } = await axios.post(
      `${wechat.serverUrl}/wx/getphonenumber`,
      { appid: MINI_APP_ID, openid: this.openid },
      { headers: { auth: wechat.auth }, timeout: 60000, validateStatus: () => true }
    );
    if (!data?.status) throw new Error(data?.message || "wx_server 获取手机号授权 code 失败");
    const phoneCode = data.data?.code || data.code || "";
    if (!phoneCode) throw new Error(`wx_server 未返回手机号 code: ${short(data, 500)}`);
    const raw = data.data?.raw || {};
    const rawData = normalizeMaybeJson(raw.data || {});
    if (rawData?.mobile) this.phone = this.phone || rawData.mobile;
    return { phoneCode, raw };
  }

  async refreshAccessToken() {
    if (!this.accessToken || !this.refreshToken) return false;
    const res = await request("POST", MINI_MOBI_BASE, "/MobileMiniAppAPI/1.2/adapter/refreshToken", {
      token: this.accessToken,
      refreshToken: this.refreshToken,
    });
    const data = res.data?.data || {};
    if (res.status === 200 && Number(res.data?.resultCode) === 0 && Number(data.resultCode) === 0 && data.token) {
      this.accessToken = data.token;
      this.refreshToken = data.refreshToken || this.refreshToken;
      this.customerId = data.customerId || this.customerId;
      this.saveCache({ loginType: "refreshToken" });
      $.log(`账号[${this.index}] refreshToken 刷新成功: ${mask(this.customerId || this.accessToken)}`);
      return true;
    }
    $.log(`账号[${this.index}] refreshToken 刷新失败: ${short(res.data, 300)}`);
    return false;
  }

  async loginByLoginKey() {
    if (!this.loginKey) return false;
    const res = await request("POST", ACCOUNT_BASE, "/mobile/s/quickLogin", {
      serverCode: 9006,
      requestSource: 2,
      qrCodeFlag: 0,
      accCategory: "newminihxaj",
      termType: "1",
      loginKey: this.loginKey,
      sid: `sid-${Date.now()}-${randHex()}`,
    }, { signType: "WEB_CN_GW" });
    const data = res.data?.data || {};
    const tokenInfo = data.tokenInfo || {};
    if (res.status === 200 && Number(data.resultCode) === 0 && tokenInfo.token) {
      this.customerId = tokenInfo.customerId || this.customerId;
      this.accessToken = tokenInfo.token;
      this.refreshToken = tokenInfo.refreshToken || this.refreshToken;
      this.saveCache({ loginType: "loginKey" });
      $.log(`账号[${this.index}] loginKey 登录成功: ${mask(this.customerId || this.accessToken)}`);
      return true;
    }
    $.log(`账号[${this.index}] loginKey 登录失败: ${short(res.data, 300)}`);
    return false;
  }

  async fetchLoginKey() {
    if (!this.accessToken || this.loginKey) return;
    const res = await request("GET", ACCOUNT_BASE, "/mobile/st/getLoginKey", {
      accessToken: this.accessToken,
      keyType: 1,
    }, { signType: "WEB_CN_GW" });
    const data = res.data?.data || {};
    if (res.status === 200 && Number(data.resultCode) === 0 && data.loginKey) {
      this.loginKey = data.loginKey;
      this.saveCache({ loginKey: this.loginKey });
      $.log(`账号[${this.index}] loginKey 已缓存`);
    } else {
      $.log(`账号[${this.index}] loginKey 获取失败: ${short(res.data, 300)}`);
    }
  }

  async loginByPhoneAuth() {
    let op = {};
    if (this.phoneCode || (this.encryptedData && this.iv)) {
      op = {
        phoneCode: this.phoneCode,
        encryptedData: this.encryptedData,
        iv: this.iv,
        code: this.loginCode,
      };
    } else if (this.openid) {
      op = await this.getPhoneNumberData();
    } else {
      return false;
    }
    const phoneCode = op.phoneCode || this.phoneCode || "";
    const loginCode = this.loginCode || (phoneCode ? "" : op.code || (this.openid ? await this.getWxCode() : ""));
    const loginPayload = {
      deviceId: this.deviceId,
      ...(phoneCode
        ? { phoneCode }
        : {
            iv: op.iv,
            loginCode,
            encryptedData: op.encryptedData,
          }),
      miniId: MINI_ID,
      sid: uuid(),
    };
    const res = await request("POST", WXTV_BASE, "/weixintv/oauth/login4MiniAPPByPhone", loginPayload, { signType: "WEB_CN" });
    const data = res.data || {};
    if (res.status === 200 && Number(data.resultCode) === 0 && data.token) {
      this.customerId = data.customerId || this.customerId;
      this.accessToken = data.token;
      this.refreshToken = data.refreshToken || this.refreshToken;
      this.saveCache({ loginType: "phoneAuth" });
      $.log(`账号[${this.index}] 手机授权登录成功: ${mask(this.customerId || this.accessToken)}`);
      return true;
    }
    const msg = data?.data?.errorDesc || data?.errorDesc || data?.message || short(data, 300);
    $.log(`账号[${this.index}] 手机授权登录失败: ${msg}`);
    return false;
  }

  async ensureLogin() {
    this.loadCache();
    if (this.accessToken && this.customerId) {
      this.saveCache({ loginType: "direct" });
      return;
    }
    if (this.accessToken && !this.customerId) {
      $.log(`账号[${this.index}] 已有 token 但缺少 customerId，请使用 customerId#accessToken 或 JSON 配置`);
    }
    if (await this.refreshAccessToken()) return;
    if (await this.loginByLoginKey()) return;
    if (await this.loginByPhoneAuth()) return;
    throw new Error("未获取到海信业务 customerId/accessToken；首次账号需要手机号授权，请配置 customerId#accessToken 或 JSON");
  }

  commonPointParams() {
    const mobile = this.phone ? encryptByAppKey(this.phone) : "";
    return {
      customerId: String(this.customerId),
      mobile,
      accessToken: this.accessToken,
      appType: MINI_ID,
    };
  }

  commonSignParams() {
    const mobile = this.phone ? encryptByAppKey(this.phone) : "";
    return {
      deviceId: this.deviceId,
      appPackageName: APP_PACKAGE,
      appVersionName: DEFAULT_VALUE,
      appVersionCode: DEFAULT_VALUE,
      license: DEFAULT_LICENSE,
      appVersion: APP_VERSION,
      deviceExt: "Windows",
      userType: "1",
      customerId: String(this.customerId),
      mobile,
      accessToken: this.accessToken,
      userId: String(this.customerId),
    };
  }

  async pointScore(pathname, data = {}) {
    const res = await request("POST", POINT_BASE, pathname, { ...this.commonPointParams(), ...data }, { signType: "WEB_CN_GW" });
    if (res.status !== 200 || isTokenError(res.data)) throw new Error(`${pathname}失败: ${short(res.data, 500)}`);
    return res.data;
  }

  async pointSign(pathname, data = {}, query = {}) {
    const url = Object.keys(query).length ? addSearch(`${POINT_BASE}${pathname}`, query) : `${POINT_BASE}${pathname}`;
    const res = await request("POST", "", url, { ...this.commonSignParams(), ...data }, { signType: "WEB_CN_GW" });
    if (res.status !== 200 || isTokenError(res.data)) throw new Error(`${pathname}失败: ${short(res.data, 500)}`);
    return res.data;
  }

  async queryProfile() {
    const res = await request("GET", "", `${POINT_BASE}/MobileMiniAppAPI/s/6.3/account/getCustomerProfile`, {
      accessToken: this.accessToken,
      timeStamp: Math.floor(Date.now() / 1000),
      customerId: this.customerId,
      randStr: pureGuid(),
    }, { signType: "WEB_CN_GW" });
    if (res.status === 200 && Number(res.data?.resultCode) === 0) {
      const data = res.data.data || {};
      this.phone = decryptByAppKey(data.mobilePhone || "") || this.phone;
      this.saveCache({ phone: this.phone });
      $.log(`账号[${this.index}] 用户: ${mask(data.mobilePhone || this.customerId)}${data.nickName ? `，${data.nickName}` : ""}`);
    } else {
      $.log(`账号[${this.index}] 用户信息查询失败: ${short(res.data, 300)}`);
    }
  }

  async queryPoints() {
    const res = await this.pointScore("/AIoTPointsMall/gw/svc/HiScore/1.0/userPoints", {});
    if (Number(res.resultCode) !== 0) throw new Error(`积分查询失败: ${short(res, 500)}`);
    const data = res.data || {};
    $.log(`账号[${this.index}] 总积分: ${data.totalScore ?? 0}`);
    return data;
  }

  async queryTodayRecords() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const res = await this.pointScore("/AIoTPointsMall/gw/svc/HiScore/1.0/userPointRecords", {
      pageNo: "1",
      pageSize: "100",
      startTime: start.getTime(),
      endTime: end.getTime(),
    });
    if (Number(res.resultCode) !== 0 && res.data?.resultCode !== "B0306") throw new Error(`今日积分记录查询失败: ${short(res, 500)}`);
    const list = Array.isArray(res.data?.entities) ? res.data.entities : [];
    const income = list.filter((item) => Number(item.type) === 1).reduce((sum, item) => sum + Number(item.score || 0), 0);
    $.log(`账号[${this.index}] 今日获得积分: ${income}`);
    if (list.length) $.log(`账号[${this.index}] 今日记录: ${list.slice(0, 5).map((v) => `${v.scoreName || v.name || "积分"}+${v.score || 0}`).join("；")}`);
    return list;
  }

  async getSceneParam(sceneCode) {
    const res = await request("GET", WXTV_BASE, "/vodapptv/5.10/sceneParams/data/get", {
      accessToken: this.accessToken,
      type: 2,
      sceneCode,
    }, { signType: "NONE" });
    if (res.status !== 200 || Number(res.data?.resultCode) !== 0) throw new Error(`编排查询失败: ${short(res.data, 500)}`);
    return extractSceneParam(res.data, sceneCode);
  }

  async getSignTaskId() {
    if (process.env.hisense_aijia_sign_task_id) return process.env.hisense_aijia_sign_task_id;
    const scene = await this.getSceneParam("STATIC_AILIFE_SIGN_INFO");
    const taskId = findTaskId(scene);
    if (!taskId) throw new Error(`未解析到签到 taskId: ${short(scene, 500)}`);
    $.log(`账号[${this.index}] 签到任务ID: ${taskId}`);
    return taskId;
  }

  async querySignStatus(taskId) {
    const res = await this.pointSign("/AIoTPointsMall/gw/svc/HiVip/1.0/getCheckInStatus", {
      taskId,
      sourceType: SOURCE_TYPE,
    });
    if (String(res.code ?? "1") !== "0") throw new Error(`签到状态查询失败: ${short(res, 500)}`);
    const status = res.checkInStatus || {};
    $.log(`账号[${this.index}] 签到状态: ${formatSignStatus(status)}`);
    return status;
  }

  async signIn(taskId, status = {}) {
    if (status.signedToday) {
      $.log(`账号[${this.index}] 今日已签到`);
      return;
    }
    const rewards = Array.isArray(status.rewardSignTaskList) ? status.rewardSignTaskList : [];
    const days = Number(status.keepSigningDays || 0);
    const reward = rewards[Math.max(0, days)] || rewards[0] || {};
    if (reward.rewardType !== undefined && Number(reward.rewardType) !== 130) {
      $.log(`账号[${this.index}] 当前奖励类型异常，跳过签到`);
      return;
    }
    const now = Date.now();
    const res = await this.pointSign(
      "/AIoTPointsMall/gw/svc/HiVip/1.0/checkIn",
      {
        returnCheckInStatus: false,
        requestId: `ailife_sign-${now}-${randHex()}`,
        taskId,
        reportToGroup: 1,
        requestTime: String(now),
      },
      { customerId: this.customerId }
    );
    if (String(res.code ?? "1") === "0") {
      $.log(`账号[${this.index}] 签到成功${reward.rewardNum ? `，预计获得${reward.rewardNum}积分` : ""}`);
    } else {
      const msg = res.message || res.msg || short(res, 300);
      if (/已签|重复|today/i.test(msg)) $.log(`账号[${this.index}] 今日已签到: ${msg}`);
      else $.log(`账号[${this.index}] 签到失败: ${msg}`);
    }
  }

  async run() {
    try {
      await this.ensureLogin();
      $.log(`账号[${this.index}] 登录态: customerId=${mask(this.customerId)} token=${mask(this.accessToken)}`);
      await this.queryProfile();
      await this.queryPoints();
      await this.queryTodayRecords();
      const taskId = await this.getSignTaskId();
      const status = await this.querySignStatus(taskId);
      await this.signIn(taskId, status);
      await this.queryPoints();
    } catch (e) {
      $.log(`账号[${this.index}] 运行失败: ${e.message || e}`);
    }
  }
}

!(async () => {
  $.checkEnv(ckName);
  if (!$.userCount) {
    $.log(`未配置变量 ${ckName}`);
    await $.done();
    return;
  }
  for (const raw of $.userList) {
    const task = new Task(raw);
    await task.run();
  }
  await $.done();
})();
