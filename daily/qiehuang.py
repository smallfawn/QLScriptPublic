# cron: 25 10 * * *
# new Env('统一快乐星球茄皇')

import requests
import json
import os
import time
import re
import random
from collections import defaultdict
from notify import send

users = os.getenv("QH", '').splitlines()
# 清洗数据：去除每个用户字符串的首尾空格，过滤空行/全空格的无效数据
users = [user.strip() for user in users if user.strip()]

# 解析为 (wid, 手机号) 列表
parsed_users = []
for user_str in users:
    if "#" in user_str:
        # 按#拆分（只拆1次，避免手机号含#导致拆分错误）
        wid, phone = user_str.split("#", 1)
        parsed_users.append((wid.strip(), phone.strip()))
    else:
        # 兼容旧格式：只有wid没有手机号时，手机号为空字符串
        parsed_users.append((user_str.strip(), ""))

# UA可自行替换为自己的
user_agent = "Mozilla/5.0 (Linux; Android 14; 23046RP50C Build/UKQ1.230804.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/142.0.7444.172 Safari/537.36 XWEB/1420045 MMWEBSDK/20250201 MMWEBID/5714 MicroMessenger/8.0.57.2820(0x28003956) WeChat/arm64 Weixin Android Tablet NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx532ecb3bdaaf92f9"
STEP_ORDER = ["登录", "领取种子", "签到", "浏览任务", "收获作物", "播种", "循环浇水"]
STEP_EMOJI = {"登录": "🔑", "领取种子": "🌱", "签到": "📅", "浏览任务": "🔍", "收获作物": "🌾", "播种": "🌱", "循环浇水": "🔄"}

def _short(s, n=120):
    s = s.strip()
    return s if len(s) <= n else s[:n - 1] + "…"

def _pick_status(line: str) -> str:
    if "✅" in line: return "✅"
    if "⚠️" in line: return "⚠️"
    if "❌" in line: return "❌"
    return "ℹ️"

def _step_key(line: str) -> str:
    for k in STEP_ORDER:
        if k in line:
            return k
    return "信息"

def _pull_resource_snapshot(lines):
    res = {}
    for line in reversed(lines):
        if "☀️" in line:
            try: res["sun"] = int(re.findall(r"☀️(\d+)", line)[0])
            except: pass
        if "💧" in line:
            try: res["water"] = int(re.findall(r"💧(\d+)", line)[0])
            except: pass
        if "🍅" in line:
            try: res["fruit"] = int(re.findall(r"🍅(\d+)", line)[0])
            except: pass
        if len(res) >= 2:
            break
    return res

def render_report(all_lines):
    blocks, cur = [], []
    for ln in all_lines:
        if ln.strip().startswith("👤 用户"):
            if cur: blocks.append(cur)
            cur = [ln.strip()]
        elif ln is not None:
            cur.append(ln.rstrip())
    if cur: blocks.append(cur)
    out = []
    for b in blocks:
        if not b: continue
        header = b[0].strip()
        out.append("━━━━━━━━━━━━━━━━━━━━━━")
        out.append(header)
        bucket = defaultdict(list)
        for ln in b[1:]:
            if not ln.strip(): continue
            bucket[_step_key(ln)].append(ln)
        snap = _pull_resource_snapshot(b)
        if snap:
            res_line = "📊 当前资源："
            if "sun" in snap:   res_line += f"☀️{snap['sun']}  "
            if "water" in snap: res_line += f"💧{snap['water']}  "
            if "fruit" in snap: res_line += f"🍅{snap['fruit']}  "
            out.append(res_line.strip())
        for step in STEP_ORDER + ["信息"]:
            if step not in bucket: continue
            lines = bucket[step]
            cleaned, seen = [], set()
            for ln in lines:
                if set(ln.strip()) in (set("="),):
                    continue
                # 关键修复：循环浇水日志不做去重（保留所有记录）
                if step == "循环浇水":
                    cleaned.append(ln)
                else:
                    norm = re.sub(r"账号\d+：", "", re.sub(r"\s+", " ", ln)).strip()
                    if norm not in seen:
                        seen.add(norm)
                        cleaned.append(ln)
            # 循环浇水保留所有记录
            if step == "循环浇水":
                picked = cleaned
            else:
                picked = cleaned[-1:] if cleaned else []
            for pln in picked:
                status = _pick_status(pln)
                icon = STEP_EMOJI.get(step, "•")
                body = re.sub(r"^[🔑🌱📅🔍🌾🔄]+\s*" + re.escape(step) + r"[:：]?\s*", "", pln)
                body = re.sub(r"^[✅❌⚠️ℹ️]+\s*", "", body)
                out.append(f"{icon} {step} {status}  {_short(body)}")
        succ = sum("✅" in ln for ln in b)
        fail = sum("❌" in ln for ln in b)
        warn = sum("⚠️" in ln for ln in b)
        out.append(f"🧾 小结：成功 {succ} · 预警 {warn} · 失败 {fail}")
    out.append("━━━━━━━━━━━━━━━━━━━━━━")
    return "\n".join(out)


def login(wid, phone, user_logs):
    step = "登录"
    # 校验手机号是否存在
    if not phone:
        msg = "未配置手机号，登录失败 🔒"
        print(msg)
        user_logs.append(f"🔑 {step}: {msg}")
        return None
    try:
        url = "https://api.zhumanito.cn/api/login"
        # 新增手机号参数 wm_phone
        payload = {"wid": wid, "wm_phone": phone}
        headers = {'User-Agent': user_agent, 'Content-Type': "application/json"}
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        response.raise_for_status()
        dljson = response.json()
        # 响应格式新增 code 字段校验
        if dljson.get("code") == 200 and 'data' in dljson and 'token' in dljson['data'] and 'user' in dljson['data'] and 'land' in dljson['data']:
            msg = f"登录成功（手机号：{phone}）✅"
            print(msg)
            user_logs.append(f"🔑 {step}: {msg}")
            time.sleep(random.uniform(4, 5))
            return {
                "token": dljson['data']['token'],
                "user_data": dljson['data']['user'],
                "land_data": dljson['data']['land']
            }
        else:
            msg = f"登录失败，返回数据: {dljson} ❌"
            print(msg)
            user_logs.append(f"🔑 {step}: {msg}")
            return None
    except Exception as e:
        msg = f"登录出错（手机号：{phone}）: {str(e)} ❌"
        print(msg)
        user_logs.append(f"🔑 {step}: {msg}")
        return None

def get_seeds(authorization, user_logs):
    step = "领取种子"
    if not authorization:
        msg = "未获取到授权，无法领取种子 🔒"
        print(msg)
        user_logs.append(f"🌱 {step}: {msg}")
        return
    try:
        url = "https://api.zhumanito.cn/api/guide"
        headers = {'User-Agent': user_agent, 'Content-Type': "application/json", 'authorization': authorization}
        for st in (1, 2):
            payload = {"status": st}
            response = requests.post(url, data=json.dumps(payload), headers=headers)
            response.raise_for_status()
        user_logs.append(f"🌱 {step}: 领取/引导完成 ✅")
        time.sleep(random.uniform(4, 5))
    except Exception as e:
        msg = f"领取种子出错: {str(e)} ❌"
        print(msg)
        user_logs.append(f"🌱 {step}: {msg}")

def check_in(authorization, user_logs):
    step = "签到"
    if not authorization:
        msg = "未获取到授权，无法签到 🔒"
        print(msg)
        user_logs.append(f"📅 {step}: {msg}")
        return
    try:
        url = "https://api.zhumanito.cn/api/task/complete"
        headers = {'User-Agent': user_agent, 'Content-Type': "application/x-www-form-urlencoded", 'authorization': authorization}
        response = requests.post(url, headers=headers)
        response_data = response.json()
        if response_data.get("msg") == "成功":
            msg = "签到成功 ✅"
            print(f"签到结果: {msg}")
            user_logs.append(f"📅 {step}: {msg}")
        elif response_data.get("msg") == "不可重复完成":
            msg = "今日已签到，无需重复操作 ✅"
            print(f"签到结果: {msg}")
            user_logs.append(f"📅 {step}: {msg}")
        else:
            msg = f"失败，原因: {response_data.get('msg', '未知错误')} ❌"
            print(f"签到结果: {msg}")
            user_logs.append(f"📅 {step}: {msg}")
        time.sleep(random.uniform(4, 5))
    except Exception as e:
        msg = f"签到出错: {str(e)} ❌"
        print(msg)
        user_logs.append(f"📅 {step}: {msg}")

def explore(authorization, wid, user_logs):
    step = "浏览任务"
    if not authorization:
        msg = "未获取到授权，无法执行浏览任务 🔒"
        print(msg)
        user_logs.append(f"🔍 {step}: {msg}")
        return
    max_retry = 3
    retry_count = 0
    while retry_count < max_retry:
        try:
            url = f"https://api.zhumanito.cn/?wid={wid}"
            headers = {
                'Host': 'api.zhumanito.cn',
                'User-Agent': user_agent,
                'authorization': authorization,
                'sec-ch-ua': '"Chromium";v="142", "Android WebView";v="142", "Not_A Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Android"',
                'upgrade-insecure-requests': '1',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/wxpic,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'x-requested-with': 'com.tencent.mm',
                'sec-fetch-site': 'same-site',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-user': '?1',
                'sec-fetch-dest': 'document',
                'referer': 'https://h5.zhumanito.cn/',
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'priority': 'u=0, i'
            }
            response = requests.get(url, headers=headers, allow_redirects=False, timeout=10, verify=True)
            if response.status_code == 302:
                msg = "浏览任务完成✅"
                print(f"浏览任务：{msg}")
                user_logs.append(f"🔍 {step}: {msg}")
                time.sleep(random.uniform(4, 5))
                break
            elif response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", "1"))
                retry_count += 1
                if retry_count < max_retry:
                    msg = f"浏览请求限速，等待{retry_after}秒后重试（第{retry_count}/{max_retry}次）"
                    print(f"浏览任务：{msg}")
                    time.sleep(retry_after)
                else:
                    msg = f"浏览请求多次限速，放弃重试 ❌"
                    print(f"浏览任务：{msg}")
                    user_logs.append(f"🔍 {step}: {msg}")
            else:
                msg = f"浏览失败，状态码: {response.status_code} ❌"
                print(f"浏览任务：{msg}")
                user_logs.append(f"🔍 {step}: {msg}")
                break
        except requests.exceptions.RequestException as e:
            msg = f"浏览任务出错: {str(e)} ❌"
            print(msg)
            user_logs.append(f"🔍 {step}: {msg}")
            break

def harvest(authorization, user_logs, account):
    step = "收获作物"
    try:
        url = "https://api.zhumanito.cn/api/harvest"
        headers = {
            'User-Agent': user_agent,
            'Content-Type': "application/x-www-form-urlencoded;charset=utf-8",
            'authorization': authorization
        }
        before_fruit = int(account["user_data"].get("fruit_num", 0))
        response = requests.post(url, headers=headers, data=b"", timeout=15)
        response.raise_for_status()
        res_json = response.json()
        if res_json.get("code") == 200:
            account["user_data"] = res_json["data"]["user"]
            account["land_data"] = res_json["data"]["land"]
            after_fruit = int(account["user_data"].get("fruit_num", 0))
            total_after = int(account["user_data"].get("total_fruit_num", after_fruit))
            delta = max(0, after_fruit - before_fruit)
            msg = f"收获成功！🍅+{delta} → 现有 {after_fruit}（累计 {total_after}）"
            print(msg)
            user_logs.append(f"🌾 {step}: {msg}")
            snap_line = f"📊 收获后资源：☀️{account['user_data'].get('sun_num',0)}  💧{account['user_data'].get('water_num',0)}  🍅{after_fruit}"
            print(snap_line)
            user_logs.append(snap_line)
            time.sleep(random.uniform(4, 5))
            return True
        else:
            msg = f"收获失败: {res_json.get('msg', '未知信息')} ⚠️"
            print(msg)
            user_logs.append(f"🌾 {step}: {msg}")
            return False
    except Exception as e:
        msg = f"收获请求出错: {str(e)} ❌"
        print(msg)
        user_logs.append(f"🌾 {step}: {msg}")
        return False

def plant_seed(authorization, user_logs, account):
    step = "播种"
    try:
        url = "https://api.zhumanito.cn/api/seed"
        headers = {
            'User-Agent': user_agent,
            'Content-Type': "application/x-www-form-urlencoded;charset=utf-8",
            'authorization': authorization
        }
        response = requests.post(url, headers=headers, data=b"", timeout=15)
        response.raise_for_status()
        res_json = response.json()
        if res_json.get("code") == 200:
            msg = "播种成功！✅"
            print(msg)
            user_logs.append(f"🌱 {step}: {msg}")
            account["user_data"] = res_json["data"]["user"]
            account["land_data"] = res_json["data"]["land"]
            time.sleep(random.uniform(4, 5))
            return True
        else:
            msg = f"播种失败: {res_json.get('msg', '未知信息')} ⚠️"
            print(msg)
            user_logs.append(f"🌱 {step}: {msg}")
            return False
    except Exception as e:
        msg = f"播种请求出错: {str(e)} ❌"
        print(msg)
        user_logs.append(f"🌱 {step}: {msg}")
        return False

def water_once(headers, account_idx):
    """单次浇水（带限速重试）"""
    max_retry = 3
    retry_count = 0
    while retry_count < max_retry:
        try:
            response = requests.post(
                "https://api.zhumanito.cn/api/water",
                headers=headers,
                data=b"",
                allow_redirects=False,
                timeout=(25, 30)
            )
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", "1"))
                retry_count += 1
                if retry_count < max_retry:
                    print(f"账号{account_idx}：浇水请求限速，等待{retry_after}秒后重试（第{retry_count}/{max_retry}次）")
                    time.sleep(retry_after)
                else:
                    raise Exception(f"浇水请求多次限速（{max_retry}次），放弃重试")
            else:
                raise Exception(f"响应状态码异常: {response.status_code}，内容: {response.text}")
        except json.JSONDecodeError:
            raise Exception(f"返回非JSON数据: {response.text}")
        except Exception as e:
            if retry_count >= max_retry - 1:
                raise e
            retry_count += 1
            time.sleep(1)
    return None

def loop_watering(headers, account_idx, account, user_logs):
    step = "循环浇水"
    user_logs.append(f"🔄 {step}：进入循环浇水（需💧≥20且☀️≥20）")
    print(f"\n🔄 账号{account_idx}：进入循环浇水（需💧≥20且☀️≥20）")
    
    water_headers = headers.copy()
    water_headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8"
    
    while True:
        water = account["user_data"].get("water_num", 0)
        sun = account["user_data"].get("sun_num", 0)
        
        if water >= 20 and sun >= 20:
            log_msg = f"🔄 {step}：📌 账号{account_idx}：资源满足（💧{water}，☀️{sun}），浇水..."
            print(log_msg)
            user_logs.append(log_msg)
            
            try:
                res = water_once(water_headers, account_idx)
                
                if res.get("code") == 200:
                    # 浇水成功，更新用户数据
                    account["user_data"] = res["data"]["user"]
                    land = res["data"].get("land", [])
                    
                    success_msg = f"🔄 {step}：✅ 账号{account_idx}：浇水成功！"
                    status_msg = f"🔄 {step}：📊 剩余：💧{account['user_data']['water_num']}，☀️{account['user_data']['sun_num']}"
                    print("="*35)
                    print(success_msg)
                    print(status_msg)
                    # 关键修改：每条浇水成功日志都保留（不合并、不删除）
                    user_logs.append(success_msg)
                    user_logs.append(status_msg)
                    
                    if land:
                        land_msg = f"🔄 {step}：🌱 土地：共{len(land)}块，阶段{land[0]['seed_stage']} 🌱"
                        print(land_msg)
                        user_logs.append(land_msg)
                    print("="*35)
                    
                    time.sleep(random.uniform(4, 5))
                else:
                    # 浇水失败（如达上限、其他错误）
                    fail_msg = f"🔄 {step}：❌ 账号{account_idx}：浇水失败：{res.get('msg', '未知错误')}"
                    print(fail_msg)
                    user_logs.append(fail_msg)
                    break
                
            except Exception as e:
                error_msg = f"🔄 {step}：⚠️ 账号{account_idx}：浇水请求异常：{str(e)} ❌"
                print(error_msg)
                user_logs.append(error_msg)
                break
        else:
            end_msg = f"🔄 {step}：🔚 账号{account_idx}：资源不足（💧{water}，☀️{sun}），停止浇水 ⏹️"
            print(end_msg)
            user_logs.append(end_msg)
            fruit = account['user_data'].get('fruit_num', 0)
            final_snap = f"📊 最终资源：☀️{sun}  💧{water}  🍅{fruit}"
            print(final_snap)
            user_logs.append(final_snap)
            break

def process_user(wid, phone, user_index):
    user_logs = [f"👤 用户{user_index}: wid={wid} | 手机号={phone}"]
    print(f"\n===== 开始处理用户 {user_index} (wid: {wid}, 手机号: {phone}) =====")
    # 登录时传入 wid 和手机号
    login_data = login(wid, phone, user_logs)
    if login_data:
        auth_token = login_data["token"]
        headers = {'User-Agent': user_agent, 'authorization': auth_token}
        account = {"user_data": login_data["user_data"], "land_data": login_data["land_data"]}
        fruit = account['user_data'].get('fruit_num', 0)
        print(f"📊 当前番茄数量：{fruit}")
        user_logs.append(f"📊 当前番茄数量：{fruit}")
        if account["user_data"].get("new_status", 2) != 2:
            get_seeds(auth_token, user_logs)
        check_in(auth_token, user_logs)
        explore(auth_token, wid, user_logs)
        current_stage = 0
        if account["land_data"] and len(account["land_data"]) > 0:
            current_stage = account["land_data"][0].get("seed_stage", 0)
        print(f"\n🧠 账号{user_index}：智能判断... 当前土地状态: {current_stage}")
        user_logs.append(f"ℹ️ 土地状态: {current_stage}")
        if current_stage == 5:
            print("判断：作物已成熟。")
            user_logs.append("🧠 判断：作物已成熟。")
            print(f">> 账号{user_index}：执行 [收获]...")
            harvest_success = harvest(auth_token, user_logs, account)
            if harvest_success:
                print(f">> 账号{user_index}：执行 [播种]...")
                plant_seed(auth_token, user_logs, account)
        elif current_stage == 0:
            print("判断：土地为空。")
            user_logs.append("🧠 判断：土地为空。")
            print(f">> 账号{user_index}：执行 [播种]...")
            plant_seed(auth_token, user_logs, account)
        else:
            print("判断：作物生长中... 无需收获或播种。")
            user_logs.append("🧠 判断：作物生长中。")
        loop_watering(headers, user_index, account, user_logs)
    else:
        msg = "获取授权失败，无法执行后续操作 🔒"
        print(msg)
        user_logs.append(f"⚠️ {msg}")
    print(f"===== 完成处理用户 {user_index} =====\n")
    time.sleep(3)
    return user_logs

if __name__ == "__main__":
    if not parsed_users or len(parsed_users) == 0:
        print("未从环境变量TYQH中获取到任何用户信息！ 🚫")
        send("统一茄皇", "未从环境变量TYQH中获取到任何用户信息！ 🚫")
    else:
        print(f"共检测到 {len(parsed_users)} 个用户，开始依次处理... 👥")
        all_logs = []
        for i, (wid, phone) in enumerate(parsed_users, 1):
            try:
                user_logs = process_user(wid, phone, i)
                all_logs.extend(user_logs)
                all_logs.append("")
            except Exception as e:
                error_msg = f"用户 {i} 处理过程中发生未捕获错误: {str(e)} ❌"
                print(error_msg)
                all_logs.append(f"❌ {error_msg}")
                all_logs.append("")
        # 推送完整报告（包含所有浇水成功记录）
        report = render_report(all_logs)
        print("\n" + "="*50)
        print("最终推送通知内容：")
        print(report)
        print("="*50)
        send("统一茄皇", report)