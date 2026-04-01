/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description: 海底捞
cron: 8 30 * * *
------------------------------------------
#Notice:   
如果微信小程序抓包的写变量值前面加上wx#
例如wx#OPENID_#uid
https://superapp-public.kiwa-tech.com/api/gateway/login/center/login/wechatLogin 接口的请求参数openId#uid
如果是APP抓包的写变量值前面加上app#
抓包https://superapp-public.kiwa-tech.com/api/gateway/login/center/login/wechatLogin 接口的请求参数token
例如app#TOKEN_APP_


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
const $ = new Env("海底捞");
let ckName = `hdl`;
const strSplitor = "#";
process.env[ckName] = ""
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.tokenType = this.user[0];
        this.openId = null
        this.uid = null
        this.token = null
        this.valid = false;
        this.name = ''
        this.signinSource = ''
        this.platformname = ''
    }

    async run() {
        if (this.tokenType == 'wx') {
            this.platformname = 'wechat'
            this.openId = this.user[1];
            this.uid = this.user[2];
            this.signinSource = 'MiniApp'
            await this.wxLogin()
            if (!this.valid) return;

        }
        if (this.tokenType == 'app') {
            this.token = this.user[1];
            this.signinSource = 'APP'
            this.platformname = 'app'
        }
        await this.info()
        await this.signIn()
    }
    async wxLogin() {
        try {
            let options = {
                url: "https://superapp-public.kiwa-tech.com/api/gateway/login/center/login/wechatLogin",
                headers: {
                    "_haidilao_app_token": "",
                    "accept": "*/*",
                    "accept-language": "zh-CN,zh;q=0.9",
                    "appid": "15",
                    "appname": "HDLMember",
                    "appversion": "3.240.0",
                    "content-type": "application/json",
                    "platformname": this.platformname,
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "cross-site",
                    "smdeviceid": "",
                    "xweb_xhr": "1"
                },
                method: 'POST',
                data: {
                    "type": 1,
                    "country": "CN",
                    "codeType": 1,
                    "business": "登录",
                    "terminal": "会员小程序",
                    "openId": "" + this.openId,
                    "uid": "" + this.uid
                }
            }
            let { data: result } = await axios.request(options);
            if (result.code == 100000) {
                this.token = result.data.token
                this.name = result.data.nickName
                $.log(`账号[${this.index}]【${this.name}】 登录成功`);
                this.valid = true;
            } else {
                $.log(result);
            }


        } catch (e) {

        } finally { }
    }
    async signIn() {
        let options = {
            url: 'https://superapp-public.kiwa-tech.com/activity/wxapp/signin/signin',
            headers: {
                "platformname": this.platformname,
                '_haidilao_app_token': this.token,

            },
            method: 'POST',
            data: { "signinSource": this.signinSource }
        }
        let { data: result } = await axios.request(options);
        if (result['success']) {
            $.log(`账号[${this.index}]【${this.name}】 签到成功`);
        } else {
            $.log(result);
        }




    }
    async info() {
        let options = {
            url: 'https://superapp-public.kiwa-tech.com/activity/wxapp/signin/queryFragment',
            headers: {
                "platformname": this.platformname,
                '_haidilao_app_token': this.token,
            },
            method: 'POST',
            data: {}
        }
        let { data: result } = await axios.request(options);
        if (result['success']) {
            $.log(`账号[${this.index}]  剩余[${result.data.total}]本期碎片将于${result['data']['expireDate']}过期 `)
        } else {
            $.log(result);
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