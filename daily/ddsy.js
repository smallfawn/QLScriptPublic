/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description: ddky
cron: 9 30 * * *
------------------------------------------
#Notice:   
变量值:https://hapi.ddky.com/mcp/weixin/rest.htm?后面的loginToken&userId&uDate  多账户换行或者&分隔
网页版登录 https://m.ddky.com/
小程序登录9 9 * * *
APP 都可以找到这三个值
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
const $ = new Env("9 9 * * *");
let ckName = `ddky`;
const strSplitor = "#";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.token = env.split(strSplitor)[0]; //单账号多变量分隔符

        this.userId = env.split(strSplitor)[1];
        this.uDate = env.split(strSplitor)[2];

    }

    async run() {

        await this.getSignInId()
    }

    getSign(s) {
        const crypto = require("crypto");//SIGN TYPE 1是签到 2是补签
        return crypto.createHash('md5').update(s).digest('hex');
    }
    getTime() {
        var now = new Date();
        var year = now.getFullYear()
            , month = now.getMonth() + 1
            , day = now.getDate()
            , hours = now.getHours()
            , minutes = now.getMinutes()
            , seconds = now.getSeconds();
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    }
    getSignDay() {
        var now = new Date();
        var year = now.getFullYear()
            , month = now.getMonth() + 1
            , day = now.getDate()
        return year + '-' + month + '-' + day
    }
    async getSignInId() {
        const time = this.getTime()
        const method = `ddky.promotion.signin.pageinfo`
        const signDay = this.getSignDay()
        const str = method +
            `loginToken${this.token}` +
            `method${method}` +
            `platH5` +
            `platformH5` +
            `signDay${signDay}` +
            `t${time}` +
            `uDate${this.uDate}` +
            `userId${this.userId}` +
            `v1.0` +
            `versionName4.9.0` +
            `6C57AB91A1308E26B797F4CD382AC79D`
        let sign = (this.getSign(str)).toUpperCase();
        let callbackStr = new Date().getTime()
        try {
            let options = {
                url: `https://hapi.ddky.com/mcp/weixin/rest.htm?sign=${sign}&loginToken=${this.token}&method=${method}&plat=H5&platform=H5&signDay=${signDay}&t=${time}&uDate=${this.uDate}&userId=${this.userId}&v=1.0&versionName=4.9.0&callback=Zepto${callbackStr}`,
                headers: {},
            }
            let { data: response } = await axios.request(options);
            let result = response.replace(`Zepto${callbackStr}`, "")
            result = result.replaceAll("(", "")
            result = result.replaceAll(")", "")
            result = JSON.parse(result)
            if (result.code = "0") {
                await this.user_info(result.result.signDayVo.signinId)
            }

        } catch (e) {
            console.log(e);
        }
    }
    async user_info(signInId) {
        let callbackStr = new Date().getTime()
        const time = this.getTime()
        const str = `ddky.promotion.signin.sign` + `channelH5` + `laterSignType1` + `loginToken${this.token}` + `methodddky.promotion.signin.sign` +
            `platH5` + `platformH5` + `signinId${signInId}` + `t${time}` + `uDate${this.uDate}` + `userId${this.userId}` + `v1.0` + `versionName4.9.0` +
            `6C57AB91A1308E26B797F4CD382AC79D`
        let sign = (this.getSign(str)).toUpperCase();
        try {
            let options = {
                url: `https://hapi.ddky.com/mcp/weixin/rest.htm?sign=${sign}&channel=H5&laterSignType=1&loginToken=${this.token}&method=ddky.promotion.signin.sign&plat=H5&platform=H5&signinId=${signInId}&t=${time}&uDate=${this.uDate}&userId=${this.userId}&v=1.0&versionName=4.9.0&callback=Zepto${callbackStr}`,
                headers: {},
            }
            let { data: response } = await axios.request(options);
            console.log(response);
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