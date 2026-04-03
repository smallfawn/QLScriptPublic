/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description:  海天美味馆小程序
cron: 30 11 * * *
------------------------------------------
#Notice:   
抓取https://cmallapi.xkmm.cn请求头的authorization和uuid参数，填入环境变量，格式如下：
authorization#uuid 多账号&或换行

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
const $ = new Env("海天美味馆小程序");
let ckName = `haitian`;
const strSplitor = "#";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.token = this.user[0];
        this.activity_code = "";
        this.userFlag = false;
        this.headers = {};
        this.uuid = this.user[1]
        this.headers = {
            "Connection": "keep-alive",
            "envVersion": "release",
            "content-type": "application/json",
            "Authorization": "" + this.token,
            "uuid": "" + this.uuid,
            "Accept-Encoding": "gzip,compress,br,deflate",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_15 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.70(0x1800462d) NetType/WIFI Language/zh_CN",
            "Referer": "https://servicewechat.com/wx7a890ea13f50d7b6/765/page-frame.html"
        }
    }

    async run() {

        await this.getUserInfo()

        if (this.userFlag) {
            await this.task_1()

            await this.task_2()
            await this.getSignActivity()

            if (this.activity_code) {
                await this.signIn()
                await this.getLotteryTaskList()
                await this.getLotteryNum()
            }
        }
    }
    async getUserInfo() {
        let options = {
            method: 'GET',
            url: `https://cmallapi.xkmm.cn/buyer-api/members`,
            headers: this.headers
        }
        let { data: result } = await axios.request(options);
        if (result?.member_id) {
            $.log(`🌸账号[${this.index}] [${result.member_id}][${result.mobile}] 当前积分[${result.consum_point}]` + `🎉`);
            this.userFlag = true;
        } else {
            $.log(`🌸账号[${this.index}] 查询-失败:${JSON.stringify(result)}❌`)
        }
    }
    async getSignActivity() {
        let options = {
            method: 'GET',
            url: `https://cmallapi.xkmm.cn/buyer-api/sign/activity/code?activityCode=`,
            headers: this.headers
        }
        let { data: result } = await axios.request(options);
        if (result?.activity_code) {
            $.log(`获取活动信息成功，活动ID：${result.activity_code}`)
            this.activity_code = result.activity_code
        }
        else {
            $.log(`获取活动信息失败:${JSON.stringify(result)}❌`)
        }
    }
    async signIn() {
        try {
            let options = {
                url: `https://cmallapi.xkmm.cn/buyer-api/sign/activity/sign`,
                method: "POST",
                headers: this.headers,
                data: JSON.stringify({ "activity_code": this.activity_code, "fill_date": "" })
            }
            let { data: result } = await axios.request(options)
            if (result.is_sign == true) {
                $.log(`签到成功`)
            } else {
                $.log(`签到失败 [${result.message}]`)
            }
        } catch (e) {
            $.log(`签到失败 [${JSON.stringify(e.message)}]`)
        }


    }
    //浏览页面
    async task_1() {
        let options = {
            url: `https://cmallapi.xkmm.cn/buyer-api/members/browsePage`,
            method: "POST",
            headers: this.headers,
            data: JSON.stringify({})
        }
        let { data: result } = await axios.request(options)
        if (result?.code == 200) {
            $.log(`浏览界面 操作成功`)
        } else {
            $.log(`浏览界面 操作失败[${JSON.stringify(result)}]`)
        }

    }
    //浏览社区
    async task_2() {
        let options = {
            url: `https://cmallapi.xkmm.cn/buyer-api/members/commnity/brosing/duration/add?seconds=10`,
            method: "POST",
            headers: this.headers,
            data: JSON.stringify({})
        }
        let { data: result } = await axios.request(options)
        if (result?.statusCode == 200) {
            $.log(`浏览社区 操作成功`)
        } else {
            $.log(`浏览社区 操作失败 貌似是正常的 [${result}]`)
        }
    }
    async doLottery() {
        let options = {
            method: 'GET',
            url: `https://cmallapi.xkmm.cn/buyer-api/lucky/activity/extract?activityCode=jfcj${this.activity_code}`,
            headers: this.headers
        }
        let { data: result } = await axios.request(options);
        if (result?.lucky_record_vo) {
            $.log(`🌸账号[${this.index}]` + `🕊抽奖结果:${result.lucky_record_vo.prize_name}🎉`);
        } else {
            $.log(`🌸账号[${this.index}] 抽奖-失败:${JSON.stringify(result)}❌`)
        }
    }
    async getLotteryTaskList() {
        let options = {
            method: 'GET',
            url: `https://cmallapi.xkmm.cn/buyer-api/lucky/task/package/jfcj${this.activity_code}`,
            headers: this.headers
        }
        let { data: result } = await axios.request(options);
        if (result?.member_id) {
            $.log(`🌸账号[${this.index}]` + `🕊抽奖次数任务🎉`);
            for (let task of result.task_list) {
                if (task.today_available_task_number >= 1 && task.today_obtained_task_number < task.today_available_task_number) {

                    if (task.task_key == "LOGIN") {
                        $.log(`🌸账号[${this.index}]` + `🕊正在完成任务:${task.task_name}🎉`);

                        let options = {
                            url: `https://cmallapi.xkmm.cn/buyer-api/lucky/task/getLoginOpporturnity/jfcj${this.activity_code}`,
                            method: "PUT",
                            headers: this.headers,
                            data: JSON.stringify({})
                        }
                        let { data: result } = await axios.request(options)
                        $.log(result)
                    }
                    if (task.task_key == "SHARE") {

                    }
                    if (task.task_key == "BROWSE_PAGE_TASK") {
                        $.log(`🌸账号[${this.index}]` + `🕊正在完成任务:${task.task_name}🎉`);

                        await this.lotteryTaskBrowser(task.link)

                    }
                }
            }
        } else {
            $.log(`🌸账号[${this.index}] 抽奖次数任务-失败:${JSON.stringify(result)}❌`)
        }
    }
    async lotteryTaskBrowser(link) {
        let optionsStart = {
            url: `https://cmallapi.xkmm.cn/buyer-api/lucky/task/browse/page/start/jfcj${this.activity_code}?pageUrl=${link}`,
            method: "GET",
            headers: this.headers
        }
        await axios.request(optionsStart)
        await $.wait(20 * 1000)
        let optionsEnd = {
            url: `https://cmallapi.xkmm.cn/buyer-api/lucky/task/browse/page/end/jfcj${this.activity_code}?pageUrl=${link}`,
            method: "GET",
            headers: this.headers
        }
        await axios.request(optionsEnd)
    }
    async getLotteryNum() {
        let options = {
            url: `https://cmallapi.xkmm.cn/buyer-api/lucky/activity/opporturnity?activityCode=jfcj${this.activity_code}`,
            method: "GET",
            headers: this.headers
        }
        let { data: result } = await axios.request(options)
        if (result.can_use > 0) {
            $.log(`当前剩余抽奖次数：${result.can_use}`)
            for (let can = 0; can < result.can_use; can++) {
                await this.doLottery()
            }
        } else {
            $.log(`当前剩余抽奖次数0`)
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