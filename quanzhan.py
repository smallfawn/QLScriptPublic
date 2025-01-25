
"""
小程序搜 泉站大桶订水桶装水同城送水

变量  authcode # authorization #备注     （没有备注 也可以运行）
变量名 qztoken
项目  泉站订水 

"""
import os
import requests
from datetime import datetime, timezone, timedelta
import json
import sys
import time
import random  
from io import StringIO

enable_notification =1  # 控制是否启用通知的变量   0 不发送   1 发

# 只有在需要发送通知时才尝试导入notify模块
if enable_notification == 1:
    try:
        from notify import send
    except ModuleNotFoundError:
        print("警告：未找到notify.py模块。它不是一个依赖项，请勿错误安装。程序将退出。")
        sys.exit(1)

#---------解--的简化0.2框架--------
# 配置参数
base_url = "https://microuser.quanzhan888.com"  # 实际的基础URL
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309080f)XWEB/8519"

def get_beijing_date():  # 获取北京日期的函数
    beijing_time = datetime.now(timezone(timedelta(hours=8)))
    return beijing_time.date()

def timestamp_to_beijing_time(timestamp):
    utc_zone = timezone.utc
    beijing_zone = timezone(timedelta(hours=8))
    utc_time = datetime.fromtimestamp(timestamp, utc_zone)
    beijing_time = utc_time.astimezone(beijing_zone)
    return beijing_time.strftime("%Y-%m-%d %H:%M:%S")

def get_env_variable(var_name):
    value = os.getenv(var_name)
    if value is None:
        print(f'环境变量{var_name}未设置，请检查。')
        return None
    
    accounts = value.strip().split('\n')  # 使用 \n 分割
    num_accounts = len(accounts)
    print(f'-----------本次账号运行数量：{num_accounts}-----------')
    print(f'泉站大桶订水--QGh3amllamll  ')

    return accounts

#113.28824159502027
#23.103660007697727
def fz_hs(auth_code, authorization, user_agent, sign): #封装headers
    return {
        'Host': 'microuser.quanzhan888.com',
        'Connection': 'keep-alive',
        'Content-Length': '2',
        'charset': 'utf-8',
        'product': "shop",
        'authcode': auth_code,
        'authorization': authorization,
        'user-agent': user_agent,
        'sign': sign,
        'Accept-Encoding': 'gzip,compress,br,deflate',
        'platform': "wx",
        'x-requested-with': 'xmlhttprequest',
        'content-type': 'application/x-www-form-urlencoded',
    }

def wdqbsj(auth_code, authorization):  # 个人信息/钱包
    url = f"{base_url}/user/get-wallet-info"
    headers = fz_hs(auth_code, authorization, user_agent, "99914b932bd37a50b983c5e7c90ae93b")
    data = json.dumps({})  # 发送空的JSON数据
    #print(url)

    try:
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()
        response_data = response.json()
        #print("解析的JSON数据：", response_data)

        # 判断code并提取所需数据
        if response_data.get('code') == 0:
            user_id = response_data['data']['wallet_info'].get('user_id')
            total_balance = response_data['data']['wallet_info'].get('total_balance')
            today_income = response_data['data']['wallet_info'].get('today_income')
            #print(f"用户ID: {user_id}, 总余额: {total_balance}, 今日收入: {today_income}")
            print(f"🆔: {user_id}, 总💸: {total_balance}, 今日: {today_income}")

            # 判断今日收入是否大于0
            if float(today_income) > 0:
                print("今日已有收入，不需要签到")
                #tj_sign(auth_code, authorization)#测试提交签到
            else:
                print("今日无收入，需要签到")
                tj_sign(auth_code, authorization)
               

        else:
            print("响应代码不为0，完整响应体：", response_data)

    except ValueError:
        print("响应不是有效的JSON格式。")
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")


def tj_sign(auth_code, authorization):  # 提交签到
    url = f"{base_url}/user/do-sign"
    headers = fz_hs(auth_code, authorization, user_agent, "99914b932bd37a50b983c5e7c90ae93b")
    data = json.dumps({})  # 发送空的JSON数据

    try:
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()
        response_data = response.json()
        #print("解析的JSON数据：", response_data)

        # 提取所需数据并转换时间戳
        if 'data' in response_data and len(response_data['data']) > 0:
            for item in response_data['data']:
                user_id = item.get('user_id')
                sign_date = timestamp_to_beijing_time(item.get('sign_date'))
                sign_time = timestamp_to_beijing_time(item.get('sign_time'))
                #print(f"用户: {user_id}, 签名日期: {sign_date}, 签到时间: {sign_time}")
                print(f" 签名日期: {sign_date}, 签到🎉: {sign_time}")
        return response_data
    except ValueError:
        print("响应不是有效的JSON格式。")
        return None
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
        return None

#------------通知开始-----------

class Tee:
    def __init__(self, *files):
        self.files = files

    def write(self, obj):
        for file in self.files:
            file.write(obj)
            file.flush()  # 确保及时输出

    def flush(self):
        for file in self.files:
            file.flush()
#------------通知结束-----------









def main():
    string_io = StringIO()
    original_stdout = sys.stdout

    try:
        sys.stdout = Tee(sys.stdout, string_io)

        var_name = 'qztoken'  # 环境变量名
        accounts = get_env_variable(var_name)
        if not accounts:
            return

        print(f'找到 {len(accounts)} 个账号的令牌。')
        total_tokens = len(accounts)
        
        for index, account in enumerate(accounts, start=1):
            parts = account.split('#')
            auth_code, authorization = parts[0], parts[1]
            remark = None if len(parts) == 2 else parts[2]  # 检查是否有备注

            remark_info = f" --- 备注: {remark}" if remark else ""
            print(f"------账号 {index}/{total_tokens}{remark_info} ------")

            wdqbsj(auth_code, authorization)  # 个人信息/钱包

            # 暂停3到5秒
            time.sleep(random.randint(3, 5))

    finally:
        sys.stdout = original_stdout
        output_content = string_io.getvalue()

        if enable_notification:
            send("-泉站大桶订水-通知", output_content)

if __name__ == "__main__":
    main()

"""
#本地测试用 
os.environ['qztoken'] = '''
authcode # authorization 

'''

def main():
    var_name = 'qztoken'  # 环境变量名
    accounts = get_env_variable(var_name)
    if not accounts:
        return

    print(f'找到 {len(accounts)} 个账号的令牌。')
    total_tokens = len(accounts)
    
    for index, account in enumerate(accounts, start=1):
        parts = account.split('#')
        auth_code, authorization = parts[0], parts[1]
        remark = None if len(parts) == 2 else parts[2]  # 检查是否有备注

        remark_info = f" --- 备注: {remark}" if remark else ""
        print(f"------账号 {index}/{total_tokens}{remark_info} ------")

        wdqbsj(auth_code, authorization)# 个人信息/钱包


if __name__ == "__main__":
    main()
"""
