/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description: 奇瑞汽车
cron: 8 30 * * *
------------------------------------------
#Notice:   
APP 抓包的登录接口uaa2c.chery.cn 里面的返回的access_token就是环境变量需要的token，多个账号换行或者&
自助获取变量
https://logintools.smallfawn.top/chery.html
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

const { Env } = require("../tools/env")
const $ = new Env("奇瑞汽车");
let ckName = `chery`;
const strSplitor = "#";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"

const CryptoJS = require("crypto-js");
class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.token = this.user[0];
        this.ckStatus = false;
        this.articleIdList = []

    }
    encryptParams(e) {
        const t = CryptoJS.enc.Base64.parse("vVfnp9ozfDQyonMKuqgZUWjtdV+7PtBqtMCwJqz2HKQ=")
            , n = CryptoJS.lib.WordArray.random(16)
            , o = CryptoJS.AES.encrypt(e, t, {
                iv: n,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            })
            , i = CryptoJS.lib.WordArray.create();
        return i.concat(n),
            i.concat(o.ciphertext),
            CryptoJS.enc.Base64.stringify(i).replace(/\+/g, "-")
    }

    async run() {

        await this.info()
        if (this.ckStatus == true) {
            await this.signIn()
            await this.contentsList()
            for (let articleId of this.articleIdList) {
                await this.taskShare(articleId)
            }
        }


    }

    async signIn() {
        let options = {
            method: 'POST',
            url: `https://mobile-consumer-sapp.chery.cn/web/event/trigger?encryptParam=${encodeURIComponent(this.encryptParams(`access_token=${this.token}&terminal=3`))}`,
            headers: {
                "user-agent": "Dart/2.19 (dart:io)",
                "appversioncode": "26030901",
                "accept": "application/json, text/plain, */*",
                "appversion": "3.6.9",
                "accept-language": "zh-CN,zh;q=0.9",
                "accept-encoding": "gzip, deflate",
                "host": "mobile-consumer-sapp.chery.cn",
                "content-type": "application/json; charset=UTF-8",
                "agent": "android",
                "encryptflag": "true",
                "request-channel": "app"
            },
            data:
                Buffer.from(this.encryptParams(JSON.stringify({ "eventCode": "SJ10002" })), "utf-8"),
            transformRequest: [(d, headers) => d]
        };
        let { data: result } = await axios.request(options);
        if (result.status == 200) {
            $.log(`✅账号[${this.index}]  【签到】[${result.message}]🎉`);
        } else {
            $.log(`❌账号[${this.index}]  【签到】[${result.message}]`);
            //console.log(result);
        }




    }
    async info() {
        let options = {
            method: 'GET',
            url: `https://mobile-consumer-sapp.chery.cn/web/user/current/details?encryptParam=${encodeURIComponent(this.encryptParams(`access_token=${this.token}&terminal=3`))}`,
            headers: {
                "user-agent": "Dart/2.19 (dart:io)",
                "appversioncode": "26030901",
                "accept": "application/json, text/plain, */*",
                "appversion": "3.6.9",
                "accept-language": "zh-CN,zh;q=0.9",
                "accept-encoding": "gzip, deflate",
                "host": "mobile-consumer-sapp.chery.cn",
                "content-type": "application/json; charset=UTF-8",
                "agent": "android",
                "encryptflag": "true",
                "request-channel": "app"
            },
        }
        let { data: result } = await axios.request(options);
        if (result.status == 200) {
            $.log(`✅账号[${this.index}]  【昵称】[${result.data.displayName}]  【积分】[${result.data.pointAccount.payableBalance}]🎉`);
            this.userName = result.data.displayName
            this.userPoint = result.data.pointAccount.payableBalance
            this.ckStatus = true;
        } else {
            $.log(`❌账号[${this.index}]  [${result.message}]`);
            this.ckStatus = false;
            //console.log(result);
        }
    }

    async taskShare(articleId) {

        try {
            let options = {
                method: 'POST',
                url: `https://mobile-consumer-sapp.chery.cn/web/community/contents/${articleId}/share?encryptParams=${this.encryptParams(`access_token=${this.token}&terminal=3`)}`,
                headers: {
                    "user-agent": "Dart/2.19 (dart:io)",
                    "appversioncode": "26030901",
                    "accept": "application/json, text/plain, */*",
                    "appversion": "3.6.9",
                    "accept-language": "zh-CN,zh;q=0.9",
                    "accept-encoding": "gzip, deflate",
                    "host": "mobile-consumer-sapp.chery.cn",
                    "content-type": "application/json; charset=UTF-8",
                    "agent": "android",
                    "encryptflag": "true",
                    "request-channel": "app"
                },
                data: Buffer.from(this.encryptParams(JSON.stringify({ "contentId": articleId })), "utf-8")
                , transformRequest: [(d, headers) => d]
            }
            let { data: result } = await axios.request(options);
            if (result.status == 200) {
                $.log(`✅账号[${this.index}]  【分享】[${result.message}]🎉`);
            } else {
                $.log(`❌账号[${this.index}]  【分享】[${result.message}]`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async contentsList() {

        try {
            let options = {
                method: 'GET',
                url: `https://mobile-consumer-sapp.chery.cn/web/community/recommend/contents?encryptParam=${encodeURIComponent(this.encryptParams(`pageNo=1&pageSize=10&access_token=${this.token}&terminal=3`))}`,
                headers: {
                    "user-agent": "Dart/2.19 (dart:io)",
                    "appversioncode": "26030901",
                    "accept": "application/json, text/plain, */*",
                    "appversion": "3.6.9",
                    "accept-language": "zh-CN,zh;q=0.9",
                    "accept-encoding": "gzip, deflate",
                    "host": "mobile-consumer-sapp.chery.cn",
                    "content-type": "application/json; charset=UTF-8",
                    "agent": "android",
                    "encryptflag": "true",
                    "request-channel": "app"
                },

            }

            let { data: result } = await axios.request(options);
            if (result.status == 200) {
                $.log(`✅账号[${this.index}]  【获取文章】[${result.message}]🎉`);
                this.articleIdList = [result.data.data[0].content.id, result.data.data[1].content.id]
            } else {
                $.log(`❌账号[${this.index}]  【获取文章】[${result.message}]`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }





}

!(async () => {
    await getNotice()
    $.checkEnv(ckName);

    for (let user of $.userList) {
        await new Task(user).run();
    }
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

async function getNotice() {
    let options = {
        url: `https://ghproxy.net/https://raw.githubusercontent.com/smallfawn/Note/refs/heads/main/Notice.json`,
        headers: {
            "User-Agent": defaultUserAgent,
        }
    }
    let { data: res } = await axios.request(options);
    $.log(res)
    return res
}