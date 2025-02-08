/**
 * new Env("吉利银河")
 * cron 08 15 * * *  jlyh.js
 * Show:
 * 变量名:jlyh
 * 变量值:抓域名https://galaxy-user-api.geely.com/api/v1/login/refresh?refreshToken=后面的值&请求头headers中deviceSN的值
 * 抓不到这个域名抓短信登录包 https://galaxy-user-api.geely.com/api/v1/login/mobileCodeLogin 返回体中的refreshToken的值
 * 注意我说的是值 并不是全部 填错的自己看着点
 * 并且变量是两个值 两个值 两个值 一个refreshToke的值一个header请求头中的deviceSN的值
 * scriptVersionNow = "0.0.1";
 */

let Notify = 0; 
const ckName = "jlyh";
const $ = new Env("吉利银河");
let msg = "";

class UserInfo {
    constructor(str) {
        this.ckStatus = true;
        this.token = '';
        this.refreshToken = str.split('&')[0]; // 分隔符
        this.deviceSN = str.split('&')[1];
    }

    // 获取UTC时间
    formatDate(date, hourOffset = 0, minuteOffset = 0) {
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const adjustedDate = new Date(date);
        adjustedDate.setUTCHours(adjustedDate.getUTCHours() + hourOffset);
        adjustedDate.setUTCMinutes(adjustedDate.getUTCMinutes() + minuteOffset);
        const dayOfWeek = daysOfWeek[adjustedDate.getUTCDay()];
        const day = ('0' + adjustedDate.getUTCDate()).slice(-2);
        const month = months[adjustedDate.getUTCMonth()];
        const year = adjustedDate.getUTCFullYear();
        const hours = ('0' + adjustedDate.getUTCHours()).slice(-2);
        const minutes = ('0' + adjustedDate.getUTCMinutes()).slice(-2);
        const seconds = ('0' + adjustedDate.getUTCSeconds()).slice(-2);
        return `${dayOfWeek} ${month} ${day} ${year} ${hours}:${minutes}:${seconds} GMT`;
    }

    // 请求头加密参数处理
    calculateHmacSha256(method, accept, content_md5, content_type, date, key, nonce, timestamp, path) {
        const crypto = require('crypto');
        let ee = `${method}\n` +// method
            `${accept}\n` +// accept
            `${content_md5}\n` +// content_md5
            `${content_type}\n` +// content_type
            `${date}\n` +// date
            `x-ca-key:${key}\n` +
            `x-ca-nonce:${nonce}\n` +// nonce
            `x-ca-timestamp:${timestamp}\n` +// timestamp
            `${path}`// path  
        let sercetKey
        if (key == 204453306) {
            sercetKey = `uUwSi6m9m8Nx3Grx7dQghyxMpOXJKDGu`
        } else if (key == 204373120) {
            sercetKey = `XfH7OiOe07vorWwvGQdCqh6quYda9yGW`
        } else if (key == 204167276) {
            sercetKey = `5XfsfFBrUEF0fFiAUmAFFQ6lmhje3iMZ`
        } else if (key == 204168364) {
            sercetKey = `NqYVmMgH5HXol8RB8RkOpl8iLCBakdRo`
        } else if (key == 204179735) {
            sercetKey = `UhmsX3xStU4vrGHGYtqEXahtkYuQncMf`
        }
        const hmacSha256 = crypto.createHmac('sha256', sercetKey);
        hmacSha256.update(ee);
        const encryptedData = hmacSha256.digest();
        return encryptedData.toString('base64');
    }

    // UUID生成
    generateUUID() {
        const alphanumeric = "0123456789abcdef";
        const sections = [8, 4, 4, 4, 12];
        let uuid = "";
        for (let i = 0; i < sections.length; i++) {
            for (let j = 0; j < sections[i]; j++) {
                uuid += alphanumeric[Math.floor(Math.random() * alphanumeric.length)];
            }
            if (i !== sections.length - 1) {
                uuid += "-";
            }
        }
        return uuid;
    }

    // Post请求构建
    getPostHeader(key, path, body) {
        const crypto = require('crypto');
        function calculateContentMD5(requestBody) {
            const byteArray = Buffer.from(requestBody, 'utf8');
            const md5Digest = crypto.createHash('md5').update(byteArray).digest();
            const md5Base64 = md5Digest.toString('base64');
            return md5Base64;
        }
        let currentDate = new Date();
        let formattedDate = this.formatDate(currentDate, 0);
        let parts = formattedDate.split(" ");
        formattedDate = `${parts[0]}, ${parts[2]} ${parts[1]} ${parts[3]} ${parts[4]} GMT`;
        let date = new Date(formattedDate)
        let timestamp = date.getTime();
        let content_md5 = calculateContentMD5(body);
        let uuid = this.generateUUID();
        let signature = this.calculateHmacSha256("POST", "application/json; charset=utf-8", content_md5, "application/json; charset=utf-8", formattedDate, key, uuid, timestamp, path)
        let headers = {
            'date': formattedDate,
            'x-ca-signature': signature,
            'x-ca-appcode': 'SWGeelyCode',
            'x-ca-nonce': uuid,
            'x-ca-key': key,
            'ca_version': 1,
            'accept': 'application/json; charset=utf-8',
            'usetoken': 1,
            'content-md5': content_md5,
            'x-ca-timestamp': timestamp,
            'x-ca-signature-headers': 'x-ca-nonce,x-ca-timestamp,x-ca-key',
            'x-refresh-token': true,
            'user-agent': 'ALIYUN-ANDROID-UA',
            'token': this.token,
            'deviceSN': this.deviceSN,
            'txCookie': '',
            'appId': 'galaxy-app',
            'appVersion': '1.27.0',
            'platform': 'Android',
            'Cache-Control': 'no-cache',
            'sweet_security_info': '{"appVersion":"1.27.0","platform":"android"}' ,
            'methodtype': '6',
            'contenttype': 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
           'Content-Length': '87',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip',
        }
        if (key == 204179735) {
            headers["usetoken"] = true
            headers["host"] = `galaxy-user-api.geely.com`
            delete headers["x-refresh-token"]
            headers["taenantid"] = 569001701001
            headers["svcsid"] = ""
        } else {
            headers["usetoken"] = 1
            headers["host"] = `galaxy-app.geely.com`
            headers["x-refresh-token"] = true
        }
        return headers;
    }

    // Get请求构建
    getGetHeader(key, path) {
        let currentDate = new Date();
        let formattedDate = this.formatDate(currentDate, 0);
        let parts = formattedDate.split(" ");
        formattedDate = `${parts[0]}, ${parts[2]} ${parts[1]} ${parts[3]} ${parts[4]} GMT`;
        let date = new Date(formattedDate)
        let timestamp = date.getTime();
        let uuid = this.generateUUID();
        let signature = this.calculateHmacSha256("GET", "application/json; charset=utf-8", "", "application/x-www-form-urlencoded; charset=utf-8", formattedDate, key, uuid, timestamp, path)
        let headers = {
            'date': formattedDate,
            'x-ca-signature': signature,
            'x-ca-nonce': uuid,
            'x-ca-key': key,
            'ca_version': 1,
            'accept': 'application/json; charset=utf-8',
            'usetoken': 1,
            'x-ca-timestamp': timestamp,
            'x-ca-signature-headers': 'x-ca-nonce,x-ca-timestamp,x-ca-key',
            'x-refresh-token': true,
            'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
            'user-agent': 'ALIYUN-ANDROID-UA',
            'token': this.token,
            'deviceSN': this.deviceSN,
            'txCookie': '',
            'appId': 'galaxy-app',
            'appVersion': '1.27.0',
            'platform': 'Android',
            'Cache-Control': 'no-cache',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip',
        }
        if (key == 204179735) {
            headers["usetoken"] = true
            headers["host"] = `galaxy-user-api.geely.com`
            delete headers["x-refresh-token"]
            headers["taenantid"] = 569001701001
            headers["svcsid"] = ""
        } else {
            headers["usetoken"] = 1
            headers["host"] = `galaxy-app.geely.com`
            headers["x-refresh-token"] = true
        }
        return headers
    }

    // 刷新Key函数
    async refresh_token() {
        try {
            let options = {
                url: `https://galaxy-user-api.geely.com/api/v1/login/refresh?refreshToken=${this.refreshToken}`,
                headers: this.getGetHeader(204179735, `/api/v1/login/refresh?refreshToken=${this.refreshToken}`),
            },
                result = await httpRequest(options);
            if (result.code == 'success') {
                console.log(`✅${result.message}: ${result.data.centerTokenDto.token} \n🆗刷新KEY:${result.data.centerTokenDto.refreshToken}`);
                this.ckStatus = true;
                this.token = result.data.centerTokenDto.token
            } else {
                $.DoubleLog(`❌ ${result.message}`);
                this.ckStatus = false;
                console.log(result);
                Notify = 1;
            }
        } catch (e) {
            console.log(e)
        }
    }

    //签到状态查询函数
    async signstate() {
        try {
            let options = {
                url: `https://galaxy-app.geely.com/app/v1/sign/state`,
                headers: this.getGetHeader(204453306, `/app/v1/sign/state`),
            };

            let result = await httpRequest(options);

            if (result.code == 0) {
                if (result.data === true) {
                    $.DoubleLog(`✅今日已经签到啦！`);
                    return true;
                } else {
                    return false;
                }
            } else {
                $.DoubleLog(`❌查询签到状态失败！`);
                console.log("⚠️失败原因:", result);
                Notify = 1;
                return false;
            }
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    //签到函数
    async sign() {
        try {
            const hasSignedToday = await this.signstate();
            if (hasSignedToday) {
                await this.points();
                return;
            }

            const body = {
                "signType": 0
            };

            let options = {
                url: `https://galaxy-app.geely.com/app/v1/sign/add`,
                headers: this.getPostHeader(204453306, `/app/v1/sign/add`, JSON.stringify(body)),
                body: JSON.stringify(body)
            };

            let result = await httpRequest(options);
            
            if (result.code == 0) {
                $.DoubleLog(`✅签到成功！`);
                await this.points();
                Notify = 1;
            } else {
                $.DoubleLog(`❌签到失败！`);
                console.log("⚠️失败原因:", result);
                Notify = 1;
            }
        } catch (e) {
            console.log(e);
        }
    }

    //查询积分函数
    async points() {
        try {
            let options = {
                url: `https://galaxy-app.geely.com/h5/v1/points/get`,
                headers: this.getGetHeader(204453306, `/h5/v1/points/get`),
            },
                result = await httpRequest(options);
            if (result.code == 0) {
                $.DoubleLog(`✅剩余积分: ${result.data.availablePoints}`);
            } else {
                $.DoubleLog(`❌剩余积分查询: 失败`);
                console.log(result);
                Notify = 1;
            }
        } catch (e) {
            console.log(e);
        }
    }
}

// 变量检查与处理
!(async () => {
    const userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || "";
    if (!userCookie) {
        console.log("未找到CK");
        return;
    }
    const user = new UserInfo(userCookie);
    await user.refresh_token();
    if (user.ckStatus) {
        await user.sign();
    } else {
        $.DoubleLog(`❌账号CK失效`);
    }
    await $.SendMsg(msg);
})().catch((e) => console.log(e)).finally(() => $.done());

// ==================== API ==================== // 
function httpRequest(options, method = null) {
    method = options.method ? options.method.toLowerCase() : options.body ? "post" : "get";
    return new Promise((resolve) => {
        $[method](options, (err, resp, data) => {
            if (err) {
                console.log(`${method}请求失败`);
                $.logErr(err);
            } else {
                if (data) {
                    try { data = JSON.parse(data); } catch (error) { }
                    resolve(data);
                } else {
                    console.log(`请求api返回数据为空，请检查自身原因`);
                }
            }
            resolve();
        });
    });
}

function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return ("POST" === e && (s = this.post), new Promise((e, a) => { s.call(this, t, (t, s, r) => { t ? a(t) : e(s) }) })) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new (class { constructor(t, e) { this.userList = []; this.userIdx = 0; (this.name = t), (this.http = new s(this)), (this.data = null), (this.dataFile = "box.dat"), (this.logs = []), (this.isMute = !1), (this.isNeedRewrite = !1), (this.logSeparator = "\n"), (this.encoding = "utf-8"), (this.startTime = new Date().getTime()), Object.assign(this, e), this.log("", `🔔${this.name},开始!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const a = this.getdata(t); if (a) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise((e) => { this.get({ url: t }, (t, s, a) => e(a)) }) } runScript(t, e) { return new Promise((s) => { let a = this.getdata("@chavy_boxjs_userCfgs.httpapi"); a = a ? a.replace(/\n/g, "").trim() : a; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); (r = r ? 1 * r : 20), (r = e && e.timeout ? e.timeout : r); const [i, o] = a.split("@"), n = { url: `http:// ${o}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": i, Accept: "*/*" }, timeout: r, }; this.post(n, (t, e, a) => s(a)) }).catch((t) => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e); if (!s && !a) return {}; { const a = s ? t : e; try { return JSON.parse(this.fs.readFileSync(a)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : a ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const a = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of a) if (((r = Object(r)[t]), void 0 === r)) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), (e.slice(0, -1).reduce((t, s, a) => Object(t[s]) === t[s] ? t[s] : (t[s] = Math.abs(e[a + 1]) >> 0 == +e[a + 1] ? [] : {}), t)[e[e.length - 1]] = s), t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, a] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, a, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, a, r] = /^@(.*?)\.(.*?)$/.exec(e), i = this.getval(a), o = a ? ("null" === i ? null : i || "{}") : "{}"; try { const e = JSON.parse(o); this.lodash_set(e, r, t), (s = this.setval(JSON.stringify(e), a)) } catch (e) { const i = {}; this.lodash_set(i, r, t), (s = this.setval(JSON.stringify(i), a)) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return (this.data = this.loaddata()), this.data[t]; default: return (this.data && this.data[t]) || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return ((this.data = this.loaddata()), (this.data[e] = t), this.writedata(), !0); default: return (this.data && this.data[e]) || null } } initGotEnv(t) { (this.got = this.got ? this.got : require("got")), (this.cktough = this.cktough ? this.cktough : require("tough-cookie")), (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()), t && ((t.headers = t.headers ? t.headers : {}), void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = () => { }) { switch ((t.headers && (delete t.headers[""]), this.getEnv())) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && ((t.headers = t.headers || {}), Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, a) => { !t && s && ((s.body = a), (s.statusCode = s.status ? s.status : s.statusCode), (s.status = s.statusCode)), e(t, s, a) }); break; case "Quantumult X": this.isNeedRewrite && ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t) => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o, } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o, }, i, o) }, (t) => e((t && t.error) || "UndefinedError")); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), (e.cookieJar = this.ckjar) } } catch (t) { this.logErr(t) } }).then((t) => { const { statusCode: a, statusCode: r, headers: i, rawBody: o, } = t, n = s.decode(o, this.encoding); e(null, { status: a, statusCode: r, headers: i, rawBody: o, body: n, }, n) }, (t) => { const { message: a, response: r } = t; e(a, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = () => { }) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch ((t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), this.getEnv())) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && ((t.headers = t.headers || {}), Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, a) => { !t && s && ((s.body = a), (s.statusCode = s.status ? s.status : s.statusCode), (s.status = s.statusCode)), e(t, s, a) }); break; case "Quantumult X": (t.method = s), this.isNeedRewrite && ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t) => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o, } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o, }, i, o) }, (t) => e((t && t.error) || "UndefinedError")); break; case "Node.js": let a = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...i } = t; this.got[s](r, i).then((t) => { const { statusCode: s, statusCode: r, headers: i, rawBody: o, } = t, n = a.decode(o, this.encoding); e(null, { status: s, statusCode: r, headers: i, rawBody: o, body: n }, n) }, (t) => { const { message: s, response: r } = t; e(s, r, r && a.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date(); let a = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in a) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? a[e] : ("00" + a[e]).substr(("" + a[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let a = t[s]; null != a && "" !== a && ("object" == typeof a && (a = JSON.stringify(a)), (e += `${s}=${a}&`)) } return (e = e.substring(0, e.length - 1)), e } msg(e = t, s = "", a = "", r) { const i = (t) => { switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } case "Loon": { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } case "Quantumult X": { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, a = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": a, } } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, a, i(r)); break; case "Quantumult X": $notify(e, s, a, i(r)); break; case "Node.js": }if (!this.isMuteLog) { let t = ["", "==============📣系统通知📣==============",]; t.push(e), s && t.push(s), a && t.push(a), console.log(t.join("\n")), (this.logs = this.logs.concat(t)) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `❗️${this.name},错误!`, t); break; case "Node.js": this.log("", `❗️${this.name},错误!`, t.stack) } } wait(t) { return new Promise((e) => setTimeout(e, t)) } DoubleLog(d) { if (this.isNode()) { if (d) { console.log(`${d}`); msg += `\n ${d}` } } else { console.log(`${d}`); msg += `\n ${d}` } } async SendMsg(m) { if (!m) return; if (Notify > 0) { if (this.isNode()) { var notify = require("./sendNotify"); await notify.sendNotify(this.name, m) } else { this.msg(this.name, "", m) } } else { console.log(m) } } done(t = {}) { const e = new Date().getTime(), s = (e - this.startTime) / 1e3; switch ((this.log("", `🔔${this.name},结束!🕛${s}秒`), this.log(), this.getEnv())) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } })(t, e) }
// Env rewrite:smallfawn Update-time:23-6-30 newAdd:DoubleLog & SendMsg
