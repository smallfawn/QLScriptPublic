/**
 * 海尔 - 卡萨帝小程序 签到、抽奖
 * cron 10 8 * * *  海尔-卡萨帝.js
 *
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export ksd='你抓包的UserToken#请求Body里的openId'

 * 自己抓包 /user/userCenter/saveUserSource请求协议头上的MK-U-User-Token
 * 请求数据里的 openId
 * 用 # 连接

 * 多账号换行或&隔开

 * 奖励：现金红包
 *
 * ====================================
 *
 */
//Sat Jan 25 2025 08:32:06 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const $ = new Env("卡萨帝小程序");
let envParams = "ksd",
  envSplitor = ["\n", "&"],
  authorizationToken = ($.isNode() ? process.env[envParams] : $.getdata(envParams)) || "",
  initedJobForTokens = [],
  currentUserIndex = 0,
  contentType = "application/json;charset=UTF-8",
  defaultUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF XWEB/6945",
  Referer = "https://yx.jsh.com/game/signInIndex?employeeId=&playId=20";
const https = require("https");
class JobTask {
  constructor(_0x55d5be) {
    this.index = ++currentUserIndex;
    this.points = 0;
    this.valid = false;
    try {
      [this.activedAuthToken, this.openId] = _0x55d5be?.["split"]("#");
    } catch (_0x5cde09) {
      this.activedAuthToken = _0x55d5be;
    }
  }
  async ["taskApi"](_0x53ede5, _0x2127bc, _0x2c79b5, _0x31d84a, _0x232dd9 = {}) {
    let _0x41e367 = null;
    try {
      let _0x235e01 = _0x2c79b5.replace("//", "/").split("/")[1],
        _0x49cb17 = {
          "url": _0x2c79b5,
          "headers": {
            "Accept": "application/json, text/plain, */*",
            "Authorization": this.activedAuthToken,
            "Host": _0x235e01,
            "Connection": "keep-alive",
            "Content-Type": contentType,
            "User-Agent": defaultUA,
            "Referer": Referer,
            "MK-Source-Code": "casarte",
            "MK-U-App-Code": "gUsb9sx0eXEdMuc",
            "MK-U-User-Token": this.activedAuthToken,
            ..._0x232dd9
          },
          "timeout": 60000
        };
      if (_0x31d84a) {
        _0x49cb17.body = _0x31d84a;
      }
      await httpRequest(_0x2127bc, _0x49cb17).then(async _0x591ac9 => {
        if (_0x591ac9.resp?.["statusCode"] == 200) {
          _0x591ac9.resp?.["body"] ? _0x41e367 = JSON.parse(_0x591ac9.resp.body) : console.log("账号[" + this.index + "]调用" + _0x2127bc + "[" + _0x53ede5 + "]出错，返回为空");
        } else console.log("账号[" + this.index + "]调用" + _0x2127bc + "[" + _0x53ede5 + "]出错，返回状态码[" + (_0x591ac9.resp?.["statusCode"] || "") + "]");
      });
    } catch (_0x38b370) {
      console.log(_0x38b370);
    } finally {
      return Promise.resolve(_0x41e367);
    }
  }
  async ["GetUserInfo"]() {
    try {
      {
        let _0x1ed441 = "GetUserInfo",
          _0x201f80 = "post",
          _0x5e3710 = "https://mk-gift.haier.net/qy/customer/api/redEnvelope/queryRedEnvelopeWallet",
          _0x5ade36 = "{\"redSource\":\"\"}";
        await this.taskApi(_0x1ed441, _0x201f80, _0x5e3710, _0x5ade36, {
          "Content-Type": "application/json"
        }).then(async _0x29ca70 => {
          console.log("result:", _0x29ca70);
          _0x29ca70.code === 200 ? (this.valid = true, this.points = Number(_0x29ca70.data.cash_available), console.log("账号[" + this.index + "] 登录成功"), console.log("账号[" + this.index + "] 当前余额: " + this.points)) : $.logAndNotify("账号[" + this.index + "]查询余额失败，可能帐号无效");
        });
      }
    } catch (_0x670981) {
      console.log(_0x670981);
    } finally {
      return Promise.resolve(1);
    }
  }
  async ["SignInDaily"]() {
    try {
      {
        let _0x226da3 = "SignInDaily",
          _0x79792e = "post",
          _0xb36903 = "https://yx.jsh.com/customer/api/user/playingMethod/game/saveClockInInfoByUserId",
          _0x541af5 = "{\"playId\":\"20\",\"employeeId\":\"\",\"mobile\":\"\",\"openId\":\"" + this.openId + "\",\"parentUserId\":\"\",\"userId\":\"\"}";
        await this.taskApi(_0x226da3, _0x79792e, _0xb36903, _0x541af5).then(async _0x25b135 => {
          console.log("result:", _0x25b135);
          _0x25b135.code === 200 ? (console.log("账号[" + this.index + "] 签到成功，获得" + _0x25b135.data / 100 + "元"), _0x25b135.data && (this.points += _0x25b135.data / 100)) : console.log("账号[" + this.index + "] 签到失败：" + _0x25b135?.["message"]);
        });
      }
    } catch (_0x1aa259) {
      console.log(_0x1aa259);
    } finally {
      return Promise.resolve(1);
    }
  }
  async ["LuckDraw"]() {
    try {
      let _0x1bb47d = "LuckDraw",
        _0x343437 = "post",
        _0x46ba8d = "https://yx.jsh.com/customer/api/user/client/luckDraw",
        _0x13a4ce = "{\"gameId\":\"174464962928279552\"}";
      await this.taskApi(_0x1bb47d, _0x343437, _0x46ba8d, _0x13a4ce).then(async _0x108d75 => {
        {
          console.log("result:", _0x108d75);
          if (_0x108d75.code === 200) console.log("账号[" + this.index + "] 抽奖成功，获得" + _0x108d75.data?.["prizeName"] + "积分");else {
            console.log("账号[" + this.index + "] 抽奖失败：" + _0x108d75?.["message"]);
          }
        }
      });
    } catch (_0x5f4c99) {
      console.log(_0x5f4c99);
    } finally {
      return Promise.resolve(1);
    }
  }
  async ["TiXian"]() {
    try {
      {
        let _0x5a32ee = "TiXian",
          _0x46df13 = "post",
          _0x4bbbc6 = "https://marketing-api.haier.net/api/marketing-assemble/api/cashcenter/user/wallet/withdrawalCash",
          _0x3e492d = encodeURIComponent("data={\"type\":\"1\",\"withdrawFee\":\"" + this.points + "\"}&signData={\"key\":\"userRed100000003\",\"secret\":\"88800de360b7308cdba924b865507a92\"}");
        await this.taskApi(_0x5a32ee, _0x46df13, _0x4bbbc6, _0x3e492d, {
          "Authorization": "Bearer " + this.activedAuthToken,
          "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "com.tencent.mm",
          "plantform-channel": "PLAT_FORM_WECHAT"
        }).then(async _0x48a4c5 => {
          _0x48a4c5.code === 200 ? console.log("账号[" + this.index + "] 提现成功，获得" + _0x48a4c5.data?.["prizeName"] + "现金") : console.log("账号[" + this.index + "] 提现失败：" + JSON.parse(_0x48a4c5));
        });
      }
    } catch (_0x5dcea4) {
      console.log(_0x5dcea4);
    } finally {
      return Promise.resolve(1);
    }
  }
  async ["doTask"]() {
    try {
      console.log("\n============= 账号[" + this.index + "] 开始签到=============");
      await this.SignInDaily();
      await waitSomeTime();
      await this.LuckDraw();
      console.log("\n----待提现的金额:", this.points);
      this.points && !Number.isNaN(this.points) && this.points >= 1 && (await waitSomeTime(), await this.TiXian());
    } catch (_0x3b27c2) {
      console.log(_0x3b27c2);
    }
  }
}
!(async () => {
  if (typeof $request !== "undefined") {
    await GetRewrite();
  } else {
    {
      if (!(await checkEnv())) return;
      console.log("\n================ 开始执行 ================");
      for (let _0x37bc9f of initedJobForTokens) {
        console.log("----------- 执行 第 [" + _0x37bc9f.index + "] 个账号 -----------");
        await _0x37bc9f.GetUserInfo();
      }
      let _0x56f6f9 = initedJobForTokens.filter(_0x308e9f => _0x308e9f.valid);
      if (initedJobForTokens.length > 0) {
        console.log("\n================ 任务队列构建完毕 ================");
        for (let _0x22bb86 of _0x56f6f9) {
          console.log("----------- 账号[" + _0x22bb86.index + "] -----------");
          await _0x22bb86.doTask();
        }
      }
      await $.showmsg();
    }
  }
})().catch(_0x570c59 => console.log(_0x570c59)).finally(() => $.done());
async function waitSomeTime(_0x395b52 = 3000) {
  console.log("----------- 延迟 " + _0x395b52 / 1000 + " s，请稍等 -----------");
  return await new Promise(_0x203071 => setTimeout(_0x203071, _0x395b52));
}
async function GetRewrite() {}
async function checkEnv() {
  if (authorizationToken) {
    {
      let _0x15962f = envSplitor[0];
      for (let _0x3a119f of envSplitor) {
        {
          if (authorizationToken.indexOf(_0x3a119f) > -1) {
            _0x15962f = _0x3a119f;
            break;
          }
        }
      }
      for (let _0x167f1c of authorizationToken.split(_0x15962f)) {
        {
          if (_0x167f1c) initedJobForTokens.push(new JobTask(_0x167f1c));
        }
      }
      userCount = initedJobForTokens.length;
    }
  } else {
    console.log("未找到 配置信息，请检查是否配置 变量：", envParams);
    return;
  }
  console.log("共找到" + userCount + "个账号");
  return true;
}
async function httpRequest(_0x315fde, _0x43498a) {
  httpErr = null;
  httpReq = null;
  httpResp = null;
  return new Promise(_0x15e577 => {
    $.send(_0x315fde, _0x43498a, async (_0x46ab79, _0x54af7f, _0x326c5c) => {
      httpErr = _0x46ab79;
      httpReq = _0x54af7f;
      httpResp = _0x326c5c;
      _0x15e577({
        "err": _0x46ab79,
        "req": _0x54af7f,
        "resp": _0x326c5c
      });
    });
  });
}
function Env(_0x145f6d, _0x2ad434) {
  "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
  return new class {
    constructor(_0x2c6ae3, _0x15c3de) {
      {
        this.name = _0x2c6ae3;
        this.notifyStr = "";
        this.startTime = new Date().getTime();
        Object.assign(this, _0x15c3de);
        console.log(this.name + " 开始运行：\n");
      }
    }
    ["isNode"]() {
      return "undefined" != typeof module && !!module.exports;
    }
    ["isQuanX"]() {
      return "undefined" != typeof $task;
    }
    ["isSurge"]() {
      return "undefined" != typeof $httpClient && "undefined" == typeof $loon;
    }
    ["isLoon"]() {
      return "undefined" != typeof $loon;
    }
    ["getdata"](_0x4fac12) {
      let _0x34b166 = this.getval(_0x4fac12);
      if (/^@/.test(_0x4fac12)) {
        {
          const [, _0x4a384a, _0x163012] = /^@(.*?)\.(.*?)$/.exec(_0x4fac12),
            _0x4d5996 = _0x4a384a ? this.getval(_0x4a384a) : "";
          if (_0x4d5996) try {
            const _0xea2094 = JSON.parse(_0x4d5996);
            _0x34b166 = _0xea2094 ? this.lodash_get(_0xea2094, _0x163012, "") : _0x34b166;
          } catch (_0x178f4b) {
            _0x34b166 = "";
          }
        }
      }
      return _0x34b166;
    }
    ["setdata"](_0x2f9735, _0x5a4907) {
      {
        let _0x1da6cb = false;
        if (/^@/.test(_0x5a4907)) {
          const [, _0x8150c9, _0x441dcb] = /^@(.*?)\.(.*?)$/.exec(_0x5a4907),
            _0x31d092 = this.getval(_0x8150c9),
            _0x2dc4c1 = _0x8150c9 ? "null" === _0x31d092 ? null : _0x31d092 || "{}" : "{}";
          try {
            const _0x4cde78 = JSON.parse(_0x2dc4c1);
            this.lodash_set(_0x4cde78, _0x441dcb, _0x2f9735);
            _0x1da6cb = this.setval(JSON.stringify(_0x4cde78), _0x8150c9);
          } catch (_0x39e26e) {
            {
              const _0x302ef5 = {};
              this.lodash_set(_0x302ef5, _0x441dcb, _0x2f9735);
              _0x1da6cb = this.setval(JSON.stringify(_0x302ef5), _0x8150c9);
            }
          }
        } else _0x1da6cb = this.setval(_0x2f9735, _0x5a4907);
        return _0x1da6cb;
      }
    }
    ["getval"](_0x17b0b5) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(_0x17b0b5) : this.isQuanX() ? $prefs.valueForKey(_0x17b0b5) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x17b0b5]) : this.data && this.data[_0x17b0b5] || null;
    }
    ["setval"](_0x1a4b9a, _0x5989f1) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(_0x1a4b9a, _0x5989f1) : this.isQuanX() ? $prefs.setValueForKey(_0x1a4b9a, _0x5989f1) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x5989f1] = _0x1a4b9a, this.writedata(), true) : this.data && this.data[_0x5989f1] || null;
    }
    ["send"](_0x390a5f, _0x55dfcf, _0x53ea18 = () => {}) {
      {
        if (_0x390a5f != "get" && _0x390a5f != "post" && _0x390a5f != "put" && _0x390a5f != "delete") {
          {
            console.log("无效的http方法：" + _0x390a5f);
            return;
          }
        }
        if (_0x390a5f == "get" && _0x55dfcf.headers) delete _0x55dfcf.headers["Content-Type"], delete _0x55dfcf.headers["Content-Length"];else {
          if (_0x55dfcf.body && _0x55dfcf.headers) {
            {
              if (!_0x55dfcf.headers["Content-Type"]) _0x55dfcf.headers["Content-Type"] = "application/x-www-form-urlencoded";
            }
          }
        }
        if (this.isSurge() || this.isLoon()) {
          {
            if (this.isSurge() && this.isNeedRewrite) {
              _0x55dfcf.headers = _0x55dfcf.headers || {};
              Object.assign(_0x55dfcf.headers, {
                "X-Surge-Skip-Scripting": false
              });
            }
            let _0x41a6ce = {
              "method": _0x390a5f,
              "url": _0x55dfcf.url,
              "headers": _0x55dfcf.headers,
              "timeout": _0x55dfcf.timeout,
              "data": _0x55dfcf.body
            };
            if (_0x390a5f == "get") delete _0x41a6ce.data;
            $axios(_0x41a6ce).then(_0x33377e => {
              {
                const {
                  status: _0x2065f2,
                  request: _0x23f3a5,
                  headers: _0x4e5d89,
                  data: _0xd40200
                } = _0x33377e;
                _0x53ea18(null, _0x23f3a5, {
                  "statusCode": _0x2065f2,
                  "headers": _0x4e5d89,
                  "body": _0xd40200
                });
              }
            }).catch(_0x30a337 => console.log(_0x30a337));
          }
        } else {
          if (this.isQuanX()) {
            _0x55dfcf.method = _0x390a5f.toUpperCase();
            this.isNeedRewrite && (_0x55dfcf.opts = _0x55dfcf.opts || {}, Object.assign(_0x55dfcf.opts, {
              "hints": false
            }));
            $task.fetch(_0x55dfcf).then(_0x4fc46b => {
              {
                const {
                  statusCode: _0x3adacc,
                  request: _0x4c9fac,
                  headers: _0x465d4c,
                  body: _0x1c0160
                } = _0x4fc46b;
                _0x53ea18(null, _0x4c9fac, {
                  "statusCode": _0x3adacc,
                  "headers": _0x465d4c,
                  "body": _0x1c0160
                });
              }
            }, _0x39ac1f => _0x53ea18(_0x39ac1f));
          } else {
            if (this.isNode()) {
              this.got = this.got ? this.got : require("got");
              const {
                url: _0x17922a,
                ..._0x2092f9
              } = _0x55dfcf;
              this.instance = this.got.extend({
                "followRedirect": false
              });
              this.instance[_0x390a5f](_0x17922a, _0x2092f9).then(_0x36703e => {
                const {
                  statusCode: _0x23a6f5,
                  request: _0xc061b3,
                  headers: _0x1e25f8,
                  body: _0x15c804
                } = _0x36703e;
                _0x53ea18(null, _0xc061b3, {
                  "statusCode": _0x23a6f5,
                  "headers": _0x1e25f8,
                  "body": _0x15c804
                });
              }, _0x2b4fca => {
                {
                  const {
                    message: _0x5baa3b,
                    request: _0x1400de,
                    response: _0x20be40
                  } = _0x2b4fca;
                  _0x53ea18(_0x5baa3b, _0x1400de, _0x20be40);
                }
              });
            }
          }
        }
      }
    }
    ["time"](_0x518b14, _0x4cec02 = null) {
      let _0x91d015 = _0x4cec02 ? new Date(_0x4cec02) : new Date(),
        _0xc32e0 = {
          "M+": _0x91d015.getMonth() + 1,
          "d+": _0x91d015.getDate(),
          "h+": _0x91d015.getHours(),
          "m+": _0x91d015.getMinutes(),
          "s+": _0x91d015.getSeconds(),
          "q+": Math.floor((_0x91d015.getMonth() + 3) / 3),
          "S": _0x91d015.getMilliseconds()
        };
      /(y+)/.test(_0x518b14) && (_0x518b14 = _0x518b14.replace(RegExp.$1, (_0x91d015.getFullYear() + "").substr(4 - RegExp.$1.length)));
      for (let _0x74d676 in _0xc32e0) new RegExp("(" + _0x74d676 + ")").test(_0x518b14) && (_0x518b14 = _0x518b14.replace(RegExp.$1, 1 == RegExp.$1.length ? _0xc32e0[_0x74d676] : ("00" + _0xc32e0[_0x74d676]).substr(("" + _0xc32e0[_0x74d676]).length)));
      return _0x518b14;
    }
    async ["showmsg"]() {
      if (!this.notifyStr) return;
      let _0x49b71e = this.name + " 运行通知\n\n" + this.notifyStr;
      if ($.isNode()) {
        var _0x15c32f = require("../sendNotify");
        console.log("\n============== 推送 ==============");
        await _0x15c32f.sendNotify(this.name, _0x49b71e);
      } else this.msg(_0x49b71e);
    }
    ["logAndNotify"](_0x411ee5) {
      console.log(_0x411ee5);
      this.notifyStr += _0x411ee5;
      this.notifyStr += "\n";
    }
    ["logAndNotifyWithTime"](_0x265752) {
      {
        let _0x29cff9 = "[" + this.time("hh:mm:ss.S") + "]" + _0x265752;
        console.log(_0x29cff9);
        this.notifyStr += _0x29cff9;
        this.notifyStr += "\n";
      }
    }
    ["logWithTime"](_0x35d90e) {
      console.log("[" + this.time("hh:mm:ss.S") + "]" + _0x35d90e);
    }
    ["msg"](_0x36b3bc = t, _0x277707 = "", _0x416e8b = "", _0x487038) {
      const _0x1a3fa6 = _0x4e2159 => {
        {
          if (!_0x4e2159) return _0x4e2159;
          if ("string" == typeof _0x4e2159) return this.isLoon() ? _0x4e2159 : this.isQuanX() ? {
            "open-url": _0x4e2159
          } : this.isSurge() ? {
            "url": _0x4e2159
          } : undefined;
          if ("object" == typeof _0x4e2159) {
            {
              if (this.isLoon()) {
                {
                  let _0x1d32d6 = _0x4e2159.openUrl || _0x4e2159.url || _0x4e2159["open-url"],
                    _0x1c6203 = _0x4e2159.mediaUrl || _0x4e2159["media-url"];
                  return {
                    "openUrl": _0x1d32d6,
                    "mediaUrl": _0x1c6203
                  };
                }
              }
              if (this.isQuanX()) {
                let _0x5a7300 = _0x4e2159["open-url"] || _0x4e2159.url || _0x4e2159.openUrl,
                  _0x425900 = _0x4e2159["media-url"] || _0x4e2159.mediaUrl;
                return {
                  "open-url": _0x5a7300,
                  "media-url": _0x425900
                };
              }
              if (this.isSurge()) {
                let _0x40d0df = _0x4e2159.url || _0x4e2159.openUrl || _0x4e2159["open-url"];
                return {
                  "url": _0x40d0df
                };
              }
            }
          }
        }
      };
      this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(_0x36b3bc, _0x277707, _0x416e8b, _0x1a3fa6(_0x487038)) : this.isQuanX() && $notify(_0x36b3bc, _0x277707, _0x416e8b, _0x1a3fa6(_0x487038)));
      let _0x32161e = ["", "============== 系统通知 =============="];
      _0x32161e.push(_0x36b3bc);
      _0x277707 && _0x32161e.push(_0x277707);
      _0x416e8b && _0x32161e.push(_0x416e8b);
      console.log(_0x32161e.join("\n"));
    }
    ["getMin"](_0x3e6cad, _0x1ce183) {
      return _0x3e6cad < _0x1ce183 ? _0x3e6cad : _0x1ce183;
    }
    ["getMax"](_0x939b39, _0xc0287e) {
      return _0x939b39 < _0xc0287e ? _0xc0287e : _0x939b39;
    }
    ["padStr"](_0x371ca0, _0x558a10, _0x50b7d9 = "0") {
      let _0x23ddbe = String(_0x371ca0),
        _0x5c77da = _0x558a10 > _0x23ddbe.length ? _0x558a10 - _0x23ddbe.length : 0,
        _0x41ed35 = "";
      for (let _0x232913 = 0; _0x232913 < _0x5c77da; _0x232913++) {
        _0x41ed35 += _0x50b7d9;
      }
      _0x41ed35 += _0x23ddbe;
      return _0x41ed35;
    }
    ["json2str"](_0x3344e, _0x14c262, _0x39f0d1 = false) {
      let _0x41049d = [];
      for (let _0x59f8b1 of Object.keys(_0x3344e).sort()) {
        let _0x492abf = _0x3344e[_0x59f8b1];
        if (_0x492abf && _0x39f0d1) _0x492abf = encodeURIComponent(_0x492abf);
        _0x41049d.push(_0x59f8b1 + "=" + _0x492abf);
      }
      return _0x41049d.join(_0x14c262);
    }
    ["str2json"](_0x27a7e5, _0x562ec0 = false) {
      {
        let _0x21bc24 = {};
        for (let _0x5a43be of _0x27a7e5.split("&")) {
          if (!_0x5a43be) continue;
          let _0x16b706 = _0x5a43be.indexOf("=");
          if (_0x16b706 == -1) continue;
          let _0x5c1005 = _0x5a43be.substr(0, _0x16b706),
            _0x5bd991 = _0x5a43be.substr(_0x16b706 + 1);
          if (_0x562ec0) _0x5bd991 = decodeURIComponent(_0x5bd991);
          _0x21bc24[_0x5c1005] = _0x5bd991;
        }
        return _0x21bc24;
      }
    }
    ["randomString"](_0x3fd6b4, _0x227d42 = "abcdef0123456789") {
      {
        let _0x4a0db9 = "";
        for (let _0x11b627 = 0; _0x11b627 < _0x3fd6b4; _0x11b627++) {
          _0x4a0db9 += _0x227d42.charAt(Math.floor(Math.random() * _0x227d42.length));
        }
        return _0x4a0db9;
      }
    }
    ["randomList"](_0x3ac336) {
      {
        let _0x5b9b88 = Math.floor(Math.random() * _0x3ac336.length);
        return _0x3ac336[_0x5b9b88];
      }
    }
    ["wait"](_0x3e1e6c) {
      return new Promise(_0x342340 => setTimeout(_0x342340, _0x3e1e6c));
    }
    ["done"](_0x39fc39 = {}) {
      {
        const _0x43cece = new Date().getTime(),
          _0x11ce01 = (_0x43cece - this.startTime) / 1000;
        console.log("\n" + this.name + " 运行结束，共运行了 " + _0x11ce01 + " 秒！");
        if (this.isSurge() || this.isQuanX() || this.isLoon()) $done(_0x39fc39);
      }
    }
  }(_0x145f6d, _0x2ad434);
}