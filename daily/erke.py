#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
new Env('鸿星尔克签到');
cron: 1 10 * * *
"""
# =================================================================
# 使用说明：
# 1. 环境变量名称：ERKE_CONF
# 2. 环境变量格式：member_id#enterprise_id#unionid#openid#wx_openid#备注
# 3. 多账号支持：多个账号请换行，或者使用 & 符号连接
# 示例：
# 12345#67890#unionid123#openid123#wx_openid123#我的账号
# 54321#09876#unionid456#openid456#wx_openid456#大号
# =================================================================
# 配置日志
import os
import requests
import hashlib
import random
import logging
from typing import Dict
from datetime import datetime, timedelta, timezone


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ErkeCheckIn")

def get_gmt8_time() -> str:
    """获取北京时间字符串"""
    tz = timezone(timedelta(hours=8))
    return datetime.now(tz).strftime('%Y-%m-%d %H:%M:%S')

def calculate_sign(appid: str, member_id: str, timestamp: str = None) -> dict:
    """计算请求签名逻辑"""
    if timestamp is None:
        timestamp = get_gmt8_time()

    random_num = random.randint(0, 9999999)
    trans_id = appid + timestamp

    # 按照JS逻辑拼接字符串
    sign_str = f"timestamp={timestamp}transId={trans_id}secret=damogic8888random={random_num}memberId={member_id}"
    sign = hashlib.md5(sign_str.encode()).hexdigest()

    return {
        'sign': sign,
        'timestamp': timestamp,
        'transId': trans_id,
        'random': random_num,
        'appid': appid,
        'memberId': member_id
    }

class ErkeAPI:
    def __init__(self, member_id, enterprise_id, unionid, openid, wx_openid, account_name):
        self.member_id = member_id
        self.enterprise_id = enterprise_id
        self.unionid = unionid
        self.openid = openid
        self.wx_openid = wx_openid
        self.account_name = account_name
        self.appid = "wxa1f1fa3785a47c7d"
        self.base_url = 'https://hope.demogic.com/gic-wx-app'
        self.ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF'

    def get_headers(self, sign_val: str) -> Dict[str, str]:
        return {
            'User-Agent': self.ua,
            'Content-Type': 'application/x-www-form-urlencoded',
            'sign': sign_val, # 注意：原逻辑此处传入的是enterprise_id
            'channelEntrance': 'wx_app',
            'Referer': 'https://servicewechat.com/wxa1f1fa3785a47c7d/85/page-frame.html',
        }

    def get_integral(self):
        """查询积分明细"""
        sign_data = calculate_sign(self.appid, self.member_id)
        data = {
            'currentPage': 1,
            'pageSize': 20,
            'memberId': self.member_id,
            'cliqueId': '-1',
            'enterpriseId': self.enterprise_id,
            'unionid': self.unionid,
            'openid': self.openid,
            'wxOpenid': self.wx_openid,
            'random': sign_data['random'],
            'appid': self.appid,
            'transId': sign_data['transId'],
            'sign': sign_data['sign'],
            'timestamp': sign_data['timestamp'],
            'gicWxaVersion': '3.9.56'
        }
        
        try:
            res = requests.post(f"{self.base_url}/integral_record.json", 
                                headers=self.get_headers(self.enterprise_id), 
                                data=data, timeout=10).json()
            response_obj = res.get('response', {})
            accumulate = response_obj.get('accumulatPoints', 0)
            logger.info(f"[{self.account_name}] 当前累计积分: {accumulate}")
            return accumulate
        except Exception as e:
            logger.error(f"[{self.account_name}] 积分查询异常: {e}")
            return "未知"

    def sign_in(self):
        """执行签到"""
        sign_data = calculate_sign(self.appid, self.member_id)
        payload = {
            'source': 'wxapp',
            'memberId': self.member_id,
            'cliqueId': '-1',
            'enterpriseId': self.enterprise_id,
            'unionid': self.unionid,
            'openid': self.openid,
            'wxOpenid': self.wx_openid,
            'sign': sign_data['sign'],
            'random': sign_data['random'],
            'appid': self.appid,
            'transId': sign_data['transId'],
            'timestamp': sign_data['timestamp'],
            'gicWxaVersion': '3.9.56'
        }
        
        headers = self.get_headers(self.enterprise_id)
        headers['Content-Type'] = 'application/json;charset=UTF-8'

        try:
            res = requests.post(f"{self.base_url}/sign/member_sign.json", 
                                headers=headers, json=payload, timeout=10).json()
            msg = res.get('message', '无返回信息')
            code = res.get('code')
            if code in ['0000', '1001', 0]:
                logger.info(f"[{self.account_name}] 签到结果: {msg}")
                return True, msg
            else:
                logger.warning(f"[{self.account_name}] 签到失败: {msg}")
                return False, msg
        except Exception as e:
            logger.error(f"[{self.account_name}] 签到请求异常: {e}")
            return False, str(e)

def main():
    # 尝试从环境变量读取配置
    conf_str = os.getenv("ERKE_CONF", "")
    if not conf_str:
        logger.error("未找到环境变量 ERKE_CONF，请检查配置！")
        return
    # 处理多账号，支持换行或 & 分隔
    accounts_raw = conf_str.replace("&", "\n").splitlines()
    summary = []

    for line in accounts_raw:
        if not line.strip(): continue
        
        params = line.strip().split("#")
        if len(params) < 5:
            logger.error(f"账号配置格式错误 (需5个#分隔): {line}")
            continue
        
        # 提取参数
        m_id, e_id, uid, oid, wx_oid = params[:5]
        name = params[5] if len(params) > 5 else f"账号_{m_id[-4:]}"
        
        api = ErkeAPI(m_id, e_id, uid, oid, wx_oid, name)
        
        # 执行流程
        points_before = api.get_integral()
        success, msg = api.sign_in()
        points_after = api.get_integral()
        
        status_emoji = "✅" if success else "❌"
        summary.append(f"{status_emoji} 【{name}】: {msg} (积分: {points_before} -> {points_after})")

    # 打印最终统计
    print("\n" + "="*30)
    print("      鸿星尔克任务简报")
    print("="*30)
    print("\n".join(summary))
    
    # 如果有通知推送逻辑，可以在此处调用
    # send_notification("鸿星尔克签到", "\n".join(summary))

if __name__ == "__main__":
    main()