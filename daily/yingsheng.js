/*
------------------------------------------
@Author: 
@Date: 2024.06.07 19:15
@Description: 硬声APP的自动化任务程序
cron: 12 12 * * *
------------------------------------------
#Notice:
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
const $ = new Env("硬声");
let ckName = `yingsheng`;
const strSplitor = "#";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"
const CryptoJS = require('crypto-js');
let param_version = '2.8.0'
let salt = 'lw0270iBJzxXdJLRtePEENsauRzkHSqm'


let AES_key = 'q09cRVOPCnfJzt7p'
let AES_IV = 'cnry8k3o4WdCGU1T'
class Task {
    constructor(env) {
        this.index = $.userIdx++
        let user = env.split(strSplitor);
        this.name = user[0];
        this.passwd = user[1];
        this.auth = '';
        this.device_id = '07cdc486c91ca0457e4263cfa9667aa7od'
        this.valid = false;
        this.coins = 0;
        this.user_id = null;
        this.userIdList = [];          // 用于关注任务
        this.TASK_WAIT_TIME = 1000;    // 请求间隔
    }
    calculateSign(params, apiType) {

        params['Authorization'] = this.auth
        params['timestamp'] = Math.floor(new Date().getTime() / 1000)
        if (apiType == 'yingsheng') {
            params['platform'] = 'h5'
            console.log(salt + this.SHA1Encrypt($.jsonToStr(params, '&')) + this.auth)
            params['sign'] = this.SHA1Encrypt(salt + this.SHA1Encrypt($.jsonToStr(params, '&')) + this.auth)
        }
        if (apiType == 'ysapi') {
            params['platform'] = 'android'
            console.log($.jsonToStr(params, '&', true) + AES_IV + AES_key)
            console.log(AES_IV + AES_key + this.SHA1Encrypt($.jsonToStr(params, '&', true) + AES_IV + AES_key) + this.auth)
            params['sign'] = this.SHA1Encrypt(AES_IV + AES_key + this.SHA1Encrypt($.jsonToStr(params, '&', true) + AES_IV + AES_key) + this.auth)
        }
        params['version'] = param_version
        return {
            "Authorization": params['Authorization'],
            "timestamp": params['timestamp'],
            "platform": params['platform'],
            "sign": params['sign'],
            "version": params['version']
        }
    }
    SHA1Encrypt(message) {
        //实现SHA1 
        return CryptoJS.SHA1(message).toString();
    }

    EncryptCrypto(message) {
        return CryptoJS.AES.encrypt(
            CryptoJS.enc.Utf8.parse(message),
            CryptoJS.enc.Utf8.parse(AES_key),
            { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7, iv: CryptoJS.enc.Utf8.parse(AES_IV) }
        ).ciphertext.toString(CryptoJS.enc.Base64) + '\n';
    }
    async run() {
        console.log(`\n============= 账号[${this.name}] =============`)
        await this.login();
        if (!this.valid) return;
        console.log(`----------- 签到 -----------`)
        await $.wait(this.TASK_WAIT_TIME);
        await this.getSignStatus();
        console.log(`----------- 任务 -----------`)
        await $.wait(this.TASK_WAIT_TIME);
        await this.getTaskList();
        console.log(`----------- 积分 -----------`)
        await $.wait(this.TASK_WAIT_TIME);
        await this.getInfo();
    }

    async login() {
        try {
            let pwd = this.EncryptCrypto(this.passwd)
            console.log(pwd)
            let param = { 'account': this.name, 'password': pwd, 'device_id': this.device_id }
            let url = `https://ysapi.elecfans.com/api/sso/accountLogin`
            let body = $.jsonToStr(param, '&', true)
            let headersParams = this.calculateSign(param, 'ysapi')
            let options = {
                method: 'post',
                url,
                headers: {
                    ...headersParams,
                    "User-Agent": defaultUserAgent,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data: body
            }
            let { data: result } = await axios.request(options)
            if (result.code == 0) {
                this.valid = true
                this.name = result.data.mobile
                this.coins = result.data.coins
                this.auth = result.data.Authorization
                this.user_id = result.data.user_id
                console.log(`登录成功`)
                console.log(`手机：${this.name}`)
                console.log(`硬币：${this.coins}`)
            } else {
                console.log(`登录失败: ${JSON.stringify(result)}`)
            }
        } catch (e) {
            console.log(e)
        } finally { }
    }

    async getInfo() {
        try {
            let param = { 'user_id': this.user_id }
            let url = `https://ysapi.elecfans.com/api/member/getInfo?${$.jsonToStr(param, '&')}`
            let headersParams = this.calculateSign(param, 'ysapi')
            let options = {
                method: 'get',
                url,
                headers: {
                    ...headersParams,
                    "User-Agent": defaultUserAgent,
                },
            }
            let { data: result } = await axios.request(options)
            if (result.code == 0) {
                this.coins = result.data.coins
                console.log(`硬币：${this.coins}`)
            } else {
                console.log(`查询账户失败: ${result.message}`)
            }
        } catch (e) {
            console.log(e)
        }
    }

    async getSignStatus() {
        try {
            let param = { 'date': '' }
            let url = `https://yingsheng.elecfans.com/ysapi/wapi/activity/signin/data?${$.jsonToStr(param, '&')}`
            let headersParams = this.calculateSign(param, 'yingsheng')
            let options = {
                method: 'get',
                url,
                headers: {
                    ...headersParams,
                    "User-Agent": defaultUserAgent,
                },
            }
            let { data: result } = await axios.request(options)
            if (result.code == 0) {
                if (result.data.data.today_is_sign == 1) {
                    console.log(`今日已签到`)
                } else {
                    console.log(`今日未签到`)
                    await $.wait(this.TASK_WAIT_TIME);
                    await this.signin();
                }
            } else {
                console.log(`查询签到状态失败: ${result.message}`)
            }
        } catch (e) {
            console.log(e)
        }
    }

    async signin() {
        try {
            let param = { 'date': '' }
            let url = `https://yingsheng.elecfans.com/ysapi/wapi/activity/signin/signin`
            let body = JSON.stringify(param)
            let headersParams = this.calculateSign(param, 'yingsheng')
            let options = {
                method: 'post',
                url,
                headers: {
                    ...headersParams,
                    "User-Agent": defaultUserAgent,
                    "Content-Type": "application/json"
                },
                data: body
            }
            let { data: result } = await axios.request(options)
            if (result.code == 0) {
                console.log(`签到成功，获得${result.data.coins}硬币`)
            } else {
                console.log(`签到失败: ${result.message}`)
            }
        } catch (e) {
            console.log(e)
        }
    }

    // ---------- 任务相关方法 ----------
    async getTaskList() {
        try {
            let param = {}
            let url = `https://yingsheng.elecfans.com/ysapi/wapi/activity/task/dailyList`
            let headersParams = this.calculateSign(param, 'yingsheng')
            let options = {
                method: 'get',
                url,
                headers: {
                    ...headersParams,
                    "User-Agent": defaultUserAgent,
                },
            }
            let { data: result } = await axios.request(options)
            if (result.code == 0) {
                await $.wait(this.TASK_WAIT_TIME);
                await this.recommendList();   // 获取推荐用户列表用于关注任务
                for (let key in result.data) {
                    let task = result.data[key]
                    if (task.title.includes('发布作品') || task.title.includes('作品播放量')) continue;
                    if (task.title.indexOf('观看作品') > -1) {
                        for (let idx in task.step) {
                            if (task.step[idx].com_status == 12) {
                                await $.wait(this.TASK_WAIT_TIME);
                                await this.receiveCoin(task);
                                break;
                            } else if (task.step[idx].com_status != 13) {
                                await $.wait(this.TASK_WAIT_TIME);
                                await this.viewVideoAdd(idx);
                                await $.wait(this.TASK_WAIT_TIME);
                                await this.receiveCoin(task);
                                break;
                            }
                        }
                    } else {
                        for (let idx in task.step) {
                            let step = task.step[idx]
                            if (step.com_status == 10) {
                                await $.wait(this.TASK_WAIT_TIME);
                                await this.taskReceive(task);
                            }
                            if (step.com_status == 12) {
                                await $.wait(this.TASK_WAIT_TIME);
                                await this.receiveCoin(task);
                            } else if (step.com_status != 13) {
                                let num = step.condition < 25 ? (step.condition - step.finish_progress) : 1
                                let getReward = true;
                                for (let i = 0; i < num; i++) {
                                    if (task.title.indexOf('点赞') > -1) {
                                        let rndIdx = Math.floor(Math.random() * 2000) + 8000
                                        await $.wait(this.TASK_WAIT_TIME);
                                        await this.thumbsup(rndIdx);
                                        await $.wait(this.TASK_WAIT_TIME);
                                        await this.thumbsup(rndIdx);
                                    } else if (task.title.indexOf('观看直播') > -1) {
                                        await $.wait(this.TASK_WAIT_TIME);
                                        await this.finishLive();
                                    } else if (task.title.indexOf('关注') > -1) {
                                        let uid = this.userIdList[i] ? this.userIdList[i] : Math.floor(Math.random() * 100000) + 4900000
                                        await $.wait(this.TASK_WAIT_TIME);
                                        await this.doFollow(uid, 1);
                                        await $.wait(this.TASK_WAIT_TIME);
                                        await this.doFollow(uid, 2);
                                    } else {
                                        getReward = false;
                                    }
                                }
                                if (getReward) {
                                    await $.wait(this.TASK_WAIT_TIME);
                                    await this.receiveCoin(task);
                                }
                            }
                            break;
                        }
                    }
                }
            } else {
                console.log(`查询任务列表失败: ${result.message}`)
            }
        } catch (e) {
            console.log(e)
        }
    }

    async taskReceive(task) {
        try {
            let param = { 'type': task.type }
            let url = `https://yingsheng.elecfans.com/ysapi/wapi/activity/task/receive`
            let body = JSON.stringify(param)
            let headersParams = this.calculateSign(param, 'yingsheng')
            let options = {
                method: 'post',
                url,
                headers: {
                    ...headersParams,
                    "User-Agent": defaultUserAgent,
                    "Content-Type": "application/json"
                },
                data: body
            }
            let { data: result } = await axios.request(options)
            if (result.code == 0) {
                console.log(`开始任务[${task.title}]成功`)
            } else {
                console.log(`开始任务[${task.title}]失败: ${result.message}`)
            }
        } catch (e) {
            console.log(e)
        }
    }

    async receiveCoin(task) {
        try {
            let param = { 'type': task.type }
            let url = `https://yingsheng.elecfans.com/ysapi/wapi/activity/task/receiveCoin`
            let body = JSON.stringify(param)
            let headersParams = this.calculateSign(param, 'yingsheng')
            let options = {
                method: 'post',
                url,
                headers: {
                    ...headersParams,
                    "User-Agent": defaultUserAgent,
                    "Content-Type": "application/json"
                },
                data: body
            }
            let { data: result } = await axios.request(options)
            if (result.code == 0) {
                console.log(`领取任务[${task.title}]奖励获得${result.data.coins}硬币`)
            } else {
                console.log(`领取任务[${task.title}]奖励失败: ${result.message}`)
            }
        } catch (e) {
            console.log(e)
        }
    }

    async thumbsup(video_id) {
        try {
            let param = { 'video_id': video_id }
            let url = `https://ysapi.elecfans.com/api/video/publish/thumbsup`
            let body = $.jsonToStr(param, '&')
            let headersParams = this.calculateSign(param, 'ysapi')
            let options = {
                method: 'post',
                url,
                headers: {
                    ...headersParams,
                    "User-Agent": defaultUserAgent,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data: body
            }
            let { data: result } = await axios.request(options)
            if (result.code == 0) {
                console.log(`${result.data.msg}: video_id=${video_id}`)
            } else {
                console.log(`点赞[video_id=${video_id}]失败: ${result.message}`)
            }
        } catch (e) {
            console.log(e)
        }
    }

    async viewVideoAdd(step) {
        try {
            let param = { 'step': step }
            let url = `https://ysapi.elecfans.com/api/activity/task/viewVideo/add`
            let body = $.jsonToStr(param, '&')
            let headersParams = this.calculateSign(param, 'ysapi')
            let options = {
                method: 'post',
                url,
                headers: {
                    ...headersParams,
                    "User-Agent": defaultUserAgent,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data: body
            }
            let { data: result } = await axios.request(options)
            if (result.code == 0) {
                console.log(`刷新看视频进度[step=${step}]成功`)
            } else {
                console.log(`刷新看视频进度[step=${step}]失败: ${result.message}`)
            }
        } catch (e) {
            console.log(e)
        }
    }

    async finishLive() {
        try {
            let param = {}
            let url = `https://ysapi.elecfans.com/api/activity/task/live/finish`
            let headersParams = this.calculateSign(param, 'ysapi')
            let options = {
                method: 'post',
                url,
                headers: {
                    ...headersParams,
                    "User-Agent": defaultUserAgent,
                },
                data: ''
            }
            let { data: result } = await axios.request(options)
            if (result.code == 0) {
                console.log(`完成观看直播任务成功`)
            } else {
                console.log(`完成观看直播任务失败: ${result.message}`)
            }
        } catch (e) {
            console.log(e)
        }
    }

    async recommendList() {
        try {
            let param = { page: 1 }
            let url = `https://ysapi.elecfans.com/api/recommend/video/index?page=1`
            let headersParams = this.calculateSign(param, 'ysapi')
            let options = {
                method: 'get',
                url,
                headers: {
                    ...headersParams,
                    "User-Agent": defaultUserAgent,
                },
            }
            let { data: result } = await axios.request(options)
            if (result.code == 0) {
                for (let item of result.data.data) {
                    this.userIdList.push(item.user_id)
                }
            } else {
                console.log(`获取推荐列表失败: ${result.message}`)
            }
        } catch (e) {
            console.log(e)
        }
    }

    async doFollow(user_id, type) {
        try {
            let param = { 'user_id': user_id, 'type': type }
            let url = `https://ysapi.elecfans.com/api/member/follow`
            let body = $.jsonToStr(param, '&')
            let headersParams = this.calculateSign(param, 'ysapi')
            let options = {
                method: 'post',
                url,
                headers: {
                    ...headersParams,
                    "User-Agent": defaultUserAgent,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data: body
            }
            let { data: result } = await axios.request(options)
            let str = type == 1 ? '关注' : '取消关注'
            if (result.code == 0) {
                console.log(`${str}用户[${user_id}]成功`)
            } else {
                console.log(`${str}用户[${user_id}]失败: ${result.message}`)
            }
        } catch (e) {
            console.log(e)
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