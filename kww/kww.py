# -*- coding:utf-8 -*-
"""
cron: 0 30 0 * * *
new Env('微信小程序-口味王');
"""
import time
import os
import re
import hashlib
import json

try:
    import requests
except Exception as e:
    print(e, "\n缺少requests 模块，请执行命令安装：python3 -m pip install requests")
    exit(3)
'''
版本 v1.0.1
====================== Cookie 配置===========================
'''
mycookies = []
try:
    mycookies = os.environ["KWW_COOKIE"].split("&")
except:
    print("【提示】请先获取微信小程序[口味王]cookie,环境变量添加 KWW_COOKIE ,如有不懂加群：212796668、681030097、743744614")
    exit(3)
'''
====================== 题库 ===========================
'''
ktList = {"1":1,"2":1,"3":1,"4":1,"5":4,"6":1,"7":1,"8":1,"9":1,"10":1,"11":1,"12":1,"13":2,"14":1,"15":2,"16":1,"17":2,"18":2,"19":1,"20":1,"21":4,"22":1,"23":4,"24":1,"25":3,"26":1,"27":4,"28":1,"29":4,"30":4,"31":1,"32":4,"33":1,"34":1,"35":1,"36":1,"37":4,"38":1,"39":3,"40":4,"41":2,"42":1,"43":2,"44":4,"45":4,"46":2,"47":1,"48":1,"49":1,"50":2,"51":4,"52":4,"53":1,"54":3,"55":3,"56":4,"57":4,"58":4,"59":1,"60":4,"61":1,"62":1,"63":1,"64":2,"65":1,"66":3,"67":1,"68":1,"69":4,"70":4,"71":4,"72":1,"73":4,"74":2,"75":4,"76":4,"77":4,"78":1,"79":2,"80":1,"81":2,"82":3,"83":3,"84":4,"85":1,"86":2,"87":3,"88":2,"89":4,"90":2,"91":4,"92":3,"93":4,"94":2,"95":3,"96":2,"97":3,"98":2,"99":4,"100":4,"101":4,"102":3,"103":4,"104":4,"105":4,"106":4}
# ktList = {'1': '正确',
#           '2': '正确',
#           '3': '正确',
#           '4': '正确',
#           '5': '以上都是',
#           '6': '正确',
#           '7': '正确',
#           '8': '正确',
#           '9': '正确',
#           '10': '正确',
#           '11': '正确',
#           '12': '正确',
#           '13': '正确',
#           '14': '正确',
#           '15': '正确',
#           '16': '正确',
#           '17': '正确',
#           '18': '正确',
#           '19': '正确',
#           '20': '全国销量领先',
#           '21': '以上全是',
#           '22': '正确',
#           '23': '7',
#           '24': '正确',
#           '25': '中国海南',
#           '26': '正确',
#           '27': '22道',
#           '28': '正确',
#           '29': '以上都是',
#           '30': '以上都是',
#           '31': '正确',
#           '32': '100%',
#           '33': '高端槟榔',
#           '34': '正确',
#           '35': '正确',
#           '36': '正确',
#           '37': '海南嫩青果',
#           '38': '海南嫩青果',
#           '39': '嫩青果',
#           '40': '嫩青果',
#           '41': '海南',
#           '42': '正确',
#           '43': '全国高端销量领先',
#           '44': '以上都是',
#           '45': '中国海南',
#           '46': '槟榔、椰子、橡胶',
#           '47': '正确',
#           '48': '正确',
#           '49': '正确',
#           '50': '槟榔',
#           '51': '槟榔',
#           '52': '以上都是',
#           '53': '槟榔',
#           '54': '槟榔树',
#           '55': '槟榔树',
#           '56': '以上都是',
#           '57': '马来西亚',
#           '58': '5~6年',
#           '59': '槟榔之乡',
#           '60': '以上都是',
#           '61': '正确',
#           '62': '正确',
#           '63': '正确',
#           '64': '槟榔',
#           '65': '槟榔',
#           '66': '槟榔树',
#           '67': '《采槟榔》',
#           '68': '槟榔树',
#           '69': '3000年',
#           '70': '公元前10,000年',
#           '71': '槟榔树',
#           '72': '8~10月',
#           '73': '',# 口味王首创_____口味槟榔？ ##4
#           '74': '错误',#槟榔品牌中，“口味王”槟榔是全国【高端销量领先】吗？ '正确', '错误'
#           '75': '以上都是',# 口味王”槟榔曾【冠名】哪一年的《湖南卫视春节联欢晚会》 '2017年', '2018年', '2019年', '以上都是'
#           '76': '这!就是街舞4',# “口味王”槟榔曾赞助过哪个综艺节目？
#           '77': '以上都是',# 口味王”槟榔曾赞助过哪个电视剧？ '《将夜2》', '《鬼吹灯之龙岭迷窟》', '《巡回检查组》', '以上都是'
#           '78': '《这！就是灌篮3》',# “口味王”槟榔曾【冠名】过哪个综艺节目 '《这！就是灌篮3》', '《这！就是街舞4》', '《欢乐喜剧人5》', '以上都是'
#           '79': '',
#           '80': '',
#           '81': '2002年', #中国男足曾在哪一年进入世界杯决赛圈？ '1998年', '2002年', '2006年', '2010年'
#           '82': '',
#           '83': '西班牙',#2002年韩日世界杯，东道主韩国队淘汰了哪支欧洲劲旅历史性地打入四强？ '英格兰', '意大利', '西班牙', '葡萄牙'
#           '84': '',#
#           '85': '俄罗斯',# 2018年世界杯在哪个国家举办？ '俄罗斯', '巴西', '南非', '德国'
#           '86': '',
#           '87': '南非',#2010年世界杯在哪个国家举办？
#           '88': '巴西队',#夺得世界杯次数最多的欧洲球队是哪个队？
#           '89': '蓝色',#意大利队的传统球衣是什么颜色? '白色', '绿色', '红色', '蓝色'
#           '90': '',
#           '91': '荷兰',#无冕之王”是形容哪支球队的？ '西班牙', '葡萄牙', '英格兰', '荷兰'
#           '92': '',
#           '93': '乌拉圭',# 第一届世界杯冠军是谁? '意大利', '智利', '巴西', '乌拉圭'
#           '94': '',
#           '95': '蹴鞠',#我国古代足球称为什么？
#           '96': '',
#           '97': '朝鲜',#第一支打入世界杯八强的亚洲球队是哪一队？ '韩国', '日本', '朝鲜', '马来西亚'
#           '98': '',
#           '99': '20亿',#口味王“狂欢世界杯”活动累计派发多少积分？ '10亿', '5亿', '15亿', '20亿'
#           '100': '',
#           '101': '20',#口味王“狂欢世界杯”活动累计派发多少台华为Mate 50 Pro手机？ '5', '10', '15', '20'
#           '102': '',#口味王“狂欢世界杯”活动从什么时间开始派发华为Mate 50 Pro手机？
#           '103': '以上都是',#口味王“狂欢世界杯”有哪些活动？'冠军竞猜', '赛事竞猜', '点球大战', '以上都是'
#           '104': '',
#           '105': '以上都是',#世界杯期间，口味王在以下哪些城市举办线下活动？ 长沙、济南、海口', '武汉、青岛、南宁', '杭州、成都、佛山', '以上都是'
#           '106': '',
#           '107': '',
#           '108': '',
#           '109': '',
#           '110': '',
#           '111': '',
#           '112': '',
#           '113': '',
#           '114': '',
#           '115': '',
#           '116': '',
#           '117': '',
#           '118': '',
#           '119': '',
#           '120': '',
#           '121': '',
#           '122': '',
#           '123': '',
#           '124': '',
#           '125': '',
#           '126': '',
#           '127': '',
#           '128': '',
#           '129': '',
#           '130': '',
#           '131': '',
#           '132': '',
#           '133': '',
#           '134': '',
#           '135': '',
#           '136': '',
#           '137': '',
#           '138': '',
#           '139': '',
#           '140': '',
#           '141': '',
#           '142': '',
#           '143': '',
#           '144': '',
#           '145': '',
#           '146': '',
#           '147': '',
#           '148': '',
#           '149': '',
#           }

'''
====================== 请求 ===========================
'''


def getApiBody(url, json):
    headers = {
        'Content-Type': 'application/json',
    }
    return requests.post(url=url, headers=headers, json=json, timeout=300).json()


def getApi(url, headers):
    return requests.get(url=url, headers=headers, timeout=300).json()


def getApiR(url, headers):
    return requests.get(url=url, headers=headers, allow_redirects=False, timeout=300)


def getkey(kww):
    headers = {
        'Host': '89420.activity-20.m.duiba.com.cn',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': f'{kww}',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d33) NetType/WIFI Language/zh_CN miniProgram/wxfb0905b0787971ad',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate'
    }


    response = requests.get('https://89420.activity-20.m.duiba.com.cn/aaw/underseaGame/index?opId=202214587511596&dbnewopen&from=login&spm=89420.1.1.1', headers=headers)
    if response.status_code == 200:
        key1 = re.search(r'key\: \'(\S+)\'', response.text,re.M|re.I)
        key = key1.group(1)
        # print(key)
        return key
    else:
        print(response.text)

def haidaostart(kww):
    url = "https://89420.activity-20.m.duiba.com.cn/aaw/underseaGame/start?__ts__=1668168666619"
    payload="opId=202214587511596"
    headers = {
        'Host': '89420.activity-20.m.duiba.com.cn',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': f'{kww}',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d33) NetType/WIFI Language/zh_CN miniProgram/wxfb0905b0787971ad',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate'
    }
    result = requests.request("POST", url, headers=headers, data=payload).json()
    if result['success'] == True:
        hdoder= result['data']['orderNum']
        hdstartid = result['data']['startId']
        return hdoder,hdstartid
    else:
        print(result['desc'])
        return None,None
def haidaogetOrderStatus(kww,hdstartid,hdoder):
    url = f"https://89420.activity-20.m.duiba.com.cn/aaw/underseaGame/getOrderStatus?__ts__=1668168667092&opId=202214587511596&startId={hdstartid}&orderNum={hdoder}&type=1"

    headers = {
        'Host': '89420.activity-20.m.duiba.com.cn',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': f'{kww}',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d33) NetType/WIFI Language/zh_CN miniProgram/wxfb0905b0787971ad',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate'
    }
    result = requests.request("GET", url, headers=headers).json()
    if result['success'] == True:

        print(result['success'])
    else:
        print(result)
        return None
def haidaostartRound(kww,hdstartid,rdinx):
    url = "https://89420.activity-20.m.duiba.com.cn/aaw/underseaGame/startRound?__ts__=1668168667195"
    payload=f"opId=202214587511596&startId={hdstartid}&roundIndex={rdinx}"
    headers = {
        'Host': '89420.activity-20.m.duiba.com.cn',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': f'{kww}',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d33) NetType/WIFI Language/zh_CN miniProgram/wxfb0905b0787971ad',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate'
    }
    result = requests.request("POST", url, headers=headers,data=payload).json()
    if result['success'] == True:

        print(result['success'])
    else:
        print(result)
        return None
def get_str_md5(content):
    m = hashlib.md5(content.encode('utf-8')).hexdigest()
    return m
def haidaosubmit(kww,score,hdstartid,totalScore,rdinx,key):
    signdata = f"opId=202214587511596&roundIndex={rdinx}&score={score}&startId={hdstartid}&totalScore={totalScore}&key={key}"
    sign = get_str_md5(signdata)
    url = "https://89420.activity-20.m.duiba.com.cn/aaw/underseaGame/submit?__ts__=1668168852399"
    payload=f"opId=202214587511596&startId={hdstartid}&score={score}&totalScore={totalScore}&roundIndex={rdinx}&sign={sign}"
    headers = {
        'Host': '89420.activity-20.m.duiba.com.cn',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': f'{kww}',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d33) NetType/WIFI Language/zh_CN miniProgram/wxfb0905b0787971ad',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate'
    }
    result = requests.request("POST", url, headers=headers,data=payload).json()
    if result['success'] == True:
        print("提交OK")
    else:
        print(result)
        return None
def haidaoddrw(kww,hdstartid,rdinx):
    url = "https://89420.activity-20.m.duiba.com.cn/aaw/underseaGame/draw?__ts__=1668168861872"
    payload=f"opId=202214587511596&startId={hdstartid}&roundIndex={rdinx}"
    headers = {
        'Host': '89420.activity-20.m.duiba.com.cn',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': f'{kww}',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d33) NetType/WIFI Language/zh_CN miniProgram/wxfb0905b0787971ad',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate'
    }
    result = requests.request("POST", url, headers=headers,data=payload).json()
    if result['success'] == True:
        print(result['data']['desc'])
    else:
        print(result)
        return None

def getChangeCKUrl(uid):
    url = f"https://member.kwwblcj.com/member/api/info/?userKeys=v1.0&pageName=loginFreePlugin&formName=searchForm&uid={uid}&levelCode=1&redirect=https%3A%2F%2F89420.activity-20.m.duiba.com.cn%2Fprojectx%2Fp725daef0%2Findex.html%3FappID%3D89420"
    payload={}
    headers = {
        'Host': 'member.kwwblcj.com',
        'Connection': 'keep-alive',
        'content-type': 'application/json',
        'Accept-Encoding': 'gzip,deflate',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d34) NetType/WIFI Language/zh_CN',
        'Referer': 'https://servicewechat.com/wxfb0905b0787971ad/29/page-frame.html',
    }
    response = requests.request("GET", url, headers=headers, data=payload).json()
    return response['result']

def getCookie(url):
    session = requests.Session()
    session.get(url)
    ckDict = session.cookies.get_dict()
    cookie_value = ''
    for a,b in ckDict.items():
        cookie_value += a + '=' + b + ';'
    return cookie_value

if __name__ == '__main__':
    for i in range(len(mycookies)):
        print("用户【" + mycookies[i] + "】")
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        print("【答题任务】")
        url = 'https://member.kwwblcj.com/member/api/info/?userKeys=v1.0&pageName=loginFreePlugin&formName=searchForm&uid=' + \
              mycookies[
                  i] + '&levelCode=K1&redirect=https%3A%2F%2F89420.activity-20.m.duiba.com.cn%2Fprojectx%2Fp129446ea%2Findex.html%3FappID%3D89420'
        res = getApi(url, headers)
        cookie = getApiR(res['result'], headers).headers.get('Set-Cookie')
        cookieList = cookie.split(";")
        cookie_wdata4 = ''
        cookie_w_ts = ''
        cookie__ac = ''
        for ii in range(len(cookieList)):
            if cookieList[ii].find('wdata4') != -1:
                cookie_wdata4 = cookieList[ii]
            if cookieList[ii].find('w_ts') != -1:
                cookie_w_ts = cookieList[ii]
            if cookieList[ii].find('_ac') != -1:
                cookie__ac = cookieList[ii]

        Cookie = cookie_wdata4 + ";" + cookie_w_ts + ";" + cookie__ac
        Cookie = Cookie.replace("HttpOnly,", "")
        headers = {
            'Cookie': Cookie,
        }
        res = getApi(
            'https://89420.activity-20.m.duiba.com.cn/projectx/p129446ea/answer/start.do?user_type=0&is_from_share=1&_t=' + str(
                time.time()), headers)
        startId = str(res['data'])
        if startId == 'None':
            print("今日已答题")
        else:
            i = 1
            while i < 6:
                i += 1
                url = 'https://89420.activity-20.m.duiba.com.cn/projectx/p129446ea/answer/getQuestion.do?startId=' + startId + '&user_type=0&is_from_share=1&_t=' + str(
                    time.time())
                res = getApi(url, headers)
                print("题目ID：" + res['data']['id'] + " > " + res['data']['content'])
                answerList = res['data']['answerList']
                print(str(answerList))
                dt = False
                try:
                    print('提交答案 > 提交值 :' + str(ktList.get(res['data']['id']) + 1))
                    url = 'https://89420.activity-20.m.duiba.com.cn/projectx/p129446ea/answer/submit.do?answer=' + str(
                        ktList.get(res['data']['id'])) + '&startId=' + startId + '&user_type=0&is_from_share=1&_t=' + str(time.time())
                    res = getApi(url, headers)
                    if res['data']['correct']:
                        print("回答正确" if res['data']['correct'] else "回答错误")
                    elif res['message'] == '重复提交':
                        print("已全部答完")
                except Exception as e:
                    print(e, "\n答题异常错误")
                    continue
        # 领取奖励
        url = 'https://89420.activity-20.m.duiba.com.cn/projectx/p129446ea/answer/complete.do?startId=' + startId + '&user_type=0&is_from_share=1&_t=' + str(
            time.time())
        res = getApi(url, headers)
        print("领取答题奖励")
        url = 'https://member.kwwblcj.com/member/api/list/?userKeys=v1.0&pageName=select-member-score&formName=searchForm&memberId=' + \
              mycookies[i]
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        res = getApi(url, headers)
    print("\n")
    for i in range(len(mycookies)):
        print("用户【" + mycookies[i] + "】")
        url = 'https://member.kwwblcj.com/member/api/list/?userKeys=v1.0&pageName=select-member-score&formName=searchForm&memberId=' + \
              mycookies[i]
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        res = getApi(url, headers)
        print("积分剩余 : " + str(res['rows'][0]))
        addJf = int(res['rows'][0])
        print("【每日签到】")
        res = getApi(
            'https://member.kwwblcj.com/member/api/list/?userKeys=v1.0&pageName=selectSignInfo&formName=searchForm&memberId=' +
            mycookies[i], headers)
        propList = res['rows']['data']
        for prop in range(len(propList)):
            if propList[prop]['flag'] == "1":
                print(propList[prop]['formulaDesc'] + " " + (
                    "未签到" if propList[prop]['flag'] == "0" else "已签到") + "签到奖励 " + propList[prop]['paramNo'])
            if propList[prop]['flag'] == "0":
                json = {
                    "pageName": "AddSignSvmInfo",
                    "formName": "addForm",
                    'orderNo': propList[prop]['orderNo'],
                    'paramNo': propList[prop]['paramNo'],
                    'cateId': propList[prop]['cateId'],
                    'memberId': mycookies[i],
                    'memberName': "JDWXX",
                }
                jf = getApiBody('https://member.kwwblcj.com/member/api/submit/?userKeys=v1.0', json)
                print(jf['msg'])
                break
        print("【任务】")
        res = getApi(
            'https://member.kwwblcj.com/member/api/list/?userKeys=v1.0&pageName=select-task-list&formName=searchForm&memberId=' +
            mycookies[i], headers)
        propList = res['rows']
        for prop in range(len(propList)):
            print(propList[prop]['taskTitle'] + "  " + "奖励积分:" + propList[prop]['rewardScore'] + " ->  " + (
                "待完成" if propList[prop]['complete'] == '0' else "已完成"))
            if propList[prop]['taskTitle'] == "开启签到提醒" and propList[prop]['complete'] == "0":
                print("【开启签到提醒】")
                jf = getApi(
                    'https://member.kwwblcj.com/member/api/list/?userKeys=v1.0&pageName=setOpenSignTaskFlag&formName=addForm&memberId=' +
                    mycookies[i] + '&userCname=JDWXX&openId=o_V6_5Yo3mET81MVAQw4yYebL3zE', headers)
                print('完成' if jf['rows'][0] == 'T' else '失败，去手动完成任务')
                jf = getApi(
                    'https://member.kwwblcj.com/member/api/list/?userKeys=v1.0&pageName=setOpenSignTaskFlag&formName=addForm&memberId=' +
                    mycookies[i] + '&userCname=JDWXX&openId=0', headers)
                print('完成' if jf['rows'][0] == 'T' else '失败，去手动完成任务')
            if propList[prop]['taskTitle'] == "订阅活动通知" and propList[prop]['complete'] == "0":
                print("【订阅活动通知】")
                jf = getApi(
                    'https://member.kwwblcj.com/member/api/list/?userKeys=v1.0&pageName=setOpenSubscribeTaskFlag&formName=addForm&memberId=' +
                    mycookies[i] + '&userCname=JDWXX&openId=o_V6_5Yo3mET81MVAQw4yYebL3zE', headers)
                print('完成' if jf['rows'][0] == 'T' else '失败，去手动完成任务')
                jf = getApi(
                    'https://member.kwwblcj.com/member/api/list/?userKeys=v1.0&pageName=setOpenSubscribeTaskFlag&formName=addForm&memberId=' +
                    mycookies[i] + '&userCname=JDWXX&openId=0', headers)
                print('完成' if jf['rows'][0] == 'T' else '失败，去手动完成任务')
        print("【每日阅读】")
        jf = getApi(
            'https://member.kwwblcj.com/member/api/list/?userKeys=v1.0&pageName=setNewsReadTaskFlag&formName=addForm&memberId=' +
            mycookies[i] + '&userCname=JDWXX&articleTitle=undefined', headers)
        print("阅读日期：" + jf['rows'][0])
        print("【收青果】")
        jf = getApi(
            'https://member.kwwblcj.com/member/api/list/?userKeys=v1.0&pageName=activeTaskFlag&formName=editForm&memberId=' +
            mycookies[i] + '&userCname=JDWXX', headers)
        print("收青果日期：" + jf['rows'][0])
        time.sleep(1)
        print("【海岛游乐场】")
        url = getChangeCKUrl(mycookies[i])
        ck = getCookie(url)
        for x in range(0,3):
            key = getkey(ck)
            hdoder,hdstartid = haidaostart(ck)
            if hdstartid != None and hdoder != None:
                haidaogetOrderStatus(ck,hdstartid,hdoder)
                haidaostartRound(ck,hdstartid,"1")
                time.sleep(60)
                haidaosubmit(ck,"5",hdstartid,"5","1",key)
                haidaoddrw(ck,hdstartid,"1")
                haidaostartRound(ck,hdstartid,"2")
                time.sleep(60)
                haidaosubmit(ck,"10",hdstartid,"15","2",key)
                haidaoddrw(ck,hdstartid,"2")
                haidaostartRound(ck,hdstartid,"3")
                time.sleep(60)
                haidaosubmit(ck,"15",hdstartid,"30","3",key)
                haidaoddrw(ck,hdstartid,"3")
