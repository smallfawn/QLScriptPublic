/**
 * cron 31 11 * * *
 * Show:自己改定时 防止默认定时
 * 变量名:fenxiang
 * 变量值:https://api.fenxianglife.com 或https://fenxiang-lottery-api.fenxianglife.com 请求头Headers中的三个值
 * did#finger#token#oaid  多账号&或换行 或新建同名变量 四个值
 * 中间的分现金 每天开奖
 * 必填邀请码 J5KHD8
 * scriptVersionNow = "0.0.1";
 */

const $ = new Env("粉象生活App");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "fenxiang";
let envSplitor = ["&", "\n"]; //多账号分隔符
let strSplitor = "#"; //多变量分隔符
let userIdx = 0;
let userList = [];


class Task {
    constructor(str) {
        this.index = ++userIdx;
        this.did = str.split(strSplitor)[0];
        this.finger = str.split(strSplitor)[1]; //单账号多变量分隔符
        this.token = str.split(strSplitor)[2]; //单账号多变量分隔符
        this.oaid = str.split(strSplitor)[3]; //单账号多变量分隔符
        this.ckStatus = true;
        this.taskList=[]

    }
    async main() {
        await this.user_info();
        await this.sign_reward()
        await this.special_finish()
        await this.task_list()
        //console.log(this.taskList)
        for(let i of this.taskList){
            await $.wait(5000)
            await this.task_finish(i.id)
        }
    }

    async user_info() {
        let result = await this.taskRequest("get", `https://api.fenxianglife.com/njia/users/info`)
        //console.log(result);
        if (result.code == 200) {
            $.log(`✅账号[${this.index}]  欢迎用户: ${result.data.userInfo.id}🎉`)
            this.ckStatus = true;
        } else {
            $.log(`❌账号[${this.index}]  用户查询: 失败`);
            this.ckStatus = false;
            //console.log(result);
        }
    }
    async task_finish(id) {
        let result = await this.taskRequest("post", `https://fenxiang-lottery-api.fenxianglife.com/fenxiang-lottery/lotteryCode/task/finish`, JSON.stringify({
            "taskId": id
        }))
        console.log(result);
        if (result.code == 200) {
            $.log(`✅账号[${this.index}]  任务${id}完成🎉`)
        } else {
            $.log(`❌账号[${this.index}]  任务${id}失败`);
            //console.log(result);
        }
    }

    async special_finish() {
        let result = await this.taskRequest("post", `https://api.fenxianglife.com/njia/game/task/special/finish`, JSON.stringify({
        }))
        console.log(result);
        if (result.errcode == 0) {
            $.log(`✅账号[${this.index}]  欢迎用户: ${result.errcode}🎉`)
            this.ckStatus = true;
        } else {
            $.log(`❌账号[${this.index}]  用户查询: 失败`);
            this.ckStatus = false;
            //console.log(result);
        }
    }

    async sign_reward() {
        let result = await this.taskRequest("post", `https://fenxiang-lottery-api.fenxianglife.com/fenxiang-lottery/user/sign/reward`, JSON.stringify({
        }))
        //console.log(result);
        if (result.code == 200) {
            $.log(`✅账号[${this.index}]  签到成功🎉`)
        } else {
            $.log(`❌账号[${this.index}]  签到失败`);
            console.log(result);
        }
    }
        async task_list() {
        let result = await this.taskRequest("post", 'https://fenxiang-lottery-api.fenxianglife.com/fenxiang-lottery/home/data/V2', JSON.stringify({
            "plateform": "android",
            "version": "5.4.3"
        }));
        //console.log(result);
        if (result.code == 200) {
            for (let i of result.data.taskModule.taskResult) {
                if (i.taskStatus == 0) {
                    this.taskList.push(i)

                }
            }

        } else {
            $.log(`❌账号[${this.index}]  获取任务失败`);
            //console.log(result);
        }
    }
    async taskRequest(method, url, body = "") {
        let re = function (e) {
            function convertObjectToQueryString(obj) {
                let queryString = "";
                if (obj) {
                    const keys = Object.keys(obj).sort();
                    keys.forEach(key => {
                        const value = obj[key];
                        if (value !== null && typeof value !== 'object') {
                            queryString += `&${key}=${value}`;
                        }
                    });
                }
                return queryString.slice(1);
            }
            return convertObjectToQueryString(e)
        }
        function v(e) {
            const crypto = require("crypto")
            return crypto.createHash("md5").update(e).digest("hex")
        }
        const g = {
            traceid: v((new Date).getTime().toString() + Math.random().toString()),
            noncestr: Math.random().toString().slice(2, 10),
            timestamp: Date.now(),
            platform: "h5",
            did: this.did,
            version: "1.0.0",
            finger: this.finger,
            token: this.token,
            oaid: this.oaid,
        }
        const c = "\u7c89\u8c61\u597d\u725b\u903ca8c19d8267527ea4c7d2f011acf7766f"
        let s = method === "get" ?   void 0:JSON.parse(body)
        let e = void 0 === s ? {} : s
        g.sign = v(re(e) + re(g)  + c)
        let headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.99 Mobile Safari/537.36 AgentWeb/5.0.0  UCBrowser/11.6.4.950',
             'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
            'origin': 'https://m.fenxianglife.com',
            'sec-fetch-dest': 'empty',
            'x-requested-with': 'com.n_add.android',
            'sec-fetch-site': 'same-site',
            'sec-fetch-mode': 'cors',
            'referer': 'https://m.fenxianglife.com/h5-lottery/index.html?hideBack=1&sourceType=lottery_tab&token=030e7e9158af06dea2b3d0175a471ada&AppToken=96e06ae9f3cab6784de443015b8d9ad8&uid=515226607&v=5.4.3&did=njia992631e6-b9b2-4383-b67c-86b5d0fe818a&level=1&platform=android&timestamp=1717426249&channel=xiaomi&traFromId=23192687628924991393323633117947',
            'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            "Content-Type":"application/json"
        }
        Object.assign(headers, g)
        //console.log(headers)
        const reqeuestOptions = {
            url: url,
            method: method,
            headers: headers,
            body:body
        }
        let { body: result } = await $.httpRequest(reqeuestOptions)
        return result
    }
}



!(async () => {
    console.log(`==================================================\n 脚本执行 - 北京时间(UTC+8): ${new Date(
        new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000
    ).toLocaleString()} \n==================================================`);
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        let taskall = [];
        for (let user of userList) {
            if (user.ckStatus) {
                taskall.push(user.main());
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
 *   @modifyTime 2024-05-01
 *   @modifyInfo 抽离操作文件的函数
 */
function Env(t, s) { return new (class { constructor(t, s) { this.name = t; this.logs = []; this.logSeparator = "\n"; this.startTime = new Date().getTime(); Object.assign(this, s); this.log("", `\ud83d\udd14${this.name},\u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } initRequestEnv(t) { try { require.resolve("got") && ((this.requset = require("got")), (this.requestModule = "got")) } catch (e) { } try { require.resolve("axios") && ((this.requset = require("axios")), (this.requestModule = "axios")) } catch (e) { } this.cktough = this.cktough ? this.cktough : require("tough-cookie"); this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar(); if (t) { t.headers = t.headers ? t.headers : {}; if (typeof t.headers.Cookie === "undefined" && typeof t.cookieJar === "undefined") { t.cookieJar = this.ckjar } } } queryStr(options) { return Object.entries(options).map(([key, value]) => `${key}=${typeof value === "object" ? JSON.stringify(value) : value}`).join("&") } getURLParams(url) { const params = {}; const queryString = url.split("?")[1]; if (queryString) { const paramPairs = queryString.split("&"); paramPairs.forEach((pair) => { const [key, value] = pair.split("="); params[key] = value }) } return params } isJSONString(str) { try { return JSON.parse(str) && typeof JSON.parse(str) === "object" } catch (e) { return false } } isJson(obj) { var isjson = typeof obj == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length; return isjson } async sendMsg(message) { if (!message) return; if (this.isNode()) { await notify.sendNotify(this.name, message) } else { this.msg(this.name, "", message) } } async httpRequest(options) { let t = { ...options }; t.headers = t.headers || {}; if (t.params) { t.url += "?" + this.queryStr(t.params) } t.method = t.method.toLowerCase(); if (t.method === "get") { delete t.headers["Content-Type"]; delete t.headers["Content-Length"]; delete t.headers["content-type"]; delete t.headers["content-length"]; delete t.body } else if (t.method === "post") { let ContentType; if (!t.body) { t.body = "" } else if (typeof t.body === "string") { ContentType = this.isJSONString(t.body) ? "application/json" : "application/x-www-form-urlencoded" } else if (this.isJson(t.body)) { t.body = JSON.stringify(t.body); ContentType = "application/json" } if (!t.headers["Content-Type"] && !t.headers["content-type"]) { t.headers["Content-Type"] = ContentType } } if (this.isNode()) { this.initRequestEnv(t); if (this.requestModule === "axios" && t.method === "post") { t.data = t.body; delete t.body } let httpResult; if (this.requestModule === "got") { httpResult = await this.requset(t); if (this.isJSONString(httpResult.body)) { httpResult.body = JSON.parse(httpResult.body) } } else if (this.requestModule === "axios") { httpResult = await this.requset(t); httpResult.body = httpResult.data } return httpResult } if (this.isQuanX()) { t.method = t.method.toUpperCase(); return new Promise((resolve, reject) => { $task.fetch(t).then((response) => { if (this.isJSONString(response.body)) { response.body = JSON.parse(response.body) } resolve(response) }) }) } } randomNumber(length) { const characters = "0123456789"; return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join("") } randomString(length) { const characters = "abcdefghijklmnopqrstuvwxyz0123456789"; return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join("") } timeStamp() { return new Date().getTime() } uuid() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) { var r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8; return v.toString(16) }) } time(t) { let s = { "M+": new Date().getMonth() + 1, "d+": new Date().getDate(), "H+": new Date().getHours(), "m+": new Date().getMinutes(), "s+": new Date().getSeconds(), "q+": Math.floor((new Date().getMonth() + 3) / 3), S: new Date().getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = (t) => !t || (!this.isLoon() && this.isSurge()) ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o))); let logs = ["", "==============📣系统通知📣=============="]; logs.push(t); e ? logs.push(e) : ""; i ? logs.push(i) : ""; console.log(logs.join("\n")); this.logs = this.logs.concat(logs) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t) } wait(t) { return new Promise((s) => setTimeout(s, t)) } done(t = {}) { const s = new Date().getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`); this.log(); if (this.isNode()) { process.exit(1) } if (this.isQuanX()) { $done(t) } } })(t, s) }
function Bucket() { return new (class { constructor(fileName) { this.fileName = fileName; this.ensureFileExists(); this.data = this.readFile() } ensureFileExists() { this.fs ? this.fs : (this.fs = require("fs")); this.path ? this.path : (this.path = require("path")); this.filePath = this.path.join(__dirname, this.fileName); if (!this.fs.existsSync(this.filePath)) { this.fs.writeFileSync(this.filePath, "{}") } } readFile() { try { const data = this.fs.readFileSync(this.filePath, "utf-8"); return JSON.parse(data) } catch (error) { console.error(`Error reading file:${error}`); return {} } } writeFile() { try { this.fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2)) } catch (error) { } } set(key, value) { this.data[key] = value; this.writeFile() } get(key) { return this.data[key] } })() }
