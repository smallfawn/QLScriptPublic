/*
衣城通 - 签到/每日任务/查询
cron: 20 8 * * *

变量名：yichengtong
变量值：
  1. wx_server 中保存的 openid/账号标识，多账号用 & 或换行分隔
  2. openid#token，可直接写入/刷新本地缓存
  3. 仅 token，也可查询/签到
  4. JSON：{"openid":"...","token":"..."}

依赖变量：wx_server_url、wx_auth
可选变量：yichengtong_token（单账号 token 兜底）
*/

const { Env } = require("../tools/env.js");
const $ = new Env("衣城通");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "yichengtong";
const MINI_APP_ID = "wxc4eaf0fd0c97862f";
const PACKAGE_VERSION = "138";
const API_BASE = "https://api.yctjob.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "yichengtong_token_cache.json");
const TASK_FUNC_TYPE = {
  lookpost: 1,
  sharepost: 2,
  improveresume: 3,
  adddesktop: 4,
  addmymini: 5,
  lookmerchant: 6,
  lookclothing: 7,
  invitecolleagues: 8,
};
const AUTO_TASK_TYPES = new Set([
  TASK_FUNC_TYPE.lookpost,
  TASK_FUNC_TYPE.sharepost,
  TASK_FUNC_TYPE.lookmerchant,
  TASK_FUNC_TYPE.lookclothing,
]);

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
  if (!text) return {};

  if (text.startsWith("{")) {
    try {
      const data = JSON.parse(text);
      return {
        openid: data.openid || data.openId || data.account || "",
        token: data.token || data.Authorization || data.authorization || "",
      };
    } catch {}
  }

  for (const sep of ["#", "|"]) {
    if (text.includes(sep)) {
      const [openid, ...rest] = text.split(sep);
      return { openid: openid.trim(), token: rest.join(sep).trim().replace(/^Bearer\s+/i, "") };
    }
  }

  if (text.startsWith("eyJ") || text.length > 80) return { token: text.replace(/^Bearer\s+/i, "") };
  return { openid: text };
}

function ok(res) {
  return Number(res?.code) === 200;
}

function taskSummary(list = []) {
  return list
    .map((item) => `${item.name || item.title || item.id || "任务"} ${item.completeCount ?? 0}/${item.num ?? 1}`)
    .join("；");
}

function taskName(task = {}) {
  return task.name || task.title || `任务${task.id || task.configId || ""}`;
}

async function request(method, urlPath, { token = "", data = null, params = null, custom = {} } = {}) {
  const res = await axios({
    method,
    url: `${API_BASE}${urlPath}`,
    data,
    params,
    timeout: 30000,
    validateStatus: () => true,
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 MicroMessenger MiniProgramEnv/Windows",
      Referer: `https://servicewechat.com/${MINI_APP_ID}/${PACKAGE_VERSION}/page-frame.html`,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...custom,
  });
  return {
    status: res.status,
    data: res.data,
    text: typeof res.data === "string" ? res.data : JSON.stringify(res.data),
  };
}

class Task {
  constructor(raw) {
    this.index = $.userIdx++;
    const account = parseAccount(raw);
    this.openid = account.openid || "";
    this.token = account.token || process.env.yichengtong_token || "";
    this.wxInfo = {};
    this.userInfo = {};
    this.cacheKey = this.openid || (this.token ? md5(this.token).slice(0, 16) : `account_${this.index}`);
  }

  getCached() {
    return readCache()[this.cacheKey] || {};
  }

  saveCache(extra = {}) {
    const cache = readCache();
    cache[this.cacheKey] = {
      ...(cache[this.cacheKey] || {}),
      ...(this.openid ? { openid: this.openid } : {}),
      ...(this.token ? { token: this.token } : {}),
      ...(this.userInfo?.userId ? { userId: this.userInfo.userId } : {}),
      ...(this.userInfo?.mobile ? { mobile: this.userInfo.mobile } : {}),
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
    if (!this.openid) throw new Error("缺少 openid，无法从 wx_server 获取 code");
    const { data } = await wechat.getCode(this.openid);
    if (!data?.status) throw new Error(data?.message || "wx_server 获取 code 失败");
    const code = data.data?.code || data.code;
    if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
    return code;
  }

  async getOperateData() {
    if (!this.openid) throw new Error("缺少 openid，无法从 wx_server 获取授权数据");
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

  async loginByCode() {
    const code = await this.getWxCode();
    const session = await request("post", "/client/web/wechatSession", {
      params: { code },
      data: {},
    });
    if (session.status !== 200 || !ok(session.data)) {
      throw new Error(`wechatSession失败[${session.status}]: ${session.text.slice(0, 500)}`);
    }
    const data = session.data.data || {};
    this.wxInfo = data.wxInfo || {};
    this.userInfo = data.userInfo || {};
    if (this.wxInfo.openid && !this.openid) this.openid = this.wxInfo.openid;
    const token = this.userInfo.token || data.token || "";
    if (!token) return false;
    this.token = token;
    this.saveCache({ loginType: "wechatSession" });
    $.log(`账号[${this.index}] code登录成功: ${mask(this.userInfo.userId || this.token)}`);
    return true;
  }

  async loginByOperateData() {
    const op = await this.getOperateData();
    const session = await request("post", "/client/web/wechatSession", {
      params: { code: op.code },
      data: {},
    });
    if (session.status === 200 && ok(session.data)) {
      const data = session.data.data || {};
      this.wxInfo = data.wxInfo || {};
      this.userInfo = data.userInfo || {};
    }
    const wxInfo = this.wxInfo || {};
    const login = await request("post", "/client/web/wechatLogin", {
      data: {
        openId: wxInfo.openid || wxInfo.openId || this.openid,
        unionId: wxInfo.unionid || wxInfo.unionId || "",
        sessionKey: wxInfo.sessionKey || wxInfo.session_key || "",
        encryptedData: op.encryptedData,
        iv: op.iv,
        pcSn: "",
        sourceType: 0,
        shareId: null,
        userUuid: null,
        registerType: 1,
      },
    });
    if (login.status !== 200 || !ok(login.data)) {
      throw new Error(`wechatLogin失败[${login.status}]: ${login.text.slice(0, 800)}`);
    }
    this.userInfo = login.data.data || {};
    this.token = this.userInfo.token || "";
    if (!this.token) throw new Error(`wechatLogin未返回token: ${login.text.slice(0, 500)}`);
    this.saveCache({ loginType: "wechatLogin" });
    $.log(`账号[${this.index}] 授权登录成功: ${mask(this.userInfo.userId || this.token)}`);
  }

  async ensureLogin() {
    const cached = this.getCached();
    this.token = this.token || cached.token || "";
    this.userInfo.userId = cached.userId || "";
    if (this.token) return;
    if (!(await this.loginByCode())) {
      $.log(`账号[${this.index}] code未返回token，尝试手机号授权数据登录`);
      await this.loginByOperateData();
    }
  }

  async api(method, urlPath, options = {}) {
    let res = await request(method, urlPath, { ...options, token: this.token });
    if (res.status === 401 || Number(res.data?.code) === 401) {
      $.log(`账号[${this.index}] token失效，尝试重新登录`);
      this.removeToken();
      this.token = "";
      await this.ensureLogin();
      res = await request(method, urlPath, { ...options, token: this.token });
    }
    return res;
  }

  async querySignHome() {
    const res = await this.api("get", "/client/user/signHome");
    if (res.status !== 200 || !ok(res.data)) {
      throw new Error(`签到信息查询失败[${res.status}]: ${res.text.slice(0, 800)}`);
    }
    const data = res.data.data || {};
    const amount = data.amount ?? 0;
    const integral = data.integral ?? 0;
    const configs = Array.isArray(data.configs) ? data.configs : [];
    const today = configs.find((item) => Number(item.signStatus) === 0) || configs.find((item) => item.today);
    const signed = configs.some((item) => Number(item.signStatus) === 1 && item.today);
    $.log(`账号[${this.index}] 查询: 积分${integral}，红包${amount}`);
    if (configs.length) {
      const statusText = configs
        .map((item) => `第${item.dayNum ?? item.days ?? "?"}天:${["未签", "已签", "可补签"][Number(item.signStatus)] || item.signStatus}`)
        .join("；");
      $.log(`账号[${this.index}] 签到日历: ${statusText}`);
    }
    return { data, today, signed };
  }

  async sign(signInfo) {
    if (!signInfo?.today?.logId) {
      $.log(`账号[${this.index}] 未找到今日可签到记录，可能已签到或活动未开放`);
      return;
    }
    const res = await this.api("post", "/client/user/sign", {
      data: { logId: signInfo.today.logId },
    });
    if (res.status === 200 && ok(res.data)) {
      $.log(`账号[${this.index}] 签到成功: ${res.data.msg || "成功"}`);
      return;
    }
    const msg = res.data?.msg || res.data?.message || res.text.slice(0, 500);
    if (/已签|重复|already/i.test(msg)) $.log(`账号[${this.index}] 今日已签到: ${msg}`);
    else $.log(`账号[${this.index}] 签到失败[${res.status}]: ${msg}`);
  }

  async queryTaskHome() {
    const res = await this.api("get", "/client/user/taskHome");
    if (res.status !== 200 || !ok(res.data)) {
      $.log(`账号[${this.index}] 任务信息查询失败[${res.status}]: ${res.text.slice(0, 500)}`);
      return null;
    }
    const data = res.data.data || {};
    $.log(`账号[${this.index}] 任务中心: 积分${data.integral ?? 0}，红包${data.amount ?? 0}`);
    const todayTask = Array.isArray(data.todayTask) ? data.todayTask : [];
    const experienceTask = Array.isArray(data.experienceTask) ? data.experienceTask : [];
    if (todayTask.length) $.log(`账号[${this.index}] 每日任务: ${taskSummary(todayTask)}`);
    if (experienceTask.length) $.log(`账号[${this.index}] 体验任务: ${taskSummary(experienceTask)}`);
    return data;
  }

  async submitTask(task) {
    const id = task.id || task.configId;
    if (!id) return false;
    const res = await this.api("post", "/client/user/taskSub", {
      data: { configId: id },
    });
    if (res.status === 200 && ok(res.data)) {
      $.log(`账号[${this.index}] 任务提交成功: ${taskName(task)} ${res.data.msg || ""}`);
      return true;
    }
    const msg = res.data?.msg || res.data?.message || res.text.slice(0, 500);
    $.log(`账号[${this.index}] 任务提交失败: ${taskName(task)}，${msg}`);
    return false;
  }

  async doDailyTasks(taskHome = null) {
    const data = taskHome || (await this.queryTaskHome());
    if (!data) return;
    const todayTask = Array.isArray(data.todayTask) ? data.todayTask : [];
    const runnable = todayTask.filter((task) => {
      const total = Number(task.num || 1);
      const done = Number(task.completeCount || 0);
      return done < total && AUTO_TASK_TYPES.has(Number(task.functionType));
    });
    if (!runnable.length) {
      $.log(`账号[${this.index}] 每日任务: 暂无可自动执行任务`);
      return;
    }

    for (const task of runnable) {
      const total = Number(task.num || 1);
      let done = Number(task.completeCount || 0);
      const waitSeconds = Math.max(0, Number(task.second || 0));
      while (done < total) {
        $.log(`账号[${this.index}] 执行每日任务: ${taskName(task)} ${done + 1}/${total}`);
        if (waitSeconds > 0) await $.wait(waitSeconds * 1000 + 500, waitSeconds * 1000 + 1800);
        const success = await this.submitTask(task);
        if (!success) break;
        done += 1;
        await $.wait(800, 1500);
      }
    }
  }

  async run() {
    await this.ensureLogin();
    const signInfo = await this.querySignHome();
    await this.sign(signInfo);
    await this.querySignHome();
    const taskHome = await this.queryTaskHome();
    await this.doDailyTasks(taskHome);
    await this.queryTaskHome();
    this.saveCache();
  }
}

!(async () => {
  $.checkEnv(ckName);
  for (const account of $.userList) {
    try {
      await new Task(account).run();
    } catch (e) {
      $.log(`账号执行异常: ${e.message || e}`);
    }
    await $.wait(800, 1500);
  }
})()
  .catch((e) => $.log(e.message || e))
  .finally(() => $.done && $.done());
