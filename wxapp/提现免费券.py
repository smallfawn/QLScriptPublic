#!/usr/bin/env python3
from __future__ import annotations

import secrets
import string
import sys
import time
from typing import Any

import os
import urllib3
import requests

urllib3.disable_warnings()


# ── 账号 & 鉴权 ──
APPID = "wxdb3c0e388702f785"
OPENID = os.environ.get("wxtxopenids", "")  # 多个账号用 & 分隔
APIKEY = os.environ.get("wx_auth", "")  

# ── 桥接服务 ──
BRIDGE_BASE_URL = os.environ.get("wx_server_url", "")  # 调用时自动拼接 /wx/code
BRIDGE_TIMEOUT = 40

# ── 领券策略 ──
CODE_COUNT = 1  # 每个账号获取的 code 数量，建议 1-3 个，过多可能导致登录失败
TARGET_COUPON_ID: int | None = None  # None=自动选未领取的券，或指定券ID

# ── 请求参数 ──
API_TIMEOUT = 15
DOMAIN = "https://discount.wxpapp.wechatpay.cn"
PAGE = "pages/gift/index"
MODULE_NAME = "mmpaytxbbsmp" 
PAGE_FRAME_VERSION = "180"
SESSION_SCENE = "daily_reward"
USER_AGENT = (
    "Mozilla/5.0 (Linux; Android 13; Mobile) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 "
    "Chrome/132.0.0.0 Mobile Safari/537.36 "
    "MicroMessenger/8.0.50 NetType/WIFI Language/zh_CN "
    "ABI/arm64 MiniProgramEnv/android"
)


class ClaimError(RuntimeError):
    pass

def getjscode(openid: str) -> list[str]:
    url = f"{BRIDGE_BASE_URL}/wx/code"
    params = {"userKey": openid, "openid": openid, "appid": APPID}
    try:
        resp = requests.post(url=url, json=params, headers={"auth": APIKEY}, timeout=BRIDGE_TIMEOUT, verify=False)
    except requests.RequestException as err:
        raise ClaimError(f"桥接服务请求失败：{err}") from err

    if resp.status_code != 200:
        raise ClaimError(f"桥接服务返回 HTTP {resp.status_code}：{resp.text}")

    data = resp.json()
    if not data.get("status"):
        raise ClaimError(f"桥接服务返回失败：{data}")

    code = data.get("data", {}).get("code")
    if not code:
        raise ClaimError(f"桥接服务未返回 code：{data}")
    return [code]

def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

    openids = [item.strip() for item in OPENID.split("&") if item.strip()]
    if not openids:
        print("未提供有效的 openid")
        return 1

    ok_count = 0
    for index, openid in enumerate(openids, start=1):
        prefix = f"🌸 账号[{index}]"
        try:
            result = run_account(openid)
            print_success(prefix, openid, result)
            ok_count += 1
        except Exception as err:
            print(f"{prefix} ❌ 处理失败（{mask_openid(openid)}）")
            print(f"{prefix} 错误：{err}")

    return 0 if ok_count == len(openids) else 1


def run_account(openid: str) -> dict[str, Any]:
    track_id = make_track_id()
    session = requests.Session()
    session.verify = False

    codes = getjscode(openid)
    if not codes:
        raise ClaimError("无法获取jscode")

    session_token, used_code_index = login_with_codes(session, codes, track_id)
    coupons = query_coupons(session, session_token, track_id)
    coupon = select_coupon(coupons)

    if coupon is None:
        claimed_coupon = next((item for item in coupons if item.get("is_claimed")), None)
        return {
            "code_count": len(codes),
            "used_code_index": used_code_index,
            "status": "already_claimed" if claimed_coupon else "no_daily",
            "coupon": claimed_coupon,
        }

    if coupon.get("is_claimed"):
        status = "already_claimed"
    else:
        claim_coupon(session, session_token, track_id, coupon)
        status = "claimed"

    return {
        "code_count": len(codes),
        "used_code_index": used_code_index,
        "status": status,
        "coupon": coupon,
    }


def login_with_codes(session: requests.Session, codes: list[str], track_id: str) -> tuple[str, int]:
    errors: list[str] = []
    for index, code in enumerate(codes, start=1):
        try:
            data = api_get(
                session,
                "/txbbs-user/user/login",
                headers=make_headers(track_id, jscode=code),
            )
            token = data.get("session_token")
            if not isinstance(token, str) or not token:
                raise ClaimError(f"登录返回缺少 session_token：{data}")
            return token, index
        except Exception as err:
            errors.append(f"第{index}个code失败：{err}")
    raise ClaimError("全部 code 登录失败：" + "；".join(errors))


def query_coupons(session: requests.Session, session_token: str, track_id: str) -> list[dict[str, Any]]:
    data = api_get(
        session,
        "/txbbs-mall/coupon/querydailygiftcoupons",
        headers=make_headers(track_id, session_token=session_token),
    )
    items = data.get("coupon_items")
    if not isinstance(items, list):
        raise ClaimError(f"查询返回缺少 coupon_items：{data}")
    return [item for item in items if isinstance(item, dict)]


def select_coupon(coupons: list[dict[str, Any]]) -> dict[str, Any] | None:
    if TARGET_COUPON_ID is not None:
        return next((item for item in coupons if coupon_id(item) == TARGET_COUPON_ID), None)
    return next((item for item in coupons if not item.get("is_claimed") and coupon_id(item)), None)


def claim_coupon(
    session: requests.Session,
    session_token: str,
    track_id: str,
    coupon: dict[str, Any],
) -> None:
    cid = coupon_id(coupon)
    gift_type = coupon.get("daily_gift_type")
    amount = coupon_face_value(coupon)

    if not isinstance(cid, int):
        raise ClaimError(f"券缺少 coupon_id：{coupon}")
    if not isinstance(gift_type, str) or not gift_type:
        raise ClaimError(f"券缺少 daily_gift_type：{coupon}")
    if not isinstance(amount, int):
        raise ClaimError(f"券缺少 face_value：{coupon}")

    api_post(
        session,
        "/txbbs-mall/coupon/claimdailygiftcoupon",
        headers=make_headers(
            track_id,
            session_token=session_token,
            session_id=make_session_id(),
        ),
        json={
            "daily_gift_type": gift_type,
            "coupon_id": cid,
            "expected_send_amount": amount,
        },
    )


def print_success(prefix: str, openid: str, result: dict[str, Any]) -> None:
    print(f"{prefix} ✅ 登录成功（{mask_openid(openid)}）")
    print(f"{prefix} Code：共获取{result['code_count']}个，使用第{result['used_code_index']}个")

    coupon = result.get("coupon")
    if not isinstance(coupon, dict):
        print(f"{prefix} 未查询到每日额度")
        return

    name = coupon_name(coupon)
    amount = coupon_amount(coupon)
    status = result.get("status")

    if status == "claimed":
        print(f"{prefix} ✅ 领取成功：{name}")
        print(f"{prefix} 到账额度：{amount}")
    elif status == "already_claimed":
        print(f"{prefix} 今日已领取：{name}")
        print(f"{prefix} 当前额度：{amount}")
    else:
        print(f"{prefix} 未查询到每日额度")


def api_get(session: requests.Session, path: str, *, headers: dict[str, str]) -> dict[str, Any]:
    response = session.get(f"{DOMAIN}{path}", headers=headers, timeout=API_TIMEOUT)
    return unwrap_response(response, path)


def api_post(
    session: requests.Session,
    path: str,
    *,
    headers: dict[str, str],
    json: dict[str, Any],
) -> dict[str, Any]:
    response = session.post(f"{DOMAIN}{path}", headers=headers, json=json, timeout=API_TIMEOUT)
    return unwrap_response(response, path)


def unwrap_response(response: requests.Response, action: str) -> dict[str, Any]:
    try:
        response.raise_for_status()
        payload = response.json()
    except Exception as err:
        raise ClaimError(f"{action} 请求失败：{err}，响应：{response.text}") from err

    if not isinstance(payload, dict):
        raise ClaimError(f"{action} 返回格式异常：{payload!r}")
    if payload.get("errcode") != 0:
        raise ClaimError(f"{action} 返回失败：errcode={payload.get('errcode')}，{payload}")

    data = payload.get("data")
    return data if isinstance(data, dict) else {}


def make_headers(
    track_id: str,
    *,
    jscode: str | None = None,
    session_token: str | None = None,
    session_id: str | None = None,
) -> dict[str, str]:
    headers = {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/json",
        "X-Page": PAGE,
        "X-Track-Id": track_id,
        "xweb_xhr": "1",
        "X-Module-Name": MODULE_NAME,
        "X-Appid": APPID,
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Referer": f"https://servicewechat.com/{APPID}/{PAGE_FRAME_VERSION}/page-frame.html",
        "Accept-Language": "zh-CN,zh;q=0.9",
    }
    if jscode:
        headers["jscode"] = jscode
    if session_token:
        headers["session-token"] = session_token
    if session_id:
        headers["session-id"] = session_id
    return headers


def make_track_id() -> str:
    return "T" + "".join(secrets.choice("0123456789ABCDEF") for _ in range(31))


def make_session_id() -> str:
    alphabet = string.ascii_lowercase + string.digits
    random_part = "".join(secrets.choice(alphabet) for _ in range(10))
    return f"{SESSION_SCENE}-{int(time.time() * 1000)}-{random_part}"


def coupon_info(coupon: dict[str, Any]) -> dict[str, Any]:
    value = coupon.get("coupon_info")
    return value if isinstance(value, dict) else {}


def coupon_id(coupon: dict[str, Any]) -> int | None:
    value = coupon_info(coupon).get("coupon_id")
    return value if isinstance(value, int) else None


def coupon_face_value(coupon: dict[str, Any]) -> int | None:
    value = coupon_info(coupon).get("face_value")
    return value if isinstance(value, int) else None


def coupon_name(coupon: dict[str, Any]) -> str:
    name = coupon_info(coupon).get("name")
    if isinstance(name, str) and name:
        return name
    return f"coupon_id={coupon_id(coupon)}"


def coupon_amount(coupon: dict[str, Any]) -> str:
    amount = coupon_face_value(coupon)
    if not isinstance(amount, int):
        return "未知额度"
    return f"{amount // 100}元" if amount % 100 == 0 else f"{amount / 100:.2f}元"


def mask_openid(openid: str) -> str:
    return openid if len(openid) <= 12 else f"{openid[:6]}...{openid[-4:]}"


if __name__ == "__main__":
    raise SystemExit(main())
