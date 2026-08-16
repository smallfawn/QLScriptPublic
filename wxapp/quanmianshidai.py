
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
项目: 全棉时代 - 每日签到 + 种棉花(自动种树 + 浇水)
入口: 微信小程序「全棉时代」-> 我的·每日签到 / 首页·种棉花
说明: 通过 wx_server(smallcat) 用 openid 换取 wx.login code 自动登录(nmp),
      完成每日签到(得积分); 若为已注册会员, 再对自己的树执行种棉花浇水。
      账号尚未种树时会自动种下一棵(选定成长目标奖品), 之后每日自动浇水。
      每次运行现取 code、现登录, 不再依赖手动粘贴的 code#token(易过期)。
账号变量名: qmzmh   (填写 wx_server 中的 openid, 多账号用换行或 & 分割, 可选 #备注)
需要配置 wx_server_url、wx_auth, 用于获取 wx.login code
可选变量: qmzmh_prize_id  种树时的成长目标奖品 id, 默认 1046(加厚棉柔巾 6片/包*1包);
          可选值来自 GET https://sg01.purcotton.com/api/prize/home
#new Env("全棉时代签到")
#cron 30 8 * * *
"""

import os
import sys
import json
import time
import uuid
import random
import hashlib
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import quote

import requests

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    from notify import send
except Exception:
    def send(title, content):
        print(f"\n===== {title} =====\n{content}")

# 配置参数 (均来自小程序反编译源码, 非机密)
MINI_APP_ID = "wxdfcaa44b1aa891a7"
NMP = "https://nmp.pureh2b.com"                 # config.js SERVER (生产)
SG01 = "https://sg01.purcotton.com"             # config.js 种棉花 H5 与其 /api
PRIZE_ID_DEFAULT = "1046"                       # 种树默认成长目标: 加厚棉柔巾 6片/包*1包
base_url = "https://hxxxy.gov.cn"               # 旧占位常量, 保留兼容
# smallcat / wx_server 配置 (机密, 从环境变量读取, 绝不硬编码)
WX_SERVER_URL = os.getenv("wx_server_url", "http://192.168.31.196:8787").rstrip("/")
WX_AUTH = os.getenv("wx_auth", "")
TOKEN_CACHE_PATH = Path(__file__).with_name("quanmianshidai_token_cache.json")
session = requests.Session()
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
    accounts = [x.strip() for x in value.replace('&', '\n').splitlines() if x.strip()]
    print(f'-----------本次账号运行数量：{len(accounts)}-----------')
    print(f'------全棉时代签到+种棉花-----2.0------')
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


# sg01 的 H5 只对 3 个接口(task/complete-task、task/complete-manual-task、answer/complete)
# 的请求体做了参数签名(h5/js 里的 formatMd5)，不带签名时服务端返回 {"code":400,"msg":"参数格式错误"}。
# 算法: 追加 timestamp(毫秒) → 丢掉值为 None/"" 的项 → 按 key 排序拼成 query 串 → md5(串+固定盐).upper()
SG01_SIGN_SALT = "z0hQTvC21f8SXlLbL9Hv"


def sg01_sign(params):
    """把参数体补上 timestamp + sign，返回可直接 json= 提交的新 dict。"""
    payload = dict(params)
    payload["timestamp"] = int(time.time() * 1000)
    kept = {k: v for k, v in payload.items() if v is not None and v != ""}
    query = "&".join(
        f"{quote(str(k), safe='')}={quote(str(v), safe='')}" for k, v in sorted(kept.items())
    )
    payload["sign"] = hashlib.md5((query + SG01_SIGN_SALT).encode("utf-8")).hexdigest().upper()
    return payload


# ---------------------------------------------------------------------------
# smallcat + nmp 登录 (每次运行现取 wx.login code, 现登录, 不存长期令牌)
# ---------------------------------------------------------------------------
def mask(value):
    if not value:
        return ""
    value = str(value)
    return value[:2] + "***" if len(value) <= 12 else f"{value[:4]}***{value[-4:]}"


def gen_guid():
    return str(uuid.uuid4())


def read_token_cache():
    try:
        if TOKEN_CACHE_PATH.exists():
            return json.loads(TOKEN_CACHE_PATH.read_text(encoding="utf-8")) or {}
    except Exception:
        pass
    return {}


def write_token_cache(cache):
    try:
        TOKEN_CACHE_PATH.write_text(
            json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception as e:
        print(f"⚠️ 写入token缓存失败: {e}")


def get_wx_code(openid):
    if not WX_AUTH:
        raise RuntimeError("缺少 wx_auth, 无法从 wx_server 获取 code")
    headers = {"Accept": "application/json", "Content-Type": "application/json",
               "auth": WX_AUTH}
    body = json.dumps({"appid": MINI_APP_ID, "openid": openid})
    last_msg = ""
    for attempt in range(4):
        if attempt:
            # smallcat 偶发 "获取失败"(会话抖动), 刷新会话后间隔重试
            try:
                session.post(f"{WX_SERVER_URL}/wx/refresh", data=body,
                             headers=headers, timeout=30)
            except Exception:
                pass
            time.sleep(3)
        resp = session.post(f"{WX_SERVER_URL}/wx/code", data=body,
                            headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, dict) and data.get("status") is False:
            last_msg = data.get("message") or "获取失败"
            continue
        code = data.get("code") or (data.get("data") or {}).get("code")
        if code:
            return code
        last_msg = "wx_server 未返回 code"
    raise RuntimeError(f"wx_server 获取 code 失败(已重试): {last_msg}")


def nmp_headers(guid, token=None):
    """复刻 request.js: 每个请求头带 code=GUID、tag=v3.0, 登录后再带 token。"""
    h = {"Content-Type": "application/json;charset=UTF-8", "code": guid, "tag": "v3.0"}
    if token:
        h["token"] = token
    return h


def nmp_login(openid, guid):
    """wx.login code -> GET /api/wx/main/login。返回 (token, member, bind)。

    member 为 None 或无 phone 表示尚未绑定手机号/注册, 无法签到。
    """
    wxcode = get_wx_code(openid)
    resp = session.get(f"{NMP}/api/wx/main/login", params={"code": wxcode},
                       headers=nmp_headers(guid), timeout=30)
    resp.raise_for_status()
    body = resp.json()
    data = body.get("data") if isinstance(body.get("data"), dict) else None
    token = (data or {}).get("token") or body.get("token")
    member = (data or {}).get("member") if data else None
    if member is None:
        member = body.get("member")
    bind = (data or {}).get("bind") if data else body.get("bind")
    return token, member, bind


def get_account_session(openid, index):
    """现取 code、现登录, 复用缓存的设备 GUID。返回 (guid, token, member, bind)。"""
    cache = read_token_cache()
    entry = cache.get(openid) or {}
    guid = entry.get("guid") or gen_guid()
    token, member, bind = nmp_login(openid, guid)
    phone = member.get("phone") if isinstance(member, dict) else None
    cache[openid] = {"guid": guid, "hasPhone": bool(phone), "updatedAt": int(time.time())}
    write_token_cache(cache)
    tag = "已绑定手机号会员" if phone else f"未绑定(bind={bind})"
    print(f"账号 {index} nmp登录: token={mask(token)} {tag}")
    return guid, token, member, bind


def member_sign_in(guid, token):
    """每日签到: GET /api/member/signIn/point。响应体为裸数字 1=成功 0=今日已签到。"""
    resp = session.get(f"{NMP}/api/member/signIn/point",
                       headers=nmp_headers(guid, token), timeout=30)
    if resp.status_code != 200:
        return None, f"签到请求HTTP {resp.status_code}"
    text = (resp.text or "").strip()
    try:
        val = json.loads(text)
    except Exception:
        val = text
    if val in (1, "1"):
        return True, "签到成功"
    if val in (0, "0"):
        return True, "今日已签到"
    return False, f"签到失败(返回={text[:80]})"


def prize_home(code, token):
    """GET /api/prize/home: 可选的成长目标(奖品)列表, 对应 H5 的 guidePrizeList。"""
    url = "https://sg01.purcotton.com/api/prize/home"
    try:
        response = requests.get(url, headers=create_headers(code, token), timeout=30)
        response.raise_for_status()
        data = response.json()
        if data.get("code") == 200:
            lst = (data.get("data") or {}).get("list")
            return lst if isinstance(lst, list) else []
        print(f"获取目标奖品列表失败: code={data.get('code')} msg={data.get('msg')}")
    except requests.exceptions.RequestException as e:
        print(f"获取目标奖品列表失败: {e}")
    return []


def zhongshu(code, token):
    """种树: 选定成长目标后 POST /api/gain-tree {prize_id}。

    对应 sg01 H5 `chunk-d2e24086` 的 gainTree():
        axios.get("guidePrizeList")  -> /api/prize/home  取目标列表(seedList)
        axios.post("getTree", {prize_id: seedList[seedIndex].id}) -> /api/gain-tree
    选苗(choiceSeed)只是前端下标, 无额外校验; 该动作一次性且不消耗水滴。
    目标由环境变量 qmzmh_prize_id 指定(默认 PRIZE_ID_DEFAULT); 若该 id 不在
    当前列表中(奖品会下架), 回退为列表首项并打印实际选中的标题。
    """
    prizes = prize_home(code, token)
    if not prizes:
        return False, "无可选成长目标(prize/home 为空), 未种树"

    want = str(os.getenv("qmzmh_prize_id", PRIZE_ID_DEFAULT)).strip()
    chosen = next((p for p in prizes if str(p.get("id")) == want), None)
    if chosen is None:
        chosen = prizes[0]
        print(f"目标 prize_id={want} 已不在列表中, 回退为首项")
    title = chosen.get("title") or chosen.get("name") or ""

    url = "https://sg01.purcotton.com/api/gain-tree"
    try:
        response = requests.post(url, headers=create_headers(code, token),
                                 json={"prize_id": chosen.get("id")}, timeout=30)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        return False, f"种树请求失败: {e}"

    if data.get("code") == 200:
        return True, f"已种下(目标: {title})"
    msg = data.get("msg") or f"code={data.get('code')}"
    # 已有树时服务端会拒绝, 视为幂等成功
    if any(k in str(msg) for k in ("已", "存在", "重复")):
        return True, f"已有树({msg})"
    return False, f"种树失败: {msg}"


def jscz(code, token):  # 浇水
    # 调用hqid函数并获取树木ID及其他信息
    tree_id, sunshine, total_sunshine = hqid(code, token)

    if tree_id is None:
        # tree 为空列表 => 尚未种树。种树 = 选定成长目标 + gain-tree, 一次性动作,
        # 不消耗水滴; 种下后继续本次浇水。
        print("尚未种树, 正在自动种下...")
        planted, plant_msg = zhongshu(code, token)
        print(f"种树: {plant_msg}")
        if not planted:
            return False
        tree_id, sunshine, total_sunshine = hqid(code, token)
        if tree_id is None:
            print("种树后仍未取到树木ID, 跳过浇水")
            return False

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
        return True
    return False


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
    payload = sg01_sign({
        "tid": tid,
        "relate_id": 0,
    })

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
    data = sg01_sign({"tid": tid})  # 使用传入的任务ID
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
            payload = response_data.get('data') or {}
            tree_data = payload.get('tree')
            user_data = payload.get('user')  # 获取用户相关数据
            if not isinstance(user_data, dict):
                user_data = {}

            # 获取树木ID
            # 接口的 tree 字段有两种形态: 单棵树为 dict, 多棵/未种树为 list(空列表表示
            # 尚未种树)。兼容处理, 避免 'list' object has no attribute 'get'。
            if isinstance(tree_data, list):
                tree_data = tree_data[0] if tree_data else {}
            if not isinstance(tree_data, dict):
                tree_data = {}
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
            # H5 提交的是所选选项字母(answer=A/B/C/D)，服务端在响应里回正确答案；
            # 早先写的 win=1 不是真实字段，配合缺失的签名会一起被判「参数格式错误」
            options = [letter for letter in ("A", "B", "C", "D") if exam.get(letter.lower())]
            choice = options[0] if options else "A"
            payload = sg01_sign({
                "answer": choice,
                "exam_id": exam_id,
                "tid": int(tid),
            })
            submit_response = requests.post(url_submit_answer, headers=headers, json=payload)
            submit_response.raise_for_status()

            if submit_response.status_code == 200:
                submit_response_data = submit_response.json()
                #print(submit_response_data)  # 打印完整的响应体
                if submit_response_data.get("code") != 200:
                    print(f"提交答案失败：{submit_response_data.get('msg')}")
                    continue

                # 提取并打印get_water, complete_num, 和 box_id
                data_ans = submit_response_data.get("data", {}) or {}
                get_water = data_ans.get("get_water", 0)
                complete_num = data_ans.get("complete_num", 0)
                box_id = data_ans.get("box_id", 0)
                print(f"答{choice} 正确答案{data_ans.get('answer', '?')} 获取水量：{get_water}, 完成数量：{complete_num}, 宝箱ID：{box_id}")
                
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
    accounts = get_env_variable('qmzmh')
    if not accounts:
        return
    if not WX_AUTH:
        print("❌ 未配置 wx_auth, 无法获取 code, 退出。")
        return
    total = len(accounts)
    if total > 20:
        print("账号数量超过20个，不执行操作。")
        return

    print("=============== 全棉时代 签到开始 ===============")
    summaries = []
    ok_count = 0
    for index, entry in enumerate(accounts, start=1):
        parts = str(entry).split('#', 1)
        openid = parts[0].strip()
        remark = parts[1].strip() if len(parts) > 1 else ""
        print()
        print(f"------账号{index}/{total}，备注: {remark}-------")
        lines = [f"【账号 {index}{('/' + remark) if remark else ''}】"]
        try:
            guid, token, member, bind = get_account_session(openid, index)
            if not token:
                msg = "登录失败(nmp未返回token)"
                print(f"❌ {msg}")
                lines.append(f"❌ {msg}")
                summaries.append("\n".join(lines))
                continue

            phone = member.get("phone") if isinstance(member, dict) else None
            if not (isinstance(member, dict) and phone):
                msg = ("该账号尚未绑定手机号(需先在小程序「全棉时代」内完成手机号授权"
                       "注册为会员后, 才能签到/种棉花)")
                print(f"⚠️ {msg}")
                lines.append(f"⚠️ {msg}")
                summaries.append("\n".join(lines))
                continue

            # 核心动作: 每日签到 (本次修复重点)
            ok, sign_msg = member_sign_in(guid, token)
            print(("🎉 " if ok else "❌ ") + sign_msg)
            lines.append(("🎉 " if ok else "❌ ") + sign_msg)
            ok_count += 1 if ok else 0

            # 种棉花: 仅给「自己的树」浇水 (沿用原 sg01 游戏流程)。
            # sg01 侧需再登录一次拿到 phone/user_id; 失败仅提示, 不影响签到结果。
            try:
                sg_phone, sg_uid = login(guid, token)
                if sg_phone and sg_uid:
                    cscscs(guid, token)   # 刷新/领取日常
                    watered = jscz(guid, token)   # 浇水(种棉花), 只浇自己的树
                    pdrw(guid, token)     # 日常任务判断
                    if watered:
                        lines.append("🌱 种棉花: 已完成浇水/日常任务")
                    else:
                        lines.append("🌱 种棉花: 日常任务已完成; 种树/浇水未成功, "
                                     "详见日志")
                else:
                    print("种棉花: sg01 登录未通过, 跳过浇水(不影响签到)")
                    lines.append("🌱 种棉花: sg01 未登录, 已跳过")
            except Exception as e:
                print(f"种棉花流程异常(忽略, 不影响签到): {e}")
                lines.append("🌱 种棉花: 异常已忽略")
            # 说明: 原脚本的「给好友浇水」(process_all_friends) 是把自身水量消耗到
            #       他人的树上, 属社交/代浇, 非「种自己的树」目标, 按安全约束停用。
        except Exception as e:
            print(f"❌ 账号 {index} 执行异常: {e}")
            lines.append(f"❌ 执行异常: {e}")
        summaries.append("\n".join(lines))
        time.sleep(1)

    print("\n=============== 全棉时代 签到结束 ===============")
    title = f"全棉时代签到 {ok_count}/{total} 成功"
    try:
        send(title, "\n\n".join(summaries))
    except Exception as e:
        print(f"⚠️ 通知发送失败: {e}")


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
