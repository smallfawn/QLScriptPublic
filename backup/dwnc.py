# !/usr/bin/python3
# -*- coding: utf-8 -*-
# @Time    : 2023/7/6 12:24
# @Author  : ziyou
# -------------------------------
# cron "1 8,10,12,15,18,22 * * *" script-path=xxx.py,tag=匹配cron用
# const $ = new Env('得物森林')
# 抓包 https://app.dewu.com/hacking-tree/v1/user/init 获取 sk x_auth_token user_agent
# 得物森林
# export dewu_x_auth_token='Bearer ey**&Bearer ey**',多账号使用换行或&
# export dewu_sk='9MFyPaKgdQl*******************' 任意一个账号的 sk
# export dewu_user_agent='*****pp/5.25.0******' 同一 sk 对应的 user_agent，其中需含有得物版本号 版本号需大于 5.24.5
# user_agent示例： Mozilla/5.0 (Linux; U; Android 10; zh-cn; Mi 10 Pro Build/QKQ1.191117.002) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/11.0 Mobile Safari/537.36 COVC/045429 Mobile Safari/537.36/duapp/5.24.5(android;13)
# user_agent示例： DUApp/5.25.0 (com.siwuai.duapp; build:5.25.0.120; iOS 15.6.0) Alamofire/5.3.0
# 如需关闭助力功能设置 export dewu_help_signal='False'
# 青龙拉取命令 ql raw https://raw.githubusercontent.com/q7q7q7q7q7q7q7/ziyou/main/%E5%BE%97%E7%89%A9%E6%A3%AE%E6%9E%97.py
# 第一个账号助力作者，其余账号依ck顺序助力
# https://t.me/q7q7q7q7q7q7q7_ziyou


import os
import random
import re
import sys
import time
import requests
from urllib.parse import urlparse, parse_qs

ck_list = []
share_code_list = []
author_share_code_list = []
HELP_SIGNAL = 'True'
SK = ''
USER_AGENT = ''
__version__ = '1.0.2'
all_print_list = []  # 用于记录所有 myprint 输出的字符串


# 用于记录所有 print 输出的字符串,暂时实现 print 函数的sep和end
def myprint(*args, sep=' ', end='\n', **kwargs):
    global all_print_list
    output = ""
    # 构建输出字符串
    for index, arg in enumerate(args):
        if index == len(args) - 1:
            output += str(arg)
            continue
        output += str(arg) + sep
    output = output + end
    all_print_list.append(output)
    # 调用内置的 print 函数打印字符串
    print(*args, sep=sep, end=end, **kwargs)


# 发送通知消息
def send_notification_message(title):
    try:
        from notify import send  # 导入青龙通知文件

        send(title, ''.join(all_print_list))
    except Exception as e:
        if e:
            print('发送通知消息失败！')


# 加载环境变量
def get_env():
    global ck_list
    global HELP_SIGNAL
    global SK
    global USER_AGENT
    env_str = os.getenv("dewu_x_auth_token")
    if env_str:
        ck_list += env_str.replace("&", "\n").split("\n")
    env_str = os.getenv("dewu_help_signal")
    if env_str:
        HELP_SIGNAL = env_str
    env_str = os.getenv("dewu_sk")
    if env_str:
        SK = env_str.strip()
    env_str = os.getenv("dewu_user_agent")
    if env_str:
        USER_AGENT = env_str.strip()


def get_version_from_github():
    latest_version = '获取失败'
    username = "q7q7q7q7q7q7q7"
    repo = "ziyou"
    filepath = "得物森林.py"
    url_list = [
        f'https://raw.fgit.cf/{username}/{repo}/main/{filepath}',
        f"https://ghproxy.com/https://raw.githubusercontent.com/{username}/{repo}/main/{filepath}",
    ]
    for url in url_list:
        try:
            response = requests.get(url, timeout=(10, 10))
            if response.status_code == 200:
                response_text = response.text
                version_regex = r"^__version__\s*=\s*[\'\"]([^\'\"]*)[\'\"]"
                version_match = re.search(version_regex, response_text,
                                          re.MULTILINE)
                if version_match is not None and __version__:
                    latest_version = version_match.group(1)
                    break
        except Exception as e:
            if e:
                pass
    myprint(f'现在运行的版本是：{__version__}，最新版本：{latest_version}',
            flush=True)


# 下载作者的助力码
def download_author_share_code():
    global author_share_code_list
    try:
        response = requests.get('https://netcut.cn/p/d3436822ba03c0c3')
        _list = re.findall(r'"note_content":"(.*?)"', response.text)
        if _list:
            share_code_list = _list[0].split(r'\n')
            author_share_code_list += share_code_list
    except Exception as e:
        if e:
            pass


# 获得url params 中键为key的值
def get_url_key_value(url, key):
    parsed_url = urlparse(url)
    query_params = parse_qs(parsed_url.query)
    _dict = {k: v[0] if len(v) == 1 else v for k, v in query_params.items()}
    key_value = _dict.get(key)
    return key_value


class DeWu:
    WATERTING_G: int = 40  # 每次浇水克数
    REMAINING_G: int = 1800  # 最后浇水剩余不超过的克数

    def __init__(self, x_auth_token, index, waterting_g=WATERTING_G,
                 remaining_g=REMAINING_G):
        self.index = index
        self.waterting_g = waterting_g  # 每次浇水克数
        self.remaining_g = remaining_g  # 最后浇水剩余不超过的克数
        self.session = requests.Session()
        app_version = re.findall(r'pp/([0-9]+\.[0-9]+\.[0-9]+)', USER_AGENT)[0]
        self.headers = {'appVersion': app_version,
                        'User-Agent': USER_AGENT,
                        'x-auth-token': x_auth_token,
                        'uuid': '0000000000000000',
                        'SK': SK, }
        self.tree_id = 0  # 树的id
        self.tasks_completed_number = 0  # 任务完成数
        self.cumulative_tasks_list = []  # 累计计任务列表
        self.tasks_dict_list = []  # 任务字典列表
        self.is_team_tree = False  # 是否是团队树

    # 种树奖品
    def tree_info(self):
        url = 'https://app.dewu.com/hacking-tree/v1/user/target/info'
        response = self.session.get(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') == 200:
            name = response_dict.get('data').get('name')
            level = response_dict.get('data').get('level')
            return name, level
        myprint(response_dict.get('msg'))
        return '', ''

    # 判断是否是团队树
    def determine_whether_is_team_tree(self):
        url = 'https://app.dewu.com/hacking-tree/v1/team/info'
        response = self.session.get(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('data').get('show') is True and response_dict.get(
                'data').get('teamTreeId'):
            self.is_team_tree = True

    # 领潮金币签到
    def check_in(self):
        url = 'https://app.dewu.com/hacking-game-center/v1/sign/sign'
        response = self.session.post(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') == 200:
            myprint(f"签到成功！")
            return
        myprint(f"签到失败！ {response_dict.get('msg')}")

    # 水滴7天签到
    def droplet_check_in(self):
        url = 'https://app.dewu.com/hacking-tree/v1/sign/sign_in'
        response = self.session.post(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') == 200:
            # 暂时设置，看看礼盒是什么先
            myprint(f"签到成功,获得{response_dict.get('data').get('Num')}g水滴")
            return
        myprint(f"签到失败！ {response_dict.get('msg')}")

    # 领取气泡水滴
    def receive_droplet_extra(self):
        temporary_number = -1  # 用于判断两次浇水，奖励是否有变化
        countdown_time = 0
        receive_signal = False
        for _ in range(50):
            url = 'https://app.dewu.com/hacking-tree/v1/droplet-extra/info'
            response = self.session.get(url, headers=self.headers)
            response_dict = response.json()
            # myprint(response_dict)
            if response_dict.get('code') != 200:
                myprint(f"获取气泡水滴信息失败! {response_dict}")
                return
            data = response_dict.get('data')
            receivable = data.get('receivable')
            if receivable is True:  # 判断今天是否可领取
                if data.get('dailyExtra'):  # 第一次领取时
                    water_droplet_number = data.get('dailyExtra').get(
                        'totalDroplet')
                else:  # 第二次领取时
                    water_droplet_number = data.get('onlineExtra').get(
                        'totalDroplet')
                # 如果二者相等，说明浇水成功 但奖励没变化 不再浇水 直接领取 或者 接受到直接领取信号
                if temporary_number == water_droplet_number or receive_signal:
                    myprint(f"当前可领取气泡水滴{water_droplet_number}g")
                    url = 'https://app.dewu.com/hacking-tree/v1/droplet-extra/receive'
                    response = self.session.post(url, headers=self.headers)
                    response_dict = response.json()
                    # myprint(response_dict)
                    if response_dict.get('code') != 200:
                        countdown_time += 60
                        if countdown_time > 60:  # 已经等待过60s，仍未领取成功，退出
                            myprint(f"领取气泡水滴失败! {response_dict}")
                            return
                        myprint(f'等待{countdown_time}秒后领取')
                        time.sleep(countdown_time)
                        continue
                    myprint(
                        f"领取气泡水滴成功! 获得{response_dict.get('data').get('totalDroplet')}g水滴")
                    countdown_time = 0  # 领取成功，重置等待时间
                    continue
                temporary_number = water_droplet_number
                myprint(f'当前气泡水滴{water_droplet_number}g，未满，开始浇水')
                if not self.waterting():  # 浇水失败
                    receive_signal = True  # 给出直接领取信号
                time.sleep(0.5)
                continue  # 浇水成功后查询信息
            # 今天不可领取了，退出
            water_droplet_number = response_dict.get('data').get(
                'dailyExtra').get('totalDroplet')
            myprint(
                f"{response_dict.get('data').get('dailyExtra').get('popTitle')},"
                f"已经积攒{water_droplet_number}g水滴!")
            return

    # 浇水充满气泡水滴
    def waterting_droplet_extra(self):
        while True:
            url = 'https://app.dewu.com/hacking-tree/v1/droplet-extra/info'
            response = self.session.get(url, headers=self.headers)
            response_dict = response.json()
            # myprint(response_dict)
            count = response_dict.get('data').get('dailyExtra').get('times')
            if not count:
                myprint(
                    f"气泡水滴已充满，明日可领取{response_dict.get('data').get('dailyExtra').get('totalDroplet')}g")
                return
            for _ in range(count):
                if not self.waterting():  # 无法浇水时退出
                    return
                time.sleep(0.5)

    # 领取木桶水滴,200秒满一次,每天领取3次
    def receive_bucket_droplet(self):
        url = 'https://app.dewu.com/hacking-tree/v1/droplet/get_generate_droplet'
        response = self.session.post(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') != 200:
            myprint(f"领取木桶水滴失败! {response_dict}")
            return
        myprint(
            f"领取木桶水滴成功! 获得{response_dict.get('data').get('droplet')}g水滴")

    # 判断木桶水滴是否可以领取
    def judging_bucket_droplet(self):
        url = 'https://app.dewu.com/hacking-tree/v1/droplet/generate_info'
        response = self.session.get(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('data').get('currentDroplet') == 100:
            myprint(
                f"今天已领取木桶水滴{response_dict.get('data').get('getTimes')}次")
            self.receive_bucket_droplet()
            return True
        return False

    # 获取助力码
    def get_shared_code(self):
        url = 'https://app.dewu.com/hacking-tree/v1/keyword/gen'
        response = self.session.post(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') != 200:
            myprint(f"获取助力码失败! {response_dict}")
            return
        keyword_desc = response_dict.get('data').get('keywordDesc').replace(
            '\n', '')
        myprint(f"获取助力码成功! {keyword_desc}")

    # 获得当前水滴数
    def get_droplet_number(self):
        url = 'https://app.dewu.com/hacking-tree/v1/user/init'
        _json = {"keyword": ""}
        response = self.session.post(url, headers=self.headers, json=_json)
        response_dict = response.json()
        # myprint(response_dict)
        data = response_dict.get('data')
        if data:
            droplet_number = data.get('droplet')
            return droplet_number
        myprint(f'获得当前水滴数出错 {response_dict}')
        return '获取失败'

    # 领取累计任务奖励
    def receive_cumulative_tasks_reward(self, condition):
        url = 'https://app.dewu.com/hacking-tree/v1/task/extra'
        _json = {'condition': condition}
        response = self.session.post(url, headers=self.headers, json=_json)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') != 200:
            myprint(f"领取累计任务奖励失败! {response_dict}")
            return
        myprint(
            f"领取累计任务奖励成功! 获得{response_dict.get('data').get('num')}g水滴")

    # 领取任务奖励
    def receive_task_reward(self, classify, task_id, task_type):
        time.sleep(0.2)
        url = 'https://app.dewu.com/hacking-tree/v1/task/receive'
        if task_type in [251, ]:
            _json = {'classify': classify, 'taskId': task_id, 'completeFlag': 1}
        else:
            _json = {'classify': classify, 'taskId': task_id}
        response = self.session.post(url, headers=self.headers, json=_json)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') != 200:
            myprint(f"领取任务奖励失败! {response_dict}")
            return
        myprint(
            f"领取任务奖励成功! 获得{response_dict.get('data').get('num')}g水滴")

    # 领取浇水奖励
    def receive_watering_reward(self):
        url = 'https://app.dewu.com/hacking-tree/v1/tree/get_watering_reward'
        _json = {'promote': ''}
        response = self.session.post(url, headers=self.headers, json=_json)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') != 200:
            myprint(f"领取浇水奖励失败! {response_dict}")
            return
        myprint(
            f"领取浇水奖励成功! 获得{response_dict.get('data').get('currentWateringReward').get('rewardNum')}g水滴")

    # 领取等级奖励
    def receive_level_reward(self):
        for _ in range(20):
            url = 'https://app.dewu.com/hacking-tree/v1/tree/get_level_reward'
            _json = {'promote': ''}
            response = self.session.post(url, headers=self.headers, json=_json)
            response_dict = response.json()
            # myprint(response_dict)
            if response_dict.get('code') != 200 or response_dict.get(
                    'data') is None:
                myprint(f"领取等级奖励失败! {response_dict.get('msg')}")
                return
            level = response_dict.get('data').get('levelReward').get(
                'showLevel') - 1
            reward_num = response_dict.get('data').get(
                'currentLevelReward').get('rewardNum')
            myprint(f"领取{level}级奖励成功! 获得{reward_num}g水滴")
            if response_dict.get('data').get('levelReward').get(
                    'isComplete') is False:
                return
            time.sleep(1)

    # 浇水
    def waterting(self):
        if self.is_team_tree is True:  # 如果是团队树，使用团队浇水
            return self.team_waterting()
        url = 'https://app.dewu.com/hacking-tree/v1/tree/watering'
        response = self.session.post(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') != 200:
            myprint(f"浇水失败! {response_dict}")
            return False
        myprint(f"成功浇水{self.waterting_g}g")
        if response_dict.get('data').get('nextWateringTimes') == 0:
            myprint('开始领取浇水奖励')
            time.sleep(1)
            self.receive_watering_reward()
        return True

    # 团队浇水
    def team_waterting(self):
        url = 'https://app.dewu.com/hacking-tree/v1/team/tree/watering'
        _json = {"teamTreeId": self.tree_id}
        response = self.session.post(url, headers=self.headers, json=_json)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') != 200:
            myprint(f"浇水失败! {response_dict}")
            return False
        myprint(f"成功浇水{self.waterting_g}g")
        if response_dict.get('data').get('nextWateringTimes') == 0:
            myprint('开始领取浇水奖励')
            time.sleep(1)
            self.receive_watering_reward()
        return True

    # 多次执行浇水，领取浇水奖励
    def execute_receive_watering_reward(self):
        for _ in range(20):
            url = 'https://app.dewu.com/hacking-tree/v1/tree/get_tree_info'
            response = self.session.get(url, headers=self.headers)
            response_dict = response.json()
            # myprint(response_dict)
            if response_dict.get('code') != 200:
                myprint(f"获取种树进度失败! {response_dict}")
                return
            count = response_dict.get('data').get(
                'nextWateringTimes')  # 获取浇水奖励还需要的浇水次数
            if response_dict.get('data').get(
                    'wateringReward') is None or count <= 0:  # 没有奖励时退出
                return
            for _ in range(count):
                if not self.waterting():  # 无法浇水时退出
                    return
                time.sleep(0.5)

    # 浇水直到少于 指定克数
    def waterting_until_less_than(self):
        droplet_number = self.get_droplet_number()
        if droplet_number > self.remaining_g:
            count = int((droplet_number - self.remaining_g) / self.waterting_g)
            for _ in range(count + 1):
                if not self.waterting():  # 无法浇水时退出
                    return
                time.sleep(0.5)

    # 提交任务完成状态
    def submit_task_completion_status(self, _json):
        url = 'https://app.dewu.com/hacking-task/v1/task/commit'
        response = self.session.post(url, headers=self.headers, json=_json)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') == 200:
            return True
        return False

    # 获取任务列表
    def get_task_list(self):
        url = 'https://app.dewu.com/hacking-tree/v1/task/list'
        response = self.session.get(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') == 200:
            self.tasks_completed_number = response_dict.get('data').get(
                'userStep')  # 任务完成数量
            self.cumulative_tasks_list = response_dict.get('data').get(
                'extraAwardList')  # 累计任务列表
            self.tasks_dict_list = response_dict.get('data').get(
                'taskList')  # 任务列表
            return True

    # 水滴大放送任务步骤1
    def task_obtain(self, task_id, task_type):
        url = 'https://app.dewu.com/hacking-task/v1/task/obtain'
        _json = {'taskId': task_id, 'taskType': task_type}
        response = self.session.post(url, headers=self.headers, json=_json)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') == 200 and response_dict.get(
                'status') == 200:
            return True
        return False

    # 浏览任务开始  且等待16s TaskType有变化  浏览15s会场会变成16
    def task_commit_pre(self, _json):
        url = 'https://app.dewu.com/hacking-task/v1/task/pre_commit'
        response = self.session.post(url, headers=self.headers, json=_json)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') == 200 and response_dict.get(
                'status') == 200:
            return True
        return False

    # 执行任务
    def execute_task(self):
        self.get_task_list()  # 刷新任务列表
        for tasks_dict in self.tasks_dict_list:
            if tasks_dict.get('isReceiveReward') is True:  # 今天不能进行操作了，跳过
                continue
            if tasks_dict.get('rewardCount') >= 3000:  # 获取水滴超过3000的，需要下单，跳过
                continue
            # 'taskId' 任务ID
            # 'taskName' 任务名字
            # 'isComplete' 是否未完成
            # 'isReceiveReward' 完成后是否领取奖励
            # 'taskType'任务类型
            # 'rewardCount' 完成任务所获得的奖励水滴
            # 'isObtain' 是否完成任务前置要求
            # 'jumpUrl' 是否完成任务前置要求
            classify = tasks_dict.get('classify')
            task_id = tasks_dict.get('taskId')
            task_type = tasks_dict.get('taskType')
            task_name = tasks_dict.get('taskName')
            btd = get_url_key_value(tasks_dict.get('jumpUrl'), 'btd')
            btd = int(btd) if btd else btd  # 如果bid存在 转换为整数类型
            spu_id = get_url_key_value(tasks_dict.get('jumpUrl'), 'spuId')
            spu_id = int(spu_id) if spu_id else spu_id  # 如果spuId存在 转换为整数类型

            if tasks_dict.get('isComplete') is True:  # 可以直接领取奖励的
                if task_name == '领40g水滴值' and not tasks_dict.get(
                        'receivable'):  # 如果该值不存在，说明已经领过40g水滴了
                    continue
                myprint(f'开始任务：{task_name}')
                self.receive_task_reward(classify, task_id, task_type)
                continue

            myprint(f'★开始任务：{task_name}')
            if task_name == '完成一次签到':  # 签到
                self.check_in()
                data = {'taskId': tasks_dict['taskId'],
                        'taskType': str(tasks_dict['taskType'])}
                if self.submit_task_completion_status(data):
                    self.receive_task_reward(classify, task_id,
                                             task_type)  # 领取奖励
                    continue

            if task_name == '领40g水滴值':  # 每天8点/12点/18点/22点 领40g水滴
                self.receive_task_reward(classify, task_id, task_type)  # 领取奖励
                continue

            if task_name == '收集一次水滴生产':
                if self.judging_bucket_droplet():
                    self.receive_task_reward(classify, task_id,
                                             task_type)  # 领取奖励
                else:
                    myprint('当前木桶水滴未达到100g，下次来完成任务吧！')
                continue

            if task_name == '浏览【我】的右上角星愿森林入口':
                _json = _json = {"action": task_id}
                url = 'https://app.dewu.com/hacking-tree/v1/user/report_action'
                response = self.session.post(url, headers=self.headers,
                                             json=_json)  # 提交完成状态
                response_dict = response.json()
                # myprint(response_dict)
                if response_dict.get('code') == 200:
                    self.receive_task_reward(classify, task_id,
                                             task_type)  # 领取奖励
                continue

            if any(re.match(pattern, task_name) for pattern in
                   ['参与1次上上签活动', '从桌面组件访问许愿树',
                    '参与1次拆盲盒', '去.*']):
                _json = _json = {'taskId': task_id, 'taskType': str(task_type)}
                self.submit_task_completion_status(_json)  # 提交完成状态
                self.receive_task_reward(classify, task_id, task_type)  # 领取奖励
                continue

            if any(re.match(pattern, task_name) for pattern in ['.*收藏.*']):
                _json = _json = {'taskId': task_id, 'taskType': str(task_type),
                                 'btd': btd, 'spuId': spu_id}
                self.submit_task_completion_status(_json)  # 提交完成状态
                self.receive_task_reward(classify, task_id, task_type)  # 领取奖励
                continue

            if any(re.match(pattern, task_name) for pattern in
                   ['.*订阅.*', '.*逛一逛.*', '逛逛.*活动']):
                _json = _json = {'taskId': task_id, 'taskType': str(task_type),
                                 'btd': btd}
                self.submit_task_completion_status(_json)  # 提交完成状态
                self.receive_task_reward(classify, task_id, task_type)  # 领取奖励
                continue

            if any(re.match(pattern, task_name) for pattern in
                   ['.*逛逛.*', '浏览.*s']):
                _json = {'taskId': task_id, 'taskType': task_type, 'btd': btd}
                if self.task_commit_pre(_json):
                    myprint(f'等待16秒')
                    time.sleep(16)
                    _json = {'taskId': task_id, 'taskType': str(task_type),
                             'activityType': None, 'activityId': None,
                             'taskSetId': None, 'venueCode': None,
                             'venueUnitStyle': None, 'taskScene': None,
                             'btd': btd}
                    self.submit_task_completion_status(_json)  # 提交完成状态
                    self.receive_task_reward(classify, task_id,
                                             task_type)  # 领取奖励
                    continue

            if any(re.match(pattern, task_name) for pattern in ['.*晒图.*']):
                _json = {'taskId': task_id, 'taskType': task_type}
                if self.task_commit_pre(_json):
                    myprint(f'等待16秒')
                    time.sleep(16)
                    _json = {'taskId': task_id, 'taskType': str(task_type),
                             'activityType': None, 'activityId': None,
                             'taskSetId': None, 'venueCode': None,
                             'venueUnitStyle': None, 'taskScene': None}
                    self.submit_task_completion_status(_json)  # 提交完成状态
                    self.receive_task_reward(classify, task_id,
                                             task_type)  # 领取奖励
                    continue

            if task_name == '完成五次浇灌':
                count = tasks_dict.get('total') - tasks_dict.get(
                    'curStep')  # 还需要浇水的次数=要浇水的次数-以浇水的次数
                if self.get_droplet_number() < (count * self.waterting_g):
                    myprint(f'当前水滴不足以完成任务，跳过')
                    continue
                for _ in range(count):
                    time.sleep(0.5)
                    if not self.waterting():  # 无法浇水时退出
                        break
                else:
                    _json = {'taskId': tasks_dict['taskId'],
                             'taskType': str(tasks_dict['taskType'])}
                    if self.submit_task_completion_status(_json):
                        self.receive_task_reward(classify, task_id,
                                                 task_type)  # 领取奖励
                        continue

            if any(re.match(pattern, task_name) for pattern in
                   ['.*专场', '.*水滴大放送']):
                if self.task_obtain(task_id, task_type):
                    _json = {'taskId': task_id, 'taskType': 16}
                    if self.task_commit_pre(_json):
                        myprint(f'等待16秒')
                        time.sleep(16)
                        _json = {'taskId': task_id, 'taskType': str(task_type)}
                        self.submit_task_completion_status(_json)  # 提交完成状态
                        self.receive_task_reward(classify, task_id,
                                                 task_type)  # 领取奖励
                        continue
            myprint(f'该任务暂时无法处理，请提交日志给作者！ {tasks_dict}')

    # 执行累计任务
    def execute_cumulative_task(self):
        self.get_task_list()  # 刷新任务列表
        for task in self.cumulative_tasks_list:
            if task.get('status') == 1:
                myprint(f'开始领取累计任务数达{task.get("condition")}个的奖励')
                self.receive_cumulative_tasks_reward(task.get('condition'))
                time.sleep(1)

    # 水滴投资
    def droplet_invest(self):
        url = 'https://app.dewu.com/hacking-tree/v1/invest/info'
        response = self.session.get(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('data').get('isToday') is False:  # 可领取
            self.received_droplet_invest()
        else:
            myprint('今日已领取过水滴投资奖励了')
        time.sleep(2)
        response = self.session.get(url, headers=self.headers)
        response_dict = response.json()
        if response_dict.get('data').get('triggered') is True:  # 可投资
            url = 'https://app.dewu.com/hacking-tree/v1/invest/commit'
            response = self.session.post(url, headers=self.headers)
            response_dict = response.json()
            # myprint(response_dict)
            if response_dict.get('code') == 200 and response_dict.get(
                    'status') == 200:
                myprint('水滴投资成功，水滴-100g')
                return
            if response_dict.get("msg") == '水滴不够了':
                myprint(
                    f'水滴投资失败，剩余水滴需超过100g，{response_dict.get("msg")}')
                return
            myprint(f'水滴投资出错！ {response_dict}')
            return
        else:
            myprint('今日已经水滴投资过了！')

    # 领取水滴投资
    def received_droplet_invest(self):
        url = 'https://app.dewu.com/hacking-tree/v1/invest/receive'
        response = self.session.post(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        profit = response_dict.get('data').get('profit')
        myprint(f"领取水滴投资成功! 获得{profit}g水滴")

    # 获取助力码
    def get_share_code(self) -> str:
        url = 'https://app.dewu.com/hacking-tree/v1/keyword/gen'
        response = self.session.post(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('status') == 200:
            keyword = response_dict.get('data').get('keyword')
            keyword = re.findall('œ(.*?)œ ', keyword)
            if keyword:
                myprint(f'获取助力码成功 {keyword[0]}')
                return keyword[0]
        myprint(f'获取助力码失败！ {response_dict}')

    # 助力
    def help_user(self):
        if HELP_SIGNAL == 'False':
            myprint('助力功能已设置为关闭')
            return
        url = 'https://app.dewu.com/hacking-tree/v1/user/init'
        if self.index == 0:
            for share_code in author_share_code_list:
                _json = {'keyword': share_code}
                response = self.session.post(url, headers=self.headers,
                                             json=_json)
                response_dict = response.json()
                data = response_dict.get('data')
                if not data:
                    continue
                invite_res = data.get('inviteRes')
                if any(re.match(pattern, invite_res) for pattern in
                       ['助力成功', '助力失败，今日已助力过了']):
                    myprint(f'开始助力 {share_code}', end=' ')
                    myprint(invite_res)
                    return
                time.sleep(random.randint(20, 30) / 10)
        for share_code in share_code_list:
            myprint(f'开始助力 {share_code}', end=' ')
            _json = {'keyword': share_code}
            response = self.session.post(url, headers=self.headers, json=_json)
            response_dict = response.json()
            # myprint(response_dict)
            data = response_dict.get('data')
            if not data:
                print(f'助力异常 {response_dict}')
                continue
            invite_res = data.get('inviteRes')
            myprint(invite_res)
            if any(re.match(pattern, invite_res) for pattern in
                   ['助力成功', '助力失败，今日已助力过了']):
                return
            time.sleep(random.randint(20, 30) / 10)
        return

    # 领取助力奖励
    def receive_help_reward(self):
        url = 'https://app.dewu.com/hacking-tree/v1/invite/list'
        response = self.session.get(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('status') == 200:
            reward_list = response_dict.get('data').get('list')
            if not reward_list:
                return
            for reward in reward_list:
                if reward.get('status') != 0:  # 为0时才可以领取
                    continue
                invitee_user_id = reward.get('inviteeUserId')
                url = 'https://app.dewu.com/hacking-tree/v1/invite/reward'
                _json = {'inviteeUserId': invitee_user_id}
                response = self.session.post(url, headers=self.headers,
                                             json=_json)
                response_dict = response.json()
                if response_dict.get('status') == 200:
                    droplet = response_dict.get('data').get('droplet')
                    myprint(f'获得{droplet}g水滴')
                    # myprint(response_dict)
                    continue
                myprint(f'领取助力奖励出现未知错误！ {response_dict}')
            return
        myprint(f'获取助力列表出现未知错误！ {response_dict}')
        return

    # 领取合种上线奖励
    def receive_hybrid_online_reward(self):
        url = f'https://app.dewu.com/hacking-tree/v1/team/sign/list?teamTreeId={self.tree_id}'
        response = self.session.get(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('data') is None:
            return
        reward_list = response_dict.get('data', {}).get('list')
        if not reward_list:
            return
        for reward in reward_list:
            # 如果任务完成但是未领取
            if reward.get('isComplete') is True and reward.get(
                    'isReceive') is False:
                url = 'https://app.dewu.com/hacking-tree/v1/team/sign/receive'
                _json = {"teamTreeId": self.tree_id, "day": reward.get('day')}
                response = self.session.post(url, headers=self.headers,
                                             json=_json)
                response_dict = response.json()
                if response_dict.get('data').get('isOk') is True:
                    myprint(f'获得{reward.get("num")}g水滴')
                    continue
                myprint(f'领取合种上线奖励出现未知错误！ {response_dict}')
        return

    # 领取空中水滴
    def receive_air_drop(self):
        for _ in range(2):
            url = 'https://app.dewu.com/hacking-tree/v1/droplet/air_drop_receive'
            _json = {"clickCount": 20, "time": int(time.time())}
            response = self.session.post(url, headers=self.headers, json=_json)
            response_dict = response.json()
            # myprint(response_dict)
            data = response_dict.get('data')
            if data is not None and data.get('isOk') is True:
                myprint(f'获得{response_dict.get("data").get("droplet")}g水滴')
                time.sleep(1)
                continue
            break

    # 点击8个商品获得水滴
    def click_product(self):
        product_list = [{"spuId": 3030863, "timestamp": 1690790735382,
                         "sign": "2889b16b3077c5719288d105a14ffa1e"},
                        {"spuId": 4673547, "timestamp": 1690790691956,
                         "sign": "cc3cc95253d29a03fc6e79bfe2200143"},
                        {"spuId": 1502607, "timestamp": 1690791565022,
                         "sign": "04951eac012785ccb2600703a92c037b"},
                        {"spuId": 2960612, "timestamp": 1690791593097,
                         "sign": "fb667d45bc3950a7beb6e3fa0fc05089"},
                        {"spuId": 3143593, "timestamp": 1690791613243,
                         "sign": "82b9fda61be79f7b8833087508d6abe2"},
                        {"spuId": 3067054, "timestamp": 1690791639606,
                         "sign": "2808f3c7cf2ededea17d3f70a2dc565d"},
                        {"spuId": 4448037, "timestamp": 1690791663078,
                         "sign": "335bc519ee9183c086beb009adf93738"},
                        {"spuId": 3237561, "timestamp": 1690791692553,
                         "sign": "5c113b9203a510b7068b3cd0f6b7c25e"},
                        {"spuId": 3938180, "timestamp": 1690792014889,
                         "sign": "3841c0272443dcbbab0bcb21c94c6262"}, ]
        for product in product_list:
            url = 'https://app.dewu.com/hacking-tree/v1/product/spu'
            _json = product
            response = self.session.post(url, headers=self.headers, json=_json)
            response_dict = response.json()
            # myprint(response_dict)
            if response_dict.get('data') is None:
                myprint(f'今天已经完成过该任务了！')
                return
            if response_dict.get('data', {}).get('isReceived') is True:
                myprint(
                    f'获得{response_dict.get("data").get("dropLetReward")}g水滴')
                return
            time.sleep(1)

    # 领取发现水滴
    def receive_discover_droplet(self):
        while True:
            url = 'https://app.dewu.com/hacking-tree/v1/product/task/seek-receive'
            _json = {"sign": "9888433e6d10b514e5b5be4305d123f0",
                     "timestamp": int(time.time() * 1000)}
            response = self.session.post(url, headers=self.headers, json=_json)
            response_dict = response.json()
            myprint(response_dict)
            pass

    # 领取品牌特惠奖励
    def receive_brand_specials(self):
        url = 'https://app.dewu.com/hacking-ad/v1/activity/list?bizId=tree'
        response = self.session.get(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('data') is None:
            myprint('当前没有可以完成的任务！')
            return
        if response_dict.get('data').get('list') is None:
            myprint('当前没有可以完成的任务！')
            return
        ad_list = response_dict.get('data').get('list')
        for ad in ad_list:
            if ad.get('isReceived') is True:
                continue
            aid = ad.get('id')
            url = 'https://app.dewu.com/hacking-ad/v1/activity/receive'
            _json = {"bizId": "tree", "aid": aid}
            response = self.session.post(url, headers=self.headers, json=_json)
            response_dict = response.json()
            # myprint(response_dict)
            myprint(f'获得{response_dict.get("data").get("award")}g水滴')
            time.sleep(1)

    # 获取种树进度
    def get_tree_planting_progress(self):
        url = 'https://app.dewu.com/hacking-tree/v1/tree/get_tree_info'
        response = self.session.get(url, headers=self.headers)
        response_dict = response.json()
        # myprint(response_dict)
        if response_dict.get('code') != 200:
            myprint(f"获取种树进度失败! {response_dict}")
            return
        self.tree_id = response_dict.get('data').get('treeId')
        level = response_dict.get('data').get('level')
        current_level_need_watering_droplet = response_dict.get('data').get(
            'currentLevelNeedWateringDroplet')
        user_watering_droplet = response_dict.get('data').get(
            'userWateringDroplet')
        myprint(
            f"种树进度: {level}级 {user_watering_droplet}/{current_level_need_watering_droplet}")

    def main(self):
        character = '★★'
        name, level = self.tree_info()
        droplet_number = self.get_droplet_number()
        if not (name and level and droplet_number):
            myprint("请求数据异常！")
            return
        myprint(f'目标：{name}')
        myprint(f'剩余水滴：{droplet_number}')
        self.determine_whether_is_team_tree()  # 判断是否是团队树
        self.get_tree_planting_progress()  # 获取种树进度
        myprint(f'{character}开始签到')
        self.droplet_check_in()  # 签到
        myprint(f'{character}开始领取气泡水滴')
        self.receive_droplet_extra()
        myprint(f'{character}开始完成每日任务')
        self.execute_task()
        myprint(f'{character}开始领取累计任务奖励')
        self.execute_cumulative_task()
        myprint(f'{character}开始领取木桶水滴')
        self.judging_bucket_droplet()
        myprint(f'{character}开始多次执行浇水，领取浇水奖励')
        self.execute_receive_watering_reward()
        myprint(f'{character}开始浇水充满气泡水滴')
        self.waterting_droplet_extra()
        myprint(f'{character}开始领取合种上线奖励')
        self.receive_hybrid_online_reward()
        myprint(f'{character}开始领取空中水滴')
        self.receive_air_drop()
        myprint(f'{character}开始进行水滴投资')
        self.droplet_invest()
        myprint(f'{character}开始点击8个商品获得水滴')
        self.click_product()
        myprint(f'{character}开始领取品牌特惠奖励')
        self.receive_brand_specials()
        myprint(f'{character}开始进行助力')
        self.help_user()
        myprint(f'{character}开始领取助力奖励')
        self.receive_help_reward()
        myprint(f'{character}开始领取等级奖励')
        self.receive_level_reward()
        myprint(f'{character}开始进行浇水直到少于{self.remaining_g}g')
        self.waterting_until_less_than()
        myprint(f'剩余水滴：{self.get_droplet_number()}')
        time.sleep(1)
        self.get_tree_planting_progress()  # 获取种树进度


# 主程序
def main():
    get_version_from_github()
    get_env()
    if not ck_list:
        myprint('没有获取到账号！')
        return
    if not SK:
        myprint('dewu_sk 未填写！')
        return
    if not USER_AGENT:
        myprint('dewu_user_agent 未填写！')
        return
    _list = re.findall(r'pp/([0-9]+\.[0-9]+\.[0-9]+)', USER_AGENT)
    if not _list:
        myprint('dewu_user_agent 中无法匹配到得物app版本号，重新抓个试试吧')
        return
    download_author_share_code()
    myprint(f'获取到{len(ck_list)}个账号！')
    if HELP_SIGNAL == 'True':
        myprint('开始获取所有账号助力码')
        for index, ck in enumerate(ck_list):
            myprint(f'第{index + 1}个账号：', end='')
            share_code_list.append(DeWu(ck, index).get_share_code())
            time.sleep(0.5)
    for index, ck in enumerate(ck_list):
        myprint(f'*****第{index + 1}个账号*****')
        DeWu(ck, index).main()
        myprint('')
    send_notification_message(title='得物森林')  # 发送通知消息


if __name__ == '__main__':
    main()
    sys.exit()
