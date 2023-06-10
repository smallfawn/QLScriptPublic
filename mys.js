/**
 * mys 米游社 原神签到
 * cron 12 5 * * *  mys.js
 * 23-06-10
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export mys_data='token @ token'
 *
 * 多账号用  @ 分割
 * 抓包 任意链接中 , 找到 Cookie中stoken得值 即可
 * ====================================
 *https://passport-api.mihoyo.com/account/ma-cn-passport/app/loginByPassword
 *账号密码登录后抓这个链接响应体data中token得值V2_XXXXXXXXXX
  亦或者直接搜关键词stoken找到后取其值 填入变量中
 
 */

const $ = new Env("米游社 原神签到");
const ckName = "mys_data";
//-------------------- 一般不动变量区域 -------------------------------------
const { log } = require("console");
const Notify = 1; //0为关闭通知,1为打开通知,默认为1
const notify = $.isNode() ? require("./sendNotify") : "";
let envSplitor = ["@"]; //多账号分隔符
let msg = "";
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || "";
let userList = [];
let userIdx = 0;
let userCount = 0;
let scriptVersionLatest; //最新版本
let scriptVersionNow = "0.0.1"; //现在版本
//---------------------- 自定义变量区域 -----------------------------------
const app_version = "2.41.2";
const user_agent = `Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36 miHoYoBBS/${app_version}`;
const salt = "TsmyHpZg8gFAVKTtlPaL6YwMldzxZJxQ";
const act_id = "e202009291139501";
const host = "api-takumi.mihoyo.com";
const referer = `https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=${act_id}&utm_source=bbs&utm_medium=mys&utm_campaign=icon`;
const sys_version = `10`;
const client_type = 5; //4pc WEB  //5mobile WEB
const device_model = `MI 8 Lite`;
const platform = `android`;
const device_name = `Xiaomi MI 8 Lite`;
const channel = `xiaomi`;
const device_fp = `38d7eec0271ce`;
const device_id = `1ece0c2f-67ba-39fb-b1d1-8aa66def95d7`;
//---------------------------------------------------------

async function start() {
  await getVersion("smallfawn/QLScriptPublic/main/mys.js");
  log(
    `\n============ 当前版本：${scriptVersionNow} 📌 最新版本：${scriptVersionLatest} ============`
  );
  await getNotice();
  let taskall;
  log("\n================== CK Check ==================\n");
  taskall = [];
  for (let user of userList) {
    if (user.ckStatus) {
      taskall.push(await user.get_cookie_token());
      await $.wait(1000);
    }
  }
  await Promise.all(taskall);
  log("\n================== 原神信息 ==================\n");
  taskall = [];
  for (let user of userList) {
    if (user.ckStatus) {
      taskall.push(await user.get_info_ys());
      await $.wait(1000);
    }
  }
  await Promise.all(taskall);

  log("\n================== 原神签到 ==================\n");
  taskall = [];
  for (let user of userList) {
    if (user.ckStatus) {
      taskall.push(await user.get_sign_home());
      taskall.push(await user.get_sign_info());
      await $.wait(1000);
    }
  }
  await Promise.all(taskall);
}

class UserInfo {
  constructor(str) {
    this.index = ++userIdx;
    this.ck = str.split("&")[0];
    this.ckStatus = true;
    this.uid = ""; //uid
    this.cookie_token = "";
    this.stoken = this.ck;
    this.mid = "";
    this.region = "";
    this.uid_ys = "";
    this.jiangliArr = [];
  }
  getDS() {
    const s = salt;
    const t = Math.floor(Date.now() / 1e3);
    const r = Math.random().toString(36).slice(-6);
    const c = `salt=${s}&t=${t}&r=${r}`;
    return `${t},${r},${MD5_Encrypt(c)}`;
  }

  async get_cookie_token() {
    try {
      let options = {
          url: `https://passport-api.mihoyo.com/account/auth/api/getCookieAccountInfoBySToken`,
          headers: {
            Host: "passport-api.mihoyo.com",
            Connection: "keep-alive",
            "x-rpc-app_id": "bll8iq97cem8",
            "x-rpc-client_type": 2,
            "x-rpc-device_id": device_id,
            "x-rpc-device_fp": device_fp,
            "x-rpc-device_name": device_name,
            "x-rpc-device_model": device_model,
            "x-rpc-sys_version": 10,
            "x-rpc-game_biz": "bbs_cn",
            "x-rpc-app_version": "2.49.1",
            "x-rpc-sdk_version": "1.6.1.1",
            "User-Agent": "okhttp/4.9.3",
            "Content-Type": "application/json;",
            Accept: "applation/json",
            "Accept-Encoding": "gzip",
            Cookie: `stoken=${this.stoken}; mid=0pubv2njml_mhy;`,
          },
        },
        result = await httpRequest(options);
      //log(options);
      //log(result);
      if (result.retcode == 0) {
        let uid = result.data.uid;
        let cookie_token = result.data.cookie_token;
        this.uid = uid;
        this.cookie_token = cookie_token;
        DoubleLog(
          `账号[${this.index}]  Cookie中Stoken有效哦！老铁！牛逼666,一下子就能抓对包`
        );
        this.ckStatus = true
      } else {
        DoubleLog(
          `账号[${this.index}]  吊毛,cookie中stoken貌似过期或者不正确,请你再抓一次吧`
        );
        this.ckStatus = false
      }
    } catch (e) {
      console.log(e);
    }
  }

  async get_info_ys() {
    try {
      let options = {
          url: `https://api-takumi.miyoushe.com/binding/api/getUserGameRolesByStoken`,
          headers: {
            DS: this.getDS(),
            cookie: `stuid=${this.uid};stoken=${this.stoken};mid=0pubv2njml_mhy;`,
            "x-rpc-client_type": "2",
            "x-rpc-app_version": app_version,
            "x-rpc-sys_version": sys_version,
            "x-rpc-channel": channel,
            "x-rpc-device_id": device_id,
            "x-rpc-device_fp": device_fp,
            "x-rpc-device_name": device_name,
            "x-rpc-device_model": device_model,
            Referer: "https://app.mihoyo.com",
            Host: "api-takumi.miyoushe.com",
            Connection: "Keep-Alive",
            "Accept-Encoding": "gzip",
            "User-Agent": "okhttp/4.9.3",
          },
        },
        result = await httpRequest(options);
      //console.log(options);
      //console.log(result);
      if (result.retcode == 0) {
        log(`账号[${this.index}]  获取原神信息成功`);
        let game_biz = result.data.list[0].game_biz;
        let region = result.data.list[0].region;
        let game_uid = result.data.list[0].game_uid;
        let nickname = result.data.list[0].nickname;
        let region_name = result.data.list[0].region_name;
        this.region = region;
        this.uid_ys = game_uid;
        //log(game_biz, region, game_uid, nickname, region_name);
        DoubleLog(`游戏昵称${nickname},${region_name}`)
      } else {
        DoubleLog(`账号[${this.index}]  获取原神信息:失败 ❌ ,原因未知！`);
        log(result);
      }
    } catch (e) {
      console.log(e);
    }
  }
  /*async get_cookie() {
      try {
        return new Promise((resolve) => {
          let options = {
            url: `https://passport-api-v4.mihoyo.com/account/ma-cn-session/web/verifyLtoken`,
            headers: {
              Host: "passport-api-v4.mihoyo.com",
              Connection: "keep-alive",
              "x-rpc-device_id": device_id,
              "x-rpc-mi_referrer":
                "https://bbs.mihoyo.com/ys/strategy/?bbs_presentation_style=no_header&visit_device=mobile&mihoyo_app=true&top_distance=true",
              "x-rpc-device_fp": device_fp,
              "User-Agent": user_agent,
              "Content-Type": "application/json;",
              Accept: "",
              Origin: "https://bbs.mihoyo.com",
              "X-Requested-With": "com.mihoyo.hyperion",
              "Sec-Fetch-Site": "same-site",
              "Sec-Fetch-Mode": "cors",
              "Sec-Fetch-Dest": "empty",
              Referer:
                "https://bbs.mihoyo.com/ys/strategy/?bbs_presentation_style=no_header&visit_device=mobile&mihoyo_app=true&top_distance=true",
              "Accept-Encoding": "gzip, deflate",
              "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
              Cookie: `account_id=${this.uid}; cookie_token=${this.cookie_token};`,
            },
            body: $.toStr({ t: Date.now() }),
          };
          $.post(options, async (err, resp, data) => {
            try {
              if (data.retcode == 0) {
                log(resp);
                const setCookie = resp.headers["Set-Cookie"];
                const regex = /(ltuid|ltoken)=([^;]+)/g;
                const cookieString = setCookie.join("; ");
                const matches = cookieString.matchAll(regex);
                for (const match of matches) {
                  const key = match[1];
                  const value = match[2];
                  console.log(`${key}: ${value}`);
                }
                this.mid = data.data.mid;
              }
            } catch (e) {
              $.logErr(e, resp);
            } finally {
              resolve();
            }
          });
        });
      } catch (e) {
        console.log(e);
      }
    }*/
  /**
   * 签到信息
   */
  async get_sign_info() {
    try {
      let options = {
          url: `https://api-takumi.mihoyo.com/event/bbs_sign_reward/info?act_id=${act_id}&region=${this.region}&uid=${this.uid_ys}`,
          headers: {
            Host: "api-takumi.mihoyo.com",
            Connection: "keep-alive",
            "x-rpc-device_id": device_id,
            "User-Agent": user_agent,
            "Content-Type": "application/json;",
            Accept: "application/json, text/plain, */*",
            Origin: "https://webstatic.mihoyo.com",
            "X-Requested-With": "com.mihoyo.hyperion",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            Referer: `https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=${act_id}&utm_source=bbs&utm_medium=mys&utm_campaign=icon`,
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            Cookie: `account_id=${this.uid}; cookie_token=${this.cookie_token};`,
          },
        },
        result = await httpRequest(options);
      //console.log(options);
      //console.log(result);
      if (result.retcode == 0) {
        DoubleLog(`账号[${this.index}]  获取签到信息成功`);
        DoubleLog(
          `账号[${this.index}]  签到天数${result.data.total_sign_day},今天${result.data.today},是否签到${result.data.is_sign}`
        );
        if (result.data.is_sign == false) {
          DoubleLog(`账号[${this.index}]  执行签到`);
          await this.task_sign();
        }
      } else {
        DoubleLog(`账号[${this.index}]  获取签到信息:失败 ❌ ,原因未知！`);
        log(result);
      }
    } catch (e) {
      console.log(e);
    }
  }
  /**
   * 获取签到奖励
   */
  async get_sign_home() {
    try {
      let options = {
          url: `https://api-takumi.mihoyo.com/event/bbs_sign_reward/home?act_id=${act_id}&region=${this.region}&uid=${this.uid_ys}`,
          headers: {
            Host: "api-takumi.mihoyo.com",
            Connection: "keep-alive",
            "x-rpc-device_id": device_id,
            "User-Agent": user_agent,
            "Content-Type": "application/json;",
            Accept: "application/json, text/plain, */*",
            Origin: "https://webstatic.mihoyo.com",
            "X-Requested-With": "com.mihoyo.hyperion",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            Referer: `https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=${act_id}&utm_source=bbs&utm_medium=mys&utm_campaign=icon`,
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            Cookie: `account_id=${this.uid}; cookie_token=${this.cookie_token};`,
          },
        },
        result = await httpRequest(options);
      //console.log(options);
      //console.log(result);
      if (result.retcode == 0) {
        DoubleLog(`账号[${this.index}]  获取签到奖励成功`);
        DoubleLog(`当前月份${result.data.month}`);
        for (let i in result.data.awards) {
          this.jiangliArr.push(
            `${result.data.awards[i].name} * ${result.data.awards[i].cnt}`
          );
        }
        DoubleLog(this.jiangliArr);
      } else {
        DoubleLog(`账号[${this.index}]  获取签到奖励:失败 ❌ ,原因未知！`);
        log(result);
      }
    } catch (e) {
      console.log(e);
    }
  }
  async task_sign() {
    try {
      let options = {
          url: `https://${host}/event/bbs_sign_reward/sign`,
          headers: {
            Host: "api-takumi.mihoyo.com",
            Connection: "keep-alive",
            "x-rpc-platform": platform,
            "x-rpc-device_model": device_model,
            "x-rpc-app_version": app_version,
            "User-Agent": user_agent,
            DS: this.getDS(),
            "x-rpc-device_id": device_id,
            Accept: "application/json, text/plain, */*",
            "x-rpc-device_name": device_name,
            "x-rpc-device_fp": device_fp,
            "x-rpc-channel": channel,
            "Content-Type": "application/json;charset=UTF-8",
            "x-rpc-sys_version": sys_version,
            "x-rpc-client_type": client_type,
            Origin: "https://webstatic.mihoyo.com",
            "X-Requested-With": "com.mihoyo.hyperion",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            Referer: referer,
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            Cookie: `account_id=${this.uid}; cookie_token=${this.cookie_token};`,
          },
          body: $.toStr({
            act_id: act_id,
            region: this.region,
            uid: this.uid_ys,
          }),
        },
        result = await httpRequest(options);
      //console.log(options);
      //console.log(result);
      if (result.retcode == 0) {
        DoubleLog(`账号[${this.index}]  签到:${result.message}🎉`);
      } else {
        DoubleLog(`账号[${this.index}]  签到:失败 ❌ 了呢,原因未知！`);
        console.log(result);
      }
    } catch (e) {
      console.log(e);
    }
  }
  /*async user_info() {
      try {
        let options = {
            url: `https://${host}/event/bbs_sign_reward/home?act_id=${act_id}`,
            headers: {
              DS: this.getDS(),
              cookie: `stuid=${this.uid};stoken=${this.stoken};mid=0pubv2njml_mhy;`,
              "x-rpc-client_type": 2,
              "x-rpc-app_version": app_version,
              "x-rpc-sys_version": sys_version,
              "x-rpc-channel": channel,
              "x-rpc-device_id": device_id,
              "x-rpc-device_fp": device_fp,
              "x-rpc-device_name": device_name,
              "x-rpc-device_model": device_model,
              Referer: "https://app.mihoyo.com",
              "x-rpc-verify_key": "bll8iq97cem8",
              Host: "api-takumi.miyoushe.com",
              Connection: "Keep-Alive",
              "Accept-Encoding": "gzip",
              "User-Agent": "okhttp/4.9.3",
            },
          },
          result = await httpRequest(options);
        //console.log(options);
        //console.log(result);
        if (result.retcode == 0) {
          DoubleLog(`账号[${this.index}]  签到:${result.message}🎉`);
          this.ckStatus = true;
        } else {
          DoubleLog(`账号[${this.index}]  签到:失败 ❌ 了呢,原因未知！`);
          this.ckStatus = false;
          console.log(result);
        }
      } catch (e) {
        console.log(e);
      }
    }*/
}

!(async () => {
  if (!(await checkEnv())) return;
  if (userList.length > 0) {
    await start();
  }
  await SendMsg(msg);
})()
  .catch((e) => console.log(e))
  .finally(() => $.done());

//********************************************************
// 变量检查与处理
async function checkEnv() {
  if (userCookie) {
    // console.log(userCookie);
    let e = envSplitor[0];
    for (let o of envSplitor)
      if (userCookie.indexOf(o) > -1) {
        e = o;
        break;
      }
    for (let n of userCookie.split(e)) n && userList.push(new UserInfo(n));
    userCount = userList.length;
  } else {
    console.log("未找到CK");
    return;
  }
  return console.log(`共找到${userCount}个账号`), true; //true == !0
}
/////////////////////////////////////////////////////////////////////////////////////
function httpRequest(options, method) {
  method = options.method
    ? options.method.toLowerCase()
    : options.body
    ? "post"
    : "get";
  return new Promise((resolve) => {
    $[method](options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${method}请求失败`);
          $.logErr(err);
        } else {
          if (data) {
            typeof JSON.parse(data) == "object"
              ? (data = JSON.parse(data))
              : (data = data);
            resolve(data);
          } else {
            console.log(`请求api返回数据为空，请检查自身原因`);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}
/**
 * 获取远程版本
 */
function getVersion(scriptUrl, timeout = 3 * 1000) {
  return new Promise((resolve) => {
    let options = {
      url: `https://ghproxy.com/https://raw.githubusercontent.com/${scriptUrl}`,
    };
    $.get(
      options,
      async (err, resp, data) => {
        try {
          let regex = /scriptVersionNow\s*=\s*(["'`])([\d.]+)\1/;
          let match = data.match(regex);
          scriptVersionLatest = match ? match[2] : "";
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      },
      timeout
    );
  });
}

async function getNotice() {
  try {
    let options = {
        url: `https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/Note/main/Notice.json`,
        headers: { "User-Agent": "" },
      },
      result = await httpRequest(options);
    if (!result || !("notice" in result)) {
      options.url = `https://gitee.com/smallfawn/Note/raw/master/Notice.json`;
      result = await httpRequest(options);
    }
    if (result && "notice" in result) {
      DoubleLog(`${result.notice}`);
    }
  } catch (e) {
    console.log(e);
  }
}
async function hitokoto(timeout = 3 * 1000) {
  // 随机一言
  return new Promise((resolve) => {
    try {
      let options = {
        url: "https://v1.hitokoto.cn/",
        headers: {},
      }; //, //result = await httpRequest(options);
      $.get(
        options,
        async (err, resp, data) => {
          try {
            data = JSON.parse(data);
            resolve(data.hitokoto);
          } catch (e) {
            $.logErr(e, resp);
          } finally {
            resolve();
          }
        },
        timeout
      );
      //return result.hitokoto
    } catch (error) {
      console.log(error);
    }
  });
}
// 双平台log输出
function DoubleLog(data) {
  if ($.isNode()) {
    if (data) {
      console.log(`${data}`);
      msg += `\n${data}`;
    }
  } else {
    console.log(`${data}`);
    msg += `\n${data}`;
  }
}
// 发送消息
async function SendMsg(message) {
  if (!message) return;
  if (Notify > 0) {
    if ($.isNode()) {
      await notify.sendNotify($.name, message);
    } else {
      $.msg($.name, "", message);
    }
  } else {
    console.log(message);
  }
}


  // 完整 Env
  function MD5_Encrypt(a) { function b(a, b) { return (a << b) | (a >>> (32 - b)); } function c(a, b) { var c, d, e, f, g; return ((e = 2147483648 & a), (f = 2147483648 & b), (c = 1073741824 & a), (d = 1073741824 & b), (g = (1073741823 & a) + (1073741823 & b)), c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f : g ^ e ^ f); } function d(a, b, c) { return (a & b) | (~a & c); } function e(a, b, c) { return (a & c) | (b & ~c); } function f(a, b, c) { return a ^ b ^ c; } function g(a, b, c) { return b ^ (a | ~c); } function h(a, e, f, g, h, i, j) { return (a = c(a, c(c(d(e, f, g), h), j))), c(b(a, i), e); } function i(a, d, f, g, h, i, j) { return (a = c(a, c(c(e(d, f, g), h), j))), c(b(a, i), d); } function j(a, d, e, g, h, i, j) { return (a = c(a, c(c(f(d, e, g), h), j))), c(b(a, i), d); } function k(a, d, e, f, h, i, j) { return (a = c(a, c(c(g(d, e, f), h), j))), c(b(a, i), d); } function l(a) { for (var b, c = a.length, d = c + 8, e = (d - (d % 64)) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i = 0; c > i;) (b = (i - (i % 4)) / 4), (h = (i % 4) * 8), (g[b] = g[b] | (a.charCodeAt(i) << h)), i++; return ((b = (i - (i % 4)) / 4), (h = (i % 4) * 8), (g[b] = g[b] | (128 << h)), (g[f - 2] = c << 3), (g[f - 1] = c >>> 29), g); } function m(a) { var b, c, d = "", e = ""; for (c = 0; 3 >= c; c++) (b = (a >>> (8 * c)) & 255), (e = "0" + b.toString(16)), (d += e.substr(e.length - 2, 2)); return d; } function n(a) { a = a.replace(/\r\n/g, "\n"); for (var b = "", c = 0; c < a.length; c++) { var d = a.charCodeAt(c); 128 > d ? (b += String.fromCharCode(d)) : d > 127 && 2048 > d ? ((b += String.fromCharCode((d >> 6) | 192)), (b += String.fromCharCode((63 & d) | 128))) : ((b += String.fromCharCode((d >> 12) | 224)), (b += String.fromCharCode(((d >> 6) & 63) | 128)), (b += String.fromCharCode((63 & d) | 128))); } return b; } var o, p, q, r, s, t, u, v, w, x = [], y = 7, z = 12, A = 17, B = 22, C = 5, D = 9, E = 14, F = 20, G = 4, H = 11, I = 16, J = 23, K = 6, L = 10, M = 15, N = 21; for (a = n(a), x = l(a), t = 1732584193, u = 4023233417, v = 2562383102, w = 271733878, o = 0; o < x.length; o += 16) (p = t), (q = u), (r = v), (s = w), (t = h(t, u, v, w, x[o + 0], y, 3614090360)), (w = h(w, t, u, v, x[o + 1], z, 3905402710)), (v = h(v, w, t, u, x[o + 2], A, 606105819)), (u = h(u, v, w, t, x[o + 3], B, 3250441966)), (t = h(t, u, v, w, x[o + 4], y, 4118548399)), (w = h(w, t, u, v, x[o + 5], z, 1200080426)), (v = h(v, w, t, u, x[o + 6], A, 2821735955)), (u = h(u, v, w, t, x[o + 7], B, 4249261313)), (t = h(t, u, v, w, x[o + 8], y, 1770035416)), (w = h(w, t, u, v, x[o + 9], z, 2336552879)), (v = h(v, w, t, u, x[o + 10], A, 4294925233)), (u = h(u, v, w, t, x[o + 11], B, 2304563134)), (t = h(t, u, v, w, x[o + 12], y, 1804603682)), (w = h(w, t, u, v, x[o + 13], z, 4254626195)), (v = h(v, w, t, u, x[o + 14], A, 2792965006)), (u = h(u, v, w, t, x[o + 15], B, 1236535329)), (t = i(t, u, v, w, x[o + 1], C, 4129170786)), (w = i(w, t, u, v, x[o + 6], D, 3225465664)), (v = i(v, w, t, u, x[o + 11], E, 643717713)), (u = i(u, v, w, t, x[o + 0], F, 3921069994)), (t = i(t, u, v, w, x[o + 5], C, 3593408605)), (w = i(w, t, u, v, x[o + 10], D, 38016083)), (v = i(v, w, t, u, x[o + 15], E, 3634488961)), (u = i(u, v, w, t, x[o + 4], F, 3889429448)), (t = i(t, u, v, w, x[o + 9], C, 568446438)), (w = i(w, t, u, v, x[o + 14], D, 3275163606)), (v = i(v, w, t, u, x[o + 3], E, 4107603335)), (u = i(u, v, w, t, x[o + 8], F, 1163531501)), (t = i(t, u, v, w, x[o + 13], C, 2850285829)), (w = i(w, t, u, v, x[o + 2], D, 4243563512)), (v = i(v, w, t, u, x[o + 7], E, 1735328473)), (u = i(u, v, w, t, x[o + 12], F, 2368359562)), (t = j(t, u, v, w, x[o + 5], G, 4294588738)), (w = j(w, t, u, v, x[o + 8], H, 2272392833)), (v = j(v, w, t, u, x[o + 11], I, 1839030562)), (u = j(u, v, w, t, x[o + 14], J, 4259657740)), (t = j(t, u, v, w, x[o + 1], G, 2763975236)), (w = j(w, t, u, v, x[o + 4], H, 1272893353)), (v = j(v, w, t, u, x[o + 7], I, 4139469664)), (u = j(u, v, w, t, x[o + 10], J, 3200236656)), (t = j(t, u, v, w, x[o + 13], G, 681279174)), (w = j(w, t, u, v, x[o + 0], H, 3936430074)), (v = j(v, w, t, u, x[o + 3], I, 3572445317)), (u = j(u, v, w, t, x[o + 6], J, 76029189)), (t = j(t, u, v, w, x[o + 9], G, 3654602809)), (w = j(w, t, u, v, x[o + 12], H, 3873151461)), (v = j(v, w, t, u, x[o + 15], I, 530742520)), (u = j(u, v, w, t, x[o + 2], J, 3299628645)), (t = k(t, u, v, w, x[o + 0], K, 4096336452)), (w = k(w, t, u, v, x[o + 7], L, 1126891415)), (v = k(v, w, t, u, x[o + 14], M, 2878612391)), (u = k(u, v, w, t, x[o + 5], N, 4237533241)), (t = k(t, u, v, w, x[o + 12], K, 1700485571)), (w = k(w, t, u, v, x[o + 3], L, 2399980690)), (v = k(v, w, t, u, x[o + 10], M, 4293915773)), (u = k(u, v, w, t, x[o + 1], N, 2240044497)), (t = k(t, u, v, w, x[o + 8], K, 1873313359)), (w = k(w, t, u, v, x[o + 15], L, 4264355552)), (v = k(v, w, t, u, x[o + 6], M, 2734768916)), (u = k(u, v, w, t, x[o + 13], N, 1309151649)), (t = k(t, u, v, w, x[o + 4], K, 4149444226)), (w = k(w, t, u, v, x[o + 11], L, 3174756917)), (v = k(v, w, t, u, x[o + 2], M, 718787259)), (u = k(u, v, w, t, x[o + 9], N, 3951481745)), (t = c(t, p)), (u = c(u, q)), (v = c(v, r)), (w = c(w, s)); var O = m(t) + m(u) + m(v) + m(w); return O.toLowerCase(); }
  function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t);break;case"Node.js":this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
