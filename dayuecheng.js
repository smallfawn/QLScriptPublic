/*
 * 大悦城自动任务脚本 for 青龙面板
 * 环境变量：dyc
 * 格式：MallId#Token#PublicKey#mpOpenId
 * 多账号：MallId#Token#PublicKey#mpOpenId&MallId#Token#PublicKey#mpOpenId
 * 
 * 功能说明：
 * 1. 检查用户状态
 * 2. 自动签到
 * 3. 获取积分信息
 */

const $ = new Env("大悦城自动任务");
const notify = $.isNode() ? require("./sendNotify") : "";

// 环境变量名
const envName = "dyc";

// 固定参数
const mpAppId = "wxc1f0da607b34c3bd";
const systemInfo = {
    model: "microsoft",
    SDKVersion: "3.13.1",
    system: "Windows 10 x64",
    version: "4.1.6.46",
    miniVersion: "1.0.96"
};

class Dayuecheng {
    constructor(mallId, token, publicKey, mpOpenId) {
        this.mallId = mallId;
        this.token = token;
        this.publicKey = publicKey;
        this.mpOpenId = mpOpenId;
        this.baseUrl = "https://m-crm.joycity.mobi/api";
        this.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf254162e) XWEB/18151",
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Referer": "https://servicewechat.com/wxc1f0da607b34c3bd/40/page-frame.html",
            "xweb_xhr": "1"
        };
        this.retryCount = 3;
        this.retryDelay = 2000;
    }

    generateSign(timestamp, data) {
        const crypto = require("crypto");
        let signStr = timestamp + this.publicKey;
        
        if (data && data.trim() !== "") {
            signStr += data;
        }
        
        return crypto.createHash("md5").update(signStr).digest("hex");
    }

    generateSignAndTimestamp(data = "") {
        const timestamp = Date.now().toString();
        const sign = this.generateSign(timestamp, data);
        return { sign, timestamp };
    }

    async requestWithRetry(path, data, method = "POST", retry = this.retryCount) {
        let lastError;
        
        for (let i = 0; i < retry; i++) {
            try {
                if (i > 0) {
                    $.log(`🔄 第${i + 1}次重试请求: ${path}`);
                    await $.wait(this.retryDelay);
                }
                
                return await this.request(path, data, method);
            } catch (error) {
                lastError = error;
                $.log(`⚠️ 请求失败 (${i + 1}/${retry}): ${error.message}`);
                
                if (error.code === 'ECONNABORTED' || error.code === 'ENETUNREACH' || 
                    error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
                    continue;
                }
                
                break;
            }
        }
        
        throw lastError || new Error(`请求失败，重试${retry}次后仍然失败`);
    }

    async request(path, data, method = "POST") {
        const { sign, timestamp } = this.generateSignAndTimestamp(JSON.stringify(data));
        
        const headers = {
            ...this.headers,
            "Sign": sign,
            "Timestamp": timestamp,
            "PublicKey": this.publicKey
        };

        let requestData = {};
        
        if (path.includes("getSnsInfo")) {
            requestData = {
                MallId: this.mallId,
                mpAppId: mpAppId,
                mpOpenId: this.mpOpenId,
                Header: {
                    Token: this.token,
                    systemInfo: systemInfo
                }
            };
        } else {
            requestData = {
                MallID: this.mallId,
                Header: {
                    Token: this.token,
                    systemInfo: systemInfo
                }
            };
        }

        if (data && typeof data === 'object') {
            requestData = { ...requestData, ...data };
        }
        
        try {
            const response = await $.httpRequest({
                url: `${this.baseUrl}${path}`,
                method: method,
                headers: headers,
                data: JSON.stringify(requestData),
                timeout: 15000
            });

            const result = typeof response.data === "object" ? response.data : JSON.parse(response.data);
            
            $.log(`📡 ${method} ${path} -> ${result.m === 1 ? '成功' : '失败'}`);
            
            return result;
        } catch (error) {
            $.log(`❌ 请求异常: ${error.message}`);
            throw error;
        }
    }

    async checkUserStatus() {
        $.log("🔍 检查用户状态...");
        try {
            const result = await this.requestWithRetry("/passport/wx/mp/getSnsInfo", {});
            
            if (result.m === 1) {
                const authorized = result.d?.authorized;
                if (authorized) {
                    $.log("✅ 用户状态正常");
                    return { success: true, data: result.d };
                } else {
                    $.log("❌ 用户授权已失效");
                    return { success: false, message: "用户授权已失效" };
                }
            } else if (result.code === 401 || result.status === 401) {
                $.log("❌ Token已过期，需要重新获取");
                return { success: false, message: "Token已过期" };
            } else {
                $.log(`❌ 检查用户状态失败: ${result.e || "未知错误"}`);
                return { success: false, message: result.e || "未知错误" };
            }
        } catch (error) {
            $.log(`❌ 检查用户状态异常: ${error.message}`);
            return { success: false, message: error.message };
        }
    }

    async autoCheckin() {
        $.log("🔍 开始签到...");
        try {
            const result = await this.requestWithRetry("/user/User/CheckinV2", {});
            
            if (result.m === 1) {
                const data = result.d;
                if (data.IsCheckIn) {
                    $.log(`✅ 签到成功: ${data.Msg || "签到完成"}`);
                    if (data.NickName) {
                        $.log(`👤 用户: ${data.NickName}`);
                    }
                    if (data.Title) {
                        $.log(`📝 ${data.Title}`);
                    }
                    return { success: true, data: data };
                } else {
                    $.log(`❌ 签到失败: ${data.Msg || "未知原因"}`);
                    return { success: false, message: data.Msg || "未知原因" };
                }
            } else {
                $.log(`❌ 签到接口调用失败: ${result.e || "未知错误"}`);
                return { success: false, message: result.e || "未知错误" };
            }
        } catch (error) {
            $.log(`❌ 签到异常: ${error.message}`);
            return { success: false, message: error.message };
        }
    }

    async getUserPoints() {
        $.log("🔍 获取用户积分...");
        try {
            const result = await this.requestWithRetry("/user/user/GetMallCard_Encrypt", {});
            
            if (result.m === 1) {
                const data = result.d;
                const points = data.Bonus;
                $.log(`💰 当前积分: ${points}`);
                if (data.CardTitle) {
                    $.log(`🎫 卡片类型: ${data.CardTitle}`);
                }
                if (data.CardLevel) {
                    $.log(`⭐ 卡片等级: ${data.CardLevel}`);
                }
                return { success: true, points: points, data: data };
            } else {
                $.log(`❌ 获取积分失败: ${result.e || "未知错误"}`);
                return { success: false, message: result.e || "未知错误" };
            }
        } catch (error) {
            $.log(`❌ 获取积分异常: ${error.message}`);
            return { success: false, message: error.message };
        }
    }

    async runAllTasks() {
        $.log(`🏪 开始处理大悦城账号: ${this.mallId}`);
        
        const taskResults = [];
        
        const statusResult = await this.checkUserStatus();
        taskResults.push({ name: "用户状态检查", success: statusResult.success });
        
        if (!statusResult.success) {
            $.log("❌ 用户状态异常，跳过后续任务");
            return { 
                success: false, 
                message: statusResult.message || "用户状态异常",
                taskResults: taskResults 
            };
        }
        
        const checkinResult = await this.autoCheckin();
        taskResults.push({ name: "自动签到", success: checkinResult.success });
        
        const pointsResult = await this.getUserPoints();
        taskResults.push({ name: "获取积分", success: pointsResult.success });
        
        const successCount = taskResults.filter(r => r.success).length;
        const totalCount = taskResults.length;
        
        $.log(`\n📊 任务执行汇总: ${successCount}/${totalCount} 成功`);
        taskResults.forEach((task, index) => {
            $.log(`${task.success ? '✅' : '❌'} ${index + 1}. ${task.name}`);
        });
        
        return {
            success: successCount === totalCount,
            taskResults: taskResults,
            summary: {
                successCount: successCount,
                totalCount: totalCount,
                mallId: this.mallId,
                publicKey: this.publicKey,
                mpOpenId: this.mpOpenId
            }
        };
    }
}

function Env(name) {
    this.name = name;
    this.logs = [];
    
    this.log = (...args) => {
        const msg = args.join(" ");
        const timestamp = new Date().toLocaleTimeString();
        const logMsg = `[${timestamp}] ${msg}`;
        this.logs.push(logMsg);
        console.log(logMsg);
    };
    
    this.isNode = () => {
        return typeof process !== "undefined" && process.release && process.release.name === 'node';
    };
    
    this.getdata = (key) => {
        if (this.isNode()) {
            return process.env[key] || "";
        }
        return "";
    };
    
    this.wait = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };
    
    this.httpRequest = async (config) => {
        if (this.isNode()) {
            const axios = require('axios');
            try {
                const response = await axios({
                    ...config,
                    validateStatus: function (status) {
                        return status >= 200 && status < 500;
                    }
                });
                return response;
            } catch (error) {
                throw error;
            }
        } else {
            throw new Error("非Node环境不支持HTTP请求");
        }
    };
    
    this.done = () => {
        if (this.isNode()) {
            process.exit(0);
        }
    };
}

async function main() {
    const envValue = $.getdata(envName);
    if (!envValue) {
        $.log(`❌ 未找到环境变量 ${envName}`);
        $.log(`💡 请添加环境变量 ${envName}，格式: MallId#Token#PublicKey#mpOpenId`);
        $.log(`📝 多账号格式: MallId#Token#PublicKey#mpOpenId&MallId#Token#PublicKey#mpOpenId`);
        return;
    }
    
    const accounts = [];
    const accountStrings = envValue.split('&').filter(Boolean);
    
    for (const accountStr of accountStrings) {
        const parts = accountStr.split('#');
        if (parts.length === 4) {
            const mallId = parts[0].trim();
            const token = parts[1].trim();
            const publicKey = parts[2].trim();
            const mpOpenId = parts[3].trim();
            
            if (mallId && token && publicKey && mpOpenId) {
                accounts.push({ mallId, token, publicKey, mpOpenId });
            } else {
                $.log(`⚠️ 忽略无效账号格式: ${accountStr}`);
            }
        } else {
            $.log(`⚠️ 忽略格式错误的账号（需要4个参数）: ${accountStr}`);
        }
    }
    
    if (accounts.length === 0) {
        $.log("❌ 未找到有效的账号配置");
        $.log("💡 正确格式: MallId#Token#PublicKey#mpOpenId");
        $.log("💡 多账号: MallId#Token#PublicKey#mpOpenId&MallId#Token#PublicKey#mpOpenId");
        return;
    }
    
    $.log(`🎯 共找到 ${accounts.length} 个有效账号`);
    
    const allResults = [];
    
    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        $.log(`\n📱 开始处理第 ${i + 1} 个账号 (MallId: ${account.mallId})`);
        
        try {
            const dyc = new Dayuecheng(account.mallId, account.token, account.publicKey, account.mpOpenId);
            const result = await dyc.runAllTasks();
            
            allResults.push({
                mallId: account.mallId,
                ...result
            });
            
            if (i < accounts.length - 1) {
                $.log(`⏳ 等待3秒后处理下一个账号...`);
                await $.wait(3000);
            }
        } catch (error) {
            $.log(`❌ 处理账号异常: ${error.message}`);
            allResults.push({
                mallId: account.mallId,
                success: false,
                error: error.message,
                taskResults: []
            });
        }
    }
    
    $.log("\n" + "=".repeat(60));
    $.log("📈 所有账号任务执行汇总:");
    $.log("=".repeat(60));
    
    let totalSuccess = 0;
    let totalTasks = 0;
    
    allResults.forEach((result, index) => {
        const successCount = result.taskResults ? result.taskResults.filter(r => r.success).length : 0;
        const totalCount = result.taskResults ? result.taskResults.length : 0;
        
        $.log(`\n账号 ${index + 1} (MallId: ${result.mallId}):`);
        $.log(`  ${result.success ? '✅ 成功' : '❌ 失败'} (${successCount}/${totalCount} 任务成功)`);
        
        if (result.taskResults) {
            result.taskResults.forEach((task, taskIndex) => {
                $.log(`    ${task.success ? '✅' : '❌'} ${task.name}`);
            });
        }
        
        if (result.error) {
            $.log(`    错误: ${result.error}`);
        }
        
        totalSuccess += successCount;
        totalTasks += totalCount;
    });
    
    $.log("\n" + "=".repeat(60));
    $.log(`📊 总体统计: ${totalSuccess}/${totalTasks} 个任务成功完成`);
    $.log("=".repeat(60));
    
    if ($.isNode() && notify) {
        try {
            const summaryText = allResults.map(r => {
                const successCount = r.taskResults ? r.taskResults.filter(t => t.success).length : 0;
                const totalCount = r.taskResults ? r.taskResults.length : 0;
                return `MallId: ${r.mallId} - ${successCount}/${totalCount} 成功`;
            }).join('\n');
            
            const title = `大悦城自动任务 - ${allResults.filter(r => r.success).length}/${allResults.length} 个账号成功`;
            const content = $.logs.join("\n") + "\n\n" + summaryText;
            
            await notify.sendNotify(title, content);
        } catch (error) {
            $.log(`⚠️ 发送通知失败: ${error.message}`);
        }
    }
}

if (require.main === module) {
    main().catch(e => {
        $.log(`❌ 脚本执行异常: ${e.message}`);
        console.error(e.stack);
    }).finally(() => {
        $.done();
    });
}
