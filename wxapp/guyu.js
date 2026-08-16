

/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description:  
cron: 30 9 * * 1
------------------------------------------
#Notice:   
谷雨 微信小程序 签到得积分 
WeChatCodeServer 填写wx_server_url wx_auth 用于获取code 
变量名称：guyu 名字 授权中心 里面的openid 多个账号用&分割
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

const {
    Env
} = require("../tools/env")
const $ = new Env("谷雨小程序");
const WeChatServer = require("./wcs.js");
let ckName = `guyu`;
const strSplitor = "#";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"
let wechat = new WeChatServer({
    url: process.env.wx_server_url || 'https://xxx',
    appid: 'wxda948f3be0afc375',
    auth: process.env.wx_auth || "",

}
);

class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.token = null
        this.wcsid = this.user[0]
        this.isSign = false
        this.shopId = '100186753'
        this.integralAccount = ''
        this.activityId = ''
    }

    async run() {
        //随机延迟5-30s 模拟人工操作
        await $.wait(Math.floor(Math.random() * 20 + 5) * 1000);
        let { data: codeRes } = await wechat.getCode(this.wcsid)
        if (codeRes.status) {
            await this.getUserToken(codeRes.data.code)
        }
        if (!this.token) {
            $.log(`账号[${this.index}] 获取用户Token失败❌`)
            return
        }
        await this.findSignActivity()
        await this.signIn()
        await this.getUserPoints()
    }
    async getUserToken(code) {
        // 这个接口和其他接口一样要过 sign 校验，直接裸发会被服务端判成 code:996 当前请求异常，
        // 所以必须走下面带 sign/ts/starttime 的 request()
        let options = {
            method: 'POST',
            url: 'https://mall-mobile-v6.vecrp.com/mobile/wxAppLogin',
            headers: {},
            data: {
                "code": "" + code,
                "appid": "wxda948f3be0afc375",
                "shopId": null,
                "envVersion": "release",
                "isEnterpriseWx": false,
                "scene": 1168,
                "referrerInfo": {
                    "appId": "wxda948f3be0afc375"
                }
            }
        };

        let {
            data: result
        } = await this.request(options);

        if (result?.success) {
            let info = result.result || {}
            this.token = info.mobileToken
            if (info.shopId) this.shopId = "" + info.shopId
            $.log(`🌸账号[${this.index}] 获取用户Token成功 门店:${info.shopName || this.shopId}`)
        } else {
            $.log(`🌸账号[${this.index}] 获取用户Token-失败:${result?.msg || result?.message}❌`)
        }
    }
    sha1(str) {
        return require("crypto").createHash("sha1").update(str).digest("hex");
    }
    request(options) {

        var sign,
            n = void 0
            , d = {},
            l = "R6WbJ830wNsEdjH9GumwKYiYxHz0K9QD",
            n = (new Date).getTime(),
            d = "post" === options.method || "POST" === options.method ? {
                body: JSON.stringify(options.data),
                secretKey: l,
                ts: n
            } : Object.assign({}, options.params, {
                secretKey: l,
                ts: n
            }),
            sign = this.sha1(function (e) {
                var t, a = [];
                for (t in e) {
                    var r = t + e[t];
                    a.push(r)
                }
                a.sort();
                var u = "";
                return a.map((function (e) {
                    "" === u ? u = e : u += e
                }
                )),
                    u
            }(d))
        let baseHeaders = {
            host: "mall-mobile-v6.vecrp.com",
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "appid": "wxda948f3be0afc375",
            "content-type": "application/json;charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf254173b) XWEB/19027",
            "sign": "" + sign,
            "starttime": "" + n,
            "token": "" + (this.token || ""),
            "ts": "" + n,
            "x-tracedid": "" + $.uuid(),
            "xweb_xhr": "1",
            "Referer": "https://servicewechat.com/wxda948f3be0afc375/65/page-frame.html",
        }
        options.headers = Object.assign(options.headers, baseHeaders)

        return axios.request(options)
    }
    // 签到活动是按年新建的(如「签到赚积分-2026年」)，写死 activityId 每年都会失效，
    // 这里用两个只读查询接口动态拿当前可参与的签到活动(activityType=3)
    async findSignActivity() {
        try {
            let { data: sys } = await this.request({
                method: 'GET',
                url: `https://mall-mobile-v6.vecrp.com/mobile/activity/common/queryIntegralSystemList`,
                params: { shopId: this.shopId, earnSpendType: 1 },
                headers: {},
            });
            this.integralAccount = (Array.isArray(sys?.result) ? sys.result[0]?.integralAccount : "") || ""

            let { data: list } = await this.request({
                method: 'POST',
                url: `https://mall-mobile-v6.vecrp.com/mobile/activity/common/queryActivityList`,
                headers: {},
                data: {
                    earnSpendType: 1,
                    shopId: this.shopId,
                    pageNo: 1,
                    pageSize: 10,
                    integralAccount: this.integralAccount,
                    activityType: 3,
                },
            });
            let rows = Array.isArray(list?.result) ? list.result : (list?.result?.data || list?.result?.rows || [])
            let activity = rows.find((item) => String(item.activityType) === "3" && item.canJoin !== false)
            if (activity?.activityId) {
                this.activityId = activity.activityId
                $.log(`🌸账号[${this.index}] 签到活动:${activity.title || activity.activityId}`)
            } else {
                $.log(`🌸账号[${this.index}] 未查到可参与的签到活动`)
            }
        } catch (e) {
            $.log(`🌸账号[${this.index}] 查询签到活动异常:${e.message || e}`)
        }
    }
    async signIn() {
        if (!this.activityId) {
            $.log(`🌸账号[${this.index}] 跳过签到:没有可用的签到活动`)
            return
        }
        // 先查本月已签日期，避免重复提交
        try {
            let now = new Date()
            let pad = (n) => ("" + n).padStart(2, "0")
            let ym = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
            let last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
            let { data: monthInfo } = await this.request({
                method: 'POST',
                url: `https://mall-mobile-v6.vecrp.com/mobile/activity/sign/querySignInfoList`,
                headers: {},
                data: { activityId: this.activityId, startDate: `${ym}-01`, endDate: `${ym}-${pad(last)}` },
            });
            let signed = monthInfo?.result?.signDateList || []
            if (signed.some((d) => ("" + d).slice(0, 10) === $.time('yyyy-MM-dd'))) {
                $.log(`🌸账号[${this.index}] 今日已签到`)
                this.isSign = true
                return
            }
        } catch (e) { }

        let options = {
            method: 'POST',
            url: `https://mall-mobile-v6.vecrp.com/mobile/activity/sign/sign`,

            headers: {},
            data: {
                activityId: this.activityId,
                shopId: this.shopId,
                signDate: $.time(`yyyy-MM-dd`),
            }

        };
        let {
            data: result
        } = await this.request(options);
        if (result?.success) {
            //打印签到结果
            this.isSign = true
            $.log(`🌸账号[${this.index}]` + `签到成功`);
        } else if (/已签|重复/.test("" + (result?.msg || ""))) {
            this.isSign = true
            $.log(`🌸账号[${this.index}] 今日已签到`)
        } else {
            $.log(`🌸账号[${this.index}] 签到-失败:${result?.msg}❌`)
        }




    }
    async getUserPoints() {
        let options = {
            method: 'GET',
            url: `https://mall-mobile-v6.vecrp.com/mobile/customer/getMyAllPoint`,
            params: {
                shopId: this.shopId
            },
            headers: {},

        }
        let {
            data: result
        } = await this.request(options);
        if (result?.success) {
            $.log(`账号[${this.index}]` + `积分:${result.result[0].score}`);
        } else {
            $.log(`账号[${this.index}] 获取积分-失败:${result.msg}❌`)
        }
    }








}

!(async () => {
    await getNotice()
    $.checkEnv(ckName);
    if (process.env['wx_server_url'] && process.env['wx_auth']) {
        for (let user of $.userList) {
            await new Task(user).run();
        }
    } else {

        $.log(`${ckName}未配置微信SERVER配置 搭建可看仓库目录下的readme.md❌`)
        return
    }

})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

async function getNotice() {
    try {
        let options = {
            url: `https://ghproxy.net/https://raw.githubusercontent.com/smallfawn/Note/refs/heads/main/Notice.json`,
            headers: {
                "User-Agent": defaultUserAgent,
            },
            timeout: 3000
        }
        let {
            data: res
        } = await axios.request(options);
        $.log(res)
        return res
    } catch (e) { }

}
