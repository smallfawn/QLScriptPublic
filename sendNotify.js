/*
 * @Author: lxk0301 https://gitee.com/lxk0301
 * @Date: 2020-08-19 16:12:40
 * @Last Modified by: whyour
 * @Last Modified time: 2021-5-1 15:00:54
 * sendNotify 推送通知功能
 * @param text 通知头
 * @param desp 通知体
 * @param params 某些推送通知方式点击弹窗可跳转, 例：{ url: 'https://abc.com' }
 * @param author 作者仓库等信息  例：`本通知 By：https://github.com/whyour/qinglong`
 */

const querystring = require('querystring');
const got = require('got');
const $ = new Env();
const timeout = 15000; //超时时间(单位毫秒)
// =======================================gotify通知设置区域==============================================
//gotify_url 填写gotify地址,如https://push.example.de:8080
//gotify_token 填写gotify的消息应用token
//gotify_priority 填写推送消息优先级,默认为0
let GOTIFY_URL = '';
let GOTIFY_TOKEN = '';
let GOTIFY_PRIORITY = 0;
// =======================================go-cqhttp通知设置区域===========================================
//gobot_url 填写请求地址http://127.0.0.1/send_private_msg
//gobot_token 填写在go-cqhttp文件设置的访问密钥
//gobot_qq 填写推送到个人QQ或者QQ群号
//go-cqhttp相关API https://docs.go-cqhttp.org/api
let GOBOT_URL = ''; // 推送到个人QQ: http://127.0.0.1/send_private_msg  群：http://127.0.0.1/send_group_msg
let GOBOT_TOKEN = ''; //访问密钥
let GOBOT_QQ = ''; // 如果GOBOT_URL设置 /send_private_msg 则需要填入 user_id=个人QQ 相反如果是 /send_group_msg 则需要填入 group_id=QQ群

// =======================================微信server酱通知设置区域===========================================
//此处填你申请的SCKEY.
//(环境变量名 PUSH_KEY)
let SCKEY = '';

// =======================================PushDeer通知设置区域===========================================
//此处填你申请的PushDeer KEY.
//(环境变量名 DEER_KEY)
let PUSHDEER_KEY = '';
let PUSHDEER_URL = '';

// =======================================Synology Chat通知设置区域===========================================
//此处填你申请的CHAT_URL与CHAT_TOKEN
//(环境变量名 CHAT_URL CHAT_TOKEN)
let CHAT_URL = '';
let CHAT_TOKEN = '';

// =======================================Bark App通知设置区域===========================================
//此处填你BarkAPP的信息(IP/设备码，例如：https://api.day.app/XXXXXXXX)
let BARK_PUSH = '';
//BARK app推送图标,自定义推送图标(需iOS15或以上)
let BARK_ICON = 'https://qn.whyour.cn/logo.png';
//BARK app推送铃声,铃声列表去APP查看复制填写
let BARK_SOUND = '';
//BARK app推送消息的分组, 默认为"QingLong"
let BARK_GROUP = 'QingLong';
//BARK app推送消息的时效性, 默认为"active"
let BARK_LEVEL = 'active';
//BARK app推送消息的跳转URL
let BARK_URL = '';

// =======================================telegram机器人通知设置区域===========================================
//此处填你telegram bot 的Token，telegram机器人通知推送必填项.例如：1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw
//(环境变量名 TG_BOT_TOKEN)
let TG_BOT_TOKEN = '';
//此处填你接收通知消息的telegram用户的id，telegram机器人通知推送必填项.例如：129xxx206
//(环境变量名 TG_USER_ID)
let TG_USER_ID = '';
//tg推送HTTP代理设置(不懂可忽略,telegram机器人通知推送功能中非必填)
let TG_PROXY_HOST = ''; //例如:127.0.0.1(环境变量名:TG_PROXY_HOST)
let TG_PROXY_PORT = ''; //例如:1080(环境变量名:TG_PROXY_PORT)
let TG_PROXY_AUTH = ''; //tg代理配置认证参数
//Telegram api自建的反向代理地址(不懂可忽略,telegram机器人通知推送功能中非必填),默认tg官方api(环境变量名:TG_API_HOST)
let TG_API_HOST = 'api.telegram.org';
// =======================================钉钉机器人通知设置区域===========================================
//此处填你钉钉 bot 的webhook，例如：5a544165465465645d0f31dca676e7bd07415asdasd
//(环境变量名 DD_BOT_TOKEN)
let DD_BOT_TOKEN = '';
//密钥，机器人安全设置页面，加签一栏下面显示的SEC开头的字符串
let DD_BOT_SECRET = '';

// =======================================企业微信基础设置===========================================
// 企业微信反向代理地址
//(环境变量名 QYWX_ORIGIN)
let QYWX_ORIGIN = '';
// =======================================企业微信机器人通知设置区域===========================================
//此处填你企业微信机器人的 webhook(详见文档 https://work.weixin.qq.com/api/doc/90000/90136/91770)，例如：693a91f6-7xxx-4bc4-97a0-0ec2sifa5aaa
//(环境变量名 QYWX_KEY)
let QYWX_KEY = '';

// =======================================企业微信应用消息通知设置区域===========================================
/*
 此处填你企业微信应用消息的值(详见文档 https://work.weixin.qq.com/api/doc/90000/90135/90236)
 环境变量名 QYWX_AM依次填入 corpid,corpsecret,touser(注:多个成员ID使用|隔开),agentid,消息类型(选填,不填默认文本消息类型)
 注意用,号隔开(英文输入法的逗号)，例如：wwcff56746d9adwers,B-791548lnzXBE6_BWfxdf3kSTMJr9vFEPKAbh6WERQ,mingcheng,1000001,2COXgjH2UIfERF2zxrtUOKgQ9XklUqMdGSWLBoW_lSDAdafat
 可选推送消息类型(推荐使用图文消息（mpnews）):
 - 文本卡片消息: 0 (数字零)
 - 文本消息: 1 (数字一)
 - 图文消息（mpnews）: 素材库图片id, 可查看此教程(http://note.youdao.com/s/HMiudGkb)或者(https://note.youdao.com/ynoteshare1/index.html?id=1a0c8aff284ad28cbd011b29b3ad0191&type=note)
 */
let QYWX_AM = '';

// =======================================iGot聚合推送通知设置区域===========================================
//此处填您iGot的信息(推送key，例如：https://push.hellyw.com/XXXXXXXX)
let IGOT_PUSH_KEY = '';

// =======================================push+设置区域=======================================
//官方文档：http://www.pushplus.plus/
//PUSH_PLUS_TOKEN：微信扫码登录后一对一推送或一对多推送下面的token(您的Token)，不提供PUSH_PLUS_USER则默认为一对一推送
//PUSH_PLUS_USER： 一对多推送的“群组编码”（一对多推送下面->您的群组(如无则新建)->群组编码，如果您是创建群组人。也需点击“查看二维码”扫描绑定，否则不能接受群组消息推送）
let PUSH_PLUS_TOKEN = '';
let PUSH_PLUS_USER = '';

// =======================================Cool Push设置区域=======================================
//官方文档：https://cp.xuthus.cc/docs
//QQ_SKEY: Cool Push登录授权后推送消息的调用代码Skey
//QQ_MODE: 推送模式详情请登录获取QQ_SKEY后见https://cp.xuthus.cc/feat
let QQ_SKEY = '';
let QQ_MODE = '';

// =======================================智能微秘书设置区域=======================================
//官方文档：http://wechat.aibotk.com/docs/about
//AIBOTK_KEY： 填写智能微秘书个人中心的apikey
//AIBOTK_TYPE：填写发送的目标 room 或 contact, 填其他的不生效
//AIBOTK_NAME: 填写群名或用户昵称，和上面的type类型要对应
let AIBOTK_KEY = '';
let AIBOTK_TYPE = '';
let AIBOTK_NAME = '';

// =======================================飞书机器人设置区域=======================================
//官方文档：https://www.feishu.cn/hc/zh-CN/articles/360024984973
//FSKEY 飞书机器人的 FSKEY
let FSKEY = '';

// =======================================SMTP 邮件设置区域=======================================
// SMTP_SERVER: 填写 SMTP 发送邮件服务器，形如 smtp.exmail.qq.com:465
// SMTP_SSL: 填写 SMTP 发送邮件服务器是否使用 SSL，内容应为 true 或 false
// SMTP_EMAIL: 填写 SMTP 收发件邮箱，通知将会由自己发给自己
// SMTP_PASSWORD: 填写 SMTP 登录密码，也可能为特殊口令，视具体邮件服务商说明而定
// SMTP_NAME: 填写 SMTP 收发件人姓名，可随意填写
let SMTP_SERVER = '';
let SMTP_SSL = 'false';
let SMTP_EMAIL = '';
let SMTP_PASSWORD = '';
let SMTP_NAME = '';

// =======================================PushMe通知设置区域===========================================
//官方文档：https://push.i-i.me/
//此处填你的PushMe KEY.
let PUSHME_KEY = '';

// =======================================CHRONOCAT通知设置区域===========================================
// CHRONOCAT_URL Red协议连接地址 例： http://127.0.0.1:16530
// CHRONOCAT_TOKEN 填写在CHRONOCAT文件生成的访问密钥
// CHRONOCAT_QQ 个人:user_id=个人QQ 群则填入group_id=QQ群 多个用英文;隔开同时支持个人和群
// CHRONOCAT相关API https://chronocat.vercel.app/install/docker/official/
let CHRONOCAT_URL = ''; // CHRONOCAT Red协议连接地址
let CHRONOCAT_TOKEN = ''; //CHRONOCAT 生成的访问密钥
let CHRONOCAT_QQ = ''; // 个人:user_id=个人QQ 群则填入group_id=QQ群 多个用英文;隔开同时支持个人和群 如：user_id=xxx;group_id=xxxx;group_id=xxxxx

// =======================================自定义通知设置区域=======================================
// 自定义通知 接收回调的URL
let WEBHOOK_URL = '';
let WEBHOOK_BODY = '';
let WEBHOOK_HEADERS = '';
let WEBHOOK_METHOD = '';
let WEBHOOK_CONTENT_TYPE = '';

//==========================云端环境变量的判断与接收=========================
if (process.env.GOTIFY_URL) {
    GOTIFY_URL = process.env.GOTIFY_URL;
}
if (process.env.GOTIFY_TOKEN) {
    GOTIFY_TOKEN = process.env.GOTIFY_TOKEN;
}
if (process.env.GOTIFY_PRIORITY) {
    GOTIFY_PRIORITY = process.env.GOTIFY_PRIORITY;
}

if (process.env.GOBOT_URL) {
    GOBOT_URL = process.env.GOBOT_URL;
}
if (process.env.GOBOT_TOKEN) {
    GOBOT_TOKEN = process.env.GOBOT_TOKEN;
}
if (process.env.GOBOT_QQ) {
    GOBOT_QQ = process.env.GOBOT_QQ;
}

if (process.env.PUSH_KEY) {
    SCKEY = process.env.PUSH_KEY;
}

if (process.env.DEER_KEY) {
    PUSHDEER_KEY = process.env.DEER_KEY;
    PUSHDEER_URL = process.env.DEER_URL;
}

if (process.env.CHAT_URL) {
    CHAT_URL = process.env.CHAT_URL;
}

if (process.env.CHAT_TOKEN) {
    CHAT_TOKEN = process.env.CHAT_TOKEN;
}

if (process.env.QQ_SKEY) {
    QQ_SKEY = process.env.QQ_SKEY;
}

if (process.env.QQ_MODE) {
    QQ_MODE = process.env.QQ_MODE;
}

if (process.env.BARK_PUSH) {
    if (
        process.env.BARK_PUSH.indexOf('https') > -1 ||
        process.env.BARK_PUSH.indexOf('http') > -1
    ) {
        //兼容BARK自建用户
        BARK_PUSH = process.env.BARK_PUSH;
    } else {
        BARK_PUSH = `https://api.day.app/${process.env.BARK_PUSH}`;
    }
    if (process.env.BARK_ICON) {
        BARK_ICON = process.env.BARK_ICON;
    }
    if (process.env.BARK_SOUND) {
        BARK_SOUND = process.env.BARK_SOUND;
    }
    if (process.env.BARK_GROUP) {
        BARK_GROUP = process.env.BARK_GROUP;
    }
    if (process.env.BARK_LEVEL) {
        BARK_LEVEL = process.env.BARK_LEVEL;
    }
    if (process.env.BARK_URL) {
        BARK_URL = process.env.BARK_URL;
    }
} else {
    if (
        BARK_PUSH &&
        BARK_PUSH.indexOf('https') === -1 &&
        BARK_PUSH.indexOf('http') === -1
    ) {
        //兼容BARK本地用户只填写设备码的情况
        BARK_PUSH = `https://api.day.app/${BARK_PUSH}`;
    }
}
if (process.env.TG_BOT_TOKEN) {
    TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
}
if (process.env.TG_USER_ID) {
    TG_USER_ID = process.env.TG_USER_ID;
}
if (process.env.TG_PROXY_AUTH) TG_PROXY_AUTH = process.env.TG_PROXY_AUTH;
if (process.env.TG_PROXY_HOST) TG_PROXY_HOST = process.env.TG_PROXY_HOST;
if (process.env.TG_PROXY_PORT) TG_PROXY_PORT = process.env.TG_PROXY_PORT;
if (process.env.TG_API_HOST) TG_API_HOST = process.env.TG_API_HOST;

if (process.env.DD_BOT_TOKEN) {
    DD_BOT_TOKEN = process.env.DD_BOT_TOKEN;
    if (process.env.DD_BOT_SECRET) {
        DD_BOT_SECRET = process.env.DD_BOT_SECRET;
    }
}

if (process.env.QYWX_ORIGIN) {
    QYWX_ORIGIN = process.env.QYWX_ORIGIN;
} else {
    QYWX_ORIGIN = 'https://qyapi.weixin.qq.com';
}

if (process.env.QYWX_KEY) {
    QYWX_KEY = process.env.QYWX_KEY;
}

if (process.env.QYWX_AM) {
    QYWX_AM = process.env.QYWX_AM;
}

if (process.env.IGOT_PUSH_KEY) {
    IGOT_PUSH_KEY = process.env.IGOT_PUSH_KEY;
}

if (process.env.PUSH_PLUS_TOKEN) {
    PUSH_PLUS_TOKEN = process.env.PUSH_PLUS_TOKEN;
}
if (process.env.PUSH_PLUS_USER) {
    PUSH_PLUS_USER = process.env.PUSH_PLUS_USER;
}

if (process.env.AIBOTK_KEY) {
    AIBOTK_KEY = process.env.AIBOTK_KEY;
}
if (process.env.AIBOTK_TYPE) {
    AIBOTK_TYPE = process.env.AIBOTK_TYPE;
}
if (process.env.AIBOTK_NAME) {
    AIBOTK_NAME = process.env.AIBOTK_NAME;
}

if (process.env.FSKEY) {
    FSKEY = process.env.FSKEY;
}

if (process.env.SMTP_SERVER) {
    SMTP_SERVER = process.env.SMTP_SERVER;
}
if (process.env.SMTP_SSL) {
    SMTP_SSL = process.env.SMTP_SSL;
}
if (process.env.SMTP_EMAIL) {
    SMTP_EMAIL = process.env.SMTP_EMAIL;
}
if (process.env.SMTP_PASSWORD) {
    SMTP_PASSWORD = process.env.SMTP_PASSWORD;
}
if (process.env.SMTP_NAME) {
    SMTP_NAME = process.env.SMTP_NAME;
}
if (process.env.PUSHME_KEY) {
    PUSHME_KEY = process.env.PUSHME_KEY;
}

if (process.env.CHRONOCAT_URL) {
    CHRONOCAT_URL = process.env.CHRONOCAT_URL;
}
if (process.env.CHRONOCAT_QQ) {
    CHRONOCAT_QQ = process.env.CHRONOCAT_QQ;
}
if (process.env.CHRONOCAT_TOKEN) {
    CHRONOCAT_TOKEN = process.env.CHRONOCAT_TOKEN;
}

if (process.env.WEBHOOK_URL) {
    WEBHOOK_URL = process.env.WEBHOOK_URL;
}
if (process.env.WEBHOOK_BODY) {
    WEBHOOK_BODY = process.env.WEBHOOK_BODY;
}
if (process.env.WEBHOOK_HEADERS) {
    WEBHOOK_HEADERS = process.env.WEBHOOK_HEADERS;
}
if (process.env.WEBHOOK_METHOD) {
    WEBHOOK_METHOD = process.env.WEBHOOK_METHOD;
}
if (process.env.WEBHOOK_CONTENT_TYPE) {
    WEBHOOK_CONTENT_TYPE = process.env.WEBHOOK_CONTENT_TYPE;
}
//==========================云端环境变量的判断与接收=========================

/**
 * sendNotify 推送通知功能
 * @param text 通知头
 * @param desp 通知体
 * @param params 某些推送通知方式点击弹窗可跳转, 例：{ url: 'https://abc.com' }
 * @param author 作者仓库等信息  例：`本通知 By：https://github.com/whyour/qinglong`
 * @returns {Promise<unknown>}
 */
async function sendNotify(
    text,
    desp,
    params = {},
    author = '\n\n本通知 By：https://github.com/whyour/qinglong',
) {
    let pushType = ["smallfawnPushWhite", "smallfawnPushBlack", 'default']
    /* 判断 黑白名单 或默认模式 */
    function checkSmallfawnPushType() {
        if (process.env.hasOwnProperty(pushType[0]) !== false) {
            return pushType[0];
        } else if (process.env.hasOwnProperty(pushType[1]) !== false) {
            return pushType[1];
        } else {
            return pushType[2];
        }
    }
    /**
     * 检测 smallfawnPushWhite 或 smallfawnPushBlack 的变量
     * @param {*} variable  smallfawnPushWhite 或 smallfawnPushBlack
     * @returns 数组
     */
    function checkSmallfawnPush(variable) {
        if (typeof variable === 'string') {
            if (variable.includes('&') || variable.includes('#') || variable.includes('@')) {
                return variable.split(/[&#@]/);
            } else {
                return [variable];
            }
        } else if (typeof variable === 'number') {
            return [variable.toString()];
        } else {
            return [];
        }
    }

    let type = checkSmallfawnPushType()

    console.log(`\n\n============================================`)
    // 主要 //
    //判断是否是默认通知方式
    if (type !== pushType[2]) {
        //判断数组长度
        if (checkSmallfawnPush(process.env[type]).length == 0) {
            console.log(`通知变量[${type}] 无变量值 默认形式发送 脚本名字[${text}]\n如果需要请填写脚本名字到通知变量  @或&或#为 分隔符`);
            await send()
        } else {
            //判断黑白名单模式
            if (type == pushType[0]) {
                console.log(`通知变量为白名单模式`);
                if (checkSmallfawnPush(process.env[pushType[0]]).includes(text)) {
                    console.log(`脚本名字[${text}] 在 通知变量白名单[${type}] 变量中 => 通知`);
                    await send();
                } else {
                    console.log(`脚本名字[${text}] 不在 通知变量白名单[${type}] 变量中 => 不通知`)
                }
            } else if (type == pushType[1]) {
                console.log(`通知变量为黑名单模式`);
                if (checkSmallfawnPush(process.env[pushType[1]]).includes(text)) {
                    console.log(`脚本名字[${text}] 在 通知变量黑名单[${type}] 变量中 => 不通知`);
                } else {
                    console.log(`脚本名字[${text}] 不在 通知变量黑名单[${type}] 变量中 => 通知`)
                    await send();
                }
            }
        }
    } else {
        console.log(`无黑白名单变量 默认形式发送 脚本名字[${text}]`);
        console.log(`如需配置通知黑白名单请在环境变量或配置文件 添加变量白名单 ${pushType[0]} 或 黑名单 ${pushType[1]}二选一 @或&或#为 分隔符 填写脚本名字`);
        await send()
    }
    async function send() {
        //提供6种通知
        desp += author; //增加作者信息，防止被贩卖等

        // 根据标题跳过一些消息推送，环境变量：SKIP_PUSH_TITLE 用回车分隔
        let skipTitle = process.env.SKIP_PUSH_TITLE;
        if (skipTitle) {
            if (skipTitle.split('\n').includes(text)) {
                console.info(text + '在SKIP_PUSH_TITLE环境变量内，跳过推送！');
                return;
            }
        }

        await Promise.all([
            serverNotify(text, desp), //微信server酱
            pushPlusNotify(text, desp), //pushplus(推送加)
        ]);
        //由于上述两种微信通知需点击进去才能查看到详情，故text(标题内容)携带了账号序号以及昵称信息，方便不点击也可知道是哪个京东哪个活动
        text = text.match(/.*?(?=\s?-)/g) ? text.match(/.*?(?=\s?-)/g)[0] : text;
        await Promise.all([
            BarkNotify(text, desp, params), //iOS Bark APP
            tgBotNotify(text, desp), //telegram 机器人
            ddBotNotify(text, desp), //钉钉机器人
            qywxBotNotify(text, desp), //企业微信机器人
            qywxamNotify(text, desp), //企业微信应用消息推送
            iGotNotify(text, desp, params), //iGot
            gobotNotify(text, desp), //go-cqhttp
            gotifyNotify(text, desp), //gotify
            ChatNotify(text, desp), //synolog chat
            PushDeerNotify(text, desp), //PushDeer
            aibotkNotify(text, desp), //智能微秘书
            fsBotNotify(text, desp), //飞书机器人
            smtpNotify(text, desp), //SMTP 邮件
            PushMeNotify(text, desp, params), //PushMe
            ChronocatNotify(text, desp), // Chronocat
            webhookNotify(text, desp), //自定义通知
        ]);
    }

}

function gotifyNotify(text, desp) {
    return new Promise((resolve) => {
        if (GOTIFY_URL && GOTIFY_TOKEN) {
            const options = {
                url: `${GOTIFY_URL}/message?token=${GOTIFY_TOKEN}`,
                body: `title=${encodeURIComponent(text)}&message=${encodeURIComponent(
                    desp,
                )}&priority=${GOTIFY_PRIORITY}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('gotify发送通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.id) {
                            console.log('gotify发送通知消息成功🎉\n');
                        } else {
                            console.log(`${data.message}\n`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}

function gobotNotify(text, desp) {
    return new Promise((resolve) => {
        if (GOBOT_URL) {
            const options = {
                url: `${GOBOT_URL}?access_token=${GOBOT_TOKEN}&${GOBOT_QQ}`,
                json: { message: `${text}\n${desp}` },
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout,
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('发送go-cqhttp通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.retcode === 0) {
                            console.log('go-cqhttp发送通知消息成功🎉\n');
                        } else if (data.retcode === 100) {
                            console.log(`go-cqhttp发送通知消息异常: ${data.errmsg}\n`);
                        } else {
                            console.log(`go-cqhttp发送通知消息异常\n${JSON.stringify(data)}`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function serverNotify(text, desp) {
    return new Promise((resolve) => {
        if (SCKEY) {
            //微信server酱推送通知一个\n不会换行，需要两个\n才能换行，故做此替换
            desp = desp.replace(/[\n\r]/g, '\n\n');
            const options = {
                url: SCKEY.includes('SCT')
                    ? `https://sctapi.ftqq.com/${SCKEY}.send`
                    : `https://sc.ftqq.com/${SCKEY}.send`,
                body: `text=${text}&desp=${desp}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                timeout,
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('发送通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        //server酱和Server酱·Turbo版的返回json格式不太一样
                        if (data.errno === 0 || data.data.errno === 0) {
                            console.log('server酱发送通知消息成功🎉\n');
                        } else if (data.errno === 1024) {
                            // 一分钟内发送相同的内容会触发
                            console.log(`server酱发送通知消息异常: ${data.errmsg}\n`);
                        } else {
                            console.log(`server酱发送通知消息异常\n${JSON.stringify(data)}`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function PushDeerNotify(text, desp) {
    return new Promise((resolve) => {
        if (PUSHDEER_KEY) {
            // PushDeer 建议对消息内容进行 urlencode
            desp = encodeURI(desp);
            const options = {
                url: PUSHDEER_URL || `https://api2.pushdeer.com/message/push`,
                body: `pushkey=${PUSHDEER_KEY}&text=${text}&desp=${desp}&type=markdown`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                timeout,
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('发送通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        // 通过返回的result的长度来判断是否成功
                        if (
                            data.content.result.length !== undefined &&
                            data.content.result.length > 0
                        ) {
                            console.log('PushDeer发送通知消息成功🎉\n');
                        } else {
                            console.log(`PushDeer发送通知消息异常\n${JSON.stringify(data)}`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function ChatNotify(text, desp) {
    return new Promise((resolve) => {
        if (CHAT_URL && CHAT_TOKEN) {
            // 对消息内容进行 urlencode
            desp = encodeURI(desp);
            const options = {
                url: `${CHAT_URL}${CHAT_TOKEN}`,
                body: `payload={"text":"${text}\n${desp}"}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('发送通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.success) {
                            console.log('Chat发送通知消息成功🎉\n');
                        } else {
                            console.log(`Chat发送通知消息异常\n${JSON.stringify(data)}`);
                        }
                    }
                } catch (e) {
                    $.logErr(e);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function BarkNotify(text, desp, params = {}) {
    return new Promise((resolve) => {
        if (BARK_PUSH) {
            const options = {
                url: `${BARK_PUSH}/${encodeURIComponent(text)}/${encodeURIComponent(
                    desp,
                )}?icon=${BARK_ICON}&sound=${BARK_SOUND}&group=${BARK_GROUP}&level=${BARK_LEVEL}&url=${BARK_URL}&${querystring.stringify(
                    params,
                )}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                timeout,
            };
            $.get(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('Bark APP发送通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.code === 200) {
                            console.log('Bark APP发送通知消息成功🎉\n');
                        } else {
                            console.log(`${data.message}\n`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}

function tgBotNotify(text, desp) {
    return new Promise((resolve) => {
        if (TG_BOT_TOKEN && TG_USER_ID) {
            const options = {
                url: `https://${TG_API_HOST}/bot${TG_BOT_TOKEN}/sendMessage`,
                json: {
                    chat_id: `${TG_USER_ID}`,
                    text: `${text}\n\n${desp}`,
                    disable_web_page_preview: true,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout,
            };
            if (TG_PROXY_HOST && TG_PROXY_PORT) {
                const tunnel = require('tunnel');
                const agent = {
                    https: tunnel.httpsOverHttp({
                        proxy: {
                            host: TG_PROXY_HOST,
                            port: TG_PROXY_PORT * 1,
                            proxyAuth: TG_PROXY_AUTH,
                        },
                    }),
                };
                Object.assign(options, { agent });
            }
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('telegram发送通知消息失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.ok) {
                            console.log('Telegram发送通知消息成功🎉。\n');
                        } else if (data.error_code === 400) {
                            console.log(
                                '请主动给bot发送一条消息并检查接收用户ID是否正确。\n',
                            );
                        } else if (data.error_code === 401) {
                            console.log('Telegram bot token 填写错误。\n');
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}
function ddBotNotify(text, desp) {
    return new Promise((resolve) => {
        const options = {
            url: `https://oapi.dingtalk.com/robot/send?access_token=${DD_BOT_TOKEN}`,
            json: {
                msgtype: 'text',
                text: {
                    content: `${text}\n\n${desp}`,
                },
            },
            headers: {
                'Content-Type': 'application/json',
            },
            timeout,
        };
        if (DD_BOT_TOKEN && DD_BOT_SECRET) {
            const crypto = require('crypto');
            const dateNow = Date.now();
            const hmac = crypto.createHmac('sha256', DD_BOT_SECRET);
            hmac.update(`${dateNow}\n${DD_BOT_SECRET}`);
            const result = encodeURIComponent(hmac.digest('base64'));
            options.url = `${options.url}&timestamp=${dateNow}&sign=${result}`;
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('钉钉发送通知消息失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.errcode === 0) {
                            console.log('钉钉发送通知消息成功🎉。\n');
                        } else {
                            console.log(`${data.errmsg}\n`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else if (DD_BOT_TOKEN) {
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('钉钉发送通知消息失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.errcode === 0) {
                            console.log('钉钉发送通知消息完成。\n');
                        } else {
                            console.log(`${data.errmsg}\n`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function qywxBotNotify(text, desp) {
    return new Promise((resolve) => {
        const options = {
            url: `${QYWX_ORIGIN}/cgi-bin/webhook/send?key=${QYWX_KEY}`,
            json: {
                msgtype: 'text',
                text: {
                    content: `${text}\n\n${desp}`,
                },
            },
            headers: {
                'Content-Type': 'application/json',
            },
            timeout,
        };
        if (QYWX_KEY) {
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('企业微信发送通知消息失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.errcode === 0) {
                            console.log('企业微信发送通知消息成功🎉。\n');
                        } else {
                            console.log(`${data.errmsg}\n`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function ChangeUserId(desp) {
    const QYWX_AM_AY = QYWX_AM.split(',');
    if (QYWX_AM_AY[2]) {
        const userIdTmp = QYWX_AM_AY[2].split('|');
        let userId = '';
        for (let i = 0; i < userIdTmp.length; i++) {
            const count = '账号' + (i + 1);
            const count2 = '签到号 ' + (i + 1);
            if (desp.match(count2)) {
                userId = userIdTmp[i];
            }
        }
        if (!userId) userId = QYWX_AM_AY[2];
        return userId;
    } else {
        return '@all';
    }
}

function qywxamNotify(text, desp) {
    return new Promise((resolve) => {
        if (QYWX_AM) {
            const QYWX_AM_AY = QYWX_AM.split(',');
            const options_accesstoken = {
                url: `${QYWX_ORIGIN}/cgi-bin/gettoken`,
                json: {
                    corpid: `${QYWX_AM_AY[0]}`,
                    corpsecret: `${QYWX_AM_AY[1]}`,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout,
            };
            $.post(options_accesstoken, (err, resp, data) => {
                let html = desp.replace(/\n/g, '<br/>');
                let json = JSON.parse(data);
                let accesstoken = json.access_token;
                let options;

                switch (QYWX_AM_AY[4]) {
                    case '0':
                        options = {
                            msgtype: 'textcard',
                            textcard: {
                                title: `${text}`,
                                description: `${desp}`,
                                url: 'https://github.com/whyour/qinglong',
                                btntxt: '更多',
                            },
                        };
                        break;

                    case '1':
                        options = {
                            msgtype: 'text',
                            text: {
                                content: `${text}\n\n${desp}`,
                            },
                        };
                        break;

                    default:
                        options = {
                            msgtype: 'mpnews',
                            mpnews: {
                                articles: [
                                    {
                                        title: `${text}`,
                                        thumb_media_id: `${QYWX_AM_AY[4]}`,
                                        author: `智能助手`,
                                        content_source_url: ``,
                                        content: `${html}`,
                                        digest: `${desp}`,
                                    },
                                ],
                            },
                        };
                }
                if (!QYWX_AM_AY[4]) {
                    //如不提供第四个参数,则默认进行文本消息类型推送
                    options = {
                        msgtype: 'text',
                        text: {
                            content: `${text}\n\n${desp}`,
                        },
                    };
                }
                options = {
                    url: `${QYWX_ORIGIN}/cgi-bin/message/send?access_token=${accesstoken}`,
                    json: {
                        touser: `${ChangeUserId(desp)}`,
                        agentid: `${QYWX_AM_AY[3]}`,
                        safe: '0',
                        ...options,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };

                $.post(options, (err, resp, data) => {
                    try {
                        if (err) {
                            console.log(
                                '成员ID:' +
                                ChangeUserId(desp) +
                                '企业微信应用消息发送通知消息失败！！\n',
                            );
                            console.log(err);
                        } else {
                            data = JSON.parse(data);
                            if (data.errcode === 0) {
                                console.log(
                                    '成员ID:' +
                                    ChangeUserId(desp) +
                                    '企业微信应用消息发送通知消息成功🎉。\n',
                                );
                            } else {
                                console.log(`${data.errmsg}\n`);
                            }
                        }
                    } catch (e) {
                        $.logErr(e, resp);
                    } finally {
                        resolve(data);
                    }
                });
            });
        } else {
            resolve();
        }
    });
}

function iGotNotify(text, desp, params = {}) {
    return new Promise((resolve) => {
        if (IGOT_PUSH_KEY) {
            // 校验传入的IGOT_PUSH_KEY是否有效
            const IGOT_PUSH_KEY_REGX = new RegExp('^[a-zA-Z0-9]{24}$');
            if (!IGOT_PUSH_KEY_REGX.test(IGOT_PUSH_KEY)) {
                console.log('您所提供的IGOT_PUSH_KEY无效\n');
                resolve();
                return;
            }
            const options = {
                url: `https://push.hellyw.com/${IGOT_PUSH_KEY.toLowerCase()}`,
                body: `title=${text}&content=${desp}&${querystring.stringify(params)}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                timeout,
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('发送通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        if (typeof data === 'string') data = JSON.parse(data);
                        if (data.ret === 0) {
                            console.log('iGot发送通知消息成功🎉\n');
                        } else {
                            console.log(`iGot发送通知消息失败：${data.errMsg}\n`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function pushPlusNotify(text, desp) {
    return new Promise((resolve) => {
        if (PUSH_PLUS_TOKEN) {
            desp = desp.replace(/[\n\r]/g, '<br>'); // 默认为html, 不支持plaintext
            const body = {
                token: `${PUSH_PLUS_TOKEN}`,
                title: `${text}`,
                content: `${desp}`,
                topic: `${PUSH_PLUS_USER}`,
            };
            const options = {
                url: `https://www.pushplus.plus/send`,
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': ' application/json',
                },
                timeout,
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log(
                            `push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'
                            }通知消息失败！！\n`,
                        );
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.code === 200) {
                            console.log(
                                `push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'
                                }通知消息完成。\n`,
                            );
                        } else {
                            console.log(
                                `push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'
                                }通知消息失败：${data.msg}\n`,
                            );
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function aibotkNotify(text, desp) {
    return new Promise((resolve) => {
        if (AIBOTK_KEY && AIBOTK_TYPE && AIBOTK_NAME) {
            let json = {};
            let url = '';
            switch (AIBOTK_TYPE) {
                case 'room':
                    url = 'https://api-bot.aibotk.com/openapi/v1/chat/room';
                    json = {
                        apiKey: `${AIBOTK_KEY}`,
                        roomName: `${AIBOTK_NAME}`,
                        message: {
                            type: 1,
                            content: `【青龙快讯】\n\n${text}\n${desp}`,
                        },
                    };
                    break;
                case 'contact':
                    url = 'https://api-bot.aibotk.com/openapi/v1/chat/contact';
                    json = {
                        apiKey: `${AIBOTK_KEY}`,
                        name: `${AIBOTK_NAME}`,
                        message: {
                            type: 1,
                            content: `【青龙快讯】\n\n${text}\n${desp}`,
                        },
                    };
                    break;
            }
            const options = {
                url: url,
                json,
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout,
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('智能微秘书发送通知消息失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            console.log('智能微秘书发送通知消息成功🎉。\n');
                        } else {
                            console.log(`${data.error}\n`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function fsBotNotify(text, desp) {
    return new Promise((resolve) => {
        if (FSKEY) {
            const options = {
                url: `https://open.feishu.cn/open-apis/bot/v2/hook/${FSKEY}`,
                json: { msg_type: 'text', content: { text: `${text}\n\n${desp}` } },
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout,
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('发送通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.StatusCode === 0) {
                            console.log('飞书发送通知消息成功🎉\n');
                        } else {
                            console.log(`${data.msg}\n`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

async function smtpNotify(text, desp) {
    if (![SMTP_SERVER, SMTP_EMAIL, SMTP_PASSWORD].every(Boolean)) {
        return;
    }

    try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport(
            `${SMTP_SSL === 'true' ? 'smtps:' : 'smtp:'}//${SMTP_SERVER}`,
            {
                auth: {
                    user: SMTP_EMAIL,
                    pass: SMTP_PASSWORD,
                },
            },
        );

        const addr = SMTP_NAME ? `"${SMTP_NAME}" <${SMTP_EMAIL}>` : SMTP_EMAIL;
        const info = await transporter.sendMail({
            from: addr,
            to: addr,
            subject: text,
            text: desp,
        });

        if (!!info.messageId) {
            console.log('SMTP发送通知消息成功🎉\n');
            return true;
        }
        console.log('SMTP发送通知消息失败！！\n');
    } catch (e) {
        console.log('SMTP发送通知消息出现错误！！\n');
        console.log(e);
    }
}

function smtpNotify(text, desp) {
    return new Promise((resolve) => {
        if (SMTP_SERVER && SMTP_SSL && SMTP_EMAIL && SMTP_PASSWORD && SMTP_NAME) {
            // todo: Node.js并没有内置的 smtp 实现，需要调用外部库，因为不清楚这个文件的模块依赖情况，所以留给有缘人实现
        } else {
            resolve();
        }
    });
}

function PushMeNotify(text, desp, params = {}) {
    return new Promise((resolve) => {
        if (PUSHME_KEY) {
            const options = {
                url: `https://push.i-i.me?push_key=${PUSHME_KEY}`,
                json: { title: text, content: desp, ...params },
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout,
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('PushMeNotify发送通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        if (data === 'success') {
                            console.log('PushMe发送通知消息成功🎉\n');
                        } else {
                            console.log(`${data}\n`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function ChronocatNotify(title, desp) {
    return new Promise((resolve) => {
        if (!CHRONOCAT_TOKEN || !CHRONOCAT_QQ || !CHRONOCAT_URL) {
            console.log(
                'CHRONOCAT 服务的 CHRONOCAT_URL 或 CHRONOCAT_QQ 未设置!!\n取消推送',
            );
            resolve();
            return;
        }

        console.log('CHRONOCAT 服务启动');
        const user_ids = CHRONOCAT_QQ.match(/user_id=(\d+)/g)?.map(
            (match) => match.split('=')[1],
        );
        const group_ids = CHRONOCAT_QQ.match(/group_id=(\d+)/g)?.map(
            (match) => match.split('=')[1],
        );

        const url = `${CHRONOCAT_URL}/api/message/send`;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CHRONOCAT_TOKEN}`,
        };

        for (const [chat_type, ids] of [
            [1, user_ids],
            [2, group_ids],
        ]) {
            if (!ids) {
                continue;
            }
            for (const chat_id of ids) {
                const data = {
                    peer: {
                        chatType: chat_type,
                        peerUin: chat_id,
                    },
                    elements: [
                        {
                            elementType: 1,
                            textElement: {
                                content: `${title}\n\n${desp}`,
                            },
                        },
                    ],
                };
                const options = {
                    url: url,
                    json: data,
                    headers,
                    timeout,
                };
                $.post(options, (err, resp, data) => {
                    try {
                        if (err) {
                            console.log('Chronocat发送QQ通知消息失败！！\n');
                            console.log(err);
                        } else {
                            data = JSON.parse(data);
                            if (chat_type === 1) {
                                console.log(`QQ个人消息:${ids}推送成功！`);
                            } else {
                                console.log(`QQ群消息:${ids}推送成功！`);
                            }
                        }
                    } catch (e) {
                        $.logErr(e, resp);
                    } finally {
                        resolve(data);
                    }
                });
            }
        }
    });
}

function webhookNotify(text, desp) {
    return new Promise((resolve) => {
        const { formatBody, formatUrl } = formatNotifyContentFun(
            WEBHOOK_URL,
            WEBHOOK_BODY,
            text,
            desp,
        );
        if (!formatUrl && !formatBody) {
            resolve();
            return;
        }
        const headers = parseHeaders(WEBHOOK_HEADERS);
        const body = parseBody(formatBody, WEBHOOK_CONTENT_TYPE);
        const bodyParam = formatBodyFun(WEBHOOK_CONTENT_TYPE, body);
        const options = {
            method: WEBHOOK_METHOD,
            headers,
            allowGetBody: true,
            ...bodyParam,
            timeout,
            retry: 1,
        };

        if (WEBHOOK_METHOD) {
            got(formatUrl, options).then((resp) => {
                try {
                    if (resp.statusCode !== 200) {
                        console.log('自定义发送通知消息失败！！\n');
                        console.log(resp.body);
                    } else {
                        console.log('自定义发送通知消息成功🎉。\n');
                        console.log(resp.body);
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(resp.body);
                }
            });
        } else {
            resolve();
        }
    });
}

function parseHeaders(headers) {
    if (!headers) return {};

    const parsed = {};
    let key;
    let val;
    let i;

    headers &&
        headers.split('\n').forEach(function parser(line) {
            i = line.indexOf(':');
            key = line.substring(0, i).trim().toLowerCase();
            val = line.substring(i + 1).trim();

            if (!key) {
                return;
            }

            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        });

    return parsed;
}

function parseBody(body, contentType) {
    if (!body) return '';

    const parsed = {};
    let key;
    let val;
    let i;

    body &&
        body.split('\n').forEach(function parser(line) {
            i = line.indexOf(':');
            key = line.substring(0, i).trim().toLowerCase();
            val = line.substring(i + 1).trim();

            if (!key || parsed[key]) {
                return;
            }

            try {
                const jsonValue = JSON.parse(val);
                parsed[key] = jsonValue;
            } catch (error) {
                parsed[key] = val;
            }
        });

    switch (contentType) {
        case 'multipart/form-data':
            return Object.keys(parsed).reduce((p, c) => {
                p.append(c, parsed[c]);
                return p;
            }, new FormData());
        case 'application/x-www-form-urlencoded':
            return Object.keys(parsed).reduce((p, c) => {
                return p ? `${p}&${c}=${parsed[c]}` : `${c}=${parsed[c]}`;
            });
    }

    return parsed;
}

function formatBodyFun(contentType, body) {
    if (!body) return {};
    switch (contentType) {
        case 'application/json':
            return { json: body };
        case 'multipart/form-data':
            return { form: body };
        case 'application/x-www-form-urlencoded':
            return { body };
    }
    return {};
}

function formatNotifyContentFun(url, body, title, content) {
    if (!url.includes('$title') && !body.includes('$title')) {
        return {};
    }

    return {
        formatUrl: url
            .replaceAll('$title', encodeURIComponent(title))
            .replaceAll('$content', encodeURIComponent(content)),
        formatBody: body
            .replaceAll('$title', title)
            .replaceAll('$content', content),
    };
}

module.exports = {
    sendNotify,
    BARK_PUSH,
};

// prettier-ignore
function Env(t, s) { return new class { constructor(t, s) { this.name = t, this.data = null, this.dataFile = "box.dat", this.logs = [], this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, s), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } getScript(t) { return new Promise(s => { $.get({ url: t }, (t, e, i) => s(i)) }) } runScript(t, s) { return new Promise(e => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); o = o ? 1 * o : 20, o = s && s.timeout ? s.timeout : o; const [h, a] = i.split("@"), r = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": h, Accept: "*/*" } }; $.post(r, (t, s, i) => e(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (o = Object(o)[t], void 0 === o) return e; return o } lodash_set(t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}, t)[s[s.length - 1]] = e, t) } getdata(t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata(t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? "null" === h ? null : h || "{}" : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), e = this.setval(JSON.stringify(s), i) } catch (s) { const h = {}; this.lodash_set(h, o, t), e = this.setval(JSON.stringify(h), i) } } else e = $.setval(t, s); return e } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, s) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, s) : this.isQuanX() ? $prefs.setValueForKey(t, s) : this.isNode() ? (this.data = this.loaddata(), this.data[s] = t, this.writedata(), !0) : this.data && this.data[s] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, s = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? $httpClient.get(t, (t, e, i) => { !t && e && (e.body = i, e.statusCode = e.status), s(t, e, i) }) : this.isQuanX() ? $task.fetch(t).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t)) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, s) => { try { const e = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(e, null), s.cookieJar = this.ckjar } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t))) } post(t, s = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) $httpClient.post(t, (t, e, i) => { !t && e && (e.body = i, e.statusCode = e.status), s(t, e, i) }); else if (this.isQuanX()) t.method = "POST", $task.fetch(t).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: e, ...i } = t; this.got.post(e, i).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t)) } } time(t) { let s = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = t => !t || !this.isLoon() && this.isSurge() ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; $.isMute || (this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o))), this.logs.push("", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="), this.logs.push(s), e && this.logs.push(e), i && this.logs.push(i) } log(...t) { t.length > 0 ? this.logs = [...this.logs, ...t] : console.log(this.logs.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? $.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : $.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(s => setTimeout(s, t)) } done(t = {}) { const s = (new Date).getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, s) }
