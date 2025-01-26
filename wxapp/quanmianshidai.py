
"""
项目 全棉时代种棉花
入口 #小程序://全棉时代
变量 code #token#备注     多账号换行  
变量名 qmzmh


"""

import os
import requests
from datetime import datetime, timezone, timedelta
import json
import time
import random


# 配置参数
base_url = "https://hxxxy.gov.cn"
user_agent = "Mozilla/5.0 (Linux; Android 11; ONEPLUS A6000 Build/RKQ1.201217.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160065 MMWEBSDK/20231201 MMWEBID/2930 MicroMessenger/8.0.45.2521(0x28002D3D) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wxdfcaa44b1aa891a7"

def get_beijing_date():  
    beijing_time = datetime.now(timezone(timedelta(hours=8)))
    return beijing_time.date()

def dq_time():
    dqsj = int(time.time())
    dysj = datetime.fromtimestamp(dqsj).strftime('%Y-%m-%d %H:%M:%S')
    print("当前时间戳:", dqsj)
    print("转换后的时间:", dysj)
    return dqsj, dysj

def get_env_variable(var_name):
    value = os.getenv(var_name)
    if value is None:
        print(f'环境变量{var_name}未设置，请检查。')
        return None
    accounts = value.strip().split('\n')
    print(f'-----------本次账号运行数量：{len(accounts)}-----------')
    print(f'------全棉时代种棉花-----1.2------')
    return accounts

def create_headers(code, token):
    headers = {
        'host': 'sg01.purcotton.com',
        'accept': 'application/json, text/plain, */*',
        'app-id': 'wxdfcaa44b1aa891a7',
        'user-agent': user_agent,
        'content-type': 'application/json;charset=UTF-8',
        'origin': 'https://sg01.purcotton.com',
        'x-requested-with': 'com.tencent.mm',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'accept-encoding': 'gzip, deflate',
        'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'cookie': 'sajssdk_2015_cross_new_user=1',
        'code': code,  
        'token': token,  
    }
    return headers


def jscz(code, token):  # 浇水
    # 调用hqid函数并获取树木ID及其他信息
    tree_id, sunshine, total_sunshine = hqid(code, token)
    
    if tree_id is not None:
        #print(f"获得的树木ID: {tree_id}")
        # 可以在这里打印阳光信息，如果需要
        #print(f"当前阳光: {sunshine}, 总阳光: {total_sunshine}")
        
        while True:  # 开始一个无限循环
            url = "https://sg01.purcotton.com/api/watering"
            data = {"tree_user_id": tree_id, "water_cnt": 1}  # 使用动态获取的树木ID
            headers = create_headers(code, token)
            #print(data)
            try:
                response = requests.post(url, headers=headers, json=data)
                response.raise_for_status()
                response_data = response.json()

                if response_data.get("code") == 200:
                    # 提取剩余水滴数
                    remaining_water = response_data["data"]["info"]["sy_water"]
                    print(f"剩余水滴数: {remaining_water}")

                    # 根据剩余水滴数决定是否继续
                    if remaining_water < 30:  # 如果剩余水滴数小于30，则停止
                        print("水滴不足，停止浇水。")
                        break

                    print("执行浇水操作...")
                    # 暂停1到3秒
                    time.sleep(random.randint(1, 3))

                elif response_data.get("code") == 400:
                    print(response_data.get("msg", "未知错误"))
                    break  # 遇到错误时停止循环
                else:
                    print("未知的响应code:", response_data.get("code"))
                    print("完整响应:", response_data)
                    break  # 如果响应码不是200或400，停止循环

            except requests.exceptions.RequestException as e:
                print(f"请求失败: {e}")
                break  # 请求异常时停止循环
    else:
        print("未能获取树木ID，无法执行浇水操作。")


def llhmp(code, token, action, tid):  # 添加了tid参数
    phone, _ = login(code, token)  # 调用login函数，获取电话号码，忽略user_id

    url = "https://nmp.pureh2b.com/api/purcotton/completetask"
    headers = {
        'Host': 'nmp.pureh2b.com',
        'XWeb-Xhr': '1',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9',  
        'code': code,  
        'token': token,  
    }
    data = {
        'action': action,
        'phone': phone, 
        'from': 'guoyuan'
    }
    #print(data)

    try:
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()
        response_data = response.json()  # 解析响应数据为JSON

        action_descriptions = {
            'browse_venue': '逛甄选好棉品',
            'browse_new_user_zone': '浏览新用户专区',
            'browse_community': '社区送福利',
            'subscibe': '订阅奖励提醒'
            
        }
        action_description = action_descriptions.get(action, '执行任务')

        #print(f"执行任务 '{action_description}' 响应内容:", response.text)  # 打印响应内容
        
        if response_data.get("code") == 200:
            print(f"{action_description} 任务成功，暂停一段时间再继续...")
            time.sleep(random.randint(15, 20))
            tjlq_mpjl(code, token, tid)  # 在任务成功后调用领取奖励的函数
        elif response_data.get("code") == 400:
            #print()  # 打印响应内容
            print(f"{action_description} ：{response_data.get('msg')}")
            #tjlq_mpjl(code, token, tid)  # 在任务成功后调用领取奖励的函数
        else:
            print("{action_description} 收到未预期的响应，响应内容如下：")
            print(response_data)

    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")

def tjlq_mpjl(code, token, tid):  # 添加了tid参数来指定任务ID 提交 任务  领取奖励
    url = "https://sg01.purcotton.com/api/task/receive-task-water"
    headers = create_headers(code, token)
    data = {"tid": tid}  # 使用传入的任务ID
    #print(data)
    try:
        response = requests.post(url, headers=headers, json=data)  # 发送POST请求
        response.raise_for_status()  # 检查响应状态码

        # 解析响应数据
        response_data = response.json()
        if response_data.get("code") == 200:
            print("奖励领取成功。")
            # 打印sy_water和get_water
            data = response_data.get("data", {})  
            sy_water = data.get("sy_water", "未知")  #
            get_water = data.get("get_water", "未知")  # 同上
            print(f"剩余水量：{sy_water}, 获取水量：{get_water}")
        else:
            print(f"奖励领取失败，错误信息：{response_data.get('msg')}")
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")

def task_list(code, token):  # 任务列表
    url = "https://sg01.purcotton.com/api/task/list"
    headers = create_headers(code, token)
    today_date = datetime.now().strftime("%Y-%m-%d")  # 获取今天的日期，格式为YYYY-MM-DD

    # 任务ID到任务名称的映射
    task_names = {
        1: "签到,        1",
        2: "不知道1,      0",
        4: "三餐福袋,      3",
        6: "逛甄选好棉品, 4",
        10: "订阅奖励提醒, 1",
        13: "浏览新用户,   2",
        14: "庄园小课堂,   3", 
        15: "棉花工厂,     1",
        16: "社区送福利,   1"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        response_data = response.json()
        today_tasks = []  # 用于存储今天的任务信息
        if response_data.get("code") == 200:
            task_user_info = response_data.get("data", {}).get("task_user_info", [])
            print("------任务进度条-----------")
            for task in task_user_info:
                task_id = task.get('task_id')
                complete_num = task.get('complete_num')
                complete_date = task.get('complete_date')
                # 比较任务完成日期是否为今天
                #print("------任务进度条-----------")
                if complete_date == today_date:
                    task_name = task_names.get(task_id, f"未知任务 {task_id}")  # 获取任务名称，如果未知则显示未知任务和ID
                    
                    print(f"任务ID: {task_id} {task_name}/{complete_num}, 任务时间: {complete_date}")
                    #print(f"{task_name}/{complete_num}   时间: {complete_date}")
                    today_tasks.append(task)
            print("-----------------")        
            print()  
            return today_tasks
            
        else:
            print(f"获取任务列表失败，错误信息：{response_data.get('msg')}")
            return []
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
        return []



def pdrw(code, token):  # 判断任务
    """根据任务完成情况执行任务"""
    try:
        task_user_info = task_list(code, token)

        task_completion_limits = {
            6: 4,# 任务ID为6的任务只能完成4次  逛甄选好棉品
            13: 2,  # 任务ID为13的任务只能完成2次   浏览新用户专区
            15: 1,  # 假设任务ID为15的任务只能完成1次    棉花工厂
            4: 3,  # 4  3次三餐福袋   7-12 14-17 18-22   
            16: 1,  # ID 16  社区送福利
            10: 1,  # ID 10  订阅奖励提醒
            14: 1,       #ID14   #庄园小课堂
            1: 1,       #ID   #签到
        }

        # 先检查所有指定的任务是否已经存在于任务列表中
        existing_task_ids = [task['task_id'] for task in task_user_info]
        #print(existing_task_ids)
        # 遍历每个任务ID，检查是否需要执行任务
        for task_id, max_completes in task_completion_limits.items():
            task_info = next((task for task in task_user_info if task['task_id'] == task_id), None)

            if task_info:
                complete_num = task_info['complete_num']
                if complete_num < max_completes:
                    #print(f"任务ID: {task_id}, 当前完成次数: {complete_num}, 将执行任务并尝试领取奖励。")
                    print()
                    if task_id == 6:
                        llhmp(code, token, 'browse_venue', '6')
                        #today_water(code, token)
                    elif task_id == 13:
                        llhmp(code, token, 'browse_new_user_zone', '13')
                        today_water(code, token)
                        sj_yg(code, token)#收集阳光
                        syyg(code, token)#使用阳光
                    # 这里可以添加其他任务ID的逻辑
                    elif task_id == 15:
                    # 对于任务ID 15的特定处理
                        complete_task(code, token, '15')
                    elif task_id == 16:
                        llhmp(code, token, 'browse_community', '16')

                    elif task_id == 10:
                        llhmp(code, token, 'subscibe', '10')  
                    elif task_id == 14:
                        hdwt_box(code, token, '14')      
                    elif task_id == 4:
                    # 对于任务ID 15的特定处理
                        lq_fd(code, token, '4')

                    elif task_id == 1:
                        lq_fd(code, token, '1')
                    time.sleep(random.randint(1, 5))


            elif task_id not in existing_task_ids:
                #print(f"任务ID: {task_id}, 未在列表中，将尝试执行并领取奖励。")
                print()
                if task_id == 6:
                    llhmp(code, token, 'browse_venue', '6')
                    today_water(code, token)
                elif task_id == 13:
                    llhmp(code, token, 'browse_new_user_zone', '13')
                    sj_yg(code, token)#收集阳光
                    syyg(code, token)#使用阳光                    
                elif task_id == 15:                   
                    complete_task(code, token, '15')
                elif task_id == 16:
                    llhmp(code, token, 'browse_community', '16')
                elif task_id == 10:
                    llhmp(code, token, 'subscibe', '10')     
                elif task_id == 14:
                    hdwt_box(code, token, '14')     
                elif task_id == 1:
                    lq_fd(code, token, '1')

                elif task_id == 4:
                    lq_fd(code, token, '4')


                time.sleep(random.randint(1, 5))




                # 添加其他任务ID和类型的逻辑

    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")





#                  任务   数据      
def complete_task(code, token, tid):  # 棉花工厂
    url = "https://sg01.purcotton.com/api/task/complete-manual-task"
    headers = create_headers(code, token)
    payload = {
        "tid": tid,
        "relate_id": 0,
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # 检查HTTP响应状态码，如果不是200系列，则抛出异常

        # 解析响应数据
        response_data = response.json()
        if response_data.get("code") == 200:
            print("奖励领取成功。")
            tjlq_mpjl(code, token, tid) 
        else:
            # 如果响应中的code不是200，打印错误信息
            print(f"任务失败：{response_data.get('msg')}")
    except requests.exceptions.RequestException as e:
        # 如果请求过程中发生异常，打印异常信息
        print(f"请求失败: {e}")


def lq_fd(code, token, tid):  # 三餐福袋和签到
    # 确保tid为整数类型
    tid = int(tid)  # 将tid转换为整型以确保与整数进行比较

    task_name = "未知任务"
    if tid == 4:
        task_name = "三餐福袋"   #7-12 14-17 18-22  
    elif tid == 1:
        task_name = "签到"

    url = "https://sg01.purcotton.com/api/task/complete-task"
    headers = create_headers(code, token)
    data = {"tid": tid}  # 使用传入的任务ID
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()  # 检查响应状态码

        # 解析响应数据
        response_data = response.json()
        if response_data.get("code") == 200:
            print(f"{task_name} 奖励领取成功。")
            # 打印sy_water和get_water
            data = response_data.get("data", {})  
            sy_water = data.get("sy_water", "未知")
            get_water = data.get("get_water", "未知")
            print(f"{task_name} 剩余水量：{sy_water}, 获取水量：{get_water}")
        else:
            print(f"{task_name}：{response_data.get('msg')}")
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")

#                  任务     完

#                  提取数据  开始    

def hqid(code, token):  # 获取树木ID和阳光信息
    url = "https://sg01.purcotton.com/api/index"

    headers = create_headers(code, token)

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        response_data = response.json()
        # print("Response JSON:", response_data)  # 用于调试

        if response_data.get("code") == 200:
            tree_data = response_data['data']['tree']
            user_data = response_data['data']['user']  # 获取用户相关数据

            # 获取树木ID
            tree_id = tree_data.get('id')

            # 获取阳光相关数据
            sunshine = user_data.get('sunshine', 0)  # 如果不存在，则默认为0
            total_sunshine = user_data.get('total_sunshine', 0)  # 如果不存在，则默认为0

            # 可以选择打印这些信息
            #print(f"树木ID: {tree_id}  当前阳光: {sunshine}  总阳光: {total_sunshine} ")
             

            # 根据需要返回所需的数据，这里返回一个包含所有信息的元组
            return tree_id, sunshine, total_sunshine
        else:
            print(f"请求失败，错误代码: {response_data.get('code')}, 错误信息: {response_data.get('msg')}")
            return None, None, None  # 如果请求失败，返回包含None的元组
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
        return None, None, None  # 如果发生异常，返回包含None的元组


def login(code, token): # 提取的号码
    url = "https://sg01.purcotton.com/api/login"
    headers = create_headers(code, token)
    data = {
        "invite_source": "task",
        "channel": ""  # "channel": "zmh_assist" 
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()  # 检查HTTP响应状态

        response_data = response.json()
        if response_data.get("code") == 200:
            phone = response_data["data"]["phone"]
            user_id = response_data["data"]["id"]  # 提取id
            #print("提取的电话号码:", phone)
            #print("提取的用户ID:", user_id)  # 打印id
            return phone, user_id  # 返回电话号码和用户ID
        else:
            print("请求失败，错误代码:", response_data.get("code"), "错误信息:", response_data.get("msg"))
            return None, None
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
        return None, None

#                  提取数据  完

#                   回答问题
def hdwt_box(code, token, tid): #庄园小课堂
    url = "https://sg01.purcotton.com/api/answer"
    headers = create_headers(code, token)
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        response_data = response.json()
        exams = response_data.get("data", {}).get("exams", [])
        #print(response.json())
        for exam in exams:
            exam_id = exam.get('id')
            print(f"正在处理问题ID: {exam_id}")
            
            # 这里是你提交答案的代码逻辑
            url_submit_answer = "https://sg01.purcotton.com/api/answer/complete"
            payload = {
                "tid": tid,  # 假设任务ID为14
                "exam_id": exam_id,
                "win": 1  # 假设标记为正确
            }
            submit_response = requests.post(url_submit_answer, headers=headers, json=payload)
            submit_response.raise_for_status()

            if submit_response.status_code == 200:
                submit_response_data = submit_response.json()
                #print(submit_response_data)  # 打印完整的响应体
                
                # 提取并打印get_water, complete_num, 和 box_id
                get_water = submit_response_data.get("data", {}).get("get_water", 0)
                complete_num = submit_response_data.get("data", {}).get("complete_num", 0)
                box_id = submit_response_data.get("data", {}).get("box_id", 0)
                print(f"获取水量：{get_water}, 完成数量：{complete_num}, 宝箱ID：{box_id}")
                
                # 如果box_id大于0，则打开宝箱
                if box_id > 0:
                    print(f"检测到宝箱ID: {box_id}，尝试打开宝箱...")
                    url_open_box = "https://sg01.purcotton.com/api/answer/open-box"
                    box_payload = {"box_id": box_id}
                    box_response = requests.post(url_open_box, headers=headers, json=box_payload)
                    box_response.raise_for_status()

                    if box_response.status_code == 200:
                        box_response_data = box_response.json()
                       # print(f"宝箱 {box_id} 打开成功，响应内容：", box_response_data)
                        # 提取sy_water和get_water
                        sy_water = box_response_data.get("data", {}).get("sy_water", 0)
                        get_water = box_response_data.get("data", {}).get("get_water", 0)
                        print(f"宝箱  剩余水量：{sy_water}, 宝箱水量：{get_water}")
                        
            
            # 随机停止3-5秒
            time.sleep(random.randint(3, 5))
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")


def today_water(code, token):#
    url = "https://sg01.purcotton.com/api/get-today-water"
    headers = create_headers(code, token)  # 确保 create_headers 函数正确定义并返回所需的头部信息

    try:
        response = requests.post(url, headers=headers)
        response.raise_for_status()  # 确保响应状态为200

        # 解析响应体为JSON
        response_data = response.json()

        # 检查响应中的code字段
        if response_data.get("code") == 200:
            #print("完整响应体:", response_data)  # 打印完整的响应体

            # 提取所需数据
            sy_water = response_data.get("data", {}).get("sy_water", "未知")
            get_water = response_data.get("data", {}).get("get_water", "未知")
            tomorrow_get_water_num = response_data.get("data", {}).get("tomorrow_get_water_num", "未知")

            #print(f"剩余水量（sy_water）: {sy_water}")
            print(f"今日获取水量: {get_water}")
            print(f"明日可获取水量: {tomorrow_get_water_num}")
            print(f"今日获取水量: {get_water} 明日可获取水量: {tomorrow_get_water_num}")
        else:
            # 打印错误消息
            print(f"水瓶  {response_data.get('msg', '未知错误')}")

    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")

def cscscs(code, token):  
    url = "https://sg01.purcotton.com/api/statistics/store"
    headers = create_headers(code, token)
    _, user_id = login(code, token)  # 调用login函数，忽略电话号码，只获取user_id
    data = {
        "uid": user_id,
        "type": 301  # 确保这里的值符合API的要求
    }
    #print(data)  # 打印整个响应数据
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()  # 检查HTTP响应状态

        response_data = response.json()
        #print(response_data)  # 打印整个响应数据
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")

#   阳光

def sj_yg(code, token):
    success = False
    while not success:
        url = "https://sg01.purcotton.com/api/get-sunshine"
        headers = create_headers(code, token)
        # 使用当前时间戳
        payload = {"time": int(time.time() * 1000)}
        #print(f"请求负载: {payload}")

        try:
            response = requests.post(url, headers=headers, json=payload)
            response_data = response.json()

            if response.status_code == 200:
                if response_data["code"] == 200:
                    sy_sunshine = response_data['data'].get('sy_sunshine')
                    get_sunshine = response_data['data'].get('get_sunshine')
                    print(f"成功领取阳光: 剩余阳光: {sy_sunshine}, 获得阳光: {get_sunshine}")
                    success = True  # 标记成功领取，退出循环
                elif response_data["code"] == 400:
                    print("没有可领取的阳光")
                    break  # 如果没有可领取的阳光，跳出循环
                else:
                    print(f"阳光操作响应: {response_data}")
            else:
                print(f"请求失败，HTTP状态码: {response.status_code}")

        except requests.exceptions.RequestException as e:
            print(f"请求失败: {e}")

        if success:
            # 如果成功领取阳光，则暂停1到3秒后继续
            sleep_time = random.randint(1, 3)
            print(f"暂停{sleep_time}秒后重新领取...")
            time.sleep(sleep_time)
            success = False  # 重置成功标志，继续领取

def syyg(code, token):
    """当阳光值大于100时，完成阳光任务"""
    # 假设hqid返回树木ID，sunshine，和其他信息
    _, sunshine, _ = hqid(code, token)

    if sunshine > 99:
        url = "https://sg01.purcotton.com/api/sunshine-task/complete-task"
        headers = create_headers(code, token)  # 使用create_headers函数创建请求头
        payload = {"tid": 1}  # 固定payload，可能需要根据API文档调整

        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()  # 检查响应是否成功

            response_data = response.json()
            if response_data.get("code") == 200:
                print("成功完成阳光任务。")
                # 这里可以根据响应体进一步处理，如打印信息或记录日志
            else:
                print(f"完成阳光任务失败，错误代码: {response_data.get('code')}, 错误信息: {response_data.get('msg')}")
        except requests.exceptions.RequestException as e:
            print(f"请求完成阳光任务时出错: {e}")
    else:
        print(f"阳光值未达到{sunshine}/100，不执行任务。")





#   好友？


def hyid(code, token):
    url = "https://sg01.purcotton.com/api/friend/list?page=1&page_size=50"
    headers = create_headers(code, token)

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # 确保响应状态为200

        # 解析响应体为JSON
        response_data = response.json()

        friend_user_ids = []  # 用于存储符合条件的朋友的用户ID
        if response_data.get("code") == 200:
            friends_list = response_data.get("data", {}).get("list", [])
            for friend in friends_list:
                friend_user_id = friend.get("friend_user_id")
                help_water_cnt = friend.get("help_water_cnt")
                be_help_water_cnt = friend.get("friend_user_info", {}).get("be_help_water_cnt")
                #print(f"朋友用户ID: {friend_user_id}, 帮忙浇水次数: {help_water_cnt}, 被帮忙浇水次数: {be_help_water_cnt}")
                
                # 只有当帮忙浇水次数小于1时，才收集该朋友的用户ID
                if help_water_cnt < 1:
                    friend_user_ids.append(friend_user_id)
            
            return friend_user_ids  # 返回所有符合条件收集到的用户ID
        else:
            print("请求失败，错误代码:", response_data.get("code"), "错误信息:", response_data.get("msg"))

    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")



def access_friend_detail(code, token, friend_user_id):
    """访问朋友的详细信息，并尝试对其树进行浇水操作"""
    url = "https://sg01.purcotton.com/api/friend/index"
    headers = create_headers(code, token)
    headers['friend-id'] = str(friend_user_id)

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        response_data = response.json()

        if response_data.get("code") == 200:
            tree_info = response_data.get('data', {}).get('tree', {})
            if isinstance(tree_info, list) and tree_info:
                tree_info = tree_info[0]

            tree_id = tree_info.get('id') if isinstance(tree_info, dict) else None
            help_water_info = response_data.get('data', {}).get('help_water', {})
            help_water_code = help_water_info.get('code')
            help_water_msg = help_water_info.get('msg')

            #print(f"{friend_user_id}朋友树ID: {tree_id}, 帮忙浇水代码: {help_water_code}, 信息: '{help_water_msg}'")

            if tree_id is not None:
                success = water_friend_tree(code, token, tree_id, friend_user_id)
                if not success:
                    print(f"由于操作失败，停止处理朋友{friend_user_id}的后续操作。")
                    return False
        else:
            print(f"获取朋友{friend_user_id}的详细信息失败，错误代码: {response_data.get('code')}, 错误信息: {response_data.get('msg')}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
        return False

    return True

def water_friend_tree(code, token, tree_id, friend_user_id):
    """执行给定朋友的树浇水操作"""
    url = "https://sg01.purcotton.com/api/friend/water"
    headers = create_headers(code, token)
    payload = {"tree_user_id": tree_id}
    headers['friend-id'] = str(friend_user_id)

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        response_data = response.json()
        #print(response_data)  # 打印整个响应体，用于调试

        if response_data["code"] == 200:
            # 检查response_data['data']是否为字典，以此判断是否可以安全访问'info'
            if isinstance(response_data['data'], dict):
                use_water = response_data['data']['info'].get('use_water', '未知')
                reward_water = response_data['data']['info'].get('reward_water', '未知')
                print(f"对树ID {tree_id} 的浇水操作成功: 使用水量: {use_water}, 奖励水量: {reward_water}")
            else:
                # 如果data不是字典，直接打印data字段，这里可能是错误消息或其他说明
                print(f"操作结果: {response_data['data']}")
                return False
        elif response_data["code"] == 400:
            #print(f"{response_data.get('msg', '未知错误')}. 完整响应体: {response_data}")
            print(f"{response_data.get('msg', '未知错误')}. ")
            return False
        else:
            print(f"对树ID {tree_id} 的浇水操作响应: {response_data}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
        return False

    return True

def process_all_friends(friends_user_ids, code, token):
    """遍历朋友列表，尝试对每个朋友的树进行浇水操作，并在首次失败时停止"""
    for friend_user_id in friends_user_ids:
        if not access_friend_detail(code, token, friend_user_id):
            #print(f"由于操作失败，停止对所有后续朋友的处理。")
            break  # 遇到第一个失败，立即跳出循环



def main():
    var_name = 'qmzmh'
    tokens = get_env_variable(var_name)
    if not tokens:
        return
    
    total_tokens = len(tokens)
    
    if total_tokens > 20:
        print("账号数量超过20个，不执行操作。")
        return


    for index, token_info in enumerate(tokens, start=1):
        parts = token_info.split('#')
        if len(parts) < 2:
            print("令牌格式不正确。跳过处理。")
            continue

        code = parts[0]
        token = parts[1]
        remark = parts[2] if len(parts) > 2 else ""
        print()
        print(f"------账号{index}/{total_tokens}，备注: {remark}-------")
        
        phone, user_id = login(code, token)
        if phone and user_id:  # 检查是否成功获取电话号码和用户ID
            # 进行后续任务
            cscscs(code, token)
            #sj_yg(code, token)#收集阳光
            #syyg(code, token)#使用阳光
            jscz(code, token) #浇水
            pdrw(code, token) #任务判断
            friend_user_ids = hyid(code, token)  
            if friend_user_ids:
                process_all_friends(friend_user_ids, code, token)  # 正确传入朋友ID列表
        else:
            print("登录失败或获取用户信息失败，跳过当前账号的后续操作。")
      


if __name__ == "__main__":
    main()

'''
def main():
    var_name = 'qmzmh'
    tokens = get_env_variable(var_name)
    if not tokens:
        return
    
    total_tokens = len(tokens)
    
    if total_tokens > 20:
        print("账号数量超过20个，不执行操作。")
        return

    for index, token_info in enumerate(tokens, start=1):
        parts = token_info.split('#')
        if len(parts) < 2:
            print("令牌格式不正确。跳过处理。")
            continue

        code = parts[0]
        token = parts[1]
        remark = parts[2] if len(parts) > 2 else ""

        print(f"------账号{index}/{total_tokens}，备注: {remark}-------")
        

        login(code, token)#判断要手机号码/提取的电话号码: 才运行下面的任务
        cscscs(code, token)#更新
        #sj_yg(code, token)#收集阳光
        #syyg(code, token)#使用阳光
        jscz(code, token) #浇水
        pdrw(code, token) #任务判断
        friend_user_ids = hyid(code, token)  
        if friend_user_ids:
            process_all_friends(friend_user_ids, code, token)  # 正确传入朋友ID列表
                


if __name__ == "__main__":
    main()
'''
