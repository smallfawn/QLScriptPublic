/*
------------------------------------------
@Author: sm
@Date: 2026.06.09
@Description: 腾讯电脑管家 wx code 登录并创建 sdi auth
cron: 10 9 * * *
------------------------------------------
变量名：qqpcmgr
变量值：wx_server 已保存账号 openid，多账号用 & 或换行

必需变量：
wx_server_url       默认 http://192.168.31.196:8787
wx_auth             wx_server 鉴权值

可选变量：
qqpcmgr_authCode    直接使用指定 authCode，设置后不走 wx_server
qqpcmgr_guid        默认 fff4328476c4ffc836d21e82918faa19
qqpcmgr_sdiaid      默认 2025121115391911962
qqpcmgr_version     默认 18.2.30604.301
qqpcmgr_computer    默认 smallfawn
qqpcmgr_lid         默认 Lottery2
------------------------------------------
*/

const { Env } = require("../tools/env.js");
const axios = require("axios");

const $ = new Env("腾讯电脑管家登录");

const CK_NAME = "qqpcmgr";
const WX_SERVER_URL = (process.env.wx_server_url || "http://192.168.31.196:8787").replace(/\/$/, "");
const WX_AUTH = process.env.wx_auth || "";
const QRCONNECT_URL =
    process.env.qqpcmgr_qrconnect_url ||
    "https://open.weixin.qq.com/connect/qrconnect?appid=wx5cd60c5d4817a188&scope=snsapi_login&redirect_uri=https%3A%2F%2Fsecurity.guanjia.qq.com%2Flogin&state=233&login_type=jssdk&self_redirect=true";
const CLIENT_GUID = process.env.qqpcmgr_guid || "fff4328476c4ffc836d21e82918faa19";
const SDIAID = process.env.qqpcmgr_sdiaid || "2025121115391911962";
const LOTTERY_ID = process.env.qqpcmgr_lid || "Lottery2";
const VERSION = process.env.qqpcmgr_version || "18.2.30604.301";
const COMPUTER_NAME = process.env.qqpcmgr_computer || "smallfawn";
const USER_AGENT =
    process.env.qqpcmgr_ua ||
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/143.0.13.0 Tencent QQPCMgr/18.2.30604.301";

function splitAccounts(raw = "") {
    return String(raw)
        .split(/\n|&/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function pick(source = {}, keys = []) {
    for (const key of keys) {
        const value = source?.[key];
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return "";
}

function findLoginPayload(source) {
    if (!source || typeof source !== "object") return null;
    const loginKey = pick(source, ["loginKey", "LoginKey", "loginkey", "login_key"]);
    const openid =
        pick(source, ["openid", "openId", "OpenId", "OpenID"]) ||
        pick(source.thirdPartyAccInfo, ["bindAccount", "openid", "openId", "OpenId", "OpenID"]);
    if (loginKey && openid) return source;

    for (const value of Object.values(source)) {
        if (value && typeof value === "object") {
            const found = findLoginPayload(value);
            if (found) return found;
        }
    }
    return null;
}

function cookieValue(value) {
    return String(value ?? "").replace(/[;\r\n]/g, "");
}

function buildCookie(profile) {
    const commonid = profile.commonid || profile.openid;
    const encodedNickname = encodeURIComponent(profile.nickname || "");
    const pairs = {
        _gj_acc_type: 2,
        _gj_commonid: commonid,
        _gj_version: VERSION,
        _gj_computername: COMPUTER_NAME,
        _gj_client_guid: profile.guid,
        _gj_server_guid: profile.serverGuid || "",
        _gj_vip: profile.vip || 0,
        _gj_nickname: profile.nickname || "",
        _gj_accountid: profile.account,
        _gj_loginkey: profile.loginKey,
        _gj_openid: profile.openid,
        _gj_sex: profile.sex || 0,
        _gj_headimgurl: profile.headimgurl || "",
        _gj_expired: 0,
        _gj_support: "[0,1,2,3,4,5,6,8,10,11,12,13,14,15,18]",
        _gj_encoded_nickname: encodedNickname,
        _gj_level: profile.level || 0,
    };
    return Object.entries(pairs)
        .map(([key, value]) => `${key}=${cookieValue(value)}`)
        .join("; ");
}

async function getAuthCode(account) {
    if (process.env.qqpcmgr_authCode) return process.env.qqpcmgr_authCode;
    if (!WX_AUTH) throw new Error("未配置 wx_auth，无法通过 wx_server 授权二维码");
    if (!account) throw new Error("未配置 qqpcmgr openid，无法调用 /wx/qrcodeauth");
    const uuid = await getQrUuid();
    $.log(`获取 QRConnect UUID 成功: ${uuid}`);
    const code = await qrcodeAuth(account, uuid);
    return code;
}

async function getQrUuid() {
    const { data, status } = await axios.request({
        method: "GET",
        url: QRCONNECT_URL,
        headers: {
            "User-Agent": USER_AGENT,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9",
        },
        timeout: 20000,
        validateStatus: () => true,
    });
    if (status !== 200) throw new Error(`获取 QRConnect 页面失败 HTTP ${status}`);
    const html = String(data || "");
    const match = html.match(/\/connect\/qrcode\/([^"'&<>]+)/) || html.match(/uuid=([^"'&<>]+)/);
    if (!match?.[1]) throw new Error("QRConnect 页面未解析到 uuid");
    return match[1];
}

async function qrcodeAuth(openid, uuid) {
    const { data, status } = await axios.request({
        method: "POST",
        url: `${WX_SERVER_URL}/wx/qrcodeauth`,
        headers: {
            auth: WX_AUTH,
            "Content-Type": "application/json",
        },
        data: { openid, uuid },
        timeout: 30000,
        validateStatus: () => true,
    });
    if (status !== 200) throw new Error(`/wx/qrcodeauth HTTP ${status}: ${JSON.stringify(data)}`);
    const code =
        data?.code ||
        data?.wxCode ||
        data?.data?.code ||
        data?.data?.wxCode ||
        data?.data?.data?.code ||
        data?.data?.data?.wxCode;
    if (!code) throw new Error(`/wx/qrcodeauth 未返回 code: ${JSON.stringify(data)}`);
    return code;
}

async function loginByCode(authCode, guid) {
    const { data } = await axios.request({
        method: "POST",
        url: "https://jprx.m.qq.com/data/3078/forward",
        headers: {
            "User-Agent": USER_AGENT,
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "sec-ch-ua": '"Chromium";v="109"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            Origin: "https://webcdn.m.qq.com",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            Referer: "https://webcdn.m.qq.com/",
            "Accept-Language": "zh-CN,zh;q=0.9",
        },
        data: {
            req: {
                platType: 3,
                loginAccType: 32,
                authCode,
                clientGuid: guid,
            },
        },
        timeout: 20000,
        validateStatus: () => true,
    });
    const payload = findLoginPayload(data);
    if (!payload) throw new Error(`登录响应未找到 loginKey/openid: ${JSON.stringify(data)}`);
    return payload;
}

function normalizeProfile(payload, guid) {
    const third = payload.thirdPartyAccInfo || {};
    const account = pick(payload, ["account", "accountId", "Account", "userId", "UserId", "uin"]);
    return {
        loginKey: pick(payload, ["loginKey", "LoginKey", "loginkey", "login_key"]),
        openid: pick(payload, ["openid", "openId", "OpenId", "OpenID"]) || pick(third, ["bindAccount", "openid", "openId", "OpenId", "OpenID"]),
        nickname: pick(payload, ["nickname", "nickName", "NickName"]) || pick(third, ["nickname", "nickName", "NickName"]) || "JOY",
        account,
        userId: pick(payload, ["userId", "UserId"]) || account,
        headimgurl: pick(payload, ["headimgurl", "headImgUrl", "HeadImgUrl", "headImg"]) || pick(third, ["headUrl", "headimgurl", "headImgUrl", "HeadImgUrl"]),
        guid: pick(payload, ["guid", "clientGuid", "ClientGuid"]) || guid,
        imei: pick(payload, ["imei", "Imei"]) || account,
        commonid: pick(payload, ["commonid", "commonId", "CommonId"]) || pick(third, ["commonid", "commonId", "CommonId", "unionId"]),
        serverGuid: pick(payload, ["serverGuid", "server_guid", "ServerGuid"]),
        sex: pick(payload, ["sex", "Sex"]) || 0,
        vip: pick(payload, ["vip", "Vip"]) || 0,
        level: pick(payload, ["level", "Level"]) || 0,
    };
}

async function createAuth(profile, cookie) {
    const { data, status } = await axios.request({
        method: "POST",
        url: "https://sdi.m.qq.com/public/auth/create",
        headers: {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/json",
            "sec-ch-ua": '"Chromium";v="109"',
            sdiaid: SDIAID,
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            Origin: "https://sdi.3g.qq.com",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            Referer: "https://sdi.3g.qq.com/",
            "Accept-Language": "zh-CN,zh;q=0.9",
            Cookie: cookie,
        },
        data: {
            loginKey: profile.loginKey,
            openid: profile.openid,
            nickname: profile.nickname,
            account: Number(profile.account) || profile.account,
            userId: Number(profile.userId) || profile.userId,
            headimgurl: profile.headimgurl,
            guid: profile.guid,
            imei: Number(profile.imei) || profile.imei,
            loginType: "wx",
            platformId: "pcmgr16",
            loginAccType: 2,
        },
        timeout: 20000,
        validateStatus: () => true,
    });
    return { status, data };
}

async function doLottery(sessionKey, cookie) {
    const { data, status } = await axios.request({
        method: "POST",
        url: "https://sdi.m.qq.com/private/lottery/doLottery",
        headers: {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/json",
            "sec-ch-ua": '"Chromium";v="109"',
            sessionkey: sessionKey,
            sdiaid: SDIAID,
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            Origin: "https://sdi.3g.qq.com",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            Referer: "https://sdi.3g.qq.com/",
            "Accept-Language": "zh-CN,zh;q=0.9",
            Cookie: cookie,
        },
        data: { lid: LOTTERY_ID },
        timeout: 20000,
        validateStatus: () => true,
    });
    return { status, data };
}

async function runAccount(account, index) {
    const guid = process.env[`${CK_NAME}_guid_${index}`] || CLIENT_GUID;
    $.log(`\n[账号${index}] 开始处理 ${account || "authCode"}`);
    const authCode = await getAuthCode(account);
    $.log(`[账号${index}] 获取 authCode 成功 ${String(authCode).slice(0, 8)}***`);

    const payload = await loginByCode(authCode, guid);
    const profile = normalizeProfile(payload, guid);
    if (!profile.loginKey || !profile.openid) throw new Error("登录资料缺少 loginKey/openid");

    const cookie = buildCookie(profile);
    $.log(`[账号${index}] 登录资料: account=${profile.account} openid=${profile.openid} nickname=${profile.nickname}`);
    $.log(`[账号${index}] Cookie: ${cookie}`);

    const auth = await createAuth(profile, cookie);
    $.log(`[账号${index}] auth/create HTTP ${auth.status}`);
    $.log(`[账号${index}] auth/create 返回: ${JSON.stringify(auth.data)}`);

    const sessionKey = auth.data?.data?.userInfo?.sessionKey || auth.data?.data?.sessionKey || auth.data?.sessionKey;
    if (!sessionKey) throw new Error(`auth/create 未返回 sessionKey: ${JSON.stringify(auth.data)}`);

    const lottery = await doLottery(sessionKey, cookie);
    $.log(`[账号${index}] doLottery(${LOTTERY_ID}) HTTP ${lottery.status}`);
    $.log(`[账号${index}] doLottery 返回: ${JSON.stringify(lottery.data)}`);
}

(async () => {
    const accounts = process.env.qqpcmgr_authCode ? [""] : splitAccounts(process.env[CK_NAME] || "");
    if (!accounts.length) throw new Error(`未配置 ${CK_NAME}，或设置 qqpcmgr_authCode 直接测试`);

    for (let i = 0; i < accounts.length; i++) {
        try {
            await runAccount(accounts[i], i + 1);
        } catch (e) {
            $.log(`[账号${i + 1}] 失败: ${e.message || e}`);
        }
    }
})()
    .catch((e) => $.log(`执行失败: ${e.message || e}`))
    .finally(() => $.done());
