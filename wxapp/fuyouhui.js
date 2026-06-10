/*
复游会 - 签到活动
cron: 25 8 * * *

变量名：fuyouhui
变量值：
  1. wx_server 中保存的 openid/账号标识，多账号用 & 或换行分隔
  2. openid#folidayMallToken，可首次写入/刷新本地缓存
  3. 仅 folidayMallToken，也可查询/签到，但不会携带当天 wxcode

依赖变量：wx_server_url、wx_auth
可选变量：fuyouhui_token（单账号 token 兜底）
*/

const { Env } = require("../tools/env.js");
const $ = new Env("复游会");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "fuyouhui";
const MINI_APP_ID = "wx1fa4da2889526a37";
const API_BASE = "https://apis.folidaymall.com";
const SIGN_SALT = "3d83f7d9";
const TOKEN_CACHE_FILE = path.join(__dirname, "fuyouhui_token_cache.json");

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

function uuid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
}

function mask(value = "") {
  value = String(value);
  if (!value) return "";
  if (value.length <= 12) return `${value.slice(0, 3)}***`;
  return `${value.slice(0, 6)}***${value.slice(-6)}`;
}

function clientInfo() {
  return JSON.stringify({
    app_version: "4.0.5",
    client_key: "wx_mini_tc",
    client_name: encodeURIComponent("复游会微信小程序"),
    os: "windows",
    app_key: "WX_MINI_TC",
  });
}

function parseAccount(raw) {
  const text = String(raw || "").trim();
  if (!text) return { openid: "", token: "" };

  if (text.startsWith("{")) {
    try {
      const data = JSON.parse(text);
      return {
        openid: data.openid || data.openId || data.account || "",
        token: data.token || data.folidayMallToken || "",
      };
    } catch {}
  }

  for (const sep of ["#", "|"]) {
    if (text.includes(sep)) {
      const [openid, ...rest] = text.split(sep);
      return { openid: openid.trim(), token: rest.join(sep).trim() };
    }
  }

  if (text.includes(".") || text.startsWith("eyJ")) return { openid: "", token: text };
  return { openid: text, token: "" };
}

async function request(method, urlPath, { token = "", data = null, params = null, headers = {} } = {}) {
  const res = await axios({
    method,
    url: `${API_BASE}${urlPath}`,
    data,
    params,
    timeout: 15000,
    validateStatus: () => true,
    headers: {
      version: "1.0",
      "User-Agent": "Mozilla/5.0 MicroMessenger MiniProgramEnv/Windows",
      Referer: `https://servicewechat.com/${MINI_APP_ID}/250/page-frame.html`,
      "X-Call-Client-Info": clientInfo(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  return res.data;
}

function assertOk(res, action) {
  if (!res || res.hasError || String(res.responseCode) !== "0") {
    throw new Error(`${action}失败: ${res?.errorMessage || res?.message || JSON.stringify(res)}`);
  }
  return res.data || {};
}

class Task {
  constructor(raw) {
    this.index = $.userIdx++;
    const account = parseAccount(raw);
    this.openid = account.openid;
    this.token = account.token || process.env.fuyouhui_token || "";
    this.member = {};
    this.wxcode = "";
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
      ...(this.member?.id ? { memberId: this.member.id } : {}),
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
    if (!this.openid) return "";
    const { data } = await wechat.getCode(this.openid);
    if (!data?.status) throw new Error(data?.message || "wx_server 获取 code 失败");
    const code = data.data?.code || data.code;
    if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
    this.wxcode = code;
    return code;
  }

  async getOperateData() {
    if (!this.openid) throw new Error("缺少 openid，无法自动授权");
    const { data } = await axios.post(
      `${wechat.serverUrl}/wx/getuserinfo`,
      { appid: MINI_APP_ID, openid: this.openid },
      {
        headers: { auth: wechat.auth },
        timeout: 30000,
        validateStatus: () => true,
      }
    );
    if (!data?.status) throw new Error(data?.message || "wx_server 获取 operatedata 失败");
    const info = data.data || {};
    if (!info.code || !info.iv || !info.encryptedData) {
      throw new Error(`wx_server operatedata 缺少必要字段: ${JSON.stringify(data)}`);
    }
    return info;
  }

  async loginByOperateData() {
    const op = await this.getOperateData();
    const data = assertOk(
      await request("post", "/usercenter/online/wxmp/registerWxUserInfo", {
        data: {
          code: op.code,
          appChannel: "",
          appKey: "WX_MINI_TC",
          memberCode: "foryouclub_minipro_regs",
          iv: op.iv,
          encryptedData: op.encryptedData,
          joinXingXuan: false,
        },
      }),
      "自动授权"
    );
    const token = data.token || "";
    if (!token) throw new Error(`自动授权未返回 token: ${JSON.stringify(data)}`);
    this.token = token;
    this.saveCache({
      hasMobile: data.hasMobile,
      fkMember: data.fkMember || "",
    });
    $.log(`账号[${this.index}] 自动授权成功: ${mask(token)}`);
  }

  ensureToken() {
    if (!this.token) this.token = this.getCached().token || "";
    if (!this.token) {
      throw new Error("缺少 folidayMallToken。请将变量设置为 openid#token，或设置 fuyouhui_token。");
    }
  }

  async getMemberInfo() {
    const data = assertOk(
      await request("post", "/usercenter/online/mem/getMemberDetails", { token: this.token }),
      "查询会员信息"
    );
    this.member = data || {};
    if (data.refreshToken) this.token = data.refreshToken;
    this.saveCache({
      member: {
        id: data.id || "",
        phone: data.phone || "",
        openId: data.openId || "",
        account: data.account || "",
      },
    });
    return data;
  }

  signHeaders() {
    const timestamp = Date.now();
    const nonce = uuid();
    const memberId = this.member.id || this.getCached().memberId || "";
    if (!memberId) throw new Error("缺少会员ID，无法生成签到签名");
    return {
      "X-Sign-Timestamp": timestamp,
      "X-Sign-Nonce": nonce,
      "X-Sign-Signature": md5(`${memberId}${timestamp}${nonce}${SIGN_SALT}`),
      "X-Wx-Code": this.wxcode || "",
    };
  }

  async getUserSign() {
    const data = assertOk(
      await request("get", "/online/cms-api/sign/userSign", {
        token: this.token,
        headers: this.signHeaders(),
      }),
      "签到/查询状态"
    );
    return data.signInfo || {};
  }

  async queryAllRewards() {
    try {
      const data = assertOk(
        await request("get", "/online/cms-api/sign/queryAllRewards", { token: this.token }),
        "查询奖励列表"
      );
      return Array.isArray(data) ? data : data.queryAllRewards || data.rewards || [];
    } catch (e) {
      $.log(`账号[${this.index}] 奖励列表查询失败: ${e.message || e}`);
      return [];
    }
  }

  async queryScrollScreen() {
    try {
      const data = assertOk(
        await request("get", "/online/cms-api/sign/queryScrollScreen", { token: this.token }),
        "查询活动滚屏"
      );
      return Array.isArray(data) ? data : data.list || data.records || [];
    } catch (e) {
      $.log(`账号[${this.index}] 活动滚屏查询失败: ${e.message || e}`);
      return [];
    }
  }

  async queryPhoto() {
    try {
      const data = assertOk(await request("get", "/online/cms-api/sign/getPhoto"), "查询活动背景");
      return data.sign || {};
    } catch {
      return {};
    }
  }

  async receiveCoupon(cpId) {
    if (!cpId) return;
    try {
      const data = assertOk(
        await request("get", `/online/capi/cp/receiveCoupon?cpId=${encodeURIComponent(cpId)}`, {
          token: this.token,
        }),
        "领取优惠券"
      );
      $.log(`账号[${this.index}] 优惠券领取结果: ${JSON.stringify(data).slice(0, 120)}`);
    } catch (e) {
      $.log(`账号[${this.index}] 优惠券领取失败: ${e.message || e}`);
    }
  }

  printSignInfo(signInfo) {
    const parts = [
      `连续${signInfo.continousSignDays ?? "未知"}天`,
      `积分${signInfo.currentIntegral ?? "未知"}`,
    ];
    if (signInfo.changeIntegeral) parts.push(`本次+${signInfo.changeIntegeral}`);
    if (signInfo.couponName) parts.push(`券:${signInfo.couponName}`);
    if (signInfo.signRewardMsg) parts.push(String(signInfo.signRewardMsg).replace(/<[^>]+>/g, ""));

    const signedNow = signInfo.hasSign === false;
    const signedBefore = signInfo.hasSign === true;
    $.log(`账号[${this.index}] ${signedNow ? "签到成功" : signedBefore ? "今日已签到" : "签到状态"}，${parts.join("，")}`);
  }

  async run() {
    $.log(`\n账号[${this.index}] ${mask(this.openid || this.cacheKey)}`);

    if (this.openid) {
      try {
        await this.getWxCode();
      } catch (e) {
        $.log(`账号[${this.index}] 获取 wxcode 失败，继续使用 token: ${e.message || e}`);
      }
    }

    if (!this.token) this.token = this.getCached().token || "";
    if (!this.token) await this.loginByOperateData();
    this.ensureToken();

    try {
      const member = await this.getMemberInfo();
      $.log(`账号[${this.index}] 会员: ${mask(member.phone || member.account || member.id || "")}`);
    } catch (e) {
      this.removeToken();
      throw e;
    }

    if (this.openid) {
      try {
        await this.getWxCode();
      } catch (e) {
        $.log(`账号[${this.index}] 刷新签到 wxcode 失败: ${e.message || e}`);
      }
    }

    const signInfo = await this.getUserSign();
    this.printSignInfo(signInfo);
    await this.receiveCoupon(signInfo.cpId);

    const rewards = await this.queryAllRewards();
    if (rewards.length) $.log(`账号[${this.index}] 奖励列表: ${rewards.length}条`);

    const scroll = await this.queryScrollScreen();
    if (scroll.length) $.log(`账号[${this.index}] 滚屏记录: ${scroll.length}条`);

    const photo = await this.queryPhoto();
    if (photo.activityImg) $.log(`账号[${this.index}] 活动背景已获取`);
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
