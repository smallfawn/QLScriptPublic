#51代理每日签到
import requests
from bs4 import BeautifulSoup
import time
import os

def login_to_51daili():
    # 从环境变量读取账号和密码
    username = os.getenv('dali51user')
    password = os.getenv('daili51pass')
    
    if not username or not password:
        print("错误: 请设置环境变量 dali51user 和 daili51pass")
        return None
    
    # 第一次请求获取登录令牌和PHPSESSID
    print("正在获取登录令牌和PHPSESSID...")
    session = requests.Session()
    
    try:
        # 初始headers，仅包含User-Agent
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # 发送GET请求获取登录页面
        response = session.get('https://www.51daili.com', headers=headers, timeout=10)
        response.raise_for_status()
        
        # 从响应头中获取PHPSESSID
        phpsessid = None
        if 'set-cookie' in response.headers:
            cookies = response.headers['set-cookie'].split(';')
            for cookie in cookies:
                if 'PHPSESSID' in cookie:
                    phpsessid = cookie.split('=')[1]
                    break
        
        # 解析HTML获取令牌
        soup = BeautifulSoup(response.text, 'html.parser')
        token_input = soup.find('input', {'name': '__login_token__'})
        
        if token_input:
            login_token = token_input.get('value')
            print(f"成功获取登录令牌: {login_token}")
        else:
            print("未找到登录令牌，使用默认令牌")
            login_token = "14f2877f31842495ff24e3d73036158a"
        
        if phpsessid:
            print(f"成功获取PHPSESSID: {phpsessid}")
        else:
            print("未能从响应头中获取PHPSESSID，使用默认值")
            phpsessid = "qkheban0ocfthart1bk7s861kn"
        
        # 准备登录数据和更新headers
        login_data = {
            '__login_token__': login_token,
            'account': username,
            'password': password,
            'ticket': '1',
            'keeplogin': '1',
            'is_read': '1'
        }
        
        # 更新headers，添加Cookie
        headers['Cookie'] = f"PHPSESSID={phpsessid};tncode_check=ok"
        
        print("正在尝试登录...")
        time.sleep(1)  # 添加短暂延迟
        
        # 发送POST请求进行登录
        login_url = 'https://www.51daili.com/index/user/login.html'
        login_response = session.post(login_url, data=login_data, headers=headers, timeout=10)
        login_response.raise_for_status()
        
        # 检查登录是否成功
        if login_response.status_code == 200:
            print("登录请求已发送，状态码: 200")
            
            # 尝试从响应头中查找token
            print("响应头:", login_response.headers)
            
            token = None
            # 检查Set-Cookie头
            if 'set-cookie' in login_response.headers:
                cookies = login_response.headers['set-cookie'].split(';')
                for cookie in cookies:
                    if 'token' in cookie.lower():
                        print(f"找到token cookie: {cookie}")
                        # 提取token值
                        token_parts = cookie.split('=')
                        if len(token_parts) >= 2:
                            token = token_parts[1].strip()
                            break
            
            # 如果没有在Set-Cookie中找到，检查其他头字段
            if not token:
                for key, value in login_response.headers.items():
                    if 'token' in key.lower():
                        print(f"找到token头: {key}: {value}")
                        token = value
                        break
            
            if token:
                print(f"成功获取token: {token}")
                
                # 使用token请求签到页面
                signin_headers = headers.copy()
                # 添加token到Cookie
                signin_headers['Cookie'] = f"{signin_headers.get('Cookie', '')}; token={token}"
                signin_headers['Referer'] = 'https://www.51daili.com/'
                
                print("正在请求签到页面...")
                signin_response = session.get(
                    'https://www.51daili.com/index/user/signin.html',
                    headers=signin_headers,
                    timeout=10
                )
                signin_response.raise_for_status()
                
                print("签到页面响应内容:")
                print(signin_response.text)
            else:
                print("未能从登录响应中提取token")
        else:
            print(f"登录请求返回异常状态码: {login_response.status_code}")
            
        return session
        
    except requests.exceptions.RequestException as e:
        print(f"请求过程中发生错误: {e}")
        return None

if __name__ == "__main__":
    print("51代理登录示例")
    print("=" * 30)
    
    session = login_to_51daili()
    
    if session:
        print("登录流程完成")
        # 这里可以继续使用session进行后续操作
    else:
        print("登录失败")
