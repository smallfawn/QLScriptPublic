
/**
 * 商战网络签到V1.1
 * cron 10 8,12 * * * 商战网络.js  一天5分满2元提现
 * const $ = new Env("商战网络签到");

 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export szwl='你抓包的token#你抓包的Client_ip'
 * 你抓包的Client_ip可以为空，软件会随机生成一个ip（也就是：export szwl='你抓包的token'）
 * 新增提示：
 * 格式支持以下几种，自己选：
 * export szwl='就一个token'
 * 或者 export szwl='你抓包的token#你抓包的Client_ip'
 * 或者 export szwl='手机号#密码'（推荐这种，因为账号密码不会过期）
 * 或者 export szwl='手机号#密码#你抓包的Client_ip'（推荐这种，因为账号密码不会过期）

 * 自己抓包协议头上的Authorization

 * 多账号换行或&隔开

 * 奖励：签到得红包，满1提现
 * 
 * ====================================
 *   
 */
//Sat Jan 25 2025 08:25:03 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const $ = new Env("商战网络签到");
let envParams = "szwl",
  envSplitor = ["\n", "&"];
const fs = require("fs");
let authorizationToken = ($.isNode() ? process.env[envParams] : $.getdata(envParams)) || "",
  initedJobForTokens = [],
  currentUserIndex = 0;
class JobTask {
  constructor(_0x321952) {
    this.index = ++currentUserIndex;
    this.points = 0;
    this.valid = false;
    try {
      const _0xf52f29 = _0x321952?.["split"]("#");
      _0xf52f29?.["length"] === 2 ? ([this.activedAuthToken, this.ip] = _0xf52f29, !isValidIP(this.ip) && ([this.account, this.password] = _0xf52f29, this.ip = "", this.activedAuthToken = "")) : ([this.account, this.password, this.ip] = _0xf52f29, this.activedAuthToken = "");
    } catch (_0x8cdf76) {
      this.activedAuthToken = _0x321952;
    }
    if (isValidIP(this.ip)) {} else {
      {
        this.ip = readValueFromFile(envParams + "_config", "fakeIp");
        if (this.ip) {
          console.log("账号[" + this.index + "]从缓存读取IP地址成功： " + this.ip);
          return;
        }
        const _0x561a3f = generateRandomIP(true);
        this.ip = _0x561a3f;
        console.log("账号[" + this.index + "]未检测到设置的IP，开始随机生成一个： " + _0x561a3f);
        saveValueToFile(envParams + "_config", "fakeIp", _0x561a3f);
      }
    }
  }
  async ["taskApi"](_0x339def, _0x14c334, _0x31cbec, _0x11dee4) {
    let _0x50b064 = null;
    try {
      let _0x5c3a04 = _0x31cbec.replace("//", "/").split("/")[1],
        _0x2cf074 = {
          "url": _0x31cbec,
          "headers": {
            "User-Agent": "Mozilla/5.0 (Linux; Android 13; M2012K11AC Build/TKQ1.220829.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.5304.141 Mobile Safari/537.36 XWEB/5127 MMWEBSDK/20230504 MMWEBID/1105 MicroMessenger/8.0.37.2380(0x2800255B) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
            "Host": _0x5c3a04,
            "Connection": "Keep-Alive",
            "Origin": "https://" + _0x5c3a04,
            "Authorization": this.activedAuthToken,
            "Referer": "https://www.qqkami.com/umobile/pages/Home/sign_in/sign_in",
            "Client_ip": this.ip,
            "X-forwarded-for": this.ip,
            "accept-language": "zh-CN:zh;q=0.9",
            "accept": "*/*"
          },
          "timeout": 60000
        };
      _0x11dee4 && (_0x2cf074.body = _0x11dee4, _0x2cf074.headers["content-length"] = _0x11dee4?.["length"], _0x2cf074.headers["Content-Type"] = "application/json");
      await httpRequest(_0x14c334, _0x2cf074).then(async _0x4fb40f => {
        _0x4fb40f.resp?.["statusCode"] == 200 ? _0x4fb40f.resp?.["body"] ? _0x50b064 = JSON.parse(_0x4fb40f.resp.body) : console.log("账号[" + this.index + "]调用" + _0x14c334 + "[" + _0x339def + "]出错，返回为空") : console.log("账号[" + this.index + "]调用" + _0x14c334 + "[" + _0x339def + "]出错，返回状态码[" + (_0x4fb40f.resp?.["statusCode"] || "") + "]");
      });
    } catch (_0x32b0b5) {
      console.log(_0x32b0b5);
    } finally {
      return Promise.resolve(_0x50b064);
    }
  }
  async ["Login"]() {
    try {
      {
        let _0x31be00 = "Login",
          _0x3d53e7 = "post",
          _0x28a0f3 = "https://www.qqkami.com/mobile/User/accountLogin",
          _0x36ee7f = "{\"mobile\":\"" + this.account + "\",\"password\":\"" + this.password + "\"}";
        await this.taskApi(_0x31be00, _0x3d53e7, _0x28a0f3, _0x36ee7f).then(async _0x520e18 => {
          if (_0x520e18.code === 200) this.valid = true, this.activedAuthToken = _0x520e18?.["data"]?.["token"], this.points = _0x520e18.data.income, console.log("账号[" + this.index + "] 登录成功");else {
            $.logAndNotify("账号[" + this.index + "]登录失败：" + _0x520e18.msg);
          }
        });
      }
    } catch (_0x49065c) {
      console.log(_0x49065c);
    } finally {
      return Promise.resolve(1);
    }
  }
  async ["GetUserBalance"]() {
    try {
      let _0x57bb0c = "GetUserBalance",
        _0x22e5da = "get",
        _0x50de32 = "https://www.qqkami.com/mobile/UserCenter/getInfo",
        _0x433551 = "";
      await this.taskApi(_0x57bb0c, _0x22e5da, _0x50de32, _0x433551).then(async _0x5347fb => {
        if (_0x5347fb.code === 200) {
          this.valid = true;
          this.points = _0x5347fb.data.income;
          console.log("账号[" + this.index + "] 当前佣金: " + this.points);
        } else {
          $.logAndNotify("账号[" + this.index + "]查询佣金失败，可能帐号无效");
        }
      });
    } catch (_0x52d760) {
      console.log(_0x52d760);
    } finally {
      return Promise.resolve(1);
    }
  }
  async ["SignInDaily"]() {
    try {
      let _0x1fd3c4 = "SignInDaily",
        _0x52354d = "post",
        _0x553bf1 = "https://www.qqkami.com/mobile/UserSign/sign",
        _0x50854a = "{}";
      await this.taskApi(_0x1fd3c4, _0x52354d, _0x553bf1, _0x50854a).then(async _0x36d6f8 => {
        {
          console.log("result:", _0x36d6f8);
          if (_0x36d6f8.code === 200) console.log("账号[" + this.index + "] 签到成功，得到了多少钱懒得查，你猜？等我钱够了再看看能不能增加自动提现，先这样吧");else {
            console.log("账号[" + this.index + "] 签到失败：" + _0x36d6f8?.["msg"]);
          }
        }
      });
    } catch (_0x5e2b62) {
      console.log(_0x5e2b62);
    } finally {
      return Promise.resolve(1);
    }
  }
  async ["doTask"]() {
    try {
      await waitSomeTime(1000);
      console.log("\n============= 账号[" + this.index + "] 开始签到=============");
      await this.SignInDaily();
    } catch (_0x53e322) {
      console.log(_0x53e322);
    }
  }
}
!(async () => {
  if (typeof $request !== "undefined") {
    await GetRewrite();
  } else {
    if (!(await checkEnv())) return;
    console.log("\n================ 开始执行 ================");
    for (let _0x1dd15c of initedJobForTokens) {
      console.log("----------- 执行 第 [" + _0x1dd15c.index + "] 个账号 -----------");
      _0x1dd15c.account && (await _0x1dd15c.Login());
      await _0x1dd15c.GetUserBalance();
    }
    let _0x12010f = initedJobForTokens.filter(_0x36450b => _0x36450b.valid);
    if (_0x12010f.length > 0) {
      console.log("\n================ 任务队列构建完毕 ================");
      for (let _0x30a1f1 of _0x12010f) {
        console.log("----------- 账号[" + _0x30a1f1.index + "] -----------");
        await _0x30a1f1.doTask();
      }
    } else console.log("\n================ 未检测到帐号，请先注册：https://www.qqkami.com?parent_code=917816 ================");
    await $.showmsg();
  }
})().catch(_0x6d06c2 => console.log(_0x6d06c2)).finally(() => $.done());
function isValidIP(_0x527f2a) {
  const _0x3d78a1 = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return _0x3d78a1.test(_0x527f2a);
}
function generateRandomIP(_0x3cd366 = true) {
  const _0x36687c = _0x3cd366 ? "1.1.1.1" : "0.0.0.0",
    _0x2a4761 = _0x3cd366 ? "223.255.255.255" : "255.255.255.255",
    _0x1ea1fa = _0x36687c.split(".").map(Number),
    _0x201ea0 = _0x2a4761.split(".").map(Number),
    _0xc707c6 = _0x1ea1fa.map((_0xb937ff, _0x5ce7b3) => {
      const _0x1066b6 = _0x201ea0[_0x5ce7b3];
      return Math.floor(Math.random() * (_0x1066b6 - _0xb937ff + 1)) + _0xb937ff;
    });
  return _0xc707c6.join(".");
}
function saveValueToFile(_0x41737a, _0x4237dd, _0x324624) {
  const _0x5a84f8 = {};
  _0x5a84f8[_0x4237dd] = _0x324624;
  const _0x3ac9f8 = JSON.stringify(_0x5a84f8);
  try {
    fs.writeFileSync(_0x41737a + ".json", _0x3ac9f8);
  } catch (_0x44781d) {
    _0x44781d.code === "ENOENT" ? fs.writeFileSync(_0x41737a + ".json", _0x3ac9f8) : console.error("保存文件时发生错误：", _0x44781d);
  }
}
function readValueFromFile(_0x14867e, _0x2a03bd) {
  try {
    {
      const _0x25b11b = fs.readFileSync(_0x14867e + ".json", "utf8"),
        _0x35d86a = JSON.parse(_0x25b11b);
      return _0x35d86a[_0x2a03bd];
    }
  } catch (_0x2f213e) {
    if (_0x2f213e.code === "ENOENT") return undefined;else {
      console.error("读取文件时发生错误：", _0x2f213e);
    }
  }
}
async function waitSomeTime(_0x15970 = 3000) {
  console.log("----------- 延迟 " + _0x15970 / 1000 + " s，请稍等 -----------");
  return await new Promise(_0x45b3bc => setTimeout(_0x45b3bc, _0x15970));
}
async function GetRewrite() {}
async function checkEnv() {
  if (authorizationToken) {
    let _0x16df9a = envSplitor[0];
    for (let _0x5e5133 of envSplitor) {
      if (authorizationToken.indexOf(_0x5e5133) > -1) {
        _0x16df9a = _0x5e5133;
        break;
      }
    }
    for (let _0x2e8d92 of authorizationToken.split(_0x16df9a)) {
      if (_0x2e8d92) initedJobForTokens.push(new JobTask(_0x2e8d92));
    }
    userCount = initedJobForTokens.length;
  } else {
    console.log("未找到 配置信息，请检查是否配置 变量：", envParams);
    return;
  }
  console.log("共找到" + userCount + "个账号");
  return true;
}
async function httpRequest(_0x3e5fe1, _0x53c55a) {
  httpErr = null;
  httpReq = null;
  httpResp = null;
  return new Promise(_0x42f16d => {
    $.send(_0x3e5fe1, _0x53c55a, async (_0x4d229d, _0x3540f2, _0x2197fb) => {
      httpErr = _0x4d229d;
      httpReq = _0x3540f2;
      httpResp = _0x2197fb;
      _0x42f16d({
        "err": _0x4d229d,
        "req": _0x3540f2,
        "resp": _0x2197fb
      });
    });
  });
}
function Env(_0x2e2edc, _0xaf9573) {
  "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
  return new class {
    constructor(_0x528d58, _0x5623ab) {
      this.name = _0x528d58;
      this.notifyStr = "";
      this.startTime = new Date().getTime();
      Object.assign(this, _0x5623ab);
      console.log(this.name + " 开始运行：\n");
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
    ["getdata"](_0x25b180) {
      {
        let _0x5620e7 = this.getval(_0x25b180);
        if (/^@/.test(_0x25b180)) {
          const [, _0x5829f2, _0x2ca6fa] = /^@(.*?)\.(.*?)$/.exec(_0x25b180),
            _0xa30f22 = _0x5829f2 ? this.getval(_0x5829f2) : "";
          if (_0xa30f22) try {
            const _0x1e06d2 = JSON.parse(_0xa30f22);
            _0x5620e7 = _0x1e06d2 ? this.lodash_get(_0x1e06d2, _0x2ca6fa, "") : _0x5620e7;
          } catch (_0x21c3e4) {
            _0x5620e7 = "";
          }
        }
        return _0x5620e7;
      }
    }
    ["setdata"](_0x3d493b, _0x538660) {
      let _0x35736f = false;
      if (/^@/.test(_0x538660)) {
        const [, _0x551cb4, _0x4cd412] = /^@(.*?)\.(.*?)$/.exec(_0x538660),
          _0x4ccf62 = this.getval(_0x551cb4),
          _0x1ab297 = _0x551cb4 ? "null" === _0x4ccf62 ? null : _0x4ccf62 || "{}" : "{}";
        try {
          const _0x4555ad = JSON.parse(_0x1ab297);
          this.lodash_set(_0x4555ad, _0x4cd412, _0x3d493b);
          _0x35736f = this.setval(JSON.stringify(_0x4555ad), _0x551cb4);
        } catch (_0x482b16) {
          const _0x147fe0 = {};
          this.lodash_set(_0x147fe0, _0x4cd412, _0x3d493b);
          _0x35736f = this.setval(JSON.stringify(_0x147fe0), _0x551cb4);
        }
      } else _0x35736f = this.setval(_0x3d493b, _0x538660);
      return _0x35736f;
    }
    ["getval"](_0x2ef2c9) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(_0x2ef2c9) : this.isQuanX() ? $prefs.valueForKey(_0x2ef2c9) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x2ef2c9]) : this.data && this.data[_0x2ef2c9] || null;
    }
    ["setval"](_0x356d42, _0x313ffe) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(_0x356d42, _0x313ffe) : this.isQuanX() ? $prefs.setValueForKey(_0x356d42, _0x313ffe) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x313ffe] = _0x356d42, this.writedata(), true) : this.data && this.data[_0x313ffe] || null;
    }
    ["send"](_0x2dc029, _0x4d5c7, _0x41f8d2 = () => {}) {
      if (_0x2dc029 != "get" && _0x2dc029 != "post" && _0x2dc029 != "put" && _0x2dc029 != "delete") {
        console.log("无效的http方法：" + _0x2dc029);
        return;
      }
      if (_0x2dc029 == "get" && _0x4d5c7.headers) delete _0x4d5c7.headers["Content-Type"], delete _0x4d5c7.headers["Content-Length"];else {
        if (_0x4d5c7.body && _0x4d5c7.headers) {
          {
            if (!_0x4d5c7.headers["Content-Type"]) _0x4d5c7.headers["Content-Type"] = "application/x-www-form-urlencoded";
          }
        }
      }
      if (this.isSurge() || this.isLoon()) {
        this.isSurge() && this.isNeedRewrite && (_0x4d5c7.headers = _0x4d5c7.headers || {}, Object.assign(_0x4d5c7.headers, {
          "X-Surge-Skip-Scripting": false
        }));
        let _0x21d29c = {
          "method": _0x2dc029,
          "url": _0x4d5c7.url,
          "headers": _0x4d5c7.headers,
          "timeout": _0x4d5c7.timeout,
          "data": _0x4d5c7.body
        };
        if (_0x2dc029 == "get") delete _0x21d29c.data;
        $axios(_0x21d29c).then(_0x4c56df => {
          {
            const {
              status: _0x85b449,
              request: _0x17bc19,
              headers: _0x1002a0,
              data: _0x1ed5b9
            } = _0x4c56df;
            _0x41f8d2(null, _0x17bc19, {
              "statusCode": _0x85b449,
              "headers": _0x1002a0,
              "body": _0x1ed5b9
            });
          }
        }).catch(_0x102b4f => console.log(_0x102b4f));
      } else {
        if (this.isQuanX()) {
          _0x4d5c7.method = _0x2dc029.toUpperCase();
          this.isNeedRewrite && (_0x4d5c7.opts = _0x4d5c7.opts || {}, Object.assign(_0x4d5c7.opts, {
            "hints": false
          }));
          $task.fetch(_0x4d5c7).then(_0x1e60d1 => {
            const {
              statusCode: _0x4ad189,
              request: _0x5e1c4b,
              headers: _0x56d9ea,
              body: _0xcb2776
            } = _0x1e60d1;
            _0x41f8d2(null, _0x5e1c4b, {
              "statusCode": _0x4ad189,
              "headers": _0x56d9ea,
              "body": _0xcb2776
            });
          }, _0x836de0 => _0x41f8d2(_0x836de0));
        } else {
          if (this.isNode()) {
            {
              this.got = this.got ? this.got : require("got");
              const {
                url: _0x27d2c1,
                ..._0x3afab2
              } = _0x4d5c7;
              this.instance = this.got.extend({
                "followRedirect": false
              });
              this.instance[_0x2dc029](_0x27d2c1, _0x3afab2).then(_0x4edbfb => {
                const {
                  statusCode: _0x551862,
                  request: _0xd5dcf7,
                  headers: _0x6c6cb5,
                  body: _0x2804b4
                } = _0x4edbfb;
                _0x41f8d2(null, _0xd5dcf7, {
                  "statusCode": _0x551862,
                  "headers": _0x6c6cb5,
                  "body": _0x2804b4
                });
              }, _0x27d7c5 => {
                {
                  const {
                    message: _0x5005b1,
                    request: _0x55c246,
                    response: _0x5aa1d1
                  } = _0x27d7c5;
                  _0x41f8d2(_0x5005b1, _0x55c246, _0x5aa1d1);
                }
              });
            }
          }
        }
      }
    }
    ["time"](_0x462247, _0x51c3c0 = null) {
      {
        let _0x3eae05 = _0x51c3c0 ? new Date(_0x51c3c0) : new Date(),
          _0x5c7045 = {
            "M+": _0x3eae05.getMonth() + 1,
            "d+": _0x3eae05.getDate(),
            "h+": _0x3eae05.getHours(),
            "m+": _0x3eae05.getMinutes(),
            "s+": _0x3eae05.getSeconds(),
            "q+": Math.floor((_0x3eae05.getMonth() + 3) / 3),
            "S": _0x3eae05.getMilliseconds()
          };
        /(y+)/.test(_0x462247) && (_0x462247 = _0x462247.replace(RegExp.$1, (_0x3eae05.getFullYear() + "").substr(4 - RegExp.$1.length)));
        for (let _0xe1640f in _0x5c7045) new RegExp("(" + _0xe1640f + ")").test(_0x462247) && (_0x462247 = _0x462247.replace(RegExp.$1, 1 == RegExp.$1.length ? _0x5c7045[_0xe1640f] : ("00" + _0x5c7045[_0xe1640f]).substr(("" + _0x5c7045[_0xe1640f]).length)));
        return _0x462247;
      }
    }
    async ["showmsg"]() {
      {
        if (!this.notifyStr) return;
        let _0x1b7e91 = this.name + " 运行通知\n\n" + this.notifyStr;
        if ($.isNode()) {
          {
            var _0x41833d = require("./sendNotify");
            console.log("\n============== 推送 ==============");
            await _0x41833d.sendNotify(this.name, _0x1b7e91);
          }
        } else this.msg(_0x1b7e91);
      }
    }
    ["logAndNotify"](_0x488913) {
      console.log(_0x488913);
      this.notifyStr += _0x488913;
      this.notifyStr += "\n";
    }
    ["logAndNotifyWithTime"](_0x1ba822) {
      {
        let _0xb80445 = "[" + this.time("hh:mm:ss.S") + "]" + _0x1ba822;
        console.log(_0xb80445);
        this.notifyStr += _0xb80445;
        this.notifyStr += "\n";
      }
    }
    ["logWithTime"](_0x5ea8c9) {
      console.log("[" + this.time("hh:mm:ss.S") + "]" + _0x5ea8c9);
    }
    ["msg"](_0x2e5f95 = t, _0x12dfda = "", _0x3efdde = "", _0x457114) {
      {
        const _0x5ec49d = _0x39e5c4 => {
          {
            if (!_0x39e5c4) return _0x39e5c4;
            if ("string" == typeof _0x39e5c4) return this.isLoon() ? _0x39e5c4 : this.isQuanX() ? {
              "open-url": _0x39e5c4
            } : this.isSurge() ? {
              "url": _0x39e5c4
            } : undefined;
            if ("object" == typeof _0x39e5c4) {
              {
                if (this.isLoon()) {
                  {
                    let _0x5997fa = _0x39e5c4.openUrl || _0x39e5c4.url || _0x39e5c4["open-url"],
                      _0x546a40 = _0x39e5c4.mediaUrl || _0x39e5c4["media-url"];
                    return {
                      "openUrl": _0x5997fa,
                      "mediaUrl": _0x546a40
                    };
                  }
                }
                if (this.isQuanX()) {
                  let _0x1687ce = _0x39e5c4["open-url"] || _0x39e5c4.url || _0x39e5c4.openUrl,
                    _0x4b6a40 = _0x39e5c4["media-url"] || _0x39e5c4.mediaUrl;
                  return {
                    "open-url": _0x1687ce,
                    "media-url": _0x4b6a40
                  };
                }
                if (this.isSurge()) {
                  let _0x2dbe0d = _0x39e5c4.url || _0x39e5c4.openUrl || _0x39e5c4["open-url"];
                  return {
                    "url": _0x2dbe0d
                  };
                }
              }
            }
          }
        };
        this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(_0x2e5f95, _0x12dfda, _0x3efdde, _0x5ec49d(_0x457114)) : this.isQuanX() && $notify(_0x2e5f95, _0x12dfda, _0x3efdde, _0x5ec49d(_0x457114)));
        let _0x3d2a40 = ["", "============== 系统通知 =============="];
        _0x3d2a40.push(_0x2e5f95);
        _0x12dfda && _0x3d2a40.push(_0x12dfda);
        _0x3efdde && _0x3d2a40.push(_0x3efdde);
        console.log(_0x3d2a40.join("\n"));
      }
    }
    ["getMin"](_0x589a0b, _0x40bd64) {
      return _0x589a0b < _0x40bd64 ? _0x589a0b : _0x40bd64;
    }
    ["getMax"](_0x2d827a, _0x33778b) {
      return _0x2d827a < _0x33778b ? _0x33778b : _0x2d827a;
    }
    ["padStr"](_0x4d7afa, _0xcce158, _0x26b4c9 = "0") {
      {
        let _0x4045e2 = String(_0x4d7afa),
          _0x3d1754 = _0xcce158 > _0x4045e2.length ? _0xcce158 - _0x4045e2.length : 0,
          _0x58e6ea = "";
        for (let _0x131d77 = 0; _0x131d77 < _0x3d1754; _0x131d77++) {
          _0x58e6ea += _0x26b4c9;
        }
        _0x58e6ea += _0x4045e2;
        return _0x58e6ea;
      }
    }
    ["json2str"](_0x2ff6ea, _0x3c3183, _0x3ceb0c = false) {
      {
        let _0x5c7ce3 = [];
        for (let _0xc8c555 of Object.keys(_0x2ff6ea).sort()) {
          let _0x2e9ea8 = _0x2ff6ea[_0xc8c555];
          if (_0x2e9ea8 && _0x3ceb0c) _0x2e9ea8 = encodeURIComponent(_0x2e9ea8);
          _0x5c7ce3.push(_0xc8c555 + "=" + _0x2e9ea8);
        }
        return _0x5c7ce3.join(_0x3c3183);
      }
    }
    ["str2json"](_0x3c6807, _0x1987d9 = false) {
      {
        let _0x51c564 = {};
        for (let _0x3c3447 of _0x3c6807.split("&")) {
          if (!_0x3c3447) continue;
          let _0x537abe = _0x3c3447.indexOf("=");
          if (_0x537abe == -1) continue;
          let _0x4d62ae = _0x3c3447.substr(0, _0x537abe),
            _0x1bf54f = _0x3c3447.substr(_0x537abe + 1);
          if (_0x1987d9) _0x1bf54f = decodeURIComponent(_0x1bf54f);
          _0x51c564[_0x4d62ae] = _0x1bf54f;
        }
        return _0x51c564;
      }
    }
    ["randomString"](_0x136e7d, _0xd4496c = "abcdef0123456789") {
      {
        let _0x50cf7e = "";
        for (let _0x32cdcb = 0; _0x32cdcb < _0x136e7d; _0x32cdcb++) {
          _0x50cf7e += _0xd4496c.charAt(Math.floor(Math.random() * _0xd4496c.length));
        }
        return _0x50cf7e;
      }
    }
    ["randomList"](_0x786fb7) {
      let _0x11fea2 = Math.floor(Math.random() * _0x786fb7.length);
      return _0x786fb7[_0x11fea2];
    }
    ["wait"](_0x41e8e8) {
      return new Promise(_0x2b9afb => setTimeout(_0x2b9afb, _0x41e8e8));
    }
    ["done"](_0x42ad6d = {}) {
      const _0x2075ca = new Date().getTime(),
        _0x5cd3f6 = (_0x2075ca - this.startTime) / 1000;
      console.log("\n" + this.name + " 运行结束，共运行了 " + _0x5cd3f6 + " 秒！");
      if (this.isSurge() || this.isQuanX() || this.isLoon()) $done(_0x42ad6d);
    }
  }(_0x2e2edc, _0xaf9573);
}