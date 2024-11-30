# QLScriptpublic
# JD 京东账密登录协议版本已发布 DOCKER一键部署 对接青龙 对接BOT
购买地址
http://smshop.back1.idcfengye.com/

体验地址
http://smjd.back1.idcfengye.com/



# 由于特殊原因可能最近几年不会写脚本了 特此招收30名脚本携手共创QLPublicScript仓库 请把GITHUB用户名饲料发送给我 我给你们申请上传和编辑权限
https://github.com/PickHeBin/Python-111
time:2024/08/03

本仓库魔改通知  smallfawnPushWhite白名单 smallfawnPushBlack黑名单 二选一
``````
export smallfawnPushWhite="脚本名字@脚本名字2"
``````
# 组织基地：QQ群1021185005
# 青龙面板拉库命令
``````
ql repo https://mirror.ghproxy.com/https://github.com/smallfawn/QLScriptPublic.git
``````
自用青龙docker搭建命令
``````
#老版青龙(2.11.3)搭建命令
docker run -dit \
   -v $PWD/ql/config:/ql/config \
   -v $PWD/ql/log:/ql/log \
   -v $PWD/ql/db:/ql/db \
   -v $PWD/ql/repo:/ql/repo \
   -v $PWD/ql/raw:/ql/raw \
   -v $PWD/ql/scripts:/ql/scripts \
   -v $PWD/ql/deps:/ql/deps \
   -p 5700:5700 \
   --name qinglong \
   --hostname qinglong \
   --restart unless-stopped \
   registry.cn-hangzhou.aliyuncs.com/smallfawn/qinglong:2.11.3
``````
#最新版青龙搭建命令
docker run -dit \
-v $PWD/ql:/ql/data \
-p 5600:5700 \
-e TZ=Asia/Shanghai \
--dns 114.114.114.114 \
--name qinglong \
--hostname qinglong \
--no-healthcheck \
--restart always \
whyour/qinglong


``````
这里的脚本只是自己学习 js 的一个实践 仅用于测试和学习研究，禁止用于商业用途，不能保证其合法性，准确性，完整性和有效性，请根据情况自行判断.

仓库内所有资源文件，禁止任何公众号、自媒体进行任何形式的转载、发布。

smallfawn 对任何脚本问题概不负责，包括但不限于由任何脚本错误导致的任何损失或损害.

间接使用脚本的任何用户，包括但不限于建立VPS或在某些行为违反国家/地区法律或相关法规的情况下进行传播, smallfawn 对于由此引起的任何隐私泄漏或其他后果概不负责.

如果任何单位或个人认为该项目的脚本可能涉嫌侵犯其权利，则应及时通知并提供身份证明，所有权证明，我们将在收到认证文件后删除相关脚本.

任何以任何方式查看此项目的人或直接或间接使用该Script项目的任何脚本的使用者都应仔细阅读此声明。 smallfawn 保留随时更改或补充此免责声明的权利。一旦使用并复制了任何相关脚本或Script项目的规则，则视为您已接受此免责声明.

您必须在下载后的24小时内从计算机或手机中完全删除以上内容.严禁产生利益链！

