#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import logging
import sys
from typing import List, Dict, Any
from pathlib import Path
from api import ErkeAPI

# === 青龙面板专用配置 ===
# 1. 脚本需放置在 /ql/scripts 目录
# 2. 配置文件需放在 /ql/config/token.json
# 3. 依赖模块需在 /ql/lib 目录（api.py/notification.py）
# ======================

# 青龙环境标准路径
project_root = Path("/ql")
sys.path.insert(0, str(project_root / "lib"))

# 配置日志（青龙默认使用INFO级别）
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("erke_sign")

class ErkeTasks:
    """鸿星尔克签到任务自动化执行类（青龙面板专用）"""
    def __init__(self, config_path: str = None):
        """初始化任务执行器
        Args:
            config_path: 配置文件路径（青龙默认使用 /ql/config/token.json）
        """
        # 青龙标准配置路径
        self.config_path = Path("/ql/config/token.json") if config_path is None else Path(config_path)
        self.accounts: List[Dict[str, Any]] = []
        self.account_results: List[Dict[str, Any]] = []
        self._init_accounts()

    def _init_accounts(self):
        """从青龙配置文件读取账号信息"""
        if not self.config_path.exists():
            logger.error(f"配置文件不存在: {self.config_path}")
            raise FileNotFoundError(f"请在 /ql/config/ 创建 token.json 配置文件")
        
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                config_data = json.load(f)
                erke_config = config_data.get('erke', {})
                self.accounts = erke_config.get('accounts', [])
            
            if not self.accounts:
                logger.warning("配置文件中没有找到 erke 账号信息")
            else:
                logger.info(f"成功加载 {len(self.accounts)} 个账号配置")
                
        except json.JSONDecodeError as e:
            logger.error(f"配置文件JSON解析失败: {e}")
            raise
        except Exception as e:
            logger.error(f"读取配置文件失败: {e}")
            raise

    def process_account(self, account: Dict[str, Any]) -> Dict[str, Any]:
        """处理单个账号任务"""
        account_name = account.get('account_name', '未命名账号')
        logger.info(f"\n{'='*50}")
        logger.info(f"开始处理账号: {account_name}")
        logger.info(f"{'='*50}")
        
        result = {
            'account_name': account_name,
            'success': False,
            'integral_info': None,
            'sign_info': None,
            'error': None
        }

        try:
            # 初始化API
            api = ErkeAPI(
                member_id=account.get('member_id', ''),
                enterprise_id=account.get('enterprise_id', ''),
                unionid=account.get('unionid', ''),
                openid=account.get('openid', ''),
                wx_openid=account.get('wx_openid', ''),
                user_agent=account.get('user_agent')
            )
            
            # 1. 查询积分明细
            logger.info(f"[{account_name}] 查询积分明细...")
            integral_result = api.get_integral_record(current_page=1, page_size=5)
            
            if integral_result['success']:
                result['integral_info'] = integral_result['result']
                logger.info(f"[{account_name}] 积分明细查询成功")
                
                # 解析积分信息
                if integral_result['result'] and isinstance(integral_result['result'], dict):
                    response = integral_result['result'].get('response', {})
                    if isinstance(response, dict):
                        accumulate_points = response.get('accumulatPoints', 0)
                        frozen_points = response.get('frozenPoints', 0)
                        available_points = accumulate_points - frozen_points
                        
                        logger.info(f"[{account_name}] 累计积分: {accumulate_points}")
                        logger.info(f"[{account_name}] 冻结积分: {frozen_points}")
                        logger.info(f"[{account_name}] 可用积分: {available_points}")
                        
                        page_data = response.get('page', {})
                        if page_data:
                            total_count = page_data.get('totalCount', 0)
                            logger.info(f"[{account_name}] 积分记录数: {total_count}")
            else:
                logger.warning(f"[{account_name}] 积分明细查询失败: {integral_result['error']}")
            
            # 2. 执行签到
            logger.info(f"[{account_name}] 执行签到...")
            sign_result = api.member_sign()
            
            if sign_result['success']:
                result['sign_info'] = sign_result['result']
                if sign_result['result'] and isinstance(sign_result['result'], dict):
                    code = sign_result['result'].get('code', '')
                    message = sign_result['result'].get('message', '')
                    
                    # code: 1001 表示已签到，0000 表示签到成功
                    if code == '0000':
                        result['success'] = True
                        logger.info(f"[{account_name}] 签到成功: {message}")
                    elif code == '1001':
                        result['success'] = True
                        logger.info(f"[{account_name}] {message}")
                    else:
                        result['success'] = False
                        result['error'] = message
                        logger.warning(f"[{account_name}] 签到返回: {message}")
                else:
                    result['success'] = True
                    logger.info(f"[{account_name}] 签到完成")
            else:
                result['error'] = sign_result['error']
                logger.error(f"[{account_name}] 签到失败: {sign_result['error']}")
                
        except Exception as e:
            error_msg = f"处理账号时发生异常: {str(e)}"
            logger.error(f"[{account_name}] {error_msg}")
            result['error'] = error_msg
            
        return result

    def run(self):
        """执行所有账号的签到任务"""
        logger.info("="*60)
        logger.info("鸿星尔克签到任务开始执行")
        logger.info("="*60)
        
        if not self.accounts:
            logger.error("没有可处理的账号")
            return
            
        # 处理每个账号
        for account in self.accounts:
            result = self.process_account(account)
            self.account_results.append(result)
            
        # 输出统计信息
        self._print_summary()
        # 发送通知
        self._send_notification()
        
    def _print_summary(self):
        """输出执行结果统计"""
        logger.info("\n" + "="*60)
        logger.info("执行结果统计")
        logger.info("="*60)
        
        success_count = sum(1 for r in self.account_results if r['success'])
        fail_count = len(self.account_results) - success_count
        
        logger.info(f"总账号数: {len(self.account_results)}")
        logger.info(f"成功: {success_count}")
        logger.info(f"失败: {fail_count}")
        
        if fail_count > 0:
            logger.info("\n失败账号详情:")
            for result in self.account_results:
                if not result['success']:
                    logger.info(f"  - {result['account_name']}: {result['error']}")
                    
    def _send_notification(self):
        """发送执行结果通知"""
        try:
            success_count = sum(1 for r in self.account_results if r['success'])
            total_count = len(self.account_results)
            
            # 构建通知内容
            content_lines = [
                f"📊 执行统计:",
                f"  - 总账号数: {total_count}",
                f"  - 成功: {success_count}",
                f"  - 失败: {total_count - success_count}",
            ]
            
            content_lines.append("\n📋 账号详情:")
            for result in self.account_results:
                status = "✅" if result['success'] else "❌"
                content_lines.append(f"  {status} {result['account_name']}")
                if result['success'] and result['sign_info']:
                    if isinstance(result['sign_info'], dict):
                        message = result['sign_info'].get('message', '')
                        if message:
                            content_lines.append(f"     └─ {message}")
            
            content = "\n".join(content_lines)
            
            # 发送通知（青龙支持的推送方式）
            send_notification(
                title="鸿星尔克签到任务完成",
                content=content,
                sound=NotificationSound.BIRDSONG
            )
            logger.info("通知发送成功")
            
        except Exception as e:
            logger.error(f"发送通知失败: {str(e)}")

def main():
    """主函数（青龙面板执行入口）"""
    try:
        tasks = ErkeTasks()
        tasks.run()
    except Exception as e:
        logger.error(f"程序执行失败: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()