/*
君品荟 - 登录、签到、查询、酒谷之旅农场
cron: 45 8 * * *

变量名：junpinhui
变量值：wx_server 中保存的 openid/账号标识，多账号用 & 或换行分隔
      也支持 openid#token 或仅 token
依赖变量：wx_server_url、wx_auth

------------------------------------------
关键点：酒谷之旅(garden) 这套后端注册在【习酒】小程序 wx489f950decfeb93e 名下，
不是君品荟自己。2026-08-18 实测定性，三件事都必须换成习酒的身份，缺一个就 5001：

  ① 登录（两段，各耗一个 code，都用习酒 appid 取码）
       GET  xcx.exijiu.com/anti-channeling/public/index.php/api/v2/auth/session?code=
            -> data.login_code          （之后当请求头 login_code 带上）
       GET  apimallwm.exijiu.com/garden/wechat/login?code=
            -> data.authorized_token    （之后当请求头 Authorization 带上）
     authorized_token 是个 JWT，解出来 memberInfo.id 和君品荟侧的 member_id 一致，
     所以是同一个会员，换 appid 不换账号。
  ② 请求头：AppID / Referer 都用习酒 appid，Authorization 放 authorized_token。
     服务端是按 AppID 头去找"该 appid 的用户密钥"来解 encryptData 的。
  ③ encryptData 的密钥：smallcat /wx/encryptkey 要用【习酒】appid 取，
     encrypt_key(24 字符) 和 iv(16 字符) 都按 utf-8 字节直接用 -> AES-192-CBC/PKCS7，
     输出 hex；version 用该次返回的值。明文是 {…业务参数, ts}。

对照实验：
  君品荟 appid 的 encryptkey + 君品荟的头 -> 5001「用户信息异常」（这是修之前的行为）
  习酒   appid 的 encryptkey + 君品荟的头 -> 5001（头也得换）
  习酒   appid 的 encryptkey + 习酒的头   -> err=0，签到成功
                                             {isTodayFirstSign:true, water:"1", tips:"系统赠送您：浇水*1次"}

另外：/garden/wechat/auth（拿站点自己签发的 key）在 smallcat 体系下走不通 ——
它要用服务端自己 code2Session 得到的 session_key 去解 encryptedData，
而 smallcat 每次调用都会另换一把 session_key，两边永远对不上；上面这条
/wx/encryptkey 的路子是同一份第三方实现里的另一条分支，实测可用。
滑块验证(5008) 按规则不绕。
------------------------------------------
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
// 酒谷之旅(garden) 这套后端注册在【习酒】小程序名下，不是君品荟自己。
// 所以 garden 的登录、请求头、以及 encryptData 用的加密密钥都必须用这个 appid，
// 用君品荟的 appid 去取密钥服务端一律回 5001「用户信息异常」。会员是同一个
// （garden 登录返回的 authorized_token 里 memberInfo.id 和君品荟侧一致）。
const GARDEN_APP_ID = "wx489f950decfeb93e";
const APP_VERSION = "1.0.12";
const FM_BASE = "https://fm.exijiu.com";
const GARDEN_BASE = "https://apimallwm.exijiu.com";
const MAIN_BASE = "https://xcx.exijiu.com/anti-channeling/public/index.php/api/v2";
const TOKEN_CACHE_FILE = path.join(__dirname, "junpinhui_token_cache.json");

const wechat = new WeChatServer({
  url: process.env.wx_server_url || "http://192.168.31.196:8787",
  appid: MINI_APP_ID,
  auth: process.env.wx_auth || "your-api-key",
});
// garden 侧要用习酒 appid 取 code / 取加密密钥
const gardenWechat = new WeChatServer({
  url: process.env.wx_server_url || "http://192.168.31.196:8787",
  appid: GARDEN_APP_ID,
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

/**
 * garden 侧的请求头 —— 必须整套换成【习酒】的身份，服务端是按 AppID 头 +
 * Authorization 里的 authorized_token 来决定用哪个 appid 的密钥解 encryptData 的。
 * 混用（君品荟的头 + 习酒的密钥，或反之）一律 5001。
 */
function gardenHeaders(session = {}) {
  return {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 MicroMessenger MiniProgramEnv/Windows",
    Referer: `https://servicewechat.com/${GARDEN_APP_ID}/215/page-frame.html`,
    AppID: GARDEN_APP_ID,
    "App-Version": APP_VERSION,
    ...(session.authorizedToken ? { Authorization: session.authorizedToken } : {}),
    ...(session.loginCode ? { login_code: session.loginCode } : {}),
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

async function request(method, base, urlPath, { token = "", data = null, params = null, hdrs = null } = {}) {
  const res = await axios({
    method,
    url: `${base}${urlPath}`,
    data,
    params,
    timeout: 20000,
    validateStatus: () => true,
    headers: hdrs || headers(token),
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
    let res = await fn();
    const msg = `${res?.message || ""}${res?.msg || ""}`;
    // 5001 既可能是会话过期也可能是加密不对，两种都靠重登 garden 会话解决
    if (!okCode(res) && this.openid && /登录|授权|token|Token|未认证|失效|重新进入|用户信息异常/.test(msg)) {
      $.log(`账号[${this.index}] garden 会话疑似失效，重新登录`);
      this.garden = null;
      await this.gardenLogin();
      res = await fn();
    }
    return res;
  }

  /**
   * garden 会话：走【习酒】appid 的两段式登录（每次跑消耗 2 个 code）。
   *   ① code -> GET {MAIN_BASE}/auth/session?code=  -> data.login_code   （请求头 login_code）
   *   ② code -> GET {GARDEN_BASE}/garden/wechat/login?code=  -> data.authorized_token（请求头 Authorization）
   * 会员和君品荟侧是同一个（authorized_token 的 JWT 里 memberInfo.id 一致）。
   */
  async gardenLogin() {
    if (!this.openid) throw new Error("缺少 openid，无法登录 garden");
    const pick = (d) => d?.data?.code || d?.code;

    const r1 = await gardenWechat.getCode(this.openid);
    if (!r1?.data?.status) throw new Error(`取 garden code 失败: ${r1?.data?.message || "未知"}`);
    const sess = await request("get", MAIN_BASE, "/auth/session", {
      params: { code: pick(r1.data) },
      hdrs: gardenHeaders(),
    });
    const loginCode = (sess?.data || {}).login_code || "";

    const r2 = await gardenWechat.getCode(this.openid);
    if (!r2?.data?.status) throw new Error(`取 garden code 失败: ${r2?.data?.message || "未知"}`);
    const auth = await request("get", GARDEN_BASE, "/garden/wechat/login", {
      params: { code: pick(r2.data) },
      hdrs: gardenHeaders({ loginCode }),
    });
    const authorizedToken = assertOk(auth, "garden 登录")?.authorized_token;
    if (!authorizedToken) throw new Error(`garden 登录未返回 authorized_token: ${shortJson(auth)}`);

    this.garden = { loginCode, authorizedToken };
    $.log(`账号[${this.index}] garden 登录成功`);
  }

  async ensureGarden() {
    if (!this.garden?.authorizedToken) await this.gardenLogin();
    return this.garden;
  }

  async gardenGet(urlPath, params = {}) {
    const res = await this.withRelogin(async () =>
      request("get", GARDEN_BASE, urlPath, { hdrs: gardenHeaders(await this.ensureGarden()), params })
    );
    return assertOk(res, urlPath);
  }

  async gardenPost(urlPath, data = {}) {
    const res = await this.withRelogin(async () =>
      request("post", GARDEN_BASE, urlPath, { hdrs: gardenHeaders(await this.ensureGarden()), data })
    );
    return assertOk(res, urlPath);
  }

  /**
   * encryptData 用的密钥必须取【习酒】appid 的（GARDEN_APP_ID）。
   * 用君品荟自己的 appid 取，服务端一律回 5001「用户信息异常」——
   * 因为它是按请求头里的 AppID 去找对应 appid 的用户密钥来解密的。
   */
  async getEncryptKey() {
    if (!this.openid) throw new Error("缺少 openid，无法生成 encryptData");
    const { data } = await axios.post(
      `${gardenWechat.serverUrl}/wx/encryptkey`,
      { appid: GARDEN_APP_ID, openid: this.openid },
      {
        headers: { auth: gardenWechat.auth },
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
    return this.withEncryptHint(urlPath, async () => this.gardenPost(urlPath, await this.encryptData(data)));
  }

  async encryptedGet(urlPath, data = {}) {
    return this.withEncryptHint(urlPath, async () => this.gardenGet(urlPath, await this.encryptData(data)));
  }

  /**
   * 加密写接口被拒时补一句根因指向。5001 现在只剩两种可能：
   * garden 会话过期（withRelogin 已经自动重登重放过一次），或者密钥拿错了 appid。
   */
  async withEncryptHint(urlPath, fn) {
    try {
      return await fn();
    } catch (e) {
      const msg = String(e.message || e);
      if (/用户信息异常|请从小程序重新进入|请删除小程序/.test(msg)) {
        throw new Error(`${msg} ← encryptData 校验失败：密钥必须取 ${GARDEN_APP_ID}(习酒) 的，见文件头说明`);
      }
      if (/滑块|5008/.test(msg)) {
        throw new Error(`${msg} ← 触发滑块验证，按规则不绕，请在小程序里手动过一次`);
      }
      throw e;
    }
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
    // 所有业务都在 garden 上，直接用 garden 会话；原来的 fm 静默登录只是拿一个
    // 对 garden 无效的 X-Access-Token，白耗一个 code，已不再调用。
    await this.ensureGarden();
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
