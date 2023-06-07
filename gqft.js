/**
 * 广汽丰田
 * cron 10 12 * * *  gqft.js
 * 23/01/23 积分任务：
 * 23/06/07 修复加密
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export gqft_data='Authorization'  //authorization去掉bearer
 * 抓包https://gw.nevapp.gtmc.com.cn , 找到请求头 Authorization 即可 多账号@ 连接
 * 
 * CK有效期问题暂未解决 请耐心等待
 *  估计这周解决
 * ====================================
 *   
 */



const $ = new Env("广汽丰田");
const ckName = "gqft_data";
//-------------------- 一般不动变量区域 -------------------------------------
const { log } = require('console')
const Notify = 1;         //0为关闭通知,1为打开通知,默认为1
const notify = $.isNode() ? require('./sendNotify') : '';
let envSplitor = ["@", "\n"]; //多账号分隔符
let msg = '';
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
let scriptVersionLatest; //最新版本
let scriptVersionNow = '0.0.1'; //现在版本
window = {}
//---------------------- 自定义变量区域 -----------------------------------
const CryptoJS = require('crypto-js')
const JSEncrypt = require('jsencrypt')
let appId_h5 = 'a41022a5-ad1e-eb24-4fb4-7d1b7a7958f2'//appId
let appKey_h5 = '52ae440d-8fec-5a8b-76ee-58eb6bea62f8'//appSigSecret
let appId_android = 'f31a4469-f9b9-4c10-2e97-bf2100a6d5a0'//appId
let appKey_android = '29012175-8d3c-b89b-a61d-4ecf65ff2e3c'//appSigSecret
//---------------------------------------------------------

async function start() {
    await getVersion('smallfawn/Note/main/JavaScript/test.js')
    log(`\n============ 当前版本：${scriptVersionNow} 📌 最新版本：${scriptVersionLatest} ============`)
    await getNotice()
    log('\n================== 用户信息 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            taskall.push(await user.task_signin());
            await $.wait(1000); //延迟  1秒  可充分利用 $.环境函数
        }
    }
    await Promise.all(taskall);
    log('\n================== 执行任务 ==================\n');
    taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            taskall.push(await user.art_list());
            await $.wait(1000); //延迟  1秒  可充分利用 $.环境函数
        }
    }
    await Promise.all(taskall);




}


class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split('&')[0];
        this.ckStatus = true
        this.nonce_android = nonce('android')
        this.nonce_h5 = nonce('h5')
        this.headersPost_android = {
            //'Connection': 'Keep-Alive',
            //'Content-Length': 402,
            'operateSystem': 'android',
            'appVersion': '1.4.4',
            'nonce': this.nonce_android,
            'Authorization': 'Bearer ' + this.ck,
            'Content-Type': 'application/json',
            'User-Agent': 'okhttp/4.8.1',
            'timestamp': Date.now(),
            'appId': appId_android,
            'sig': CryptoJS.MD5(Date.now() + this.ck + this.nonce_android + appId_android + appKey_android).toString(),
            'Accept': 'application/json',
            'Referer': 'https://app.nevapp.gtmc.com.cn/h5/pages/mine/task?noAutoSign=true',
            //'Accept-Encoding': 'gzip',
        }
        this.headersGet_android = {
            //'Connection': 'Keep-Alive',
            'operateSystem': 'android',
            'appVersion': '1.4.4',
            'nonce': this.nonce_android,
            'Authorization': 'Bearer ' + this.ck,
            'User-Agent': 'okhttp/4.8.1',
            'timestamp': Date.now(),
            'appId': appId_android,
            'sig': CryptoJS.MD5(Date.now() + this.ck + this.nonce_android + appId_android + appKey_android).toString(),
            'Accept': 'application/json',
            //'Referer': 'https://app.nevapp.gtmc.com.cn/h5/pages/mine/task?noAutoSign=true',
            //'Accept-Encoding': 'gzip',
        }
        this.headersPost_h5 = {
            'Connection': 'keep-alive',
            //'Content-Length': 402,
            'operateSystem': 'h5',
            'nonce': this.nonce_h5,
            'Authorization': this.ck,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36 BundleId/com.gtmc.nevapp DSApp/1.4.4 StatusBarHeight/30 BottomBarHeight/0',
            'timestamp': Date.now(),
            'appId': appId_h5,
            //'sig2': Date.now() + this.ck + this.nonce_h5 + appId_h5 + appKey_h5,
            'sig': CryptoJS.MD5(Date.now() + this.ck + this.nonce_h5 + appId_h5 + appKey_h5).toString(),
            'Accept': '*/*',
            'Origin': 'https://app.nevapp.gtmc.com.cn',
            'X-Requested-With': 'com.gtmc.nevapp',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://app.nevapp.gtmc.com.cn/h5/pages/mine/task?noAutoSign=true',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        }
        this.headerGet_h5 = {}

    }

    async user_info() {
        try {
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/main/api/community/lgn/user/getLoginUserInfo`,
                headers: this.headersGet_android
            }, result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.header.code == 10000000) {
                DoubleLog(`账号[${this.index}]  欢迎用户: [${result.body.baseInfo.nickname}]🎉`);
                this.ckStatus = true
            } else {
                DoubleLog(`账号[${this.index}]  用户查询:失败 ❌ 了呢,原因未知！`);
                this.ckStatus = false
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 签到
     */
    async task_signin() {
        try {
            let YO = `${KO()}@DS@${KO()}`
            let key = YO.split('@DS@')[0]
            let iv = YO.split('@DS@')[1]
            /*console.log(YO);
            log(key)
            log(iv)*/
            let bodydata = {}
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/main/api/marketing/lgn/task/sec/signin`,
                headers: this.headersPost_h5,
                body: JSON.stringify({ "encryptKey": getRSAEncryptResult(YO), "encryptData": AES_CBC_Encrypt(bodydata, key, iv) })
            }, result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if ('encryptData' in result) {
                let rsaDeData = result.encryptKey
                let rsaDeResult = getRSADecryptResult(rsaDeData)
                let aesDeData = result.encryptData
                let aesDekey = rsaDeResult.split('@DS@')[0]
                let aesDeiv = rsaDeResult.split('@DS@')[1]
                let deResult = AES_CBC_Decrypt(aesDeData, aesDekey, aesDeiv)
                if (deResult.header.code = '10000000') {
                    DoubleLog(`账号[${this.index}]  签到: ${deResult.header.message}🎉`);
                } else {
                    DoubleLog(`账号[${this.index}]  签到: ${deResult.header.message}`);
                }
            } else {
                DoubleLog(`账号[${this.index}]  签到:失败 ❌ 了呢,原因未知！`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 阅读
     * @param {*} artId 
     */
    async task_read(artId) {
        try {
            let YO = `${KO()}@DS@${KO()}`
            let key = YO.split('@DS@')[0]
            let iv = YO.split('@DS@')[1]
            /*console.log(YO);
            log(key)
            log(iv)*/
            let bodydata = { postId: artId }
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/main/api/community/sec/post/detail`,
                headers: this.headersPost_h5,
                body: JSON.stringify({ "encryptKey": getRSAEncryptResult(YO), "encryptData": AES_CBC_Encrypt(bodydata, key, iv) })
            }, result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if ('encryptData' in result) {
                let rsaDeData = result.encryptKey
                let rsaDeResult = getRSADecryptResult(rsaDeData)
                let aesDeData = result.encryptData
                let aesDekey = rsaDeResult.split('@DS@')[0]
                let aesDeiv = rsaDeResult.split('@DS@')[1]
                let deResult = AES_CBC_Decrypt(aesDeData, aesDekey, aesDeiv)
                if (deResult.header.code = '10000000') {
                    DoubleLog(`账号[${this.index}]  阅读文章: ${deResult.header.message}🎉`);
                } else {
                    DoubleLog(`账号[${this.index}]  阅读文章: ${deResult.header.message}`);
                }
            } else {
                DoubleLog(`账号[${this.index}]  阅读文章:失败 ❌ 了呢,原因未知！`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 点赞帖子
     */
    async task_like(artId) {
        try {
            let YO = `${KO()}@DS@${KO()}`
            let key = YO.split('@DS@')[0]
            let iv = YO.split('@DS@')[1]
            /*console.log(YO);
            log(key)
            log(iv)*/
            let bodydata = { subjectId: artId, subjectType: "POST" }
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/main/api/community/lgn/sec/user/like`,
                headers: this.headersPost_android,
                body: JSON.stringify({ "encryptKey": getRSAEncryptResult(YO), "encryptData": AES_CBC_Encrypt(bodydata, key, iv) })
            }, result = await httpRequest(options);
            //console.log(options);
            //console.log('点赞得结果',result);
            if ('encryptData' in result) {
                let rsaDeData = result.encryptKey
                let rsaDeResult = getRSADecryptResult_android(rsaDeData)
                let aesDeData = result.encryptData
                let aesDekey = rsaDeResult.split('@DS@')[0]
                let aesDeiv = rsaDeResult.split('@DS@')[1]
                let deResult = AES_CBC_Decrypt(aesDeData, aesDekey, aesDeiv)
                if (deResult.header.code = '10000000') {
                    DoubleLog(`账号[${this.index}]  点赞文章: ${deResult.header.message}🎉`);
                } else {
                    DoubleLog(`账号[${this.index}]  点赞文章: ${deResult.header.message}`);
                }
            } else {
                DoubleLog(`账号[${this.index}]  点赞文章:失败 ❌ 了呢,原因未知！`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 分享
     */
    async task_share(artId) {
        try {
            let YO = `${KO()}@DS@${KO()}`
            let key = YO.split('@DS@')[0]
            let iv = YO.split('@DS@')[1]
            /*console.log(YO);
            log(key)
            log(iv)*/
            let bodydata = { subjectId: artId, subjectType: "POST" }
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/main/api/community/lgn/sec/user/forward`,
                headers: this.headersPost_h5,
                body: JSON.stringify({ "encryptKey": getRSAEncryptResult(YO), "encryptData": AES_CBC_Encrypt(bodydata, key, iv) })
            }, result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if ('encryptData' in result) {
                let rsaDeData = result.encryptKey
                let rsaDeResult = getRSADecryptResult(rsaDeData)
                let aesDeData = result.encryptData
                let aesDekey = rsaDeResult.split('@DS@')[0]
                let aesDeiv = rsaDeResult.split('@DS@')[1]
                let deResult = AES_CBC_Decrypt(aesDeData, aesDekey, aesDeiv)
                if (deResult.header.code = '10000000') {
                    DoubleLog(`账号[${this.index}]  分享文章: ${deResult.header.message}🎉`);
                } else {
                    DoubleLog(`账号[${this.index}]  分享文章: ${deResult.header.message}`);
                }
            } else {
                DoubleLog(`账号[${this.index}]  分享文章:失败 ❌ 了呢,原因未知！`);
            }
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 帖子列表
     * 
     */
    async art_list() {
        try {
            let bodydata = { queryPostType: "NEWEST", pageNo: 1, pageSize: 20 }
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/main/api/community/post/page`,
                headers: this.headersPost_h5,
                body: JSON.stringify(bodydata)
            }, result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.header.code == '10000000') {
                for (let i = 0; i < 10; i++) {
                    DoubleLog(`账号[${this.index}]  文章 [${result.body.list[i].id}]`);
                    let artId = result.body.list[i].id
                    DoubleLog('开始浏览')
                    await $.wait(5000)
                    await this.task_read(artId)
                    DoubleLog('开始点赞')
                    await $.wait(5000)
                    await this.task_like(artId)
                    DoubleLog('开始分享')
                    await $.wait(5000)
                    await this.task_share(artId)
                }
            } else {
                DoubleLog(`账号[${this.index}] 获取帖子列表:失败 ❌ 了呢,原因未知！`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    /*async refresh_token() {
        try {
            let YO = `${KO()}@DS@${KO()}`
            let key = YO.split('@DS@')[0]
            let iv = YO.split('@DS@')[1]
            console.log(YO);
            log(key)
            log(iv)
            let options = {
                url: `https://gw.nevapp.gtmc.com.cn/ha/iam/api/lgn/sec/checkAndUpdateToken`,
                headers: this.headersPost_android,
                body: JSON.stringify({ "encryptKey": getRSAEncryptResult(YO), "encryptData": AES_CBC_Encrypt({}, key, iv) })
            }, result = await httpRequest(options);
            console.log(options);
            console.log(result);
            if (result.errcode == 0) {
                DoubleLog(`账号[${this.index}]  欢迎用户: ${result.errcode}`);
                this.ckStatus = true
            } else {
                DoubleLog(`账号[${this.index}]  用户查询:失败 ❌ 了呢,原因未知！`);
                this.ckStatus = false
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }*/



}

!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        await start();
    }
    await SendMsg(msg);
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());


//********************************************************
// 变量检查与处理
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
    method = options.method ? options.method.toLowerCase() : (options.body ? 'post' : 'get');
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
 * 16位随机数
 * @returns 
 */
function KO() {
    let e = Math.random().toString(36).substr(2);
    for (; e.length < 16;) e += Math.random().toString(36).substr(2);
    return e = e.substr(0, 16), e
}
function AES_CBC_Encrypt(data, key, iv) {
    key = CryptoJS.enc.Utf8.parse(key)
    iv = CryptoJS.enc.Utf8.parse(iv);
    if ("object" == typeof data) try {
        data = JSON.stringify(data)
    } catch (r) {
        console.log("encrypt error:", r)
    }
    data = CryptoJS.enc.Utf8.parse(data);
    //console.log(data);
    return CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).ciphertext.toString(CryptoJS.enc.Base64)
}

//逆向参数url https://app.nevapp.gtmc.com.cn/h5/assets/index.a0bf569f.js
let publicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA49jxpFBAoEslNYrHb0wT8nCpGBn3hvjgToNkp7lFpsSeRS7WbHoFJEvmf1U83cHrbTzRFRowPft/FGBw6/6dZcmMjMgz1n0FWlqk0d7QjEDL+t9Dj9tH9e/qdGfJ3bzR0ZgpgQMpKpx5I5fcEgzMYnHWGLZBY+v+PlPTN/1mz0nnRtIIxb8YuZZFvadfGTC8jeD7tMERpd5zENml5cLbVujENsag9AIpvLdvR6fSewi3l9QmssWpty50UpcAWsvAs+ExRYyUe/s1lwfSdSciW6Lrj4sp4MMaWifdTQUbKKEeuRugEqJSDrxhxoybEbSbl2CYaTR8kifZ1n+lcAh6cQIDAQAB"
let privateKey = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCaKMrIwU9els3xVszLtzvCJT+Kc8mosvygguXo0f+IqjSxvfCNbtobxIckxkBK7ipY8CK9k8WjcSsyIUd132CsGvFoUejD+sf+53wEy4z1YOgeoatll5/wMFGGZfDEyRbYd7WGTGPBZ6goENqplN5AJW6fIq8SskWZa59uq1E3Q9rM8iLg3n+955xvEb412vmTPsEWYL2qc6HUpEFxpXAg+CWjthYihZKkeOgQFr9LV3sB5bRAgtoXf/dnuWMK1jg4z7efaAxxNovQfRWXDEcgiRONmuS+l+M2y3YoPt1EFYSOZuU5GepuPPDFMxoLJ1CE2pk20ZUFIrgOisSICnkdAgMBAAECggEAKjVxEHadXLC9wo6ZlE2fNxErzKTXWjFnqiss+ApHhQvVUbVH3/GyFlhBCHifseR0A9X8LRwAyTd7NEaYYlW/CmB2KLIEoWRQziJjeoyhE65s37Y0T6SsTf9s0vembLsCXlKoiRTxW0seZ5n1xOjV0YpuN3Qvq1bUZ6VoCc0ud4rU09gDI8nDEkS0sBZbV8wVxpksoksX7YdpgJtqCMezOdnY9LqWiC0Y1km9szaNRr3X5rGTVJ+ZnTu2votXdKCMzVLXE/hm2eMRAk2droOzwKFLYlijZZg7m1SfNWlSCEelPKPRmv2RnoIGXn6EvqXLLT4zg4iOzh0dRrvT+BLloQKBgQD7b/x8aLfVvv5/dBFDN6exXpSY3gvsXhb3GhE/DO8dHRN1qcJt2ocriJEbZnD5F2DAQIT+DdG1Uihg9bTinDbhtilG1PdWQIqIcxRbMiJjtWIIEkTpFVnShZ4VNe56lseAAxAPG8z5Wzy25HiIUovnH5CiZiKesqRbkILjsrtiowKBgQCc9OpdmS38HSizOZ4Mieg3nkCm+OCZQAuIQqokALUC/Gb8sae2ZO6GGtdr6+Xo8B/WMlkmapNEFqSSE3xepjR9O1J9efvp3BJ2j/1UTO0NPlcm0lyijG3epqx8iaWJWF2wezs9w5qZtFUve/5um88ztbuhMNbgFdVIPGN9BoQxPwKBgQCCaqayvPpFkwicgU6G5/JCLMW0uM/EbVVKHCo/4uyP1EoIqOHhawzbhr2FUdBdU0Pq1ExnHjHc891f1XJabB6HWp30UHhuM5HnjpFLcCioQSe0+gzmPR3W9Vl2tP+adGTMQEpvG8Nov2sxjjX6t547ZoL1yTZBzHU1zTIm+sj5MwKBgAhcV3ui5DswxnE9mXirg+4qhOEgEr63FaYtfuiqDPpavZWqVPe3SqlkFqOODlIpMFj1l6AfPzb6ScvqM87K5bLiDRPYAp5DdcxRATqTWnFBJ91OiVazSkr47+k2X9YAGgWDmvVATSTw4TTFUxlLPW9Qt+zvMBMBtrnBVb9cMIB7AoGALNeRpqZKdjbvklQLMDnKyV7p9wuz669SX4LPODcMqf8q0wsL8/0jWTuyyePr8z+V/BI2SVHcT3CaBsmnNRU739DXLAcQ4R2d6Ak5zmmJrOcWl1QiQIcNZUp+fGEBTOl3YOxIFryGX15MocX6bE9JXj4k2L6P7XlfoLAme4801bI="
let privateKey_android = 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCvUb36V6lPOB5qmJkPzeThWN1v2+j0OYGxnnb9uaNeiMIWHk+bj0izkEzOsTwFacM9CEOKC5Oteg6dHz+M640nP1iC1aoWWeCIS7/GuKfM1xe1RnJ19gCw+yPpHiIWlltmFaINNdyF7YGh+siHex4/8/YTkQGuCRjJcynCAqfiLRkL8I5uBQUYj7SU8gWsuQSDa2OcH047cjcYRzrPYob/1q4TZgOe/jsj5n7b/a7xz/KwHWBEXeiLCQJCJQiKnvEaJ4LWq5NuKlB5+3EQoPOPw6CNtkT8Nz9B5peB2076TZDeFnjHqiG+Sk5KOpBizBtnifzXCXvFlcRQcWMXgsv/AgMBAAECggEAA1VMhVvxTh5FBcXM8y348gfcfenybeJCAvx+Sqii4IM9HWqKHO0GdtOBglSATaILIjfsAM3jiuLNMFONw8IetuZPan1hdHdU+4JlLQQJvK1COCIUvwVkUfkUX7RA9aj6J+C1agbiIHG5izjXYywGETU0Mn8JRyPJIttbqeKfCn/E8RIddw+TgPixweOjurWQt9hNA9fCe48/0xwadweCG4H+Dmv2kocCsSn6Vf0g3KSp0N0pVsxPHx67BjU3mW9rt4sv8gwt2PoxDJYhxbYWwj8WeRCDSSpYsTlskXLkh71VFKLg2fr/BrZgH9lMMdpSGO79mZcrP45O2pIS0MfkcQKBgQDZ3uiL+GgmhYI3+7pITAloFUVjkJISi9zbHxIlXK9r5sfQRxYIIyC76pmkLFlPD+Z2YnX4krWs1pWu4GhgXpE87VmoUpujj8o1MAxF2iXpLfLW6XB+iEU92n6gAo4VEZKHdzw0rR9hlfW9Q0oXPK2TtcN3iscePZTVt6rlGnIAxQKBgQDOAG9zOCwpqMpbmvw8R1qrWCkcXmW37AsB6MkZvEJIFvukmIh7/9rH63/pEzGN863O/o61XX3s7S/n8K+MGIfrc0uy0HeCU+OYDA3p6Nih8NhyfxZysT9JZvimx1KSiW00jeXgfF78nzUqQJYQIRUW2Ja+tOJzKSxnotuTLjrd8wKBgBmJuXR+v6aUS7lINoO29ftPUvziu1yVLGQ69iOPA7kAKjfNvVVi2LluPGg0Epvj3z3NOMrUV5tU4+LFxzZUn22m3LWQSVIYzrkBUs71TTBSBH8QifErBALGE8WpxwHNN4HNhi8eg+kqbM2sj4i9whLoYWsnx0NSMJoEl3GXcfmJAoGAU2XRuO+w0VzIL7XbD/xDNMMIQbflrkQdYLSBVa3ll5HWZphqCOlYBT/OFOn0UeepIffkhoBHDrgngNrr9uenfya6KrZC67xSk6etqljd+xGqTxAsYlpnqKvLVpmzUCfa0j/wJKW1PsilmWl0VytNgmZFAQfx9XVhyMMh6b/5jQkCgYEAh/xKMPs5j3yukWIhedqobq+AU+EyZ7ZKLBif9FZsWezEnUvtRYyOryH5gt3cgN7Ux0SAFvp1eqyoQnBv0O96LeSLKsyYyvJ8yKQweqpPATAiX5vOX/EfHPshVLlbxabKinG888+qb60eyV6S1E/7GvOU1ILI6l9WQPgOYKVpbGA='

function getRSAEncryptResult(data) {
    window = {}
    let crypt = new JSEncrypt()
    crypt.setPublicKey(publicKey)
    // 加密
    //log(`待加密数据${data}`)
    var enc = crypt.encrypt(data);
    return enc
}
function getRSADecryptResult(data) {
    window = {}
    let crypt = new JSEncrypt()
    crypt.setPrivateKey(privateKey)
    var dec = crypt.decrypt(data);
    //log(`解密数据${data}`)
    return dec
}
function getRSADecryptResult_android(data) {
    window = {}
    let crypt = new JSEncrypt()
    crypt.setPrivateKey(privateKey_android)
    var dec = crypt.decrypt(data);
    //log(`解密数据${data}`)
    return dec
}
/**
 * 随机 数字 + 小写字母 生成
 */
function nonce(type) {
    return type === 'h5'
        ? Array.from({ length: 6 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
        : type === 'android'
            ? Math.floor(Math.random() * 900000) + 100000
            : '';
}
function AES_CBC_Decrypt(data, key, iv) {
    key = CryptoJS.enc.Utf8.parse(key)
    iv = CryptoJS.enc.Utf8.parse(iv);
    var decrypted = CryptoJS.AES.decrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    var decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
    try {
        decryptedData = JSON.parse(decryptedData);
    } catch (r) {
        console.log("decrypt error:", r)
    }
    //console.log(decryptedData);
    return decryptedData;
}

/**
 * 获取远程版本
 */
function getVersion(scriptUrl, timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let options = {
            url: `https://ghproxy.com/https://raw.githubusercontent.com/${scriptUrl}`,
        }
        $.get(options, async (err, resp, data) => {
            try {
                let regex = /scriptVersionNow\s*=\s*(["'`])([\d.]+)\1/;
                let match = data.match(regex);
                scriptVersionLatest = match ? match[2] : '';
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        }, timeout)
    })
}

async function getNotice() {
    try {
        let options = {
            url: `https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/Note/main/Notice.json`,
            headers: { 'User-Agent': '' },
        }, result = await httpRequest(options);
        if (!result || !('notice' in result)) {
            options.url = `https://gitee.com/smallfawn/Note/raw/master/Notice.json`
            result = await httpRequest(options);
        }
        if (result && 'notice' in result) {
            DoubleLog(`${result.notice}`);
        }
    } catch (e) {
        console.log(e);
    }
}
async function hitokoto() { // 随机一言
    try {
        let options = {
            url: 'https://v1.hitokoto.cn/',
            headers: {}
        }, result = await httpRequest(options);
        return result.hitokoto
    } catch (error) {
        console.log(error);
    }
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
// 完整 Env
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
