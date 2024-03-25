/** 
 * cron 56 8 * * *  gacmotor.js
 * Show:广汽传祺 评论 分享(转发) 签到 发表文章
 * @author https://github.com/smallfawn/QLScriptPublic
 * @tips 本脚本适用于广汽传祺5.0.0以上的版本
 * @update 2024/1/17 新增 广汽传祺年度报告抽奖
 * 文件内基本格式 [{"AT":"","RT":""},{"AT":"","RT":""}] 仓库( https://ghproxy.smallfawn.top/https://raw.githubusercontent.com/smallfawn/QLScriptPublic/main/GacmotorCookies.json )里面有基本模板 使用前必须填写COOKIE
 * 提供三种获取变量COOKIE方式 
 * 1.手动抓https://next.gacmotor.com/app
 * (refreshTokenn和accessToken 在登录时候抓包 https://next.gacmotor.com/app/app-api/sms/sendSmsCodeV2 响应里面) APP有效期都是7天 需要填写refreshToken来刷新COOKIE有效时间
 * 2.通过WoolWeb获取 2w.onecc.cc 里面有APP接口和H5接口  APP接口带刷新CK H5接口不会
 * 3.通过WoolWeb扫码获取 和 APP接口等同
 * 变量示例       AT-11111-ASASASASASASASASASAS填入AT里面 RT-11111-BSBSBSBSBSBSBS填入RT里面
 * 开启发贴       gacmotorPost=false 默认关闭发表文章功能 true为开启(此功能存在风控检测,谨慎开启)
 * 开启评论       gacmotorComment=false 默认关闭评论功能 true为开启(此功能存在风控检测,谨慎开启)
 * 每日抽奖       gacmotorLuckyDram=1  抽奖次数[1-10]  不写默认抽奖一次(首次免费)  以后每次花费2G豆抽奖 每天上限10次
 * 
 */
let GacmotorCookies = './GacmotorCookies.json';//指定文件目录
const $ = new Env("广汽传祺");
const notify = $.isNode() ? require('./sendNotify') : '';
//const { updateEnv11, getEnvs, updateEnv } = require("./ql")
const appVersion = "5.1.1"
//let ckName = "gacmotorToken";
//let envSplitor = ["@", "\n"]; //多账号分隔符
let strSplitor = "#"; //多变量分隔符
let userIdx = 0;
let userList = [];
const fs = require('fs');
let TempAccount = [];


function ReadFiles (filename) {
    let Fileexists = fs.existsSync(filename);//检测文件是否存在
    if (Fileexists) {//如果存在
        console.log("检测到广汽传祺GacmotorCookies.json，载入...");
        TempAccount = fs.readFileSync(filename, 'utf-8');
        if (TempAccount) {
            TempAccount = TempAccount.toString();
            TempAccount = JSON.parse(TempAccount);
        }
    }
}
async function writeFile (fileName, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, data, 'utf8', (err) => {
            if (err) {
                reject(err); // 如果写入操作出错，将错误传递给调用者
                return;
            }
            resolve(); // 写入操作成功，没有错误
        });
    });
}
class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.refreshToken = str.split(strSplitor)[1]; //单账号多变量分隔符
        this.ckStatus = true;
        this.deviceCode = "";
        this.registrationID = "";
        //this.mallToken = str.split(strSplitor)[2];
        this.signInStatus = false//默认签到状态false
        this.userIdStr = ""
        this.name = ""
        this.GDouNum = ""
        this.postList = []//自己
        this.applatestlist = []//最新帖子列表
        this.titleList = []//
        this.contentList = []//
        this.commentList = []
        this.BeiJingTime = ""
        this.powerList = []
        this.mobile = []
        this.accessToken = []
        this.powerId = ""//助力ID
        this.questionId = ""
        this.userAnswerList = []
        this.answerIdList = []
        this.userAnswer = ""
        this.questionTaskId = ''
        this.luckyDrawNum = 0 //抽奖次数
        this.postNotFinishedNum = 0//发帖未完成次数
        this.commentNotFinishedNum = 0//评论未完成次数
        this.sharenNotFinishedNum = 0//转发未完成次数
        this.refreshStatus = false
        this.commenttext = ""

    }
    async main () {
        $.log(`==============开始第${this.index}个账号==============`)
        await this._userInfo();

        if (this.ckStatus == true) {
            await this.mainTask()
        } else {
            if (this.refreshToken !== undefined) {
                $.log(`尝试刷新TOKEN`)
                await this._refreshToken()
                if (this.refreshStatus) {
                    await this._userInfo();
                    await this.mainTask()
                }
            }
        }



    }
    async mainTask () {
        if (process.env["gacmotorLuckyDram"] == undefined) {
            await this._luckyDrawNum()//获取抽奖次数
            if (this.luckyDrawNum > 1) {
                await this._luckyDraw()
            }
        } else if (process.env["gacmotorLuckyDram"] && Number(process.env["gacmotorLuckyDram"]) !== NaN) {
            if (process.env["gacmotorLuckyDram"] !== 0) {
                if (Number(process.env["gacmotorLuckyDram"]) > 10) {
                    console.log(`每天最高抽10次哦`);
                    await this._luckyDrawNum()//获取抽奖次数
                    if (this.luckyDrawNum < 10) {
                        for (let i = 0; i < this.luckyDrawNum; i++) {
                            $.wait(1000)
                            await this._luckyDraw()
                            $.wait(2000)
                        }
                    } else if (this.luckyDrawNum = 10) {
                        for (let index = 0; index < 10; index++) {
                            $.wait(1000)
                            await this._luckyDraw()
                            $.wait(2000)
                        }
                    }

                } else {
                    await this._luckyDrawNum()//获取抽奖次数
                    if (this.luckyDrawNum < Number(process.env["gacmotorLuckyDram"])) {
                        for (let i = 0; i < this.luckyDrawNum; i++) {
                            $.wait(1000)
                            await this._luckyDraw()
                            $.wait(2000)
                        }
                    } else if (this.luckyDrawNum > Number(process.env["gacmotorLuckyDram"])) {
                        for (let index = 0; index < Number(process.env["gacmotorLuckyDram"]); index++) {
                            $.wait(1000)
                            await this._luckyDraw()
                            $.wait(2000)
                        }
                    } else if (this.luckyDrawNum == Number(process.env["gacmotorLuckyDram"])) {
                        for (let index = 0; index < Number(process.env["gacmotorLuckyDram"]); index++) {
                            $.wait(1000)
                            await this._luckyDraw()
                            $.wait(2000)
                        }
                    }

                }
            } else {


            }


        }
        await this._getGDou()
        await this._signInStatus()
        await this._signInCounts()
        if (this.signInStatus == false) {
            await this._signIn()
        }
        await this._taskList()
        /*if (this.postNotFinishedNum !== 0 && this.postNotFinishedNum >= 1 || this.commentNotFinishedNum !== 0 && this.commentNotFinishedNum >= 1) {
            if (process.env["gacmotorPost"] == "true" || process.env["gacmotorComment"] == "true") {
                console.log(`正在远程获取15条随机评论~请等待15-20秒`)
                await this._getText()
            }
        }*/

        if (process.env["gacmotorPost"] == "true") {

            if (this.postNotFinishedNum !== 0 && this.postNotFinishedNum >= 1) {
                console.log(`正在远程获取15条随机一言~请等待10-15秒`)
                await this._getText()
                await this._post(this.titleList[0], this.contentList[0])//可能需要图片
                console.log(`等待10s`)
                await $.wait(10000)
                await this._postlist()
                for (let postId of this.postList) {
                    await this._delete(postId)
                }
            }

        }
        await this._applatestlist()
        if (this.sharenNotFinishedNum !== 0 && this.sharenNotFinishedNum >= 1) {
            for (let postId of this.applatestlist) {
                await this._forward(postId)
            }
        }

        if (process.env["gacmotorComment"] == "true") {
            if (this.commentNotFinishedNum !== 0 && this.commentNotFinishedNum >= 1) {
                this._getText1()
                for (let postId of this.applatestlist) {
                    await this._add(postId, this.commenttext)
                }
            }

        }

        if (process.env["gacmotorComment"] == "true") {
            if (this.commentNotFinishedNum !== 0 && this.commentNotFinishedNum >= 1) {
                console.log(`等待10s`)
                await $.wait(10000)
                console.log(`检测评论列表`);
                await this._commentlist()
                if (this.commentList.length > 0) {
                    for (let commentId of this.commentList) {
                        await this._commentdelete(commentId)
                    }
                }
            }

        }

        await this._activity_lotter_common({ "activityId": "531", "channel": "carapp_channel" })
        //await this._getChinaTime()
        /*console.log(`11/26截止 Do - 广州车展活动 奖品活动结束后14日内发放`);
        if (this.BeiJingTime < 1701014400000) {
            //{"activityId":"467","channel":"carapp_channel"}
            // await this._activity_lotter_common({ "activityId": "467", "channel": "carapp_channel" })
        }*/
        /*每天助力       gacmotorPower=""  (抓这个需要手动做一次任务,我的-超级合伙人-每日任务-分享,微信自己点击自己分享的文章一次)
*               微信抓gmp.spgacmotorsc.com/partner/api-content/base/content/trafficStatistics?  
*               后面的openId的值例如:oQzIW0jx-DbassAsaQgpGsasqXqCWI*/
        /*if (process.env["gacmotorPower"]) {
            console.log(`已设置开启每日助力`);
            await this._power_auth()//登录活动 获取accessToken
            await this._power_list()//获取任务列表
            if (this.powerList.length > 0) {
                for (let taskId of this.powerList) {
                    await this._join_power(taskId)//加入任务  
                    await this._get_power_id(taskId)//获取助力的utid
                    await $.wait(2000)
                    await this._share_power(taskId)//分享
                    await $.wait(2000)
                    if (this.powerId !== "") {
                        await this._power(this.powerId)
                    }
                }
            }
        }*/
        /*if (this.mallToken == undefined) {
            this.mallToken = `DS-${this.ck}`
            console.log(`执行答题&抽奖 并且尝试获取mallToken(如果不是WoolWeb获取的变量 可能执行失败)`);
            //获取答题活动列表
            await this._question_list({ "activityId": 464 })
            if (this.questionTaskId !== "") {
                //获取题目
                await this._question_info({ "activityId": 464, "taskId": this.questionTaskId, "userSubmit": false })
                //答题
                await this._submit_answer({ "activityId": 464, "taskId": this.questionTaskId, "userSubmitAnswerVoList": [{ "questionId": this.questionId, "userAnswer": this.userAnswer, "answerIdList": this.answerIdList }] })
                //抽奖
                let lotterId = "465"
                if (this.questionTaskId == 8) {
                    lotterId = "484"
                } else if (this.questionTaskId == 9) {
                    lotterId = "498"
                } else if (this.questionTaskId == 10) {
                    lotterId = "511"
                } else if (this.questionTaskId == 11) {
                    lotterId = "522"
                } else if (this.questionTaskId == 12) {
                    lotterId = "523"
                }
                await this._activity_lotter_mall({ "activityId": lotterId, "channel": "wx_channel" })
                //console.log(`目测30天内自动到账`)
                console.log(`请微信打开链接截查看中奖规则  https://mall.gacmotor.com/act/turntable?id=${lotterId}`);
                console.log(`加客服的地址 https://mall.gacmotor.com/act/answer-activity?id=464`);
            } else {
                console.log(`本周答题完成或未到活动时间`);
            }
        }*/
    }
    async _refreshToken () {
        try {
            let options = {
                fn: "刷新token",
                method: "post",
                url: `https://next.gacmotor.com/app/app-api/login/refreshAt`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ refreshToken: this.refreshToken })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                $.log(`重置accessToken [${result.data.accessToken}] 重置refeshToken [${result.data.refreshToken}]`)
                //调用青龙API
                //change:2023/12/27 不再调用青龙API 选择修改文件方式
                //删除原变量 
                //let originalValue = this.cookies
                //let newValue = [result.data.accessToken, result.data.refreshToken]
                TempAccount.forEach((TempAccount) => {
                    if (TempAccount.AT === this.ck) {
                        TempAccount.AT = result.data.accessToken;
                        TempAccount.RT = result.data.refreshToken;
                    }
                });
                await writeFile(GacmotorCookies, JSON.stringify(TempAccount, null, 2))
                this.ck = result.data.accessToken
                this.refreshStatus = true

                //console.log(arr);
                /*if (this.mallToken !== undefined) {
                    newValue = `${result.data.accessToken}${strSplitor}${result.data.refreshToken}${strSplitor}${this.mallToken}`
                } else {
                    newValue = `${result.data.accessToken}${strSplitor}${result.data.refreshToken}`
                }*/
                /*let env = await getEnvs(ckName)
                if (env[0].value.indexOf(originalValue) !== -1) {
                    let newEnv = env[0].value.replaceAll(originalValue, newValue)
                    if (process.env["QLVersion"] == "old") {
                        await updateEnv(newEnv, env[0].id, null, ckName)
                    } else {
                        await updateEnv11(newEnv, env[0].id, null, ckName)
                    }
                    this.refreshStatus = true
                }*/

            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                this.ckStatus = false
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _getChinaTime () {
        try {
            let options = {
                fn: "获取北京时间",
                method: "get",
                url: `http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp`,
            }
            let { body: result } = await httpRequest(options)
            result = JSON.parse(result)
            this.BeiJingTime = result.data.t
        } catch (e) {
            console.log(e);
        }
    }
    async _activity_lotter_common (body) {
        try {
            let options = {
                fn: "活动抽奖",
                method: "post",
                url: `https://next.gacmotor.com/mall/activity-app/customer/activityPrize/lotter?notip=true`,
                headers: {
                    "Host": "next.gacmotor.com",
                    "Connection": "keep-alive",
                    "Accept": "application/json, text/plain, */*",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36 WindVane/8.5.0 StatusBarHeight/31 channel/GACClient",
                    "token": this.ck,
                    "Content-Type": "application/json;charset=UTF-8",
                    "Origin": "https://next.gacmotor.com",
                    "X-Requested-With": "com.cloudy.component",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Dest": "empty",
                    "Referer": "https://next.gacmotor.com/mall/act/turntable?id=467",
                    "Accept-Encoding": "gzip, deflate",
                    "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
                },
                body: JSON.stringify(body)
            }
            //console.log(options)
            let { body: result } = await httpRequest(options)
            result = JSON.parse(result)
            if (result.code == "0000") {
                $.log(`抽奖成功获得[${result.data.name}]`)
            } else {
                console.log(`抽奖失败`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _activity_lotter_mall (body) {
        try {
            let options = {
                fn: "活动抽奖(mall)",
                method: "post",
                url: `https://mall.gacmotor.com/activity-app/customer/activityPrize/lotter?notip=true`,
                headers: this._getHeaders_mall("post"),
                body: JSON.stringify(body)
            }
            //console.log(options)
            let { body: result } = await httpRequest(options)
            result = JSON.parse(result)
            if (result.code == "0000") {
                $.log(`答题活动抽奖成功 获得[${result.data.name}]`)
            } else {
                console.log(`抽奖失败`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _question_list (body) {
        try {
            let options = {
                fn: "获取答题活动列表",
                method: "post",
                url: `https://mall.gacmotor.com/e-small-bff/fronted/activityAnswer/queryAnswerActivityInfo`,
                headers: this._getHeaders_mall("post"),
                body: JSON.stringify(body)
            }
            //console.log(options)
            let { body: result } = await httpRequest(options)
            result = JSON.parse(result)
            if (result.code == "0000") {
                for (let id of result.data.taskInfoList) {
                    if (id.endTime > this.BeiJingTime && this.BeiJingTime > id.startTime && id.userSubmit == false) {
                        this.questionTaskId = id.id
                    }
                }
            } else {
                console.log(`获取问题和选项失败`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }


    async _question_info (body) {
        try {
            let options = {
                fn: "获取问题和选项",
                method: "post",
                url: `https://mall.gacmotor.com/e-small-bff/fronted/activityAnswer/queryQuestionInfo`,
                headers: this._getHeaders_mall("post"),
                body: JSON.stringify(body)
            }
            //console.log(options)
            let { body: result } = await httpRequest(options)
            result = JSON.parse(result)
            if (result.code == "0000") {
                this.questionId = result.data.questionInfoList[0].id
                this.answerIdList = []
                for (let answer of result.data.questionInfoList[0].answerInfoList) {
                    this.answerIdList.push(answer.id)
                    this.userAnswerList.push(answer.answerDesc)
                }
                this.userAnswer = this.userAnswerList.join(';');
            } else {
                console.log(`获取问题和选项失败`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }


    async _submit_answer (body) {
        try {
            let options = {
                fn: "回答问题",
                method: "post",
                url: `https://mall.gacmotor.com/e-small-bff/fronted/activityAnswer/submitAnswer`,
                headers: this._getHeaders_mall("post"),
                body: JSON.stringify(body)
            }
            //console.log(options)
            let { body: result } = await httpRequest(options)
            result = JSON.parse(result)
            if (result.code == "0000") {
                console.log(`回答问题` + result.success);
            } else {
                console.log(`回答问题失败`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _getText () {
        try {
            let textList = []
            let options = {
                fn: "获取随机一言",
                method: "get",
                url: `https://v1.hitokoto.cn/?c=e`,
            }
            for (let i = 0; i < 10; i++) {
                await $.wait(1000)
                let { body: result } = await httpRequest(options);
                //console.log(options);
                result = JSON.parse(result);
                //console.log(result);
                if (result.hitokoto["length"] > 10) {
                    textList.push(result.hitokoto)
                }
                this.titleList = [textList[0]]
                this.contentList = [textList[1]]
            }
        } catch (e) {
            console.log(e);
        }
    }
    _getText1 () {
        try {
            let textList = [
                `好看好用，我也想拥有同款！`,
                `好看好开猴赛雷，广汽传祺YYDS！`,
                `打破0回复，帮你顶个楼！`,
                `人间自有真情在，给个点赞最实在！`,
                `实力顶帖，为君打call！`]

            this.commenttext = [textList[Math.floor(Math.random() * 5)]]

        } catch (e) {
            console.log(e);
        }
    }

    async _join_power (taskId) {
        try {
            let options = {
                fn: "加入助力",
                method: "post",
                url: `https://gmp.spgacmotorsc.com/partner/api-content/app/tasks/joinTask`,
                headers: this._getHeaders_gmp("post"),
                body: `taskId=${taskId}&companyCode=CHUANQI&phone=${this.mobile}`
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.errorCode == "0") {
                console.log(`添加助力任务成功`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _power_list () {
        try {
            let options = {
                fn: "助力任务列表获取",
                method: "get",
                url: `https://gmp.spgacmotorsc.com/partner/api-content/app/tasks/list?page=0&size=10&channelType=WEIXIN&taskType=SHARE&companyCode=CHUANQI&phone=${this.mobile}`,
                headers: this._getHeaders_gmp("get"),
            }
            //console.log(options);
            let { body: result } = await httpRequest(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.errorCode == "0") {
                for (let i of result.body.rows) {
                    if (i.isFinish == 1) {
                        this.powerList.push(i.taskId)
                    }
                }
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(`请先手动完成一次任务`);
            //console.log(e);
        }
    }

    async _power_auth () {
        try {
            let headers = this._getHeaders("get")
            headers["Host"] = `gmp.spgacmotorsc.com`
            let options = {
                fn: "助力任务登录",
                method: "get",
                url: `https://gmp.spgacmotorsc.com/partner/api-user/app/auth/judge?phone=${this.mobile}&companyCode=CHUANQI`,
                headers: headers,
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.body.isAuth == true) {
                this.accessToken = result.body.user.accessToken;
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(`请先手动完成一次任务`);
            //console.log(e);
        }
    }

    async _get_power_id (taskId) {
        try {
            let options = {
                fn: "助力任务ID获取",
                method: "get",
                url: `https://gmp.spgacmotorsc.com/partner/api-content/app/tasks/detail?taskId=${taskId}&companyCode=CHUANQI&phone=${this.mobile}`,
                headers: this._getHeaders_gmp("get"),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.errorCode == "0") {
                let shareUrl = result.body.shareUrl
                var regex = /utId=([^&]+)/;
                var match = shareUrl.match(regex);
                if (match) {
                    this.powerId = match[1];
                    console.log(`助力ID获取成功${this.powerId}`);
                } else {
                    console.log("未找到utId的值");
                }
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _share_power (taskId) {
        try {
            let options = {
                fn: "助力任务分享",
                method: "post",
                url: `https://gmp.spgacmotorsc.com/partner/api-content/app/tasks/backFillH5`,
                headers: this._getHeaders_gmp("post"),
                body: `taskId=${taskId}&companyCode=CHUANQI&phone=${this.mobile}`
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.errorCode == "0") {
                console.log(result.body);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _power () {
        try {
            let options = {
                fn: "助力",
                method: "get",
                url: `https://gmp.spgacmotorsc.com/partner/api-content/base/content/trafficStatistics?id=11131879&openId=` + process.env["gacmotorPower"],
                headers: {
                    "Host": "gmp.spgacmotorsc.com",
                    "Connection": "keep-alive",
                    "Accept": "application/json, text/plain, */*",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 XWEB/1110017 MMWEBSDK/20230405 MMWEBID/2585 MicroMessenger/8.0.35.2360(0x2800235D) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
                    "X-Requested-With": "com.tencent.mm",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Dest": "empty",
                    "Referer": "https://gmp.spgacmotorsc.com/h5/partner/",
                    "Accept-Encoding": "gzip, deflate",
                    "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
                },
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.errorCode == "0") {
                $.log(`助力执行成功 可能助力失败 正常情况`)
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _userInfo () {
        try {
            let options = {
                fn: "信息查询",
                method: "post",
                url: `https://next.gacmotor.com/app/app-api/user/getLoginUser`,
                headers: this._getHeaders("post"),
                body: ``
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                this.mobile = Buffer.from(result.data.ms, 'base64').toString('utf-8');
                Buffer.from(result.data.ms, 'base64').toString('utf-8');
                $.log(`[${result.data.mobile}][${result.data.nickname}][${result.data.userIdStr}]`)
                this.name = `昵称 [${result.data.nickname}]`
                this.userIdStr = result.data.userIdStr;
                this.ckStatus = true
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                this.ckStatus = false
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _taskList () {
        try {
            let options = {
                fn: "任务情况查询",
                method: "get",
                url: `https://next.gacmotor.com/app/community-api/user/mission/getUserMissionList?place=1`,
                headers: this._getHeaders("get"),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                //result.data[0].total - result.data[0].finishedNum//签到
                this.postNotFinishedNum = Number(result.data[1].total) - Number(result.data[1].finishedNum)//发帖
                this.commentNotFinishedNum = Number(result.data[2].total) - Number(result.data[2].finishedNum)//评论
                this.sharenNotFinishedNum = Number(result.data[3].total) - Number(result.data[3].finishedNum)//分享
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                this.ckStatus = false
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _luckyDrawNum () {
        try {
            let options = {
                fn: "抽奖次数查询",
                method: "get",
                url: `https://next.gacmotor.com/app/activity/shopDraw/getchances?activityCode=shop-draw`,
                headers: this._getHeaders("get"),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                this.luckyDrawNum = result.data
                console.log(`抽奖次数剩余${this.luckyDrawNum}次`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                this.ckStatus = false
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _luckyDraw () {
        try {
            let options = {
                fn: "抽奖",
                method: "post",
                url: `https://next.gacmotor.com/app/activity/shopDraw/luckyDraw`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ "activityCode": "shop-draw", "repeatcheck": true })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                $.log(`抽奖成功获得[${result.data.medalName}]`)

            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                this.ckStatus = false
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _getGDou () {
        try {
            let options = {
                fn: "G豆查询",
                method: "get",
                url: `https://next.gacmotor.com/app/app-api/user/getUserGdou`,
                headers: this._getHeaders("get"),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                this.GDouNum = `G豆 [${result.data}]`
                $.log(`当前G豆数量[${result.data}]`)
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _applatestlist () {
        try {
            let options = {
                fn: "最新帖子列表",
                method: "get",
                url: `https://next.gacmotor.com/app/community-api/community/api/post/applatestlist?pageNum=1&pageSize=10`,
                headers: this._getHeaders("get"),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                this.applatestlist = [result.data.list[0].postVo.postId]
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _signInStatus () {
        try {
            let options = {
                fn: "签到查询",
                method: "get",
                url: `https://next.gacmotor.com/app/app-api/sign/signStatus`,
                headers: this._getHeaders("get"),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                if (result.data == true) {
                    //已签
                    this.signInStatus = true;
                } else {
                    //未签
                    this.signInStatus = false
                }
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _signInCounts () {
        try {
            let options = {
                fn: "签到信息",
                method: "get",
                url: `https://next.gacmotor.com/app/app-api/sign/countSignDays`,
                headers: this._getHeaders("get"),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                $.log(`已经连续签到${result.data}天`)
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _signIn () {
        try {
            let options = {
                fn: "签到执行",
                method: "get",
                url: `https://next.gacmotor.com/app/app-api/sign/submit`,
                headers: this._getHeaders("get"),
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                $.log(`签到[${result.resultMsg}]`)
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _forward (postId) {
        try {
            let options = {
                fn: "转发",
                method: "post",
                url: `https://next.gacmotor.com/app/community-api/community/api/post/forward`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ "postId": postId })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`转发[${result.resultMsg}]`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _add (postId, commentContent) {
        try {
            let options = {
                fn: "评论",
                method: "post",
                url: `https://next.gacmotor.com/app/community-api/community/api/comment/add`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ "commentType": 0, "postId": postId, "commentContent": commentContent, "isReplyComment": 1, "commentImg": "" })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`评论[${result.resultMsg}]`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _commentlist () {
        try {
            let options = {
                fn: "获取评论列表",
                method: "post",
                url: `https://next.gacmotor.com/app/community-api/community/api/comment/post`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ "pageNum": 1, "pageSize": 10, "userIdStr": this.userIdStr })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                if (result["data"].length > 0) {
                    this.commentList = [result.data[0].commentId]
                }
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _commentdelete (commentId) {
        try {
            let options = {
                fn: "删除评论",
                method: "post",
                url: `https://next.gacmotor.com/app/community-api/community/api/comment/delete`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ "commentId": `${commentId}` })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`删除评论[${result.resultMsg}]`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    async _post (postTitle, postContent) {
        try {
            let options = {
                fn: "发表文章",
                method: "post",
                url: `https://next.gacmotor.com/app/community-api/community/api/post/appsavepost`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ "address": "", "channelInfoId": "", "cityId": "", "columnId": "", "commodityId": "", "commodityMainImage": "", "commodityName": "", "commodityType": "", "contentImgNums": 0, "contentWords": postContent, "coverImg": "", "customCover": "https://pic-gsp.gacmotor.com/app/a7b1a896-4f92-449f-859e-5e238d131ea3.jpg", "detailAddress": "", "lat": "", "lng": "", "orderId": "", "orderPrice": "", "orderSn": "", "orderType": "", "postContent": `[{\"text\":\"${postContent}\"}]`, "postTitle": postTitle, "postType": "2", "rankTotal": "", "topicId": "", "vin": "", "weekRank": "" })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`发表文章[${result.resultMsg}]`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _delete (postId) {
        try {
            let options = {
                fn: "删除文章",
                method: "post",
                url: `https://next.gacmotor.com/app/community-api/community/api/post/delete`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ "postId": postId.toString() })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                console.log(`删除文章[${result.resultMsg}]`);
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }

    async _postlist () {
        try {
            let options = {
                fn: "文章列表",
                method: "post",
                url: `https://next.gacmotor.com/app/community-api/community/api/post/querylist`,
                headers: this._getHeaders("post"),
                body: JSON.stringify({ "pageNum": 1, "pageSize": 10, "userIdStr": this.userIdStr, "userId": this.userIdStr, "myHome": true })
            }
            let { body: result } = await httpRequest(options);
            //console.log(options);
            result = JSON.parse(result);
            //console.log(result);
            if (result.resultCode == "0") {
                //文章ID result.data.list[0].postId
                this.postList = [result.data.list[0].postId];
            } else {
                console.log(`❌${options.fn}状态[${result.resultMsg}]`);
                console.log(JSON.stringify(result));
            }
        } catch (e) {
            console.log(e);
        }
    }
    _MD5 (str) {
        const crypto = require("crypto");
        return crypto.createHash("md5").update(str).digest("hex");
    }
    _getHeaders (method) {
        let timestamp1 = new Date().getTime();
        let timestamp2 = new Date().getTime();
        let nonce = Math.floor(100000 + Math.random() * 900000);
        let appid = `8c4131ff-e326-43ea-b333-decb23936673`
        let key = `46856407-b211-4a10-9cb2-5a9b94361614`
        let sig = this._MD5(`${timestamp1}${nonce}${appid}${key}`)
        let apiSignKey = `a361588rt20dpol`
        let apiSign = (this._MD5(`${timestamp2}${apiSignKey}`)).toUpperCase()
        if (method == "get") {
            return {
                "Accept": "application/json",
                "appToken": this.ck,
                "deviceCode": this.deviceCode,
                "current-time": timestamp2,
                "deviceId": this.registrationID,
                "version": appVersion,
                "nonce": nonce,
                "token": this.ck,
                "Authorization": `Bearer ${this.ck}`,
                "sig": sig,
                "platformNo": "Android",
                "osVersion": 10,
                "operateSystem": "android",
                "appId": appid,
                "registrationID": this.registrationID,
                "api-sign": apiSign,
                "deviceModel": "IQOO 10",
                "timestamp": timestamp1,
                //"Content-Type": "application/json; charset=UTF-8",
                //"Content-Length": 24,
                "Host": "next.gacmotor.com",
                "Connection": "Keep-Alive",
                "Accept-Encoding": "gzip",
                "User-Agent": "okhttp/4.8.1"
            }
        } else {
            return {
                "Accept": "application/json",
                "appToken": this.ck,
                "deviceCode": this.deviceCode,
                "current-time": timestamp2,
                "deviceId": this.registrationID,
                "version": appVersion,
                "nonce": nonce,
                "token": this.ck,
                "Authorization": `Bearer ${this.ck}`,
                "sig": sig,
                "platformNo": "Android",
                "osVersion": 10,
                "operateSystem": "android",
                "appId": appid,
                "registrationID": this.registrationID,
                "api-sign": apiSign,
                "deviceModel": "IQOO 10",
                "timestamp": timestamp1,
                "Content-Type": "application/json; charset=UTF-8",
                //"Content-Length": 24,
                "Host": "next.gacmotor.com",
                "Connection": "Keep-Alive",
                "Accept-Encoding": "gzip",
                "User-Agent": "okhttp/4.8.1"
            }
        }
    }
    _getHeaders_gmp (method) {
        let timestamp2 = new Date().getTime();
        let apiSignKey = `a361588rt20dpol`
        let apiSign = (this._MD5(`${timestamp2}${apiSignKey}`)).toUpperCase()
        if (method == "get") {
            return {
                "Host": "gmp.spgacmotorsc.com",
                "Connection": "keep-alive",
                "accessToken": this.accessToken,
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36 WindVane/8.5.0 StatusBarHeight/31 channel/GACClient",
                "client": "app",
                "Content-Type": "application/x-www-form-urlencoded",
                "current-time": timestamp2,
                "companyCode": "CHUANQI",
                "api-sign": apiSign,
                "ver": "20220513",
                "Accept": `*/*`,
                "Origin": "https://gmp.spgacmotorsc.com",
                "X-Requested-With": "com.cloudy.component",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Dest": "empty",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            }
        } else {
            return {
                "Host": "gmp.spgacmotorsc.com",
                "Connection": "keep-alive",
                "accessToken": this.accessToken,
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36 WindVane/8.5.0 StatusBarHeight/31 channel/GACClient",
                "client": "app",
                "Content-Type": "application/x-www-form-urlencoded",
                "current-time": timestamp2,
                "companyCode": "CHUANQI",
                "api-sign": apiSign,
                "ver": "20220513",
                "Accept": "*/*",
                "Origin": "https://gmp.spgacmotorsc.com",
                "X-Requested-With": "com.cloudy.component",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Dest": "empty",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            }
        }
    }
    _getHeaders_mall (method) {
        if (method == "get") {
            return {
                "Host": "mall.gacmotor.com",
                "Connection": "keep-alive",
                "Accept": "application/json, text/plain, */*",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 XWEB/1110017 MMWEBSDK/20230405 MMWEBID/2585 MicroMessenger/8.0.35.2360(0x2800235D) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
                "token": this.mallToken,
                "Content-Type": "application/json;charset=UTF-8",
                "Origin": "https://mall.gacmotor.com",
                "X-Requested-With": "com.tencent.mm",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Dest": "empty",
                "Referer": "https://mall.gacmotor.com/act/answer-activity-detail?id=464&taskId=7&userSubmit=0",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
            }
        } else {
            return {
                "Host": "mall.gacmotor.com",
                "Connection": "keep-alive",
                "Accept": "application/json, text/plain, */*",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 XWEB/1110017 MMWEBSDK/20230405 MMWEBID/2585 MicroMessenger/8.0.35.2360(0x2800235D) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
                "token": this.mallToken,
                "Content-Type": "application/json;charset=UTF-8",
                "Origin": "https://mall.gacmotor.com",
                "X-Requested-With": "com.tencent.mm",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Dest": "empty",
                "Referer": "https://mall.gacmotor.com/act/answer-activity-detail?id=464&taskId=7&userSubmit=0",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
            }
        }
    }
}

async function start () {
    if (process.env["gacmotorPost"] == "true") {
        $.log(`已开启发帖`)
    } else {
        $.log(`未开启发帖`)
    }
    if (process.env["gacmotorComment"] == "true") {
        $.log(`已开启评论`)
    } else {
        $.log(`未开启评论`)
    }
    if (process.env["gacmotorLuckyDram"] && Number(process.env["gacmotorLuckyDram"]) !== NaN) {
        $.log(`已设置抽奖次数[${process.env["gacmotorLuckyDram"]}]次`)
    } else {
        $.log(`未设置抽奖次数 默认抽奖1次`)
    }

    let taskall = [];

    for (let user of userList) {
        await user.main()
    }
    await Promise.all(taskall);
    $.msg($.name, "广汽传祺任务 Over", "smallfawn 提醒您 天冷加衣")
}

!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        await start();
    }

    await SendMsg($.logs.join("\n"))
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

//********************************************************
/**
 * 变量检查与处理
 * @returns
 */
async function checkEnv () {
    ReadFiles(GacmotorCookies)
    if (TempAccount.length <= 0) {
        return
    }
    for (let cookie of TempAccount) {
        if (cookie["AT"] && cookie["RT"]) {
            let n = `${cookie["AT"]}#${cookie["RT"]}`
            userList.push(new UserInfo(n));
        } else {
            //不可为空
        }
    }
    return console.log(`共找到${userList.length}个账号`), true; //true == !0
}

/////////////////////////////////////////////////////////////////////////////////////
function httpRequest (options) {
    if (!options["method"]) {
        return console.log(`请求方法不存在`);
    }
    if (!options["fn"]) {
        console.log(`函数名不存在`);
    }
    return new Promise((resolve) => {
        $[options.method](options, (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err);
                } else {
                    try {
                        resp = JSON.parse(resp);
                    } catch (error) { }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(resp);
            }
        });
    });
}
async function SendMsg (message) {
    if (!message) return;
    if ($.isNode()) {
        await notify.sendNotify($.name, message)
    } else {
        $.msg($.name, '', message)
    }
}
// prettier-ignore
function Env (t, s) { return new (class { constructor(t, s) { (this.name = t), (this.data = null), (this.dataFile = "box.dat"), (this.logs = []), (this.logSeparator = "\n"), (this.startTime = new Date().getTime()), Object.assign(this, s), this.log("", `\ud83d\udd14${this.name},\u5f00\u59cb!`) } isNode () { return "undefined" != typeof module && !!module.exports } isQuanX () { return "undefined" != typeof $task } isSurge () { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon () { return "undefined" != typeof $loon } getScript (t) { return new Promise((s) => { this.get({ url: t }, (t, e, i) => s(i)) }) } runScript (t, s) { return new Promise((e) => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); (o = o ? 1 * o : 20), (o = s && s.timeout ? s.timeout : o); const [h, a] = i.split("@"), r = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": h, Accept: "*/*" }, }; this.post(r, (t, s, i) => e(i)) }).catch((t) => this.logErr(t)) } loaddata () { if (!this.isNode()) return {}; { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata () { if (this.isNode()) { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get (t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (((o = Object(o)[t]), void 0 === o)) return e; return o } lodash_set (t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), (s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : (t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}), t)[s[s.length - 1]] = e), t) } getdata (t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata (t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? ("null" === h ? null : h || "{}") : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), (e = this.setval(JSON.stringify(s), i)) } catch (s) { const h = {}; this.lodash_set(h, o, t), (e = this.setval(JSON.stringify(h), i)) } } else e = this.setval(t, s); return e } getval (t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? ((this.data = this.loaddata()), this.data[t]) : (this.data && this.data[t]) || null } setval (t, s) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, s) : this.isQuanX() ? $prefs.setValueForKey(t, s) : this.isNode() ? ((this.data = this.loaddata()), (this.data[s] = t), this.writedata(), !0) : (this.data && this.data[s]) || null } initGotEnv (t) { (this.got = this.got ? this.got : require("got")), (this.cktough = this.cktough ? this.cktough : require("tough-cookie")), (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()), t && ((t.headers = t.headers ? t.headers : {}), void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get (t, s = () => { }) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? $httpClient.get(t, (t, e, i) => { !t && e && ((e.body = i), (e.statusCode = e.status)), s(t, e, i) }) : this.isQuanX() ? $task.fetch(t).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, s) => { try { const e = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(e, null), (s.cookieJar = this.ckjar) } catch (t) { this.logErr(t) } }).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h, } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t))) } post (t, s = () => { }) { if ((t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), delete t.headers["Content-Length"], this.isSurge() || this.isLoon())) $httpClient.post(t, (t, e, i) => { !t && e && ((e.body = i), (e.statusCode = e.status)), s(t, e, i) }); else if (this.isQuanX()) (t.method = "POST"), $task.fetch(t).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: e, ...i } = t; this.got.post(e, i).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)) } } time (t) { let s = { "M+": new Date().getMonth() + 1, "d+": new Date().getDate(), "H+": new Date().getHours(), "m+": new Date().getMinutes(), "s+": new Date().getSeconds(), "q+": Math.floor((new Date().getMonth() + 3) / 3), S: new Date().getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg (s = t, e = "", i = "", o) { const h = (t) => !t || (!this.isLoon() && this.isSurge()) ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o))); let logs = ['', '==============📣系统通知📣==============']; logs.push(t); e ? logs.push(e) : ''; i ? logs.push(i) : ''; console.log(logs.join('\n')); this.logs = this.logs.concat(logs) } log (...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr (t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t) } wait (t) { return new Promise((s) => setTimeout(s, t)) } done (t = {}) { const s = new Date().getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } })(t, s) }
