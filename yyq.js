/**
 * 悦野圈
 * cron 7 8 * * *  yyq.js
 * 23/04/14  签到 点赞 评论 分享
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export yyq_data='Cookie&13111111 @ Cookie&13111111'
 * 
 * 多账号用 换行 或 @ 分割
 * 抓包 https://customer.yueyequan.cn/ , 找到 headers中的 Cookie和userid=后面的值  即可
 * ====================================
 *   
 */



const $ = new Env("悦野圈");
const ckName = "yyq_data";
//-------------------- 一般不动变量区域 -------------------------------------
const Notify = 1;         //0为关闭通知,1为打开通知,默认为1
const notify = $.isNode() ? require('./sendNotify') : '';
let envSplitor = ["@","\n"]; //多账号分隔符
let msg = '';       //let ck,msg
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
//---------------------- 自定义变量区域 -----------------------------------
//---------------------------------------------------------

async function start() {

    await notice()
    console.log('\n================== 用户信息 ==================\n');
    taskall = [];
    for (let user of userList) {
        console.log(`随机延迟${user.getRandomTime()}ms`);
        taskall.push(await user.user_info());
        await $.wait(user.getRandomTime()); //延迟  1秒  可充分利用 $.环境函数
    }
    await Promise.all(taskall);
    console.log('\n================== 签到 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            console.log(`随机延迟${user.getRandomTime()}ms`);
            taskall.push(await user.task_signIn());
            await $.wait(user.getRandomTime());
        }
    }
    await Promise.all(taskall);
    //获取文章
    for (let user of userList) {
        if (user.ckStatus) {
            taskall.push(await user.get_list());
            await $.wait(user.getRandomTime());
        }
        //console.log(user.articleIdArr);

    }
    console.log('\n================== 点赞 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            console.log(`随机延迟${user.getRandomTime()}ms`);
            for (let o = 0; o < 5; o++) {
                taskall.push(await user.task_like(user.articleIdArr[o]));
                await $.wait(user.getRandomTime());
            }
        }
    }
    await Promise.all(taskall);

    /*console.log('\n================== 评论 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            console.log(`随机延迟${user.getRandomTime()}ms`);
            for (let o = 0; o < 5; o++) {
                taskall.push(await user.task_add(user.articleIdArr[o]));
                await $.wait(user.getRandomTime());
            }
        }
    }
    await Promise.all(taskall);*/
    console.log('\n================== 分享 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            console.log(`随机延迟${user.getRandomTime()}ms`);
            for (let o = 0; o < 5; o++) {
                taskall.push(await user.task_share(user.articleIdArr[o]));
                await $.wait(user.getRandomTime());
            }
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
        //this.userId = this.ck.match(/userid=(\S*);Path=\/;usersig=/)[1];
        this.userId = str.split('&')[1]; //单账号多变量分隔符;
        this.headers = {
            'User-Agent': 'okhttp/3.14.9 (Android 10; Xiaomi MI 8 Lite Build/V12.0.1.0.QDTCNXM 2.1.0 20100 release baicorvApp)',
            'appInfo': '{"appVersion":"2.1.0","osVersion":"Android 10","appType":"Android","deviceId":"4390c5f92dd2fa05a38f8bd6c10775f6@1681389949113","deviceName":"Xiaomi MI 8 Lite"}',
            'appTheme': 'AQUA',
            'Cookie': this.ck,
            'Cache-Control': 'no-cache',
            'ice-auth-appkey': 9669092353,
            'userid': this.userId,
            'Host': 'customer.yueyequan.cn',
            'Connection': 'Keep-Alive',
        }
        this.articleIdArr = []

    }
    getRandomTime() {
        return randomInt(3000, 9000)
    }
    getSign(method, path, timestamp, data) {
        let baseData
        if (method == 'GET') {
            baseData = `${method}${path}ice-auth-appkey:9669092353ice-auth-timestamp:${timestamp}${data}c634d5e29a7afd8118eb18a028524835`
        } else {
            baseData = `${method}${path}ice-auth-appkey:9669092353ice-auth-timestamp:${timestamp}json=${data}c634d5e29a7afd8118eb18a028524835`
        }
        baseData = encodeURI(baseData)
        //console.log(baseData);
        return SHA256_Encrypt(baseData)
    }
    async user_info() {
        try {
            let options = {
                url: `https://customer.yueyequan.cn/comu-core/v1.0/common/app/user/getMe?userId=${this.userId}`,
                headers: this.headers
            }

            options.headers['ice-auth-timestamp'] = ts13()
            options.headers['ice-auth-sign'] = this.getSign('GET', '/comu-core/v1.0/common/app/user/getMe', ts13(), `userId=${this.userId}`)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  欢迎用户: ${result.data.nickName}`);
                this.ckStatus = true
            } else {
                DoubleLog(`账号[${this.index}]  用户查询:失败 ❌ 了呢,原因未知！`);
                this.ckStatus = false
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_signIn() {
        try {
            let options = {
                url: `https://customer.yueyequan.cn/comu-mem/member/v1.0/common/app/user/signIn`,
                headers: this.headers,
                body: `userId=${this.userId}`
            }
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
            options.headers['ice-auth-timestamp'] = ts13()
            options.headers['ice-auth-sign'] = this.getSign('POST', '/comu-mem/member/v1.0/common/app/user/signIn', ts13(), `userId=${this.userId}`)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  签到: [${result.msg}]`);
            } else {
                DoubleLog(`账号[${this.index}]  签到:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async get_list() {
        try {
            let options = {
                url: `https://customer.yueyequan.cn/comu-core/v1/app/newPopular?pageSize=20&pageNum=1`,
                headers: this.headers
            }
            options.headers['ice-auth-timestamp'] = ts13()
            options.headers['ice-auth-sign'] = this.getSign('GET', '/comu-core/v1/app/newPopular', ts13(), 'pageSize=20pageNum=1')
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                for (let i = 0; i < 20; i++) {
                    this.articleIdArr.push(result.data.records[i].entity.id)
                }
            } else {
                console.log(`获取文章失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_like(articleId) {
        try {
            let options = {
                url: `https://customer.yueyequan.cn/comu-core/v1.0/creation/like`,
                headers: this.headers,
                body: JSON.stringify({ "entityId": `${articleId}`, "entityType": "002", "userId": `${this.userId}` })
            }
            options.headers['Content-Type'] = 'application/json;charset=UTF-8'
            options.headers['ice-auth-timestamp'] = ts13()
            options.headers['ice-auth-sign'] = this.getSign('POST', '/comu-core/v1.0/creation/like', ts13(), `{"entityId":${articleId},"entityType":"002","userId":${this.userId}}`)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  点赞: [${result.msg}] [${articleId}]`);
            } else {
                DoubleLog(`账号[${this.index}]  点赞:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_add(articleId) {
        try {
            let txt = await hitokoto()
            let options = {
                url: `https://customer.yueyequan.cn/comu-core/v1.0/comment/addComment`,
                headers: this.headers,
                body: JSON.stringify({ "content": "" + txt + "" + + "", "parentId": "0", "targetName": "", "entityId": `${articleId}`, "entityType": "002", "source": "" })
            }
            options.headers['Content-Type'] = 'application/json;charset=UTF-8'
            options.headers['ice-auth-timestamp'] = ts13()
            options.headers['ice-auth-sign'] = this.getSign('POST', '/comu-core/v1.0/comment/addComment', ts13(), `{"content":"加油","parentId":"0","targetName":"","entityId":${articleId},"entityType":"002","source":""}`)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  评论：[${result.msg}] [${articleId}]`);
            } else {
                DoubleLog(`账号[${this.index}]  评论:失败 ❌ 了呢,原因未知！`); console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_share(articleId) {
        try {
            let options = {
                url: `https://customer.yueyequan.cn/comu-mem/member/v2/share`,
                headers: this.headers,
                body: JSON.stringify({ "id": `${articleId}`, "type": "4" })
            }
            options.headers['Content-Type'] = 'application/json;charset=UTF-8'
            options.headers['ice-auth-timestamp'] = ts13()
            options.headers['ice-auth-sign'] = this.getSign('POST', '/comu-mem/member/v2/share', ts13(), `{"id":${articleId},"type":"4"}`)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  分享：[${result.msg}] [${articleId}]`);
            } else {
                DoubleLog(`账号[${this.index}]  分享:失败 ❌ 了呢,原因未知！`); console.log(result);
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
function randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
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
/**
 * SHA256 加密  
 */
function SHA256_Encrypt(data) {
    sha256_init();
    sha256_update(data, data.length);
    sha256_final();
    return sha256_encode_hex();
}
/* SHA256 logical functions */ function rotateRight(n, x) { return (x >>> n) | (x << (32 - n)); } function choice(x, y, z) { return (x & y) ^ (~x & z); } function majority(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); } function sha256_Sigma0(x) { return rotateRight(2, x) ^ rotateRight(13, x) ^ rotateRight(22, x); } function sha256_Sigma1(x) { return rotateRight(6, x) ^ rotateRight(11, x) ^ rotateRight(25, x); } function sha256_sigma0(x) { return rotateRight(7, x) ^ rotateRight(18, x) ^ (x >>> 3); } function sha256_sigma1(x) { return rotateRight(17, x) ^ rotateRight(19, x) ^ (x >>> 10); } function sha256_expand(W, j) { return (W[j & 0x0f] += sha256_sigma1(W[(j + 14) & 0x0f]) + W[(j + 9) & 0x0f] + sha256_sigma0(W[(j + 1) & 0x0f])); } /* Hash constant words K: */ var K256 = new Array(0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2); /* global arrays */ var ihash, count, buffer; var sha256_hex_digits = "0123456789abcdef"; /* Add 32-bit integers with 16-bit operations (bug in some JS-interpreters: overflow) */ function safe_add(x, y) { var lsw = (x & 0xffff) + (y & 0xffff); var msw = (x >> 16) + (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xffff); } /* Initialise the SHA256 computation */ function sha256_init() { ihash = new Array(8); count = new Array(2); buffer = new Array(64); count[0] = count[1] = 0; ihash[0] = 0x6a09e667; ihash[1] = 0xbb67ae85; ihash[2] = 0x3c6ef372; ihash[3] = 0xa54ff53a; ihash[4] = 0x510e527f; ihash[5] = 0x9b05688c; ihash[6] = 0x1f83d9ab; ihash[7] = 0x5be0cd19; } /* Transform a 512-bit message block */ function sha256_transform() { var a, b, c, d, e, f, g, h, T1, T2; var W = new Array(16); /* Initialize registers with the previous intermediate value */ a = ihash[0]; b = ihash[1]; c = ihash[2]; d = ihash[3]; e = ihash[4]; f = ihash[5]; g = ihash[6]; h = ihash[7]; /* make 32-bit words */ for (var i = 0; i < 16; i++) W[i] = buffer[(i << 2) + 3] | (buffer[(i << 2) + 2] << 8) | (buffer[(i << 2) + 1] << 16) | (buffer[i << 2] << 24); for (var j = 0; j < 64; j++) { T1 = h + sha256_Sigma1(e) + choice(e, f, g) + K256[j]; if (j < 16) T1 += W[j]; else T1 += sha256_expand(W, j); T2 = sha256_Sigma0(a) + majority(a, b, c); h = g; g = f; f = e; e = safe_add(d, T1); d = c; c = b; b = a; a = safe_add(T1, T2); } /* Compute the current intermediate hash value */ ihash[0] += a; ihash[1] += b; ihash[2] += c; ihash[3] += d; ihash[4] += e; ihash[5] += f; ihash[6] += g; ihash[7] += h; } /* Read the next chunk of data and update the SHA256 computation */ function sha256_update(data, inputLen) { var i, index, curpos = 0; /* Compute number of bytes mod 64 */ index = (count[0] >> 3) & 0x3f; var remainder = inputLen & 0x3f; /* Update number of bits */ if ((count[0] += inputLen << 3) < inputLen << 3) count[1]++; count[1] += inputLen >> 29; /* Transform as many times as possible */ for (i = 0; i + 63 < inputLen; i += 64) { for (var j = index; j < 64; j++) buffer[j] = data.charCodeAt(curpos++); sha256_transform(); index = 0; } /* Buffer remaining input */ for (var j = 0; j < remainder; j++) buffer[j] = data.charCodeAt(curpos++); } /* Finish the computation by operations such as padding */ function sha256_final() { var index = (count[0] >> 3) & 0x3f; buffer[index++] = 0x80; if (index <= 56) { for (var i = index; i < 56; i++) buffer[i] = 0; } else { for (var i = index; i < 64; i++) buffer[i] = 0; sha256_transform(); for (var i = 0; i < 56; i++) buffer[i] = 0; } buffer[56] = (count[1] >>> 24) & 0xff; buffer[57] = (count[1] >>> 16) & 0xff; buffer[58] = (count[1] >>> 8) & 0xff; buffer[59] = count[1] & 0xff; buffer[60] = (count[0] >>> 24) & 0xff; buffer[61] = (count[0] >>> 16) & 0xff; buffer[62] = (count[0] >>> 8) & 0xff; buffer[63] = count[0] & 0xff; sha256_transform(); } /* Split the internal hash values into an array of bytes */ function sha256_encode_bytes() { var j = 0; var output = new Array(32); for (var i = 0; i < 8; i++) { output[j++] = (ihash[i] >>> 24) & 0xff; output[j++] = (ihash[i] >>> 16) & 0xff; output[j++] = (ihash[i] >>> 8) & 0xff; output[j++] = ihash[i] & 0xff; } return output; } /* Get the internal hash as a hex string */ function sha256_encode_hex() { var output = new String(); for (var i = 0; i < 8; i++) { for (var j = 28; j >= 0; j -= 4) output += sha256_hex_digits.charAt((ihash[i] >>> j) & 0x0f); } return output; }
// 完整 Env
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
