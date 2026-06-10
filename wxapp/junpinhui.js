/*
君品荟 - 登录、签到、查询、酒谷之旅农场
cron: 45 8 * * *

变量名：junpinhui
变量值：wx_server 中保存的 openid/账号标识，多账号用 & 或换行分隔
      也支持 openid#token 或仅 token
依赖变量：wx_server_url、wx_auth
*/

const { Env } = require("../tools/env.js");
const $ = new Env("君品荟");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const WeChatServer = require("./wcs.js");

const ckName = "junpinhui";
const MINI_APP_ID = "wx8d41cdc44c8aeaab";
const APP_VERSION = "1.0.12";
const FM_BASE = "https://fm.exijiu.com";
const GARDEN_BASE = "https://apimallwm.exijiu.com";
const TOKEN_CACHE_FILE = path.join(__dirname, "junpinhui_token_cache.json");

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
        token: data.token || data.accessToken || "",
      };
    } catch {}
  }

  for (const sep of ["#", "|"]) {
    if (text.includes(sep)) {
      const [openid, ...rest] = text.split(sep);
      return { openid: openid.trim(), token: rest.join(sep).trim() };
    }
  }

  if (text.length > 40 && !text.startsWith("o")) return { openid: "", token: text };
  return { openid: text, token: "" };
}

function headers(token = "") {
  return {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 MicroMessenger MiniProgramEnv/Windows",
    Referer: `https://servicewechat.com/${MINI_APP_ID}/215/page-frame.html`,
    AppID: MINI_APP_ID,
    "App-Version": APP_VERSION,
    Authorization: `Basic ${Buffer.from("wechat:wechat_secret").toString("base64")}`,
    ...(token ? { "X-Access-Token": token } : {}),
  };
}

function shortJson(value, limit = 180) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

function okCode(res) {
  return String(res?.code) === "10000" || res?.success === true || Number(res?.err) === 0;
}

function assertOk(res, action) {
  if (!res || !okCode(res)) {
    throw new Error(`${action}失败: ${res?.message || res?.msg || res?.errMsg || shortJson(res, 500)}`);
  }
  return res.data;
}

async function request(method, base, urlPath, { token = "", data = null, params = null } = {}) {
  const res = await axios({
    method,
    url: `${base}${urlPath}`,
    data,
    params,
    timeout: 20000,
    validateStatus: () => true,
    headers: headers(token),
  });
  return res.data;
}

function aesCbcPkcs7Hex(text, key, iv) {
  const keyBuf = Buffer.from(String(key), "utf8");
  const ivBuf = Buffer.from(String(iv), "utf8");
  const algo = { 16: "aes-128-cbc", 24: "aes-192-cbc", 32: "aes-256-cbc" }[keyBuf.length];
  if (!algo) throw new Error(`encrypt_key长度异常: ${keyBuf.length}`);
  if (ivBuf.length !== 16) throw new Error(`iv长度异常: ${ivBuf.length}`);
  const cipher = crypto.createCipheriv(algo, keyBuf, ivBuf);
  return cipher.update(text, "utf8", "hex") + cipher.final("hex");
}

function listify(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const key of ["list", "data", "records", "items", "rows"]) {
    if (Array.isArray(value[key])) return value[key];
  }
  return [];
}

function pickId(item = {}) {
  for (const key of ["id", "sorghum_id", "sorghumId", "member_sorghum_id", "memberSorghumId", "land_id", "landId"]) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== "") return item[key];
  }
  return "";
}

function landNo(item = {}) {
  return item.serial_number ?? item.serialNumber ?? pickId(item) ?? "?";
}

function landStatus(item = {}) {
  const value = Number(item.status ?? -1);
  return Number.isFinite(value) ? value : -1;
}

function isPlantable(item = {}) {
  return pickId(item) && landStatus(item) === 0;
}

function isGrowing(item = {}) {
  const status = landStatus(item);
  return pickId(item) && status > 0 && ![10, 11].includes(status);
}

function isHarvestable(item = {}) {
  return pickId(item) && [10, 11].includes(landStatus(item));
}

function isCompleted(task = {}) {
  return Number(task.is_complete ?? task.isComplete ?? task.complete ?? task.status_complete ?? 0) === 1;
}

class Task {
  constructor(raw) {
    this.index = $.userIdx++;
    const account = parseAccount(raw);
    this.openid = account.openid;
    this.token = account.token || "";
    this.member = {};
    this.cacheKey = this.openid || (this.token ? md5(this.token).slice(0, 16) : `account_${this.index}`);
  }

  getCached() {
    return readCache()[this.cacheKey] || {};
  }

  saveCache(extra = {}) {
    const cache = readCache();
    cache[this.cacheKey] = {
      ...(cache[this.cacheKey] || {}),
      openid: this.openid || this.getCached().openid || "",
      ...(this.token ? { token: this.token } : {}),
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
    const data = assertOk(
      await request("post", FM_BASE, "/api/v2/login/wxMiniSilentLogin", {
        data: { code },
      }),
      "静默登录"
    );
    if (!data?.token) throw new Error(`静默登录未返回 token: ${JSON.stringify(data)}`);
    this.token = data.token;
    this.saveCache({
      unionId: data.unionId || "",
      phone: data.phone || "",
      mainOpenId: data.openId || "",
    });
    $.log(`账号[${this.index}] 登录成功: ${mask(data.phone || data.openId || this.token)}`);
  }

  async ensureLogin() {
    if (!this.token) this.token = this.getCached().token || "";
    if (this.token) return;
    await this.login();
  }

  async withRelogin(fn) {
    await this.ensureLogin();
    let res = await fn();
    const msg = `${res?.message || ""}${res?.msg || ""}`;
    if (!okCode(res) && this.openid && /登录|授权|token|Token|未认证|失效/.test(msg)) {
      $.log(`账号[${this.index}] token疑似失效，重新登录`);
      this.removeToken();
      await this.login();
      res = await fn();
    }
    return res;
  }

  async gardenGet(urlPath, params = {}) {
    const res = await this.withRelogin(() =>
      request("get", GARDEN_BASE, urlPath, { token: this.token, params })
    );
    return assertOk(res, urlPath);
  }

  async gardenPost(urlPath, data = {}) {
    const res = await this.withRelogin(() =>
      request("post", GARDEN_BASE, urlPath, { token: this.token, data })
    );
    return assertOk(res, urlPath);
  }

  async getEncryptKey() {
    if (!this.openid) throw new Error("缺少 openid，无法生成微信 encryptData");
    const { data } = await axios.post(
      `${wechat.serverUrl}/wx/encryptkey`,
      { appid: MINI_APP_ID, openid: this.openid },
      {
        headers: { auth: wechat.auth },
        timeout: 30000,
        validateStatus: () => true,
      }
    );
    if (!data?.status) throw new Error(data?.message || "wx_server 获取 encryptkey 失败");
    const info = data.data || {};
    const encryptKey = info.encryptKey || info.encrypt_key;
    const iv = info.iv;
    const version = info.version;
    if (!encryptKey || !iv || version === undefined) {
      throw new Error(`wx_server encryptkey 缺少必要字段: ${JSON.stringify(data)}`);
    }
    return { encryptKey, iv, version };
  }

  async encryptData(data = {}) {
    const payload = data && typeof data === "object" ? { ...data } : {};
    const key = await this.getEncryptKey();
    payload.ts = Date.now();
    payload.encryptData = aesCbcPkcs7Hex(JSON.stringify(payload), key.encryptKey, key.iv);
    payload.version = key.version;
    return payload;
  }

  async encryptedPost(urlPath, data = {}) {
    return this.gardenPost(urlPath, await this.encryptData(data));
  }

  async encryptedGet(urlPath, data = {}) {
    return this.gardenGet(urlPath, await this.encryptData(data));
  }

  async queryMember() {
    const info = await this.gardenGet("/garden/Gardenmemberinfo/getMemberInfo");
    this.member = info || {};
    this.saveCache({
      memberId: info?.member_id || "",
      nickName: info?.nick_name || "",
      integration: info?.integration || "",
    });
    $.log(
      `账号[${this.index}] 会员: ${info?.nick_name || mask(info?.member_id || "")}，积分${info?.integration ?? "未知"}，水滴${info?.water ?? 0}，有机肥${info?.manure ?? 0}，种子${info?.sorghum ?? 0}`
    );
    return info || {};
  }

  async dailySign() {
    try {
      const data = await this.encryptedPost("/garden/sign/dailySign");
      $.log(`账号[${this.index}] 签到成功: ${shortJson(data || "ok")}`);
    } catch (e) {
      $.log(`账号[${this.index}] 签到失败: ${e.message || e}`);
    }
  }

  async queryFarm() {
    const data = await this.gardenGet("/garden/sorghum/index");
    const lands = listify(data);
    const summary = lands
      .map((v) => `#${v.serial_number ?? v.id ?? "?"}:${v.status ?? "?"}`)
      .join(" ");
    $.log(`账号[${this.index}] 地块: ${lands.length || 0}块 ${summary}`.trim());
    return lands;
  }

  landPayload(land) {
    const id = pickId(land);
    return {
      id,
      sorghum_id: id,
      member_sorghum_id: id,
      land_id: id,
    };
  }

  async harvestFarm(lands) {
    const candidates = lands.filter(isHarvestable);
    if (!candidates.length) return false;

    let acted = false;
    try {
      const data = await this.encryptedGet("/garden/Sorghum/harvestAll");
      $.log(`账号[${this.index}] 一键收获成功: ${shortJson(data || "ok")}`);
      return true;
    } catch (e) {
      $.log(`账号[${this.index}] 一键收获失败，尝试单块收获: ${e.message || e}`);
    }

    for (const land of candidates) {
      try {
        const data = await this.encryptedPost("/garden/sorghum/harvest", this.landPayload(land));
        $.log(`账号[${this.index}] 收获成功: 地块${landNo(land)} ${shortJson(data || "ok")}`);
        acted = true;
      } catch (e) {
        $.log(`账号[${this.index}] 收获失败[${landNo(land)}]: ${e.message || e}`);
      }
      await $.wait(500, 1200);
    }
    return acted;
  }

  async seedFarm(lands) {
    const seedCount = Number(this.member.sorghum || 0);
    if (seedCount <= 0) {
      $.log(`账号[${this.index}] 无可用种子，跳过种植`);
      return false;
    }
    const candidates = lands.filter(isPlantable);
    if (!candidates.length) {
      $.log(`账号[${this.index}] 未识别到可种植地块`);
      return false;
    }
    let acted = false;
    const limit = Math.min(seedCount, candidates.length);
    for (let i = 0; i < limit; i++) {
      const land = candidates[i];
      try {
        const data = await this.encryptedPost("/garden/sorghum/seed", this.landPayload(land));
        $.log(`账号[${this.index}] 种植成功: 地块${landNo(land)} ${shortJson(data || "ok")}`);
        acted = true;
      } catch (e) {
        $.log(`账号[${this.index}] 种植失败[${landNo(land)}]: ${e.message || e}`);
      }
      await $.wait(500, 1200);
    }
    return acted;
  }

  async waterFarm(lands) {
    const waterCount = Number(this.member.water || 0);
    if (waterCount <= 0) {
      $.log(`账号[${this.index}] 无可用水滴，跳过浇水`);
      return false;
    }
    const candidates = lands.filter(isGrowing);
    if (!candidates.length) {
      $.log(`账号[${this.index}] 未识别到可浇水地块`);
      return false;
    }
    let acted = false;
    const limit = Math.min(waterCount, candidates.length);
    for (let i = 0; i < limit; i++) {
      const land = candidates[i];
      try {
        const data = await this.encryptedPost("/garden/sorghum/watering", this.landPayload(land));
        $.log(`账号[${this.index}] 浇水成功: 地块${landNo(land)} ${shortJson(data || "ok")}`);
        acted = true;
      } catch (e) {
        $.log(`账号[${this.index}] 浇水失败[${landNo(land)}]: ${e.message || e}`);
      }
      await $.wait(500, 1200);
    }
    return acted;
  }

  async manureFarm(lands) {
    const manureCount = Number(this.member.manure || 0);
    if (manureCount <= 0) {
      $.log(`账号[${this.index}] 无可用有机肥，跳过施肥/养护`);
      return false;
    }
    const candidates = lands.filter(isGrowing);
    if (!candidates.length) {
      $.log(`账号[${this.index}] 未识别到可施肥/养护地块`);
      return false;
    }
    let acted = false;
    const limit = Math.min(manureCount, candidates.length);
    for (let i = 0; i < limit; i++) {
      const land = candidates[i];
      try {
        const data = await this.encryptedPost("/garden/sorghum/manuring", this.landPayload(land));
        $.log(`账号[${this.index}] 施肥/养护成功: 地块${landNo(land)} ${shortJson(data || "ok")}`);
        acted = true;
      } catch (e) {
        $.log(`账号[${this.index}] 施肥/养护失败[${landNo(land)}]: ${e.message || e}`);
      }
      await $.wait(500, 1200);
    }
    return acted;
  }

  async runFarmAutomation() {
    const maxRounds = Number(process.env.junpinhui_farm_rounds || 5);
    let anyAction = false;
    for (let round = 1; round <= maxRounds; round++) {
      $.log(`账号[${this.index}] 农场自动化第${round}轮`);
      await this.queryMember();
      let lands = await this.queryFarm();

      const harvested = await this.harvestFarm(lands);
      if (harvested) {
        anyAction = true;
        await this.queryMember();
        lands = await this.queryFarm();
      }

      const seeded = await this.seedFarm(lands);
      if (seeded) {
        anyAction = true;
        await this.queryMember();
        lands = await this.queryFarm();
      }

      const watered = await this.waterFarm(lands);
      if (watered) {
        anyAction = true;
        await this.queryMember();
        lands = await this.queryFarm();
      }

      const manured = await this.manureFarm(lands);
      if (manured) {
        anyAction = true;
        await this.queryMember();
        await this.queryFarm();
      }

      if (!harvested && !seeded && !watered && !manured) break;
      await $.wait(800, 1600);
    }
    if (!anyAction) $.log(`账号[${this.index}] 农场暂无可执行动作`);
    return anyAction;
  }

  async queryTasks() {
    const data = await this.gardenGet("/garden/tasks/index");
    const tasks = listify(data);
    if (!tasks.length) {
      $.log(`账号[${this.index}] 未查询到任务列表`);
      return [];
    }
    $.log(
      `账号[${this.index}] 任务: ${tasks
        .map((t) => `${t.name || t.code || t.id}:${isCompleted(t) ? "已完成" : "未完成"}`)
        .join("，")}`
    );
    return tasks;
  }

  async doShareTask() {
    try {
      const data = await this.encryptedPost("/garden/gardenmemberinfo/dailyShare");
      $.log(`账号[${this.index}] 分享任务完成: ${shortJson(data || "ok")}`);
    } catch (e) {
      $.log(`账号[${this.index}] 分享任务失败: ${e.message || e}`);
    }
  }

  async doQuestionTask() {
    try {
      const questions = listify(await this.gardenGet("/garden/Gardenquestiontask/index"));
      if (!questions.length) {
        $.log(`账号[${this.index}] 每日一答无题目`);
        return;
      }
      for (const q of questions) {
        const id = q.id;
        const answer = q.answer;
        if (!id || !answer) continue;
        const data = await this.encryptedGet("/garden/Gardenquestiontask/answerResultsJph", {
          question_id: id,
          answer,
        });
        $.log(`账号[${this.index}] 每日一答完成: ${q.title ? shortJson(q.title, 45) : id} => ${shortJson(data || "ok")}`);
        await $.wait(500, 1200);
      }
    } catch (e) {
      $.log(`账号[${this.index}] 每日一答失败: ${e.message || e}`);
    }
  }

  async doRealityTask() {
    try {
      const data = await this.gardenGet("/garden/realscene/reward");
      $.log(`账号[${this.index}] 实景相册任务: ${shortJson(data || "ok")}`);
    } catch (e) {
      $.log(`账号[${this.index}] 实景相册任务失败: ${e.message || e}`);
    }
  }

  async doCompleteInfoTask() {
    try {
      const data = await this.gardenGet("/garden/tasks/checkCompleteMemberInfo");
      $.log(`账号[${this.index}] 完善信息任务: ${shortJson(data || "ok")}`);
    } catch (e) {
      $.log(`账号[${this.index}] 完善信息任务失败: ${e.message || e}`);
    }
  }

  async doSubscribePrize() {
    try {
      const data = await this.gardenGet("/garden/tasks/getSubscribePrize");
      $.log(`账号[${this.index}] 订阅奖励: ${shortJson(data || "ok")}`);
    } catch (e) {
      $.log(`账号[${this.index}] 订阅奖励失败: ${e.message || e}`);
    }
  }

  async doTasks(tasks) {
    const pending = tasks.filter((task) => !isCompleted(task));
    if (!pending.length) {
      $.log(`账号[${this.index}] 暂无未完成任务`);
      return;
    }
    for (const task of pending) {
      const code = task.code || "";
      if (code === "answer_survey") await this.doQuestionTask();
      else if (code === "garden_share") await this.doShareTask();
      else if (code === "view_organic_sorghum") await this.doRealityTask();
      else if (code === "complete_member_info") await this.doCompleteInfoTask();
      else if (/subscribe/i.test(code)) await this.doSubscribePrize();
      else $.log(`账号[${this.index}] 未适配任务: ${task.name || code || task.id}`);
      await $.wait(500, 1200);
    }
  }

  async run() {
    $.log(`\n账号[${this.index}] ${mask(this.openid || this.cacheKey)}`);
    await this.ensureLogin();
    await this.queryMember();
    await this.dailySign();

    const tasks = await this.queryTasks();
    await this.doTasks(tasks);

    await this.runFarmAutomation();

    await this.queryMember();
    await this.queryFarm();
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
