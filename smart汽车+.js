/**
 * smart汽车+ V1.02
 * const $ = new Env("smart汽车+");
 * cron 0 8,20 * * * smart汽车+.js
 * 走下我的注册地址，谢谢，有本请投稿（利润项目偷撸可dd）：https://z1.ax1x.com/2023/10/17/piChdQH.png
 * 更新：修复运行问题以及提现逻辑
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export smart_car_plus='Id-Token'
 * 自己登录时开启抓包 搜索 refresh_token，miniapp/quicklogin 或者 miniapp/getittoken 的返回里有
 * 注意：抓到后不要再自己打开这个小程序了，不然会顶号！
 * 
 * 多账号可用 换行、&、@ 符号隔开，支持新建多个同名环境变量来设置多账号

 * 奖励：签到开盲盒
 * ====================================
 */

//Sat Jan 25 2025 08:24:09 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const _0x2c5ee3 = new _0x16e925("smart汽车+"),
  _0x40c21a = require("https");
_0x40c21a.globalAgent.options.rejectUnauthorized = false;
let _0x1778c4 = "smart_car_plus",
  _0x55a0cf = ["\n", "@", "&"];
const _0x86dc7f = require("fs");
let _0x6bb841 = (_0x2c5ee3.isNode() ? process.env[_0x1778c4] : _0x2c5ee3.getdata(_0x1778c4)) || "",
  _0x18bbd5 = [],
  _0x44bda9 = 0;
class _0x57add7 {
  constructor(_0x387cf7) {
    this.index = ++_0x44bda9;
    this.valid = false;
    try {
      {
        if (_0x387cf7?.["length"] === 2) [this.Authorization, this.token] = _0x387cf7, this.Authorization = this.Authorization?.["replace"]("Bearer ", "");else _0x387cf7?.["length"] === 1 ? ([this.refreshToken] = _0x387cf7, this.refreshToken = this.refreshToken?.["replace"]("Bearer ", "")) : console.log("参数不完整：自己抓包 请求头里的 Id-Token");
      }
    } catch (_0x159593) {
      console.log("参数不完整：自己抓包 请求头里的 Id-Token");
    }
  }
  async ["taskApi"](_0x40ea26, _0x3daa52, _0x3f5fcb, _0x22e96e, _0x1c1124 = {}) {
    let _0x13a5e2 = null;
    try {
      {
        let _0x378cf3 = {
          "url": _0x3f5fcb,
          "headers": {
            "Authorization": "Bearer " + this.Authorization,
            "Content-Type": "application/json; Charset=UTF-8",
            "id-token": this.token || "",
            ..._0x1c1124
          },
          "timeout": 60000
        };
        _0x22e96e && (_0x378cf3.body = _0x22e96e);
        await _0x4a407b(_0x3daa52, _0x378cf3).then(async _0x23f56a => {
          {
            if (_0x23f56a.resp?.["statusCode"] == 200) {
              {
                if (_0x23f56a.resp?.["body"]) {
                  _0x13a5e2 = JSON.parse(_0x23f56a.resp.body);
                } else console.log("账号[" + this.index + "]调用" + _0x3daa52 + "[" + _0x40ea26 + "]出错，返回为空");
              }
            } else console.log("账号[" + this.index + "]调用" + _0x3daa52 + "[" + _0x40ea26 + "]出错，返回状态码[" + (_0x23f56a.resp?.["statusCode"] || "") + "]", "返回结果：", _0x23f56a.resp?.["body"] || _0x23f56a?.["err"]);
          }
        });
      }
    } catch (_0x324e72) {
      console.log(_0x324e72);
    } finally {
      return Promise.resolve(_0x13a5e2);
    }
  }
  async ["sign_statistics"]() {
    try {
      {
        let _0x7e33c7 = "sign_statistics",
          _0x595a82 = "post",
          _0x531078 = "https://eco-api.smart.cn/member-center/sign/toc/supplement/sign/statistics";
        const _0x48a208 = new Date(),
          _0x45e49d = _0x48a208.getFullYear(),
          _0x14824f = String(_0x48a208.getMonth() + 1).padStart(2, "0"),
          _0x4d9c57 = _0x45e49d + "-" + _0x14824f;
        let _0x54116c = "{\"month\":\"" + _0x4d9c57 + "\"}";
        await this.taskApi(_0x7e33c7, _0x595a82, _0x531078, _0x54116c, {}).then(async _0xbd54ea => {
          _0xbd54ea?.["success"] ? (console.log("账号[" + this.index + "] 查询打卡信息成功，积分：" + (_0xbd54ea?.["data"]["pointsBalance"] || 0)), this.valid = true) : (console.log("账号[" + this.index + "] 查询打卡信息失败：" + (_0xbd54ea?.["msg"] || JSON.stringify(_0xbd54ea))), this.valid = false);
        });
      }
    } catch (_0x595987) {
      console.log(_0x595987);
    }
  }
  async ["sign_daliy"]() {
    try {
      {
        let _0x1884eb = "sign_daliy",
          _0x12b8c3 = "post",
          _0x120f2f = "https://app-api.smart.cn/smartapp-me/signs/v2",
          _0x4c4500 = "{}";
        await this.taskApi(_0x1884eb, _0x12b8c3, _0x120f2f, _0x4c4500, {
          "X-Auth-Token": this.token
        }).then(async _0x492146 => {
          _0x492146?.["code"] === "success" ? console.log("账号[" + this.index + "] 签到成功，当前总积分：" + (_0x492146?.["data"]["totalIntegral"] || 0) + "，已签到：" + _0x492146?.["data"]["signCount"] + "次") : console.log("账号[" + this.index + "] 签到失败：" + (_0x492146?.["message"] || JSON.stringify(_0x492146)));
        });
      }
    } catch (_0x297601) {
      console.log(_0x297601);
    }
  }
  async ["RefreshToken"]() {
    let _0x475482,
      _0x56592f = _0x4f0b0f(_0x1778c4 + "_config", this.refreshToken);
    _0x56592f && typeof _0x56592f === "string" && JSON.parse(_0x56592f)?.["access_token"] && (_0x475482 = JSON.parse(_0x56592f)?.["access_token"]);
    let _0x68ba58 = _0x475482 || this.refreshToken;
    try {
      let _0x103c88 = "RefreshToken",
        _0x3da2a3 = "get",
        _0x392b92 = "https://cms-api.smart.cn/api/smart/web/1.0/oauth/miniapp/getittoken?refreshToken=" + _0x68ba58,
        _0x563be0 = "";
      await this.taskApi(_0x103c88, _0x3da2a3, _0x392b92, _0x563be0, {}).then(async _0x539175 => {
        if (_0x539175?.["message"] === "success") {
          this.token = _0x539175?.["result"]?.["id_token"];
          try {
            const _0x29342b = atob(this.token?.["split"](".")[1]),
              _0x530edd = new Date(Number(_0x29342b?.["exp"] + "000"))?.["getMonth"]() + 1 + "月" + new Date(Number(_0x29342b?.["exp"] + "000"))?.["getDate"]() + "日" + "00:00:00过期";
            console.log("账号[" + this.index + "] 刷新token成功，当前token：" + _0x530edd);
          } catch (_0x57e8da) {
            console.log("账号[" + this.index + "] 刷新token成功");
          }
          this.valid = true;
          _0x68ba58 = _0x539175?.["result"]?.["refresh_token"];
          _0x5bb44c(_0x1778c4 + "_config", this.refreshToken, JSON.stringify({
            "access_token": _0x68ba58
          }));
        } else console.log("账号[" + this.index + "] 刷新token失败：" + (_0x539175?.["message"] || JSON.stringify(_0x539175))), this.valid = false;
      });
    } catch (_0x2656d5) {
      console.log(_0x2656d5);
    }
  }
  async ["doTask"]() {
    try {
      await this.sign_daliy();
    } catch (_0x515fb9) {
      console.log(_0x515fb9);
    }
  }
}
!(async () => {
  if (typeof $request !== "undefined") {
    await _0x2024a5();
  } else {
    if (!(await _0x25bb93())) return;
    console.log("\n================ 开始执行 ================\n作者：幻生（禁止倒卖）\n注册地址（非常感谢）：https://z1.ax1x.com/2023/10/17/piChdQH.png\n脚本仓库（认准更新地址）：https://github.com/smallfawn/QLScriptPublic");
    for (let _0x4f2e33 of _0x18bbd5) {
      console.log("----------- 执行 第 [" + _0x4f2e33.index + "] 个账号 -----------");
      await _0x4f2e33.RefreshToken();
    }
    let _0x6ece0c = _0x18bbd5.filter(_0x2edfdc => _0x2edfdc.valid);
    if (_0x6ece0c.length > 0) {
      {
        console.log("\n================ 任务队列构建完毕 ================");
        for (let _0x1b59b0 of _0x6ece0c) {
          console.log("----------- 账号[" + _0x1b59b0.index + "] -----------");
          await _0x1b59b0.doTask();
        }
      }
    } else {
      console.log("\n====幻生提示：无可用账号，请检查配置============ 任务结束 ================");
    }
    await _0x2c5ee3.showmsg();
  }
})().catch(_0x4cdc29 => console.log(_0x4cdc29)).finally(() => _0x2c5ee3.done());
async function _0x2024a5() {}
function _0x5bb44c(_0x2600dc, _0x4406e7, _0x1e26bc) {
  let _0xd1b387 = {},
    _0x49a008 = {};
  try {
    _0xd1b387 = _0x86dc7f.readFileSync(_0x2600dc + ".json", "utf8");
    _0x49a008 = JSON.parse(_0xd1b387);
  } catch (_0x626fda) {}
  _0x49a008[_0x4406e7] = _0x1e26bc;
  const _0x232a65 = JSON.stringify(_0x49a008);
  try {
    _0x86dc7f.writeFileSync(_0x2600dc + ".json", _0x232a65);
  } catch (_0x4603da) {
    {
      if (_0x4603da.code === "ENOENT") {
        _0x86dc7f.writeFileSync(_0x2600dc + ".json", _0x232a65);
      } else {
        console.error("保存文件时发生错误：", _0x4603da);
      }
    }
  }
}
function _0x4f0b0f(_0x412496, _0x14b4cf) {
  try {
    const _0x3cab3d = _0x86dc7f.readFileSync(_0x412496 + ".json", "utf8"),
      _0x5ceb2a = JSON.parse(_0x3cab3d);
    return _0x5ceb2a[_0x14b4cf];
  } catch (_0x46344d) {
    if (_0x46344d.code === "ENOENT") {
      return undefined;
    } else {
      console.error("读取文件时发生错误：", _0x46344d);
    }
  }
}
async function _0x25bb93() {
  if (_0x6bb841) {
    let _0x4863b0 = _0x55a0cf[0];
    for (let _0xb394dc of _0x55a0cf) {
      {
        if (_0x6bb841.indexOf(_0xb394dc) > -1) {
          _0x4863b0 = _0xb394dc;
          break;
        }
      }
    }
    for (let _0x3e5995 of _0x6bb841.split(_0x4863b0)) {
      {
        if (_0x3e5995) _0x18bbd5.push(new _0x57add7(_0x3e5995?.["split"]("#")));
      }
    }
    userCount = _0x18bbd5.length;
  } else {
    console.log("未找到 配置信息，请检查是否配置 变量：", _0x1778c4);
    return;
  }
  console.log("共找到" + userCount + "个账号");
  return true;
}
async function _0x4a407b(_0xb326d3, _0x2deb03) {
  httpErr = null;
  httpReq = null;
  httpResp = null;
  return new Promise(_0x2d11b1 => {
    _0x2c5ee3.send(_0xb326d3, _0x2deb03, async (_0x5950d0, _0x53d531, _0x3d1b29) => {
      httpErr = _0x5950d0;
      httpReq = _0x53d531;
      httpResp = _0x3d1b29;
      _0x2d11b1({
        "err": _0x5950d0,
        "req": _0x53d531,
        "resp": _0x3d1b29
      });
    });
  });
}
function _0x16e925(_0x1f9940, _0x1c147f) {
  "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
  return new class {
    constructor(_0x3d1489, _0x45584c) {
      {
        this.name = _0x3d1489;
        this.notifyStr = "";
        this.startTime = new Date().getTime();
        Object.assign(this, _0x45584c);
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
    ["getdata"](_0x1e7d3c) {
      let _0x78169a = this.getval(_0x1e7d3c);
      if (/^@/.test(_0x1e7d3c)) {
        {
          const [, _0x4c8217, _0x579fbb] = /^@(.*?)\.(.*?)$/.exec(_0x1e7d3c),
            _0x18867a = _0x4c8217 ? this.getval(_0x4c8217) : "";
          if (_0x18867a) try {
            const _0x1e47b8 = JSON.parse(_0x18867a);
            _0x78169a = _0x1e47b8 ? this.lodash_get(_0x1e47b8, _0x579fbb, "") : _0x78169a;
          } catch (_0x3b2502) {
            _0x78169a = "";
          }
        }
      }
      return _0x78169a;
    }
    ["setdata"](_0x54829e, _0x445aad) {
      let _0x1307d9 = false;
      if (/^@/.test(_0x445aad)) {
        const [, _0x431f1f, _0x15a6db] = /^@(.*?)\.(.*?)$/.exec(_0x445aad),
          _0x380310 = this.getval(_0x431f1f),
          _0x56d8a8 = _0x431f1f ? "null" === _0x380310 ? null : _0x380310 || "{}" : "{}";
        try {
          const _0x162c71 = JSON.parse(_0x56d8a8);
          this.lodash_set(_0x162c71, _0x15a6db, _0x54829e);
          _0x1307d9 = this.setval(JSON.stringify(_0x162c71), _0x431f1f);
        } catch (_0x26326d) {
          const _0x356dc1 = {};
          this.lodash_set(_0x356dc1, _0x15a6db, _0x54829e);
          _0x1307d9 = this.setval(JSON.stringify(_0x356dc1), _0x431f1f);
        }
      } else {
        _0x1307d9 = this.setval(_0x54829e, _0x445aad);
      }
      return _0x1307d9;
    }
    ["getval"](_0x1f9bea) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(_0x1f9bea) : this.isQuanX() ? $prefs.valueForKey(_0x1f9bea) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x1f9bea]) : this.data && this.data[_0x1f9bea] || null;
    }
    ["setval"](_0x49a603, _0x31080a) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(_0x49a603, _0x31080a) : this.isQuanX() ? $prefs.setValueForKey(_0x49a603, _0x31080a) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x31080a] = _0x49a603, this.writedata(), true) : this.data && this.data[_0x31080a] || null;
    }
    ["send"](_0x3009e2, _0x172a12, _0x6bbd77 = () => {}) {
      if (_0x3009e2 != "get" && _0x3009e2 != "post" && _0x3009e2 != "put" && _0x3009e2 != "delete") {
        console.log("无效的http方法：" + _0x3009e2);
        return;
      }
      if (_0x3009e2 == "get" && _0x172a12.headers) delete _0x172a12.headers["Content-Type"], delete _0x172a12.headers["Content-Length"];else {
        if (_0x172a12.body && _0x172a12.headers) {
          {
            if (!_0x172a12.headers["Content-Type"]) _0x172a12.headers["Content-Type"] = "application/x-www-form-urlencoded";
          }
        }
      }
      if (this.isSurge() || this.isLoon()) {
        this.isSurge() && this.isNeedRewrite && (_0x172a12.headers = _0x172a12.headers || {}, Object.assign(_0x172a12.headers, {
          "X-Surge-Skip-Scripting": false
        }));
        let _0x2382c0 = {
          "method": _0x3009e2,
          "url": _0x172a12.url,
          "headers": _0x172a12.headers,
          "timeout": _0x172a12.timeout,
          "data": _0x172a12.body
        };
        if (_0x3009e2 == "get") delete _0x2382c0.data;
        $axios(_0x2382c0).then(_0x2b9d5c => {
          const {
            status: _0x2dfb09,
            request: _0xe9fae1,
            headers: _0x449d3c,
            data: _0x5e4b23
          } = _0x2b9d5c;
          _0x6bbd77(null, _0xe9fae1, {
            "statusCode": _0x2dfb09,
            "headers": _0x449d3c,
            "body": _0x5e4b23
          });
        }).catch(_0xe893ba => console.log(_0xe893ba));
      } else {
        if (this.isQuanX()) _0x172a12.method = _0x3009e2.toUpperCase(), this.isNeedRewrite && (_0x172a12.opts = _0x172a12.opts || {}, Object.assign(_0x172a12.opts, {
          "hints": false
        })), $task.fetch(_0x172a12).then(_0x5db606 => {
          {
            const {
              statusCode: _0x696fe4,
              request: _0x17e5a1,
              headers: _0x45fcd2,
              body: _0x16bbaa
            } = _0x5db606;
            _0x6bbd77(null, _0x17e5a1, {
              "statusCode": _0x696fe4,
              "headers": _0x45fcd2,
              "body": _0x16bbaa
            });
          }
        }, _0x504696 => _0x6bbd77(_0x504696));else {
          if (this.isNode()) {
            {
              this.got = this.got ? this.got : require("got");
              const {
                url: _0x5b0415,
                ..._0x3f2b41
              } = _0x172a12;
              this.instance = this.got.extend({
                "followRedirect": false,
                "hooks": {
                  "beforeRequest": [_0x463820 => {
                    _0x463820.headers = Object.assign({}, _0x463820.headers, {});
                  }]
                }
              });
              this.instance[_0x3009e2](_0x5b0415, _0x3f2b41).then(_0xbb33dd => {
                const {
                  statusCode: _0x2b3568,
                  request: _0xb0f43f,
                  headers: _0x3e9766,
                  body: _0x45cec0
                } = _0xbb33dd;
                _0x6bbd77(null, _0xb0f43f, {
                  "statusCode": _0x2b3568,
                  "headers": _0x3e9766,
                  "body": _0x45cec0
                });
              }, _0x5466e0 => {
                {
                  const {
                    message: _0x206425,
                    request: _0x25ab86,
                    response: _0xdb01e8
                  } = _0x5466e0;
                  _0x6bbd77(_0x206425, _0x25ab86, _0xdb01e8);
                }
              });
            }
          }
        }
      }
    }
    ["time"](_0x5414c2, _0x2c0b5a = null) {
      {
        let _0x251dd2 = _0x2c0b5a ? new Date(_0x2c0b5a) : new Date(),
          _0xb70116 = {
            "M+": _0x251dd2.getMonth() + 1,
            "d+": _0x251dd2.getDate(),
            "h+": _0x251dd2.getHours(),
            "m+": _0x251dd2.getMinutes(),
            "s+": _0x251dd2.getSeconds(),
            "q+": Math.floor((_0x251dd2.getMonth() + 3) / 3),
            "S": _0x251dd2.getMilliseconds()
          };
        /(y+)/.test(_0x5414c2) && (_0x5414c2 = _0x5414c2.replace(RegExp.$1, (_0x251dd2.getFullYear() + "").substr(4 - RegExp.$1.length)));
        for (let _0x287f0a in _0xb70116) new RegExp("(" + _0x287f0a + ")").test(_0x5414c2) && (_0x5414c2 = _0x5414c2.replace(RegExp.$1, 1 == RegExp.$1.length ? _0xb70116[_0x287f0a] : ("00" + _0xb70116[_0x287f0a]).substr(("" + _0xb70116[_0x287f0a]).length)));
        return _0x5414c2;
      }
    }
    async ["showmsg"]() {
      if (!this.notifyStr) return;
      let _0x41820a = this.name + " 运行通知\n\n" + this.notifyStr;
      if (_0x2c5ee3.isNode()) {
        var _0x63cdcc = require("./sendNotify");
        console.log("\n============== 推送 ==============");
        await _0x63cdcc.sendNotify(this.name, _0x41820a);
      } else this.msg(_0x41820a);
    }
    ["logAndNotify"](_0x5cb695) {
      console.log(_0x5cb695);
      this.notifyStr += _0x5cb695;
      this.notifyStr += "\n";
    }
    ["logAndNotifyWithTime"](_0x3775b9) {
      let _0xf02487 = "[" + this.time("hh:mm:ss.S") + "]" + _0x3775b9;
      console.log(_0xf02487);
      this.notifyStr += _0xf02487;
      this.notifyStr += "\n";
    }
    ["logWithTime"](_0x4ffc16) {
      console.log("[" + this.time("hh:mm:ss.S") + "]" + _0x4ffc16);
    }
    ["msg"](_0x2d1661 = t, _0x4ad7b5 = "", _0x45a26f = "", _0x426041) {
      const _0x423763 = _0x424db1 => {
        if (!_0x424db1) return _0x424db1;
        if ("string" == typeof _0x424db1) return this.isLoon() ? _0x424db1 : this.isQuanX() ? {
          "open-url": _0x424db1
        } : this.isSurge() ? {
          "url": _0x424db1
        } : undefined;
        if ("object" == typeof _0x424db1) {
          {
            if (this.isLoon()) {
              let _0x20d209 = _0x424db1.openUrl || _0x424db1.url || _0x424db1["open-url"],
                _0xd532d9 = _0x424db1.mediaUrl || _0x424db1["media-url"];
              return {
                "openUrl": _0x20d209,
                "mediaUrl": _0xd532d9
              };
            }
            if (this.isQuanX()) {
              {
                let _0x4c1193 = _0x424db1["open-url"] || _0x424db1.url || _0x424db1.openUrl,
                  _0x3d2cf4 = _0x424db1["media-url"] || _0x424db1.mediaUrl;
                return {
                  "open-url": _0x4c1193,
                  "media-url": _0x3d2cf4
                };
              }
            }
            if (this.isSurge()) {
              let _0xc7d34e = _0x424db1.url || _0x424db1.openUrl || _0x424db1["open-url"];
              return {
                "url": _0xc7d34e
              };
            }
          }
        }
      };
      this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(_0x2d1661, _0x4ad7b5, _0x45a26f, _0x423763(_0x426041)) : this.isQuanX() && $notify(_0x2d1661, _0x4ad7b5, _0x45a26f, _0x423763(_0x426041)));
      let _0x253529 = ["", "============== 系统通知 =============="];
      _0x253529.push(_0x2d1661);
      _0x4ad7b5 && _0x253529.push(_0x4ad7b5);
      _0x45a26f && _0x253529.push(_0x45a26f);
      console.log(_0x253529.join("\n"));
    }
    ["getMin"](_0x5602e4, _0x2c31ee) {
      return _0x5602e4 < _0x2c31ee ? _0x5602e4 : _0x2c31ee;
    }
    ["getMax"](_0x2bc1b6, _0x11b977) {
      return _0x2bc1b6 < _0x11b977 ? _0x11b977 : _0x2bc1b6;
    }
    ["padStr"](_0x4bae34, _0x477169, _0x5bcafd = "0") {
      let _0x2214d3 = String(_0x4bae34),
        _0x5da1af = _0x477169 > _0x2214d3.length ? _0x477169 - _0x2214d3.length : 0,
        _0x3de83d = "";
      for (let _0x19167c = 0; _0x19167c < _0x5da1af; _0x19167c++) {
        _0x3de83d += _0x5bcafd;
      }
      _0x3de83d += _0x2214d3;
      return _0x3de83d;
    }
    ["json2str"](_0x5130e0, _0x42b14c, _0xcd9b9d = false) {
      let _0x1dac7c = [];
      for (let _0x3355a1 of Object.keys(_0x5130e0).sort()) {
        let _0x2fe663 = _0x5130e0[_0x3355a1];
        if (_0x2fe663 && _0xcd9b9d) _0x2fe663 = encodeURIComponent(_0x2fe663);
        _0x1dac7c.push(_0x3355a1 + "=" + _0x2fe663);
      }
      return _0x1dac7c.join(_0x42b14c);
    }
    ["str2json"](_0x201b5c, _0x418cfb = false) {
      {
        let _0x1c03af = {};
        for (let _0x222703 of _0x201b5c.split("&")) {
          {
            if (!_0x222703) continue;
            let _0x12ba0e = _0x222703.indexOf("=");
            if (_0x12ba0e == -1) continue;
            let _0x53bf2c = _0x222703.substr(0, _0x12ba0e),
              _0x5e9be8 = _0x222703.substr(_0x12ba0e + 1);
            if (_0x418cfb) _0x5e9be8 = decodeURIComponent(_0x5e9be8);
            _0x1c03af[_0x53bf2c] = _0x5e9be8;
          }
        }
        return _0x1c03af;
      }
    }
    ["randomString"](_0x98a690, _0x49bf69 = "abcdef0123456789") {
      {
        let _0xd30c = "";
        for (let _0x6bc475 = 0; _0x6bc475 < _0x98a690; _0x6bc475++) {
          _0xd30c += _0x49bf69.charAt(Math.floor(Math.random() * _0x49bf69.length));
        }
        return _0xd30c;
      }
    }
    ["randomList"](_0x4c0004) {
      {
        let _0x5b785f = Math.floor(Math.random() * _0x4c0004.length);
        return _0x4c0004[_0x5b785f];
      }
    }
    ["wait"](_0x1d4ae6) {
      return new Promise(_0x4197a0 => setTimeout(_0x4197a0, _0x1d4ae6));
    }
    ["done"](_0x8da243 = {}) {
      const _0x2d6e02 = new Date().getTime(),
        _0x25f9b3 = (_0x2d6e02 - this.startTime) / 1000;
      console.log("\n" + this.name + " 运行结束，共运行了 " + _0x25f9b3 + " 秒！");
      if (this.isSurge() || this.isQuanX() || this.isLoon()) $done(_0x8da243);
    }
  }(_0x1f9940, _0x1c147f);
}