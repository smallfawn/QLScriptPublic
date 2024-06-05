/**
 * cron 5 12 * * *
 * Show:每日做联想乐豆任务 可以换东西
 * 变量名:lenovoapp
 * 变量值:  APP 我的 乐豆 前往乐豆兑换中心 抓 https://mmembership.lenovo.com.cn/member-hp-task-center 
 * 请求头Headers 中 lenovoid#servicetoken 去掉Bearer 前缀 的值  两个值缺一不可
 * scriptVersionNow = "0.0.1";
 */

const $ = new Env("联想App");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "lenovoapp";
let envSplitor = ["&", "\n"]; //多账号分隔符
let strSplitor = "#"; //多变量分隔符
let userIdx = 0;
let userList = [];
class Task {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.token = str.split(strSplitor)[1];
    }
    async main() {
        await this.userInfo()
        if (this.ckStatus) {
            await this.isSignIn()
            await this.getUserTaskList();
        }


    }
    async userInfo() {
        let result = await this.taskRequest({ method: "POST", url: `https://mmembership.lenovo.com.cn/member-hp-webapi/v1/userBenefit/getMyAssets` })
        //console.log(result);
        if (result.code == "0") {
            $.log(`✅账号[${this.index}]  获取用户信息成功===>[${result.data.userId}]乐豆[${result.data.ledouNum}]`);
            this.ckStatus = true
        } else {
            $.log(`❌账号[${this.index}]  获取用户状态失败`);
            this.ckStatus = false
            //console.log(result);
        }
    }
    async isSignIn() {
        let result = await this.taskRequest({ method: "POST", url: `https://mmembership.lenovo.com.cn/member-hp-task-center/v1/task/getCheckInList?lenovoId=10219183246` })
        //console.log(result);
        if (result.code == "0") {
            if (result.data.flag == !1) {
                $.log(`✅账号[${this.index}]  今日未签到 =====> 签到ing🎉`)

                await this.checkIn()
            }
        } else {
            $.log(`❌账号[${this.index}]  获取签到状态`);
            //console.log(result);
        }
    }
    async checkIn() {
        let result = await this.taskRequest({ method: "POST", url: `https://mmembership.lenovo.com.cn/member-hp-task-center/v1/task/checkIn?lenovoId=10219183246&OSType=10011` })
        //console.log(result);
        if (result.code == "0") {
            $.log(`✅账号[${this.index}]  签到成功🎉`)
        } else {
            $.log(`❌账号[${this.index}]  签到失败`);
            //console.log(result);
        }
    }
    async getUserTaskList() {
        let result = await this.taskRequest({ method: "POST", url: `https://mmembership.lenovo.com.cn/member-hp-task-center/v1/task/getUserTaskList` })
        //console.log(result);
        if (result.code == "0") {
            $.log(`✅账号[${this.index}]  获取任务列表成功🎉`)
            for (let i = 0; i < result.data.length; i++) {
                let task = result.data[i];
                if (task.taskState == 0 && task.type !== 13) {
                    await $.wait(5000)
                    await this.doTask(task.taskId);
                }
                
            }
        } else {
            $.log(`❌账号[${this.index}]  获取任务列表失败`);
            //console.log(result);
        }
    }
    async doTask(id) {
        let result_ = await this.taskRequest({ method: "POST", url: `https://mmembership.lenovo.com.cn/member-hp-task-center/v1/checkin/selectTaskPrize?taskId=${id}&channelId=1` })
        if (result_.code == "0") {
            let result = await this.taskRequest({ method: "POST", url: `https://mmembership.lenovo.com.cn/member-hp-task-center/v1/Task/userFinishTask?taskId=${id}&channelId=1&state=1` })
            //console.log(result);
            if (result.code == "0") {
                $.log(`✅账号[${this.index}]  任务执行成功🎉`)

            } else {
                $.log(`❌账号[${this.index}]  任务执行失败`);
                console.log(result);
                console.log(id)
            }
        }

    }

    async taskRequest(options) {
        const axios = require('axios');
        let headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.99 Mobile Safari/537.36/lenovoofficialapp/9e4bb0e5bc326fb1_10219183246/newversion/versioncode-1000112/',
            'Accept-Encoding': 'gzip, deflate',
            'pragma': 'no-cache',
            'cache-control': 'no-cache',
            'origin': 'https://mmembership.lenovo.com.cn',
            'servicetoken': 'Bearer ' + this.token,
            'sec-fetch-dest': 'empty',
            'lenovoid': this.ck,
            'clientid': '2',
            'x-requested-with': 'com.lenovo.club.app',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'referer': 'https://mmembership.lenovo.com.cn/app?pmf_source=P0000005611M0002',
            'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        }
        Object.assign(options, { headers })
        let { data: result } = await axios.request(options)
        return result
    }
}



!(async () => {
    console.log(`==================================================\n 脚本执行 - 北京时间(UTC+8): ${new Date(
        new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000
    ).toLocaleString()} \n==================================================`);
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        let taskall = [];
        for (let user of userList) {
            if (user.ckStatus) {
                taskall.push(await user.main());
            }
        }
        await Promise.all(taskall);
    }
    await $.sendMsg($.logs.join("\n"))
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

//********************************************************
/**
 * 变量检查与处理
 * @returns
 */
async function checkEnv() {
    let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || "";
    if (userCookie) {
        let e = envSplitor[0];
        for (let o of envSplitor)
            if (userCookie.indexOf(o) > -1) {
                e = o;
                break;
            }
        for (let n of userCookie.split(e)) n && userList.push(new Task(n));
    } else {
        console.log(`未找到CK【${ckName}】`);
        return;
    }
    return console.log(`共找到${userList.length}个账号`), true; //true == !0
}
//Env Api =============================
/*
 *   @modifyAuthor @smallfawn
 *   @modifyTime 2024-05-01
 *   @modifyInfo 抽离操作文件的函数
 */
function Env(t, s) {
    return new (class {
        constructor(t, s) {
            this.name = t;
            this.logs = [];
            this.logSeparator = "\n";
            this.startTime = new Date().getTime();
            Object.assign(this, s);
            this.log("", `\ud83d\udd14${this.name},\u5f00\u59cb!`);
        }
        isNode() {
            return "undefined" != typeof module && !!module.exports;
        }
        isQuanX() {
            return "undefined" != typeof $task;
        }

        queryStr(options) {
            return Object.entries(options)
                .map(
                    ([key, value]) =>
                        `${key}=${typeof value === "object" ? JSON.stringify(value) : value
                        }`
                )
                .join("&");
        }
        getURLParams(url) {
            const params = {};
            const queryString = url.split("?")[1];
            if (queryString) {
                const paramPairs = queryString.split("&");
                paramPairs.forEach((pair) => {
                    const [key, value] = pair.split("=");
                    params[key] = value;
                });
            }
            return params;
        }
        isJSONString(str) {
            try {
                return JSON.parse(str) && typeof JSON.parse(str) === "object";
            } catch (e) {
                return false;
            }
        }
        isJson(obj) {
            var isjson =
                typeof obj == "object" &&
                Object.prototype.toString.call(obj).toLowerCase() ==
                "[object object]" &&
                !obj.length;
            return isjson;
        }
        async sendMsg(message) {
            if (!message) return;
            if (this.isNode()) {
                await notify.sendNotify(this.name, message);
            } else {
                this.msg(this.name, "", message);
            }
        }

        randomNumber(length) {
            const characters = "0123456789";
            return Array.from(
                { length },
                () => characters[Math.floor(Math.random() * characters.length)]
            ).join("");
        }
        randomString(length) {
            const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
            return Array.from(
                { length },
                () => characters[Math.floor(Math.random() * characters.length)]
            ).join("");
        }
        timeStamp() {
            return new Date().getTime();
        }
        uuid() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
                /[xy]/g,
                function (c) {
                    var r = (Math.random() * 16) | 0,
                        v = c == "x" ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                }
            );
        }
        time(t) {
            let s = {
                "M+": new Date().getMonth() + 1,
                "d+": new Date().getDate(),
                "H+": new Date().getHours(),
                "m+": new Date().getMinutes(),
                "s+": new Date().getSeconds(),
                "q+": Math.floor((new Date().getMonth() + 3) / 3),
                S: new Date().getMilliseconds(),
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in s) {
                new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length)));
            }
            return t;
        };
        msg(title = t, subtitle = "", body = "", options) {
            const formatOptions = (options) => {
                if (!options) {
                    return options;
                } else if (typeof options === "string") {
                    if (this.isQuanX()) {
                        return { "open-url": options };
                    } else {
                        return undefined;
                    }
                } else if (typeof options === "object" && (options["open-url"] || options["media-url"])) {
                    if (this.isQuanX()) {
                        return options;
                    } else {
                        return undefined;
                    }
                } else {
                    return undefined;
                }
            };
            if (!this.isMute) {
                if (this.isQuanX()) {
                    $notify(title, subtitle, body, formatOptions(options));
                }
            }
            let logs = ["", "==============📣系统通知📣=============="];
            logs.push(title);
            subtitle ? logs.push(subtitle) : "";
            body ? logs.push(body) : "";
            console.log(logs.join("\n"));
            this.logs = this.logs.concat(logs);
        };
        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]),
                console.log(t.join(this.logSeparator));
        }
        logErr(t, s) {
            const e = !this.isQuanX();
            e
                ? this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t.stack)
                : this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t);
        }
        wait(t) {
            return new Promise((s) => setTimeout(s, t));
        }
        done(t = {}) {
            const s = new Date().getTime(),
                e = (s - this.startTime) / 1e3;
            this.log(
                "",
                `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`
            );
            this.log();
            if (this.isNode()) {
                process.exit(1);
            }
            if (this.isQuanX()) {
                $done(t);
            }
        }
    })(t, s);
}
