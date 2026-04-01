
'''
topspace微信小程序


new Env('topspace');
抓x-vcs-user-token和app-id用&分割并且多号@
'''
import requests
import os

class AC:
    def __init__(self, cookie):
        self.headers = {
            'User-Agent': "Mozilla/5.0 (Linux; Android 12; RMX3562 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.6261.120 Mobile Safari/537.36 XWEB/1220133 MMWEBSDK/20240404 MMWEBID/2307 MicroMessenger/8.0.49.2600(0x28003133) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
            'app-id': cookie.split('&')[1],
            'x-vcs-user-token': cookie.split('&')[0]
        }

    def info(self):
        url = "https://m.sda.changan.com.cn/app-apigw/user-info-api/api/v1/sda-app/personal-info/basic-information"
        response = requests.get(url, headers=self.headers)
        data = response.json()
        if data['code'] == 0:
            userNickname = data["data"]["userNickname"]
            totalPoints = data["data"]["pointInfo"]["totalPoints"]
            print(f"用户:{userNickname}当前共有{totalPoints}币")
            return userNickname
        else:
            msg = data["msg"]
            print(f"登录失败: {msg}")
            return None

    def check(self, userNickname):
        url = "https://m.sda.changan.com.cn/app-apigw/user-info-api/api/v2/point/check-in"
        response = requests.post(url, headers=self.headers)
        data = response.json()
        if data['code'] == 0:
            description = data["data"]["description"]
            total = data["data"]["total"]
            print(f"用户:{userNickname}{description}获得{total}TOP币")
        else:
            msg = data["msg"]
            print(f"签到失败: {msg}")

    def list_articles(self, userNickname):
        url = "https://m.sda.changan.com.cn/app-apigw/sda-zone-api/api/v1/post/list"
        data = {
            "section_id": "1002",
            "page": {
                "current_page": 1,
                "page_size": 20
            },
            "sort_type": "RECOMMEND_FIRST"
        }
        response = requests.post(url, headers=self.headers, json=data)
        data = response.json()
        if data['code'] == 0:
            article_id = data["data"]["list"][0]["id"]
            print(f"用户:{userNickname}获取文章{article_id}")
            return article_id
        else:
            msg = data["msg"]
            print(f"获取文章失败: {msg}")

    def publish_comment(self, userNickname, article_id):
        url = "https://m.sda.changan.com.cn/app-apigw/sda-zone-api/api/v1/comment/publish"
        data = {
            "content": "很酷",
            "post_id": article_id
        }
        response = requests.post(url, headers=self.headers, json=data)
        data = response.json()
        if data['code'] == 0:
            print("发布成功")
        else:
            print(f"发布失败: {data['msg']}")

    def share_article(self, userNickname, article_id):
        url = "https://m.sda.changan.com.cn/app-apigw/sda-zone-api/api/v1/action/share"
        data = {
            "post_id": article_id
        }
        response = requests.post(url, headers=self.headers, json=data)
        data = response.json()
        if data['code'] == 0:
            print("转发成功")
        else:
            print(f"转发失败: {data['msg']}")

if __name__ == "__main__":
    topspace = os.environ.get('topspace')
    if not topspace:
        print("请设置环境变量 'topspace' 后再运行")
    else:
        topspace_list = topspace.split('@')
        for num, topspace_item in enumerate(topspace_list, start=1):
            x_vcs_user_token, app_id = topspace_item.split('&')
            cookie = f"{x_vcs_user_token}&{app_id}"
            ac = AC(cookie)
            print(f"=====开始执行第{num}个账号任务=====")
            user_nickname = ac.info()
            if user_nickname:
                ac.check(user_nickname)
                article_id = ac.list_articles(user_nickname)
                if article_id:
                    ac.publish_comment(user_nickname, article_id)
                    ac.share_article(user_nickname, article_id)
            print("---------账号任务执行完毕---------")
