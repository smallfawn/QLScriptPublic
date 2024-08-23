
/**
 *
 * zippo
 *
 * cron 0 0,7 * * *  zippo.js         
 *  多账号并行执行任务模板 
 * 抓域名wx-center.zippo.com.cn/下 请求authorization
 * export zippo=    多账号换行或者&
 */
//=====================================================//
const $ = new Env("zippo");
const notify = $.isNode() ? require("./sendNotify") : "";
const Notify = 1
const debug = 0
const axios = require("axios");
let ckStr = ($.isNode() ? process.env.zippo : $.getdata('zippo')) || '';  //检测CK  外部
let msg, ck;
let host = 'wx-center.zippo.com.cn';
let hostname = 'https://' + host;
let scriptVersionNow = "1.0.1";
//---------------------------------------------------//
async function tips(ckArr) {
    //DoubleLog(`当前脚本版本${Version}\n📌,如果脚本版本不一致请及时更新`);
    console.log("完成积分签到与收藏任务");
    DoubleLog(`\n========== 共找到 ${ckArr.length} 个账号 ==========`);
    debugLog(`【debug】 这是你的账号数组:\n ${ckArr}`);
}
!(async () => {
    let ckArr = await checkEnv(ckStr, "zippo");  //检查CK
    await getNotice();  //远程通知
    await getVersion("yang7758258/ohhh154@main/zippo会员签到.js");
    await tips(ckArr);  //脚本提示
    await start();      //开始任务
    await SendMsg(msg); //发送通知

})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done());


//---------------------------------------------------------------------------------封装循环测试
async function newstart(name, taskname, time) {  //任务名 函数名 等待时间
    let ckArr = await checkEnv(ckStr, "zippo");  //检查CK
    console.log("\n📌📌📌📌📌📌📌📌" + name + "📌📌📌📌📌📌📌📌");
    for (i = 0; i < ckArr.length; i++) {
        ck = ckArr[i].split("&");                 //单账号多变量分割符,如果一个账号需要user和token两个变量,那么则输入user1&token1@user2&token2...   
        //let CK = ckArr[i]
        await taskname();
        await $.wait(time * 1000);
    }
}
//-------------------------------------------------------------------------------封装循环测试

async function start() {
    await newstart("登录/CK检测", userinfo, 1);
    await newstart("开始签到", dailySign, 1);
    await newstart("开始收藏任务", shoucang, 1);
    await newstart("开始领取", lingjiang, 1);
    await newstart("当前积分查询", jifen, 1);
}




//------------------------------------------------------------------------------------------
//用户信息查询
async function userinfo() {
    try {
        let url = {
            url: `${hostname}/api/users/profile`,
            headers: {
                'x-app-id': 'zippo',
                'x-platform-id': 'wxaa75ffd8c2d75da7',
                'x-platform-env': 'release',
                'x-platform': 'wxmp',
                'authorization': ck[0],
                'xweb_xhr': 1,
                'sec-fetch-site': 'cross-site',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'referer': 'https://servicewechat.com/wxaa75ffd8c2d75da7/76/page-frame.html',
                'accept-language': 'zh-CN,zh;q=0.9',
            },

        };
        let result = await httpGet(url, `用户信息查询`);

        //console.log(result);
        if (result?.code != 401) {
            DoubleLog(`账号[` + Number(i + 1) + `]` + `当前用户为🌸[${result.phone}]🎉`);
            //let phone = result.data.phone
            //let jifen = result?.data.memberInfo.totalScore
        } if (result?.code == 401) {
            DoubleLog(`账号[` + Number(i + 1) + `]` + `查询失败,可能是CK失效!`);
            //console.log(result);
        }
        
    } catch (error) {
        //console.log(error);
        console.log("服务器卡爆啦");
    }

}

//积分查询
async function jifen() {
    try {
        let url = {
            url: `${hostname}/api/users/points?withoutList=1`,
            headers: {
                'x-app-id': 'zippo',
                'x-platform-id': 'wxaa75ffd8c2d75da7',
                'x-platform-env': 'release',
                'x-platform': 'wxmp',
                'authorization': ck[0],
                'xweb_xhr': 1,
                'sec-fetch-site': 'cross-site',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'referer': 'https://servicewechat.com/wxaa75ffd8c2d75da7/76/page-frame.html',
                'accept-language': 'zh-CN,zh;q=0.9',
            },

        };
        let result = await httpGet(url, `当前积分查询`);
        if (result?.balance != 0) {
            DoubleLog(`账号[` + Number(i + 1) + `]` + `当前积分为💰[${result.balance}]🎉`);
        }if (result?.code == 401) {
            DoubleLog(`账号[` + Number(i + 1) + `]` + `查询失败,可能是CK失效!`);
        }
        
        
        


    } catch (error) {
        console.log("请检查环境变量是否正确");
        
    }
    
}






//用户签到 POST
async function dailySign() {
    try {
        let url = {
            url: `${hostname}/api/daily-signin`,
            headers: {
                'x-app-id': 'zippo',
                'x-platform-id': 'wxaa75ffd8c2d75da7',
                'x-platform-env': 'release',
                'x-platform': 'wxmp',
                'authorization': ck[0],
                'xweb_xhr': 1,
                'sec-fetch-site': 'cross-site',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'referer': 'https://servicewechat.com/wxaa75ffd8c2d75da7/76/page-frame.html',
                'accept-language': 'zh-CN,zh;q=0.9',
            },
        };
        let result = await httpPost(url, `签到`);

        //console.log(result);
        if (result?.code != 'already_signed') {
            DoubleLog(`账号[` + Number(i + 1) + `]` + `签到成功,获得积分:${result.count}🎉`);
            await wait(2);
        } if (result?.code == 'already_signed') {
            DoubleLog(`账号[` + Number(i + 1) + `]` + `签到失败:${result.message}`);
        }
        
           
        
    } catch (error) {
        //console.log(error);
        console.log("好像出了点小问题");
    }

}
//用户收藏任务 POST
async function shoucang() {
    try {
        let host = 'wx-center.zippo.com.cn';
        let hostname = 'https://' + host;
        let url = `${hostname}/api/favorites`
        let body = {
                    "targetType": "sku",
                    "targetId": "265",
                    "favorited": true
    }
        
        const  result = await axios.post(url, body, {
        headers: {
            'x-app-id': 'zippo',
            'x-platform-id': 'wxaa75ffd8c2d75da7',
            'x-platform-env': 'release',
            'x-platform': 'wxmp',
            'authorization': ck[0],
            'xweb_xhr': '1',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://servicewechat.com/wxaa75ffd8c2d75da7/76/page-frame.html',
            'accept-language': 'zh-CN,zh;q=0.9',
        }
    })   
        const r = result.data;
        //console.log(result);
        if (r?.favorited == true) {
            DoubleLog(`账号[` + Number(i + 1) + `]` + `任务成功,id编号:${result.data.targetId}🎉`);
            await wait(2);
        }if (r?.code == 400) {
            DoubleLog(`账号[` + Number(i + 1) + `]` + `任务失败:${result.data.message}`);
        }
    }catch (error) {
        //console.log(error);
        console.log("好像出了点小问题");
    }
}

//用户领奖 POST
async function lingjiang() {
    try {
        let url = {
            url: `${hostname}/api/missions/5/rewards`,
            headers: {
                'x-app-id': 'zippo',
                'x-platform-id': 'wxaa75ffd8c2d75da7',
                'x-platform-env': 'release',
                'x-platform': 'wxmp',
                'authorization': ck[0],
                'xweb_xhr': 1,
                'sec-fetch-site': 'cross-site',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'referer': 'https://servicewechat.com/wxaa75ffd8c2d75da7/76/page-frame.html',
                'accept-language': 'zh-CN,zh;q=0.9',
            },
            body: JSON.stringify({"id":5}),
        };
        let result = await httpPost(url, `领取奖励`);

        //console.log(result);
        if (result?.rewardValue == 5) {
            DoubleLog(`账号[` + Number(i + 1) + `]` + `领取成功,获得积分💰:${result.rewardValue}🎉`);
            await wait(2);
        } if (result?.code == 400) {
            DoubleLog(`账号[` + Number(i + 1) + `]` + `领取失败:${result.message}`);
        }
        
           
        
    } catch (error) {
        //console.log(error);
        console.log("好像出了点小问题");
    }

}



// #region ********************************************************  固定代码  ********************************************************
/**
 * 变量检查
 */
async function checkEnv(ck, Variables) {
    return new Promise((resolve) => {
        let ckArr = []
        if (ck) {
            if (ck.indexOf("@") !== -1) {

                ck.split("@").forEach((item) => {
                    ckArr.push(item);
                });
            } else if (ck.indexOf("\n") !== -1) {

                ck.split("\n").forEach((item) => {
                    ckArr.push(item);
                });
            } else {
                ckArr.push(ck);
            }
            resolve(ckArr)
        } else {
            console.log(` ${$.neme}:未填写变量 ${Variables} ,请仔细阅读脚本说明!`)
        }
    }
    )
}
/**
 * 发送消息
 */
async function SendMsg(message) {
    if (!message) return;
    if (Notify > 0) {
        if ($.isNode()) {
            var notify = require("./sendNotify");
            //let text = '仅完成积分签到\n@auth:Mist\n@date:2024-05-29\n注: 本脚本仅用于个人学习和交流请勿用于非法用途。用户应当遵守所有适用的法律和规定。在任何情况下，脚本的开发者或贡献者均不对任何直接或间接使用本脚本而产生的结果负责。'
            await notify.sendNotify($.name, message);
        } else {
            // $.msg(message);
            $.msg($.name, '', message)
        }
    } else {
        console.log(message);
    }
}

/**
 * 双平台log输出
 */
function DoubleLog(data) {
    if ($.isNode()) {
        if (data) {
            console.log(`${data}`);
            msg += `\n${data}`;
        }
    } else {
        console.log(`${data}`);
        msg += `\n${data}`;
    }

}
/**
* 等待 X 秒
*/
function wait(n) {
    return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000);
    });
}

/**
 * get请求
 */
async function httpGet(getUrlObject, tip, timeout = 3) {
    return new Promise((resolve) => {
        let url = getUrlObject;
        if (!tip) {
            let tmp = arguments.callee.toString();
            let re = /function\s*(\w*)/i;
            let matches = re.exec(tmp);
            tip = matches[1];
        }
        if (debug) {
            console.log(`\n 【debug】=============== 这是 ${tip} 请求 url ===============`);
            console.log(url);
        }

        $.get(
            url,
            async (err, resp, data) => {
                try {
                    if (debug) {
                        console.log(`\n\n 【debug】===============这是 ${tip} 返回data==============`);
                        console.log(data);
                        console.log(`\n 【debug】=============这是 ${tip} json解析后数据============`);
                        console.log(JSON.parse(data));
                    }
                    let result = JSON.parse(data);
                    if (result == undefined) {
                        return;
                    } else {
                        resolve(result);
                    }

                } catch (e) {
                    //console.log(err, resp);
                    console.log(`\n ${tip} 失败了!请稍后尝试!!`);
                    msg = `\n ${tip} 失败了!请稍后尝试!!`
                    console.log("服务器卡爆啦");
                } finally {
                    resolve();
                }
            },
            timeout
        );
    });
}

/**
 * post请求
 */
async function httpPost(postUrlObject, tip, timeout = 3) {
    return new Promise((resolve) => {
        let url = postUrlObject;
        if (!tip) {
            let tmp = arguments.callee.toString();
            let re = /function\s*(\w*)/i;
            let matches = re.exec(tmp);
            tip = matches[1];
        }
        if (debug) {
            console.log(`\n 【debug】=============== 这是 ${tip} 请求 url ===============`);
            console.log(url);
        }

        $.post(
            url,
            async (err, resp, data) => {
                try {
                    if (debug) {
                        console.log(`\n\n 【debug】===============这是 ${tip} 返回data==============`);
                        console.log(data);
                        console.log(`\n 【debug】=============这是 ${tip} json解析后数据============`);
                        console.log(JSON.parse(data));
                    }
                    let result = JSON.parse(data);
                    if (result == undefined) {
                        return;
                    } else {
                        resolve(result);
                    }

                } catch (e) {
                    //console.log(err, resp);
                    console.log(`\n ${tip} 失败了!请稍后尝试!!`);
                    msg = `\n ${tip} 失败了!请稍后尝试!!`
                    console.log("服务器卡爆啦");
                } finally {
                    resolve();
                }
            },
            timeout
        );
    });
}

/**
 * 网络请求 (get, post等)
 */
function httpRequest(options, timeout = 1 * 1000) {
    method = options.method ? options.method.toLowerCase() : options.body ? "post" : "get";
    return new Promise(resolve => {
        setTimeout(() => {
            $[method](options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log(JSON.stringify(err));
                        $.logErr(err);
                    } else {
                        try { data = JSON.parse(data); } catch (error) { }
                    }
                } catch (e) {
                    console.log(e);
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            })
        }, timeout)
    })
}


/**
 * debug调试
 */
function debugLog(...args) {
    if (debug) {
        console.log(...args);
    }
}
//获取远程通知
async function getNotice() {
    try {
        const urls = [
            "https://gitee.com/ohhhooh/jd_haoyangmao/raw/master/Notice.json",
            
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




// 完整 API
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return ("POST" === e && (s = this.post), new Promise((e, a) => { s.call(this, t, (t, s, r) => { t ? a(t) : e(s) }) })) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new (class { constructor(t, e) { this.userList = []; this.userIdx = 0; (this.name = t), (this.http = new s(this)), (this.data = null), (this.dataFile = "box.dat"), (this.logs = []), (this.isMute = !1), (this.isNeedRewrite = !1), (this.logSeparator = "\n"), (this.encoding = "utf-8"), (this.startTime = new Date().getTime()), Object.assign(this, e), this.log("", `🔔${this.name},开始!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const a = this.getdata(t); if (a) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise((e) => { this.get({ url: t }, (t, s, a) => e(a)) }) } runScript(t, e) { return new Promise((s) => { let a = this.getdata("@chavy_boxjs_userCfgs.httpapi"); a = a ? a.replace(/\n/g, "").trim() : a; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); (r = r ? 1 * r : 20), (r = e && e.timeout ? e.timeout : r); const [i, o] = a.split("@"), n = { url: `http://${o}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": i, Accept: "*/*" }, timeout: r, }; this.post(n, (t, e, a) => s(a)) }).catch((t) => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e); if (!s && !a) return {}; { const a = s ? t : e; try { return JSON.parse(this.fs.readFileSync(a)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : a ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const a = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of a) if (((r = Object(r)[t]), void 0 === r)) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), (e.slice(0, -1).reduce((t, s, a) => Object(t[s]) === t[s] ? t[s] : (t[s] = Math.abs(e[a + 1]) >> 0 == +e[a + 1] ? [] : {}), t)[e[e.length - 1]] = s), t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, a] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, a, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, a, r] = /^@(.*?)\.(.*?)$/.exec(e), i = this.getval(a), o = a ? ("null" === i ? null : i || "{}") : "{}"; try { const e = JSON.parse(o); this.lodash_set(e, r, t), (s = this.setval(JSON.stringify(e), a)) } catch (e) { const i = {}; this.lodash_set(i, r, t), (s = this.setval(JSON.stringify(i), a)) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return (this.data = this.loaddata()), this.data[t]; default: return (this.data && this.data[t]) || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return ((this.data = this.loaddata()), (this.data[e] = t), this.writedata(), !0); default: return (this.data && this.data[e]) || null } } initGotEnv(t) { (this.got = this.got ? this.got : require("got")), (this.cktough = this.cktough ? this.cktough : require("tough-cookie")), (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()), t && ((t.headers = t.headers ? t.headers : {}), void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = () => { }) { switch ((t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), this.getEnv())) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && ((t.headers = t.headers || {}), Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, a) => { !t && s && ((s.body = a), (s.statusCode = s.status ? s.status : s.statusCode), (s.status = s.statusCode)), e(t, s, a) }); break; case "Quantumult X": this.isNeedRewrite && ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t) => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o, } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o, }, i, o) }, (t) => e((t && t.error) || "UndefinedError")); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), (e.cookieJar = this.ckjar) } } catch (t) { this.logErr(t) } }).then((t) => { const { statusCode: a, statusCode: r, headers: i, rawBody: o, } = t, n = s.decode(o, this.encoding); e(null, { status: a, statusCode: r, headers: i, rawBody: o, body: n, }, n) }, (t) => { const { message: a, response: r } = t; e(a, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = () => { }) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch ((t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), this.getEnv())) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && ((t.headers = t.headers || {}), Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, a) => { !t && s && ((s.body = a), (s.statusCode = s.status ? s.status : s.statusCode), (s.status = s.statusCode)), e(t, s, a) }); break; case "Quantumult X": (t.method = s), this.isNeedRewrite && ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t) => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o, } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o, }, i, o) }, (t) => e((t && t.error) || "UndefinedError")); break; case "Node.js": let a = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...i } = t; this.got[s](r, i).then((t) => { const { statusCode: s, statusCode: r, headers: i, rawBody: o, } = t, n = a.decode(o, this.encoding); e(null, { status: s, statusCode: r, headers: i, rawBody: o, body: n }, n) }, (t) => { const { message: s, response: r } = t; e(s, r, r && a.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date(); let a = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in a) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? a[e] : ("00" + a[e]).substr(("" + a[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let a = t[s]; null != a && "" !== a && ("object" == typeof a && (a = JSON.stringify(a)), (e += `${s}=${a}&`)) } return (e = e.substring(0, e.length - 1)), e } msg(e = t, s = "", a = "", r) { const i = (t) => { switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } case "Loon": { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } case "Quantumult X": { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, a = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": a, } } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, a, i(r)); break; case "Quantumult X": $notify(e, s, a, i(r)); break; case "Node.js": }if (!this.isMuteLog) { let t = ["", "==============📣系统通知📣==============",]; t.push(e), s && t.push(s), a && t.push(a), console.log(t.join("\n")), (this.logs = this.logs.concat(t)) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `❗️${this.name},错误!`, t); break; case "Node.js": this.log("", `❗️${this.name},错误!`, t.stack) } } wait(t) { return new Promise((e) => setTimeout(e, t)) } DoubleLog(d) { if (this.isNode()) { if (d) { console.log(`${d}`); msg += `\n ${d}` } } else { console.log(`${d}`); msg += `\n ${d}` } } async SendMsg(m) { if (!m) return; if (Notify > 0) { if (this.isNode()) { var notify = require("./sendNotify"); await notify.sendNotify(this.name, m) } else { this.msg(this.name, "", m) } } else { console.log(m) } } done(t = {}) { const e = new Date().getTime(), s = (e - this.startTime) / 1e3; switch ((this.log("", `🔔${this.name},结束!🕛${s}秒`), this.log(), this.getEnv())) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } })(t, e) }
//Env rewrite:smallfawn Update-time:23-6-30 newAdd:DoubleLog & SendMsg
