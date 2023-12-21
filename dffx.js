/**
 * cron 45 19 * * *  dffx.js
 * Show:东方风行 APP
 * @author https://github.com/smallfawn/QLScriptPublic
 * 变量名:dffxCookie
 * 变量值:https://lqdm-app.dflzm.com请求头Headers中Cookie
 * scriptVersionNow = "0.0.1";
 */

const $ = new Env("东方风行");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "dffxCookie";
let envSplitor = ["@", "\n"]; //多账号分隔符
let strSplitor = "&"; //多变量分隔符
let userIdx = 0;
let userList = [];
class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.artList = []//文章列表
        this.taskList = []//任务列表
        this.task_num_like = null //待做点赞任务数
        this.task_num_share = null//待做转发任务数
        this.userPoint = null

    }
    async main() {
        $.log(`===== 开始第[${this.index}]个账号 =====`)
        await this.user_info();
        if (this.ckStatus) {
            await this.addSign()

        }

    }


    async addSign() {
        try {
            let options = {
                fn: "签到",
                method: "get",
                url: `https://lqdm-app.dflzm.com/customer/app-vip-user/exterior/user/task/signIn?isReSign=0`,
            }
            options.headers = this.get_headers(options.method, options.url)
            let { body: result } = await $.httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.log(`✅[${options.fn}]成功🎉`)
            } else {
                console.log(`❌[${options.fn}]失败`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async user_info() {
        try {
            let options = {
                fn: "信息查询",
                method: "get",
                url: `https://lqdm-app.dflzm.com/customer/app-vip-user/exterior/user/getMe`,
            }
            options.headers = this.get_headers(options.method, options.url)
            let { body: result } = await $.httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                //console.log(`✅账号[${this.index}]  欢迎用户: ${result.errcode}🎉`);
                $.log(`✅[${result.data.nickname}][${result.data.phone}][${result.data.id}]当前积分[${result.data.integral}]🎉`)
                this.ckStatus = true;
            } else {
                console.log(`❌[UserInfo]查询: 失败`);
                this.ckStatus = false;
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }


    

    sha256(str) {
        const crypto = require("crypto");
        return crypto.createHash("sha256").update(str).digest("hex");

    }
    get_headers(method, url, body = "") {
        url = url.replace("https://lqdm-app.dflzm.com", "")
        let path = url.split('?')[0]
        let params
        if(url.split('?')[1]){
         params = url.split('?')[1].split('&').sort().join("").toLowerCase()
        }else{
            params = ""
        }
        method = method.toUpperCase();
        let timestamp = new Date().getTime()
        const key = `3b8379a44daa6ab982c886d8bcdcc82a`
        let str
        if (method == "POST") {
            str = `${method}${path}ice-auth-appkey:9831532554ice-auth-timestamp:${timestamp}json=${body}${params}${key}`
        } else {
            str = `${method}${path}ice-auth-appkey:9831532554ice-auth-timestamp:${timestamp}${params}${key}`

        }
        //console.log(encodeURIComponent(str))
        const sign = this.sha256(encodeURIComponent(str))
        return {
            "Content-Type": "application/json;charset=UTF-8",
            "User-Agent": "okhttp/3.14.9 (Android 10; Xiaomi MI 8 Lite Build/V11.0.2.0.QDTCNXM 3.2.6 40059 release dflqApp)",
            "appInfo": JSON.stringify({ "appVersion": "3.2.6", "osVersion": "Android 10", "appType": "Android", "deviceName": "Xiaomi MI 8 Lite", "deviceId": "7ec3eaf292dc3ead268d7335cc308f88@1703156059659" }),
            "Cache-Control": "no-cache",
            "platform": 2,
            "device": "cAndroid",
            "deviceSN": "7ec3eaf292dc3ead268d7335cc308f88@1703156059659",
            "Cookie": this.ck,
            //"userId": "",
            "appKey": 9831532554,
            "ice-auth-appkey": 9831532554,
            "ice-auth-timestamp": timestamp,
            "ice-auth-sign": sign,
            "Content-Type": "application/json;charset=UTF-8",
            "Host": "lqdm-app.dflzm.com",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "identity"
        }
    }
    get_uuid() {
        return 'xxxxxxxx-xxxx-xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

async function start() {
    let taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            taskall.push(await user.main());
        }
    }
    await Promise.all(taskall);
    $.msg($.name, `任务已完成`)
}

!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        await start();
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
    let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || ""
    if (userCookie) {
        let e = envSplitor[0];
        for (let o of envSplitor)
            if (userCookie.indexOf(o) > -1) {
                e = o;
                break;
            }
        for (let n of userCookie.split(e)) n && userList.push(new UserInfo(n));
    } else {
        console.log("未找到CK");
        return;
    }
    return console.log(`共找到${userList.length}个账号`), true; //true == !0
}

/////////////////////////////////////////////////////////////////////////////////////
// prettier-ignore
function Env(t, s) { return new (class { constructor(t, s) { this.name = t; this.data = null; this.dataFile = "box.dat"; this.logs = []; this.logSeparator = "\n"; this.startTime = new Date().getTime(); Object.assign(this, s); this.log("", `\ud83d\udd14${this.name},\u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"); this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"); this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (((o = Object(o)[t]), void 0 === o)) return e; return o } lodash_set(t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), (s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : (t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}), t)[s[s.length - 1]] = e), t) } getdata(t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata(t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? ("null" === h ? null : h || "{}") : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), (e = this.setval(JSON.stringify(s), i)) } catch (s) { const h = {}; this.lodash_set(h, o, t), (e = this.setval(JSON.stringify(h), i)) } } else e = this.setval(t, s); return e } getval(t) { if (this.isSurge() || this.isLoon()) { return $persistentStore.read(t) } else if (this.isQuanX()) { return $prefs.valueForKey(t) } else if (this.isNode()) { this.data = this.loaddata(); return this.data[t] } else { return this.data && this.data[t] || null } } setval(t, s) { if (this.isSurge() || this.isLoon()) { return $persistentStore.write(t, s) } else if (this.isQuanX()) { return $prefs.setValueForKey(t, s) } else if (this.isNode()) { this.data = this.loaddata(); this.data[s] = t; this.writedata(); return true } else { return this.data && this.data[s] || null } } initGotEnv(t) { this.got = this.got ? this.got : require("got"); this.cktough = this.cktough ? this.cktough : require("tough-cookie"); this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar(); if (t) { t.headers = t.headers ? t.headers : {}; if (typeof t.headers.Cookie === "undefined" && typeof t.cookieJar === "undefined") { t.cookieJar = this.ckjar } } } queryStr(options) { return Object.entries(options).map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`).join('&') } isJSONString(str) { try { var obj = JSON.parse(str); if (typeof obj == 'object' && obj) { return true } else { return false } } catch (e) { return false } } isJson(obj) { var isjson = typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length; return isjson } async sendMsg(message) { if (!message) return; if ($.isNode()) { await notify.sendNotify($.name, message) } else { $.msg($.name, '', message) } } async httpRequest(options) { const t = { ...options }; if (!t.headers) { t.headers = {} } if (t.params) { t.url += '?' + this.queryStr(t.params) } t.method = t.method.toLowerCase(); if (t.method === 'get') { delete t.headers['Content-Type']; delete t.headers['Content-Length']; delete t["body"] } if (t.method === 'post') { let contentType; if (!t.body) { t.body = "" } else { if (typeof t.body == "string") { if (this.isJSONString(t.body)) { contentType = 'application/json' } else { contentType = 'application/x-www-form-urlencoded' } } else if (this.isJson(t.body)) { t.body = JSON.stringify(t.body); contentType = 'application/json' } } if (!t.headers['Content-Type']) { t.headers['Content-Type'] = contentType } delete t.headers['Content-Length'] } if (this.isNode()) { this.initGotEnv(t); let httpResult = await this.got(t); if (this.isJSONString(httpResult.body)) { httpResult.body = JSON.parse(httpResult.body) } return httpResult } } randomNumber(length) { const characters = '0123456789'; return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('') } randomString(length) { const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'; return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('') } timeStamp() { return new Date().getTime() } uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16) }) } time(t) { let s = { "M+": new Date().getMonth() + 1, "d+": new Date().getDate(), "H+": new Date().getHours(), "m+": new Date().getMinutes(), "s+": new Date().getSeconds(), "q+": Math.floor((new Date().getMonth() + 3) / 3), S: new Date().getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = (t) => !t || (!this.isLoon() && this.isSurge()) ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o))); let logs = ['', '==============📣系统通知📣==============']; logs.push(t); e ? logs.push(e) : ''; i ? logs.push(i) : ''; console.log(logs.join('\n')); this.logs = this.logs.concat(logs) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t) } wait(t) { return new Promise((s) => setTimeout(s, t)) } done(t = {}) { const s = new Date().getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } })(t, s) }
