#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
new Env('上海云媒体积分任务');
cron: 10 8 * * *

【使用说明】
1. 环境变量名: SHYP_ACCOUNTS
2. 格式要求: 
   - 多个账号之间用 & 或者 换行 分隔。
   - 账号内部参数用 # 分隔，顺序为：token#device_id#备注名
   
   例如：
   export SHYP_ACCOUNTS="token1#device1#张三 & token2#device2#李四"
"""

import os
import re
import time
import random
import logging
import requests
from typing import Dict, Any, Optional

# ==================== 配置与日志 ====================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SHYP")

# 随机延迟设置
DELAY_ACCOUNTS = (5, 12)
DELAY_TASKS = (3, 6)
COMMENT_POOL = ["👍", "支持", "不错", "很好", "赞", "学习了"]

# ==================== API 核心类 ====================
class ShypAPI:
    def __init__(self, token: str, device_id: str, name: str):
        self.base_url = "https://app.ypmedia.cn"
        self.token = token
        self.device_id = device_id
        self.name = name
        self.site_id = "310110"
        self.headers = {
            "User-Agent": "okhttp/4.10.0",
            "deviceid": self.device_id,
            "siteid": self.site_id,
            "token": self.token,
            "Content-Type": "application/json; charset=UTF-8"
        }

    def _post(self, endpoint: str, data: Dict = None) -> Optional[Dict]:
        try:
            res = requests.post(f"{self.base_url}{endpoint}", json=data, headers=self.headers, timeout=15)
            return res.json()
        except Exception as e:
            logger.error(f"请求失败: {e}")
            return None

    def get_info(self):
        return self._post("/media-basic-port/api/app/personal/score/info", 
                         {"orderBy": "release_desc", "requestType": "2", "siteId": self.site_id})

    def get_articles(self, channel_id: str, size: int):
        return self._post("/media-basic-port/api/app/news/content/list", 
                         {"channel": {"id": channel_id}, "pageNo": 1, "pageSize": size, 
                          "orderBy": "release_desc", "requestType": "1", "siteId": self.site_id})

# ==================== 任务执行器 ====================
class ShypRunner:
    def __init__(self, api: ShypAPI):
        self.api = api

    def start(self):
        logger.info(f"🚀 开始处理账号: {self.api.name}")
        info = self.api.get_info()
        if not info or info.get("code") != 0:
            logger.error(f"❌ {self.api.name} Token无效或获取失败")
            return

        data = info.get("data", {})
        logger.info(f"📊 当前积分: {data.get('totalScore')} | 今日已获: {data.get('todayPoint')}")

        for job in data.get("jobs", []):
            if job.get("status") == "1": continue
            
            title = job.get("title")
            need = job.get("totalProgress", 0) - job.get("progress", 0)
            if need <= 0: continue

            if "阅读" in title: self.do_read(need)
            elif "视频" in title: self.do_video(need)
            elif "收藏" in title: self.do_favor(need)
            elif "评论" in title: self.do_comment(need)
            elif "分享" in title: self.do_share(need)
            
            time.sleep(random.uniform(*DELAY_TASKS))

    def do_read(self, count):
        logger.info(f"📖 准备阅读 {count} 篇文章")
        res = self.api.get_articles("a978f44b3e284e5e86777f9d4e3be7bb", count)
        for a in res.get("data", {}).get("records", [])[:count]:
            self.api._post("/media-basic-port/api/app/common/count/usage/inc", 
                          {"countType": "contentRead", "id": a['id'], "requestType": "1", "siteId": self.api.site_id})
            self.api._post("/media-basic-port/api/app/points/read/add", {"requestType": "1", "siteId": self.api.site_id})
            logger.info(f"✅ 已阅: {a['title'][:12]}")
            time.sleep(random.uniform(2, 4))

    def do_video(self, count):
        logger.info(f"📺 准备观看 {count} 个视频")
        res = self.api.get_articles("d7036c2839e047b48fe64bc36987650c", count)
        for v in res.get("data", {}).get("records", [])[:count]:
            self.api._post("/media-basic-port/api/app/points/video/add", {"requestType": "1", "siteId": self.api.site_id})
            logger.info(f"✅ 已看: {v['title'][:12]}")
            time.sleep(random.uniform(5, 8))

    def do_favor(self, count):
        res = self.api.get_articles("a978f44b3e284e5e86777f9d4e3be7bb", count)
        for a in res.get("data", {}).get("records", [])[:count]:
            self.api._post("/media-basic-port/api/app/news/content/favor", {"id": a['id']})
            logger.info(f"✅ 已收藏: {a['title'][:12]}")
            time.sleep(2)

    def do_comment(self, count):
        res = self.api.get_articles("a978f44b3e284e5e86777f9d4e3be7bb", count)
        for a in res.get("data", {}).get("records", [])[:count]:
            self.api._post("/media-basic-port/api/app/common/comment/add", 
                          {"content": random.choice(COMMENT_POOL), "targetType": "content", "targetId": a['id']})
            logger.info(f"✅ 已评论: {a['title'][:12]}")
            time.sleep(4)

    def do_share(self, count):
        for _ in range(count):
            self.api._post("/media-basic-port/api/app/points/share/add", {"requestType": "1", "siteId": self.api.site_id})
            logger.info("✅ 已分享任务")
            time.sleep(2)

# ==================== 主程序入口 ====================
def main():
    conf = os.getenv("SHYP_ACCOUNTS", "")
    if not conf:
        logger.error("❌ 未找到环境变量 SHYP_ACCOUNTS")
        return

    # 1. 按照 & 或者 换行符 分割出多个账号
    account_blocks = re.split(r'[&\n]+', conf.strip())
    
    for idx, block in enumerate(account_blocks):
        block = block.strip()
        if not block: continue
        
        # 2. 按照 # 分割内部参数 (token#device_id#name)
        parts = block.split('#')
        
        if len(parts) < 2:
            logger.warning(f"⚠️ 第 {idx+1} 个账号格式错误，需至少包含 token#device_id")
            continue
            
        token = parts[0].strip()
        device_id = parts[1].strip()
        name = parts[2].strip() if len(parts) > 2 else f"账号{idx+1}"

        api = ShypAPI(token, device_id, name)
        runner = ShypRunner(api)
        try:
            runner.start()
        except Exception as e:
            logger.error(f"💥 运行异常: {e}")
            
        if idx < len(account_blocks) - 1:
            wait_time = random.uniform(*DELAY_ACCOUNTS)
            logger.info(f"💤 等待 {wait_time:.1f} 秒处理下一个账号...")
            time.sleep(wait_time)

if __name__ == "__main__":
    main()