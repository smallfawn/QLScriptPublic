/**
 * 得物农场
 * cron 55 10 * * *  dewu_farm.js
 *
 * 22/11/29   浇水 签到 领取水滴 气泡水滴
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export dwnc_data='token @ token'
 * 
 * 得物APP => 购物 => 上方推荐 - 免费领好礼
 * 找不到的话去 我 => 星愿森林 进入活动
 * 抓app.dewu.com域名下headers参数
 * SK，shumeiId，x-auth-token，uuid，dutoken
 * &连接
 * ====================================
 *  
 */



const $ = new Env("得物农场");
const ckName = "dwnc_data";
//-------------------- 一般不动变量区域 -------------------------------------
const notify = $.isNode() ? require("./sendNotify") : "";
const Notify = 1;		 //0为关闭通知,1为打开通知,默认为1
let debug = 0;           //Debug调试   0关闭  1开启
let envSplitor = ["@", "\n"]; //多账号分隔符
let msg = '';       //let ck,msg
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
//---------------------- 自定义变量区域 -----------------------------------
//---------------------------------------------------------

async function start() {
    //逻辑处理
    //0.先查询农场树木信息 水滴信息
    //1.先查询列表 做任务, 领取任务数量奖励
    //2.查询农场剩余水滴且浇水 ,领取浇水数量奖励
    //3.查询最后还剩百分之几(浇水几次完成)
    // 未加 累计浇水奖励 累计任务数目奖励
    //未抓包 完成浏览任务奖励
    //利用return 返回userList来作为内部互助条件
    console.log('\n================== 查询奖励 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.tree_info());
        //await wait(1); //延迟
    }
    await Promise.all(taskall);
    console.log('\n================== 每日签到 ==================\n');
    taskall = [];
    for (let user of userList) {
        await wait(2)
        taskall.push(await user.task_sign());
        //await wait(1); //延迟
    }
    await Promise.all(taskall);
    console.log('\n================== 查询未完成任务 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_false());
        //await wait(1); //延迟
    }
    await Promise.all(taskall);
    console.log('\n================== 领取任务奖励 ==================\n');
    taskall = [];
    for (let user of userList) {
        await wait(3)
        taskall.push(await user.task_true());
        //await wait(1); //延迟
    }
    await Promise.all(taskall);
    console.log('\n================== 查询水滴剩余 ==================\n');
    taskall = [];
    for (let user of userList) { //根据剩余水滴浇水
        taskall.push(await user.user_info("水滴查询"));
        //await wait(1); //延迟
    }
    await Promise.all(taskall);
    console.log('\n================== 气泡水滴查询 ==================\n');
    taskall = [];
    for (let user of userList) { //根据剩余水滴浇水
        taskall.push(await user.droplet_extra_info());
        //await wait(1); //延迟
    }
    await Promise.all(taskall);
    console.log('\n================== 小木桶水滴查询 ==================\n');
    taskall = [];
    for (let user of userList) { //根据剩余水滴浇水
        taskall.push(await user.get_generate_droplet());
        //await wait(1); //延迟
    }
    await Promise.all(taskall);
    console.log('\n================== 每日助力 ==================\n');
    taskall = [];
    for (let user of userList) { //根据剩余水滴浇水
        taskall.push(await user.share_code("获取助力码"));
        //await wait(1); //延迟
    }
    await Promise.all(taskall);



}

class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.data = str.split('&');
        this.SK = str.split('&')[0];
        this.shumeiId = str.split('&')[1];
        this.x_auth_token = str.split('&')[2].replace("Bearer", "");
        this.uuid = str.split('&')[3];
        this.deviceId = str.split('&')[3];
        this.duToken = str.split('&')[4];
        this.cookieToken = str.split('&')[4];
        this.Cookie = str.split('&')[4];
        //let ck = str.split('&')
        //this.data1 = ck[0]
        this.shareCodeArr = []
        this.host = "app.dewu.com";
        this.hostname = "https://" + this.host;
        this.hours = local_hours();
        this.listKey = "fe26befc49444d362c8f17463630bdba"
        this.signKey = "fe26befc49444d362c8f17463630bdba"
        this.wateringkey = "fe26befc49444d362c8f17463630bdba"
        this.dropletExtrakey = "fe26befc49444d362c8f17463630bdba"
        this.getGenerateDroplet = "fe26befc49444d362c8f17463630bdba"
        this.treeInfo = "fe26befc49444d362c8f17463630bdba"
        this.shareKey = "fe26befc49444d362c8f17463630bdba"
        this.wateringRewardKey = "1baeffad64b921f648851686f2a4b614"
        this.userInfoKey = "c921f91a4c0b7ca7f1640adcb16eb239"
        this.taskReceive = "ede03c38c0e1e885931f5cd960542671"
        this.taskExtra = "a2819c40ac9229d10c134e773fff6eb3"
        this.taskObtain = "c8fd3a221efeed0068aa3b4964b802ad"//打开浏览任务前置
        this.taskCommit_pre = "582fc87cce779992619f7f6d898b3544"//开始执行浏览任务
        this.taskCommit = "c589191e7b98646a21e1b7ffe816699c"//领取任务奖励
        this.taskCommit2 = "d20921886274b60a40f78fd58738444a"//收藏任务提交


        this.headersPost = {
            Host: this.host,
            Connection: 'keep-alive',
            ua: 'duapp/5.4.5(android;10)',
            SK: this.SK,
            shumeiId: this.shumeiId,
            deviceTrait: 'MI+8+Lite',
            'x-auth-token': "Bearer " + this.x_auth_token,
            platform: 'h5',
            uuid: this.uuid,
            channel: 'xiaomi',
            isProxy: '0',
            duToken: this.duToken,
            deviceId: this.deviceId,
            emu: '0',
            cookieToken: this.cookieToken,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36/duapp/5.4.5(android;10)',
            'Content-Type': 'application/json',
            isRoot: '0',
            imei: '',
            appid: 'h5',
            appVersion: '5.4.5',
            Accept: '*/*',
            Origin: 'https://cdn-m.dewu.com',
            'X-Requested-With': 'com.shizhuang.duapp',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            Referer: 'https://cdn-m.dewu.com/h5-growth/wish-tree?navControl=1&&source=appHome',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            Cookie: this.Cookie,
            'content-type': 'application/json'
        };
        this.headersGet = {
            Host: this.host,
            Connection: 'keep-alive',
            ua: 'duapp/5.4.5(android;10)',
            SK: this.SK,
            shumeiId: this.shumeiId,
            deviceTrait: 'MI+8+Lite',
            'x-auth-token': "Bearer " + this.x_auth_token,
            platform: 'h5',
            uuid: this.uuid,
            channel: 'xiaomi',
            isProxy: '0',
            duToken: this.duToken,
            deviceId: this.deviceId,
            emu: '0',
            cookieToken: this.cookieToken,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36/duapp/5.4.5(android;10)',
            isRoot: '0',
            imei: '',
            appid: 'h5',
            appVersion: '5.4.5',
            Accept: '*/*',
            Origin: 'https://cdn-m.dewu.com',
            'X-Requested-With': 'com.shizhuang.duapp',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            Referer: 'https://cdn-m.dewu.com/h5-growth/wish-tree?navControl=1&&source=appHome',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            Cookie: this.Cookie,
            'content-type': 'application/json'
        }
        this.headersOptions = {
            Host: 'app.dewu.com',
            Connection: 'keep-alive',
            Accept: '*/*',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'appid,appversion,channel,content-type,cookietoken,deviceid,devicetrait,dutoken,emu,imei,isproxy,isroot,platform,shumeiid,sk,ua,uuid,x-auth-token',
            Origin: 'https://cdn-m.dewu.com',
            'Sec-Fetch-Mode': 'cors',
            'X-Requested-With': 'com.shizhuang.duapp',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-Dest': 'empty',
            Referer: 'https://cdn-m.dewu.com/h5-growth/wish-tree?navControl=1&&source=appHome',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7'
        }
    }

    async user_info(name) { // 农场水滴剩余 和信息
        let path = "/hacking-tree/v1/user/init"
        try {
            let options = {
                method: 'POST',
                url: this.hostname + path,
                qs: { sign: this.userInfoKey },
                headers: this.headersPost,
                body: { keyword: '' },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  农场信息查询:${result.msg},剩余水滴[${result.data.droplet}g]`);
                let g = result.data.droplet
                let waterNum = parseInt(result.data.droplet / 80)
                if (waterNum > 0) {
                    console.log("判断当前可浇水" + waterNum + "次,开始浇水");
                    for (let i = 0; i < waterNum; i++) {
                        await this.task_watering("浇水")
                        await wait(3)
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
    async tree_info() { // 树木奖品  INS棉拖
        let path = "/hacking-tree/v1/user/target/info"
        //if 数组中的某一项在返回体中的状态未false
        try {
            let options = {
                method: 'GET',
                url: this.hostname + path,
                qs: { sign: this.treeInfo },
                headers: this.headersGet
            };
            //console.log(options);
            let result = await httpRequest(options, "奖品");
            //console.log(result);

            if (result.code == 200) {
                console.log(`账号[${this.index}] 查询奖励${result.msg}[${result.data.name}]`);
            } else {
                console.log(`账号[${this.index}] 查询奖励失败了呢`);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async task_list() { // 任务列表
        let path = "/hacking-tree/v1/task/list"
        //if 数组中的某一项在返回体中的状态未false
        try {
            const options = {
                method: 'GET',
                url: this.hostname + path,
                qs: { sign: this.listKey },
                headers: this.headersGet
            };
            //console.log(options);
            let result = await httpRequest(options, "检测任务列表");
            //console.log(result);

            if (result.code == 200) {
                let data = result.data
                return data
            } else {
                console.log(`账号[${this.index}] 获取任务列表失败了呢`);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async task_false() { // 查看未完成的任务且执行
        //if 数组中的某一项在返回体中的状态未false
        let list = await this.task_list()
        //console.log(list.taskList);
        for (let i in list.taskList) {
            let state = list.taskList[i].isComplete
            let taskId = list.taskList[i].taskId
            let taskName = list.taskList[i].taskName
            let taskType = list.taskList[i].taskType
            let classify = list.taskList[i].classify
            if (state == false) {
                switch (taskId) {
                    case "multi_times":
                        //做任务 领40g水滴值 classify 1 8点 12点 18点 22点
                        console.log("检测到任务[-" + taskName + "-]未完成");
                        if (this.hours = 8 || 12 | 18 | 22) {
                            console.log("检测当前到达任务时间节点,开始执行任务");
                            await this.task_receive(1, 1, "multi_times")//领取
                        } else {
                            console.log("检测未到达任务时间节点,不执行该任务");
                        }
                        break;
                    case "1":
                        //做任务一 完成五次浇灌 classify 1
                        console.log("检测到任务[-" + taskName + "-]未完成");
                        for (let i = 0; i < 5; i++) {
                            await this.task_watering("浇水")//执行
                        }
                        await this.task_receive(1, 1, "1")//领取
                        break;
                    case "2":
                        //做任务二 从购买页进入心愿森林 classify 1
                        console.log("检测到任务[-" + taskName + "-]未完成");
                        //await this.task_receive(1, "2")
                        break;
                    case "3":
                        //做任务三 查看一次聊一聊 classify 1
                        console.log("检测到任务[-" + taskName + "-]未完成");
                        //await this.task_receive(1, "3")
                        break;
                    case "4":
                        //做任务四 收集一次水滴生产 classify 1
                        console.log("检测到任务[-" + taskName + "-]未完成");
                        //await this.task_receive(1, "4")
                        break;
                }
                if (taskId !== "multi_times" && taskId !== "1" && taskId !== "2" && taskId !== "3" && taskId !== "4" && state == false && list.taskList[i].subTitle2 !== "下单可得") {
                    if (taskType == 251) {
                        await this.task_obtain(taskId, taskType)
                    } else if (taskType == 50) {
                        await this.task_commit(2, taskId, taskType)
                    } else if (taskType == 16) { //0元抽奖
                        await this.task_commit(2, taskId, taskType)
                    } else if (taskName.indexOf("逛逛") != -1) {
                        await this.task_commit_pre(this.taskCommit_pre, taskId, 1)
                        await wait(16)
                        await this.task_commit(3, taskId, 1)
                    }
                }
            }
        }
    }
    async task_true() { // 查询完成未领取的任务
        let list = await this.task_list();
        //console.log(list);
        for (let i in list.extraAwardList) {
            if (list.userStep > list.extraAwardList[i].condition && list.extraAwardList[i].status == 1) {
                console.log("-----------领取累计任务奖励");
                await this.task_extra(list.extraAwardList[i].condition)
            } else {
                //console.log("累计任务奖励未达到要求");
            }
        }
        for (let i in list.taskList) {
            let state = list.taskList[i].isComplete //完成状态
            let taskId = list.taskList[i].taskId
            let taskName = list.taskList[i].taskName
            let rewardState = list.taskList[i].isReceiveReward //领取状态
            let classify = list.taskList[i].classify
            //console.log(state);
            if (taskId !== "multi_times" && state == true && rewardState == false) {
                console.log("任务" + taskName + "完成未领取");
                await this.task_receive(2, classify, taskId)//领取奖励
            } else {
                console.log("目前发现没有可以领取的任务奖励呢!");
                break;
            }
        }
    }
    async task_sign(name) { // 签到 领取水滴
        let path = "/hacking-tree/v1/sign/sign_in"
        try {
            let options = {
                method: 'POST',
                url: this.hostname + path,
                qs: { sign: this.signKey },
                headers: this.headersPost,
                body: {},
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  签到领取水滴:${result.msg}[${result.data.Num}]`);
            } else if (result.code == 711110001) {
                DoubleLog(`账号[${this.index}]  签到领取水滴失败:${result.msg}`);
                //console.log(result);
            } else {
                DoubleLog(`账号[${this.index}]  签到领取水滴失败:原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_watering(name) { // 浇水 一次40g /80g
        await wait(2)
        let path = "/hacking-tree/v1/tree/watering"
        try {
            let options = {
                method: 'POST',
                url: this.hostname + path,
                qs: { sign: this.wateringkey },
                headers: this.headersPost,
                body: {},
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  浇水:${result.msg}[${result.data.wateringReward.rewardNum}g]`);
            } else if (result.code == 711110001) {
                DoubleLog(`账号[${this.index}]  浇水失败:${result.msg}`);
                //console.log(result);
            } else {
                DoubleLog(`账号[${this.index}]  浇水失败:原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async task_watering_reward(name) { // 累计浇水奖励
        let path = "/hacking-tree/v1/tree/get_watering_reward"
        try {
            let options = {
                method: 'POST',
                url: this.hostname + path,
                qs: { sign: this.wateringRewardKey },
                headers: this.headersPost,
                body: { promote: '' },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  领取累计浇水奖励:${result.msg}[${result.data.rewardNum}g]`);
            } else if (result.code == 711070005) {
                DoubleLog(`账号[${this.index}]  领取累计浇水奖励失败:${result.msg}`);
                //console.log(result);
            } else {
                DoubleLog(`账号[${this.index}]  领取累计浇水奖励失败:原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_receive(i, classify, taskId) { // 领取水滴任务列表的水滴
        let path = "/hacking-tree/v1/task/receive"
        if (i == 1) {
            try {
                let options = {
                    method: 'POST',
                    url: this.hostname + path,
                    qs: { sign: this.taskReceive },
                    headers: this.headersPost,
                    body: { classify: classify, taskId: taskId },
                    json: true
                };
                //console.log(options);
                let result = await httpRequest(options, "领取任务奖励");
                //console.log(result);
                if (result.code == 200) {
                    DoubleLog(`账号[${this.index}]  领取任务奖励:${result.msg}[${result.data.num}g]`);
                } else if (result.code == 711020001) {
                    DoubleLog(`账号[${this.index}]  领取失败:${result.msg}`);
                    //console.log(result);
                } else {
                    DoubleLog(`账号[${this.index}]  领取失败:${result.msg}`);
                    //console.log(result);
                }
            } catch (error) {
                console.log(error);
            }
        } else if (i == 2) {
            try {
                let options = {
                    method: 'POST',
                    url: this.hostname + path,
                    qs: { sign: this.taskReceive },
                    headers: this.headersPost,
                    body: { classify: classify, taskId: taskId, completeFlag: 1 },
                    json: true
                };
                //console.log(options);
                let result = await httpRequest(options, "领取任务奖励");
                //console.log(result);
                if (result.code == 200) {
                    DoubleLog(`账号[${this.index}]  领取任务奖励:${result.msg}[${result.data.num}g]`);
                } else if (result.code == 711020001) {
                    DoubleLog(`账号[${this.index}]  领取失败:${result.msg}`);
                    //console.log(result);
                } else {
                    DoubleLog(`账号[${this.index}]  领取失败:${result.msg}`);
                    //console.log(result);
                }
            } catch (error) {
                console.log(error);
            }
        }

    }

    async task_extra(condition) { // 领取水滴任务累计奖励
        let path = "/hacking-tree/v1/task/extra"
        try {
            let options = {
                method: 'POST',
                url: this.hostname + path,
                qs: { sign: this.taskExtra },
                headers: this.headersPost,
                body: { condition: condition },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, "领取水滴任务累计奖励");
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  领取累计奖励:${result.msg}[${result.data.num}g]`);
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
        let path = "/hacking-tree/v1/droplet-extra/info"
        try {
            let options = {
                method: 'GET',
                url: this.hostname + path,
                qs: { sign: this.dropletExtrakey },
                headers: this.headersGet
            };
            //console.log(options);
            let result = await httpRequest(options, "气泡水滴信息");
            //console.log(result);

            if (result.code == 200) {
                if ("onlineExtra" in result.data) {
                    console.log("气泡水滴已满,今日可领取" + result.data.onlineExtra.totalDroplet + "g");
                    await this.droplet_extra_receive();
                } else if (result.data.dailyExtra) {
                    console.log("气泡水滴未满,不可领取,明日再来领取吧！目前已经积攒了" + result.data.dailyExtra.totalDroplet + "g水滴呢!");
                }
            } else {
                console.log(`账号[${this.index}] 查询气泡水滴失败了呢`);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async droplet_extra_receive() { // 领取气泡水滴
        let path = "/hacking-tree/v1/droplet-extra/receive"
        try {
            let options = {
                method: 'POST',
                url: this.hostname + path,
                qs: { sign: this.dropletExtrakey },
                headers: this.headersPost,
                body: {},
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, "领取气泡水滴");
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  领取气泡水滴:${result.msg}[${result.data.totalDroplet}g]`);
            } else if (result.code == 711030002) {
                DoubleLog(`账号[${this.index}]  领取气泡水滴失败:${result.msg}`);
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
        let path = "/hacking-tree/v1/droplet/get_generate_droplet"
        try {
            let options = {
                method: 'POST',
                url: this.hostname + path,
                qs: { sign: this.getGenerateDroplet },
                headers: this.headersPost,
                body: {},
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, "领取小木桶积攒水滴");
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  领取小木桶积攒水滴:${result.msg}[${result.data.droplet}g]`);
            } else if (result.code == 711070009) {
                DoubleLog(`账号[${this.index}]  领取小木桶积攒水滴失败:${result.msg}`);
                //console.log(result);
            } else {
                DoubleLog(`账号[${this.index}]  领取小木桶积攒水滴:原因未知`);
                //console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async share_code(name) { // 获取助力码
        let path = "/hacking-tree/v1/keyword/gen"
        try {
            let options = {
                method: 'POST',
                url: this.hostname + path,
                qs: { sign: this.shareKey },
                headers: this.headersPost,
                body: {},
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, name);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  获取助力码:${result.msg},助力码[${result.data.keyword}],助力链接[${result.data.keywordDesc}]`);
                console.log(this.shareCodeArr);
            } else {
                DoubleLog(`账号[${this.index}]  获取助力码失败:原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async task_obtain(taskId, taskType) { // 任务列表前置 OBTAIN
        let path = "/hacking-task/v1/task/obtain"
        try {
            let options = {
                method: 'POST',
                url: this.hostname + path,
                qs: { sign: this.taskObtain },
                headers: this.headersPost,
                body: { taskId: taskId, taskType: taskType },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, "任务前置");
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  任务前置${result.msg}`);
                await wait(10)
                if (taskType == 251) { await this.task_commit_pre(i, taskId, 16) }
                await wait(16)
                await this.task_commit(1, taskId, taskType)
            } else {
                DoubleLog(`账号[${this.index}]  任务前置失败:原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async task_commit_pre(i, taskId, taskType) { // 任务 开始  且等待16s TaskType有变化  浏览15s会场会变成16
        let path = "/hacking-task/v1/task/pre_commit"
        try {
            let options = {
                method: 'POST',
                url: this.hostname + path,
                qs: { sign: i },
                headers: this.headersPost,
                body: { taskId: taskId, taskType: taskType },
                json: true
            };
            //console.log(options);
            let result = await httpRequest(options, "开始做任务");
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  任务开始${result.msg}${result.data.isOk}`);
            } else {
                DoubleLog(`账号[${this.index}]  任务开始失败:原因未知`);
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }
    async task_commit(key, taskId, taskType) { // 任务结束领取 taskType 恢复为原来的  浏览tasktype 为251需要等待15s  收藏直接提交即可
        let path = "/hacking-task/v1/task/commit"
        try {
            if (key == 1) {//这里是浏览任务
                let options = {
                    method: 'POST',
                    url: this.hostname + path,
                    qs: { sign: this.taskCommit },
                    headers: this.headersPost,
                    body: { taskId: taskId, taskType: taskType.toString() },
                    json: true
                }
                //console.log(options);
                let result = await httpRequest(options, "结束做任务");
                //console.log(result);
                if (result.code == 200) {
                    DoubleLog(`账号[${this.index}]  任务结束${result.msg}`);
                } else {
                    DoubleLog(`账号[${this.index}]  任务结束失败:原因未知`);
                    //console.log(result);
                }
            } else if (key == 2) { //这里是收藏任务
                let options = {
                    method: 'POST',
                    url: this.hostname + path,
                    qs: { sign: this.taskCommit2 },
                    headers: this.headersPost,
                    body: { taskId: taskId, taskType: taskType.toString() },
                    json: true
                }
                let result = await httpRequest(options, "结束做任务");
                //console.log(options);
                //console.log(result);
                if (result.code == 200) {
                    DoubleLog(`账号[${this.index}]  任务结束${result.msg}`);
                } else {
                    DoubleLog(`账号[${this.index}]  任务结束失败:原因未知`);
                    //console.log(result);
                }
            } else if (key == 3) { //这里是逛逛
                let options = {
                    method: 'POST',
                    url: this.hostname + path,
                    qs: { sign: this.taskCommit2 },
                    headers: this.headersPost,
                    body: { taskId: taskId, taskType: taskType.toString(), activityType: null, activityId: null, taskSetId: null, venueCode: null, venueUnitStyle: null, taskScene: null },
                    json: true
                }
                let result = await httpRequest(options, "结束做任务");
                //console.log(options);
                //console.log(result);
                if (result.code == 200) {
                    DoubleLog(`账号[${this.index}]  任务结束${result.msg}`);
                } else {
                    DoubleLog(`账号[${this.index}]  任务结束失败:原因未知`);
                    //console.log(result);
                }
            }
            //console.log(options);

            //console.log(result);

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
    await SendMsg(msg);
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());


// #region ********************************************************  固定代码  ********************************************************

// 变量检查与处理
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
    return console.log(`共找到${userCount}个账号`), true;//true == !0
}
// =========================================== 不懂不要动 =========================================================
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
// 网络请求 (get, post等)
async function httpRequest(options, name) { var request = require("request"); return new Promise((resolve) => { if (!name) { let tmp = arguments.callee.toString(); let re = /function\s*(\w*)/i; let matches = re.exec(tmp); name = matches[1] } if (debug) { console.log(`\n【debug】===============这是${name}请求信息===============`); console.log(options) } request(options, function (error, response) { if (error) throw new Error(error); let data = response.body; try { if (debug) { console.log(`\n\n【debug】===============这是${name}返回数据==============`); console.log(data) } if (typeof data == "string") { if (isJsonString(data)) { let result = JSON.parse(data); if (debug) { console.log(`\n【debug】=============这是${name}json解析后数据============`); console.log(result) } resolve(result) } else { let result = data; resolve(result) } function isJsonString(str) { if (typeof str == "string") { try { if (typeof JSON.parse(str) == "object") { return true } } catch (e) { return false } } return false } } else { let result = data; resolve(result) } } catch (e) { console.log(error, response); console.log(`\n ${name}失败了!请稍后尝试!!`) } finally { resolve() } }) }) }
// 等待 X 秒
function wait(n) { return new Promise(function (resolve) { setTimeout(resolve, n * 1000) }) }
// 双平台log输出
function DoubleLog(data) { if ($.isNode()) { if (data) { console.log(`${data}`); msg += `${data}` } } else { console.log(`${data}`); msg += `${data}` } }
// 发送消息
async function SendMsg(message) { if (!message) return; if (Notify > 0) { if ($.isNode()) { var notify = require("./sendNotify"); await notify.sendNotify($.name, message) } else { $.msg($.name, '', message) } } else { console.log(message) } }
// 完整 Env
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
