/*
北京现代
(不是北京汽车)

积分换实物，积分涨的比较慢，自己决定跑不跑吧

捉域名bm2-api.bluemembers.com.cn任意包的token填到bjxdCookie里，多账户换行隔开
安卓CK需要在对应的CK后面加上#android
不加默认为IOS CK，不通用

重写：打开APP获取
[task_local]
#北京现代
58 0,9-22/4 * * * https://raw.githubusercontent.com/leafTheFish/DeathNote/main/bjxd.js, tag=北京现代, enabled=true
[rewrite_local]
https://bm2-api.bluemembers.com.cn/v1/app/white/lovecar/banner url script-request-header https://raw.githubusercontent.com/leafTheFish/DeathNote/main/bjxd.js
[MITM]
hostname = bm2-api.bluemembers.com.cn

定时：一天一两次
cron: 36 7,20 * * *	

const $ = new Env("北京现代")
*/
//Tue Feb 18 2025 06:05:49 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const _0x8716db = new _0x4cda8f("北京现代");
let _0x268653 = ["\n"];
let _0x2fdc9f = "bjxdCookie";
let _0x219a02 = (_0x8716db.isNode() ? process.env[_0x2fdc9f] : _0x8716db.getdata(_0x2fdc9f)) || "";
let _0x2d9559 = [];
let _0x2c43fb = 0;
let _0x1b86b6 = 0;
let _0x30fc44 = "application/json;charset=utf-8";
let _0x1d8bc9 = "ModernCar/8.10.0 (iPhone; iOS 15.0; Scale/3.00)";
let _0x8c33cb = "iOS";
let _0x5403e8 = 7;
let _0x32da0f = 8;
let _0x1a4387 = 300;
let _0x491d53 = 1000;
let _0x49a9ae = 1.02;
let _0x194108 = "bjxd";
let _0x6567ed = "https://leafxcy.coding.net/api/user/leafxcy/project/validcode/shared-depot/validCode/git/blob/master/code.json";
class _0x4c27a8 {
  constructor(_0x17c2ed) {
    this.index = ++_0x2c43fb;
    this.name = this.index;
    this.valid = false;
    let _0x465c2e = _0x17c2ed.split("#");
    this.token = _0x465c2e[0];
    this.device = _0x465c2e[1] || _0x8c33cb;
  }
  async taskApi(_0x3967b8 = {}) {
    let _0x4dd0e8 = {};
    try {
      let _0x1c0362 = _0x3967b8.url.replace("//", "/").split("/")[1];
      let _0x1e768b = _0x3967b8.url;
      if (_0x3967b8.queryParam) {
        _0x1e768b += "?" + _0x8716db.json2str(_0x3967b8.queryParam, "&", true);
      }
      const _0x206c16 = {
        Host: _0x1c0362,
        Connection: "keep-alive",
        token: this.token,
        "User-Agent": _0x1d8bc9,
        device: this.device
      };
      let _0x47c42e = {
        url: _0x1e768b,
        headers: _0x206c16,
        timeout: 5000
      };
      if (_0x3967b8.body) {
        _0x47c42e.headers["Content-Type"] = _0x3967b8["Content-Type"] || _0x30fc44;
        if (typeof _0x3967b8.body === "object") {
          if (_0x47c42e.headers["Content-Type"].includes("json")) {
            _0x47c42e.body = JSON.stringify(_0x3967b8.body);
          } else {
            for (let _0x35ecf0 in _0x3967b8.body) {
              typeof _0x3967b8.body[_0x35ecf0] === "object" && (_0x3967b8.body[_0x35ecf0] = JSON.stringify(_0x3967b8.body[_0x35ecf0]));
            }
            _0x47c42e.body = _0x8716db.json2str(_0x3967b8.body, "&");
          }
        } else {
          _0x47c42e.body = _0x3967b8.body;
        }
      }
      if (_0x3967b8.urlObjectParam) {
        Object.assign(_0x47c42e, _0x3967b8.urlObjectParam);
      }
      if (_0x3967b8.headerParam) {
        Object.assign(_0x47c42e.headers, _0x3967b8.headerParam);
      }
      _0x4dd0e8 = Object.assign({}, await _0x521f1c(_0x3967b8.method, _0x47c42e));
      _0x4dd0e8.statusCode = _0x4dd0e8?.["err"]?.["response"]?.["statusCode"] || _0x4dd0e8?.["resp"]?.["statusCode"];
      _0x4dd0e8.statusCode != 200 && console.log("[" + _0x3967b8.fn + "]返回[" + _0x4dd0e8.statusCode + "]");
      if (_0x4dd0e8?.["resp"]?.["body"]) {
        if (typeof _0x4dd0e8.resp.body === "object") {
          _0x4dd0e8.result = _0x4dd0e8.resp.body;
        } else {
          try {
            _0x4dd0e8.result = JSON.parse(_0x4dd0e8.resp.body);
          } catch (_0x3866e6) {
            console.log("[" + _0x3967b8.fn + "]没有返回json数据");
            _0x4dd0e8.result = _0x4dd0e8.resp.body;
          }
        }
      }
    } catch (_0x1e3872) {
      console.log(_0x1e3872);
    } finally {
      return Promise.resolve(_0x4dd0e8);
    }
  }
  async getUserInfo() {
    let _0x38b266 = {};
    try {
      let _0xcaf926 = {
        fn: "getUserInfo",
        method: "get",
        url: "https://bm2-api.bluemembers.com.cn/v1/app/account/users/info"
      };
      _0x38b266 = Object.assign({}, await this.taskApi(_0xcaf926));
      if (typeof _0x38b266?.["result"] === "object") {
        let _0x4299a4 = _0x38b266.result;
        if (_0x4299a4.code == 0) {
          this.valid = true;
          this.hid = _0x4299a4.data.hid;
          this.name = _0x4299a4.data.nickname;
          this.phone = _0x4299a4.data.phone;
          this.mixPhone = this.phone.slice(0, 3) + "****" + this.phone.slice(7, 13);
          this.nid = _0x4299a4.data.nid;
          this.score = _0x4299a4.data.score_value;
          this.isSign = _0x4299a4.data.if_signed_in;
          _0x8716db.logAndNotify("昵称：" + this.name);
          _0x8716db.logAndNotify("手机：" + this.mixPhone);
        } else {
          _0x8716db.logAndNotify("登录失败：" + _0x4299a4.msg);
        }
      }
    } catch (_0x304632) {
      console.log(_0x304632);
    } finally {
      return Promise.resolve(_0x38b266);
    }
  }
  async getScore() {
    let _0x12fb1e = {};
    try {
      let _0x43a101 = {
        fn: "getScore",
        method: "get",
        url: "https://bm2-api.bluemembers.com.cn/v1/app/account/users/info"
      };
      _0x12fb1e = Object.assign({}, await this.taskApi(_0x43a101));
      if (typeof _0x12fb1e?.["result"] === "object") {
        let _0x332edd = _0x12fb1e.result;
        _0x332edd.code == 0 ? (this.score = _0x332edd.data.score_value, _0x8716db.logAndNotify("积分：" + this.score)) : console.log("查询积分失败：" + _0x332edd.msg);
      }
    } catch (_0x163403) {
      console.log(_0x163403);
    } finally {
      return Promise.resolve(_0x12fb1e);
    }
  }
  async reward_list() {
    let _0x3f6116 = {};
    try {
      let _0xe5198f = {
        fn: "reward_list",
        method: "get",
        url: "https://bm2-api.bluemembers.com.cn/v1/app/user/reward_list"
      };
      _0x3f6116 = Object.assign({}, await this.taskApi(_0xe5198f));
      if (typeof _0x3f6116?.["result"] === "object") {
        let _0x56041 = _0x3f6116.result;
        if (_0x56041.code == 0) {
          let _0x2fbcf1 = _0x56041.data.list.filter(_0x5ae0ff => _0x5ae0ff.hid == _0x56041.data.hid);
          let _0x4a8869 = _0x2fbcf1[0].score;
          _0x4a8869 >= _0x5403e8 ? (console.log("获取到签到积分" + _0x4a8869 + "的请求，满足门槛，进行签到"), await this.reward_report(_0x56041.data), this.isSign = true) : console.log("获取到签到积分" + _0x4a8869 + "的请求，小于门槛，不进行签到");
        } else {
          console.log("获取签到奖励信息失败：" + _0x56041.msg);
        }
      }
    } catch (_0x64bff7) {
      console.log(_0x64bff7);
    } finally {
      return Promise.resolve(_0x3f6116);
    }
  }
  async reward_report(_0x589132) {
    let _0x46c394 = {};
    try {
      const _0x34c67b = {
        hid: _0x589132.hid,
        hash: _0x589132.rewardHash,
        sm_deviceId: ""
      };
      let _0x4c6530 = {
        fn: "reward_report",
        method: "post",
        url: "https://bm2-api.bluemembers.com.cn/v1/app/user/reward_report",
        body: _0x34c67b
      };
      _0x46c394 = Object.assign({}, await this.taskApi(_0x4c6530));
      if (typeof _0x46c394?.["result"] === "object") {
        let _0x435e80 = _0x46c394.result;
        _0x435e80.code == 0 ? console.log("签到成功") : console.log("签到失败：" + _0x435e80.msg);
      }
    } catch (_0x149902) {
      console.log(_0x149902);
    } finally {
      return Promise.resolve(_0x46c394);
    }
  }
  async taskList() {
    let _0x17e315 = {};
    try {
      let _0x4b8eca = {
        fn: "taskList",
        method: "get",
        url: "https://bm2-api.bluemembers.com.cn/v1/app/user/task/list"
      };
      _0x17e315 = Object.assign({}, await this.taskApi(_0x4b8eca));
      if (typeof _0x17e315?.["result"] === "object") {
        let _0x537fef = _0x17e315.result;
        _0x537fef.code == 0 ? (!_0x537fef.data.action12.status && (await this.appScore(12)), !_0x537fef.data.action39.status && (await this.ask_info())) : console.log("获取任务列表失败：" + _0x537fef.msg);
      }
    } catch (_0x217171) {
      console.log(_0x217171);
    } finally {
      return Promise.resolve(_0x17e315);
    }
  }
  async appScore(_0x2e08b2) {
    let _0x56f9a9 = {};
    try {
      let _0x139670 = {
        fn: "appScore",
        method: "post",
        url: "https://bm2-api.bluemembers.com.cn/v1/app/score",
        body: {
          action: Number(_0x2e08b2)
        }
      };
      _0x56f9a9 = Object.assign({}, await this.taskApi(_0x139670));
      if (typeof _0x56f9a9?.["result"] === "object") {
        let _0x2398d7 = _0x56f9a9.result;
        _0x2398d7.code == 0 ? _0x2398d7.data.is_stop ? console.log("完成任务[" + _0x2e08b2 + "]成功，获得" + _0x2398d7.data.score + "积分") : console.log("任务[" + _0x2e08b2 + "]已完成过") : console.log("完成任务[" + _0x2e08b2 + "]失败：" + _0x2398d7.msg);
      }
    } catch (_0x4aaf25) {
      console.log(_0x4aaf25);
    } finally {
      return Promise.resolve(_0x56f9a9);
    }
  }
  async ask_info() {
    let _0x8f513e = {};
    try {
      let _0x2a7cc6 = {
        fn: "ask_info",
        method: "get",
        url: "https://bm2-api.bluemembers.com.cn/v1/app/special/daily/ask_info",
        queryParam: {
          date: _0x8716db.time("yyyyMMdd")
        }
      };
      _0x8f513e = Object.assign({}, await this.taskApi(_0x2a7cc6));
      if (typeof _0x8f513e?.["result"] === "object") {
        let _0x5469c5 = _0x8f513e.result;
        if (_0x5469c5.code == 0) {
          if (_0x5469c5.data.state == 1) {
            console.log("开始答题：");
            console.log(_0x5469c5.data.question_info.content);
            for (let _0x296803 of _0x5469c5.data.question_info.option) {
              console.log(_0x296803.option + ": " + _0x296803.option_content);
            }
            await this.ask_answer(_0x5469c5.data.question_info);
          } else {
            console.log("今日已完成答题");
          }
        } else {
          console.log("获取任务列表失败：" + _0x5469c5.msg);
        }
      }
    } catch (_0x45d564) {
      console.log(_0x45d564);
    } finally {
      return Promise.resolve(_0x8f513e);
    }
  }
  async ask_answer(_0x4ee39a) {
    let _0x320116 = {};
    try {
      let _0x16af4f = _0x8716db.randomList(_0x4ee39a.option);
      console.log("随机选择[" + _0x16af4f.option + "]");
      const _0x5c6056 = {
        answer: _0x16af4f.option,
        questions_hid: _0x4ee39a.questions_hid
      };
      let _0x237782 = {
        fn: "ask_answer",
        method: "post",
        url: "https://bm2-api.bluemembers.com.cn/v1/app/special/daily/ask_answer",
        body: _0x5c6056
      };
      _0x320116 = Object.assign({}, await this.taskApi(_0x237782));
      if (typeof _0x320116?.["result"] === "object") {
        let _0x30d161 = _0x320116.result;
        _0x30d161.code == 0 ? _0x30d161.data.state == 2 ? console.log("回答正确，获得" + _0x30d161.data.answer_score + "积分") : console.log("回答错误") : console.log("回答失败：" + _0x30d161.msg);
      }
    } catch (_0x26cc04) {
      console.log(_0x26cc04);
    } finally {
      return Promise.resolve(_0x320116);
    }
  }
  async userTask() {
    let _0x4937de = {};
    try {
      _0x8716db.logAndNotify("\n============= 账号[" + this.index + "] =============");
      await this.getUserInfo();
      if (!this.valid) {
        return;
      }
      for (let _0x50258e = 0; _0x50258e < 50 && !this.isSign; _0x50258e++) {
        await this.reward_list();
      }
      await this.taskList();
      await this.getScore();
    } catch (_0x5859d2) {
      console.log(_0x5859d2);
    } finally {
      return Promise.resolve(_0x4937de);
    }
  }
}
!(async () => {
  if (typeof $request !== "undefined") {
    await _0x14afab();
  } else {
    /*if (!(await _0x2b9e78())) {
      return;
    }*/
    if (!_0x5783c6()) {
      return;
    }
    for (let _0x446442 of _0x2d9559) {
      await _0x446442.userTask();
    }
  }
})().catch(_0x2a23c4 => console.log(_0x2a23c4)).finally(() => _0x8716db.done());
async function _0x14afab() {
  if ($request.url.includes("v1/app/white/lovecar/banner")) {
    try {
      let _0x13b4b6 = $request.headers.token;
      let _0x4dcfbd = _0x268653[0];
      for (let _0x44475f of _0x268653) {
        if (_0x219a02?.["includes"](_0x44475f)) {
          _0x4dcfbd = _0x44475f;
          break;
        }
      }
      if (!_0x219a02?.["includes"](_0x13b4b6)) {
        let _0x1b71ef = _0x219a02 ? _0x219a02.split(_0x4dcfbd) : [];
        _0x1b71ef.push(_0x13b4b6);
        _0x219a02 = _0x1b71ef.join(_0x4dcfbd);
        _0x8716db.setdata(_0x219a02, _0x2fdc9f);
        _0x8716db.msg("获取第" + _0x1b71ef.length + "个账户CK成功，保存到变量[" + _0x2fdc9f + "]: " + _0x13b4b6);
      }
    } catch (_0x4cf3b5) {}
  }
}
function _0x5783c6() {
  if (_0x219a02) {
    let _0x3f061f = _0x268653[0];
    for (let _0x4cde89 of _0x268653) {
      if (_0x219a02.indexOf(_0x4cde89) > -1) {
        _0x3f061f = _0x4cde89;
        break;
      }
    }
    for (let _0x442d1d of _0x219a02.split(_0x3f061f)) {
      if (_0x442d1d) {
        _0x2d9559.push(new _0x4c27a8(_0x442d1d));
      }
    }
    _0x1b86b6 = _0x2d9559.length;
  } else {
    console.log("未找到CK: " + _0x2fdc9f);
    return false;
  }
  console.log("共找到" + _0x1b86b6 + "个账号");
  return true;
}
async function _0x2b9e78(_0x52f9ac = 0) {
  let _0x454209 = false;
  try {
    let _0x20d7ff = {
      url: _0x6567ed,
      timeout: 5000
    };
    let _0x239829 = null;
    let _0x457fa9 = await _0x521f1c("get", _0x20d7ff);
    if (_0x457fa9.err) {
      console.log("服务器错误[" + _0x457fa9?.["resp"]?.["statusCode"] + "]，重试...");
    } else {
      try {
        _0x239829 = JSON.parse(_0x457fa9.resp.body);
        _0x239829?.["code"] == 0 && (_0x239829 = JSON.parse(_0x239829.data.file.data));
      } catch (_0x5d759c) {}
    }
    if (!_0x239829) {
      if (_0x52f9ac < _0x32da0f) {
        let _0x22b7e = Math.floor(Math.random() * _0x491d53) + _0x1a4387;
        _0x454209 = await _0x2b9e78(++_0x52f9ac);
      }
    } else {
      _0x239829?.["commonNotify"] && _0x239829.commonNotify.length > 0 && _0x8716db.logAndNotify(_0x239829.commonNotify.join("\n") + "\n");
      _0x239829?.["commonMsg"] && _0x239829.commonMsg.length > 0 && console.log(_0x239829.commonMsg.join("\n") + "\n");
      if (_0x239829[_0x194108]) {
        let _0x1d6833 = _0x239829[_0x194108];
        _0x1d6833.status == 0 ? _0x49a9ae >= _0x1d6833.version ? (_0x454209 = true, console.log(_0x1d6833.msg[_0x1d6833.status]), console.log(_0x1d6833.updateMsg), console.log("现在运行的脚本版本是：" + _0x49a9ae + "，最新脚本版本：" + _0x1d6833.latestVersion)) : console.log(_0x1d6833.versionMsg) : console.log(_0x1d6833.msg[_0x1d6833.status]);
      } else {
        console.log(_0x239829.errorMsg);
      }
    }
  } catch (_0x3f1377) {
    console.log(_0x3f1377);
  } finally {
    return Promise.resolve(_0x454209);
  }
}
async function _0x521f1c(_0x263b8f, _0x513b4c) {
  return new Promise(_0x40a2b3 => {
    _0x8716db.send(_0x263b8f, _0x513b4c, async (_0x6e577d, _0x129293, _0xf085c6) => {
      const _0x348782 = {
        err: _0x6e577d,
        req: _0x129293,
        resp: _0xf085c6
      };
      _0x40a2b3(_0x348782);
    });
  });
}
function _0x4cda8f(_0x1e4724, _0xff6f77) {
  "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
  return new class {
    constructor(_0x4178f5, _0x2ac14c) {
      this.name = _0x4178f5;
      this.notifyStr = "";
      this.startTime = new Date().getTime();
      Object.assign(this, _0x2ac14c);
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
    getdata(_0x4fefce) {
      let _0x3782e9 = this.getval(_0x4fefce);
      if (/^@/.test(_0x4fefce)) {
        const [, _0x34b308, _0x48c0c3] = /^@(.*?)\.(.*?)$/.exec(_0x4fefce);
        const _0x31bfd6 = _0x34b308 ? this.getval(_0x34b308) : "";
        if (_0x31bfd6) {
          try {
            const _0x479c6a = JSON.parse(_0x31bfd6);
            _0x3782e9 = _0x479c6a ? this.lodash_get(_0x479c6a, _0x48c0c3, "") : _0x3782e9;
          } catch (_0x4facad) {
            _0x3782e9 = "";
          }
        }
      }
      return _0x3782e9;
    }
    setdata(_0x4beabf, _0x590b04) {
      let _0x38fc86 = false;
      if (/^@/.test(_0x590b04)) {
        const [, _0x20017f, _0x55f66f] = /^@(.*?)\.(.*?)$/.exec(_0x590b04);
        const _0x3e34f7 = this.getval(_0x20017f);
        const _0x3a6458 = _0x20017f ? "null" === _0x3e34f7 ? null : _0x3e34f7 || "{}" : "{}";
        try {
          const _0x2b471b = JSON.parse(_0x3a6458);
          this.lodash_set(_0x2b471b, _0x55f66f, _0x4beabf);
          _0x38fc86 = this.setval(JSON.stringify(_0x2b471b), _0x20017f);
        } catch (_0x1494d0) {
          const _0xd89f1b = {};
          this.lodash_set(_0xd89f1b, _0x55f66f, _0x4beabf);
          _0x38fc86 = this.setval(JSON.stringify(_0xd89f1b), _0x20017f);
        }
      } else {
        _0x38fc86 = this.setval(_0x4beabf, _0x590b04);
      }
      return _0x38fc86;
    }
    getval(_0x54eb3e) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(_0x54eb3e) : this.isQuanX() ? $prefs.valueForKey(_0x54eb3e) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x54eb3e]) : this.data && this.data[_0x54eb3e] || null;
    }
    setval(_0x491870, _0x2145f6) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(_0x491870, _0x2145f6) : this.isQuanX() ? $prefs.setValueForKey(_0x491870, _0x2145f6) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x2145f6] = _0x491870, this.writedata(), true) : this.data && this.data[_0x2145f6] || null;
    }
    send(_0x30ed81, _0x46cad7, _0x1cc856 = () => {}) {
      if (_0x30ed81 != "get" && _0x30ed81 != "post" && _0x30ed81 != "put" && _0x30ed81 != "delete") {
        console.log("无效的http方法：" + _0x30ed81);
        return;
      }
      if (_0x30ed81 == "get" && _0x46cad7.headers) {
        delete _0x46cad7.headers["Content-Type"];
        delete _0x46cad7.headers["Content-Length"];
      } else {
        if (_0x46cad7.body && _0x46cad7.headers) {
          if (!_0x46cad7.headers["Content-Type"]) {
            _0x46cad7.headers["Content-Type"] = "application/x-www-form-urlencoded";
          }
        }
      }
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          _0x46cad7.headers = _0x46cad7.headers || {};
          const _0x26fc4f = {
            "X-Surge-Skip-Scripting": false
          };
          Object.assign(_0x46cad7.headers, _0x26fc4f);
        }
        let _0x5bc71d = {
          method: _0x30ed81,
          url: _0x46cad7.url,
          headers: _0x46cad7.headers,
          timeout: _0x46cad7.timeout,
          data: _0x46cad7.body
        };
        if (_0x30ed81 == "get") {
          delete _0x5bc71d.data;
        }
        $axios(_0x5bc71d).then(_0x5bd58f => {
          const {
            status: _0x170536,
            request: _0x1e7cb3,
            headers: _0x468f75,
            data: _0x580b03
          } = _0x5bd58f;
          const _0x571f3c = {
            statusCode: _0x170536,
            headers: _0x468f75,
            body: _0x580b03
          };
          _0x1cc856(null, _0x1e7cb3, _0x571f3c);
        }).catch(_0x4bda4a => console.log(_0x4bda4a));
      } else {
        if (this.isQuanX()) {
          const _0x327740 = {
            hints: false
          };
          _0x46cad7.method = _0x30ed81.toUpperCase();
          this.isNeedRewrite && (_0x46cad7.opts = _0x46cad7.opts || {}, Object.assign(_0x46cad7.opts, _0x327740));
          $task.fetch(_0x46cad7).then(_0x54076a => {
            const {
              statusCode: _0x1a879b,
              request: _0x425de9,
              headers: _0x3d8419,
              body: _0x40f74b
            } = _0x54076a;
            const _0x206c23 = {
              statusCode: _0x1a879b,
              headers: _0x3d8419,
              body: _0x40f74b
            };
            _0x1cc856(null, _0x425de9, _0x206c23);
          }, _0x3c58de => _0x1cc856(_0x3c58de));
        } else {
          if (this.isNode()) {
            this.got = this.got ? this.got : require("got");
            const {
              url: _0x5838e9,
              ..._0x4db42f
            } = _0x46cad7;
            const _0x527bb1 = {
              followRedirect: false
            };
            this.instance = this.got.extend(_0x527bb1);
            this.instance[_0x30ed81](_0x5838e9, _0x4db42f).then(_0x5339a9 => {
              const {
                statusCode: _0x3bc338,
                request: _0x576247,
                headers: _0x6e3fd4,
                body: _0x1a837a
              } = _0x5339a9;
              const _0x420bc3 = {
                statusCode: _0x3bc338,
                headers: _0x6e3fd4,
                body: _0x1a837a
              };
              _0x1cc856(null, _0x576247, _0x420bc3);
            }, _0x86d1ba => {
              const {
                message: _0x53d502,
                request: _0x507dc9,
                response: _0x598f0c
              } = _0x86d1ba;
              _0x1cc856(_0x53d502, _0x507dc9, _0x598f0c);
            });
          }
        }
      }
    }
    time(_0x2ef619, _0x16db29 = null) {
      let _0x2c3750 = _0x16db29 ? new Date(_0x16db29) : new Date();
      let _0x5cd64f = {
        "M+": _0x2c3750.getMonth() + 1,
        "d+": _0x2c3750.getDate(),
        "h+": _0x2c3750.getHours(),
        "m+": _0x2c3750.getMinutes(),
        "s+": _0x2c3750.getSeconds(),
        "q+": Math.floor((_0x2c3750.getMonth() + 3) / 3),
        S: _0x2c3750.getMilliseconds()
      };
      /(y+)/.test(_0x2ef619) && (_0x2ef619 = _0x2ef619.replace(RegExp.$1, (_0x2c3750.getFullYear() + "").substr(4 - RegExp.$1.length)));
      for (let _0x4ccae2 in _0x5cd64f) new RegExp("(" + _0x4ccae2 + ")").test(_0x2ef619) && (_0x2ef619 = _0x2ef619.replace(RegExp.$1, 1 == RegExp.$1.length ? _0x5cd64f[_0x4ccae2] : ("00" + _0x5cd64f[_0x4ccae2]).substr(("" + _0x5cd64f[_0x4ccae2]).length)));
      return _0x2ef619;
    }
    async showmsg() {
      if (!this.notifyStr) {
        return;
      }
      let _0x69a576 = this.name + " 运行通知\n\n" + this.notifyStr;
      if (_0x8716db.isNode()) {
        var _0x4ded0f = require("./sendNotify");
        console.log("\n============== 推送 ==============");
        await _0x4ded0f.sendNotify(this.name, _0x69a576);
      } else {
        this.msg(_0x69a576);
      }
    }
    logAndNotify(_0x5d20e5) {
      console.log(_0x5d20e5);
      this.notifyStr += _0x5d20e5;
      this.notifyStr += "\n";
    }
    logAndNotifyWithTime(_0x13c259) {
      let _0x5d180a = "[" + this.time("hh:mm:ss.S") + "]" + _0x13c259;
      console.log(_0x5d180a);
      this.notifyStr += _0x5d180a;
      this.notifyStr += "\n";
    }
    logWithTime(_0xe9e4ad) {
      console.log("[" + this.time("hh:mm:ss.S") + "]" + _0xe9e4ad);
    }
    msg(_0x281b91 = t, _0x2a5e45 = "", _0x441be7 = "", _0xd75caf) {
      const _0x3c126f = _0xf16ff0 => {
        if (!_0xf16ff0) {
          return _0xf16ff0;
        }
        if ("string" == typeof _0xf16ff0) {
          return this.isLoon() ? _0xf16ff0 : this.isQuanX() ? {
            "open-url": _0xf16ff0
          } : this.isSurge() ? {
            url: _0xf16ff0
          } : undefined;
        }
        if ("object" == typeof _0xf16ff0) {
          if (this.isLoon()) {
            let _0x2fda6e = _0xf16ff0.openUrl || _0xf16ff0.url || _0xf16ff0["open-url"];
            let _0x1bd995 = _0xf16ff0.mediaUrl || _0xf16ff0["media-url"];
            const _0x5d7302 = {
              openUrl: _0x2fda6e,
              mediaUrl: _0x1bd995
            };
            return _0x5d7302;
          }
          if (this.isQuanX()) {
            let _0x5464ef = _0xf16ff0["open-url"] || _0xf16ff0.url || _0xf16ff0.openUrl;
            let _0x3b60b5 = _0xf16ff0["media-url"] || _0xf16ff0.mediaUrl;
            const _0x3f7c94 = {
              "open-url": _0x5464ef,
              "media-url": _0x3b60b5
            };
            return _0x3f7c94;
          }
          if (this.isSurge()) {
            let _0x4f4b61 = _0xf16ff0.url || _0xf16ff0.openUrl || _0xf16ff0["open-url"];
            const _0x40f4f2 = {
              url: _0x4f4b61
            };
            return _0x40f4f2;
          }
        }
      };
      this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(_0x281b91, _0x2a5e45, _0x441be7, _0x3c126f(_0xd75caf)) : this.isQuanX() && $notify(_0x281b91, _0x2a5e45, _0x441be7, _0x3c126f(_0xd75caf)));
      let _0x3eabf5 = ["", "============== 系统通知 =============="];
      _0x3eabf5.push(_0x281b91);
      _0x2a5e45 && _0x3eabf5.push(_0x2a5e45);
      _0x441be7 && _0x3eabf5.push(_0x441be7);
      console.log(_0x3eabf5.join("\n"));
    }
    getMin(_0x15962f, _0x2a34e2) {
      return _0x15962f < _0x2a34e2 ? _0x15962f : _0x2a34e2;
    }
    getMax(_0x10b5c9, _0xd6c9d7) {
      return _0x10b5c9 < _0xd6c9d7 ? _0xd6c9d7 : _0x10b5c9;
    }
    padStr(_0x3b72ab, _0x3e7ee5, _0x173b51 = "0") {
      let _0x444bd6 = String(_0x3b72ab);
      let _0x5a80d4 = _0x3e7ee5 > _0x444bd6.length ? _0x3e7ee5 - _0x444bd6.length : 0;
      let _0xbedc9d = "";
      for (let _0x3f8956 = 0; _0x3f8956 < _0x5a80d4; _0x3f8956++) {
        _0xbedc9d += _0x173b51;
      }
      _0xbedc9d += _0x444bd6;
      return _0xbedc9d;
    }
    json2str(_0x4cb5d6, _0x36e3c5, _0x2ec4bc = false) {
      let _0x4d114d = [];
      for (let _0x207106 of Object.keys(_0x4cb5d6).sort()) {
        let _0x3811eb = _0x4cb5d6[_0x207106];
        if (_0x3811eb && _0x2ec4bc) {
          _0x3811eb = encodeURIComponent(_0x3811eb);
        }
        _0x4d114d.push(_0x207106 + "=" + _0x3811eb);
      }
      return _0x4d114d.join(_0x36e3c5);
    }
    str2json(_0x153294, _0x4b27fb = false) {
      let _0x593ed4 = {};
      for (let _0xdc7f24 of _0x153294.split("&")) {
        if (!_0xdc7f24) {
          continue;
        }
        let _0x221d9d = _0xdc7f24.indexOf("=");
        if (_0x221d9d == -1) {
          continue;
        }
        let _0x48bba3 = _0xdc7f24.substr(0, _0x221d9d);
        let _0x2a45fc = _0xdc7f24.substr(_0x221d9d + 1);
        if (_0x4b27fb) {
          _0x2a45fc = decodeURIComponent(_0x2a45fc);
        }
        _0x593ed4[_0x48bba3] = _0x2a45fc;
      }
      return _0x593ed4;
    }
    randomPattern(_0x39c9a4, _0x782889 = "abcdef0123456789") {
      let _0x167a1 = "";
      for (let _0x4c9048 of _0x39c9a4) {
        if (_0x4c9048 == "x") {
          _0x167a1 += _0x782889.charAt(Math.floor(Math.random() * _0x782889.length));
        } else {
          _0x4c9048 == "X" ? _0x167a1 += _0x782889.charAt(Math.floor(Math.random() * _0x782889.length)).toUpperCase() : _0x167a1 += _0x4c9048;
        }
      }
      return _0x167a1;
    }
    randomString(_0x600a62, _0x1be07f = "abcdef0123456789") {
      let _0x23158e = "";
      for (let _0x1ed705 = 0; _0x1ed705 < _0x600a62; _0x1ed705++) {
        _0x23158e += _0x1be07f.charAt(Math.floor(Math.random() * _0x1be07f.length));
      }
      return _0x23158e;
    }
    randomList(_0x4acba4) {
      let _0x91a694 = Math.floor(Math.random() * _0x4acba4.length);
      return _0x4acba4[_0x91a694];
    }
    wait(_0x530f72) {
      return new Promise(_0x3e7b59 => setTimeout(_0x3e7b59, _0x530f72));
    }
    async done(_0x5b659f = {}) {
      await this.showmsg();
      const _0x1541e5 = new Date().getTime();
      const _0x2fa0de = (_0x1541e5 - this.startTime) / 1000;
      console.log("\n" + this.name + " 运行结束，共运行了 " + _0x2fa0de + " 秒！");
      if (this.isSurge() || this.isQuanX() || this.isLoon()) {
        $done(_0x5b659f);
      }
    }
  }(_0x1e4724, _0xff6f77);
}