/*
爱玛会员俱乐部 - 自动签到脚本（2026年2月修复版）
✅ 修复点：使用域名替代失效IP，更新活动ID为100001180
✅ 支持环境：Node.js 
✅ 变量名：aima
✅ 变量值：access-token（支持多账号，用 & 或换行分隔）
*/
const { Env } = require("../tools/env")
const $ = new Env("爱玛会员俱乐部");
const axios = require('axios')

// ================== 配置区 ==================
const ACTIVITY_ID = "100001180"; // 2026年2月活动ID
const BASE_URL = "https://scrm.aimatech.com"; // 使用官方域名，不再硬编码IP
const APP_ID = "scrm";
const USER_AGENT = "Mozilla/5.0 (Linux; Android 15; 23013RK75C Build/AQ3A.250226.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/142.0.7444.173 Mobile Safari/537.36 XWEB/1420229 MMWEBSDK/20251101 MMWEBID/6369 MicroMessenger/8.0.67.3000(0x28004333) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android";

// ================== 工具函数 ==================
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function md5(str) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(str).digest('hex');
}

// ================== 核心逻辑 ==================
async function signIn(token, index) {
  try {
    const timestamp = Date.now();
    const traceLogId = generateUUID();

    // 构造通用请求头
    const headers = {
      "App-Id": APP_ID,
      "Time-Stamp": timestamp.toString(),
      "TraceLog-Id": traceLogId,
      "Access-Token": token.trim(),
      "content-type": "application/json",
      "User-Agent": USER_AGENT,
      "charset": "utf-8",
      "Referer": "https://servicewechat.com/wx2dcfb409fd5ddfb4/215/page-frame.html"
    };

    // 生成签名（按规则拼接）
    const signStr = `${APP_ID}${timestamp}${traceLogId}${token.trim()}AimaScrm321_^`;
    headers["Sign"] = md5(signStr).toLowerCase();

    // 1. 查询签到状态
    $.log(`🚀 账号【${index}】查询签到状态...`);
    const searchRes = await axios.post(
      `${BASE_URL}/aima/wxclient/mkt/activities/sign:search`,
      { activityId: ACTIVITY_ID },
      { headers, timeout: 10000 }
    );

    const data = searchRes.data;
    if (data.content && data.content.signed === 1) {
      $.log(`✅ 账号【${index}】今日已签到！`);
      return;
    }

    // 2. 执行签到
    $.log(`⏳ 账号【${index}】正在签到...`);
    const joinRes = await axios.post(
      `${BASE_URL}/aima/wxclient/mkt/activities/sign:join`,
      { activityId: ACTIVITY_ID, activitySceneId: null },
      { headers, timeout: 10000 }
    );

    if (joinRes.data.code === 200 || joinRes.data.code === 0) {
      const point = joinRes.data.content?.point || 10;
      $.log(`🎉 账号【${index}】签到成功！获得 ${point} 积分`);
    } else {
      throw new Error(`签到失败: ${JSON.stringify(joinRes.data)}`);
    }

  } catch (e) {
    throw new Error(e.message || e);
  }
}

// ================== 主函数 ==================
!(async () => {
  console.log(`\n🔔 爱玛会员俱乐部, 开始!`);

  // 获取 access-token（支持多账号）
  let tokens = [];
  if ($.isNode()) {
    const env = process.env.aima;
    if (env) {
      tokens = env.split(/&|\n/).filter(t => t.trim());
    }
  }

  if (tokens.length === 0) {
    $.msg("❌ 未找到 access-token，请配置变量 'aima'");
    return;
  }

  console.log(`共找到${tokens.length}个账号`);

  for (let i = 0; i < tokens.length; i++) {
    try {
      console.log(`\n🚀 user:【${i + 1}】 start work`);
      await signIn(tokens[i], i + 1);
    } catch (e) {
      console.log(`❌ 账号【${i + 1}】执行失败: ${e.message}`);
    }
  }

  // 发送通知
  await $.sendMsg($.logs.join("\n"));
})()
  .catch((e) => console.log(e))
  .finally(() => $.done());

