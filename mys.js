/**
 * mys 米忽悠 米游社  原神签到
 * scriptVersionNow = "0.0.4"
 * cron 12 5 * * *  mys.js
 * 23-06-13 过渡更新V0.0.4
 * # 青龙面板  --  配置文件
 * =>配置文件  export mys='cookie1&cookie2'
 * =>环境变量  变量名mys  变量值(如下)
 * 多账号用  @ 分割
 * ====================================
 * 打开https://www.miyoushe.com/ys/
 * ALook浏览器打开登录后点击下方导航栏最下面三条杠往左滑 点击工具箱-开发者工具-cookie-拷贝
 * 打开http://user.mihoyo.com/
 * ALook浏览器打开登录后点击下方导航栏最下面三条杠往左滑 点击工具箱-开发者工具-cookie-拷贝
 * 两个拷贝下来拼接到一起 拼接字符& 拼接字符& 拼接字符&
 * 示例:
 * cookie_token_v2=xxx; account_mid_v2=xxx; account_id_v2=xxx; ltoken_v2=xxx; ltmid_v2=xxx; ltuid_v2=xxx & login_uid=xxx; login_ticket=xxx;
 * 必要参数 cookie_token_v2 ltoken_v2 login_ticket
 * 二选一参数 ltmid_v2或者account_mid_v2   and  account_id_v2或者ltuid_v2或者login_id
 * 请确保上面5个参数都存在
 */
const $ = new Env("米游社 原神签到");
const ckName = "mys";
//-------------------- 一般不动变量区域 -------------------------------------
const { log } = require("console");
const Notify = 1; //0为关闭通知,1为打开通知,默认为1
const notify = $.isNode() ? require("./sendNotify") : "";
let envSplitor = ["@"]; //多账号分隔符
let msg = "";
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || "";
let userList = [];
let userIdx = 0;
let userCount = 0;
let scriptVersionLatest; //最新版本
let scriptVersionNow = "0.0.4"; //现在版本
/////////////////////
let jiangliArr = [];
const fs = require('fs');
let strShare = './Mihoyo_Account.json';//指定文件目录
let Fileexists = fs.existsSync(strShare);//检测文件是否存在
let TempAccount = [];
if (Fileexists) {//如果存在
  console.log("检测到米哈游缓存文件Mihoyo_Account.json，载入...");
  TempAccount = fs.readFileSync(strShare, 'utf-8');
  if (TempAccount) {
    TempAccount = TempAccount.toString();
    TempAccount = JSON.parse(TempAccount);
  }
}
//# 米游社的版本 # Salt和Version相互对应
const mihoyobbs_version = "2.49.1";
//# 米游社的客户端类型 # 1为ios 2为安卓
const mihoyobbs_Client_type = "2";
//# 4为pc web 5为mobile web
const mihoyobbs_Client_type_web = "5";
//# 云原神版本
const cloudgenshin_Version = "3.0.0";
//# 米游社的分区列表
const mihoyobbs_List = [
  {
    id: "1",
    forumId: "1",
    name: "崩坏3",
    url: "https://bbs.mihoyo.com/bh3/",
  }, {
    id: "2",
    forumId: "26",
    name: "原神",
    url: "https://bbs.mihoyo.com/ys/",
  }, {
    id: "3",
    forumId: "30",
    name: "崩坏2",
    url: "https://bbs.mihoyo.com/bh2/",
  }, {
    id: "4",
    forumId: "37",
    name: "未定事件簿",
    url: "https://bbs.mihoyo.com/wd/",
  }, {
    id: "5",
    forumId: "34",
    name: "大别野",
    url: "https://bbs.mihoyo.com/dby/",
  }, {
    id: "6",
    forumId: "52",
    name: "崩坏：星穹铁道",
    url: "https://bbs.mihoyo.com/sr/",
  }, {
    id: "8",
    forumId: "57",
    name: "绝区零",
    url: "https://bbs.mihoyo.com/zzz/",
  },
];

const game_id2name = {
  bh2_cn: "崩坏2",
  bh3_cn: "崩坏3",
  nxx_cn: "未定事件簿",
  hk4e_cn: "原神",
  hkrpg_cn: "崩坏： 星穹铁道",
};

const game_id2config = {
  bh2_cn: "honkai2",
  bh3_cn: "honkai3rd",
  nxx_cn: "tears_of_themis",
  hk4e_cn: "genshin",
  hkrpg_cn: "honkaisr",
};

//# 游戏签到的请求头
const sign_headers = {
  Accept: "application/json, text/plain, */*",
  DS: "",
  "x-rpc-channel": "miyousheluodi",
  Origin: "https://webstatic.mihoyo.com",
  "x-rpc-app_version": mihoyobbs_version,
  "User-Agent":
    `Mozilla/5.0 (Linux; Android 12; Unspecified Device) AppleWebKit/537.36 (KHTML, like Gecko) ` +
    `Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 miHoYoBBS/${mihoyobbs_version}`,
  "x-rpc-client_type": mihoyobbs_Client_type_web,
  Referer: "",
  "Accept-Encoding": "gzip, deflate",
  "Accept-Language": "zh-CN,en-US;q=0.8",
  "X-Requested-With": "com.mihoyo.hyperion",
  Cookie: "",
  "x-rpc-device_id": "",
};

//# 通用设置
const bbs_api = "https://bbs-api.mihoyo.com";
const web_api = "https://api-takumi.mihoyo.com";
const account_Info_url = web_api + "/binding/api/getUserGameRolesByCookie?game_biz=";
const act_id_list = {
  genshin_Act_id: "e202009291139501",  //# 原神自动签到相关的设置
  honkai_sr_Act_id: "e202304121516551",  //# 星穹铁道自动签到相关设置
  honkai2_Act_id: "e202203291431091",  //# 崩坏2自动签到相关的相关设置
  honkai3rd_Act_id: "e202207181446311",  //# 崩坏3自动签到相关的设置
  tearsofthemis_Act_id: "e202202251749321",  //# 未定事件簿自动签到相关设置
}
//# 米游社的API列表
const bbs_api_list = {
  bbs_cookie_url: "https://webapi.account.mihoyo.com/Api/cookie_accountinfo_by_loginticket?login_ticket={}",
  bbs_cookie_url2: web_api + "/auth/api/getMultiTokenByLoginTicket?login_ticket={}&token_types=3&uid={}",
  bbs_tasks_list: bbs_api + "/apihub/sapi/getUserMissionsState", //# 获取任务列表
  bbs_sign_url: bbs_api + "/apihub/app/api/signIn", //# post
  bbs_post_list_url: bbs_api + "/post/api/getForumPostList?forum_id={}&is_good=false&is_hot=false&page_size=20&sort_type=1",
  bbs_detail_url: bbs_api + "/post/api/getPostFull?post_id={}",
  bbs_share_url: bbs_api + "/apihub/api/getShareConf?entity_id={}&entity_type=1",
  bbs_like_url: bbs_api + "/apihub/sapi/upvotePost", //# post json
  bbs_get_captcha: bbs_api + "/misc/api/createVerification?is_high=true",
  bbs_captcha_verify: bbs_api + "/misc/api/verifyVerification",
};
//# 通用游戏签到API
const any_checkin_rewards = web_api + "/event/luna/home?lang=zh-cn&act_id={}";
const any_is_signurl = web_api + "/event/luna/info?lang=zh-cn&act_id={}&region={}&uid={}";
const any_sign_url = web_api + "/event/luna/sign";
//# 原神相关API
const genshin_checkin_rewards = `${web_api}/event/bbs_sign_reward/home?act_id=${act_id_list['genshin_Act_id']}`;
const genshin_Is_signurl = web_api + "/event/bbs_sign_reward/info?act_id={}&region={}&uid={}";
const genshin_Signurl = web_api + "/event/bbs_sign_reward/sign";
//# 云原神相关api
const cloud_genshin_Api = "https://api-cloudgame.mihoyo.com";
const cloud_genshin_sgin = cloud_genshin_Api + "/hk4e_cg_cn/wallet/wallet/get";
//# 接下来是国际服的内容
const os_lang = "zh-cn";
const os_referer_url = "https://act.hoyolab.com/";

// SaltConfig 对象，存储生成 Headers 所用的 salt 值
const SaltConfig = {
  //# 米游社的Salt
  mihoyobbs_salt: "egBrFMO1BPBG0UX5XOuuwMRLZKwTVKRV",
  mihoyobbs_salt_x4: "xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs",
  mihoyobbs_salt_x6: "t0qEgfub6cvueAPgR5m9aQWWVciEer7v",
  mihoyobbs_salt_web: "DG8lqMyc9gquwAUFc7zBS62ijQRX9XF7",
};



//---------------------------------------------------------

async function start() {
  await getVersion("smallfawn/QLScriptPublic/main/mys.js");
  log(`todoList:此次版本更新为过渡版本,以后将增加米游币的任务`)
  log(`tips:更新双变量模式,两个网址获取的两个cookie用&分割`)
  log(`\n====== 当前版本：${scriptVersionNow} 📌 最新版本：${scriptVersionLatest} ======`);
  await getNotice();
  let taskall;
  log("\n==========> 获取当月奖励详情 <==========\n");
  taskall = [];
  for (let user of userList) {
    if (user.ckStatus) {
      if (user.index == 1) {
        taskall.push(await user.getAwards(act_id_list['genshin_Act_id']))//原神奖励列表
      }
      taskall.push(await user.main());
      await $.wait(1000);
      await Promise.all(taskall);
    } else {
      log(`账号[${user.index}]  cookie参数不全，停止执行！所有任务`)
    }
  }
  await Promise.all(taskall);

}
//新接口APP签到COOKIE
//ltuid=296874595; login_ticket=iMBL8bwpaiCiKqjzhbmzLBp9xL5fuGn8uDF0k3Y1; account_id=296874595; ltoken=UJhY0UQQNt0kwagQNGXTZu73WfIjUHLviHPxiliV; cookie_token=kT4pb3rkmMiK0Biaec9KlfKu1zFop2C0Dcv0hCpL;
//ltoken通过verifyToken接口获得 Cookie必须含有account_id和cookie_token  返回Set-Cookie 中包含 ltoken
class UserInfo {
  constructor(str) {
    this.index = ++userIdx;
    this.cookieStr = str.split("&")[0];
    this.cookieStr_login = str.split("&")[1];
    this.cookieStr_login = this.cookieStr_login.replace(/\s/g, '');
    this.cookieStr_login += ";"
    this.ckStatus = true;

    this.cookie_token_v2 = "";
    this.account_mid_v2 = "";
    this.account_id_v2 = "";
    this.ltoken_v2 = "";
    this.ltmid_v2 = "";
    this.ltuid_v2 = "";
    this.login_uid = "";
    this.login_ticket = "";

    this.stuid = "";
    this.stoken = "";
    this.device_id = "";

    this.region = "";
    this.uid_ys = "";
    this.isLoginApp = false
  }
  async getCookie() {
    this.cookieStr = this.cookieStr.replace(/\s/g, '');
    //log(this.cookieStr)
    const cookieMustValues1 = ['cookie_token_v2', 'ltoken_v2'];
    for (const cookieName of cookieMustValues1) {
      const match = new RegExp(`${cookieName}=([^;]+)`).exec(this.cookieStr);
      if (match !== null) {
        this[cookieName] = match[1];
      } else {
        log(`账号[${this.index}]  ${cookieName} cookie参数不全，停止执行！所有任务`)
        this.ckStatus = false
        return
      }
    }
    const cookieMustValues2 = ['account_mid_v2', 'account_id_v2', 'ltmid_v2', 'ltuid_v2'];
    for (const cookieName of cookieMustValues2) {
      const match = new RegExp(`${cookieName}=([^;]+)`).exec(this.cookieStr);
      if (match !== null) {
        this[cookieName] = match[1];
      } else {
        this[cookieName] = match;
      }
    }
    /*if (/cookie_token_v2=([^;]+)/.exec(this.cookieStr) !== null) {
      this.cookie_token_v2 = /cookie_token_v2=([^;]+)/.exec(this.cookieStr)[1];
    }
    if (/account_mid_v2=([^;]+)/.exec(this.cookieStr) !== null) {
      this.account_mid_v2 = /account_mid_v2=([^;]+)/.exec(this.cookieStr)[1];
    }

    }
    this.cookie_token_v2 = /cookie_token_v2=([^;]+)/.exec(this.cookieStr)[1];
    this.account_mid_v2 = /account_mid_v2=([^;]+)/.exec(this.cookieStr)[1];*/
    if (/login_ticket=([^;]+)/.exec(this.cookieStr_login)) {
      this.login_ticket = /login_ticket=([^;]+)/.exec(this.cookieStr_login)[1]
      this.isLoginApp = true;
    } else {
      this.login_ticket == "";
      this.isLoginApp = false;
    }
    //this.stuid = "";
    //this.stoken = "";
    this.setValues('UID')//设置UID和MID
    this.setValues('MID')//设置UID和MID
    this.checkCookie()
    if (this.ckStatus) {
      await this.GetCollect()
    }
    //使用获取到的Cookie
    if (this.isLoginApp) {
      this.cookieAll = `cookie_token_v2=${this.cookie_token_v2}; account_mid_v2=${this.account_mid_v2}; account_id_v2=${this.account_id_v2}; ltoken_v2=${this.ltoken_v2}; ltmid_v2=${this.ltmid_v2}; ltuid_v2=${this.ltuid_v2}; login_uid=${this.login_uid}; login_ticket=${this.login_ticket};`
    } else {
      this.cookieAll = `cookie_token_v2=${this.cookie_token_v2}; account_mid_v2=${this.account_mid_v2}; account_id_v2=${this.account_id_v2}; ltoken_v2=${this.ltoken_v2}; ltmid_v2=${this.ltmid_v2}; ltuid_v2=${this.ltuid_v2};`
    }
  }
  checkCookie() {
    if (this.cookie_token_v2 && this.account_mid_v2 && this.account_id_v2 && this.ltoken_v2 && this.ltmid_v2 && this.ltuid_v2 && this.login_uid) {
      this.ckStatus = true;
    } else {
      this.ckStatus = false;
      log(`缺少参数 设置false`)
    }
  }
  setValues(str) {
    if (str == 'UID') {
      this.account_id_v2 = this.account_id_v2 || this.ltuid_v2 || this.login_uid;
      this.ltuid_v2 = this.ltuid_v2 || this.account_id_v2 || this.login_uid;
      //log(`this.ltuid_v2` + this.ltuid_v2)
      //log(`this.account_id_v2` + this.account_id_v2)

      this.login_uid = this.login_uid || this.account_id_v2 || this.ltuid_v2;
      //log(`this.login_uid` + this.login_uid)
    } else if (str == 'MID') {
      this.account_mid_v2 = this.account_mid_v2 || this.ltmid_v2
      this.ltmid_v2 = this.ltmid_v2 || this.account_mid_v2
    }
  }
  async GetCollect() {
    let boolneedUpdate = false;
    let isIn = false;
    if (TempAccount) {
      for (let j = 0; j < TempAccount.length; j++) {
        if (TempAccount[j]["uid"] == this.account_id_v2 || TempAccount[j]["uid"] == this.ltuid_v2 || TempAccount[j]["uid"] == this.login_uid) {
          isIn = true;
          this.cookie_token_v2 = TempAccount[j]['cookie_token_v2'];
          this.account_mid_v2 = TempAccount[j]['mid'];
          this.account_id_v2 = TempAccount[j]['uid'];
          this.ltoken_v2 = TempAccount[j]['ltoken_v2'];
          this.ltmid_v2 = TempAccount[j]['mid'];
          this.ltuid_v2 = TempAccount[j]['uid'];
          this.login_uid = TempAccount[j]['uid'];
          this.login_ticket = TempAccount[j]['login_ticket'];
          this.stuid = TempAccount[j]['stuid']
          this.stoken = TempAccount[j]['stoken'];
          this.device_id = TempAccount[j]['device_id'];
        }
      }
    }
    if (!isIn) {
      console.log(`账号[${this.index}]  该账号无缓存，尝试联网获取stoken.....`);
      if (this.isLoginApp) {
        await this.task_login();
      } else {
        console.log(`账号[${this.index}]  缺少login_ticket参数，不执行米游币任务`);
      }
      if (this.stoken == "" || this.stoken !== "") {
        var tempAddCooKie = {};
        tempAddCooKie = {
          "uid": this.account_id_v2,
          "mid": this.account_mid_v2,
          "cookie_token_v2": this.cookie_token_v2,
          "ltoken_v2": this.ltoken_v2,
          "login_ticket": this.login_ticket,
          "stoken": this.stoken,
          "device_id": getUUID()
        };
        TempAccount.push(tempAddCooKie);
        //标识，需要更新缓存文件
        boolneedUpdate = true;
      } else {
        boolneedUpdate = true
      }
    }
    if (boolneedUpdate) {
      var str = JSON.stringify(TempAccount, null, 2);
      //var str = JSON.stringify(TempAccount);
      //log(TempAccount)
      fs.writeFile(strShare, str, function (err) {
        if (err) {
          console.log(err);
          console.log("\n【缓存文件Mihoyo_Account.json更新失败!】\n");
        } else {
          console.log("\n【缓存文件Mihoyo_Account.json更新成功!】\n");
        }
      })
    }
  }
  async getHeaders() {
    await this.GetCollect()
    const headers = sign_headers;
    headers['Cookie'] = this.cookieAll;
    headers['DS'] = this.getDS(true)
    headers['x-rpc-device_id'] = this.device_id//getUUID();
    headers['User-Agent'] = `Mozilla/5.0 (Linux; Android 12; Unspecified Device) AppleWebKit/537.36 (KHTML, like Gecko) ` +
      `Version/4.0 Chrome/103.0.5060.129 Mobile Safari/537.36 miHoYoBBS/${mihoyobbs_version}`
    return headers;
  }
  //# 获取请求Header里的DS 当web为true则生成网页端的DS
  getDS(web) {
    let salt;
    if (web) {
      salt = SaltConfig.mihoyobbs_salt_web;
    } else {
      salt = SaltConfig.mihoyobbs_salt;
    }
    const timestamp = Math.floor(Date.now() / 1e3);
    const random = Math.random().toString(36).slice(-6);
    const result = MD5_Encrypt(`salt=${salt}&t=${timestamp}&r=${random}`);
    return `${timestamp},${random},${result}`;
  }
  /**
   * # 获取请求Header里的DS(版本2) 这个版本ds之前见到都是查询接口里的
   * @param {*} q 
   * @param {*} b 
   * @returns 
   */
  getDS2(q, b) {
    const salt = SaltConfig.mihoyobbs_salt_x6;
    const timestamp = Math.floor(Date.now() / 1e3);
    const random = Math.floor(Math.random() * (200000 - 100001 + 1) + 100001).toString();
    const add = `&b=${b}&q=${q}`;
    const result = MD5_Encrypt(`salt=${salt}&t=${timestamp}&r=${random}${add}`);
    return `${timestamp},${random},${result}`;
  }

  async getAwards(act_id) {
    let options = {
      url: `https://api-takumi.mihoyo.com/event/bbs_sign_reward/home?act_id=${act_id}`,
      headers: {}
    }
    let result = await httpRequest(options)
    for (let i in result.data.awards) {
      jiangliArr.push(`${result.data.awards[i].name} * ${result.data.awards[i].cnt}`);
    }
    DoubleLog(jiangliArr);
  }
  async main() {
    try {
      await this.getCookie()//获取stuid以及stoken 且保存 以JSON格式 mihoyoConfig.json{存放 stuid为键 其他为值}
      if (this.ckStatus) {
        await this.get_info_ys()
        await this.get_sign_info(act_id_list['genshin_Act_id'])
      }

    } catch (e) {
      console.log(e);
    }
  }
  async task_login() {//获取米哈游的APP stuid以及stoken
    try {
      let options, result
      options = {
        url: `https://webapi.account.mihoyo.com/Api/cookie_accountinfo_by_loginticket?login_ticket=${this.login_ticket}`,
        headers: {}
      }, result = await httpRequest(options);
      //log(options)
      //log(result)
      if (result.data.msg == '成功') {
        this.stuid = result.data.cookie_info.account_id
        options = {
          url: `https://api-takumi.mihoyo.com/auth/api/getMultiTokenByLoginTicket?login_ticket=${this.login_ticket}&token_types=3&uid=${this.stuid}`,
          headers: {}
        }, result = await httpRequest(options);
        if (result.message == 'OK') {
          this.stoken = result.data.list[0].token
          //log(this.stoken)
          //log(result)
          //DoubleLog('保存STUID和STOKEN success')
        }
      } else {
        DoubleLog(`账号[${this.index}]  login_ticket已失效`);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async get_info_ys() {
    let headers = await this.getHeaders()
    try {
      let options = {
        url: `https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=hk4e_cn`,
        headers: headers,
      },
        result = await httpRequest(options);
      //console.log(options);
      //console.log(result);
      if (result.retcode == 0) {
        //log(`账号[${this.index}]  获取原神信息成功`);
        //let game_biz = result.data.list[0].game_biz;
        let region = result.data.list[0].region;
        let game_uid = result.data.list[0].game_uid;
        let nickname = result.data.list[0].nickname;
        let region_name = result.data.list[0].region_name;
        this.region = region;
        this.uid_ys = game_uid;
        //log(game_biz, region, game_uid, nickname, region_name);
        DoubleLog(`账号[${this.index}]  游戏昵称${nickname},${region_name}`);
      } else {
        DoubleLog(`账号[${this.index}]  获取原神信息:失败 ❌ ,原因未知！`);
        log(result);
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 签到信息
   */
  async get_sign_info(act_id) {
    let tmpHeaders = await this.getHeaders()
    tmpHeaders['Referer'] = `https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=${act_id}&utm_source=bbs&utm_medium=mys&utm_campaign=icon`
    try {
      let options = {
        url: `https://api-takumi.mihoyo.com/event/bbs_sign_reward/info?act_id=${act_id}&region=${this.region}&uid=${this.uid_ys}`,
        headers: tmpHeaders
      }, result = await httpRequest(options);
      //console.log(options);
      //console.log(result);
      if (result.retcode == 0) {
        //DoubleLog(`账号[${this.index}]  获取签到信息成功`);
        DoubleLog(`账号[${this.index}]  签到天数${result.data.total_sign_day},今天${result.data.today},是否签到${result.data.is_sign}`);
        if (result.data.is_sign == false) {
          DoubleLog(`账号[${this.index}]  执行签到`);
          await this.task_sign(act_id);
        }
      } else {
        DoubleLog(`账号[${this.index}]  获取签到信息:失败 ❌ ,原因未知！`);
        log(result);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async task_sign(act_id) {
    let tmpHeaders = await this.getHeaders()
    tmpHeaders['Referer'] = `https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=${act_id}&utm_source=bbs&utm_medium=mys&utm_campaign=icon`
    try {
      let options = {
        url: `https://api-takumi.mihoyo.com/event/bbs_sign_reward/sign`,
        headers: tmpHeaders,
        body: $.toStr({ act_id: act_id, region: this.region, uid: this.uid_ys, })
      }, result = await httpRequest(options);
      //console.log(options);
      //console.log(result);
      if (result.retcode == 0 && 'gt' in result.data) {
        DoubleLog(`账号[${this.index}]  签到:失败，原因有点选验证请手动签到🎉`);
      } else if (result.retcode == 0 && !('gt' in result.data)) {
        DoubleLog(`账号[${this.index}]  签到:${result.message} ❌ 了呢,原因未知！`);
        console.log(result);
      }
    } catch (e) {
      console.log(e);
    }
  }

}

!(async () => {
  if (!(await checkEnv())) return;
  if (userList.length > 0) {
    await start();
  }
  await SendMsg(msg);
})()
  .catch((e) => console.log(e))
  .finally(() => $.done());

//********************************************************
// 变量检查与处理
async function checkEnv() {
  if (userCookie) {
    // console.log(userCookie);
    let e = envSplitor[0];
    for (let o of envSplitor)
      if (userCookie.indexOf(o) > -1) {
        e = o;
        break;
      }
    for (let n of userCookie.split(e)) n && userList.push(new UserInfo(n));
    userCount = userList.length;
  } else {
    console.log("未找到CK");
    return;
  }
  return console.log(`共找到${userCount}个账号`), true; //true == !0
}
/////////////////////////////////////////////////////////////////////////////////////
function httpRequest(options, method) {
  method = options.method ? options.method.toLowerCase() : options.body ? "post" : "get";
  return new Promise((resolve) => {
    $[method](options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${method}请求失败`);
          $.logErr(err);
        } else {
          if (data) {
            typeof JSON.parse(data) == "object" ? (data = JSON.parse(data)) : (data = data);
            resolve(data);
          } else {
            console.log(`请求api返回数据为空，请检查自身原因`);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getUUID() {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).map((value, index) => [7, 11, 15, 19].includes(index) ? `-${value}` : value).join("");
}
/**
 * 获取远程版本
 */
function getVersion(scriptUrl, timeout = 3 * 1000) {
  return new Promise((resolve) => {
    let options = {
      url: `https://ghproxy.com/https://raw.githubusercontent.com/${scriptUrl}`,
    };
    $.get(
      options,
      async (err, resp, data) => {
        try {
          let regex = /scriptVersionNow\s*=\s*(["'`])([\d.]+)\1/;
          let match = data.match(regex);
          scriptVersionLatest = match ? match[2] : "";
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      },
      timeout
    );
  });
}

async function getNotice() {
  try {
    let options = {
      url: `https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/Note/main/Notice.json`,
      headers: { "User-Agent": "" },
    },
      result = await httpRequest(options);
    if (!result || !("notice" in result)) {
      options.url = `https://gitee.com/smallfawn/Note/raw/master/Notice.json`;
      result = await httpRequest(options);
    }
    if (result && "notice" in result) {
      DoubleLog(`${result.notice}`);
    }
  } catch (e) {
    console.log(e);
  }
}
async function hitokoto(timeout = 3 * 1000) {
  // 随机一言
  return new Promise((resolve) => {
    try {
      let options = {
        url: "https://v1.hitokoto.cn/",
        headers: {},
      }; //, //result = await httpRequest(options);
      $.get(
        options,
        async (err, resp, data) => {
          try {
            data = JSON.parse(data);
            resolve(data.hitokoto);
          } catch (e) {
            $.logErr(e, resp);
          } finally {
            resolve();
          }
        },
        timeout
      );
      //return result.hitokoto
    } catch (error) {
      console.log(error);
    }
  });
}
// 双平台log输出
function DoubleLog(data) {
  if ($.isNode()) {
    if (data) {
      console.log(`${data}`);
      msg += `\n${data}`;
    }
  } else {
    console.log(`${data}`);
    msg += `\n${data}`;
  }
}
// 发送消息
async function SendMsg(message) {
  if (!message) return;
  if (Notify > 0) {
    if ($.isNode()) {
      await notify.sendNotify($.name, message);
    } else {
      $.msg($.name, "", message);
    }
  } else {
    console.log(message);
  }
}

// 完整 Env
function MD5_Encrypt(a) { function b(a, b) { return (a << b) | (a >>> (32 - b)); } function c(a, b) { var c, d, e, f, g; return ((e = 2147483648 & a), (f = 2147483648 & b), (c = 1073741824 & a), (d = 1073741824 & b), (g = (1073741823 & a) + (1073741823 & b)), c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f : g ^ e ^ f); } function d(a, b, c) { return (a & b) | (~a & c); } function e(a, b, c) { return (a & c) | (b & ~c); } function f(a, b, c) { return a ^ b ^ c; } function g(a, b, c) { return b ^ (a | ~c); } function h(a, e, f, g, h, i, j) { return (a = c(a, c(c(d(e, f, g), h), j))), c(b(a, i), e); } function i(a, d, f, g, h, i, j) { return (a = c(a, c(c(e(d, f, g), h), j))), c(b(a, i), d); } function j(a, d, e, g, h, i, j) { return (a = c(a, c(c(f(d, e, g), h), j))), c(b(a, i), d); } function k(a, d, e, f, h, i, j) { return (a = c(a, c(c(g(d, e, f), h), j))), c(b(a, i), d); } function l(a) { for (var b, c = a.length, d = c + 8, e = (d - (d % 64)) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i = 0; c > i;) (b = (i - (i % 4)) / 4), (h = (i % 4) * 8), (g[b] = g[b] | (a.charCodeAt(i) << h)), i++; return ((b = (i - (i % 4)) / 4), (h = (i % 4) * 8), (g[b] = g[b] | (128 << h)), (g[f - 2] = c << 3), (g[f - 1] = c >>> 29), g); } function m(a) { var b, c, d = "", e = ""; for (c = 0; 3 >= c; c++) (b = (a >>> (8 * c)) & 255), (e = "0" + b.toString(16)), (d += e.substr(e.length - 2, 2)); return d; } function n(a) { a = a.replace(/\r\n/g, "\n"); for (var b = "", c = 0; c < a.length; c++) { var d = a.charCodeAt(c); 128 > d ? (b += String.fromCharCode(d)) : d > 127 && 2048 > d ? ((b += String.fromCharCode((d >> 6) | 192)), (b += String.fromCharCode((63 & d) | 128))) : ((b += String.fromCharCode((d >> 12) | 224)), (b += String.fromCharCode(((d >> 6) & 63) | 128)), (b += String.fromCharCode((63 & d) | 128))); } return b; } var o, p, q, r, s, t, u, v, w, x = [], y = 7, z = 12, A = 17, B = 22, C = 5, D = 9, E = 14, F = 20, G = 4, H = 11, I = 16, J = 23, K = 6, L = 10, M = 15, N = 21; for (a = n(a), x = l(a), t = 1732584193, u = 4023233417, v = 2562383102, w = 271733878, o = 0; o < x.length; o += 16) (p = t), (q = u), (r = v), (s = w), (t = h(t, u, v, w, x[o + 0], y, 3614090360)), (w = h(w, t, u, v, x[o + 1], z, 3905402710)), (v = h(v, w, t, u, x[o + 2], A, 606105819)), (u = h(u, v, w, t, x[o + 3], B, 3250441966)), (t = h(t, u, v, w, x[o + 4], y, 4118548399)), (w = h(w, t, u, v, x[o + 5], z, 1200080426)), (v = h(v, w, t, u, x[o + 6], A, 2821735955)), (u = h(u, v, w, t, x[o + 7], B, 4249261313)), (t = h(t, u, v, w, x[o + 8], y, 1770035416)), (w = h(w, t, u, v, x[o + 9], z, 2336552879)), (v = h(v, w, t, u, x[o + 10], A, 4294925233)), (u = h(u, v, w, t, x[o + 11], B, 2304563134)), (t = h(t, u, v, w, x[o + 12], y, 1804603682)), (w = h(w, t, u, v, x[o + 13], z, 4254626195)), (v = h(v, w, t, u, x[o + 14], A, 2792965006)), (u = h(u, v, w, t, x[o + 15], B, 1236535329)), (t = i(t, u, v, w, x[o + 1], C, 4129170786)), (w = i(w, t, u, v, x[o + 6], D, 3225465664)), (v = i(v, w, t, u, x[o + 11], E, 643717713)), (u = i(u, v, w, t, x[o + 0], F, 3921069994)), (t = i(t, u, v, w, x[o + 5], C, 3593408605)), (w = i(w, t, u, v, x[o + 10], D, 38016083)), (v = i(v, w, t, u, x[o + 15], E, 3634488961)), (u = i(u, v, w, t, x[o + 4], F, 3889429448)), (t = i(t, u, v, w, x[o + 9], C, 568446438)), (w = i(w, t, u, v, x[o + 14], D, 3275163606)), (v = i(v, w, t, u, x[o + 3], E, 4107603335)), (u = i(u, v, w, t, x[o + 8], F, 1163531501)), (t = i(t, u, v, w, x[o + 13], C, 2850285829)), (w = i(w, t, u, v, x[o + 2], D, 4243563512)), (v = i(v, w, t, u, x[o + 7], E, 1735328473)), (u = i(u, v, w, t, x[o + 12], F, 2368359562)), (t = j(t, u, v, w, x[o + 5], G, 4294588738)), (w = j(w, t, u, v, x[o + 8], H, 2272392833)), (v = j(v, w, t, u, x[o + 11], I, 1839030562)), (u = j(u, v, w, t, x[o + 14], J, 4259657740)), (t = j(t, u, v, w, x[o + 1], G, 2763975236)), (w = j(w, t, u, v, x[o + 4], H, 1272893353)), (v = j(v, w, t, u, x[o + 7], I, 4139469664)), (u = j(u, v, w, t, x[o + 10], J, 3200236656)), (t = j(t, u, v, w, x[o + 13], G, 681279174)), (w = j(w, t, u, v, x[o + 0], H, 3936430074)), (v = j(v, w, t, u, x[o + 3], I, 3572445317)), (u = j(u, v, w, t, x[o + 6], J, 76029189)), (t = j(t, u, v, w, x[o + 9], G, 3654602809)), (w = j(w, t, u, v, x[o + 12], H, 3873151461)), (v = j(v, w, t, u, x[o + 15], I, 530742520)), (u = j(u, v, w, t, x[o + 2], J, 3299628645)), (t = k(t, u, v, w, x[o + 0], K, 4096336452)), (w = k(w, t, u, v, x[o + 7], L, 1126891415)), (v = k(v, w, t, u, x[o + 14], M, 2878612391)), (u = k(u, v, w, t, x[o + 5], N, 4237533241)), (t = k(t, u, v, w, x[o + 12], K, 1700485571)), (w = k(w, t, u, v, x[o + 3], L, 2399980690)), (v = k(v, w, t, u, x[o + 10], M, 4293915773)), (u = k(u, v, w, t, x[o + 1], N, 2240044497)), (t = k(t, u, v, w, x[o + 8], K, 1873313359)), (w = k(w, t, u, v, x[o + 15], L, 4264355552)), (v = k(v, w, t, u, x[o + 6], M, 2734768916)), (u = k(u, v, w, t, x[o + 13], N, 1309151649)), (t = k(t, u, v, w, x[o + 4], K, 4149444226)), (w = k(w, t, u, v, x[o + 11], L, 3174756917)), (v = k(v, w, t, u, x[o + 2], M, 718787259)), (u = k(u, v, w, t, x[o + 9], N, 3951481745)), (t = c(t, p)), (u = c(u, q)), (v = c(v, r)), (w = c(w, s)); var O = m(t) + m(u) + m(v) + m(w); return O.toLowerCase(); }
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, a) => { s.call(this, t, (t, s, r) => { t ? a(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const a = this.getdata(t); if (a) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, a) => e(a)) }) } runScript(t, e) { return new Promise(s => { let a = this.getdata("@chavy_boxjs_userCfgs.httpapi"); a = a ? a.replace(/\n/g, "").trim() : a; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [i, o] = a.split("@"), n = { url: `http://${o}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": i, Accept: "*/*" }, timeout: r }; this.post(n, (t, e, a) => s(a)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e); if (!s && !a) return {}; { const a = s ? t : e; try { return JSON.parse(this.fs.readFileSync(a)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : a ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const a = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of a) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, a) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[a + 1]) >> 0 == +e[a + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, a] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, a, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, a, r] = /^@(.*?)\.(.*?)$/.exec(e), i = this.getval(a), o = a ? "null" === i ? null : i || "{}" : "{}"; try { const e = JSON.parse(o); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), a) } catch (e) { const i = {}; this.lodash_set(i, r, t), s = this.setval(JSON.stringify(i), a) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return this.data = this.loaddata(), this.data[t]; default: return this.data && this.data[t] || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0; default: return this.data && this.data[e] || null } } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { switch (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, a) => { !t && s && (s.body = a, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, a) }); break; case "Quantumult X": this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i, o) }, t => e(t && t.error || "UndefinedError")); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: a, statusCode: r, headers: i, rawBody: o } = t, n = s.decode(o, this.encoding); e(null, { status: a, statusCode: r, headers: i, rawBody: o, body: n }, n) }, t => { const { message: a, response: r } = t; e(a, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch (t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, a) => { !t && s && (s.body = a, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, a) }); break; case "Quantumult X": t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i, o) }, t => e(t && t.error || "UndefinedError")); break; case "Node.js": let a = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...i } = t; this.got[s](r, i).then(t => { const { statusCode: s, statusCode: r, headers: i, rawBody: o } = t, n = a.decode(o, this.encoding); e(null, { status: s, statusCode: r, headers: i, rawBody: o, body: n }, n) }, t => { const { message: s, response: r } = t; e(s, r, r && a.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let a = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in a) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? a[e] : ("00" + a[e]).substr(("" + a[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let a = t[s]; null != a && "" !== a && ("object" == typeof a && (a = JSON.stringify(a)), e += `${s}=${a}&`) } return e = e.substring(0, e.length - 1), e } msg(e = t, s = "", a = "", r) { const i = t => { switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } case "Loon": { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } case "Quantumult X": { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, a = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": a } } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, a, i(r)); break; case "Quantumult X": $notify(e, s, a, i(r)); break; case "Node.js": }if (!this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), a && t.push(a), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t); break; case "Node.js": this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) } } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; switch (this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } }(t, e) }
