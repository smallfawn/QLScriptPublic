#抓这个ecustomer.cntaiping.com域名下的x-ac-token-ticket 一天多运行几次吧 后面加兑换
#备注名&x-ac-token-ticket 多账号换行
#变量名taipingtong

import time
import os
import random
import requests   
import datetime
  
ck = os.environ.get("taipingtong")

kqid = 66 #1元e卡id

class TPT:
    def __init__(self):
        self.accounts_list = ck.strip().split('\n')
        self.num_of_accounts = len(self.accounts_list)
        print(f'NONE益达,共找到{self.num_of_accounts}个账号,开始运行\n')

    def run(self):
        for i, account in enumerate(self.accounts_list, start=1):
            try:
              name, ck = account.split('&')
            except ValueError:
                print("输入数据格式不正确，请检查输入并重新尝试。")
            # 添加适当的处理逻辑，比如给 name 和 ck 赋予默认值或者提示用户重新输入

            self.headers = {
                        'Host': 'ecustomer.cntaiping.com',
                        'Accept': 'application/json;charset=UTF-8',
                        'x-ac-token-ticket': ck,
                        'x-ac-channel-id': 'KHT',
                        'Accept-Language': 'zh-cn',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Content-Type': 'application/json',
                        'Origin': 'https://ecustomercdn.itaiping.com',
                        'Content-Length': '39',
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/77777;yuangongejia#ios#kehutong#CZBIOS',
                        'Referer': 'https://ecustomercdn.itaiping.com/',
                        'x-ac-mc-type': 'gateway.user',
                        'Connection': 'keep-alive'
                }
            self._headers = {
                        'Host': 'ecustomer.cntaiping.com',
                        'Accept': 'application/json, text/plain, */*',
                        'API-TOKEN': ck,
                        'Accept-Language': 'zh-cn',
                        'Content-Type': 'application/json;charset=utf-8',
                        'Origin': 'https://ecustomercdn.itaiping.com',
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/77777;yuangongejia#ios#kehutong#CZBIOS',
                        'Connection': 'keep-alive',
                        'Referer': 'https://ecustomercdn.itaiping.com/',
                        'ENV': 'app',
                }            
            print(f"==============开始执行账号{i}==============")
            if self.login(name, ck):
                self.process_account(name, ck)
                print(f"==============运行结束==============")

    def login(self,name, ck):
        url = "https://ecustomer.cntaiping.com/campaignsms/integral/queryIntegralDetailList"
        json_data = {
            'pageNo': 1,
            'pageSize': 10,
            'typePo': '3',
        }
        response = requests.post(url, headers=self.headers ,json=json_data)
        f = response.json()
        #print(response.text)
        if f['success'] == True:
            print(f"{name}: 登录成功")
            time.sleep(2)
            a = f['data']['list']
            if a is not None:
                for b in a:
                    effectDate = b['effectDate']
                    memo = b['memo']
                    overDate = b['overDate']
                    num = b['num']
                    createTime = b['createTime']
                    print(f"{memo}[{num}]-有效期[{createTime}]")
            return True
        else:
            print(f"{name}: 登录失败,{f['msg']}")
            return False
            
    def process_account(self, name ,ck):
        Surl = "https://ecustomer.cntaiping.com/campaignsms/couponAndsign"
        _S = {}   
        print(f"==============每日签到==============")
        response = requests.post(Surl,  headers=self.headers , json=_S)
      #  print(response.text)
        s = response.json()
        if s['success'] == True:  
            message = s['data']['dailySignRsp']['message']
            integralSend = s['data']['dailySignRsp']['integralSend']
            self.integral = s['data']['dailySignRsp']['integral']
            print(f"签到-{message}[{integralSend}]-当前有{self.integral}金币")
        else:
            print(f"签到失败,{s['msg']}")                
        Turl = "https://ecustomer.cntaiping.com/campaignsms/goldParty/task/list"
        _T = {
            'activityNumber': 'goldCoinParty',
            'rewardFlag': '1',
            'openMsgRemind': 0,
        }     
        print(f"==============日常任务==============")
        response = requests.post(Turl,  headers=self.headers ,json=_T)
        t = response.json()
        if t['success'] == True:  
            c = t['data']['taskList']
            for d in c :
                _taskId = d['taskId']
                _name = d['name']
                time.sleep(4)
                print(f"去完成{_name}任务")
                Gurl = "https://ecustomer.cntaiping.com/campaignsms/goldParty/task/finish"
                _G = {
                    'taskIds': [
                        _taskId,
                    ],
                }
                response = requests.post(Gurl,  headers=self.headers ,json=_G)
                g = response.json()
                #print(response.text)
                if g['success'] == True:  
                    print(f"完成{_name}任务成功")
                else:
                    print(f"完成{_name}任务失败,{g['msg']}")  
                time.sleep(3)
                Aurl = "https://ecustomer.cntaiping.com/campaignsms/goldParty/goldCoin/add"
                _A = {
                    'taskIds': [
                        _taskId,
                    ],
                }
                response = requests.post(Aurl,  headers=self.headers ,json=_A)
                a = response.json()
                #print(response.text)
                if a['success'] == True:  
                    print(f"领取{_name}任务奖励成功")
                else:
                    print(f"领取{_name}任务奖励失败,{a['msg']}")  
        else:
            print(f"获取任务失败,{d['msg']}")                                             
        Murl = "https://ecustomer.cntaiping.com/informationms/app/config/get/1"
        _M = {
              "plugInId" : "701b3099297148a8ba979ad9c982b561",
              "trackDesc" : "赚金币任务",
               "city" : "1",
              "pageSize" : 10,
              "type" : "GENERAL_PLUGIN"
        }                        
        print(f"==============日常阅读==============")
        response = requests.post(Murl,  headers=self.headers ,json=_M)
        m = response.json()
        if m['success'] == True:  
            v = m['data']
            for item in v:
                cell_data = item['cell']['0'][0]
                _title = cell_data['title']
                _contentId = cell_data['contentId']
                print(f"去阅读[{_title}]")
                self.l = random.uniform(5, 6)
                time.sleep(self.l)       
                Qurl = "https://ecustomer.cntaiping.com/informationms/app/v2/article/web/coinInfoV2"
                _Q = {
                    'articleId': _contentId,
                    'source': 'TPT',
                    'detailUrl': f'https://ecustomercdn.itaiping.com/static/newscontent/#/info?articleId={_contentId}&source=TPT&x_utmId=10013&x_businesskey=articleId',
                    'deviceId': '',
                    'version': 'V2',
                }                      
                response = requests.post(Qurl,  headers=self.headers ,json=_Q)
                q = response.json()
                if q['success'] == True:  
                    self.p = q['data']['countDownCoinInfo']['coinNum']
                   # print(f"阅读[{_title}]成功获得{p}金币")
                    pass
                else:
                    print(f"进入阅读[{_title}奖励失败,{p['msg']}]") 
                time.sleep(self.l)    
                Kurl = "https://ecustomer.cntaiping.com/informationms/app/v2/read/gold"
                _K = {
                    "articleId": _contentId,
                    "source" : "TPT"
                }                        
                response = requests.post(Kurl,  headers=self.headers ,json=_K)
                k = response.json()
                if k['success'] == True:  
                    w = k['data']['coinTrackDto']['title']
                    print(f"阅读[{w}]成功获得{self.p}金币")
                else:
                    print(f"阅读[{_title}失败,{k['msg']}]")                                                                                           
        else:  
            print(f"阅读[{_title}]失败,{m['msg']}")                            
        Zurl = "https://ecustomer.cntaiping.com/campaignsms/coinBubble/getAllCoins"
        _Z = {}                      
        print(f"==============领取阅读奖励==============")
        response = requests.post(Zurl,  headers=self.headers ,json=_Z)
        z = response.json()
      #  print(response.text)
        if z['success'] == True: 
            coinNum = z['data']['coinNum']  
            print(f"领取阅读奖励-{coinNum}金币") 	  
        else:
            print(f"领取阅读奖励失败,{z['msg']}") 	 
        print(f"==============兑换卡券==============")
        Qurl = "https://ecustomer.cntaiping.com/campaignsms/coin/exchange/receive"
        _Q = {
            'id': kqid,
        }                  
        response = requests.post(Qurl,  headers=self.headers ,json=_Q)
        q = response.json()
       # print(response.text)
        if q['success'] == True: 
            couponId = q['data']['couponId']  
            print(f"卡券兑换成功-{couponId}")
        else:
            print(f"卡券兑换失败,{q['msg']}")  
        print(f"==============水滴浇树==============")
        #新人奖励
        yurl = "https://ecustomer.cntaiping.com/love-tree/v2/api/task/complete-newcomer-water"
        _y = {
            "tid" : 1
        }     
        response = requests.post(yurl,  headers=self._headers ,json=_y)
        y = response.json()
      #  print(response.text)
        if y['code'] == 200:  
            water = y['data']['water'] 
            print(f"完成新人奖励成功,获得了{water}水滴") 
        else:
            print(f"完成新人奖励失败,{y['msg']}")  
        #每月登录奖励
        time.sleep(2) 
        murl = "https://ecustomer.cntaiping.com/love-tree/v2/api/task/complete-task"
        _m = {
            "type" : 14
        }     
        response = requests.post(murl,  headers=self._headers ,json=_m)
        m = response.json()
      #  print(response.text)
        if m['code'] == 200:  
            water = m['data']['water'] 
            print(f"完成每月登录奖励成功,获得了{water}水滴") 
        else:
            print(f"完成每月登录奖励失败,{m['msg']}")
        #查保单领水滴奖励
        time.sleep(2) 
        curl = "https://ecustomer.cntaiping.com/love-tree/v2/api/task/complete-link-task"
        _c = {
            "tid" : 15
        }     
        response = requests.post(curl,  headers=self._headers ,json=_c)
        c = response.json()
      #  print(response.text)
        if c['code'] == 200:  
            water = c['data']['water'] 
            print(f"完成查保单领水滴奖励成功,获得了{water}水滴") 
        else:
            print(f"完成查保单领水滴奖励失败,{c['msg']}")                
        #三餐福袋奖励
        time.sleep(2) 
        surl = "https://ecustomer.cntaiping.com/love-tree/v2/api/task/complete-red-envelope"
        _s = {
            "tid" : 3
        }     
        response = requests.post(surl,  headers=self._headers ,json=_s)
        s = response.json()
      #  print(response.text)
        if s['code'] == 200:  
            water = s['data']['water'] 
            print(f"完成三餐福袋奖励成功,获得了{water}水滴") 
        else:
            print(f"完成三餐福袋奖励失败,{s['msg']}") 
        
        #获取关关注id
        
        for i in range(6):
            time.sleep(2) 
            gurl = "https://ecustomer.cntaiping.com/userms/serviceAccount/queryAllServiceAccount/v1"
            _g = {
                "pageSize" : "15",
                "page" : "1"
            }     
            response = requests.post(gurl,  headers=self._headers ,json=_g)
            g = response.json()
            # print(response.text)
            if g['success'] == True:  
            #wzid = random.choice(g['data']['contents'])['id']
                self.wzid = random.choice(g['data']['contents'])['id']
                print(f"随机获取关注ID成功[{self.wzid}]")
                time.sleep(2) 
                furl = "https://ecustomer.cntaiping.com/userms/serviceAccount/subscribe"
                _f = {
                    "serviceAccountId" : self.wzid
                }     
                response = requests.post(furl,  headers=self.headers ,json=_f)
                f = response.json()
                #print(response.text)
                if f['success'] == True:  
                   pass
                else:
                    print(f"关注文章失败,{f['msg']}")
                    break
                time.sleep(2) 
                jurl = "https://ecustomer.cntaiping.com/love-tree/v2/api/task/get-task-result"
                _j = {}     
                response = requests.post(jurl,  headers=self._headers ,json=_j)
                j = response.json()
                #print(response.text)
                if j['code'] == 200:  
                    data = j['data']
                    if j['data'] and len(j['data']) > 0:
                        water = j['data'][0]['water']
                        print(f"完成关注太平通服务号成功获得了{water}水滴")	
                    else:
                        print(f"完成关注太平通服务号未获得水滴")
                              
                else:
                    print(f"完成关注太平通服务号失败,{j['msg']}")
                    break
            else:
                print(f"获取文章ID失败,{g['msg']}")
                break
            #文章id
        time.sleep(2) 
        hurl = "https://ecustomer.cntaiping.com/informationms/app/config/get/1"
        _h = {
            "plugInId" : "701b3099297148a8ba979ad9c982b561",
            "trackDesc" : "赚金币任务",
            "city" : "1",
            "pageSize" : 10,
            "type" : "GENERAL_PLUGIN"
        }     
        response = requests.post(hurl,  headers=self._headers ,json=_h)
        q = response.json()
            # print(response.text)
        if q['success'] == True: 
            yd = q['data']
            for item in yd:
                _data = item['cell']['0'][0]
                _serviceNo = _data['serviceNo']
                contentId = _data['contentId']
                print(f"文章ID成功[{_serviceNo}]-[{contentId}]")
                    
                time.sleep(2) 
                gurl = "https://ecustomer.cntaiping.com/informationms/app/v2/article/web/coinInfoV2"
                _g = {
                    "detailUrl" : f'https://ecustomercdn.itaiping.com/static/newscontent/#/info?articleId={contentId}&source=TPT&x_utmId=10013&x_businesskey=articleId',
                    "deviceId" : "",
                    "version" : "V2",
                    "source" : "TPT",
                    "articleId" : contentId
                }     
                response = requests.post(gurl,  headers=self.headers ,json=_g)
                g = response.json()
                    #print(response.text)
                if g['success'] == True:  
                    pass
                else:
                    print(f"阅一读文章失败,{g['msg']}")
                    
                time.sleep(2) 
                vurl = "https://ecustomer.cntaiping.com/userms/serviceAccount/queryBasic"
                _v = {
                    "id" : _serviceNo
                }     
                response = requests.post(vurl,  headers=self.headers ,json=_v)
                v = response.json()
                    #print(response.text)
                if v['success'] == True:  
                    pass
                else:
                    print(f"阅二读文章失败,{v['msg']}")
                    
                time.sleep(2) 
                lurl = "https://ecustomer.cntaiping.com/informationms/app/v2/read/gold"
                _l = {
                    "articleId" : contentId,
                    "source" : "TPT"
                }     
                response = requests.post(lurl,  headers=self.headers ,json=_l)
                l = response.json()
                    #print(response.text)
                if l['success'] == True:  
                    self.LL = l['data']['coinTrackDto']['title']  
                    print(f"阅三读[{self.LL}]成功")
                else:
                    print(f"阅读文章失败,{l['msg']}")
                    break
                time.sleep(2) 
                durl = "https://ecustomer.cntaiping.com/love-tree/v2/api/task/get-task-result"
                _d = {}       
                response = requests.post(durl,  headers=self._headers ,json=_d)
                d = response.json()
                print(response.text)
                    #data = d['data']
                if d['data'] and len(d['data']) > 0:
                    water = d['data'][0]['water']
                    print(f"完成阅读{self.LL}成功获得了{water}水滴")	
                else:
                    print(f"完成阅读[{self.LL}]未获得水滴")
                             
        else:
            print(f"获取阅读文章ID失败,{q['msg']}")
            #break   
        lurl = "https://ecustomer.cntaiping.com/love-tree/v2/api/user/open-welfare_box"                  
        _l = {
            "tree_user_id" : 256533
        }       
        response = requests.post(lurl,  headers=self._headers ,json=_l)
        l = response.json()
      #  print(response.text)
        if l['code'] == 200: 
            sd = y['data']['water']
            print(f"领取神秘宝箱成功！获得了{sd}水滴") 
        else:
            print(f"领取神秘宝箱失败,{l['msg']}")
            
        yurl = "https://ecustomer.cntaiping.com/love-tree/v2/api/user/home"                  
        print(f"==============查询水滴==============")
        response = requests.get(yurl,  headers=self._headers)
        y = response.json()
      #  print(response.text)
        if y['code'] == 200: 
            mwater = y['data']['water']
            jscs = mwater // 50
            print(f"查询当前有{mwater}水滴可以浇水{jscs}次") 
            for i in range(jscs):
               time.sleep(2) 
               kurl = "https://ecustomer.cntaiping.com/love-tree/v2/api/tree/watering"                  
               _k = {
                   "tree_user_id" : 256533
               }       
               response = requests.post(kurl,  headers=self._headers ,json=_k)
               k = response.json()
               if k['code'] == 200: 
                   sy_water = k['data']['sy_water']
                   print(f"浇水成功！还剩余{sy_water}水滴") 
               else:
                   print(f"浇水失败,{k['msg']}")       
        else:
            print(f"查询水滴失败,{y['msg']}") 	                                                                                                                               
tpt = TPT()
tpt.run()
