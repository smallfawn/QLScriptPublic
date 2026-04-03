

/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description:  国乐酱酒小程序
cron: 30 9 * * *
------------------------------------------
#Notice:   
变量名:gyjj
国乐酱酒小程序签到，使用前请先获取token，方法如下：
打开微信，进入国乐酱酒小程序，点击右下角“我的”，
打开抓包软件抓取https://member.guoyuejiu.com/api/sign/daily/sign 请求头的Authorization 
抓取到的Authorization值即为token
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
const $ = new Env("国乐酱酒");
let ckName = `gyjj`;
const strSplitor = "#";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.token = this.user[0];

    }

    async run() {

        await this.sign()
        await this.account()
    }

    async sign() {
        try {

            let options = {
                method: 'get',
                url: `https://member.guoyuejiu.com/api/sign/daily/sign`,
                headers: {
                    "Authorization": this.token,
                    "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_15 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.70(0x1800462d) NetType/WIFI Language/zh_CN',
                    "Referer": "https://servicewechat.com/wxeff120e4d11594c0/85/page-frame.html"
                },

            }
            let { data: result } = await axios.request(options)
            if (result?.code == 0) {
                //打印签到结果
                $.log(`🕊账号[${this.index}] 签到成功：签到[${result.data.spanSumDays}]天🎉`);
                this.mist = result.data.spanSumDays
            } else {
                $.log(`🕊账号[${this.index}] 签到失败:${result.message}⛔`)
            }
        } catch (e) {
            console.log(e);
        }
    }

    //
    async account() {
        try {
            let options = {
                method: 'get',
                url: `https://member.guoyuejiu.com/api/user/info`,
                headers: {
                    "Authorization": this.token,
                    "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_15 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.70(0x1800462d) NetType/WIFI Language/zh_CN',
                    "Referer": "https://servicewechat.com/wxeff120e4d11594c0/85/page-frame.html"
                }


            }
            let { data: result } = await axios.request(options)
            if (result?.code == 0) {
                //打印签到结果
                $.log(`🕊账号[${this.index}] 查询成功:总积分[${result.data.score}]🎉`);

            } else {
                $.log(`🕊账号[${this.index}] 查询失败:${result.message}🚫`)
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