"""
中国电信首页 → 天翼智铃
"""
import os
import re
import ssl
import json
import time
import random
import string
import base64
import hashlib
import datetime
import requests
from hashlib import md5
from http import cookiejar
from Crypto.Cipher import AES, DES3
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
from Crypto.Util.Padding import pad, unpad

ACTIVITY_MODE = os.environ.get("ACTIVITY_MODE", "new_year")

CHANNEL_ID = "156000007489"
INVITATION_CODE = ""
ACTIVITY_ID = "ai089"
VIDEO_ID = ""

# 账号配置：格式 "手机号#密码" 或 "手机号@密码"
ACCOUNTS_STR = os.environ.get("chinaTelecomAccount", "")

MAKE_COUNT = 3

MIN_SCORE_TO_LOTTERY = 0
context = ssl.create_default_context()
context.set_ciphers('DEFAULT@SECLEVEL=1')
context.check_hostname = False
context.verify_mode = ssl.CERT_NONE

class DESAdapter(requests.adapters.HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        kwargs['ssl_context'] = context
        return super().init_poolmanager(*args, **kwargs)

class BlockAll(cookiejar.CookiePolicy):
    return_ok = set_ok = domain_return_ok = path_return_ok = lambda self, *args, **kwargs: False
    netscape = True
    rfc2965 = hide_cookie2 = False

key = b'1234567`90koiuyhgtfrdews'
iv = 8 * b'\0'
public_key_b64 = '''-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDBkLT15ThVgz6/NOl6s8GNPofdWzWbCkWnkaAm7O2LjkM1H7dMvzkiqdxU02jamGRHLX/ZNMCXHnPcW/sDhiFCBN18qFvy8g6VYb9QtroI09e176s+ZCtiv7hbin2cCTj99iUpnEloZm19lwHyo69u5UMiPMpq0/XKBO8lYhN/gwIDAQAB
-----END PUBLIC KEY-----'''

requests.packages.urllib3.disable_warnings()
ss = requests.session()
ss.headers = {"User-Agent": "Mozilla/5.0 (Linux; Android 13; 22081212C) AppleWebKit/537.36"}
ss.mount('https://', DESAdapter())
ss.cookies.set_policy(BlockAll())

def encrypt_3des(text):
    cipher = DES3.new(key, DES3.MODE_CBC, iv)
    ciphertext = cipher.encrypt(pad(text.encode(), DES3.block_size))
    return ciphertext.hex()

def decrypt_3des(text):
    ciphertext = bytes.fromhex(text)
    cipher = DES3.new(key, DES3.MODE_CBC, iv)
    plaintext = unpad(cipher.decrypt(ciphertext), DES3.block_size)
    return plaintext.decode()

def b64_rsa(plaintext):
    public_key = RSA.import_key(public_key_b64)
    cipher = PKCS1_v1_5.new(public_key)
    ciphertext = cipher.encrypt(plaintext.encode())
    return base64.b64encode(ciphertext).decode()

def encode_phone(text):
    return ''.join(chr(ord(char) + 2) for char in text)

def generate_random_string(length=16):
    return ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(length))

def md5_hash(data):
    return hashlib.md5(data.encode('utf-8')).hexdigest()

def encryptmd5(timestamp, randomnum):
    md5_e = md5_hash(str(timestamp))
    base64_encoded = base64.b64encode((md5_e + randomnum).encode()).decode()
    return md5_hash(base64_encoded + randomnum)

def encrypt_request(data, t, e, i):
    n = json.dumps({k: v for k, v in data.items() if v is not None}, separators=(',', ':'))
    encoded_t = base64.b64encode(t.encode()).decode()
    encoded_e = base64.b64encode(e.encode()).decode()
    s = md5((encoded_t + md5(e.encode()).hexdigest() + i).encode()).hexdigest()[:16]
    o = md5((encoded_e + md5(t.encode()).hexdigest() + i).encode()).hexdigest()[:16]
    cipher = AES.new(s.encode(), AES.MODE_CBC, iv=o.encode())
    padded_data = pad(n.encode(), AES.block_size)
    encrypted_data = cipher.encrypt(padded_data)
    return base64.b64encode(encrypted_data).decode()

def decrypt_response(encrypted_base64, t, e, i):
    encoded_t = base64.b64encode(t.encode()).decode()
    encoded_e = base64.b64encode(e.encode()).decode()
    n = md5((encoded_e + i + md5(t.encode()).hexdigest()).encode()).hexdigest()[:16]
    s = md5((encoded_t + i + md5(e.encode()).hexdigest()).encode()).hexdigest()[:16]
    cipher = AES.new(n.encode(), AES.MODE_CBC, iv=s.encode())
    encrypted_data = base64.b64decode(encrypted_base64)
    decrypted_data = cipher.decrypt(encrypted_data)
    unpadded_data = unpad(decrypted_data, AES.block_size)
    return json.loads(unpadded_data.decode())

def parse_accounts(accounts_str: str) -> list:
    accounts = []
    for part in accounts_str.replace("\n", "&").replace("\r", "").split("&"):
        part = part.strip()
        if "#" in part:
            phone, pwd = part.split("#", 1)
        elif "@" in part:
            phone, pwd = part.split("@", 1)
        else:
            continue
        phone, pwd = phone.strip(), pwd.strip()
        if phone and pwd:
            accounts.append((phone, pwd))
    return accounts

def userLoginNormal(phone, password):
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    rdmstr = ''.join(random.choices('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', k=16))
    login_cipher = f'iPhone 14 15.4.{rdmstr[:12]}{phone}{timestamp}{password}0$$$0.'
    payload = {
        "headerInfos": {
            "code": "userLoginNormal", "timestamp": timestamp, "broadAccount": "", "broadToken": "",
            "clientType": "#11.3.0#channel50#iPhone 14 Pro Max#", "shopId": "20002",
            "source": "110003", "sourcePassword": "Sid98s", "token": "", "userLoginName": encode_phone(phone)
        },
        "content": {
            "attach": "test",
            "fieldData": {
                "loginType": "4", "accountType": "", "loginAuthCipherAsymmertric": b64_rsa(login_cipher),
                "deviceUid": rdmstr, "phoneNum": encode_phone(phone), "isChinatelecom": "0",
                "systemVersion": "15.4.0", "authentication": encode_phone(password)
            }
        }
    }
    r = ss.post('https://appgologin.189.cn:9031/login/client/userLoginNormal', json=payload)
    data = r.json()
    response_data = data.get('responseData')
    if response_data:
        data_inner = response_data.get('data')
        if data_inner:
            login_result = data_inner.get('loginSuccessResult')
            if login_result:
                return login_result
    print(f"登录响应: {data}")
    return None

def get_ticket(phone, userId, token):
    import re
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    xml_data = f'<Request><HeaderInfos><Code>getSingle</Code><Timestamp>{timestamp}</Timestamp>' \
               f'<BroadAccount></BroadAccount><BroadToken></BroadToken>' \
               f'<ClientType>#9.6.1#channel50#iPhone 14 Pro Max#</ClientType><ShopId>20002</ShopId>' \
               f'<Source>110003</Source><SourcePassword>Sid98s</SourcePassword><Token>{token}</Token>' \
               f'<UserLoginName>{phone}</UserLoginName></HeaderInfos><Content><Attach>test</Attach>' \
               f'<FieldData><TargetId>{encrypt_3des(userId)}</TargetId>' \
               f'<Url>4a6862274835b451</Url></FieldData></Content></Request>'
    r = ss.post('https://appgologin.189.cn:9031/map/clientXML', data=xml_data,
                headers={'user-agent': 'CtClient;10.4.1;Android;13;22081212C;NTQzNzgx!#!MTgwNTg1'})
    tk = re.findall('<Ticket>(.*?)</Ticket>', r.text)
    if tk:
        return decrypt_3des(tk[0])
    return None

def sso_login_v2(ticket):
    payload = {"portal": "45", "channelId": CHANNEL_ID, "ticket": ticket}
    headers = {
        'User-Agent': "CtClient;11.3.0;Android;12;Redmi K30 Pro;MDAyNDUy!#!MTgwMjQ",
        'Content-Type': "application/json"
    }
    r = requests.post("https://ai.imusic.cn/vapi/vue_login/sso_login_v2",
                      data=json.dumps(payload), headers=headers)
    if r.status_code == 200:
        data = r.json()
        if data.get("token"):
            return data.get("token"), r.cookies.get_dict()
    return None, None


class InviteAPI:
    BASE_URL = "https://ai.imusic.cn"

    def __init__(self, token: str, cookies: dict = None):
        self.token = token
        self.session = requests.Session()
        self.session.mount('https://', DESAdapter())
        if cookies:
            self.session.cookies.update(cookies)
        self.session.headers.update({
            "User-Agent": "CtClient;11.3.0;Android;12;Redmi K30 Pro;ODAwODUw!#!MTg2MDg",
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Origin": self.BASE_URL,
            "Authorization": f"Bearer {token}",
            "Referer": f"{self.BASE_URL}/h5v/fusion/ai-luck-flow?ca=AP3V&cc={CHANNEL_ID}&utm_scha=utm_ch-010001002009.utm_sch-hg_xx_qlxx-1-104705800001-105782800001.utm_af-1000000037.utm_as-158492900001.utm_sd1-default",
            "X-Requested-With": "com.ct.client",
            "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Android WebView";v="140"',
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": '"Android"',
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
        })



    def request_plain(self, endpoint: str, params: dict = None) -> dict:
        url = f"{self.BASE_URL}{endpoint}"
        response = self.session.post(url, params=params, timeout=30)
        return response.json()

    def request_encrypted(self, endpoint: str, params: dict) -> dict:
        self.session.headers["imencrypt"] = "1"
        imrandomnum = generate_random_string(16)
        imtimestamp = str(int(time.time() * 1000))
        imencryptkey = encryptmd5(imtimestamp, imrandomnum)

        form_data = {"channelId": CHANNEL_ID, "portal": "45"}
        form_data.update(params)
        encrypted_form = encrypt_request(form_data, imrandomnum, imtimestamp, imencryptkey)

        headers = {
            "imencryptkey": imencryptkey,
            "imrandomnum": imrandomnum,
            "imtimestamp": imtimestamp,
        }
        url = f"{self.BASE_URL}{endpoint}"
        response = self.session.post(url, params={"formData": encrypted_form}, headers=headers, timeout=30)

        new_auth = response.headers.get("Authorization")
        if new_auth:
            self.token = new_auth
            self.session.headers["Authorization"] = f"Bearer {new_auth}"

        try:
            return decrypt_response(response.text, imrandomnum, imtimestamp, imencryptkey)
        except:
            return {"raw": response.text}

    def get_user_info(self, mobile: str) -> dict:
        params = {"channelId": CHANNEL_ID, "portal": "45", "mobile": mobile}
        return self.request_plain("/vapi/new_member/get_user_info", params)

    def check_user_state(self, mobile: str) -> dict:
        params = {"mobile": mobile, "is4G": "1", "is5G": "1", "isDX": "1", "channelId": CHANNEL_ID, "portal": "45"}
        return self.request_plain("/vapi/vrbt/check_user_state", params)

    def query_template_list(self, page_no: int = 1, page_size: int = 10) -> dict:
        params = {
            "pageNo": page_no, "pageSize": page_size, "activityId": ACTIVITY_ID,
            "apiName": "diy/DiyVideoApi/queryActRecommendTemplateList",
            "channelId": CHANNEL_ID, "portal": "45"
        }
        return self.request_plain("/hapi/de/api", params)

    def send_stat_message(self, mobile: str, actname: str, actparam: str) -> dict:
        params = {
            "mobile": mobile,
            "actname": actname,
            "actparam": actparam
        }
        return self.request_encrypted("/vapi/vue_stat/sendMessage", params)

    def template_make(self, mobile: str, template_id: str, template_conf_id: str,
                      template_name: str, user_words: str = "", arrange_id: str = "", **kwargs) -> dict:
        params = {
            "channelId": CHANNEL_ID,
            "portal": "45",
            "mobile": mobile,
            "openId": "",
            "makeId": "",
            "background": "",
            "userPhotos": "",
            "userWords": user_words,
            "templateName": template_name,
            "videoName": template_name,
            "templateId": template_id,
            "templateConfId": template_conf_id,
            "aid": ACTIVITY_ID,
            "aiPack": 0,
            "arrangeId": arrange_id,
            "autoOrderUgc": 0,
            "aiGatewayImagMakeId": "",
            "fromType": "",
            "sessionId": ""
        }
        params.update(kwargs)
        return self.request_encrypted("/hapi/diy_video/au/template_make_add_v2", params)

    def get_score(self, mobile: str, score_type: int = 1) -> dict:
        params = {
            "activityId": ACTIVITY_ID,
            "mobile": mobile,
            "type": score_type,
            "apiName": "act/ActApi/getDoubleTotalScoreOrRemainingScore"
        }
        return self.request_encrypted("/hapi/en/api", params)

    def do_lottery(self, mobile: str) -> dict:
        params = {
            "activityId": ACTIVITY_ID,
            "mobile": mobile,
            "apiName": "act/ActApi/doubleFestivalLottery"
        }
        return self.request_encrypted("/hapi/en/api", params)

    def do_egg_lottery(self, mobile: str, activity_id: str = "1611") -> dict:
        params = {
            "activityId": activity_id,
            "mobile": mobile,
            "apiName": "act/ActApi/doubleEggLottery"
        }
        return self.request_encrypted("/hapi/en/api", params)

    def get_lottery_times(self, mobile: str, activity_id: str = "1611") -> dict:
        params = {
            "mobile": mobile,
            "activityId": activity_id
        }
        return self.request_encrypted("/hapi/activity/au/get_act_lottery_times", params)

    def query_new_year_templates(self, page_no: int = 1, page_size: int = 500) -> dict:
        params = {
            "pageNo": page_no,
            "pageSize": page_size,
            "activityId": "0090_2",
            "apiName": "diy/DiyVideoApi/queryActRecommendTemplateList",
            "channelId": CHANNEL_ID,
            "portal": "45"
        }
        return self.request_plain("/hapi/de/api", params)

    def make_new_year_video(self, mobile: str, template_data: dict) -> dict:
        
        template_id = template_data.get("templateId", "")
        template_conf_id = template_data.get("templateConfId", "")
        video_name = template_data.get("videoName", "")
        user_words = template_data.get("userWords", "")
        random_suffix = random.randint(100000, 999999)
        video_name_with_suffix = f"{video_name}{random_suffix}"

        params = {
            "mobile": mobile,
            "openId": "",
            "background": template_id,
            "userPhotos": "",
            "userWords": user_words,
            "templateName": "",
            "videoName": video_name_with_suffix,
            "templateId": template_id,
            "templateConfId": template_conf_id,
            "aid": "ai090",
            "inviterMobile": "",
            "arrangeId": "",
            "autoOrderUgc": 0,
            "aiGatewayImagMakeId": "",
            "fromType": "",
            "sessionId": ""
        }
        return self.request_encrypted("/hapi/diy_video/au/template_make_add_v2", params)

    def ai_agent_chat(self, mobile: str, content: str, agent_id: str = "", from_act: str = "cny", session_id: str = "") -> dict:
        params = {
            "apiName": "diy/AiAgentChatApi/aiAgentChat",
            "content": content,
            "mobile": mobile,
            "agentId": agent_id,
            "fromAct": from_act,
            "sessionId": session_id
        }
        return self.request_encrypted("/hapi/en/api", params)

    def control_confirm_submit(self, mobile: str, session_id: str, confirm_id: int, text_list: list,
                               agent_id: str = "text_to_image", from_act: str = "cny") -> dict:
        params = {
            "apiName": "diy/AiAgentChatApi/controlConfirmSubmit",
            "content": "",
            "mobile": mobile,
            "sessionId": session_id,
            "confirmId": confirm_id,
            "channelId": "",
            "portal": "45",
            "agentId": agent_id,
            "triggerSource": "card_submit",
            "textList": text_list,
            "fromAct": from_act
        }
        return self.request_encrypted("/hapi/en/api", params)

    def check_ai_agent_result(self, mobile: str, task_id: str) -> dict:
        params = {
            "apiName": "diy/AiAgentChatApi/checkAiAgentResult",
            "mobile": mobile,
            "taskId": task_id
        }
        return self.request_encrypted("/hapi/en/api", params)

    def query_person_tasks(self, mobile: str, activity_id: str = "ai090") -> dict:
        params = {
            "apiName": "act/ActApi/queryPersonTasks",
            "mobile": mobile,
            "activityId": activity_id
        }
        return self.request_encrypted("/hapi/en/api", params)

    def query_red_packet_balance(self, mobile: str, activity_id: str = "1611") -> dict:
        params = {
            "apiName": "act/ActApi/doubleEggCostRedeemInfo",
            "mobile": mobile,
            "activityId": activity_id
        }
        return self.request_encrypted("/hapi/en/api", params)

    def redeem_red_packet(self, mobile: str, cost_value: float, activity_id: str = "1611") -> dict:
        params = {
            "apiName": "act/ActApi/doubleEggCostRedeem",
            "mobile": mobile,
            "activityId": activity_id,
            "costValue": cost_value
        }
        return self.request_encrypted("/hapi/en/api", params)


def process_new_year_lottery(phone: str, password: str, account_idx: int = 0, total_accounts: int = 0):
    print(f"\n{'='*50}")
    print(f"处理账号: {phone} ({account_idx}/{total_accounts})")
    print(f"活动: 2026新年星辰")
    print(f"{'='*50}")

    print("\n[1] 账密登录...")
    login_result = userLoginNormal(phone, password)
    if not login_result:
        print("❌ 登录失败")
        return False
    print("✓ 登录成功")
    print("\n[2] 获取ticket...")
    ticket = get_ticket(phone, login_result['userId'], login_result['token'])
    if not ticket:
        print("❌ 获取ticket失败")
        return False
    print("✓ 获取ticket成功")
    print("\n[3] SSO登录...")
    token, cookies = sso_login_v2(ticket)
    if not token:
        print("❌ SSO登录失败")
        return False
    print(f"✓ SSO登录成功")

    api = InviteAPI(token, cookies)

    print("\n[4] 查询任务状态...")
    tasks_result = api.query_person_tasks(phone)

    task1_completed = False 
    task2_completed = False 

    if tasks_result.get("code") == "0000":
        tasks = tasks_result.get("data", {}).get("tasks", [])
        print(f"✓ 获取到 {len(tasks)} 个任务\n")

        for task in tasks:
            task_name = task.get("taskName", "")
            task_type = task.get("taskType", "")
            task_state = task.get("taskState", 0)  # 0=未完成, 1=已完成
            current_progress = task.get("currentProgress", 0)
            target_progress = task.get("targetProgress", 0)
            lottery_count = task.get("lotteryCount", 0)

            state_text = "✓ 已完成" if task_state == 1 else "○ 未完成"
            print(f"  {state_text} {task_name} ({current_progress}/{target_progress}) - 奖励: +{lottery_count}次")

            if task_type == "video_make":
                task1_completed = (task_state == 1)
            elif task_type == "ai_agent_chat":
                task2_completed = (task_state == 1)

        print()
    else:
        print(f"⚠ 查询失败，继续执行任务\n")

    print("[5] 查询初始抽奖次数...")
    lottery_times_result = api.get_lottery_times(phone)
    if lottery_times_result.get("code") == "0000":
        initial_times = lottery_times_result.get("data", 0)
        print(f"✓ 当前抽奖次数: {initial_times}")
    else:
        print(f"⚠ 查询失败")
        initial_times = 0

    print("\n" + "="*50)
    print("【任务1】制作同款视频（获得抽奖次数）")
    print("="*50)

    if task1_completed:
        print("\n✓ 任务1已完成，跳过")
        task1_success = True
    else:
        print("\n[6] 查询新年模板列表...")
        templates_result = api.query_new_year_templates()
        if templates_result.get("code") != "0000":
            print(f"❌ 获取模板列表失败: {templates_result}")
            task1_success = False
        else:
            template_list = templates_result.get("data", {}).get("list", [])
            if not template_list:
                print("❌ 模板列表为空")
                task1_success = False
            else:
                print(f"✓ 获取到 {len(template_list)} 个模板")

                print(f"\n[7] 开始制作视频 (共3次)...")
                task1_success_count = 0
                available_templates = template_list.copy()

                success_count = 0
                attempt_count = 0
                max_attempts = min(len(available_templates), 10)  # 最多尝试10次

                while success_count < 3 and attempt_count < max_attempts and available_templates:
                    attempt_count += 1

                    template = random.choice(available_templates)
                    video_name = template.get("videoName", "")
                    template_id = template.get("templateId", "")
                    user_words = template.get("userWords", "")

                    print(f"\n  制作第 {success_count + 1}/3 次 (尝试 {attempt_count})...")
                    print(f"  模板: {video_name} (ID: {template_id})")
                    if not template_id or not user_words:
                        print(f"  ⚠ 模板缺少必要字段，跳过此模板")
                        available_templates.remove(template)
                        continue

                    result = api.make_new_year_video(phone, template)
                    code = result.get("code", "")
                    msg = result.get("message", result.get("desc", str(result)))

                    available_templates.remove(template)

                    if code == "0000":
                        data = result.get("data", {})
                        add_lottery_times = data.get("addLotteryTimes", 0)
                        add_huango_times = data.get("addHuanGoLotteryTimes", "0")
                        print(f"  ✓ 制作成功! 获得抽奖次数: {add_lottery_times}, 换购次数: {add_huango_times}")
                        success_count += 1
                        task1_success_count += 1
                    else:
                        print(f"  ✗ 制作失败: {msg}，尝试下一个模板")

                    if success_count < 3 and available_templates:
                        time.sleep(1)  

                print(f"\n任务1完成: {success_count}/3 成功 (共尝试 {attempt_count} 次)")
                task1_success = success_count > 0

    lottery_times_result = api.get_lottery_times(phone)
    if lottery_times_result.get("code") == "0000":
        after_task1_times = lottery_times_result.get("data", 0)
        print(f"✓ 当前抽奖次数: {after_task1_times}")
    else:
        print(f"⚠ 查询失败")
        after_task1_times = initial_times

    print("\n" + "="*50)
    print("【任务2】去智能体创作（获得抽奖次数）")
    print("="*50)

    if task2_completed:
        print("\n✓ 任务2已完成，跳过")
        task2_success_count = 3
    else:
        ai_prompts = [
            "生成一张马年春节窗花剪纸的图片",
            "生成一张新年祝福的中国风图片",
            "生成一张春节喜庆氛围的图片"
        ]

        print(f"\n[9] 开始AI对话生成图片 (共3次)...")
        task2_success_count = 0
        session_id = ""  

        for chat_idx in range(3):
            prompt = ai_prompts[chat_idx % len(ai_prompts)]
            print(f"\n  === 第 {chat_idx + 1}/3 次生成 ===")
            print(f"  提示词: {prompt}")

            print(f"  [1/3] 发起AI对话...")
            result1 = api.ai_agent_chat(phone, prompt, session_id=session_id)
            code1 = result1.get("code", "")

            if code1 != "0000":
                msg = result1.get("desc", result1.get("message", "未知错误"))
                print(f"  ✗ 对话失败: {msg}")
                continue

            data1 = result1.get("data", {})
            session_id = data1.get("sessionId", "")
            confirm_id = data1.get("id", 0)
            card_params = data1.get("cardParameterList", {})
            text_list = card_params.get("textList", [])

            print(f"  ✓ 对话成功，confirmId: {confirm_id}")

            if not text_list:
                print(f"  ⚠ textList为空，跳过此次生成")
                continue

            print(f"  [2/3] 确认提交生成...")
            result2 = api.control_confirm_submit(phone, session_id, confirm_id, text_list)
            code2 = result2.get("code", "")

            if code2 != "0000":
                msg = result2.get("desc", result2.get("message", "未知错误"))
                print(f"  ✗ 提交失败: {msg}")
                continue

            data2 = result2.get("data", {})
            task_id = data2.get("taskId", "")
            content = data2.get("content", "")

            print(f"  ✓ 提交成功，taskId: {task_id}")
            print(f"  响应: {content[:80]}..." if len(content) > 80 else f"  响应: {content}")

            print(f"  [3/3] 等待生成完成...这步冗余，保留了")
            max_check_times = 15 
            check_interval = 2  

            for check_idx in range(max_check_times):
                time.sleep(check_interval)

                result3 = api.check_ai_agent_result(phone, task_id)
                code3 = result3.get("code", "")
                desc3 = result3.get("desc", "")

                if code3 == "0000":
                    print(f"  ✓ 生成完成! ({check_idx + 1}次检查)")
                    task2_success_count += 1
                    break
                elif code3 == "10008":
                    print(f"  ⏳ 制作中... ({check_idx + 1}/{max_check_times})")
                    continue
                else:
                    print(f"  ✗ 生成失败: {desc3}")
                    break
            else:
                print(f"  ⚠ 等待超时，跳过")

            if chat_idx < 2:
                print(f"  等待2秒后进行下一次生成...")
                time.sleep(2) 

        print(f"\n任务2完成: {task2_success_count}/3 成功")

    print("\n" + "="*50)
    print("【抽奖环节】")
    print("="*50)
    print("\n[9] 查询最终抽奖次数...")
    lottery_times_result = api.get_lottery_times(phone)
    if lottery_times_result.get("code") == "0000":
        final_times = lottery_times_result.get("data", 0)
        print(f"✓ 最终抽奖次数: {final_times}")
    else:
        print(f"⚠ 查询失败，跳过抽奖")
        final_times = 0

    total_red_packet = 0.0  # 累计红包金额
    if final_times > 0:
        print(f"\n开始抽奖 (共{final_times}次)...")
        lottery_success = 0
        awards = []

        for lottery_idx in range(final_times):
            print(f"\n  第 {lottery_idx + 1}/{final_times} 次抽奖...")
            lottery_result = api.do_egg_lottery(phone)

            if lottery_result.get("code") == "0000":
                data = lottery_result.get("data", {})
                award_name = data.get("awardName", "未知奖品")
                awards.append(award_name)
                print(f"  ✓ {award_name}")
                lottery_success += 1
                money_match = re.search(r'(\d+\.?\d*)元', award_name)
                if money_match:
                    money = float(money_match.group(1))
                    total_red_packet += money
            else:
                msg = lottery_result.get("desc", lottery_result.get("message", "未知错误"))
                print(f"  ✗ 抽奖失败: {msg}")

            if lottery_idx < final_times - 1:
                time.sleep(0.5)  # 抽奖间隔

        print(f"\n抽奖完成: {lottery_success}/{final_times} 成功")
        if awards:
            print(f"获得奖品: {', '.join(awards)}")
        if total_red_packet > 0:
            print(f"累计红包: {total_red_packet:.2f}元")
    else:
        print(f"\n跳过抽奖 (抽奖次数为0)")

    print(f"\n查询红包余额...")

    balance_result = api.query_red_packet_balance(phone)
    if balance_result.get("code") == "0000":
        data = balance_result.get("data", {})
        already_redeem = data.get("alreadyRedeemValue", "0")
        balance_cost = data.get("balanceCostValue", "0")
        already_redeem_costs = data.get("alreadyRedeemCosts", [])

        print(f"  ✓ 查询成功!")
        print(f"  累计已兑换: {already_redeem}元")
        print(f"  剩余可兑换: {balance_cost}元")

        if already_redeem_costs:
            print(f"  已兑换记录:")
            for record in already_redeem_costs:
                award_name = record.get("awardName", "")
                update_date = record.get("updateDate", "")
                print(f"    - {award_name} ({update_date})")

        try:
            balance_float = float(balance_cost)
            if balance_float >= 2.0:
                print(f"\n  💰 可兑换金额已满2元，开始兑换...")

                redeem_result = api.redeem_red_packet(phone, balance_float)
                if redeem_result.get("code") == "0000":
                    redeem_data = redeem_result.get("data", {})
                    extract_value = redeem_data.get("extractValue", "0")
                    new_already_redeem = redeem_data.get("alreadyRedeemValue", "0")
                    new_balance = redeem_data.get("balanceCostValue", "0")

                    print(f"  ✓ 兑换成功!")
                    print(f"  本次提取: {extract_value}元")
                    print(f"  累计已兑换: {new_already_redeem}元")
                    print(f"  剩余可兑换: {new_balance}元")
                else:
                    msg = redeem_result.get("desc", redeem_result.get("message", "未知错误"))
                    print(f"  ✗ 兑换失败: {msg}")
            else:
                print(f"  ℹ️  需满2元才能兑换（还差{2.0 - balance_float:.2f}元）")
        except Exception as e:
            print(f"  ⚠ 处理失败: {e}")
    else:
        msg = balance_result.get("desc", balance_result.get("message", "未知错误"))
        print(f"  ✗ 查询失败: {msg}")
    stat_result = api.send_stat_message(
        phone,
        "activity_2512new-year-2026_30.1",
        "activityID_ai090_ca_dljA"
    )
    if stat_result.get("code") == "0000":
        pass
    else:
        print(f"发送失败: {stat_result.get('desc', '')}")

    print(f"\n{'='*50}")
    print(f"账号 {phone} 处理完成")
    print(f"{'='*50}")

    return task1_success or task2_success_count > 0


def process_account(phone: str, password: str, account_idx: int = 0, total_accounts: int = 0):
    print(f"\n{'='*50}")
    print(f"处理账号: {phone} ({account_idx}/{total_accounts})")
    print(f": {INVITATION_CODE[:20]}...")
    print(f"{'='*50}")
    print("\n[1] 账密登录...")
    login_result = userLoginNormal(phone, password)
    if not login_result:
        print("❌ 登录失败")
        return False
    print("✓ 登录成功")

    print("\n[2] 获取ticket...")
    ticket = get_ticket(phone, login_result['userId'], login_result['token'])
    if not ticket:
        print("❌ 获取ticket失败")
        return False
    print("✓ 获取ticket成功")

    print("\n[3] SSO登录...")
    token, cookies = sso_login_v2(ticket)
    if not token:
        print("❌ SSO登录失败")
        return False
    print(f"✓ SSO登录成功，token: {token[:50]}...")

    api = InviteAPI(token, cookies)

    print("\n获取用户信息...")
    user_info = api.get_user_info(phone)
    if user_info.get("code") == "0000":
        print(f"✓ 用户信息获取成功")
    else:
        print(f"用户信息: {user_info}")

    # Step 7: 检查用户状态
    print("\n[6] 检查用户状态...")
    user_state = api.check_user_state(phone)
    print(f"用户状态: {user_state}")

    # Step 8: 查询推荐模板列表
    print("\n[8] 查询推荐模板列表...")
    templates = api.query_template_list()
    template_list = templates.get("data", {}).get("list", [])
    if not template_list:
        print("❌ 未获取到模板列表")
        return False
    print(f"✓ 获取到 {len(template_list)} 个模板")

    # Step 9: 选择第一个模板进行制作
    tpl = template_list[0]
    template_id = tpl.get("templateId", "")
    template_conf_id = tpl.get("templateConfId", "")
    video_name = tpl.get("videoName", "")
    user_words = tpl.get("userWords1", "1234")
    arrange_id = str(tpl.get("arrangeId", ""))

    # 如果有输入限制，生成符合要求的内容
    word_min = tpl.get("wordMinCount", 0)
    limit_regular = tpl.get("limitRegular", "")

    if limit_regular == "/^\\d+$/" and word_min > 0:
        # 数字输入（如手机尾号）
        user_words = phone[-word_min:] if len(phone) >= word_min else phone
    elif word_min > 0 and not user_words:
        user_words = "接福"  # 默认文字

    print(f"\n[9] 开始制作模板 (共{MAKE_COUNT}次)...")
    print(f"  模板: {video_name}")
    print(f"  模板ID: {template_id}")
    print(f"  配置ID: {template_conf_id}")
    print(f"  用户输入: {user_words}")
    print(f"  : {INVITATION_CODE[:20]}...")

    # Step 10: 循环制作
    success_count = 0
    for make_idx in range(MAKE_COUNT):
        print(f"\n  制作第 {make_idx + 1}/{MAKE_COUNT} 次...")
        result = api.template_make(
            mobile=phone,
            template_id=template_id,
            template_conf_id=template_conf_id,
            template_name=video_name,
            user_words=user_words,
            arrange_id=arrange_id
        )
        msg = result.get("message", result.get("desc", str(result)))
        code = result.get("code", "")
        print(f"  结果: {msg}")
        if code == "0000":
            success_count += 1
        if make_idx < MAKE_COUNT - 1:
            time.sleep(0.5) 

    print(f"\n制作完成: {success_count}/{MAKE_COUNT} 成功")

    if success_count > 0:
        actparam_base = f"activityID_{ACTIVITY_ID}_templateID_{template_id}_entrance_{CHANNEL_ID}_templateConfID_{template_conf_id}_ca_AP3V"

        stat_events = [
            ("activity_vring_make_20250616", actparam_base),
            ("activity_2511AI-makeonekey_9.2", actparam_base),
            ("activity_vring_make_1.9", f"_activityID_{ACTIVITY_ID}_templateID_{template_id}_entrance_{CHANNEL_ID}_templateconfID_{template_conf_id}_ca_AP3V"),
            ("activity_2511AI-makeonekey_1.6", f"activityID_{ACTIVITY_ID}_templateID_{template_id}_entrance_{CHANNEL_ID}_templateconfID_{template_conf_id}_ca_AP3V"),
            ("page_2511AI-makeonekey_9", actparam_base),
            ("page_2511AI-makeonekey_3", actparam_base),
            ("with_vring_display_20250616", actparam_base),
            ("with_vring_slide_display_20250829", actparam_base),
            ("with_vring_stay_duration", f"activityID_{ACTIVITY_ID}_entrance_{CHANNEL_ID}_duration_15_ca_AP3V"),
        ]

        for actname, actparam in stat_events:
            try:
                stat_result = api.send_stat_message(phone, actname, actparam)
                if stat_result.get("code") == "0000":
                    print(f"  ✓ {actname}")
                else:
                    print(f"  ⚠ {actname}: {stat_result.get('desc', '')}")
            except Exception as e:
                print(f"  ⚠ {actname}: {str(e)}")
            time.sleep(0.1)

    print("\n查看积分...")
    score_result = api.get_score(phone)
    current_score = 0
    if score_result.get("code") == "0000":
        current_score = int(score_result.get("data", "0"))
        print(f"✓ 当前积分: {current_score}")
    else:
        print(f"积分查询: {score_result}")

    if MIN_SCORE_TO_LOTTERY > 0 and current_score >= MIN_SCORE_TO_LOTTERY:
        print(f"\n[13] 抽奖 (积分{current_score} >= 阈值{MIN_SCORE_TO_LOTTERY})...")
        lottery_result = api.do_lottery(phone)
        if lottery_result.get("code") == "0000":
            award_data = lottery_result.get("data", {})
            award_name = award_data.get("awardName", "未知")
            print(f"✓ 抽奖结果: {award_name}")
        else:
            print(f"抽奖失败: {lottery_result}")
    elif MIN_SCORE_TO_LOTTERY == 0:
        print(f"\n[13] 跳过抽奖 (阈值设为0，不抽奖)")
    else:
        print(f"\n[13] 跳过抽奖 (积分{current_score} < 阈值{MIN_SCORE_TO_LOTTERY})")

    if success_count > 0:
        print("✓ 兑换成功!")
        return True
    else:
        print("❌ 兑换失败")
        return False


def main():
    accounts = parse_accounts(ACCOUNTS_STR)
    if not accounts:
        print("错误: 未配置账号")
        return

    print("=" * 50)
    print("电信彩玲AI脚本 - 2026新年星辰活动")
    print(f"渠道ID: {CHANNEL_ID}")
    print(f"共 {len(accounts)} 个账号")
    print("=" * 50)
    print("\n活动说明:")
    print("  任务1: 制作新年视频 (3次) → 获得抽奖次数")
    print("  任务2: AI对话生成图片 (3次) → 获得抽奖次数")
    print("  最后: 使用获得的次数进行抽奖")
    print("=" * 50)

    total = len(accounts)
    success_count = 0
    for idx, (phone, password) in enumerate(accounts):
        if process_new_year_lottery(phone, password, idx + 1, total):
            success_count += 1
        if idx < len(accounts) - 1:
            print(f"\n等待3秒后处理下一个账号...")
            time.sleep(3)

    print(f"\n{'='*50}")
    print(f"全部处理完成: {success_count}/{total} 成功")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()

