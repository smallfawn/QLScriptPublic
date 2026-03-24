//设置中国时间
process.env.TZ = "Asia/Shanghai";
const DEFAULT_MAX_REWARD = 30 * 1000;
const DEFAULT_TASKS = ["look", "food", "box"];
const DEFAULT_SEARCH_KEYS = ["短剧", "好货", "百度极速版"];
const DEFAULT_DAILY_TASKS = ["signin", "box", "huge"];
const REQUIRED_COOKIE_KEYS = [
    "kpn",
    "kpf",
    "userId",
    "did",
    "c",
    "appver",
    "language",
    "mod",
    "did_tag",
    "egid",
    "oDid",
    "androidApiLevel",
    "newOc",
    "browseType",
    "socName",
    "ftt",
    "abi",
    "userRecoBit",
    "device_abi",
    "grant_browse_type",
    "iuid",
    "rdid",
    "kuaishou.api_st",
];
const PHONE_MODEL_MAP = {
    MI: [
        "8 Lite",
        "9 Pro",
        "10 Ultra",
        "11T",
        "12X",
        "Note 10",
        "Mix 4",
        "CC9",
        "Pad 5",
    ],
    Huawei: ["P50 Pro", "Mate 40", "Nova 9", "P40 Lite", "MatePad 11", "Enjoy 20e"],
    OPPO: ["Reno 6", "Find X3", "A95", "K9", "Reno 5 Lite", "A74 5G"],
    Vivo: ["X70 Pro", "Y53s", "V21", "S10", "Y20", "X60 Lite"],
    Samsung: ["Galaxy S21", "A52 5G", "M32", "F62", "Z Flip3", "Note 20 Ultra"],
    OnePlus: ["9R", "Nord 2", "8T", "9 Pro", "Nord CE"],
    Realme: ["8 Pro", "GT Neo", "X7 Max", "C25", "Narzo 30"],
    Xiaomi: ["11 Lite", "Redmi Note 10", "Poco X3", "Black Shark 4", "Mi 11i"],
    Nokia: ["G50", "X100", "C20", "5.4", "8.3 5G"],
    Sony: ["Xperia 1 III", "Xperia 5 II", "Xperia 10 III", "Xperia Pro"],
};
const PHONE_MODEL_BRANDS = Object.keys(PHONE_MODEL_MAP);
const crypto = require("crypto");

function generateRandomPhoneModel() {
    const brand =
        PHONE_MODEL_BRANDS[Math.floor(Math.random() * PHONE_MODEL_BRANDS.length)];
    const modelList = PHONE_MODEL_MAP[brand] || [];
    const model = modelList[Math.floor(Math.random() * modelList.length)] || "8 Lite";
    return `${brand} ${model} Build/QKQ1.190910.002`;
}

function readEnvString(name, fallback = "") {
    const value = process.env[name];
    if (value === undefined || value === null || value === "") {
        return fallback;
    }
    return String(value);
}

function readEnvNumber(name, fallback, { min = -Infinity, max = Infinity } = {}) {
    const value = process.env[name];
    if (value === undefined || value === null || value === "") {
        return fallback;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.min(max, Math.max(min, Math.floor(parsed)));
}

function readEnvBooleanString(name, fallback = false) {
    const value = process.env[name];
    if (value === undefined || value === null || value === "") {
        return fallback ? "true" : "false";
    }
    return String(value).toLowerCase() === "true" ? "true" : "false";
}

function parseCsvList(value, fallback = []) {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }
    if (typeof value !== "string") {
        return [...fallback];
    }
    const parsed = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    return parsed.length > 0 ? parsed : [...fallback];
}

function parseCookieString(cookieText, { encodeValues = false } = {}) {
    const cookieObj = {};
    if (!cookieText) {
        return cookieObj;
    }

    cookieText.split(";").forEach((cookieItem) => {
        const segment = cookieItem.trim();
        if (!segment) {
            return;
        }

        const separatorIndex = segment.indexOf("=");
        if (separatorIndex < 0) {
            return;
        }

        const name = segment.slice(0, separatorIndex).trim();
        let value = segment.slice(separatorIndex + 1);
        if (!name) {
            return;
        }

        if (encodeValues && value) {
            value = encodeURIComponent(value);
        }
        cookieObj[name] = value;
    });

    return cookieObj;
}

function buildCookieString(cookieObj) {
    return Object.entries(cookieObj)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ");
}

function getRandomItem(list) {
    if (!Array.isArray(list) || list.length === 0) {
        return "";
    }
    return list[Math.floor(Math.random() * list.length)];
}

function splitIntoChunks(list, chunkSize) {
    const chunks = [];
    for (let i = 0; i < list.length; i += chunkSize) {
        chunks.push(list.slice(i, i + chunkSize));
    }
    return chunks;
}

function shuffleList(list) {
    const shuffled = Array.isArray(list) ? [...list] : [];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
let signApiUrls = [];
let banUserId = [];
let ksmaxtask_look = readEnvNumber("ksmaxtask_look", 50, { min: 0 });
let ksmaxtask_food = readEnvNumber("ksmaxtask_food", 5, { min: 0 });
let ksmaxtask_box = readEnvNumber("ksmaxtask_box", 5, { min: 0 });
let ksmaxtask_search = readEnvNumber("ksmaxtask_search", 25, { min: 0 });
let searchKey = "";
let signApi = "";
let ksnoDelay = readEnvBooleanString("ksnoDelay", false);
let ksmaxreward = readEnvNumber("ksmaxreward", DEFAULT_MAX_REWARD, { min: 0 });
let ksTaskNum = readEnvNumber("ksTaskNum", 10, { min: 1, max: 10 });
let ksispasslive = readEnvString("ksispasslive", "true");
let ksisadadd = process.env["ksisadadd"] !== "false"; // 新增：默认true，当设置为false时不追加广告
let kssearch = parseCsvList(process.env["kssearch"], DEFAULT_SEARCH_KEYS);
let ksextratask = readEnvString("ksextratask", "true");
let version = "20251105-gay-s";
let kstask = readEnvString("kstask", "look,box,food,search");
let ksdailytask = parseCsvList(process.env["ksdailytask"], DEFAULT_DAILY_TASKS);
let task = parseCsvList(kstask, DEFAULT_TASKS);
let invite = [];
let invite2 = [];
let ksuserinvite = parseCsvList(process.env["ksuserinvite"], []);
const axios = require("axios");
console.log(`安装nodejs依赖 axios socks-proxy-agent smallfawn三个`);
let {
    initSync,
    apien,
    getSig56_1,
    getSig56_2,
    getSig68,
    version: smallfawnver,
} = require("smallfawn");
const { SocksProxyAgent } = require("socks-proxy-agent");
class UserDataManager {
    constructor() {
        this.userData = {};
        this.userDataPath = require("path").resolve("./users.json");
        this.loadUserData();
    }

    loadUserData() {
        try {
            const fs = require("fs");
            if (fs.existsSync(this.userDataPath)) {
                const data = fs.readFileSync(this.userDataPath, "utf8");
                this.userData = JSON.parse(data);
                console.log(
                    `✅ 成功加载用户数据，共 ${Object.keys(this.userData).length} 个用户`
                );
            } else {
                this.userData = {};
                console.log("⚠️ 用户数据文件不存在，将创建新文件");
            }
        } catch (e) {
            console.log(`❌ 加载用户数据失败: ${e.message}`);
            this.userData = {};
        }
    }

    saveUserData() {
        try {
            const fs = require("fs");
            fs.writeFileSync(
                this.userDataPath,
                JSON.stringify(this.userData, null, 2)
            );
            console.log(`✅ 用户数据已保存到 ${this.userDataPath}`);
        } catch (e) {
            console.log(`❌ 保存用户数据失败: ${e.message}`);
        }
    }

    updateUserRecord(userId, currentEarnings) {
        const now = Date.now();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!this.userData[userId]) {
            // 新用户，第一次使用
            this.userData[userId] = {
                firstUseTimestamp: now,
                initialEarnings: currentEarnings,
                lastUpdate: now,
                totalEarnings: currentEarnings,
                usageCount: 1,
                todayEarnings: currentEarnings,
            };
            console.log(
                `📝 新用户 ${userId} 已记录，初始收益: ${currentEarnings} 金币`
            );
        } else {
            const userRecord = this.userData[userId];
            const lastUpdateDate = new Date(userRecord.lastUpdate);
            const isNewDay =
                lastUpdateDate.getDate() !== today.getDate() ||
                lastUpdateDate.getMonth() !== today.getMonth() ||
                lastUpdateDate.getFullYear() !== today.getFullYear();

            if (isNewDay) {
                // 新的一天，重置今日收益
                userRecord.initialEarnings = currentEarnings;
                userRecord.todayEarnings = currentEarnings;
                console.log(`📅 用户 ${userId} 新的一天开始，重置今日收益记录`);
            } else {
                // 同一天，更新今日收益
                userRecord.todayEarnings = currentEarnings;
            }

            // 更新其他信息
            userRecord.lastUpdate = now;
            userRecord.totalEarnings = Math.max(
                userRecord.totalEarnings,
                currentEarnings
            );
            userRecord.usageCount = (userRecord.usageCount || 0) + 1;
            // 计算今日实际收益
            const todayActualEarnings = currentEarnings - userRecord.initialEarnings;
            console.log(
                `📊 用户 ${userId} 今日收益: ${todayActualEarnings} 金币，总使用次数: ${userRecord.usageCount}`
            );
        }
    }

    getUserStats(userId) {
        if (this.userData[userId]) {
            const record = this.userData[userId];
            const todayEarnings = record.todayEarnings - record.initialEarnings;

            return {
                firstUseTime: new Date(record.firstUseTimestamp).toLocaleString(),
                initialEarnings: record.initialEarnings,
                todayEarnings: todayEarnings,
                totalEarnings: record.totalEarnings,
                usageCount: record.usageCount,
                lastUpdate: new Date(record.lastUpdate).toLocaleString(),
            };
        }
        return null;
    }

    getAllUserStats() {
        const stats = [];
        for (const userId in this.userData) {
            const userStats = this.getUserStats(userId);
            if (userStats) {
                stats.push({
                    userId: userId,
                    ...userStats,
                });
            }
        }
        return stats;
    }
}

// 创建全局用户数据管理器实例
const userDataManager = new UserDataManager();

const $ = new Env("好耶是男同！");
let ckName = `ksck`;
const strSplitor = "#";
const envSplitor = ["&", "\n"];
/*process.env[ckName] =
  "mod=Xiaomi(2311DRK48C);appver=13.8.40.10657;userid=2106951550;did_tag=0;egid=DFPA31B42288243831895E5FFCEBFB6E26C9F1ECC2C45BFB60142EDE19C17119;thermal=10000;kcv=1603;app=0;bottom_navigation=true;androidApiLevel=35;slh=0;nbh=142;did_gt=1764357252723;keyconfig_state=1;client_key=2ac2a76d;sh=2712;deviceBit=0;ddpi=480;kuaishou.api_st=Cg9rdWFpc2hvdS5hcGkuc3QSoAF-FdkLF9brcqtr9iRLO-vyKj6UleRQczMQ04aZeDd-i80gKeWCemoTbzrJKKlYClGacp5gmx-v1votae2T05Z9v2TxXakLWHpxCy55Um39d0saKKhQ6uCiBZvzOOA86qaF7J6uRi-s3OOKF3Na_-cf858Sf5GPgQnMl110ZEre0RAeVq_mTMRh0_no7JY8Kigq9kgB2qaSSSiBLcp6Eh86GhJmtLHvm4BGCob9TuUwQR1Z_BoiIKtdP0U6-rOx35npZCLIUGw22QK33ieTNaRICi5bwjLsKAUwAQ;is_background=0;c=XIAOMI;sw=1220;ftt=;apptype=22;abi=arm64;device_abi=arm64;userId=2106951550;icaver=1;totalMemory=11341;iuid=;did=ANDROID_74461cb647b6d947;earphoneMode=1;isp=CMCC;language=zh-cn;ud=2106951550;net=WIFI;kpf=ANDROID_PHONE;ver=13.8;android_os=0;oDid=ANDROID_ecd03400cd586ee0;boardPlatform=mt6897;kpn=NEBULA;newOc=XIAOMI;country_code=cn;hotfix_ver=;cdid_tag=2;sys=ANDROID_15;max_memory=256;cold_launch_time_ms=1764570673801;oc=XIAOMI;browseType=3;socName=MediaTek MT6897;os=android;userRecoBit=0;grant_browse_type=AUTHORIZED;rdid=ANDROID_53feec990df544c2;sbh=102;darkMode=false#8d378e0068b6b354690cc92112a7520a";*/

try {
    notify = require("./sendNotify.js");
} catch (e) {
    notify = {
        sendNotify: async function (title, content) { },
    };
}
const defaultUserAgent = "kwai-android aegon/4.28.0";

class Task {
    constructor(env) {
        this.index = $.userIdx++;
        this.user = env.split(strSplitor);
        //遍历CK如果某一项的值存在空格则编码
        this.ck = this.user[0];
        this.salt = this.user[1];
        this.sock = null;
        this.nickname = null;
        this.ksextratask = ksextratask;
        // 新增：是否追加广告控制
        this.isAdAddEnabled = ksisadadd;
        this.apiac = "";
        // 新增：当前收益属性
        this.currentEarnings = 0;
        // 新增：最大金币限制
        this.maxReward = ksmaxreward;
        if (!Number.isFinite(this.maxReward) || this.maxReward < 0) {
            this.maxReward = DEFAULT_MAX_REWARD;
        }

        // 新增：待上报金币
        this.pendingCoins = 0;

        // 新增：停止标志
        this.shouldStop = false;
        this.stopReason = "";
        this.puid = "";
        // 广告配置 - 修改为单次运行次数
        this.adConfigs = {
            look: {
                pageId: 11101,
                type: "look",
                name: "看广告",
                businessId: 672,
                subPageId: 100026367,
                posId: 24067,
                isAdadd: false,
                count: ksmaxtask_look, // 改为30次
                emoji: "📺",
                extraTask: false,
            },
            look2: {
                pageId: 11101,
                type: "look2",
                name: "看广告2",
                businessId: 672,
                subPageId: 100026367,
                posId: 0,
                isAdadd: false,
                count: ksmaxtask_look, // 改为30次
                emoji: "📺",
                extraTask: false,
            },
            food: {
                pageId: 11101,
                type: "food",
                name: "饭补广告",
                businessId: 9362,
                subPageId: 100029907,
                posId: 29741,
                isAdadd: false,
                count: ksmaxtask_food, // 改为1次
                emoji: "🍚",
                extraTask: false,
            },
            box: {
                pageId: 11101,
                type: "box",
                name: "宝箱广告",
                businessId: 606,
                subPageId: 100024064,
                posId: 20346,
                isAdadd: false,
                count: ksmaxtask_box, // 改为1次
                emoji: "📦",
                extraTask: false,
            },
            search: {
                type: "search",
                name: "搜索广告",
                pageId: 11014,
                businessId: 7076,
                subPageId: 100161537,
                posId: 216268,
                isAdadd: false,
                count: ksmaxtask_search,
                emoji: "🔍",
                extraTask: false,
            },
        };

        // 用户和设备信息
        this.userId = null;
        this.did = null;
        this.socks5 = null;
        this.adaddnum = 0; // 广告追加次数计数器
        this.wwip = "";
        this.nwip = "192.168.31." + "222";

        // 当前广告配置
        this.currentAdConfig = null;

        // 广告类型启用状态
        this.adTypesEnabled = {
            look: true,
            box: true,
            food: true,
            search: true,
        };

        // 收益统计
        this.coinStats = {
            total: 0,
            byType: {
                look: 0,
                look2: 0,
                box: 0,
                food: 0,
                search: 0,
            },
        };

        // look任务冷却状态
        this.lookTaskCooling = false;
        this.lookTaskCoolingReason = "";

        // look任务触发状态
        this.lookTaskTriggered = false;

        // Cookie解析后的属性 - 新增参数初始化
        this.mod = null;
        this.appver = null;
        this.language = null;
        this.did_tag = null;
        this.egid = null;
        this.kpf = null;
        this.oDid = null;
        this.kpn = null;
        this.newOc = null;
        this.androidApiLevel = null;
        this.browseType = null;
        this.socName = null;
        this.c = null;
        this.ftt = null;
        this.abi = null;
        this.userRecoBit = null;
        this.device_abi = null;
        this.grant_browse_type = null;
        this.iuid = null;
        this.rdid = null;

        // 新增参数初始化
        this.earphoneMode = null;
        this.isp = null;
        this.thermal = null;
        this.net = null;
        this.kcv = null;
        this.app = null;
        this.bottom_navigation = null;
        this.ver = null;
        this.android_os = null;
        this.boardPlatform = null;
        this.slh = null;
        this.country_code = null;
        this.nbh = null;
        this.hotfix_ver = null;
        this.did_gt = null;
        this.keyconfig_state = null;
        this.cdid_tag = null;
        this.sys = null;
        this.max_memory = null;
        this.cold_launch_time_ms = null;
        this.oc = null;
        this.sh = null;
        this.deviceBit = null;
        this.ddpi = null;
        this.is_background = null;
        this.sw = null;
        this.apptype = null;
        this.icaver = null;
        this.totalMemory = null;
        this.sbh = null;
        this.darkMode = null;

        // API签名相关
        this.api_st = "";

        // 广告任务参数
        this.neoParams = "";
        this.extParams = "";

        // 设备标识
        this.oaid = "";
        this.osVersion = "";
        this.uQaTag =
            "16385#33333333338888888888#cmWns:-1#swRs:99#swLdgl:-0#ecPp:-9#cmNt:-1#cmHs:-1";
        this.deviceModel = generateRandomPhoneModel();
        this.cookieMap = null;
    }

    // 新增：检查是否达到最大金币限制
    checkMaxReward() {
        if (this.maxReward > 0 && this.coinStats.total >= this.maxReward) {
            this.shouldStop = true;
            this.stopReason = `已达到最大金币限制 ${this.maxReward}`;
            return true;
        }
        return false;
    }

    randomUserAgent() {
        return this.deviceModel;
    }

    getAndroidWebViewUA() {
        return `Mozilla/5.0 (Linux; Android ${this.osVersion}; ${this.randomUserAgent()}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.99 Mobile Safari/537.36 Yoda/3.2.16-rc21 ksNebula/13.9.10.10684 OS_PRO_BIT/64 MAX_PHY_MEM/5724 KDT/PHONE AZPREFIX/az3 ICFO/0 StatusHT/29 TitleHT/44 NetType/WIFI ISLP/0 ISDM/0 ISLB/0 locale/zh-cn SHP/2068 SWP/1080 SD/2.75 CT/0 ISLM/0`;
    }

    checkCookieVariables() {
        const cookieObj = parseCookieString(this.ck, { encodeValues: true });
        this.cookieMap = cookieObj;
        if (Object.keys(cookieObj).length > 0) {
            this.ck = buildCookieString(cookieObj);
        }

        const result = {};
        REQUIRED_COOKIE_KEYS.forEach((variable) => {
            result[variable] = Object.prototype.hasOwnProperty.call(cookieObj, variable);
        });

        this.api_st = cookieObj["kuaishou.api_st"] || "";

        REQUIRED_COOKIE_KEYS.forEach((prop) => {
            this[prop] = cookieObj[prop];
        });

        return result;
    }

    getCookieValue(name, fallback = "") {
        const cookieObj = this.cookieMap || parseCookieString(this.ck);
        return cookieObj[name] || fallback;
    }

    getOaid() {
        return this.getCookieValue("oaid", "93ece41c64ee5262");
    }

    getOsVersion() {
        return this.getCookieValue("osVersion", "10");
    }

    async run() {
        // 初始化时显示最大金币限制和广告追加设置

        const cookieCheckResult = this.checkCookieVariables();
        const missingVariables = Object.keys(cookieCheckResult).filter(
            (key) => !cookieCheckResult[key]
        );

        if (missingVariables.length > 0) {
            return $.log(
                `账号[${this.index}] COOKIE中缺少变量: ${missingVariables.join(", ")}`
            );
        }

        if (!this.salt) {
            return $.log(`账号[${this.index}] salt不存在`);
        }

        await this.setupProxy();
        this.setupOaidAndOsVersion();
        //await this.feedAD();

        try {
            let { data: checkUser } = await axios.request({
                url: "https://kspay.smallfawn.top" + "/user/checkUser",
                method: "POST",
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
                    Referer: "https://smallfawn.top",
                    bz: version,
                },
                data: {
                    params: apien(
                        JSON.stringify({
                            userId: this.userId,
                            st: this.api_st,
                        })
                    ),
                    st: this.encryptData(this.api_st),
                    userId: this.userId,
                },
            });
            if (checkUser.status == false) {
                banUserId.push(this.userId);
                $.log(`账号[${this.index}] ${checkUser.message}`);
                $.log(`账号[${this.index}] 未支付费用`);
                $.log(
                    `请进群看公告联系机器人/或去https://kspay.smallfawn.top  根据userId 支付费用 userId输入括号中的===>[${this.userId}] `
                );
                $.log(`支付成功后需要点击提交`);
                return;
            } else {
                this.apiac = checkUser.data.ac;
                this.expired = checkUser.data.expired;
            }
        } catch (error) {
            return $.log(
                `账号[${this.index}] 获取收益统计失败 请检查网络 或尝试更新kssignapi网站`
            );
        }

        $.log(`账号[${this.index}] 获取设备标识 [${this.oaid}]`);
        let getPuidRes = await this.getPuid();
        if (!getPuidRes) {
            $.log(`账号[${this.index}] 获取神秘参数失败 使用默认参数 `);
        }
        await this.executeInviteTasks();
        if (ksdailytask.includes("huge")) {
            await this.hugeSignInInfo();
        }
        // 执行邀请任务

        let flag = await this.userInfoApi();
        if (!flag) {
            return $.log(`账号[${this.index}] 获取用户信息失败 请尝试重新抓包`);
        }

        // 在执行任务前更新用户记录
        userDataManager.updateUserRecord(this.userId, this.currentEarnings);

        await this.exchangeCoinsType();
        if (ksdailytask.includes("box")) {
            await this.openboxInfo();
        }
        //从searchKey随机抽取
        searchKey = getRandomItem(kssearch) || DEFAULT_SEARCH_KEYS[0];
        $.log(`账号[${this.index}] 搜索关键词 [${searchKey}]`);
        // 执行广告任务 - 改为单次执行
        await this.executeAdTasksSingleRun();

        // 强制上报剩余的金币
        await this.exchangeCoinsType();
        // 显示收益汇总
        $.log(this.getCoinSummary());

        // 如果因为达到最大金币限制而停止，显示提示信息
        if (this.shouldStop && this.stopReason) {
            $.log(`⏹️ ${this.stopReason}`);
        }

        $.log(`🎉 所有任务完成！`);

        return this.coinStats.total;
    }
    async getPuid() {
        let data = {
            cs: "false",
            client_key: "2ac2a76d",
            videoModelCrowdTag: "1_91",
            os: "android",
            "kuaishou.api_st": this.api_st,
            uQaTag: this.uQaTag,
        };

        let reqParams = await this.loadReqParams(
            "/rest/nebula/user/take/puid",
            data,
            this.salt
        );
        if (reqParams == null) {
            return null;
        }

        let { data: res } = await axios.request({
            url: "https://az1-api-js.gifshow.com/rest/nebula/user/take/puid",
            params: reqParams.queryData,
            proxy: false,
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            method: "POST",
            timeout: 30 * 1000,
            headers: {
                kaw: reqParams.headersData.kaw,
                kas: reqParams.headersData.kas,
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": defaultUserAgent,
                Cookie: "kuaishou.api_st=" + this.api_st,
            },
            data: data,
        });
        if (res.result == 1 && res.pUid) {
            this.puid = res.pUid;
            return true;
        }
    }
    async setupProxy() {
        if (this.user.length > 2) {
            this.sock = this.user[2];
            if (
                this.sock &&
                (this.sock.includes("socks://") || this.sock.includes("socks5://"))
            ) {
                $.log(`账号[${this.index}] socks代理兼容格式 [${this.sock}]`);
                try {
                    this.socks5 = new SocksProxyAgent(this.sock, { timeout: 30 * 1000 });
                    let { data: ip } = await axios.request({
                        url: "https://www.baidu.com/",
                        method: "GET",
                        timeout: 30 * 1000,
                        httpsAgent: this.socks5,
                        proxy: false,
                        httpAgent: this.socks5,
                        headers: {
                            "User-Agent":
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        },
                    });
                    $.log(`账号[${this.index}] 代理检测 成功 `);
                } catch (error) {
                    this.socks5 = null;
                    $.log(`账号[${this.index}] socks代理错误`);
                }
            } else if (
                this.sock &&
                this.sock.includes("|") &&
                this.sock.split("|").length == 4
            ) {
                this.sock = this.user[2].split("|");
                $.log(`账号[${this.index}] socks代理 万安格式[${this.sock}]`);
                this.socks5 = new SocksProxyAgent(
                    {
                        hostname: this.sock[0],
                        port: this.sock[1],
                        username: this.sock[2],
                        password: this.sock[3],
                    },
                    { timeout: 30 * 1000 }
                );
            } else {
                $.log(
                    `账号[${this.index}] 代理不存在/错误格式[socks5://] 采用直连模式`
                );
            }
        } else {
            try {
                let { data: ip } = await axios.request({
                    url: "https://www.baidu.com/",
                    method: "GET",
                    timeout: 30 * 1000,
                });

                $.log(`账号[${this.index}] 代理不存在 采用直连模式 `);
            } catch (e) { }
        }
    }

    setupOaidAndOsVersion() {
        this.oaid = this.getOaid();
        this.osVersion = this.getOsVersion();

        if (this.oaid == "5c15e5ccdf00630110d533a5577a42a98a69d963") {
            $.log(
                `账号[${this.index}] 您未在Cookie添加 oaid=自己的OAID; [16位]; 按默认oaid=5c15e5ccdf00630110d533a5577a42a98a69d963 执行标准[OAID抓包]/overview/tasks 域名中的oaid`
            );
        }

        /*if (this.osVersion == "10") {
          $.log(
            `账号[${this.index}] 您未在Cookie添加 osVersion=10;[2位] 按默认osVersion=10 执行标准`
          );
        }*/

        if (this.osVersion == "10" || this.oaid == "9e4bb0e5bc326fb1") {
            // 提示用户获取正确的oaid和osVersion
        }
    }

    async executeInviteTasks() {
        if (invite.length > 0) {
            for (let i of invite) {
                await this.taskInvite1(i);
            }
        }
        if (invite2.length > 0) {
            for (let i of invite2) {
                await this.taskInvite2(i);
            }
        }
    }

    // 修改：改为单次执行所有任务
    async executeAdTasksSingleRun() {
        $.log(`\n========== 开始执行单次任务 ==========`);

        // 检查是否已经达到最大金币限制
        if (this.checkMaxReward()) {
            $.log(`⏹️ 账号[${this.index}] 已达到最大金币限制，停止执行任务`);
            return;
        }

        const hasEnabledAdTypes = Object.values(this.adTypesEnabled).some(
            (enabled) => enabled
        );
        if (!hasEnabledAdTypes) {
            $.log(`❌ 账号[${this.index}] 所有广告类型都已停止，结束任务`);
            return;
        }

        // 按顺序执行三种广告任务
        const adTypes = ["look", "food", "box", "search"];
        for (const adType of adTypes) {
            // 每次执行前检查是否应该停止
            if (this.shouldStop) {
                $.log(`⏹️ 账号[${this.index}] 任务已停止: ${this.stopReason}`);
                break;
            }

            if (task.includes(adType) && this.adTypesEnabled[adType]) {
                await this.executeAdTypeSingle(adType);
            } else if (!this.adTypesEnabled[adType]) {
                $.log(`⏸️  ${this.adConfigs[adType].name}任务已停止`);
            }
        }

        $.log(`========== 单次任务完成 ==========\n`);
    }

    // 修改：单次执行广告类型
    async executeAdTypeSingle(adType) {
        if (this.shouldStop) {
            $.log(`⏹️  ${this.adConfigs[adType].name}任务已停止: ${this.stopReason}`);
            return;
        }

        const baseConfig = this.adConfigs[adType];
        let runConfig = baseConfig;

        // 如果是look任务，先检查是否在冷却中
        if (adType === "look") {
            const coolingStatus = await this.checkLookTaskCooling();
            if (coolingStatus.cooling) {
                $.log(`⏸️  ${baseConfig.name}任务正在冷却中: ${coolingStatus.reason}`);
                this.lookTaskCooling = true;
                this.lookTaskCoolingReason = coolingStatus.reason;
                return;
            } else {
                this.lookTaskCooling = false;
                this.lookTaskCoolingReason = "";

                if (!this.lookTaskTriggered) {
                    await this.triggerTaskAction("look");
                    this.lookTaskTriggered = true;
                }
            }

            if (this.currentAdConfig && this.currentAdConfig.type === "look2") {
                runConfig = this.currentAdConfig;
            }
        }

        this.currentAdConfig = runConfig;
        $.log(
            `${runConfig.emoji} 开始执行${runConfig.name}任务(${runConfig.count}个)`
        );
        let successCount = 0;

        for (let i = 1; i <= runConfig.count; i++) {
            if (this.shouldStop) {
                $.log(`⏹️  ${runConfig.name}任务已停止: ${this.stopReason}`);
                break;
            }

            $.log(`账号[${this.index}] 第${i}次请求 [${runConfig.name}]`);
            this.currentAdConfig = runConfig;

            const result = await this.executeSingleAd(runConfig.type);

            // 修改：处理重试情况
            if (result === "retry") {
                // 重试情况，不算成功但继续下一次
                i--; // 重试不算次数，所以不减i
                continue;
            }

            if (result === "stop") {
                this.adTypesEnabled[adType] = false;
                break;
            } else if (result === "success") {
                successCount++;

                // 修改：广告追加次数限制为4次
                if (this.isAdAddEnabled && runConfig.isAdadd) {
                    $.log(`✅  ${runConfig.name} 开启追加模式`);
                    this.adaddnum++;
                } else {
                    this.adaddnum = 0;
                }

                if (this.checkMaxReward()) {
                    $.log(`⏹️ 已达到最大金币限制 ${this.maxReward}，停止后续任务`);
                    break;
                }

                if (adType === "look" && i % 10 === 0 && i < runConfig.count) {
                    const restTime = Math.floor(Math.random() * (90 - 60) + 60);
                    $.log(`⏰ 已完成${i}次看广告，休息${restTime}秒`);
                    await $.wait(restTime * 1000);
                } else if (i < runConfig.count) {
                    const waitTime =
                        adType === "look" ? Math.floor(Math.random() * (8 - 6) + 6) : 10;
                    await $.wait(waitTime * 1000);
                }
            }
        }

        $.log(
            `✅ ${runConfig.name}任务完成，成功${successCount}/${runConfig.count}个`
        );
    }
    async exchangeCoinsInfo() {
        //$.log(`开始兑换金币`);
        let options = {
            method: "POST",
            url: "https://nebula.kuaishou.com/rest/n/nebula/exchange/coinToCash/overview",
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            headers: {
                "User-Agent": this.getAndroidWebViewUA(),
                "content-type": "application/json",
                Referer: "https://www.kuaishou.com/",
                Cookie: this.ck,
            },
            data: "",
        };
        let { data: res } = await axios.request(options);
        if (res.result == 1) {
            if (Number(res.data.coinBalance) > 200) {
                await this.exchangeCoinsApi(Number(res.data.coinBalance));
            }
        }
    }
    async exchangeCoinsApi(coinAmount) {
        //$.log(`开始兑换金币`);
        let options = {
            method: "POST",
            url: "https://nebula.kuaishou.com/rest/n/nebula/exchange/coinToCash/submit",
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            headers: {
                "User-Agent": this.getAndroidWebViewUA(),
                "content-type": "application/json",
                Referer: "https://www.kuaishou.com/",
                Cookie: this.ck,
            },
            data: {
                coinAmount: coinAmount,
                token: "rE2zK-Cmc82uOzxMJW7LI2-wTGcKMqqAHE0PhfN0U4bJY4cAM5Inxw",
            },
        };
        let { data: res } = await axios.request(options);
        if (res.result == 1) {
            //$.log(`✅ 兑换成功`);
        }
    }
    async exchangeCoinsType() {
        let options = {
            method: "POST",
            url: "https://nebula.kuaishou.com/rest/wd/encourage/unionTask/coinExchange/changeStatus",
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            headers: {
                "User-Agent": this.getAndroidWebViewUA(),
                "content-type": "application/json",
                Referer: "https://www.kuaishou.com/",
                Cookie: this.ck,
            },
            data: {
                exchangeCoinState: 2,
            },
        };
        let { data: res } = await axios.request(options);
        if (res.result == 1) {
            await this.exchangeCoinsInfo();

            //$.log(`✅ 兑换成功`);
        }
    }
    // 新增：触发look任务动作
    async triggerTaskAction(type) {
        let reqdata = {};
        if (type == "look") {
            reqdata = {
                actionType: 1,
                resourceSlotInfo: this.eventTrackingLogInfo,
            };
        }
        if (type == "openbox") {
            reqdata = {
                actionType: 1,
                resourceSlotInfo: {
                    eventTrackingTaskId: 20035,
                    resourceId: "earnPage_treasureBox_1",
                    extParams: {
                        isServerRecordClickAction: true,
                    },
                },
            };
        }
        if (type == "signIn") {
            reqdata = {
                actionType: 1,
                resourceSlotInfo: this.eventTrackingLogInfo,
            };
        }
        try {
            let sig68 = await this.getSig68(
                Buffer.from(JSON.stringify({})).toString("base64"),
                Buffer.from(JSON.stringify(reqdata)).toString("base64"),
                "POST",
                "json",
                this.ck
            );

            if (!sig68) {
                $.log(`❌ 账号[${this.index}] 获取look任务触发签名失败`);
                return false;
            }

            const options = {
                method: "POST",
                url:
                    `https://nebula.kuaishou.com/rest/wd/usergrowth/encourage/matrix/resource/action?` +
                    sig68,
                headers: {
                    "User-Agent": this.getAndroidWebViewUA(),
                    "Content-Type": "application/json",
                    Cookie: this.ck,
                },
                data: reqdata,
                httpAgent: this.socks5,
                httpsAgent: this.socks5,
                proxy: false,
                timeout: 30 * 1000,
            };

            let { data: res } = await axios.request(options);
            if (res && res.result === 1) {
                //$.log(`✅ 账号[${this.index}] 成功触发look任务动作`);
                return true;
            } else {
                $.log(
                    `❌ 账号[${this.index}] 触发look任务动作失败: ${res?.errorMsg || "未知错误"
                    }`
                );
                return false;
            }
        } catch (error) {
            $.log(`❌ 账号[${this.index}] 触发look任务动作异常: ${error.message}`);
            return false;
        }
    }

    async executeSingleAd(adType) {
        const adinfo = await this.loadAd(adType);
        const startTime = Date.now();

        if (!adinfo) {
            $.log(`❌ 账号[${this.index}] 获取广告信息失败，跳过本次广告`);
            return "skip";
        }

        await $.wait(2000);
        const pre = await this.preSub(
            adinfo.cid,
            adinfo.llsid,
            adinfo.liveStreamId
        );

        if (!pre) {
            $.log(`❌ 账号[${this.index}] 预加载失败，跳过本次广告`);
            return "skip";
        }

        if (Array.isArray(adinfo.track)) {
            for (let track of adinfo.track) {
                await this.trackApi(track.url);
            }
        }

        const randomTime = Math.floor(
            (adinfo.watchAdTime + Math.floor(Math.random() * (3000 - 1000) + 1000)) /
            1000
        );
        $.log(`账号[${this.index}] 随机延迟${randomTime}秒`);
        await $.wait(randomTime * 1000);

        const subResult = await this.subAd(
            adinfo.cid,
            adinfo.llsid,
            adinfo.adExtInfo,
            startTime,
            randomTime,
            adinfo.materialTime,
            adinfo.watchAdTime,
            adinfo.liveStreamId
        );

        // 修改：处理重试情况
        if (subResult === "retry_no_reward") {
            // 如果是重试情况，不算作成功但也不停止，继续下一次
            return "retry";
        }

        if (subResult > 0) {
            // 记录收益
            this.coinStats.total += subResult;
            this.coinStats.byType[adType] += subResult;
            this.pendingCoins += subResult;
        }

        if (subResult == 0) {
            $.log(`❌ 账号[${this.index}] 领取金币失败`);
            return "stop";
        }
        if (ksnoDelay != "true") {
            if (subResult == 1) {
                $.log(`❌ 账号[${this.index}] [${subResult}]金币风控 暂停领取`);
                return "stop";
            }
        }
        if (ksnoDelay != "true") {
            if (subResult == 10) {
                $.log(`❌ 账号[${this.index}] [${subResult}] 金币风控 暂停领取`);
                return "stop";
            }
        }

        if (this.shouldStop) {
            $.log(`⏹️  ${this.currentAdConfig.name}任务已停止: ${this.stopReason}`);
            return "stop";
        }

        if (subResult == 5) {
            $.log(`✅ 账号[${this.index}] [${subResult}] 领取直播间金币5`);
            return "success";
        } else {
            $.log(`✅ 账号[${this.index}] 领取金币成功[${subResult}]`);
            return "success";
        }
    }

    // 新增：检查look任务是否在冷却中
    async checkLookTaskCooling() {
        try {
            const taskList = await this.getTaskList();
            if (!taskList) {
                return { cooling: true, reason: "获取任务列表失败" };
            }
            if (ksdailytask.includes("signin")) {
                const signTask =
                    taskList.dailyTasks?.find((task) => task.id === 20022) || {};
                // 如果该对象里面finish为false则证明未签到
                this.eventTrackingLogInfo = {
                    eventTrackingTaskId: 20022,
                    resourceId: "earnPage_cardArea_1",
                    extParams: {
                        isServerRecordClickAction: true,
                    },
                };

                if (!signTask["finish"]) {
                    $.log(`❌ 账号[${this.index}] 未完成签到任务 执行签到`);
                    await this.triggerTaskAction("signIn");
                    await this.signIn();
                }
            }
            // 查找签到任务 id为20022

            // 查找look任务（id为17的任务）
            const lookTask = taskList.dailyTasks?.find((task) => task.id === 17);

            if (!lookTask) {
                return { cooling: true, reason: "未找到看广告任务" };
            }

            if (!lookTask.linkUrl) {
                return { cooling: true, reason: "广告任务正在冷却中，linkUrl不存在" };
            }

            this.taskStages = lookTask.stages || 200;
            this.taskCompletedStages = lookTask.completedStages || 0;
            this.eventTrackingLogInfo = lookTask["eventTrackingLogInfo"] || {
                deliverOrderId: "422",
                materialKey: "TASK_LIST_17_672_PROGRESSING",
                eventTrackingTaskId: 17,
                resourceId: "earnPage_taskList_1",
                extParams: {
                    isServerRecordClickAction: true,
                },
            };

            // 新增：检查materialKey是否包含"20251111"字符串
            if (
                this.eventTrackingLogInfo.materialKey &&
                this.eventTrackingLogInfo.materialKey.includes("20251111")
            ) {
                $.log(`🎯 账号[${this.index}] 检测到特殊广告类型，切换到look2任务`);
                // 设置广告类型为look2
                this.currentAdConfig = this.adConfigs.look2;
            } else {
                // 否则使用默认的look配置
                this.currentAdConfig = this.adConfigs.look;
            }

            // 如果linkUrl存在，设置neoParams和extParams
            this.neoParams = lookTask.linkUrl;
            try {
                const base64 = Buffer.from(lookTask.linkUrl, "base64").toString(
                    "utf-8"
                );
                const parsed = JSON.parse(base64);
                this.extParams = parsed.extParams;
            } catch (e) {
                $.log(`❌ 账号[${this.index}] 解析linkUrl失败: ${e.message}`);
                return { cooling: true, reason: "解析任务参数失败" };
            }

            return { cooling: false, reason: "" };
        } catch (error) {
            $.log(`❌ 账号[${this.index}] 检查look任务状态失败: ${error.message}`);
            return { cooling: true, reason: "检查任务状态失败" };
        }
    }

    // 修改：getTaskList方法，返回任务列表数据
    async getTaskList() {
        try {
            let { data: res } = await axios.request({
                url: "https://nebula.kuaishou.com/rest/n/nebula/activity/earn/overview/tasks",
                httpAgent: this.socks5,
                httpsAgent: this.socks5,
                method: "GET",
                proxy: false,
                headers: {
                    Cookie: this.ck,
                },
            });

            if (res.result == 1) {
                return res.data;
            } else {
                $.log(`❌ 账号[${this.index}] 获取任务列表失败: ${res.errorMsg}`);
                return null;
            }
        } catch (error) {
            $.log(`❌ 账号[${this.index}] 请求任务列表失败: ${error.message}`);
            return null;
        }
    }

    // 收益汇总方法
    getCoinSummary() {
        const config = this.adConfigs;
        let summary = `\n🎉 账号[${this.index}] 任务完成汇总\n`;
        summary += `═`.repeat(40) + `\n`;
        summary += `💰 总收益: ${this.coinStats.total} 金币\n\n`;

        // 显示最大金币限制信息
        if (this.maxReward > 0) {
            summary += `🎯 最大金币限制: ${this.maxReward} 金币\n`;
            const remaining = this.maxReward - this.coinStats.total;
            if (remaining > 0) {
                summary += `📊 剩余额度: ${remaining} 金币\n`;
            } else {
                summary += `✅ 已达到最大金币限制\n`;
            }
            summary += `\n`;
        }

        // 显示广告追加设置

        // 按广告类型统计
        summary += `📈 按任务类型统计:\n`;
        Object.keys(this.coinStats.byType).forEach((type) => {
            if (this.coinStats.byType[type] > 0) {
                summary += `  ${config[type].emoji} ${config[type].name}: ${this.coinStats.byType[type]} 金币\n`;
            }
        });

        // 显示待上报金币信息
        /*if (this.pendingCoins > 0) {
          summary += `\n📦 待上报金币: ${this.pendingCoins} 金币\n`;
        }*/

        // 显示look任务冷却状态
        if (this.lookTaskCooling) {
            summary += `\n⚠️  look任务状态: 冷却中 - ${this.lookTaskCoolingReason}\n`;
        }

        // 显示停止原因
        if (this.shouldStop && this.stopReason) {
            summary += `\n⏹️  停止原因: ${this.stopReason}\n`;
        }

        // 估算现金价值 (按常见比例 10000金币 ≈ 1元)
        const estimatedCash = (this.coinStats.total / 10000).toFixed(2);
        summary += `\n💵 预估现金价值: 约 ${estimatedCash} 元\n`;
        //BASE64DATA

        summary += `═`.repeat(40);
        return summary;
    }
    async userInfoApi() {
        let options = {
            method: "GET",
            url: "https://nebula.kuaishou.com/rest/n/nebula/activity/earn/overview/basicInfo?source=",
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001E2D) NetType/WIFI Language/zh_CN",
                Referer:
                    "https://nebula.kuaishou.com/nebula/task/earning?layoutType=4&hyId=nebula_earning_ug_cdn&source=bottom_guide_second",
                Cookie: "" + this.ck,
            },
        };
        let { data: res } = await axios.request(options);
        if (res?.data) {
            $.log(`------------[${res.data.userData.nickname}]------------`);
            this.nickname = res.data.userData.nickname;
            $.log(
                `账号[${this.index}] [${this.userId}] 【${res.data.totalCash}】金币【${res.data.totalCoin}】`
            );
            // 记录当前收益
            this.currentEarnings =
                Number(res.data.totalCash) * 10000 + Number(res.data.totalCoin) || 0;
            return true;
        } else {
            this.currentEarnings = 0;
            return false;
        }
    }
    async hugeSignInInfo() {
        let options = {
            method: "GET",
            url: "https://encourage.kuaishou.com/rest/ug-regular/hugeSignIn/home?source=task&sourceToken=",
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            headers: {
                "User-Agent": "",
                Referer: "",
                Cookie: "" + this.ck,
            },
        };

        let { data: res } = await axios.request(options);

        if (res?.result == 1) {
            if (res.data.productId == 0 && res.data.templateId == 0) {
                //未选择打卡
            } else {
                $.log(
                    `账号 [${this.index}] 获取打卡任务成功 [${res.data.productView.productName}]`
                );
                $.log(
                    `账号 [${this.index}] 当前签到状态: ${res.data.productView.signInDays}/${res.data.productView.allSignedDays}`
                );
                this.userFeatureParm = res.data.task.hugeSignInTaskToken;
                this.userSnapshotExtParam = res.data.task.taskSnapshotToken;
                this.userSubbizId = res.data.task.subbizId;
                await this.hugeSignTriggerList();
            }
        } else {
        }
    }
    //选择奖品
    async hugeSignInSelectProduct() {
        let data = {
            productId: 1141,
            templateId: 2013,
            source: "",
            rawSource: "task",
            autoSelect: false,
            idfa: "",
            oaid: this.oaid,
        };
        let sig68 = await this.getSig68(
            Buffer.from(JSON.stringify({})).toString("base64"),
            Buffer.from(JSON.stringify(data)).toString("base64"),
            "POST",
            "json",
            this.ck
        );
        let options = {
            method: "POST",
            url:
                "https://encourage.kuaishou.com/rest/ug-regular/hugeSignIn/selectProduct?" +
                sig68,
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            headers: {
                "Content-Type": "application/json",
                "User-Agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001E2D) NetType/WIFI Language/zh_CN",
                Referer:
                    "https://encourage.kuaishou.com/huge-sign-in/home?layoutType=4&bizId=huge-sign-in&source=task&encourageTaskValidityTrack=eyJhY3Rpdml0eV9pZCI6MjAyNDMsInJlc291cmNlX2lkIjoiZWFyblBhZ2VfdGFza0xpc3RfMSIsImV4dF9wYXJhbXMiOnsiaXNTZXJ2ZXJSZWNvcmRDbGlja0FjdGlvbiI6dHJ1ZX19",
                Cookie: "" + this.ck,
            },
            data: data,
        };
        let { data: res } = await axios.request(options);
    }
    async hugeSignTriggerList() {
        let data = {
            subBizId: this.userSubbizId,
            idfa: "",
            oaid: this.oaid,
            userFeatureParam: this.userFeatureParm,
            snapshotExtParam: this.userSnapshotExtParam,
            selfReportParam:
                '{"pushSwitchStatus":true,"hugeSignInWidgetStatus":false,"ignoringBatteryOptimizationsStatus":true}',
        };
        let sig56 = await this.getSig56_1(
            Buffer.from(JSON.stringify(data)).toString("base64")
        );
        let options = {
            method: "POST",
            url:
                "https://encourage.kuaishou.com/rest/wd/zt/task/list/trigger?__NS_sig3=" +
                sig56,
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            headers: {
                "Content-Type": "application/json",
                "User-Agent":
                    "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/121.0.6167.212 KsWebView/1.8.121.896 (rel;r) Mobile Safari/537.36 Yoda/3.2.17-rc2 ksNebula/13.9.30.10756 OS_PRO_BIT/64 MAX_PHY_MEM/5724 KDT/PHONE AZPREFIX/az3 ICFO/0 StatusHT/29 TitleHT/44 NetType/WIFI ISLP/0 ISDM/0 ISLB/0 locale/zh-cn DPS/4.036 DPP/9 SHP/2068 SWP/1080 SD/2.75 CT/0 ISLM/1",
                Referer:
                    "https://encourage.kuaishou.com/huge-sign-in/home?layoutType=4&bizId=huge-sign-in&source=task&encourageTaskValidityTrack=eyJhY3Rpdml0eV9pZCI6MjAyNDMsInJlc291cmNlX2lkIjoiZWFyblBhZ2VfdGFza0xpc3RfMSIsImV4dF9wYXJhbXMiOnsiaXNTZXJ2ZXJSZWNvcmRDbGlja0FjdGlvbiI6dHJ1ZX19&encourageEventTracking=W3siZW5jb3VyYWdlX3Rhc2tfaWQiOjIwMjQzLCJ0YXNrX2lkIjoyMDI0MywiZW5jb3VyYWdlX3Jlc291cmNlX2lkIjoiZWFyblBhZ2VfdGFza0xpc3RfMSIsImV2ZW50VHJhY2tpbmdMb2dJbmZvIjpbeyJkZWxpdmVyT3JkZXJJZCI6IjcxMCIsIm1hdGVyaWFsS2V5IjoiVEFTS19MSVNUXzIwMjQzX0hVR0VfU0lHTl9JTl9ORVciLCJldmVudFRyYWNraW5nVGFza0lkIjoyMDI0MywicmVzb3VyY2VJZCI6ImVhcm5QYWdlX3Rhc2tMaXN0XzEiLCJleHRQYXJhbXMiOnsiaXNTZXJ2ZXJSZWNvcmRDbGlja0FjdGlvbiI6dHJ1ZX19XX1d",
                Cookie: "" + this.ck,
            },
            data: data,
        };
        let { data: res } = await axios.request(options);
        if (res?.result == 1) {
            $.log(
                `账号 [${this.index}] 获取打卡任务列表成功 正在检测打卡任务是否完成`
            );
            let tasks = res.data.tasks;
            for (let task of tasks) {
                if (task.taskId == 29951 && task.taskStatus != "TASK_COMPLETED") {
                    //去完成签到任务
                    await this.encourageReport(task.subBizId, task.taskId);
                } else {
                    $.log(`账号 [${this.index}] 检测到打卡任务已完成`);
                }
            }
        } else {
        }
    }
    async encourageReport(subBizId, taskId) {
        let data = { reportCount: 1, subBizId: subBizId, taskId: taskId };
        let sig56 = await this.getSig56_1(
            Buffer.from(JSON.stringify(data)).toString("base64")
        );
        let options = {
            method: "POST",
            url:
                "https://encourage.kuaishou.com/rest/wd/zt/task/report?__NS_sig3=" +
                sig56,
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            headers: {
                "Content-Type": "application/json",
                "User-Agent":
                    "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/121.0.6167.212 KsWebView/1.8.121.896 (rel;r) Mobile Safari/537.36 Yoda/3.2.17-rc2 ksNebula/13.9.30.10756 OS_PRO_BIT/64 MAX_PHY_MEM/5724 KDT/PHONE AZPREFIX/az3 ICFO/0 StatusHT/29 TitleHT/44 NetType/WIFI ISLP/0 ISDM/0 ISLB/0 locale/zh-cn DPS/4.036 DPP/9 SHP/2068 SWP/1080 SD/2.75 CT/0 ISLM/1",
                Referer:
                    "https://encourage.kuaishou.com/huge-sign-in/home?layoutType=4&bizId=huge-sign-in&source=task&encourageTaskValidityTrack=eyJhY3Rpdml0eV9pZCI6MjAyNDMsInJlc291cmNlX2lkIjoiZWFyblBhZ2VfdGFza0xpc3RfMSIsImV4dF9wYXJhbXMiOnsiaXNTZXJ2ZXJSZWNvcmRDbGlja0FjdGlvbiI6dHJ1ZX19&encourageEventTracking=W3siZW5jb3VyYWdlX3Rhc2tfaWQiOjIwMjQzLCJ0YXNrX2lkIjoyMDI0MywiZW5jb3VyYWdlX3Jlc291cmNlX2lkIjoiZWFyblBhZ2VfdGFza0xpc3RfMSIsImV2ZW50VHJhY2tpbmdMb2dJbmZvIjpbeyJkZWxpdmVyT3JkZXJJZCI6IjcxMCIsIm1hdGVyaWFsS2V5IjoiVEFTS19MSVNUXzIwMjQzX0hVR0VfU0lHTl9JTl9ORVciLCJldmVudFRyYWNraW5nVGFza0lkIjoyMDI0MywicmVzb3VyY2VJZCI6ImVhcm5QYWdlX3Rhc2tMaXN0XzEiLCJleHRQYXJhbXMiOnsiaXNTZXJ2ZXJSZWNvcmRDbGlja0FjdGlvbiI6dHJ1ZX19XX1d",
                Cookie: "" + this.ck,
            },
            data: data,
        };

        let { data: res } = await axios.request(options);

        if (res?.result == 1 && res.data.taskCompleted == true) {
            $.log(`账号 [${this.index}] 打卡签到成功`);
        } else {
        }
    }
    // 加密数据方法
    encryptData(data, keyText = "2025smallfawn") {
        const algorithm = "aes-256-cbc";

        // 固定密钥和IV
        const key = crypto.createHash("sha256").update(keyText).digest();
        const iv = Buffer.alloc(16, 0); // 16字节的0

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, "utf8", "hex");
        encrypted += cipher.final("hex");

        return encrypted;
    }

    MD5(str) {
        return crypto.createHash("md5").update(str).digest("hex");
    }

    async signIn() {
        let sig68 = await this.getSig68(
            Buffer.from(JSON.stringify({})).toString("base64"),
            Buffer.from(JSON.stringify({})).toString("base64"),
            "GET",
            "json",
            this.ck
        );

        if (!sig68) return $.log(`获取sig失败`);
        let options = {
            method: "GET",
            url:
                `https://nebula.kuaishou.com/rest/wd/encourage/unionTask/signIn/report?` +
                sig68,
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            headers: {
                "Content-Type": "application/json",
                "User-Agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001E2D) NetType/WIFI Language/zh_CN",

                Referer:
                    "https://nebula.kuaishou.com/nebula/task/earning?layoutType=4&hyId=nebula_earning_ug_cdn&source=bottom_guide_second",
                Cookie: "" + this.ck,
            },
        };

        try {
            let { data: res } = await axios.request(options);

            if (res?.data) {
                $.log(
                    `✅ 账号[${this.index}] 签到成功 获得${res.data.reportRewardResult.eventTrackingAwardInfo.awardInfo[0].amount}金币`
                );
                try {
                    //$.log(`✅ 账号[${this.index}] 成功上报金币: ${this.pendingCoins}`);
                } catch (error) {
                    //$.log(`❌ 账号[${this.index}] 上报金币失败: ${error.message}`);
                    // 上报失败，保留待上报金币，下次再尝试
                }
            } else if (res.result == 50) {
                $.log(
                    `❌ 账号[${this.index}] 签到失败  ${res.error_msg} 请确认CK中某一项是否存在空格是否被编码成功 比如mod socName`
                );
            } else {
                $.log(`❌ 账号[${this.index}] 签到失败  ${res.error_msg}`);
            }
        } catch (e) { }
    }
    async openboxInfo() {
        let sig68 = await this.getSig68(
            Buffer.from(JSON.stringify({})).toString("base64"),
            Buffer.from(JSON.stringify({})).toString("base64"),
            "GET",
            "json",
            this.ck
        );
        if (!sig68) return $.log(`获取sig失败`);
        let options = {
            method: "GET",
            url:
                "https://nebula.kuaishou.com/rest/wd/encourage/unionTask/treasureBox/info?" +
                sig68,

            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001E2D) NetType/WIFI Language/zh_CN",

                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",

                Referer:
                    "https://nebula.kuaishou.com/nebula/task/earning?layoutType=4&hyId=nebula_earning_ug_cdn&source=bottom_guide_second",
                Cookie: "" + this.ck,
            },
        };
        let { data: res } = await axios.request(options);
        if (res?.data) {
            if (res.data.status == 3) {
                $.log(`账号[${this.index}] 快手开宝箱  执行`);
                await this.triggerTaskAction("openbox");
                await this.openbox();
            }
            if (res.data.status == 2) {
                $.log(`账号[${this.index}] 快手开宝箱  未到时间`);
            }
            if (res.data.status == 4) {
                $.log(`账号[${this.index}] 快手开宝箱  今日领取完毕`);
            }
        }
    }
    async openbox() {
        let data = {};
        let sig68 = await this.getSig68(
            Buffer.from(JSON.stringify({})).toString("base64"),
            Buffer.from(JSON.stringify(data)).toString("base64"),
            "post",
            "json",
            this.ck
        );
        if (!sig68) return $.log(`获取Sig失败`);
        let options = {
            method: "POST",
            url:
                `https://nebula.kuaishou.com/rest/wd/encourage/unionTask/treasureBox/report?` +
                sig68,
            headers: {
                "Content-Type": "application/json",
                "User-Agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001E2D) NetType/WIFI Language/zh_CN",

                Origin: "https://nebula.kuaishou.com",

                Referer:
                    "https://nebula.kuaishou.com/nebula/task/earning?layoutType=4&hyId=nebula_earning_ug_cdn&source=bottom_guide_second",
                Cookie: "" + this.ck,
            },
            data: data,
        };

        try {
            let { data: res } = await axios.request(options);

            if (res?.data) {
                $.log(
                    `✅ 账号[${this.index}] 快手开宝箱  成功 获得${res.data.title.rewardCount}金币`
                );
            } else if (res.result == 50) {
                $.log(
                    `❌ 账号[${this.index}] 开宝箱失败  ${res.error_msg} 请确认CK中某一项是否存在空格是否被编码成功 比如mod socName`
                );
            } else {
                $.log(`❌ 账号[${this.index}] 开宝箱失败  ${res.error_msg}`);
            }
        } catch (e) { }
    }

    async taskInvite1(data) {
        try {
            let url =
                "https://nebula.kuaishou.com/rest/wd/zt/task/report/assist/match?__NS_sig3=";
            if (data.activityId == "turntable_o1") {
                url =
                    "https://encourage.kuaishou.com/rest/wd/zt/task/report/assist/match?__NS_sig3=";
            }

            let sig56_1 = await this.getSig56_1(
                Buffer.from(JSON.stringify(data)).toString("base64")
            );
            let options = {
                method: "POST",
                url: url + sig56_1,
                headers: {
                    "User-Agent": this.getAndroidWebViewUA(),
                    "Content-Type": "application/json",
                    Cookie: this.ck,
                },
                data: data,
            };

            let { data: res } = await axios.request(options);
        } catch (e) { }
    }

    async taskInvite2(data) {
        try {
            let url = "https://az3-api.ksapisrv.com/rest/nebula/inviteCode/bind";
            let newData = {
                cs: "false",
                client_key: "2ac2a76d",
                videoModelCrowdTag: "",
                os: "android",
                "kuaishou.api_st": this.api_st,
                uQaTag: this.uQaTag,
            };
            Object.assign(data, newData);
            let reqParams = await this.loadReqParams(
                "/rest/nebula/inviteCode/bind",
                data,
                this.salt
            );
            if (!reqParams) return;
            let options = {
                method: "POST",
                url: url,
                params: reqParams.queryData,
                headers: {
                    kaw: reqParams.headersData.kaw,
                    kas: reqParams.headersData.kas,
                    "User-Agent": "kwai-android aegon/4.28.0",
                    "Content-Type": "application/x-www-form-urlencoded",
                    Cookie: "kuaishou.api_st=" + this.api_st,
                },
                data: data,
            };

            let { data: res } = await axios.request(options);
        } catch (e) { }
    }

    async getSig56_1(data) {
        //BASE64解码
        data = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
        let res = await getSig56_1(data);
        return res;
    }
    async getSig68(query, data, method, type, cookie) {
        //BASE64解码
        query = JSON.parse(Buffer.from(query, "base64").toString("utf-8"));
        data = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
        method = method.toLowerCase();
        let res = await getSig68(query, data, method, type, cookie);
        return res.result;
    }

    async getSig56_2(data, cookie) {
        let res = await getSig56_2(data, cookie);
        return res;
    }

    // 修改：添加重试机制的loadReqParams方法
    async loadReqParams(path, postdata, salt) {
        const maxRetries = 3; // 最大重试次数
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                let queryData = {
                    mod: this.mod,
                    appver: this.appver,
                    language: this.language,
                    ud: this.userId,
                    did_tag: this.did_tag,
                    egid: this.egid,
                    kpf: this.kpf,
                    oDid: this.oDid,
                    kpn: this.kpn,
                    newOc: this.newOc,
                    androidApiLevel: this.androidApiLevel,
                    browseType: this.browseType,
                    socName: this.socName,
                    c: this.c,
                    abi: this.abi,
                    ftt: this.ftt,
                    userRecoBit: this.userRecoBit,
                    device_abi: this.device_abi,
                    grant_browse_type: this.grant_browse_type,
                    iuid: this.iuid,
                    rdid: this.rdid,
                    did: this.did,
                    // 使用从cookie获取或默认值的参数

                    earphoneMode: "1",
                    isp: "",
                    thermal: "10000",
                    net: "WIFI",
                    kcv: "1599",
                    app: "0",
                    bottom_navigation: "true",
                    ver: this.appver
                        ? this.appver.split(".")[0] + "." + this.appver.split(".")[1]
                        : "13.8",
                    android_os: "0",
                    boardPlatform: "sdm660",
                    slh: "0",
                    country_code: "cn",
                    nbh: "130",
                    hotfix_ver: "",
                    did_gt: "1761129025119",
                    keyconfig_state: "2",
                    cdid_tag: "7",
                    sys: "ANDROID_" + (this.osVersion || "15"),
                    max_memory: "256",
                    cold_launch_time_ms: "1761380491706",
                    oc: this.mod || "XIAOMI",
                    sh: "2280",
                    deviceBit: "0",
                    ddpi: "440",
                    is_background: "0",
                    sw: "1080",
                    apptype: "22",
                    icaver: "1",
                    totalMemory: "5724",
                    sbh: "82",
                    darkMode: "false",
                };

                //let key为时间戳前8位
                //转小写
                let key = Date.now().toString().substring(0, 6);
                let reqdata = {
                    path: path,
                    salt: salt,
                    data: $.queryStr(postdata) + "&" + $.queryStr(queryData),
                };
                reqdata = Buffer.from(JSON.stringify(reqdata)).toString("base64");
                let { data: nssig } = await axios.request({
                    timeout: 10000,
                    url: signApi + "/nssig",
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
                        Referer: "https://smallfawn.top",
                        pm:
                            this.encryptData(
                                this.userId + "|" + Date.now() + "|" + this.apiac,
                                key
                            ) + this.MD5(this.userId + "" + key).toLowerCase(),
                        bz: version,
                    },
                    method: "POST",
                    data: {
                        params: apien(reqdata),
                    },
                });

                if (nssig.status) {
                    Object.assign(queryData, {
                        sig: nssig.data.sig,
                        __NS_xfalcon: nssig.data.nssig4 || "",
                        __NStokensig: nssig.data.nstokensig,
                        __NS_sig3: nssig.data.nssig3,
                    });
                    return {
                        queryData: queryData,
                        headersData: {
                            kaw:
                                nssig.data.kaw ||
                                "MDHkM+9FrbzWSEAqyw6KYWWBbnP3Zmh3HL3RNoTk0mflLja017flDZyhw5HQ/kdj9eJwFtUMxCHs4jfkbu0I4tSimqX4LK/ilIetBDEtRtwL7mU1wZGFgNZMJ1sk/JfB79x800OeS2PM9s7fga7hjifPZY8T/1wfFYUhZVJ1b1hUl02b9lbTmMNMi++r6Qgz+pSNmqKrUMxvt6EbE4ssc3LkEY/C/+pua5Chw/lb5DeHNCUVwd5nUocA",
                            kas: nssig.data.kas || "00168874b3daebdfb00fe51bce4c8b8729",
                        },
                    };
                } else {
                    $.log(`❌ 账号[${this.index}] 获取nssig失败，状态异常`);
                    throw new Error("nssig状态异常");
                }
            } catch (e) {
                retryCount++;
                if (retryCount < maxRetries) {
                    const waitTime = Math.floor(Math.random() * (60 - 30 + 1)) + 30; // 30-60秒随机等待
                    $.log(
                        `🔄 账号[${this.index}] 获取nssig失败，第${retryCount}次重试，等待${waitTime}秒后继续...`
                    );
                    await $.wait(waitTime * 1000);
                } else {
                    $.log(`❌ 账号[${this.index}] 获取nssig失败，已达最大重试次数`);
                    return null;
                }
            }
        }
    }

    // 修改：添加重试机制的encsign方法
    async encsign(data) {
        const maxRetries = 3; // 最大重试次数
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                let key = Date.now().toString().substring(0, 6);
                let reqdata = Buffer.from(JSON.stringify(data)).toString("base64");
                let { data: encsign } = await axios.request({
                    timeout: 10000,
                    url: signApi + "/encsign",

                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
                        Referer: "https://smallfawn.top",
                        pm:
                            this.encryptData(
                                this.userId + "|" + Date.now() + "|" + this.apiac,
                                key
                            ) + this.MD5(this.userId + "" + key).toLowerCase(),
                        bz: version,
                    },
                    method: "POST",
                    data: { params: apien(reqdata) },
                });

                if (encsign.status) {
                    return encsign.data;
                } else {
                    $.log(`❌ 账号[${this.index}] 获取encsign失败，状态异常`);
                    throw new Error("encsign状态异常");
                }
            } catch (e) {
                retryCount++;
                if (retryCount < maxRetries) {
                    const waitTime = Math.floor(Math.random() * (60 - 30 + 1)) + 30; // 30-60秒随机等待
                    $.log(
                        `🔄 账号[${this.index}] 获取encsign失败，第${retryCount}次重试，等待${waitTime}秒后继续...`
                    );
                    await $.wait(waitTime * 1000);
                } else {
                    $.log(`❌ 账号[${this.index}] 获取encsign失败，已达最大重试次数`);
                    return null;
                }
            }
        }
    }

    loadAdInfo(type) {
        const config = this.adConfigs[type];

        // 修改：使用标识符来决定requestSceneType
        let requestSceneType = 1;

        // 否则使用原来的逻辑
        if (this.isAdAddEnabled && this.adaddnum != 0) {
            requestSceneType = 7;
        }

        let impExtData = JSON.stringify({
            openH5AdCount: 0,
            sessionLookedCompletedCount: this.isAdAddEnabled ? this.adaddnum : 0, // 新增：根据设置决定是否使用adaddnum
            sessionType: "1",
            neoParams: this.neoParams,
        });

        if (this.currentAdConfig["type"] == "search") {
            impExtData = JSON.stringify({
                openH5AdCount: 0,
                sessionLookedCompletedCount: this.isAdAddEnabled ? this.adaddnum : 0, // 新增：根据设置决定是否使用adaddnum
                sessionType: "1",
                searchKey: searchKey,
                triggerType: "2",
                disableReportToast: true,
                businessEnterAction: "7",
                neoParams:
                    "eyJwYWdlSWQiOiAxMTAxNCwgInN1YlBhZ2VJZCI6IDEwMDE2MTUzNywgInBvc0lkIjogMjE2MjY4LCAiYnVzaW5lc3NJZCI6IDcwNzYsICJleHRQYXJhbXMiOiAiIiwgImN1c3RvbURhdGEiOiB7ImV4aXRJbmZvIjogeyJ0b2FzdERlc2MiOiBudWxsLCAidG9hc3RJbWdVcmwiOiBudWxsfX0sICJwZW5kYW50VHlwZSI6IDEsICJkaXNwbGF5VHlwZSI6IDIsICJzaW5nbGVQYWdlSWQiOiAwLCAic2luZ2xlU3ViUGFnZUlkIjogMCwgImNoYW5uZWwiOiAwLCAiY291bnRkb3duUmVwb3J0IjogZmFsc2UsICJ0aGVtZVR5cGUiOiAwLCAibWl4ZWRBZCI6IHRydWUsICJmdWxsTWl4ZWQiOiB0cnVlLCAiYXV0b1JlcG9ydCI6IHRydWUsICJmcm9tVGFza0NlbnRlciI6IHRydWUsICJzZWFyY2hJbnNwaXJlU2NoZW1lSW5mbyI6IG51bGwsICJhbW91bnQiOiAwfQ==",
            });
        }
        let adinfo = {
            appInfo: {
                appId: "kuaishou_nebula",
                name: "快手极速版",
                packageName: "com.kuaishou.nebula",
                version: this.appver,
                versionCode: -1,
            },
            deviceInfo: {
                oaid: this.oaid,
                osType: 1,
                osVersion: this.osVersion,
                language: this.language,
                deviceId: "" + this.did,
                screenSize: { width: 1080, height: 2068 },
                ftt: "",
                supportGyroscope: true,
            },
            networkInfo: { ip: this.nwip, connectionType: 100 },
            geoInfo: { latitude: 0, longitude: 0 },
            userInfo: { userId: this.userId, age: 0, gender: "" },
            impInfo: [
                {
                    pageId: config.pageId,
                    subPageId: config.subPageId,
                    action: 0,
                    width: 0,
                    height: 0,
                    browseType: this.browseType,
                    requestSceneType: requestSceneType,
                    lastReceiveAmount: 0,
                    impExtData: impExtData,
                    mediaExtData: "{}",
                    session: JSON.stringify({
                        id:
                            "adNeo" +
                            "-" +
                            this.userId +
                            "-" +
                            this.currentAdConfig.subPageId +
                            "-" +
                            Date.now(),
                    }),
                },
            ],
            adClientInfo: '{"ipdxIP":"' + "" + '"}',
            recoReportContext:
                '{"adClientInfo":{"shouldShowAdProfileSectionBanner":null,"profileAuthorId":0,"xiaomiCustomMarketInfo":{"support":true,"detailStyle":"1,2,3,5,100,101,102"}}}',
        };
        return adinfo;
    }
    async feedAD() {
        let data = {
            tubeId: "5xmu8x9e6ysv37e",
            appInfo: {
                appId: "kuaishou_nebula",
                name: "快手极速版",
                packageName: "com.kuaishou.nebula",
                version: this.appver,
                versionCode: -1,
            },
            deviceInfo: {
                oaid: this.oaid,
                osType: 1,
                osVersion: this.osVersion,
                language: this.language,
                deviceId: this.did,
                screenSize: { width: 1080, height: 2068 },
            },
            networkInfo: { ip: this.nwip, connectionType: 100 },
            geoInfo: { latitude: 0, longitude: 0 },
            userInfo: { userId: this.userId, age: 0, gender: "" },
            data: data,
        };
        let reqParams = await this.loadReqParams(
            "/rest/e/tube/tubeFeed",
            data,
            this.salt
        );
        let option = {
            url: "https://api.e.kuaishou.com/rest/e/tube/tubeFeed",
            params: reqParams.queryData,
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            timeout: 30 * 1000,
            headers: {
                kaw: reqParams.headersData.kaw,
                kas: reqParams.headersData.kas,
                "page-code": "USER_TAG_SEARCH",
                //时间戳+随机5位数
                "X-REQUESTID": Date.now() + Math.floor(Math.random() * 100000),
                "ct-context": {
                    biz_name: "ATTRIBUTION",
                    error_occurred: false,
                    sampled: true,
                    sampled_on_error: true,
                    segment_id: 1197690176,
                    service_name: "CLIENT_TRACE",
                    span_id: 1,
                    trace_id:
                        "My4xMTI5NjA3NDAzMzI0NDA4NzYzMS4yNzU4MC4xNzYxNDYzNjQwODgyLjQ=",
                    upstream_error_occurred: false,
                },
                Host: "api.e.kuaishou.com",
                "Content-Type": "application/json",

                Cookie: "kuaishou.api_st=" + this.api_st,
                "X-Client-Info":
                    "model=" +
                    this.mod +
                    ";os=Android;nqe-score=59;network=WIFI;signal-strength=4;",
                "User-Agent": defaultUserAgent,
            },
            method: "POST",
            data: data,
        };
        let { data: result } = await axios.request(option);
    }
    async loadAd(type) {
        let adinfo = this.loadAdInfo(type);

        let reqData = await this.encsign(adinfo);
        if (reqData == null) {
            $.log(`获取encsign失败`);
            return null;
        }

        let formData = {
            encData: reqData.encdata,
            sign: reqData.sign,
            cs: "false",
            client_key: "2ac2a76d",
            videoModelCrowdTag: "1_23",
            os: "android",
            "kuaishou.api_st": this.api_st,
            uQaTag: this.uQaTag,
        };
        if (this.puid) {
            Object.assign(formData, { pUid: this.puid });
        }
        let reqParams = await this.loadReqParams(
            "/rest/e/reward/mixed/ad",
            formData,
            this.salt
        );
        if (reqParams == null) {
            $.log(`获取广告信息失败`);
            return null;
        }

        let { data: result } = await axios.request({
            url: "https://api.e.kuaishou.com/rest/e/reward/mixed/ad",
            params: reqParams.queryData,
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            timeout: 30 * 1000,
            method: "POST",
            headers: {
                kaw: reqParams.headersData.kaw,
                kas: reqParams.headersData.kas,
                "page-code": "NEW_TASK_CENTER",
                //时间戳+随机5位数
                "X-REQUESTID": Date.now() + Math.floor(Math.random() * 100000),

                "ct-context": {
                    biz_name: "ATTRIBUTION",
                    error_occurred: false,
                    sampled: true,
                    sampled_on_error: true,
                    segment_id: 1959322169,
                    service_name: "CLIENT_TRACE",
                    span_id: 1,
                    trace_id:
                        "My42MTgxMjc3OTA0NTg2OTMyNjA5LjE2NjI1LjE3NjE3MDU0MTYyMzMuMg==",
                    upstream_error_occurred: false,
                },

                Host: "api.e.kuaishou.com",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",

                Cookie: "kuaishou.api_st=" + this.api_st,
                "X-Client-Info":
                    "model=" +
                    this.mod +
                    ";os=Android;nqe-score=22;network=WIFI;signal-strength=4;",
                "User-Agent": defaultUserAgent,
            },
            data: formData,
        });
        let liveStreamId = "";
        if (
            result.errorMsg === "OK" &&
            result.feeds &&
            result.feeds[0] &&
            result.feeds[0].ad
        ) {
            if (result.feeds[0]["ad"]["adDataV2"]["enableJumpToLive"]) {
                //return null;
                //return null;
                liveStreamId =
                    result["feeds"][0]["ad"]["adDataV2"]["liveStreamId"] ||
                    result["feeds"][0]["liveStreamId"] ||
                    "";
                if (ksispasslive == "true") {
                    return null;
                }
                if (ksispasslive == "false") {
                    $.log(`账号[${this.index}] 获取的广告为直播广告`);
                }
                if (!ksispasslive) {
                    return null;
                }
            }
            const caption =
                result.feeds[0].caption ||
                result.feeds[0].ad?.caption ||
                result.feeds[0].user_name ||
                "";
            if (caption) {
                $.log(`✅ 账号[${this.index}]成功获取到广告信息：${caption}`);
            } else {
                $.log(
                    `❌ 账号[${this.index}]获取广告信息失败 可能是直播广 建议打标签 不要搜任何关于直播的`
                );
                return null;
            }

            const expTag = result.feeds[0].exp_tag || "";
            const llsid = expTag.split("/")[1]?.split("_")?.[0] || "";
            let track = "";
            if (result.feeds[0].ad["tracks"]) {
                if (result.feeds[0].ad["tracks"]) {
                    track = result.feeds[0].ad["tracks"];
                }
            }
            let inspireAdInfo = result.feeds[0].ad["adDataV2"]["inspireAdInfo"] || {};
            if (inspireAdInfo["rewardEndInfo"]) {
                if (inspireAdInfo["rewardEndInfo"]["exitDialogInfo"]) {
                    this.adConfigs[type].isAdadd = true;
                }
            }
            this.adConfigs[type].extraTask = false;
            if (
                result.feeds[0]["ad"]["adDataV2"]["templateDatas"] &&
                Array.isArray(result.feeds[0]["ad"]["adDataV2"]["templateDatas"])
            ) {
                for (let template of result.feeds[0]["ad"]["adDataV2"][
                    "templateDatas"
                ]) {
                    if (template.resourceType == 1 && this.ksextratask == "true") {
                        $.log(`✅ 账号[${this.index}] 额外广告触发`);
                        this.adConfigs[type].extraTask = true;
                        break;
                    }
                }
            }
            if (result.feeds[0].streamManifest) {
                return {
                    liveStreamId: liveStreamId,
                    photo_id: result["feeds"][0]["photo_id"],
                    user_id: result["feeds"][0]["user_id"],
                    callback: result.feeds[0].ad.callbackParam,
                    track: track,
                    cid: result.feeds[0].ad.creativeId,
                    llsid: llsid,
                    adExtInfo: result.feeds[0].ad.adDataV2.inspireAdInfo.adExtInfo,
                    materialTime:
                        result.feeds[0].streamManifest.adaptationSet[0].duration,
                    watchAdTime:
                        result.feeds[0].ad.adDataV2.inspireAdInfo.inspireAdBillTime,
                };
            } else {
                return {
                    liveStreamId: liveStreamId,
                    photo_id: result["feeds"][0]["photo_id"],
                    callback: result.feeds[0].ad.callbackParam,
                    track: track,
                    user_id: result["feeds"][0]["user_id"],
                    cid: result.feeds[0].ad.creativeId,
                    llsid: llsid,
                    adExtInfo: result.feeds[0].ad.adDataV2.inspireAdInfo.adExtInfo,
                    materialTime: 30 * 1000,
                    watchAdTime:
                        result.feeds[0].ad.adDataV2.inspireAdInfo.inspireAdBillTime,
                };
            }
        } else {
            $.log(result);
            $.log(
                `❌ 账号[${this.index}]获取广告信息失败 可能是直播广 建议打标签 不要搜任何关于直播的`
            );
            return null;
        }
    }

    async preSub(cid, llsid, liveStreamId) {
        // 修复：使用当前广告配置而不是未定义的 this.adinfo
        if (!this.currentAdConfig) {
            $.log(`❌ 账号[${this.index}] 当前广告配置未设置`);
            return false;
        }
        let mediaType = "video";
        if (liveStreamId) {
            mediaType = "live";
        }
        const preData = {
            bizStr: JSON.stringify({
                pageId: this.currentAdConfig.pageId,
                subPageId: this.currentAdConfig.subPageId,
                posId: this.currentAdConfig.posId,
                taskId: this.currentAdConfig.businessId,
                items: [
                    {
                        basicType: 2,
                        creativeId: cid,
                        llsid: llsid,
                        mediaType: mediaType,
                    },
                ],
            }),
            cs: "false",
            client_key: "2ac2a76d",
            videoModelCrowdTag: "",
            os: "android",
            "kuaishou.api_st": this.api_st,
            uQaTag: this.uQaTag,
        };
        if (this.puid) {
            Object.assign(preData, { pUid: this.puid });
        }
        let reqParams = await this.loadReqParams(
            "/rest/r/ad/exposure/report",
            preData,
            this.salt
        );
        if (reqParams == null) {
            $.log(`获取曝光信息失败`);
            return false;
        }

        let { data: result } = await axios.request({
            url: "https://api.e.kuaishou.com/rest/r/ad/exposure/report",
            params: reqParams.queryData,
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            timeout: 30 * 1000,
            headers: {
                kaw: reqParams.headersData.kaw,
                kas: reqParams.headersData.kas,
                "page-code": "AWARD_VIDEO_AD_PAGE",
                //时间戳+随机5位数
                "X-REQUESTID": Date.now() + Math.floor(Math.random() * 100000),

                "ct-context": {
                    biz_name: "ATTRIBUTION",
                    error_occurred: false,
                    sampled: true,
                    sampled_on_error: true,
                    segment_id: 438217262,
                    service_name: "CLIENT_TRACE",
                    span_id: 1,
                    trace_id:
                        "My4xMTEyODcwNTUzNjA1NDkyNTg5LjEzODEyLjE3NjE3MjMzNzk5MzQuMg==",
                    upstream_error_occurred: false,
                },
                Host: "api.e.kuaishou.com",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",

                Cookie: "kuaishou.api_st=" + this.api_st,
                "X-Client-Info":
                    "model=" +
                    this.mod +
                    ";os=Android;nqe-score=27;network=WIFI;signal-strength=4;",
                "User-Agent": defaultUserAgent,
            },
            method: "POST",
            data: preData,
        });

        if (result.result == 1) {
            //$.log(`✅ 账号[${this.index}]成功曝光广告`);
            return true;
        } else {
            $.log(result);
            $.log(`❌ 账号[${this.index}]曝光广告失败`);
            return false;
        }
    }

    async callbackAdPartner(callbackParams) {
        let event_type = Math.random() > 0.5 ? 3 : 6;
        let purchase_amount = Math.floor(Math.random() * 20) + 5;
        let params = {
            callback: callbackParams,
            event_type: event_type,
            event_time: Date.now(),
        };

        if (event_type == 3) {
            Object.assign(params, { purchase_amount: purchase_amount });
        }
        let { data: result } = await axios.request({
            url: "http://ad.partner.gifshow.com/track/activate",
            params: params,
            httpAgent: this.socks5,
            httpsAgent: this.socks5,
            proxy: false,
            timeout: 30 * 1000,
            headers: { "User-Agent": defaultUserAgent },
            method: "GET",
        });
    }

    async trackApi(track) {
        try {
            if (!track) return;

            let { data: result } = await axios.request({
                url: track,
                httpAgent: this.socks5,
                httpsAgent: this.socks5,
                proxy: false,
                timeout: 30 * 1000,
                headers: { "User-Agent": defaultUserAgent },
                method: "GET",
            });
        } catch (e) { }
    }

    async subAd(
        cid,
        llsid,
        adExtInfo,
        startTime,
        random,
        materialTime,
        watchAdTime,
        liveStreamId
    ) {
        if (!this.currentAdConfig) {
            $.log(`❌ 账号[${this.index}] 当前广告配置未设置`);
            return 0;
        }

        // 新增：重试计数器
        if (!this.rewardRetryCount) {
            this.rewardRetryCount = {};
        }

        const adType = this.currentAdConfig.type;
        if (!this.rewardRetryCount[adType]) {
            this.rewardRetryCount[adType] = 0;
        }

        let taskType = 1;
        let requestSceneType = 1;
        if (this.isAdAddEnabled && this.adaddnum != 0) {
            taskType = 2;
            requestSceneType = 7;
        }

        if (this.currentAdConfig.type === "search") {
            adExtInfo = "";
        }
        //直播neoInfos
        let neoInfos = [];
        let mediaScene = "video";
        if (liveStreamId != "") {
            mediaScene = "live";
            neoInfos = {
                creativeId: cid,
                feedId: liveStreamId,
                llsid: llsid,
                adExtInfo: adExtInfo,
                materialTime: 0,
                watchAdTime: watchAdTime,
                requestSceneType: requestSceneType,
                taskType: taskType,
                watchExpId: "",
                watchStage: 0,
            };
        } else {
            neoInfos = [
                {
                    clientExtInfo: '{"serialPaySuccess":false}',
                    creativeId: cid,
                    extInfo: "",
                    llsid: llsid,
                    adExtInfo: adExtInfo,
                    materialTime: materialTime,
                    watchAdTime: watchAdTime,
                    requestSceneType: requestSceneType,
                    taskType: taskType,
                    watchExpId: "",
                    watchStage: 0,
                },
            ];
        }

        // 修改：严格遵循 ksextratask 设置，重试时也不执行额外任务
        const shouldDoExtraTask = this.ksextratask == "true";

        if (this.currentAdConfig.extraTask && shouldDoExtraTask) {
            neoInfos.push({
                clientExtInfo: '{"serialPaySuccess":false}',
                creativeId: cid,
                extInfo: "",
                llsid: llsid,
                adExtInfo: adExtInfo,
                materialTime: materialTime,
                watchAdTime: watchAdTime,
                requestSceneType: requestSceneType,
                taskType: 3,
                watchExpId: "",
                watchStage: 0,
            });
        }

        const endTime = Date.now();
        const subData = {
            bizStr: JSON.stringify({
                businessId: this.currentAdConfig.businessId,
                endTime: endTime,
                extParams:
                    this.extParams ||
                    "b3151029b4c9c7a5292de15bb3d33a80a70bdf0e138541b1ce3f449f43ec2b54c8e37abe358f8189d66451fb270240048a5822cac88334984240a32d485a35743e09d498053de30f8c1e949939ad69d90d9913d6d841e02f73ea1d130a5800365faf2ca1880653f0ab286275a20104ce1b667a1a0b67b9d7829e18861215dcbff0b3ca801439b7268f39729fb7063043",
                mediaScene: mediaScene,
                neoInfos: neoInfos,
                pageId: this.currentAdConfig.pageId,
                posId: this.currentAdConfig.posId,
                reportType: 0,
                sessionId:
                    "adNeo-" +
                    this.userId +
                    "-" +
                    this.currentAdConfig.subPageId +
                    "-" +
                    Date.now(),
                startTime: startTime,
                subPageId: this.currentAdConfig.subPageId,
            }),
            cs: "false",
            client_key: "2ac2a76d",
            videoModelCrowdTag: "1_52",
            os: "android",
            "kuaishou.api_st": this.api_st,
            uQaTag: this.uQaTag,
            token: this.api_st,
        };

        if (this.puid) {
            Object.assign(subData, { pUid: this.puid });
        }

        let reqParams = await this.loadReqParams(
            "/rest/r/ad/task/report",
            subData,
            this.salt
        );

        if (reqParams == null) {
            $.log(`获取sign失败 请重试`);
            return 0;
        }

        try {
            let { data: result } = await axios.request({
                url: "https://api.e.kuaishou.com/rest/r/ad/task/report",
                httpAgent: this.socks5,
                httpsAgent: this.socks5,
                proxy: false,
                timeout: 30 * 1000,
                params: reqParams.queryData,
                method: "POST",
                headers: {
                    kaw: reqParams.headersData.kaw,
                    kas: reqParams.headersData.kas,
                    "page-code": "NEW_TASK_CENTER",
                    "X-REQUESTID": Date.now() + Math.floor(Math.random() * 100000),
                    "ct-context": {
                        biz_name: "ATTRIBUTION",
                        error_occurred: false,
                        sampled: true,
                        sampled_on_error: true,
                        segment_id: 2138819607,
                        service_name: "CLIENT_TRACE",
                        span_id: 1,
                        trace_id:
                            "My4xMzk2NDEzNjcwNTg4MDYxNTY2NC4xMzg3Ny4xNzYxNzIzNDUxNzUyLjQ=",
                        upstream_error_occurred: false,
                    },
                    Host: "api.e.kuaishou.com",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    Cookie: "kuaishou.api_st=" + this.api_st,
                    "X-Client-Info":
                        "model=" +
                        this.mod +
                        ";os=Android;nqe-score=22;network=WIFI;signal-strength=4;",
                    "User-Agent": defaultUserAgent,
                },
                data: subData,
            });

            // 处理奖励已领完的情况，增加重试逻辑
            if (result.result === 1003 || result.result === 415) {
                this.rewardRetryCount[adType]++;

                if (this.rewardRetryCount[adType] <= 1) {
                    $.log(
                        `🔄 账号[${this.index}] ${this.currentAdConfig.name}任务奖励已领完，进行第${this.rewardRetryCount[adType]}次重试`
                    );
                    // 返回特殊标识，让上层知道这是重试
                    this.ksextratask = "false";
                    this.isAdAddEnabled = false;
                    return "retry_no_reward";
                } else {
                    $.log(
                        `❌ 账号[${this.index}] ${this.currentAdConfig.name}任务连续3次奖励已领完，停止该任务类型`
                    );
                    this.adTypesEnabled[this.currentAdConfig.type] = false;
                    return 0;
                }
            }

            if (result.message == "成功") {
                const neoAmount = result.data.neoAmount;

                // 重置重试计数器
                this.rewardRetryCount[adType] = 0;
                /*if (neoAmount === 2500) {
                  if (!this.highRewardCount) {
                    this.highRewardCount = {
                      consecutive: 0, // 连续次数
                      total: 0, // 总次数
                    };
                  }
        
                  this.highRewardCount.consecutive++;
                  this.highRewardCount.total++;
        
                  $.log(
                    `🎯 账号[${this.index}] 获得2500金币，连续第${this.highRewardCount.consecutive}次，总计第${this.highRewardCount.total}次`
                  );
        
                  // 判断是否达到重置条件
                  if (
                    this.highRewardCount.consecutive >= 3 ||
                    this.highRewardCount.total > 4
                  ) {
                    $.log(
                      `🔄 账号[${this.index}] 达到2500金币限制条件，重置广告追加计数`
                    );
                    this.adaddnum = 0;
                    this.isAdAddEnabled = false;
                    // 重置计数器
                    this.highRewardCount.consecutive = 0;
                    this.highRewardCount.total = 0;
                  }
                } else {
                  // 如果不是2500金币，重置连续计数
                  if (this.highRewardCount) {
                    this.highRewardCount.consecutive = 0;
                  }
                }*/
                // 处理10金币逻辑
                if (ksnoDelay != "true") {
                    if (neoAmount == 10) {
                        $.log(
                            `⚠️ 账号[${this.index}] ${this.currentAdConfig.name}任务 获得10金币`
                        );
                        this.adTypesEnabled[this.currentAdConfig.type] = false;
                        return neoAmount;
                    } else if (neoAmount == 1) {
                        $.log(
                            `⚠️ 账号[${this.index}] ${this.currentAdConfig.name}任务获得1金币 风控，暂停该任务类型`
                        );
                        this.adTypesEnabled[this.currentAdConfig.type] = false;
                        return neoAmount;
                    }
                }

                return neoAmount;
            } else {
                $.log(result);
                // 其他错误也重置重试计数器
                this.rewardRetryCount[adType] = 0;
                return 0;
            }
        } catch (e) {
            $.log("提交广告失败");
            // 异常情况重置重试计数器
            this.rewardRetryCount[adType] = 0;
            return 0;
        }
    }
}
async function testApi(url) {
    try {
        const res = await axios.get(url + "/ping", {
            timeout: 5 * 1000,
            headers: {
                referer: "https://smallfawn.top",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        return res.data.status;
    } catch (e) {
        return false;
    }
}
async function getServerTime() {
    try {
        const { data: res } = await axios.get(
            "https://vv.video.qq.com/checktime?otype=json"
        );
        if (!res) return false;
        let response = res.split("QZOutputJson=")[1].split(";")[0];

        return JSON.parse(response).t;
    } catch (e) {
        return false;
    }
}

async function selectAvailableSignApi(candidateUrls) {
    const shuffledUrls = shuffleList(candidateUrls || []);
    $.log(`开始测试签名API可用性，共有 ${shuffledUrls.length} 个候选API`);

    for (const url of shuffledUrls) {
        try {
            const testResult = await testApi(url);
            if (testResult) {
                $.log(`✅ API测试成功 `);
                return url;
            }
            $.log(`❌ API测试失败`);
        } catch (error) {
            $.log(`❌ API测试异常, 错误: ${error.message}`);
        }
    }

    return null;
}
!(async () => {
    if (typeof initSync == "function" && smallfawnver == "1.2.2") {
        await initSync();
    } else {
        $.log("请升级smallfawn依赖！卸载后重装该依赖");
        return;
    }

    // 在脚本主逻辑开始前输出配置变量
    await getNotice();
    let config = await getConfig();
    if (!config) return;
    signApiUrls = Array.isArray(config.signApiUrls) ? config.signApiUrls : [];
    const availableSignApi = await selectAvailableSignApi(signApiUrls);
    signApi = availableSignApi || "";

    if (!availableSignApi) {
        $.log("❌ 所有签名均不可用，脚本退出");
        return;
    }
    $.log(`🔄 强制无延迟模式: ${ksnoDelay === "true" ? "开启" : "关闭"}`);
    $.log(`\n📋 脚本配置变量汇总:`);
    $.log(`═`.repeat(50));
    $.log(`📺 看广告任务次数: ${ksmaxtask_look}`);
    $.log(`🍚 饭补广告任务次数: ${ksmaxtask_food}`);
    $.log(`📦 宝箱广告任务次数: ${ksmaxtask_box}`);
    $.log(`🔍 搜索广告任务次数: ${ksmaxtask_search}`);
    $.log(`💰 最大金币限制: ${ksmaxreward}`);
    $.log(`👥 并发任务数: ${ksTaskNum}`);
    //$.log(`📡 签名API: ${signApi}`);
    $.log(`🎯 执行任务类型: ${task.join(",")}`);
    $.log(`⚡ 是否跳过直播: ${ksispasslive || "未设置"}`);
    $.log(`🔄 广告追加模式: ${ksisadadd ? "开启" : "关闭"}`);
    $.log(`🔧 额外任务开关[可超2500]: ${ksextratask} `);
    $.log(`👥 用户邀请码: ${ksuserinvite.length > 0 ? "已设置" : "未设置"}`);
    $.log(`═`.repeat(50));
    /*if (config.version != version) {
      return $.log(`当前版本:${version},请更新至最新版:${config.version}`);
    } else {
      $.log(`当前最新版本:${config.version} 本地版本:${version}`);
    }*/

    let loacltime = Math.floor(Date.now() / 1000);
    let serverTime = await getServerTime();
    //如果本地时间与服务器时间差30分钟以上则提示时间错误
    /*console.log("本地时间" + new Date(loacltime * 1000));
    console.log("KS服务器时间" + new Date(serverTime * 1000));*/

    if (Math.abs(loacltime - serverTime) > 1800) {
        $.log("时间错误，请校准本地时间");
        //return;
    }
    invite = Array.isArray(config.invite) ? config.invite : [];
    invite2 = Array.isArray(config.invite2) ? config.invite2 : [];
    $.checkEnv(ckName);
    $.log(`正在加载广告配置`);
    const concurrency = ksTaskNum;
    $.log(`设置并发数为: ${concurrency} 个账号`);
    $.log("读取到任务变量配置 " + JSON.stringify(task));
    $.log("读取到搜索词变量配置 " + JSON.stringify(kssearch));
    $.log("读取到日常任务变量配置 " + JSON.stringify(ksdailytask));

    let userEarnings = []; // 存储所有账号收益

    // 并发执行账号任务
    const userChunks = splitIntoChunks($.userList, concurrency);

    for (let chunkIndex = 0; chunkIndex < userChunks.length; chunkIndex++) {
        const chunk = userChunks[chunkIndex];
        $.log(
            `\n🚀 开始执行第 ${chunkIndex + 1} 批账号，共 ${chunk.length} 个账号`
        );

        const chunkPromises = chunk.map(async (user) => {
            try {
                let taskInstance = new Task(user);
                let totalCoins = await taskInstance.run();
                userEarnings.push({
                    index: taskInstance.index,
                    total: totalCoins,
                    summary: taskInstance.getCoinSummary(),
                    userId: taskInstance.userId,
                });
            } catch (error) {
                $.log(`❌ 账号执行出错: ${error}`);
            }
        });

        // 等待当前批次的所有账号完成
        await Promise.all(chunkPromises);

        // 如果不是最后一批，等待一段时间再执行下一批
        if (chunkIndex < userChunks.length - 1) {
            const waitTime = 10; // 等待10秒
            $.log(`⏰ 等待${waitTime}秒后执行下一批账号...`);
            await $.wait(waitTime * 1000);
        }
    }

    // 全局收益汇总
    $.log("\n🎊🎊🎊 全局收益汇总 🎊🎊🎊");
    $.log("═".repeat(50));

    let grandTotal = 0;
    userEarnings.forEach((user) => {
        $.log(`账号[${user.index}] 总收益: ${user.total} 金币`);
        grandTotal += user.total;
    });

    $.log("─".repeat(50));
    $.log(`💰 所有账号总收益: ${grandTotal} 金币`);

    // 估算现金价值 (按常见比例 10000金币 ≈ 1元)
    const estimatedCash = (grandTotal / 10000).toFixed(2);
    $.log(`💵 预估现金价值: 约 ${estimatedCash} 元`);
    $.log("═".repeat(50));

    // 显示用户统计信息
    $.log("\n📊 用户使用统计:");
    $.log("═".repeat(50));

    const allUserStats = userDataManager.getAllUserStats();
    allUserStats.forEach((userStats) => {
        $.log(`用户 ${userStats.userId}:`);
        $.log(`  🕐 首次使用: ${userStats.firstUseTime}`);
        $.log(`  📈 初始收益: ${userStats.initialEarnings} 金币`);
        $.log(`  💰 今日收益: ${userStats.todayEarnings} 金币`);
        $.log(`  🏆 历史最高: ${userStats.totalEarnings} 金币`);
        $.log(`  🔢 使用次数: ${userStats.usageCount} 次`);
        $.log(`  ⏰ 最后更新: ${userStats.lastUpdate}`);
        $.log("");
    });

    // 保存用户数据
    userDataManager.saveUserData();

    // 将汇总信息添加到通知
    let notifySummary = `【快手极速版任务汇总】\n`;
    notifySummary += `总账号数: ${userEarnings.length}\n`;
    notifySummary += `总金币收益: ${grandTotal}\n`;
    notifySummary += `预估现金: ${estimatedCash}元\n\n`;

    userEarnings.forEach((user) => {
        notifySummary += `账号${user.index}: ${user.total}金币\n`;
    });

    $.notifyStr.push(notifySummary);
    if (banUserId.length > 0) {
        $.log("未进行支付的userId列表:" + banUserId.join(","));
    }
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

async function getNotice() {
    try {
        let options = {
            url: `https://gitee.com/smallfawn/Note/raw/main/Notice.json`,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        };
        let { data: res } = await axios.request(options);
        $.log(res);
        return res;
    } catch (e) {
        $.log("获取通知失败 - 不必理会");
    }
}

async function getConfig() {
    try {
        let options = {
            url: `https://gitee.com/smallfawn/Note/raw/main/KSConfig.json`,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        };
        let { data: res } = await axios.request(options);
        return res;
    } catch (e) {
        $.log("获取失败 - 不必理会");
        return null;
    }
}

// prettier-ignore
function Env(t, s) {
    return new (class {
        constructor(t, s) {
            this.userIdx = 1;
            this.userList = [];
            this.userCount = 0;
            this.name = t;
            this.notifyStr = [];
            this.logSeparator = "\n";
            this.startTime = new Date().getTime();
            Object.assign(this, s);
            this.log(`\ud83d\udd14${this.name},\u5f00\u59cb!`);
        }
        checkEnv(ckName) {
            let userCookie = (this.isNode() ? process.env[ckName] : "") || "";
            this.userList = userCookie.split(envSplitor.find((o) => userCookie.includes(o)) || "&").filter((n) => n);
            this.userCount = this.userList.length;
            this.log(`共找到${this.userCount}个账号`);
        }
        async sendMsg() {
            this.log("==============📣Center 通知📣==============")
            for (let i = 0; i < this.notifyStr.length; i++) {
                if (Object.prototype.toString.call(this.notifyStr[i]) === '[object Object]' ||
                    Object.prototype.toString.call(this.notifyStr[i]) === '[object Array]') {
                    this.notifyStr[i] = JSON.stringify(this.notifyStr[i]);
                }
            }
            let message = this.notifyStr.join(this.logSeparator);
            if (this.isNode()) {
                await notify.sendNotify(this.name, message);
            } else {
            }
        }
        isNode() {
            return "undefined" != typeof module && !!module.exports;
        }

        queryStr(options) {
            const queryString = require("querystring");
            return queryString.stringify(options);
        }
        getURLParams(url) {
            const params = {};
            const queryString = url.split("?")[1];
            if (queryString) {
                const paramPairs = queryString.split("&");
                paramPairs.forEach((pair) => {
                    const [key, value] = pair.split("=");
                    params[key] = value;
                });
            }
            return params;
        }
        isJSONString(str) {
            try {
                return JSON.parse(str) && typeof JSON.parse(str) === "object";
            } catch (e) {
                return false;
            }
        }
        isJson(obj) {
            var isjson =
                typeof obj == "object" &&
                Object.prototype.toString.call(obj).toLowerCase() ==
                "[object object]" &&
                !obj.length;
            return isjson;
        }

        randomNumber(length) {
            const characters = "0123456789";
            return Array.from(
                { length },
                () => characters[Math.floor(Math.random() * characters.length)]
            ).join("");
        }
        randomString(length) {
            const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
            return Array.from(
                { length },
                () => characters[Math.floor(Math.random() * characters.length)]
            ).join("");
        }
        uuid() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
                /[xy]/g,
                function (c) {
                    var r = (Math.random() * 16) | 0,
                        v = c == "x" ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                }
            );
        }
        time(t) {
            let s = {
                "M+": new Date().getMonth() + 1,
                "d+": new Date().getDate(),
                "H+": new Date().getHours(),
                "m+": new Date().getMinutes(),
                "s+": new Date().getSeconds(),
                "q+": Math.floor((new Date().getMonth() + 3) / 3),
                S: new Date().getMilliseconds(),
            };
            /(y+)/.test(t) &&
                (t = t.replace(
                    RegExp.$1,
                    (new Date().getFullYear() + "").substr(4 - RegExp.$1.length)
                ));
            for (let e in s) {
                new RegExp("(" + e + ")").test(t) &&
                    (t = t.replace(
                        RegExp.$1,
                        1 == RegExp.$1.length
                            ? s[e]
                            : ("00" + s[e]).substr(("" + s[e]).length)
                    ));
            }
            return t;
        }

        log(content) {
            this.notifyStr.push(content)
            console.log(content)
        }
        wait(t) {
            if (ksnoDelay === "true") {
                // 如果开启无延迟模式，立即返回
                return Promise.resolve();
            }
            return new Promise((s) => setTimeout(s, t));
        }
        async done(t = {}) {
            await this.sendMsg();
            const s = new Date().getTime(),
                e = (s - this.startTime) / 1e3;
            this.log(
                `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`
            );
            if (this.isNode()) {
                process.exit(1);
            }
        }
    })(t, s);
}
