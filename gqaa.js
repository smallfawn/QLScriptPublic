
/*
广汽埃安 每天签到和开连签盲盒, 车主有额外的点赞积分任务
多账号换行或&或@隔开
export PHPSESSID="xxxxxxxx"





cron: 51 6,16 * * *
const $ = new Env("广汽埃安");
*/
const _0x57726e = _0xafb67f("广汽埃安"),
      _0x157252 = require("got"),
      {
  CookieJar: _0x39b841
} = require("tough-cookie"),
      _0x12a3af = "gqaa",
      _0x27935e = /[\n\&\@]/,
      _0x570313 = [_0x12a3af + "Cookie"],
      _0x1f66ac = 8000,
      _0x41a616 = 3;

const _0x620eeb = 1.02,
      _0x5cb507 = "gqaa",
      _0xd58e67 = "https://leafxcy.coding.net/api/user/leafxcy/project/validcode/shared-depot/validCode/git/blob/master/code.json",
      _0x571d42 = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 StatusHeight/20 BundleId/com.gacne.www Version/3.3.9",
      _0x3a15c9 = "https://www.gacne.com.cn",
      _0x223773 = "https://www.gacne.com.cn/web/app/sign_in.html",
      _0x79e5b9 = 5,
      _0x1a60e5 = 13,
      _0x149fb5 = 1000,
      _0x5a59fa = 3600000,
      _0x2aa689 = 0,
      _0x327956 = 3,
      _0x3dd66a = ["顶一下", "打卡", "每日打打卡", "嘿嘿", "哈哈", "积分积分", "顶顶顶"];

class _0x1e527a {
  constructor() {
    this.index = _0x57726e.userIdx++;
    this.name = "";
    this.valid = false;
    const _0x627300 = {
      limit: 0
    };
    const _0x2f158b = {
      Connection: "keep-alive"
    };
    const _0x3d9864 = {
      retry: _0x627300,
      timeout: _0x1f66ac,
      followRedirect: false,
      headers: _0x2f158b
    };
    this.got = _0x157252.extend(_0x3d9864);
  }

  log(_0x4ff667, _0x55786f = {}) {
    let _0x1f3278 = "",
        _0x49dff4 = _0x57726e.userCount.toString().length;

    if (this.index) {
      _0x1f3278 += "账号[" + _0x57726e.padStr(this.index, _0x49dff4) + "]";
    }

    if (this.name) {
      _0x1f3278 += "[" + this.name + "]";
    }

    _0x57726e.log(_0x1f3278 + _0x4ff667, _0x55786f);
  }

  async request(_0x43dfdb) {
    let _0x463e9e = null,
        _0x35402b = 0,
        _0x44adfc = _0x43dfdb.fn || _0x43dfdb.url;

    _0x43dfdb.method = _0x43dfdb?.["method"]?.["toUpperCase"]() || "GET";

    while (_0x35402b++ < _0x41a616) {
      try {
        await this.got(_0x43dfdb).then(_0x4f51f0 => {
          _0x463e9e = _0x4f51f0;
        }, _0x2322a7 => {
          _0x463e9e = _0x2322a7.response;
        });

        if ((_0x463e9e?.["statusCode"] / 100 | 0) <= 4) {
          break;
        }
      } catch (_0x4633ef) {
        _0x4633ef.name == "TimeoutError" ? this.log("[" + _0x44adfc + "]请求超时，重试第" + _0x35402b + "次") : this.log("[" + _0x44adfc + "]请求错误(" + _0x4633ef.message + ")，重试第" + _0x35402b + "次");
      }
    }

    const _0x4beaf6 = {
      statusCode: -1,
      headers: null,
      result: null
    };

    if (_0x463e9e == null) {
      return Promise.resolve(_0x4beaf6);
    }

    let {
      statusCode: _0x21acad,
      headers: _0x20212f,
      body: _0x5aae68
    } = _0x463e9e;

    if (_0x5aae68) {
      try {
        _0x5aae68 = JSON.parse(_0x5aae68);
      } catch {}
    }

    const _0x274316 = {
      statusCode: _0x21acad,
      headers: _0x20212f,
      result: _0x5aae68
    };
    return Promise.resolve(_0x274316);
  }

}

let _0x1c4970 = new _0x1e527a();

class _0x61a68c extends _0x1e527a {
  constructor(_0x2e700e) {
    super();
    this.cookieJar = new _0x39b841();

    let _0x2753be = _0x2e700e?.["match"](/PHPSESSID=(\w+)/);

    this.PHPSESSID = _0x2753be ? _0x2753be[1] : _0x2e700e;
    this.set_cookie("PHPSESSID", this.PHPSESSID);
    const _0x1937af = {
      "User-Agent": _0x571d42,
      Origin: _0x3a15c9,
      Referer: _0x223773
    };
    this.got = this.got.extend({
      cookieJar: this.cookieJar,
      headers: _0x1937af
    });
  }

  set_cookie(_0x280e6f, _0x2a073f, _0x2cf8a7 = {}) {
    let _0x33c9fb = _0x2cf8a7.domain || "gacne.com.cn",
        _0x980b19 = _0x2cf8a7.url || "https://www.gacne.com.cn";

    this.cookieJar.setCookieSync(_0x280e6f + "=" + _0x2a073f + "; Domain=" + _0x33c9fb + ";", "" + _0x980b19);
  }

  async checkLogin(_0x2e5a5a = {}) {
    let _0x2aa514 = false;

    try {
      const _0x41dd56 = {
        fn: "checkLogin",
        method: "post",
        url: "https://www.gacne.com.cn/index/Madepost/checkLogin"
      };

      let {
        result: _0x5564ff
      } = await this.request(_0x57726e.copy(_0x41dd56)),
          _0x3adeb3 = _0x57726e.get(_0x5564ff, "code", -1);

      if (_0x3adeb3 == 200) {
        this.valid = true;
        let {
          device_id: _0x5e0723,
          tel: _0x1d8c34,
          token: _0x3df494
        } = _0x5564ff?.["data"];
        this.deviceId = _0x5e0723;
        this.deviceId && this.set_cookie("deviceId", this.deviceId);
        this.name = _0x1d8c34;
        this.token = _0x3df494;
        _0x2aa514 = await this.refresh();
      } else {
        let _0x4d294d = _0x57726e.get(_0x5564ff, "msg", "");

        this.log("登录失败[" + _0x3adeb3 + "]: " + _0x4d294d);
      }
    } catch (_0x56cd2f) {
      console.log(_0x56cd2f);
    } finally {
      return _0x2aa514;
    }
  }

  async refresh(_0x37f45f = {}) {
    let _0x446dd1 = false;

    try {
      const _0x3c91b7 = {
        fn: "refresh",
        method: "post",
        url: "https://www.gacne.com.cn/newv1/lifemain/insurance-mapi/order/had-insurance-order"
      };

      let {
        result: _0x58b7f2
      } = await this.request(_0x57726e.copy(_0x3c91b7)),
          _0x5050a9 = _0x57726e.get(_0x58b7f2, "code", -1);

      if (_0x5050a9 == "0000") {
        _0x446dd1 = true;
      } else {
        let _0x1222de = _0x57726e.get(_0x58b7f2, "msg", "");

        this.log("刷新CK失败[" + _0x5050a9 + "]: " + _0x1222de);
      }
    } catch (_0xcde42a) {
      console.log(_0xcde42a);
    } finally {
      return _0x446dd1;
    }
  }

  async sign_in(_0x3918cf = {}) {
    try {
      const _0x4c2257 = {
        taskTypeCode: "TASK-INTEGRAL-SIGN-IN"
      };
      const _0xa4570a = {
        fn: "sign_in",
        method: "post",
        url: "https://www.gacne.com.cn/newv1/lifemain/task-mapi/sign-in",
        json: _0x4c2257
      };
      {
        let {
          result: _0x2765ad
        } = await this.request(_0x57726e.copy(_0xa4570a)),
            _0x43ae24 = _0x57726e.get(_0x2765ad, "code", -1);

        if (_0x43ae24 == "0000") {
          let {
            isFirstSign: _0xada6da
          } = _0x2765ad?.["data"];
          _0xada6da ? this.log("签到成功") : this.log("今天已签到");
        } else {
          let _0x405d4e = _0x57726e.get(_0x2765ad, "msg", "");

          this.log("查询签到失败[" + _0x43ae24 + "]: " + _0x405d4e);
        }
      }
      {
        let {
          result: _0x436816
        } = await this.request(_0x57726e.copy(_0xa4570a)),
            _0x2412e4 = _0x57726e.get(_0x436816, "code", -1);

        if (_0x2412e4 == "0000") {
          let {
            days: _0x2cb92f,
            nextBoxTotalDay: _0x5644ae,
            boxList: _0x249f7a
          } = _0x436816?.["data"];
          this.log("盲盒进度: " + _0x2cb92f + "/" + _0x5644ae);

          for (let _0x14c86c of (_0x249f7a || []).filter(_0x8bef3 => _0x8bef3.status == 1)) {
            for (let _0x4b5bcf = 0; _0x4b5bcf < _0x14c86c.openAmount; _0x4b5bcf++) {
              await this.box_draw(_0x14c86c);
            }
          }
        } else {
          let _0x3639bf = _0x57726e.get(_0x436816, "msg", "");

          this.log("查询盲盒进度失败[" + _0x2412e4 + "]: " + _0x3639bf);
        }
      }
    } catch (_0x578aae) {
      console.log(_0x578aae);
    }
  }

  async box_draw(_0x3e3b3c, _0x2ca7ed = {}) {
    try {
      const _0x16465b = {
        boxId: _0x3e3b3c.boxId,
        type: 0
      };
      const _0x1f5e4c = {
        fn: "box_draw",
        method: "post",
        url: "https://www.gacne.com.cn/newv1/lifemain/frontend/box/draw",
        json: _0x16465b
      };

      let {
        result: _0x2cb490
      } = await this.request(_0x57726e.copy(_0x1f5e4c)),
          _0x5f56d2 = _0x57726e.get(_0x2cb490, "code", -1);

      if (_0x5f56d2 == "0000") {
        let {
          prizeName: _0x5c4c9d,
          boxName: _0x477b46
        } = _0x2cb490?.["data"];
        const _0x5805b9 = {
          notify: true
        };
        this.log("开启[" + _0x477b46 + "]: " + _0x5c4c9d, _0x5805b9);
      } else {
        let _0x1aad43 = _0x57726e.get(_0x2cb490, "msg", "");

        this.log("开启[" + _0x3e3b3c.boxName + "]失败[" + _0x5f56d2 + "]: " + _0x1aad43);
      }
    } catch (_0x3a3ced) {
      console.log(_0x3a3ced);
    }
  }

  async check_integral(_0x26a1ff = {}) {
    try {
      const _0x5bb117 = {
        fn: "check_integral",
        method: "post",
        url: "https://www.gacne.com.cn/newv1/lifemain/task-mapi/sign-in",
        json: {}
      };
      _0x5bb117.json.taskTypeCode = "TASK-INTEGRAL-SIGN-IN";

      let {
        result: _0x15f240
      } = await this.request(_0x57726e.copy(_0x5bb117)),
          _0x348985 = _0x57726e.get(_0x15f240, "code", -1);

      if (_0x348985 == "0000") {
        this.integral = _0x15f240?.["data"]?.["totalIntegral"] || 0;
        const _0x5967f7 = {
          notify: true
        };
        this.log("积分: " + this.integral, _0x5967f7);
      } else {
        let _0x4449e3 = _0x57726e.get(_0x15f240, "msg", "");

        this.log("查询积分失败[" + _0x348985 + "]: " + _0x4449e3);
      }
    } catch (_0xb1012) {
      console.log(_0xb1012);
    }
  }

  async detail_new(_0x28fa51 = {}) {
    try {
      const _0x3cf3e2 = {
        fn: "detail_new",
        method: "post",
        url: "https://www.gacne.com.cn/newv1/lifemain/task-mapi/sign-in/detail-new",
        json: {}
      };
      _0x3cf3e2.json.taskTypeCode = "TASK-INTEGRAL-SIGN-IN";

      let {
        result: _0xfcaa2d
      } = await this.request(_0x57726e.copy(_0x3cf3e2)),
          _0x5086a5 = _0x57726e.get(_0xfcaa2d, "code", -1);

      if (_0x5086a5 == "0000") {
        for (let _0x1b6428 of _0xfcaa2d?.["data"]?.["banners"] || []) {
          for (let _0x1d600a of _0x1b6428?.["contents"] || []) {
            for (let _0x2fb095 of (_0x1d600a?.["tasks"] || []).filter(_0x1aba03 => _0x1aba03.buttonStatus === 0)) {
              await this.process_task(_0x2fb095);
            }
          }
        }
      } else {
        let _0x1e19c9 = _0x57726e.get(_0xfcaa2d, "msg", "");

        this.log("查询任务失败[" + _0x5086a5 + "]: " + _0x1e19c9);
      }
    } catch (_0x37e189) {
      console.log(_0x37e189);
    }
  }

  async process_task(_0x2181b7, _0x543497 = {}) {
    try {
      switch (_0x2181b7.taskId) {
        case 62:
          {
            let _0x2d9cbd = Math.floor(Math.random() * 10000) + 45000;

            for (let _0x19f914 = 0; _0x19f914 < 5; _0x19f914++) {
              await this.article_like(_0x2d9cbd + _0x19f914);
            }

            break;
          }
      }
    } catch (_0x4cd91a) {
      console.log(_0x4cd91a);
    }
  }

  async comment_add(_0x4bea91, _0x1ef972 = {}) {
    try {
      let _0x340015 = _0x57726e.randomList(_0x3dd66a),
          _0x2b9f20 = {
        fn: "comment_add",
        method: "post",
        url: "https://www.gacne.com.cn/newv1/cms/frontend/comment/add",
        json: {
          sourceId: _0x4bea91.toString(),
          type: "104",
          content: _0x340015,
          contentExt: _0x340015,
          atFriendsList: []
        }
      },
          {
        result: _0x24af06
      } = await this.request(_0x57726e.copy(_0x2b9f20)),
          _0x377dcc = _0x57726e.get(_0x24af06, "code", -1);

      if (_0x377dcc == "0000") {
        let _0x376cad = _0x24af06?.["data"]?.["id"] || 0;

        this.log("评论文章[" + _0x4bea91 + "]成功: 评论id=" + _0x376cad);
        _0x376cad && (await this.comment_delete(_0x376cad));
      } else {
        let _0x4dd834 = _0x57726e.get(_0x24af06, "msg", "");

        this.log("评论失败[" + _0x377dcc + "]: " + _0x4dd834);
      }
    } catch (_0x33db3f) {
      console.log(_0x33db3f);
    }
  }

  async comment_delete(_0x2d86d7, _0x3148a6 = {}) {
    try {
      let _0x1100b5 = {
        fn: "comment_add",
        method: "post",
        url: "https://www.gacne.com.cn/newv1/cms/frontend/comment/delete",
        json: {
          commentId: _0x2d86d7.toString(),
          version: "3.3.9"
        }
      },
          {
        result: _0x47dabf
      } = await this.request(_0x57726e.copy(_0x1100b5)),
          _0x50c004 = _0x57726e.get(_0x47dabf, "code", -1);

      if (_0x50c004 == "0000") {
        this.log("删除评论[" + _0x2d86d7 + "]成功");
      } else {
        let _0x1c1b85 = _0x57726e.get(_0x47dabf, "msg", "");

        this.log("删除评论[" + _0x2d86d7 + "]失败[" + _0x50c004 + "]: " + _0x1c1b85);
      }
    } catch (_0x283137) {
      console.log(_0x283137);
    }
  }

  async article_like(_0x3f7a7b, _0x5c0c91 = true, _0x468fdd = 0, _0x2f05f6 = {}) {
    try {
      const _0x2237b0 = {
        fn: "comment_add",
        method: "post",
        url: "https://www.gacne.com.cn/newv1/cms/frontend/like/like",
        json: {}
      };
      _0x2237b0.json.businessType = "104";
      _0x2237b0.json.businessId = _0x3f7a7b;

      let {
        result: _0x89b536
      } = await this.request(_0x57726e.copy(_0x2237b0)),
          _0x5bff9e = _0x57726e.get(_0x89b536, "code", -1);

      if (_0x5bff9e == "0000") {
        _0x89b536?.["data"] == true ? (this.log("点赞文章[" + _0x3f7a7b + "]成功"), await this.article_like(_0x3f7a7b, false)) : _0x5c0c91 ? _0x468fdd < _0x327956 ? await this.article_like(_0x3f7a7b, true, _0x468fdd + 1) : this.log("点赞文章[" + _0x3f7a7b + "]失败") : this.log("取消点赞文章[" + _0x3f7a7b + "]成功");
      } else {
        let _0x2317e8 = _0x57726e.get(_0x89b536, "msg", "");

        this.log("点赞文章[" + _0x3f7a7b + "]失败[" + _0x5bff9e + "]: " + _0x2317e8);
      }
    } catch (_0x423adf) {
      console.log(_0x423adf);
    }
  }

  async userTask(_0x332f3a = {}) {
    if (!(await this.checkLogin())) {
      return;
    }

    await this.sign_in();
    await this.detail_new();
    await this.check_integral();
  }

}

!(async () => {
  //if (!(await _0x54e8ac())) {
  //  return;
  //}

  _0x57726e.read_env(_0x61a68c);

  for (let _0x1682e4 of _0x57726e.userList) {
    await _0x1682e4.userTask();
  }
})().catch(_0x30e3bb => _0x57726e.log(_0x30e3bb)).finally(() => _0x57726e.exitNow());

async function _0x54e8ac(_0x24bc02 = 0) {
  let _0xbe6122 = false;

  try {
    const _0x2bdf7d = {
      fn: "auth",
      method: "get",
      url: _0xd58e67,
      timeout: 20000
    };
    let {
      statusCode: _0x3b94f2,
      result: _0xccbbf5
    } = await _0x1c4970.request(_0x2bdf7d);

    if (_0x3b94f2 != 200) {
      _0x24bc02++ < _0x79e5b9 && (_0xbe6122 = await _0x54e8ac(_0x24bc02));
      return _0xbe6122;
    }

    if (_0xccbbf5?.["code"] == 0) {
      _0xccbbf5 = JSON.parse(_0xccbbf5.data.file.data);

      if (_0xccbbf5?.["commonNotify"] && _0xccbbf5.commonNotify.length > 0) {
        const _0x2920c3 = {
          notify: true
        };

        _0x57726e.log(_0xccbbf5.commonNotify.join("\n") + "\n", _0x2920c3);
      }

      _0xccbbf5?.["commonMsg"] && _0xccbbf5.commonMsg.length > 0 && _0x57726e.log(_0xccbbf5.commonMsg.join("\n") + "\n");

      if (_0xccbbf5[_0x5cb507]) {
        let _0x3e76d7 = _0xccbbf5[_0x5cb507];
        _0x3e76d7.status == 0 ? _0x620eeb >= _0x3e76d7.version ? (_0xbe6122 = true, _0x57726e.log(_0x3e76d7.msg[_0x3e76d7.status]), _0x57726e.log(_0x3e76d7.updateMsg), _0x57726e.log("现在运行的脚本版本是：" + _0x620eeb + "，最新脚本版本：" + _0x3e76d7.latestVersion)) : _0x57726e.log(_0x3e76d7.versionMsg) : _0x57726e.log(_0x3e76d7.msg[_0x3e76d7.status]);
      } else {
        _0x57726e.log(_0xccbbf5.errorMsg);
      }
    } else {
      _0x24bc02++ < _0x79e5b9 && (_0xbe6122 = await _0x54e8ac(_0x24bc02));
    }
  } catch (_0x3351ef) {
    _0x57726e.log(_0x3351ef);
  } finally {
    return _0xbe6122;
  }
}

function _0xafb67f(_0x1769fd) {
  return new class {
    constructor(_0x256e2d) {
      this.name = _0x256e2d;
      this.startTime = Date.now();
      const _0x5c5246 = {
        time: true
      };
      this.log("[" + this.name + "]开始运行\n", _0x5c5246);
      this.notifyStr = [];
      this.notifyFlag = true;
      this.userIdx = 0;
      this.userList = [];
      this.userCount = 0;
    }

    log(_0x3a7bbe, _0x5948a5 = {}) {
      const _0x5dcf03 = {
        console: true
      };
      Object.assign(_0x5dcf03, _0x5948a5);

      if (_0x5dcf03.time) {
        let _0x39f680 = _0x5dcf03.fmt || "hh:mm:ss";

        _0x3a7bbe = "[" + this.time(_0x39f680) + "]" + _0x3a7bbe;
      }

      if (_0x5dcf03.notify) {
        this.notifyStr.push(_0x3a7bbe);
      }

      if (_0x5dcf03.console) {
        console.log(_0x3a7bbe);
      }
    }

    get(_0x39951a, _0x25a1a2, _0x4d4fc7 = "") {
      let _0x4e7345 = _0x4d4fc7;
      _0x39951a?.["hasOwnProperty"](_0x25a1a2) && (_0x4e7345 = _0x39951a[_0x25a1a2]);
      return _0x4e7345;
    }

    pop(_0x2e950f, _0x7c0dad, _0x359351 = "") {
      let _0x13a1bb = _0x359351;
      _0x2e950f?.["hasOwnProperty"](_0x7c0dad) && (_0x13a1bb = _0x2e950f[_0x7c0dad], delete _0x2e950f[_0x7c0dad]);
      return _0x13a1bb;
    }

    copy(_0x49edda) {
      return Object.assign({}, _0x49edda);
    }

    read_env(_0x10092d) {
      let _0x51da5d = _0x570313.map(_0x24b37d => process.env[_0x24b37d]);

      for (let _0x29db68 of _0x51da5d.filter(_0x5a7143 => !!_0x5a7143)) {
        for (let _0x158a73 of _0x29db68.split(_0x27935e).filter(_0x376b1c => !!_0x376b1c)) {
          if (this.userList.includes(_0x158a73)) {
            continue;
          }

          this.userList.push(new _0x10092d(_0x158a73));
        }
      }

      this.userCount = this.userList.length;

      if (!this.userCount) {
        const _0x222b1f = {
          notify: true
        };
        this.log("未找到变量，请检查变量" + _0x570313.map(_0x271334 => "[" + _0x271334 + "]").join("或"), _0x222b1f);
        return false;
      }

      this.log("共找到" + this.userCount + "个账号");
      return true;
    }

    async threads(_0x4949f6, _0x584e43, _0x5a910f = {}) {
      while (_0x584e43.idx < _0x57726e.userList.length) {
        let _0x2ac950 = _0x57726e.userList[_0x584e43.idx++];

        if (!_0x2ac950.valid) {
          continue;
        }

        await _0x2ac950[_0x4949f6](_0x5a910f);
      }
    }

    async threadTask(_0x2dea71, _0xc5fc20) {
      let _0x50bab2 = [];
      const _0x57c126 = {
        idx: 0
      };

      while (_0xc5fc20--) {
        _0x50bab2.push(this.threads(_0x2dea71, _0x57c126));
      }

      await Promise.all(_0x50bab2);
    }

    time(_0xd7b6ec, _0x470f66 = null) {
      let _0x1f2c33 = _0x470f66 ? new Date(_0x470f66) : new Date(),
          _0x5a2523 = {
        "M+": _0x1f2c33.getMonth() + 1,
        "d+": _0x1f2c33.getDate(),
        "h+": _0x1f2c33.getHours(),
        "m+": _0x1f2c33.getMinutes(),
        "s+": _0x1f2c33.getSeconds(),
        "q+": Math.floor((_0x1f2c33.getMonth() + 3) / 3),
        S: this.padStr(_0x1f2c33.getMilliseconds(), 3)
      };

      /(y+)/.test(_0xd7b6ec) && (_0xd7b6ec = _0xd7b6ec.replace(RegExp.$1, (_0x1f2c33.getFullYear() + "").substr(4 - RegExp.$1.length)));

      for (let _0x28cc52 in _0x5a2523) new RegExp("(" + _0x28cc52 + ")").test(_0xd7b6ec) && (_0xd7b6ec = _0xd7b6ec.replace(RegExp.$1, 1 == RegExp.$1.length ? _0x5a2523[_0x28cc52] : ("00" + _0x5a2523[_0x28cc52]).substr(("" + _0x5a2523[_0x28cc52]).length)));

      return _0xd7b6ec;
    }

    async showmsg() {
      if (!this.notifyFlag) {
        return;
      }

      if (!this.notifyStr.length) {
        return;
      }

      let _0x1d4fbc = require("./sendNotify");

      this.log("\n============== 推送 ==============");
      await _0x1d4fbc.sendNotify(this.name, this.notifyStr.join("\n"));
    }

    padStr(_0x3ad858, _0x529cdd, _0x52f10e = {}) {
      let _0x430a77 = _0x52f10e.padding || "0",
          _0x2f3ffe = _0x52f10e.mode || "l",
          _0x20e6f5 = String(_0x3ad858),
          _0x35ef26 = _0x529cdd > _0x20e6f5.length ? _0x529cdd - _0x20e6f5.length : 0,
          _0x28c19f = "";

      for (let _0x178519 = 0; _0x178519 < _0x35ef26; _0x178519++) {
        _0x28c19f += _0x430a77;
      }

      _0x2f3ffe == "r" ? _0x20e6f5 = _0x20e6f5 + _0x28c19f : _0x20e6f5 = _0x28c19f + _0x20e6f5;
      return _0x20e6f5;
    }

    json2str(_0x359dfc, _0x55e160, _0xe089a1 = false) {
      let _0x209a05 = [];

      for (let _0x25a87e of Object.keys(_0x359dfc).sort()) {
        let _0x490db8 = _0x359dfc[_0x25a87e];

        if (_0x490db8 && _0xe089a1) {
          _0x490db8 = encodeURIComponent(_0x490db8);
        }

        _0x209a05.push(_0x25a87e + "=" + _0x490db8);
      }

      return _0x209a05.join(_0x55e160);
    }

    str2json(_0x17b2a4, _0x272cec = false) {
      let _0x162d31 = {};

      for (let _0x3c5246 of _0x17b2a4.split("&")) {
        if (!_0x3c5246) {
          continue;
        }

        let _0x2f91c5 = _0x3c5246.indexOf("=");

        if (_0x2f91c5 == -1) {
          continue;
        }

        let _0x1ab288 = _0x3c5246.substr(0, _0x2f91c5),
            _0x162db1 = _0x3c5246.substr(_0x2f91c5 + 1);

        if (_0x272cec) {
          _0x162db1 = decodeURIComponent(_0x162db1);
        }

        _0x162d31[_0x1ab288] = _0x162db1;
      }

      return _0x162d31;
    }

    randomPattern(_0x5f3c83, _0x19f9c5 = "abcdef0123456789") {
      let _0x4fa6d4 = "";

      for (let _0x348d6c of _0x5f3c83) {
        if (_0x348d6c == "x") {
          _0x4fa6d4 += _0x19f9c5.charAt(Math.floor(Math.random() * _0x19f9c5.length));
        } else {
          _0x348d6c == "X" ? _0x4fa6d4 += _0x19f9c5.charAt(Math.floor(Math.random() * _0x19f9c5.length)).toUpperCase() : _0x4fa6d4 += _0x348d6c;
        }
      }

      return _0x4fa6d4;
    }

    randomUuid() {
      return this.randomPattern("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
    }

    randomString(_0x343b03, _0x324233 = "abcdef0123456789") {
      let _0x30330 = "";

      for (let _0x4135c1 = 0; _0x4135c1 < _0x343b03; _0x4135c1++) {
        _0x30330 += _0x324233.charAt(Math.floor(Math.random() * _0x324233.length));
      }

      return _0x30330;
    }

    randomList(_0x13e9bb) {
      let _0x110f62 = Math.floor(Math.random() * _0x13e9bb.length);

      return _0x13e9bb[_0x110f62];
    }

    wait(_0x24952c) {
      return new Promise(_0x34f73f => setTimeout(_0x34f73f, _0x24952c));
    }

    async exitNow() {
      await this.showmsg();

      let _0x2d8959 = Date.now(),
          _0x46c8c7 = (_0x2d8959 - this.startTime) / 1000;

      this.log("");
      const _0x4e1a23 = {
        time: true
      };
      this.log("[" + this.name + "]运行结束，共运行了" + _0x46c8c7 + "秒", _0x4e1a23);
      process.exit(0);
    }

    normalize_time(_0x53b538, _0x1faa00 = {}) {
      let _0x37b02e = _0x1faa00.len || _0x1a60e5;

      _0x53b538 = _0x53b538.toString();
      let _0x166c58 = _0x53b538.length;

      while (_0x166c58 < _0x37b02e) {
        _0x53b538 += "0";
      }

      _0x166c58 > _0x37b02e && (_0x53b538 = _0x53b538.slice(0, 13));
      return parseInt(_0x53b538);
    }

    async wait_until(_0x218619, _0x55d35f = {}) {
      let _0x52ea23 = _0x55d35f.logger || this,
          _0x40b0a3 = _0x55d35f.interval || _0x149fb5,
          _0x321fe6 = _0x55d35f.limit || _0x5a59fa,
          _0x43d134 = _0x55d35f.ahead || _0x2aa689;

      if (typeof _0x218619 == "string" && _0x218619.includes(":")) {
        if (_0x218619.includes("-")) {
          _0x218619 = new Date(_0x218619).getTime();
        } else {
          let _0x4570db = this.time("yyyy-MM-dd ");

          _0x218619 = new Date(_0x4570db + _0x218619).getTime();
        }
      }

      let _0x213726 = this.normalize_time(_0x218619) - _0x43d134,
          _0x15f711 = this.time("hh:mm:ss.S", _0x213726),
          _0x64038d = Date.now();

      _0x64038d > _0x213726 && (_0x213726 += 86400000);

      let _0x2300fa = _0x213726 - _0x64038d;

      if (_0x2300fa > _0x321fe6) {
        const _0x472762 = {
          time: true
        };

        _0x52ea23.log("离目标时间[" + _0x15f711 + "]大于" + _0x321fe6 / 1000 + "秒,不等待", _0x472762);
      } else {
        const _0x51bb43 = {
          time: true
        };

        _0x52ea23.log("离目标时间[" + _0x15f711 + "]还有" + _0x2300fa / 1000 + "秒,开始等待", _0x51bb43);

        while (_0x2300fa > 0) {
          let _0x35d2f8 = Math.min(_0x2300fa, _0x40b0a3);

          await this.wait(_0x35d2f8);
          _0x64038d = Date.now();
          _0x2300fa = _0x213726 - _0x64038d;
        }

        const _0x50a2dc = {
          time: true
        };

        _0x52ea23.log("已完成等待", _0x50a2dc);
      }
    }

    async wait_gap_interval(_0x4b224a, _0x63b7f5) {
      let _0x33918a = Date.now() - _0x4b224a;

      _0x33918a < _0x63b7f5 && (await this.wait(_0x63b7f5 - _0x33918a));
    }

  }(_0x1769fd);
}
