
#微信小程序：七点五饮用天然矿泉水


import requests
from os import path
import json
import time
import os

def load_send():
    cur_path = path.abspath(path.dirname(__file__))
    notify_file = cur_path + "/notify.py"

    if path.exists(notify_file):
        try:
            from notify import send  # 导入模块的send为notify_send
            print("加载通知服务成功！")
            return send  # 返回导入的函数
        except ImportError:
            print("加载通知服务失败~")
    else:
        print("加载通知服务失败~")

    return False  # 返回False表示未成功加载通知服务



def sign():
  url = "https://h5.youzan.com/wscump/checkin/checkinV2.json?checkinId=3997371"
  headers = {
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b11) XWEB/9129",
    'xweb_xhr': "1",
    'extra-data': sid,
    'sec-fetch-site': "cross-site",
    'sec-fetch-mode': "cors",
    'sec-fetch-dest': "empty",
    'referer': "https://servicewechat.com/wx5508c9ab0d2118ff/63/page-frame.html",
    'accept-language': "zh-CN,zh;q=0.9",
    'Cookie': "KDTWEAPPSESSIONID="+sid
  }

  response = requests.get(url, headers=headers)
  time.sleep(2)
  print(response.text)
  time.sleep(2)
  return response.text

def jifen():
  url = "https://h5.youzan.com/wscump/pointstore/getCustomerPoints.json"

  headers = {
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b11) XWEB/9129",
    'Cookie': "KDTWEAPPSESSIONID="+sid
  }

  response = requests.get(url, headers=headers)
  time.sleep(2)
  # print(response.text)
  try:
    xiaoku=json.loads(response.text)
    jifen1=str(xiaoku["data"]["currentAmount"])
    print('目前积分为'+jifen1)
    time.sleep(2)

    url = "https://h5.youzan.com/wscump/checkin/get_activity_by_yzuid_v2.json?checkinId=3997371"

    headers = {
      'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b11) XWEB/9129",
      'extra-data': "sid="+sid,
      'Cookie': "KDTWEAPPSESSIONID="+sid
    }

    response = requests.get(url, headers=headers)
    xiaoku=json.loads(response.text)
    print('目前签到天数为'+str(xiaoku["data"]["continuesDay"]))
    # print(response.text)
    tongzhi='\n目前积分为'+jifen1+'\n签到天数为'+str(xiaoku["data"]["continuesDay"])
    return tongzhi
  except:
    print('积分查询失败，检查变量是否正确')



if __name__ == "__main__":
    var_name='qdwxcxcookie' 
    values = os.getenv(var_name)
    values=values.split('\n')
    content=''
    for value in values:
        beizhu=value.split('#')[0];
        sid=value.split('#')[1];
        print('-------开始' + str(beizhu) + '签到------')
        content=content+'\n===='+str(beizhu)+'账号签到情况====\n'
        content=content+str(sign())
        print('-------开始' + str(beizhu) + '查询积分------')
        content=content+str(jifen())
        content=content+'\n----------------------\n'
    # 在load_send中获取导入的send函数
    send = load_send()
    print()

    
    print('------运行结束-------')
    content=content+'\n签到10天送100积分，连续20天送20元券，连续30天送25元券，连续45天送七点五饮用天然泉水高端弱碱饮用天然泉水 表白礼物 整箱520ml*15\n'
    content=content+'\n所有账号运行完毕\n'
    print('签到10天送100积分，连续20天送20元券，连续30天送25元券，连续45天送七点五饮用天然泉水高端弱碱饮用天然泉水 表白礼物 整箱520ml*15')
     # 判断send是否可用再进行调用
    print()
    if send:
        send('七点五饮用天然矿泉水签到推送', content)
    else:
        print('通知服务不可用')
