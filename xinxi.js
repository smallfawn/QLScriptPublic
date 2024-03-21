/**
 * cron 9 9 * * *  xx.js
 * 变量名: xinxi
 * 每天运行一次就行 运行多次任务也不会多做
 * 报错是正常情况
 * 变量值:api.xinc818.com 请求头中sso的值 多账户&或者换行
 * scriptVersionNow = "0.0.1";
 */

const $ = new Env("心喜-微信小程序");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "xinxi";
let envSplitor = ["&", "\n"]; //多账号分隔符
let strSplitor = "#"; //多变量分隔符
let userIdx = 0;
let userList = [];
class Task {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.userId = null
        this.artList = []
        this.goodsList = []
    }
    async main() {

        await this.user_info();
        if (this.ckStatus == true) {
            await this.task_signin();
            await this.task_lottery()
            await this.task_share()
            await this.task_goods()
            /*await this.art_list()
            if (this.artList.length > 0) {
                await this.task_follow(this.artList[0])
            }*/
            await this.goods_list()
            if (this.goodsList.length > 0) {
                await this.task_like(this.goodsList[0])
            }

        }

    }

    async task_signin() {
        try {
            let result = await this.taskRequest("get", `https://api.xinc818.com/mini/sign/in?dailyTaskId=`)
            //console.log(result);
            if (result.code == 0) {
                $.log(`✅账号[${this.index}]  签到状态【${result.data.flag}】获得积分【${result.data.integral}】🎉`)
            } else {
                console.log(`❌账号[${this.index}]  签到状态【false】`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async user_info() {
        try {
            let result = await this.taskRequest("get", `https://api.xinc818.com/mini/user`)
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.log(`✅账号[${this.index}]  【${result.data.nickname}】积分【${result.data.integral}】🎉`)
                this.userId = result.data.id
            } else {
                console.log(`❌账号[${this.index}]  用户查询【false】`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    //浏览30sAPI
    async task_goods() {
        try {
            let result = await this.taskRequest("get", `https://api.xinc818.com/mini/dailyTask/browseGoods/22`)
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                if (result.data !== null) {
                    $.log(`✅账号[${this.index}]  完成浏览30s成功 获得【${result.data.singleReward}】`)

                } else {
                    console.log(`❌账号[${this.index}]  完成浏览30s任务失败`);
                }

            } else {
                console.log(`❌账号[${this.index}]  完成浏览30s任务失败`);

                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    //想要任务API
    async task_like(id) {
        //console.log(`https://api.xinc818.com/mini/integralGoods/${id}?type=`)
        try {
            let goodsResult = await this.taskRequest("get", `https://api.xinc818.com/mini/integralGoods/${id}?type=`)
            if (goodsResult.data) {
                let likeResult = await this.taskRequest("post", `https://api.xinc818.com/mini/live/likeLiveItem`, { "isLike": true, "dailyTaskId": 20, "productId": Number(goodsResult.data.outerId) })
                //console.log(options);
                //console.log(likeResult);
                if (likeResult.code == 0) {
                    if (likeResult.data !== null) {
                        $.log(`✅账号[${this.index}]  完成点击想要任务成功 获得【${likeResult.data.singleReward}】`)

                    } else {
                        console.log(`❌账号[${this.index}]  完成点击想要任务失败`);
                    }
                } else {
                    console.log(`❌账号[${this.index}]  完成点击想要任务失败`);
                    console.log(likeResult);
                }
            }


        } catch (e) {
            console.log(e);
        }
    }

    //关注用户API
    async task_follow(pusherId) {
        console.log(pusherId)
        try {
            let result = await this.taskRequest("post", `https://api.xinc818.com/mini/user/follow`, { "decision": true, "followUserId": pusherId })
            //console.log(options);
            console.log(result);
            if (result.code == 0) {
                if (result.data !== null) {
                    $.log(`✅账号[${this.index}]  完成关注用户任务成功 获得【${result.data.singleReward}】`)
                } else {
                    console.log(`❌账号[${this.index}]  完成关注用户任务失败`);
                }
            } else {
                console.log(`❌账号[${this.index}]  完成关注用户任务失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    //抽奖API
    async task_lottery() {
        try {
            let result = await this.taskRequest("post", `https://api.xinc818.com/mini/lottery/draw`, { "activity": 63, "batch": false, "isIntegral": false, "userId": Number(this.userId), "dailyTaskId": 9 })
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                if (result.data !== null) {
                    $.log(`✅账号[${this.index}]  完成抽奖成功 获得【${result.data.taskResult.singleReward}】积分 奖品【${result.data.lotteryResult.integral}】`)

                } else {
                    console.log(`❌账号[${this.index}]  完成抽奖失败`);
                }
            } else {
                console.log(`❌账号[${this.index}]  完成抽奖失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    //分享API
    async task_share() {
        try {
            let result = await this.taskRequest("get", `https://api.xinc818.com/mini/dailyTask/share`)
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                if (result.data !== null) {
                    $.log(`✅账号[${this.index}]  完成分享成功 获得【${result.data.singleReward}】`)

                } else {
                    console.log(`❌账号[${this.index}]  完成分享失败`);
                }
            } else {
                console.log(`❌账号[${this.index}]  完成分享失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    //获取帖子列表API(包含用户和帖子)
    async art_list() {
        try {
            let result = await this.taskRequest("get", `https://cdn-api.xinc818.com/mini/posts/sorts?sortType=COMMENT&pageNum=1&pageSize=10&groupClassId=0`)
            //console.log(options);
            console.log(result);
            if (result.code == 0) {
                if (result.data.list.length > 0) {
                    for (let i = 0; i < 2; i++)
                        this.artList.push(result.data.list[i].publisherId)
                }
            } else {

                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    //获取商品API
    async goods_list() {
        try {
            let result = await this.taskRequest("get", `https://cdn-api.xinc818.com/mini/integralGoods?orderField=sort&orderScheme=DESC&pageSize=10&pageNum=1`)
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                if (result.data.list.length > 0) {
                    for (let i = 0; i < 2; i++)
                        this.goodsList.push(result.data.list[i].id)
                }
            } else {

                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async taskRequest(method, url, body = "") {
        //
        let headers = {
            //"Host": "api.xinc818.com",
            "Connection": "keep-alive",
            "charset": "utf-8",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160027 MMWEBSDK/20231002 MMWEBID/2585 MicroMessenger/8.0.43.2480(0x28002B51) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
            "content-type": "application/json",
            "Accept-Encoding": "gzip,compress,br,deflate",
            "sso": this.ck,
            "Referer": "https://servicewechat.com/wx673f827a4c2c94fa/253/page-frame.html"
        }
        const reqeuestOptions = {
            url: url,
            method: method,
            headers: headers
        }
        if (method !== "get") {
            if (headers["Content-Type"] == "application/json") {
                reqeuestOptions["body"] = JSON.stringify(body);
            } else {
                reqeuestOptions["body"] = body
            }
        }
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
        //从url获取参数组成json
        getURLParams(url) {
            const params = {};
            const queryString = url.split('?')[1];
            if (queryString) {
                const paramPairs = queryString.split('&');
                paramPairs.forEach(pair => {
                    const [key, value] = pair.split('=');
                    params[key] = value;
                });
            }
            return params;
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
                delete t.headers['content-type'];
                delete t.headers['content-length'];
                delete t["body"]
            }
            if (t.method === 'post') {
                let ContentType;
                if (!t.body) {
                    t.body = ""
                } else {
                    if (typeof t.body == "string") {
                        if (this.isJSONString(t.body)) {
                            ContentType = 'application/json'
                        } else {
                            ContentType = 'application/x-www-form-urlencoded'
                        }
                    } else if (this.isJson(t.body)) {
                        t.body = JSON.stringify(t.body);
                        ContentType = 'application/json';
                    }
                }
                if (!t.headers['Content-Type'] || !t.headers['content-type']) {
                    t.headers['Content-Type'] = ContentType;
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
