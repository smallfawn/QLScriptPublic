#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# 无影云电脑 - 每日签到得灵豆
# 入口: 微信小程序「无影云电脑」-> 我的 -> 签到  (灵豆可用于续费云电脑时长)
# 说明: 通过 wx_server(smallcat) 用 openid 换取 wx.login code, 复刻小程序的
#       阿里云账号 OAuth 静默登录 (authLogin -> GetLoginTokenByAuthCode) 拿到
#       LoginToken/SessionId, 再完成每日签到。
# 前置条件: 该小程序登录依赖「已绑定手机号的阿里云账号」。若当前微信身份尚未
#       绑定阿里云账号(authLogin 返回 state=register), 需先在小程序内完成
#       手机号/阿里云账号授权注册, 脚本会如实识别并上报, 不自动触发注册。
# 账号变量名:wuying   (填写 wx_server 中的 openid, 多账号用换行或 & 分割, 可选 #备注)
# 需要配置 wx_server_url、wx_auth, 用于获取 wx.login code
# 可选变量 wuying_token: 静默登录被阿里云安全验证(state=identityVerify)拦下时的
#       逃生口, 填「LoginToken#SessionId」(从小程序内已登录的会话里取), 多账号
#       按账号顺序用换行或 & 分割; 脚本会用 RefreshLoginToken 自动续期。
#new Env("无影云电脑签到")
#cron 40 9 * * *

import json
import os
import sys
import time
import urllib.parse
import uuid
from pathlib import Path

import requests

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    from notify import send
except Exception:
    def send(title, content):
        print(f"\n===== {title} =====\n{content}")

# ---------------------------------------------------------------------------
# 常量 (均来自小程序反编译源码, 非机密)
# ---------------------------------------------------------------------------
MINI_APP_ID = "wx66f97ce0a56f08c7"
# 阿里云账号 OAuth (SDK env=prod -> account.aliyun.com), 静默登录接口
OAUTH_BASE = "https://account.aliyun.com"
# 账号服务 (换取 LoginToken/SessionId)
ACCOUNT_EP = "https://appstream-center.cn-shanghai.aliyuncs.com"
ACCOUNT_VER = "2022-11-22"
# 桌面服务 (用户/活动/签到)
DESKTOP_EP = "https://wuying-personal-pc.cn-hangzhou.aliyuncs.com"
DESKTOP_VER = "2022-10-01"
APP_VERSION_INFO = "20260112"                 # genOpenApiUrl 内置 AppVersionInfo
FROM_CLIENT = "miniapp_weixin"
# 阿里云 OpenAPI 业务成功标识 (desktop/account 业务接口: Code==="success")
BIZ_OK = "success"
# 会话失效 -> 需重新登录
SESSION_INVALID = ("User.LoginInvalid", "InvalidLoginToken.Missing", "NOT_LOGIN")

# smallcat / wx_server 配置 (机密, 从环境变量读取, 绝不硬编码)
WX_SERVER_URL = os.getenv("wx_server_url", "http://192.168.31.196:8787").rstrip("/")
WX_AUTH = os.getenv("wx_auth", "")

TOKEN_CACHE_PATH = Path(__file__).with_name("wuyingyundiannao_token_cache.json")
# 手动会话逃生口: wuying_token = "LoginToken#SessionId", 按账号顺序换行/& 分割
MANUAL_SESSIONS = [x.strip() for x in
                   os.getenv("wuying_token", "").replace("&", "\n").splitlines()
                   if x.strip()]
DEFAULT_UA = (
    "Mozilla/5.0 (Linux; Android 13; SM-G9910 Build/TP1A.220624.014) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36 "
    "MicroMessenger/8.0.49.2600(0x28003137) NetType/WIFI Language/zh_CN "
    "miniProgram/" + MINI_APP_ID
)

session = requests.Session()


# ---------------------------------------------------------------------------
# 工具函数
# ---------------------------------------------------------------------------
def mask(value):
    if not value:
        return ""
    value = str(value)
    if len(value) <= 12:
        return value[:2] + "***"
    return f"{value[:6]}***{value[-4:]}"


def read_token_cache():
    try:
        if TOKEN_CACHE_PATH.exists():
            return json.loads(TOKEN_CACHE_PATH.read_text(encoding="utf-8")) or {}
    except Exception:
        pass
    return {}


def write_token_cache(cache):
    try:
        TOKEN_CACHE_PATH.write_text(
            json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception as e:
        print(f"⚠️ 写入token缓存失败: {e}")


def get_cached_session(openid):
    return read_token_cache().get(openid) or {}


def save_cached_session(openid, login_token, session_id):
    cache = read_token_cache()
    cache[openid] = {"LoginToken": login_token, "SessionId": session_id,
                     "updatedAt": int(time.time())}
    write_token_cache(cache)


def remove_cached_session(openid):
    cache = read_token_cache()
    if openid in cache:
        del cache[openid]
        write_token_cache(cache)


# ---------------------------------------------------------------------------
# smallcat: openid -> wx.login code
# ---------------------------------------------------------------------------
def get_wx_code(openid):
    if not WX_AUTH:
        raise RuntimeError("缺少 wx_auth, 无法从 wx_server 获取 code")
    headers = {"Accept": "application/json", "Content-Type": "application/json",
               "auth": WX_AUTH}
    body = json.dumps({"appid": MINI_APP_ID, "openid": openid})
    last_msg = ""
    for attempt in range(4):
        if attempt:
            # smallcat 偶发 "获取失败"(会话抖动), 刷新会话后间隔重试
            try:
                session.post(f"{WX_SERVER_URL}/wx/refresh", data=body,
                             headers=headers, timeout=30)
            except Exception:
                pass
            time.sleep(3)
        resp = session.post(f"{WX_SERVER_URL}/wx/code", data=body,
                            headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, dict) and data.get("status") is False:
            last_msg = data.get("message") or "获取失败"
            continue
        code = data.get("code") or (data.get("data") or {}).get("code")
        if code:
            return code
        last_msg = "wx_server 未返回 code"
    raise RuntimeError(f"wx_server 获取 code 失败(已重试): {last_msg}")


# ---------------------------------------------------------------------------
# 阿里云账号 OAuth: wx.login code -> st (复刻 authLogin.html 静默登录)
# ---------------------------------------------------------------------------
def aliyun_authlogin(code):
    """POST {OAUTH_BASE}/weixin/authLogin.html?code=..&appId=.. -> 响应 data。

    SDK 内部 resolve(response.data), 故取 body['data']。返回含 state/st 的节点。
    state: loginSuccess=已绑定(有 st) / register=未绑定阿里云账号(需注册)
           identityVerify=需实名 / 其它=异常。
    """
    qs = urllib.parse.urlencode({"code": code, "appId": MINI_APP_ID})
    resp = session.post(
        f"{OAUTH_BASE}/weixin/authLogin.html?{qs}",
        data=b"",
        headers={"content-type": "application/x-www-form-urlencoded",
                 "User-Agent": DEFAULT_UA,
                 "Referer": f"https://servicewechat.com/{MINI_APP_ID}/0/page-frame.html"},
        timeout=30,
    )
    resp.raise_for_status()
    body = resp.json()
    node = body.get("data") if isinstance(body.get("data"), dict) else body
    return node or {}


# ---------------------------------------------------------------------------
# 阿里云 OpenAPI (复刻 genOpenApiUrl: 通用参数, 客户端签名已禁用故无需签名)
# ---------------------------------------------------------------------------
def _open_api(endpoint, action, version, params, method="GET"):
    q = {
        "Action": action,
        "Format": "JSON",
        "SignatureMethod": "HMAC-SHA1",
        "SignatureNonce": uuid.uuid4().hex,
        "SignatureVersion": "1.0",
        "Timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "Version": version,
        "From": FROM_CLIENT,
        "AppVersionInfo": APP_VERSION_INFO,
    }
    q.update({k: v for k, v in params.items() if v is not None})
    headers = {"User-Agent": DEFAULT_UA,
               "Referer": f"https://servicewechat.com/{MINI_APP_ID}/0/page-frame.html"}
    url = f"{endpoint}?{urllib.parse.urlencode(sorted(q.items()))}"
    if method.upper() == "POST":
        resp = session.post(url, data={}, headers=headers, timeout=30)
    else:
        resp = session.get(url, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()


def get_login_token(st):
    """st -> GetLoginTokenByAuthCode -> {LoginToken, SessionId}。成功时 Code 为空。"""
    resp = _open_api(ACCOUNT_EP, "GetLoginTokenByAuthCode", ACCOUNT_VER, {
        "AuthCode": st, "AccountType": "aliyun",
        "Scene": "WEIXIN_MINI_APP_AUTO_LOGIN", "ClientType": FROM_CLIENT})
    node = resp.get("data") if isinstance(resp.get("data"), dict) else resp
    if node.get("Code"):                       # 登录类接口: 有 Code 即失败
        raise RuntimeError(f"换取登录凭证失败: {node.get('Code')} {node.get('Message', '')}")
    lt, sid = node.get("LoginToken"), node.get("SessionId")
    if not (lt and sid):
        raise RuntimeError("换取登录凭证响应缺少 LoginToken/SessionId")
    return lt, sid


def refresh_login_token(login_token, session_id):
    """RefreshLoginToken: 复用缓存会话。失败返回 None。"""
    try:
        resp = _open_api(ACCOUNT_EP, "RefreshLoginToken", ACCOUNT_VER, {
            "LoginToken": login_token, "SessionId": session_id,
            "ClientId": f"{session_id}0000", "ClientType": FROM_CLIENT})
        node = resp.get("data") if isinstance(resp.get("data"), dict) else resp
        if node.get("Code"):
            return None
        lt = node.get("LoginToken") or login_token
        sid = node.get("SessionId") or session_id
        return lt, sid
    except Exception:
        return None


# ---------------------------------------------------------------------------
# 签到业务 (desktop 服务; 业务接口 Code==="success")
# ---------------------------------------------------------------------------
def _biz_ok(resp):
    node = resp if isinstance(resp, dict) else {}
    return str(node.get("Code")) == BIZ_OK


def _biz_code(resp):
    return (resp or {}).get("Code")


def _is_session_invalid(resp):
    return str((resp or {}).get("Code")) in SESSION_INVALID


def describe_benefit_activities(lt, sid):
    return _open_api(DESKTOP_EP, "DescribeUserBenefitActivities", DESKTOP_VER, {
        "LoginToken": lt, "SessionId": sid, "Scene": "weixin",
        "ClientType": FROM_CLIENT})


def describe_operation_activities(lt, sid):
    return _open_api(DESKTOP_EP, "DescribeOperationActivities", DESKTOP_VER, {
        "LoginToken": lt, "SessionId": sid, "Scene": "weixin",
        "ActivityDisplayType": "Banner", "ClientType": FROM_CLIENT})


SIGNIN_HINT = ("signin", "sign_in", "attend", "checkin", "check_in", "dailycheck",
               "clockin", "签到", "打卡", "每日")


def _looks_like_signin(obj):
    """在活动卡片对象里判断是否为签到活动 (按类型/名称关键字启发式)。"""
    blob = json.dumps(obj, ensure_ascii=False).lower()
    return any(h in blob for h in SIGNIN_HINT)


def _iter_activities(resp):
    """从 DescribeUserBenefitActivities/OperationActivities 响应里迭代活动对象。"""
    node = resp.get("data") if isinstance(resp.get("data"), dict) else resp
    data = node.get("Data") if isinstance(node.get("Data"), dict) else node
    for key in ("OperationCards", "Activities", "ActivityList", "List", "Cards"):
        arr = data.get(key) if isinstance(data, dict) else None
        if isinstance(arr, list):
            for it in arr:
                if isinstance(it, dict):
                    yield it


def find_signin_activity_id(lt, sid):
    """运行时定位「每日签到」活动的 ActivityId。
    返回 (activity_id, act, session_bad)。定位不到时 activity_id 为 None。"""
    session_bad = False
    for fetch in (describe_benefit_activities, describe_operation_activities):
        try:
            resp = fetch(lt, sid)
        except Exception as e:
            print(f"  活动列表获取失败({fetch.__name__}): {e}")
            continue
        if _is_session_invalid(resp):
            session_bad = True
            break
        if not _biz_ok(resp):
            print(f"  活动列表返回 Code={_biz_code(resp)}")
            continue
        for act in _iter_activities(resp):
            if _looks_like_signin(act):
                aid = (act.get("ActivityId") or act.get("activityId")
                       or act.get("Id") or act.get("id"))
                if aid:
                    return str(aid), act, session_bad
    return None, None, session_bad


def attendance_count(lt, sid, activity_id):
    try:
        resp = _open_api(DESKTOP_EP, "DescribeUserActivityAttendanceCount",
                         DESKTOP_VER, {"LoginToken": lt, "SessionId": sid,
                                       "ActivityId": activity_id})
        node = resp.get("data") if isinstance(resp.get("data"), dict) else resp
        return node
    except Exception:
        return None


def attend_activity(lt, sid, activity_id):
    """AttendUserBenefitActivity (POST): 完成一次签到。返回 (成功?, 文案)。"""
    resp = _open_api(DESKTOP_EP, "AttendUserBenefitActivity", DESKTOP_VER, {
        "LoginToken": lt, "SessionId": sid, "ActivityId": activity_id},
        method="POST")
    node = resp.get("data") if isinstance(resp.get("data"), dict) else resp
    code = str(node.get("Code"))
    msg = node.get("Message") or ""
    if code == BIZ_OK:
        return True, "签到成功"
    # 服务端对重复签到通常返回可识别的 Code/Message, 视为幂等成功
    if any(k in (code + msg).lower() for k in ("already", "repeat", "duplicate",
                                               "已签", "已参与", "重复")):
        return True, "今日已签到"
    return False, f"签到失败: {code} {msg}".strip()


# ---------------------------------------------------------------------------
# 会话获取: 缓存(刷新) -> 静默登录
# ---------------------------------------------------------------------------
def obtain_session(openid, index, force=False):
    """返回 (login_token, session_id, state)。
    state 为 'ok' 表示已登录; 其余为前置条件说明字符串。force=True 跳过缓存强制重登。"""
    # 0) 手动会话(逃生口): 静默登录被阿里云风控拦下时, 用户可自行从小程序里取到
    #    LoginToken/SessionId 填进 wuying_token, 脚本用 RefreshLoginToken 续期。
    manual = MANUAL_SESSIONS[index - 1] if index - 1 < len(MANUAL_SESSIONS) else ""
    if manual and not force:
        parts = [p.strip() for p in manual.replace("&", "#").split("#") if p.strip()]
        if len(parts) >= 2:
            refreshed = refresh_login_token(parts[0], parts[1])
            if refreshed:
                lt, sid = refreshed
                save_cached_session(openid, lt, sid)
                print(f"账号 {index} 使用手动会话(已刷新): {mask(lt)}")
                return lt, sid, "ok"
            print(f"账号 {index} wuying_token 已失效, 回退到静默登录")
        else:
            print(f"账号 {index} wuying_token 格式应为 LoginToken#SessionId, 已忽略")

    # 1) 复用缓存并尝试刷新
    if force:
        remove_cached_session(openid)
    else:
        cached = get_cached_session(openid)
        if cached.get("LoginToken") and cached.get("SessionId"):
            refreshed = refresh_login_token(cached["LoginToken"], cached["SessionId"])
            if refreshed:
                lt, sid = refreshed
                save_cached_session(openid, lt, sid)
                print(f"账号 {index} 使用缓存会话(已刷新): {mask(lt)}")
                return lt, sid, "ok"
            remove_cached_session(openid)

    # 2) 静默登录 (wx.login code -> authLogin)
    code = get_wx_code(openid)
    node = aliyun_authlogin(code)
    state = node.get("state")
    st = node.get("st")
    if state == "loginSuccess" and st:
        lt, sid = get_login_token(st)
        save_cached_session(openid, lt, sid)
        print(f"账号 {index} 静默登录成功: {mask(lt)}")
        return lt, sid, "ok"

    # 3) 各类前置条件 (不自动触发注册/实名/手机号授权)
    if state in ("register", "NeedOAuth", None):
        return None, None, ("该微信身份尚未绑定阿里云账号, 需先在小程序「无影云电脑→我的→"
                            "签到/登录」完成手机号授权并绑定阿里云账号后才能签到")
    if state in ("identityVerify", "IV"):
        # 注意: 这不是「实名认证」——已实名的账号同样会收到。阿里云对本次静默登录
        # 下发了一次性「安全验证/身份核验」挑战: authLogin 只回 ivToken 不回 st,
        # 小程序的做法是 webview 打开 account.aliyun.com/iv/ivRender?ivToken=<token>
        # 让用户当场过挑战(见 vendor.js getIVHost / SignState.IV)。ivToken 每次
        # 请求都是新的, 说明是按登录上下文(IP/设备指纹)下发的风控挑战, 属风控边界,
        # 脚本不代为完成、也不绕过。
        return None, None, ("阿里云对本次静默登录下发了『安全验证』挑战(state="
                            "identityVerify, 与实名认证无关, 已实名也会遇到)。"
                            "脚本不会代过风控验证。两种解法: ① 在小程序「无影云电脑」"
                            "内登录一次并按提示完成安全验证, 让阿里云信任该登录环境; "
                            "② 从小程序里取到 LoginToken 与 SessionId, 填入变量 "
                            "wuying_token(格式 LoginToken#SessionId), 脚本会自动续期。")
    return None, None, f"登录状态异常(state={state}), 请在小程序内手动登录一次后重试"


# ---------------------------------------------------------------------------
# 主流程 (每账号一次幂等签到)
# ---------------------------------------------------------------------------
def run_account(openid, index):
    lines = [f"【账号 {index}】"]

    lt, sid, state = obtain_session(openid, index)
    if state != "ok":
        print(f"⚠️ 账号 {index} {state}")
        lines.append(f"⚠️ {state}")
        return "\n".join(lines), False

    # 定位签到活动 (签到页在分包内为空壳, ActivityId 需运行时从活动列表发现)
    activity_id, act, session_bad = find_signin_activity_id(lt, sid)
    if session_bad:                       # 会话失效 -> 强制重登重试一次
        print(f"账号 {index} 会话失效, 重新登录...")
        lt, sid, state = obtain_session(openid, index, force=True)
        if state != "ok":
            print(f"⚠️ 账号 {index} {state}")
            lines.append(f"⚠️ {state}")
            return "\n".join(lines), False
        activity_id, act, session_bad = find_signin_activity_id(lt, sid)
    if not activity_id:
        msg = ("未能定位「每日签到」活动 (活动列表中无签到活动, 可能活动未上线, "
               "或需在小程序内进入签到页抓取 ActivityId)")
        print(f"⚠️ 账号 {index} {msg}")
        lines.append(f"⚠️ {msg}")
        return "\n".join(lines), False
    print(f"账号 {index} 定位到签到活动 ActivityId={activity_id}")

    # 幂等信号 (best-effort): 参与次数
    cnt = attendance_count(lt, sid, activity_id)
    if isinstance(cnt, dict) and cnt.get("Count") is not None:
        print(f"账号 {index} 当前参与次数: {cnt.get('Count')}")

    # 执行一次签到
    ok, msg = attend_activity(lt, sid, activity_id)
    if ok:
        print(f"🎉 账号 {index} {msg}")
        lines.append(f"🎉 {msg}")
        return "\n".join(lines), True
    print(f"❌ 账号 {index} {msg}")
    lines.append(f"❌ {msg}")
    return "\n".join(lines), False


def main():
    raw = os.getenv("wuying", "")
    entries = [x.strip() for x in raw.replace("&", "\n").splitlines() if x.strip()]

    if not entries:
        print("❌ 未检测到账号信息(环境变量 wuying), 退出。")
        return
    if not WX_AUTH:
        print("❌ 未配置 wx_auth, 无法获取 code, 退出。")
        return

    print("=============== 无影云电脑 签到开始 ===============")
    summaries = []
    ok_count = 0
    for i, entry in enumerate(entries, 1):
        parts = entry.split("#", 1)
        openid = parts[0].strip()
        remark = parts[1].strip() if len(parts) > 1 else ""
        print(f"\n-------------- 账号 {i}{('/' + remark) if remark else ''} --------------")
        try:
            summary, ok = run_account(openid, i)
            summaries.append(summary)
            ok_count += 1 if ok else 0
        except Exception as e:
            print(f"❌ 账号 {i} 执行异常: {e}")
            summaries.append(f"【账号 {i}】\n❌ 执行异常: {e}")
        time.sleep(1)

    print("\n=============== 无影云电脑 签到结束 ===============")
    title = f"无影云电脑签到 {ok_count}/{len(entries)} 成功"
    try:
        send(title, "\n\n".join(summaries))
    except Exception as e:
        print(f"⚠️ 通知发送失败: {e}")


if __name__ == "__main__":
    main()
