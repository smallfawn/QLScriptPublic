/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description:  
@cron: 30 8 * * *
------------------------------------------
益禾堂 qm-user-token
------------------------------------------

*/
window = {}
const {
    Env
} = require("../tools/env")
const $ = new Env("益禾堂");
let ckName = `yht`;
const strSplitor = "#";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.token = this.user[0];
        this.activityUrl = ''

    }

    async run() {

        await this.getLoginUrl()

        await this.getActivityToken()
        let key = await this.getActivityKey()
        await this.doSign(key)

    }
    async getLoginUrl() {
        let options = {
            method: 'POST',
            url: `https://webapi.qmai.cn/web/catering/crm/member/redirect`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf254173b) XWEB/19027',
                'Accept': 'v=1.0',
                'Content-Type': 'application/json',
                'xweb_xhr': '1',
                'gdt-vid': '',
                'work-staff-name': '',
                'channelcode': '',
                'work-wechat-userid': '',
                'qz-gtd': '',
                'qm-from-type': 'catering',
                'accept-language': 'zh-CN',
                'scene': '1101',
                'qm-from': 'wechat',
                'qm-user-token': '' + this.token,
                'work-staff-id': '',
                'multi-store-id': '',
                'store-id': '203009',
                'promotion-code': '',
                'sec-fetch-site': 'cross-site',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'referer': 'https://servicewechat.com/wx4080846d0cec2fd5/517/page-frame.html',
                'priority': 'u=1, i'
            },
            data: {
                "redirectUrl": "https://86019.activity-12.m.duiba.com.cn/chw/visual-editor/skins?id=203576",
                "appid": "wx4080846d0cec2fd5"
            }
        }
        let {
            data: result
        } = await axios.request(options);
        if (result.data && result.status) {
            this.activityUrl = result.data
            return result.data

        }



    }
    ObjectKeys2LowerCase(e) { return e = Object.fromEntries(Object.entries(e).map((([e, t]) => [e.toLowerCase(), t]))), new Proxy(e, { get: function (e, t, r) { return Reflect.get(e, t.toLowerCase(), r) }, set: function (e, t, r, n) { return Reflect.set(e, t.toLowerCase(), r, n) } }) }

    async getActivityToken() {


        const opts = {
            method: "GET",
            url: this.activityUrl,
            maxRedirects: 0,
            // 关键点 2: 默认 Axios 认为非 2xx 是错误，需定义 302 为合法状态
            validateStatus: function (status) {
                return status >= 200 && status < 400; // 允许 302 (或 3xx) 进入 .then
            },
            headers: {}
        }
        let res = await axios.request(opts);

        let headers = this.ObjectKeys2LowerCase(res?.headers);
        //对青龙进行兼容
        let session = Array.isArray(headers['set-cookie']) ? [...new Set(headers['set-cookie'])].join("") : headers['set-cookie'];

        let [wdata4, w_ts, _ac, wdata3, dcustom] = session.match(/(wdata4|w_ts|_ac|wdata3|dcustom)=.+?;/g)
        this.session = wdata4 + w_ts + _ac + wdata3 + dcustom;
        $.log(`✅ 获取活动token成功！`)



    }
    async getActivityKey() {

        let options = {
            method: 'POST',
            url: `https://86019-activity.dexfu.cn/chw/ctoken/getToken`,
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                'Cookie': this.session,
            },
            data: {
                timestamp: Date.now(),

            }

        }
        let {
            data: result
        } = await axios.request(options);
        if (result.success) {
            // 自动修复：将旧式八进制 (如 0123) 替换为现代写法 (0o123)
            // 匹配以 0 开头后面跟数字，且不含 x (十六进制) 或 b (二进制) 的部分
            const fixedCode = result.token.replace(/\b0([0-7]+)\b/g, '0o$1');
            eval(fixedCode)
            return window['df63acbt']

        }
    }
    async doSign(key) {
        let data = ({
            'signOperatingId': '342960319759351',
            'token': '' + key
        });

        let options = {
            method: 'POST',
            url: 'https://86019-activity.dexfu.cn/sign/component/doSign?_=' + Date.now(),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781 NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF XWEB/50249',
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/x-www-form-urlencoded',
                'origin': 'https://86019-activity.dexfu.cn',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'referer': 'https://86019-activity.dexfu.cn/sign/component/page?signOperatingId=342960319759351',
                'accept-language': 'zh-CN,zh;q=0.9',
                'Cookie': this.session
            },
            data: data
        };
        let {
            data: result
        } = await axios.request(options);
        console.log(result);
        
        /*if (result.success) {
            $.log(`✅ 签到成功！获得${result.data.signResult}积分`)
        }*/

    }
    /**
* 通用 eval 混淆解密函数（动态执行劫持）
* @param {string} obfuscatedCode - 原始的混淆代码
* @returns {string} - 解密后的真实代码
*/
    decryptByHookingEval(obfuscatedCode) {
        let decryptedCode = "";

        // 1. 备份系统原生的 eval
        const originalEval = globalThis.eval;

        try {
            // 2. 劫持全局 eval 函数
            globalThis.eval = function (payload) {
                decryptedCode = payload; // 将解密后的字符串保存下来
                // 重要：不往下执行原生的 eval，从而阻止危险/恶意代码实际运行
            };

            // 3. 构造一个沙箱函数并执行混淆代码的外壳
            // 外壳代码会执行所有的解密运算，并最终调用我们上面劫持的 eval()
            const runner = new Function(obfuscatedCode);
            runner();

        } catch (error) {
            console.error("执行解密外壳时发生错误:", error);
        } finally {
            // 4. 无论成功与否，务必恢复系统的 eval，避免影响其他正常业务
            globalThis.eval = originalEval;
        }

        return decryptedCode || "未能拦截到 eval 调用，可能代码结构不适用此方法。";
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
    console.log(`1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。`)
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