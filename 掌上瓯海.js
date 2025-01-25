/**
 * 掌上瓯海v2.0
 * 执行时间： 25 10,16 * * *  掌上瓯海.js
 * const $ = new Env("掌上瓯海");
 * 注册地址：https://app.ohnews.cn/webChannels/invite?inviteCode=HT6RK9&tenantId=78&accountId=647addefa7fd3962fa8466a4
 * ========= 青龙--配置文件 ===========
 * # 掌上瓯海（配置方式二选一）
 * 方式一：账号密码自动登录("&"符号链接也可以，但不推荐)
 * export zsoh='账号#密码'
 * 方式二：抓包协议头里的 X-SESSION-ID 和 X-ACCOUNT-ID
 * （“兼容老版本，如果老版本的配置 【X-ACCOUNT-ID&X-SESSIONID】这种，请增加设置 export zsohOldConfigTranform='true'”）
 * export zsoh='sessionId#accountId'
 * 是否启用文章评论开关（注，估计这个操作容易封）
 * export zsohEnabledPostComment="false" // 默认为false，代表关闭文章评论功能，如果需要开启请改为 true 或者 1
 * 是否启用论坛发帖开关（注，估计这个操作容易封）
 * export zsohEnabledForumPost="false" // 默认为false，代表关闭论坛发帖功能，如果需要开启请改为 true 或者 1
 * 文章评论是否使用一言随机返回的名人名句
 * export zsohEnabledPostCommentBy1Y="false" // 默认为false，代表关闭使用一言的随机评论，如果需要开启请改为 true 或者 1
 * 是否强制点赞、分享，不开启相关判断逻辑
 * export zsohForceLikeAndShare="false" // 默认为false，代表关闭根据返回的数据判断是否分享或者点赞，如果就是要尝试分享或者点赞请改为 true 或者 1
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
//Sat Jan 25 2025 08:31:15 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const _0x17c57d = new _0x1724be("掌上瓯海");
_0x17cd75();
const _0x1733fb = "zsoh",
  _0x4423d8 = require("request"),
  _0x680427 = require("fs"),
  _0x4dc095 = require("form-data"),
  _0x45311f = require("./utils");
let _0x5db988 = "",
  _0x25ba98 = "https://app.ohnews.cn/webChannels/invite?inviteCode=HT6RK9&tenantId=78&accountId=647addefa7fd3962fa8466a4",
  _0x2deb28 = "幻生提示：有错请在仓库建立issue，说明运行环境：青龙版本、机器是 本地机器、服务器 还是 手机面具模块；附上运行截图，谢谢",
  _0x489135 = "请在 配置文件 里添加 " + _0x1733fb + " 变量，具体配置请看脚本最上方说明\n注册地址：" + _0x25ba98 + "\n投稿？请建Issue 或者 +Q：3385445213";
const _0x6bd43f = Number.isInteger(_0x17c57d.isNode() ? process.env[_0x1733fb + "enabledNotify"] : _0x17c57d.getdata(_0x1733fb + "EnabledNotify")) || Number.isInteger(_0x17c57d.isNode() ? process.env.enabledNotify : _0x17c57d.getdata("enabledNotify")) || 1;
let _0x591081 = 0,
  _0x377ff9 = ["@", "\n"],
  _0x59bfe2 = (_0x17c57d.isNode() ? process.env[_0x1733fb] : _0x17c57d.getdata(_0x1733fb)) || "",
  _0x5df97a = ["1", 1, "true"]?.["includes"](_0x17c57d.isNode() ? process.env[_0x1733fb + "EnabledPostComment"] : _0x17c57d.getdata(_0x1733fb + "EnabledPostComment")) || false,
  _0x117527 = ["1", 1, "true"]?.["includes"](_0x17c57d.isNode() ? process.env[_0x1733fb + "EnabledForumPost"] : _0x17c57d.getdata(_0x1733fb + "EnabledForumPost")) || false,
  _0x1407cd = ["1", 1, "true"]?.["includes"](_0x17c57d.isNode() ? process.env[_0x1733fb + "EnabledPostCommentBy1Y"] : _0x17c57d.getdata(_0x1733fb + "EnabledPostCommentBy1Y")) || false,
  _0x5dee2b = ["1", 1, "true"]?.["includes"](_0x17c57d.isNode() ? process.env[_0x1733fb + "ForceLikeAndShare"] : _0x17c57d.getdata(_0x1733fb + "ForceLikeAndShare")) || false,
  _0x7bed49 = [],
  _0x1f446a = 0,
  _0x155877 = 0,
  _0x3d80fe = "HT6RK9",
  _0x4456e0 = "10032",
  _0x1b4c3d = 78,
  _0xb8814 = "vapp.tmuyun.com",
  _0x2932d6 = "请注意：已" + (_0x5df97a ? "开启" : "关闭") + " 对文章的评论功能； 已" + (_0x117527 ? "开启" : "关闭") + " 论坛发帖功能； 已" + (_0x1407cd ? "开启" : "关闭") + " 一言随机评论功能； 已" + (_0x1407cd ? "开启" : "关闭") + " 强制点赞/分享功能（强行点不一定能加分）",
  _0x3a19c3 = "63777162fe3fc118b09fab89",
  _0x3cdca6 = ["赞", "👍", "😄", "111", "支持", "点赞"],
  _0x1c3b90 = "5.0.0;00000000-6470-e940-ffff-ffffc3891f81;OPPO PBBM00;Android;9;Release",
  _0x55f123 = ["643fb17ae305b4705654755e", "643fb120e305b4705654755b", "643fb125e305b4705654755c", "643fafe2e305b47056547554"],
  _0x4c9130 = ["1", 1, "true"]?.["includes"](_0x17c57d.isNode() ? process.env[_0x1733fb + "OldConfigTranform"] : _0x17c57d.getdata(_0x1733fb + "OldConfigTranform")) || false,
  _0xc524cb = "",
  _0x79a0f7 = "";
async function _0x579794() {
  console.log("\n================== 用户登录 帐号数：[" + _0x7bed49?.["length"] + "]==================\n");
  let _0x4a8211 = [];
  for (let _0x195bd3 of _0x7bed49) {
    !_0x195bd3.sessionId ? (_0x195bd3.loadCache(), !_0x195bd3.valid ? _0x4a8211.push(await _0x195bd3.login()) : await _0x17c57d.wait(200)) : (_0x4a8211.push(await _0x195bd3.user_info()), await _0x17c57d.wait(200));
  }
  await Promise.all(_0x4a8211);
  _0x7bed49 = _0x7bed49?.["filter"](_0x441fff => _0x441fff?.["valid"]);
  if (!_0x7bed49?.["length"]) {
    console.log("\n无可用账号，停止运行\n");
    return;
  }
  console.log("\n================== 用户信息 帐号数：[" + _0x7bed49?.["length"] + "]==================\n");
  _0x4a8211 = [];
  for (let _0x389f51 of _0x7bed49) {
    _0x4a8211.push(await _0x389f51.task_tasklist("用户信息"));
    await _0x2d43c3(0.2 + Math.random() * 1);
    _0x4a8211.push(await _0x389f51.get_unread_msg());
  }
  await Promise.all(_0x4a8211);
  const _0x289c9f = _0x7bed49?.["filter"](_0x2baccd => _0x2baccd?.["jobList"]?.["find"](_0xf005ee => _0xf005ee?.["name"]?.["includes"]("签到") && _0xf005ee?.["frequency"] && _0xf005ee?.["frequency"] > _0xf005ee?.["finish_times"]));
  if (_0x289c9f?.["length"]) {
    console.log("\n================== 每日签到任务开始执行 待执行帐号数：[" + _0x289c9f?.["length"] + "]==================\n");
    _0x4a8211 = [];
    for (let _0x4cfaaa of _0x289c9f) {
      _0x4a8211.push(await _0x4cfaaa.task_sign("每日签到"));
      await _0x2d43c3(0.2 + Math.random() * 1);
    }
    await Promise.all(_0x4a8211);
  } else console.log("\n无签到任务 或 当前帐号都已签到过了，无需执行签到任务\n");
  const _0xc044a = _0x7bed49?.["filter"](_0x1a5d6a => _0x1a5d6a?.["jobList"]?.["find"](_0x3d8d8b => {
    return _0x3d8d8b?.["name"]?.["includes"]("帖子发布") && _0x3d8d8b?.["frequency"] && _0x3d8d8b?.["frequency"] > _0x3d8d8b?.["finish_times"] && _0x117527 || _0x3d8d8b?.["name"]?.["includes"]("帖子点赞") && _0x3d8d8b?.["frequency"] && _0x3d8d8b?.["frequency"] > _0x3d8d8b?.["finish_times"];
  }));
  if (_0xc044a?.["length"]) {
    console.log("\n================== 社区帖子相关任务开始执行 待执行帐号数：[" + _0xc044a?.["length"] + "]==================\n");
    _0x4a8211 = [];
    for (let _0x170f68 of _0xc044a) {
      _0x4a8211.push(await _0x170f68.task_forum_info("社区帖子列表"));
      await _0x2d43c3(0.2 + Math.random() * 1);
    }
    await Promise.all(_0x4a8211);
  } else console.log("\n无社区帖子相关任务 或 当前帐号都已做完了社区帖子任务，无需执行\n");
  await _0x2d43c3(0.2 + Math.random() * 1);
  const _0x8f7a7c = _0x7bed49?.["filter"](_0x17bbf7 => _0x17bbf7?.["jobList"]?.["find"](_0x4d07f1 => {
    return _0x4d07f1?.["name"]?.["includes"]("资讯评论") && _0x4d07f1?.["frequency"] > _0x4d07f1?.["finish_times"] && _0x5df97a || _0x4d07f1?.["name"]?.["includes"]("分享资讯") && _0x4d07f1?.["frequency"] && _0x4d07f1?.["frequency"] > _0x4d07f1?.["finish_times"] || _0x4d07f1?.["name"]?.["includes"]("资讯点赞") && _0x4d07f1?.["frequency"] && _0x4d07f1?.["frequency"] > _0x4d07f1?.["finish_times"] || _0x4d07f1?.["name"]?.["includes"]("资讯阅读") && _0x4d07f1?.["frequency"] && _0x4d07f1?.["frequency"] > _0x4d07f1?.["finish_times"];
  }));
  if (_0x8f7a7c?.["length"]) {
    console.log("\n================== 文章列表相关任务开始执行 待执行帐号数：[" + _0x8f7a7c?.["length"] + "]==================\n");
    _0x4a8211 = [];
    for (let _0x1c0f14 of _0x8f7a7c) {
      console.log("\n开始执行帐号[" + _0x1c0f14.index + "] 文章任务😄\n");
      _0x4a8211.push(await _0x1c0f14.task_articlelist("文章列表"));
      await _0x2d43c3(0.2 + Math.random() * 1);
    }
    await Promise.all(_0x4a8211);
  } else {
    console.log("\n无文章资讯任务 或 当前帐号都已做完了资讯任务，无需执行相关任务\n");
  }
  await _0x2d43c3(0.2 + Math.random() * 1);
  const _0x34f834 = _0x7bed49?.["filter"](_0x5495f3 => _0x5495f3?.["jobList"]?.["find"](_0x1a2f07 => {
    return _0x1a2f07?.["name"]?.["includes"]("本地服务") && _0x1a2f07?.["frequency"] && _0x1a2f07?.["frequency"] > _0x1a2f07?.["finish_times"];
  }));
  if (_0x34f834?.["length"]) {
    {
      console.log("\n================== 本地服务任务开始执行 待执行帐号数：[" + _0x34f834?.["length"] + "]==================\n");
      _0x4a8211 = [];
      for (let _0x18c1aa of _0x34f834) {
        {
          const _0x362474 = _0x18c1aa?.["jobList"]?.["find"](_0x244563 => {
            return _0x244563?.["name"]?.["includes"]("本地服务") && _0x244563?.["frequency"] && _0x244563?.["frequency"] > _0x244563?.["finish_times"];
          });
          for (let _0xe9a8c8 = 0; _0xe9a8c8 < _0x362474?.["frequency"] - _0x362474?.["finish_times"]; _0xe9a8c8++) {
            _0x4a8211.push(await _0x18c1aa.task_share("6", undefined, "本地服务"));
            await _0x2d43c3(1 + Math.random() * 1);
          }
        }
      }
      await Promise.all(_0x4a8211);
    }
  } else {
    console.log("\n无本地服务任务 或 当前帐号都已做完了本地服务任务，无需执行相关任务\n");
  }
  console.log("\n================== 删除历史评论任务开始执行 待执行帐号数：[" + _0x7bed49?.["length"] + "]==================\n");
  for (let _0x19240e of _0x7bed49) {
    await _0x19240e.get_comment_history();
    await _0x2d43c3(1 + Math.random() * 1);
  }
}
class _0x2b782f {
  ["valid"] = false;
  constructor(_0x239aea) {
    this.index = ++_0x1f446a;
    this.accountId = "";
    this.host = _0xb8814;
    this.hostname = "https://" + this.host;
    this.key = "FR*r!isE5W";
    const _0x385d1a = _0x55f123,
      _0x53c7e2 = Math.floor(Math.random() * _0x385d1a.length);
    this.artlistdata = _0x385d1a[_0x53c7e2];
    if (_0x239aea?.["length"] === 1) {
      if (_0x239aea[0]?.["includes"]("#")) _0x239aea = _0x239aea[0]?.["split"]("#");else _0x239aea[0]?.["includes"]("&") && (_0x239aea = _0x239aea[0]?.["split"]("&"));
    }
    _0x239aea[0]?.["length"] === 11 ? (this.account = _0x239aea[0], this.password = _0x239aea[1]) : _0x4c9130 ? (this.sessionId = _0x239aea[1], this.accountId = _0x239aea[0]) : (this.sessionId = _0x239aea[0], this.accountId = _0x239aea[1]);
  }
  ["loadCache"]() {
    let _0x9b7bf2 = _0x113dd3(_0x1733fb + "_config", this.account);
    if (_0x9b7bf2) {
      _0x9b7bf2 = JSON.parse(_0x9b7bf2);
      console.log("账号[" + this.index + "]从缓存读取成功 😄 ，其ID为： " + _0x9b7bf2?.["id"] + "，手机号为：" + this.account);
      this.accountId = _0x9b7bf2?.["id"];
      this.sessionId = _0x9b7bf2?.["sessionId"];
      this.valid = true;
      return;
    }
  }
  async ["txt_api"]() {
    try {
      {
        let _0x2611d2 = {
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
          _0xe311a0 = await _0x35d29f(_0x2611d2, "");
        if (_0xe311a0.id) {
          return _0xe311a0.hitokoto;
        } else {}
      }
    } catch (_0x33e422) {
      console.log(_0x33e422);
    }
  }
  async ["task_tasklist"](_0x3fc576) {
    let _0x73006 = "/api/user_mumber/numberCenter",
      _0x40c176 = _0x45311f.guid(),
      _0x1063b1 = _0x45311f.ts13(),
      _0x445ef8 = _0x73006 + "&&" + this.sessionId + "&&" + _0x40c176 + "&&" + _0x1063b1 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x14ffcd = _0x45311f.SHA256_Encrypt(_0x445ef8);
    try {
      {
        let _0x37fc59 = {
            "method": "GET",
            "url": "" + this.hostname + _0x73006 + "?is_new=1",
            "headers": {
              "X-SESSION-ID": "" + this.sessionId,
              "X-REQUEST-ID": _0x40c176,
              "X-TIMESTAMP": _0x1063b1,
              "X-SIGNATURE": _0x14ffcd,
              "X-TENANT-ID": _0x1b4c3d,
              "User-Agent": _0x1c3b90,
              "Cache-Control": "no-cache",
              "Host": this.host,
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            }
          },
          _0xa5595d = await _0x35d29f(_0x37fc59, _0x3fc576);
        if (_0xa5595d.code == 0) {
          !this.requestedUserInfo && (await this.user_info(), await _0x2d43c3(0.3));
          _0x17626b("账号[" + this.index + "],欢迎用户:[" + _0xa5595d.data.rst.nick_name + "],当前积分为[" + _0xa5595d.data.rst.total_integral + "]");
          _0xc524cb += "账号[" + this.index + "],欢迎用户:[" + _0xa5595d.data.rst.nick_name + "],当前积分为[" + _0xa5595d.data.rst.total_integral + "]\n";
          await _0x2d43c3(0.3);
          this.jobList = _0xa5595d.data.rst.user_task_list?.["map"](_0x472308 => {
            return {
              "name": _0x472308?.["name"],
              "finish_times": Number(_0x472308?.["finish_times"]),
              "frequency": Number(_0x472308?.["frequency"]),
              "integral": _0x472308?.["integral"],
              "member_task_type": _0x472308?.["member_task_type"]
            };
          });
          if (_0xa5595d?.["data"]?.["daily_sign_info"]?.["name"]?.["includes"]("签到")) {
            let _0x594ab = _0xa5595d?.["data"]?.["daily_sign_info"]?.["daily_sign_list"]?.["find"](_0x181a7b => _0x181a7b?.["current"])?.["signed"];
            this.jobList.push({
              "name": "每日签到",
              "finish_times": _0x594ab ? 1 : 0,
              "frequency": 1
            });
          }
          _0x17626b("账号[" + this.index + "],获取任务列表成功 😄 :");
          await _0x2d43c3(0.3);
          let _0x54a769 = "";
          await _0x2d43c3(0.2 + Math.random() * 1);
          for (let _0x199f52 = 0; _0x199f52 < this.jobList.length; _0x199f52++) {
            _0x54a769 += this.jobList[_0x199f52].name + "[" + this.jobList[_0x199f52].finish_times + "/" + this.jobList[_0x199f52].frequency + "]\n";
          }
          await _0x2d43c3(0.3);
          _0x17626b(_0x54a769);
        } else {
          _0x17626b("账号[" + this.index + "],获取任务列表:失败 🙁 了呢,原因：" + _0xa5595d?.["message"]);
          console.log(_0xa5595d);
        }
      }
    } catch (_0x1f8ff9) {
      console.log(_0x1f8ff9);
    }
  }
  async ["activity_login"](_0x5edef2) {
    try {
      let _0x409e21 = {
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
        _0x42822b = await _0x35d29f(_0x409e21, _0x5edef2, true),
        _0x1a22d7 = _0x42822b?.["body"];
      _0x1a22d7.status == 1 ? (this.authCookie = _0x42822b?.["rawHeaders"]?.["filter"](_0x5ac36d => _0x5ac36d?.["includes"]("path=/"))?.["join"](";"), _0x17626b("账号[" + this.index + "],授权活动成功 😄"), await this.activity_vote("投票")) : _0x17626b("账号[" + this.index + "],授权活动:失败 🙁 了呢,原因：" + JSON.stringify(_0x1a22d7));
    } catch (_0xdfd680) {
      console.log(_0xdfd680);
    }
  }
  async ["activity_vote"](_0x3b90ae) {
    try {
      {
        let _0xfc7b06 = {
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
          _0x2a07b1 = await _0x35d29f(_0xfc7b06, _0x3b90ae);
        _0x2a07b1.status == 1 ? (_0x17626b("账号[" + this.index + "],投票成功 😄"), await this.activity_draw("抽奖")) : (_0x17626b("账号[" + this.index + "],投票:失败 🙁 了呢,原因：" + _0x2a07b1?.["info"]), await this.activity_get_prize("读取奖品"));
      }
    } catch (_0x1e58a5) {
      console.log(_0x1e58a5);
    }
  }
  async ["activity_draw"](_0xab5184) {
    try {
      {
        let _0x3eb638 = {
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
          _0x3b6ef7 = await _0x35d29f(_0x3eb638, _0xab5184);
        if (_0x3b6ef7.status == 1) _0x17626b("账号[" + this.index + "],抽奖成功 😄：" + JSON.stringify(_0x3b6ef7));else {
          _0x17626b("账号[" + this.index + "],抽奖失败 🙁 了呢,原因：" + _0x3b6ef7?.["info"]);
        }
        await this.activity_get_prize("读取奖品");
      }
    } catch (_0x6e1f56) {
      console.log(_0x6e1f56);
    }
  }
  async ["activity_get_prize"](_0x3256c6) {
    try {
      {
        let _0x58d801 = {
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
          _0x591bd1 = await _0x35d29f(_0x58d801, _0x3256c6);
        if (_0x591bd1.status == 1) {
          {
            let _0x3d3a49 = "";
            for (let _0x160cee = 0; _0x160cee < _0x591bd1?.["data"]?.["length"]; _0x160cee++) {
              const _0x2937c2 = _0x591bd1?.["data"][_0x160cee];
              _0x3d3a49 += "\n奖品名称：" + _0x2937c2?.["title"] + "----" + (_0x2937c2?.["url"] || _0x2937c2?.["time"]) + "----" + (_0x2937c2?.["valid"] === "1" ? "未领取" : "已领取") + "----全部信息：" + JSON.stringify(_0x2937c2);
            }
            _0x17626b("账号[" + this.index + "],读取奖品成功 😄：" + (_0x3d3a49 || JSON.stringify(_0x591bd1?.["data"])));
          }
        } else _0x17626b("账号[" + this.index + "],读取中奖记录失败 🙁 了呢,原因：" + _0x591bd1?.["info"]);
      }
    } catch (_0xc9e8ab) {
      console.log(_0xc9e8ab);
    }
  }
  async ["task_sign"](_0x3a10bd) {
    let _0x2adffb = "/api/user_mumber/sign",
      _0x328a92 = _0x45311f.guid(),
      _0x54127f = _0x45311f.ts13(),
      _0x4fd432 = _0x2adffb + "&&" + this.sessionId + "&&" + _0x328a92 + "&&" + _0x54127f + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x49549c = _0x45311f.SHA256_Encrypt(_0x4fd432);
    try {
      let _0x3cd50a = {
          "method": "GET",
          "url": "" + this.hostname + _0x2adffb,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x328a92,
            "X-TIMESTAMP": _0x54127f,
            "X-SIGNATURE": _0x49549c,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0xf519c = await _0x35d29f(_0x3cd50a, _0x3a10bd);
      _0xf519c.code == 0 ? _0x17626b("账号[" + this.index + "],签到成功 😄 [" + _0xf519c.data.signCommonInfo.date + "],获得积分:[" + _0xf519c.data.signExperience + "]") : (_0x17626b("账号[" + this.index + "],签到:失败 🙁 了呢,原因：" + _0xf519c?.["message"]), console.log(_0xf519c));
    } catch (_0x564abb) {
      console.log(_0x564abb);
    }
  }
  async ["task_forum_info"](_0x462d47) {
    let _0x2c43dd = "/api/forum/forum_list",
      _0xe7ba38 = _0x45311f.guid(),
      _0xb1cfd9 = _0x45311f.ts13(),
      _0x2277cf = _0x2c43dd + "&&" + this.sessionId + "&&" + _0xe7ba38 + "&&" + _0xb1cfd9 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x153ad5 = _0x45311f.SHA256_Encrypt(_0x2277cf);
    try {
      let _0x5b1f78 = {
          "method": "GET",
          "url": "" + this.hostname + _0x2c43dd + ("?tenantId=" + _0x1b4c3d),
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0xe7ba38,
            "X-TIMESTAMP": _0xb1cfd9,
            "X-SIGNATURE": _0x153ad5,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0xcd99ff = await _0x35d29f(_0x5b1f78, _0x462d47);
      if (_0xcd99ff.code == 0) {
        const _0x390a59 = _0xcd99ff?.["data"]?.["forum_list"]?.["length"] ? _0xcd99ff?.["data"]?.["forum_list"][0]?.["id"] : undefined;
        if (_0x390a59) _0x17626b("账号[" + this.index + "],获取社区信息成功 😄 ，准备开始获取相关列表"), await this.task_forum_list(_0x390a59);else {
          _0x17626b("账号[" + this.index + "],获取社区为空 🙁 ，跳过社区任务");
        }
      } else _0x17626b("账号[" + this.index + "],获取社区信息:失败 🙁 了呢,原因：" + _0xcd99ff?.["message"]), console.log(_0xcd99ff);
    } catch (_0x51e43f) {
      console.log(_0x51e43f);
    }
  }
  async ["task_forum_list"](_0x59f47b) {
    let _0x144da5 = "/api/forum/thread_list",
      _0x1c9c17 = _0x45311f.guid(),
      _0xe6dc4 = _0x45311f.ts13(),
      _0x352dfb = _0x144da5 + "&&" + this.sessionId + "&&" + _0x1c9c17 + "&&" + _0xe6dc4 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x46eebf = _0x45311f.SHA256_Encrypt(_0x352dfb);
    try {
      let _0x190d72 = {
          "method": "GET",
          "url": "" + this.hostname + _0x144da5 + ("?forum_id=" + _0x59f47b),
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x1c9c17,
            "X-TIMESTAMP": _0xe6dc4,
            "X-SIGNATURE": _0x46eebf,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x1f79ae = await _0x35d29f(_0x190d72, "获取帖子");
      if (_0x1f79ae.code == 0) for (let _0x2bce6e = 0; _0x2bce6e < _0x1f79ae.data.thread_list?.["length"]; _0x2bce6e++) {
        if (!this?.["jobList"]?.["find"](_0x242322 => {
          return _0x242322?.["name"]?.["includes"]("帖子发布") && _0x242322?.["frequency"] > _0x242322?.["finish_times"] && _0x117527 || _0x242322?.["name"]?.["includes"]("帖子点赞") && _0x242322?.["frequency"] > _0x242322?.["finish_times"];
        })) {
          {
            _0x17626b("账号[" + this.index + "],社区任务已完成，跳过-----");
            break;
          }
        }
        _0x17626b("账号[" + this.index + "],对帖子[" + _0x1f79ae.data.thread_list[_0x2bce6e].id + "]操作-----");
        await _0x2d43c3(0.3 + Math.random() * 1);
        this?.["jobList"]?.["find"](_0x53e417 => {
          return _0x53e417?.["name"]?.["includes"]("帖子点赞") && _0x53e417?.["frequency"] > _0x53e417?.["finish_times"];
        }) ? (_0x1f79ae.data.thread_list[_0x2bce6e].already_liked ? _0x17626b("账号[" + this.index + "],之前已经对帖子[" + _0x1f79ae.data.thread_list[_0x2bce6e].id + "]点赞过，不能再次点赞") : await this.task_forum_like(_0x1f79ae.data.thread_list[_0x2bce6e].id), await _0x2d43c3(1 + Math.random() * 1)) : _0x17626b("账号[" + this.index + "],无需对帖子点赞");
        this?.["jobList"]?.["find"](_0x47eae3 => {
          return _0x47eae3?.["name"]?.["includes"]("帖子发布") && _0x47eae3?.["frequency"] > _0x47eae3?.["finish_times"] && _0x117527;
        }) ? (await this.task_forum_post(_0x59f47b), await _0x2d43c3(1 + Math.random() * 1)) : _0x17626b("账号[" + this.index + "],无需发布帖子，可能是 已执行完毕该任务，或者 未开启该任务");
      } else _0x17626b("账号[" + this.index + "],获取社区帖子:失败 🙁 了呢,原因：" + _0x1f79ae?.["message"]), console.log(_0x1f79ae);
    } catch (_0x1c3c7b) {
      console.log(_0x1c3c7b);
    }
  }
  async ["task_forum_like"](_0x23310c) {
    let _0xabd6d1 = "/api/forum/like",
      _0x19cac0 = _0x45311f.guid(),
      _0x52ac51 = _0x45311f.ts13(),
      _0x13d77d = _0xabd6d1 + "&&" + this.sessionId + "&&" + _0x19cac0 + "&&" + _0x52ac51 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x2f4e79 = _0x45311f.SHA256_Encrypt(_0x13d77d);
    try {
      let _0x1be198 = _0x4dc095();
      _0x1be198.append("target_type", "1");
      _0x1be198.append("target_id", _0x23310c);
      let _0x275ab0 = {
        "method": "POST",
        "url": "" + this.hostname + _0xabd6d1,
        "headers": {
          "X-SESSION-ID": "" + this.sessionId,
          "X-REQUEST-ID": _0x19cac0,
          "X-TIMESTAMP": _0x52ac51,
          "X-SIGNATURE": _0x2f4e79,
          "X-TENANT-ID": _0x1b4c3d,
          "User-Agent": _0x1c3b90,
          "Cache-Control": "no-cache",
          "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryTDSOjpwy3A5ypRAo",
          "Host": this.host,
          "Connection": "Keep-Alive",
          "Accept": "*/*",
          "X-ACCOUNT-ID": this.accountId
        },
        "body": _0x1be198
      };
      _0x275ab0.headers["Content-Type"] = "multipart/form-data; boundary=" + _0x1be198.getBoundary();
      let _0x4819c6 = await _0x35d29f(_0x275ab0, "点赞帖子");
      if (_0x4819c6.code == 0) {
        {
          const _0x5e390f = this?.["jobList"]?.["find"](_0x4b30da => {
            return _0x4b30da?.["name"]?.["includes"]("帖子点赞") && _0x4b30da?.["frequency"] > _0x4b30da?.["finish_times"];
          });
          _0x5e390f.finish_times++;
          _0x17626b("账号[" + this.index + "],点赞帖子成功 😄 :[" + _0x23310c + "]");
        }
      } else _0x17626b("账号[" + this.index + "],点赞帖子:失败 🙁 了呢,原因：" + _0x4819c6?.["message"]), console.log(_0x4819c6);
    } catch (_0x381834) {
      console.log(_0x381834);
    }
  }
  async ["task_forum_post"](_0x4c3e91) {
    let _0x1d11a1 = "/api/forum/post_thread",
      _0x2719d7 = _0x45311f.guid(),
      _0x4ce407 = _0x45311f.ts13(),
      _0x59845a = _0x1d11a1 + "&&" + this.sessionId + "&&" + _0x2719d7 + "&&" + _0x4ce407 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x19f141 = _0x45311f.SHA256_Encrypt(_0x59845a);
    try {
      {
        let _0x4528e4 = _0x4dc095();
        _0x4528e4.append("forum_id", _0x4c3e91);
        _0x4528e4.append("title", "签到");
        _0x4528e4.append("content", "今日打卡");
        _0x4528e4.append("attachments", "");
        _0x4528e4.append("location_name", "{}");
        let _0x202fb6 = {
          "method": "POST",
          "url": "" + this.hostname + _0x1d11a1,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x2719d7,
            "X-TIMESTAMP": _0x4ce407,
            "X-SIGNATURE": _0x19f141,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryMdIuuLGEa01BfEzM",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "Accept": "*/*",
            "X-ACCOUNT-ID": this.accountId
          },
          "body": _0x4528e4
        };
        _0x202fb6.headers["Content-Type"] = "multipart/form-data; boundary=" + _0x4528e4.getBoundary();
        let _0x33ee6a = await _0x35d29f(_0x202fb6, "发布帖子");
        if (_0x33ee6a.code == 0) {
          const _0x3e806a = this?.["jobList"]?.["find"](_0x52f0cf => {
            return _0x52f0cf?.["name"]?.["includes"]("帖子发布") && _0x52f0cf?.["frequency"] > _0x52f0cf?.["finish_times"];
          });
          _0x3e806a.finish_times++;
          _0x17626b("账号[" + this.index + "],发布帖子成功 😄 :[" + _0x4c3e91 + "]");
          await this.deleteForumPost(_0x33ee6a?.["data"]?.["thread_id"]);
        } else _0x17626b("账号[" + this.index + "],发布帖子:失败 🙁 了呢,原因：" + _0x33ee6a?.["message"]), console.log(_0x33ee6a);
      }
    } catch (_0x351add) {
      console.log(_0x351add);
    }
  }
  async ["deleteForumPost"](_0x3ed9d2) {
    let _0x1051a5 = "/api/forum/delete_thread",
      _0x255eed = _0x45311f.guid(),
      _0xd5db11 = _0x45311f.ts13(),
      _0x33c142 = _0x1051a5 + "&&" + this.sessionId + "&&" + _0x255eed + "&&" + _0xd5db11 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x184fcd = _0x45311f.SHA256_Encrypt(_0x33c142);
    try {
      let _0x5c11e0 = _0x4dc095();
      _0x5c11e0.append("thread_id", _0x3ed9d2);
      let _0x54a5c5 = {
        "method": "POST",
        "url": "" + this.hostname + _0x1051a5,
        "headers": {
          "X-SESSION-ID": "" + this.sessionId,
          "X-REQUEST-ID": _0x255eed,
          "X-TIMESTAMP": _0xd5db11,
          "X-SIGNATURE": _0x184fcd,
          "X-TENANT-ID": _0x1b4c3d,
          "User-Agent": _0x1c3b90,
          "Cache-Control": "no-cache",
          "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryi1cQvxsAzoTagcpx",
          "Host": this.host,
          "Connection": "Keep-Alive",
          "Accept": "*/*",
          "X-ACCOUNT-ID": this.accountId
        },
        "body": _0x5c11e0
      };
      _0x54a5c5.headers["Content-Type"] = "multipart/form-data; boundary=" + _0x5c11e0.getBoundary();
      let _0x56b2f9 = await _0x35d29f(_0x54a5c5, "删除帖子");
      _0x56b2f9.code == 0 ? _0x17626b("账号[" + this.index + "],删除帖子成功 😄 :[" + _0x3ed9d2 + "]") : (_0x17626b("账号[" + this.index + "],删除帖子:失败 🙁 了呢,原因：" + _0x56b2f9?.["message"]), console.log(_0x56b2f9));
    } catch (_0x1c8521) {
      console.log(_0x1c8521);
    }
  }
  async ["task_articlelist"](_0x11f367) {
    let _0x4046b2 = "/api/article/channel_list",
      _0x2e50be = _0x45311f.guid(),
      _0x21950c = _0x45311f.ts13(),
      _0x149659 = _0x4046b2 + "&&" + this.sessionId + "&&" + _0x2e50be + "&&" + _0x21950c + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x3fa280 = _0x45311f.SHA256_Encrypt(_0x149659);
    try {
      let _0x5d92fb = {
          "method": "GET",
          "url": "" + this.hostname + _0x4046b2 + ("?channel_id=" + this.artlistdata + "&isDiangHao=false&is_new=" + (Math.random() >= 0.5) + "&list_count=" + Math.floor(Math.random() * 10) + "&size=10"),
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x2e50be,
            "X-TIMESTAMP": _0x21950c,
            "X-SIGNATURE": _0x3fa280,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x25c784 = await _0x35d29f(_0x5d92fb, _0x11f367);
      if (_0x25c784.code == 0) {
        {
          let _0x4dd447 = false;
          for (let _0x44f383 = 0; _0x44f383 < _0x25c784.data.article_list?.["length"]; _0x44f383++) {
            if (!this?.["jobList"]?.["find"](_0x1a88eb => {
              return _0x1a88eb?.["name"]?.["includes"]("资讯评论") && _0x1a88eb?.["frequency"] > _0x1a88eb?.["finish_times"] && _0x5df97a || _0x1a88eb?.["name"]?.["includes"]("分享资讯") && _0x1a88eb?.["frequency"] > _0x1a88eb?.["finish_times"] || _0x1a88eb?.["name"]?.["includes"]("资讯点赞") && _0x1a88eb?.["frequency"] > _0x1a88eb?.["finish_times"] || _0x1a88eb?.["name"]?.["includes"]("资讯阅读") && _0x1a88eb?.["frequency"] > _0x1a88eb?.["finish_times"];
            })) {
              _0x17626b("账号[" + this.index + "],文章任务已完成，跳过后续文章-----");
              break;
            }
            await this.task_comment_pre();
            await _0x2d43c3(1 + Math.random() * 1);
            _0x17626b("账号[" + this.index + "],对 第" + (_0x44f383 + 1) + "篇 文章[" + _0x25c784.data.article_list[_0x44f383].id + "]操作-----");
            let _0x56b01d = _0x25c784.data.article_list[_0x44f383].id;
            await this.task_read(_0x56b01d);
            await _0x2d43c3(1 + Math.random() * 1);
            if (this?.["jobList"]?.["find"](_0x18fc3a => {
              return _0x18fc3a?.["name"]?.["includes"]("资讯点赞") && _0x18fc3a?.["frequency"] > _0x18fc3a?.["finish_times"];
            })) {
              if (_0x25c784.data.article_list[_0x44f383].liked) _0x17626b("账号[" + this.index + "],之前已经对资讯[" + _0x56b01d + "]点赞过，不能再次点赞");else !_0x25c784.data.article_list[_0x44f383].like_enabled && !_0x5dee2b ? _0x17626b("账号[" + this.index + "],资讯[" + _0x56b01d + "]未开启点赞功能，无法进行点赞") : await this.task_like(_0x56b01d);
              await _0x2d43c3(1 + Math.random() * 1);
            }
            if (!_0x4dd447) {
              if (_0x5df97a && !this.commentError && this?.["jobList"]?.["find"](_0x3960d2 => {
                return _0x3960d2?.["name"]?.["includes"]("资讯评论") && _0x3960d2?.["frequency"] > _0x3960d2?.["finish_times"];
              })) await this.task_comment(_0x56b01d), await _0x2d43c3(2 + Math.random() * 1);else {
                if (this.commentError) {
                  _0x17626b("账号[" + this.index + "],评论文章遇见了一些问题 🙁 ，暂无解决方法，即将跳过后续评论，如果您有解决方法，欢迎提供，错误信息：该篇新闻不支持评论【评论失败，请重新进入当前页面！】");
                  _0x4dd447 = true;
                }
              }
            } else {
              if (!this?.["jobList"]?.["find"](_0x1e8170 => {
                return _0x1e8170?.["name"]?.["includes"]("分享资讯") && _0x1e8170?.["frequency"] > _0x1e8170?.["finish_times"] || _0x1e8170?.["name"]?.["includes"]("资讯点赞") && _0x1e8170?.["frequency"] > _0x1e8170?.["finish_times"] || _0x1e8170?.["name"]?.["includes"]("资讯阅读") && _0x1e8170?.["frequency"] > _0x1e8170?.["finish_times"];
              })) {
                break;
              }
            }
            if (this?.["jobList"]?.["find"](_0x1c97fd => {
              return _0x1c97fd?.["name"]?.["includes"]("分享资讯") && _0x1c97fd?.["frequency"] > _0x1c97fd?.["finish_times"];
            })) {
              if (!_0x25c784.data.article_list[_0x44f383].share_enabled && !_0x5dee2b) _0x17626b("账号[" + this.index + "],文章[" + _0x56b01d + "]未开启分享功能，无法进行分享");else {
                await this.task_share("3", _0x56b01d, "分享");
              }
            }
          }
        }
      } else _0x17626b("账号[" + this.index + "],获取文章:失败 🙁 了呢,原因：" + _0x25c784?.["message"]), console.log(_0x25c784);
    } catch (_0x2a42ad) {
      console.log(_0x2a42ad);
    }
  }
  async ["get_comment_history"](_0x4560e4) {
    let _0x5f2e61 = "/api/account_comment/comment_list",
      _0x3814b2 = _0x45311f.guid(),
      _0x14e7c1 = _0x45311f.ts13(),
      _0x513c7e = _0x5f2e61 + "&&" + this.sessionId + "&&" + _0x3814b2 + "&&" + _0x14e7c1 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x12f6f5 = _0x45311f.SHA256_Encrypt(_0x513c7e);
    try {
      let _0x58b242 = {
          "method": "GET",
          "url": "" + this.hostname + _0x5f2e61 + "?size=999",
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x3814b2,
            "X-TIMESTAMP": _0x14e7c1,
            "X-SIGNATURE": _0x12f6f5,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x3d6894 = await _0x35d29f(_0x58b242, _0x4560e4);
      if (_0x3d6894.code == 0) {
        let _0x502fdd = _0x3d6894.data.comment_list?.["length"];
        for (let _0x8d0880 = 0; _0x8d0880 < _0x3d6894.data.comment_list?.["length"]; _0x8d0880++) {
          {
            _0x17626b("账号[" + this.index + "],对 第" + (_0x8d0880 + 1) + "个 评论[" + _0x3d6894.data.comment_list[_0x8d0880].id + "]删除，删除总数量：" + _0x3d6894.data.comment_list?.["length"] + "，待删除：" + _0x502fdd + " 条-----");
            let _0xc09235 = _0x3d6894.data.comment_list[_0x8d0880].id;
            await this.deleteComment(_0xc09235);
            _0x502fdd--;
            await _0x2d43c3(1 + Math.random() * 1);
          }
        }
      } else _0x17626b("账号[" + this.index + "],删除评论:失败 🙁 了呢,原因：" + _0x3d6894?.["message"]), console.log(_0x3d6894);
    } catch (_0x230bd3) {
      console.log(_0x230bd3);
    }
  }
  async ["task_read"](_0x29995c) {
    let _0x1e676a = "/api/article/detail",
      _0x1bfd75 = _0x45311f.guid(),
      _0x376f31 = _0x45311f.ts13(),
      _0x377897 = _0x1e676a + "&&" + this.sessionId + "&&" + _0x1bfd75 + "&&" + _0x376f31 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x293f38 = _0x45311f.SHA256_Encrypt(_0x377897);
    try {
      let _0x166c6f = {
          "method": "GET",
          "url": "" + this.hostname + _0x1e676a + "?id=" + _0x29995c,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x1bfd75,
            "X-TIMESTAMP": _0x376f31,
            "X-SIGNATURE": _0x293f38,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x4c7436 = await _0x35d29f(_0x166c6f, "阅读文章");
      if (_0x4c7436.code == 0) {
        {
          const _0x4f0dbb = this?.["jobList"]?.["find"](_0x2fa8ee => {
            return _0x2fa8ee?.["name"]?.["includes"]("资讯阅读") && _0x2fa8ee?.["frequency"] > _0x2fa8ee?.["finish_times"];
          });
          _0x4f0dbb && _0x4f0dbb.finish_times++;
          _0x17626b("账号[" + this.index + "],阅读文章成功 😄 :[" + _0x4c7436.data.article.id + "]");
        }
      } else _0x17626b("账号[" + this.index + "],阅读文章:失败 🙁 了呢,原因：" + _0x4c7436?.["message"]);
    } catch (_0xfc44b1) {
      console.log(_0xfc44b1);
    }
  }
  async ["task_like"](_0x3c614f) {
    let _0x4fdb26 = "/api/favorite/like",
      _0x31bb42 = _0x45311f.guid(),
      _0x1cef7a = _0x45311f.ts13(),
      _0xd75a29 = _0x4fdb26 + "&&" + this.sessionId + "&&" + _0x31bb42 + "&&" + _0x1cef7a + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x59c093 = _0x45311f.SHA256_Encrypt(_0xd75a29);
    try {
      {
        let _0x16ee45 = {
            "method": "POST",
            "url": "" + this.hostname + _0x4fdb26,
            "headers": {
              "X-SESSION-ID": "" + this.sessionId,
              "X-REQUEST-ID": _0x31bb42,
              "X-TIMESTAMP": _0x1cef7a,
              "X-SIGNATURE": _0x59c093,
              "X-TENANT-ID": _0x1b4c3d,
              "User-Agent": _0x1c3b90,
              "Cache-Control": "no-cache",
              "Content-Type": "application/x-www-form-urlencoded",
              "Host": this.host,
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            },
            "form": {
              "action": "true",
              "id": _0x3c614f
            }
          },
          _0x6cfe30 = await _0x35d29f(_0x16ee45, "点赞文章");
        if (_0x6cfe30.code == 0) {
          const _0x270988 = this?.["jobList"]?.["find"](_0x42ee57 => {
            return _0x42ee57?.["name"]?.["includes"]("资讯点赞") && _0x42ee57?.["frequency"] > _0x42ee57?.["finish_times"];
          });
          _0x270988.finish_times++;
          _0x17626b("账号[" + this.index + "],点赞文章成功 😄 :[" + _0x3c614f + "]");
        } else _0x17626b("账号[" + this.index + "],用户查询:失败 🙁 了呢,原因：" + _0x6cfe30?.["message"]), console.log(_0x6cfe30);
      }
    } catch (_0x32fed2) {
      console.log(_0x32fed2);
    }
  }
  async ["RSA_Encrypt"](_0x63577a) {
    const _0xdb25ec = "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD6XO7e9YeAOs+cFqwa7ETJ+WXizPqQeXv68i5vqw9pFREsrqiBTRcg7wB0RIp3rJkDpaeVJLsZqYm5TW7FWx/iOiXFc+zCPvaKZric2dXCw27EvlH5rq+zwIPDAJHGAfnn1nmQH7wR3PCatEIb8pz5GFlTHMlluw4ZYmnOwg+thwIDAQAB\n-----END PUBLIC KEY-----",
      _0x46c77e = _0x45311f.RSA_Encrypt(_0x63577a, _0xdb25ec);
    return _0x46c77e;
  }
  async ["loginByCode"](_0x803d9e, _0x3ee31c) {
    try {
      let _0x53dccc = "/api/zbtxz/login",
        _0x4ed9a7 = _0x45311f.guid(),
        _0x13ce3a = _0x45311f.ts13(),
        _0x41abf0 = _0x53dccc + "&&" + (this.sessionId || _0x803d9e) + "&&" + _0x4ed9a7 + "&&" + _0x13ce3a + "&&" + this.key + "&&" + _0x1b4c3d,
        _0x39ffc0 = _0x45311f.SHA256_Encrypt(_0x41abf0),
        _0x5875d1 = {
          "method": "POST",
          "url": "" + this.hostname + _0x53dccc,
          "headers": {
            "X-SESSION-ID": "" + (this.sessionId || _0x803d9e),
            "X-REQUEST-ID": _0x4ed9a7,
            "X-TIMESTAMP": _0x13ce3a,
            "X-SIGNATURE": _0x39ffc0,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive"
          },
          "form": "code=" + _0x3ee31c
        },
        _0x3394f5 = await _0x35d29f(_0x5875d1, "取Token");
      if (_0x3394f5.code == 0) {
        this.valid = true;
        this.sessionId = _0x3394f5.data.session.id;
        this.accountId = _0x3394f5.data.session.account || _0x3394f5.data.session.account_id;
        _0x5ee65e(_0x1733fb + "_config", this.account, JSON.stringify({
          "id": this.accountId,
          "sessionId": this.sessionId
        }));
        _0x17626b("账号[" + this.index + "],取Token成功 😄 ");
      } else this.valid = false, _0x17626b("账号[" + this.index + "],取Token:失败 🙁 了呢,原因：" + _0x3394f5?.["message"]), console.log(_0x3394f5);
    } catch (_0x15e7ce) {
      console.log(_0x15e7ce);
    }
  }
  async ["loginInit"](_0x3ba070) {
    try {
      const _0x2b8fb5 = "";
      let _0x5e807f = "/api/account/init",
        _0x1408ed = _0x45311f.guid(),
        _0x2b4be9 = _0x45311f.ts13(),
        _0x97390f = _0x5e807f + "&&" + _0x1408ed + "&&" + _0x2b4be9 + "&&" + this.key + "&&" + _0x1b4c3d,
        _0x123687 = _0x45311f.SHA256_Encrypt(_0x97390f),
        _0xbac8ea = {
          "method": "POST",
          "url": "" + this.hostname + _0x5e807f,
          "headers": {
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-SIGNATURE": _0x123687,
            "X-REQUEST-ID": _0x1408ed,
            "Content-Length": _0x2b8fb5?.["length"],
            "X-SESSION-ID": "",
            "X-TENANT-ID": _0x1b4c3d,
            "X-TIMESTAMP": _0x2b4be9
          },
          "form": _0x2b8fb5
        };
      this.authCookie && (_0xbac8ea.headers.Cookie = this.authCookie);
      let _0x3fda3c = await _0x35d29f(_0xbac8ea, "登录初始化");
      _0x3fda3c.code == 0 ? (_0x17626b("账号[" + this.index + "],登录初始化成功 😄 "), _0x79a0f7 = _0x3fda3c.data.session.id, await this.loginByCode(_0x3fda3c.data.session.id, _0x3ba070)) : (this.valid = false, _0x17626b("账号[" + this.index + "],登录初始化:失败 🙁 了呢,原因：" + _0x3fda3c?.["message"]));
    } catch (_0x538e7b) {
      console.log(_0x538e7b);
    }
  }
  async ["login"]() {
    let _0x59febd = "/web/oauth/credential_auth",
      _0x3a1713 = _0x45311f.guid(),
      _0x582aff = _0x45311f.ts13(),
      _0x1be8de = _0x59febd + "&&" + _0x3a1713 + "&&" + _0x582aff + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x4d7d4c = _0x45311f.SHA256_Encrypt(_0x1be8de);
    try {
      {
        let _0x66b702 = {
          "method": "POST",
          "url": "https://passport.tmuyun.com/web/oauth/credential_auth",
          "headers": {
            "X-TIMESTAMP": _0x582aff,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "passport.tmuyun.com",
            "Connection": "Keep-Alive",
            "X-SIGNATURE": _0x4d7d4c,
            "X-REQUEST-ID": _0x3a1713
          },
          "form": "client_id=" + (_0x4456e0 || "10001") + "&password=" + encodeURIComponent(await this.RSA_Encrypt(this.password)) + "&phone_number=" + this.account
        };
        if (this.authCookie) {
          _0x66b702.headers.Cookie = this.authCookie;
        }
        let _0x6e6b3 = await _0x35d29f(_0x66b702, "登录");
        if (_0x6e6b3.code == 0) {
          _0x17626b("账号[" + this.index + "],登录成功 😄 ");
          !_0x79a0f7 ? await this.loginInit(_0x6e6b3.data.authorization_code.code) : await this.loginByCode(_0x79a0f7, _0x6e6b3.data.authorization_code.code);
        } else this.valid = false, _0x17626b("账号[" + this.index + "],登录:失败 🙁 了呢,原因：" + _0x6e6b3?.["message"]), console.log(_0x6e6b3);
      }
    } catch (_0x5ee8df) {
      console.log(_0x5ee8df);
    }
  }
  async ["app_start"]() {
    let _0x3572b9 = "/api/app_start_page/list/new",
      _0x5b8166 = _0x45311f.guid(),
      _0x182c4a = _0x45311f.ts13(),
      _0x25ebad = _0x3572b9 + "&&" + _0x3a19c3 + "&&" + _0x5b8166 + "&&" + _0x182c4a + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x240b03 = _0x45311f.SHA256_Encrypt(_0x25ebad);
    try {
      let _0x3a8ada = {
          "method": "GET",
          "url": "" + this.hostname + _0x3572b9 + "?height=2206&width=1080",
          "headers": {
            "X-SESSION-ID": "" + _0x3a19c3,
            "X-REQUEST-ID": _0x5b8166,
            "X-TIMESTAMP": _0x182c4a,
            "X-SIGNATURE": _0x240b03,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x3f703c = await _0x35d29f(_0x3a8ada, "App启动中");
      if (_0x3f703c.code == 0) {
        _0x17626b("账号[" + this.index + "],App启动成功 😄 ");
      } else {
        _0x17626b("账号[" + this.index + "],App启动:失败 🙁 了呢,原因：" + _0x3f703c?.["message"]);
      }
    } catch (_0x4bf8b2) {
      console.log(_0x4bf8b2);
    }
  }
  async ["web_start"]() {
    let _0x3bd1f3 = "/web/init",
      _0x4b5e76 = _0x45311f.guid(),
      _0x162942 = _0x45311f.ts13(),
      _0x2886dc = _0x3bd1f3 + "&&" + _0x3a19c3 + "&&" + _0x4b5e76 + "&&" + _0x162942 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x5f2a56 = _0x45311f.SHA256_Encrypt(_0x2886dc);
    try {
      {
        let _0x1ab1f1 = {
            "method": "GET",
            "url": "https://passport.tmuyun.com/web/init?client_id=" + _0x4456e0,
            "headers": {
              "X-SESSION-ID": "" + _0x3a19c3,
              "X-REQUEST-ID": _0x4b5e76,
              "X-TIMESTAMP": _0x162942,
              "X-SIGNATURE": _0x5f2a56,
              "X-TENANT-ID": _0x1b4c3d,
              "User-Agent": _0x1c3b90,
              "Cache-Control": "no-cache",
              "Content-Type": "application/x-www-form-urlencoded",
              "Host": "passport.tmuyun.com",
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            }
          },
          _0x41043d = await _0x35d29f(_0x1ab1f1, "Web初始化中", true),
          _0x3c78b2 = _0x41043d?.["body"];
        if (_0x3c78b2.code == 0) {
          let _0xe89fa8 = _0x41043d?.["rawHeaders"]?.["find"](_0x51dbfe => _0x51dbfe?.["includes"]("SESSION"));
          _0xe89fa8 && (this.authCookie = _0xe89fa8);
          _0x17626b("账号[" + this.index + "],Web初始化成功 😄 ");
        } else _0x17626b("账号[" + this.index + "],Web初始化:失败 🙁 了呢,原因：" + _0x3c78b2?.["message"]);
      }
    } catch (_0x2801ce) {
      console.log(_0x2801ce);
    }
  }
  async ["iframe_start"]() {
    let _0x43b68b = "/api/bullet_frame/detail",
      _0x24fc42 = _0x45311f.guid(),
      _0x62f314 = _0x45311f.ts13(),
      _0x4687e4 = _0x43b68b + "&&" + _0x3a19c3 + "&&" + _0x24fc42 + "&&" + _0x62f314 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x2bff5b = _0x45311f.SHA256_Encrypt(_0x4687e4);
    try {
      let _0x3574d9 = {
          "method": "GET",
          "url": "" + this.hostname + _0x43b68b,
          "headers": {
            "X-SESSION-ID": "" + _0x3a19c3,
            "X-REQUEST-ID": _0x24fc42,
            "X-TIMESTAMP": _0x62f314,
            "X-SIGNATURE": _0x2bff5b,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x3a118f = await _0x35d29f(_0x3574d9, "启动WebView中");
      _0x3a118f.code == 0 ? _0x17626b("账号[" + this.index + "],启动WebView成功 😄 ") : _0x17626b("账号[" + this.index + "],启动WebView:失败 🙁 了呢,原因：" + _0x3a118f?.["message"]);
    } catch (_0x3e30b8) {
      console.log(_0x3e30b8);
    }
  }
  async ["get_app_version"]() {
    let _0x137867 = "/api/app_version/detail",
      _0x30eff3 = _0x45311f.guid(),
      _0x144bc9 = _0x45311f.ts13(),
      _0x53ac0e = _0x137867 + "&&" + _0x3a19c3 + "&&" + _0x30eff3 + "&&" + _0x144bc9 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x2fb464 = _0x45311f.SHA256_Encrypt(_0x53ac0e);
    try {
      let _0x56129e = {
          "method": "GET",
          "url": "" + this.hostname + _0x137867,
          "headers": {
            "X-SESSION-ID": "" + _0x3a19c3,
            "X-REQUEST-ID": _0x30eff3,
            "X-TIMESTAMP": _0x144bc9,
            "X-SIGNATURE": _0x2fb464,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive"
          }
        },
        _0x44f5f9 = await _0x35d29f(_0x56129e, "获取版本信息中");
      _0x44f5f9.code == 0 ? _0x17626b("账号[" + this.index + "],获取版本信息成功 😄 ") : _0x17626b("账号[" + this.index + "],获取版本信息:失败 🙁 了呢,原因：" + _0x44f5f9?.["message"]);
    } catch (_0x5d20a8) {
      console.log(_0x5d20a8);
    }
  }
  async ["config_get"]() {
    let _0x553858 = "/api/app_version_customize_config/mine",
      _0x2283cf = _0x45311f.guid(),
      _0x50cb4a = _0x45311f.ts13(),
      _0x49822b = _0x553858 + "&&" + _0x3a19c3 + "&&" + _0x2283cf + "&&" + _0x50cb4a + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x2a6a47 = _0x45311f.SHA256_Encrypt(_0x49822b);
    try {
      let _0x1d89ad = {
          "method": "GET",
          "url": "" + this.hostname + _0x553858,
          "headers": {
            "X-SESSION-ID": "" + _0x3a19c3,
            "X-REQUEST-ID": _0x2283cf,
            "X-TIMESTAMP": _0x50cb4a,
            "X-SIGNATURE": _0x2a6a47,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive"
          }
        },
        _0x215aac = await _0x35d29f(_0x1d89ad, "获取App配置中");
      if (_0x215aac.code == 0) {
        _0x17626b("账号[" + this.index + "],获取App配置成功 😄 ");
      } else _0x17626b("账号[" + this.index + "],获取App配置:失败 🙁 了呢, 原因：" + _0x215aac?.["message"]);
    } catch (_0x1ea44d) {
      console.log(_0x1ea44d);
    }
  }
  async ["get_unread_msg"]() {
    let _0x2f0ff5 = "/api/chuanbo/unread",
      _0x35c3d0 = _0x45311f.guid(),
      _0x2fb6f1 = _0x45311f.ts13(),
      _0xf1d928 = _0x2f0ff5 + "&&" + this.sessionId + "&&" + _0x35c3d0 + "&&" + _0x2fb6f1 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x29126a = _0x45311f.SHA256_Encrypt(_0xf1d928);
    try {
      let _0x12ab7a = {
          "method": "GET",
          "url": "" + this.hostname + _0x2f0ff5,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x35c3d0,
            "X-TIMESTAMP": _0x2fb6f1,
            "X-SIGNATURE": _0x29126a,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x43d31c = await _0x35d29f(_0x12ab7a, "获取未读信息");
      _0x43d31c.code == 0 ? _0x17626b("账号[" + this.index + "],获取未读信息成功 😄 ") : _0x17626b("账号[" + this.index + "],获取未读信息:失败 🙁 了呢,原因：" + _0x43d31c?.["message"]);
    } catch (_0x160595) {
      console.log(_0x160595);
    }
  }
  async ["task_comment_pre"]() {
    let _0x57be9b = "/api/app_feature_switch/list",
      _0x2e7d2d = _0x45311f.guid(),
      _0xe9e39b = _0x45311f.ts13(),
      _0x459583 = _0x57be9b + "&&" + this.sessionId + "&&" + _0x2e7d2d + "&&" + _0xe9e39b + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x22e05f = _0x45311f.SHA256_Encrypt(_0x459583);
    try {
      let _0x216665 = {
          "method": "GET",
          "url": "" + this.hostname + _0x57be9b,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x2e7d2d,
            "X-TIMESTAMP": _0xe9e39b,
            "X-SIGNATURE": _0x22e05f,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x14410a = await _0x35d29f(_0x216665, "文章准备工作");
      if (_0x14410a.code == 0) _0x17626b("账号[" + this.index + "],文章准备工作成功 😄 ");else {
        _0x17626b("账号[" + this.index + "],文章准备工作:失败 🙁 了呢,原因：" + _0x14410a?.["message"]);
      }
    } catch (_0x56410a) {
      console.log(_0x56410a);
    }
  }
  async ["task_comment"](_0xb91d23) {
    let _0x100e7c = _0x1407cd ? await this.txt_api() : _0x3cdca6[Math.floor(Math.random() * _0x3cdca6?.["length"])],
      _0x7515f0 = "/api/comment/create",
      _0x27a276 = _0x45311f.guid(),
      _0x4c2a84 = _0x45311f.ts13(),
      _0x2fd799 = _0x7515f0 + "&&" + this.sessionId + "&&" + _0x27a276 + "&&" + _0x4c2a84 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x4dbd4d = _0x45311f.SHA256_Encrypt(_0x2fd799);
    try {
      let _0x224948 = {
          "method": "POST",
          "url": "" + this.hostname + _0x7515f0,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x27a276,
            "X-TIMESTAMP": _0x4c2a84,
            "X-SIGNATURE": _0x4dbd4d,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          },
          "form": {
            "channel_article_id": _0xb91d23,
            "content": _0x100e7c
          }
        },
        _0x3fca34 = await _0x35d29f(_0x224948, "评论");
      if (_0x3fca34.code == 0) {
        {
          const _0x4b07da = this?.["jobList"]?.["find"](_0x445ce9 => {
            return _0x445ce9?.["name"]?.["includes"]("资讯评论") && _0x445ce9?.["frequency"] > _0x445ce9?.["finish_times"];
          });
          _0x4b07da.finish_times++;
          _0x17626b("账号[" + this.index + "],评论成功 😄 [" + _0x100e7c + "]");
          const _0x5b3928 = _0x3fca34?.["data"]?.["comment"]?.["id"];
          await _0x2d43c3(1 + Math.random() * 1);
          await this.deleteComment(_0x5b3928);
        }
      } else _0x17626b("账号[" + this.index + "],评论:失败 🙁 了呢,原因：" + _0x3fca34?.["message"]), this.commentError = _0x3fca34?.["message"]?.["includes"]("请重新进入当前页面");
    } catch (_0x4822b2) {
      console.log(_0x4822b2);
    }
  }
  async ["deleteComment"](_0x1699ec) {
    let _0x3aa90a = "/api/comment/delete",
      _0x151615 = _0x45311f.guid(),
      _0x37d984 = _0x45311f.ts13(),
      _0x458bb3 = _0x3aa90a + "&&" + this.sessionId + "&&" + _0x151615 + "&&" + _0x37d984 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x23789e = _0x45311f.SHA256_Encrypt(_0x458bb3);
    try {
      {
        let _0x2416d7 = {
            "method": "POST",
            "url": "" + this.hostname + _0x3aa90a,
            "headers": {
              "X-SESSION-ID": "" + this.sessionId,
              "X-REQUEST-ID": _0x151615,
              "X-TIMESTAMP": _0x37d984,
              "X-SIGNATURE": _0x23789e,
              "X-TENANT-ID": _0x1b4c3d,
              "User-Agent": _0x1c3b90,
              "Cache-Control": "no-cache",
              "Content-Type": "application/x-www-form-urlencoded",
              "Host": this.host,
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            },
            "form": {
              "comment_id": _0x1699ec
            }
          },
          _0x197ec9 = await _0x35d29f(_0x2416d7, "删除评论");
        _0x197ec9.code == 0 ? _0x17626b("账号[" + this.index + "], 删除评论成功 😄 ") : _0x17626b("账号[" + this.index + "],删除评论失败 🙁 了呢,原因：" + _0x197ec9?.["message"]);
      }
    } catch (_0xcf0b1b) {
      console.log(_0xcf0b1b);
    }
  }
  async ["task_share"](_0x4c3538, _0xd769ac, _0x2411a2) {
    let _0x31ba20 = "/api/user_mumber/doTask",
      _0x2f0ae1 = _0x45311f.guid(),
      _0x2d6f5f = _0x45311f.ts13(),
      _0x1c9cb3 = _0x31ba20 + "&&" + this.sessionId + "&&" + _0x2f0ae1 + "&&" + _0x2d6f5f + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x492617 = _0x45311f.SHA256_Encrypt(_0x1c9cb3);
    try {
      let _0x3793b7 = {
          "method": "POST",
          "url": "" + this.hostname + _0x31ba20,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x2f0ae1,
            "X-TIMESTAMP": _0x2d6f5f,
            "X-SIGNATURE": _0x492617,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          },
          "form": {
            "memberType": _0x4c3538,
            "member_type": _0x4c3538,
            "target_id": _0xd769ac
          }
        },
        _0x4c4076 = await _0x35d29f(_0x3793b7, _0x2411a2);
      if (_0x4c4076.code == 0) {
        const _0x1b82f5 = this?.["jobList"]?.["find"](_0x379dd7 => {
          return _0x379dd7?.["name"]?.["includes"](_0x4c3538 === "3" ? "分享资讯" : "使用本地服务") && _0x379dd7?.["frequency"] > _0x379dd7?.["finish_times"];
        });
        _0x1b82f5 && _0x1b82f5.finish_times++;
        _0x17626b("账号[" + this.index + "]," + _0x2411a2 + "成功 😄 ");
        if (_0x4c4076.data) {
          "账号[" + this.index + "]," + _0x2411a2 + ("执行完毕共获得:[" + _0x4c4076.data.score_notify.integral + "]");
        }
      } else _0x17626b("账号[" + this.index + "], " + _0x2411a2 + " :失败 🙁 了呢,原因：" + _0x4c4076?.["message"]), console.log(_0x4c4076);
    } catch (_0x703267) {
      console.log(_0x703267);
    }
  }
  async ["user_info"]() {
    let _0xa39bdb = "/api/user_mumber/account_detail",
      _0x4b2c0c = _0x45311f.guid(),
      _0x2bc0f4 = _0x45311f.ts13(),
      _0x55ba34 = _0xa39bdb + "&&" + this.sessionId + "&&" + _0x4b2c0c + "&&" + _0x2bc0f4 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x2c53e4 = _0x45311f.SHA256_Encrypt(_0x55ba34);
    try {
      {
        let _0x2f058d = {
            "method": "GET",
            "url": "" + this.hostname + _0xa39bdb,
            "headers": {
              "X-SESSION-ID": "" + this.sessionId,
              "X-REQUEST-ID": _0x4b2c0c,
              "X-TIMESTAMP": _0x2bc0f4,
              "X-SIGNATURE": _0x2c53e4,
              "X-TENANT-ID": _0x1b4c3d,
              "User-Agent": _0x1c3b90,
              "Cache-Control": "no-cache",
              "Host": this.host,
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            }
          },
          _0x12768d = await _0x35d29f(_0x2f058d, "用户信息");
        _0x12768d.code == 0 ? (this.valid = true, this.requestedUserInfo = true, _0x17626b("账号[" + this.index + "],验证成功 😄 ，账号可正常使用，[" + _0x12768d.data.rst.nick_name + "]"), _0x12768d.data.rst.ref_user_uid == "" && (await this.share_code("推荐"))) : (this.valid = false, _0x12768d?.["message"]?.["includes"]("Session无效或者过期") ? _0x17626b("账号[" + this.index + "],验证失败 🙁 了呢,请检查配置是否正确 或者 账户凭证是否过期；请看脚本头部说明，如果是老脚本配置，需在配置文件配置：export zsohOldConfigTranform='true'") : _0x17626b("账号[" + this.index + "],验证失败 🙁 了呢,原因：" + _0x12768d?.["message"]));
      }
    } catch (_0x35fe2a) {
      console.log(_0x35fe2a);
    }
  }
  async ["share_code"](_0x130b35) {
    let _0x227ffe = "/api/account/update_ref_code",
      _0x2a4f62 = _0x45311f.guid(),
      _0x446494 = _0x45311f.ts13(),
      _0x4d902d = _0x227ffe + "&&" + this.sessionId + "&&" + _0x2a4f62 + "&&" + _0x446494 + "&&" + this.key + "&&" + _0x1b4c3d,
      _0x10d9b0 = _0x45311f.SHA256_Encrypt(_0x4d902d);
    try {
      let _0x433d1f = {
          "method": "POST",
          "url": "" + this.hostname + _0x227ffe,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x2a4f62,
            "X-TIMESTAMP": _0x446494,
            "X-SIGNATURE": _0x10d9b0,
            "X-TENANT-ID": _0x1b4c3d,
            "User-Agent": _0x1c3b90,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          },
          "form": {
            "ref_code": _0x3d80fe || "WET28W"
          }
        },
        _0x6fd3dd = await _0x35d29f(_0x433d1f, _0x130b35);
      if (_0x6fd3dd.code == 0) {} else {}
    } catch (_0x2fea10) {
      console.log(_0x2fea10);
    }
  }
}
!(async () => {
  _0x17626b("开始读取配置的数据……");
  if (!(await _0x291751())) return;
  _0x7bed49.length > 0 ? (_0x17626b(_0x2932d6), await _0x2d43c3(0.1), await _0x579794()) : (console.log("无可用账号，停止执行\n" + _0x489135), exit());
  await _0x10036c(_0x17c57d?.["name"] + "：" + _0x2deb28 + "\n" + _0xc524cb);
})().catch(_0x3f3f8f => console.log(_0x3f3f8f)).finally(() => _0x17c57d.done());
function _0x5ee65e(_0x46ef55, _0x34e590, _0x335d0e) {
  let _0x60e224 = {},
    _0x26ecf3 = {};
  try {
    _0x60e224 = _0x680427.readFileSync(_0x46ef55 + ".json", "utf8");
    _0x26ecf3 = JSON.parse(_0x60e224);
  } catch (_0x351d5a) {}
  _0x26ecf3[_0x34e590] = _0x335d0e;
  const _0x576082 = JSON.stringify(_0x26ecf3);
  try {
    _0x680427.writeFileSync(_0x46ef55 + ".json", _0x576082);
  } catch (_0x454325) {
    _0x454325.code === "ENOENT" ? _0x680427.writeFileSync(_0x46ef55 + ".json", _0x576082) : console.error("保存文件时发生错误：", _0x454325);
  }
}
function _0x113dd3(_0x466092, _0x1573dd) {
  try {
    const _0x4bec01 = _0x680427.readFileSync(_0x466092 + ".json", "utf8"),
      _0x5766d3 = JSON.parse(_0x4bec01);
    return _0x5766d3[_0x1573dd];
  } catch (_0x163cf0) {
    {
      if (_0x163cf0.code === "ENOENT") {
        return undefined;
      } else console.error("读取文件时发生错误：", _0x163cf0);
    }
  }
}
async function _0x291751() {
  if (_0x59bfe2) {
    {
      let _0x591020 = _0x377ff9[0];
      for (let _0x4a14d5 of _0x377ff9) if (_0x59bfe2.indexOf(_0x4a14d5) > -1) {
        {
          _0x591020 = _0x4a14d5;
          break;
        }
      }
      for (let _0xe8e475 of _0x59bfe2.split(_0x591020)) _0xe8e475 && _0x7bed49.push(new _0x2b782f(_0x4c9130 && _0xe8e475?.["includes"]("&") ? _0xe8e475?.["split"]("&") : _0xe8e475?.["split"]("#")));
      _0x155877 = _0x7bed49.length;
    }
  } else {
    console.log("未找到CK");
    return;
  }
  console.log("共找到" + _0x155877 + "个账号");
  return true;
}
async function _0x35d29f(_0xacf42, _0x2059fe, _0x1a7e34) {
  return new Promise(_0x263c8e => {
    if (!_0x2059fe) {
      let _0x1d9959 = arguments.callee.toString(),
        _0x20267f = /function\s*(\w*)/i,
        _0x507139 = _0x20267f.exec(_0x1d9959);
      _0x2059fe = _0x507139[1];
    }
    _0x591081 && (console.log("\n【debug】===============这是" + _0x2059fe + "请求信息==============="), console.log(_0xacf42));
    if (_0x591081) {
      _0xacf42.rejectUnauthorized = false;
    }
    _0x4423d8(_0xacf42, function (_0x26ca57, _0x5ab543) {
      if (_0x26ca57) throw new Error(_0x26ca57);
      let _0x3301a2 = _0x5ab543.body;
      try {
        _0x591081 && (console.log("\n\n【debug】===============这是" + _0x2059fe + "返回数据=============="), console.log(_0x3301a2));
        if (typeof _0x3301a2 == "string") {
          if (_0xb4d7d5(_0x3301a2)) {
            {
              let _0x116ef0 = JSON.parse(_0x3301a2);
              _0x591081 && (console.log("\n【debug】=============这是" + _0x2059fe + "json解析后数据============"), console.log(_0x116ef0));
              !_0x1a7e34 ? _0x263c8e(_0x116ef0) : _0x263c8e({
                ..._0x5ab543,
                "body": _0x116ef0
              });
            }
          } else {
            let _0x4341e5 = _0x3301a2;
            !_0x1a7e34 ? _0x263c8e(_0x4341e5) : _0x263c8e({
              ..._0x5ab543,
              "body": _0x4341e5
            });
          }
          function _0xb4d7d5(_0x2f8871) {
            if (typeof _0x2f8871 == "string") try {
              if (typeof JSON.parse(_0x2f8871) == "object") return true;
            } catch (_0x480afb) {
              return false;
            }
            return false;
          }
        } else {
          let _0x38aa9d = _0x3301a2;
          if (!_0x1a7e34) {
            _0x263c8e(_0x38aa9d);
          } else _0x263c8e({
            ..._0x5ab543,
            "body": _0x38aa9d
          });
        }
      } catch (_0x1ee133) {
        console.log(_0x26ca57, _0x5ab543);
        console.log("\n " + _0x2059fe + "失败了!请稍后尝试!!");
      } finally {
        _0x263c8e();
      }
    });
  });
}
function _0x2d43c3(_0x2ae54c) {
  return new Promise(function (_0x46a236) {
    setTimeout(_0x46a236, _0x2ae54c * 1000);
  });
}
function _0x17626b(_0x5e1987) {
  if (_0x17c57d.isNode()) _0x5e1987 && (console.log("" + _0x5e1987), _0x5db988 += "" + _0x5e1987);else {
    console.log("" + _0x5e1987);
    msg += "" + _0x5e1987;
  }
}
async function _0x10036c(_0x436689) {
  if (!_0x436689) return;
  if (_0x6bd43f > 0) {
    if (_0x17c57d.isNode()) {
      var _0x895ac6 = require("./sendNotify");
      await _0x895ac6.sendNotify(_0x17c57d.name, _0x436689);
    } else {
      _0x17c57d.msg(_0x17c57d.name, "", _0x436689);
    }
  } else console.log("通知服务未开启，不予推送：", _0x436689);
}
function _0x17cd75() {
  if (_0x17c57d.isNode()) {
    process.on("uncaughtException", function (_0x4dc019) {
      if (_0x4dc019.code === "MODULE_NOT_FOUND") {
        {
          const _0x53ff2f = _0x4dc019.message.split("'")[1];
          if (_0x53ff2f.startsWith("./")) {
            console.log("缺少依赖文件，请前往代码库寻找 " + _0x53ff2f?.["replace"]("./", "")?.["replace"]("../", "") + " 代码文件，放在本脚本同一目录下 \n 什么？不会？v我50我教你！");
          } else {
            console.log("缺少依赖，请安装 " + _0x53ff2f + " 库： " + _0x53ff2f + " \n 什么？不会？v我50我教你！");
          }
        }
      } else console.log("发生错误：" + _0x4dc019.message);
    });
    process.on("unhandledRejection", function (_0x2e4162) {
      {
        const _0x228390 = _0x2e4162.stack.split("\n");
        if (_0x228390.length > 1) {
          const _0x25ea48 = _0x228390[1],
            _0x2ed327 = _0x25ea48.match(/\((.*):(\d+):(\d+)\)/);
          if (_0x2ed327) {
            {
              const _0x139b63 = _0x2ed327[1],
                _0x171764 = _0x2ed327[2];
              console.log("程序执行出现异常，错误信息：" + _0x2e4162.message + ("，错误发生在 " + _0x139b63 + " 的第 " + _0x171764 + " 行 \n 请在本仓库建立 issue 并附上日志或者截图即可？什么，很着急？v我50疯狂星期四！"));
            }
          }
        } else {
          console.log("发生错误：" + _0x2e4162.message);
        }
      }
    });
  }
}
function _0x1724be(_0x26ea89, _0x1f3d05) {
  "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
  class _0x34c25e {
    constructor(_0x3692d7) {
      this.env = _0x3692d7;
    }
    ["send"](_0x310c63, _0x4a470e = "GET") {
      _0x310c63 = "string" == typeof _0x310c63 ? {
        "url": _0x310c63
      } : _0x310c63;
      let _0x431dff = this.get;
      "POST" === _0x4a470e && (_0x431dff = this.post);
      return new Promise((_0x3f9d83, _0x49c980) => {
        _0x431dff.call(this, _0x310c63, (_0x238717, _0xf4f913, _0x1df8e4) => {
          _0x238717 ? _0x49c980(_0x238717) : _0x3f9d83(_0xf4f913);
        });
      });
    }
    ["get"](_0x1fb225) {
      return this.send.call(this.env, _0x1fb225);
    }
    ["post"](_0x4cb4c9) {
      return this.send.call(this.env, _0x4cb4c9, "POST");
    }
  }
  return new class {
    constructor(_0x49e46f, _0x556f11) {
      this.name = _0x49e46f;
      this.http = new _0x34c25e(this);
      this.data = null;
      this.dataFile = "box.dat";
      this.logs = [];
      this.isMute = false;
      this.isNeedRewrite = false;
      this.logSeparator = "\n";
      this.startTime = new Date().getTime();
      Object.assign(this, _0x556f11);
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
    ["toObj"](_0x463950, _0x59cced = null) {
      try {
        return JSON.parse(_0x463950);
      } catch {
        return _0x59cced;
      }
    }
    ["toStr"](_0x25c848, _0x575378 = null) {
      try {
        return JSON.stringify(_0x25c848);
      } catch {
        return _0x575378;
      }
    }
    ["getjson"](_0x215c43, _0x1fe5d3) {
      let _0x31c8ad = _0x1fe5d3;
      const _0x532fdc = this.getdata(_0x215c43);
      if (_0x532fdc) try {
        _0x31c8ad = JSON.parse(this.getdata(_0x215c43));
      } catch {}
      return _0x31c8ad;
    }
    ["setjson"](_0xe3d375, _0x5797dc) {
      try {
        return this.setdata(JSON.stringify(_0xe3d375), _0x5797dc);
      } catch {
        return false;
      }
    }
    ["getScript"](_0x4d741c) {
      return new Promise(_0x521b67 => {
        this.get({
          "url": _0x4d741c
        }, (_0x5b5aa3, _0x8b6bab, _0x454b34) => _0x521b67(_0x454b34));
      });
    }
    ["runScript"](_0x35f153, _0x41fa1f) {
      return new Promise(_0x34c44d => {
        let _0x3e259e = this.getdata("@chavy_boxjs_userCfgs.httpapi");
        _0x3e259e = _0x3e259e ? _0x3e259e.replace(/\n/g, "").trim() : _0x3e259e;
        let _0x150f5a = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
        _0x150f5a = _0x150f5a ? 1 * _0x150f5a : 20;
        _0x150f5a = _0x41fa1f && _0x41fa1f.timeout ? _0x41fa1f.timeout : _0x150f5a;
        const [_0x1130b3, _0x2d364e] = _0x3e259e.split("@"),
          _0x1506c5 = {
            "url": "http://" + _0x2d364e + "/v1/scripting/evaluate",
            "body": {
              "script_text": _0x35f153,
              "mock_type": "cron",
              "timeout": _0x150f5a
            },
            "headers": {
              "X-Key": _0x1130b3,
              "Accept": "*/*"
            }
          };
        this.post(_0x1506c5, (_0x581d16, _0x1c2511, _0x1e0773) => _0x34c44d(_0x1e0773));
      }).catch(_0x25d318 => this.logErr(_0x25d318));
    }
    ["loaddata"]() {
      {
        if (!this.isNode()) return {};
        {
          this.fs = this.fs ? this.fs : require("fs");
          this.path = this.path ? this.path : require("path");
          const _0x2ed08b = this.path.resolve(this.dataFile),
            _0x1d1986 = this.path.resolve(process.cwd(), this.dataFile),
            _0x57a03a = this.fs.existsSync(_0x2ed08b),
            _0x3c5f98 = !_0x57a03a && this.fs.existsSync(_0x1d1986);
          if (!_0x57a03a && !_0x3c5f98) return {};
          {
            const _0x2ead06 = _0x57a03a ? _0x2ed08b : _0x1d1986;
            try {
              return JSON.parse(this.fs.readFileSync(_0x2ead06));
            } catch (_0x504264) {
              return {};
            }
          }
        }
      }
    }
    ["writedata"]() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require("fs");
        this.path = this.path ? this.path : require("path");
        const _0x43c1f3 = this.path.resolve(this.dataFile),
          _0x37d193 = this.path.resolve(process.cwd(), this.dataFile),
          _0x3eb004 = this.fs.existsSync(_0x43c1f3),
          _0x5f005e = !_0x3eb004 && this.fs.existsSync(_0x37d193),
          _0xf7fd5f = JSON.stringify(this.data);
        _0x3eb004 ? this.fs.writeFileSync(_0x43c1f3, _0xf7fd5f) : _0x5f005e ? this.fs.writeFileSync(_0x37d193, _0xf7fd5f) : this.fs.writeFileSync(_0x43c1f3, _0xf7fd5f);
      }
    }
    ["lodash_get"](_0x26ef43, _0x44e165, _0x6bdf96) {
      {
        const _0x56b090 = _0x44e165.replace(/\[(\d+)\]/g, ".$1").split(".");
        let _0x28c45d = _0x26ef43;
        for (const _0x5038d5 of _0x56b090) if (_0x28c45d = Object(_0x28c45d)[_0x5038d5], undefined === _0x28c45d) return _0x6bdf96;
        return _0x28c45d;
      }
    }
    ["lodash_set"](_0x28f6b3, _0x3bdacb, _0x3ff7ca) {
      return Object(_0x28f6b3) !== _0x28f6b3 ? _0x28f6b3 : (Array.isArray(_0x3bdacb) || (_0x3bdacb = _0x3bdacb.toString().match(/[^.[\]]+/g) || []), _0x3bdacb.slice(0, -1).reduce((_0x7f0791, _0x3ad33c, _0x2f00b0) => Object(_0x7f0791[_0x3ad33c]) === _0x7f0791[_0x3ad33c] ? _0x7f0791[_0x3ad33c] : _0x7f0791[_0x3ad33c] = Math.abs(_0x3bdacb[_0x2f00b0 + 1]) >> 0 == +_0x3bdacb[_0x2f00b0 + 1] ? [] : {}, _0x28f6b3)[_0x3bdacb[_0x3bdacb.length - 1]] = _0x3ff7ca, _0x28f6b3);
    }
    ["getdata"](_0x1be22c) {
      {
        let _0x26822e = this.getval(_0x1be22c);
        if (/^@/.test(_0x1be22c)) {
          const [, _0x26339d, _0x502bf9] = /^@(.*?)\.(.*?)$/.exec(_0x1be22c),
            _0x4d5200 = _0x26339d ? this.getval(_0x26339d) : "";
          if (_0x4d5200) try {
            const _0x33609a = JSON.parse(_0x4d5200);
            _0x26822e = _0x33609a ? this.lodash_get(_0x33609a, _0x502bf9, "") : _0x26822e;
          } catch (_0x91d355) {
            _0x26822e = "";
          }
        }
        return _0x26822e;
      }
    }
    ["setdata"](_0xed1ba, _0x5a5364) {
      let _0x11e11d = false;
      if (/^@/.test(_0x5a5364)) {
        const [, _0x513375, _0x441c9c] = /^@(.*?)\.(.*?)$/.exec(_0x5a5364),
          _0x53da19 = this.getval(_0x513375),
          _0x4dd37f = _0x513375 ? "null" === _0x53da19 ? null : _0x53da19 || "{}" : "{}";
        try {
          const _0x3e4fa2 = JSON.parse(_0x4dd37f);
          this.lodash_set(_0x3e4fa2, _0x441c9c, _0xed1ba);
          _0x11e11d = this.setval(JSON.stringify(_0x3e4fa2), _0x513375);
        } catch (_0x26911f) {
          const _0x45c41c = {};
          this.lodash_set(_0x45c41c, _0x441c9c, _0xed1ba);
          _0x11e11d = this.setval(JSON.stringify(_0x45c41c), _0x513375);
        }
      } else _0x11e11d = this.setval(_0xed1ba, _0x5a5364);
      return _0x11e11d;
    }
    ["getval"](_0x55ff38) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(_0x55ff38) : this.isQuanX() ? $prefs.valueForKey(_0x55ff38) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x55ff38]) : this.data && this.data[_0x55ff38] || null;
    }
    ["setval"](_0x357ccc, _0x16a66a) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(_0x357ccc, _0x16a66a) : this.isQuanX() ? $prefs.setValueForKey(_0x357ccc, _0x16a66a) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x16a66a] = _0x357ccc, this.writedata(), true) : this.data && this.data[_0x16a66a] || null;
    }
    ["initGotEnv"](_0x431982) {
      this.got = this.got ? this.got : require("got");
      this.cktough = this.cktough ? this.cktough : require("tough-cookie");
      this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar();
      _0x431982 && (_0x431982.headers = _0x431982.headers ? _0x431982.headers : {}, undefined === _0x431982.headers.Cookie && undefined === _0x431982.cookieJar && (_0x431982.cookieJar = this.ckjar));
    }
    ["get"](_0x24d7b3, _0x29636b = () => {}) {
      _0x24d7b3.headers && (delete _0x24d7b3.headers["Content-Type"], delete _0x24d7b3.headers["Content-Length"]);
      this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (_0x24d7b3.headers = _0x24d7b3.headers || {}, Object.assign(_0x24d7b3.headers, {
        "X-Surge-Skip-Scripting": false
      })), $httpClient.get(_0x24d7b3, (_0x510e5a, _0x1371e3, _0x37bab5) => {
        !_0x510e5a && _0x1371e3 && (_0x1371e3.body = _0x37bab5, _0x1371e3.statusCode = _0x1371e3.status);
        _0x29636b(_0x510e5a, _0x1371e3, _0x37bab5);
      })) : this.isQuanX() ? (this.isNeedRewrite && (_0x24d7b3.opts = _0x24d7b3.opts || {}, Object.assign(_0x24d7b3.opts, {
        "hints": false
      })), $task.fetch(_0x24d7b3).then(_0x4d8064 => {
        {
          const {
            statusCode: _0x4763eb,
            statusCode: _0x54e452,
            headers: _0x43e603,
            body: _0xe53c2a
          } = _0x4d8064;
          _0x29636b(null, {
            "status": _0x4763eb,
            "statusCode": _0x54e452,
            "headers": _0x43e603,
            "body": _0xe53c2a
          }, _0xe53c2a);
        }
      }, _0x3dfb0d => _0x29636b(_0x3dfb0d))) : this.isNode() && (this.initGotEnv(_0x24d7b3), this.got(_0x24d7b3).on("redirect", (_0x57f0a3, _0x238589) => {
        try {
          {
            if (_0x57f0a3.headers["set-cookie"]) {
              {
                const _0x972dd2 = _0x57f0a3.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                _0x972dd2 && this.ckjar.setCookieSync(_0x972dd2, null);
                _0x238589.cookieJar = this.ckjar;
              }
            }
          }
        } catch (_0x271075) {
          this.logErr(_0x271075);
        }
      }).then(_0x107ef5 => {
        const {
          statusCode: _0x3f5b67,
          statusCode: _0x34c445,
          headers: _0x2e4a29,
          body: _0x175bd8
        } = _0x107ef5;
        _0x29636b(null, {
          "status": _0x3f5b67,
          "statusCode": _0x34c445,
          "headers": _0x2e4a29,
          "body": _0x175bd8
        }, _0x175bd8);
      }, _0x37b521 => {
        const {
          message: _0x2ad96e,
          response: _0xdb4a9a
        } = _0x37b521;
        _0x29636b(_0x2ad96e, _0xdb4a9a, _0xdb4a9a && _0xdb4a9a.body);
      }));
    }
    ["post"](_0x507215, _0xea58ab = () => {}) {
      {
        if (_0x507215.body && _0x507215.headers && !_0x507215.headers["Content-Type"] && (_0x507215.headers["Content-Type"] = "application/x-www-form-urlencoded"), _0x507215.headers && delete _0x507215.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (_0x507215.headers = _0x507215.headers || {}, Object.assign(_0x507215.headers, {
          "X-Surge-Skip-Scripting": false
        })), $httpClient.post(_0x507215, (_0x43b213, _0xbb663d, _0x24012f) => {
          !_0x43b213 && _0xbb663d && (_0xbb663d.body = _0x24012f, _0xbb663d.statusCode = _0xbb663d.status);
          _0xea58ab(_0x43b213, _0xbb663d, _0x24012f);
        });else {
          if (this.isQuanX()) _0x507215.method = "POST", this.isNeedRewrite && (_0x507215.opts = _0x507215.opts || {}, Object.assign(_0x507215.opts, {
            "hints": false
          })), $task.fetch(_0x507215).then(_0x3a03d5 => {
            const {
              statusCode: _0x4962ac,
              statusCode: _0x4cc510,
              headers: _0x43baa8,
              body: _0x42cc27
            } = _0x3a03d5;
            _0xea58ab(null, {
              "status": _0x4962ac,
              "statusCode": _0x4cc510,
              "headers": _0x43baa8,
              "body": _0x42cc27
            }, _0x42cc27);
          }, _0x260e3a => _0xea58ab(_0x260e3a));else {
            if (this.isNode()) {
              {
                this.initGotEnv(_0x507215);
                const {
                  url: _0x5d4e3c,
                  ..._0x1c1b51
                } = _0x507215;
                this.got.post(_0x5d4e3c, _0x1c1b51).then(_0x5e8ab2 => {
                  const {
                    statusCode: _0x44903e,
                    statusCode: _0x2a9f0c,
                    headers: _0x26e950,
                    body: _0x276eb1
                  } = _0x5e8ab2;
                  _0xea58ab(null, {
                    "status": _0x44903e,
                    "statusCode": _0x2a9f0c,
                    "headers": _0x26e950,
                    "body": _0x276eb1
                  }, _0x276eb1);
                }, _0x5a18fc => {
                  const {
                    message: _0x3d82c8,
                    response: _0x41317b
                  } = _0x5a18fc;
                  _0xea58ab(_0x3d82c8, _0x41317b, _0x41317b && _0x41317b.body);
                });
              }
            }
          }
        }
      }
    }
    ["time"](_0x1a90a8, _0x50641a = null) {
      const _0x202552 = _0x50641a ? new Date(_0x50641a) : new Date();
      let _0x2cb3ba = {
        "M+": _0x202552.getMonth() + 1,
        "d+": _0x202552.getDate(),
        "H+": _0x202552.getHours(),
        "m+": _0x202552.getMinutes(),
        "s+": _0x202552.getSeconds(),
        "q+": Math.floor((_0x202552.getMonth() + 3) / 3),
        "S": _0x202552.getMilliseconds()
      };
      /(y+)/.test(_0x1a90a8) && (_0x1a90a8 = _0x1a90a8.replace(RegExp.$1, (_0x202552.getFullYear() + "").substr(4 - RegExp.$1.length)));
      for (let _0x85b4f8 in _0x2cb3ba) new RegExp("(" + _0x85b4f8 + ")").test(_0x1a90a8) && (_0x1a90a8 = _0x1a90a8.replace(RegExp.$1, 1 == RegExp.$1.length ? _0x2cb3ba[_0x85b4f8] : ("00" + _0x2cb3ba[_0x85b4f8]).substr(("" + _0x2cb3ba[_0x85b4f8]).length)));
      return _0x1a90a8;
    }
    ["msg"](_0x220baf = _0x26ea89, _0xdfb6b6 = "", _0x1f2cd8 = "", _0x12ddd5) {
      {
        const _0x4d0907 = _0x381f54 => {
          {
            if (!_0x381f54) return _0x381f54;
            if ("string" == typeof _0x381f54) return this.isLoon() ? _0x381f54 : this.isQuanX() ? {
              "open-url": _0x381f54
            } : this.isSurge() ? {
              "url": _0x381f54
            } : undefined;
            if ("object" == typeof _0x381f54) {
              if (this.isLoon()) {
                let _0x3a6d29 = _0x381f54.openUrl || _0x381f54.url || _0x381f54["open-url"],
                  _0x584e2e = _0x381f54.mediaUrl || _0x381f54["media-url"];
                return {
                  "openUrl": _0x3a6d29,
                  "mediaUrl": _0x584e2e
                };
              }
              if (this.isQuanX()) {
                {
                  let _0x44d70a = _0x381f54["open-url"] || _0x381f54.url || _0x381f54.openUrl,
                    _0x3e19c9 = _0x381f54["media-url"] || _0x381f54.mediaUrl;
                  return {
                    "open-url": _0x44d70a,
                    "media-url": _0x3e19c9
                  };
                }
              }
              if (this.isSurge()) {
                {
                  let _0xed59a0 = _0x381f54.url || _0x381f54.openUrl || _0x381f54["open-url"];
                  return {
                    "url": _0xed59a0
                  };
                }
              }
            }
          }
        };
        if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(_0x220baf, _0xdfb6b6, _0x1f2cd8, _0x4d0907(_0x12ddd5)) : this.isQuanX() && $notify(_0x220baf, _0xdfb6b6, _0x1f2cd8, _0x4d0907(_0x12ddd5))), !this.isMuteLog) {
          {
            let _0x2f8d28 = ["", "==============📣系统通知📣=============="];
            _0x2f8d28.push(_0x220baf);
            _0xdfb6b6 && _0x2f8d28.push(_0xdfb6b6);
            _0x1f2cd8 && _0x2f8d28.push(_0x1f2cd8);
            console.log(_0x2f8d28.join("\n"));
            this.logs = this.logs.concat(_0x2f8d28);
          }
        }
      }
    }
    ["log"](..._0x44f3a4) {
      _0x44f3a4.length > 0 && (this.logs = [...this.logs, ..._0x44f3a4]);
      console.log(_0x44f3a4.join(this.logSeparator));
    }
    ["logErr"](_0x59e447, _0x32b475) {
      {
        const _0x4bba18 = !this.isSurge() && !this.isQuanX() && !this.isLoon();
        _0x4bba18 ? this.log("", "❗️" + this.name + ", 错误!", _0x59e447.stack) : this.log("", "❗️" + this.name + ", 错误!", _0x59e447);
      }
    }
    ["wait"](_0x5130ef) {
      return new Promise(_0x5a6063 => setTimeout(_0x5a6063, _0x5130ef));
    }
    ["done"](_0x500cfd = {}) {
      const _0x4c0576 = new Date().getTime(),
        _0x4fb91a = (_0x4c0576 - this.startTime) / 1000;
      this.log("", "🔔" + this.name + ", 结束! 🕛 " + _0x4fb91a + " 秒");
      this.log();
      (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(_0x500cfd);
    }
  }(_0x26ea89, _0x1f3d05);
}