'''
FilePath: \脚本\老有工社\老友工社.py
Date: 2026-01-23 22:11:01
LastEditTime: 2026-01-26 16:07:25
LastEditors: liyan
Copyright (c) 2026 by liyan, All Rights Reserved. 
'''
import datetime
import json
import logging
import random
import time
import requests
from concurrent.futures import ThreadPoolExecutor
userinfo = [
    "18834181486&13903414922gxr&4e893a49e6e6db2f",
]
MAX_CONCURRENT_TASKS = 1
logging.basicConfig(level=logging.INFO,
   format='%(asctime)s %(message)s',
   datefmt='%H:%M:%S'                 
)  # 设置日志级别
lygs_headers = {
		'User-Agent': "okhttp/4.10.0",
		'Connection': "Keep-Alive",
		'Accept': "application/json",
		'Accept-Encoding': "gzip",
		'os': "android",
		# 'deviceId': "4e893a49e6e6db2f",
		'Version-Code': "4",
		'Client-Version': "1.0.3",
		# 'datetime': "2026-01-26 08:46:33.861"
}

def void_follow(phone,headers,tsk):
    try:
        #获取视频列表
        url = "https://www.laoyou.video/api/v2/video/recommends"
        headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        params = {'page': "5",'type': "0"}
        resp = requests.get(url, params=params, headers=headers).json()
        for video in resp:
            if tsk['finish_num'] >= tsk['completed_num']:
                logging.info(f"💵 {phone}>>任务({tsk['name']}) 已完成")
                return
            url = "https://www.laoyou.video/api/v2/follow"
            headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            params = {'id': f'{video.get("user_id")}'}
            resp = requests.post(url,params=params, headers=headers).json()
            tsk['finish_num'] = tsk['finish_num'] + 1
            logging.info(f"💵 {phone}>>任务({tsk['name']}) 视频({video.get("id")})")
        void_follow(phone,headers,tsk)#递归函数
    except Exception:
        logging.info(f"⛔️ 收藏视频异常")   
def voide_time(phone,headers,tsk):
    try:
        if tsk['finish_num'] >= tsk['completed_num']:
            logging.info(f"💵 {phone}>>任务({tsk['name']}) 已完成")
            return
        #获取视频列表
        url = "https://www.laoyou.video/api/v2/video/watchtime"
        headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        payload = {'time': "300"}
        response = requests.post(url, data=payload, headers=headers)
        logging.info(f"💵 {phone}>>任务({tsk['name']}) 时长(300)")
        time.sleep(2)
        payload = {'time': "600"}
        response = requests.post(url, data=payload, headers=headers)
        logging.info(f"💵 {phone}>>任务({tsk['name']}) 时长(600)")
        time.sleep(2)
        payload = {'time': "1200"}
        response = requests.post(url, data=payload, headers=headers)
        logging.info(f"💵 {phone}>>任务({tsk['name']}) 时长(1200)")
        time.sleep(2)
    except Exception:
        logging.info(f"⛔️ 收藏视频异常")   
def voide_share(phone,headers,tsk):
    try:
        #获取视频列表
        url = "https://www.laoyou.video/api/v2/video/recommends"
        headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        params = {'page': "1",'type': "0"}
        resp = requests.get(url, params=params, headers=headers).json()
        for video in resp:
            if tsk['finish_num'] >= tsk['completed_num']:
                logging.info(f"💵 {phone}>>任务({tsk['name']}) 已完成")
                return
            url = "https://www.laoyou.video/api/v2/video/share"
            headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            params = {'video_id': video.get("id")}
            resp = requests.get(url,params=params, headers=headers).json()
            tsk['finish_num'] = tsk['finish_num'] + 1
            logging.info(f"💵 {phone}>>任务({tsk['name']}) 视频({video.get("id")})")
        voide_share(phone,headers,tsk)#递归函数
    except Exception:
        logging.info(f"⛔️ 收藏视频异常")   

def voide_collect(phone,headers,tsk):
    try:
        #获取视频列表
        url = "https://www.laoyou.video/api/v2/video/recommends"
        headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        params = {'page': "1",'type': "0"}
        resp = requests.get(url, params=params, headers=headers).json()
        for video in resp:
            if tsk['finish_num'] >= tsk['completed_num']:
                logging.info(f"💵 {phone}>>任务({tsk['name']}) 已完成")
                return
            url = "https://www.laoyou.video/api/v2/video/collect"
            headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            params = {'video_id': video.get("id")}
            resp = requests.get(url,params=params, headers=headers).json()
            tsk['finish_num'] = tsk['finish_num'] + 1
            logging.info(f"💵 {phone}>>任务({tsk['name']}) 视频({video.get("id")})")
        voide_collect(phone,headers,tsk)#递归函数
    except Exception:
        logging.info(f"⛔️ 收藏视频异常")   


def voide_comment(phone,headers,tsk):
    try:
        url = "https://www.laoyou.video/api/v2/user"
        headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        resp = requests.get(url, headers=headers).json()
        id = resp.get('id')
        name = resp.get('name')
        avatar = resp.get('avatar')
        #获取视频列表
        url = "https://www.laoyou.video/api/v2/video/recommends"
        headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        params = {'page': "6",'type': "0"}
        resp = requests.get(url, params=params, headers=headers).json()
        for video in resp:
            if tsk['finish_num'] >= tsk['completed_num']:
                logging.info(f"💵 {phone}>>任务({tsk['name']}) 已完成")
                return
            url = "https://www.laoyou.video/api/v2/video/store-comment"
            headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            payload = {
                'body': "666",
                'pid': "0",
                'video_id': video.get("id"),
                'at_user': "",
                'target_user': video.get("user_id"),
                'cid': "0",
                'reply_user': json.dumps({"user_avatar": avatar,"user_id": id,"user_name": name}, ensure_ascii=False),
                'type': "1",
                'voice': "",
                'time': ""
            }
            resp = requests.post(url, data=payload, headers=headers).json()
            tsk['finish_num'] = tsk['finish_num'] + 1
            logging.info(f"💵 {phone}>>任务({tsk['name']}) 视频({video.get("id")})")
        voide_comment(phone,headers,tsk)#递归函数
    except Exception:
        logging.info(f"⛔️ 评论视频异常")   

def voide_like(phone,headers,tsk):
    try:
        #获取视频列表
        url = "https://www.laoyou.video/api/v2/video/recommends"
        headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        params = {'page': "6",'type': "0"}
        resp = requests.get(url, params=params, headers=headers).json()
        for video in resp:
            if tsk['finish_num'] >= tsk['completed_num']:
                logging.info(f"💵 {phone}>>任务({tsk['name']}) 已完成")
                return
            url = f"https://www.laoyou.video/api/v2/video/like/{video.get("id")}"
            headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            resp = requests.get(url, headers=headers).json()
            tsk['finish_num'] = tsk['finish_num'] + 1
            logging.info(f"💵 {phone}>>任务({tsk['name']}) 视频({video.get("id")})")
        voide_like(phone,headers,tsk)#递归函数
    except Exception:
        logging.info(f"⛔️ 点赞视频异常")    
def watck_ads(phone,headers,tsk,uid):
    pass
    # url = "https://www.laoyou.video/api/v2/mission/basicAds"
    # headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    # time.sleep(random.randint(10, 20))
    # payload = {"trans_id":show_id, "type":25}
    # resp = requests.post(url, data=payload, headers=headers).json()
def watck_videos(phone,headers,tsk):
    try:
        #获取视频列表
        url = "https://www.laoyou.video/api/v2/video/recommends"
        headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        params = {'page': "6",'type': "0"}
        resp = requests.get(url, params=params, headers=headers).json()
        for video in resp:
            if tsk['finish_num'] >= tsk['completed_num']:
                logging.info(f"💵 {phone}>>任务({tsk['name']}) 已完成")
                return
            logging.info(f"💵 {phone}>>任务({tsk['name']}) {video.get("name")}({video.get("id")})")
            url = "https://www.laoyou.video/api/v2/video/watchvideo"
            headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]  
            # params = {'video_id': f"{video.get("id")}"}  
            resp = requests.post(url, headers=headers).json()
            tsk['finish_num'] = tsk['finish_num'] + 1
            logging.info(f"💵 {phone}>>提交观看 {tsk['finish_num']}")
            wait_time = random.randint(15, 30)
            time.sleep(wait_time)
        watck_videos(phone,headers,tsk)
    except Exception:
        logging.info(f"⛔️ 当前任务刷视频异常错误")    
def work_task(userinfo):
        try:
            # watck_ads()
            # return
            config = userinfo.split("&")
            phone = config[0]
            password = config[1]
            deviceId = config[2]
            #1.获取登陆token
            url = "https://www.laoyou.video/api/v2/auth/login"
            payload = {'login': phone,'type': "2",'verifiable_code': "",'password': password}
            headers = lygs_headers.copy()
            headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            headers['deviceId'] = deviceId
            resp = requests.post(url, data=payload, headers=headers).json()
            user_id = resp['user_id']
            headers['Authorization'] = f'Bearer {resp['token']}'
            #2.开始签到任务
            url = "https://www.laoyou.video/api/v2/sign/add"
            headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            resp = requests.post(url, data=payload, headers=headers).json()
            result = resp.get("day")
            if result is None:
               logging.info(f"💵 {phone}>>{resp.get("message")}")
            else:
                logging.info(f"💵 {phone}>>{resp.get("day")}")
            task_list = []
            #2.获取任务列表
            url = "https://www.laoyou.video/api/v2/mission/new-num-point"
            headers['datetime'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            resp = requests.get(url, headers=headers).json()
            task_list = []
            for tsk in resp['basic']:
                logging.info(f"💵 {phone}>>基础任务 {tsk['name']}({tsk['id']})[{tsk['finish_num']}/{tsk['completed_num']}]")
                task_list.append({
                    "name": tsk.get("name"),
                    "finish_num": tsk.get("finish_num"),
                    "completed_num": tsk.get("completed_num")
                })
            for tsk in resp['interact']:
                task_list.append({
                    "name": tsk.get("name"),
                    "finish_num": tsk.get("finish_num"),
                    "completed_num": tsk.get("completed_num")
                })
                logging.info(f"💵 {phone}>>互动任务 {tsk['name']}({tsk['id']})[{tsk['finish_num']}/{tsk['completed_num']}]")

            for tsk in resp['advanced']:
                task_list.append({
                    "name": tsk.get("name"),
                    "finish_num": tsk.get("is_finish"),
                    "completed_num": tsk.get("completed_num")
                })
                logging.info(f"💵 {phone}>>进阶任务 {tsk['name']}({tsk['id']})[{tsk['is_finish']}/{tsk['completed_num']}]")
            
            for tsk in resp['social']:
                task_list.append({
                    "name": tsk.get("name"),
                    "finish_num": tsk.get("finish_num"),
                    "completed_num": tsk.get("completed_num")
                })
                logging.info(f"💵 {phone}>>社交任务 {tsk['name']}({tsk['id']})[{tsk['finish_num']}/{tsk['completed_num']}]")
            
            #3.1刷视频任务
            watck_videos(phone,headers,task_list[0])
            #3.2观看广告
            watck_ads(phone,headers,task_list[1],user_id)
            #3.3视频点赞任务
            voide_like(phone,headers,task_list[2])
            #3.4评论视频
            voide_comment(phone,headers,task_list[3])
            #3.5收藏视频
            voide_collect(phone,headers,task_list[4])
            #3.6转发视频
            voide_share(phone,headers,task_list[5])
            # 3.7观看时长视频
            voide_time(phone,headers,task_list[9])
            #3.8关注他人
            void_follow(phone,headers,task_list[12])
        except Exception:
            logging.info(f"⛔️ 获取参数错误")
            return
if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=MAX_CONCURRENT_TASKS) as executor:
        list(executor.map(work_task, userinfo))
        