/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description: 测试
------------------------------------------
#Notice:
CK 名字 kuaishou_speed
值: COOKIE 多账号&连接
打卡领奖品只适用于选择25元现金红包
若选择其他奖品请自行修改109，110行的参数
参数subBizId在https://encourage.kuaishou.com/rest/ug-regular/hugeSignIn/home可查找到
参数taskId在https://encourage.kuaishou.com/rest/wd/zt/task/list/all可找到
⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
*/

const $ = new Env("快手极速版签到打卡");
let ckName = `kuaishou_speed`;

const strSplitor = "#";
const envSplitor = ["&", "\n"];
const notify = $.isNode() ? require("./sendNotify") : "";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"

class Public {
    async request(options) {
        return await axios.request(options);
    }
}
class Task extends Public {
    constructor(env) {

        super();
        this.index = $.userIdx++
        let user = env.split("#");
        this.cookkie = user[0];

    }
    async getSig(l, data) {
        let url = 'http://yi100.top:5666/s3'
        try {
            let options = {
                url,
                headers: {
                    Cookie: this.cookkie
                },
                method: "POST",
                data: {
                    l, data
                }

            }
            let { data: res } = await this.request(options);
            if (res) {
                if (res.s3) {
                    return res.s3
                }
            } else {
                console.log(res)

                return false
            }
        } catch (e) {
            console.log(e)
        }
    }
    async signInMoney() {

        let sig = await this.getSig(68)
        $.log(`快手打卡`)
        let options = {
            method: 'GET',
            url: `https://nebula.kuaishou.com/rest/wd/encourage/unionTask/signIn/report?__NS_sig3=${sig}&sigCatVer=1`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/90.0.4430.226 KsWebView/1.8.90.770 (rel;r) Mobile Safari/537.36 Yoda/3.2.9-rc6 ksNebula/12.11.40.9331 OS_PRO_BIT/64 MAX_PHY_MEM/5724 KDT/PHONE AZPREFIX/az3 ICFO/0 StatusHT/29 TitleHT/44 NetType/WIFI ISLP/0 ISDM/0 ISLB/0 locale/zh-cn DPS/4.036 DPP/13 SHP/2068 SWP/1080 SD/2.75 CT/0 ISLM/0',
                'Accept-Encoding': 'gzip, deflate',
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'X-Requested-With': 'com.kuaishou.nebula',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://nebula.kuaishou.com/nebula/task/earning?layoutType=4&hyId=nebula_earning_ug_cdn&source=bottom_guide_second',
                'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cookie': '' + this.cookkie
            }
        };
        try {
            let { data: res } = await this.request(options);
            $.log(res);

        } catch (e) {
            console.log(e)
        }

    }
    async signIn() {
        $.log(`外部签到`)
        let data = {
            "reportCount": 1,
            "subBizId": 6426,
            "taskId": 26021
        };
        let sig = await this.getSig(56, data);
        let options = {
            method: 'POST',
            url: 'https://encourage.kuaishou.com/rest/wd/zt/task/report?__NS_sig3=' + sig,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/90.0.4430.226 KsWebView/1.8.90.770 (rel;r) Mobile Safari/537.36 Yoda/3.2.9-rc6 ksNebula/12.11.40.9331 OS_PRO_BIT/64 MAX_PHY_MEM/5724 KDT/PHONE AZPREFIX/az3 ICFO/0 StatusHT/29 TitleHT/44 NetType/WIFI ISLP/0 ISDM/0 ISLB/0 locale/zh-cn DPS/4.036 DPP/13 SHP/2068 SWP/1080 SD/2.75 CT/0 ISLM/1',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
                'ktrace-str': '3|My40NTgzNzM3MTc4NDU3Mzc4LjM5NTMzODY2LjE3Mzk4NTY2Mjk2MzkuMTAwNQ==|My40NTgzNzM3MTc4NDU3Mzc4LjY2MjczNDcxLjE3Mzk4NTY2Mjk2MzkuMTAwNA==|0|usergrowth-activity-huge-sign-in|webservice|true|src:Js,seqn:950,rsi:c0c8c381-56b7-40b5-a47a-acd7ec6242dc,path:/huge-sign-in/home,rpi:c198403627',
                'Origin': 'https://encourage.kuaishou.com',
                'X-Requested-With': 'com.kuaishou.nebula',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://encourage.kuaishou.com/huge-sign-in/home?layoutType=4&source=task&encourageTaskValidityTrack=eyJhY3Rpdml0eV9pZCI6MjAyNDMsInJlc291cmNlX2lkIjoiZWFyblBhZ2VfdGFza0xpc3RfMyIsImV4dF9wYXJhbXMiOnsiaXNTZXJ2ZXJSZWNvcmRDbGlja0FjdGlvbiI6dHJ1ZX19&encourageEventTracking=W3siZW5jb3VyYWdlX3Rhc2tfaWQiOjIwMjQzLCJlbmNvdXJhZ2VfcmVzb3VyY2VfaWQiOiJlYXJuUGFnZV90YXNrTGlzdF8zIiwiZXZlbnRUcmFja2luZ0xvZ0luZm8iOlt7ImRlbGl2ZXJPcmRlcklkIjoiNzEwIiwibWF0ZXJpYWxLZXkiOiJUQVNLX0xJU1RfMjAyNDNfSFVHRV9TSUdOX0lOIiwiZXZlbnRUcmFja2luZ1Rhc2tJZCI6MjAyNDMsInJlc291cmNlSWQiOiJlYXJuUGFnZV90YXNrTGlzdF8zIiwiZXh0UGFyYW1zIjp7ImlzU2VydmVyUmVjb3JkQ2xpY2tBY3Rpb24iOnRydWV9fV19XQ',
                'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cookie': '' + this.cookkie

            },
            data: data
        };

        try {
            let { data: res } = await this.request(options);
            $.log(res);

        } catch (e) {
            console.log(e)
        }
    }
    async run() {


        await this.signIn()
        await this.signInMoney()

    }
}


!(async () => {
    await getNotice()
    $.checkEnv(ckName);

    for (let user of $.userList) {
        //

        await new Task(user).run();

    }


})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

async function getNotice() {
    let options = {
        url: `https://gitee.com/smallfawn/Note/raw/main/Notice.json`,
        headers: {
            "User-Agent": defaultUserAgent,
        }
    }
    let { data: res } = await new Public().request(options);
    $.log(res)
    return res
}


// prettier-ignore
function Env(t, s) {
    return new (class {
        constructor(t, s) {
            this.userIdx = 1;
            this.userList = [];
            this.userCount = 0;
            this.name = t;
            this.notifyStr = [];
            this.logSeparator = "\n";
            this.startTime = new Date().getTime();
            Object.assign(this, s);
            this.log(`\ud83d\udd14${this.name},\u5f00\u59cb!`);
        }
        checkEnv(ckName) {
            let userCookie = (this.isNode() ? process.env[ckName] : "") || "";
            this.userList = userCookie.split(envSplitor.find((o) => userCookie.includes(o)) || "&").filter((n) => n);
            this.userCount = this.userList.length;
            this.log(`共找到${this.userCount}个账号`);
        }
        async sendMsg() {
            this.log("==============📣Center 通知📣==============")
            let message = this.notifyStr.join(this.logSeparator);
            if (this.isNode()) {

                await notify.sendNotify(this.name, message);
            } else {

            }
        }
        isNode() {
            return "undefined" != typeof module && !!module.exports;
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
            /(y+)/.test(t) &&
                (t = t.replace(
                    RegExp.$1,
                    (new Date().getFullYear() + "").substr(4 - RegExp.$1.length)
                ));
            for (let e in s) {
                new RegExp("(" + e + ")").test(t) &&
                    (t = t.replace(
                        RegExp.$1,
                        1 == RegExp.$1.length
                            ? s[e]
                            : ("00" + s[e]).substr(("" + s[e]).length)
                    ));
            }
            return t;
        }

        log(content) {
            this.notifyStr.push(content)
            console.log(content)
        }
        wait(t) {
            return new Promise((s) => setTimeout(s, t));
        }
        done(t = {}) {
            this.sendMsg();
            const s = new Date().getTime(),
                e = (s - this.startTime) / 1e3;
            this.log(
                `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`
            );
            if (this.isNode()) {
                process.exit(1);
            }
        }
    })(t, s);
}
