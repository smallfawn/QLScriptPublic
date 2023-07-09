/**
 * 青碳行
 * cron 9 5 * * *  qtx.js
 * 2023/04/12
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export qtxtk='token&deviceCoding'
 * 
 * 多账号用 换行 或 @ 分割
 * 抓包 carbon.lcago.cn 这个域名 请求体 的body部分的 token 和 deviceCoding
 * ====================================
 *   
 */



const $ = new Env("青碳行");
const ckName = "qtxtk";
//-------------------- 一般不动变量区域 -------------------------------------
const Notify = 1;		 //0为关闭通知,1为打开通知,默认为1
const notify = $.isNode() ? require('./sendNotify') : '';
let envSplitor = ["@"]; //多账号分隔符
let msg;//声明通知变量
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
//---------------------- 自定义变量区域 -----------------------------------
//---------------------------------------------------------

async function start() {
    await getNotice()
    console.log('\n============= 用户CK有效性验证 =============\n');
    taskall = [];
    for (let user of userList) {
        console.log(`随机延迟${user.getRandomTime()}ms`);
        taskall.push(await user.user_info());
        await $.wait(user.getRandomTime()); //延迟  1秒  可充分利用 $.环境函数
    }
    await Promise.all(taskall);
    console.log('\n================== 任务 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            console.log(`随机延迟${user.getRandomTime()}ms`);
            taskall.push(await user.task_signIn());
            await $.wait(user.getRandomTime());
            taskall.push(await user.get_question());
            await $.wait(user.getRandomTime());
            taskall.push(await user.do_question());
            await $.wait(user.getRandomTime());
            taskall.push(await user.get_cal());
            await $.wait(user.getRandomTime());
            if (user.calIdArr.length !== 0) {
                console.log(`未收取精力列表${user.calIdArr}`);
            }
            for (let l = 0; l < user.calIdArr.length; l++) {
                taskall.push(await user.do_cal(user.calIdArr[l]));
                await $.wait(user.getRandomTime());
            }

        }
    }
    await Promise.all(taskall);




}


class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split('&')[0];
        this.deviceCoding = str.split('&')[1];
        //let ck = str.split('&')
        //this.data1 = ck[0]
        this.ckStatus = true
        this.questionId = ''
        this.answer = ''
        this.calIdArr = []
        this.headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Host': 'carbon.lcago.cn',
            'Connection': 'Keep-Alive',
            //'Accept-Encoding': 'gzip',
            'User-Agent': 'okhttp/3.12.'
        }



    }

    getRandomTime() {
        return randomInt(3000, 9000)
    }
    async user_info() {//userinfo
        try {
            let options = {
                url: `https://carbon.lcago.cn/myCarbonAssets/myData`,
                headers: this.headers,
                body: `{"token":"${this.ck}","platform":"android","model":"MI8SE","version":"1.1.1_VersionCode_111","deviceCoding":"${this.deviceCoding}","language":"ZH","systemversion":"10"}`
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.respcod == '01') {
                DoubleLog(`\n账号[${this.index}] 可兑换余额为：${result.data.exchangeAmt}`)
            } else {
                DoubleLog(`账号[${this.index}]  获取失效,原因未知！`);
                console.log(result);
                this.ckStatus = false
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_signIn() {//userinfo
        try {
            let options = {
                url: `https://carbon.lcago.cn/signIn/sign`,
                headers: this.headers,
                body: `{"token":"${this.ck}","platform":"android","model":"MI8","appChannel":"qtx","version":"1.3.3_VersionCode_111","deviceCoding":"${this.deviceCoding}","language":"ZH","systemversion":"10"}`

            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.respcod == '01') {
                DoubleLog(`账号[${this.index}]  签到成功`);
            } else if (result.respcod == '02') {
                DoubleLog(`账号[${this.index}]  今日已签到`);
            } else {
                DoubleLog(`账号[${this.index}]  签到失效,原因未知！`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async get_question() {//获取答题
        try {
            let options = {
                url: `https://carbon.lcago.cn/community/requestQuestion`,
                headers: this.headers,
                body: `{"token":"${this.ck}","deviceCoding":"${this.deviceCoding}","taskId":"EHD8472JSDS","channel":"qtx"}`

            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.respcod == '01') {
                DoubleLog(`账号[${this.index}]  获取问题成功: [${result.data.dataList[0].id}] [${result.data.dataList[0].questionTitle}] [${result.data.dataList[0].questionOptions}]`);
                DoubleLog(`获取答案:[${result.data.dataList[0].answer}]`);

                this.questionId = result.data.dataList[0].id;
                this.answer = result.data.dataList[0].answer
            } else {
                DoubleLog(`账号[${this.index}]  获取问题失效,原因未知！`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async do_question() {//答题
        try {
            let options = {
                url: `https://carbon.lcago.cn/community/answerQuestion`,
                headers: this.headers,
                body: `{"token":"${this.ck}","deviceCoding":"${this.deviceCoding}","questionId":"${this.questionId}","answer":"${this.answer}"}`

            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.respcod == '01') {
                DoubleLog(`账号[${this.index}]  答题成功:[${this.questionId}]`);
            } else if (result.respcod == '02') {
                DoubleLog(`题目已提交`);

            } else {
                DoubleLog(`账号[${this.index}]  答题失效,原因未知！`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async get_cal() {//获取精力
        try {
            let options = {
                url: `https://carbon.lcago.cn/interact/data`,
                headers: this.headers,
                body: `{"token":"${this.ck}","platform":"android","model":"MI8Lite","appChannel":"qtx","version":"1.3.3_VersionCode_133","deviceCoding":"${this.deviceCoding}","language":"ZH","systemversion":"10"}`

            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.respcod == '01') {
                if (result.data.dataList.length != 0) {
                    for (let i = 0; i < result.data.dataList.length; i++) {
                        this.calIdArr[i] = result.data.dataList[i].id;
                        //console.log(`未收取精力ID为${this.calIdArr[i]}`);
                    }
                }
                else { console.log("无未收取的精力") }
            } else {
                DoubleLog(`账号[${this.index}]  获取精力失效,原因未知！`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async do_cal(calId) {//收取精力
        try {
            let options = {
                url: `https://carbon.lcago.cn/interact/collect`,
                headers: this.headers,
                body: `{"token":"${this.ck}","platform":"android","model":"MI8Lite","appChannel":"qtx","version":"1.3.3_VersionCode_133","deviceCoding":"${this.deviceCoding}","language":"ZH","systemversion":"10","id":"${calId}"}`
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.respcod == '01') {
                DoubleLog(`账号[${this.index}]  收取精力成功`);
            } else {
                DoubleLog(`账号[${this.index}]  收取精力失效,原因未知！`);
                console.log(result);
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
 * 获取远程版本
 */
function getVersion(scriptUrl, timeout = 3 * 1000) {
    return new Promise((resolve) => {
        const options = { url: `https://fastly.jsdelivr.net/gh/${scriptUrl}` };
        $.get(options, (err, resp, data) => {
            try {
                const regex = /scriptVersionNow\s*=\s*(["'`])([\d.]+)\1/;
                const match = data.match(regex);
                const scriptVersionLatest = match ? match[2] : "";
                console.log(`\n====== 当前版本：${scriptVersionNow} 📌 最新版本：${scriptVersionLatest} ======`);
            } catch (e) {
                $.logErr(e, resp);
            }
            resolve();
        }, timeout);
    });
}
/**
 * 获取远程通知
 */
async function getNotice() {
    try {
        const urls = [
            "https://fastly.jsdelivr.net/gh/smallfawn/Note@main/Notice.json",
            "https://gcore.jsdelivr.net/gh/smallfawn/Note@main/Notice.json",
            "https://cdn.jsdelivr.net/gh/smallfawn/Note@main/Notice.json",
            "https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/Note/main/Notice.json",
            "https://gitee.com/smallfawn/Note/raw/master/Notice.json",
        ];
        let notice = null;
        for (const url of urls) {
            const options = { url, headers: { "User-Agent": "" }, };
            const result = await httpRequest(options);
            if (result && "notice" in result) {
                notice = result.notice.replace(/\\n/g, "\n");
                break;
            }
        }
        if (notice) { $.DoubleLog(notice); }
    } catch (e) {
        console.log(e);
    }
}
function ts13() {
    return Math.round(new Date().getTime()).toString();
}
/**
 * 随机整数生成
 */
function randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
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
function MD5Encrypt(a) { function b(a, b) { return a << b | a >>> 32 - b } function c(a, b) { var c, d, e, f, g; return e = 2147483648 & a, f = 2147483648 & b, c = 1073741824 & a, d = 1073741824 & b, g = (1073741823 & a) + (1073741823 & b), c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f : g ^ e ^ f } function d(a, b, c) { return a & b | ~a & c } function e(a, b, c) { return a & c | b & ~c } function f(a, b, c) { return a ^ b ^ c } function g(a, b, c) { return b ^ (a | ~c) } function h(a, e, f, g, h, i, j) { return a = c(a, c(c(d(e, f, g), h), j)), c(b(a, i), e) } function i(a, d, f, g, h, i, j) { return a = c(a, c(c(e(d, f, g), h), j)), c(b(a, i), d) } function j(a, d, e, g, h, i, j) { return a = c(a, c(c(f(d, e, g), h), j)), c(b(a, i), d) } function k(a, d, e, f, h, i, j) { return a = c(a, c(c(g(d, e, f), h), j)), c(b(a, i), d) } function l(a) { for (var b, c = a.length, d = c + 8, e = (d - d % 64) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i = 0; c > i;)b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | a.charCodeAt(i) << h, i++; return b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | 128 << h, g[f - 2] = c << 3, g[f - 1] = c >>> 29, g } function m(a) { var b, c, d = "", e = ""; for (c = 0; 3 >= c; c++)b = a >>> 8 * c & 255, e = "0" + b.toString(16), d += e.substr(e.length - 2, 2); return d } function n(a) { a = a.replace(/\r\n/g, "\n"); for (var b = "", c = 0; c < a.length; c++) { var d = a.charCodeAt(c); 128 > d ? b += String.fromCharCode(d) : d > 127 && 2048 > d ? (b += String.fromCharCode(d >> 6 | 192), b += String.fromCharCode(63 & d | 128)) : (b += String.fromCharCode(d >> 12 | 224), b += String.fromCharCode(d >> 6 & 63 | 128), b += String.fromCharCode(63 & d | 128)) } return b } var o, p, q, r, s, t, u, v, w, x = [], y = 7, z = 12, A = 17, B = 22, C = 5, D = 9, E = 14, F = 20, G = 4, H = 11, I = 16, J = 23, K = 6, L = 10, M = 15, N = 21; for (a = n(a), x = l(a), t = 1732584193, u = 4023233417, v = 2562383102, w = 271733878, o = 0; o < x.length; o += 16)p = t, q = u, r = v, s = w, t = h(t, u, v, w, x[o + 0], y, 3614090360), w = h(w, t, u, v, x[o + 1], z, 3905402710), v = h(v, w, t, u, x[o + 2], A, 606105819), u = h(u, v, w, t, x[o + 3], B, 3250441966), t = h(t, u, v, w, x[o + 4], y, 4118548399), w = h(w, t, u, v, x[o + 5], z, 1200080426), v = h(v, w, t, u, x[o + 6], A, 2821735955), u = h(u, v, w, t, x[o + 7], B, 4249261313), t = h(t, u, v, w, x[o + 8], y, 1770035416), w = h(w, t, u, v, x[o + 9], z, 2336552879), v = h(v, w, t, u, x[o + 10], A, 4294925233), u = h(u, v, w, t, x[o + 11], B, 2304563134), t = h(t, u, v, w, x[o + 12], y, 1804603682), w = h(w, t, u, v, x[o + 13], z, 4254626195), v = h(v, w, t, u, x[o + 14], A, 2792965006), u = h(u, v, w, t, x[o + 15], B, 1236535329), t = i(t, u, v, w, x[o + 1], C, 4129170786), w = i(w, t, u, v, x[o + 6], D, 3225465664), v = i(v, w, t, u, x[o + 11], E, 643717713), u = i(u, v, w, t, x[o + 0], F, 3921069994), t = i(t, u, v, w, x[o + 5], C, 3593408605), w = i(w, t, u, v, x[o + 10], D, 38016083), v = i(v, w, t, u, x[o + 15], E, 3634488961), u = i(u, v, w, t, x[o + 4], F, 3889429448), t = i(t, u, v, w, x[o + 9], C, 568446438), w = i(w, t, u, v, x[o + 14], D, 3275163606), v = i(v, w, t, u, x[o + 3], E, 4107603335), u = i(u, v, w, t, x[o + 8], F, 1163531501), t = i(t, u, v, w, x[o + 13], C, 2850285829), w = i(w, t, u, v, x[o + 2], D, 4243563512), v = i(v, w, t, u, x[o + 7], E, 1735328473), u = i(u, v, w, t, x[o + 12], F, 2368359562), t = j(t, u, v, w, x[o + 5], G, 4294588738), w = j(w, t, u, v, x[o + 8], H, 2272392833), v = j(v, w, t, u, x[o + 11], I, 1839030562), u = j(u, v, w, t, x[o + 14], J, 4259657740), t = j(t, u, v, w, x[o + 1], G, 2763975236), w = j(w, t, u, v, x[o + 4], H, 1272893353), v = j(v, w, t, u, x[o + 7], I, 4139469664), u = j(u, v, w, t, x[o + 10], J, 3200236656), t = j(t, u, v, w, x[o + 13], G, 681279174), w = j(w, t, u, v, x[o + 0], H, 3936430074), v = j(v, w, t, u, x[o + 3], I, 3572445317), u = j(u, v, w, t, x[o + 6], J, 76029189), t = j(t, u, v, w, x[o + 9], G, 3654602809), w = j(w, t, u, v, x[o + 12], H, 3873151461), v = j(v, w, t, u, x[o + 15], I, 530742520), u = j(u, v, w, t, x[o + 2], J, 3299628645), t = k(t, u, v, w, x[o + 0], K, 4096336452), w = k(w, t, u, v, x[o + 7], L, 1126891415), v = k(v, w, t, u, x[o + 14], M, 2878612391), u = k(u, v, w, t, x[o + 5], N, 4237533241), t = k(t, u, v, w, x[o + 12], K, 1700485571), w = k(w, t, u, v, x[o + 3], L, 2399980690), v = k(v, w, t, u, x[o + 10], M, 4293915773), u = k(u, v, w, t, x[o + 1], N, 2240044497), t = k(t, u, v, w, x[o + 8], K, 1873313359), w = k(w, t, u, v, x[o + 15], L, 4264355552), v = k(v, w, t, u, x[o + 6], M, 2734768916), u = k(u, v, w, t, x[o + 13], N, 1309151649), t = k(t, u, v, w, x[o + 4], K, 4149444226), w = k(w, t, u, v, x[o + 11], L, 3174756917), v = k(v, w, t, u, x[o + 2], M, 718787259), u = k(u, v, w, t, x[o + 9], N, 3951481745), t = c(t, p), u = c(u, q), v = c(v, r), w = c(w, s); var O = m(t) + m(u) + m(v) + m(w); return O.toLowerCase() }

// 完整 Env
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
