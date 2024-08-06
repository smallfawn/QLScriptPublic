#!/usr/bin/python3
# -- coding: utf-8 --
# -------------------------------
# cron "15 0,30 9 * * *" script-path=xxx.py,tag=匹配cron用
# const $ = new Env('imaotai')

import datetime
import os
import r和om
import time,re

import requests
import base64
import json
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

from notify import send

# 青龙面板加入环境变量 export MTTokenD
# MTTokenD是茅台预约参数，多个请换行，格式'省份,城市,经度,维度,设备id,token,MT-Token-Wap(抓包小茅运)'
# MT-Token-Wap参数是小茅运的领奖励，不需要的话MTTokenD格式改成 省份,城市,经度,维度,设备id,token,''
# 依赖pycryptodome
p_c_map = {}
mt_r = 'clips_OlU6TmFRag5rCXwbNAQ/Tz1SKlN8THcecBp/'
# 下面定义的是申请哪几个，可通过iMT_Products环境变量来设置，比如{"10941": "贵州茅台酒（甲辰龙年）", "2478": "贵州茅台酒（珍品）", "10942": "贵州茅台酒（甲辰龙年）x2"}
#res_map = json.loads(os.getenv('iMT_Products', ''))
#if not res_map:
#    res_map = {"10941": "贵州茅台酒（甲辰龙年）", "10942": "贵州茅台酒（甲辰龙年）x2"}
res_map = {"10941": "贵州茅台酒（甲辰龙年）", "10942": "贵州茅台酒（甲辰龙年）x2"}
print('拟预约商品：')
print(res_map)
#加密
def aes_cbc_encrypt(data, key, iv):
    cipher = AES.new(key.encode('utf-8'), AES.MODE_CBC, iv.encode('utf-8'))
    padded_data = pad(data.encode('utf-8'), AES.block_size)
    encrypted_data = cipher.encrypt(padded_data)
    return base64.b64encode(encrypted_data).decode('utf-8')

def mt_add(itemId, shopId, sessionId, userId, token, Device_ID):
    MT_K = f'{int(time.time() * 1000)}'
    headers = {'User-Agent': 'iPhone 14',
               'MT-Token': token,
               'MT-Network-Type': 'WIFI', 'MT-User-Tag': '0',
               'MT-R': mt_r, 'MT-K': MT_K,
               'MT-Info': '028e7f96f6369cafe1d105579c5b9377', 'MT-APP-Version': mt_version,
               'MT-Request-ID': f'{int(time.time() * 1000)}', 'Accept-Language': 'zh-Hans-CN;q=1',
               'MT-Device-ID': Device_ID,
               'MT-Bundle-ID': 'com.moutai.mall',
               'mt-lng': lng,
               'mt-lat': lat}
    d = {"itemInfoList": [{"count": 1, "itemId": str(itemId)}], "sessionId": sessionId, "userId": str(userId),
         "shopId": str(shopId)}
    r = aes_cbc_encrypt(json.dumps(d),'qbhajinldepmucsonaaaccgypwuvcjaa','2018534749963515')
    d['actParam'] = r
    json_data = d
    response = requests.post('https://app.moutai519.com.cn/xhr/front/mall/reservation/add', headers=headers,
                             json=json_data)
    code = response.json().get('code', 0)
    if code == 2000:
        return response.json().get('data', {}).get('successDesc', "未知")
    return '申购失败:' + response.json().get('message', "未知原因")


def tongzhi(ss):
    user_list = os.getenv('mtec_user', '').split(',')
    for user in user_list:
        url = 'http://wxpusher.zjiecode.com/api/send/message/?appToken=&content={}&uid={}'.format(
            ss, user)
        r = requests.get(url)
        print(r.text)


def get_session_id(device_id, token):
    headers = {
        'mt-device-id': device_id,
        'mt-user-tag': '0',
        'accept': '*/*',
        'mt-network-type': 'WIFI',
        'mt-token': token,
        'mt-bundle-id': 'com.moutai.mall',
        'accept-language': 'zh-Hans-CN;q=1',
        'mt-request-id': f'{int(time.time() * 1000)}',
        'mt-app-version': mt_version,
        'user-agent': 'iPhone 14',
        'mt-r': mt_r,
        'mt-lng': lng,
        'mt-lat': lat
    }

    response = requests.get('https://static.moutai519.com.cn/mt-backend/xhr/front/mall/index/session/get/' + time_keys,
                            headers=headers)
    sessionId = response.json().get('data', {}).get('sessionId')
    itemList = response.json().get('data', {}).get('itemList', [])
    itemCodes = [item.get('itemCode') for item in itemList]
    return sessionId, itemCodes

# 打印所有商品列表
def get_shop_items(sessionId, device_id, token, province, city):
    headers = {
        'mt-device-id': device_id,
        'mt-user-tag': '0',
        'mt-lat': '',
        'accept': '*/*',
        'mt-network-type': 'WIFI',
        'mt-token': token,
        'mt-bundle-id': 'com.moutai.mall',
        'accept-language': 'zh-Hans-CN;q=1',
        'mt-request-id': f'{int(time.time() * 1000)}',
        'mt-r': mt_r,
        'mt-app-version': mt_version,
        'user-agent': 'iPhone 14',
        'mt-lng': lng,
        'mt-lat': lat
    }

    response = requests.get(
        'https://static.moutai519.com.cn/mt-backend/xhr/front/mall/index/session/get/' +  time_keys, headers=headers)
    item_list = response.json().get('data', {}).get("itemList", [])
    # 创建一个空字典，用于存储 itemCode 和 title 的映射关系
    item_code_title_map = {}
    # 遍历 itemList，提取 itemCode 和 title，并将它们添加到字典中
    for item in item_list:
        item_code_title_map[item.get("itemCode")] = item.get("title")
    print('可预约商品列表：')
    print(item_code_title_map)
    return item_code_title_map

def get_shop_item(sessionId, itemId, device_id, token, province, city):
    headers = {
        'mt-device-id': device_id,
        'mt-user-tag': '0',
        'mt-lat': '',
        'accept': '*/*',
        'mt-network-type': 'WIFI',
        'mt-token': token,
        'mt-bundle-id': 'com.moutai.mall',
        'accept-language': 'zh-Hans-CN;q=1',
        'mt-request-id': f'{int(time.time() * 1000)}',
        'mt-r': mt_r,
        'mt-app-version': mt_version,
        'user-agent': 'iPhone 14',
        'mt-lng': lng,
        'mt-lat': lat
    }

    response = requests.get(
        'https://static.moutai519.com.cn/mt-backend/xhr/front/mall/shop/list/slim/v3/' + str(
            sessionId) + '/' + province + '/' + str(itemId) + '/' + time_keys,
        headers=headers)
    data = response.json().get('data', {})
    shops = data.get('shops', [])
    shop_id_ = p_c_map[province][city]
    for shop in shops:
        if not shop.get('shopId') in shop_id_:
            continue
        if itemId in str(shop):
            return shop.get('shopId')


def get_user_id(token, Device_ID):
    headers = {
        'MT-User-Tag': '0',
        'Accept': '*/*',
        'MT-Network-Type': 'WIFI',
        'MT-Token': token,
        'MT-Bundle-ID': 'com.moutai.mall',
        'Accept-Language': 'zh-Hans-CN;q=1, en-CN;q=0.9',
        'MT-Request-ID': f'{int(time.time() * 1000)}',
        'MT-APP-Version': mt_version,
        'User-Agent': 'iOS;16.0.1;Apple;iPhone 14 ProMax',
        'MT-R': mt_r,
        'MT-Device-ID': Device_ID,
        'mt-lng': lng,
        'mt-lat': lat
    }

    response = requests.get(
        'https://app.moutai519.com.cn/xhr/front/user/info', headers=headers)
    userName = response.json().get('data', {}).get('userName')
    userId = response.json().get('data', {}).get('userId')
    mobile = response.json().get('data', {}).get('mobile')
    return userName, userId, mobile


def getUserEnergyAward(device_id, ck):
    """
    领取耐力
    :return:
    """

    cookies = {
        'MT-Device-ID-Wap': device_id,
        'MT-Token-Wap': ck,
        'YX_SUPPORT_WEBP': '1',
    }

    headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_2_1 like Mac OS X)',
        'Referer': 'https://h5.moutai519.com.cn/gux/game/main?appConfig=2_1_2',
        'Client-User-Agent': 'iOS;15.0.1;Apple;iPhone 12 ProMax',
        'MT-R': mt_r,
        'Origin': 'https://h5.moutai519.com.cn',
        'MT-APP-Version': mt_version,
        'MT-Request-ID': f'{int(time.time() * 1000)}',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'MT-Device-ID': device_id,
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'mt-lng': lng,
        'mt-lat': lat
    }
    response = requests.post('https://h5.moutai519.com.cn/game/isolationPage/getUserEnergyAward', cookies=cookies,
                             headers=headers, json={})
    return response.json().get('message') if '无法领取奖励' in response.text else "领取奖励成功"


def get_map():
    global p_c_map
    url = 'https://static.moutai519.com.cn/mt-backend/xhr/front/mall/resource/get'
    headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_1 like Mac OS X)',
        'Referer': 'https://h5.moutai519.com.cn/gux/game/main?appConfig=2_1_2',
        'Client-User-Agent': 'iOS;16.0.1;Apple;iPhone 14 ProMax',
        'MT-R': mt_r,
        'Origin': 'https://h5.moutai519.com.cn',
        'MT-APP-Version': mt_version,
        'MT-Request-ID': f'{int(time.time() * 1000)}{random.randint(1111111, 999999999)}{int(time.time() * 1000)}',
        'Accept-Language': 'zh-CN,zh-Hans;q=1',
        'MT-Device-ID': f'{int(time.time() * 1000)}{random.randint(1111111, 999999999)}{int(time.time() * 1000)}',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'mt-lng': lng,
        'mt-lat': lat
    }
    res = requests.get(url, headers=headers, )
    mtshops = res.json().get('data', {}).get('mtshops_pc', {})
    urls = mtshops.get('url')
    r = requests.get(urls)
    for k, v in dict(r.json()).items():
        provinceName = v.get('provinceName')
        cityName = v.get('cityName')
        if not p_c_map.get(provinceName):
            p_c_map[provinceName] = {}
        if not p_c_map[provinceName].get(cityName, None):
            p_c_map[provinceName][cityName] = [k]
        else:
            p_c_map[provinceName][cityName].append(k)
    return p_c_map


def login(phone, vCode, Device_ID):
    """

    :param phone: 手机号
    :param vCode: 验证码
    :param Device_ID: 设备id
    :return:
    """
    MT_K = f'{int(time.time() * 1000)}'
    r = requests.get(
        f'http://82.157.10.108:8086/get_mtv?DeviceID={Device_ID}&MTk={MT_K}&version={mt_version}&key=yaohuo')
    headers = {
        'MT-Device-ID': Device_ID,
        'MT-User-Tag': '0',
        'Accept': '*/*',
        'MT-Network-Type': 'WIFI',
        'MT-Token': '',
        'MT-K': MT_K,
        'MT-Bundle-ID': 'com.moutai.mall',
        'MT-V': r.text,
        'User-Agent': 'iOS;16.0.1;Apple;iPhone 14 ProMax',
        'Accept-Language': 'zh-Hans-CN;q=1',
        'MT-Request-ID': f'{int(time.time() * 1000)}18342',
        'MT-R': mt_r,
        'MT-APP-Version': mt_version,
    }

    json_data = {
        'ydToken': '',
        'mobile': f'{phone}',
        'vCode': f'{vCode}',
        'ydLogId': '',
    }

    response = requests.post('https://app.moutai519.com.cn/xhr/front/user/register/login', headers=headers,
                             json=json_data)
    data = response.json().get('data', {})
    token = data.get('token')
    cookie = data.get('cookie')  # MT-Token-Wap
    print(Device_ID, token, cookie)
    return Device_ID, token, cookie


if __name__ == '__main__':
    plustoken = os.getenv("plustoken")
    # mt_tokens = os.getenv("MTTokenD")
    mt_tokens = '浙江省,温州市,120.123456,27.123456,123456-B851-4574-913D-5C38E19CF14C,eyJ0eXAiO123456CJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJtd123456ImV4cCI6MTcyNDE2OTk3OCwidXNlcklkIjoxMTI3NTA3ODg3LCJkZXZpY2VJZCI6IjAxNEU2REU3LUI4NTEtNDU3NC05MTNELTVDMzhFMTlDRjE0QyIsImlhdCI6MTcyMTU3Nzk3OH0.UH2r-aIv5pw9u4D7e2SxEcmdex5IRyvkoe2-FTkR5bc,eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3M123456IsImV4cCI6MTcyNDE2OTk3OCwidXNlcklkIjoxMTI3NTA3ODg3LCJkZXZ123456I6IjAxNEU2REU3LUI4NTEtNDU3NC05MTNELTVDMzhFMTlDRjE0QyIsImlhdCI6MTcy123456zk3OH0.piTWOifeQx8oNdEeLzHyd2RML4xT1t-F6PYqDawd_hU'
    mt_version = "".join(re.findall('whats-new__latest__version">(.*?)</p>',
                                    requests.get('https://apps.apple.com/cn/app/i%E8%8C%85%E5%8F%B0/id1600482450').text,
                                    re.S)).replace('版本 ', '').replace('çæ¬ ', '')  # line:248
    print('当前最新版本为:' + mt_version)  # line:249
    if not mt_tokens:
        print('MTToken is null')
        exit()
    if not mt_version:
        print('版本号为空 is null')
        exit()
    mt_token_list = mt_tokens.split('&')
    s = "-------------------总共" + \
        str(int(len(mt_token_list))) + \
        "个用户-------------------"+'\n'
    userCount = 0
    if len(mt_token_list) > 0:
        for mt_token in mt_token_list:
            userCount += 1
            try:
                province, city, lng, lat, device_id, token, ck = mt_token.split(',')
                province, city, lng, lat, device_id, token, ck = province.strip(), city.strip(), lng.strip(), lat.strip(), device_id.strip(), token.strip(), ck.strip()
            except Exception as e:
                s = "MTTokenD未正确配置，格式'省份,城市,经度,维度,设备id,token,MT-Token-Wap(抓包小茅运)'"
                send("i茅台申购+小茅运", s)
                exit()
            time_keys = str(
                int(time.mktime(datetime.date.today().timetuple())) * 1000)
            get_map()

            try:
                sessionId, itemCodes = get_session_id(device_id, token)
                userName, user_id, mobile = get_user_id(token, device_id)
                if not user_id:
                    s += "第"+str(userCount)+"个用户token失效，请重新登录"+'\n'
                    continue
                s += "第"+str(userCount)+"个用户----------------"+userName + '_' + \
                    mobile + "开始任务" + "----------------"+'\n'
                items = get_shop_items(sessionId, device_id, token, province, city)
                for itemCode in itemCodes:
                    name = res_map.get(str(itemCode))
                    if name:
                        shop_id = get_shop_item(
                            sessionId, itemCode, device_id, token, province, city)
                        res = mt_add(itemCode, str(shop_id), sessionId,
                                     user_id, token, device_id)
                        s += itemCode + \
                            '_' + name + '---------------' + res + '\n'
                if ck:
                    if ck == "\'\'" :
                        s += userName + '_' + mobile + '---------------' + \
                        "未设置MT-Token-Wap，小茅运领取奖励跳过" + '\n'
                    else :
                        r = getUserEnergyAward(device_id, ck)
                        s += userName + '_' + mobile + '---------------' + \
                        "小茅运:" + r + '\n'
                s += userName + '_' + mobile + "正常结束任务"+'\n              \n'
            except Exception as e:
                s += userName + '_' + mobile + "异常信息"+e
    send("i茅台申购+小茅运", s)
