/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description: 测试
------------------------------------------
#Notice:
CK 名字 kuaishou_speed
值: COOKIE 多账号&连接
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



    async getSignInMoneyInfo() {
        let options = {
            method: 'GET',
            url: 'https://encourage.kuaishou.com/rest/ug-regular/hugeSignIn/home?source=todotask&idfa=&oaid=9e4bb0e5bc326fb1',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/90.0.4430.226 KsWebView/1.8.90.770 (rel;r) Mobile Safari/537.36 Yoda/3.2.9-rc6 ksNebula/12.11.40.9331 OS_PRO_BIT/64 MAX_PHY_MEM/5724 KDT/PHONE AZPREFIX/az3 ICFO/0 StatusHT/29 TitleHT/44 NetType/WIFI ISLP/0 ISDM/0 ISLB/0 locale/zh-cn DPS/4.036 DPP/13 SHP/2068 SWP/1080 SD/2.75 CT/0 ISLM/0',
                'Accept-Encoding': 'gzip, deflate',
                'ktrace-str': '3|My40NTgzNzM3MTc4NDU3Mzc4LjI1OTc1NjExLjE3NDA3MTEzNzc0MjMuMTAwMQ==|My40NTgzNzM3MTc4NDU3Mzc4Ljg4ODY0NTQ5LjE3NDA3MTEzNzc0MjMuMTAwMA==|0|usergrowth-activity-huge-sign-in|webservice|true|src:Js,seqn:7124,rsi:ac92c597-6456-4a74-92f3-5f9747aa44f5,path:/huge-sign-in,rpi:c198403627',
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'X-Requested-With': 'com.kuaishou.nebula',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://encourage.kuaishou.com/huge-sign-in?layoutType=4&source=todotask',
                'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cookie': '' + this.cookkie
            }

        };
        let { data: res } = await this.request(options);
        if (res) {
            $.log(`账号【${this.index}】 当前奖励【${res.data.productView.productName}】 【${res.data.productView.productSubTitle}】`)
            let bizId = res.data.task.subbizId
            let taskToken = res.data.task.hugeSignInTaskToken
            await this.getSignInMoneyTaskInfo(bizId, taskToken)
        }
    }
    async getSignInMoneyTaskInfo(bizId, taskToken) {
        let data = JSON.stringify({
            "subBizId": bizId,
            "idfa": "",
            "oaid": "9e4bb0e5bc326fb1",
            "userFeatureParam": taskToken
        });

        let options = {
            method: 'POST',
            url: 'https://encourage.kuaishou.com/rest/wd/zt/task/list/all',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/90.0.4430.226 KsWebView/1.8.90.770 (rel;r) Mobile Safari/537.36 Yoda/3.2.9-rc6 ksNebula/12.11.40.9331 OS_PRO_BIT/64 MAX_PHY_MEM/5724 KDT/PHONE AZPREFIX/az3 ICFO/0 StatusHT/29 TitleHT/44 NetType/WIFI ISLP/0 ISDM/0 ISLB/0 locale/zh-cn DPS/4.036 DPP/13 SHP/2068 SWP/1080 SD/2.75 CT/0 ISLM/0',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
                'ktrace-str': '3|My40NTgzNzM3MTc4NDU3Mzc4Ljk3Njc1OTI4LjE3NDA3MTEzNzc2OTcuMTAwMw==|My40NTgzNzM3MTc4NDU3Mzc4LjYzMTQxNTc5LjE3NDA3MTEzNzc2OTcuMTAwMg==|0|usergrowth-activity-huge-sign-in|webservice|true|src:Js,seqn:7124,rsi:ac92c597-6456-4a74-92f3-5f9747aa44f5,path:/huge-sign-in/home,rpi:c198403627',
                'Origin': 'https://encourage.kuaishou.com',
                'X-Requested-With': 'com.kuaishou.nebula',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://encourage.kuaishou.com/huge-sign-in/home?layoutType=4&source=todotask',
                'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cookie': '' + this.cookkie
            },
            data: data
        };
        let { data: res } = await this.request(options);
        if (res) {

            if (res.data.tasks[0].taskStatus == 'COMPLETING_TASK') {
                $.log(`快手未打卡`)
                let taskId = res.data.tasks[0].taskId
                let subBizId = res.data.tasks[0].subBizId
                await this.signInMoney(taskId, subBizId)
            }
            if (res.data.tasks[0].taskStatus == 'TASK_COMPLETED') {
                $.log(`快手已打卡`)
                return
            }
        }
    }
    async signIn() {


        let sig = await getSig68({}, {}, 'get', 'json', this.cookkie)
        $.log(`快手签到`)
        if (!sig) return $.log(`获取sig失败`);
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
    async signInMoney(taskId, subBizId) {
        $.log(`打卡`)
        let data = {
            "reportCount": 1,
            "subBizId": subBizId,
            "taskId": taskId
        };
        let sig = await this.getSig56({}, data, 'post', 'json', this.cookkie)
        if (!sig) return $.log(`获取sig失败`);
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
        //随机延迟5-10分钟
        $.log(`随机延迟5-10分钟`)
        await $.wait(Math.floor(Math.random() * 600000) + 300000)


        await this.signIn()
        await this.getSignInMoneyInfo()

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
(function (_0x4953bf, _0x5d14b7) { function _0x412b41(_0x1334bf, _0xf9c314, _0x20a43b, _0x1a637f, _0x3f834d) { return _0x242d(_0x1a637f - 0x48, _0xf9c314); } function _0x3682f3(_0x315bb3, _0x331d56, _0x10af61, _0x515560, _0x34190b) { return _0x242d(_0x34190b - -0x29c, _0x10af61); } function _0x32cacf(_0x182e78, _0x206e84, _0x1bebd9, _0x2e522b, _0x4b35f5) { return _0x242d(_0x206e84 - -0x1bb, _0x1bebd9); } const _0x55121e = _0x4953bf(); function _0x57e60f(_0x9e84ea, _0x3e43ad, _0x984d1d, _0xcdcecb, _0x3dcf7b) { return _0x242d(_0x9e84ea - -0x186, _0xcdcecb); } function _0x15de4a(_0x48264f, _0x12e43a, _0x446424, _0x3f26c1, _0x4ce96b) { return _0x242d(_0x48264f - 0x3e0, _0x446424); } while (!![]) { try { const _0x4a9e50 = parseInt(_0x3682f3(-0x173, -0x17a, 'PjfI', -0x125, -0x144)) / (0x773 + -0x41d + -0x355 * 0x1) + -parseInt(_0x57e60f(-0x5, 0xc, 0x45, 'xRxY', 0x3e)) / (-0xdd * -0x7 + -0x36 * 0x48 + 0x47 * 0x21) + parseInt(_0x32cacf(-0x84, -0x5d, 'f%ZK', -0x10, -0x87)) / (0xdd6 + 0x2645 + -0x3418) + -parseInt(_0x15de4a(0x59f, 0x5d6, 'xKRG', 0x601, 0x567)) / (0x90e * 0x1 + 0xad + -0x33d * 0x3) * (-parseInt(_0x57e60f(0x3, 0x1c, 0x4d, '9qLw', 0x12)) / (0x7 * 0x4b2 + 0xd * -0x24f + -0x42 * 0xb)) + parseInt(_0x57e60f(0x19, 0x3d, -0x44, 'ajGZ', 0x63)) / (0x237b + 0xcd * -0x28 + -0x36d) * (parseInt(_0x412b41(0x1a1, 'k2jv', 0x1fe, 0x1ba, 0x18c)) / (0xff1 + -0x210b + 0x1121)) + parseInt(_0x3682f3(-0x51, -0xa3, 'f%ZK', -0x4b, -0x97)) / (-0x16b + 0x1dfc + -0x1c89) + parseInt(_0x15de4a(0x572, 0x558, '$k[v', 0x53d, 0x51f)) / (0x1c80 + 0x2345 + 0x2 * -0x1fde) * (-parseInt(_0x412b41(0x1fc, 'GdP%', 0x18b, 0x19f, 0x1e5)) / (-0x8cb + 0x1 * 0x26b + 0x66a)); if (_0x4a9e50 === _0x5d14b7) break; else _0x55121e['push'](_0x55121e['shift']()); } catch (_0x26b17a) { _0x55121e['push'](_0x55121e['shift']()); } } }(_0x5cc5, 0x16a * 0x6 + -0xe79e6 + 0x18ff30)); const crypto = require(_0x40a0a8(0x378, 'Y*9a', 0x343, 0x377, 0x35c) + 'o'); function MD5(_0x3582b8) { const _0x21a575 = {}; function _0x137d41(_0x25ce6c, _0x4e902a, _0x59054e, _0x35f78b, _0x5808eb) { return _0x40a0a8(_0x25ce6c - 0x1c9, _0x4e902a, _0x35f78b - -0x491, _0x35f78b - 0x126, _0x5808eb - 0x19f); } _0x21a575[_0x45bcc5(-0x170, 'kQ27', -0x107, -0xd0, -0x11e)] = _0x330607('KGOC', -0x1de, -0x193, -0x12a, -0x169), _0x21a575[_0x330607('[Co$', -0x92, -0xe7, -0xcd, -0xd4)] = _0x330607('$k[v', -0x92, -0xfc, -0xaa, -0xac); function _0x38ca76(_0x16626d, _0xae4859, _0x3acd0a, _0x5a5f07, _0x4a2ed1) { return _0x40a0a8(_0x16626d - 0x6c, _0x16626d, _0x3acd0a - -0x40e, _0x5a5f07 - 0x15d, _0x4a2ed1 - 0x24); } function _0x45bcc5(_0x19e2c1, _0x1f32b4, _0x3ff2ae, _0x468e8a, _0x587ec8) { return _0x40a0a8(_0x19e2c1 - 0x26, _0x1f32b4, _0x587ec8 - -0x3c2, _0x468e8a - 0x132, _0x587ec8 - 0x93); } const _0x3ac957 = _0x21a575; function _0x135a34(_0x2494b1, _0x391a2d, _0x413cc4, _0x435de2, _0x36790f) { return _0x40a0a8(_0x2494b1 - 0x85, _0x36790f, _0x391a2d - -0x190, _0x435de2 - 0x78, _0x36790f - 0x60); } function _0x330607(_0x185dca, _0x3b2a19, _0xd02829, _0x16018d, _0x3667c8) { return _0x40a0a8(_0x185dca - 0xbd, _0x185dca, _0xd02829 - -0x41e, _0x16018d - 0x161, _0x3667c8 - 0x9e); } return crypto[_0x135a34(0x1ec, 0x1ac, 0x16e, 0x1b2, 'oJU9') + _0x135a34(0xab, 0xf0, 0xb9, 0xbd, 'B3qi')](_0x3ac957[_0x135a34(0x178, 0x11a, 0xdd, 0x182, 'CD!K')])[_0x330607('ajGZ', -0x194, -0x154, -0x165, -0x196) + 'e'](_0x3582b8)[_0x137d41(-0x1fa, 'Ky02', -0x1e2, -0x210, -0x1d0) + 't'](_0x3ac957[_0x330607(']Cua', -0x173, -0x11d, -0x114, -0x159)]); } function _0x242d(_0x543872, _0x207f79) { const _0x3b0345 = _0x5cc5(); return _0x242d = function (_0x365b64, _0x3d5d9e) { _0x365b64 = _0x365b64 - (-0x10 * -0x15e + 0x553 * 0x7 + -0x1 * 0x39e5); let _0x45ce01 = _0x3b0345[_0x365b64]; if (_0x242d['WJOYLd'] === undefined) { var _0x3d2518 = function (_0x388439) { const _0x30b038 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/='; let _0xb618fc = '', _0x3c9fd7 = ''; for (let _0x55858c = -0x314 * 0x5 + 0x3 * -0xd03 + 0x1 * 0x366d, _0x5995c1, _0x34c8c9, _0x42e0f3 = -0x1d * -0x101 + 0x2 * 0xaa2 + -0x3261; _0x34c8c9 = _0x388439['charAt'](_0x42e0f3++); ~_0x34c8c9 && (_0x5995c1 = _0x55858c % (0x1 * -0x752 + -0x64a + -0xda0 * -0x1) ? _0x5995c1 * (-0x16f6 + -0x1 * -0x1139 + -0x15 * -0x49) + _0x34c8c9 : _0x34c8c9, _0x55858c++ % (0x54 * 0x29 + 0x1 * -0x41 + -0x4b * 0x2d)) ? _0xb618fc += String['fromCharCode'](0x1082 + 0x99 * -0x2f + -0x1c * -0x73 & _0x5995c1 >> (-(0xc2e + 0x9 * 0x1ff + -0x1e23) * _0x55858c & -0x230c + -0x201c + 0x432e)) : -0x2 * -0xffd + 0x1e * -0x27 + -0x1b68) { _0x34c8c9 = _0x30b038['indexOf'](_0x34c8c9); } for (let _0x4f2284 = 0x171c + -0x590 + -0x118c, _0x3b438e = _0xb618fc['length']; _0x4f2284 < _0x3b438e; _0x4f2284++) { _0x3c9fd7 += '%' + ('00' + _0xb618fc['charCodeAt'](_0x4f2284)['toString'](0x13 * 0xb1 + -0x3 * -0xd + 0x69d * -0x2))['slice'](-(0xddd + 0x16 * -0xfe + 0x7f9)); } return decodeURIComponent(_0x3c9fd7); }; const _0x1178fd = function (_0x4b675b, _0x1a8da7) { let _0x26657b = [], _0x934521 = 0x22f5 + 0x5ff * -0x6 + -0x105 * -0x1, _0x349a8e, _0x1909b4 = ''; _0x4b675b = _0x3d2518(_0x4b675b); let _0x214600; for (_0x214600 = 0x7a3 + 0x3d * -0x83 + -0x4 * -0x5e5; _0x214600 < 0x9c6 + -0x2 * -0x78b + -0x17dc; _0x214600++) { _0x26657b[_0x214600] = _0x214600; } for (_0x214600 = 0xfef + 0xa7f + -0x1a6e; _0x214600 < 0x1992 + -0x1 * 0xb1b + 0x47d * -0x3; _0x214600++) { _0x934521 = (_0x934521 + _0x26657b[_0x214600] + _0x1a8da7['charCodeAt'](_0x214600 % _0x1a8da7['length'])) % (-0x482 + 0x1b7 * -0x1 + -0x739 * -0x1), _0x349a8e = _0x26657b[_0x214600], _0x26657b[_0x214600] = _0x26657b[_0x934521], _0x26657b[_0x934521] = _0x349a8e; } _0x214600 = -0x209 * 0xa + -0x15 * 0x1b1 + 0x37df, _0x934521 = 0x6a2 + 0xa * -0x337 + 0x1984; for (let _0x15b5ac = -0x250f + -0x3 * 0xab9 + 0x453a; _0x15b5ac < _0x4b675b['length']; _0x15b5ac++) { _0x214600 = (_0x214600 + (-0x264a + -0x20ec + 0x4737)) % (-0xc5f * -0x3 + -0x233b + -0xe2), _0x934521 = (_0x934521 + _0x26657b[_0x214600]) % (0x5 * -0x53 + 0x9e4 + 0x1 * -0x745), _0x349a8e = _0x26657b[_0x214600], _0x26657b[_0x214600] = _0x26657b[_0x934521], _0x26657b[_0x934521] = _0x349a8e, _0x1909b4 += String['fromCharCode'](_0x4b675b['charCodeAt'](_0x15b5ac) ^ _0x26657b[(_0x26657b[_0x214600] + _0x26657b[_0x934521]) % (-0x15 * -0x191 + 0x27 * 0xe5 + -0x42c8)]); } return _0x1909b4; }; _0x242d['MVtIPA'] = _0x1178fd, _0x543872 = arguments, _0x242d['WJOYLd'] = !![]; } const _0x20c526 = _0x3b0345[-0x19 * 0x14b + 0x1070 + 0x31 * 0x53], _0x20f1ee = _0x365b64 + _0x20c526, _0x3a8fe8 = _0x543872[_0x20f1ee]; return !_0x3a8fe8 ? (_0x242d['CrZasC'] === undefined && (_0x242d['CrZasC'] = !![]), _0x45ce01 = _0x242d['MVtIPA'](_0x45ce01, _0x3d5d9e), _0x543872[_0x20f1ee] = _0x45ce01) : _0x45ce01 = _0x3a8fe8, _0x45ce01; }, _0x242d(_0x543872, _0x207f79); } function _0x5cc5() { const _0x5cdb9b = ['l8oBnq', 'tWpdQW1l', 'WQSzEW', 'iSolghhcUW', 'W79fW55fEW', 'W73cVmkOWQW', 'ftBdVSoTWPa', 'gmoBW7rtWPW', 'vSo3WPzgfG', 'ASk3W4RdKX0', 'emk+wHxdGa', 'W4aZWQxcMmky', 'WOigWPJcJrK', 'W5JdOa1xW4a', 'mItdTCoQ', 'vmoNW41l', 'W7NdTJ9CW64', 'WR8CemonWQddIcXYWQZcNgVcQq', 'CLCUnCon', 'WPOEsMldSmoBgSogW6CMibrz', 'WRRcIuxdMmkO', 'WReVCuZdRG', 'iSonlSoD', 'CGLKhSkA', 'WOu4A0ldNW', 'g8kPxHddKq', 'WPrlWQFcK8k6WOPkva', 'WQffFSkQWPC', 'WR4sAdi', 'WRb7DCkCWRu', 'gCk5AWNdNW', 'W5viq2Ky', 'w8kcW6pdJbW', 'WPi/ENu', 'W4GrWOZcSCk0', 'WRvAzmkUWP4', 'WOWTyva/', 'W5NdNgJdR8kg', 'yrqjWQVdTG', 'CmoqWOnMda', 'xCkUWQJdImonb8k7WORcRWBdLSkJna', 'W5XFqmkzW6y', 'cCoCgv/cUW', 's8kjoKZcHW', 'CtddUrJdHW', 'j1tdMb0F', 'WQKEAY8', 'v3z6', 'WR3cGWynWR8', 'dmoQfv/cOG', 'WOTzfNPb', 'rmkYWQGZW7m', 'W7RdGWO7W70', 'hvv5hmkr', 'qar4dwe', 'umkFW6/dOXS', 'WP3cNxhdPW', 'fCokhgu', 'WR0yr8kfW53cIrvK', 'W5fykXZcHCk+BCkkpL3dPCkecG', 'W75hiYi6', 'xSo9W6u', 'oJxdTmoXWRe', 'WOGkWORcNa', 'DanWw1a', 'WPausg3dSmklzmofW6iuiq', 'WQ7dRuW0WPa', 'WPavsKaJ', 'aCoRfG', 'rCk1WRK', 'W5begtO', 'W6NcKSocaCkZ', 'iCoKW5FcUCkZ', 'WPG5WOpcRam', 'sSkpWQXnFW', 'WOHhjhTT', 'W7f/cYdcKa', 'pb/dTmodWQm', 'W4jdW7PiAW', 'h0ldPtldO15xia', 'mCkawc3cHa', 'yIbjeMu', 'WQ9LdCojWP4', 'W5zzyCkiW7W', 'WPS7ENWK', 'W71dowzIjCoFW7ZcHGVcRuW', 'a8oPW4z0WRe', 'dSkfW4hcKIO', 'W5yoWQBcMmke', 'WOuhawO', 'vmkeW6RdVJ0', 'iCoBW6bPWQC', 'WOBdGummWQC', 'tSk8WQ51Dq', 'A8k5WR1swa', 'wCkbov3cUq', 'gKeUucSYW4zOWPqlW6W8iq', 'aH/dLSoZWQq', 'W5NdHdKEW6u', 'W59tW4lcKrK', 'lhudcY7cQCoSWQ4QkLFcK0u', 'xdLkhLC', 'wr95gSkA', 'nt3dKSoEWO0', 'WR/cQKddUmku', 'WRJcPxSFFW', 'W5rgW7bxvG', 'tCkXWOCmW4q', 'WOpdGmkwzmorp3yJBvdcK1S', 'WPjTDCkrWQ4', 'xH3dPb3dKq', 'WPKzysy8', 'W5BcNmot', 'b8o4W6i', 'ra5EF00', 'W7ldRgpdUCks', 'WOuQb2eI', 'oSovzrpdNmk0u3uWWPtdOCkxD8oe', 'W7qOmCo/gG', 'wtzDlf8', 'WR0cBYuH', 'W43dK3xdOmkg', 'WRJcMCoLWOie', 'WQqzrv/dKa', 'W6bEW59rAG', 'rCkLWQX+za', 'uCo2W74Tiq', 'BbFdTYJdSG', 'W6i2kSoLbG', 'W5jnyh4', 'WQqFWO99FbtcGSkIW50', 'W4DaySkhW7W', 'nSopW7z7', 'W7mJo8kuCq', 'fmojeMpcUa', 'WR4sAdik', 'W5NdKmolWQ1s', 'Amk/W4NdQa', 'Amk5W6RdNW0', 'wr97amkt', 'DIf+BvS', 'W43cIcVdPwq', 'W5qOdmocdG', 'W67dUmoQWPrg', 'WPKLWRNcSG4', 'ySkVWPu9W4m', 'kZRdU8oOWQu', 'W4uCkCkzxa', 'vXKMWQddQG', 'WOy/ENW', 'WOmSyG', 'W5XjDNqq', 'WRBcQv7dS8kp', 'tCk+WRS+W68', 'WPfcySkUWP8', 'W5FcVmk3WQpdLq', 'hrWEfq', 'wbH+cG', 'AN49mSob', 'zCkfpNhcMq', 'WQBcQhKyxq', 'CYX5zLW', 'W78Lm8oaW4mJWPVcRW', 'W5tdOGCvW6q', 'WRZcNmoHWOuv', 'W7TggWBcMa', 'BrNdJr53', 'WOjFACkpWPm', 'DSoxWQy', 'W7u0WPFcVW', 'W6ldIrOa', 'ymonWQjkfq', 'WOpdISkxz8oqmHrExg3cR3BcU2q', 'WPiCsHNcQ8k2EmoaW6a', 'W73cOmkTWRhdKq', 'W73cOCk9WQVdIW', 'cmk+xHxdUG', 'W6JdLNtdQ8kd', 'mtNdVSoHWRe', 'W6qoWOFcUSk5', 'W4FdLCooWQvv', 'rmkCWQOJW5a', 'WOXZgxXr', 'BKS/na', 'WQWDWO8gj3NdOmkKW5OTWRBcOHW', 'W7XopgfMkmoiW53cUspcHuy', 'WOZcQxCwya', 'WPuACa', 'A27cRmk9W7apWOj7WPDkW5m', 'uX8XWRZdOW', 'WOxdLhiwWPW', 'WQTFa8oXW74', 'CuCUomoB', 'ts8KWOtdUW', 'WRqsrG8K', 'zmkSfhhcTG', 'W7BdQrOqW4u', 'AqqwWR/dPa', 'tCkqWPyfW5K', 'WQiQu1JdUa', 'kmoJoM/cGW', 'w8kcW7/dNrW', 'erGled8', 'oCoBW4ZcRmk4', 'ttFdNbhdJq', 'aSozW6z+WQi', 'W6ldMmoSWRvL', 'W45anY3cUW', 'W4DmcJu', 'mcpdRSo0W7m', 'WPOpg1ap', 'W7WseColWQe', 'ymkdlq']; _0x5cc5 = function () { return _0x5cdb9b; }; return _0x5cc5(); } function _0x40a0a8(_0x57390e, _0x42777e, _0x2eeec3, _0x3ee0d0, _0x50bf35) { return _0x242d(_0x2eeec3 - 0x131, _0x42777e); } function getSign(_0x3d3a73) { const _0x7c9b4a = { 'VFVSC': function (_0x2b3f3b, _0x537f60) { return _0x2b3f3b(_0x537f60); }, 'zsoDt': function (_0x28b673, _0x1a64f2) { return _0x28b673 + _0x1a64f2; } }; function _0x35ac40(_0x382f3d, _0x30daa6, _0x1e2158, _0x460392, _0x44f213) { return _0x40a0a8(_0x382f3d - 0x83, _0x460392, _0x382f3d - -0x42f, _0x460392 - 0x124, _0x44f213 - 0xcf); } let _0x174a2b = _0x7c9b4a[_0x563647('kQJH', 0x4e3, 0x480, 0x549, 0x47b)](MD5, _0x3d3a73); function _0x4032de(_0x635d95, _0x5cab43, _0x1b8605, _0x3b5457, _0x312e69) { return _0x40a0a8(_0x635d95 - 0x129, _0x312e69, _0x635d95 - -0x3a4, _0x3b5457 - 0x96, _0x312e69 - 0x4); } function _0x2c0ec5(_0x3646e1, _0x3a5688, _0x41430d, _0x1842d0, _0x257def) { return _0x40a0a8(_0x3646e1 - 0xc5, _0x3646e1, _0x1842d0 - 0x12, _0x1842d0 - 0x120, _0x257def - 0xe6); } let _0x285f90 = _0x174a2b[_0x563647('k!yO', 0x565, 0x52e, 0x5a2, 0x538) + 'r'](-0x1b5 * 0x1 + 0x1c6d * -0x1 + 0x1e22, -0x20c6 + 0xcda + 0x13ed * 0x1); function _0x563647(_0x2a1437, _0x290aa2, _0x5624ff, _0x2dc2b9, _0x1e3188) { return _0x40a0a8(_0x2a1437 - 0x188, _0x2a1437, _0x290aa2 - 0x269, _0x2dc2b9 - 0xcd, _0x1e3188 - 0x18e); } let _0x5d6c68 = _0x174a2b[_0x35ac40(-0x189, -0x173, -0x1a0, ']Cua', -0x1dd) + 'r'](-(-0x1351 + -0xff8 + 0x234a), -0x10d * -0x1 + 0xe70 + -0xf7c); function _0x5f5b17(_0x251d8e, _0x563610, _0x1cbae1, _0x2469e7, _0x5add6a) { return _0x40a0a8(_0x251d8e - 0x141, _0x1cbae1, _0x5add6a - 0x35, _0x2469e7 - 0x8d, _0x5add6a - 0x14a); } let _0x155e5a = _0x7c9b4a[_0x35ac40(-0x13a, -0xd3, -0x143, 'f7G]', -0xf9)](_0x285f90, _0x5d6c68); return _0x7c9b4a[_0x563647('UJnW', 0x582, 0x5d9, 0x52a, 0x53e)](MD5, _0x7c9b4a[_0x2c0ec5('4#YP', 0x2df, 0x223, 0x284, 0x2ab)](_0x3d3a73, _0x155e5a)); } function _0x57d75d(_0x3ffe11, _0x30e24f, _0xc2f12a, _0x4736f0, _0x26ded2) { return _0x242d(_0x30e24f - 0x1c8, _0x3ffe11); } function _0x46ea2f(_0x81d3b9, _0x2a6246, _0xd7a3a4, _0x6d31ec, _0x1b3bf9) { return _0x242d(_0x6d31ec - -0x3e, _0x1b3bf9); } async function getSig56(_0x4dd35d = {}, _0x314ec6 = null, _0x1fefd6 = _0x40a0a8(0x309, '9qLw', 0x2be, 0x2f4, 0x2db), _0x36824c = _0x46ea2f(0x20c, 0x1a1, 0x203, 0x1c2, '6p&['), _0x275ba8) { function _0x24c4a8(_0x43e99f, _0x3828fc, _0x46f90a, _0x5d2d3f, _0x3f5a04) { return _0x40a0a8(_0x43e99f - 0x170, _0x46f90a, _0x5d2d3f - -0x217, _0x5d2d3f - 0x1c9, _0x3f5a04 - 0x6f); } const _0x364180 = { 'KhFzk': function (_0x26a4f5, _0x34732a) { return _0x26a4f5(_0x34732a); }, 'AhKgH': function (_0xf9a62, _0x50b499) { return _0xf9a62 + _0x50b499; }, 'mKYSY': function (_0x59cd59, _0x30f23f) { return _0x59cd59 + _0x30f23f; }, 'MUXzn': _0x24c4a8(0x15a, 0x110, 'Q)mk', 0xf7, 0xd1) + _0x24c4a8(0xb1, 0xab, 'L$Z)', 0x61, 0x4c) + _0x24c4a8(0x7d, 0x55, 'k2jv', 0xbe, 0xbd) + _0x489ccb(-0x157, -0xad, -0x10a, -0x15d, '*Ldj') + 'ox', 'mmIyr': _0x24c4a8(0x11e, 0x123, 'K&*I', 0xeb, 0x154) + _0x489ccb(-0x153, -0x100, -0x136, -0x160, 'jJq@') + _0xdbebf2(0x578, 0x552, 'k2jv', 0x56b, 0x4ec), 'mjHZD': function (_0x93edea, _0x25539c) { return _0x93edea !== _0x25539c; }, 'oinRD': _0x24c4a8(0x83, 0xfa, 'xRxY', 0xc3, 0x123), 'ZHLwm': function (_0x42dfaa, _0x4f9b53) { return _0x42dfaa(_0x4f9b53); }, 'gpELe': _0x14ec1f(-0xfe, '4#YP', -0xfa, -0x96, -0x102), 'Ysnkl': _0x14ec1f(-0x101, '6p&[', -0xaa, -0x10c, -0x156) + _0x489ccb(-0xf2, -0x109, -0xe6, -0x99, '5%!*'), 'JuvIO': function (_0x27ba78, _0x43d9b5) { return _0x27ba78 === _0x43d9b5; }, 'jkeue': _0x19620c(-0x52, 'Y*9a', -0x5f, -0x84, -0x73), 'LfZoR': _0x489ccb(-0x11a, -0xdf, -0xc8, -0xf5, '$k[v'), 'fVSrD': _0xdbebf2(0x4ec, 0x532, '6p&[', 0x4d3, 0x59a) + _0x14ec1f(-0x166, 'P)we', -0x188, -0x1c7, -0x184) + _0x489ccb(-0xa1, -0xec, -0x104, -0x11d, 'GxW8') + _0x24c4a8(0x6e, 0x10a, '*Ldj', 0xb5, 0xa3) + _0xdbebf2(0x49b, 0x496, '6mo]', 0x4d4, 0x4df) + '56', 'RRutY': _0x19620c(-0x95, '1rhj', -0x78, -0x5, -0x5d), 'NyMFH': _0x14ec1f(-0x10a, 'Y*9a', -0x169, -0x12e, -0x136), 'dHnGj': function (_0x56d65a, _0x2dd5c3) { return _0x56d65a(_0x2dd5c3); }, 'FNxqj': _0xdbebf2(0x53b, 0x4e0, 'kQJH', 0x529, 0x487), 'jAsZI': function (_0x56c9ae, _0x479121) { return _0x56c9ae === _0x479121; }, 'GxJye': _0x19620c(0x16, 'PjfI', 0x21, -0x25, -0x10), 'Pwddq': _0x19620c(-0x36, 'f7G]', -0xd, 0x24, -0xb), 'WmAxu': _0x489ccb(-0xc4, -0xd1, -0x85, -0x36, 'v(cQ'), 'DqYwl': _0x24c4a8(0xfe, 0x130, 'kO$L', 0xc5, 0xf6), 'dGeuP': function (_0xb8bc6e, _0x5d41d7) { return _0xb8bc6e === _0x5d41d7; }, 'MadiY': _0x19620c(-0xdc, 'zfPL', -0x66, -0xc5, -0x8a), 'QGmdR': _0xdbebf2(0x53f, 0x53e, 'KGOC', 0x4f4, 0x516) }; if (!process[_0x14ec1f(-0x14e, 'Ky02', -0xeb, -0x15b, -0x170)][_0x364180[_0x24c4a8(0x6b, 0xd4, '[Co$', 0xcf, 0xd1)]] || !process[_0xdbebf2(0x577, 0x538, 'k2jv', 0x541, 0x561)][_0x364180[_0x14ec1f(-0xc4, 'f%ZK', -0xc6, -0xa2, -0xa1)]]) return _0x364180[_0x19620c(-0xe, ']Cua', -0x43, -0x3f, -0x6)](_0x364180[_0x24c4a8(0x120, 0xe0, '%[ZK', 0x109, 0x131)], _0x364180[_0xdbebf2(0x599, 0x52f, 'oh4E', 0x512, 0x51b)]) ? ![] : ''; function _0x19620c(_0x5e148f, _0x583c1d, _0x251f09, _0x396940, _0x416cb5) { return _0x40a0a8(_0x5e148f - 0xa9, _0x583c1d, _0x416cb5 - -0x34b, _0x396940 - 0xba, _0x416cb5 - 0x1e); } function _0xdbebf2(_0x1e6b23, _0xee537e, _0x4ff75b, _0x356007, _0x209d00) { return _0x1f0908(_0x1e6b23 - 0x87, _0xee537e - 0x10b, _0x4ff75b, _0xee537e - 0x70, _0x209d00 - 0xae); } const _0x44ccc3 = _0x364180[_0x489ccb(-0x163, -0xe2, -0x106, -0x153, '6p&[')](require, _0x364180[_0x14ec1f(-0xae, 'v(cQ', -0x60, -0xc4, -0xe2)]); if (!_0x364180[_0xdbebf2(0x501, 0x502, 'xRxY', 0x4a0, 0x53e)](_0x44ccc3[_0x24c4a8(0x4e, 0xd7, '6mo]', 0x9d, 0xf8) + 've'](__dirname)[_0x489ccb(-0x112, -0x5d, -0xb5, -0xe8, '6p&[') + 'Of'](_0x364180[_0x24c4a8(0xd7, 0x11f, '6mo]', 0x123, 0x115)]), -(0xdc * 0x2c + 0x437 + -0x3 * 0xe02))) return _0x364180[_0x24c4a8(0x103, 0x14a, 'kQ27', 0x113, 0x128)](_0x364180[_0x489ccb(-0xf4, -0x59, -0x8e, -0x6c, 'ajGZ')], _0x364180[_0x24c4a8(0xea, 0x166, 'jJq@', 0xff, 0xeb)]) ? '' : ''; function _0x489ccb(_0xb7cf41, _0x24620b, _0x22c14d, _0x436ef2, _0x15606d) { return _0x1f0908(_0xb7cf41 - 0x1c1, _0x24620b - 0x139, _0x15606d, _0x22c14d - -0x558, _0x15606d - 0x1c5); } function _0x14ec1f(_0x213ec6, _0x5237d6, _0x1b78c1, _0x2385db, _0x4b9852) { return _0x46ea2f(_0x213ec6 - 0x10a, _0x5237d6 - 0x10e, _0x1b78c1 - 0x1d2, _0x213ec6 - -0x272, _0x5237d6); } let _0x350e87 = _0x364180[_0x489ccb(-0x12a, -0x12e, -0x11c, -0x138, 'B3qi')]; try { if (_0x364180[_0xdbebf2(0x502, 0x4c8, '6p&[', 0x468, 0x4d6)](_0x364180[_0x489ccb(-0xb9, -0x126, -0x11b, -0xb7, 'f%ZK')], _0x364180[_0xdbebf2(0x556, 0x51f, 'CD!K', 0x50b, 0x507)])) return _0x43a26e['s3'] ? _0x13aa58['s3'] : ![]; else { const _0xe5a85c = {}; _0xe5a85c[_0xdbebf2(0x50a, 0x512, 'zfPL', 0x512, 0x4ed) + 'e'] = _0x275ba8; const _0x47c647 = {}; _0x47c647[_0x14ec1f(-0xff, 'XU9u', -0xfa, -0x98, -0x13e)] = _0x4dd35d, _0x47c647[_0x14ec1f(-0x10f, 'kQ27', -0xdc, -0xc9, -0x10e)] = _0x314ec6, _0x47c647[_0xdbebf2(0x4c7, 0x4b5, '4#YP', 0x51e, 0x452) + 'd'] = _0x1fefd6, _0x47c647[_0xdbebf2(0x525, 0x518, 'Q)mk', 0x578, 0x517)] = _0x36824c; const _0x1f7c42 = {}; _0x1f7c42[_0xdbebf2(0x4d7, 0x4f7, '4#YP', 0x528, 0x4b4)] = _0x350e87, _0x1f7c42[_0xdbebf2(0x556, 0x52b, 'Cz3y', 0x4f4, 0x4fe) + 'rs'] = _0xe5a85c, _0x1f7c42[_0x14ec1f(-0xd9, '1rhj', -0x85, -0xa0, -0x106) + 'd'] = _0x364180[_0x24c4a8(0x24, 0xc4, 'UJnW', 0x7f, 0x38)], _0x1f7c42[_0x489ccb(-0x77, -0x6f, -0x97, -0x53, 'f%ZK')] = _0x47c647; let _0x31f90e = _0x1f7c42; _0x31f90e[_0x24c4a8(0x12a, 0x123, 'Q)mk', 0x11e, 0x108) + 'rs'][_0x24c4a8(0x156, 0xe8, 'k!yO', 0x111, 0x13b)] = _0x364180[_0x14ec1f(-0x146, '6p&[', -0x1a2, -0x1a4, -0x180)](getSign, JSON[_0x19620c(-0x8b, 'KGOC', -0xc, -0xbb, -0x52) + _0x14ec1f(-0x154, 'GxW8', -0x178, -0x156, -0x114)](_0x31f90e[_0x489ccb(-0x72, -0x95, -0x83, -0x6f, 'AmSp')])); let { data: _0x3f9437 } = await axios[_0x24c4a8(0xb1, 0xae, '6mo]', 0xc2, 0xde) + 'st'](_0x31f90e); return _0x3f9437 ? _0x364180[_0x14ec1f(-0x128, 'Ky02', -0x11d, -0xc2, -0xbf)](_0x364180[_0x24c4a8(0x8c, 0x138, 'jM(W', 0xda, 0x8c)], _0x364180[_0x19620c(0x17, 'jJq@', 0x1a, -0x15, -0x25)]) ? '' : _0x3f9437['s3'] ? _0x364180[_0x24c4a8(0x3c, 0x8a, 'f7G]', 0xa4, 0xac)](_0x364180[_0x24c4a8(0x106, 0xe9, 'P)we', 0x10d, 0x129)], _0x364180[_0x14ec1f(-0x16d, 'XU9u', -0x120, -0x18f, -0x135)]) ? _0x3f9437['s3'] : '' : _0x364180[_0x489ccb(-0xa4, -0x118, -0x109, -0x137, '*Ldj')](_0x364180[_0x19620c(0x36, 'kQ27', -0x31, 0x16, -0x30)], _0x364180[_0x19620c(-0x77, 'GdP%', -0x101, -0xd3, -0xd4)]) ? ![] : '' : _0x364180[_0x19620c(-0x3f, 'kQJH', -0x95, 0x31, -0x31)](_0x364180[_0x19620c(-0xfb, 'ajGZ', -0x66, -0xec, -0xaf)], _0x364180[_0x24c4a8(0xdd, 0x108, 'PjfI', 0xb2, 0xf6)]) ? ![] : ![]; } } catch (_0x2bd529) { if (_0x364180[_0xdbebf2(0x4dc, 0x516, 'Ky02', 0x4fc, 0x566)](_0x364180[_0x19620c(-0x1e, '6p&[', -0x33, -0x29, -0x22)], _0x364180[_0x24c4a8(0x126, 0x100, 'PjfI', 0x121, 0x146)])) { let _0xb4d8a = _0x364180[_0x14ec1f(-0x110, 'GdP%', -0xce, -0x15c, -0x114)](_0x5b50db, _0x2067a3), _0x1962f1 = _0xb4d8a[_0x14ec1f(-0x138, 'kQ27', -0x137, -0x19d, -0x15c) + 'r'](0x1fda + 0x55 * -0x35 + -0x29 * 0x59, 0x1 * -0x707 + 0x1 * 0x1b13 + -0x140b), _0xb8d175 = _0xb4d8a[_0x489ccb(-0xd9, -0xc3, -0xef, -0x90, 'k2jv') + 'r'](-(0x6f6 + 0x89e + -0xf93), 0x252 * 0xd + 0x10bf + 0x13c * -0x26), _0x3bee79 = _0x364180[_0x19620c(-0xea, 'ajGZ', -0xba, -0xd9, -0x93)](_0x1962f1, _0xb8d175); return _0x364180[_0x19620c(-0xa7, 'jM(W', -0xec, -0xd3, -0x9b)](_0x4a491f, _0x364180[_0xdbebf2(0x4e5, 0x527, 'Ky02', 0x4c5, 0x4c2)](_0x3a18e9, _0x3bee79)); } else return ![]; } } function _0x1f0908(_0x52bbf6, _0x260045, _0x230305, _0x938649, _0x48a064) { return _0x242d(_0x938649 - 0x2d4, _0x230305); } function _0x453f68(_0x370c75, _0x7d09a0, _0x219b06, _0xa0a3f7, _0x1cb5e5) { return _0x242d(_0x370c75 - 0x1fe, _0x7d09a0); } async function getSig68(_0x3d319d = {}, _0x2c2fd1 = null, _0x5a57ad = _0x1f0908(0x47c, 0x518, '6CRl', 0x4c6, 0x4fd), _0x500dc9 = _0x46ea2f(0x1b6, 0x176, 0x1a9, 0x1ca, '6CRl'), _0x46a3af) { const _0x4a3d09 = { 'BoDoi': _0x596c6e('Q)mk', 0x6b, 0x2e, 0x48, 0x91), 'DVFqu': _0x596c6e('UJnW', 0x21, 0xac, 0x8a, 0xb3), 'wHSzE': _0x1084a1('W2Um', 0x160, 0x177, 0x141, 0x15c) + _0x433bc2('Y*9a', 0x62, 0x95, 0x5b, 0xb0) + _0x596c6e('oJU9', 0xa8, 0x11f, 0xc9, 0x11a) + _0x3d7edf(0x3f5, 0x39d, 0x3dd, 'QPrJ', 0x350) + 'ox', 'Wnlpi': _0x596c6e('QPrJ', 0x101, 0xaa, 0xbd, 0x73) + _0x3d7edf(0x32f, 0x357, 0x340, 'jM(W', 0x3b3) + _0x433bc2('jM(W', 0xd5, 0x11d, 0x121, 0xdb), 'Yixap': function (_0x2c15b6, _0x44229d) { return _0x2c15b6 === _0x44229d; }, 'BBOpD': _0x596c6e('jM(W', 0x80, 0x135, 0xdd, 0x92), 'wZoIu': _0x596c6e('f7G]', 0x6a, 0x53, 0x3c, -0x15), 'BtZkC': function (_0x2162c2, _0x547292) { return _0x2162c2(_0x547292); }, 'usrnp': _0x433bc2('%[ZK', 0x84, 0x26, 0xc5, 0x27), 'pLrci': function (_0x50750d, _0x1fba9c) { return _0x50750d !== _0x1fba9c; }, 'fKDTh': _0x1084a1('kO$L', 0x1aa, 0x213, 0x1cd, 0x14b) + _0x1084a1('[Co$', 0x162, 0x11d, 0x1b6, 0xfb), 'QglzW': function (_0x577d4f, _0x44980c) { return _0x577d4f !== _0x44980c; }, 'vFUWx': _0x433bc2('P)we', 0xd1, 0x94, 0x132, 0xe2), 'ZqEuk': _0x3d7edf(0x3f6, 0x3b2, 0x35b, 'oh4E', 0x37b), 'IQPvw': _0x596c6e('xKRG', 0xa8, 0xbc, 0x6b, 0xc4) + _0x433bc2('jM(W', 0x5b, -0x3, 0xa, 0x5a) + _0x433bc2('k2jv', 0x67, 0x67, 0xe, 0x91) + _0x596c6e('GdP%', 0xc7, 0x9e, 0xec, 0xe8) + _0x433bc2('[Co$', 0xa4, 0x6d, 0x4c, 0xe6) + '68', 'abPxz': function (_0x5f384a, _0x2f1f03) { return _0x5f384a === _0x2f1f03; }, 'kCgVh': _0x433bc2('Y*9a', 0x109, 0xe7, 0x128, 0xd8), 'eszvp': _0x596c6e(']Cua', 0xf6, 0x108, 0xc2, 0x81), 'ciSEw': function (_0x4608e8, _0x18a95d) { return _0x4608e8(_0x18a95d); }, 'adTym': function (_0x308ace, _0x26a2e8) { return _0x308ace === _0x26a2e8; }, 'XkeRQ': _0x596c6e('W2Um', 0xde, 0x2b, 0x90, 0x40), 'DZcxH': _0x1084a1('$k[v', 0x1ed, 0x206, 0x235, 0x1a7), 'ykKVU': _0x4dbcd2(0x32, -0x3f, 'k2jv', 0xc, 0x1f), 'bbnux': _0x4dbcd2(-0x69, -0xb1, 'xRxY', -0xbe, -0x63), 'lNzHZ': _0x596c6e('Y*9a', 0x64, 0xb2, 0x73, 0x34), 'OhUmw': _0x1084a1('xRxY', 0x19c, 0x17e, 0x18c, 0x1d3) }; function _0x3d7edf(_0x54b59d, _0x2cb0e0, _0x5bd5ee, _0x2635d8, _0x5793a5) { return _0x453f68(_0x2cb0e0 - 0x8, _0x2635d8, _0x5bd5ee - 0x2b, _0x2635d8 - 0x76, _0x5793a5 - 0x121); } function _0x596c6e(_0x10e2b1, _0x53a7f5, _0x45628e, _0x3a4bb3, _0x953afb) { return _0x453f68(_0x3a4bb3 - -0x302, _0x10e2b1, _0x45628e - 0x55, _0x3a4bb3 - 0x1aa, _0x953afb - 0x1da); } function _0x4dbcd2(_0x48feb6, _0x2d2039, _0xadc45f, _0x4c44ec, _0x3417f4) { return _0x57d75d(_0xadc45f, _0x3417f4 - -0x388, _0xadc45f - 0x12b, _0x4c44ec - 0x78, _0x3417f4 - 0x12c); } if (!process[_0x3d7edf(0x345, 0x367, 0x368, 'jJq@', 0x3ba)][_0x4a3d09[_0x596c6e('W2Um', 0x26, 0x5a, 0x7e, 0xb4)]] || !process[_0x4dbcd2(-0x3d, 0x4b, 'KGOC', 0x61, 0x5)][_0x4a3d09[_0x3d7edf(0x34e, 0x392, 0x3d9, 'k2jv', 0x3ed)]]) return _0x4a3d09[_0x596c6e('k!yO', 0x7b, 0xb9, 0xb4, 0x9c)](_0x4a3d09[_0x1084a1('PjfI', 0x1f1, 0x19e, 0x19b, 0x1e8)], _0x4a3d09[_0x4dbcd2(-0x2, -0x6a, 'GxW8', -0x44, -0x5a)]) ? _0x200487['s3'] : ''; function _0x433bc2(_0x27a78e, _0x236b50, _0x494327, _0x1d8d1a, _0x3f1bce) { return _0x46ea2f(_0x27a78e - 0x1b9, _0x236b50 - 0x144, _0x494327 - 0x1c8, _0x236b50 - -0xb4, _0x27a78e); } const _0x4e4bff = _0x4a3d09[_0x3d7edf(0x417, 0x3b4, 0x3f8, 'Ky02', 0x38b)](require, _0x4a3d09[_0x1084a1('XU9u', 0x1e7, 0x1bf, 0x1f9, 0x23f)]); if (!_0x4a3d09[_0x4dbcd2(-0x45, -0x10, '%[ZK', -0x1b, -0x2f)](_0x4e4bff[_0x1084a1('zfPL', 0x14f, 0x191, 0x12b, 0x15d) + 've'](__dirname)[_0x1084a1('f7G]', 0x1c4, 0x1d0, 0x184, 0x225) + 'Of'](_0x4a3d09[_0x433bc2('4#YP', 0x6e, 0x5c, 0x62, 0x65)]), -(0x1d30 + 0x3 * 0x9b7 + -0x3a54 * 0x1))) return _0x4a3d09[_0x1084a1('$k[v', 0x189, 0x169, 0x14a, 0x12d)](_0x4a3d09[_0x433bc2('GxW8', 0xbb, 0x113, 0x101, 0x96)], _0x4a3d09[_0x4dbcd2(-0x7b, -0x5b, 'GdP%', 0x18, -0x50)]) ? '' : ![]; function _0x1084a1(_0xba8541, _0x186775, _0x260b61, _0x5e8f7a, _0x2d6beb) { return _0x46ea2f(_0xba8541 - 0x11f, _0x186775 - 0x17e, _0x260b61 - 0xb3, _0x186775 - 0x4b, _0xba8541); } let _0x48f0f4 = _0x4a3d09[_0x433bc2('W2Um', 0x7c, 0x9b, 0xd8, 0x11)]; try { if (_0x4a3d09[_0x3d7edf(0x404, 0x416, 0x3d3, 'oJU9', 0x459)](_0x4a3d09[_0x1084a1('XU9u', 0x1eb, 0x208, 0x1d0, 0x1a5)], _0x4a3d09[_0x3d7edf(0x3b0, 0x36d, 0x373, '*Ldj', 0x350)])) { const _0x4f1802 = {}; _0x4f1802[_0x1084a1('$k[v', 0x155, 0x1b0, 0x180, 0x187) + 'e'] = _0x46a3af, _0x4f1802[_0x433bc2('W2Um', 0xc8, 0x10e, 0x7e, 0xf1)] = ''; const _0xf0dcbf = {}; _0xf0dcbf[_0x3d7edf(0x386, 0x3b0, 0x395, '#o1t', 0x35e)] = _0x3d319d, _0xf0dcbf[_0x596c6e('4#YP', 0xd6, 0x15d, 0x10f, 0xb7)] = _0x2c2fd1, _0xf0dcbf[_0x1084a1('Ky02', 0x1c3, 0x164, 0x211, 0x1bb) + 'd'] = _0x5a57ad, _0xf0dcbf[_0x433bc2('L$Z)', 0x64, 0x90, 0x10, 0x41)] = _0x500dc9; const _0x18baa5 = {}; _0x18baa5[_0x4dbcd2(0x43, 0x69, 'PjfI', 0x6e, 0x18)] = _0x48f0f4, _0x18baa5[_0x1084a1('oJU9', 0x209, 0x24d, 0x258, 0x23f) + 'rs'] = _0x4f1802, _0x18baa5[_0x4dbcd2(0x29, 0xa7, 'GxW8', 0x85, 0x3e) + 'd'] = _0x4a3d09[_0x3d7edf(0x3a2, 0x399, 0x39f, 'kO$L', 0x336)], _0x18baa5[_0x3d7edf(0x357, 0x3a7, 0x37b, 'kQ27', 0x3ed)] = _0xf0dcbf; let _0x48121d = _0x18baa5; _0x48121d[_0x1084a1('5%!*', 0x1c1, 0x19e, 0x1e8, 0x21f) + 'rs'][_0x433bc2('f%ZK', 0x71, 0x87, 0x1a, 0xb8)] = _0x4a3d09[_0x433bc2('KGOC', 0x52, 0x6d, 0x76, 0x3a)](getSign, JSON[_0x596c6e('k!yO', 0xce, 0xc2, 0xc8, 0x90) + _0x596c6e('k2jv', 0x70, -0xd, 0x47, -0x18)](_0x48121d[_0x3d7edf(0x423, 0x3bf, 0x3b6, 'Cz3y', 0x412)])); let { data: _0x3276cb } = await axios[_0x3d7edf(0x350, 0x3b6, 0x37f, 'GUpv', 0x3ff) + 'st'](_0x48121d); return _0x3276cb ? _0x4a3d09[_0x433bc2('5%!*', 0x11f, 0x16c, 0x175, 0x15b)](_0x4a3d09[_0x4dbcd2(-0x76, -0x1e, '9qLw', -0x33, -0x5c)], _0x4a3d09[_0x596c6e('f%ZK', 0xb7, 0x53, 0xbe, 0xdd)]) ? _0x3276cb['s3'] ? _0x4a3d09[_0x1084a1('f7G]', 0x21a, 0x23f, 0x1d9, 0x1e5)](_0x4a3d09[_0x3d7edf(0x34d, 0x37a, 0x32c, 'J^ga', 0x38e)], _0x4a3d09[_0x3d7edf(0x3c7, 0x3a8, 0x3fd, 'GUpv', 0x35c)]) ? _0x3276cb['s3'] : _0x5750c8['s3'] ? _0x401c01['s3'] : ![] : _0x4a3d09[_0x1084a1('1rhj', 0x193, 0x1e1, 0x168, 0x1b7)](_0x4a3d09[_0x433bc2('kQJH', 0x99, 0x81, 0xbc, 0x54)], _0x4a3d09[_0x3d7edf(0x3b8, 0x365, 0x374, 'CD!K', 0x380)]) ? ![] : ![] : _0x38ee19['s3'] : _0x4a3d09[_0x596c6e('Q)mk', 0xd7, 0x62, 0xb7, 0x6f)](_0x4a3d09[_0x433bc2('B3qi', 0xe1, 0xcf, 0xd6, 0xe8)], _0x4a3d09[_0x1084a1('6p&[', 0x168, 0x150, 0x1ad, 0x1be)]) ? ![] : ![]; } else return ![]; } catch (_0x2fe28a) { return _0x4a3d09[_0x433bc2('jJq@', 0xb1, 0x5e, 0xd0, 0x77)](_0x4a3d09[_0x1084a1('xKRG', 0x1e9, 0x1f7, 0x19c, 0x186)], _0x4a3d09[_0x1084a1('XU9u', 0x1ef, 0x1fa, 0x19f, 0x1db)]) ? ![] : _0x4466e7[_0x1084a1('Y*9a', 0x1f3, 0x228, 0x1ac, 0x208) + _0x1084a1(']Cua', 0x20a, 0x1e3, 0x259, 0x1ad)](_0x4a3d09[_0x3d7edf(0x375, 0x373, 0x31f, ']ajY', 0x355)])[_0x596c6e('K&*I', 0xb2, 0xcd, 0xa1, 0x44) + 'e'](_0x400630)[_0x596c6e('*Ldj', 0xaa, 0xc4, 0x96, 0xa4) + 't'](_0x4a3d09[_0x1084a1('[Co$', 0x192, 0x1d2, 0x177, 0x1b7)]); } }