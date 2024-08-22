
#环境变量 chmlck 取url请求头中的token
#变量格式 token#备注，多账号换行
#搜微信小程序长虹美菱

import os
import requests
response = requests.get("#小程序://长虹美菱会员服务/VgBR6WSiyJxrs4G")
response.encoding = 'utf-8'
txt = response.text
print(txt)


accounts = os.getenv("chmlck", "").splitlines()
print("☞☞☞ 长虹美菱每日签到 ☜☜☜\n")

if not accounts:
    print("未找到任何账号信息。")
else:
    for account in accounts:
        if not account.strip():
            continue
        try:
            token, note = account.split("#")
        except ValueError:
            print(f"格式错误: {account}")
            continue

        url = "https://hongke.changhong.com/gw/applet/aggr/signin"
        params = {'aggrId': "608"}
        headers = {
            'User-Agent': "Mozilla/5.0 (Linux; Android 10; Mobile Safari/537.36)",
            'Accept-Encoding': "gzip, deflate",
            'Content-Type': "application/json",
            'Token': token.strip()
        }

        try:
            response = requests.post(url, params=params, headers=headers)
            if response.status_code == 200:
                print(f"{note.strip()}：签到成功")
            elif response.status_code == 400:
                print(f"{note.strip()}：请勿重复签到")
            else:
                print(f"{note.strip()}：响应状态码 {response.status_code} - {response.text}")
        except requests.RequestException as e:
            print(f"{note.strip()}：请求失败 - {e}")
