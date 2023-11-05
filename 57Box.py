"""
57Box 1.10
仅供学习交流，请在下载后的24小时内完全删除 请勿将任何内容用于商业或非法目的，否则后果自负。
Author By Qim肖恩
Updated By Huansheng
更新说明：修复sign接口问题
玩法：
微信小程序  57Box   玩法：完成基础任务抽免费箱子
登录微信小程序授权手机号然后下载APP设置密码
export BOX_data=手机号@密码
多账号用'===='隔开 例 账号1====账号2
cron： 0 8 * * *
"""

import urllib3

urllib3.disable_warnings()
lottery = 1  # 抽鞋盒开关 1开启 0关闭
enabledTaskAndLottery = True
# 盲盒需要的矿石数量
lotteryBoxPrize = 80
# 进群密码
joinGroupPassword = "123456"
import os
import time
import requests
import datetime
import hashlib


def getSign(userId):
    def getDate():
        e = datetime.datetime.now()
        a = e.year
        t = e.month
        l = e.day
        n = e.weekday()
        o = e.hour
        i = e.minute
        s = e.second
        c = int(e.timestamp())
        r = str(e)
        return {
            "year": a,
            "month": t,
            "date": l,
            "hours": o,
            "minute": i,
            "second": s,
            "day": n,
            "timeStamp": c,
            "dateDateTime": r,
            "dates": r.split(" ")[0].replace("/", "-"),
        }

    s = getDate()
    c = s["year"]
    r = s["month"]
    u = s["date"]
    d = s["hours"]
    m = s["minute"]
    v = str(c) + "-" + str(r) + "-" + str(u) + " " + str(d) + ":" + str(m)
    currentTime = int(datetime.datetime.strptime(v, "%Y-%m-%d %H:%M").timestamp())
    return hashlib.md5((str(currentTime) + userId + "box57").encode()).hexdigest()


# from dotenv import load_dotenv
#
# load_dotenv()
accounts = os.getenv("BOX_data")
print(
    "原作者肖恩公告：" + requests.get("http://1.94.61.34:50/index.txt").content.decode("utf-8")
)
if accounts is None:
    print("你没有填入BOX_data，咋运行？")
    exit()
accounts_list = accounts.split("====")
num_of_accounts = len(accounts_list)
print(f"获取到 {num_of_accounts} 个账号")
for i, account in enumerate(accounts_list, start=1):
    values = account.split("@")
    if len(values) == 2:
        mobile, password = values[0], values[1]
    else:
        print(f"\n{'=' * 8}第【{i}】个账号数据有误，请检查！该数据为：{account}")
        continue
    print(f"\n{'=' * 8}开始执行第【{i}】个账号[{mobile}]{'=' * 8}")
    url = "https://www.57box.cn/app/index.php?i=2&t=0&v=1&from=wxapp&c=entry&a=wxapp&do=login&m=greatriver_lottery_operation"
    headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Html5Plus/1.0 (Immersed/47) uni-app",
    }

    data = {
        "mobile": mobile,
        "password": password,
        "password2": "",
        "code": "",
        "invite_uid": "0",
        "source": "app",
    }

    response = requests.post(url, headers=headers, data=data).json()
    if response["errno"] == 0:
        # print(f"{response['data']}")
        print(f"{response['message']}")
        token = response["data"]["token"]
        print(f"{'=' * 12}获取账号信息{'=' * 12}")
        url = f"https://www.57box.cn/app/index.php?i=2&t=0&v=1&from=wxapp&c=entry&a=wxapp&do=getuserinfo&&token={token}"
        data = {
            "m": "greatriver_lottery_operation",
            "title": "",
        }
        response = requests.post(url, headers=headers, data=data).json()
        if response["errno"] == 999:
            print(f"{response['message']}")
        elif response["errno"] == 0:
            userId = response["data"]["id"]
            money = response["data"]["money"]
            nickname = response["data"]["nickname"]
            integral_str = response["data"]["integral"]
            try:
                integral = int(float(integral_str))
                print(f"Name:{nickname}---矿石余额:{integral}---水晶余额:{money}")
            except ValueError:
                print(f"无效的integral值: {integral_str}")
        else:
            print(f"错误未知{response}")
            break
        if enabledTaskAndLottery:
            print(f"{'=' * 12}开始每日任务{'=' * 12}")
            sign = getSign(userId)
            time.sleep(3)
            # 进群密码
            answerText = joinGroupPassword
            response = requests.get(
                f"https://www.57box.cn/app/index.php?i=2&t=0&v=1&from=wxapp&c=entry&a=wxapp&do=uptaskinfo&m=greatriver_lottery_operation&radomstr={sign}&id=26&answer={answerText}&token={token}&source=app",
                headers=headers,
            ).json()
            state = "进群密码"
            if response["errno"] == 999:
                print(f"{state}---{response['message']}")
            elif response["errno"] == 0:
                print(f"{state}---{response['message']}")
            else:
                print(f"{state}错误未知{response}")
                break
            time.sleep(3)
            response = requests.get(
                f"https://www.57box.cn/app/index.php?i=2&t=0&v=1&from=wxapp&c=entry&a=wxapp&do=uptaskinfo&m=greatriver_lottery_operation&radomstr={sign}&id=30&answer=%E7%94%A8%E4%BA%8E%E5%95%86%E5%9F%8E%E5%92%8C%E6%8A%98%E6%89%A3%E5%95%86%E5%9F%8E%E5%85%91%E6%8D%A2%E5%95%86%E5%93%81&token={token}&source=app",
                headers=headers,
            ).json()
            state = "每日答题（二）"
            if response["errno"] == 999:
                print(f"{state}---{response['message']}")
            elif response["errno"] == 0:
                print(f"{state}---{response['message']}")
            else:
                print(f"{state}错误未知{response}")
                break
            time.sleep(3)
            response = requests.get(
                f"https://www.57box.cn/app/index.php?i=2&t=0&v=1&from=wxapp&c=entry&a=wxapp&do=uptaskinfo&m=greatriver_lottery_operation&radomstr={sign}&id=42&answer=%E9%80%9A%E8%BF%87%E5%BC%80%E7%9B%92%E8%8E%B7%E5%BE%97%E6%AF%8F1000%E8%83%BD%E9%87%8F%E7%9F%B3%E5%8F%AF%E4%BB%A5%E5%85%91%E6%8D%A21%E6%B0%B4%E6%99%B6&token={token}&source=app",
                headers=headers,
            ).json()
            state = "每日答题领福利（一）"
            if response["errno"] == 999:
                print(f"{state}---{response['message']}")
            elif response["errno"] == 0:
                print(f"{state}---{response['message']}")
            else:
                print(f"{state}错误未知{response}")
                break
            print(f"{'=' * 12}获取账号信息{'=' * 12}")
            url = f"https://www.57box.cn/app/index.php?i=2&t=0&v=1&from=wxapp&c=entry&a=wxapp&do=getuserinfo&&token={token}"
            data = {
                "m": "greatriver_lottery_operation",
                "title": "",
            }
            response = requests.post(url, headers=headers, data=data).json()
            if response["errno"] == 999:
                print(f"{response['message']}")
            elif response["errno"] == 0:
                # print("response:", response)
                money = response["data"]["money"]
                nickname = response["data"]["nickname"]
                integral_str = response["data"]["integral"]
                try:
                    integral = int(float(integral_str))
                    print(f"Name:{nickname}---矿石余额:{integral}---水晶余额:{money}")
                except ValueError:
                    print(f"无效的integral值: {integral_str}")
            else:
                print(f"错误未知{response}")
                break
            if lottery == 1:  # 开始抽奖
                print(f"{'=' * 12}执行开鞋盒{'=' * 12}")
                num = integral // lotteryBoxPrize
                for i in range(num):
                    url = "https://www.57box.cn/app/index.php"
                    params = {
                        "i": "2",
                        "t": "0",
                        "v": "1",
                        "from": "wxapp",
                        "c": "entry",
                        "a": "wxapp",
                        "do": "openthebox",
                        "token": token,
                        "m": "greatriver_lottery_operation",
                        "box_id": "586",
                        "paytype": "1",
                        "answer": "",
                        "num": 1,
                    }
                    res = requests.post(url, headers=headers, data=params)
                    response = res.json()
                    if len(response["data"]["prizes_data"]):
                        print(
                            f"第{str(i)}次开盲盒结果：",
                            response["message"],
                            response["data"]["prizes_data"][0]["complete_prize_title"],
                        )
                    else:
                        print(f"第{str(i)}次开盲盒结果：", response["data"]["message"])
                    if response["errno"] == 0:
                        complete_prize_title = response["data"]["prizes_data"][0][
                            "complete_prize_title"
                        ]
                        prize_market_price = response["data"]["prizes_data"][0][
                            "prize_market_price"
                        ]
                        print(
                            f"{response['message']}---{complete_prize_title}  市场价:{prize_market_price}"
                        )
                    elif response["errno"] == 999:
                        print(f"{response['message']}")
                    else:
                        print(f"错误未知{response}")
                        break
                print(f"开盲盒操作执行完毕")
                if num >= 1:
                    url = f"https://www.57box.cn/app/index.php?i=2&t=0&v=1&from=wxapp&c=entry&a=wxapp&do=uptaskinfo&&token={token}"
                    data = {
                        "m": "greatriver_lottery_operation",
                        "id": "39",
                        "answer": "",
                    }
                    response = requests.post(url, headers=headers, data=data).json()
                    state = "开盒看视频领矿石"
                    if response["errno"] == 999:
                        print(f"{state}---{response['message']}")
                    elif response["errno"] == 0:
                        print(f"{state}---{response['message']}")
                    else:
                        print(f"{state}错误未知{response}")
                        break
                else:
                    print()

            elif lottery == 0:
                print(f"{'=' * 12}不执行开鞋盒{'=' * 12}")

        # 查询奖品列表
        url = "https://www.57box.cn/app/index.php"

        params = {
            "i": "2",
            "t": "0",
            "v": "1",
            "from": "wxapp",
            "c": "entry",
            "a": "wxapp",
            "do": "getmemberprizes",
            "token": token,
            "m": "greatriver_lottery_operation",
            "page": "0",
            "type": "1",
            "prize_level": "1",
        }

        response = requests.get(url, headers=headers, params=params).json()

        all_prizes = response["data"]
        accountTotalPrize = 0
        for prize in all_prizes:
            prize_market_price = prize["prize"]["prize_market_price"]
            prize_title = prize["prize"]["complete_prize_title"]
            prizes_count = prize["prizes_count"]
            print(f"{prize_title} 数量:x{prizes_count} 单价:{prize_market_price}")
            accountTotalPrize = accountTotalPrize + float(prize_market_price) * int(
                prizes_count
            )
        print(f"奖品总价:{accountTotalPrize}")
    elif response["errno"] == 999:
        print(f"{response['message']}")
    else:
        print(f"错误未知{response}")
