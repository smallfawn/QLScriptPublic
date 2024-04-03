/*
* 软件名称：哈啰
*
* 版本：0.0.2（修复变量问题）
*
* 抓包位置：首页 福利中心 查看更多  抓包 api.hellobike.com/api?urser 请求里面的 TOKEN
*
* 定时  0 8 * * *
*
* 变量名称：hlToken
*
* 多账号用 & 隔开
*
* ##哈啰 
*
* export hlToken="23fexxxxxxxxxxxxxxxxxxxxxxxxxxxx"
*  
* 奖励：积攒奖励金可换手机话费重置抵用券
*/

const axios = require('axios');

// 获取环境变量中的TOKEN
const hlToken = process.env.hlToken;

// 如果TOKEN存在并且包含多个账号，则用 '&' 分割
const tokens = hlToken ? hlToken.split('&') : [];

// 检查是否有TOKEN
if (tokens.length === 0 || !tokens[0]) {
    console.log('请添加哈啰hlToken在运行此脚本');
    process.exit(0);
}

// 循环遍历每个账号的TOKEN
for (let i = 0; i < tokens.length; i++) {
    const hlToken = tokens[i];

    // 签到接口
    const signUrl = 'https://api.hellobike.com/api?common.welfare.signAndRecommend';
    const signData = {
        from: "h5",
        systemCode: 62,
        platform: 4,
        version: "6.46.0",
        action: "common.welfare.signAndRecommend",
        token: hlToken,
        pointType: 1
    };

    // 查询奖励金接口
    const pointInfoUrl = 'https://api.hellobike.com/api?user.taurus.pointInfo';
    const pointInfoData = {
        from: "h5",
        systemCode: 61,
        platform: 4,
        version: "6.46.0",
        action: "user.taurus.pointInfo",
        token: hlToken,
        pointType: 1
    };

    // 签到操作
    axios.post(signUrl, signData)
        .then(function (response) {
            const data = response.data;
            const succ = data.data.didSignToday;
            const reward = data.data.bountyCountToday;
            const msg = succ === true ? '今日签到成功 金币+' + reward : '今日未签到';
            console.log(`账号${i + 1}：${msg}`);
        })
        .catch(function (error) {
            console.log('哈啰TOKEN已失效');
        });

    // 查询奖励金操作
    axios.post(pointInfoUrl, pointInfoData)
        .then(function (response) {
            const points = response.data.data.points;
            console.log(`账号${i + 1}：可用奖励金为 ${points}`);
        })
        .catch(function (error) {
            console.log('查询奖励金信息失败');
        });
}
