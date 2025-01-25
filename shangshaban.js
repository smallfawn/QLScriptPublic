
/*
  完成每日任务，一天55积分左右，可以兑换实物或话费
  new Env('上啥班');
  cron: 18 8,18 * * *
*/


NAME = "上啥班";
VALY = ["ssbck"];
LOGS = 0;
CK = "";
var userList = [];
class Bar {
  constructor(_0x4e1417) {
    this.phone = _0x4e1417.split("#")[0];
    this.password = _0x4e1417.split("#")[1];
    this.rsakey = "eGmAg2#@*~fgK45o";
    this.text = "1234561234567890";
    this.logs = true;
  }
  async login() {
    let _0x27e215 = "{\"phone\":\"" + this.phone + "\",\"password\":\"" + this.password + "\",\"deviceType\":\"2\",\"appVersion\":\"5.2.16\",\"phoneFirm\":\"Xiaomi\",\"phoneVersion\":\"M2011K2C\",\"phoneSystemVersion\":\"11\"}",
      _0x5379d3 = EncryptCrypto("AES", "CBC", "Pkcs7", _0x27e215, this.rsakey, this.text),
      _0xb64d20 = _0x5379d3.replace("/", "%2F").replace("/", "%2F").replace("/", "%2F").replace("/", "%2F").replace("/", "%2F").replace("/", "%2F").replace("/", "%2F").replace("+", "%2B").replace("+", "%2B").replace("+", "%2B").replace("+", "%2B").replace("+", "%2B").replace("+", "%2B").replace("+", "%2B").replace("+", "%2B").replace("+", "%2B").replace("=", "%3D").replace("=", "%3D"),
      _0x2b769d = "data=" + _0xb64d20,
      _0x29764f = await task("post", "https://portals.shangshaban.com/api/user/loginV2", {}, _0x2b769d);
    _0x29764f.status == 1 ? (this.uid = _0x29764f.user.id, this.token = _0x29764f.token, this.name = _0x29764f.user.name, console.log("【" + this.name + "】 登陆成功"), this.logs = true) : this.logs = false;
  }
  async tasklist() {
    let _0x24d2eb = {
        authorization: "" + this.token,
        user: "" + this.uid,
        apiversion: "2"
      },
      _0x8981d7 = "uid=" + this.uid + "&type=1",
      _0x456535 = await task("post", "https://social.shangshaban.com/app/api/user/getTaskCenterV5211", _0x24d2eb, _0x8981d7);
    if (_0x456535.everydayTask) {
      for (let _0x59736e of _0x456535.everydayTask) {
        if (_0x59736e.taskName == "每日签到" && _0x59736e.isFinished == 0) {
          await this.signin();
        } else {
          if (_0x59736e.taskName == "看视频赚班币" && _0x59736e.isFinished == 0) {
            let _0xd067b3 = _0x59736e.frequency,
              _0x5e6518 = _0x59736e.count;
            for (let _0x285736 = _0x5e6518; _0x285736 < _0xd067b3; _0x285736++) {
              await this.video();
            }
          } else {
            if (_0x59736e.taskName == "点赞5个视频" && _0x59736e.isFinished == 0) {
              let _0x34f01e = _0x59736e.frequency,
                _0x16e55d = _0x59736e.count;
              for (let _0x437a60 = _0x16e55d; _0x437a60 < _0x34f01e; _0x437a60++) {
                await this.like();
              }
            } else {
              if (_0x59736e.taskName == "转发3个视频" && _0x59736e.isFinished == 0) {
                let _0x2516b4 = _0x59736e.frequency,
                  _0xf78323 = _0x59736e.count;
                for (let _0x32ee8b = _0xf78323; _0x32ee8b < _0x2516b4; _0x32ee8b++) {
                  await this.share();
                }
              } else {
                if (_0x59736e.taskName == "看职位" && _0x59736e.isFinished == 0) {
                  await this.viewjob();
                } else {
                  if (_0x59736e.taskName == "主动沟通招聘者" && _0x59736e.isFinished == 0) {
                    let _0x5922e0 = _0x59736e.frequency,
                      _0x28a400 = _0x59736e.count;
                    for (let _0xabd1f8 = _0x28a400; _0xabd1f8 < _0x5922e0; _0xabd1f8++) {
                      await this.chat();
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      console.log("【" + this.name + "】任务列表获取失败！！！");
    }
  }
  async signin() {
    let _0x4992f4 = {
        authorization: "" + this.token,
        user: "" + this.uid,
        apiversion: "2"
      },
      _0x363039 = "uid=" + this.uid + "&type=1",
      _0x212ec0 = await task("post", "https://portals.shangshaban.com/api/activity/insertSignInList", _0x4992f4, _0x363039);
    _0x212ec0.no == 1 ? console.log("【" + this.name + "】 签到成功") : console.log("【" + this.name + "】 " + _0x212ec0.msg);
  }
  async video() {
    let _0x196ee7 = "15" + SJS(4),
      _0x4f41d8 = {
        authorization: "" + this.token,
        user: "" + this.uid,
        apiversion: "2"
      },
      _0x2638d6 = "userId=" + this.uid + "&userType=1&videoId=" + _0x196ee7 + "&videoType=2",
      _0x5566b9 = await task("post", "https://portals.shangshaban.com/api/enterpriseVideo/saveSeenVideoTimeAdvertisement", _0x4f41d8, _0x2638d6);
    _0x5566b9.no == 1 ? (console.log("【" + this.name + "】 观看视频成功"), await wait(RT(15000, 20000))) : console.log("【" + this.name + "】 " + _0x5566b9.msg);
  }
  async like() {
    let _0x32d7ff = "14" + SJS(4),
      _0x284dc1 = {
        authorization: "" + this.token,
        user: "" + this.uid,
        apiversion: "2"
      },
      _0x4e690a = "uid=" + this.uid + "&vid=" + _0x32d7ff + "&likeType=1",
      _0x2ea1b3 = await task("post", "https://portals.shangshaban.com/api/user/praiseEnterpriseVideo.do", _0x284dc1, _0x4e690a);
    _0x2ea1b3.no == 1 ? (console.log("【" + this.name + "】 视频点赞成功"), await wait(RT(15000, 20000))) : console.log("【" + this.name + "】 " + _0x2ea1b3.msg);
  }
  async share() {
    let _0x4c90fb = "14" + SJS(4),
      _0x7042ea = {
        authorization: "" + this.token,
        user: "" + this.uid,
        apiversion: "2"
      },
      _0x37273c = "uid=" + this.uid + "&type=1&platform=1&parameter=4&shareId=" + _0x4c90fb,
      _0x24d1fa = await task("post", "https://portals.shangshaban.com/api/user/newShareV2", _0x7042ea, _0x37273c);
    _0x24d1fa.no == 1 ? (console.log("【" + this.name + "】 视频分享成功"), await wait(RT(15000, 20000))) : console.log("【" + this.name + "】 " + _0x24d1fa.msg);
  }
  async joblist() {
    let _0x1c481f = {
        authorization: "" + this.token,
        user: "" + this.uid,
        apiversion: "2"
      },
      _0x256e63 = "uid=" + this.uid + "&loadType=0&workCity=%E5%8D%97%E4%BA%AC%E5%B8%82&positionIds1%5B0%5D=5610&positionIds%5B0%5D=5600&infix=infix&refresh=uat&renovate=1&offset=0",
      _0x6ae5cb = await task("post", "https://portals.shangshaban.com/api/job/getJobRecommendList", _0x1c481f, _0x256e63);
    this.ai = _0x6ae5cb.results;
  }
  async viewjob() {
    for (let _0x4ec9d2 of this.ai) {
      let _0x1d3621 = _0x4ec9d2.enterpriseId,
        _0x1d2582 = _0x4ec9d2.id,
        _0x25cb77 = {
          authorization: "" + this.token,
          user: "" + this.uid,
          apiversion: "2"
        },
        _0x31d441 = "enterpriseUserId=" + _0x1d3621 + "&userId=" + this.uid + "&jobId=" + _0x1d2582 + "&type=1",
        _0x4061fd = await task("post", "https://portals.shangshaban.com/api/user/saveSeenJobTimeAdvertisement", _0x25cb77, _0x31d441);
      _0x4061fd.no == 1 ? (console.log("【" + this.name + "】 浏览职位成功"), await wait(RT(15000, 20000))) : console.log("【" + this.name + "】 " + _0x4061fd.msg);
    }
  }
  async chat() {
    let _0x4c4fdf = {
        authorization: "" + this.token,
        user: "" + this.uid,
        apiversion: "2"
      },
      _0x24f027 = "uid=" + this.uid + "&type=1",
      _0x31db67 = await task("post", "https://portals.shangshaban.com/api/chat/communicate", _0x4c4fdf, _0x24f027);
    _0x31db67.status == 1 ? (console.log("【" + this.name + "】 主动找HR沟通成功"), await wait(RT(15000, 20000))) : console.log("【" + this.name + "】 " + _0x31db67.msg);
  }
  async user() {
    let _0x2f55c6 = {
        authorization: "" + this.token,
        user: "" + this.uid,
        apiversion: "2"
      },
      _0x751250 = "uid=" + this.uid + "&isJudgeGrade=1&needShowMedalnotify=1",
      _0x16f11b = await task("post", "https://portals.shangshaban.com/api/user/getMeV491", _0x2f55c6, _0x751250);
    console.log("【" + this.name + "】==>现有总积分" + _0x16f11b.scoreCount);
  }
}
!(async () => {
  console.log("蛋炒饭美食交流频道：https://t.me/+xjTie4yvzm83OTI9");
  console.log(NAME);
  checkEnv();
  for (let _0x48086d of userList) {
    await _0x48086d.login();
  }
  let _0x56c44c = userList.filter(_0x30f9a1 => _0x30f9a1.logs == true);
  if (_0x56c44c.length == 0) {
    console.log("呆子，检查一下你的CK是否正确");
    return;
  }
  for (let _0x19cb20 of _0x56c44c) {
    await _0x19cb20.joblist();
    await _0x19cb20.tasklist();
    await _0x19cb20.user();
  }
})().catch(_0xc58dfc => {
  console.log(_0xc58dfc);
}).finally(() => {});
function RT(_0x4f1438, _0xe198f4) {
  return Math.round(Math.random() * (_0xe198f4 - _0x4f1438) + _0x4f1438);
}
function times(_0x47241d) {
  if (_0x47241d == 10) {
    let _0x5dedd6 = Math.round(new Date().getTime() / 1000).toString();
    return _0x5dedd6;
  } else {
    let _0x23aa80 = new Date().getTime();
    return _0x23aa80;
  }
}
async function task(_0x963ba3, _0x34596c, _0x3bca2f, _0x486531) {
  _0x963ba3 == "delete" ? _0x963ba3 = _0x963ba3.toUpperCase() : _0x963ba3 = _0x963ba3;
  const _0x3967dc = require("request");
  _0x963ba3 == "post" && (delete _0x3bca2f["content-type"], delete _0x3bca2f["Content-type"], delete _0x3bca2f["content-Type"], safeGet(_0x486531) ? _0x3bca2f["Content-Type"] = "application/json;charset=UTF-8" : _0x3bca2f["Content-Type"] = "application/x-www-form-urlencoded", _0x486531 && (_0x3bca2f["Content-Length"] = lengthInUtf8Bytes(_0x486531)));
  _0x3bca2f.Host = _0x34596c.replace("//", "/").split("/")[1];
  if (_0x963ba3.indexOf("T") < 0) {
    var _0x20c229 = {
      url: _0x34596c,
      headers: _0x3bca2f,
      body: _0x486531
    };
  } else {
    var _0x20c229 = {
      url: _0x34596c,
      headers: _0x3bca2f,
      form: JSON.parse(_0x486531)
    };
  }
  return new Promise(async _0x323f1a => {
    _0x3967dc[_0x963ba3.toLowerCase()](_0x20c229, (_0xb351c6, _0x535c9f, _0x39cf21) => {
      try {
        LOGS == 1 && (console.log("==================请求=================="), console.log(_0x20c229), console.log("==================返回=================="), console.log(JSON.parse(_0x39cf21)));
      } catch (_0x413fd8) {} finally {
        !_0xb351c6 ? safeGet(_0x39cf21) ? _0x39cf21 = JSON.parse(_0x39cf21) : _0x39cf21 = _0x39cf21 : _0x39cf21 = _0x34596c + "   API请求失败，请检查网络重试\n" + _0xb351c6;
        return _0x323f1a(_0x39cf21);
      }
    });
  });
}
function SJS(_0x2715cb) {
  _0x2715cb = _0x2715cb || 32;
  var _0x14ffd5 = "1234567890",
    _0xdfdb2b = _0x14ffd5.length,
    _0x3cc592 = "";
  for (i = 0; i < _0x2715cb; i++) {
    _0x3cc592 += _0x14ffd5.charAt(Math.floor(Math.random() * _0xdfdb2b));
  }
  return _0x3cc592;
}
function SJSxx(_0x2dd571) {
  _0x2dd571 = _0x2dd571 || 32;
  var _0x4e72d5 = "abcdefghijklmnopqrstuvwxyz1234567890",
    _0x318a3c = _0x4e72d5.length,
    _0x47f3f2 = "";
  for (i = 0; i < _0x2dd571; i++) {
    _0x47f3f2 += _0x4e72d5.charAt(Math.floor(Math.random() * _0x318a3c));
  }
  return _0x47f3f2;
}
function safeGet(_0x479dd7) {
  try {
    if (typeof JSON.parse(_0x479dd7) == "object") {
      return true;
    }
  } catch (_0x275b93) {
    return false;
  }
}
function lengthInUtf8Bytes(_0x57a4d8) {
  let _0x140669 = encodeURIComponent(_0x57a4d8).match(/%[89ABab]/g);
  return _0x57a4d8.length + (_0x140669 ? _0x140669.length : 0);
}
async function checkEnv() {
  let _0x10627f = process.env[VALY] || CK,
    _0xc3a390 = 0;
  if (_0x10627f) {
    for (let _0x4b23c3 of _0x10627f.split("@").filter(_0x2cdf28 => !!_0x2cdf28)) {
      userList.push(new Bar(_0x4b23c3));
    }
    _0xc3a390 = userList.length;
  } else {
    console.log("\n【" + NAME + "】：未填写变量: " + VALY);
  }
  console.log("共找到" + _0xc3a390 + "个账号");
  return userList;
}
function wait(_0x5ae65d) {
  return new Promise(_0x752bfc => setTimeout(_0x752bfc, _0x5ae65d));
}
function stringToBase64(_0x444cb6) {
  var _0x478b5d = Buffer.from(_0x444cb6).toString("base64");
  return _0x478b5d;
}
function EncryptCrypto(_0x540815, _0x64db3d, _0x29291a, _0x117d7a, _0x1e75e5, _0x338ab5) {
  const _0x2deb2a = require("crypto-js"),
    _0x5cb102 = _0x2deb2a.enc.Utf8.parse(_0x117d7a),
    _0x4c5272 = _0x2deb2a.enc.Utf8.parse(_0x338ab5),
    _0x5b05d8 = _0x2deb2a.enc.Utf8.parse(_0x1e75e5),
    _0x58b69d = _0x2deb2a[_0x540815].encrypt(_0x5cb102, _0x5b05d8, {
      iv: _0x4c5272,
      mode: _0x2deb2a.mode[_0x64db3d],
      padding: _0x2deb2a.pad[_0x29291a]
    });
  return _0x58b69d.toString();
}
function DecryptCrypto(_0x383e36, _0x26ef0e, _0x16381d, _0x3c2e82, _0x22e7ee, _0x3d0e8a) {
  const _0x17d5a8 = require("crypto-js"),
    _0x335f67 = _0x17d5a8.enc.Utf8.parse(_0x3d0e8a),
    _0x1a91aa = _0x17d5a8.enc.Utf8.parse(_0x22e7ee),
    _0x5cd73c = _0x17d5a8[_0x383e36].decrypt(_0x3c2e82, _0x1a91aa, {
      iv: _0x335f67,
      mode: _0x17d5a8.mode[_0x26ef0e],
      padding: _0x17d5a8.pad[_0x16381d]
    });
  return _0x5cd73c.toString(_0x17d5a8.enc.Utf8);
}
function RSA(_0x1bbb01, _0x418efa) {
  const _0x35cd7e = require("node-rsa");
  let _0x2324df = new _0x35cd7e("-----BEGIN PUBLIC KEY-----\n" + _0x418efa + "\n-----END PUBLIC KEY-----");
  _0x2324df.setOptions({
    encryptionScheme: "pkcs1"
  });
  return _0x2324df.encrypt(_0x1bbb01, "base64", "utf8");
}
function SHA1_Encrypt(_0x242c09) {
  return CryptoJS.SHA1(_0x242c09).toString();
}
function SHA256(_0x3a969c) {
  const _0x1de236 = 8,
    _0x18407f = 0;
  function _0x6d213f(_0x204f32, _0x3a4ef5) {
    const _0x4c713c = (65535 & _0x204f32) + (65535 & _0x3a4ef5);
    return (_0x204f32 >> 16) + (_0x3a4ef5 >> 16) + (_0x4c713c >> 16) << 16 | 65535 & _0x4c713c;
  }
  function _0x2caa67(_0x22a2dc, _0x153d81) {
    return _0x22a2dc >>> _0x153d81 | _0x22a2dc << 32 - _0x153d81;
  }
  function _0x2cec48(_0x4c219d, _0x497432) {
    return _0x4c219d >>> _0x497432;
  }
  function _0x576d94(_0x3b5e5a, _0x4ca105, _0x2f5b08) {
    return _0x3b5e5a & _0x4ca105 ^ ~_0x3b5e5a & _0x2f5b08;
  }
  function _0xf840ae(_0xab6a0a, _0x400ecc, _0x1fefba) {
    return _0xab6a0a & _0x400ecc ^ _0xab6a0a & _0x1fefba ^ _0x400ecc & _0x1fefba;
  }
  function _0x2f0aee(_0x3b2313) {
    return _0x2caa67(_0x3b2313, 2) ^ _0x2caa67(_0x3b2313, 13) ^ _0x2caa67(_0x3b2313, 22);
  }
  function _0x38f321(_0x15b752) {
    return _0x2caa67(_0x15b752, 6) ^ _0x2caa67(_0x15b752, 11) ^ _0x2caa67(_0x15b752, 25);
  }
  function _0x120b08(_0x394f75) {
    return _0x2caa67(_0x394f75, 7) ^ _0x2caa67(_0x394f75, 18) ^ _0x2cec48(_0x394f75, 3);
  }
  return function (_0x3fcd30) {
    const _0x520fa1 = _0x18407f ? "0123456789ABCDEF" : "0123456789abcdef";
    let _0x3cb7f2 = "";
    for (let _0x4cde47 = 0; _0x4cde47 < 4 * _0x3fcd30.length; _0x4cde47++) {
      _0x3cb7f2 += _0x520fa1.charAt(_0x3fcd30[_0x4cde47 >> 2] >> 8 * (3 - _0x4cde47 % 4) + 4 & 15) + _0x520fa1.charAt(_0x3fcd30[_0x4cde47 >> 2] >> 8 * (3 - _0x4cde47 % 4) & 15);
    }
    return _0x3cb7f2;
  }(function (_0x37bf21, _0x36ba9a) {
    const _0x313374 = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2025104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298],
      _0x24161b = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225],
      _0x32329b = new Array(64);
    let _0x39b38b, _0x4c2227, _0xb67cd0, _0x2a3ae6, _0x3479dd, _0x399e56, _0x4403ff, _0x56140a, _0x5818ba, _0x1d1539, _0x4685e6, _0x3aae96;
    for (_0x37bf21[_0x36ba9a >> 5] |= 128 << 24 - _0x36ba9a % 32, _0x37bf21[15 + (_0x36ba9a + 64 >> 9 << 4)] = _0x36ba9a, _0x5818ba = 0; _0x5818ba < _0x37bf21.length; _0x5818ba += 16) {
      for (_0x39b38b = _0x24161b[0], _0x4c2227 = _0x24161b[1], _0xb67cd0 = _0x24161b[2], _0x2a3ae6 = _0x24161b[3], _0x3479dd = _0x24161b[4], _0x399e56 = _0x24161b[5], _0x4403ff = _0x24161b[6], _0x56140a = _0x24161b[7], _0x1d1539 = 0; _0x1d1539 < 64; _0x1d1539++) {
        _0x32329b[_0x1d1539] = _0x1d1539 < 16 ? _0x37bf21[_0x1d1539 + _0x5818ba] : _0x6d213f(_0x6d213f(_0x6d213f(_0x2caa67(_0x4c12d3 = _0x32329b[_0x1d1539 - 2], 17) ^ _0x2caa67(_0x4c12d3, 19) ^ _0x2cec48(_0x4c12d3, 10), _0x32329b[_0x1d1539 - 7]), _0x120b08(_0x32329b[_0x1d1539 - 15])), _0x32329b[_0x1d1539 - 16]);
        _0x4685e6 = _0x6d213f(_0x6d213f(_0x6d213f(_0x6d213f(_0x56140a, _0x38f321(_0x3479dd)), _0x576d94(_0x3479dd, _0x399e56, _0x4403ff)), _0x313374[_0x1d1539]), _0x32329b[_0x1d1539]);
        _0x3aae96 = _0x6d213f(_0x2f0aee(_0x39b38b), _0xf840ae(_0x39b38b, _0x4c2227, _0xb67cd0));
        _0x56140a = _0x4403ff;
        _0x4403ff = _0x399e56;
        _0x399e56 = _0x3479dd;
        _0x3479dd = _0x6d213f(_0x2a3ae6, _0x4685e6);
        _0x2a3ae6 = _0xb67cd0;
        _0xb67cd0 = _0x4c2227;
        _0x4c2227 = _0x39b38b;
        _0x39b38b = _0x6d213f(_0x4685e6, _0x3aae96);
      }
      _0x24161b[0] = _0x6d213f(_0x39b38b, _0x24161b[0]);
      _0x24161b[1] = _0x6d213f(_0x4c2227, _0x24161b[1]);
      _0x24161b[2] = _0x6d213f(_0xb67cd0, _0x24161b[2]);
      _0x24161b[3] = _0x6d213f(_0x2a3ae6, _0x24161b[3]);
      _0x24161b[4] = _0x6d213f(_0x3479dd, _0x24161b[4]);
      _0x24161b[5] = _0x6d213f(_0x399e56, _0x24161b[5]);
      _0x24161b[6] = _0x6d213f(_0x4403ff, _0x24161b[6]);
      _0x24161b[7] = _0x6d213f(_0x56140a, _0x24161b[7]);
    }
    var _0x4c12d3;
    return _0x24161b;
  }(function (_0x5f2e40) {
    const _0x555318 = [],
      _0x93290e = (1 << _0x1de236) - 1;
    for (let _0x25d45c = 0; _0x25d45c < _0x5f2e40.length * _0x1de236; _0x25d45c += _0x1de236) {
      _0x555318[_0x25d45c >> 5] |= (_0x5f2e40.charCodeAt(_0x25d45c / _0x1de236) & _0x93290e) << 24 - _0x25d45c % 32;
    }
    return _0x555318;
  }(_0x3a969c = function (_0x22eba3) {
    _0x22eba3 = _0x22eba3.replace(/\r\n/g, "\n");
    let _0x17914c = "";
    for (let _0x3a0d98 = 0; _0x3a0d98 < _0x22eba3.length; _0x3a0d98++) {
      const _0x5062ea = _0x22eba3.charCodeAt(_0x3a0d98);
      _0x5062ea < 128 ? _0x17914c += String.fromCharCode(_0x5062ea) : _0x5062ea > 127 && _0x5062ea < 2048 ? (_0x17914c += String.fromCharCode(_0x5062ea >> 6 | 192), _0x17914c += String.fromCharCode(63 & _0x5062ea | 128)) : (_0x17914c += String.fromCharCode(_0x5062ea >> 12 | 224), _0x17914c += String.fromCharCode(_0x5062ea >> 6 & 63 | 128), _0x17914c += String.fromCharCode(63 & _0x5062ea | 128));
    }
    return _0x17914c;
  }(_0x3a969c)), _0x3a969c.length * _0x1de236));
}
function MD5Encrypt(_0xdf8201) {
  function _0x39978f(_0x4b66de, _0x401151) {
    return _0x4b66de << _0x401151 | _0x4b66de >>> 32 - _0x401151;
  }
  function _0x1a5d98(_0xbd0743, _0x3fa1c6) {
    var _0x344155, _0x42e13f, _0x4ec882, _0x359f03, _0x202f8c;
    _0x4ec882 = 2147483648 & _0xbd0743;
    _0x359f03 = 2147483648 & _0x3fa1c6;
    _0x344155 = 1073741824 & _0xbd0743;
    _0x42e13f = 1073741824 & _0x3fa1c6;
    _0x202f8c = (1073741823 & _0xbd0743) + (1073741823 & _0x3fa1c6);
    return _0x344155 & _0x42e13f ? 2147483648 ^ _0x202f8c ^ _0x4ec882 ^ _0x359f03 : _0x344155 | _0x42e13f ? 1073741824 & _0x202f8c ? 3221225472 ^ _0x202f8c ^ _0x4ec882 ^ _0x359f03 : 1073741824 ^ _0x202f8c ^ _0x4ec882 ^ _0x359f03 : _0x202f8c ^ _0x4ec882 ^ _0x359f03;
  }
  function _0x979311(_0x2bbfa5, _0xb1c634, _0x302998, _0x36996a, _0x5e2807, _0x49cd3a, _0x30ee83) {
    var _0x39d1bf, _0x4fbeec;
    _0x2bbfa5 = _0x1a5d98(_0x2bbfa5, _0x1a5d98(_0x1a5d98((_0x39d1bf = _0xb1c634) & (_0x4fbeec = _0x302998) | ~_0x39d1bf & _0x36996a, _0x5e2807), _0x30ee83));
    return _0x1a5d98(_0x39978f(_0x2bbfa5, _0x49cd3a), _0xb1c634);
  }
  function _0x26550e(_0x53011f, _0x74922d, _0x4559b2, _0x1b0f0e, _0x4601d4, _0x273a90, _0x2bb2a5) {
    var _0x3ede1a, _0x45b6e6, _0x2db808;
    _0x53011f = _0x1a5d98(_0x53011f, _0x1a5d98(_0x1a5d98((_0x3ede1a = _0x74922d, _0x45b6e6 = _0x4559b2, _0x3ede1a & (_0x2db808 = _0x1b0f0e) | _0x45b6e6 & ~_0x2db808), _0x4601d4), _0x2bb2a5));
    return _0x1a5d98(_0x39978f(_0x53011f, _0x273a90), _0x74922d);
  }
  function _0x2655fb(_0x502b84, _0x35ab42, _0x2cebb1, _0x348d6e, _0x55e1ec, _0x1eacc2, _0x472677) {
    var _0x42f998, _0x38a089;
    _0x502b84 = _0x1a5d98(_0x502b84, _0x1a5d98(_0x1a5d98((_0x42f998 = _0x35ab42) ^ (_0x38a089 = _0x2cebb1) ^ _0x348d6e, _0x55e1ec), _0x472677));
    return _0x1a5d98(_0x39978f(_0x502b84, _0x1eacc2), _0x35ab42);
  }
  function _0x2788bd(_0xbbd85b, _0x30b9fd, _0x2090fe, _0x94a655, _0x184229, _0x202622, _0x3f9e0a) {
    var _0x401615, _0x490a82;
    _0xbbd85b = _0x1a5d98(_0xbbd85b, _0x1a5d98(_0x1a5d98((_0x401615 = _0x30b9fd, (_0x490a82 = _0x2090fe) ^ (_0x401615 | ~_0x94a655)), _0x184229), _0x3f9e0a));
    return _0x1a5d98(_0x39978f(_0xbbd85b, _0x202622), _0x30b9fd);
  }
  function _0x25b2b3(_0x2ffc3d) {
    var _0x56e769,
      _0x43f0b7 = "",
      _0x2f1cbb = "";
    for (_0x56e769 = 0; 3 >= _0x56e769; _0x56e769++) {
      _0x43f0b7 += (_0x2f1cbb = "0" + (_0x2ffc3d >>> 8 * _0x56e769 & 255).toString(16)).substr(_0x2f1cbb.length - 2, 2);
    }
    return _0x43f0b7;
  }
  var _0x39ad4c,
    _0x445457,
    _0x4a6b2c,
    _0x831a1f,
    _0x3773db,
    _0x20a458,
    _0x3a685f,
    _0x4855c2,
    _0x49c500,
    _0x55840c = [];
  for (_0x55840c = function (_0x2d21b9) {
    for (var _0x54a3cf, _0x30b6c8 = _0x2d21b9.length, _0x460006 = _0x30b6c8 + 8, _0x3cfbbc = 16 * ((_0x460006 - _0x460006 % 64) / 64 + 1), _0x22e997 = Array(_0x3cfbbc - 1), _0x1ddfea = 0, _0x52017e = 0; _0x30b6c8 > _0x52017e;) {
      _0x54a3cf = (_0x52017e - _0x52017e % 4) / 4;
      _0x1ddfea = _0x52017e % 4 * 8;
      _0x22e997[_0x54a3cf] = _0x22e997[_0x54a3cf] | _0x2d21b9.charCodeAt(_0x52017e) << _0x1ddfea;
      _0x52017e++;
    }
    _0x54a3cf = (_0x52017e - _0x52017e % 4) / 4;
    _0x1ddfea = _0x52017e % 4 * 8;
    _0x22e997[_0x54a3cf] = _0x22e997[_0x54a3cf] | 128 << _0x1ddfea;
    _0x22e997[_0x3cfbbc - 2] = _0x30b6c8 << 3;
    _0x22e997[_0x3cfbbc - 1] = _0x30b6c8 >>> 29;
    return _0x22e997;
  }(_0xdf8201 = function (_0x1069b3) {
    _0x1069b3 = _0x1069b3.replace(/\r\n/g, "\n");
    for (var _0x388587 = "", _0x227de9 = 0; _0x227de9 < _0x1069b3.length; _0x227de9++) {
      var _0xebb9f9 = _0x1069b3.charCodeAt(_0x227de9);
      128 > _0xebb9f9 ? _0x388587 += String.fromCharCode(_0xebb9f9) : _0xebb9f9 > 127 && 2048 > _0xebb9f9 ? (_0x388587 += String.fromCharCode(_0xebb9f9 >> 6 | 192), _0x388587 += String.fromCharCode(63 & _0xebb9f9 | 128)) : (_0x388587 += String.fromCharCode(_0xebb9f9 >> 12 | 224), _0x388587 += String.fromCharCode(_0xebb9f9 >> 6 & 63 | 128), _0x388587 += String.fromCharCode(63 & _0xebb9f9 | 128));
    }
    return _0x388587;
  }(_0xdf8201)), _0x20a458 = 1732584193, _0x3a685f = 4023233417, _0x4855c2 = 2562383102, _0x49c500 = 271733878, _0x39ad4c = 0; _0x39ad4c < _0x55840c.length; _0x39ad4c += 16) {
    _0x445457 = _0x20a458;
    _0x4a6b2c = _0x3a685f;
    _0x831a1f = _0x4855c2;
    _0x3773db = _0x49c500;
    _0x20a458 = _0x979311(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 0], 7, 3614090360);
    _0x49c500 = _0x979311(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 1], 12, 3905402710);
    _0x4855c2 = _0x979311(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 2], 17, 606105819);
    _0x3a685f = _0x979311(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 3], 22, 3250441966);
    _0x20a458 = _0x979311(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 4], 7, 4118548399);
    _0x49c500 = _0x979311(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 5], 12, 1200080426);
    _0x4855c2 = _0x979311(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 6], 17, 2821735955);
    _0x3a685f = _0x979311(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 7], 22, 4249261313);
    _0x20a458 = _0x979311(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 8], 7, 1770035416);
    _0x49c500 = _0x979311(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 9], 12, 2336552879);
    _0x4855c2 = _0x979311(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 10], 17, 4294925233);
    _0x3a685f = _0x979311(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 11], 22, 2304563134);
    _0x20a458 = _0x979311(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 12], 7, 1804603682);
    _0x49c500 = _0x979311(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 13], 12, 4254626195);
    _0x4855c2 = _0x979311(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 14], 17, 2792965006);
    _0x3a685f = _0x979311(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 15], 22, 1236535329);
    _0x20a458 = _0x26550e(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 1], 5, 4129170786);
    _0x49c500 = _0x26550e(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 6], 9, 3225465664);
    _0x4855c2 = _0x26550e(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 11], 14, 643717713);
    _0x3a685f = _0x26550e(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 0], 20, 3921069994);
    _0x20a458 = _0x26550e(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 5], 5, 3593408605);
    _0x49c500 = _0x26550e(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 10], 9, 38016083);
    _0x4855c2 = _0x26550e(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 15], 14, 3634488961);
    _0x3a685f = _0x26550e(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 4], 20, 3889429448);
    _0x20a458 = _0x26550e(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 9], 5, 568446438);
    _0x49c500 = _0x26550e(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 14], 9, 3275163606);
    _0x4855c2 = _0x26550e(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 3], 14, 4107603335);
    _0x3a685f = _0x26550e(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 8], 20, 1163531501);
    _0x20a458 = _0x26550e(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 13], 5, 2850285829);
    _0x49c500 = _0x26550e(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 2], 9, 4243563512);
    _0x4855c2 = _0x26550e(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 7], 14, 1735328473);
    _0x3a685f = _0x26550e(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 12], 20, 2368359562);
    _0x20a458 = _0x2655fb(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 5], 4, 4294588738);
    _0x49c500 = _0x2655fb(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 8], 11, 2272392833);
    _0x4855c2 = _0x2655fb(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 11], 16, 1839030562);
    _0x3a685f = _0x2655fb(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 14], 23, 4259657740);
    _0x20a458 = _0x2655fb(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 1], 4, 2763975236);
    _0x49c500 = _0x2655fb(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 4], 11, 1272893353);
    _0x4855c2 = _0x2655fb(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 7], 16, 4139469664);
    _0x3a685f = _0x2655fb(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 10], 23, 3200236656);
    _0x20a458 = _0x2655fb(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 13], 4, 681279174);
    _0x49c500 = _0x2655fb(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 0], 11, 3936430074);
    _0x4855c2 = _0x2655fb(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 3], 16, 3572445317);
    _0x3a685f = _0x2655fb(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 6], 23, 76029189);
    _0x20a458 = _0x2655fb(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 9], 4, 3654602809);
    _0x49c500 = _0x2655fb(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 12], 11, 3873151461);
    _0x4855c2 = _0x2655fb(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 15], 16, 530742520);
    _0x3a685f = _0x2655fb(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 2], 23, 3299628645);
    _0x20a458 = _0x2788bd(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 0], 6, 4096336452);
    _0x49c500 = _0x2788bd(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 7], 10, 1126891415);
    _0x4855c2 = _0x2788bd(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 14], 15, 2878612391);
    _0x3a685f = _0x2788bd(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 5], 21, 4237533241);
    _0x20a458 = _0x2788bd(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 12], 6, 1700485571);
    _0x49c500 = _0x2788bd(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 3], 10, 2399980690);
    _0x4855c2 = _0x2788bd(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 10], 15, 4293915773);
    _0x3a685f = _0x2788bd(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 1], 21, 2240044497);
    _0x20a458 = _0x2788bd(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 8], 6, 1873313359);
    _0x49c500 = _0x2788bd(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 15], 10, 4264355552);
    _0x4855c2 = _0x2788bd(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 6], 15, 2734768916);
    _0x3a685f = _0x2788bd(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 13], 21, 1309151649);
    _0x20a458 = _0x2788bd(_0x20a458, _0x3a685f, _0x4855c2, _0x49c500, _0x55840c[_0x39ad4c + 4], 6, 4149444226);
    _0x49c500 = _0x2788bd(_0x49c500, _0x20a458, _0x3a685f, _0x4855c2, _0x55840c[_0x39ad4c + 11], 10, 3174756917);
    _0x4855c2 = _0x2788bd(_0x4855c2, _0x49c500, _0x20a458, _0x3a685f, _0x55840c[_0x39ad4c + 2], 15, 718787259);
    _0x3a685f = _0x2788bd(_0x3a685f, _0x4855c2, _0x49c500, _0x20a458, _0x55840c[_0x39ad4c + 9], 21, 3951481745);
    _0x20a458 = _0x1a5d98(_0x20a458, _0x445457);
    _0x3a685f = _0x1a5d98(_0x3a685f, _0x4a6b2c);
    _0x4855c2 = _0x1a5d98(_0x4855c2, _0x831a1f);
    _0x49c500 = _0x1a5d98(_0x49c500, _0x3773db);
  }
  return (_0x25b2b3(_0x20a458) + _0x25b2b3(_0x3a685f) + _0x25b2b3(_0x4855c2) + _0x25b2b3(_0x49c500)).toLowerCase();
}
