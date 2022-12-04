/*
广汽传祺-微信小程序

捉包这个域名: mall.gacmotor.com
登录微信小程序后，捉header里的token，填到gqcqWxCookie里，多账号换行或@或&隔开

定时每天一次
cron: 33 9 * * *
*/
const $ = new Env("广汽传祺-微信小程序");

const envSplitor = ['\n','@','&']
const ckName = 'gqcqWxCookie'
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';

let userList = []
let userIdx = 0
let userCount = 0

const ver = '3.1.2'
const defaultContentType = 'application/json'
const defaultUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.28(0x18001c2c) NetType/WIFI Language/zh_CN'
const Referer = 'https://servicewechat.com/wx86a1eb5a53a6973b/210/page-frame.html'
///////////////////////////////////////////////////////////////////
class UserInfo {
    constructor(str) {
        this.index = ++userIdx
        this.name = this.index
        this.valid = false
        
        this.token = str
    }
    
    async taskApi(paramIn={}) {
        let paramOut = {}
        try {
            let host = paramIn.url.replace('//','/').split('/')[1]
            let url = paramIn.url
            if(paramIn.queryParam) url += '?' + $.json2str(paramIn.queryParam,'&',true)
            let urlObject = {
                url: url,
                headers: {
                    'Host': host,
                    'Connection': 'keep-alive',
                    'token': this.token,
                    'User-Agent': defaultUA,
                    'Referer': Referer,
                    'version': ver,
                },
                timeout: 5000,
            }
            if(paramIn.body) {
                urlObject.headers['Content-Type'] = paramIn['Content-Type'] || defaultContentType
                if(typeof paramIn.body === 'object') {
                    if(urlObject.headers['Content-Type'].includes('json')) {
                        urlObject.body = JSON.stringify(paramIn.body)
                    } else {
                        for(let key in paramIn.body) {
                            if(typeof paramIn.body[key] === 'object') {
                                paramIn.body[key] = JSON.stringify(paramIn.body[key])
                            }
                        }
                        urlObject.body = $.json2str(paramIn.body,'&')
                    }
                } else {
                    urlObject.body = paramIn.body
                }
                if($.isNode()) {
                    urlObject.headers['Content-Length'] = urlObject.body ? Buffer.byteLength(urlObject.body, 'utf8') : 0
                } else {
                    urlObject.headers['Content-Length'] = urlObject.body ? urlObject.body.length : 0
                }
            }
            if(paramIn.urlObjectParam) Object.assign(urlObject,paramIn.urlObjectParam);
            if(paramIn.headerParam) Object.assign(urlObject.headers,paramIn.headerParam);
            //console.log(urlObject);
            paramOut = Object.assign({},await httpRequest(paramIn.method,urlObject))
            paramOut.statusCode = paramOut?.err?.response?.statusCode || paramOut?.resp?.statusCode
            if(paramOut.statusCode != 200) {
                console.log(`[${paramIn.fn}]返回[${paramOut.statusCode}]`)
            }
            if(paramOut?.resp?.body) {
                if(typeof paramOut.resp.body === 'object') {
                    paramOut.result = paramOut.resp.body
                } else {
                    try {
                        paramOut.result = JSON.parse(paramOut.resp.body)
                    } catch (e) {
                        //console.log(`[${paramIn.fn}]没有返回json数据`)
                        paramOut.result = paramOut.resp.body
                    }
                }
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(paramOut);
        }
    }
    
    async checkLoginSendGdou() {
        let paramOut = {}
        try {
            let urlParam = {
                fn: 'checkLoginSendGdou',
                method: 'post',
                url: `https://mall.gacmotor.com/center-current-app/fronted/myHomePage/checkLoginSendGdou`,
                body: {}
            }
            paramOut = Object.assign({},await this.taskApi(urlParam))
            let result = paramOut.result
            //console.log(result)
            if(result.success==true) {
                if(result.data.flag) {
                    $.logAndNotify(`[${this.name}]登录成功，获得${result.data.gdouNum}金币`)
                } else {
                    $.logAndNotify(`[${this.name}]今日已经领取过登录奖励`)
                }
            } else {
                $.logAndNotify(`[${this.name}]小程序登录失败: ${result.msg}`)
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(paramOut);
        }
    }
}

!(async () => {
    if (typeof $request !== "undefined") {
        await GetRewrite()
    }else {
        //if(!(await isValidCode())) return;
        //await getTaskUrl();
        if(!checkEnv()) return;
        
        for(let user of userList) {
            await user.checkLoginSendGdou(); 
        }
    }
})()
.catch((e) => console.log(e))
.finally(() => $.done())

///////////////////////////////////////////////////////////////////
async function GetRewrite() {
}

function checkEnv() {
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
        console.log(`未找到CK: ${ckName}`)
        return false;
    }
    
    console.log(`共找到${userCount}个账号`)
    return true
}

async function isValidCode(retry=0) {
    let flag = false
    try {
        let urlObject = {
            url: codeUrl,
            timeout: 5000,
        }
        let result = null
        let paramOut = await httpRequest('get',urlObject)
        //console.log(paramOut)
        if(paramOut.err) {
            console.log(`服务器错误[${paramOut?.resp?.statusCode}]，重试...`)
        } else {
            try {
                result = JSON.parse(paramOut.resp.body)
                result = JSON.parse(result.data.file.data)
            } catch (e) {
                console.log(e)
            }
        }
        
        if(!result) {
            if(retry < NUM_MAX_RETRY) {
                let waittime = Math.floor(Math.random()*WAIT_TIME_RANDOM) + WAIT_TIME_BASE
                flag = await isValidCode(++retry)
            }
        } else {
            if(result?.commonNotify && result.commonNotify.length > 0) {
                $.logAndNotify(result.commonNotify.join('\n')+'\n',false)
            }
            
            if(result?.commonMsg && result.commonMsg.length > 0) {
                console.log(result.commonMsg.join('\n')+'\n')
            }
            
            if(result[codeName]) {
                let codeResult = result[codeName]
                if(codeResult.status == 0) {
                    if(version >= codeResult.version) {
                        flag = true
                        console.log(codeResult.msg[codeResult.status])
                        console.log(codeResult.updateMsg)
                        console.log(`现在运行的脚本版本是：${version}，最新脚本版本：${codeResult.latestVersion}`)
                    } else {
                        console.log(codeResult.versionMsg)
                    }
                } else {
                    console.log(codeResult.msg[codeResult.status])
                }
            } else {
                console.log(result.errorMsg)
            }
        }
    } catch (e) {
        console.log(e)
    } finally {
        return Promise.resolve(flag)
    }
}

async function getTaskUrl(retry=0) {
    let flag = false
    try {
        let urlObject = {
            url: taskUrl,
            timeout: 5000,
        }
        let result = null
        let paramOut = await httpRequest('get',urlObject)
        //console.log(paramOut)
        if(paramOut.err) {
            console.log(`服务器错误[${paramOut?.resp?.statusCode}]，重试...`)
        } else {
            try {
                result = JSON.parse(paramOut.resp.body)
                result = JSON.parse(result.data.file.data)
            } catch (e) {
                console.log(e)
            }
        }
        
        if(!result) {
            if(retry < NUM_MAX_RETRY) {
                let waittime = Math.floor(Math.random()*WAIT_TIME_RANDOM) + WAIT_TIME_BASE
                flag = await isValidCode(++retry)
            }
        } else {
            //
        }
    } catch (e) {
        console.log(e)
    } finally {
        return Promise.resolve(flag)
    }
    
    return;
}
////////////////////////////////////////////////////////////////////
async function httpRequest(method,url) {
    return new Promise((resolve) => {
        $.send(method, url, async (err, req, resp) => {
            resolve({err,req,resp})
        })
    });
}
////////////////////////////////////////////////////////////////////
//MD5
function MD5Encrypt(a){function b(a,b){return a<<b|a>>>32-b}function c(a,b){var c,d,e,f,g;return e=2147483648&a,f=2147483648&b,c=1073741824&a,d=1073741824&b,g=(1073741823&a)+(1073741823&b),c&d?2147483648^g^e^f:c|d?1073741824&g?3221225472^g^e^f:1073741824^g^e^f:g^e^f}function d(a,b,c){return a&b|~a&c}function e(a,b,c){return a&c|b&~c}function f(a,b,c){return a^b^c}function g(a,b,c){return b^(a|~c)}function h(a,e,f,g,h,i,j){return a=c(a,c(c(d(e,f,g),h),j)),c(b(a,i),e)}function i(a,d,f,g,h,i,j){return a=c(a,c(c(e(d,f,g),h),j)),c(b(a,i),d)}function j(a,d,e,g,h,i,j){return a=c(a,c(c(f(d,e,g),h),j)),c(b(a,i),d)}function k(a,d,e,f,h,i,j){return a=c(a,c(c(g(d,e,f),h),j)),c(b(a,i),d)}function l(a){for(var b,c=a.length,d=c+8,e=(d-d%64)/64,f=16*(e+1),g=new Array(f-1),h=0,i=0;c>i;)b=(i-i%4)/4,h=i%4*8,g[b]=g[b]|a.charCodeAt(i)<<h,i++;return b=(i-i%4)/4,h=i%4*8,g[b]=g[b]|128<<h,g[f-2]=c<<3,g[f-1]=c>>>29,g}function m(a){var b,c,d="",e="";for(c=0;3>=c;c++)b=a>>>8*c&255,e="0"+b.toString(16),d+=e.substr(e.length-2,2);return d}function n(a){a=a.replace(/\r\n/g,"\n");for(var b="",c=0;c<a.length;c++){var d=a.charCodeAt(c);128>d?b+=String.fromCharCode(d):d>127&&2048>d?(b+=String.fromCharCode(d>>6|192),b+=String.fromCharCode(63&d|128)):(b+=String.fromCharCode(d>>12|224),b+=String.fromCharCode(d>>6&63|128),b+=String.fromCharCode(63&d|128))}return b}var o,p,q,r,s,t,u,v,w,x=[],y=7,z=12,A=17,B=22,C=5,D=9,E=14,F=20,G=4,H=11,I=16,J=23,K=6,L=10,M=15,N=21;for(a=n(a),x=l(a),t=1732584193,u=4023233417,v=2562383102,w=271733878,o=0;o<x.length;o+=16)p=t,q=u,r=v,s=w,t=h(t,u,v,w,x[o+0],y,3614090360),w=h(w,t,u,v,x[o+1],z,3905402710),v=h(v,w,t,u,x[o+2],A,606105819),u=h(u,v,w,t,x[o+3],B,3250441966),t=h(t,u,v,w,x[o+4],y,4118548399),w=h(w,t,u,v,x[o+5],z,1200080426),v=h(v,w,t,u,x[o+6],A,2821735955),u=h(u,v,w,t,x[o+7],B,4249261313),t=h(t,u,v,w,x[o+8],y,1770035416),w=h(w,t,u,v,x[o+9],z,2336552879),v=h(v,w,t,u,x[o+10],A,4294925233),u=h(u,v,w,t,x[o+11],B,2304563134),t=h(t,u,v,w,x[o+12],y,1804603682),w=h(w,t,u,v,x[o+13],z,4254626195),v=h(v,w,t,u,x[o+14],A,2792965006),u=h(u,v,w,t,x[o+15],B,1236535329),t=i(t,u,v,w,x[o+1],C,4129170786),w=i(w,t,u,v,x[o+6],D,3225465664),v=i(v,w,t,u,x[o+11],E,643717713),u=i(u,v,w,t,x[o+0],F,3921069994),t=i(t,u,v,w,x[o+5],C,3593408605),w=i(w,t,u,v,x[o+10],D,38016083),v=i(v,w,t,u,x[o+15],E,3634488961),u=i(u,v,w,t,x[o+4],F,3889429448),t=i(t,u,v,w,x[o+9],C,568446438),w=i(w,t,u,v,x[o+14],D,3275163606),v=i(v,w,t,u,x[o+3],E,4107603335),u=i(u,v,w,t,x[o+8],F,1163531501),t=i(t,u,v,w,x[o+13],C,2850285829),w=i(w,t,u,v,x[o+2],D,4243563512),v=i(v,w,t,u,x[o+7],E,1735328473),u=i(u,v,w,t,x[o+12],F,2368359562),t=j(t,u,v,w,x[o+5],G,4294588738),w=j(w,t,u,v,x[o+8],H,2272392833),v=j(v,w,t,u,x[o+11],I,1839030562),u=j(u,v,w,t,x[o+14],J,4259657740),t=j(t,u,v,w,x[o+1],G,2763975236),w=j(w,t,u,v,x[o+4],H,1272893353),v=j(v,w,t,u,x[o+7],I,4139469664),u=j(u,v,w,t,x[o+10],J,3200236656),t=j(t,u,v,w,x[o+13],G,681279174),w=j(w,t,u,v,x[o+0],H,3936430074),v=j(v,w,t,u,x[o+3],I,3572445317),u=j(u,v,w,t,x[o+6],J,76029189),t=j(t,u,v,w,x[o+9],G,3654602809),w=j(w,t,u,v,x[o+12],H,3873151461),v=j(v,w,t,u,x[o+15],I,530742520),u=j(u,v,w,t,x[o+2],J,3299628645),t=k(t,u,v,w,x[o+0],K,4096336452),w=k(w,t,u,v,x[o+7],L,1126891415),v=k(v,w,t,u,x[o+14],M,2878612391),u=k(u,v,w,t,x[o+5],N,4237533241),t=k(t,u,v,w,x[o+12],K,1700485571),w=k(w,t,u,v,x[o+3],L,2399980690),v=k(v,w,t,u,x[o+10],M,4293915773),u=k(u,v,w,t,x[o+1],N,2240044497),t=k(t,u,v,w,x[o+8],K,1873313359),w=k(w,t,u,v,x[o+15],L,4264355552),v=k(v,w,t,u,x[o+6],M,2734768916),u=k(u,v,w,t,x[o+13],N,1309151649),t=k(t,u,v,w,x[o+4],K,4149444226),w=k(w,t,u,v,x[o+11],L,3174756917),v=k(v,w,t,u,x[o+2],M,718787259),u=k(u,v,w,t,x[o+9],N,3951481745),t=c(t,p),u=c(u,q),v=c(v,r),w=c(w,s);var O=m(t)+m(u)+m(v)+m(w);return O.toLowerCase()}
////////////////////////////////////////////////////////////////////
function Env(name,env) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
    return new class {
        constructor(name,env) {
            this.name = name
            this.notifyStr = ''
            this.notifyFlag = false
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
                S: this.padStr(xt.getMilliseconds(),3)
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (xt.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let s in e)
                new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length)));
            return t
        }
        async showmsg() {
            if(!this.notifyFlag) return;
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
        logAndNotify(str,flag=true) {
            if(flag) this.notifyFlag = true
            console.log(str)
            this.notifyStr += str
            this.notifyStr += '\n'
        }
        logAndNotifyWithTime(str,flag=true) {
            if(flag) this.notifyFlag = true
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
        randomPattern(pattern,charset='abcdef0123456789') {
            let str = ''
            for(let chars of pattern) {
                if(chars == 'x') {
                    str += charset.charAt(Math.floor(Math.random()*charset.length));
                } else if(chars == 'X') {
                    str += charset.charAt(Math.floor(Math.random()*charset.length)).toUpperCase();
                } else {
                    str += chars
                }
            }
            return str
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
        async done(t = {}) {
            await this.showmsg();
            const e = (new Date).getTime(),
            s = (e - this.startTime) / 1e3;
            console.log(`\n${this.name} 运行结束，共运行了 ${s} 秒！`)
            if(this.isSurge() || this.isQuanX() || this.isLoon()) $done(t)
        }
    }(name,env)
}
