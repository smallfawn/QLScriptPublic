/**
 * cron 27 16 * * *  exeedcars.js
 * @author https://github.com/smallfawn/QLScriptPublic
 * Show:     Hi星途 发帖5分 分享动态5分  回帖2分 签到2分 平均45天积分换一次
 * 变量名:    exeedcarsLife
 * 变量值:    https://starway.exeedcars.com  headers中的Authorization  去掉Bearer 去掉Bearer 去掉Bearer
 * scriptVersionNow = "0.0.1";
 * export exeedcarsPost=true 无需引号 开启发帖 不填不写 默认不执行
 * export exeedcarsComment=true 开启评论  不填不写 默认不执行
 * 11/27 新增果园任务  和  签到 熟成之后获得200积分
 */

const $ = new Env("Hi星途");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "exeedcarsLife";
let envSplitor = ["@", "\n"]; //多账号分隔符
let strSplitor = "&"; //多变量分隔符
let userIdx = 0;
let userList = [];
class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.titleList = []
        this.contentList = []
        this.commentList = []
        this.treeTaskList = []
        this.treeWaterNum = 0
    }
    get_headers() {
        return {
            "Authorization": "Bearer " + this.ck,
            "client_id": "app",
            "client_secret": "app",
            "Client-Agent": "device:Xiaomi MI 8 Lite;os:Android 10;version:V1.0.55",
            "Content-Type": "application/json; charset=utf-8",
            //"Content-Length": 619,
            "Host": "starway.exeedcars.com",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip",
            "User-Agent": "okhttp/4.8.1"
        }

    }
    async main() {
        $.log(`===== 开始执行第[${this.index}]个账号 =====`)
        await this.user_info();
        if (this.ckStatus) {
            await this.user_point()
            await this.signIn_status()
            await this.art_list()
            if (process.env["exeedcarsPost"] == "true" || process.env["exeedcarsComment"] == "true") {
                console.log(`正在远程获取评论！请等待10s左右`);
                await this._getText()
            }
            if (process.env["exeedcarsPost"] == "true") {
                await this.submit_common("dync", { "hasVideo": "0", "appId": "star", "title": this.titleList[0], "content": this.contentList[0] })
            }
            if (process.env["exeedcarsComment"] == "true") {
                await this.submit_common("comment", { "appId": "star", "id": this.artList[0].id, "position": "0", "contentType": "1", "content": this.commentList[0] })
            }
            await this.submit_common("share", { "appId": "star", "shareChannel": "1", "id": this.artList[0].id, "contentType": "1" })
            await this.tree_task_common(1)
            await this.tree_task_list()
            if (this.treeTaskList.length > 0) {
                for (let task of this.treeTaskList) {
                    $.log(`[${task.growName}] - ${task.limit} / ${task.limitTimes}`)
                }
                for (let task of this.treeTaskList) {
                    if (task.limitTimes > task.limit) {
                        if (task.id == 3) {
                            let tasknum = Number(task.limitTimes) - Number(task.limit)
                            for (let i = 0; i < tasknum; i++)
                                await this.tree_task_common(task.id)
                        } else {
                            await this.tree_task_common(task.id)
                        }

                    }
                }
            }
            await this.tree_task_water_info()
            if (this.treeWaterNum > 0) {
                await this.tree_task_water()
            }

        }

    }
    async _getText() {
        try {
            let textList = []
            let options = {
                fn: "获取随机一言",
                method: "get",
                url: `https://v1.hitokoto.cn/?c=e`,
            }
            for (let i = 0; i < 10; i++) {
                await $.wait(1000)
                let { body: result } = await httpRequest(options);
                //console.log(options);
                result = JSON.parse(result);
                //console.log(result);
                if (result["length"] > 10) {
                    textList.push(result.hitokoto)
                }
                this.titleList = [textList[0]]
                this.contentList = [textList[1]]
                this.commentList = [textList[2]]
            }
        } catch (e) {
            console.log(e);
        }
    }
    async signIn_status() {
        try {
            let options = {
                fn: "签到状态",
                method: "get",
                url: `https://starway.exeedcars.com/api-social/ec/personal/query/attendanceStatus`,
                headers: this.get_headers(),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "200") {
                if (result.data == true) {
                    $.log(`今天已签到🎉`)
                } else {
                    $.log(`今天未签到🎉`)
                    //执行签到
                    await this.task_signIn()
                }


            } else {
                console.log(`❌[${options.fn}]失败`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    //
    async task_signIn() {
        try {
            let options = {
                fn: "签到",
                method: "get",
                url: `https://starway.exeedcars.com/api-social/ec/personal/attendance`,
                headers: this.get_headers(),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "200") {
                $.log(`签到成功 获得[${result.data}]分`)
            } else {
                console.log(`❌[${options.fn}]失败`);
                console.log(JSON.stringify(result));
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
                url: `https://starway.exeedcars.com/api-user/user/integral/get`,
                headers: this.get_headers(),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "200") {
                $.log(`当前积分[${result.data.pointBalance}]分`)
            } else {
                console.log(`❌[${options.fn}]失败`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async tree_task_common(id) {
        try {
            let options = {
                fn: "种树任务通用",
                method: "post",
                url: `https://starway.exeedcars.com/api-marking/tree/event/trigger/event`,
                headers: this.get_headers(),
                body: JSON.stringify({ "id": id })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "200") {
                $.log(`完成任务 获得[${result.data}]💧`)
            } else {
                if (id == 1) {

                } else {
                    console.log(`❌[${options.fn}]失败`);
                    console.log(JSON.stringify(result));
                }

            }
        } catch (e) {
            console.log(e);
        }
    }

    async tree_task_list() {
        try {
            let options = {
                fn: "种树任务列表",
                method: "get",
                url: `https://starway.exeedcars.com/api-marking/tree/event/get/effect`,
                headers: this.get_headers(),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "200") {
                this.treeTaskList = result.data
            } else {
                console.log(`❌[${options.fn}]失败`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async tree_task_water() {
        try {
            let options = {
                fn: "浇水",
                method: "get",
                url: `https://starway.exeedcars.com/api-marking/tree/user/water/get/water`,
                headers: this.get_headers(),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "200") {
                $.log(`浇水成功`)
            } else {
                console.log(`❌[${options.fn}]失败`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async tree_task_water_info() {
        try {
            let options = {
                fn: "浇水",
                method: "get",
                url: `https://starway.exeedcars.com/api-marking/tree/user/water/get`,
                headers: this.get_headers(),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "200") {
                $.log(`剩余[${result.data.water}]💧`)
                this.treeWaterNum = result.data.water
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
                url: `https://starway.exeedcars.com/api-user/user/queryById`,
                headers: this.get_headers(),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "200") {
                $.log(`✅[${result.data.nickName}][${result.data.phone}][${result.data.id}]🎉`)
                this.ckStatus = true;
            } else {
                console.log(`❌[${options.fn}]失败`);
                this.ckStatus = false;
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async art_list() {
        try {
            let nonceStr = this.get_uuid()
            let time = new Date().getTime().toString()
            let default_options = { "nonceStr": nonceStr, "timestamp": time }
            let config_options = { "pageNumber": "1", "pageType": "3", "appId": "star", "pageSize": "10" }
            Object.assign(config_options, default_options)
            let content = this.creat_content(config_options)
            let options = {
                fn: "文章列表",
                method: "post",
                url: `https://starway.exeedcars.com/api-social/ec/social/anon/list`,
                headers: this.get_headers(),
                body: JSON.stringify({ "appId": "star", "nonceStr": nonceStr, "content": content, "timestamp": time })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "200") {
                this.artList = result.data.list
            } else {
                console.log(`❌[${options.fn}]失败`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async submit_common(type, config_options) {
        try {
            let nonceStr = this.get_uuid()
            let time = new Date().getTime().toString()
            let default_options = { "nonceStr": nonceStr, "timestamp": time }

            Object.assign(config_options, default_options)
            let content = this.creat_content(config_options)
            let options = {
                fn: "提交通用",
                method: "post",
                url: `https://starway.exeedcars.com/api-social/ec/social/${type}/submit`,
                headers: this.get_headers(),
                body: JSON.stringify({ "appId": "star", "nonceStr": nonceStr, "content": content, "timestamp": time })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.code == "200") {
                console.log(`[${type}]成功`);
            } else {
                console.log(`❌[${options.fn}]失败`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    creat_content(e) {
        function jsencrtpt_result(t) {
            let Ie =
                "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCbFRhFFvYlqIu1fp9Hau9MIIVQFTLXbbEWTays1lB1N50jcOnzzj6oDExyjM8050YgsrM3i8M4B1eCpjetjGqPx6BxvnmUr/FIv1/7DDbtMvADlVpYKc7v7kCftjdwbKDT4GPwl2I2WkjSJaU3LhFiYlmxW+9zA1moz3Tc6yp8OQIDAQAB\n-----END PUBLIC KEY-----"
            global["window"] = {}
            global["navigator"] = {}
            const { JSEncrypt } = require("encryptlong")
            const encryptor = new JSEncrypt()
            encryptor.setPublicKey(Ie)
            return encryptor.encryptLong(t)

        }
        function jsrsasign_result(t) {
            let Se =
                "-----BEGIN PRIVATE KEY-----\nMIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAMObKgSn8qZePjTNtRXd+aJywxLzMOM2AgNSXJ5oLMd7miSKCPaXz1sNKIPEYLNgiii04PJg3fNcpHFC5dZeX9iUvtsCUtFvdFsj/WgwsXuIWce2QjpX83TwjhN3essGbJIjAXzouLTTB3Tc8gL3Wd8J36vd3r3I28p8tj74+7ovAgMBAAECgYAA4emqzPEhJ7POneJFb25/xkNvAbXrpvtp8VwEpzVWfROr6gjrp3ZSVbJPT9qrTe9TfDQzU2YT2XZ9iM44ETmYEJ9moHSWLCpWFclJFY2Hy9HxaEw56Zu+iYWrZ9jtbiC2A/XOsOv/198slBpB8+7PCsinEUsKC1CP9YwOuwTLZQJBAPDpcRGBBMVOol/ADGuqCHBqtN3wX5PznKFGJIMi5tFQcghFlhixDsw/43spek1BMht+MhERUXrBvQHyCFE7LK0CQQDP21Tkp4NwOE6h1Q9hAgjOp6emuU7vbJmUU+dHiiNt6yVAYMV5tbdRacN4XS58Dt9K8WyYXQmMdYC8nVtcISHLAkBNi2aYssW9WNVNKr0UvrNetAop0iCBuA13n+NKzqYrQ9Cgtv1cT0mrFvl7AFvcmBqv3Mvy0HdAozHaeXSR6RE1AkByI6sWdLZEpWbojysGxis37/CsKQ4jg6tCPGDAdCbIcVvfYkSOdS7ZUg64xdKE5VXQvYo4kL5xlwS+jlpg2QDJAkEA3BNrYDBleAhrCuslvBB4LlFiyS0JpkqzfzNjYLvD0pd9wIR5JBvrWiYqiX4y4LfcdfF1IpMrKKeR48mpUGDAZg==\n-----END PRIVATE KEY-----"
            const jsrsasign = require('jsrsasign')
            var r = jsrsasign.KEYUTIL.getKey(Se),
                n = new jsrsasign.KJUR.crypto.Signature({ alg: "SHA256withRSA" });
            return n.init(r), n.updateString(t), jsrsasign.hextob64(n.sign());
        }
        function Ce(str) {
            str = str.replaceAll("‘", "");
            str = str.replaceAll("’", "");
            str = str.replaceAll("“", "");
            str = str.replaceAll("”", "");
            var utf16String = "";
            for (var i = 0; i < str.length; i++) {
                var char = str.charAt(i);
                if (char.match(/[\u4E00-\u9FA5]/) || char.match(/[\u3000-\u303F]/) || char.match(/[\uFF01-\uFF5E]/)) { // 检测是否是中文字符或中文标点符号
                    utf16String += "\\u" + char.charCodeAt(0).toString(16); // 转换为UTF-16编码
                } else {
                    utf16String += char; // 其他字符直接添加到结果中
                }
            }
            return utf16String;

        }

        let t = JSON.stringify(e);
        t = Ce(t)
        //console.log(t)
        let r = jsrsasign_result(t)
        let n = encodeURI(r)
        let s = "body=".concat(t, "&sign=").concat(n)
        let content = jsencrtpt_result(s)
        //console.log(content);
        return content
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
    if (process.env["exeedcarsPost"] == "true") {
        $.log(`您开启了发帖开关---`)
    } else {
        $.log(`您未开启发帖开关---`)
    }
    if (process.env["exeedcarsComment"] == "true") {
        $.log(`您开启了评论开关---`)
    } else {
        $.log(`您未开启评论开关---`)
    }
    let taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            taskall.push(await user.main());
        }
    }
    await Promise.all(taskall);
    $.msg($.name, "任务执行 over", "smallfawn 提醒您 天冷加衣")
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
