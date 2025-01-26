

import hashlib
from gmalg import SM2

import math
import time
import requests
import datetime
import os
from urllib.parse import urlparse, parse_qs
import random
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
import base64
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import urllib.parse
import json
debug=0
account_id = ""
def jm(password):
    public_key_base64 = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD6XO7e9YeAOs+cFqwa7ETJ+WXizPqQeXv68i5vqw9pFREsrqiBTRcg7wB0RIp3rJkDpaeVJLsZqYm5TW7FWx/iOiXFc+zCPvaKZric2dXCw27EvlH5rq+zwIPDAJHGAfnn1nmQH7wR3PCatEIb8pz5GFlTHMlluw4ZYmnOwg+thwIDAQAB"
    public_key_der = base64.b64decode(public_key_base64)
    key = RSA.importKey(public_key_der)
    cipher = PKCS1_v1_5.new(key)
    password_bytes = password.encode('utf-8')
    encrypted_password = cipher.encrypt(password_bytes)
    encrypted_password_base64 = base64.b64encode(encrypted_password).decode('utf-8')
    url_encoded_data = urllib.parse.quote(encrypted_password_base64)
    return url_encoded_data

#生成设备号
def generate_random_uuid():
    # 设备号其实可以写死，保险起见选择随机生成
    uuid_str = '00000000-{:04x}-{:04x}-0000-0000{:08x}'.format(
        random.randint(0, 0xfff) | 0x4000, 
        random.randint(0, 0x3fff) | 0x8000,  
        random.getrandbits(32)
    )
    return uuid_str

# 签名并获取认证码 
def sign(phone, password):
    url_encoded_data = jm(password)
    url = "https://passport.tmuyun.com/web/oauth/credential_auth"
    payload = f"client_id=10019&password={url_encoded_data}&phone_number={phone}"
    print(payload)
    headers = {
        'User-Agent': "ANDROID;13;10019;6.0.2;1.0;null;MEIZU 20",
        'Connection': "Keep-Alive",
        'Accept-Encoding': "gzip",
        'Content-Type': "application/x-www-form-urlencoded",
        'Cache-Control': "no-cache",
        'X-SIGNATURE': "185d21c6f3e9ec4af43e0065079b8eb7f1bb054134481e57926fcc45e304b896",
    }

    response = requests.post(url, data=payload, headers=headers)
    print(response.json())
    code = response.json()['data']['authorization_code']['code']
    
    url = "https://vapp.taizhou.com.cn/api/zbtxz/login"
    payload = f"check_token=&code={code}&token=&type=-1&union_id="
    headers = {
            'User-Agent': "6.0.2;{deviceid};Meizu MEIZU 20;Android;13;tencent;6.10.0",
            'Connection': "Keep-Alive",
            'Accept-Encoding': "gzip",
            'Content-Type': "application/x-www-form-urlencoded",
            'X-SESSION-ID': "66586b383f293a7173e4c8f4",
            'X-REQUEST-ID': "110c1987-1637-4f4e-953e-e35272bb891e",
            'X-TIMESTAMP': "1717072109065",
            'X-SIGNATURE': "a69f171e284594a5ecc4baa1b2299c99167532b9795122bae308f27592e94381",
            'X-TENANT-ID': "64",
            'Cache-Control': "no-cache"
    }
    response = requests.post(url, data=payload, headers=headers)
    message = response.json()['message']
    account_id = response.json()['data']['account']['id']
    session_id = response.json()['data']['session']['id']
    name = response.json()['data']['account']['nick_name']
        
    return message, account_id, session_id, name


#生成验证码
def generate_md5(input_str):
    md5_obj = hashlib.md5()
    input_str_encoded = input_str.encode('utf-8')
    md5_obj.update(input_str_encoded)
    return md5_obj.hexdigest()

#获取阅读的JSESSIONID
def get_special_cookie():
    special_cookie_url = f'https://xmt.taizhou.com.cn/prod-api/user-read/app/login?id={account_id}&sessionId={session_id}&deviceId={deviceid}'

    headers = {
    'Host': 'xmt.taizhou.com.cn',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 13; MEIZU 20 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
    'Accept': '*/*',
    'X-Requested-With': 'com.shangc.tiennews.taizhou',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://xmt.taizhou.com.cn/readingAward-v7-3/?gaze_control=01',
    'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
}
    response = requests.get(special_cookie_url, headers=headers)
    if debug and response.status_code == 200:
        print('执行任务获取阅读jse')
        print('下面是访问的url\n',special_cookie_url)
        print('下面是访问的headers\n',headers)
        print('下面是返回的response\n',response.headers)
    if response.status_code == 200 and response.headers['Set-Cookie']:
        jsessionid1 =response.headers['Set-Cookie'].split(';')[0]+';'
        print('获取特殊cookie成功',jsessionid1)
        return response.headers['Set-Cookie']
    else:
        print('获取jsesesionid失败',response.headers)

#获取日期
def get_current_date():
    now = datetime.datetime.now()
    year_str = str(now.year)
    month_str = f"0{now.month}" if now.month < 10 else str(now.month)
    day_str = f"0{now.day}" if now.day < 10 else str(now.day)
    print(f"当前日期{year_str}{month_str}{day_str}")
    return year_str + month_str + day_str

#获取阅读列表
def fetch_article_list():
    headers = {
    'Host': 'xmt.taizhou.com.cn',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 13; MEIZU 20 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
    'Accept': '*/*',
    'X-Requested-With': 'com.shangc.tiennews.taizhou',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://xmt.taizhou.com.cn/readingAward-v7-3/?gaze_control=01',
    'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    'cookie': f'{special_cookie};'
}
    url=f'https://xmt.taizhou.com.cn/prod-api/user-read/list/{get_current_date()}'
    response = requests.get(url, headers=headers)
    if debug and response.status_code == 200:
        print('执行任务获取阅读列表')
        print('下面是访问的url\n',url)
        print('下面是访问的headers\n',headers)
        print('下面是返回的response\n',response.headers)
    msg = response.json()['msg']
    print(msg)
    return response.json()
def encrypt_with_sm2(article_id, account_id):
    # 获取当前时间戳
    timestamp = int(time.time() * 1000)
    # 构造数据
    data = {
        "timestamp": timestamp,
        "articleId": article_id,
        "accountId": account_id
    }
    # 将数据序列化为JSON字符串
    data_json = json.dumps(data, separators=(',', ':'))
    print("Data to be encrypted:", data_json)
    
    # SM2公钥，确保公钥以04开头（未压缩格式）
    public_key_hex = "04A50803A27F000D6B310607EBA2A1C899E82872C0B538CA41DB6F0183B4C7E164DAFC6946ABF93C8AF1C0AD96D0E770D29264EF9F907DDBAE97A2A0BB1036D4AC"
    public_key = bytes.fromhex(public_key_hex)
    
    # 创建SM2对象
    sm2_crypt = SM2(pk=public_key)
    
    # 加密数据
    encrypted_data = sm2_crypt.encrypt(data_json.encode('utf-8'))
    print(len(encrypted_data.hex()))

    
    # 返回加密后的十六进制字符串
    encrypted_data_hex = encrypted_data.hex()
    #去掉前面两位
    encrypted_data_hex = encrypted_data_hex[2:]
    return encrypted_data_hex
#阅读文章
def mark_article_as_read(article_id,retry_count=3):
    headers = {
    'Host': 'xmt.taizhou.com.cn',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 13; MEIZU 20 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
    'Accept': '*/*',
    'X-Requested-With': 'com.shangc.tiennews.taizhou',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://xmt.taizhou.com.cn/readingAward-v7-3/?gaze_control=01',
    'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    'cookie': f'{special_cookie}',
}
    timestamp_str = str(math.floor(time.time() * 1000))
    signature = encrypt_with_sm2(article_id,account_id)
    url = f'https://xmt.taizhou.com.cn/prod-api/already-read/article/new?signature={signature}'
    print(url)
    
    # 创建一个包含重试策略的会话
    session = requests.Session()
    retries = Retry(total=5, backoff_factor=1, status_forcelist=[502, 503, 504])
    session.mount('https://', HTTPAdapter(max_retries=retries))

    for attempt in range(retry_count):
        try:
            response = session.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                print(response.text)
                return
            else:
                print(f"请求失败，状态码: {response.status_code}, 响应内容: {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"请求失败 (尝试 {attempt + 1}/{retry_count}): {e}")
            time.sleep(2)  # 在重试前增加延迟
    

# 登录并获取抽奖JSESSIONID
def login(account_id, session_id, retry_count=3):
    base_url = 'https://srv-app.taizhou.com.cn'
    url = f'{base_url}/tzrb/user/loginWC'
    headers = {
        'Host': 'srv-app.taizhou.com.cn',
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; MEIZU 20 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
        'Accept': '*/*',
        'X-Requested-With': 'com.shangc.tiennews.taizhou',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://srv-app.taizhou.com.cn/luckdraw/',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7'
    }
    params = {
        'accountId': account_id,
        'sessionId': session_id
    }

    # 创建一个包含重试策略的会话
    session = requests.Session()
    retries = Retry(total=5, backoff_factor=1, status_forcelist=[502, 503, 504])
    session.mount('https://', HTTPAdapter(max_retries=retries))

    for attempt in range(retry_count):
        try:
            response = session.get(url, params=params, headers=headers, timeout=10)
            if response.status_code == 200:
                cookies_dict = response.cookies.get_dict()
                s_JSESSIONID = '; '.join([f'{k}={v}' for k, v in cookies_dict.items()])
                return s_JSESSIONID
            else:
                print(f"请求失败，状态码: {response.status_code}, 响应内容: {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"请求失败 (尝试 {attempt + 1}/{retry_count}): {e}")
            time.sleep(2)  # 在重试前增加延迟

    return None

#抽奖
def cj(jsessionid, retry_count=3):
    url = "https://srv-app.taizhou.com.cn/tzrb/userAwardRecordUpgrade/saveUpdate"
    payload = "activityId=67&sessionId=undefined&sig=undefined&token=undefined"
    headers = {
        'Host': 'srv-app.taizhou.com.cn',
        'Connection': 'keep-alive',
        'Content-Length': '63',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
        'Content-type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
        'Origin': 'https://srv-app.taizhou.com.cn',
        'X-Requested-With': 'com.shangc.tiennews.taizhou',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://srv-app.taizhou.com.cn/luckdraw-ra-1/',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cookie': f'{jsessionid}'
    }

    # 创建一个包含重试策略的会话
    session = requests.Session()
    retries = Retry(total=4, backoff_factor=1, status_forcelist=[502, 503, 504])
    session.mount('https://', HTTPAdapter(max_retries=retries))

    for attempt in range(retry_count):
        try:
            response = session.post(url, data=payload, headers=headers, timeout=10)
            if response.status_code == 200:
                print(response.text)
                display_draw_results(jsessionid)
                return  # 成功则退出函数
            else:
                print(f"POST 请求失败，状态码: {response.status_code}, 响应内容: {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"POST 请求失败 (尝试 {attempt + 1}/{retry_count}): {e}")
            time.sleep(2)  # 在重试前增加延迟

#查询抽奖结果
def display_draw_results(cookies):
    draw_result_headers = {
        'Host': 'srv-app.taizhou.com.cn',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; MEIZU 20 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
        'Accept': '*/*',
        'X-Requested-With': 'com.shangc.tiennews.taizhou',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://srv-app.taizhou.com.cn/luckdraw-awsc-231023/',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cookie': f'{cookies}',
    }
    result_url = 'https://srv-app.taizhou.com.cn/tzrb/userAwardRecordUpgrade/pageList?pageSize=10&pageNum=1&activityId=67'
    result_data = requests.get(result_url, headers=draw_result_headers).json()["data"]["records"]
    for record in result_data:
        create_time_str = str(record["createTime"])
        award_name_str = str(record["awardName"])
        print(f"{create_time_str}---------{award_name_str}")

# 从环境变量中读取账户和密码
accounts = os.getenv("wangchaoAccount")
if not accounts:
    print("❌未找到环境变量！")    
else:
    accounts_list = accounts.split("&")
    print(f"一共在环境变量中获取到 {len(accounts_list)} 个账号")
    for account in accounts_list:
        password, phone  = account.split("#")
        message, account_id, session_id, name = sign(phone, password)
        deviceid = generate_random_uuid()
        print()
        if account_id and session_id:
            mobile = phone[:3] + "*" * 4 + phone[7:]
            print(f"账号 {mobile} 登录成功")
            special_cookie = get_special_cookie()
            print(f"账号 {mobile} 获取阅读列表")
            article_list = fetch_article_list()
            for article in article_list['data']['articleIsReadList']:
                article_title = article['title']
                if article['isRead'] == True :
                   print(f"√文章{article_title}已读")
                   time.sleep(0.5)
                   continue
                else:
                     time.sleep(random.uniform(3.5, 4.5))
                     article_id = article['id']
                     print(f"账号 {mobile} 阅读文章 {article_title}")
                     mark_article_as_read(article_id)            
            time.sleep(1)
            jsessionid = login(account_id, session_id)
            if jsessionid:
                print('去抽奖')
                cj(jsessionid)
            else:
                print(f"获取 JSESSIONID 失败")
        else:
            print(f"账号 {phone} 登录失败")

        # 每个账号登录后延迟...
        print("等待 5 秒后继续下一个账号...")
        time.sleep(5)
    print("所有账号处理完毕")
