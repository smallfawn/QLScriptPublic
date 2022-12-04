/**
 *
 * 优企盈V2
 *
 * cron 0 0,7 * * *  yqy.js         
 *
 */
//=====================================================//
const $ = new Env("优企盈");
const notify = $.isNode() ? require("./sendNotify") : "";
const Notify = 1
const debug = 0
let ckStr = ($.isNode() ? process.env.yqy_data : $.getdata('yqy_data')) || '';  //检测CK  外部
let msg, ck;
let host = 'api.yqypt.com';
let hostname = 'https://' + host;
let textArr = ['真希望你懂我 就像狗狗对我的温柔', '狗狗日记的角落 偷偷画着你和我', '换毛期怎么做卫生', '讨好不用太多 贴心就够', '把我的手 让它当作最温暖的小窝', '心里的话只对它说星空下勾小指头 沿着幸福的路走喜欢和你逛宠物店买狗罐头', '和猫相比，狗狗和人更亲近，更愿意服从主人，更缺少独立的个性，被称为“人类最忠实的朋友”。', '猫咪在和主人亲近的同时，有它独立的性格和凛然不可侵犯的高冷和傲娇。猫若即若离的神游性格并不像狗那样需要主人陪伴。', '猫更像一个精神贵族，一举一动都是那样高雅和自尊，它不太会谄媚主人，更多的猫喜欢特立独行。', '若是主人出差或是离家远行，给猫足够的水和食物，并不需要过分担心']
let text1Arr = ['我以为我是来做底稿的，抓住每一分钟打下坚实的财务基础，结果做了很多支线任务。', '复印、盖章、寄送，写公众号、年会主持、团建策划、订火锅、订奶茶、订烧烤……', '真正的职场精英是可以做到三件事的：我知道该做什么，我知道该怎么做，我有时间去做。', '即我有时间去的事情，我才知道该怎么做，然后我才能知道这件事情该不该做。', '所谓职场的意思，从子面上、狭意上来讲，就是工作的场所；从广意上来讲，与工作相关的环境、场所、人和事，还包括与工作、职业相关的社会生活活动、人际关系等，都属于这个范畴。', '社会中的政治和经济密不可分，在职场中职场政治和个人能力同样密不可分，职场的精英们个个有能力，懂政治，个人能力表现为时间掌控能力、知识水平、现场问题解决能力，职场政治能力表现为判断自身所处环境的能力以及创造利于自己条件的能力。', '一位人力资源专家说过：职场是什么？职场就是“我”是谁、做什么、怎么做、做最好。我感到这短短的12个字精辟地概括了一个人职业生涯的全过程，一个人要想成功地经营自己的职业生涯，就必须在这12个字上下工夫。', '所谓“职场”就是在你身边一个大约十几个人组成的小圈子，这个小圈子就是一个浓缩的社会。', '上班之后的日子好快。一天接一天的迅速结束，好像总是来不及开始就又结束了。等周末，周末了就能大块的完整的好好干些什么了，可是周末补个觉就没了。还没盼上几轮周末，一个月就过去了。']
//---------------------------------------------------//
async function tips(ckArr) {
    //DoubleLog(`当前脚本版本${Version}\n📌,如果脚本版本不一致请及时更新`);
    DoubleLog(`\n QQ频道https://qun.qq.com/qqweb/qunpro/share?inviteCode=1W7f4gR \n QQ群862839604 \n 日55积分,积分可换虚拟卡券 \n 10.23开始黑号/奖品兑换5天也没发货,谨慎玩!目测可能是textArr数组的缘故！有能力自己改下文案就行 \n 10.24取消发布文章和评论！`);
    DoubleLog(`\n============= 共找到 ${ckArr.length} 个账号 =============`);
    debugLog(`【debug】 这是你的账号数组:\n ${ckArr}`);
}
!(async () => {
    let ckArr = await checkEnv(ckStr, "yqy_data");  //检查CK
    await tips(ckArr);  //脚本提示
    await start(); //开始任务
    await SendMsg(msg); //发送通知

})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done());



//---------------------------------------------------------------------------------封装循环测试
async function newstart(name, taskname, time) {  //任务名 函数名 等待时间
    let ckArr = await checkEnv(ckStr, "yqy_data");  //检查CK
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

    await newstart("登录", userinfo, 2)
    await newstart("签到", signin, 2)
    await newstart("分享", share, 2)
    await newstart("阅读", information_list, 2)
    //await newstart("发布文章", postingpush, 2)

}



//用户信息查询
async function userinfo() {
    try {
        let url = {
            url: `${hostname}/v2/auth`,
            headers: {
                "Host": host,
                "Content-Type": "application/json"
            },
            body: "{\"authWay\":\"PHONE_PASSWORD\",\"accessToken\":\"\",\"imageCaptcha\":\"\",\"password\":\"" + ck[1] + "\",\"phone\":\"" + ck[0] + "\",\"phoneCaptcha\":\"\"}"
        };
        let result = await httpPost(url, `用户信息查询`);

        //console.log(result);
        if (result?.code == 0) {
            //DoubleLog(`\n账号[` + Number(i + 1) + `]当前用户:${result.data.userId} 登陆成功🎉`);
            token = result.data.token
            userId = result.data.userId
            await jifen();
        } else {
            DoubleLog("账号[" + Number(i + 1) + "]登录失败！");
            //console.log(result);
        }
    } catch (error) {
        console.log(error);
    }

}


//------用户积分查询 get
async function jifen() {
    try {
        let url = {
            url: `${hostname}/v2/integral/info`,
            headers: {
                "Host": host,
                "token": token

            },

        };
        let result = await httpGet(url, `用户积分查询`);

        //console.log(result);
        if (result?.code == 0) {
            DoubleLog(`账号[` + Number(i + 1) + `]用户${userId}积分:${result.data.integralNum} 本周签到天数: ${result.data.continuousDay}天🎉`);
        } else {
            DoubleLog(`账号[` + Number(i + 1) + `]查询积分信息: 失败 ❌ 了呢,原因未知!`);
            // console.log(result);
        }
    } catch (error) {
        console.log(error);
    }

}

/**
 * 签到    httpPost  看你的请求头
 */
async function signin() {
    try {
        let url = {
            url: `${hostname}/v2/integral/sign_in`,
            headers: {
                "Host": host,
                "token": token
            },
            body: "{\"userId\":\"" + userId + "\"}"

        };
        let result = await httpPost(url, `签到`);

        //console.log(result);
        if (result?.code == 0) {
            console.log(`账号[` + Number(i + 1) + `]签到${result.message} 🎉`);
            await wait(3);
        } else {
            console.log(`账号[` + Number(i + 1) + `]签到失败,原因${result.message}!`);
            //console.log(result);
        }
    } catch (error) {
        console.log(error);
    }

}

/**
* 分享    httpGet        //参考上面的即可  这个函数也可以复制 改下相应的就可以
*/
async function share() {
    try {
        let url = {
            url: `${hostname}/v2/share?resourceId=1&resourceType=APP`,
            headers: {
                "Host": host,
                "token": token,
            }
        };
        let result = await httpGet(url, `分享`);

        //console.log(result);
        if (result?.code == 0) {
            console.log(`账号[` + Number(i + 1) + `]分享成功:${result.message} 🎉`);
            await wait(3);
        } else {
            console.log(`账号[` + Number(i + 1) + `]分享: 失败 ❌ 了呢,原因未知!`);
            //console.log(result);
        }
    } catch (error) {
        console.log(error);
    }

}


/**
* 获取文章列表    httpGet        //参考上面的即可  这个函数也可以复制 改下相应的就可以
*/
async function information_list() {
    try {
        let url = {
            url: `${hostname}/v2/information/list`,
            headers: {
                "Host": host,
            }
        };
        let result = await httpGet(url, `获取文章列表`);

        //console.log(result);
        if (result?.code == 0) {
            let informationId = [];
            for (var index = 0; index < 3; index++) {
                //console.log(`获取文章成功:${result.data[index].informationId} 🎉`);
                let information_idnum = result.data[index].informationId
                await information_read(information_idnum);
                informationId.push(information_idnum)
            }
            console.log(`账号[` + Number(i + 1) + `]阅读文章[` + informationId + `]成功🎉`);
            let information_idnum = result.data[0].informationId  //评论
            //await add(information_idnum)
            //console.log(`账号[` + Number(i + 1) + `]评论文章[` + information_idnum + `]成功🎉`);
        } else {
            //console.log(`账号[` + Number(i + 1) + `]获取文章ID: 失败,原因未知!`);
            //console.log(result);
        }
    } catch (error) {
        console.log(error);
    }

}

/**
* 阅读文章    httpGet        //参考上面的即可  这个函数也可以复制 改下相应的就可以
*/
async function information_read(information_idnum) {
    try {
        let url = {
            url: `${hostname}/v2/information/details?informationId=` + information_idnum + ``,
            headers: {
                "Host": host,
                "token": token
            }
        };
        let result = await httpGet(url, `阅读文章`);

        //console.log(result);
        if (result?.code == 0) {
            //console.log(`账号[` + Number(i + 1) + `]阅读文章成功:${result.data.informationId} 🎉`);
        } else {
            console.log(`账号[` + Number(i + 1) + `]阅读文章: 失败原因未知!`);
            //console.log(result);
        }
    } catch (error) {
        console.log(error);
    }

}


/**
* 发布文章    httpPost        //参考上面的即可  这个函数也可以复制 改下相应的就可以
*/
async function postingpush() {
    let ram_num = randomInt(0, 2)
    let text = textArr[ram_num];
    try {
        let url = {
            url: `${hostname}/v2/posting/publish`,
            headers: {
                "Host": host,
                "token": token,
                "Content-Type": "application/json;charset=UTF-8",
                //"Content-Length":57
            },
            body: "{\"attachments\":[],\"content\":\"" + text + "\",\"topicId\":940}"
        };
        let result = await httpPost(url, `发布文章`);

        //console.log(result);
        if (result?.code == 0) {
            console.log(`账号[` + Number(i + 1) + `]发布文章成功:${result.message} 🎉`);
            await wait(1);
        } else {
            console.log(`账号[` + Number(i + 1) + `]发布文章:失败,原因未知!`);
            //console.log(result);
        }
    } catch (error) {
        console.log(error);
    }

}

/**
* 评论    httpPost        //参考上面的即可  这个函数也可以复制 改下相应的就可以
*/
async function add(information_idnum) {
    let ram_num1 = randomInt(0, 5)
    let text1 = text1Arr[ram_num1];
    try {
        let url = {
            url: `${hostname}/v2/information/comment/add`,
            headers: {
                "Host": host,
                "token": token,
                "Content-Type": "application/json;charset=UTF-8",
                //"Content-Length":57
            },
            body: "{\"content\":\"" + text1 + "\",\"informationId\":\"" + information_idnum + "\"}"
        };
        let result = await httpPost(url, `发布评论`);

        //console.log(result);
        if (result?.code == 0) {
            //DoubleLog(`发布评论成功:${result.message} 🎉`);
            console.log(`账号[` + Number(i + 1) + `]评论文章[` + information_idnum + `]成功:${result.message} 🎉`);
        } else {
            //DoubleLog(`发布: 失败 ❌ 了呢,原因未知!`);
            //console.log(result);
        }
    } catch (error) {
        console.log(error);
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
 * 随机整数生成
 */
function randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
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
                    console.log(err, resp);
                    console.log(`\n ${tip} 失败了!请稍后尝试!!`);
                    msg = `\n ${tip} 失败了!请稍后尝试!!`
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
                    console.log(err, resp);
                    console.log(`\n ${tip} 失败了!请稍后尝试!!`);
                    msg = `\n ${tip} 失败了!请稍后尝试!!`
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
async function httpRequest(postOptionsObject, tip, timeout = 3) {
    return new Promise((resolve) => {

        let Options = postOptionsObject;
        let request = require('request');
        if (!tip) {
            let tmp = arguments.callee.toString();
            let re = /function\s*(\w*)/i;
            let matches = re.exec(tmp);
            tip = matches[1];
        }
        if (debug) {
            console.log(`\n 【debug】=============== 这是 ${tip} 请求 信息 ===============`);
            console.log(Options);
        }

        request(Options, async (err, resp, data) => {
            try {
                if (debug) {
                    console.log(`\n\n 【debug】===============这是 ${tip} 返回数据==============`);
                    console.log(data);
                    console.log(`\n 【debug】=============这是 ${tip} json解析后数据============`);
                    console.log(JSON.parse(data));
                }
                let result = JSON.parse(data);
                if (!result) return;
                resolve(result);
            } catch (e) {
                console.log(err, resp);
                console.log(`\n ${tip} 失败了!请稍后尝试!!`);
                msg = `\n ${tip} 失败了!请稍后尝试!!`
            } finally {
                resolve();
            }
        }), timeout

    });
}


/**
 * debug调试
 */
function debugLog(...args) {
    if (debug) {
        console.log(...args);
    }
}

// 完整 Env
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
