/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description: 测试
------------------------------------------
#Notice:   只适用于购买了luflytoken的  购买联系QQ860562056
变量luflytoken 填写luflytoken
变量wxbnmdwxid 填写wxbnmdwxid  多账号&分割或者换行
⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
*/

const $ = new Env("巴奴毛肚小程序");
let ckName = `wxbnmdwxid`;
const strSplitor = "#";
const envSplitor = ["&", "\n"];
const crypto = require("crypto-js");
const notify = $.isNode() ? require("../sendNotify") : "";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"
const key = "bfc5e947cd84c7ced1ee48d28fb3e90f";
let luflytoken = process.env.luflytoken || ""
let wxcenter = 'http://w.smallfawn.top:5789'
let appid = 'wx71373698c47f9a9f'
class Public {
  async request(options) {
    return await axios.request(options);
  }
}
class Task extends Public {
  constructor(env) {

    super();
    this.index = $.userIdx++
    let user = env.split(strSplitor);
    this.wxid = user[0];
  }
  getUUID(_0x4b4b65 = 16, _0x14813d = 36) {
    const _0x181bd6 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
    const _0x295ca7 = [];
    let _0x4713fe = 0;
    if (_0x4b4b65) {
      for (_0x4713fe = 0; _0x4713fe < _0x4b4b65; _0x4713fe++) {
        _0x295ca7[_0x4713fe] = _0x181bd6[0 | Math.random() * _0x14813d];
      }
    } else {
      let _0x540406;
      for (_0x295ca7[8] = _0x295ca7[13] = _0x295ca7[18] = _0x295ca7[23] = "-", _0x295ca7[14] = "4", _0x4713fe = 0; _0x4713fe < 36; _0x4713fe++) {
        if (!_0x295ca7[_0x4713fe]) {
          _0x540406 = 0 | 16 * Math.random();
          _0x295ca7[_0x4713fe] = _0x181bd6[19 === _0x4713fe ? 3 & _0x540406 | 8 : _0x540406];
        }
      }
    }
    return _0x295ca7.join("");
  }
  getHeaders(options, _0x32d686, authorization) {
    const keyOptions = {
      app_key: "KlZ4LqOF",
      app_secret: "HoBJTYXdwn"
    };
    const _0x3aaf0a = {
      t: Math.floor(new Date().getTime() / 1000),
      n: this.getUUID(),
      ...keyOptions
    };
    const _0x419328 = Object.values(_0x3aaf0a).join("");

    const sign = this.stringToLowerCase(this.stringToLowerCase(_0x419328)).split("").reverse().join("");
    const header = {
      'Connection': 'keep-alive',
      'content-type': 'application/json',
      'uuid': options.uuid,
      'platform_version_code': 'iOS 16.6',
      'authorization': authorization, //
      'tenancy_id': 'banu',
      'app_key': 'KlZ4LqOF',
      'code': 'f22b68d1c74c3a66aa7a1b199bcd4e20', // 
      'platform_version_name': 'iPhone 11<iPhone12,1>',
      'platform_version_weapp': '8.0.50',
      't': _0x3aaf0a.t,
      'n': _0x3aaf0a.n,
      'platform_version_sdk': '3.5.8',
      'sign': sign,
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.50(0x1800323d) NetType/4G Language/zh_CN',
      'Referer': 'https://servicewechat.com/wx71373698c47f9a9f/474/page-frame.html'
    }

    if (_0x32d686) {
      const _0xa2075e = new URLSearchParams({
        ...options,
        enc_data: _0x32d686
      }).toString();
      const code = this.stringToLowerCase(this.stringToLowerCase(_0xa2075e)).split("").reverse().join("");
      header.code = code;
    }
    return header;
  }
  stringToLowerCase(str) {
    return crypto.MD5(str).toString().toLowerCase();
  }
  decrypt(_0x3c73c4) {
    const _0x3218f0 = crypto.lib.WordArray.random(16).toString();
    const _0x30b65e = JSON.stringify(_0x3c73c4);
    const _0x429ee1 = crypto.AES.encrypt(_0x30b65e, crypto.enc.Utf8.parse(key), {
      iv: crypto.enc.Utf8.parse(_0x3218f0),
      mode: crypto.mode.CBC
    }).toString();
    return crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(JSON.stringify({
      iv: _0x3218f0,
      encrypted_data: _0x429ee1
    })));
  }
  async getcode() {
    let options = {
      url: `${wxcenter}/api/getcode`,
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      data: { "luflyKey": "" + luflytoken, "wxid": "" + this.wxid, "appid": "" + appid }
    }
    let { data: result } = await this.request(options);
    if (result.status) {
      let code = result.data
      $.log(`账号[${this.wxid}] 获取code成功[${code}]`);
      let { member_id: memberId, openid: authorization } = await this.login(code)
      const headerObj = {};
      const data = {
        member_id: memberId
      };
      try {
        headerObj.uuid = this.getUUID();
        const res = await axios.get("https://cloud.banu.cn/api/sign-in/days", {
          params: data,
          headers: this.getHeaders(headerObj, false, authorization)
        });
        if (res.data.data.is_sign_in) {
          $.log(`账号[${this.wxid}] 重复签到`);
        } else {
          const decryptData = this.decrypt(data);
          const res = await axios.post("https://cloud.banu.cn/api/sign-in", {
            enc_data: decryptData
          }, {
            headers: this.getHeaders(headerObj, decryptData, authorization)
          });
          $.log("签到：" + res.data.message);
        }
        const info = await axios.get("https://cloud.banu.cn/api/member/statistic", {
          params: data,
          headers: this.getHeaders(headerObj, false, authorization)
        });
        const result = "\nMember_id:" + memberId + "\n用户名:" + info.data.data.name + "\n总积分:" + info.data.data.points;
      } catch (err) {

        console.log("签到失败：" + err + " | 签到时间：" + Date.now());
      }
    } else {
      console.log(result);
    }


  }
  async login(code) {
    let url = 'https://cloud.banu.cn/api/wx/weapp/auth';
    let data = {
      'app_id': 'wx71373698c47f9a9f',
      'code': code
    }
    const headerObj = {};
    headerObj.uuid = this.getUUID();
    let headers = this.getHeaders(headerObj, false, "");

    let { data: res } = await this.request({
      url,
      method: "POST",
      headers,
      data
    })
    return res.data;
  }
  async run() {

    await this.getcode()



  }
}


!(async () => {
  await getNotice()
  $.checkEnv(ckName);

  for (let user of $.userList) {
    //

    await new Task(user).run();

  }


})()
  .catch((e) => console.log(e))
  .finally(() =>  $.done());

async function getNotice() {
  let options = {
    url: `https://gitee.com/smallfawn/Note/raw/main/Notice.json`,
    headers: {
      "User-Agent": defaultUserAgent,
    }
  }
  let { data: res } = await new Public().request(options);
  $.log(res)
  return res
}


// prettier-ignore
function Env(t, s) {
  return new (class {
      constructor(t, s) {
          this.userIdx = 1;
          this.userList = [];
          this.userCount = 0;
          this.name = t;
          this.notifyStr = [];
          this.logSeparator = "\n";
          this.startTime = new Date().getTime();
          Object.assign(this, s);
          this.log(`\ud83d\udd14${this.name},\u5f00\u59cb!`);
      }
      checkEnv(ckName) {
          let userCookie = (this.isNode() ? process.env[ckName] : "") || "";
          this.userList = userCookie.split(envSplitor.find((o) => userCookie.includes(o)) || "&").filter((n) => n);
          this.userCount = this.userList.length;
          this.log(`共找到${this.userCount}个账号`);
      }
      async sendMsg() {
          this.log("==============📣Center 通知📣==============")
          for (let item of this.notifyStr) {
              if (Object.prototype.toString.call(item) === '[object Object]'||Object.prototype.toString.call(item) === '[object Array]') {
                  item = JSON.stringify(item)
              }
          }
          let message = this.notifyStr.join(this.logSeparator);
          if (this.isNode()) {
              await notify.sendNotify(this.name, message);
          } else {
          }
      }
      isNode() {
          return "undefined" != typeof module && !!module.exports;
      }

      queryStr(options) {
          return Object.entries(options)
              .map(
                  ([key, value]) =>
                      `${key}=${typeof value === "object" ? JSON.stringify(value) : value
                      }`
              )
              .join("&");
      }
      getURLParams(url) {
          const params = {};
          const queryString = url.split("?")[1];
          if (queryString) {
              const paramPairs = queryString.split("&");
              paramPairs.forEach((pair) => {
                  const [key, value] = pair.split("=");
                  params[key] = value;
              });
          }
          return params;
      }
      isJSONString(str) {
          try {
              return JSON.parse(str) && typeof JSON.parse(str) === "object";
          } catch (e) {
              return false;
          }
      }
      isJson(obj) {
          var isjson =
              typeof obj == "object" &&
              Object.prototype.toString.call(obj).toLowerCase() ==
              "[object object]" &&
              !obj.length;
          return isjson;
      }

      randomNumber(length) {
          const characters = "0123456789";
          return Array.from(
              { length },
              () => characters[Math.floor(Math.random() * characters.length)]
          ).join("");
      }
      randomString(length) {
          const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
          return Array.from(
              { length },
              () => characters[Math.floor(Math.random() * characters.length)]
          ).join("");
      }
      uuid() {
          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
              /[xy]/g,
              function (c) {
                  var r = (Math.random() * 16) | 0,
                      v = c == "x" ? r : (r & 0x3) | 0x8;
                  return v.toString(16);
              }
          );
      }
      time(t) {
          let s = {
              "M+": new Date().getMonth() + 1,
              "d+": new Date().getDate(),
              "H+": new Date().getHours(),
              "m+": new Date().getMinutes(),
              "s+": new Date().getSeconds(),
              "q+": Math.floor((new Date().getMonth() + 3) / 3),
              S: new Date().getMilliseconds(),
          };
          /(y+)/.test(t) &&
              (t = t.replace(
                  RegExp.$1,
                  (new Date().getFullYear() + "").substr(4 - RegExp.$1.length)
              ));
          for (let e in s) {
              new RegExp("(" + e + ")").test(t) &&
                  (t = t.replace(
                      RegExp.$1,
                      1 == RegExp.$1.length
                          ? s[e]
                          : ("00" + s[e]).substr(("" + s[e]).length)
                  ));
          }
          return t;
      }

      log(content) {
          this.notifyStr.push(content)
          console.log(content)
      }
      wait(t) {
          return new Promise((s) => setTimeout(s, t));
      }
      async done(t = {}) {
          await this.sendMsg();
          const s = new Date().getTime(),
              e = (s - this.startTime) / 1e3;
          this.log(
              `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`
          );
          if (this.isNode()) {
              process.exit(1);
          }
      }
  })(t, s);
}