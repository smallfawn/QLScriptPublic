
"""
 * 设置变量 PGSH_TOKEN,多号使用&隔开，网页获取ck：https://bigostk.github.io/pg/
 * ck格式1:token#备注
 * ck格式2: token
 * 代理开关变量名：pg_dl，True为开启代理模式，False为关闭，默认为False
 * 代理变量名：pg_dlurl，代理地址是动态代理api接口，一次性提取一个，选择txt格式，\r\n或者\n模式都可以
 * 并发开关变量名：pg_bf，True为开启并发模式，False为关闭，默认为False
 * 并发数量变量名：pg_bfsum，并发几个就写几个，默认为3
 * 推送开关变量名：pg_ts，True为开启推送，False为关闭，默认为False
 * 推送变量名1：WxPusher：pg_WxPusher_token是你的WxPusher的推送组的token，pg_WxPusher_uid是你的WxPusher该推送组的用户uid，推送给谁就填写谁的，填写一个即可
 * 推送变量名2：pushplus：pg_pushplus_token是你的pushplus的token
 * Top: 上面两个推送配置哪个就使用哪个推送，两个都配置的话就两个都进行推送
 * 数据库地址变量名：pg_ckurl，保证打开数据库里面是ck，并使用&隔开，或者ck#备注，并使用&隔开
 * 不填备注默认使用隐私格式手机号作为用户名，否则使用填写的备注作为用户名
 * 出现False就是任务已完成或者不可完成

"""
import subprocess

def check_yl():
    lb = ['requests', 'urllib3', 'requests_toolbelt', 'fake_useragent'] # 添加 fake_useragent 依赖
    for yl in lb:
        try:
            subprocess.check_call(["pip", "show", yl], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except subprocess.CalledProcessError:
            print(f"{yl} 未安装，开始安装...")
            subprocess.check_call(["pip", "install", yl, "-i", "https://pypi.tuna.tsinghua.edu.cn/simple"],
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"{yl} 安装完成")

check_yl()
############################### 本地环境ck，环境变量存在此处不生效


#  在下方填入你的Token后，运行代码
ck = ""



ckurl1 = ""  # 数据库地址，适配部分群友要求
jh = False   # 聚合ck模式，开启即所有环境模式ck都生效，都会合成为一个ck列表，关闭则优先处理环境变量，默认为True，False为关闭

#############################
# -----运行模式配置区，自行配置------

bf1 = False  # True开启并发，False关闭并发
bfsum1 = 5 # 并发数,开启并发模式生效
lljf = 1   # 运行新版浏览任务，22金币,只有10天

# -------推送配置区，自行填写-------

ts1 = True  # True开启推送，False关闭推送

# -------代理配置区，自行填写-------

dl1 = False  # True开启代理，False关闭代理
dl_url = ""  # 代理池api

# -----代理时间配置区，秒为单位------

dl_sleep = 30  # 代理切换时间
qqtime = 15    # 请求超时时间

# -----时间配置区，默认即可------

a = "6"
b = "22"  # 表示6-22点之间才执行任务

#############################
# ---------勿动区----------

# 已隐藏乾坤于此区域

###########################
# ---------代码块---------

import requests
import time
import random
import string
import os
import json
import hashlib
import threading
from functools import partial
from urllib.parse import urlparse
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib3.exceptions import InsecureRequestWarning
from requests_toolbelt import MultipartEncoder
from fake_useragent import UserAgent

# ==================================================================================
# ======================== 伪装模块 - Anti-Detection Module ========================
# ==================================================================================

class Humanizer:
    """
    这是一个模拟人类行为的模块，用于取代固定的延时和参数。
    人类行为不是固定的 time.sleep(6)，而是充满随机和不确定性。
    """
    def __init__(self):
        try:
            self.ua = UserAgent()
        except Exception:
            self.fallback_uas = [
                "okhttp/3.14.9",
                "Dalvik/2.1.0 (Linux; U; Android 13; SM-S908U Build/TP1A.220624.014)",
                "Dalvik/2.1.0 (Linux; U; Android 12; SM-G998B Build/SP1A.210812.016)",
                "Dalvik/2.1.0 (Linux; U; Android 11; Pixel 5 Build/RQ3A.210805.001a)"
            ]
            self.ua = None
        self.phone_brands = ["Xiaomi", "Redmi", "HUAWEI", "OPPO", "VIVO", "Realme", "OnePlus", "Samsung"]
    
    def random_sleep(self, min_s, max_s):
        """模拟人类操作的随机停顿，单位为秒"""
        time.sleep(random.uniform(min_s, max_s))

    def get_user_agent(self, type='android'):
        """获取一个随机的、真实的User-Agent"""
        if self.ua:
            return self.ua.random
        else:
            return random.choice(self.fallback_uas)

    def get_device_brand(self):
        """随机获取一个手机品牌"""
        return random.choice(self.phone_brands)
    
    @staticmethod
    def shuffle_headers(headers):
        """将请求头的顺序随机化"""
        header_list = list(headers.items())
        random.shuffle(header_list)
        return dict(header_list)

humanizer = Humanizer() # 实例化“伪装者”

# ======================== 伪装模块结束 ========================


dl = os.environ.get('pg_dl', dl1)
proxy_api_url = os.environ.get('pg_dlurl', dl_url)
bf = os.environ.get('pg_bf', bf1)
bfsum = os.environ.get('pg_bfsum', bfsum1)
ts = os.environ.get('pg_ts', str(ts1)) # 确保ts从环境变量获取时是字符串
ckurl = os.environ.get('pg_ckurl', ckurl1)
WxPusher_uid = os.environ.get('pg_WxPusher_uid')
WxPusher_token = os.environ.get('pg_WxPusher_token')
pushplus_token = os.environ.get('pg_pushplus_token')


v = '7.0.3-final' # 版本号升级

global_proxy = {
    'http': None,
    'https': None
}


def start_dlapi():
    dlstart = threading.Thread(target=get_proxy, args=(stop_event,))
    dlstart.start()


stop_event = threading.Event()


def get_proxy(stop_event):
    global global_proxy, ipp
    a = 0
    while not stop_event.is_set():
        a += 1
        try:
            response = requests.get(proxy_api_url)
            if response.status_code == 200:
                proxy1 = response.text.strip()
                if "白名单" not in proxy1 and ":" in proxy1:
                    print(f'✅第{a}次获取代理成功: {proxy1}')
                    ipp = proxy1.split(':')[0]
                    global_proxy = {'http': f'http://{proxy1}', 'https': f'http://{proxy1}'}
                    humanizer.random_sleep(dl_sleep - 5, dl_sleep + 5)
                else:
                    print(f"请求代理池: {proxy1}")
                    if "白名单" in proxy1:
                        print("响应中存在白名单字样，结束运行")
                        os._exit(0)
            else:
                print(f'❎第{a}次获取代理失败！状态码: {response.status_code}，将随机等待后重试！')
                humanizer.random_sleep(dl_sleep, dl_sleep * 1.5)
        except Exception as e:
            print(f"❎获取代理时发生网络错误: {e}，将随机等待后重试！")
            humanizer.random_sleep(dl_sleep, dl_sleep * 1.5)


def p(p):
    if len(p) == 11:
        return p[:3] + '****' + p[7:]
    else:
        return p


class PGSH:
    def __init__(self, cki):
        self.msg = None
        self.messages = []
        self.title = None
        self.phone = None
        self.token = cki.split('#')[0]
        self.cook = cki
        self.total_amount = 0
        self.id = None

        self.device_ua = humanizer.get_user_agent()
        self.device_brand = humanizer.get_device_brand()

        self.hd = {
            'User-Agent': self.device_ua,
            'Accept': 'application/json, text/plain, */*',
            'Version': "1.58.0",
            'Content-Type': "application/x-www-form-urlencoded;charset=UTF-8",
            'Authorization': self.token,
            'channel': "android_app"
        }
        self.hd1 = {
            'User-Agent': self.device_ua,
            'Connection': "Keep-Alive",
            'Accept-Encoding': "gzip",
            'Authorization': self.token,
            'Version': "1.58.0",
            'channel': "android_app",
            'phoneBrand': self.device_brand,
            'Content-Type': "application/x-www-form-urlencoded;charset=UTF-8"
        }
        self.session = requests.Session()

        self.listUrl = 'https://userapi.qiekj.com/task/list'
        self.phone_url = 'https://userapi.qiekj.com/user/info'
        self.check_url = 'https://userapi.qiekj.com/user/balance'
        self.rcrw_url = 'https://userapi.qiekj.com/task/completed'
        self.sign_url = 'https://userapi.qiekj.com/signin/doUserSignIn'
        self.jtjl_url = 'https://userapi.qiekj.com/ladderTask/applyLadderReward'
        self.jrjf_url = "https://userapi.qiekj.com/integralRecord/pageList" # 新增：今日积分URL

    def _make_request(self, method, url, headers, data=None, params=None, max_retries=3):
        humanizer.random_sleep(1.5, 3.5)
        for attempt in range(max_retries):
            try:
                final_headers = humanizer.shuffle_headers(headers)
                response = self.session.request(
                    method, url, headers=final_headers, data=data, params=params,
                    proxies=global_proxy if dl else None, timeout=qqtime, verify=False
                )
                response.raise_for_status()
                return response.json()
            except requests.exceptions.RequestException as e:
                print(f"~请求异常: {e}。模拟真人, {attempt + 1}/{max_retries} 次尝试...")
                if attempt < max_retries - 1:
                    humanizer.random_sleep(3, 7)
                else:
                    print(f"~达到最大重试次数，任务失败。")
                    return None
    
    def sg(self, y):
        timestamp = str(int(time.time() * 1000))
        path = urlparse(y).path
        data = f"appSecret=nFU9pbG8YQoAe1kFh+E7eyrdlSLglwEJeA0wwHB1j5o=&channel=android_app&timestamp={timestamp}&token={self.token}&version=1.58.0&{path}"
        data1 = f"appSecret=Ew+ZSuppXZoA9YzBHgHmRvzt0Bw1CpwlQQtSl49QNhY=&channel=alipay&timestamp={timestamp}&token={self.token}&{path}"
        sign = hashlib.sha256(data.encode()).hexdigest()
        sign1 = hashlib.sha256(data1.encode()).hexdigest()
        return sign, sign1, timestamp

    def name(self):
        data = {'token': self.token}
        re = self._make_request('post', self.phone_url, headers=self.hd, data=data)
        if re and re['code'] == 0:
            try:
                self.phone = self.cook.split('#')[1] if "#" in self.cook else p(re['data']['phone'])
            except Exception:
                print(f'[账号] Cookie备注解析异常')
                return False
            
            self.id = re["data"]["id"]
            sign, _, timestamp = self.sg(self.check_url)
            self.hd['sign'] = sign
            self.hd['timestamp'] = timestamp
            r = self._make_request('post', self.check_url, headers=self.hd, data=data)
            
            if r and r['code'] == 0:
                balance = r['data']['integral']
                print(f"[{self.phone}] ✅登录成功！积分余额: {balance}")
                return True
            else:
                print(f"[{self.phone}] ❎获取余额失败: {r.get('msg', '未知错误') if r else '请求失败'}")
                return False
        else:
            msg = re.get("msg", "未知错误") if re else "请求失败"
            print(f"[账号] ❎登录失败==> {msg}")
            return False

    def sign(self):
        data = {'activityId': '600001', 'token': self.token}
        sign, _, timestamp = self.sg(self.sign_url)
        self.hd['sign'] = sign
        self.hd['timestamp'] = timestamp
        re = self._make_request('post', self.sign_url, headers=self.hd, data=data)
        if re:
            print(f"[{self.phone}] ✅签到==> {re.get('msg', '无消息')}")

    # 支付宝广告任务
    def zfbgg1(self):
        # 采纳用户建议：分组执行，每组6-10次，组间休息10-30秒
        print(f"--- 支付宝任务开始，将分批执行(每批6-10次) ---")
        total_tasks_done = 0
        max_tasks_possible = 50 # 任务上限

        while total_tasks_done < max_tasks_possible:
            batch_size = random.randint(6, 10)
            print(f"--- 开始新一批任务，本批 {batch_size} 次 ---")
            
            for t in range(batch_size):
                if total_tasks_done >= max_tasks_possible:
                    print("~已达到50次任务上限，停止。")
                    break

                data = {'taskType': "9", 'token': self.token}
                _, sign1, timestamp = self.sg(self.rcrw_url)
                hd1 = {
                    'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 13; MEIZU 20 Build/TKQ1.221114.001) Chrome/105.0.5195.148 MYWeb/0.11.0.240407200246 UWS/3.22.2.9999 UCBS/3.22.2.9999_220000000000 Mobile Safari/537.36 NebulaSDK/1.8.100112 Nebula AlipayDefined(nt:WIFI,ws:1080|1862|2.8125) AliApp(AP/10.5.88.8000) AlipayClient/10.5.88.8000 Language/zh-Hans useStatusBar/true isConcaveScreen/true NebulaX/1.0.0 DTN/2.0",
                    'Connection': "Keep-Alive", 'Accept-Encoding': "gzip", 'Content-Type': "application/x-www-form-urlencoded",
                    'Accept-Charset': "UTF-8", 'channel': "alipay", 'sign': sign1,
                    'x-release-type': "ONLINE", 'version': "", 'timestamp': timestamp
                }
                response = self._make_request('post', self.rcrw_url, headers=hd1, data=data)
                
                if response and response.get("data"):
                    total_tasks_done += 1
                    print(f"[{self.phone}] ✅第{total_tasks_done}次支付宝广告==> {response['data']}")
                else:
                    msg = response.get('msg') if response else "请求失败"
                    print(f"[{self.phone}] ❎第{total_tasks_done + 1}次广告失败==> {msg}, 模拟用户放弃")
                    total_tasks_done = max_tasks_possible # 设置为最大值以跳出外层循环
                    break # 跳出内层循环
                
                humanizer.random_sleep(4, 8) # 模拟单次任务的观看延迟
            
            if total_tasks_done >= max_tasks_possible:
                break # 跳出外层循环
            
            # 模拟一组任务完成后的休息
            print(f"--- 本批完成，模拟休息... ---")
            humanizer.random_sleep(10, 30)

        print(f"--- 支付宝任务结束，共完成 {total_tasks_done} 次 ---")
    
    def rcrw(self):
        data = {'token': self.token}
        sign, _, timestamp = self.sg(self.listUrl)
        self.hd['sign'] = sign
        self.hd['timestamp'] = timestamp
        response = self._make_request('post', self.listUrl, headers=self.hd, data=data)
        if response and response.get('code') == 0:
            tasks = response.get('data', {}).get('items', [])
            if not tasks:
                print("~日常任务列表为空。")
                return

            random.shuffle(tasks)
            print(f'[{self.phone}] ✅获取到{len(tasks)}个日常任务, 将随机顺序执行...')
            for item in tasks:
                title = item["title"]
                task_data = {'taskCode': item["taskCode"], 'token': self.token}
                sign, _, timestamp = self.sg(self.rcrw_url)
                self.hd['sign'] = sign
                self.hd['timestamp'] = timestamp
                
                humanizer.random_sleep(3, 7)
                
                response1 = self._make_request('post', self.rcrw_url, headers=self.hd, data=task_data)
                data1 = response1.get("data") if response1 else "请求失败"
                if data1:
                    print(f'[{self.phone}] ✅完成日常任务[{title}]成功==> {data1}')
                else:
                    print(f'[{self.phone}] ❎完成日常任务[{title}]失败==> {response1.get("msg") if response1 else "请求失败"}')
        else:
            print("❎获取日常任务列表失败!")

    def timejl(self):
        url = "https://userapi.qiekj.com/timedBenefit/applyRewardForTimeBenefit"
        params = {'token': self.token}
        sign, _, timestamp = self.sg(url)
        self.hd1['sign'] = sign
        self.hd1['timestamp'] = timestamp
        r = self._make_request('get', url, headers=self.hd1, params=params)
        if r and r.get("code") == 0:
            print(f'[{self.phone}] ✅领取时间段奖励成功==> {r["data"]["rewardNum"]}')
        else:
            print(f'[{self.phone}] ❎领取时间段奖励失败==> {r.get("msg") if r else "请求失败"}')

    def start(self):
        if not self.name():
            return

        available_tasks = [
            {'name': '签到', 'func': self.sign},
            {'name': '领取时间段奖励', 'func': self.timejl},
            {'name': '支付宝广告', 'func': self.zfbgg1},
            {'name': '遍历日常任务', 'func': self.rcrw},
        ]

        random.shuffle(available_tasks)

        print(f"\n[{self.phone}] --------滴滴, {self.device_brand} 牌快车发车, 坐稳了--------")
        print(f"本次任务序列: {[task['name'] for task in available_tasks]}")

        for task in available_tasks:
            humanizer.random_sleep(5, 12)
            print(f"----- [{self.phone}] 开始执行: {task['name']} -----")
            try:
                task['func']()
            except Exception as e:
                print(f"执行任务 [{task['name']}] 时发生意外错误: {e}")
        
        humanizer.random_sleep(10, 20)
        print(f"----- [{self.phone}] 所有任务已执行完毕 -----")
    
    # 新增：查询当日积分（基于原版jrjf逻辑，适配为实例方法）
    def query_daily_points(self, i):
        try:
            # 1. 获取用户名
            # (name() 已经在start()中调用, self.phone 应该有值, 但为保险起见重新获取)
            hd_user = self.hd.copy()
            sign, _, timestamp = self.sg(self.phone_url)
            hd_user['sign'] = sign
            hd_user['timestamp'] = timestamp
            r = requests.post(self.phone_url, data={'token': self.token}, headers=hd_user).json()
            
            if r['code'] != 0:
                return {'序号': i + 1, '用户': f"账号{i+1}", 'arg1': f"登录失败: {r['msg']}", 'arg2': "N/A"}

            phone = p(r['data']['phone'])
            if "#" in self.cook:
                phone = self.cook.split('#')[1]

            # 2. 获取总积分
            hd_balance = self.hd.copy()
            sign, _, timestamp = self.sg(self.check_url)
            hd_balance['sign'] = sign
            hd_balance['timestamp'] = timestamp
            r1 = requests.post(self.check_url, data={'token': self.token}, headers=hd_balance).json()
            balance = r1['data']['integral'] if r1['code'] == 0 else 'N/A'

            # 3. 获取今日积分
            data = {
                'page': (None, '1'), 'pageSize': (None, '100'),
                'type': (None, '100'), 'receivedStatus': (None, '1'),
                'token': (None, self.token),
            }
            # 这个请求头是原版查询积分专用的，保持一致
            hd_jrjf = {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 14; 23117RK66C Build/UKQ1.230804.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/118.0.0.0 Mobile Safari/537.36 AgentWeb/5.0.0 UCBrowser/11.6.4.950 com.qiekj.QEUser',
                'Accept': 'application/json, text/plain, */*',
                'channel': 'android_app',
            }
            re_response = requests.post(self.jrjf_url, headers=hd_jrjf, files=data).json()
            
            total_amount = 0
            if re_response.get('data') and re_response['data'].get('items'):
                current_date = datetime.now().strftime('%Y-%m-%d')
                for item in re_response['data']['items']:
                    received_date = item['receivedTime'][:10]
                    if received_date == current_date:
                        total_amount += item['amount']
            print(f"[{phone}] ✅今日获得积分: {total_amount}")
            return {
                '序号': i + 1, '用户': phone, 'arg1': balance, 'arg2': total_amount
            }
        except Exception as e:
            print(f"[账号{i + 1}] ❎查询当日积分出现错误: {e}")
            return {
                '序号': i + 1, '用户': f"账号{i+1}", 'arg1': "查询出错", 'arg2': "N/A"
            }

# ==================================================================================
# ============================ 独立推送和汇总功能 ============================
# ==================================================================================

def WxPusher_ts(content):
    try:
        url = 'https://wxpusher.zjiecode.com/api/send/message'
        params = {
            'appToken': WxPusher_token,
            'content': content,
            'summary': '胖乖生活-任务汇总',
            'contentType': 3, # 1为text, 2为html, 3为markdown
            'uids': [WxPusher_uid]
        }
        re = requests.post(url, json=params)
        msg = re.json().get('msg', None)
        print(f'WxPusher推送结果：{msg}\n')
    except Exception as e:
        print(f"WxPusher推送出现错误: {e}")

def pushplus_ts(content):
    try:
        url = 'https://www.pushplus.plus/send/'
        data = {
            "token": pushplus_token,
            "title": '胖乖生活-任务汇总',
            "content": content,
            "template": "html" # pushplus支持html
        }
        re = requests.post(url, json=data)
        msg = re.json().get('msg', None)
        print(f'pushplus推送结果：{msg}\n')
    except Exception as e:
        print(f"pushplus推送出现错误: {e}")

def format_and_send_summary(msg_list):
    try:
        sorted_data = sorted(msg_list, key=lambda x: x['序号'])
        table_content = ''
        for row in sorted_data:
            table_content += f"<tr><td style='border: 1px solid #ccc; padding: 6px;'>{row['序号']}</td><td style='border: 1px solid #ccc; padding: 6px;'>{row['用户']}</td><td style='border: 1px solid #ccc; padding: 6px;'>{row['arg1']}</td><td style='border: 1px solid #ccc; padding: 6px;'>{row['arg2']}</td></tr>"

        summary_html = f"<table style='border-collapse: collapse;'><tr style='background-color: #f2f2f2;'><th style='border: 1px solid #ccc; padding: 8px;'>🆔</th><th style='border: 1px solid #ccc; padding: 8px;'>用户名</th><th style='border: 1px solid #ccc; padding: 8px;'>总积分</th><th style='border: 1px solid #ccc; padding: 8px;'>今日积分</th></tr>{table_content}</table>"
        
        if WxPusher_token and WxPusher_uid:
            WxPusher_ts(summary_html)
        if pushplus_token:
            pushplus_ts(summary_html)
    except Exception as e:
        print(f"汇总推送出现错误: {e}")


# ============================ 脚本主入口 ============================

if __name__ == '__main__':
    print(f"当前版本: {v}")
    requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)
    print = partial(print, flush=True)
    
    # --- Cookie 获取逻辑 ---
    if jh:
        ck1 = []
        if 'PGSH_TOKEN' in os.environ: ck1.append(os.environ.get('PGSH_TOKEN'))
        if ckurl != "": ck1.append(requests.get(ckurl).text.strip())
        if ck != "": ck1.append(ck)
        if not ck1: print("变量为空..."); exit(-1)
        cookie = '&'.join(ck1)
    else:
        if 'PGSH_TOKEN' in os.environ:
            cookie = os.environ.get('PGSH_TOKEN')
        else:
            cookie = ck if ckurl == "" else requests.get(ckurl).text.strip()
        if cookie == "": print("变量为空..."); exit(-1)
    cookies = cookie.split("&")
    print(f"胖乖生活共获取到 {len(cookies)} 个账号")
    
    if dl:
        start_dlapi()
        print("代理模块已启动，等待初始化...")
        time.sleep(5)
    
    # --- 任务执行逻辑 ---
    if bf:
        print("✅开启高仿真并发模式")
        with ThreadPoolExecutor(max_workers=int(bfsum)) as executor:
            futures = [executor.submit(PGSH(ck_item).start) for ck_item in cookies]
            for future in as_completed(futures): future.result()
    else:
        print("✅开启高仿真常规运行模式")
        for i, ck_item in enumerate(cookies):
            print(f"\n================== 开始第{i + 1}个账号 ==================")
            PGSH(ck_item).start()
            if i < len(cookies) - 1:
                interval = random.uniform(10, 30)
                print(f"{interval:.1f}秒后进行下一个账号...")
                time.sleep(interval)
    
    if dl:
        stop_event.set()
    
    print("\n所有账号任务执行完毕。")
    
    # --- 积分汇总和推送逻辑 ---
    if ts.lower() == 'true': # 检查推送总开关
        print("\n======开始查询所有账号当日收益======")
        summary_list = []
        for i, ck_item in enumerate(cookies):
            print(f"---正在查询第{i + 1}个账号...")
            try:
                # 必须为每个账号创建新实例，以确保使用正确的token
                temp_instance = PGSH(ck_item) 
                summary_list.append(temp_instance.query_daily_points(i))
            except Exception as e:
                print(f"查询账号 {i+1} 积分时出错: {e}")
                summary_list.append({'序号': i + 1, '用户': f"账号{i+1}", 'arg1': "查询失败", 'arg2': "N/A"})
        
        format_and_send_summary(summary_list)
    else:
        print("推送未开启(pg_ts=False)，跳过积分统计。")

# 当前脚本来自于  脚本库下载！
# 脚本库官方QQ群: 
# 脚本库中的所有脚本文件均来自热心网友上传和互联网收集。
# 脚本库仅提供文件上传和下载服务，不提供脚本文件的审核。
# 您在使用脚本库下载的脚本时自行检查判断风险。
# 所涉及到的 账号安全、数据泄露、设备故障、软件违规封禁、财产损失等问题及法律风险，与脚本库无关！均由开发者、上传者、使用者自行承担。