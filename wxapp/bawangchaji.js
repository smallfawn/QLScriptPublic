
/*
霸王茶姬 v1.0.3
微信小程序-霸王茶姬
积分可以换券

授权注册后, 捉 webapi.qmai.cn 域名请求头里面的 Qm-User-Token, 填到变量 bwcjCookie 里面
多账号换行或@或&隔开
export bwcjCookie="G3YT33xad2xxxxxxxxxxxxxxxxxx"

cron: 46 8,20 * * *
const $ = new Env("霸王茶姬");
*/
//Sat Jan 25 2025 08:29:02 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action

const _0x22822c = _0x2fbb6b("霸王茶姬"),
  _0x30bd4a = require("got"),
  _0x411cd3 = "bwcj",
  _0x4e95c6 = /[\n\&\@]/,
  _0x25b427 = [_0x411cd3 + "Cookie"],
  _0x182083 = 20000,
  _0xe9ef74 = 3,
  _0x34947f = 1.02,
  _0x5edf7d = "bwcj",
  _0x3a487f = "https://leafxcy.coding.net/api/user/leafxcy/project/validcode/shared-depot/validCode/git/blob/master/code.json",
  _0x51003c = "https://leafxcy.coding.net/api/user/leafxcy/project/validcode/shared-depot/validCode/git/blob/master/" + _0x5edf7d + ".json",
  _0x36a3ce = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.40(0x18002831) NetType/WIFI Language/zh_CN",
  _0x1adc03 = "https://servicewechat.com/wxafec6f8422cb357b/87/page-frame.html",
  _0x50be96 = "wxafec6f8422cb357b",
  _0x1f020e = 5;
class _0x4c79d9 {
  constructor() {
    this.index = _0x22822c.userIdx++;
    this.name = "";
    this.valid = false;
    const _0x16f1db = {
        "limit": 0
      },
      _0x41e123 = {
        "Connection": "keep-alive"
      },
      _0x24ef82 = {
        "retry": _0x16f1db,
        "timeout": _0x182083,
        "followRedirect": false,
        "headers": _0x41e123
      };
    this.got = _0x30bd4a.extend(_0x24ef82);
  }
  ["log"](_0x131350, _0x4fad5a = {}) {
    var _0x196077 = "",
      _0x45fd52 = _0x22822c.userCount.toString().length;
    this.index && (_0x196077 += "账号[" + _0x22822c.padStr(this.index, _0x45fd52) + "]");
    this.name && (_0x196077 += "[" + this.name + "]");
    _0x22822c.log(_0x196077 + _0x131350, _0x4fad5a);
  }
  async ["request"](_0x2c476b) {
    const _0x15a3b6 = ["ECONNRESET", "EADDRINUSE", "ENOTFOUND", "EAI_AGAIN"],
      _0x57c026 = ["TimeoutError"];
    var _0x2d2118 = null,
      _0x43077e = 0,
      _0x1692ef = _0x2c476b.fn || _0x2c476b.url;
    _0x2c476b.method = _0x2c476b?.["method"]?.["toUpperCase"]() || "GET";
    let _0x15759f;
    while (_0x43077e < _0xe9ef74) {
      try {
        _0x43077e++;
        _0x15759f = null;
        let _0x5a4ec4 = null,
          _0x1952e1 = _0x2c476b?.["timeout"] || this.got?.["defaults"]?.["options"]?.["timeout"]?.["request"] || _0x182083,
          _0x59ef9f = false;
        await new Promise(async _0x421556 => {
          setTimeout(() => {
            _0x59ef9f = true;
            _0x421556();
          }, _0x1952e1);
          await this.got(_0x2c476b).then(_0x1d84cb => {
            _0x2d2118 = _0x1d84cb;
          }, _0x12ec6e => {
            _0x5a4ec4 = _0x12ec6e;
            _0x2d2118 = _0x12ec6e.response;
            _0x15759f = _0x5a4ec4?.["code"];
          });
          _0x421556();
        });
        if (_0x59ef9f) {
          this.log("[" + _0x1692ef + "]请求超时(" + _0x1952e1 / 1000 + "秒)，重试第" + _0x43077e + "次");
        } else {
          {
            if (_0x57c026.includes(_0x5a4ec4?.["name"])) this.log("[" + _0x1692ef + "]请求超时(" + _0x5a4ec4.code + ")，重试第" + _0x43077e + "次");else {
              if (_0x15a3b6.includes(_0x5a4ec4?.["code"])) {
                this.log("[" + _0x1692ef + "]请求错误(" + _0x5a4ec4.code + ")，重试第" + _0x43077e + "次");
              } else {
                let _0x499f44 = _0x2d2118?.["statusCode"] || 999,
                  _0x487bac = _0x499f44 / 100 | 0;
                _0x487bac > 3 && this.log("请求[" + _0x1692ef + "]返回[" + _0x499f44 + "]");
                if (_0x487bac <= 4) {
                  break;
                }
              }
            }
          }
        }
      } catch (_0x553de8) {
        _0x553de8.name == "TimeoutError" ? this.log("[" + _0x1692ef + "]请求超时，重试第" + _0x43077e + "次") : this.log("[" + _0x1692ef + "]请求错误(" + _0x553de8.message + ")，重试第" + _0x43077e + "次");
      }
    }
    if (_0x2d2118 == null) return Promise.resolve({
      "statusCode": _0x15759f || -1,
      "headers": null,
      "result": null
    });
    let {
      statusCode: _0x15e772,
      headers: _0x2501a2,
      body: _0x204398
    } = _0x2d2118;
    if (_0x204398) try {
      _0x204398 = JSON.parse(_0x204398);
    } catch {}
    const _0x21a81f = {
      "statusCode": _0x15e772,
      "headers": _0x2501a2,
      "result": _0x204398
    };
    return Promise.resolve(_0x21a81f);
  }
}
let _0x133ad6 = new _0x4c79d9();
class _0x5026b8 extends _0x4c79d9 {
  constructor(_0x23d65b) {
    super();
    this.token = _0x23d65b;
    this.got = this.got.extend({
      "cookieJar": this.cookieJar,
      "headers": {
        "User-Agent": _0x36a3ce,
        "work-wechat-userid": "",
        "multi-store-id": "",
        "gdt-vid": "",
        "qz-gtd": "",
        "scene": "1006",
        "Qm-From": "wechat",
        "store-id": 49006,
        "Qm-User-Token": this.token,
        "channelCode": "",
        "Qm-From-Type": "catering",
        "promotion-code": "",
        "work-staff-name": "",
        "work-staff-id": "",
        "Accept": "v=1.0",
        "Accept-Encoding": "gzip,compress,br,deflate",
        "Referer": _0x1adc03
      }
    });
  }
  async ["personal_info"](_0x598608 = {}) {
    let _0x24397b = false;
    try {
      const _0x496d1a = {
          "appid": _0x50be96
        },
        _0x18d4d1 = {
          "fn": "personal_info",
          "method": "get",
          "url": "https://webapi.qmai.cn/web/catering/crm/personal-info",
          "searchParams": _0x496d1a
        };
      let {
          result: _0x19b336,
          statusCode: _0xdca021
        } = await this.request(_0x18d4d1),
        _0x1de7e8 = _0x22822c.get(_0x19b336, "code", _0xdca021);
      if (_0x1de7e8 == 0) {
        {
          _0x24397b = this.valid = true;
          let {
            mobilePhone: _0x419254,
            name: _0x5ab967
          } = _0x19b336?.["data"];
          this.name = _0x419254;
          this.userName = _0x5ab967;
        }
      } else {
        let _0x1a9fa8 = _0x22822c.get(_0x19b336, "message", "");
        this.log("登录失败: " + _0x1a9fa8);
      }
    } catch (_0x5cc7a1) {
      console.log(_0x5cc7a1);
    } finally {
      return _0x24397b;
    }
  }
  async ["sign_detail"](_0x12d61d = {}) {
    try {
      {
        const _0x4f8226 = {
            "appid": _0x50be96
          },
          _0x5bc0c4 = {
            "fn": "sign_detail",
            "method": "post",
            "url": "https://webapi.qmai.cn/web/catering/integral/sign/detail",
            "json": _0x4f8226
          };
        let {
            result: _0xdbe43a,
            statusCode: _0x8c7f96
          } = await this.request(_0x5bc0c4),
          _0x57fa7a = _0x22822c.get(_0xdbe43a, "code", _0x8c7f96);
        if (_0x57fa7a == 0) {
          {
            let {
                continuityTotal: _0x2f384b,
                signInDateList: _0x5e7d20,
                activityId: _0x403c0d
              } = _0xdbe43a?.["data"],
              _0x5928f0 = false,
              _0x20dde1 = _0x22822c.time("yyyy-MM-dd");
            _0x5e7d20?.["includes"](_0x20dde1) && (_0x5928f0 = true);
            this.log("旧版签到今天" + (_0x5928f0 ? "已" : "未") + "签到, 已连续签到" + _0x2f384b + "天");
            !_0x5928f0 && (await this.signIn(_0x403c0d));
          }
        } else {
          let _0x4f3aad = _0x22822c.get(_0xdbe43a, "message", "");
          this.log("查询旧版签到失败[" + _0x57fa7a + "]: " + _0x4f3aad);
        }
      }
    } catch (_0xfd690) {
      console.log(_0xfd690);
    }
  }
  async ["signIn"](_0xc779dc, _0x4c2bd6 = {}) {
    try {
      const _0x36f663 = {
          "activityId": _0xc779dc,
          "mobilePhone": this.name,
          "userName": this.userName,
          "appid": _0x50be96
        },
        _0x4568f1 = {
          "fn": "signIn",
          "method": "post",
          "url": "https://webapi.qmai.cn/web/catering/integral/sign/signIn",
          "json": _0x36f663
        };
      let {
          result: _0x3d114b,
          statusCode: _0x48d383
        } = await this.request(_0x4568f1),
        _0x568177 = _0x22822c.get(_0x3d114b, "code", _0x48d383);
      if (_0x568177 == 0) {
        {
          const _0x16c8af = {
            "notify": true
          };
          this.log("旧版签到成功", _0x16c8af);
        }
      } else {
        let _0x27ff9f = _0x22822c.get(_0x3d114b, "message", "");
        this.log("旧版签到失败[" + _0x568177 + "]: " + _0x27ff9f);
      }
    } catch (_0x2ac68e) {
      console.log(_0x2ac68e);
    }
  }
  async ["userSignStatistics"](_0x4bab26 = {}) {
    try {
      const _0x3e6e34 = {
          "activityId": "947079313798000641",
          "appid": _0x50be96
        },
        _0x13122a = {
          "fn": "userSignStatistics",
          "method": "post",
          "url": "https://webapi.qmai.cn/web/cmk-center/sign/userSignStatistics",
          "json": _0x3e6e34
        };
      let {
          result: _0x594c54,
          statusCode: _0x27479a
        } = await this.request(_0x13122a),
        _0x20ca00 = _0x22822c.get(_0x594c54, "code", _0x27479a);
      if (_0x20ca00 == 0) {
        {
          let {
              signDays: _0x585f14,
              signStatus: _0x22aedb
            } = _0x594c54?.["data"],
            _0x4fd81b = _0x22aedb == 1;
          this.log("新版签到今天" + (_0x4fd81b ? "已" : "未") + "签到, 已连续签到" + _0x585f14 + "天");
          !_0x4fd81b && (await this.takePartInSign());
        }
      } else {
        let _0x310cbd = _0x22822c.get(_0x594c54, "message", "");
        this.log("查询新版签到失败[" + _0x20ca00 + "]: " + _0x310cbd);
      }
    } catch (_0x20b0e4) {
      console.log(_0x20b0e4);
    }
  }
  async ["takePartInSign"](_0x48efd6 = {}) {
    try {
      const _0x44b325 = {
          "activityId": "947079313798000641",
          "appid": _0x50be96
        },
        _0x2733ab = {
          "fn": "takePartInSign",
          "method": "post",
          "url": "https://webapi.qmai.cn/web/cmk-center/sign/takePartInSign",
          "json": _0x44b325
        };
      let {
          result: _0x285c82,
          statusCode: _0x148e52
        } = await this.request(_0x2733ab),
        _0x4f6bec = _0x22822c.get(_0x285c82, "code", _0x148e52);
      if (_0x4f6bec == 0) {
        {
          const _0x3a28c6 = {
            "notify": true
          };
          this.log("新版签到成功", _0x3a28c6);
        }
      } else {
        let _0x439e4a = _0x22822c.get(_0x285c82, "message", "");
        this.log("新版签到失败[" + _0x4f6bec + "]: " + _0x439e4a);
      }
    } catch (_0x57f683) {
      console.log(_0x57f683);
    }
  }
  async ["points_info"](_0x11c245 = {}) {
    try {
      const _0x4418a9 = {
          "appid": _0x50be96
        },
        _0x4a3968 = {
          "fn": "points_info",
          "method": "post",
          "url": "https://webapi.qmai.cn/web/catering/crm/points-info",
          "json": _0x4418a9
        };
      let {
          result: _0x333894,
          statusCode: _0x41c61b
        } = await this.request(_0x4a3968),
        _0x4ac555 = _0x22822c.get(_0x333894, "code", _0x41c61b);
      if (_0x4ac555 == 0) {
        let {
          soonExpiredPoints: _0x1ee018,
          totalPoints: _0x5d3ffb,
          expiredTime: _0x271e92
        } = _0x333894?.["data"];
        const _0x36151a = {
          "notify": true
        };
        this.log("积分: " + _0x5d3ffb, _0x36151a);
        if (_0x1ee018) {
          const _0x1b318e = {
            "notify": true
          };
          this.log("有" + _0x1ee018 + "积分将于[" + _0x271e92 + "]过期", _0x1b318e);
        }
      } else {
        {
          let _0x4f796a = _0x22822c.get(_0x333894, "message", "");
          this.log("查询积分失败[" + _0x4ac555 + "]: " + _0x4f796a);
        }
      }
    } catch (_0x333089) {
      console.log(_0x333089);
    }
  }
  async ["userTask"](_0x585f25 = {}) {
    if (!(await this.personal_info())) {
      return;
    }
    await this.sign_detail();
    await this.userSignStatistics();
    await this.points_info();
  }
}
!(async () => {
  _0x22822c.read_env(_0x5026b8);
  for (let _0x481d4c of _0x22822c.userList) {
    await _0x481d4c.userTask();
  }
})().catch(_0x40193d => _0x22822c.log(_0x40193d)).finally(() => _0x22822c.exitNow());
async function _0x1300b9(_0x13b3c8 = 0) {
  let _0x24ed10 = false;
  try {
    const _0x5742b3 = {
      "fn": "auth",
      "method": "get",
      "url": _0x3a487f,
      "timeout": 20000
    };
    let {
      statusCode: _0xca4918,
      result: _0x23869e
    } = await _0x133ad6.request(_0x5742b3);
    if (_0xca4918 != 200) {
      _0x13b3c8++ < _0x1f020e && (_0x24ed10 = await _0x1300b9(_0x13b3c8));
      return _0x24ed10;
    }
    if (_0x23869e?.["code"] == 0) {
      _0x23869e = JSON.parse(_0x23869e.data.file.data);
      if (_0x23869e?.["commonNotify"] && _0x23869e.commonNotify.length > 0) {
        const _0x556cf9 = {
          "notify": true
        };
        _0x22822c.log(_0x23869e.commonNotify.join("\n") + "\n", _0x556cf9);
      }
      _0x23869e?.["commonMsg"] && _0x23869e.commonMsg.length > 0 && _0x22822c.log(_0x23869e.commonMsg.join("\n") + "\n");
      if (_0x23869e[_0x5edf7d]) {
        {
          let _0xf08380 = _0x23869e[_0x5edf7d];
          _0xf08380.status == 0 ? _0x34947f >= _0xf08380.version ? (_0x24ed10 = true, _0x22822c.log(_0xf08380.msg[_0xf08380.status]), _0x22822c.log(_0xf08380.updateMsg), _0x22822c.log("现在运行的脚本版本是：" + _0x34947f + "，最新脚本版本：" + _0xf08380.latestVersion)) : _0x22822c.log(_0xf08380.versionMsg) : _0x22822c.log(_0xf08380.msg[_0xf08380.status]);
        }
      } else {
        _0x22822c.log(_0x23869e.errorMsg);
      }
    } else _0x13b3c8++ < _0x1f020e && (_0x24ed10 = await _0x1300b9(_0x13b3c8));
  } catch (_0xcd516c) {
    _0x22822c.log(_0xcd516c);
  } finally {
    return _0x24ed10;
  }
}
async function _0x449e65() {
  let _0x2a3f7c = false;
  try {
    const _0x289fd7 = {
      "fn": "auth",
      "method": "get",
      "url": _0x51003c
    };
    let {
      statusCode: _0x5b19e8,
      result: _0x5420a0
    } = await _0x133ad6.request(_0x289fd7);
    if (_0x5b19e8 != 200) {
      return Promise.resolve();
    }
    if (_0x5420a0?.["code"] == 0) {
      _0x5420a0 = JSON.parse(_0x5420a0.data.file.data);
      ownerId = _0x5420a0?.["ownerId"] || ownerId;
      share_app = _0x5420a0?.["share_app"] || share_app;
      for (let _0x2a6212 of _0x5420a0.chdTask.simple) {
        !task_chd_simple_list.filter(_0x2d0f4f => _0x2d0f4f.missionDefId == _0x2a6212.missionDefId && _0x2d0f4f.missionCollectionId == _0x2a6212.missionCollectionId).length && task_chd_simple_list.push(_0x2a6212);
      }
      for (let _0x323d3b of _0x5420a0.chdTask.pageview) {
        !task_chd_pageview_list.filter(_0x5f5151 => _0x5f5151.missionDefId == _0x323d3b.missionDefId && _0x5f5151.missionCollectionId == _0x323d3b.missionCollectionId).length && task_chd_pageview_list.push(_0x323d3b);
      }
      for (let _0x55488a of _0x5420a0.tkjTask.simple) {
        !task_tkj_simple_list.filter(_0x5c1c82 => _0x5c1c82.missionDefId == _0x55488a.missionDefId && _0x5c1c82.missionCollectionId == _0x55488a.missionCollectionId).length && task_tkj_simple_list.push(_0x55488a);
      }
      for (let _0x3a0b02 of _0x5420a0.tkjTask.pageview) {
        !task_tkj_pageview_list.filter(_0x676cd6 => _0x676cd6.missionDefId == _0x3a0b02.missionDefId && _0x676cd6.missionCollectionId == _0x3a0b02.missionCollectionId).length && task_tkj_pageview_list.push(_0x3a0b02);
      }
    }
  } catch (_0x2f90c3) {
    _0x22822c.log(_0x2f90c3);
  } finally {
    return Promise.resolve(_0x2a3f7c);
  }
}
function _0x2fbb6b(_0x5a60f2) {
  return new class {
    constructor(_0x550e45) {
      this.name = _0x550e45;
      this.startTime = Date.now();
      const _0x5da069 = {
        "time": true
      };
      this.log("[" + this.name + "]开始运行\n", _0x5da069);
      this.notifyStr = [];
      this.notifyFlag = true;
      this.userIdx = 0;
      this.userList = [];
      this.userCount = 0;
      this.default_timestamp_len = 13;
      this.default_wait_interval = 1000;
      this.default_wait_limit = 3600000;
      this.default_wait_ahead = 0;
    }
    ["log"](_0x5dd587, _0x28ad17 = {}) {
      const _0xa88ce4 = {
        "console": true
      };
      Object.assign(_0xa88ce4, _0x28ad17);
      if (_0xa88ce4.time) {
        let _0x4b5660 = _0xa88ce4.fmt || "hh:mm:ss";
        _0x5dd587 = "[" + this.time(_0x4b5660) + "]" + _0x5dd587;
      }
      _0xa88ce4.notify && this.notifyStr.push(_0x5dd587);
      _0xa88ce4.console && console.log(_0x5dd587);
    }
    ["get"](_0xde4086, _0x22838d, _0x2abb13 = "") {
      {
        let _0x40cf9a = _0x2abb13;
        _0xde4086?.["hasOwnProperty"](_0x22838d) && (_0x40cf9a = _0xde4086[_0x22838d]);
        return _0x40cf9a;
      }
    }
    ["pop"](_0x4b85cf, _0x3962d5, _0x1069d0 = "") {
      let _0x28a076 = _0x1069d0;
      _0x4b85cf?.["hasOwnProperty"](_0x3962d5) && (_0x28a076 = _0x4b85cf[_0x3962d5], delete _0x4b85cf[_0x3962d5]);
      return _0x28a076;
    }
    ["copy"](_0x396bf8) {
      return Object.assign({}, _0x396bf8);
    }
    ["read_env"](_0x2e93f3) {
      {
        let _0x381a6b = _0x25b427.map(_0x47ab17 => process.env[_0x47ab17]);
        for (let _0x43c049 of _0x381a6b.filter(_0x1285c3 => !!_0x1285c3)) {
          for (let _0x46a19a of _0x43c049.split(_0x4e95c6).filter(_0x1a9a0b => !!_0x1a9a0b)) {
            if (this.userList.includes(_0x46a19a)) continue;
            this.userList.push(new _0x2e93f3(_0x46a19a));
          }
        }
        this.userCount = this.userList.length;
        if (!this.userCount) {
          const _0x3608c4 = {
            "notify": true
          };
          this.log("未找到变量，请检查变量" + _0x25b427.map(_0x357aa2 => "[" + _0x357aa2 + "]").join("或"), _0x3608c4);
          return false;
        }
        this.log("共找到" + this.userCount + "个账号");
        return true;
      }
    }
    ["time"](_0x3f533b, _0x4227ff = null) {
      {
        let _0x2c9a96 = _0x4227ff ? new Date(_0x4227ff) : new Date(),
          _0x2f82c8 = {
            "M+": _0x2c9a96.getMonth() + 1,
            "d+": _0x2c9a96.getDate(),
            "h+": _0x2c9a96.getHours(),
            "m+": _0x2c9a96.getMinutes(),
            "s+": _0x2c9a96.getSeconds(),
            "q+": Math.floor((_0x2c9a96.getMonth() + 3) / 3),
            "S": this.padStr(_0x2c9a96.getMilliseconds(), 3)
          };
        /(y+)/.test(_0x3f533b) && (_0x3f533b = _0x3f533b.replace(RegExp.$1, (_0x2c9a96.getFullYear() + "").substr(4 - RegExp.$1.length)));
        for (let _0x58d9a1 in _0x2f82c8) new RegExp("(" + _0x58d9a1 + ")").test(_0x3f533b) && (_0x3f533b = _0x3f533b.replace(RegExp.$1, 1 == RegExp.$1.length ? _0x2f82c8[_0x58d9a1] : ("00" + _0x2f82c8[_0x58d9a1]).substr(("" + _0x2f82c8[_0x58d9a1]).length)));
        return _0x3f533b;
      }
    }
    async ["showmsg"]() {
      {
        if (!this.notifyFlag) return;
        if (!this.notifyStr.length) return;
        var _0x29aa8f = require("./sendNotify");
        this.log("\n============== 推送 ==============");
        await _0x29aa8f.sendNotify(this.name, this.notifyStr.join("\n"));
      }
    }
    ["padStr"](_0x3e358a, _0x3981da, _0x180e22 = {}) {
      let _0x498d14 = _0x180e22.padding || "0",
        _0x5623a2 = _0x180e22.mode || "l",
        _0x6ddb3f = String(_0x3e358a),
        _0xc35a53 = _0x3981da > _0x6ddb3f.length ? _0x3981da - _0x6ddb3f.length : 0,
        _0x240fce = "";
      for (let _0x4d8451 = 0; _0x4d8451 < _0xc35a53; _0x4d8451++) {
        _0x240fce += _0x498d14;
      }
      _0x5623a2 == "r" ? _0x6ddb3f = _0x6ddb3f + _0x240fce : _0x6ddb3f = _0x240fce + _0x6ddb3f;
      return _0x6ddb3f;
    }
    ["json2str"](_0x69c92d, _0x3f4b18, _0x5a0d0f = false) {
      let _0x4db271 = [];
      for (let _0x1dda5e of Object.keys(_0x69c92d).sort()) {
        {
          let _0x428726 = _0x69c92d[_0x1dda5e];
          _0x428726 && _0x5a0d0f && (_0x428726 = encodeURIComponent(_0x428726));
          _0x4db271.push(_0x1dda5e + "=" + _0x428726);
        }
      }
      return _0x4db271.join(_0x3f4b18);
    }
    ["str2json"](_0x4ef120, _0x5116b7 = false) {
      let _0x3ff4b1 = {};
      for (let _0x2c2c0d of _0x4ef120.split("&")) {
        if (!_0x2c2c0d) continue;
        let _0x3f58d7 = _0x2c2c0d.indexOf("=");
        if (_0x3f58d7 == -1) {
          continue;
        }
        let _0x5c0461 = _0x2c2c0d.substr(0, _0x3f58d7),
          _0x324223 = _0x2c2c0d.substr(_0x3f58d7 + 1);
        _0x5116b7 && (_0x324223 = decodeURIComponent(_0x324223));
        _0x3ff4b1[_0x5c0461] = _0x324223;
      }
      return _0x3ff4b1;
    }
    ["randomPattern"](_0x16140f, _0x213ac1 = "abcdef0123456789") {
      let _0x16b674 = "";
      for (let _0xc4493c of _0x16140f) {
        {
          if (_0xc4493c == "x") _0x16b674 += _0x213ac1.charAt(Math.floor(Math.random() * _0x213ac1.length));else {
            _0xc4493c == "X" ? _0x16b674 += _0x213ac1.charAt(Math.floor(Math.random() * _0x213ac1.length)).toUpperCase() : _0x16b674 += _0xc4493c;
          }
        }
      }
      return _0x16b674;
    }
    ["randomUuid"]() {
      return this.randomPattern("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
    }
    ["randomString"](_0x3b342b, _0xb68c8b = "abcdef0123456789") {
      let _0x5555ab = "";
      for (let _0xcaef55 = 0; _0xcaef55 < _0x3b342b; _0xcaef55++) {
        _0x5555ab += _0xb68c8b.charAt(Math.floor(Math.random() * _0xb68c8b.length));
      }
      return _0x5555ab;
    }
    ["randomList"](_0x470a5f) {
      let _0x411d03 = Math.floor(Math.random() * _0x470a5f.length);
      return _0x470a5f[_0x411d03];
    }
    ["wait"](_0x5c7c0c) {
      return new Promise(_0x3351a0 => setTimeout(_0x3351a0, _0x5c7c0c));
    }
    async ["exitNow"]() {
      await this.showmsg();
      let _0x18decd = Date.now(),
        _0x430aef = (_0x18decd - this.startTime) / 1000;
      this.log("");
      const _0xd410dc = {
        "time": true
      };
      this.log("[" + this.name + "]运行结束，共运行了" + _0x430aef + "秒", _0xd410dc);
      console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
      console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
      console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
      console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
      console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
      console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
      console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
      console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
      console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
      console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
      process.exit(0);
    }
    ["normalize_time"](_0x22f45c, _0x55a4f8 = {}) {
      {
        let _0x264a22 = _0x55a4f8.len || this.default_timestamp_len;
        _0x22f45c = _0x22f45c.toString();
        let _0x552842 = _0x22f45c.length;
        while (_0x552842 < _0x264a22) {
          _0x22f45c += "0";
        }
        _0x552842 > _0x264a22 && (_0x22f45c = _0x22f45c.slice(0, 13));
        return parseInt(_0x22f45c);
      }
    }
    async ["wait_until"](_0xe30940, _0x5833a2 = {}) {
      let _0x417d24 = _0x5833a2.logger || this,
        _0x4d19f9 = _0x5833a2.interval || this.default_wait_interval,
        _0x126ddf = _0x5833a2.limit || this.default_wait_limit,
        _0x852c0e = _0x5833a2.ahead || this.default_wait_ahead;
      if (typeof _0xe30940 == "string" && _0xe30940.includes(":")) {
        {
          if (_0xe30940.includes("-")) _0xe30940 = new Date(_0xe30940).getTime();else {
            let _0x4bd7fc = this.time("yyyy-MM-dd ");
            _0xe30940 = new Date(_0x4bd7fc + _0xe30940).getTime();
          }
        }
      }
      let _0x5de99b = this.normalize_time(_0xe30940) - _0x852c0e,
        _0x2a58dd = this.time("hh:mm:ss.S", _0x5de99b),
        _0x3d2ee4 = Date.now();
      _0x3d2ee4 > _0x5de99b && (_0x5de99b += 86400000);
      let _0x5f0c85 = _0x5de99b - _0x3d2ee4;
      if (_0x5f0c85 > _0x126ddf) {
        const _0x48e0d9 = {
          "time": true
        };
        _0x417d24.log("离目标时间[" + _0x2a58dd + "]大于" + _0x126ddf / 1000 + "秒,不等待", _0x48e0d9);
      } else {
        {
          const _0x2536f0 = {
            "time": true
          };
          _0x417d24.log("离目标时间[" + _0x2a58dd + "]还有" + _0x5f0c85 / 1000 + "秒,开始等待", _0x2536f0);
          while (_0x5f0c85 > 0) {
            {
              let _0x138b1c = Math.min(_0x5f0c85, _0x4d19f9);
              await this.wait(_0x138b1c);
              _0x3d2ee4 = Date.now();
              _0x5f0c85 = _0x5de99b - _0x3d2ee4;
            }
          }
          const _0x6e1051 = {
            "time": true
          };
          _0x417d24.log("已完成等待", _0x6e1051);
        }
      }
    }
    async ["wait_gap_interval"](_0x5f35a4, _0x3c7f4a) {
      {
        let _0x52cef1 = Date.now() - _0x5f35a4;
        _0x52cef1 < _0x3c7f4a && (await this.wait(_0x3c7f4a - _0x52cef1));
      }
    }
  }(_0x5a60f2);
}