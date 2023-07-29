/**
 * new Env("广汽传祺");
 * cron 47 19 * * *  gqcq.js
 * modify:低保版
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * 抓请求头token&imei&registrationID
 * 缺一不可
 * 不要用云服务器挂 不要用云服务器挂 不要用云服务器挂
 * export gqcq_data='token&imei&registrationID'
 * 
 * 多账号用 @ 分割
 * 抓包 gsp.gacmotor.com , 找到token即可
 * ====================================
 * 
 */



const $ = new Env("广汽传祺");
const ckName = "gqcq_data";
//-------------------- 一般不动变量区域 -------------------------------------
const Notify = 1;		 //0为关闭通知,1为打开通知,默认为1
const notify = $.isNode() ? require('./sendNotify') : '';
let envSplitor = ["@"]; //多账号分隔符
let msg;//声明通知变量
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
//---------------------- 自定义变量区域 -----------------------------------
let topicIdArr = []//文章ID数组
//---------------------------------------------------------

async function start() {
    console.log('\n============= 用户CK有效性验证 =============\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.user_info());
        //await $.wait(3000);
    }
    await Promise.all(taskall);
    console.log('\n================== 任务 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            taskall.push(await user.user_boxList());
            //await $.wait(3000);
            taskall.push(await user.task_list());
            //await $.wait(3000);
        }
    }
    await Promise.all(taskall);

    /*console.log('\n================== 点赞 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            for (let o in topicIdArr) {
                taskall.push(await user.eachother_like(topicIdArr[o]));
                await $.wait(3000);
            }
        }
    }
    await Promise.all(taskall);*/

    taskall = [];
    for (let user of userList) {
        taskall.push(await user.user_info());
        //await $.wait(3000);
    }
    await Promise.all(taskall);



}


class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split('&')[0];
        //let ck = str.split('&')
        //this.data1 = ck[0]
        this.ckStatus = true
        this.salt = '17aaf8118ffb270b766c6d6774317a134.1.2';
        this.reqNonc = randomInt(100000, 999999)
        this.imei = str.split('&')[1];
        this.registrationID = str.split('&')[2];
        this.headersOne = {
            'token': this.ck,
            'reqTs': Number(ts13()),
            'reqSign': this.getSign(ts13(), this.reqNonc),
            'reqNonc': this.reqNonc,
            'channel': 'unknown',
            'platformNo': 'Android',
            'osVersion': '10',
            'version': '4.1.2',
            'imei': this.imei,
            'imsi': 'unknown',
            'deviceModel': 'MI 8',
            'deviceType': 'Android',
            'registrationID': this.registrationID,
            'verification': 'signature',
            'Host': 'gsp.gacmotor.com',
            'User-Agent': 'okhttp/3.10.0',
        }
        this.headersTwo = {
            "token": this.ck,
            "Host": "gsp.gacmotor.com",
            "Origin": "https://gsp.gacmotor.com",
            "Accept": "application/json, text/plain, */*",
            "Cache-Control": "no-cache",
            "Sec-Fetch-Dest": "empty",
            "X-Requested-With": "com.cloudy.component",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Referer": "https://gsp.gacmotor.com/h5/html/draw/index.html",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        //this.randomTime1 = this.getRandomTime('1')
        //this.randomTime2 = this.getRandomTime('2')
        this.userIdStr = null
        this.userphone = null


    }
    getSign(ts, reqNonc) {
        let salt = '17aaf8118ffb270b766c6d6774317a134.1.2'
        let sign = MD5Encrypt(`signature${reqNonc}${ts}${salt}`).toString()
        return sign
    }
    getText() {
        /*let textarr = ['最简单的提高观赏性的办法就是把地球故事的部分剪辑掉半小时， emo的部分剪辑掉半小时。这样剩下的90分钟我们就看看外星人，看看月球，看看灾难片大场面就不错。', '顶着叛国罪的风险无比坚信前妻，这种还会离婚？', '你以为它是灾难片，其实它是科幻片；你以为它是科幻片，其实它是恐怖片；你以为它是恐怖片，其实它是科教片', '我的天，剧情真的好阴谋论，但是还算是能自圆其说', '大杂烩啊……我能理解这电影为什么在海外卖的不好了，因为核心创意真的已经太老套了', '一开始我以为这就是外国人看《流浪地球》时的感受啊，后来发现这不是我当初看《胜利号》的感受么']
        let ranNum = randomInt(1, textarr.length)
        let text = textarr[ranNum]
        return text*/
    }
    async getCommentText() {
        // let add_comment_text_arr = ['感谢推荐的电影呢', '有时间一定看看这个电影怎么样', '晚上就去看', '66666666666', '这部电影我看过，非常好看']
        // let ranNum = randomInt(1, add_comment_text_arr.length)
        // let text = add_comment_text_arr[ranNum]
        /*let com = yiyan();
        console.log(com)
        return com;*/
        //return await yiyan();
    }
    getRandomTime(type) {
        let randomTime;
        switch (type) {
            case '1':
                randomTime = randomInt(2000, 9000)
                break;
            case '2':
                randomTime = randomInt(11000, 19000)
                break
        }
        return randomTime;
    }
    async user_info() {//userinfo
        try {
            let options = {
                url: `https://gsp.gacmotor.com/gateway/webapi/account/getUserInfoV2`,
                headers: this.headersOne,
            }
            //console.log(options);
            let result = await httpRequest(options);
            // console.log(result);
            if (typeof result !== 'undefined' && 'errorCode' in result) {
                if (result.errorCode == 200) {
                    //DoubleLog(`账号[${this.index}]  ck验证成功: G金[${result.integralResponse.currentFund}] `);
                    let username = result.data.nickname
                    this.userIdStr = encodeURIComponent(result.data.userIdStr)
                    this.userphone = phone_num(result.data.mobile)
                    await this.user_point(username)
                    this.ckStatus = true
                } else {
                    DoubleLog(`账号[${this.index}]  ck验证失效,原因未知！`);
                    this.ckStatus = false
                    console.log(result);
                }
            } else {
                return console.log(`Api请求频繁,退出请求`);
            }

        } catch (e) {
            console.log(e);
        }
    }
    async user_point(username,) {//userinfo
        try {
            let options = {
                url: `https://gsp.gacmotor.com/gateway/app-api/my/statsV3`,
                headers: this.headersOne,
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (typeof result !== 'undefined' && 'errorCode' in result) {
                if (result.errorCode == 200) {
                    DoubleLog(`账号[${this.index}]  CK验证成功: 用户名：${username}  积分[${result.data.pointCount}]  手机号[${this.userphone}]`);
                } else {
                    DoubleLog(`账号[${this.index}]  CK验证失效  原因未知！`);
                    console.log(result);
                }
            } else {
                return console.log(`Api请求频繁,退出请求`);
            }

        } catch (e) {
            console.log(e);
        }
    }
    async user_boxList() {
        let options = {
            url: 'https://gsp.gacmotor.com/gw/app/activity/api/winrecord/unopenlist',
            headers: this.headersTwo,
            body: 'activityCode=SIGN-BOX'
        }
        //console.log(options)
        let result = await httpRequest(options)
        //console.log(result)
        if (typeof result !== 'undefined' && 'errorCode' in result) {
            if (result.errorCode == 20000) {
                this.box = result.data
                DoubleLog(`账号[${this.index}] 共有宝箱:${this.box.length}个!`)
                if (this.box.length > 0) {
                    for (let i = 0; i < this.box.length; i++) {
                        this.boxid = this.box[i].recordId
                        await this.task_openBox()
                        //await $.wait(2000)
                    }
                }
            } else {
                DoubleLog(`账号[${this.index}]  获取宝箱信息失效,原因未知！`);
                console.log(result);
            }
        } else {
            return console.log(`Api请求频繁,退出请求`);
        }

    }
    async task_openBox() {
        let options = {
            url: 'https://gsp.gacmotor.com/gw/app/activity/api/medal/openbox',
            headers: this.headersTwo,
            body: `activityCode=OPEN-BOX&recordId=${this.boxid}`
        }
        //console.log(options)
        let result = await httpRequest(options)
        if (typeof result !== 'undefined' && 'errorCode' in result) {
            if (result.errorCode == 20000) {
                DoubleLog(`账号[${this.index}] 开宝箱:${result.errorMessage} ,恭喜你获得 ${result.data.medalName} 奖品为 ${result.data.medalDescription}`)
            } else {
            }
        } else {
            return console.log(`Api请求频繁,退出请求`);
        }
    }
    async task_list() {//DO
        try {
            let options = {
                url: `https://gsp.gacmotor.com/gw/app/community/api/mission/getlistv1?place=1`,
                headers: this.headersOne,
                body: ''
            }
            //console.log(options);
            let result = await httpRequest(options)
            if (typeof result !== 'undefined' && 'errorCode' in result) {
                if (result.errorCode == 20000) {
                    if (result.data[0].itemType == 0 && result.data[0].finishedNum == 0) {
                        DoubleLog(`账号[${this.index}] 签到状态： 未签到，去执行签到 ,顺便抽个奖`);
                        await this.task_signin();
                        //DoubleLog(`随机延迟${this.getRandomTime('1')}ms`)
                        //await $.wait(this.getRandomTime('1'))
                        await this.task_lottery();
                    } else if (result.data[0].finishedNum == 1) {
                        DoubleLog(`账号[${this.index}] 签到状态：今天已经签到过了鸭，明天再来吧！`);
                    } else {
                        DoubleLog(`账号[${this.index}] 获取签到状态:  失败 ❌ 了呢,原因未知！`);
                    }
                    if (result.data[1].itemType == 1 && result.data[1].finishedNum < 2) {
                        //DoubleLog(`账号[${this.index}] 发帖：${result.data[1].finishedNum} / ${result.data[1].total}`);
                        //DoubleLog(`账号[${this.index}] 发帖：执行一次发帖,评论，删除评论`);
                        //await this.post_topic();
                        //DoubleLog(`随机延迟${this.getRandomTime('2')}ms`)
                        //await $.wait(this.getRandomTime('2'))
                        //DoubleLog(`账号[${this.index}] 发帖：执行第二次发帖,评论，删除评论`);
                        //await this.post_topic();
                    } else if (result.data[1].finishedNum == 2) {
                        //DoubleLog(`账号[${this.index}] 今天已经发帖了，明天再来吧!`);
                    } else {
                        //DoubleLog(`账号[${this.index}] 获取发帖状态:  失败 ❌ 了呢,原因未知!`);
                    }

                    if (result.data[2].itemType == 2 && result.data[2].finishedNum < 2) {
                        //回复帖子
                    } else if (result.data[1].finishedNum == 2) {
                        //DoubleLog(`账号[${this.index}] 今天已经回复帖子了，明天再来吧!`);
                    } else {
                        //DoubleLog(`账号[${this.index}] 获取回复帖子状态:  失败 ❌ 了呢,原因未知!`);
                    }

                    if (result.data[3].finishedNum < 2) {
                        DoubleLog(`账号[${this.index}] 分享状态：${result.data[3].finishedNum} / ${result.data[3].total}`);
                        await this.task_share();
                        //DoubleLog(`随机延迟${this.getRandomTime('2')}ms`)
                        //await $.wait(this.getRandomTime('2'))
                        await this.task_share();
                    } else if (result.data[3].finishedNum == 2) {
                        DoubleLog(`账号[${this.index}] 今天已经分享过了鸭，明天再来吧!`);
                    } else {
                        DoubleLog(`账号[${this.index}] 获取分享状态:  失败 ❌ 了呢,原因未知!`);
                    }
                    //$.wait(this.getRandomTime('2'))
                    await this.query_list(this.userIdStr);
                } else {
                    DoubleLog(`账号[${this.index}]  获取任务失效,原因未知！`);
                    console.log(result);
                }
            } else {
                return console.log(`Api请求频繁,退出请求`);
            }
            // console.log(result);

        } catch (e) {
            console.log(e);
        }
    }
    async task_signin() {//userinfo
        try {
            let options = {
                url: `https://gsp.gacmotor.com/gateway/app-api/sign/submit`,
                headers: this.headersOne,
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (typeof result !== 'undefined' && 'errorCode' in result) {

                if (result.errorCode == 200) {
                    DoubleLog(`账号[${this.index}]  签到:${result.errorMessage} ,你已经连续签到 [${result.data.dayCount}] 天 ,签到获得G豆 [${result.data.operationValue}]个 `);
                } else {
                    DoubleLog(`账号[${this.index}]  签到失效,原因未知！`);
                    console.log(result);
                }
            } else {
                return console.log(`Api请求频繁,退出请求`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_lottery() {//userinfo
        try {
            let options = {
                url: `https://gsp.gacmotor.com/gw/app/activity/shopDraw/luckyDraw`,
                headers: this.headersTwo,
                body: "activityCode=shop-draw"
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (typeof result !== 'undefined' && 'errorCode' in result) {

                if (result.errorCode == 20000) {
                    DoubleLog(`账号[${this.index}]  抽奖:${result.errorMessage} ,恭喜你获得 [${result.data.medalName}] 奖品为 [${result.data.medalDescription}]`);
                } else {
                    DoubleLog(`账号[${this.index}]  抽奖失效,原因未知！`);
                    console.log(result);
                }
            } else {
                return console.log(`Api请求频繁,退出请求`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async post_topic() {//userinfo
        let txt = await yiyan()
        console.log(txt)

        let postContent = encodeURIComponent(`[{"text":"${txt}"}]`)
        let coverImg = encodeURIComponent(`https://pic-gsp.gacmotor.com/app/ebce22cb-51c1-4d56-8216-7ce5c71c3105_TM.jpeg`)//有水印的
        let contentWords = encodeURIComponent(`${txt}`)
        let customCover = encodeURIComponent(`https://pic-gsp.gacmotor.com/app/ebce22cb-51c1-4d56-8216-7ce5c71c3105_T.jpeg`)//无水印的
        try {
            let options = {
                url: `https://gsp.gacmotor.com/gw/app/community/api/topic/appsavepost`,
                headers: this.headersOne,
                body: `postId=&postType=2&columnId=&postContent=${postContent}&coverImg=${coverImg}&publishedTime=&contentWords=${contentWords}&contentImgNums=0&lng=&lat=&address=&cityId=&customCover=${customCover}`
                //`postId=&postType=2&channelInfoId=116&columnId=&postContent=[{"text":"${txt}"}]&coverImg=https://pic-gsp.gacmotor.com/app/712e2529-7b85-4d70-8c71-22b994b445b5.jpg&publishedTime=&contentWords=${txt}&contentImgNums=1&lng=&lat=&address=&cityId=`
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (typeof result !== 'undefined' && 'errorCode' in result) {
                if (result.errorCode == 20000) {
                    DoubleLog(`账号[${this.index}]  发布帖子:${result.errorMessage} ,帖子ID: ${result.data.postId}`);
                    let topic_id = result.data.postId;
                    //topicIdArr.push(topic_id)
                    //DoubleLog(`随机延迟${this.getRandomTime('2')}ms`)
                    //await $.wait(this.getRandomTime('2'))
                    await this.add_comment(topic_id);
                } else {
                    DoubleLog(`账号[${this.index}]  发布帖子失效,原因未知！`);
                    console.log(result);
                }
            } else {
                return console.log(`Api请求频繁,退出请求`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async add_comment(topic_id) {//userinfo
        let txt = await yiyan()
        txt = encodeURIComponent(txt)
        let commentatorId = encodeURIComponent(this.userIdStr)
        try {
            let options = {
                url: `https://gsp.gacmotor.com/gw/app/community/api/comment/add`,
                headers: this.headersOne,
                body: `commentType=0&postId=${topic_id}&commentContent=${txt}&commentId=0&commentatorId=${commentatorId}&isReplyComment=1`
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (typeof result !== 'undefined' && 'errorCode' in result) {
                if (result.errorCode == 20000) {
                    DoubleLog(`账号[${this.index}]  评论帖子: 评论 ${topic_id} 帖子 ${result.errorMessage}`);
                    DoubleLog(`随机延迟${this.getRandomTime('2')}ms`)
                    //await $.wait(this.getRandomTime('2'))
                } else {
                    DoubleLog(`账号[${this.index}]  评论帖子失效,原因未知！`);
                    console.log(result);
                }
            } else {
                return console.log(`Api请求频繁,退出请求`);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async query_list(userId) {//帖子列表
        try {
            let options = {
                url: `https://gsp.gacmotor.com/gw/app/community/api/post/querylist`,
                headers: this.headersOne,
                body: `current=1&size=20&userId=${userId}&myHome=true`
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (typeof result !== 'undefined' && 'errorCode' in result) {
                if (result.errorCode == 20000) {
                    if (result.data.records.length == 1) {
                        DoubleLog(`账号[${this.index}]  查询今天的帖子 ${result.data.records[0].postId} 添加待点赞列表 ing---`)
                        topicIdArr.push(result.data.records[0].postId)
                    } else if (result.data.records.length >= 2) {
                        DoubleLog(`账号[${this.index}]  查询昨天的帖子 ${result.data.records[1].postId} 删除昨天的帖子 ing---`)
                        await this.delete_topic(result.data.records[1].postId)
                        DoubleLog(`账号[${this.index}]  查询今天的帖子 ${result.data.records[0].postId} 添加待点赞列表 ing---`)
                        topicIdArr.push(result.data.records[0].postId)
                    } else {
                        DoubleLog(`账号[${this.index}]  无任何历史发布文章 跳过执行`)
                        return
                    }
                } else {
                    console.log(result);
                }
            } else {
                return console.log(`Api请求频繁,退出请求`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async delete_topic(topic_id) {//删除帖子
        try {
            let options = {
                url: `https://gsp.gacmotor.com/gw/app/community/api/post/delete?postId=${topic_id}`,
                headers: this.headersOne,
                body: `postId=${topic_id}`
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (typeof result !== 'undefined' && 'errorCode' in result) {
                if (result.errorCode == 20000) {
                    DoubleLog(`账号[${this.index}]  删除帖子: 帖子ID: ${topic_id} , 执行删除 ${result.errorMessage}`);
                } else {
                    DoubleLog(`账号[${this.index}]  删除帖子失效,原因未知！`);
                    console.log(result);
                }
            } else {
                return console.log(`Api请求频繁,退出请求`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_share() {//userinfo
        let postId = await this.article_list();
        try {
            let options = {
                url: `https://gsp.gacmotor.com/gw/app/community/api/post/forward`,
                headers: this.headersOne,
                body: `postId=${postId}&userId=`
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (typeof result !== 'undefined' && 'errorCode' in result) {

                if (result.errorCode == '20000') {
                    DoubleLog(`账号[${this.index}]  分享帖子: 帖子ID: ${postId},分享文章:${result.errorMessage}`);
                } else {
                    DoubleLog(`账号[${this.index}]  分享帖子失效,原因未知！`);
                    console.log(result);
                }
            } else {
                return console.log(`Api请求频繁,退出请求`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async article_list() {//userinfo
        try {
            let options = {
                url: `https://gsp.gacmotor.com/gw/app/community/api/post/channelPostList?current=1&size=20&channelId=&sortType=1`,
                headers: this.headersOne,
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (typeof result !== 'undefined' && 'errorCode' in result) {
                if (result.errorCode == '20000') {
                    let num = randomInt(1, 19);
                    let postId = result.data.records[num].postId;
                    DoubleLog(`账号[${this.index}]  分享的文章: ${result.data.records[num].topicNames}  文章ID:${result.data.records[num].postId}`);
                    return postId;
                } else {
                    DoubleLog(`账号[${this.index}]  获取分享文章失效,原因未知！`);
                    console.log(result);
                }
            } else {
                return console.log(`Api请求频繁,退出请求`);
            }
        } catch (e) {
            console.log(e);
        }
    }


    async eachother_like(topicId) {//内部互赞
        try {
            let options = {
                url: `https://gsp.gacmotor.com/gw/app/community/api/praise/operate`,
                headers: this.headersTwo,
                body: `relationId=${topicId}&isPraise=1&praiseType=0&praiseStyle=1`
            }
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (typeof result !== 'undefined' && 'errorCode' in result) {
                if (result.errorCode == 20000) {
                } else {
                    DoubleLog(`账号[${this.index}] 点赞帖子${topicId}成功`);
                    //console.log(result);
                }
                //await $.wait(30000);

            } else {
                return console.log(`Api请求频繁,退出请求`);
            }

        } catch (e) {
            console.log(e);
        }
    }









}

!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        await start();
    }
    //
    console.log(topicIdArr);

    await SendMsg(msg);
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());


//********************************************************
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
/////////////////////////////////////////////////////////////////////////////////////

function httpRequest(options, method) {
    typeof (method) === 'undefined' ? ('body' in options ? method = 'post' : method = 'get') : method = method
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
/**
 * 一言 
 */
async function yiyan() {
    let options = {
        url: `https://v1.hitokoto.cn?c=h`,
    }
    let result = await httpRequest(options)
    return result.hitokoto
}
async function notice() {
    try {
        let options = {
            url: `https://fastly.jsdelivr.net/gh/smallfawn/Note@main/Notice.json`,
            headers: {
                'User-Agent': ''
            },
            timeout: 5000,
        }
        //console.log(options);
        let result = await httpRequest(options);
        //console.log(result);
        if (result) {
            if ('notice' in result) {
                DoubleLog(`${result.notice}`);
            } else {
                options.url = `https://gitee.com/smallfawn/api/raw/master/notice.json`
                result = await httpRequest(options);
                if ('notice' in result) {
                    DoubleLog(`${result.notice}`);
                }
            }
        } else {
        }
    } catch (e) {
        console.log(e);
    }
}


/**
 * 手机号中间遮挡
 */
function phone_num(phone_num) {

    if (phone_num.length == 11) {
        let data = phone_num.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        return data;
    } else {
        return phone_num;
    }
}


function ts13() {
    return Math.round(new Date().getTime()).toString();
}
/**
 * 随机整数生成
 */
function randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
// 双平台log输出
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
// 发送消息
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



function MD5Encrypt(a) { function b(a, b) { return a << b | a >>> 32 - b } function c(a, b) { var c, d, e, f, g; return e = 2147483648 & a, f = 2147483648 & b, c = 1073741824 & a, d = 1073741824 & b, g = (1073741823 & a) + (1073741823 & b), c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f : g ^ e ^ f } function d(a, b, c) { return a & b | ~a & c } function e(a, b, c) { return a & c | b & ~c } function f(a, b, c) { return a ^ b ^ c } function g(a, b, c) { return b ^ (a | ~c) } function h(a, e, f, g, h, i, j) { return a = c(a, c(c(d(e, f, g), h), j)), c(b(a, i), e) } function i(a, d, f, g, h, i, j) { return a = c(a, c(c(e(d, f, g), h), j)), c(b(a, i), d) } function j(a, d, e, g, h, i, j) { return a = c(a, c(c(f(d, e, g), h), j)), c(b(a, i), d) } function k(a, d, e, f, h, i, j) { return a = c(a, c(c(g(d, e, f), h), j)), c(b(a, i), d) } function l(a) { for (var b, c = a.length, d = c + 8, e = (d - d % 64) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i = 0; c > i;)b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | a.charCodeAt(i) << h, i++; return b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | 128 << h, g[f - 2] = c << 3, g[f - 1] = c >>> 29, g } function m(a) { var b, c, d = "", e = ""; for (c = 0; 3 >= c; c++)b = a >>> 8 * c & 255, e = "0" + b.toString(16), d += e.substr(e.length - 2, 2); return d } function n(a) { a = a.replace(/\r\n/g, "\n"); for (var b = "", c = 0; c < a.length; c++) { var d = a.charCodeAt(c); 128 > d ? b += String.fromCharCode(d) : d > 127 && 2048 > d ? (b += String.fromCharCode(d >> 6 | 192), b += String.fromCharCode(63 & d | 128)) : (b += String.fromCharCode(d >> 12 | 224), b += String.fromCharCode(d >> 6 & 63 | 128), b += String.fromCharCode(63 & d | 128)) } return b } var o, p, q, r, s, t, u, v, w, x = [], y = 7, z = 12, A = 17, B = 22, C = 5, D = 9, E = 14, F = 20, G = 4, H = 11, I = 16, J = 23, K = 6, L = 10, M = 15, N = 21; for (a = n(a), x = l(a), t = 1732584193, u = 4023233417, v = 2562383102, w = 271733878, o = 0; o < x.length; o += 16)p = t, q = u, r = v, s = w, t = h(t, u, v, w, x[o + 0], y, 3614090360), w = h(w, t, u, v, x[o + 1], z, 3905402710), v = h(v, w, t, u, x[o + 2], A, 606105819), u = h(u, v, w, t, x[o + 3], B, 3250441966), t = h(t, u, v, w, x[o + 4], y, 4118548399), w = h(w, t, u, v, x[o + 5], z, 1200080426), v = h(v, w, t, u, x[o + 6], A, 2821735955), u = h(u, v, w, t, x[o + 7], B, 4249261313), t = h(t, u, v, w, x[o + 8], y, 1770035416), w = h(w, t, u, v, x[o + 9], z, 2336552879), v = h(v, w, t, u, x[o + 10], A, 4294925233), u = h(u, v, w, t, x[o + 11], B, 2304563134), t = h(t, u, v, w, x[o + 12], y, 1804603682), w = h(w, t, u, v, x[o + 13], z, 4254626195), v = h(v, w, t, u, x[o + 14], A, 2792965006), u = h(u, v, w, t, x[o + 15], B, 1236535329), t = i(t, u, v, w, x[o + 1], C, 4129170786), w = i(w, t, u, v, x[o + 6], D, 3225465664), v = i(v, w, t, u, x[o + 11], E, 643717713), u = i(u, v, w, t, x[o + 0], F, 3921069994), t = i(t, u, v, w, x[o + 5], C, 3593408605), w = i(w, t, u, v, x[o + 10], D, 38016083), v = i(v, w, t, u, x[o + 15], E, 3634488961), u = i(u, v, w, t, x[o + 4], F, 3889429448), t = i(t, u, v, w, x[o + 9], C, 568446438), w = i(w, t, u, v, x[o + 14], D, 3275163606), v = i(v, w, t, u, x[o + 3], E, 4107603335), u = i(u, v, w, t, x[o + 8], F, 1163531501), t = i(t, u, v, w, x[o + 13], C, 2850285829), w = i(w, t, u, v, x[o + 2], D, 4243563512), v = i(v, w, t, u, x[o + 7], E, 1735328473), u = i(u, v, w, t, x[o + 12], F, 2368359562), t = j(t, u, v, w, x[o + 5], G, 4294588738), w = j(w, t, u, v, x[o + 8], H, 2272392833), v = j(v, w, t, u, x[o + 11], I, 1839030562), u = j(u, v, w, t, x[o + 14], J, 4259657740), t = j(t, u, v, w, x[o + 1], G, 2763975236), w = j(w, t, u, v, x[o + 4], H, 1272893353), v = j(v, w, t, u, x[o + 7], I, 4139469664), u = j(u, v, w, t, x[o + 10], J, 3200236656), t = j(t, u, v, w, x[o + 13], G, 681279174), w = j(w, t, u, v, x[o + 0], H, 3936430074), v = j(v, w, t, u, x[o + 3], I, 3572445317), u = j(u, v, w, t, x[o + 6], J, 76029189), t = j(t, u, v, w, x[o + 9], G, 3654602809), w = j(w, t, u, v, x[o + 12], H, 3873151461), v = j(v, w, t, u, x[o + 15], I, 530742520), u = j(u, v, w, t, x[o + 2], J, 3299628645), t = k(t, u, v, w, x[o + 0], K, 4096336452), w = k(w, t, u, v, x[o + 7], L, 1126891415), v = k(v, w, t, u, x[o + 14], M, 2878612391), u = k(u, v, w, t, x[o + 5], N, 4237533241), t = k(t, u, v, w, x[o + 12], K, 1700485571), w = k(w, t, u, v, x[o + 3], L, 2399980690), v = k(v, w, t, u, x[o + 10], M, 4293915773), u = k(u, v, w, t, x[o + 1], N, 2240044497), t = k(t, u, v, w, x[o + 8], K, 1873313359), w = k(w, t, u, v, x[o + 15], L, 4264355552), v = k(v, w, t, u, x[o + 6], M, 2734768916), u = k(u, v, w, t, x[o + 13], N, 1309151649), t = k(t, u, v, w, x[o + 4], K, 4149444226), w = k(w, t, u, v, x[o + 11], L, 3174756917), v = k(v, w, t, u, x[o + 2], M, 718787259), u = k(u, v, w, t, x[o + 9], N, 3951481745), t = c(t, p), u = c(u, q), v = c(v, r), w = c(w, s); var O = m(t) + m(u) + m(v) + m(w); return O.toLowerCase() }

// 完整 Env
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
