# -*- encoding: utf-8 -*-
# @Time       :  18:57
# @Author     : yuxian
# @Email      : 1503889663@qq.com
# @File       : Coca.py
# @SoftWare   : PyCharm
# 可口可乐吧小程序,抓包authorization(全部内容 copy即可),填入环境变量Coca中,多账号换行或@隔开
import json, os, hashlib, random, time, requests as r


def UF(): return f"Mozilla/5.0 (iPhone; CPU iPhone OS {f'{random.randint(12, 15)}.{random.randint(0, 6)}.{random.randint(0, 9)}'} like Mac OS X) AppleWebKit/{f'{random.randint(600, 700)}.{random.randint(1, 4)}.{random.randint(1, 5)}'} (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.20(0x16001422) NetType/WIFI Language/zh_CN"


def generate_random_string_and_timestamp():
    T = ''.join(random.choices('0123456789abcdefghijklmnopqrstuvwxyz', k=8))
    d = str(int(time.time() * 1000))
    return T, d


def sha256_encrypt(data):
    hash_object = hashlib.sha256()
    hash_object.update(data.encode('utf-8'))
    hex_dig = hash_object.hexdigest()
    return hex_dig


def get_header(url1):
    T, d = generate_random_string_and_timestamp()
    message = url1.replace("https://koplus.icoke.cn/cre-bff", "")
    encrypted_data = sha256_encrypt(message + T + d + "apyuc3#7%m4*")
    headers = {"x-sg-id": T, "x-sg-timestamp": d, "x-sg-signature": encrypted_data}
    return headers


U = "https://koplus.icoke.cn/cre-bff/wechat/"
P = os.environ.get("Coca")
if P and P != "":
    C = P.split("\n") if "\n" in P else P.split("@")
    A = 1
    for B in C:
        try:
            H = {
                "Host": "koplus.icoke.cn",
                "Connection": "keep-alive",
                "xweb_xhr": "1",
                "Authorization": B,
                "User-Agent": UF(),
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Accept-Language": "*",
                "Sec-Fetch-Site": "cross-site",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Dest": "empty",
                "Referer": "https://servicewechat.com/wxa5811e0426a94686/364/page-frame.html",
                "Accept-Encoding": "gzip, deflate, br"
            }
            url = f"{U}checkin"
            H.update(get_header(url))
            signReq = r.post(url=url, headers=H)
            signResp = json.loads(signReq.text)
            print(f"🎉开始签到账号：{A}🎉")
            A += 1
            if signResp["meta"]["transactionPoint"]:
                print(f"⭕签到成功，获得{str(int(signResp['meta']['transactionPoint']) / 10)}个快乐瓶⭕")
            elif signResp["meta"]["transactionPoint"] is None:
                print("❗今日已签到，请勿重复签到❗")
            else:
                print("❌出现未知错误，签到失败❌")
            time.sleep(3)
            url = f"{U}profile"
            H.update(get_header(url))
            qReq = r.get(url=url, headers=H)
            qResp = json.loads(qReq.text)
            print(f"🎉开始查询账号积分🎉")
            if qResp["data"]:
                print(f"🎆账号快乐瓶总额：{str(int(qResp['data']['point']) / 10)}🎆")
            else:
                print("❌出现未知错误，查询失败❌")
        except:
            print("⚠️⚠️⚠️脚本报错执行下一个账号⚠️⚠️⚠️")
