/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description:  慕思小程序 签到
cron: 30 10 * * *
------------------------------------------
#Notice:   
抓取https://atom.musiyoujia.com抓包 请求头里的 api_token，请求包里的 openId #拼接
多账号&或换行
抓包后不要打开小程序避免刷新了token，有效期待测试，如出现 “Token有误” 则是 token过期了请重新抓取
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

const { Env } = require("./tools/env")
const $ = new Env("慕思小程序");
let ckName = `musi`;
const strSplitor = "#";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.activedAuthToken = this.user[0];
        this.openId = this.user[1];
        this.isSigned = false;
        this.valid = false;
        this.customId = ""

    }

    async run() {
        await this.getUserInfo()
        await this.getJob()
        if (!this.isSigned) {
            await this.doSign()
        }
    }
    MD5_Encrypt(str) {
        const crypto = require("crypto")
        return crypto.createHash('md5').update(str).digest('hex');
    }
    async getUserInfo() {
        try {
            const timestamp = new Date().getTime();
            let options = {
                method: 'POST',
                url: `https://atom.musiyoujia.com/member/wechatlogin/selectuserinfo`,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': defaultUserAgent,
                    "api_client_code": "65",
                    "api_version": "1.0.0",
                    'api_timestamp': timestamp,
                    'api_token': this.activedAuthToken,

                    'api_sign': this.MD5_Encrypt(`api_client_code=65&api_version=1.0.0&api_timestamp=${timestamp}`)?.toUpperCase()

                },
                data: { "appId": "wx03527497c5369a2c", "appType": "WECHAT_MINI_PROGRAM", "openId": `${this.openId}` }
            }
            let { data: result } = await axios.request(options)
            if (result?.msg === "success") {
                this.valid = true;
                this.customId = result?.data.resMemberInfo.memberId;
                $.log(`账号[${this.index}] 查询个人信息成功，积分：${result?.data?.memberInfo?.pointInfo?.point}`)
            } else {
                $.log(`账号[${this.index}] 查询个人信息失败：${result?.msg || JSON.stringify(result)}`)
                this.valid = false
            }

        } catch (e) {
            console.log(e)
        }
    }

    async getJob() {
        try {
            const timestamp = new Date().getTime();
            let options = {
                method: "POST",
                url: `https://atom.musiyoujia.com/member/memberbehavior/getBehaviorInfos`,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': defaultUserAgent,
                    "api_client_code": "65",
                    "api_version": "1.0.0",
                    'api_token': this.activedAuthToken,

                    'api_timestamp': timestamp,
                    'api_sign': this.MD5_Encrypt(`api_token=${this.activedAuthToken}&api_client_code=65&api_version=1.0.0&api_timestamp=${timestamp}`)?.toUpperCase()

                },
                data: { "appId": "wx03527497c5369a2c", "appType": "WECHAT_MINI_PROGRAM", "behaviorIds": [1, 2, 10203, 10204, 10205, 5], "sourceChannel": "会员小程序", "source": `${this.customId}`, "openId": `${this.openId}` }
            }
            let { data: result } = await axios.request(options)

            if (result?.msg === "success") {
                this.isSigned = result?.data[0].acts['每天已获得积分次数'] === 1;
                $.log(`账号[${this.index}] 获取任务列表成功，${this.isSigned ? '已签到' : '未签到'}`)
            } else {
                $.log(`账号[${this.index}] 获取任务列表失败：${result?.msg || JSON.stringify(result)}`)
            }

        } catch (e) {
            console.log(e)
        }
    }

    async doSign() {
        try {
            const timestamp = new Date().getTime();
            const eventAttr2 = $.time('yyyy.MM.dd')
            let options = {
                method: 'POST',
                url: `https://atom.musiyoujia.com/member/memberbehavior/add`,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': defaultUserAgent,
                    "api_client_code": "65",
                    'api_token': this.activedAuthToken,
                    "api_version": "1.0.0",
                    'api_timestamp': timestamp,
                    'api_sign': this.MD5_Encrypt(`api_token=${this.activedAuthToken}&api_client_code=65&api_version=1.0.0&api_timestamp=${timestamp}`)?.toUpperCase()

                },
                data: { "appId": "wx03527497c5369a2c", "appType": "WECHAT_MINI_PROGRAM", "osType": "windows", "model": "microsoft", "browser": "微信小程序", "platform": "1", "sourceType": "5", "sourceChannel": "会员小程序", "siteId": "", "visitorId": "", "deviceId": "", "spotId": "", "campaignId": "", "deviceType": "", "eventLabel": "", "eventValue": "", "eventAttr2": `${eventAttr2}`, "eventAttr3": "", "eventAttr4": "", "eventAttr5": "", "eventAttr6": "", "googleCampaignName": "", "googleCampaignSource": "", "googleCampaignMedium": "", "googleCampaignContent": "", "memberType": "DeRUCCI", "customId": `${this.customId}`, "locationUrl": "/pages/user/signIn", "url": "/pages/user/signIn", "pageTitle": "每日签到", "logType": "event", "behaviorIds": [1, 3], "eventCategory": "用户签到", "eventAction": "签到", "eventAttr1": 2, "openId": `${this.openId}` }
            }
            let { data: result } = await axios.request(options)

            if (result?.msg === "success") {
                $.log(`账号[${this.index}] 签到成功，获得积分：${result?.data?.point}`)
            } else {
                $.log(`账号[${this.index}] 签到失败：${result?.msg || JSON.stringify(result)}`)
            }

        } catch (e) {
            console.log(e)
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
