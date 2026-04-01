"""

顺丰33周年活动 - 完成任务抽勋章
Author: 爱学习的呆子
Version: 1.1.0
Date: 2026-03-19

顺丰暗号环境变量：sfsyah

"""

import hashlib
import json
import os
import random
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from urllib.parse import unquote
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning

# 禁用SSL警告
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
inviteId = ['C6E5C3BDD7624520AB869D2AF9E75D95']

# ==================== 配置常量 ====================
PROXY_TIMEOUT = 15
MAX_PROXY_RETRIES = 5
REQUEST_RETRY_COUNT = 3
CONCURRENT_NUM = int(os.getenv('SFBF', '1'))
if CONCURRENT_NUM > 20:
    CONCURRENT_NUM = 20
elif CONCURRENT_NUM < 1:
    CONCURRENT_NUM = 1

print_lock = Lock()

# 周年活动配置
ACTIVITY_CODE = "ANNIVERSARY_2026"
TOKEN = 'wwesldfs29aniversaryvdld29'
SYS_CODE = 'MCS-MIMP-CORE'

# 暗号环境变量（可选，不设置则自动从API获取答案）
GUESS_ANSWER_ENV = 'sfsyah'

# 需要跳过的任务类型（需要实际操作的）
SKIP_TASK_TYPES = [
    'BUY_ADD_VALUE_SERVICE_PACKET',     # 通过服务套餐寄件
    'SEND_INTERNATIONAL_PACKAGE',       # 寄一单国际件
    'LOOK_BIG_PACKAGE_GET_CASH',        # 寄大件重货
    'SEND_SUCCESS_RECALL',              # 去寄快递
    'CHARGE_NEW_EXPRESS_CARD',          # 充值新速运通全国卡
    'CHARGE_COLLECT_ALL',               # 充值1000元一键集齐
    'OPEN_FAMILY_HOME_MUTUAL',          # 开通家庭8折互寄权益
    'BUY_ANNIVERSARY_LIMITED_PACKET',   # 33周年宠粉券包
    # 'INTEGRAL_EXCHANGE',                # 积分兑换抽勋章次数（已特殊处理）
]


# ==================== 日志 ====================
class Logger:
    def __init__(self):
        self.messages: List[str] = []
        self.lock = Lock()

    def _log(self, icon: str, msg: str):
        line = f"{icon} {msg}"
        with print_lock:
            print(line)
        with self.lock:
            self.messages.append(line)

    def info(self, msg): self._log('📝', msg)
    def success(self, msg): self._log('✅', msg)
    def warning(self, msg): self._log('⚠️', msg)
    def error(self, msg): self._log('❌', msg)
    def task(self, msg): self._log('🎯', msg)
    def medal(self, msg): self._log('🏅', msg)


# ==================== 代理管理器 ====================
class ProxyManager:
    def __init__(self, api_url: str):
        self.api_url = api_url

    def get_proxy(self) -> Optional[Dict[str, str]]:
        try:
            if not self.api_url:
                return None
            response = requests.get(self.api_url, timeout=10)
            if response.status_code == 200:
                proxy_text = response.text.strip()
                if ':' in proxy_text:
                    proxy = proxy_text if proxy_text.startswith('http') else f'http://{proxy_text}'
                    # 隐藏认证信息用于显示
                    display = proxy
                    if '@' in proxy:
                        parts = proxy.split('@')
                        display = f"http://***:***@{parts[-1]}"
                    with print_lock:
                        print(f"✅ 获取代理: {display}")
                    return {'http': proxy, 'https': proxy}
            with print_lock:
                print(f"❌ 获取代理失败: HTTP {response.status_code}")
            return None
        except Exception as e:
            with print_lock:
                print(f"❌ 获取代理异常: {str(e)[:100]}")
            return None


# ==================== HTTP客户端 ====================
class SFHttpClient:
    def __init__(self, proxy_manager: ProxyManager):
        self.proxy_manager = proxy_manager
        self.session = requests.Session()
        self.session.verify = False

        proxy = self.proxy_manager.get_proxy()
        if proxy:
            self.session.proxies = proxy
        else:
            if self.proxy_manager.api_url:
                with print_lock:
                    print("⚠️ 代理获取失败，将不使用代理")

        self.headers = {
            'Host': 'mcs-mimp-web.sf-express.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf254173b) XWEB/19027',
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'channel': 'xcxpart',
            'platform': 'MINI_PROGRAM',
            'accept-language': 'zh-CN,zh;q=0.9',
        }

    def _generate_sign(self) -> Dict[str, str]:
        timestamp = str(int(round(time.time() * 1000)))
        data = f'token={TOKEN}&timestamp={timestamp}&sysCode={SYS_CODE}'
        signature = hashlib.md5(data.encode()).hexdigest()
        return {
            'syscode': SYS_CODE,
            'timestamp': timestamp,
            'signature': signature,
        }

    def request(self, url: str, data: Optional[Dict] = None, method: str = 'POST') -> Optional[Dict]:
        retry_count = 0
        proxy_retry_count = 0

        while proxy_retry_count < MAX_PROXY_RETRIES:
            # 每次请求重新生成签名
            sign_data = self._generate_sign()
            headers = {**self.headers, **sign_data}

            try:
                if method == 'POST':
                    resp = self.session.post(url, headers=headers, json=data or {}, timeout=PROXY_TIMEOUT)
                else:
                    resp = self.session.get(url, headers=headers, timeout=PROXY_TIMEOUT)
                resp.raise_for_status()

                try:
                    result = resp.json()
                    if result is None:
                        retry_count += 1
                        if retry_count < REQUEST_RETRY_COUNT:
                            time.sleep(2)
                            continue
                        return None
                    return result
                except (json.JSONDecodeError, ValueError):
                    retry_count += 1
                    if retry_count < REQUEST_RETRY_COUNT:
                        time.sleep(2)
                        continue
                    return None

            except requests.exceptions.RequestException as e:
                retry_count += 1
                error_str = str(e)

                # 代理相关错误，切换代理
                if 'ProxyError' in error_str or 'SSLError' in error_str or 'ConnectionError' in error_str:
                    proxy_retry_count += 1
                    if proxy_retry_count < MAX_PROXY_RETRIES:
                        new_proxy = self.proxy_manager.get_proxy()
                        if new_proxy:
                            self.session.proxies = new_proxy
                        retry_count = 0  # 换代理后重置请求重试计数
                    time.sleep(2)
                    continue

                # 普通请求错误，重试
                if retry_count < REQUEST_RETRY_COUNT:
                    time.sleep(2)
                    continue
                return None

            except Exception:
                return None

        return None

    def login(self, url: str) -> tuple:
        """登录（兼容URL和CK格式）"""
        try:
            decoded_input = unquote(url)
            if decoded_input.startswith('sessionId=') or '_login_mobile_=' in decoded_input:
                cookie_dict = {}
                for item in decoded_input.split(';'):
                    item = item.strip()
                    if '=' in item:
                        k, v = item.split('=', 1)
                        cookie_dict[k] = v
                for k, v in cookie_dict.items():
                    self.session.cookies.set(k, v, domain='mcs-mimp-web.sf-express.com')
                user_id = cookie_dict.get('_login_user_id_', '')
                phone = cookie_dict.get('_login_mobile_', '')
                return (True, user_id, phone) if phone else (False, '', '')
            else:
                self.session.get(unquote(url), headers=self.headers, timeout=PROXY_TIMEOUT)
                cookies = self.session.cookies.get_dict()
                user_id = cookies.get('_login_user_id_', '')
                phone = cookies.get('_login_mobile_', '')
                return (True, user_id, phone) if phone else (False, '', '')
        except Exception as e:
            print(f'登录异常: {str(e)}')
            return False, '', ''


# ==================== 周年活动任务执行器 ====================
class AnniversaryExecutor:
    # MODIFIED: 增加 user_id 参数
    def __init__(self, http: SFHttpClient, logger: Logger, user_id: str):
        self.http = http
        self.logger = logger
        self.user_id = user_id

    # ---------- API 方法 ----------

    def get_activity_index(self) -> Optional[Dict]:
        """获取周年活动首页信息"""
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~anniversary2026IndexService~index'
        resp = self.http.request(url, data={})
        if resp and resp.get('success'):
            return resp.get('obj', {})
        return None

    def get_task_list(self) -> Optional[List[Dict]]:
        """获取周年活动任务列表"""
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~activityTaskService~taskList'
        data = {
            "activityCode": ACTIVITY_CODE,
            "channelType": "MINI_PROGRAM"
        }
        resp = self.http.request(url, data=data)
        if resp and resp.get('success'):
            return resp.get('obj', [])
        else:
            error_msg = resp.get('errorMessage', '未知错误') if resp else '请求失败'
            self.logger.error(f'获取任务列表失败: {error_msg}')
            return None

    def finish_task(self, task_code: str) -> bool:
        """完成任务（浏览类）"""
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonRoutePost/memberEs/taskRecord/finishTask'
        data = {"taskCode": task_code}
        resp = self.http.request(url, data=data)
        if resp and resp.get('success'):
            return True
        return False

    # ========== 新增：专用接口-领取寄件会员权益 ==========
    def receive_vip_benefit(self) -> bool:
        """领取寄件会员权益（特殊任务）"""
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberManage~memberEquity~commonEquityReceive'
        data = {"key": "surprise_benefit"}
        resp = self.http.request(url, data=data)
        if resp and resp.get('success'):
            self.logger.success(f'[领取寄件会员权益] 完成成功')
            # 可选：解析返回的奖励信息
            if resp.get('obj'):
                self.logger.info(f'领取详情: {resp["obj"]}')
            return True
        else:
            error_msg = resp.get('errorMessage', '未知错误') if resp else '请求失败'
            self.logger.warning(f'[领取寄件会员权益] 完成失败: {error_msg}')
            return False
    # =================================================

    def fetch_tasks_reward(self) -> Optional[Dict]:
        """领取已完成任务的奖励（获得抽勋章次数）"""
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~anniversary2026TaskService~fetchTasksReward'
        data = {
            "channelType": "MINI_PROGRAM",
            "activityCode": ACTIVITY_CODE
        }
        resp = self.http.request(url, data=data)
        if resp and resp.get('success'):
            return resp.get('obj', {})
        else:
            error_msg = resp.get('errorMessage', '未知错误') if resp else '请求失败'
            self.logger.warning(f'领取任务奖励失败: {error_msg}')
            return None

    def get_card_status(self) -> Optional[Dict]:
        """查看勋章收集状态"""
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~anniversary2026CardService~cardStatus'
        resp = self.http.request(url, data={})
        if resp and resp.get('success'):
            return resp.get('obj', {})
        return None

    def claim_medal(self, batch: bool = False) -> Optional[Dict]:
        """抽勋章"""
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~anniversary2026CardService~claim'
        data = {"batchClaim": batch}
        resp = self.http.request(url, data=data)
        if resp and resp.get('success'):
            return resp.get('obj', {})
        else:
            error_msg = resp.get('errorMessage', '未知错误') if resp else '请求失败'
            self.logger.error(f'抽勋章失败: {error_msg}')
            return None

    def give_countdown_chance(self) -> Optional[Dict]:
        """领取倒计时奖励（每日一次免费抽勋章机会）"""
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~anniversary2026CardService~giveClaimChance'
        resp = self.http.request(url, data={})
        if resp and resp.get('success'):
            return resp.get('obj', {})
        else:
            error_msg = resp.get('errorMessage', '未知错误') if resp else '请求失败'
            self.logger.warning(f'领取倒计时奖励失败: {error_msg}')
            return None

    def get_user_rest_integral(self) -> int:
        """查询用户剩余积分"""
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~activityTaskService~getUserRestIntegral'
        resp = self.http.request(url, data={})
        if resp and resp.get('success'):
            points = resp.get('obj', 0)
            self.logger.info(f'当前可用积分: {points}')
            return points
        return 0

    def exchange_points_for_chance(self) -> bool:
        """积分兑换抽勋章次数（10积分兑1次）"""
        points = self.get_user_rest_integral()
        if points < 10:
            self.logger.warning(f'积分不足10，无法兑换（当前: {points}）')
            return False

        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~anniversary2026TaskService~integralExchange'
        data = {
            "exchangeNum": 1,                # 一次兑换1次机会
            "activityCode": ACTIVITY_CODE    # 当前活动码
        }

        resp = self.http.request(url, data=data)
        if resp and resp.get('success'):
            self.logger.success('积分兑换成功，获得1次抽勋章次数')
            return True
        else:
            error_msg = resp.get('errorMessage', '未知错误') if resp else '请求失败'
            self.logger.warning(f'积分兑换失败: {error_msg}')
            return False

    def get_guess_title_list(self) -> Optional[Dict]:
        """获取对暗号题目列表（含答案）"""
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~anniversary2026GuessService~titleList'
        resp = self.http.request(url, data={})
        if resp and resp.get('success'):
            return resp.get('obj', {})
        return None

    def submit_guess_answer(self, answer: str, period: str = '') -> Optional[Dict]:
        """提交暗号答案，返回完整响应"""
        url = 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~anniversary2026GuessService~answer'
        data = {"answerInfo": answer}
        if period:
            data["period"] = period
        resp = self.http.request(url, data=data)
        if resp:
            self.logger.info(f'[对暗号] 提交响应: {json.dumps(resp, ensure_ascii=False)[:300]}')
            if resp.get('success'):
                obj = resp.get('obj', {})
                # 检查obj中是否有失败标志
                if isinstance(obj, dict) and obj.get('answerStatus') == 0:
                    self.logger.warning(f'[对暗号] 答案错误')
                    return None
                return obj
            else:
                error_msg = resp.get('errorMessage', '未知错误')
                self.logger.warning(f'提交暗号失败: {error_msg}')
                return None
        else:
            self.logger.warning(f'提交暗号失败: 请求失败')
            return None

    # ---------- 新增：邀请初始化 ----------
    def do_invite(self):
        """发送邀请初始化请求（借鉴自第二段代码）"""
        try:
            # 从全局 inviteId 列表中排除自己的 user_id
            available_invites = [inv for inv in inviteId if inv != self.user_id]
            if not available_invites:
                self.logger.warning("没有可用的邀请码（排除自身后为空），跳过邀请")
                return
            random_invite = random.choice(available_invites)
            # self.logger.info(f"随机选择邀请码: {random_invite} (排除自身 {self.user_id})")
            # 构造邀请请求 URL，使用 commonNoLoginPost
            url = "https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~anniversary2026IndexService~index"
            data = {"inviteType": 1, "inviteUserId": random_invite}
            resp = self.http.request(url, data=data)
            # if resp and resp.get('success'):
            #     self.logger.success(f"邀请初始化成功，邀请码: {random_invite}")
            # else:
            #     error_msg = resp.get('errorMessage', '未知错误') if resp else '请求失败'
            #     self.logger.warning(f"邀请初始化失败: {error_msg}")
        except Exception as e:
            self.logger.error(f"邀请初始化异常: {str(e)}")

    # ---------- 业务逻辑 ----------

    def do_guess_game(self) -> bool:
        """对暗号任务：读取所有日期的题目，按顺序匹配环境变量中的暗号逐日提交"""
        self.logger.task('[对暗号赢免单] 开始...')

        # 1. 获取题目列表
        guess_info = self.get_guess_title_list()
        if not guess_info:
            self.logger.warning('[对暗号] 获取题目列表失败')
            return False

        current_period = guess_info.get('currentPeriod', '')
        title_list = guess_info.get('guessTitleInfoList', [])

        if not title_list:
            self.logger.warning('[对暗号] 题目列表为空')
            return False

        # 按日期排序
        title_list.sort(key=lambda x: x.get('period', ''))

        self.logger.info(f'[对暗号] 共 {len(title_list)} 天题目，当前日期: {current_period}')

        # 2. 读取环境变量中的暗号列表（每行一个，按日期顺序对应）
        env_answers_raw = os.getenv(GUESS_ANSWER_ENV, '').strip()
        env_answers = [a.strip() for a in env_answers_raw.split('\n') if a.strip()] if env_answers_raw else []

        if env_answers:
            self.logger.info(f'[对暗号] 环境变量已设置 {len(env_answers)} 个暗号')

        # 3. 逐日处理
        any_success = False
        for i, title in enumerate(title_list):
            period = title.get('period', '')
            answer_status = title.get('answerStatus')
            tip = title.get('tip', '')

            # 已答过的跳过
            if answer_status == 1:
                self.logger.success(f'[对暗号] {period} 已作答: {title.get("answerInfo", "")}')
                any_success = True
                continue

            # 超过当前日期的不处理（未来题目）
            if period > current_period:
                self.logger.info(f'[对暗号] {period} 尚未开放，跳过')
                continue

            # 获取答案：优先环境变量按顺序匹配，其次API返回的answerInfo
            answer = ''
            if i < len(env_answers):
                answer = env_answers[i]
            if not answer:
                answer = title.get('answerInfo', '')

            if not answer:
                self.logger.warning(f'[对暗号] {period} 无法获取答案（提示: {tip}）')
                self.logger.info(f'[对暗号] 请在环境变量 {GUESS_ANSWER_ENV} 第 {i + 1} 行填写该日暗号')
                continue

            self.logger.info(f'[对暗号] {period} 提交答案: {answer}')

            # 提交答案
            result = self.submit_guess_answer(answer, period)
            if result is not None:
                # 提交后重新获取题目列表验证是否真的成功
                time.sleep(1)
                verify_info = self.get_guess_title_list()
                if verify_info:
                    for t in verify_info.get('guessTitleInfoList', []):
                        if t.get('period') == period:
                            if t.get('answerStatus') == 1:
                                self.logger.success(f'[对暗号] {period} 验证通过，答案已录入: {t.get("answerInfo", "")}')
                                any_success = True
                            else:
                                self.logger.warning(f'[对暗号] {period} 验证失败，答案未被采纳 (answerStatus={t.get("answerStatus")})')
                            break
                else:
                    self.logger.success(f'[对暗号] {period} 提交成功（未能验证）')
                    any_success = True
            else:
                self.logger.warning(f'[对暗号] {period} 提交失败')

            time.sleep(1)

        return any_success

    def do_tasks(self, result: Dict) -> None:
        """执行所有可自动完成的任务"""
        self.logger.info('正在获取周年活动任务列表...')
        tasks = self.get_task_list()
        if tasks is None:
            return

        self.logger.info(f'共发现 {len(tasks)} 个任务')

        for task in tasks:
            task_name = task.get('taskName', '未知')
            task_type = task.get('taskType', '')
            task_code = task.get('taskCode', '')
            status = task.get('status')
            process = task.get('process', '')
            rest_finish = task.get('restFinishTime', 0)
            virtual_token = task.get('virtualTokenNum', 0)

            # status=3 表示已完成且已领奖，status=1且restFinishTime=0表示已完成待领奖
            if status == 3 or (status == 1 and rest_finish <= 0):
                can_receive = task.get('canReceiveTokenNum', 0)
                if can_receive > 0:
                    self.logger.info(f'[{task_name}] 已完成，待领取 {can_receive} 次抽勋章机会')
                else:
                    self.logger.success(f'[{task_name}] 已完成 ({process})')
                continue

            if task_type in SKIP_TASK_TYPES:
                self.logger.info(f'[{task_name}] 需要实际操作，跳过')
                continue

            # 对暗号单独处理
            if task_type == 'GUESS_GAME_TIP':
                if self.do_guess_game():
                    result['tasks_completed'] += 1
                continue

            # 积分兑换特殊处理
            if task_type == 'INTEGRAL_EXCHANGE':
                self.logger.task(f'[{task_name}] 尝试用积分兑换抽勋章次数...')
                if self.exchange_points_for_chance():
                    self.logger.success(f'[{task_name}] 积分兑换成功')
                    result['tasks_completed'] += 1
                continue

            # ========== 新增：领取寄件会员权益特殊处理 ==========
            if task_type == 'RECEIVE_VIP_BENEFIT':
                self.logger.task(f'[{task_name}] 尝试专用接口领取...')
                if self.receive_vip_benefit():
                    result['tasks_completed'] += 1
                continue
            # =================================================

            # 有taskCode的任务尝试自动完成（通用接口）
            if task_code:
                self.logger.task(f'[{task_name}] 尝试完成任务 (taskCode: {task_code})')
                if self.finish_task(task_code):
                    self.logger.success(f'[{task_name}] 完成成功，可获得 {virtual_token} 次抽勋章机会')
                    result['tasks_completed'] += 1
                else:
                    self.logger.warning(f'[{task_name}] 完成失败')
                time.sleep(1)
            else:
                self.logger.info(f'[{task_name}] 无taskCode，跳过 ({task_type})')

    def do_fetch_rewards(self, result: Dict) -> None:
        """领取所有已完成任务的奖励"""
        self.logger.info('领取任务奖励...')
        time.sleep(1)
        reward_resp = self.fetch_tasks_reward()
        if reward_resp:
            received = reward_resp.get('receivedAccountList', [])
            if received:
                for item in received:
                    currency = item.get('currency', '')
                    amount = item.get('amount', 0)
                    task_type = item.get('taskType', '')
                    self.logger.success(f'领取奖励: {currency} x{amount} (来自: {task_type})')
            else:
                self.logger.info('无新的任务奖励可领取')

            # 显示累计进度
            accrued = reward_resp.get('accruedTaskAward', {})
            progress = accrued.get('currentProgress', 0)
            config = accrued.get('progressConfig', {})
            if config:
                milestones = ', '.join([f'{k}个任务得{v}次' for k, v in sorted(config.items(), key=lambda x: int(x[0]))])
                self.logger.info(f'累计完成任务数: {progress} (里程碑: {milestones})')

    def do_countdown_chance(self, result: Dict) -> None:
        """领取倒计时奖励（每日免费抽勋章机会）"""
        self.logger.info('领取倒计时奖励...')
        time.sleep(1)
        resp = self.give_countdown_chance()
        if resp:
            if resp.get('todayCountdownChanceGiven'):
                received = resp.get('receivedAccountList', [])
                if received:
                    for item in received:
                        currency = item.get('currency', '')
                        amount = item.get('amount', 0)
                        self.logger.success(f'倒计时奖励: {currency} x{amount}')
                else:
                    self.logger.success('倒计时奖励已领取')
            else:
                self.logger.info('今日倒计时奖励未到领取时间')
        else:
            self.logger.warning('倒计时奖励领取失败')


    def do_claim_medals(self, result: Dict) -> None:
        """抽勋章直到没有次数"""
        # 先查看当前状态
        card_status = self.get_card_status()
        if card_status:
            claim_balance = 0
            for acc in card_status.get('currentAccountList', []):
                if acc.get('currency') == 'CLAIM_CHANCE':
                    claim_balance = acc.get('balance', 0)
                    break
            self.logger.info(f'当前可抽勋章次数: {claim_balance}')

            # 显示已有勋章
            medals_owned = []
            for acc in card_status.get('currentAccountList', []):
                currency = acc.get('currency', '')
                balance = acc.get('balance', 0)
                if currency != 'CLAIM_CHANCE' and balance > 0:
                    medals_owned.append(f'{currency}x{balance}')
            if medals_owned:
                self.logger.info(f'已有勋章: {", ".join(medals_owned)}')

            if claim_balance <= 0:
                self.logger.info('无抽勋章次数，跳过')
                return

        # 开始抽勋章
        self.logger.info('开始抽勋章...')
        claim_count = 0
        max_claims = 30

        while claim_count < max_claims:
            time.sleep(1)
            claim_result = self.claim_medal(batch=False)
            if claim_result is None:
                break

            received = claim_result.get('receivedAccountList', [])
            current_accounts = claim_result.get('currentAccountList', [])

            if received:
                for item in received:
                    currency = item.get('currency', '未知')
                    amount = item.get('amount', 0)
                    self.logger.medal(f'抽到勋章: {currency} x{amount}')
                    result['medals_detail'].append({'type': currency, 'amount': amount})
                    result['medals_claimed'] += amount
                claim_count += 1
            else:
                self.logger.info('没有抽到勋章或无抽取次数')
                break

            # 检查剩余次数
            claim_balance = 0
            for acc in current_accounts:
                if acc.get('currency') == 'CLAIM_CHANCE':
                    claim_balance = acc.get('balance', 0)
                    break

            result['claim_balance'] = claim_balance
            self.logger.info(f'剩余抽取次数: {claim_balance}')

            if claim_balance <= 0:
                break

        self.logger.info(f'抽勋章完成，本次共抽取 {result["medals_claimed"]} 个勋章')

    def run(self) -> Dict[str, Any]:
        """执行周年活动全流程"""
        result = {
            'tasks_completed': 0,
            'medals_claimed': 0,
            'medals_detail': [],
            'claim_balance': 0,
        }

        # MODIFIED: 在任务开始前先发送邀请
        self.do_invite()

        # 0. 获取活动首页信息
        index_info = self.get_activity_index()
        if index_info:
            self.logger.info(f'活动时间: {index_info.get("acStartTime", "")} ~ {index_info.get("acEndTime", "")}')
            self.logger.info(f'历史寄件数: {index_info.get("sendNum", 0)}，累计支付: {index_info.get("payAmount", 0)}元')

        # 1. 执行任务（含对暗号）
        self.do_tasks(result)

        # 2. 领取任务奖励（获得抽勋章次数）
        self.do_fetch_rewards(result)

        # 3. 抽勋章
        self.do_claim_medals(result)

        return result


# ==================== 账号执行 ====================
def run_account(account_url: str, index: int) -> Dict[str, Any]:
    """执行单个账号"""
    logger = Logger()
    proxy_url = os.getenv('SF_PROXY_API_URL', '')
    proxy_manager = ProxyManager(proxy_url)

    # 登录
    http = SFHttpClient(proxy_manager)
    retry_count = 0
    login_success = False
    phone = ''
    user_id = ''

    while retry_count < MAX_PROXY_RETRIES and not login_success:
        try:
            if retry_count > 0:
                http = SFHttpClient(proxy_manager)
            success, user_id, phone = http.login(account_url)
            if success:
                login_success = True
                break
        except Exception as e:
            pass
        retry_count += 1
        if retry_count < MAX_PROXY_RETRIES:
            time.sleep(2)

    if not login_success:
        logger.error(f'账号{index + 1} 登录失败')
        return {'success': False, 'phone': '', 'index': index,
                'tasks_completed': 0, 'medals_claimed': 0, 'medals_detail': [], 'claim_balance': 0}

    masked_phone = phone[:3] + "****" + phone[7:] if len(phone) >= 7 else phone
    logger.success(f'账号{index + 1}: 【{masked_phone}】登录成功')

    # 随机延迟
    time.sleep(random.uniform(1, 3))

    # MODIFIED: 将 user_id 传递给 AnniversaryExecutor
    executor = AnniversaryExecutor(http, logger, user_id)
    activity_result = executor.run()

    return {
        'success': True,
        'phone': phone,
        'index': index,
        **activity_result,
    }


# ==================== 主程序 ====================
def main():
    env_name = 'sfsyUrl'
    env_value = os.getenv(env_name)
    if not env_value:
        print(f"❌ 未找到环境变量 {env_name}，请检查配置")
        return

    account_urls = [url.strip() for url in env_value.split('&') if url.strip()]
    if not account_urls:
        print(f"❌ 环境变量 {env_name} 为空或格式错误")
        return

    # 暗号提示
    guess_answer = os.getenv(GUESS_ANSWER_ENV, '')
    if guess_answer:
        answer_lines = [a.strip() for a in guess_answer.strip().split('\n') if a.strip()]
        print(f"🔑 已设置暗号环境变量，共 {len(answer_lines)} 个暗号（按日期顺序对应）")
        for i, a in enumerate(answer_lines):
            print(f"   第{i+1}天: {a}")
    else:
        print(f"🔑 未设置暗号环境变量({GUESS_ANSWER_ENV})，将自动从API获取答案")

    random.shuffle(account_urls)

    print("=" * 60)
    print(f"🎉 顺丰33周年活动 - 完成任务抽勋章")
    print(f"👨‍💻 作者: 爱学习的呆子")
    print(f"📱 共获取到 {len(account_urls)} 个账号")
    print(f"⚙️ 并发数量: {CONCURRENT_NUM}")
    print(f"⏰ 执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    all_results = []

    if CONCURRENT_NUM <= 1:
        for idx, url in enumerate(account_urls):
            result = run_account(url, idx)
            all_results.append(result)
            if idx < len(account_urls) - 1:
                print("-" * 60)
                time.sleep(2)
    else:
        with ThreadPoolExecutor(max_workers=CONCURRENT_NUM) as pool:
            futures = {pool.submit(run_account, url, idx): idx for idx, url in enumerate(account_urls)}
            for future in as_completed(futures):
                all_results.append(future.result())

    all_results.sort(key=lambda x: x['index'])

    # 汇总
    print(f"\n" + "=" * 70)
    print(f"📊 周年活动汇总")
    print("=" * 70)
    print(f"{'序号':<6} {'手机号':<15} {'完成任务数':<12} {'抽到勋章数':<12} {'勋章详情':<20}")
    print("-" * 70)

    total_tasks = 0
    total_medals = 0

    for r in all_results:
        idx = r['index'] + 1
        phone = r['phone'][:3] + "****" + r['phone'][7:] if r.get('phone') and len(r['phone']) >= 7 else r.get('phone', '未登录')
        tasks = r.get('tasks_completed', 0)
        medals = r.get('medals_claimed', 0)
        detail = ', '.join([f"{d['type']}x{d['amount']}" for d in r.get('medals_detail', [])]) or '无'
        status = "✅" if r['success'] else "❌"

        total_tasks += tasks
        total_medals += medals

        print(f"{idx:<6} {phone:<15} {tasks:<12} {medals:<12} {detail:<20} {status}")

    print("-" * 70)
    print(f"{'汇总':<6} {'账号: ' + str(len(all_results)):<15} {total_tasks:<12} {total_medals:<12}")
    print("=" * 70)
    print("\n🎊 所有账号执行完成!")


if __name__ == '__main__':
    main()