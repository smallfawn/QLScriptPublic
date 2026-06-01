/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description:  海尔智家
cron: 30 7 * * *
------------------------------------------
#Notice:   
变量名hezj
变量值填写 wx_server 里的 openid/账号标识，多账户&或换行
需要配置 wx_server_url、wx_auth

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
const $ = new Env("海尔智家");
let ckName = `hezj`;
const strSplitor = "#";
const axios = require("axios");
const crypto = require("crypto");
const WeChatCodeServer = require("../wxapp/wcs");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"
const MINI_APP_ID = "wxe24b2f1f4e378891";
const PAGE_VERSION = "475";
const HA_APP_ID = "MB-SHEZJAPPWXXCX-0000";
const HA_APP_KEY = "79ce99cc7f9804663939676031b8a427";
const API_HOST = "https://zj.haier.net";

const wechat = new WeChatCodeServer({
    url: process.env.wx_server_url || "http://192.168.31.196:8787",
    appid: MINI_APP_ID,
    auth: process.env.wx_auth || "",
});

function sign256(path, body, timestamp) {
    const bodyStr = body ? JSON.stringify(body) : "";
    return crypto.createHash("sha256").update(path + bodyStr + HA_APP_ID + HA_APP_KEY + timestamp).digest("hex");
}

function maskToken(token = "") {
    if (!token) return "";
    return token.length > 14 ? `${token.slice(0, 6)}...${token.slice(-6)}` : token;
}


class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.openid = this.user[0].trim();
        this.token = "";
        this.clientId = `${Date.now()}${$.randomString(12)}`;

    }
    request(options) {
        const path = options.path || new URL(options.url).pathname;
        const timestamp = Date.now();
        let baseHeaers = {
            "host": "zj.haier.net",
            "Content-Type": "application/json;charset=UTF-8",
            "appId": HA_APP_ID,
            "appKey": HA_APP_KEY,
            "timestamp": timestamp,
            "platForm": "sc-mp-wx-zjapp",
            "ENV": "",
            "accessToken": options.isHeaderDelToken ? "" : this.token,
            "accountToken": options.isHeaderDelToken ? "" : this.token,
            "ak": options.isHeaderDelToken ? "" : this.token,
            "clientId": this.clientId,
            "accept": "*/*",
            "accept-language": "zh-CN,zh-Hans;q=0.9",
            "user-agent": defaultUserAgent,
            "referer": `https://servicewechat.com/${MINI_APP_ID}/${PAGE_VERSION}/page-frame.html`,
        }
        if (options.isSign256) {
            baseHeaers.sign = sign256(path, options.data, timestamp);
        }
        options.headers = Object.assign(baseHeaers, options.headers || {});
        delete options.path;
        delete options.isSign256;
        delete options.isHeaderDelToken;
        return axios.request(options)
    }

    async run() {
        await this.loginByWxCode();
        if (!this.token) return;
        await this.pointInfo()
        await this.signIn()
    }

    async getLoginCode() {
        if (!process.env.wx_auth) throw new Error("缺少 wx_auth，无法从 wx_server 获取 code");
        const { data } = await wechat.getCode(this.openid);
        const code = data?.code || data?.data?.code;
        if (!code) throw new Error(`wx_server 未返回 code: ${JSON.stringify(data)}`);
        return code;
    }

    async loginByWxCode() {
        try {
            const code = await this.getLoginCode();
            const tokenInfo = await this.jscode2session(code);
            const accountToken = tokenInfo?.accountToken;
            if (!accountToken) throw new Error(`登录响应未返回 accountToken: ${JSON.stringify(tokenInfo)}`);
            await this.queryUserInfo(accountToken);
            this.token = accountToken;
            $.log(`账号[${this.index}] CODE登录成功: ${maskToken(this.token)}`);
        } catch (e) {
            $.log(`账号[${this.index}] CODE登录失败: ${e.message || e}`);
        }
    }

    async jscode2session(code) {
        const path = "/api-gw/oauthserver/applet/v1/jscode2session";
        let options = {
            method: "POST",
            url: API_HOST + path,
            path,
            isSign256: true,
            isHeaderDelToken: true,
            data: { code },
        };
        const { data: result } = await this.request(options);
        if (result?.retCode !== "00000" && result?.code !== 200 && !result?.success) {
            throw new Error(result?.retInfo || result?.message || JSON.stringify(result));
        }
        return result?.data?.tokenInfo || result?.data || {};
    }

    async queryUserInfo(accountToken) {
        const path = "/api-gw/oauthserver/applet/v1/userinfo/query";
        let options = {
            method: "POST",
            url: API_HOST + path,
            path,
            isSign256: true,
            isHeaderDelToken: true,
            data: { accountToken },
        };
        const { data: result } = await this.request(options);
        if (result?.retCode !== "00000" && result?.code !== 200 && !result?.success) {
            throw new Error(result?.retInfo || result?.message || JSON.stringify(result));
        }
        const info = result?.data?.userinfo || {};
        const name = info.nickName || info.nickname || info.userName || "未知用户";
        const phone = info.mobile || info.phoneNumber || "";
        $.log(`账号[${this.index}] 用户: ${name}${phone ? ` ${phone.slice(0, 3)}****${phone.slice(-4)}` : ""}`);
        return info;
    }

    async pointInfo() {
        const path = "/zjapi/zjBaseServer/signDetail/getUserPointsAndWallet";
        let options = {
            method: 'POST',
            url: API_HOST + path,
            path,
            headers: {},
            data: {

            }
        };
        let { data: result } = await this.request(options);

        if (result.retCode == '00000') {
            $.log(`海贝：${result.data.haiBeiTotal}`)
            $.log(`红包：${result.data.wallet}`)
        } else {
            $.log(`查询余额失败: ${result.retInfo}`)
        }
    }

    async signIn() {
        const path = "/api-gw/zjBaseServer/daily/sign";
        let options = {
            method: 'POST',
            url: API_HOST + path,
            path,
            headers: {},
            data: {

            }
        };
        let { data: result } = await this.request(options);
        if (result?.retCode == '00000') {
            //打印签到结果
            $.log(`🌸账号[${this.index}]` + `🕊当前已签到${result.data.totalSignDay}天🎉`);
        } else {
            $.log(`🌸账号[${this.index}] 签到-失败:${result.retInfo}❌`)
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
	try {
		let options = {
			url: `https://ghproxy.net/https://raw.githubusercontent.com/smallfawn/Note/refs/heads/main/Notice.json`,
			headers: {
				"User-Agent": defaultUserAgent,
			},
            timeout:3000
		}
		let {
			data: res
		} = await axios.request(options);
		$.log(res)
		return res
	} catch (e) {}

}
