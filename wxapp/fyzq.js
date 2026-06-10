/*
风云再起北京 - 每日签到
cron: 20 8 * * *

变量名：fyzq
变量值：wx_server 中保存的 openid/账号标识，多账号用 & 或换行分隔
依赖变量：wx_server_url、wx_auth
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
const CITY_NAME = "北京";
const APPLET_BASE = "https://aplet.njqsmx.com".replace("aplet", "applet");
const SIGN_KEY = Buffer.from("rwCyegYqZjtnBPND", "utf8");
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

async function appletPost(urlPath, params = {}, token = "") {
  const body = {
    ...params,
    deviceType: "4",
    channel: "wxxcx",
  };
  if (token) body.token = token;
  body.sign = makeSign(body);

  const { data } = await axios.post(`${APPLET_BASE}${urlPath}`, new URLSearchParams(body).toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: `https://servicewechat.com/${MINI_APP_ID}/52/page-frame.html`,
      "User-Agent": "Mozilla/5.0 MicroMessenger MiniProgramEnv/Windows",
    },
    timeout: 15000,
    validateStatus: () => true,
  });
  return data;
}

class Task {
  constructor(account) {
    this.index = $.userIdx++;
    this.account = account.trim();
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

  async signBanner() {
    const res = await appletPost("/min/min-homePage/sign_show_banner", {}, this.token);
    if (String(res.code) !== "1") throw new Error(res.message || `查询签到状态失败: ${JSON.stringify(res)}`);
    return res.data || {};
  }

  async doSign() {
    const res = await appletPost("/min/min-mall/sign_sign_in", {}, this.token);
    if (String(res.code) !== "1") throw new Error(res.message || `签到失败: ${JSON.stringify(res)}`);
    return res.data || {};
  }

  async run() {
    $.log(`\n账号[${this.index}] ${mask(this.account)}`);
    this.token = this.getCachedToken();

    if (this.token) {
      $.log(`账号[${this.index}] 使用缓存 token`);
      try {
        const status = await this.signBanner();
        await this.handleStatus(status);
        return;
      } catch (e) {
        $.log(`账号[${this.index}] 缓存失效: ${e.message || e}`);
        this.removeToken();
      }
    }

    await this.login();
    const status = await this.signBanner();
    await this.handleStatus(status);
  }

  async handleStatus(status) {
    if (status.signed) {
      $.log(`账号[${this.index}] 今日已签到，连续签到 ${status.continuous ?? "未知"} 天`);
      return;
    }

    await this.doSign();
    const after = await this.signBanner();
    $.log(`账号[${this.index}] 签到成功，连续签到 ${after.continuous ?? "未知"} 天`);
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
