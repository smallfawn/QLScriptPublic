/*
微信小程序-口味王
 功能：所有功能
 依赖：依赖需要：@babel/parser  xpath  xmldom  jsdom node-jsencrypt	axios@v0.27.2
 依赖安装方式: 高级青龙面包可以直接添加，
             低级的在Linux里安装 例如：docker exec -it QL bash -c "npm install xmldom"
 抓包：开着抓包软件打开小程序，抓包链接里面的memberId https://member.kwwblcj.com/member/api/info/?userKeys=v1.0&pageName=member-info-index-search&formName=searchForm&kwwMember.memberId=xxxx
 变量格式：export KWW_COOKIE='xxxx&xxxx2'  多个账号用 @ 或 & 或者 换行 分割
 定时：一天一次
群文件有抓取口味王ck工具
不会用加群：212796668、681030097、743744614
脚本兼容: QuantumultX, Surge,Loon, JSBox, Node.js
=================================Quantumultx=========================
[task_local]
#微信小程序-口味王
0 40 0 * * * https://github.com/JDWXX/jd_job.git, tag=微信小程序-口味王, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
=================================Loon===================================
[Script]
cron "0 40 0 * * *" script-path=https://github.com/JDWXX/jd_job.git,tag=微信小程序-口味王
===================================Surge================================
微信小程序-口味王 = type=cron,cronexp="0 40 0 * * *",wake-system=1,timeout=3600,script-path=https://github.com/JDWXX/jd_job.git
====================================小火箭=============================
微信小程序-口味王 = type=cron,script-path=https://github.com/JDWXX/jd_job.git, cronexpr="0 40 0 * * *", timeout=3600, enable=true
 */
const $ = new Env('微信小程序-口味王');
global.window = {};
global.navigator = {appName: 'nodejs'};
const JSEncrypt = require('node-jsencrypt');
const axios = require('axios');
const parser = require("@babel/parser");
const fs = require('fs');
const path = require('path');
const xpath = require('xpath')
    , XmldomParser = require('xmldom').DOMParser;

const domParser = new XmldomParser({
    errorHandler: {}
})
const {JSDOM} = require('jsdom');
let request = require("request");
request = request.defaults({jar: true});
const {log} = console;
const Notify = 1; //0为关闭通知，1为打开通知,默认为1
const debug = 0; //0为关闭调试，1为打开调试,默认为0
//////////////////////
let scriptVersion = "高级版";
//此处填写口味王账号cookie。
let kwwUid = ""
let kwwUidArr = []
// 判断环境变量里面是否有口味王ck
if (process.env.KWW_COOKIE) {
    if (process.env.KWW_COOKIE.indexOf('&') > -1) {
        kwwUidArr = process.env.KWW_COOKIE.split('&');
    } else if (process.env.KWW_COOKIE.indexOf('@') > -1) {
        kwwUidArr = process.env.KWW_COOKIE.split('@');
    } else if (process.env.KWW_COOKIE.indexOf('\n') > -1) {
        kwwUidArr = process.env.KWW_COOKIE.split('\n');
    } else {
        kwwUidArr = [process.env.KWW_COOKIE];
    }
}
let data = '';
let msg = '';
let isSign = false;
let signCateId = '';
let signRulesName = '';
let signParamNo = '';
let signOrderNo = '';
let userKeys = 'v1.0';
let memberUnionid = '1';
let userCname = '';
let formName = 'searchForm';
let userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d36) NetType/WIFI Language/zh_CN';
let qgyUrl = 'https://89420.activity-20.m.duiba.com.cn/projectx/p85657820/index.html?appID=89420';
let mrDtUrl = 'https://89420.activity-20.m.duiba.com.cn/projectx/p244f2bb2/index.html?appID=89420&from=login&spm=89420.1.1.1';
let tjUrl = '';
let tjHtml = '';
let hdUrl = '';
let hdHtml = '';
let hdStartId = '';
let hdOrderNum = '';
let hdSubmitFlag = false;
let hdDrawFlag = false;
let yjjUrl = '';
let yjjHtml = '';
let yjjOrderId = '';
let yjjLimit = true;
let mrYdUrl = 'https://89420.activity-20.m.duiba.com.cn/projectx/p85657820/index.html?appID=89420';
let qhbUrl = 'https://89420.activity-20.m.duiba.com.cn/projectx/p725daef0/index.html?appID=89420';
let exchangeOneCodeConsumeFlag = false;
let exchangeOneCodeConsumeCredits = 880;
let qhbOrderId = '';
let qhbOrderData = '';
let gameCookie = '';
let loginUrl = '';
let qgyTaskData = [];
let qgySignFlag = false;
let isTravelling = false;
let leftEnergyBall = 0;
let qgyProcess = '';
let answerState = false;
let answerStartId = '';
let totalQuestions = 5;
let currQuestions = 1;
let questionId = '';
let answerType = 1;
let answerLists = [];
let answerListData = [];
let tokenStr = '';
let tokenKeyStr = '';
let qgyToken = '';
let isArticleReadFlag = false;
let articleReadList = [];
let taskBeforeScore = 0;
let remainingLimitTimes = 0
let remainJoinTimes = 0
let tjRecordId = ''
!(async () => {
    if (typeof $request !== "undefined") {
        await GetRewrite();
    } else {
        log(`\n\n=============================================    \n脚本执行 - 北京时间(UTC+8)：${new Date(
            new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
            8 * 60 * 60 * 1000).toLocaleString()} \n=============================================\n`);


        log(`\n============ 当前版本：${scriptVersion} ============`)
        log(`\n=================== 共找到 ${kwwUidArr.length} 个账号 ===================`)
        if (debug) {
            log(`【debug】 这是你的全部账号数组:\n ${kwwUidArr}`);
        }
        for (let index = 0; index < kwwUidArr.length; index++) {

            let num = index + 1
            addNotifyStr(`\n==== 开始【第 ${num} 个账号】====\n`, true)

            kwwUid = kwwUidArr[index];


            log(`\n==== 基本信息 ====\n`)
            taskBeforeScore = 0;
            await getBaseInfo();
            log(`\n==== 每日签到 ====\n`)
            await getSignInfo(2 * 1000);
            await $.wait(2000);
            await dbInterface(2 * 1000);

            await $.wait(2000);
            if (isSign) {
                log(`账号【${num}】已经签到了`)
            } else {
                await signIn();
                await $.wait(2000);
            }
            log(`\n==== 点击青果====\n`)
            await activeTaskFlag(2 * 1000)
            log(`\n==== 每日阅读 ====\n`)
            await readInfo();
            await $.wait(2000);
            if (isArticleReadFlag) {
                log(`账号【${num}】已经阅读了`)
            } else {
                await readSubmit();
                await $.wait(2000);
            }
            log(`\n==== 竞猜足球 ====\n`);
            await finishJc(num)
            log(`\n==== 每日答题 ====\n`);
            await finishDt(num);
            await $.wait(3000)
            log(`\n==== 疯狂摇奖机 ====\n`)
            await finishYjj(num);
            await $.wait(3000)
            log(`\n==== 海岛游乐场 ====\n`)
            await finishHd(num);
            await $.wait(3000)
            log(`\n==== 天降好礼 ====\n`)
            await finishTj(num);
            await $.wait(3000)
            log(`\n==== 青果园 ====\n`);
            await finishQgy(num);
            await $.wait(3000)
            log(`\n==== 抢兑红包 ====\n`);
            await finishQhd(num);
            await $.wait(3000)
            log(`\n==== 积分查询 ====\n`)
            await getMemberScore();
            // await $.wait(2000);
        }
    }
})()
    .catch((e) => log(e))
    .finally(() => $.done())


/**
 * 获取基础信息
 * @returns {Promise<boolean>}
 */
async function getBaseInfo() {
    await getMemberInfo(2 * 1000);
    await $.wait(2000);
    await getMemberScore();
    await $.wait(2000);
    await getQgyUrl();
    await $.wait(2000);
    await getMrYdUrl();
    await $.wait(2000);
    await getOtherUrl();
    await $.wait(2000);
    await getQhbUrl();
    await $.wait(2000);
    await xxsBanner();
    await $.wait(2000);
    await getAnswerLists();
    await $.wait(2000);
    await selectTaskList();
    await $.wait(2000);
    return true;
}


/**
 * 查询会员信息
 * @param timeout
 * @returns {Promise<unknown>}
 */
async function getMemberInfo(timeout = 2000) {
    let options = {
        url: `https://member.kwwblcj.com/member/api/info/?userKeys=${userKeys}&pageName=member-info-index-search&formName=${formName}&kwwMember.memberId=${kwwUid}&kwwMember.unionid=${memberUnionid}&memberId=${kwwUid}`,
        headers: {
            Host: 'member.kwwblcj.com',
            Connection: 'keep-alive',
            'content-type': 'application/json',
            'User-Agent': userAgent,
            Referer: 'https://servicewechat.com/wxfb0905b0787971ad/33/page-frame.html'
        },
    };
    if (debug) {
        log(`\n【debug】=============== 这是 查询会员信息 请求 url ===============`);
        log(JSON.stringify(options));
    }
    return new Promise((resolve) => {
        $.get(options, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 查询会员信息 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                if (result.hasOwnProperty('flag') && result.flag == "T") {
                    userCname = result.result.memberInfo.userCname
                    memberUnionid = result.result.memberInfo.unionid
                    log(`【${userCname}】获取会员信息成功`)
                } else {
                    log(`查询会员信息失败，原因是：${data}`)
                }
            } catch (e) {
                log(`查询会员信息异常：${data}，原因：${e}`)
            } finally {
                resolve();
            }
        }, timeout)
    })

}

/**
 * 获取会员积分
 * @returns {Promise<unknown>}
 */
async function getMemberScore() {
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: 'https://member.kwwblcj.com/member/api/list/',
            params: {
                userKeys: userKeys,
                pageName: 'select-member-score',
                formName: formName,
                memberId: kwwUid
            },
            headers: {
                Host: 'member.kwwblcj.com',
                Connection: 'keep-alive',
                'content-type': 'application/json',
                'User-Agent': userAgent,
                Referer: 'https://servicewechat.com/wxfb0905b0787971ad/33/page-frame.html'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 请求积分 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 请求积分 返回data==============`);
                    log(data)
                }
                if (data.hasOwnProperty('flag') && data.flag == "T") {
                    if (taskBeforeScore == 0) {
                        taskBeforeScore = data.rows;
                        addNotifyStr(`【${userCname}】当前积分：${data.rows}`, true)
                    } else {
                        var calScore = parseInt(data.rows) - parseInt(taskBeforeScore);
                        addNotifyStr(`【${userCname}】当前积分：${data.rows}，本次任务获取积分：${calScore}`, true)
                    }
                } else {
                    addNotifyStr(`查询积分失败，原因是：${data.msg}`, true)
                }
            } catch (e) {
                log(`查询积分失败异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(1, error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 获取青果地址
 * @returns {Promise<unknown>}
 */
async function getQgyUrl() {
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: 'https://cms.kwwblcj.com/data/c00.json',
            params: {T: timestampMs(), memberId: kwwUid},
            headers: {
                Host: 'cms.kwwblcj.com',
                Connection: 'keep-alive',
                'content-type': 'application/json',
                'User-Agent': userAgent,
                Referer: 'https://servicewechat.com/wxfb0905b0787971ad/33/page-frame.html'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 获取青果地址 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 获取青果地址 返回data==============`);
                    log(data)
                }
                for (var i in data.rows) {
                    var url = data.rows[i]["url"];
                    var manuscriptId = data.rows[i]["manuscriptId"];
                    if (url.indexOf('https') >= 0) {
                        qgyUrl = url;
                        log(`获取青果地址成功`)
                        return;
                    }
                }
            } catch (e) {
                log(`查询青果地址异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 获取每日阅读地址
 * @returns {Promise<unknown>}
 */
async function getMrYdUrl() {
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: 'https://cms.kwwblcj.com/data/c02.json',
            params: {T: timestampMs(), memberId: kwwUid},
            headers: {
                Host: 'cms.kwwblcj.com',
                Connection: 'keep-alive',
                'content-type': 'application/json',
                'User-Agent': userAgent,
                Referer: 'https://servicewechat.com/wxfb0905b0787971ad/33/page-frame.html'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 获取每日阅读 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 获取每日阅读 返回data==============`);
                    log(data)
                }
                for (var i in data.rows) {
                    var url = data.rows[i]["url"];
                    var title = data.rows[i]["title"];
                    if (url.indexOf('https') >= 0 && title.indexOf('每日阅读') >= 0) {
                        mrYdUrl = url;
                        log(`获取${title}地址成功`);
                        return
                    }
                }
            } catch (e) {
                log(`获取每日阅读异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}

/**
 * 获取其他地址
 * @returns {Promise<unknown>}
 */
async function getOtherUrl() {
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: 'https://cms.kwwblcj.com/data/c05.json',
            params: {T: timestampMs(), memberId: kwwUid},
            headers: {
                Host: 'cms.kwwblcj.com',
                Connection: 'keep-alive',
                'content-type': 'application/json',
                'User-Agent': userAgent,
                Referer: 'https://servicewechat.com/wxfb0905b0787971ad/33/page-frame.html'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 获取其他地址 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 获取其他地址 返回data==============`);
                    log(data)
                }
                for (var i in data.rows) {
                    var url = data.rows[i]["url"];
                    var title = data.rows[i]["title"];
                    var manuscriptId = data.rows[i]["manuscriptId"];
                    if (title.indexOf('每日答题') >= 0 && url.indexOf('https') >= 0) {
                        mrDtUrl = url+"&from=login&spm=89420.1.1.1";
                        log(`获取${title}地址成功`)
                    } else if (title.indexOf('天降好礼') >= 0 && url.indexOf('https') >= 0) {
                        tjUrl = url;
                        log(`获取${title}地址成功`)
                    } else if (title.indexOf('海岛游乐场') >= 0 && url.indexOf('https') >= 0) {
                        hdUrl = url;
                        log(`获取${title}地址成功`)
                    } else if (title.indexOf('疯狂摇奖机') >= 0 && url.indexOf('https') >= 0) {
                        yjjUrl = url;
                        log(`获取${title}地址成功`)
                    }
                }
            } catch (e) {
                log(`查询其他地址异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}

/**
 * 获取天天抢红包地址
 * @returns {Promise<unknown>}
 */
async function getQhbUrl() {
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: 'https://cms.kwwblcj.com/data/gdbanner.json',
            params: {T: timestampMs(), memberId: kwwUid},
            headers: {
                Host: 'cms.kwwblcj.com',
                Connection: 'keep-alive',
                'content-type': 'application/json',
                'User-Agent': userAgent,
                Referer: 'https://servicewechat.com/wxfb0905b0787971ad/33/page-frame.html'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 获取天天抢红包 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 获取天天抢红包 返回data==============`);
                    log(data)
                }
                for (var i in data.rows) {
                    var url = data.rows[i]["url"];
                    var title = data.rows[i]["title"];
                    if (title.indexOf('天天抢红包') >= 0 && url.indexOf('https') >= 0) {
                        qhbUrl = url;
                        log(`获取${title}地址成功`)
                        return;
                    }
                }
            } catch (e) {
                log(`获取天天抢红包异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}

/**
 * 获取资讯
 * @returns {Promise<unknown>}
 */
async function xxsBanner() {
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: 'https://cms.kwwblcj.com/data/xxsbanner2.json',
            params: {T: timestampMs(), memberId: kwwUid},
            headers: {
                Host: 'cms.kwwblcj.com',
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'content-type': 'application/json',
                Referer: 'https://servicewechat.com/wxfb0905b0787971ad/34/page-frame.html',
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 获取资讯信息 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 获取资讯信息 返回data==============`);
                    log(data)
                }
                articleReadList = data.rows;
                log(`获取到${articleReadList.length}条资讯`)
            } catch (e) {
                log(`获取资讯信息异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 获取
 * @returns {Promise<boolean>}
 */
async function getAnswerLists() {
    answerLists = JSON.parse('{"1":1,"2":1,"3":1,"4":1,"5":4,"6":1,"7":1,"8":1,"9":1,"10":1,"11":1,"12":1,"13":2,"14":1,"15":2,"16":1,"17":2,"18":2,"19":1,"20":1,"21":4,"22":1,"23":4,"24":1,"25":3,"26":1,"27":4,"28":1,"29":4,"30":4,"31":1,"32":4,"33":1,"34":1,"35":1,"36":1,"37":4,"38":1,"39":3,"40":4,"41":2,"42":1,"43":2,"44":4,"45":4,"46":2,"47":1,"48":1,"49":1,"50":2,"51":4,"52":4,"53":1,"54":3,"55":3,"56":4,"57":4,"58":4,"59":1,"60":4,"61":1,"62":1,"63":1,"64":2,"65":1,"66":3,"67":1,"68":1,"69":4,"70":4,"71":4,"72":1,"73":4,"74":2,"75":4,"76":4,"77":4,"78":1,"79":2,"80":1,"81":2,"82":3,"83":3,"84":4,"85":1,"86":2,"87":3,"88":2,"89":4,"90":2,"91":4,"92":3,"93":4,"94":2,"95":3,"96":2,"97":3,"98":2,"99":4,"100":4,"101":4,"102":3,"103":4,"104":4,"105":4,"106":4}');
    return true;
}

/**
 * 查询任务列表
 * @returns {Promise<unknown>}
 */
async function selectTaskList() {
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: 'https://member.kwwblcj.com/member/api/list/',
            params: {
                userKeys: userKeys,
                pageName: 'select-task-list',
                formName: formName,
                memberId: kwwUid
            },
            headers: {
                Host: 'member.kwwblcj.com',
                Connection: 'keep-alive',
                'content-type': 'application/json',
                'User-Agent': userAgent,
                Referer: 'https://servicewechat.com/wxfb0905b0787971ad/33/page-frame.html'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 查询任务列表 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 查询任务列表 返回data==============`);
                    log(data)
                }
                if (data.hasOwnProperty('flag') && data.flag == "T") {
                    for (var i in data.rows) {
                        var infoId = data.rows[i]['infoId'];
                        var ruleType = data.rows[i]['ruleType'];
                        var complete = data.rows[i]['complete'];
                        if (ruleType == "articleRead") {
                            isArticleReadFlag = (complete == 1) ? true : false;
                        }
                    }
                    log(`查询任务列表成功`)
                } else {
                    log(`查询任务列表，原因是：${data.msg}`)
                }
            } catch (e) {
                log(`查询任务列表异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(1, error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}


/**
 * 获取签到信息
 * @param timeout
 * @returns {Promise<unknown>}
 */
async function getSignInfo(timeout = 2000) {
    signCateId = '';
    isSign = false;
    let options = {
        url: `https://member.kwwblcj.com/member/api/list/?userKeys=${userKeys}&pageName=selectSignInfo&formName=searchForm&memberId=${kwwUid}`,
        headers: {
            Host: 'member.kwwblcj.com',
            Connection: 'keep-alive',
            'content-type': 'application/json',
            'User-Agent': userAgent,
            Referer: 'https://servicewechat.com/wxfb0905b0787971ad/33/page-frame.html'
        },
    };
    if (debug) {
        log(`\n【debug】=============== 这是 查询签到信息 请求 url ===============`);
        log(JSON.stringify(options));
    }
    return new Promise((resolve) => {
        $.get(options, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 查询签到信息 返回data==============`);
                    log(data)
                }
                let result = JSON.parse(data);
                if (result.hasOwnProperty('flag') && result.flag == "T") {
                    var nowDate = time("yyyy-MM-dd");
                    for (var i in result.rows.data) {
                        var actionDate = result.rows.data[i]["actionDate"];
                        var cateId = result.rows.data[i]["cateId"];
                        var flag = result.rows.data[i]["flag"];
                        if (actionDate == nowDate) {
                            signCateId = cateId;
                            signRulesName = result.rows.data[i]["rulesName"];
                            signParamNo = result.rows.data[i]["paramNo"];
                            signOrderNo = result.rows.data[i]["orderNo"];
                            if (flag == 1) {
                                isSign = true;
                            } else {
                                isSign = false;
                            }
                        }
                    }
                    log(`查询签到信息成功`)
                } else {
                    log(`查询签到信息失败，原因是：${data}`)
                }

            } catch (e) {
                log(`查询签到信息异常：${data}，原因：${e}`)
            } finally {
                resolve();
            }
        }, timeout)
    })
}
async function activeTaskFlag(timeout = 2000) {
    let options = {
        url: `https://member.kwwblcj.com/member/api/list/?userKeys=${userKeys}&pageName=activeTaskFlag&formName=editForm&memberId=${kwwUid}&userCname=%7F%7F`,
        headers: {
            Host: 'member.kwwblcj.com',
            Connection: 'keep-alive',
            'content-type': 'application/json',
            'User-Agent': userAgent,
            Referer: 'https://servicewechat.com/wxfb0905b0787971ad/33/page-frame.html'
        },
    };
    if (debug) {
        log(`\n【debug】=============== 这是 点击青果 请求 url ===============`);
        log(JSON.stringify(options));
    }
    return new Promise((resolve) => {
        $.get(options, async (error, response, data) => {

            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 点击青果  返回data==============`);
                    log(data)
                }
                let result = JSON.parse(data);
                if (result.hasOwnProperty('flag') && result.flag == "T") {
                    log(`点击青果 ${result.rows}`)
                } else {
                    log(`点击青果 失败，原因是：${data}`)
                }

            } catch (e) {
                log(`点击青果 异常：${data}，原因：${e}`)
            } finally {
                resolve();
            }
        }, timeout)
    })
}
/**
 * 查询接口
 * @param timeout
 * @returns {Promise<unknown>}
 */
async function dbInterface(timeout = 2000) {
    let options = {
        url: `https://member.kwwblcj.com/member/api/info/?userKeys=${userKeys}&pageName=dbInterface&formName=treeStatus&uid=${kwwUid}`,
        headers: {
            Host: 'member.kwwblcj.com',
            Connection: 'keep-alive',
            'content-type': 'application/json',
            'User-Agent': userAgent,
            Referer: 'https://servicewechat.com/wxfb0905b0787971ad/33/page-frame.html'
        },
    };
    if (debug) {
        log(`\n【debug】=============== 这是 查询接口 请求 url ===============`);
        log(JSON.stringify(options));
    }
    return new Promise((resolve) => {
        $.get(options, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 查询接口 返回data==============`);
                    log(data)
                }
                let result = JSON.parse(data);
                if (result.hasOwnProperty('flag') && result.flag == "T") {
                    log(`接口${result.msg}`)
                } else {
                    log(`查询接口失败，原因是：${data}`)
                }

            } catch (e) {
                log(`查询接口异常：${data}，原因：${e}`)
            } finally {
                resolve();
            }
        }, timeout)
    })
}


/**
 * 签到
 * @returns {Promise<unknown>}
 */
async function signIn() {
    return new Promise((resolve) => {
        var options = {
            method: 'POST',
            url: 'https://member.kwwblcj.com/member/api/submit/',
            params: {userKeys: userKeys},
            headers: {
                Host: 'member.kwwblcj.com',
                Connection: 'keep-alive',
                'content-type': 'application/json',
                'User-Agent': userAgent,
                Referer: 'https://servicewechat.com/wxfb0905b0787971ad/33/page-frame.html'
            },
            data: {
                pageName: 'AddSignSvmInfo',
                formName: 'addForm',
                orderNo: signOrderNo,
                paramNo: signParamNo,
                cateId: signCateId,
                memberId: kwwUid,
                memberName: userCname
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 签到请求 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            var data = response.data;
            if (debug) {
                log(`\n\n【debug】===============这是 签到请求 返回data==============`);
                log(data)
            }
            if (data.hasOwnProperty('flag') && data.flag == "T") {
                addNotifyStr(`${data.msg}，${signRulesName},积分+${signParamNo}`, true)
            } else {
                addNotifyStr(`签到失败，原因是：${data.msg}`, true)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}

/**
 * 阅读信息
 * @returns {Promise<unknown>}
 */
async function readInfo() {
    return new Promise((resolve) => {

        var options = {
            method: 'GET',
            url: 'https://qrcode.kwwblcj.com/qrc/api/info/' + memberUnionid + '/',
            params: {T: timestampMs(), memberId: kwwUid},
            headers: {
                Host: 'qrcode.kwwblcj.com',
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'content-type': 'application/json',
                Referer: 'https://servicewechat.com/wxfb0905b0787971ad/34/page-frame.html',
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 阅读信息 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 阅读信息 返回data==============`);
                    log(data)
                }
                if (data.hasOwnProperty('flag') && data.flag == "T") {
                    log(`查询阅读信息成功`)
                } else {
                    log(`查询阅读信息失败，原因是：${data.msg}`)
                }
            } catch (e) {
                log(`查询阅读信息异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 提交阅读
 * @returns {Promise<unknown>}
 */
async function readSubmit() {
    var max = articleReadList.length - 1;
    var articleTitle = articleReadList[randomInt(0, max)]['title'];
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: 'https://member.kwwblcj.com/member/api/list/',
            params: {
                userKeys: userKeys,
                pageName: 'setNewsReadTaskFlag',
                formName: 'addForm',
                memberId: kwwUid,
                userCname: userCname,
                articleTitle: articleTitle
            },
            headers: {
                Host: 'member.kwwblcj.com',
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'content-type': 'application/json',
                Referer: 'https://servicewechat.com/wxfb0905b0787971ad/34/page-frame.html',
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 阅读提交 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 阅读提交 返回data==============`);
                    log(data)
                }
                if (data.hasOwnProperty('flag') && data.flag == "T") {
                    log(`${data.rows}阅读信息成功`)
                    addNotifyStr(`每日阅读任务完成`)
                } else {
                    log(`阅读信息失败，原因是：${data.msg}`)
                }
            } catch (e) {
                log(`阅读信息异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 登入
 * @param redirect
 * @returns {Promise<unknown>}
 */
async function loginFreePlugin(redirect) {
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: 'https://member.kwwblcj.com/member/api/info/',
            params: {
                userKeys: userKeys,
                pageName: 'loginFreePlugin',
                formName: 'searchForm',
                uid: kwwUid,
                levelCode: '1',
                redirect: redirect
            },
            headers: {
                Host: 'member.kwwblcj.com',
                Connection: 'keep-alive',
                'content-type': 'application/json',
                'User-Agent': userAgent,
                Referer: 'https://servicewechat.com/wxfb0905b0787971ad/33/page-frame.html'
            }
        };

        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (data.hasOwnProperty('flag') && data.flag == 'T') {
                    loginUrl = data.result;
                    log(`登录成功，${data.msg}`)
                } else {
                    log(`登录失败【${data.msg}】`)
                }
            } catch (e) {
                log(`登入异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 设置cookie
 * @returns {Promise<unknown>}
 */
async function setCookies() {
    return new Promise((resolve) => {
        var host = (loginUrl.split('//')[1]).split('/')[0];
        try {
            request(
                {
                    url: loginUrl,
                    method: "GET",
                    headers: {
                        'Host': host,
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                        'User-Agent': userAgent,
                        "Accept": 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        "Sec-Fetch-Site": "none",
                        "Sec-Fetch-Mode": "navigate",
                        "Sec-Fetch-User": "?1",
                        "Sec-Fetch-Dest": "document",
                        "Accept-Encoding": "gzip, deflate, br",
                        "Accept-Language": "en-us,en",
                    },
                }, function (err, res, body) {
                    gameCookie = res.request.headers.cookie;
                    log(`转换Cookie成功！`)
                })
        } catch (e) {
            log(e)
        } finally {
            resolve();
        }
    })
}


/**
 * 完成疯狂摇奖机
 * @param num
 * @returns {Promise<boolean>}
 */
async function finishYjj(num) {
    await loginFreePlugin(yjjUrl);
    await $.wait(3000)
    if (loginUrl == "") {
        log(`账号【${num}】登录异常，自动跳过疯狂摇奖机任务！`);
        return false;
    }
    await setCookies();
    await $.wait(3000);
    if (gameCookie == "") {
        log(`账号【${num}】cookies异常，自动跳过疯狂摇奖机任务！`);
        return false;
    }
    var urlMatch = yjjUrl.match('([^/]+)/?$');
    var baseUrl = yjjUrl.replace(urlMatch[0], '');
    var activityId = getQueryString(yjjUrl, "id");
    await getAjaxElement(baseUrl, activityId);
    await $.wait(2000);
    if (!yjjLimit) {
        await getYjjHtml();
        await $.wait(2000);
        try {
            var result = ParseYjjHtml(yjjHtml);
            await getYjjToken(baseUrl, activityId, result.cid);
            await $.wait(2000);
            var token = yjgettoken(yjjHtml, tokenStr);
            await $.wait(2000);
            await doYjjJoin(baseUrl, activityId, result.cid, token);
            await $.wait(3000);
            if (yjjOrderId != '') {
                await getYjjOrderStatus(baseUrl);
            }
        } catch (e) {
            log(`账号【${num}】解码异常，自动跳过疯狂摇奖机任务！${e}`);
            return false;
        }
    } else {
        log(`账号【${num}】疯狂摇奖机免费次数为0！自动跳过`);
        return false;
    }
    return true;
}


/**
 * 次数
 * @param baseUrl
 * @param activityId
 * @returns {Promise<unknown>}
 */
async function getAjaxElement(baseUrl, activityId) {
    return new Promise((resolve) => {
        var url = baseUrl + 'ajaxElement';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {_: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                'User-Agent': userAgent,
                Connection: 'keep-alive',
                Referer: yjjUrl + '&from=login&spm=89420.1.1.1',
            },
            data: {
                hdType: 'dev',
                hdToolId: '',
                preview: 'false',
                actId: activityId,
                adslotId: ''
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 获取疯狂摇奖机次数 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 获取疯狂摇奖机次数 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('success') && data.success) {
                    yjjLimit = data.element.freeEmpty;
                    log(`获取摇奖机免费次数成功`)
                } else {
                    log(`获取摇奖机免费次数失败【${JSON.stringify(data)}】`)
                }
            } catch (e) {
                log(`获取摇奖机免费次数异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 获取摇奖机页面
 * @returns {Promise<unknown>}
 */
async function getYjjHtml() {
    return new Promise((resolve) => {
        let url = yjjUrl + '&from=login&spm=89420.1.1.1';
        let host = (yjjUrl.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            headers: {
                cookie: gameCookie,
                Host: host,
                Accept: '*/*',
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 疯狂摇奖机 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            if (debug) {
                log(`\n【debug】=============== 这是 疯狂摇奖机 返回 data ===============`);
                log(response);
            }
            yjjHtml = response.data;
        }).catch(function (error) {
            console.error(error);
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}

/**
 * 获取token
 * @param activityId
 * @param consumerId
 * @returns {Promise<unknown>}
 */
async function getYjjToken(baseUrl, activityId, consumerId) {
    return new Promise((resolve) => {
        var url = baseUrl + 'ctoken/getTokenNew';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            headers: {
                cookie: gameCookie,
                Host: host,
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                'User-Agent': userAgent,
                Connection: 'keep-alive',
                Referer: yjjUrl + '&from=login&spm=89420.1.1.1',
            },
            data: {
                timestamp: timestampMs(),
                activityId: activityId,
                activityType: 'hdtool',
                consumerId: consumerId
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 获取疯狂摇奖机token 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                tokenStr = response.data.token;
                if (debug) {
                    log(`\n\n【debug】===============这是 获取疯狂摇奖机token 返回data==============`);
                    log(JSON.stringify(data))
                }
                log(`获取token成功`)
            } catch (e) {
                log(`获取token失败：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 摇奖
 * @param baseUrl
 * @param activityId
 * @param consumerId
 * @param token
 * @returns {Promise<unknown>}
 */
async function doYjjJoin(baseUrl, activityId, consumerId, token) {
    return new Promise((resolve) => {
        var url = baseUrl + 'doJoin';
        var host = (url.split('//')[1]).split('/')[0];

        var options = {
            method: 'POST',
            url: url,
            params: {dpm: '89420.3.1.0', activityId: activityId, _: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                'User-Agent': userAgent,
                Connection: 'keep-alive',
                Referer: yjjUrl + '&from=login&spm=89420.1.1.1',
            },
            data: {
                actId: activityId,
                oaId: activityId,
                activityType: 'hdtool',
                consumerId: consumerId,
                token: token
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 摇奖 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 摇奖 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('success') && data.success) {
                    yjjOrderId = data.orderId;
                    var needCredits = data.needCredits;
                    log(`摇奖成功，订单：${yjjOrderId}，需要积分：${needCredits}`)
                } else {
                    log(`摇奖失败【${JSON.stringify(data)}】`)
                }
            } catch (e) {
                log(`摇奖异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 获取顶顶那状态
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function getYjjOrderStatus(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'getOrderStatus';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {_: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                'User-Agent': userAgent,
                Connection: 'keep-alive',
                Referer: yjjUrl + '&from=login&spm=89420.1.1.1',
            },
            data: {orderId: yjjOrderId, adslotId: ''}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 摇奖状态 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 摇奖状态 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('success') && data.success) {
                    var type = data.lottery.type;
                    log(`摇奖成功，${type}，当前积分：${data.element.myCredits}，剩余次数：${data.element.freeLimit}`)
                } else {
                    log(`摇奖失败【${JSON.stringify(data)}】`)
                }
            } catch (e) {
                log(`摇奖异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })


}

/**
 * 完成海岛游乐场
 * @param num
 * @returns {Promise<boolean>}
 */
async function finishHd(num) {
    await loginFreePlugin(hdUrl);
    await $.wait(3000)
    if (loginUrl == "") {
        log(`账号【${num}】登录异常，自动跳过海岛游乐场任务！`);
        return false;
    }
    await setCookies();
    await $.wait(3000);
    if (gameCookie == "") {
        log(`账号【${num}】cookies异常，自动跳过海岛游乐场任务！`);
        return false;
    }
    var urlMatch = hdUrl.match('([^/]+)/?$');
    var baseUrl = hdUrl.replace(urlMatch[0], '');
    var opId = getQueryString(hdUrl, "opId");
    await getHdInfo(baseUrl, opId);
    if (remainingLimitTimes == 0) {
        log(`账号【${num}】海岛游乐场次数为0，不执行！`);
        return false
    } else {
        await getHdHtml();
        await $.wait(2000);
        try {
            var result = ParseHtmlGame(hdHtml);
            var hdKey = result.key;
            for (var i = 1; i <= remainingLimitTimes; i++) {
                log(`开始第${i}次海岛游戏！`);
                hdSubmitFlag = false;
                hdDrawFlag = false;

                await startHdGame(baseUrl, opId);


                if (hdStartId != '') {
                    await getHdOrderStatus(baseUrl, opId);
                    await $.wait(2000);
                    await startHdRound(baseUrl, opId,hdStartId,"1");
                    await $.wait(30000);

                    await hdtj('1','5',hdStartId,'5',hdKey)
                    await $.wait(2000);
                    if (hdSubmitFlag) {
                        await hdDraw(baseUrl, opId,hdStartId,"1");
                    }

                    if (hdDrawFlag && hdSubmitFlag) {
                        await startHdRound(baseUrl, opId,hdStartId,"2");
                        await $.wait(30000);

                        await hdtj('2','10',hdStartId,'15',hdKey)
                        if (hdSubmitFlag) {
                            await hdDraw(baseUrl, opId,hdStartId,"2");
                        }
                    }
                    await $.wait(1000);
                    if (hdDrawFlag && hdSubmitFlag) {
                        await startHdRound(baseUrl, opId,hdStartId,"3");
                        await $.wait(30000);

                        await hdtj('3','15',hdStartId,'30',hdKey)
                        await $.wait(2000);
                        if (hdSubmitFlag) {
                            await hdDraw(baseUrl, opId,hdStartId,"3");
                        }

                    }

                }

            }
        } catch (e) {
            log(`账号【${num}】解码异常，自动跳过海岛游乐场任务！${e}`);
            return false;
        }
    }
    return true;
}

/**
 * 获取海岛页面
 * @returns {Promise<unknown>}
 */
async function getHdHtml() {
    return new Promise((resolve) => {
        let url = hdUrl + '&from=login&spm=89420.1.1.1';
        let host = (hdUrl.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            headers: {
                cookie: gameCookie,
                Host: host,
                Accept: '*/*',
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        };

        axios.request(options).then(function (response) {
            hdHtml = response.data;
        }).catch(function (error) {
            console.error(error);
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}

/**
 * 海岛游戏信息
 * @param baseUrl
 * @param opId
 * @returns {Promise<unknown>}
 */
async function getHdInfo(baseUrl, opId) {
    return new Promise((resolve) => {
        let url = baseUrl + 'getInfo';
        let host = (baseUrl.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {__ts__: timestampMs(), opId: opId},
            headers: {
                cookie: gameCookie,
                Host: host,
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: '*/*',
                Referer: 'https://89420.activity-20.m.duiba.com.cn/aaw/underseaGame/index?opId=202214587511596&dbnewopen&from=login&spm=89420.1.1.1',
                'Accept-Language': 'en-us,en'
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 海岛游戏信息 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 海岛游戏信息 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('success') && data.success) {
                    remainingLimitTimes = data.data.remainingLimitTimes;
                    // remainingLimitTimes = data.data.remainingFreeTimes;
                    log(`获取海岛游戏信息成功`)
                } else {
                    log(`获取海岛游戏信息失败【${data}】`)
                }
            } catch (e) {
                log(`海岛游戏信息异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 开始海岛游戏
 * @param baseUrl
 * @param opId
 * @returns {Promise<unknown>}
 */
async function startHdGame(baseUrl, opId) {
    return new Promise((resolve) => {
        let url = baseUrl + 'start';
        let host = (baseUrl.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {__ts__: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: '*/*',
                Referer: hdUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'en-us,en'
            },
            data: {opId: opId}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 开始海岛游戏 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 开始海岛游戏 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('success') && data.success) {
                    hdStartId = data.data.startId;
                    hdOrderNum = data.data.orderNum;
                    log(`开始海岛游戏成功，订单：${hdOrderNum}`)
                } else {
                    log(`开始海岛游戏失败【${JSON.stringify(data)}】`)
                }
            } catch (e) {
                log(`开始海岛游戏异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 获取海岛订单
 * @param baseUrl
 * @param opId
 * @returns {Promise<unknown>}
 */
async function getHdOrderStatus(baseUrl, opId) {
    return new Promise((resolve) => {
        let url = baseUrl + 'getOrderStatus';
        let host = (baseUrl.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {
                __ts__: timestampMs(),
                opId: opId,
                startId: hdStartId,
                orderNum: hdOrderNum,
                type: '1'
            },
            headers: {
                cookie: gameCookie,
                Host: host,
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: '*/*',
                Referer: hdUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'en-us,en'
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 获取海岛订单状态 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 获取海岛订单状态 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('success') && data.success) {
                    log(`获取海岛订单状态成功，${data.data}`)
                } else {
                    log(`获取海岛订单状态失败【${JSON.stringify(data)}】`)
                }
            } catch (e) {
                log(`获取海岛订单状态异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 开始
 * @param baseUrl
 * @param opId
 * @param hdRoundIndex
 * @returns {Promise<unknown>}
 */
async function startHdRound(baseUrl, opId,hdStartId,hdRoundIndex) {
    return new Promise((resolve) => {
        let url = baseUrl + 'startRound';
        let host = (baseUrl.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {__ts__: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: '*/*',
                Referer: hdUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'en-us,en'
            },
            data: {opId: opId, startId: hdStartId, roundIndex: hdRoundIndex}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 开始海岛关口 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 开始海岛关口 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('success') && data.success) {
                    log(`开始第${hdRoundIndex}关成功`)
                } else {
                    log(`开始海岛关口失败【${JSON.stringify(data)}】`)
                }
            } catch (e) {
                log(`开始海岛关口异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 海岛提交
 * @param baseUrl
 * @param opId
 * @param hdKey
 * @param hdScore
 * @param hdTotalScore
 * @param hdRoundIndex
 * @returns {Promise<unknown>}
 */
async function hdtj(hdRoundIndex,hdScore,hdStartId,hdTotalScore,hdKey) {
    hdDrawFlag = false;
    return new Promise((resolve) => {
        let url ='https://89420.activity-20.m.duiba.com.cn/aaw/underseaGame/submit';

        let sign = md5('opId=202214587511596&roundIndex=' + hdRoundIndex + '&score=' + hdScore + '&startId=' + hdStartId + '&totalScore=' + hdTotalScore + '&key=' + hdKey)

        var options = {
            method: 'POST',
            url: url,
            data:'opId=202214587511596&startId='+ hdStartId +'&score='+hdScore+'&totalScore='+hdTotalScore+'&roundIndex='+hdRoundIndex+'&sign='+sign,
            headers: {
                cookie: gameCookie,
                'Cache-Control': 'no-cache',
                'Connection': 'Keep-Alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Accept-Language': 'en-us,en',
                'Host': '89420.activity-20.m.duiba.com.cn',
                'Referer': 'https://89420.activity-20.m.duiba.com.cn/aaw/superSurprise/index?id=85&dbnewopen&from=login&spm=89420.1.1.1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 MicroMessenger/7.0.4.501 NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF',
                'Accept-Encoding': 'gzip, deflate',
            },

        };
        if (debug) {
            log(`\n【debug】=============== 这是 海岛提交 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 海岛提交 返回data==============`);
                    log(JSON.stringify(data))}
                if (data.hasOwnProperty('success') && data.success) {
                    log(`海岛提交成功，${data.data.rewardToolType}`)
                    hdSubmitFlag = true;
                } else {
                    log(`海岛提交失败【${JSON.stringify(data)}】`)
                }
            } catch (e) {
                log(`海岛提交异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
async function hdSubmit(baseUrl, opId, hdKey,hdScore,hdTotalScore,hdRoundIndex) {
    hdSubmitFlag = false;
    return new Promise((resolve) => {
        let url = 'https://89420.activity-20.m.duiba.com.cn/aaw/underseaGame/submit';
        let host = (baseUrl.split('//')[1]).split('/')[0];
        //opId=202214587511596&roundIndex={rdinx}&score={score}&startId={hdstartid}&totalScore={totalScore}&key={key}
        var sign = "opId=" + opId + "&roundIndex=" + hdRoundIndex + "&score=" + hdScore + "&startId=" + hdStartId + "&totalScore=" + hdTotalScore + "&key=&" + hdKey;
        sign = md5(hdKey);
        var body = {
            opId: opId,
            startId: hdStartId,
            score: hdScore,
            totalScore: hdTotalScore,
            roundIndex: hdRoundIndex,
        };
        var n = Object.keys(body);
        n.sort();
        for (var o = [], a = 0, r = n; a < r.length; a++) {
            var i = r[a];
            o.push(i + "=" + body[i])
        }
        o.push("key=" + hdKey);
        hdKey = o.join("&");
        log(sign)
        sign = md5(hdKey);
        log(sign)
        var params = `opId=${opId}&startId=${hdStartId}&score=${hdScore}&totalScore=${hdTotalScore}&roundIndex=${hdRoundIndex}&sign=${sign}`;
        log(params)
        if (debug) {
            log(`\n【debug】=============== 这是 海岛提交签名 ===============`);
            log(sign);
        }
        var options = {
            method: 'POST',
            url: url,
            //params: {__ts__: timestampMs()},
            data:`opId=${opId}&startId=${hdStartId}&score=${hdScore}&totalScore=${hdTotalScore}&roundIndex=${hdRoundIndex}&sign=${sign}`,
            headers: {
                cookie: gameCookie,
                Host: host,
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: '*/*',
                'Content-Length': '108',
                Referer: hdUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'en-us,en'
            },

        };
        // if (debug) {
        log(`\n【debug】=============== 这是 海岛提交 请求 url ===============`);
        log(JSON.stringify(options));
        // }

        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                //if (debug) {
                log(`\n\n【debug】===============这是 海岛提交 返回data==============`);
                log(JSON.stringify(data))
                //}
                if (data.hasOwnProperty('success') && data.success) {
                    log(`海岛提交成功，${data.data.rewardToolType}`)
                    hdSubmitFlag = true;
                } else {
                    log(`海岛提交失败【${JSON.stringify(data)}】`)
                }
            } catch (e) {
                log(`海岛提交异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 海岛抽奖
 * @param baseUrl
 * @param opId
 * @param hdRoundIndex
 * @returns {Promise<unknown>}
 */
async function hdDraw(baseUrl, opId,hdStartId,hdRoundIndex) {
    hdDrawFlag = false;
    return new Promise((resolve) => {
        let url = baseUrl + 'draw';
        let host = (baseUrl.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {__ts__: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                'Content-Length': '49',
                Referer: hdUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
            },
            data: {opId: opId, startId: hdStartId, roundIndex: hdRoundIndex}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 海岛抽奖 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 海岛抽奖 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('success') && data.success) {
                    log(`海岛抽奖成功，获得${data.data.name}`)
                    hdDrawFlag = true
                } else {
                    log(`海岛抽奖失败【${JSON.stringify(data)}】`)
                }
            } catch (e) {
                log(`海岛抽奖异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 完成天降好礼
 * @param num
 * @returns {Promise<boolean>}
 */
async function finishTj(num) {
    await loginFreePlugin(tjUrl);
    await $.wait(3000)
    if (loginUrl == "") {
        log(`账号【${num}】登录异常，自动跳过天降好礼任务！`);
        return false;
    }
    await setCookies();
    await $.wait(3000);
    if (gameCookie == "") {
        log(`账号【${num}】cookies异常，自动跳过天降好礼任务！`);
        return false;
    }
    var urlMatch = tjUrl.match('([^/]+)/?$');
    var baseUrl = tjUrl.replace(urlMatch[0], '');
    var activityId = getQueryString(tjUrl, "id");
    await getTjInfo(baseUrl, activityId);
    if (remainJoinTimes == 0) {
        log(`账号【${num}】天降好礼免费次数为0，不执行！`);
        return false;
    } else {
        await getTjHtml(activityId);
        await $.wait(2000);
        for (var i = 1; i <= remainJoinTimes; i++) {
            log(`开始第${i}次天降好礼游戏！`);
            await doTjJoin(baseUrl, activityId);
            if (tjRecordId == '') {
                log(`第${i}次天降好礼游戏失败！`);
            } else {
                await $.wait(40000);
                await tjSubmit(baseUrl, activityId);
                await $.wait(3000);
                await tjOrderStatus(baseUrl);
            }
        }

    }
    return true;
}

/**
 * 获取天降好礼html
 * @param activityId
 * @returns {Promise<unknown>}
 */
async function getTjHtml(activityId) {
    return new Promise((resolve) => {
        let url = tjUrl + '&from=login&spm=89420.1.1.1';
        let host = (tjUrl.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {_: timestampMs(), id: activityId},
            headers: {
                cookie: gameCookie,
                Host: host,
                Accept: '*/*',
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        };

        axios.request(options).then(function (response) {
            tjHtml = response.data;
        }).catch(function (error) {
            console.error(error);
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}

/**
 * 获取天降好礼信息
 * @param baseUrl
 * @param activityId
 * @returns {Promise<unknown>}
 */
async function getTjInfo(baseUrl, activityId) {
    return new Promise((resolve) => {
        let url = baseUrl + 'getActivityInfo';
        let host = (baseUrl.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {_: timestampMs(), id: activityId},
            headers: {
                cookie: gameCookie,
                Host: host,
                Accept: '*/*',
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                Referer: tjUrl + '&from=login&spm=89420.1.1.1',
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 查询天降好礼信息 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 查询天降好礼信息 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('data') && data.data.hasOwnProperty('remainJoinTimes')) {
                    remainJoinTimes = data.data.remainFreeJoinTimes;//免费次数
                    // remainJoinTimes = data.data.remainJoinTimes;
                    log(`查询天降好礼信息成功`)
                } else {
                    log(`查询天降好礼信息失败：${JSON.stringify(data)}`)
                }

            } catch (e) {
                log(`查询天降好礼信息异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 开始天降好礼
 * @param baseUrl
 * @param activityId
 * @returns {Promise<unknown>}
 */
async function doTjJoin(baseUrl, activityId) {
    tjRecordId = '';
    return new Promise((resolve) => {
        let url = baseUrl + 'doJoin';
        let host = (baseUrl.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {_: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                Accept: 'application/json',
                'User-Agent': userAgent,
                Referer: tjUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'en-us,en'
            },
            data: "id=" + activityId
        };
        if (debug) {
            log(`\n【debug】=============== 这是 开始天降好礼游戏 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 开始天降好礼游戏 返回data==============`);
                    log(data)
                }
                if (data.hasOwnProperty('data') && data.data.hasOwnProperty('recordId')) {
                    tjRecordId = data.data.recordId;
                    log(`开始天降好礼游戏成功${data.desc}`)
                } else {
                    log(`开始天降好礼游戏失败：${JSON.stringify(data)}`)
                }

            } catch (e) {
                log(`开始天降好礼游戏异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 天降提交
 * @param baseUrl
 * @param activityId
 * @returns {Promise<unknown>}
 */
async function tjSubmit(baseUrl, activityId) {
    const jsencrypt = new JSEncrypt();
    return new Promise((resolve) => {
        let url = baseUrl + 'submit';
        let host = (baseUrl.split('//')[1]).split('/')[0];
        var timestamp = timestampMs();
        var score = randomInt(20, 25) + "";
        var sign = md5("".concat(score).concat(timestamp).concat(timestamp.toString(16)));
        var key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1JdBGmK6g6yj3w5YDNCvDL2SjnJMSUExcfYY9fOd2ZOTyzh6suMfR5vBAyBGsolKUmUqh6blqOeNApSKJhkEWMhxG3eERZZYwmtUCRkH1WDQkA/dSuBOnFHQ4sjoMdTuv80j5TNVMtV7qDVEp0XF+muYLuA3tXGgrYVQu8iLAH0kqr9T2u/a6We8qhgvE6ddKxMLyEz3sRnWShioTl/FmjaqCiU3NHNPL8DztEnpsGreq66vp4wPG8Q6UfGHdDiDx+/xJrYDkfnoX0u/OpSxqL8sCHvrmj8fHlptnwy2sgwhREyChWH1JZLV2RWJhOJ63PfnlH7BvqLke2qWLM9YAwIDAQAB";
        jsencrypt.setPublicKey(key);
        var result_encrypt = jsencrypt.encrypt(score);
        var options = {
            method: 'POST',
            url: url,
            params: {_: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/json',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                Accept: 'application/json',
                'User-Agent': userAgent,
                Referer: tjUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
            },
            data: {
                activityId: activityId,
                recordId: tjRecordId,
                score: result_encrypt,
                timestamp: timestamp,
                sign: sign
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 提交天降好礼游戏 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 提交天降好礼游戏 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('data') && data.data.hasOwnProperty('recordId')) {
                    log(`提交天降好礼游戏${data.desc}，当前积分：${data.data.currentScore}`)
                } else {
                    log(`提交天降好礼游戏失败：${JSON.stringify(data)}`)
                }

            } catch (e) {
                log(`提交天降好礼游戏异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 天降好礼奖励
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function tjOrderStatus(baseUrl) {
    return new Promise((resolve) => {
        let url = baseUrl + 'joinRecordStatus';
        let host = (baseUrl.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {_: timestampMs(), id: tjRecordId},
            headers: {
                cookie: gameCookie,
                Host: host,
                Accept: '*/*',
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                Referer: tjUrl + '&from=login&spm=89420.1.1.1',
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 查询天降好礼奖励 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 查询天降好礼奖励 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('data') && data.data.hasOwnProperty('exchangeStatus')) {
                    if (data.data.exchangeStatus == 3) {
                        log(`本次游戏奖励${data.data.prizeInfo.prizeName}`)
                    }
                } else {
                    log(`查询天降好礼奖励失败：${JSON.stringify(data)}`)
                }

            } catch (e) {
                log(`查询天降好礼奖励异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 完成青果园
 * @param num
 * @returns {Promise<boolean>}
 */
async function finishQgy(num) {
    await loginFreePlugin(qgyUrl);
    await $.wait(3000)
    if (loginUrl == "") {
        log(`账号【${num}】登录青果园异常，自动跳过任务！`);
        return false;
    }
    await setCookies();
    await $.wait(3000);
    if (gameCookie == "") {
        log(`账号【${num}】cookies异常，自动跳过任务！`);
        return false;
    }
    var urlMatch = qgyUrl.match('([^/]+)/?$');
    var baseUrl = qgyUrl.replace(urlMatch[0], '');
    await getTokenKeyStr(baseUrl);
    await $.wait(2000);
    await getQgyInfo(baseUrl);
    await getTokenStr(baseUrl);
    await $.wait(2000);
    await qgyCheckQuery(baseUrl);
    await $.wait(2000);
    if (qgySignFlag) {
        log(`账号【${num}】青果园已经签到了！`);
    } else {
        try {
            await getTokenStr(baseUrl);
            await $.wait(2000);
            qgyToken = dealToken(tokenStr, tokenKeyStr);
            await $.wait(2000);
            await qgyCreateItem(baseUrl, qgyToken)
            await delay();
            await getTokenStr(baseUrl);
            await $.wait(2000);
            qgyToken = dealToken(tokenStr, tokenKeyStr);
            await qgySign(baseUrl, qgyToken);
            await getTokenStr(baseUrl);
            await $.wait(2000);
            qgyToken = dealToken(tokenStr, tokenKeyStr);
            if(currentStatusHaveMillis == currentStatusNeedMillis){
                await collectCoconut(baseUrl, qgyToken)
            }
        } catch (e) {
            log(`账号【${num}】青果园签到异常！${e}`);
        }

    }
    await queryQgyTask(baseUrl);
    if (qgyTaskData.length == 0) {
        log(`账号【${num}】获取青果园任务异常！`);
    } else {
        for (var i in qgyTaskData) {
            var id = qgyTaskData[i]["id"];
            var taskCode = qgyTaskData[i]["code"];
            var title = qgyTaskData[i]["title"];
            var taskStatus = parseInt(qgyTaskData[i]["taskStatus"]);
            if (taskStatus == 2) {
                log(`任务【${title}】已经完成了！`);
            } else {
                switch (id) {
                    case 'y1z0wktv':
                        //出门旅行
                        if (!isTravelling) {
                            try {
                                log(`准备去完成【${title}】`);
                                await getTokenStr(baseUrl);
                                await $.wait(2000);
                                qgyToken = dealToken(tokenStr, tokenKeyStr);
                                await $.wait(2000);
                                await startTravel(baseUrl, qgyToken);
                                await $.wait(2000);
                            } catch (e) {
                                log(`账号【${num}】青果园旅行异常！${e}`);
                            }
                        } else {
                            log(`正在旅行中....`);
                        }
                        break;
                    case '9pc7awxr':
                    case 'fn473yer':
                    case '494cc96q':
                    case 'qyksf6pq':
                    case 'ozzl0eqx':
                    case 'dnv1dbct':
                    case 'yaavhjoi':
                        //完成任务
                        log(`准备去完成【${title}】`);
                        try {
                            await getTokenStr(baseUrl);
                            await $.wait(2000);
                            qgyToken = dealToken(tokenStr, tokenKeyStr);
                            await $.wait(2000);
                            await finishBrowseInfoTask(baseUrl, qgyToken, taskCode, title);
                            await $.wait(2000);
                            await newRewardInfo(baseUrl);
                        } catch (e) {
                            log(`账号【${num}】青果园${title}异常！${e}`);
                        }
                        break;
                    default:
                        log(`【${title}】不支持自动完成！`)
                        break;
                }
            }

        }
    }
    if (qgyProcess !== 'NaN%') {
        log('====能量加速====')
        if (leftEnergyBall > 0) {
            for (var i = 1; i <= leftEnergyBall; i++) {
                log(`开始第${i}次能量加速！`);
                try {
                    await getTokenStr(baseUrl);
                    await $.wait(2000);
                    qgyToken = dealToken(tokenStr, tokenKeyStr);
                    await useEnergyBall(baseUrl, qgyToken)
                } catch (e) {
                    log(`账号【${num}】青果园能量加速异常！${e}`);
                }
            }

        } else {
            log('能量不足,跳过加速')
        }

    } else {
        log('先去种植把！')
    }
    return true;
}

/**
 * 能力加速
 * @param baseUrl
 * @param token
 * @returns {Promise<unknown>}
 */
async function useEnergyBall(baseUrl, token) {
    return new Promise((resolve) => {
        var url = baseUrl + 'game/useEnergyBall.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qgyUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
            },
            data: {
                token: token,
                user_type: '1',
                is_from_share: '1',
                _t: timestampMs()
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 能量加速 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 能量加速 返回data==============`);
                    log(JSON.stringify(data))
                }
                log(`能量加速：${data.success}`)
            } catch (e) {
                log(`能量加速失败，原因：${data.message}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
async function collectCoconut(baseUrl, token) {
    return new Promise((resolve) => {
        var url = baseUrl + 'game/collectCoconut.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qgyUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
            },
            data: {
                token: token,
                user_type: '1',
                is_from_share: '1',
                _t: timestampMs()
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 果园收取 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 果园收取 返回data==============`);
                    log(JSON.stringify(data))
                }
                log(`果园收取：${data.data.quantity}`)
            } catch (e) {
                log(`果园收取失败，原因：${data.message}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
/**
 * 获取信息
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function getQgyInfo(baseUrl) {
    return new Promise(async(resolve) => {
        var url = baseUrl + 'game/index.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {user_type: '1', is_from_share: '1', _t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qgyUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 查询青果园信息 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 查询青果园信息 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('data') && data.data.hasOwnProperty('treeInfo')) {
                    currentStatusHaveMillis = data.data.treeInfo.currentStatusHaveMillis;
                    currentStatusNeedMillis = data.data.treeInfo.currentStatusNeedMillis;
                    isTravelling = data.data.isTravelling;
                    leftEnergyBall = data.data.leftEnergyBall
                    qgyProcess = ((currentStatusHaveMillis / currentStatusNeedMillis) * 100).toFixed(2) + "%"

                    log(`查询青果园信息成功，当前进度：${qgyProcess}，能量：${leftEnergyBall}`)
                } else {
                    log(`查询青果园信息失败：${JSON.stringify(data)}`)
                }

            } catch (e) {
                log(`查询青果园信息异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 青果园签到检查
 * @returns {Promise<unknown>}
 */
async function qgyCheckQuery(baseUrl) {
    qgySignFlag = false;
    return new Promise((resolve) => {
        var url = baseUrl + 'checkin_1/query.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {intervalType: '0', user_type: '1', is_from_share: '1', _t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qgyUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 查询青果园签到状态 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 查询青果园签到状态 返回data==============`);
                    log(JSON.stringify(data))
                }
                qgySignFlag = data.data.todaySign;
                log(`查询青果园签到状态成功`)
            } catch (e) {
                log(`查询青果园签到状态异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 创建
 * @param baseUrl
 * @param token
 * @returns {Promise<unknown>}
 */
async function qgyCreateItem(baseUrl, token) {
    return new Promise((resolve) => {
        var url = baseUrl + 'inviteJoinTask/createItem.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qgyUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
            },
            data: {token: token, user_type: '1', is_from_share: '1', _t: timestampMs()}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 青果园首次进入 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 青果园首次进入 返回data==============`);
                    log(JSON.stringify(data))
                }
                var assistItemId = data.data.assistItemId;
                log(`青果园首次进入成功,${assistItemId}`)
            } catch (e) {
                log(`青果园首次进入异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 青果园签到
 * @param baseUrl
 * @param token
 * @returns {Promise<unknown>}
 */
async function qgySign(baseUrl, token) {
    return new Promise((resolve) => {
        var url = baseUrl + 'checkin_1/doSign.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: '*/*',
                Referer: qgyUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'en-us,en'
            },
            data: {token: token, user_type: '0', is_from_share: '1', _t: timestampMs()}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 青果园签到 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 青果园签到 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('data') && data.data.hasOwnProperty('options')) {
                    qgySignFlag = true;
                    log(`青果园签到成功，${data.data.options[0].optionName}`)
                } else {
                    log(`青果园签到失败：${JSON.stringify(data)}，原因：${e}`)
                }

            } catch (e) {
                log(`青果园签到异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 查询青果园任务
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function queryQgyTask(baseUrl) {
    qgyTaskData = [];
    var url = baseUrl + 'customTask1/queryTasks.do';
    var host = (url.split('//')[1]).split('/')[0];
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: url,
            params: {user_type: '1', is_from_share: '1', _t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qgyUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br'
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 获取请果园任务 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 获取请果园任务 返回data==============`);
                    log(JSON.stringify(data))
                }
                log(`获取请果园任务：${data.success}`)
                qgyTaskData = data.data.item;
            } catch (e) {
                log(`获取请果园任务异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 完成青果园任务
 * @param baseUrl
 * @param token
 * @param taskCode
 * @param taskTitle
 * @returns {Promise<unknown>}
 */
async function finishBrowseInfoTask(baseUrl, token, taskCode, taskTitle) {
    return new Promise((resolve) => {
        var url = baseUrl + 'customTask1/finishBrowseInfoTask.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qgyUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
            },
            data: {
                taskCode: taskCode,
                token: token,
                user_type: '1',
                is_from_share: '1',
                _t: timestampMs()
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 完成青果园任务 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 完成青果园任务 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('success') && data.success) {
                    log(`完成${taskTitle}任务：${data.success},${data.data.reward}`)
                } else {
                    log(`完成${taskTitle}任务失败：${data.message}`)
                }

            } catch (e) {
                log(`完成任务异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 领取奖励信息
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function newRewardInfo(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'customTask1/newRewardInfo.do';
        var host = (url.split('//')[1]).split('/')[0];

        var options = {
            method: 'GET',
            url: url,
            params: {user_type: '1', is_from_share: '1', _t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qgyUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 领取奖励信息 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 领取奖励信息 返回data==============`);
                    log(JSON.stringify(data))
                }
                log(`领取奖励信息：${data.success}`)
            } catch (e) {
                log(`领取奖励信息：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 获取tokenKey
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function getTokenKeyStr(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'getTokenKey';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                Accept: '*/*',
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                Referer: baseUrl + 'index.html?appID=89420&from=login&spm=89420.1.1.1',
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 获取tokenKey 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                tokenKeyStr = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 获取tokenKey 返回data==============`);
                    log(JSON.stringify(data))
                }
                log(`获取tokenKey成功`)
            } catch (e) {
                log(`获取tokenKey失败：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })


}

/**
 * 获取token
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function getTokenStr(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'getToken';
        var host = (url.split('//')[1]).split('/')[0];
        const options = {
            method: 'GET',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: baseUrl + '/index.html?appID=89420&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br'
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 获取token 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                tokenStr = response.data.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 获取token 返回data==============`);
                    log(JSON.stringify(response.data))
                }
                log(`获取token成功`)
            } catch (e) {
                log(`获取token失败：${JSON.stringify(response.data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 开始旅行
 * @param baseUrl
 * @param token
 * @returns {Promise<unknown>}
 */
async function startTravel(baseUrl, token) {
    return new Promise((resolve) => {
        var url = baseUrl + 'customTask1/startTravel.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qgyUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
            },
            data: {token: token, user_type: '1', is_from_share: '1', _t: timestampMs()}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 开始旅行 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 开始旅行 返回data==============`);
                    log(JSON.stringify(data))
                }
                log(`开始旅行：${data.success}`)
            } catch (e) {
                log(`开始旅行失败：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}


/**
 * 完成抢兑
 * @param num
 * @returns {Promise<boolean>}
 */
async function finishQhd(num) {
    await loginFreePlugin(qhbUrl);
    await $.wait(3000)
    if (loginUrl == "") {
        log(`账号【${num}】登录抢红包异常，自动跳过任务！`);
        return false;
    }
    await setCookies();
    await $.wait(3000);
    if (gameCookie == "") {
        log(`账号【${num}】cookies异常，自动跳过任务！`);
        return false;
    }
    var urlMatch = qhbUrl.match('([^/]+)/?$');
    var baseUrl = qhbUrl.replace(urlMatch[0], '');
    await qhbHistory(baseUrl);
    await $.wait(2000);
    await qhbIndex(baseUrl);
    await $.wait(2000);
    await exchangeInfo(baseUrl);
    await $.wait(2000);
    if (!exchangeOneCodeConsumeFlag) {
        log(`账号【${num}】当期已经兑换或积分不足不再执行兑换！`);
        return false;
    }
    await getQhbTokenKey(baseUrl);
    await $.wait(1000);
    await getQhbToken(baseUrl);
    await $.wait(1000);
    try {
        var qhbToken = dealToken(tokenStr, tokenKeyStr);
        await $.wait(2000);
        await qhbExchange(baseUrl, qhbToken)
        if (qhbOrderId == '') {
            log(`账号【${num}】抢红包兑换订单失败！`);
            return false;
        }
        await $.wait(2000);
        await qhbCreditsCost(baseUrl);
        await $.wait(4000);
        if (qhbOrderData != '') {
            await qhbOrderStatus(baseUrl);
            await $.wait(2000);
            await getQhbToken(baseUrl);
            await $.wait(1000);
            var qhbToken = dealToken(tokenStr, tokenKeyStr);
            await $.wait(2000);
            await qhbCode(baseUrl, qhbToken);
        }

    } catch (e) {
        log(`账号【${num}】解码失败，不进行兑换！${e}`);
        return false;
    }
    return true;
}

/**
 * 抢红包记录
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function qhbHistory(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'game/moneyLogList.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {
                pageNo: '1',
                pageSize: '10',
                user_type: '1',
                is_from_share: '1',
                _t: timestampMs()
            },
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qhbUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 抢红包记录 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 抢红包记录 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('success') && data.success) {
                    var myTotalMoney = (data.data.myTotalMoney / 100).toFixed(2);
                    var message = `获得总金额：${myTotalMoney}`
                    if (data.data.hasOwnProperty('list') && data.data.list.length > 0) {
                        var cycle = data['data']['list'][0]['cycle']
                        var yesDate = getYestoday();
                        if (cycle == yesDate) {
                            var codeList = data['data']['list'][0]['codeList'][0]
                            var money = codeList.money / 100
                            message += `${cycle}，${codeList.level}等奖，红包：${money.toFixed(2)}`
                        } else {
                            message += `昨日未参与`;
                        }
                        addNotifyStr(message, true);
                    }
                } else {
                    log(`抢红包记录失败：${data.message}`)
                }
            } catch (e) {
                log(`抢红包记录异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}


/**
 * 抢红包首页
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function qhbIndex(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'game/index.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {
                kww_user_source: '4',
                kww_user_type: '0',
                user_type: '1',
                is_from_share: '1',
                _t: timestampMs()
            },
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qhbUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 抢红包首页 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 抢红包首页 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('success') && data.success) {
                    var cycleStartExchangeTime = data.data.cycleStartExchangeTime
                    var cycleEndExchangeTime = data.data.cycleEndExchangeTime
                    var cycle = data.data.currentCycleInfo.cycle
                    var startOpenTimestamp = getLocalTime(data.data.currentCycleInfo.startOpenTimestamp)
                    var totalAmount = data.data.currentCycleInfo.totalAmount / 100
                    var codeCount = data.data.currentCycleInfo.totalCodeCountLimit - data.data.currentCycleInfo.totalCodeCount
                    log(`当期抢红包时间范围：${cycleStartExchangeTime}至${cycleEndExchangeTime}`)
                    log(`${cycle}期，奖池金额：${totalAmount}，剩余红包码：${codeCount}，开奖时间：${startOpenTimestamp}`)
                } else {
                    log(`抢红包首页失败：${data.message}`)
                }
            } catch (e) {
                log(`抢红包首页异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

function getLocalTime(str) {
    return new Date(parseInt(str)).toLocaleString().replace(/:d{1,2}$/, ' ');
}

/**
 * 抢兑红包信息
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function exchangeInfo(baseUrl) {
    exchangeOneCodeConsumeFlag = false;
    return new Promise((resolve) => {
        var url = baseUrl + 'game/exchangeInfo.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {user_type: '1', is_from_share: '1', _t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qhbUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 抢红包活动信息 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 抢红包活动信息 返回data==============`);
                    log(JSON.stringify(data))
                }
                if (data.hasOwnProperty('success') && data.success) {
                    exchangeOneCodeConsumeCredits = data.data.exchangeOneCodeConsumeCredits
                    var leftCredits = data.data.leftCredits
                    var haveExchangeCodeCount = data.data.haveExchangeCodeCount
                    if (leftCredits >= exchangeOneCodeConsumeCredits && haveExchangeCodeCount == 0) {
                        exchangeOneCodeConsumeFlag = true
                    }
                } else {
                    log(`抢红包活动信息失败：${data.message}`)
                }
            } catch (e) {
                log(`抢红包活动信息异常：${JSON.stringify(data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })


}
async function getjcTokenKey() {
    return new Promise((resolve) => {
        var url = 'https://89420.activity-20.m.duiba.com.cn/projectx/p15fbb34c/getTokenKey?';

        var options = {
            method: 'GET',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: '89420.activity-20.m.duiba.com.cn',
                Accept: '*/*',
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',

            }
        };

        if (debug) {
            log(`\n【debug】=============== 这是 竞猜tokenKey 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                tokenKeyStr = response.data;
                if (debug) {
                    log(`\n【debug】===============这是 竞猜tokenKey 返回data==============`);
                    log(tokenKeyStr)
                }
                log(`获取竞猜tokenKey成功`)
            } catch (e) {
                log(`获取竞猜tokenKey失败：${tokenKeyStr}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 获取抢红包token
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function getjcToken(baseUrl) {
    return new Promise((resolve) => {
        var url = 'https://89420.activity-20.m.duiba.com.cn/projectx/p15fbb34c/getToken';

        var options = {
            method: 'GET',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: '89420.activity-20.m.duiba.com.cn',
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qhbUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 竞猜token 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                tokenStr = response.data.data;
                if (debug) {
                    log(`\n【debug】===============这是 竞猜token 返回data==============`);
                    log(response.data)
                }
                log(`获取竞猜token成功`)
            } catch (e) {
                log(`获取竞猜token失败：${JSON.stringify(response.data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
/**
 * 获取抢红包tokenkey
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function getQhbTokenKey(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'getTokenKey';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                Accept: '*/*',
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                Referer: qhbUrl + '&from=login&spm=89420.1.1.1',
            }
        };

        if (debug) {
            log(`\n【debug】=============== 这是 获取抢红包tokenKey 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                tokenKeyStr = response.data;
                if (debug) {
                    log(`\n【debug】===============这是 获取抢红包tokenKey 返回data==============`);
                    log(tokenKeyStr)
                }
                log(`获取抢红包tokenKey成功`)
            } catch (e) {
                log(`获取抢红包tokenKey失败：${tokenKeyStr}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 获取抢红包token
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function getQhbToken(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'getToken';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qhbUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 获取抢红包token 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                tokenStr = response.data.data;
                if (debug) {
                    log(`\n【debug】===============这是 获取抢红包token 返回data==============`);
                    log(response.data)
                }
                log(`获取抢红包token成功`)
            } catch (e) {
                log(`获取抢红包token失败：${JSON.stringify(response.data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 抢红包提交
 * @param baseUrl
 * @param token
 * @returns {Promise<unknown>}
 */
async function qhbExchange(baseUrl, token) {
    return new Promise((resolve) => {
        var url = baseUrl + 'game/getExchangeOrderId.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qhbUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
            },
            data: {
                exchangeOneCodeConsumeCredits: exchangeOneCodeConsumeCredits,
                exchangeCodeCount: '1',
                token: token,
                user_type: '1',
                is_from_share: '1',
                _t: timestampMs()
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 抢红包提交 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n【debug】===============这是 抢红包提交 返回data==============`);
                    log(response.data)
                }
                if (data.hasOwnProperty('success') && data.success) {
                    qhbOrderId = data.data.orderId
                    log(`抢红包活动提交成功：${qhbOrderId}`)
                } else {
                    log(`抢红包活动提交失败：${JSON.stringify(response.data)}`)
                }
            } catch (e) {
                log(`抢红包活动提交异常：${JSON.stringify(response.data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 抢红包扣积分
 * @returns {Promise<unknown>}
 */
async function qhbCreditsCost(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'credits/creditsCost.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'POST',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: qhbUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
            },
            data: {
                toPlaywayId: 'game',
                toActionId: 'exchange',
                desc: 'exchange_consume_credits_desc',
                credits: exchangeOneCodeConsumeCredits,
                orderId: qhbOrderId,
                user_type: '1',
                is_from_share: '1',
                _t: timestampMs()
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 抢红包扣积分 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n【debug】===============这是 抢红包扣积分 返回data==============`);
                    log(response.data)
                }
                if (data.hasOwnProperty('success') && data.success) {
                    qhbOrderData = data.data
                    log(`抢红包扣积分成功：${qhbOrderData}`)
                } else {
                    log(`抢红包扣积分失败：${JSON.stringify(response.data)}`)
                }
            } catch (e) {
                log(`抢红包扣积分异常：${JSON.stringify(response.data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 状态
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function qhbOrderStatus(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'credits/queryStatus.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {
                ticketNum: qhbOrderData,
                user_type: '1',
                is_from_share: '1',
                _t: timestampMs()
            },
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: 'https://89420.activity-20.m.duiba.com.cn/projectx/p725daef0/index.html?appID=89420&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 抢红包订单状态 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n【debug】===============这是 抢红包订单状态 返回data==============`);
                    log(response.data)
                }
                if (data.hasOwnProperty('success') && data.success) {
                    if (data.data == 1) {
                        log(`抢红包订单状态正常`)
                    } else {
                        log(`抢红包订单状态异常`)
                    }
                } else {
                    log(`抢红包订单状态失败：${JSON.stringify(response.data)}`)
                }
            } catch (e) {
                log(`抢红包订单状态异常：${JSON.stringify(response.data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 查询兑换码
 * @param baseUrl
 * @param token
 * @returns {Promise<unknown>}
 */
async function qhbCode(baseUrl, token) {
    return new Promise((resolve) => {
        var url = baseUrl + 'game/exchange.do';
        var host = (url.split('//')[1]).split('/')[0];

        var options = {
            method: 'POST',
            url: url,
            params: {_t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: 'https://89420.activity-20.m.duiba.com.cn/projectx/p725daef0/index.html?appID=89420&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
            },
            data: {
                ticket: qhbOrderData,
                exchangeCodeCount: '1',
                exchangeOneCodeConsumeCredits: exchangeOneCodeConsumeCredits,
                token: token,
                user_type: '1',
                is_from_share: '1',
                _t: timestampMs()
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 红包码查询 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n【debug】===============这是 红包码查询 返回data==============`);
                    log(response.data)
                }
                if (data.hasOwnProperty('success') && data.success) {
                    addNotifyStr(`抢红包兑换成功，兑换码：${data.data.myNewCodeList[0]['code']}`, true)
                } else {
                    log(`红包码查询失败：${JSON.stringify(response.data)}`)
                }
            } catch (e) {
                log(`红包码查询异常：${JSON.stringify(response.data)}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })


}

/**
 * 完成答题
 * @param num
 * @returns {Promise<boolean>}
 */
async function finishDt(num) {
    await loginFreePlugin(mrDtUrl);
    await $.wait(3000)
    if (loginUrl == "") {
        log(`账号【${num}】登录异常，自动跳过答题！`);
        return false;
    }
    await setCookies();
    await $.wait(3000);
    if (gameCookie == "") {
        log(`账号【${num}】cookies异常，自动跳过答题！`);
        return false;
    }
    var urlMatch = mrDtUrl.match('([^/]+)/?$');
    var baseUrl = mrDtUrl.replace(urlMatch[0], '');
    await answerInfo(baseUrl);
    await $.wait(3000);
    if (answerState) {
        log(`账号【${num}】答题已经完成了！`)
    } else {
        await answerStart(baseUrl);
        await $.wait(3000);
        if (answerStartId == '') {
            log(`账号【${num}】${answerStartId}答题开始失败，自动跳过！`)
            return false;
        } else {
            await getQuestion(baseUrl);
            await $.wait(2000);
            await answerSubmit(baseUrl);
            await $.wait(3000);
            for (var i = currQuestions; i <= totalQuestions; i++) {
                log(`开始第${currQuestions}次答题`);
                await getQuestion(baseUrl);
                await $.wait(2000);
                await answerSubmit(baseUrl);
                await $.wait(3000);
            }
            await complete(baseUrl);
            await $.wait(3000);
            await answerPage(baseUrl);
            await $.wait(3000);
        }
    }
    return true;
}

/**
 * 答题信息
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function answerInfo(baseUrl) {
    var url = baseUrl + 'kwwmrdt/index.do';
    var host = (url.split('//')[1]).split('/')[0];
    return new Promise((resolve) => {
        const options = {
            method: 'GET',
            url: url,
            qs: {user_type: '0', is_from_share: '1', _t: `${timestampMs()}`},
            headers: {
                Host: host,
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: '*/*',
                Referer: mrDtUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-us,en',
                'Cookie': gameCookie
            },
        };
        try {
            request(options, function (error, response, body) {
                if (error) throw new Error(error);

                let result = JSON.parse(body);
                if (result.hasOwnProperty('success') && result.success) {
                    var answerCount = result.data.answerCount;
                    answerState = (result.data.answerState == 3) ? true : false;
                    var currentDay = result.data.currentDay;
                    var score = '';
                    for (var i in result.data.weekCalendar) {
                        var day = result.data.weekCalendar[i]['day'];
                        if (day == currentDay) {
                            score = result.data.weekCalendar[i]['score'];
                        }
                    }
                    log(`本周答题第${currentDay}天，答题数量：${answerCount}，今日答题奖励积分：${score}`)
                } else {
                    log(`查询答题信息失败：${result.message}`)
                }
            });
        } catch (e) {
            log(e)
        } finally {
            resolve();
        }

    })
}

/**
 * 开始答题
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function answerStart(baseUrl) {
    answerStartId = '';
    return new Promise((resolve) => {
        var url = baseUrl + 'answer/start.do';
        var host = (url.split('//')[1]).split('/')[0];

        var options = {
            method: 'GET',
            url: url,
            params: {user_type: '1', is_from_share: '1', _t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: mrDtUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 开始答题 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 开始答题 返回data==============`);
                    log(data)
                }
                if (data.hasOwnProperty('success') && data.success) {
                    answerStartId = data.data;
                    log(`开始答题请求成功，开始答题ID：${answerStartId}`)
                } else {
                    log(`开始答题失败，原因：${data.message}`)
                }
            } catch (e) {
                log(`开始答题异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 获取问题
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function getQuestion(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'answer/getQuestion.do';
        var host = (url.split('//')[1]).split('/')[0];

        var options = {
            method: 'GET',
            url: url,
            params: {startId: answerStartId, user_type: '1', is_from_share: '1', _t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: mrDtUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 获取问题 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 获取问题 返回data==============`);
                    log(data)
                }
                if (data.hasOwnProperty('success') && data.success) {
                    currQuestions = parseInt(data.data.currentIndex);
                    totalQuestions = parseInt(data.data.totalIndex);
                    questionId = data.data.id;
                    var answerList = data.data.answerList;
                    log(`今日可答题次数：${totalQuestions}，当前开始答题第${currQuestions}次`)
                    if (answerLists.hasOwnProperty(questionId)) {
                        answerType = answerLists[questionId]
                        log(`获取问题成功,ID:${questionId},答案；${answerType}`)
                    } else {
                        answerType = randomInt(1, answerList.length)
                        log(`ID:${questionId},答案不存在，建议联系作者添加,随机：${answerType}`)
                    }
                } else {
                    log(`获取问题失败，原因：${data.message}`)
                }
            } catch (e) {
                log(`获取问题异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 答题提交
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function answerSubmit(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'answer/submit.do';
        var host = (url.split('//')[1]).split('/')[0];

        var options = {
            method: 'GET',
            url: url,
            params: {
                answer: answerType,
                startId: answerStartId,
                user_type: '1',
                is_from_share: '1',
                _t: timestampMs()
            },
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: mrDtUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 提交答题 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 提交答题 返回data==============`);
                    log(data)
                }
                if (data.hasOwnProperty('success') && data.success) {
                    currQuestions += 1;
                    var id = data.data.id;
                    var correct = data.data.correct;
                    var correctAnswer = data.data.correctAnswer;
                    var title = correct ? `✅` : `❌`;
                    log(`提交问题成功,ID:${id},答案：【${correctAnswer}】回答：【${title}】`)
                    if (!correct) {
                        addNotifyStr(`ID：${id}回答问题错了哦，答案：【${correctAnswer}】，建议提交作者更新`, true)
                    }
                    if (!answerLists.hasOwnProperty(id)) {
                        var str = id + "=" + correctAnswer;
                        answerListData.push(str);
                    }
                } else {
                    log(`提交答题失败，原因：${data.message}`)
                }
            } catch (e) {
                log(`提交答题异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 答题完成
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function complete(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'answer/complete.do';
        var host = (url.split('//')[1]).split('/')[0];

        var options = {
            method: 'GET',
            url: url,
            params: {startId: answerStartId, user_type: '1', is_from_share: '1', _t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: mrDtUrl + '&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 完成答题 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 完成答题 返回data==============`);
                    log(data)
                }
                if (data.hasOwnProperty('success') && data.success) {
                    currQuestions = 1;
                    totalQuestions = 5;
                    log(`当日答题已经全部完成`)
                } else {
                    log(`完成答题失败，原因：${data.message}`)
                }
            } catch (e) {
                log(`完成答题异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

/**
 * 答题页面
 * @param baseUrl
 * @returns {Promise<unknown>}
 */
async function answerPage(baseUrl) {
    return new Promise((resolve) => {
        var url = baseUrl + 'answer/answerPage.do';
        var host = (url.split('//')[1]).split('/')[0];
        var options = {
            method: 'GET',
            url: url,
            params: {user_type: '1', is_from_share: '1', _t: timestampMs()},
            headers: {
                cookie: gameCookie,
                Host: host,
                'Content-Type': 'application/x-www-form-urlencoded',
                Connection: 'keep-alive',
                Accept: '*/*',
                'User-Agent': userAgent,
                Referer: 'https://89420.activity-20.m.duiba.com.cn/projectx/p129446ea/index.html?appID=89420&from=login&spm=89420.1.1.1',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是 答题页面 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 答题页面 返回data==============`);
                    log(data)
                }
                if (data.hasOwnProperty('success') && data.success) {
                    var todayCompleteResult = data.data.todayCompleteResult;
                    addNotifyStr(`今日积分奖励：${todayCompleteResult.baseCredits},答对题目：${todayCompleteResult.correctCount}`, true)
                } else {
                    log(`查看答题页面失败，原因：${data.message}`)
                }
            } catch (e) {
                log(`查看答题页面异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
//======================竞猜=====================
async function jcinfo() {
    return new Promise(async(resolve) => {

        var options = {
            method: 'GET',
            url: 'https://89420.activity-20.m.duiba.com.cn/projectx/p15fbb34c/home/index.do',
            params: {user_type: '0', is_from_share: '1', _t: '1668919193539'},
            headers: {
                Host: '89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': userAgent,
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Language': 'en-us,en',
                Cookie: gameCookie,
                'Accept-Encoding': 'gzip, deflate'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 竞猜页面 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 竞猜页面 返回data==============`);
                    log(data)
                }
                if (data.success) {
                    myWinMatch = data.data.myWinMatch;
                    nextMatchInfoTime = data.data.nextMatchInfoTime
                    addNotifyStr(`竞猜猜对数：${myWinMatch}`, true)
                } else {
                    log(`竞猜页面失败，原因：${data.message}`)
                }
            } catch (e) {
                log(`竞猜异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
async function jcquery(nextMatchInfoTime) {
    return new Promise(async(resolve) => {

        var options = {
            method: 'GET',
            url: 'https://89420.activity-20.m.duiba.com.cn/projectx/p15fbb34c/home/query.do',
            params: {
                queryTime: nextMatchInfoTime,
                user_type: '0',
                is_from_share: '1',
                _t: '1668919193789'
            },
            headers: {
                Host: '89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': userAgent,
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Language': 'en-us,en',
                Cookie: gameCookie,
                'Accept-Encoding': 'gzip, deflate'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 竞猜页面 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {

            try {
                var data = response.data;

                if (debug) {
                    log(`\n\n【debug】===============这是 竞猜页面 返回data==============`);
                    log(data)
                }
                if (data.success) {
                    queryinfo = data.data


                } else {
                    log(`竞猜页面失败，原因：${data.message}`)
                }
            } catch (e) {
                log(`竞猜异常：${data}，原因：${e}`)
            }

        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回

            resolve();
        });

    })
}
async function jccreditsCost() {
    return new Promise(async(resolve) => {

        var options = {
            method: 'POST',
            url: 'https://89420.activity-20.m.duiba.com.cn/projectx/p15fbb34c/credits/creditsCost.do',
            params: {_t: '1668919309582'},
            headers: {
                Host: '89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                'User-Agent': userAgent,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: '*/*',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                Referer: 'https://89420.activity-20.m.duiba.com.cn/projectx/p15fbb34c/index.html?appID=89420',
                'Accept-Language': 'en-us,en',
                Cookie: gameCookie
            },
            data: 'toPlaywayId=home&toActionId=betting&credits=18&desc=credits_desc&user_type=0&is_from_share=1&_t=1668919309582'
        };
        if (debug) {
            log(`\n【debug】=============== 这是 竞猜页面 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 竞猜页面 返回data==============`);
                    log(data)
                }
                if (data.success) {
                    jcticketNum = data.data
                    log(`获取竞猜订单：` + jcticketNum)

                } else {
                    log(`竞猜页面失败，原因：${data.message}`)
                }
            } catch (e) {
                log(`竞猜异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
async function jcqueryStatus() {
    return new Promise((resolve) => {

        var options = {
            method: 'GET',
            url: 'https://89420.activity-20.m.duiba.com.cn/projectx/p15fbb34c/credits/queryStatus.do',
            params: {
                ticketNum: jcticketNum,
                user_type: '0',
                is_from_share: '1',
                _t: '1668919310283'
            },
            headers: {
                Host: '89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': userAgent,
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Language': 'en-us,en',
                Cookie: gameCookie,
                'Accept-Encoding': 'gzip, deflate'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 竞猜页面 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 竞猜页面 返回data==============`);
                    log(data)
                }
                if (data.success) {
                    log("竞猜订单创建" + data.success)


                } else {
                    log(`竞猜页面失败，原因：${data.message}`)
                }
            } catch (e) {
                log(`竞猜异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
async function jcbetting(ticket,optionId,matchId,token) {
    return new Promise((resolve) => {

        var options = {
            method: 'GET',
            url: 'https://89420.activity-20.m.duiba.com.cn/projectx/p15fbb34c/home/betting.do',
            params: {
                ticket: ticket,
                credits: '18',
                optionId: optionId,
                matchId: matchId,
                token: token,
                user_type: '0',
                is_from_share: '1',
                _t: '1668919310505'
            },
            headers: {
                Host: '89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': userAgent,
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Language': 'en-us,en',
                Cookie: gameCookie,
                'Accept-Encoding': 'gzip, deflate'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 竞猜页面 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 竞猜页面 返回data==============`);
                    log(data)
                }
                if (data.success) {
                    jcjg = data.success
                    log("竞猜结果：" + data.success)


                } else {
                    log(`竞猜结果，原因：${data.message}`)
                    jcjg = data.success
                }
            } catch (e) {
                log(`竞猜结果异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
async function jcrecord() {
    return new Promise((resolve) => {

        var options = {
            method: 'GET',
            url: 'https://89420.activity-20.m.duiba.com.cn/projectx/p15fbb34c/home/record.do',
            params: {user_type: '0', is_from_share: '1', _t: '1668919193539'},
            headers: {
                Host: '89420.activity-20.m.duiba.com.cn',
                Connection: 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': userAgent,
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Language': 'en-us,en',
                Cookie: gameCookie,
                'Accept-Encoding': 'gzip, deflate'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是 竞猜页面 请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 竞猜页面 返回data==============`);
                    log(data)
                }
                if (data.success) {
                    recordinfo = data.data.bettingInfoArray;
                    for(let i = 0; i < recordinfo.length; i++){
                        homeName = recordinfo[i].homeName
                        awayName = recordinfo[i].awayName
                        joinNum = recordinfo[i].joinNum
                        matchId = recordinfo[i].matchId
                        option1 = recordinfo[i].option1
                        option2 = recordinfo[i].option2
                        option3 = recordinfo[i].option3
                        log('竞猜第' + i + "场")
                        if (recordinfo.select == 1 ){
                            log("叼毛选择：" + homeName + "赢")
                        }
                        if (recordinfo.select == 0 ){
                            log("叼毛选择：平局")
                        }
                        if (recordinfo.select == 3 ){
                            log("叼毛选择：" + awayName + "赢")
                        }
                    }
                    log('投注次数：' + data.data.bettingNum)
                    log('累计积分收益：' + data.data.credits)
                } else {
                    log(`竞猜页面失败，原因：${data.message}`)
                }
            } catch (e) {
                log(`竞猜异常：${data}，原因：${e}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
async function finishJc(num) {
    await loginFreePlugin(qhbUrl);
    await $.wait(3000)
    if (loginUrl == "") {
        log(`账号【${num}】登录竞猜异常，自动跳过任务！`);
        return false;
    }
    await setCookies();
    await $.wait(3000);
    if (gameCookie == "") {
        log(`账号【${num}】cookies异常，自动跳过！`);
        return false;
    }

    try {
        await jcinfo();
        await jcquery(nextMatchInfoTime);
        for(let i = 0; i < queryinfo.length; i++){
            homeName = queryinfo[i].homeName
            awayName = queryinfo[i].awayName
            joinNum = queryinfo[i].joinNum
            matchId = queryinfo[i].matchId
            option1 = queryinfo[i].option1
            option2 = queryinfo[i].option2
            option3 = queryinfo[i].option3
            select = queryinfo[i].select
            matchTime =queryinfo[i].matchTime
            if(option1 >  option3){optionId = 1}
            else optionId = 3
            log('竞猜第' + i + "场")
            log(homeName + " VS " + awayName)
            log("参与人数：" + joinNum)
            log(homeName + "支持率：" + option1)
            log("平局" + "支持率：" + option2)
            log(awayName + "支持率：" + option3)
            if(select !== null && 3){
                log('已经参加竞猜了 跳过')
            }else
            if(select == null){
                if(matchTime > nextMatchInfoTime){
                    log('没有参加过竞猜 去竞猜')
                    await jccreditsCost()
                    await $.wait(3000);
                    await jcqueryStatus()
                    await getjcTokenKey();
                    await $.wait(1000);
                    await getjcToken();
                    await $.wait(1000);
                    var qhbToken = dealToken(tokenStr, tokenKeyStr);
                    await jcbetting(jcticketNum,optionId,matchId,qhbToken)
                    if (jcjg == false){
                        if(matchTime > nextMatchInfoTime){
                            await jccreditsCost()
                            await $.wait(3000);
                            await jcqueryStatus()
                            await getjcTokenKey();
                            await $.wait(1000);
                            await getjcToken();
                            await $.wait(1000);
                            var qhbToken = dealToken(tokenStr, tokenKeyStr);
                            await jcbetting(jcticketNum,optionId,matchId,qhbToken)}
                    }
                }
            }
        }



        await jcrecord()

        await $.wait(2000);



    } catch (e) {
        log(`账号【${num}】解码失败！${e}`);
        return false;
    }
    return true;
}

// ============================================重写============================================ \\
async function GetRewrite() {
    if ($request.url.indexOf("member/api/info/?userKeys=v1.0&pageName=member-info-index-search&formName=searchForm&kwwMember.memberId") > -1) {
        let ck = '';
        let theRequest = new Object();
        if ($request.url.indexOf("?") != -1) {
            let info = $request.url.split('?');
            let strs = info[1].split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
            ck = theRequest.memberId;
        }
        if (kwwUid) {
            if (kwwUid.indexOf(ck) == -1) {
                kwwUid = kwwUid + "@" + ck;
                $.setdata(kwwUid, "kwwUid");
                List = kwwUid.split("@");
                $.msg(`【${$.name}】` + ` 获取第${kwwUid.length}个 ck 成功: ${ck} ,不用请自行关闭重写!`);
            }
        } else {
            $.setdata(ck, "kwwUid");
            $.msg(`【${$.name}】` + ` 获取第1个 ck 成功: ${ck} ,不用请自行关闭重写!`);
        }
    }
}

function getYestoday() {
    var date = new Date();
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate() - 1;
    if (d == "0") {
        m = m - 1;
        var temp = new Date(y, m, d);
        d = temp.getDate();
    }
    var Yesterday = [y, m, d];
    Yesterday = Yesterday.join("");
    return Yesterday;
}

function getQueryString(url, name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = url.split('?')[1].match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}


function DealScriptStr(str) {
    str = str.replace(/\/\*.*?\*\//g, ' ');
    str = str.replace(/\b0(\d+)/g, '0o$1');
    return str;
}

function dealToken(tokenStr, tokenKeyStr) {
    let scriptToken, scriptKey;
    scriptToken = DealScriptStr(tokenStr);
    scriptKey = DealScriptStr(tokenKeyStr);
    let tdom = new JSDOM(
        `<script>${scriptToken}</script><script>${scriptKey}</script>`,
        {
            runScripts: 'dangerously'
        }
    )
    let str = scriptKey;
    var babelStr;
    str = str.replaceAll(/eval/g, 'var babelStr=');
    str = str.replaceAll(/\\u0065\\u0076\\u0061\\u006c/g, 'var babelStr=')
    eval(str);
    eval(babelStr);
    let ast = parser.parse(babelStr);
    let funcStr = ast.program.body[0].id.name;

    let res = tdom.window[funcStr]();
    tdom.window.close();
    //console.log(window['pf8b6b']);
    return res;
}

function dealToken2(tokenStr, tokenKey) {
    let scriptToken;
    scriptToken = DealScriptStr(tokenStr);
    let tdom = new JSDOM(
        `<script>${scriptToken}</script>`,
        {
            runScripts: 'dangerously'
        }
    )
    let res = tdom.window[tokenKey];
    tdom.window.close();
    //console.log(window['pf8b6b']);
    return res;
}

function ParseHtml(html) {
    let doc = domParser.parseFromString(html);
    let nodes = xpath.select('//script', doc);
    let node = nodes[4].childNodes[0];
    let babelStr;
    let tdom = new JSDOM(`<script>${DealScriptStr(node.data)}</script>`, {
        runScripts: 'dangerously'
    })
    babelStr = tdom.window.getDuibaToken.toString();
    let tokenKey = babelStr.match(/var key = '(.*)?';/)[1];
    let defaultToken = babelStr.match(/data.token = '(.*)?';/)[1];
    tdom.window.close();
    return {
        cid: tdom.window.CFG.consumerId,
        tokenKey,
        defaultToken
    };
}

function ParseYjjHtml(html) {
    let doc = domParser.parseFromString(html);
    let nodes = xpath.select('//script', doc);
    let node = nodes[5].childNodes[0];
    let babelStr;
    let tdom = new JSDOM(`<script>${DealScriptStr(node.data)}</script>`, {
        runScripts: 'dangerously'
    })
    babelStr = tdom.window.getDuibaToken.toString();
    let tokenKey = babelStr.match(/var key = '(.*)?';/)[1];
    let defaultToken = babelStr.match(/data.token = '(.*)?';/)[1];
    tdom.window.close();
    return {
        cid: tdom.window.CFG.consumerId,
        tokenKey,
        defaultToken
    };
}

function yjgetkey(tokenStr) {
    let scriptToken;
    scriptToken = DealScriptStr(tokenStr);

    let tdom = new JSDOM(
        `<script>${scriptToken}</script>`,
        {
            runScripts: 'dangerously'
        }
    )
    let str = tokenStr;
    var babelStr;

    eval(tokenStr)
    str = str.replaceAll(/eval/g, 'var babelStr=');
    str = str.replaceAll(/\\u0065\\u0076\\u0061\\u006c/g, 'var babelStr=')
    eval(str);

    eval(babelStr);

    let key = babelStr.match(/key = '(.*?)'/)[1];

    tdom.window.close();

    return key;
}

function yjParseHtmlGame(html) {
    let doc = domParser.parseFromString(html);

    let nodes = xpath.select('//script', doc);

    let node = nodes[5].childNodes[0];

    let tdom = new JSDOM(`<script>${node.data}</script>`, {
        runScripts: 'dangerously'
    })
    tdom.window.close();
    return yjgetkey(node.data)

}

function yjgettoken(html, tokenStr) {
    let scriptToken;
    scriptToken = DealScriptStr(tokenStr);

    let tdom = new JSDOM(
        `<script>${scriptToken}</script>`,
        {
            runScripts: 'dangerously'
        }
    )
    let str = scriptToken;
    window = tdom.window
    var babelStr;
    str = str.replaceAll(/eval/g, 'var babelStr=');
    str = str.replaceAll(/\\u0065\\u0076\\u0061\\u006c/g, 'var babelStr=')
    eval(str);
    eval(babelStr);


    var keys = yjParseHtmlGame(html)
    let res = tdom.window[keys];
    tdom.window.close();

    return res;
}


function ParseHtmlGame(html) {
    let doc = domParser.parseFromString(html);
    let nodes = xpath.select('//script', doc);
    let node = nodes[2].childNodes[0];
    let tdom = new JSDOM(`<script>${node.data}</script>`, {
        runScripts: 'dangerously'
    })
    tdom.window.close();
    return {
        key: tdom.window.CFG.key
    };
}


/**
 * 加密
 * @param inputString
 * @returns {*}
 */
function md5(inputString) {
    var hc = "0123456789abcdef";

    function rh(n) {
        var j, s = "";
        for (j = 0; j <= 3; j++) s += hc.charAt((n >> (j * 8 + 4)) & 0x0F) + hc.charAt((n >> (j * 8)) & 0x0F);
        return s;
    }

    function ad(x, y) {
        var l = (x & 0xFFFF) + (y & 0xFFFF);
        var m = (x >> 16) + (y >> 16) + (l >> 16);
        return (m << 16) | (l & 0xFFFF);
    }

    function rl(n, c) {
        return (n << c) | (n >>> (32 - c));
    }

    function cm(q, a, b, x, s, t) {
        return ad(rl(ad(ad(a, q), ad(x, t)), s), b);
    }

    function ff(a, b, c, d, x, s, t) {
        return cm((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a, b, c, d, x, s, t) {
        return cm((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a, b, c, d, x, s, t) {
        return cm(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a, b, c, d, x, s, t) {
        return cm(c ^ (b | (~d)), a, b, x, s, t);
    }

    function sb(x) {
        var i;
        var nblk = ((x.length + 8) >> 6) + 1;
        var blks = new Array(nblk * 16);
        for (i = 0; i < nblk * 16; i++) blks[i] = 0;
        for (i = 0; i < x.length; i++) blks[i >> 2] |= x.charCodeAt(i) << ((i % 4) * 8);
        blks[i >> 2] |= 0x80 << ((i % 4) * 8);
        blks[nblk * 16 - 2] = x.length * 8;
        return blks;
    }

    var i, x = sb(inputString), a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, olda, oldb, oldc, oldd;
    for (i = 0; i < x.length; i += 16) {
        olda = a;
        oldb = b;
        oldc = c;
        oldd = d;
        a = ff(a, b, c, d, x[i + 0], 7, -680876936);
        d = ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = ff(c, d, a, b, x[i + 10], 17, -42063);
        b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
        a = gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = gg(b, c, d, a, x[i + 0], 20, -373897302);
        a = gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
        a = hh(a, b, c, d, x[i + 5], 4, -378558);
        d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = hh(d, a, b, c, x[i + 0], 11, -358537222);
        c = hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = hh(b, c, d, a, x[i + 2], 23, -995338651);
        a = ii(a, b, c, d, x[i + 0], 6, -198630844);
        d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = ii(b, c, d, a, x[i + 9], 21, -343485551);
        a = ad(a, olda);
        b = ad(b, oldb);
        c = ad(c, oldc);
        d = ad(d, oldd);
    }
    return rh(a) + rh(b) + rh(c) + rh(d);
}

/**
 * 添加消息
 * @param str
 * @param is_log
 */
function addNotifyStr(str, is_log = true) {
    if (is_log) {
        log(`${str}\n`)
    }
    msg += `${str}\n`
}

// ============================================发送消息============================================ \\
async function SendMsg(message) {
    if (!message)
        return;

    if (Notify > 0) {
        if ($.isNode()) {
            var notify = require('./sendNotify');
            await notify.sendNotify($.name, message);
        } else {
            $.msg(message);
        }
    } else {
        log(message);
    }
}

/**
 * 随机延时1-30s，避免大家运行时间一样
 * @returns {*|number}
 */
function delay() {
    let time = parseInt(Math.random() * 100000);
    if (time > 30000) {// 大于30s重新生成
        return delay();
    } else {
        console.log('随机延时：', `${time}ms, 避免大家运行时间一样`)
        return time;// 小于30s，返回
    }
}

/**
 * 随机数生成
 */
function randomString(e) {
    e = e || 32;
    var t = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890",
        a = t.length,
        n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}

/**
 * 随机整数生成
 */
function randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min)
}

/**
 * 获取毫秒时间戳
 */
function timestampMs() {
    return new Date().getTime();
}

/**
 * 获取秒时间戳
 */
function timestampS() {
    return Date.parse(new Date()) / 1000;
}

/**
 *
 * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
 *    :$.time('yyyyMMddHHmmssS')
 *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
 *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
 * @param {string} fmt 格式化参数
 * @param {number} 可选: 根据指定时间戳返回格式化日期
 *
 */
function time(fmt, ts = null) {
    const date = ts ? new Date(ts) : new Date();
    let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        S: date.getMilliseconds(),
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(
            RegExp.$1,
            (date.getFullYear() + '').substr(4 - RegExp.$1.length)
        );
    for (let k in o)
        if (new RegExp('(' + k + ')').test(fmt))
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1
                    ? o[k]
                    : ('00' + o[k]).substr(('' + o[k]).length)
            );
    return fmt;
}

/**
 * 修改配置文件
 */
function modify() {

    fs.readFile('/ql/data/config/config.sh', 'utf8', function (err, dataStr) {
        if (err) {
            return log('读取文件失败！' + err)
        } else {
            var result = dataStr.replace(/regular/g, string);
            fs.writeFile('/ql/data/config/config.sh', result, 'utf8', function (err) {
                if (err) {
                    return log(err);
                }
            });
        }
    })
}



function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);

    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {url: t} : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }

        get(t) {
            return this.send.call(this.env, t)
        }

        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }

    return new class {
        constructor(t, e) {
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`)
        }

        isNode() {
            return "undefined" != typeof module && !!module.exports
        }

        isQuanX() {
            return "undefined" != typeof $task
        }

        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }

        isLoon() {
            return "undefined" != typeof $loon
        }

        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }

        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }

        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try {
                s = JSON.parse(this.getdata(t))
            } catch {
            }
            return s
        }

        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }

        getScript(t) {
            return new Promise(e => {
                this.get({url: t}, (t, s, i) => e(i))
            })
        }

        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), n = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: {script_text: t, mock_type: "cron", timeout: r},
                    headers: {"X-Key": o, Accept: "*/*"}
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e);
                if (!s && !i) return {};
                {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i) if (r = Object(r)[t], void 0 === r) return s;
            return r
        }

        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if (r) try {
                    const t = JSON.parse(r);
                    e = t ? this.lodash_get(t, i, "") : e
                } catch (t) {
                    e = ""
                }
            }
            return e
        }

        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }

        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        get(t, e = (() => {
        })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    if (t.headers["set-cookie"]) {
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch (t) {
                    this.logErr(t)
                }
            }).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => {
                const {message: s, response: i} = t;
                e(s, i, i && i.body)
            }))
        }

        post(t, e = (() => {
        })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t)); else if (this.isNode()) {
                this.initGotEnv(t);
                const {url: s, ...i} = t;
                this.got.post(s, i).then(t => {
                    const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                    e(null, {status: s, statusCode: i, headers: r, body: o}, o)
                }, t => {
                    const {message: s, response: i} = t;
                    e(s, i, i && i.body)
                })
            }
        }

        time(t, e = null) {
            const s = e ? new Date(e) : new Date;
            let i = {
                "M+": s.getMonth() + 1,
                "d+": s.getDate(),
                "H+": s.getHours(),
                "m+": s.getMinutes(),
                "s+": s.getSeconds(),
                "q+": Math.floor((s.getMonth() + 3) / 3),
                S: s.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }

        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {"open-url": t} : this.isSurge() ? {url: t} : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"];
                        return {openUrl: e, mediaUrl: s}
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl;
                        return {"open-url": e, "media-url": s}
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {url: e}
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }

        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}) {
            const e = (new Date).getTime(), s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}
