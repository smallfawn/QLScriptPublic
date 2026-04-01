"""
new Env("书亦烧仙草python版")
1. 书亦烧仙草签到 抓包scrm-prod.shuyi.org.cn域名请求头里的auth
   脚本仅供学习交流使用, 请在下载后24h内删除
2. cron 以防ocr识别出错每天运行两次左右
3. ddddocr搭建方法https://github.com/sml2h3/ocr_api_server #如果脚本里的失效请自行搭建
"""
import json,logging,os,sys,time,base64,requests
from os import environ, system, path

logger = logging.getLogger(name=None)
logging.Formatter("%(message)s")
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())

def load_send():
    global send, mg
    cur_path = path.abspath(path.dirname(__file__))
    if path.exists(cur_path + "/notify.py"):
        try:
            from notify import send
            print("加载通知服务成功！")
        except:
            send = False
            print("加载通知服务失败~")
    else:
        send = False
        print("加载通知服务失败~")

load_send()

try:
    from Crypto.Cipher import AES
except:
    logger.info(
        "\n未检测到pycryptodome\n需要Python依赖里安装pycryptodome\n安装失败先linux依赖里安装gcc、python3-dev、libc-dev\n如果还是失败,重启容器,或者重启docker就能解决")
    exit(0)

def setHeaders(i):
    headers = {
        "auth": cookies[i],
        "hostname": "scrm-prod.shuyi.org.cn",
        "content-type": "application/json",
        "host": "scrm-prod.shuyi.org.cn",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; V2203A Build/SP1A.210812.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.5304.141 Mobile Safari/537.36 XWEB/5023 MMWEBSDK/20221012 MMWEBID/1571 MicroMessenger/8.0.30.2260(0x28001E55) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android"
    }
    return headers

cookies = []
try:
    cookies = os.environ["sysxc_auth"].split("&")
    if len(os.environ["sysxc_auth"]) > 0:
        logger.info("已获取并使用Env环境Cookie\n声明：本脚本为学习python，请勿用于非法用途\n")
            

except:
    logger.info(
        "【提示】请先添加sysxc_auth")
    exit(3)

def getVCode(headers):
    """获取滑块图片"""
    data = {
        "captchaType": "blockPuzzle",
        "clientUid": "slider-6292e85b-e871-4abd-89df-4d97709c6e0c",
        "ts": int(time.time() * 1000)
    }
    url = 'https://scrm-prod.shuyi.org.cn/saas-gateway/api/agg-trade/v1/signIn/getVCode'
    response = requests.post(url, json=data, headers=headers)
    return response.json()



def ocr(tg,bg):
    """使用自有ocr识别滑块坐标"""
    url = 'http://103.45.185.224:9898/slide/match/b64/json'
    jsonstr = json.dumps({'target_img': tg, 'bg_img': bg})
    response = requests.post(url, data=base64.b64encode(jsonstr.encode()).decode())
    return response.json()


'''
采用AES对称加密算法
'''

BLOCK_SIZE = 16  # Bytes
pad = lambda s: s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * \
                chr(BLOCK_SIZE - len(s) % BLOCK_SIZE)
unpad = lambda s: s[:-ord(s[len(s) - 1:])]


def aesEncrypt(key, data):
    '''
    AES的ECB模式加密方法
    :param key: 密钥
    :param data:被加密字符串（明文）
    :return:密文
    '''
    key = key.encode('utf8')
    # 字符串补位
    data = pad(data)
    cipher = AES.new(key, AES.MODE_ECB)
    # 加密后得到的是bytes类型的数据，使用Base64进行编码,返回byte字符串
    result = cipher.encrypt(data.encode())
    encodestrs = base64.b64encode(result)
    enctext = encodestrs.decode('utf8')
    return enctext


def aesDecrypt(key, data):
    '''
    :param key: 密钥
    :param data: 加密后的数据（密文）
    :return:明文
    '''
    key = key.encode('utf8')
    data = base64.b64decode(data)
    cipher = AES.new(key, AES.MODE_ECB)

    # 去补位
    text_decrypted = unpad(cipher.decrypt(data))
    text_decrypted = text_decrypted.decode('utf8')
    return text_decrypted


def checkVCode(pointJson, token):
    """验证"""
    try:
        data = {
            "captchaType": "blockPuzzle",
            "pointJson": pointJson,
            "token": token
        }
        
        url = 'https://scrm-prod.shuyi.org.cn/saas-gateway/api/agg-trade/v1/signIn/checkVCode'
        response = requests.post(url, json=data, headers=headers)
        result = response.json()
        resultCode = result['resultCode']
        resultMsg = result['resultMsg']
        if resultCode == '0000':
            logger.info(f"校验结果：成功")
        else:
            logger.info(f"校验结果： {resultMsg}")
            time.sleep(3)
            main()
    except Exception as err:
        print(err)


def check_sign(pointJson):
    """签到"""
    try:
        data = {
            "captchaVerification": pointJson
        }
        url = 'https://scrm-prod.shuyi.org.cn/saas-gateway/api/agg-trade/v1/signIn/insertSignInV3'
        response = requests.post(url, json=data, headers=headers)
        result = response.json()
        resultCode = result['resultCode']
        
        resultMsg = result['resultMsg']
        if resultCode == '0':
            logger.info(f"签到结果：{result}")
            send('书亦烧仙草签到通知', result)
        else:
            logger.info(f"签到结果： {resultMsg}")
            send('书亦烧仙草签到通知', resultMsg)
    except Exception as err:
        print(err)
        sys.exit(0)

def main():
    logger.info("--------------------任务开始--------------------")
    result = getVCode(headers)
    bg = result['data']['originalImageBase64']
    tg = result['data']['jigsawImageBase64']
    key = result['data']['secretKey']
    token = result['data']['token']
    logger.info(f"本次口令为： {token}")
    logger.info(f"本次密钥为： {key}")
    time.sleep(1.5)
    logger.info("--------------------识别滑块--------------------")
    result = ocr(tg,bg)
    res = result['result']['target']
    d = (res[0])
    logger.info(f"滑动距离为： {d}")
    logger.info("--------------------执行算法--------------------")
    aes_str = json.dumps({"x": d, "y": 5})
    data = aes_str.replace(' ', '')
    logger.info(f"加密前： {data}")
    time.sleep(1.5)
    ecdata = aesEncrypt(key, data)
    aesDecrypt(key, ecdata)
    pointJson = aesEncrypt(key, data)
    logger.info(f"加密后： {pointJson}")
    logger.info("--------------------校验滑块--------------------")
    checkVCode(pointJson, token)
    logger.info("--------------------开始签到--------------------")
    str = (token + '---' + aes_str)
    data = str.replace(' ', '')
    ecdata = aesEncrypt(key, data)
    aesDecrypt(key, ecdata)
    pointJson = aesEncrypt(key, data)
    time.sleep(0.5)
    check_sign(pointJson)

if __name__ == '__main__':
    for i in range(len(cookies)):
        logger.info(f"\n开始第{i + 1}个账号")
        
        headers = setHeaders(i)
        main()
    logger.info("所有账号执行完成\n")
    sys.exit(0)

