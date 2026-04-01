/**
 * 工匠职聘
 * cron 52 8 * * *  gjzp.js
 *
 * 22/12/10 每日签到 赚工分 
 * 22/12/11 每日红包奖励 判定CK是否有效 
 * 23/01/23 删除抽奖,修复BUG
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export gjzp_data='authorization&android'
 * 
 * 多账号用  @ 分割
 * 抓包 api-recruitment.yzw.cn , 找到 headers中 authorization 即可 
 * 如果你是ios端请在authorization后加上ios如果是android请输入android  必须小写
 * 首次使用请 去本APP => 我的 => 横幅 > 工分夺宝处首抽一次(绑定你的微信小程序)  否则不绑定抽不了奖
 * 如果是先注册小程序后再去APP,就无需绑定了 直接抓CK即可
 * ====================================
 *   
 */



const $ = new Env("工匠职聘");
const ckName = "gjzp_data";
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
    console.log('\n================== 用户查询 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.user_info(1));
        await $.wait(3000); //延迟
    }
    await Promise.all(taskall);
    console.log('\n================== 红包签到 ==================\n');
    taskall = [];
    for (let user of userList) {
        await user.task_sign('红包签到')
        await $.wait(3000); //延迟
    }
    await Promise.all(taskall);
    console.log('\n================== 日常任务 ==================\n');
    taskall = [];
    for (let user of userList) {
        await user.task_see();
        await $.wait(3000); //延迟
    }
    await Promise.all(taskall);



}


class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.cktest = str.split('&')[0]; //单账号多变量分隔符
        //this.deviceid = str.split('&')[1]; //单账号多变量分隔符
        this.ck = "Bearer " + this.cktest.replace('Bearer', '')
        this.PhoneType = str.split('&')[1];
        //let ck = str.split('&')
        //this.data1 = ck[0]
        //this.host = "echo.apipost.cn";
        //this.hostname = "https://" + this.host;
    }

    async user_info(type) { // userinfo
        try {
            let options = {
                method: 'POST',
                url: 'https://api-recruitment.yzw.cn/v2/labor/app/user/getUserBaseInfo',
                headers: {
                    Host: 'api-recruitment.yzw.cn',
                    accept: 'application/json, text/plain, */*',
                    version: '2.14.0',
                    authorization: this.ck,
                    appsourcetype: '1',
                    //'x-device-id': this.deviceid,
                    //'x-flow-num': 'f4a3d43f-50c8-4d50-9287-834894e86339',
                    //'x-device': 'zhipin/android/29/2.14.0/392.72727272727275/829.0909090909091/2.75',
                    'content-type': 'application/json',
                    //'content-length': '11',
                    //'accept-encoding': 'gzip',
                    //cookie: 'acw_tc=2f624a4016706498913978918e4b42d68638eccb6145bcc0a89b50a20dab88',
                    //'user-agent': 'okhttp/4.9.2'
                },
                body: {},
                json: true
            };
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (type == 1) {
                if (result.code == 20000) {
                    DoubleLog(`账号[${this.index}]  账号: [${result.data.userId}] 昵称[${result.data.name}] 工分余额[${result.data.totalScore}]`);
                    //let userId = result.data.userId
                    //return userId
                } else if (result.code == 40005) {
                    DoubleLog(`账号[${this.index}]  用户信息查询:失败 ❌ 了呢,原因${result.message}`);//没次数
                    console.log(result);
                } else {
                    DoubleLog(`账号[${this.index}]  用户信息查询:失败 ❌ 了呢,原因未知`);
                    console.log(result);
                }
            } else if (type == 0) {
                if (result.code == 20000) {
                    let userId = result.data.userId
                    return userId
                } else if (result.code == 40005) {
                    console.log(result);
                } else {
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    async task2() { // task2 红包任务列表
        try {
            let options = {
                method: 'GET',
                url: 'https://api-recruitment.yzw.cn/v2/labor/app/sign/tasks',
                headers: {
                    Host: 'api-recruitment.yzw.cn',
                    accept: 'application/json, text/plain, */*',
                    version: '2.14.0',
                    authorization: this.ck,
                    appsourcetype: '1',
                    //'x-device-id': this.deviceid,
                    //'x-flow-num': 'f4a3d43f-50c8-4d50-9287-834894e86339',
                    //'x-device': 'zhipin/android/29/2.14.0/392.72727272727275/829.0909090909091/2.75',
                    //'accept-encoding': 'gzip',
                    //cookie: 'acw_tc=2f624a4016706498913978918e4b42d68638eccb6145bcc0a89b50a20dab88',
                    //'user-agent': 'okhttp/4.9.2'
                }
            };
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 20000) {
                //DoubleLog(`账号[${this.index}]  账号: [${result.data.userId}] 昵称[${result.data.name}] 工分余额[${result.data.totalScore}]`);
            } else if (result.code == 40005) {
                //DoubleLog(`账号[${this.index}]  用户信息查询:失败 ❌ 了呢,原因${result.message}`);//没次数
                //console.log(result);
            } else {
                //DoubleLog(`账号[${this.index}]  用户信息查询:失败 ❌ 了呢,原因未知`);
                //console.log(result);
            }
            return result
        } catch (error) {
            console.log(error);
        }
    }

    async task_sign() { // 红包签到
        //console.log(this.cktest.replace('Bearer', ''))
        try {
            let options = {
                method: 'GET',
                url: 'https://api-recruitment.yzw.cn/v2/labor/app/sign/sign',
                headers: {
                    Host: 'api-recruitment.yzw.cn',
                    accept: 'application/json, text/plain, */*',
                    version: '2.14.0',
                    authorization: this.ck,
                    appsourcetype: '1',
                    //'x-device-id': this.deviceid,
                    //'x-flow-num': '71abe6e4-2a7f-4c5a-89db-81a002139135',
                    //'x-device': 'zhipin/android/29/2.14.0/392.72727272727275/829.0909090909091/2.75',
                    //cookie: 'acw_tc=2f624a2e16706248652012563e316a3fc1bfc16d803e478a49dfb0ce7727bd',
                    //'user-agent': 'okhttp/4.9.2',
                    //'if-modified-since': 'Fri, 09 Dec 2022 05:21:36 GMT'
                }
            };
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 20000) {
                DoubleLog(`账号[${this.index}]  签到成功获得: ${result.message}`);
            } else if (result.code == 40005) {
                DoubleLog(`账号[${this.index}]  签到:失败 ❌ 了呢,原因${result.message}！`);
            } else {
                console.log(result)
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_see() {
        let t2 = await this.task2()
        if (t2.code == 20000) {
            for (let o in t2.data) {
                let id = await this.user_info(0)
                if (t2.data[o].id == "13" && t2.data[o].status == 0) {
                    await this.task_see3()
                    await $.wait(10000)
                } else if (t2.data[o].id == "13" && t2.data[o].status == 1) {
                    console.log(`账号[${this.index}]任务红包浏览首页完成`);
                }
                if (t2.data[o].id == "18" && t2.data[o].status == 0) {
                    //console.log(t2.data[o]);
                    for (let i = 0; i < 2; i++) {
                        await this.task_see4(id)
                        await $.wait(10000)
                    }
                } else if (t2.data[o].id == "18" && t2.data[o].status == 1) {
                    //await this.task_see4("红包分享职位",id)
                    console.log(`账号[${this.index}]任务红包分享职位完成`);
                }
            }
        }
    }

    async task_see3() { //红包任务 浏览首页
        try {
            let options = {
                method: 'POST',
                url: 'https://api-recruitment.yzw.cn/v2/labor/app/browseCollectRecord/add',
                headers: {
                    Host: 'api-recruitment.yzw.cn',
                    accept: 'application/json, text/plain, */*',
                    version: '2.14.0',
                    authorization: this.ck,
                    appsourcetype: '1',
                    //'x-device-id': 'd310c38476e58308d310c38476e58308d310c38476e58308d310c38476e58308',
                    //'x-flow-num': 'd019070d-f032-4ffc-9737-188c477cb2ee',
                    //'x-device': 'zhipin/android/29/2.14.0/392.72727272727275/829.0909090909091/2.75',
                    'content-type': 'application/json',
                    'user-agent': 'okhttp/4.9.2'
                },
                body: { type: 1, recordType: 7 },
                json: true
            };
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 20000) {
                DoubleLog(`账号[${this.index}]  红包任务浏览首页成功${result.data}`);
                console.log('本次可能获得0.05');
            } else if (result.code == 40005) {
                DoubleLog(`账号[${this.index}]  红包任务浏览首页:失败 ❌ 了呢,原因${result.message}`);
                //console.log(result);
            } else {
                DoubleLog(`账号[${this.index}]  红包任务浏览首页:失败 ❌ 了呢,原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_see4(userId) { // 红包任务 分享职业卡片
        try {
            let options = {
                method: 'POST',
                url: 'https://api-recruitment.yzw.cn/v2/labor/app/userShareRecord/add',
                headers: {
                    Host: 'api-recruitment.yzw.cn',
                    accept: 'application/json, text/plain, */*',
                    version: '2.14.0',
                    authorization: this.ck,
                    appsourcetype: '1',
                    'content-type': 'application/json'
                },
                body: { shareTarget: 0, userId: userId, shareType: 1, shareOtherId: 44207 },
                json: true
            };
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 20000) {
                DoubleLog(`账号[${this.index}]  红包任务 分享职位 成功${result.data}`);
                console.log('本次可能获得0.02');
            } else if (result.code == 40005) {
                DoubleLog(`账号[${this.index}]  红包任务 分享职位:失败 ❌ 了呢,原因${result.message}`);
                //console.log(result);
            } else {
                DoubleLog(`账号[${this.index}]  红包任务 分享职位:失败 ❌ 了呢,原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
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
