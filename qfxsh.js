/*
地址：

#小程序://起飞线/x8h0xqNEoODRlyg

复制以上 微信打开

点击我的并抓包，
抓取https://cluster.qifeixian.com/api/user/v1/center/info，此链接请求头的x-ds-key和返回报文体中的id
变量export qfxhd='x-ds-key&id'
多账号@隔开
export qfxhd='x-ds-key&id@x-ds-key&id'
*/
// corn 0 */3 * * *

const $ = new Env('起飞线生活');
const axios = require('axios');
let request = require("request");
request = request.defaults({
    jar: true
});
const {
    log
} = console;
const Notify = 1; //0为关闭通知，1为打开通知,默认为1
const debug = 0; //0为关闭调试，1为打开调试,默认为0
let qfxhd = ($.isNode() ? process.env.qfxhd : $.getdata("qfxhd")) || ""
let qfxhdArr = [];
let data = '';
let msg = '';
var hours = new Date().getMonth();
var timestamp = Math.round(new Date().getTime()).toString();
//---------------------- 自定义变量区域 -----------------------------------
let host = 'cluster.qifeixian.com'
let userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.42(0x18002a29) NetType/WIFI Language/zh_CN'
let xdPort = '1380'
let baseVersion = '3.1.2'
let version = '5.0.13'
let connection = 'keep-alive'
let contentType = 'application/json'
let acceptEncoding = 'gzip,compress,br,deflate'
let referer = 'https://servicewechat.com/wx3c0d10f34c013209/258/page-frame.html'
//-----------------------------------------------------------------------
!(async () => {
    if (typeof $request !== "undefined") {
        await GetRewrite();
    } else {
        if (!(await Envs()))
            return;
        else {

            addNotifyStr(`\n\n=============================================    \n脚本执行 - 北京时间(UTC+8)：${new Date(
                new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
                8 * 60 * 60 * 1000).toLocaleString()} \n=============================================\n`);



            addNotifyStr(`\n=================== 共找到 ${qfxhdArr.length} 个账号 ===================`)
            if (debug) {
                log(`【debug】 这是你的全部账号数组:\n ${qfxhdArr}`);
            }
            for (let index = 0; index < qfxhdArr.length; index++) {

                let num = index + 1
                addNotifyStr(`\n==== 开始【第 ${num} 个账号】====\n`, true)

                qfx = qfxhdArr[index];
                qfxhd = qfx.split('&')[0];
                // log("00:" + qfxhd);
                userId = qfx.split('&')[1];
                // log("11:" + userId);
                restoken = qfxhd.match(/\.(.*?)\./)[1]
                restoken = JSON.parse(Buffer.from(restoken, 'base64').toString('utf8'))
                restoken = restoken.data.refreshToken
                await refreshTokens()
                await info()
                // await list()
                await share_bk()
                await share_mall()
                await invite_friends()
                await lottery()
                await first()
                await water()
            }
            await SendMsg(msg);
        }
    }
})()
    .catch((e) => log(e))
    .finally(() => $.done())
async function refreshTokens() {
    return new Promise((resolve) => {

        var options = {
            method: 'POST',
            url: 'https://cluster.qifeixian.com/api/user/v1/public/token',
            headers: {
                Host: host,
                Connection: connection,
                'user-agent': userAgent,
                'Content-Type': contentType,
                Accept: '*/*',
                Referer: referer,
                'Accept-Encoding': acceptEncoding
            },
            data: {
                refresh_token: restoken
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(data)
                }
                if (data.data.code = 10000) {
                    newtoken = data.data.access_token
                    addNotifyStr('刷新token：' + newtoken)
                } else
                    addNotifyStr(data.msg)
            } catch (e) {
                addNotifyStr(`异常：${data}，原因：${data.msg}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
//每日抽奖
async function lottery() {
    return new Promise((resolve) => {

        var options = {
            method: 'POST',
            url: 'https://cluster.qifeixian.com/api/activity-center/v1/lottery',
            headers: {
                Host: host,
                Connection: connection,
                'x-ds-key': newtoken,
                Authorization: 'Basic ' + newtoken,
                'Content-Type': contentType,
                'user-agent': userAgent,
                'x-ds-port': xdPort,
                'base-version': baseVersion,
                version: version,
                Accept: '*/*',
                Referer: referer,
                'Accept-Encoding': acceptEncoding
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(data)
                }
                if (data.data.code = 10000) {
                    addNotifyStr(data.data.data.prize.prizeLevel.desc)
                    addNotifyStr(data.data.data.prize.prizeLevel.name)
                    addNotifyStr(data.data.data.prize.desc)
                    winid = data.data.data['winner_id']
                    addNotifyStr(data.data.msg)
                    await winning()
                } else
                    addNotifyStr(data.msg)

            } catch (e) {
                addNotifyStr(`${data.data.msg}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
//抽奖结果
async function winning() {
    return new Promise((resolve) => {

        var options = {
            method: 'GET',
            url: 'https://cluster.qifeixian.com/api/activity-center/v1/winning-records/' + winid,
            headers: {
                Host: host,
                Connection: connection,
                'x-ds-key': newtoken,
                Authorization: 'Basic ' + newtoken,
                'Content-Type': contentType,
                'user-agent': userAgent,
                'x-ds-port': xdPort,
                'base-version': baseVersion,
                version: version,
                Accept: '*/*',
                Referer: referer,
                'Accept-Encoding': acceptEncoding
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(data)
                }
                if (data.data.prizeExt) {
                    addNotifyStr(data.data.prizeExt.name + ' ' + data.data.sendType.name + ' ' + data.data.status.name)

                } else
                    addNotifyStr(data.data.msg)

            } catch (e) {
                addNotifyStr(`异常：${data}，原因：${data.msg}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
//个人信息
async function info() {
    return new Promise((resolve) => {

        var options = {
            method: 'GET',
            url: 'https://cluster.qifeixian.com/api/wallet/v1/member/account/info',
            headers: {
                Host: host,
                Connection: connection,
                'x-ds-key': newtoken,
                Authorization: 'Basic ' + newtoken,
                'Content-Type': contentType,
                'user-agent': userAgent,
                'x-ds-port': xdPort,
                'base-version': baseVersion,
                version: version,
                Accept: '*/*',
                Referer: referer,
                'Accept-Encoding': acceptEncoding
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(data)
                }
                if (data.data) {
                    addNotifyStr('money:' + data.data.money + ' score:' + data.data.score)

                } else
                    addNotifyStr(data.data.msg)

            } catch (e) {
                addNotifyStr(`异常：${data}，原因：${data.msg}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
//邀请好友
async function invite_friends() {
    return new Promise((resolve) => {

        var options = {
            method: 'POST',
            url: 'https://cluster.qifeixian.com/api/activity-center/v1/resouces/record',
            headers: {
                Host: host,
                Connection: connection,
                'x-ds-key': newtoken,
                Authorization: 'Basic ' + newtoken,
                'Content-Type': contentType,
                'user-agent': userAgent,
                'x-ds-port': xdPort,
                'base-version': baseVersion,
                version: version,
                Accept: '*/*',
                Referer: referer,
                'Accept-Encoding': acceptEncoding
            },
            data: { "type": "invite_friends", "userId": userId }
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(data)
                }
                if (data.data.data.status == false) {
                    addNotifyStr('未种树 先给你种个葡萄吧')

                } else
                    addNotifyStr(data.msg)

            } catch (e) {
                addNotifyStr(`异常：${data}，原因：${data.msg}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
async function list() {
    return new Promise((resolve) => {

        var options = {
            method: 'GET',
            url: 'https://cluster.qifeixian.com/api/goods/v1/goods/list?gcId=&page=1&page_size=10&name=',
            headers: {
                Host: 'cluster.qifeixian.com',
                Connection: 'keep-alive',
                'x-ds-key': newtoken,
                Authorization: 'Basic ' + newtoken,
                'Content-Type': 'application/json',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.42(0x18002a29) NetType/WIFI Language/zh_CN',
                'x-ds-port': '1380',
                'base-version': '3.1.2',
                version: '5.0.13',
                Accept: '*/*',
                Referer: 'https://servicewechat.com/wx3c0d10f34c013209/258/page-frame.html',
                'Accept-Encoding': 'gzip,compress,br,deflate'
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                log(data);
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(data)
                }
                if (data.data) {
                    log('商品编号goods_id:' + data.data.list[0].goods_id)
                } else
                    log(data.data.msg)

            } catch (e) {
                log(`异常：${data}，原因：${data.msg}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
//分享爆款商品
async function share_bk() {
    return new Promise((resolve) => {

        var options = {
            method: 'POST',
            url: 'https://cluster.qifeixian.com/api/activity-center/v1/resouces/record',
            headers: {
                Host: host,
                Connection: connection,
                'x-ds-key': newtoken,
                Authorization: 'Basic ' + newtoken,
                'Content-Type': contentType,
                'user-agent': userAgent,
                'x-ds-port': xdPort,
                'base-version': baseVersion,
                version: version,
                Accept: '*/*',
                Referer: referer,
                'Accept-Encoding': acceptEncoding
            },
            data: { "type": "share_bk", "userId": userId }
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(data)
                }
                if (data.data.data.status == false) {
                    addNotifyStr('未种树 先给你种个葡萄吧')

                } else
                    addNotifyStr(data.msg)

            } catch (e) {
                addNotifyStr(`异常：${data}，原因：${data.msg}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
//分享商城商品
async function share_mall() {
    return new Promise((resolve) => {

        var options = {
            method: 'POST',
            url: 'https://cluster.qifeixian.com/api/activity-center/v1/resouces/record',
            headers: {
                Host: host,
                Connection: connection,
                'x-ds-key': newtoken,
                Authorization: 'Basic ' + newtoken,
                'Content-Type': contentType,
                'user-agent': userAgent,
                'x-ds-port': xdPort,
                'base-version': baseVersion,
                version: version,
                Accept: '*/*',
                Referer: referer,
                'Accept-Encoding': acceptEncoding
            },
            data: { "type": "share_mall", "userId": userId }
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(data)
                }
                if (data.data.data.status == false) {
                    addNotifyStr('未种树 先给你种个葡萄吧')

                } else
                    addNotifyStr("00000" + data.msg)

            } catch (e) {
                addNotifyStr(`异常：${data}，原因：${data.msg}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
//每日登录
async function first() {
    return new Promise((resolve) => {

        var options = {
            method: 'POST',
            url: 'https://cluster.qifeixian.com/api/activity-center/v1/orchard/first',
            headers: {
                Host: host,
                Connection: connection,
                'x-ds-key': newtoken,
                Authorization: 'Basic ' + newtoken,
                'Content-Type': contentType,
                'user-agent': userAgent,
                'x-ds-port': xdPort,
                'base-version': baseVersion,
                version: version,
                Accept: '*/*',
                Referer: referer,
                'Accept-Encoding': acceptEncoding
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(data)
                }
                if (data.data.data.status == false) {
                    addNotifyStr('未种树 先给你种个葡萄吧')
                    await orchard()
                    await details()
                } else
                    await details()

            } catch (e) {
                log(`异常：${data}，原因：${data.msg}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
//种植果树
async function orchard() {
    return new Promise((resolve) => {

        var options = {
            method: 'POST',
            url: 'https://cluster.qifeixian.com/api/activity-center/v1/orchard/task',
            headers: {
                Host: host,
                Connection: connection,
                'x-ds-key': newtoken,
                Authorization: 'Basic ' + newtoken,
                'Content-Type': contentType,
                'user-agent': userAgent,
                'x-ds-port': xdPort,
                'base-version': baseVersion,
                version: version,
                Accept: '*/*',
                Referer: referer,
                'Accept-Encoding': acceptEncoding
            },
            data: { "tree_id": 9 }
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(data)
                }
                if (data.data.code = 10000) {

                    addNotifyStr('种树成功')
                } else
                    addNotifyStr(data.data.msg)

            } catch (e) {
                addNotifyStr(`异常：${data}，原因：${data.msg}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
//详情
async function details() {
    return new Promise((resolve) => {

        var options = {
            method: 'GET',
            url: 'https://cluster.qifeixian.com/api/activity-center/v1/orchard/details',
            headers: {
                Host: host,
                Connection: connection,
                'x-ds-key': newtoken,
                Authorization: 'Basic ' + newtoken,
                'Content-Type': contentType,
                'user-agent': userAgent,
                'x-ds-port': xdPort,
                'base-version': baseVersion,
                version: version,
                Accept: '*/*',
                Referer: referer,
                'Accept-Encoding': acceptEncoding
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(data)
                }
                // log(data)
                if (data.data.code = 10000) {
                    tsid = data.data.data.basisinfo['ts_id']

                    tasks = data.data.data.task.daily


                    addNotifyStr(tasks['is_lucky_draw']['task_name'] + ':')
                    await task_water(tasks['is_lucky_draw']['task_id'])

                    addNotifyStr(tasks['is_landing']['task_name'] + ':')
                    await task_water(tasks['is_landing']['task_id'])

                    addNotifyStr(tasks['is_invitation']['task_name'] + ':')
                    await task_water(tasks['is_invitation']['task_id'])

                    addNotifyStr(tasks['is_share']['task_name'] + ':')
                    await task_water(tasks['is_share']['task_id'])

                    addNotifyStr(tasks['is_bk']['task_name'] + ':')
                    await task_water(tasks['is_bk']['task_id'])

                    addNotifyStr(tasks['is_cancel_after_verification_bk']['task_name'] + ':')
                    await task_water(tasks['is_cancel_after_verification_bk']['task_id'])

                    addNotifyStr(tasks['is_consumption']['task_name'] + ':')
                    await task_water(tasks['is_consumption']['task_id'])

                    addNotifyStr(tasks['is_registered']['task_name'] + ':')
                    await task_water(tasks['is_registered']['task_id'])

                    addNotifyStr(tasks['is_registered']['task_name'] + ':')
                    await task_water(tasks['is_registered']['task_id'])
                    taskss = data.data.data.task.will

                    addNotifyStr(taskss['is_personal_data']['task_name'] + ':')
                    await task_water(taskss['is_personal_data']['task_id'])
                } else
                    addNotifyStr(data.data.msg)

            } catch (e) {
                log(`异常：${data}，原因：${data.msg}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
//领取奖励
async function task_water(task_id) {
    return new Promise((resolve) => {

        var options = {
            method: 'GET',
            url: 'https://cluster.qifeixian.com/api/activity-center/v1/orchard/task_water',
            params: { ts_id: tsid, task_id: task_id },
            headers: {
                Host: host,
                Connection: connection,
                'x-ds-key': newtoken,
                Authorization: 'Basic ' + newtoken,
                'Content-Type': contentType,
                'user-agent': userAgent,
                'x-ds-port': xdPort,
                'base-version': baseVersion,
                version: version,
                Accept: '*/*',
                Referer: referer,
                'Accept-Encoding': acceptEncoding
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(data)
                }
                if (data.data.code = 10000) {

                    addNotifyStr(data.data.msg)
                } else
                    addNotifyStr(data.data.msg)

            } catch (e) {
                addNotifyStr(`异常：${data}，原因：${data.msg}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}
//浇水
async function water() {
    return new Promise((resolve) => {

        var options = {
            method: 'GET',
            url: 'https://cluster.qifeixian.com/api/activity-center/v1/orchard/water/' + tsid,

            headers: {
                Host: host,
                Connection: connection,
                'x-ds-key': newtoken,
                Authorization: 'Basic ' + newtoken,
                'Content-Type': contentType,
                'user-agent': userAgent,
                'x-ds-port': xdPort,
                'base-version': baseVersion,
                version: version,
                Accept: '*/*',
                Referer: referer,
                'Accept-Encoding': acceptEncoding
            },
            data: {}
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(function (response) {
            try {
                var data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(data)
                }
                if (data.data.code = 10000) {

                    addNotifyStr(data.data.msg)
                } else
                    addNotifyStr(data.data.msg)

            } catch (e) {
                addNotifyStr(`异常：${data}，原因：${data.msg}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}








async function Envs() {
    if (qfxhd) {
        if (qfxhd.indexOf("@") != -1) {
            qfxhd.split("@").forEach((item) => {

                qfxhdArr.push(item);
            });
        } else if (qfxhd.indexOf("\n") != -1) {
            qfxhd.split("\n").forEach((item) => {
                qfxhdArr.push(item);
            });
        } else {
            qfxhdArr.push(qfxhd);
        }
    } else {
        addNotifyStr(`\n 【${$.name}】：未填写变量 qfxhd`)
        return;
    }

    return true;
}

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

    var i, x = sb(inputString),
        a = 1732584193,
        b = -271733879,
        c = -1732584194,
        d = 271733878,
        olda, oldb, oldc, oldd;
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
    if (time > 30000) { // 大于30s重新生成
        return delay();
    } else {
        console.log('随机延时：', `${time}ms, 避免大家运行时间一样`)
        return time; // 小于30s，返回
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

function randomStrings(e) {
    e = e || 32;
    let t = "abcdefhijkmnprstwxyz2345678",
        a = t.length,
        n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
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
                RegExp.$1.length == 1 ?
                    o[k] :
                    ('00' + o[k]).substr(('' + o[k]).length)
            );
    return fmt;
}

/**
 * 修改配置文件
 */




function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);

    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {
                url: t
            } : t;
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
            } catch { }
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
                this.get({
                    url: t
                }, (t, s, i) => e(i))
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
                    body: {
                        script_text: t,
                        mock_type: "cron",
                        timeout: r
                    },
                    headers: {
                        "X-Key": o,
                        Accept: "*/*"
                    }
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata() {
            if (!this.isNode()) return {}; {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e);
                if (!s && !i) return {}; {
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
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e),
                    r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i)
                if (r = Object(r)[t], void 0 === r) return s;
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

        get(t, e = (() => { })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                "X-Surge-Skip-Scripting": !1
            })), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                hints: !1
            })), $task.fetch(t).then(t => {
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
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
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
            }, t => {
                const {
                    message: s,
                    response: i
                } = t;
                e(s, i, i && i.body)
            }))
        }

        post(t, e = (() => { })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                "X-Surge-Skip-Scripting": !1
            })), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            });
            else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                hints: !1
            })), $task.fetch(t).then(t => {
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
            }, t => e(t));
            else if (this.isNode()) {
                this.initGotEnv(t);
                const {
                    url: s,
                    ...i
                } = t;
                this.got.post(s, i).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => {
                    const {
                        message: s,
                        response: i
                    } = t;
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
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {
                    "open-url": t
                } : this.isSurge() ? {
                    url: t
                } : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"],
                            s = t.mediaUrl || t["media-url"];
                        return {
                            openUrl: e,
                            mediaUrl: s
                        }
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl,
                            s = t["media-url"] || t.mediaUrl;
                        return {
                            "open-url": e,
                            "media-url": s
                        }
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {
                            url: e
                        }
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
            const e = (new Date).getTime(),
                s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}
