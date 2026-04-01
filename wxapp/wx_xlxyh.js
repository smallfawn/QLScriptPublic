const ckName = "wx_xlxyh";

// 工具类
class Env {
    constructor(name) {
        this.name = name;
        this.logs = [];
    }

    log(...args) {
        const msg = args.join(" ");
        this.logs.push(msg);
        console.log(msg);
    }

    isNode() {
        return typeof process !== "undefined" && process.release && process.release.name === 'node';
    }

    getdata(key) {
        if (this.isNode()) {
            return process.env[key] || "";
        }
        return localStorage.getItem(key) || "";
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async httpRequest(config) {
        if (this.isNode()) {
            const axios = require('axios');
            return await axios(config);
        } else {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open(config.method || 'GET', config.url);
                
                if (config.headers) {
                    for (const [key, value] of Object.entries(config.headers)) {
                        xhr.setRequestHeader(key, value);
                    }
                }
                
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            resolve({ data });
                        } catch (e) {
                            resolve({ data: xhr.responseText });
                        }
                    } else {
                        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                    }
                };
                
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(config.data);
            });
        }
    }

    done() {
        if (this.isNode()) {
            process.exit(0);
        }
    }
}

// 初始化环境
const $ = new Env("骁龙骁友会");

class XLXYH {
    constructor(ck) {
        const parts = ck.split("#");
        this.ck = (parts[0] || "").trim();
        this.userId = (parts[1] || "").trim();
        this.openId = "";
        this.valid = !!(this.ck && this.userId);
    }

    generateSign(timestamp, requestId, body = "") {
        const crypto = require("crypto");
        return crypto.createHash("md5")
            .update(`${timestamp}${requestId}${body}boysup`)
            .digest("hex");
    }

    uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    async request(method, path, data = null, extraHeaders = {}, skipSign = false) {
        if (!this.valid) {
            return { code: 400, message: "CK无效" };
        }

        const timestamp = Date.now().toString();
        const requestId = this.uuid().replace(/-/g, "");
        const sign = skipSign ? "" : this.generateSign(timestamp, requestId, data || "");

        const headers = {
            "Host": "qualcomm.boysup.cn",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "timestamp": timestamp,
            "sign": sign,
            "xweb_xhr": "1",
            "openId": this.openId,
            "requestId": requestId,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf254162e) XWEB/18151",
            "userId": this.userId,
            "sessionKey": this.ck,
            "Referer": "https://servicewechat.com/wx026c06df6adc5d06/644/page-frame.html",
            "Accept": "*/*",
            "Sec-Fetch-Site": "cross-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            ...extraHeaders
        };

        if (skipSign) {
            delete headers.sign;
        }

        try {
            const config = {
                url: `https://qualcomm.boysup.cn${path}`,
                method,
                headers
            };

            if (data && method !== "GET") {
                config.data = data;
            }

            const resp = await $.httpRequest(config);
            
            if (typeof resp.data === "object") {
                return resp.data;
            } else {
                return JSON.parse(resp.data);
            }
        } catch (e) {
            const msg = e.response?.data?.message || e.message || "网络错误";
            $.log(`❌ 请求失败: ${msg} (路径: ${path})`);
            if (e.response) {
                $.log(`📄 响应数据: ${JSON.stringify(e.response.data)}`);
            }
            return { 
                code: e.response?.status || 500, 
                message: msg,
                response: e.response
            };
        }
    }

    async getOpenId() {
        $.log("🔍 尝试获取openId...");
        const openIdRes = await this.request(
            "GET", 
            `/qualcomm-app/api/user/info?userId=${this.userId}`,
            null,
            {},
            true
        );
        
        if (openIdRes.code === 200 && openIdRes.data) {
            this.openId = openIdRes.data.openId || "";
            $.log(`✅ 获取到openId: ${this.openId || "空"}`);
            return true;
        } else {
            $.log(`❌ 获取openId失败: ${openIdRes.message}`);
            return false;
        }
    }

    async run() {
        if (!this.valid) {
            $.log(`❌ CK格式错误，请使用: sessionKey#userId`);
            return;
        }

        if (!(await this.getOpenId())) {
            $.log("❌ 获取openId失败，可能sessionKey已过期");
            return;
        }

        $.log("🔍 获取用户信息...");
        const userInfo = await this.request("GET", `/qualcomm-app/api/user/info?userId=${this.userId}`);
        if (userInfo.code !== 200) {
            $.log(`❌ 账号[${this.userId}] 获取用户信息失败: ${userInfo.message}`);
            if (userInfo.message.includes("登录过期") || userInfo.code === 401) {
                $.log("⚠️ 登录已过期，请重新获取sessionKey和userId");
                return;
            }
            return;
        }

        $.log(`✅ 【${userInfo.data.nick}】等级${userInfo.data.level} | 积分: ${userInfo.data.coreCoin}`);

        $.log("🔍 检查签到状态...");
        const signList = await this.request("GET", `/qualcomm-app/api/user/signList?userId=${this.userId}`);
        if (signList.code === 200) {
            if (signList.data?.isSignToday !== 1) {
                $.log("🔍 开始签到...");
                const signResult = await this.request("POST", `/qualcomm-app/api/user/signIn?userId=${this.userId}`);
                if (signResult.code === 200) {
                    $.log(`✅ 签到成功 +${signResult.data.coreCoin}积分`);
                } else {
                    $.log(`❌ 签到失败: ${signResult.message}`);
                }
            } else {
                $.log("✅ 今日已签到");
            }
        } else {
            $.log(`❌ 获取签到状态失败: ${signList.message}`);
        }

        await this.handleDrawTask();

        await this.handleReadTask();

        await this.handleVlogTask();
    }

    async handleDrawTask() {
        $.log("🔍 开始抽奖任务...");
        
        // 修改为使用正确的抽奖接口
        const drawResult = await this.request(
            "POST", 
            "/qualcomm-app/api/luckDraw/getLuck", 
            `userId=${this.userId}&activityId=7`
        );
        
        if (drawResult.code === 200) {
            if (drawResult.data && drawResult.data.name) {
                $.log(`✅ 抽奖成功: ${drawResult.data.name}`);
            } else {
                $.log(`✅ 抽奖成功: 获得奖励`);
            }
            
            // 如果有积分信息，也显示出来
            if (drawResult.data.coreCoin) {
                $.log(`💰 获得积分: ${drawResult.data.coreCoin}`);
            }
        } else if (drawResult.code === 201) {
            $.log(`ℹ️ ${drawResult.message || '抽奖提示'}`);
        } else {
            $.log(`❌ 抽奖失败: ${drawResult.message || '接口请求错误'}`);
        }
    }

    async handleReadTask() {
        $.log("🔍 获取文章列表...");
        const articleRes = await this.request(
            "GET", 
            `/qualcomm-app/api/home/articles?page=1&size=10&userId=${this.userId}&type=0&searchDate=&articleShowPlace=骁友资讯列表页`
        );

        if (articleRes.code === 200 && articleRes.data?.articleList?.length) {
            const article = articleRes.data.articleList[0];
            $.log(`📖 开始阅读: ${article.title.substring(0, 20)}...`);

            const enterRes = await this.request("POST", 
                "/qualcomm-app/api/article/enterReadDaily", 
                `articleId=${article.id}&userId=${this.userId}`
            );
            
            if (enterRes.code !== 200) {
                $.log(`⚠️ 进入阅读失败: ${enterRes.message}`);
            }

            const likeRes = await this.request("GET", 
                `/qualcomm-app/api/article/like?articleId=${article.id}&userId=${this.userId}`
            );
            
            if (likeRes.code === 200) {
                $.log("👍 点赞成功");
            } else {
                $.log(`⚠️ 点赞失败: ${likeRes.message}`);
            }

            const shareRes = await this.request("POST", 
                "/qualcomm-app/api/article/shareDaily", 
                `articleId=${article.id}&userId=${this.userId}`
            );
            
            if (shareRes.code === 200) {
                $.log("🔗 分享成功");
            } else {
                $.log(`⚠️ 分享失败: ${shareRes.message}`);
            }

            $.log("⏳ 模拟阅读65秒...");
            await $.wait(65000);

            const exitRes = await this.request("POST", 
                "/qualcomm-app/api/article/exitReadDaily", 
                `articleId=${article.id}&userId=${this.userId}`
            );
            
            if (exitRes.code === 200) {
                $.log("✅ 阅读任务完成");
            } else {
                $.log(`⚠️ 退出阅读失败: ${exitRes.message}`);
            }
        } else {
            $.log("ℹ️ 未获取到文章，跳过阅读任务");
        }
    }

    async handleVlogTask() {
        $.log("🔍 获取VLOG列表...");
        
        const vlogRes = await this.request(
            "GET",
            `/qualcomm-app/api/article/vlogList?page=1&size=20&userId=${this.userId}&sortBy=1`
        );

        if (vlogRes.code === 200 && vlogRes.data?.records?.length) {
            const vlogs = vlogRes.data.records;
            $.log(`✅ 获取到 ${vlogs.length} 个VLOG`);
            
            // 只获取第一个VLOG，不管是否已观看
            const targetVlog = vlogs[0];
            $.log(`🎬 开始观看第一个VLOG: ${targetVlog.title.substring(0, 20)}...`);
            $.log(`📊 时长: ${targetVlog.videoDuration} | 播放: ${targetVlog.playCountFormat} | 点赞: ${targetVlog.likeCount}`);

            const enterRes = await this.request(
                "POST",
                "/qualcomm-app/api/article/enterReadDaily",
                `articleId=${targetVlog.id}&userId=${this.userId}`
            );

            if (enterRes.code === 200) {
                $.log("✅ 进入VLOG观看成功");
                
                // 固定观看70秒，不管视频时长
                const waitTime = 70000;
                
                $.log(`⏳ 模拟观看VLOG 70秒...`);
                await $.wait(waitTime);

                const exitRes = await this.request(
                    "POST",
                    "/qualcomm-app/api/article/exitReadDaily",
                    `articleId=${targetVlog.id}&userId=${this.userId}`
                );

                if (exitRes.code === 200) {
                    $.log("✅ VLOG观看任务完成");
                    
                    await this.request(
                        "GET",
                        `/qualcomm-app/api/article/like?articleId=${targetVlog.id}&userId=${this.userId}`
                    );
                    
                    await this.request(
                        "POST",
                        "/qualcomm-app/api/article/shareDaily",
                        `articleId=${targetVlog.id}&userId=${this.userId}`
                    );
                    
                    $.log("✅ VLOG点赞和分享完成");
                } else {
                    $.log(`⚠️ 退出VLOG观看失败: ${exitRes.message}`);
                }
            } else {
                $.log(`❌ 进入VLOG观看失败: ${enterRes.message}`);
            }
        } else {
            $.log(`❌ 获取VLOG列表失败: ${vlogRes.message || '未知错误'}`);
        }
    }

    async batchHandleVlogs(count = 1) {
        // 修改默认只处理1个VLOG
        $.log(`🔍 开始批量处理${count}个VLOG任务...`);
        
        const vlogRes = await this.request(
            "GET",
            `/qualcomm-app/api/article/vlogList?page=1&size=20&userId=${this.userId}&sortBy=1`
        );

        if (vlogRes.code === 200 && vlogRes.data?.records?.length) {
            const vlogs = vlogRes.data.records;
            
            // 只处理前count个VLOG，不筛选是否已观看
            const tasks = Math.min(count, vlogs.length);
            let completed = 0;

            for (let i = 0; i < tasks; i++) {
                const vlog = vlogs[i];
                $.log(`\n🎬 处理第 ${i + 1}/${tasks} 个VLOG: ${vlog.title.substring(0, 20)}...`);

                try {
                    const enterRes = await this.request(
                        "POST",
                        "/qualcomm-app/api/article/enterReadDaily",
                        `articleId=${vlog.id}&userId=${this.userId}`
                    );

                    if (enterRes.code === 200) {
                        // 固定观看70秒
                        const waitTime = 70000;

                        $.log(`⏳ 观看中... (70秒)`);
                        await $.wait(waitTime);

                        const exitRes = await this.request(
                            "POST",
                            "/qualcomm-app/api/article/exitReadDaily",
                            `articleId=${vlog.id}&userId=${this.userId}`
                        );

                        if (exitRes.code === 200) {
                            completed++;
                            $.log(`✅ 第 ${i + 1} 个VLOG观看完成`);
                            
                            await this.request(
                                "GET",
                                `/qualcomm-app/api/article/like?articleId=${vlog.id}&userId=${this.userId}`
                            );
                            await this.request(
                                "POST",
                                "/qualcomm-app/api/article/shareDaily",
                                `articleId=${vlog.id}&userId=${this.userId}`
                            );
                        }
                    }
                } catch (error) {
                    $.log(`❌ 处理VLOG失败: ${error.message}`);
                }

                if (i < tasks - 1) {
                    await $.wait(2000);
                }
            }

            $.log(`\n🎉 批量VLOG任务完成: ${completed}/${tasks} 个VLOG观看成功`);
            return completed;
        } else {
            $.log("❌ 无法获取VLOG列表");
            return 0;
        }
    }
}

async function main() {
    let cookies = [];
    
    if ($.isNode()) {
        const raw = process.env[ckName] || "";
        cookies = raw.split(/[#&\n]/).filter(Boolean);
        
        if (!cookies.length) {
            const fs = require('fs');
            try {
                if (fs.existsSync(`${ckName}.txt`)) {
                    const content = fs.readFileSync(`${ckName}.txt`, 'utf8');
                    cookies = content.split(/[#&\n]/).filter(Boolean);
                }
            } catch (e) {
            }
        }
    } else {
        const raw = $.getdata(ckName) || "";
        cookies = raw.split(/[#&\n]/).filter(Boolean);
    }

    if (!cookies.length) {
        $.log(`🔔 未找到变量【${ckName}】，请添加`);
        $.log(`💡 CK格式: sessionKey#userId`);
        $.log(`📝 配置方法:`);
        $.log(`   1. Node.js: 设置环境变量 ${ckName}="sessionKey#userId"`);
        $.log(`   2. 浏览器: 设置 localStorage.${ckName}="sessionKey#userId"`);
        $.log(`   3. 本地文件: 创建 ${ckName}.txt 文件，每行一个 sessionKey#userId`);
        return;
    }

    const accounts = [];
    for (let i = 0; i < cookies.length; i += 2) {
        if (cookies[i] && cookies[i + 1]) {
            accounts.push(`${cookies[i]}#${cookies[i + 1]}`);
        } else if (cookies[i] && cookies[i].includes('#')) {
            accounts.push(cookies[i]);
        }
    }

    if (!accounts.length) {
        $.log("❌ CK格式错误，请检查是否为 'sessionKey#userId' 格式");
        return;
    }

    $.log(`🎯 共加载 ${accounts.length} 个账号`);

    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        $.log(`\n📱 开始处理账号 ${i + 1}/${accounts.length}`);
        
        try {
            const xlxyh = new XLXYH(account);
            
            await xlxyh.run();
            
            const vlogCount = 1; // 只观看1个VLOG
            await xlxyh.batchHandleVlogs(vlogCount);
            
            if (i < accounts.length - 1) {
                await $.wait(3000);
            }
        } catch (error) {
            $.log(`❌ 账号 ${i + 1} 处理失败: ${error.message}`);
        }
    }

    if ($.isNode()) {
        try {
            if (process.env.NOTIFY_TOKEN || process.env.PUSH_PLUS_TOKEN || process.env.SERVER_CHAN_TOKEN) {
                await sendNotify($.name, $.logs.join("\n"));
            }
        } catch (error) {
        }
    }

    $.log("\n🎉 所有账号处理完成！");
}

main().catch(e => {
    $.log(`❌ 脚本异常: ${e.message || e}`);
    console.error(e.stack);
}).finally(() => {
    $.done();
});

async function sendNotify(title, content) {
    if (!content) return;
    
    const notifyTokens = [
        process.env.NOTIFY_TOKEN,
        process.env.PUSH_PLUS_TOKEN,
        process.env.SERVER_CHAN_TOKEN
    ].filter(token => token);

    for (const token of notifyTokens) {
        try {
            const notify = require('sendNotify');
            await notify.sendNotify(title, content);
            break;
        } catch (error) {
        }
    }
}
