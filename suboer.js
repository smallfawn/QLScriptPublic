/**
 * 苏泊尔会员中心 (微信小程序)
 * Show: 吃大米
 * 变量名:suboer_wx
 * 变量值:token&PHPSESSID@token1&PHPSESSID1
 * 抓域名https://growrice.supor.com/rice/backend/public/index.php/api/login/auto-login?token= 后面的值
 * 抓域名https://growrice.supor.com中请求体header中cookie中PHPSESSID 的值 
 * 多账号使用 @ 分割 拼接字符串为&
 * cron 5 15 * * *
 * const $ = new Env("苏泊尔-微信小程序");
 * scriptVersionNow = "0.0.3";
 */

const ckName = "suboer_wx";
const Notify = 1; //0为关闭通知,1为打开通知,默认为1
let envSplitor = ["@", "\n"]; //多账号分隔符
let strSplitor = '&'; //多变量分隔符

const $ = new Env("苏泊尔");
let scriptVersionNow = "0.0.3";
let msg = "";


async function start() {
    await getVersion("smallfawn/QLScriptPublic/main/suboer.js");
    await getNotice();

    let taskall = [];
    for (let user of $.userList) {
        if (user.ckStatus) {
            taskall.push(await user.task());
            await $.wait(1000);
        }
    }
    await Promise.all(taskall);
}

class UserInfo {
    constructor(str) {
        this.index = ++$.userIdx;
        this.ckStatus = true;
        this.token = str.split(strSplitor)[0];
        this.PHPSESSID = str.split(strSplitor)[1]; //单账号多变量分隔符
        this.headers = {
            "Host": "growrice.supor.com",
            "user-agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.5304.141 Mobile Safari/537.36 XWEB/5127 MMWEBSDK/20230405 MMWEBID/2585 MicroMessenger/8.0.35.2360(0x2800235D) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx29135df42114f4ef",
            "content-type": "application/x-www-form-urlencoded",
            "accept": "*/*",
            "x-requested-with": "com.tencent.mm",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "cors",
            "sec-fetch-dest": "empty",
            "referer": "https://growrice.supor.com/rice/fort/main.html",
            "accept-encoding": "gzip, deflate",
            "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "cookie": `PHPSESSID=${this.PHPSESSID}`,
        }
    }
    async task() {
        //登录
        $.DoubleLog(`-------- 开始 【第${this.index}个账号】--------`)
        await this.login()
        //用户信息 
        await this.user_info()

        if (this.ckStatus) {

            //根据签到信息签到
            await this.sign_info()
            //任务列表
            await this.task_list()
            //获取可收取大米信息
            await this.get_index_info()
            //大米余额
            await this.rice_num()

        } else {
            $.DoubleLog(`账号${this.index}  失效了好像`)
        }
    }
    // 登录    post
    async login() {
        let options = {
            method: "get",
            url: `https://growrice.supor.com/rice/backend/public/index.php/api/login/auto-login?token=${this.token}`,
            headers: this.headers,
        };
        let result = await httpRequest(options);
    }

    // 用户信息 - GET - https://growrice.supor.com/users/get-user-info
    async user_info() {
        let options = {
            method: "get",
            url: `https://growrice.supor.com/rice/backend/public/index.php/api/users/get-user-info`,
            headers: this.headers,
        };
        let result = await httpRequest(options);
        if (result["code"] == 1) {
            $.DoubleLog(`账号${this.index}  ${result["msg"]}  欢迎 ${result["data"]["nickname"]}`);
        } else if (result["code"] == 0) {
            $.DoubleLog(`账号${this.index}  ${result.msg}`);
            this.ckStatus = false
        } else {
            $.DoubleLog(`账号${this.index}  失败 ❌ 了呢,原因未知!`);
            console.log(result);
            this.ckStatus = false
        }
    }
    // 签到信息   get
    async sign_info() {
        let options = {
            method: "get",
            url: `https://growrice.supor.com/rice/backend/public/index.php/api/signIn/sign-list`,
            headers: this.headers,
        };
        let result = await httpRequest(options);

        if (result["data"]["is_sign"] == false) {
            $.DoubleLog(`账号${this.index}  未签到  去签到喽!`);
            await this.do_sign()
        } else if (result["data"]["is_sign"] == true) {
            $.DoubleLog(`账号${this.index}  已签到  明天再来吧!`);
        } else {
            $.DoubleLog(`账号${this.index}  失败 ❌ 了呢`);
            console.log(result);
        }
    }
    //签到 - POST - https://growrice.supor.com/signIn/sign
    async do_sign() {
        let options = {
            method: "post",
            url: `https://growrice.supor.com/rice/backend/public/index.php/api/signIn/sign`,
            headers: this.headers,
            body: `https://growrice.supor.com/rice/backend/public/index.php/api/signIn/sign`,
        };
        let result = await httpRequest(options);

        if (result["code"] == 1) {
            $.DoubleLog(`账号${this.index}  ${result["msg"]} ,获得 ${result["data"]["get_rice_num"]} 大米`);
        } else if (result["code"] == 0) {
            $.DoubleLog(`账号${this.index}  ${result["msg"]}`);
        } else {
            $.DoubleLog(`账号${this.index}  失败❌了呢`);
            console.log(result);
        }
    }


    // 任务列表    get   
    async task_list() {
        let options = {
            method: "get",
            url: `https://growrice.supor.com/rice/backend/public/index.php/api/task/index`,
            headers: this.headers,
        };
        let result = await httpRequest(options);
        // console.log(result);
        if (result["code"] == 1) {
            $.DoubleLog(`账号${this.index}  ${result["msg"]}`);
            let tasks = result.data//[]
            for (let i of tasks) {
                if ((i["id"] == 1 || i["name"].indexOf("浏览") !== -1) && i["is_finish"] == false) {
                    await this.link_task("&id=1")
                } else if ((i["id"] == 1 || i["name"].indexOf("浏览") !== -1) && i["is_finish"] == true) {
                    $.DoubleLog(`今天完成浏览好物任务了,明天再来吧!`)
                }

                if ((i["id"] == 6 || i["name"].indexOf("收") !== -1) && i["is_finish"] == false) {
                    //收大米
                    for (let j = 0; j < 3; j++) {
                        await this.get_rice()
                    }
                } else if ((i["id"] == 6 || i["name"].indexOf("收") !== -1) && i["is_finish"] == true) {
                    $.DoubleLog(`今天无法偷大米了,明天再来吧!`)
                }

                if ((i["id"] == 8 || i["name"].indexOf("其他") !== -1) && i["list"][0]["is_finish"] == false) {
                    //浏览菜谱
                    await this.link_task("&id=8&other_id=3")
                } else if ((i["id"] == 8 || i["name"].indexOf("其他") !== -1) && i["list"][0]["is_finish"] == true) {
                    $.DoubleLog(`今天完成浏览菜谱了,明天再来吧!`)
                }
            }
        } else if (result["code"] == 0) {
            $.DoubleLog(`账号${this.index}  ${result["msg"]}`);
        } else {
            $.DoubleLog(`账号${this.index}  失败❌了呢`);
            console.log(result);
        }
    }


    // 执行各种任务  https://growrice.supor.com/rice/backend/public/index.php/api/task/link-task
    async link_task(bodyString) {
        /*
        浏览 菜谱 `&id=8&other_id=3`
        浏览 好物 `&id=1`
        
        */
        let options = {
            method: "post",
            url: `https://growrice.supor.com/rice/backend/public/index.php/api/task/link-task`,
            headers: this.headers,
            body: bodyString,
        };
        let result = await httpRequest(options);

        // console.log(result);
        if (result["code"] == 1) {
            $.DoubleLog(`账号${this.index}  ${result["msg"]}`);
        } else {
            $.DoubleLog(`账号${this.index}  失败❌了呢`);
            console.log(result);
        }
    }


    //获取题目 - POST - https://growrice.supor.com/rice/backend/public/index.php/api/question/getQuestion
    async get_question() {
        let options = {
            method: "post",
            url: `https://growrice.supor.com/rice/backend/public/index.php/api/question/getQuestion`,
            headers: this.headers,
            body: ""
        };
        let result = await httpRequest(options);
        // console.log(result);
        if (result["code"] == 1) {
            $.DoubleLog(`账号${this.index}  题目:${result["data"]["id"]}${result["data"]["title"]}`)
            $.DoubleLog(`选项 A${result["data"]["answer_a"]}`)
            $.DoubleLog(`选项 B${result["data"]["answer_b"]}`)
            $.DoubleLog(`选项 C${result["data"]["answer_c"]}`)
            if ("answer_d" in result["data"]) {
                (`选项 D${result["data"]["answer_d"]}`)
            }
            await this.answer(`&question_id=16&answer=D`)
        } else {
            $.DoubleLog(`账号${this.index}  失败❌了呢`);
            console.log(result);
        }
    }

    //回答题目 - POST - https://growrice.supor.com/rice/backend/public/index.php/api/question/answer
    async answer(bodyString) {
        let options = {
            method: "post",
            url: `https://growrice.supor.com/rice/backend/public/index.php/api/question/answer`,
            headers: this.headers,
            body: bodyString
        };
        let result = await httpRequest(options);
        // console.log(result);
        if (result["code"] == 1) {
            $.DoubleLog(`账号${this.index}  题目:${result["msg"]["id"]}`)
            if (result["data"]["status"] == 0) {
                this.answer_status = false //还需要在答题
            } else {
                this.answer_status = true //答题任务完成

            }
        } else {
            $.DoubleLog(`账号${this.index}  失败❌了呢`);
            console.log(result);
        }
    }


    // 获取可收取大米信息		get
    async get_index_info() {
        let options = {
            method: "get",
            url: `https://growrice.supor.com/rice/backend/public/index.php/api/index/index`,
            headers: this.headers,
        };
        let result = await httpRequest(options);
        // console.log(result);
        if (result["code"] == 1) {
            if (result["data"]["rice_list"].length == 0) {
                $.DoubleLog(`账号${this.index}  没有可以收获的大米`)
            } else if (result["data"]["rice_list"].length > 0) {
                $.DoubleLog(`账号${this.index}  收获大米`)
                for (let i of result["data"]["rice_list"]) {
                    await this.collect_rice(i["id"])
                    $.DoubleLog(`${i["name"]}收取完成`)
                }
            }
        } else if (result["code"] == 2) {
            $.DoubleLog(`账号${this.index}  ${result['msg']}  请自己先打开一次小程序,种大米后在执行脚本!`)
        } else {
            $.DoubleLog(`账号${this.index}  失败❌了呢`);
            console.log(result);
        }
    }


    // 收大米
    async collect_rice(id) {
        let options = {
            method: "post",
            url: `https://growrice.supor.com/rice/backend/public/index.php/api/index/collect-rice`,
            headers: this.headers,
            body: `&id=${id}`,
        };
        let result = await httpRequest(options);

        // console.log(result);
        if (result["code"] == 1) {
            $.DoubleLog(`账号${this.index}  收取大米 成功啦 ！ 当前累计${result["data"]["sign_rice_num"]}大米`);
        } else if (result["code"] == 0) {
            $.DoubleLog(`账号${this.index}  ${result["msg"]}`);
        } else {
            $.DoubleLog(`账号${this.index}  失败❌了呢`);
            console.log(result);
        }
    }





    // 查询大米数量	- GET - https://growrice.supor.com/rice/backend/public/index.php/api/exchange/index?&page=1&pagesize=10
    async rice_num() {
        let options = {
            method: "get",
            url: `https://growrice.supor.com/rice/backend/public/index.php/api/exchange/index?&page=1&pagesize=10`,
            headers: this.headers,
        };
        let result = await httpRequest(options);

        // console.log(result);
        if (result["code"] == 1) {
            $.DoubleLog(`账号${this.index}  现在有${result["data"]["rice_num"]} 大米`)
        } else {
            $.DoubleLog(`账号${this.index}  失败❌了呢`);
            console.log(result);
        }
    }

    // 获取同城大米id
    async get_sameCity_id() {
        let options = {
            method: "get",
            url: `https://growrice.supor.com/rice/backend/public/index.php/api/users/same-city-list`,
            headers: this.headers,
        };
        let result = await httpRequest(options);
        // console.log(result);
        if (result["code"] == 1) {
            let arr = []
            for (let i of result["data"]) {
                arr.push(i["id"])
            }
            return arr;
        } else {
            $.DoubleLog(`账号${this.index}  失败❌了呢`);
            console.log(result);
        }
    }


    // 偷好友大米
    async get_rice() {
        let SameCityIdList = await this.get_sameCity_id()//"获取好友大米id"
        for (let i of SameCityIdList) {
            let id = i
            let options = {
                method: "post",
                url: `https://growrice.supor.com/rice/backend/public/index.php/api/users/get-rice`,
                headers: this.headers,
                body: `&friend_id=${id}`,
            };
            let result = await httpRequest(options);

            if (result["code"] == 1) {
                $.DoubleLog(`账号${this.index}  ${result["msg"]} , 当前已有 ${result["data"]["sign_rice_num"]} 大米`);
            } else if (result["code"] == 0) {
                $.DoubleLog(`账号${this.index}  ${result["msg"]}`);
            } else {
                $.DoubleLog(`账号${this.index}  失败❌了呢`);
                console.log(result);
            }

        }

    }

    // 抽奖信息		get
    /*  async prize_Info() {
          let options = {
              method: "get",
              url: `https://growrice.supor.com/prize/index`,
              headers: this.headers,
          };
          let result = await httpRequest(options);
  
          // console.log(result);
          if (result.code == 1) {
              $.DoubleLog(`账号${this.index}  , 抽奖券${result.data.draw_num_1}张, 高级抽奖券${result.data.draw_num_2}张`)
              if (result.data.draw_num_1 > 0) {
                  await this.prize('普通抽奖', '1')
              }
              if (result.data.draw_num_2 > 0) {
                  await this.prize('高级抽奖', '2')
              }
              if (result.data.draw_num_1 == 0 && result.data.draw_num_2 == 0) {
                  $.DoubleLog(`账号${this.index}  暂时无抽奖次数！`)
              }
  
          } else {
              $.DoubleLog(`账号${this.index}  失败❌了呢`);
              console.log(result);
          }
      }*/

    // 抽奖  https://growrice.supor.com/rice/backend/public/index.php/api/prize/draw
    /*async prize(type) {
        let options = {
            method: "post",
            url: `https://growrice.supor.com/prize/draw`,
            headers: this.headers,
            body: `cate=${type}`,
        };
        let result = await httpRequest(options);

        // console.log(result);
        if (result.code == 1) {
            let prize_info = result.data.prize_info
            $.DoubleLog(`账号${this.index}  获得 ${prize_info.prize_name} , 奖品id: ${prize_info.prize_id}, 奖品类型: ${prize_info.prize_type}, 奖品数量: ${prize_info.prize_value}`);
            await this.prize_Info('抽奖信息')
        } else if (result.code == 0) {
            $.DoubleLog(`账号${this.index}  ${result.msg}`);
            await this.prize_Info('抽奖信息')
        } else {
            $.DoubleLog(`账号${this.index}  失败❌了呢`);
            console.log(result);
        }
    }*/


}


!(async () => {
    if (!(await checkEnv())) return;
    if ($.userList.length > 0) {
        await start();
    } await $.SendMsg(msg);
})().catch((e) => console.log(e)).finally(() => $.done());

//********************************************************
/**
 * 变量检查与处理
 * @returns
 */
async function checkEnv() {
    let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || "";
    //let userCount = 0;
    if (userCookie) {
        // console.log(userCookie);
        let e = envSplitor[0];
        for (let o of envSplitor)
            if (userCookie.indexOf(o) > -1) {
                e = o;
                break;
            }
        for (let n of userCookie.split(e)) n && $.userList.push(new UserInfo(n));
        //userCount = $.userList.length;
    } else {
        console.log("未找到CK");
        return;
    }
    return console.log(`共找到${$.userList.length}个账号`), true; //true == !0
}

/////////////////////////////////////////////////////////////////////////////////////
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
/**
 * 获取远程版本
 */
function getVersion(scriptUrl, timeout = 3 * 1000) {
    return new Promise((resolve) => {
        const options = { url: `https://ghproxy.com/https://raw.githubusercontent.com/${scriptUrl}` };
        $.get(options, (err, resp, data) => {
            try {
                const regex = /scriptVersionNow\s*=\s*(["'`])([\d.]+)\1/;
                const match = data.match(regex);
                const scriptVersionLatest = match ? match[2] : "";
                console.log(`\n============ 当前版本：${scriptVersionNow} 📌 最新版本：${scriptVersionLatest} ============`);
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
            "https://cdn.jsdelivr.net/gh/smallfawn/Note@main/Notice.json",
            "https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/Note/main/Notice.json",
            "https://fastly.jsdelivr.net/gh/smallfawn/Note@main/Notice.json",
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
// ==================== API ==================== //
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return ("POST" === e && (s = this.post), new Promise((e, a) => { s.call(this, t, (t, s, r) => { t ? a(t) : e(s) }) })) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new (class { constructor(t, e) { this.userList = []; this.userIdx = 0; (this.name = t), (this.http = new s(this)), (this.data = null), (this.dataFile = "box.dat"), (this.logs = []), (this.isMute = !1), (this.isNeedRewrite = !1), (this.logSeparator = "\n"), (this.encoding = "utf-8"), (this.startTime = new Date().getTime()), Object.assign(this, e), this.log("", `🔔${this.name},开始!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const a = this.getdata(t); if (a) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise((e) => { this.get({ url: t }, (t, s, a) => e(a)) }) } runScript(t, e) { return new Promise((s) => { let a = this.getdata("@chavy_boxjs_userCfgs.httpapi"); a = a ? a.replace(/\n/g, "").trim() : a; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); (r = r ? 1 * r : 20), (r = e && e.timeout ? e.timeout : r); const [i, o] = a.split("@"), n = { url: `http://${o}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": i, Accept: "*/*" }, timeout: r, }; this.post(n, (t, e, a) => s(a)) }).catch((t) => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e); if (!s && !a) return {}; { const a = s ? t : e; try { return JSON.parse(this.fs.readFileSync(a)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : a ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const a = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of a) if (((r = Object(r)[t]), void 0 === r)) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), (e.slice(0, -1).reduce((t, s, a) => Object(t[s]) === t[s] ? t[s] : (t[s] = Math.abs(e[a + 1]) >> 0 == +e[a + 1] ? [] : {}), t)[e[e.length - 1]] = s), t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, a] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, a, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, a, r] = /^@(.*?)\.(.*?)$/.exec(e), i = this.getval(a), o = a ? ("null" === i ? null : i || "{}") : "{}"; try { const e = JSON.parse(o); this.lodash_set(e, r, t), (s = this.setval(JSON.stringify(e), a)) } catch (e) { const i = {}; this.lodash_set(i, r, t), (s = this.setval(JSON.stringify(i), a)) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return (this.data = this.loaddata()), this.data[t]; default: return (this.data && this.data[t]) || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return ((this.data = this.loaddata()), (this.data[e] = t), this.writedata(), !0); default: return (this.data && this.data[e]) || null } } initGotEnv(t) { (this.got = this.got ? this.got : require("got")), (this.cktough = this.cktough ? this.cktough : require("tough-cookie")), (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()), t && ((t.headers = t.headers ? t.headers : {}), void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = () => { }) { switch ((t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), this.getEnv())) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && ((t.headers = t.headers || {}), Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, a) => { !t && s && ((s.body = a), (s.statusCode = s.status ? s.status : s.statusCode), (s.status = s.statusCode)), e(t, s, a) }); break; case "Quantumult X": this.isNeedRewrite && ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t) => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o, } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o, }, i, o) }, (t) => e((t && t.error) || "UndefinedError")); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), (e.cookieJar = this.ckjar) } } catch (t) { this.logErr(t) } }).then((t) => { const { statusCode: a, statusCode: r, headers: i, rawBody: o, } = t, n = s.decode(o, this.encoding); e(null, { status: a, statusCode: r, headers: i, rawBody: o, body: n, }, n) }, (t) => { const { message: a, response: r } = t; e(a, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = () => { }) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch ((t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), this.getEnv())) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && ((t.headers = t.headers || {}), Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, a) => { !t && s && ((s.body = a), (s.statusCode = s.status ? s.status : s.statusCode), (s.status = s.statusCode)), e(t, s, a) }); break; case "Quantumult X": (t.method = s), this.isNeedRewrite && ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t) => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o, } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o, }, i, o) }, (t) => e((t && t.error) || "UndefinedError")); break; case "Node.js": let a = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...i } = t; this.got[s](r, i).then((t) => { const { statusCode: s, statusCode: r, headers: i, rawBody: o, } = t, n = a.decode(o, this.encoding); e(null, { status: s, statusCode: r, headers: i, rawBody: o, body: n }, n) }, (t) => { const { message: s, response: r } = t; e(s, r, r && a.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date(); let a = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in a) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? a[e] : ("00" + a[e]).substr(("" + a[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let a = t[s]; null != a && "" !== a && ("object" == typeof a && (a = JSON.stringify(a)), (e += `${s}=${a}&`)) } return (e = e.substring(0, e.length - 1)), e } msg(e = t, s = "", a = "", r) { const i = (t) => { switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } case "Loon": { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } case "Quantumult X": { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, a = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": a, } } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, a, i(r)); break; case "Quantumult X": $notify(e, s, a, i(r)); break; case "Node.js": }if (!this.isMuteLog) { let t = ["", "==============📣系统通知📣==============",]; t.push(e), s && t.push(s), a && t.push(a), console.log(t.join("\n")), (this.logs = this.logs.concat(t)) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `❗️${this.name},错误!`, t); break; case "Node.js": this.log("", `❗️${this.name},错误!`, t.stack) } } wait(t) { return new Promise((e) => setTimeout(e, t)) } DoubleLog(d) { if (this.isNode()) { if (d) { console.log(`${d}`); msg += `\n ${d}` } } else { console.log(`${d}`); msg += `\n ${d}` } } async SendMsg(m) { if (!m) return; if (Notify > 0) { if (this.isNode()) { var notify = require("./sendNotify"); await notify.sendNotify(this.name, m) } else { this.msg(this.name, "", m) } } else { console.log(m) } } done(t = {}) { const e = new Date().getTime(), s = (e - this.startTime) / 1e3; switch ((this.log("", `🔔${this.name},结束!🕛${s}秒`), this.log(), this.getEnv())) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } })(t, e) }
//Env rewrite:smallfawn Update-time:23-6-30 newAdd:DoubleLog & SendMsg
