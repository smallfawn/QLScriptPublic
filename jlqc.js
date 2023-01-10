/**
 * 吉利汽车
 * cron 25 9 * * *  jlqc.js
 *
 * 22/11/23 积分查询 每日分享
 * 22/11/24 文章 评论 签到     
 * 22/11/25 修复长图文 删除评论
 * ========= 青龙--配置文件 ===========
 * # 吉利汽车
 * export jlqc_data='txcookie&token'
 * 
 * 多账号用 换行 或 @ 分割
 * 抓包 app.geely.com , 找到 txcookie 和 token 的值 , 用&连接。
 * ====================================
 * 交流 BUG反馈 投稿 群: 862839604
 */



const $ = new Env("吉利汽车");
const ckName = "jlqc_data";
let show = "月300左右积分/可以换实物"
//-------------------- 一般不动变量区域 -------------------------------------
const utils = require("./utils");
const notify = $.isNode() ? require("./sendNotify") : "";
const Notify = 1;		 //0为关闭通知,1为打开通知,默认为1
let debug = 0;           //Debug调试   0关闭  1开启
let envSplitor = ["@", "\n"]; //多账号分隔符
let ck = msg = '';       //let ck,msg
let host, hostname;
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
//---------------------- 自定义变量区域 -----------------------------------

async function start() {
    console.log(show)
    console.log('\n================== 积分查询 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.info_point('积分查询'));
        await wait(2);
    }
    await Promise.all(taskall);
    console.log('\n================== 每日签到 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_sign('每日签到'));
        await wait(2);
    }
    await Promise.all(taskall);
    console.log('\n================== 每日分享 ==================\n');
    taskall = [];
    for (let user of userList) {
        for (let i = 0; i < 3; i++) {
            taskall.push(await user.task_share('每日分享'));
            await wait(3);
        }
    }
    await Promise.all(taskall);
    console.log('\n================== 发布动态 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_create1('发布动态'));
        await wait(3);
    }
    await Promise.all(taskall);
    console.log('\n================= 发布长图文 =================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_create2('发布长图文'));
        await wait(3);
    }
    await Promise.all(taskall);

}


class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck1 = str.split('&')[0];
        this.ck2 = str.split('&')[1];
        this.host = "app.geely.com";
        this.hostname = "https://" + this.host;
        this.headersGet = {
            txcookie: this.ck1,
            devicesn: '356617505697247',
            Host: 'app.geely.com',
            platform: 'Android',
            token: this.ck2,
            'user-agent': 'okhttp/4.5.0'
        }
        this.headersPostv1 = {
            txcookie: this.ck1,
            devicesn: '356617505697247',
            Host: 'app.geely.com',
            platform: 'Android',
            token: this.ck2,
            'content-type': 'application/json; charset=utf-8',
            'user-agent': 'okhttp/4.5.0'
        }
        this.headersPostv2 = {
            txcookie: this.ck1,
            devicesn: '356617505697247',
            Host: 'app.geely.com',
            platform: 'Android',
            token: this.ck2,
            'content-type': 'application/json; charset=utf-8',
            'user-agent': 'okhttp/4.3.1',
            appversion: '2.6.0'
        }
        this.randomInt = utils.randomInt(0, 6);
        this.commentTxtArr = ["真不错啊", "很棒啊", "好可爱啊", "真厉害呀", "我超级想要", "怎么办呐", "哇咔咔"]
        this.createTxtArr = ["最近有点冷", "今天是周几啊", "今天真暖和啊", "今天有点凉", "大家穿棉服了吗", "晚上吃点啥好呢", "大家那边下雪了吗", "早上吃点啥?"]
        this.commentTxt = this.commentTxtArr[this.randomInt]
        this.createTxt = this.createTxtArr[this.randomInt]
        this.imgurl = "https://geely-app-prod.oss-cn-hangzhou.aliyuncs.com/app/life/IMAGE/20221124/4109897683160859157/07779ca2e7694e3fbde886aa33fa4825.jpeg"
    }

    async info_point(name) { // 积分查询
        try {
            let options = {
                method: 'GET',
                url: this.hostname + '/api/v1/point/available',
                headers: this.headersGet
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == "success") {
                DoubleLog(`账号[${this.index}]  积分: ${result.data.availablePoint}`);
            } else {
                DoubleLog(`账号[${this.index}]  积分查询:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_share(name) { // 执行分享
        try {
            let options = {
                method: 'POST',
                url: this.hostname + '/api/v1/share/awardPoint',
                headers: this.headersPostv1,
                body: {},
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == "success") {
                DoubleLog(`账号[${this.index}]  分享: ${result.code}`);
            } else {
                DoubleLog(`账号[${this.index}]  分享:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_sign(name) { // 执行签到
        try {
            let options = {
                method: 'POST',
                url: this.hostname + '/api/v1/user/sign/',
                headers: this.headersPostv1,
                body: {},
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == "success") {
                DoubleLog(`账号[${this.index}]  签到: ${result.code}`);
            } else {
                DoubleLog(`账号[${this.index}]  签到:失败 ❌ 了呢,原因未知!` + result.message);
                //console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_create1(name) { // 发布动态
        try {
            let options = {
                method: 'POST',
                url: this.hostname + '/api/v2/topicContent/create',
                headers: this.headersPostv2,
                body: { circleId: null, contentType: 1, content: this.createTxt, fileList: null, longTitle: this.createTxt, topicList: [] },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == "success") {
                DoubleLog(`账号[${this.index}]  发布动态: ${result.code} [${result.data}]`);
                let artId = result.data;
                //console.log("---------------- 开始评论动态 ----------------");
                //await wait(5);
                //for (let i = 0; i < 3; i++) {
                //await this.task_comment(artId);
                //await wait(10);
                //}
                await wait(15);
                console.log("================== 开始删除动态 ==================");
                await this.task_delat(artId);
            } else {
                DoubleLog(`账号[${this.index}]  发布动态:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_create2(name) { // 发布长图文
        try {
            let options = {
                method: 'POST',
                url: this.hostname + '/api/v2/topicContent/create',
                headers: this.headersPostv2,
                body: { longImgUrl: this.imgurl, circleId: null, contentType: 2, content: this.createTxt, fileList: null, longTitle: this.createTxt, topicList: [] },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == "success") {
                DoubleLog(`账号[${this.index}]  发布长图文: ${result.code} [${result.data}]`);
                let artId = result.data;
                await wait(15);
                console.log("================ 开始删除发布长图文 ================");
                await this.task_delat(artId);
            } else {
                DoubleLog(`账号[${this.index}]  发布长图文:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_comment(artid) { // 执行评论 V1不加积分
        try {
            let options = {
                method: 'POST',
                url: this.hostname + '/api/v1/community/comment/publisherComment',
                headers: this.headersPostv1,
                body: { content: this.commentTxt, id: artid, type: 2 },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, "评论");
            //console.log(result);
            if (result.code == "success") {
                DoubleLog(`账号[${this.index}]  评论文章:` + artid + `:${result.code}`);
            } else {
                DoubleLog(`账号[${this.index}]  评论:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_delat(artid) { // 执行删除
        try {
            let options = {
                method: 'POST',
                url: this.hostname + '/api/v2/topicContent/deleteContent',
                headers: this.headersPostv2,
                body: { id: artid },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, "删除");
            //console.log(result);
            if (result.code == "success") {
                DoubleLog(`账号[${this.index}]  删除文章:` + artid + `:${result.code}`);
            } else {
                DoubleLog(`账号[${this.index}]  删除:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }




    async task_artlist(name) { // 圈子动态列表
        try {
            let options = {
                method: 'POST',
                url: this.hostname + '/api/v1/community/topicContent/queryPage',
                headers: this.headersPostv1,
                body: { pageSize: 10, pageNum: 1, auditStatus: 3 },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == "success") {
                DoubleLog(`账号[${this.index}]  文章列表: ${result.data.list[0].id}`);
                //await this.task_comment(artid);
            } else {
                DoubleLog(`账号[${this.index}]  获取:失败 ❌ 了呢,原因未知！`);
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


// #region ********************************************************  固定代码  ********************************************************

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
// =========================================== 不懂不要动 =========================================================
// 网络请求 (get, post等)
async function httpRequest(options, name) { return new Promise((resolve) => { var request = require("request"); if (!name) { let tmp = arguments.callee.toString(); let re = /function\s*(\w*)/i; let matches = re.exec(tmp); name = matches[1] } if (debug) { console.log(`\n【debug】===============这是${name}请求信息===============`); console.log(options) } request(options, function (error, response) { if (error) throw new Error(error); let data = response.body; try { if (debug) { console.log(`\n\n【debug】===============这是${name}返回数据==============`); console.log(data) } if (typeof data == "string") { if (isJsonString(data)) { let result = JSON.parse(data); if (debug) { console.log(`\n【debug】=============这是${name}json解析后数据============`); console.log(result) } resolve(result) } else { let result = data; resolve(result) } function isJsonString(str) { if (typeof str == "string") { try { if (typeof JSON.parse(str) == "object") { return true } } catch (e) { return false } } return false } } else { let result = data; resolve(result) } } catch (e) { console.log(error, response); console.log(`\n ${name}失败了!请稍后尝试!!`) } finally { resolve() } }) }) }
// 等待 X 秒
function wait(n) { return new Promise(function (resolve) { setTimeout(resolve, n * 1000) }) }
// 双平台log输出
function DoubleLog(data) { if ($.isNode()) { if (data) { console.log(`${data}`); msg += `${data}` } } else { console.log(`${data}`); msg += `${data}` } }
// 发送消息
async function SendMsg(message) { if (!message) return; if (Notify > 0) { if ($.isNode()) { var notify = require("./sendNotify"); await notify.sendNotify($.name, message) } else { $.msg($.name, '', message) } } else { console.log(message) } }
// 完整 Env
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
