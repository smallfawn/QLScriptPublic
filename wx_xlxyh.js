/**
 * cron 5 10 * * *
 * Show:重写请求函数 在got环境或axios环境都可以请求
 * 微信小程序_骁龙骁友会 每日签到 点赞分享文章 免费抽奖一次 阅读和看视频以后更新
 * 变量名:wx_xlxyh 
 * 变量值:https://qualcomm.growthideadata.com/qualcomm-app/    
 * headers请求头中 sessionkey的值和userid的值 用#拼接 用#拼接 用#拼接
 * 需要手动进一次抽奖界面 进行抽奖后再来运行脚本
 * scriptVersionNow = "0.0.1";
 */

const $ = new Env("微信小程序_骁龙骁友会");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "wx_xlxyh";
let envSplitor = ["&", "\n"]; //多账号分隔符
let strSplitor = "#"; //多变量分隔符
let userIdx = 0;
let userList = [];
class Task {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.userId = str.split(strSplitor)[1];
        this.UA = this.getUA()
        this.openId = ""
        this.articleId = ""

    }

    async main() {
        await this.UserInfoApi();
        if (this.ckStatus) {
            await this.updateClick(`userId=${this.userId}&openId=${this.openId}&activityId=&activitySource=Xcx_ShouYeShortCut&isWifi=1&model=microsoft&manufacturer=microsoft&urlQuery=%7B%22channel%22%3A%22Xcx_ShouYeShortCut%22%7D&urlPath=pages%2Ftask-center%2Findex&urlName=%E4%BB%BB%E5%8A%A1%E4%B8%AD%E5%BF%83%E9%A1%B5&referrer=&scene=1256&pageStatus=&sfMsgTitle=&elementId=&elementName=%E4%BB%BB%E5%8A%A1%E4%B8%AD%E5%BF%83_%E4%BB%8A%E6%97%A5%E7%AD%BE%E5%88%B0&elementType=%E9%A1%B5%E9%9D%A2&stallsName=%E4%BB%BB%E5%8A%A1%E4%B8%AD%E5%BF%83_%E4%BB%8A%E6%97%A5%E7%AD%BE%E5%88%B0&eventNameEn=MPClick`)
            await this.SignInApi()
            await this.updateClick(`userId=${this.userId}&openId=${this.openId}&activityId=7&activitySource=Xcx_MeiRiRenWu&isWifi=1&model=microsoft&manufacturer=microsoft&urlQuery=%7B%22channel%22%3A%22Xcx_MeiRiRenWu%22%7D&urlPath=pages%2Fwheel%2Findex&urlName=%E8%8A%AF%E5%8A%A8%E7%A6%8F%E5%88%A9&referrer=&scene=1256&pageStatus=&sfMsgTitle=&elementId=&elementName=%E7%82%B9%E5%87%BB%E6%8A%BD%E5%A5%96&elementType=%E9%A1%B5%E9%9D%A2&stallsName=&eventNameEn=MPClick`)
            await this.LuckDrawApi()
            await this.ArticleListApi()
            if (this.articleId !== "") {
                await this.ReadStartApi(this.articleId)
                await this.LikeApi(this.articleId)
                await this.ShareApi(this.articleId)
                $.log(`模拟阅读55s`)
                await $.wait(55000)
                await this.ReadEndApi(this.articleId)
            }
        }

    }
    async taskRequest(method, url, body = "") {

        let headers = {
            //"requestId": "88bd9fdf29c845be8e41a1e122337d6b",
            //timestamp: 1711330339720,
            //xweb_xhr: 1,
            "Host": "qualcomm.growthideadata.com",
            //sign: "478d557229cdd6ac89128648a2a61e63",
            Accept: "*/*",
            "User-Agent": this.UA,
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "Referer": "https://servicewechat.com/wx026c06df6adc5d06/413/page-frame.html",
            "sessionKey": this.ck,
            "userId": Number(this.userId),
        }
        this.openId !== "" ? Object.assign(headers, { "openId": this.openId }) : ""
        const reqeuestOptions = {
            url: url,
            method: method,
            headers: headers
        }
        //console.log(reqeuestOptions)
        body == "" ? "" : Object.assign(reqeuestOptions, { body: body })
        let { body: result } = await $.httpRequest(reqeuestOptions)
        return result
    }
    async LuckDrawApi() {
        try {
            let LuckDrawNumResult = await this.taskRequest("get", `https://qualcomm.growthideadata.com/qualcomm-app/api/luckDraw/list?userId=${this.userId}&activityId=7`)
            if (LuckDrawNumResult.code == 200) {
                //当前剩余签到次数 == 总数 //可以免费抽奖一次
                if (LuckDrawNumResult.data.luckDrawCount == LuckDrawNumResult.data.luckDrawSumCount) {
                    let LuckDrawTaskResult = await this.taskRequest("get", `https://qualcomm.growthideadata.com/qualcomm-app/api/luckDraw/getLuck?userId=${this.userId}&activityId=7`)
                    if (LuckDrawTaskResult.code == 200) {
                        $.log(`账号[${this.userId}] 抽奖成功 获得[${LuckDrawTaskResult.data.name}]🎉`)
                    } else {
                        //console.log(LuckDrawTaskResult)
                        $.log(`账号[${this.userId}] 抽奖失败 ${LuckDrawTaskResult.message}`);
                    }
                }
            } else {
                $.log(`账号[${this.userId}] 获取抽奖信息失败 ${LuckDrawNumResult.message}`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async updateClick(body) {
        try {
            let Result = await this.taskRequest("post", `https://qualcomm.growthideadata.com/qualcomm-app/api/buryPointApp/save`, body)
            if (Result.code == 200) {
                $.log(`账号[${this.userId}] 上传点击成功`);
            } else {
                $.log(`账号[${this.userId}] 上传点击失败 ${Result.message}`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async UserInfoApi() {
        try {
            let UserInfoResult = await this.taskRequest("get", `https://qualcomm.growthideadata.com/qualcomm-app/api/user/info?userId=${this.userId}`)
            if (UserInfoResult.code == 200) {
                $.log(`✅账号[${this.userId}]  【昵称】[${UserInfoResult.data.nick}]  【等级】[${UserInfoResult.data.level}]  【现有积分】${UserInfoResult.data.coreCoin} 【累计获得】${UserInfoResult.data.cumulativeCoreCoin}🎉`);
                this.openId = UserInfoResult.data.openId
                this.ckStatus = true
            } else {
                $.log(`❌账号[${this.userId}] 获取个人信息失败 ${UserInfoResult.message}`);
                this.ckStatus = false
            }
        } catch (e) {
            console.log(e);
        }
    }
    async ReadStartApi(articleId) {
        try {
            let ReadStartApi = await this.taskRequest("post", `https://qualcomm.growthideadata.com/qualcomm-app/api/article/enterReadDaily`, `articleId=${articleId}&userId=${this.userId}`)
            if (ReadStartApi.code == 200) {
                $.log(`✅账号[${this.userId}]  阅读文章开始上传成功🎉`);

            } else {
                $.log(`❌账号[${this.userId}] 阅读文章开始上传失败 [${ReadStartApi.message}]`);

            }
        } catch (e) {
            console.log(e);
        }
    }
    async ReadEndApi(articleId) {
        try {
            let ReadEndApi = await this.taskRequest("post", `https://qualcomm.growthideadata.com/qualcomm-app/api/article/exitReadDaily`, `articleId=${articleId}&userId=${this.userId}`)
            if (ReadEndApi.code == 200) {
                $.log(`✅账号[${this.userId}]  阅读文章结束上传成功🎉`);

            } else {
                $.log(`❌账号[${this.userId}] 阅读文章结束上传失败 [${ReadEndApi.message}]`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async ShareApi(articleId) {
        try {
            let ShareResult = await this.taskRequest("post", `https://qualcomm.growthideadata.com/qualcomm-app/api/article/shareDaily`, `articleId=${articleId}&userId=${this.userId}`)
            if (ShareResult.code == 200) {
                $.log(`✅账号[${this.userId}]  分享文章成功`)
            } else {
                $.log(`❌账号[${this.userId}]  分享文章失败[${ShareResult.message}]`)
            }
        } catch (e) {
            console.log(e);
        }
    }
    async LikeApi(articleId) {
        try {
            let LikeResult = await this.taskRequest("get", `https://qualcomm.growthideadata.com/qualcomm-app/api/article/like?articleId=${articleId}&userId=${this.userId}`)
            if (LikeResult.code == 200) {
                $.log(`✅账号[${this.userId}]  点赞文章成功`)
            } else {
                $.log(`❌账号[${this.userId}]  点赞文章失败[${LikeResult.message}]`)
            }
        } catch (e) {
            console.log(e);
        }
    }
    async ArticleListApi() {
        try {
            let ArticleListResult = await this.taskRequest("get", `https://qualcomm.growthideadata.com/qualcomm-app/api/home/articles?page=1&size=20&userId=${this.userId}&type=0&searchDate=&articleShowPlace=%E9%AA%81%E5%8F%8B%E8%B5%84%E8%AE%AF%E5%88%97%E8%A1%A8%E9%A1%B5`)
            if (ArticleListResult.code == 200) {
                $.log(`✅账号[${this.userId}]  获取文章${ArticleListResult.message} 准备阅读/点赞/分享🎉`);

                this.articleId = ArticleListResult.data.articleList[this.randomInt(1, 10)].id
            } else {
                $.log(`❌账号[${this.userId}]  获取文章失败[${ArticleListResult.message}]`)
            }
        } catch (e) {
            console.log(e);
        }
    }
    async SignInApi() {
        try {
            let SignInListResult = await this.taskRequest("get", `https://qualcomm.growthideadata.com/qualcomm-app/api/user/signList?userId=${this.userId}`)
            if (SignInListResult.code == 200) {
                if (SignInListResult.data.isSignToday == 1) {
                    $.log(`✅账号[${this.userId}]  今天已经签到过了`);
                } else {
                    let SignInResult = await this.taskRequest("get", `https://qualcomm.growthideadata.com/qualcomm-app/api/user/signIn?userId=${this.userId}`)
                    if (SignInResult.code == 200) {
                        $.log(`✅账号[${this.userId}]  签到成功[${SignInResult.data.coreCoin}]🎉`);
                    } else {
                        $.log(`❌账号[${this.userId}]  签到失败[${SignInResult.message}]`)
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }

    }

    randomInt(min, max) {
        return Math.round(Math.random() * (max - min) + min)
    }
    getUA() {
        const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        const safari_version = `${randomInt(600, 700)}.${randomInt(1, 4)}.${randomInt(1, 5)}`;
        const ios_version = `${randomInt(12, 15)}.${randomInt(0, 6)}.${randomInt(0, 9)}`;
        const ua_string = `Mozilla/5.0 (iPhone; CPU iPhone OS ${ios_version} like Mac OS X) AppleWebKit/${safari_version} (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.20(0x16001422) NetType/WIFI Language/zh_CN`;

        return ua_string;
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
*   @modifyTime 2024-03-23
*   @modifyInfo 重写请求函数 在got环境或axios环境都可以请求
*/
function Env(t, s) { return new (class { constructor(t, s) { this.name = t; this.data = null; this.dataFile = "box.dat"; this.logs = []; this.logSeparator = "\n"; this.startTime = new Date().getTime(); Object.assign(this, s); this.log("", `\ud83d\udd14${this.name},\u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"); this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"); this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (((o = Object(o)[t]), void 0 === o)) return e; return o } lodash_set(t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), (s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : (t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}), t)[s[s.length - 1]] = e), t) } getdata(t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata(t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? ("null" === h ? null : h || "{}") : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), (e = this.setval(JSON.stringify(s), i)) } catch (s) { const h = {}; this.lodash_set(h, o, t), (e = this.setval(JSON.stringify(h), i)) } } else e = this.setval(t, s); return e } getval(t) { if (this.isSurge() || this.isLoon()) { return $persistentStore.read(t) } else if (this.isQuanX()) { return $prefs.valueForKey(t) } else if (this.isNode()) { this.data = this.loaddata(); return this.data[t] } else { return this.data && this.data[t] || null } } setval(t, s) { if (this.isSurge() || this.isLoon()) { return $persistentStore.write(t, s) } else if (this.isQuanX()) { return $prefs.setValueForKey(t, s) } else if (this.isNode()) { this.data = this.loaddata(); this.data[s] = t; this.writedata(); return true } else { return this.data && this.data[s] || null } } initRequestEnv(t) { try { require.resolve('got') && (this.requset = require("got"), this.requestModule = "got") } catch (e) { } try { require.resolve('axios') && (this.requset = require("axios"), this.requestModule = "axios") } catch (e) { } this.cktough = this.cktough ? this.cktough : require("tough-cookie"); this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar(); if (t) { t.headers = t.headers ? t.headers : {}; if (typeof t.headers.Cookie === "undefined" && typeof t.cookieJar === "undefined") { t.cookieJar = this.ckjar } } } queryStr(options) { return Object.entries(options).map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`).join('&') } getURLParams(url) { const params = {}; const queryString = url.split('?')[1]; if (queryString) { const paramPairs = queryString.split('&'); paramPairs.forEach(pair => { const [key, value] = pair.split('='); params[key] = value }) } return params } isJSONString(str) { try { return JSON.parse(str) && typeof JSON.parse(str) === 'object' } catch (e) { return false } } isJson(obj) { var isjson = typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length; return isjson } async sendMsg(message) { if (!message) return; if ($.isNode()) { await notify.sendNotify($.name, message) } else { $.msg($.name, '', message) } } async httpRequest(options) { let t = { ...options }; t.headers = t.headers || {}; if (t.params) { t.url += '?' + this.queryStr(t.params) } t.method = t.method.toLowerCase(); if (t.method === 'get') { delete t.headers['Content-Type']; delete t.headers['Content-Length']; delete t.headers['content-type']; delete t.headers['content-length']; delete t.body } else if (t.method === 'post') { let ContentType; if (!t.body) { t.body = "" } else if (typeof t.body === "string") { ContentType = this.isJSONString(t.body) ? 'application/json' : 'application/x-www-form-urlencoded' } else if (this.isJson(t.body)) { t.body = JSON.stringify(t.body); ContentType = 'application/json' } if (!t.headers['Content-Type'] && !t.headers['content-type']) { t.headers['Content-Type'] = ContentType } } if (this.isNode()) { this.initRequestEnv(t); if (this.requestModule === "axios" && t.method === "post") { t.data = t.body; delete t.body } let httpResult; if (this.requestModule === "got") { httpResult = await this.requset(t); if (this.isJSONString(httpResult.body)) { httpResult.body = JSON.parse(httpResult.body) } } else if (this.requestModule === "axios") { httpResult = await this.requset(t); httpResult.body = httpResult.data } return httpResult } if (this.isQuanX()) { t.method = t.method.toUpperCase(); return new Promise((resolve, reject) => { $task.fetch(t).then(response => { if (this.isJSONString(response.body)) { response.body = JSON.parse(response.body) } resolve(response) }) }) } } randomNumber(length) { const characters = '0123456789'; return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('') } randomString(length) { const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'; return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('') } timeStamp() { return new Date().getTime() } uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16) }) } time(t) { let s = { "M+": new Date().getMonth() + 1, "d+": new Date().getDate(), "H+": new Date().getHours(), "m+": new Date().getMinutes(), "s+": new Date().getSeconds(), "q+": Math.floor((new Date().getMonth() + 3) / 3), S: new Date().getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = (t) => !t || (!this.isLoon() && this.isSurge()) ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o))); let logs = ['', '==============📣系统通知📣==============']; logs.push(t); e ? logs.push(e) : ''; i ? logs.push(i) : ''; console.log(logs.join('\n')); this.logs = this.logs.concat(logs) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t) } wait(t) { return new Promise((s) => setTimeout(s, t)) } done(t = {}) { const s = new Date().getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`); this.log(); if (this.isNode()) { process.exit(1) } if (this.isQuanX()) { $done(t) } } })(t, s) }
