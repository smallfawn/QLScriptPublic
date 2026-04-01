
/*
[Script]
http-response

[MITM]
hostname = 

*/

const $ = new Env("海天美味馆小程序");
let ckName = `haday`;
let userCookie = checkEnv(
    ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || ""
);
const notify = $.isNode() ? require("./sendNotify") : "";

!(async () => {
    console.log(
        `==================================================\n 脚本执行 - 北京时间(UTC+8): ${new Date(
            new Date().getTime() +
            new Date().getTimezoneOffset() * 60 * 1000 +
            8 * 60 * 60 * 1000
).toLocaleString()} \n==================================================`
);
    //console.log(userCookie)
    if (!userCookie?.length) return console.log(`没有找到CK哦`);
    let index = 1;
    let strSplitor = "#";

    for (let user of userCookie) {
        $.log(`\n🚀 user:【${index}】 start work\n`);
        index++
        $.token = user.split(strSplitor)[0];
        $.uuid = user.split(strSplitor)[1];
        $.ckStatus = true;
        $.activity_code = null
        $.canUse = 0
        await getActivityInfo()
        await $.wait(3000)

        if ($.activity_code) {
            await userInfo()
        }
        await task_1()
        await $.wait(3000)

        await task_2()
        await $.wait(3000)

        await lotteryInfo()
        await $.wait(3000)

        await getLotteryNum()
        for (let i = 0; i < $.canUse; i++) {
            await $.wait(3000)

            await lottery()

        }
    }

    await $.sendMsg($.logs.join("\n"));
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());
async function getActivityInfo() {
    let config = {
        url: `https://cmallapi.haday.cn/buyer-api/sign/activity/code?activityCode=`,
        method: "GET",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Authorization": $.token,
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "envVersion": "release",
            "Host": "cmallapi.haday.cn",
            "Referer": "https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/8555",
            "uuid": $.uuid,
            "xweb_xhr": "1"
        }
    }
    let { data: result } = await Request(config)
    if (result?.code == 403) {
        $.log(`获取活动信息失败，原因：CK可能过期`)
    }
    if ("activity_code" in result) {
        $.log(`获取活动信息成功，活动ID：${result.activity_code}`)
        $.activity_code = result.activity_code
    }
}
async function signIn() {
    let data = { "activity_code": $.activity_code, "fill_date": "" }
    let config = {
        url: `https://cmallapi.haday.cn/buyer-api/sign/activity/sign`,
        method: "POST",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Authorization": $.token,
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "envVersion": "release",
            "Host": "cmallapi.haday.cn",
            "Referer": "https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/8555",
            "uuid": $.uuid,
            "xweb_xhr": "1"
        },
        data: JSON.stringify(data)
    }
    let { data: result } = await Request(config)
    if (result.is_sign == true) {
        $.log(`签到成功`)
    } else {
        $.log(`签到失败 [${result.message}]`)
    }

}

async function userInfo() {

    let config = {
        url: `https://cmallapi.haday.cn/buyer-api/sign/activity/member/info?activityCode=${$.activity_code}`,
        method: "GET",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Authorization": $.token,
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "envVersion": "release",
            "Host": "cmallapi.haday.cn",
            "Referer": "https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/8555",
            "uuid": $.uuid,
            "xweb_xhr": "1"
        }
    }
    let { data: result } = await Request(config)
    if (result?.is_sign !== true) {
        $.log(`${result.member_id}未签到，开始签到`)
        await signIn()
    } else {

    }
    $.log(`当前累计签到[${result.sign_day_num}]`)
}
//浏览页面
async function task_1() {
    let data = {}
    let config = {
        url: `https://cmallapi.haday.cn/buyer-api/members/browsePage`,
        method: "POST",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Authorization": $.token,
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "envVersion": "release",
            "Host": "cmallapi.haday.cn",
            "Referer": "https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/8555",
            "uuid": $.uuid,
            "xweb_xhr": "1"
        },
        data: JSON.stringify(data)
    }
    let { data: result } = await Request(config)
    if (result?.code == 200) {
        $.log(`浏览界面 操作成功`)
    } else {
        $.log(`浏览界面 操作失败[${JSON.stringify(result)}]`)
    }

}
//浏览社区
async function task_2() {
    let data = {}
    let config = {
        url: `https://cmallapi.haday.cn/buyer-api/members/commnity/brosing/duration/add?seconds=100`,
        method: "POST",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Authorization": $.token,
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "envVersion": "release",
            "Host": "cmallapi.haday.cn",
            "Referer": "https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/8555",
            "uuid": $.uuid,
            "xweb_xhr": "1"
        },
        data: JSON.stringify(data)
    }
    let { data: result } = await Request(config)
    if (result?.statusCode == 200) {
        $.log(`浏览社区 操作成功`)
    } else {
        $.log(`浏览社区 操作失败 貌似是正常的 [${result}]`)
    }

}
async function getLotteryNum() {
    let config = {
        url: `https://cmallapi.haday.cn/buyer-api/lucky/activity/opporturnity?activityCode=jfcj0527`,
        method: "GET",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Authorization": $.token,
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "envVersion": "release",
            "Host": "cmallapi.haday.cn",
            "Referer": "https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/8555",
            "uuid": $.uuid,
            "xweb_xhr": "1"
        },
    }
    let { data: result } = await Request(config)
    if (result.can_use > 0) {
        $.canUse = result.can_use
        $.log(`当前剩余抽奖次数：${result.can_use}`)
    } else {
        $.log(`当前剩余抽奖次数0`)
    }
}
async function lottery() {
    let config = {
        url: `https://cmallapi.haday.cn/buyer-api/lucky/activity/extract?activityCode=jfcj0527`,
        method: "GET",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Authorization": $.token,
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "envVersion": "release",
            "Host": "cmallapi.haday.cn",
            "Referer": "https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/8555",
            "uuid": $.uuid,
            "xweb_xhr": "1"
        },
    }
    let { data: result } = await Request(config)
    if (result.lucky_record_vo) {
        $.log(`抽奖获得：${result.lucky_record_vo.prize_name}`)
    } else {
        $.log(result.message)
    }

}
async function lotteryInfo() {
    let config = {
        url: `https://cmallapi.haday.cn/buyer-api/lucky/task/package/jfcj0527`,
        method: "GET",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Authorization": $.token,
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "envVersion": "release",
            "Host": "cmallapi.haday.cn",
            "Referer": "https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/8555",
            "uuid": $.uuid,
            "xweb_xhr": "1"
        },
    }
    let { data: result } = await Request(config)
    if (result?.member_id) {

        for (let i of result.task_list) {
            if (i.today_obtained_task_number < i.today_available_task_number) {
                if (i.task_key == 'LOGIN') {
                    await $.wait(3000)

                    await lottery_task_login()
                }
                if (i.task_key == 'POINT_EXCHANGE') {
                    for (let j = 0; j < i.today_available_task_number; j++) {
                        await $.wait(3000)
                        await lottery_task_exchange()

                    }
                }
                if (i.task_key == 'BROWSE_PAGE_TASK') {
                    await $.wait(3000)

                    await lottery_task_see(i.link)

                }
            }


        }
    } else {
        $.log(`获取抽奖信息 操作失败[${JSON.stringify(result)}]`)
    }

}
//抽奖登录 领取次数
async function lottery_task_login() {
    let data = {}
    let config = {
        url: `https://cmallapi.haday.cn/buyer-api/lucky/task/getLoginOpporturnity/jfcj0527`,
        method: "PUT",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Authorization": $.token,
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "envVersion": "release",
            "Host": "cmallapi.haday.cn",
            "Referer": "https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/8555",
            "uuid": $.uuid,
            "xweb_xhr": "1"
        },
        data: JSON.stringify(data)
    }
    let { data: result } = await Request(config)
    $.log(result)

}
async function lottery_task_exchange() {
    let config = {
        url: `https://cmallapi.haday.cn/buyer-api/lucky/activity/redeem?activityCode=jfcj0527`,
        method: "GET",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Authorization": $.token,
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "envVersion": "release",
            "Host": "cmallapi.haday.cn",
            "Referer": "https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/8555",
            "uuid": $.uuid,
            "xweb_xhr": "1"
        },
    }
    let { data: result } = await Request(config)
    if (result?.member_id) {
        $.log(`兑换次数成功`)

    } else {
        $.log(`兑换次数失败`)
        $.log(result)
    }

}
//浏览页面
async function lottery_task_see(link) {
    let config_start = {
        url: `https://cmallapi.haday.cn/buyer-api/lucky/task/browse/page/start/jfcj0527?pageUrl=${link}`,
        method: "GET",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Authorization": $.token,
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "envVersion": "release",
            "Host": "cmallapi.haday.cn",
            "Referer": "https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/8555",
            "uuid": $.uuid,
            "xweb_xhr": "1"
        },
    }
    let { data: result_start } = await Request(config_start)
    let config_end = {
        url: `https://cmallapi.haday.cn/buyer-api/lucky/task/browse/page/start/jfcj0527?pageUrl=${link}`,
        method: "GET",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Authorization": $.token,
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "envVersion": "release",
            "Host": "cmallapi.haday.cn",
            "Referer": "https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/8555",
            "uuid": $.uuid,
            "xweb_xhr": "1"
        },
    }
    let { data: result_end } = await Request(config_end)
    $.log(`浏览页面完成`)
}


function checkEnv(userCookie) {
    const envSplitor = ["&", "\n"];
    //console.log(userCookie);
    let userList = userCookie
        .split(envSplitor.find((o) => userCookie.includes(o)) || "&")
        .filter((n) => n);
    console.log(`共找到${userList.length}个账号`);
    return userList;
}
// prettier-ignore
function Env(t, s) { return new (class { constructor(t, s) { this.name = t; this.logs = []; this.logSeparator = "\n"; this.startTime = new Date().getTime(); Object.assign(this, s); this.log("", `\ud83d\udd14${this.name},\u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } queryStr(options) { return Object.entries(options).map(([key, value]) => `${key}=${typeof value === "object" ? JSON.stringify(value) : value}`).join("&") } getURLParams(url) { const params = {}; const queryString = url.split("?")[1]; if (queryString) { const paramPairs = queryString.split("&"); paramPairs.forEach((pair) => { const [key, value] = pair.split("="); params[key] = value }) } return params } isJSONString(str) { try { return JSON.parse(str) && typeof JSON.parse(str) === "object" } catch (e) { return false } } isJson(obj) { var isjson = typeof obj == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length; return isjson } async sendMsg(message) { if (!message) return; if (this.isNode()) { await notify.sendNotify(this.name, message) } else { this.msg(this.name, "", message) } } randomNumber(length) { const characters = "0123456789"; return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join("") } randomString(length) { const characters = "abcdefghijklmnopqrstuvwxyz0123456789"; return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join("") } uuid() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) { var r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8; return v.toString(16) }) } time(t) { let s = { "M+": new Date().getMonth() + 1, "d+": new Date().getDate(), "H+": new Date().getHours(), "m+": new Date().getMinutes(), "s+": new Date().getSeconds(), "q+": Math.floor((new Date().getMonth() + 3) / 3), S: new Date().getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) { new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))) } return t } msg(title = t, subtitle = "", body = "", options) { const formatOptions = (options) => { if (!options) { return options } else if (typeof options === "string") { if (this.isQuanX()) { return { "open-url": options } } else { return undefined } } else if (typeof options === "object" && (options["open-url"] || options["media-url"])) { if (this.isQuanX()) { return options } else { return undefined } } else { return undefined } }; if (!this.isMute) { if (this.isQuanX()) { $notify(title, subtitle, body, formatOptions(options)) } } let logs = ["", "==============📣系统通知📣=============="]; logs.push(title); subtitle ? logs.push(subtitle) : ""; body ? logs.push(body) : ""; console.log(logs.join("\n")); this.logs = this.logs.concat(logs) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, s) { const e = !this.isQuanX(); e ? this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t) } wait(t) { return new Promise((s) => setTimeout(s, t)) } done(t = {}) { const s = new Date().getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`); this.log(); if (this.isNode()) { process.exit(1) } if (this.isQuanX()) { $done(t) } } })(t, s) }

async function Request(options) {
    if ($.isNode()) {
        const axios = require("axios");
        Request = async (options) => {
            try {
                return await axios.request(options);
            } catch (error) {
                return error && error.error ? error.error : "请求失败";
            }
        };
    }
    if ($.isQuanX()) {
        Request = async (options) => {
            try {
                return await $task.fetch(options);
            } catch (error) {
                return error && error.error ? error.error : "请求失败";
            }
        };
    }
    return await Request(options);
}
