# 微信小程序长虹智慧家居
# new Env("长虹智慧家居每日签到")
# 环境变量 chmlck 取url请求头中的token，
#变量格式 token#备注，多账号换行
#撸实物加视频会员
#
import os
import requests

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
            'User-Agent': "Mozilla/5.0 (Linux; Android 14; 23116PN5BC Build/UKQ1.230804.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.6261.120 Mobile Safari/537.36 XWEB/1220099 MMWEBSDK/20240404 MMWEBID/2445 MicroMessenger/8.0.49.2600(0x28003133) WeChat/arm64 Weixin NetType/4G Language/zh_CN ABI/arm64 MiniProgramEnv/android",
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