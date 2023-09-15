/**
 * new Env("幸福计步-走路赚零钱")
 * cron 22 12,19 * * *  xingfujibu.js
 * Show: 每天1
 * 变量名:xingfujibu
 * 变量值:https://xfjb.yichengwangluo.net/api headers中Authorization的值（去掉Bearer）&device的值&&User-Agent中（）里面的值 例如(Linux; U; Android 11; XIAOMI 8 MIUI/V11.0.1.0.QXXXXXM)
 * 完整格式 eyJ0eXAiOiJKV1M...&3xxxxxxxxxxxxxxa&(Linux; U; Android 11; XIAOMI 8 MIUI/V11.0.1.0.QXXXXXM)
 * 缺一不可 黑号自负
 * 多账号 @ 分割
 * scriptVersionNow = "0.0.3";
 * 修复任务不执行的BUG
 * 不要超过3个号单IP 否则必黑
 */

const $ = new Env("幸福计步-走路赚零钱");
const ckName = "xingfujibu";
const Notify = 1; //0为关闭通知,1为打开通知,默认为1
let envSplitor = ["@"]; //多账号分隔符
let strSplitor = '&'; //多变量分隔符
let scriptVersionNow = "0.0.3";


async function start() {
    await getVersion("smallfawn/QLScriptPublic@main/akrd.js");
    await getNotice();

    console.log("\n================== 用户信息 ==================\n");
    let taskall = [];
    for (let user of $.userList) {
        if (user.ckStatus) {
            taskall.push(await user.task());
            await $.wait(1000);
        }
    }
    await Promise.all(taskall);
}

class UserInfo {
    constructor(str) {
        this.index = ++$.userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.device = str.split(strSplitor)[1]
        this.ua = str.split(strSplitor)[2]
        this.ckStatus = true;
        this.ecpm = ""
        this.getHeaders = {
            "accept": "application/json",
            "device": this.device,
            "oaid": this.device,
            "store": "website",
            "version": 108,
            "platform": 1,
            "Authorization": `Bearer ${this.ck}`,
            "User-Agent": `Dalvik/2.1.0 ${this.ua}`,
            "Host": "xfjb.yichengwangluo.net",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip",
        }
        this.postHeaders = {
            "accept": "application/json",
            "device": this.device,
            "oaid": this.device,
            "store": "website",
            "version": 108,
            "platform": 1,
            "Authorization": `Bearer ${this.ck}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": `Dalvik/2.1.0 ${this.ua}`,
            "Host": "xfjb.yichengwangluo.net",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip",
        }
    }
    getRandomEcpm() {
        let result = Math.floor(Math.random() * (1200 - 300 + 1)) + 300;
        return result.toString() + "0.0"
    }
    async task() {
        await this.checkCK()
    }
    async cash_info() {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/cash/exchange`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                $.DoubleLog(`✅账号[${this.index}]  绑定微信[${result.result.nickname}]`);
                $.DoubleLog(`✅账号[${this.index}]  判断是否达到体现要求`);
                if (result.result.items[1].is_ok == 1) {
                    $.DoubleLog(`✅账号[${this.index}]  达到一元提现要求 准备提现`);
                    await $.wait(5000)
                    await this.cash_exchange()
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  查看提现信息失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }

    }
    async cash_exchange() {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/cash/exchange`,
                headers: this.postHeaders,
                body: "gate=wechat&amount=1&lat=&lng=&root=0&sim=1&debug=1&model=MI 8 Lite&power=0&vpn=0"
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                $.DoubleLog(`账号[${this.index}] ${result}`);
            } else {
                $.DoubleLog(`❌账号[${this.index}]  提现失败`);
                //console.log(options);
                //console.log(result);
            }

        } catch (e) {
            console.log(e);
        }

    }
    async barrierGet() {//闯关
        try {
            try {
                let options = {
                    url: `https://xfjb.yichengwangluo.net/api/v2/reward/barrier/index`,
                    headers: this.getHeaders,
                },
                    result = await httpRequest(options);
                //console.log(options);
                //console.log(result);
                if (result.success == true) {
                    $.DoubleLog(`开始闯关`);
                    for (let i of result.result.barrier) {
                        if (i["state"] == 0) {
                            let status0, tid, showStatus, completedStatus
                            status0 = await this.action_init()
                            if (status0 !== false) {
                                tid = await this.action_load(4);
                            }
                            if (tid !== false) {
                                this.ecpm = this.getRandomEcpm()
                                showStatus = await this.action_showd(tid, 4);
                            }
                            if (showStatus !== false) {
                                completedStatus = await this.action_completed("", tid, 4);
                            }
                            if (completedStatus !== false) {

                                let noId = result.result.barrier.indexOf(i) + 1;
                                await this.barrierPost(noId)

                                let waitTime = Math.floor(Math.random() * 16) + 15
                                $.DoubleLog(`刷新广告 - 随机等待${waitTime}s`);
                                await $.wait(waitTime * 1000)

                            }

                        }
                    }
                } else {
                    $.DoubleLog(`❌账号[${this.index}]  获取闯关状态失败`);
                    //console.log(options);
                    //console.log(result);
                }
            } catch (e) {
                console.log(e);
            }


        } catch (e) {
            console.log(e);
        }
    }

    async barrierPost(no) {//闯关
        try {
            try {
                let options = {
                    url: `https://xfjb.yichengwangluo.net/api/v2/reward/barrier/index`,
                    headers: this.postHeaders,
                    body: `no=${no}&ticket=`
                },
                    result = await httpRequest(options);
                //console.log(options);
                //console.log(result);
                if (result.success == true) {
                    $.DoubleLog(`✅账号[${this.index}]  闯关成功 获得[${result.result.coin}]金币 [${result.result.coupon}]提现券`);
                } else {
                    $.DoubleLog(`❌账号[${this.index}]  闯关失败`);
                    //console.log(options);
                    //console.log(result);
                }
            } catch (e) {
                console.log(e);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async checkCK() {
        console.log()
        if (this.device !== undefined && this.ua !== undefined && this.ck !== undefined) {
            
            await this.barrierGet()
            await this.task_list(0)
            await this.task_list(1)
            await this.cash_info()
        } else {
            $.DoubleLog(`✅账号[${this.index}]  参数不全不执行`);

        }
    }
    async task_list(type) {
        try {
            //只有0-5可以做
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/zhuan/index`,
                headers: this.postHeaders,
                body: " "
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                let signIn = result.result.items[0]
                let ad = result.result.items[1]
                let news = result.result.items[2]
                let video = result.result.items[3]
                let zhuan = result.result.items[4]
                let kan = result.result.items[5]
                if (type == 0) {
                    if (signIn.st == 0) {
                        //签到
                        $.DoubleLog(`✅账号[${this.index}]  执行签到`);
                        await this.signIn()
                    }
                    if (ad.st == 0) {
                        $.DoubleLog(`✅账号[${this.index}]  执行看广告`);
                        for (let i = 0; i < 5; i++) {
                            //看广告
                            let status0, ticket, tid, showStatus
                            status0 = await this.action_init()
                            if (status0 !== false) {
                                ticket = await this.action_video()
                            }
                            if (ticket !== false) {
                                tid = await this.action_load(9);
                            }
                            if (tid !== false) {
                                this.ecpm = this.getRandomEcpm()
                                showStatus = await this.action_showd(tid, 9);
                            }
                            if (showStatus !== false) {
                                await this.action_completed(ticket, tid, 9);
                            }

                            let waitTime = Math.floor(Math.random() * 16) + 90
                            $.DoubleLog(`刷新广告 - 随机等待${waitTime}s`);
                            await $.wait(waitTime * 1000)
                        }
                    }
                    if (news.st == 0) {
                        $.DoubleLog(`✅账号[${this.index}]  执行看资讯`);
                        for (let i = 0; i < 5; i++) {
                            //看资讯
                            await this.news_cost()
                        }
                    }
                    if (video.st == 0) {
                        $.DoubleLog(`✅账号[${this.index}]  执行看视频`);
                        for (let i = 0; i < 5; i++) {
                            //看视频
                            await this.video_cost()
                        }
                    }
                    if (zhuan.st == 0) {
                        $.DoubleLog(`✅账号[${this.index}]  执行看文章`);
                        for (let i = 0; i < 5; i++) {
                            //看文章
                            await this.zhuan_count1()
                        }
                    }
                    if (kan.st == 0) {
                        $.DoubleLog(`✅账号[${this.index}]  执行看看赚`);

                        //看看赚
                        await this.kan_click(1)
                        await this.kan_click(2)
                        await this.kan_click(3)
                        await this.kan_click(4)
                    }
                    $.DoubleLog(`账号[${this.index}]  任务执行完毕--------------------------------`);
                } else if (type == 1) {
                    if (ad.st == 1) {
                        $.DoubleLog(`✅账号[${this.index}]  领取看广告奖励`);
                        await this.task_done(ad.id)
                    }
                    if (news.st == 1) {
                        $.DoubleLog(`✅账号[${this.index}]  领取看资讯奖励`);
                        await this.task_done(news.id)
                    }
                    if (video.st == 1) {
                        $.DoubleLog(`✅账号[${this.index}]  领取看视频奖励`);
                        await this.task_done(video.id)
                    }
                    if (zhuan.st == 1) {
                        $.DoubleLog(`✅账号[${this.index}]  领取看文章奖励`);
                        await this.task_done(zhuan.id)
                    }
                    if (kan.st == 1) {
                        $.DoubleLog(`✅账号[${this.index}]  领取看看赚奖励`);
                        await this.task_done(kan.id)
                    }
                    $.DoubleLog(`账号[${this.index}]  任务执行完毕--------------------------------`);
                }

            } else {
                $.DoubleLog(`❌账号[${this.index}]  获取任务列表失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async signIn() {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/reward/sign`,
                headers: this.postHeaders,
                body: ` `
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result.message.indexOf("成功") !== -1) {
                    $.DoubleLog(`✅账号[${this.index}]  领取签到奖励成功 获得[${result.result.coin}]金币 [${result.result.coupon}]提现券`);
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  领取签到奖励失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_done(id) {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/zhuan/done`,
                headers: this.postHeaders,
                body: `id=${id}`
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result.message.indexOf("成功") !== -1) {
                    $.DoubleLog(`✅账号[${this.index}]  领取完成任务奖励成功 获得[${result.result.coin}]金币 [${result.result.coupon}]提现券`);
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  领取完成任务奖励失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async news_cost() {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/news/cost`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result == "success") {
                    $.DoubleLog(`初始化看资讯`);
                    await this.news_coin_start();
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  初始化看资讯失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async news_coin_start() {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/news/coin`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result.ticket !== "") {

                    let waitTime = Math.floor(Math.random() * 16) + 30
                    $.DoubleLog(`模拟看资讯 - 随机等待${waitTime}s`);

                    await $.wait(waitTime * 1000)

                    await this.news_coin_do(result.result.ticket);
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  模拟看资讯失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async news_coin_do(ticket) {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/news/coin?ticket=${ticket}`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result.ticket !== "") {
                    $.DoubleLog(`✅账号[${this.index}]  看资讯获得金币[${result.result.reward}]🎉`);
                    await this.news_coin_end()
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  看资讯获得金币失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async news_coin_end() {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/news/cost?end=1`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result == "success") {
                    $.DoubleLog(`本次看资讯结束`);
                    this.a
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  本次看资讯结束失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async kan_click(id) {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/kan/click?id=${id}`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result.ticket !== "") {
                    $.DoubleLog(`✅账号[${this.index}]  获取看看赚任务成功`);
                    //等待60-70s

                    let waitTime = Math.floor(Math.random() * 16) + 60
                    $.DoubleLog(`模拟看看赚任务 - 随机等待${waitTime}s`);

                    await $.wait(waitTime * 1000)

                    await this.kan_index(result.result.ticket, result.result.id);
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  获取看看赚任务失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async kan_index(ticket, id) {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/kan/index`,
                headers: this.postHeaders,
                body: `ticket=${ticket}&id=${id}`
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                $.DoubleLog(`✅账号[${this.index}]  看看赚任务获得${result.result.coin}`);

            } else {
                $.DoubleLog(`❌账号[${this.index}]  看看赚任务获得奖励失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async zhuan_count1() {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/news/sdk/zhuan/count?isfirstopen=1`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result.status == "ok") {
                    //等待30-45s
                    let waitTime = Math.floor(Math.random() * 16) + 30
                    $.DoubleLog(`模拟阅读文章任务 - 随机等待${waitTime}s`);
                    await $.wait(waitTime * 1000)

                    await this.zhuan_count0()
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  模拟阅读文章任务失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async zhuan_count0() {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/news/sdk/zhuan/count?isfirstopen=0`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result.status == "ok") {
                    $.DoubleLog(`✅账号[${this.index}]  阅读文章成功`);
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  阅读文章失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async video_cost() {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/video/cost?type=short`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result == "success") {
                    $.DoubleLog(`初始化看视频`);

                    await this.video_coin_start();
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  初始化看视频失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async video_coin_start() {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/video/coin`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result.ticket !== "") {
                    let waitTime = Math.floor(Math.random() * 16) + 60
                    $.DoubleLog(`模拟看视频任务 - 随机等待${waitTime}s`);
                    await $.wait(waitTime * 1000)

                    await this.video_coin_do(result.result.ticket);
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  模拟看视频任务失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async video_coin_do(ticket) {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/video/coin?ticket=${ticket}`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result.ticket !== "") {
                    $.DoubleLog(`✅账号[${this.index}]  看视频获得金币[${result.result.reward}]🎉`);
                    await this.video_coin_end()
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  看视频获得金币失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async video_coin_end() {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/video/cost?type=short&end=1`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result == "success") {
                    $.DoubleLog(`本次看视频任务结束`);

                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  本次看视频任务结束失败`);
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async action_init() {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/ads/action/init`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result.reg == 1 || result.result.reg == 0) {
                    $.DoubleLog(`初始化广告`);
                    return true
                }
            } else {
                $.DoubleLog(`❌账号[${this.index}]  初始化广告失败`);
                return false
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async action_video() {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/zhuan/video`,
                headers: this.postHeaders,
                body: "type=1"
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result.ticket !== "") {
                    $.DoubleLog(`加载广告`);
                    //await this.action_load(result.result.ticket);
                    return result.result.ticket
                    //$.DoubleLog(result.result.tip)
                }

            } else {
                $.DoubleLog(`❌账号[${this.index}]  加载广告失败`);
                return false
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async action_load(type) {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/ads/action/load?class=10000&&channel=2&type=${type}`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result.tid !== "") {
                    $.DoubleLog(`展示广告`);
                    //await this.action_showd(ticket, result.result.tid)
                    return result.result.tid
                }
                //等待2分钟
            } else {
                $.DoubleLog(`❌账号[${this.index}]  展示广告失败`);
                return false
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async action_showd(tid, type) {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/ads/action/showed?class=10000&channel=2&type=${type}&ecpm=${this.ecpm}&tid=${tid}&platformname=6`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                if (result.result == "success") {
                    $.DoubleLog(`模拟看广告`);
                    let waitTime = Math.floor(Math.random() * 16) + 60
                    $.DoubleLog(`随机等待${waitTime}s`);
                    await $.wait(waitTime * 1000)
                    return true
                    //await this.action_completed(ticket, tid)
                }
                //等待2分钟
            } else {
                $.DoubleLog(`❌账号[${this.index}]  模拟看广告失败`);
                return false
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async action_completed(ticket, tid, type) {
        try {
            let options = {
                url: `https://xfjb.yichengwangluo.net/api/v2/ads/action/completed?class=10000&type=${type}&ticket=${ticket}&ecpm=${this.ecpm}&tid=${tid}&platformname=6`,
                headers: this.getHeaders,
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.success == true) {
                $.DoubleLog(`✅账号[${this.index}]  看视频获得:[${result.result.reward}]金币 [${result.result.coupon}]提现币🎉`);
                return true

            } else {
                $.DoubleLog(`❌账号[${this.index}]  看视频获得奖励失败`);
                return false
                //console.log(options);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
}

!(async () => {
    if (!(await checkEnv())) return;
    if ($.userList.length > 0) {
        await start();
    } await $.SendMsg($.message);
})().catch((e) => console.log(e)).finally(() => $.done());

//********************************************************
/**
 * 变量检查与处理
 * @returns
 */
async function checkEnv() {
    let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || "";
    //let userCount = 0;
    if (userCookie) {
        // console.log(userCookie);
        let e = envSplitor[0];
        for (let o of envSplitor)
            if (userCookie.indexOf(o) > -1) {
                e = o;
                break;
            }
        for (let n of userCookie.split(e)) n && $.userList.push(new UserInfo(n));
        //userCount = $.userList.length;
    } else {
        console.log("未找到CK");
        return;
    }
    return console.log(`共找到${$.userList.length}个账号`), true; //true == !0
}

/////////////////////////////////////////////////////////////////////////////////////
function httpRequest(options, method = null) {
    method = options.method ? options.method.toLowerCase() : options.body ? "post" : "get";
    return new Promise((resolve) => {
        $[method](options, (err, resp, data) => {
            //console.log(resp)
            if (err) {
                console.log(`${method}请求失败`);
                $.logErr(err);
            } else {
                if (data) {
                    try { data = JSON.parse(data); } catch (error) { }
                    resolve(data);
                } else {
                    console.log(`请求api返回数据为空，请检查自身原因`);
                }
            }
            resolve();
        });
    });
}
/**
 * 获取远程版本
 */
function getVersion(scriptUrl, timeout = 3 * 1000) {
    return new Promise((resolve) => {
        const options = { url: `https://originfastly.jsdelivr.net/gh/${scriptUrl}` };
        $.get(options, (err, resp, data) => {
            try {
                const regex = /scriptVersionNow\s*=\s*(["'`])([\d.]+)\1/;
                const match = data.match(regex);
                const scriptVersionLatest = match ? match[2] : "";
                $.DoubleLog(`\n====== 当前版本：${scriptVersionNow} 📌 最新版本：${scriptVersionLatest} ======`);
            } catch (e) {
                $.logErr(e, resp);
            }
            resolve();
        }, timeout);
    });
}
/**
 * 获取远程通知
 */
function getNotice(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        const options = { url: `https://originfastly.jsdelivr.net/gh/smallfawn/Note@main/Notice.json` };
        $.get(options, (err, resp, data) => {
            try {
                try {
                    data = JSON.parse(data);
                } catch (error) { }
                const notice = data.notice.replace(/\\n/g, "\n");
                $.DoubleLog(notice);
            } catch (e) {
                $.logErr(e, resp);
            }
            resolve();
        }, timeout);
    });
}
// ==================== API ==================== //
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, a) => { s.call(this, t, (t, s, r) => { t ? a(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.userList = []; this.userIdx = 0; this.message = ""; this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name},开始!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const a = this.getdata(t); if (a) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, a) => e(a)) }) } runScript(t, e) { return new Promise(s => { let a = this.getdata("@chavy_boxjs_userCfgs.httpapi"); a = a ? a.replace(/\n/g, "").trim() : a; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [i, o] = a.split("@"), n = { url: `http://${o}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": i, Accept: "*/*" }, timeout: r }; this.post(n, (t, e, a) => s(a)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e); if (!s && !a) return {}; { const a = s ? t : e; try { return JSON.parse(this.fs.readFileSync(a)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : a ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const a = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of a) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, a) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[a + 1]) >> 0 == +e[a + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, a] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, a, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, a, r] = /^@(.*?)\.(.*?)$/.exec(e), i = this.getval(a), o = a ? "null" === i ? null : i || "{}" : "{}"; try { const e = JSON.parse(o); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), a) } catch (e) { const i = {}; this.lodash_set(i, r, t), s = this.setval(JSON.stringify(i), a) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return this.data = this.loaddata(), this.data[t]; default: return this.data && this.data[t] || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0; default: return this.data && this.data[e] || null } } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { switch (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), t.params && (t.url += "?" + this.queryStr(t.params)), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, a) => { !t && s && (s.body = a, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, a) }); break; case "Quantumult X": this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i, o) }, t => e(t && t.error || "UndefinedError")); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: a, statusCode: r, headers: i, rawBody: o } = t, n = s.decode(o, this.encoding); e(null, { status: a, statusCode: r, headers: i, rawBody: o, body: n }, n) }, t => { const { message: a, response: r } = t; e(a, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch (t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, a) => { !t && s && (s.body = a, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, a) }); break; case "Quantumult X": t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i, o) }, t => e(t && t.error || "UndefinedError")); break; case "Node.js": let a = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...i } = t; this.got[s](r, i).then(t => { const { statusCode: s, statusCode: r, headers: i, rawBody: o } = t, n = a.decode(o, this.encoding); e(null, { status: s, statusCode: r, headers: i, rawBody: o, body: n }, n) }, t => { const { message: s, response: r } = t; e(s, r, r && a.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let a = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in a) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? a[e] : ("00" + a[e]).substr(("" + a[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let a = t[s]; null != a && "" !== a && ("object" == typeof a && (a = JSON.stringify(a)), e += `${s}=${a}&`) } return e = e.substring(0, e.length - 1), e } msg(e = t, s = "", a = "", r) { const i = t => { switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } case "Loon": { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } case "Quantumult X": { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, a = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": a } } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, a, i(r)); break; case "Quantumult X": $notify(e, s, a, i(r)); break; case "Node.js": }if (!this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), a && t.push(a), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `❗️${this.name},错误!`, t); break; case "Node.js": this.log("", `❗️${this.name},错误!`, t.stack) } } wait(t) { return new Promise(e => setTimeout(e, t)) } DoubleLog(d) { if (this.isNode()) { if (d) { console.log(`${d}`); this.message += `\n ${d}` } } else { console.log(`${d}`); this.message += `\n ${d}` } } async SendMsg(m) { if (!m) return; if (Notify > 0) { if (this.isNode()) { var notify = require("./sendNotify"); await notify.sendNotify(this.name, m) } else { this.msg(this.name, "", m) } } else { console.log(m) } } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; switch (this.log("", `🔔${this.name},结束!🕛${s}秒`), this.log(), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } }(t, e) }
//Env rewrite:smallfawn Update-time:23-07-26 newAdd:DoubleLog & SendMsg & ChangeMessage
