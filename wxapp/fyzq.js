/*
风云再起北京 - 每日签到
cron: 20 8 * * *

变量名：fyzq
变量值：wx_server 中保存的 openid/账号标识，多账号用 & 或换行分隔
依赖变量：wx_server_url、wx_auth

说明：2026-08 该小程序把每日签到从原生页面迁到了 H5（首页签到入口跳
web-view 打开 h5Url+'sign'），老接口 /min/min-mall/sign_sign_in 已被服务端
下线，固定返回「系统版本过低，请更新后重试！」。本脚本已改用 H5 页在用的
/mobile/business/sign/info/* 接口（同域 applet.njqsmx.com、同一 AES 签名，
但请求体是 header/body 信封，成功码是 0 而不是 1）。
*/

const { Env } = require("../tools/env.js");
const $ = new Env("风云再起北京");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "fyzq";
const MINI_APP_ID = "wxbc00cc79a68e2305";
const BRAND_KEY = "bjfyzq";
const APPLET_BASE = "https://applet.njqsmx.com";
const SIGN_KEY = Buffer.from("rwCyegYqZjtnBPND", "utf8");
// H5 页里 sourcePlatform: 小程序 web-view = "2"，普通 H5 = "1"
const SOURCE_PLATFORM = "2";
const TOKEN_CACHE_FILE = path.join(__dirname, "fyzq_token_cache.json");

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

function makeSign(params) {
  const text = Object.keys(params)
    .sort()
    .filter((key) => params[key] !== null && params[key] !== undefined && params[key] !== "")
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const cipher = crypto.createCipheriv("aes-128-ecb", SIGN_KEY, null);
  cipher.setAutoPadding(true);
  return Buffer.concat([
    cipher.update(Buffer.from(`"${text}"`, "utf8")),
    cipher.final(),
  ]).toString("base64").replace(/=/g, "");
}

function mask(value = "") {
  value = String(value);
  if (value.length <= 12) return `${value.slice(0, 3)}***`;
  return `${value.slice(0, 6)}***${value.slice(-6)}`;
}

const COMMON_HEADERS = {
  Referer: `https://servicewechat.com/${MINI_APP_ID}/52/page-frame.html`,
  "User-Agent": "Mozilla/5.0 MicroMessenger MiniProgramEnv/Windows",
};

// 老接口：表单 + deviceType/channel，业务成功码 1（登录仍走这条）
async function appletPost(urlPath, params = {}, token = "") {
  const body = {
    ...params,
    deviceType: "4",
    channel: "wxxcx",
  };
  if (token) body.token = token;
  body.sign = makeSign(body);

  const { data } = await axios.post(`${APPLET_BASE}${urlPath}`, new URLSearchParams(body).toString(), {
    headers: { ...COMMON_HEADERS, "Content-Type": "application/x-www-form-urlencoded" },
    timeout: 15000,
    validateStatus: () => true,
  });
  return data;
}

// 新接口：header/body 信封，header 里带 portType 与签名，业务成功码 0
async function envelopePost(urlPath, params = {}) {
  const header = { portType: "MIN", ...params };
  header.sign = makeSign(header);

  const { data } = await axios.post(`${APPLET_BASE}${urlPath}`, { header, body: params }, {
    headers: { ...COMMON_HEADERS, "Content-Type": "application/json" },
    timeout: 15000,
    validateStatus: () => true,
  });

  const code = String(data?.header?.code ?? "");
  const message = data?.header?.message || "";
  if (code === "-1011") {
    const err = new Error(message || "登录状态已过期");
    err.tokenExpired = true;
    throw err;
  }
  if (code !== "0") {
    throw new Error(message || `接口失败: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data?.body || {};
}

class Task {
  constructor(account) {
    this.index = $.userIdx++;
    // 变量值支持 openid#备注 格式：# 后是备注，取码只能用纯 openid
    const [openid, remark] = String(account || "").split("#").map((s) => (s || "").trim());
    this.account = openid;
    this.remark = remark || "";
    this.token = "";
  }

  getCachedToken() {
    return readCache()[this.account]?.token || "";
  }

  saveToken(token, extra = {}) {
    if (!token) return;
    const cache = readCache();
    cache[this.account] = {
      token,
      ...extra,
      updatedAt: new Date().toISOString(),
    };
    writeCache(cache);
  }

  removeToken() {
    const cache = readCache();
    if (cache[this.account]) {
      delete cache[this.account];
      writeCache(cache);
    }
  }

  async getWxCode() {
    const { data } = await wechat.getCode(this.account);
    if (!data?.status) throw new Error(data?.message || "wx_server 获取 code 失败");
    const code = data.data?.code || data.code;
    if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
    return code;
  }

  async login() {
    const code = await this.getWxCode();
    const res = await appletPost("/min/min-user/find_brand_key", {
      code,
      brandKey: BRAND_KEY,
    });

    if (String(res.code) !== "1") {
      throw new Error(res.message || `登录失败: ${JSON.stringify(res)}`);
    }

    const token = res.data?.data?.token || res.data?.token || "";
    if (!token) throw new Error(`账号未绑定或接口未返回 token: ${JSON.stringify(res)}`);

    this.token = token;
    this.saveToken(token, {
      brandId: res.data?.brandId || "",
      isBind: res.data?.isBind,
    });
    $.log(`账号[${this.index}] 登录成功: ${mask(token)}`);
  }

  get signParams() {
    return { sourcePlatform: SOURCE_PLATFORM, token: this.token };
  }

  // H5 的 queryInit：checkStatus 0=今日未签到，非 0=已签到
  async checkinInfo() {
    return envelopePost("/mobile/business/sign/info/getCheckinInfo", this.signParams);
  }

  // H5 的 TodaySignIn：每日唯一的写调用
  async doSign() {
    return envelopePost("/mobile/business/sign/info/signIn", this.signParams);
  }

  async run() {
    $.log(`\n账号[${this.index}]${this.remark ? `[${this.remark}]` : ""} ${mask(this.account)}`);
    this.token = this.getCachedToken();

    if (this.token) {
      $.log(`账号[${this.index}] 使用缓存 token`);
      try {
        return await this.handleStatus(await this.checkinInfo());
      } catch (e) {
        $.log(`账号[${this.index}] 缓存失效: ${e.message || e}`);
        this.removeToken();
      }
    }

    await this.login();
    await this.handleStatus(await this.checkinInfo());
  }

  async handleStatus(info) {
    const days = info.consecutiveDay ?? info.consCheckDays ?? "未知";
    if (info.checkStatus !== 0) {
      $.log(`账号[${this.index}] 今日已签到，连续签到 ${days} 天，奇豆 ${info.integralCnt ?? "未知"}`);
      return;
    }

    const res = await this.doSign();
    const reward = Array.isArray(res.currentReward) ? res.currentReward.join("+") : res.currentReward || "";
    $.log(
      `账号[${this.index}] 签到成功，第 ${res.currentSignDay ?? days} 天` +
      (reward ? `，获得 ${reward}` : "")
    );

    const after = await this.checkinInfo().catch(() => null);
    if (after) $.log(`账号[${this.index}] 当前奇豆 ${after.integralCnt ?? "未知"}`);
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
