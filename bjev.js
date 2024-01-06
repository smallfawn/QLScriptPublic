/**
 * cron 45 21 * * *  bjev.js
 * Show:北京汽车 点赞每天5次 10分 签到10分 转发2次 20分  7天签到100分 30天1000分 半年5000 1年1W  
 * 合计1月2300分  商城最低价4900分 平均2个月换一次
 * @author https://github.com/smallfawn/QLScriptPublic
 * 变量名:bjevAuth
 * 变量值:https://beijing-gateway-customer.app-prod.bjev.com.cn请求头Headers中Authorization  去掉Bearer  去掉Bearer 去掉Bearer
 * scriptVersionNow = "0.0.1";
 */

const $ = new Env("北京汽车");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "bjevAuth";
let envSplitor = ["@", "\n"]; //多账号分隔符
let strSplitor = "&"; //多变量分隔符
let userIdx = 0;
let userList = [];
class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.artList = []//文章列表
        this.taskList = []//任务列表
        this.task_num_like = null //待做点赞任务数
        this.task_num_share = null//待做转发任务数
        this.userPoint = null

    }
    async main() {
        $.log(`===== 开始第[${this.index}]个账号 =====`)
        await this.user_info();
        if (this.ckStatus) {
            await this.user_point()
            $.log(`✅运行前 - 积分[${this.userPoint}]🎉`)
            await this.task_list()
            if (this.taskList.length > 0) {
                for (let task of this.taskList) {
                    //status == "0" 未完成
                    //status == "1" 待领取
                    //status == "2" 已完成
                    if (task.taskGroupCode == "ENTITY_LIKE") {
                        if (task.status == "0") {
                            this.task_num_like = Number(task.progressLimit) - Number(task.progress)
                        }
                        $.log(`点赞 ${task.progress} / ${task.progressLimit}`)
                        //点赞
                    } else if (task.taskGroupCode == "DAY_SIGN") {
                        if (task.status == "0") {
                            $.log(`检测未签到 执行签到`)
                            await this.addSign()
                        } else {
                            $.log(`签到已完成`)
                        }
                        //签到
                    } else if (task.taskGroupCode == "GET_TASK_ATTENTION" && task.status == "0") {
                        //被关注
                    } else if (task.taskGroupCode == "ENTITY_SHARE") {
                        if (task.status == "0") {
                            this.task_num_share = Number(task.progressLimit) - Number(task.progress)
                        }
                        $.log(`转发 ${task.progress} / ${task.progressLimit}`)
                        //转发
                    } else if (task.taskGroupCode == "GET_TASK_LIKE" && task.status == "0") {
                        //被点赞
                    }
                }
                if (this.task_num_like > 0 || this.task_num_share > 0) {
                    await this.art_list()
                    if (this.artList.length > 0) {
                        //点赞5次  转发2次
                        for (let i = 0; i < 5; i++) {
                            await this.task_like(this.artList[i])
                            await this.task_share(this.artList[i])
                        }
                    }

                }
            }
            await this.task_list()
            if (this.taskList.length > 0) {
                for (let task of this.taskList) {
                    if (task.status == "1") {
                        await this.task_award(task.taskGroupCode)
                    }
                }
            }
            await this.user_point()
            $.log(`✅运行后 - 积分[${this.userPoint}]🎉`)

        }



    }


    async addSign() {
        try {
            let options = {
                fn: "签到",
                method: "post",
                url: `https://beijing-gateway-customer.app-prod.bjev.com.cn/beijing-zone-asset/exterior/userSignRecord/addSign?uuid_check=${this.get_uuid()}`,
                body: JSON.stringify({}),
            }
            options.headers = this.get_headers(options.method, options.url, options.body)
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == 0) {
                $.log(`✅[${options.fn}]成功🎉`)
            } else {
                console.log(`❌[${options.fn}]失败`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async user_info() {
        try {
            let options = {
                fn: "信息查询",
                method: "get",
                url: `https://beijing-gateway-customer.app-prod.bjev.com.cn/beijing-zone-member/userCustomer/getUserInfo?buildVersion=138&uuid_check=${this.get_uuid()}`,
            }
            options.headers = this.get_headers(options.method, options.url)
            //console.log(options);
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "0") {
                //console.log(`✅账号[${this.index}]  欢迎用户: ${result.errcode}🎉`);
                $.log(`✅[${result.data.name}][${result.data.code}][${result.data.id}]🎉`)
                this.ckStatus = true;
            } else {
                console.log(`❌[UserInfo]查询: 失败`);
                this.ckStatus = false;
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async user_point() {
        try {
            let options = {
                fn: "积分查询",
                method: "get",
                url: `https://beijing-gateway-customer.app-prod.bjev.com.cn/beijing-zone-member/userCustomer/getPersonalCenter?uuid_check=${this.get_uuid()}`,
            }
            options.headers = this.get_headers(options.method, options.url)
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "0") {
                //console.log(`✅账号[${this.index}]  欢迎用户: ${result.errcode}🎉`);
                this.userPoint = result.data.availableIntegral

            } else {
                console.log(`❌[积分查询]失败`);
                this.ckStatus = false;
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
                url: `https://beijing-gateway-customer.app-prod.bjev.com.cn/beijing-zone-dynamic/exterior/dynamic/list?isRecommend=1&pageIndex=2&pageSize=10&isHot=1&uuid_check=${this.get_uuid()}`,
            }
            options.headers = this.get_headers(options.method, options.url)
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "0") {
                //领取成功
                //console.log(`✅[文章列表]成功`)
                for (let artId of result.data.dataList) {
                    console.log(artId.liked)
                    if (artId.liked == "-1") {//判断未点赞的
                        this.artList.push(artId.id)

                    }

                }
            } else {
                console.log(`❌[${options.fn}]失败`)
                console.log(JSON.stringify(result))
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_like(entityId) {
        try {
            let options = {
                fn: "点赞",
                method: "post",
                url: `https://beijing-gateway-customer.app-prod.bjev.com.cn/beijing-zone-dynamic/exterior/interact/like?uuid_check=${this.get_uuid()}`,
                body: JSON.stringify({ "entityId": entityId, "listUid": "f4a67e8f-525d-4846-b1b4-52c7d6d67dab", "type": 2 })
            }
            options.headers = this.get_headers(options.method, options.url, options.body)
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "0") {
                //领取成功
                console.log(`✅[${options.fn}]成功`)
            } else {
                console.log(`❌[${options.fn}]失败`)
                console.log(JSON.stringify(result))
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_share(entityId) {
        //number
        try {
            let options = {
                fn: "分享",
                method: "post",
                url: `https://beijing-gateway-customer.app-prod.bjev.com.cn/beijing-zone-dynamic/exterior/interact/dynamic/share?uuid_check=${this.get_uuid()}`,
                body: JSON.stringify({ "entityId": entityId })
            }
            options.headers = this.get_headers(options.method, options.url, options.body)
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "0") {
                //领取成功
                console.log(`✅[${options.fn}]成功`)
            } else {
                console.log(`❌[${options.fn}]失败`)
                console.log(JSON.stringify(result))
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_award(taskGroupCode) {
        try {
            let options = {
                fn: "领取奖励",
                method: "post",
                url: `https://beijing-gateway-customer.app-prod.bjev.com.cn/beijing-zone-asset/exterior/userTaskProgress/receiveAward?uuid_check=${this.get_uuid()}`,
                body: JSON.stringify({ "taskGroupCode": taskGroupCode })
            }
            options.headers = this.get_headers(options.method, options.url, options.body)
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "0") {
                //领取成功
                $.log(`✅领取成功 获得[${result.data}]分`)
            } else {
                console.log(`❌[${options.fn}]失败`)
                console.log(JSON.stringify(result))
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_list() {
        try {
            let options = {
                fn: "任务列表",
                method: "get",
                url: `https://beijing-gateway-customer.app-prod.bjev.com.cn/beijing-zone-asset/exterior/userTaskProgress/selectTaskForMemberCenter?uuid_check=${this.get_uuid()}`,
            }
            options.headers = this.get_headers(options.method, options.url)
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "0") {
                this.taskList = result.data[1].items

            } else {
                console.log(`❌[${options.fn}]失败`);

                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    sha256(str) {
        const crypto = require("crypto");
        return crypto.createHash("sha256").update(str).digest("hex");

    }
    get_headers(method, url, body = "") {
        url = url.replace("https://beijing-gateway-customer.app-prod.bjev.com.cn", "")
        let path = url.split('?')[0]
        let params = url.split('?')[1].split('&').sort().join("").toLowerCase()
        method = method.toUpperCase();
        let timestamp = new Date().getTime()
        const key = `162e31f57f928bb34df22f99f04875de`
        let str
        if (method == "POST") {
            str = `${method}${path}ice-auth-appkey:6164883796ice-auth-timestamp:${timestamp}json=${body}${params}${key}`
        } else {
            str = `${method}${path}ice-auth-appkey:6164883796ice-auth-timestamp:${timestamp}${params}${key}`

        }        const sign = this.sha256(encodeURIComponent(str))
        return {
            "Content-Type": "application/json;charset=UTF-8",
            "User-Agent": "(Android 10; Xiaomi MI 8 Lite Build/V12.0.1.0.QDTCNXM 3.13.1 138 release bjApp baic-app-android)",
            "versionInfo": "(Android 10; Xiaomi MI 8 Lite Build/V12.0.1.0.QDTCNXM 3.13.1 138 release bjApp baic-app-android)",
            "Cache-Control": "no-cache",
            "Authorization": `Bearer ` + this.ck,
            //"userId": "",
            "appKey": 6164883796,
            "ice-auth-appkey": 6164883796,
            "ice-auth-timestamp": timestamp,
            "ice-auth-sign": sign,
            "Content-Type": "application/json;charset=UTF-8",
            "Host": "beijing-gateway-customer.app-prod.bjev.com.cn",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip"
        }
    }
    get_uuid() {
        return 'xxxxxxxx-xxxx-xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
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
    $.msg($.name, `任务已完成`)
}

!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        await start();
    }

    await SendMsg($.logs.join("\n"))
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
        await notify.sendNotify($.name, message)
    } else {
        $.msg($.name, '', message)
    }
}
// prettier-ignore
function Env(t, s) { return new (class { constructor(t, s) { (this.name = t), (this.data = null), (this.dataFile = "box.dat"), (this.logs = []), (this.logSeparator = "\n"), (this.startTime = new Date().getTime()), Object.assign(this, s), this.log("", `\ud83d\udd14${this.name},\u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } getScript(t) { return new Promise((s) => { this.get({ url: t }, (t, e, i) => s(i)) }) } runScript(t, s) { return new Promise((e) => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); (o = o ? 1 * o : 20), (o = s && s.timeout ? s.timeout : o); const [h, a] = i.split("@"), r = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": h, Accept: "*/*" }, }; this.post(r, (t, s, i) => e(i)) }).catch((t) => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (((o = Object(o)[t]), void 0 === o)) return e; return o } lodash_set(t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), (s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : (t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}), t)[s[s.length - 1]] = e), t) } getdata(t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata(t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? ("null" === h ? null : h || "{}") : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), (e = this.setval(JSON.stringify(s), i)) } catch (s) { const h = {}; this.lodash_set(h, o, t), (e = this.setval(JSON.stringify(h), i)) } } else e = this.setval(t, s); return e } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? ((this.data = this.loaddata()), this.data[t]) : (this.data && this.data[t]) || null } setval(t, s) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, s) : this.isQuanX() ? $prefs.setValueForKey(t, s) : this.isNode() ? ((this.data = this.loaddata()), (this.data[s] = t), this.writedata(), !0) : (this.data && this.data[s]) || null } initGotEnv(t) { (this.got = this.got ? this.got : require("got")), (this.cktough = this.cktough ? this.cktough : require("tough-cookie")), (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()), t && ((t.headers = t.headers ? t.headers : {}), void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, s = () => { }) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? $httpClient.get(t, (t, e, i) => { !t && e && ((e.body = i), (e.statusCode = e.status)), s(t, e, i) }) : this.isQuanX() ? $task.fetch(t).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, s) => { try { const e = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(e, null), (s.cookieJar = this.ckjar) } catch (t) { this.logErr(t) } }).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h, } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t))) } post(t, s = () => { }) { if ((t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), delete t.headers["Content-Length"], this.isSurge() || this.isLoon())) $httpClient.post(t, (t, e, i) => { !t && e && ((e.body = i), (e.statusCode = e.status)), s(t, e, i) }); else if (this.isQuanX()) (t.method = "POST"), $task.fetch(t).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: e, ...i } = t; this.got.post(e, i).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)) } } time(t) { let s = { "M+": new Date().getMonth() + 1, "d+": new Date().getDate(), "H+": new Date().getHours(), "m+": new Date().getMinutes(), "s+": new Date().getSeconds(), "q+": Math.floor((new Date().getMonth() + 3) / 3), S: new Date().getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = (t) => !t || (!this.isLoon() && this.isSurge()) ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o))); let logs = ['', '==============📣系统通知📣==============']; logs.push(t); e ? logs.push(e) : ''; i ? logs.push(i) : ''; console.log(logs.join('\n')); this.logs = this.logs.concat(logs) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t) } wait(t) { return new Promise((s) => setTimeout(s, t)) } done(t = {}) { const s = new Date().getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } })(t, s) }
