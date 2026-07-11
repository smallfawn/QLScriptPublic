
/**

 * 多账号使用 @ 或者 & 或 新建多个环境变量
 * cron: 12 8 * * *
 * safe的值 
 */

const $ = Env('战马能量星球');
const notify = $.isNode() ? require('../sendNotify') : '';      // 这里是 node（青龙属于node环境）通知相关的
const Notify = 0; //0为关闭通知，1为打开通知,未添加
const debug = 0; //0为关闭调试，1为打开调试,默认为0
const ganta = 1; //0为关闭饲料互助，1为打开互助,默认为1
const addFriend = 1; //0为关闭加好友，1为打开加好友,默认为1
//////////////////////////////////////////////////////////////////
let zmnlxq = process.env.zmnlxq;
let zmnlxqArr = [];
let frinds = [];
let totalAccountsfrinds = [];
let data = '';
let msg = '';
let Version = "1.0.0";
let VersionLatest = '';
let ok = ''


!(async () => {

    if (!(await Envs()))    //多账号分割 判断变量是否为空  初步处理多账号
        return;
    else {
        //await getVersion();
        console.log(``)
        console.log(`目前实现功能：日常签到、摸马儿、喂马、偷饲料、分享马儿、喂饲料、互助点赞、完善个人信息`);

        console.log(`\n\n=========================================    \n脚本执行 - 北京时间(UTC+8)：${new Date(
            new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
            8 * 60 * 60 * 1000).toLocaleString()} \n=========================================\n`);

        console.log(`\n=================== 共找到 ${zmnlxqArr.length} 个账号 ===================`)
        if (addFriend) {
            for (let index = 0; index < zmnlxqArr.length; index++) {
                zmnlxq = zmnlxqArr[index]
                console.log('去加好友');
                await $.wait(200);
                for (let index2 = 0; index2 < zmnlxqArr.length; index2++) {
                    if (index != index2) {
                        await getranklist(true, zmnlxqArr[index2]);
                        await $.wait(2 * 1000);
                    }
                }
            }
        }

        for (let index = 0; index < zmnlxqArr.length; index++) {
            let num = index + 1
            zmnlxq = zmnlxqArr[index]
            console.log(`\n========= 开始【第 ${num} 个账号】执行任务=========\n`)
            //      data = zmnlxqArr[index].split('&');    

            console.log('开始获取信息');
            await getuser();
            await $.wait(2 * 1000);

            if (ok == 1) {
                console.log('开始签到');
                await $.wait(2 * 1000);
                await checkin();

                console.log('查询题库');
                await $.wait(2 * 1000);
                await gettiku();

                console.log('分享任务');
                await getshare();
                await $.wait(2 * 1000);

                console.log('加入排行榜');
                await joinxcx();
                await $.wait(2 * 1000);

                console.log('领取小马儿');
                await getmaer();
                await $.wait(2 * 1000);

                console.log('摸一摸');
                await getmoyimo();
                await $.wait(2 * 1000);

                console.log('马儿分享任务');
                await checkslgift();
                await $.wait(2 * 1000);

                console.log('去喂马');
                await getweima();
                await $.wait(2 * 1000);

                console.log('去点赞');
                await getranklist();
                await $.wait(2 * 1000);
            }
        }

        if (ganta) {
            for (let index = 0; index < zmnlxqArr.length; index++) {
                let num = index + 1
                zmnlxq = zmnlxqArr[index]
                console.log(`\n========= 开始【第 ${num} 个账号】执行饲料互助=========\n`)
                let isCompletedTousiliao = false, isCompletedSongsiliao = false;
                for (let num2 = 0; num2 < totalAccountsfrinds.length; num2++) {
                    await getotherhorseinfo(totalAccountsfrinds[num2]?.id);
                    if (!isCompletedTousiliao) {
                        console.log('去偷饲料');
                        isCompletedTousiliao = await tousiliao(num2);
                        await $.wait(2 * 1000);
                    }
                    if (!isCompletedSongsiliao) {
                        console.log('去送饲料');
                        isCompletedSongsiliao = await songsiliao(num2);
                    }
                    if (isCompletedSongsiliao && isCompletedTousiliao) {
                        console.log('今日已到上限，无需执行！');
                        break;
                    }
                }
            }
        }

        await SendMsg(msg);    // 与发送通知有关系
    }

})()
    .catch((e) => console.log(e))
    .finally(() => $.done())

/**
 * 获取信息
 * 
 */
async function getuser(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/getusercenter?safe=${zmnlxq}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                console.log(error)
                console.log(data)
                result = JSON.parse(data)
                if (result.status == 1) {
                    ok = 1;
                    console.log(`用户：${result.nickname}` + `当前能量：${result.nowscore} `);
                    if (result.isgzhkl == 0) {
                        console.log('公众号口令任务：未完成' + '\n' + '开始完成任务')
                        await gzhkl();
                    }
                    if (result.isinfo == 0) {
                        console.log('完善个人资料：未完成' + '\n' + '开始完成任务')
                        let tel = await getTel();
                        if (tel) {
                            await saveuserinfo(result.headimgurl, result.nickname, Math.random().toFixed(0), new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate(), tel);
                        } else {
                            console.log('未授权手机号，无法完善个人资料')
                        }
                    }
                } else {

                    console.log(`信息获取失败请检查`)

                }

            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 获取手机号
 * 
 */
function getTel(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/getuserinfo?safe=${zmnlxq}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)

                if (result.status == 1) {

                    console.log(result.msg)

                } else {

                    console.log(result.msg)

                }
            } catch (e) {
                console.log(e)
            } finally {
                resolve(result.tel);
            }
        }, timeout)
    })
}

/**
 * 签到
 * 
 */
function checkin(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/checkin?safe=${zmnlxq}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)

                if (result.status == 1) {

                    console.log(result.msg)

                } else {

                    console.log(result.msg)

                }
            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 小程序添加好友任务
 * 
 */
function joinxcx(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/joinxcx?safe=${zmnlxq}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                if (result.status == 1) {
                    console.log('加入排行榜成功！');
                } else {
                    console.log('加入排行榜：', result.msg)

                }

            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 小程序获取好友列表
 * 
 */
function getranklist(addFriend = false, fromsafe = '', timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/getranklist?safe=${zmnlxq}&type=1&fromsafe=${fromsafe}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data);
                if (result.status == 1) {
                    if (addFriend) {
                        console.log('添加好友成功');
                    } else {
                        frinds = result?.data?.filter(item => item?.ismy != 1)?.filter(item => item?.id != 0);
                        totalAccountsfrinds = [...totalAccountsfrinds, ...result?.data?.filter(item => item?.id != 0)];
                        notLikedfrinds = frinds?.filter(item => item?.iszan == 0);
                        console.log('获取到' + frinds?.length + '个好友，其中' + notLikedfrinds?.length + '个可点赞');
                        let isCompleteLiked = false;
                        for (let index = 0; index < notLikedfrinds.length; index++) {
                            const notLikedfrind = notLikedfrinds[index];
                            if (!isCompleteLiked) {
                                isCompleteLiked = like(notLikedfrind.id)
                            };
                            getotherhorseinfo(notLikedfrind.id);
                            await $.wait(500);
                        }
                    }
                } else {
                    console.log('获取好友失败：', result.msg)

                }

            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 小程序加为好友
 * 
 */
function getotherhorseinfo(likeUserId, timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/getotherhorseinfo?safe=${zmnlxq}&friendid=${likeUserId}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                if (result.status == 1) {
                    console.log('加为饲料互助好友成功！');
                } else {
                    console.log('加为饲料互助好友失败：', result.msg)

                }

            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 小程序点赞
 * 
 */
function like(likeUserId, timeout = 2 * 1000) {
    let isCompleted = false;
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/subrank?safe=${zmnlxq}&id=${likeUserId}&type=1`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                if (result.status == 1) {
                    console.log('点赞成功！');
                } else {
                    console.log('点赞失败：', result.msg)
                    isCompleted = result?.msg?.includes('您今天的互动已到上限');
                }

            } catch (e) {
                console.log(e)
            } finally {
                resolve(isCompleted);
            }
        }, timeout)
    })
}

/**
 * 小程序分享任务
 * 
 */
function getshare(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/share?safe=${zmnlxq}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                if (result.status == 1) {
                    console.log(result.msg)
                } else {
                    console.log(result.msg)

                }

            } catch (e) {
                console.log('数据异常：', data);
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 小程序战马分享任务
 * 
 */
function checkslgift(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/checkslgift?safe=${zmnlxq}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                if (result.status == 1) {
                    console.log(result.msg)
                } else {
                    console.log(result.msg)

                }

            } catch (e) {
                console.log('数据异常：', data);
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 小程序完善信息
 * 
 */
function saveuserinfo(avatar, nickname, sex, birthday, tel, timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/saveuserinfo?safe=${zmnlxq}&avatar=${encodeURIComponent(avatar)}&nickname=${encodeURIComponent(nickname)}&uname=${encodeURIComponent(nickname)}&sex=${sex}&birthday=${birthday}&tel=${tel}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                if (result.status == 1) {
                    console.log(result.msg)
                } else {
                    console.log(result.msg)

                }

            } catch (e) {
                console.log('数据异常：', data);
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 公众号口令只可完成一次
 * 
 */
function gzhkl(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/gzhkl?safe=${zmnlxq}&kl=${encodeURIComponent('有能量 当燃战马！')}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                if (result.status == 0) {

                    console.log(result.msg)

                } else {

                    console.log(result.msg)

                }
            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}


/**
 * 查询题库
 * 
 */
async function gettiku(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/getquesbackstatus?safe=${zmnlxq}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                if (result.status == 1) {
                    console.log(result.msg)

                    console.log('刷新题目')

                    await $.wait(2 * 1000);
                    await getques();

                    console.log('开始去答题' + '\n' + '因为是自定义答题，不排除黑号风险' + '\n' + '后期有能力修改题目获取方式');

                    await $.wait(2 * 1000);
                    await ques1();

                    await $.wait(2 * 1000);
                    await ques2();

                    await $.wait(2 * 1000);
                    await ques3();

                } else {
                    console.log(result.msg)
                }




            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 刷新题目
 * 
 */
function getques(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/getques?safe=${zmnlxq}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                console.log(result.msg)

            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}



/**
 * 答题1
 * 
 */
function ques1(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/subques?safe=${zmnlxq}&qid=126&val=C`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                if (result.status == 1) {
                    console.log(result.msg)
                } else {
                    console.log(result.msg)
                }
            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}


/**
 * 答题2
 * 
 */
function ques2(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/subques?safe=${zmnlxq}&qid=138&val=C`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                if (result.status == 1) {
                    console.log(result.msg)
                } else {
                    console.log(result.msg)

                }

            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}


/**
 * 答题3
 * 
 */
function ques3(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/subques?safe=${zmnlxq}&qid=119&val=A`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                if (result.status == 1) {
                    console.log(result.msg)
                } else {
                    console.log(result.msg)

                }

            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}


/**
 * 领养马儿
 * 
 */
function getmaer(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/starthorse?safe=${zmnlxq}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)

                console.log(result.msg)


            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 摸一摸
 * 
 */
function getmoyimo(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/strokehorse?safe=${zmnlxq}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)

                console.log(result.msg)


            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 喂马
 * 
 */
async function getweima(timeout = 2 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/horseeat?safe=${zmnlxq}`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)

                if (result.status != 0) {
                    await getweima();
                    await $.wait(2 * 1000)
                } else {
                    console.log(result.msg)
                }

            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}


/**
 * 偷饲料
 * 
 */
function tousiliao(num2) {
    let isCompleted = false;
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/subhorseplayer?safe=${zmnlxq}&friendid=${totalAccountsfrinds[num2]?.id}&type=1`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                isCompleted = result?.msg?.includes('已到上限');
                console.log(result.msg)
            } catch (e) {
                console.log(e)
            } finally {
                resolve(isCompleted);
            }
        })
    })
}

/**
 * 送饲料
 * 
 */
function songsiliao(num2) {
    let isCompleted = false;
    return new Promise((resolve) => {
        let url = {
            url: `https://warhorsechina.cojoy.com.cn/app/api/custom/subhorseplayer?safe=${zmnlxq}&friendid=${totalAccountsfrinds[num2]?.id}&type=2`,
            headers: {
                'Host': 'warhorsechina.cojoy.com.cn',
                'CUSTOMAPPID': 'wx94dca6ef07a54c55',
                'cGvnZetrWSWfLcdYaN40mLdFx6ObkRltdZmhS5hQkgDbuZd9bLcQevwBVEjx-war-horse-zm-2025': 'CjkFMAxsbtJ1VFO0xTbjwthRyAXEbyYgFNQWdUwgVY21PBcefkNbehUCWYBp',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3235 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9'
            },
            // body: '',     

        }
        $.get(url, async (error, response, data) => {
            try {
                result = JSON.parse(data)
                isCompleted = result?.msg?.includes('已到上限');
                console.log(result.msg)
            } catch (e) {
                console.log(e)
            } finally {
                resolve(isCompleted);
            }
        })
    })
}

/**
* 获取远程版本，鸟VPS不改post请求获取不了内容
*/
function getVersion(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `http://www.holyxie.com/script/zmnlxq/zmnlxq.js`,
        }
        $.post(url, async (err, resp, data) => {
            try {
                VersionLatest = data.match(/"\d.+"/)
                console.log(`最新版本号为：${VersionLatest}`);
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        }, timeout)
    })
}


//#region 固定代码 可以不管他
// ============================================变量检查============================================ \\
async function Envs() {
    if (zmnlxq) {
        if (zmnlxq.indexOf("@") != -1) {
            zmnlxq.split("@").forEach((item) => {
                zmnlxqArr.push(item);
            });
        } else if (zmnlxq.indexOf("&") != -1) {
            zmnlxq.split("&").forEach((item) => {
                zmnlxqArr.push(item);
            });
        } else {
            zmnlxqArr.push(zmnlxq);
        }
    } else {
        console.log(`\n 【${$.name}】：未填写变量 zmnlxq`)
        return;
    }

    return true;
}

// ============================================发送消息============================================ \\
async function SendMsg(message) {
    if (!message)
        return;

    if (Notify > 0) {
        if ($.isNode()) {
            var notify = require('../sendNotify');
            await notify.sendNotify($.name, message);
        } else {
            $.msg(message);
        }
    } else {
        console.log(message);
    }

}
// prettier-ignore   固定代码  不用管他
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("xxxxxx") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
