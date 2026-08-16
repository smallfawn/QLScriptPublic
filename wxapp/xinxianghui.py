#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# 芯享会 - 每日签到得好奇豆
# 入口: 微信小程序「芯享会」-> 我的(下拉/任务福利) -> 签到
# 说明: 通过 wx_server(smallcat) 用 openid 换取 wx.login code 自动登录, 完成每日签到
# 账号变量名:xxh   (填写 wx_server 中的 openid, 多账号用换行或 & 分割, 可选 #备注)
# 需要配置 wx_server_url、wx_auth, 用于获取 wx.login code
#new Env("芯享会签到")
#cron 20 9 * * *

import hashlib
import json
import os
import sys
import time
from datetime import datetime, timedelta, timezone
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
MINI_APP_ID = "wx13ce9eedfb50ea1b"
BASE_URL = "https://jbl-xxh-api.91dh.com.cn"
SALT = "mGiz2csojwbADX9DETPK38jbFpw28YOj"          # utils/util.js 签名盐
SUCCESS_CODE = 10000                                # 1e4
SESSION_INVALID_CODE = 20003                        # 登录会话失效 -> 需重新登录
NEED_AUTH_CODES = (20008, 20010)                    # 需授权 / 需手机号 (账号前置条件)

# smallcat / wx_server 配置 (机密, 从环境变量读取, 绝不硬编码)
WX_SERVER_URL = os.getenv("wx_server_url", "http://192.168.31.196:8787").rstrip("/")
WX_AUTH = os.getenv("wx_auth", "")
# miniProgram.version, 发布版通常为空串; 服务端按传入值重算签名, 一般无需修改
VERSION = os.getenv("xxh_version", "")
# 首次登录(注册)时提交的昵称; 仅在账号未授权时使用, 不会覆盖已注册账号
NICKNAME = os.getenv("xxh_nickname", "微信用户")

TOKEN_CACHE_PATH = Path(__file__).with_name("xinxianghui_token_cache.json")
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
def now_time():
    """本地(北京)时间 YYYY-MM-DD HH:MM:SS, 对应 util.getNowTime()。"""
    return datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S")


def mask(value):
    if not value:
        return ""
    value = str(value)
    if len(value) <= 12:
        return value[:2] + "***"
    return f"{value[:6]}***{value[-4:]}"


def sign_payload(fields):
    """复刻 util.getRequestData: 键名排序后拼接 key+value, sign=sha1(SALT+拼接+SALT)。"""
    concat = ""
    for key in sorted(fields.keys()):
        value = fields[key]
        if isinstance(value, (dict, list)):
            concat += key + json.dumps(value, separators=(",", ":"), ensure_ascii=False)
        else:
            concat += key + str(value)
    signed = dict(fields)
    signed["sign"] = hashlib.sha1((SALT + concat + SALT).encode("utf-8")).hexdigest()
    return signed


def read_token_cache():
    try:
        if not TOKEN_CACHE_PATH.exists():
            return {}
        return json.loads(TOKEN_CACHE_PATH.read_text(encoding="utf-8")) or {}
    except Exception:
        return {}


def write_token_cache(cache):
    try:
        TOKEN_CACHE_PATH.write_text(
            json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    except Exception as e:
        print(f"⚠️ 写入token缓存失败: {e}")


def get_cached_token(account_id):
    return (read_token_cache().get(account_id) or {}).get("access_token")


def save_cached_token(account_id, access_token):
    cache = read_token_cache()
    cache[account_id] = {"access_token": access_token, "updatedAt": int(time.time())}
    write_token_cache(cache)


def remove_cached_token(account_id):
    cache = read_token_cache()
    if account_id in cache:
        del cache[account_id]
        write_token_cache(cache)


# ---------------------------------------------------------------------------
# smallcat: openid -> wx.login code
# ---------------------------------------------------------------------------
def get_wx_code(account_id):
    if not WX_AUTH:
        raise RuntimeError("缺少 wx_auth, 无法从 wx_server 获取 code")
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "auth": WX_AUTH,
    }
    body = json.dumps({"appid": MINI_APP_ID, "openid": account_id})
    last_msg = ""
    for attempt in range(4):
        if attempt:
            # smallcat 偶发 "获取失败"(运行时会话抖动), 刷新会话后间隔重试
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
# 芯享会 API
# ---------------------------------------------------------------------------
def api_request(endpoint, method, token, params=None):
    """复刻 utils/http.js httpReq: 签名后 GET 走 query、POST 走 body。"""
    fields = {
        "timestamp": now_time(),
        "access_token": token or "",
        "version": VERSION,
    }
    if params is not None and params != "":
        fields["params"] = json.dumps(params, separators=(",", ":"), ensure_ascii=False)
    signed = sign_payload(fields)

    url = f"{BASE_URL}{endpoint}?access_token={token or ''}"
    headers = {
        "content-type": "application/json",
        "User-Agent": DEFAULT_UA,
        "Referer": f"https://servicewechat.com/{MINI_APP_ID}/0/page-frame.html",
    }
    if method.upper() == "GET":
        resp = session.get(url, params=signed, headers=headers, timeout=30)
    else:
        resp = session.post(
            url,
            data=json.dumps(signed, separators=(",", ":"), ensure_ascii=False),
            headers=headers,
            timeout=30,
        )
    resp.raise_for_status()
    return resp.json()


def login(account_id):
    """wx.login code -> access_token。

    优先走 /user-member/auto-login (刷新已注册账号会话, 非破坏性);
    若账号首次使用/未授权, 回退到 /user-member/user-auth 完成微信授权注册。
    """
    code = get_wx_code(account_id)
    result = api_request("/user-member/auto-login", "POST", "", {"wx_code": code})
    rcode = int(result.get("code", -1))
    if rcode == SUCCESS_CODE:
        data = result.get("data") or {}
        access_token = data.get("access_token")
        if not access_token:
            raise RuntimeError(f"登录响应缺少 access_token: {result}")
        member = data.get("member_info") or {}
        return access_token, (member.get("nickname") or member.get("nick_name") or "")

    # 首次登录: 未授权 -> 走 app 自身的授权注册流程 (user-auth)
    msg = str(result.get("msg") or "")
    if rcode in NEED_AUTH_CODES or "授权" in msg or "未注册" in msg:
        print(f"  账号首次使用, 执行微信授权注册... ({msg})")
        code2 = get_wx_code(account_id)  # code 单次有效, 重新获取
        params = {"wx_code": code2, "nickname": NICKNAME, "avatar": "", "come_from": ""}
        auth = api_request("/user-member/user-auth", "POST", "", params)
        if int(auth.get("code", -1)) == SUCCESS_CODE:
            data = auth.get("data") or {}
            access_token = data.get("access_token")
            if not access_token:
                raise RuntimeError(f"授权响应缺少 access_token: {auth}")
            member = data.get("member_info") or {}
            return access_token, (member.get("nickname") or member.get("nick_name") or "")
        raise RuntimeError(f"授权注册失败: {auth.get('msg') or auth}")

    raise RuntimeError(f"code 登录失败: {msg or result}")


def get_token_for_account(account_id, index, force=False):
    if not force:
        cached = get_cached_token(account_id)
        if cached:
            print(f"账号 {index} 使用缓存 token: {mask(cached)}")
            return cached
    access_token, nick = login(account_id)
    save_cached_token(account_id, access_token)
    print(f"账号 {index} code 登录成功 {('(' + nick + ')') if nick else ''}: {mask(access_token)}")
    return access_token


def sign_in_list(token):
    return api_request("/user-member/sign-in-list", "GET", token)


def do_sign_in(token):
    return api_request("/user-member/sign-in", "GET", token, {})


# ---------------------------------------------------------------------------
# 主流程 (每账号一次幂等签到)
# ---------------------------------------------------------------------------
def run_account(account_id, index):
    lines = [f"【账号 {index}】"]

    token = get_token_for_account(account_id, index)
    state = sign_in_list(token)

    # 会话失效 -> 强制重新登录后重试一次 (对应源码 20003 自动重登)
    if int(state.get("code", -1)) == SESSION_INVALID_CODE:
        print(f"账号 {index} 会话失效, 重新登录...")
        remove_cached_token(account_id)
        token = get_token_for_account(account_id, index, force=True)
        state = sign_in_list(token)

    code = int(state.get("code", -1))
    if code in NEED_AUTH_CODES:
        if code == 20010:
            msg = "需先在小程序「我的→签到→手机号授权」绑定手机号后才能签到"
        else:
            msg = "需先在小程序内完成注册授权后才能签到"
        print(f"⚠️ 账号 {index} {msg} (code={code})")
        lines.append(f"⚠️ {msg}")
        return "\n".join(lines), False

    if code != SUCCESS_CODE:
        msg = state.get("msg") or f"查询签到状态失败 code={code}"
        print(f"❌ 账号 {index} {msg}")
        lines.append(f"❌ {msg}")
        return "\n".join(lines), False

    data = state.get("data") or {}
    status = data.get("status")
    xq_count = data.get("xqCount")
    print(f"账号 {index} 签到状态 status={status} 连续签到={xq_count}")

    # status==2 表示今日可签到 (welfare/index.wxml: 签到按钮 wx:if=status==2)
    if status != 2:
        msg = f"今日无需签到 (status={status}, 连续签到 {xq_count} 天)"
        print(f"✅ 账号 {index} {msg}")
        lines.append(f"✅ {msg}")
        return "\n".join(lines), True

    result = do_sign_in(token)
    rcode = int(result.get("code", -1))
    if rcode == SUCCESS_CODE:
        msg = "签到成功"
        rdata = result.get("data") or {}
        score = rdata.get("score") or rdata.get("point")
        if score:
            msg += f", +{score} 好奇豆"
        print(f"🎉 账号 {index} {msg}")
        lines.append(f"🎉 {msg}")
        return "\n".join(lines), True

    msg = result.get("msg") or f"签到失败 code={rcode}"
    print(f"❌ 账号 {index} {msg}")
    lines.append(f"❌ {msg}")
    return "\n".join(lines), False


def main():
    raw = os.getenv("xxh", "")
    accounts = [x.strip() for x in raw.replace("&", "\n").splitlines() if x.strip()]

    if not accounts:
        print("❌ 未检测到账号信息(环境变量 xxh), 退出。")
        return
    if not WX_AUTH:
        print("❌ 未配置 wx_auth, 无法获取 code, 退出。")
        return

    print("=============== 芯享会 签到开始 ===============")
    summaries = []
    ok_count = 0
    for i, entry in enumerate(accounts, 1):
        parts = entry.split("#", 1)
        account = parts[0].strip()
        remark = parts[1].strip() if len(parts) > 1 else ""
        print(f"\n-------------- 账号 {i}{('/' + remark) if remark else ''} --------------")
        try:
            summary, ok = run_account(account, i)
            summaries.append(summary)
            ok_count += 1 if ok else 0
        except Exception as e:
            print(f"❌ 账号 {i} 执行异常: {e}")
            summaries.append(f"【账号 {i}】\n❌ 执行异常: {e}")
        time.sleep(1)

    print("\n=============== 芯享会 签到结束 ===============")
    title = f"芯享会签到 {ok_count}/{len(accounts)} 成功"
    try:
        send(title, "\n\n".join(summaries))
    except Exception as e:
        print(f"⚠️ 通知发送失败: {e}")


if __name__ == "__main__":
    main()
