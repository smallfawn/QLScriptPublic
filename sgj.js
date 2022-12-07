/**
 * 拾光家
 * cron 10 10 * * *  sgj.js
 *
 * 22/12/7   每日答题1块钱低保
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export sgj_data='token&c-shebei-id&jm-token&jm-deviceid'
 * 
 * 多账号用 换行 或 @ 分割
 * 抓包 api.shiguangjia.cn/api中
 * headers 中 token和c-shebei-id
 * 还有https://ws.shiguangjia.cn:8086/中
 * headers 的jm-token和jm-deviceid 用&连接 共四个变量 按顺序来 只要值
 * ====================================
 *   
 */



const $ = new Env("拾光家");
const ckName = "sgj_data";
//-------------------- 一般不动变量区域 -------------------------------------
const utils = require("./utils");
const notify = $.isNode() ? require("./sendNotify") : "";
const Notify = 1;		 //0为关闭通知,1为打开通知,默认为1
let debug = 0;           //Debug调试   0关闭  1开启
let envSplitor = ["@", "\n"]; //多账号分隔符
let ck = msg = '';       //let ck,msg
let host, hostname;
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
//---------------------- 自定义变量区域 -----------------------------------
//---------------------------------------------------------

async function start() {
    //    async official_event(name) { // 发送消息获取答题
    //    async chatuser_list(name) { // 获取消息列表
    //    async task_accept(name) { // 接受任务
    //    async get_rw(name) { // 进入答题任务
    //    async get_recoord(name) { // 进入答题
    //    async get_qlist(name) { // 获取答题列表
    //    async sub_papers(name) { // 提交答案

    console.log('\n================== 开始获取答题 ==================\n');
    taskall = [];
    for (let user of userList) {
        for (let i = 0; i < 5; i++) { 
            taskall.push(await user.official_event('开始获取答题')); 
        }
        await wait(1); //延迟
    }
    await Promise.all(taskall);



}


class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        //this.ck = str.split('&')[0]; //单账号多变量分隔符
        //let ck = str.split('&')
        //this.data1 = ck[0]
        this.token = str.split('&')[0]
        //this.cookie = str.split('&')[1]
        this.shebei_id = str.split('&')[1]
        this.jm_token = str.split('&')[2]
        this.jm_deviceid = str.split('&')[3]
        this.host = "echo.apipost.cn";
        this.hostname = "https://" + this.host;
        this.ts = utils.ts13()
        this.sign = utils.MD5_Encrypt("4044dd5f9031ba15a74a980c8cfbd74474b5dadf" + this.jm_deviceid + "android" + "215" + this.ts + "d75972c1a418f5acb4a4445acba394eccf863fbe")


    }


    async official_event(name) { // 发送消息获取答题
        try {
            let options = {
                method: 'POST',
                url: 'https://api.shiguangjia.cn/api/comm/official_event',
                headers: {
                    Host: 'api.shiguangjia.cn',
                    'c-model': 'android',
                    'c-type': 'app',
                    'c-shebei-id': this.shebei_id,
                    'c-versioncode': '215',
                    'c-app-channel': 'official',
                    'c-shebei-info': '{"product":"platina","version_type":"user","display":"QKQ1.190910.002 test-keys","push_qx":"1","sdk_int":"29","manufacturer":"Xiaomi","hardward":"qcom","system":"Android 10","build_id":"QKQ1.190910.002","device_resolution":"1080x2154","bootloader":"unknown","fingerprint":"Xiaomi/platina/platina:10/QKQ1.190910.002/V12.0.1.0.QDTCNXM:user/release-keys","model":"MI 8 Lite","lang":"zh","device":"platina","brand":"Xiaomi","board":"sdm660"}',
                    token: this.token,
                    'c-version': '2.1.2',
                    'content-type': 'application/x-www-form-urlencoded',
                    //cookie: this.cookie,
                    'user-agent': 'okhttp/4.7.2'
                },
                form: { sg_code: '53', event: 'pull_mrsg' }
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == 1) {
                DoubleLog(`账号[${this.index}]  获取答题任务成功: ${result.msg}`);
                await wait(5)
                await this.chatuser_list("获取消息列表")
            } else {
                DoubleLog(`账号[${this.index}]  获取答题任务:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async chatuser_list(name) { // 获取消息列表
        try {
            let options = {
                method: 'GET',
                url: 'https://ws.shiguangjia.cn:8086/user_im/chatuser_list',
                qs: { offset: '0', length: '1000' },
                headers: {
                    'jm-devicetype': 'android',
                    'jm-verifymd5': this.sign,
                    'jm-deviceid': this.jm_deviceid,
                    'jm-versioncode': '215',
                    'jm-appid': '4044dd5f9031ba15a74a980c8cfbd74474b5dadf',
                    'jm-signtime': this.ts,
                    'jm-token': this.jm_token,
                    'user-agent': 'okhttp/4.7.2'
                }
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            //console.log(result.data.list[4]);
            if (result.code == 1) {
                DoubleLog(`账号[${this.index}]  获取答题任务信息: ${result.msg}`);
                for (let i in result.data.list) {
                    if (result.data.list[i]._name == "每日拾光") {
                        console.log(`任务信息: ${result.data.list[i].last_msg.nr.data.h.t}&${result.data.list[4].last_msg.nr.data.h.st}`);
                        console.log(`任务链接获取成功 : ${result.data.list[i].last_msg.nr.data.url}`);
                        let r1 = result.data.list[4].last_msg.nr.data.url.replace("shiguangjia:\/\/sgj.cn\/uniapp\/__UNI__C6B64AE\/pages\/task\/taskDetail?", "")
                        //rw_id=168&pk=push20221207111239J9adIUVB6v
                        let r2 = r1.slice(6, 9)
                        let r3 = r1.slice(13)
                        await wait(3)
                        await this.task_accept(r2, r3)
                    }

                }
                //for (let i in result.data.list[4].last_msg.nr.data.list) {
                //console.log(`任务有效期和奖励为${result.data.list[4].last_msg.nr.data.list[i].n}&${result.data.list[4].last_msg.nr.data.list[i].v}`);
                //}
                //rw_id=168&pk=push20221207111239J9adIUVB6v
                //let r2 = r1.slice(6, 9)
                //let r3 = r1.slice(13)
                //await this.task_accept(r2, r3)
            } else {
                DoubleLog(`账号[${this.index}]  获取答题任务:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_accept(r2, r3) { // 接受任务
        try {
            let options = {
                method: 'POST',
                url: 'https://api.shiguangjia.cn/api/task/accept',
                headers: {
                    'C-model': 'android',
                    'C-type': 'app-miniapp',
                    'C-version': '2.7.7',
                    token: this.token,
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36 uni-app Html5Plus/1.0 (Immersed/29.818182)',
                    'Content-Type': 'application/json;charset=UTF-8',
                    Host: 'api.shiguangjia.cn',
                    Connection: 'Keep-Alive',
                    //Cookie: this.cookie,
                    'content-type': 'application/json'
                },
                body: { rw_id: r2, pk: r3 },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, "接受任务");
            //console.log(result);
            if (result.code == 1) {
                DoubleLog(`账号[${this.index}]  接受答题任务成功: ${result.msg},${result.data.type}&${result.data.record_id}`);
                await wait(3);
                let r4 = result.data.record_id
                await this.get_rw(r2, r4);
            } else if (result.code == -1) {
                DoubleLog(`账号[${this.index}]  接受答题任务:失败 ❌ 了呢,原因${result.msg}！`);
            } else {
                DoubleLog(`账号[${this.index}]  接受答题任务:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async get_rw(r2, r4) { // 进入答题任务
        try {
            let options = {
                method: 'POST',
                url: 'https://api.shiguangjia.cn/api/task/get_rw',
                headers: {
                    'C-model': 'android',
                    'C-type': 'app-miniapp',
                    'C-version': '2.7.7',
                    token: this.token,
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36 uni-app Html5Plus/1.0 (Immersed/29.818182)',
                    'Content-Type': 'application/json;charset=UTF-8',
                    Host: 'api.shiguangjia.cn',
                    Connection: 'Keep-Alive',
                    //Cookie: this.cookie,
                    'content-type': 'application/json'
                },
                body: { rw_id: r2, pk: '' },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, "进入答题任务");
            //console.log(result);
            if (result.code == 1) {
                DoubleLog(`账号[${this.index}]  进入答题任务成功: ${result.msg}`);
                //console.log(`本次答题id为[${result.data.rw.id}&${result.data.rw.rw_id}]`)
                //console.log(`广告标题为${result.data.rw.name},任务标题为${result.data.rw.short_name}`)
                //console.log(`任务类型为${result.data.rw.tags_text}&${result.data.rw.type_text},任务状况为${result.data.rw.status_text}`);
                await wait(3)
                await this.get_recoord(r4)
            } else {
                DoubleLog(`账号[${this.index}]  进入答题任务:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async get_recoord(r4) { // 进入答题
        try {
            let options = {
                method: 'POST',
                url: 'https://api.shiguangjia.cn/api/task/get_record',
                headers: {
                    'C-model': 'android',
                    'C-type': 'app-miniapp',
                    'C-version': '2.7.7',
                    token: this.token,
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36 uni-app Html5Plus/1.0 (Immersed/29.818182)',
                    'Content-Type': 'application/json;charset=UTF-8',
                    Host: 'api.shiguangjia.cn',
                    Connection: 'Keep-Alive',
                    //Cookie: this.cookie,
                    'content-type': 'application/json'
                },
                body: { record_id: r4 },
                json: true
            };

            //console.log(options);
            let result = await httpRequest(options, "进入答题");
            //console.log(result);
            if (result.code == 1) {
                DoubleLog(`账号[${this.index}]  进入答题成功: ${result.msg}`);
                console.log(`本次答题id为[${result.data.rw.id}&${result.data.rw.rw_id}]`)
                console.log(`广告标题[${result.data.rw.name}],任务标题[${result.data.rw.short_name}]`)
                console.log(`任务类型[${result.data.rw.tags_text}]&[${result.data.rw.type_text}],任务状况[${result.data.rw.status_text}]`);
                await wait(3)
                await this.get_qlist(r4)
            } else {
                DoubleLog(`账号[${this.index}]  进入答题:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async get_qlist(r4) { // 获取答题列表
        let r0 = []
        let l = []
        try {
            let options = {
                method: 'POST',
                url: 'https://api.shiguangjia.cn/api/task/get_qlist',
                headers: {
                    'C-model': 'android',
                    'C-type': 'app-miniapp',
                    'C-version': '2.7.7',
                    token: this.token,
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36 uni-app Html5Plus/1.0 (Immersed/29.818182)',
                    'Content-Type': 'application/json;charset=UTF-8',
                    Host: 'api.shiguangjia.cn',
                    Connection: 'Keep-Alive',
                    //Cookie: this.cookie,
                    'content-type': 'application/json'
                },
                body: { record_id: r4 },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, "获取答题列表");
            //console.log(result);
            if (result.code == 1) {
                DoubleLog(`账号[${this.index}]  获取题目列表成功: ${result.msg}`);
                //console.log(`本次答题Key为[${result.data.key}]`)
                let k = result.data.key
                for (let i in result.data.question) {
                    console.log(`题目[${i}],id[${result.data.question[i].id}],问题题目${result.data.question[i].question},该题目答案可能为${result.data.question[i].answer[0]}`);
                    r0.push(result.data.question[i].answer[0])
                }
                await wait(3)
                await this.sub_papers(r4, k, r0)
            } else {
                DoubleLog(`账号[${this.index}]  获取题目列表:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async sub_papers(r4, k, r0) { // 提交答案

        try {
            function r(r00) {
                if (r00.length == 3) {
                    return [
                        { qid: 0, answer: [r0[0]], error: false },
                        { qid: 1, answer: [r0[1]], error: false },
                        { qid: 2, answer: [r0[2]], error: false }
                    ]
                } else if (r0.length == 4) {
                    return [
                        { qid: 0, answer: [r0[0]], error: false },
                        { qid: 1, answer: [r0[1]], error: false },
                        { qid: 2, answer: [r0[2]], error: false },
                        { qid: 3, answer: [r0[3]], error: false }
                    ]
                }
            }
            let pp = r(r0)
            let options = {
                method: 'POST',
                url: 'https://api.shiguangjia.cn/api/task/sub_papers',
                headers: {
                    'C-model': 'android',
                    'C-type': 'app-miniapp',
                    'C-version': '2.7.7',
                    token: this.token,
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36 uni-app Html5Plus/1.0 (Immersed/29.818182)',
                    'Content-Type': 'application/json;charset=UTF-8',
                    Host: 'api.shiguangjia.cn',
                    Connection: 'Keep-Alive',
                    //Cookie: this.cookie,
                    'content-type': 'application/json'
                },
                body: {
                    record_id: r4,
                    key: k,
                    papers: pp
                },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, "提交答案");
            //console.log(result);
            if (result.code == 1) {
                DoubleLog(`账号[${this.index}]  提交答案成功: ${result.msg}`);
            } else {
                DoubleLog(`账号[${this.index}]  提交答案:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
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
// 网络请求 (get, post等)
async function httpRequest(options, name) { var request = require("request"); return new Promise((resolve) => { if (!name) { let tmp = arguments.callee.toString(); let re = /function\s*(\w*)/i; let matches = re.exec(tmp); name = matches[1] } if (debug) { console.log(`\n【debug】===============这是${name}请求信息===============`); console.log(options) } request(options, function (error, response) { if (error) throw new Error(error); let data = response.body; try { if (debug) { console.log(`\n\n【debug】===============这是${name}返回数据==============`); console.log(data) } if (typeof data == "string") { if (isJsonString(data)) { let result = JSON.parse(data); if (debug) { console.log(`\n【debug】=============这是${name}json解析后数据============`); console.log(result) } resolve(result) } else { let result = data; resolve(result) } function isJsonString(str) { if (typeof str == "string") { try { if (typeof JSON.parse(str) == "object") { return true } } catch (e) { return false } } return false } } else { let result = data; resolve(result) } } catch (e) { console.log(error, response); console.log(`\n ${name}失败了!请稍后尝试!!`) } finally { resolve() } }) }) }
// 等待 X 秒
function wait(n) { return new Promise(function (resolve) { setTimeout(resolve, n * 1000) }) }
// 双平台log输出
function DoubleLog(data) { if ($.isNode()) { if (data) { console.log(`${data}`); msg += `${data}` } } else { console.log(`${data}`); msg += `${data}` } }
// 发送消息
async function SendMsg(message) { if (!message) return; if (Notify > 0) { if ($.isNode()) { var notify = require("./sendNotify"); await notify.sendNotify($.name, message) } else { $.msg($.name, '', message) } } else { console.log(message) } }
// 完整 Env
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
