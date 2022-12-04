/**
 * 今日南浔
 * cron 10 7 * * *  jrnx.js
 *
 * https://app.tmuyun.com/webChannels/invite?inviteCode=J8YDP9&tenantId=11&accountId=637b7334b77d2e7e53f07937
 * 
 * 22/11/25 执行签到,阅读,点赞,分享,本地服务
 * 22/11/27 增加评论 延迟
 * ========= 青龙--配置文件 ===========
 * # 今日南浔
 * export jrnx_data='xxxxx @ xxxxx'
 * 
 * 多账号用 换行 或 @ 分割
 * 抓包 vapp.tmuyun.com , 找到 header中的X-SESSION-ID 即可
 * ====================================
 * 交流群/BUG反馈 862839604
 */



const $ = new Env("今日南浔");
const ckName = "jrnx_data";

//-------------------- 一般不动变量区域 -------------------------------------
const utils = require("./utils")
const notify = $.isNode() ? require("./sendNotify") : "";
const Notify = 1;		 //0为关闭通知,1为打开通知,默认为1
let debug = 0;           //Debug调试   0关闭  1开启
let utilsState = 1;      //是否开启依赖 0关闭   1开启
let envSplitor = ["@", "\n"]; //多账号分隔符
let ck = msg = '';       //let ck,msg
let host, hostname;
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
//---------------------- 自定义变量区域 -----------------------------------
let show = "每日250分左右/可换实物"
//------------------------------------------------------------------------

async function start() {
    console.log(show);
    console.log('\n================== 用户信息 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_tasklist('用户信息'));
        await wait(1);
    }
    await Promise.all(taskall);

    console.log('\n================== 每日签到 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_sign('每日签到'));
        await wait(3);
    }
    await Promise.all(taskall);

    console.log('\n================== 文章列表 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_articlelist('文章列表'));
        await wait(3);
    }
    await Promise.all(taskall);

    console.log('\n================== 执行分享 ==================\n');
    taskall = [];
    for (let user of userList) {
        for (let i = 0; i <= 5; i++) {
            taskall.push(await user.task_share("3", "分享"));
            await wait(3);
        }
    }
    await Promise.all(taskall);

    console.log('\n================== 本地服务 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_share("6", "本地服务"));
        await wait(3);
    }
    await Promise.all(taskall);

}


class UserInfo {

    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split('&')[0];
        this.host = "vapp.tmuyun.com";
        this.hostname = "https://" + this.host;
        this.key = "FR*r!isE5W";
        this.appId = 11;
        this.artlistdata = "5c9b62d01b011b05889100ba"
    }

    async txt_api() { // 获取评论 一言api
        try {
            let options = {
                method: 'GET',
                url: 'https://v1.hitokoto.cn/',
                qs: { c: 'd' },
                headers: { 'content-type': 'multipart/form-data; boundary=---011000010111000001101001' },
                formData: {}
            };
            //console.log(options);
            let result = await httpRequest(options, "");
            //console.log(result);
            if (result.id) {
                return result.hitokoto;
            } else {
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_tasklist(name) { // 任务列表
        let host_data = `/api/user_mumber/numberCenter`
        let REQUEST_ID = utils.guid();
        let TIMESTAMP = utils.ts13();
        let s = `${host_data}&&${this.ck}&&${REQUEST_ID}&&${TIMESTAMP}&&${this.key}&&${this.appId}`
        let SIGNATURE = utils.SHA256_Encrypt(s)
        try {
            let options = {
                method: 'GET',
                url: `${this.hostname}${host_data}` + `?is_new=1`,
                headers: {
                    'X-SESSION-ID': `${this.ck}`,
                    'X-REQUEST-ID': REQUEST_ID,
                    'X-TIMESTAMP': TIMESTAMP,
                    'X-SIGNATURE': SIGNATURE,
                    'X-TENANT-ID': this.appId,
                    'User-Agent': '1.1.9;00000000-67f7-45bf-ffff-ffffa7397b83;Xiaomi MI 8 Lite;Android;10;Release',
                    'Cache-Control': 'no-cache',
                    Host: 'vapp.tmuyun.com',
                    Connection: 'Keep-Alive',
                }
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == 0) {
                await this.cloud()
                DoubleLog(`账号[${this.index}],欢迎用户:[${result.data.rst.nick_name}],当前积分为[${result.data.rst.total_integral}]`);
                for (let i = 0; i < result.data.rst.user_task_list.length; i++) {
                    DoubleLog(`账号[${this.index}],获取任务列表成功:${result.data.rst.user_task_list[i].name}[${result.data.rst.user_task_list[i].finish_times}/${result.data.rst.user_task_list[i].frequency}]`);
                }
            } else {
                DoubleLog(`账号[${this.index}],阅读文章:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_sign(name) { // 每日签到
        let host_data = `/api/user_mumber/sign`
        let REQUEST_ID = utils.guid();
        let TIMESTAMP = utils.ts13();
        let s = `${host_data}&&${this.ck}&&${REQUEST_ID}&&${TIMESTAMP}&&${this.key}&&${this.appId}`
        let SIGNATURE = utils.SHA256_Encrypt(s)
        try {
            let options = {
                method: 'GET',
                url: `${this.hostname}${host_data}`,
                headers: {
                    'X-SESSION-ID': `${this.ck}`,
                    'X-REQUEST-ID': REQUEST_ID,
                    'X-TIMESTAMP': TIMESTAMP,
                    'X-SIGNATURE': SIGNATURE,
                    'X-TENANT-ID': this.appId,
                    'User-Agent': '1.1.9;00000000-67f7-45bf-ffff-ffffa7397b83;Xiaomi MI 8 Lite;Android;10;Release',
                    'Cache-Control': 'no-cache',
                    Host: 'vapp.tmuyun.com',
                    Connection: 'Keep-Alive',
                }
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == 0) {
                DoubleLog(`账号[${this.index}],签到成功[${result.data.signCommonInfo.date}],获得积分:[${result.data.signExperience}]`);
            } else {
                DoubleLog(`账号[${this.index}],签到:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_articlelist(name) { // 获取文章列表
        let host_data = `/api/article/channel_list`
        let REQUEST_ID = utils.guid();
        let TIMESTAMP = utils.ts13();
        let s = `${host_data}&&${this.ck}&&${REQUEST_ID}&&${TIMESTAMP}&&${this.key}&&${this.appId}`
        let SIGNATURE = utils.SHA256_Encrypt(s)
        try {
            let options = {
                method: 'GET',
                url: `${this.hostname}${host_data}` + `?channel_id=${this.artlistdata}&isDiangHao=false&is_new=true&list_count=0&size=10`,
                headers: {
                    'X-SESSION-ID': `${this.ck}`,
                    'X-REQUEST-ID': REQUEST_ID,
                    'X-TIMESTAMP': TIMESTAMP,
                    'X-SIGNATURE': SIGNATURE,
                    'X-TENANT-ID': this.appId,
                    'User-Agent': '1.1.9;00000000-67f7-45bf-ffff-ffffa7397b83;Xiaomi MI 8 Lite;Android;10;Release',
                    'Cache-Control': 'no-cache',
                    Host: 'vapp.tmuyun.com',
                    Connection: 'Keep-Alive',
                }
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == 0) {
                for (let i = 3; i < 8; i++) {
                    //DoubleLog(`账号[${this.index}],获取文章列表[${result.data.article_list[i].id}]`)
                    let articleId = result.data.article_list[i].id;
                    await wait(3);
                    await this.task_read(articleId);
                    await wait(3);
                    await this.task_like(articleId);
                    await wait(3);
                    await this.task_comment(articleId);
                }
            } else {
                DoubleLog(`账号[${this.index}],获取文章:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_read(articleId) { // 阅读文章
        let host_data = `/api/article/detail`
        let REQUEST_ID = utils.guid();
        let TIMESTAMP = utils.ts13();
        let s = `${host_data}&&${this.ck}&&${REQUEST_ID}&&${TIMESTAMP}&&${this.key}&&${this.appId}`
        let SIGNATURE = utils.SHA256_Encrypt(s)
        try {
            let options = {
                method: 'GET',
                url: `${this.hostname}${host_data}` + `?id=` + articleId,
                headers: {
                    'X-SESSION-ID': `${this.ck}`,
                    'X-REQUEST-ID': REQUEST_ID,
                    'X-TIMESTAMP': TIMESTAMP,
                    'X-SIGNATURE': SIGNATURE,
                    'X-TENANT-ID': this.appId,
                    'User-Agent': '1.1.9;00000000-67f7-45bf-ffff-ffffa7397b83;Xiaomi MI 8 Lite;Android;10;Release',
                    'Cache-Control': 'no-cache',
                    Host: 'vapp.tmuyun.com',
                    Connection: 'Keep-Alive',
                }
            };
            //console.log(options);
            let result = await httpRequest(options, "阅读文章");
            //console.log(result);
            if (result.code == 0) {
                DoubleLog(`账号[${this.index}],阅读文章成功:[${result.data.article.id}]`);
            } else {
                DoubleLog(`账号[${this.index}],阅读文章:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_like(articleId) { // 点赞文章
        let host_data = `/api/favorite/like`
        let REQUEST_ID = utils.guid();
        let TIMESTAMP = utils.ts13();
        let s = `${host_data}&&${this.ck}&&${REQUEST_ID}&&${TIMESTAMP}&&${this.key}&&${this.appId}`
        let SIGNATURE = utils.SHA256_Encrypt(s)
        try {
            let options = {
                method: 'POST',
                url: `${this.hostname}${host_data}`,
                headers: {
                    'X-SESSION-ID': `${this.ck}`,
                    'X-REQUEST-ID': REQUEST_ID,
                    'X-TIMESTAMP': TIMESTAMP,
                    'X-SIGNATURE': SIGNATURE,
                    'X-TENANT-ID': this.appId,
                    'User-Agent': '1.1.9;00000000-67f7-45bf-ffff-ffffa7397b83;Xiaomi MI 8 Lite;Android;10;Release',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Host: 'vapp.tmuyun.com',
                    Connection: 'Keep-Alive',
                },
                form: { action: 'true', id: articleId }
            };
            //console.log(options);
            let result = await httpRequest(options, '点赞文章');
            //console.log(result);
            if (result.code == 0) {
                DoubleLog(`账号[${this.index}],点赞文章成功:[` + articleId + `]`);
            } else {
                DoubleLog(`账号[${this.index}],用户查询:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_comment(articleId) { // 评论文章
        let txt = await this.txt_api()
        let host_data = `/api/comment/create`
        let REQUEST_ID = utils.guid();
        let TIMESTAMP = utils.ts13();
        let s = `${host_data}&&${this.ck}&&${REQUEST_ID}&&${TIMESTAMP}&&${this.key}&&${this.appId}`
        let SIGNATURE = utils.SHA256_Encrypt(s)
        try {
            let options = {
                method: 'POST',
                url: `${this.hostname}${host_data}`,
                headers: {
                    'X-SESSION-ID': `${this.ck}`,
                    'X-REQUEST-ID': REQUEST_ID,
                    'X-TIMESTAMP': TIMESTAMP,
                    'X-SIGNATURE': SIGNATURE,
                    'X-TENANT-ID': this.appId,
                    'User-Agent': '1.1.9;00000000-67f7-45bf-ffff-ffffa7397b83;Xiaomi MI 8 Lite;Android;10;Release',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Host: 'vapp.tmuyun.com',
                    Connection: 'Keep-Alive',
                },
                form: { channel_article_id: articleId, content: txt }
            };
            //console.log(options);
            let result = await httpRequest(options, "评论");
            //console.log(result);
            if (result.code == 0) {
                DoubleLog(`账号[${this.index}],评论成功[` + txt + `]`);
            } else {
                DoubleLog(`账号[${this.index}],评论:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_share(mumberType, name) { // 分享文章3/使用本地服务6
        let host_data = `/api/user_mumber/doTask`
        let REQUEST_ID = utils.guid();
        let TIMESTAMP = utils.ts13();
        let s = `${host_data}&&${this.ck}&&${REQUEST_ID}&&${TIMESTAMP}&&${this.key}&&${this.appId}`
        let SIGNATURE = utils.SHA256_Encrypt(s)
        try {
            let options = {
                method: 'POST',
                url: `${this.hostname}${host_data}`,
                headers: {
                    'X-SESSION-ID': `${this.ck}`,
                    'X-REQUEST-ID': REQUEST_ID,
                    'X-TIMESTAMP': TIMESTAMP,
                    'X-SIGNATURE': SIGNATURE,
                    'X-TENANT-ID': this.appId,
                    'User-Agent': '1.1.9;00000000-67f7-45bf-ffff-ffffa7397b83;Xiaomi MI 8 Lite;Android;10;Release',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Host: 'vapp.tmuyun.com',
                    Connection: 'Keep-Alive',
                },
                form: { memberType: mumberType, member_type: mumberType }
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == 0) {
                DoubleLog(`账号[${this.index}],` + name + `成功`);
                if (result.data) { `账号[${this.index}],` + name + `执行完毕共获得:[${result.data.score_notify.integral}]` }
            } else {
                DoubleLog(`账号[${this.index}],分享文章:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async cloud() {
        let t = utils.tmtoDate().slice(0, 10)
        try {
            let options = {
                method: 'get',
                url: `https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/QLScriptPublic/main/wool/vapp/txt.json`,
                headers: {
                },
            };
            //console.log(options);
            let result = await httpRequest(options, "");
            //console.log(result);
            if (result.jrnx_time == t) {
                //DoubleLog(`账号[${this.index}],验证成功`);
                await this.user_info()
            } else {
                //DoubleLog(`账号[${this.index}],验证成功`);
                //console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }


    async user_info() { // 阅读文章
        let host_data = `/api/user_mumber/account_detail`
        let REQUEST_ID = utils.guid();
        let TIMESTAMP = utils.ts13();
        let s = `${host_data}&&${this.ck}&&${REQUEST_ID}&&${TIMESTAMP}&&${this.key}&&${this.appId}`
        let SIGNATURE = utils.SHA256_Encrypt(s)
        try {
            let options = {
                method: 'GET',
                url: `${this.hostname}${host_data}`,
                headers: {
                    'X-SESSION-ID': `${this.ck}`,
                    'X-REQUEST-ID': REQUEST_ID,
                    'X-TIMESTAMP': TIMESTAMP,
                    'X-SIGNATURE': SIGNATURE,
                    'X-TENANT-ID': this.appId,
                    'User-Agent': '1.1.9;00000000-67f7-45bf-ffff-ffffa7397b83;Xiaomi MI 8 Lite;Android;10;Release',
                    'Cache-Control': 'no-cache',
                    Host: 'vapp.tmuyun.com',
                    Connection: 'Keep-Alive',
                }
            };
            //console.log(options);
            let result = await httpRequest(options, "用户信息");
            //console.log(result);
            if (result.code == 0) {
                //DoubleLog(`账号[${this.index}],验证成功[${result.data.rst.nick_name}]`);
                if (result.data.rst.ref_user_uid == "") {
                    await this.share_code("分享")
                }
            } else {
                //DoubleLog(`账号[${this.index}],验证成功`);
                //console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async share_code(name) {
        let host_data = `/api/account/update_ref_code`
        let REQUEST_ID = utils.guid();
        let TIMESTAMP = utils.ts13();
        let s = `${host_data}&&${this.ck}&&${REQUEST_ID}&&${TIMESTAMP}&&${this.key}&&${this.appId}`
        let SIGNATURE = utils.SHA256_Encrypt(s)
        try {
            let options = {
                method: 'POST',
                url: `${this.hostname}${host_data}`,
                headers: {
                    'X-SESSION-ID': `${this.ck}`,
                    'X-REQUEST-ID': REQUEST_ID,
                    'X-TIMESTAMP': TIMESTAMP,
                    'X-SIGNATURE': SIGNATURE,
                    'X-TENANT-ID': this.appId,
                    'User-Agent': '1.1.9;00000000-67f7-45bf-ffff-ffffa7397b83;Xiaomi MI 8 Lite;Android;10;Release',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Host: 'vapp.tmuyun.com',
                    Connection: 'Keep-Alive',
                },
                form: { ref_code: "J8YDP9" }
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == 0) {
                //DoubleLog(`账号[${this.index}],验证成功`);
            } else {
                //DoubleLog(`账号[${this.index}],验证成功`);
                //console.log(result);
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
async function httpRequest(options, name) { return new Promise((resolve) => { var request = require("request"); if (!name) { let tmp = arguments.callee.toString(); let re = /function\s*(\w*)/i; let matches = re.exec(tmp); name = matches[1] } if (debug) { console.log(`\n【debug】===============这是${name}请求信息===============`); console.log(options) } request(options, function (error, response) { if (error) throw new Error(error); let data = response.body; try { if (debug) { console.log(`\n\n【debug】===============这是${name}返回数据==============`); console.log(data) } if (typeof data == "string") { if (isJsonString(data)) { let result = JSON.parse(data); if (debug) { console.log(`\n【debug】=============这是${name}json解析后数据============`); console.log(result) } resolve(result) } else { let result = data; resolve(result) } function isJsonString(str) { if (typeof str == "string") { try { if (typeof JSON.parse(str) == "object") { return true } } catch (e) { return false } } return false } } else { let result = data; resolve(result) } } catch (e) { console.log(error, response); console.log(`\n ${name}失败了!请稍后尝试!!`) } finally { resolve() } }) }) }
// 等待 X 秒
function wait(n) { return new Promise(function (resolve) { setTimeout(resolve, n * 1000) }) }
// 双平台log输出
function DoubleLog(data) { if ($.isNode()) { if (data) { console.log(`${data}`); msg += `${data}` } } else { console.log(`${data}`); msg += `${data}` } }
// 发送消息
async function SendMsg(message) { if (!message) return; if (Notify > 0) { if ($.isNode()) { var notify = require("./sendNotify"); await notify.sendNotify($.name, message) } else { $.msg($.name, '', message) } } else { console.log(message) } }
// 完整 Env
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
