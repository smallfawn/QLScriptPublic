/**
 * 广汽丰田
 * cron 10 12 * * *  gqft.js
 * 23/01/23 积分任务：
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export gqft_data='Authorization&deviceId'
 * 抓包https://gw.nevapp.gtmc.com.cn , 找到请求头 Authorization&deviceId 即可 多账号@ 连接
 * 
 * CK过期后不要打开APP等第二天 先打开抓包后打开APP  
 * https://gw.nevapp.gtmc.com.cn/ha/iam/api/lgn/checkAndUpdateToken
 * 抓这个连接的响应中的refreshToken  该CK有效期为一个月
 * 第一次抓应该有效期是3-7天 需要抓取上面连接的响应
 * 
 * ====================================
 *   
 */



const $ = new Env("广汽丰田");
const ckName = "gqft_data";
//-------------------- 一般不动变量区域 -------------------------------------
const Notify = 1;		 //0为关闭通知,1为打开通知,默认为1
let envSplitor = ["@", "\n"]; //多账号分隔符
let msg = '';
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
//---------------------- 自定义变量区域 -----------------------------------
//---------------------------------------------------------

async function start() {
    //console.log('\n================== 更新TOKEN ==================\n');
    //taskall = [];
    //for (let user of userList) {
    //taskall.push(await user.changeToken());
    //await $.wait(10000);
    //}
    //await Promise.all(taskall);

    console.log('\n================== 信息 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.user_info());
        await $.wait(10000);
    }
    await Promise.all(taskall);
    if (!$.ckStatus) return
    console.log('\n================== 签到 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_signin());
        await $.wait(10000);
    }
    await Promise.all(taskall);
    console.log('\n================== 帖子 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_artList());
        await $.wait(10000);
    }
    await Promise.all(taskall);


}


class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split('&')[0];
        this.deviceId = str.split('&')[1];
        //let ck = str.split('&')
        //this.data1 = ck[0]
        this.host = "";
        this.hostname = "https://" + this.host;
        this.ts = ts13()
        $.ckStatus = true
    }
    async changeToken() {
        try {
            let ts = this.ts,
                noncestr = nonce('a'),
                sig = gqft_gqft(ts, this.ck, noncestr, '1')
            let options = {
                method: 'POST',
                url: 'https://gw.nevapp.gtmc.com.cn/ha/iam/api/lgn/checkAndUpdateToken',
                headers: {
                    'Authorization': 'Bearer ' + this.ck,
                    'sig': sig,
                    'appVersion': '1.1.1',
                    'operateSystem': 'android',
                    'appId': '8c4131ff-e326-43ea-b333-decb23936673',
                    'deviceId': this.deviceId,
                    'nonce': noncestr,
                    'timestamp': ts,
                    'Content-Type': 'application/json;charset=utf-8',
                    'Host': 'gw.nevapp.gtmc.com.cn',
                    'Connection': 'Keep-Alive',
                    'User-Agent': 'okhttp/4.8.1'
                },
                body: { refreshToken: this.ck },
                json: true
            };
            options = changeCode(options)
            console.log(options);
            let result = await httpRequest(options);
            console.log(result);
            if (result.header.code == 10000000) {
                DoubleLog(`账号[${this.index}] 刷新token成功:[${result.body.accessToken}]`);
            } else {
                //DoubleLog(`账号[${this.index}]  用户查询:失败 ❌ 了呢,原因未知！`);
                DoubleLog('ck 失效或错误')
                $.ckStatus = false
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async user_info() {
        try {
            let ts = this.ts,
                noncestr = nonce('a'),
                sig = gqft_gqft(ts, this.ck, noncestr, '1')
            let options = {
                method: 'GET',
                url: 'https://gw.nevapp.gtmc.com.cn/main/api/community/lgn/user/getLoginUserInfo',
                headers: {
                    Accept: 'application/json',
                    OperateSystem: 'android',
                    AppVersion: '',
                    Authorization: 'Bearer ' + this.ck,
                    sig: sig,
                    appVersion: '1.1.1',
                    operateSystem: 'android',
                    appId: '8c4131ff-e326-43ea-b333-decb23936673',
                    deviceId: this.deviceId,
                    nonce: noncestr,
                    timestamp: ts,
                    Host: 'gw.nevapp.gtmc.com.cn',
                    Connection: 'Keep-Alive',
                    'User-Agent': 'okhttp/4.8.1',
                    'If-Modified-Since': 'Mon, 23 Jan 2023 09:04:53 GMT'
                }
            };
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.header.code == 10000000) {
                DoubleLog(`账号[${this.index}] 欢迎用户: [${result.body.baseInfo.gtmcUid}]昵称[${result.body.baseInfo.roleName}]`);
            } else {
                //DoubleLog(`账号[${this.index}]  用户查询:失败 ❌ 了呢,原因未知！`);
                DoubleLog('ck 失效或错误')
                $.ckStatus = false
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_signin() {//签到 每次20分
        try {
            let ts = this.ts,
                noncestr = nonce('b'),
                sig = gqft_gqft(ts, this.ck, noncestr, '2')
            let options = {
                method: 'POST',
                url: 'https://gw.nevapp.gtmc.com.cn/main/api/marketing/lgn/task/signin',
                headers: {
                    Host: 'gw.nevapp.gtmc.com.cn',
                    Connection: 'keep-alive',
                    operateSystem: 'h5',
                    nonce: noncestr,
                    Authorization: this.ck,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 MQQBrowser/6.2 TBS/046141 Mobile Safari/537.36 BundleId/com.gtmc.nevapp DSApp/1.1.1 StatusBarHeight/30 BottomBarHeight/0',
                    timestamp: ts,
                    appId: '56cc6d04-f46a-4a45-8bb4-114ffa0996b9',
                    sig: sig,
                    Accept: '*/*',
                    Origin: 'https://app.nevapp.gtmc.com.cn',
                    'X-Requested-With': 'com.gtmc.nevapp',
                    'Sec-Fetch-Site': 'same-site',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Dest': 'empty',
                    Referer: 'https://app.nevapp.gtmc.com.cn/',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                },
                body: {},
                json: true
            };
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.header.code == 10000000) {
                DoubleLog(`账号[${this.index}]  签到成功获得: [${result.body.value}分]`);
            } else {
                DoubleLog(`账号[${this.index}]  签到:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_artList() {//帖子列表
        try {
            let ts = this.ts,
                noncestr = nonce('a'),
                sig = gqft_gqft(ts, this.ck, noncestr, '1')
            let options = {
                method: 'POST',
                url: 'https://gw.nevapp.gtmc.com.cn/main/api/community/post/page',
                headers: {
                    'Cache-Control': 'public, no-cache',
                    Accept: 'application/json',
                    OperateSystem: 'android',
                    AppVersion: '',
                    Authorization: 'Bearer ' + this.ck,
                    sig: sig,
                    appVersion: '1.1.1',
                    operateSystem: 'android',
                    appId: '8c4131ff-e326-43ea-b333-decb23936673',
                    deviceId: this.deviceId,
                    nonce: noncestr,
                    timestamp: ts,
                    'Content-Type': 'application/json; charset=UTF-8',
                    //'Content-Length': '26',
                    Host: 'gw.nevapp.gtmc.com.cn',
                    Connection: 'Keep-Alive',
                    //'Accept-Encoding': 'gzip',
                    'User-Agent': 'okhttp/4.8.1',
                    'content-type': 'application/json'
                },
                body: { queryPostType: "NEWEST", pageNo: 1, pageSize: 20 },
                json: true
            };
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.header.code == 10000000) {
                for (let i = 0; i < 10; i++) {
                    DoubleLog(`账号[${this.index}]  文章列表[${result.body.list[i].id}]`);
                    let artId = result.body.list[i].id
                    DoubleLog('开始浏览')
                    await $.wait(5000)
                    await this.task_detail(artId)
                    await $.wait(5000)
                    DoubleLog('开始点赞')
                    await this.task_like(artId)
                }
            } else {
                DoubleLog(`账号[${this.index}]  签到:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_detail(artId) {//浏览文章
        try {
            let ts = this.ts,
                noncestr = nonce('b'),
                sig = gqft_gqft(ts, this.ck, noncestr, '2')
            let options = {
                method: 'POST',
                url: 'https://gw.nevapp.gtmc.com.cn/main/api/community/post/detail',
                headers: {
                    'Cache-Control': 'public, no-cache',
                    Accept: 'application/json',
                    OperateSystem: 'android',
                    AppVersion: '',
                    Authorization: 'Bearer ' + this.ck,
                    sig: sig,
                    appVersion: '1.1.1',
                    operateSystem: 'h5',
                    appId: '56cc6d04-f46a-4a45-8bb4-114ffa0996b9',
                    deviceId: this.deviceId,
                    nonce: noncestr,
                    timestamp: ts,
                    'Content-Type': 'application/json; charset=UTF-8',
                    //'Content-Length': '26',
                    Host: 'gw.nevapp.gtmc.com.cn',
                    Connection: 'Keep-Alive',
                    //'Accept-Encoding': 'gzip',
                    'User-Agent': 'okhttp/4.8.1',
                    'content-type': 'application/json'
                },
                body: { postId: artId },
                json: true
            };
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.header.code == 10000000) {
                DoubleLog(`账号[${this.index}]  浏览文章成功`);
            } else {
                DoubleLog(`账号[${this.index}]  浏览文章:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_like(artId) {//点赞文章
        try {
            let ts = this.ts,
                noncestr = nonce('a'),
                sig = gqft_gqft(ts, this.ck, noncestr, '1')
            let options = {
                method: 'POST',
                url: 'https://gw.nevapp.gtmc.com.cn/main/api/community/lgn/user/like',
                headers: {
                    'Cache-Control': 'public, no-cache',
                    Accept: 'application/json',
                    OperateSystem: 'android',
                    AppVersion: '',
                    Authorization: 'Bearer ' + this.ck,
                    sig: sig,
                    appVersion: '1.1.1',
                    operateSystem: 'android',
                    appId: '8c4131ff-e326-43ea-b333-decb23936673',
                    deviceId: this.deviceId,
                    nonce: noncestr,
                    timestamp: ts,
                    'Content-Type': 'application/json; charset=UTF-8',
                    //'Content-Length': '26',
                    Host: 'gw.nevapp.gtmc.com.cn',
                    Connection: 'Keep-Alive',
                    //'Accept-Encoding': 'gzip',
                    'User-Agent': 'okhttp/4.8.1',
                    'content-type': 'application/json'
                },
                body: { subjectId: artId, subjectType: "POST" },
                json: true
            };
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.header.code == 10000000) {
                if (result.body.value) {
                    DoubleLog(`账号[${this.index}]  点赞文章成功`);
                }
            } else {
                DoubleLog(`账号[${this.index}]  点赞:失败 ❌ 了呢,原因未知！`);
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
function ts13() {
    return Math.round(new Date().getTime()).toString();
}
function nonce(type) {
    let t, e
    if (type == 'a') {
        e = 6;
        t = "1234567890",
            a = t.length,
            n = "";
        for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
        return n;
    } else if (type == 'b') {
        e = 6;
        t = "qwertyuiopasdfghjklzxcvbnm1234567890",
            a = t.length,
            n = "";
        for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
        return n;
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
function MD5_Encrypt(a) { function b(a, b) { return (a << b) | (a >>> (32 - b)); } function c(a, b) { var c, d, e, f, g; return ((e = 2147483648 & a), (f = 2147483648 & b), (c = 1073741824 & a), (d = 1073741824 & b), (g = (1073741823 & a) + (1073741823 & b)), c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f : g ^ e ^ f); } function d(a, b, c) { return (a & b) | (~a & c); } function e(a, b, c) { return (a & c) | (b & ~c); } function f(a, b, c) { return a ^ b ^ c; } function g(a, b, c) { return b ^ (a | ~c); } function h(a, e, f, g, h, i, j) { return (a = c(a, c(c(d(e, f, g), h), j))), c(b(a, i), e); } function i(a, d, f, g, h, i, j) { return (a = c(a, c(c(e(d, f, g), h), j))), c(b(a, i), d); } function j(a, d, e, g, h, i, j) { return (a = c(a, c(c(f(d, e, g), h), j))), c(b(a, i), d); } function k(a, d, e, f, h, i, j) { return (a = c(a, c(c(g(d, e, f), h), j))), c(b(a, i), d); } function l(a) { for (var b, c = a.length, d = c + 8, e = (d - (d % 64)) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i = 0; c > i;) (b = (i - (i % 4)) / 4), (h = (i % 4) * 8), (g[b] = g[b] | (a.charCodeAt(i) << h)), i++; return ((b = (i - (i % 4)) / 4), (h = (i % 4) * 8), (g[b] = g[b] | (128 << h)), (g[f - 2] = c << 3), (g[f - 1] = c >>> 29), g); } function m(a) { var b, c, d = "", e = ""; for (c = 0; 3 >= c; c++) (b = (a >>> (8 * c)) & 255), (e = "0" + b.toString(16)), (d += e.substr(e.length - 2, 2)); return d; } function n(a) { a = a.replace(/\r\n/g, "\n"); for (var b = "", c = 0; c < a.length; c++) { var d = a.charCodeAt(c); 128 > d ? (b += String.fromCharCode(d)) : d > 127 && 2048 > d ? ((b += String.fromCharCode((d >> 6) | 192)), (b += String.fromCharCode((63 & d) | 128))) : ((b += String.fromCharCode((d >> 12) | 224)), (b += String.fromCharCode(((d >> 6) & 63) | 128)), (b += String.fromCharCode((63 & d) | 128))); } return b; } var o, p, q, r, s, t, u, v, w, x = [], y = 7, z = 12, A = 17, B = 22, C = 5, D = 9, E = 14, F = 20, G = 4, H = 11, I = 16, J = 23, K = 6, L = 10, M = 15, N = 21; for (a = n(a), x = l(a), t = 1732584193, u = 4023233417, v = 2562383102, w = 271733878, o = 0; o < x.length; o += 16) (p = t), (q = u), (r = v), (s = w), (t = h(t, u, v, w, x[o + 0], y, 3614090360)), (w = h(w, t, u, v, x[o + 1], z, 3905402710)), (v = h(v, w, t, u, x[o + 2], A, 606105819)), (u = h(u, v, w, t, x[o + 3], B, 3250441966)), (t = h(t, u, v, w, x[o + 4], y, 4118548399)), (w = h(w, t, u, v, x[o + 5], z, 1200080426)), (v = h(v, w, t, u, x[o + 6], A, 2821735955)), (u = h(u, v, w, t, x[o + 7], B, 4249261313)), (t = h(t, u, v, w, x[o + 8], y, 1770035416)), (w = h(w, t, u, v, x[o + 9], z, 2336552879)), (v = h(v, w, t, u, x[o + 10], A, 4294925233)), (u = h(u, v, w, t, x[o + 11], B, 2304563134)), (t = h(t, u, v, w, x[o + 12], y, 1804603682)), (w = h(w, t, u, v, x[o + 13], z, 4254626195)), (v = h(v, w, t, u, x[o + 14], A, 2792965006)), (u = h(u, v, w, t, x[o + 15], B, 1236535329)), (t = i(t, u, v, w, x[o + 1], C, 4129170786)), (w = i(w, t, u, v, x[o + 6], D, 3225465664)), (v = i(v, w, t, u, x[o + 11], E, 643717713)), (u = i(u, v, w, t, x[o + 0], F, 3921069994)), (t = i(t, u, v, w, x[o + 5], C, 3593408605)), (w = i(w, t, u, v, x[o + 10], D, 38016083)), (v = i(v, w, t, u, x[o + 15], E, 3634488961)), (u = i(u, v, w, t, x[o + 4], F, 3889429448)), (t = i(t, u, v, w, x[o + 9], C, 568446438)), (w = i(w, t, u, v, x[o + 14], D, 3275163606)), (v = i(v, w, t, u, x[o + 3], E, 4107603335)), (u = i(u, v, w, t, x[o + 8], F, 1163531501)), (t = i(t, u, v, w, x[o + 13], C, 2850285829)), (w = i(w, t, u, v, x[o + 2], D, 4243563512)), (v = i(v, w, t, u, x[o + 7], E, 1735328473)), (u = i(u, v, w, t, x[o + 12], F, 2368359562)), (t = j(t, u, v, w, x[o + 5], G, 4294588738)), (w = j(w, t, u, v, x[o + 8], H, 2272392833)), (v = j(v, w, t, u, x[o + 11], I, 1839030562)), (u = j(u, v, w, t, x[o + 14], J, 4259657740)), (t = j(t, u, v, w, x[o + 1], G, 2763975236)), (w = j(w, t, u, v, x[o + 4], H, 1272893353)), (v = j(v, w, t, u, x[o + 7], I, 4139469664)), (u = j(u, v, w, t, x[o + 10], J, 3200236656)), (t = j(t, u, v, w, x[o + 13], G, 681279174)), (w = j(w, t, u, v, x[o + 0], H, 3936430074)), (v = j(v, w, t, u, x[o + 3], I, 3572445317)), (u = j(u, v, w, t, x[o + 6], J, 76029189)), (t = j(t, u, v, w, x[o + 9], G, 3654602809)), (w = j(w, t, u, v, x[o + 12], H, 3873151461)), (v = j(v, w, t, u, x[o + 15], I, 530742520)), (u = j(u, v, w, t, x[o + 2], J, 3299628645)), (t = k(t, u, v, w, x[o + 0], K, 4096336452)), (w = k(w, t, u, v, x[o + 7], L, 1126891415)), (v = k(v, w, t, u, x[o + 14], M, 2878612391)), (u = k(u, v, w, t, x[o + 5], N, 4237533241)), (t = k(t, u, v, w, x[o + 12], K, 1700485571)), (w = k(w, t, u, v, x[o + 3], L, 2399980690)), (v = k(v, w, t, u, x[o + 10], M, 4293915773)), (u = k(u, v, w, t, x[o + 1], N, 2240044497)), (t = k(t, u, v, w, x[o + 8], K, 1873313359)), (w = k(w, t, u, v, x[o + 15], L, 4264355552)), (v = k(v, w, t, u, x[o + 6], M, 2734768916)), (u = k(u, v, w, t, x[o + 13], N, 1309151649)), (t = k(t, u, v, w, x[o + 4], K, 4149444226)), (w = k(w, t, u, v, x[o + 11], L, 3174756917)), (v = k(v, w, t, u, x[o + 2], M, 718787259)), (u = k(u, v, w, t, x[o + 9], N, 3951481745)), (t = c(t, p)), (u = c(u, q)), (v = c(v, r)), (w = c(w, s)); var O = m(t) + m(u) + m(v) + m(w); return O.toLowerCase(); }
function _0x2110(_0x538eb5, _0x460f97) { const _0x52f16a = _0xcda4(); return _0x2110 = function (_0x187aad, _0x5cc614) { _0x187aad = _0x187aad - (0x26de + 0x22d3 + -0x47da); let _0x4143db = _0x52f16a[_0x187aad]; return _0x4143db; }, _0x2110(_0x538eb5, _0x460f97); } const _0x300262 = _0x2110; (function (_0x4ee0a6, _0x58965b) { const _0x3afd6a = _0x2110, _0x507e95 = _0x4ee0a6(); while (!![]) { try { const _0x4bcdbe = parseInt(_0x3afd6a(0x2c0)) / (0x160e * -0x1 + 0x5 * 0x27f + 0x994) * (parseInt(_0x3afd6a(0x2b6)) / (0x2 * -0x89 + 0xa73 * 0x1 + -0x95f)) + -parseInt(_0x3afd6a(0x1f7)) / (-0xfcd + 0x39f * 0x6 + 0x2f5 * -0x2) * (-parseInt(_0x3afd6a(0x2a1)) / (0x1 * -0xf89 + 0xf0e + 0x7f * 0x1)) + -parseInt(_0x3afd6a(0x2df)) / (0x1230 + 0x1cd * 0x6 + -0x1cf9) * (parseInt(_0x3afd6a(0x285)) / (0x21a1 * -0x1 + 0x439 + 0x1d6e)) + -parseInt(_0x3afd6a(0x22d)) / (0x1e4f + 0x322 * -0x7 + -0x85a) + parseInt(_0x3afd6a(0x299)) / (-0x1 * 0x217d + 0x5 * 0x7bf + -0x536) * (parseInt(_0x3afd6a(0x32d)) / (-0x57 * -0x1b + -0x7a0 + -0x184)) + parseInt(_0x3afd6a(0x202)) / (-0xc7c + 0x14 * -0x11 + 0xdda) * (parseInt(_0x3afd6a(0x1d9)) / (-0x22bc + 0x4 * -0x52c + 0x3 * 0x127d)) + parseInt(_0x3afd6a(0x249)) / (-0x82d + 0x1003 * -0x1 + -0x42 * -0x5e) * (parseInt(_0x3afd6a(0x25b)) / (-0x4d7 + -0x186e * 0x1 + -0x12 * -0x1a1)); if (_0x4bcdbe === _0x58965b) break; else _0x507e95['push'](_0x507e95['shift']()); } catch (_0x25a7e4) { _0x507e95['push'](_0x507e95['shift']()); } } }(_0xcda4, -0x1579 + -0x2b26a * -0x1 + -0x16 * 0xbfa)); var version_ = _0x300262(0x26c) + _0x300262(0x29d), _0x4ce9 = (function () { const _0x422bdf = _0x300262, _0x52e6e7 = { 'wYpfx': _0x422bdf(0x271), 'zphNj': _0x422bdf(0x23b), 'Asbop': _0x422bdf(0x296), 'WRevm': _0x422bdf(0x2cb) + _0x422bdf(0x2d1) + _0x422bdf(0x228) + _0x422bdf(0x23f) + _0x422bdf(0x2d6) + _0x422bdf(0x21d) + _0x422bdf(0x227) + _0x422bdf(0x32b), 'IeWfL': _0x422bdf(0x2bd) + _0x422bdf(0x300) + _0x422bdf(0x29b), 'yXTIH': _0x422bdf(0x31e) + _0x422bdf(0x2d2) + _0x422bdf(0x325), 'LCyZl': _0x422bdf(0x2c4) + _0x422bdf(0x2dd) + _0x422bdf(0x1fc), 'EZKcc': _0x422bdf(0x234) + _0x422bdf(0x320) + _0x422bdf(0x1f0), 'yvHet': _0x422bdf(0x2c1), 'qtlPD': _0x422bdf(0x20e) + _0x422bdf(0x2ac) + _0x422bdf(0x282), 'rKFaZ': _0x422bdf(0x321) + _0x422bdf(0x210), 'FBCNz': _0x422bdf(0x20a), 'mbRQH': _0x422bdf(0x253) + '1s', 'DHHlI': _0x422bdf(0x308), 'EgvqL': _0x422bdf(0x30c) + _0x422bdf(0x2b5), 'hhDAo': _0x422bdf(0x2a2) + 'Gw', 'YAVDs': _0x422bdf(0x217) + _0x422bdf(0x1fa), 'EplPk': _0x422bdf(0x229), 'NlpQt': _0x422bdf(0x219) + _0x422bdf(0x2e4), 'dspnb': _0x422bdf(0x31f) + _0x422bdf(0x269) + _0x422bdf(0x1fb), 'dsloS': _0x422bdf(0x25f) + _0x422bdf(0x259) + _0x422bdf(0x223) + _0x422bdf(0x295) + _0x422bdf(0x22e) + _0x422bdf(0x1df) + _0x422bdf(0x280) + _0x422bdf(0x244), 'nLVgt': _0x422bdf(0x1d8) + _0x422bdf(0x306) + 'qW', 'yvWwY': _0x422bdf(0x2ae) + 'O', 'cUYKJ': _0x422bdf(0x2c6) + _0x422bdf(0x25c) + _0x422bdf(0x261), 'ktwaU': _0x422bdf(0x245) + 'kN', 'Apcqw': _0x422bdf(0x29a) + _0x422bdf(0x272) + _0x422bdf(0x2fd), 'MRkWM': _0x422bdf(0x214), 'JJaMc': _0x422bdf(0x20d) + _0x422bdf(0x1f1) + _0x422bdf(0x29e) + _0x422bdf(0x26e) + '==', 'SBbzC': _0x422bdf(0x2b3), 'vtWbv': _0x422bdf(0x1ea), 'lEGTV': _0x422bdf(0x301) + _0x422bdf(0x2ca) + 'uG', 'ccsDN': _0x422bdf(0x2e3), 'EUBtq': _0x422bdf(0x2aa) + _0x422bdf(0x22b), 'vXqSZ': _0x422bdf(0x1ed) + _0x422bdf(0x30b) + _0x422bdf(0x211) + 'K', 'Srnpt': _0x422bdf(0x28c) + _0x422bdf(0x327), 'HIyOS': _0x422bdf(0x2be), 'eBCsk': _0x422bdf(0x27b) + 'zC', 'lssRi': _0x422bdf(0x2ce) + _0x422bdf(0x316) + _0x422bdf(0x246), 'yFmcZ': _0x422bdf(0x311) + _0x422bdf(0x328), 'qDHaH': _0x422bdf(0x26d), 'MdLQv': _0x422bdf(0x23a) }; return [...[version_, _0x52e6e7[_0x422bdf(0x24d)], _0x52e6e7[_0x422bdf(0x1ef)], _0x52e6e7[_0x422bdf(0x2da)], _0x52e6e7[_0x422bdf(0x215)], _0x52e6e7[_0x422bdf(0x213)], _0x52e6e7[_0x422bdf(0x2c8)], _0x52e6e7[_0x422bdf(0x2d5)], _0x52e6e7[_0x422bdf(0x2fa)], _0x52e6e7[_0x422bdf(0x24b)], _0x52e6e7[_0x422bdf(0x240)], _0x52e6e7[_0x422bdf(0x239)], _0x52e6e7[_0x422bdf(0x23e)], _0x52e6e7[_0x422bdf(0x1e5)], _0x52e6e7[_0x422bdf(0x313)]], ...(function () { const _0x4c0b01 = _0x422bdf, _0x393303 = { 'lEXfA': _0x52e6e7[_0x4c0b01(0x273)], 'QvCTP': _0x52e6e7[_0x4c0b01(0x1e2)], 'rirvi': _0x52e6e7[_0x4c0b01(0x277)], 'FHMTK': _0x52e6e7[_0x4c0b01(0x283)], 'KoZrC': _0x52e6e7[_0x4c0b01(0x22a)], 'kPyyR': _0x52e6e7[_0x4c0b01(0x2ad)], 'mSqOc': _0x52e6e7[_0x4c0b01(0x2e1)], 'AiRVu': _0x52e6e7[_0x4c0b01(0x2af)], 'riFFH': _0x52e6e7[_0x4c0b01(0x30f)], 'fggzm': _0x52e6e7[_0x4c0b01(0x322)], 'TyMNi': _0x52e6e7[_0x4c0b01(0x1f8)], 'vRbmD': _0x52e6e7[_0x4c0b01(0x2b7)] }; return [...[_0x52e6e7[_0x4c0b01(0x303)], _0x52e6e7[_0x4c0b01(0x268)], _0x52e6e7[_0x4c0b01(0x252)], _0x52e6e7[_0x4c0b01(0x2ab)], _0x52e6e7[_0x4c0b01(0x292)], _0x52e6e7[_0x4c0b01(0x2b0)], _0x52e6e7[_0x4c0b01(0x224)], _0x52e6e7[_0x4c0b01(0x1da)], _0x52e6e7[_0x4c0b01(0x317)], _0x52e6e7[_0x4c0b01(0x236)], _0x52e6e7[_0x4c0b01(0x279)], _0x52e6e7[_0x4c0b01(0x264)], _0x52e6e7[_0x4c0b01(0x220)], _0x52e6e7[_0x4c0b01(0x257)], _0x52e6e7[_0x4c0b01(0x1fd)]], ...(function () { const _0x2c6ee = _0x4c0b01; return [_0x393303[_0x2c6ee(0x302)], _0x393303[_0x2c6ee(0x25d)], _0x393303[_0x2c6ee(0x2ff)], _0x393303[_0x2c6ee(0x2b9)], _0x393303[_0x2c6ee(0x331)], _0x393303[_0x2c6ee(0x31a)], _0x393303[_0x2c6ee(0x286)], _0x393303[_0x2c6ee(0x212)], _0x393303[_0x2c6ee(0x2c3)], _0x393303[_0x2c6ee(0x231)], _0x393303[_0x2c6ee(0x2ee)], _0x393303[_0x2c6ee(0x263)]]; }())]; }())]; }()); (function (_0x548955, _0x3f44b6, _0x1fd24d, _0x462214, _0xe4f384, _0x2c5170, _0x488859) { const _0x3499f4 = _0x300262, _0x34f501 = { 'rVpGN': _0x3499f4(0x206), 'ZEtpx': function (_0x17d287, _0x27dfc1) { return _0x17d287 + _0x27dfc1; }, 'gNvWV': function (_0x3b9e38, _0x119e4f) { return _0x3b9e38(_0x119e4f); }, 'kgwuT': function (_0x4c7afa, _0x34d8c4) { return _0x4c7afa(_0x34d8c4); }, 'gKrmQ': function (_0x2c4e7e, _0x405f05) { return _0x2c4e7e + _0x405f05; }, 'MhwVf': function (_0x5adc4c, _0x158833) { return _0x5adc4c + _0x158833; }, 'QLXjG': function (_0x59c033, _0x261d80) { return _0x59c033 + _0x261d80; }, 'kfrlV': function (_0x15fc49, _0xa26213) { return _0x15fc49 / _0xa26213; }, 'CMdrW': function (_0x524506, _0x3f91e6, _0x5588e9) { return _0x524506(_0x3f91e6, _0x5588e9); }, 'wJVAo': _0x3499f4(0x2ea), 'oIOnV': function (_0x4f8b72, _0x3f047d, _0x34218e) { return _0x4f8b72(_0x3f047d, _0x34218e); }, 'aGjnR': _0x3499f4(0x1eb), 'xxDER': function (_0x1b2df7, _0x4480d0) { return _0x1b2df7 * _0x4480d0; }, 'rtMsm': function (_0x29debe, _0x3d942a) { return _0x29debe / _0x3d942a; }, 'aMWOK': function (_0x1cff7c, _0x4011ae) { return _0x1cff7c(_0x4011ae); }, 'ewGoi': _0x3499f4(0x2ed), 'qHNMP': _0x3499f4(0x1f4), 'VBIJk': function (_0x15f65c, _0x3af1eb, _0x2b6f62) { return _0x15f65c(_0x3af1eb, _0x2b6f62); }, 'UPSrR': function (_0x4f19ec, _0x340eca) { return _0x4f19ec / _0x340eca; }, 'ZJJlR': function (_0x18287d, _0x4c021d) { return _0x18287d(_0x4c021d); }, 'OLpmV': _0x3499f4(0x288), 'qTYMb': _0x3499f4(0x2f8), 'bxPxe': function (_0x331e78, _0x461ac4) { return _0x331e78 / _0x461ac4; }, 'uISvX': function (_0x57fcc4, _0x4912a2) { return _0x57fcc4(_0x4912a2); }, 'LhakZ': function (_0x90b24e, _0x2cd6a3, _0x3604b3) { return _0x90b24e(_0x2cd6a3, _0x3604b3); }, 'KOqoP': function (_0x39feb2, _0x222145) { return _0x39feb2 * _0x222145; }, 'EaQoI': function (_0x176823, _0x3125dd, _0x1a15db) { return _0x176823(_0x3125dd, _0x1a15db); }, 'eHFul': _0x3499f4(0x2a6), 'BjLOa': function (_0x2fa80f, _0x80f1ff) { return _0x2fa80f(_0x80f1ff); }, 'rGmSI': function (_0x3f116b, _0xbe783e) { return _0x3f116b / _0xbe783e; }, 'Ckxnc': _0x3499f4(0x2fc), 'wKBCp': function (_0x559b38, _0x516463) { return _0x559b38 <= _0x516463; }, 'irMdq': function (_0x546480, _0x195d6a) { return _0x546480 == _0x195d6a; }, 'MQJyQ': _0x3499f4(0x1de), 'OetGq': function (_0x8b12ed, _0x3b1d26) { return _0x8b12ed === _0x3b1d26; }, 'FUGaB': _0x3499f4(0x30d), 'vbcQH': function (_0x45677c, _0x5d55ee) { return _0x45677c >> _0x5d55ee; } }; return _0x548955 = _0x34f501[_0x3499f4(0x32a)](_0x548955, 0xd20 + 0x47 * 0x4 + -0xb * 0x14b), _0x2c5170 = 'hs', _0x488859 = 'hs', function (_0x22693d, _0x1a5752, _0x13f532, _0x28fa1b, _0x898a7f) { const _0x36a342 = _0x3499f4, _0x180f08 = _0x5212; _0x28fa1b = _0x34f501[_0x36a342(0x247)], _0x2c5170 = _0x34f501[_0x36a342(0x326)](_0x28fa1b, _0x2c5170), _0x898a7f = 'up', _0x488859 += _0x898a7f, _0x2c5170 = _0x34f501[_0x36a342(0x2e2)](_0x13f532, _0x2c5170), _0x488859 = _0x34f501[_0x36a342(0x2f7)](_0x13f532, _0x488859), _0x13f532 = 0x1fd * 0xb + 0x2bc + -0x189b; const _0x8a43f2 = _0x22693d; while (!![] && _0x34f501[_0x36a342(0x326)](--_0x462214, _0x1a5752)) { try { _0x28fa1b = _0x34f501[_0x36a342(0x29c)](_0x34f501[_0x36a342(0x2eb)](_0x34f501[_0x36a342(0x2eb)](_0x34f501[_0x36a342(0x2eb)](_0x34f501[_0x36a342(0x326)](_0x34f501[_0x36a342(0x2e6)](_0x34f501[_0x36a342(0x204)](_0x34f501[_0x36a342(0x2f7)](parseInt, _0x34f501[_0x36a342(0x1e0)](_0x180f08, -0x21cf + 0xe75 + 0x2 * 0x9fa, _0x34f501[_0x36a342(0x2ef)])), 0x70 + -0xd80 + 0x5 * 0x29d), _0x34f501[_0x36a342(0x204)](_0x34f501[_0x36a342(0x2f7)](parseInt, _0x34f501[_0x36a342(0x310)](_0x180f08, 0x939 * 0x4 + 0x1 * -0x1f05 + -0x542, _0x34f501[_0x36a342(0x201)])), 0x10 * 0x223 + 0x21c0 + -0x21f7 * 0x2)), _0x34f501[_0x36a342(0x2db)](_0x34f501[_0x36a342(0x205)](_0x34f501[_0x36a342(0x2fb)](parseInt, _0x34f501[_0x36a342(0x1e0)](_0x180f08, 0x217d + -0x21e8 + 0x101, _0x34f501[_0x36a342(0x258)])), 0x254c + -0x1100 + -0x1449), _0x34f501[_0x36a342(0x205)](_0x34f501[_0x36a342(0x2f7)](parseInt, _0x34f501[_0x36a342(0x310)](_0x180f08, -0x7b5 * 0x1 + 0x9fa + -0x1 * 0x195, _0x34f501[_0x36a342(0x2f3)])), -0x5 * 0x57a + -0x2 * -0x683 + 0xb8 * 0x14))), _0x34f501[_0x36a342(0x2db)](_0x34f501[_0x36a342(0x204)](_0x34f501[_0x36a342(0x2f7)](parseInt, _0x34f501[_0x36a342(0x1f9)](_0x180f08, -0x5de * -0x4 + -0x14de + -0x1f8, _0x34f501[_0x36a342(0x258)])), -0x1 * -0x2032 + 0xce2 + -0x2d0f), _0x34f501[_0x36a342(0x2e5)](_0x34f501[_0x36a342(0x2fe)](parseInt, _0x34f501[_0x36a342(0x1f9)](_0x180f08, -0x215e + -0x1ba7 * -0x1 + 0x663, _0x34f501[_0x36a342(0x2ec)])), -0x1c1c * -0x1 + -0x1 * -0x127b + -0x2e91))), _0x34f501[_0x36a342(0x2db)](_0x34f501[_0x36a342(0x2e5)](_0x34f501[_0x36a342(0x2fb)](parseInt, _0x34f501[_0x36a342(0x310)](_0x180f08, -0x1d99 * 0x1 + 0x42 * -0x64 + -0x199 * -0x23, _0x34f501[_0x36a342(0x226)])), -0xd * -0xd + -0x120f * 0x2 + -0x4 * -0x8df), _0x34f501[_0x36a342(0x315)](-_0x34f501[_0x36a342(0x207)](parseInt, _0x34f501[_0x36a342(0x274)](_0x180f08, 0x2d7 * 0x6 + 0x5 * 0x5f8 + -0x1 * 0x2e39, _0x34f501[_0x36a342(0x226)])), 0x557 + -0x1 * 0x25b6 + -0x2067 * -0x1))), _0x34f501[_0x36a342(0x304)](_0x34f501[_0x36a342(0x205)](_0x34f501[_0x36a342(0x2e2)](parseInt, _0x34f501[_0x36a342(0x1f3)](_0x180f08, 0x2470 + 0x1 * -0x1f7 + -0x21ce, _0x34f501[_0x36a342(0x270)])), 0x3 * 0x839 + 0x48b * 0x1 + -0x1d2d * 0x1), _0x34f501[_0x36a342(0x205)](_0x34f501[_0x36a342(0x24e)](parseInt, _0x34f501[_0x36a342(0x1f9)](_0x180f08, -0x765 * 0x3 + -0x2 * 0x37c + 0x1dba, _0x34f501[_0x36a342(0x2ec)])), -0x1775 + 0x1b27 + -0x27 * 0x18))), _0x34f501[_0x36a342(0x31c)](-_0x34f501[_0x36a342(0x2f7)](parseInt, _0x34f501[_0x36a342(0x1e0)](_0x180f08, 0xd * -0x9b + -0x1a3e * 0x1 + 0x2 * 0x1159, _0x34f501[_0x36a342(0x1e9)])), 0x1636 + -0x22b8 + 0xc8d)); } catch (_0x55ce0d) { _0x28fa1b = _0x13f532; } finally { _0x898a7f = _0x8a43f2[_0x2c5170](); if (_0x34f501[_0x36a342(0x2c9)](_0x548955, _0x462214)) _0x13f532 ? _0xe4f384 ? _0x28fa1b = _0x898a7f : _0xe4f384 = _0x898a7f : _0x13f532 = _0x898a7f; else { if (_0x34f501[_0x36a342(0x266)](_0x13f532, _0xe4f384[_0x34f501[_0x36a342(0x2ba)]](/[rGnYTSAUMJVBhDLw=]/g, ''))) { if (_0x34f501[_0x36a342(0x329)](_0x28fa1b, _0x1a5752)) { _0x8a43f2[_0x34f501[_0x36a342(0x29c)]('un', _0x2c5170)](_0x898a7f); break; } _0x8a43f2[_0x488859](_0x898a7f); } } } } }(_0x1fd24d, _0x3f44b6, function (_0x389348, _0x58a453, _0x53ff2f, _0x394d3d, _0x330aca, _0x422a55, _0x5f0139) { const _0x41b90d = _0x3499f4; return _0x58a453 = _0x34f501[_0x41b90d(0x24a)], _0x389348 = arguments[-0x16d7 * -0x1 + -0x2291 + 0xbba], _0x389348 = _0x389348[_0x58a453](''), _0x53ff2f = _0x41b90d(0x2dc), _0x389348 = _0x389348[_0x53ff2f]('v'), _0x394d3d = _0x41b90d(0x2d4), (0x1 * 0xaa8b3 + -0x1 * 0x1d6e67 + 0x24925d, _0x389348[_0x394d3d]('')); }); }(0x203e + -0x2 * 0x2f9 + -0x13ec, 0x3226d * -0x3 + -0xf4f90 + 0x24cc5c, _0x4ce9, -0x1f3b * 0x1 + 0x397 * -0x6 + -0xd * -0x41f), _0x4ce9) && (version_ = _0x4ce9); function _0x5212(_0x386df2, _0x132eaa) { const _0x2a1caa = _0x300262, _0x547954 = { 'nQGeu': _0x2a1caa(0x297) + _0x2a1caa(0x203) + _0x2a1caa(0x23d) + _0x2a1caa(0x21e) + _0x2a1caa(0x241) + _0x2a1caa(0x289) + _0x2a1caa(0x2a4), 'ytmNk': _0x2a1caa(0x27c), 'uxywM': function (_0xd6d43, _0x13f7c1) { return _0xd6d43 % _0x13f7c1; }, 'vnUKp': function (_0x33e556, _0x4a65a2) { return _0x33e556 + _0x4a65a2; }, 'AqwlU': function (_0x2ad619, _0x5dfedb) { return _0x2ad619 * _0x5dfedb; }, 'ORvNf': function (_0x866018, _0x561e05) { return _0x866018 % _0x561e05; }, 'nutqX': _0x2a1caa(0x218) + 'de', 'PsXSp': function (_0x493959, _0xf47f2a) { return _0x493959 & _0xf47f2a; }, 'friPY': function (_0x933ff4, _0x29b4ad) { return _0x933ff4 >> _0x29b4ad; }, 'gqZAd': function (_0x326e2b, _0x3dcff6) { return _0x326e2b * _0x3dcff6; }, 'QvDdC': _0x2a1caa(0x238), 'VSmys': _0x2a1caa(0x2cd), 'iUzfU': function (_0x525069, _0x392251) { return _0x525069 < _0x392251; }, 'jskGe': _0x2a1caa(0x242), 'EZvGJ': _0x2a1caa(0x230), 'TkMxP': _0x2a1caa(0x28f), 'dGYYF': function (_0x5a317f, _0x4cce12) { return _0x5a317f(_0x4cce12); }, 'grlzy': function (_0x178ca9, _0x2fdefc) { return _0x178ca9 + _0x2fdefc; }, 'cDyGg': function (_0x39bf47, _0xf381ee) { return _0x39bf47 % _0xf381ee; }, 'EgdWi': function (_0x3e2152, _0x52abe8) { return _0x3e2152 % _0x52abe8; }, 'NeEvE': function (_0x2f7e29, _0x316c3f) { return _0x2f7e29 + _0x316c3f; }, 'Ofeig': function (_0x5a30d2, _0x24f0a7) { return _0x5a30d2 % _0x24f0a7; }, 'uyTOf': function (_0x2c242b, _0x46875c) { return _0x2c242b ^ _0x46875c; }, 'hDUkO': function (_0x9ead2f, _0x3d235f) { return _0x9ead2f % _0x3d235f; }, 'fQruX': function (_0x1bc481, _0x4b63c4) { return _0x1bc481 - _0x4b63c4; }, 'DfRvZ': function (_0x39bf55, _0x54eb94) { return _0x39bf55 === _0x54eb94; }, 'fyWgy': _0x2a1caa(0x31b), 'DTbdA': _0x2a1caa(0x1e3), 'zYmFH': function (_0x1b78fa, _0x1ab951) { return _0x1b78fa + _0x1ab951; }, 'vCeOu': _0x2a1caa(0x1d7), 'dVkUy': function (_0x4b0f7e, _0x3413e3, _0x4201ab) { return _0x4b0f7e(_0x3413e3, _0x4201ab); } }, _0x4cd45c = _0x4ce9; return _0x5212 = function (_0x36b693, _0x211552) { const _0x5afb91 = _0x2a1caa; _0x36b693 = _0x547954[_0x5afb91(0x2c2)](_0x36b693, 0x62 * 0x23 + 0x8af + 0x44f * -0x5); let _0x52d498 = _0x4cd45c[_0x36b693]; if (_0x547954[_0x5afb91(0x2a7)](_0x5212[_0x547954[_0x5afb91(0x2cf)]], undefined)) { var _0x2291bf = function (_0x51e60b) { const _0x15918c = _0x5afb91, _0xee25e7 = _0x547954[_0x15918c(0x21b)]; let _0x4f50e2 = '', _0x3b4a5e = ''; for (let _0x476bbe = 0x26c9 + -0x748 + -0x1f81, _0x2c988f, _0x50a831, _0x5031cf = -0x146e + 0x492 + -0x7ee * -0x2; _0x50a831 = _0x51e60b[_0x547954[_0x15918c(0x23c)]](_0x5031cf++); ~_0x50a831 && (_0x2c988f = _0x547954[_0x15918c(0x21a)](_0x476bbe, -0x1330 + 0x2 * -0x8bd + -0x2 * -0x1257) ? _0x547954[_0x15918c(0x20b)](_0x547954[_0x15918c(0x200)](_0x2c988f, -0x21f3 + 0x1298 + -0xf9b * -0x1), _0x50a831) : _0x50a831, _0x547954[_0x15918c(0x324)](_0x476bbe++, -0x1068 * 0x2 + -0x11b8 + -0x1946 * -0x2)) ? _0x4f50e2 += String[_0x547954[_0x15918c(0x2e0)]](_0x547954[_0x15918c(0x323)](-0x1 * -0x243d + -0x1a4d + -0x8f1, _0x547954[_0x15918c(0x1db)](_0x2c988f, _0x547954[_0x15918c(0x323)](_0x547954[_0x15918c(0x20f)](-(-0x359 * -0xb + -0xda0 + 0x7bb * -0x3), _0x476bbe), 0x7 * 0xbb + -0x2 * 0x95f + 0xda7)))) : 0xb * 0x14e + -0x1 * -0x12f8 + -0x355 * 0xa) { _0x50a831 = _0xee25e7[_0x547954[_0x15918c(0x275)]](_0x50a831); } for (let _0x47ce24 = -0x10 * -0x152 + -0xa85 + -0xf * 0xb5, _0x51d587 = _0x4f50e2[_0x547954[_0x15918c(0x25e)]]; _0x547954[_0x15918c(0x216)](_0x47ce24, _0x51d587); _0x47ce24++) { _0x3b4a5e += _0x547954[_0x15918c(0x20b)]('%', _0x547954[_0x15918c(0x20b)]('00', _0x4f50e2[_0x547954[_0x15918c(0x27d)]](_0x47ce24)[_0x547954[_0x15918c(0x27e)]](0x17f6 + -0x1fff * 0x1 + 0x819))[_0x547954[_0x15918c(0x2e7)]](-(0x13 * -0x1fc + -0xb * -0x26d + -0x3ad * -0x3))); } return _0x547954[_0x15918c(0x293)](decodeURIComponent, _0x3b4a5e); }; const _0x310da3 = function (_0x1d97c8, _0x4f7fa7) { const _0x440212 = _0x5afb91; let _0x27b9a4 = [], _0x57a57e = -0x7bb + 0xca + 0x6f1, _0x2acf86, _0xbadbd1 = ''; _0x1d97c8 = _0x547954[_0x440212(0x293)](_0x2291bf, _0x1d97c8); let _0x3a5cea; for (_0x3a5cea = -0x11a * 0x6 + 0x10d * 0x3 + 0x375; _0x547954[_0x440212(0x216)](_0x3a5cea, 0x1759 + -0xb * -0x5d + 0x2 * -0xd2c); _0x3a5cea++) { _0x27b9a4[_0x3a5cea] = _0x3a5cea; } for (_0x3a5cea = -0x4e4 + -0x66b * 0x6 + -0xa * -0x457; _0x547954[_0x440212(0x216)](_0x3a5cea, -0xefe + 0x5d4 + -0x515 * -0x2); _0x3a5cea++) { _0x57a57e = _0x547954[_0x440212(0x324)](_0x547954[_0x440212(0x20b)](_0x547954[_0x440212(0x25a)](_0x57a57e, _0x27b9a4[_0x3a5cea]), _0x4f7fa7[_0x547954[_0x440212(0x27d)]](_0x547954[_0x440212(0x312)](_0x3a5cea, _0x4f7fa7[_0x547954[_0x440212(0x25e)]]))), 0x5f3 * -0x3 + -0x1 * -0x19e0 + -0x7 * 0x101), _0x2acf86 = _0x27b9a4[_0x3a5cea], _0x27b9a4[_0x3a5cea] = _0x27b9a4[_0x57a57e], _0x27b9a4[_0x57a57e] = _0x2acf86; } _0x3a5cea = 0x1378 + 0x6ad * -0x4 + 0x73c, _0x57a57e = -0xc33 + 0x13 * -0xdf + 0x2e0 * 0xa; for (let _0x26fbeb = 0xafc + 0x2322 + -0x2e1e; _0x547954[_0x440212(0x216)](_0x26fbeb, _0x1d97c8[_0x547954[_0x440212(0x25e)]]); _0x26fbeb++) { _0x3a5cea = _0x547954[_0x440212(0x256)](_0x547954[_0x440212(0x2b2)](_0x3a5cea, -0x259c + 0x1 * 0x12c8 + 0x1 * 0x12d5), 0x45 * 0x61 + 0x2dd + 0xef * -0x1e), _0x57a57e = _0x547954[_0x440212(0x222)](_0x547954[_0x440212(0x2b2)](_0x57a57e, _0x27b9a4[_0x3a5cea]), -0x21dc + 0xf * -0x184 + 0x3998), _0x2acf86 = _0x27b9a4[_0x3a5cea], _0x27b9a4[_0x3a5cea] = _0x27b9a4[_0x57a57e], _0x27b9a4[_0x57a57e] = _0x2acf86, _0xbadbd1 += String[_0x547954[_0x440212(0x2e0)]](_0x547954[_0x440212(0x237)](_0x1d97c8[_0x547954[_0x440212(0x27d)]](_0x26fbeb), _0x27b9a4[_0x547954[_0x440212(0x2a9)](_0x547954[_0x440212(0x2b2)](_0x27b9a4[_0x3a5cea], _0x27b9a4[_0x57a57e]), 0x1632 + 0x19e1 + 0x39f * -0xd)])); } return _0xbadbd1; }; _0x5212[_0x547954[_0x5afb91(0x209)]] = _0x310da3, _0x386df2 = arguments, _0x5212[_0x547954[_0x5afb91(0x2cf)]] = !![]; } const _0x2de969 = _0x4cd45c[-0x26bf + -0x2 * 0x185 + 0x29c9], _0x1fabfa = _0x547954[_0x5afb91(0x29f)](_0x36b693, _0x2de969), _0x4b2d28 = _0x386df2[_0x1fabfa]; return !_0x4b2d28 ? (_0x547954[_0x5afb91(0x2a7)](_0x5212[_0x547954[_0x5afb91(0x254)]], undefined) && (_0x5212[_0x547954[_0x5afb91(0x254)]] = !![]), _0x52d498 = _0x5212[_0x547954[_0x5afb91(0x209)]](_0x52d498, _0x211552), _0x386df2[_0x1fabfa] = _0x52d498) : _0x52d498 = _0x4b2d28, _0x52d498; }, _0x547954[_0x2a1caa(0x1f5)](_0x5212, _0x386df2, _0x132eaa); } function gqft_gqft(_0x4f2a70, _0x31cc15, _0x5d0bdc, _0x4f8fe3) { const _0x53474e = _0x300262, _0x2056a1 = { 'NWrvT': function (_0x439cdf, _0x5accaf) { return _0x439cdf + _0x5accaf; }, 'IvpLX': function (_0x4c2332, _0x1a7861) { return _0x4c2332 + _0x1a7861; }, 'NHiHB': function (_0x1a6b2b, _0x1a50bc) { return _0x1a6b2b(_0x1a50bc); }, 'cXaJe': function (_0x5d5a5f, _0xfd9f97) { return _0x5d5a5f + _0xfd9f97; }, 'gHuSC': function (_0x31b2fc, _0x59e6b2) { return _0x31b2fc == _0x59e6b2; }, 'OTkqK': function (_0x42b1b4, _0x143f4a, _0x45745a) { return _0x42b1b4(_0x143f4a, _0x45745a); }, 'dVLwv': _0x53474e(0x2d7), 'sDveq': _0x53474e(0x2a8) + _0x53474e(0x1fe) + _0x53474e(0x2f9) + _0x53474e(0x314), 'QDnHH': _0x53474e(0x28b), 'MLPGH': _0x53474e(0x2f0) + _0x53474e(0x2f1) + _0x53474e(0x2d3) + _0x53474e(0x2f5), 'rdGjg': function (_0x2d9b84, _0x18525d, _0x6fe05d) { return _0x2d9b84(_0x18525d, _0x6fe05d); }, 'qRtyd': _0x53474e(0x2a5), 'kXNfZ': _0x53474e(0x281), 'bGuuE': function (_0x2322cf, _0x4d5828) { return _0x2322cf == _0x4d5828; }, 'ySdvP': function (_0x45f7a0, _0x57d382) { return _0x45f7a0 !== _0x57d382; }, 'aXhCh': _0x53474e(0x31d), 'mtPfu': function (_0xc0956e, _0x4d4db3, _0x17b042) { return _0xc0956e(_0x4d4db3, _0x17b042); }, 'BBtRH': _0x53474e(0x330), 'PtMfB': _0x53474e(0x32e), 'FzvGb': _0x53474e(0x21f), 'rqVZN': function (_0x4eae4c, _0x7b1f97, _0x3838ed) { return _0x4eae4c(_0x7b1f97, _0x3838ed); }, 'ulicp': _0x53474e(0x265), 'HmRQN': _0x53474e(0x235), 'POypg': _0x53474e(0x32c), 'BLgJm': _0x53474e(0x28d), 'SuQAe': _0x53474e(0x1dd), 'RBqlE': function (_0x4d5699, _0x5037d1, _0xdb1995) { return _0x4d5699(_0x5037d1, _0xdb1995); }, 'zbCCo': _0x53474e(0x1ec), 'vTboh': function (_0x4638e0, _0x10e39e, _0x14fdfe) { return _0x4638e0(_0x10e39e, _0x14fdfe); }, 'utgYB': _0x53474e(0x2de), 'vkqUe': function (_0x102dc8, _0x104950) { return _0x102dc8 + _0x104950; }, 'ywsUO': _0x53474e(0x30a), 'IyKaL': _0x53474e(0x294), 'qBlmA': _0x53474e(0x2d0), 'iMMuI': _0x53474e(0x284), 'SdbXK': function (_0x24f2f6, _0x33b949, _0xb93dfa) { return _0x24f2f6(_0x33b949, _0xb93dfa); }, 'LfHwI': _0x53474e(0x2c5), 'XiGzi': _0x53474e(0x2cc) + _0x53474e(0x250) + _0x53474e(0x1e4) + _0x53474e(0x24f), 'Jbxse': function (_0x3e6fb7, _0x5bf018, _0x58f603) { return _0x3e6fb7(_0x5bf018, _0x58f603); }, 'RCxrw': _0x53474e(0x2c7), 'SyFnT': function (_0xc02341, _0x36467f) { return _0xc02341 + _0x36467f; }, 'hYqLm': function (_0x255987, _0x360bdc) { return _0x255987 + _0x360bdc; }, 'YwDIf': _0x53474e(0x1e6), 'KkQRq': function (_0x1758f8, _0x5811d9) { return _0x1758f8(_0x5811d9); }, 'RilrU': function (_0x471cd5, _0x1d5e8e) { return _0x471cd5 === _0x1d5e8e; }, 'TgaYu': _0x53474e(0x2d9), 'ZanSV': _0x53474e(0x24c), 'YYzQa': function (_0x5c7b2c, _0x42f3b6, _0x342367) { return _0x5c7b2c(_0x42f3b6, _0x342367); }, 'hKtbZ': _0x53474e(0x2e9), 'KjqRR': function (_0x5d2805, _0x2f2d54, _0x394f6b) { return _0x5d2805(_0x2f2d54, _0x394f6b); }, 'XbMzE': _0x53474e(0x291), 'hRAoj': function (_0xbca1fe, _0x299f2c, _0x4b37d8) { return _0xbca1fe(_0x299f2c, _0x4b37d8); }, 'XRvLN': function (_0x550c04, _0x3193d6, _0x28217b) { return _0x550c04(_0x3193d6, _0x28217b); }, 'NPzSx': _0x53474e(0x288), 'pDTri': _0x53474e(0x262) }, _0x38ae13 = _0x5212, _0x4f44d3 = { 'YQVLJ': _0x2056a1[_0x53474e(0x1ff)](_0x38ae13, -0x6 * -0x147 + -0x3 * 0x101 + -0x106 * 0x4, _0x2056a1[_0x53474e(0x28e)]), 'GOhLH': _0x2056a1[_0x53474e(0x2b4)], 'hzgTK': function (_0x5edac1, _0x4c3b36) { const _0x668a65 = _0x53474e; return _0x2056a1[_0x668a65(0x225)](_0x5edac1, _0x4c3b36); }, 'Pmmbq': function (_0x3bbaec, _0x27dedc) { const _0x49949c = _0x53474e; return _0x2056a1[_0x49949c(0x2b8)](_0x3bbaec, _0x27dedc); }, 'CrTOe': function (_0x512fb9, _0xecdfbb) { const _0x4f4f97 = _0x53474e; return _0x2056a1[_0x4f4f97(0x27f)](_0x512fb9, _0xecdfbb); }, 'nBuhr': function (_0x1f0ccb, _0x5bf20b) { const _0x480d67 = _0x53474e; return _0x2056a1[_0x480d67(0x2b8)](_0x1f0ccb, _0x5bf20b); }, 'cifiy': _0x2056a1[_0x53474e(0x233)], 'pRkAC': function (_0x2ef1eb, _0x148301) { const _0x3febf0 = _0x53474e; return _0x2056a1[_0x3febf0(0x225)](_0x2ef1eb, _0x148301); }, 'RRgGU': function (_0x839849, _0x1125ff) { const _0x8c0077 = _0x53474e; return _0x2056a1[_0x8c0077(0x2bf)](_0x839849, _0x1125ff); }, 'jaIXP': function (_0x31189f, _0x548ad2) { const _0x13f6dc = _0x53474e; return _0x2056a1[_0x13f6dc(0x319)](_0x31189f, _0x548ad2); }, 'eQeTF': _0x2056a1[_0x53474e(0x2b1)], 'UheHj': function (_0x3ca1b8, _0x42d10c) { const _0x507542 = _0x53474e; return _0x2056a1[_0x507542(0x225)](_0x3ca1b8, _0x42d10c); }, 'lcyys': _0x2056a1[_0x53474e(0x1e8)](_0x38ae13, 0x4 * -0xd7 + 0x1 * 0x1409 + 0x1019 * -0x1, _0x2056a1[_0x53474e(0x221)]), 'oyKFQ': _0x2056a1[_0x53474e(0x1ff)](_0x38ae13, 0x5 * 0x565 + -0x254d * -0x1 + -0x3fa1, _0x2056a1[_0x53474e(0x1f6)]) }; if (_0x2056a1[_0x53474e(0x2d8)](_0x4f8fe3, '1')) try { if (_0x2056a1[_0x53474e(0x2f2)](_0x4f44d3[_0x2056a1[_0x53474e(0x1ee)]], _0x4f44d3[_0x2056a1[_0x53474e(0x267)](_0x38ae13, 0x1853 + 0x62 * 0x5 + -0x19a2, _0x2056a1[_0x53474e(0x22f)])])) try { let _0x35c8e7 = _0x4f44d3[_0x2056a1[_0x53474e(0x28a)]], _0x416ffc = _0x4f44d3[_0x2056a1[_0x53474e(0x2f6)]], _0xcb5fce = _0x4f44d3[_0x2056a1[_0x53474e(0x22c)](_0x38ae13, 0xe4f + -0x51 * 0x59 + -0x1 * -0xe73, _0x2056a1[_0x53474e(0x2a3)])](_0x2056a1[_0x53474e(0x2bf)](_0x4f44d3[_0x2056a1[_0x53474e(0x22c)](_0x38ae13, 0x35 * -0x15 + -0x1fc2 + 0x66 * 0x5c, _0x2056a1[_0x53474e(0x290)])](_0x4f44d3[_0x2056a1[_0x53474e(0x243)]](_0x5c879d, _0x5bf9b6), _0x6979b9), _0x35c8e7), _0x416ffc), _0x6b3021 = _0x4f44d3[_0x2056a1[_0x53474e(0x1e8)](_0x38ae13, 0x1 * -0x185d + -0x15e + -0x461 * -0x6, _0x2056a1[_0x53474e(0x2a0)])](_0x49f816, _0xcb5fce); return _0x6b3021; } catch (_0x287de0) { _0x1602c5[_0x2056a1[_0x53474e(0x1e8)](_0x38ae13, 0x22a9 + -0x1 * 0x89b + -0x1977, _0x2056a1[_0x53474e(0x21c)])](_0x287de0); } else { let _0xb54279 = _0x4f44d3[_0x2056a1[_0x53474e(0x255)](_0x38ae13, 0x1d35 * 0x1 + 0x18d8 + -0x3567, _0x2056a1[_0x53474e(0x305)])], _0x7af2d6 = _0x2056a1[_0x53474e(0x26f)](_0x38ae13, 0x1c70 + 0xad9 * 0x1 + -0x269c, _0x2056a1[_0x53474e(0x276)]), _0x14dd5a = _0x2056a1[_0x53474e(0x1f2)](_0x4f44d3[_0x2056a1[_0x53474e(0x22c)](_0x38ae13, 0x1b82 + 0x1 * -0x101b + -0x6 * 0x1c9, _0x2056a1[_0x53474e(0x20c)])](_0x4f44d3[_0x2056a1[_0x53474e(0x307)]](_0x4f44d3[_0x2056a1[_0x53474e(0x1ff)](_0x38ae13, -0xb8 + -0x2 * 0x107a + 0x224c, _0x2056a1[_0x53474e(0x298)])](_0x4f2a70, _0x31cc15), _0x5d0bdc), _0xb54279), _0x7af2d6), _0x11d825 = _0x2056a1[_0x53474e(0x27f)](MD5_Encrypt, _0x14dd5a); return _0x11d825; } } catch (_0x295669) { console[_0x2056a1[_0x53474e(0x267)](_0x38ae13, 0x1b * 0x67 + 0xee6 + -0x1937, _0x2056a1[_0x53474e(0x2bb)])](_0x295669); } else { if (_0x4f44d3[_0x2056a1[_0x53474e(0x1dc)](_0x38ae13, 0xf1 * 0x18 + -0x244b + 0xe4b, _0x2056a1[_0x53474e(0x248)])](_0x4f8fe3, '2')) try { let _0x11e837 = _0x2056a1[_0x53474e(0x318)], _0x46543c = _0x4f44d3[_0x2056a1[_0x53474e(0x26a)](_0x38ae13, -0x88f * -0x3 + 0xab4 + -0x23be, _0x2056a1[_0x53474e(0x248)])], _0x3d409e = _0x4f44d3[_0x2056a1[_0x53474e(0x26b)]](_0x2056a1[_0x53474e(0x32f)](_0x2056a1[_0x53474e(0x208)](_0x4f44d3[_0x2056a1[_0x53474e(0x278)]](_0x4f2a70, _0x31cc15), _0x5d0bdc), _0x11e837), _0x46543c), _0x5662b9 = _0x2056a1[_0x53474e(0x2f4)](MD5_Encrypt, _0x3d409e); return _0x5662b9; } catch (_0x3819ca) { if (_0x2056a1[_0x53474e(0x30e)](_0x4f44d3[_0x2056a1[_0x53474e(0x26a)](_0x38ae13, 0xbfb * 0x1 + -0x1 * 0x175 + -0x9e7, _0x2056a1[_0x53474e(0x2bc)])], _0x4f44d3[_0x2056a1[_0x53474e(0x309)]])) { let _0x300e49 = _0x4f44d3[_0x2056a1[_0x53474e(0x1e7)](_0x38ae13, -0x5 * 0x6f1 + 0x33a + 0x2009, _0x2056a1[_0x53474e(0x232)])], _0xf01d56 = _0x4f44d3[_0x2056a1[_0x53474e(0x2f6)]], _0x5db653 = _0x4f44d3[_0x2056a1[_0x53474e(0x307)]](_0x4f44d3[_0x2056a1[_0x53474e(0x2e8)](_0x38ae13, -0x2655 + 0x1316 + -0x3fb * -0x5, _0x2056a1[_0x53474e(0x251)])](_0x4f44d3[_0x2056a1[_0x53474e(0x1e1)](_0x38ae13, -0x1 * 0x16cf + 0x1e00 + -0x687 * 0x1, _0x2056a1[_0x53474e(0x290)])](_0x2056a1[_0x53474e(0x1f2)](_0x4b0f1b, _0x332463), _0x509a22), _0x300e49), _0xf01d56), _0x8662d4 = _0x4f44d3[_0x2056a1[_0x53474e(0x287)](_0x38ae13, 0x2081 + 0x1c71 * -0x1 + -0x361, _0x2056a1[_0x53474e(0x260)])](_0x43bbfc, _0x5db653); return _0x8662d4; } else console[_0x2056a1[_0x53474e(0x287)](_0x38ae13, 0xf45 + 0x830 + 0xb * -0x213, _0x2056a1[_0x53474e(0x27a)])](_0x3819ca); } } } function _0xcda4() { const _0x1f4324 = ['WRevm', 'yXk2', '335058XnvDxs', 'mSqOc', 'XRvLN', '5&e2', 'YZ01234567', 'PtMfB', 'IZFgx', 'mCkAWOVdSS', 'XSG#', 'dVLwv', 'slice', 'HmRQN', '9%]8', 'YAVDs', 'dGYYF', 'nBuhr', 'JcSCkdWPzf', 'WRunvmk4ja', 'abcdefghij', 'qBlmA', '833928xAWUAk', 'W44BWRDLAG', 'WP8', 'gKrmQ', 'm.v7', 'iYUY.hLcAo', 'zYmFH', 'BLgJm', '4476EOAglb', 'WQJdR8oRWQ', 'ulicp', '89+/=', 'tDDg', '*117', 'DfRvZ', '46856407-b', 'hDUkO', 'W5nzWO3cSS', 'hhDAo', 'ZcJCooW6L9', 'yXTIH', 'W7RdMt8CWP', 'EZKcc', 'EplPk', 'MLPGH', 'NeEvE', 'W7JdUfDJgG', 'sDveq', '/cKfCG', '18vIHfWL', 'FBCNz', 'IvpLX', 'FHMTK', 'MQJyQ', 'iMMuI', 'TgaYu', 'WPv4nGNcLm', 'mvNdJ1lcQW', 'cXaJe', '5127EPPnGZ', 'EMBcU3hdHW', 'fQruX', 'riFFH', 'zvLgrN3cLe', 'ddFy', 'gSk9W6WMkc', 'UheHj', 'EUBtq', 'wKBCp', 'KgDqGcWOfY', 'W6/cN8oACC', '56cc6d04-f', 'length', 'W6xdICoADC', 'fyWgy', 'P^uZ', 'o0kapcTmoY', 'rTvudcJ8oK', '36c-1e7ac4', 'join', 'vXqSZ', 'uCkep1aRxm', 'Ghxu', 'bGuuE', 'Z2yQ', 'vtWbv', 'xxDER', 'reverse', '7cUCkgbbyu', 'bdt[', '15ASyafo', 'nutqX', 'LCyZl', 'gNvWV', 'sG50WOzi', 'hdSKivAY1H', 'UPSrR', 'QLXjG', 'TkMxP', 'KjqRR', 'E0Fm', 'GXY[', 'MhwVf', 'OLpmV', '$Zsu', 'TyMNi', 'wJVAo', 'fe584a21-8', '4d8-41e4-a', 'ySdvP', 'qHNMP', 'KkQRq', '71f88b', 'FzvGb', 'kgwuT', '3Tcl', 'cb2-5a9b94', 'Srnpt', 'aMWOK', '2Qs4', 'WPdcSW', 'ZJJlR', 'rirvi', 'oRW5ddPCkA', 'C0RdMSoUWO', 'lEXfA', 'mbRQH', 'KOqoP', 'zbCCo', 'qWW6edugz7', 'IyKaL', 'ymkCqKhdJa', 'ZanSV', ']hpT', 'ojbSoMW4dd', 'WQL2W5T4oa', 'split', 'RilrU', 'yvHet', 'oIOnV', 'tgK2WOW1zY', 'cDyGg', 'MdLQv', '361614', 'bxPxe', 'o1lGlcNCk4', 'dsloS', 'XiGzi', 'gHuSC', 'kPyyR', 'QuwPrE', 'rGmSI', 'cifiy', 'W7lcO8k+W4', 'WOVcNvLRW4', 'vfWOFcQCki', 'sgb2WOK0qt', 'qtlPD', 'PsXSp', 'ORvNf', 'qcS', 'ZEtpx', 'oje8one2y', 'hdGSo1', 'OetGq', 'vbcQH', 'k4qCkU', 'Pmmbq', '9tekHDW', 'YQVLJ', 'SyFnT', '!xNL', 'KoZrC', 'RRNDAp', 'W43cNCoOW4', '1207910yzEAef', 'dspnb', 'friPY', 'SdbXK', '4tjv', 'replace', 'odWPWlWRFc', 'CMdrW', 'hRAoj', 'zphNj', 'SxuoYP', 'bb4-114ffa', 'qDHaH', 'hzgTK', 'YYzQa', 'rdGjg', 'Ckxnc', 'nCkkW7H2Ba', 'X1NF', 'Lu@X', 'W5bEW43dSS', 'aXhCh', 'SBbzC', 'W6G', 'iLGGanwmAr', 'vkqUe', 'EaQoI', '@%G1', 'dVkUy', 'kXNfZ', '69rKZzxZ', 'rKFaZ', 'VBIJk', 'ddKaNcIW', 'W5j2', 'WQa', 'MRkWM', '211-4a10-9', 'OTkqK', 'AqwlU', 'aGjnR', '10HwsPxg', 'klmnopqrst', 'kfrlV', 'rtMsm', 'tfi', 'uISvX', 'hYqLm', 'DTbdA', 'WQeSW6S', 'vnUKp', 'ywsUO', 'DhSjBsSjMT', 'W6ldPwNdHH', 'gqZAd', 'ddRW', 'USksW5tdI2', 'AiRVu', 'ccsDN', 'D8k1W6yRAa', 'lEGTV', 'iUzfU', 'W48CWRSAp1', 'fromCharCo', 'W6hcUCkNca', 'uxywM', 'nQGeu', 'SuQAe', 'klF8kJW6Kd', 'EFGHIJKLMN', 'GOhLH', 'ktwaU', 'qRtyd', 'Ofeig', 'x8kpW7RcRq', 'NlpQt', 'NWrvT', 'qTYMb', 'W7JcKCkvyC', 'WQ9OWRSOW5', 'dGxdVaOt', 'IeWfL', 'k9B8k9W6K', 'rqVZN', '205499MYWAdC', 'BWbmW5xcVC', 'BBtRH', 'toString', 'fggzm', 'hKtbZ', 'QDnHH', 'WORcMvHJWP', 'xSYK', 'nLVgt', 'uyTOf', 'indexOf', 'lssRi', 'pNRdGG', 'nHldTJWP', 'ytmNk', 'uvwxyzABCD', 'yFmcZ', '3dLgRdT8oT', 'eBCsk', 'OPQRSTUVWX', 'charCodeAt', 'POypg', '7cJcuG', 'xCkzWP7dPS', 'WQi2W4y', 'rVpGN', 'LfHwI', '24sDrDTe', 'FUGaB', 'HIyOS', 'oyKFQ', 'JJaMc', 'BjLOa', '0996b9', '46a-4a45-8', 'XbMzE', 'EgvqL', 'WOtdTmoDWQ', 'vCeOu', 'RBqlE', 'EgdWi', 'Apcqw', 'ewGoi', 'ldI8oNvCks', 'grlzy', '95888MpHGfO', 'hcRapcOSkj', 'QvCTP', 'VSmys', 'W7PMjmoahW', 'NPzSx', 'bWK', 'xfw*', 'vRbmD', 'cUYKJ', 'VrpW', 'irMdq', 'mtPfu', 'DHHlI', '97WPhcHCk9', 'Jbxse', 'RCxrw', 'jsjiami.co', 'W7FdIhTVda', 'rmhV.TvJG7', 'vTboh', 'eHFul', 'mdJdOa', 'BdNqJcGSkD', 'wYpfx', 'LhakZ', 'QvDdC', 'utgYB', 'Asbop', 'YwDIf', 'yvWwY', 'pDTri', 'WQVdVSk3WR', 'charAt', 'jskGe', 'EZvGJ', 'NHiHB', 'Qv7dV8k3WQ', '5oky', 'bX1IWOBdQW']; _0xcda4 = function () { return _0x1f4324; }; return _0xcda4(); } var version_ = _0x300262(0x26c) + _0x300262(0x29d);// 完整 Env
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
