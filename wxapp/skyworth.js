/*
创维会员中心 - 签到/查询
cron: 38 8 * * *

变量名：skyworth 或 chuangwei
变量值：
  1. wx_server 中保存的 openid，多账号用 & 或换行分隔
  2. openid#token，可直接复用登录 token
  3. JSON：{"openid":"...","token":"...","remark":"..."}

依赖变量：wx_server_url、wx_auth
*/

const { Env } = require("../tools/env.js");
const $ = new Env("创维会员中心");
const axios = require("axios");
const crypto = require("crypto");

const CK_NAME = process.env.skyworth ? "skyworth" : "chuangwei";
const MINI_APP_ID = "wxff438d3c60c63fb6";
const PACKAGE_VERSION = "371";
const WX_SERVER_URL = (process.env.wx_server_url || "http://192.168.31.196:8787").replace(/\/$/, "");
const WX_AUTH = process.env.wx_auth || "";
const API_BASE = "https://uc-api.skyallhere.com/miniprogram/api";
const SIGN_TASK_CODES = ["TS00016", "TS00017"];
const TASK_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIBPAIBAAJBAMJrqTwwvDRo/NP3Pjq0wfeHtfAcwRu5vk5yTfdGmKAAqG9M9Bu8
COIBN/B0lGUcUx4HP4eIvK17HoIut8shun8CAwEAAQJAXVNWymjOfw4ChzFAsud/
0HVZlWgIHmn7+yYNXOyLaQnv8I7GTrVe85lnAvcmboSvpr5KFGzhY0KDpAnCcDsh
QQIhAPzyeP4ncY7cLkftHPUTSg7Tkve/gJUFZN7q2pW0KEGfAiEAxMRcDf8yqSXP
VfUmJpnzranrFRIAs9Eqi1jzbB4KmyECIQCu2hJHZg66uXuInuEQjKf5+PJzLj79
RIBJFEHLkIDvcwIhALvLwSQmvd5MVN9wU1IiOz0zYEfC3+K/LkDCy8kTvwGhAiEA
8OKljQOdOhQcWver4UsvF5jwGPC5CqkPq/not9YLtU4=
-----END RSA PRIVATE KEY-----`;

function splitAccounts(value = "") {
  return String(value)
    .split(/\n|&/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function short(value, max = 500) {
  if (value === undefined || value === null) return "";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function mask(value = "") {
  value = String(value || "");
  if (!value) return "";
  if (value.length <= 12) return `${value.slice(0, 3)}***`;
  return `${value.slice(0, 6)}***${value.slice(-6)}`;
}

function parseAccount(raw = "") {
  const text = String(raw || "").trim();
  if (!text) return {};

  if (text.startsWith("{")) {
    const data = JSON.parse(text);
    return {
      openid: data.openid || data.openId || "",
      token: data.token || data.accessToken || "",
      remark: data.remark || data.name || "",
    };
  }

  const [openid, token, remark] = text.split("#").map((item) => item.trim());
  if (!token && /^eyJ/.test(openid)) return { token: openid, openid: "", remark: "" };
  return { openid, token, remark };
}

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function taskSignHeaders(data = {}) {
  const payload = { ...data };
  const nonce = uuid();
  const timestamp = Date.now();
  payload.nonce = nonce;
  payload.timestamp = timestamp;

  const preSign = Object.keys(payload)
    .sort()
    .filter((key) => key !== "taskCode" && key !== "snCode")
    .map((key) => `${key}=${payload[key]}&`)
    .join("");

  const sign = crypto.createSign("RSA-SHA256").update(preSign).sign(TASK_PRIVATE_KEY, "base64");
  return { sign, timestamp: String(timestamp), nonce };
}

async function request(options) {
  const res = await axios.request({
    timeout: 25000,
    validateStatus: () => true,
    ...options,
    headers: {
      "User-Agent": "Mozilla/5.0 MicroMessenger MiniProgramEnv/Windows",
      Accept: "application/json, text/plain, */*",
      "content-type": "application/json",
      Referer: `https://servicewechat.com/${MINI_APP_ID}/${PACKAGE_VERSION}/page-frame.html`,
      ...(options.headers || {}),
    },
  });
  return { status: res.status, data: res.data, headers: res.headers || {} };
}

async function getWxCode(openid) {
  if (!WX_AUTH) throw new Error("未配置 wx_auth，无法从 wx_server 获取 code");
  const { status, data } = await request({
    method: "POST",
    url: `${WX_SERVER_URL}/wx/code`,
    headers: { auth: WX_AUTH },
    data: { appid: MINI_APP_ID, openid },
  });
  const code = data?.data?.code || data?.code;
  if (status !== 200 || !code) throw new Error(`获取 code 失败 HTTP ${status}: ${short(data)}`);
  return code;
}

class Skyworth {
  constructor(rawAccount, index) {
    this.index = index;
    this.account = parseAccount(rawAccount);
    this.token = this.account.token || "";
    this.profile = null;
  }

  log(message) {
    $.log(`账号[${this.index}]${this.account.remark ? `[${this.account.remark}]` : ""} ${message}`);
  }

  async api(method, path, data = {}, headers = {}) {
    const { status, data: result } = await request({
      method,
      url: `${API_BASE}${path}`,
      params: method.toUpperCase() === "GET" ? data : undefined,
      data: method.toUpperCase() === "GET" ? undefined : data,
      headers: {
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...headers,
      },
    });
    if (status !== 200) throw new Error(`${path} HTTP ${status}: ${short(result)}`);
    return result;
  }

  assertOk(data, name) {
    if (Number(data?.code) !== 0) throw new Error(`${name}失败: ${short(data)}`);
    return data.data;
  }

  async login() {
    if (this.token) {
      this.log(`使用已有 token: ${mask(this.token)}`);
      return;
    }
    if (!this.account.openid) throw new Error("账号格式错误，请配置 wx_server 中的 openid 或直接配置 token");

    const code = await getWxCode(this.account.openid);
    const ticketData = this.assertOk(await this.api("POST", "/v2/user/exchange", { code }), "换取 ticket");
    const ticket = ticketData?.ticket || "";
    if (!ticket) throw new Error(`换取 ticket 响应异常: ${short(ticketData)}`);

    const loginData = this.assertOk(await this.api("POST", "/v2/user/signin", { ticket }), "登录");
    this.token = loginData?.token || "";
    if (!this.token) throw new Error(`登录响应缺少 token: ${short(loginData)}`);
    this.log(`登录成功 token=${mask(this.token)}`);
  }

  async queryUser() {
    const data = this.assertOk(await this.api("GET", "/v1/get-user"), "用户查询");
    const base = data?.baseInfo || {};
    this.profile = base;
    this.log(
      `用户信息: ${base.nickName || base.phone || "-"}，维豆: ${base.userScore ?? "-"}，成长值: ${
        base.growthValue ?? "-"
      }，今日维豆: ${base.todayScore ?? 0}，今日成长: ${base.todayGrowth ?? 0}，等级: ${base.userGrade ?? "-"}`
    );
    return data;
  }

  async queryTasks() {
    const data = this.assertOk(await this.api("GET", "/v1/index-task"), "任务查询");
    const list = Array.isArray(data?.list) ? data.list : [];
    const signTasks = list.filter((item) => SIGN_TASK_CODES.includes(item.taskLabel));
    if (signTasks.length) {
      this.log(
        `签到任务: ${signTasks
          .map((item) => `${item.taskLabel}/${item.taskTitle}/状态${item.taskStatus}/进度${item.doneNum || 0}/${item.limitNum || 1}`)
          .join("，")}`
      );
    } else {
      this.log("签到任务: 列表中未显示，可能今日已完成或入口隐藏");
    }
    return list;
  }

  async completeTask(taskCode) {
    const headers = taskSignHeaders({ taskCode });
    const result = await this.api("GET", `/v1/complete-task/${taskCode}`, { taskCode }, headers);
    if (Number(result?.code) === 20043 && String(result?.msg || "").includes("已完成")) {
      this.log(`签到上报 ${taskCode}: 今日已完成`);
      return result.msg;
    }
    const data = this.assertOk(result, `完成任务 ${taskCode}`);
    this.log(`签到上报 ${taskCode}: ${data || "成功"}`);
    return data;
  }

  async sign() {
    const tasks = await this.queryTasks();
    const visibleSignCodes = tasks
      .filter((item) => SIGN_TASK_CODES.includes(item.taskLabel))
      .map((item) => item.taskLabel);
    const codes = visibleSignCodes.length ? visibleSignCodes : SIGN_TASK_CODES;

    for (const code of codes) {
      try {
        await this.completeTask(code);
      } catch (e) {
        this.log(`签到上报 ${code}: ${e.message || e}`);
      }
      await $.wait(500, 1000);
    }
  }

  async run() {
    try {
      this.log("开始执行");
      await this.login();
      await this.queryUser();
      await this.sign();
      await this.queryTasks();
      await this.queryUser();
    } catch (e) {
      this.log(`执行失败: ${e.message || e}`);
    }
  }
}

async function main() {
  const accounts = splitAccounts(process.env.skyworth || process.env.chuangwei || "");
  if (!accounts.length) {
    $.log("未找到变量 skyworth 或 chuangwei");
    return;
  }
  for (let i = 0; i < accounts.length; i++) {
    await new Skyworth(accounts[i], i + 1).run();
    if (i < accounts.length - 1) await $.wait(1500, 3000);
  }
}

main()
  .catch((e) => $.log(`脚本异常: ${e.message || e}`))
  .finally(() => $.done());
