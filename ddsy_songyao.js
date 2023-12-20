/**
 * cron 27 19 * * *  ddsy_songyao.js
 * Show:叮当快药APP  积分抵钱  我的=>签到有礼
 * 变量名:ddsy_songyao
 * 变量值:https://hapi.ddky.com/mcp/weixin/rest.htm?后面的loginToken&userId&uDate  多账户@
 * scriptVersionNow = "0.0.1";
 * /
 */

const $ = new Env("叮当快药APP");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "ddsy_songyao";
let envSplitor = ["@", "\n"]; //多账号分隔符
let strSplitor = "&"; //多变量分隔符
let userIdx = 0;
let userList = [];
class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.token = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.userId = str.split(strSplitor)[1];
        this.uDate = str.split(strSplitor)[2];
    }
    async main() {
        await this.getSignInId()
    }
    getSign(s) {
        const crypto = require("crypto");//SIGN TYPE 1是签到 2是补签
        return crypto.createHash('md5').update(s).digest('hex');
    }
    getTime() {
        var now = new Date();
        var year = now.getFullYear()
            , month = now.getMonth() + 1
            , day = now.getDate()
            , hours = now.getHours()
            , minutes = now.getMinutes()
            , seconds = now.getSeconds();
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    }
    getSignDay() {
        var now = new Date();
        var year = now.getFullYear()
            , month = now.getMonth() + 1
            , day = now.getDate()
        return year + '-' + month + '-' + day
    }
    async getSignInId() {
        const time = this.getTime()
        const method = `ddky.promotion.signin.pageinfo`
        const signDay = this.getSignDay()
        const str = method +
            `loginToken${this.token}` +
            `method${method}` +
            `platH5` +
            `platformH5` +
            `signDay${signDay}` +
            `t${time}` +
            `uDate${this.uDate}` +
            `userId${this.userId}` +
            `v1.0` +
            `versionName4.9.0` +
            `6C57AB91A1308E26B797F4CD382AC79D`
        let sign = (this.getSign(str)).toUpperCase();
        let callbackStr = new Date().getTime()
        try {
            let options = {
                url: `https://hapi.ddky.com/mcp/weixin/rest.htm?sign=${sign}&loginToken=${this.token}&method=${method}&plat=H5&platform=H5&signDay=${signDay}&t=${time}&uDate=${this.uDate}&userId=${this.userId}&v=1.0&versionName=4.9.0&callback=Zepto${callbackStr}`,
                headers: {},
            },
                result = await httpRequest(options);
            //console.log(options);
            result = result.replace(`Zepto${callbackStr}`, "")
            result = result.replaceAll("(", "")
            result = result.replaceAll(")", "")
            result = JSON.parse(result)
            if(result.code = "0"){
                console.log(result.result.signDayVo.signinId);
                await this.user_info(result.result.signDayVo.signinId)
            }

        } catch (e) {
            console.log(e);
        }
    }
    async user_info(signInId) {
        let callbackStr = new Date().getTime()

        const time = this.getTime()
        const str = `ddky.promotion.signin.sign` + `channelH5` + `laterSignType1` + `loginToken${this.token}` + `methodddky.promotion.signin.sign` +
            `platH5` + `platformH5` + `signinId${signInId}` + `t${time}` + `uDate${this.uDate}` + `userId${this.userId}` + `v1.0` + `versionName4.9.0` +
            `6C57AB91A1308E26B797F4CD382AC79D`
        let sign = (this.getSign(str)).toUpperCase();
        try {
            let options = {
                url: `https://hapi.ddky.com/mcp/weixin/rest.htm?sign=${sign}&channel=H5&laterSignType=1&loginToken=${this.token}&method=ddky.promotion.signin.sign&plat=H5&platform=H5&signinId=${signInId}&t=${time}&uDate=${this.uDate}&userId=${this.userId}&v=1.0&versionName=4.9.0&callback=Zepto${callbackStr}`,
                headers: {},
            },
                result = await httpRequest(options);
            //console.log(options);
            console.log(result);
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
function httpRequest(options, timeout = 5 * 1000) {
    method = options.method
        ? options.method.toLowerCase()
        : options.body
            ? "post"
            : "get";
    return new Promise((resolve) => {
        setTimeout(() => {
            $[method](options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log(JSON.stringify(err));
                        $.logErr(err);
                    } else {
                        try {
                            data = JSON.parse(data);
                        } catch (error) { }
                    }
                } catch (e) {
                    console.log(e);
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        }, timeout);
    });
}
// prettier-ignore
function Env(t, s) { return new (class { constructor(t, s) { (this.name = t), (this.data = null), (this.dataFile = "box.dat"), (this.logs = []), (this.logSeparator = "\n"), (this.startTime = new Date().getTime()), Object.assign(this, s), this.log("", `\ud83d\udd14${this.name},\u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } getScript(t) { return new Promise((s) => { this.get({ url: t }, (t, e, i) => s(i)) }) } runScript(t, s) { return new Promise((e) => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); (o = o ? 1 * o : 20), (o = s && s.timeout ? s.timeout : o); const [h, a] = i.split("@"), r = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": h, Accept: "*/*" }, }; this.post(r, (t, s, i) => e(i)) }).catch((t) => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (((o = Object(o)[t]), void 0 === o)) return e; return o } lodash_set(t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), (s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : (t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}), t)[s[s.length - 1]] = e), t) } getdata(t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata(t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? ("null" === h ? null : h || "{}") : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), (e = this.setval(JSON.stringify(s), i)) } catch (s) { const h = {}; this.lodash_set(h, o, t), (e = this.setval(JSON.stringify(h), i)) } } else e = this.setval(t, s); return e } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? ((this.data = this.loaddata()), this.data[t]) : (this.data && this.data[t]) || null } setval(t, s) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, s) : this.isQuanX() ? $prefs.setValueForKey(t, s) : this.isNode() ? ((this.data = this.loaddata()), (this.data[s] = t), this.writedata(), !0) : (this.data && this.data[s]) || null } initGotEnv(t) { (this.got = this.got ? this.got : require("got")), (this.cktough = this.cktough ? this.cktough : require("tough-cookie")), (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()), t && ((t.headers = t.headers ? t.headers : {}), void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, s = () => { }) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? $httpClient.get(t, (t, e, i) => { !t && e && ((e.body = i), (e.statusCode = e.status)), s(t, e, i) }) : this.isQuanX() ? $task.fetch(t).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, s) => { try { const e = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(e, null), (s.cookieJar = this.ckjar) } catch (t) { this.logErr(t) } }).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h, } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t))) } post(t, s = () => { }) { if ((t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), delete t.headers["Content-Length"], this.isSurge() || this.isLoon())) $httpClient.post(t, (t, e, i) => { !t && e && ((e.body = i), (e.statusCode = e.status)), s(t, e, i) }); else if (this.isQuanX()) (t.method = "POST"), $task.fetch(t).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: e, ...i } = t; this.got.post(e, i).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)) } } time(t) { let s = { "M+": new Date().getMonth() + 1, "d+": new Date().getDate(), "H+": new Date().getHours(), "m+": new Date().getMinutes(), "s+": new Date().getSeconds(), "q+": Math.floor((new Date().getMonth() + 3) / 3), S: new Date().getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = (t) => !t || (!this.isLoon() && this.isSurge()) ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o))), this.logs.push("", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="), this.logs.push(s), e && this.logs.push(e), i && this.logs.push(i) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t) } wait(t) { return new Promise((s) => setTimeout(s, t)) } done(t = {}) { const s = new Date().getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } })(t, s) }
