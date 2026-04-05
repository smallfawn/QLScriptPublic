/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description:   麦斯威尔福利社小程序 签到 浇水 积分
cron: 30 9 * * *
------------------------------------------
#Notice:   麦斯威尔福利社小程序
抓jde.mtbcpt.com/api的POST请求中的openId 多账户&或换行
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
const $ = new Env("麦斯威尔福利社小程序");
let ckName = `mswe`;
const strSplitor = "#";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.openId = this.user[0];

    }

    async run() {
        await this.getMemberTaskInfo()
        await this.getUserFarmGetWaterList()
        for (let i = 0; i < 3; i++) {
            await this.farmWatering();
        }
    }

    md5(str) {
        const crypto = require("crypto")
        return crypto.createHash("md5").update(str).digest('hex');
    }
    // =============================================================================================================================

    async getMemberTaskInfo() {
        try {
            let timestamp = Date.now();
            let sign = this.md5(`timestamp=${timestamp}&openid=${this.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();
            let options = {
                method: 'post',
                url: 'https://jde.mtbcpt.com/api/JDEMaxwellApi/GetMemberTaskInfo',
                headers: {
                    'Host': 'jde.mtbcpt.com',
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b11) XWEB/9129',
                },
                data: {
                    "openId": this.openId,
                    "timestamp": timestamp,
                    "sign": sign,
                }
            };

            let { data: result } = await axios.request(options)

            if (result?.state == true) {

                $.log(`🌸账号[${this.index}]` + `查询任务成功🎉`);
                if (result.data.dailySign != 1) {
                    $.log(`${this.index}账号[${this.index}]` + `未签到`);
                    await this.signDailyScore()

                } else {
                    $.log(`${this.index}账号[${this.index}]` + `已签到`);


                }
                if (result.data.shareSign != 1) {
                    $.log(`${this.index}账号[${this.index}]` + `未分享`);
                    //分享
                    await this.shareDailyScore()
                } else {
                    $.log(`${this.index}账号[${this.index}]` + `已分享`);

                }

            } else {
                $.log(`🌸账号[${this.index}]查询任务-失败:${result.msg}❌`)
            }

        } catch (e) {

        }
    }
    async signDailyScore() {
        try {
            let timestamp = Date.now();
            let sign = this.md5(`timestamp=${timestamp}&openid=${this.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();
            let options = {
                method: 'post',
                url: 'https://jde.mtbcpt.com/api/JDEMaxwellApi/SignInDailyScore',
                headers: {
                    'Host': 'jde.mtbcpt.com',
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b11) XWEB/9129',
                },
                data: {
                    "openId": this.openId,
                    "timestamp": timestamp,
                    "sign": sign,
                }
            };

            let { data: result } = await axios.request(options)

            if (result?.state == true) {

                $.log(`🌸账号[${this.index}]` + `🕊${result.msg}🎉`);
            } else {
                $.log(`🌸账号[${this.index}]签到-失败:${result.msg}❌`)
            }

        } catch (e) {

        }
    }
    //分享加积分
    async shareDailyScore() {
        try {
            let timestamp = Date.now();
            let sign = md5(`timestamp=${timestamp}&openid=${this.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();
            let options = {
                method: 'post',
                url: `https://jde.mtbcpt.com/api/JDEMaxwellApi/ShareDailyScore`,
                headers: {
                    'Host': 'jde.mtbcpt.com',
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b11) XWEB/9129',
                },
                data: {
                    "through": true,
                    "openId": this.openId,
                    "timestamp": timestamp,
                    "sign": sign,
                }

            }
            //
            let { data: result } = await axios.request(options)

            if (result?.state == true) {
                //打印签到结果
                $.log(`🌸账号[${user.index}]` + `🕊${result.msg}🎉`);
            } if (result?.state == false) {
                $.log(`🌸账号[${user.index}]分享-失败:${result.msg}❌`)
            }
        } catch (e) {

        }
    }
    async getUserFarmGetWaterList() {
        try {
            let timestamp = Date.now();
            let sign = this.md5(`timestamp=${timestamp}&openid=${this.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();
            let options = {
                method: 'post',
                url: 'https://jde.mtbcpt.com/api/JDEMaxwellApi/getUserFarmGetWaterList',
                headers: {
                    'Host': 'jde.mtbcpt.com',
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b11) XWEB/9129',
                },
                data: {
                    "openId": this.openId,
                    "timestamp": timestamp,
                    "sign": sign,
                }
            };

            let { data: result } = await axios.request(options)

            if (result?.state == true) {

                $.log(`🌸账号[${this.index}]` + `查询农场任务成功🎉`);
                for (let task of result.data.list) {
                    if (task.status != 3) {
                        $.log(`${this.index}账号[${this.index}][${task.taskName}]` + `未执行`);
                        if (task.ptype == 1) {
                            await this.farmSign()
                        }
                        if (task.ptype == 2) {
                            await this.farmShare()
                        }
                    } else {
                        $.log(`${this.index}账号[${this.index}][${task.taskName}]` + `已执行`);

                    }

                }





            } else {
                $.log(`🌸账号[${this.index}]查询任务-失败:${result.msg}❌`)
            }

        } catch (e) {

        }
    }
    //浇水签到
    async farmSign() {
        try {
            let timestamp = Date.now();
            let sign = this.md5(`timestamp=${timestamp}&openid=${this.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();
            let options = {
                method: 'post',
                url: 'https://jde.mtbcpt.com/api/JDEMaxwellApi/UserSign',
                headers: {
                    'Host': 'jde.mtbcpt.com',
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b11) XWEB/9129',
                },
                data: {

                    "openId": this.openId,
                    "timestamp": timestamp,
                    "sign": sign,

                }
            };
            let { data: result } = await axios.request(options)
            if (result?.state == true) {

                $.log(`🌸账号[${this.index}]` + `🕊水滴签到-领取成功${result.msg}🎉`);
            } else {
                $.log(`🌸账号[${this.index}]水滴签到-失败:${result.msg}❌`)
            }

        } catch (e) {

        }
    }
    //分享领水滴
    async farmShare() {
        try {
            let timestamp = Date.now();
            let sign = this.md5(`timestamp=${timestamp}&openid=${this.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();
            let options = {
                method: 'post',
                url: 'https://jde.mtbcpt.com/api/JDEMaxwellApi/UserShare',
                headers: {
                    'Host': 'jde.mtbcpt.com',
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b11) XWEB/9129',
                },
                data: {

                    "openId": this.openId,
                    "timestamp": timestamp,
                    "sign": sign,

                }
            };

            let { data: result } = await axios.request(options)
            if (result?.state == true) {

                $.log(`🌸账号[${this.index}]` + `🕊任务分享领水滴-领取成功${result.msg}🎉`);
            } else {
                $.log(`🌸账号[${this.index}]任务分享领水滴-失败:${result.msg}❌`)
            }

        } catch (e) {

        }
    }
    //浇水
    async farmWatering() {
        try {
            let timestamp = Date.now();
            let sign = this.md5(`timestamp=${timestamp}&openid=${this.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();
            let options = {
                method: 'post',
                url: 'https://jde.mtbcpt.com/api/JDEMaxwellApi/UserWatering',
                headers: {
                    'Host': 'jde.mtbcpt.com',
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b11) XWEB/9129',
                },
                data: {
                    "openId": this.openId,
                    "timestamp": timestamp,
                    "sign": sign,
                }
            };

            let { data: result } = await axios.request(options)
            if (result?.state == true) {

                $.log(`🌸账号[${this.index}]` + `🕊浇水-成功${result.msg}🎉`);
            } else {
                $.log(`🌸账号[${this.index}]浇水-失败:${result.msg}❌`)
            }

        } catch (e) {

        }
    }
    async getUserPoint() {
        try {
            let timestamp = Date.now()
            let sign = this.md5(`timestamp=${timestamp}&openid=${this.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();
            let options = {
                method: 'post',
                url: 'https://jde.mtbcpt.com/api/JDEMWMall/GetUserPoint',
                headers: {
                    'Host': 'jde.mtbcpt.com',
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b11) XWEB/9129',
                },
                data: {

                    "openId": this.openId,
                    "timestamp": timestamp,
                    "sign": sign,

                }
            };

            let { data: result } = await axios.request(options)
            if (result?.state == true) {
                this.userFlag = false
                $.log(`🌸账号[${this.index}]` + `🕊${result.msg}为[${result.data}]💰`);
            } else {
                $.log(`🌸账号[${this.index}]积分查询失败:${result.msg}❌`)
            }

        } catch (e) {

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
