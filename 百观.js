/**
 * 百观v1.0
 * 执行时间： 25 10,16 * * *  百观.js
 * const $ = new Env("百观");
 * 注册地址：https://app.tmuyun.com/webChannels/invite?inviteCode=W8QUVF&tenantId=44&accountId=64b67d0d50576140901fb8da
 * 
 * 23/06/03 执行签到,阅读,点赞,分享,本地服务 增加评论 延迟
 * ========= 青龙--配置文件 ===========
 * # 百观（配置方式二选一）
 * 方式一：账号密码自动登录
 * export baiguan='账号#密码'
 * 方式二：抓包协议头里的 X-SESSION-ID 和 X-ACCOUNT-ID
 * export baiguan='sessionId#accountId'
 * 是否启用文章评论开关（注，估计这个操作容易封）
 * export baiguanEnabledPostComment="false" // 默认为false，代表关闭文章评论功能，如果需要开启请改为 true 或者 1
 * 是否启用论坛发帖开关（注，估计这个操作容易封）
 * export baiguanEnabledForumPost="false" // 默认为false，代表关闭论坛发帖功能，如果需要开启请改为 true 或者 1
 * 文章评论是否使用一言随机返回的名人名句
 * export baiguanEnabledPostCommentBy1Y="false" // 默认为false，代表关闭使用一言的随机评论，如果需要开启请改为 true 或者 1
 * 是否强制点赞、分享，不开启相关判断逻辑
 * export baiguanForceLikeAndShare="false" // 默认为false，代表关闭根据返回的数据判断是否分享或者点赞，如果就是要尝试分享或者点赞请改为 true 或者 1
 * 多账号用 换行 或 @ 分割
 * 格式：账号#密码
 * ====================================
 * 注：评论功能开启也可能无法正常评论，也不一定加评论数，原因未知，时间有限未具体分析排查，待定，欢迎大佬给出解决方法。
 * ====================================
 */
//Sat Jan 25 2025 08:35:54 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
const _0x1fc348 = new _0x38a41a("百观");
_0x341e2e();
const _0x2853ab = "baiguan",
  _0x2a8d91 = require("request"),
  _0x2bcfec = require("fs"),
  _0x28edfd = require("form-data"),
  _0x3a3854 = require("./utils");
let _0x52d7bc = "",
  _0x2238cb = "https://app.tmuyun.com/webChannels/invite?inviteCode=W8QUVF&tenantId=44&accountId=64b67d0d50576140901fb8da",
  _0x2f4e46 = "幻生提示：有错请在仓库建立issue，附上运行截图，谢谢",
  _0x12897f = "请在 配置文件 里添加 " + _0x2853ab + " 变量，具体配置请看脚本最上方说明\n注册地址：" + _0x2238cb + "\n投稿？请建Issue 或者 +Q：3385445213";
const _0x166835 = Number.isInteger(_0x1fc348.isNode() ? process.env[_0x2853ab + "enabledNotify"] : _0x1fc348.getdata(_0x2853ab + "EnabledNotify")) || Number.isInteger(_0x1fc348.isNode() ? process.env.enabledNotify : _0x1fc348.getdata("enabledNotify")) || 1;
let _0x311de2 = 0,
  _0x23fde9 = ["@", "\n"],
  _0x4be5bc = (_0x1fc348.isNode() ? process.env[_0x2853ab] : _0x1fc348.getdata(_0x2853ab)) || "",
  _0xe7a793 = ["1", 1, "true"]?.["includes"](_0x1fc348.isNode() ? process.env[_0x2853ab + "EnabledPostComment"] : _0x1fc348.getdata(_0x2853ab + "EnabledPostComment")) || false,
  _0x69a81e = ["1", 1, "true"]?.["includes"](_0x1fc348.isNode() ? process.env[_0x2853ab + "EnabledForumPost"] : _0x1fc348.getdata(_0x2853ab + "EnabledForumPost")) || false,
  _0x5759cc = ["1", 1, "true"]?.["includes"](_0x1fc348.isNode() ? process.env[_0x2853ab + "EnabledPostCommentBy1Y"] : _0x1fc348.getdata(_0x2853ab + "EnabledPostCommentBy1Y")) || false,
  _0xd8cdfe = ["1", 1, "true"]?.["includes"](_0x1fc348.isNode() ? process.env[_0x2853ab + "ForceLikeAndShare"] : _0x1fc348.getdata(_0x2853ab + "ForceLikeAndShare")) || false,
  _0x58a4ac = [],
  _0x31bde0 = 0,
  _0x3ebae7 = 0,
  _0x1b84cc = "W8QUVF",
  _0x5dd86d = "62",
  _0x640895 = 44,
  _0x3bef6d = "请注意：已" + (_0xe7a793 ? "开启" : "关闭") + " 对文章的评论功能； 已" + (_0x69a81e ? "开启" : "关闭") + " 论坛发帖功能； 已" + (_0x5759cc ? "开启" : "关闭") + " 一言随机评论功能； 已" + (_0x5759cc ? "开启" : "关闭") + " 强制点赞/分享功能（强行点不一定能加分）",
  _0x12b278 = "63777162fe3fc118b09fab89",
  _0x61dbac = ["赞", "👍", "😄", "111", "支持", "点赞"],
  _0x480616 = "2.2.6;00000000-62d6-e9e6-0000-00007b1351aa;Xiaomi Mi 10;Android;13;Release",
  _0x5769b7 = ["606566eaad61a43e7054b600"],
  _0x592a1f = "",
  _0x1cd8cf = "";
async function _0x36b867() {
  console.log("\n================== 用户登录 帐号数：[" + _0x58a4ac?.["length"] + "]==================\n");
  let _0x2dbb55 = [];
  for (let _0x4764b2 of _0x58a4ac) {
    _0x2dbb55.push(await _0x4764b2.app_start("APP启动"));
    await _0x382b7a(0.2);
    _0x2dbb55.push(await _0x4764b2.iframe_start("Iframe启动"));
    await _0x382b7a(0.2);
    _0x2dbb55.push(await _0x4764b2.web_start("Web启动"));
    await _0x382b7a(0.2);
    _0x2dbb55.push(await _0x4764b2.get_app_version("获取Version"));
    await _0x382b7a(0.2);
    _0x2dbb55.push(await _0x4764b2.config_get("获取配置"));
    await _0x382b7a(0.2 + Math.random() * 1);
    if (!_0x4764b2.sessionId) {
      _0x4764b2.loadCache();
      !_0x4764b2.valid ? _0x2dbb55.push(await _0x4764b2.login()) : await _0x1fc348.wait(200);
    } else _0x2dbb55.push(await _0x4764b2.user_info()), await _0x1fc348.wait(200);
  }
  await Promise.all(_0x2dbb55);
  _0x58a4ac = _0x58a4ac?.["filter"](_0x4e21b4 => _0x4e21b4?.["valid"]);
  !_0x58a4ac?.["length"] && (console.log("\n无可用账号，停止运行\n"), exit());
  console.log("\n================== 用户信息 帐号数：[" + _0x58a4ac?.["length"] + "]==================\n");
  _0x2dbb55 = [];
  for (let _0x5e8cfa of _0x58a4ac) {
    _0x2dbb55.push(await _0x5e8cfa.task_tasklist("用户信息"));
    await _0x382b7a(0.2 + Math.random() * 1);
    _0x2dbb55.push(await _0x5e8cfa.get_unread_msg());
  }
  await Promise.all(_0x2dbb55);
  const _0x6587dc = _0x58a4ac?.["filter"](_0x199a74 => _0x199a74?.["jobList"]?.["find"](_0x3c3ae2 => _0x3c3ae2?.["name"]?.["includes"]("签到") && _0x3c3ae2?.["frequency"] && _0x3c3ae2?.["frequency"] > _0x3c3ae2?.["finish_times"]));
  if (_0x6587dc?.["length"]) {
    {
      console.log("\n================== 每日签到任务开始执行 待执行帐号数：[" + _0x6587dc?.["length"] + "]==================\n");
      _0x2dbb55 = [];
      for (let _0x12acb9 of _0x6587dc) {
        _0x2dbb55.push(await _0x12acb9.task_sign("每日签到"));
        await _0x382b7a(0.2 + Math.random() * 1);
      }
      await Promise.all(_0x2dbb55);
    }
  } else console.log("\n无签到任务 或 当前帐号都已签到过了，无需执行签到任务\n");
  await _0x382b7a(0.2 + Math.random() * 1);
  const _0x379203 = _0x58a4ac?.["filter"](_0x12d5a6 => _0x12d5a6?.["jobList"]?.["find"](_0x19802f => {
    return _0x19802f?.["name"]?.["includes"]("帖子发布") && _0x19802f?.["frequency"] && _0x19802f?.["frequency"] > _0x19802f?.["finish_times"] && _0x69a81e || _0x19802f?.["name"]?.["includes"]("帖子点赞") && _0x19802f?.["frequency"] && _0x19802f?.["frequency"] > _0x19802f?.["finish_times"];
  }));
  if (_0x379203?.["length"]) {
    console.log("\n================== 社区帖子相关任务开始执行 待执行帐号数：[" + _0x379203?.["length"] + "]==================\n");
    _0x2dbb55 = [];
    for (let _0x1dbb49 of _0x379203) {
      _0x2dbb55.push(await _0x1dbb49.task_forum_info("社区帖子列表"));
      await _0x382b7a(0.2 + Math.random() * 1);
    }
    await Promise.all(_0x2dbb55);
  } else console.log("\n无社区帖子相关任务 或 当前帐号都已做完了社区帖子任务，无需执行\n");
  await _0x382b7a(0.2 + Math.random() * 1);
  const _0x247e04 = _0x58a4ac?.["filter"](_0x1241f6 => _0x1241f6?.["jobList"]?.["find"](_0x14a8f5 => {
    return _0x14a8f5?.["name"]?.["includes"]("资讯评论") && _0x14a8f5?.["frequency"] > _0x14a8f5?.["finish_times"] && _0xe7a793 || _0x14a8f5?.["name"]?.["includes"]("分享资讯") && _0x14a8f5?.["frequency"] && _0x14a8f5?.["frequency"] > _0x14a8f5?.["finish_times"] || _0x14a8f5?.["name"]?.["includes"]("资讯点赞") && _0x14a8f5?.["frequency"] && _0x14a8f5?.["frequency"] > _0x14a8f5?.["finish_times"] || _0x14a8f5?.["name"]?.["includes"]("资讯阅读") && _0x14a8f5?.["frequency"] && _0x14a8f5?.["frequency"] > _0x14a8f5?.["finish_times"];
  }));
  if (_0x247e04?.["length"]) {
    console.log("\n================== 文章列表相关任务开始执行 待执行帐号数：[" + _0x247e04?.["length"] + "]==================\n");
    _0x2dbb55 = [];
    for (let _0x4e043f of _0x247e04) {
      console.log("\n开始执行帐号[" + _0x4e043f.index + "] 文章任务😄\n");
      _0x2dbb55.push(await _0x4e043f.task_articlelist("文章列表"));
      await _0x382b7a(0.2 + Math.random() * 1);
    }
    await Promise.all(_0x2dbb55);
  } else console.log("\n无文章资讯任务 或 当前帐号都已做完了资讯任务，无需执行相关任务\n");
  await _0x382b7a(0.2 + Math.random() * 1);
  const _0x429262 = _0x58a4ac?.["filter"](_0x217a8f => _0x217a8f?.["jobList"]?.["find"](_0x22ef09 => {
    return _0x22ef09?.["name"]?.["includes"]("本地服务") && _0x22ef09?.["frequency"] && _0x22ef09?.["frequency"] > _0x22ef09?.["finish_times"];
  }));
  if (_0x429262?.["length"]) {
    console.log("\n================== 本地服务任务开始执行 待执行帐号数：[" + _0x429262?.["length"] + "]==================\n");
    _0x2dbb55 = [];
    for (let _0x9c9cac of _0x429262) {
      const _0x242dda = _0x9c9cac?.["jobList"]?.["find"](_0x1e8965 => {
        return _0x1e8965?.["name"]?.["includes"]("本地服务") && _0x1e8965?.["frequency"] && _0x1e8965?.["frequency"] > _0x1e8965?.["finish_times"];
      });
      for (let _0x281739 = 0; _0x281739 < _0x242dda?.["frequency"] - _0x242dda?.["finish_times"]; _0x281739++) {
        _0x2dbb55.push(await _0x9c9cac.task_share("6", undefined, "本地服务"));
        await _0x382b7a(1 + Math.random() * 1);
      }
    }
    await Promise.all(_0x2dbb55);
  } else console.log("\n无本地服务任务 或 当前帐号都已做完了本地服务任务，无需执行相关任务\n");
  for (let _0x48eb4b of _0x58a4ac) {
    console.log("\n================== 删除历史评论任务开始执行 待执行帐号数：[" + _0x58a4ac?.["length"] + "]==================\n");
    await _0x48eb4b.get_comment_history();
    await _0x382b7a(1 + Math.random() * 1);
  }
}
class _0xfc37c1 {
  ["valid"] = false;
  constructor(_0x9a7300) {
    this.index = ++_0x31bde0;
    this.accountId = "";
    this.host = "vapp.tmuyun.com";
    this.hostname = "https://" + this.host;
    this.key = "FR*r!isE5W";
    const _0x58d0e5 = _0x5769b7,
      _0x38cf60 = Math.floor(Math.random() * _0x58d0e5.length);
    this.artlistdata = _0x58d0e5[_0x38cf60];
    _0x9a7300[0]?.["length"] === 11 ? (this.account = _0x9a7300[0], this.password = _0x9a7300[1]) : (this.sessionId = _0x9a7300[0], this.accountId = _0x9a7300[1]);
  }
  ["loadCache"]() {
    let _0x2c7e86 = _0xb89fb0(_0x2853ab + "_config", this.account);
    if (_0x2c7e86) {
      _0x2c7e86 = JSON.parse(_0x2c7e86);
      console.log("账号[" + this.index + "]从缓存读取成功 😄 ，其ID为： " + _0x2c7e86?.["id"] + "，手机号为：" + this.account);
      this.accountId = _0x2c7e86?.["id"];
      this.sessionId = _0x2c7e86?.["sessionId"];
      this.valid = true;
      return;
    }
  }
  async ["txt_api"]() {
    try {
      let _0x281765 = {
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
        _0x400f15 = await _0x99af4f(_0x281765, "");
      if (_0x400f15.id) {
        return _0x400f15.hitokoto;
      } else {}
    } catch (_0x260dce) {
      console.log(_0x260dce);
    }
  }
  async ["task_tasklist"](_0x49c794) {
    let _0x1fe32f = "/api/user_mumber/numberCenter",
      _0x47f386 = _0x3a3854.guid(),
      _0x4dcc2c = _0x3a3854.ts13(),
      _0x477f8c = _0x1fe32f + "&&" + this.sessionId + "&&" + _0x47f386 + "&&" + _0x4dcc2c + "&&" + this.key + "&&" + _0x640895,
      _0x597608 = _0x3a3854.SHA256_Encrypt(_0x477f8c);
    try {
      let _0x5f3140 = {
          "method": "GET",
          "url": "" + this.hostname + _0x1fe32f + "?is_new=1",
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x47f386,
            "X-TIMESTAMP": _0x4dcc2c,
            "X-SIGNATURE": _0x597608,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Host": "vapp.tmuyun.com",
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x50353b = await _0x99af4f(_0x5f3140, _0x49c794);
      if (_0x50353b.code == 0) {
        !this.requestedUserInfo && (await this.user_info(), await _0x382b7a(0.3));
        _0x3a8213("账号[" + this.index + "],欢迎用户:[" + _0x50353b.data.rst.nick_name + "],当前积分为[" + _0x50353b.data.rst.total_integral + "]");
        _0x592a1f += "账号[" + this.index + "],欢迎用户:[" + _0x50353b.data.rst.nick_name + "],当前积分为[" + _0x50353b.data.rst.total_integral + "]\n";
        await _0x382b7a(0.3);
        this.jobList = _0x50353b.data.rst.user_task_list?.["map"](_0x16e7fd => {
          return {
            "name": _0x16e7fd?.["name"],
            "finish_times": Number(_0x16e7fd?.["finish_times"]),
            "frequency": Number(_0x16e7fd?.["frequency"]),
            "integral": _0x16e7fd?.["integral"],
            "member_task_type": _0x16e7fd?.["member_task_type"]
          };
        });
        if (_0x50353b?.["data"]?.["daily_sign_info"]?.["name"]?.["includes"]("签到")) {
          let _0x58a9e4 = _0x50353b?.["data"]?.["daily_sign_info"]?.["daily_sign_list"]?.["find"](_0x5ba65d => _0x5ba65d?.["current"])?.["signed"];
          this.jobList.push({
            "name": "每日签到",
            "finish_times": _0x58a9e4 ? 1 : 0,
            "frequency": 1
          });
        }
        _0x3a8213("账号[" + this.index + "],获取任务列表成功 😄 :");
        await _0x382b7a(0.3);
        let _0x3413dc = "";
        await _0x382b7a(0.2 + Math.random() * 1);
        for (let _0x347c13 = 0; _0x347c13 < this.jobList.length; _0x347c13++) {
          _0x3413dc += this.jobList[_0x347c13].name + "[" + this.jobList[_0x347c13].finish_times + "/" + this.jobList[_0x347c13].frequency + "]\n";
        }
        await _0x382b7a(0.3);
        _0x3a8213(_0x3413dc);
      } else {
        _0x3a8213("账号[" + this.index + "],获取任务列表:失败 🙁 了呢,原因：" + _0x50353b?.["message"]);
        console.log(_0x50353b);
      }
    } catch (_0x1321a3) {
      console.log(_0x1321a3);
    }
  }
  async ["task_sign"](_0x1140f7) {
    let _0x570365 = "/api/user_mumber/sign",
      _0x484481 = _0x3a3854.guid(),
      _0x56917b = _0x3a3854.ts13(),
      _0x20c645 = _0x570365 + "&&" + this.sessionId + "&&" + _0x484481 + "&&" + _0x56917b + "&&" + this.key + "&&" + _0x640895,
      _0x23a468 = _0x3a3854.SHA256_Encrypt(_0x20c645);
    try {
      let _0x30880d = {
          "method": "GET",
          "url": "" + this.hostname + _0x570365,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x484481,
            "X-TIMESTAMP": _0x56917b,
            "X-SIGNATURE": _0x23a468,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Host": "vapp.tmuyun.com",
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x5cd324 = await _0x99af4f(_0x30880d, _0x1140f7);
      _0x5cd324.code == 0 ? _0x3a8213("账号[" + this.index + "],签到成功 😄 [" + _0x5cd324.data.signCommonInfo.date + "],获得积分:[" + _0x5cd324.data.signExperience + "]") : (_0x3a8213("账号[" + this.index + "],签到:失败 🙁 了呢,原因：" + _0x5cd324?.["message"]), console.log(_0x5cd324));
    } catch (_0x3a8119) {
      console.log(_0x3a8119);
    }
  }
  async ["task_forum_info"](_0x7f2930) {
    let _0x456c19 = "/api/forum/forum_list",
      _0x847773 = _0x3a3854.guid(),
      _0x5d4075 = _0x3a3854.ts13(),
      _0x5409fd = _0x456c19 + "&&" + this.sessionId + "&&" + _0x847773 + "&&" + _0x5d4075 + "&&" + this.key + "&&" + _0x640895,
      _0x16c3af = _0x3a3854.SHA256_Encrypt(_0x5409fd);
    try {
      {
        let _0x310ea5 = {
            "method": "GET",
            "url": "" + this.hostname + _0x456c19 + ("?tenantId=" + _0x640895),
            "headers": {
              "X-SESSION-ID": "" + this.sessionId,
              "X-REQUEST-ID": _0x847773,
              "X-TIMESTAMP": _0x5d4075,
              "X-SIGNATURE": _0x16c3af,
              "X-TENANT-ID": _0x640895,
              "User-Agent": _0x480616,
              "Cache-Control": "no-cache",
              "Host": "vapp.tmuyun.com",
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            }
          },
          _0x52e61e = await _0x99af4f(_0x310ea5, _0x7f2930);
        if (_0x52e61e.code == 0) {
          const _0x2eb111 = _0x52e61e?.["data"]?.["forum_list"]?.["length"] ? _0x52e61e?.["data"]?.["forum_list"][0]?.["id"] : undefined;
          if (_0x2eb111) {
            _0x3a8213("账号[" + this.index + "],获取社区信息成功 😄 ，准备开始获取相关列表");
            await this.task_forum_list(_0x2eb111);
          } else _0x3a8213("账号[" + this.index + "],获取社区为空 🙁 ，跳过社区任务");
        } else _0x3a8213("账号[" + this.index + "],获取社区信息:失败 🙁 了呢,原因：" + _0x52e61e?.["message"]), console.log(_0x52e61e);
      }
    } catch (_0x4fb17f) {
      console.log(_0x4fb17f);
    }
  }
  async ["task_forum_list"](_0x3fdc3a) {
    let _0x12ec35 = "/api/forum/thread_list",
      _0x430f61 = _0x3a3854.guid(),
      _0x2e228a = _0x3a3854.ts13(),
      _0xef7245 = _0x12ec35 + "&&" + this.sessionId + "&&" + _0x430f61 + "&&" + _0x2e228a + "&&" + this.key + "&&" + _0x640895,
      _0xa99dde = _0x3a3854.SHA256_Encrypt(_0xef7245);
    try {
      let _0x400704 = {
          "method": "GET",
          "url": "" + this.hostname + _0x12ec35 + ("?forum_id=" + _0x3fdc3a),
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x430f61,
            "X-TIMESTAMP": _0x2e228a,
            "X-SIGNATURE": _0xa99dde,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Host": "vapp.tmuyun.com",
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x127017 = await _0x99af4f(_0x400704, "获取帖子");
      if (_0x127017.code == 0) for (let _0x5a7786 = 0; _0x5a7786 < _0x127017.data.thread_list?.["length"]; _0x5a7786++) {
        if (!this?.["jobList"]?.["find"](_0x541114 => {
          return _0x541114?.["name"]?.["includes"]("帖子发布") && _0x541114?.["frequency"] > _0x541114?.["finish_times"] && _0x69a81e || _0x541114?.["name"]?.["includes"]("帖子点赞") && _0x541114?.["frequency"] > _0x541114?.["finish_times"];
        })) {
          _0x3a8213("账号[" + this.index + "],社区任务已完成，跳过-----");
          break;
        }
        _0x3a8213("账号[" + this.index + "],对帖子[" + _0x127017.data.thread_list[_0x5a7786].id + "]操作-----");
        await _0x382b7a(0.3 + Math.random() * 1);
        if (this?.["jobList"]?.["find"](_0x253e75 => {
          return _0x253e75?.["name"]?.["includes"]("帖子点赞") && _0x253e75?.["frequency"] > _0x253e75?.["finish_times"];
        })) {
          _0x127017.data.thread_list[_0x5a7786].already_liked ? _0x3a8213("账号[" + this.index + "],之前已经对帖子[" + _0x127017.data.thread_list[_0x5a7786].id + "]点赞过，不能再次点赞") : await this.task_forum_like(_0x127017.data.thread_list[_0x5a7786].id);
          await _0x382b7a(1 + Math.random() * 1);
        } else _0x3a8213("账号[" + this.index + "],无需对帖子点赞");
        this?.["jobList"]?.["find"](_0x8e5c98 => {
          return _0x8e5c98?.["name"]?.["includes"]("帖子发布") && _0x8e5c98?.["frequency"] > _0x8e5c98?.["finish_times"] && _0x69a81e;
        }) ? (await this.task_forum_post(_0x3fdc3a), await _0x382b7a(1 + Math.random() * 1)) : _0x3a8213("账号[" + this.index + "],无需发布帖子，可能是 已执行完毕该任务，或者 未开启该任务");
      } else _0x3a8213("账号[" + this.index + "],获取社区帖子:失败 🙁 了呢,原因：" + _0x127017?.["message"]), console.log(_0x127017);
    } catch (_0x3bad0b) {
      console.log(_0x3bad0b);
    }
  }
  async ["task_forum_like"](_0x5d9509) {
    let _0x50fc51 = "/api/forum/like",
      _0xcd9486 = _0x3a3854.guid(),
      _0xdfa360 = _0x3a3854.ts13(),
      _0x3e1746 = _0x50fc51 + "&&" + this.sessionId + "&&" + _0xcd9486 + "&&" + _0xdfa360 + "&&" + this.key + "&&" + _0x640895,
      _0x5af7d5 = _0x3a3854.SHA256_Encrypt(_0x3e1746);
    try {
      {
        let _0x4ea53d = _0x28edfd();
        _0x4ea53d.append("target_type", "1");
        _0x4ea53d.append("target_id", _0x5d9509);
        let _0x33640e = {
          "method": "POST",
          "url": "" + this.hostname + _0x50fc51,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0xcd9486,
            "X-TIMESTAMP": _0xdfa360,
            "X-SIGNATURE": _0x5af7d5,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryTDSOjpwy3A5ypRAo",
            "Host": "vapp.tmuyun.com",
            "Connection": "Keep-Alive",
            "Accept": "*/*",
            "X-ACCOUNT-ID": this.accountId
          },
          "body": _0x4ea53d
        };
        _0x33640e.headers["Content-Type"] = "multipart/form-data; boundary=" + _0x4ea53d.getBoundary();
        let _0x3e25c1 = await _0x99af4f(_0x33640e, "点赞帖子");
        if (_0x3e25c1.code == 0) {
          {
            const _0x506a16 = this?.["jobList"]?.["find"](_0x2160d7 => {
              return _0x2160d7?.["name"]?.["includes"]("帖子点赞") && _0x2160d7?.["frequency"] > _0x2160d7?.["finish_times"];
            });
            _0x506a16.finish_times++;
            _0x3a8213("账号[" + this.index + "],点赞帖子成功 😄 :[" + _0x5d9509 + "]");
          }
        } else {
          _0x3a8213("账号[" + this.index + "],点赞帖子:失败 🙁 了呢,原因：" + _0x3e25c1?.["message"]);
          console.log(_0x3e25c1);
        }
      }
    } catch (_0x5dd553) {
      console.log(_0x5dd553);
    }
  }
  async ["task_forum_post"](_0x3b960a) {
    let _0x1e938f = "/api/forum/post_thread",
      _0x5f1791 = _0x3a3854.guid(),
      _0x5ff1ab = _0x3a3854.ts13(),
      _0x246023 = _0x1e938f + "&&" + this.sessionId + "&&" + _0x5f1791 + "&&" + _0x5ff1ab + "&&" + this.key + "&&" + _0x640895,
      _0x381048 = _0x3a3854.SHA256_Encrypt(_0x246023);
    try {
      {
        let _0x5f1f83 = _0x28edfd();
        _0x5f1f83.append("forum_id", _0x3b960a);
        _0x5f1f83.append("title", "签到");
        _0x5f1f83.append("content", "今日打卡");
        _0x5f1f83.append("attachments", "");
        _0x5f1f83.append("location_name", "{}");
        let _0x794484 = {
          "method": "POST",
          "url": "" + this.hostname + _0x1e938f,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x5f1791,
            "X-TIMESTAMP": _0x5ff1ab,
            "X-SIGNATURE": _0x381048,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryMdIuuLGEa01BfEzM",
            "Host": "vapp.tmuyun.com",
            "Connection": "Keep-Alive",
            "Accept": "*/*",
            "X-ACCOUNT-ID": this.accountId
          },
          "body": _0x5f1f83
        };
        _0x794484.headers["Content-Type"] = "multipart/form-data; boundary=" + _0x5f1f83.getBoundary();
        let _0x30575d = await _0x99af4f(_0x794484, "发布帖子");
        if (_0x30575d.code == 0) {
          {
            const _0x345d0b = this?.["jobList"]?.["find"](_0x58851f => {
              return _0x58851f?.["name"]?.["includes"]("帖子发布") && _0x58851f?.["frequency"] > _0x58851f?.["finish_times"];
            });
            _0x345d0b.finish_times++;
            _0x3a8213("账号[" + this.index + "],发布帖子成功 😄 :[" + _0x3b960a + "]");
            await this.deleteForumPost(_0x30575d?.["data"]?.["thread_id"]);
          }
        } else _0x3a8213("账号[" + this.index + "],发布帖子:失败 🙁 了呢,原因：" + _0x30575d?.["message"]), console.log(_0x30575d);
      }
    } catch (_0x2baea7) {
      console.log(_0x2baea7);
    }
  }
  async ["deleteForumPost"](_0x1138f2) {
    let _0x43176c = "/api/forum/delete_thread",
      _0x16d06d = _0x3a3854.guid(),
      _0x5131ad = _0x3a3854.ts13(),
      _0x3105b5 = _0x43176c + "&&" + this.sessionId + "&&" + _0x16d06d + "&&" + _0x5131ad + "&&" + this.key + "&&" + _0x640895,
      _0xb9cfdc = _0x3a3854.SHA256_Encrypt(_0x3105b5);
    try {
      {
        let _0x77e351 = _0x28edfd();
        _0x77e351.append("thread_id", _0x1138f2);
        let _0x56a111 = {
          "method": "POST",
          "url": "" + this.hostname + _0x43176c,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x16d06d,
            "X-TIMESTAMP": _0x5131ad,
            "X-SIGNATURE": _0xb9cfdc,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryi1cQvxsAzoTagcpx",
            "Host": "vapp.tmuyun.com",
            "Connection": "Keep-Alive",
            "Accept": "*/*",
            "X-ACCOUNT-ID": this.accountId
          },
          "body": _0x77e351
        };
        _0x56a111.headers["Content-Type"] = "multipart/form-data; boundary=" + _0x77e351.getBoundary();
        let _0x2f8766 = await _0x99af4f(_0x56a111, "删除帖子");
        if (_0x2f8766.code == 0) _0x3a8213("账号[" + this.index + "],删除帖子成功 😄 :[" + _0x1138f2 + "]");else {
          _0x3a8213("账号[" + this.index + "],删除帖子:失败 🙁 了呢,原因：" + _0x2f8766?.["message"]);
          console.log(_0x2f8766);
        }
      }
    } catch (_0x31d539) {
      console.log(_0x31d539);
    }
  }
  async ["task_articlelist"](_0x311c89) {
    let _0x3a8bfb = "/api/article/channel_list",
      _0x2f55a1 = _0x3a3854.guid(),
      _0x660f27 = _0x3a3854.ts13(),
      _0x14686b = _0x3a8bfb + "&&" + this.sessionId + "&&" + _0x2f55a1 + "&&" + _0x660f27 + "&&" + this.key + "&&" + _0x640895,
      _0x241fbb = _0x3a3854.SHA256_Encrypt(_0x14686b);
    try {
      let _0x5c598a = {
          "method": "GET",
          "url": "" + this.hostname + _0x3a8bfb + ("?channel_id=" + this.artlistdata + "&isDiangHao=false&is_new=" + (Math.random() >= 0.5) + "&list_count=" + Math.floor(Math.random() * 10) + "&size=10"),
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x2f55a1,
            "X-TIMESTAMP": _0x660f27,
            "X-SIGNATURE": _0x241fbb,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x2621c5 = await _0x99af4f(_0x5c598a, _0x311c89);
      if (_0x2621c5.code == 0) {
        let _0x3f1aa5 = false;
        for (let _0x1a642d = 0; _0x1a642d < _0x2621c5.data.article_list?.["length"]; _0x1a642d++) {
          if (!this?.["jobList"]?.["find"](_0x34c550 => {
            return _0x34c550?.["name"]?.["includes"]("资讯评论") && _0x34c550?.["frequency"] > _0x34c550?.["finish_times"] && _0xe7a793 || _0x34c550?.["name"]?.["includes"]("分享资讯") && _0x34c550?.["frequency"] > _0x34c550?.["finish_times"] || _0x34c550?.["name"]?.["includes"]("资讯点赞") && _0x34c550?.["frequency"] > _0x34c550?.["finish_times"] || _0x34c550?.["name"]?.["includes"]("资讯阅读") && _0x34c550?.["frequency"] > _0x34c550?.["finish_times"];
          })) {
            _0x3a8213("账号[" + this.index + "],文章任务已完成，跳过后续文章-----");
            break;
          }
          _0x3a8213("账号[" + this.index + "],对 第" + (_0x1a642d + 1) + "篇 文章[" + _0x2621c5.data.article_list[_0x1a642d].id + "]操作-----");
          let _0x40f2e8 = _0x2621c5.data.article_list[_0x1a642d].id;
          await this.task_comment_pre();
          await _0x382b7a(1 + Math.random() * 1);
          await this.task_read(_0x40f2e8);
          await _0x382b7a(1 + Math.random() * 1);
          if (this?.["jobList"]?.["find"](_0x32c45b => {
            return _0x32c45b?.["name"]?.["includes"]("资讯点赞") && _0x32c45b?.["frequency"] > _0x32c45b?.["finish_times"];
          })) {
            {
              if (_0x2621c5.data.article_list[_0x1a642d].liked) _0x3a8213("账号[" + this.index + "],之前已经对资讯[" + _0x40f2e8 + "]点赞过，不能再次点赞");else !_0x2621c5.data.article_list[_0x1a642d].like_enabled && !_0xd8cdfe ? _0x3a8213("账号[" + this.index + "],资讯[" + _0x40f2e8 + "]未开启点赞功能，无法进行点赞") : await this.task_like(_0x40f2e8);
              await _0x382b7a(1 + Math.random() * 1);
            }
          }
          if (!_0x3f1aa5) {
            if (_0xe7a793 && !this.commentError && this?.["jobList"]?.["find"](_0x11b2ef => {
              return _0x11b2ef?.["name"]?.["includes"]("资讯评论") && _0x11b2ef?.["frequency"] > _0x11b2ef?.["finish_times"];
            })) await this.task_comment(_0x40f2e8), await _0x382b7a(2 + Math.random() * 1);else {
              if (this.commentError) {
                _0x3a8213("账号[" + this.index + "],评论文章遇见了一些问题 🙁 ，暂无解决方法，即将跳过后续评论，如果您有解决方法，欢迎提供，错误信息：该篇新闻不支持评论【评论失败，请重新进入当前页面！】");
                _0x3f1aa5 = true;
              }
            }
          } else {
            if (!this?.["jobList"]?.["find"](_0x49c51f => {
              return _0x49c51f?.["name"]?.["includes"]("分享资讯") && _0x49c51f?.["frequency"] > _0x49c51f?.["finish_times"] || _0x49c51f?.["name"]?.["includes"]("资讯点赞") && _0x49c51f?.["frequency"] > _0x49c51f?.["finish_times"] || _0x49c51f?.["name"]?.["includes"]("资讯阅读") && _0x49c51f?.["frequency"] > _0x49c51f?.["finish_times"];
            })) break;
          }
          this?.["jobList"]?.["find"](_0x39f1f5 => {
            return _0x39f1f5?.["name"]?.["includes"]("分享资讯") && _0x39f1f5?.["frequency"] > _0x39f1f5?.["finish_times"];
          }) && (!_0x2621c5.data.article_list[_0x1a642d].share_enabled && !_0xd8cdfe ? _0x3a8213("账号[" + this.index + "],文章[" + _0x40f2e8 + "]未开启分享功能，无法进行分享") : await this.task_share("3", _0x40f2e8, "分享"));
        }
      } else _0x3a8213("账号[" + this.index + "],获取文章:失败 🙁 了呢,原因：" + _0x2621c5?.["message"]), console.log(_0x2621c5);
    } catch (_0x1e4850) {
      console.log(_0x1e4850);
    }
  }
  async ["get_comment_history"](_0x3994e6) {
    let _0x51d7e5 = "/api/account_comment/comment_list",
      _0x94b03d = _0x3a3854.guid(),
      _0x2cadb2 = _0x3a3854.ts13(),
      _0x128e2e = _0x51d7e5 + "&&" + this.sessionId + "&&" + _0x94b03d + "&&" + _0x2cadb2 + "&&" + this.key + "&&" + _0x640895,
      _0x25f218 = _0x3a3854.SHA256_Encrypt(_0x128e2e);
    try {
      {
        let _0x4724f5 = {
            "method": "GET",
            "url": "" + this.hostname + _0x51d7e5 + "?size=999",
            "headers": {
              "X-SESSION-ID": "" + this.sessionId,
              "X-REQUEST-ID": _0x94b03d,
              "X-TIMESTAMP": _0x2cadb2,
              "X-SIGNATURE": _0x25f218,
              "X-TENANT-ID": _0x640895,
              "User-Agent": _0x480616,
              "Cache-Control": "no-cache",
              "Host": "vapp.tmuyun.com",
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            }
          },
          _0x51b6c4 = await _0x99af4f(_0x4724f5, _0x3994e6);
        if (_0x51b6c4.code == 0) for (let _0x293497 = 0; _0x293497 < _0x51b6c4.data.comment_list?.["length"]; _0x293497++) {
          {
            _0x3a8213("账号[" + this.index + "],对 第" + (_0x293497 + 1) + "个 评论[" + _0x51b6c4.data.comment_list[_0x293497].id + "]删除，删除总数量：" + _0x51b6c4.data.comment_list?.["length"] + "-----");
            let _0xf5d442 = _0x51b6c4.data.comment_list[_0x293497].id;
            await this.deleteComment(_0xf5d442);
            await _0x382b7a(1 + Math.random() * 1);
          }
        } else _0x3a8213("账号[" + this.index + "],删除评论:失败 🙁 了呢,原因：" + _0x51b6c4?.["message"]), console.log(_0x51b6c4);
      }
    } catch (_0x47740e) {
      console.log(_0x47740e);
    }
  }
  async ["task_read"](_0x24f188) {
    let _0x3e119a = "/api/article/detail",
      _0x412d49 = _0x3a3854.guid(),
      _0x9fe8d = _0x3a3854.ts13(),
      _0x255971 = _0x3e119a + "&&" + this.sessionId + "&&" + _0x412d49 + "&&" + _0x9fe8d + "&&" + this.key + "&&" + _0x640895,
      _0x464076 = _0x3a3854.SHA256_Encrypt(_0x255971);
    try {
      let _0x398a00 = {
          "method": "GET",
          "url": "" + this.hostname + _0x3e119a + "?id=" + _0x24f188,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x412d49,
            "X-TIMESTAMP": _0x9fe8d,
            "X-SIGNATURE": _0x464076,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Host": "vapp.tmuyun.com",
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x30a485 = await _0x99af4f(_0x398a00, "阅读文章");
      if (_0x30a485.code == 0) {
        const _0x4265a1 = this?.["jobList"]?.["find"](_0x23ba0e => {
          return _0x23ba0e?.["name"]?.["includes"]("资讯阅读") && _0x23ba0e?.["frequency"] > _0x23ba0e?.["finish_times"];
        });
        _0x4265a1 && _0x4265a1.finish_times++;
        _0x3a8213("账号[" + this.index + "],阅读文章成功 😄 :[" + _0x30a485.data.article.id + "]");
      } else _0x3a8213("账号[" + this.index + "],阅读文章:失败 🙁 了呢,原因：" + _0x30a485?.["message"]);
    } catch (_0x46760b) {
      console.log(_0x46760b);
    }
  }
  async ["task_like"](_0x1bd2ae) {
    let _0x9a514a = "/api/favorite/like",
      _0x529336 = _0x3a3854.guid(),
      _0x2f3059 = _0x3a3854.ts13(),
      _0x10bdfe = _0x9a514a + "&&" + this.sessionId + "&&" + _0x529336 + "&&" + _0x2f3059 + "&&" + this.key + "&&" + _0x640895,
      _0x2ae5b7 = _0x3a3854.SHA256_Encrypt(_0x10bdfe);
    try {
      let _0x2363c5 = {
          "method": "POST",
          "url": "" + this.hostname + _0x9a514a,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x529336,
            "X-TIMESTAMP": _0x2f3059,
            "X-SIGNATURE": _0x2ae5b7,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "vapp.tmuyun.com",
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          },
          "form": {
            "action": "true",
            "id": _0x1bd2ae
          }
        },
        _0x33663d = await _0x99af4f(_0x2363c5, "点赞文章");
      if (_0x33663d.code == 0) {
        const _0x169070 = this?.["jobList"]?.["find"](_0x93e5c4 => {
          return _0x93e5c4?.["name"]?.["includes"]("资讯点赞") && _0x93e5c4?.["frequency"] > _0x93e5c4?.["finish_times"];
        });
        _0x169070.finish_times++;
        _0x3a8213("账号[" + this.index + "],点赞文章成功 😄 :[" + _0x1bd2ae + "]");
      } else _0x3a8213("账号[" + this.index + "],用户查询:失败 🙁 了呢,原因：" + _0x33663d?.["message"]), console.log(_0x33663d);
    } catch (_0x57cb0f) {
      console.log(_0x57cb0f);
    }
  }
  async ["RSA_Encrypt"](_0xc209cc) {
    const _0x2fa9b3 = "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD6XO7e9YeAOs+cFqwa7ETJ+WXizPqQeXv68i5vqw9pFREsrqiBTRcg7wB0RIp3rJkDpaeVJLsZqYm5TW7FWx/iOiXFc+zCPvaKZric2dXCw27EvlH5rq+zwIPDAJHGAfnn1nmQH7wR3PCatEIb8pz5GFlTHMlluw4ZYmnOwg+thwIDAQAB\n-----END PUBLIC KEY-----",
      _0x1fceaf = _0x3a3854.RSA_Encrypt(_0xc209cc, _0x2fa9b3);
    return _0x1fceaf;
  }
  async ["loginByCode"](_0x1d4388, _0x30edb8) {
    try {
      {
        let _0x2b7947 = "/api/zbtxz/login",
          _0x29a6dd = _0x3a3854.guid(),
          _0x487700 = _0x3a3854.ts13(),
          _0x37064e = _0x2b7947 + "&&" + (this.sessionId || _0x1d4388) + "&&" + _0x29a6dd + "&&" + _0x487700 + "&&" + this.key + "&&" + _0x640895,
          _0x563e33 = _0x3a3854.SHA256_Encrypt(_0x37064e),
          _0x38541d = {
            "method": "POST",
            "url": "" + this.hostname + _0x2b7947,
            "headers": {
              "X-SESSION-ID": "" + (this.sessionId || _0x1d4388),
              "X-REQUEST-ID": _0x29a6dd,
              "X-TIMESTAMP": _0x487700,
              "X-SIGNATURE": _0x563e33,
              "X-TENANT-ID": _0x640895,
              "User-Agent": _0x480616,
              "Cache-Control": "no-cache",
              "Content-Type": "application/x-www-form-urlencoded",
              "Host": this.host,
              "Connection": "Keep-Alive"
            },
            "form": "code=" + _0x30edb8
          },
          _0x48e890 = await _0x99af4f(_0x38541d, "取Token");
        if (_0x48e890.code == 0) {
          this.valid = true;
          this.sessionId = _0x48e890.data.session.id;
          this.accountId = _0x48e890.data.session.account || _0x48e890.data.session.account_id;
          _0x9570a6(_0x2853ab + "_config", this.account, JSON.stringify({
            "id": this.accountId,
            "sessionId": this.sessionId
          }));
          _0x3a8213("账号[" + this.index + "],取Token成功 😄 ");
        } else this.valid = false, _0x3a8213("账号[" + this.index + "],取Token:失败 🙁 了呢,原因：" + _0x48e890?.["message"]), console.log(_0x48e890);
      }
    } catch (_0x5ac084) {
      console.log(_0x5ac084);
    }
  }
  async ["loginInit"](_0xe44b85) {
    try {
      const _0x282afb = "";
      let _0x64ae32 = "/api/account/init",
        _0x41f9ed = _0x3a3854.guid(),
        _0x50d720 = _0x3a3854.ts13(),
        _0x519595 = _0x64ae32 + "&&" + _0x41f9ed + "&&" + _0x50d720 + "&&" + this.key + "&&" + _0x640895,
        _0x29cf82 = _0x3a3854.SHA256_Encrypt(_0x519595),
        _0x2bf4f0 = {
          "method": "POST",
          "url": "" + this.hostname + _0x64ae32,
          "headers": {
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-SIGNATURE": _0x29cf82,
            "X-REQUEST-ID": _0x41f9ed,
            "Content-Length": _0x282afb?.["length"],
            "X-SESSION-ID": "",
            "X-TENANT-ID": _0x640895,
            "X-TIMESTAMP": _0x50d720
          },
          "form": _0x282afb
        };
      this.authCookie && (_0x2bf4f0.headers.Cookie = this.authCookie);
      let _0x1a33cb = await _0x99af4f(_0x2bf4f0, "登录初始化");
      _0x1a33cb.code == 0 ? (_0x3a8213("账号[" + this.index + "],登录初始化成功 😄 "), _0x1cd8cf = _0x1a33cb.data.session.id, await this.loginByCode(_0x1a33cb.data.session.id, _0xe44b85)) : (this.valid = false, _0x3a8213("账号[" + this.index + "],登录初始化:失败 🙁 了呢,原因：" + _0x1a33cb?.["message"]));
    } catch (_0xf48458) {
      console.log(_0xf48458);
    }
  }
  async ["login"]() {
    let _0x54cbb2 = "/web/oauth/credential_auth",
      _0x66008d = _0x3a3854.guid(),
      _0x23c125 = _0x3a3854.ts13(),
      _0x1b6451 = _0x54cbb2 + "&&" + _0x66008d + "&&" + _0x23c125 + "&&" + this.key + "&&" + _0x640895,
      _0x4472d9 = _0x3a3854.SHA256_Encrypt(_0x1b6451);
    try {
      {
        let _0x82b294 = {
          "method": "POST",
          "url": "https://passport.tmuyun.com/web/oauth/credential_auth",
          "headers": {
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "passport.tmuyun.com",
            "Connection": "Keep-Alive"
          },
          "form": "client_id=" + (_0x5dd86d || "10001") + "&password=" + encodeURIComponent(await this.RSA_Encrypt(this.password)) + "&phone_number=" + this.account
        };
        this.authCookie && (_0x82b294.headers.Cookie = this.authCookie);
        let _0x3697b3 = await _0x99af4f(_0x82b294, "登录");
        if (_0x3697b3.code == 0) _0x3a8213("账号[" + this.index + "],登录成功 😄 "), !_0x1cd8cf ? await this.loginInit(_0x3697b3.data.authorization_code.code) : await this.loginByCode(_0x1cd8cf, _0x3697b3.data.authorization_code.code);else {
          this.valid = false;
          _0x3a8213("账号[" + this.index + "],登录:失败 🙁 了呢,原因：" + _0x3697b3?.["message"]);
          console.log(_0x3697b3);
        }
      }
    } catch (_0x37a6bd) {
      console.log(_0x37a6bd);
    }
  }
  async ["app_start"]() {
    let _0x5ca892 = "/api/app_start_page/list/new",
      _0x1f2efc = _0x3a3854.guid(),
      _0x355baa = _0x3a3854.ts13(),
      _0x47c5b1 = _0x5ca892 + "&&" + _0x12b278 + "&&" + _0x1f2efc + "&&" + _0x355baa + "&&" + this.key + "&&" + _0x640895,
      _0x29d8e8 = _0x3a3854.SHA256_Encrypt(_0x47c5b1);
    try {
      let _0x15e138 = {
          "method": "GET",
          "url": "" + this.hostname + _0x5ca892 + "?height=2206&width=1080",
          "headers": {
            "X-SESSION-ID": "" + _0x12b278,
            "X-REQUEST-ID": _0x1f2efc,
            "X-TIMESTAMP": _0x355baa,
            "X-SIGNATURE": _0x29d8e8,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x4c2e7f = await _0x99af4f(_0x15e138, "App启动中");
      if (_0x4c2e7f.code == 0) _0x3a8213("账号[" + this.index + "],App启动成功 😄 ");else {
        _0x3a8213("账号[" + this.index + "],App启动:失败 🙁 了呢,原因：" + _0x4c2e7f?.["message"]);
      }
    } catch (_0x5d6303) {
      console.log(_0x5d6303);
    }
  }
  async ["web_start"]() {
    let _0x25bdf2 = "/web/init",
      _0x46e214 = _0x3a3854.guid(),
      _0x3695b4 = _0x3a3854.ts13(),
      _0x157d81 = _0x25bdf2 + "&&" + _0x12b278 + "&&" + _0x46e214 + "&&" + _0x3695b4 + "&&" + this.key + "&&" + _0x640895,
      _0x30d189 = _0x3a3854.SHA256_Encrypt(_0x157d81);
    try {
      let _0x4168e5 = {
          "method": "GET",
          "url": "https://passport.tmuyun.com/web/init?client_id=" + _0x5dd86d,
          "headers": {
            "X-SESSION-ID": "" + _0x12b278,
            "X-REQUEST-ID": _0x46e214,
            "X-TIMESTAMP": _0x3695b4,
            "X-SIGNATURE": _0x30d189,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "passport.tmuyun.com",
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x579293 = await _0x99af4f(_0x4168e5, "Web初始化中", true),
        _0x3efde2 = _0x579293?.["body"];
      if (_0x3efde2.code == 0) {
        {
          let _0x33630e = _0x579293?.["rawHeaders"]?.["find"](_0x48a7aa => _0x48a7aa?.["includes"]("SESSION"));
          _0x33630e && (this.authCookie = _0x33630e);
          _0x3a8213("账号[" + this.index + "],Web初始化成功 😄 ");
        }
      } else {
        _0x3a8213("账号[" + this.index + "],Web初始化:失败 🙁 了呢,原因：" + _0x3efde2?.["message"]);
      }
    } catch (_0x2412b3) {
      console.log(_0x2412b3);
    }
  }
  async ["iframe_start"]() {
    let _0x36b937 = "/api/bullet_frame/detail",
      _0x32c916 = _0x3a3854.guid(),
      _0x93c8aa = _0x3a3854.ts13(),
      _0xf08ca2 = _0x36b937 + "&&" + _0x12b278 + "&&" + _0x32c916 + "&&" + _0x93c8aa + "&&" + this.key + "&&" + _0x640895,
      _0x57180a = _0x3a3854.SHA256_Encrypt(_0xf08ca2);
    try {
      let _0x5435e9 = {
          "method": "GET",
          "url": "" + this.hostname + _0x36b937,
          "headers": {
            "X-SESSION-ID": "" + _0x12b278,
            "X-REQUEST-ID": _0x32c916,
            "X-TIMESTAMP": _0x93c8aa,
            "X-SIGNATURE": _0x57180a,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0xb7097f = await _0x99af4f(_0x5435e9, "启动WebView中");
      _0xb7097f.code == 0 ? _0x3a8213("账号[" + this.index + "],启动WebView成功 😄 ") : _0x3a8213("账号[" + this.index + "],启动WebView:失败 🙁 了呢,原因：" + _0xb7097f?.["message"]);
    } catch (_0x242375) {
      console.log(_0x242375);
    }
  }
  async ["get_app_version"]() {
    let _0xa3ba7 = "/api/app_version/detail",
      _0x1f509a = _0x3a3854.guid(),
      _0x51460a = _0x3a3854.ts13(),
      _0x588d9f = _0xa3ba7 + "&&" + _0x12b278 + "&&" + _0x1f509a + "&&" + _0x51460a + "&&" + this.key + "&&" + _0x640895,
      _0x422f5f = _0x3a3854.SHA256_Encrypt(_0x588d9f);
    try {
      let _0x413f14 = {
          "method": "GET",
          "url": "" + this.hostname + _0xa3ba7,
          "headers": {
            "X-SESSION-ID": "" + _0x12b278,
            "X-REQUEST-ID": _0x1f509a,
            "X-TIMESTAMP": _0x51460a,
            "X-SIGNATURE": _0x422f5f,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive"
          }
        },
        _0xb3adf1 = await _0x99af4f(_0x413f14, "获取版本信息中");
      _0xb3adf1.code == 0 ? _0x3a8213("账号[" + this.index + "],获取版本信息成功 😄 ") : _0x3a8213("账号[" + this.index + "],获取版本信息:失败 🙁 了呢,原因：" + _0xb3adf1?.["message"]);
    } catch (_0x2bcda0) {
      console.log(_0x2bcda0);
    }
  }
  async ["config_get"]() {
    let _0x574492 = "/api/app_version_customize_config/mine",
      _0x3d582d = _0x3a3854.guid(),
      _0x30c960 = _0x3a3854.ts13(),
      _0x42c167 = _0x574492 + "&&" + _0x12b278 + "&&" + _0x3d582d + "&&" + _0x30c960 + "&&" + this.key + "&&" + _0x640895,
      _0x221afa = _0x3a3854.SHA256_Encrypt(_0x42c167);
    try {
      let _0x5dd706 = {
          "method": "GET",
          "url": "" + this.hostname + _0x574492,
          "headers": {
            "X-SESSION-ID": "" + _0x12b278,
            "X-REQUEST-ID": _0x3d582d,
            "X-TIMESTAMP": _0x30c960,
            "X-SIGNATURE": _0x221afa,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Host": this.host,
            "Connection": "Keep-Alive"
          }
        },
        _0x484de2 = await _0x99af4f(_0x5dd706, "获取App配置中");
      _0x484de2.code == 0 ? _0x3a8213("账号[" + this.index + "],获取App配置成功 😄 ") : _0x3a8213("账号[" + this.index + "],获取App配置:失败 🙁 了呢, 原因：" + _0x484de2?.["message"]);
    } catch (_0x54a680) {
      console.log(_0x54a680);
    }
  }
  async ["get_unread_msg"]() {
    let _0x4ef95b = "/api/chuanbo/unread",
      _0x1e89eb = _0x3a3854.guid(),
      _0xf99b79 = _0x3a3854.ts13(),
      _0x324240 = _0x4ef95b + "&&" + this.sessionId + "&&" + _0x1e89eb + "&&" + _0xf99b79 + "&&" + this.key + "&&" + _0x640895,
      _0x56efba = _0x3a3854.SHA256_Encrypt(_0x324240);
    try {
      {
        let _0x37c9dc = {
            "method": "GET",
            "url": "" + this.hostname + _0x4ef95b,
            "headers": {
              "X-SESSION-ID": "" + this.sessionId,
              "X-REQUEST-ID": _0x1e89eb,
              "X-TIMESTAMP": _0xf99b79,
              "X-SIGNATURE": _0x56efba,
              "X-TENANT-ID": _0x640895,
              "User-Agent": _0x480616,
              "Cache-Control": "no-cache",
              "Content-Type": "application/x-www-form-urlencoded",
              "Host": this.host,
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            }
          },
          _0x399431 = await _0x99af4f(_0x37c9dc, "获取未读信息");
        _0x399431.code == 0 ? _0x3a8213("账号[" + this.index + "],获取未读信息成功 😄 ") : _0x3a8213("账号[" + this.index + "],获取未读信息:失败 🙁 了呢,原因：" + _0x399431?.["message"]);
      }
    } catch (_0x4d56af) {
      console.log(_0x4d56af);
    }
  }
  async ["task_comment_pre"]() {
    let _0x2a7f33 = "/api/app_feature_switch/list",
      _0x2e2cef = _0x3a3854.guid(),
      _0x146451 = _0x3a3854.ts13(),
      _0x29db87 = _0x2a7f33 + "&&" + this.sessionId + "&&" + _0x2e2cef + "&&" + _0x146451 + "&&" + this.key + "&&" + _0x640895,
      _0x36f67f = _0x3a3854.SHA256_Encrypt(_0x29db87);
    try {
      let _0x2acab5 = {
          "method": "GET",
          "url": "" + this.hostname + _0x2a7f33,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x2e2cef,
            "X-TIMESTAMP": _0x146451,
            "X-SIGNATURE": _0x36f67f,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": this.host,
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0xfa475 = await _0x99af4f(_0x2acab5, "文章准备工作");
      if (_0xfa475.code == 0) _0x3a8213("账号[" + this.index + "],文章准备工作成功 😄 ");else {
        _0x3a8213("账号[" + this.index + "],文章准备工作:失败 🙁 了呢,原因：" + _0xfa475?.["message"]);
      }
    } catch (_0x17250e) {
      console.log(_0x17250e);
    }
  }
  async ["task_comment"](_0x1e4351) {
    let _0x4557a9 = _0x5759cc ? await this.txt_api() : _0x61dbac[Math.floor(Math.random() * _0x61dbac?.["length"])],
      _0x447d54 = "/api/comment/create",
      _0x750491 = _0x3a3854.guid(),
      _0x450140 = _0x3a3854.ts13(),
      _0x124e74 = _0x447d54 + "&&" + this.sessionId + "&&" + _0x750491 + "&&" + _0x450140 + "&&" + this.key + "&&" + _0x640895,
      _0x348b1b = _0x3a3854.SHA256_Encrypt(_0x124e74);
    try {
      {
        let _0x1d7219 = {
            "method": "POST",
            "url": "" + this.hostname + _0x447d54,
            "headers": {
              "X-SESSION-ID": "" + this.sessionId,
              "X-REQUEST-ID": _0x750491,
              "X-TIMESTAMP": _0x450140,
              "X-SIGNATURE": _0x348b1b,
              "X-TENANT-ID": _0x640895,
              "User-Agent": _0x480616,
              "Cache-Control": "no-cache",
              "Content-Type": "application/x-www-form-urlencoded",
              "Host": "vapp.tmuyun.com",
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            },
            "form": {
              "channel_article_id": _0x1e4351,
              "content": _0x4557a9
            }
          },
          _0x5c08e0 = await _0x99af4f(_0x1d7219, "评论");
        if (_0x5c08e0.code == 0) {
          {
            const _0x458a1c = this?.["jobList"]?.["find"](_0x313676 => {
              return _0x313676?.["name"]?.["includes"]("资讯评论") && _0x313676?.["frequency"] > _0x313676?.["finish_times"];
            });
            _0x458a1c.finish_times++;
            _0x3a8213("账号[" + this.index + "],评论成功 😄 [" + _0x4557a9 + "]");
            const _0x1e670e = _0x5c08e0?.["data"]?.["comment"]?.["id"];
            await _0x382b7a(1 + Math.random() * 1);
            await this.deleteComment(_0x1e670e);
          }
        } else _0x3a8213("账号[" + this.index + "],评论:失败 🙁 了呢,原因：" + _0x5c08e0?.["message"]), this.commentError = _0x5c08e0?.["message"]?.["includes"]("请重新进入当前页面");
      }
    } catch (_0x46f767) {
      console.log(_0x46f767);
    }
  }
  async ["deleteComment"](_0x427c54) {
    let _0xd331b9 = "/api/comment/delete",
      _0x120bf0 = _0x3a3854.guid(),
      _0xaeba48 = _0x3a3854.ts13(),
      _0x40cf5e = _0xd331b9 + "&&" + this.sessionId + "&&" + _0x120bf0 + "&&" + _0xaeba48 + "&&" + this.key + "&&" + _0x640895,
      _0x1e44c5 = _0x3a3854.SHA256_Encrypt(_0x40cf5e);
    try {
      {
        let _0x5df9c7 = {
            "method": "POST",
            "url": "" + this.hostname + _0xd331b9,
            "headers": {
              "X-SESSION-ID": "" + this.sessionId,
              "X-REQUEST-ID": _0x120bf0,
              "X-TIMESTAMP": _0xaeba48,
              "X-SIGNATURE": _0x1e44c5,
              "X-TENANT-ID": _0x640895,
              "User-Agent": _0x480616,
              "Cache-Control": "no-cache",
              "Content-Type": "application/x-www-form-urlencoded",
              "Host": "vapp.tmuyun.com",
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            },
            "form": {
              "comment_id": _0x427c54
            }
          },
          _0x17c2e0 = await _0x99af4f(_0x5df9c7, "删除评论");
        if (_0x17c2e0.code == 0) {
          _0x3a8213("账号[" + this.index + "], 删除评论成功 😄 ");
        } else _0x3a8213("账号[" + this.index + "],删除评论失败 🙁 了呢,原因：" + _0x17c2e0?.["message"]);
      }
    } catch (_0x2cdaec) {
      console.log(_0x2cdaec);
    }
  }
  async ["task_share"](_0x22fe7c, _0xe51a0d, _0x46eae3) {
    let _0xbb5874 = "/api/user_mumber/doTask",
      _0x40f076 = _0x3a3854.guid(),
      _0x3a532c = _0x3a3854.ts13(),
      _0x2d6078 = _0xbb5874 + "&&" + this.sessionId + "&&" + _0x40f076 + "&&" + _0x3a532c + "&&" + this.key + "&&" + _0x640895,
      _0x8599b7 = _0x3a3854.SHA256_Encrypt(_0x2d6078);
    try {
      {
        let _0x4e62a3 = {
            "method": "POST",
            "url": "" + this.hostname + _0xbb5874,
            "headers": {
              "X-SESSION-ID": "" + this.sessionId,
              "X-REQUEST-ID": _0x40f076,
              "X-TIMESTAMP": _0x3a532c,
              "X-SIGNATURE": _0x8599b7,
              "X-TENANT-ID": _0x640895,
              "User-Agent": _0x480616,
              "Cache-Control": "no-cache",
              "Content-Type": "application/x-www-form-urlencoded",
              "Host": "vapp.tmuyun.com",
              "Connection": "Keep-Alive",
              "X-ACCOUNT-ID": this.accountId
            },
            "form": {
              "memberType": _0x22fe7c,
              "member_type": _0x22fe7c,
              "target_id": _0xe51a0d
            }
          },
          _0x5b8ea1 = await _0x99af4f(_0x4e62a3, _0x46eae3);
        if (_0x5b8ea1.code == 0) {
          const _0x3cd457 = this?.["jobList"]?.["find"](_0x2cf920 => {
            return _0x2cf920?.["name"]?.["includes"](_0x22fe7c === "3" ? "分享资讯" : "使用本地服务") && _0x2cf920?.["frequency"] > _0x2cf920?.["finish_times"];
          });
          _0x3cd457 && _0x3cd457.finish_times++;
          _0x3a8213("账号[" + this.index + "]," + _0x46eae3 + "成功 😄 ");
          _0x5b8ea1.data && "账号[" + this.index + "]," + _0x46eae3 + ("执行完毕共获得:[" + _0x5b8ea1.data.score_notify.integral + "]");
        } else _0x3a8213("账号[" + this.index + "], " + _0x46eae3 + " :失败 🙁 了呢,原因：" + _0x5b8ea1?.["message"]), console.log(_0x5b8ea1);
      }
    } catch (_0x21b392) {
      console.log(_0x21b392);
    }
  }
  async ["user_info"]() {
    let _0x2cc045 = "/api/user_mumber/account_detail",
      _0x4e94a5 = _0x3a3854.guid(),
      _0x55d4a1 = _0x3a3854.ts13(),
      _0x24fcb9 = _0x2cc045 + "&&" + this.sessionId + "&&" + _0x4e94a5 + "&&" + _0x55d4a1 + "&&" + this.key + "&&" + _0x640895,
      _0x3ef92a = _0x3a3854.SHA256_Encrypt(_0x24fcb9);
    try {
      let _0x5780f9 = {
          "method": "GET",
          "url": "" + this.hostname + _0x2cc045,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x4e94a5,
            "X-TIMESTAMP": _0x55d4a1,
            "X-SIGNATURE": _0x3ef92a,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Host": "vapp.tmuyun.com",
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          }
        },
        _0x403b90 = await _0x99af4f(_0x5780f9, "用户信息");
      _0x403b90.code == 0 ? (this.valid = true, this.requestedUserInfo = true, _0x3a8213("账号[" + this.index + "],验证成功 😄 ，账号可正常使用，[" + _0x403b90.data.rst.nick_name + "]"), _0x403b90.data.rst.ref_user_uid == "" && (await this.share_code("推荐"))) : (this.valid = true, _0x3a8213("账号[" + this.index + "],验证失败 🙁 了呢,原因：" + _0x403b90?.["message"]));
    } catch (_0x5ac9da) {
      console.log(_0x5ac9da);
    }
  }
  async ["share_code"](_0x583a6a) {
    let _0x58ed34 = "/api/account/update_ref_code",
      _0x4601f7 = _0x3a3854.guid(),
      _0x14332b = _0x3a3854.ts13(),
      _0x25e707 = _0x58ed34 + "&&" + this.sessionId + "&&" + _0x4601f7 + "&&" + _0x14332b + "&&" + this.key + "&&" + _0x640895,
      _0x53152e = _0x3a3854.SHA256_Encrypt(_0x25e707);
    try {
      let _0x1bdc85 = {
          "method": "POST",
          "url": "" + this.hostname + _0x58ed34,
          "headers": {
            "X-SESSION-ID": "" + this.sessionId,
            "X-REQUEST-ID": _0x4601f7,
            "X-TIMESTAMP": _0x14332b,
            "X-SIGNATURE": _0x53152e,
            "X-TENANT-ID": _0x640895,
            "User-Agent": _0x480616,
            "Cache-Control": "no-cache",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "vapp.tmuyun.com",
            "Connection": "Keep-Alive",
            "X-ACCOUNT-ID": this.accountId
          },
          "form": {
            "ref_code": _0x1b84cc || "WET28W"
          }
        },
        _0x323af3 = await _0x99af4f(_0x1bdc85, _0x583a6a);
      if (_0x323af3.code == 0) {} else {}
    } catch (_0x452d78) {
      console.log(_0x452d78);
    }
  }
}
!(async () => {
  _0x3a8213("开始读取配置的数据……");
  if (!(await _0x44cd09())) return;
  _0x58a4ac.length > 0 ? (_0x3a8213(_0x3bef6d), await _0x382b7a(0.1), await _0x36b867()) : (console.log("无可用账号，停止执行\n" + _0x12897f), exit());
  await _0x23c311(_0x1fc348?.["name"] + "：" + _0x2f4e46 + "\n" + _0x592a1f);
})().catch(_0x146d95 => console.log(_0x146d95)).finally(() => _0x1fc348.done());
function _0x9570a6(_0xfa793a, _0x53bec3, _0x5338f9) {
  let _0x54ba31 = {},
    _0x45cb00 = {};
  try {
    _0x54ba31 = _0x2bcfec.readFileSync(_0xfa793a + ".json", "utf8");
    _0x45cb00 = JSON.parse(_0x54ba31);
  } catch (_0x4a2672) {}
  _0x45cb00[_0x53bec3] = _0x5338f9;
  const _0x594a9c = JSON.stringify(_0x45cb00);
  try {
    _0x2bcfec.writeFileSync(_0xfa793a + ".json", _0x594a9c);
  } catch (_0x4d67e5) {
    _0x4d67e5.code === "ENOENT" ? _0x2bcfec.writeFileSync(_0xfa793a + ".json", _0x594a9c) : console.error("保存文件时发生错误：", _0x4d67e5);
  }
}
function _0xb89fb0(_0x3004bc, _0x1b7770) {
  try {
    const _0x536183 = _0x2bcfec.readFileSync(_0x3004bc + ".json", "utf8"),
      _0x78ee6b = JSON.parse(_0x536183);
    return _0x78ee6b[_0x1b7770];
  } catch (_0xd1174a) {
    {
      if (_0xd1174a.code === "ENOENT") return undefined;else console.error("读取文件时发生错误：", _0xd1174a);
    }
  }
}
async function _0x44cd09() {
  if (_0x4be5bc) {
    let _0x2a0252 = _0x23fde9[0];
    for (let _0x412792 of _0x23fde9) if (_0x4be5bc.indexOf(_0x412792) > -1) {
      {
        _0x2a0252 = _0x412792;
        break;
      }
    }
    for (let _0x2b1f14 of _0x4be5bc.split(_0x2a0252)) _0x2b1f14 && _0x58a4ac.push(new _0xfc37c1(_0x2b1f14?.["split"]("#")));
    _0x3ebae7 = _0x58a4ac.length;
  } else {
    {
      console.log("未找到CK");
      return;
    }
  }
  console.log("共找到" + _0x3ebae7 + "个账号");
  return true;
}
async function _0x99af4f(_0x5eaacb, _0x516597, _0x292d0f) {
  return new Promise(_0x31f318 => {
    if (!_0x516597) {
      {
        let _0x4bdcbe = arguments.callee.toString(),
          _0x193f63 = /function\s*(\w*)/i,
          _0x58599f = _0x193f63.exec(_0x4bdcbe);
        _0x516597 = _0x58599f[1];
      }
    }
    if (_0x311de2) {
      console.log("\n【debug】===============这是" + _0x516597 + "请求信息===============");
      console.log(_0x5eaacb);
    }
    _0x2a8d91(_0x5eaacb, function (_0x40cf71, _0x5086ee) {
      if (_0x40cf71) throw new Error(_0x40cf71);
      let _0x354654 = _0x5086ee.body;
      try {
        if (_0x311de2) {
          console.log("\n\n【debug】===============这是" + _0x516597 + "返回数据==============");
          console.log(_0x354654);
        }
        if (typeof _0x354654 == "string") {
          if (_0xb94986(_0x354654)) {
            {
              let _0x39b3f1 = JSON.parse(_0x354654);
              _0x311de2 && (console.log("\n【debug】=============这是" + _0x516597 + "json解析后数据============"), console.log(_0x39b3f1));
              !_0x292d0f ? _0x31f318(_0x39b3f1) : _0x31f318({
                ..._0x5086ee,
                "body": _0x39b3f1
              });
            }
          } else {
            {
              let _0x13957b = _0x354654;
              if (!_0x292d0f) {
                _0x31f318(_0x13957b);
              } else _0x31f318({
                ..._0x5086ee,
                "body": _0x13957b
              });
            }
          }
          function _0xb94986(_0x167318) {
            if (typeof _0x167318 == "string") try {
              {
                if (typeof JSON.parse(_0x167318) == "object") return true;
              }
            } catch (_0x53c45b) {
              return false;
            }
            return false;
          }
        } else {
          let _0x3b1506 = _0x354654;
          !_0x292d0f ? _0x31f318(_0x3b1506) : _0x31f318({
            ..._0x5086ee,
            "body": _0x3b1506
          });
        }
      } catch (_0x5ad457) {
        console.log(_0x40cf71, _0x5086ee);
        console.log("\n " + _0x516597 + "失败了!请稍后尝试!!");
      } finally {
        _0x31f318();
      }
    });
  });
}
function _0x382b7a(_0x4110b6) {
  return new Promise(function (_0x41df9d) {
    setTimeout(_0x41df9d, _0x4110b6 * 1000);
  });
}
function _0x3a8213(_0x439337) {
  if (_0x1fc348.isNode()) {
    _0x439337 && (console.log("" + _0x439337), _0x52d7bc += "" + _0x439337);
  } else console.log("" + _0x439337), msg += "" + _0x439337;
}
async function _0x23c311(_0x4435e9) {
  if (!_0x4435e9) return;
  if (_0x166835 > 0) {
    {
      if (_0x1fc348.isNode()) {
        var _0x3b9840 = require("./sendNotify");
        await _0x3b9840.sendNotify(_0x1fc348.name, _0x4435e9);
      } else _0x1fc348.msg(_0x1fc348.name, "", _0x4435e9);
    }
  } else console.log("通知服务未开启，不予推送：", _0x4435e9);
}
function _0x341e2e() {
  _0x1fc348.isNode() && (process.on("uncaughtException", function (_0x31e404) {
    if (_0x31e404.code === "MODULE_NOT_FOUND") {
      const _0x2e66f6 = _0x31e404.message.split("'")[1];
      _0x2e66f6.startsWith("./") ? console.log("缺少依赖文件，请前往代码库寻找 " + _0x2e66f6 + " 代码文件，放在本脚本同一目录下 \n 什么？不会？v我50我教你！") : console.log("缺少依赖，请安装 " + _0x2e66f6 + " 库： " + _0x2e66f6 + " \n 什么？不会？v我50我教你！");
    } else console.log("发生错误：" + _0x31e404.message);
  }), process.on("unhandledRejection", function (_0x4e7791) {
    const _0x470020 = _0x4e7791.stack.split("\n");
    if (_0x470020.length > 1) {
      const _0x5b765f = _0x470020[1],
        _0x3b8a06 = _0x5b765f.match(/\((.*):(\d+):(\d+)\)/);
      if (_0x3b8a06) {
        const _0x2c0400 = _0x3b8a06[1],
          _0x2c65ef = _0x3b8a06[2];
        console.log("程序执行出现异常，错误信息：" + _0x4e7791.message + ("，错误发生在 " + _0x2c0400 + " 的第 " + _0x2c65ef + " 行 \n 请在本仓库建立 issue 并附上日志或者截图即可？什么，很着急？v我50疯狂星期四！"));
      }
    } else console.log("发生错误：" + _0x4e7791.message);
  }));
}
function _0x38a41a(_0x416c00, _0x574ff0) {
  "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
  class _0xabb086 {
    constructor(_0x12e2f4) {
      this.env = _0x12e2f4;
    }
    ["send"](_0x4c67c6, _0x1660cf = "GET") {
      _0x4c67c6 = "string" == typeof _0x4c67c6 ? {
        "url": _0x4c67c6
      } : _0x4c67c6;
      let _0x291ae3 = this.get;
      "POST" === _0x1660cf && (_0x291ae3 = this.post);
      return new Promise((_0x2d6cb4, _0x4d8368) => {
        _0x291ae3.call(this, _0x4c67c6, (_0x519e5c, _0x4fada6, _0x480a22) => {
          _0x519e5c ? _0x4d8368(_0x519e5c) : _0x2d6cb4(_0x4fada6);
        });
      });
    }
    ["get"](_0x5128f8) {
      return this.send.call(this.env, _0x5128f8);
    }
    ["post"](_0xdb2d81) {
      return this.send.call(this.env, _0xdb2d81, "POST");
    }
  }
  return new class {
    constructor(_0x3407ad, _0x138627) {
      this.name = _0x3407ad;
      this.http = new _0xabb086(this);
      this.data = null;
      this.dataFile = "box.dat";
      this.logs = [];
      this.isMute = false;
      this.isNeedRewrite = false;
      this.logSeparator = "\n";
      this.startTime = new Date().getTime();
      Object.assign(this, _0x138627);
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
    ["toObj"](_0x38350a, _0x4591e8 = null) {
      try {
        return JSON.parse(_0x38350a);
      } catch {
        return _0x4591e8;
      }
    }
    ["toStr"](_0x38b713, _0xfd653f = null) {
      try {
        return JSON.stringify(_0x38b713);
      } catch {
        return _0xfd653f;
      }
    }
    ["getjson"](_0x1b1b34, _0x31a098) {
      let _0x3ac078 = _0x31a098;
      const _0x3fabe4 = this.getdata(_0x1b1b34);
      if (_0x3fabe4) try {
        _0x3ac078 = JSON.parse(this.getdata(_0x1b1b34));
      } catch {}
      return _0x3ac078;
    }
    ["setjson"](_0x608f1b, _0x4e5b66) {
      try {
        return this.setdata(JSON.stringify(_0x608f1b), _0x4e5b66);
      } catch {
        return false;
      }
    }
    ["getScript"](_0x37046b) {
      return new Promise(_0x48d36a => {
        this.get({
          "url": _0x37046b
        }, (_0x55083d, _0x22c1e7, _0xee0232) => _0x48d36a(_0xee0232));
      });
    }
    ["runScript"](_0x30b809, _0x23e8f0) {
      return new Promise(_0xfb1081 => {
        let _0x340f65 = this.getdata("@chavy_boxjs_userCfgs.httpapi");
        _0x340f65 = _0x340f65 ? _0x340f65.replace(/\n/g, "").trim() : _0x340f65;
        let _0x5e8672 = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
        _0x5e8672 = _0x5e8672 ? 1 * _0x5e8672 : 20;
        _0x5e8672 = _0x23e8f0 && _0x23e8f0.timeout ? _0x23e8f0.timeout : _0x5e8672;
        const [_0x4bb1c5, _0x124bf9] = _0x340f65.split("@"),
          _0x57778a = {
            "url": "http://" + _0x124bf9 + "/v1/scripting/evaluate",
            "body": {
              "script_text": _0x30b809,
              "mock_type": "cron",
              "timeout": _0x5e8672
            },
            "headers": {
              "X-Key": _0x4bb1c5,
              "Accept": "*/*"
            }
          };
        this.post(_0x57778a, (_0x176de6, _0x73db0e, _0x176a7a) => _0xfb1081(_0x176a7a));
      }).catch(_0x4f9584 => this.logErr(_0x4f9584));
    }
    ["loaddata"]() {
      if (!this.isNode()) return {};
      {
        this.fs = this.fs ? this.fs : require("fs");
        this.path = this.path ? this.path : require("path");
        const _0x565c0c = this.path.resolve(this.dataFile),
          _0x30a1ef = this.path.resolve(process.cwd(), this.dataFile),
          _0x5bc9ee = this.fs.existsSync(_0x565c0c),
          _0x35ec30 = !_0x5bc9ee && this.fs.existsSync(_0x30a1ef);
        if (!_0x5bc9ee && !_0x35ec30) return {};
        {
          const _0x6df64f = _0x5bc9ee ? _0x565c0c : _0x30a1ef;
          try {
            return JSON.parse(this.fs.readFileSync(_0x6df64f));
          } catch (_0x4ca276) {
            return {};
          }
        }
      }
    }
    ["writedata"]() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require("fs");
        this.path = this.path ? this.path : require("path");
        const _0xb7b6c1 = this.path.resolve(this.dataFile),
          _0x428ad7 = this.path.resolve(process.cwd(), this.dataFile),
          _0x1bf9b0 = this.fs.existsSync(_0xb7b6c1),
          _0xc23aac = !_0x1bf9b0 && this.fs.existsSync(_0x428ad7),
          _0x34d8ce = JSON.stringify(this.data);
        _0x1bf9b0 ? this.fs.writeFileSync(_0xb7b6c1, _0x34d8ce) : _0xc23aac ? this.fs.writeFileSync(_0x428ad7, _0x34d8ce) : this.fs.writeFileSync(_0xb7b6c1, _0x34d8ce);
      }
    }
    ["lodash_get"](_0x43dbcc, _0x117104, _0x1c6ba7) {
      {
        const _0x5d50fd = _0x117104.replace(/\[(\d+)\]/g, ".$1").split(".");
        let _0x4096aa = _0x43dbcc;
        for (const _0x10068a of _0x5d50fd) if (_0x4096aa = Object(_0x4096aa)[_0x10068a], undefined === _0x4096aa) return _0x1c6ba7;
        return _0x4096aa;
      }
    }
    ["lodash_set"](_0x2cf161, _0x54a296, _0x2ba390) {
      return Object(_0x2cf161) !== _0x2cf161 ? _0x2cf161 : (Array.isArray(_0x54a296) || (_0x54a296 = _0x54a296.toString().match(/[^.[\]]+/g) || []), _0x54a296.slice(0, -1).reduce((_0x454ac8, _0xe64250, _0x55bbf3) => Object(_0x454ac8[_0xe64250]) === _0x454ac8[_0xe64250] ? _0x454ac8[_0xe64250] : _0x454ac8[_0xe64250] = Math.abs(_0x54a296[_0x55bbf3 + 1]) >> 0 == +_0x54a296[_0x55bbf3 + 1] ? [] : {}, _0x2cf161)[_0x54a296[_0x54a296.length - 1]] = _0x2ba390, _0x2cf161);
    }
    ["getdata"](_0x4e3a7a) {
      let _0x22cedf = this.getval(_0x4e3a7a);
      if (/^@/.test(_0x4e3a7a)) {
        const [, _0x47f9bf, _0x289646] = /^@(.*?)\.(.*?)$/.exec(_0x4e3a7a),
          _0x335d7e = _0x47f9bf ? this.getval(_0x47f9bf) : "";
        if (_0x335d7e) try {
          {
            const _0x47ffe8 = JSON.parse(_0x335d7e);
            _0x22cedf = _0x47ffe8 ? this.lodash_get(_0x47ffe8, _0x289646, "") : _0x22cedf;
          }
        } catch (_0x49efa7) {
          _0x22cedf = "";
        }
      }
      return _0x22cedf;
    }
    ["setdata"](_0x3c4590, _0x16fd74) {
      {
        let _0x21b4e4 = false;
        if (/^@/.test(_0x16fd74)) {
          {
            const [, _0x491da0, _0x57fef4] = /^@(.*?)\.(.*?)$/.exec(_0x16fd74),
              _0x1b2dcd = this.getval(_0x491da0),
              _0x5862cc = _0x491da0 ? "null" === _0x1b2dcd ? null : _0x1b2dcd || "{}" : "{}";
            try {
              const _0x49e68a = JSON.parse(_0x5862cc);
              this.lodash_set(_0x49e68a, _0x57fef4, _0x3c4590);
              _0x21b4e4 = this.setval(JSON.stringify(_0x49e68a), _0x491da0);
            } catch (_0xee67a) {
              {
                const _0xea9285 = {};
                this.lodash_set(_0xea9285, _0x57fef4, _0x3c4590);
                _0x21b4e4 = this.setval(JSON.stringify(_0xea9285), _0x491da0);
              }
            }
          }
        } else _0x21b4e4 = this.setval(_0x3c4590, _0x16fd74);
        return _0x21b4e4;
      }
    }
    ["getval"](_0x3e9649) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(_0x3e9649) : this.isQuanX() ? $prefs.valueForKey(_0x3e9649) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x3e9649]) : this.data && this.data[_0x3e9649] || null;
    }
    ["setval"](_0x219d93, _0x1d92b3) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(_0x219d93, _0x1d92b3) : this.isQuanX() ? $prefs.setValueForKey(_0x219d93, _0x1d92b3) : this.isNode() ? (this.data = this.loaddata(), this.data[_0x1d92b3] = _0x219d93, this.writedata(), true) : this.data && this.data[_0x1d92b3] || null;
    }
    ["initGotEnv"](_0x49df69) {
      this.got = this.got ? this.got : require("got");
      this.cktough = this.cktough ? this.cktough : require("tough-cookie");
      this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar();
      _0x49df69 && (_0x49df69.headers = _0x49df69.headers ? _0x49df69.headers : {}, undefined === _0x49df69.headers.Cookie && undefined === _0x49df69.cookieJar && (_0x49df69.cookieJar = this.ckjar));
    }
    ["get"](_0xcb2362, _0xfb3121 = () => {}) {
      _0xcb2362.headers && (delete _0xcb2362.headers["Content-Type"], delete _0xcb2362.headers["Content-Length"]);
      this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (_0xcb2362.headers = _0xcb2362.headers || {}, Object.assign(_0xcb2362.headers, {
        "X-Surge-Skip-Scripting": false
      })), $httpClient.get(_0xcb2362, (_0x381c39, _0x2ad2b5, _0x55defd) => {
        !_0x381c39 && _0x2ad2b5 && (_0x2ad2b5.body = _0x55defd, _0x2ad2b5.statusCode = _0x2ad2b5.status);
        _0xfb3121(_0x381c39, _0x2ad2b5, _0x55defd);
      })) : this.isQuanX() ? (this.isNeedRewrite && (_0xcb2362.opts = _0xcb2362.opts || {}, Object.assign(_0xcb2362.opts, {
        "hints": false
      })), $task.fetch(_0xcb2362).then(_0x2767b3 => {
        const {
          statusCode: _0x48b99a,
          statusCode: _0x5a85d4,
          headers: _0x39963b,
          body: _0x562417
        } = _0x2767b3;
        _0xfb3121(null, {
          "status": _0x48b99a,
          "statusCode": _0x5a85d4,
          "headers": _0x39963b,
          "body": _0x562417
        }, _0x562417);
      }, _0x2f01ea => _0xfb3121(_0x2f01ea))) : this.isNode() && (this.initGotEnv(_0xcb2362), this.got(_0xcb2362).on("redirect", (_0x577a20, _0x47c280) => {
        try {
          {
            if (_0x577a20.headers["set-cookie"]) {
              const _0xa4e4a6 = _0x577a20.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
              _0xa4e4a6 && this.ckjar.setCookieSync(_0xa4e4a6, null);
              _0x47c280.cookieJar = this.ckjar;
            }
          }
        } catch (_0x19c0e7) {
          this.logErr(_0x19c0e7);
        }
      }).then(_0xbda050 => {
        const {
          statusCode: _0x32a014,
          statusCode: _0x8364e9,
          headers: _0x9f28e8,
          body: _0x54fe23
        } = _0xbda050;
        _0xfb3121(null, {
          "status": _0x32a014,
          "statusCode": _0x8364e9,
          "headers": _0x9f28e8,
          "body": _0x54fe23
        }, _0x54fe23);
      }, _0x128743 => {
        {
          const {
            message: _0x2a1a27,
            response: _0x28f475
          } = _0x128743;
          _0xfb3121(_0x2a1a27, _0x28f475, _0x28f475 && _0x28f475.body);
        }
      }));
    }
    ["post"](_0x5c9edf, _0x2998ce = () => {}) {
      if (_0x5c9edf.body && _0x5c9edf.headers && !_0x5c9edf.headers["Content-Type"] && (_0x5c9edf.headers["Content-Type"] = "application/x-www-form-urlencoded"), _0x5c9edf.headers && delete _0x5c9edf.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (_0x5c9edf.headers = _0x5c9edf.headers || {}, Object.assign(_0x5c9edf.headers, {
        "X-Surge-Skip-Scripting": false
      })), $httpClient.post(_0x5c9edf, (_0x2d7db1, _0x7c9d08, _0x55bb92) => {
        !_0x2d7db1 && _0x7c9d08 && (_0x7c9d08.body = _0x55bb92, _0x7c9d08.statusCode = _0x7c9d08.status);
        _0x2998ce(_0x2d7db1, _0x7c9d08, _0x55bb92);
      });else {
        if (this.isQuanX()) _0x5c9edf.method = "POST", this.isNeedRewrite && (_0x5c9edf.opts = _0x5c9edf.opts || {}, Object.assign(_0x5c9edf.opts, {
          "hints": false
        })), $task.fetch(_0x5c9edf).then(_0x7d3d4 => {
          {
            const {
              statusCode: _0xf5e5e4,
              statusCode: _0x1d3991,
              headers: _0x4c696a,
              body: _0x319619
            } = _0x7d3d4;
            _0x2998ce(null, {
              "status": _0xf5e5e4,
              "statusCode": _0x1d3991,
              "headers": _0x4c696a,
              "body": _0x319619
            }, _0x319619);
          }
        }, _0x40ce90 => _0x2998ce(_0x40ce90));else {
          if (this.isNode()) {
            this.initGotEnv(_0x5c9edf);
            const {
              url: _0x343362,
              ..._0x3ae0b9
            } = _0x5c9edf;
            this.got.post(_0x343362, _0x3ae0b9).then(_0x3baf52 => {
              const {
                statusCode: _0x65cc71,
                statusCode: _0x4e5172,
                headers: _0x418d4c,
                body: _0x31c296
              } = _0x3baf52;
              _0x2998ce(null, {
                "status": _0x65cc71,
                "statusCode": _0x4e5172,
                "headers": _0x418d4c,
                "body": _0x31c296
              }, _0x31c296);
            }, _0x146f65 => {
              const {
                message: _0x8532da,
                response: _0x563bda
              } = _0x146f65;
              _0x2998ce(_0x8532da, _0x563bda, _0x563bda && _0x563bda.body);
            });
          }
        }
      }
    }
    ["time"](_0x4469e5, _0x43ca4c = null) {
      {
        const _0x33887d = _0x43ca4c ? new Date(_0x43ca4c) : new Date();
        let _0x230d04 = {
          "M+": _0x33887d.getMonth() + 1,
          "d+": _0x33887d.getDate(),
          "H+": _0x33887d.getHours(),
          "m+": _0x33887d.getMinutes(),
          "s+": _0x33887d.getSeconds(),
          "q+": Math.floor((_0x33887d.getMonth() + 3) / 3),
          "S": _0x33887d.getMilliseconds()
        };
        /(y+)/.test(_0x4469e5) && (_0x4469e5 = _0x4469e5.replace(RegExp.$1, (_0x33887d.getFullYear() + "").substr(4 - RegExp.$1.length)));
        for (let _0x5a9e11 in _0x230d04) new RegExp("(" + _0x5a9e11 + ")").test(_0x4469e5) && (_0x4469e5 = _0x4469e5.replace(RegExp.$1, 1 == RegExp.$1.length ? _0x230d04[_0x5a9e11] : ("00" + _0x230d04[_0x5a9e11]).substr(("" + _0x230d04[_0x5a9e11]).length)));
        return _0x4469e5;
      }
    }
    ["msg"](_0x1878ae = _0x416c00, _0xb51b8a = "", _0x3db5fe = "", _0x100a09) {
      const _0x14d88b = _0x4f976f => {
        if (!_0x4f976f) return _0x4f976f;
        if ("string" == typeof _0x4f976f) return this.isLoon() ? _0x4f976f : this.isQuanX() ? {
          "open-url": _0x4f976f
        } : this.isSurge() ? {
          "url": _0x4f976f
        } : undefined;
        if ("object" == typeof _0x4f976f) {
          if (this.isLoon()) {
            let _0x51b168 = _0x4f976f.openUrl || _0x4f976f.url || _0x4f976f["open-url"],
              _0xa2ad1c = _0x4f976f.mediaUrl || _0x4f976f["media-url"];
            return {
              "openUrl": _0x51b168,
              "mediaUrl": _0xa2ad1c
            };
          }
          if (this.isQuanX()) {
            let _0x5863e6 = _0x4f976f["open-url"] || _0x4f976f.url || _0x4f976f.openUrl,
              _0x37aae4 = _0x4f976f["media-url"] || _0x4f976f.mediaUrl;
            return {
              "open-url": _0x5863e6,
              "media-url": _0x37aae4
            };
          }
          if (this.isSurge()) {
            let _0x350730 = _0x4f976f.url || _0x4f976f.openUrl || _0x4f976f["open-url"];
            return {
              "url": _0x350730
            };
          }
        }
      };
      if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(_0x1878ae, _0xb51b8a, _0x3db5fe, _0x14d88b(_0x100a09)) : this.isQuanX() && $notify(_0x1878ae, _0xb51b8a, _0x3db5fe, _0x14d88b(_0x100a09))), !this.isMuteLog) {
        let _0x4132f5 = ["", "==============📣系统通知📣=============="];
        _0x4132f5.push(_0x1878ae);
        _0xb51b8a && _0x4132f5.push(_0xb51b8a);
        _0x3db5fe && _0x4132f5.push(_0x3db5fe);
        console.log(_0x4132f5.join("\n"));
        this.logs = this.logs.concat(_0x4132f5);
      }
    }
    ["log"](..._0x5a5ad7) {
      _0x5a5ad7.length > 0 && (this.logs = [...this.logs, ..._0x5a5ad7]);
      console.log(_0x5a5ad7.join(this.logSeparator));
    }
    ["logErr"](_0x25af93, _0xed7826) {
      const _0x16b787 = !this.isSurge() && !this.isQuanX() && !this.isLoon();
      _0x16b787 ? this.log("", "❗️" + this.name + ", 错误!", _0x25af93.stack) : this.log("", "❗️" + this.name + ", 错误!", _0x25af93);
    }
    ["wait"](_0x634078) {
      return new Promise(_0x5669a8 => setTimeout(_0x5669a8, _0x634078));
    }
    ["done"](_0x3072b2 = {}) {
      const _0x4bf233 = new Date().getTime(),
        _0x2404a8 = (_0x4bf233 - this.startTime) / 1000;
      this.log("", "🔔" + this.name + ", 结束! 🕛 " + _0x2404a8 + " 秒");
      this.log();
      (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(_0x3072b2);
    }
  }(_0x416c00, _0x574ff0);
}