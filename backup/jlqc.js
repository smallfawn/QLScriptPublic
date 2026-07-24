/**
 * new Env("吉利汽车");
 * cron 15 8 * * *  jlqc.js
 * 22/11/23 积分查询 每日分享
 * 22/11/24 文章 评论 签到     
 * 22/11/25 修复长图文 删除评论
 * 23/01/21 增加评论 目前一天17分左右
 * 23/02/11 减少风控 随机API
 * 23/03/03 修复
 * 23/05/25 修复签到
 * ========= 青龙--配置文件 ===========
 * # 吉利汽车
 * export jlqc_data='token'
 * 
 * 多账号用 换行 或 @ 分割
 * 抓包 app.geely.com , 找到 token 的值 , 
 * ====================================
 * 交流 BUG反馈 投稿 群: 862839604
 */



const $ = new Env("吉利汽车");
const ckName = "jlqc_data";
//-------------------- 一般不动变量区域 -------------------------------------
const notify = $.isNode() ? require("./sendNotify") : "";
const Notify = 1;		 //0为关闭通知,1为打开通知,默认为1
let envSplitor = ["@", "\n"]; //多账号分隔符
let msg = '';       //let ck,msg
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
//---------------------- 自定义变量区域 -----------------------------------

async function start() {
    //await getNotice()
    console.log('\n================== 积分查询 ==================\n');
    taskall = [];
    for (let user of userList) {
        console.log(`随机延迟${user.getRandomTime()}ms`);
        taskall.push(await user.info_point());
        await $.wait(user.getRandomTime());
    }
    await Promise.all(taskall);
    console.log('\n================== 每日签到 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckstatus) {
            console.log(`随机延迟${user.getRandomTime()}ms`);
            taskall.push(await user.task_sign());
            await $.wait(user.getRandomTime());
        }

    }
    await Promise.all(taskall);
    /*console.log('\n================== 每日分享 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckstatus) {
            for (let i = 0; i < 3; i++) {
                taskall.push(await user.task_share());
                await $.wait(5000);
            }
        }
    }
    await Promise.all(taskall);*/
    /*console.log('\n================== 发布文章 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckstatus) {
            console.log(`随机延迟${user.getRandomTime()}ms`);
            taskall.push(await user.task_create1());
            await $.wait(user.getRandomTime());
        }
    }
    await Promise.all(taskall);*/
    /*console.log('\n================== 发布图文 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckstatus) {
            taskall.push(await user.task_create2());
            await $.wait(10000);
        }
    }
    await Promise.all(taskall);*/
    /*console.log('\n================== 评论文章 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckstatus) {
            taskall.push(await user.task_artlist());
        }
    }
    await Promise.all(taskall);*/
}


class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        //this.ck1 = str.split('&')[0];
        this.ck = str.split('&')[0];
        this.host = "app.geely.com";
        this.hostname = "https://" + this.host;
        this.ckstatus = true
        this.headersGet = {
            //txcookie: this.ck1,
            devicesn: '356617505697247',
            Host: 'app.geely.com',
            platform: 'Android',
            token: this.ck,
            'user-agent': 'okhttp/4.5.0'
        }
        this.headersPostv1 = {
            // txcookie: this.ck1,
            devicesn: '356617505697247',
            Host: 'app.geely.com',
            platform: 'Android',
            token: this.ck,
            'Content-Type': 'application/json; charset=utf-8',
            'user-agent': 'okhttp/4.5.0'
        }
        this.headersPostv2 = {
            // txcookie: this.ck1,
            devicesn: '356617505697247',
            Host: 'app.geely.com',
            platform: 'Android',
            token: this.ck,
            'Content-Type': 'application/json; charset=utf-8',
            'user-agent': 'okhttp/4.3.1',
            appversion: '3.32'
        }
        //this.randomInt = randomInt(0, 6);
        //this.commentTxtArr = ["真不错啊", "很棒啊", "好可爱啊", "真厉害呀", "我超级想要", "怎么办呐", "哇咔咔"]
        //this.createTxtArr = ["最近有点冷", "今天是周几啊", "今天真暖和啊", "今天有点凉", "大家穿棉服了吗", "晚上吃点啥好呢", "大家那边下雪了吗", "早上吃点啥?"]
        //this.commentTxt = this.commentTxtArr[this.randomInt]
        //this.createTxt = this.createTxtArr[this.randomInt]
        this.imgurl = "https://geely-app-prod.oss-cn-hangzhou.aliyuncs.com/app/life/IMAGE/20221124/4109897683160859157/07779ca2e7694e3fbde886aa33fa4825.jpeg"
    }

    getRandomTime() {
        return randomInt(3000, 9000)
    }

    async info_point() { // 积分查询
        try {
            const options = {
                url: 'https://app.geely.com/api/v1/point/available',
                headers: this.headersGet
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == "success") {
                this.ckstatus = true
                DoubleLog(`账号[${this.index}]  积分: ${result.data.availablePoint}`);
            } else {
                this.ckstatus = false
                DoubleLog(`账号[${this.index}]  积分查询:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_share() { // 执行分享
        try {
            const options = {
                url: 'https://app.geely.com/api/v1/share/awardPoint',
                headers: this.headersPostv1,
                body: ``,
            };
            //console.log(options);
            let result = await httpRequest(options);
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

    async task_sign() { // 执行签到
        var date = new Date(+new Date() + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
        let body = { "signDate": date, "ts": Number(ts10()), "cId": "BLqo2nmmoPgGuJtFDWlUjRI2b1b" }
        try {
            let options = {
                url: 'https://app.geely.com/api/v1/userSign/sign/',
                headers: {
                    'Host': 'app.geely.com',
                    'x-data-sign': enen(body),
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36/geelyApp/android/geelyApp',
                    'token': this.ck,
                    'Content-Type': 'application/json',
                    'origin': 'https://app.geely.com',
                    'x-requested-with': 'com.geely.consumer',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-dest': 'empty',
                    'referer': 'https://app.geely.com/app-h5/sign-in/?showTitleBar=0&needLogin=1'
                },
                body: JSON.stringify(body),
            };
            //console.log(options);
            let result = await httpRequest(options);
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

    async task_create1() { // 发布动态
        let createTxt = await this.hitokoto()
        try {
            let options = {
                url: 'https://app.geely.com/api/v2/topicContent/create',
                headers: this.headersPostv2,
                body: JSON.stringify({ circleId: null, contentType: 1, content: createTxt, fileList: null, longTitle: createTxt, topicList: [] }),
            };
            //console.log(options);
            let result = await httpRequest(options, 'post');
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
                await $.wait(this.getRandomTime());
                console.log(`随机延迟${this.getRandomTime()}ms`);
                DoubleLog("================== 开始删除动态 ==================");
                await this.task_delat(artId);
            } else {
                DoubleLog(`账号[${this.index}]  发布动态:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_create2() { // 发布长图文
        let createTxt = await this.hitokoto()
        try {
            let options = {
                url: this.hostname + '/api/v2/topicContent/create',
                headers: this.headersPostv2,
                body: JSON.stringify({ longImgUrl: this.imgurl, circleId: null, contentType: 2, content: createTxt, fileList: null, longTitle: createTxt, topicList: [] }),
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == "success") {
                DoubleLog(`账号[${this.index}]  发布长图文: ${result.code} [${result.data}]`);
                let artId = result.data;
                await $.wait(15000);
                DoubleLog("================ 开始删除发布长图文 ================");
                await this.task_delat(artId);
            } else {
                DoubleLog(`账号[${this.index}]  发布长图文:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_comment(artid) { // 执行评论
        try {
            let comment = await this.hitokoto(),
                ts = ts10()
            let body = { 'content': comment, 'parentId': '', 'type': '2', 'id': artid, 'ts': ts, 'cId': 'BLqo2nmmoPgGuJtFDWlUjRI2b1b' }
            let options = {
                url: 'https://app.geely.com/apis/api/v2/comment/publisherComment',
                headers: {
                    Host: 'app.geely.com',
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36/android/geelyApp',
                    'x-data-sign': en(body),
                    'Content-Type': 'application/json; charset=utf-8',
                    'devicesn': '356617505697247',
                    'accept': 'application/json, text/plain, */*',
                    txcookie: this.ck1,
                    'platform': 'Android',
                    'token': this.ck2,
                    'origin': 'https://app.geely.com',
                    'x-requested-with': 'com.geely.consumer',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-dest': 'empty',
                    referer: 'https://app.geely.com/app-share/we/dynamic/detail?id=1615575296902418432',
                    //cookie: 'sensorsdata2015jssdkcross={"distinct_id":"185c90a49e018f-0652bc15a1bf3ec-a42722a-326190-185c90a49e10","first_id":"","props":{"$latest_traffic_source_type":"直接流量","$latest_search_keyword":"未取到值_直接打开","$latest_referrer":""},"identities":"eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTg1YzkwYTQ5ZTAxOGYtMDY1MmJjMTVhMWJmM2VjLWE0MjcyMmEtMzI2MTkwLTE4NWM5MGE0OWUxMCJ9","history_login_id":{"name":"","value":""},"$device_id":"185c90a49e018f-0652bc15a1bf3ec-a42722a-326190-185c90a49e10"}'
                },
                body: JSON.stringify({ content: comment, parentId: '', type: '2', id: artid, ts: ts, cId: 'BLqo2nmmoPgGuJtFDWlUjRI2b1b' }),
            };
            //console.log(options);
            let result = await httpRequest(options);
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
                url: this.hostname + '/api/v2/topicContent/deleteContent',
                headers: this.headersPostv2,
                body: JSON.stringify({ id: artid }),
            };
            //console.log(options);
            let result = await httpRequest(options);
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

            options = changeCode(options)
            //console.log(options);
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == "success") {
                DoubleLog(`账号[${this.index}]  文章列表: ${result.data.list[1].id}`);
                DoubleLog(`账号[${this.index}]  文章列表: ${result.data.list[2].id}`);
                DoubleLog(`账号[${this.index}]  文章列表: ${result.data.list[3].id}`);
                let artid1 = result.data.list[1].id
                await this.task_comment(artid1);
                await $.wait(20000)
                let artid2 = result.data.list[2].id
                await this.task_comment(artid2);
                await $.wait(20000)
                let artid3 = result.data.list[3].id
                await this.task_comment(artid3);

            } else {
                DoubleLog(`账号[${this.index}]  获取:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async hitokoto() { // 随机一言
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
    getSign(comtent, id, ts) {
        return jlqc_getSign(comtent, id, ts)
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
/**
 * 获取远程通知
 */
async function getNotice() {
    try {
        const urls = [
            "https://cdn.jsdelivr.net/gh/smallfawn/Note@main/Notice.json",
            "https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/Note/main/Notice.json",
            "https://fastly.jsdelivr.net/gh/smallfawn/Note@main/Notice.json",
            "https://ghproxy.net/https://raw.githubusercontent.com/smallfawn/Note/refs/heads/main/Notice.json",
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
        if (notice) { DoubleLog(notice); }
    } catch (e) {
        console.log(e);
    }
}
function ts10() {
    return Math.round(new Date().getTime() / 1000).toString();
}
/**
 * 随机整数生成
 */
function randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
function randomszdx(e) {
    e = e || 32;
    var t = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890",
        a = t.length,
        n = "";

    for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n;
}
function changeCode(oldoptions) {
    let newoptions = new Object(),
        urlTypeArr = ['qs', 'params'], //urlTypeStr,
        bodyTypeArr = ['body', 'data', 'form', 'formData']//bodyTypeStr
    for (let e in urlTypeArr) {
        //urlTypeStr = urlTypeArr[e]
        urlTypeArr[e] in oldoptions ? newoptions.url = changeUrl(urlTypeArr[e]) : newoptions.url = oldoptions.url
    }
    //'qs' in oldoptions ? newoptions.url = changeUrl('qs') : ('params' in oldoptions ? newoptions.url = changeUrl('params') : newoptions.url = oldoptions.url)
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
    //'body' in oldoptions ? ((Object.prototype.toString.call(oldoptions.body) === '[object Object]') ? newoptions.body = JSON.stringify(oldoptions.body) : newoptions.body = oldoptions.body) : ''
    //'data' in oldoptions ? ((Object.prototype.toString.call(oldoptions.data) === '[object Object]') ? newoptions.body = JSON.stringify(oldoptions.data) : newoptions.body = oldoptions.data) : ''
    //'form' in oldoptions ? ((Object.prototype.toString.call(oldoptions.form) === '[object Object]') ? newoptions.body = JSON.stringify(oldoptions.form) : newoptions.body = oldoptions.form) : ''
    //'formData' in oldoptions ? ((Object.prototype.toString.call(oldoptions.formData) === '[object Object]') ? newoptions.body = JSON.stringify(oldoptions.formData) : newoptions.body = oldoptions.formData) : ''
    for (let o in bodyTypeArr) {
        //bodyTypeStr = bodyTypeArr[o]
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
                        data = JSON.parse(data);
                        //console.log(data);
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
function wait(n) { return new Promise(function (resolve) { setTimeout(resolve, n * 1000) }) }
// 双平台log输出
function DoubleLog(data) { if ($.isNode()) { if (data) { console.log(`${data}`); msg += `\n ${data}` } } else { console.log(`${data}`); msg += `\n ${data}` } }
// 发送消息
async function SendMsg(message) { if (!message) return; if (Notify > 0) { if ($.isNode()) { await notify.sendNotify($.name, message) } else { $.msg($.name, '', message) } } else { console.log(message) } }
// 完整 Env
function en(_0x5be860) {
    i = function (_0x4573b0, _0x3a71a7) {
      var _0xffa1b6 = function () {
          var _0x3b6fb7, _0x299f58;
          _0x3b6fb7 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
          _0x299f58 = {
            "rotl": function (_0x51088f, _0x3dbdf7) {
              return _0x51088f << _0x3dbdf7 | _0x51088f >>> 32 - _0x3dbdf7;
            },
            "endian": function (_0x50f9ee) {
              if (_0x50f9ee.constructor == Number) {
                return 16711935 & _0x299f58.rotl(_0x50f9ee, 8) | 4278255360 & _0x299f58.rotl(_0x50f9ee, 24);
              }
              for (var _0x534163 = 0; _0x534163 < _0x50f9ee.length; _0x534163++) _0x50f9ee[_0x534163] = _0x299f58.endian(_0x50f9ee[_0x534163]);
              return _0x50f9ee;
            },
            "bytesToWords": function (_0x2269b0) {
              for (var _0xfbbb3b = [], _0x1e428f = 0, _0x81bd00 = 0; _0x1e428f < _0x2269b0.length; _0x1e428f++, _0x81bd00 += 8) _0xfbbb3b[_0x81bd00 >>> 5] |= _0x2269b0[_0x1e428f] << 24 - _0x81bd00 % 32;
              return _0xfbbb3b;
            }
          };
          return _0x299f58;
        }(),
        _0x5a466e = {
          "utf8": {
            "stringToBytes": function (_0x2ebfbc) {
              return _0x5a466e.bin.stringToBytes(unescape(encodeURIComponent(_0x2ebfbc)));
            },
            "bytesToString": function (_0x4a59ba) {
              return decodeURIComponent(escape(_0x5a466e.bin.bytesToString(_0x4a59ba)));
            }
          },
          "bin": {
            "stringToBytes": function (_0x16f353) {
              for (var _0x56e9bc = [], _0x3937e9 = 0; _0x3937e9 < _0x16f353.length; _0x3937e9++) _0x56e9bc.push(255 & _0x16f353.charCodeAt(_0x3937e9));
              return _0x56e9bc;
            },
            "bytesToString": function (_0x452303) {
              for (var _0xe423fc = [], _0x235ddb = 0; _0x235ddb < _0x452303.length; _0x235ddb++) _0xe423fc.push(String.fromCharCode(_0x452303[_0x235ddb]));
              return _0xe423fc.join("");
            }
          }
        };
      t = _0x5a466e.utf8;
      if (_0x4573b0.constructor == String) {
        if (_0x3a71a7 && "binary" === _0x3a71a7.encoding) {
          _0x4573b0 = r.stringToBytes(_0x4573b0);
        } else {
          _0x4573b0 = t.stringToBytes(_0x4573b0);
        }
      } else {
        if (n(_0x4573b0)) {
          _0x4573b0 = Array.prototype.slice.call(_0x4573b0, 0);
        } else {
          Array.isArray(_0x4573b0) || _0x4573b0.constructor === Uint8Array || (_0x4573b0 = _0x4573b0.toString());
        }
      }
      for (var _0x36c4c5 = _0xffa1b6.bytesToWords(_0x4573b0), _0x4f2782 = 8 * _0x4573b0.length, _0x9f0318 = 1732584193, _0x177e34 = -271733879, _0x54e849 = -1732584194, _0x241128 = 271733878, _0x1eaf55 = 0; _0x1eaf55 < _0x36c4c5.length; _0x1eaf55++) _0x36c4c5[_0x1eaf55] = 16711935 & (_0x36c4c5[_0x1eaf55] << 8 | _0x36c4c5[_0x1eaf55] >>> 24) | 4278255360 & (_0x36c4c5[_0x1eaf55] << 24 | _0x36c4c5[_0x1eaf55] >>> 8);
      _0x36c4c5[_0x4f2782 >>> 5] |= 128 << _0x4f2782 % 32;
      _0x36c4c5[14 + (_0x4f2782 + 64 >>> 9 << 4)] = _0x4f2782;
      var _0x53179a = i._ff,
        _0x32931e = i._gg,
        _0x462ba4 = i._hh,
        _0x48717b = i._ii;
      for (_0x1eaf55 = 0; _0x1eaf55 < _0x36c4c5.length; _0x1eaf55 += 16) {
        var _0x1eaed6 = _0x9f0318,
          _0x63dbb1 = _0x177e34,
          _0x19c243 = _0x54e849,
          _0x35f0f8 = _0x241128;
        _0x9f0318 = _0x53179a(_0x9f0318, _0x177e34, _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 0], 7, -680876936);
        _0x241128 = _0x53179a(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 1], 12, -389564586);
        _0x54e849 = _0x53179a(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 2], 17, 606105819);
        _0x177e34 = _0x53179a(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 3], 22, -1044525330);
        _0x9f0318 = _0x53179a(_0x9f0318, _0x177e34, _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 4], 7, -176418897);
        _0x241128 = _0x53179a(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 5], 12, 1200080426);
        _0x54e849 = _0x53179a(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 6], 17, -1473231341);
        _0x177e34 = _0x53179a(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 7], 22, -45705983);
        _0x9f0318 = _0x53179a(_0x9f0318, _0x177e34, _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 8], 7, 1770035416);
        _0x241128 = _0x53179a(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 9], 12, -1958414417);
        _0x54e849 = _0x53179a(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 10], 17, -42063);
        _0x177e34 = _0x53179a(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 11], 22, -1990404162);
        _0x9f0318 = _0x53179a(_0x9f0318, _0x177e34, _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 12], 7, 1804603682);
        _0x241128 = _0x53179a(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 13], 12, -40341101);
        _0x54e849 = _0x53179a(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 14], 17, -1502002290);
        _0x9f0318 = _0x32931e(_0x9f0318, _0x177e34 = _0x53179a(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 15], 22, 1236535329), _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 1], 5, -165796510);
        _0x241128 = _0x32931e(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 6], 9, -1069501632);
        _0x54e849 = _0x32931e(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 11], 14, 643717713);
        _0x177e34 = _0x32931e(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 0], 20, -373897302);
        _0x9f0318 = _0x32931e(_0x9f0318, _0x177e34, _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 5], 5, -701558691);
        _0x241128 = _0x32931e(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 10], 9, 38016083);
        _0x54e849 = _0x32931e(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 15], 14, -660478335);
        _0x177e34 = _0x32931e(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 4], 20, -405537848);
        _0x9f0318 = _0x32931e(_0x9f0318, _0x177e34, _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 9], 5, 568446438);
        _0x241128 = _0x32931e(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 14], 9, -1019803690);
        _0x54e849 = _0x32931e(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 3], 14, -187363961);
        _0x177e34 = _0x32931e(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 8], 20, 1163531501);
        _0x9f0318 = _0x32931e(_0x9f0318, _0x177e34, _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 13], 5, -1444681467);
        _0x241128 = _0x32931e(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 2], 9, -51403784);
        _0x54e849 = _0x32931e(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 7], 14, 1735328473);
        _0x9f0318 = _0x462ba4(_0x9f0318, _0x177e34 = _0x32931e(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 12], 20, -1926607734), _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 5], 4, -378558);
        _0x241128 = _0x462ba4(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 8], 11, -2022574463);
        _0x54e849 = _0x462ba4(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 11], 16, 1839030562);
        _0x177e34 = _0x462ba4(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 14], 23, -35309556);
        _0x9f0318 = _0x462ba4(_0x9f0318, _0x177e34, _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 1], 4, -1530992060);
        _0x241128 = _0x462ba4(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 4], 11, 1272893353);
        _0x54e849 = _0x462ba4(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 7], 16, -155497632);
        _0x177e34 = _0x462ba4(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 10], 23, -1094730640);
        _0x9f0318 = _0x462ba4(_0x9f0318, _0x177e34, _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 13], 4, 681279174);
        _0x241128 = _0x462ba4(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 0], 11, -358537222);
        _0x54e849 = _0x462ba4(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 3], 16, -722521979);
        _0x177e34 = _0x462ba4(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 6], 23, 76029189);
        _0x9f0318 = _0x462ba4(_0x9f0318, _0x177e34, _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 9], 4, -640364487);
        _0x241128 = _0x462ba4(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 12], 11, -421815835);
        _0x54e849 = _0x462ba4(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 15], 16, 530742520);
        _0x9f0318 = _0x48717b(_0x9f0318, _0x177e34 = _0x462ba4(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 2], 23, -995338651), _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 0], 6, -198630844);
        _0x241128 = _0x48717b(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 7], 10, 1126891415);
        _0x54e849 = _0x48717b(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 14], 15, -1416354905);
        _0x177e34 = _0x48717b(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 5], 21, -57434055);
        _0x9f0318 = _0x48717b(_0x9f0318, _0x177e34, _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 12], 6, 1700485571);
        _0x241128 = _0x48717b(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 3], 10, -1894986606);
        _0x54e849 = _0x48717b(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 10], 15, -1051523);
        _0x177e34 = _0x48717b(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 1], 21, -2054922799);
        _0x9f0318 = _0x48717b(_0x9f0318, _0x177e34, _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 8], 6, 1873313359);
        _0x241128 = _0x48717b(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 15], 10, -30611744);
        _0x54e849 = _0x48717b(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 6], 15, -1560198380);
        _0x177e34 = _0x48717b(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 13], 21, 1309151649);
        _0x9f0318 = _0x48717b(_0x9f0318, _0x177e34, _0x54e849, _0x241128, _0x36c4c5[_0x1eaf55 + 4], 6, -145523070);
        _0x241128 = _0x48717b(_0x241128, _0x9f0318, _0x177e34, _0x54e849, _0x36c4c5[_0x1eaf55 + 11], 10, -1120210379);
        _0x54e849 = _0x48717b(_0x54e849, _0x241128, _0x9f0318, _0x177e34, _0x36c4c5[_0x1eaf55 + 2], 15, 718787259);
        _0x177e34 = _0x48717b(_0x177e34, _0x54e849, _0x241128, _0x9f0318, _0x36c4c5[_0x1eaf55 + 9], 21, -343485551);
        _0x9f0318 = _0x9f0318 + _0x1eaed6 >>> 0;
        _0x177e34 = _0x177e34 + _0x63dbb1 >>> 0;
        _0x54e849 = _0x54e849 + _0x19c243 >>> 0;
        _0x241128 = _0x241128 + _0x35f0f8 >>> 0;
      }
      return _0xffa1b6.endian([_0x9f0318, _0x177e34, _0x54e849, _0x241128]);
    };
    i._ff = function (_0x4d18ad, _0x37924f, _0x471101, _0x33a5fa, _0x306699, _0x29dbe4, _0x54a86) {
      var _0x5e5cb7 = _0x4d18ad + (_0x37924f & _0x471101 | ~_0x37924f & _0x33a5fa) + (_0x306699 >>> 0) + _0x54a86;
      return (_0x5e5cb7 << _0x29dbe4 | _0x5e5cb7 >>> 32 - _0x29dbe4) + _0x37924f;
    };
    i._gg = function (_0x1761cb, _0x395b69, _0x2264e7, _0x43740c, _0x27d0b8, _0x39edaf, _0x4018db) {
      var _0x5c26fe = _0x1761cb + (_0x395b69 & _0x43740c | _0x2264e7 & ~_0x43740c) + (_0x27d0b8 >>> 0) + _0x4018db;
      return (_0x5c26fe << _0x39edaf | _0x5c26fe >>> 32 - _0x39edaf) + _0x395b69;
    };
    i._hh = function (_0x3dab40, _0x5551d9, _0x4df181, _0x5df43f, _0x4f41a2, _0x528b1e, _0x2b9231) {
      var _0x3c2930 = _0x3dab40 + (_0x5551d9 ^ _0x4df181 ^ _0x5df43f) + (_0x4f41a2 >>> 0) + _0x2b9231;
      return (_0x3c2930 << _0x528b1e | _0x3c2930 >>> 32 - _0x528b1e) + _0x5551d9;
    };
    i._ii = function (_0x3d3f0c, _0x2cf40e, _0x98772b, _0x21295e, _0x185ddc, _0x1794dd, _0x341852) {
      var _0x36f694 = _0x3d3f0c + (_0x98772b ^ (_0x2cf40e | ~_0x21295e)) + (_0x185ddc >>> 0) + _0x341852;
      return (_0x36f694 << _0x1794dd | _0x36f694 >>> 32 - _0x1794dd) + _0x2cf40e;
    };
    i._blocksize = 16;
    i._digestsize = 16;
    function _0x29a34c(_0x2de10f) {
      for (var _0x3601f8 = [], _0x1bef4f = 0; _0x1bef4f < 32 * _0x2de10f.length; _0x1bef4f += 8) _0x3601f8.push(_0x2de10f[_0x1bef4f >>> 5] >>> 24 - _0x1bef4f % 32 & 255);
      return _0x3601f8;
    }
    function _0x57d473(_0x13381c) {
      for (var _0x77c13e = [], _0x15177b = 0; _0x15177b < _0x13381c.length; _0x15177b++) {
        _0x77c13e.push((_0x13381c[_0x15177b] >>> 4).toString(16));
        _0x77c13e.push((15 & _0x13381c[_0x15177b]).toString(16));
      }
      return _0x77c13e.join("");
    }
    function _0x36dc35(_0x1477c4) {
      const _0x4ffd6d = {};
      for (const _0x5c92e1 in _0x1477c4) {
        if ("" !== _0x1477c4[_0x5c92e1] && null !== _0x1477c4[_0x5c92e1] && undefined !== _0x1477c4[_0x5c92e1]) {
          _0x4ffd6d[_0x5c92e1] = _0x1477c4[_0x5c92e1];
        }
      }
      let _0x57c270 = "";
      _0x57c270 = Object.keys(_0x4ffd6d).join(" ");
      let _0x374ba2 = [];
      _0x374ba2 = function (_0x495814) {
        const _0x4e2ce2 = _0x495814.split(/\s+/gi),
          _0x55d3b1 = Array.prototype.sort.call(_0x4e2ce2, function (_0x300171, _0xda27df) {
            for (let _0x40539b = 0; _0x40539b < _0x300171.length; _0x40539b++) if (_0x300171.charCodeAt(_0x40539b) !== _0xda27df.charCodeAt(_0x40539b)) {
              return _0x300171.charCodeAt(_0x40539b) - _0xda27df.charCodeAt(_0x40539b);
            }
          });
        return _0x55d3b1;
      }(_0x57c270);
      let _0x1080ec = "";
      _0x374ba2.forEach(_0x20840c => {
        _0x1080ec += _0x20840c + "=" + _0x4ffd6d[_0x20840c] + "&";
      });
      _0x1080ec = _0x1080ec.slice(0, _0x1080ec.length - 1);
      _0x1080ec += "0]3K@'9MK+6Jf";
      return _0x1080ec;
    }
    function _0x13ac86(_0x1264d1) {
      return _0x57d473(_0x29a34c(i(_0x36dc35(_0x1264d1))));
    }
    return _0x13ac86(_0x5be860);
  }
  function enen(_0x427d20) {
    let _0x2bb948 = _0x427d20;
    var _0x587ceb = {};
    for (var _0x175321 in _0x2bb948) if ("" !== _0x2bb948[_0x175321] && null !== _0x2bb948[_0x175321] && undefined !== _0x2bb948[_0x175321]) {
      _0x587ceb[_0x175321] = _0x2bb948[_0x175321];
    }
    var _0x5e848a = Object.keys(_0x587ceb).join(" ").split(/\s+/gi),
      _0x4b5be8 = Array.prototype.sort.call(_0x5e848a, function (_0x115e4e, _0xd97089) {
        for (var _0x4f167c = 0; _0x4f167c < _0x115e4e.length; _0x4f167c++) if (_0x115e4e.charCodeAt(_0x4f167c) !== _0xd97089.charCodeAt(_0x4f167c)) {
          return _0x115e4e.charCodeAt(_0x4f167c) - _0xd97089.charCodeAt(_0x4f167c);
        }
      }),
      _0x5bef29 = "",
      _0xb00b72 = /^(\d{4})-(\d{2})-(\d{2})/,
      _0x12b1a4 = /(\d{2}):(\d{2}):(\d{2})$/;
    _0x4b5be8.forEach(function (_0x25850c) {
      if (_0xb00b72.test(_0x587ceb[_0x25850c]) && _0x12b1a4.test(_0x587ceb[_0x25850c])) {
        "";
        _0x5bef29 += _0x25850c + "=" + Date.parse(_0x587ceb[_0x25850c].replace(/-/g, "/")) + "&";
      } else {
        _0x5bef29 += _0x25850c + "=" + _0x587ceb[_0x25850c] + "&";
      }
    });
    _0x5bef29 = _0x5bef29.slice(0, _0x5bef29.length - 1);
    _0x5bef29 += "0]3K@'9MK+6Jf";
    function _0x3d6e53(_0x3c027a) {
      function _0x625294(_0x262af1, _0x13aa96) {
        return _0x262af1 << _0x13aa96 | _0x262af1 >>> 32 - _0x13aa96;
      }
      function _0x503769(_0xed1683, _0x3a9f0a) {
        var _0x14b62d, _0x60e289, _0x5a838c, _0x3ac74b, _0x514e01;
        _0x5a838c = 2147483648 & _0xed1683;
        _0x3ac74b = 2147483648 & _0x3a9f0a;
        _0x14b62d = 1073741824 & _0xed1683;
        _0x60e289 = 1073741824 & _0x3a9f0a;
        _0x514e01 = (1073741823 & _0xed1683) + (1073741823 & _0x3a9f0a);
        return _0x14b62d & _0x60e289 ? 2147483648 ^ _0x514e01 ^ _0x5a838c ^ _0x3ac74b : _0x14b62d | _0x60e289 ? 1073741824 & _0x514e01 ? 3221225472 ^ _0x514e01 ^ _0x5a838c ^ _0x3ac74b : 1073741824 ^ _0x514e01 ^ _0x5a838c ^ _0x3ac74b : _0x514e01 ^ _0x5a838c ^ _0x3ac74b;
      }
      function _0x573ba6(_0xa60f71, _0x47db0a, _0x5174b0) {
        return _0xa60f71 & _0x47db0a | ~_0xa60f71 & _0x5174b0;
      }
      function _0xbbc92b(_0xe77b29, _0x4b82b5, _0x200719) {
        return _0xe77b29 & _0x200719 | _0x4b82b5 & ~_0x200719;
      }
      function _0x56a2c5(_0x406396, _0x3e19ba, _0x4b5071) {
        return _0x406396 ^ _0x3e19ba ^ _0x4b5071;
      }
      function _0x3eb299(_0x94b5fb, _0x9d8446, _0x51f6e5) {
        return _0x9d8446 ^ (_0x94b5fb | ~_0x51f6e5);
      }
      function _0x2500e8(_0x19fc59, _0x5b7fff, _0x189026, _0x2f54a7, _0xc38270, _0xd96c87, _0x359c9a) {
        _0x19fc59 = _0x503769(_0x19fc59, _0x503769(_0x503769(_0x573ba6(_0x5b7fff, _0x189026, _0x2f54a7), _0xc38270), _0x359c9a));
        return _0x503769(_0x625294(_0x19fc59, _0xd96c87), _0x5b7fff);
      }
      function _0x37c919(_0x52d2e8, _0x45e060, _0x353c63, _0x27d8e9, _0x25f2d2, _0x546f43, _0x1aa6f9) {
        _0x52d2e8 = _0x503769(_0x52d2e8, _0x503769(_0x503769(_0xbbc92b(_0x45e060, _0x353c63, _0x27d8e9), _0x25f2d2), _0x1aa6f9));
        return _0x503769(_0x625294(_0x52d2e8, _0x546f43), _0x45e060);
      }
      function _0x8c4077(_0x355ab4, _0x1b8f66, _0x37ae44, _0x24fda7, _0xac05e0, _0x255ca8, _0x3f7e62) {
        _0x355ab4 = _0x503769(_0x355ab4, _0x503769(_0x503769(_0x56a2c5(_0x1b8f66, _0x37ae44, _0x24fda7), _0xac05e0), _0x3f7e62));
        return _0x503769(_0x625294(_0x355ab4, _0x255ca8), _0x1b8f66);
      }
      function _0x18c909(_0x59c23a, _0x44a64e, _0x4fdafa, _0x2d7f3b, _0x42ed73, _0x52e095, _0x1277fa) {
        _0x59c23a = _0x503769(_0x59c23a, _0x503769(_0x503769(_0x3eb299(_0x44a64e, _0x4fdafa, _0x2d7f3b), _0x42ed73), _0x1277fa));
        return _0x503769(_0x625294(_0x59c23a, _0x52e095), _0x44a64e);
      }
      function _0x28f791(_0x2e9a8e) {
        for (var _0x4a27b0, _0x5948bd = _0x2e9a8e.length, _0xc15a39 = _0x5948bd + 8, _0x652e71 = (_0xc15a39 - _0xc15a39 % 64) / 64, _0x1d86b2 = 16 * (_0x652e71 + 1), _0x5dd4fe = new Array(_0x1d86b2 - 1), _0x56fd1d = 0, _0x25c7aa = 0; _0x5948bd > _0x25c7aa;) {
          _0x4a27b0 = (_0x25c7aa - _0x25c7aa % 4) / 4;
          _0x56fd1d = _0x25c7aa % 4 * 8;
          _0x5dd4fe[_0x4a27b0] = _0x5dd4fe[_0x4a27b0] | _0x2e9a8e.charCodeAt(_0x25c7aa) << _0x56fd1d;
          _0x25c7aa++;
        }
        _0x4a27b0 = (_0x25c7aa - _0x25c7aa % 4) / 4;
        _0x56fd1d = _0x25c7aa % 4 * 8;
        _0x5dd4fe[_0x4a27b0] = _0x5dd4fe[_0x4a27b0] | 128 << _0x56fd1d;
        _0x5dd4fe[_0x1d86b2 - 2] = _0x5948bd << 3;
        _0x5dd4fe[_0x1d86b2 - 1] = _0x5948bd >>> 29;
        return _0x5dd4fe;
      }
      function _0x1a1713(_0xa72e45) {
        var _0x5da836,
          _0x544dc0,
          _0x2a249f = "",
          _0x2ddade = "";
        for (_0x544dc0 = 0; 3 >= _0x544dc0; _0x544dc0++) {
          _0x5da836 = _0xa72e45 >>> 8 * _0x544dc0 & 255;
          _0x2ddade = "0" + _0x5da836.toString(16);
          _0x2a249f += _0x2ddade.substr(_0x2ddade.length - 2, 2);
        }
        return _0x2a249f;
      }
      function _0x54565d(_0x4b35a7) {
        _0x4b35a7 = _0x4b35a7.replace(/\r\n/g, "\n");
        for (var _0x454643 = "", _0x199c35 = 0; _0x199c35 < _0x4b35a7.length; _0x199c35++) {
          var _0x34dafe = _0x4b35a7.charCodeAt(_0x199c35);
          128 > _0x34dafe ? _0x454643 += String.fromCharCode(_0x34dafe) : _0x34dafe > 127 && 2048 > _0x34dafe ? (_0x454643 += String.fromCharCode(_0x34dafe >> 6 | 192), _0x454643 += String.fromCharCode(63 & _0x34dafe | 128)) : (_0x454643 += String.fromCharCode(_0x34dafe >> 12 | 224), _0x454643 += String.fromCharCode(_0x34dafe >> 6 & 63 | 128), _0x454643 += String.fromCharCode(63 & _0x34dafe | 128));
        }
        return _0x454643;
      }
      var _0x4daa49,
        _0x11594b,
        _0x4dd961,
        _0x2a975f,
        _0x3f80f4,
        _0x4550e0,
        _0x36eeac,
        _0x20bd6b,
        _0x33b079,
        _0x4e8984 = [],
        _0x51d351 = 7,
        _0x1f1ac8 = 12,
        _0xd46af4 = 17,
        _0x20d6aa = 22,
        _0x36ba91 = 5,
        _0x5cd8c9 = 9,
        _0x4824cc = 14,
        _0x51a2ed = 20,
        _0xbbc865 = 4,
        _0x509dbe = 11,
        _0x4db84d = 16,
        _0xb3be61 = 23,
        _0x2e1f72 = 6,
        _0x2f185d = 10,
        _0x4a9a2a = 15,
        _0x297e25 = 21;
      for (_0x3c027a = _0x54565d(_0x3c027a), _0x4e8984 = _0x28f791(_0x3c027a), _0x4550e0 = 1732584193, _0x36eeac = 4023233417, _0x20bd6b = 2562383102, _0x33b079 = 271733878, _0x4daa49 = 0; _0x4daa49 < _0x4e8984.length; _0x4daa49 += 16) {
        _0x11594b = _0x4550e0;
        _0x4dd961 = _0x36eeac;
        _0x2a975f = _0x20bd6b;
        _0x3f80f4 = _0x33b079;
        _0x4550e0 = _0x2500e8(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 0], _0x51d351, 3614090360);
        _0x33b079 = _0x2500e8(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 1], _0x1f1ac8, 3905402710);
        _0x20bd6b = _0x2500e8(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 2], _0xd46af4, 606105819);
        _0x36eeac = _0x2500e8(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 3], _0x20d6aa, 3250441966);
        _0x4550e0 = _0x2500e8(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 4], _0x51d351, 4118548399);
        _0x33b079 = _0x2500e8(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 5], _0x1f1ac8, 1200080426);
        _0x20bd6b = _0x2500e8(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 6], _0xd46af4, 2821735955);
        _0x36eeac = _0x2500e8(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 7], _0x20d6aa, 4249261313);
        _0x4550e0 = _0x2500e8(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 8], _0x51d351, 1770035416);
        _0x33b079 = _0x2500e8(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 9], _0x1f1ac8, 2336552879);
        _0x20bd6b = _0x2500e8(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 10], _0xd46af4, 4294925233);
        _0x36eeac = _0x2500e8(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 11], _0x20d6aa, 2304563134);
        _0x4550e0 = _0x2500e8(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 12], _0x51d351, 1804603682);
        _0x33b079 = _0x2500e8(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 13], _0x1f1ac8, 4254626195);
        _0x20bd6b = _0x2500e8(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 14], _0xd46af4, 2792965006);
        _0x36eeac = _0x2500e8(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 15], _0x20d6aa, 1236535329);
        _0x4550e0 = _0x37c919(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 1], _0x36ba91, 4129170786);
        _0x33b079 = _0x37c919(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 6], _0x5cd8c9, 3225465664);
        _0x20bd6b = _0x37c919(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 11], _0x4824cc, 643717713);
        _0x36eeac = _0x37c919(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 0], _0x51a2ed, 3921069994);
        _0x4550e0 = _0x37c919(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 5], _0x36ba91, 3593408605);
        _0x33b079 = _0x37c919(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 10], _0x5cd8c9, 38016083);
        _0x20bd6b = _0x37c919(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 15], _0x4824cc, 3634488961);
        _0x36eeac = _0x37c919(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 4], _0x51a2ed, 3889429448);
        _0x4550e0 = _0x37c919(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 9], _0x36ba91, 568446438);
        _0x33b079 = _0x37c919(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 14], _0x5cd8c9, 3275163606);
        _0x20bd6b = _0x37c919(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 3], _0x4824cc, 4107603335);
        _0x36eeac = _0x37c919(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 8], _0x51a2ed, 1163531501);
        _0x4550e0 = _0x37c919(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 13], _0x36ba91, 2850285829);
        _0x33b079 = _0x37c919(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 2], _0x5cd8c9, 4243563512);
        _0x20bd6b = _0x37c919(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 7], _0x4824cc, 1735328473);
        _0x36eeac = _0x37c919(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 12], _0x51a2ed, 2368359562);
        _0x4550e0 = _0x8c4077(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 5], _0xbbc865, 4294588738);
        _0x33b079 = _0x8c4077(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 8], _0x509dbe, 2272392833);
        _0x20bd6b = _0x8c4077(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 11], _0x4db84d, 1839030562);
        _0x36eeac = _0x8c4077(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 14], _0xb3be61, 4259657740);
        _0x4550e0 = _0x8c4077(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 1], _0xbbc865, 2763975236);
        _0x33b079 = _0x8c4077(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 4], _0x509dbe, 1272893353);
        _0x20bd6b = _0x8c4077(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 7], _0x4db84d, 4139469664);
        _0x36eeac = _0x8c4077(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 10], _0xb3be61, 3200236656);
        _0x4550e0 = _0x8c4077(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 13], _0xbbc865, 681279174);
        _0x33b079 = _0x8c4077(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 0], _0x509dbe, 3936430074);
        _0x20bd6b = _0x8c4077(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 3], _0x4db84d, 3572445317);
        _0x36eeac = _0x8c4077(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 6], _0xb3be61, 76029189);
        _0x4550e0 = _0x8c4077(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 9], _0xbbc865, 3654602809);
        _0x33b079 = _0x8c4077(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 12], _0x509dbe, 3873151461);
        _0x20bd6b = _0x8c4077(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 15], _0x4db84d, 530742520);
        _0x36eeac = _0x8c4077(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 2], _0xb3be61, 3299628645);
        _0x4550e0 = _0x18c909(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 0], _0x2e1f72, 4096336452);
        _0x33b079 = _0x18c909(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 7], _0x2f185d, 1126891415);
        _0x20bd6b = _0x18c909(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 14], _0x4a9a2a, 2878612391);
        _0x36eeac = _0x18c909(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 5], _0x297e25, 4237533241);
        _0x4550e0 = _0x18c909(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 12], _0x2e1f72, 1700485571);
        _0x33b079 = _0x18c909(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 3], _0x2f185d, 2399980690);
        _0x20bd6b = _0x18c909(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 10], _0x4a9a2a, 4293915773);
        _0x36eeac = _0x18c909(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 1], _0x297e25, 2240044497);
        _0x4550e0 = _0x18c909(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 8], _0x2e1f72, 1873313359);
        _0x33b079 = _0x18c909(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 15], _0x2f185d, 4264355552);
        _0x20bd6b = _0x18c909(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 6], _0x4a9a2a, 2734768916);
        _0x36eeac = _0x18c909(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 13], _0x297e25, 1309151649);
        _0x4550e0 = _0x18c909(_0x4550e0, _0x36eeac, _0x20bd6b, _0x33b079, _0x4e8984[_0x4daa49 + 4], _0x2e1f72, 4149444226);
        _0x33b079 = _0x18c909(_0x33b079, _0x4550e0, _0x36eeac, _0x20bd6b, _0x4e8984[_0x4daa49 + 11], _0x2f185d, 3174756917);
        _0x20bd6b = _0x18c909(_0x20bd6b, _0x33b079, _0x4550e0, _0x36eeac, _0x4e8984[_0x4daa49 + 2], _0x4a9a2a, 718787259);
        _0x36eeac = _0x18c909(_0x36eeac, _0x20bd6b, _0x33b079, _0x4550e0, _0x4e8984[_0x4daa49 + 9], _0x297e25, 3951481745);
        _0x4550e0 = _0x503769(_0x4550e0, _0x11594b);
        _0x36eeac = _0x503769(_0x36eeac, _0x4dd961);
        _0x20bd6b = _0x503769(_0x20bd6b, _0x2a975f);
        _0x33b079 = _0x503769(_0x33b079, _0x3f80f4);
      }
      var _0x2a3416 = _0x1a1713(_0x4550e0) + _0x1a1713(_0x36eeac) + _0x1a1713(_0x20bd6b) + _0x1a1713(_0x33b079);
      return _0x2a3416.toLowerCase();
    }
    return _0x3d6e53(_0x5bef29.toString());
  }
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
