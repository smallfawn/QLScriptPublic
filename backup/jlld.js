/**
 * cron 27 17 * * *  leidacar.js
 * 雷达汽车APP 每日获取积分
 * 变量名:leidaCarCookie
 * 变量值:https://app-api.radar-ev.com Headers中rid和aid和userId 以#分开 多账户请新建同变量名账号(类似京东)
 * scriptVersionNow = "0.0.1";
 */
//Quantumult X 用户可以把变量写这里(第一次写脚本 可能在圈X有BUG)
const cookies = [
    
]
const $ = new Env("雷达汽车");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "leidaCarCookie";
let envSplitor = ["&"]; //多账号分隔符
let strSplitor = "#"; //多变量分隔符
let userIdx = 0;
let userList = [];
let msg = ""
class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck1 = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ck2 = str.split(strSplitor)[1]; //单账号多变量分隔符
        this.ck3 = str.split(strSplitor)[2]; //单账号多变量分隔符
        this.ckStatus = true;
        this.taskList = []
        this.taskNum_like = 0
        this.taskNum_share = 0
        this.artList = []
        this.headers =
        {
            "user-agent": "Dart/2.19 (dart:io)",
            "system": "iOS",
            "version": "54",
            "userid": this.ck3,
            "accept-encoding": "gzip",
            //"content-length": "31",
            "rid": this.ck1,
            "host": "app-api.radar-ev.com",
            "login-system": "iPhone10,1|iOS 14.6|true|Darwin Kernel Version 20.5.0: Sat May  8 02:21:43 PDT 2021; root:xnu-7195.122.1~4/RELEASE_ARM64_T8015|",
            "aid": this.ck2,
            "content-type": "application/json; charset=utf-8"

        }
    }
    async main() {
        $.log(`------ 第[${this.index}]个号 ------`)
        await this.task_list();
        for (let task of this.taskList) {
            await this.art_list()

            if (task.taskName == "点赞") {
                //需要点赞的数量
                $.log(`[${task.taskName}] ${task.maxNum} / ${task.finishNum}`)
                this.taskNum_like = task.maxNum - task.finishNum
                for (let i in this.artList) {
                    if (this.artList[i].thumb == false) {
                        await this.task_like(this.artList[i].essayId)


                    }
                }

            } else if (task.taskName == "分享") {
                $.log(`[${task.taskName}] ${task.maxNum} / ${task.finishNum}`)
                //需要分享的数量
                this.taskNum_share = task.maxNum - task.finishNum
                for (let i = 0; i < this.taskNum_share; i++) {
                    await this.task_share(this.artList[i].essayId)

                }
            }

        }


    }


    async task_list() {
        try {
            let options = {
                fn: "任务列表",
                method: "post",
                url: `https://app-api.radar-ev.com/appapi/radarpoints/api/task/manage/list`,
                headers: this.headers,
                body: JSON.stringify({ "taskType": "20", "version": 261 })
            }
            let { body: result } = await $.httpRequest(options);
            //console.log(options);
            //console.log(JSON.stringify(result));
            if (result.code == 200) {
                $.log(`当前积分[${result.data.points}]`)
                this.taskList = result.data.taskItems

            } else {
                console.log(`❌账号[${this.index}]  用户查询: 失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_like(essayId) {
        try {
            let options = {
                fn: "点赞文章",
                method: "post",
                url: `https://app-api.radar-ev.com/appapi/content/activitythumb/thumbs`,
                headers: this.headers,
                body: JSON.stringify({ "essayId": essayId, "status": 1, "currentThumb": 192 })
            }
            let { body: result } = await $.httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.log(`点赞成功`)
            } else {
                console.log(`❌账号[${this.index}]  点赞文章失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_share(businessCode) {
        try {
            let options = {
                fn: "分享文章",
                method: "post",
                url: `https://app-api.radar-ev.com/appapi/radarpoints/api/task/manage/action/submit`,
                headers: this.headers,
                body: JSON.stringify({ "businessCode": businessCode, "actionType": 1, "userId": this.ck3})
            }
            //console.log(options);

            let { body: result } = await $.httpRequest(options);
            console.log(result);
            if (result.code == 200) {
                $.log(`分享成功`)
            } else {
                console.log(`❌账号[${this.index}]  分享文章失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async art_list() {
        try {
            let options = {
                fn: "文章列表",
                method: "get",
                url: `https://app-api.radar-ev.com/appapi/content/essay/pageCommunity?current=1&size=20&channelId=PD3455168030976339970`,
                headers: this.headers,
            }
            let { body: result } = await $.httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                this.artList = result.data.records
            } else {
                console.log(`❌账号[${this.index}] 获取文章失败`);
                console.log(result);
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
    let qxCookies = cookies.join("")
    let userCookie = ($.isNode() ? process.env[ckName] : qxCookies) || "";
    if (userCookie) {
        let e = envSplitor[0];
        for (let o of envSplitor)
            if (userCookie.indexOf(o) > -1) {
                e = o;
                break;
            }
        for (let n of userCookie.split(e)) n && userList.push(new UserInfo(n));
    } else {
        console.log(`未找到变量[${ckName}]`);
        return;
    }
    return console.log(`共找到${userList.length}个账号`), true; //true == !0
}

/////////////////////////////////////////////////////////////////////////////////////
// prettier-ignore
function Env(t, s) {
    return new (class {
        constructor(t, s) {
            this.name = t;
            this.data = null;
            this.dataFile = "box.dat";
            this.logs = [];
            this.logSeparator = "\n";
            this.startTime = new Date().getTime();
            Object.assign(this, s);
            this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`);
        }
        isNode() {
            return "undefined" != typeof module && !!module.exports;
        }
        isQuanX() {
            return "undefined" != typeof $task;
        }
        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon;
        }
        isLoon() {
            return "undefined" != typeof $loon;
        }
        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs");
                this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    s = this.path.resolve(process.cwd(), this.dataFile),
                    e = this.fs.existsSync(t),
                    i = !e && this.fs.existsSync(s);
                if (!e && !i) return {};
                {
                    const i = e ? t : s;
                    try {
                        return JSON.parse(this.fs.readFileSync(i));
                    } catch (t) {
                        return {};
                    }
                }
            }
        }
        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs");
                this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    s = this.path.resolve(process.cwd(), this.dataFile),
                    e = this.fs.existsSync(t),
                    i = !e && this.fs.existsSync(s),
                    o = JSON.stringify(this.data);
                e ? this.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o);
            }
        }
        lodash_get(t, s, e) {
            const i = s.replace(/\[(\d+)\]/g, ".$1").split(".");
            let o = t;
            for (const t of i) if (((o = Object(o)[t]), void 0 === o)) return e;
            return o;
        }
        lodash_set(t, s, e) {
            return Object(t) !== t
                ? t
                : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []),
                    (s
                        .slice(0, -1)
                        .reduce(
                            (t, e, i) =>
                                Object(t[e]) === t[e]
                                    ? t[e]
                                    : (t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}),
                            t
                        )[s[s.length - 1]] = e),
                    t);
        }
        getdata(t) {
            let s = this.getval(t);
            if (/^@/.test(t)) {
                const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t),
                    o = e ? this.getval(e) : "";
                if (o)
                    try {
                        const t = JSON.parse(o);
                        s = t ? this.lodash_get(t, i, "") : s;
                    } catch (t) {
                        s = "";
                    }
            }
            return s;
        }
        setdata(t, s) {
            let e = !1;
            if (/^@/.test(s)) {
                const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s),
                    h = this.getval(i),
                    a = i ? ("null" === h ? null : h || "{}") : "{}";
                try {
                    const s = JSON.parse(a);
                    this.lodash_set(s, o, t), (e = this.setval(JSON.stringify(s), i));
                } catch (s) {
                    const h = {};
                    this.lodash_set(h, o, t), (e = this.setval(JSON.stringify(h), i));
                }
            } else e = this.setval(t, s);
            return e;
        }
        getval(t) {
            if (this.isSurge() || this.isLoon()) {
                return $persistentStore.read(t);
            } else if (this.isQuanX()) {
                return $prefs.valueForKey(t);
            } else if (this.isNode()) {
                this.data = this.loaddata();
                return this.data[t];
            } else {
                return this.data && this.data[t] || null;
            }
        }
        setval(t, s) {
            if (this.isSurge() || this.isLoon()) {
                return $persistentStore.write(t, s);
            } else if (this.isQuanX()) {
                return $prefs.setValueForKey(t, s);
            } else if (this.isNode()) {
                this.data = this.loaddata();
                this.data[s] = t;
                this.writedata();
                return true;
            } else {
                return this.data && this.data[s] || null;
            }
        }
        initGotEnv(t) {
            this.got = this.got ? this.got : require("got");
            this.cktough = this.cktough ? this.cktough : require("tough-cookie");
            this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar();
            if (t) {
                t.headers = t.headers ? t.headers : {};
                if (typeof t.headers.Cookie === "undefined" && typeof t.cookieJar === "undefined") {
                    t.cookieJar = this.ckjar;
                }
            }
        }
        /**
        * @param {Object} options
        * @returns {String} 将 Object 对象 转换成 queryStr: key=val&name=senku
        */
        queryStr(options) {
            return Object.entries(options)
                .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
                .join('&');
        }
        isJSONString(str) {
            try {
                var obj = JSON.parse(str);
                if (typeof obj == 'object' && obj) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return false;
            }
        }
        isJson(obj) {
            var isjson = typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
            return isjson;
        }
        async sendMsg(message) {
            if (!message) return;
            if ($.isNode()) {
                await notify.sendNotify($.name, message)
            } else {
                $.msg($.name, '', message)
            }
        }
        async httpRequest(options) {
            let t = {
                ...options
            };
            if (!t.headers) {
                t.headers = {}
            }
            if (t.params) {
                t.url += '?' + this.queryStr(t.params);
            }
            t.method = t.method.toLowerCase();
            if (t.method === 'get') {
                delete t.headers['Content-Type'];
                delete t.headers['Content-Length'];
                delete t["body"]
            }
            if (t.method === 'post') {
                let contentType;

                if (!t.body) {
                    t.body = ""
                } else {
                    if (typeof t.body == "string") {
                        if (this.isJSONString(t.body)) {
                            contentType = 'application/json'
                        } else {
                            contentType = 'application/x-www-form-urlencoded'
                        }
                    } else if (this.isJson(t.body)) {
                        t.body = JSON.stringify(t.body);
                        contentType = 'application/json';
                    }
                }
                if (!t.headers['Content-Type']) {
                    t.headers['Content-Type'] = contentType;
                }
                delete t.headers['Content-Length'];
            }
            if (this.isNode()) {
                this.initGotEnv(t);
                let httpResult = await this.got(t);
                if (this.isJSONString(httpResult.body)) {
                    httpResult.body = JSON.parse(httpResult.body)
                }
                return httpResult;
            }
            if (this.isQuanX()) {
                t.method = t.method.toUpperCase()
                return new Promise((resolve, reject) => {
                    $task.fetch(t).then(response => {
                        if (this.isJSONString(response.body)) {
                            response.body = JSON.parse(response.body)
                        }
                        resolve(response)
                    }, reason => {
                        reject(reason.err)
                    })
                })
            }
        }
        randomNumber(length) {
            const characters = '0123456789';
            return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
        }
        randomString(length) {
            const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
        }
        timeStamp() {
            return new Date().getTime()
        }
        uuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        time(t) {
            let s = {
                "M+": new Date().getMonth() + 1,
                "d+": new Date().getDate(),
                "H+": new Date().getHours(),
                "m+": new Date().getMinutes(),
                "s+": new Date().getSeconds(),
                "q+": Math.floor((new Date().getMonth() + 3) / 3),
                S: new Date().getMilliseconds(),
            };
            /(y+)/.test(t) &&
                (t = t.replace(
                    RegExp.$1,
                    (new Date().getFullYear() + "").substr(4 - RegExp.$1.length)
                ));
            for (let e in s)
                new RegExp("(" + e + ")").test(t) &&
                    (t = t.replace(
                        RegExp.$1,
                        1 == RegExp.$1.length
                            ? s[e]
                            : ("00" + s[e]).substr(("" + s[e]).length)
                    ));
            return t;
        }
        msg(s = t, e = "", i = "", o) {
            const h = (t) =>
                !t || (!this.isLoon() && this.isSurge())
                    ? t
                    : "string" == typeof t
                        ? this.isLoon()
                            ? t
                            : this.isQuanX()
                                ? { "open-url": t }
                                : void 0
                        : "object" == typeof t && (t["open-url"] || t["media-url"])
                            ? this.isLoon()
                                ? t["open-url"]
                                : this.isQuanX()
                                    ? t
                                    : void 0
                            : void 0;
            this.isMute ||
                (this.isSurge() || this.isLoon()
                    ? $notification.post(s, e, i, h(o))
                    : this.isQuanX() && $notify(s, e, i, h(o)));
            let logs = ['', '==============📣系统通知📣=============='];
            logs.push(t);
            e ? logs.push(e) : '';
            i ? logs.push(i) : '';
            console.log(logs.join('\n'));
            this.logs = this.logs.concat(logs);
        }
        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]),
                console.log(t.join(this.logSeparator));
        }
        logErr(t, s) {
            const e = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            e
                ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack)
                : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t);
        }
        wait(t) {
            return new Promise((s) => setTimeout(s, t));
        }
        done(t = {}) {
            const s = new Date().getTime(),
                e = (s - this.startTime) / 1e3;
            this.log(
                "",
                `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`
            )
            this.log()
            if (this.isNode()) {
                process.exit(1)
            }
            if (this.isQuanX()) {
                $done(t)
            }
        }
    })(t, s);
}
