/*
渤海宣传员-微信小程序 v2.01

签到积分换E卡，每天跑一到两次
捉小程序里的uid和token填到bhxcytoken里，多账号换行或者@隔开，格式如下
export bhxcytoken="uid=1234567&token=qweqwertyuio"

重写: 打开渤海宣传员-微信小程序
[task_local]
#渤海宣传员
44 7,18 * * * https://raw.githubusercontent.com/leafTheFish/DeathNote/main/bhxcy.js, tag=渤海宣传员, enabled=true
[rewrite_local]
https://gms.ihaoqu.com/gmswx/app.php url script-request-body https://raw.githubusercontent.com/leafTheFish/DeathNote/main/bhxcy.js
[MITM]
hostname = gms.ihaoqu.com

cron: 44 7,18 * * *

const $ = new Env("渤海宣传员");
*/
//Sat Jan 25 2025 08:37:55 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const _0x1d0ae3 = new _0x57bfb2("渤海宣传员");
const _0x394c79 = ["\n", "@"];
const _0x217681 = ["bhxcytoken"];
let _0x156dc7 = _0x217681.map(_0x26bc59 => (_0x1d0ae3.isNode() ? process.env[_0x26bc59] : _0x1d0ae3.getdata(_0x26bc59)) || "");
let _0x118ed0 = [];
let _0x5a32e1 = 0;
let _0x33bf72 = 0;
const _0x967734 = "application/x-www-form-urlencoded";
const _0x1ad500 = "Mozilla/5.0 (Linux; Android 9; MI 8 Build/PQ3A.190801.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4309 MMWEBSDK/20220402 Mobile Safari/537.36 MMWEBID/4681 MicroMessenger/8.0.22.2140(0x280016F8) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android";
const _0x3ca0e5 = "https://servicewechat.com/wx4ab510946f1d9a5f/16/page-frame.html";
const _0x448b0b = 28;
const _0x554762 = 10;
const _0x16a5db = 1;
const _0x5765f9 = "api2";
const _0x151841 = "2022hqhd10bhyh20";
let _0x396a62 = new Date().getDay();
_0x396a62 = _0x396a62 == 0 ? 7 : _0x396a62;
const _0x1ca024 = 8;
const _0x519bb3 = 300;
const _0x4e0686 = 1000;
const _0x5e3f67 = 2.01;
const _0x4b2aa5 = "bhxcy";
const _0x232801 = "https://leafxcy.coding.net/api/user/leafxcy/project/validcode/shared-depot/validCode/git/blob/master/code.json";
class _0x4ea0f5 {
  constructor(_0x2f6888) {
    this.index = ++_0x5a32e1;
    this.name = this.index;
    this.valid = false;
    Object.assign(this, _0x1d0ae3.str2json(_0x2f6888));
  }
  async taskApi(_0x46df8a = {}) {
    let _0x1e3dc5 = {};
    try {
      let _0x363e86 = _0x46df8a.url.replace("//", "/").split("/")[1];
      let _0x246b6f = _0x46df8a.url;
      if (_0x46df8a.queryParam) {
        _0x246b6f += "?" + _0x1d0ae3.json2str(_0x46df8a.queryParam, "&", true);
      }
      const _0x3ce031 = {
        Host: _0x363e86,
        Connection: "keep-alive",
        "User-Agent": _0x1ad500,
        Referer: _0x3ca0e5
      };
      let _0x4d50c7 = {
        url: _0x246b6f,
        headers: _0x3ce031,
        timeout: 5000
      };
      if (_0x46df8a.body) {
        _0x4d50c7.headers["Content-Type"] = _0x46df8a["Content-Type"] || _0x967734;
        if (typeof _0x46df8a.body === "object") {
          if (_0x4d50c7.headers["Content-Type"].includes("json")) {
            _0x4d50c7.body = JSON.stringify(_0x46df8a.body);
          } else {
            for (let _0x234702 in _0x46df8a.body) {
              typeof _0x46df8a.body[_0x234702] === "object" && (_0x46df8a.body[_0x234702] = JSON.stringify(_0x46df8a.body[_0x234702]));
            }
            _0x4d50c7.body = _0x1d0ae3.json2str(_0x46df8a.body, "&");
          }
        } else {
          _0x4d50c7.body = _0x46df8a.body;
        }
        _0x1d0ae3.isNode() ? _0x4d50c7.headers["Content-Length"] = _0x4d50c7.body ? Buffer.byteLength(_0x4d50c7.body, "utf8") : 0 : _0x4d50c7.headers["Content-Length"] = _0x4d50c7.body ? _0x4d50c7.body.length : 0;
      }
      if (_0x46df8a.urlObjectParam) {
        Object.assign(_0x4d50c7, _0x46df8a.urlObjectParam);
      }
      if (_0x46df8a.headerParam) {
        Object.assign(_0x4d50c7.headers, _0x46df8a.headerParam);
      }
      if (_0x46df8a.debugIn) {
        console.log(_0x4d50c7);
      }
      _0x1e3dc5 = Object.assign({}, await _0x3bb42a(_0x46df8a.method, _0x4d50c7));
      _0x1e3dc5.statusCode = _0x1e3dc5?.["err"]?.["response"]?.["statusCode"] || _0x1e3dc5?.["resp"]?.["statusCode"];
      _0x1e3dc5.statusCode != 200 && console.log("[" + _0x46df8a.fn + "]返回[" + _0x1e3dc5.statusCode + "]");
      if (_0x1e3dc5?.["resp"]?.["body"]) {
        if (_0x46df8a.debugOut) {
          console.log(_0x1e3dc5?.["resp"]?.["body"]);
        }
        if (typeof _0x1e3dc5.resp.body === "object") {
          _0x1e3dc5.result = _0x1e3dc5.resp.body;
        } else {
          try {
            _0x1e3dc5.result = JSON.parse(_0x1e3dc5.resp.body);
          } catch (_0x4423c0) {
            _0x1e3dc5.result = _0x1e3dc5.resp.body;
          }
        }
      }
    } catch (_0x27584a) {
      console.log(_0x27584a);
    } finally {
      return Promise.resolve(_0x1e3dc5);
    }
  }
  getQueryParam(_0x477445) {
    let _0x18f22b = {
      rid: _0x448b0b,
      ogid: _0x554762,
      noauth: _0x16a5db,
      r: _0x5765f9,
      apiAction: _0x477445
    };
    return _0x18f22b;
  }
  async getUserInfo() {
    let _0x149f12 = {};
    try {
      let _0x427ae5 = "getUserInfo";
      let _0x2e614f = {
        uid: this.uid,
        token: this.token,
        signure: _0x162740("" + _0x427ae5 + this.uid + _0x151841 + this.token)
      };
      let _0x40579d = {
        fn: _0x427ae5,
        method: "post",
        url: "https://gms.ihaoqu.com/gmswx/app.php",
        queryParam: this.getQueryParam(_0x427ae5),
        body: _0x2e614f
      };
      _0x149f12 = Object.assign({}, await this.taskApi(_0x40579d));
      let _0x17442d = _0x149f12.result;
      if (_0x17442d?.["result"] == 1) {
        this.phone = _0x17442d.MobilePhone.toString();
        this.name = this.phone.slice(0, 3) + "****" + this.phone.slice(7, 11);
        this.invCode = _0x17442d.invCode;
        this.point = _0x17442d.PhoneBill;
        this.hasSign = _0x17442d.signIn[_0x396a62] == 2 ? true : false;
        console.log("手机：" + this.phone);
        console.log("邀请：" + this.invCode);
        console.log("余额：" + this.point + "元");
        console.log("今天" + (this.hasSign ? "已" : "未") + "签到");
        !this.hasSign && (await this.SignIn());
        await this.getNotifyInfo();
        parseFloat(this.point) >= 10 && (await this.Recharge());
      } else {
        _0x1d0ae3.logAndNotify("账号[" + this.index + "]登录失败: " + _0x17442d?.["msg"]);
      }
    } catch (_0x454ba2) {
      console.log(_0x454ba2);
    } finally {
      return Promise.resolve(_0x149f12);
    }
  }
  async getNotifyInfo() {
    let _0x372951 = {};
    try {
      let _0x2a4013 = "getUserInfo";
      let _0x387163 = {
        uid: this.uid,
        token: this.token,
        signure: _0x162740("" + _0x2a4013 + this.uid + _0x151841 + this.token)
      };
      let _0xfe9ff0 = {
        fn: _0x2a4013,
        method: "post",
        url: "https://gms.ihaoqu.com/gmswx/app.php",
        queryParam: this.getQueryParam(_0x2a4013),
        body: _0x387163
      };
      _0x372951 = Object.assign({}, await this.taskApi(_0xfe9ff0));
      let _0x5ab653 = _0x372951.result;
      _0x5ab653?.["result"] == 1 ? (this.point = _0x5ab653.PhoneBill, _0x1d0ae3.logAndNotify("账号[" + this.index + "][" + this.name + "]余额: " + this.point + "元")) : _0x1d0ae3.logAndNotify("账号[" + this.index + "][" + this.name + "]查询余额失败: " + _0x5ab653?.["msg"]);
    } catch (_0x37aecc) {
      console.log(_0x37aecc);
    } finally {
      return Promise.resolve(_0x372951);
    }
  }
  async SignIn() {
    let _0x3350dd = {};
    try {
      let _0x14edc6 = "SignIn";
      let _0xabf2e = {
        uid: this.uid,
        token: this.token,
        signure: _0x162740("" + this.token + _0x151841 + this.uid + _0x14edc6)
      };
      let _0x12a32a = {
        fn: _0x14edc6,
        method: "post",
        url: "https://gms.ihaoqu.com/gmswx/app.php",
        queryParam: this.getQueryParam(_0x14edc6),
        body: _0xabf2e
      };
      _0x3350dd = Object.assign({}, await this.taskApi(_0x12a32a));
      let _0x132263 = _0x3350dd.result;
      _0x132263?.["result"] == 1 ? console.log("签到成功: " + _0x132263.msg) : console.log("签到失败: " + _0x132263?.["msg"]);
    } catch (_0x22e7fa) {
      console.log(_0x22e7fa);
    } finally {
      return Promise.resolve(_0x3350dd);
    }
  }
  async Recharge() {
    let _0x540095 = {};
    try {
      let _0x262dd2 = "Recharge";
      let _0x7271b1 = 1;
      let _0x35670c = 2;
      let _0x1fcbe8 = {
        uid: this.uid,
        token: this.token,
        Type: _0x7271b1,
        Category: _0x35670c,
        signure: _0x162740("" + _0x262dd2 + this.uid + _0x151841 + _0x35670c + this.token + _0x7271b1)
      };
      let _0x27895c = {
        fn: _0x262dd2,
        method: "post",
        url: "https://gms.ihaoqu.com/gmswx/app.php",
        queryParam: this.getQueryParam(_0x262dd2),
        body: _0x1fcbe8
      };
      _0x540095 = Object.assign({}, await this.taskApi(_0x27895c));
      let _0x3c4bab = _0x540095.result;
      _0x3c4bab?.["result"] == 1 ? _0x1d0ae3.logAndNotify("[" + this.name + "]兑换E卡成功: " + _0x3c4bab.msg) : _0x1d0ae3.logAndNotify("[" + this.name + "]兑换E卡失败: " + _0x3c4bab?.["msg"]);
    } catch (_0x3c981d) {
      console.log(_0x3c981d);
    } finally {
      return Promise.resolve(_0x540095);
    }
  }
  async userTask() {
    let _0x3f73b4 = {};
    try {
      console.log("\n============= 账号[" + this.index + "] =============");
      await this.getUserInfo();
    } catch (_0x32c771) {
      console.log(_0x32c771);
    } finally {
      return Promise.resolve(_0x3f73b4);
    }
  }
}
!(async () => {
  if (typeof $request !== "undefined") {
    await _0xca504e();
    return;
  }
  if (!(await _0x524745())) {
    return;
  }
  if (!_0x2e8fd7()) {
    return;
  }
  for (let _0x20285a of _0x118ed0) {
    await _0x20285a.userTask();
  }
})().catch(_0x52e8c7 => console.log(_0x52e8c7)).finally(() => _0x1d0ae3.done());
async function _0xca504e() {
  if ($request.url.includes("getUserInfo")) {
    try {
      let _0x4fbc6a = $request.body;
      let _0x3a4c28 = _0x1d0ae3.str2json(_0x4fbc6a);
      let _0x528211 = _0x3a4c28.uid;
      let _0x5cc84a = _0x3a4c28.token;
      if (!_0x528211 || !_0x5cc84a) {
        return;
      }
      if (_0x528211 == "undefined" || _0x5cc84a == "undefined") {
        return;
      }
      let _0x4bf3e4 = "uid=" + _0x528211;
      let _0x4150d4 = "uid=" + _0x528211 + "&token=" + _0x5cc84a;
      let _0x55a9ef = false;
      for (let _0x3f4443 of _0x217681) {
        let _0x7a80f1 = (_0x1d0ae3.isNode() ? process.env[_0x3f4443] : _0x1d0ae3.getdata(_0x3f4443)) || "";
        let _0x2f12e2 = _0x394c79[0];
        for (let _0x19bee5 of _0x394c79) {
          if (_0x7a80f1?.["includes"](_0x19bee5)) {
            _0x2f12e2 = _0x19bee5;
            break;
          }
        }
        if (_0x7a80f1?.["includes"](_0x4bf3e4)) {
          let _0x918533 = _0x7a80f1.split(_0x2f12e2);
          for (let _0x171e08 in _0x918533) {
            console.log(_0x171e08);
            if (_0x918533[_0x171e08]?.["includes"](_0x4bf3e4)) {
              _0x918533[_0x171e08] = _0x4150d4;
              _0x1d0ae3.msg("更新第" + (Number(_0x171e08) + 1) + "个账户CK成功，保存到变量[" + _0x3f4443 + "]: " + _0x4150d4);
              _0x55a9ef = true;
              break;
            }
          }
          _0x7a80f1 = _0x918533.join(_0x2f12e2);
          _0x1d0ae3.setdata(_0x7a80f1, _0x3f4443);
        }
      }
      if (!_0x55a9ef) {
        let _0x25bd00 = _0x217681[0];
        let _0x57aae7 = (_0x1d0ae3.isNode() ? process.env[_0x25bd00] : _0x1d0ae3.getdata(_0x25bd00)) || "";
        let _0x1036bb = _0x394c79[0];
        for (let _0x453ccb of _0x394c79) {
          if (_0x57aae7?.["includes"](_0x453ccb)) {
            _0x1036bb = _0x453ccb;
            break;
          }
        }
        let _0x32104d = _0x57aae7 ? _0x57aae7.split(_0x1036bb) : [];
        _0x32104d.push(_0x4150d4);
        _0x57aae7 = _0x32104d.join(_0x1036bb);
        _0x1d0ae3.setdata(_0x57aae7, _0x25bd00);
        _0x1d0ae3.msg("获取第" + _0x32104d.length + "个账户CK成功，保存到变量[" + _0x25bd00 + "]: " + _0x4150d4);
      }
    } catch (_0x3a170a) {
      console.log(_0x3a170a);
    }
  }
}
function _0x2e8fd7() {
  for (let _0x33f3e4 of _0x156dc7) {
    if (!_0x33f3e4) {
      continue;
    }
    let _0x179c0d = _0x394c79[0];
    for (let _0x42e146 of _0x394c79) {
      if (_0x33f3e4.includes(_0x42e146)) {
        _0x179c0d = _0x42e146;
        break;
      }
    }
    for (let _0x25a204 of _0x33f3e4.split(_0x179c0d).filter(_0x45f451 => !!_0x45f451)) {
      _0x118ed0.push(new _0x4ea0f5(_0x25a204));
    }
  }
  _0x33bf72 = _0x118ed0.length;
  if (!_0x33bf72) {
    console.log("未找到CK，请检查变量" + _0x217681.join("或"));
    return false;
  }
  console.log("共找到" + _0x33bf72 + "个账号");
  return true;
}
async function _0x524745(_0x216eeb = 0) {
  let _0x4c3164 = false;
  try {
    let _0x2decca = {
      url: _0x232801,
      timeout: 5000
    };
    let _0x2eda60 = null;
    let _0x2ddd29 = await _0x3bb42a("get", _0x2decca);
    if (_0x2ddd29.err) {
      console.log("服务器错误[" + _0x2ddd29?.["resp"]?.["statusCode"] + "]，重试...");
    } else {
      try {
        typeof _0x2ddd29.resp.body === "object" ? _0x2eda60 = _0x2ddd29.resp.body : _0x2eda60 = JSON.parse(_0x2ddd29.resp.body);
        _0x2eda60 = JSON.parse(_0x2eda60.data.file.data);
      } catch (_0x3383a0) {
        console.log(_0x3383a0);
      }
    }
    if (!_0x2eda60) {
      if (_0x216eeb < _0x1ca024) {
        let _0x2c68bd = Math.floor(Math.random() * _0x4e0686) + _0x519bb3;
        _0x4c3164 = await _0x524745(++_0x216eeb);
      }
    } else {
      _0x2eda60?.["commonNotify"] && _0x2eda60.commonNotify.length > 0 && _0x1d0ae3.logAndNotify(_0x2eda60.commonNotify.join("\n") + "\n", false);
      _0x2eda60?.["commonMsg"] && _0x2eda60.commonMsg.length > 0 && console.log(_0x2eda60.commonMsg.join("\n") + "\n");
      if (_0x2eda60[_0x4b2aa5]) {
        let _0x574c4a = _0x2eda60[_0x4b2aa5];
        _0x574c4a.status == 0 ? _0x5e3f67 >= _0x574c4a.version ? (_0x4c3164 = true, console.log(_0x574c4a.msg[_0x574c4a.status]), console.log(_0x574c4a.updateMsg), console.log("现在运行的脚本版本是：" + _0x5e3f67 + "，最新脚本版本：" + _0x574c4a.latestVersion)) : console.log(_0x574c4a.versionMsg) : console.log(_0x574c4a.msg[_0x574c4a.status]);
      } else {
        console.log(_0x2eda60.errorMsg);
      }
    }
  } catch (_0x2a7776) {
    console.log(_0x2a7776);
  } finally {
    return Promise.resolve(_0x4c3164);
  }
}
async function _0x3bb42a(_0x36c533, _0x484bcf) {
  return new Promise(_0x3e345a => {
    _0x1d0ae3.send(_0x36c533, _0x484bcf, async (_0x28de57, _0x3e8ff9, _0x2dea1a) => {
      const _0x193395 = {
        err: _0x28de57,
        req: _0x3e8ff9,
        resp: _0x2dea1a
      };
      _0x3e345a(_0x193395);
    });
  });
}
function _0x162740(_0x31e32f) {
  function _0x548fb1(_0x479090, _0x56a61d) {
    return _0x479090 << _0x56a61d | _0x479090 >>> 32 - _0x56a61d;
  }
  function _0xa370d4(_0x226321, _0x5a843c) {
    var _0x5b45ca;
    var _0x3b7687;
    var _0x58c586;
    var _0x945396;
    var _0x4be5f0;
    _0x58c586 = 2147483648 & _0x226321;
    _0x945396 = 2147483648 & _0x5a843c;
    _0x5b45ca = 1073741824 & _0x226321;
    _0x3b7687 = 1073741824 & _0x5a843c;
    _0x4be5f0 = (1073741823 & _0x226321) + (1073741823 & _0x5a843c);
    return _0x5b45ca & _0x3b7687 ? 2147483648 ^ _0x4be5f0 ^ _0x58c586 ^ _0x945396 : _0x5b45ca | _0x3b7687 ? 1073741824 & _0x4be5f0 ? 3221225472 ^ _0x4be5f0 ^ _0x58c586 ^ _0x945396 : 1073741824 ^ _0x4be5f0 ^ _0x58c586 ^ _0x945396 : _0x4be5f0 ^ _0x58c586 ^ _0x945396;
  }
  function _0x2ac621(_0x2c4876, _0x490edd, _0x73b0f4) {
    return _0x2c4876 & _0x490edd | ~_0x2c4876 & _0x73b0f4;
  }
  function _0x4412a8(_0x108bff, _0x17a961, _0x204f65) {
    return _0x108bff & _0x204f65 | _0x17a961 & ~_0x204f65;
  }
  function _0x1cd285(_0x1fef85, _0x5b8522, _0x5c55b7) {
    return _0x1fef85 ^ _0x5b8522 ^ _0x5c55b7;
  }
  function _0x2fcfe8(_0x3711ed, _0x51bc42, _0x20b535) {
    return _0x51bc42 ^ (_0x3711ed | ~_0x20b535);
  }
  function _0x3de9dd(_0x52317f, _0x428053, _0x525480, _0x5e8889, _0x316160, _0x283b45, _0x25c849) {
    _0x52317f = _0xa370d4(_0x52317f, _0xa370d4(_0xa370d4(_0x2ac621(_0x428053, _0x525480, _0x5e8889), _0x316160), _0x25c849));
    return _0xa370d4(_0x548fb1(_0x52317f, _0x283b45), _0x428053);
  }
  function _0x45e2bf(_0x411d95, _0x89ace5, _0x13c956, _0x4972bc, _0x39ca9f, _0x18c9da, _0x127e9f) {
    _0x411d95 = _0xa370d4(_0x411d95, _0xa370d4(_0xa370d4(_0x4412a8(_0x89ace5, _0x13c956, _0x4972bc), _0x39ca9f), _0x127e9f));
    return _0xa370d4(_0x548fb1(_0x411d95, _0x18c9da), _0x89ace5);
  }
  function _0x3be045(_0x3a08eb, _0x22307b, _0xda5b36, _0x3bde50, _0x1fda83, _0xe3ce1b, _0x3a0c09) {
    _0x3a08eb = _0xa370d4(_0x3a08eb, _0xa370d4(_0xa370d4(_0x1cd285(_0x22307b, _0xda5b36, _0x3bde50), _0x1fda83), _0x3a0c09));
    return _0xa370d4(_0x548fb1(_0x3a08eb, _0xe3ce1b), _0x22307b);
  }
  function _0x50e33f(_0x2f6ac8, _0x5a4f2e, _0x543444, _0x539489, _0x43c816, _0x31dc30, _0x4151f7) {
    _0x2f6ac8 = _0xa370d4(_0x2f6ac8, _0xa370d4(_0xa370d4(_0x2fcfe8(_0x5a4f2e, _0x543444, _0x539489), _0x43c816), _0x4151f7));
    return _0xa370d4(_0x548fb1(_0x2f6ac8, _0x31dc30), _0x5a4f2e);
  }
  function _0x163b8f(_0xd16048) {
    for (var _0x3d506f, _0x14b279 = _0xd16048.length, _0x7fa52d = _0x14b279 + 8, _0x32825e = (_0x7fa52d - _0x7fa52d % 64) / 64, _0x5c3fd4 = 16 * (_0x32825e + 1), _0x1c1261 = new Array(_0x5c3fd4 - 1), _0x28bea6 = 0, _0x2e5a2c = 0; _0x14b279 > _0x2e5a2c;) {
      _0x3d506f = (_0x2e5a2c - _0x2e5a2c % 4) / 4;
      _0x28bea6 = _0x2e5a2c % 4 * 8;
      _0x1c1261[_0x3d506f] = _0x1c1261[_0x3d506f] | _0xd16048.charCodeAt(_0x2e5a2c) << _0x28bea6;
      _0x2e5a2c++;
    }
    _0x3d506f = (_0x2e5a2c - _0x2e5a2c % 4) / 4;
    _0x28bea6 = _0x2e5a2c % 4 * 8;
    _0x1c1261[_0x3d506f] = _0x1c1261[_0x3d506f] | 128 << _0x28bea6;
    _0x1c1261[_0x5c3fd4 - 2] = _0x14b279 << 3;
    _0x1c1261[_0x5c3fd4 - 1] = _0x14b279 >>> 29;
    return _0x1c1261;
  }
  function _0x11a6b9(_0x1d7046) {
    var _0x55950d;
    var _0x3d87ca;
    var _0xd266da = "";
    var _0x38db02 = "";
    for (_0x3d87ca = 0; 3 >= _0x3d87ca; _0x3d87ca++) {
      _0x55950d = _0x1d7046 >>> 8 * _0x3d87ca & 255;
      _0x38db02 = "0" + _0x55950d.toString(16);
      _0xd266da += _0x38db02.substr(_0x38db02.length - 2, 2);
    }
    return _0xd266da;
  }
  function _0x46ebfd(_0x386079) {
    _0x386079 = _0x386079.replace(/\r\n/g, "\n");
    for (var _0x478c58 = "", _0x1adc14 = 0; _0x1adc14 < _0x386079.length; _0x1adc14++) {
      var _0xa1720a = _0x386079.charCodeAt(_0x1adc14);
      128 > _0xa1720a ? _0x478c58 += String.fromCharCode(_0xa1720a) : _0xa1720a > 127 && 2048 > _0xa1720a ? (_0x478c58 += String.fromCharCode(_0xa1720a >> 6 | 192), _0x478c58 += String.fromCharCode(63 & _0xa1720a | 128)) : (_0x478c58 += String.fromCharCode(_0xa1720a >> 12 | 224), _0x478c58 += String.fromCharCode(_0xa1720a >> 6 & 63 | 128), _0x478c58 += String.fromCharCode(63 & _0xa1720a | 128));
    }
    return _0x478c58;
  }
  var _0x2696b2;
  var _0x193214;
  var _0x446282;
  var _0xf3f57a;
  var _0x4161ad;
  var _0x46d665;
  var _0x269996;
  var _0x10a932;
  var _0x32668a;
  var _0x5b99ed = [];
  var _0xf3d0fb = 7;
  var _0x46fe31 = 12;
  var _0x12cd3d = 17;
  var _0x4d6ec0 = 22;
  var _0x54c5b1 = 5;
  var _0x3f960d = 9;
  var _0x24cbf9 = 14;
  var _0x57e243 = 20;
  var _0x30fbc2 = 4;
  var _0x2613fb = 11;
  var _0x1a37d4 = 16;
  var _0x144bcd = 23;
  var _0x46473c = 6;
  var _0xbbcc8 = 10;
  var _0x4570a7 = 15;
  var _0x5756b9 = 21;
  for (_0x31e32f = _0x46ebfd(_0x31e32f), _0x5b99ed = _0x163b8f(_0x31e32f), _0x46d665 = 1732584193, _0x269996 = 4023233417, _0x10a932 = 2562383102, _0x32668a = 271733878, _0x2696b2 = 0; _0x2696b2 < _0x5b99ed.length; _0x2696b2 += 16) {
    _0x193214 = _0x46d665;
    _0x446282 = _0x269996;
    _0xf3f57a = _0x10a932;
    _0x4161ad = _0x32668a;
    _0x46d665 = _0x3de9dd(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 0], _0xf3d0fb, 3614090360);
    _0x32668a = _0x3de9dd(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 1], _0x46fe31, 3905402710);
    _0x10a932 = _0x3de9dd(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 2], _0x12cd3d, 606105819);
    _0x269996 = _0x3de9dd(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 3], _0x4d6ec0, 3250441966);
    _0x46d665 = _0x3de9dd(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 4], _0xf3d0fb, 4118548399);
    _0x32668a = _0x3de9dd(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 5], _0x46fe31, 1200080426);
    _0x10a932 = _0x3de9dd(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 6], _0x12cd3d, 2821735955);
    _0x269996 = _0x3de9dd(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 7], _0x4d6ec0, 4249261313);
    _0x46d665 = _0x3de9dd(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 8], _0xf3d0fb, 1770035416);
    _0x32668a = _0x3de9dd(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 9], _0x46fe31, 2336552879);
    _0x10a932 = _0x3de9dd(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 10], _0x12cd3d, 4294925233);
    _0x269996 = _0x3de9dd(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 11], _0x4d6ec0, 2304563134);
    _0x46d665 = _0x3de9dd(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 12], _0xf3d0fb, 1804603682);
    _0x32668a = _0x3de9dd(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 13], _0x46fe31, 4254626195);
    _0x10a932 = _0x3de9dd(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 14], _0x12cd3d, 2792965006);
    _0x269996 = _0x3de9dd(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 15], _0x4d6ec0, 1236535329);
    _0x46d665 = _0x45e2bf(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 1], _0x54c5b1, 4129170786);
    _0x32668a = _0x45e2bf(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 6], _0x3f960d, 3225465664);
    _0x10a932 = _0x45e2bf(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 11], _0x24cbf9, 643717713);
    _0x269996 = _0x45e2bf(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 0], _0x57e243, 3921069994);
    _0x46d665 = _0x45e2bf(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 5], _0x54c5b1, 3593408605);
    _0x32668a = _0x45e2bf(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 10], _0x3f960d, 38016083);
    _0x10a932 = _0x45e2bf(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 15], _0x24cbf9, 3634488961);
    _0x269996 = _0x45e2bf(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 4], _0x57e243, 3889429448);
    _0x46d665 = _0x45e2bf(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 9], _0x54c5b1, 568446438);
    _0x32668a = _0x45e2bf(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 14], _0x3f960d, 3275163606);
    _0x10a932 = _0x45e2bf(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 3], _0x24cbf9, 4107603335);
    _0x269996 = _0x45e2bf(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 8], _0x57e243, 1163531501);
    _0x46d665 = _0x45e2bf(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 13], _0x54c5b1, 2850285829);
    _0x32668a = _0x45e2bf(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 2], _0x3f960d, 4243563512);
    _0x10a932 = _0x45e2bf(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 7], _0x24cbf9, 1735328473);
    _0x269996 = _0x45e2bf(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 12], _0x57e243, 2368359562);
    _0x46d665 = _0x3be045(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 5], _0x30fbc2, 4294588738);
    _0x32668a = _0x3be045(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 8], _0x2613fb, 2272392833);
    _0x10a932 = _0x3be045(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 11], _0x1a37d4, 1839030562);
    _0x269996 = _0x3be045(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 14], _0x144bcd, 4259657740);
    _0x46d665 = _0x3be045(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 1], _0x30fbc2, 2763975236);
    _0x32668a = _0x3be045(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 4], _0x2613fb, 1272893353);
    _0x10a932 = _0x3be045(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 7], _0x1a37d4, 4139469664);
    _0x269996 = _0x3be045(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 10], _0x144bcd, 3200236656);
    _0x46d665 = _0x3be045(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 13], _0x30fbc2, 681279174);
    _0x32668a = _0x3be045(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 0], _0x2613fb, 3936430074);
    _0x10a932 = _0x3be045(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 3], _0x1a37d4, 3572445317);
    _0x269996 = _0x3be045(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 6], _0x144bcd, 76029189);
    _0x46d665 = _0x3be045(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 9], _0x30fbc2, 3654602809);
    _0x32668a = _0x3be045(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 12], _0x2613fb, 3873151461);
    _0x10a932 = _0x3be045(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 15], _0x1a37d4, 530742520);
    _0x269996 = _0x3be045(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 2], _0x144bcd, 3299628645);
    _0x46d665 = _0x50e33f(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 0], _0x46473c, 4096336452);
    _0x32668a = _0x50e33f(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 7], _0xbbcc8, 1126891415);
    _0x10a932 = _0x50e33f(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 14], _0x4570a7, 2878612391);
    _0x269996 = _0x50e33f(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 5], _0x5756b9, 4237533241);
    _0x46d665 = _0x50e33f(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 12], _0x46473c, 1700485571);
    _0x32668a = _0x50e33f(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 3], _0xbbcc8, 2399980690);
    _0x10a932 = _0x50e33f(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 10], _0x4570a7, 4293915773);
    _0x269996 = _0x50e33f(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 1], _0x5756b9, 2240044497);
    _0x46d665 = _0x50e33f(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 8], _0x46473c, 1873313359);
    _0x32668a = _0x50e33f(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 15], _0xbbcc8, 4264355552);
    _0x10a932 = _0x50e33f(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 6], _0x4570a7, 2734768916);
    _0x269996 = _0x50e33f(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 13], _0x5756b9, 1309151649);
    _0x46d665 = _0x50e33f(_0x46d665, _0x269996, _0x10a932, _0x32668a, _0x5b99ed[_0x2696b2 + 4], _0x46473c, 4149444226);
    _0x32668a = _0x50e33f(_0x32668a, _0x46d665, _0x269996, _0x10a932, _0x5b99ed[_0x2696b2 + 11], _0xbbcc8, 3174756917);
    _0x10a932 = _0x50e33f(_0x10a932, _0x32668a, _0x46d665, _0x269996, _0x5b99ed[_0x2696b2 + 2], _0x4570a7, 718787259);
    _0x269996 = _0x50e33f(_0x269996, _0x10a932, _0x32668a, _0x46d665, _0x5b99ed[_0x2696b2 + 9], _0x5756b9, 3951481745);
    _0x46d665 = _0xa370d4(_0x46d665, _0x193214);
    _0x269996 = _0xa370d4(_0x269996, _0x446282);
    _0x10a932 = _0xa370d4(_0x10a932, _0xf3f57a);
    _0x32668a = _0xa370d4(_0x32668a, _0x4161ad);
  }
  var _0x21b4ef = _0x11a6b9(_0x46d665) + _0x11a6b9(_0x269996) + _0x11a6b9(_0x10a932) + _0x11a6b9(_0x32668a);
  return _0x21b4ef.toLowerCase();
}
function _0x57bfb2(_0x2a4acc, _0xf22ac7) {
  "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
  return new class {
    constructor(_0x261c25, _0x1aec30) {
      this.name = _0x261c25;
      this.notifyStr = "";
      this.notifyFlag = false;
      this.startTime = new Date().getTime();
      Object.assign(this, _0x1aec30);
      console.log(this.name + " 开始运行：\n");
    }
    isNode() {
      return "undefined" != typeof module && !!module.exports;
    }
    isQuanX() {
      return "undefined" != typeof $task;
    }
    isSurge() {
      return "undefined" != typeof $httpClient && "undefined" == typeof $loon;
    }
    isLoon() {
      return "undefined" != typeof $loon;
    }
    getdata(_0x26d05f) {
      let _0x2341ae = this.getval(_0x26d05f);
      if (/^@/.test(_0x26d05f)) {
        const [, _0x5d674e, _0x335555] = /^@(.*?)\.(.*?)$/.exec(_0x26d05f);
        const _0x53912f = _0x5d674e ? this.getval(_0x5d674e) : "";
        if (_0x53912f) {
          try {
            const _0x4c59b3 = JSON.parse(_0x53912f);
            _0x2341ae = _0x4c59b3 ? this.lodash_get(_0x4c59b3, _0x335555, "") : _0x2341ae;
          } catch (_0x4d5e82) {
            _0x2341ae = "";
          }
        }
      }
      return _0x2341ae;
    }
    setdata(_0x3b8ed9, _0x114bff) {
      let _0x634249 = false;
      if (/^@/.test(_0x114bff)) {
        const [, _0x35934d, _0x3f5201] = /^@(.*?)\.(.*?)$/.exec(_0x114bff);
        const _0x3ff59a = this.getval(_0x35934d);
        const _0x2abc27 = _0x35934d ? "null" === _0x3ff59a ? null : _0x3ff59a || "{}" : "{}";
        try {
          const _0x5d0f8d = JSON.parse(_0x2abc27);
          this.lodash_set(_0x5d0f8d, _0x3f5201, _0x3b8ed9);
          _0x634249 = this.setval(JSON.stringify(_0x5d0f8d), _0x35934d);
        } catch (_0x2cda18) {
          const _0x2444de = {};
          this.lodash_set(_0x2444de, _0x3f5201, _0x3b8ed9);
          _0x634249 = this.setval(JSON.stringify(_0x2444de), _0x35934d);
        }
      } else {
        _0x634249 = this.setval(_0x3b8ed9, _0x114bff);
      }
      return _0x634249;
    }
    getval(_0x19e3a4) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(_0x19e3a4) : this.isQuanX() ? $prefs.valueForKey(_0x19e3a4) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x19e3a4]) : this.data && this.data[_0x19e3a4] || null;
    }
    setval(_0x412c99, _0x2990ef) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(_0x412c99, _0x2990ef) : this.isQuanX() ? $prefs.setValueForKey(_0x412c99, _0x2990ef) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x2990ef] = _0x412c99, this.writedata(), true) : this.data && this.data[_0x2990ef] || null;
    }
    send(_0x186707, _0x1b5f32, _0x398ba3 = () => {}) {
      if (_0x186707 != "get" && _0x186707 != "post" && _0x186707 != "put" && _0x186707 != "delete") {
        console.log("无效的http方法：" + _0x186707);
        return;
      }
      if (_0x186707 == "get" && _0x1b5f32.headers) {
        delete _0x1b5f32.headers["Content-Type"];
        delete _0x1b5f32.headers["Content-Length"];
      } else {
        if (_0x1b5f32.body && _0x1b5f32.headers) {
          if (!_0x1b5f32.headers["Content-Type"]) {
            _0x1b5f32.headers["Content-Type"] = "application/x-www-form-urlencoded";
          }
        }
      }
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          _0x1b5f32.headers = _0x1b5f32.headers || {};
          const _0x5778c3 = {
            "X-Surge-Skip-Scripting": false
          };
          Object.assign(_0x1b5f32.headers, _0x5778c3);
        }
        let _0x2a061c = {
          method: _0x186707,
          url: _0x1b5f32.url,
          headers: _0x1b5f32.headers,
          timeout: _0x1b5f32.timeout,
          data: _0x1b5f32.body
        };
        if (_0x186707 == "get") {
          delete _0x2a061c.data;
        }
        $axios(_0x2a061c).then(_0x58466b => {
          const {
            status: _0x1bb117,
            request: _0x5d2228,
            headers: _0x1383fb,
            data: _0x26b800
          } = _0x58466b;
          const _0xcbf9b8 = {
            statusCode: _0x1bb117,
            headers: _0x1383fb,
            body: _0x26b800
          };
          _0x398ba3(null, _0x5d2228, _0xcbf9b8);
        }).catch(_0x3360ee => console.log(_0x3360ee));
      } else {
        if (this.isQuanX()) {
          const _0x4cd407 = {
            hints: false
          };
          _0x1b5f32.method = _0x186707.toUpperCase();
          this.isNeedRewrite && (_0x1b5f32.opts = _0x1b5f32.opts || {}, Object.assign(_0x1b5f32.opts, _0x4cd407));
          $task.fetch(_0x1b5f32).then(_0x36c813 => {
            const {
              statusCode: _0x35f2e8,
              request: _0x13a4db,
              headers: _0x5b397c,
              body: _0x2d2f7f
            } = _0x36c813;
            const _0x3788ae = {
              statusCode: _0x35f2e8,
              headers: _0x5b397c,
              body: _0x2d2f7f
            };
            _0x398ba3(null, _0x13a4db, _0x3788ae);
          }, _0x4ab600 => _0x398ba3(_0x4ab600));
        } else {
          if (this.isNode()) {
            this.got = this.got ? this.got : require("got");
            const {
              url: _0x1ebe99,
              ..._0x55dfa7
            } = _0x1b5f32;
            const _0xaf2b0f = {
              followRedirect: false
            };
            this.instance = this.got.extend(_0xaf2b0f);
            this.instance[_0x186707](_0x1ebe99, _0x55dfa7).then(_0x31d4fd => {
              const {
                statusCode: _0x5d8929,
                request: _0x1f2508,
                headers: _0x5bf0fc,
                body: _0x4e7ea0
              } = _0x31d4fd;
              const _0x208437 = {
                statusCode: _0x5d8929,
                headers: _0x5bf0fc,
                body: _0x4e7ea0
              };
              _0x398ba3(null, _0x1f2508, _0x208437);
            }, _0x34c37e => {
              const {
                message: _0x2346c0,
                request: _0x149230,
                response: _0x4bf3fe
              } = _0x34c37e;
              _0x398ba3(_0x2346c0, _0x149230, _0x4bf3fe);
            });
          }
        }
      }
    }
    time(_0x4b803b, _0x147ff9 = null) {
      let _0x29e7b9 = _0x147ff9 ? new Date(_0x147ff9) : new Date();
      let _0x3dc69e = {
        "M+": _0x29e7b9.getMonth() + 1,
        "d+": _0x29e7b9.getDate(),
        "h+": _0x29e7b9.getHours(),
        "m+": _0x29e7b9.getMinutes(),
        "s+": _0x29e7b9.getSeconds(),
        "q+": Math.floor((_0x29e7b9.getMonth() + 3) / 3),
        S: this.padStr(_0x29e7b9.getMilliseconds(), 3)
      };
      /(y+)/.test(_0x4b803b) && (_0x4b803b = _0x4b803b.replace(RegExp.$1, (_0x29e7b9.getFullYear() + "").substr(4 - RegExp.$1.length)));
      for (let _0x2d0e62 in _0x3dc69e) new RegExp("(" + _0x2d0e62 + ")").test(_0x4b803b) && (_0x4b803b = _0x4b803b.replace(RegExp.$1, 1 == RegExp.$1.length ? _0x3dc69e[_0x2d0e62] : ("00" + _0x3dc69e[_0x2d0e62]).substr(("" + _0x3dc69e[_0x2d0e62]).length)));
      return _0x4b803b;
    }
    async showmsg() {
      if (!this.notifyFlag) {
        return;
      }
      if (!this.notifyStr) {
        return;
      }
      let _0x48033b = this.name + " 运行通知\n\n" + this.notifyStr;
      if (_0x1d0ae3.isNode()) {
        var _0x509ac7 = require("./sendNotify");
        console.log("\n============== 推送 ==============");
        await _0x509ac7.sendNotify(this.name, _0x48033b);
      } else {
        this.msg(_0x48033b);
      }
    }
    logAndNotify(_0x4b4115, _0x45d5be = true) {
      if (_0x45d5be) {
        this.notifyFlag = true;
      }
      console.log(_0x4b4115);
      this.notifyStr += _0x4b4115;
      this.notifyStr += "\n";
    }
    logAndNotifyWithTime(_0xbd3491, _0xba7635 = true) {
      if (_0xba7635) {
        this.notifyFlag = true;
      }
      let _0x86a0cf = "[" + this.time("hh:mm:ss.S") + "]" + _0xbd3491;
      console.log(_0x86a0cf);
      this.notifyStr += _0x86a0cf;
      this.notifyStr += "\n";
    }
    logWithTime(_0x562e40) {
      console.log("[" + this.time("hh:mm:ss.S") + "]" + _0x562e40);
    }
    msg(_0x361412 = t, _0x2c9cb5 = "", _0x100e0d = "", _0x142ca3) {
      const _0x3b6198 = _0x2f3df8 => {
        if (!_0x2f3df8) {
          return _0x2f3df8;
        }
        if ("string" == typeof _0x2f3df8) {
          return this.isLoon() ? _0x2f3df8 : this.isQuanX() ? {
            "open-url": _0x2f3df8
          } : this.isSurge() ? {
            url: _0x2f3df8
          } : undefined;
        }
        if ("object" == typeof _0x2f3df8) {
          if (this.isLoon()) {
            let _0x5d6951 = _0x2f3df8.openUrl || _0x2f3df8.url || _0x2f3df8["open-url"];
            let _0x46d4fa = _0x2f3df8.mediaUrl || _0x2f3df8["media-url"];
            const _0x4cc6c7 = {
              openUrl: _0x5d6951,
              mediaUrl: _0x46d4fa
            };
            return _0x4cc6c7;
          }
          if (this.isQuanX()) {
            let _0x452061 = _0x2f3df8["open-url"] || _0x2f3df8.url || _0x2f3df8.openUrl;
            let _0x411469 = _0x2f3df8["media-url"] || _0x2f3df8.mediaUrl;
            const _0x649d94 = {
              "open-url": _0x452061,
              "media-url": _0x411469
            };
            return _0x649d94;
          }
          if (this.isSurge()) {
            let _0x1320bf = _0x2f3df8.url || _0x2f3df8.openUrl || _0x2f3df8["open-url"];
            const _0x2c43a8 = {
              url: _0x1320bf
            };
            return _0x2c43a8;
          }
        }
      };
      this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(_0x361412, _0x2c9cb5, _0x100e0d, _0x3b6198(_0x142ca3)) : this.isQuanX() && $notify(_0x361412, _0x2c9cb5, _0x100e0d, _0x3b6198(_0x142ca3)));
      let _0x4c35c9 = ["", "============== 系统通知 =============="];
      _0x4c35c9.push(_0x361412);
      _0x2c9cb5 && _0x4c35c9.push(_0x2c9cb5);
      _0x100e0d && _0x4c35c9.push(_0x100e0d);
      console.log(_0x4c35c9.join("\n"));
    }
    getMin(_0x4f3cbb, _0x13fec4) {
      return _0x4f3cbb < _0x13fec4 ? _0x4f3cbb : _0x13fec4;
    }
    getMax(_0x4a95e2, _0x54f8d5) {
      return _0x4a95e2 < _0x54f8d5 ? _0x54f8d5 : _0x4a95e2;
    }
    padStr(_0x2bf8c6, _0x76b779, _0x597892 = "0") {
      let _0x1ec409 = String(_0x2bf8c6);
      let _0x35b7b1 = _0x76b779 > _0x1ec409.length ? _0x76b779 - _0x1ec409.length : 0;
      let _0x3bbee5 = "";
      for (let _0x3f2b38 = 0; _0x3f2b38 < _0x35b7b1; _0x3f2b38++) {
        _0x3bbee5 += _0x597892;
      }
      _0x3bbee5 += _0x1ec409;
      return _0x3bbee5;
    }
    json2str(_0x21e8f4, _0x3854bc, _0x2d77c5 = false) {
      let _0x84ed67 = [];
      for (let _0x42f06b of Object.keys(_0x21e8f4).sort()) {
        let _0x4afe67 = _0x21e8f4[_0x42f06b];
        if (_0x4afe67 && _0x2d77c5) {
          _0x4afe67 = encodeURIComponent(_0x4afe67);
        }
        _0x84ed67.push(_0x42f06b + "=" + _0x4afe67);
      }
      return _0x84ed67.join(_0x3854bc);
    }
    str2json(_0x32ebeb, _0x5e0c61 = false) {
      let _0xcfbf3 = {};
      for (let _0x28e8f6 of _0x32ebeb.split("&")) {
        if (!_0x28e8f6) {
          continue;
        }
        let _0x343dda = _0x28e8f6.indexOf("=");
        if (_0x343dda == -1) {
          continue;
        }
        let _0x4fc3c1 = _0x28e8f6.substr(0, _0x343dda);
        let _0xda8695 = _0x28e8f6.substr(_0x343dda + 1);
        if (_0x5e0c61) {
          _0xda8695 = decodeURIComponent(_0xda8695);
        }
        _0xcfbf3[_0x4fc3c1] = _0xda8695;
      }
      return _0xcfbf3;
    }
    randomPattern(_0x45defe, _0x572e5a = "abcdef0123456789") {
      let _0x1a359b = "";
      for (let _0x2b59f5 of _0x45defe) {
        if (_0x2b59f5 == "x") {
          _0x1a359b += _0x572e5a.charAt(Math.floor(Math.random() * _0x572e5a.length));
        } else {
          _0x2b59f5 == "X" ? _0x1a359b += _0x572e5a.charAt(Math.floor(Math.random() * _0x572e5a.length)).toUpperCase() : _0x1a359b += _0x2b59f5;
        }
      }
      return _0x1a359b;
    }
    randomString(_0x11634c, _0xd450c0 = "abcdef0123456789") {
      let _0x2e19df = "";
      for (let _0x4a5b8e = 0; _0x4a5b8e < _0x11634c; _0x4a5b8e++) {
        _0x2e19df += _0xd450c0.charAt(Math.floor(Math.random() * _0xd450c0.length));
      }
      return _0x2e19df;
    }
    randomList(_0x426a0d) {
      let _0x548fce = Math.floor(Math.random() * _0x426a0d.length);
      return _0x426a0d[_0x548fce];
    }
    wait(_0x5a1e6c) {
      return new Promise(_0x512365 => setTimeout(_0x512365, _0x5a1e6c));
    }
    async done(_0x2365bc = {}) {
      await this.showmsg();
      const _0x14f931 = new Date().getTime();
      const _0x3ff284 = (_0x14f931 - this.startTime) / 1000;
      console.log("\n" + this.name + " 运行结束，共运行了 " + _0x3ff284 + " 秒！");
      if (this.isSurge() || this.isQuanX() || this.isLoon()) {
        $done(_0x2365bc);
      }
    }
  }(_0x2a4acc, _0xf22ac7);
}