/**
 * cron 44 14 * * *  baitianGame.js
 * Show:完成每日做任务和积分抢购（兑换）
 * //多账号分隔符 换行 或者 @
 * 变量名:baitianGameCookie
 * 变量值:http://www.100bt.com/m/creditMall/?gameId=2#home 网页的cookie 随便找个商品兑换抓http://service.100bt.com/creditmall/
 * 请求头Header cookie 全部
 * scriptVersionNow = "0.0.1";
 * 
    兑换ID
    配置文件 export baitianExchangeId=0  不用引号 0代表兑换塔罗牌*1套  不写变量默认不兑换 
        //时序残响塔罗牌*1套  0
        //奥奇传说餐具盒*1    1
        //奥拉毛绒亚比球（随机款）*1   2
        //1奥币  3
        //小精灵白色毛绒包*1   4
        //奥比岛软糯抱抱熊*1  5
        //赤月毛绒公仔   6
        //奥比岛PU皮潮流挎包  7
        //奥比岛小精灵毛绒公仔  8
        //时序残响天文台套装*1  9
        //奥奇毛绒眼罩（随机款）*1  10
        //奥奇手游小诺捏捏团*1  11
        //"奥比岛幸运按摩捶*1"  12
        //"奥拉星女仆咖啡立牌*1套", 13
        //"时序残响方形炫酷徽章*1" 14
        //"奥比岛爱心抱枕*1" 15
        //"奥比岛多彩明信片*5"  16
        //"奥奇传说手游明信片*3", 17
        //"奥奇阿修公仔*1" 18
        //"时序残响角色立牌*1" 19
        //"奥奇传说束口袋*1" 20
        // "奥拉星手游兑换码", 21
        //"食物语手游精美书签*5" 22
        // "食物语精美贴纸*1"  23
        // "奥拉星页游礼包"  24.
        //"奥奇页游礼包",  25
        //"10奥币"26 
        //"奥比岛页游礼包"  27
        //"奥拉星战斗卡牌*1"  28
        //"奥雅页游礼包" 29
        //"30奥币" 30
 */

const $ = new Env("100bt百田游戏");
const notify = $.isNode() ? require("./sendNotify") : "";
let ckName = "baitianGameCookie";
let envSplitor = ["@", "\n"]; //多账号分隔符
let strSplitor = "&"; //多变量分隔符
let userIdx = 0;
let userList = [];
class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.taskIdList = [];
    }
    async main() {
        $.log(`正在做任务请耐心等待`);
        await this.do_list()
        if (this.taskIdList.length > 0) {
            console.log(this.taskIdList)
            for (let taskId of this.taskIdList) {
                console.log(`正在做[${taskId.taskName}]任务`)
                await $.wait(10000);
                await this.do_task(taskId.taskId);
            }
        }

        if (process.env["baitianExchangeId"]) {
            await this.do_exchange(process.env["baitianExchangeId"]);
        }
    }
    async do_list() {
        let expando = "jQuery" + ("1.8.3" + Math.random()).replace(/\D/g, "");
        let time1 = new Date().getTime();
        let time2 = new Date().getTime();
        try {
            let options = {
                fn: "任务列表查询",
                method: "get",
                url: `http://service.100bt.com/creditmall/activity/daily_task_list.jsonp??callback=${expando}_${time1}&gameId=2&_=${time2}`,
                headers: {
                    Accept: "*/*",
                    "Accept-Encoding": "gzip, deflate",
                    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                    Cookie: this.ck,
                    Host: "service.100bt.com",
                    "Proxy-Connection": "keep-alive",
                    Referer: "http://www.100bt.com/",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
                },
            };
            let { body: result } = await httpRequest(options);
            //console.log(options);
            //result = JSON.parse(result);
            result = result.replace(`${expando}_${time1}`, "")
            result = result.replace(`(`, "")
            result = result.replace(`)`, "")
            result = JSON.parse(result)
            if (result.jsonResult.code == "0") {
                for (let taskId of result.jsonResult.data) {
                    if (taskId.status == "0") {
                        this.taskIdList.push({ taskName: taskId.name, taskId: taskId.taskID })
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
    async do_task(taskId) {
        //taskId=100 签到
        //"taskID": 191, 奥拉星招募
        //"taskID": 187, 预约奥拉星2手游
        //"taskID": 185, 测测你的额外1小时
        //   "taskID": 188, 进入亚比概念站
        //"taskID": 22每日查看最新预告
        let expando = "jQuery" + ("1.8.3" + Math.random()).replace(/\D/g, "");
        let time1 = new Date().getTime();
        let time2 = new Date().getTime();
        try {
            let options = {
                fn: "做任务",
                method: "get",
                url: `http://service.100bt.com/creditmall/activity/do_task.jsonp?callback=${expando}_${time1}&taskId=${taskId}&gameId=2&_=${time2}`,
                headers: {
                    Accept: "*/*",
                    "Accept-Encoding": "gzip, deflate",
                    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                    Cookie: this.ck,
                    Host: "service.100bt.com",
                    "Proxy-Connection": "keep-alive",
                    Referer: "http://www.100bt.com/",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
                },
            };
            let { body: result } = await httpRequest(options);
            //console.log(options);
            //result = JSON.parse(result);
            result = result.replace(`${expando}_${time1}`, "")
            result = result.replace(`(`, "")
            result = result.replace(`)`, "")
            result = JSON.parse(result)
            $.log(JSON.stringify(result.jsonResult.message));

        } catch (e) {
            console.log(e);
        }
    }

    async do_exchange(pageIndex) {
        let expando = "jQuery" + ("1.8.3" + Math.random()).replace(/\D/g, "");
        let time1 = new Date().getTime();
        let time2 = new Date().getTime();
        try {
            let options = {
                fn: "兑换",
                method: "get",
                url: `http://service.100bt.com/creditmall/mall/page.jsonp?callback=${expando}_${time1}&pageIndex=${pageIndex}&pageSize=1&orderBy=1&_=${time2}`,
                headers: {
                    Accept: "*/*",
                    "Accept-Encoding": "gzip, deflate",
                    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                    Cookie: this.ck,
                    Host: "service.100bt.com",
                    "Proxy-Connection": "keep-alive",
                    Referer: "http://www.100bt.com/",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
                },
            };
            let { body: result } = await httpRequest(options);
            //console.log(options);
            //result = JSON.parse(result);
            $.log(JSON.stringify(result));
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
    await SendMsg($.logs.join("\n"));
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
async function SendMsg(message) {
    if (!message) return;
    if ($.isNode()) {
        await notify.sendNotify($.name, message);
    } else {
        $.msg($.name, "", message);
    }
}
// prettier-ignore
function Env(t, s) { return new (class { constructor(t, s) { (this.name = t), (this.data = null), (this.dataFile = "box.dat"), (this.logs = []), (this.logSeparator = "\n"), (this.startTime = new Date().getTime()), Object.assign(this, s), this.log("", `\ud83d\udd14${this.name},\u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } getScript(t) { return new Promise((s) => { this.get({ url: t }, (t, e, i) => s(i)) }) } runScript(t, s) { return new Promise((e) => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); (o = o ? 1 * o : 20), (o = s && s.timeout ? s.timeout : o); const [h, a] = i.split("@"), r = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": h, Accept: "*/*" }, }; this.post(r, (t, s, i) => e(i)) }).catch((t) => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (((o = Object(o)[t]), void 0 === o)) return e; return o } lodash_set(t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), (s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : (t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}), t)[s[s.length - 1]] = e), t) } getdata(t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata(t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? ("null" === h ? null : h || "{}") : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), (e = this.setval(JSON.stringify(s), i)) } catch (s) { const h = {}; this.lodash_set(h, o, t), (e = this.setval(JSON.stringify(h), i)) } } else e = this.setval(t, s); return e } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? ((this.data = this.loaddata()), this.data[t]) : (this.data && this.data[t]) || null } setval(t, s) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, s) : this.isQuanX() ? $prefs.setValueForKey(t, s) : this.isNode() ? ((this.data = this.loaddata()), (this.data[s] = t), this.writedata(), !0) : (this.data && this.data[s]) || null } initGotEnv(t) { (this.got = this.got ? this.got : require("got")), (this.cktough = this.cktough ? this.cktough : require("tough-cookie")), (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()), t && ((t.headers = t.headers ? t.headers : {}), void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, s = () => { }) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? $httpClient.get(t, (t, e, i) => { !t && e && ((e.body = i), (e.statusCode = e.status)), s(t, e, i) }) : this.isQuanX() ? $task.fetch(t).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, s) => { try { const e = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(e, null), (s.cookieJar = this.ckjar) } catch (t) { this.logErr(t) } }).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h, } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t))) } post(t, s = () => { }) { if ((t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), delete t.headers["Content-Length"], this.isSurge() || this.isLoon())) $httpClient.post(t, (t, e, i) => { !t && e && ((e.body = i), (e.statusCode = e.status)), s(t, e, i) }); else if (this.isQuanX()) (t.method = "POST"), $task.fetch(t).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: e, ...i } = t; this.got.post(e, i).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)) } } time(t) { let s = { "M+": new Date().getMonth() + 1, "d+": new Date().getDate(), "H+": new Date().getHours(), "m+": new Date().getMinutes(), "s+": new Date().getSeconds(), "q+": Math.floor((new Date().getMonth() + 3) / 3), S: new Date().getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = (t) => !t || (!this.isLoon() && this.isSurge()) ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o))); let logs = ['', '==============📣系统通知📣==============']; logs.push(t); e ? logs.push(e) : ''; i ? logs.push(i) : ''; console.log(logs.join('\n')); this.logs = this.logs.concat(logs) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t) } wait(t) { return new Promise((s) => setTimeout(s, t)) } done(t = {}) { const s = new Date().getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } })(t, s) }
