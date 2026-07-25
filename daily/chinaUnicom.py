# -*- coding: utf-8 -*-
"""
中国联通 Python 版 v1.1.2

包含以下功能:
1. 首页签到 (话费红包/积分)
2. 联通祝福 (各类抽奖)
3. 天天领现金 (每日打卡/立减金)
4. 权益超市 (任务/抽奖/领奖/全局库存缓存)
5. 安全管家 (日常任务/积分领取)
6. 联通云盘 (乘风活动/重复清理)
7. 联通阅读 (自动获取书籍/心跳阅读/抽奖/查红包)
8. 联通爱听 (JF积分任务/自动签到/任务完成/积分查询)
9. 沃云手机 (签到/任务/抽奖)
10. 区域专区 (自动识别安徽超级星期五/辽宁福利魔方/新疆/河南/云南执行特有任务)

更新说明:

### 20260711
v1.1.2:
- 沃云手机：抽奖改用专用活动码，修复抽奖次数恒为0。
- 联通云盘：新增家乡打卡（归属地识别/上传/抽奖），内置最小素材免外部下载，抽奖后自动清理上传的垃圾文件。
- 权益超市：移除已下架的浇水任务。

### 20260609
v1.1.1:
- 沃云手机：更新积分抽奖逻辑，兼容商品列表响应并避免重复执行。
- 联通云盘：乘风活动每日重新制作，复用历史作品人脸FID生成芒果视频。
- 联通云盘：自动领取云盘会员试用。
- 联通云盘：优化芒果权益领取后的延迟重试。
- 联通云盘：修复抽奖次数查询与自动抽奖请求头。

### 20260526
v1.1.0:
- 沃云手机：重构任务模块，升级全新接口并支持最新积分抽奖与时长获取。
- 沃云手机：统一任务日志输出，减少重复任务列表打印。
- 联通爱听：重构 JF 积分任务中心链路，支持签到、任务完成与积分查询，并优化接口响应日志展示。

配置说明:
1. 账号变量 (chinaUnicomCookie):
   赋值方式有三种:
   a. 填账号密码 (自动获取Token - 推荐):
      export chinaUnicomCookie="18600000000#123456"
   b. 填Token#AppId (免密模式 - 推荐):
      export chinaUnicomCookie="a3e4c1ff2xxxxxxxxx#912d30xxxxxx"
   c. 仅填Token (旧模式):
      export chinaUnicomCookie="a3e4c1ff2xxxxxxxxx"
   (多账号用 & 或 换行 隔开)

2. 代理设置 (可选):
   export UNICOM_PROXY_API="你的代理提取链接" (支持 JSON/TXT 格式，自动识别)
   export UNICOM_PROXY_TYPE="socks5" (可选 http 或 socks5，默认 socks5)

3. 特殊功能设置:
   export UNICOM_GRAB_AMOUNT="5"          : (可选) 抢兑面额 (默认5，自动匹配含"5元"或"5话费"的奖品)
   export UNICOM_TEST_MODE="query"        : (可选) 仅查询模式，跳过任务执行只查询资产
   export UNICOM_AH_FRIDAY_AMOUNT="50"    : (可选) 安徽超级星期五抢红包面额 (如50=抢50元红包, 不填则不执行)

定时规则建议 (Cron):
0 58 9,17 * * * (抢兑专用: 需 sign_config.run_grab_coupon=True，建议提前2分钟启动，脚本自动精准等待)
0 58 9 * * 5   (安徽超级星期五: 需设置 UNICOM_AH_FRIDAY_AMOUNT，每周五9:58启动)
0 7,20 * * *   (推荐：每天早晚7点/20点各跑一次，覆盖绝大部分签到任务)

From: YaoHuo8648
Email: zheyizzf@188.com
Update: 2026.06.07
"""
import os
import sys
import json
import time
import random
import re
import hashlib
import hmac
import base64
import logging
import requests
import uuid
import string
from datetime import datetime
try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass
from urllib.parse import urlparse, parse_qs, urlencode, unquote, quote
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
from Crypto.Cipher import AES, PKCS1_v1_5
from Crypto.PublicKey import RSA
from Crypto.Util.Padding import pad, unpad
SCRIPT_VERSION = "v1.1.2"
# ========================================
# 全局配置 (globalConfig)
# true=开启, false=关闭
# ========================================
globalConfig = {
    # --- 1. 功能总开关 (True=开启, False=关闭) ---
    "enable_sign": True,          # 首页签到 (🔺总开关, 含签到/任务/抢话费券)
    "enable_ttlxj": True,         # 天天领现金
    "enable_ttxc": True,          # 通通乡村
    "enable_ltzf": True,          # 联通祝福
    "enable_woread": False,        # 联通阅读
    "enable_security": True,      # 安全管家
    "enable_ltyp": True,          # 联通云盘
    "enable_market": True,        # 权益超市 (🔺总开关, 必须开启内部功能才能运行)
    "enable_aiting": True,        # 联通爱听
    "enable_wostore": True,       # 沃云手机
    "enable_regional": True,      # 区域专区
    "enable_notify": True,        # 推送通知

    # --- ✅ 签到区内部细分开关 ---
    "sign_config": {
        "run_grab_coupon": False, # False = 关闭抢话费券 (True=开启抢兑, 需配合 UNICOM_GRAB_AMOUNT 设置面额)
    },

    # --- 🛒 权益超市内部细分开关 (按需修改到这里) ---
    "market_config": {
        "run_task": True,         # False = 关闭做任务(浏览/分享)
        "run_member_center": True, # False = 关闭浏览会员中心得积分
        "run_draw": True,         # True  = 开启抽奖
        "run_claim": True,       # True  = 开启自动领奖(建议开启, 不领白不领)
    },

    # --- 🏷️ 区域专区内部细分开关 ---
    "regional_config": {
        "run_ah_friday": True,    # True = 开启安徽超级星期五 (需配合 UNICOM_AH_FRIDAY_AMOUNT 设置面额)
    },

    # --- 2. 设备ID配置 ---
    "refresh_device_id": False,   # False:使用缓存ID, True:强制刷新
}
COMMON_CONSTANTS = {
    "UA": "Dalvik/2.1.0 (Linux; U; Android 12; Mi 10 Pro MIUI/21.11.3);unicom{version:android@11.0802}",
    "MARKET_UA": "Dalvik/2.1.0 (Linux; U; Android 12; Mi 10 Pro MIUI/21.11.3);unicom{version:android@11.0802}",
    "MARKET_H5_UA": "Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.146 Mobile Safari/537.36; unicom{version:android@11.0802,desmobile:0};devicetype{deviceBrand:Xiaomi,deviceModel:MI 8}",
    "APP_VERSION": "android@11.0802",
}
MARKET_MEMBER_CENTER_PAGE_ID = "s782351687947921408"
MARKET_MEMBER_CENTER_DISTRIBUTE_ID = "D1161369893988319232"
MARKET_MEMBER_CENTER_PARTNERS_ID = "1703"
MARKET_MEMBER_CENTER_CLIENT_TYPE = "marketUnicom"
MARKET_MEMBER_CENTER_TASK_CODE = "s769153426294495232"
XJ_ACTIVITY_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
XJ_ACTIVITY_YEAR = os.environ.get("XJ_ACTIVITY_YEAR", str(datetime.now().year))
XJ_ACTIVITY_MONTH = os.environ.get("XJ_ACTIVITY_MONTH", XJ_ACTIVITY_MONTHS[datetime.now().month - 1])
XJ_ACTIVITY_ID = f"{XJ_ACTIVITY_MONTH}{XJ_ACTIVITY_YEAR}Act"
XJ_MONTHLY_DRAW_ATTEMPT_COUNT = max(int(os.environ.get("UNICOM_ATTEMPT_COUNT", "1") or "1"), 1)
XJ_USER_AGENT = os.environ.get(
    "XJ_USER_AGENT",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0701};ltst;OSVersion/16.2"
)
WOCARE_CONSTANTS = {
	"serviceLife": "wocareMBHServiceLife1",
	"anotherApiKey": "beea1c7edf7c4989b2d3621c4255132f",
	"anotherEncryptionKey": "f4cd4ffeb5554586acf65ba7110534f5",
	"minRetries": "1"
}
WOCARE_ACTIVITIES = [
	{"name": "星座配对", "id": 2},
	{"name": "大转盘", "id": 3},
	{"name": "盲盒抽奖", "id": 4}
]
AITING_BASE_URL = "https://pcc.woread.com.cn"
AITING_SIGN_KEY_APPKEY = "7ZxQ9rT3wE5sB2dF"
AITING_SIGN_KEY_API = "woread!@#qwe1234"
AITING_SIGN_KEY_REQUERTID = "46iCw24ewAZbNkK6"
AITING_CLIENT_KEY = "1"
AITING_AES_KEY = "j2K81755sxV12wFx"
AITING_AES_IV = "16-Bytes--String"
WOREAD_KEY = "woreadst^&*12345"
ADDREADTIME_AES_KEY = "UNS#READDAY39COM"
YUNNAN_LIFE_BASE_URL = "https://wsm.wx.yn10010.com"
YUNNAN_LIFE_ACT_ID = "47191519589909"
YUNNAN_LIFE_SIGN_SALT = "ltynsh@sd23kjkgj2mbnfa0"
YUNNAN_LIFE_ACCESS_KEY = "ltynsh"
YUNNAN_LIFE_TO_URL = "https://wsm.wx.yn10010.com/micropage/orderPages/newYear/2025newYearsDay?channelId=1001010"
YUNNAN_LIFE_TASKS = [
    {"taskName": "每日签到", "taskCode": "DAILY_SIGN"},
    {"taskName": "浏览年终大回馈,好礼多多", "taskCode": "BROWSE_5TOWNS"},
]
YPHD_ACTIVITY_ID = "Mjg="
YPHD_SECRET_KEY = "s8Hf3LqP9xN2vM5bR7tY1wZ4cA6eG0K"
YPHD_MOVE_FILE_FID = "pNKsm_lDq4EJWsx1rFMP/uVX7f1Gbu4K4uDaFJepfssdrGui4u/poSDp/vKG21xEIiBk//"
YPHD_MOVE_FILE_NAME = "乘风2026精彩时刻-雨爱.mp4"
YPHD_MGTV_BASE = "https://mgcact.api.mgtv.com"
YPHD_MGTV_TEMPLATE_ID = "2053018128116371456"
YPHD_MGTV_IMG_FID = os.environ.get("UNICOM_YPHD_MGTV_IMG_FID", "").strip()
YPHD_MEMBER_SKU_CODE = "S251222T1F1M3702758"
YPHD_MEMBER_ACTIVITY_CODE = "7IO6ren5HVMw3ouGRTepcSoFBM0r86ZGs9+Fjv6Xjv0="
YPHD_MEMBER_TOUCHPOINT = "300300010005"
YPHD_MEMBER_PHONE_KEY = "yEKmse436lnvTsle"
YPHD_MEMBER_PHONE_IV = "wNSOYIB1k1DjY5lA"
TTXC_BASE_URL = "https://epay.10010.com/cu-ca-game-front"
TTXC_APP_BASE_URL = "https://epay.10010.com/cu-ca-app-front"
TTXC_CHANNEL = "225"
TTXC_REFERER = "https://epay.10010.com/cu-ca-game-web/index.html?channel=qdqp"
TTXC_GARBAGE_WAIT_SECONDS = int(os.environ.get("UNICOM_TTXC_GARBAGE_WAIT", "28") or "28")
TTXC_GROW_MAX_CHARGE_PER_LAND = int(os.environ.get("UNICOM_TTXC_GROW_MAX_CHARGE_PER_LAND", "20") or "20")
TTXC_HARVEST_WAIT_SECONDS = int(os.environ.get("UNICOM_TTXC_HARVEST_WAIT", "3") or "3")
TTXC_NEWBIE_STEPS = ["G01", "G02", "G03", "G03_2", "G04", "G05", "G09", "G10", "G11", "G12"]
GRAB_AMOUNT = os.environ.get("UNICOM_GRAB_AMOUNT", "5")
AH_FRIDAY_AMOUNT = os.environ.get("UNICOM_AH_FRIDAY_AMOUNT", "")
AH_FRIDAY_BASE_URL = "http://123.138.11.116:8080"
AH_FRIDAY_SECKILL_TIMES = int(os.environ.get("UNICOM_AH_FRIDAY_TIMES", "50") or "50")
AH_FRIDAY_INTERVAL = float(os.environ.get("UNICOM_AH_FRIDAY_INTERVAL", "0.3") or "0.3")
WOSTORE_CLOUD_ACTIVITY_CODE = os.environ.get("UNICOM_WOSTORE_ACTIVITY_CODE", "Points_Obtain_2507")
WOSTORE_CLOUD_SIGN_CODE = os.environ.get("UNICOM_WOSTORE_SIGN_CODE", "Points_Sign_2507")
WOSTORE_CLOUD_LOGIN_ACTIVITY_ID = os.environ.get("UNICOM_WOSTORE_LOGIN_ACTIVITY_ID", "HD2026033000125")
WOSTORE_CLOUD_ACTIVITY_CODES = [x.strip() for x in os.environ.get("UNICOM_WOSTORE_ACTIVITY_CODES", "Points_Obtain_2507,Points_Obtain_2506,Points_Obtain_2505,Points_Obtain_2504").split(",") if x.strip()]
WOSTORE_CLOUD_LOTTERY_CODES = [x.strip() for x in os.environ.get("UNICOM_WOSTORE_LOTTERY_CODES", "Points_Obtain_2507,Points_Obtain_2506,Points_Obtain_2505,Points_Obtain_2504").split(",") if x.strip()]
# 云手机抽奖专用活动码 (与任务/签到码不同): activityCode=主抽奖, activityCode2=第二抽奖
WOSTORE_LOTTERY_ACTIVITY_CODES = [x.strip() for x in os.environ.get("UNICOM_WOSTORE_LOTTERY_ACTIVITY_CODES", "HD2026062200218,Lottery_251201").split(",") if x.strip()]
WOSTORE_POINTS_ACT_CODE = os.environ.get("UNICOM_WOSTORE_POINTS_ACT_CODE", "Points_Exchange_2507")
WOSTORE_POINTS_GOODS_ID_10 = os.environ.get("UNICOM_WOSTORE_POINTS_GOODS_ID_10", "2026031010")
WOSTORE_POINTS_GOODS_ID_1 = os.environ.get("UNICOM_WOSTORE_POINTS_GOODS_ID_1", "2026031001")
WOSTORE_POINTS_STOP_PRIZE = os.environ.get("UNICOM_WOSTORE_POINTS_STOP_PRIZE", "7天体验卡")
WOSTORE_POINTS_MAX_DRAW = max(int(os.environ.get("UNICOM_WOSTORE_POINTS_MAX_DRAW", "1") or "1"), 0)
# 云盘家乡打卡活动 (上传图片抽奖)
HOMETOWN_ENABLE = os.environ.get("UNICOM_HOMETOWN_ENABLE", "1").strip() not in ("0", "false", "False", "")
HOMETOWN_MOBILE_KEY = os.environ.get("UNICOM_HOMETOWN_MOBILE_KEY", "CBWGjFHjZdhTf7h8")
HOMETOWN_AES_IV = os.environ.get("UNICOM_HOMETOWN_AES_IV", "wNSOYIB1k1DjY5lA")
HOMETOWN_LOTTERY_SECRET = os.environ.get("UNICOM_HOMETOWN_LOTTERY_SECRET", "s8Hf3LqP9xN2vM5bR7tY1wZ4cA6eG0K")
HOMETOWN_OPEN_ACTIVITY_ID = os.environ.get("UNICOM_HOMETOWN_OPEN_ACTIVITY_ID", "MjU=")
HOMETOWN_LOTTERY_ACTIVITY_ID = os.environ.get("UNICOM_HOMETOWN_LOTTERY_ACTIVITY_ID", "MzA=")
HOMETOWN_MATERIAL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "unicom_hometown_material.jpg")
# 家乡打卡上传素材: 服务端不校验内容/大小, 内置最小合法 JPEG (1x1 白点) 即可通过
HOMETOWN_MATERIAL_BYTES = base64.b64decode(
    "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////////////////////////////////"
    "////////////////////////////////////////////////////wgALCAABAAEBAREA/8QA"
    "FBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxD/2Q=="
)
WOSTORE_CLOUD_TIMEOUT = int(os.environ.get("UNICOM_WOSTORE_TIMEOUT", "15") or "15")
WOSTORE_CLOUD_RETRIES = int(os.environ.get("UNICOM_WOSTORE_RETRIES", "3") or "3")
UNICOM_TOKEN_CACHE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "unicom_token_cache.json")
LOGIN_PUB_KEY = """-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDc+CZK9bBA9IU+gZUOc6FUGu7yO9WpTNB0PzmgFBh96Mg1WrovD1oqZ+eIF4LjvxKXGOdI79JRdve9NPhQo07+uqGQgE4imwNnRx7PFtCRryiIEcUoavuNtuRVoBAm6qdB0SrctgaqGfLgKvZHOnwTjyNqjBUxzMeQlEC2czEMSwIDAQAB
-----END PUBLIC KEY-----"""

def mask_str(s):
    try:
        s = str(s)
        if len(s) == 11 and s.isdigit():
            return s[:3] + "****" + s[7:]
        elif s.startswith("enc_"):
            return s
        elif len(s) > 11:
            return s[:6] + "******" + s[-6:]
        return s
    except:
        return s


def safe_int(value, default=0):
    try:
        return int(str(value).strip())
    except Exception:
        return default

def pretty_json(data):
    try:
        return json.dumps(data, ensure_ascii=False, indent=2, default=str)
    except Exception:
        return str(data)

def response_summary(data):
    if not isinstance(data, dict):
        return str(data)
    meta = data.get("meta")
    source = meta if isinstance(meta, dict) else data
    code = source.get("code") or source.get("resultCode") or source.get("rsp_code")
    msg = source.get("message") or source.get("msg") or source.get("desc") or source.get("resultMsg") or source.get("rsp_desc")
    if msg:
        return str(msg)
    if code:
        return "接口返回异常"
    return "接口返回异常"

class FailoverSession:
    """包装 requests.Session，自动为所有请求添加代理故障转移"""
    RETRIABLE_KEYWORDS = ("Max retries exceeded", "timed out", "connection", "SOCKS", "ProxyError", "ConnectionError", "SSLError", "SSLEOF")

    def __init__(self, session, owner):
        self._session = session
        self._owner = owner  # UserService 实例引用

    def __getattr__(self, name):
        return getattr(self._session, name)

    def _should_failover(self, err_msg):
        if not os.environ.get("UNICOM_PROXY_API"):
            return False
        err_lower = err_msg.lower()
        return any(kw.lower() in err_lower for kw in self.RETRIABLE_KEYWORDS)

    def _has_streaming_payload(self, kwargs):
        if kwargs.get("files"):
            return True
        data = kwargs.get("data")
        return hasattr(data, "read")

    def request(self, method, url, **kwargs):
        try:
            return self._session.request(method, url, **kwargs)
        except Exception as e:
            if self._should_failover(str(e)) or (os.environ.get("UNICOM_PROXY_API") and isinstance(e, requests.exceptions.RequestException)):
                self._owner.log(f"⚠️ [自动故障转移] {url} 请求异常: {e}")
                err_str = str(e).lower()
                is_ssl_or_proxy_err = any(x in err_str for x in ("ssleof", "unexpected_eof", "sslerror", "socks", "proxyerror"))
                if is_ssl_or_proxy_err:
                    self._owner.log("⚠️ [自动故障转移] 检测到 SSL 或代理严重异常，强制拉取新 IP...")
                    self._owner.configure_proxy()
                else:
                    self._owner.failover_proxy()
                if self._has_streaming_payload(kwargs):
                    raise
                try:
                    return self._session.request(method, url, **kwargs)
                except Exception as retry_err:
                    self._owner.log(f"⚠️ [自动故障转移] {url} 重试仍异常: {retry_err}")
                    return None
            raise

    def get(self, url, **kwargs):
        return self.request("GET", url, **kwargs)

    def post(self, url, **kwargs):
        return self.request("POST", url, **kwargs)

class UserService:
    wocare_available = True

    def __init__(self, index, config_str):
        self.index = index
        self.valid = False
        self.notify_logs = []
        raw_session = requests.Session()
        import socket

        class SourceAddressAdapter(HTTPAdapter):

            def init_poolmanager(self, connections, maxsize, block=False, **pool_kwargs):
                pool_kwargs['source_address'] = ('0.0.0.0', 0)
                super(SourceAddressAdapter, self).init_poolmanager(connections, maxsize, block, **pool_kwargs)

            def get_connection(self, url, proxies=None):
                return super(SourceAddressAdapter, self).get_connection(url, proxies)
        retries = Retry(total=3, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
        adapter = SourceAddressAdapter(max_retries=retries)
        raw_session.mount('http://', adapter)
        raw_session.mount('https://', adapter)
        raw_session.headers.update({
            "User-Agent": COMMON_CONSTANTS["UA"],
            "Connection": "keep-alive"
        })
        raw_session.verify = False
        import urllib3
        urllib3.disable_warnings()
        self.session = FailoverSession(raw_session, self)
        self.account_mobile = ""
        self.mobile = ""
        self.account_password = ""
        self.token_online = ""
        self.token_refresh = ""
        self.cookie = ""
        self.appId = ""
        self.city_info = []
        self.last_read_submission_time = 0
        if globalConfig.get("refresh_device_id", False):
            self.uuid = str(uuid.uuid4()).replace('-', '')
        else:
            self.uuid = os.environ.get("chinaUnicomUuid") or str(uuid.uuid4()).replace('-', '')
        self.unicomTokenId = self.random_string(32)
        self.tokenId_cookie = "chinaunicom-" + self.random_string(32, string.ascii_uppercase + string.digits)
        self.ecs_token = ""
        self.rptId = ""
        self.ttxc_newbie_list = None
        self.ttxc_nick_name = ""
        self.sec_ai_share_key = ""
        self.sec_share_task_code = ""
        self.sec_share_task_name = "联通助理-分享AI助手对话"
        self.sec_pending_claim_tasks = {}
        self.init_account(config_str)

    def _parse_proxy_response(self, text):
        """解析代理API响应，支持JSON和文本格式，提取ip/port/user/pass"""
        text = text.strip()

        def extract(d):
            if not d or not d.get('ip') or not d.get('port'):
                return None
            return {
                'ip': str(d['ip']),
                'port': int(d['port']),
                'user': str(d.get('account') or d.get('user') or ''),
                'pass': str(d.get('password') or d.get('pass') or '')
            }
        try:
            json_start = text.find('{')
            json_end = text.rfind('}')
            if json_start != -1 and json_end != -1:
                data = json.loads(text[json_start:json_end + 1])
                if data.get('ip') and data.get('port'):
                    return extract(data)
                if data.get('data'):
                    inner = data['data']
                    if isinstance(inner, dict) and inner.get('list') and isinstance(inner['list'], list) and len(inner['list']) > 0:
                        return extract(inner['list'][0])
                    if isinstance(inner, list) and len(inner) > 0:
                        return extract(inner[0])
                    if isinstance(inner, dict) and inner.get('ip'):
                        return extract(inner)
                if data.get('result') and isinstance(data['result'], dict) and data['result'].get('ip'):
                    return extract(data['result'])
        except:
            pass
        m = re.search(r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})[:\s\t]+(\d{1,5})', text)
        if m:
            return {'ip': m.group(1), 'port': int(m.group(2)), 'user': '', 'pass': ''}
        return None

    def configure_proxy(self):
        proxy_api = os.environ.get("UNICOM_PROXY_API")
        if not proxy_api:
            return
        proxy_type = os.environ.get("UNICOM_PROXY_TYPE", "socks5").lower()
        max_retries = 5
        for attempt in range(1, max_retries + 1):
            try:
                if attempt > 1:
                    self.log(f"🔄 [第{attempt}次] 重试获取代理IP ({proxy_type})...")
                    time.sleep(2)
                else:
                    self.log(f"正在获取代理IP (模式: {proxy_type})...")
                res = requests.get(proxy_api, timeout=10)
                if res.status_code != 200:
                    self.log(f"⚠️ 获取代理失败: HTTP {res.status_code}")
                    continue
                proxy_info = self._parse_proxy_response(res.text)
                if not proxy_info:
                    preview = res.text[:100] + "..." if len(res.text) > 100 else res.text
                    self.log(f"❌ 提取失败: 无法识别代理格式 (内容: {preview})")
                    continue
                ip, port = proxy_info['ip'], proxy_info['port']
                user, pwd = proxy_info['user'], proxy_info['pass']
                if user and pwd:
                    proxy_url = f"{proxy_type}://{quote(user)}:{quote(pwd)}@{ip}:{port}"
                    log_msg = f"{proxy_type}://***:***@{ip}:{port}"
                else:
                    proxy_url = f"{proxy_type}://{ip}:{port}"
                    log_msg = proxy_url
                self.log(f"🔍 提取成功: {log_msg}")
                test_proxies = {"http": proxy_url, "https": proxy_url}
                try:
                    requests.get("https://www.baidu.com", proxies=test_proxies, timeout=3)
                    self.session.proxies.update(test_proxies)
                    self.log("✅ 代理连通性测试通过")
                    return
                except Exception as te:
                    self.log(f"⚠️ 代理测试失败: {te}")
            except Exception as e:
                self.log(f"❌ 请求代理API异常: {e}")
        self.log(f"🚫 重试{max_retries}次均失败，回退至本地IP")

    def failover_proxy(self):
        proxy_api = os.environ.get("UNICOM_PROXY_API")
        if not proxy_api:
            return False
        self.log("⚠️ [故障转移] 检测到网络不稳定，正在检查当前代理是否存活...")
        try:
            requests.get("https://m.client.10010.com/mobileService/business/get/getCity", proxies=self.session.proxies, timeout=3)
            self.log("✅ [故障转移] 经测试当前IP仍有效，继续复用，暂不提取新IP。")
            time.sleep(1)
            return True
        except Exception as e:
            self.log(f"❌ [故障转移] 当前代理已失效 ({e})，准备更换新IP...")
        time.sleep(2)
        self.configure_proxy()
        return True

    def init_account(self, config_str):
        parts = config_str.split('#')
        if len(parts) >= 2 and len(parts[0]) == 11 and parts[0].isdigit() and len(parts[1]) < 50:
             self.account_mobile = parts[0]
             self.account_password = parts[1]
        else:
            self.token_online = parts[0].strip()
            if len(self.token_online) == 11 and self.token_online.isdigit():
                self.account_mobile = self.token_online
                self.token_online = "" # Reset, allow load_token_from_cache to fill it
                self.log(f"识别到纯手机号模式: {mask_str(self.account_mobile)}")
            if len(parts) > 1:
                 self.appId = parts[1].strip()
            if len(parts) > 2 and parts[2]:
                potential_mobile = parts[2].strip()
                if potential_mobile.isdigit() and len(potential_mobile)==11:
                    self.account_mobile = potential_mobile
        self.unicomTokenId = str(uuid.uuid4()).replace('-', '') # simplified
        self.tokenId_cookie = "chinaunicom-" + str(uuid.uuid4()).replace('-', '').upper() # simplified
        self.cookie_string = f"TOKENID_COOKIE={self.tokenId_cookie}; UNICOM_TOKENID={self.unicomTokenId}; sdkuuid={self.unicomTokenId}"
        self.update_session_cookies()

    def update_session_cookies(self):
        if self.cookie_string:
            cookies = {}
            for item in self.cookie_string.split(';'):
                if '=' in item:
                    k, v = item.split('=', 1)
                    cookies[k.strip()] = v.strip()
            self.session.cookies.update(cookies)
        extra_cookies = {}
        if self.token_online:
            extra_cookies['token_online'] = self.token_online
        if self.appId:
            extra_cookies['appId'] = self.appId
        if extra_cookies:
            self.session.cookies.update(extra_cookies)

    def log(self, msg, notify=False):
        prefix = f"账号[{self.index}]"
        full_msg = f"{prefix}{msg}"
        log_line = f"[{datetime.now().strftime('%H:%M:%S')}] {full_msg}"
        print(log_line)
        if notify:
            self.notify_logs.append(str(msg))

    def request_direct(self, method, url, **kwargs):
        session = requests.Session()
        session.verify = False
        try:
            return session.request(method, url, **kwargs)
        finally:
            session.close()

    def rsa_encrypt(self, val):
        self.log(f"正在进行 RSA 加密...")
        try:
             random_str = ''.join(str(random.randint(0, 9)) for _ in range(6))
             text = str(val) + random_str
             data = text.encode('utf-8')
             key_pem = LOGIN_PUB_KEY.encode()
             recipient_key = RSA.import_key(key_pem)
             cipher_rsa = PKCS1_v1_5.new(recipient_key)
             enc_data = cipher_rsa.encrypt(data)
             return base64.b64encode(enc_data).decode('utf-8')
        except Exception as e:
            self.log(f"RSA加密失败: {str(e)}")
            return ""

    def generate_appid(self):

        def rnd(): return str(random.randint(0, 9))
        return (f"{rnd()}f{rnd()}af"
                f"{rnd()}{rnd()}ad"
                f"{rnd()}912d306b5053abf90c7ebbb695887bc"
                f"870ae0706d573c348539c26c5c0a878641fcc0d3e90acb9be1e6ef858a"
                f"59af546f3c826988332376b7d18c8ea2398ee3a9c3db947e2471d32a49") + rnd() + rnd()

    def unicom_login(self):
        self.log("账号密码登录已失效，请使用 Token#AppId 或纯手机号本地缓存")
        return False

    def request(self, method, url, **kwargs):
        try:
            current_cookies = self.session.cookies.get_dict()
            if self.cookie_string:
                for item in self.cookie_string.split(';'):
                    if '=' in item:
                        k, v = item.split('=', 1)
                        current_cookies[k.strip()] = v.strip()
            cookie_header = "; ".join([f"{k}={v}" for k, v in current_cookies.items()])
            if cookie_header:
                if 'headers' not in kwargs:
                    kwargs['headers'] = {}
                kwargs['headers']['Cookie'] = cookie_header
            timeout = kwargs.get('timeout', 10)
            if 'timeout' in kwargs: del kwargs['timeout']
            response = self.session.request(method, url, timeout=timeout, **kwargs)
            if response is None:
                self.log(f"请求 {url} 无响应")
                return None
            if response.status_code >= 400:
                self.log(f"请求 {url} 返回状态码 {response.status_code}")
            return response
        except Exception as e:
            self.log(f"请求 {url} 异常: {str(e)}")
            return None

    def ensure_login(self, max_attempts=3):
        for attempt in range(1, max_attempts + 1):
            if attempt > 1:
                self.log(f"🔄 登录重试 {attempt}/{max_attempts}")
            if not self.token_online and self.account_mobile:
                self.load_token_from_cache()
            if self.token_online and self.onLine():
                self.save_token_to_cache()
                return True
            if not self.token_online:
                if self.account_password:
                    self.log("账号密码登录已失效，未找到可用 Token，跳过")
                return False
            if attempt < max_attempts:
                time.sleep(2)
        return False

    def load_token_from_cache(self):
        if not self.account_mobile:
            return False
        if not os.path.exists(UNICOM_TOKEN_CACHE_PATH):
            return False
        try:
            with open(UNICOM_TOKEN_CACHE_PATH, 'r', encoding='utf-8') as f:
                cache = json.load(f)
            user_cache = cache.get(self.account_mobile)
            if user_cache and user_cache.get('token_online'):
                if (datetime.now().timestamp() * 1000) - user_cache.get('timestamp', 0) < 12 * 60 * 60 * 1000:
                    self.token_online = user_cache['token_online']
                    self.appId = user_cache.get('appId', self.appId)
                    self.city_info = user_cache.get('city_info', [])
                    self.update_session_cookies()
                    self.log(f"♻️ [缓存复用] 成功加载本地 Token ({user_cache.get('time')})")
                    return True
        except Exception as e:
            pass
        return False

    def save_token_to_cache(self):
        if not self.account_mobile:
            return
        cache = {}
        if os.path.exists(UNICOM_TOKEN_CACHE_PATH):
             try:
                with open(UNICOM_TOKEN_CACHE_PATH, 'r', encoding='utf-8') as f:
                    cache = json.load(f)
             except: pass
        now = datetime.now()
        cache[self.account_mobile] = {
            "token_online": self.token_online,
            "appId": self.appId,
            "city_info": getattr(self, 'city_info', []),
            "cookieString": "",
            "timestamp": int(now.timestamp() * 1000),
            "time": now.strftime('%Y-%m-%d %H:%M:%S')
        }
        try:
            with open(UNICOM_TOKEN_CACHE_PATH, 'w', encoding='utf-8') as f:
                json.dump(cache, f, indent=2, ensure_ascii=False)
            self.log("💾 [缓存保存] Token 已写入本地文件")
        except Exception as e:
            self.log(f"❌ 保存缓存失败: {str(e)}")

    def get_city_info(self):
        try:
            url = "https://m.client.10010.com/mobileService/business/get/getCity"
            res = self.session.post(url, data={}, timeout=10).json()
            if res.get('code') == '200' and res.get('list'):
                 self.city_info = res.get('list')
                 return True
            return False
        except:
            return False

    def queryRemain(self):
        try:
            if not self.ecs_token:
                if not self.onLine():
                    self.log("❌ 无法获取 ecs_token，跳过查询")
                    return
            self.log("==== 资产查询 ====")
            self.log("正在查询套餐余量...")
            url = "https://m.client.10010.com/servicequerybusiness/balancenew/accountBalancenew.htm"
            headers = {
                "User-Agent": COMMON_CONSTANTS["MARKET_UA"],
                "Cookie": f"ecs_token={self.ecs_token}"
            }
            res = self.request("get", url, headers=headers)
            if not res: return
            result = res.json()
            if result.get('code') == '0000':
                current_balance = "0.00"
                real_time_fee = "0.00"
                if result.get('curntbalancecust'):
                    current_balance = str(result['curntbalancecust'])
                if result.get('realfeecust'):
                    real_time_fee = str(result['realfeecust'])
                self.log(f"💰 [资产-话费] 当前余额: {current_balance}元, 实时话费: {real_time_fee}元", notify=True)
                pkg_list = result.get('realTimeFeeSpecialFlagThree', [])
                if pkg_list and isinstance(pkg_list, list):
                    self.log(f"    📋 [套餐详情]:", notify=True)
                    for item in pkg_list:
                        sub_items = item.get('subItems', [])
                        if sub_items:
                            for sub in sub_items:
                                bill = sub.get('bill', {})
                                if bill:
                                    name = bill.get('integrateitem', '未知项')
                                    fee = bill.get('realfee', '0.00')
                                    self.log(f"       - {name}: {fee}元", notify=True)
            else:
                msg = result.get('desc') or result.get('msg') or "未知错误"
                self.log(f"套餐余量查询失败: {msg}")
        except Exception as e:
            self.log(f"queryRemain 异常: {str(e)}")

    def onLine(self):
        if not self.token_online:
             self.log("❌ 缺少 token_online，无法执行 onLine")
             return False
        try:
            url = "https://m.client.10010.com/mobileService/onLine.htm"
            data = {
                'isFirstInstall': '1',
                'netWay': 'Wifi',
                'version': 'android@11.0000',
                'token_online': self.token_online,
                'provinceChanel': 'general',
                'deviceModel': 'ALN-AL10',
                'step': 'dingshi',
                'androidId': '291a7deb1d716b5a',
                'reqtime': int(time.time() * 1000)
            }
            if self.appId:
                data['appId'] = self.appId
            res = self.request('post', url, data=data)
            if not res: return False
            result = res.json()
            code = result.get('code')
            if code == '0' or code == 0:
                self.valid = True
                desmobile = result.get('desmobile', '')
                if len(desmobile) == 11 and desmobile.isdigit():
                    self.account_mobile = desmobile
                    self.mobile = desmobile
                elif desmobile.startswith("enc_"):
                     if not self.account_mobile:
                          self.log("⚠️ 注意: 服务端返回了加密手机号且未配置本地手机号")
                self.log("登录成功")
                self.city_info = result.get('list', [])
                self.ecs_token = result.get('ecs_token')
                self.t3_token = result.get('t3_token', '')
                self.private_token = result.get('private_token', '')
                return True
            else:
                self.log(f"登录失败[{code}]: {result.get('msg')}")
                return False
        except Exception as e:
            self.log(f"onLine 异常: {str(e)}")
            return False

    def gettaskip(self):
        orderId = self.random_string(32).upper()
        try:
            url = "https://m.client.10010.com/taskcallback/topstories/gettaskip"
            data = {
                "mobile": self.account_mobile,
                "orderId": orderId
            }
            self.request("post", url, data=data)
        except Exception as e:
            pass
        return orderId

    def sign_getContinuous(self, is_query_only=False):
        try:
            url = "https://activity.10010.com/sixPalaceGridTurntableLottery/signin/getContinuous"
            params = {
                "taskId": "",
                "channel": "wode",
                "imei": self.uuid
            }
            res = self.request("get", url, params=params)
            if not res: return
            result = res.json()
            code = result.get('code')
            if code == "0000":
                todayIsSignIn = result.get('data', {}).get('todayIsSignIn', 'n')
                self.log(f"签到区今天{'已' if todayIsSignIn == 'y' else '未'}签到", notify=True)
                if todayIsSignIn == 'y':
                    pass
                else:
                    if not is_query_only:
                        time.sleep(1)
                        self.sign_daySign()
                    else:
                        self.log("签到区: [查询模式] 跳过自动打卡")
            else:
                self.log(f"签到区查询签到状态失败[{code}]: {result.get('desc', '')}")
        except Exception as e:
            self.log(f"sign_getContinuous 异常: {str(e)}")

    def sign_daySign(self):
        try:
            url = "https://activity.10010.com/sixPalaceGridTurntableLottery/signin/daySign"
            res = self.request("post", url, data={})
            if not res: return
            result = res.json()
            code = result.get('code')
            if code == "0000":
                data = result.get('data', {})
                msg = f"签到区签到成功: [{data.get('statusDesc', '')}]{data.get('redSignMessage', '')}"
                self.log(msg)
            elif code == "0002" and "已经签到" in result.get('desc', ''):
                self.log("签到区签到成功: 今日已完成签到！")
            else:
                self.log(f"签到区签到失败[{code}]: {result.get('desc', '')}")
        except Exception as e:
            self.log(f"sign_daySign 异常: {str(e)}")

    def sign_getTelephone(self, is_initial=False, silent=False):
        try:
            url = "https://act.10010.com/SigninApp/convert/getTelephone"
            res = self.request("post", url, data={})
            if not res: return None
            result = res.json()
            status = result.get('status')
            if status == "0000" and result.get('data'):
                tel_val = result['data'].get('telephone', 0)
                try:
                    current_amount = float(tel_val)
                except:
                    current_amount = 0.0
                if silent:
                    return current_amount
                if is_initial:
                    msg = f"签到区-话费红包: 运行前总额 {current_amount:.2f}元"
                    self.sign_initial_amount = current_amount
                else:
                    if hasattr(self, 'sign_initial_amount'):
                        increase = current_amount - self.sign_initial_amount
                        self.log(f"签到区-话费红包: 本次运行增加 {increase:.2f}元", notify=True)
                    msg = f"签到区-话费红包: 总额 {current_amount:.2f}元"
                    exp_val = result['data'].get('needexpNumber', 0)
                    try:
                        exp_num = float(exp_val)
                    except:
                        exp_num = 0.0
                    if exp_num > 0:
                        msg += f"，其中 {result['data'].get('needexpNumber', '0')}元 将于 {result['data'].get('month', '')}月底到期"
                self.log(msg, notify=not is_initial)
                return current_amount
            else:
                if not silent:
                    self.log(f"签到区查询话费红包失败[{status}]: {result.get('msg', '')}")
                return None
        except Exception as e:
            if not silent:
                self.log(f"sign_getTelephone 异常: {str(e)}")
            return None

    def sign_getTaskList(self):
        try:
            url = "https://activity.10010.com/sixPalaceGridTurntableLottery/task/taskList"
            headers = {"Referer": "https://img.client.10010.com/"}
            for i in range(30):
                res = self.request("get", url, params={"type": "2"}, headers=headers, timeout=10)
                if not res: return
                result = res.json()
                code = result.get('code')
                if code == "0329" or "火爆" in result.get('desc', ''):
                    self.log("签到区: 系统繁忙(0329)，停止后续尝试")
                    break
                if code != "0000":
                    self.log(f"签到区-任务中心: 获取任务列表失败[{code}]: {result.get('desc', '')}")
                    return
                tag_list = result.get('data', {}).get('tagList', []) or []
                task_list = result.get('data', {}).get('taskList', []) or []
                all_tasks = task_list + [t for tag in tag_list for t in tag.get('taskDTOList', [])]
                all_tasks = [t for t in all_tasks if t]
                if not all_tasks:
                    if i == 0: self.log("签到区-任务中心: 当前无任何任务。")
                    break
                do_task = next((t for t in all_tasks if t.get('taskState') == '1' and t.get('taskType') == '5'), None)
                if do_task:
                    self.log(f"签到区-任务中心: 开始执行任务 [{do_task.get('taskName')}]")
                    self.sign_doTaskFromList(do_task)
                    time.sleep(3)
                    continue
                claim_task = next((t for t in all_tasks if t.get('taskState') == '0'), None)
                if claim_task:
                    self.log(f"签到区-任务中心: 发现可领取奖励的任务 [{claim_task.get('taskName')}]")
                    self.sign_getTaskReward(claim_task.get('id'))
                    time.sleep(2)
                    continue
                if i == 0:
                    self.log("签到区-任务中心: 没有可执行或可领取的任务。")
                else:
                    self.log("签到区-任务中心: 所有任务处理完毕。")
                break
        except Exception as e:
            self.log(f"sign_getTaskList 异常: {str(e)}")

    def sign_doTaskFromList(self, task):
        try:
            if task.get('url') and task['url'] != '1' and task['url'].startswith('http'):
                 self.request("get", task['url'], headers={"Referer": "https://img.client.10010.com/"})
                 self.log(f"签到区-任务中心: 浏览页面 [{task.get('taskName')}]")
                 time.sleep(random.uniform(5, 7))
            orderId = self.gettaskip()
            url = "https://activity.10010.com/sixPalaceGridTurntableLottery/task/completeTask"
            params = {
                "taskId": task.get('id'),
                "orderId": orderId,
                "systemCode": "QDQD"
            }
            res = self.request("get", url, params=params)
            if not res: return
            result = res.json()
            code = result.get('code')
            if code == "0000":
                self.log(f"签到区-任务中心: ✅ 任务 [{task.get('taskName')}] 已完成")
            else:
                self.log(f"签到区-任务中心: ❌ 任务 [{task.get('taskName')}] 完成失败[{code}]: {result.get('desc', '未知错误')}")
        except Exception as e:
             self.log(f"sign_doTaskFromList 异常: {str(e)}")

    def sign_getTaskReward(self, task_id):
        try:
            url = "https://activity.10010.com/sixPalaceGridTurntableLottery/task/getTaskReward"
            res = self.request("get", url, params={"taskId": task_id})
            if not res: return
            result = res.json()
            code = result.get('code')
            if code == "0000":
                data = result.get('data', {})
                if data.get('code') == '0000':
                    self.log(f"签到区-领取奖励: [{data.get('prizeName', '')}] {data.get('prizeNameRed', '')}")
                else:
                    self.log(f"签到区-领取奖励失败[{data.get('code')}]: {result.get('desc') or data.get('desc')}")
            else:
                self.log(f"签到区-领取奖励失败[{code}]: {result.get('desc', '')}")
        except Exception as e:
            self.log(f"sign_getTaskReward 异常: {str(e)}")

    def sign_month_sign_gift(self, is_query_only=False):
        try:
            url = "https://activity.10010.com/sixPalaceGridTurntableLottery/floor/getMonthSign"
            headers = {"Referer": "https://img.client.10010.com/"}
            res = self.request("get", url, headers=headers, timeout=10)
            if not res: return
            result = res.json()
            code = result.get('code')
            if code != "0000":
                self.log(f"签到区-月签有礼: 查询失败[{code}]: {result.get('desc', '')}")
                return
            task_list = result.get('data', {}).get('taskList', []) or []
            if not task_list:
                self.log("签到区-月签有礼: 暂无月签任务")
                return
            claim_tasks = [
                t for t in task_list
                if str(t.get('taskStatus')) == "1" and t.get('taskId') and t.get('id')
            ]
            claimed_count = sum(1 for t in task_list if str(t.get('taskStatus')) == "2")
            if is_query_only:
                self.log(f"签到区-月签有礼: 可领取 {len(claim_tasks)} 个，已领取 {claimed_count} 个")
                return
            if not claim_tasks:
                self.log(f"签到区-月签有礼: 暂无可领取奖励，已领取 {claimed_count}/{len(task_list)}")
                return
            for task in claim_tasks:
                self.sign_get_month_sign_reward(task)
                time.sleep(1)
        except Exception as e:
            self.log(f"sign_month_sign_gift 异常: {str(e)}")

    def sign_get_month_sign_reward(self, task):
        task_name = task.get('taskName') or "月签奖励"
        try:
            url = "https://activity.10010.com/sixPalaceGridTurntableLottery/task/getTaskReward"
            params = {
                "taskId": task.get('taskId'),
                "taskType": "30",
                "id": task.get('id')
            }
            headers = {"Referer": "https://img.client.10010.com/"}
            res = self.request("get", url, params=params, headers=headers, timeout=10)
            if not res: return
            result = res.json()
            code = result.get('code')
            data = result.get('data', {}) or {}
            if code == "0000" and data.get('code') == "0000":
                prize_name = data.get('prizeName', '')
                prize_red = data.get('prizeNameRed', '')
                reward = f"[{prize_name}] {prize_red}".strip() if prize_name or prize_red else data.get('statusDesc', '领取成功')
                self.log(f"签到区-月签有礼: [{task_name}] {reward}", notify=True)
                return
            msg = data.get('desc') or result.get('desc') or result.get('msg') or "未知错误"
            self.log(f"签到区-月签有礼: [{task_name}] 领取失败[{data.get('code') or code}]: {msg}")
        except Exception as e:
            self.log(f"sign_get_month_sign_reward 异常: {str(e)}")

    def sign_grabCoupon(self):
        sc = globalConfig.get("sign_config", {})
        if not sc.get("run_grab_coupon", False):
             return
        self.log(f"⚔️ [抢兑阶段] 正在检查目标: {GRAB_AMOUNT}元 话费券...")
        candidates = []
        try:
            url = "https://act.10010.com/SigninApp/new_convert/prizeList"
            headers = {"Origin": "https://img.client.10010.com"}
            res = self.request("post", url, headers=headers)
            if res:
                list_res = res.json()
                if list_res.get('status') == "0000":
                    details = list_res.get('data', {}).get('datails', {})
                    tab_items = details.get('tabItems', [])
                    self.log(f"📋 [调试] 共获取到 {len(tab_items)} 个场次数据")
                    for tab in tab_items:
                        products = tab.get('timeLimitQuanListData', [])
                        round_time_str = tab.get('time', '')
                        round_date = None
                        try:
                            if round_time_str and ":" in round_time_str:
                                now = datetime.now()
                                date_str = now.strftime('%Y/%m/%d')
                                full_time_str = f"{date_str} {round_time_str}"
                                if len(round_time_str) <= 8:
                                    round_date = datetime.strptime(full_time_str, "%Y/%m/%d %H:%M")
                                else:
                                    round_date = datetime.strptime(round_time_str, "%Y-%m-%d %H:%M:%S")
                        except:
                            pass
                        for item in products:
                            p_name = item.get('product_name', '')
                            if str(GRAB_AMOUNT) in p_name and ("元" in p_name or "话费" in p_name):
                                 self.log(f"      ✅ 发现目标: {p_name} (ID: {item.get('product_id')})")
                                 candidates.append({
                                     "id": item.get('product_id'),
                                     "name": p_name,
                                     "typeCode": item.get('type_code') or '0',
                                     "timeStr": round_time_str,
                                     "startTime": round_date,
                                     "itemData": item
                                 })
        except Exception as e:
            self.log(f"❌ 获取奖品列表失败: {str(e)}")
        if not candidates:
            self.log(f"⚠️ 未在任何场次中匹配到名为 '{GRAB_AMOUNT}元' 的奖品。")
            return
        now = datetime.now()
        best_candidate = None
        min_diff = float('inf')
        for cand in candidates:
            start_time = cand['startTime']
            if not start_time: continue
            diff = (start_time - now).total_seconds()
            score = 0
            if diff > 0:
                score = diff
            elif diff > -600:
                score = abs(diff) + 10000
            else:
                score = abs(diff) + 90000
            if score < min_diff:
                min_diff = score
                best_candidate = cand
        if not best_candidate:
            best_candidate = candidates[0]
        self.log(f"🎯 最终锁定场次: [{best_candidate['timeStr']}] {best_candidate['name']}")
        if best_candidate['startTime']:
            start_time = best_candidate['startTime']
            wait_seconds = (start_time - datetime.now()).total_seconds()
            if wait_seconds > 0:
                if wait_seconds > 300:
                    self.log(f"⏳ 距离开抢还有 {wait_seconds:.1f} 秒，大于5分钟，暂不等待。建议在临近时间(如提前2分钟)再运行脚本。")
                    return
                self.log(f"⏳ 正在等待开抢... (剩余 {wait_seconds:.1f} 秒)")
                while (best_candidate['startTime'] - datetime.now()).total_seconds() > 0.5:
                    time.sleep(0.5)
            else:
                 self.log(f"⚡ 当前时间已超过场次时间 {abs(wait_seconds):.1f}s，直接抢兑！")
        self.sign_grab_execute(best_candidate)

    def sign_grab_execute(self, candidate):
        for i in range(1, 6):
            self.log(f"🔥 [第{i}次冲击] 发起兑换请求...")
            try:
                data = {
                    "product_id": candidate['id'],
                    "typeCode": candidate['typeCode']
                }
                url = "https://act.10010.com/SigninApp/convert/prizeConvert"
                headers = {
                    "Origin": "https://img.client.10010.com",
                    "Referer": "https://img.client.10010.com/",
                    "X-Requested-With": "com.sinovatech.unicom.ui"
                }
                res = self.request("post", url, data=data, headers=headers)
                if not res: continue
                result = res.json()
                uuid_val = result.get('data', {}).get('uuid')
                status = result.get('status')
                if status == "0000" and uuid_val:
                    self.log(f"📝 [提交成功] 获取到工单号: {uuid_val}，正在查询最终结果...")
                    check_url = "https://act.10010.com/SigninApp/convert/prizeConvertResult"
                    check_data = { "uuid": uuid_val }
                    check_res = self.request("post", check_url, data=check_data, headers=headers)
                    if not check_res: continue
                    final_res = check_res.json()
                    final_status = final_res.get('status')
                    if final_status == "0000":
                        self.log(f"🎉🎉🎉 [抢兑成功] 恭喜！已成功抢到目标奖品！ 🎉🎉🎉", notify=True)
                        return
                    else:
                        err_code = final_res.get('data', {}).get('errorCode', '')
                        msg = final_res.get('msg', '') or final_res.get('message', '未知原因')
                        detail_msg = final_res.get('data', {}).get('rightBtn', {}).get('name', '')
                        log_msg = f"💔 [抢兑失败] 状态: {final_status}"
                        if err_code: log_msg += f" | 错误码: {err_code}"
                        if detail_msg: log_msg += f" | 详情: {detail_msg}"
                        log_msg += f" | 提示: {msg}"
                        self.log(log_msg, notify=True)
                else:
                    self.log(f"📝 提交结果: {result.get('msg') or result.get('message') or json.dumps(result)}")
                time.sleep(0.2)
            except Exception as e:
                self.log(f"❌ 抢兑异常: {str(e)}")

    def get_wocare_body(self, apiCode, requestData={}):
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S') + str(int(datetime.now().microsecond / 1000)).zfill(3)
        encodedContent = base64.b64encode(json.dumps(requestData, separators=(',', ':')).encode('utf-8')).decode('utf-8')
        body = {
            "version": WOCARE_CONSTANTS["minRetries"],
            "apiCode": apiCode,
            "channelId": WOCARE_CONSTANTS["anotherApiKey"],
            "transactionId": timestamp + self.random_string(6, "0123456789"),
            "timeStamp": timestamp,
            "messageContent": encodedContent
        }
        params_array = []
        for key in sorted(body.keys()):
            params_array.append(f"{key}={body[key]}")
        params_array.append(f"sign={WOCARE_CONSTANTS['anotherEncryptionKey']}")
        sign_str = "&".join(params_array)
        body["sign"] = hashlib.md5(sign_str.encode('utf-8')).hexdigest()
        return body

    def wocare_api(self, apiCode, requestData={}):
        try:
            url = f"https://wocare.unisk.cn/api/v1/{apiCode}"
            body = self.get_wocare_body(apiCode, requestData)
            res = self.request("post", url, data=body)
            if not res: return None
            result = res.json()
            if result.get("messageContent"):
                try:
                    content = result["messageContent"]
                    content = content.replace('\n', '').replace('\r', '').replace(' ', '')
                    content = content.replace('-', '+').replace('_', '/')
                    missing_padding = len(content) % 4
                    if missing_padding:
                        content += '=' * (4 - missing_padding)
                    try:
                        decoded_bytes = base64.b64decode(content)
                        decoded_str = decoded_bytes.decode('utf-8')
                    except UnicodeDecodeError:
                        decoded_str = decoded_bytes.decode('utf-8', errors='replace')
                    except Exception as e:
                        decoded_str = "{}"
                    try:
                        decoded = json.loads(decoded_str, strict=False)
                    except:
                        decoded_str = re.sub(r'[\x00-\x1f\x7f]', '', decoded_str)
                        try:
                            decoded = json.loads(decoded_str, strict=False)
                        except:
                            decoded = {}
                    if isinstance(decoded, dict):
                        if "data" in decoded:
                            result["data"] = decoded["data"]
                        else:
                            result["data"] = decoded
                        if "resultMsg" in decoded:
                            result["resultMsg"] = decoded["resultMsg"]
                        if "resultCode" in decoded:
                            result["resultCode"] = decoded["resultCode"]
                except Exception as e:
                    self.log(f"联通祝福: 解析返回失败: {str(e)}")
            return result
        except Exception as e:
            self.log(f"wocare_api 异常: {str(e)}")
            return None

    def wocare_getToken(self, ticket):
        try:
            url = "https://wocare.unisk.cn/mbh/getToken"
            params = {
                "channelType": WOCARE_CONSTANTS["serviceLife"],
                "type": "02",
                "ticket": ticket,
                "version": COMMON_CONSTANTS["APP_VERSION"],
                "timestamp": datetime.now().strftime('%Y%m%d%H%M%S') + str(int(datetime.now().microsecond / 1000)).zfill(3),
                "desmobile": self.account_mobile,
                "num": "0",
                "postage": self.random_string(32),
                "homePage": "home",
                "duanlianjieabc": "qAz2m",
                "userNumber": self.account_mobile
            }
            res = self.session.get(url, params=params, allow_redirects=False, timeout=15)
            if res.status_code == 302:
                location = res.headers.get("Location", "")
                if location:
                    parsed = urlparse(location)
                    sid = parse_qs(parsed.query).get("sid", [None])[0]
                    if not sid:
                        sid = parse_qs(parsed.query).get("uuid", [None])[0]
                        if sid:
                            self.log(f"联通祝福: 未找到sid，使用uuid替代: {sid}")
                    if sid:
                        self.wocare_sid = sid
                        return self.wocare_loginmbh()
                    else:
                        self.log(f"联通祝福: 没有获取到sid或uuid, Location: {location}")
                else:
                    self.log("联通祝福: 没有获取到location")
            else:
                self.log(f"联通祝福: 获取sid失败[{res.status_code}]")
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as ce:
            self.log("联通祝福: 连接wocare服务失败，可能服务已关闭或网络不可达")
        except Exception as e:
            self.log(f"wocare_getToken 异常: {str(e)}")
        return False

    def wocare_loginmbh(self):
        try:
            apiCode = "loginmbh"
            requestData = {
                "sid": self.wocare_sid,
                "channelType": WOCARE_CONSTANTS["serviceLife"],
                "apiCode": apiCode
            }
            result = self.wocare_api(apiCode, requestData)
            if not result: return False
            responseResult = result
            resultCode = responseResult.get("resultCode", "-1")
            if resultCode == "0000":
                self.wocare_token = responseResult.get("data", {}).get("token")
                self.log("联通祝福: 登录成功")
                return True
            else:
                msg = responseResult.get("resultMsg") or responseResult.get("resultDesc") or ""
                self.log(f"联通祝福: 登录失败[{resultCode}]: {msg}")
        except Exception as e:
            self.log(f"wocare_loginmbh 异常: {str(e)}")
        return False

    def wocare_getDrawTask(self, activity):
        try:
            apiCode = "getDrawTask"
            requestData = {
                "token": self.wocare_token,
                "channelType": WOCARE_CONSTANTS["serviceLife"],
                "type": activity["id"],
                "apiCode": apiCode
            }
            result = self.wocare_api(apiCode, requestData)
            responseResult = result if result else {}
            resultCode = responseResult.get("resultCode", "-1")
            if resultCode == "0000":
                taskList = responseResult.get("data", {}).get("taskList", []) or []
                if not taskList:
                    pass
                else:
                    self.log(f"联通祝福: [{activity['name']}] 查询到 {len(taskList)} 个任务")
                    for task in taskList:
                        ts = task.get("taskStatus")
                        if str(ts) == "0" or not ts:
                            self.wocare_completeTask(activity, task)
            else:
                msg = responseResult.get("resultMsg") or responseResult.get("resultDesc") or ""
                self.log(f"联通祝福: [{activity['name']}]查询任务失败[{resultCode}]: {msg}")
        except Exception as e:
            self.log(f"wocare_getDrawTask 异常: {str(e)}")

    def wocare_completeTask(self, activity, task, taskStep="1"):
        try:
            taskTitle = task.get("title", "")
            action = "领取任务" if taskStep == "1" else "完成任务"
            apiCode = "completeTask"
            requestData = {
                "token": self.wocare_token,
                "channelType": WOCARE_CONSTANTS["serviceLife"],
                "task": task.get("id"),
                "taskStep": taskStep,
                "type": activity["id"],
                "apiCode": apiCode
            }
            result = self.wocare_api(apiCode, requestData)
            responseResult = result if result else {}
            resultCode = responseResult.get("resultCode", "-1")
            if resultCode == "0000":
                self.log(f"联通祝福: {action}[{taskTitle}]成功")
                if taskStep == "1":
                    time.sleep(1)
                    self.wocare_completeTask(activity, task, "4")
            else:
                msg = responseResult.get("resultMsg") or responseResult.get("resultDesc") or ""
                self.log(f"联通祝福: [{activity['name']}]{action}[{taskTitle}]失败[{resultCode}]: {msg}")
        except Exception as e:
            self.log(f"wocare_completeTask 异常: {str(e)}")

    def wocare_getSpecificityBanner(self):
        try:
            apiCode = "getSpecificityBanner"
            requestData = {
                "token": self.wocare_token,
                "apiCode": apiCode
            }
            result = self.wocare_api(apiCode, requestData)
            responseResult = result if result else {}
            resultCode = responseResult.get("resultCode", "-1")
            if resultCode == "0000":
                bannerList = responseResult.get("data", []) or []
                if not bannerList:
                    self.log(f"联通祝福: 获取动态 Banner 列表为空，接口明细: {responseResult}")
                for banner in bannerList:
                    if str(banner.get("activityStatus")) == "0" and str(banner.get("isDeleted")) == "0":
                        self.wocare_getDrawTask(banner)
                        self.wocare_loadInit(banner)
            else:
                msg = responseResult.get("resultMsg") or responseResult.get("resultDesc", "")
                self.log(f"联通祝福: 进入活动失败[{resultCode}]: {msg}")
        except Exception as e:
            self.log(f"wocare_getSpecificityBanner 异常: {str(e)}")

    def wocare_loadInit(self, activity):
        try:
            apiCode = "loadInit"
            requestData = {
                "token": self.wocare_token,
                "channelType": WOCARE_CONSTANTS["serviceLife"],
                "type": activity["id"],
                "apiCode": apiCode
            }
            result = self.wocare_api(apiCode, requestData)
            responseResult = result if result else {}
            resultCode = responseResult.get("resultCode", "-1")
            if resultCode == "0000":
                responseData = responseResult.get("data", {}) or {}
                activeModuleGroupId = responseData.get("zActiveModuleGroupId")
                drawCount = 0
                aid = activity["id"]
                if aid == 2:
                    isPartake = responseData.get("data", {}).get("isPartake") or 0
                    if not isPartake:
                        drawCount = 1
                elif aid == 3:
                    drawCount = int(responseData.get("raffleCountValue", 0) or 0)
                elif aid == 4:
                    drawCount = int(responseData.get("mhRaffleCountValue", 0) or 0)
                if drawCount > 0:
                     self.log(f"联通祝福: [{activity['name']}] 可抽奖次数 {drawCount}")
                else:
                     self.log(f"联通祝福: [{activity['name']}] 今日已无抽奖机会")
                while drawCount > 0:
                    time.sleep(2)
                    self.wocare_luckDraw(activity, activeModuleGroupId)
                    drawCount -= 1
            else:
                msg = responseResult.get("resultMsg") or responseResult.get("resultDesc") or ""
                self.log(f"联通祝福: [{activity['name']}]查询活动失败[{resultCode}]: {msg}")
        except Exception as e:
            self.log(f"wocare_loadInit 异常: {str(e)}")

    def wocare_luckDraw(self, activity, activeModuleGroupId):
        try:
            apiCode = "luckDraw"
            requestData = {
                "token": self.wocare_token,
                "channelType": WOCARE_CONSTANTS["serviceLife"],
                "zActiveModuleGroupId": activeModuleGroupId,
                "type": activity["id"],
                "apiCode": apiCode
            }
            result = self.wocare_api(apiCode, requestData)
            responseResult = result if result else {}
            resultCode = responseResult.get("resultCode", "-1")
            if resultCode == "0000":
                resultData = responseResult.get("data", {}) or {}
                drawResultCode = resultData.get("resultCode", "-1")
                if drawResultCode == "0000":
                    prize = resultData.get("data", {}).get("prize", {})
                    prizeName = prize.get("prizeName", "")
                    prizeDesc = prize.get("prizeDesc", "")
                    self.log(f"联通祝福: [{activity['name']}]抽奖: {prizeName}[{prizeDesc}]", notify=True)
                else:
                    msg = responseResult.get("resultMsg") or responseResult.get("resultDesc") or ""
                    if msg.lower() == "success":
                        self.log(f"联通祝福: [{activity['name']}] 未中奖 (继续努力)")
                    else:
                        self.log(f"联通祝福: [{activity['name']}] 抽奖并未中奖: {msg}")
            else:
                msg = responseResult.get("resultMsg") or responseResult.get("resultDesc") or ""
                if msg.lower() == "success":
                    self.log(f"联通祝福: [{activity['name']}] 未中奖 (继续努力)")
                else:
                    self.log(f"联通祝福: [{activity['name']}] 抽奖异常[{resultCode}]: {msg}")
        except Exception as e:
            self.log(f"wocare_luckDraw 异常: {str(e)}")

    def parse_jwt_payload(self, token):
        try:
            payload = token.split('.')[1]
            padding = len(payload) % 4
            if padding:
                payload += '=' * (4 - padding)
            payload = payload.replace('-', '+').replace('_', '/')
            decoded_bytes = base64.b64decode(payload)
            return json.loads(decoded_bytes.decode('utf-8'))
        except Exception as e:
            self.log(f"JWT Decode Error: {e}")
            return {}

    def generate_market_signature_headers(self, user_token, query_string="", json_body=""):
        try:
            token = user_token.replace('Bearer ', '')
            payload = self.parse_jwt_payload(token)
            login_id = payload.get('loginId', '')
            app_secret = hashlib.md5(f"al:ak:{login_id}".encode('utf-8')).hexdigest()
            nonce = str(uuid.uuid4())
            message = f"{login_id}{app_secret}{nonce}{query_string or ''}{json_body or ''}"
            signature = base64.b64encode(
                hmac.new(
                    app_secret.encode('utf-8'),
                    message.encode('utf-8'),
                    digestmod=hashlib.sha256
                ).digest()
            ).decode('utf-8')
            return {
                'X-User-Id': login_id,
                'X-Nonce': nonce,
                'X-Timestamp': str(int(time.time() * 1000)),
                'X-Signature': signature,
                'Content-Type': 'application/json'
            }
        except Exception as e:
            self.log(f"Signature Generation Error: {e}")
            return {}

    def get_market_headers(self, user_token):
        return {
            'User-Agent': COMMON_CONSTANTS['MARKET_UA'],
            'Authorization': f"Bearer {user_token}",
            'Content-Type': 'application/json',
            'X-Requested-With': 'com.sinovatech.unicom.ui'
        }

    def market_get_ticket(self):
        self.log("权益超市: 正在获取 ticket...")
        target_url = "https://contact.bol.wo.cn/market"
        res = self.openPlatLineNew(target_url)
        if res and 'ticket' in res:
            self.log("权益超市: 获取ticket成功")
            return res['ticket']
        self.log("权益超市: 获取ticket失败")
        return None

    def market_get_user_token(self, ticket):
        url = f"https://backward.bol.wo.cn/prod-api/auth/marketUnicomLogin?ticket={ticket}"
        headers = {
            'User-Agent': COMMON_CONSTANTS['MARKET_UA'],
            'Connection': "Keep-Alive",
            'Accept-Encoding': "gzip",
        }
        for attempt in range(1, 4):
            try:
                self.log(f"权益超市: 正在获取 userToken...{f' (第{attempt}次重试)' if attempt > 1 else ''}")
                res = self.session.post(url, headers=headers, timeout=30).json()
                if res.get('code') == 200:
                    user_token = res.get('data', {}).get('token')
                    if user_token:
                        self.log("权益超市: 获取userToken成功")
                        return user_token
                self.log(f"权益超市: 获取userToken失败: {res.get('msg')}")
            except Exception as e:
                self.log(f"权益超市: 获取userToken异常: {e}")
            if attempt < 3:
                self.log(f"权益超市: 等待5秒后重试...")
                time.sleep(5)
        return None

    def market_get_raffle(self, user_token):
        self.log("权益超市: 正在查询奖品池...")
        try:
            timestamp = int(time.time() * 1000)
            query_string = f"id=12&timeVerRan={timestamp}"
            json_body = "{}"
            sig_headers = self.generate_market_signature_headers(user_token, query_string, json_body)
            url = f"https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/prizeList?{query_string}"
            headers = self.get_market_headers(user_token)
            headers.update(sig_headers)
            headers['Referer'] = 'https://contact.bol.wo.cn/market'
            headers['Origin'] = 'https://contact.bol.wo.cn'
            res = self.session.post(url, headers=headers, data=json_body).json()
            if res.get('code') == 200 and isinstance(res.get('data'), list):
                keywords = ['月卡', '月会员', '月度', 'VIP月', '一个月', '周卡']
                exclude = ['5G宽视界', '沃视频']
                live_prizes = []
                for p in res['data']:
                    vip_prob = float(p.get('probabilityVip') or p.get('newVipProbability') or 0)
                    norm_prob = float(p.get('probability') or 0)
                    name = p.get('name', '')
                    daily_limit = int(p.get('dailyPrizeLimit') or 0)
                    match = any(k in name for k in keywords)
                    not_excluded = not any(e in name for e in exclude)
                    has_stock = daily_limit > 0
                    has_chance = norm_prob > 0 or vip_prob > 0
                    if match and not_excluded and has_stock and has_chance:
                        live_prizes.append(p)
                        total_limit = int(p.get('quantity') or 0)
                        self.log(f"权益超市: 【{name}】监测到放水 (日库存:{daily_limit}, 总库存:{total_limit}, 普通概率:{(norm_prob * 100):.4f}%, VIP概率:{(vip_prob * 100):.4f}%)")
                if live_prizes:
                    return True
            self.log("权益超市: 📢 未监测到高价值权益放水")
            return False
        except Exception as e:
            self.log(f"权益超市: 查询奖品池异常: {e}")
            return False

    def market_get_raffle_count(self, user_token):
        try:
            timestamp = int(time.time() * 1000)
            query_string = f"id=12&channel=unicomTab&timeVerRan={timestamp}"
            json_body = "{}"
            sig_headers = self.generate_market_signature_headers(user_token, query_string, json_body)
            url = f"https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/getUserRaffleCountExt?{query_string}"
            headers = self.get_market_headers(user_token)
            headers.update(sig_headers)
            headers['Referer'] = 'https://contact.bol.wo.cn/market'
            headers['Origin'] = 'https://contact.bol.wo.cn'
            res = self.session.post(url, headers=headers, data=json_body).json()
            count = 0
            if res.get('code') == 200:
                data = res.get('data')
                if isinstance(data, dict):
                    count = int(data.get('raffleCount') or 0)
                else:
                    count = int(data or 0)
            if count > 0:
                self.log(f"权益超市: ✅ 当前抽奖次数: {count}")
                for i in range(count):
                    self.log(f"权益超市: 🎯 第 {i+1} 次抽奖...")
                    if not self.market_user_raffle(user_token):
                        break
                    time.sleep(3 + random.random() * 2)
            else:
                self.log("权益超市: 当前无抽奖次数")
        except Exception as e:
            self.log(f"权益超市: 查询抽奖次数异常: {e}")

    def market_user_raffle(self, user_token):
        try:
            timestamp = int(time.time() * 1000)
            query_string = f"id=12&channel=unicomTab&timeVerRan={timestamp}"
            json_body = "{}"
            sig_headers = self.generate_market_signature_headers(user_token, query_string, json_body)
            url = f"https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/userRaffle?{query_string}"
            headers = self.get_market_headers(user_token)
            headers.update(sig_headers)
            headers['Referer'] = 'https://contact.bol.wo.cn/market'
            res = self.session.post(url, headers=headers, data=json_body).json()
            if res.get('code') == 200:
                data = res.get('data', {})
                prize_name = data.get('prizesName', '')
                message = data.get('message') or res.get('msg') or ""
                if prize_name and "谢谢参与" not in prize_name:
                    self.log(f"权益超市: 🎉 抽奖成功: {prize_name}", notify=True)
                    return True
                self.log(f"权益超市: 💨 未中奖: {message}", notify=True)
                return True
            self.log(f"权益超市: 抽奖失败: {res.get('msg')}")
            return False
        except Exception as e:
            self.log(f"权益超市: 抽奖异常: {e}")
            return False

    def market_get_all_tasks(self, ecs_token, user_token):
        url = "https://backward.bol.wo.cn/prod-api/promotion/activityTask/getAllActivityTasks?activityId=12"
        headers = {
            "Authorization": f"Bearer {user_token}",
            "User-Agent": COMMON_CONSTANTS["MARKET_UA"],
            "Origin": "https://contact.bol.wo.cn",
            "Referer": "https://contact.bol.wo.cn/",
            "Cookie": f"ecs_token={ecs_token}"
        }
        for attempt in range(1, 4):
            try:
                self.log(f"权益超市: 正在获取任务列表...{f' (第{attempt}次重试)' if attempt > 1 else ''}")
                res = self.session.get(url, headers=headers, timeout=15).json()
                if res.get('code') == 200:
                    tasks = res.get('data', {}).get('activityTaskUserDetailVOList', [])
                    self.log(f"权益超市: 成功获取到 {len(tasks)} 个任务")
                    return tasks
                self.log(f"权益超市: 查询任务列表失败: {res.get('msg')}")
            except Exception as e:
                self.log(f"权益超市: 获取任务列表异常: {e}")
            if attempt < 3:
                self.log("权益超市: 等待5秒后重试...")
                time.sleep(5)
        return []

    def market_do_share_list(self, share_list, user_token):
        self.log("权益超市: 开始执行任务...")
        for task in share_list:
            name = task.get('name', '')
            param = task.get('param1', '')
            trigger_time = task.get('triggerTime', 0)
            triggered_time = task.get('triggeredTime', 0)
            if any(k in name for k in ["购买", "秒杀"]):
                 self.log(f"权益超市: 🚫 {name} [跳过]")
                 continue
            if triggered_time >= trigger_time:
                 self.log(f"权益超市: ✅ {name} [已完成]")
                 continue
            url = ""
            if any(k in name for k in ["浏览", "查看"]):
                url = f"https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/checkView?checkKey={param}"
            elif "分享" in name:
                url = f"https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/checkShare?checkKey={param}"
            if url:
                try:
                    headers = {
                        "Authorization": f"Bearer {user_token}",
                        "User-Agent": COMMON_CONSTANTS["MARKET_UA"],
                        "Origin": "https://contact.bol.wo.cn",
                        "Referer": "https://contact.bol.wo.cn/"
                    }
                    res = self.session.post(url, json={}, headers=headers, timeout=15).json()
                    if res.get('code') == 200:
                        self.log(f"权益超市: ✅ {name} [执行成功]")
                    else:
                        self.log(f"权益超市: ❌ {name} [执行失败]: {res.get('msg')}")
                except Exception as e:
                    self.log(f"权益超市: ❌ {name} [执行异常]: {e}")
            time.sleep(2)

    def market_get_points_ticket(self, user_token):
        try:
            res = self.session.get(
                "https://backward.bol.wo.cn/prod-api/auth/getTicket?channel=pointsPlatform",
                headers={
                    "Authorization": f"Bearer {user_token}",
                    "User-Agent": COMMON_CONSTANTS["MARKET_UA"],
                },
                timeout=15,
            ).json()
            if res.get("code") == 200 and res.get("data"):
                return res.get("data")
            self.log(f"权益超市-会员中心: 获取 points ticket 失败: {res.get('msg') or res}")
        except Exception as e:
            self.log(f"权益超市-会员中心: 获取 points ticket 异常: {e}")
        return None

    def market_member_center_base_headers(self, points_ticket):
        referer = (
            f"https://m.jf.10010.com/ts-mobile/well/{MARKET_MEMBER_CENTER_PAGE_ID}"
            f"?distributeId={MARKET_MEMBER_CENTER_DISTRIBUTE_ID}"
            f"&partnersId={MARKET_MEMBER_CENTER_PARTNERS_ID}"
            f"&clientType={MARKET_MEMBER_CENTER_CLIENT_TYPE}"
            f"&ticket={points_ticket}"
        )
        return {
            "origin": "https://m.jf.10010.com",
            "clienttype": MARKET_MEMBER_CENTER_CLIENT_TYPE,
            "ticket": points_ticket,
            "partnersid": MARKET_MEMBER_CENTER_PARTNERS_ID,
            "content-type": "application/json;charset=UTF-8",
            "pageid": MARKET_MEMBER_CENTER_PAGE_ID,
            "Accept": "application/json, text/plain, */*",
            "Referer": referer,
            "User-Agent": COMMON_CONSTANTS["MARKET_H5_UA"],
            "X-Requested-With": "com.sinovatech.unicom.ui",
        }

    def market_get_secret_key_jf(self, points_ticket):
        if (
            getattr(self, "market_jf_secretKey", None)
            and getattr(self, "market_jf_ticket", None) == points_ticket
        ):
            return self.market_jf_secretKey
        try:
            res = self.session.get(
                "https://m.jf.10010.com/jf-external-application/jftask/getSecretKey",
                headers=self.market_member_center_base_headers(points_ticket),
                timeout=10,
            ).json()
            secret = res.get("data", {}).get("secretKey")
            if res.get("code") == "0000" and secret:
                self.market_jf_ticket = points_ticket
                self.market_jf_secretKey = secret.encode("utf-8")
                return self.market_jf_secretKey
            self.log(f"权益超市-会员中心: getSecretKey 失败: {res}")
        except Exception as e:
            self.log(f"权益超市-会员中心: getSecretKey 异常: {e}")
        return None

    def market_build_signature_headers_jf(self, points_ticket):
        secret_key = self.market_get_secret_key_jf(points_ticket)
        if not secret_key:
            return {}
        request_ts = str(round(time.time() * 1000))
        nonce = ''.join(random.choices('0123456789abcdefghijklmnopqrstuvwxyz', k=8))
        signature = hmac.new(
            secret_key,
            f"{nonce}{request_ts}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return {
            "x-request-timestamp": request_ts,
            "x-request-nonce": nonce,
            "x-request-signature": signature,
        }

    def market_member_center_headers(self, points_ticket, with_sign=False):
        headers = self.market_member_center_base_headers(points_ticket)
        if with_sign:
            headers.update(self.market_build_signature_headers_jf(points_ticket))
        return headers

    def market_prepare_member_center_context(self, points_ticket):
        signed_headers = self.market_member_center_headers(points_ticket, with_sign=True)
        try:
            self.session.post(
                "https://m.jf.10010.com/jf-external-application/page/query",
                json={
                    "activityId": MARKET_MEMBER_CENTER_PAGE_ID,
                    "distributeId": MARKET_MEMBER_CENTER_DISTRIBUTE_ID,
                    "partnersId": MARKET_MEMBER_CENTER_PARTNERS_ID,
                },
                headers=signed_headers,
                timeout=10,
            )
        except Exception as e:
            self.log(f"权益超市-会员中心: page/query 预热异常: {e}")
        try:
            self.session.post(
                "https://m.jf.10010.com/jf-external-application/jftask/userInfo",
                json={},
                headers=self.market_member_center_headers(points_ticket, with_sign=True),
                timeout=10,
            )
        except Exception as e:
            self.log(f"权益超市-会员中心: userInfo 预热异常: {e}")

    def market_member_center_finish_code(self, task):
        return safe_int(task.get("finish", task.get("status", 0)), 0)

    def market_member_center_finish_text(self, task):
        finish_text = str(task.get("finishText", "")).strip()
        if finish_text:
            return finish_text
        return {
            0: "未完成",
            99: "待领取",
            100: "已领取",
        }.get(self.market_member_center_finish_code(task), "未知状态")

    def market_query_member_center_task(self, points_ticket):
        try:
            res = self.session.post(
                "https://m.jf.10010.com/jf-external-application/jftask/taskDetail",
                json={},
                headers=self.market_member_center_headers(points_ticket, with_sign=True),
                timeout=10,
            ).json()
            if res.get("code") != "0000":
                self.log(f"权益超市-会员中心: 查询任务失败: {res}")
                return None
            task_list = res.get("data", {}).get("taskDetail", {}).get("taskList", [])
            return next(
                (task for task in task_list if str(task.get("taskCode")) == MARKET_MEMBER_CENTER_TASK_CODE),
                None,
            )
        except Exception as e:
            self.log(f"权益超市-会员中心: 查询任务异常: {e}")
            return None

    def market_wait_member_center_task_state(self, points_ticket, expected_codes, attempts=4, delay=2):
        task = None
        for idx in range(1, attempts + 1):
            task = self.market_query_member_center_task(points_ticket)
            if task:
                finish_code = self.market_member_center_finish_code(task)
                finish_text = self.market_member_center_finish_text(task)
                text_matches = (
                    (finish_text == "待领取" and 99 in expected_codes)
                    or (finish_text == "已领取" and 100 in expected_codes)
                )
                if finish_code in expected_codes or text_matches:
                    return task
                self.log(
                    f"权益超市-会员中心: 第{idx}次回查状态 {finish_text}/{finish_code}，"
                    f"本月进度 {safe_int(task.get('finishCount'), 0)}/{safe_int(task.get('needCount'), 0)}"
                )
            if idx < attempts:
                time.sleep(delay)
                self.market_prepare_member_center_context(points_ticket)
        return task

    def market_mark_member_center_browse_done(self, user_token, task_fix_id):
        try:
            headers = {
                "Authorization": f"Bearer {user_token}",
                "Origin": "https://contact.bol.wo.cn",
                "Referer": "https://contact.bol.wo.cn/",
                "Content-Type": "application/json",
                "Accept": "*/*",
                "User-Agent": COMMON_CONSTANTS["MARKET_H5_UA"],
                "X-Requested-With": "com.sinovatech.unicom.ui",
            }
            detail = self.session.get(
                f"https://backward.bol.wo.cn/prod-api/promotion/activityTask/getActivityTaskDetailByFixId?taskFixId={task_fix_id}",
                headers=headers,
                timeout=10,
            ).json()
            if detail.get("code") != 200:
                self.log(f"权益超市-会员中心: 获取任务详情失败: {detail.get('msg') or detail}")
                return False
            task_data = detail.get("data") or {}
            check_key = task_data.get("param1")
            wait_seconds = max(safe_int(task_data.get("content"), 17), 15)
            if not check_key:
                self.log("权益超市-会员中心: 未拿到 checkKey，跳过浏览任务")
                return False
            self.log(f"权益超市-会员中心: 模拟浏览会员中心 {wait_seconds} 秒")
            time.sleep(wait_seconds)
            check = self.session.post(
                f"https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/checkView?checkKey={check_key}",
                json={},
                headers=headers,
                timeout=10,
            ).json()
            if check.get("code") == 200 and check.get("data") is True:
                self.log("权益超市-会员中心: 浏览完成，任务已进入待领取")
                return True
            self.log(f"权益超市-会员中心: checkView 失败: {check.get('msg') or check}")
        except Exception as e:
            self.log(f"权益超市-会员中心: 浏览任务异常: {e}")
        return False

    def market_receive_member_center_points(self, points_ticket):
        try:
            res = self.session.post(
                "https://m.jf.10010.com/jf-external-application/jfmarkettask/receive",
                json={"taskCode": MARKET_MEMBER_CENTER_TASK_CODE},
                headers=self.market_member_center_headers(points_ticket, with_sign=True),
                timeout=10,
            ).json()
            if res.get("code") == "0000":
                score = res.get("data", {}).get("score", "未知积分")
                title = res.get("data", {}).get("title", "领取成功")
                self.log(f"权益超市-会员中心: ✅ {title}，获得 {score}", notify=True)
                return True
            self.log(f"权益超市-会员中心: 领取失败: {res.get('msg') or res}")
        except Exception as e:
            self.log(f"权益超市-会员中心: 领取异常: {e}")
        return False

    def market_member_center_task(self, user_token):
        self.log("权益超市-会员中心: 开始检查浏览任务")
        points_ticket = self.market_get_points_ticket(user_token)
        if not points_ticket:
            return
        self.market_prepare_member_center_context(points_ticket)
        task = self.market_query_member_center_task(points_ticket)
        if not task:
            self.log("权益超市-会员中心: 未找到目标任务")
            return
        finish_code = self.market_member_center_finish_code(task)
        finish_text = self.market_member_center_finish_text(task)
        finish_count = safe_int(task.get("finishCount"), 0)
        need_count = safe_int(task.get("needCount"), 0)
        self.log(
            f"权益超市-会员中心: 当前状态 {finish_text}/{finish_code}，"
            f"本月进度 {finish_count}/{need_count}"
        )
        if finish_count >= need_count:
            self.log("权益超市-会员中心: 本月次数已达上限")
            return
        if finish_code == 100 or finish_text == "已领取":
            self.log("权益超市-会员中心: 今日已领取，跳过")
            return
        if finish_code == 0 or finish_text == "未完成":
            jump_url = str(task.get("jumpUrl", "")).strip()
            match = re.search(r"taskFixId=(\d+)", jump_url)
            task_fix_id = match.group(1) if match else "90"
            if not self.market_mark_member_center_browse_done(user_token, task_fix_id):
                return
            self.market_prepare_member_center_context(points_ticket)
            task = self.market_wait_member_center_task_state(points_ticket, {99, 100}, attempts=4, delay=2)
            if not task:
                return
            finish_code = self.market_member_center_finish_code(task)
            finish_text = self.market_member_center_finish_text(task)
            self.log(
                f"权益超市-会员中心: 浏览后状态 {finish_text}/{finish_code}，"
                f"本月进度 {safe_int(task.get('finishCount'), 0)}/{safe_int(task.get('needCount'), 0)}"
            )
        if finish_code == 99 or finish_text == "待领取":
            self.market_receive_member_center_points(points_ticket)
        elif finish_code != 100:
            self.log("权益超市-会员中心: 状态未及时刷新，尝试直接领奖兜底")
            if self.market_receive_member_center_points(points_ticket):
                return
            self.log("权益超市-会员中心: 直接领奖兜底失败，跳过")

    def market_task(self, is_query_only=False):
        self.log("==== 权益超市 ====")
        ticket = self.market_get_ticket()
        if not ticket:
            return
        user_token = self.market_get_user_token(ticket)
        if not user_token:
            return
        if is_query_only:
            self.query_market_raffle_records(user_token)
            self.query_phone_recharge_records(user_token)
            return
        mc = globalConfig.get("market_config", {})
        if mc.get("run_task", True):
            if hasattr(self, 'ecs_token'):
                share_list = self.market_get_all_tasks(self.ecs_token, user_token)
                if share_list:
                    self.market_do_share_list(share_list, user_token)
            else:
                 self.log("权益超市: 缺 ecs_token, 跳过通用任务列表")
        else:
            self.log("权益超市-做任务: ⏭️ 已被总开关关闭，跳过")
        if mc.get("run_member_center", True):
            time.sleep(2)
            self.market_member_center_task(user_token)
        else:
            self.log("权益超市-会员中心: ⏭️ 已被子开关关闭，跳过")
        if mc.get("run_draw", True):
            if self.market_get_raffle(user_token):
                self.market_get_raffle_count(user_token)
        else:
            self.log("权益超市-抽奖: ⏭️ 已被总开关关闭，跳过")
        if mc.get("run_claim", False):
            self.log("权益超市-领奖: 自动领奖已开启")
            self.query_phone_recharge_records(user_token)
        else:
            self.log("权益超市-领奖: ⏭️ 未开启自动领奖")
        self.query_market_raffle_records(user_token)
        self.query_phone_recharge_records(user_token)

    def init_cloud_urls(self):
        if not hasattr(self, 'cloudDiskUrls'):
            self.cloudDiskUrls = {
                'getTicketByNative': "https://m.client.10010.com/edop_ng/getTicketByNative",
                'ltypDispatcher': "https://panservice.mail.wo.cn/wohome/dispatcher",
                'wohomeDispatcher': "https://s.pan.wo.cn/wohome/dispatcher",
                'getScanState': "https://s.pan.wo.cn/wohome/intelligentClean/getScanStateAndResult",
                'getCleanData': "https://s.pan.wo.cn/wohome/intelligentClean/getCleanData",
                'batchClean': "https://s.pan.wo.cn/wohome/intelligentClean/batchClean",
            }

    def getTicketByNative_cloud(self):
        for attempt in range(1, 4):
            try:
                url = f"{self.cloudDiskUrls['getTicketByNative']}?appId=edop_unicom_d67b3e30&token={self.ecs_token}"
                headers = {
                    'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301}",
                    'Connection': "Keep-Alive",
                    'Accept-Encoding': "gzip",
                }
                res = self.session.get(url, headers=headers).json()
                if res.get('ticket'):
                    self.cloudDisk.ticket = res['ticket']
                    return res['ticket']
                elif str(res.get('code')) == "9999":
                    self.log(f"getTicketByNative_cloud 票据失效或被拦截: {res}")
            except Exception as e:
                err_msg = str(e)
                if attempt < 3 and os.environ.get("UNICOM_PROXY_API") and ("Max retries exceeded" in err_msg or "timed out" in err_msg.lower() or "connection" in err_msg.lower() or "SOCKS" in err_msg):
                    self.log(f"getTicketByNative_cloud 第{attempt}次异常触发故障转移: {err_msg}")
                    self.failover_proxy()
                    continue
                self.log(f"getTicketByNative_cloud 第{attempt}次重试 - 异常: {e}")
                time.sleep(2)
        return None

    def get_ltypDispatcher_cloud(self, ticket):
        for attempt in range(1, 4):
            try:
                timestamp = str(int(time.time() * 1000))
                result_rnd = str(random.randint(123456, 199999))
                string_to_hash = "HandheldHallAutoLoginV2" + timestamp + result_rnd + "wohome"
                sign = hashlib.md5(string_to_hash.encode()).hexdigest()
                payload = {
                    "header": {
                        "key": "HandheldHallAutoLoginV2",
                        "resTime": timestamp,
                        "reqSeq": result_rnd,
                        "channel": "wohome",
                        "version": "",
                        "sign": sign
                    },
                    "body": {
                        "clientId": "1001000003",
                        "ticket": ticket
                    }
                }
                url = self.cloudDiskUrls['ltypDispatcher']
                headers = {'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}"}
                res = self.session.post(url, json=payload, headers=headers).json()
                token = res.get('RSP', {}).get('DATA', {}).get('token')
                if token:
                    self.cloudDisk.userToken = token
                    return token
            except Exception as e:
                 err_msg = str(e)
                 if attempt < 3 and os.environ.get("UNICOM_PROXY_API") and ("Max retries exceeded" in err_msg or "timed out" in err_msg.lower() or "connection" in err_msg.lower() or "SOCKS" in err_msg):
                     self.log(f"get_ltypDispatcher_cloud 第{attempt}次异常触发故障转移: {err_msg}")
                     self.failover_proxy()
                     continue
                 self.log(f"get_ltypDispatcher_cloud 第{attempt}次重试 - 异常: {e}")
                 time.sleep(2)
        return None

    def get_cloud_upload_name_cloud(self):
        return os.environ.get("UNICOM_CLOUD_UPLOAD_FILENAME", "8648").strip() or "8648"

    def encrypt_data_cloud(self, text, token):
        key_padded = str(token).ljust(16)[:16]
        cipher = AES.new(key_padded.encode(), AES.MODE_CBC, b"wNSOYIB1k1DjY5lA")
        return base64.b64encode(cipher.encrypt(pad(str(text).encode(), AES.block_size, style="pkcs7"))).decode()

    def query_all_files_cloud(self, space_type="0", parent_directory_id="0", page_num=0, page_size=500):
        token = getattr(self.cloudDisk, 'userToken', '')
        if not token:
            return {}
        res = self.request_wohome_dispatcher_cloud("QueryAllFiles", {
            "clientId": "1001000035",
            "spaceType": str(space_type),
            "sortRule": "0",
            "parentDirectoryId": str(parent_directory_id),
            "pageNum": str(page_num),
            "pageSize": int(page_size),
        }, timeout=15)
        rsp = res.get('RSP', {})
        if str(rsp.get('RSP_CODE')) != '0000' or not rsp.get('DATA'):
            return {}
        try:
            key_padded = token.ljust(16)[:16]
            cipher = AES.new(key_padded.encode(), AES.MODE_CBC, b"wNSOYIB1k1DjY5lA")
            plain = unpad(cipher.decrypt(base64.b64decode(rsp['DATA'])), AES.block_size, style="pkcs7").decode('utf-8', errors='ignore')
            return json.loads(plain)
        except Exception as e:
            self.log(f"云盘任务: 查询根目录文件失败: {e}")
            return {}

    def request_wohome_dispatcher_cloud(self, key, param, timeout=15, client_id="1001000035"):
        token = getattr(self.cloudDisk, 'userToken', '')
        if not token:
            return {}
        timestamp = str(int(time.time() * 1000))
        req_seq = str(random.randint(10000, 99999))
        payload = {
            "header": {
                "key": key,
                "resTime": timestamp,
                "reqSeq": req_seq,
                "channel": "wohome",
                "version": "",
                "sign": hashlib.md5(f"{key}{timestamp}{req_seq}wohome".encode()).hexdigest().upper(),
            },
            "body": {
                "param": self.encrypt_data_cloud(json.dumps(param, ensure_ascii=False, separators=(',', ':')), token),
            },
        }
        headers = {
            'X-YP-Device-Id': 'kQ+77Ax9QjhBHAFAAVbCoTTly6IDtegY',
            'accesstoken': token,
            'appversion': '5.5.0',
            'bundleid': 'com.chinaunicom.bol.cloudapp',
            'platfomr': '1',
            'width': '900',
            'height': '1600',
            'appchannel': 'yyb',
            'app-type': 'liantongyunpanapp',
            'User-Agent': 'LianTongYunPan/5.5.0 (Android 9)',
            'network-type': 'mobile',
            'oaid': '00000000',
            'Access-Token': token,
            'App-Version': 'yp-app/5.5.0',
            'platform': '1',
            'sys-version': 'Android/9',
            'Sys-Version': 'Android/9',
            'Client-Id': str(client_id),
            'Content-Type': 'application/json; charset=utf-8',
        }
        try:
            return self.session.post(self.cloudDiskUrls.get('wohomeDispatcher') or self.cloudDiskUrls['ltypDispatcher'], json=payload, headers=headers, timeout=timeout).json()
        except Exception as e:
            self.log(f"云盘任务: [{key}] 请求失败: {e}")
            return {}

    def list_upload_named_files_cloud(self, max_pages=4):
        upload_name = self.get_cloud_upload_name_cloud().strip()
        if not upload_name:
            return []
        pattern = re.compile(rf"^{re.escape(upload_name)}(?:\(\d+\))?(?:\.[^.]+)?$")
        matched = []
        seen = set()
        page_num = 0
        while page_num < max_pages:
            data = self.query_all_files_cloud("0", "0", page_num, 500)
            page_files = data.get('files') or []
            if not page_files:
                break
            for item in page_files:
                file_id = item.get('id')
                file_name = str(item.get('name', '')).strip()
                if file_id and file_id not in seen and pattern.match(file_name):
                    seen.add(file_id)
                    matched.append(item)
            if len(page_files) < 500:
                break
            page_num += 1
        return matched

    def delete_root_files_cloud(self, items, space_type="0"):
        targets = []
        for item in items or []:
            item_id = str(item.get('id', '')).strip()
            if not item_id:
                continue
            targets.append((item_id, str(item.get('type', '1')) == '0'))
        deleted = 0
        for offset in range(0, len(targets), 100):
            batch = targets[offset:offset + 100]
            dir_list = [item_id for item_id, is_dir in batch if is_dir]
            file_list = [item_id for item_id, is_dir in batch if not is_dir]
            if not dir_list and not file_list:
                continue
            res = self.request_wohome_dispatcher_cloud("DeleteFile", {
                "spaceType": str(space_type),
                "vipLevel": "0",
                "dirList": dir_list,
                "fileList": file_list,
                "clientId": "1001000035",
            }, timeout=20)
            rsp = res.get('RSP', {})
            batch_idx = offset // 100 + 1
            if str(rsp.get('RSP_CODE')) == '0000':
                deleted += len(batch)
                self.log(f"云盘任务: 第{batch_idx}批根目录删除成功，共{len(batch)}个文件")
            else:
                self.log(f"云盘任务: 第{batch_idx}批根目录删除失败: {rsp.get('RSP_DESC') or res}")
            time.sleep(1)
        return deleted

    def yphd_headers(self, client_id="1001000165", extra=None):
        token = self.cloudDisk.userToken
        headers = {
            "X-YP-Access-Token": token,
            "User-Agent": "Mozilla/5.0 (Linux; Android 9; 23113RKC6C Build/PQ3A.190605.10201411; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Safari/537.36/woapp LianTongYunPan/5.5.0 (Android 9)",
            "clientId": client_id,
            "X-SH-Access-Token": "",
            "X-YP-GRAY-FLAG": "undefined",
            "Content-Type": "application/json",
            "X-YP-Client-Id": client_id,
            "token": token,
            "Origin": "https://panservice.mail.wo.cn",
            "Referer": f"https://panservice.mail.wo.cn/h5/activitymobile/aiActor?activityId=Mjg%3D&touchpoint=300300010005&token={token}",
        }
        if extra:
            headers.update(extra)
        return headers

    def yphd_post(self, path, payload=None, client_id="1001000165", extra=None):
        res = self.session.post(f"https://panservice.mail.wo.cn{path}", json=payload or {}, headers=self.yphd_headers(client_id, extra), timeout=20)
        try:
            return res.json()
        except Exception:
            return {"text": res.text[:300]}

    def yphd_get(self, path, params=None, client_id="1001000165", extra=None):
        res = self.session.get(f"https://panservice.mail.wo.cn{path}", params=params or {}, headers=self.yphd_headers(client_id, extra), timeout=20)
        try:
            return res.json()
        except Exception:
            return {"text": res.text[:300]}

    def yphd_member_phone_encrypt(self, phone):
        cipher = AES.new(YPHD_MEMBER_PHONE_KEY.encode(), AES.MODE_CBC, YPHD_MEMBER_PHONE_IV.encode())
        return base64.b64encode(cipher.encrypt(pad(str(phone).encode(), AES.block_size))).decode()

    def yphd_member_claim(self):
        phone = getattr(self, "account_mobile", "") or getattr(self, "mobile", "")
        if not phone:
            self.log("云盘会员体验: 未识别手机号，跳过")
            return False
        extra = {"Referer": f"https://panservice.mail.wo.cn/h5/activitymobile/experienceMember?touchpoint={YPHD_MEMBER_TOUCHPOINT}&appName=yunpan&token={self.cloudDisk.userToken}"}
        payload = {"phone": self.yphd_member_phone_encrypt(phone)}
        check = self.yphd_post("/activity/check/yp/members/eligibility", payload, "1001000001", extra)
        meta = check.get("meta") or {}
        if str(meta.get("code")) != "200":
            self.log(f"云盘会员体验: 资格查询失败 {meta.get('message') or response_summary(check)}")
            return False
        state = safe_int((check.get("result") or {}).get("state"), -1)
        if state == 1:
            self.log("云盘会员体验: 已参与")
            return True
        if state != 0:
            self.log(f"云盘会员体验: 暂不可领取 state={state}")
            return False
        payload.update({"skuCode": YPHD_MEMBER_SKU_CODE, "activityCode": YPHD_MEMBER_ACTIVITY_CODE, "channel": "6", "touchpoint": YPHD_MEMBER_TOUCHPOINT})
        data = self.yphd_post("/activity/experience/yp/members", payload, "1001000001", extra)
        meta = data.get("meta") or {}
        order_no = (data.get("result") or {}).get("orderNo")
        self.log(f"云盘会员体验: 领取 {meta.get('message') or response_summary(data)}" + (f" orderNo={order_no}" if order_no else ""))
        return str(meta.get("code")) == "200"

    def yphd_build_sign(self, payload):
        raw = "&".join(f"{k}={payload[k]}" for k in sorted(payload)) + f"&secret={YPHD_SECRET_KEY}"
        return hmac.new(YPHD_SECRET_KEY.encode(), raw.encode(), hashlib.sha256).hexdigest()

    def yphd_signed_post(self, path, key, payload=None, client_id="1001000165", extra=None):
        ts = self.yphd_post("/activity/getTimestamp", {"key": key})
        result = ts.get("result") or {}
        nonce = result.get("nonce")
        timestamp = result.get("timestamp")
        if not nonce or not timestamp:
            self.log(f"云盘乘风活动: getTimestamp失败 {ts}")
            return {}
        body = dict(payload or {})
        body.update({"activityId": YPHD_ACTIVITY_ID, "nonce": nonce, "timestamp": timestamp})
        body["sign"] = self.yphd_build_sign(body)
        return self.yphd_post(path, body, client_id, extra)

    def yphd_task2_query(self):
        extra = {
            "Accept": "application/json, text/plain, */*",
            "source-type": "woapi",
            "requestTime": str(int(time.time() * 1000)),
            "X-Requested-With": "com.chinaunicom.bol.cloudapp",
            "X-YP-Client-Id": "1001000035",
            "Referer": f"https://panservice.mail.wo.cn/h5/activitymobile/aiActor/main1?activityId=Mjg%3D&touchpoint=300300010005&token={self.cloudDisk.userToken}",
        }
        return self.yphd_signed_post("/activity/aiRole/task2/query", "activity:query:task2", {}, "1001000165", extra)

    def yphd_ai_query(self):
        payload = {
            "input": "你好",
            "modelId": 0,
            "platform": 2,
            "tag": 21,
            "conversationId": "",
            "knowledgeId": "",
            "referFileInfo": [],
            "messageId": "",
            "conversationType": 0,
            "recipient": "",
            "async": False,
        }
        headers = self.yphd_headers("1001000035", {
            "accept": "text/event-stream",
            "X-YP-App-Version": "5.4.2",
            "Referer": f"https://panservice.mail.wo.cn/h5/wocloud_ai_1/workFlow?needBackBtn=true&token={self.cloudDisk.userToken}",
        })
        try:
            res = self.session.post("https://panservice.mail.wo.cn/wohome/ai/assistant/query", json=payload, headers=headers, stream=True, timeout=30)
            text = ""
            for line in res.iter_lines(decode_unicode=True):
                if line:
                    text += line
                if len(text) > 500:
                    break
            self.log("云盘乘风活动: AI助手响应完成" if res.status_code == 200 else f"云盘乘风活动: AI助手失败 {res.status_code}")
            return text
        except Exception as e:
            self.log(f"云盘乘风活动: AI助手异常 {e}")
            return ""

    def yphd_move_file(self):
        payload = {
            "activityId": YPHD_ACTIVITY_ID,
            "fids": [YPHD_MOVE_FILE_FID],
            "taskType": 10,
            "fileType": 2,
            "fileName": YPHD_MOVE_FILE_NAME,
            "directoryId": 0,
            "additionalParams": {"aiHeaderSubType": 0},
        }
        headers = {
            "Access-Token": self.cloudDisk.userToken,
            "Client-Id": "1001000165",
            "App-Version": "yp-app/5.5.0",
            "Referer": f"https://panservice.mail.wo.cn/h5/activitymobile/aiActor?activityId=Mjg%3D&touchpoint=300300010065&token={self.cloudDisk.userToken}",
        }
        res = self.yphd_post("/wohome/open/v1/ai/moveFile2Person", payload, "1001000165", headers)
        self.log(f"云盘乘风活动: 视频转存 {res.get('meta', {}).get('message') or response_summary(res)}")
        return res

    def yphd_mgtv_headers(self):
        return {
            "User-Agent": "Mozilla/5.0 (Linux; Android 9; 23113RKC6C Build/PQ3A.190605.10201411; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Safari/537.36/woapp LianTongYunPan/5.5.0 (Android 9)",
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://pop.mgtv.com",
            "Referer": "https://pop.mgtv.com/",
        }

    def yphd_mgtv_login(self):
        data = self.yphd_post("/api-user/api/user/ticket", {}, "1001000035")
        ticket = (data.get("result") or {}).get("ticket")
        if not ticket:
            self.log(f"云盘乘风活动: 芒果ticket失败 {response_summary(data)}")
            return "", ""
        res = self.session.get(f"{YPHD_MGTV_BASE}/api/cu/login", params={"ticket": ticket, "t": int(time.time() * 1000)}, headers=self.yphd_mgtv_headers(), timeout=20)
        self.log("云盘乘风活动: 芒果登录成功" if res.status_code == 200 else f"云盘乘风活动: 芒果登录失败 {res.status_code}")
        try:
            info = res.json().get("data") or {}
        except Exception:
            info = {}
        mgtv_ticket = info.get("ticket") or ticket
        access_token = info.get("accessToken", "")
        self.session.get(f"{YPHD_MGTV_BASE}/api/cu/popup/check", params={"ticket": mgtv_ticket}, headers=self.yphd_mgtv_headers(), timeout=20)
        return mgtv_ticket, access_token

    def yphd_mgtv_image_candidates(self):
        candidates = []
        seen = set()
        def add_candidate(value, name):
            value = str(value or "").strip()
            if value and value not in seen:
                seen.add(value)
                candidates.append((value, name))
                return True
            return False
        if YPHD_MGTV_IMG_FID:
            add_candidate(YPHD_MGTV_IMG_FID, "环境图片")
        works_payload = {"pageSize": 20, "pageNo": 1, "type": 0}
        works_extra = {"Referer": f"https://panservice.mail.wo.cn/h5/mobile/aiProduct?token={self.cloudDisk.userToken}"}
        works = self.yphd_post("/wohome/open/v1/ai/getNewYearWorksList", works_payload, "1001000003", works_extra)
        for item in ((works.get("result") or {}).get("result") or []):
            if safe_int(item.get("status")) == 1 and safe_int(item.get("type")) == 5:
                fid = parse_qs(urlparse(str(item.get("uploadPictureUrl") or "")).query).get("fid", [""])[0]
                add_candidate(fid, f"历史作品{item.get('id') or ''}人脸图")
        payload = {"pageSize": 20, "pageNo": 1, "suffixList": ["jpg", "jpeg", "png"], "fileType": "1", "spaceType": 0, "sortRule": "0"}
        extra = {"Referer": f"https://panservice.mail.wo.cn/h5/mobile/mgtv?type=1&token={self.cloudDisk.userToken}"}
        for client_id in ("1001000003", "1001000172"):
            data = self.yphd_post("/wohome/knowledge/queryTypeFileList", payload, client_id, extra)
            for item in ((data.get("result") or {}).get("details") or []):
                fid = str(item.get("fid") or "").strip()
                if fid and fid not in seen and safe_int(item.get("fileSize"), 0) <= 10 * 1024 * 1024:
                    seen.add(fid)
                    candidates.append((fid, item.get("fileName") or fid[:12]))
        if not candidates:
            self.log("云盘乘风活动: 未找到可用图片，请上传一张清晰单人正脸图片到联通云盘后重试", notify=True)
        return candidates

    def yphd_task2_acquire(self):
        return self.yphd_signed_post("/activity/aiRole/task2", "activity:acquire:task2", {}, "1001000165", {
            "X-YP-Open-Version": "v1.0",
            "X-CM-SERVICE": getattr(self, "account_mobile", "") or getattr(self, "mobile", ""),
            "X-PATH": "/h5/wocloud_ai_1/workFlow",
            "accesstoken": self.cloudDisk.userToken,
            "Access-Token": self.cloudDisk.userToken,
            "App-Version": "yp-app/5.5.0",
            "Client-Id": "1001000165",
        })

    def yphd_lottery_headers(self):
        return {
            "Accept": "application/json, text/plain, */*",
            "source-type": "woapi",
            "requestTime": str(int(time.time() * 1000)),
            "X-Requested-With": "com.chinaunicom.bol.cloudapp",
            "X-YP-Client-Id": "1001000035",
            "Referer": f"https://panservice.mail.wo.cn/h5/activitymobile/aiActor/main1?activityId=Mjg%3D&touchpoint=300300010005&token={self.cloudDisk.userToken}",
        }

    def yphd_mgtv_task(self, ticket, access_token):
        image_candidates = self.yphd_mgtv_image_candidates()
        if not image_candidates:
            return False
        for image_fid, image_name in image_candidates:
            self.log(f"云盘乘风活动: 选用图片 {image_name}")
            payload = {"ticket": ticket, "templateId": YPHD_MGTV_TEMPLATE_ID, "index": 0, "imgUrl": image_fid}
            data = self.yphd_mgtv_template_submit(payload)
            for retry in range(3):
                if data.get("msg") != "权益扣减失败":
                    break
                off = self.session.get(f"{YPHD_MGTV_BASE}/api/cu/offlineSubscribe", params={"ticket": ticket}, headers=self.yphd_mgtv_headers(), timeout=20)
                try:
                    off_data = off.json()
                    off_msg = off_data.get("msg") or off_data.get("message") or response_summary(off_data)
                    success = (off_data.get("data") or {}).get("success")
                    if success is not None:
                        off_msg = f"{off_msg} success={success}"
                except Exception:
                    off_msg = off.text[:80] or f"HTTP {off.status_code}"
                self.log(f"云盘乘风活动: 订阅权益 {off_msg}")
                time.sleep(8 + retry * 6)
                data = self.yphd_mgtv_template_submit(payload)
            result = data.get("data") or {}
            task_id = result.get("taskId") or data.get("taskId")
            if not task_id:
                msg = data.get("msg") or response_summary(data)
                self.log(f"云盘乘风活动: 模板提交失败 {msg}")
                if "照片" in msg or "人脸" in msg:
                    continue
                return False
            for _ in range(20):
                result_res = self.session.get(f"{YPHD_MGTV_BASE}/api/cu/video/template/result", params={"taskId": task_id, "ticket": ticket}, headers=self.yphd_mgtv_headers(), timeout=20)
                try:
                    result_data = result_res.json()
                except Exception:
                    self.log(f"云盘乘风活动: 模板结果 {result_res.text[:120]}")
                    return False
                info = result_data.get("data") or {}
                audit_state = safe_int(info.get("auditState"))
                algorithm_state = safe_int(info.get("algorithmState"))
                if result_data.get("errno") == "0" and (audit_state == 2 or audit_state > 1 and algorithm_state > 1):
                    self.log(f"云盘乘风活动: 模板生成成功 taskId={task_id}")
                    return True
                time.sleep(3)
            self.log(f"云盘乘风活动: 模板仍在生成 taskId={task_id}")
            return False
        self.log("云盘乘风活动: 没有可通过识别的图片")
        return False

    def yphd_mgtv_template_submit(self, payload):
        res = self.session.post(f"{YPHD_MGTV_BASE}/api/cu/video/template/submit", json=payload, headers=self.yphd_mgtv_headers(), timeout=20)
        try:
            return res.json()
        except Exception:
            return {"msg": res.text[:120] or f"HTTP {res.status_code}"}

    def yphd_activity_task(self):
        if not getattr(self.cloudDisk, "userToken", ""):
            return
        try:
            self.yphd_member_claim()
            self.log("==== 云盘乘风活动 ====")
            status = self.yphd_signed_post("/activity/fragment/status", "activity:fragment:status", {}, "1001000035")
            result = status.get("result") or {}
            self.log(f"云盘乘风活动: 碎片阶段 {result.get('fragmentStep')}")
            task_info = self.yphd_get("/activity/activity/task/info", {"activityId": YPHD_ACTIVITY_ID}, "1001000035")
            logs = (task_info.get("result") or {}).get("logs") or []
            if logs:
                self.log("云盘乘风活动: 已完成 " + "、".join(x.get("taskName", "") for x in logs if x.get("taskName")))
            self.yphd_signed_post("/activity/fragment/task/activate", "activity:fragment:activate")
            self.yphd_move_file()
            self.yphd_ai_query()
            task1 = self.yphd_signed_post("/activity/aiRole/task1/acquire", "activity:acquire:task1", {}, "1001000035")
            self.log(f"云盘乘风活动: task1 {task1.get('meta', {}).get('message') or response_summary(task1)}")
            status_after = self.yphd_signed_post("/activity/fragment/status", "activity:fragment:status", {}, "1001000035")
            step_after = safe_int((status_after.get("result") or {}).get("fragmentStep"))
            self.log(f"云盘乘风活动: task1后碎片阶段 {step_after}")
            if step_after >= 3:
                self.log("云盘乘风活动: 已有作品仅作素材，继续今日制作")
            else:
                self.log("云盘乘风活动: task2等待作品制作")
            ticket, access_token = self.yphd_mgtv_login()
            mgtv_ok = False
            if ticket:
                mgtv_ok = self.yphd_mgtv_task(ticket, access_token)
            if mgtv_ok:
                status_after = self.yphd_signed_post("/activity/fragment/status", "activity:fragment:status", {}, "1001000035")
                step_after = safe_int((status_after.get("result") or {}).get("fragmentStep"))
                self.log(f"云盘乘风活动: 作品后碎片阶段 {step_after}")
                query = self.yphd_task2_query()
                self.log(f"云盘乘风活动: 模板后task2确认 {query.get('meta', {}).get('message') or response_summary(query)}")
                if safe_int(query.get("result")) != 1:
                    task2 = self.yphd_task2_acquire()
                    self.log(f"云盘乘风活动: 模板后task2 {task2.get('meta', {}).get('message') or response_summary(task2)}")
            records = self.yphd_post("/activity/aiRole/userDrawRecords", {"activityId": YPHD_ACTIVITY_ID}, "1001000035")
            draw_records = records.get("result") or []
            if draw_records:
                display_records = draw_records[:5]
                self.log(f"云盘乘风活动: 抽奖记录(前{len(display_records)}条/共{len(draw_records)}条):")
                for item in display_records:
                    self.log(f"    - {item.get('prizeName') or item.get('awardName') or item.get('name') or '未知奖品'}")
            times = self.yphd_get("/activity/lottery/lottery-times", {"activityId": YPHD_ACTIVITY_ID}, "1001000035", self.yphd_lottery_headers())
            if str((times.get("meta") or {}).get("code")) != "200":
                self.log(f"云盘乘风活动: 抽奖次数查询失败 {response_summary(times)}")
            times_result = times.get("result") if isinstance(times, dict) else 0
            if isinstance(times_result, dict):
                times_result = times_result.get("lotteryTimes") or times_result.get("times") or times_result.get("count") or 0
            count = int(times_result or 0)
            self.log(f"云盘乘风活动: 抽奖次数 {count}")
            for index in range(count):
                prize = self.yphd_signed_post("/activity/lottery", "activity:lottery", {}, "1001000035", self.yphd_lottery_headers())
                info = prize.get("result") or {}
                self.log(f"云盘乘风活动: 第{index + 1}次抽奖 {info.get('prizeName') or response_summary(prize)}", notify=bool(info.get("prizeName")))
                time.sleep(2)
            if count:
                self.yphd_signed_post("/activity/fragment/updateFrontendStatus", "activity:fragment:frontendStatus", {"frontendStatus": 1}, "1001000035")
        except Exception as e:
            self.log(f"云盘乘风活动异常: {e}")

    def clean_duplicate_files_cloud(self):
        token = getattr(self.cloudDisk, 'userToken', '')
        if not token:
            return
        self.log("云盘任务: 开始清理云盘重复文件")
        cloud_headers = {
            'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) LianTongYunPan/5.1.0 (iPhone; iOS 16.6)",
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Accept-Encoding': 'br;q=1.0, gzip;q=0.9, deflate;q=0.8',
            'Access-Token': token, 'X-YP-Access-Token': token,
            'Client-Id': '1001000035', 'X-YP-Client-Id': '1001000035',
            'App-Version': 'yp-app/5.1.0', 'app-type': 'liantongyunpanapp',
            'Sys-Version': 'iOS/16.6',
        }
        uploaded_count = int(getattr(self.cloudDisk, 'uploadedFileCount', 0) or 0)
        retry_count = 6 if uploaded_count > 0 else 1
        task_id = ""
        file_ids = []
        for attempt in range(1, retry_count + 1):
            try:
                res = self.session.post(
                    self.cloudDiskUrls['getScanState'], json={
                        "pathLevelList": [{"levelType": "space", "levelName": "个人云", "busId": "0"}]
                    }, headers=cloud_headers, timeout=10,
                ).json()
            except Exception as e:
                self.log(f"云盘任务: 获取扫描状态失败: {e}")
                return
            if res.get('meta', {}).get('code') != '200':
                self.log("云盘任务: 获取扫描状态失败")
                return
            task_id = ""
            for item in res.get('result', {}).get('subTaskList', []):
                if item.get('taskId'):
                    task_id = item['taskId']
                    break
            if task_id:
                file_ids = []
                page = max_page = 1
                while page <= max_page:
                    try:
                        page_res = self.session.post(
                            self.cloudDiskUrls['getCleanData'], json={
                                "pageNum": page, "taskId": task_id, "type": 3, "pageSize": 50,
                            }, headers=cloud_headers, timeout=10,
                        ).json()
                    except Exception as e:
                        self.log(f"云盘任务: 获取第{page}页清理数据失败: {e}")
                        return
                    if page_res.get('meta', {}).get('code') != '200':
                        break
                    max_page = page_res.get('result', {}).get('maxPageNum', 1)
                    for group in page_res.get('result', {}).get('fileGroupList', []):
                        for fi, file_item in enumerate(group.get('fileList', [])):
                            if fi <= 0 or not file_item.get('fileId'):
                                continue
                            file_ids.append({"fileId": file_item['fileId'], "spaceType": file_item.get('spaceType', '0')})
                    page += 1
            if file_ids:
                self.log(f"云盘任务: 第{attempt}次重复扫描完成，共{len(file_ids)}个重复文件")
                break
            if attempt < retry_count:
                wait_seconds = min(5 + (attempt - 1) * 2, 12)
                self.log(f"云盘任务: 第{attempt}次重复扫描未发现可清理文件，{wait_seconds}秒后重试")
                time.sleep(wait_seconds)
        if not file_ids:
            named_files = self.list_upload_named_files_cloud() if uploaded_count > 0 else []
            if named_files:
                preview = "、".join(item.get('name', '') for item in named_files[:6]).strip("、")
                more = "..." if len(named_files) > 6 else ""
                self.log(f"云盘任务: 智能清理未识别到重复项，但根目录检测到{len(named_files)}个[{self.get_cloud_upload_name_cloud()}]系列文件: {preview}{more}")
                deleted = self.delete_root_files_cloud(named_files)
                self.cloudDisk.uploadedFileCount = 0
                if deleted:
                    self.log(f"云盘任务: 已通过官方删除接口清理{deleted}个[{self.get_cloud_upload_name_cloud()}]系列文件")
                else:
                    self.log(f"云盘任务: [{self.get_cloud_upload_name_cloud()}]系列文件删除失败")
            else:
                self.cloudDisk.uploadedFileCount = 0
                self.log("云盘任务: 无重复文件")
            return
        for offset in range(0, len(file_ids), 100):
            batch = file_ids[offset:offset + 100]
            batch_idx = offset // 100 + 1
            try:
                batch_res = self.session.post(
                    self.cloudDiskUrls['batchClean'], json={
                        "fileList": batch, "taskType": 3, "taskId": task_id,
                    }, headers=cloud_headers, timeout=30,
                ).json()
                code = batch_res.get('meta', {}).get('code')
                self.log(f"云盘任务: 第{batch_idx}批清理: {'成功' if code == '200' else '失败'}")
            except Exception as e:
                self.log(f"云盘任务: 第{batch_idx}批清理失败: {e}")
            time.sleep(2)
        named_files = self.list_upload_named_files_cloud() if uploaded_count > 0 else []
        if named_files:
            preview = "、".join(item.get('name', '') for item in named_files[:6]).strip("、")
            more = "..." if len(named_files) > 6 else ""
            self.log(f"云盘任务: 智能清理后根目录仍检测到{len(named_files)}个[{self.get_cloud_upload_name_cloud()}]系列文件: {preview}{more}")
            deleted = self.delete_root_files_cloud(named_files)
            if deleted:
                self.log(f"云盘任务: 已通过官方删除接口补充清理{deleted}个[{self.get_cloud_upload_name_cloud()}]系列文件")
        self.cloudDisk.uploadedFileCount = 0
        self.log("云盘任务: 云盘重复文件清理完成")

    def ltyp_task(self, is_query_only=False):
        self.log("==== 联通云盘任务 ====")
        self.init_cloud_urls()
        class CloudDiskState: pass
        self.cloudDisk = CloudDiskState()
        if not self.ecs_token:
            self.log("云盘任务: 缺少 ecs_token，跳过。")
            return
        ticket = self.getTicketByNative_cloud()
        if not ticket:
            return
        token = self.get_ltypDispatcher_cloud(ticket)
        if not token:
            return
        self.yphd_activity_task()
        if HOMETOWN_ENABLE:
            self.hometown_task(token)
        self.clean_duplicate_files_cloud()

    # ============ 云盘家乡打卡活动 ============
    def hometown_aes_encrypt(self, plaintext, key, iv=HOMETOWN_AES_IV):
        cipher = AES.new(key.encode(), AES.MODE_CBC, iv.encode())
        return base64.b64encode(cipher.encrypt(pad(plaintext.encode(), AES.block_size, style="pkcs7"))).decode()

    def hometown_headers(self, token, extra=None):
        headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) LianTongYunPan/5.1.0 (iPhone; iOS 16.6)",
            "source-type": "woapi",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "cors",
            "sec-fetch-dest": "empty",
            "clientId": "1001000165",
            "X-YP-Client-Id": "1001000165",
            "X-YP-Access-Token": token,
            "token": token,
            "X-SH-Access-Token": "",
            "X-YP-GRAY-FLAG": "undefined",
            "requestTime": str(int(time.time() * 1000)),
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        }
        if extra:
            headers.update(extra)
        return headers

    def hometown_sign_payload(self, payload, secret=HOMETOWN_LOTTERY_SECRET):
        parts = []
        for k in sorted(payload.keys()):
            if k == "sign":
                continue
            v = payload[k]
            if v is None:
                continue
            trimmed = str(v).strip()
            if trimmed == "":
                continue
            parts.append(f"{k}={trimmed}")
        raw = "&".join(parts) + f"&secret={secret}"
        return hmac.new(secret.encode(), raw.encode(), hashlib.sha256).hexdigest()

    def hometown_get_activity_timestamp(self, token, key="activity:lottery"):
        try:
            res = self.session.post(
                "https://panservice.mail.wo.cn/activity/getTimestamp",
                headers=self.hometown_headers(token),
                json={"key": key},
                timeout=15,
            ).json()
            if (res.get("meta") or {}).get("code") == "200":
                return res.get("result") or {}
            self.log(f"家乡打卡: 获取时间戳失败 {(res.get('meta') or {}).get('message', '未知')}")
        except Exception as e:
            self.log(f"家乡打卡: 获取时间戳异常 {e}")
        return None

    def hometown_query_location(self, token):
        mobile = self.account_mobile
        if not token or not mobile:
            self.log("家乡打卡: 查询归属地失败，Token或手机号为空")
            return None, None
        try:
            encrypted_mobile = self.hometown_aes_encrypt(str(mobile), HOMETOWN_MOBILE_KEY)
            res = self.session.post(
                "https://panservice.mail.wo.cn/api-user/user/info/query",
                headers=self.hometown_headers(token, {"X-SH-Access-Token": ""}),
                json={"mobile": encrypted_mobile},
                timeout=15,
            ).json()
            if (res.get("meta") or {}).get("code") == "200":
                result = res.get("result") or {}
                province_code = result.get("provinceCode", "")
                province_name = result.get("provinceName", "")
                if province_code:
                    self.log(f"家乡打卡: 归属地 {province_name}({province_code})")
                    return province_code, province_name
                self.log("家乡打卡: 归属地查询失败，无省份信息")
            else:
                self.log(f"家乡打卡: 归属地查询失败 {(res.get('meta') or {}).get('message', '未知')}")
        except Exception as e:
            self.log(f"家乡打卡: 查询归属地出错 {e}")
        return None, None

    def hometown_get_base_ticket(self, token):
        try:
            res = self.session.post(
                "https://panservice.mail.wo.cn/api-user/api/user/ticket",
                headers=self.hometown_headers(token, {
                    "accesstoken": token, "access-token": token,
                    "app-type": "unicom", "X-CM-SERVICE": "PHONE",
                    "X-YP-Open-Version": "v1.0", "Accept": "*",
                }),
                json={},
                timeout=15,
            ).json()
            ticket = (res.get("result") or {}).get("ticket")
            if not ticket:
                self.log(f"家乡打卡: 获取云盘基础Ticket失败 {response_summary(res)}")
            return ticket or ""
        except Exception as e:
            self.log(f"家乡打卡: 获取Ticket异常 {e}")
            return ""

    def hometown_open_activity(self, token, ticket, province_code, province_name):
        if not token or not province_code or not province_name:
            self.log("家乡打卡: 开启活动失败，Token或归属地信息不完整")
            return False
        mobile = self.account_mobile
        referer = (
            f"https://panservice.mail.wo.cn/h5/activitymobile/fileUploadActive?touchpoint=300200030001&type=06"
            f"&ticket={ticket}&version=iphone_c%4012.0801&timestamp={int(time.time() * 1000)}"
            f"&desmobile={mobile}&num=0&postage=01addda9786dc7eb5ca0eacd9acd664a"
            f"&activityId={HOMETOWN_OPEN_ACTIVITY_ID}&clientid=1001000003&userNumber={mobile}"
        )
        try:
            res = self.session.post(
                "https://panservice.mail.wo.cn/activity/openActivity",
                headers=self.hometown_headers(token, {"Referer": referer}),
                json={"activityId": HOMETOWN_LOTTERY_ACTIVITY_ID, "provinceCode": province_code, "provinceName": province_name},
                timeout=15,
            ).json()
            msg = res.get("msg") or (res.get("meta") or {}).get("message") or "开启成功"
            self.log(f"家乡打卡: 开启结果 {msg}")
            return True
        except Exception as e:
            self.log(f"家乡打卡: 开启活动出错 {e}")
            return False

    def hometown_ensure_material(self):
        # 服务端不校验图片内容/大小 (实测 8 字节伪JPEG即返回上传成功),
        # 故内置一个最小合法 JPEG 字节, 无需任何外部下载或素材文件。
        if os.path.exists(HOMETOWN_MATERIAL_PATH) and os.path.getsize(HOMETOWN_MATERIAL_PATH) > 8:
            return True
        try:
            with open(HOMETOWN_MATERIAL_PATH, "wb") as f:
                f.write(HOMETOWN_MATERIAL_BYTES)
            return True
        except Exception as e:
            self.log(f"家乡打卡: 素材写入失败 {e}")
            return False

    def hometown_upload(self, token):
        if not self.hometown_ensure_material():
            self.log("家乡打卡: 上传失败，素材文件不存在且下载失败")
            return False
        if not token:
            self.log("家乡打卡: 上传失败，Token为空")
            return False
        try:
            t_ = str(int(time.time() * 1000))
            fsize = os.path.getsize(HOMETOWN_MATERIAL_PATH)
            batch_no = datetime.now().strftime("%Y%m%d%H%M%S")
            file_info_plain = (
                '{"spaceType":"0","directoryId":"0","batchNo":"' + batch_no +
                '","fileName":"8648","fileSize":6376590,"fileType":"1"}'
            )
            file_info = self.hometown_aes_encrypt(file_info_plain, token[:16].ljust(16)[:16])
            rs = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=6))
            unique_id = f"{t_}_{rs}"
            with open(HOMETOWN_MATERIAL_PATH, "rb") as fh:
                files = {
                    "uniqueId": (None, unique_id),
                    "accessToken": (None, token),
                    "fileName": (None, "8648"),
                    "psToken": (None, "undefined"),
                    "fileSize": (None, str(fsize)),
                    "totalPart": (None, "1"),
                    "partSize": (None, str(fsize)),
                    "partIndex": (None, "1"),
                    "channel": (None, "wocloud"),
                    "directoryId": (None, "0"),
                    "fileInfo": (None, file_info),
                    "file": ("8648", fh, "image/jpeg"),
                }
                r = self.session.post(
                    "https://du.smartont.net:8443/openapi/client/upload2C",
                    files=files,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0",
                        "Accept-Encoding": "gzip, deflate, br, zstd",
                        "origin": "https://pan.wo.cn",
                        "referer": "https://pan.wo.cn/",
                        "accept-language": "zh-CN,zh;q=0.9",
                        "sec-fetch-site": "same-site",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-dest": "empty",
                    },
                    timeout=60,
                    verify=False,
                )
            self.log(f"家乡打卡: 文件上传 {r.status_code}")
            return r.status_code == 200
        except Exception as e:
            self.log(f"家乡打卡: 文件上传失败 {e}")
            return False

    def hometown_lottery(self, token):
        if not token:
            return
        ts_info = self.hometown_get_activity_timestamp(token)
        if not ts_info:
            self.log("家乡打卡: 抽奖失败，无法获取时间戳")
            return
        payload = {
            "activityId": HOMETOWN_LOTTERY_ACTIVITY_ID,
            "nonce": ts_info.get("nonce", ""),
            "timestamp": ts_info.get("timestamp", 0),
        }
        payload["sign"] = self.hometown_sign_payload(payload)
        try:
            res = self.session.post(
                "https://panservice.mail.wo.cn/activity/lottery",
                headers=self.hometown_headers(token),
                json=payload,
                timeout=15,
            ).json()
            if (res.get("meta") or {}).get("code") == "200":
                result = res.get("result") or {}
                prize = result.get("prizeName", "未获取到奖品信息")
                self.log(f"家乡打卡: 抽奖结果 {prize}", notify=True)
                times = result.get("lotteryTimes", 0)
                if times and int(times) > 0:
                    self.log(f"家乡打卡: 剩余抽奖次数 {times}")
            else:
                self.log(f"家乡打卡: 抽奖失败 {(res.get('meta') or {}).get('message', '未知错误')}")
        except Exception as e:
            self.log(f"家乡打卡: 抽奖出错 {e}")

    def hometown_cleanup_uploaded(self):
        # 清除上传到云盘根目录的 8648 垃圾文件, 避免堆积
        try:
            matched = []
            seen = set()
            for page_num in range(4):
                data = self.query_all_files_cloud("0", "0", page_num, 500)
                page_files = data.get("files") or []
                if not page_files:
                    break
                for item in page_files:
                    fid = item.get("id")
                    fname = str(item.get("name", "")).strip()
                    if fid and fid not in seen and fname in ("8648", "kele.jpg"):
                        seen.add(fid)
                        matched.append(item)
                if len(page_files) < 500:
                    break
            if matched:
                self.delete_root_files_cloud(matched, "0")
                self.log(f"家乡打卡: 已清理上传的垃圾文件 {len(matched)} 个")
        except Exception as e:
            self.log(f"家乡打卡: 清理上传文件异常 {e}")

    def hometown_task(self, token):
        self.log("==== 云盘家乡打卡 ====")
        province_code, province_name = self.hometown_query_location(token)
        if not province_code:
            return
        ticket = self.hometown_get_base_ticket(token)
        if not self.hometown_open_activity(token, ticket, province_code, province_name):
            return
        self.log("家乡打卡: 开始文件上传...")
        uploaded = self.hometown_upload(token)
        time.sleep(5)
        self.hometown_lottery(token)
        if uploaded:
            self.hometown_cleanup_uploaded()

    def getTicketByNative_sec(self):
        for attempt in range(1, 4):
            try:
                url = f"https://m.client.10010.com/edop_ng/getTicketByNative?token={self.ecs_token}&appId=edop_unicom_3a6cc75a"
                city_code = ""
                cookie_str = f"PvSessionId={datetime.now().strftime('%Y%m%d%H%M%S')}{self.unicomTokenId};c_mobile={self.account_mobile}; c_version=iphone_c@11.0800; city=036|{city_code}|90063345|-99;devicedId={self.unicomTokenId}; ecs_token={self.ecs_token};t3_token="
                headers = {
                    "Cookie": cookie_str,
                    "Accept": "*/*",
                    "Connection": "keep-alive",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
                    "Accept-Language": "zh-Hans-CN;q=1.0"
                }
                res = self.session.get(url, headers=headers, timeout=10)
                if res.status_code != 200:
                    self.log(f"安全管家: getTicketByNative_sec http请求失败 {res.status_code}")
                    return
                try:
                    result = res.json()
                except:
                    self.log(f"安全管家: getTicketByNative_sec json解析失败: {res.text[:100]}")
                    return
                self.sec_ticket1 = result.get('ticket')
                if self.sec_ticket1:
                    return
                else:
                    self.log(f"安全管家: getTicketByNative_sec 失败 - {result}")
            except Exception as e:
                err_msg = str(e)
                if attempt < 3 and os.environ.get("UNICOM_PROXY_API") and ("Max retries exceeded" in err_msg or "timed out" in err_msg.lower() or "connection" in err_msg.lower() or "SOCKS" in err_msg):
                    self.log(f"安全管家: getTicketByNative_sec 第{attempt}次异常触发故障转移: {err_msg}")
                    self.failover_proxy()
                    continue
                self.log(f"安全管家: getTicketByNative_sec 第{attempt}次重试 - 异常: {e}")
                time.sleep(2)

    def getAuthToken_sec(self):
        if not getattr(self, 'sec_ticket1', None):
            self.log("安全管家 getAuthToken_sec 缺少 ticket1，跳过")
            return
        try:
            url = "https://uca.wo116114.com/api/v1/auth/ticket?product_line=uasp&entry_point=h5&entry_point_id=edop_unicom_3a6cc75a"
            headers = {
                "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
                "Content-Type": "application/json",
                "clientType": "uasp_unicom_applet"
            }
            data = { "productId": "", "type": 1, "ticket": self.sec_ticket1 }
            res = self.session.post(url, json=data, headers=headers).json()
            if res.get('data'):
                self.sec_token = res['data'].get('access_token')
            else:
                self.log(f"安全管家: getAuthToken_sec 失败 - {res}")
        except Exception as e:
            self.log(f"安全管家: getAuthToken_sec 异常: {e}")

    def getTicketForJF_sec(self):
        if not getattr(self, 'sec_token', None):
            self.log("安全管家 getTicketForJF_sec 缺少 token，跳过")
            return
        try:
            url1 = "https://uca.wo116114.com/api/v1/auth/getTicket?product_line=uasp&entry_point=h5&entry_point_id=edop_unicom_3a6cc75a"
            headers1 = {
                "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
                "Content-Type": "application/json",
                "auth-sa-token": self.sec_token,
                "clientType": "uasp_unicom_applet"
            }
            data1 = { "productId": "91311616", "phone": self.account_mobile }
            res1 = self.session.post(url1, json=data1, headers=headers1).json()
            if res1.get('data'):
                self.sec_ticket = res1['data'].get('ticket')
            else:
                self.log("安全管家获取积分票据失败")
                return
            url2 = "https://m.jf.10010.com/jf-external-application/page/query"
            headers2 = {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301};ltst;OSVersion/16.6",
                "partnersid": "1702",
                "ticket": unquote(self.sec_ticket),
                "clienttype": "uasp_unicom_applet",
            }
            if hasattr(self, 'sec_jeaId'):
                headers2["Cookie"] = f"_jea_id={self.sec_jeaId}"
            res2 = self.session.post(url2, json={"activityId": "s747395186896173056", "partnersId": "1702"}, headers=headers2)
            res2 = self.session.post(url2, json={"activityId": "s747395186896173056", "partnersId": "1702"}, headers=headers2)
            for cookie in self.session.cookies:
                if cookie.name == '_jea_id':
                    self.sec_jeaId = cookie.value
            if 'Set-Cookie' in res2.headers:
                match = re.search(r'_jea_id=([^;]+)', res2.headers['Set-Cookie'])
                if match:
                    self.sec_jeaId = match.group(1)
        except Exception as e:
            self.log(f"安全管家: getTicketForJF_sec 异常: {e}")

    def get_secret_key_sec(self, silent=False):
        if getattr(self, 'sec_secretKey', None):
            return self.sec_secretKey
        if not getattr(self, 'sec_ticket', None):
            return None
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301};ltst;OSVersion/16.6",
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Origin': 'https://m.jf.10010.com',
            'Host': 'm.jf.10010.com',
            'clienttype': 'uasp_unicom_applet',
            'partnersid': '1702',
            'ticket': unquote(self.sec_ticket),
        }
        if hasattr(self, 'sec_jeaId') and self.sec_jeaId:
            headers['Cookie'] = f"_jea_id={self.sec_jeaId};"
        try:
            res = self.session.get("https://m.jf.10010.com/jf-external-application/jftask/getSecretKey", headers=headers, timeout=10).json()
            secret = res.get('data', {}).get('secretKey')
            if res.get('code') == '0000' and secret:
                self.sec_secretKey = secret.encode('utf-8')
                if not silent:
                    self.log("secretKey 获取成功")
                return self.sec_secretKey
            self.log(f"安全管家: getSecretKey 失败: {res}")
        except Exception as e:
            self.log(f"安全管家: getSecretKey 异常: {e}")
        return None

    def build_signature_headers_sec(self):
        secret_key = self.get_secret_key_sec()
        if not secret_key:
            return {}
        request_ts = str(round(time.time() * 1000))
        nonce = ''.join(random.choices('0123456789abcdefghijklmnopqrstuvwxyz', k=8))
        signature = hmac.new(
            secret_key, f"{nonce}{request_ts}".encode('utf-8'), hashlib.sha256,
        ).hexdigest()
        return {
            'x-request-timestamp': request_ts,
            'x-request-nonce': nonce,
            'x-request-signature': signature,
        }

    def sec_uca_post(self, url_path, body):
        try:
            headers = {
                "clientType": "uasp_unicom_applet",
                "auth-sa-token": self.sec_token,
                "Content-Type": "application/json",
                "Accept": "*",
                "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}"
            }
            return self.session.post(url_path, json=body, headers=headers, timeout=10).json()
        except Exception as e:
            self.log(f"安全管家: uca_post 异常: {e}")
            return None

    def addToBlacklist_sec(self):
        url = "https://uca.wo116114.com/sjgj/woAssistant/umm/configs/v1/config?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6"
        self.sec_uca_post(url, {
            "productId": "91242950", "operationType": 1, "type": 1,
            "contents": [{"checked": True, "configTime": None, "nickname": None, "contentTag": "疑似诈骗", "content": "13088330789"}]
        })
        time.sleep(2)
        self.sec_uca_post(url, {
            "productId": "91242950", "blacklistSource": 0, "type": 1, "operationType": 0,
            "contents": [{"contentTag": "疑似诈骗", "content": "13088330789"}]
        })

    def markPhoneNumber_sec(self):
        url = "https://uca.wo116114.com/sjgj/unicomAssistant/uasp/configs/v1/addressBook/saveTagPhone?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6"
        self.sec_uca_post(url, {"productId": "91311616", "status": 0, "tagIds": [26], "tagPhoneNo": "13088330789"})

    def syncAddressBook_sec(self):
        url = "https://uca.wo116114.com/sjgj/unicomAssistant/uasp/configs/v1/addressBookBatchConfig?product_line=uasp&entry_point=h5&entry_point_id=edop_unicom_3a6cc75a"
        self.sec_uca_post(url, {
            "opType": "1", "productId": "91311616",
            "addressBookDTOList": [{"addressBookName": "可乐", "addressBookPhoneNo": "13105750575"}]
        })

    def setInterceptionRules_sec(self):
        url = "https://uca.wo116114.com/sjgj/woAssistant/umm/configs/v1/config?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6"
        self.sec_uca_post(url, {
            "productId": "91311616", "type": 3, "operationType": 0,
            "contents": [{"icon": "alerting", "content": "1", "contentName": "响一声", "contentTag": "8", "name": "rings-once"}]
        })
        time.sleep(2)
        self.sec_uca_post(url, {
            "productId": "91311616", "type": 3, "operationType": 0,
            "contents": [{"icon": "alerting", "content": "0", "contentName": "响一声", "contentTag": "8", "name": "rings-once"}]
        })

    def viewWeeklyReport_sec(self):
        base = "https://uca.wo116114.com/sjgj/unicomAssistant/uasp"
        body = {"productId": "91311616"}
        self.sec_uca_post(f"{base}/configs/v1/weeklySwitchStatus?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6", body)
        self.sec_uca_post(f"{base}/report/v1/queryKeyData?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6", body)
        self.sec_uca_post(f"{base}/report/v1/weeklySummary?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6", body)

    def zhushou_sec(self):
        try:
            headers = {
                "auth-sa-token": self.sec_token, "token": self.sec_token,
                "Content-Type": "application/json", "Accept": "*",
                "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}"
            }
            self.session.post("https://ims.wo116114.com/api/AiAssistant/autoReply",
                              json={"history": [], "message": "1", "promptId": 10000}, headers=headers, timeout=10)
        except Exception as e:
            self.log(f"安全管家: 智能助手异常: {e}")

    def daijie_sec(self):
        try:
            headers = {
                "auth-sa-token": self.sec_token, "token": self.sec_token, "Authorization": self.sec_token,
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B)"
            }
            self.session.post("https://ims.wo116114.com/api/Assistant/assis_save", json={
                "page_type": 1, "old_ainumber": "XF0", "level": 3, "dialog": "0",
                "opertype": 1, "videoimage": "", "speechtype": "06", "ainumber": "BD1"
            }, headers=headers, timeout=10)
        except Exception as e:
            self.log(f"安全管家: 代接助理异常: {e}")

    def anquanfen_sec(self):
        url = "https://uca.wo116114.com/sjgj/woAssistant/umm/configs/v1/config?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6"
        score_url = "https://uca.wo116114.com/sjgj/unicomAssistant/uasp/report/v1/queryScore?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6"
        off_body = {"productId": "91351080", "type": 3, "operationType": 0,
                    "contents": [{"icon": "phone-fraud", "content": "1", "contentName": "疑似诈骗", "contentTag": "0", "name": "fraud"}]}
        on_body = {"productId": "91351080", "type": 3, "operationType": 0,
                   "contents": [{"contentTag": "0", "content": "0"}]}
        self.sec_uca_post(url, off_body)
        time.sleep(2)
        self.sec_uca_post(score_url, {"productId": "91311616"})
        time.sleep(2)
        self.sec_uca_post(url, on_body)
        time.sleep(2)
        self.sec_uca_post(score_url, {"productId": "91311616"})
        time.sleep(2)
        self.sec_uca_post(url, off_body)

    def haoduan_sec(self):
        url = "https://uca.wo116114.com/sjgj/woAssistant/umm/configs/v1/config?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6"
        item_off = {"checked": True, "content": "1", "contentName": "拦截400开头的10位特服号码", "contentTag": "1"}
        item_on = {"checked": False, "content": "0", "contentName": "拦截400开头的10位特服号码", "contentTag": "1"}
        base = {"productId": "91351080", "type": 7, "operationType": 0}
        self.sec_uca_post(url, {**base, "contents": [item_off]})
        time.sleep(2)
        self.sec_uca_post(url, {**base, "contents": [item_on]})
        time.sleep(2)
        self.sec_uca_post(url, {**base, "contents": [item_off]})

    def ojbk_sec(self, taskCode):
        try:
            url = "https://m.jf.10010.com/jf-external-application/jftask/taskFinish"
            headers = self._sec_jf_headers()
            self.session.post(url, json={"taskCode": taskCode}, headers=headers, timeout=10)
        except Exception as e:
            self.log(f"安全管家: 活动浏览异常: {e}")

    def sec_wo_ai_headers(self, use_mobile=False, override_token=None):
        ua_pc = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 "
            "MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI "
            "MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) "
            "UnifiedPCWindowsWechat(0xf2541818) XWEB/19201 miniProgram/wx1e83eef922822ee0"
        )
        ua_mobile = (
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) "
            "AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 "
            "MicroMessenger/8.0.69(0x1800452f) NetType/WIFI Language/zh_CN "
            "miniProgram/wx1e83eef922822ee0"
        )
        return {
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Origin": "https://ai.wo.cn",
            "Authorization": override_token or self.sec_token,
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "User-Agent": ua_mobile if use_mobile else ua_pc,
        }

    def sec_get_knowledge_id(self):
        try:
            response = self.session.post(
                "https://ai.wo.cn/web-tongtong/knowledge/getKnowledgeList",
                headers=self.sec_wo_ai_headers(),
                data=json.dumps({"appType": 1}),
                timeout=10,
            )
            res = response.json()
            if res.get("code") == 0 and res.get("data"):
                return res["data"][0].get("id")
            self.log(f"获取知识库ID失败：{res.get('msg') or res}")
        except Exception as e:
            self.log(f"获取知识库ID异常：{e}")
        return ""

    def upload_knowledge_file_sec(self):
        try:
            kid = self.sec_get_knowledge_id()
            if not kid:
                return False
            upload_headers = {
                k: v for k, v in self.sec_wo_ai_headers().items()
                if k.lower() != "content-type"
            }
            files = {"file": ("task_upload.txt", b" ", "text/plain")}
            data = {
                "knowledgeId": kid,
                "fileName": "task_upload.txt",
                "fileType": "text/plain",
                "fileSize": "1",
                "currentPartSize": "1",
                "currentIndex": "1",
                "totalPart": "1",
                "spaceType": "0",
            }
            response = self.session.post(
                "https://ai.wo.cn/web-tongtong/knowledge/uploadLocalFileToKnowledge",
                headers=upload_headers,
                files=files,
                data=data,
                timeout=15,
            )
            res = response.json()
            if res.get("code") == 0:
                self.log("上传知识库文件成功")
                return True
            self.log(f"上传知识库文件失败：{res.get('msg') or res}")
            return False
        except Exception as e:
            self.log(f"安全管家: 上传知识库文件异常: {e}")
            return False

    def sec_get_chat_list(self):
        try:
            headers = self.sec_wo_ai_headers()
            headers["Referer"] = "https://ai.wo.cn/wxMini"
            response = self.session.get(
                "https://ai.wo.cn/web-tongtong/historyChat/list",
                headers=headers,
                timeout=10,
            )
            res = response.json()
            if res.get("code") == 0:
                return ((res.get("data") or {}).get("content") or [])
            if res.get("msg"):
                self.log(f"获取AI对话历史失败：{res.get('msg')}")
        except Exception as e:
            self.log(f"获取AI对话历史异常：{e}")
        return []

    def sec_send_ai_chat(self):
        try:
            session_id = f"mmru{''.join(str(random.randint(0, 9)) for _ in range(10))}"
            request_id = f"rqid_mmru{''.join(str(random.randint(0, 9)) for _ in range(10))}"
            headers = self.sec_wo_ai_headers(use_mobile=True)
            headers["Accept"] = "text/event-stream"
            headers["Referer"] = "https://ai.wo.cn/wxMini/psychologicalApp/chat?id=1&type=ruole"
            payload = {
                "modelKey": "87e622d9e488",
                "message": "帮我推荐1个必吃饭店",
                "deepThink": False,
                "webSearch": False,
                "attachments": [],
                "imgSize": 0,
                "sessionId": session_id,
                "requestId": request_id,
                "promptKey": "",
                "knowledgeId": "",
                "ragSearch": False,
                "moduleType": 12,
            }
            response = self.session.post(
                "https://ai.wo.cn/web-tongtong/chat/chatReplyV2",
                headers=headers,
                data=json.dumps(payload),
                timeout=60,
                stream=True,
            )
            for _ in response.iter_lines():
                pass
            if response.ok:
                self.log("已发送AI对话")
                return True
            self.log(f"发送AI对话失败：HTTP {response.status_code}")
        except Exception as e:
            self.log(f"发送AI对话异常：{e}")
        return False

    def sec_get_share_key(self, session_id):
        try:
            headers = self.sec_wo_ai_headers()
            headers["Referer"] = "https://ai.wo.cn/wxMini"
            response = self.session.post(
                "https://ai.wo.cn/web-tongtong/historyChat/shareDetail",
                headers=headers,
                data=json.dumps({"sessionId": session_id}),
                timeout=10,
            )
            res = response.json()
            if res.get("code") == 0 and res.get("data"):
                return str(res["data"])
            self.log(f"获取分享key失败：{res.get('msg') or res}")
        except Exception as e:
            self.log(f"获取分享key异常：{e}")
        return ""

    def sec_view_share_detail(self, key, view_token):
        try:
            response = self.session.post(
                "https://ai.wo.cn/web-tongtong/historyChat/getShareDetail",
                headers=self.sec_wo_ai_headers(use_mobile=True, override_token=view_token),
                data=json.dumps({"key": key, "pageSize": 10, "pageNum": 1}),
                timeout=10,
            )
            res = response.json()
            if res.get("code") == 0:
                self.log("查看分享对话成功")
                return True
            self.log(f"查看分享对话失败：{res.get('msg') or res}")
        except Exception as e:
            self.log(f"查看分享对话异常：{e}")
        return False

    def share_ai_chat_sec(self, taskCode=""):
        try:
            content = self.sec_get_chat_list()
            if not content:
                self.log("暂无AI对话历史，先发送一条对话...")
                if not self.sec_send_ai_chat():
                    return False
                time.sleep(2)
                content = self.sec_get_chat_list()
            if not content:
                self.log("仍无AI对话历史，跳过分享任务")
                return False
            session_id = content[0].get("chatSessionId", "")
            if not session_id:
                self.log("获取分享key失败：缺少sessionId")
                return False
            share_key = self.sec_get_share_key(session_id)
            if not share_key:
                return False
            self.sec_ai_share_key = share_key
            if taskCode:
                self.sec_share_task_code = taskCode
            short_key = share_key[:8] + "..." if len(share_key) > 8 else share_key
            self.log(f"AI对话分享key获取成功: {short_key}")
            return True
        except Exception as e:
            self.log(f"安全管家: 分享AI对话异常: {e}")
            return False

    def role_chat_sec(self):
        try:
            session_id = f"mmrp{''.join(str(random.randint(0, 9)) for _ in range(10))}"
            request_id = f"rqid_mmrp{''.join(str(random.randint(0, 9)) for _ in range(10))}"
            headers = self.sec_wo_ai_headers()
            headers["Accept"] = "text/event-stream"
            headers["Referer"] = "https://ai.wo.cn/wxMini/psychologicalApp/chat?id=1&type=ruole"
            response = self.session.post(
                "https://ai.wo.cn/web-tongtong/lxzn/chat",
                headers=headers,
                data=json.dumps({
                    "sessionId": session_id,
                    "requestId": request_id,
                    "roleId": 1,
                    "message": "我有拖延症，好多事情不想做。",
                }),
                timeout=60,
                stream=True,
            )
            for _ in response.iter_lines():
                pass
            if not response.ok:
                self.log(f"角色助手对话失败：HTTP {response.status_code}")
                return False
            self.log("角色助手对话完成")
            return True
        except Exception as e:
            self.log(f"安全管家: 角色助手对话异常: {e}")
            return False

    def sec_finalize_share_ai_task(self):
        if not self.sec_share_task_code:
            return False
        self.sec_track_pending_claim(self.sec_share_task_code, self.sec_share_task_name)
        latest_task = self.sec_refresh_task_snapshot(
            self.sec_share_task_code,
            self.sec_share_task_name,
            retries=5,
            delay=2,
        )
        if not latest_task:
            self.sec_refresh_security_context(refresh_secret=True)
            latest_task = self.sec_refresh_task_snapshot(
                self.sec_share_task_code,
                self.sec_share_task_name,
                retries=5,
                delay=2,
            )
        if not latest_task:
            self.log("联通助理-分享AI助手对话：互看后未查询到任务状态")
            return False
        finish_count, need_count, finish_text = self.sec_parse_task(latest_task)
        if finish_text == "待领取" or (need_count > 0 and finish_count >= need_count):
            self.log("联通助理-分享AI助手对话：互看完成，尝试领取奖励")
            receive_state = self.receivePoints_sec(self.sec_share_task_code, self.sec_share_task_name)
            if receive_state in ("received", "auto"):
                self.getUserInfo_sec()
                return True
            if receive_state == "pending":
                self.sec_recover_pending_claims(rounds=2, delay=6, refresh_context=True)
                if self.sec_share_task_code not in self.sec_pending_claim_tasks:
                    return True
        self.log(f"联通助理-分享AI助手对话：互看后状态 {finish_count}/{need_count} - {finish_text}")
        return False

    def _sec_jf_headers(self, with_signature=False):
        headers = {
            "ticket": unquote(self.sec_ticket),
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301};ltst;OSVersion/16.6",
            "partnersid": "1702",
            "clienttype": "uasp_unicom_applet",
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "Origin": "https://m.jf.10010.com",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
        }
        if hasattr(self, 'sec_jeaId') and self.sec_jeaId:
            headers["Cookie"] = f"_jea_id={self.sec_jeaId};"
        if with_signature:
            headers.update(self.build_signature_headers_sec())
        return headers

    def update_sec_jea_id(self, response=None):
        jea_id = ""
        if response is not None:
            cookie = response.headers.get("Set-Cookie", "")
            match = re.search(r"_jea_id=([^;]+)", cookie)
            if match:
                jea_id = match.group(1)
        if not jea_id:
            for cookie_item in self.session.cookies:
                if cookie_item.name == "_jea_id":
                    jea_id = cookie_item.value
                    break
        if jea_id:
            self.sec_jeaId = jea_id
        return jea_id

    def sec_query_task_list(self):
        url = "https://m.jf.10010.com/jf-external-application/jftask/taskDetail"
        last_error = ""
        for attempt in range(1, 4):
            response = None
            try:
                response = self.session.post(url, json={}, headers=self._sec_jf_headers(), timeout=15)
                self.update_sec_jea_id(response)
                res = response.json()
                task_detail = ((res or {}).get("data") or {}).get("taskDetail") or {}
                return task_detail.get("taskList", [])
            except ValueError:
                preview = ((response.text if response is not None else "") or "").strip().replace("\n", " ")
                last_error = f"非JSON响应[{attempt}/3]: {preview[:60] or 'empty'}"
            except Exception as e:
                last_error = str(e)
            if attempt < 3:
                time.sleep(2)
        self.log(f"联通助理任务列表查询异常: {last_error}")
        return []

    def sec_parse_task(self, task):
        finish_count = safe_int(task.get("finishCount", 0))
        need_count = safe_int(task.get("needCount", 0))
        finish_text = task.get("finishText") or task.get("taskStatusName") or task.get("taskStatusDesc") or "未知状态"
        return finish_count, need_count, finish_text

    def sec_supports_delayed_claim(self, task_name):
        delayed_keywords = (
            "上传知识库文件",
            "分享AI助手对话",
            "角色助手对话",
        )
        return any(keyword in task_name for keyword in delayed_keywords)

    def sec_track_pending_claim(self, task_code, task_name):
        if task_code and task_name and self.sec_supports_delayed_claim(task_name):
            self.sec_pending_claim_tasks[task_code] = task_name

    def sec_untrack_pending_claim(self, task_code):
        if task_code:
            self.sec_pending_claim_tasks.pop(task_code, None)

    def sec_refresh_security_context(self, refresh_secret=False):
        try:
            self.sec_ticket1 = ""
            self.sec_token = ""
            self.sec_ticket = ""
            self.getTicketByNative_sec()
            if not getattr(self, 'sec_ticket1', None):
                return False
            self.getAuthToken_sec()
            if not getattr(self, 'sec_token', None):
                return False
            self.getTicketForJF_sec()
            if not getattr(self, 'sec_ticket', None):
                return False
            if refresh_secret:
                self.sec_secretKey = None
                if not self.get_secret_key_sec(silent=True):
                    return False
            return True
        except Exception as e:
            self.log(f"联通助理上下文刷新异常: {e}")
            return False

    def sec_get_task_snapshot(self, task_code="", task_name=""):
        for task in self.sec_query_task_list():
            if task_code and task.get("taskCode") == task_code:
                return task
            if task_name and task.get("taskName") == task_name:
                return task
        return None

    def sec_refresh_task_snapshot(self, task_code, task_name, retries=3, delay=2):
        latest_task = None
        for attempt in range(retries):
            if attempt:
                time.sleep(delay)
            latest_task = self.sec_get_task_snapshot(task_code, task_name)
            if not latest_task:
                continue
            finish_count, need_count, finish_text = self.sec_parse_task(latest_task)
            if finish_text == "待领取" or (need_count > 0 and finish_count >= need_count):
                return latest_task
        return latest_task

    def sec_should_manual_finish(self, task_name):
        manual_keywords = (
            "新增亲情守护成员",
            "新增宽带绑定",
            "语音提醒",
            "反诈险领取",
            "设置日程提醒",
        )
        return any(keyword in task_name for keyword in manual_keywords)

    def sec_wait_seconds(self, task_name):
        if any(keyword in task_name for keyword in ("上传知识库文件", "分享AI助手对话", "角色助手对话")):
            return 5
        if any(keyword in task_name for keyword in ("添加黑名单", "骚扰拦截设置", "安全分提升", "号段拦截")):
            return 8
        return 4

    def receivePoints_sec(self, taskCode, taskName=""):
        url = "https://m.jf.10010.com/jf-external-application/jftask/receive"
        last_error = ""
        for attempt in range(1, 3):
            response = None
            try:
                headers = self._sec_jf_headers(with_signature=True)
                response = self.session.post(url, json={"taskCode": taskCode}, headers=headers, timeout=10)
                self.update_sec_jea_id(response)
                res = response.json()
                score = str((res.get("data") or {}).get("score") or "").strip()
                msg = str(res.get("msg") or "").strip()
                if score:
                    self.sec_untrack_pending_claim(taskCode)
                    self.log(f"安全管家: 领取{score}成功", notify=True)
                    return "received"
                if "任务未完成" in msg or "不可领取" in msg:
                    self.log("领取任务未完成")
                    return "pending"
                if "自动发放" in msg or "已领取" in msg:
                    self.sec_untrack_pending_claim(taskCode)
                    self.log("任务已完成且奖励已领取")
                    return "auto"
                if msg:
                    self.log(f"领取失败：{msg}")
                    return "failed"
                self.log(f"领取失败：{res}")
                return "failed"
            except ValueError:
                preview = ((response.text if response is not None else "") or "").strip().replace("\n", " ")
                last_error = f"非JSON响应[{attempt}/2]: {preview[:60] or 'empty'}"
            except Exception as e:
                last_error = str(e)
            if attempt < 2:
                time.sleep(2)
        self.log(f"安全管家: 领取积分异常: {last_error}")
        return "error"

    def finishTask_sec(self, taskCode, taskName):
        try:
            url = "https://m.jf.10010.com/jf-external-application/jftask/toFinish"
            headers = self._sec_jf_headers(with_signature=True)
            response = self.session.post(url, json={"taskCode": taskCode}, headers=headers, timeout=10)
            self.update_sec_jea_id(response)
            action_map = {
                "添加黑名单": self.addToBlacklist_sec,
                "号码标记": self.markPhoneNumber_sec,
                "同步通讯录": self.syncAddressBook_sec,
                "骚扰拦截设置": self.setInterceptionRules_sec,
                "智能助手": self.zhushou_sec,
                "代接助理": self.daijie_sec,
                "安全分": self.anquanfen_sec,
                "号段拦截": self.haoduan_sec,
                "查看周报": self.viewWeeklyReport_sec,
                "活动浏览": lambda: self.ojbk_sec(taskCode),
                "上传知识库文件": self.upload_knowledge_file_sec,
                "分享AI助手对话": lambda: self.share_ai_chat_sec(taskCode),
                "角色助手对话": self.role_chat_sec,
            }
            for key, action in action_map.items():
                if key in taskName:
                    result = action()
                    return False if result is False else True
            self.log(f"任务 {taskName} 需要手动完成")
            return False
        except Exception as e:
            self.log(f"安全管家: finishTask异常: {e}")
            return False

    def signIn_sec(self, taskCode):
        try:
            url = "https://m.jf.10010.com/jf-external-application/jftask/sign"
            headers = self._sec_jf_headers(with_signature=True)
            response = self.session.post(url, json={"taskCode": taskCode}, headers=headers, timeout=10)
            self.update_sec_jea_id(response)
            res = response.json()
            if res.get("code") == "0000":
                return True
            self.log(f"签到失败：{res.get('msg') if res else '状态未知'}")
            return False
        except Exception as e:
            self.log(f"安全管家: 签到异常: {e}")
            return False

    def executeAllTasks_sec(self):
        try:
            task_list = self.sec_query_task_list()
            if not task_list:
                self.log("联通助理任务列表查询失败")
                return
            for task in task_list:
                task_name = task.get("taskName", "")
                task_code = task.get("taskCode", "")
                finish_count, need_count, finish_text = self.sec_parse_task(task)
                self.log(f"{task_name}：{finish_count}/{need_count} - {finish_text}")
                if not task_code or need_count <= 0:
                    self.log("---------------------")
                    continue
                if finish_count >= need_count:
                    if finish_text == "待领取":
                        time.sleep(2)
                        receive_state = self.receivePoints_sec(task_code, task_name)
                        if receive_state == "pending":
                            self.sec_track_pending_claim(task_code, task_name)
                    else:
                        self.log("任务已完成且奖励已领取")
                    self.log("---------------------")
                    continue
                remaining = max(need_count - finish_count, 1)
                self.log(f"任务未完成，需要再执行 {remaining} 次")
                if self.sec_should_manual_finish(task_name):
                    self.log(f"任务 {task_name} 需要手动完成")
                    self.log("---------------------")
                    continue
                for i in range(remaining):
                    try:
                        if i:
                            time.sleep(2)
                        handled = self.signIn_sec(task_code) if "签到" in task_name else self.finishTask_sec(task_code, task_name)
                        if not handled:
                            break
                        wait_seconds = self.sec_wait_seconds(task_name)
                        if wait_seconds > 0:
                            time.sleep(wait_seconds)
                        latest_task = self.sec_refresh_task_snapshot(task_code, task_name, retries=3, delay=2)
                        if latest_task:
                            finish_count, need_count, finish_text = self.sec_parse_task(latest_task)
                        self.log(f"第 {i + 1} 次执行{task_name}任务完成")
                        receive_state = self.receivePoints_sec(task_code, task_name)
                        if receive_state == "pending":
                            self.sec_track_pending_claim(task_code, task_name)
                        if receive_state in ("received", "auto"):
                            break
                        if need_count > 0 and finish_count >= need_count:
                            self.log("任务已完成且奖励已领取")
                            break
                    except Exception as e:
                        self.log(f"执行 {task_name} 失败：{e}")
                        break
                self.log("---------------------")
        except Exception as e:
            self.log(f"联通助理任务执行异常: {e}")

    def getUserInfo_sec(self):
        url = "https://m.jf.10010.com/jf-external-application/jftask/userInfo"
        last_error = ""
        for attempt in range(1, 3):
            response = None
            try:
                headers = self._sec_jf_headers()
                response = self.session.post(url, json={}, headers=headers, timeout=10)
                self.update_sec_jea_id(response)
                res = response.json()
                if not res or res.get('code') != '0000' or not res.get('data'):
                    self.log(f"安全管家: 查询积分失败: {res.get('msg') if res else '无响应'}")
                    return
                current = int(res['data'].get('availableScore', 0))
                today = res['data'].get('todayEarnScore', 0)
                if not hasattr(self, 'sec_oldJFPoints') or self.sec_oldJFPoints is None:
                    self.sec_oldJFPoints = current
                    self.log(f"当前积分：{current}，今日已赚 {today}")
                else:
                    gained = current - self.sec_oldJFPoints
                    user_label = mask_str(self.mobile) if self.mobile else f"账号[{self.index}]"
                    self.log(f"安全管家: 用户{user_label}积分变动：{self.sec_oldJFPoints} → {current} | 新增: {gained}", notify=True)
                return
            except ValueError:
                preview = ((response.text if response is not None else "") or "").strip().replace("\n", " ")
                last_error = f"非JSON响应[{attempt}/2]: {preview[:60] or 'empty'}"
            except Exception as e:
                last_error = str(e)
            if attempt < 2:
                time.sleep(2)
        self.log(f"安全管家: 查询积分异常: {last_error}")

    def sec_recover_pending_claims(self, rounds=2, delay=12, refresh_context=False):
        if not self.sec_pending_claim_tasks:
            return False
        recovered = False
        last_status_map = {}
        self.log(f"联通助理：待补领任务 {len(self.sec_pending_claim_tasks)} 个，开始补查")
        for attempt in range(rounds):
            if attempt:
                time.sleep(delay)
            if not self.sec_pending_claim_tasks:
                break
            if refresh_context and not self.sec_refresh_security_context(refresh_secret=True):
                continue
            for task_code, task_name in list(self.sec_pending_claim_tasks.items()):
                latest_task = self.sec_refresh_task_snapshot(task_code, task_name, retries=3, delay=2)
                if not latest_task:
                    status_key = "missing"
                    if last_status_map.get(task_code) != status_key:
                        self.log(f"{task_name}：补查未取到任务状态")
                        last_status_map[task_code] = status_key
                    continue
                finish_count, need_count, finish_text = self.sec_parse_task(latest_task)
                if finish_text == "待领取" or (need_count > 0 and finish_count >= need_count):
                    self.log(f"{task_name}：补查后尝试领取")
                    receive_state = self.receivePoints_sec(task_code, task_name)
                    if receive_state in ("received", "auto"):
                        recovered = True
                        last_status_map.pop(task_code, None)
                        continue
                else:
                    status_key = f"{finish_count}/{need_count}-{finish_text}"
                    if last_status_map.get(task_code) != status_key:
                        self.log(f"{task_name}：补查状态 {finish_count}/{need_count} - {finish_text}")
                        last_status_map[task_code] = status_key
        if recovered:
            self.getUserInfo_sec()
        if self.sec_pending_claim_tasks:
            names = "、".join(self.sec_pending_claim_tasks.values())
            self.log(f"联通助理：仍待补领 {names}")
        return recovered

    def securityButlerTask(self, is_query_only=False):
        self.log("==== 联通安全管家 ====")
        if not self.ecs_token:
            self.log("安全管家: 缺少 ecs_token，跳过")
            return
        try:
            self.getTicketByNative_sec()
            if not getattr(self, 'sec_ticket1', None): return
            self.getAuthToken_sec()
            if not getattr(self, 'sec_token', None): return
            self.getTicketForJF_sec()
            if not getattr(self, 'sec_ticket', None): return
            self.sec_oldJFPoints = None
            self.getUserInfo_sec()
            if is_query_only:
                self.log("联通助理积分：[查询模式] 跳过任务执行")
                return
            self.get_secret_key_sec()
            self.executeAllTasks_sec()
            self.log("等待积分到账，等待一会...")
            self.sec_recover_pending_claims(rounds=2, delay=12, refresh_context=True)
            time.sleep(3)
            self.getUserInfo_sec()
        except Exception as e:
            self.log(f"安全管家: 异常: {e}")

    def aiting_query_integral(self):
        url = "https://m.jf.10010.com/jf-external-application/jftask/userInfo"
        response = self.session.post(url, json={}, headers=self.aiting_jf_headers())
        self.update_aiting_jea_id(response)
        res = response.json()
        if res.get('code') == '0000':
            data = res.get('data', {})
            self.log(f"爱听任务: 积分概览 - 今日已赚 {data.get('todayEarnScore')}, 当前余额 {data.get('availableScore')}", notify=True)

    def aiting_jf_headers(self, with_signature=False):
        headers = {
            'ticket': unquote(self.aiting_biz_ticket),
            'pageid': getattr(self, 'aiting_pageid', 's789081246969976832'),
            'clienttype': 'aiting_ios',
            'partnersid': '1706',
            'content-type': 'application/json;charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 12; Redmi K30 Pro Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/92.0.4515.159 Mobile Safari/537.36 WoReaderApp/Android',
            'Origin': 'https://m.jf.10010.com',
            'Host': 'm.jf.10010.com',
        }
        jea_id = getattr(self, 'aiting_jeaId', '')
        if jea_id:
            headers['Cookie'] = f"_jea_id={jea_id};"
        if with_signature:
            headers.update(self.build_signature_headers_aiting())
        return headers

    def update_aiting_jea_id(self, response=None):
        jea_id = ''
        if response is not None:
            cookie = response.headers.get('Set-Cookie', '')
            match = re.search(r'_jea_id=([^;]+)', cookie)
            if match:
                jea_id = match.group(1)
        if not jea_id:
            for cookie_item in self.session.cookies:
                if cookie_item.name == '_jea_id':
                    jea_id = cookie_item.value
                    break
        if jea_id:
            self.aiting_jeaId = jea_id
        return jea_id

    def get_secret_key_aiting(self):
        if getattr(self, 'aiting_secretKey', None):
            return self.aiting_secretKey
        try:
            self.update_aiting_jea_id()
            res = self.session.get(
                "https://m.jf.10010.com/jf-external-application/jftask/getSecretKey",
                headers=self.aiting_jf_headers(),
                timeout=10,
            )
            self.update_aiting_jea_id(res)
            data = res.json()
            secret = data.get('data', {}).get('secretKey')
            if data.get('code') == '0000' and secret:
                self.aiting_secretKey = secret.encode('utf-8')
                return self.aiting_secretKey
            self.log(f"爱听任务: getSecretKey 失败 - {response_summary(data)}")
        except Exception as e:
            self.log(f"爱听任务: getSecretKey 异常: {e}")
        return None

    def build_signature_headers_aiting(self):
        secret_key = self.get_secret_key_aiting()
        if not secret_key:
            return {}
        request_ts = str(round(time.time() * 1000))
        nonce = ''.join(random.choices('0123456789abcdefghijklmnopqrstuvwxyz', k=8))
        signature = hmac.new(
            secret_key, f"{nonce}{request_ts}".encode('utf-8'), hashlib.sha256,
        ).hexdigest()
        return {
            'x-request-timestamp': request_ts,
            'x-request-nonce': nonce,
            'x-request-signature': signature,
        }

    def ltzf_task(self):
        if not UserService.wocare_available:
            return
        self.log("==== 联通祝福 ====")
        try:
            self.session.head("https://wocare.unisk.cn", timeout=3)
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
            self.log("联通祝福: [提示] 沃关怀(wocare.unisk.cn)活动域名已物理下线或当前网络不可达，已自动跳过此模块")
            UserService.wocare_available = False
            return
        except Exception:
            pass
        base_url = "https://wocare.unisk.cn/mbh/getToken"
        params = {
            "channelType": WOCARE_CONSTANTS["serviceLife"],
            "homePage": "home",
            "duanlianjieabc": "qAz2m"
        }
        targetUrl = f"{base_url}?{urlencode(params)}"
        res = self.openPlatLineNew(targetUrl)
        if not res or 'ticket' not in res:
            self.log("联通祝福: 获取Ticket失败")
            return
        ticket = res['ticket']
        if not self.wocare_getToken(ticket):
            self.log("联通祝福: 获取Wocare Token失败")
            return
        self.wocare_getSpecificityBanner()
        wocare_activities = [
            {"name": "星座配对", "id": 2},
            {"name": "大转盘", "id": 3},
            {"name": "盲盒抽奖", "id": 4}
        ]
        for activity in wocare_activities:
            self.wocare_getDrawTask(activity)
            self.wocare_loadInit(activity)

    def openPlatLineNew(self, to_url):
        try:
            base_url = "https://m.client.10010.com/mobileService/openPlatform/openPlatLineNew.htm"
            params = {"to_url": to_url}
            for attempt in range(1, 4):
                try:
                    res = self.session.get(base_url, params=params, allow_redirects=False, timeout=15)
                    break
                except Exception as e:
                    err_msg = str(e)
                    if attempt < 3 and os.environ.get("UNICOM_PROXY_API") and ("Max retries exceeded" in err_msg or "timed out" in err_msg.lower() or "connection" in err_msg.lower() or "SOCKS" in err_msg):
                        self.log(f"openPlatLineNew 第{attempt}次异常触发故障转移: {err_msg}")
                        self.failover_proxy()
                        continue
                    self.log(f"openPlatLineNew 第{attempt}次重试 - 异常: {e}")
                    if attempt == 3:
                         return None
                    time.sleep(2)
            if res.status_code == 302 and 'Location' in res.headers:
                loc = res.headers['Location']
                parsed = urlparse(loc)
                qs = parse_qs(parsed.query)
                ticket = qs.get('ticket', [''])[0]
                type_val = qs.get('type', [''])[0]
                if ticket:
                    return {'ticket': ticket, 'type': type_val, 'loc': loc}
                else:
                    self.log("openPlatLineNew: 重定向URL中无ticket")
            else:
                self.log(f"openPlatLineNew: 状态码{res.status_code} (期望302)")
        except Exception as e:
            self.log(f"openPlatLineNew 异常: {str(e)}")
        return None

    def random_string(self, length, chars=string.ascii_letters + string.digits):
        return ''.join(random.choice(chars) for _ in range(length))

    def get_bizchannelinfo(self):
        info = {
            "bizChannelCode": "225",
            "disriBiz": "party",
            "unionSessionId": "",
            "stType": "",
            "stDesmobile": "",
            "source": "",
            "rptId": self.rptId,
            "ticket": "",
            "tongdunTokenId": self.tokenId_cookie,
            "xindunTokenId": self.unicomTokenId
        }
        return json.dumps(info)

    def get_epay_authinfo(self):
        info = {
            "mobile": "",
            "sessionId": getattr(self, 'sessionId', ''),
            "tokenId": getattr(self, 'tokenId', ''),
            "userId": ""
        }
        return json.dumps(info)

    def ttlxj_task(self, is_query_only=False):
        self.log("==== 天天领现金 ====")
        for attempt in range(1, 31):
            try:
                ticket_res = self.openPlatLineNew("https://epay.10010.com/ci-mps-st-web/ttlxj/")
                if not ticket_res or not ticket_res.get('ticket'):
                    if attempt < 30:
                        self.log(f"天天领现金: 获取Ticket失败，正在重试 ({attempt}/30)...")
                        time.sleep(2)
                        continue
                    else:
                        self.log("天天领现金: 获取Ticket失败，已达最大重试次数，跳过任务")
                        return
                ticket = ticket_res['ticket']
                type_val = ticket_res['type']
                if self.ttlxj_authorize(ticket, type_val, ticket_res['loc']):
                    if self.ttlxj_auth_check():
                         if is_query_only:
                            self.ttlxj_query_available()
                            return
                         self.ttlxj_do_tasks()
                         self.ttlxj_query_available()
                         break
                else:
                     if attempt < 30:
                        self.log(f"天天领现金: 授权失败，正在重试 ({attempt}/30)...")
                        time.sleep(2)
                     else:
                        self.log("天天领现金: 授权失败，已达最大重试次数")
            except Exception as e:
                if attempt < 30:
                    self.log(f"天天领现金: 任务异常 ({e})，正在重试 ({attempt}/30)...")
                    time.sleep(2)
                else:
                    self.log(f"天天领现金: 任务异常: {e}")

    def ttlxj_authorize(self, ticket, type_val, referer_url):
        try:
            url = "https://epay.10010.com/woauth2/v2/authorize"
            headers = {
                "Origin": "https://epay.10010.com",
                "Referer": referer_url
            }
            payload = {
                "response_type": "rptid",
                "client_id": "73b138fd-250c-4126-94e2-48cbcc8b9cbe",
                "redirect_uri": "https://epay.10010.com/ci-mps-st-web/",
                "login_hint": {
                    "credential_type": "st_ticket",
                    "credential": ticket,
                    "st_type": type_val,
                    "force_logout": True,
                    "source": "app_sjyyt"
                },
                "device_info": {
                    "token_id": f"chinaunicom-pro-{int(time.time()*1000)}-{self.random_string(13)}",
                    "trace_id": self.random_string(32)
                }
            }
            res = self.session.post(url, json=payload, headers=headers, timeout=10)
            if res.status_code == 200:
                return True
            else:
                self.log(f"天天领现金: Authorize失败[{res.status_code}]: {res.text}")
                return False
        except Exception as e:
             self.log(f"ttlxj_authorize error: {e}")
             return False

    def ttlxj_auth_check(self):
        try:
            url = "https://epay.10010.com/ps-pafs-auth-front/v1/auth/check"
            headers = {
                "bizchannelinfo": self.get_bizchannelinfo()
            }
            res = self.session.post(url, headers=headers, json={}, timeout=10)
            data = res.json()
            code = data.get("code")
            if code == "0000":
                auth_info = data.get("data", {}).get("authInfo", {})
                self.sessionId = auth_info.get("sessionId", "")
                self.tokenId = auth_info.get("tokenId", "")
                self.epay_userId = auth_info.get("userId", "")
                return True
            elif code == "2101000100":
                login_url = data.get("data", {}).get("woauth_login_url")
                if login_url:
                    return self.ttlxj_login(login_url)
            else:
                self.log(f"天天领现金: AuthCheck失败[{code}]: {data.get('msg')}")
                return False
        except Exception as e:
            self.log(f"ttlxj_auth_check error: {e}")
            return False

    def ttlxj_login(self, login_url):
        try:
            full_url = f"{login_url}https://epay.10010.com/ci-mcss-party-web/clockIn/?bizFrom=225&bizChannelCode=225"
            res = self.session.get(full_url, allow_redirects=False, timeout=10)
            if res.status_code == 302 and 'Location' in res.headers:
                loc = res.headers['Location']
                parsed = urlparse(loc)
                qs = parse_qs(parsed.query)
                rptid = qs.get('rptid', [''])[0]
                if rptid:
                    self.rptId = rptid
                    return self.ttlxj_auth_check()
                else:
                    self.log("天天领现金: Login跳转后无rptid")
            else:
                self.log(f"天天领现金: Login失败[{res.status_code}]")
            return False
        except Exception as e:
            self.log(f"ttlxj_login error: {e}")
            return False

    def ttlxj_do_tasks(self):
        info_url = "https://epay.10010.com/ci-mcss-party-front/v1/ttlxj/userDrawInfo"
        headers = {
            "bizchannelinfo": self.get_bizchannelinfo(),
            "authinfo": self.get_epay_authinfo()
        }
        res = self.request("post", info_url, json={}, headers=headers)
        if not res: return
        data = res.json()
        if data.get('code') == '0000':
            day_of_week = data.get("data", {}).get("dayOfWeek", "")
            draw_key = f"day{day_of_week}"
            has_not_clocked_in = data.get("data", {}).get(draw_key) == "1"
            if has_not_clocked_in:
                self.log(f"天天领现金: 今天未打卡", notify=True)
                today_js = (datetime.now().weekday() + 1) % 7
                draw_type = "C" if today_js == 0 else "B"
                self.ttlxj_unifyDrawNew(draw_type)
            else:
                 self.log(f"天天领现金: 今天已打卡", notify=True)
        else:
            self.log(f"天天领现金: 查询失败: {data.get('msg')}")

    def ttlxj_unifyDrawNew(self, draw_type):
        draw_url = "https://epay.10010.com/ci-mcss-party-front/v1/ttlxj/unifyDrawNew"
        headers = {
            "bizchannelinfo": self.get_bizchannelinfo(),
            "authinfo": self.get_epay_authinfo()
        }
        req_data = {
            "drawType": draw_type,
            "bizFrom": "225",
            "activityId": "TTLXJ20210330"
        }
        res = self.request("post", draw_url, data=req_data, headers=headers)
        if not res: return
        data = res.json()
        if data.get('code') == '0000':
            prize = data.get('data', {}).get('prizeName', '未知奖品')
            self.log(f"天天领现金: 抽奖成功: {prize}", notify=True)
        else:
            self.log(f"天天领现金: 抽奖失败: {data.get('msg')}")

    def ttlxj_query_available(self):
        avail_url = "https://epay.10010.com/ci-mcss-party-front/v1/ttlxj/queryAvailable"
        headers = {
            "bizchannelinfo": self.get_bizchannelinfo(),
            "authinfo": self.get_epay_authinfo()
        }
        res = self.request("post", avail_url, json={}, headers=headers)
        if not res: return
        data = res.json()
        if data.get('code') == '0000':
            d = data.get('data', {})
            amount_raw = int(d.get('availableAmount', '0'))
            amount_yuan = f"{amount_raw / 100:.2f}"
            msg = f"天天领现金: 可用立减金: {amount_yuan}元"
            seven_day = int(d.get('sevenDayExpireAmount', 0))
            if seven_day > 0:
                msg += f", 7天内过期立减金: {seven_day / 100:.2f}元"
            min_exp_amt = int(d.get('minExpireAmount', 0))
            min_exp_date = d.get('minExpireDate')
            if min_exp_amt > 0 and min_exp_date:
                msg += f", 最早过期立减金: {min_exp_amt / 100:.2f}元 -- {min_exp_date}过期"
            self.log(msg, notify=True)
        else:
            self.log(f"天天领现金: 查询余额失败: {data.get('msg')}")

    def ttxc_headers(self, auth=True, ecs=False):
        headers = {
            "user-agent": COMMON_CONSTANTS["MARKET_H5_UA"],
            "content-type": "application/json",
            "accept": "*/*",
            "origin": "https://epay.10010.com",
            "referer": TTXC_REFERER,
            "x-requested-with": "com.sinovatech.unicom.ui",
        }
        if auth and getattr(self, "ttxc_token", ""):
            headers["authorization"] = self.ttxc_token
        if ecs and self.ecs_token:
            headers["Cookie"] = f"ecs_token={self.ecs_token}"
        return headers

    def ttxc_post(self, path, payload=None, auth=True, with_user=True, ecs=False):
        data = dict(payload or {})
        if with_user:
            data.setdefault("userId", getattr(self, "ttxc_user_id", ""))
        data.setdefault("channel", TTXC_CHANNEL)
        res = self.request("post", f"{TTXC_BASE_URL}{path}", json=data, headers=self.ttxc_headers(auth=auth, ecs=ecs), timeout=10)
        if not res:
            return {}
        try:
            return res.json()
        except Exception:
            return {}

    def ttxc_init_ttgame(self):
        self.session.cookies.set("ecs_token", self.ecs_token)
        url = f"{TTXC_APP_BASE_URL}/v1/login/ttGame?channel={TTXC_CHANNEL}&rptId="
        data = {}
        for attempt in range(1, 4):
            data = self.ttxc_json(self.request("post", url, json={"unicomTokenId": self.unicomTokenId}, headers=self.ttxc_headers(auth=False, ecs=True), timeout=10))
            if data.get("code") == "0000":
                return True
            if data.get("code") == "4003" and data.get("data") and self.ttxc_finish_woauth(data.get("data")):
                data = self.ttxc_json(self.request("post", url, json={"unicomTokenId": self.unicomTokenId}, headers=self.ttxc_headers(auth=False, ecs=True), timeout=10))
                if data.get("code") == "0000":
                    return True
            if attempt < 3:
                time.sleep(2)
        self.log(f"通通乡村: 初始化失败[{data.get('code')}]: {data.get('msg', '')}")
        return False

    def ttxc_json(self, res):
        if not res:
            return {}
        try:
            return res.json()
        except Exception:
            return {}

    def ttxc_finish_woauth(self, login_url):
        headers = {
            "Referer": "https://epay.10010.com/",
            "User-Agent": COMMON_CONSTANTS["MARKET_H5_UA"],
        }
        res = self.request("get", login_url, headers=headers, timeout=10)
        if not res:
            return False
        match = re.search(r'var token = "([^"]+)"', res.text or "")
        if not match:
            return False
        next_url = (
            "https://epay.10010.com/woauth2/after-collected-device-digest"
            f"?deviceDigestTraceId=&deviceDigestTokenId=&token={quote(match.group(1))}&source=app_sjyyt"
        )
        referer = login_url
        for _ in range(6):
            res = self.request("get", next_url, headers={"Referer": referer, "User-Agent": COMMON_CONSTANTS["MARKET_H5_UA"]}, allow_redirects=False, timeout=10)
            if not res:
                return False
            location = res.headers.get("Location", "")
            if not location:
                return res.status_code == 200
            referer = next_url
            next_url = location
        return False

    def ttxc_login(self, update_nick=True):
        if not self.ecs_token:
            self.onLine()
            if not self.ecs_token:
                self.log("通通乡村: 缺少 ecs_token，跳过")
                return False
        if not self.ttxc_init_ttgame():
            return False
        data = self.ttxc_post("/user/v1/login", auth=False, with_user=False, ecs=True)
        if data.get("code") != 0:
            self.log(f"通通乡村: 登录失败[{data.get('code')}]: {data.get('msg', '')}")
            return False
        user = data.get("data") or {}
        self.ttxc_user_id = user.get("userId", "")
        self.ttxc_token = data.get("token", "")
        self.ttxc_charge_level = user.get("chargeLevel") or {}
        self.ttxc_newbie_list = user.get("newbieList")
        self.ttxc_nick_name = user.get("nickName") or ""
        if not self.ttxc_user_id or not self.ttxc_token:
            self.log("通通乡村: 登录响应缺少 userId/token")
            return False
        carbon = self.ttxc_charge_level.get("carbonNum", 0)
        eco = self.ttxc_charge_level.get("ecologyAmount", 0)
        self.log(f"通通乡村: 登录成功，碳能量{carbon}g，生态值{eco}", notify=True)
        if update_nick and not self.ttxc_nick_name and self.ttxc_newbie_done():
            self.ttxc_update_nick()
        return True

    def ttxc_update_nick(self):
        nick = (self.account_mobile or self.mobile or "")[-4:] or str(random.randint(1000, 9999))
        data = self.ttxc_post("/user/v1/updateNick", {"nickName": nick})
        if data.get("code") == 0:
            self.ttxc_nick_name = nick
            self.log(f"通通乡村: 已设置昵称 {nick}")
            return True
        self.log(f"通通乡村: 设置昵称失败[{data.get('code')}]: {data.get('msg', '')}")
        return False

    def ttxc_newbie_done(self):
        steps = getattr(self, "ttxc_newbie_list", None)
        return not isinstance(steps, list) or all(step in steps for step in TTXC_NEWBIE_STEPS)

    def ttxc_newbie_mark(self, step):
        target = []
        for item in TTXC_NEWBIE_STEPS:
            target.append(item)
            if item == step:
                break
        data = self.ttxc_post("/user/v1/newbie", {"newbieList": target, "type": 1})
        if data.get("code") == 0:
            self.ttxc_newbie_list = data.get("data") or target
            return True
        self.log(f"通通乡村: 新手步骤{step}失败[{data.get('code')}]: {data.get('msg', '')}")
        return False

    def ttxc_newbie_need(self, step):
        steps = getattr(self, "ttxc_newbie_list", None)
        return isinstance(steps, list) and step not in steps

    def ttxc_first_newbie_land(self, lands=None):
        lands = lands if lands is not None else self.ttxc_get_lands()
        active = next((land for land in lands if land.get("status") in [2, 3] and (land.get("plant") or {}).get("plantId")), None)
        if active:
            return active
        return next((land for land in lands if land.get("status") == 1), None)

    def ttxc_newbie_charge_land(self):
        lands = self.ttxc_get_lands()
        active = [land for land in lands if land.get("status") == 3 and (land.get("plant") or {}).get("plantId")]
        return next((land for land in active if str((land.get("plant") or {}).get("curLevel")) in ["0", "1"]), None) or (active[0] if active else None)

    def ttxc_harvest_land(self, land, newbie=False):
        if not land:
            return None
        plant = land.get("plant") or {}
        plant_id = plant.get("plantId")
        land_index = land.get("landIndex")
        if not plant_id or not land_index:
            return None
        if land.get("status") == 2 and TTXC_HARVEST_WAIT_SECONDS > 0:
            time.sleep(TTXC_HARVEST_WAIT_SECONDS)
        path = "/plant/v1/newHarvest" if newbie else "/plant/v1/harvest"
        data = self.ttxc_post(path, {"landIndex": land_index, "plantId": plant_id})
        if data.get("code") == 0:
            self.log(f"通通乡村: 地块{land_index}收获成功")
            return data.get("data") or {"landIndex": land_index, "status": 1, "plant": None}
        self.log(f"通通乡村: 地块{land_index}收获失败[{data.get('code')}]: {data.get('msg', '')}")
        return None

    def ttxc_newbie_task(self):
        if self.ttxc_newbie_done():
            return False
        need_farm = any(self.ttxc_newbie_need(step) for step in ["G03", "G03_2", "G04", "G05", "G09", "G10"])
        lands = self.ttxc_get_lands() if need_farm else []
        plant_id = ""
        current = self.ttxc_first_newbie_land(lands) if need_farm else None
        if need_farm:
            self.ttxc_post("/client/v1/plant/type", {})
            plant_id = self.ttxc_get_plant_id()
            if not plant_id:
                self.log("通通乡村: 新手任务缺少作物ID")
                return False
        if self.ttxc_newbie_need("G03") and not self.ttxc_newbie_mark("G03"):
            return False
        if self.ttxc_newbie_need("G03_2"):
            has_crop = current and current.get("status") in [2, 3] and (current.get("plant") or {}).get("plantId")
            if not has_crop:
                data = self.ttxc_post("/client/v1/plant/buy", {"plantId": plant_id, "gameCfgId": ""})
                if data.get("code") != 0:
                    self.log(f"通通乡村: 新手购买作物失败[{data.get('code')}]: {data.get('msg', '')}")
                    return False
            if not self.ttxc_newbie_mark("G03_2"):
                return False
        if self.ttxc_newbie_need("G04"):
            if not current or not current.get("landIndex"):
                self.log("通通乡村: 新手任务缺少可种植地块")
                return False
            if not (current.get("status") in [2, 3] and (current.get("plant") or {}).get("plantId")):
                data = self.ttxc_post("/plant/v1/planting", {"landIndex": current.get("landIndex"), "plantId": plant_id})
                if data.get("code") != 0:
                    self.log(f"通通乡村: 新手种植失败[{data.get('code')}]: {data.get('msg', '')}")
                    return False
                current = data.get("data") or {"landIndex": current.get("landIndex"), "status": 3, "plant": {"plantId": plant_id}}
            if not self.ttxc_newbie_mark("G04"):
                return False
        if self.ttxc_newbie_need("G05"):
            current = current if current and current.get("plant") else self.ttxc_first_newbie_land()
            current = self.ttxc_charge_land(current)
            if not current or not self.ttxc_newbie_mark("G05"):
                return False
        if self.ttxc_newbie_need("G09"):
            plant = (current or {}).get("plant") or {}
            level = str(plant.get("curLevel") or "")
            if not (current and current.get("status") == 3 and plant.get("plantId") and level in ["", "0", "1"]):
                current = self.ttxc_newbie_charge_land()
            current = self.ttxc_charge_land(current, mock=1)
            if not current or not self.ttxc_newbie_mark("G09"):
                return False
        if self.ttxc_newbie_need("G10"):
            current = current if current and current.get("plant") else self.ttxc_first_newbie_land()
            if not self.ttxc_harvest_land(current, newbie=True) or not self.ttxc_newbie_mark("G10"):
                return False
        if self.ttxc_newbie_need("G11") and not self.ttxc_newbie_mark("G11"):
            return False
        if self.ttxc_newbie_need("G12"):
            if not self.ttxc_nick_name and not self.ttxc_update_nick():
                return False
            if not self.ttxc_newbie_mark("G12"):
                return False
        self.log("通通乡村: 新手任务已完成")
        return True

    def ttxc_sign(self, is_query_only=False):
        info = self.ttxc_post("/client/v1/sign/info", {})
        code = (info.get("data") or {}).get("signinCode")
        if not code:
            self.log("通通乡村: 获取签到码失败")
            return
        user = self.ttxc_post("/client/v1/sign/user", {"code": code})
        last_time = str((user.get("data") or {}).get("lastSigninTime") or "")
        signed = last_time[:10] == datetime.now().strftime("%Y-%m-%d")
        if signed:
            self.log("通通乡村: 今日已签到", notify=True)
            return
        if is_query_only:
            self.log("通通乡村: 今日未签到", notify=True)
            return
        data = self.ttxc_post("/client/v1/sign/signIn", {"code": code})
        if data.get("code") == 0:
            sign_data = data.get("data") or {}
            keep_value = safe_int(sign_data.get("keepSigninValue") or sign_data.get("lastKeepSigninValue") or sign_data.get("totalSigninValue"))
            award_items = (info.get("data") or {}).get("awards") or []
            energy = 0
            for item in award_items:
                if item.get("awardType") == "KEEP" and safe_int(item.get("signinValue")) == keep_value:
                    energy = safe_int(item.get("carbonEnergyAmount"))
                    break
            if not energy:
                charge_level = data.get("chargeLevel") or {}
                before = safe_int(getattr(self, "ttxc_charge_level", {}).get("carbonNum"))
                after = safe_int(charge_level.get("carbonNum"))
                energy = max(after - before, 0)
            if data.get("chargeLevel"):
                self.ttxc_charge_level = data.get("chargeLevel") or self.ttxc_charge_level
            msg = f"通通乡村: 签到成功 +{energy}g" if energy else "通通乡村: 签到成功"
            self.log(msg, notify=True)
        else:
            self.log(f"通通乡村: 签到失败[{data.get('code')}]: {data.get('msg', '')}")

    def ttxc_get_tasks(self):
        data = self.ttxc_post("/client/v1/task/list", {})
        if data.get("code") != 0:
            self.log(f"通通乡村: 获取任务列表失败[{data.get('code')}]: {data.get('msg', '')}")
            return []
        tasks = []
        for group in data.get("data") or []:
            for task in group.get("taskList") or []:
                task["taskGroupName"] = group.get("taskGroupName", "")
                tasks.append(task)
        return tasks

    def ttxc_finish_task(self, task):
        task_id = task.get("taskCode")
        if not task_id:
            return False
        data = self.ttxc_post("/client/v1/task/finish", {"taskId": task_id})
        name = task.get("taskTitle", task_id)
        if data.get("code") == 0:
            reward = task.get("carbonEnergyAmount") or 0
            self.log(f"通通乡村: 领取[{name}]成功 +{reward}g")
            return True
        self.log(f"通通乡村: 领取[{name}]失败[{data.get('code')}]: {data.get('msg', '')}")
        return False

    def ttxc_do_task(self, task):
        data = self.ttxc_post("/client/v1/task/do", {"taskId": task.get("taskCode")})
        name = task.get("taskTitle", task.get("taskCode", ""))
        if data.get("code") == 0:
            self.log(f"通通乡村: 已执行[{name}]")
            return True
        self.log(f"通通乡村: 执行[{name}]失败[{data.get('code')}]: {data.get('msg', '')}")
        return False

    def ttxc_claim_ready_tasks(self, tasks, claimed=None):
        if claimed is None:
            claimed = set()
        count = 0
        for task in tasks:
            task_id = task.get("taskCode")
            if task.get("taskStatus") == "UNCLA" and task_id not in claimed:
                if self.ttxc_finish_task(task):
                    claimed.add(task_id)
                    count += 1
        return count

    def ttxc_do_jump_tasks(self, tasks):
        count = 0
        for task in tasks:
            if task.get("taskType") == "GAME" and task.get("taskStatus") == "UNDO" and task.get("jumpUrl"):
                if self.ttxc_do_task(task):
                    count += 1
                time.sleep(1)
        return count

    def ttxc_do_garbage_task(self, tasks):
        task = next((t for t in tasks if t.get("taskType") == "GAME" and t.get("taskStatus") == "UNDO" and "垃圾分类" in t.get("taskTitle", "")), None)
        if not task:
            return False
        start = self.ttxc_post("/user/v1/start", {})
        answer_no = (start.get("data") or {}).get("answerNo")
        if not answer_no:
            self.log("通通乡村: 垃圾分类开始失败")
            return False
        time.sleep(TTXC_GARBAGE_WAIT_SECONDS)
        data = self.ttxc_post("/user/v1/finish", {"answerNo": answer_no})
        if data.get("code") == 0:
            self.log("通通乡村: 垃圾分类已通关")
            return True
        self.log(f"通通乡村: 垃圾分类通关失败[{data.get('code')}]: {data.get('msg', '')}")
        return False

    def ttxc_prepare_newbie_energy(self, claimed=None):
        if claimed is None:
            claimed = set()
        self.ttxc_sign()
        tasks = self.ttxc_get_tasks()
        self.ttxc_claim_ready_tasks(tasks, claimed)
        self.ttxc_do_jump_tasks(tasks)
        self.ttxc_do_garbage_task(tasks)
        tasks = self.ttxc_get_tasks()
        self.ttxc_claim_ready_tasks(tasks, claimed)

    def ttxc_get_lands(self):
        land = safe_int(getattr(self, "ttxc_charge_level", {}).get("land"), 4)
        data = self.ttxc_post("/plant/v1/user", {"land": land})
        if data.get("code") != 0:
            self.log(f"通通乡村: 获取土地失败[{data.get('code')}]: {data.get('msg', '')}")
            return []
        return data.get("data") or []

    def ttxc_get_plant_id(self):
        data = self.ttxc_post("/client/v1/plant/page", {"itemType": "SPE", "pageNum": 1, "pageSize": 20})
        items = (data.get("data") or {}).get("list") or []
        return items[0].get("itemNo", "") if items else ""

    def ttxc_plant_land(self, land_index, plant_id=None):
        plant_id = plant_id or self.ttxc_get_plant_id()
        if not plant_id or not land_index:
            return None
        self.ttxc_post("/client/v1/plant/buy", {"plantId": plant_id, "gameCfgId": ""})
        data = self.ttxc_post("/plant/v1/planting", {"landIndex": land_index, "plantId": plant_id})
        if data.get("code") == 0:
            self.log(f"通通乡村: 已在地块{land_index}种植作物")
            return {"landIndex": land_index, "status": 3, "plant": {"plantId": plant_id}}
        self.log(f"通通乡村: 地块{land_index}种植失败[{data.get('code')}]: {data.get('msg', '')}")
        return None

    def ttxc_ensure_planted_lands(self, lands, needed=None):
        active = [l for l in lands if l.get("status") in [2, 3] and (l.get("plant") or {}).get("plantId")]
        empty = [l for l in lands if l.get("status") == 1]
        if not empty:
            return active
        plant_id = self.ttxc_get_plant_id()
        if not plant_id:
            return active
        for land in empty:
            planted = self.ttxc_plant_land(land.get("landIndex"), plant_id)
            if planted:
                active.append(planted)
        return active

    def ttxc_charge_land(self, land, mock=None):
        if not land:
            return False
        plant = land.get("plant") or {}
        plant_id = plant.get("plantId")
        land_index = land.get("landIndex")
        if not plant_id or not land_index:
            return False
        data = self.ttxc_post("/plant/v1/charge", {"landIndex": land_index, "plantId": plant_id, "mock": mock})
        if data.get("code") == 0:
            self.log(f"通通乡村: 地块{land_index}充能成功")
            result = data.get("data") or {}
            if result and not result.get("plant"):
                result["plant"] = plant
            return result or land
        self.log(f"通通乡村: 地块{land_index}充能失败[{data.get('code')}]: {data.get('msg', '')}")
        return None

    def ttxc_harvest_and_replant(self, land):
        harvested = self.ttxc_harvest_land(land)
        return self.ttxc_plant_land(land.get("landIndex")) if harvested and land else None

    def ttxc_grow_land_to_harvest(self, land):
        current = land
        if current.get("status") == 2:
            self.ttxc_harvest_and_replant(current)
            return
        charged = 0
        while current.get("status") == 3 and charged < TTXC_GROW_MAX_CHARGE_PER_LAND:
            current = self.ttxc_charge_land(current)
            if not current:
                return
            charged += 1
            if current.get("status") == 2:
                self.ttxc_harvest_and_replant(current)
                return
            if charged < TTXC_GROW_MAX_CHARGE_PER_LAND:
                time.sleep(1)
        if current.get("status") == 3:
            self.log(f"通通乡村: 地块{current.get('landIndex')}催熟达到上限，跳过")

    def ttxc_replace_land(self, lands, updated):
        land_index = updated.get("landIndex")
        for i, land in enumerate(lands):
            if land.get("landIndex") == land_index:
                lands[i] = updated
                return
        lands.append(updated)

    def ttxc_complete_charge_task(self, active, remaining):
        while remaining > 0:
            immature = [land for land in active if land.get("status") == 3 and (land.get("plant") or {}).get("plantId")]
            if not immature:
                self.log("通通乡村: 未成熟作物不足，提前结束10次充能补足")
                return
            progressed = False
            for land in immature:
                if remaining <= 0:
                    return
                result = self.ttxc_charge_land(land)
                if result:
                    self.ttxc_replace_land(active, result)
                    remaining -= 1
                    progressed = True
                time.sleep(1)
            if not progressed:
                self.log("通通乡村: 充能未成功，提前结束10次充能补足")
                return

    def ttxc_farm_tasks(self, tasks):
        charge_task = next((t for t in tasks if "10次作物充能" in t.get("taskTitle", "")), None)
        land_task = next((t for t in tasks if "三块不同" in t.get("taskTitle", "")), None)
        harvest_task = next((t for t in tasks if "收获一次作物" in t.get("taskTitle", "")), None)
        if not charge_task and not land_task and not harvest_task:
            return
        charge_pending = charge_task if (charge_task or {}).get("taskStatus") == "UNDO" else None
        land_pending = land_task if (land_task or {}).get("taskStatus") == "UNDO" else None
        harvest_pending = harvest_task if (harvest_task or {}).get("taskStatus") == "UNDO" else None
        if not charge_pending and not land_pending and not harvest_pending:
            return
        lands = self.ttxc_get_lands()
        active = self.ttxc_ensure_planted_lands(lands)
        need_land = max(safe_int((land_pending or {}).get("finishValue")) - safe_int((land_pending or {}).get("doneValue")), 0)
        if harvest_pending and not charge_pending and not land_pending:
            for land in active:
                if land.get("status") == 2:
                    self.ttxc_harvest_and_replant(land)
        if not active:
            self.log("通通乡村: 没有可充能作物")
            return
        charged = 0
        for i, land in enumerate(active[:need_land]):
            result = self.ttxc_charge_land(land)
            if result:
                active[i] = result
                charged += 1
                time.sleep(1)
        need_charge = max(safe_int((charge_pending or {}).get("finishValue")) - safe_int((charge_pending or {}).get("doneValue")) - charged, 0)
        self.ttxc_complete_charge_task(active, need_charge)
        for land in active:
            self.ttxc_grow_land_to_harvest(land)

    def ttxc_task(self, is_query_only=False):
        self.log("==== 通通乡村 ====")
        try:
            if not self.ttxc_login(update_nick=not is_query_only):
                return
            claimed = set()
            if not is_query_only:
                if not self.ttxc_newbie_done():
                    self.ttxc_prepare_newbie_energy(claimed)
                if not self.ttxc_newbie_done() and not self.ttxc_newbie_task():
                    return
            self.ttxc_sign(is_query_only=is_query_only)
            tasks = self.ttxc_get_tasks()
            if is_query_only:
                todo = sum(1 for t in tasks if t.get("taskStatus") == "UNDO")
                claim = sum(1 for t in tasks if t.get("taskStatus") == "UNCLA")
                self.log(f"通通乡村: 待做{todo}个，可领取{claim}个", notify=True)
                return
            self.ttxc_claim_ready_tasks(tasks, claimed)
            self.ttxc_do_jump_tasks(tasks)
            self.ttxc_do_garbage_task(tasks)
            self.ttxc_farm_tasks(tasks)
            tasks = self.ttxc_get_tasks()
            self.ttxc_claim_ready_tasks(tasks, claimed)
        except Exception as e:
            self.log(f"通通乡村异常: {e}")

    def aiting_get_aes(self, data, key):
        iv_str = "16-Bytes--String"
        key_bytes = key[:16].encode('utf-8')
        iv_bytes = iv_str[:16].encode('utf-8')
        text = json.dumps(data, separators=(',', ':')) if isinstance(data, (dict, list)) else str(data)
        padded_data = pad(text.encode('utf-8'), 16)
        cipher = AES.new(key_bytes, AES.MODE_CBC, iv_bytes)
        ciphertext = cipher.encrypt(padded_data)
        hex_str = ciphertext.hex()
        return base64.b64encode(hex_str.encode('utf-8')).decode('utf-8')

    def aiting_aes_encrypt(self, data, key, iv):
        key_bytes = key.encode('utf-8')
        iv_bytes = iv.encode('utf-8')
        text = json.dumps(data, separators=(',', ':')) if isinstance(data, (dict, list)) else str(data)
        padded_data = pad(text.encode('utf-8'), 16)
        cipher = AES.new(key_bytes, AES.MODE_CBC, iv_bytes)
        ciphertext = cipher.encrypt(padded_data)
        hex_str = ciphertext.hex().upper()
        return base64.b64encode(hex_str.encode('utf-8')).decode('utf-8')

    def aiting_md5(self, text):
        return hashlib.md5(text.encode('utf-8')).hexdigest()

    def aiting_generate_sign(self, params, key):
        sorted_keys = sorted(params.keys())
        sign_str = '&'.join([f"{k}={params[k]}" for k in sorted_keys])
        final_str = f"{sign_str}&key={key}"
        return self.aiting_md5(final_str)

    def aiting_timestamp(self):
        return str(int(time.time() * 1000))

    def aiting_nonce(self):
        return str(random.randint(100000, 999999))

    def aiting_generate_woid(self, imei):
        random6 = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        imei8 = imei[:8] if len(imei) >= 8 else imei.ljust(8, '0')
        random4 = ''.join(random.choices(string.ascii_letters + string.digits, k=4))
        random2 = ''.join(random.choices(string.ascii_letters + string.digits, k=2))
        return f"WOA{random6}{imei8}LOT{random4}LV{random2}"

    def aiting_calculate_clientconfirm(self, userid, imei):
        plaintext = f"android{userid}{imei}"
        return self.aiting_aes_encrypt(plaintext, AITING_AES_KEY, AITING_AES_IV)

    def aiting_calculate_passcode(self, timestamp, phone):
        return self.aiting_md5(timestamp + phone + AITING_CLIENT_KEY)

    def aiting_build_statisticsinfo(self, userid, useraccount, imei, clientconfirm):
        params = {
            'channelid': '28015001',
            'sid': ''.join(random.choices(string.ascii_letters + string.digits + "_-", k=20)),
            'eid': ''.join(random.choices(string.ascii_letters + string.digits + "_", k=20)),
            'osversion': 'Android12',
            'clientallid': '000000100000000000058.0.2.1225',
            'display': '2400_1080',
            'ip': '192.168.3.24',
            'nettypename': 'wifi',
            'version': '802',
            'versionname': '8.0.2',
            'terminalName': 'Redmi',
            'terminalType': 'Redmi_K30_Pro',
            'udid': 'null',
            'woid': self.aiting_generate_woid(imei),
            'useraccount': useraccount,
            'userid': userid,
            'clientconfirm': clientconfirm
        }
        return '&'.join([f"{k}={params[k]}" for k in params])

    def generate_random_imei(self):
        tac = ''.join([str(random.randint(0, 9)) for _ in range(8)])
        snr = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        imei_raw = tac + snr
        digits = [int(d) for d in imei_raw]
        for i in range(len(digits) - 1, -1, -2):
            digits[i] *= 2
            if digits[i] > 9: digits[i] -= 9
        total = sum(digits)
        check_digit = (10 - (total % 10)) % 10
        return imei_raw + str(check_digit)

    def aiting_woread_login(self, phone):
        access_token = "ODZERTZCMjA1NTg1MTFFNDNFMThDRDYw"
        token_enc = ""
        if self.token_online:
             token_enc = self.aiting_get_aes(self.token_online, WOREAD_KEY)
        else:
             self.log("阅读专区: 未找到 token_online，尝试仅使用手机号登录")
        phone_enc = self.aiting_get_aes(phone, WOREAD_KEY)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        if token_enc:
            inner_data = {
                "tokenOnline": token_enc,
                "phone": phone_enc,
                "timestamp": timestamp
            }
        else:
            inner_data = {
                "phone": phone_enc,
                "timestamp": timestamp
            }
        sign_result = self.aiting_get_aes(inner_data, WOREAD_KEY)
        url = "https://10010.woread.com.cn/ng_woread_service/rest/account/login"
        body = {"sign": sign_result}
        headers = {
            "User-Agent": "Mozilla/5.0 (Linux; Android 11; Redmi Note 10 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/92.0.4515.159 Mobile Safari/537.36",
            "accesstoken": access_token,
            "Content-Type": "application/json;charset=UTF-8",
            "Origin": "https://10010.woread.com.cn"
        }
        res = self.session.post(url, json=body, headers=headers).json()
        if res.get("code") == "0000":
            return res.get("data", {}).get("token")
        self.log(f"爱听登录: 沃阅读登录失败 - {response_summary(res)}")
        return None

    def aiting_get_jwt_token(self, statisticsinfo):
        timestamp = self.aiting_timestamp()
        sign_params = {
            'clientSource': '3',
            'clientId': 'android',
            'source': '3',
            'timestamp': timestamp
        }
        sign_val = self.aiting_generate_sign(sign_params, AITING_SIGN_KEY_APPKEY)
        client_id_const = "395DEDE9C1D6FE11B7C9C0D82B353E74"
        client_id_b64 = base64.b64encode(client_id_const.encode('utf-8')).decode('utf-8')
        body = {
            'clientSource': '3',
            'clientId': client_id_b64,
            'source': '3',
            'timestamp': timestamp,
            'sign': sign_val
        }
        url = f"{AITING_BASE_URL}/oauth/client/appkey"
        headers = {
            'Skip-Authorization-Check': 'true',
            'statisticsinfo': statisticsinfo,
            "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 12; Redmi K30 Pro Build/SKQ1.220303.001)"
        }
        try:
            res = self.session.post(url, json=body, headers=headers).json()
            if res.get("code") == "0000" and res.get("key"):
                return res.get("key")
            self.log(f"爱听登录: 获取JWT失败 - {response_summary(res)}")
        except Exception as e:
            self.log(f"爱听登录: 获取JWT异常: {e}")
        return None

    def aiting_api_login(self, phone, useraccount, jwt_token, statisticsinfo):
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        passcode = self.aiting_calculate_passcode(timestamp, phone)
        query_params_list = [
            'networktype=3', 'ua=Redmi+K30+Pro', 'isencode=false',
            'clientversion=8.0.2', 'versionname=Android_1_1080x2356',
            'channelid=28015001', 'userlabelisencode=0', 'validatecode=', 'sid=',
            f"timestamp={timestamp}", f"passcode={passcode}"
        ]
        query_str = '&'.join(query_params_list)
        final_account = useraccount
        url = f"{AITING_BASE_URL}/mainrest/rest/read/user/ulogin/3/{final_account}/1/1/0?{query_str}"
        req_time = self.aiting_timestamp()
        nonce = self.aiting_nonce()
        sign_params = {
            'jwt': jwt_token,
            'nonestr': nonce,
            'osversion': 'Android12',
            'terminalName': 'Redmi',
            'timestamp': req_time
        }
        sorted_keys = sorted(sign_params.keys())
        sign_str = '&'.join([f"{k}={sign_params[k]}" for k in sorted_keys])
        requertid = self.aiting_md5(f"{sign_str}&key={AITING_SIGN_KEY_REQUERTID}")
        headers = {
            'statisticsinfo': statisticsinfo,
            'requerttime': req_time,
            'nonestr': nonce,
            'requertid': requertid,
            'AuthorizationClient': f"Bearer {jwt_token}",
            'User-Agent': 'okhttp/4.9.0'
        }
        try:
            res = self.session.get(url, headers=headers).json()
            if res.get("code") == "0000" and res.get("message"):
                msg = res.get("message")
                token = msg.get("token")
                userid = msg.get("userid")
                if msg.get("accountinfo"):
                    token = msg.get("accountinfo", {}).get("token") or token
                    userid = msg.get("accountinfo", {}).get("userid") or userid
                return {"token": token, "userid": userid}
            self.log(f"爱听登录: 业务API登录失败 - {response_summary(res)}")
        except Exception as e:
            self.log(f"爱听登录: 业务API异常: {e}")
        return None

    def aiting_login_flow(self):
        self.log("爱听任务: 正在执行登录流程...")
        woread_token = self.aiting_woread_login(self.mobile)
        if not woread_token: return False
        self.aiting_woread_token = woread_token
        imei = self.generate_random_imei()
        userid = self.mobile
        useraccount = self.mobile
        clientconfirm = self.aiting_calculate_clientconfirm(userid, imei)
        statisticsinfo = self.aiting_build_statisticsinfo(userid, useraccount, imei, clientconfirm)
        self.aiting_statisticsinfo = statisticsinfo
        jwt = self.aiting_get_jwt_token(statisticsinfo)
        if not jwt: return False
        self.aiting_jwt = jwt
        login_data = self.aiting_api_login(self.mobile, useraccount, jwt, statisticsinfo)
        if not login_data: return False
        self.aiting_biz_token = login_data.get('token')
        self.aiting_base_userid = login_data.get('userid') or self.mobile
        self.log("爱听任务: 登录成功，Token已获取")
        biz_ticket = self.aiting_get_ticket()
        if biz_ticket:
            self.aiting_biz_ticket = biz_ticket
            return True
        return False

    def aiting_get_ticket(self):
        url = f"{AITING_BASE_URL}/activity/rest/unicom/points/getInfoTicket"
        timestamp = self.aiting_timestamp()
        sign_params = {
            "token": self.aiting_biz_token,
            "timestamp": timestamp,
            "userid": self.aiting_base_userid
        }
        sign_val = self.aiting_generate_sign(sign_params, AITING_SIGN_KEY_API)
        body = {
            "sign": sign_val,
            "timestamp": timestamp,
            "token": self.aiting_biz_token,
            "userid": self.aiting_base_userid
        }
        nonce = self.aiting_nonce()
        head_sign_params = {
            'jwt': self.aiting_jwt,
            'nonestr': nonce,
            'osversion': 'Android12',
            'terminalName': 'Redmi',
            'timestamp': timestamp
        }
        sorted_keys = sorted(head_sign_params.keys())
        sign_str = '&'.join([f"{k}={head_sign_params[k]}" for k in sorted_keys])
        final_sign_str = f"{sign_str}&key={AITING_SIGN_KEY_REQUERTID}"
        requertid = self.aiting_md5(final_sign_str)
        headers = {
            "AuthorizationClient": f"Bearer {self.aiting_jwt}",
            "statisticsinfo": self.aiting_statisticsinfo,
            "requerttime": timestamp,
            "nonestr": nonce,
            "requertid": requertid
        }
        try:
            res = self.session.post(url, json=body, headers=headers).json()
            if res.get("code") == "0000":
                msg = res.get("message", "")
                if "ticket=" in msg:
                    parsed = urlparse(msg)
                    params = parse_qs(parsed.query)
                    ticket = (params.get("ticket") or [""])[0]
                    distribute_id = (params.get("distributeId") or [""])[0]
                    pageid = (params.get("pageid") or params.get("pageID") or [""])[0]
                    if not pageid:
                        pageid = next((part for part in parsed.path.split("/") if part.startswith("s")), "")
                    if ticket:
                        self.aiting_distribute_id = distribute_id
                        self.aiting_pageid = pageid or "s789081246969976832"
                        return ticket
                return msg
            self.log(f"爱听登录: 获取Ticket失败 - {response_summary(res)}")
        except Exception as e:
            self.log(f"爱听登录: 获取Ticket异常: {e}")
        return None

    def jf_get_task_detail(self, ticket):
        url = "https://m.jf.10010.com/jf-external-application/jftask/taskDetail"
        headers = self.aiting_jf_headers()
        headers['Referer'] = f"https://m.jf.10010.com/jf-external-application/index.html?ticket={ticket}&pageID=s789081246969976832"
        try:
            response = self.session.post(url, json={}, headers=headers)
            self.update_aiting_jea_id(response)
        except Exception as e:
            self.log(f"爱听任务: 积分任务列表请求异常: {e}")
            return []
        if response is None:
            self.log("爱听任务: 积分任务列表无响应")
            return []
        try:
            res = response.json()
        except Exception:
            self.log(f"爱听任务: 积分任务列表响应非JSON (状态码{getattr(response, 'status_code', '未知')})")
            return []
        return res.get("data", {}).get("taskDetail", {}).get("taskList", [])

    def jf_to_finish(self, ticket, task_code):
        url = "https://m.jf.10010.com/jf-external-application/jftask/toFinish"
        try:
            response = self.session.post(
                url,
                json={'taskCode': task_code},
                headers=self.aiting_jf_headers(with_signature=True),
            )
            self.update_aiting_jea_id(response)
        except Exception as e:
            self.log(f"爱听任务: 积分任务提交异常: {e}")
            return False
        if response is None:
            self.log("爱听任务: 积分任务提交无响应")
            return False
        try:
            res = response.json()
        except Exception:
            self.log(f"爱听任务: 积分任务提交响应非JSON (状态码{getattr(response, 'status_code', '未知')})")
            return False
        self.log(f"爱听任务: 积分任务提交 - {response_summary(res)}")
        return isinstance(res, dict) and res.get('code') == "0000"

    def jf_sign(self, ticket, task_code):
        url = "https://m.jf.10010.com/jf-external-application/uasptask/sign"
        referer = (
            f"https://m.jf.10010.com/ts-mobile/well/{getattr(self, 'aiting_pageid', 's789081246969976832')}"
            f"?distributeId={getattr(self, 'aiting_distribute_id', '')}&partnersId=1706&clientType=aiting_ios&ticket={ticket}"
        )
        headers = self.aiting_jf_headers(with_signature=True)
        headers.update({"referer": referer, "origin": "https://m.jf.10010.com"})
        try:
            response = self.session.post(
                url,
                json={'taskCode': task_code, 'remindEnabled': '1'},
                headers=headers,
            )
            self.update_aiting_jea_id(response)
        except Exception as e:
            self.log(f"爱听任务: 积分签到异常: {e}")
            return False
        if response is None:
            self.log("爱听任务: 积分签到无响应")
            return False
        try:
            res = response.json()
        except Exception:
            self.log(f"爱听任务: 积分签到响应非JSON (状态码{getattr(response, 'status_code', '未知')})")
            return False
        if isinstance(res, dict) and res.get('code') == "0000":
            self.log(f"爱听任务: 积分签到 - {res.get('msg') or '成功'}")
            return True
        if isinstance(res, dict):
            self.log(f"爱听任务: 积分签到返回 - {res.get('desc') or res.get('msg') or response_summary(res)}")
        return False

    def jf_pop_up(self, ticket):
        url = "https://m.jf.10010.com/jf-external-application/jftask/popUp"
        try:
            response = self.session.post(url, json={}, headers=self.aiting_jf_headers())
            self.update_aiting_jea_id(response)
        except Exception as e:
            self.log(f"爱听任务: 积分弹窗请求异常: {e}")
            return {}
        if response is None:
            self.log("爱听任务: 积分弹窗无响应")
            return {}
        try:
            res = response.json()
        except Exception:
            self.log(f"爱听任务: 积分弹窗响应非JSON (状态码{getattr(response, 'status_code', '未知')})")
            return {}
        if isinstance(res, dict):
            if res.get('code') == "0000" and res.get('data', {}).get('score'):
                self.log(f"爱听任务: 获得 {res['data']['score']}", notify=True)
            elif res.get('code') != "0000":
                self.log(f"爱听任务: 积分弹窗返回 - {res.get('desc') or response_summary(res)}")
        return res

    def aiting_complete_task_api(self, type_val):
        timestamp = self.aiting_timestamp()
        nonce = self.aiting_nonce()
        sign_params = {'jwt': self.aiting_jwt, 'nonestr': nonce, 'osversion': 'Android12', 'terminalName': 'Redmi', 'timestamp': timestamp}
        sign_str = '&'.join([f"{k}={sign_params[k]}" for k in sorted(sign_params.keys())])
        requertid = self.aiting_md5(f"{sign_str}&key={AITING_SIGN_KEY_REQUERTID}")
        body_params = {'source': '3', 'timestamp': timestamp, 'token': self.aiting_woread_token, 'type': str(type_val), 'userid': self.aiting_base_userid}
        body_str = '&'.join([f"{k}={body_params[k]}" for k in sorted(body_params.keys())])
        sign = self.aiting_md5(f"{body_str}&key={AITING_SIGN_KEY_API}")
        url = f"{AITING_BASE_URL}/activity/rest/unicom/points/completiontask"
        payload = {**body_params, 'sign': sign}
        headers = {
            'AuthorizationClient': f"Bearer {self.aiting_jwt}",
            'requerttime': timestamp,
            'nonestr': nonce,
            'requertid': requertid,
            'statisticsinfo': self.aiting_statisticsinfo
        }
        self.session.post(url, json=payload, headers=headers)

    def aiting_get_secretkey(self):
        timestamp = self.aiting_timestamp()
        nonce = self.aiting_nonce()
        sign_params = {'jwt': self.aiting_jwt, 'nonestr': nonce, 'osversion': 'Android12', 'terminalName': 'Redmi', 'timestamp': timestamp}
        sign_str = '&'.join([f"{k}={sign_params[k]}" for k in sorted(sign_params.keys())])
        requertid = self.aiting_md5(f"{sign_str}&key={AITING_SIGN_KEY_REQUERTID}")
        url = f"https://woread.com.cn/rest/read/statistics/getsecretkey/3/{self.aiting_base_userid}"
        headers = {
            'AuthorizationClient': f"Bearer {self.aiting_jwt}",
            'requerttime': timestamp, 'nonestr': nonce, 'requertid': requertid,
            'statisticsinfo': self.aiting_statisticsinfo, 'User-Agent': 'okhttp/4.9.0'
        }
        params = {'token': self.aiting_woread_token}
        res = self.session.get(url, params=params, headers=headers).json()
        if res.get("code") == "0000":
            return res.get("message")
        return None

    def aiting_add_read_time(self, read_time_seconds):
        secretkey = self.aiting_get_secretkey()
        if not secretkey: return
        timestamp = self.aiting_timestamp()
        count_time_str = str(read_time_seconds * 1000)
        book_id = "4524960"
        data_obj = {
            "userid": self.aiting_base_userid,
            "counttime": count_time_str,
            "timestamp": timestamp,
            "secretkey": secretkey,
            "cntindex": book_id,
            "cnttype": 1,
            "readtype": 1
        }
        encrypted = self.aiting_aes_encrypt(data_obj, ADDREADTIME_AES_KEY, AITING_AES_IV)
        nonce = self.aiting_nonce()
        sign_params = {'jwt': self.aiting_jwt, 'nonestr': nonce, 'osversion': 'Android12', 'terminalName': 'Redmi', 'timestamp': timestamp}
        sign_str = '&'.join([f"{k}={sign_params[k]}" for k in sorted(sign_params.keys())])
        requertid = self.aiting_md5(f"{sign_str}&key={AITING_SIGN_KEY_REQUERTID}")
        url = f"https://woread.com.cn/rest/read/statistics/addreadtime/3/{encrypted}"
        random_uuid = str(uuid.uuid4()).replace('-', '')
        body = {
            "channelid": "28015001", "creadertime": datetime.now().strftime("%y%m%d%H%M%S"),
            "imei": self.generate_random_imei(),
            "list": { "cntindex": book_id, "cnttype": 1, "readtime": count_time_str, "readtype": 1 },
            "list1": [{ "cntindex": book_id, "cnttype": 1, "readtime": count_time_str, "readtype": 1 }],
            "listentimes": count_time_str, "uuid": random_uuid
        }
        headers = {
            'AuthorizationClient': f"Bearer {self.aiting_jwt}",
            'requerttime': timestamp, 'nonestr': nonce, 'requertid': requertid,
            'statisticsinfo': self.aiting_statisticsinfo, 'User-Agent': 'okhttp/4.9.0'
        }
        res = self.session.post(url, json=body, headers=headers)
        if res.status_code == 200:
             self.last_read_submission_time = time.time()
             self.log(f"爱听任务: 阅读时长上报成功 ({read_time_seconds}s)")

    def aiting_new_read_add(self):
        timestamp = self.aiting_timestamp()
        nonce = self.aiting_nonce()
        sign_params = {'jwt': self.aiting_jwt, 'nonestr': nonce, 'osversion': 'Android12', 'terminalName': 'Redmi', 'timestamp': timestamp}
        sign_str = '&'.join([f"{k}={sign_params[k]}" for k in sorted(sign_params.keys())])
        requertid = self.aiting_md5(f"{sign_str}&key={AITING_SIGN_KEY_REQUERTID}")
        url = f"https://woread.com.cn/rest/read/new/newreadadd/3/{self.aiting_base_userid}/{self.aiting_woread_token}"
        params = {'isfreeLimt': '0', 'isgray': 'true'}
        body = {"source": 3, "cntindex": "4524960", "chapterallindex": "100136247350", "readtype": 3}
        headers = {
             'AuthorizationClient': f"Bearer {self.aiting_jwt}", 'requerttime': timestamp, 'nonestr': nonce, 'requertid': requertid, 'statisticsinfo': self.aiting_statisticsinfo, 'User-Agent': 'Redmi K30 Pro'
        }
        self.session.post(url, params=params, json=body, headers=headers)

    def aiting_task(self, is_query_only=False):
        self.log("==== 联通爱听 ====")
        if not self.aiting_login_flow():
            self.log("爱听任务: 登录失败，跳过")
            return
        self.log("爱听任务: 登录成功，正在获取任务列表...")
        try:
            self.aiting_query_integral()
        except: pass
        task_list = self.jf_get_task_detail(self.aiting_biz_ticket)
        safe_tasks = [t for t in task_list if "邀请" not in t.get('taskName', '')]
        if safe_tasks:
            self.log(f"爱听任务: 提取到 {len(safe_tasks)} 个任务")
        done_list = [t for t in safe_tasks if int(t.get('finish') or 0) == 1]
        printed_names = set()
        for t in done_list:
             name = t.get('taskName')
             if name not in printed_names:
                 self.log(f"爱听任务: 已完成[{name}] {t.get('finishCount')}/{t.get('needCount')}")
                 printed_names.add(name)
        self.log(f"爱听任务: 执行前完成 {len(done_list)}/{len(safe_tasks)} 个任务")
        if not safe_tasks:
            self.log("爱听任务: ✅ 所有任务已完成")
            if is_query_only:
                self.log("爱听任务: [查询模式] 跳过任务执行...")
            return
        self.log(f"爱听任务: 尝试执行 {len(safe_tasks)} 个任务")
        if is_query_only:
            self.log("爱听任务: [查询模式] 跳过任务执行...")
            return
        for task in safe_tasks:
            task_code = task.get('taskCode')
            if not task_code:
                continue
            task_type = str(task.get('taskType', ''))
            self.log(f"爱听任务: 执行[{task.get('taskName')}] 类型 {task_type or '未知'}")
            if task_type == '4' or "签到" in task.get('taskName', ''):
                self.jf_sign(self.aiting_biz_ticket, task_code)
            else:
                self.jf_to_finish(self.aiting_biz_ticket, task_code)
            time.sleep(random.uniform(1, 2))
        self.log("爱听任务: 开始提交完成任务请求")
        for _ in range(5):
            self.aiting_complete_task_api(4)
            time.sleep(random.uniform(1, 2))
        if getattr(self, 'aiting_jwt', None) and getattr(self, 'aiting_woread_token', None):
            self.aiting_new_read_add()
            time.sleep(2)
            self.aiting_add_read_time(120)
        self.jf_pop_up(self.aiting_biz_ticket)
        after_tasks = [t for t in self.jf_get_task_detail(self.aiting_biz_ticket) if "邀请" not in t.get('taskName', '')]
        after_done = [t for t in after_tasks if int(t.get('finish') or 0) == 1]
        self.log(f"爱听任务: 执行后完成 {len(after_done)}/{len(after_tasks)} 个任务")
        for t in after_tasks:
            self.log(f"爱听任务: {t.get('taskName')} - {t.get('finishCount')}/{t.get('needCount')} finish={t.get('finish')}")
        try:
            self.aiting_query_integral()
        except: pass

    def wostore_cloud_get_ticket(self):
        if not getattr(self, 'ecs_token', ''):
            self.log("沃云手机: 缺少 ecs_token，无法获取入口 Ticket")
            return ""
        city_code = ""
        if self.city_info and isinstance(self.city_info, list):
            city_code = str((self.city_info[0] or {}).get("cityCode") or "")
        headers = {
            "User-Agent": "ChinaUnicom4.x/12.11 (com.chinaunicom.mobilebusiness; build:36; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.1100}",
            "Accept": "*/*",
            "Accept-Encoding": "gzip;q=1.0, compress;q=0.5",
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept-Language": "zh-Hans-CN;q=1.0, en-CN;q=0.9",
            "Cookie": (
                f"ecs_token={self.ecs_token};t3_token={getattr(self, 't3_token', '')};"
                f"PvSessionId={datetime.now().strftime('%Y%m%d%H%M%S')}{self.uuid};devicedId={self.uuid};"
                f"c_mobile={self.account_mobile or self.mobile};c_version=iphone_c@12.1100;city=036|{city_code}|90063345|-99;"
            ),
        }
        try:
            res = self.session.get(
                "https://m.client.10010.com/edop_ng/getTicketByNative",
                params={"token": self.ecs_token, "appId": "edop_unicom_68e8fa69"},
                headers=headers,
                timeout=20,
            ).json()
            if res.get("rsp_code") == "0000" and res.get("ticket"):
                return res.get("ticket")
            self.log(f"沃云手机: 获取入口 Ticket 失败 - {res.get('rsp_desc') or res.get('msg') or pretty_json(res)}")
        except Exception as e:
            self.log(f"沃云手机: 获取入口 Ticket 异常 {e}")
        return ""

    def wostore_cloud_login(self, ticket):
        try:
            res = self.session.post(
                "https://uphone.wostore.cn/h5api/token-service/getTokenByTicket",
                data=json.dumps({"ticket": ticket, "channel": "ST-Kuaidai001"}),
                headers={
                    "User-Agent": "ChinaUnicom4.x/12.11 (com.chinaunicom.mobilebusiness; build:36; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.1100}",
                    "Accept": "*/*",
                    "Accept-Encoding": "gzip;q=1.0, compress;q=0.5",
                    "Content-Type": "application/json",
                    "channel": "ST-Kuaidai001",
                    "X-Tingyun": "c=A|uBuVhVARE0A",
                    "source": "4",
                    "os": "H5",
                    "Accept-Language": "zh-Hans-CN;q=1.0, en-CN;q=0.9",
                    "channelCode": "ST-Kuaidai001",
                },
                timeout=20,
                verify=False,
            ).json()
            if str(res.get("code")) == "200" and res.get("data"):
                self.log("沃云手机: 云手机Token获取成功")
                return {"cloud_token": res.get("data")}
            self.log(f"沃云手机: 获取Token失败 - {res.get('msg') or pretty_json(res)}")
        except Exception as e:
            self.log(f"沃云手机: 登录异常 {e}")
        return None

    def wostore_cloud_h5_headers(self, cloud_token=None):
        return {
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.57(0x18003930) NetType/WIFI Language/zh_CN",
            "Host": "h5forphone.wostore.cn",
            "X-Requested-With": "XMLHttpRequest",
            **({"Authorization": cloud_token} if cloud_token else {}),
        }

    def wostore_cloud_activity_headers(self, user_token=""):
        return {
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.57(0x18003930) NetType/WIFI Language/zh_CN",
            "Host": "uphone.wostore.cn",
            "Origin": "https://uphone.wostore.cn",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "X-USR-TOKEN": user_token,
        }

    def wostore_cloud_headers(self, user_token):
        return {
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0601};ltst;OSVersion/16.6",
            "Authorization": user_token,
        }

    def wostore_cloud_bucp_get(self, path, user_token):
        url = f"https://uphone.wo-adv.cn/bucp{path}"
        try:
            return self.session.get(url, headers=self.wostore_cloud_headers(user_token), timeout=WOSTORE_CLOUD_TIMEOUT).json()
        except Exception as e:
            self.log(f"沃云手机: 请求异常 {e}")
            return {}

    def wostore_cloud_bucp_post(self, path, user_token, payload=None):
        url = f"https://uphone.wo-adv.cn/bucp{path}"
        try:
            return self.session.post(url, json=payload or {}, headers=self.wostore_cloud_headers(user_token), timeout=WOSTORE_CLOUD_TIMEOUT).json()
        except Exception as e:
            self.log(f"沃云手机: 请求异常 {e}")
            return {}

    def wostore_cloud_activity_post(self, path, payload, user_token="", label="云手机请求"):
        url = f"https://uphone.wostore.cn{path}"
        try:
            return self.session.post(
                url,
                data=json.dumps(payload, ensure_ascii=False),
                headers=self.wostore_cloud_activity_headers(user_token),
                timeout=WOSTORE_CLOUD_TIMEOUT,
            ).json()
        except Exception as e:
            self.log(f"沃云手机: {label}异常 {e}")
            return {}

    def wostore_cloud_user_info(self, cloud_token):
        res = self.wostore_cloud_bucp_get("/servers/system/user/getAppUserInfo", cloud_token)
        if str(res.get("code")) == "200":
            data = res.get("data") or {}
            name = data.get("nickName") or data.get("userName") or data.get("phoneNumber") or data.get("mobile")
            if name:
                self.log(f"沃云手机: 当前用户 {mask_str(name)}")
        else:
            self.log(f"沃云手机: 用户信息查询失败 - {res.get('msg') or pretty_json(res)}")
        return res

    def wostore_cloud_point_info(self, cloud_token):
        res = self.wostore_cloud_bucp_get("/servers/order/user-point/point-info", cloud_token)
        if str(res.get("code")) == "200":
            data = res.get("data") or {}
            point = data.get("balanceScoreNum") or data.get("totalPoint") or data.get("point") or data.get("availablePoint")
            if point is not None:
                self.log(f"沃云手机: 当前积分 {point}", notify=True)
        else:
            self.log(f"沃云手机: 积分查询失败 - {res.get('msg') or pretty_json(res)}")
        return res

    def wostore_cloud_sign(self, cloud_token):
        res = self.session.post(
            "https://h5forphone.wostore.cn/h5forphone/activity/signIn",
            data=json.dumps({"accesstoken": cloud_token}),
            headers=self.wostore_cloud_h5_headers(cloud_token),
            timeout=WOSTORE_CLOUD_TIMEOUT,
        ).json()
        self.log(f"沃云手机: 签到：{res.get('msg', '未知')}", notify=True)
        return res

    def wostore_cloud_sign_rewards(self, cloud_token):
        res = self.session.post(
            "https://h5forphone.wostore.cn/h5forphone/activity/signInRightList",
            data=json.dumps({"accesstoken": cloud_token}),
            headers=self.wostore_cloud_h5_headers(cloud_token),
            timeout=WOSTORE_CLOUD_TIMEOUT,
        ).json()
        for item in (res.get("data") or {}).get("goodsList", []):
            if item.get("state") == "":
                self.wostore_cloud_receive_sign_reward(cloud_token, item.get("name", ""), item.get("activityOrderId", ""))
        return res

    def wostore_cloud_receive_sign_reward(self, cloud_token, name, order_id):
        payload = {"accesstoken": cloud_token, "activityOrderid": order_id, "account": "", "accountType": ""}
        res = self.session.post(
            "https://h5forphone.wostore.cn/h5forphone/activity/raffleSignIn",
            data=json.dumps(payload),
            headers=self.wostore_cloud_h5_headers(cloud_token),
            timeout=WOSTORE_CLOUD_TIMEOUT,
        ).json()
        self.log(f"沃云手机: 领取{name}：{res.get('msg', '未知')}", notify=True)
        return res

    def wostore_cloud_activity_login(self, cloud_token, activity_code, login_activity_id=None):
        res = self.wostore_cloud_activity_post(
            "/h5api/activity-service/user/login",
            {"identityType": "cloudPhoneLogin", "code": cloud_token, "activityId": login_activity_id or WOSTORE_CLOUD_LOGIN_ACTIVITY_ID, "device": "device"},
            "",
            "获取云任务token",
        )
        token = (res.get("data") or {}).get("user_token") or ""
        if token:
            self.log("沃云手机: 云任务Token获取成功")
        else:
            self.log(f"沃云手机: 云任务Token获取失败 - {res.get('msg') or pretty_json(res)}")
        return token

    def wostore_cloud_points_sign(self, user_token, sign_code):
        if not sign_code:
            return {}
        res = self.wostore_cloud_activity_post(
            "/h5api/activity-service/points/v1/sign",
            {"activityCode": sign_code},
            user_token,
            "积分签到",
        )
        self.log(f"沃云手机: 积分签到：{res.get('msg', '未知')}", notify=True)
        return res

    def wostore_cloud_task_list(self, user_token, activity_code):
        res = self.wostore_cloud_activity_post(
            "/h5api/activity-service/user/task/list",
            {"activityCode": activity_code},
            user_token,
            "查询任务列表",
        )
        data = res.get("data") or {}
        task_list = data.get("taskList") or data.get("list") or data.get("tasks") or res.get("taskList") or []
        self.log(f"沃云手机: 活动[{activity_code}]查询到 {len(task_list)} 个任务")
        if not task_list:
            self.log(f"沃云手机: 活动[{activity_code}]无可执行任务 - {response_summary(res)}")
            return res
        done = 0
        for task in task_list:
            name = task.get("taskName", "未知任务")
            code = task.get("taskCode", "")
            status = str(task.get("status") or task.get("taskStatus") or task.get("state") or "").upper()
            if status in {"OBTAINED", "RECEIVED", "FINISHED", "DONE"}:
                done += 1
                self.log(f"沃云手机: 已完成[{name}]")
            elif status in {"UNCLAIMED", "CLAIMABLE", "COMPLETED", "FINISH"}:
                self.log(f"沃云手机: 领取[{name}]奖励")
                self.wostore_cloud_receive_task(user_token, activity_code, code)
            else:
                self.log(f"沃云手机: 执行[{name}] 状态 {status or '未知'}")
                self.wostore_cloud_finish_task(user_token, activity_code, task)
        self.log(f"沃云手机: 活动[{activity_code}]执行前已完成 {done}/{len(task_list)} 个任务")
        return res

    def wostore_cloud_finish_task(self, user_token, activity_code, task):
        task_code = task.get("taskCode", "")
        task_name = task.get("taskName") or task.get("taskDesc") or task_code
        log_code_map = {
            "0127-006": "012-4",
        }
        res = self.wostore_cloud_activity_post(
            "/h5api/activity-service/user/task/logs",
            {
                "logType": "01",
                "logCode": log_code_map.get(task_code, task_code),
                "logSource": "01",
                "logDetail": task_name,
            },
            user_token,
            "完成任务",
        )
        self.log(f"沃云手机: 任务状态：{res.get('msg', '未知')}")
        time.sleep(2)
        self.wostore_cloud_receive_task(user_token, activity_code, task_code)
        return res

    def wostore_cloud_receive_task(self, user_token, activity_code, task_code):
        res = self.wostore_cloud_activity_post(
            "/h5api/activity-service/user/task/raffle/get",
            {"activityCode": activity_code, "taskCode": task_code},
            user_token,
            "领取任务奖励",
        )
        self.log(f"沃云手机: 奖励领取结果：{res.get('msg', '未知')}", notify=True)
        return res

    def wostore_cloud_lottery_count(self, user_token, activity_code):
        res = self.wostore_cloud_activity_post(
            "/h5api/activity-service/user/task/list",
            {"activityCode": activity_code},
            user_token,
            "查询抽奖次数",
        )
        data = res.get("data") or {}
        count = int(data.get("rafflesLeftCount") or data.get("raffleLeftCount") or data.get("lotteryLeftCount") or res.get("rafflesLeftCount") or res.get("raffleLeftCount") or 0)
        self.log(f"沃云手机: 活动[{activity_code}]剩余抽奖次数：{count}")
        return count

    def wostore_cloud_draw(self, user_token, activity_code):
        res = self.wostore_cloud_activity_post(
            "/h5api/activity-service/lottery",
            {"activityCode": activity_code},
            user_token,
            "抽奖",
        )
        prize = (res.get("data") or {}).get("prizeName") or res.get("msg") or "未知奖励"
        self.log(f"沃云手机: 抽奖获得：{prize}", notify=True)
        return res

    def wostore_points_history_has_prize(self, user_token, goods_id):
        try:
            res = self.session.get(
                f"https://uphone.wostore.cn/h5api/activity-service/points/v1/lottery/history?page=1&pageSize=10&goodsId={goods_id}",
                headers=self.wostore_cloud_activity_headers(user_token),
                timeout=WOSTORE_CLOUD_TIMEOUT,
            ).json()
            today = datetime.now().strftime("%Y-%m-%d")
            data = res.get("data") or {}
            records = data if isinstance(data, list) else data.get("records", []) or data.get("list", [])
            for item in records:
                if str(item.get("createTime") or item.get("drawTime") or "").startswith(today) and item.get("prizeName"):
                    return True
        except Exception as e:
            self.log(f"沃云手机: 积分抽奖记录查询异常 {e}")
        return False

    def wostore_points_exchange_remain(self, user_token, goods_id):
        try:
            res = self.session.get(
                f"https://uphone.wostore.cn/h5api/activity-service/points/v1/exchange/list?activityCode={WOSTORE_POINTS_ACT_CODE}",
                headers=self.wostore_cloud_activity_headers(user_token),
                timeout=WOSTORE_CLOUD_TIMEOUT,
            ).json()
            data = res.get("data") or {}
            goods_list = data if isinstance(data, list) else data.get("goodsList", []) or data.get("list", [])
            for item in goods_list:
                if str(item.get("goodsId")) == str(goods_id):
                    remain = safe_int(item.get("remainUser") or item.get("remainCount") or item.get("surplusCount"), 0)
                    self.log(f"沃云手机: 积分商品[{goods_id}]剩余次数：{remain}")
                    return remain
        except Exception as e:
            self.log(f"沃云手机: 积分兑换列表查询异常 {e}")
        return 0

    def wostore_points_lottery(self, user_token, goods_id):
        res = self.wostore_cloud_activity_post(
            "/h5api/activity-service/points/v1/lottery",
            {"activityCode": WOSTORE_POINTS_ACT_CODE, "goodsId": goods_id},
            user_token,
            "积分抽奖",
        )
        results = (res.get("data") or {}).get("results") or []
        if not results and res.get("data"):
            results = [res.get("data")]
        prizes = [str(item.get("prizeName") or "未知") for item in results]
        label = "积分单抽" if str(goods_id) == str(WOSTORE_POINTS_GOODS_ID_1) else "积分10连抽"
        self.log(f"沃云手机: {label}：{res.get('msg') or '、'.join(prizes) or '未知'}", notify=True)
        return any(WOSTORE_POINTS_STOP_PRIZE in prize for prize in prizes)

    def wostore_cloud_device_status(self, cloud_token):
        res = self.wostore_cloud_bucp_get("/servers/resource/instance/list?pageNum=1&pageSize=200", cloud_token)
        rows = res.get("rows") or (res.get("data") or {}).get("rows") or []
        for device in rows:
            device_id = device.get("id") or device.get("deviceId") or ""
            status = device.get("status", "?")
            if status == "running":
                self.log("沃云手机: 设备运行正常")
            elif status == "pre_create":
                self.wostore_cloud_device_action(cloud_token, "/servers/resource/instance/cpInstanceAction", {"action": "allot", "cpInstanceId": device_id}, "激活设备")
            else:
                self.wostore_cloud_device_action(cloud_token, "/servers/resource/backup/recover", {"cpInstanceId": device_id}, "恢复设备")
        return res

    def wostore_cloud_device_action(self, cloud_token, path, payload, label):
        res = self.wostore_cloud_bucp_post(path, cloud_token, payload)
        self.log(f"沃云手机: {label}结果：{res.get('msg', '未知')}")
        return res

    def wostore_cloud_task(self, is_query_only=False):
        self.log("==== 沃云手机 ====")
        if is_query_only:
             self.log("沃云手机: [查询模式] 此平台暂无资产或余额可供查询", notify=True)
             return
        ticket = self.wostore_cloud_get_ticket()
        if not ticket:
             self.log("沃云手机: 获取入口 Ticket 失败 (为空)")
             return
        tokens = self.wostore_cloud_login(ticket)
        if not tokens:
            self.log("沃云手机: 登录失败，跳过后续任务")
            return
        cloud_token = tokens["cloud_token"]
        self.wostore_cloud_user_info(cloud_token)
        self.wostore_cloud_sign(cloud_token)
        time.sleep(3)
        self.wostore_cloud_sign_rewards(cloud_token)
        points_user_token = ""
        for activity_code in WOSTORE_CLOUD_ACTIVITY_CODES:
            user_token = self.wostore_cloud_activity_login(cloud_token, activity_code)
            if not user_token:
                continue
            if not points_user_token:
                points_user_token = user_token
            self.wostore_cloud_points_sign(user_token, WOSTORE_CLOUD_SIGN_CODE)
            self.wostore_cloud_task_list(user_token, activity_code)
        # 抽奖: 使用抽奖专用活动码 (先做该活动专属任务, 再查次数抽奖)
        for lottery_code in WOSTORE_LOTTERY_ACTIVITY_CODES:
            lottery_token = self.wostore_cloud_activity_login(cloud_token, lottery_code, login_activity_id=lottery_code)
            if not lottery_token:
                continue
            self.wostore_cloud_task_list(lottery_token, lottery_code)
            for _ in range(self.wostore_cloud_lottery_count(lottery_token, lottery_code)):
                self.wostore_cloud_draw(lottery_token, lottery_code)
                time.sleep(3)
        if points_user_token:
            if self.wostore_points_history_has_prize(points_user_token, WOSTORE_POINTS_GOODS_ID_1):
                self.log("沃云手机: 今日已中奖，跳过积分单抽")
            else:
                for _ in range(min(self.wostore_points_exchange_remain(points_user_token, WOSTORE_POINTS_GOODS_ID_1), WOSTORE_POINTS_MAX_DRAW)):
                    if self.wostore_points_lottery(points_user_token, WOSTORE_POINTS_GOODS_ID_1):
                        break
                    time.sleep(3)
            for _ in range(min(self.wostore_points_exchange_remain(points_user_token, WOSTORE_POINTS_GOODS_ID_10), WOSTORE_POINTS_MAX_DRAW)):
                self.wostore_points_lottery(points_user_token, WOSTORE_POINTS_GOODS_ID_10)
                time.sleep(3)
        self.wostore_cloud_point_info(cloud_token)
        self.wostore_cloud_device_status(cloud_token)

    def regional_task(self, is_query_only=False):
        """区域专区任务入口"""
        is_xinjiang = False
        is_henan = False
        is_yunnan = False
        is_liaoning = False
        is_anhui = False
        if hasattr(self, 'city_info') and self.city_info and isinstance(self.city_info, list):
            try:
                for city in self.city_info:
                    pro_name = city.get('proName', '')
                    if "新疆" in pro_name: is_xinjiang = True
                    if "河南" in pro_name: is_henan = True
                    if "云南" in pro_name: is_yunnan = True
                    if "辽宁" in pro_name: is_liaoning = True
                    if "安徽" in pro_name: is_anhui = True
            except: pass
        rc = globalConfig.get("regional_config", {})
        if is_query_only:
            self.log("==== 区域专区 (查询模式) ====")
            if is_xinjiang:
                self.log("新疆专区: [查询模式] 跳过每日打卡，尝试查询每月抽奖记录")
                try:
                    ticket_res = self.openPlatLineNew("https://zy100.xj169.com/touchpoint/openapi/jumpHandRoom1G?source=155&type=02")
                    if ticket_res and ticket_res.get("ticket"):
                        token = self.xj_get_token(ticket_res.get("ticket"))
                        if token:
                            self.xj_query_monthly_draw_records(token)
                except Exception as e:
                    self.log(f"新疆专区: [查询模式] 查询每月抽奖记录异常 {e}")
            if is_henan:
                is_signed = self.shangdu_get_sign_status()
                if is_signed is True:
                    self.log("河南商都: [状态查询] 今日已签到")
                elif is_signed is False:
                    self.log("河南商都: [状态查询] 今日未签到")
                else:
                    self.log("河南商都: [状态查询] 查询失败")
            if is_yunnan:
                self.yunnan_life_task(is_query_only=True)
            if is_liaoning:
                self.ln_flmf_task(is_query_only=True)
            if is_anhui and AH_FRIDAY_AMOUNT:
                self.log(f"安徽超级星期五: [查询模式] 目标面额{AH_FRIDAY_AMOUNT}元 (仅周五10点执行)")
            return
        if is_xinjiang:
            self.log("==== 新疆专区 ====")
            self.xj_task_main()
        if is_henan:
            self.log("==== 河南商都 ====")
            self.shangdu_task_main()
        if is_yunnan:
            self.log("==== 云南生活 ====")
            self.yunnan_life_task()
        if is_liaoning:
            self.log("==== 辽宁福利魔方 ====")
            self.ln_flmf_task()
        if is_anhui and AH_FRIDAY_AMOUNT and rc.get("run_ah_friday", True):
            self.log("==== 安徽超级星期五 ====")
            self.ah_friday_task()

    def yunnan_life_base_headers(self, token=None, extra=None):
        headers = {
            "Referer": "https://wsm.wx.yn10010.com/",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Content-Type": "application/json;charset=UTF-8",
            "Accept-Language": "zh-CN,en-US;q=0.8",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.1001};ltst;OSVersion/16.6",
        }
        if token:
            headers["token"] = token
        if extra:
            headers.update(extra)
        return headers

    def yunnan_life_calc_sign(self, payload):
        parts = []
        for key in sorted(payload.keys()):
            value = payload[key]
            if isinstance(value, dict):
                encoded = quote(json.dumps(value, ensure_ascii=False, separators=(',', ':')), safe="")
            else:
                encoded = quote(str(value), safe="")
            parts.append(f"{key}={encoded}")
        raw = "&".join(parts).lower() + YUNNAN_LIFE_SIGN_SALT
        return hashlib.md5(hashlib.md5(raw.encode('utf-8')).hexdigest().encode('utf-8')).hexdigest()

    def yunnan_life_signed_headers(self, token, payload):
        return self.yunnan_life_base_headers(token, {
            "Origin": YUNNAN_LIFE_BASE_URL,
            "accessKeyId": YUNNAN_LIFE_ACCESS_KEY,
            "time": str(round(time.time() * 1000)),
            "sign": self.yunnan_life_calc_sign(payload),
        })

    def yunnan_life_get_ticket(self):
        if not self.ecs_token:
            return None
        try:
            res = self.session.get(
                "https://m.client.10010.com/mobileService/openPlatform/openPlatLineNew.htm",
                params={
                    "to_url": YUNNAN_LIFE_TO_URL,
                    "amp;s": "100000425",
                    "amp;boothCode": "YN-QCQYCS245",
                    "amp;boothAccessMode": "24",
                },
                headers={
                    "Cookie": f"ecs_token={self.ecs_token}",
                    "Referer": "https://wsm.wx.yn10010.com/",
                    "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Site": "cross-site",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "User-Agent": self.yunnan_life_base_headers().get("User-Agent"),
                },
                allow_redirects=False,
                timeout=15,
            )
            location = res.headers.get("Location", "")
            match = re.search(r'ticket=([^&]+)', location)
            return match.group(1) if match else None
        except Exception as e:
            self.log(f"云南生活: 获取 ticket 异常: {e}")
            return None

    def yunnan_life_get_token(self, ticket):
        if not ticket:
            return None
        try:
            resp = self.session.get(
                f"{YUNNAN_LIFE_BASE_URL}/2b2c-mobile/getPhoneNumber",
                params={"ticket": ticket},
                headers=self.yunnan_life_base_headers(extra={"Content-Type": "application/json;charset=gb2312"}),
                timeout=15,
            )
            token = resp.headers.get("token") or resp.headers.get("Token")
            if not token:
                try:
                    data = resp.json()
                except Exception:
                    data = {}
                token = data.get("token") or data.get("data", {}).get("token")
            if not token:
                self.log(f"云南生活: 未找到 token，响应: {resp.text[:160]}")
                return None
            return token if str(token).startswith("Bearer ") else f"Bearer {token}"
        except Exception as e:
            self.log(f"云南生活: 获取 token 异常: {e}")
            return None

    def yunnan_life_login(self):
        ticket = self.yunnan_life_get_ticket()
        if not ticket:
            self.log("云南生活: 获取 ticket 失败")
            return None
        token = self.yunnan_life_get_token(ticket)
        if not token:
            self.log("云南生活: 获取 token 失败")
            return None
        return token

    def yunnan_life_do_task(self, token, payload):
        task_name = payload.get("taskName", payload.get("taskCode", "未知任务"))
        try:
            res = self.session.post(
                f"{YUNNAN_LIFE_BASE_URL}/2b2c-mobile/activity/task/addTaskUser",
                data=json.dumps(payload, ensure_ascii=False, separators=(',', ':')),
                headers=self.yunnan_life_signed_headers(token, payload),
                timeout=15,
            ).json()
            if res.get("resultCode") == "0000":
                self.log(f"云南生活: ✅ {task_name}")
            else:
                self.log(f"云南生活: ❌ {task_name}: {res.get('resultMsg', '')}")
        except Exception as e:
            self.log(f"云南生活: [{task_name}] 异常: {e}")

    def yunnan_life_do_lottery(self, token, times=2):
        payload = {"actId": YUNNAN_LIFE_ACT_ID, "boothCode": ""}
        headers = self.yunnan_life_base_headers(token, {"Origin": YUNNAN_LIFE_BASE_URL})
        for i in range(times):
            try:
                res = self.session.post(
                    f"{YUNNAN_LIFE_BASE_URL}/2b2c-mobile/acttmpl/lottery/actLuckyDrawy",
                    data=json.dumps(payload, ensure_ascii=False, separators=(',', ':')),
                    headers=headers,
                    timeout=15,
                ).json()
                if res.get("resultCode") == "0000":
                    self.log(f"云南生活: ✅ 第{i + 1}次抽奖请求成功")
                else:
                    self.log(f"云南生活: ❌ 第{i + 1}次抽奖失败: {res.get('resultMsg', '')}")
            except Exception as e:
                self.log(f"云南生活: 第{i + 1}次抽奖异常: {e}")
            if i < times - 1:
                time.sleep(2)

    def yunnan_life_get_lottery_results(self, token):
        try:
            resp = self.session.get(
                f"{YUNNAN_LIFE_BASE_URL}/2b2c-mobile/acttmpl/lottery/getUserRecordListActInfo",
                params={"actId": YUNNAN_LIFE_ACT_ID, "periodId": YUNNAN_LIFE_ACT_ID},
                headers=self.yunnan_life_base_headers(token, {"Content-Type": "application/json;charset=gb2312"}),
                timeout=15,
            )
            data = resp.json()
            today = datetime.now().strftime("%Y-%m-%d")
            awards = []
            for item in data.get("data", {}).get("recordList", []):
                if str(item.get("createTime", "")).startswith(today):
                    awards.append(item.get("awardName", "未知"))
            if awards:
                for award in awards:
                    self.log(f"云南生活: 🎁 抽奖结果 - {award}", notify=True)
            else:
                self.log("云南生活: 今日暂无抽奖记录")
        except Exception as e:
            self.log(f"云南生活: 查询抽奖结果异常: {e}")

    def yunnan_life_get_bean_balance(self, token):
        try:
            payload = {}
            res = self.session.post(
                f"{YUNNAN_LIFE_BASE_URL}/user/beans/api/getTotalAvailableBeansByPhone",
                data=json.dumps(payload, ensure_ascii=False, separators=(',', ':')),
                headers=self.yunnan_life_signed_headers(token, payload),
                timeout=15,
            ).json()
            if res.get("resultCode") == "0000":
                self.log(f"云南生活: 💰 当前云豆余额: {res.get('data', 0)}", notify=True)
            else:
                self.log(f"云南生活: 获取云豆失败: {res.get('resultMsg', '')}")
        except Exception as e:
            self.log(f"云南生活: 查询云豆异常: {e}")

    def yunnan_life_task(self, is_query_only=False):
        token = self.yunnan_life_login()
        if not token:
            return
        if is_query_only:
            self.log("云南生活: [查询模式] 查询云豆余额")
            self.yunnan_life_get_bean_balance(token)
            return
        for task in YUNNAN_LIFE_TASKS:
            self.yunnan_life_do_task(token, task)
            time.sleep(2)
        self.yunnan_life_do_lottery(token, times=2)
        self.yunnan_life_get_lottery_results(token)
        self.yunnan_life_get_bean_balance(token)

    def xj_task_main(self):
        ticket_res = self.openPlatLineNew("https://zy100.xj169.com/touchpoint/openapi/jumpHandRoom1G?source=155&type=02")
        if not ticket_res or not ticket_res.get("ticket"):
            self.log("新疆专区: 获取入口 ticket 失败")
            return
        token = self.xj_get_token(ticket_res.get("ticket"))
        if token:
            self.xj_do_draw(token, "Jan2026Act")
            day = datetime.now().day
            if 19 <= day <= 25:
                self.xj_usersday_task(token)
            self.xj_monthly_draw_task(token)

    def xj_get_token(self, ticket):
        try:
            url = "https://zy100.xj169.com/touchpoint/openapi/getTokenAndCity"
            if isinstance(ticket, dict):
                ticket = ticket.get("ticket")
            data = {"ticket": ticket}
            headers = {
                "Referer": f"https://zy100.xj169.com/touchpoint/openapi/jumpHandRoom1G?source=155&type=02&ticket={ticket}",
                "User-Agent": XJ_USER_AGENT,
            }
            res = self.session.post(url, data=data, headers=headers).json()
            result = res.get('result', {})
            if result.get('code') == 0 and result.get('data', {}).get('token'):
                return result.get('data', {}).get('token')
            token = res.get("data", {}).get("token")
            if token:
                return token
            return None
        except Exception as e:
            self.log(f"新疆专区: 获取 token 异常 {e}")
            return None

    def xj_do_draw(self, token, act_id):
        try:
            url = f"https://zy100.xj169.com/touchpoint/openapi/marchAct/draw_{act_id}"
            data = {"activityId": f"daka{act_id}", "prizeId": ""}
            headers = {"userToken": token, "User-Agent": XJ_USER_AGENT}
            res = self.session.post(url, data=data, headers=headers).json()
            msg = res.get('result', {}).get('msg') or res.get('result', {}).get('data') or "失败"
            self.log(f"新疆专区: 每日打卡 - {msg}", notify=True)
        except Exception as e:
            self.log(f"新疆专区: 打卡异常 {e}")

    def xj_usersday_task(self, token):
        try:
            url = "https://zy100.xj169.com/touchpoint/openapi/marchAct/draw_UsersDay2025Act"
            data = {"activityId": "usersDay2025Act", "prizeId": "hfq_twenty"}
            headers = {"userToken": token, "User-Agent": XJ_USER_AGENT}
            res = self.session.post(url, data=data, headers=headers).json()
            msg = res.get('result', {}).get('msg') or res.get('result', {}).get('data') or "失败"
            self.log(f"新疆客户日: 秒杀结果 - {msg}", notify=True)
        except Exception as e:
            self.log(f"新疆客户日: 秒杀异常 {e}")

    def xj_monthly_draw_once(self, token):
        headers = {
            "User-Agent": XJ_USER_AGENT,
            "userToken": token,
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        }
        payload = {"activityId": XJ_ACTIVITY_ID, "prizeId": "", "commHighFlag": "false"}
        try:
            res = self.session.post(
                f"https://zy100.xj169.com/touchpoint/openapi/themeAct/draw_{XJ_ACTIVITY_ID}",
                data=payload,
                headers=headers,
                timeout=10,
            ).json()
            code = res.get("code")
            msg = str(res.get("msg", ""))
            msg_type = str(res.get("msgType", ""))
            data = res.get("data", "")
            if code == "ERROR":
                data_str = str(data)
                if "已用完" in data_str or "已抽完" in data_str or msg_type == "101":
                    return "done", f"今日机会已用尽 ({data_str or msg or '无可用次数'})"
                if "频率过高" in msg:
                    return "done", "接口频率限制"
                if "缺少参数" in msg:
                    return "invalid", "token 已失效"
                return "done", f"抽奖失败: {data_str or msg or '未知错误'}"
            if code == "SUCCESS":
                if msg == "thanks1":
                    return "continue", f"未中奖 ({data or msg})"
                return "won", f"中奖: {data or '未知奖品'}"
            if str(code) == "401":
                return "invalid", "token 已失效"
            return "continue", f"未中奖 ({msg or data or code})"
        except Exception as e:
            return "error", f"请求异常: {e}"

    def xj_query_monthly_draw_records(self, token):
        headers = {
            "User-Agent": XJ_USER_AGENT,
            "userToken": token,
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        }
        try:
            res = self.session.post(
                "https://zy100.xj169.com/touchpoint/openapi/drawAct/getPrizesScroll",
                data={"activityId": XJ_ACTIVITY_ID},
                headers=headers,
                timeout=10,
            ).json()
            data = res.get("data", [])
            if not data:
                self.log("新疆专区: 每月抽奖暂无中奖记录")
                return
            if isinstance(data, dict):
                data = [data]
            if isinstance(data, list) and data and isinstance(data[0], str):
                for item in data[:5]:
                    self.log(f"新疆专区: 每月抽奖记录 - {item}", notify=True)
                return
            displayed = 0
            for item in data:
                if not isinstance(item, dict):
                    continue
                prize_name = item.get("prizeName") or item.get("prizeId") or "未知奖品"
                draw_ts = safe_int(item.get("drawDate"), 0)
                draw_date = datetime.fromtimestamp(draw_ts / 1000).strftime("%m-%d") if draw_ts else "未知时间"
                self.log(f"新疆专区: 每月抽奖记录 - {prize_name} ({draw_date})", notify=True)
                displayed += 1
                if displayed >= 5:
                    break
            if displayed == 0:
                self.log("新疆专区: 每月抽奖暂无可展示记录")
        except Exception as e:
            self.log(f"新疆专区: 查询每月抽奖记录异常 {e}")

    def xj_monthly_draw_task(self, token):
        self.log(f"新疆专区: 每月抽奖活动 {XJ_ACTIVITY_ID}")
        for i in range(XJ_MONTHLY_DRAW_ATTEMPT_COUNT):
            status, msg = self.xj_monthly_draw_once(token)
            self.log(
                f"新疆专区: 每月抽奖第{i + 1}次 - {msg}",
                notify=status == "won",
            )
            if status in {"done", "won", "invalid"}:
                break
            time.sleep(random.uniform(1, 2))
        self.xj_query_monthly_draw_records(token)

    def shangdu_get_sign_status(self):
        try:
            url = "https://app.shangdu.com/monthlyBenefit/v1/signIn/queryCumulativeSignAxis"
            headers = {
                "Origin": "https://app.shangdu.com",
                "Referer": "https://app.shangdu.com/monthlyBenefit/index.html",
                "edop_flag": "0", "Content-Type": "application/json"
            }
            res = self.session.post(url, json={}, headers=headers).json()
            if res.get('result', {}).get('code') == "0000":
                return res.get('result', {}).get('data', {}).get('todaySignFlag') == "1"
            return None
        except: return None

    def shangdu_sign_retry(self):
        try:
            url = "https://app.shangdu.com/monthlyBenefit/v1/signIn/userSignIn"
            headers = {
                "Origin": "https://app.shangdu.com",
                "Referer": "https://app.shangdu.com/monthlyBenefit/index.html",
                "edop_flag": "0", "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/json"
            }
            res = self.session.post(url, json={}, headers=headers).json()
            code = res.get('result', {}).get('code')
            data = res.get('result', {}).get('data', {})
            if code == "0000":
                prize = data.get('prizeResp', {}).get('prizeName')
                if prize: self.log(f"河南商都: 签到成功(重试) - 获得 {prize}", notify=True)
                else: self.log("河南商都: 签到成功(重试)")
            elif code == "0019":
                self.log("河南商都: 重试仍返回重复签到")
            else:
                self.log(f"河南商都: A签到重试失败 - {res.get('result', {}).get('msg')}")
        except Exception as e:
            self.log(f"河南商都: 签到重试异常 {e}")

    def shangdu_task_main(self):
        if not self.ecs_token: return
        url = f"https://m.client.10010.com/edop_ng/getTicketByNative?appId=edop_unicom_4b80047a&token={self.ecs_token}"
        res = self.session.get(url).json()
        ticket = res.get('result', {}).get('ticket')
        if not ticket:
            self.log("河南商都: 获取Ticket失败")
            return
        login_url = f"https://app.shangdu.com/monthlyBenefit/v1/common/config?ticket={ticket}"
        headers_login = {
             "Origin": "https://app.shangdu.com",
             "Referer": "https://app.shangdu.com/monthlyBenefit/index.html",
             "edop_flag": "0", "Accept": "application/json, text/plain, */*"
        }
        self.session.get(login_url, headers=headers_login)
        time.sleep(1.5)
        sign_url = "https://app.shangdu.com/monthlyBenefit/v1/signIn/userSignIn"
        headers_sign = {
             "Origin": "https://app.shangdu.com",
             "Referer": "https://app.shangdu.com/monthlyBenefit/index.html",
             "edop_flag": "0", "X-Requested-With": "XMLHttpRequest",
             "Content-Type": "application/json"
        }
        res_sign = self.session.post(sign_url, json={}, headers=headers_sign).json()
        code = res_sign.get('result', {}).get('code')
        data = res_sign.get('result', {}).get('data', {})
        if code == "0000":
             if data.get('value') == "0001":
                 self.log("河南商都: 签到失败 - Cookie无效")
             else:
                 prize = data.get('prizeResp', {}).get('prizeName', '已签到')
                 self.log(f"河南商都: 签到结果 - {prize}", notify=True)
        elif code == "0019":
             time.sleep(1)
             is_signed = self.shangdu_get_sign_status()
             if is_signed is True:
                 self.log("河南商都: 今日已签到")
             elif is_signed is False:
                 self.log("河南商都: 状态未签到但返回重复，尝试重试...")
                 time.sleep(2)
                 self.shangdu_sign_retry()
             else:
                 self.log("河南商都: 今日已签到 (状态未知)")
        else:
             self.log(f"河南商都: 签到失败 - {code} : {res_sign.get('result', {}).get('msg')}")

    def ln_flmf_get_sid(self):
        """辽宁福利魔方: 通过 openPlatLineNew → autoLogin 获取 sid"""
        try:
            ticket_res = self.openPlatLineNew("https://weixin.linktech.hk/lv-web/handHall/autoLogin?actcode=sign")
            if not ticket_res or not ticket_res.get('ticket'):
                self.log("辽宁福利魔方: 获取ticket失败")
                return None
            ticket = ticket_res['ticket']
            type_val = ticket_res.get('type', '06')
            mobile = getattr(self, 'account_mobile', getattr(self, 'mobile', ''))
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            postage = hashlib.md5(f"{mobile}{timestamp}".encode()).hexdigest()
            login_url = "https://weixin.linktech.hk/lv-web/handHall/autoLogin"
            params = {
                "actcode": "sign",
                "type": type_val,
                "ticket": ticket,
                "version": COMMON_CONSTANTS["APP_VERSION"],
                "timestamp": timestamp,
                "desmobile": mobile,
                "num": "0",
                "postage": postage,
                "userNumber": mobile
            }
            res = self.session.get(login_url, params=params, allow_redirects=False, timeout=15)
            if res.status_code != 302 or 'Location' not in res.headers:
                self.log(f"辽宁福利魔方: autoLogin期望302, 实际{res.status_code}")
                return None
            loc = res.headers['Location']
            sid_match = re.search(r'sid[=%]3[Dd]?([a-f0-9]{32})', loc)
            if not sid_match:
                parsed = urlparse(unquote(loc))
                qs = parse_qs(parsed.query)
                params_val = qs.get('params', [''])[0]
                if 'sid=' in params_val:
                    inner_qs = parse_qs(params_val)
                    sid = inner_qs.get('sid', [''])[0]
                else:
                    sid = qs.get('sid', [''])[0]
            else:
                sid = sid_match.group(1)
            if sid and len(sid) == 32:
                self.log(f"辽宁福利魔方: 获取sid成功 ({sid[:8]}...)")
                return sid
            self.log(f"辽宁福利魔方: 重定向中未找到sid")
        except Exception as e:
            self.log(f"辽宁福利魔方: 获取sid异常 - {e}")
        return None

    def ln_flmf_api(self, sid, endpoint, extra_data=None):
        """辽宁福利魔方: 通用API调用"""
        url = f"https://weixin.linktech.hk/lv-apiaccess/welfareCenter/{endpoint}"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": "https://weixin.linktech.hk",
            "Referer": f"https://weixin.linktech.hk/app/flmf/LV-202111-04/moreShatter?sid={sid}&actcode=welfareCenter",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.146 Mobile Safari/537.36; unicom{version:android@11.0802}"
        }
        data = f"sid={sid}&actcode=welfareCenter"
        if extra_data:
            data += f"&{extra_data}"
        try:
            res = self.session.post(url, headers=headers, data=data, timeout=15).json()
            return res
        except Exception as e:
            self.log(f"辽宁福利魔方: {endpoint} 请求异常 - {e}")
            return None

    def ln_flmf_task(self, is_query_only=False):
        """辽宁福利魔方: 主入口"""
        sid = self.ln_flmf_get_sid()
        if not sid:
            return
        res = self.ln_flmf_api(sid, "addUser")
        if not res or res.get('resultCode') != '0000':
            self.log(f"辽宁福利魔方: 用户初始化失败 - {(res or {}).get('resultMsg', '无响应')}")
            return
        time.sleep(1)
        init_res = self.ln_flmf_api(sid, "signInInit")
        if init_res and init_res.get('resultCode') == '0000':
            init_data = init_res.get('data', {})
            is_signed = init_data.get('isSigned', 0)
            consecutive = init_data.get('consecutiveDays', 0)
            if is_signed:
                self.log(f"辽宁福利魔方: 今日已签到 (连续{consecutive}天)")
            elif is_query_only:
                self.log(f"辽宁福利魔方: 今日未签到 (连续{consecutive}天)")
            else:
                time.sleep(1)
                sign_res = self.ln_flmf_api(sid, "signIn")
                if sign_res and sign_res.get('resultCode') == '0000':
                    self.log(f"辽宁福利魔方: ✅ 签到成功 (连续{consecutive + 1}天)", notify=True)
                else:
                    self.log(f"辽宁福利魔方: 签到失败 - {(sign_res or {}).get('resultMsg', '无响应')}")
        else:
            self.log(f"辽宁福利魔方: 查询签到状态失败 - {(init_res or {}).get('resultMsg', '无响应')}")
        time.sleep(1)
        info_res = self.ln_flmf_api(sid, "getUserInfo")
        if info_res and info_res.get('resultCode') == '0000':
            info = info_res.get('data', {})
            wobi = info.get('woBi', 0)
            sign_times = info.get('signTimes', 0)
            member_wobi = info.get('memberwobi', 0)
            member_trun = info.get('membertrun', 0)
            rights_num = info.get('rightsNum', '0')
            self.log(f"辽宁福利魔方: 沃币{wobi} | 累计签到{sign_times}天 | 会员碎片{member_wobi} | 等级{member_trun} | 权益{rights_num}次", notify=True)
        if is_query_only:
            return
        time.sleep(1)
        task_res = self.ln_flmf_api(sid, "taskList", "refresh=0&nowTask=")
        if task_res and task_res.get('resultCode') == '0000':
            groups = task_res.get('data', {}).get('taskInfoList', [])
            for group in groups:
                tasks = group.get('taskInfoList', [])
                for t in tasks:
                    status = "✅" if t.get('done', 0) > 0 else "⏳"
                    self.log(f"辽宁福利魔方: {status} {t.get('taskName')} ({t.get('done', 0)}/{t.get('count', 0)})")

    def ah_friday_get_entry(self):
        """安徽超级星期五: 获取活动入口ticket"""
        try:
            entry_url = f"{AH_FRIDAY_BASE_URL}/wxopen/hh/activity/superFriday/index?chnlId=app-ty&type=02"
            ticket_res = self.openPlatLineNew(entry_url)
            if not ticket_res or not ticket_res.get('ticket'):
                self.log("安徽超级星期五: 获取入口ticket失败")
                return None
            ticket = ticket_res['ticket']
            mobile = getattr(self, 'account_mobile', getattr(self, 'mobile', ''))
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            postage = hashlib.md5(f"{mobile}{timestamp}".encode()).hexdigest()
            page_url = f"{AH_FRIDAY_BASE_URL}/wxopen/hh/activity/superFriday/index"
            params = {
                "chnlId": "app-ty",
                "type": "02",
                "ticket": ticket,
                "version": COMMON_CONSTANTS["APP_VERSION"],
                "timestamp": timestamp,
                "desmobile": mobile,
                "num": "0",
                "postage": postage,
                "userNumber": mobile
            }
            headers = {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "User-Agent": COMMON_CONSTANTS["UA"],
            }
            res = self.session.get(page_url, params=params, headers=headers, timeout=15)
            act_ticket = res.cookies.get('ticket', '')
            if not act_ticket:
                for hist_resp in getattr(res, 'history', []):
                    ck = hist_resp.cookies.get('ticket', '')
                    if ck:
                        act_ticket = ck
                        break
                    sc = hist_resp.headers.get('Set-Cookie', '')
                    m = re.search(r'ticket=([^;,\s]+)', sc)
                    if m:
                        act_ticket = m.group(1)
                        break
            if not act_ticket:
                act_ticket = self.session.cookies.get('ticket', domain='') or self.session.cookies.get('ticket', '')
            if not act_ticket:
                cookie_header = res.headers.get('Set-Cookie', '')
                m = re.search(r'ticket=([^;,\s]+)', cookie_header)
                if m:
                    act_ticket = m.group(1)
            if not act_ticket:
                m = re.search(r'ticket[=:]\s*["\']?([a-zA-Z0-9_\-]{8,})', res.text)
                if m:
                    act_ticket = m.group(1)
            if not act_ticket:
                self.log(f"安徽超级星期五: 页面未返回独立ticket，使用入口ticket兜底")
                act_ticket = ticket
            self.log(f"安徽超级星期五: 获取活动ticket成功 ({act_ticket[:12]}...)")
            return {
                "ticket": act_ticket,
                "mobile": mobile,
                "timestamp": timestamp,
                "postage": postage,
                "app_ticket": ticket,
            }
        except Exception as e:
            self.log(f"安徽超级星期五: 获取入口异常 - {e}")
            return None

    def ah_friday_get_items(self, entry_info):
        """安徽超级星期五: 获取奖品列表并匹配目标面额"""
        try:
            url = f"{AH_FRIDAY_BASE_URL}/wxopen/app-activity/AHSecKill/querySecKillInfo"
            headers = {
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json",
                "Origin": AH_FRIDAY_BASE_URL,
                "Cookie": f"ticket={entry_info['ticket']}",
                "User-Agent": COMMON_CONSTANTS["UA"],
            }
            res = self.session.post(url, json={}, headers=headers, timeout=10)
            result = res.json()
            if not result.get('success') and not result.get('data'):
                self.log(f"安徽超级星期五: 查询奖品列表失败 - {result.get('alertMsg', '未知')}")
                return None
            items = result.get('data', {}).get('itemList', [])
            if not items:
                items = result.get('data', []) if isinstance(result.get('data'), list) else []
            target_amount = str(AH_FRIDAY_AMOUNT)
            for item in items:
                item_code = item.get('itemCode', '')
                item_name = item.get('itemName', '')
                if target_amount in item_name or f"hb{target_amount}" in item_code:
                    key_val = item.get('key', '')
                    self.log(f"安徽超级星期五: 匹配到目标 [{item_name}] (code: {item_code})")
                    return {
                        "itemCode": item_code,
                        "itemName": item_name,
                        "key": key_val,
                    }
            item_code = f"AWARD_AHFridaySecKill_10_hb{target_amount}"
            self.log(f"安徽超级星期五: 未从列表匹配到{target_amount}元, 使用默认itemCode: {item_code}")
            return {"itemCode": item_code, "itemName": f"{target_amount}元红包", "key": ""}
        except Exception as e:
            self.log(f"安徽超级星期五: 查询奖品异常 - {e}")
            item_code = f"AWARD_AHFridaySecKill_10_hb{AH_FRIDAY_AMOUNT}"
            return {"itemCode": item_code, "itemName": f"{AH_FRIDAY_AMOUNT}元红包", "key": ""}

    def ah_friday_seckill(self, entry_info, item_info):
        """安徽超级星期五: 批量抢购"""
        ticket = entry_info['ticket']
        item_code = item_info['itemCode']
        key_val = item_info.get('key', '')
        mobile = entry_info['mobile']
        timestamp_str = entry_info['timestamp']
        postage = entry_info['postage']
        referer = (
            f"{AH_FRIDAY_BASE_URL}/wxopen/hh/activity/superFriday/index"
            f"?chnlId=app-ty&type=02&ticket={entry_info['app_ticket']}"
            f"&version={COMMON_CONSTANTS['APP_VERSION']}&timestamp={timestamp_str}"
            f"&desmobile={mobile}&num=0&postage={postage}&userNumber={mobile}"
        )
        success_count = 0
        fail_count = 0
        self.log(f"安徽超级星期五: 开始批量抢购 [{item_info['itemName']}]，共{AH_FRIDAY_SECKILL_TIMES}次")
        for i in range(1, AH_FRIDAY_SECKILL_TIMES + 1):
            try:
                ts = str(int(time.time() * 1000))
                params = {
                    "ticket": ticket,
                    "itemCode": item_code,
                    "time": ts,
                }
                if key_val:
                    params["key"] = key_val
                url = f"{AH_FRIDAY_BASE_URL}/wxopen/app-activity/AHSecKill/lotteryAction"
                headers = {
                    "Accept": "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Origin": AH_FRIDAY_BASE_URL,
                    "Referer": referer,
                    "Cookie": f"ticket={ticket}",
                    "User-Agent": COMMON_CONSTANTS["UA"],
                    "Connection": "keep-alive",
                }
                res = self.session.post(url, params=params, json={}, headers=headers, timeout=5)
                data = res.json()
                if data.get('success'):
                    success_count += 1
                    self.log(f"安徽超级星期五: 🎉 第{i}次抢购成功！{json.dumps(data, ensure_ascii=False)}", notify=True)
                    return True
                else:
                    fail_count += 1
                    alert = data.get('alertMsg', '')
                    if i <= 3 or i % 20 == 0:
                        self.log(f"安徽超级星期五: 第{i}次 - {alert or data.get('statusCode', '未知')}")
                    if "已抢完" in alert or "已结束" in alert or "已领取" in alert:
                        self.log(f"安徽超级星期五: ⚠️ {alert}，停止抢购")
                        break
            except Exception as e:
                fail_count += 1
                if i <= 3:
                    self.log(f"安徽超级星期五: 第{i}次异常 - {e}")
            if i < AH_FRIDAY_SECKILL_TIMES:
                time.sleep(AH_FRIDAY_INTERVAL)
        self.log(f"安徽超级星期五: 抢购完成 (共{AH_FRIDAY_SECKILL_TIMES}次, 失败{fail_count}次)", notify=True)
        return False

    def ah_friday_task(self):
        """安徽超级星期五: 主入口"""
        if not AH_FRIDAY_AMOUNT:
            return
        rc = globalConfig.get("regional_config", {})
        if not rc.get("run_ah_friday", True):
            self.log("安徽超级星期五: ⏭️ 已被子开关关闭，跳过")
            return
        weekday = datetime.now().weekday()
        if weekday != 4:
            self.log(f"安徽超级星期五: 今天不是周五 (当前周{weekday + 1})，跳过")
            return
        self.log(f"安徽超级星期五: 🎯 目标面额 {AH_FRIDAY_AMOUNT}元")
        entry_info = self.ah_friday_get_entry()
        if not entry_info:
            return
        item_info = self.ah_friday_get_items(entry_info)
        if not item_info:
            return
        now = datetime.now()
        target = now.replace(hour=10, minute=0, second=0, microsecond=0)
        wait_seconds = (target - now).total_seconds()
        if wait_seconds > 300:
            self.log(f"安徽超级星期五: ⏳ 距10:00还有 {wait_seconds:.0f}秒，大于5分钟，建议临近时启动")
            return
        if wait_seconds > 0:
            self.log(f"安徽超级星期五: ⏳ 等待开抢 (剩余 {wait_seconds:.1f}秒)...")
            while (datetime.now().replace(hour=10, minute=0, second=0, microsecond=0) - datetime.now()).total_seconds() > 0.3:
                time.sleep(0.1)
            self.log("安徽超级星期五: ⚡ 时间到！开始抢购！")
        else:
            self.log(f"安徽超级星期五: ⚡ 已过10点 {abs(wait_seconds):.1f}秒，直接抢购！")
        self.ah_friday_seckill(entry_info, item_info)

    def woread_encrypt(self, data):
        try:
            key = b'woreadst^&*12345'
            iv = b'16-Bytes--String'
            cipher = AES.new(key, AES.MODE_CBC, iv)
            if isinstance(data, dict):
                data_str = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
            else:
                data_str = str(data)
            pad_len = 16 - (len(data_str.encode('utf-8')) % 16)
            data_str = data_str + chr(pad_len) * pad_len
            ciphertext = cipher.encrypt(data_str.encode('utf-8'))
            hex_str = ciphertext.hex()
            return base64.b64encode(hex_str.encode('utf-8')).decode('utf-8')
        except Exception as e:
            self.log(f"woread_encrypt error: {e}")
            return ""

    def woread_auth(self):
        try:
            product_id = "10000002"
            secret_key = "7k1HcDL8RKvc"
            timestamp = str(round(time.time() * 1000))
            sign_str = f"{product_id}{secret_key}{timestamp}"
            md5_hash = hashlib.md5(sign_str.encode('utf-8')).hexdigest()
            date_str = datetime.now().strftime('%Y%m%d%H%M%S')
            crypt_text_obj = {"timestamp": date_str}
            encoded_sign = self.woread_encrypt(crypt_text_obj)
            url = f"https://10010.woread.com.cn/ng_woread_service/rest/app/auth/{product_id}/{timestamp}/{md5_hash}"
            headers = {
                "Content-Type": "application/json",
                "User-Agent": COMMON_CONSTANTS['UA'],
            }
            res = self.session.post(url, json={"sign": encoded_sign}, headers=headers).json()
            if res.get('code') == "0000":
                self.woread_accesstoken = res.get('data', {}).get('accesstoken')
                return True
            else:
                self.log(f"阅读专区认证失败: {res.get('message')}")
                return False
        except Exception as e:
            self.log(f"woread_auth error: {e}")
            return False

    def woread_login(self):
        try:
            if not hasattr(self, 'woread_accesstoken') or not self.woread_accesstoken:
                if not self.woread_auth():
                    return False
            if not self.token_online:
                self.log("阅读专区: 缺少 token_online，无法登录")
                return False
            token_enc = self.woread_encrypt(self.token_online)
            phone_str = self.account_mobile if self.account_mobile else "13800000000"
            phone_enc = self.woread_encrypt(phone_str)
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            inner_json = json.dumps({
                "tokenOnline": token_enc,
                "phone": phone_enc,
                "timestamp": timestamp
            }, separators=(',', ':'), ensure_ascii=False)
            encoded_sign = self.woread_encrypt(inner_json)
            url = "https://10010.woread.com.cn/ng_woread_service/rest/account/login"
            headers = {
                "Content-Type": "application/json",
                "User-Agent": COMMON_CONSTANTS['UA'],
            }
            if hasattr(self, 'woread_accesstoken') and self.woread_accesstoken:
                headers["accesstoken"] = self.woread_accesstoken
            res = self.session.post(url, json={"sign": encoded_sign}, headers=headers, timeout=15).json()
            if res.get('code') == "0000":
                data = res.get('data', {})
                self.woread_token = data.get('token')
                self.woread_userid = data.get('userid')
                self.woread_userindex = data.get('userindex')
                self.woread_verifycode = data.get('verifycode')
                if data.get('phone'):
                    self.mobile = data['phone']
                self.log("阅读专区: 登录成功")
                return True
            else:
                self.log(f"阅读专区登录失败: {res.get('message')}")
                return False
        except Exception as e:
            self.log(f"woread_login error: {e}")
            return False

    def woread_queryTicketAccount(self):
        try:
            if not hasattr(self, 'woread_token') or not self.woread_token:
                if not self.woread_login():
                     return
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            params = {
                "timestamp": timestamp,
                "phone": self.mobile if self.mobile else "",
                "token": self.woread_token
            }
            sign = self.woread_encrypt(params)
            url = "https://10010.woread.com.cn/ng_woread_service/rest/phone/vouchers/queryTicketAccount"
            headers = {
                "Content-Type": "application/json",
                "User-Agent": COMMON_CONSTANTS['UA'],
            }
            if hasattr(self, 'woread_accesstoken') and self.woread_accesstoken:
                headers["accesstoken"] = self.woread_accesstoken
            res = self.session.post(url, json={"sign": sign}, headers=headers).json()
            if res.get('code') == "0000":
                data = res.get('data', {})
                usable_num = int(data.get('usableNum', 0))
                balance_yuan = "{:.2f}".format(usable_num / 100)
                self.log(f"💰 [资产-阅读红包] 余额: {balance_yuan}元", notify=True)
            else:
                self.log(f"阅读红包查询失败: {res.get('message')}")
        except Exception as e:
            self.log(f"woread_queryTicketAccount error: {e}")


    def woread_get_book_info(self):
        try:
            url1 = "https://10010.woread.com.cn/ng_woread_service/rest/basics/recommposdetail/14856"
            headers = {
                "User-Agent": COMMON_CONSTANTS['UA'],
                "accesstoken": self.woread_accesstoken
            }
            res1 = self.session.get(url1, headers=headers)
            try:
                res1 = res1.json()
            except:
                self.log(f"阅读专区: 获取书架响应非JSON: {res1.text[:100]}")
                return False
            if res1.get('code') == '0000':
                msg_list = res1.get('data', {}).get('booklist', {}).get('message', [])
                if msg_list:
                    self.wr_catid = msg_list[0].get('catindex')
                    self.wr_cntindex = msg_list[0].get('cntindex')
                bind_info = res1.get('data', {}).get('bindinfo', [])
                if bind_info:
                    self.wr_cardid = bind_info[0].get('recommposiindex')
            else:
                self.log("阅读专区: 获取书架失败")
                return False
            if not getattr(self, 'wr_cntindex', None): return False
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            param = {
                "curPage": 1, "limit": 30, "index": self.wr_cntindex, "sort": 0, "finishFlag": 1,
                "timestamp": timestamp,
                "phone": self.mobile if self.mobile else "",
                "token": getattr(self, 'woread_token', ''),
                "userid": getattr(self, 'woread_userid', ''),
                "userId": getattr(self, 'woread_userid', ''),
                "userIndex": getattr(self, 'woread_userindex', ''),
                "verifyCode": getattr(self, 'woread_verifycode', '')
            }
            sign = self.woread_encrypt(param)
            url2 = "https://10010.woread.com.cn/ng_woread_service/rest/cnt/chalist"
            res2_raw = self.session.post(url2, json={"sign": sign}, headers=headers)
            try:
                res2 = res2_raw.json()
            except:
                self.log(f"阅读专区: 获取章节响应非JSON: {res2_raw.text[:100]}")
                return False
            lst = res2.get('list', []) or res2.get('data', {}).get('list', [])
            if lst:
                content = lst[0].get('charptercontent', [])
                if content:
                    self.wr_chapterallindex = content[0].get('chapterallindex')
                    self.wr_chapterid = content[0].get('chapterid')
                    return True
            return False
        except Exception as e:
            self.log(f"阅读专区: 获取书籍信息异常: {e}")
            return False

    def woread_read_process(self):
        if not self.woread_get_book_info():
            self.log("阅读专区: 无法获取书籍信息，跳过阅读")
            return
        headers = {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301}",
                "accesstoken": self.woread_accesstoken
        }
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        phone = self.mobile if self.mobile else ""
        token = getattr(self, 'woread_token', '')
        userid = getattr(self, 'woread_userid', '')
        userindex = getattr(self, 'woread_userindex', '')
        verifycode = getattr(self, 'woread_verifycode', '')
        common_params = {
            "timestamp": timestamp,
            "phone": phone,
            "token": token,
            "userid": userid,
            "userId": userid,
            "userIndex": userindex,
            "userAccount": phone,
            "verifyCode": verifycode
        }
        param = {
          "chapterAllIndex": self.wr_chapterallindex,
          "cntIndex": self.wr_cntindex,
          "cntTypeFlag": "1",
          **common_params
        }
        sign = self.woread_encrypt(param)
        hb_url = f"https://10010.woread.com.cn/ng_woread_service/rest/cnt/wordsDetail?catid={self.wr_catid}&cardid={self.wr_cardid}&cntindex={self.wr_cntindex}&chapterallindex={self.wr_chapterallindex}&chapterseno=1"
        self.session.post(hb_url, json={"sign": sign}, headers=headers)
        add_param = {
          "readTime": "2",
          "cntIndex": self.wr_cntindex,
          "cntType": "1",
          "catid": "0",
          "pageIndex": "",
          "cardid": self.wr_cardid,
          "cntindex": self.wr_cntindex,
          "cnttype": "1",
          "chapterallindex": self.wr_chapterallindex,
          "chapterseno": "1",
          "channelid": "",
          "chapterid": self.wr_chapterid,
          "readtype": 1,
          "isend": "0",
          **common_params
        }
        add_sign = self.woread_encrypt(add_param)
        add_url = "https://10010.woread.com.cn/ng_woread_service/rest/history/addReadTime"
        res = self.session.post(add_url, json={"sign": add_sign}, headers=headers).json()
        res_code = str(res.get('code', ''))
        res_msg = str(res.get('message', ''))
        if res_code == '0000':
            self.log("阅读专区: 模拟阅读成功")
        elif res_code == '9999' or '9999' in res_msg or '不存在阅读记录' in res_msg:
            # addReadTime 返回9999不影响实际阅读结果
            self.log("阅读专区: 模拟阅读成功（阅读记录已提交）")
        else:
             self.log(f"阅读专区: 模拟阅读失败: {res_msg or res}")



    def woread_draw_new(self):
        try:
             headers = {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301}",
                "accesstoken": self.woread_accesstoken
             }
             timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
             param = {
                "activeindex": "8051",
                "timestamp": timestamp, "phone": self.mobile if self.mobile else "", "token": self.woread_token
             }
             sign = self.woread_encrypt(param)
             url = "https://10010.woread.com.cn/ng_woread_service/rest/basics/doDraw"
             res = self.session.post(url, json={"sign": sign}, headers=headers).json()
             if res.get('code') == '0000':
                 prize = res.get('data', {}).get('prizedesc')
                 if prize:
                     self.log(f"阅读专区: 抽奖成功: {prize}", notify=True)
                 else:
                     self.log("阅读专区: 抽奖完成 (未中奖)")
             else:
                 self.log(f"阅读专区: 抽奖失败: {res.get('message')}")
        except Exception as e:
            self.log(f"woread_draw_new error: {e}")

    def woread_task(self):
        self.log("==== 联通阅读 ====")
        if not self.woread_login():
             self.log("阅读专区: 登录失败，跳过任务")
             return
        self.woread_queryTicketAccount()
        self.woread_read_process()
        time.sleep(3)
        self.woread_draw_new()

    def query_market_raffle_records(self, user_token):
        self.log("权益超市: 正在查询抽奖记录...")
        try:
            url = "https://backward.bol.wo.cn/prod-api/market/contactReceive/queryReceiveRecord"
            headers = {
                "Authorization": f"Bearer {user_token}",
                "User-Agent": COMMON_CONSTANTS["MARKET_UA"],
                "Origin": "https://contact.bol.wo.cn",
                "Referer": "https://contact.bol.wo.cn/"
            }
            mobile = getattr(self, "account_mobile", getattr(self, "mobile", ""))
            payload = {
                "isReceive": None,
                "receiveStatus": None,
                "limit": 20,
                "page": 1,
                "mobile": mobile,
                "businessSources": ["3", "4", "5", "6", "99"],
                "isPromotion": 1,
                "returnFormatType": 1
            }
            res = self.session.post(url, json=payload, headers=headers).json()
            if res.get('code') == 200:
                records = res.get('data', {}).get('recordObjs', [])
                if records:
                    display_records = records[:10]
                    self.log(f"权益超市: 最近 {len(display_records)} 条抽奖记录:", notify=True)
                    for item in display_records:
                        self.log(f"    - [{item.get('receiveTime') or ''}] {item.get('recordName')}", notify=True)
                else:
                    self.log("权益超市: 无近期抽奖记录。")
            else:
                self.log(f"权益超市: 查询抽奖记录失败: {res.get('msg')}")
        except Exception as e:
            self.log(f"query_market_raffle_records error: {e}")

    def query_phone_recharge_records(self, user_token):
        self.log("权益超市: 正在查询本月话费抢购记录...")
        try:
            url = "https://backward.bol.wo.cn/prod-api/market/contactReceive/queryReceiveRecord"
            headers = {
                "Authorization": f"Bearer {user_token}",
                "User-Agent": COMMON_CONSTANTS["MARKET_UA"],
                "Origin": "https://contact.bol.wo.cn",
                "Referer": "https://contact.bol.wo.cn/"
            }
            mobile = getattr(self, "account_mobile", getattr(self, "mobile", ""))
            payload = {
                "isReceive": None,
                "receiveStatus": None,
                "limit": 50,
                "page": 1,
                "mobile": mobile,
                "businessSources": ["3", "4", "5", "6", "99"],
                "isPromotion": 1,
                "returnFormatType": 1
            }
            res = self.session.post(url, json=payload, headers=headers).json()
            if res.get('code') == 200:
                records = res.get('data', {}).get('recordObjs', [])
                total_amount = 0.0
                current_month = datetime.now().strftime('%Y-%m')
                count = 0
                for item in records:
                    create_time = item.get('receiveTime') or ''
                    name = item.get('recordName', '')
                    if not create_time or current_month not in create_time:
                        continue
                    if any(k in name for k in ['话费', '充值', '红包']):
                        match = re.search(r'(\d+(\.\d+)?)元', name)
                        if match:
                            amount = float(match.group(1))
                            total_amount += amount
                            count += 1
                if count > 0:
                     self.log(f"💰 [资产-抢购] 本月权益超市话费累计: {total_amount:.2f}元", notify=True)
                else:
                     self.log("权益超市: 本月暂无话费抢购记录")
            else:
                self.log(f"权益超市: 查询话费记录失败: {res.get('msg')}")
        except Exception as e:
            self.log(f"query_phone_recharge_records error: {e}")

    def sign_query_my_prizes(self):
        self.log("正在查询账户明细 (抢兑)...")
        try:
            url = "https://act.10010.com/SigninApp/convert/phoneDetails"
            form = {
                "log_type": "1",
                "number": "1",
                "list_num": ""
            }
            headers = {"Origin": "https://img.client.10010.com"}
            res = self.request("post", url, data=form, headers=headers)
            if not res: return
            result = res.json()
            if result.get('status') == '0000':
                data = result.get('data', {}).get('detailedBO', [])
                if data and isinstance(data, list):
                     logged_count = 0
                     for item in data:
                         if logged_count >= 5: break
                         remark = item.get('remark', '')
                         buss_name = item.get('from_bussname', '')
                         if "兑换" in remark or "兑换" in buss_name:
                             if logged_count == 0:
                                 self.log(f"📋 [账户明细] 最近 5 条记录:", notify=True)
                             order_time = item.get('order_time', '')
                             amount = item.get('booksNumber') or item.get('books_number') or "0"
                             self.log(f"   🎁 [抢兑] {order_time} | {remark} (变动:{amount})", notify=True)
                             logged_count += 1
                     if logged_count == 0:
                         self.log("[账户明细] 暂无兑换记录")
                else:
                    self.log("[账户明细] 暂无兑换记录")
            else:
                self.log(f"[账户明细] 查询异常: {result.get('msg', 'Result Error')}")
        except Exception as e:
            self.log(f"sign_query_my_prizes error: {e}")

    def sign_task_main(self):
        self.log("==== 签到区 ====")
        self.sign_getTelephone(is_initial=True)
        self.sign_getContinuous(is_query_only=False)
        self.sign_month_sign_gift()
        self.sign_getTaskList()
        sc = globalConfig.get("sign_config", {})
        if sc.get("run_grab_coupon", False):
            self.sign_grabCoupon()
        else:
            self.log("签到区-抢话费券: ⏭️ 已被子开关关闭，跳过")
        self.sign_getTelephone()
        self.sign_query_my_prizes()

    def execute_daily_tasks(self, query_only=False):
        if query_only:
            self.log("📋 [查询模式] 仅查询资产，跳过任务执行", notify=True)
            try:
                self.queryRemain()
                if globalConfig.get("enable_sign", True):
                    try:
                        self.sign_getContinuous(is_query_only=True)
                        self.sign_month_sign_gift(is_query_only=True)
                        self.sign_getTelephone()
                    except Exception as e:
                        self.log(f"首页签到查询异常: {e}")
                    try:
                        self.sign_query_my_prizes()
                    except Exception as e:
                        self.log(f"抢兑记录查询异常: {e}")
                if globalConfig.get("enable_ttlxj", True):
                    try:
                        self.ttlxj_task(is_query_only=True)
                    except Exception as e:
                        self.log(f"天天领现金查询异常: {e}")
                if globalConfig.get("enable_ttxc", True):
                    try:
                        self.ttxc_task(is_query_only=True)
                    except Exception as e:
                        self.log(f"通通乡村查询异常: {e}")
                if globalConfig.get("enable_market", True):
                    try:
                        self.market_task(is_query_only=True)
                    except Exception as e:
                        self.log(f"权益超市查询异常: {e}")
                if globalConfig.get("enable_woread", True):
                    try:
                        self.woread_queryTicketAccount()
                    except Exception as e:
                        self.log(f"联通阅读查询异常: {e}")
                if globalConfig.get("enable_aiting", True):
                    try:
                        self.aiting_task(is_query_only=True)
                    except Exception as e:
                        self.log(f"联通爱听查询异常: {e}")
                if globalConfig.get("enable_security", True):
                    try:
                        self.securityButlerTask(is_query_only=True)
                    except Exception as e:
                        self.log(f"安全管家查询异常: {e}")
                if globalConfig.get("enable_ltyp", True):
                    try:
                        self.ltyp_task(is_query_only=True)
                    except Exception as e:
                        self.log(f"联通云盘查询异常: {e}")
                if globalConfig.get("enable_wostore", True):
                    try:
                        self.wostore_cloud_task(is_query_only=True)
                    except Exception as e:
                        self.log(f"沃云手机查询异常: {e}")
                if globalConfig.get("enable_regional", True):
                    try:
                        self.regional_task(is_query_only=True)
                    except Exception as e:
                        pass
            except Exception as e:
                self.log(f"查询异常: {e}")
            return
        if globalConfig.get("enable_sign", True):
            self.sign_task_main()
        else:
            self.log("==== 签到区 ====")
            self.log("⏭️ 已被总开关关闭，跳过")
        if globalConfig.get("enable_ltzf", True):
            self.ltzf_task()
        else:
            self.log("==== 联通祝福 ====")
            self.log("⏭️ 已被总开关关闭，跳过")
        if globalConfig.get("enable_ttlxj", True):
            self.ttlxj_task()
        else:
            self.log("==== 天天领现金 ====")
            self.log("⏭️ 已被总开关关闭，跳过")
        if globalConfig.get("enable_ttxc", True):
            self.ttxc_task()
        else:
            self.log("==== 通通乡村 ====")
            self.log("⏭️ 已被总开关关闭，跳过")
        if globalConfig.get("enable_market", True):
            self.market_task()
        else:
            self.log("==== 权益超市 ====")
            self.log("⏭️ 已被总开关关闭，跳过")
        if globalConfig.get("enable_woread", True):
            self.woread_task()
        else:
            self.log("==== 联通阅读 ====")
            self.log("⏭️ 已被总开关关闭，跳过")
        need_cooldown = globalConfig.get("enable_woread", True) and globalConfig.get("enable_aiting", True)
        if need_cooldown:
            self.log("⏳ 等待120秒（阅读冷却：联通限制两次阅读间隔2分钟）...")
            time.sleep(120)
        if globalConfig.get("enable_aiting", True):
            self.aiting_task()
        else:
            self.log("==== 联通爱听 ====")
            self.log("⏭️ 已被总开关关闭，跳过")
        if globalConfig.get("enable_security", True):
            self.securityButlerTask()
        else:
            self.log("==== 安全管家 ====")
            self.log("⏭️ 已被总开关关闭，跳过")
        if globalConfig.get("enable_ltyp", True):
            self.ltyp_task()
        else:
            self.log("==== 联通云盘 ====")
            self.log("⏭️ 已被总开关关闭，跳过")
        if globalConfig.get("enable_wostore", True):
            self.wostore_cloud_task()
        else:
            self.log("==== 沃云手机 ====")
            self.log("⏭️ 已被总开关关闭，跳过")
        if globalConfig.get("enable_regional", True):
            self.regional_task()
        else:
            self.log("==== 区域专区 ====")
            self.log("⏭️ 已被总开关关闭，跳过")

def cross_view_security_share_keys(users):
    participants = [
        u for u in users
        if getattr(u, "sec_ai_share_key", "") and getattr(u, "sec_token", "") and getattr(u, "sec_share_task_code", "")
    ]
    if not participants:
        return
    if len(participants) < 2:
        participants[0].log("联通助理-分享AI助手对话：仅 1 个账号拿到分享key，跳过跨账号互看")
        return
    print("")
    print("========= 联通助理-开始跨账号查看AI分享对话 =========")
    n = len(participants)
    for i, viewer in enumerate(participants):
        target = participants[(i + 1) % n]
        viewer.log(f"联通助理-分享AI助手对话：查看账号[{target.index}]分享")
        try:
            viewer.sec_view_share_detail(target.sec_ai_share_key, viewer.sec_token)
        except Exception as e:
            viewer.log(f"联通助理-分享AI助手对话：互看异常 {e}")
        time.sleep(2)
    for u in participants:
        try:
            u.sec_refresh_security_context(refresh_secret=True)
            u.sec_finalize_share_ai_task()
            u.sec_recover_pending_claims(rounds=2, delay=6, refresh_context=True)
        except Exception as e:
            u.log(f"联通助理-分享AI助手对话：互看后领奖异常 {e}")

def do_notify(users):
    if not globalConfig.get("enable_notify", True):
        print("推送通知已关闭")
        return
    notify_content = []
    for u in users:
        if u.notify_logs:
            phone = u.mobile or u.account_mobile
            phone_str = mask_str(phone) if phone else ""
            notify_content.append(f"【账号{u.index}】{phone_str}")
            notify_content.extend(u.notify_logs)
            notify_content.append("")
    if notify_content:
        content = "\n".join(notify_content)
        try:
            from notify import send
            send(f"中国联通 {SCRIPT_VERSION}", content)
            print(f"推送成功 (内容长度: {len(content)})")
        except Exception as e:
            print(f"推送失败，可能未配置 notify.py: {str(e)}")
    else:
        print("无推送内容")

def main():
    global GRAB_AMOUNT
    print(f"[{datetime.now().strftime('%H:%M:%S')}] [Script Start] chinaUnicom Python {SCRIPT_VERSION}")
    cookies = os.environ.get("chinaUnicomCookie", "")
    if not cookies:
        print("[-] 未在环境变量 chinaUnicomCookie 中找到配置")
        sys.exit(1)
    accounts = [c for c in re.split(r'[&\n]', cookies) if c.strip()]
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 发现 {len(accounts)} 个账号")
    print("")
    users = []
    for idx, config in enumerate(accounts):
        u = UserService(idx + 1, config.strip())
        users.append(u)
        if u.appId:
             print(f"账号[{idx+1}] 识别到 Token#AppId 模式，使用自定义AppId: {u.appId}")
        elif u.account_mobile:
             print(f"账号[{idx+1}] 识别到账号密码模式: {mask_str(u.account_mobile)}")
        try:
            if u.token_online:
                u.get_city_info()
        except: pass
    print(f"共找到{len(accounts)}个账号")
    print("")
    env_amount = os.environ.get("UNICOM_GRAB_AMOUNT", "")
    if env_amount and env_amount.isdigit():
        GRAB_AMOUNT = int(env_amount)
    query_only = os.environ.get("UNICOM_TEST_MODE", "").strip().lower() == "query"
    if query_only:
        print("[Test Mode] 仅查询模式，跳过任务执行")
    sc = globalConfig.get("sign_config", {})
    mc = globalConfig.get("market_config", {})
    rc = globalConfig.get("regional_config", {})
    grab_mode = False
    ah_friday_grab = False
    hour = datetime.now().hour
    current_min = datetime.now().minute
    is_friday = datetime.now().weekday() == 4
    if not query_only:
        if sc.get("run_grab_coupon", False) and globalConfig.get("enable_sign", True):
            if hour in [9, 17] and (58 <= current_min <= 59):
                grab_mode = True
        if (AH_FRIDAY_AMOUNT and is_friday and rc.get("run_ah_friday", True)
                and globalConfig.get("enable_regional", True)
                and hour == 9 and (58 <= current_min <= 59)):
            ah_friday_grab = True
            grab_mode = True
    print("-" * 36)
    switch_map = [
        ("enable_sign",     "首页签到"),
        ("enable_ltzf",     "联通祝福"),
        ("enable_ttlxj",    "天天领现金"),
        ("enable_ttxc",     "通通乡村"),
        ("enable_market",   "权益超市"),
        ("enable_woread",   "联通阅读"),
        ("enable_aiting",   "联通爱听"),
        ("enable_security", "安全管家"),
        ("enable_ltyp",     "联通云盘"),
        ("enable_wostore",  "沃云手机"),
        ("enable_regional", "区域专区"),
    ]
    for key, label in switch_map:
        enabled = globalConfig.get(key, True)
        if grab_mode:
            if key == "enable_sign" and sc.get("run_grab_coupon", False):
                status = "运行(仅抢兑)"
            elif key == "enable_regional" and ah_friday_grab:
                status = "运行(安徽抢红包)"
            else:
                status = "跳过(抢兑模式)"
        elif query_only:
            status = "仅查询" if enabled else "关闭"
        else:
            status = "运行" if enabled else "关闭"
        print(f"{label}设置为: {status}")
        if key == "enable_sign" and enabled and not query_only:
            print(f"  └─ 抢话费券: {'开启' if sc.get('run_grab_coupon', False) else '关闭'}")
        if key == "enable_regional" and enabled and not query_only:
            ah_status = "开启" if rc.get("run_ah_friday", True) and AH_FRIDAY_AMOUNT else "关闭"
            print(f"  └─ 安徽超级星期五: {ah_status}" + (f" (面额{AH_FRIDAY_AMOUNT}元)" if AH_FRIDAY_AMOUNT else ""))
        if key == "enable_market" and enabled and not query_only and not grab_mode:
            print(f"  └─ 做任务: {'开启' if mc.get('run_task', True) else '关闭'}")
            print(f"  └─ 会员中心: {'开启' if mc.get('run_member_center', True) else '关闭'}")
            print(f"  └─ 抽奖: {'开启' if mc.get('run_draw', True) else '关闭'}")
            print(f"  └─ 自动领奖: {'开启' if mc.get('run_claim', False) else '关闭'}")
    print(f"推送通知设置为: {'开启' if globalConfig.get('enable_notify', True) else '关闭'}")
    print(f"设备ID刷新: {'强制刷新' if globalConfig.get('refresh_device_id', False) else '使用缓存'}")
    print("-" * 36)
    print("")
    if grab_mode:
        print(f"⏰ [自动触发] 检测到抢兑时间点 ({hour}:{current_min:02d})，进入并发抢兑模式")
        tasks_desc = []
        if sc.get("run_grab_coupon", False) and globalConfig.get("enable_sign", True):
            tasks_desc.append(f"{GRAB_AMOUNT}元话费券")
        if ah_friday_grab:
            tasks_desc.append(f"安徽{AH_FRIDAY_AMOUNT}元红包")
        print(f"🚨🚨🚨 [抢兑模式已启动] 目标: {' + '.join(tasks_desc)} 🚨🚨🚨")
        print("")
        from concurrent.futures import ThreadPoolExecutor

        def run_grab_task(u):
            u.configure_proxy()
            if u.ensure_login():
                sub_futures = []
                with ThreadPoolExecutor(max_workers=2) as sub_executor:
                    if sc.get("run_grab_coupon", False) and globalConfig.get("enable_sign", True):
                        sub_futures.append(sub_executor.submit(u.sign_grabCoupon))
                    if ah_friday_grab:
                        sub_futures.append(sub_executor.submit(u.ah_friday_task))
                    for f in sub_futures:
                        try:
                            f.result()
                        except Exception as e:
                            u.log(f"抢兑子任务异常: {e}")
            else:
                u.log("登录流程失败，跳过该账号")

        print(f"🚀 [并发模式] 启动 {len(accounts)} 个账号同时抢兑...")
        with ThreadPoolExecutor(max_workers=len(accounts)) as executor:
            futures = [executor.submit(run_grab_task, u) for u in users]
            for future in futures:
                try:
                    future.result()
                except Exception as e:
                    print(f"[-] Thread Error: {e}")
        do_notify(users)
        return
    print("🚀 开始串行执行日常任务...")
    print("")
    for u in users:
        print("")
        print(f"🔄 正在初始化账号[{u.index}]...")
        u.configure_proxy()
        if u.ensure_login():
             print("")
             print(f"------------------ 账号[{u.index}][{mask_str(u.account_mobile)}] ------------------")
             print("")
             u.execute_daily_tasks(query_only=query_only)
             print("⏳ 账号处理完毕，等待 2 秒...")
             time.sleep(2)
        else:
             u.log("登录流程失败，跳过该账号")
    cross_view_security_share_keys(users)
    do_notify(users)
if __name__ == "__main__":
    main()
