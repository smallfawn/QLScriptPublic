
/**
 * 慕思
 * const $ = new Env("慕思");
 * cron 10 6,15 * * * 慕思.js
 * 活动入口：https://pic.imgdb.cn/item/64eaffc4661c6c8e54806be6.jpg

 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export mshy='api_token#openId'
 * 自己抓包 请求头里的 api_token，请求包里的 openId
 * 抓包后不要打开小程序避免刷新了token，有效期待测试，如出现 “Token有误” 则是 token过期了请重新抓取
 * 多账号可用 换行、&、@ 符号隔开，支持新建多个同名环境变量来设置多账号
 * 奖励：签到每天得积分，积分兑换实物
 * ====================================
 */
const $ = new Env("慕思");
const utils = require("./utils")
let envParams = 'mshy';

let envSplitor = ['\n', '@', '&']

let processEnvParams = ($.isNode() ? process.env[envParams] : $.getdata(envParams)) || '';

let initedJobForTokens = []
let currentUserIndex = 0

class JobTask {
    constructor(str) {
        this.requestUA = generateRandomUA();
        this.index = ++currentUserIndex
        this.valid = false;
        try {
            [this.activedAuthToken, this.openId] = str;
        } catch (error) {
            console.log('参数不完整：自己抓包 请求头里的 api_token，请求包里的 openId')
        }
    }

    async taskApi (fn, method, url, body, moreHeaders = {}) {
        let result = null
        try {
            let urlObject = {
                url: url,
                headers: {
                    'Accept': '*/*',
                    'Accept-Language': 'zh-CN,zh',
                    'Connection': 'keep-alive',
                    'Host': 'atom.musiyoujia.com',
                    'Referer': 'https://servicewechat.com/wx03527497c5369a2c/94/page-frame.html',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'cross-site',
                    'User-Agent': this.requestUA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF XWEB/8379',
                    'api_client_code': '65',
                    'api_token': this.activedAuthToken,
                    'api_version': '1.0.0',
                    'xweb_xhr': '1',
                    'Content-Type': 'application/json',
                    ...moreHeaders
                },
                timeout: 60000,
            }
            if (this.requestUA) {
                urlObject.headers['User-Agent'] = this.requestUA
            }
            if (body) {
                urlObject.body = body
                // urlObject.headers['Content-Length'] = body?.length
            }
            // console.log('urlObject:', urlObject);
            await httpRequest(method, urlObject).then(async (ret) => {
                if (ret.resp?.statusCode == 200) {
                    if (ret.resp?.body) {
                        result = JSON.parse(ret.resp.body)
                    } else {
                        console.log(`账号[${this.index}]调用${method}[${fn}]出错，返回为空`)
                    }
                } else {
                    console.log(`账号[${this.index}]调用${method}[${fn}]出错，返回状态码[${ret.resp?.statusCode || ''}]`, '返回结果：', ret.resp?.body || ret?.err)
                }
            })
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(result);
        }
    }

    async GetUserInfo () {
        try {
            let fn = 'GetUserInfo'
            let method = 'post'
            let url = `https://atom.musiyoujia.com/member/wechatlogin/selectuserinfo`;
            const timestamp = new Date().getTime();
            let moreHeaders = {
                'api_timestamp': timestamp,
                'api_sign': utils?.MD5_Encrypt(`api_client_code=65&api_version=1.0.0&api_timestamp=${timestamp}`)?.toUpperCase()
            }
            let body = `{"appId":"wx03527497c5369a2c","appType":"WECHAT_MINI_PROGRAM","openId":"${this.openId}"}`;
            await this.taskApi(fn, method, url, body, moreHeaders).then(async (result) => {
                if (result?.msg === "success") {
                    this.valid = true;
                    this.customId = result?.data.resMemberInfo.memberId;
                    console.log(`账号[${this.index}] 查询个人信息成功，积分：${result?.data?.memberInfo?.pointInfo?.point}`)
                } else {
                    console.log(`账号[${this.index}] 查询个人信息失败：${result?.msg || JSON.stringify(result)}`)
                    this.valid = false
                }
            })
        } catch (e) {
            console.log(e)
        }
    }

    async GetJob () {
        try {
            let fn = 'GetJob'
            let method = 'post'
            let url = `https://atom.musiyoujia.com/member/memberbehavior/getBehaviorInfos`;
            let body = `{"appId":"wx03527497c5369a2c","appType":"WECHAT_MINI_PROGRAM","behaviorIds":[1,2,10203,10204,10205,5],"sourceChannel":"会员小程序","source":"${this.customId}","openId":"${this.openId}"}`;
            const timestamp = new Date().getTime();
            let moreHeaders = {
                'api_timestamp': timestamp,
                'api_sign': utils?.MD5_Encrypt(`api_token=${this.activedAuthToken}&api_client_code=65&api_version=1.0.0&api_timestamp=${timestamp}`)?.toUpperCase()
            }
            await this.taskApi(fn, method, url, body, moreHeaders).then(async (result) => {
                if (result?.msg === "success") {
                    this.isSigned = result?.data[0].acts['每天已获得积分次数'] === 1;
                    console.log(`账号[${this.index}] 获取任务列表成功，${this.isSigned ? '已签到' : '未签到'}`)
                } else {
                    console.log(`账号[${this.index}] 获取任务列表失败：${result?.msg || JSON.stringify(result)}`)
                }
            })
        } catch (e) {
            console.log(e)
        }
    }

    async Sign () {
        try {
            let fn = 'Sign'
            let method = 'post'
            let url = `https://atom.musiyoujia.com/member/memberbehavior/add`;
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const day = currentDate.getDate();
            let body = `{"appId":"wx03527497c5369a2c","appType":"WECHAT_MINI_PROGRAM","osType":"windows","model":"microsoft","browser":"微信小程序","platform":"1","sourceType":"5","sourceChannel":"会员小程序","siteId":"","visitorId":"","deviceId":"","spotId":"","campaignId":"","deviceType":"","eventLabel":"","eventValue":"","eventAttr2":"${`${year}.${month}.${day}`}","eventAttr3":"","eventAttr4":"","eventAttr5":"","eventAttr6":"","googleCampaignName":"","googleCampaignSource":"","googleCampaignMedium":"","googleCampaignContent":"","memberType":"DeRUCCI","customId":"${this.customId}","locationUrl":"/pages/user/signIn","url":"/pages/user/signIn","pageTitle":"每日签到","logType":"event","behaviorIds":[1,3],"eventCategory":"用户签到","eventAction":"签到","eventAttr1":2,"openId":"${this.openId}"}`;
            const timestamp = new Date().getTime();
            let moreHeaders = {
                'api_timestamp': timestamp,
                'api_sign': utils?.MD5_Encrypt(`api_token=${this.activedAuthToken}&api_client_code=65&api_version=1.0.0&api_timestamp=${timestamp}`)?.toUpperCase()
            }
            await this.taskApi(fn, method, url, body, moreHeaders).then(async (result) => {
                if (result?.msg === "success") {
                    console.log(`账号[${this.index}] 签到成功，获得积分：${result?.data?.point}`)
                } else {
                    console.log(`账号[${this.index}] 签到失败：${result?.msg || JSON.stringify(result)}`)
                }
            })
        } catch (e) {
            console.log(e)
        }
    }

    async doTask () {
        try {
            console.log(`\n============= 账号[${this.index}] 开始获取任务=============`);
            await this.GetJob();
            if (!this.isSigned) {
                console.log(`\n============= 账号[${this.index}] 开始执行 签到任务=============`);
                await this.Sign();
            }
        } catch (e) {
            console.log(e)
        }
    }
}

!(async () => {
    if (typeof $request !== "undefined") {
        await GetRewrite()
    } else {
        if (!(await checkEnv())) return;

        console.log('\n================ 开始执行 ================')
        for (let user of initedJobForTokens) {
            console.log(`----------- 执行 第 [${user.index}] 个账号 -----------`)
            await user.GetUserInfo();
        }

        let validUserList = initedJobForTokens.filter(x => x.valid)

        if (initedJobForTokens.length > 0) {
            console.log('\n================ 任务队列构建完毕 ================')
            for (let user of initedJobForTokens) {
                console.log(`----------- 账号[${user.index}] -----------`)
                await user.doTask();
            }
        } else {
            console.log('\n====幻生提示：无可用账号，请检查配置============ 任务结束 ================')
        }

        await $.showmsg();
    }
})()
    .catch((e) => console.log(e))
    .finally(() => $.done())

async function GetRewrite () {
}

async function checkEnv () {
    if (processEnvParams) {
        let splitor = envSplitor[0];
        for (let sp of envSplitor) {
            if (processEnvParams.indexOf(sp) > -1) {
                splitor = sp;
                break;
            }
        }
        for (let token of processEnvParams.split(splitor)) {
            if (token) initedJobForTokens.push(new JobTask(token?.split('#')))
        }
        userCount = initedJobForTokens.length
    } else {
        console.log('未找到 配置信息，请检查是否配置 变量：', envParams)
        return;
    }

    console.log(`共找到${userCount}个账号`)
    return true
}

function generateRandomUA () {
    var androidVersion = Math.floor(Math.random() * 6) + 8; // 生成 Android 版本号 8-13 之间的随机数
    var androidModels = [
        "PBBM00", "SM-G975F", "Pixel 4", "OnePlus 7T", "Redmi Note 8 Pro",
        "iPhone X", "Galaxy S10", "Huawei P30 Pro", "LG G8 ThinQ", "Sony Xperia 1",
        "Moto G7", "Nokia 9 PureView", "Xiaomi Mi 9", "Google Pixel 3a", "OnePlus 6T",
        "Redmi Note 7", "Samsung Galaxy A50", "Huawei Mate 20 Pro", "LG V40 ThinQ", "Sony Xperia XZ3",
        "Moto Z4", "Nokia 7.1", "Xiaomi Mi Mix 3", "Google Pixel 2", "OnePlus 5T",
        "Redmi Note 6 Pro", "Samsung Galaxy A70", "Huawei P20 Pro", "LG G7 ThinQ", "Sony Xperia XZ2",
        "Moto G6", "Nokia 6.1", "Xiaomi Mi 8", "Google Pixel", "OnePlus 5",
        "Redmi Note 5 Pro", "Samsung Galaxy A30", "Huawei Mate 10 Pro", "LG V30", "Sony Xperia XZ1",
        "Moto X4", "Nokia 5.1", "Xiaomi Mi 6", "Google Pixel XL", "OnePlus 3T",
        "Redmi Note 4", "Samsung Galaxy A20", "Huawei P10 Plus", "LG G6", "Sony Xperia XZ",
        "Moto G5 Plus", "Nokia 3.1", "Xiaomi Mi 5", "Google Pixel 3", "OnePlus 3",
        "Redmi Note 3", "Samsung Galaxy A10", "Huawei Mate 9", "LG V20", "Sony Xperia X Compact",
        "Moto G4", "Nokia 2.2", "Xiaomi Mi 4", "Google Pixel 2 XL", "OnePlus 2",
        "Redmi Note 2", "Samsung Galaxy A5", "Huawei P9", "LG G5", "Sony Xperia X",
        "Moto E6", "Nokia 1", "Xiaomi Mi 3", "Google Pixel 4", "OnePlus One",
        "Redmi Note", "Samsung Galaxy A3", "Huawei P8", "LG G4", "Sony Xperia Z5",
        "Moto E5", "Nokia 3310", "Xiaomi Mi 2", "Google Pixel 4 XL", "OnePlus Nord"
    ]; // 常见的手机型号

    var chromeVersion = "Chrome/" + (Math.floor(Math.random() * 30) + 50) + ".0." + (Math.floor(Math.random() * 1000) + 100); // 生成 Chrome 版本号 50.0.100-79.0.999 之间的随机数

    var ua = "Mozilla/5.0 (Linux; Android " + androidVersion + "; " + androidModels[Math.floor(Math.random() * androidModels.length)] + " Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 " + chromeVersion + " Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;5.3.1;native_app";

    return ua;
}

// 无参数加密：请求地址+时间戳+A749380BBD5A4D93B55B4BE245A42988+Token
// 示例数据：https://api.ikbang.cn/v2/iclick-new/signIn/sign1692923683034A749380BBD5A4D93B55B4BE245A4298839D21A3B3EFF817154C47470BF13E62CF05F956446D53C359688A094E91A9B1F2A67065862923551F147C32E3AFAF778
// 如果请求URL有参数则是 在时间戳 和 盐 之间增加 stringify后的参数（POST）

async function httpRequest (method, url) {
    httpErr = null, httpReq = null, httpResp = null;
    return new Promise((resolve) => {
        $.send(method, url, async (err, req, resp) => {
            httpErr = err, httpReq = req, httpResp = resp;
            resolve({ err, req, resp })
        })
    });
}

function Env (name, env) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("xcxx") > -1 && process.exit(0);
    return new class {
        constructor(name, env) {
            this.name = name
            this.notifyStr = ''
            this.startTime = (new Date).getTime()
            Object.assign(this, env)
            console.log(`${this.name} 开始运行：\n`)
        }
        isNode () {
            return "undefined" != typeof module && !!module.exports
        }
        isQuanX () {
            return "undefined" != typeof $task
        }
        isSurge () {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }
        isLoon () {
            return "undefined" != typeof $loon
        }
        getdata (t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
                    r = s ? this.getval(s) : "";
                if (r)
                    try {
                        const t = JSON.parse(r);
                        e = t ? this.lodash_get(t, i, "") : e
                    } catch (t) {
                        e = ""
                    }
            }
            return e
        }
        setdata (t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
                    o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t),
                        s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t),
                        s = this.setval(JSON.stringify(o), i)
                }
            }
            else {
                s = this.setval(t, e);
            }
            return s
        }
        getval (t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }
        setval (t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }
        send (m, t, e = (() => { })) {
            if (m != 'get' && m != 'post' && m != 'put' && m != 'delete') {
                console.log(`无效的http方法：${m}`);
                return;
            }
            if (m == 'get' && t.headers) {
                delete t.headers["Content-Type"];
                delete t.headers["Content-Length"];
            } else if (t.body && t.headers) {
                if (!t.headers["Content-Type"]) t.headers["Content-Type"] = "application/x-www-form-urlencoded";
            }
            if (this.isSurge() || this.isLoon()) {
                if (this.isSurge() && this.isNeedRewrite) {
                    t.headers = t.headers || {};
                    Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 });
                }
                let conf = {
                    method: m,
                    url: t.url,
                    headers: t.headers,
                    timeout: t.timeout,
                    data: t.body
                };
                if (m == 'get') delete conf.data
                $axios(conf).then(t => {
                    const {
                        status: i,
                        request: q,
                        headers: r,
                        data: o
                    } = t;
                    e(null, q, {
                        statusCode: i,
                        headers: r,
                        body: o
                    });
                }).catch(err => console.log(err))
            } else if (this.isQuanX()) {
                t.method = m.toUpperCase(), this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                    hints: !1
                })),
                    $task.fetch(t).then(t => {
                        const {
                            statusCode: i,
                            request: q,
                            headers: r,
                            body: o
                        } = t;
                        e(null, q, {
                            statusCode: i,
                            headers: r,
                            body: o
                        })
                    }, t => e(t))
            } else if (this.isNode()) {
                this.got = this.got ? this.got : require("got");
                const {
                    url: s,
                    ...i
                } = t;
                this.instance = this.got.extend({
                    followRedirect: false
                });
                this.instance[m](s, i).then(t => {
                    const {
                        statusCode: i,
                        request: q,
                        headers: r,
                        body: o
                    } = t;
                    e(null, q, {
                        statusCode: i,
                        headers: r,
                        body: o
                    })
                }, t => {
                    const {
                        message: s,
                        request: q,
                        response: i
                    } = t;
                    e(s, q, i)
                })
            }
        }
        time (t, x = null) {
            let xt = x ? new Date(x) : new Date
            let e = {
                "M+": xt.getMonth() + 1,
                "d+": xt.getDate(),
                "h+": xt.getHours(),
                "m+": xt.getMinutes(),
                "s+": xt.getSeconds(),
                "q+": Math.floor((xt.getMonth() + 3) / 3),
                S: xt.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (xt.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let s in e)
                new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length)));
            return t
        }
        async showmsg () {
            if (!this.notifyStr) return;
            let notifyBody = this.name + " 运行通知\n\n" + this.notifyStr
            if ($.isNode()) {
                var notify = require('./sendNotify');
                console.log('\n============== 推送 ==============')
                await notify.sendNotify(this.name, notifyBody);
            } else {
                this.msg(notifyBody);
            }
        }
        logAndNotify (str) {
            console.log(str)
            this.notifyStr += str
            this.notifyStr += '\n'
        }
        logAndNotifyWithTime (str) {
            let t = '[' + this.time('hh:mm:ss.S') + ']' + str
            console.log(t)
            this.notifyStr += t
            this.notifyStr += '\n'
        }
        logWithTime (str) {
            console.log('[' + this.time('hh:mm:ss.S') + ']' + str)
        }
        msg (e = t, s = "", i = "", r) {
            const o = t => {
                if (!t)
                    return t;
                 if ("string" == typeof t)
                    return this.isLoon() ? t : this.isQuanX() ? {
                        "open-url": t
                    }
                        : this.isSurge() ? {
                            url: t
                        }
                            : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"],
                            s = t.mediaUrl || t["media-url"];
                        return {
                            openUrl: e,
                            mediaUrl: s
                        }
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl,
                            s = t["media-url"] || t.mediaUrl;
                        return {
                            "open-url": e,
                            "media-url": s
                        }
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {
                            url: e
                        }
                    }
                }
            };
            this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r)));
            let h = ["", "============== 系统通知 =============="];
            h.push(e),
                s && h.push(s),
                i && h.push(i),
                console.log(h.join("\n"))
        }
        getMin (a, b) {
            return ((a < b) ? a : b)
        }
        getMax (a, b) {
            return ((a < b) ? b : a)
        }
        padStr (num, length, padding = '0') {
            let numStr = String(num)
            let numPad = (length > numStr.length) ? (length - numStr.length) : 0
            let retStr = ''
            for (let i = 0; i < numPad; i++) {
                retStr += padding
            }
            retStr += numStr
            return retStr;
        }
        json2str (obj, c, encodeUrl = false) {
            let ret = []
            for (let keys of Object.keys(obj).sort()) {
                let v = obj[keys]
                if (v && encodeUrl) v = encodeURIComponent(v)
                ret.push(keys + '=' + v)
            }
            return ret.join(c);
        }
        str2json (str, decodeUrl = false) {
            let ret = {}
            for (let item of str.split('&')) {
                if (!item) continue;
                let idx = item.indexOf('=')
                if (idx == -1) continue;
                let k = item.substr(0, idx)
                let v = item.substr(idx + 1)
                if (decodeUrl) v = decodeURIComponent(v)
                ret[k] = v
            }
            return ret;
        }
        randomString (len, charset = 'abcdef0123456789') {
            let str = '';
            for (let i = 0; i < len; i++) {
                str += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return str;
        }
        randomList (a) {
            let idx = Math.floor(Math.random() * a.length)
            return a[idx]
        }
        wait (t) {
            return new Promise(e => setTimeout(e, t))
        }
        done (t = {}) {
            const e = (new Date).getTime(),
                s = (e - this.startTime) / 1e3;
            console.log(`\n${this.name} 运行结束，共运行了 ${s} 秒！`)
            if (this.isSurge() || this.isQuanX() || this.isLoon()) $done(t)
        }
    }(name, env)
}
