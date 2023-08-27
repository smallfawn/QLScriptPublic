/**
 * new Env("吉利银河")
 * cron 08 15 * * *  jlyh.js
 * Show:
 * 变量名:jlyh
 * 变量值:抓域名https://galaxy-user-api.geely.com/api/v1/login/refresh?refreshToken=后面的值&请求头headers中deviceSN的值
 * 抓不到这个域名抓短信登录包 https://galaxy-user-api.geely.com/api/v1/login/mobileCodeLogin 返回体中的refreshToken的值
 * 注意我说的是值 并不是全部 填错的自己看着点
 * 并且变量是两个值 两个值 两个值 一个refreshToke的值一个header请求头中的deviceSN的值
 * scriptVersionNow = "0.0.1";
 */
const ckName = "jlyh";
const Notify = 1; //0为关闭通知,1为打开通知,默认为1
let envSplitor = ["@", "\n"]; //多账号分隔符
let strSplitor = '&'; //多变量分隔符

const $ = new Env("吉利银河");
let scriptVersionNow = "0.0.1";
let msg = "";
async function start() {
    await getVersion("smallfawn/QLScriptPublic@main/jlyh.js");
    await getNotice();

    let taskall = [];
    for (let user of $.userList) {
        if (user.ckStatus) {
            taskall.push(await user.main());
            await $.wait(1000);
        }
    }
    await Promise.all(taskall);
}

class UserInfo {
    constructor(str) {
        this.index = ++$.userIdx;
        this.ckStatus = true;
        this.token = ''
        this.refreshToken = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.articleId = '';
        this.deviceSN = str.split(strSplitor)[1];
    }
    /**
     * 获得格林尼治时间
     * @param {*} date 
     * @param {*} hourOffset 
     * @param {*} minuteOffset 
     * @returns 
     */
    formatDate(date, hourOffset = 0, minuteOffset = 0) {
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const adjustedDate = new Date(date);
        adjustedDate.setUTCHours(adjustedDate.getUTCHours() + hourOffset);
        adjustedDate.setUTCMinutes(adjustedDate.getUTCMinutes() + minuteOffset);
        const dayOfWeek = daysOfWeek[adjustedDate.getUTCDay()];
        const day = ('0' + adjustedDate.getUTCDate()).slice(-2);
        const month = months[adjustedDate.getUTCMonth()];
        const year = adjustedDate.getUTCFullYear();
        const hours = ('0' + adjustedDate.getUTCHours()).slice(-2);
        const minutes = ('0' + adjustedDate.getUTCMinutes()).slice(-2);
        const seconds = ('0' + adjustedDate.getUTCSeconds()).slice(-2);
        return `${dayOfWeek} ${month} ${day} ${year} ${hours}:${minutes}:${seconds} GMT`;
    }
    calculateHmacSha256(method, accept, content_md5, content_type, date, key, nonce, timestamp, path) {
        const crypto = require('crypto');
        // 构建待加密的字符串
        let e = `POST\n` +//method
            `application/json; charset=utf-8\n` +//accept
            `9qH9eCwn+tkcAKIMmnzdnQ==\n` +//content_md5
            `application/json; charset=utf-8\n` +//content_type
            `Thu, 13 Jul 2023 01:27:46 GMT\n` +//date
            `x-ca-key:204179770\n` +
            `x-ca-nonce:a2b33525-ca82-4e3a-b7ff-643f1775a999\n` +//nonce
            `x-ca-timestamp:1689211666058\n` +//timestamp
            `/app/v1/version/checkVersion`//path
        let ee = `${method}\n` +//method
            `${accept}\n` +//accept
            `${content_md5}\n` +//content_md5
            `${content_type}\n` +//content_type
            `${date}\n` +//date
            `x-ca-key:${key}\n` +
            `x-ca-nonce:${nonce}\n` +//nonce
            `x-ca-timestamp:${timestamp}\n` +//timestamp
            `${path}`//path  
        //console.log(ee);
        let sercetKey
        if (key == 204179770) {
            sercetKey = `zqcNqCHfn73hIAhLUftgh1geChLDv4GZ`
        } else if (key == 204167276) {
            sercetKey = "5XfsfFBrUEF0fFiAUmAFFQ6lmhje3iMZ"
        } else if (key == 204168364) {
            sercetKey = `NqYVmMgH5HXol8RB8RkOpl8iLCBakdRo`
        } else if (key == 204179735) {
            sercetKey = `UhmsX3xStU4vrGHGYtqEXahtkYuQncMf`
        }
        // 生成 HMAC-SHA256 加密结果  
        const hmacSha256 = crypto.createHmac('sha256', sercetKey);
        hmacSha256.update(ee);
        const encryptedData = hmacSha256.digest();
        // 返回 Base64 编码的结果
        //console.log(`加密结果` + encryptedData.toString('base64'));
        return encryptedData.toString('base64');
    }
    generateUUID() {
        const alphanumeric = "0123456789abcdef";
        const sections = [8, 4, 4, 4, 12];
        let uuid = "";
        for (let i = 0; i < sections.length; i++) {
            for (let j = 0; j < sections[i]; j++) {
                uuid += alphanumeric[Math.floor(Math.random() * alphanumeric.length)];
            }
            if (i !== sections.length - 1) {
                uuid += "-";
            }
        }
        return uuid;
    }
    getPostHeader(key, path, body) {
        const crypto = require('crypto');
        function calculateContentMD5(requestBody) {
            // 将请求体内容转换为字节数组
            const byteArray = Buffer.from(requestBody, 'utf8');
            // 计算字节数组的MD5摘要
            const md5Digest = crypto.createHash('md5').update(byteArray).digest();
            // 将MD5摘要转换为Base64编码的字符串
            const md5Base64 = md5Digest.toString('base64');
            // 返回Content-MD5值
            return md5Base64;
        }
        let currentDate = new Date();
        let formattedDate = this.formatDate(currentDate, 0); // 格林尼治时间  如果是8则是北京时间
        //console.log(formattedDate);
        let parts = formattedDate.split(" ");
        formattedDate = `${parts[0]}, ${parts[2]} ${parts[1]} ${parts[3]} ${parts[4]} GMT`;
        let date = new Date(formattedDate)
        let timestamp = date.getTime(); // 获取时间戳
        //console.log(timestamp);
        let content_md5 = calculateContentMD5(body);
        let uuid = this.generateUUID();
        let signature = this.calculateHmacSha256("POST", "application/json; charset=utf-8", content_md5, "application/json; charset=utf-8", formattedDate, key, uuid, timestamp, path)
        let headers = {
            'date': formattedDate,
            'x-ca-signature': signature,
            'x-ca-nonce': uuid,
            'x-ca-key': key,
            'ca_version': 1,
            'accept': 'application/json; charset=utf-8',
            'usetoken': 1,
            'content-md5': content_md5,
            'x-ca-timestamp': timestamp,
            'x-ca-signature-headers': 'x-ca-nonce,x-ca-timestamp,x-ca-key',
            'x-refresh-token': true,
            'user-agent': 'ALIYUN-ANDROID-UA',
            'token': this.token,
            'deviceSN': this.deviceSN,
            'txCookie': '',
            'appId': 'galaxy-app',
            'appVersion': '1.3.0',
            'platform': 'Android',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json; charset=utf-8',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip'
        }
        if (key == 204179735) {
            //安卓端
            headers["usetoken"] = true
            headers["host"] = `galaxy-user-api.geely.com`
            delete headers["x-refresh-token"]
            headers["taenantid"] = 569001701001
            headers["svcsid"] = ""
        } else {
            //h5端
            headers["usetoken"] = 1
            headers["host"] = `galaxy-app.geely.com`
            headers["x-refresh-token"] = true
        }
        return headers;

    }
    getGetHeader(key, path) {
        let currentDate = new Date();
        let formattedDate = this.formatDate(currentDate, 0); // 格林尼治时间  如果是8则是北京时间
        //console.log(formattedDate);
        let parts = formattedDate.split(" ");
        formattedDate = `${parts[0]}, ${parts[2]} ${parts[1]} ${parts[3]} ${parts[4]} GMT`;
        let date = new Date(formattedDate)
        let timestamp = date.getTime(); // 获取时间戳
        //console.log(timestamp);
        let uuid = this.generateUUID();
        let signature = this.calculateHmacSha256("GET", "application/json; charset=utf-8", "", "application/x-www-form-urlencoded; charset=utf-8", formattedDate, key, uuid, timestamp, path)
        let headers = {
            'date': formattedDate,
            'x-ca-signature': signature,
            'x-ca-nonce': uuid,
            'x-ca-key': key,
            'ca_version': 1,
            'accept': 'application/json; charset=utf-8',
            'usetoken': 1,
            'x-ca-timestamp': timestamp,
            'x-ca-signature-headers': 'x-ca-nonce,x-ca-timestamp,x-ca-key',
            'x-refresh-token': true,
            'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
            'user-agent': 'ALIYUN-ANDROID-UA',
            'token': this.token,//'',
            'deviceSN': this.deviceSN,
            'txCookie': '',
            'appId': 'galaxy-app',
            'appVersion': '1.3.0',
            'platform': 'Android',
            'Cache-Control': 'no-cache',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip',
        }
        if (key == 204179735) {
            //安卓端
            headers["usetoken"] = true
            headers["host"] = `galaxy-user-api.geely.com`
            delete headers["x-refresh-token"]
            headers["taenantid"] = 569001701001
            headers["svcsid"] = ""
        } else {
            headers["usetoken"] = 1
            headers["host"] = `galaxy-app.geely.com`
            headers["x-refresh-token"] = true

        }
        return headers

    }
    /**
     * 查询积分
     */
    async main() {
        $.DoubleLog(`------第[${this.index}]个账号------`);
        await this.refresh_token()
        if (this.ckStatus == true) {
            await this.get_points();

            await this.createArticle();
            await $.wait(10000)
            await this.articleList()
            await $.wait(10000)
            if (this.articleId !== '') {
                await this.like()
                //await this.createComment()
                await this.share()
                await this.delete()
            } else {
                $.DoubleLog(`发布文章不成功，不执行评论 分享 删除`)
            }
        } else {
            $.DoubleLog(`❌账号[${this.index}] 账号CK失效`);
        }

    }
    async refresh_token() {
        try {
            let options = {
                url: `https://galaxy-user-api.geely.com/api/v1/login/refresh?refreshToken=${this.refreshToken}`,
                headers: this.getGetHeader(204179735, `/api/v1/login/refresh?refreshToken=${this.refreshToken}`),
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 'success') {
                $.DoubleLog(`✅账号[${this.index}]  ${result.message}: ${result.data.centerTokenDto.token} 刷新KEY${result.data.centerTokenDto.refreshToken}🎉`);
                this.ckStatus = true;
                this.token = result.data.centerTokenDto.token
            } else {
                $.DoubleLog(`❌账号[${this.index}]  ${result.message}`);
                this.ckStatus = false;
                //console.log(result);
            }
        } catch (e) {
            console.log(e)
        }
    }
    async get_points() {
        try {
            let options = {
                url: `https://galaxy-app.geely.com/h5/v1/points/get`,
                headers: this.getGetHeader(204179770, `/h5/v1/points/get`),
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.DoubleLog(`✅账号[${this.index}]  剩余积分: ${result.data.availablePoints}🎉`);
            } else {
                $.DoubleLog(`❌账号[${this.index}]  剩余积分查询: 失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async createArticle() {
        let content = await this.hitokoto()
        //console.log(content);
        try {
            let body = { "images": ["https://galaxy-oss.geely.com/galaxy-app/2023/07/202307131833572625946.jpg"], "needCache": "0", "content": content }
            let options = {
                url: `https://galaxy-app.geely.com/h5/v1/square/dynamic/create`,
                headers: this.getPostHeader(204179770, `/h5/v1/square/dynamic/create`, JSON.stringify(body)),
                body: JSON.stringify(body)
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.DoubleLog(`✅账号[${this.index}]  创建文章成功`);
                //this.articleId = result.data.toString()

            } else {
                $.DoubleLog(`❌账号[${this.index}]  创建文章失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async createComment() {
        let commentContent = await this.hitokoto()

        try {
            let body = { "typeStr": "动态", "commentType": 1, "needCache": "0", "commentContent": commentContent, "mainId": this.articleId }
            let options = {
                url: `https://galaxy-app.geely.com/h5/v1/square/comment/create`,
                headers: this.getPostHeader(204179770, `/h5/v1/square/comment/create`, JSON.stringify(body)),
                body: JSON.stringify(body)
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.DoubleLog(`✅账号[${this.index}]  评论成功[${result.data}]`);
            } else {
                $.DoubleLog(`❌账号[${this.index}]  评论失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async like() {
        try {
            let body = { "needCache": "0", "id": this.articleId }
            let options = {
                url: `https://galaxy-app.geely.com/h5/v1/square/content/cancelUpvote`,
                headers: this.getPostHeader(204179770, `/h5/v1/square/content/cancelUpvote`, JSON.stringify(body)),
                body: JSON.stringify(body)
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.DoubleLog(`✅账号[${this.index}]  点赞成功[${result.data.value}]`);
            } else {
                $.DoubleLog(`❌账号[${this.index}]  点赞失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async share() {
        try {
            let options = {
                url: `https://galaxy-app.geely.com/h5/v1/square/content/firstShareAward`,
                headers: this.getGetHeader(204179770, `/h5/v1/square/content/firstShareAward`),
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.DoubleLog(`✅账号[${this.index}]  分享成功`);
            } else {
                $.DoubleLog(`❌账号[${this.index}]  分享失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async delete() {
        try {
            let body = { "id": this.articleId }
            let options = {
                url: `https://galaxy-app.geely.com/h5/v1/square/dynamic/delete`,
                headers: this.getPostHeader(204179770, `/h5/v1/square/dynamic/delete`, JSON.stringify(body)),
                body: JSON.stringify(body)
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.DoubleLog(`✅账号[${this.index}]  删除成功`);
            } else {
                $.DoubleLog(`❌账号[${this.index}]  删除失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async articleList() {
        try {
            let body = { "columns": [], "pageSize": 20, "orders": [], "pageNum": 1 }
            let options = {
                url: `https://galaxy-app.geely.com/h5/v1/mine/myPublish/content/page`,
                //    https://galaxy-app.geely.com/h5/v1/mine/myPublish/content/page
                headers: this.getPostHeader(204179770, `/h5/v1/mine/myPublish/content/page`, JSON.stringify(body)),
                body: JSON.stringify(body)
            },
                result = await httpRequest(options);
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.DoubleLog(`✅账号[${this.index}]  查询文章列表成功 [${result.data.list[0].dynamic.id}]`);
                this.articleId = result.data.list[0].dynamic.id.toString()
            } else {
                $.DoubleLog(`❌账号[${this.index}]  查询文章列表失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async hitokoto() {
        return new Promise((resolve) => {
            const options = { url: `https://v1.hitokoto.cn/` };
            $.get(options, (err, resp, data) => {
                try {
                    try {
                        data = JSON.parse(data)
                    } catch (error) {
                        resolve(this.getRandomQuote());
                    }
                    //console.log(data);
                    if ('id' in data) {
                        resolve(data.hitokoto);
                    } else {
                        resolve(this.getRandomQuote());
                    }
                } catch (e) {
                    $.logErr(e, resp);
                }
                resolve();
            }, 5000);
        })

    }
    getRandomQuote() {
        const quotes = [
            "要赚很多钱去买我的快乐。",
            "快乐与平凡，最浪漫。",
            "我的花会开，我的生活也会慢慢拥抱我。",
            "因为有了黑暗，星星才会如此闪耀。经历过至暗时刻，才能成为一束光。",
            "日子大多数都很平常，有时甚至不如意，但总有一点点小美好和小欢喜，值得我们珍藏。好好热爱生活吧",
            "生活的温柔总会哒哒哒的跑进你的怀里。",
            "今日无事，唯有开心。",
            "日子，一路向阳！",
            "一些小美好正在井然有序地发生着。",
            "心有一隅，房子大的烦恼就只能挤在一隅中, 心有四方天地，山大的烦恼也不过是沧海一粟。",
            "甩甩头，把烦恼丢去，仰起笑脸，与这世间所有美好相逢。",
            "我们的背包已装满晴朗，出发去山顶晒月光。",
            "梦醒人间看微雨，江山还似就温柔。",
            "万家灯火与群星，人间值得的又一刻。",
            "心情就像衣服，脏了拿去洗洗，晒晒，阳光自然就会蔓延开来。",
            "生而自由，爱而无畏。",
            "心藏漂亮，眼带光芒，生活是自己喜欢的模样。",
            "今天的空气，掺了份甜。",
            "在喜欢你的人那里，去热爱生活。在不喜欢你的人那里，去看清世界。就这么简单。",
            "生活的理想，就是为了理想的生活。",
            "你说，你热爱生活。我想是的。星辰大海都揉进你眼中，我看到了整个世界该有的温柔。",
            "开开心心，不动脑筋。",
            "湛蓝天空上像奶油泡芙一样的云朵溢出冰淇淋的味道。",
            "把自己活成一道光，潇洒且硬气的穿行在这个世界上。",
            "遇上有趣的人和生活。",
            "羡慕别人的天空简直没有道理，因为你是一座宇宙。",
            "我生来平庸，也生来骄傲。",
            "抬头看看天空，低头看看花朵，生活中许多美好的事情，让我们不断感受这世间莫大的善意。",
            "美丽心情，营业中。",
            "试试看每天吃一颗糖，然后告诉自己，今天的日子果然又是甜的"
        ];
        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
    }
}

!(async () => {
    if (!(await checkEnv())) return;
    if ($.userList.length > 0) {
        await start();
    } await $.SendMsg(msg);
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
        const options = { url: `https://fastly.jsdelivr.net/gh/${scriptUrl}` };
        $.get(options, (err, resp, data) => {
            try {
                const regex = /scriptVersionNow\s*=\s*(["'`])([\d.]+)\1/;
                const match = data.match(regex);
                const scriptVersionLatest = match ? match[2] : "";
                console.log(`\n=== 当前版本：${scriptVersionNow} 📌 最新版本：${scriptVersionLatest} ===`);
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
async function getNotice() {
    try {
        const urls = [
            "https://fastly.jsdelivr.net/gh/smallfawn/Note@main/Notice.json",
            "https://gcore.jsdelivr.net/gh/smallfawn/Note@main/Notice.json",
            "https://cdn.jsdelivr.net/gh/smallfawn/Note@main/Notice.json",
            "https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/Note/main/Notice.json",
            "https://gitee.com/smallfawn/Note/raw/master/Notice.json",
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
// ==================== API ==================== //
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return ("POST" === e && (s = this.post), new Promise((e, a) => { s.call(this, t, (t, s, r) => { t ? a(t) : e(s) }) })) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new (class { constructor(t, e) { this.userList = []; this.userIdx = 0; (this.name = t), (this.http = new s(this)), (this.data = null), (this.dataFile = "box.dat"), (this.logs = []), (this.isMute = !1), (this.isNeedRewrite = !1), (this.logSeparator = "\n"), (this.encoding = "utf-8"), (this.startTime = new Date().getTime()), Object.assign(this, e), this.log("", `🔔${this.name},开始!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const a = this.getdata(t); if (a) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise((e) => { this.get({ url: t }, (t, s, a) => e(a)) }) } runScript(t, e) { return new Promise((s) => { let a = this.getdata("@chavy_boxjs_userCfgs.httpapi"); a = a ? a.replace(/\n/g, "").trim() : a; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); (r = r ? 1 * r : 20), (r = e && e.timeout ? e.timeout : r); const [i, o] = a.split("@"), n = { url: `http://${o}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": i, Accept: "*/*" }, timeout: r, }; this.post(n, (t, e, a) => s(a)) }).catch((t) => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e); if (!s && !a) return {}; { const a = s ? t : e; try { return JSON.parse(this.fs.readFileSync(a)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), a = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : a ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const a = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of a) if (((r = Object(r)[t]), void 0 === r)) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), (e.slice(0, -1).reduce((t, s, a) => Object(t[s]) === t[s] ? t[s] : (t[s] = Math.abs(e[a + 1]) >> 0 == +e[a + 1] ? [] : {}), t)[e[e.length - 1]] = s), t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, a] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, a, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, a, r] = /^@(.*?)\.(.*?)$/.exec(e), i = this.getval(a), o = a ? ("null" === i ? null : i || "{}") : "{}"; try { const e = JSON.parse(o); this.lodash_set(e, r, t), (s = this.setval(JSON.stringify(e), a)) } catch (e) { const i = {}; this.lodash_set(i, r, t), (s = this.setval(JSON.stringify(i), a)) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return (this.data = this.loaddata()), this.data[t]; default: return (this.data && this.data[t]) || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return ((this.data = this.loaddata()), (this.data[e] = t), this.writedata(), !0); default: return (this.data && this.data[e]) || null } } initGotEnv(t) { (this.got = this.got ? this.got : require("got")), (this.cktough = this.cktough ? this.cktough : require("tough-cookie")), (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()), t && ((t.headers = t.headers ? t.headers : {}), void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = () => { }) { switch ((t.headers && (delete t.headers[""]), this.getEnv())) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && ((t.headers = t.headers || {}), Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, a) => { !t && s && ((s.body = a), (s.statusCode = s.status ? s.status : s.statusCode), (s.status = s.statusCode)), e(t, s, a) }); break; case "Quantumult X": this.isNeedRewrite && ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t) => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o, } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o, }, i, o) }, (t) => e((t && t.error) || "UndefinedError")); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), (e.cookieJar = this.ckjar) } } catch (t) { this.logErr(t) } }).then((t) => { const { statusCode: a, statusCode: r, headers: i, rawBody: o, } = t, n = s.decode(o, this.encoding); e(null, { status: a, statusCode: r, headers: i, rawBody: o, body: n, }, n) }, (t) => { const { message: a, response: r } = t; e(a, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = () => { }) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch ((t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), this.getEnv())) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && ((t.headers = t.headers || {}), Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, a) => { !t && s && ((s.body = a), (s.statusCode = s.status ? s.status : s.statusCode), (s.status = s.statusCode)), e(t, s, a) }); break; case "Quantumult X": (t.method = s), this.isNeedRewrite && ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t) => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o, } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o, }, i, o) }, (t) => e((t && t.error) || "UndefinedError")); break; case "Node.js": let a = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...i } = t; this.got[s](r, i).then((t) => { const { statusCode: s, statusCode: r, headers: i, rawBody: o, } = t, n = a.decode(o, this.encoding); e(null, { status: s, statusCode: r, headers: i, rawBody: o, body: n }, n) }, (t) => { const { message: s, response: r } = t; e(s, r, r && a.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date(); let a = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in a) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? a[e] : ("00" + a[e]).substr(("" + a[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let a = t[s]; null != a && "" !== a && ("object" == typeof a && (a = JSON.stringify(a)), (e += `${s}=${a}&`)) } return (e = e.substring(0, e.length - 1)), e } msg(e = t, s = "", a = "", r) { const i = (t) => { switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } case "Loon": { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } case "Quantumult X": { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, a = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": a, } } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, a, i(r)); break; case "Quantumult X": $notify(e, s, a, i(r)); break; case "Node.js": }if (!this.isMuteLog) { let t = ["", "==============📣系统通知📣==============",]; t.push(e), s && t.push(s), a && t.push(a), console.log(t.join("\n")), (this.logs = this.logs.concat(t)) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `❗️${this.name},错误!`, t); break; case "Node.js": this.log("", `❗️${this.name},错误!`, t.stack) } } wait(t) { return new Promise((e) => setTimeout(e, t)) } DoubleLog(d) { if (this.isNode()) { if (d) { console.log(`${d}`); msg += `\n ${d}` } } else { console.log(`${d}`); msg += `\n ${d}` } } async SendMsg(m) { if (!m) return; if (Notify > 0) { if (this.isNode()) { var notify = require("./sendNotify"); await notify.sendNotify(this.name, m) } else { this.msg(this.name, "", m) } } else { console.log(m) } } done(t = {}) { const e = new Date().getTime(), s = (e - this.startTime) / 1e3; switch ((this.log("", `🔔${this.name},结束!🕛${s}秒`), this.log(), this.getEnv())) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } })(t, e) }
//Env rewrite:smallfawn Update-time:23-6-30 newAdd:DoubleLog & SendMsg

