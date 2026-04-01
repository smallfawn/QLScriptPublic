/**
 * cron 9 9 * * *
 * Show:重写请求函数 在got环境或axios环境都可以请求
 * 卡夫亨 微信网页 https://fscrm.kraftheinz.net.cn/?from=Yk0bMRVg1XmcWpJp6N5OkA== 每日签到分享领积分换卡券
 * 
 * 变量名:kafufeng
 * 变量值:多账号& 或换行 或新建同名变量   fscrm.kraftheinz.net.cn 抓请求头Headers中的token
 * scriptVersionNow = "0.0.1";
 */

const $ = new Env("卡夫亨");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "kafufeng";
let envSplitor = ["&", "\n"]; //多账号分隔符
let strSplitor = "#"; //多变量分隔符
let userIdx = 0;
let userList = [];
let shareList = []
let msg = ""
class Task {
  constructor(str) {
    this.index = ++userIdx;
    this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
    this.ckStatus = true;
    //定义在这里的headers会被get请求删掉content-type 而不会重置
  }
  async main() {
    await this.userInfo();
    await this.signIn()
    await this.getShareUrl()
  }
  async taskRequest(method, url, body = "") {
    //
    let headers = {
      "Host": "fscrm.kraftheinz.net.cn",
      "Connection": "keep-alive",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x6309092b) XWEB/9079 Flue",
      "token": this.ck,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "*/*",
      "Origin": "https://fscrm.kraftheinz.net.cn",
      "Referer": "https://fscrm.kraftheinz.net.cn/?code=081dcPGa1MYgaH0yI6Ga1Rw39X0dcPGg&state=&appid=wx65da983ae179e97b",

    }
    const reqeuestOptions = {
      url: url,
      method: method,
      headers: headers
    }
    body == "" ? "" : Object.assign(reqeuestOptions, { body: body })
    let { body: result } = await $.httpRequest(reqeuestOptions)
    return result
  }
  async userInfo() {
    try {
      let result = await this.taskRequest("get", `https://fscrm.kraftheinz.net.cn/crm/public/index.php/api/v1/getUserInfo`)
      //console.log(result);
      if (result.error_code == 0) {
        $.log(`✅账号[${this.index}]  欢迎用户 ${result.data.nickname} 积分 => ${result.data.memberInfo.score}🎉`)
        this.ckStatus = true;
      } else {
        $.log(`❌账号[${this.index}]  用户查询失败[${result.msg}]`);
        this.ckStatus = false;
      }
    } catch (e) {
      console.log(e);
    }
  }
  async signIn() {
    try {
      let result = await this.taskRequest("post", `https://fscrm.kraftheinz.net.cn/crm/public/index.php/api/v1/dailySign`, ``)
      //console.log(result);
      if (result.error_code == 0) {
        $.log(`✅账号[${this.index}]   [${result.msg}] 当前积分[${result.data.res}]🎉`)
      } else {
        $.log(`❌账号[${this.index}]  签到失败[${result.msg}]`);
      }
    } catch (e) {
      console.log(e);
    }
  }
  randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }
  async getShareUrl() {
    try {
      let result = await this.taskRequest("post", `https://fscrm.kraftheinz.net.cn/crm/public/index.php/api/v1/getCookbookIndex`, "page=1&pagesize=10")
      //console.log(result);
      if (result.error_code == 0) {
        let shareid = result.data.chineseCookbook.data[this.randomInt(0, 9)].id
        let getShareCodeResult = await this.taskRequest("post", `https://fscrm.kraftheinz.net.cn/crm/public/index.php/api/v1/createCookbookCode`, `cookbook_id=${shareid}`)
        if (getShareCodeResult?.error_code == 0) {
          //console.log(getShareCodeResult)
          let code_url = getShareCodeResult?.data.code_url.replace("https://fscrm.kraftheinz.net.cn/?", "")
          shareList.push(code_url)
          $.log(`✅账号[${this.index}]${code_url}获取分享文章链接成功,添加到内部助力池成功 🎉`);
        }
      } else {
        $.log(`❌账号[${this.index}]  签到失败[${result.msg}]`);
      }
    } catch (e) {
      console.log(e);
    }
  }
  //首账号助力作者?，//得到助力码数组后 账号一助力账号二  .....最后一个账号助力账号1
  async help(params) {
    try {
      let result = await this.taskRequest("post", `https://fscrm.kraftheinz.net.cn/crm/public/index.php/api/v1/recordScoreShare`, params)
      //console.log(result);
      if (result.error_code == 0) {
        //console.log(`✅账号[${this.index}]  欢迎用户: ${result.errcode}🎉`);
        $.log(`✅账号[${this.index}]   助力情况${result.msg}🎉`)
      } else {
        $.log(`❌账号[${this.index}]  助力失败[${result.msg}]`);
      }
    } catch (e) {
      console.log(e);
    }
  }
}



!(async () => {
  if (!(await checkEnv())) return;
  if (userList.length > 0) {
    let taskall = [];
    for (let user of userList) {
      if (user.ckStatus) {
        taskall.push(await user.main());
      }
    }
    await Promise.all(taskall);
    taskall = [];
    for (let i in userList) {
      if (userList[i].ckStatus) {
        let sharCode = shareList[Number(i) + 1]

        if (sharCode !== undefined) {
          console.log(userList[i].ck + "=>" + sharCode)
          taskall.push(await userList[i].help(sharCode));
        } else {
          if (userList.length > 1) {
            console.log(userList[i].ck + "=>" + shareList[0])
            taskall.push(await userList[i].help(shareList[0]));
          } else {
            $.log(`账号数目为1 不执行内部助力`)

          }
        }
      }
    }
    await Promise.all(taskall);
  }
  await $.sendMsg($.logs.join("\n"))
})()
  .catch((e) => console.log(e))
  .finally(() => $.done());

//********************************************************
/**
 * 变量检查与处理
 * @returns
 */
async function checkEnv() {
  let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || "";
  if (userCookie) {
    let e = envSplitor[0];
    for (let o of envSplitor)
      if (userCookie.indexOf(o) > -1) {
        e = o;
        break;
      }
    for (let n of userCookie.split(e)) n && userList.push(new Task(n));
  } else {
    console.log(`未找到CK【${ckName}】`);
    return;
  }
  return console.log(`共找到${userList.length}个账号`), true; //true == !0
}
//Env Api =============================
/*
*   @modifyAuthor @smallfawn 
*   @modifyTime 2024-03-23
*   @modifyInfo 重写请求函数 在got环境或axios环境都可以请求
*/
function Env(t, s) { return new (class { constructor(t, s) { this.name = t; this.data = null; this.dataFile = "box.dat"; this.logs = []; this.logSeparator = "\n"; this.startTime = new Date().getTime(); Object.assign(this, s); this.log("", `\ud83d\udd14${this.name},\u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"); this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"); this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (((o = Object(o)[t]), void 0 === o)) return e; return o } lodash_set(t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), (s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : (t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}), t)[s[s.length - 1]] = e), t) } getdata(t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata(t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? ("null" === h ? null : h || "{}") : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), (e = this.setval(JSON.stringify(s), i)) } catch (s) { const h = {}; this.lodash_set(h, o, t), (e = this.setval(JSON.stringify(h), i)) } } else e = this.setval(t, s); return e } getval(t) { if (this.isSurge() || this.isLoon()) { return $persistentStore.read(t) } else if (this.isQuanX()) { return $prefs.valueForKey(t) } else if (this.isNode()) { this.data = this.loaddata(); return this.data[t] } else { return this.data && this.data[t] || null } } setval(t, s) { if (this.isSurge() || this.isLoon()) { return $persistentStore.write(t, s) } else if (this.isQuanX()) { return $prefs.setValueForKey(t, s) } else if (this.isNode()) { this.data = this.loaddata(); this.data[s] = t; this.writedata(); return true } else { return this.data && this.data[s] || null } } initRequestEnv(t) { try { require.resolve('got') && (this.requset = require("got"), this.requestModule = "got") } catch (e) { } try { require.resolve('axios') && (this.requset = require("axios"), this.requestModule = "axios") } catch (e) { } this.cktough = this.cktough ? this.cktough : require("tough-cookie"); this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar(); if (t) { t.headers = t.headers ? t.headers : {}; if (typeof t.headers.Cookie === "undefined" && typeof t.cookieJar === "undefined") { t.cookieJar = this.ckjar } } } queryStr(options) { return Object.entries(options).map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`).join('&') } getURLParams(url) { const params = {}; const queryString = url.split('?')[1]; if (queryString) { const paramPairs = queryString.split('&'); paramPairs.forEach(pair => { const [key, value] = pair.split('='); params[key] = value }) } return params } isJSONString(str) { try { return JSON.parse(str) && typeof JSON.parse(str) === 'object' } catch (e) { return false } } isJson(obj) { var isjson = typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length; return isjson } async sendMsg(message) { if (!message) return; if ($.isNode()) { await notify.sendNotify($.name, message) } else { $.msg($.name, '', message) } } async httpRequest(options) { let t = { ...options }; t.headers = t.headers || {}; if (t.params) { t.url += '?' + this.queryStr(t.params) } t.method = t.method.toLowerCase(); if (t.method === 'get') { delete t.headers['Content-Type']; delete t.headers['Content-Length']; delete t.headers['content-type']; delete t.headers['content-length']; delete t.body } else if (t.method === 'post') { let ContentType; if (!t.body) { t.body = "" } else if (typeof t.body === "string") { ContentType = this.isJSONString(t.body) ? 'application/json' : 'application/x-www-form-urlencoded' } else if (this.isJson(t.body)) { t.body = JSON.stringify(t.body); ContentType = 'application/json' } if (!t.headers['Content-Type'] && !t.headers['content-type']) { t.headers['Content-Type'] = ContentType } } if (this.isNode()) { this.initRequestEnv(t); if (this.requestModule === "axios" && t.method === "post") { t.data = t.body; delete t.body } let httpResult; if (this.requestModule === "got") { httpResult = await this.requset(t); if (this.isJSONString(httpResult.body)) { httpResult.body = JSON.parse(httpResult.body) } } else if (this.requestModule === "axios") { httpResult = await this.requset(t); httpResult.body = httpResult.data } return httpResult } if (this.isQuanX()) { t.method = t.method.toUpperCase(); return new Promise((resolve, reject) => { $task.fetch(t).then(response => { if (this.isJSONString(response.body)) { response.body = JSON.parse(response.body) } resolve(response) }) }) } } randomNumber(length) { const characters = '0123456789'; return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('') } randomString(length) { const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'; return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('') } timeStamp() { return new Date().getTime() } uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16) }) } time(t) { let s = { "M+": new Date().getMonth() + 1, "d+": new Date().getDate(), "H+": new Date().getHours(), "m+": new Date().getMinutes(), "s+": new Date().getSeconds(), "q+": Math.floor((new Date().getMonth() + 3) / 3), S: new Date().getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = (t) => !t || (!this.isLoon() && this.isSurge()) ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o))); let logs = ['', '==============📣系统通知📣==============']; logs.push(t); e ? logs.push(e) : ''; i ? logs.push(i) : ''; console.log(logs.join('\n')); this.logs = this.logs.concat(logs) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t) } wait(t) { return new Promise((s) => setTimeout(s, t)) } done(t = {}) { const s = new Date().getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`); this.log(); if (this.isNode()) { process.exit(1) } if (this.isQuanX()) { $done(t) } } })(t, s) }
