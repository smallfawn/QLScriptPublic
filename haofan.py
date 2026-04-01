import requests
import json
import time

# ====================== 【自行填写】 ======================
token = "这里填你自己的token"
# ==========================================================

url = "https://api.haofanhuoban.com/api/v1/activity/draw/draw"

payload = {
  "openid": "MrkPfIgybOsRVIhswiLQmDBvJcSwU1",
  "openId": "MrkPfIgybOsRVIhswiLQmDBvJcSwU1",
  "activityId": "15"
}

headers = {
    'User-Agent': "Mozilla/5.0 (Linux; Android 10; MI 8 UD Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36",
    'Content-Type': "application/json",
    'authorization': f"Bearer {token}",
    'appid': "1",
    'os': "1"
}

# 抽奖次数
draw_times = 6

print("========== 好饭伙伴 抽奖脚本 ==========")
for i in range(1, draw_times + 1):
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers, timeout=10)
        res = response.json()
        print(f"第{i}次抽奖: {res}")
        time.sleep(1)
    except Exception as e:
        print(f"第{i}次抽奖异常: {e}")
        time.sleep(2)

print("脚本执行完成")
