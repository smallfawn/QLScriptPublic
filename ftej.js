
/*
福田e家
ftej '账号#密码'
偶尔会报错  多定时两次就好了
*/

const $ = new Env("福田e家");
//let envSplitor = ['\n','@','#']
const fs = require('fs')
let httpResult, httpReq, httpResp
const ckFile1 = 'ftej.txt'
const ckName = 'ftej'
let userCookie = []
try {
    userCookie = userCookie.concat(fs.readFileSync(`./${ckFile1}`,'utf-8').split('\n')||[])
    console.log(`ck文件[ ${ckFile1} ]加载成功`)
    this.mxr = true
} catch (e) {
    console.log(`未发现本地文件 调用青龙环境变量`)
    this.mxr = false
}
let mxr=this.mxr
if (this.mxr == false){
    try {
        userCookie = userCookie.concat((($.isNode() ? process.env[ckName] : $.getdata(ckName))||'')?.split('\n')||[])
        console.log(`环境变量[ ${ckName} ]加载成功`)
    } catch (e) {
        //console.log(e)
    }
}

let userList = []
let userIdx = 0
let userCount = 0
let time = Math.round( Date.now())

///////////////////////////////////////////////////////////////////
class UserInfo {
    constructor(str) {
        this.index = ++userIdx

        this.valid = false

        try {
            this.ck = str.split('#')
            this.user = phoneNum(`${this.ck[0]}`)
            this.ckValid = true
        } catch (e) {

        }
    }


    async cashck() {
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/homeManager/getLoginMember`;
            let body =`{"password":"${this.ck[1]}","version_name":"","version_auth":"","device_id":"","device_model":"","ip":"","name":"${this.ck[0]}","version_code":"180","deviceSystemVersion":"","device_type":"0"}`;
//console.log(body)
            let h = {
                "Host": "czyl.foton.com.cn",
                "Content-Type": "application/json;charset\u003dutf-8",
            }
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            // console.log(result)
            if (result.code == 200) {
                console.log(`账号 ${this.user} 登录成功    `)
                this.token = result.data.token
                this.memberComplexCode = result.data.memberComplexCode
                this.uid = result.data.uid
                this.memberID = result.data.memberID
                if(result.data.signIn== "未签到"){
                    await this.sign()
                }
                //  await $.wait(3000);
                await this.getTaskList()//每日关注
                // await $.wait(3000);
                await this.grxx()
            }else{
                console.log(`账号 ${this.user} 登录失败 `)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    //任务列表
    async getTaskList() {
        let tim = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/homeManager/api/Member/getTaskList`;
            let body = `{"memberId":"${this.memberID}","userId":"${this.uid}","userType":"61","uid":"${this.uid}","mobile":"${this.ck[0]}","tel":"${this.ck[0]}","brandName":"","seriesName":"","token":"ebf76685e48d4e14a9de6fccc76483e3","safeEnc":${tim-20220000},"businessId":1}`;


            let h = {
                "user-agent": "web",
                "Content-Type": "application/json; charset\u003dutf-8",
                "token": "",
                "host": "czyl.foton.com.cn"
            }
            //console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            // console.log(result)
            if (result.code == 200) {
                if (result.data[4].completeNum == 0) {
                    await this.sign()//签到
                }else if (result.data[4].completeNum ==1 ){
                    console.log(`账号 ${this.user} ${result.data[4].ruleName} 已完成 `)
                }
                if (result.data[5].completeNum == 0) {
                    await this.fx()//分享
                }else if (result.data[5].completeNum ==1 ){
                    console.log(`账号 ${this.user} ${result.data[6].ruleName} 已完成 `)
                }
                if (result.data[6].completeNum == 0) {
                    await this.topicList()//发帖
                }else if (result.data[6].completeNum ==1 ){
                    console.log(`账号 ${this.user} ${result.data[6].ruleName} 已完成 `)
                }
                if (result.data[8].completeNum == 0) {
                    await this.follow2nd()//关注
                }else if (result.data[8].completeNum ==1 ){
                    console.log(`账号 ${this.user} ${result.data[8].ruleName} 已完成 `)
                }
                if (result.data[7].completeNum == 0) {
                    await this.comment2nd()//评论
                }else if (result.data[7].completeNum ==1 ){
                    console.log(`账号 ${this.user} ${result.data[7].ruleName} 已完成 `)
                }
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    async sign() {
        let time1 = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/homeManager/api/bonus/signActivity2nd`;
            let body = `{"memberId":"${this.memberComplexCode}","userId":"${this.uid}","userType":"61","uid":"${this.uid}","mobile":"${this.ck[0]}","tel":"${this.ck[0]}","brandName":"","seriesName":"","token":"ebf76685e48d4e14a9de6fccc76483e3","safeEnc":${time1-20220000},"businessId":1}`;
            let h = {
                "Host": "czyl.foton.com.cn",
                "Content-Type": "application/json;charset\u003dutf-8",
                "token": ``,
            }
            //console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            //console.log(result)
            if (result.code == 200) {
                console.log(`账号 ${this.user} 签到成功获得积分 ${result.data.data.integral} `)
            } else if (result.code == 500) {
                console.log(`账号 ${this.user} 今日已经签到`)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }

    //关注列表
    async postList() {
        let time2 = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/ehomesCommunity/api/post/nowPostList`;
            let body = ` {"memberId":"${this.memberID}","userId":"${this.uid}","userType":"61","uid":"${this.uid}","mobile":"${this.ck[0]}","tel":"${this.ck[0]}","brandName":"","seriesName":"","token":"ebf76685e48d4e14a9de6fccc76483e3","safeEnc":${time2-20220000},"businessId":1,"pageNumber":1,"pageSize":30,"follow":"1"}`;
            let h = {
                "user-agent": "web",
                "Content-Type": "application/json; charset\u003dutf-8",
                "token": "",
                "host": "czyl.foton.com.cn"
            }
            //console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            //  console.log(result)
            if (result.code == 200) {
                for (let i=1;i<result.data.length;i++){
                    let dd=randomArr(result.data)
                    this.b=dd.memberId
                }
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    //评论
    async comment2nd() {
        await this.postList()
        let time3 = Math.round( Date.now())
        await this.wyy()
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/ehomesCommunity/api/post/comment2nd`;
            let body = `  {"memberId":"${this.memberComplexCode}","userId":"${this.uid}","userType":"61","uid":"${this.uid}","mobile":"${this.ck[0]}","tel":"${this.ck[0]}","brandName":"","seriesName":"","token":"ebf76685e48d4e14a9de6fccc76483e3","safeEnc":${time3-20220000},"businessId":1,"commentContent":"${this.content}","commentId":"","postId":"${this.b}","type":"1"}`

            let h = {
                "user-agent": "web",
                "Content-Type": "application/json; charset\u003dutf-8",
                "token": "",
                "host": "czyl.foton.com.cn"
            }
            //console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            //console.log(result)
            if (result.code == 200) {
                console.log(`账号 ${this.user} 评论成功 `)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }

    //每日关注
    async follow2nd() {
        await this.postList()
        let time4 = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/ehomesCommunity/api/post/follow2nd`;
            let body = `{"memberId":"${this.memberComplexCode}","userId":"${this.uid}","userType":"61","uid":"${this.uid}","mobile":"${this.ck[0]}","tel":"${this.ck[0]}","brandName":"","seriesName":"","token":"ebf76685e48d4e14a9de6fccc76483e3","safeEnc":${time4-20220000},"businessId":1,"behavior":"1","memberIdeds":"${this.b}","navyId":"null"}`;
            let h = {
                "user-agent": "web",
                "Content-Type": "application/json; charset\u003dutf-8",
                "token": "",
                "host": "czyl.foton.com.cn"
            }
            // console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            //    console.log(result)
            if (result.code == 200) {
                console.log(`账号 ${this.user} 关注成功 `)
                //await $.wait(3000);
                await this.follow2n()
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    //取消关注
    async follow2n() {
        let time5 = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/ehomesCommunity/api/post/follow2nd`;
            let body = `{"memberId":"${this.memberComplexCode}","userId":"${this.uid}","userType":"61","uid":"${this.uid}","mobile":"${this.ck[0]}","tel":"${this.ck[0]}","brandName":"","seriesName":"","token":"ebf76685e48d4e14a9de6fccc76483e3","safeEnc":${time5-20220000},"businessId":1,"behavior":"2","memberIdeds":"${this.b}","navyId":"null"}`;
            let h = {
                "user-agent": "web",
                "Content-Type": "application/json; charset\u003dutf-8",
                "token": "",
                "host": "czyl.foton.com.cn"
            }
            //console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            // console.log(result)
            if (result.code == 200) {
                console.log(`账号 ${this.user} 取消关注 `)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }

    //发帖区
    async topicList() {
        await this.postList()
        let time6 = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/ehomesCommunity/api/post/topicList`;
            let body = ` {"memberId":"${this.memberID}","userId":"${this.uid}","userType":"61","uid":"${this.uid}","mobile":"${this.ck[0]}","tel":"${this.ck[0]}","brandName":"","seriesName":"","token":"ebf76685e48d4e14a9de6fccc76483e3","safeEnc":${time6-20220000},"businessId":1}`;

            let h = {
                "user-agent": "web",
                "Content-Type": "application/json; charset\u003dutf-8",
                "token": "",
                "host": "czyl.foton.com.cn"
            }
            //console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            // console.log(result)
            if (result.code == 200) {
                for (let i=1;i<result.data.top.length;i++){
                    let ddd=randomArr(result.data.top)
                    this.a=ddd.topicId
//console.log(`获取到话题列表[${this.a}] `)
                }
                await this.ft()
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }

    async ft() {
        let time7 = Math.round( Date.now())
        await this.wyy()
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/ehomesCommunity/api/post/addJson2nd`;
            let body = `{"memberId":"${this.memberComplexCode}","userId":"${this.uid}","userType":"61","uid":"${this.uid}","mobile":"${this.ck[0]}","tel":"${this.ck[0]}","brandName":"","seriesName":"","token":"ebf76685e48d4e14a9de6fccc76483e3","safeEnc":${time7-20220000},"businessId":1,"content":"${this.content}","postType":1,"topicIdList":[${this.a}],"uploadFlag":3,"title":"","urlList":[]}`

            let h = {
                "user-agent": "web",
                "Content-Type": "application/json; charset\u003dutf-8",
                "token": "",
                "host": "czyl.foton.com.cn"
            }
            // console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            // console.log(result)
            if (result.code == 200) {
                console.log(`账号 ${this.user} 发帖成功 `)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }

    //个人信息
    async grxx() {
        let time9 = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/homeManager/api/Member/findMemberPointsInfo`;
            let body = `{"memberId":"${this.memberID}","userId":"${this.uid}","userType":"61","uid":"${this.uid}","mobile":"${this.ck[0]}","tel":"${this.ck[0]}","brandName":"","seriesName":"","token":"ebf76685e48d4e14a9de6fccc76483e3","safeEnc":${time9-20220000},"businessId":1}`;

            let h = {
                "user-agent": "web",
                "Content-Type": "application/json; charset\u003dutf-8",
                "token": "",
                "host": "czyl.foton.com.cn"
            }
            // console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            // console.log(result)
            if (result.code == 200) {
                console.log(`账号 ${this.ck[0]} 总积分 ${result.data.pointValue} `)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    /*

       皮卡生活



       */

    async kclogin() {
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/pkHome/api/user/getLoginMember`;
            let body =`{"name":"${this.ck[0]}","password":"${this.ck[1]}"}`;
//console.log(body)
            let h = {
                "Host": "czyl.foton.com.cn",
                "Content-Type": "application/json;charset\u003dutf-8",
            }
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            // console.log(result)
            if (result.code == 200) {
                console.log(`账号 ${this.user} 登录成功    `)
                this.pktoken = result.data.token
                this.pkmemberComplexCode = result.data.memberComplexCode
                this.pkmemberNo = result.data.user.memberNo
                await this.pksignInfo()//签到
                await this.pkfollow2nd()//关注
                await this.pkcomment2nd()//评论
                await this.grxx()

            }else{
                console.log(`账号 ${this.user} 登录失败 `)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }

    async pksignInfo() {
        let pktime1 = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/pkHome/api/bonus/findMemberSignInfo`;
            let body = `{"memberId":"${this.pkmemberNo}","mobile":"${this.ck[0]}","token":"7fe186bb15ff4426ae84f300f05d9c8d","vin":"","safeEnc":${pktime1-10110000}}`;
            let h = {
                "Host": "czyl.foton.com.cn",
                "Content-Type": "application/json;charset\u003dutf-8",
                "token": `${this.pktoken}`,
            }
            //console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            // console.log(result)
            if (result.data.signFlag== '未签到') {
                await this.pksign()
            } else  {
                console.log(`账号 ${this.user} 今日已经签到`)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }

    async pksign() {
        let pktime2 = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/pkHome/api/bonus/signActivity2nd`;
            let body = `{"memberId":"${this.pkmemberComplexCode}","mobile":"${this.ck[0]}","token":"7fe186bb15ff4426ae84f300f05d9c8d","vin":"","safeEnc":${pktime2-10110000}}`;


            let h = {
                "Host": "czyl.foton.com.cn",
                "Content-Type": "application/json;charset\u003dutf-8",
                "token": `${this.pktoken}`,
            }
            // console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            // console.log(result)
            if (result.code == 200) {
                console.log(`账号 ${this.user} 签到成功获得积分 ${result.data.integral}`)
            } else {
                console.log(`账号 ${this.user}${result.data.msg} `)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    //列表
    async pkcurrentPostList() {
        let pktime2 = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/pkHomeForum/api/post/currentPostList`;
            let body = `{"memberId":"${this.pkmemberNo}","mobile":"${this.ck[0]}","token":"7fe186bb15ff4426ae84f300f05d9c8d","vin":"","safeEnc":${pktime2-10110000},"pageNum":1,"pageSize":10}`;
            let h = {
                "Host": "czyl.foton.com.cn",
                "Content-Type": "application/json;charset\u003dutf-8",
                "token": `${this.pktoken}`,
            }
            // console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            //  console.log(result)
            if (result.code == 200) {

                for (let h=0;h<result.data.length;h++){
                    let nb=randomArr(result.data)
                    this.bb=nb.memberId,this.bn=nb.postId
                }
//console.log(`列表 ${this.bb} ${this.bn}    `)

            } else {
                console.log(`账号 ${this.user}${result.data.msg} `)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    //关注
    async pkfollow2nd() {
        await this.pkcurrentPostList()
        let pktime3 = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/pkHomeForum/api/post/follow2nd`;
            let body = `  {"memberId":"${this.pkmemberComplexCode}","mobile":"${this.ck[0]}","token":"7fe186bb15ff4426ae84f300f05d9c8d","vin":"","safeEnc":${pktime3-10110000},"memberIded":"${this.bb}","navyId":null}`;
            let h = {
                "Host": "czyl.foton.com.cn",
                "Content-Type": "application/json;charset\u003dutf-8",
                "token": `${this.pktoken}`,
            }
            // console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            // console.log(result)
            if (result.code == 200) {
                console.log(`账号 ${this.user} 关注成功`)
                this.followId = result.data.followId
                await this.pknotFollow()
            } else {
                console.log(`账号 ${this.user}${result.data.msg} `)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    //取消关注
    async pknotFollow() {
        let pktime4 = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/pkHomeForum/api/post/notFollow`;
            let body = ` {"memberId":"${this.bb}","mobile":"${this.ck[0]}","token":"7fe186bb15ff4426ae84f300f05d9c8d","vin":"","safeEnc":${pktime4-10110000},"followId":${this.followId}}`;

            let h = {
                "Host": "czyl.foton.com.cn",
                "Content-Type": "application/json;charset\u003dutf-8",
                "token": `${this.pktoken}`,
            }
            // console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            //  console.log(result)
            if (result.code == 200) {
                console.log(`账号 ${this.user} 取消关注`)
            } else {
                console.log(`账号 ${this.user}${result.data.msg} `)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    //评论

    async pkcomment2nd() {
        await this.pkcurrentPostList()
        await this.wyy()
        let pktime5 = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/pkHomeForum/api/post/comment2nd`;
            let body = `  {"memberId":"${this.pkmemberComplexCode}","mobile":"${this.ck[0]}","token":"7fe186bb15ff4426ae84f300f05d9c8d","vin":"","safeEnc":${pktime5-10110000},"postId":"${this.bn}","commentContent":"${this.content}","level":1}`;

            let h = {
                "Host": "czyl.foton.com.cn",
                "Content-Type": "application/json;charset\u003dutf-8",
                "token": `${this.pktoken}`,
            }
            // console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            //  console.log(result)
            if (result.code == 200) {
                console.log(`账号 ${this.user} 评论成功`)
            } else {
                console.log(`账号 ${this.user}${result.data.msg} `)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }

    async fx() {
        let time8 = Math.round( Date.now())
        try {
            let url = `https://czyl.foton.com.cn/ehomes-new/homeManager/api/bonus/addIntegralForShare`;
            let body = `{"safeEnc":${time8-20220000},"activity":"","tel":"${this.ck[0]}","id":"33","source":"APP","memberId":"${this.memberComplexCode}"}`;

            let h = {
                "user-agent": "web",
                "Content-Type": "application/json; charset\u003dutf-8",
                "token": "",
                "host": "czyl.foton.com.cn"
            }
            //console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('post', urlObject)
            let result = httpResult;
            //  console.log(result)
            if (result.code == 200) {
                console.log(`账号 ${this.user} 分享获得${result.data.data.integral} `)
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }




    //网抑云
    async wyy() {
        try {
            let url = `https://v1.jinrishici.com/all`;
            let body = ``
            let h = {
            }
            //console.log(body)
            let urlObject = popu(url, h, body)
            await httpRequest('get', urlObject)
            let result = httpResult;
            //    console.log(result)
            if (result.code == 200) {
            } else {
                this.content =result.content
            }
        } catch (e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }

}

!(async () => {
    if (typeof $request !== "undefined") {
        await GetRewrite()
    } else {

        if (!(await checkEnv())) return;



        if (userList.length > 0) {
            console.log('\n------- 福田e家-------\n')
            taskall = []
            for (let user of userList) {
                taskall.push(user.cashck())
            }
            await Promise.all(taskall)
            console.log('\n------- 卡车生活-------\n')
            taskall = []
            for (let user of userList) {
                taskall.push(user.kclogin())
            }
            await Promise.all(taskall)
        }

    }
})()
    .catch((e) => console.log(e))
    .finally(() => $.done())

///////////////////////////////////////////////////////////////////
async function GetRewrite() {

}


function checkEnv() {
    if(userCookie) {
        for(let userCookies of userCookie) {
            if(userCookies) userList.push(new UserInfo(userCookies))
        }
        userCount = userList.length
    } else {
        console.log(`未找到CK`)
        return false;
    }

    console.log(`\n共找到${userCount}个账号`)
    return true
}



////////////////////////////////////////////////////////////////////
function popu(url, h, body = '') {
    let host = url.replace('//', '/').split('/')[1]
    let urlObject = {
        url: url,
        headers: h,
        timeout: 5000,
    }
    if (body) {
        urlObject.body = body
    }

    return urlObject;
}


async function httpRequest(method, url) {
    httpResult = null, httpReq = null, httpResp = null;
    return new Promise((resolve) => {
        $.send(method, url, async (err, req, resp) => {
            try {
                httpReq = req;
                httpResp = resp;
                if (err) {
                } else {
                    if (resp.body) {
                        if (typeof resp.body == "object") {
                            httpResult = resp.body;
                        } else {
                            try {
                                httpResult = JSON.parse(resp.body);
                            } catch (e) {
                                httpResult = resp.body;
                            }
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            } finally {
                resolve();
            }
        });
    });
}
////////////////////////////////////////////////////////////////////
function randomArr(arr) {
    return arr[parseInt(Math.random() * arr.length, 10)];
}
function phoneNum(phone_num) {
    if (phone_num.length == 11) {
        let data = phone_num.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
        return data;
    } else {
        return phone_num;
    }
}
//MD5加密
function MD5_Encrypt(a) {
    function b(a, b) {
        return a << b | a >>> 32 - b
    }

    function c(a, b) {
        var c, d, e, f, g;
        return e = 2147483648 & a,
            f = 2147483648 & b,
            c = 1073741824 & a,
            d = 1073741824 & b,
            g = (1073741823 & a) + (1073741823 & b),
            c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f :
                g ^ e ^ f
    }

    function d(a, b, c) {
        return a & b | ~a & c
    }

    function e(a, b, c) {
        return a & c | b & ~c
    }

    function f(a, b, c) {
        return a ^ b ^ c
    }

    function g(a, b, c) {
        return b ^ (a | ~c)
    }

    function h(a, e, f, g, h, i, j) {
        return a = c(a, c(c(d(e, f, g), h), j)),
            c(b(a, i), e)
    }

    function i(a, d, f, g, h, i, j) {
        return a = c(a, c(c(e(d, f, g), h), j)),
            c(b(a, i), d)
    }

    function j(a, d, e, g, h, i, j) {
        return a = c(a, c(c(f(d, e, g), h), j)),
            c(b(a, i), d)
    }

    function k(a, d, e, f, h, i, j) {
        return a = c(a, c(c(g(d, e, f), h), j)),
            c(b(a, i), d)
    }

    function l(a) {
        for (var b, c = a.length, d = c + 8, e = (d - d % 64) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i =
            0; c > i;)
            b = (i - i % 4) / 4,
                h = i % 4 * 8,
                g[b] = g[b] | a.charCodeAt(i) << h,
                i++;
        return b = (i - i % 4) / 4,
            h = i % 4 * 8,
            g[b] = g[b] | 128 << h,
            g[f - 2] = c << 3,
            g[f - 1] = c >>> 29,
            g
    }

    function m(a) {
        var b, c, d = "",
            e = "";
        for (c = 0; 3 >= c; c++)
            b = a >>> 8 * c & 255,
                e = "0" + b.toString(16),
                d += e.substr(e.length - 2, 2);
        return d
    }

    function n(a) {
        a = a.replace(/\r\n/g, "\n");
        for (var b = "", c = 0; c < a.length; c++) {
            var d = a.charCodeAt(c);
            128 > d ? b += String.fromCharCode(d) : d > 127 && 2048 > d ? (b += String.fromCharCode(d >> 6 | 192),
                b += String.fromCharCode(63 & d | 128)) : (b += String.fromCharCode(d >> 12 | 224),
                b += String.fromCharCode(d >> 6 & 63 | 128),
                b += String.fromCharCode(63 & d | 128))
        }
        return b
    }

    var o, p, q, r, s, t, u, v, w, x = [],
        y = 7,
        z = 12,
        A = 17,
        B = 22,
        C = 5,
        D = 9,
        E = 14,
        F = 20,
        G = 4,
        H = 11,
        I = 16,
        J = 23,
        K = 6,
        L = 10,
        M = 15,
        N = 21;
    for (a = n(a),
             x = l(a),
             t = 1732584193,
             u = 4023233417,
             v = 2562383102,
             w = 271733878,
             o = 0; o < x.length; o += 16)
        p = t,
            q = u,
            r = v,
            s = w,
            t = h(t, u, v, w, x[o + 0], y, 3614090360),
            w = h(w, t, u, v, x[o + 1], z, 3905402710),
            v = h(v, w, t, u, x[o + 2], A, 606105819),
            u = h(u, v, w, t, x[o + 3], B, 3250441966),
            t = h(t, u, v, w, x[o + 4], y, 4118548399),
            w = h(w, t, u, v, x[o + 5], z, 1200080426),
            v = h(v, w, t, u, x[o + 6], A, 2821735955),
            u = h(u, v, w, t, x[o + 7], B, 4249261313),
            t = h(t, u, v, w, x[o + 8], y, 1770035416),
            w = h(w, t, u, v, x[o + 9], z, 2336552879),
            v = h(v, w, t, u, x[o + 10], A, 4294925233),
            u = h(u, v, w, t, x[o + 11], B, 2304563134),
            t = h(t, u, v, w, x[o + 12], y, 1804603682),
            w = h(w, t, u, v, x[o + 13], z, 4254626195),
            v = h(v, w, t, u, x[o + 14], A, 2792965006),
            u = h(u, v, w, t, x[o + 15], B, 1236535329),
            t = i(t, u, v, w, x[o + 1], C, 4129170786),
            w = i(w, t, u, v, x[o + 6], D, 3225465664),
            v = i(v, w, t, u, x[o + 11], E, 643717713),
            u = i(u, v, w, t, x[o + 0], F, 3921069994),
            t = i(t, u, v, w, x[o + 5], C, 3593408605),
            w = i(w, t, u, v, x[o + 10], D, 38016083),
            v = i(v, w, t, u, x[o + 15], E, 3634488961),
            u = i(u, v, w, t, x[o + 4], F, 3889429448),
            t = i(t, u, v, w, x[o + 9], C, 568446438),
            w = i(w, t, u, v, x[o + 14], D, 3275163606),
            v = i(v, w, t, u, x[o + 3], E, 4107603335),
            u = i(u, v, w, t, x[o + 8], F, 1163531501),
            t = i(t, u, v, w, x[o + 13], C, 2850285829),
            w = i(w, t, u, v, x[o + 2], D, 4243563512),
            v = i(v, w, t, u, x[o + 7], E, 1735328473),
            u = i(u, v, w, t, x[o + 12], F, 2368359562),
            t = j(t, u, v, w, x[o + 5], G, 4294588738),
            w = j(w, t, u, v, x[o + 8], H, 2272392833),
            v = j(v, w, t, u, x[o + 11], I, 1839030562),
            u = j(u, v, w, t, x[o + 14], J, 4259657740),
            t = j(t, u, v, w, x[o + 1], G, 2763975236),
            w = j(w, t, u, v, x[o + 4], H, 1272893353),
            v = j(v, w, t, u, x[o + 7], I, 4139469664),
            u = j(u, v, w, t, x[o + 10], J, 3200236656),
            t = j(t, u, v, w, x[o + 13], G, 681279174),
            w = j(w, t, u, v, x[o + 0], H, 3936430074),
            v = j(v, w, t, u, x[o + 3], I, 3572445317),
            u = j(u, v, w, t, x[o + 6], J, 76029189),
            t = j(t, u, v, w, x[o + 9], G, 3654602809),
            w = j(w, t, u, v, x[o + 12], H, 3873151461),
            v = j(v, w, t, u, x[o + 15], I, 530742520),
            u = j(u, v, w, t, x[o + 2], J, 3299628645),
            t = k(t, u, v, w, x[o + 0], K, 4096336452),
            w = k(w, t, u, v, x[o + 7], L, 1126891415),
            v = k(v, w, t, u, x[o + 14], M, 2878612391),
            u = k(u, v, w, t, x[o + 5], N, 4237533241),
            t = k(t, u, v, w, x[o + 12], K, 1700485571),
            w = k(w, t, u, v, x[o + 3], L, 2399980690),
            v = k(v, w, t, u, x[o + 10], M, 4293915773),
            u = k(u, v, w, t, x[o + 1], N, 2240044497),
            t = k(t, u, v, w, x[o + 8], K, 1873313359),
            w = k(w, t, u, v, x[o + 15], L, 4264355552),
            v = k(v, w, t, u, x[o + 6], M, 2734768916),
            u = k(u, v, w, t, x[o + 13], N, 1309151649),
            t = k(t, u, v, w, x[o + 4], K, 4149444226),
            w = k(w, t, u, v, x[o + 11], L, 3174756917),
            v = k(v, w, t, u, x[o + 2], M, 718787259),
            u = k(u, v, w, t, x[o + 9], N, 3951481745),
            t = c(t, p),
            u = c(u, q),
            v = c(v, r),
            w = c(w, s);
    var O = m(t) + m(u) + m(v) + m(w);
    return O.toLowerCase()
}
function Env(a, b) {
    return "undefined" != typeof process && JSON.stringify(process.env).indexOf("xxx") > -1 && process.exit(0), new class {
        constructor(a, b) {
            this.name = a, this.notifyStr = "", this.startTime = (new Date).getTime(), Object.assign(this, b), console.log(`${this.name} 开始运行：
`)
        } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } getdata(b) { let a = this.getval(b); if (/^@/.test(b)) { let [, c, f] = /^@(.*?)\.(.*?)$/.exec(b), d = c ? this.getval(c) : ""; if (d) try { let e = JSON.parse(d); a = e ? this.lodash_get(e, f, "") : a } catch (g) { a = "" } } return a } setdata(c, d) { let a = !1; if (/^@/.test(d)) { let [, b, e] = /^@(.*?)\.(.*?)$/.exec(d), f = this.getval(b), i = b ? "null" === f ? null : f || "{}" : "{}"; try { let g = JSON.parse(i); this.lodash_set(g, e, c), a = this.setval(JSON.stringify(g), b) } catch (j) { let h = {}; this.lodash_set(h, e, c), a = this.setval(JSON.stringify(h), b) } } else a = this.setval(c, d); return a } getval(a) { return this.isSurge() || this.isLoon() ? $persistentStore.read(a) : this.isQuanX() ? $prefs.valueForKey(a) : this.isNode() ? (this.data = this.loaddata(), this.data[a]) : this.data && this.data[a] || null } setval(b, a) { return this.isSurge() || this.isLoon() ? $persistentStore.write(b, a) : this.isQuanX() ? $prefs.setValueForKey(b, a) : this.isNode() ? (this.data = this.loaddata(), this.data[a] = b, this.writedata(), !0) : this.data && this.data[a] || null } send(b, a, f = () => { }) { if ("get" != b && "post" != b && "put" != b && "delete" != b) { console.log(`无效的http方法：${b}`); return } if ("get" == b && a.headers ? (delete a.headers["Content-Type"], delete a.headers["Content-Length"]) : a.body && a.headers && (a.headers["Content-Type"] || (a.headers["Content-Type"] = "application/x-www-form-urlencoded")), this.isSurge() || this.isLoon()) { this.isSurge() && this.isNeedRewrite && (a.headers = a.headers || {}, Object.assign(a.headers, { "X-Surge-Skip-Scripting": !1 })); let c = { method: b, url: a.url, headers: a.headers, timeout: a.timeout, data: a.body }; "get" == b && delete c.data, $axios(c).then(a => { let { status: b, request: c, headers: d, data: e } = a; f(null, c, { statusCode: b, headers: d, body: e }) }).catch(a => console.log(a)) } else if (this.isQuanX()) a.method = b.toUpperCase(), this.isNeedRewrite && (a.opts = a.opts || {}, Object.assign(a.opts, { hints: !1 })), $task.fetch(a).then(a => { let { statusCode: b, request: c, headers: d, body: e } = a; f(null, c, { statusCode: b, headers: d, body: e }) }, a => f(a)); else if (this.isNode()) { this.got = this.got ? this.got : require("got"); let { url: d, ...e } = a; this.instance = this.got.extend({ followRedirect: !1 }), this.instance[b](d, e).then(a => { let { statusCode: b, request: c, headers: d, body: e } = a; f(null, c, { statusCode: b, headers: d, body: e }) }, b => { let { message: c, response: a } = b; f(c, a, a && a.body) }) } } time(a) { let b = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "h+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; for (let c in /(y+)/.test(a) && (a = a.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))), b) new RegExp("(" + c + ")").test(a) && (a = a.replace(RegExp.$1, 1 == RegExp.$1.length ? b[c] : ("00" + b[c]).substr(("" + b[c]).length))); return a } async showmsg() { if (!this.notifyStr) return; let a = this.name + " \u8FD0\u884C\u901A\u77E5\n\n" + this.notifyStr; if ($.isNode()) { var b = require("./sendNotify"); console.log("\n============== \u63A8\u9001 =============="), await b.sendNotify(this.name, a) } else this.msg(a) } logAndNotify(a) { console.log(a), this.notifyStr += a, this.notifyStr += "\n" } msg(d = t, a = "", b = "", e) { let f = a => { if (!a) return a; if ("string" == typeof a) return this.isLoon() ? a : this.isQuanX() ? { "open-url": a } : this.isSurge() ? { url: a } : void 0; if ("object" == typeof a) { if (this.isLoon()) { let b = a.openUrl || a.url || a["open-url"], c = a.mediaUrl || a["media-url"]; return { openUrl: b, mediaUrl: c } } if (this.isQuanX()) { let d = a["open-url"] || a.url || a.openUrl, e = a["media-url"] || a.mediaUrl; return { "open-url": d, "media-url": e } } if (this.isSurge()) return { url: a.url || a.openUrl || a["open-url"] } } }; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(d, a, b, f(e)) : this.isQuanX() && $notify(d, a, b, f(e))); let c = ["", "============== \u7CFB\u7EDF\u901A\u77E5 =============="]; c.push(d), a && c.push(a), b && c.push(b), console.log(c.join("\n")) } getMin(a, b) { return a < b ? a : b } getMax(a, b) { return a < b ? b : a } padStr(e, b, f = "0") { let a = String(e), g = b > a.length ? b - a.length : 0, c = ""; for (let d = 0; d < g; d++)c += f; return c + a } json2str(b, e, f = !1) { let c = []; for (let d of Object.keys(b).sort()) { let a = b[d]; a && f && (a = encodeURIComponent(a)), c.push(d + "=" + a) } return c.join(e) } str2json(e, f = !1) { let d = {}; for (let a of e.split("#")) { if (!a) continue; let b = a.indexOf("="); if (-1 == b) continue; let g = a.substr(0, b), c = a.substr(b + 1); f && (c = decodeURIComponent(c)), d[g] = c } return d } randomString(d, a = "abcdef0123456789") { let b = ""; for (let c = 0; c < d; c++)b += a.charAt(Math.floor(Math.random() * a.length)); return b } randomList(a) { let b = Math.floor(Math.random() * a.length); return a[b] } wait(a) { return new Promise(b => setTimeout(b, a)) } done(a = {}) {
            let b = (new Date).getTime(), c = (b - this.startTime) / 1e3; console.log(`
${this.name} 运行结束，共运行了 ${c} 秒！`), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(a)
        }
    }(a, b)
}
//===============================================获取远程通知========================================
async function getNotice() {
    try {
        const urls = [
            "https://tfapi.cn/tl.json",
            
        ];
        let notice = null;
        for (const url of urls) {
            const options = { url, headers: { "User-Agent": "" }, };
            const result = await httpRequest(options);
            if (result && "notice" in result) {
                notice = result.notice.replace(/\\n/g, "\n");
                break;
            }
        }
        if (notice) { $.DoubleLog(notice); }
    } catch (e) {
        console.log(e);
    }
}
