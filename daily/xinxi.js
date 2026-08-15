/*
------------------------------------------
@Author: sm
@Date: 2026.08.13 16:55
@Description:  心喜 小程序
cron: 30 7 * * *
------------------------------------------
#Notice:   
心喜小程序：目前没有库存 喜欢玩的就玩吧
抓api.xinc818.com 请求头的sso 多账户&或换行
变量名 xinxi
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
const $ = new Env("心喜小程序");
let ckName = `xinxi`;
const strSplitor = "#";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.token = this.user[0];
        this.posts = []

    }

    async run() {
        await this.userInfo()
        await this.tasklist()
    }

    generateMd5Signature = function (e) {
        var crypto = require("crypto");

        var t = Object.keys(e).sort().map((function (t) {
            return t + "=" + e[t]
        }
        )).join("&");
        return crypto.createHash("md5").update(t).digest("hex")
    }
    request(options) {
        let req_timestamp = Date.now();
        let request_id = Math.random().toString(36).substr(2, 9) + "-" + req_timestamp;
        let baseHeaders = {
            "req_timestamp": req_timestamp,
            "request_id": request_id,
            "User-Agent": defaultUserAgent,
            "sso": this.token,
            "sign": this.generateMd5Signature({ data: JSON.stringify(options.data), req_timestamp, request_id, }),
        }
        options.headers = { ...baseHeaders, ...options.headers }
        return axios.request(options)
    }

    async userInfo() {
        let options = {
            method: 'GET',
            url: `https://api.xinc818.com/mini/user`,
            headers: {}

        };
        let { data: result } = await this.request(options);
        if (result.code == 0) {
            $.log(`✅账号[${this.index}]  【${result.data.nickname}】积分【${result.data.integral}】🎉`)
            this.userId = result.data.id
        } else {
            console.log(`❌账号[${this.index}]  用户查询【false】`);
            console.log(result);
        }

    }
    async signIn() {
        let options = {
            method: 'GET',
            url: `https://api.xinc818.com/mini/sign/in?dailyTaskId=`,
            headers: {
                "Content-Type": "application/json",
            }


        };
        let { data: result } = await this.request(options);
        if (result.code == 0) {
            $.log(`✅账号[${this.index}]  签到状态【${result.data.flag}】获得积分【${result.data.integral}】🎉`)
        } else {
            $.log(`❌账号[${this.index}]  签到状态【false】`);
        }

    }
    async share() {
        let options = {
            method: 'GET',
            url: `https://api.xinc818.com/mini/dailyTask/share`,
            headers: {
                "Content-Type": "application/json",
            },
        };
        let { data: result } = await this.request(options);
        if (result.code == 0) {
            $.log(`✅账号[${this.index}]  完成分享成功 获得【${result.data.singleReward}】`)
        } else {
            console.log(`❌账号[${this.index}]  完成分享失败`);
            console.log(result);
        }

    }
    async tasklist() {
        let options = {
            method: 'GET',
            url: `https://api.xinc818.com/mini/dailyTask/daily`,
            headers: {}

        };
        let { data: result } = await this.request(options);
        if (result.code == 0) {
            for (let task of result.data) {
                await this.getPosts()
                if (task.status == false) {
                    // console.log(`${task.taskName}[${task.code}]--${task.annotation} -- ${task.finishNum}`)
                    if (task.code == 'BROWSE_PRODUC1TS') {
                        await this.browseGoods()
                    }
                    if (task.code == 'COMMENT_POSTS') {
                        await this.postsComments(this.posts[0].id)
                    }
                    if (task.code == 'LIKE_POSTS') {
                        await this.likePosts(this.posts[0].id)
                    }
                    if (task.code == 'FOCUS_USER') {
                        await this.followUser(this.posts[0].publisherId)
                    }
                    if (task.code == 'WANT_GOODS') {
                        await this.likeGoods()
                    }
                    if (task.code == 'SHARE') {
                        await this.share()
                    }
                    //未完成
                    //finishNum 已完成的数量
                }
            }
        } else {
            $.log(`❌账号[${this.index}]  任务列表【false】`);
        }

    }
    async browseGoods(postsId = 22) {
        let options = {
            method: 'GET',
            url: `https://api.xinc818.com/mini/dailyTask/browseGoods/` + postsId,
            headers: {},
        };
        let { data: result } = await this.request(options);
        if (result.code == 0) {
            $.log(`✅账号[${this.index}]  【浏览商品】成功 获得积分【${result.data.singleReward}】🎉`)
        } else {
            $.log(`❌账号[${this.index}]  【浏览商品】失败`);
            console.log(result);
        }

    }
    async postsComments(postsId) {
        try {
            let options = {
                method: 'POST',
                url: `https://api.xinc818.com/mini/postsComments`,
                headers: {
                    "Content-Type": "application/json",
                },
                data: { "content": "👍👍👍👍👍", "postsId": postsId }

            };
            let { data: result } = await this.request(options);
            if (result.code == 0) {
                $.log(`✅账号[${this.index}]  【发表评论】成功 获得积分【${result.data.taskResult.singleReward}】🎉`)
            }
        } catch (e) {
            $.log(`❎账号[${this.index}]  【发表评论】失败`)
        }

    }
    async getPosts() {
        let options = {
            method: 'GET',
            url: `https://api.xinc818.com/mini/community/home/posts?pageNum=1&pageSize=10&queryType=3&position=2`,
            headers: {}

        };
        let { data: result } = await this.request(options);
        if (result.code == 0) {
            this.posts = result.data.list
        }
    }
    async likePosts() {
        //找到posts里面liked为false的
        let posts = this.posts.filter(item => item.liked == false)
        let options = {
            method: 'PUT',
            url: `https://api.xinc818.com/mini/posts/like`,
            headers: {
                "Content-Type": "application/json",
            },
            data: { "postsId": posts[0].id, "decision": true }

        };

        let { data: result } = await this.request(options);
        if (result.code == 0) {
            // console.log(result);
            $.log(`✅账号[${this.index}]  【点赞帖子】成功 获得积分【${result.data.singleReward}】🎉`)
        }else{
            $.log(`❎账号[${this.index}]  【点赞帖子】失败，原因【${result.msg}】🎉`)
        }
    }

    async followUser(publisherId) {
        let options = {
            method: 'PUT',
            url: `https://api.xinc818.com/mini/user/follow`,
            headers: {
                "Content-Type": "application/json",
            },
            data: { "followUserId": publisherId, "decision": true }

        };
        let { data: result } = await this.request(options);
        if (result.code == 0) {
            $.log(`✅账号[${this.index}]  【关注用户】成功 获得积分【${result.data.singleReward}】🎉`)
        }else{
            $.log(`❎账号[${this.index}]  【关注用户】失败，原因【${result.msg}】🎉`)
        }
    }
    async likeGoods(goodsId = "210000904376") {
        try {
            let options = {
                method: 'POST',
                url: `https://api.xinc818.com/mini/live/likeLiveItem`,
                headers: {
                    "Content-Type": "application/json",
                },
                data: { "isLike": true, "dailyTaskId": 20, "productId": goodsId }

            };
            let { data: result } = await this.request(options);
            if (result.code == 0) {
                $.log(`✅账号[${this.index}]  【点赞商品】成功 获得积分【${result.data.singleReward}】🎉`)
            }
        } catch (err) {
            $.log(`❎账号[${this.index}]  【点赞商品】失败:${err}`)
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
            timeout: 3000
        }
        let {
            data: res
        } = await axios.request(options);
        $.log(res)
        return res
    } catch (e) { }

}
