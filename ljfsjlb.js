/*
罗技粉丝俱乐部

自己捉api.wincheers.net包里的Authorization，去掉前面的Bearer之后填到ljfsjlbCookie里
多账号换行或&隔开 
*/
const $ = new Env("罗技粉丝俱乐部");

let envSplitor = ['\n','&']
let httpErr, httpReq, httpResp

let userCookie = ($.isNode() ? process.env.ljfsjlbCookie : $.getdata('ljfsjlbCookie')) || '';

let userList = []
let userIdx = 0
let userCount = 0

let VIDEO_TASK_NUM = 3

let contentType = 'application/json;charset=utf-8'
let client_id = 'LogitechFans'

let defaultUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.23(0x1800172f) NetType/WIFI Language/zh_CN'
let Referer = 'https://servicewechat.com/wx9be0a7d24db348e8/220/page-frame.html'
///////////////////////////////////////////////////////////////////
class UserInfo {
    constructor(str) {
        this.index = ++userIdx
        this.name = this.index
        this.valid = false
        
        this.auth = str
        this.taskList = {}
    }
    
    async taskApi(fn,method,url,body) {
        let result = null
        try {
            let host = url.replace('//','/').split('/')[1]
            let urlObject = {
                url: url,
                headers: {
                    'Host': host,
                    'Connection': 'keep-alive',
                    'User-Agent': defaultUA,
                    'Referer': Referer,
                    'client_id': client_id,
                    'Authorization': 'Bearer ' + this.auth,
                },
                timeout: 5000,
            }
            if(body) {
                urlObject.body = body
                urlObject.headers['Content-Type'] =  contentType
            }
            await httpRequest(method,urlObject).then(async (ret) => {
                if(ret.resp?.statusCode == 200) {
                    if(ret.resp?.body) {
                        result = JSON.parse(ret.resp.body)
                    } else {
                        console.log(`账号[${this.index}]调用${method}[${fn}]出错，返回为空`)
                    }
                } else {
                    console.log(`账号[${this.index}]调用${method}[${fn}]出错，返回状态码[${ret.resp?.statusCode||''}]`)
                }
            })
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(result);
        }
    }
    
    async GetIsLogin() {
        try {
            let fn = 'GetIsLogin'
            let method = 'post'
            let url = `https://api.wincheers.net/api/services/app/crmAccount/GetIsLogin`
            let body = ``
            await this.taskApi(fn,method,url,body).then(async (result) => {
                if(result.success==true) {
                    this.valid = true
                    this.name = result.result.name
                    this.id = result.result.id
                    this.integral = result.result.integral
                    this.phone = result.result.telephone
                    this.buyerNo = result.result.buyerNo
                    console.log(`登录成功`)
                    console.log(`昵称: ${this.name}`)
                    console.log(`ID: ${this.id}`)
                    console.log(`积分: ${this.integral}`)
                } else {
                    $.logAndNotify(`账号[${this.index}]登录失败，CK失效`)
                }
            })
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async IsSignDao() {
        try {
            let fn = 'IsSignDao'
            let method = 'post'
            let url = `https://api.wincheers.net/api/services/app/signIn/IsSignDao`
            let body = ``
            await this.taskApi(fn,method,url,body).then(async (result) => {
                if(result.success==true) {
                    let taskDetail = result.result.split('|')
                    
                    this.taskList.IsSingDao = taskDetail[0]
                    this.taskList.SignDay = taskDetail[1]
                    this.taskList.IsNotice = taskDetail[2]
                    this.taskList.Integral = taskDetail[3]
                    this.taskList.VideoNum = taskDetail[4]
                    this.taskList.shareNum = taskDetail[5]
                    this.taskList.Isperfect = taskDetail[6]
                    this.taskList.IsRelease = taskDetail[7]
                    this.taskList.IsBangDing = taskDetail[8]
                    this.taskList.IsForward = taskDetail[9]
                    this.taskList.Iscomment = taskDetail[10]
                    this.taskList.isProbe = taskDetail[11]
                    this.taskList.isInterest = taskDetail[12]
                    this.taskList.InviteNum = taskDetail[13]
                    
                    if(this.taskList.IsSingDao != 'ok') {
                        await this.ContinuitySignIn();
                    } else {
                        console.log(`今天已签到，已签到${this.taskList.SignDay}天`)
                    }
                    if(this.taskList.VideoNum < VIDEO_TASK_NUM) {
                        let num = VIDEO_TASK_NUM - this.taskList.VideoNum
                        for(let i=0; i<num; i++) {
                            let id = parseInt(Math.random()*10000) + 2000
                            await this.AddLogVideo(id)
                        }
                    }
                    //await this.GiftPoints();
                } else {
                    console.log(`查询任务失败：${result?.error?.message}`)
                }
            })
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async ContinuitySignIn() {
        try {
            let fn = 'ContinuitySignIn'
            let method = 'post'
            let url = `https://api.wincheers.net/api/services/app/signIn/ContinuitySignIn`
            let body = ``
            await this.taskApi(fn,method,url,body).then(async (result) => {
                if(result.success==true) {
                    this.taskList.SignDay++
                    console.log(`签到成功，获得${result.result}积分，已签到${this.taskList.SignDay}天`)
                } else {
                    console.log(`签到失败：${result?.error?.message}`)
                }
            })
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async AddLogVideo(SocialId) {
        try {
            let fn = 'AddLogVideo'
            let method = 'post'
            let url = `https://api.wincheers.net/api/services/app/socialVideoOverLog/AddLog?SocialId=${SocialId}`
            let body = ``
            await this.taskApi(fn,method,url,body).then(async (result) => {
                if(result.success==true) {
                    console.log(`观看视频成功`)
                    if(result.result > 0) console.log(`完成观看视频任务成功，获得${result.result}积分`)
                } else {
                    console.log(`观看视频失败：${result?.error?.message}`)
                }
            })
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async GiftPoints() {
        try {
            let fn = 'GiftPoints'
            let method = 'post'
            let url = `https://api.wincheers.net/api/services/app/crmAccount/GiftPoints`
            let body = ``
            await this.taskApi(fn,method,url,body).then(async (result) => {
                if(result.success==true) {
                    console.log(`分享成功，每天首次分享可得50积分`)
                } else {
                    console.log(`分享失败：${result?.error?.message}`)
                }
            })
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async userTask() {
        try {
            console.log(`\n============= 账号[${this.index}] =============`)
            await this.getScoreAccount();
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
}

!(async () => {
    if (typeof $request !== "undefined") {
        await GetRewrite()
    }else {
        if(!(await checkEnv())) return;
        
        console.log('\n================ 登录 ================')
        for(let user of userList) {
            console.log(`----------- 账号[${user.index}] -----------`)
            await user.GetIsLogin(); 
        }
        
        let validUserList = userList.filter(x => x.valid)
        
        if(validUserList.length > 0) {
            console.log('\n================ 任务 ================')
            for(let user of validUserList) {
                console.log(`----------- 账号[${user.index}] -----------`)
                await user.IsSignDao(); 
            }
        }
        
        await $.showmsg();
    }
})()
.catch((e) => console.log(e))
.finally(() => $.done())

///////////////////////////////////////////////////////////////////
async function GetRewrite() {
}

async function checkEnv() {
    if(userCookie) {
        let splitor = envSplitor[0];
        for(let sp of envSplitor) {
            if(userCookie.indexOf(sp) > -1) {
                splitor = sp;
                break;
            }
        }
        for(let userCookies of userCookie.split(splitor)) {
            if(userCookies) userList.push(new UserInfo(userCookies))
        }
        userCount = userList.length
    } else {
        console.log('未找到CK')
        return;
    }
    
    console.log(`共找到${userCount}个账号`)
    return true
}
////////////////////////////////////////////////////////////////////
async function httpRequest(method,url) {
    httpErr=null, httpReq=null, httpResp=null;
    return new Promise((resolve) => {
        $.send(method, url, async (err, req, resp) => {
            httpErr=err, httpReq=req, httpResp=resp;
            resolve({err,req,resp})
        })
    });
}
////////////////////////////////////////////////////////////////////
function Env(name,env) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
    return new class {
        constructor(name,env) {
            this.name = name
            this.notifyStr = ''
            this.startTime = (new Date).getTime()
            Object.assign(this,env)
            console.log(`${this.name} 开始运行：\n`)
        }
        isNode() {
            return "undefined" != typeof module && !!module.exports
        }
        isQuanX() {
            return "undefined" != typeof $task
        }
        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }
        isLoon() {
            return "undefined" != typeof $loon
        }
        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const[, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
                r = s ? this.getval(s) : "";
                if (r)
                    try {
                        const t = JSON.parse(r);
                        e = t ? this.lodash_get(t, i, "") : e
                    } catch (t) {
                        e = ""
                    }
            }
            return e
        }
        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const[, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
                o = this.getval(i),
                h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t),
                    s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t),
                    s = this.setval(JSON.stringify(o), i)
                }
            }
            else {
                s = this.setval(t, e);
            }
            return s
        }
        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }
        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }
        send(m, t, e = (() => {})) {
            if(m != 'get' && m != 'post' && m != 'put' && m != 'delete') {
                console.log(`无效的http方法：${m}`);
                return;
            }
            if(m == 'get' && t.headers) {
                delete t.headers["Content-Type"];
                delete t.headers["Content-Length"];
            } else if(t.body && t.headers) {
                if(!t.headers["Content-Type"]) t.headers["Content-Type"] = "application/x-www-form-urlencoded";
            }
            if(this.isSurge() || this.isLoon()) {
                if(this.isSurge() && this.isNeedRewrite) {
                    t.headers = t.headers || {};
                    Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1});
                }
                let conf = {
                    method: m,
                    url: t.url,
                    headers: t.headers,
                    timeout: t.timeout,
                    data: t.body
                };
                if(m == 'get') delete conf.data
                $axios(conf).then(t => {
                    const {
                        status: i,
                        request: q,
                        headers: r,
                        data: o
                    } = t;
                    e(null, q, {
                        statusCode: i,
                        headers: r,
                        body: o
                    });
                }).catch(err => console.log(err))
            } else if (this.isQuanX()) {
                t.method = m.toUpperCase(), this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                        hints: !1
                    })),
                $task.fetch(t).then(t => {
                    const {
                        statusCode: i,
                        request: q,
                        headers: r,
                        body: o
                    } = t;
                    e(null, q, {
                        statusCode: i,
                        headers: r,
                        body: o
                    })
                }, t => e(t))
            } else if (this.isNode()) {
                this.got = this.got ? this.got : require("got");
                const {
                    url: s,
                    ...i
                } = t;
                this.instance = this.got.extend({
                    followRedirect: false
                });
                this.instance[m](s, i).then(t => {
                    const {
                        statusCode: i,
                        request: q,
                        headers: r,
                        body: o
                    } = t;
                    e(null, q, {
                        statusCode: i,
                        headers: r,
                        body: o
                    })
                }, t => {
                    const {
                        message: s,
                        request: q,
                        response: i
                    } = t;
                    e(s, q, i)
                })
            }
        }
        time(t,x=null) {
            let xt = x ? new Date(x) : new Date
            let e = {
                "M+": xt.getMonth() + 1,
                "d+": xt.getDate(),
                "h+": xt.getHours(),
                "m+": xt.getMinutes(),
                "s+": xt.getSeconds(),
                "q+": Math.floor((xt.getMonth() + 3) / 3),
                S: xt.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (xt.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let s in e)
                new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length)));
            return t
        }
        async showmsg() {
            if(!this.notifyStr) return;
            let notifyBody = this.name + " 运行通知\n\n" + this.notifyStr
            if($.isNode()){
                var notify = require('./sendNotify');
                console.log('\n============== 推送 ==============')
                await notify.sendNotify(this.name, notifyBody);
            } else {
                this.msg(notifyBody);
            }
        }
        logAndNotify(str) {
            console.log(str)
            this.notifyStr += str
            this.notifyStr += '\n'
        }
        logAndNotifyWithTime(str) {
            let t = '['+this.time('hh:mm:ss.S')+']'+str
            console.log(t)
            this.notifyStr += t
            this.notifyStr += '\n'
        }
        logWithTime(str) {
            console.log('['+this.time('hh:mm:ss.S')+']'+str)
        }
        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t)
                    return t;
                if ("string" == typeof t)
                    return this.isLoon() ? t : this.isQuanX() ? {
                        "open-url": t
                    }
                 : this.isSurge() ? {
                    url: t
                }
                 : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"],
                        s = t.mediaUrl || t["media-url"];
                        return {
                            openUrl: e,
                            mediaUrl: s
                        }
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl,
                        s = t["media-url"] || t.mediaUrl;
                        return {
                            "open-url": e,
                            "media-url": s
                        }
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {
                            url: e
                        }
                    }
                }
            };
            this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r)));
            let h = ["", "============== 系统通知 =============="];
            h.push(e),
            s && h.push(s),
            i && h.push(i),
            console.log(h.join("\n"))
        }
        getMin(a,b){
            return ((a<b) ? a : b)
        }
        getMax(a,b){
            return ((a<b) ? b : a)
        }
        padStr(num,length,padding='0') {
            let numStr = String(num)
            let numPad = (length>numStr.length) ? (length-numStr.length) : 0
            let retStr = ''
            for(let i=0; i<numPad; i++) {
                retStr += padding
            }
            retStr += numStr
            return retStr;
        }
        json2str(obj,c,encodeUrl=false) {
            let ret = []
            for(let keys of Object.keys(obj).sort()) {
                let v = obj[keys]
                if(v && encodeUrl) v = encodeURIComponent(v)
                ret.push(keys+'='+v)
            }
            return ret.join(c);
        }
        str2json(str,decodeUrl=false) {
            let ret = {}
            for(let item of str.split('&')) {
                if(!item) continue;
                let idx = item.indexOf('=')
                if(idx == -1) continue;
                let k = item.substr(0,idx)
                let v = item.substr(idx+1)
                if(decodeUrl) v = decodeURIComponent(v)
                ret[k] = v
            }
            return ret;
        }
        randomString(len,charset='abcdef0123456789') {
            let str = '';
            for (let i = 0; i < len; i++) {
                str += charset.charAt(Math.floor(Math.random()*charset.length));
            }
            return str;
        }
        randomList(a) {
            let idx = Math.floor(Math.random()*a.length)
            return a[idx]
        }
        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }
        done(t = {}) {
            const e = (new Date).getTime(),
            s = (e - this.startTime) / 1e3;
            console.log(`\n${this.name} 运行结束，共运行了 ${s} 秒！`)
            if(this.isSurge() || this.isQuanX() || this.isLoon()) $done(t)
        }
    }(name,env)
}
