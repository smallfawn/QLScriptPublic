/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description:  联想APP或者https://mmembership.lenovo.com.cn/app 网页
cron: 30 11 * * *
------------------------------------------
#Notice:   
登录APP或者网页获取请求头的accesstoken参数
变量名: lenovo
多账号&或换行
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
self = this
const { Env } = require("../tools/env")
const $ = new Env("lenovo联想");
let ckName = `lenovo`;
const strSplitor = "#";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
    constructor(str) {
        this.index = $.userIdx++;
        this.ck = null //单账号多变量分隔符
        this.ckStatus = true;
        this.token = null
        this.accesstoken = str.split(strSplitor)[0];
        this.headers = {}
    }
    async main() {
        await this.ssoCheck()
        if (this.ck && this.token) {
            await this.userInfo()
            await this.checkIn()
            await this.getUserTaskList();

        }



    }
    async userInfo() {
        let options = { method: "POST", url: `https://mmembership.lenovo.com.cn/member-hp-webapi/v1/userBenefit/getMyAssets`, headers: this.headers }
        let { data: result } = await axios.request(options)
        if (result.code == "0") {
            $.log(`✅账号[${this.index}]  获取用户信息成功===>[${result.data.userId}]乐豆[${result.data.ledouNum}]`);
            this.ckStatus = true
        } else {
            $.log(`❌账号[${this.index}]  获取用户状态失败`);
            this.ckStatus = false

        }
    }
    async isSignIn() {
        let options = { method: "POST", url: `https://mmembership.lenovo.com.cn/member-hp-task-center/v1/task/getCheckInList?lenovoId=${this.ck}`, headers: this.headers }
        let { datal: result } = await axios.request(options)
        //
        if (result.code == "0") {
            if (result.data.flag == !1) {
                $.log(`✅账号[${this.index}]  今日未签到 =====> 签到ing🎉`)

                await this.checkIn()
            }
        } else {
            $.log(`❌账号[${this.index}]  获取签到状态`);

        }
    }
    async checkIn() {
        let options = { method: "POST", url: `https://mmembership.lenovo.com.cn/member-hp-task-center/v1/task/checkIn?lenovoId=${this.ck}&OSType=10011`, headers: this.headers }
        let { data: result } = await axios.request(options)
        //
        if (result.code == "0") {
            $.log(`✅账号[${this.index}]  签到成功🎉`)
        } else {
            $.log(`❌账号[${this.index}]  签到失败[${result.msg}]`);

        }
    }
    getSignKey() {
        global["window"] = {}
        const JSEncrypt = require("jsencrypt")
        let pt = ["cD", "BT", "Uzn", "Po", "Luu", "Yhc", "Cj", "FP", "al", "Tq"]
            , ht = ["MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJB", "L7qpP6mG6ZHdDKEIdTqQDo/WQ", "6NaWftXwOTHnnbnwUEX2/2jI4qALxRWMliYI80cszh6", "ySbap0KIljDCN", "w0CAwEAAQ=="]
            , mt = function (text) {
                var t, e, n = "";
                try {
                    var r = new JSEncrypt;
                    r.setPublicKey((t = ["A", "b", "C", "D", ""],
                        e = "",
                        ht.forEach((function (n, r) {
                            return e += n + t[r]
                        }
                        )),
                        e)),
                        n = r.encrypt(text)
                } catch (t) {
                    console.log("rsa加密错误！", n)
                }
                return n
            }
        for (var t = function () {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 8;
            return Math.floor(Math.random() * Math.pow(10, t))
        }(8).toString(), e = "", i = 0; i < t.length; i++)
            e += pt[Number(t[i])];
        return mt(t + ":" + e)
    }
    async getUserTaskList() {
        let options = { method: "POST", url: `https://mmembership.lenovo.com.cn/member-hp-task-center/v1/task/getUserTaskList`, headers: this.headers }
        let { data: result } = await axios.request(options)
        //
        if (result.code == "0") {
            $.log(`✅账号[${this.index}]  获取任务列表成功🎉`)
            let flag = false;
            for (let i = 0; i < result.data.length; i++) {
                let task = result.data[i];
                if (task.taskState == 0 && task.type !== 13) {
                    flag = true
                    await $.wait(5000)
                    await this.doTask(task.taskId);
                }

            }
            if (flag) {
                $.log(`✅账号[${this.index}]  任务执行完毕🎉`)
            } else {
                $.log(`✅账号[${this.index}]  没有可执行任务`)
            }
        } else {
            $.log(`❌账号[${this.index}]  获取任务列表失败`);

        }
    }
    async doTask(id) {
        let options = { method: "POST", url: `https://mmembership.lenovo.com.cn/member-hp-task-center/v1/checkin/selectTaskPrize?taskId=${id}&channelId=1`, headers: this.headers }
        let { data: result_ } = await axios.request(options)
        if (result_.code == "0") {
            let options = { method: "POST", url: `https://mmembership.lenovo.com.cn/member-hp-task-center/v1/Task/userFinishTask?taskId=${id}&channelId=1&state=1`, headers: this.headers }
            let { data: result } = await axios.request(options)

            if (result.code == "0") {
                $.log(`✅账号[${this.index}]  任务执行成功🎉`)
            } else {
                $.log(`❌账号[${this.index}]  任务执行失败`);
                console.log(result_.message);
                console.log(id)
            }
        } else {
            console.log(result_.message)
        }

    }
    async ssoCheck() {

        let options = {
            method: 'POST',
            url: 'https://mmembership.lenovo.com.cn/member-center-api/v2/access/ssoCheck?lenovoId=&unionId=&clientId=2',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.99 Mobile Safari/537.36/lenovoofficialapp/9e4bb0e5bc326fb1_10219183246/newversion/versioncode-1000112/',
                'Accept-Encoding': 'gzip, deflate',
                'pragma': 'no-cache',
                'cache-control': 'no-cache',
                'accesstoken': this.accesstoken,
                'signkey': this.getSignKey(),
                'origin': 'https://mmembership.lenovo.com.cn',
                'servicetoken': '',
                'tenantid': '25',
                'sec-fetch-dest': 'empty',
                //'lenovoid': ,
                'clientid': '2',
                'x-requested-with': 'com.lenovo.club.app',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-mode': 'cors',
                'referer': 'https://mmembership.lenovo.com.cn/app?pmf_source=P0000005611M0002',
                'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            }
        }
        let { data: result } = await axios.request(options)
        if (result.code == "0") {
            this.token = result.data.serviceToken
            this.ck = result.data.lenovoId
            this.headers = {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.99 Mobile Safari/537.36/lenovoofficialapp/9e4bb0e5bc326fb1_10219183246/newversion/versioncode-1000112/',
                'Accept-Encoding': 'gzip, deflate',
                'pragma': 'no-cache',
                'cache-control': 'no-cache',
                'origin': 'https://mmembership.lenovo.com.cn',
                'servicetoken': this.token,
                'sec-fetch-dest': 'empty',
                //'service-authentication':this.token,
                'lenovoid': this.ck,
                'clientid': '2',
                'x-requested-with': 'com.lenovo.club.app',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-mode': 'cors',
                'referer': 'https://mmembership.lenovo.com.cn/app?pmf_source=P0000005611M0002',
                'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            }
        }
    }








}

!(async () => {
    await getNotice()
    $.checkEnv(ckName);

    for (let user of $.userList) {
        await new Task(user).main();
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

