/**
 * 植白说v1.0
 * const $ = new Env("植白说");
 * cron 10 6,15 * * * 植白说.js
 * 
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export zbsxcx='X-Dts-Token'

 * 抓包请求 https://zbs.20171026.com/demo/取出X-Dts-Token

 * 多账号换行、@ 或 & 隔开
 * 说明：根据群友Maric提示恢复脚本，貌似是随着时间token有效期会越来越长
 * 奖励：签到/分享 牛奶活动
 * 注册入口：#小程序://植白说/cIiT4iMItmJ1EZi
 * ====================================
 *   
 */
//Sat Jan 25 2025 08:30:22 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const _0x3065e9 = new _0x14a79b("植白说");
let _0x594a0a = "zbsxcx",
  _0x1ad327 = ["\n", "&", "@"],
  _0x5d9ea2 = (_0x3065e9.isNode() ? process.env[_0x594a0a] : _0x3065e9.getdata(_0x594a0a)) || "",
  _0x23139a = [],
  _0x5845aa = 0;
class _0x4f7def {
  constructor(_0x44f7e1) {
    this.index = ++_0x5845aa;
    this.valid = false;
    this.activedAuthToken = _0x44f7e1;
  }
  async ["taskApi"](_0x8df8fd, _0x52db04, _0x5ede90, _0x1961e6) {
    let _0x11a1db = null;
    try {
      let _0x19ca83 = {
        "url": _0x5ede90,
        "headers": {
          "X-DTS-Token": this.activedAuthToken,
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF XWEB/8237",
          "xweb_xhr": "1"
        },
        "timeout": 60000,
        "rejectUnauthorized": false
      };
      if (_0x1961e6) {
        _0x19ca83.body = _0x1961e6;
        _0x19ca83.headers["Content-Length"] = _0x1961e6?.["length"];
      }
      await _0x2ef80e(_0x52db04, _0x19ca83).then(async _0xe0f650 => {
        {
          if (_0xe0f650.resp?.["statusCode"] == 200) {
            if (_0xe0f650.resp?.["body"]) _0x11a1db = JSON.parse(_0xe0f650.resp.body);else {}
          } else console.log("账号[" + this.index + "]调用" + _0x52db04 + "[" + _0x8df8fd + "]出错，返回状态码[" + (_0xe0f650.resp?.["statusCode"] || "") + "]", "返回结果：", _0xe0f650.resp?.["body"]);
        }
      });
    } catch (_0x4fad44) {
      console.log(_0x4fad44);
    } finally {
      return Promise.resolve(_0x11a1db);
    }
  }
  async ["Sign"]() {
    try {
      {
        let _0x4a533a = "Sign",
          _0x420ae1 = "get",
          _0x1fbcef = "https://zbs.20171026.com/demo/wx/home/signDay",
          _0x1c108f = "";
        return await this.taskApi(_0x4a533a, _0x420ae1, _0x1fbcef, _0x1c108f).then(async _0x136d6b => {
          {
            if (_0x136d6b?.["errno"] === 0) return console.log("账号[" + this.index + "] 签到成功，签到次数：" + _0x136d6b?.["data"]?.["signCount"] + "，积分余额： " + _0x136d6b?.["data"]?.["integral"]), this.valid = true, true;else _0x3065e9.logAndNotify("账号[" + this.index + "] - 积分签到失败：" + (_0x136d6b?.["errmsg"] || JSON.stringify(_0x136d6b))), this.valid = false;
          }
        });
      }
    } catch (_0x396548) {
      console.log(_0x396548);
    }
  }
  async ["Share"]() {
    try {
      let _0x33e5b6 = "Share",
        _0x2bff16 = "get",
        _0x3f4521 = "https://zbs.20171026.com/demo/wx/user/addIntegralByShare",
        _0x4d3189 = "";
      return await this.taskApi(_0x33e5b6, _0x2bff16, _0x3f4521, _0x4d3189).then(async _0x5d0bf3 => {
        {
          if (_0x5d0bf3?.["errno"] === 0) {
            console.log("账号[" + this.index + "] 分享成功，增加 1 积分");
            return true;
          } else {
            _0x3065e9.logAndNotify("账号[" + this.index + "] - 分享失败：" + (_0x5d0bf3?.["errmsg"] || JSON.stringify(_0x5d0bf3)));
          }
        }
      });
    } catch (_0x1f98fa) {
      console.log(_0x1f98fa);
    }
  }
  async ["doTask"]() {
    try {
      console.log("\n============= 账号[" + this.index + "] 开始执行 分享任务=============");
      await _0x3065e9.wait(Math.random() * 200);
      for (let _0x50253a = 0; _0x50253a < 3; _0x50253a++) {
        await this.Share();
        await _0x3065e9.wait(Math.random() * 1000);
      }
    } catch (_0x2b25f0) {
      console.log(_0x2b25f0);
    }
  }
}
!(async () => {
  if (typeof $request !== "undefined") await _0x1b91d9();else {
    if (!(await _0x2f2542())) return;
    console.log("\n================ 开始执行 ================");
    for (let _0x19ed95 of _0x23139a) {
      console.log("----------- 执行 第 [" + _0x19ed95.index + "] 个账号 -----------");
      await _0x19ed95.Sign();
      await _0x3065e9.wait(Math.random() * 200);
    }
    let _0x7fb3c1 = _0x23139a.filter(_0x2bd556 => _0x2bd556.valid);
    if (_0x7fb3c1.length > 0) {
      console.log("\n================ 任务队列构建完毕 ================");
      for (let _0x249a61 of _0x7fb3c1) {
        console.log("----------- 账号[" + _0x249a61.index + "] -----------");
        await _0x249a61.doTask();
      }
    } else {
      console.log("\n====幻生提示：无可用账号，请检查配置============ 任务结束 ================");
    }
    await _0x3065e9.showmsg();
  }
})().catch(_0x3de5ae => console.log(_0x3de5ae)).finally(() => _0x3065e9.done());
async function _0x1b91d9() {}
async function _0x2f2542() {
  if (_0x5d9ea2) {
    {
      let _0x506c52 = _0x1ad327[0];
      for (let _0x16a0d0 of _0x1ad327) {
        if (_0x5d9ea2.indexOf(_0x16a0d0) > -1) {
          {
            _0x506c52 = _0x16a0d0;
            break;
          }
        }
      }
      for (let _0x2460f4 of _0x5d9ea2.split(_0x506c52)) {
        {
          if (_0x2460f4) _0x23139a.push(new _0x4f7def(_0x2460f4));
        }
      }
      userCount = _0x23139a.length;
    }
  } else {
    console.log("未找到 配置信息，请检查是否配置 变量：", _0x594a0a);
    return;
  }
  console.log("共找到" + userCount + "个账号");
  return true;
}
async function _0x2ef80e(_0x22e525, _0xf7da77) {
  httpErr = null;
  httpReq = null;
  httpResp = null;
  return new Promise(_0x1e7c15 => {
    _0x3065e9.send(_0x22e525, _0xf7da77, async (_0x1a63ab, _0x304b42, _0x47c7a2) => {
      httpErr = _0x1a63ab;
      httpReq = _0x304b42;
      httpResp = _0x47c7a2;
      _0x1e7c15({
        "err": _0x1a63ab,
        "req": _0x304b42,
        "resp": _0x47c7a2
      });
    });
  });
}
function _0x14a79b(_0x4038d3, _0x4c648e) {
  "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
  return new class {
    constructor(_0xc41156, _0x297ded) {
      this.name = _0xc41156;
      this.notifyStr = "";
      this.startTime = new Date().getTime();
      Object.assign(this, _0x297ded);
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
    ["getdata"](_0x1c89dc) {
      let _0x5f3c83 = this.getval(_0x1c89dc);
      if (/^@/.test(_0x1c89dc)) {
        const [, _0x4b7142, _0x5ba969] = /^@(.*?)\.(.*?)$/.exec(_0x1c89dc),
          _0x45f3e6 = _0x4b7142 ? this.getval(_0x4b7142) : "";
        if (_0x45f3e6) try {
          const _0x1de99b = JSON.parse(_0x45f3e6);
          _0x5f3c83 = _0x1de99b ? this.lodash_get(_0x1de99b, _0x5ba969, "") : _0x5f3c83;
        } catch (_0xb8b62e) {
          _0x5f3c83 = "";
        }
      }
      return _0x5f3c83;
    }
    ["setdata"](_0x90cff, _0x59643e) {
      {
        let _0x28ca60 = false;
        if (/^@/.test(_0x59643e)) {
          const [, _0x38c422, _0x26c375] = /^@(.*?)\.(.*?)$/.exec(_0x59643e),
            _0x14a0cc = this.getval(_0x38c422),
            _0x10f203 = _0x38c422 ? "null" === _0x14a0cc ? null : _0x14a0cc || "{}" : "{}";
          try {
            const _0x1b9f14 = JSON.parse(_0x10f203);
            this.lodash_set(_0x1b9f14, _0x26c375, _0x90cff);
            _0x28ca60 = this.setval(JSON.stringify(_0x1b9f14), _0x38c422);
          } catch (_0x4ce4bd) {
            const _0x4defda = {};
            this.lodash_set(_0x4defda, _0x26c375, _0x90cff);
            _0x28ca60 = this.setval(JSON.stringify(_0x4defda), _0x38c422);
          }
        } else {
          _0x28ca60 = this.setval(_0x90cff, _0x59643e);
        }
        return _0x28ca60;
      }
    }
    ["getval"](_0x4e2aac) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(_0x4e2aac) : this.isQuanX() ? $prefs.valueForKey(_0x4e2aac) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x4e2aac]) : this.data && this.data[_0x4e2aac] || null;
    }
    ["setval"](_0x4901e5, _0xdb3502) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(_0x4901e5, _0xdb3502) : this.isQuanX() ? $prefs.setValueForKey(_0x4901e5, _0xdb3502) : this.isNode() ? (this.data = this.loaddata(), this.data[_0xdb3502] = _0x4901e5, this.writedata(), true) : this.data && this.data[_0xdb3502] || null;
    }
    ["send"](_0x528a53, _0x1062b7, _0x3a681d = () => {}) {
      {
        if (_0x528a53 != "get" && _0x528a53 != "post" && _0x528a53 != "put" && _0x528a53 != "delete") {
          console.log("无效的http方法：" + _0x528a53);
          return;
        }
        if (_0x528a53 == "get" && _0x1062b7.headers) delete _0x1062b7.headers["Content-Type"], delete _0x1062b7.headers["Content-Length"];else {
          if (_0x1062b7.body && _0x1062b7.headers) {
            {
              if (!_0x1062b7.headers["Content-Type"]) _0x1062b7.headers["Content-Type"] = "application/x-www-form-urlencoded";
            }
          }
        }
        if (this.isSurge() || this.isLoon()) {
          this.isSurge() && this.isNeedRewrite && (_0x1062b7.headers = _0x1062b7.headers || {}, Object.assign(_0x1062b7.headers, {
            "X-Surge-Skip-Scripting": false
          }));
          let _0x55f76d = {
            "method": _0x528a53,
            "url": _0x1062b7.url,
            "headers": _0x1062b7.headers,
            "timeout": _0x1062b7.timeout,
            "data": _0x1062b7.body
          };
          if (_0x528a53 == "get") delete _0x55f76d.data;
          $axios(_0x55f76d).then(_0x3f3966 => {
            const {
              status: _0x29a846,
              request: _0x2ad2aa,
              headers: _0x5cc4bd,
              data: _0x161f35
            } = _0x3f3966;
            _0x3a681d(null, _0x2ad2aa, {
              "statusCode": _0x29a846,
              "headers": _0x5cc4bd,
              "body": _0x161f35
            });
          }).catch(_0x238377 => console.log(_0x238377));
        } else {
          if (this.isQuanX()) _0x1062b7.method = _0x528a53.toUpperCase(), this.isNeedRewrite && (_0x1062b7.opts = _0x1062b7.opts || {}, Object.assign(_0x1062b7.opts, {
            "hints": false
          })), $task.fetch(_0x1062b7).then(_0x3b8bbe => {
            const {
              statusCode: _0x2fc1ac,
              request: _0x5f6740,
              headers: _0x34d4ad,
              body: _0x37fbc7
            } = _0x3b8bbe;
            _0x3a681d(null, _0x5f6740, {
              "statusCode": _0x2fc1ac,
              "headers": _0x34d4ad,
              "body": _0x37fbc7
            });
          }, _0x361920 => _0x3a681d(_0x361920));else {
            if (this.isNode()) {
              this.got = this.got ? this.got : require("got");
              const {
                url: _0x325d9c,
                ..._0xf7af76
              } = _0x1062b7;
              this.instance = this.got.extend({
                "followRedirect": false
              });
              this.instance[_0x528a53](_0x325d9c, _0xf7af76).then(_0x18383d => {
                const {
                  statusCode: _0xf07db0,
                  request: _0x532d1a,
                  headers: _0x1dc0d4,
                  body: _0x4984e8
                } = _0x18383d;
                _0x3a681d(null, _0x532d1a, {
                  "statusCode": _0xf07db0,
                  "headers": _0x1dc0d4,
                  "body": _0x4984e8
                });
              }, _0x2e49ed => {
                const {
                  message: _0x2df36f,
                  request: _0x5340cf,
                  response: _0xdeebdf
                } = _0x2e49ed;
                _0x3a681d(_0x2df36f, _0x5340cf, _0xdeebdf);
              });
            }
          }
        }
      }
    }
    ["time"](_0x4ddd19, _0x3d004a = null) {
      {
        let _0x3d0303 = _0x3d004a ? new Date(_0x3d004a) : new Date(),
          _0x1c5845 = {
            "M+": _0x3d0303.getMonth() + 1,
            "d+": _0x3d0303.getDate(),
            "h+": _0x3d0303.getHours(),
            "m+": _0x3d0303.getMinutes(),
            "s+": _0x3d0303.getSeconds(),
            "q+": Math.floor((_0x3d0303.getMonth() + 3) / 3),
            "S": _0x3d0303.getMilliseconds()
          };
        /(y+)/.test(_0x4ddd19) && (_0x4ddd19 = _0x4ddd19.replace(RegExp.$1, (_0x3d0303.getFullYear() + "").substr(4 - RegExp.$1.length)));
        for (let _0x4df8e7 in _0x1c5845) new RegExp("(" + _0x4df8e7 + ")").test(_0x4ddd19) && (_0x4ddd19 = _0x4ddd19.replace(RegExp.$1, 1 == RegExp.$1.length ? _0x1c5845[_0x4df8e7] : ("00" + _0x1c5845[_0x4df8e7]).substr(("" + _0x1c5845[_0x4df8e7]).length)));
        return _0x4ddd19;
      }
    }
    async ["showmsg"]() {
      {
        if (!this.notifyStr) return;
        let _0x3d3a83 = this.name + " 运行通知\n\n" + this.notifyStr;
        if (_0x3065e9.isNode()) {
          {
            var _0x3a245e = require("./sendNotify");
            console.log("\n============== 推送 ==============");
            await _0x3a245e.sendNotify(this.name, _0x3d3a83);
          }
        } else this.msg(_0x3d3a83);
      }
    }
    ["logAndNotify"](_0x58012f) {
      console.log(_0x58012f);
      this.notifyStr += _0x58012f;
      this.notifyStr += "\n";
    }
    ["logAndNotifyWithTime"](_0xeaf4b1) {
      let _0x414567 = "[" + this.time("hh:mm:ss.S") + "]" + _0xeaf4b1;
      console.log(_0x414567);
      this.notifyStr += _0x414567;
      this.notifyStr += "\n";
    }
    ["logWithTime"](_0x5291da) {
      console.log("[" + this.time("hh:mm:ss.S") + "]" + _0x5291da);
    }
    ["msg"](_0x51fea4 = t, _0x215cb5 = "", _0x474402 = "", _0x42a5dd) {
      const _0x3d6f7a = _0x163e67 => {
        {
          if (!_0x163e67) return _0x163e67;
          if ("string" == typeof _0x163e67) return this.isLoon() ? _0x163e67 : this.isQuanX() ? {
            "open-url": _0x163e67
          } : this.isSurge() ? {
            "url": _0x163e67
          } : undefined;
          if ("object" == typeof _0x163e67) {
            if (this.isLoon()) {
              let _0x2d5c4a = _0x163e67.openUrl || _0x163e67.url || _0x163e67["open-url"],
                _0x12a18e = _0x163e67.mediaUrl || _0x163e67["media-url"];
              return {
                "openUrl": _0x2d5c4a,
                "mediaUrl": _0x12a18e
              };
            }
            if (this.isQuanX()) {
              let _0x1e62a6 = _0x163e67["open-url"] || _0x163e67.url || _0x163e67.openUrl,
                _0x5c34e8 = _0x163e67["media-url"] || _0x163e67.mediaUrl;
              return {
                "open-url": _0x1e62a6,
                "media-url": _0x5c34e8
              };
            }
            if (this.isSurge()) {
              let _0x178770 = _0x163e67.url || _0x163e67.openUrl || _0x163e67["open-url"];
              return {
                "url": _0x178770
              };
            }
          }
        }
      };
      this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(_0x51fea4, _0x215cb5, _0x474402, _0x3d6f7a(_0x42a5dd)) : this.isQuanX() && $notify(_0x51fea4, _0x215cb5, _0x474402, _0x3d6f7a(_0x42a5dd)));
      let _0x15ca2e = ["", "============== 系统通知 =============="];
      _0x15ca2e.push(_0x51fea4);
      _0x215cb5 && _0x15ca2e.push(_0x215cb5);
      _0x474402 && _0x15ca2e.push(_0x474402);
      console.log(_0x15ca2e.join("\n"));
    }
    ["getMin"](_0x434bc7, _0x32c083) {
      return _0x434bc7 < _0x32c083 ? _0x434bc7 : _0x32c083;
    }
    ["getMax"](_0x4d3798, _0x166dff) {
      return _0x4d3798 < _0x166dff ? _0x166dff : _0x4d3798;
    }
    ["padStr"](_0x163393, _0x4fb87b, _0x56aecc = "0") {
      {
        let _0x5cdeb2 = String(_0x163393),
          _0xd26033 = _0x4fb87b > _0x5cdeb2.length ? _0x4fb87b - _0x5cdeb2.length : 0,
          _0x111cf7 = "";
        for (let _0x5ebe0b = 0; _0x5ebe0b < _0xd26033; _0x5ebe0b++) {
          _0x111cf7 += _0x56aecc;
        }
        _0x111cf7 += _0x5cdeb2;
        return _0x111cf7;
      }
    }
    ["json2str"](_0x5eff15, _0x47bb6a, _0x2a6962 = false) {
      let _0x59e08a = [];
      for (let _0x4817da of Object.keys(_0x5eff15).sort()) {
        {
          let _0xf5e3d8 = _0x5eff15[_0x4817da];
          if (_0xf5e3d8 && _0x2a6962) _0xf5e3d8 = encodeURIComponent(_0xf5e3d8);
          _0x59e08a.push(_0x4817da + "=" + _0xf5e3d8);
        }
      }
      return _0x59e08a.join(_0x47bb6a);
    }
    ["str2json"](_0x31a48d, _0x36c2e8 = false) {
      let _0x2cde0e = {};
      for (let _0x5b6e8d of _0x31a48d.split("&")) {
        if (!_0x5b6e8d) continue;
        let _0x5742d9 = _0x5b6e8d.indexOf("=");
        if (_0x5742d9 == -1) continue;
        let _0x2f6ff9 = _0x5b6e8d.substr(0, _0x5742d9),
          _0x2f8540 = _0x5b6e8d.substr(_0x5742d9 + 1);
        if (_0x36c2e8) _0x2f8540 = decodeURIComponent(_0x2f8540);
        _0x2cde0e[_0x2f6ff9] = _0x2f8540;
      }
      return _0x2cde0e;
    }
    ["randomString"](_0x1826b2, _0x2926dc = "abcdef0123456789") {
      let _0x11a90c = "";
      for (let _0x1ed771 = 0; _0x1ed771 < _0x1826b2; _0x1ed771++) {
        _0x11a90c += _0x2926dc.charAt(Math.floor(Math.random() * _0x2926dc.length));
      }
      return _0x11a90c;
    }
    ["randomList"](_0x3808ec) {
      let _0x129ec9 = Math.floor(Math.random() * _0x3808ec.length);
      return _0x3808ec[_0x129ec9];
    }
    ["wait"](_0x41414e) {
      return new Promise(_0x310013 => setTimeout(_0x310013, _0x41414e));
    }
    ["done"](_0x5aad77 = {}) {
      const _0x2634cb = new Date().getTime(),
        _0x53d433 = (_0x2634cb - this.startTime) / 1000;
      console.log("\n" + this.name + " 运行结束，共运行了 " + _0x53d433 + " 秒！");
      if (this.isSurge() || this.isQuanX() || this.isLoon()) $done(_0x5aad77);
    }
  }(_0x4038d3, _0x4c648e);
}