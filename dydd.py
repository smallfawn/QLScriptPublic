
#环境变量 dydd
import os
import requests
import time
import hashlib

# 获取青龙面板环境变量 dydd
dydd = os.environ.get('dydd', '')

# 按换行符分割账号，并过滤空行
accounts = [line.strip() for line in dydd.strip().split('\n') if line.strip()]

url = "https://app2.d1ev.com/api/user/add-integral"

# 公共参数
params_base = {
    'app_id': "d1ev_app",
    'appName': "第一电动",
    'os': "android",
    'osVer': "9",
    'vName': "2.5.6",
    'vCode': "20506"
}

headers = {
    'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 9; PCRT00 Build/PQ3A.190605.06201646)",
    'Connection': "Keep-Alive",
    'Accept-Encoding': "gzip",
    'TE': "gzip, deflate; q=0.5"
}

# 定义任务列表，每个任务包括任务类型和执行次数
tasks = [
    {'type': 11, 'name': '签到', 'count': 1},
    {'type': 3, 'name': '分享', 'count': 3},
    {'type': 5, 'name': '点赞', 'count': 5},
    {'type': 2, 'name': '阅读', 'count': 1}
]

for account in accounts:
    # 分割账号为 uid 和 token
    parts = account.split('#')
    if len(parts) != 2:
        print(f"跳过无效格式账号: {account}")
        continue

    uid, token = parts

    # 生成当前时间戳
    current_timestamp = str(int(time.time()))

    for task in tasks:
        task_type = task['type']
        task_name = task['name']
        task_count = task['count']

        for _ in range(task_count):
            # 构造签名字符串
            sign_str = f"OMKCy2UxZwn8e4Ak{params_base['appName']}{params_base['app_id']}{params_base['os']}{params_base['osVer']}{current_timestamp}{token}{task_type}{uid}{params_base['vCode']}{params_base['vName']}"

            # 计算 MD5 签名
            sign = hashlib.md5(sign_str.encode('utf-8')).hexdigest()

            # 定义带有动态值的参数
            params = {
                'timestamp': current_timestamp,
                'token': token,
                'uid': uid,
                'type': task_type,
                'sign': sign.upper(),
                **params_base
            }

            try:
                # 发送 GET 请求
                response = requests.get(url, params=params, headers=headers)
                response.raise_for_status()  # 如果请求失败，则抛出异常

                # 打印任务执行结果
                print(f"账号: {uid}, 任务: {task_name}, 响应: {response.text}")
            except requests.exceptions.RequestException as e:
                print(f"账号: {uid}, 任务: {task_name}, 请求失败: {e}")

            # 任务间隔5秒
            time.sleep(5)

        # 任务类型间隔10秒
        time.sleep(10)
        
