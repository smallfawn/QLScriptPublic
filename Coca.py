#可口可乐吧小程序,抓包authorization,填入环境变量Coca中,多账号换行或@隔开
import json,os,random,time,requests as r
def UF():return f"Mozilla/5.0 (iPhone; CPU iPhone OS {f'{random.randint(12,15)}.{random.randint(0,6)}.{random.randint(0,9)}'} like Mac OS X) AppleWebKit/{f'{random.randint(600,700)}.{random.randint(1,4)}.{random.randint(1,5)}'} (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.20(0x16001422) NetType/WIFI Language/zh_CN"
U="https://koplus.icoke.cn/cre-bff/wechat/"
P=os.environ.get("Coca")
if P and P!="":
    C = P.split("\n") if "\n" in P else P.split("@")
    A=1
    for B in C:
        try:
            H={"Host":"koplus.icoke.cn","authorization":B,"referer":"https://servicewechat.com/wxa5811e0426a94686/307/page-frame.html","xweb_xhr":"1","user-agent":UF(),"content-type":"application/json","accept":"*/*","sec-fetch-site":"cross-site","sec-fetch-mode":"cors","sec-fetch-dest":"empty","accept-language":"zh-CN,zh"}
            signReq=r.post(url=f"{U}checkin",headers=H)
            signResp=json.loads(signReq.text)
            print(f"🎉开始签到账号：{A}🎉")
            A+=1
            if signResp["meta"]["transactionPoint"]:
                print(f"⭕签到成功，获得{str(int(signResp['meta']['transactionPoint'])/10)}个快乐瓶⭕")
            elif signResp["meta"]["transactionPoint"] is None:
                print("❗今日已签到，请勿重复签到❗")
            else:
                print("❌出现未知错误，签到失败❌")
            time.sleep(3)
            qReq=r.get(url=f"{U}profile",headers=H)
            qResp=json.loads(qReq.text)
            print(f"🎉开始查询账号积分🎉")
            if qResp["data"]:
                print(f"🎆账号快乐瓶总额：{str(int(qResp['data']['point'])/10)}🎆")
            else:
                print("❌出现未知错误，查询失败❌")
        except:
            print("⚠️⚠️⚠️脚本报错执行下一个账号⚠️⚠️⚠️")