/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description:  荷叶健康小程序
cron: 30 10 * * *
------------------------------------------ 
#Notice:   
微信荷叶健康小程序 免费水果+打卡签到抽奖
抓tuan.api.ybm100.com/miniapp中请求头的token 多账户&或换行
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

global['window'] = {}
global['navigator'] = {}
const { JSEncrypt } = require("encryptlong")
const JsRsaSign = require("jsrsasign")
const { Env } = require("./tools/env")
const $ = new Env("荷叶健康小程序");
let ckName = `hyjk`;
const strSplitor = "#";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.token = this.user[0];
        this.channelCode = this.user[1] || process.env.HYJK_CHANNEL_CODE || "130";
        this.userFlag = false
        this.userId = ''
        this.headers = {
            "host": "tuan.api.ybm100.com",
            "userid": "" + this.userId,
            "referer": "https://www.heyejk.com/",
            "apptype": "1",
            "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_15 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.70(0x18004630) NetType/WIFI Language/zh_CN miniProgram/wx776afedbfae3a228",
            "appversion": "3.1.7",
            "origin": "https://www.heyejk.com",
            "sec-fetch-dest": "empty",
            "sec-fetch-site": "cross-site",
            "terminal": "h5",
            "usertype": "groupuser",
            "appname": "ykq-xcx",
            "token": "" + this.token,
            "accept-language": "zh-CN,zh-Hans;q=0.9",
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json;charset=UTF-8",
            "accept-encoding": "gzip, deflate, br",
            "sec-fetch-mode": "cors"
        }
    }

    async run() {
        await this.getFruitInfo()
        await this.autoByUserOperation()
        await this.getSignInfo()
    }

    async getSignInfo() {
        let options = {
            method: 'POST',
            url: `https://tuan.api.ybm100.com/miniapp/marketing/signActivity/signRecord`,
            headers: this.headers,
            data: { "actId": "9093", "channelCode": this.channelCode, "adornId": "217" }
        };
        let { data: result } = await axios.request(options);
        if (result.code == 0) {
            const isSigned = result?.result?.todaySignStatusDesc === "已签到";
            $.log(`[账号${this.index}] 今日签到: ${isSigned ? "已签到" : "未签到"}`)
            if (!isSigned) {
                await this.doSign()
            }
        } else {
            $.log(`[账号${this.index}] 获取签到状态失败[${result.msg}]`);
        }
    }

    async doSign() {
        let options = {
            method: 'POST',
            url: `https://tuan.api.ybm100.com/miniapp/marketing/signActivity/sign`,
            headers: this.headers,
            data: { "actId": "9093", "channelCode": this.channelCode, "adornId": "217" }
        };
        let { data: result } = await axios.request(options);
        if (result?.code == '0') {
            $.log(`[账号${this.index}] 签到成功[${result.msg}]`);
        } else {
            $.log(`[账号${this.index}] 签到失败:${result.msg}`)
        }
    }

    async getFruitInfo() {
        let options = {
            method: 'GET',
            url: `https://tuan.api.ybm100.com/api/healthSquare/fruitManor/getMyManorInfo?channelCode=${this.channelCode}`,
            headers: this.headers,
        };
        let { data: result } = await axios.request(options);
        if (result.code == 0) {
            $.log(`[账号${this.index}]  [${result.result.kettleWater}]-[${result.result.progressBarTips}]`)
            this.treeId = Number(result.result.treeId)
            this.userId = result.result.userId
            this.headers.userid = String(this.userId || "")
            this.todayFullWaterTaskId = Number(result?.result?.todayFullWaterTaskId || 0)
            for (let i = 0; i < Math.floor(Number(result.result.kettleWater) / 10); i++) {
                await $.wait(3000)
                await this.doWater()
            }
        } else {
            $.log(`[账号${this.index}]  查询失败[${result.msg}]`);
        }
    }
    async doWater() {
        try {
            let data = { "channelCode": this.channelCode, "treeId": this.treeId, "nonce": $.randomString(6) }
            let options = {
                method: 'POST',
                url: `https://tuan.api.ybm100.com/api/healthSquare/water/watering?secret=${encodeURIComponent(this.encrypt(data))}`,
                headers: this.headers,
                data: data
            }
            let { data: result } = await axios.request(options);
            if (result?.code == 0) {
                $.log(`账号${this.index}]  浇水[${result.result.progressBarTips}]`)
            } else {
                $.log(`账号${this.index}]  胶水[${result.msg}]`);
            }
        } catch (e) {

        }



    }

    async request(options) {
        const finalOptions = {
            timeout: Number(process.env.HYJK_HTTP_TIMEOUT || 15000),
            ...options,
            headers: {
                ...this.headers,
                ...(options.headers || {})
            }
        };
        return axios.request(finalOptions);
    }

    async userOperation(operateType, operateValueObj) {
        const data = {
            operateType,
            operateValue: JSON.stringify(operateValueObj),
            channelCode: this.channelCode
        };
        const { data: result } = await this.request({
            method: "POST",
            url: "https://tuan.api.ybm100.com/api/healthSquare/user/userOperation",
            data
        });
        return result;
    }

    async getTaskListNew() {
        const { data: result } = await this.request({
            method: "GET",
            url: `https://tuan.api.ybm100.com/api/healthSquare/task/getTaskListNew?channelCode=${this.channelCode}&venueId=5`
        });

        return result;
    }

    async getPopupList() {
        const { data: result } = await this.request({
            method: "GET",
            url: `https://tuan.api.ybm100.com/api/healthSquare/fruitManor/getPopup`,
            params: {
                channelCode: this.channelCode,
                entranceType: 0
            }
        });
        return result;
    }

    async getVenueInfo() {
        const { data: result } = await this.request({
            method: "GET",
            url: `https://tuan.api.ybm100.com/api/healthSquare/fruitManor/getVenueInfo`,
            params: { channelCode: this.channelCode }
        });
        return result;
    }

    async getBlindBoxInfo(taskId) {
        const { data: result } = await this.request({
            method: "GET",
            url: `https://tuan.api.ybm100.com/api/healthSquare/task/getBlindBoxInfo`,
            params: {
                channelCode: this.channelCode,
                taskId
            }
        });
        return result;
    }

    async collectWater(payload) {
        const data = {
            channelCode: this.channelCode,
            nonce: $.randomString(6),
            ...payload
        };
        const secret = encodeURIComponent(this.encrypt(data));
        const { data: result } = await this.request({
            method: "POST",
            url: `https://tuan.api.ybm100.com/api/healthSquare/water/collectWater?secret=${secret}`,
            data
        });
        return result;
    }

    async goFruitOrGarden(taskId) {
        const { data: result } = await this.request({
            method: "POST",
            url: `https://tuan.api.ybm100.com/healthSquare/herbalGarden/goFruitOrGarden`,
            data: {
                channelCode: this.channelCode,
                taskId: Number(taskId)
            }
        });
        return result;
    }

    flattenTaskList(taskResult) {
        if (!taskResult || taskResult.code !== 0) return [];
        const root = taskResult.result;
        if (Array.isArray(root)) return root;
        if (Array.isArray(root?.list)) {
            if (root.list.some(item => item && Object.prototype.hasOwnProperty.call(item, "taskId"))) {
                return root.list;
            }
            return root.list.flatMap(group => Array.isArray(group?.taskList) ? group.taskList : []);
        }
        return [];
    }

    async autoByUserOperation() {
        await this.autoTodayFullWaterTask();
        await this.autoPopups();
        await this.autoVenueClicks();
        await this.autoTasks();
    }


    async autoTodayFullWaterTask() {
        try {
            if (!this.todayFullWaterTaskId) return;
            const opRes = await this.userOperation(6, { taskId: this.todayFullWaterTaskId, status: 1 });
            $.log(`[账号${this.index}] fullWater(taskId=${this.todayFullWaterTaskId}) 上报: ${opRes?.msg || opRes?.code}`);
            await $.wait(500);
        } catch (e) {
            $.log(`[账号${this.index}] fullWater自动化异常: ${e.message}`);
        }
    }
    async autoPopups() {
        try {
            const popupRes = await this.getPopupList();
            const list = Array.isArray(popupRes?.result?.list) ? popupRes.result.list : [];
            for (const popup of list) {
                const payload = {
                    popupType: Number(popup?.popupType || 0),
                    waterNum: Number(popup?.waterNum || 0)
                };
                const opRes = await this.userOperation(7, payload);
                $.log(`[账号${this.index}] popupType=${payload.popupType} 上报: ${opRes?.msg || opRes?.code}`);
                await $.wait(500);
            }
        } catch (e) {
            $.log(`[账号${this.index}] popup自动化异常: ${e.message}`);
        }
    }

    async autoVenueClicks() {
        try {
            const venueRes = await this.getVenueInfo();
            const list = Array.isArray(venueRes?.result?.list) ? venueRes.result.list : [];
            for (const venue of list) {
                if (Number(venue?.clickStatus) === 0 && venue?.id) {
                    const opRes = await this.userOperation(10, { venueId: Number(venue.id) });
                    $.log(`[账号${this.index}] venueId=${venue.id} 上报: ${opRes?.msg || opRes?.code}`);
                    await $.wait(500);
                }
            }
        } catch (e) {
            $.log(`[账号${this.index}] venue自动化异常: ${e.message}`);
        }
    }

    normalizeTaskNumber(value, fallback = 0) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    resolveTaskEventType(item) {
        const taskType = this.normalizeTaskNumber(item?.taskType);
        const browseType = this.normalizeTaskNumber(item?.browseType);
        const waterEventType = this.normalizeTaskNumber(item?.waterEventType);
        if (taskType === 50) {
            if (browseType === 1) return 11;
            if (browseType === 2) return 12;
            if (browseType === 3) return 13;
            return 11;
        }
        if (taskType === 60 || taskType === 61) return 7;
        if (taskType === 70) return 5;
        if (taskType === 80) return 3;
        if (taskType === 90) return 4;
        if (taskType === 110 || taskType === 120) return waterEventType || 0;
        return waterEventType || this.normalizeTaskNumber(item?.eventType);
    }

    resolveTaskWaterNum(item) {
        const raw = [
            item?.reward,
            item?.waterNum,
            item?.waterConf,
            item?.taskRewardNum
        ];
        for (const value of raw) {
            const n = Number(value);
            if (Number.isFinite(n) && n > 0) return n;
        }
        return undefined;
    }

    async claimTaskWater(item, tag = "claim") {
        const taskId = this.normalizeTaskNumber(item?.taskId);
        const eventType = this.resolveTaskEventType(item);
        if (!eventType) {
            $.log(`[账号${this.index}] ${tag} taskId=${taskId} 跳过: 缺少eventType(taskType=${this.normalizeTaskNumber(item?.taskType)})`);
            return;
        }
        const payload = {
            extTask: 0,
            eventType
        };
        if (taskId) payload.taskId = taskId;
        const waterNum = this.resolveTaskWaterNum(item);
        if (waterNum) payload.waterNum = waterNum;
        const res = await this.collectWater(payload);
        $.log(`[账号${this.index}] ${tag} collectWater(taskId=${taskId},eventType=${eventType},waterNum=${waterNum || 0}): ${res?.msg || res?.code}`);
    }

    logTaskItem(item, prefix = "task") {
        const taskId = this.normalizeTaskNumber(item?.taskId);
        const taskType = this.normalizeTaskNumber(item?.taskType);
        const taskStatus = this.normalizeTaskNumber(item?.taskStatus);
        const browseType = this.normalizeTaskNumber(item?.browseType);
        const waterEventType = this.normalizeTaskNumber(item?.waterEventType);
        $.log(`[账号${this.index}] ${prefix} taskId=${taskId}, taskType=${taskType}, taskStatus=${taskStatus}, browseType=${browseType}, waterEventType=${waterEventType}`);
    }

    buildBrowseSecondsCandidates(item) {
        const candidates = [];
        const maybeSeconds = [
            item?.seconds,
            item?.browseSeconds,
            item?.needSeconds,
            item?.taskSeconds,
            process.env.HYJK_BROWSE_SECONDS
        ];
        for (const v of maybeSeconds) {
            const n = Number(v);
            if (Number.isFinite(n) && n >= 0) candidates.push(n);
        }
        candidates.unshift(0, 20, 30, 60);
        return [...new Set(candidates.filter(n => Number.isFinite(n) && n >= 0))];
    }

    resolveBrowseTargetSeconds(item) {
        const maybe = [
            item?.needSeconds,
            item?.seconds,
            item?.browseSeconds,
            item?.taskSeconds,
            process.env.HYJK_BROWSE_SECONDS
        ];
        for (const v of maybe) {
            const n = Number(v);
            if (Number.isFinite(n) && n > 0) return n;
        }
        return 20;
    }

    async autoBrowseTask(item) {
        const taskId = this.normalizeTaskNumber(item?.taskId);
        const targetSeconds = this.resolveBrowseTargetSeconds(item);
        const waitPadding = Number(process.env.HYJK_BROWSE_WAIT_PADDING || 1);

        const startRes = await this.userOperation(5, { taskId, seconds: 0 });
        $.log(`[账号${this.index}] 浏览任务(taskId=${taskId}) 起始上报seconds=0: ${startRes?.msg || startRes?.code}`);

        const waitMs = Math.max(0, Math.floor((targetSeconds + waitPadding) * 1000));
        if (waitMs > 0) {
            $.log(`[账号${this.index}] 浏览任务(taskId=${taskId}) 等待${Math.floor(waitMs / 1000)}秒以满足停留时长`);
            await $.wait(62);
        }

        const targetRes = await this.userOperation(5, { taskId, seconds: targetSeconds });
        $.log(`[账号${this.index}] 浏览任务(taskId=${taskId}) 目标上报seconds=${targetSeconds}: ${targetRes?.msg || targetRes?.code}`);

        const secondsCandidates = this.buildBrowseSecondsCandidates(item).filter(s => s !== 0 && s !== targetSeconds);
        for (const seconds of secondsCandidates) {
            const opRes = await this.userOperation(5, { taskId, seconds });
            $.log(`[账号${this.index}] 浏览任务(taskId=${taskId}) 兜底上报seconds=${seconds}: ${opRes?.msg || opRes?.code}`);
            await $.wait(400);
        }
    }

    async autoTasks() {
        try {
            const firstTaskRes = await this.getTaskListNew();
            const firstTaskList = this.flattenTaskList(firstTaskRes);
            $.log(`[账号${this.index}] taskList数量: ${firstTaskList.length}`);
            for (const item of firstTaskList) {
                const taskType = Number(item?.taskType);
                const taskStatus = Number(item?.taskStatus);
                const taskId = Number(item?.taskId);
                if (!taskId) continue;
                this.logTaskItem(item, "scan");

                if (taskType === 50 && (taskStatus === 0 || taskStatus === 3)) {
                    await this.autoBrowseTask(item);
                    continue;
                }

                if (taskType === 70 && taskStatus === 0) {
                    const opRes = await this.userOperation(9, { taskId });
                    $.log(`[账号${this.index}] task70(taskId=${taskId}) 上报: ${opRes?.msg || opRes?.code}`);
                    await $.wait(500);
                    continue;
                }

                if (taskType === 80 && (taskStatus === 0 || taskStatus === 3)) {
                    await this.autoBlindBox(taskId);
                    continue;
                }

                if ((taskType === 60 || taskType === 61) && taskStatus === 0) {
                    await this.claimTaskWater(item, "task60/61直领");
                    await $.wait(500);
                    continue;
                }

                if (taskType === 90 && (taskStatus === 0 || taskStatus === 3)) {
                    await this.claimTaskWater(item, "task90直领");
                    await $.wait(500);
                    continue;
                }

                if ((taskType === 110 || taskType === 120) && (taskStatus === 0 || taskStatus === 3)) {
                    const jumpRes = await this.goFruitOrGarden(taskId);
                    $.log(`[账号${this.index}] task${taskType}(taskId=${taskId}) goFruitOrGarden: ${jumpRes?.msg || jumpRes?.code}`);
                    await $.wait(500);
                    continue;
                }

                if (taskStatus === 1) {
                    await this.claimTaskWater(item, "立即领奖");
                    await $.wait(500);
                    continue;
                }

                if (taskStatus !== 2 && taskStatus !== 10000) {
                    $.log(`[账号${this.index}] 未适配任务: taskType=${taskType}, taskStatus=${taskStatus}, taskId=${taskId}`);
                }
            }

            const secondTaskRes = await this.getTaskListNew();
            const secondTaskList = this.flattenTaskList(secondTaskRes);
            for (const item of secondTaskList) {
                const taskStatus = this.normalizeTaskNumber(item?.taskStatus);
                if (taskStatus !== 1) continue;
                await this.claimTaskWater(item, "二次领奖");
                await $.wait(500);
            }
        } catch (e) {
            $.log(`[账号${this.index}] task自动化异常: ${e.message}`);
        }
    }

    async autoBlindBox(taskId) {
        try {
            const boxRes = await this.getBlindBoxInfo(taskId);
            const boxList = Array.isArray(boxRes?.result) ? boxRes.result : [];
            for (const box of boxList) {
                if (Number(box?.status) === 0 || Number(box?.status) === 1) {
                    const blindBoxId = Number(box?.blindBoxId);
                    if (!blindBoxId) continue;
                    const opRes = await this.userOperation(4, { taskId, blindBoxId });
                    $.log(`[账号${this.index}] 盲盒(taskId=${taskId}, blindBoxId=${blindBoxId}) 上报: ${opRes?.msg || opRes?.code}`);
                    await $.wait(500);
                }
            }
        } catch (e) {
            $.log(`[账号${this.index}] 盲盒自动化异常(taskId=${taskId}): ${e.message}`);
        }
    }
    encrypt(body) {


        const PUBLIC_KEY = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCiBksv2xaOJdSWblaTQl93HI393gYHqKFs89EIFBWYSmYSV+z8XXzMO/Xyo8EeWRpAjT5TuBf0wN467aBx3nsDfJd7e3+txBS7nf+S7Nyjnxx2J5AKPWx1gVmr/OF3aWqxg+DPCB7avakhj+p0QjoJ7eMqgJl/HSX2Kfb6/O3J9wIDAQAB";
        const PRIVATE_KEY = "MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAKIGSy/bFo4l1JZuVpNCX3ccjf3eBgeooWzz0QgUFZhKZhJX7PxdfMw79fKjwR5ZGkCNPlO4F/TA3jrtoHHeewN8l3t7f63EFLud/5Ls3KOfHHYnkAo9bHWBWav84XdparGD4M8IHtq9qSGP6nRCOgnt4yqAmX8dJfYp9vr87cn3AgMBAAECgYEAlwzbB5Bu5LKsEFppZ/wW2ArM7YIRiQ5TACoGFEv1HfcuVaeXDmdxs02rKzwzDEHxUYDcPFyCKPGtvK5QSBgsAUUBHb6uu0fNGUccGX31NRAfLuQ8fj3W0uvkoYlpDARuokDHhWNqWzI6f8bFHkewJwpjXCO8w1WkogTLiX9Gu3ECQQDd5J4jEDS5+7KaohYRoryyX939mzsZ4RC6ufsfzTJwSlnLyYHEbm0Cs+7gbBxRrioqApBMQPIIoa5ujm1C88MNAkEAuu3htlbpR1ZL9b3wUuf3el/D3i/k9XvSChfHQ1q46Y/eck2yEDH9Kv/ZUxEl4fR8mB2MONm9oc2l+chPd9uQEwJBALcWuNU9vgPoB0tIiuUqXoDgUY+80ltcNi2c3/Uxn3jAIK/iKU0nwJMGXQiYrBVJnEjlrKL+w7cTkZZvtwATmtECQC2JV4vQvkFHj3eMzqeTpKDmBVPx/OekQzV8N2l8B0G2b20O6kqxssevzeRDcCQMJ/HyeL88o8pvy3f+yQUcsosCQQDZXV8K7Ek0R/V3dAdUzoetFSlfjCGy9QKPruz7m+iXBASxiA0R7YGfJzc8jWpuv0pxujtB/awy22K/ggLAhkZU";

        const JAVA_PUBLIC_KEY = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDNQpS4ZeHRiIPFIdZgupShTHFlGOqFkT6XEqByvWqt2BvLo3a+YfzyJHOXyfX41OvbIkuIaycuxU9w7RHI1e7F3O7Io+XxncjyU3GR+ae2DEtLaG3o/rtpONF5q1jTN/Spu4GKXsjhHrP9xxMThLF6134NKAyQZfvOms0gS0zmxwIDAQAB"
        const JAVA_PRIVATE_KEY = "MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAM1ClLhl4dGIg8Uh1mC6lKFMcWUY6oWRPpcSoHK9aq3YG8ujdr5h/PIkc5fJ9fjU69siS4hrJy7FT3DtEcjV7sXc7sij5fGdyPJTcZH5p7YMS0tobej+u2k40XmrWNM39Km7gYpeyOEes/3HExOEsXrXfg0oDJBl+86azSBLTObHAgMBAAECgYA08JI5CRX4G/SYeIS5SAYjn/qzL3z1XCO/hS9ayJ3mHpH0sMFkkxNRRLOHl7BYMFpwl2TR14kwl/VIU+y9VugRK6Se/gdJ/jwGiMdVkO6tGD7s8TwLcgNjAVbwpZCq40h8dQazzyIsPxyww4AP9fQlo5x3eY9v8icw+U58fj4FcQJBAPk4PPCy54ZHMqSTl4E1z+QzZ51z07PFIbGsT/oAg9GOwFjrPjOTQDEPp3cBeAlKmWdUVAjdGYExwuCw4EkG/XkCQQDS2Cx09pwNwMWIN+u3CVneECXS3iUiRPGJkbliFczwjByk3DnBMW15wGNVtJfsM7YFOIir+hW+QfbCKSBjxTY/AkEArPam9LZ1kO/g6e+0+mwKeGpkwxYcG2v5UoIwj2XEFrBoNk4twUW1C1e99g4C7Q/lH52bJPuuM8gBZEfdoVFEoQJBALZ4CPlsVx973jeGFcPBHvoURXeZcs+WlOY2rBYbwdHHoB54zK7KZPECM7V/Zh8vnW4lP/p9owWVtsTPrM1LZicCQDhgvSmpBy0QoUI+wPS9l+YYuLc2loGoWU97RiFbgKqXBexnSg4UHfU8Ot6N4VbIWEhOZV27P0ktsI3UfjGNS6s="

        // 鐢熸垚闅忔満涓?
        function generateRandomString(length) {
            var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // 鍖呭惈鎵€鏈夊瓧姣嶅拰鏁板瓧鐨勫瓧绗﹂泦鍚?
            var result = '';

            for (var i = 0; i < length; i++) {
                var randomIndex = Math.floor(Math.random() * chars.length); // 鑾峰彇闅忔満绱㈠紩鍊?
                var charAtIndex = chars[randomIndex]; // 鏍规嵁绱㈠紩鍊间粠瀛楃闆嗗悎涓€夋嫨瀵瑰簲鐨勫瓧绗?

                result += charAtIndex; // 灏嗗瓧绗︽坊鍔犲埌鏈€缁堢粨鏋滀腑
            }

            return result;
        }
        // 鍙傛暟瀛楀吀琛ㄦ帓搴?
        function sortedKeys(obj) {
            let keys = Object.keys(obj).sort();
            let res = {}
            keys.forEach(key => {
                res[key] = obj[key]
            })
            return res
        }
        function generateRsaKeyWithPKCS8() {
            const keyPair = JsRsaSign.KEYUTIL.generateKeypair("RSA", 1024);
            const privateKey = JsRsaSign.KEYUTIL.getPEM(keyPair.prvKeyObj, "PKCS8PRV");
            const publicKey = JsRsaSign.KEYUTIL.getPEM(keyPair.pubKeyObj);
            return { privateKey, publicKey };
        }
        const { privateKey, publicKey } = generateRsaKeyWithPKCS8()

        function objToStr(data) {
            let str = ""
            for (let i in data) {
                str += `${i}=${data[i]}&`
            }
            str = str.slice(0, str.length - 1)
            return str
        }
        // 鐢熸垚绛惧悕
        function getSign(data) {
            const signature = new JsRsaSign.KJUR.crypto.Signature({
                alg: "SHA1withRSA",
            });
            signature.init("-----BEGIN PRIVATE KEY-----" + PRIVATE_KEY + "-----END PRIVATE KEY-----");
            let sortData = sortedKeys(data)
            let str = objToStr(sortData)
            signature.updateString(str);
            return JsRsaSign.hextob64(signature.sign());
        }
        function getKey() {
            const encryptor = new JSEncrypt()
            encryptor.setPublicKey("-----BEGIN PUBLIC KEY-----" + JAVA_PUBLIC_KEY + "-----END PUBLIC KEY-----") // 璁剧疆鍏挜
            return encryptor
        }

        // 鐢熸垚鍔犲瘑
        function entryData(data) {
            let encryptor = getKey();
            let str = objToStr(data)
            return encryptor.encryptLong(str);    // 璋冪敤灏佽鐨勬柟娉?
        }

        // 瑙ｅ瘑
        function decrypt(data) {
            const encryptor = new JSEncrypt()
            encryptor.setPrivateKey(PRIVATE_KEY)
            return encryptor.decryptLong(data)
        }
        let sign = getSign(body)
        let timestamp = new Date().getTime()
        return entryData({
            sign: sign,
            timestamp: timestamp
        })
        //from by https://www.heyejk.com/game 

        /*const t = body
        const { KJUR, hextob64 } = require("jsrsasign")
        global['window'] = {}
        global['navigator'] = {}
        const { JSEncrypt } = require("encryptlong")
        const te = "MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAKIGSy/bFo4l1JZuVpNCX3ccjf3eBgeooWzz0QgUFZhKZhJX7PxdfMw79fKjwR5ZGkCNPlO4F/TA3jrtoHHeewN8l3t7f63EFLud/5Ls3KOfHHYnkAo9bHWBWav84XdparGD4M8IHtq9qSGP6nRCOgnt4yqAmX8dJfYp9vr87cn3AgMBAAECgYEAlwzbB5Bu5LKsEFppZ/wW2ArM7YIRiQ5TACoGFEv1HfcuVaeXDmdxs02rKzwzDEHxUYDcPFyCKPGtvK5QSBgsAUUBHb6uu0fNGUccGX31NRAfLuQ8fj3W0uvkoYlpDARuokDHhWNqWzI6f8bFHkewJwpjXCO8w1WkogTLiX9Gu3ECQQDd5J4jEDS5+7KaohYRoryyX939mzsZ4RC6ufsfzTJwSlnLyYHEbm0Cs+7gbBxRrioqApBMQPIIoa5ujm1C88MNAkEAuu3htlbpR1ZL9b3wUuf3el/D3i/k9XvSChfHQ1q46Y/eck2yEDH9Kv/ZUxEl4fR8mB2MONm9oc2l+chPd9uQEwJBALcWuNU9vgPoB0tIiuUqXoDgUY+80ltcNi2c3/Uxn3jAIK/iKU0nwJMGXQiYrBVJnEjlrKL+w7cTkZZvtwATmtECQC2JV4vQvkFHj3eMzqeTpKDmBVPx/OekQzV8N2l8B0G2b20O6kqxssevzeRDcCQMJ/HyeL88o8pvy3f+yQUcsosCQQDZXV8K7Ek0R/V3dAdUzoetFSlfjCGy9QKPruz7m+iXBASxiA0R7YGfJzc8jWpuv0pxujtB/awy22K/ggLAhkZU",
            ne = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDNQpS4ZeHRiIPFIdZgupShTHFlGOqFkT6XEqByvWqt2BvLo3a+YfzyJHOXyfX41OvbIkuIaycuxU9w7RHI1e7F3O7Io+XxncjyU3GR+ae2DEtLaG3o/rtpONF5q1jTN/Spu4GKXsjhHrP9xxMThLF6134NKAyQZfvOms0gS0zmxwIDAQAB";
        let n = le(t)
        let o = (new Date).getTime()
        return he({ sign: n, timestamp: o })
        function ae(e) { let t = Object.keys(e).sort(), n = {}; return t.forEach(t => { n[t] = e[t] }), n }
        function de() { const e = new JSEncrypt(); return e.setPublicKey("-----BEGIN PUBLIC KEY-----" + ne + "-----END PUBLIC KEY-----"), e }
        function ce(e) { let t = ""; for (let n in e) t += `${n}=${e[n]}&`; return t = t.slice(0, t.length - 1), t }
        function he(e) { let t = de(), n = ce(e); return t.encryptLong(n) }
        function le(e) { const t = new KJUR.crypto.Signature({ alg: "SHA1withRSA" }); t.init("-----BEGIN PRIVATE KEY-----" + te + "-----END PRIVATE KEY-----"); let n = ae(e), o = ce(n); return t.updateString(o), hextob64(t.sign()) }*/
    }

}

!(async () => {
    await getNotice().catch(e => $.log(`[Notice失败] ${e.message}`))
    $.checkEnv(ckName);

    for (let user of $.userList) {
        await new Task(user).run();
    }
})()
    .catch((e) => console.log(e))
    .finally(async () => {
        try {
            await $.done();
        } catch (e) {
            console.log(e.message || e);
            process.exit(1);
        }
    });

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












