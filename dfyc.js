/**
 * cron 5 15 * * *
 * Show:东方烟草报App 积分换实物
 * 变量名:dfycToken
 * 变量值:POST请求任意链接包含https://eapp.eastobacco.com/index.php body中的token  多账号&分割 不是@ 和换行
 * scriptVersionNow = "0.0.1";
 */

//Quantumult X 可以在cookies里面写变量
const cookies = []


const $ = new Env("东方烟草报");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "dfycToken";
let envSplitor = ["&"]; //多账号分隔符
let strSplitor = "#"; //多变量分隔符
let userIdx = 0;
let userList = [];
let msg = ""
class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.artList = []
    }
    async main() {
        await this.user_info();
        if (this.ckStatus) {
            await this.task_daka()
            await this.art_list()
            if (this.artList.length !== 0) {
                for (let i = 0; i < 3; i++) {
                    await this.task_read(this.artList[i].id, this.artList[i].catid)
                    await this.task_share(this.artList[i].id, this.artList[i].catid)
                    await this.task_like(this.artList[i].id, this.artList[i].catid)
                }
            }
        }
    }
    async user_info() {
        try {
            let options = {
                fn: "信息",
                method: "post",
                url: `https://eapp.eastobacco.com/index.php?m=api&c=user&a=userinfo`,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `platform=android&token=${this.ck}&timestamp=${Date.now()}&api_version=4`
            }
            let { body: result } = await $.httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 200) {
                $.log(`✅账号[${this.index}]  积分[${result.data.point}]🎉`)
                this.ckStatus = true;
            } else {
                console.log(`❌账号[${this.index}]  用户查询: 失败`);
                this.ckStatus = false;
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_daka() {
        try {
            let options = {
                fn: "打卡",
                method: "post",
                url: `https://eapp.eastobacco.com/index.php?m=api&c=user&a=daka`,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `platform=android&token=${this.ck}&timestamp=${Date.now()}&api_version=4`
            }
            let { body: result } = await $.httpRequest(options);
            //console.log(options);
            //console.log(result);
            $.log(`✅账号[${this.index}]  打卡[${result.message}]🎉`)
        } catch (e) {
            console.log(e);
        }
    }

    async art_list() {
        try {
            let options = {
                fn: "文章列表",
                method: "post",
                url: `https://eapp.eastobacco.com/index.php?m=api&c=content&a=newsList_pub`,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `catid=1&num=20&page=1&api_version=4&platform=android&token=${this.ck}&timestamp=${Date.now()}`
            }
            let { body: result } = await $.httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.data.news) {
                for (let news of result.data.news) {
                    this.artList.push(
                        {
                            id: news.id,
                            catid: news.catid,
                            title: news.title
                        }
                    )
                }
                console.log(`获取文章成功`);
            } else {
                console.log(`获取文章失败`);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_read(id, catid) {
        try {
            let options = {
                fn: "阅读",
                method: "post",
                url: `https://eapp.eastobacco.com/index.php?m=api&c=content&a=addvisite`,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `platform=android&token=${this.ck}&timestamp=${Date.now()}&api_version=4&newsid=${id}&catid=${catid}`
            }
            let { body: result } = await $.httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 200) {
                $.log(`✅账号[${this.index}]  阅读[${id}]成功🎉`)

            } else {
                $.log(`❌账号[${this.index}]  阅读[${id}]失败`)
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_share(id, catid) {
        try {
            let options = {
                fn: "分享",
                method: "post",
                url: `https://eapp.eastobacco.com/index.php?m=api&c=user&a=addScoreZf`,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `platform=android&token=${this.ck}&timestamp=${Date.now()}&api_version=4&id=${id}&catid=${catid}`
            }
            let { body: result } = await $.httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 200) {
                $.log(`✅账号[${this.index}]  分享[${id}]成功🎉`)

            } else {
                $.log(`❌账号[${this.index}]  分享[${id}]失败`)
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_like(id, catid) {
        try {
            let options = {
                fn: "点赞",
                method: "post",
                url: `https://eapp.eastobacco.com/index.php?m=api&c=content&a=dingcai`,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `platform=android&token=${this.ck}&timestamp=${Date.now()}&api_version=4&newsid=${id}&catid=${catid}`
            }
            let { body: result } = await $.httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 200) {
                $.log(`✅账号[${this.index}]  点赞[${id}]成功🎉`)

            } else {
                $.log(`❌账号[${this.index}]  点赞[${id}]失败`)
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
    let userCookie = ($.isNode() ? process.env[ckName] : cookies) || "";
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
