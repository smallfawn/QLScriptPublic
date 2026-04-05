/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description:  摩托范APP签到和抽奖
cron: 30 10 * * *
------------------------------------------
#Notice:   
变量名 ：mtf
抓域名 api.58moto.com 下请求中 token和uid 的值填入变量 用#连接  多账户&或换行
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
const $ = new Env("摩托范");
let ckName = `mtf`;
const strSplitor = "#";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.token = this.user[0];
        this.uid = this.user[1];

    }

    async run() {
        await this.userInfo()
        await this.signIn()
        await this.drwa()
    }
    async userInfo() {
        let options = {
            method: 'POST',
            url: `https://api.58moto.com/user/center/info/principal`,
            headers: {
                "token": this.token,
                "content-type": "application/x-www-form-urlencoded"
            },
            data: "uid=" + this.uid
        }
        let { data: result } = await axios.request(options);
        if (result?.code == 0) {
            $.log(`查询成功:当前手机号${result.data.mobile} \n 用户昵称为${result.data.username} 🎉`);
        } else {
            $.log(`查询: 失败 ❌ 了呢,原因未知!`);
            console.log(result);
        }
    }
    async signIn() {
        let options = {
            method: 'POST',
            url: `https://api.58moto.com/coins/task/dailyCheckIn`,
            headers: {
                "token": this.token,
                "content-type": "application/x-www-form-urlencoded"
            },
            data: "uid=" + this.uid + "&weekDate=" + $.time('yyyyMMdd')
        }
        let { data: result } = await axios.request(options);

        if (result?.code == 0) {
            $.log(`签到成功:${result.data.contentDesc} 🎉`);
        } else if (result?.code == 300101) {
            $.log(`签到失败:${result.msg},请勿重复签到`);
        } else {
            $.log(`签到: 失败 ❌ 了呢,原因未知!`);
            console.log(result);
        }




    }
    async drwa() {
        let options = {
            method: 'POST',
            url: `https://jsapi.58moto.com/coins/turntable/activity/draw`,
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            },
            data: `token=${this.token}&uid=${this.uid}&autherid=${this.uid}&platform=2&version=3.66.80&deviceId=53B5DA97-C72D-4C19-A219-70D8A9A31290&bundleId=com.jdd.motorfans&activityId=24`
        }
        let { data: result } = await axios.request(options);
        if (result?.code == 0) {
            $.log(`抽奖成功:${result.data.awardName} 🎉`);
        } else {
            $.log(`抽奖: 失败 ❌ 了呢,原因未知!`);
            console.log(result);
        }




    }


    //做任务需要wtoken逆向 不想写




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