/**
 * cron 20 8 * * * 
 * Show:滴滴领券&果园 暂时每天一次
 * 变量名:didi
 * 注意:微信小程序和APP的token同样可用 搜不到关键词就搜token 
 * 变量值:https://api.didi.cn  抓域名中  请求体*(body) city_id 中的 和请求头Headers中的Didi-Ticket 
 * 注意 ut.xiaojukeji.com 请求体中的token和Didi-Ticket是一样的 都可以抓  找不到可以放大镜搜索
 * 有BUG记得反馈 果园入口 微信打开 http://www.yuban.ltd/wx/?id=20240322215239111024747  
 * 正确格式     Didi-Ticket  # city_id
 * scriptVersionNow = "0.0.1";
 */

const $ = new Env("滴滴领券&果园");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "didi";
let envSplitor = ["&", "\n"]; //多账号分隔符
let strSplitor = "#"; //多变量分隔符
let userIdx = 0;
let userList = [];
class Task {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.couponsBindList = []
        this.waterNum = 0;
        this.city_id = Number(str.split(strSplitor)[1]);
    }
    async main() {
        await this.productInit();
        await this.sign_do()
        await this.doLottery()
        for (let i of this.couponsBindList) {
            await this.coupon_bind(i.activity_id, i.group_id, i.coupon_conf_id)
        }
        await this.do_group()
        await this.mission_get()
        await this.plant_sign()
        await this.plant_newEnter()
        if (this.waterNum > 10) {
            for (let i = 0; i < (this.waterNum / 10); i++) {
                await this.plant_newWatering()

            }
        }
    }
    async taskRequest(method, url, body = "") {
        //
        let headers = {
            'Content-Type': 'application/json',
            'Didi-Ticket': this.ck,
        }
        const reqeuestOptions = {
            url: url,
            method: method,
            headers: headers,
        }
        body == "" ? "" : Object.assign(reqeuestOptions, { body: body })
        let { body: result } = await $.httpRequest(reqeuestOptions)
        return result
    }

    async productInit() {
        try {
            let result = await this.taskRequest("post", `https://api.didi.cn/webx/v3/productInit`, JSON.stringify({
                "city_id": this.city_id,
                "dchn": "YYPDp7e",
                "args": {
                    "runtime_args": {
                        "Didi-Ticket": this.ck,
                    }
                },
            }))
            if (result.errno == 0) {
                //
                $.log(`✅账号[${this.index}]-初始化活动信息成功🎉`)
                let tmpArr = result.data.conf.strategy_data.daily_info.daily_coupon.coupons
                let tmpArr2 = result.data.conf.strategy_data.sec_kill_info.seckill
                // $.log(`本次共可领取[${tmpArr.length}]张每日精选券`)
                for (let i of tmpArr2) {
                    if (i.status == 3) {
                        //过去
                    } else if (i.status == 1) {
                        //当前
                        for (let j of i.coupons) {
                            //console.log(j)
                            if (j.status == 1) {
                                //console.log(j)
                                this.couponsBindList.push({ activity_id: j.activity_id, group_id: j.group_id, coupon_conf_id: j.coupon_conf_id })
                            }
                        }
                    } else if (i.status == 2) {
                        //将来
                    }
                }
                for (let i of tmpArr) {
                    if (i.status == 1) {
                        //console.log(i)
                        this.couponsBindList.push({ activity_id: i.activity_id, group_id: i.group_id, coupon_conf_id: i.coupon_conf_id })
                    }
                }
            } else {

            }
        } catch (e) {
            console.log(e);
        }
    }
    async doLottery() {
        try {
            let result = await this.taskRequest("post", `https://ut.xiaojukeji.com/ut/janitor/api/action/lottery/doLottery`, JSON.stringify({
                "act_id": "217533998314",
                "city_id": this.city_id
            }))
            //console.log(options);
            //console.log(JSON.stringify(result));
            if (result.errno == 0) {
                //console.log(`✅账号[${this.index}]  欢迎用户: ${result.errcode}🎉`);
                $.log(`✅账号[${this.index}]-抽奖成功-[${result.data.prize_data[0].name}]🎉`)
            } else {
                $.log(`❌账号[${this.index}]-抽奖失败-[${result.errmsg}]`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }


    async coupon_bind(activity_id, group_id, coupon_conf_id) {
        try {
            let result = await this.taskRequest("post", `https://ut.xiaojukeji.com/ut/janitor/api/action/coupon/bind`, JSON.stringify({
                "activity_id": activity_id,
                "group_id": group_id,
                "coupon_conf_id": coupon_conf_id,
                "city_id": this.city_id
            }))
            //console.log(options);
            //console.log(result);
            if (result.errno == 0) {
                $.log(`✅账号[${this.index}]-时间段领券成功-[${result.data.name}]🎉`)
            } else {
                $.log(`❌账号[${this.index}]-时间段领券失败-[${result.errmsg}]`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async do_group() {
        try {
            let body = {
                "prod_key": "integrated-marketing-award",
                "token": this.ck,
                "xak": "integrated-marketing-award-D5LYBz4SGgg4",
                "city_id": this.city_id
            }
            let result = await this.taskRequest("post", `https://ut.xiaojukeji.com/ut/active_brick/api/v1/award/do_group?wsgsig=${this.get_wsgsig(body)}`, JSON.stringify(body))
            //console.log(options);
            //console.log(result);
            if (result.errno == 0) {
                let awardArr = []
                for (let i of result.data.details) {
                    for (let j of i.rewards) {
                        awardArr.push(j.info[0].coupon_name)
                    }
                }
                $.log(`✅账号[${this.index}]-每日领券成功-[${awardArr}]🎉`)
            } else {
                $.log(`❌账号[${this.index}]-每日领券失败-[${result.errmsg}]`);
                //console.log(result);
            }
        } catch (e) {
            $.log(`❌账号[${this.index}]-领券失败-[501报错 - 测试版]`);
        }
    }
    async sign_do() {
        try {
            let result = await this.taskRequest("post", `https://ut.xiaojukeji.com/ut/janitor/api/action/sign/do`, JSON.stringify({
                //"activity_id": "217534045313",
            }))
            //console.log(options);
            //console.log(result);
            if (result.errno == 0) {
                //console.log(`✅账号[${this.index}]  欢迎用户: ${result.errcode}🎉`);
                $.log(`✅账号[${this.index}]-签到成功-[]🎉`)

            } else {
                $.log(`❌账号[${this.index}]-签到失败-[${result.errmsg}]`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async plant_newEnter() {
        let body = {
            platform: 1,
            game_id: 23,
            token:
                this.ck
        };
        try {
            let result = await this.taskRequest("post", `https://game.xiaojukeji.com/api/game/plant/newEnter?wsgsig=${this.get_wsgsig(body)}`, JSON.stringify(body))
            //console.log(options);
            //console.log(result);
            if (result.errno == 0) {
                $.log(`✅账号[${this.index}]-果园信息获取成功-[${result.data.tree_info.pack_water}💧 ${result.data.tree_info.tree_progress}%]🎉`)
                this.waterNum = Number(result.data.tree_info.pack_water);
            } else {
                $.log(`❌账号[${this.index}]-果园信息获取失败-[${result.errmsg}]`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async mission_award(mission_id) {
        let body = {
            mission_id: mission_id,
            game_id: 23,
            platform: 1,
            token:
                this.ck,
        }
        try {
            let result = await this.taskRequest("post", `https://game.xiaojukeji.com/api/game/mission/award?wsgsig=${this.get_wsgsig(body)}`, JSON.stringify(body))
            //console.log(options);
            //console.log(result);
            if (result.errno == 0) {
                $.log(`✅账号[${this.index}]-领取果园奖励成功-[${result.data.reward[0].count}/${result.data.reward[0].name}]🎉`)

            } else {
                $.log(`❌账号[${this.index}]-领取果园奖励失败-[${result.errmsg}]`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async mission_get() {
        try {
            let result = await this.taskRequest("get", `https://game.xiaojukeji.com/api/game/mission/get?game_id=23&token=${this.ck}`)
            //console.log(options);
            //console.log(result);
            if (result.errno == 0) {
                for (let i of result.data.missions) {
                    if (i.type == 1) {
                        if (i.status == 0 && i.target == 1) {
                            await this.mission_update(i.id)
                        }
                        if (i.status == 2) {
                            await this.mission_award(i.id)
                        }
                    } else if (i.type == 2) {

                    } else if (i.type == 5) {
                        await this.mission_subscribe(i.id)
                    }


                }

            } else {
                $.log(`❌账号[${this.index}]-果园初始化失败-[${result.errmsg}]`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async mission_update(mission_id) {
        let body = {
            mission_id: mission_id,
            game_id: 23,
            platform: 1,
            token:
                this.ck,
        }
        try {
            let result = await this.taskRequest("post", `https://game.xiaojukeji.com/api/game/mission/update?wsgsig=${this.get_wsgsig(body)}`, JSON.stringify(body))
            //console.log(options);
            //console.log(result);
            if (result.errno == 0) {
                $.log(`✅账号[${this.index}]-上传任务状态成功-[${result.errmsg}]🎉`)
                await this.mission_award(mission_id)
            } else {
                $.log(`❌账号[${this.index}]-上传任务状态失败-[${result.errmsg, mission_id}] `);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async mission_subscribe(id) {
        let body = {
            status: true,
            game_id: 23,
            platform: 1,
            token:
                this.ck,
        };
        try {
            let result = await this.taskRequest("post", `https://game.xiaojukeji.com/api/game/subscribe?wsgsig=${this.get_wsgsig(body)}`, JSON.stringify(body))
            //console.log(options);
            //console.log(result);
            if (result.errno == 0) {
                $.log(`✅账号[${this.index}]-上传任务状态成功-[${result.errmsg}]🎉`)
                await this.mission_award(id)
            } else {
                $.log(`❌账号[${this.index}]-上传任务状态失败-[${result.errmsg, mission_id}] `);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async plant_sign() {
        try {
            let body = {
                platform: 1,
                game_id: 23,
                token:
                    this.ck,
            }
            let result = await this.taskRequest("post", `https://game.xiaojukeji.com/api/game/plant/sign?wsgsig=${this.get_wsgsig(body)}`, JSON.stringify(body))
            // console.log("post", `https://game.xiaojukeji.com/api/game/plant/sign?wsgsig=${this.get_wsgsig(body)}`, JSON.stringify(body));
            //console.log(result);
            if (result.errno == 0) {
                $.log(`✅账号[${this.index}]-果园签到成功-[${result.errmsg}]🎉`)

            } else {
                $.log(`❌账号[${this.index}]-果园签到失败-[${result.errmsg}]`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async plant_newWatering() {
        let body = {
            platform: 1,
            game_id: 23,
            token:
                this.ck,
        }
        try {
            let result = await this.taskRequest("post", `https://game.xiaojukeji.com/api/game/plant/newWatering?wsgsig=${this.get_wsgsig(body)}`, JSON.stringify(body))
            //console.log(options);
            //console.log(result);
            if (result.errno == 0) {
                $.log(`✅账号[${this.index}]-浇水成功-[${result.data.tree_progress}%]🎉`)

            } else {
                $.log(`❌账号[${this.index}]-浇水失败-[${result.errmsg}]`);
                //console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    get_wsgsig(OO) {
        OO = JSON.stringify(OO);
        function c(t) {
            for (var e = t.length, n = t.length - 1; n >= 0; n--) {
                var r = t.charCodeAt(n);
                r > 127 && r <= 2047 ? e++ : r > 2047 && r <= 65535 && (e += 2),
                    r >= 56320 && r <= 57343 && n--;
            }
            return e;
        }


        function r(t) {
            for (
                var e =
                    "ABCDEFG0123456789abcdefgHIJKLMN+/hijklmnOPQRSTopqrstUVWXYZuvwxyz",
                n = "" + t,
                r = void 0,
                o = void 0,
                i = 0,
                u = "";
                n.charAt(0 | i) || ((e = "="), i % 1);
                u += e.charAt(63 & (r >> (8 - (i % 1) * 8)))
            ) {
                if ((o = n.charCodeAt((i += 0.75))) > 255)
                    throw new Error(
                        "'base64' failed: The string to be encoded contains characters outside of the Latin1 range."
                    );
                r = (r << 8) | o;
            }
            return u;
        }
        function o(t, e) {
            for (var n = [], r = 0; r < e.length; r++)
                n[r] = t[r % 4] ^ e.charCodeAt(r);
            return (
                (n = Array.prototype.slice.apply(t).concat(n)),
                String.fromCharCode.apply(null, n)
            );
        }


        //D参数为提交的param
        function en(T) {
            return (
                "dd03-" +
                r(
                    o(
                        new Uint8Array(
                            new Uint32Array([
                                Math.floor(4294967296 * Math.random()),
                            ]).buffer
                        ),
                        T
                    )
                ).replace(/=*$/, "")
            );
        }
        function MD5(data) {
            const crypto = require("crypto");
            return crypto.createHash("md5").update(data).digest("hex");
        }
        let time = Math.floor(new Date() / 1e3)
        return en('ts=' + time + '&v=1&os=web&av=02&kv=0000010001&vl=' + c(OO) + '&sig=' + MD5("R4doMFFeMNlliIWM" + OO))
    }

}


!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        let taskall = [];
        for (let user of userList) {
            if (user.ckStatus) {
                taskall.push(user.main());
            }
        }
        await Promise.all(taskall);
    }
    await $.sendMsg($.logs.join("\n"))
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

//********************************************************
/**
 * 变量检查与处理
 * @returns
 */
async function checkEnv() {
    let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || "";
    if (userCookie) {
        let e = envSplitor[0];
        for (let o of envSplitor)
            if (userCookie.indexOf(o) > -1) {
                e = o;
                break;
            }
        for (let n of userCookie.split(e)) n && userList.push(new Task(n));
    } else {
        console.log(`未找到CK【${ckName}】`);
        return;
    }
    return console.log(`共找到${userList.length}个账号`), true; //true == !0
}
function Env(t, s) {
    return new (class {
        constructor(t, s) {
            this.name = t;
            this.data = null;
            this.dataFile = "box.dat";
            this.logs = [];
            this.logSeparator = "\n";
            this.startTime = new Date().getTime();
            Object.assign(this, s);
            this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`);
        }
        isNode() {
            return "undefined" != typeof module && !!module.exports;
        }
        isQuanX() {
            return "undefined" != typeof $task;
        }
        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon;
        }
        isLoon() {
            return "undefined" != typeof $loon;
        }
        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs");
                this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    s = this.path.resolve(process.cwd(), this.dataFile),
                    e = this.fs.existsSync(t),
                    i = !e && this.fs.existsSync(s);
                if (!e && !i) return {};
                {
                    const i = e ? t : s;
                    try {
                        return JSON.parse(this.fs.readFileSync(i));
                    } catch (t) {
                        return {};
                    }
                }
            }
        }
        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs");
                this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    s = this.path.resolve(process.cwd(), this.dataFile),
                    e = this.fs.existsSync(t),
                    i = !e && this.fs.existsSync(s),
                    o = JSON.stringify(this.data);
                e ? this.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o);
            }
        }
        lodash_get(t, s, e) {
            const i = s.replace(/\[(\d+)\]/g, ".$1").split(".");
            let o = t;
            for (const t of i) if (((o = Object(o)[t]), void 0 === o)) return e;
            return o;
        }
        lodash_set(t, s, e) {
            return Object(t) !== t
                ? t
                : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []),
                    (s
                        .slice(0, -1)
                        .reduce(
                            (t, e, i) =>
                                Object(t[e]) === t[e]
                                    ? t[e]
                                    : (t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}),
                            t
                        )[s[s.length - 1]] = e),
                    t);
        }
        getdata(t) {
            let s = this.getval(t);
            if (/^@/.test(t)) {
                const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t),
                    o = e ? this.getval(e) : "";
                if (o)
                    try {
                        const t = JSON.parse(o);
                        s = t ? this.lodash_get(t, i, "") : s;
                    } catch (t) {
                        s = "";
                    }
            }
            return s;
        }
        setdata(t, s) {
            let e = !1;
            if (/^@/.test(s)) {
                const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s),
                    h = this.getval(i),
                    a = i ? ("null" === h ? null : h || "{}") : "{}";
                try {
                    const s = JSON.parse(a);
                    this.lodash_set(s, o, t), (e = this.setval(JSON.stringify(s), i));
                } catch (s) {
                    const h = {};
                    this.lodash_set(h, o, t), (e = this.setval(JSON.stringify(h), i));
                }
            } else e = this.setval(t, s);
            return e;
        }
        getval(t) {
            if (this.isSurge() || this.isLoon()) {
                return $persistentStore.read(t);
            } else if (this.isQuanX()) {
                return $prefs.valueForKey(t);
            } else if (this.isNode()) {
                this.data = this.loaddata();
                return this.data[t];
            } else {
                return this.data && this.data[t] || null;
            }
        }
        setval(t, s) {
            if (this.isSurge() || this.isLoon()) {
                return $persistentStore.write(t, s);
            } else if (this.isQuanX()) {
                return $prefs.setValueForKey(t, s);
            } else if (this.isNode()) {
                this.data = this.loaddata();
                this.data[s] = t;
                this.writedata();
                return true;
            } else {
                return this.data && this.data[s] || null;
            }
        }
        initGotEnv(t) {
            this.got = this.got ? this.got : require("got");
            this.cktough = this.cktough ? this.cktough : require("tough-cookie");
            this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar();
            if (t) {
                t.headers = t.headers ? t.headers : {};
                if (typeof t.headers.Cookie === "undefined" && typeof t.cookieJar === "undefined") {
                    t.cookieJar = this.ckjar;
                }
            }
        }
        /**
        * @param {Object} options
        * @returns {String} 将 Object 对象 转换成 queryStr: key=val&name=senku
        */
        queryStr(options) {
            return Object.entries(options)
                .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
                .join('&');
        }
        //从url获取参数组成json
        getURLParams(url) {
            const params = {};
            const queryString = url.split('?')[1];
            if (queryString) {
                const paramPairs = queryString.split('&');
                paramPairs.forEach(pair => {
                    const [key, value] = pair.split('=');
                    params[key] = value;
                });
            }
            return params;
        }
        isJSONString(str) {
            try {
                var obj = JSON.parse(str);
                if (typeof obj == 'object' && obj) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return false;
            }
        }
        isJson(obj) {
            var isjson = typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
            return isjson;
        }
        async sendMsg(message) {
            if (!message) return;
            if ($.isNode()) {
                await notify.sendNotify($.name, message)
            } else {
                $.msg($.name, '', message)
            }
        }
        async httpRequest(options) {
            let t = {
                ...options
            };
            if (!t.headers) {
                t.headers = {}
            }
            if (t.params) {
                t.url += '?' + this.queryStr(t.params);
            }
            t.method = t.method.toLowerCase();
            if (t.method === 'get') {
                delete t.headers['Content-Type'];
                delete t.headers['Content-Length'];
                delete t.headers['content-type'];
                delete t.headers['content-length'];
                delete t["body"]
            }
            if (t.method === 'post') {
                let ContentType;
                if (!t.body) {
                    t.body = ""
                } else {
                    if (typeof t.body == "string") {
                        if (this.isJSONString(t.body)) {
                            ContentType = 'application/json'
                        } else {
                            ContentType = 'application/x-www-form-urlencoded'
                        }
                    } else if (this.isJson(t.body)) {
                        t.body = JSON.stringify(t.body);
                        ContentType = 'application/json';
                    }
                }
                if (!t.headers['Content-Type'] || !t.headers['content-type']) {
                    t.headers['Content-Type'] = ContentType;
                }
                delete t.headers['Content-Length'];
            }
            if (this.isNode()) {
                this.initGotEnv(t);
                let httpResult = await this.got(t);
                if (this.isJSONString(httpResult.body)) {
                    httpResult.body = JSON.parse(httpResult.body)
                }
                return httpResult;
            }
            if (this.isQuanX()) {
                t.method = t.method.toUpperCase()
                return new Promise((resolve, reject) => {
                    $task.fetch(t).then(response => {
                        if (this.isJSONString(response.body)) {
                            response.body = JSON.parse(response.body)
                        }
                        resolve(response)
                    })
                })
            }
        }
        randomNumber(length) {
            const characters = '0123456789';
            return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
        }
        randomString(length) {
            const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
        }
        timeStamp() {
            return new Date().getTime()
        }
        uuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        time(t) {
            let s = {
                "M+": new Date().getMonth() + 1,
                "d+": new Date().getDate(),
                "H+": new Date().getHours(),
                "m+": new Date().getMinutes(),
                "s+": new Date().getSeconds(),
                "q+": Math.floor((new Date().getMonth() + 3) / 3),
                S: new Date().getMilliseconds(),
            };
            /(y+)/.test(t) &&
                (t = t.replace(
                    RegExp.$1,
                    (new Date().getFullYear() + "").substr(4 - RegExp.$1.length)
                ));
            for (let e in s)
                new RegExp("(" + e + ")").test(t) &&
                    (t = t.replace(
                        RegExp.$1,
                        1 == RegExp.$1.length
                            ? s[e]
                            : ("00" + s[e]).substr(("" + s[e]).length)
                    ));
            return t;
        }
        msg(s = t, e = "", i = "", o) {
            const h = (t) =>
                !t || (!this.isLoon() && this.isSurge())
                    ? t
                    : "string" == typeof t
                        ? this.isLoon()
                            ? t
                            : this.isQuanX()
                                ? { "open-url": t }
                                : void 0
                        : "object" == typeof t && (t["open-url"] || t["media-url"])
                            ? this.isLoon()
                                ? t["open-url"]
                                : this.isQuanX()
                                    ? t
                                    : void 0
                            : void 0;
            this.isMute ||
                (this.isSurge() || this.isLoon()
                    ? $notification.post(s, e, i, h(o))
                    : this.isQuanX() && $notify(s, e, i, h(o)));
            let logs = ['', '==============📣系统通知📣=============='];
            logs.push(t);
            e ? logs.push(e) : '';
            i ? logs.push(i) : '';
            console.log(logs.join('\n'));
            this.logs = this.logs.concat(logs);
        }
        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]),
                console.log(t.join(this.logSeparator));
        }
        logErr(t, s) {
            const e = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            e
                ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack)
                : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t);
        }
        wait(t) {
            return new Promise((s) => setTimeout(s, t));
        }
        done(t = {}) {
            const s = new Date().getTime(),
                e = (s - this.startTime) / 1e3;
            this.log(
                "",
                `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`
            )
            this.log()
            if (this.isNode()) {
                process.exit(1)
            }
            if (this.isQuanX()) {
                $done(t)
            }
        }
    })(t, s);
}
