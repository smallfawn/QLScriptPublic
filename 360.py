#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# 作者: 青龙面板适配
# 说明: 360社区自动签到脚本（青龙面板专用）
# 依赖: requests
# 用法: 在青龙面板环境变量中设置 BBS360_COOKIE
#      请确保Cookie包含 __cfduid, uid 等必要字段

import os
import re
import time
import random
import requests
from dataclasses import dataclass
from typing import Optional, Tuple

SIGN_PAGE = "https://bbs.360.cn/dsu_paulsign-sign.html"
SIGN_API = "https://bbs.360.cn/plugin.php?id=dsu_paulsign:sign&operation=qiandao&infloat=1&inajax=1"

@dataclass
class CheckinResult:
    ok: bool
    status: str
    detail: str

class BBS360Checkin:
    """360社区签到客户端（青龙面板适配）"""
    def __init__(self, cookie: str, timeout: int = 20):
        self.cookie = cookie.strip()
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Connection": "keep-alive",
            "Cookie": self.cookie,
            "Referer": "https://bbs.360.cn/",
        })

    def fetch_formhash(self) -> Tuple[Optional[str], str]:
        """拉取签到页并提取 formhash"""
        resp = self.session.get(SIGN_PAGE, timeout=self.timeout, allow_redirects=True)
        text = resp.text or ""
        
        # 青龙面板特殊处理：如果返回403，可能是需要验证
        if resp.status_code == 403:
            return None, "403 Forbidden（可能需要绑定手机号）"
            
        # 未登录/未绑定手机号时提示
        if "您需要先登录才能继续本操作" in text or "请使用手机微信扫码安全登录" in text:
            return None, "未登录或账号未绑定手机号（需在360社区绑定手机号）"
        
        # 提取 formhash
        m = re.search(r'formhash=([0-9a-zA-Z]{6,})', text)
        if not m:
            m = re.search(r'name="formhash"\s+value="([0-9a-zA-Z]{6,})"', text)
        
        if not m:
            return None, "未解析到 formhash（页面结构可能变更）"
        
        return m.group(1), "OK"

    def submit_checkin(self, formhash: str) -> CheckinResult:
        """提交签到请求"""
        moods = ["kx", "ym", "tp", "ng", "wl"]
        payload = {
            "formhash": formhash,
            "qdxq": random.choice(moods),
            "qdmode": "1",
            "todaysay": random.choice([
                "打卡签到，愿一切顺利！",
                "新的一天，继续加油～",
                "保持热爱，奔赴山海。",
                "今日签到，万事胜意。",
                "坚持自律，慢慢变强。",
            ]),
            "fastreply": "0",
        }

        resp = self.session.post(SIGN_API, data=payload, timeout=self.timeout)
        raw = resp.text or ""
        
        # 青龙面板特殊处理：返回403或500
        if resp.status_code != 200:
            return CheckinResult(False, f"http_{resp.status_code}", f"HTTP {resp.status_code}")
        
        # 检查签到结果
        if "签到成功" in raw or ("恭喜" in raw and "签到" in raw):
            return CheckinResult(True, "success", self._extract_message(raw) or "签到成功")
        if "已经签到" in raw or "已签到" in raw or "请勿重复签到" in raw:
            return CheckinResult(True, "already", self._extract_message(raw) or "今日已签到")
        if ("formhash" in raw and "错误" in raw) or "请求无效" in raw:
            return CheckinResult(False, "bad_formhash", self._extract_message(raw) or "formhash无效/过期")
        
        return CheckinResult(False, "unknown", self._extract_message(raw) or raw[:200])

    @staticmethod
    def _extract_message(text: str) -> str:
        """提取提示信息"""
        m = re.search(r"showmessage\('([^']+)'\)", text)
        if m:
            return m.group(1)
        
        m = re.search(r"([^\n\r]{0,20}(签到|已签到|重复签到)[^\n\r]{0,40})", text)
        if m:
            return m.group(1)
        
        return ""

    def run(self) -> CheckinResult:
        formhash, info = self.fetch_formhash()
        if not formhash:
            return CheckinResult(False, "no_login_or_parse_failed", info)
        
        time.sleep(random.uniform(1.0, 2.5))
        return self.submit_checkin(formhash)

def main():
    # 青龙面板专用：从环境变量获取Cookie
    cookie = os.getenv("BBS360_COOKIE", "").strip()
    
    if not cookie:
        print("❌ 未设置环境变量 BBS360_COOKIE")
        print("💡 请在青龙面板 → 环境变量 → 添加以下内容：")
        print("   KEY: BBS360_COOKIE")
        print("   VALUE: 从浏览器复制的完整Cookie（包含__cfduid, uid等）")
        return
    
    # 青龙面板特殊处理：检测Cookie是否包含必要字段
    if "__cfduid" not in cookie or "uid" not in cookie:
        print("❌ Cookie无效：缺少必要字段（需包含__cfduid和uid）")
        print("💡 请重新复制Cookie：")
        print("   1. 登录 bbs.360.cn → F12 → Application → Cookies")
        print("   2. 复制 bbs.360.cn 下的所有Cookie字段")
        return
    
    client = BBS360Checkin(cookie=cookie, timeout=20)
    result = client.run()

    # 青龙面板专用输出格式
    if result.ok:
        print(f"✅ 360签到成功 | {result.status} | {result.detail}")
    else:
        print(f"❌ 360签到失败 | {result.status} | {result.detail}")

if __name__ == "__main__":
    main()