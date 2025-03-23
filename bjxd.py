"""
北京现代 APP 自动任务脚本
功能：自动完成签到、浏览文章、每日答题等任务
new Env("北京现代")
cron: 25 6 * * *

环境变量：
    BJXD_DEVICE  安卓写android 苹果IOS写iOS
    BJXD: str - 北京现代 APP api token (多个账号用英文逗号分隔，建议每个账号一个变量)
    BJXD1/BJXD2/BJXD3: str - 北京现代 APP api token (每个账号一个变量)
    BJXD_ANSWER: str - 预设答案 (可选, ABCD 中的一个)
    HUNYUAN_API_KEY: str - 腾讯混元AI APIKey (可选)

cron: 25 6 * * *
"""

import os
import random
import time
from datetime import datetime
from typing import List, Dict, Any
import requests
from urllib3.exceptions import InsecureRequestWarning, InsecurePlatformWarning

# 禁用 SSL 警告
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
requests.packages.urllib3.disable_warnings(InsecurePlatformWarning)


class BeiJingHyundai:
    """北京现代APP自动任务类"""

    # 基础配置
    NAME = "北京现代 APP 自动任务"
    BASE_URL = "https://bm2-api.bluemembers.com.cn"

    # API endpoints
    API_USER_INFO = "/v1/app/account/users/info"
    API_MY_SCORE = "/v1/app/user/my_score"
    API_TASK_LIST = "/v1/app/user/task/list"
    API_SIGN_LIST = "/v1/app/user/reward_list"
    API_SIGN_SUBMIT = "/v1/app/user/reward_report"
    API_ARTICLE_LIST = "/v1/app/white/article/list2"
    API_ARTICLE_DETAIL = "/v1/app/white/article/detail_app/{}"
    API_ARTICLE_SCORE_SUBMIT = "/v1/app/score"
    API_QUESTION_INFO = "/v1/app/special/daily/ask_info"
    API_QUESTION_SUBMIT = "/v1/app/special/daily/ask_answer"

    # 预设的备用 share_user_hid 列表
    BACKUP_HIDS = [
        "a6688ec1a9ee429fa7b68d50e0c92b1f",
        "bb8cd2e44c7b45eeb8cc5f7fa71c3322",
        "5f640c50061b400c91be326c8fe0accd",
        "55a5d82dacd9417483ae369de9d9b82d",
    ]

    def __init__(self):
        """初始化实例变量"""
        self.token: str = ""  # 当前用户token
        self.user: Dict[str, Any] = {}  # 当前用户信息
        self.users: List[Dict[str, Any]] = []  # 所有用户信息列表
        self.correct_answer: str = ""  # 正确答案
        self.preset_answer: str = ""  # 预设答案
        self.ai_api_key: str = ""  # 腾讯混元AI APIKey
        self.wrong_answers: set = set()  # 错误答案集合
        self.log_content: str = ""  # 日志内容

    def log(self, content: str, print_to_console: bool = True) -> None:
        """添加日志"""
        if print_to_console:
            print(content)
        self.log_content += content + "\n"

    def push_notification(self) -> None:
        """推送通知"""
        try:
            QLAPI.notify(self.NAME, self.log_content)
        except NameError:
            print(f"\n\n🚀 推送通知\n\n{self.NAME}\n\n{self.log_content}")

    def make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """
        发送API请求
        Args:
            method: 请求方法 (GET/POST)
            endpoint: API端点
            **kwargs: 请求参数
        Returns:
            Dict[str, Any]: API响应数据
        """
        url = f"{self.BASE_URL}{endpoint}"
        headers = {"token": self.token, "device": os.getenv("BJXD_DEVICE", "android")}
        if "headers" not in kwargs:
            kwargs["headers"] = headers
        else:
            kwargs["headers"].update(headers)
        try:
            response = requests.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            self.log(f"❌ API request failed: {str(e)}")
            return {"code": -1, "msg": str(e)}

    def get_user_info(self) -> Dict[str, Any]:
        """
        获取用户信息
        Returns:
            Dict[str, Any]: 用户信息字典，获取失败返回空字典
        """
        response = self.make_request("GET", self.API_USER_INFO)
        print(f"get_user_info API response ——> {response}")

        if response["code"] == 0:
            data = response["data"]
            # 直接生成掩码后的手机号
            masked_phone = f"{data['phone'][:3]}******{data['phone'][-2:]}"
            return {
                "token": self.token,
                "hid": data["hid"],
                "nickname": data["nickname"],
                "phone": masked_phone,  # 直接存储掩码后的手机号
                "score_value": data["score_value"],
                "share_user_hid": "",
                "task": {"sign": False, "view": False, "question": False},
            }

        self.log(f"❌ 账号已失效, 请重新获取 token: {self.token}")
        return {}

    def get_score_details(self) -> None:
        """显示积分详情，包括总积分、今日变动和最近记录"""
        params = {"page_no": "1", "page_size": "10"}  # 获取最近10条记录
        response = self.make_request("GET", self.API_MY_SCORE, params=params)
        print(f"get_score_details API response ——> {response}")

        if response["code"] == 0:
            data = response["data"]
            # 先获取今日记录
            today = datetime.now().strftime("%Y-%m-%d")
            today_records = [
                record
                for record in data["points_record"]["list"]
                if record["created_at"].startswith(today)
            ]

            # 计算今日积分变化
            today_score = sum(
                int(record["score_str"].strip("+")) for record in today_records
            )
            today_score_str = f"+{today_score}" if today_score > 0 else str(today_score)
            self.log(f"🎉 总积分: {data['score']} | 今日积分变动: {today_score_str}")

            # 输出今日积分记录
            if today_records:
                self.log("今日积分记录：")
                for record in today_records:
                    self.log(
                        f"{record['created_at']} {record['desc']} {record['score_str']}"
                    )
            else:
                self.log("今日暂无积分变动")

    # 任务相关
    def check_task_status(self, user: Dict[str, Any]) -> None:
        """检查任务状态"""
        response = self.make_request("GET", self.API_TASK_LIST)
        print(f"get_task_status API response ——> {response}")

        if response["code"] != 0:
            self.log(f'❌ 获取任务列表失败: {response["msg"]}')
            return

        actions = response.get("data", {})

        # 检查签到任务
        if "action4" in actions:
            user["task"]["sign"] = actions["action4"].get("status") == 1
        else:
            self.log("❌ task list action4 签到任务 不存在")

        # 检查浏览文章任务
        if "action12" in actions:
            user["task"]["view"] = actions["action12"].get("status") == 1
        else:
            self.log("❌ task list action12 浏览文章任务 不存在")

        # 检查答题任务
        if "action39" in actions:
            user["task"]["question"] = actions["action39"].get("status") == 1
        else:
            self.log("❌ task list action39 答题任务 不存在")

    # 签到相关
    def get_sign_info(self) -> None:
        """执行签到任务"""
        max_attempts = 5  # 最大尝试次数
        best_score = 0
        best_params = None

        for attempt in range(max_attempts):
            response = self.make_request("GET", self.API_SIGN_LIST)
            print(f"get_sign_info (attempt {attempt + 1}) API response ——> {response}")

            if response["code"] != 0:
                self.log(f'❌ 获取签到列表失败: {response["msg"]}')
                break

            data = response["data"]
            hid = data["hid"]
            reward_hash = data["rewardHash"]

            for item in data["list"]:
                if item["hid"] == hid:
                    current_score = item["score"]
                    print(
                        f"第{attempt + 1}次获取签到列表: score={current_score} hid={hid} rewardHash={reward_hash}"
                    )

                    if current_score > best_score:
                        best_score = current_score
                        best_params = (hid, reward_hash, current_score)
                    print(f"当前可获得签到积分: {best_score}")
                    break

            if attempt < max_attempts - 1:  # 不是最后一次循环
                print(f"继续尝试获取更高积分, 延时5-10s")
                time.sleep(random.randint(5, 10))
            else:  # 最后一次循环 即将提交签到
                print(f"即将提交签到, 延时3-4s")
                time.sleep(random.randint(3, 4))

        if best_params:
            self.submit_sign(*best_params)
        else:
            self.log("❌ 未能获取到有效的签到参数")

    def submit_sign(self, hid: str, reward_hash: str, score: int) -> None:
        """提交签到"""
        json_data = {
            "hid": hid,
            "hash": reward_hash,
            "sm_deviceId": "",
            "ctu_token": None,
        }
        response = self.make_request("POST", self.API_SIGN_SUBMIT, json=json_data)
        print(f"submit_sign API response ——> {response}")

        if response["code"] == 0:
            self.log(f"✅ 签到成功 | 积分 +{score}")
        else:
            self.log(f'❌ 签到失败: {response["msg"]}')

    # 文章浏览相关
    def get_article_list(self) -> List[str]:
        """获取文章列表"""
        params = {
            "page_no": "1",
            "page_size": "20",
            "type_hid": "",
        }
        response = self.make_request("GET", self.API_ARTICLE_LIST, params=params)
        print(f"get_article_list API response ——> {response}")

        if response["code"] == 0:
            # 从文章列表中随机选择3个ID
            article_list = [item["data_id"] for item in response["data"]["list"]]
            return random.sample(article_list, min(3, len(article_list)))

        self.log(f'❌ 获取文章列表失败: {response["msg"]}')
        return []

    def get_article_detail(self, article_id: str) -> None:
        """浏览文章"""
        self.log(f"浏览文章 article_id: {article_id}")
        endpoint = self.API_ARTICLE_DETAIL.format(article_id)
        self.make_request("GET", endpoint)

    def submit_article_score(self) -> None:
        """提交文章积分"""
        json_data = {
            "ctu_token": "",
            "action": 12,
        }
        response = self.make_request(
            "POST", self.API_ARTICLE_SCORE_SUBMIT, json=json_data
        )
        print(f"submit_article_score API response ——> {response}")

        if response["code"] == 0:
            score = response["data"]["score"]
            self.log(f"✅ 浏览文章成功 | 积分 +{score}")
        else:
            self.log(f'❌ 浏览文章失败: {response["msg"]}')

    # 答题相关
    def get_question_info(self, share_user_hid: str) -> None:
        """执行答题任务"""
        params = {"date": datetime.now().strftime("%Y%m%d")}
        response = self.make_request("GET", self.API_QUESTION_INFO, params=params)
        print(f"get_question_info API response ——> {response}")
        if response["code"] != 0:
            self.log(f'❌ 获取问题失败: {response["msg"]}')
            return
        # response['data']['state'] 1=表示未答题 2=已答题且正确 3=答错且未有人帮忙答题 4=答错但有人帮忙答题
        if response["data"].get("state") == 3:
            self.log("今日已答题但回答错误，当前无人帮助答题，跳过")
            return
        if response["data"].get("state") != 1:
            if response["data"].get("answer"):
                answer = response["data"]["answer"][0]
                if answer in ["A", "B", "C", "D"]:
                    self.correct_answer = answer
                    self.log(f"今日已答题，跳过，答案：{answer}")
                    return
            self.log("今日已答题，但未获取到答案，跳过")
            return

        question_info = response["data"]["question_info"]
        questions_hid = question_info["questions_hid"]

        # 构建问题字符串，只包含未被标记为错误的选项
        question_str = f"{question_info['content']}\n"
        valid_options = []
        for option in question_info["option"]:
            if option["option"] not in self.wrong_answers:
                valid_options.append(option)
                question_str += f'{option["option"]}. {option["option_content"]}\n'
            else:
                print(f"跳过错误选项 {option['option']}. {option['option_content']}")

        print(f"\n问题详情:\n{question_str}")

        # 如果只剩一个选项，直接使用
        if len(valid_options) == 1:
            answer = valid_options[0]["option"]
            self.log(f"仅剩一个选项，使用答案: {answer}")
            time.sleep(random.randint(3, 5))
            self.submit_question_answer(questions_hid, answer, share_user_hid)
            return

        # 获取答案并提交
        answer = self.get_question_answer(question_str)

        time.sleep(random.randint(3, 5))
        self.submit_question_answer(questions_hid, answer, share_user_hid)

    def get_ai_answer(self, question: str) -> str:
        """获取AI答案"""
        headers = {
            "Authorization": f"Bearer {self.ai_api_key}",
            "Content-Type": "application/json",
        }
        prompt = f"你是一个专业的北京现代汽车专家，请直接给出这个单选题的答案，并且不要带'答案'等其他内容。\n{question}"
        json_data = {
            "model": "hunyuan-turbo",
            "messages": [{"role": "user", "content": prompt}],
            "enable_enhancement": True,
            "force_search_enhancement": True,
            "enable_instruction_search": True,
        }

        try:
            response = requests.post(
                "https://api.hunyuan.cloud.tencent.com/v1/chat/completions",
                headers=headers,
                json=json_data,
            )
            response.raise_for_status()
            response_json = response.json()
            print(f"腾讯混元AI API response ——> {response_json}")

            # 获取AI回答内容并转大写
            ai_response = response_json["choices"][0]["message"]["content"].upper()

            # 使用集合操作找出有效答案
            valid_answers = set("ABCD") - self.wrong_answers
            found_answers = set(ai_response) & valid_answers

            # 如果找到答案则返回其中一个
            if found_answers:
                return found_answers.pop()
            else:
                print(f"❌ 没有找到符合的 AI 答案")
                return ""

        except Exception as e:
            print(f"腾讯混元AI API 请求失败: {str(e)}")

        return ""

    def get_question_answer(self, question: str) -> str:
        """获取答题答案"""
        # 1. 存在正确答案时，使用正确答案
        if self.correct_answer:
            self.log(f"使用历史正确答案: {self.correct_answer}")
            return self.correct_answer

        # 2. 存在预设答案时，使用预设答案
        if self.preset_answer:
            self.log(f"使用预设答案: {self.preset_answer}")
            return self.preset_answer

        # 3. 存在AI APIKey时，使用AI答案
        if self.ai_api_key:
            ai_answer = self.get_ai_answer(question)
            if ai_answer:
                self.log(f"使用AI答案: {ai_answer}")
                return ai_answer

        # 4. 随机选择答案（排除错误答案）
        answer = self.get_random_answer()
        self.log(f"随机答题，答案: {answer}")
        return answer

    def get_random_answer(self) -> str:
        """获取随机答案，排除已知错误答案"""
        available_answers = set(["A", "B", "C", "D"]) - self.wrong_answers
        if not available_answers:
            self.wrong_answers.clear()
            available_answers = set(["A", "B", "C", "D"])
        return random.choice(list(available_answers))

    def get_answered_question(self) -> None:
        """从已答题账号获取答案"""
        params = {"date": datetime.now().strftime("%Y%m%d")}
        response = self.make_request("GET", self.API_QUESTION_INFO, params=params)
        print(f"get_answered_question API response ——> {response}")
        if response["code"] != 0:
            self.log(f'❌ 从已答题账号获取问题失败: {response["msg"]}')
            return
        # response['data']['state'] 1=表示未答题 2=已答题且正确 4=已答题但错误
        if response["code"] == 0 and response["data"].get("answer"):
            answer = response["data"]["answer"][0]
            if answer in ["A", "B", "C", "D"]:
                self.correct_answer = answer
                self.log(f"从已答题账号获取到答案：{answer}")
                return
        self.log("从已答题账号获取答案失败")

    def submit_question_answer(
        self, question_id: str, answer: str, share_user_hid: str
    ) -> None:
        """提交答题答案"""
        json_data = {
            "answer": answer,
            "questions_hid": question_id,
            "ctu_token": "",
        }
        if share_user_hid:
            json_data["date"] = datetime.now().strftime("%Y%m%d")
            json_data["share_user_hid"] = share_user_hid

        response = self.make_request("POST", self.API_QUESTION_SUBMIT, json=json_data)
        print(f"submit_question_answer API response ——> {response}")

        if response["code"] == 0:
            data = response["data"]
            if data["state"] == 3:  # 答错
                # 记录错误答案
                self.wrong_answers.add(answer)
                # 如果是正确答案，清除它
                if self.correct_answer == answer:
                    self.correct_answer = ""
                # 如果是预设答案，清除它
                if self.preset_answer == answer:
                    self.preset_answer = ""
                self.log("❌ 答题错误")
            elif data["state"] == 2:  # 答对了
                if self.correct_answer != answer:
                    self.correct_answer = answer
                score = data["answer_score"]
                self.log(f"✅ 答题正确 | 积分 +{score}")
        else:
            self.log(f'❌ 答题失败: {response["msg"]}')

    def get_backup_share_hid(self, user_hid: str) -> str:
        """从备用 hid 列表中获取一个不同于用户自身的 hid"""
        available_hids = [hid for hid in self.BACKUP_HIDS if hid != user_hid]
        return random.choice(available_hids) if available_hids else ""

    def run(self) -> None:
        """运行主程序"""
        # 使用列表保持顺序，使用集合实现去重
        tokens = []
        tokens_set = set()

        # 方式1: 从BJXD环境变量获取(逗号分隔的多个token)
        token_str = os.getenv("BJXD")
        if token_str:
            # 过滤空值并保持顺序添加
            for token in token_str.split(","):
                token = token.strip()
                if token and token not in tokens_set:
                    tokens.append(token)
                    tokens_set.add(token)

        # 方式2: 从BJXD1/BJXD2/BJXD3等环境变量获取
        i = 1
        empty_count = 0  # 记录连续空值的数量
        while empty_count < 5:  # 连续5个空值才退出
            token = os.getenv(f"BJXD{i}")
            if not token:
                empty_count += 1
            else:
                token = token.strip()
                if token and token not in tokens_set:  # 确保token不是空字符串且未重复
                    empty_count = 0  # 重置连续空值计数
                    tokens.append(token)
                    tokens_set.add(token)
            i += 1

        if not tokens:
            self.log(
                "⛔️ 未获取到 tokens, 请检查环境变量 BJXD 或 BJXD1/BJXD2/... 是否填写"
            )
            self.push_notification()
            return

        self.log(f"👻 共获取到用户 token {len(tokens)} 个")

        self.ai_api_key = os.getenv("HUNYUAN_API_KEY", "")
        self.log(
            "💯 已获取到腾讯混元 AI APIKey, 使用腾讯混元 AI 答题"
            if self.ai_api_key
            else "😭 未设置腾讯混元 AI HUNYUAN_API_KEY 环境变量，使用随机答题"
        )

        # 获取预设答案
        self.preset_answer = os.getenv("BJXD_ANSWER", "").upper()
        if self.preset_answer:
            if self.preset_answer in ["A", "B", "C", "D"]:
                self.log(f"📝 已获取预设答案: {self.preset_answer}")
            else:
                self.preset_answer = ""
                self.log("❌ 预设答案格式错误，仅支持 A/B/C/D")

        # 获取所有用户信息
        for token in tokens:
            self.token = token
            user = self.get_user_info()
            if user:
                self.users.append(user)

        if not self.users:
            self.log("❌ 未获取到有效用户")
            return

        # 设置分享用户ID
        for i, user in enumerate(self.users):
            prev_index = (i - 1) if i > 0 else len(self.users) - 1
            # 如果有多个用户且上一个用户不是自己，使用上一个用户的 hid
            if len(self.users) > 1 and self.users[prev_index]["hid"] != user["hid"]:
                user["share_user_hid"] = self.users[prev_index]["hid"]
            else:
                # 否则从备用 hid 列表中选择一个
                user["share_user_hid"] = self.get_backup_share_hid(user["hid"])

        # 执行任务
        self.log("\n============ 执行任务 ============")
        for i, user in enumerate(self.users, 1):
            # 更新当前用户信息
            self.token = user["token"]
            self.user = user

            # 随机延迟
            if i > 1:
                print("\n进行下一个账号, 等待 5-10 秒...")
                time.sleep(random.randint(5, 10))

            self.log(f"\n======== ▷ 第 {i} 个账号 ◁ ========")

            # 打印用户信息
            self.log(
                f"👻 用户名: {self.user['nickname']} | "
                f"手机号: {self.user['phone']} | "
                f"积分: {self.user['score_value']}\n"
                f"🆔 用户hid: {self.user['hid']}\n"
                f"🆔 分享hid: {self.user['share_user_hid']}"
            )

            # 检查任务状态
            self.check_task_status(self.user)
            self.log(f"任务状态: {self.user['task']}")

            # 调试使用 设置任务状态
            # self.user["task"]["sign"] = False
            # self.user["task"]["view"] = False
            # self.user["task"]["question"] = False

            # 签到
            if not self.user["task"]["sign"]:
                self.get_sign_info()
                time.sleep(random.randint(5, 10))
            else:
                self.log("✅ 签到任务 已完成，跳过")

            # 阅读文章
            if not self.user["task"]["view"]:
                article_ids = self.get_article_list()
                if article_ids:
                    for article_id in article_ids:  # 已经只有3篇了
                        self.get_article_detail(article_id)
                        time.sleep(random.randint(10, 15))
                    self.submit_article_score()
            else:
                self.log("✅ 浏览文章任务 已完成，跳过")

            # 答题
            if not self.user["task"]["question"]:
                self.get_question_info(self.user["share_user_hid"])
            else:
                self.log("✅ 答题任务 已完成，跳过")
                if not self.correct_answer:
                    self.get_answered_question()

        self.log("\n============ 积分详情 ============")
        for i, user in enumerate(self.users, 1):
            if i > 1:
                print("\n进行下一个账号, 等待 5-10 秒...")
                time.sleep(random.randint(5, 10))

            # 更新当前用户信息
            self.token = user["token"]
            self.user = user

            self.log(f"\n======== ▷ 第 {i} 个账号 ◁ ========")

            # 打印用户信息
            self.log(
                f"👻 用户名: {self.user['nickname']} | 手机号: {self.user['phone']}"
            )

            # 显示积分详情
            self.get_score_details()

        # 最后推送通知
        self.push_notification()


if __name__ == "__main__":
    BeiJingHyundai().run()