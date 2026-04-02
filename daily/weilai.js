/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description: babycare
cron: 8 30 * * *
------------------------------------------
#Notice:   
变量名 weilai
APP抓请求头app.nio.com 请求头里面的authorization 去掉Bearer后面部分就是变量值，
或者抓网页版https://www.nio.cn/ 右上角登录后请求头里面的authorization  去掉Bearer后面部分就是变量值，
多个账号换行或者&分隔
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
const $ = new Env("蔚来签到");
let ckName = `weilai`;
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
        await this.signIn()
    }

    async signIn() {
        let options = {
            method: 'POST',
            url: `https://gateway-front-external.nio.com/moat/10086/c/award_cn/checkin?app_id=10086&timestamp=${Date.now()}`,
            headers: {
                "authority": "gateway-front-external.nio.com",
                "content-type": "application/x-www-form-urlencoded",
                "accept": "application/json, text/plain, */*",
                "authorization": 'Bearer ' + this.token,
                "sec-fetch-site": "cross-site",
                "priority": "u=3, i",
                "accept-language": "zh-CN,zh-Hans;q=0.9",
                "accept-encoding": "gzip, deflate, br",
                "sec-fetch-mode": "cors",
                "origin": "null",
                "user-agent": defaultUserAgent,
                "sec-fetch-dest": "empty"
            },
            data: "event=checkin"
        };
        let { data: result } = await axios.request(options);
        if (result?.result_code == 'success') {
            $.log(`🌸账号[${this.index}]` + `${result.data.tip}🎉`);
        } else {
            $.log(`🌸账号[${this.index}] 签到-失败:${JSON.stringify(result)}❌`)
        }




    }
    async info() {
        let options = {
            url: 'https://api.bckid.com.cn/operation/front/bonus/userBonus/getUserBonus',
            headers: {
                'Host': 'api.bckid.com.cn',
                'authorization': this.token,
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b11) XWEB/9129',
            },
            method: 'POST',
            data: {}
        }
        let { data: result } = await axios.request(options);
        if (result?.code == '200') {
            //打印签到结果
            $.log(`🌸账号[${this.index}]` + `🕊账户当前积分[${result.body.userBonus}],历史积分[${result.body.sumBonus}]💰`);
        } else {
            $.log(`🌸账号[${this.index}]积分查询失败:${result.message}❌`)
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
