/**
 * 书亦烧仙草
 * cron 11 8 * * *  sysxc.js
 * 23/04/15 内部使用
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export sysxc_data='auth'
 * 
 * 多账号用  @ 分割
 * 抓包 https://scrm-prod.shuyi.org.cn , 找到 headrs中的auth 即可
 * author : TencentGroupCode 862839604
 * GitHub : https://github.com/smallfawn/QLScriptPublic
 * 制作不易请大家给Github仓库点点star
 * ====================================
 *   
 */



const $ = new Env("书亦烧仙草");
const ckName = "sysxc_data";
//-------------------- 一般不动变量区域 -------------------------------------
const Notify = 1;         //0为关闭通知,1为打开通知,默认为1
const notify = $.isNode() ? require('./sendNotify') : '';
let envSplitor = ["@"]; //多账号分隔符
let msg = '';       //let ck,msg
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
//---------------------- 自定义变量区域 -----------------------------------
const crypto = require('crypto');
//---------------------------------------------------------

async function start() {

    await notice()
    console.log('\n================== 用户信息 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            taskall.push(await user.getVcode());
            await $.wait(1000); //延迟  1秒  可充分利用 $.环境函数
        }
    }
    await Promise.all(taskall);



}


class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split('&')[0]; //单账号多变量分隔符
        //let ck = str.split('&')
        //this.data1 = ck[0]
        this.ckStatus = true
        this.timestamp = ts13()
        this.signInStatus = ''//签到状态
        this.getVcodeStatus = ''//HK 获取状态
        this.checkVcodeStatus = ''//HK 验证状态

    }

    async getVcode() {
        try {
            let VcodeKey = '', VcodeToken = '', tg = '', bg = '', data = '', ocrRes = '', d = '', aesStr = '', aesRes = '', checkRes = '', aesStrStar = ''
            let options = {
                url: 'https://scrm-prod.shuyi.org.cn/saas-gateway/api/agg-trade/v1/signIn/getVCode',
                headers: {
                    'Host': 'scrm-prod.shuyi.org.cn',
                    'Connection': 'keep-alive',
                    'charset': 'utf-8',
                    'auth': this.ck,
                    'sessionkey': '',
                    'channel': 'wechat_micro',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.5304.141 Mobile Safari/537.36 XWEB/5023 MMWEBSDK/20221206 MMWEBID/2585 MicroMessenger/8.0.32.2300(0x2800205D) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android',
                    'terminal-code': 'member_wechat_micro',
                    'releaseversion': '2023411',
                    'hostname': 'scrm-prod.shuyi.org.cn',
                    'httpt-taceid': '',
                    'Content-Type': 'application/json',
                    'channelid': '',
                    'Referer': 'https://servicewechat.com/wxa778c3d895442625/287/page-frame.html'
                },
                body: JSON.stringify({
                    captchaType: 'blockPuzzle',
                    clientUid: 'slider-f55cf63d-2806-460a-a57f-5d0d7b56a0c0',
                    ts: this.timestamp
                })
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.resultCode == '0000') {
                VcodeToken = result.data.token
                VcodeKey = result.data.secretKey
                bg = result.data.originalImageBase64
                tg = result.data.jigsawImageBase64
                data = JSON.stringify({ "target_img": tg, "bg_img": bg })
                data = base64_encode(data) //B64编码
                //data = base64_decode(data)
                //console.log(data);
                ocrRes = await ocr('/slide/match/b64/json', data)
                //console.log(ocrRes);
                d = ocrRes.result.target[0]
                //console.log(`滑动距离${d}`);
                aesStr = JSON.stringify({ "x": d, "y": 5 }).toString()
                aesStrStar = `{"x": ${d}, "y": 5}`
                aesStr = aesStr.replace(/\ +/g, "");
                //console.log(`加密前${aesStr}`);
                //AES的ECB模式加密方法
                aesRes = aesEncrypt(VcodeKey, aesStr)
                aesRes = aesRes.substring(0, 22)
                aesRes += '=='
                //console.log(`加密后${aesRes}`);
                //console.log(VcodeKey);
                for (let i = 0; i < 10; i++) {
                    checkRes = await this.checkVcode(aesRes, VcodeToken, VcodeKey, aesStrStar)
                    if (checkRes == '0') {
                        return
                    }
                }

            } else {
                DoubleLog(`账号[${this.index}]获取失败了呢`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async checkVcode(pointJson, VcodeToken, VcodeKey, aesStrStar) {
        try {
            let options = {
                url: 'https://scrm-prod.shuyi.org.cn/saas-gateway/api/agg-trade/v1/signIn/checkVCode',
                headers: {
                    Host: 'scrm-prod.shuyi.org.cn',
                    Connection: 'keep-alive',
                    charset: 'utf-8',
                    auth: this.ck,
                    sessionkey: '',
                    channel: 'wechat_micro',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.5304.141 Mobile Safari/537.36 XWEB/5023 MMWEBSDK/20221206 MMWEBID/2585 MicroMessenger/8.0.32.2300(0x2800205D) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android',
                    'terminal-code': 'member_wechat_micro',
                    releaseversion: '2023411',
                    hostname: 'scrm-prod.shuyi.org.cn',
                    'httpt-taceid': '',
                    'Content-Type': 'application/json',
                    channelid: '',
                    Referer: 'https://servicewechat.com/wxa778c3d895442625/287/page-frame.html'
                },
                body: JSON.stringify({
                    "captchaType": "blockPuzzle",
                    "pointJson": pointJson,
                    "token": VcodeToken
                })
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.resultCode == '0000') {
                //console.log(result);
                DoubleLog(`账号[${this.index}]验证成功`);

                let SignInParams = VcodeToken + '---' + aesStrStar
                SignInParams = SignInParams.replace(/\ +/g, "");
                //console.log(SignInParams);

                let abc = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
                for (let a in abc) {
                    let SignInpointJson = aesEncrypt(VcodeKey, SignInParams)
                    SignInpointJson = SignInpointJson.substring(0, 85)
                    SignInpointJson += abc[a]
                    //console.log(SignInpointJson);
                    SignInpointJson += '=='
                    //console.log(SignInpointJson);
                    let res = await this.SignIn(SignInpointJson)
                    if (res == '0') {
                        //console.log(`签到成功`);
                        return '0'
                    }
                }
                DoubleLog(`账号[${this.index}]签到结束`);
                //console.log(aesDecrypt(key, aesEncrypt(VcodeKey, SignInParams)));
                return '0'
            } else {
                //console.log(result);
                DoubleLog(`账号[${this.index}]验证失败`);
                return '1'
            }
        } catch (e) {
            console.log(e);
        }
    }
    async SignIn(SignInpointJson) {
        try {
            let options = {
                url: 'https://scrm-prod.shuyi.org.cn/saas-gateway/api/agg-trade/v1/signIn/insertSignInV3',
                headers: {
                    Host: 'scrm-prod.shuyi.org.cn',
                    //Connection: 'keep-alive',
                    //charset: 'utf-8',
                    auth: this.ck,
                    //sessionkey: '',
                    //channel: 'wechat_micro',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.5304.141 Mobile Safari/537.36 XWEB/5023 MMWEBSDK/20221206 MMWEBID/2585 MicroMessenger/8.0.32.2300(0x2800205D) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android',
                    //'terminal-code': 'member_wechat_micro',
                    //'sessionKey': '',
                    //releaseversion: '2023411',
                    hostname: 'scrm-prod.shuyi.org.cn',
                    //'httpt-taceid': '',
                    'Content-Type': 'application/json',
                    //channelid: '',
                    //Referer: 'https://servicewechat.com/wxa778c3d895442625/287/page-frame.html'
                },
                body: JSON.stringify({
                    "captchaVerification": SignInpointJson
                })
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.resultCode == '0') {
                //console.log(result);
                DoubleLog(`账号[${this.index}]签到成功啦`);
                return '0'
            } else {
                await $.wait(2000)
                return '1'
                //console.log(result);
                //console.log(`签到失败`);
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
function httpRequest(options, method) {
    typeof (method) === 'undefined' ? ('body' in options ? method = 'post' : method = 'get') : method = method
    return new Promise((resolve) => {
        $[method](options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${method}请求失败`);
                    $.logErr(err);
                    //throw new Error(err);
                    //console.log(err);
                } else {
                    //httpResult = data;
                    //httpResponse = resp;
                    if (data) {
                        //console.log(data);
                        typeof JSON.parse(data) == 'object' ? data = JSON.parse(data) : data = data
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
/**
 * 时间戳 13位
 */
function ts13() {
    return Math.round(new Date().getTime()).toString();
}
/**
 * base64 编码  
 */
function base64_encode(data) {
    let a = Buffer.from(data, 'utf-8').toString('base64')
    return a
}

/**
 * base64 解码  
 */
function base64_decode(data) {
    let a = Buffer.from(data, 'base64').toString('utf8')
    return a
}
async function notice() {
    try {
        let options = {
            url: `https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/api/main/notice.json`,
            headers: {
                'User-Agent': ''
            },
        }
        //console.log(options);
        let result = await httpRequest(options);
        //console.log(result);
        if (result) {
            if ('notice' in result) {
                DoubleLog(`${result.notice}`);
            } else {
                options.url = `https://gitee.com/smallfawn/api/raw/master/notice.json`
                result = await httpRequest(options);
                if ('notice' in result) {
                    DoubleLog(`${result.notice}`);
                }
            }
        } else {
        }
    } catch (e) {
        console.log(e);
    }
}
async function ocr(path, data) {
    try {
        let options = {
            url: `http://ocr.onecc.cc${path}`,
            headers: {
            },
            body: `${data}`
        }
        //console.log(options);
        let result = await httpRequest(options);
        //console.log(result);
        if (result) {
            return result
        } else {
        }
    } catch (e) {
        console.log(e);
    }
}

const BLOCK_SIZE = 16;

function pad(text) {
    const padding = BLOCK_SIZE - text.length % BLOCK_SIZE;
    return text + String.fromCharCode(padding).repeat(padding);
}

function unpad(text) {
    const padding = text.charCodeAt(text.length - 1);
    return text.slice(0, text.length - padding);
}

function aesEncrypt(key, data) {
    const cipher = crypto.createCipheriv('aes-128-ecb', key, '');
    let encrypted = cipher.update(pad(data), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}
async function hitokoto() { // 随机一言
    try {
        let options = {
            url: 'https://v1.hitokoto.cn/',
            headers: {}
        };
        //console.log(options);
        let result = await httpRequest(options);
        //console.log(result);
        return result.hitokoto
    } catch (error) {
        console.log(error);
    }
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
