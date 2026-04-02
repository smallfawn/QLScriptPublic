# -*- coding: utf-8 -*-
"""
中国联通 Python 版 v1.0.5
new Env('中国联通');
包含以下功能:
1. 首页签到 (话费红包/积分)
2. 联通祝福 (各类抽奖)
3. 天天领现金 (每日打卡/立减金)
4. 权益超市 (任务/抽奖/浇水/领奖/全局库存缓存)
5. 安全管家 (日常任务/积分领取)
6. 联通云盘 (签到/AI互动/文件上传/抽奖活动/重复清理)
7. 联通阅读 (自动获取书籍/心跳阅读/抽奖/查红包)
8. 联通爱听 (积分任务/自动签到/阅读挂机/分享任务)
9. 沃云手机 (签到/任务/抽奖)
10. 区域专区 (自动识别新疆/河南/云南执行特有任务)

更新说明:

### 20260322
v1.0.5:
- 权益超市：接入会员中心浏览积分任务，并拆分独立子开关。
- 区域专区：接入新疆每月抽奖新版 `themeAct` 链路。
- 会员中心：补充页面预热、状态轮询和领奖兜底，提升成功率。
- 日志：更新版本号，精简更新说明与启动输出。

### 20260321
v1.0.3:
- 云盘：整合实时任务、家乡打卡抽奖、上传/清理与容错优化。
- 权益超市：恢复浇花签名并对齐 H5 请求头。
- 联通爱听：补齐 `jftask` 签名头。
- 区域专区：新增云南生活任务。

### 20260301
v1.0.2:
- 🎛️ **全局总开关**：新增 globalConfig 配置字典，可一键 开/关 各功能模块。
- 🔧 **设备ID控制**：新增 refresh_device_id 选项，可选强制刷新或使用缓存设备ID。
- 📊 **启动日志优化**：启动时动态打印各模块开关状态及权益超市子开关详情。
- ⏱️ **智能冷却**：阅读/爱听均关闭时自动跳过120秒冷却等待。
- 🗑️ **移除失效活动**：删除已下架的云盘春节拼图活动代码（约565行）。
- 🔧 **修复模拟阅读**：补齐 addReadTime 缺失的用户参数，增强嵌套响应解析。
- 🔧 **修复安全管家**：getTicketByNative_sec 加入代理故障转移，避免代理失效时跳过全部任务。
- ⏱️ **阅读冷却等待**：阅读专区与爱听任务间增加120秒间隔，适配联通2分钟阅读冷却限制。

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
   export UNICOM_GRAB_URL="https://..."   : (可选) 自定义抢兑接口地址
   export UNICOM_TEST_MODE="query"        : (可选) 仅查询模式，跳过任务执行只查询资产

定时规则建议 (Cron):
0 58 9,17 * * * (抢兑专用: 需 sign_config.run_grab_coupon=True，建议提前2分钟启动，脚本自动精准等待)
0 7,20 * * * (推荐：每天早晚7点/20点各跑一次，覆盖绝大部分签到任务)
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
import tempfile
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
# ========================================
# 全局配置 (globalConfig)
# true=开启, false=关闭
# ========================================
globalConfig = {
    # --- 1. 功能总开关 (True=开启, False=关闭) ---
    "enable_sign": True,          # 首页签到 (🔺总开关, 含签到/任务/抢话费券)
    "enable_ttlxj": True,         # 天天领现金
    "enable_ltzf": True,          # 联通祝福
    "enable_woread": False,        # 联通阅读
    "enable_security": True,      # 安全管家
    "enable_ltyp": True,          # 联通云盘
    "enable_market": True,        # 权益超市 (🔺总开关, 必须开启内部功能才能运行)
    "enable_aiting": True,        # 联通爱听
    "enable_wostore": True,       # 沃云手机
    "enable_regional": True,      # 区域专区

    # --- ✅ 签到区内部细分开关 ---
    "sign_config": {
        "run_grab_coupon": False, # False = 关闭抢话费券 (True=开启抢兑, 需配合 UNICOM_GRAB_AMOUNT 设置面额)
    },

    # --- 🛒 权益超市内部细分开关 (按需修改到这里) ---
    "market_config": {
        "run_water": True,        # False = 关闭浇水
        "run_task": True,         # False = 关闭做任务(浏览/分享)
        "run_member_center": True, # False = 关闭浏览会员中心得积分
        "run_draw": True,         # True  = 开启抽奖
        "run_claim": True,       # True  = 开启自动领奖(建议开启, 不领白不领)
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
UNICOM_CLOUD_UPLOAD_TIMEOUT = int(os.environ.get("UNICOM_CLOUD_UPLOAD_TIMEOUT", "120") or "120")
UNICOM_CLOUD_UPLOAD_PROGRESS_BYTES = int(os.environ.get("UNICOM_CLOUD_UPLOAD_PROGRESS_BYTES", "6376590") or "6376590")
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
GRAB_AMOUNT = os.environ.get("UNICOM_GRAB_AMOUNT", "5")
GRAB_URL = os.environ.get("UNICOM_GRAB_URL", "https://act.10010.com/SigninApp/convert/prizeConvert")
UNICOM_TOKEN_CACHE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "unicom_token_cache.json")
if "UNICOM_PROXY_API" not in os.environ:
    os.environ.pop("http_proxy", None)
    os.environ.pop("https_proxy", None)
    os.environ.pop("HTTP_PROXY", None)
    os.environ.pop("HTTPS_PROXY", None)
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

class FailoverSession:
    """包装 requests.Session，自动为所有请求添加代理故障转移"""
    RETRIABLE_KEYWORDS = ("Max retries exceeded", "timed out", "connection", "SOCKS", "ProxyError", "ConnectionError")

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
            if self._should_failover(str(e)):
                self._owner.log(f"⚠️ [自动故障转移] {url} 请求异常: {e}")
                self._owner.failover_proxy()
                if self._has_streaming_payload(kwargs):
                    raise
                return self._session.request(method, url, **kwargs)
            raise

    def get(self, url, **kwargs):
        return self.request("GET", url, **kwargs)

    def post(self, url, **kwargs):
        return self.request("POST", url, **kwargs)

class UserService:
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
            requests.get("https://www.baidu.com", proxies=self.session.proxies, timeout=3)
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
        session.trust_env = False
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
        self.log(f"正在使用账号 {mask_str(self.account_mobile)} 进行登录...")
        if not self.appId:
            self.appId = self.generate_appid()
            self.log(f"生成临时 AppId: {self.appId[:15]}...")
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        try:
            payload = {
                "version": COMMON_CONSTANTS["APP_VERSION"],
                "mobile": self.rsa_encrypt(self.account_mobile),
                "reqtime": timestamp,
                "deviceModel": "Android",
                "netWay": "Wifi",
                "isR4": "0",
                "password": self.rsa_encrypt(self.account_password),
                "appId": self.appId
            }
            url = "https://m.client.10010.com/mobileService/login.htm"
            res = self.session.post(url, data=payload)
            result = res.json()
            if result.get('code') in ['0', '0000']:
                if result.get('token_online'):
                    self.token_online = result['token_online']
                    self.log("✅ 登录接口验证通过")
                    return True
                else:
                    self.log("❌ 登录响应中未找到 token_online")
            else:
                self.log(f"❌ 登录失败: {result.get('desc')} (Code: {result.get('code')})")
        except Exception as e:
            self.log(f"❌ 登录过程异常: {str(e)}")
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
            if response.status_code >= 400:
                self.log(f"请求 {url} 返回状态码 {response.status_code}")
            return response
        except Exception as e:
            self.log(f"请求 {url} 异常: {str(e)}")
            return None

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
                url = GRAB_URL
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

    def generate_market_watering_signature_headers(self, user_token, xbsosjl, login_id):
        try:
            signature_ts = str(int(time.time() * 1000))
            message = f"td:433:tp{xbsosjl}td:334:et{login_id}td:334:et{signature_ts}td:334:et"
            signature = base64.b64encode(
                hmac.new(
                    str(login_id).encode('utf-8'),
                    message.encode('utf-8'),
                    digestmod=hashlib.sha256,
                ).digest()
            ).decode('utf-8')
            return {'X-Signature': signature}
        except Exception as e:
            self.log(f"Market Watering Signature Error: {e}")
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

    def query_market_watering_status(self, user_token):
        try:
            status_url = "https://backward.bol.wo.cn/prod-api/promotion/activityTask/getMultiCycleProcess?activityId=13"
            headers = self.get_market_headers(user_token)
            res = self.session.get(status_url, headers=headers).json()
            if res.get('code') == 200:
                data = res.get('data', {})
                triggered_time = data.get('triggeredTime', 0)
                trigger_time = data.get('triggerTime', 0)
                create_date = data.get('createDate', '')
                self.log(f"权益超市-浇花当前状况: 进度 {triggered_time}/{trigger_time}", notify=True)
                if triggered_time >= trigger_time:
                    self.log("权益超市-浇花: 🌟 您有鲜花权益待领取! (连续浇花已满) 🌟", notify=True)
                else:
                    today_str = datetime.now().strftime('%Y-%m-%d')
                    last_watered = create_date.split(' ')[0] if create_date else ''
                    if today_str == last_watered:
                        self.log(f"权益超市-浇花: 今日已浇水 (最后: {create_date})", notify=True)
                    else:
                        self.log("权益超市-浇花: 今日尚未浇水。")
            else:
                self.log(f"权益超市-浇花查验: 查询状态失败: {res.get('msg')}")
        except Exception as e:
            self.log(f"权益超市-浇花查验: 异常: {e}")

    def market_watering_task(self, user_token):
        self.log("权益超市: 浇花任务开始...")
        try:
            status_url = "https://backward.bol.wo.cn/prod-api/promotion/activityTask/getMultiCycleProcess?activityId=13"
            headers = self.get_market_headers(user_token)
            res = self.session.get(status_url, headers=headers).json()
            if res.get('code') != 200:
                self.log(f"权益超市-浇花: 获取状态失败: {res.get('msg')}")
                return
            data = res.get('data', {})
            triggered_time = data.get('triggeredTime', 0)
            trigger_time = data.get('triggerTime', 0)
            create_date = data.get('createDate', '')
            self.log(f"权益超市-浇花: 当前进度 {triggered_time}/{trigger_time}", notify=True)
            if triggered_time >= trigger_time:
                self.log("权益超市-浇花: 🌟 您有鲜花权益待领取! (连续浇花已满) 🌟", notify=True)
                return
            today_str = datetime.now().strftime('%Y-%m-%d')
            last_watered = create_date.split(' ')[0] if create_date else ''
            if today_str == last_watered:
                self.log(f"权益超市-浇花: 今日已浇水 (最后: {create_date})", notify=True)
                return
            self.log("权益超市-浇花: 今日未浇水，执行浇水操作...")
            token = user_token.replace('Bearer ', '')
            payload = self.parse_jwt_payload(token)
            login_id = payload.get('loginId', '')
            if not login_id:
                self.log("权益超市-浇花: ❌ 无法获取登录标识，跳过")
                return
            xbsosjl = "Y1mN8fNYktY0"
            request_ts = str(int(time.time() * 1000))
            query_string = f"xbsosjl={xbsosjl}&timeVerRan={request_ts}&diceid={login_id}"
            watering_url = f"https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/checkWatering?{query_string}"
            req_headers = {
                'Authorization': f"Bearer {user_token.replace('Bearer ', '')}",
                'X-Signature': self.generate_market_watering_signature_headers(user_token, xbsosjl, login_id).get('X-Signature', ''),
                'User-Agent': COMMON_CONSTANTS['MARKET_H5_UA'],
                'Content-Type': 'application/json',
                'Origin': 'https://contact.bol.wo.cn',
                'Referer': 'https://contact.bol.wo.cn/',
                'X-Requested-With': 'com.sinovatech.unicom.ui',
                'Accept': '*/*',
            }
            res = self.session.post(watering_url, headers=req_headers, data="{}").json()
            if res.get('code') == 200:
                self.log("权益超市-浇花: ✅ 浇水成功!", notify=True)
                return
            self.log(f"权益超市-浇花: ❌ 浇水失败: {res.get('msg')}")
        except Exception as e:
            self.log(f"权益超市-浇花: 异常: {e}")

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
            self.query_market_watering_status(user_token)
            self.query_market_raffle_records(user_token)
            self.query_phone_recharge_records(user_token)
            return
        mc = globalConfig.get("market_config", {})
        if mc.get("run_water", True):
            self.market_watering_task(user_token)
            time.sleep(2)
        else:
            self.log("权益超市-浇水: ⏭️ 已被总开关关闭，跳过")
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
                'onLine': "https://m.client.10010.com/mobileService/onLine.htm",
                'getTicketByNative': "https://m.client.10010.com/edop_ng/getTicketByNative",
                'userticket': "https://panservice.mail.wo.cn/api-user/api/user/ticket",
                'ltypDispatcher': "https://panservice.mail.wo.cn/wohome/dispatcher",
                'query': "https://m.jf.10010.com/jf-external-application/page/query",
                'taskDetail': "https://m.jf.10010.com/jf-external-application/jftask/taskDetail",
                'taskRecords': "https://m.jf.10010.com/jf-external-application/jftask/taskRecords",
                'dosign': "https://m.jf.10010.com/jf-external-application/jftask/sign",
                'upload2C': "https://tjupload.pan.wo.cn/openapi/client/upload2C",
                'doPopUp': "https://m.jf.10010.com/jf-external-application/jftask/popUp",
                'toFinish': "https://m.jf.10010.com/jf-external-application/jftask/toFinish",
                'lottery': "https://panservice.mail.wo.cn/activity/lottery",
                'openActivity': "https://panservice.mail.wo.cn/activity/openActivity",
                'checkActivityStatus': "https://panservice.mail.wo.cn/activity/checkActivityStatus",
                'userInfo': "https://m.jf.10010.com/jf-external-application/jftask/userInfo",
                'ai_query': "https://panservice.mail.wo.cn/wohome/ai/assistant/query",
                'lottery_times': "https://panservice.mail.wo.cn/activity/lottery/lottery-times",
                'aiMoveFile': "https://panservice.mail.wo.cn/wohome/open/v1/ai/moveFile2SystemFolder",
                'activityUpload2C': "https://du.smartont.net:8443/openapi/client/upload2C",
                'queryPhoneLocation': "https://panservice.mail.wo.cn/api-user/user/info/query",
                'getScanState': "https://s.pan.wo.cn/wohome/intelligentClean/getScanStateAndResult",
                'getCleanData': "https://s.pan.wo.cn/wohome/intelligentClean/getCleanData",
                'batchClean': "https://s.pan.wo.cn/wohome/intelligentClean/batchClean",
                'vote': "https://panservice.mail.wo.cn/activity/activity-task/vote",
                'secretKey': "https://m.jf.10010.com/jf-external-application/jftask/getSecretKey",
                'taskFinish': "https://panservice.mail.wo.cn/activity/member-point/v1/task/finish",
            }

    def cloudRequest(self, url_name, payload, is_changer=False, method='post', custom_headers=None):
        self.init_cloud_urls()
        url = self.cloudDiskUrls.get(url_name)
        if not url:
            self.log(f"云盘无效的URL名称: {url_name}")
            return {'result': None, 'headers': None}
        headers = {
            'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301}",
            'Connection': "Keep-Alive",
            'Accept-Encoding': "gzip",
        }
        if custom_headers:
             headers.update(custom_headers)
        if url_name in ['dosign', 'userInfo', 'doPopUp', 'toFinish', 'taskDetail', 'taskRecords']:
            if not getattr(self.cloudDisk, 'userticket', None):
                self.log(f"云盘 [{{url_name}}] userticket 未获取")
                return {'result': None, 'headers': None}
            headers['ticket'] = self.cloudDisk.userticket
            headers['content-type'] = "application/json;charset=UTF-8"
            headers['partnersid'] = "1649"
            headers['origin'] = "https://m.jf.10010.com"
            if getattr(self.cloudDisk, 'jeaId', None):
                headers['Cookie'] = f"_jea_id={self.cloudDisk.jeaId};"
            if url_name in ['dosign', 'toFinish']:
                sig_headers = self.build_signature_headers_cloud()
                if sig_headers:
                    headers.update(sig_headers)
            if is_changer:
                headers['clienttype'] = "yunpan_unicom_applet"
                headers['x-requested-with'] = "com.sinovatech.unicom.ui"
                if url_name == 'toFinish':
                    headers['User-Agent'] = "Mozilla/5.0 (Linux; Android 12; Redmi K30 Pro Build/SKQ1.220303.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.39 Mobile Safari/537.36/woapp LianTongYunPan/4.0.4 (Android 12)"
                    headers['clienttype'] = "yunpan_android"
                    headers['x-requested-with'] = "com.chinaunicom.bol.cloudapp"
            else:
                headers['clienttype'] = "yunpan_android"
                headers['x-requested-with'] = "com.sinovatech.unicom.ui"
        elif url_name == 'ai_query':
             model_id = payload.get('modelId', 1)
             headers.update({
                'accept': 'text/event-stream',
                'X-YP-Access-Token': self.cloudDisk.userToken,
                'X-YP-App-Version': '5.0.12',
                'X-YP-Client-Id': '1001000035',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 9; SM-N9810 Build/PQ3A.190705.11211540; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36/woapp LianTongYunPan/5.0.12 (Android 9)',
                'Content-Type': 'application/json',
                'Origin': 'https://panservice.mail.wo.cn',
                'X-Requested-With': 'com.chinaunicom.bol.cloudapp',
                'Referer': f"https://panservice.mail.wo.cn/h5/wocloud_ai/?modelType={model_id}&clientId=1001000035&touchpoint=300300010001&token={self.cloudDisk.userToken}",
             })
        elif url_name == 'lottery_times':
             method = 'get'
             headers.update({
                 'X-YP-Access-Token': self.cloudDisk.userToken, 'source-type': 'woapi', 'clientId': '1001000165',
                 'token': self.cloudDisk.userToken, 'X-YP-Client-Id': '1001000165',
             })
        elif url_name == 'aiMoveFile':
             headers.update({
                 'X-YP-Device-Id': 'yOH1Y2/Ck5tBHRRBEAPCoGRGBOHCob7I',
                 'app-type': 'liantongyunpanapp',
                 'Access-Token': self.cloudDisk.userToken,
                 'Client-Id': '1001000035',
                 'App-Version': 'yp-app/5.1.0',
                 'Sys-Version': 'Android/15',
                 'User-Agent': 'LianTongYunPan/5.1.0 (Android 15)',
                 'X-YP-Client-Id': '1001000035',
                 'X-YP-Access-Token': self.cloudDisk.userToken,
                 'oaid': '00000000',
                 'Content-Type': 'application/json;charset=utf-8',
                 'Origin': 'https://panservice.mail.wo.cn',
             })
        elif url_name.startswith('cloud_') or 'shareCard' in url_name:
             current_token = getattr(self.cloudDisk, 'userToken', '')
             headers.update({
                'Host': 'panservice.mail.wo.cn',
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 15; PJZ110 Build/AP3A.240617.008; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/144.0.7559.109 Mobile Safari/537.36/woapp LianTongYunPan/5.1.0 (Android 15)',
                'client-Id': '1001000035',
                'X-YP-Client-Id': '1001000035',
                'accessToken': current_token,
                'access-token': current_token,
                'X-YP-Access-Token': current_token,
                'Authorization': f'Bearer {current_token}',
                'X-Requested-With': 'com.chinaunicom.bol.cloudapp',
                'Content-Type': 'application/json',
                'Origin': 'https://panservice.mail.wo.cn',
             })
             touchpoint = '300300010032'
             if 'lightPuzzle' in url_name: touchpoint = '300300010003'
             if 'shareCardReceive' in url_name:
                  headers['User-Agent'] = "Mozilla/5.0 (Linux; Android 15; PJZ110 Build/AP3A.240617.008; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/142.0.7444.173 Mobile Safari/537.36 XWEB/1420229 MMWEBSDK/20250802 MMWEBID/7928 MicroMessenger/8.0.62.2900(0x28003EA0) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64"
                  headers['X-Requested-With'] = "com.tencent.mm"
                  headers['X-YP-GRAY-FLAG'] = "undefined"
                  uniq_key = payload.get('uniqKey', '') if isinstance(payload, dict) else ''
                  card_code = payload.get('_cardCode', 'LT') if isinstance(payload, dict) else 'LT'
                  if isinstance(payload, dict) and '_cardCode' in payload:
                       del payload['_cardCode']
                  headers['Referer'] = f"https://panservice.mail.wo.cn/h5/activitymobile/newYears26?uniqKey={uniq_key}&cardCode={card_code}&activityId=SPRING_FESTIVAL_2026&page=1&touchpoint=undefined"
             else:
                  headers['Referer'] = f"https://panservice.mail.wo.cn/h5/activitymobile/newYears26?activityId=SPRING_FESTIVAL_2026&touchpoint={touchpoint}&token={current_token}"
                  if url_name == 'shareCard':
                       headers['X-YP-GRAY-FLAG'] = "undefined"
        for attempt in range(1, 4):
            try:
                if method == 'get':
                    res = self.session.get(url, params=payload, headers=headers, timeout=15)
                else:
                    res = self.session.post(url, json=payload, headers=headers, timeout=15)
                if url_name == 'ai_query':
                     return {'result': None, 'body': res.text, 'headers': res.headers}
                try:
                    res_json = res.json()
                    return {'result': res_json, 'headers': res.headers, 'status': res.status_code}
                except:
                    return {'result': res.text, 'headers': res.headers, 'status': res.status_code}
            except Exception as e:
                err_msg = str(e)
                if attempt < 3 and os.environ.get("UNICOM_PROXY_API") and ("Max retries exceeded" in err_msg or "timed out" in err_msg.lower() or "connection" in err_msg.lower() or "SOCKS" in err_msg):
                    self.log(f"cloudRequest [{url_name}] 网络异常触发故障转移({err_msg}), 正在更换代理...")
                    self.failover_proxy()
                    continue
                if attempt == 3:
                     self.log(f"cloudRequest Exception [{url_name}]: {e}")
                     return {'result': None, 'headers': None, 'status': 599}
                self.log(f"cloudRequest [{url_name}] 网络异常({e}), 重试第{attempt}次...")
                time.sleep(2)

    def encrypt_data_cloud(self, data, key, iv="wNSOYIB1k1DjY5lA"):
        key_padded = key.ljust(16)[:16]
        cipher = AES.new(key_padded.encode(), AES.MODE_CBC, iv.encode())
        padded = pad(data.encode(), AES.block_size, style="pkcs7")
        return base64.b64encode(cipher.encrypt(padded)).decode()

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

    def get_userticket_cloud(self, is_changer=False):
        if not getattr(self.cloudDisk, 'userToken', None):
            self.log("云盘任务: 获取userticket失败, userToken未获取")
            return None
        headers = {}
        if is_changer:
            headers = {
                'User-Agent': "LianTongYunPan/4.0.4 (Android 12)",
                'app-type': "liantongyunpanapp",
                'Client-Id': "1001000035",
                'App-Version': "yp-app/4.0.4",
                'Sys-Version': "Android/12",
                'X-YP-Client-Id': "1001000035",
                'X-YP-Access-Token': self.cloudDisk.userToken,
            }
        else:
             headers = {
                'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301}",
                'Content-Type': 'application/json',
                'X-YP-Access-Token': self.cloudDisk.userToken,
                'accesstoken': self.cloudDisk.userToken,
                'token': self.cloudDisk.userToken,
                'clientId': "1001000003",
                'X-YP-Client-Id': "1001000003",
                'source-type': "woapi",
                'app-type': "unicom"
             }
        for attempt in range(1, 4):
            try:
                 res = self.session.post(self.cloudDiskUrls['userticket'], json={}, headers=headers, timeout=15).json()
                 if res and isinstance(res, dict) and res.get('result', {}).get('ticket'):
                     self.cloudDisk.userticket = res['result']['ticket']
                     return self.cloudDisk.userticket
                 else:
                     self.log(f"get_userticket_cloud failed: {res}")
                     return None
            except Exception as e:
                 self.log(f"[get_userticket_cloud] 请求异常[{e}]，重试第{attempt}次")
                 time.sleep(2)
        return None

    def get_userInfo_cloud(self):
        if not self.get_userticket_cloud(False): return
        data = self.cloudRequest('userInfo', {}, False, 'post')
        res = data.get('result')
        headers = data.get('headers')
        if headers:
            cookie = headers.get('Set-Cookie', '')
            match = re.search(r'_jea_id=([^;]+)', cookie)
            if match:
                self.cloudDisk.jeaId = match.group(1)
        if res and res.get('data'):
             avail = res['data'].get('availableScore')
             today_earn = res['data'].get('todayEarnScore', 0)
             if not hasattr(self.cloudDisk, 'initial_avail'):
                 self.cloudDisk.initial_avail = avail
                 self.log(f"云盘任务: 运行前 - 今日已赚: {today_earn}, 可用积分: {avail}")
             else:
                 earned = int(avail) - int(self.cloudDisk.initial_avail)
                 self.log(f"云盘任务: 运行后 - 今日已赚: {today_earn}, 可用: {avail}, 本次获得: {earned}", notify=True)

    def do_ai_interaction_cloud(self, taskCode, taskName):
        self.log(f"云盘任务: 执行AI通通查询请求...")
        payload = {
          "input": "你好",
          "platform": 2,
          "modelId": 0,
          "tag": 21,
          "subTag": 210000,
          "conversationId": "",
          "knowledgeId": "",
          "referFileInfo": []
        }
        data = self.cloudRequest('ai_query', payload, False, 'post')
        body = data.get('body', '')
        if body and ('"finish":1' in body or 'success' in body):
             self.log(f"云盘任务: ✅ [{taskName}] 互动成功")
             self.doPopUp_cloud(taskCode, taskName, False)
             return True
        self.log(f"云盘任务: ❌ [{taskName}] 互动失败")
        return False

    def get_cloud_upload_file_path(self):
        custom_path = os.environ.get("UNICOM_CLOUD_UPLOAD_FILE", "").strip()
        if custom_path:
            full_path = os.path.abspath(custom_path)
            if os.path.isfile(full_path):
                return full_path
            self.log(f"云盘任务: 上传文件不存在: {full_path}")
            return None
        seed_path = os.path.join(tempfile.gettempdir(), "unicom_cloud_upload_seed.jpg")
        target_size = max(UNICOM_CLOUD_UPLOAD_PROGRESS_BYTES, 1024)
        if not os.path.exists(seed_path) or os.path.getsize(seed_path) != target_size:
            seed_bytes = base64.b64decode("/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBAQEBAPEA8PEA8QDw8PDw8QDw8QFREWFhURFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lICYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAgMBIgACEQEDEQH/xAAXAAADAQAAAAAAAAAAAAAAAAAAAQID/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB6A//xAAXEAEAAwAAAAAAAAAAAAAAAAABAAIR/9oACAEBAAEFAkqf/8QAFBEBAAAAAAAAAAAAAAAAAAAAEP/aAAgBAwEBPwEf/8QAFBEBAAAAAAAAAAAAAAAAAAAAEP/aAAgBAgEBPwEf/8QAFBABAAAAAAAAAAAAAAAAAAAAEP/aAAgBAQAGPwJf/8QAFBABAAAAAAAAAAAAAAAAAAAAEP/aAAgBAQABPyFf/9k=")
            with open(seed_path, "wb") as f:
                f.write(seed_bytes)
                if target_size > len(seed_bytes):
                    f.seek(target_size - 1)
                    f.write(b"\0")
        return seed_path

    def get_cloud_upload_progress_bytes(self, file_size=0):
        progress_bytes = max(int(UNICOM_CLOUD_UPLOAD_PROGRESS_BYTES or 0), 1)
        if file_size and int(file_size) > 0:
            return min(int(file_size), progress_bytes)
        return progress_bytes

    def parse_cloud_size_to_bytes(self, value):
        match = re.search(r'(\d+(?:\.\d+)?)\s*([KMGT])', str(value).upper())
        if not match:
            return 0
        unit_power = {'K': 1, 'M': 2, 'G': 3, 'T': 4}
        return int(float(match.group(1)) * (1024 ** unit_power[match.group(2)]))

    def get_cloud_upload_times(self, task, file_size):
        progress_list = task.get('taskExtend', {}).get('taskProgressVOList', []) or []
        targets = []
        for item in progress_list:
            size_bytes = self.parse_cloud_size_to_bytes(item.get('progressName'))
            if size_bytes > 0:
                targets.append(size_bytes)
        finished = max(int(task.get('finishCount', 0) or 0), 0)
        stage_goal = finished + 1
        progress_bytes = self.get_cloud_upload_progress_bytes(file_size)
        if targets:
            stage_goal = min(stage_goal, len(targets))
            final_target = targets[stage_goal - 1]
            completed_target = targets[min(finished, len(targets)) - 1] if finished > 0 else 0
            remaining_bytes = max(final_target - completed_target, 0)
            if remaining_bytes <= 0:
                return 0, stage_goal
            return max((remaining_bytes + progress_bytes - 1) // progress_bytes, 1), stage_goal
        required = max(int(task.get('needCount', 0) or 0), 0)
        if required > 0:
            stage_goal = min(stage_goal, required)
        remaining = max(stage_goal - finished, 0)
        return remaining, stage_goal

    def query_cloud_task_list_cloud(self):
        if not self.get_userticket_cloud(False):
            return []
        data = self.cloudRequest('taskDetail', {}, False, 'post')
        if not isinstance(data, dict):
            self.log("云盘任务: taskDetail 返回结构异常，已跳过本轮任务列表")
            return []
        res = data.get('result')
        if not isinstance(res, dict):
            body = str(res).replace('\r', ' ').replace('\n', ' ').strip()[:120]
            self.log(f"云盘任务: taskDetail 返回异常，已跳过本轮任务列表 (status={data.get('status')}, body={body or 'None'})")
            return []
        task_detail = res.get('data', {}).get('taskDetail', {})
        if not isinstance(task_detail, dict):
            self.log("云盘任务: taskDetail 数据结构异常，已跳过本轮任务列表")
            return []
        return task_detail.get('taskList', []) or []

    def query_task_records_cloud(self, cursor=""):
        if not self.get_userticket_cloud(False):
            return []
        data = self.cloudRequest('taskRecords', {"cursor": cursor}, False, 'post')
        if not isinstance(data, dict):
            self.log("云盘任务: taskRecords 返回结构异常，已跳过积分明细查询")
            return []
        res = data.get('result')
        if not isinstance(res, dict):
            body = str(res).replace('\r', ' ').replace('\n', ' ').strip()[:120]
            self.log(f"云盘任务: taskRecords 返回异常，已跳过积分明细查询 (status={data.get('status')}, body={body or 'None'})")
            return []
        return res.get('data', []) or []

    def init_cloud_task_records_state(self):
        records = self.query_task_records_cloud("")
        self.cloudDisk.knownTaskRecordIds = {str(item.get('id')) for item in records if item.get('id')}

    def match_new_cloud_task_record(self, task_name, before_ids=None):
        records = self.query_task_records_cloud("")
        known_ids = set(before_ids if before_ids is not None else getattr(self.cloudDisk, 'knownTaskRecordIds', set()))
        new_record = None
        for item in records:
            record_id = str(item.get('id') or '')
            if not record_id or record_id in known_ids:
                continue
            if item.get('taskName') == task_name and not new_record:
                new_record = item
            known_ids.add(record_id)
        self.cloudDisk.knownTaskRecordIds = known_ids
        return new_record

    def get_cloud_task_by_code_cloud(self, task_code):
        if not task_code:
            return None
        for task in self.query_cloud_task_list_cloud():
            if task.get('taskCode') == task_code:
                return task
        return None

    def finalize_generic_task_cloud(self, task_code, task_name):
        current_task = self.get_cloud_task_by_code_cloud(task_code)
        if not isinstance(current_task, dict):
            return
        finish_text = current_task.get('finishText')
        finished = int(current_task.get('finishCount', 0) or 0)
        required = int(current_task.get('needCount', 0) or 0)
        if finish_text == "待领取":
            self.doPopUp_cloud(task_code, task_name, False)
            return
        if finish_text in ["已完成", "已领取"] or (required > 0 and finished >= required):
            record = self.match_new_cloud_task_record(task_name)
            if record:
                self.log(f"云盘任务: ✅ [{task_name}] 完成, 获得积分: {record.get('earnScoreDesc')}")
            else:
                self.log(f"云盘任务: ✅ [{task_name}] 已完成")

    def get_cloud_upload_name_cloud(self):
        return os.environ.get("UNICOM_CLOUD_UPLOAD_FILENAME", "8648").strip() or "8648"

    def doUpload_cloud(self, taskCode, taskName, prefix="云盘任务", notify=True):
        token = getattr(self.cloudDisk, 'userToken', '')
        upload_path = self.get_cloud_upload_file_path()
        if not token or not upload_path:
            return False
        file_size = os.path.getsize(upload_path)
        progress_file_size = self.get_cloud_upload_progress_bytes(file_size)
        file_name = self.get_cloud_upload_name_cloud()
        headers = {
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0",
            'Accept-Encoding': "gzip, deflate, br, zstd",
            'Origin': "https://pan.wo.cn",
            'Referer': "https://pan.wo.cn/",
            'Accept-Language': "zh-CN,zh;q=0.9",
            'Sec-Fetch-Site': "same-site",
            'Sec-Fetch-Mode': "cors",
            'Sec-Fetch-Dest': "empty",
        }
        for attempt in range(1, 3):
            request_time = str(int(time.time() * 1000))
            file_info = self.encrypt_data_cloud(json.dumps({
                "spaceType": "0",
                "directoryId": "0",
                "batchNo": datetime.now().strftime("%Y%m%d"),
                "fileName": file_name,
                "fileSize": progress_file_size,
                "fileType": "1",
            }, ensure_ascii=False, separators=(',', ':')), token)
            try:
                with open(upload_path, 'rb') as file_obj:
                    files = {
                        "uniqueId": (None, f"{request_time}_{''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=6))}"),
                        "accessToken": (None, token),
                        "fileName": (None, file_name),
                        "psToken": (None, "undefined"),
                        "fileSize": (None, str(file_size)),
                        "totalPart": (None, "1"),
                        "partSize": (None, str(file_size)),
                        "partIndex": (None, "1"),
                        "channel": (None, "wocloud"),
                        "directoryId": (None, "0"),
                        "fileInfo": (None, file_info),
                        "file": (file_name, file_obj, "image/jpeg"),
                    }
                    res = self.request_direct("POST", self.cloudDiskUrls['upload2C'], headers=headers, files=files, timeout=UNICOM_CLOUD_UPLOAD_TIMEOUT)
                res_json = {}
                try:
                    res_json = res.json()
                except:
                    pass
                meta_code = str(res_json.get('meta', {}).get('code', ''))
                code = str(res_json.get('code', ''))
                if res.status_code == 200 and (not res_json or meta_code in ('200', '0', '0000') or code in ('200', '0', '0000')):
                    self.cloudDisk.uploadedFileCount = int(getattr(self.cloudDisk, 'uploadedFileCount', 0) or 0) + 1
                    self.log(f"{prefix}: [{taskName}] 上传成功")
                    if taskCode:
                        time.sleep(1)
                        self.doPopUp_cloud(taskCode, taskName, False, notify=notify)
                    return True
                if attempt < 2 and res.status_code >= 500:
                    self.log(f"{prefix}: [{taskName}] 上传返回 {res.status_code}，重建请求重试一次")
                    time.sleep(2)
                    continue
                self.log(f"{prefix}: ❌ [{taskName}] 上传失败: HTTP {res.status_code} {res_json if res_json else res.text[:200]}")
                return False
            except Exception as e:
                if attempt < 2:
                    self.log(f"{prefix}: [{taskName}] 上传异常，重建请求重试一次: {e}")
                    time.sleep(2)
                    continue
                self.log(f"{prefix}: ❌ [{taskName}] 上传异常: {e}")
        return False

    def doPopUp_cloud(self, taskCode, taskName, is_changer, notify=True):
        if not self.get_userticket_cloud(is_changer): return
        known_ids = set(getattr(self.cloudDisk, 'knownTaskRecordIds', set()))
        time.sleep(5)
        data = self.cloudRequest('doPopUp', {}, is_changer, 'post')
        res = data.get('result')
        if not isinstance(res, dict):
             res = {}
        code = res.get('meta', {}).get('code')
        code2 = res.get('code')
        if str(code) == "0000" or str(code) == "0" or str(code2) == "0000" or str(code2) == "0":
             record = self.match_new_cloud_task_record(taskName, known_ids)
             if record:
                 score_desc = record.get('earnScoreDesc') or res.get('data', {}).get('score', 0)
                 self.log(f"云盘任务: ✅ [{taskName}] 完成, 获得积分: {score_desc}", notify=notify)
                 return
             score = res.get('data', {}).get('score', 0)
             if str(score) not in ('', '0', '0积分'):
                 self.log(f"云盘任务: ✅ [{taskName}] 领取到积分: {score}，但未在积分明细匹配到当前任务", notify=notify)
             else:
                 self.log(f"云盘任务: ✅ [{taskName}] 完成", notify=notify)
        else:
             self.log(f"云盘任务: ❌ [{taskName}] 领取奖励失败: {res}")

    def toFinish_cloud(self, taskCode, taskName, is_changer):
        if not self.get_userticket_cloud(is_changer): return False
        data = self.cloudRequest('toFinish', {'taskCode': taskCode}, is_changer, 'post')
        res = data.get('result')
        if not isinstance(res, dict):
             res = {}
        if res.get('code') == "0000": return True
        return False

    def dosign_cloud(self, taskCode, taskName):
        if not self.get_userticket_cloud(False): return
        data = self.cloudRequest('dosign', {'taskCode': taskCode}, False, 'post')
        res = data.get('result')
        if not isinstance(res, dict):
             res = {}
        if "0000" in str(res.get('code')) and res.get('data', {}).get('score'):
             self.log(f"云盘任务: ✅ [{taskName}] 完成, 获得积分: {res['data']['score']}", notify=True)
        else:
             self.log(f"云盘任务: ❌ [{taskName}] 失败: {res}")

    def get_taskDetail_cloud(self):
        taskList = self.query_cloud_task_list_cloud()
        if taskList:
            names = [t.get('taskName', '?') for t in taskList]
            self.log(f"云盘任务: 任务列表({len(taskList)}): {', '.join(names)}")
        else:
            self.log("云盘任务: 任务列表为空")
            return
        for task in taskList:
            time.sleep(0.5)
            tName = task.get('taskName', '')
            tCode = task.get('taskCode')
            finishText = task.get('finishText')
            finished = int(task.get('finishCount', 0))
            required = int(task.get('needCount', 0))
            if finishText == "待领取":
                self.log(f"云盘任务: [{tName}] 待领取")
                self.doPopUp_cloud(tCode, tName, False)
                continue
            if finishText in ["已完成", "已领取"] or task.get('finishState', False) == True or (required > 0 and finished >= required):
                self.log(f"云盘任务: ✅ [{tName}] 已完成")
                continue
            self.log(f"云盘任务: 开始执行 [{tName}] 进度: {finished}/{required}")
            if "签到" in tName:
                self.toFinish_cloud(tCode, tName, False)
                self.dosign_cloud(tCode, tName)
            elif "与AI通通互动" in tName:
                self.toFinish_cloud(tCode, tName, False)
                self.do_ai_interaction_cloud(tCode, tName)
            elif "微信备份" in tName or "通讯录备份" in tName:
                self.log(f"云盘任务: [{tName}] 暂未适配，当前缺少该任务专用协议，先跳过")
            elif "当月上传容量满1GB" in tName:
                upload_path = self.get_cloud_upload_file_path()
                if not upload_path:
                    continue
                start_finished = int(task.get('finishCount', 0) or 0)
                upload_times, target_stage = self.get_cloud_upload_times(task, os.path.getsize(upload_path))
                if upload_times <= 0:
                    self.log(f"云盘任务: [{tName}] 当前阶段已完成，跳过上传")
                    continue
                extra_times = max(5, (upload_times + 9) // 10)
                max_upload_times = upload_times + extra_times
                self.toFinish_cloud(tCode, tName, False)
                self.log(f"云盘任务: 开始执行1GB上传任务(本次目标阶段 {target_stage}/{max(int(task.get('needCount', 0) or 0), target_stage)}，预计{upload_times}次，最多{max_upload_times}次，达到本阶段即停止)...")
                upload_ok = 0
                for upload_i in range(max_upload_times):
                    self.log(f"云盘任务: 第{upload_i + 1}/{max_upload_times}次上传")
                    if self.doUpload_cloud(tCode, tName, notify=False):
                        upload_ok += 1
                    should_check = upload_ok > 0 and ((upload_i + 1) >= upload_times or upload_ok % 5 == 0)
                    if should_check:
                        current_task = self.get_cloud_task_by_code_cloud(tCode)
                        if current_task:
                            current_finished = int(current_task.get('finishCount', 0) or 0)
                            current_required = int(current_task.get('needCount', 0) or 0)
                            self.log(f"云盘任务: [{tName}] 当前阶段进度 {current_finished}/{current_required}")
                            if current_finished >= target_stage or current_task.get('finishText') in ["已完成", "已领取"]:
                                reached_text = "已达到本阶段目标" if current_finished < current_required else "已达到本月目标"
                                self.log(f"云盘任务: ✅ [{tName}] {reached_text}，停止继续上传", notify=True)
                                break
                    time.sleep(2)
                current_task = self.get_cloud_task_by_code_cloud(tCode)
                current_finished = int(current_task.get('finishCount', 0) or 0) if current_task else start_finished
                stage_status = "已完成本阶段" if current_finished >= target_stage else "未完成本阶段"
                self.log(f"云盘任务: ✅ [{tName}] 上传完成 {upload_ok}/{max_upload_times} 次，{stage_status}", notify=True)
            else:
                self.run_generic_cloud_task(tCode, tName)

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
                "secret": True,
            },
        }
        headers = {
            'User-Agent': 'LianTongYunPan/5.1.2 (Android 10)',
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Access-Token': token,
            'accesstoken': token,
            'Client-Id': str(client_id),
        }
        try:
            return self.session.post(self.cloudDiskUrls['ltypDispatcher'], json=payload, headers=headers, timeout=timeout).json()
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

    def vote_cloud(self):
        token = getattr(self.cloudDisk, 'userToken', '')
        if not token:
            return
        ypid_list = getattr(self.cloudDisk, 'ypid_list', [])
        if not ypid_list:
            return
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) LianTongYunPan/4.0.2 (iPhone; iOS 16.6)",
            'Sec-Fetch-Mode': 'cors',
            'clientId': '1001000165',
            'Origin': 'https://panservice.mail.wo.cn',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Site': 'same-origin',
            'X-YP-Access-Token': token, 'token': token,
            'X-YP-Client-Id': '1001000165',
            'X-SH-Access-Token': '',
            'source-type': 'woapi',
        }
        for idx in range(3):
            try:
                self.session.post(
                    self.cloudDiskUrls['vote'], json={"activityId": "MjQ=", "id": random.choice(ypid_list)},
                    headers=headers, timeout=10,
                )
                self.log(f"云盘任务: 第{idx + 1}次投票")
            except Exception as e:
                self.log(f"云盘任务: 第{idx + 1}次投票失败: {e}")
            time.sleep(1)

    def build_cloud_lottery_headers(self):
        token = getattr(self.cloudDisk, 'userToken', '')
        if not token:
            return {}
        return {
            'User-Agent': "Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.146 Mobile Safari/537.36/woapp LianTongYunPan/5.1.2 (Android 10)",
            'Accept': 'application/json, text/plain, */*',
            'source-type': 'woapi',
            'Sec-Fetch-Site': 'same-origin',
            'clientId': '1001000165',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'token': token,
            'X-SH-Access-Token': '',
            'Sec-Fetch-Mode': 'cors',
            'X-YP-Access-Token': token,
            'X-YP-Client-Id': '1001000165',
            'X-Requested-With': 'com.chinaunicom.bol.cloudapp',
            'X-YP-GRAY-FLAG': 'undefined',
            'Sec-Fetch-Dest': 'empty',
        }

    def build_cloud_hometown_headers(self, extra=None):
        token = getattr(self.cloudDisk, 'userToken', '')
        if not token:
            return {}
        headers = {
            'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) LianTongYunPan/5.1.0 (iPhone; iOS 16.6)",
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'source-type': 'woapi',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'clientId': '1001000165',
            'X-YP-Client-Id': '1001000165',
            'X-YP-Access-Token': token,
            'token': token,
            'X-SH-Access-Token': '',
            'X-YP-GRAY-FLAG': 'undefined',
            'requestTime': str(int(time.time() * 1000)),
        }
        if extra:
            headers.update(extra)
        return headers

    def build_cloud_activity_headers(self, activity_id=""):
        token = getattr(self.cloudDisk, 'userToken', '')
        if not token:
            return {}
        headers = {
            'User-Agent': "Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.146 Mobile Safari/537.36/woapp LianTongYunPan/5.1.2 (Android 10)",
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'source-type': 'woapi',
            'clientId': '1001000165',
            'client-Id': '1001000165',
            'token': token,
            'accessToken': token,
            'access-token': token,
            'X-YP-Access-Token': token,
            'X-YP-Client-Id': '1001000165',
            'X-SH-Access-Token': '',
            'X-Requested-With': 'com.chinaunicom.bol.cloudapp',
            'X-YP-GRAY-FLAG': 'undefined',
            'Origin': 'https://panservice.mail.wo.cn',
        }
        if activity_id:
            point_ticket = getattr(self.cloudDisk, 'ticket', '')
            mobile = getattr(self, 'account_mobile', '') or getattr(self, 'mobile', '')
            if activity_id == 'MjU=' and point_ticket and mobile:
                headers['Referer'] = (
                    "https://panservice.mail.wo.cn/h5/activitymobile/fileUploadActive"
                    "?touchpoint=300200030001&type=06"
                    f"&ticket={point_ticket}"
                    "&version=iphone_c%4012.0801"
                    f"&timestamp={int(time.time() * 1000)}"
                    f"&desmobile={mobile}"
                    "&num=0&postage=01addda9786dc7eb5ca0eacd9acd664a"
                    f"&activityId={quote(activity_id)}&clientid=1001000003"
                    f"&userNumber={mobile}"
                )
            else:
                headers['Referer'] = f"https://panservice.mail.wo.cn/h5/activitymobile/fileUploadActive?touchpoint=300300010005&activityId={quote(activity_id)}&token={token}"
        return headers

    def get_cloud_lottery_draw_count(self, times_res):
        result = times_res.get('result')
        if isinstance(result, int):
            return result
        if not isinstance(result, dict):
            return 0
        draw_count = result.get('times')
        if draw_count is None:
            for key in ['lotteryTimes', 'freeTimes', 'drawTimes', 'count']:
                if key in result:
                    draw_count = result.get(key)
                    break
        try:
            return int(draw_count or 0)
        except:
            return 0

    def query_cloud_phone_location_cloud(self):
        province_code = str(getattr(self.cloudDisk, 'hometownProvinceCode', '') or '')
        province_name = str(getattr(self.cloudDisk, 'hometownProvinceName', '') or '')
        if province_code and province_name:
            return province_code, province_name
        token = getattr(self.cloudDisk, 'userToken', '')
        mobile = getattr(self, 'account_mobile', '') or getattr(self, 'mobile', '')
        headers = self.build_cloud_hometown_headers({"X-SH-Access-Token": ""})
        if not token or not mobile or not headers:
            return "", ""
        try:
            res = self.session.post(
                self.cloudDiskUrls['queryPhoneLocation'],
                json={"mobile": self.encrypt_data_cloud(mobile, "CBWGjFHjZdhTf7h8")},
                headers=headers,
                timeout=10,
            ).json()
            if str(res.get('meta', {}).get('code')) == '200':
                result = res.get('result') or {}
                province_code = str(result.get('provinceCode') or '')
                province_name = str(result.get('provinceName') or '')
                if province_code and province_name:
                    self.cloudDisk.hometownProvinceCode = province_code
                    self.cloudDisk.hometownProvinceName = province_name
                    self.log(f"家乡打卡 - 归属地: {province_name}({province_code})")
                    return province_code, province_name
            self.log(f"云盘任务: 查询号码归属地失败: {res}")
        except Exception as e:
            self.log(f"云盘任务: 查询号码归属地异常: {e}")
        return "", ""

    def get_cloud_activity_province(self):
        province_code = str(getattr(self.cloudDisk, 'hometownProvinceCode', '') or '')
        province_name = str(getattr(self.cloudDisk, 'hometownProvinceName', '') or '')
        if province_code and province_name:
            return province_code, province_name
        province_code, province_name = self.query_cloud_phone_location_cloud()
        if province_code and province_name:
            return province_code, province_name
        if (not hasattr(self, 'city_info')) or (not self.city_info):
            self.get_city_info()
        if not isinstance(getattr(self, 'city_info', None), list) or not self.city_info:
            return "", ""
        city = self.city_info[0] if isinstance(self.city_info[0], dict) else {}
        province_code = str(city.get('proCode') or city.get('standardProvinceCode') or "").lstrip('0')
        province_name = str(city.get('proName') or city.get('provinceName') or "")
        if province_code and province_name:
            self.cloudDisk.hometownProvinceCode = province_code
            self.cloudDisk.hometownProvinceName = province_name
        return province_code, province_name

    def query_cloud_lottery_times_cloud(self, activity_id, headers=None):
        if not activity_id:
            return None
        use_headers = dict(headers or self.build_cloud_lottery_headers())
        if not use_headers:
            return None
        use_headers['requestTime'] = str(int(time.time() * 1000))
        res = self.session.get(self.cloudDiskUrls['lottery_times'], params={"activityId": activity_id}, headers=use_headers, timeout=10).json()
        self.cloudDisk.lotteryTimesResult = res
        return res

    def ensure_cloud_lottery_activity_open_cloud(self, activity_id):
        headers = self.build_cloud_activity_headers(activity_id)
        if not headers:
            return False
        try:
            check_headers = dict(headers)
            check_headers['requestTime'] = str(int(time.time() * 1000))
            check_res = self.session.get(self.cloudDiskUrls['checkActivityStatus'], params={"activityId": activity_id}, headers=check_headers, timeout=10).json()
            if str(check_res.get('meta', {}).get('code')) == '200' and str(check_res.get('result', {}).get('state')) == '1':
                if activity_id == 'MjU=':
                    self.log("家乡打卡 - 开启结果：开启成功")
                return True
        except Exception as e:
            self.log(f"云盘任务: 查询抽奖活动开启状态失败: {e}")
        province_code, province_name = self.get_cloud_activity_province()
        if not province_code or not province_name:
            self.log("云盘任务: 开启抽奖活动失败，缺少省份信息")
            return False
        try:
            open_headers = dict(headers)
            open_headers['requestTime'] = str(int(time.time() * 1000))
            res = self.session.post(
                self.cloudDiskUrls['openActivity'],
                json={"activityId": activity_id, "provinceCode": province_code, "provinceName": province_name},
                headers=open_headers,
                timeout=10,
            ).json()
            if str(res.get('meta', {}).get('code')) == '200' and str(res.get('result', {}).get('state')) == '1':
                if activity_id == 'MjU=':
                    self.log("家乡打卡 - 开启结果：开启成功")
                else:
                    self.log(f"云盘任务: 抽奖活动[{activity_id}] 已开启")
                return True
            if activity_id == 'MjU=':
                message = res.get('msg') or res.get('meta', {}).get('message') or '开启失败'
                self.log(f"家乡打卡 - 开启结果：{message}")
            else:
                self.log(f"云盘任务: 开启抽奖活动失败: {res}")
        except Exception as e:
            self.log(f"云盘任务: 开启抽奖活动异常: {e}")
        return False

    def query_cloud_lottery_record_cloud(self, activity_id):
        if not activity_id:
            return None
        headers = self.build_cloud_hometown_headers() if activity_id == 'MjU=' else self.build_cloud_lottery_headers()
        if not headers:
            return None
        try:
            response = self.session.get(
                f"https://panservice.mail.wo.cn/activity/lottery/recordList?activityId={quote(activity_id)}",
                headers=headers,
                timeout=10,
            )
            result = response.json() if response.status_code == 200 else None
            if not isinstance(result, dict):
                return None
            if str(result.get('meta', {}).get('code')) == '200':
                record_list = result.get('result') or []
                prize = record_list[0].get('prizeName', '暂无抽奖记录') if record_list else '暂无抽奖记录'
                if activity_id == 'MjU=':
                    self.log(f"家乡打卡 - 上次抽奖：{prize}")
                return prize
        except Exception as e:
            self.log(f"云盘任务: 查询抽奖记录异常: {e}")
        return None

    def do_activity_upload_cloud(self, activity_id):
        token = getattr(self.cloudDisk, 'userToken', '')
        upload_path = self.get_cloud_upload_file_path()
        if not token or not upload_path:
            return False
        file_size = os.path.getsize(upload_path)
        file_name = self.get_cloud_upload_name_cloud()
        file_info = self.encrypt_data_cloud(json.dumps({
            "batchNo": datetime.now().strftime("%Y%m%d%H%M%S"),
            "fileName": file_name,
            "fileSize": file_size,
            "fileType": 1,
            "directoryId": "0",
            "spaceType": "0",
        }, ensure_ascii=False, separators=(',', ':')), token)
        headers = {
            'User-Agent': "Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.146 Mobile Safari/537.36/woapp LianTongYunPan/5.1.2 (Android 10)",
            'Accept': '*/*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Origin': 'https://panservice.mail.wo.cn',
            'Referer': f"https://panservice.mail.wo.cn/h5/activitymobile/fileUploadActive?touchpoint=300300010005&activityId={quote(activity_id)}&token={token}",
            'X-Requested-With': 'com.chinaunicom.bol.cloudapp',
            'accessToken': token,
            'access-token': token,
            'client_id': '1001000165',
            'X-YP-GRAY-FLAG': 'undefined',
            'requestTime': str(int(time.time() * 1000)),
        }
        try:
            if activity_id == 'MjU=':
                self.log("开始家乡打卡文件上传...")
            with open(upload_path, 'rb') as file_obj:
                files = {
                    "uniqueId": (None, f"{int(time.time() * 1000)}_{random.random()}"),
                    "accessToken": (None, token),
                    "psToken": (None, "undefined"),
                    "totalPart": (None, "1"),
                    "partSize": (None, str(file_size)),
                    "partIndex": (None, "1"),
                    "channel": (None, "wocloud"),
                    "directoryId": (None, "0"),
                    "fileName": (None, file_name),
                    "fileSize": (None, str(file_size)),
                    "fileInfo": (None, file_info),
                    "file": (file_name, file_obj, "image/jpeg"),
                }
                res = self.request_direct("POST", self.cloudDiskUrls['activityUpload2C'], headers=headers, files=files, timeout=UNICOM_CLOUD_UPLOAD_TIMEOUT)
            res_json = {}
            try:
                res_json = res.json()
            except:
                pass
            code = str(res_json.get('code', ''))
            meta_code = str(res_json.get('meta', {}).get('code', ''))
            if res.status_code == 200 and (code in ('200', '0', '0000') or meta_code in ('200', '0', '0000')):
                self.cloudDisk.uploadedFileCount = int(getattr(self.cloudDisk, 'uploadedFileCount', 0) or 0) + 1
                if activity_id == 'MjU=':
                    self.log("家乡打卡 - 上传成功")
                else:
                    self.log("云盘任务: 活动上传成功，正在刷新抽奖次数...")
                return True
            if activity_id == 'MjU=':
                self.log(f"家乡打卡 - 上传失败: HTTP {res.status_code}")
            else:
                self.log(f"云盘任务: 活动上传失败: HTTP {res.status_code} {res_json if res_json else res.text[:200]}")
        except Exception as e:
            if activity_id == 'MjU=':
                self.log(f"家乡打卡 - 上传异常: {e}")
            else:
                self.log(f"云盘任务: 活动上传异常: {e}")
        return False

    def wait_cloud_lottery_times_cloud(self, activity_id, wait_seconds=8):
        headers = self.build_cloud_lottery_headers()
        if not headers:
            return None
        for _ in range(wait_seconds):
            time.sleep(1)
            try:
                res = self.query_cloud_lottery_times_cloud(activity_id, headers)
                if isinstance(res, dict) and str(res.get('meta', {}).get('code')) == '200' and self.get_cloud_lottery_draw_count(res) > 0:
                    return res
            except Exception:
                pass
        return getattr(self.cloudDisk, 'lotteryTimesResult', None)

    def get_cloud_lottery_activity_id_cloud(self):
        if getattr(self.cloudDisk, 'lotteryActivityId', None):
            return self.cloudDisk.lotteryActivityId
        headers = self.build_cloud_lottery_headers()
        if not headers:
            return None
        custom_id = os.environ.get("UNICOM_CLOUD_LOTTERY_ACTIVITY_ID", "").strip()
        activity_id = custom_id or "MjU="
        try:
            check_headers = dict(headers)
            check_headers['requestTime'] = str(int(time.time() * 1000))
            res = self.session.get(self.cloudDiskUrls['lottery_times'], params={"activityId": activity_id}, headers=check_headers, timeout=10).json()
            meta_code = str(res.get('meta', {}).get('code'))
            if meta_code in ('200', '90003603'):
                self.cloudDisk.lotteryActivityId = activity_id
                self.cloudDisk.lotteryTimesResult = res
                self.log("云盘任务: 开始执行抽奖活动")
                return activity_id
            self.log(f"云盘任务: 抽奖活动[{activity_id}] 无效: {res}")
        except Exception as e:
            self.log(f"云盘任务: 查询抽奖活动[{activity_id}]失败: {e}")
        return None

    def draw_lottery_cloud(self):
        headers = self.build_cloud_lottery_headers()
        if not headers:
            return
        activity_id = self.get_cloud_lottery_activity_id_cloud()
        if not activity_id:
            self.log("云盘任务: 未找到有效抽奖活动")
            return
        try:
            times_res = getattr(self.cloudDisk, 'lotteryTimesResult', None)
            if not isinstance(times_res, dict):
                times_res = self.query_cloud_lottery_times_cloud(activity_id, headers)
            times_code = str(times_res.get('meta', {}).get('code'))
            draw_count = self.get_cloud_lottery_draw_count(times_res) if times_code == '200' else 0
            if times_code == '90003603' or draw_count <= 0:
                if self.ensure_cloud_lottery_activity_open_cloud(activity_id) and self.do_activity_upload_cloud(activity_id):
                    refreshed = self.wait_cloud_lottery_times_cloud(activity_id)
                    if isinstance(refreshed, dict):
                        times_res = refreshed
                        times_code = str(times_res.get('meta', {}).get('code'))
                        draw_count = self.get_cloud_lottery_draw_count(times_res) if times_code == '200' else 0
            if activity_id == 'MjU=':
                self.query_cloud_lottery_record_cloud(activity_id)
            if times_code == '90003603':
                if activity_id == 'MjU=':
                    self.log("家乡打卡 - 抽奖失败：没有抽奖机会")
                else:
                    self.log(f"云盘任务: 抽奖活动[{activity_id}] 活动上传后仍未获得抽奖次数")
                return
            if times_code != '200':
                self.log(f"云盘任务: 查询抽奖次数失败: {times_res}")
                return
            if draw_count <= 0:
                if activity_id == 'MjU=':
                    self.log("家乡打卡 - 抽奖失败：没有抽奖机会")
                else:
                    self.log(f"云盘任务: 抽奖活动[{activity_id}] 当前无抽奖次数")
                return
            for _ in range(draw_count):
                draw_headers = dict(headers)
                draw_headers['requestTime'] = str(int(time.time() * 1000))
                res = self.session.post(self.cloudDiskUrls['lottery'], json={"activityId": activity_id}, headers=draw_headers, timeout=10).json()
                if res.get('meta', {}).get('code') == '92000017':
                    self.log("云盘任务: 转盘已抽奖")
                    return
                if 'result' in res:
                    if activity_id == 'MjU=':
                        self.log(f"家乡打卡 - 抽奖结果：{res['result'].get('prizeName', '')}", notify=True)
                    else:
                        self.log(f"云盘任务: 转盘获得: {res['result'].get('prizeName', '')}", notify=True)
                    continue
                self.log(f"云盘任务: 抽奖无结果: {res}")
        except Exception as e:
            self.log(f"云盘任务: 抽奖失败: {e}")

    def get_secret_key_cloud(self):
        if getattr(self.cloudDisk, 'secretKey', None):
            return self.cloudDisk.secretKey
        if not getattr(self.cloudDisk, 'userticket', None) or not getattr(self.cloudDisk, 'jeaId', None):
            return None
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) LianTongYunPan/4.0.2 (iPhone; iOS 16.6)",
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Origin': 'https://m.jf.10010.com',
            'Host': 'm.jf.10010.com',
            'clienttype': 'yunpan_iOS',
            'partnersid': '1649',
            'ticket': self.cloudDisk.userticket,
            'Cookie': f"_jea_id={self.cloudDisk.jeaId};",
        }
        try:
            res = self.session.get(self.cloudDiskUrls['secretKey'], headers=headers, timeout=10).json()
            secret = res.get('data', {}).get('secretKey')
            if res.get('code') == '0000' and secret:
                self.cloudDisk.secretKey = secret.encode('utf-8')
                self.log("云盘任务: secretKey 获取成功")
                return self.cloudDisk.secretKey
            self.log(f"云盘任务: getSecretKey 失败: {res}")
        except Exception as e:
            self.log(f"云盘任务: getSecretKey 异常: {e}")
        return None

    def build_signature_headers_cloud(self):
        secret_key = self.get_secret_key_cloud()
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

    def run_generic_cloud_task(self, task_code, task_name):
        self.log(f"云盘任务: [{task_name}] 尝试通用完成接口")
        self.toFinish_cloud(task_code, task_name, False)
        time.sleep(2)
        self.handle_unknown_task_cloud(task_code, task_name)
        time.sleep(3)
        self.finalize_generic_task_cloud(task_code, task_name)

    def handle_unknown_task_cloud(self, task_code, task_name=""):
        token = getattr(self.cloudDisk, 'userToken', '')
        if not token:
            return False
        headers = {
            'User-Agent': 'LianTongYunPan/5.0.4 (iOS 16.3)',
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Accept-Encoding': 'br;q=1.0, gzip;q=0.9, deflate;q=0.8',
            'Access-Token': token, 'X-YP-Access-Token': token,
            'Client-Id': '1001000035', 'X-YP-Client-Id': '1001000035',
            'App-Version': 'yp-app/5.0.4', 'app-type': 'liantongyunpanapp',
            'Sys-Version': 'iOS/16.3',
            'Accept-Language': 'zh-Hans-CN;q=1.0',
        }
        prefix = f"云盘任务: [{task_name}]" if task_name else "云盘任务: 未知任务"
        try:
            res = self.session.post(
                self.cloudDiskUrls['taskFinish'],
                json={"taskCode": task_code, "taskStatus": {"isBackUp": "1"}},
                headers=headers,
                timeout=10,
            ).json()
            meta_code = str(res.get('meta', {}).get('code'))
            if meta_code == '90003600':
                self.log(f"{prefix} 处理完成")
                return True
            if meta_code in ('200', '0') or str(res.get('code')) in ('200', '0', '0000'):
                self.log(f"{prefix} 处理完成: {res.get('msg', res.get('meta', {}).get('message', '成功'))}")
                return True
            self.log(f"{prefix} 处理失败: {res}")
        except Exception as e:
            self.log(f"云盘任务: [{task_name or task_code}] 处理失败: {e}")
        return False

    def ltyp_task(self, is_query_only=False):
        self.log("==== 联通云盘任务 ====")
        self.init_cloud_urls()
        class CloudDiskState: pass
        self.cloudDisk = CloudDiskState()
        if not self.ecs_token:
            self.log("云盘任务: 缺少 ecs_token，跳过。")
            return
        ticket = self.getTicketByNative_cloud()
        if not ticket: return
        if not hasattr(self, 'city_info') or not self.city_info:
             self.get_city_info()
        token = self.get_ltypDispatcher_cloud(ticket)
        if not token: return
        time.sleep(0.5)
        self.get_userInfo_cloud()
        self.init_cloud_task_records_state()
        if is_query_only:
            self.log("云盘任务: [查询模式] 跳过任务执行...")
            self.get_userInfo_cloud()
            return
        time.sleep(0.5)
        self.get_secret_key_cloud()
        self.get_taskDetail_cloud()
        time.sleep(0.5)
        self.get_userInfo_cloud()
        time.sleep(2)
        self.draw_lottery_cloud()
        time.sleep(2)
        self.clean_duplicate_files_cloud()

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
                     self.log(f"安全管家: 更新 jeaId: {self.sec_jeaId}")
        except Exception as e:
            self.log(f"安全管家: getTicketForJF_sec 异常: {e}")

    def get_secret_key_sec(self):
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
                self.log("安全管家: secretKey 获取成功")
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

    def operateBlacklist_sec(self, phone_number, type_val):
        type_name = "添加" if type_val == 0 else "删除"
        self.log(f"安全管家: 正在执行{type_name}黑名单号码: {phone_number}")
        try:
            url = "https://uca.wo116114.com/sjgj/woAssistant/umm/configs/v1/config?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6"
            headers = {
                "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
                "auth-sa-token": self.sec_token,
                "clientType": "uasp_unicom_applet",
                "token": self.sec_token,
                "Cookie": f"devicedId={self.unicomTokenId}"
            }
            data = {
                "productId": "91015539",
                "type": 1,
                "operationType": type_val,
                "contents": [{ "content": phone_number, "contentTag": "", "nickname": None, "configTime": None }]
            }
            if type_val == 0:
                data["blacklistSource"] = 0
            res = self.session.post(url, json=data, headers=headers).json()
            return res
        except Exception as e:
            self.log(f"operateBlacklist_sec error: {e}")
            return None

    def addToBlacklist_sec(self):
        phone_number = "13088888888"
        res = self.operateBlacklist_sec(phone_number, 0)
        success_codes = ['0000', 0]
        if res and (res.get('code') in success_codes or res.get('msg') == '成功'):
            self.log("安全管家: ✅ 添加黑名单成功。")
            return
        is_duplicate = res and res.get('msg') and "号码已存在" in res.get('msg')
        if is_duplicate:
            self.log(f"安全管家: ⚠️ 检测到号码 {phone_number} 已存在，执行先删除后添加流程。")
            del_res = self.operateBlacklist_sec(phone_number, 1)
            is_del_success = del_res and (del_res.get('code') in success_codes or (del_res.get('msg') and ("成功" in del_res.get('msg') or "不在黑名单" in del_res.get('msg'))))
            if is_del_success:
                self.log("安全管家: ✅ 删除旧记录成功，等待 2 秒后重新添加...")
                time.sleep(2)
                retry_res = self.operateBlacklist_sec(phone_number, 0)
                if retry_res and (retry_res.get('code') in success_codes or retry_res.get('msg') == '成功'):
                    self.log("安全管家: ✅ 重新添加黑名单成功。")
                else:
                    self.log(f"安全管家: ❌ 重新添加失败: {retry_res.get('msg')}")
            else:
                self.log("安全管家: ❌ 删除旧记录失败，无法继续添加。")
        else:
            self.log(f"安全管家: ❌ 添加黑名单失败: {res.get('msg') if res else '无响应'}")

    def markPhoneNumber_sec(self):
        try:
            url = "https://uca.wo116114.com/sjgj/unicomAssistant/uasp/configs/v1/addressBook/saveTagPhone?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6"
            headers = {
                "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
                "auth-sa-token": self.sec_token,
                "clientType": "uasp_unicom_applet"
            }
            data = { "tagPhoneNo": "13088330789", "tagIds": [26], "status": 0, "productId": "91311616" }
            self.session.post(url, json=data, headers=headers)
            self.log("安全管家: 执行号码标记。")
        except Exception as e:
            self.log(f"markPhoneNumber_sec error: {e}")

    def syncAddressBook_sec(self):
        try:
            url = "https://uca.wo116114.com/sjgj/unicomAssistant/uasp/configs/v1/addressBookBatchConfig?product_line=uasp&entry_point=h5&entry_point_id=edop_unicom_3a6cc75a"
            headers = {
                "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
                "auth-sa-token": self.sec_token,
                "clientType": "uasp_unicom_applet"
            }
            data = { "addressBookDTOList": [{ "addressBookPhoneNo": "13088888888", "addressBookName": "水水" }], "productId": "91311616", "opType": "1" }
            self.session.post(url, json=data, headers=headers)
            self.log("安全管家: 执行同步通讯录。")
        except Exception as e:
             self.log(f"syncAddressBook_sec error: {e}")

    def setInterceptionRules_sec(self):
        try:
            url = "https://uca.wo116114.com/sjgj/woAssistant/umm/configs/v1/config?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6"
            headers = {
                "User-Agent": "ChinaUnicom4.x/12.3.1 (com.chinaunicom.mobilebusiness; build:77; iOS 16.6.0) Alamofire/4.7.3 unicom{version:iphone_c@12.0301}",
                "auth-sa-token": self.sec_token,
                "clientType": "uasp_unicom_applet"
            }
            data = { "contents": [{ "name": "rings-once", "contentTag": "8", "contentName": "响一声", "content": "0", "icon": "alerting" }], "operationType": 0, "type": 3, "productId": "91311616" }
            self.session.post(url, json=data, headers=headers)
            self.log("安全管家: 执行设置拦截规则。")
        except Exception as e:
             self.log(f"setInterceptionRules_sec error: {e}")

    def viewWeeklyStatus_sec(self):
        try:
            url = "https://uca.wo116114.com/sjgj/unicomAssistant/uasp/configs/v1/weeklySwitchStatus?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6"
            headers = { "auth-sa-token": self.sec_token, "clientType": "uasp_unicom_applet" }
            self.session.post(url, json={ "productId": "91311616" }, headers=headers)
        except: pass

    def queryKeyData_sec(self):
        try:
            url = "https://uca.wo116114.com/sjgj/unicomAssistant/uasp/report/v1/queryKeyData?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6"
            headers = { "auth-sa-token": self.sec_token, "clientType": "uasp_unicom_applet" }
            self.session.post(url, json={ "productId": "91311616" }, headers=headers)
        except: pass

    def viewWeeklySummary_sec(self):
        try:
            url = "https://uca.wo116114.com/sjgj/unicomAssistant/uasp/report/v1/weeklySummary?product_line=uasp&entry_point=h5&entry_point_id=wxdefbc1986dc757a6"
            headers = { "auth-sa-token": self.sec_token, "clientType": "uasp_unicom_applet" }
            self.session.post(url, json={ "productId": "91311616" }, headers=headers)
            self.log("安全管家: 执行查看周报。")
        except: pass

    def receivePoints_sec(self, taskCode):
        try:
            url = "https://m.jf.10010.com/jf-external-application/jftask/receive"
            headers = {
                "ticket": unquote(self.sec_ticket),
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301};ltst;OSVersion/16.6",
                "partnersid": "1702",
                "clienttype": "uasp_unicom_applet",
            }
            headers.update(self.build_signature_headers_sec())
            if hasattr(self, 'sec_jeaId') and self.sec_jeaId:
                headers["Cookie"] = f"_jea_id={self.sec_jeaId};"
            res = self.session.post(url, json={ "taskCode": taskCode }, headers=headers).json()
            if res.get('data') and res['data'].get('score'):
                self.log(f"安全管家: ✅ 领取积分成功: {res['data']['score']} ({res.get('msg')})", notify=True)
            elif res:
                self.log(f"安全管家: ❌ 领取积分失败: {res.get('msg')}")
            else:
                self.log("安全管家: ❌ 领取积分API无响应")
        except Exception as e:
            self.log(f"receivePoints_sec error: {e}")

    def finishTask_sec(self, taskCode, taskName):
        try:
            url = "https://m.jf.10010.com/jf-external-application/jftask/toFinish"
            headers = {
                "ticket": unquote(self.sec_ticket),
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301};ltst;OSVersion/16.6",
                "partnersid": "1702",
                "clienttype": "uasp_unicom_applet",
                "token": self.sec_token,
                "Cookie": f"devicedId={self.unicomTokenId}"
            }
            headers.update(self.build_signature_headers_sec())
            if hasattr(self, 'sec_jeaId') and self.sec_jeaId:
                headers["Cookie"] = f"_jea_id={self.sec_jeaId};"
            self.session.post(url, json={ "taskCode": taskCode }, headers=headers)
            self.log(f"安全管家: 开启任务 [{taskName}]")
            if taskName == "联通助理-添加黑名单":
                self.addToBlacklist_sec()
            elif taskName == "联通助理-号码标记":
                self.markPhoneNumber_sec()
            elif taskName == "联通助理-同步通讯录":
                self.syncAddressBook_sec()
            elif taskName == "联通助理-骚扰拦截设置":
                self.setInterceptionRules_sec()
            elif taskName == "联通助理-查看周报":
                self.viewWeeklyStatus_sec()
                self.queryKeyData_sec()
                self.viewWeeklySummary_sec()
        except Exception as e:
            self.log(f"finishTask_sec error: {e}")

    def signIn_sec(self, taskCode):
        try:
            url = "https://m.jf.10010.com/jf-external-application/jftask/sign"
            headers = {
                "ticket": unquote(self.sec_ticket),
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301};ltst;OSVersion/16.6",
                "partnersid": "1702",
                "clienttype": "uasp_unicom_applet",
            }
            headers.update(self.build_signature_headers_sec())
            if hasattr(self, 'sec_jeaId') and self.sec_jeaId:
                headers["Cookie"] = f"_jea_id={self.sec_jeaId};"
            res = self.session.post(url, json={ "taskCode": taskCode }, headers=headers).json()
            self.log(f"安全管家: 完成签到: {res.get('msg') if res else '状态未知'}")
        except Exception as e:
            self.log(f"signIn_sec error: {e}")

    def executeAllTasks_sec(self):
        try:
            url = "https://m.jf.10010.com/jf-external-application/jftask/taskDetail"
            headers = {
                "ticket": unquote(self.sec_ticket),
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0301};ltst;OSVersion/16.6",
                "partnersid": "1702",
                "clienttype": "uasp_unicom_applet",
            }
            if hasattr(self, 'sec_jeaId') and self.sec_jeaId:
                headers["Cookie"] = f"_jea_id={self.sec_jeaId}"
            res = self.session.post(url, json={}, headers=headers).json()
            if not res or not res.get('data') or not res['data'].get('taskDetail'):
                self.log("安全管家: 查询任务列表失败或响应格式错误。")
                return
            taskList = res['data']['taskDetail']['taskList']
            executableTaskNames = [
                "联通助理-添加黑名单",
                "联通助理-号码标记",
                "联通助理-同步通讯录",
                "联通助理-骚扰拦截设置",
                "联通助理-查看周报"
            ]
            executableTasks = []
            skippedTasks = []
            for task in taskList:
                isKnown = task['taskName'] in executableTaskNames or "签到" in task['taskName']
                if isKnown:
                    executableTasks.append(task)
                else:
                    skippedTasks.append(task)
            unfinished_skipped = [t for t in skippedTasks if t['finishCount'] != t['needCount']]
            if unfinished_skipped:
                skipped_names = ", ".join([f"[{t['taskName']}]" for t in unfinished_skipped])
                self.log(f"安全管家: 跳过: {skipped_names}")
            for task in executableTasks:
                taskName = task['taskName']
                taskCode = task['taskCode']
                finishCount = int(task['finishCount'])
                needCount = int(task['needCount'])
                finishText = task.get('finishText', '')
                self.log(f"安全管家: [{taskName}]: {finishCount}/{needCount} - {finishText}")
                if finishCount != needCount:
                    remaining = needCount - finishCount
                    self.log(f"安全管家: 任务未完成，需要再执行 {remaining} 次")
                    for i in range(remaining):
                        time.sleep(3)
                        try:
                            if "签到" in taskName:
                                self.signIn_sec(taskCode)
                            else:
                                self.finishTask_sec(taskCode, taskName)
                            if "签到" not in taskName:
                                time.sleep(10)
                                self.receivePoints_sec(taskCode)
                            else:
                                self.receivePoints_sec(taskCode)
                                break
                        except Exception as e:
                            self.log(f"安全管家: 执行 {taskCode} 时出错: {e}")
                            break
                elif finishText == "待领取":
                     try:
                        time.sleep(3)
                        self.receivePoints_sec(taskCode)
                     except Exception as e:
                        self.log(f"安全管家: 领取 {taskCode} 奖励时出错: {e}")
                else:
                    self.log(f"安全管家: [{taskName}] 任务已完成且奖励已领取")
                self.log("安全管家: ---------------------")
        except Exception as e:
            self.log(f"executeAllTasks_sec error: {e}")

    def getUserInfo_sec(self):
        try:
            url = "https://m.jf.10010.com/jf-external-application/jftask/userInfo"
            headers = {
                "ticket": unquote(self.sec_ticket),
                "User-Agent": "Mozilla/5.0 (Linux; Android 9; ONEPLUS A5000 Build/PKQ1.180716.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.7204.179 Mobile Safari/537.36",
                "partnersid": "1702",
                "clienttype": "uasp_unicom_applet",
            }
            if hasattr(self, 'sec_jeaId') and self.sec_jeaId:
                headers["Cookie"] = f"_jea_id={self.sec_jeaId}"
            res = self.session.post(url, json={}, headers=headers).json()
            if not res or res.get('code') != '0000' or not res.get('data'):
                self.log(f"安全管家: 查询积分失败: {res.get('msg') if res else '无响应'}")
                return
            currentPoints = int(res['data'].get('availableScore', 0))
            todayPoints = res['data'].get('todayEarnScore', 0)
            if not hasattr(self, 'sec_oldJFPoints') or self.sec_oldJFPoints is None:
                self.sec_oldJFPoints = currentPoints
                self.log(f"安全管家: 运行前积分：{currentPoints} (今日已赚 {todayPoints})")
            else:
                 pointsGained = currentPoints - self.sec_oldJFPoints
                 self.log(f"安全管家: 运行后积分{currentPoints}，本次运行获得{pointsGained}", notify=True)
        except Exception as e:
            self.log(f"getUserInfo_sec error: {e}")

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
                self.log("安全管家: [查询模式] 跳过任务执行...")
                return
            self.get_secret_key_sec()
            self.executeAllTasks_sec()
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
            self.log(f"积分概览: 今日已赚 {data.get('todayEarnScore')}, 当前余额 {data.get('availableScore')}", notify=True)

    def aiting_jf_headers(self, with_signature=False):
        headers = {
            'ticket': unquote(self.aiting_biz_ticket),
            'pageid': 's789081246969976832',
            'clienttype': 'aiting_android',
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
            self.log(f"爱听任务: getSecretKey 失败: {data}")
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
        self.log("==== 联通祝福 ====")
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
        self.log(f"爱听登录: 沃阅读登录失败: {res}")
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
            self.log(f"爱听登录: 获取JWT失败: {res}")
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
            self.log(f"爱听登录: 业务API登录失败: {res}")
        except Exception as e:
            self.log(f"爱听登录: 业务API异常: {e}")
        return None

    def aiting_login_flow(self):
        self.log("正在执行爱听登录流程...")
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
        self.log(f"✅ 爱听业务登录成功! Token已获取")
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
                    match = re.search(r'ticket=([^&]+)', msg)
                    if match:
                        return match.group(1)
                return msg # Fallback if message is ticket itself? No, standard is URL.
            self.log(f"爱听登录: 获取Ticket失败: {res}")
        except Exception as e:
            self.log(f"爱听登录: 获取Ticket异常: {e}")
        return None

    def jf_get_task_detail(self, ticket):
        url = "https://m.jf.10010.com/jf-external-application/jftask/taskDetail"
        headers = self.aiting_jf_headers()
        headers['Referer'] = f"https://m.jf.10010.com/jf-external-application/index.html?ticket={ticket}&pageID=s789081246969976832"
        response = self.session.post(url, json={}, headers=headers)
        self.update_aiting_jea_id(response)
        res = response.json()
        return res.get("data", {}).get("taskDetail", {}).get("taskList", [])

    def jf_to_finish(self, ticket, task_code):
        url = "https://m.jf.10010.com/jf-external-application/jftask/toFinish"
        response = self.session.post(
            url,
            json={'taskCode': task_code},
            headers=self.aiting_jf_headers(with_signature=True),
        )
        self.update_aiting_jea_id(response)

    def jf_pop_up(self, ticket):
        url = "https://m.jf.10010.com/jf-external-application/jftask/popUp"
        response = self.session.post(url, json={}, headers=self.aiting_jf_headers())
        self.update_aiting_jea_id(response)
        res = response.json()
        if isinstance(res, dict):
            if res.get('code') == "0000" and res.get('data', {}).get('score'):
                self.log(f"  └─ 🎉 获得 {res['data']['score']} 积分", notify=True)
            elif res.get('code') != "0000":
                self.log(f"  └─ 📝 积分弹窗返回: {res.get('desc', res)}")
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
             self.log(f"✅ 阅读时长上报成功 ({read_time_seconds}s)")

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
        self.log("==== 联通爱听任务 ====")
        if not self.aiting_login_flow():
            self.log("爱听任务: 登录失败，跳过")
            return
        self.log("爱听任务: 登录成功，正在获取任务列表...")
        try:
            self.aiting_query_integral()
        except: pass
        task_list = self.jf_get_task_detail(self.aiting_biz_ticket)
        done_list = [t for t in task_list if t.get('finish') == 1]
        printed_names = set()
        for t in done_list:
             name = t.get('taskName')
             if name not in printed_names:
                 self.log(f"  ✅ {name} ({t.get('finishCount')}/{t.get('needCount')})")
                 printed_names.add(name)
        todo_list = [t for t in task_list if t.get('finish') == 0 and "邀请" not in t.get('taskName', '')]
        if not todo_list:
            self.log("爱听任务: ✅ 所有任务已完成")
            if is_query_only:
                self.log("爱听任务: [查询模式] 跳过任务执行...")
            return
        self.log(f"爱听任务: 发现 {len(todo_list)} 个待办任务")
        if is_query_only:
            self.log("爱听任务: [查询模式] 跳过任务执行...")
            return
        read_tasks = [t for t in todo_list if ("阅读" in t.get('taskName','') or "听读" in t.get('taskName','')) and "邀请" not in t.get('taskName','')]
        for task in read_tasks:
            remaining = int(task.get('needCount', 1)) - int(task.get('finishCount', 0))
            if remaining <= 0: continue
            self.log(f"执行阅读任务: {task.get('taskName')} (剩余 {remaining} 次)")
            for i in range(remaining):
                self.jf_to_finish(self.aiting_biz_ticket, task.get('taskCode'))
                self.log(f"  └─ 第 {i + 1}/{remaining} 次: 极速提交中...")
                self.aiting_new_read_add()
                time.sleep(5)
                self.aiting_add_read_time(120)
                time.sleep(2)
                self.jf_pop_up(self.aiting_biz_ticket)
        other_tasks = [t for t in todo_list if not any(x in t.get('taskName','') for x in ["通知", "阅读", "听读", "邀请", "签到"])]
        notify_task = next((t for t in todo_list if "通知" in t.get('taskName','')), None)
        if notify_task:
            self.log(f"执行通知任务: {notify_task.get('taskName')}")
            self.jf_to_finish(self.aiting_biz_ticket, notify_task.get('taskCode'))
            time.sleep(1)
            self.aiting_complete_task_api(2)
            time.sleep(2)
            self.jf_pop_up(self.aiting_biz_ticket)
        for task in other_tasks:
            remaining = int(task.get('needCount', 1)) - int(task.get('finishCount', 0))
            if remaining <= 0: continue
            self.log(f"执行通用任务: {task.get('taskName')} (剩余 {remaining} 次)")
            for i in range(remaining):
                 self.jf_to_finish(self.aiting_biz_ticket, task.get('taskCode'))
                 time.sleep(1.5)
                 self.aiting_complete_task_api(4) # Type 4
                 time.sleep(2)
                 self.jf_pop_up(self.aiting_biz_ticket)
        try:
            self.aiting_query_integral()
        except: pass

    def wostore_cloud_login(self, ticket):
        try:
            url1 = "https://member.zlhz.wostore.cn/wcy_member/yunPhone/h5Awake/businessHall"
            body1 = {
                "cpId": "91002997", "channelId": "ST-Zujian001-gs", "ticket": ticket,
                "env": "prod", "transId": "S2ndpage1235+开福袋！+F1+CJDD00D0001+iphone_c@12.0801",
                "qkActId": None
            }
            headers1 = {"Origin": "https://h5forphone.wostore.cn", "Content-Type": "application/json"}
            json_data = json.dumps(body1, separators=(',', ':'), ensure_ascii=True)
            res1 = self.session.post(url1, data=json_data, headers=headers1, timeout=15).json()
            if str(res1.get("code")) != "0":
                msg = res1.get("msg", str(res1))
                self.log(f"沃云手机: 登录第一步失败 - {msg}")
                return None
            redirect_url = res1.get("data", {}).get("url", "")
            match = re.search(r'token=([^&]+)', redirect_url)
            if not match:
                if "protocol" in redirect_url or "sign" in redirect_url:
                    self.log("沃云手机: 未开通业务 (检测到协议签署跳转)，跳过")
                else:
                    self.log(f"沃云手机: 无法提取 Token, 跳转URL: {redirect_url}")
                return None
            first_token = match.group(1)
            time.sleep(1)
            url2 = "https://uphone.wostore.cn/h5api/activity-service/user/login"
            body2 = {
                "identityType": "cloudPhoneLogin", "code": first_token, "channelId": "ST-Zujian001-gs",
                "activityId": "Lottery_251201", "device": "device"
            }
            headers2 = {"Origin": "https://uphone.wostore.cn", "X-USR-TOKEN": first_token}
            res2 = self.session.post(url2, json=body2, headers=headers2, timeout=15).json()
            if str(res2.get("code")) == "200":
                user_token = res2.get("data", {}).get("user_token")
                return {"firstToken": first_token, "user_token": user_token}
            else:
                self.log(f"沃云手机: 登录第二步失败 - {res2.get('msg', str(res2))}")
                return None
        except Exception as e:
            self.log(f"沃云手机: 登录异常 {e}")
            return None

    def wostore_cloud_sign(self, user_token):
        try:
            url = "https://uphone.wostore.cn/h5api/activity-service/points/v1/sign"
            body = {"activityCode": "Points_Sign_2507"}
            headers = {"X-USR-TOKEN": user_token, "Origin": "https://uphone.wostore.cn"}
            res = self.session.post(url, json=body, headers=headers).json()
            if res.get("code") == 200:
                self.log("沃云手机: 积分签到成功", notify=True)
            else:
                pass # Fail silently or log if needed context
        except Exception:
            pass

    def wostore_cloud_task_list(self, user_token):
        try:
            url = "https://uphone.wostore.cn/h5api/activity-service/user/task/list"
            body = {"activityCode": "Lottery_251201"}
            headers = {"X-USR-TOKEN": user_token}
            self.session.post(url, json=body, headers=headers)
        except Exception:
            pass

    def wostore_cloud_get_chance(self, user_token, task_code):
        try:
            url = "https://uphone.wostore.cn/h5api/activity-service/user/task/raffle/get"
            body = {"activityCode": "Lottery_251201", "taskCode": task_code}
            headers = {"X-USR-TOKEN": user_token}
            self.session.post(url, json=body, headers=headers)
        except Exception:
            pass

    def wostore_cloud_draw(self, user_token):
        try:
            url = "https://uphone.wostore.cn/h5api/activity-service/lottery"
            body = {"activityCode": "Lottery_251201"}
            headers = {"X-USR-TOKEN": user_token}
            res = self.session.post(url, json=body, headers=headers).json()
            if res.get("code") == 200:
                prize = res.get("data", {}).get("prizeName", "未中奖")
                self.log(f"沃云手机: 抽奖结果 - {prize}", notify=True)
            else:
                self.log(f"沃云手机: 抽奖失败 - {res.get('msg', str(res))}")
        except Exception as e:
            self.log(f"沃云手机: 抽奖异常 {e}")

    def wostore_cloud_task(self, is_query_only=False):
        self.log("==== 沃云手机 ====")
        if is_query_only:
             self.log("沃云手机: [查询模式] 此平台暂无资产或余额可供查询", notify=True)
             return
        target_url = "https://h5forphone.wostore.cn/cloudPhone/dialogCloudPhone.html?channel_id=ST-Zujian001-gs&cp_id=91002997"
        ticket_res = self.openPlatLineNew(target_url)
        if not ticket_res:
            self.log("沃云手机: 获取入口 Ticket 失败")
            return
        ticket = ticket_res
        if isinstance(ticket, dict):
            ticket = ticket.get('ticket')
        if not ticket:
             self.log("沃云手机: 获取入口 Ticket 失败 (为空)")
             return
        tokens = self.wostore_cloud_login(ticket)
        if not tokens:
            self.log("沃云手机: 登录失败，跳过后续任务")
            return
        user_token = tokens['user_token']
        self.wostore_cloud_sign(user_token)
        time.sleep(2)
        self.wostore_cloud_task_list(user_token)
        time.sleep(1)
        self.wostore_cloud_get_chance(user_token, "2508-01")
        time.sleep(2)
        self.wostore_cloud_draw(user_token)

    def regional_task(self, is_query_only=False):
        """区域专区任务入口"""
        is_xinjiang = False
        is_henan = False
        is_yunnan = False
        if hasattr(self, 'city_info') and self.city_info and isinstance(self.city_info, list):
            try:
                for city in self.city_info:
                    pro_name = city.get('proName', '')
                    if "新疆" in pro_name: is_xinjiang = True
                    if "河南" in pro_name: is_henan = True
                    if "云南" in pro_name: is_yunnan = True
            except: pass
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
                        self.log(f"    - [{item.get('receiveTime')}] {item.get('recordName')}", notify=True)
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
                    create_time = item.get('receiveTime', '')
                    name = item.get('recordName', '')
                    if current_month in create_time and any(k in name for k in ['话费', '充值', '红包']):
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

def do_notify(users):
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
            send("中国联通", content)
            print(f"推送成功 (内容长度: {len(content)})")
        except Exception as e:
            print(f"推送失败，可能未配置 notify.py: {str(e)}")
    else:
        print("无推送内容")

def main():
    global GRAB_AMOUNT
    print(f"[{datetime.now().strftime('%H:%M:%S')}] [Script Start] chinaUnicom Python v1.0.5")
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
    # 抢兑模式检测 (在打印前判断)
    sc = globalConfig.get("sign_config", {})
    mc = globalConfig.get("market_config", {})
    grab_mode = False
    if sc.get("run_grab_coupon", False) and globalConfig.get("enable_sign", True) and not query_only:
        hour = datetime.now().hour
        current_min = datetime.now().minute
        if hour in [9, 17] and (58 <= current_min <= 59):
            grab_mode = True
    print("-" * 36)
    # 打印各模块开关状态
    switch_map = [
        ("enable_sign",     "首页签到"),
        ("enable_ltzf",     "联通祝福"),
        ("enable_ttlxj",    "天天领现金"),
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
            # 抢兑模式: 仅签到区(抢兑)运行, 其余全部跳过
            if key == "enable_sign":
                status = "运行(仅抢兑)"
            else:
                status = "跳过(抢兑模式)"
        elif query_only:
            status = "仅查询" if enabled else "关闭"
        else:
            status = "运行" if enabled else "关闭"
        print(f"{label}设置为: {status}")
        # 签到区后面紧跟子开关
        if key == "enable_sign" and enabled and not query_only:
            print(f"  └─ 抢话费券: {'开启' if sc.get('run_grab_coupon', False) else '关闭'}")
        # 权益超市后面紧跟子开关 (抢兑模式下不打印, 因为整个权益超市都跳过)
        if key == "enable_market" and enabled and not query_only and not grab_mode:
            print(f"  └─ 浇水: {'开启' if mc.get('run_water', True) else '关闭'}")
            print(f"  └─ 做任务: {'开启' if mc.get('run_task', True) else '关闭'}")
            print(f"  └─ 会员中心: {'开启' if mc.get('run_member_center', True) else '关闭'}")
            print(f"  └─ 抽奖: {'开启' if mc.get('run_draw', True) else '关闭'}")
            print(f"  └─ 自动领奖: {'开启' if mc.get('run_claim', False) else '关闭'}")
    print(f"设备ID刷新: {'强制刷新' if globalConfig.get('refresh_device_id', False) else '使用缓存'}")
    print("-" * 36)
    print("")
    # --- 定时抢兑模式: 仅并发执行抢话费券, 完成后直接退出 ---
    if grab_mode:
        hour = datetime.now().hour
        current_min = datetime.now().minute
        print(f"⏰ [自动触发] 检测到抢兑时间点 ({hour}:{current_min:02d})，进入并发抢兑模式")
        print(f"🚨🚨🚨 [抢兑模式已启动] 目标: {GRAB_AMOUNT}元话费券 🚨🚨🚨")
        print("")
        from concurrent.futures import ThreadPoolExecutor

        def run_grab_task(u):
            u.configure_proxy()
            if not u.token_online and u.account_mobile:
                u.load_token_from_cache()
            is_valid = u.onLine()
            if not is_valid and u.account_mobile and u.account_password:
                u.unicom_login()
                is_valid = u.onLine()
            if is_valid:
                u.save_token_to_cache()
                u.sign_grabCoupon()
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
        if not u.token_online and u.account_mobile:
            u.load_token_from_cache()
        if not u.token_online and u.account_mobile and u.account_password:
             u.unicom_login()
        if u.onLine():
             u.save_token_to_cache()
             print("")
             print(f"------------------ 账号[{u.index}][{mask_str(u.account_mobile)}] ------------------")
             print("")
             u.execute_daily_tasks(query_only=query_only)
             print("⏳ 账号处理完毕，等待 2 秒...")
             time.sleep(2)
        else:
             u.log("登录流程失败，跳过该账号")
    do_notify(users)
if __name__ == "__main__":
    main()
