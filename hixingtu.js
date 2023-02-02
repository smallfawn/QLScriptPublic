/**
 * Hi星途(APP)
 * cron 10 7 * * *  hixingtu.js
 * 
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export hixingtu_data='token @ token'
 * 
 * 多账号用 换行 或 @ 分割
 * 抓包 https://starway.exeedcars.com , 找到 Authorization 去掉Bearer
 * ====================================
 *   
 */



const $ = new Env("Hi星途");
const ckName = "hixingtu_data";
//-------------------- 一般不动变量区域 -------------------------------------
const Notify = 1;		 //0为关闭通知,1为打开通知,默认为1
let debug = 1;           //Debug调试   0关闭  1开启
let envSplitor = ["@", "\n"]; //多账号分隔符
let ck = msg = '';       //let ck,msg
let host, hostname;
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
//---------------------- 自定义变量区域 -----------------------------------
//---------------------------------------------------------

async function start() {

    await script_notice()
    DoubleLog(' Hi星途 ');
    DoubleLog('\n================== 用户信息 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.user_info());
        await $.wait(2000);
    }
    await Promise.all(taskall);
    DoubleLog('\n================== 执行评论 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_comment());
        await $.wait(5000);
    }
    await Promise.all(taskall);
    DoubleLog('\n================== 发布文章 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_art());
        await $.wait(10000);
    }
    await Promise.all(taskall);



}


class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split('&')[0]; //单账号多变量分隔符
        //let ck = str.split('&')
        //this.data1 = ck[0]

    }

    async user_info() {
        try {
            let options = {
                url: `https://starway.exeedcars.com/api-user/user/queryById`,
                headers: {
                    'Authorization': 'Bearer ' + this.ck,
                    'client_id': 'app',
                    'client_secret': 'app',
                    'Client-Agent': 'device:Xiaomi MI 8 Lite;os:Android 10;version:V1.0.47',
                    'Host': 'starway.exeedcars.com',
                    'Connection': 'Keep-Alive',
                    //'Accept-Encoding': 'gzip'
                    'User-Agent': 'okhttp/4.8.1'
                }
            }
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  欢迎用户: ${result.data.nickName}`);
            } else {
                DoubleLog(`账号[${this.index}]  用户查询:失败 ❌ 了呢,原因未知！`);
                DoubleLog(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_comment() { //评论
        try {
            let options = {
                url: `https://starway.exeedcars.com/api-social/ec/social/comment/submit`,
                headers: {
                    'Authorization': 'Bearer ' + this.ck,
                    'client_id': 'app',
                    'client_secret': 'app',
                    'Client-Agent': 'device:Xiaomi MI 8 Lite;os:Android 10;version:V1.0.47',
                    'Host': 'starway.exeedcars.com',
                    'Connection': 'Keep-Alive',
                    //'Accept-Encoding': 'gzip'
                    'User-Agent': 'okhttp/4.8.1',
                    'Content-Type': 'application/json; charset=utf-8',
                    //'Content-Length':700
                },
                body: {
                    "appId": "star",
                    "nonceStr": "e428fa67-6218-4ad9-a5c8-c8713a62a4d4",
                    "content": "h8v8WqsYnlRJv8TbLqRPjYVcpaAtddIDD/7Ex4debi36EzX4v5DCAQcJMEqOZmQrTE07s4RlAPecPPSuTVssDjMVNVXUU4DxHoU2nadxH+2O9nCBL1bcENId4yXENB+mvoS0JhlAZeoD7GFookJmy1/VuEL2cNEUxEda5QuIu8orYO/TKNTDwMjytPOffXhR61uVwKkExu20pNoThB9fPQS55K8a4e9laZ1bcB54FISW8rVKx5Py/cXgmTSXCAZwsLQMr1EzgPoQgaL9GBScBvcU9lHGyEzR7YjRVm11DzT3WZDWIqCo9D5kNMv+QqQp7ITwlRL6QtwyOoESZLQkA2PSy8hS6wr7grHJIwxAEB6NqQUoQWZ49VbIvg2qDfurjeboXuGtCz1Q2ifJ4RP5UCEBN7tQKJXal9qf5+dmliSrlujSQIQTObKaXoRfKDzgFXGIgLVHRWdQZjHRDY2bVORLvPKJNo9bSW5Eg4ityKIbOoxgr80KiNGYVmlEtVj4eOgN/O/HbgSGcXKz3gj9MmSrGXIlfZaMd7yKJeFvsplNIjB6w1k+Brs4RN8UlePy3vcUfR1rEJffRAio0et9mSipG2BHFmFDQDsXhmcDMpdewk7hlgJIr6fmucRgN4LTsD4vHwJscytef9LOVmpYwofTCHhNpNjNvKAQv5NKhRE=",
                    "timestamp": "1675323598092"
                }
            }
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  评论: ${result.ok}`);
            } else {
                DoubleLog(`账号[${this.index}]  评论:失败 ❌ 了呢,原因未知！`);
                DoubleLog(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_art() { //文章
        try {
            let options = {
                url: `https://starway.exeedcars.com/api-social/ec/social/dync/submit`,
                headers: {
                    'Authorization': 'Bearer ' + this.ck,
                    'client_id': 'app',
                    'client_secret': 'app',
                    'Client-Agent': 'device:Xiaomi MI 8 Lite;os:Android 10;version:V1.0.47',
                    'Host': 'starway.exeedcars.com',
                    'Connection': 'Keep-Alive',
                    //'Accept-Encoding': 'gzip'
                    'User-Agent': 'okhttp/4.8.1',
                    'Content-Type': 'application/json; charset=utf-8',
                    //'Content-Length':700
                },
                body: {
                    "appId": "star",
                    "nonceStr": "e7591a78-1280-471f-b72a-d1708bd7fb63",
                    "content": "bdRfIsZAg8JtzrGytJicrlGU2d8pV4QervOwSswh9CFgyDr68vJHXpWA5XGQigkJMg37qkoBzC9ZZVA56GmsnYYI2B2zhbMiuLojFuHKXvPcs/dGQ9tns4SDiaovFGuTjtrDgbA/cvGB+A4bD8VkS7DKSzjMaR/tbPK9Jx/wWx5pca+IUufeM49vf8M0s1njJ2Cg39tRbbZVwhY1FKou1zePPGqI4D0qRbmwOw1z1wODJhJUnRSYGn2at74Uip7jAPxV7vpkf0iU8/T9sfl1DwUFAzaN1OEgFf+ZtxhLhMx17yHTDCpT/7KYn7dlbIEeJHImv/G2Xc9njoqG/yF51S2OTL+UTESw8Q483/5FdRb0eqh41QFf3h7W+Rv0LkC1LQOmTHIctjuYXIN2PL3i2Hc+ZCNJRSQH9LO2ux4+7NOYL5eLre8ZQeP+1C9AF40HBtj2YKcppdJkoj3kT1xnvfGb7DoHU9QHXEjwDYDpzQ0C0k6r4hNNbUEee9uiJVQWJbGuKqnNA6R18t9CUcFoCdlmWAt1d1zfhBEdYuZ+hb4suHyOdofyoZeNgK+FAPSMHSamy42UGd4bb0zshqM+e+eieTgv+pmjjeqBJpuIyBgX/qUj3q+0ovBXbOyxEbWQoekMTExTCYRPLf5JZhfCMOcCPhRUfjIjA8ei2s5fabA=",
                    "timestamp": "1675328557316"
                }
            }
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  发布文章成功: ${result.ok}`);
            } else {
                DoubleLog(`账号[${this.index}]  发布:失败 ❌ 了呢,原因未知！`);
                DoubleLog(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

}

!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        await start();
    }
    await SendMsg(msg);
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());


//********************************************************
// 变量检查与处理
async function checkEnv() {
    if (userCookie) {
        // console.log(userCookie);
        let e = envSplitor[0];
        for (let o of envSplitor)
            if (userCookie.indexOf(o) > -1) {
                e = o;
                break;
            }
        for (let n of userCookie.split(e)) n && userList.push(new UserInfo(n));
        userCount = userList.length;
    } else {
        console.log("未找到CK");
        return;
    }
    return console.log(`共找到${userCount}个账号`), true;//true == !0
}
/////////////////////////////////////////////////////////////////////////////////////
async function script_notice() {
    try {
        let options = {
            url: `https://gitee.com/smallfawn/api/raw/master/notice.json`,
            //https://gh.api.99988866.xyz/https://raw.githubusercontent.com/smallfawn/api/main/notice.json
            //https://gitee.com/smallfawn/api/raw/master/notice.json
            //https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/api/main/notice.json
            headers: {
                'user-agent': ''
            }
        }
        options = changeCode(options) //把某软件生成的代码(request或axios或jquery)转换为got通用
        //console.log(options);
        let result = await httpRequest(options);
        //console.log(result);
        if (result) {
            DoubleLog(result.notice)
        } else {
            console.log(result)
        }
    } catch (e) {
        console.log(e);
    }
}
function changeCode(oldoptions) {
    let newoptions = new Object(),
        urlTypeArr = ['qs', 'params'],
        bodyTypeArr = ['body', 'data', 'form', 'formData']
    for (let e in urlTypeArr) {
        urlTypeArr[e] in oldoptions ? newoptions.url = changeUrl(urlTypeArr[e]) : newoptions.url = oldoptions.url
    }
    'content-type' in oldoptions.headers ? newoptions.headers = changeHeaders(oldoptions.headers) : newoptions.headers = oldoptions.headers
    function changeUrl(type) {
        url = oldoptions.url + '?'
        for (let key in oldoptions[type]) { url += key + '=' + oldoptions[type][key] + '&' }
        url = url.substring(0, url.length - 1)
        return url
    }
    function changeHeaders(headers) {
        let tmp = headers['content-type']
        delete headers['content-type']
        headers['Content-Type'] = tmp
        return headers
    }
    for (let o in bodyTypeArr) {
        if (bodyTypeArr[o] in oldoptions) {
            (Object.prototype.toString.call(oldoptions[bodyTypeArr[o]]) === '[object Object]') ? newoptions.body = JSON.stringify(oldoptions[bodyTypeArr[o]]) : newoptions.body = oldoptions[bodyTypeArr[o]]
        }
    }
    return newoptions
}
function httpRequest(options, method) {
    //options = changeCode(options)
    typeof (method) === 'undefined' ? ('body' in options ? method = 'post' : method = 'get') : method = method
    return new Promise((resolve) => {
        $[method](options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${method}请求失败`);
                    //console.log(JSON.parse(err));
                    $.logErr(err);
                    //throw new Error(err);
                    //console.log(err);
                } else {
                    //httpResult = data;
                    //httpResponse = resp;
                    if (data) {
                        //console.log(data);
                        data = JSON.parse(data);
                        resolve(data)
                    } else {
                        console.log(`请求api返回数据为空，请检查自身原因`)
                    }
                }
            } catch (e) {
                //console.log(e, resp);
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}
// 等待 X 秒
function wait(n) {
    return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000)
    })
}
// 双平台log输出
function DoubleLog(data) {
    if ($.isNode()) {
        if (data) {
            console.log(`${data}`);
            msg += `\n${data}`
        }
    } else {
        console.log(`${data}`);
        msg += `\n${data}`
    }
}
// 发送消息
async function SendMsg(message) {
    if (!message) return;
    if (Notify > 0) {
        if ($.isNode()) {
            var notify = require("./sendNotify");
            await notify.sendNotify($.name, message)
        } else {
            $.msg($.name, '', message)
        }
    } else {
        console.log(message)
    }
}
// 完整 Env
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
