/**
 * new Env("硬声")
 * cron 2 17 * * *  yingsheng.js
 * Show:
 * 23/08/29 更新点赞任务 更新评论 自动领取
 * 变量名:yingsheng_data
 * 变量值:抓yingsheng.elecfans.com 请求头Headers中Authorization或者token 
 * scriptVersionNow = "0.0.3";
 */

const $ = new Env("硬声");
const ckName = "yingsheng_data";
const Notify = 1; //0为关闭通知,1为打开通知,默认为1
let envSplitor = ["@", "\n"]; //多账号分隔符
let strSplitor = '&'; //多变量分隔符

let scriptVersionNow = "0.0.3";


async function start() {
    await getVersion("smallfawn/QLScriptPublic@main/yingsheng.js");
    await getNotice();

    console.log("\n====================================\n");
    let taskall = [];
    for (let user of $.userList) {
        if (user.ckStatus) {
            taskall.push(await user.task());
            await $.wait(1000);
        }
    }
    await Promise.all(taskall);
}

class UserInfo {
    constructor(str) {
        this.index = ++$.userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.videoList = [];
    }
    /**
     * //该加密实现 https://yingshengstatic.elecfans.com/80f05da.js 关键词 (t.headers.sign = v)
     * @param {*} r 如果是get传入params  如果是post传入data/body
     */
    getSign(timestamp, r, type) {
        //let newData = r
        var n
        if (type == "h5") {
            n = "lw0270iBJzxXdJLRtePEENsauRzkHSqm"
        } else if (type == "android") {
            n = "cnry8k3o4WdCGU1Tq09cRVOPCnfJzt7p"

        }

        const crypto = require("crypto");
        let l = { timestamp: timestamp, Authorization: this.ck, platform: type }
        var data = {};
        Object.keys(r).map(function (t) {
            data[t] = r[t];
        });
        //赋值给data且赋值到l中
        Object.assign(l, r),
            (l = (function (t) {
                for (
                    var e = Object.keys(t).sort(), n = {}, i = 0;
                    i < e.length;
                    i++
                )
                    n[e[i]] = t[e[i]];
                return n;
            })(l));
        function convertObjectToString(obj) {
            let str = '';
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    str += `${key}=${encodeURIComponent(obj[key])}&`;
                }
            }
            return str.slice(0, -1);
        }

        var f = convertObjectToString(l)

        if (type == "android") {
            f += "cnry8k3o4WdCGU1Tq09cRVOPCnfJzt7p"
        }
        //console.log(f)
        var h = crypto.createHash("sha1"),
            d = crypto.createHash("sha1");
        h.update(f);
        var m = n + h.digest("hex") + this.ck;
        d.update(m);
        var v = d.digest("hex");
        return v
    }
    getHeaders_H5(data) {
        const timestamp = Math.round(new Date().getTime() / 1e3)
        return {
            "Host": "yingsheng.elecfans.com",
            "Connection": "keep-alive",
            "Authorization": this.ck,
            "Content-Type": "application/json;charset=UTF-8",
            "Accept": "application/json, text/plain, /",
            "timestamp": timestamp,
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36appAndroid",
            "platform": "h5",
            "token": this.ck,
            "sign": this.getSign(timestamp, data, "h5"),
            "version": "2.7.4",
            "Origin": "https://yingsheng.elecfans.com",
            "X-Requested-With": "com.hq.hardvoice",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": `https://yingsheng.elecfans.com/task?token=${this.ck}&version=2.7.4&time=${timestamp}&statusH=30`,
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        }
    }
    getHeaders_ANDROID(data) {
        const timestamp = Math.round(new Date().getTime() / 1e3)
        return {
            "Host": "ysapi.elecfans.com",
            "Connection": "keep-alive",
            "Authorization": this.ck,
            "Content-Type": "application/json;charset=UTF-8",
            "model": "MI 8 Lite",
            "timestamp": timestamp,
            "User-Agent": "okhttp/3.12.6",
            //"markId":"",
            "platform": "android",
            "sign": this.getSign(timestamp, data, "android"),
            "version": "2.7.4",
            "Accept-Encoding": "gzip",
        }
    }
    async task() {
        await this.sign_in_info()
        await this.task_list()
        await this.task_list()
    }
    async sign_in_info() {
        try {
            const data = { "date": "" }
            let options = {
                url: `https://yingsheng.elecfans.com/ysapi/wapi/activity/signin/data?date=`,
                headers: this.getHeaders_H5(data),
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.message == "success！") {
                $.DoubleLog(`✅账号[${this.index}]  账号共签到${result.data.data.signin_total}  🎉`)
                $.DoubleLog(`✅账号[${this.index}]  账号是否签到  🎉`)
                if (result.data.data.today_is_sign !== 1) {
                    $.DoubleLog(`✅账号[${this.index}]  账号未签到  🎉`)
                    await this.sign_in()
                } else {
                    $.DoubleLog(`✅账号[${this.index}]  账号已签到  🎉`)
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  签到失败`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }

    }
    async sign_in() {
        try {
            const data = { "date": "" }
            let options = {
                url: `https://yingsheng.elecfans.com/ysapi/wapi/activity/signin/signin`,
                headers: this.getHeaders_H5(data),
                body: JSON.stringify(data)
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.message == "success！") {
                $.DoubleLog(`✅账号[${this.index}]  签到成功  获得${result.data.coins}积分🎉`);
            } else {
                $.DoubleLog(`❌账号[${this.index}]  签到失败`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async video_list() {
        try {
            const data = { "page": 1 }
            let options = {
                url: `https://ysapi.elecfans.com/api/recommend/video/index?page=1`,
                headers: this.getHeaders_ANDROID(data),
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.message == "success！") {
                $.DoubleLog(`✅账号[${this.index}]  刷新视频列表成功🎉`);

                /*for (let index = 0; index < 5; index++) {
                    console.log()
                    await this.video_like(result.data.data[index].detail.id)
                }*/
                this.videoList = result.data.data
            } else {
                $.DoubleLog(`❌账号[${this.index}]  刷新视频列表失败`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async video_like() {
        try {
            let video_id = ""
            for (let index = 0; index < 5; index++) {
                video_id = this.videoList[index].detail.id
                const data = { "type": 1, "video_id": id }
                let options = {
                    url: `https://ysapi.elecfans.com/api/video/publish/thumbsup`,
                    headers: this.getHeaders_ANDROID(data),
                    body: `type=1&video_id=${video_id}`
                },
                    result = await httpRequest(options);
                //console.log(options);
                //console.log(result);
                if (result.message == "success！") {
                    $.DoubleLog(`✅账号[${this.index}]  点赞视频成功🎉`);

                } else {
                    $.DoubleLog(`❌账号[${this.index}]  点赞视频失败`);
                    //console.log(result);
                }
            }

        } catch (e) {
            console.log(e);
        }
    }

    async task_list() {
        try {
            const data = {}
            let options = {
                url: `https://yingsheng.elecfans.com/ysapi/wapi/activity/task/dailyList`,
                headers: this.getHeaders_H5(data),
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.message == "success！") {
                await this.video_list()
                console.log(result.data["4"].step["1"].com_status)
                if (result.data["4"].step["1"].finish_progress < result.data["4"].step["1"].condition) {
                    $.DoubleLog(`✅账号[${this.index}]  执行点赞视频任务🎉`)
                    await this.video_like()
                } else if (result.data["4"].step["1"].com_status == 12) {
                    await this.receive_coin(4)
                } else if (result.data["5"].step["1"].finish_progress < result.data["5"].step["1"].condition) {
                    /*$.DoubleLog(`✅账号[${this.index}]  执行评论视频任务🎉`)
                    await this.video_add()
                    console.log(result.data["4"].finish_step)*/
                } else if (result.data["5"].step["1"].com_status == 12) {
                    //await this.receive_coin(5)
                }
                //5评论
                //6发布
                //3关注
            } else {
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async video_add() {
        try {
            let to_user_id = ""
            let to_nick_name = ""
            let target_id = ""
            for (let index = 0; index < 5; index++) {
                to_user_id = this.videoList[index].detail.user_info.user_id
                to_nick_name = this.videoList[index].detail.user_info.nick_name
                target_id = this.videoList[index].id
                /*let to_nick_nameStr = encodeURIComponent(to_nick_name)
                let contentStr = encodeURIComponent("太棒啦")*/
                const data = { "to_user_id": to_user_id, "parent_id": 0, "at_user_ids": "", "to_nick_name": to_nick_name, "target_id": target_id, "type": 1, "content": "太棒啦" }
                let newHeaders = this.getHeaders_ANDROID(data)
                newHeaders["Content-Type"] = "application/x-www-form-urlencoded"
                let options = {
                    url: `https://ysapi.elecfans.com/api/comment/add`,
                    headers: newHeaders,
                    body: `to_user_id=${to_user_id}&parent_id=0&at_user_ids=&to_nick_name=${to_nick_name}&target_id=${target_id}&type=1&content=太棒啦`
                },
                    result = await httpRequest(options);
                //console.log(options);
                //console.log(result);
                if (result.message == "success！") {
                    $.DoubleLog(`✅账号[${this.index}]  评论视频成功🎉`);

                } else {
                    $.DoubleLog(`❌账号[${this.index}]  评论视频失败`);
                    //console.log(result);
                }
            }

        } catch (e) {
            console.log(e);
        }
    }
    async receive_coin(id) {
        try {
            const data = { "type": id }
            let options = {
                url: `https://yingsheng.elecfans.com/ysapi/wapi/activity/task/receiveCoin`,
                headers: this.getHeaders_H5(data),
                body: JSON.stringify(data)
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.message == "success！") {
                $.DoubleLog(`✅账号[${this.index}]  领取任务奖励成功🎉`);

            } else {
                $.DoubleLog(`❌账号[${this.index}]  领取任务奖励失败`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
}

!(async () => {
    if (!(await checkEnv())) return;
    if ($.userList.length > 0) {
        await start();
    } await $.SendMsg($.message);
})().catch((e) => console.log(e)).finally(() => $.done());

//********************************************************
/**
 * 变量检查与处理
 * @returns
 */
async function checkEnv() {
    let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || "";
    //let userCount = 0;
    if (userCookie) {
        // console.log(userCookie);
        let e = envSplitor[0];
        for (let o of envSplitor)
            if (userCookie.indexOf(o) > -1) {
                e = o;
                break;
            }
        for (let n of userCookie.split(e)) n && $.userList.push(new UserInfo(n));
        //userCount = $.userList.length;
    } else {
        console.log("未找到CK");
        return;
    }
    return console.log(`共找到${$.userList.length}个账号`), true; //true == !0
}

/////////////////////////////////////////////////////////////////////////////////////
function httpRequest(options, method = null) {
    method = options.method ? options.method.toLowerCase() : options.body ? "post" : "get";
    return new Promise((resolve) => {
        $[method](options, (err, resp, data) => {
            if (err) {
                console.log(resp)
                console.log(`${method}请求失败`);
                $.logErr(err);
            } else {
                if (data) {
                    try { data = JSON.parse(data); } catch (error) { }
                    resolve(data);
                } else {
                    console.log(`请求api返回数据为空，请检查自身原因`);
                }
            }
            resolve();
        });
    });
}
/**
 * 获取远程版本
 */
function getVersion(scriptUrl, timeout = 3 * 1000) {
    return new Promise((resolve) => {
        const options = { url: `https://originfastly.jsdelivr.net/gh/${scriptUrl}` };
        $.get(options, (err, resp, data) => {
            try {
                const regex = /scriptVersionNow\s*=\s*(["'`])([\d.]+)\1/;
                const match = data.match(regex);
                const scriptVersionLatest = match ? match[2] : "";
                $.DoubleLog(`\n====== 当前版本：${scriptVersionNow} 📌 最新版本：${scriptVersionLatest} ======`);
            } catch (e) {
                $.logErr(e, resp);
            }
            resolve();
        }, timeout);
    });
}
/**
 * 获取远程通知
 */
function getNotice(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        const options = { url: `https://originfastly.jsdelivr.net/gh/smallfawn/Note@main/Notice.json` };
        $.get(options, (err, resp, data) => {
            try {
                try {
                    data = JSON.parse(data);
                } catch (error) { }
                const notice = data.notice.replace(/\\n/g, "\n");
                $.DoubleLog(notice);
            } catch (e) {
                $.logErr(e, resp);
            }
            resolve();
        }, timeout);
    });
}
// ==================== API ==================== //
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, a) => { s.call(this, t, (t, s, r) => { t ? a(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.userList = []; this.userIdx = 0; this.message = ""; this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name},开始!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const a = this.getdata(t); if (a) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, a) => e(a)) }) } runScript(t, e) { return new Promise(s => { let a = this.getdata("@chavy_boxjs_userCfgs.httpapi"); a = a ? a.replace(/\n/g, "").trim() : a; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [i, o] = a.split("@"), n = { url: `http://${o}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": i, Accept: "*/*" }, timeout: r }; this.post(n, (t, e, a) => s(a)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e); if (!s && !a) return {}; { const a = s ? t : e; try { return JSON.parse(this.fs.readFileSync(a)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : a ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const a = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of a) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, a) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[a + 1]) >> 0 == +e[a + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, a] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, a, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, a, r] = /^@(.*?)\.(.*?)$/.exec(e), i = this.getval(a), o = a ? "null" === i ? null : i || "{}" : "{}"; try { const e = JSON.parse(o); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), a) } catch (e) { const i = {}; this.lodash_set(i, r, t), s = this.setval(JSON.stringify(i), a) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return this.data = this.loaddata(), this.data[t]; default: return this.data && this.data[t] || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0; default: return this.data && this.data[e] || null } } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { switch (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), t.params && (t.url += "?" + this.queryStr(t.params)), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, a) => { !t && s && (s.body = a, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, a) }); break; case "Quantumult X": this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i, o) }, t => e(t && t.error || "UndefinedError")); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: a, statusCode: r, headers: i, rawBody: o } = t, n = s.decode(o, this.encoding); e(null, { status: a, statusCode: r, headers: i, rawBody: o, body: n }, n) }, t => { const { message: a, response: r } = t; e(a, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch (t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, a) => { !t && s && (s.body = a, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, a) }); break; case "Quantumult X": t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i, o) }, t => e(t && t.error || "UndefinedError")); break; case "Node.js": let a = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...i } = t; this.got[s](r, i).then(t => { const { statusCode: s, statusCode: r, headers: i, rawBody: o } = t, n = a.decode(o, this.encoding); e(null, { status: s, statusCode: r, headers: i, rawBody: o, body: n }, n) }, t => { const { message: s, response: r } = t; e(s, r, r && a.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let a = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in a) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? a[e] : ("00" + a[e]).substr(("" + a[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let a = t[s]; null != a && "" !== a && ("object" == typeof a && (a = JSON.stringify(a)), e += `${s}=${a}&`) } return e = e.substring(0, e.length - 1), e } msg(e = t, s = "", a = "", r) { const i = t => { switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } case "Loon": { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } case "Quantumult X": { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, a = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": a } } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, a, i(r)); break; case "Quantumult X": $notify(e, s, a, i(r)); break; case "Node.js": }if (!this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), a && t.push(a), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `❗️${this.name},错误!`, t); break; case "Node.js": this.log("", `❗️${this.name},错误!`, t.stack) } } wait(t) { return new Promise(e => setTimeout(e, t)) } DoubleLog(d) { if (this.isNode()) { if (d) { console.log(`${d}`); this.message += `\n ${d}` } } else { console.log(`${d}`); this.message += `\n ${d}` } } async SendMsg(m) { if (!m) return; if (Notify > 0) { if (this.isNode()) { var notify = require("./sendNotify"); await notify.sendNotify(this.name, m) } else { this.msg(this.name, "", m) } } else { console.log(m) } } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; switch (this.log("", `🔔${this.name},结束!🕛${s}秒`), this.log(), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } }(t, e) }
//Env rewrite:smallfawn Update-time:23-07-26 newAdd:DoubleLog & SendMsg & ChangeMessage
