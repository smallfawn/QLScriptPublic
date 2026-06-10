/*
携程 - 会员签到/任务积分/升级积分
cron: 40 8 * * *

变量名：ctrip
变量值：
  1. wx_server 中保存的 openid/账号标识，多账号用 & 或换行分隔
  2. openid#ticket，可直接复用携程 ticket
  3. JSON：{"openid":"...","ticket":"...","duid":"...","udl":"..."}

依赖变量：wx_server_url、wx_auth
可选变量：ctrip_sign_path，指定抓包到的签到提交接口路径
*/

const { Env } = require("../tools/env.js");
const $ = new Env("携程会员签到");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "ctrip";
const MINI_APP_ID = "wx0e6ed4f51db9d078";
const PACKAGE_VERSION = "1055";
const CLIENT_ID = "09031101311473737701";
const ACCESS_CODE = "XTHYY69RNSKLWEICHATMINI";
const API_BASE = "https://m.ctrip.com";
const PASSPORT_BASE = "https://passport.ctrip.com/gateway/api";
const TOKEN_CACHE_FILE = path.join(__dirname, "ctrip_token_cache.json");
const TASK_CHANNELS = [
  { label: "做任务赚积分", channelCode: "2H3294O46M" },
  { label: "升级赚积分", channelCode: "5EBG1WS7J1" },
];
const CSIGN_PATH =
  "C:/Users/86056/AppData/Roaming/Tencent/xwechat/radium/users/b0ef81749f07b62f5cfab8d1240b6c6a/applet/packages/wx0e6ed4f51db9d078/1055/OUTPUT/wx0e6ed4f51db9d078/cwx/ext/sign/c-sign.js";

const wechat = new WeChatServer({
  url: process.env.wx_server_url || "http://192.168.31.196:8787",
  appid: MINI_APP_ID,
  auth: process.env.wx_auth || "your-api-key",
});

global.wx = global.wx || { j() {} };
global.window = global.window || {};
global.navigator = global.navigator || {
  userAgent: "Mozilla/5.0 MicroMessenger MiniProgramEnv/Windows",
  plugins: [],
};
global.document = global.document || { cookie: "" };
global.screen = global.screen || { width: 1920, height: 1080 };

let csign = null;
try {
  csign = require(CSIGN_PATH);
} catch (e) {
  $.log(`CSign模块加载失败，将不带 n-payload-source 请求: ${e.message || e}`);
}

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

function parseJsonMaybe(text) {
  if (!text || typeof text !== "string") return text;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function parseAccount(raw) {
  const text = String(raw || "").trim();
  if (!text) return {};

  if (text.startsWith("{")) {
    try {
      const data = JSON.parse(text);
      return {
        openid: data.openid || data.openId || data.account || "",
        ticket: data.ticket || data.auth || "",
        duid: data.duid || "",
        udl: data.udl || "",
      };
    } catch {}
  }

  for (const sep of ["#", "|"]) {
    if (text.includes(sep)) {
      const [openid, ticket, duid, udl] = text.split(sep).map((v) => v.trim());
      return { openid, ticket, duid, udl };
    }
  }

  if (/^[A-Z0-9]{48,}$/i.test(text) && !/^o[A-Za-z0-9_-]{20,}$/.test(text)) {
    return { ticket: text };
  }
  return { openid: text };
}

function okResponseStatus(data) {
  return data?.ResponseStatus?.Ack === "Success" || data?.responseStatus?.ack === "Success";
}

function okBusiness(data) {
  const code = Number(data?.code);
  return okResponseStatus(data) && (code === 0 || code === 200);
}

function taskId(task = {}) {
  return task.id || task.taskId || task.taskID || task.taskNo || "";
}

function taskTitle(task = {}) {
  return task.taskName || task.title || task.name || task.buttonName || `任务${taskId(task)}`;
}

function pickTasks(data = {}) {
  const keys = ["taskList", "todoTaskList", "finishTaskList", "filteredTaskList"];
  const map = new Map();
  for (const key of keys) {
    const list = Array.isArray(data[key]) ? data[key] : [];
    for (const item of list) {
      const id = taskId(item);
      if (id && !map.has(String(id))) map.set(String(id), item);
    }
  }
  return [...map.values()];
}

async function gateway(pathname, data) {
  const res = await axios.post(`${PASSPORT_BASE}/${pathname}`, JSON.stringify(data), {
    timeout: 30000,
    validateStatus: () => true,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 MicroMessenger MiniProgramEnv/Windows",
      Referer: `https://servicewechat.com/${MINI_APP_ID}/${PACKAGE_VERSION}/page-frame.html`,
    },
  });
  if (res.status !== 200 || Number(res.data?.ReturnCode) !== 0) {
    throw new Error(`${pathname}失败: ${JSON.stringify(res.data)}`);
  }
  return parseJsonMaybe(res.data.Result || "{}");
}

async function h5Api(pathname, data, account) {
  const cookies = [];
  if (account.ticket) cookies.push(`cticket=${account.ticket}`);
  if (account.duid) cookies.push(`DUID=${encodeURIComponent(account.duid)}`);
  if (account.udl) cookies.push(`_udl=${account.udl}`);
  cookies.push(`GUID=${CLIENT_ID}`);
  const res = await axios.post(`${API_BASE}${pathname}`, JSON.stringify(data || {}), {
    timeout: 30000,
    validateStatus: () => true,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF",
      Referer: "https://m.ctrip.com/",
      Cookie: `${cookies.join("; ")};`,
    },
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
    this.ticket = account.ticket || "";
    this.duid = account.duid || "";
    this.udl = account.udl || "";
    this.uid = "";
    this.cacheKey = this.openid || (this.ticket ? md5(this.ticket).slice(0, 16) : `account_${this.index}`);
  }

  getCached() {
    return readCache()[this.cacheKey] || {};
  }

  saveCache(extra = {}) {
    const cache = readCache();
    cache[this.cacheKey] = {
      ...(cache[this.cacheKey] || {}),
      ...(this.openid ? { openid: this.openid } : {}),
      ...(this.ticket ? { ticket: this.ticket } : {}),
      ...(this.duid ? { duid: this.duid } : {}),
      ...(this.udl ? { udl: this.udl } : {}),
      ...(this.uid ? { uid: this.uid } : {}),
      ...extra,
      updatedAt: new Date().toISOString(),
    };
    writeCache(cache);
  }

  removeTicket() {
    const cache = readCache();
    if (cache[this.cacheKey]) {
      delete cache[this.cacheKey].ticket;
      writeCache(cache);
    }
  }

  async getOperateData() {
    if (!this.openid) throw new Error("缺少 openid，无法从 wx_server 获取运行数据");
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

  async login() {
    const op = await this.getOperateData();
    const wxLogin = await gateway("soa2/14553/wechatLogin.json", {
      AccountHead: {},
      Data: {
        authCode: op.code,
        thirdConfigCode: ACCESS_CODE,
        Context: {},
      },
    });
    if (!wxLogin?.wechatCode || wxLogin?.resultStatus?.returnCode !== 0) {
      throw new Error(`wechatLogin未返回wechatCode: ${JSON.stringify(wxLogin)}`);
    }

    const auth = await gateway("soa2/14553/authenticate.json", {
      AccountHead: {},
      Data: {
        authCode: wxLogin.wechatCode,
        thirdType: "wechat_app",
        thirdConfigCode: ACCESS_CODE,
        context: {
          encryptedData: op.encryptedData,
          iv: op.iv,
          uuid: "",
        },
      },
    });
    if (!auth?.token || auth?.resultStatus?.returnCode !== 0) {
      throw new Error(`authenticate未返回第三方token: ${JSON.stringify(auth)}`);
    }

    const login = await gateway("soa2/12559/thirdPartyLogin.json", {
      AccountHead: {},
      Data: {
        accountHead: {
          locale: "zh_CN",
          platform: "MINIAPP",
        },
        token: auth.token,
        extendedProperties: {
          clientID: CLIENT_ID,
          page_id: "",
          Url: "",
          thirdConfigCode: ACCESS_CODE,
          deviceName: "Windows PC",
          OsType: "windows",
        },
      },
    });
    if (!login?.ticket || login?.resultStatus?.returnCode !== 0) {
      throw new Error(`thirdPartyLogin未返回ticket: ${JSON.stringify(login)}`);
    }

    this.ticket = login.ticket;
    this.duid = login.duid || login.extendedProperties?.duid || "";
    this.udl = login.udl || "";
    this.uid = login.uid || "";
    this.saveCache({ isNewUser: login.extendedProperties?.isNewUser || "" });
    $.log(`账号[${this.index}] 登录成功: ${mask(this.uid || this.ticket)}`);
  }

  async ensureLogin() {
    const cached = this.getCached();
    this.ticket = this.ticket || cached.ticket || "";
    this.duid = this.duid || cached.duid || "";
    this.udl = this.udl || cached.udl || "";
    this.uid = this.uid || cached.uid || "";
    if (this.ticket) return;
    await this.login();
  }

  headers(raw) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "*/*",
      "x-ctx-locale": "zh-CN",
      "x-ctx-group": "ctrip",
      "x-ctx-region": "CN",
      "x-ctx-currency": "CNY",
      "x-wx-include-credentials": "env",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 MicroMessenger/3.9.12 MiniProgramEnv/Windows WindowsWechat/WMPF",
      Referer: `https://servicewechat.com/${MINI_APP_ID}/${PACKAGE_VERSION}/page-frame.html`,
    };
    if (this.openid) headers["x-wx-openid"] = this.openid;
    if (this.duid) headers.duid = this.duid;
    if (this.udl) headers.udl = this.udl;
    const cookies = [];
    if (this.duid) cookies.push(`DUID=${encodeURIComponent(this.duid)}`);
    if (this.udl) cookies.push(`_udl=${this.udl}`);
    cookies.push(`GUID=${CLIENT_ID}`);
    headers.Cookie = `${cookies.join("; ")};`;
    if (csign?.cSign) headers["n-payload-source"] = csign.cSign(md5(raw));
    return headers;
  }

  dataHead(extra = {}) {
    return {
      cid: CLIENT_ID,
      ctok: "",
      cver: "1.2.170",
      lang: "01",
      sid: "",
      syscode: "30",
      auth: this.ticket || "",
      sauth: "",
      ...extra,
      extension: [
        { name: "appId", value: MINI_APP_ID },
        { name: "scene", value: "1001" },
      ],
    };
  }

  async ctripRequest(pathname, data = {}, { addHead = true } = {}) {
    const body = { ...(data || {}) };
    if (addHead) body.head = this.dataHead(body.head || {});
    const raw = JSON.stringify(body);
    const res = await axios.post(`${API_BASE}${pathname}?_fxpcqlniredt=${CLIENT_ID}`, raw, {
      timeout: 30000,
      validateStatus: () => true,
      headers: this.headers(raw),
    });
    return {
      status: res.status,
      data: res.data,
      text: typeof res.data === "string" ? res.data : JSON.stringify(res.data),
    };
  }

  async querySignStatus() {
    const res = await this.ctripRequest("/restapi/soa2/13012/getSignTodayInfoProxy", {});
    if (res.status === 401 && res.data?.code === "11001") {
      $.log(`账号[${this.index}] 签到状态接口被携程运行态校验拦截: ${res.data.message}`);
      return null;
    }
    if (res.status !== 200) {
      $.log(`账号[${this.index}] 签到状态查询异常[${res.status}]: ${res.text.slice(0, 300)}`);
      return null;
    }
    if (!okResponseStatus(res.data)) {
      $.log(`账号[${this.index}] 签到状态查询失败: ${res.text.slice(0, 500)}`);
      return null;
    }
    const info = parseJsonMaybe(res.data.responseJson || "{}");
    const signed = !!(info && info.message === "成功" && info.sign === false);
    $.log(`账号[${this.index}] 今日签到状态: ${signed ? "已签到" : "未签到/未知"}`);
    return { signed, raw: info };
  }

  async trySignEndpoint(pathname) {
    const payloads = [
      {},
      { activityId: "wechat_signin_activity" },
      { source: "wxapp", activityId: "wechat_signin_activity" },
    ];
    for (const payload of payloads) {
      const res = await this.ctripRequest(pathname, payload);
      const body = res.text.slice(0, 600);
      if (res.status === 200 && (okResponseStatus(res.data) || /成功|已签到|sign/i.test(body))) {
        $.log(`账号[${this.index}] 签到接口 ${pathname} 返回: ${body}`);
        return true;
      }
      if (res.status !== 404 && res.status !== 403) {
        $.log(`账号[${this.index}] 候选接口 ${pathname} [${res.status}]: ${body}`);
      }
    }
    return false;
  }

  async sign() {
    await this.querySignStatus();
    const res = await h5Api("/restapi/soa2/22769/signToday", { openId: this.openid || "" }, this);
    if (res.status !== 200) {
      $.log(`账号[${this.index}] 签到请求异常[${res.status}]: ${res.text.slice(0, 500)}`);
      return;
    }
    if (okResponseStatus(res.data)) {
      const message = res.data.message || "";
      const points = Number(res.data.baseIntegratedPoint || 0) + Number(res.data.extraIntegratedPoint || 0);
      if (Number(res.data.code) === 0 || /成功/.test(message)) {
        $.log(`账号[${this.index}] 签到成功: ${message || "成功"}${points ? `，积分+${points}` : ""}`);
      } else if (/已签到|无法补签/.test(message) || Number(res.data.code) === 400001) {
        $.log(`账号[${this.index}] 今日已签到: ${message}`);
      } else {
        $.log(`账号[${this.index}] 签到返回: ${res.text.slice(0, 800)}`);
      }
      return;
    }
    $.log(`账号[${this.index}] 签到失败: ${res.text.slice(0, 800)}`);
  }

  async h5Model(code, name, data = {}) {
    return h5Api(`/restapi/soa2/${code}/${name}`, data, this);
  }

  async taskModel(name, data = {}) {
    const res = await this.h5Model("22598", name, data);
    if (res.status !== 200) {
      $.log(`账号[${this.index}] 任务接口 ${name} 异常[${res.status}]: ${res.text.slice(0, 500)}`);
      return null;
    }
    if (!okBusiness(res.data)) {
      $.log(`账号[${this.index}] 任务接口 ${name} 返回: ${res.text.slice(0, 800)}`);
      return res.data;
    }
    return res.data;
  }

  async queryTaskList(channelCode, label) {
    const data = await this.taskModel("userTaskList", { channelCode });
    if (!data) return [];
    const tasks = pickTasks(data);
    $.log(
      `账号[${this.index}] ${label}: ${data.projectName || channelCode}，待做${(data.todoTaskList || []).length}，已完成${(data.finishTaskList || []).length}，过滤${(data.filteredTaskList || []).length}`
    );
    if (!tasks.length) $.log(`账号[${this.index}] ${label}: 暂无可处理任务`);
    return tasks;
  }

  async receiveTaskAward(channelCode, task, receivedTaskId) {
    const id = taskId(task);
    if (!id || !receivedTaskId) return;
    const data = await this.taskModel("receiveTaskAward", {
      channelCode,
      taskId: id,
      receiveTaskId: receivedTaskId,
    });
    if (okBusiness(data)) {
      $.log(`账号[${this.index}] 领取任务发奖成功: ${taskTitle(task)} ${data.message || ""}`);
    }
  }

  async doTask(channelCode, task, label) {
    const id = taskId(task);
    if (!id) return;
    const status = Number(task.status ?? task.taskStatus ?? 0);
    const title = taskTitle(task);
    const base = { channelCode, taskId: id, status, done: 0 };
    $.log(`账号[${this.index}] ${label} 执行任务: ${title}，status=${status}`);
    const receive = await this.taskModel("todoTask", base);
    const receivedTaskId = receive?.infoMap?.receivedTaskId || receive?.receivedTaskId || "";
    if (okBusiness(receive)) {
      $.log(`账号[${this.index}] ${label} 任务上报成功: ${title} ${receive.message || ""}`);
      await this.receiveTaskAward(channelCode, task, receivedTaskId);
    }

    await $.wait(1000, 1800);
    const done = await this.taskModel("todoTask", { ...base, status: 0, done: 1 });
    if (okBusiness(done)) {
      $.log(`账号[${this.index}] ${label} 浏览完成上报成功: ${title} ${done.message || ""}`);
    }
  }

  async awardTask(channelCode, task, label) {
    const id = taskId(task);
    if (!id) return;
    const data = await this.taskModel("awardTask", { channelCode, taskId: id });
    if (okBusiness(data)) {
      const award = data.awardName || data.rewardName || data.message || "成功";
      $.log(`账号[${this.index}] ${label} 领奖成功: ${taskTitle(task)}，${award}`);
    } else if (data) {
      $.log(`账号[${this.index}] ${label} 领奖返回: ${taskTitle(task)}，${JSON.stringify(data).slice(0, 500)}`);
    }
  }

  async runTaskChannel({ channelCode, label }) {
    let tasks = await this.queryTaskList(channelCode, label);
    for (const task of tasks) {
      const status = Number(task.status ?? task.taskStatus ?? 0);
      if (status === 0 || status === 1) {
        await this.doTask(channelCode, task, label);
        await $.wait(800, 1500);
      }
    }

    tasks = await this.queryTaskList(channelCode, `${label}复查`);
    for (const task of tasks) {
      const status = Number(task.status ?? task.taskStatus ?? 0);
      if (status === 2) {
        await this.awardTask(channelCode, task, label);
        await $.wait(800, 1500);
      } else if (status === 3) {
        $.log(`账号[${this.index}] ${label} 已完成: ${taskTitle(task)}`);
      }
    }
  }

  async queryPointInfo() {
    const point = await this.h5Model("22769", "getSignInUserBasicInfo", {});
    if (point.status === 200 && okBusiness(point.data)) {
      $.log(`账号[${this.index}] 当前会员积分: ${point.data.integratedPoint ?? "未知"}`);
    } else {
      $.log(`账号[${this.index}] 会员积分查询失败: ${point.text.slice(0, 500)}`);
    }

    const yoyo = await this.h5Model("22769", "travelGameUserAccountInfo", {});
    if (yoyo.status === 200 && okBusiness(yoyo.data)) {
      const info = yoyo.data.travelGameUserInfoDto || {};
      const travel = yoyo.data.travelGameUserTravelDto || {};
      const levelText = info.levelName || (info.level ? `LV${info.level}` : "");
      $.log(
        `账号[${this.index}] YOYO信息: ${levelText}，${info.titleName || ""}，还差${info.needFishCount ?? "未知"}条小鱼升级，旅行状态${travel.travelStatus ?? yoyo.data.travelStatus ?? "未知"}`
      );
    } else {
      $.log(`账号[${this.index}] YOYO信息查询失败: ${yoyo.text.slice(0, 500)}`);
    }
  }

  async tryUpgradeAwards() {
    const awards = [
      { name: "travelGameFirstTimeFishAward", label: "首次小鱼升级奖励" },
      { name: "travelGameDailyFishAward", label: "每日小鱼升级奖励" },
      { name: "travelGameTravelAward", label: "云旅行升级奖励" },
    ];
    for (const item of awards) {
      const data = await this.h5Model("22769", item.name, { platform: "H5" });
      if (data.status !== 200) {
        $.log(`账号[${this.index}] ${item.label} 请求异常[${data.status}]: ${data.text.slice(0, 300)}`);
        continue;
      }
      if (okBusiness(data.data)) {
        const exp = data.data.expChangeResultDto || {};
        const point = exp.levelUpIntegralNumber || data.data.travelIntegralNumber || 0;
        $.log(
          `账号[${this.index}] ${item.label} 领取成功: ${data.data.message || "成功"}${point ? `，积分+${point}` : ""}${exp.levelUp ? "，已升级" : ""}`
        );
      } else if (Number(data.data?.code) === 500027) {
        $.log(`账号[${this.index}] ${item.label}: 需要滑块验证，跳过`);
      } else if (/已领取|已经领取|不能领取|暂无|失败|错误/.test(data.data?.message || "")) {
        $.log(`账号[${this.index}] ${item.label}: ${data.data.message}`);
      } else {
        $.log(`账号[${this.index}] ${item.label} 返回: ${data.text.slice(0, 600)}`);
      }
      await $.wait(800, 1500);
    }
  }

  async run() {
    await this.ensureLogin();
    await this.queryPointInfo();
    await this.sign();
    for (const channel of TASK_CHANNELS) {
      await this.runTaskChannel(channel);
    }
    await this.tryUpgradeAwards();
    await this.queryPointInfo();
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
