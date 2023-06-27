/**
 * 得物农场
 * cron 10 8,12,18,22 * * *  dwnc.js
 * scriptVersionNow = "0.0.1"
 * 22/11/29   浇水 签到 领取水滴 气泡水滴
 * rewrite 23/5/4 author:XL
 * 23-6-21 修改部分代码
 * ========= 青龙--配置文件 ===========
 * # 得物农场
 * export dwnc_data='x-auth-token   &    SK   &   shumeiId   &   uuid '
 * 
 * 四个参数缺一不可
 * 得物APP => 购物 => 上方推荐 - 免费领好礼     抓app.dewu.com域名下headers参数                   找不到UUID 就是 deviceId
 * 找不到的话去 我 => 星愿森林 进入活动          抓app.dewu.com域名下headers参数                 x-auth-token去掉bearer
 * 抓app.dewu.com域名下headers参数               抓app.dewu.com域名下headers参数              x-auth-token   &    SK   &   shumeiId   &   uuid 多账号 @ 分割
 * ====================================
 *  
 */


const $ = new Env("得物农场");
const ckName = "dwnc_data";
//-------------------- 一般不动变量区域 -------------------------------------
const notify = $.isNode() ? require("./sendNotify") : "";
const Notify = 1;		 //0 关闭通知     1 打开通知
let envSplitor = ["@", "\n"]; //多账号分隔符
let msg;
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
let shareCodeArr = []
let scriptVersionLatest; //最新版本
let scriptVersionNow = '0.0.1'; //现在版本
//---------------------- 自定义变量区域 -----------------------------------
let ua = 'duapp/5.4.5(android;10)'
let deviceTrait = 'MI+8+Lite'
let channel = 'xiaomi'
let UserAgent = 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36/duapp/5.4.5(android;10)'
//---------------------------------------------------------

async function start() {
    await getVersion('smallfawn/QLScriptPublic/main/dwnc.js')
    console.log(`\n============ 当前版本：${scriptVersionNow} 📌 最新版本：${scriptVersionLatest} ============`);
    console.log(`获取首账号助力码`);
    taskall = [];
    for (let user of userList) {
        if (user.index == 1) {
            //await $.wait(3000)
            taskall.push(await user.share_code());
        }
    }
    await Promise.all(taskall);
    shareCodeArr[0] = getMiddleValue('œ', 'œ', shareCodeArr[0])
    console.log(shareCodeArr[0]);
    console.log('\n================== 奖励 ==================\n');
    taskall = [];
    for (let user of userList) {
        await $.wait(2000)
        taskall.push(await user.tree_info());
    }
    await Promise.all(taskall);
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_list());
        taskall.push(await user.task_signIn());
    }
    await Promise.all(taskall);
    console.log('\n------------------ 执行任务 ------------------\n');
    taskall = [];
    for (let user of userList) {
        await $.wait(3000)
        taskall.push(await user.task_false());
    }
    await Promise.all(taskall);
    console.log('\n------------------ 浇水 ------------------\n');
    taskall = [];
    for (let user of userList) {
        await $.wait(3000)
        taskall.push(await user.user_info());
    }
    console.log('\n------------------ 领取完成任务奖励 ------------------\n');
    taskall = [];
    for (let user of userList) {
        await $.wait(3000)
        taskall.push(await user.task_true());
    }
    await Promise.all(taskall);
    console.log('\n------------------- [进度] -------------------\n');
    taskall = [];
    for (let user of userList) {
        await $.wait(3000)
        taskall.push(await user.get_tree());
    }
    await Promise.all(taskall);





}

class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.XAToken = str.split('&')[0];
        this.SK = str.split('&')[1];
        if (this.XAToken.indexOf('Bearer') !== -1) {
            this.XAToken = this.XAToken.replace('Bearer', '')
        } else {
            this.XAToken = str.split('&')[0];
        }
        this.shumeiId = str.split('&')[2];
        this.uuid = str.split('&')[3];
        this.deviceId = str.split('&')[3];
        this.shareCode = null
        this.hours = local_hours();
        this.ckStatus = null
        this.taskList = []
        this.extraAwardList = []
        this.userStep = null
        this.headersPost = {
            Host: 'app.dewu.com',
            'x-auth-token': "Bearer " + this.XAToken,
            'Content-Type': 'application/json',
            'ua': ua,
            'deviceTrait': deviceTrait,
            'channel': channel,
            'SK': this.SK,
            'shumeiId': this.shumeiId,
            'uuid': this.uuid,
            'deviceId': this.deviceId,
            'User-Agent': UserAgent
        };
        this.headersGet = {
            Host: 'app.dewu.com',
            'x-auth-token': "Bearer " + this.XAToken,
            'ua': ua,
            'deviceTrait': deviceTrait,
            'channel': channel,
            'SK': this.SK,
            'shumeiId': this.shumeiId,
            'uuid': this.uuid,
            'deviceId': this.deviceId,
            'User-Agent': UserAgent
        }

    }
    //1查询奖品
    //2获取任务列表
    //3执行任务
    //4获取农场剩余水滴信息
    //5浇水
    //6领取奖励
    async tree_info() {
        try {
            let options = {
                method: 'GET',
                url: 'https://app.dewu.com/hacking-tree/v1/user/target/info?sign=fe26befc49444d362c8f17463630bdba',
                headers: this.headersGet
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);

            if (result.code == 200) {
                this.ckStatus = true
                console.log(`账号[${this.index}]  查询奖励[${result.msg}] [${result.data.name}] 当前等级[${result.data.level}]`);
            } else {
                this.ckStatus = false
                console.log(`账号[${this.index}]  查询奖励失败了呢`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async user_info() { // 农场水滴剩余 和信息
        try {
            let options = {
                method: 'POST',
                url: 'https://app.dewu.com/hacking-tree/v1/user/init?sign=c921f91a4c0b7ca7f1640adcb16eb239',
                headers: this.headersPost,
            };
            if (this.index == 1) {
                let shareCodes = await getShareCodes('dwnc')
                options['body'] = JSON.stringify({ keyword: shareCodes })
            } else {
                options['body'] = JSON.stringify({ keyword: shareCodeArr[0] })
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  [${result.msg}]  剩余水滴[${result.data.droplet}g]`);
                if (result.data.droplet > 0) {
                    console.log(`账号[${this.index}]  判断当前可浇水${parseInt(result.data.droplet / 80)}次,开始浇水`);
                    for (let i = 0; i < parseInt(result.data.droplet / 80); i++) {
                        await this.task_watering("浇水")
                        await $.wait(3000)
                    }
                }
            } else {
                DoubleLog(`账号[${this.index}]  农场信息查询失败:原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_list() { // 任务列表
        try {
            let options = {
                method: 'GET',
                url: 'https://app.dewu.com/hacking-tree/v1/task/list?sign=fe26befc49444d362c8f17463630bdba',
                headers: this.headersGet
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {// 把获取到的任务列表 给对象
                let taskListArr = result.data.taskList
                for (let i in taskListArr) {
                    let taskObject = {}
                    taskObject['classify'] = taskListArr[i].classify
                    taskObject['taskId'] = taskListArr[i].taskId //任务ID
                    taskObject['taskName'] = taskListArr[i].taskName //任务名字
                    taskObject['isComplete'] = taskListArr[i].isComplete //是否未完成
                    taskObject['isReceiveReward'] = taskListArr[i].isReceiveReward //完成后是否领取奖励
                    taskObject['taskType'] = taskListArr[i].taskType //任务类型
                    taskObject['rewardCount'] = taskListArr[i].rewardCount //完成任务所获得的奖励水滴
                    taskObject['isObtain'] = taskListArr[i].isObtain //是否完成任务前置要求
                    taskObject['jumpUrl'] = taskListArr[i].jumpUrl //是否完成任务前置要求
                    this.taskList.push(taskObject)
                }
                this.extraAwardList = result.data.extraAwardList
                this.userStep = result.data.userStep //累计浇水奖励
                //console.log(`即将输出未完成的任务列表`);
                //console.log(this.taskList);
                //console.log(this.extraAwardList);
            } else {
                console.log(`账号[${this.index}]  获取任务列表失败了呢`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_false() { // 查看未完成的任务且执行
        console.log(`账号[${this.index}]  正在尝试完成所有任务`);
        //console.log(this.taskList);
        for (let i in this.taskList) {
            let isComplete = this.taskList[i].isComplete
            let taskId = this.taskList[i].taskId
            let taskName = this.taskList[i].taskName
            let taskType = this.taskList[i].taskType
            //let classify = this.taskList[i].classify
            let jumpUrl = this.taskList[i].jumpUrl
            let rewardCount = this.taskList[i].rewardCount
            if (isComplete == false) {
                if (taskType == 49) {
                    console.log(`账号[${this.index}]  [${taskName}] --- 执行`);//签到
                    await this.task_signIn2()  //提交完成任务 commit https://app.dewu.com/hacking-task/v1/task/commit?sign=34c4ac7855b7c592469c9d147483c2ea
                    //post传参taskId 和 taskType {}
                    await this.task_commit({ taskId: taskId, taskType: taskType.toString() })
                }
                let taskIdObject = {
                    "multi_times": async () => {
                        if (Number(this.hours) == 8 || Number(this.hours) == 12 || Number(this.hours) == 18 || Number(this.hours) == 22) {
                            console.log(`账号[${this.index}]  检测当前到达任务时间节点,开始执行任务`);
                            await this.task_receive(1, "multi_times")//领取
                        } else {
                            console.log(`账号[${this.index}]  检测未到达任务时间节点,不执行该任务`);
                        }
                        console.log(`账号[${this.index}]  时间段领水`);
                    },
                    'revisit': async () => { //做任务浏览【我】的右上角星愿森林入口  classify 1
                        //console.log(`特定任务${taskName}`);
                    },
                    "1": async () => { //做任务一 完成五次浇灌 classify 1
                        //console.log(`特定任务${taskName}`);
                    },
                    "2": async () => {//做任务二 从购买页进入心愿森林 classify 1
                        //console.log(`特定任务${taskName}`);
                        //await this.task_receive(1, "2")
                    },
                    "3": async () => {//做任务三 查看一次聊一聊 classify 1
                        // console.log(`特定任务${taskName}`);
                        //await this.task_receive(1, "3")
                    },
                    "4": async () => {//做任务四 收集一次水滴生产 classify 1
                        //console.log(`特定任务${taskName}`);
                        //await this.task_receive(1, "4")
                    },
                }
                if (taskId in taskIdObject) {
                    await taskIdObject[taskId]()
                } else {
                    let btd = getMiddleValue('btd=', '&', jumpUrl)
                    btd = Number(btd)
                    //console.log(`JUMP URL 数据${jumpUrl}`);
                    //console.log(`BTD 数据${btd}`);
                    let taskTypeIfObject = {
                        1: async () => {
                            if (taskName.indexOf('晒图') !== -1) {
                                console.log(`账号[${this.index}]  [${taskName}] --- 执行`);//晒图
                                await this.task_commit_pre({ taskId: taskId, taskType: taskType })
                                await $.wait(16000)
                                await this.task_commit({ taskId: taskId, taskType: taskType.toString(), activityType: null, activityId: null, taskSetId: null, venueCode: null, venueUnitStyle: null, taskScene: null })
                            } else if (taskName.indexOf('国潮') !== -1) {
                                console.log(`账号[${this.index}]  [${taskName}] --- 执行`);//国潮
                                await this.task_commit_pre({ taskId: taskId, taskType: taskType, btd: null })
                                await $.wait(16000)
                                await this.task_commit({ taskId: taskId, taskType: taskType.toString(), activityType: null, activityId: null, taskSetId: null, venueCode: null, venueUnitStyle: null, taskScene: null, btd: null })
                            } else {
                                console.log(`账号[${this.index}]  [${taskName}] --- 执行`);
                                await this.task_commit_pre({ taskId: taskId, taskType: taskType, btd: btd })//逛逛
                                await $.wait(16000)
                                await this.task_commit({ taskId: taskId, taskType: taskType.toString(), activityType: null, activityId: null, taskSetId: null, venueCode: null, venueUnitStyle: null, taskScene: null, btd: btd })
                            }
                        },
                        16: async () => {
                            console.log(`账号[${this.index}]  [${taskName}] --- 执行`);//参与0元抽奖
                            await this.task_commit({ taskType: taskType.toString(), taskId: taskId, })
                        },
                        43: async () => {
                            console.log(`账号[${this.index}]  [${taskName}] --- 执行`);//参与上上签
                            await this.task_commit({ taskType: taskType.toString(), taskId: taskId })
                        },
                        47: async () => {
                            console.log(`账号[${this.index}]  [${taskName}] --- 执行`);//订阅
                            await this.task_commit({ taskId: taskId, taskType: taskType.toString(), btd: btd })
                        },
                        50: async () => {
                            console.log(`账号[${this.index}]  [${taskName}] --- 执行`);//收藏
                            await this.task_commit({ taskId: taskId, taskType: taskType.toString(), btd: btd, spuId: 0 })
                        },
                        123: async () => {
                            console.log(`账号[${this.index}]  [${taskName}] --- 执行`);//从组件访问农场
                            await this.task_commit({ taskType: taskType.toString() })
                        },
                        251: async () => { //会场水滴大放送
                            if (rewardCount !== 10000) {
                                console.log(`账号[${this.index}]  [${taskName}] --- 执行`);//会场水滴大放送
                                await this.task_obtain(taskId, taskType)
                                //console.log(`延迟6s`);
                                await $.wait(6000)
                                await this.task_commit_pre({ taskId: taskId, taskType: 16 })
                                //console.log(`延迟16s`);
                                await $.wait(16000)
                                await this.task_commit({ taskId: taskId, taskType: taskType.toString() })
                            }
                        },
                    }
                    if (taskType in taskTypeIfObject) {
                        await taskTypeIfObject[taskType]()
                    }
                }
            }
        }
    }
    async task_true() { // 查询完成任务 && 未领取的任务
        await this.task_list()
        for (let i in this.extraAwardList) {
            if (this.extraAwardList[i].status == 1) {
                console.log(`账号[${this.index}]  领取累计任务奖励`);
                await this.task_extra(this.extraAwardList[i].condition)
            } else {

            }
        }
        await this.task_watering_reward()//
        await this.droplet_extra_info()
        await this.get_generate_droplet()
        let halfLength = Math.ceil(this.taskList.length / 2);
        this.taskList = this.taskList.slice(halfLength);
        for (let i in this.taskList) {
            if (this.taskList[i].isReceiveReward == true) {
                console.log(`账号[${this.index}]  [${this.taskList[i].taskName}] --- 已领取`);
            } else {
                await this.task_receive(this.taskList[i].classify, this.taskList[i].taskId, this.taskList[i].taskType)
            }
        }
        //await wait(1); //延迟
    }
    async task_obtain(taskId, taskType) { // 任务列表前置 OBTAIN
        try {
            let options = {
                method: 'POST',
                url: 'https://app.dewu.com/hacking-task/v1/task/obtain',
                headers: this.headersPost,
                body: JSON.stringify({ taskId: taskId, taskType: taskType }),
            };
            //console.log(options);
            let result = await httpRequest(options);
            if (result.code == 200) {
                if (result.status == 200) {
                    return true
                    //DoubleLog(`账号[${this.index}]  任务前置[${result.msg}]`);
                }
            } else {
                //DoubleLog(`账号[${this.index}]  任务前置失败:原因未知`);
                console.log(result);
                return false
            }
            //console.log(result);
        } catch (error) {
            console.log(error);
        }
    }
    async task_commit_pre(body) {
        // 任务 开始  且等待16s TaskType有变化  浏览15s会场会变成16
        try {
            let options = {
                method: 'POST',
                url: `https://app.dewu.com/hacking-task/v1/task/pre_commit`,
                headers: this.headersPost,
                body: JSON.stringify(body),
            };

            let result = await httpRequest(options);
            if (result.code == 200) {
                //DoubleLog(`账号[${this.index}]  任务开始${result.msg}${result.data.isOk}`);
                return true
            } else {
                //DoubleLog(`账号[${this.index}]  任务开始失败:原因未知`);
                //console.log(options);
                console.log(result);
                return false
            }
        } catch (error) {
            console.log(error);
        }
    }
    async task_commit(body) { // 任务完成时提交状态
        let options = {
            method: 'POST',
            url: 'https://app.dewu.com/hacking-task/v1/task/commit',
            headers: this.headersPost,
            body: JSON.stringify(body)
        }
        try {
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                //DoubleLog(`账号[${this.index}]  提交任务完成状态[${result.msg}]`);
                return true
            } else {
                //DoubleLog(`账号[${this.index}]  任务结束[${result.msg}]:原因未知`);
                //console.log(options);
                console.log(result);
                return false
            }

        } catch (error) {
            console.log(error);
        }
    }
    async task_signIn() { // 签到 领取水滴
        try {
            let signIn_info = await httpRequest({
                method: 'GET',
                url: 'https://app.dewu.com/hacking-tree/v1/sign/list?sign=fe26befc49444d362c8f17463630bdba',
                headers: this.headersGet,
            })
            if (signIn_info.data.list[Number(signIn_info.data.currentDay) - 1].IsSignIn == false) {
                let options = {
                    method: 'POST',
                    url: 'https://app.dewu.com/hacking-tree/v1/sign/sign_in?sign=fe26befc49444d362c8f17463630bdba',
                    headers: this.headersPost,
                    body: JSON.stringify({}),
                };
                //console.log(options);
                let result = await httpRequest(options);
                //console.log(result);
                if (result.code == 200) {
                    DoubleLog(`账号[${this.index}]  签到领取水滴[${result.msg}] --- [${result.data.Num}]`);
                } else if (result.code == 711110001) {
                    DoubleLog(`账号[${this.index}]  签到领取水滴[${result.msg}]`);
                    console.log(result);
                } else {
                    DoubleLog(`账号[${this.index}]  签到领取水滴失败:原因未知`);
                    console.log(result);
                }
            } else {
                console.log(`账号[${this.index}]  今日已签到获得水滴`);
            }

        } catch (error) {
            console.log(error);
        }
    }
    async task_signIn2() { // 签到 领取水滴
        try {
            let options = {
                method: 'POST',

                url: `https://app.dewu.com/hacking-game-center/v1/sign/sign?sign=fe26befc49444d362c8f17463630bdba`,
                headers: this.headersPost,
                body: JSON.stringify({})
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                console.log(`账号[${this.index}]  签到[${result.msg}] --- [${result.data.coins}]`);
            } else {
                console.log(`账号[${this.index}]  签到失败`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async task_watering() { // 浇水 一次40g /80g
        await $.wait(2000)
        try {
            let options = {
                method: 'POST',
                url: 'https://app.dewu.com/hacking-tree/v1/tree/watering?sign=fe26befc49444d362c8f17463630bdba',
                headers: this.headersPost,
                body: JSON.stringify({}),
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                if (result.data.wateringReward !== null) {
                    DoubleLog(`账号[${this.index}]  浇水[${result.msg}] --- [${result.data.wateringReward.rewardNum}g]`);
                } else {
                    DoubleLog(`账号[${this.index}]  浇水[${result.msg}]`);
                }
            } else if (result.code == 711110001) {
                DoubleLog(`账号[${this.index}]  浇水[${result.msg}]`);
                console.log(result);
            } else {
                DoubleLog(`账号[${this.index}]  浇水失败:原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async task_watering_reward() { // 累计浇水奖励
        try {
            let options = {
                method: 'POST',
                url: 'https://app.dewu.com/hacking-tree/v1/tree/get_watering_reward?sign=1baeffad64b921f648851686f2a4b614',
                headers: this.headersPost,
                body: JSON.stringify({ promote: '' }),
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  领取累计浇水奖励[${result.msg}] --- [${result.data.rewardNum}g]`);
            } else if (result.code == 711070005) {
                DoubleLog(`账号[${this.index}]  领取累计浇水奖励[${result.msg}]`);
                //console.log(result);
            } else {
                DoubleLog(`账号[${this.index}]  领取累计浇水奖励失败:原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_receive(classify, taskId, taskType) { // 领取水滴任务列表的水滴
        let options = {
            method: 'POST',
            url: 'https://app.dewu.com/hacking-tree/v1/task/receive',
            headers: this.headersPost
        }
        let result
        try {
            if (taskType == 251) {
                options.body = JSON.stringify({ classify: classify, taskId: taskId, completeFlag: 1 })
                //console.log(options);
                result = await httpRequest(options);
            } else {
                options.body = JSON.stringify({ classify: classify, taskId: taskId })
                //console.log(options);
                result = await httpRequest(options);
            }
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  领取任务奖励[${result.msg}] --- [${result.data.num}g]`);
            } else if (result.code == 711020001) {
                //DoubleLog(`账号[${this.index}]  领取[${result.msg}]`);
                //console.log(result);
            } else {
                DoubleLog(`账号[${this.index}]  领取[${result.msg}]`);
                //console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_extra(condition) { // 领取水滴任务累计奖励
        try {
            let options = {
                method: 'POST',
                url: 'https://app.dewu.com/hacking-tree/v1/task/extra?sign=a2819c40ac9229d10c134e773fff6eb3',
                headers: this.headersPost,
                body: JSON.stringify({ condition: condition }),
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  领取累计奖励[${result.msg}] --- [${result.data.num}g]`);
            } else if (result.code == 711020001) {
                DoubleLog(`账号[${this.index}]  领取累计奖励失败:${result.msg}`);
                //console.log(result);
            } else {
                DoubleLog(`账号[${this.index}]  领取累计奖励失败:原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async droplet_extra_info() { // 气泡水滴
        try {
            let options = {
                method: 'GET',
                url: 'https://app.dewu.com/hacking-tree/v1/droplet-extra/info?sign=fe26befc49444d362c8f17463630bdba',
                headers: this.headersGet
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);

            if (result.code == 200) {
                if ("onlineExtra" in result.data) {
                    console.log(`账号[${this.index}]  气泡水滴已满,今日可领取 --- [${result.data.onlineExtra.totalDroplet}]g`);
                    await this.droplet_extra_receive();
                } else if (result.data.dailyExtra) {
                    console.log(`账号[${this.index}]  气泡水滴未满,不可领取,明日再来领取吧！目前已经积攒了 --- [${result.data.dailyExtra.totalDroplet}]g水滴呢!"`);
                }
            } else {
                console.log(`账号[${this.index}] 查询气泡水滴失败了呢`);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async droplet_extra_receive() { // 领取气泡水滴
        try {
            let options = {
                method: 'POST',
                url: 'https://app.dewu.com/hacking-tree/v1/droplet-extra/receive?sign=fe26befc49444d362c8f17463630bdba',
                headers: this.headersPost,
                body: JSON.stringify({}),
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  领取气泡水滴[${result.msg}] --- [${result.data.totalDroplet}g]`);
            } else if (result.code == 711030002) {
                DoubleLog(`账号[${this.index}]  领取气泡水滴[${result.msg}]`);
                //console.log(result);
            } else {
                DoubleLog(`账号[${this.index}]  领取气泡水滴失败:原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async get_generate_droplet() { // 领取小木桶水滴
        try {
            let options = {
                method: 'POST',
                url: 'https://app.dewu.com/hacking-tree/v1/droplet/get_generate_droplet?sign=fe26befc49444d362c8f17463630bdba',
                headers: this.headersPost,
                body: JSON.stringify({}),
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  领取小木桶积攒水滴[${result.msg}] --- [${result.data.droplet}g]`);
            } else if (result.code == 711070009) {
                DoubleLog(`账号[${this.index}]  领取小木桶积攒水滴[${result.msg}]`);
                //console.log(result);
            } else {
                DoubleLog(`账号[${this.index}]  领取小木桶积攒水滴:原因未知`);
                //console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }


    async share_code() { // 获取助力码
        try {
            let options = {
                method: 'POST',
                url: 'https://app.dewu.com/hacking-tree/v1/keyword/gen?sign=fe26befc49444d362c8f17463630bdba',
                headers: this.headersPost,
                body: JSON.stringify({}),

            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                //DoubleLog(`账号[${this.index}]  获取助力码[${result.msg}][${result.data.keyword}][${result.data.keywordDesc}]`);
                shareCodeArr.push(result.data.keyword)
            } else {
                DoubleLog(`账号[${this.index}]  获取助力码失败:原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async get_tree() { // 农场水滴剩余 和信息
        try {
            let options = {
                method: 'GET',
                url: 'https://app.dewu.com/hacking-tree/v1/tree/get_tree_info?sign=fe26befc49444d362c8f17463630bdba',
                headers: this.headersGet,
            };
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                this.ckStatus = true
                //$.msg(`账号[${this.index}]  [${result.data.treeId}] 成熟进度[${result.data.userWateringDroplet}/${result.data.currentLevelNeedWateringDroplet}g]`)
                DoubleLog(`账号[${this.index}]  [${result.data.treeId}] 成熟进度 --- [${result.data.userWateringDroplet}/${result.data.currentLevelNeedWateringDroplet}g]`);
            } else {
                DoubleLog(`账号[${this.index}]  农场信息查询失败:原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }


}

!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        await start();
    }
    //console.log(`助力码数组${shareCodeArr}`);

    await SendMsg(msg);
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());



//  Variable checking and processing
async function checkEnv() {
    if (userCookie) {
        // console.log(userCookie);
        let e = envSplitor[0];
        for (let o of envSplitor)
            if (userCookie.indexOf(o) > -1) {
                e = o;
                break;
            }
        for (let n of userCookie.split(e)) n && userList.push(new UserInfo(n));
        userCount = userList.length;
    } else {
        console.log("未找到CK");
        return;
    }
    return console.log(`共找到${userCount}个账号`), true;
}
/////////////////////////////////////////////////////////////////////////////////
function getMiddleValue(str1, str2, inputString) {
    var regex = new RegExp(str1 + "(.*?)" + str2);
    var result = regex.exec(inputString);
    if (result && result.length > 1) {
        return result[1];
    } else {
        return "";
    }
}
function local_hours() {
    let myDate = new Date();
    let h = myDate.getHours();
    return h;
}
function randomszdx(e) {
    e = e || 32;
    var t = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890",
        a = t.length,
        n = "";
    for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n;
}
function httpRequest(options, method) {
    method = options.method ? options.method.toLowerCase() : (options.body ? 'post' : 'get');
    return new Promise((resolve) => {
        $[method](options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${method}请求失败`);
                    $.logErr(err);
                } else {
                    if (data) {
                        typeof JSON.parse(data) == 'object' ? data = JSON.parse(data) : data = data
                        resolve(data)
                    } else {
                        console.log(`请求api返回数据为空，请检查自身原因`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}
function getVersion(scriptUrl, timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let options = {
            url: `https://ghproxy.com/https://raw.githubusercontent.com/${scriptUrl}`,
        }
        $.get(options, async (err, resp, data) => {
            try {
                let regex = /scriptVersionNow\s*=\s*(["'`])([\d.]+)\1/;
                let match = data.match(regex);
                scriptVersionLatest = match ? match[2] : '';
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        }, timeout)
    })
}
async function getShareCodes(jsName) {
    try {
        const urls = [
            `https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/Note/main/updateTeam/${jsName}.json`,
            `https://fastly.jsdelivr.net/gh/smallfawn/Note@main/updateTeam/${jsName}.json`,
            `https://fastly.jsdelivr.net/gh/smallfawn/Note@main/updateTeam/${jsName}.json`,
        ];
        let shareCodes = null;
        for (const url of urls) {
            const options = {
                url,
                headers: { "User-Agent": "" }
            };
            const result = await httpRequest(options);
            if (result) {
                shareCodes = result['keyword']
                break;
            }
        }
        return shareCodes
    } catch (e) {
        console.log(e);
    }
}
async function getNotice() {
    try {
        const urls = [
            "https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/Note/main/Notice.json",
            "https://fastly.jsdelivr.net/gh/smallfawn/Note@main/Notice.json",
            "https://cdn.jsdelivr.net/gh/smallfawn/Note@main/Notice.json",
            "https://gitee.com/smallfawn/Note/raw/master/Notice.json"
        ];
        let notice = null;
        for (const url of urls) {
            const options = {
                url,
                headers: { "User-Agent": "" }
            };
            const result = await httpRequest(options);
            if (result && "notice" in result) {
                notice = result.notice.replace(/\\n/g, '\n');
                break;
            }
        }
        if (notice) {
            DoubleLog(notice);
        }
    } catch (e) {
        console.log(e);
    }
}
function DoubleLog(data) {
    if ($.isNode()) {
        if (data) {
            console.log(`${data}`);
            msg += `\n${data}`
        }
    } else {
        console.log(`${data}`);
        msg += `\n${data}`
    }
}
async function SendMsg(message) {
    if (!message) return;
    if (Notify > 0) {
        if ($.isNode()) {
            await notify.sendNotify($.name, message)
        } else {
            $.msg($.name, '', message)
        }
    } else {
        console.log(message)
    }
}
//  Env
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, a) => { s.call(this, t, (t, s, r) => { t ? a(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const a = this.getdata(t); if (a) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, a) => e(a)) }) } runScript(t, e) { return new Promise(s => { let a = this.getdata("@chavy_boxjs_userCfgs.httpapi"); a = a ? a.replace(/\n/g, "").trim() : a; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [i, o] = a.split("@"), n = { url: `http://${o}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": i, Accept: "*/*" }, timeout: r }; this.post(n, (t, e, a) => s(a)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e); if (!s && !a) return {}; { const a = s ? t : e; try { return JSON.parse(this.fs.readFileSync(a)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : a ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const a = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of a) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, a) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[a + 1]) >> 0 == +e[a + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, a] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, a, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, a, r] = /^@(.*?)\.(.*?)$/.exec(e), i = this.getval(a), o = a ? "null" === i ? null : i || "{}" : "{}"; try { const e = JSON.parse(o); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), a) } catch (e) { const i = {}; this.lodash_set(i, r, t), s = this.setval(JSON.stringify(i), a) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return this.data = this.loaddata(), this.data[t]; default: return this.data && this.data[t] || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0; default: return this.data && this.data[e] || null } } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { switch (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, a) => { !t && s && (s.body = a, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, a) }); break; case "Quantumult X": this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i, o) }, t => e(t && t.error || "UndefinedError")); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: a, statusCode: r, headers: i, rawBody: o } = t, n = s.decode(o, this.encoding); e(null, { status: a, statusCode: r, headers: i, rawBody: o, body: n }, n) }, t => { const { message: a, response: r } = t; e(a, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch (t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, a) => { !t && s && (s.body = a, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, a) }); break; case "Quantumult X": t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i, o) }, t => e(t && t.error || "UndefinedError")); break; case "Node.js": let a = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...i } = t; this.got[s](r, i).then(t => { const { statusCode: s, statusCode: r, headers: i, rawBody: o } = t, n = a.decode(o, this.encoding); e(null, { status: s, statusCode: r, headers: i, rawBody: o, body: n }, n) }, t => { const { message: s, response: r } = t; e(s, r, r && a.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let a = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in a) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? a[e] : ("00" + a[e]).substr(("" + a[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let a = t[s]; null != a && "" !== a && ("object" == typeof a && (a = JSON.stringify(a)), e += `${s}=${a}&`) } return e = e.substring(0, e.length - 1), e } msg(e = t, s = "", a = "", r) { const i = t => { switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } case "Loon": { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } case "Quantumult X": { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, a = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": a } } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, a, i(r)); break; case "Quantumult X": $notify(e, s, a, i(r)); break; case "Node.js": }if (!this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), a && t.push(a), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t); break; case "Node.js": this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) } } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; switch (this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } }(t, e) }
