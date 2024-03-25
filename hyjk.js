/**
 * cron 10 15 * * *
 * Show:重写请求函数 在got环境或axios环境都可以请求 适用于 20V版本以上node 本地运行
 * 需要的依赖 jsrsasign 和 encryptlong
 * 变量名: heyeHealth
 * 变量值: https://tuan.api.ybm100.com/ 请求头Headers中的token  多账号& 或换行 或新建同名变量
 * scriptVersionNow = "0.0.1";
 */

const $ = new Env("荷叶健康小程序-果园[免费领水果]");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "heyeHealth";
let envSplitor = ["&", "\n"]; //多账号分隔符
let strSplitor = "#"; //多变量分隔符
let userIdx = 0;
let userList = [];
class Task {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        //定义在这里的headers会被get请求删掉content-type 而不会重置
        this.taskIdList = []
        this.taskVenueIdList = []
        this.userId = ''
        this.treeId = ''
    }
    async main() {
        await this.getInfo()
        if (this.userId !== "" && this.treeId !== "") {
            await this.signInInfo()
            await this.getTaskList();//采集任务API
            for (let i of this.taskVenueIdList) {
                await this.taskList(i.venueId)
            }
            if (this.taskIdList.length > 0) {
                $.log(` 获取到任务列表`)
                $.log(JSON.stringify(this.taskIdList))
            }
            for (let i of this.taskIdList) {
                await this.updateTaskInfo(i.taskId, 0)
                await $.wait(20000)
                await this.updateTaskInfo(i.taskId, 1)
            }
            for (let i of this.taskVenueIdList) {
                //在执行一次 领取水滴
                await this.taskList(i.venueId)
            }
            await this.getInfo()
        }

    }
    async signInInfo() {
        try {
            let result = await this.taskRequest("post", `https://tuan.api.ybm100.com/miniapp/marketing/signActivity/signRecord`, JSON.stringify({
                "actId": 5712,
                "sceneId": 6,
                "channelCode": "130"
            }))
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.log(`✅账号[${this.index}]  当日签到状态 ${result.result.todaySignStatusDesc == "已签到" ? "✅" : "❌"} 🎉`)
                if (result.result.todaySignStatusDesc !== "已签到") {
                    await this.signIn()
                }
            } else {
                $.log(`❌账号[${this.index}]  获取签到状态失败[${result.msg}]`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async signIn() {
        try {
            let result = await this.taskRequest("post", `https://tuan.api.ybm100.com/miniapp/marketing/signActivity/sign`, JSON.stringify({ "actId": 5712, "sceneId": 6, "channelCode": "130" }))
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.log(`✅账号[${this.index}]  签到成功🎉`)
            } else {
                $.log(`❌账号[${this.index}]  签到失败[${result.msg}]`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async getInfo() {
        try {
            let result = await this.taskRequest("get", `https://tuan.api.ybm100.com/api/healthSquare/fruitManor/getMyManorInfo?channelCode=130`)
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.log(`✅账号[${this.index}]  当前水滴[${result.result.kettleWater}]-[${result.result.progressBarTips}]🎉`)
                this.treeId = Number(result.result.treeId)
                this.userId = result.result.userId
                for (let i = 0; i < Math.floor(Number(result.result.kettleWater) / 10); i++) {
                    await $.wait(3000)
                    await this.doWater()
                }
            } else {
                $.log(`❌账号[${this.index}]  获取果园信息失败[${result.msg}]`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async getTaskList() {
        try {
            let result = await this.taskRequest("get", `https://tuan.api.ybm100.com/api/healthSquare/fruitManor/getVenueInfo?channelCode=130`)
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                //获得taskList的venueId
                for (let i of result.result.list) {
                    this.taskVenueIdList.push({ venueId: i.venueId, waterNum: i.waterNum, venueName: i.venueName })
                }

                $.log(`✅账号[${this.index}]  采集任务成功🎉`)
            } else {
                $.log(`❌账号[${this.index}]  采集任务失败`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async taskList(venueId) {
        try {
            let result = await this.taskRequest("get", `https://tuan.api.ybm100.com/api/healthSquare/task/getTaskList?channelCode=130&venueId=${venueId}`)
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                for (let i of result.result) {
                    if (i.taskStatus == 0) { //2已完成
                        //去完成
                        //i.reward 奖励水滴
                        if (i.subTitle.indexOf("浏览") != -1) {
                            this.taskIdList.push({ taskId: i.taskId, mainTitle: i.mainTitle });

                        }
                    } else if (i.taskStatus == 1) {
                        await this.collectWater(i.taskId)
                    }
                }
                //$.log(`✅账号[${this.index}]  获取到任务🎉`)
            } else {
                $.log(`❌账号[${this.index}]  未获取到失败`);
            }
        } catch (e) {
            console.log(e);
        }
    }

    encrypt(body) {
        //通过抓包得到加密JS网址https://www.heyejk.com/game/js/app.87d7f243.js 代码很多 慢慢补环境即可
        //不理解为什么弄两个加密 烦死了
        //smallfawn 2024 / 3 / 23 22.11
        const t = body
        const { KJUR, hextob64 } = require("jsrsasign")
        global['window'] = {}
        global['navigator'] = {}
        const { JSEncrypt } = require("encryptlong")
        const te = "MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAKIGSy/bFo4l1JZuVpNCX3ccjf3eBgeooWzz0QgUFZhKZhJX7PxdfMw79fKjwR5ZGkCNPlO4F/TA3jrtoHHeewN8l3t7f63EFLud/5Ls3KOfHHYnkAo9bHWBWav84XdparGD4M8IHtq9qSGP6nRCOgnt4yqAmX8dJfYp9vr87cn3AgMBAAECgYEAlwzbB5Bu5LKsEFppZ/wW2ArM7YIRiQ5TACoGFEv1HfcuVaeXDmdxs02rKzwzDEHxUYDcPFyCKPGtvK5QSBgsAUUBHb6uu0fNGUccGX31NRAfLuQ8fj3W0uvkoYlpDARuokDHhWNqWzI6f8bFHkewJwpjXCO8w1WkogTLiX9Gu3ECQQDd5J4jEDS5+7KaohYRoryyX939mzsZ4RC6ufsfzTJwSlnLyYHEbm0Cs+7gbBxRrioqApBMQPIIoa5ujm1C88MNAkEAuu3htlbpR1ZL9b3wUuf3el/D3i/k9XvSChfHQ1q46Y/eck2yEDH9Kv/ZUxEl4fR8mB2MONm9oc2l+chPd9uQEwJBALcWuNU9vgPoB0tIiuUqXoDgUY+80ltcNi2c3/Uxn3jAIK/iKU0nwJMGXQiYrBVJnEjlrKL+w7cTkZZvtwATmtECQC2JV4vQvkFHj3eMzqeTpKDmBVPx/OekQzV8N2l8B0G2b20O6kqxssevzeRDcCQMJ/HyeL88o8pvy3f+yQUcsosCQQDZXV8K7Ek0R/V3dAdUzoetFSlfjCGy9QKPruz7m+iXBASxiA0R7YGfJzc8jWpuv0pxujtB/awy22K/ggLAhkZU",
            ne = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDNQpS4ZeHRiIPFIdZgupShTHFlGOqFkT6XEqByvWqt2BvLo3a+YfzyJHOXyfX41OvbIkuIaycuxU9w7RHI1e7F3O7Io+XxncjyU3GR+ae2DEtLaG3o/rtpONF5q1jTN/Spu4GKXsjhHrP9xxMThLF6134NKAyQZfvOms0gS0zmxwIDAQAB";
        let n = le(t)
        let o = (new Date).getTime()
        return he({ sign: n, timestamp: o })
        function ae(e) { let t = Object.keys(e).sort(), n = {}; return t.forEach(t => { n[t] = e[t] }), n }
        function de() { const e = new JSEncrypt(); return e.setPublicKey("-----BEGIN PUBLIC KEY-----" + ne + "-----END PUBLIC KEY-----"), e }
        function ce(e) { let t = ""; for (let n in e) t += `${n}=${e[n]}&`; return t = t.slice(0, t.length - 1), t }
        function he(e) { let t = de(), n = ce(e); return t.encryptLong(n) }
        function le(e) { const t = new KJUR.crypto.Signature({ alg: "SHA1withRSA" }); t.init("-----BEGIN PRIVATE KEY-----" + te + "-----END PRIVATE KEY-----"); let n = ae(e), o = ce(n); return t.updateString(o), hextob64(t.sign()) }
    }
    async doWater() {
        try {
            let body = { "channelCode": "130", "treeId": this.treeId, "nonce": $.randomString(6) }
            let result = await this.taskRequest("post", `https://tuan.api.ybm100.com/api/healthSquare/water/watering?secret=${encodeURIComponent(this.encrypt(body))}`, JSON.stringify(body))
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.log(`✅账号[${this.index}]  浇水成功🎉`)
            } else {
                $.log(`❌账号[${this.index}]  浇水失败[${result.msg}]`);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async updateTaskInfo(taskId, taskStatus) {
        //如果是第一次上报
        let body
        if (taskStatus == 0) {
            body = { "operateType": 5, "operateValue": `{\"taskId\":${taskId},\"seconds\":0}`, "channelCode": "130" }

        } else {
            body = { "userId": `${this.userId}`, "operateType": 6, "operateValue": `{\"taskId\":\"${taskId}\",\"status\":1}`, "channelCode": "130" }

        }
        //第二次
        try {
            let result = await this.taskRequest("post", `https://tuan.api.ybm100.com/api/healthSquare/user/userOperation`, JSON.stringify(body))
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.log(`✅账号[${this.index}]  上报任务成功🎉`)
            } else {
                $.log(`❌账号[${this.index}]  上报任务失败`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async collectWater(taskId) {
        let body = {
            "channelCode": "130",
            "taskId": taskId,
            "extTask": 0,
            "eventType": 12,
            "waterNum": 10,
            "nonce": $.randomString(6)
        }
        try {
            let result = await this.taskRequest("post", `https://tuan.api.ybm100.com/api/healthSquare/water/collectWater?secret=${encodeURIComponent(this.encrypt(body))}`, JSON.stringify(body))
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.log(`✅账号[${this.index}]  领取水滴成功 当前水滴[${result.result.kettleWater}]💧🎉`)
            } else {
                $.log(`❌账号[${this.index}]  领取水滴失败`);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async taskRequest(method, url, body = "") {
        //
        let headers = {
            "host": "tuan.api.ybm100.com",
            "apptype": "1",
            "terminal": "h5",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/9079",
            "content-type": "application/json; charset=UTF-8",
            "accept": "application/json, text/plain, */*",
            "appname": "ykq-xcx",
            "usertype": "groupuser",
            "token": this.ck,
            "appversion": "v3.1.7",
            "origin": "https://www.heyejk.com",
            "sec-fetch-site": "cross-site",
            "sec-fetch-mode": "cors",
            "sec-fetch-dest": "empty",
            "referer": "https://www.heyejk.com/",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "zh-CN,zh;q=0.9"
        }
        this.userId != '' ? Object.assign(headers, { "userid": this.userId }) : ''
        const reqeuestOptions = {
            url: url,
            method: method,
            headers: headers
        }
        body == "" ? "" : Object.assign(reqeuestOptions, { body: body })
        let { body: result } = await $.httpRequest(reqeuestOptions)
        return result
    }
}



!(async () => {
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
*   @modifyTime 2021-08-01
*   @modifyInfo 重写请求函数 在got环境或axios环境都可以请求
*/
function Env(t, s) { return new (class { constructor(t, s) { this.name = t; this.data = null; this.dataFile = "box.dat"; this.logs = []; this.logSeparator = "\n"; this.startTime = new Date().getTime(); Object.assign(this, s); this.log("", `\ud83d\udd14${this.name},\u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"); this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"); this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (((o = Object(o)[t]), void 0 === o)) return e; return o } lodash_set(t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), (s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : (t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}), t)[s[s.length - 1]] = e), t) } getdata(t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata(t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? ("null" === h ? null : h || "{}") : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), (e = this.setval(JSON.stringify(s), i)) } catch (s) { const h = {}; this.lodash_set(h, o, t), (e = this.setval(JSON.stringify(h), i)) } } else e = this.setval(t, s); return e } getval(t) { if (this.isSurge() || this.isLoon()) { return $persistentStore.read(t) } else if (this.isQuanX()) { return $prefs.valueForKey(t) } else if (this.isNode()) { this.data = this.loaddata(); return this.data[t] } else { return this.data && this.data[t] || null } } setval(t, s) { if (this.isSurge() || this.isLoon()) { return $persistentStore.write(t, s) } else if (this.isQuanX()) { return $prefs.setValueForKey(t, s) } else if (this.isNode()) { this.data = this.loaddata(); this.data[s] = t; this.writedata(); return true } else { return this.data && this.data[s] || null } } initRequestEnv(t) { try { require.resolve('got') && (this.requset = require("got"), this.requestModule = "got") } catch (e) { } try { require.resolve('axios') && (this.requset = require("axios"), this.requestModule = "axios") } catch (e) { } this.cktough = this.cktough ? this.cktough : require("tough-cookie"); this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar(); if (t) { t.headers = t.headers ? t.headers : {}; if (typeof t.headers.Cookie === "undefined" && typeof t.cookieJar === "undefined") { t.cookieJar = this.ckjar } } } queryStr(options) { return Object.entries(options).map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`).join('&') } getURLParams(url) { const params = {}; const queryString = url.split('?')[1]; if (queryString) { const paramPairs = queryString.split('&'); paramPairs.forEach(pair => { const [key, value] = pair.split('='); params[key] = value }) } return params } isJSONString(str) { try { return JSON.parse(str) && typeof JSON.parse(str) === 'object' } catch (e) { return false } } isJson(obj) { var isjson = typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length; return isjson } async sendMsg(message) { if (!message) return; if ($.isNode()) { await notify.sendNotify($.name, message) } else { $.msg($.name, '', message) } } async httpRequest(options) { let t = { ...options }; t.headers = t.headers || {}; if (t.params) { t.url += '?' + this.queryStr(t.params) } t.method = t.method.toLowerCase(); if (t.method === 'get') { delete t.headers['Content-Type']; delete t.headers['Content-Length']; delete t.headers['content-type']; delete t.headers['content-length']; delete t.body } else if (t.method === 'post') { let ContentType; if (!t.body) { t.body = "" } else if (typeof t.body === "string") { ContentType = this.isJSONString(t.body) ? 'application/json' : 'application/x-www-form-urlencoded' } else if (this.isJson(t.body)) { t.body = JSON.stringify(t.body); ContentType = 'application/json' } if (!t.headers['Content-Type'] && !t.headers['content-type']) { t.headers['Content-Type'] = ContentType } } if (this.isNode()) { this.initRequestEnv(t); if (this.requestModule === "axios" && t.method === "post") { t.data = t.body; delete t.body } let httpResult; if (this.requestModule === "got") { httpResult = await this.requset(t); if (this.isJSONString(httpResult.body)) { httpResult.body = JSON.parse(httpResult.body) } } else if (this.requestModule === "axios") { httpResult = await this.requset(t); httpResult.body = httpResult.data } return httpResult } if (this.isQuanX()) { t.method = t.method.toUpperCase(); return new Promise((resolve, reject) => { $task.fetch(t).then(response => { if (this.isJSONString(response.body)) { response.body = JSON.parse(response.body) } resolve(response) }) }) } } randomNumber(length) { const characters = '0123456789'; return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('') } randomString(length) { const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'; return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('') } timeStamp() { return new Date().getTime() } uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16) }) } time(t) { let s = { "M+": new Date().getMonth() + 1, "d+": new Date().getDate(), "H+": new Date().getHours(), "m+": new Date().getMinutes(), "s+": new Date().getSeconds(), "q+": Math.floor((new Date().getMonth() + 3) / 3), S: new Date().getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = (t) => !t || (!this.isLoon() && this.isSurge()) ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o))); let logs = ['', '==============📣系统通知📣==============']; logs.push(t); e ? logs.push(e) : ''; i ? logs.push(i) : ''; console.log(logs.join('\n')); this.logs = this.logs.concat(logs) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t) } wait(t) { return new Promise((s) => setTimeout(s, t)) } done(t = {}) { const s = new Date().getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`); this.log(); if (this.isNode()) { process.exit(1) } if (this.isQuanX()) { $done(t) } } })(t, s) }
