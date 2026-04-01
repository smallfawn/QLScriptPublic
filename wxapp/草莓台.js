/**
 * 草莓台小程序签到v0.03
 * cron 10 12 * * *  草莓台.js
 * 
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export caomeitai_token='你抓包的openid#你的userId'

 * 自己抓包协议头上的Cookie

 * 多账号换行或&隔开

 * 奖励：签到草莓币
 * const $ = new Env("草莓台")
 * ====================================
 *   
 */
//Sat Jan 25 2025 08:33:12 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const $ = new Env("草莓台小程序签到");
let envParams = "caomeitai_token",
  envSplitor = ["\n", "&"],
  authorizationToken = ($.isNode() ? process.env[envParams] : $.getdata(envParams)) || "",
  initedJobForTokens = [],
  currentUserIndex = 0;
class JobTask {
  constructor(_0x2a8b2b) {
    this.index = ++currentUserIndex;
    this.points = 0;
    this.valid = false;
    this.userId = "";
    [this.openid, this.userId] = _0x2a8b2b?.["split"]("#");
    this.activedAuthToken = "";
  }
  async ["taskApi"](_0x47ec4f, _0x4e5aeb, _0x574064, _0x2d47eb) {
    let _0x4541cc = null;
    try {
      {
        let _0x12da9e = {
          "url": _0x574064,
          "headers": {
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "Host": "cmtv.xmay.cc",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "referer": "https://servicewechat.com/wxc2a56f3a7492b8c4/145/page-frame.html",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF XWEB/6945",
            "xweb_xhr": "1"
          },
          "timeout": 60000
        };
        this.activedAuthToken && (_0x12da9e.headers.Authorization = "Bearer " + this.activedAuthToken);
        if (_0x2d47eb) {
          _0x12da9e.body = _0x2d47eb;
          _0x12da9e.headers["Content-Length"] = _0x2d47eb?.["length"];
        }
        await httpRequest(_0x4e5aeb, _0x12da9e).then(async _0x5cd31a => {
          {
            if (_0x5cd31a.resp?.["statusCode"] == 200) {
              if (_0x5cd31a.resp?.["body"]) _0x4541cc = JSON.parse(_0x5cd31a.resp.body);else {}
            } else console.log("账号[" + this.index + "]调用" + _0x4e5aeb + "[" + _0x47ec4f + "]出错，返回状态码[" + (_0x5cd31a.resp?.["statusCode"] || "") + "]", "返回结果：", _0x5cd31a.resp?.["body"]);
          }
        });
      }
    } catch (_0x24afeb) {
      console.log(_0x24afeb);
    } finally {
      return Promise.resolve(_0x4541cc);
    }
  }
  async ["LoginIn"]() {
    try {
      let _0x329bf1 = "LoginIn",
        _0x168fa7 = "post",
        _0x13d94a = "https://cmtv.xmay.cc/api/WX/login2",
        _0x444be0 = "{\"id\":\"" + this.userId + "\",\"openid\":\"" + this.openid + "\"}";
      await this.taskApi(_0x329bf1, _0x168fa7, _0x13d94a, _0x444be0).then(async _0x257d58 => {
        {
          if (_0x257d58?.["token"]) {
            this.activedAuthToken = _0x257d58?.["token"];
            this.valid = true;
            this.points = _0x257d58?.["user"]["chbeanNum"] / 100;
            this.userId = _0x257d58?.["user"]["id"];
            console.log("账号[" + this.index + "] 登录成功，昵称：" + _0x257d58?.["user"]["nickname"] + "，草莓币：" + _0x257d58?.["user"]["chbeanNum"] / 100);
          } else console.log("账号[" + this.index + "] 登录失败", _0x257d58), this.valid = false;
        }
      });
    } catch (_0x28cd9b) {
      console.log(_0x28cd9b);
    } finally {
      return Promise.resolve(1);
    }
  }
  async ["GetUserTask"]() {
    try {
      {
        let _0x45d636 = "GetUserTask",
          _0x413c1c = "get",
          _0x1e2fea = "https://cmtv.xmay.cc/api/registerInfo/checkRegister?userId=" + this.userId,
          _0x29a6c7 = "";
        return await this.taskApi(_0x45d636, _0x413c1c, _0x1e2fea, _0x29a6c7).then(async _0x335edf => {
          if (_0x335edf) {
            if (!_0x335edf.isAfter) return console.log("账号[" + this.index + "] " + this.userId + " - 已经签到了，无需签到"), false;
            console.log("账号[" + this.index + "] " + this.userId + " - 检测到还未签到");
            return true;
          } else $.logAndNotify("账号[" + this.index + "] " + this.userId + " - 查询草莓币失败，可能帐号无效：" + JSON.stringify(_0x335edf));
        });
      }
    } catch (_0x519874) {
      console.log(_0x519874);
    }
  }
  async ["SignInDaily"]() {
    try {
      let _0x3c8847 = "SignInDaily",
        _0x43fe4c = "post",
        _0x27aa7e = "https://cmtv.xmay.cc/api/registerInfo",
        _0x20f926 = "{\"userId\":\"" + this.userId + "\"}";
      await this.taskApi(_0x3c8847, _0x43fe4c, _0x27aa7e, _0x20f926).then(async _0x3bb44f => {
        {
          if (_0x3bb44f?.["id"]) console.log("账号[" + this.index + "] 签到成功，获得" + _0x3bb44f.cmb + "草莓币，当前草莓币：" + (this.points + _0x3bb44f.cmb));else {
            console.log("账号[" + this.index + "] 签到失败");
          }
        }
      });
    } catch (_0xe65438) {
      console.log(_0xe65438);
    } finally {
      return Promise.resolve(1);
    }
  }
  async ["doTask"]() {
    try {
      console.log("\n============= 账号[" + this.index + "] 开始签到=============");
      (await this.GetUserTask()) && (await this.SignInDaily());
    } catch (_0x208f28) {
      console.log(_0x208f28);
    }
  }
}
!(async () => {
  if (typeof $request !== "undefined") await GetRewrite();else {
    if (!(await checkEnv())) return;
    console.log("\n================ 开始执行 ================");
    for (let _0x13b5ec of initedJobForTokens) {
      console.log("----------- 执行 第 [" + _0x13b5ec.index + "] 个账号 -----------");
      await _0x13b5ec.LoginIn();
    }
    let _0x183d17 = initedJobForTokens.filter(_0x57aa60 => _0x57aa60.valid);
    if (_0x183d17.length > 0) {
      {
        console.log("\n================ 任务队列构建完毕 ================");
        for (let _0x50ca01 of _0x183d17) {
          console.log("----------- 账号[" + _0x50ca01.index + "] -----------");
          await _0x50ca01.doTask();
        }
      }
    } else {
      console.log("\n====幻生提示：无可用账号，请检查配置============ 任务结束 ================");
    }
    await $.showmsg();
  }
})().catch(_0x337032 => console.log(_0x337032)).finally(() => $.done());
async function GetRewrite() {}
async function checkEnv() {
  if (authorizationToken) {
    let _0x1a5c2c = envSplitor[0];
    for (let _0x3bab5c of envSplitor) {
      if (authorizationToken.indexOf(_0x3bab5c) > -1) {
        _0x1a5c2c = _0x3bab5c;
        break;
      }
    }
    for (let _0x2df51d of authorizationToken.split(_0x1a5c2c)) {
      {
        if (_0x2df51d) initedJobForTokens.push(new JobTask(_0x2df51d));
      }
    }
    userCount = initedJobForTokens.length;
  } else {
    console.log("未找到 配置信息，请检查是否配置 变量：", envParams);
    return;
  }
  console.log("共找到" + userCount + "个账号");
  return true;
}
async function httpRequest(_0xc08f76, _0x506aa0) {
  httpErr = null;
  httpReq = null;
  httpResp = null;
  return new Promise(_0x31994f => {
    $.send(_0xc08f76, _0x506aa0, async (_0x22f513, _0x1d7338, _0x2845eb) => {
      httpErr = _0x22f513;
      httpReq = _0x1d7338;
      httpResp = _0x2845eb;
      _0x31994f({
        "err": _0x22f513,
        "req": _0x1d7338,
        "resp": _0x2845eb
      });
    });
  });
}
function Env(_0x513ce9, _0x3f5b80) {
  "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
  return new class {
    constructor(_0xe1e102, _0x737bae) {
      this.name = _0xe1e102;
      this.notifyStr = "";
      this.startTime = new Date().getTime();
      Object.assign(this, _0x737bae);
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
    ["getdata"](_0x4af141) {
      let _0xf083dc = this.getval(_0x4af141);
      if (/^@/.test(_0x4af141)) {
        const [, _0x40f7e0, _0x1886d5] = /^@(.*?)\.(.*?)$/.exec(_0x4af141),
          _0x13b49e = _0x40f7e0 ? this.getval(_0x40f7e0) : "";
        if (_0x13b49e) try {
          const _0x3fbd1c = JSON.parse(_0x13b49e);
          _0xf083dc = _0x3fbd1c ? this.lodash_get(_0x3fbd1c, _0x1886d5, "") : _0xf083dc;
        } catch (_0x35b1b7) {
          _0xf083dc = "";
        }
      }
      return _0xf083dc;
    }
    ["setdata"](_0x28bfb3, _0x322236) {
      let _0x1d16d8 = false;
      if (/^@/.test(_0x322236)) {
        {
          const [, _0x1d300b, _0x4d0d99] = /^@(.*?)\.(.*?)$/.exec(_0x322236),
            _0x201be5 = this.getval(_0x1d300b),
            _0x549465 = _0x1d300b ? "null" === _0x201be5 ? null : _0x201be5 || "{}" : "{}";
          try {
            const _0x76924e = JSON.parse(_0x549465);
            this.lodash_set(_0x76924e, _0x4d0d99, _0x28bfb3);
            _0x1d16d8 = this.setval(JSON.stringify(_0x76924e), _0x1d300b);
          } catch (_0x463f8b) {
            const _0x4c1fab = {};
            this.lodash_set(_0x4c1fab, _0x4d0d99, _0x28bfb3);
            _0x1d16d8 = this.setval(JSON.stringify(_0x4c1fab), _0x1d300b);
          }
        }
      } else {
        _0x1d16d8 = this.setval(_0x28bfb3, _0x322236);
      }
      return _0x1d16d8;
    }
    ["getval"](_0x57c252) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(_0x57c252) : this.isQuanX() ? $prefs.valueForKey(_0x57c252) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x57c252]) : this.data && this.data[_0x57c252] || null;
    }
    ["setval"](_0x134051, _0x4faa57) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(_0x134051, _0x4faa57) : this.isQuanX() ? $prefs.setValueForKey(_0x134051, _0x4faa57) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x4faa57] = _0x134051, this.writedata(), true) : this.data && this.data[_0x4faa57] || null;
    }
    ["send"](_0x1c870b, _0x5a3c06, _0x42ea8e = () => {}) {
      {
        if (_0x1c870b != "get" && _0x1c870b != "post" && _0x1c870b != "put" && _0x1c870b != "delete") {
          console.log("无效的http方法：" + _0x1c870b);
          return;
        }
        if (_0x1c870b == "get" && _0x5a3c06.headers) delete _0x5a3c06.headers["Content-Type"], delete _0x5a3c06.headers["Content-Length"];else {
          if (_0x5a3c06.body && _0x5a3c06.headers) {
            {
              if (!_0x5a3c06.headers["Content-Type"]) _0x5a3c06.headers["Content-Type"] = "application/x-www-form-urlencoded";
            }
          }
        }
        if (this.isSurge() || this.isLoon()) {
          this.isSurge() && this.isNeedRewrite && (_0x5a3c06.headers = _0x5a3c06.headers || {}, Object.assign(_0x5a3c06.headers, {
            "X-Surge-Skip-Scripting": false
          }));
          let _0x4a58cf = {
            "method": _0x1c870b,
            "url": _0x5a3c06.url,
            "headers": _0x5a3c06.headers,
            "timeout": _0x5a3c06.timeout,
            "data": _0x5a3c06.body
          };
          if (_0x1c870b == "get") delete _0x4a58cf.data;
          $axios(_0x4a58cf).then(_0x376e23 => {
            {
              const {
                status: _0x2633d7,
                request: _0x1ee9f,
                headers: _0x5588d1,
                data: _0x56dfa3
              } = _0x376e23;
              _0x42ea8e(null, _0x1ee9f, {
                "statusCode": _0x2633d7,
                "headers": _0x5588d1,
                "body": _0x56dfa3
              });
            }
          }).catch(_0x48f466 => console.log(_0x48f466));
        } else {
          if (this.isQuanX()) _0x5a3c06.method = _0x1c870b.toUpperCase(), this.isNeedRewrite && (_0x5a3c06.opts = _0x5a3c06.opts || {}, Object.assign(_0x5a3c06.opts, {
            "hints": false
          })), $task.fetch(_0x5a3c06).then(_0x24a32b => {
            {
              const {
                statusCode: _0x2ce309,
                request: _0x553dee,
                headers: _0x47ad1d,
                body: _0x1d51d4
              } = _0x24a32b;
              _0x42ea8e(null, _0x553dee, {
                "statusCode": _0x2ce309,
                "headers": _0x47ad1d,
                "body": _0x1d51d4
              });
            }
          }, _0x2b68b9 => _0x42ea8e(_0x2b68b9));else {
            if (this.isNode()) {
              {
                this.got = this.got ? this.got : require("got");
                const {
                  url: _0x535b9e,
                  ..._0x16a812
                } = _0x5a3c06;
                this.instance = this.got.extend({
                  "followRedirect": false
                });
                this.instance[_0x1c870b](_0x535b9e, _0x16a812).then(_0x1b5a14 => {
                  {
                    const {
                      statusCode: _0x2b7984,
                      request: _0x24596f,
                      headers: _0x17cbfd,
                      body: _0x18ca69
                    } = _0x1b5a14;
                    _0x42ea8e(null, _0x24596f, {
                      "statusCode": _0x2b7984,
                      "headers": _0x17cbfd,
                      "body": _0x18ca69
                    });
                  }
                }, _0x56154e => {
                  {
                    const {
                      message: _0x88f437,
                      request: _0x261d64,
                      response: _0x2cc23c
                    } = _0x56154e;
                    _0x42ea8e(_0x88f437, _0x261d64, _0x2cc23c);
                  }
                });
              }
            }
          }
        }
      }
    }
    ["time"](_0x1b4234, _0x2e33d8 = null) {
      let _0x13f44e = _0x2e33d8 ? new Date(_0x2e33d8) : new Date(),
        _0xd1abb3 = {
          "M+": _0x13f44e.getMonth() + 1,
          "d+": _0x13f44e.getDate(),
          "h+": _0x13f44e.getHours(),
          "m+": _0x13f44e.getMinutes(),
          "s+": _0x13f44e.getSeconds(),
          "q+": Math.floor((_0x13f44e.getMonth() + 3) / 3),
          "S": _0x13f44e.getMilliseconds()
        };
      /(y+)/.test(_0x1b4234) && (_0x1b4234 = _0x1b4234.replace(RegExp.$1, (_0x13f44e.getFullYear() + "").substr(4 - RegExp.$1.length)));
      for (let _0x12593f in _0xd1abb3) new RegExp("(" + _0x12593f + ")").test(_0x1b4234) && (_0x1b4234 = _0x1b4234.replace(RegExp.$1, 1 == RegExp.$1.length ? _0xd1abb3[_0x12593f] : ("00" + _0xd1abb3[_0x12593f]).substr(("" + _0xd1abb3[_0x12593f]).length)));
      return _0x1b4234;
    }
    async ["showmsg"]() {
      if (!this.notifyStr) return;
      let _0x44fa77 = this.name + " 运行通知\n\n" + this.notifyStr;
      if ($.isNode()) {
        var _0x2a2ac8 = require("../sendNotify");
        console.log("\n============== 推送 ==============");
        await _0x2a2ac8.sendNotify(this.name, _0x44fa77);
      } else this.msg(_0x44fa77);
    }
    ["logAndNotify"](_0x147484) {
      console.log(_0x147484);
      this.notifyStr += _0x147484;
      this.notifyStr += "\n";
    }
    ["logAndNotifyWithTime"](_0x445549) {
      {
        let _0xb8cb7b = "[" + this.time("hh:mm:ss.S") + "]" + _0x445549;
        console.log(_0xb8cb7b);
        this.notifyStr += _0xb8cb7b;
        this.notifyStr += "\n";
      }
    }
    ["logWithTime"](_0x3ee709) {
      console.log("[" + this.time("hh:mm:ss.S") + "]" + _0x3ee709);
    }
    ["msg"](_0x2fbece = t, _0x54b688 = "", _0x3bcc34 = "", _0x224c9d) {
      const _0x1a3f75 = _0x250b42 => {
        {
          if (!_0x250b42) return _0x250b42;
          if ("string" == typeof _0x250b42) return this.isLoon() ? _0x250b42 : this.isQuanX() ? {
            "open-url": _0x250b42
          } : this.isSurge() ? {
            "url": _0x250b42
          } : undefined;
          if ("object" == typeof _0x250b42) {
            if (this.isLoon()) {
              let _0x207cc8 = _0x250b42.openUrl || _0x250b42.url || _0x250b42["open-url"],
                _0x5139ba = _0x250b42.mediaUrl || _0x250b42["media-url"];
              return {
                "openUrl": _0x207cc8,
                "mediaUrl": _0x5139ba
              };
            }
            if (this.isQuanX()) {
              let _0x49efdc = _0x250b42["open-url"] || _0x250b42.url || _0x250b42.openUrl,
                _0x3e3764 = _0x250b42["media-url"] || _0x250b42.mediaUrl;
              return {
                "open-url": _0x49efdc,
                "media-url": _0x3e3764
              };
            }
            if (this.isSurge()) {
              let _0x260a6d = _0x250b42.url || _0x250b42.openUrl || _0x250b42["open-url"];
              return {
                "url": _0x260a6d
              };
            }
          }
        }
      };
      this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(_0x2fbece, _0x54b688, _0x3bcc34, _0x1a3f75(_0x224c9d)) : this.isQuanX() && $notify(_0x2fbece, _0x54b688, _0x3bcc34, _0x1a3f75(_0x224c9d)));
      let _0x1ab4e9 = ["", "============== 系统通知 =============="];
      _0x1ab4e9.push(_0x2fbece);
      _0x54b688 && _0x1ab4e9.push(_0x54b688);
      _0x3bcc34 && _0x1ab4e9.push(_0x3bcc34);
      console.log(_0x1ab4e9.join("\n"));
    }
    ["getMin"](_0x111e23, _0x5d49a3) {
      return _0x111e23 < _0x5d49a3 ? _0x111e23 : _0x5d49a3;
    }
    ["getMax"](_0x57a5cf, _0x4b6479) {
      return _0x57a5cf < _0x4b6479 ? _0x4b6479 : _0x57a5cf;
    }
    ["padStr"](_0x1330d0, _0x447e5a, _0x1ce3d8 = "0") {
      let _0x74cf55 = String(_0x1330d0),
        _0x475acb = _0x447e5a > _0x74cf55.length ? _0x447e5a - _0x74cf55.length : 0,
        _0x5dc5de = "";
      for (let _0x3735bb = 0; _0x3735bb < _0x475acb; _0x3735bb++) {
        _0x5dc5de += _0x1ce3d8;
      }
      _0x5dc5de += _0x74cf55;
      return _0x5dc5de;
    }
    ["json2str"](_0x2e906e, _0x548b9d, _0x156871 = false) {
      let _0x485825 = [];
      for (let _0xafaf11 of Object.keys(_0x2e906e).sort()) {
        let _0x593dc4 = _0x2e906e[_0xafaf11];
        if (_0x593dc4 && _0x156871) _0x593dc4 = encodeURIComponent(_0x593dc4);
        _0x485825.push(_0xafaf11 + "=" + _0x593dc4);
      }
      return _0x485825.join(_0x548b9d);
    }
    ["str2json"](_0x55e93e, _0x170529 = false) {
      {
        let _0x806c53 = {};
        for (let _0x5bc7b3 of _0x55e93e.split("&")) {
          if (!_0x5bc7b3) continue;
          let _0x2887cc = _0x5bc7b3.indexOf("=");
          if (_0x2887cc == -1) continue;
          let _0x4fc7f5 = _0x5bc7b3.substr(0, _0x2887cc),
            _0x33ebe3 = _0x5bc7b3.substr(_0x2887cc + 1);
          if (_0x170529) _0x33ebe3 = decodeURIComponent(_0x33ebe3);
          _0x806c53[_0x4fc7f5] = _0x33ebe3;
        }
        return _0x806c53;
      }
    }
    ["randomString"](_0xc6b621, _0x555c1b = "abcdef0123456789") {
      let _0x447945 = "";
      for (let _0x5b26e3 = 0; _0x5b26e3 < _0xc6b621; _0x5b26e3++) {
        _0x447945 += _0x555c1b.charAt(Math.floor(Math.random() * _0x555c1b.length));
      }
      return _0x447945;
    }
    ["randomList"](_0x39e14e) {
      {
        let _0x30db5e = Math.floor(Math.random() * _0x39e14e.length);
        return _0x39e14e[_0x30db5e];
      }
    }
    ["wait"](_0x39530a) {
      return new Promise(_0x40404a => setTimeout(_0x40404a, _0x39530a));
    }
    ["done"](_0x38e142 = {}) {
      const _0x3168b5 = new Date().getTime(),
        _0xd54e2e = (_0x3168b5 - this.startTime) / 1000;
      console.log("\n" + this.name + " 运行结束，共运行了 " + _0xd54e2e + " 秒！");
      if (this.isSurge() || this.isQuanX() || this.isLoon()) $done(_0x38e142);
    }
  }(_0x513ce9, _0x3f5b80);
}