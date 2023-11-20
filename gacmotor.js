/**
 * cron 56 13 * * *  gacmotor.js
 * Show:广汽传祺 评论 分享(转发) 签到 发表文章
 * @author https://github.com/smallfawn/QLScriptPublic
 * 变量名: gacmotorToken  https://next.gacmotor.com/app 域名下 headers 中 appToken & deviceCode & registrationID 多账@
 *        gacmotorPost=false 默认关闭发表文章功能 true为开启(此功能存在风控检测,谨慎开启)
 */

const $ = new Env("广汽传祺");
const notify = $.isNode() ? require('./sendNotify') : '';
const appVersion = "5.1.0"
let ckName = "gacmotorToken";
let envSplitor = ["@", "\n"]; //多账号分隔符
let strSplitor = "&"; //多变量分隔符
let userIdx = 0;
let userList = [];
class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.deviceCode = str.split(strSplitor)[1];
        this.registrationID = str.split(strSplitor)[2];
        this.signInStatus = false//默认签到状态false
        this.userIdStr = ""
        this.postList = []//自己
        this.applatestlist = []//最新帖子列表
        this.titleList = []//
        this.contentList = []//
    }
    _MD5(str) {
        const crypto = require("crypto");
        return crypto.createHash("md5").update(str).digest("hex");
    }
    _getHeaders(method) {
        let timestamp1 = new Date().getTime();
        let timestamp2 = new Date().getTime();
        let nonce = Math.floor(100000 + Math.random() * 900000);
        let appid = `8c4131ff-e326-43ea-b333-decb23936673`
        let key = `46856407-b211-4a10-9cb2-5a9b94361614`
        let sig = this._MD5(`${timestamp1}${nonce}${appid}${key}`)
        let apiSignKey = `a361588rt20dpol`
        let apiSign = (this._MD5(`${timestamp2}${apiSignKey}`)).toUpperCase()

        if (method == "get") {
            return {
                "Accept": "application/json",
                "appToken": this.ck,
                "deviceCode": this.deviceCode,
                "current-time": timestamp2,
                "deviceId": this.registrationID,
                "version": appVersion,
                "nonce": nonce,
                "token": this.ck,
                "Authorization": `Bearer ${this.ck}`,
                "sig": sig,
                "platformNo": "Android",
                "osVersion": 10,
                "operateSystem": "android",
                "appId": appid,
                "registrationID": this.registrationID,
                "api-sign": apiSign,
                "deviceModel": "MI 8 Lite",
                "timestamp": timestamp1,
                //"Content-Type": "application/json; charset=UTF-8",
                //"Content-Length": 24,
                "Host": "next.gacmotor.com",
                "Connection": "Keep-Alive",
                "Accept-Encoding": "gzip",
                "User-Agent": "okhttp/4.8.1"
            }
        } else {
            return {
                "Accept": "application/json",
                "appToken": this.ck,
                "deviceCode": this.deviceCode,
                "current-time": timestamp2,
                "deviceId": this.registrationID,
                "version": appVersion,
                "nonce": nonce,
                "token": this.ck,
                "Authorization": `Bearer ${this.ck}`,
                "sig": sig,
                "platformNo": "Android",
                "osVersion": 10,
                "operateSystem": "android",
                "appId": appid,
                "registrationID": this.registrationID,
                "api-sign": apiSign,
                "deviceModel": "MI 8 Lite",
                "timestamp": timestamp1,
                "Content-Type": "application/json; charset=UTF-8",
                //"Content-Length": 24,
                "Host": "next.gacmotor.com",
                "Connection": "Keep-Alive",
                "Accept-Encoding": "gzip",
                "User-Agent": "okhttp/4.8.1"
            }
        }
    }

    async main() {
        console.log(`第[${this.index}]个账号执行开始`);
        await this._userInfo();
        if (this.ckStatus == true) {
            await this._getGDou()
            await this._signInStatus()
            await this._signInCounts()
            if (this.signInStatus == false) {
                await this._signIn()
            }
            console.log(`正在远程获取15条随机评论~请等待15-20秒`)
            await this._getText()
            if (process.env["gacmotorPost"] == undefined || process.env["gacmotorPost"] == "false") {
            }
            if (process.env["gacmotorPost"] == "true") {
                await this._post(this.titleList[0], this.contentList[0])//可能需要图片
                console.log(`等待30s`)
                await $.wait(30000)
                await this._postlist()
                for (let postId of this._postlist) {
                    await this._delete(postId)
                }
            }
            await this._applatestlist()
            for (let postId of this.applatestlist) {
                await this._forward(postId)
                await this._add(postId, this.titleList[0])
            }
        } else {
        }
        $.msg($.name, "", `第[${this.index}]个账号执行完毕`)
    }
    async _getText() {
        try {
            let textList = []
            let options = {
                fn: "获取随机一言",
                method: "get",
                url: `https://v1.hitokoto.cn/?c=e`,
            }
            for (let i = 0; i < 15; i++) {
                await $.wait(1000)
                let { body: result } = await httpRequest(options);
                //console.log(options);
                result = JSON.parse(result);
                //console.log(result);
                if (result["length"] > 15) {
                    textList.push(result.hitokoto)
                }
                this.titleList = [textList[0]]
                this.contentList = [textList[1]]
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _userInfo() {
        try {
            let options = {
                fn: "信息查询",
                method: "post",
                url: `https://next.gacmotor.com/app/app-api/user/getLoginUser`,
                headers: this._getHeaders("post"),
                body: ``
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`✅${options.fn}状态[${result.resultMsg}]🎉`);
                console.log(`[${result.data.mobile}][${result.data.nickname}][${result.data.userIdStr}]`);
                this.userIdStr = result.data.userIdStr;
                this.ckStatus = true
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                this.ckStatus = false
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _getGDou() {
        try {
            let options = {
                fn: "G豆查询",
                method: "get",
                url: `https://next.gacmotor.com/app/app-api/user/getUserGdou`,
                headers: this._getHeaders("get"),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`✅${options.fn}状态[${result.resultMsg}]🎉`);
                console.log(`当前G豆数量[${result.data}]`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _applatestlist() {
        try {
            let options = {
                fn: "最新帖子列表",
                method: "get",
                url: `https://next.gacmotor.com/app/community-api/community/api/post/applatestlist?pageNum=1&pageSize=10`,
                headers: this._getHeaders("get"),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                this.applatestlist = [result.data.list[0].postVo.postId]
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _signInStatus() {
        try {
            let options = {
                fn: "签到查询",
                method: "get",
                url: `https://next.gacmotor.com/app/app-api/sign/signStatus`,
                headers: this._getHeaders("get"),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`✅${options.fn}状态[${result.resultMsg}]🎉`);
                if (result.data == true) {
                    //已签
                    this.signInStatus = true;
                } else {
                    //未签
                    this.signInStatus = false
                }
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _signInCounts() {
        try {
            let options = {
                fn: "签到信息",
                method: "get",
                url: `https://next.gacmotor.com/app/app-api/sign/countSignDays`,
                headers: this._getHeaders("get"),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`✅${options.fn}状态[${result.resultMsg}]🎉`);
                console.log(`已经连续签到${result.data}天`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _signIn() {
        try {
            let options = {
                fn: "签到执行",
                method: "get",
                url: `https://next.gacmotor.com/app/app-api/sign/submit`,
                headers: this._getHeaders("get"),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`✅${options.fn}状态[${result.resultMsg}]🎉`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _forward(postId) {
        try {
            let options = {
                fn: "转发",
                method: "post",
                url: `https://next.gacmotor.com/app/community-api/community/api/post/forward`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ "postId": postId })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`${result}🎉`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _add(postId, commentContent) {
        try {
            let options = {
                fn: "评论",
                method: "post",
                url: `https://next.gacmotor.com/app/community-api/community/api/comment/add`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ "commentType": 0, "postId": postId, "commentContent": commentContent, "isReplyComment": 1, "commentImg": "" })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`${result}🎉`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _post(postTitle, postContent) {
        try {
            let options = {
                fn: "发表文章",
                method: "post",
                url: `https://next.gacmotor.com/app/community-api/community/api/post/appsavepost`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ "address": "", "channelInfoId": "", "cityId": "", "columnId": "", "commodityId": "", "commodityMainImage": "", "commodityName": "", "commodityType": "", "contentImgNums": 0, "contentWords": postContent, "coverImg": "", "customCover": "https://pic-gsp.gacmotor.com/app/a7b1a896-4f92-449f-859e-5e238d131ea3.jpg", "detailAddress": "", "lat": "", "lng": "", "orderId": "", "orderPrice": "", "orderSn": "", "orderType": "", "postContent": `[{\"text\":\"${postContent}\"}]`, "postTitle": postTitle, "postType": "2", "rankTotal": "", "topicId": "", "vin": "", "weekRank": "" })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`${result}🎉`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _delete(postId) {
        try {
            let options = {
                fn: "删除文章",
                method: "post",
                url: `https://next.gacmotor.com/app/community-api/community/api/post/delete`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ "postId": postId.toString() })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`${result}🎉`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _postlist() {
        try {
            let options = {
                fn: "文章列表",
                method: "post",
                url: `https://next.gacmotor.com/app/community-api/community/api/post/querylist`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ "pageNum": 1, "pageSize": 10, "userIdStr": this.userIdStr, "userId": this.userIdStr, "myHome": true })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`${result}🎉`);
                //文章ID result.data.list[0].postId
                this.postList = [result.data.list[0].postId];
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
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
}

!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        await start();
    }
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
        for (let n of userCookie.split(e)) n && userList.push(new UserInfo(n));
    } else {
        console.log("未找到CK");
        return;
    }
    return console.log(`共找到${userList.length}个账号`), true; //true == !0
}

/////////////////////////////////////////////////////////////////////////////////////
function httpRequest(options) {
    if (!options["method"]) {
        return console.log(`请求方法不存在`);
    }
    if (!options["fn"]) {
        console.log(`函数名不存在`);
    }
    return new Promise((resolve) => {
        $[options.method](options, (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err);
                } else {
                    try {
                        resp = JSON.parse(resp);
                    } catch (error) { }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(resp);
            }
        });
    });
}
// prettier-ignore
function Env(t, s) { return new (class { constructor(t, s) { (this.name = t), (this.data = null), (this.dataFile = "box.dat"), (this.logs = []), (this.logSeparator = "\n"), (this.startTime = new Date().getTime()), Object.assign(this, s), this.log("", `\ud83d\udd14${this.name},\u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } getScript(t) { return new Promise((s) => { this.get({ url: t }, (t, e, i) => s(i)) }) } runScript(t, s) { return new Promise((e) => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); (o = o ? 1 * o : 20), (o = s && s.timeout ? s.timeout : o); const [h, a] = i.split("@"), r = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": h, Accept: "*/*" }, }; this.post(r, (t, s, i) => e(i)) }).catch((t) => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (((o = Object(o)[t]), void 0 === o)) return e; return o } lodash_set(t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), (s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : (t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}), t)[s[s.length - 1]] = e), t) } getdata(t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata(t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? ("null" === h ? null : h || "{}") : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), (e = this.setval(JSON.stringify(s), i)) } catch (s) { const h = {}; this.lodash_set(h, o, t), (e = this.setval(JSON.stringify(h), i)) } } else e = this.setval(t, s); return e } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? ((this.data = this.loaddata()), this.data[t]) : (this.data && this.data[t]) || null } setval(t, s) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, s) : this.isQuanX() ? $prefs.setValueForKey(t, s) : this.isNode() ? ((this.data = this.loaddata()), (this.data[s] = t), this.writedata(), !0) : (this.data && this.data[s]) || null } initGotEnv(t) { (this.got = this.got ? this.got : require("got")), (this.cktough = this.cktough ? this.cktough : require("tough-cookie")), (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()), t && ((t.headers = t.headers ? t.headers : {}), void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, s = () => { }) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? $httpClient.get(t, (t, e, i) => { !t && e && ((e.body = i), (e.statusCode = e.status)), s(t, e, i) }) : this.isQuanX() ? $task.fetch(t).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, s) => { try { const e = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(e, null), (s.cookieJar = this.ckjar) } catch (t) { this.logErr(t) } }).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h, } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t))) } post(t, s = () => { }) { if ((t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), delete t.headers["Content-Length"], this.isSurge() || this.isLoon())) $httpClient.post(t, (t, e, i) => { !t && e && ((e.body = i), (e.statusCode = e.status)), s(t, e, i) }); else if (this.isQuanX()) (t.method = "POST"), $task.fetch(t).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: e, ...i } = t; this.got.post(e, i).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)) } } time(t) { let s = { "M+": new Date().getMonth() + 1, "d+": new Date().getDate(), "H+": new Date().getHours(), "m+": new Date().getMinutes(), "s+": new Date().getSeconds(), "q+": Math.floor((new Date().getMonth() + 3) / 3), S: new Date().getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = (t) => !t || (!this.isLoon() && this.isSurge()) ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o))), this.logs.push("", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="), this.logs.push(s), e && this.logs.push(e), i && this.logs.push(i) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t) } wait(t) { return new Promise((s) => setTimeout(s, t)) } done(t = {}) { const s = new Date().getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } })(t, s) }
