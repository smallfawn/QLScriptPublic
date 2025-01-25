/**
 * 爱海盐v2.0
 * 执行时间： 25 10,16 * * *  爱海盐.js
 * const $ = new Env("爱海盐");
 * 注册地址：https://app.tmuyun.com/webChannels/invite?inviteCode=WE8M32&tenantId=60&accountId=649cf8b5c790b0426cda351c
 * ========= 青龙--配置文件 ===========
 * # 爱海盐（配置方式二选一）
 * 方式一：账号密码自动登录("&"符号链接也可以，但不推荐)
 * export ahyCookie='账号#密码'
 * 方式二：抓包协议头里的 X-SESSION-ID 和 X-ACCOUNT-ID
 * （“兼容老版本，如果老版本的配置 【X-ACCOUNT-ID&X-SESSIONID】这种，请增加设置 export ahyCookieOldConfigTranform='true'”）
 * export ahyCookie='sessionId#accountId'
 * 是否启用文章评论开关（注，估计这个操作容易封）
 * export ahyCookieEnabledPostComment="false" // 默认为false，代表关闭文章评论功能，如果需要开启请改为 true 或者 1
 * 是否启用论坛发帖开关（注，估计这个操作容易封）
 * export ahyCookieEnabledForumPost="false" // 默认为false，代表关闭论坛发帖功能，如果需要开启请改为 true 或者 1
 * 文章评论是否使用一言随机返回的名人名句
 * export ahyCookieEnabledPostCommentBy1Y="false" // 默认为false，代表关闭使用一言的随机评论，如果需要开启请改为 true 或者 1
 * 是否强制点赞、分享，不开启相关判断逻辑
 * export ahyCookieForceLikeAndShare="false" // 默认为false，代表关闭根据返回的数据判断是否分享或者点赞，如果就是要尝试分享或者点赞请改为 true 或者 1
 * 多账号用 换行 或 @ 分割
 * ====================================
 * 注： 如果没填邀请码会吃个邀请助力，如果介意，请删除该脚本，谢谢配合
 * ====================================
 * TodoList - 待更新内容：
 * 1. 支持环境变量多账号
 * 2. 支持部分APP的星社区任务
 * 3. 支持自动兑换抢购商品
 * 4. 支持配置不同账号对应不同的UA
 * 5. 支持代理IP
 * ====================================
 */
//Sat Jan 25 2025 08:35:02 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const _0x19bd80 = new _0x3b726d("爱海盐");
_0x43b582();
const _0x1bb6a2 = "ahyCookie",
  _0x571ae9 = require("request"),
  _0x1850b4 = require("fs"),
  _0x33333d = require("form-data"),
  _0x456343 = require("./utils");
let _0x28218c = "",
  _0x50695a = "https://app.tmuyun.com/webChannels/invite?inviteCode=WE8M32&tenantId=60&accountId=649cf8b5c790b0426cda351c",
  _0xc41171 = "幻生提示：有错请在仓库建立issue，说明运行环境：青龙版本、机器是 本地机器、服务器 还是 手机面具模块；附上运行截图，谢谢",
  _0x3c0057 = "请在 配置文件 里添加 " + _0x1bb6a2 + " 变量，具体配置请看脚本最上方说明\n注册地址：" + _0x50695a + "\n投稿？请建Issue 或者 +Q：3385445213";
const _0x4dfcbf = Number.isInteger(_0x19bd80.isNode() ? process.env[_0x1bb6a2 + "enabledNotify"] : _0x19bd80.getdata(_0x1bb6a2 + "EnabledNotify")) || Number.isInteger(_0x19bd80.isNode() ? process.env.enabledNotify : _0x19bd80.getdata("enabledNotify")) || 1;
let _0x319816 = 0,
  _0x4765f8 = ["@", "\n"],
  _0x5314ac = (_0x19bd80.isNode() ? process.env[_0x1bb6a2] : _0x19bd80.getdata(_0x1bb6a2)) || "",
  _0x59493e = ["1", 1, "true"]?.["includes"](_0x19bd80.isNode() ? process.env[_0x1bb6a2 + "EnabledPostComment"] : _0x19bd80.getdata(_0x1bb6a2 + "EnabledPostComment")) || false,
  _0x169d3f = ["1", 1, "true"]?.["includes"](_0x19bd80.isNode() ? process.env[_0x1bb6a2 + "EnabledForumPost"] : _0x19bd80.getdata(_0x1bb6a2 + "EnabledForumPost")) || false,
  _0xca0af9 = ["1", 1, "true"]?.["includes"](_0x19bd80.isNode() ? process.env[_0x1bb6a2 + "EnabledPostCommentBy1Y"] : _0x19bd80.getdata(_0x1bb6a2 + "EnabledPostCommentBy1Y")) || false,
  _0x59baf0 = ["1", 1, "true"]?.["includes"](_0x19bd80.isNode() ? process.env[_0x1bb6a2 + "ForceLikeAndShare"] : _0x19bd80.getdata(_0x1bb6a2 + "ForceLikeAndShare")) || false,
  _0x2be770 = [],
  _0x40b34a = 0,
  _0x5e9c16 = 0,
  _0x4526f6 = "WE8M32",
  _0x145b99 = "10018",
  _0x12d02f = 60,
  _0x56ccf7 = "vapp.tmuyun.com",
  _0x104202 = "请注意：已" + (_0x59493e ? "开启" : "关闭") + " 对文章的评论功能； 已" + (_0x169d3f ? "开启" : "关闭") + " 论坛发帖功能； 已" + (_0xca0af9 ? "开启" : "关闭") + " 一言随机评论功能； 已" + (_0xca0af9 ? "开启" : "关闭") + " 强制点赞/分享功能（强行点不一定能加分）",
  _0xcb6aab = "63777162fe3fc118b09fab89",
  _0x2aed43 = ["赞", "👍", "😄", "111", "支持", "点赞"],
  _0x92d00f = "1.2.2;00000000-62d6-e9e6-0000-0000777fa720;Xiaomi Mi 10;Android;13;Release",
  _0x27f861 = ["63552eddfe3fc1680f583c1c", "6389537dad61a46468debc9e", "638952957d9bcd1b7610a132", "6357999806287f04c3191637", "638db5cd7d9bcd1b7610b120", "63573b5c06287f04c31913bd"],
  _0x51e865 = ["1", 1, "true"]?.["includes"](_0x19bd80.isNode() ? process.env[_0x1bb6a2 + "OldConfigTranform"] : _0x19bd80.getdata(_0x1bb6a2 + "OldConfigTranform")) || false,
  _0x54c9a3 = "",
  _0x3b5a9a = "";
async function _0x61c09e() {
  console.log("\n================== 用户登录 帐号数：[" + _0x2be770?.["length"] + "]==================\n");
  let _0x207d55 = [];
  for (let _0x3a9f14 of _0x2be770) {
    !_0x3a9f14.sessionId ? (_0x3a9f14.loadCache(), !_0x3a9f14.valid ? _0x207d55.push(await _0x3a9f14.login()) : await _0x19bd80.wait(200)) : (_0x207d55.push(await _0x3a9f14.user_info()), await _0x19bd80.wait(200));
  }
  await Promise.all(_0x207d55);
  _0x2be770 = _0x2be770?.["filter"](_0x11e5bf => _0x11e5bf?.["valid"]);
  if (!_0x2be770?.["length"]) {
    console.log("\n无可用账号，停止运行\n");
    return;
  }
  console.log("\n================== 用户信息 帐号数：[" + _0x2be770?.["length"] + "]==================\n");
  _0x207d55 = [];
  for (let _0x2344bf of _0x2be770) {
    _0x207d55.push(await _0x2344bf.task_tasklist("用户信息"));
    await _0x4fc79b(0.2 + Math.random() * 1);
    _0x207d55.push(await _0x2344bf.get_unread_msg());
  }
  await Promise.all(_0x207d55);
  const _0x58cd50 = _0x2be770?.["filter"](_0x55f4fb => _0x55f4fb?.["jobList"]?.["find"](_0x2a85af => _0x2a85af?.["name"]?.["includes"]("签到") && _0x2a85af?.["frequency"] && _0x2a85af?.["frequency"] > _0x2a85af?.["finish_times"]));
  if (_0x58cd50?.["length"]) {
    console.log("\n================== 每日签到任务开始执行 待执行帐号数：[" + _0x58cd50?.["length"] + "]==================\n");
    _0x207d55 = [];
    for (let _0x4e3ad7 of _0x58cd50) {
      _0x207d55.push(await _0x4e3ad7.task_sign("每日签到"));
      await _0x4fc79b(0.2 + Math.random() * 1);
    }
    await Promise.all(_0x207d55);
  } else console.log("\n无签到任务 或 当前帐号都已签到过了，无需执行签到任务\n");
  const _0x2f3e20 = _0x2be770?.["filter"](_0x50db7b => _0x50db7b?.["jobList"]?.["find"](_0x2e791f => {
    return _0x2e791f?.["name"]?.["includes"]("帖子发布") && _0x2e791f?.["frequency"] && _0x2e791f?.["frequency"] > _0x2e791f?.["finish_times"] && _0x169d3f || _0x2e791f?.["name"]?.["includes"]("帖子点赞") && _0x2e791f?.["frequency"] && _0x2e791f?.["frequency"] > _0x2e791f?.["finish_times"];
  }));
  if (_0x2f3e20?.["length"]) {
    {
      console.log("\n================== 社区帖子相关任务开始执行 待执行帐号数：[" + _0x2f3e20?.["length"] + "]==================\n");
      _0x207d55 = [];
      for (let _0xba3aae of _0x2f3e20) {
        _0x207d55.push(await _0xba3aae.task_forum_info("社区帖子列表"));
        await _0x4fc79b(0.2 + Math.random() * 1);
      }
      await Promise.all(_0x207d55);
    }
  } else console.log("\n无社区帖子相关任务 或 当前帐号都已做完了社区帖子任务，无需执行\n");
  await _0x4fc79b(0.2 + Math.random() * 1);
  const _0x3d64bf = _0x2be770?.["filter"](_0x1cc460 => _0x1cc460?.["jobList"]?.["find"](_0x592975 => {
    return _0x592975?.["name"]?.["includes"]("资讯评论") && _0x592975?.["frequency"] > _0x592975?.["finish_times"] && _0x59493e || _0x592975?.["name"]?.["includes"]("分享资讯") && _0x592975?.["frequency"] && _0x592975?.["frequency"] > _0x592975?.["finish_times"] || _0x592975?.["name"]?.["includes"]("资讯点赞") && _0x592975?.["frequency"] && _0x592975?.["frequency"] > _0x592975?.["finish_times"] || _0x592975?.["name"]?.["includes"]("资讯阅读") && _0x592975?.["frequency"] && _0x592975?.["frequency"] > _0x592975?.["finish_times"];
  }));
  if (_0x3d64bf?.["length"]) {
    {
      console.log("\n================== 文章列表相关任务开始执行 待执行帐号数：[" + _0x3d64bf?.["length"] + "]==================\n");
      _0x207d55 = [];
      for (let _0x50657f of _0x3d64bf) {
        console.log("\n开始执行帐号[" + _0x50657f.index + "] 文章任务😄\n");
        _0x207d55.push(await _0x50657f.task_articlelist("文章列表"));
        await _0x4fc79b(0.2 + Math.random() * 1);
      }
      await Promise.all(_0x207d55);
    }
  } else console.log("\n无文章资讯任务 或 当前帐号都已做完了资讯任务，无需执行相关任务\n");
  await _0x4fc79b(0.2 + Math.random() * 1);
  const _0x6585f3 = _0x2be770?.["filter"](_0x84007 => _0x84007?.["jobList"]?.["find"](_0x1a6e78 => {
    return _0x1a6e78?.["name"]?.["includes"]("本地服务") && _0x1a6e78?.["frequency"] && _0x1a6e78?.["frequency"] > _0x1a6e78?.["finish_times"];
  }));
  if (_0x6585f3?.["length"]) {
    console.log("\n================== 本地服务任务开始执行 待执行帐号数：[" + _0x6585f3?.["length"] + "]==================\n");
    _0x207d55 = [];
    for (let _0x5676e9 of _0x6585f3) {
      {
        const _0x5b4298 = _0x5676e9?.["jobList"]?.["find"](_0x471392 => {
          return _0x471392?.["name"]?.["includes"]("本地服务") && _0x471392?.["frequency"] && _0x471392?.["frequency"] > _0x471392?.["finish_times"];
        });
        for (let _0x542daf = 0; _0x542daf < _0x5b4298?.["frequency"] - _0x5b4298?.["finish_times"]; _0x542daf++) {
          _0x207d55.push(await _0x5676e9.task_share("6", undefined, "本地服务"));
          await _0x4fc79b(1 + Math.random() * 1);
        }
      }
    }
    await Promise.all(_0x207d55);
  } else console.log("\n无本地服务任务 或 当前帐号都已做完了本地服务任务，无需执行相关任务\n");
  console.log("\n================== 删除历史评论任务开始执行 待执行帐号数：[" + _0x2be770?.["length"] + "]==================\n");
  for (let _0x5b27a2 of _0x2be770) {
    await _0x5b27a2.get_comment_history();
    await _0x4fc79b(1 + Math.random() * 1);
  }
}
class _0x48e239 {
  ["valid"] = false;
  constructor(_0x5ebb54) {
    this.index = ++_0x40b34a;
    this.accountId = "";
    this.host = _0x56ccf7;
    this.hostname = "https://" + this.host;
    this.key = "FR*r!isE5W";
    const _0x1fc6b2 = _0x27f861,
      _0x217971 = Math.floor(Math.random() * _0x1fc6b2.length);
    this.artlistdata = _0x1fc6b2[_0x217971];
    if (_0x5ebb54?.["length"] === 1) {
      {
        if (_0x5ebb54[0]?.["includes"]("#")) _0x5ebb54 = _0x5ebb54[0]?.["split"]("#");else _0x5ebb54[0]?.["includes"]("&") && (_0x5ebb54 = _0x5ebb54[0]?.["split"]("&"));
      }
    }
    _0x5ebb54[0]?.["length"] === 11 ? (this.account = _0x5ebb54[0], this.password = _0x5ebb54[1]) : _0x51e865 ? (this.sessionId = _0x5ebb54[1], this.accountId = _0x5ebb54[0]) : (this.sessionId = _0x5ebb54[0], this.accountId = _0x5ebb54[1]);
  }
  ["loadCache"]() {
    let _0x52a661 = _0x5d8d09(_0x1bb6a2 + "_config", this.account);
    if (_0x52a661) {
      _0x52a661 = JSON.parse(_0x52a661);
      console.log("账号[" + this.index + "]从缓存读取成功 😄 ，其ID为： " + _0x52a661?.["id"] + "，手机号为：" + this.account);
      this.accountId = _0x52a661?.["id"];
      this.sessionId = _0x52a661?.["sessionId"];
      this.valid = true;
      return;
    }
  }
  async ["txt_api"]() {
    try {
      let _0x1754c8 = {
          "method": "GET",
          "url": "https://v1.hitokoto.cn/",
          "qs": {
            "c": "d"
          },
          "headers": {
            "content-type": "multipart/form-data; boundary=---011000010111000001101001"
          },
          "formData": {}
        },
        _0x48b53e = await _0x1ee6f7(_0x1754c8, "");
      if (_0x48b53e.id) return _0x48b53e.hitokoto;else {}
    } catch (_0x40c222) {
      console.log(_0x40c222);
    }
  }
  async ["task_tasklist"](_0x34f3ad) {
    let _0x29ded9 = "/api/user_mumber/numberCenter",
      _0x3caf0e = _0x456343.guid(),
      _0x5dfb60 = _0x456343.ts13(),
      _0x15efa8 = _0x29ded9 + "&&" + this.sessionId + "&&" + _0x3caf0e + "&&" + _0x5dfb60 + "&&" + this.key + "&&" + _0x12d02f,
      _0x2f4329 = _0x456343.SHA256_Encrypt(_0x15efa8);
    try {
      {
        let _0x16e5b6 = {
            "method": "GET",
            "url": "" + this.hostname + _0x29ded9 + "?is_new=1",
            "headers": {
              "X-SESSION-ID": "" + this.sessionId,
              "X-REQUEST-ID": _0x3caf0e,
              "X-TIMESTAMP": _0x5dfb60,
              "X-SIGNATURE": _0x2f4329,
              "X-TENANT-ID": _0x12d02f,
              "User-Agent": _0x92d00f,
              "Cache-Control": "no-cache",
              "Host": this.host,
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            }
          },
          _0x47b858 = await _0x1ee6f7(_0x16e5b6, _0x34f3ad);
        if (_0x47b858.code == 0) {
          !this.requestedUserInfo && (await this.user_info(), await _0x4fc79b(0.3));
          _0x32cb38("账号[" + this.index + "],欢迎用户:[" + _0x47b858.data.rst.nick_name + "],当前积分为[" + _0x47b858.data.rst.total_integral + "]");
          _0x54c9a3 += "账号[" + this.index + "],欢迎用户:[" + _0x47b858.data.rst.nick_name + "],当前积分为[" + _0x47b858.data.rst.total_integral + "]\n";
          await _0x4fc79b(0.3);
          this.jobList = _0x47b858.data.rst.user_task_list?.["map"](_0x4b629d => {
            return {
              "name": _0x4b629d?.["name"],
              "finish_times": Number(_0x4b629d?.["finish_times"]),
              "frequency": Number(_0x4b629d?.["frequency"]),
              "integral": _0x4b629d?.["integral"],
              "member_task_type": _0x4b629d?.["member_task_type"]
            };
          });
          if (_0x47b858?.["data"]?.["daily_sign_info"]?.["name"]?.["includes"]("签到")) {
            {
              let _0xa8d424 = _0x47b858?.["data"]?.["daily_sign_info"]?.["daily_sign_list"]?.["find"](_0x439232 => _0x439232?.["current"])?.["signed"];
              this.jobList.push({
                "name": "每日签到",
                "finish_times": _0xa8d424 ? 1 : 0,
                "frequency": 1
              });
            }
          }
          _0x32cb38("账号[" + this.index + "],获取任务列表成功 😄 :");
          await _0x4fc79b(0.3);
          let _0x1aa033 = "";
          await _0x4fc79b(0.2 + Math.random() * 1);
          for (let _0x61b693 = 0; _0x61b693 < this.jobList.length; _0x61b693++) {
            _0x1aa033 += this.jobList[_0x61b693].name + "[" + this.jobList[_0x61b693].finish_times + "/" + this.jobList[_0x61b693].frequency + "]\n";
          }
          await _0x4fc79b(0.3);
          _0x32cb38(_0x1aa033);
        } else _0x32cb38("账号[" + this.index + "],获取任务列表:失败 🙁 了呢,原因：" + _0x47b858?.["message"]), console.log(_0x47b858);
      }
    } catch (_0x5bac46) {
      console.log(_0x5bac46);
    }
  }
  async ["activity_login"](_0x56b115) {
    try {
      let _0x99ca4d = {
          "method": "POST",
          "url": "http://api.576tv.com/AppActive/Public/setAppLogin",
          "headers": {
            "Accept": " */*",
            "Origin": " http://api.576tv.com",
            "X-Requested-With": " XMLHttpRequest",
            "User-Agent": " Mozilla/5.0 (Linux; Android 9; PBBM00 Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/70.0.3538.110 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;5.3.1;native_app",
            "Content-Type": " application/x-www-form-urlencoded; charset=UTF-8"
          },
          "body": "uuid=tzmxc&cookie=0&accountId=" + this.accountId + "&sessionId=" + this.sessionId
        },
        _0x3d60b7 = await _0x1ee6f7(_0x99ca4d, _0x56b115, true),
        _0x2293a1 = _0x3d60b7?.["body"];
      _0x2293a1.status == 1 ? (this.authCookie = _0x3d60b7?.["rawHeaders"]?.["filter"](_0x1b4907 => _0x1b4907?.["includes"]("path=/"))?.["join"](";"), _0x32cb38("账号[" + this.index + "],授权活动成功 😄"), await this.activity_vote("投票")) : _0x32cb38("账号[" + this.index + "],授权活动:失败 🙁 了呢,原因：" + JSON.stringify(_0x2293a1));
    } catch (_0x5327d0) {
      console.log(_0x5327d0);
    }
  }
  async ["activity_vote"](_0xfd79eb) {
    try {
      let _0x8f53bf = {
          "method": "POST",
          "url": "http://api.576tv.com/AppActive/Vote/postVote",
          "headers": {
            "Accept": " */*",
            "Origin": " http://api.576tv.com",
            "X-Requested-With": " XMLHttpRequest",
            "User-Agent": " Mozilla/5.0 (Linux; Android 9; PBBM00 Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/70.0.3538.110 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;5.3.1;native_app",
            "Content-Type": " application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": this.authCookie
          },
          "body": "uuid=tzmxc&voteids=10461%2C10455%2C10476%2C10448%2C10456"
        },
        _0x4114b4 = await _0x1ee6f7(_0x8f53bf, _0xfd79eb);
      _0x4114b4.status == 1 ? (_0x32cb38("账号[" + this.index + "],投票成功 😄"), await this.activity_draw("抽奖")) : (_0x32cb38("账号[" + this.index + "],投票:失败 🙁 了呢,原因：" + _0x4114b4?.["info"]), await this.activity_get_prize("读取奖品"));
    } catch (_0xc52a7b) {
      console.log(_0xc52a7b);
    }
  }
  async ["activity_draw"](_0x277758) {
    try {
      let _0x3054d1 = {
          "method": "POST",
          "url": "http://api.576tv.com/AppActive/Prize/start",
          "headers": {
            "Accept": " */*",
            "Origin": " http://api.576tv.com",
            "X-Requested-With": " XMLHttpRequest",
            "User-Agent": " Mozilla/5.0 (Linux; Android 9; PBBM00 Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/70.0.3538.110 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;5.3.1;native_app",
            "Content-Type": " application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": this.authCookie
          },
          "body": "uuid=tzmxc"
        },
        _0x295acc = await _0x1ee6f7(_0x3054d1, _0x277758);
      _0x295acc.status == 1 ? _0x32cb38("账号[" + this.index + "],抽奖成功 😄：" + JSON.stringify(_0x295acc)) : _0x32cb38("账号[" + this.index + "],抽奖失败 🙁 了呢,原因：" + _0x295acc?.["info"]);
      await this.activity_get_prize("读取奖品");
    } catch (_0x11306e) {
      console.log(_0x11306e);
    }
  }
  async ["activity_get_prize"](_0x461797) {
    try {
      let _0x49b60a = {
          "method": "POST",
          "url": "http://api.576tv.com/AppActive/Prize/getPrize",
          "headers": {
            "Accept": " */*",
            "Origin": " http://api.576tv.com",
            "X-Requested-With": " XMLHttpRequest",
            "User-Agent": " Mozilla/5.0 (Linux; Android 9; PBBM00 Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/70.0.3538.110 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;5.3.1;native_app",
            "Content-Type": " application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": this.authCookie
          },
          "body": "uuid=tzmxc"
        },
        _0x34c36f = await _0x1ee6f7(_0x49b60a, _0x461797);
      if (_0x34c36f.status == 1) {
        let _0x44eb2d = "";
        for (let _0x1394d1 = 0; _0x1394d1 < _0x34c36f?.["data"]?.["length"]; _0x1394d1++) {
          {
            const _0x2b9a7e = _0x34c36f?.["data"][_0x1394d1];
            _0x44eb2d += "\n奖品名称：" + _0x2b9a7e?.["title"] + "----" + (_0x2b9a7e?.["url"] || _0x2b9a7e?.["time"]) + "----" + (_0x2b9a7e?.["valid"] === "1" ? "未领取" : "已领取") + "----全部信息：" + JSON.stringify(_0x2b9a7e);
          }
        }
        _0x32cb38("账号[" + this.index + "],读取奖品成功 😄：" + (_0x44eb2d || JSON.stringify(_0x34c36f?.["data"])));
      } else _0x32cb38("账号[" + this.index + "],读取中奖记录失败 🙁 了呢,原因：" + _0x34c36f?.["info"]);
    } catch (_0x2bfd91) {
      console.log(_0x2bfd91);
    }
  }
  async ["task_sign"](_0x1ace01) {
    let _0x49cb19 = "/api/user_mumber/sign",
      _0x2ff413 = _0x456343.guid(),
      _0x46e1f9 = _0x456343.ts13(),
      _0x3b6dbc = _0x49cb19 + "&&" + this.sessionId + "&&" + _0x2ff413 + "&&" + _0x46e1f9 + "&&" + this.key + "&&" + _0x12d02f,
      _0xc89b = _0x456343.SHA256_Encrypt(_0x3b6dbc);
    try {
      let _0x5d8fa3 = {
          "method": "GET",
          "url": "" + this.hostname + _0x49cb19,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x2ff413,
            "X-TIMESTAMP": _0x46e1f9,
            "X-SIGNATURE": _0xc89b,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x312bce = await _0x1ee6f7(_0x5d8fa3, _0x1ace01);
      _0x312bce.code == 0 ? _0x32cb38("账号[" + this.index + "],签到成功 😄 [" + _0x312bce.data.signCommonInfo.date + "],获得积分:[" + _0x312bce.data.signExperience + "]") : (_0x32cb38("账号[" + this.index + "],签到:失败 🙁 了呢,原因：" + _0x312bce?.["message"]), console.log(_0x312bce));
    } catch (_0x11cd93) {
      console.log(_0x11cd93);
    }
  }
  async ["task_forum_info"](_0x3091e8) {
    let _0x4fe906 = "/api/forum/forum_list",
      _0x3b3175 = _0x456343.guid(),
      _0x36a7af = _0x456343.ts13(),
      _0x465095 = _0x4fe906 + "&&" + this.sessionId + "&&" + _0x3b3175 + "&&" + _0x36a7af + "&&" + this.key + "&&" + _0x12d02f,
      _0x129508 = _0x456343.SHA256_Encrypt(_0x465095);
    try {
      let _0x1a4a0d = {
          "method": "GET",
          "url": "" + this.hostname + _0x4fe906 + ("?tenantId=" + _0x12d02f),
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x3b3175,
            "X-TIMESTAMP": _0x36a7af,
            "X-SIGNATURE": _0x129508,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x47681c = await _0x1ee6f7(_0x1a4a0d, _0x3091e8);
      if (_0x47681c.code == 0) {
        {
          const _0x21c321 = _0x47681c?.["data"]?.["forum_list"]?.["length"] ? _0x47681c?.["data"]?.["forum_list"][0]?.["id"] : undefined;
          _0x21c321 ? (_0x32cb38("账号[" + this.index + "],获取社区信息成功 😄 ，准备开始获取相关列表"), await this.task_forum_list(_0x21c321)) : _0x32cb38("账号[" + this.index + "],获取社区为空 🙁 ，跳过社区任务");
        }
      } else _0x32cb38("账号[" + this.index + "],获取社区信息:失败 🙁 了呢,原因：" + _0x47681c?.["message"]), console.log(_0x47681c);
    } catch (_0x34d05f) {
      console.log(_0x34d05f);
    }
  }
  async ["task_forum_list"](_0x98e570) {
    let _0x11fd1f = "/api/forum/thread_list",
      _0x85cb74 = _0x456343.guid(),
      _0x6b0289 = _0x456343.ts13(),
      _0x108d28 = _0x11fd1f + "&&" + this.sessionId + "&&" + _0x85cb74 + "&&" + _0x6b0289 + "&&" + this.key + "&&" + _0x12d02f,
      _0x127bbc = _0x456343.SHA256_Encrypt(_0x108d28);
    try {
      let _0x302e8f = {
          "method": "GET",
          "url": "" + this.hostname + _0x11fd1f + ("?forum_id=" + _0x98e570),
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x85cb74,
            "X-TIMESTAMP": _0x6b0289,
            "X-SIGNATURE": _0x127bbc,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x555d1f = await _0x1ee6f7(_0x302e8f, "获取帖子");
      if (_0x555d1f.code == 0) for (let _0x34a150 = 0; _0x34a150 < _0x555d1f.data.thread_list?.["length"]; _0x34a150++) {
        if (!this?.["jobList"]?.["find"](_0x2b149f => {
          return _0x2b149f?.["name"]?.["includes"]("帖子发布") && _0x2b149f?.["frequency"] > _0x2b149f?.["finish_times"] && _0x169d3f || _0x2b149f?.["name"]?.["includes"]("帖子点赞") && _0x2b149f?.["frequency"] > _0x2b149f?.["finish_times"];
        })) {
          {
            _0x32cb38("账号[" + this.index + "],社区任务已完成，跳过-----");
            break;
          }
        }
        _0x32cb38("账号[" + this.index + "],对帖子[" + _0x555d1f.data.thread_list[_0x34a150].id + "]操作-----");
        await _0x4fc79b(0.3 + Math.random() * 1);
        if (this?.["jobList"]?.["find"](_0xe0348e => {
          return _0xe0348e?.["name"]?.["includes"]("帖子点赞") && _0xe0348e?.["frequency"] > _0xe0348e?.["finish_times"];
        })) {
          if (_0x555d1f.data.thread_list[_0x34a150].already_liked) _0x32cb38("账号[" + this.index + "],之前已经对帖子[" + _0x555d1f.data.thread_list[_0x34a150].id + "]点赞过，不能再次点赞");else {
            await this.task_forum_like(_0x555d1f.data.thread_list[_0x34a150].id);
          }
          await _0x4fc79b(1 + Math.random() * 1);
        } else _0x32cb38("账号[" + this.index + "],无需对帖子点赞");
        if (this?.["jobList"]?.["find"](_0x592e6e => {
          return _0x592e6e?.["name"]?.["includes"]("帖子发布") && _0x592e6e?.["frequency"] > _0x592e6e?.["finish_times"] && _0x169d3f;
        })) {
          await this.task_forum_post(_0x98e570);
          await _0x4fc79b(1 + Math.random() * 1);
        } else _0x32cb38("账号[" + this.index + "],无需发布帖子，可能是 已执行完毕该任务，或者 未开启该任务");
      } else {
        _0x32cb38("账号[" + this.index + "],获取社区帖子:失败 🙁 了呢,原因：" + _0x555d1f?.["message"]);
        console.log(_0x555d1f);
      }
    } catch (_0x248ddf) {
      console.log(_0x248ddf);
    }
  }
  async ["task_forum_like"](_0x356737) {
    let _0x49ed1b = "/api/forum/like",
      _0x13d469 = _0x456343.guid(),
      _0x31a0d6 = _0x456343.ts13(),
      _0x51176a = _0x49ed1b + "&&" + this.sessionId + "&&" + _0x13d469 + "&&" + _0x31a0d6 + "&&" + this.key + "&&" + _0x12d02f,
      _0x343f60 = _0x456343.SHA256_Encrypt(_0x51176a);
    try {
      let _0x13034b = _0x33333d();
      _0x13034b.append("target_type", "1");
      _0x13034b.append("target_id", _0x356737);
      let _0xcc800f = {
        "method": "POST",
        "url": "" + this.hostname + _0x49ed1b,
        "headers": {
          "X-SESSION-ID": "" + this.sessionId,
          "X-REQUEST-ID": _0x13d469,
          "X-TIMESTAMP": _0x31a0d6,
          "X-SIGNATURE": _0x343f60,
          "X-TENANT-ID": _0x12d02f,
          "User-Agent": _0x92d00f,
          "Cache-Control": "no-cache",
          "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryTDSOjpwy3A5ypRAo",
          "Host": this.host,
          "Connection": "Keep-Alive",
          "Accept": "*/*",
          "X-ACCOUNT-ID": this.accountId
        },
        "body": _0x13034b
      };
      _0xcc800f.headers["Content-Type"] = "multipart/form-data; boundary=" + _0x13034b.getBoundary();
      let _0x31ee88 = await _0x1ee6f7(_0xcc800f, "点赞帖子");
      if (_0x31ee88.code == 0) {
        {
          const _0x39a9cb = this?.["jobList"]?.["find"](_0x24fc93 => {
            return _0x24fc93?.["name"]?.["includes"]("帖子点赞") && _0x24fc93?.["frequency"] > _0x24fc93?.["finish_times"];
          });
          _0x39a9cb.finish_times++;
          _0x32cb38("账号[" + this.index + "],点赞帖子成功 😄 :[" + _0x356737 + "]");
        }
      } else {
        _0x32cb38("账号[" + this.index + "],点赞帖子:失败 🙁 了呢,原因：" + _0x31ee88?.["message"]);
        console.log(_0x31ee88);
      }
    } catch (_0x177478) {
      console.log(_0x177478);
    }
  }
  async ["task_forum_post"](_0x4bd577) {
    let _0x181ac4 = "/api/forum/post_thread",
      _0x3b86be = _0x456343.guid(),
      _0x38649f = _0x456343.ts13(),
      _0x52a06b = _0x181ac4 + "&&" + this.sessionId + "&&" + _0x3b86be + "&&" + _0x38649f + "&&" + this.key + "&&" + _0x12d02f,
      _0x5a82ca = _0x456343.SHA256_Encrypt(_0x52a06b);
    try {
      let _0x4db204 = _0x33333d();
      _0x4db204.append("forum_id", _0x4bd577);
      _0x4db204.append("title", "签到");
      _0x4db204.append("content", "今日打卡");
      _0x4db204.append("attachments", "");
      _0x4db204.append("location_name", "{}");
      let _0x5f1559 = {
        "method": "POST",
        "url": "" + this.hostname + _0x181ac4,
        "headers": {
          "X-SESSION-ID": "" + this.sessionId,
          "X-REQUEST-ID": _0x3b86be,
          "X-TIMESTAMP": _0x38649f,
          "X-SIGNATURE": _0x5a82ca,
          "X-TENANT-ID": _0x12d02f,
          "User-Agent": _0x92d00f,
          "Cache-Control": "no-cache",
          "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryMdIuuLGEa01BfEzM",
          "Host": this.host,
          "Connection": "Keep-Alive",
          "Accept": "*/*",
          "X-ACCOUNT-ID": this.accountId
        },
        "body": _0x4db204
      };
      _0x5f1559.headers["Content-Type"] = "multipart/form-data; boundary=" + _0x4db204.getBoundary();
      let _0x406a2f = await _0x1ee6f7(_0x5f1559, "发布帖子");
      if (_0x406a2f.code == 0) {
        const _0x81ea73 = this?.["jobList"]?.["find"](_0x186f92 => {
          return _0x186f92?.["name"]?.["includes"]("帖子发布") && _0x186f92?.["frequency"] > _0x186f92?.["finish_times"];
        });
        _0x81ea73.finish_times++;
        _0x32cb38("账号[" + this.index + "],发布帖子成功 😄 :[" + _0x4bd577 + "]");
        await this.deleteForumPost(_0x406a2f?.["data"]?.["thread_id"]);
      } else _0x32cb38("账号[" + this.index + "],发布帖子:失败 🙁 了呢,原因：" + _0x406a2f?.["message"]), console.log(_0x406a2f);
    } catch (_0x24c4f0) {
      console.log(_0x24c4f0);
    }
  }
  async ["deleteForumPost"](_0x1cdbef) {
    let _0x5648a8 = "/api/forum/delete_thread",
      _0xee4987 = _0x456343.guid(),
      _0x2b1f12 = _0x456343.ts13(),
      _0x352c06 = _0x5648a8 + "&&" + this.sessionId + "&&" + _0xee4987 + "&&" + _0x2b1f12 + "&&" + this.key + "&&" + _0x12d02f,
      _0xcd8292 = _0x456343.SHA256_Encrypt(_0x352c06);
    try {
      {
        let _0x1cadf8 = _0x33333d();
        _0x1cadf8.append("thread_id", _0x1cdbef);
        let _0x503932 = {
          "method": "POST",
          "url": "" + this.hostname + _0x5648a8,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0xee4987,
            "X-TIMESTAMP": _0x2b1f12,
            "X-SIGNATURE": _0xcd8292,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryi1cQvxsAzoTagcpx",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "Accept": "*/*",
            "X-ACCOUNT-ID": this.accountId
          },
          "body": _0x1cadf8
        };
        _0x503932.headers["Content-Type"] = "multipart/form-data; boundary=" + _0x1cadf8.getBoundary();
        let _0x183d25 = await _0x1ee6f7(_0x503932, "删除帖子");
        _0x183d25.code == 0 ? _0x32cb38("账号[" + this.index + "],删除帖子成功 😄 :[" + _0x1cdbef + "]") : (_0x32cb38("账号[" + this.index + "],删除帖子:失败 🙁 了呢,原因：" + _0x183d25?.["message"]), console.log(_0x183d25));
      }
    } catch (_0x45c8fc) {
      console.log(_0x45c8fc);
    }
  }
  async ["task_articlelist"](_0x48de09) {
    let _0x30fa27 = "/api/article/channel_list",
      _0x3ff64f = _0x456343.guid(),
      _0x3fc6be = _0x456343.ts13(),
      _0x477321 = _0x30fa27 + "&&" + this.sessionId + "&&" + _0x3ff64f + "&&" + _0x3fc6be + "&&" + this.key + "&&" + _0x12d02f,
      _0xc2649c = _0x456343.SHA256_Encrypt(_0x477321);
    try {
      let _0x175cb1 = {
          "method": "GET",
          "url": "" + this.hostname + _0x30fa27 + ("?channel_id=" + this.artlistdata + "&isDiangHao=false&is_new=" + (Math.random() >= 0.5) + "&list_count=" + Math.floor(Math.random() * 10) + "&size=10"),
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x3ff64f,
            "X-TIMESTAMP": _0x3fc6be,
            "X-SIGNATURE": _0xc2649c,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x1b3fae = await _0x1ee6f7(_0x175cb1, _0x48de09);
      if (_0x1b3fae.code == 0) {
        let _0x262a79 = false;
        for (let _0x225218 = 0; _0x225218 < _0x1b3fae.data.article_list?.["length"]; _0x225218++) {
          if (!this?.["jobList"]?.["find"](_0x12dcea => {
            return _0x12dcea?.["name"]?.["includes"]("资讯评论") && _0x12dcea?.["frequency"] > _0x12dcea?.["finish_times"] && _0x59493e || _0x12dcea?.["name"]?.["includes"]("分享资讯") && _0x12dcea?.["frequency"] > _0x12dcea?.["finish_times"] || _0x12dcea?.["name"]?.["includes"]("资讯点赞") && _0x12dcea?.["frequency"] > _0x12dcea?.["finish_times"] || _0x12dcea?.["name"]?.["includes"]("资讯阅读") && _0x12dcea?.["frequency"] > _0x12dcea?.["finish_times"];
          })) {
            _0x32cb38("账号[" + this.index + "],文章任务已完成，跳过后续文章-----");
            break;
          }
          await this.task_comment_pre();
          await _0x4fc79b(1 + Math.random() * 1);
          _0x32cb38("账号[" + this.index + "],对 第" + (_0x225218 + 1) + "篇 文章[" + _0x1b3fae.data.article_list[_0x225218].id + "]操作-----");
          let _0x3d8854 = _0x1b3fae.data.article_list[_0x225218].id;
          await this.task_read(_0x3d8854);
          await _0x4fc79b(1 + Math.random() * 1);
          if (this?.["jobList"]?.["find"](_0x373278 => {
            return _0x373278?.["name"]?.["includes"]("资讯点赞") && _0x373278?.["frequency"] > _0x373278?.["finish_times"];
          })) {
            {
              if (_0x1b3fae.data.article_list[_0x225218].liked) _0x32cb38("账号[" + this.index + "],之前已经对资讯[" + _0x3d8854 + "]点赞过，不能再次点赞");else !_0x1b3fae.data.article_list[_0x225218].like_enabled && !_0x59baf0 ? _0x32cb38("账号[" + this.index + "],资讯[" + _0x3d8854 + "]未开启点赞功能，无法进行点赞") : await this.task_like(_0x3d8854);
              await _0x4fc79b(1 + Math.random() * 1);
            }
          }
          if (!_0x262a79) {
            if (_0x59493e && !this.commentError && this?.["jobList"]?.["find"](_0x1acf71 => {
              return _0x1acf71?.["name"]?.["includes"]("资讯评论") && _0x1acf71?.["frequency"] > _0x1acf71?.["finish_times"];
            })) await this.task_comment(_0x3d8854), await _0x4fc79b(2 + Math.random() * 1);else {
              this.commentError && (_0x32cb38("账号[" + this.index + "],评论文章遇见了一些问题 🙁 ，暂无解决方法，即将跳过后续评论，如果您有解决方法，欢迎提供，错误信息：该篇新闻不支持评论【评论失败，请重新进入当前页面！】"), _0x262a79 = true);
            }
          } else {
            {
              if (!this?.["jobList"]?.["find"](_0x599bd7 => {
                return _0x599bd7?.["name"]?.["includes"]("分享资讯") && _0x599bd7?.["frequency"] > _0x599bd7?.["finish_times"] || _0x599bd7?.["name"]?.["includes"]("资讯点赞") && _0x599bd7?.["frequency"] > _0x599bd7?.["finish_times"] || _0x599bd7?.["name"]?.["includes"]("资讯阅读") && _0x599bd7?.["frequency"] > _0x599bd7?.["finish_times"];
              })) break;
            }
          }
          this?.["jobList"]?.["find"](_0x4999a2 => {
            return _0x4999a2?.["name"]?.["includes"]("分享资讯") && _0x4999a2?.["frequency"] > _0x4999a2?.["finish_times"];
          }) && (!_0x1b3fae.data.article_list[_0x225218].share_enabled && !_0x59baf0 ? _0x32cb38("账号[" + this.index + "],文章[" + _0x3d8854 + "]未开启分享功能，无法进行分享") : await this.task_share("3", _0x3d8854, "分享"));
        }
      } else _0x32cb38("账号[" + this.index + "],获取文章:失败 🙁 了呢,原因：" + _0x1b3fae?.["message"]), console.log(_0x1b3fae);
    } catch (_0x594a1e) {
      console.log(_0x594a1e);
    }
  }
  async ["get_comment_history"](_0x5434dd) {
    let _0x632c8e = "/api/account_comment/comment_list",
      _0x221786 = _0x456343.guid(),
      _0x1eec6e = _0x456343.ts13(),
      _0x5c8781 = _0x632c8e + "&&" + this.sessionId + "&&" + _0x221786 + "&&" + _0x1eec6e + "&&" + this.key + "&&" + _0x12d02f,
      _0x395c5f = _0x456343.SHA256_Encrypt(_0x5c8781);
    try {
      let _0x1ef7ec = {
          "method": "GET",
          "url": "" + this.hostname + _0x632c8e + "?size=999",
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x221786,
            "X-TIMESTAMP": _0x1eec6e,
            "X-SIGNATURE": _0x395c5f,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x45e624 = await _0x1ee6f7(_0x1ef7ec, _0x5434dd);
      if (_0x45e624.code == 0) {
        let _0x5a5594 = _0x45e624.data.comment_list?.["length"];
        for (let _0x5d6086 = 0; _0x5d6086 < _0x45e624.data.comment_list?.["length"]; _0x5d6086++) {
          _0x32cb38("账号[" + this.index + "],对 第" + (_0x5d6086 + 1) + "个 评论[" + _0x45e624.data.comment_list[_0x5d6086].id + "]删除，删除总数量：" + _0x45e624.data.comment_list?.["length"] + "，待删除：" + _0x5a5594 + " 条-----");
          let _0x3935e3 = _0x45e624.data.comment_list[_0x5d6086].id;
          await this.deleteComment(_0x3935e3);
          _0x5a5594--;
          await _0x4fc79b(1 + Math.random() * 1);
        }
      } else _0x32cb38("账号[" + this.index + "],删除评论:失败 🙁 了呢,原因：" + _0x45e624?.["message"]), console.log(_0x45e624);
    } catch (_0x20fe45) {
      console.log(_0x20fe45);
    }
  }
  async ["task_read"](_0x48eae8) {
    let _0x4df33a = "/api/article/detail",
      _0xe2c4fc = _0x456343.guid(),
      _0x7c94b8 = _0x456343.ts13(),
      _0x26ee2a = _0x4df33a + "&&" + this.sessionId + "&&" + _0xe2c4fc + "&&" + _0x7c94b8 + "&&" + this.key + "&&" + _0x12d02f,
      _0x158023 = _0x456343.SHA256_Encrypt(_0x26ee2a);
    try {
      let _0x400693 = {
          "method": "GET",
          "url": "" + this.hostname + _0x4df33a + "?id=" + _0x48eae8,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0xe2c4fc,
            "X-TIMESTAMP": _0x7c94b8,
            "X-SIGNATURE": _0x158023,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0xcb1257 = await _0x1ee6f7(_0x400693, "阅读文章");
      if (_0xcb1257.code == 0) {
        const _0x3b71ed = this?.["jobList"]?.["find"](_0x4b1e8c => {
          return _0x4b1e8c?.["name"]?.["includes"]("资讯阅读") && _0x4b1e8c?.["frequency"] > _0x4b1e8c?.["finish_times"];
        });
        _0x3b71ed && _0x3b71ed.finish_times++;
        _0x32cb38("账号[" + this.index + "],阅读文章成功 😄 :[" + _0xcb1257.data.article.id + "]");
      } else _0x32cb38("账号[" + this.index + "],阅读文章:失败 🙁 了呢,原因：" + _0xcb1257?.["message"]);
    } catch (_0x5381fc) {
      console.log(_0x5381fc);
    }
  }
  async ["task_like"](_0x5b4d90) {
    let _0x4b7d87 = "/api/favorite/like",
      _0x46aba2 = _0x456343.guid(),
      _0xe70a79 = _0x456343.ts13(),
      _0x2105de = _0x4b7d87 + "&&" + this.sessionId + "&&" + _0x46aba2 + "&&" + _0xe70a79 + "&&" + this.key + "&&" + _0x12d02f,
      _0x2fe6d8 = _0x456343.SHA256_Encrypt(_0x2105de);
    try {
      let _0x10f0d8 = {
          "method": "POST",
          "url": "" + this.hostname + _0x4b7d87,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x46aba2,
            "X-TIMESTAMP": _0xe70a79,
            "X-SIGNATURE": _0x2fe6d8,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          },
          "form": {
            "action": "true",
            "id": _0x5b4d90
          }
        },
        _0x1fd3c0 = await _0x1ee6f7(_0x10f0d8, "点赞文章");
      if (_0x1fd3c0.code == 0) {
        const _0x3aa7af = this?.["jobList"]?.["find"](_0x4da081 => {
          return _0x4da081?.["name"]?.["includes"]("资讯点赞") && _0x4da081?.["frequency"] > _0x4da081?.["finish_times"];
        });
        _0x3aa7af.finish_times++;
        _0x32cb38("账号[" + this.index + "],点赞文章成功 😄 :[" + _0x5b4d90 + "]");
      } else _0x32cb38("账号[" + this.index + "],用户查询:失败 🙁 了呢,原因：" + _0x1fd3c0?.["message"]), console.log(_0x1fd3c0);
    } catch (_0x5f1bcb) {
      console.log(_0x5f1bcb);
    }
  }
  async ["RSA_Encrypt"](_0x4d1546) {
    const _0xa30663 = "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD6XO7e9YeAOs+cFqwa7ETJ+WXizPqQeXv68i5vqw9pFREsrqiBTRcg7wB0RIp3rJkDpaeVJLsZqYm5TW7FWx/iOiXFc+zCPvaKZric2dXCw27EvlH5rq+zwIPDAJHGAfnn1nmQH7wR3PCatEIb8pz5GFlTHMlluw4ZYmnOwg+thwIDAQAB\n-----END PUBLIC KEY-----",
      _0x34b89f = _0x456343.RSA_Encrypt(_0x4d1546, _0xa30663);
    return _0x34b89f;
  }
  async ["loginByCode"](_0xa25e08, _0x4a190e) {
    try {
      let _0x2395e0 = "/api/zbtxz/login",
        _0xa31a3d = _0x456343.guid(),
        _0x1e4f9f = _0x456343.ts13(),
        _0x42c430 = _0x2395e0 + "&&" + (this.sessionId || _0xa25e08) + "&&" + _0xa31a3d + "&&" + _0x1e4f9f + "&&" + this.key + "&&" + _0x12d02f,
        _0x2599c2 = _0x456343.SHA256_Encrypt(_0x42c430),
        _0x2af174 = {
          "method": "POST",
          "url": "" + this.hostname + _0x2395e0,
          "headers": {
            "X-SESSION-ID": "" + (this.sessionId || _0xa25e08),
            "X-REQUEST-ID": _0xa31a3d,
            "X-TIMESTAMP": _0x1e4f9f,
            "X-SIGNATURE": _0x2599c2,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive"
          },
          "form": "code=" + _0x4a190e
        },
        _0x2000be = await _0x1ee6f7(_0x2af174, "取Token");
      if (_0x2000be.code == 0) {
        {
          this.valid = true;
          this.sessionId = _0x2000be.data.session.id;
          this.accountId = _0x2000be.data.session.account || _0x2000be.data.session.account_id;
          _0x53aed0(_0x1bb6a2 + "_config", this.account, JSON.stringify({
            "id": this.accountId,
            "sessionId": this.sessionId
          }));
          _0x32cb38("账号[" + this.index + "],取Token成功 😄 ");
        }
      } else this.valid = false, _0x32cb38("账号[" + this.index + "],取Token:失败 🙁 了呢,原因：" + _0x2000be?.["message"]), console.log(_0x2000be);
    } catch (_0x17d3b5) {
      console.log(_0x17d3b5);
    }
  }
  async ["loginInit"](_0x5a5a0e) {
    try {
      {
        const _0x50ac79 = "";
        let _0x2af698 = "/api/account/init",
          _0x4e5b4c = _0x456343.guid(),
          _0x2d3681 = _0x456343.ts13(),
          _0x34915f = _0x2af698 + "&&" + _0x4e5b4c + "&&" + _0x2d3681 + "&&" + this.key + "&&" + _0x12d02f,
          _0x2dc87a = _0x456343.SHA256_Encrypt(_0x34915f),
          _0x464c34 = {
            "method": "POST",
            "url": "" + this.hostname + _0x2af698,
            "headers": {
              "User-Agent": _0x92d00f,
              "Cache-Control": "no-cache",
              "Content-Type": "application/x-www-form-urlencoded",
              "Host": this.host,
              "Connection": "Keep-Alive",
              "X-SIGNATURE": _0x2dc87a,
              "X-REQUEST-ID": _0x4e5b4c,
              "Content-Length": _0x50ac79?.["length"],
              "X-SESSION-ID": "",
              "X-TENANT-ID": _0x12d02f,
              "X-TIMESTAMP": _0x2d3681
            },
            "form": _0x50ac79
          };
        if (this.authCookie) {
          _0x464c34.headers.Cookie = this.authCookie;
        }
        let _0x3ab185 = await _0x1ee6f7(_0x464c34, "登录初始化");
        _0x3ab185.code == 0 ? (_0x32cb38("账号[" + this.index + "],登录初始化成功 😄 "), _0x3b5a9a = _0x3ab185.data.session.id, await this.loginByCode(_0x3ab185.data.session.id, _0x5a5a0e)) : (this.valid = false, _0x32cb38("账号[" + this.index + "],登录初始化:失败 🙁 了呢,原因：" + _0x3ab185?.["message"]));
      }
    } catch (_0x13c4f8) {
      console.log(_0x13c4f8);
    }
  }
  async ["login"]() {
    let _0x5f3618 = "/web/oauth/credential_auth",
      _0x5edf28 = _0x456343.guid(),
      _0x4cd749 = _0x456343.ts13(),
      _0x3260be = _0x5f3618 + "&&" + _0x5edf28 + "&&" + _0x4cd749 + "&&" + this.key + "&&" + _0x12d02f,
      _0x30ddee = _0x456343.SHA256_Encrypt(_0x3260be);
    try {
      {
        let _0x44a3c0 = {
          "method": "POST",
          "url": "https://passport.tmuyun.com/web/oauth/credential_auth",
          "headers": {
            "X-TIMESTAMP": _0x4cd749,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "passport.tmuyun.com",
            "Connection": "Keep-Alive",
            "X-SIGNATURE": _0x30ddee,
            "X-REQUEST-ID": _0x5edf28
          },
          "form": "client_id=" + (_0x145b99 || "10001") + "&password=" + encodeURIComponent(await this.RSA_Encrypt(this.password)) + "&phone_number=" + this.account
        };
        this.authCookie && (_0x44a3c0.headers.Cookie = this.authCookie);
        let _0x40cfb0 = await _0x1ee6f7(_0x44a3c0, "登录");
        if (_0x40cfb0.code == 0) {
          _0x32cb38("账号[" + this.index + "],登录成功 😄 ");
          !_0x3b5a9a ? await this.loginInit(_0x40cfb0.data.authorization_code.code) : await this.loginByCode(_0x3b5a9a, _0x40cfb0.data.authorization_code.code);
        } else this.valid = false, _0x32cb38("账号[" + this.index + "],登录:失败 🙁 了呢,原因：" + _0x40cfb0?.["message"]), console.log(_0x40cfb0);
      }
    } catch (_0x22c669) {
      console.log(_0x22c669);
    }
  }
  async ["app_start"]() {
    let _0x32b68c = "/api/app_start_page/list/new",
      _0x33048d = _0x456343.guid(),
      _0x45f0e8 = _0x456343.ts13(),
      _0x52f922 = _0x32b68c + "&&" + _0xcb6aab + "&&" + _0x33048d + "&&" + _0x45f0e8 + "&&" + this.key + "&&" + _0x12d02f,
      _0x5cda4b = _0x456343.SHA256_Encrypt(_0x52f922);
    try {
      {
        let _0x3a7ab0 = {
            "method": "GET",
            "url": "" + this.hostname + _0x32b68c + "?height=2206&width=1080",
            "headers": {
              "X-SESSION-ID": "" + _0xcb6aab,
              "X-REQUEST-ID": _0x33048d,
              "X-TIMESTAMP": _0x45f0e8,
              "X-SIGNATURE": _0x5cda4b,
              "X-TENANT-ID": _0x12d02f,
              "User-Agent": _0x92d00f,
              "Cache-Control": "no-cache",
              "Content-Type": "application/x-www-form-urlencoded",
              "Host": this.host,
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            }
          },
          _0x5db95b = await _0x1ee6f7(_0x3a7ab0, "App启动中");
        _0x5db95b.code == 0 ? _0x32cb38("账号[" + this.index + "],App启动成功 😄 ") : _0x32cb38("账号[" + this.index + "],App启动:失败 🙁 了呢,原因：" + _0x5db95b?.["message"]);
      }
    } catch (_0x20fa36) {
      console.log(_0x20fa36);
    }
  }
  async ["web_start"]() {
    let _0x50267a = "/web/init",
      _0x500a8c = _0x456343.guid(),
      _0x567668 = _0x456343.ts13(),
      _0x25de89 = _0x50267a + "&&" + _0xcb6aab + "&&" + _0x500a8c + "&&" + _0x567668 + "&&" + this.key + "&&" + _0x12d02f,
      _0x427f90 = _0x456343.SHA256_Encrypt(_0x25de89);
    try {
      let _0x58bd48 = {
          "method": "GET",
          "url": "https://passport.tmuyun.com/web/init?client_id=" + _0x145b99,
          "headers": {
            "X-SESSION-ID": "" + _0xcb6aab,
            "X-REQUEST-ID": _0x500a8c,
            "X-TIMESTAMP": _0x567668,
            "X-SIGNATURE": _0x427f90,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "passport.tmuyun.com",
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x2680ec = await _0x1ee6f7(_0x58bd48, "Web初始化中", true),
        _0x27559c = _0x2680ec?.["body"];
      if (_0x27559c.code == 0) {
        let _0x4bba12 = _0x2680ec?.["rawHeaders"]?.["find"](_0x2d57a5 => _0x2d57a5?.["includes"]("SESSION"));
        _0x4bba12 && (this.authCookie = _0x4bba12);
        _0x32cb38("账号[" + this.index + "],Web初始化成功 😄 ");
      } else _0x32cb38("账号[" + this.index + "],Web初始化:失败 🙁 了呢,原因：" + _0x27559c?.["message"]);
    } catch (_0xe92019) {
      console.log(_0xe92019);
    }
  }
  async ["iframe_start"]() {
    let _0x4b445a = "/api/bullet_frame/detail",
      _0x5599b4 = _0x456343.guid(),
      _0x3106b0 = _0x456343.ts13(),
      _0x305f08 = _0x4b445a + "&&" + _0xcb6aab + "&&" + _0x5599b4 + "&&" + _0x3106b0 + "&&" + this.key + "&&" + _0x12d02f,
      _0x2f6f71 = _0x456343.SHA256_Encrypt(_0x305f08);
    try {
      let _0x21f380 = {
          "method": "GET",
          "url": "" + this.hostname + _0x4b445a,
          "headers": {
            "X-SESSION-ID": "" + _0xcb6aab,
            "X-REQUEST-ID": _0x5599b4,
            "X-TIMESTAMP": _0x3106b0,
            "X-SIGNATURE": _0x2f6f71,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x161c06 = await _0x1ee6f7(_0x21f380, "启动WebView中");
      if (_0x161c06.code == 0) _0x32cb38("账号[" + this.index + "],启动WebView成功 😄 ");else {
        _0x32cb38("账号[" + this.index + "],启动WebView:失败 🙁 了呢,原因：" + _0x161c06?.["message"]);
      }
    } catch (_0x255222) {
      console.log(_0x255222);
    }
  }
  async ["get_app_version"]() {
    let _0x3c066d = "/api/app_version/detail",
      _0x479860 = _0x456343.guid(),
      _0x23045a = _0x456343.ts13(),
      _0x17b0c2 = _0x3c066d + "&&" + _0xcb6aab + "&&" + _0x479860 + "&&" + _0x23045a + "&&" + this.key + "&&" + _0x12d02f,
      _0x2cfafa = _0x456343.SHA256_Encrypt(_0x17b0c2);
    try {
      {
        let _0x3e2af0 = {
            "method": "GET",
            "url": "" + this.hostname + _0x3c066d,
            "headers": {
              "X-SESSION-ID": "" + _0xcb6aab,
              "X-REQUEST-ID": _0x479860,
              "X-TIMESTAMP": _0x23045a,
              "X-SIGNATURE": _0x2cfafa,
              "X-TENANT-ID": _0x12d02f,
              "User-Agent": _0x92d00f,
              "Cache-Control": "no-cache",
              "Host": this.host,
              "Connection": "Keep-Alive"
            }
          },
          _0x1a2345 = await _0x1ee6f7(_0x3e2af0, "获取版本信息中");
        _0x1a2345.code == 0 ? _0x32cb38("账号[" + this.index + "],获取版本信息成功 😄 ") : _0x32cb38("账号[" + this.index + "],获取版本信息:失败 🙁 了呢,原因：" + _0x1a2345?.["message"]);
      }
    } catch (_0x28814f) {
      console.log(_0x28814f);
    }
  }
  async ["config_get"]() {
    let _0x19332f = "/api/app_version_customize_config/mine",
      _0xa47441 = _0x456343.guid(),
      _0x8d0908 = _0x456343.ts13(),
      _0x57452e = _0x19332f + "&&" + _0xcb6aab + "&&" + _0xa47441 + "&&" + _0x8d0908 + "&&" + this.key + "&&" + _0x12d02f,
      _0x926646 = _0x456343.SHA256_Encrypt(_0x57452e);
    try {
      let _0x539881 = {
          "method": "GET",
          "url": "" + this.hostname + _0x19332f,
          "headers": {
            "X-SESSION-ID": "" + _0xcb6aab,
            "X-REQUEST-ID": _0xa47441,
            "X-TIMESTAMP": _0x8d0908,
            "X-SIGNATURE": _0x926646,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive"
          }
        },
        _0x56610a = await _0x1ee6f7(_0x539881, "获取App配置中");
      _0x56610a.code == 0 ? _0x32cb38("账号[" + this.index + "],获取App配置成功 😄 ") : _0x32cb38("账号[" + this.index + "],获取App配置:失败 🙁 了呢, 原因：" + _0x56610a?.["message"]);
    } catch (_0x1a328b) {
      console.log(_0x1a328b);
    }
  }
  async ["get_unread_msg"]() {
    let _0x5ac061 = "/api/chuanbo/unread",
      _0x4e4f0c = _0x456343.guid(),
      _0xe46ca7 = _0x456343.ts13(),
      _0x57adca = _0x5ac061 + "&&" + this.sessionId + "&&" + _0x4e4f0c + "&&" + _0xe46ca7 + "&&" + this.key + "&&" + _0x12d02f,
      _0x484874 = _0x456343.SHA256_Encrypt(_0x57adca);
    try {
      {
        let _0x2984ba = {
            "method": "GET",
            "url": "" + this.hostname + _0x5ac061,
            "headers": {
              "X-SESSION-ID": "" + this.sessionId,
              "X-REQUEST-ID": _0x4e4f0c,
              "X-TIMESTAMP": _0xe46ca7,
              "X-SIGNATURE": _0x484874,
              "X-TENANT-ID": _0x12d02f,
              "User-Agent": _0x92d00f,
              "Cache-Control": "no-cache",
              "Content-Type": "application/x-www-form-urlencoded",
              "Host": this.host,
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            }
          },
          _0x5c188f = await _0x1ee6f7(_0x2984ba, "获取未读信息");
        if (_0x5c188f.code == 0) {
          _0x32cb38("账号[" + this.index + "],获取未读信息成功 😄 ");
        } else _0x32cb38("账号[" + this.index + "],获取未读信息:失败 🙁 了呢,原因：" + _0x5c188f?.["message"]);
      }
    } catch (_0x1089c9) {
      console.log(_0x1089c9);
    }
  }
  async ["task_comment_pre"]() {
    let _0x38631f = "/api/app_feature_switch/list",
      _0xd937df = _0x456343.guid(),
      _0x3f2222 = _0x456343.ts13(),
      _0x293545 = _0x38631f + "&&" + this.sessionId + "&&" + _0xd937df + "&&" + _0x3f2222 + "&&" + this.key + "&&" + _0x12d02f,
      _0x5f450c = _0x456343.SHA256_Encrypt(_0x293545);
    try {
      {
        let _0x4c605d = {
            "method": "GET",
            "url": "" + this.hostname + _0x38631f,
            "headers": {
              "X-SESSION-ID": "" + this.sessionId,
              "X-REQUEST-ID": _0xd937df,
              "X-TIMESTAMP": _0x3f2222,
              "X-SIGNATURE": _0x5f450c,
              "X-TENANT-ID": _0x12d02f,
              "User-Agent": _0x92d00f,
              "Cache-Control": "no-cache",
              "Content-Type": "application/x-www-form-urlencoded",
              "Host": this.host,
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            }
          },
          _0x2fb6c2 = await _0x1ee6f7(_0x4c605d, "文章准备工作");
        _0x2fb6c2.code == 0 ? _0x32cb38("账号[" + this.index + "],文章准备工作成功 😄 ") : _0x32cb38("账号[" + this.index + "],文章准备工作:失败 🙁 了呢,原因：" + _0x2fb6c2?.["message"]);
      }
    } catch (_0x17a18a) {
      console.log(_0x17a18a);
    }
  }
  async ["task_comment"](_0x368ae0) {
    let _0x534719 = _0xca0af9 ? await this.txt_api() : _0x2aed43[Math.floor(Math.random() * _0x2aed43?.["length"])],
      _0x56dc9f = "/api/comment/create",
      _0x487e0f = _0x456343.guid(),
      _0x44b4ad = _0x456343.ts13(),
      _0x1f6763 = _0x56dc9f + "&&" + this.sessionId + "&&" + _0x487e0f + "&&" + _0x44b4ad + "&&" + this.key + "&&" + _0x12d02f,
      _0x47cd5a = _0x456343.SHA256_Encrypt(_0x1f6763);
    try {
      let _0x154f96 = {
          "method": "POST",
          "url": "" + this.hostname + _0x56dc9f,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x487e0f,
            "X-TIMESTAMP": _0x44b4ad,
            "X-SIGNATURE": _0x47cd5a,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          },
          "form": {
            "channel_article_id": _0x368ae0,
            "content": _0x534719
          }
        },
        _0x1da1e8 = await _0x1ee6f7(_0x154f96, "评论");
      if (_0x1da1e8.code == 0) {
        const _0x53b24c = this?.["jobList"]?.["find"](_0x47c988 => {
          return _0x47c988?.["name"]?.["includes"]("资讯评论") && _0x47c988?.["frequency"] > _0x47c988?.["finish_times"];
        });
        _0x53b24c.finish_times++;
        _0x32cb38("账号[" + this.index + "],评论成功 😄 [" + _0x534719 + "]");
        const _0x313dfb = _0x1da1e8?.["data"]?.["comment"]?.["id"];
        await _0x4fc79b(1 + Math.random() * 1);
        await this.deleteComment(_0x313dfb);
      } else _0x32cb38("账号[" + this.index + "],评论:失败 🙁 了呢,原因：" + _0x1da1e8?.["message"]), this.commentError = _0x1da1e8?.["message"]?.["includes"]("请重新进入当前页面");
    } catch (_0x19df78) {
      console.log(_0x19df78);
    }
  }
  async ["deleteComment"](_0x12d624) {
    let _0x2337c7 = "/api/comment/delete",
      _0x360027 = _0x456343.guid(),
      _0x26a661 = _0x456343.ts13(),
      _0x8c7933 = _0x2337c7 + "&&" + this.sessionId + "&&" + _0x360027 + "&&" + _0x26a661 + "&&" + this.key + "&&" + _0x12d02f,
      _0x1bdbf0 = _0x456343.SHA256_Encrypt(_0x8c7933);
    try {
      let _0x429181 = {
          "method": "POST",
          "url": "" + this.hostname + _0x2337c7,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x360027,
            "X-TIMESTAMP": _0x26a661,
            "X-SIGNATURE": _0x1bdbf0,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          },
          "form": {
            "comment_id": _0x12d624
          }
        },
        _0x456e35 = await _0x1ee6f7(_0x429181, "删除评论");
      _0x456e35.code == 0 ? _0x32cb38("账号[" + this.index + "], 删除评论成功 😄 ") : _0x32cb38("账号[" + this.index + "],删除评论失败 🙁 了呢,原因：" + _0x456e35?.["message"]);
    } catch (_0x679761) {
      console.log(_0x679761);
    }
  }
  async ["task_share"](_0x460102, _0x1bdae0, _0x5a1c01) {
    let _0x337270 = "/api/user_mumber/doTask",
      _0x462d01 = _0x456343.guid(),
      _0x211822 = _0x456343.ts13(),
      _0x31ebdf = _0x337270 + "&&" + this.sessionId + "&&" + _0x462d01 + "&&" + _0x211822 + "&&" + this.key + "&&" + _0x12d02f,
      _0x4e9292 = _0x456343.SHA256_Encrypt(_0x31ebdf);
    try {
      let _0x228a92 = {
          "method": "POST",
          "url": "" + this.hostname + _0x337270,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x462d01,
            "X-TIMESTAMP": _0x211822,
            "X-SIGNATURE": _0x4e9292,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          },
          "form": {
            "memberType": _0x460102,
            "member_type": _0x460102,
            "target_id": _0x1bdae0
          }
        },
        _0x1cfdc0 = await _0x1ee6f7(_0x228a92, _0x5a1c01);
      if (_0x1cfdc0.code == 0) {
        {
          const _0x2f2185 = this?.["jobList"]?.["find"](_0x180f0e => {
            return _0x180f0e?.["name"]?.["includes"](_0x460102 === "3" ? "分享资讯" : "使用本地服务") && _0x180f0e?.["frequency"] > _0x180f0e?.["finish_times"];
          });
          _0x2f2185 && _0x2f2185.finish_times++;
          _0x32cb38("账号[" + this.index + "]," + _0x5a1c01 + "成功 😄 ");
          _0x1cfdc0.data && "账号[" + this.index + "]," + _0x5a1c01 + ("执行完毕共获得:[" + _0x1cfdc0.data.score_notify.integral + "]");
        }
      } else {
        _0x32cb38("账号[" + this.index + "], " + _0x5a1c01 + " :失败 🙁 了呢,原因：" + _0x1cfdc0?.["message"]);
        console.log(_0x1cfdc0);
      }
    } catch (_0x3451e3) {
      console.log(_0x3451e3);
    }
  }
  async ["user_info"]() {
    let _0x12a0e0 = "/api/user_mumber/account_detail",
      _0x56ab0b = _0x456343.guid(),
      _0x409c6c = _0x456343.ts13(),
      _0xa9aed9 = _0x12a0e0 + "&&" + this.sessionId + "&&" + _0x56ab0b + "&&" + _0x409c6c + "&&" + this.key + "&&" + _0x12d02f,
      _0x3cc738 = _0x456343.SHA256_Encrypt(_0xa9aed9);
    try {
      let _0x32fbb7 = {
          "method": "GET",
          "url": "" + this.hostname + _0x12a0e0,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x56ab0b,
            "X-TIMESTAMP": _0x409c6c,
            "X-SIGNATURE": _0x3cc738,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x13aa9f = await _0x1ee6f7(_0x32fbb7, "用户信息");
      _0x13aa9f.code == 0 ? (this.valid = true, this.requestedUserInfo = true, _0x32cb38("账号[" + this.index + "],验证成功 😄 ，账号可正常使用，[" + _0x13aa9f.data.rst.nick_name + "]"), _0x13aa9f.data.rst.ref_user_uid == "" && (await this.share_code("推荐"))) : (this.valid = false, _0x13aa9f?.["message"]?.["includes"]("Session无效或者过期") ? _0x32cb38("账号[" + this.index + "],验证失败 🙁 了呢,请检查配置是否正确 或者 账户凭证是否过期；请看脚本头部说明，如果是老脚本配置，需在配置文件配置：export ahyCookieOldConfigTranform='true'") : _0x32cb38("账号[" + this.index + "],验证失败 🙁 了呢,原因：" + _0x13aa9f?.["message"]));
    } catch (_0x1c866a) {
      console.log(_0x1c866a);
    }
  }
  async ["share_code"](_0x53afa0) {
    let _0x5187fb = "/api/account/update_ref_code",
      _0x21da94 = _0x456343.guid(),
      _0x1a70e9 = _0x456343.ts13(),
      _0x3c5d40 = _0x5187fb + "&&" + this.sessionId + "&&" + _0x21da94 + "&&" + _0x1a70e9 + "&&" + this.key + "&&" + _0x12d02f,
      _0x573c4f = _0x456343.SHA256_Encrypt(_0x3c5d40);
    try {
      let _0xcc4ca8 = {
          "method": "POST",
          "url": "" + this.hostname + _0x5187fb,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x21da94,
            "X-TIMESTAMP": _0x1a70e9,
            "X-SIGNATURE": _0x573c4f,
            "X-TENANT-ID": _0x12d02f,
            "User-Agent": _0x92d00f,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          },
          "form": {
            "ref_code": _0x4526f6 || "WET28W"
          }
        },
        _0xa9255f = await _0x1ee6f7(_0xcc4ca8, _0x53afa0);
      if (_0xa9255f.code == 0) {} else {}
    } catch (_0x34b4dc) {
      console.log(_0x34b4dc);
    }
  }
}
!(async () => {
  _0x32cb38("开始读取配置的数据……");
  if (!(await _0x5d4963())) return;
  _0x2be770.length > 0 ? (_0x32cb38(_0x104202), await _0x4fc79b(0.1), await _0x61c09e()) : (console.log("无可用账号，停止执行\n" + _0x3c0057), exit());
  await _0x5a23f6(_0x19bd80?.["name"] + "：" + _0xc41171 + "\n" + _0x54c9a3);
})().catch(_0x3d1d0c => console.log(_0x3d1d0c)).finally(() => _0x19bd80.done());
function _0x53aed0(_0xa0cbc5, _0x2d7515, _0x3647f4) {
  let _0x4ae50a = {},
    _0x5b56ea = {};
  try {
    _0x4ae50a = _0x1850b4.readFileSync(_0xa0cbc5 + ".json", "utf8");
    _0x5b56ea = JSON.parse(_0x4ae50a);
  } catch (_0x225950) {}
  _0x5b56ea[_0x2d7515] = _0x3647f4;
  const _0x27a930 = JSON.stringify(_0x5b56ea);
  try {
    _0x1850b4.writeFileSync(_0xa0cbc5 + ".json", _0x27a930);
  } catch (_0x470c10) {
    {
      if (_0x470c10.code === "ENOENT") _0x1850b4.writeFileSync(_0xa0cbc5 + ".json", _0x27a930);else {
        console.error("保存文件时发生错误：", _0x470c10);
      }
    }
  }
}
function _0x5d8d09(_0x37b70a, _0x43bcf7) {
  try {
    const _0x419c18 = _0x1850b4.readFileSync(_0x37b70a + ".json", "utf8"),
      _0x3e4b53 = JSON.parse(_0x419c18);
    return _0x3e4b53[_0x43bcf7];
  } catch (_0x1b8d67) {
    {
      if (_0x1b8d67.code === "ENOENT") return undefined;else console.error("读取文件时发生错误：", _0x1b8d67);
    }
  }
}
async function _0x5d4963() {
  if (_0x5314ac) {
    let _0x4a22d3 = _0x4765f8[0];
    for (let _0x31a844 of _0x4765f8) if (_0x5314ac.indexOf(_0x31a844) > -1) {
      _0x4a22d3 = _0x31a844;
      break;
    }
    for (let _0x1e6412 of _0x5314ac.split(_0x4a22d3)) _0x1e6412 && _0x2be770.push(new _0x48e239(_0x51e865 && _0x1e6412?.["includes"]("&") ? _0x1e6412?.["split"]("&") : _0x1e6412?.["split"]("#")));
    _0x5e9c16 = _0x2be770.length;
  } else {
    {
      console.log("未找到CK");
      return;
    }
  }
  console.log("共找到" + _0x5e9c16 + "个账号");
  return true;
}
async function _0x1ee6f7(_0x2eb96f, _0x47aeb6, _0x2ed0a7) {
  return new Promise(_0xa0a64 => {
    if (!_0x47aeb6) {
      let _0x39b699 = arguments.callee.toString(),
        _0x520867 = /function\s*(\w*)/i,
        _0x21a3fd = _0x520867.exec(_0x39b699);
      _0x47aeb6 = _0x21a3fd[1];
    }
    if (_0x319816) {
      console.log("\n【debug】===============这是" + _0x47aeb6 + "请求信息===============");
      console.log(_0x2eb96f);
    }
    _0x319816 && (_0x2eb96f.rejectUnauthorized = false);
    _0x571ae9(_0x2eb96f, function (_0x156c07, _0x460253) {
      if (_0x156c07) throw new Error(_0x156c07);
      let _0x25617a = _0x460253.body;
      try {
        _0x319816 && (console.log("\n\n【debug】===============这是" + _0x47aeb6 + "返回数据=============="), console.log(_0x25617a));
        if (typeof _0x25617a == "string") {
          if (_0x4c3001(_0x25617a)) {
            {
              let _0x1c85af = JSON.parse(_0x25617a);
              _0x319816 && (console.log("\n【debug】=============这是" + _0x47aeb6 + "json解析后数据============"), console.log(_0x1c85af));
              !_0x2ed0a7 ? _0xa0a64(_0x1c85af) : _0xa0a64({
                ..._0x460253,
                "body": _0x1c85af
              });
            }
          } else {
            let _0x18555e = _0x25617a;
            !_0x2ed0a7 ? _0xa0a64(_0x18555e) : _0xa0a64({
              ..._0x460253,
              "body": _0x18555e
            });
          }
          function _0x4c3001(_0x3fb385) {
            if (typeof _0x3fb385 == "string") try {
              {
                if (typeof JSON.parse(_0x3fb385) == "object") return true;
              }
            } catch (_0x5c5e83) {
              return false;
            }
            return false;
          }
        } else {
          let _0x4225b5 = _0x25617a;
          !_0x2ed0a7 ? _0xa0a64(_0x4225b5) : _0xa0a64({
            ..._0x460253,
            "body": _0x4225b5
          });
        }
      } catch (_0x4fb501) {
        console.log(_0x156c07, _0x460253);
        console.log("\n " + _0x47aeb6 + "失败了!请稍后尝试!!");
      } finally {
        _0xa0a64();
      }
    });
  });
}
function _0x4fc79b(_0x46660f) {
  return new Promise(function (_0x1dd517) {
    setTimeout(_0x1dd517, _0x46660f * 1000);
  });
}
function _0x32cb38(_0x3ee168) {
  _0x19bd80.isNode() ? _0x3ee168 && (console.log("" + _0x3ee168), _0x28218c += "" + _0x3ee168) : (console.log("" + _0x3ee168), msg += "" + _0x3ee168);
}
async function _0x5a23f6(_0x5cc66d) {
  if (!_0x5cc66d) return;
  if (_0x4dfcbf > 0) {
    if (_0x19bd80.isNode()) {
      var _0x23cbc6 = require("./sendNotify");
      await _0x23cbc6.sendNotify(_0x19bd80.name, _0x5cc66d);
    } else _0x19bd80.msg(_0x19bd80.name, "", _0x5cc66d);
  } else console.log("通知服务未开启，不予推送：", _0x5cc66d);
}
function _0x43b582() {
  _0x19bd80.isNode() && (process.on("uncaughtException", function (_0x3f60a7) {
    if (_0x3f60a7.code === "MODULE_NOT_FOUND") {
      const _0xa903e1 = _0x3f60a7.message.split("'")[1];
      _0xa903e1.startsWith("./") ? console.log("缺少依赖文件，请前往代码库寻找 " + _0xa903e1?.["replace"]("./", "")?.["replace"]("../", "") + " 代码文件，放在本脚本同一目录下 \n 什么？不会？v我50我教你！") : console.log("缺少依赖，请安装 " + _0xa903e1 + " 库： " + _0xa903e1 + " \n 什么？不会？v我50我教你！");
    } else console.log("发生错误：" + _0x3f60a7.message);
  }), process.on("unhandledRejection", function (_0x42ae3b) {
    {
      const _0x4ad9ed = _0x42ae3b.stack.split("\n");
      if (_0x4ad9ed.length > 1) {
        const _0xfcf048 = _0x4ad9ed[1],
          _0x7a84b6 = _0xfcf048.match(/\((.*):(\d+):(\d+)\)/);
        if (_0x7a84b6) {
          {
            const _0x28565c = _0x7a84b6[1],
              _0x135ed7 = _0x7a84b6[2];
            console.log("程序执行出现异常，错误信息：" + _0x42ae3b.message + ("，错误发生在 " + _0x28565c + " 的第 " + _0x135ed7 + " 行 \n 请在本仓库建立 issue 并附上日志或者截图即可？什么，很着急？v我50疯狂星期四！"));
          }
        }
      } else console.log("发生错误：" + _0x42ae3b.message);
    }
  }));
}
function _0x3b726d(_0xb8c35a, _0x4ba3f1) {
  "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
  class _0x5c646a {
    constructor(_0xb362a) {
      this.env = _0xb362a;
    }
    ["send"](_0x31b283, _0x1d2e36 = "GET") {
      {
        _0x31b283 = "string" == typeof _0x31b283 ? {
          "url": _0x31b283
        } : _0x31b283;
        let _0x1283f1 = this.get;
        "POST" === _0x1d2e36 && (_0x1283f1 = this.post);
        return new Promise((_0x169d2e, _0x1369ce) => {
          _0x1283f1.call(this, _0x31b283, (_0xe09899, _0x4830f3, _0x1c8f03) => {
            _0xe09899 ? _0x1369ce(_0xe09899) : _0x169d2e(_0x4830f3);
          });
        });
      }
    }
    ["get"](_0x1585d6) {
      return this.send.call(this.env, _0x1585d6);
    }
    ["post"](_0x325289) {
      return this.send.call(this.env, _0x325289, "POST");
    }
  }
  return new class {
    constructor(_0x3d8166, _0x5425d0) {
      this.name = _0x3d8166;
      this.http = new _0x5c646a(this);
      this.data = null;
      this.dataFile = "box.dat";
      this.logs = [];
      this.isMute = false;
      this.isNeedRewrite = false;
      this.logSeparator = "\n";
      this.startTime = new Date().getTime();
      Object.assign(this, _0x5425d0);
      this.log("", "🔔" + this.name + ", 开始!");
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
    ["toObj"](_0x1db95, _0x16b97a = null) {
      try {
        return JSON.parse(_0x1db95);
      } catch {
        return _0x16b97a;
      }
    }
    ["toStr"](_0x3b8925, _0x2d0df7 = null) {
      try {
        return JSON.stringify(_0x3b8925);
      } catch {
        return _0x2d0df7;
      }
    }
    ["getjson"](_0x586a4b, _0x2d7f07) {
      let _0x70f514 = _0x2d7f07;
      const _0x4cd6ee = this.getdata(_0x586a4b);
      if (_0x4cd6ee) try {
        _0x70f514 = JSON.parse(this.getdata(_0x586a4b));
      } catch {}
      return _0x70f514;
    }
    ["setjson"](_0x5d7f1a, _0x491890) {
      try {
        return this.setdata(JSON.stringify(_0x5d7f1a), _0x491890);
      } catch {
        return false;
      }
    }
    ["getScript"](_0x16c329) {
      return new Promise(_0x4e2ae5 => {
        this.get({
          "url": _0x16c329
        }, (_0x1d9aaf, _0x9141a3, _0x2a5e48) => _0x4e2ae5(_0x2a5e48));
      });
    }
    ["runScript"](_0x160ca4, _0x5736bf) {
      return new Promise(_0x250845 => {
        {
          let _0x12d70d = this.getdata("@chavy_boxjs_userCfgs.httpapi");
          _0x12d70d = _0x12d70d ? _0x12d70d.replace(/\n/g, "").trim() : _0x12d70d;
          let _0x3db51a = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
          _0x3db51a = _0x3db51a ? 1 * _0x3db51a : 20;
          _0x3db51a = _0x5736bf && _0x5736bf.timeout ? _0x5736bf.timeout : _0x3db51a;
          const [_0x3dcee5, _0x4b55cd] = _0x12d70d.split("@"),
            _0x4c3bbc = {
              "url": "http://" + _0x4b55cd + "/v1/scripting/evaluate",
              "body": {
                "script_text": _0x160ca4,
                "mock_type": "cron",
                "timeout": _0x3db51a
              },
              "headers": {
                "X-Key": _0x3dcee5,
                "Accept": "*/*"
              }
            };
          this.post(_0x4c3bbc, (_0x4b14e6, _0x54bc23, _0x1cce2a) => _0x250845(_0x1cce2a));
        }
      }).catch(_0x384b78 => this.logErr(_0x384b78));
    }
    ["loaddata"]() {
      {
        if (!this.isNode()) return {};
        {
          {
            this.fs = this.fs ? this.fs : require("fs");
            this.path = this.path ? this.path : require("path");
            const _0x5195ed = this.path.resolve(this.dataFile),
              _0x51243b = this.path.resolve(process.cwd(), this.dataFile),
              _0x5233e8 = this.fs.existsSync(_0x5195ed),
              _0x2f361b = !_0x5233e8 && this.fs.existsSync(_0x51243b);
            if (!_0x5233e8 && !_0x2f361b) return {};
            {
              const _0x929c92 = _0x5233e8 ? _0x5195ed : _0x51243b;
              try {
                return JSON.parse(this.fs.readFileSync(_0x929c92));
              } catch (_0x1770be) {
                return {};
              }
            }
          }
        }
      }
    }
    ["writedata"]() {
      if (this.isNode()) {
        {
          this.fs = this.fs ? this.fs : require("fs");
          this.path = this.path ? this.path : require("path");
          const _0x1173b5 = this.path.resolve(this.dataFile),
            _0x362205 = this.path.resolve(process.cwd(), this.dataFile),
            _0x4c65fc = this.fs.existsSync(_0x1173b5),
            _0x2c0bf2 = !_0x4c65fc && this.fs.existsSync(_0x362205),
            _0x4f336a = JSON.stringify(this.data);
          _0x4c65fc ? this.fs.writeFileSync(_0x1173b5, _0x4f336a) : _0x2c0bf2 ? this.fs.writeFileSync(_0x362205, _0x4f336a) : this.fs.writeFileSync(_0x1173b5, _0x4f336a);
        }
      }
    }
    ["lodash_get"](_0x37c41f, _0x59276a, _0x131336) {
      {
        const _0x5397e2 = _0x59276a.replace(/\[(\d+)\]/g, ".$1").split(".");
        let _0x23c562 = _0x37c41f;
        for (const _0x2211d2 of _0x5397e2) if (_0x23c562 = Object(_0x23c562)[_0x2211d2], undefined === _0x23c562) return _0x131336;
        return _0x23c562;
      }
    }
    ["lodash_set"](_0x4b71f2, _0x53e22d, _0xdf3c94) {
      return Object(_0x4b71f2) !== _0x4b71f2 ? _0x4b71f2 : (Array.isArray(_0x53e22d) || (_0x53e22d = _0x53e22d.toString().match(/[^.[\]]+/g) || []), _0x53e22d.slice(0, -1).reduce((_0x3f9856, _0x3cc677, _0x216493) => Object(_0x3f9856[_0x3cc677]) === _0x3f9856[_0x3cc677] ? _0x3f9856[_0x3cc677] : _0x3f9856[_0x3cc677] = Math.abs(_0x53e22d[_0x216493 + 1]) >> 0 == +_0x53e22d[_0x216493 + 1] ? [] : {}, _0x4b71f2)[_0x53e22d[_0x53e22d.length - 1]] = _0xdf3c94, _0x4b71f2);
    }
    ["getdata"](_0x488953) {
      let _0x2d9035 = this.getval(_0x488953);
      if (/^@/.test(_0x488953)) {
        const [, _0x42b21d, _0x2e61b2] = /^@(.*?)\.(.*?)$/.exec(_0x488953),
          _0x1a7155 = _0x42b21d ? this.getval(_0x42b21d) : "";
        if (_0x1a7155) try {
          const _0x262e86 = JSON.parse(_0x1a7155);
          _0x2d9035 = _0x262e86 ? this.lodash_get(_0x262e86, _0x2e61b2, "") : _0x2d9035;
        } catch (_0x56584c) {
          _0x2d9035 = "";
        }
      }
      return _0x2d9035;
    }
    ["setdata"](_0x46716a, _0x3bbbe5) {
      {
        let _0x2130ed = false;
        if (/^@/.test(_0x3bbbe5)) {
          {
            const [, _0x3f579e, _0x1cc96b] = /^@(.*?)\.(.*?)$/.exec(_0x3bbbe5),
              _0x5a67dd = this.getval(_0x3f579e),
              _0x341716 = _0x3f579e ? "null" === _0x5a67dd ? null : _0x5a67dd || "{}" : "{}";
            try {
              const _0x38fc9a = JSON.parse(_0x341716);
              this.lodash_set(_0x38fc9a, _0x1cc96b, _0x46716a);
              _0x2130ed = this.setval(JSON.stringify(_0x38fc9a), _0x3f579e);
            } catch (_0x428295) {
              const _0x121436 = {};
              this.lodash_set(_0x121436, _0x1cc96b, _0x46716a);
              _0x2130ed = this.setval(JSON.stringify(_0x121436), _0x3f579e);
            }
          }
        } else _0x2130ed = this.setval(_0x46716a, _0x3bbbe5);
        return _0x2130ed;
      }
    }
    ["getval"](_0x393920) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(_0x393920) : this.isQuanX() ? $prefs.valueForKey(_0x393920) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x393920]) : this.data && this.data[_0x393920] || null;
    }
    ["setval"](_0x2ba2ad, _0x5f1d5c) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(_0x2ba2ad, _0x5f1d5c) : this.isQuanX() ? $prefs.setValueForKey(_0x2ba2ad, _0x5f1d5c) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x5f1d5c] = _0x2ba2ad, this.writedata(), true) : this.data && this.data[_0x5f1d5c] || null;
    }
    ["initGotEnv"](_0x4d2bfc) {
      this.got = this.got ? this.got : require("got");
      this.cktough = this.cktough ? this.cktough : require("tough-cookie");
      this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar();
      _0x4d2bfc && (_0x4d2bfc.headers = _0x4d2bfc.headers ? _0x4d2bfc.headers : {}, undefined === _0x4d2bfc.headers.Cookie && undefined === _0x4d2bfc.cookieJar && (_0x4d2bfc.cookieJar = this.ckjar));
    }
    ["get"](_0x149859, _0x219e0b = () => {}) {
      _0x149859.headers && (delete _0x149859.headers["Content-Type"], delete _0x149859.headers["Content-Length"]);
      this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (_0x149859.headers = _0x149859.headers || {}, Object.assign(_0x149859.headers, {
        "X-Surge-Skip-Scripting": false
      })), $httpClient.get(_0x149859, (_0x2c0d13, _0x342df0, _0x4720a2) => {
        !_0x2c0d13 && _0x342df0 && (_0x342df0.body = _0x4720a2, _0x342df0.statusCode = _0x342df0.status);
        _0x219e0b(_0x2c0d13, _0x342df0, _0x4720a2);
      })) : this.isQuanX() ? (this.isNeedRewrite && (_0x149859.opts = _0x149859.opts || {}, Object.assign(_0x149859.opts, {
        "hints": false
      })), $task.fetch(_0x149859).then(_0x55cd62 => {
        const {
          statusCode: _0x39dfac,
          statusCode: _0xc1cbc6,
          headers: _0x368844,
          body: _0x2b72e5
        } = _0x55cd62;
        _0x219e0b(null, {
          "status": _0x39dfac,
          "statusCode": _0xc1cbc6,
          "headers": _0x368844,
          "body": _0x2b72e5
        }, _0x2b72e5);
      }, _0x554d32 => _0x219e0b(_0x554d32))) : this.isNode() && (this.initGotEnv(_0x149859), this.got(_0x149859).on("redirect", (_0x28d31e, _0x163ce9) => {
        try {
          if (_0x28d31e.headers["set-cookie"]) {
            const _0xcf322 = _0x28d31e.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
            _0xcf322 && this.ckjar.setCookieSync(_0xcf322, null);
            _0x163ce9.cookieJar = this.ckjar;
          }
        } catch (_0x4629a8) {
          this.logErr(_0x4629a8);
        }
      }).then(_0x356e9e => {
        {
          const {
            statusCode: _0x2ef324,
            statusCode: _0x546003,
            headers: _0x40d260,
            body: _0x523508
          } = _0x356e9e;
          _0x219e0b(null, {
            "status": _0x2ef324,
            "statusCode": _0x546003,
            "headers": _0x40d260,
            "body": _0x523508
          }, _0x523508);
        }
      }, _0x310a79 => {
        {
          const {
            message: _0x389ce0,
            response: _0xa386fe
          } = _0x310a79;
          _0x219e0b(_0x389ce0, _0xa386fe, _0xa386fe && _0xa386fe.body);
        }
      }));
    }
    ["post"](_0x31ad35, _0x893e65 = () => {}) {
      {
        if (_0x31ad35.body && _0x31ad35.headers && !_0x31ad35.headers["Content-Type"] && (_0x31ad35.headers["Content-Type"] = "application/x-www-form-urlencoded"), _0x31ad35.headers && delete _0x31ad35.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (_0x31ad35.headers = _0x31ad35.headers || {}, Object.assign(_0x31ad35.headers, {
          "X-Surge-Skip-Scripting": false
        })), $httpClient.post(_0x31ad35, (_0xd2efb, _0x326c75, _0x389728) => {
          !_0xd2efb && _0x326c75 && (_0x326c75.body = _0x389728, _0x326c75.statusCode = _0x326c75.status);
          _0x893e65(_0xd2efb, _0x326c75, _0x389728);
        });else {
          if (this.isQuanX()) _0x31ad35.method = "POST", this.isNeedRewrite && (_0x31ad35.opts = _0x31ad35.opts || {}, Object.assign(_0x31ad35.opts, {
            "hints": false
          })), $task.fetch(_0x31ad35).then(_0x3c7cae => {
            {
              const {
                statusCode: _0x267a9,
                statusCode: _0x43b959,
                headers: _0x49d2b1,
                body: _0x230ca6
              } = _0x3c7cae;
              _0x893e65(null, {
                "status": _0x267a9,
                "statusCode": _0x43b959,
                "headers": _0x49d2b1,
                "body": _0x230ca6
              }, _0x230ca6);
            }
          }, _0x25e893 => _0x893e65(_0x25e893));else {
            if (this.isNode()) {
              this.initGotEnv(_0x31ad35);
              const {
                url: _0x318b5b,
                ..._0x7aadcc
              } = _0x31ad35;
              this.got.post(_0x318b5b, _0x7aadcc).then(_0x23eb44 => {
                const {
                  statusCode: _0x1a57d8,
                  statusCode: _0x112639,
                  headers: _0x759778,
                  body: _0x35b36f
                } = _0x23eb44;
                _0x893e65(null, {
                  "status": _0x1a57d8,
                  "statusCode": _0x112639,
                  "headers": _0x759778,
                  "body": _0x35b36f
                }, _0x35b36f);
              }, _0x35ad44 => {
                {
                  const {
                    message: _0x4690ec,
                    response: _0x489084
                  } = _0x35ad44;
                  _0x893e65(_0x4690ec, _0x489084, _0x489084 && _0x489084.body);
                }
              });
            }
          }
        }
      }
    }
    ["time"](_0xf1adf6, _0x1b8608 = null) {
      {
        const _0x212382 = _0x1b8608 ? new Date(_0x1b8608) : new Date();
        let _0xfefc17 = {
          "M+": _0x212382.getMonth() + 1,
          "d+": _0x212382.getDate(),
          "H+": _0x212382.getHours(),
          "m+": _0x212382.getMinutes(),
          "s+": _0x212382.getSeconds(),
          "q+": Math.floor((_0x212382.getMonth() + 3) / 3),
          "S": _0x212382.getMilliseconds()
        };
        /(y+)/.test(_0xf1adf6) && (_0xf1adf6 = _0xf1adf6.replace(RegExp.$1, (_0x212382.getFullYear() + "").substr(4 - RegExp.$1.length)));
        for (let _0x3648e5 in _0xfefc17) new RegExp("(" + _0x3648e5 + ")").test(_0xf1adf6) && (_0xf1adf6 = _0xf1adf6.replace(RegExp.$1, 1 == RegExp.$1.length ? _0xfefc17[_0x3648e5] : ("00" + _0xfefc17[_0x3648e5]).substr(("" + _0xfefc17[_0x3648e5]).length)));
        return _0xf1adf6;
      }
    }
    ["msg"](_0xc45f21 = _0xb8c35a, _0x5c83ac = "", _0x3083b0 = "", _0x2d2341) {
      const _0x1db8da = _0x5c3f75 => {
        if (!_0x5c3f75) return _0x5c3f75;
        if ("string" == typeof _0x5c3f75) return this.isLoon() ? _0x5c3f75 : this.isQuanX() ? {
          "open-url": _0x5c3f75
        } : this.isSurge() ? {
          "url": _0x5c3f75
        } : undefined;
        if ("object" == typeof _0x5c3f75) {
          if (this.isLoon()) {
            let _0x1e6c94 = _0x5c3f75.openUrl || _0x5c3f75.url || _0x5c3f75["open-url"],
              _0x5e139b = _0x5c3f75.mediaUrl || _0x5c3f75["media-url"];
            return {
              "openUrl": _0x1e6c94,
              "mediaUrl": _0x5e139b
            };
          }
          if (this.isQuanX()) {
            let _0x5c1aae = _0x5c3f75["open-url"] || _0x5c3f75.url || _0x5c3f75.openUrl,
              _0x18a053 = _0x5c3f75["media-url"] || _0x5c3f75.mediaUrl;
            return {
              "open-url": _0x5c1aae,
              "media-url": _0x18a053
            };
          }
          if (this.isSurge()) {
            let _0x2bbeb7 = _0x5c3f75.url || _0x5c3f75.openUrl || _0x5c3f75["open-url"];
            return {
              "url": _0x2bbeb7
            };
          }
        }
      };
      if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(_0xc45f21, _0x5c83ac, _0x3083b0, _0x1db8da(_0x2d2341)) : this.isQuanX() && $notify(_0xc45f21, _0x5c83ac, _0x3083b0, _0x1db8da(_0x2d2341))), !this.isMuteLog) {
        {
          let _0x319020 = ["", "==============📣系统通知📣=============="];
          _0x319020.push(_0xc45f21);
          _0x5c83ac && _0x319020.push(_0x5c83ac);
          _0x3083b0 && _0x319020.push(_0x3083b0);
          console.log(_0x319020.join("\n"));
          this.logs = this.logs.concat(_0x319020);
        }
      }
    }
    ["log"](..._0x96feaf) {
      _0x96feaf.length > 0 && (this.logs = [...this.logs, ..._0x96feaf]);
      console.log(_0x96feaf.join(this.logSeparator));
    }
    ["logErr"](_0x3b96de, _0x486085) {
      {
        const _0xb66901 = !this.isSurge() && !this.isQuanX() && !this.isLoon();
        _0xb66901 ? this.log("", "❗️" + this.name + ", 错误!", _0x3b96de.stack) : this.log("", "❗️" + this.name + ", 错误!", _0x3b96de);
      }
    }
    ["wait"](_0x181ec4) {
      return new Promise(_0x44d7c1 => setTimeout(_0x44d7c1, _0x181ec4));
    }
    ["done"](_0x2b83d3 = {}) {
      const _0x114652 = new Date().getTime(),
        _0x5237e2 = (_0x114652 - this.startTime) / 1000;
      this.log("", "🔔" + this.name + ", 结束! 🕛 " + _0x5237e2 + " 秒");
      this.log();
      (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(_0x2b83d3);
    }
  }(_0xb8c35a, _0x4ba3f1);
}