/*
@肥皂 3.22 闲趣赚  一天0.1-0.4或者更高（根据用户等级增加任务次数）
3.24 更新加入用户余额和信息。。。。
苹果&安卓下载地址：复制链接到微信打开   https://a.jrpub.cn/3345249
新人进去直接秒到账两个0.3.。。。（微信登录）花两分钟再完成下新人任务，大概秒到微信3元左右
感觉看账号等级，我的小号进去只能做五个任务，大号可以做十个。
建议做一下里面的任务，单价还是不错的，做完等级升上来了挂脚本收益也多一点。
抓取域名  wap.quxianzhuan.com  抓取cookie的全部数据。。
青龙变量  xqzck  多账户@隔开
更新加入用户余额和信息。。。。
new Env("闲趣赚")
*/
const $ = new Env("闲趣赚3.24");
let status;
status = (status = $.getval("xqzstatus") || "1") > 1 ? "" + status : "";
let xqzckArr = [];
let xqzck = ($.isNode() ? process.env.xqzck : $.getdata("xqzck")) || "";
let xqzid = "",
  xqztk = "";
!(async () => {
  if (typeof $request !== "undefined") {
    {
      await xqzck();
    }
  } else {
    {
      xqzckArr = xqzck.split("@");
      console.log("------------- 共" + xqzckArr.length + "个账号-------------\n");
      for (let _0x2c0f0c = 0; _0x2c0f0c < xqzckArr.length; _0x2c0f0c++) {
        {
          xqzck = xqzckArr[_0x2c0f0c];
          $.index = _0x2c0f0c + 1;
          console.log("\n开始【闲趣赚" + $.index + "】");
          await xqzlb();
          await xqzxx();
        }
      }
    }
  }
})().catch(_0x848d15 => $.logErr(_0x848d15)).finally(() => $.done());
function xqzlb(_0x8d8167 = 0) {
  return new Promise(_0x28fe4c => {
    {
      let _0x3df897 = {
        "url": "https://wap.quxianzhuan.com/reward/browse/index/?xapp-target=blank",
        "headers": JSON.parse("{\"Host\":\"wap.quxianzhuan.com\",\"Connection\":\"keep-alive\",\"Upgrade-Insecure-Requests\":\"1\",\"User-Agent\":\"Mozilla/5.0 (Linux; Android 10; 16s Pro Build/QKQ1.191222.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36  XiaoMi/MiuiBrowser/10.8.1 LT-APP/44/200\",\"Accept\":\"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\",\"x-app\":\"96c1ea5a-9a52-44c9-8ac4-8dceafa065c8\",\"X-Requested-With\":\"com.quxianzhuan.wap\",\"Sec-Fetch-Site\":\"none\",\"Sec-Fetch-Mode\":\"navigate\",\"Sec-Fetch-User\":\"?1\",\"Sec-Fetch-Dest\":\"document\",\"Referer\":\"https://wap.quxianzhuan.com/reward/list/?xapp-target=blank\",\"Accept-Encoding\":\"gzip, deflate\",\"Accept-Language\":\"zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7\",\"Cookie\":\"" + xqzck + "\"}")
      };
      $.get(_0x3df897, async (_0x190220, _0x3af933, _0x409111) => {
        try {
          xqzid = _0x409111.match(/reward_id":"(\d+)",/)[1];
          xqztk = xqzck.match(/tzb_formhash_cookie=(\w+);/)[1];
          console.log("\n闲趣赚匹配任务ID：" + xqzid);
          await xqzrw();
        } catch (_0x32f4e6) {} finally {
          {
            _0x28fe4c();
          }
        }
      }, _0x8d8167);
    }
  });
}
function xqzrw(_0x2888ee = 0) {
  return new Promise(_0x41ce33 => {
    let _0x579dd9 = {
      "url": "https://wap.quxianzhuan.com/reward/browse/append/",
      "headers": JSON.parse("{\"Host\":\"wap.quxianzhuan.com\",\"Connection\":\"keep-alive\",\"Upgrade-Insecure-Requests\":\"1\",\"User-Agent\":\"Mozilla/5.0 (Linux; Android 10; 16s Pro Build/QKQ1.191222.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36  XiaoMi/MiuiBrowser/10.8.1 LT-APP/44/200\",\"Accept\":\"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\",\"x-app\":\"96c1ea5a-9a52-44c9-8ac4-8dceafa065c8\",\"X-Requested-With\":\"com.quxianzhuan.wap\",\"Sec-Fetch-Site\":\"none\",\"Sec-Fetch-Mode\":\"navigate\",\"Sec-Fetch-User\":\"?1\",\"Sec-Fetch-Dest\":\"document\",\"Referer\":\"https://wap.quxianzhuan.com/reward/list/?xapp-target=blank\",\"Accept-Encoding\":\"gzip, deflate\",\"Accept-Language\":\"zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7\",\"Cookie\":\"" + xqzck + "\"}"),
      "body": "reward_id=" + xqzid + "&formhash=" + xqztk + "&inajax=1"
    };
    $.post(_0x579dd9, async (_0x216874, _0x50e484, _0x53fa76) => {
      {
        try {
          const _0x35ebda = JSON.parse(_0x53fa76);
          if (_0x35ebda.state == 1) {
            console.log("\n闲趣赚任务：" + _0x35ebda.msg + "等待10秒继续下一任务");
            await $.wait(11000);
            await xqzlb();
          } else {
            console.log("\n闲趣赚任务：" + _0x35ebda.msg);
          }
        } catch (_0x1ec8c9) {} finally {
          {
            _0x41ce33();
          }
        }
      }
    }, _0x2888ee);
  });
}
function xqzxx(_0x330473 = 0) {
  return new Promise(_0x51f24f => {
    let _0x54f1fa = {
      "url": "https://wap.quxianzhuan.com/user/",
      "headers": JSON.parse("{\"Host\":\"wap.quxianzhuan.com\",\"Connection\":\"keep-alive\",\"Upgrade-Insecure-Requests\":\"1\",\"User-Agent\":\"Mozilla/5.0 (Linux; Android 10; 16s Pro Build/QKQ1.191222.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36  XiaoMi/MiuiBrowser/10.8.1 LT-APP/44/200\",\"Accept\":\"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\",\"x-app\":\"96c1ea5a-9a52-44c9-8ac4-8dceafa065c8\",\"X-Requested-With\":\"com.quxianzhuan.wap\",\"Sec-Fetch-Site\":\"none\",\"Sec-Fetch-Mode\":\"navigate\",\"Sec-Fetch-User\":\"?1\",\"Sec-Fetch-Dest\":\"document\",\"Referer\":\"https://wap.quxianzhuan.com/reward/list/?xapp-target=blank\",\"Accept-Encoding\":\"gzip, deflate\",\"Accept-Language\":\"zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7\",\"Cookie\":\"" + xqzck + "\"}")
    };
    $.get(_0x54f1fa, async (_0x3bfce3, _0x1a61ad, _0x4ac891) => {
      try {
        let _0x31cd8c = _0x4ac891.match(/available_money":(.+?),"/)[1];
        let _0x318a42 = _0x4ac891.match(/UID：(.+?)\<\/span\>/)[1];
        console.log("\n闲趣赚靓仔用户：【" + _0x318a42 + "】 - 可提现余额【" + _0x31cd8c + "】");
      } catch (_0x147b1e) {} finally {
        _0x51f24f();
      }
    }, _0x330473);
  });
}
function rand(_0x55047e, _0x5f4ee9) {
  return parseInt(Math.random() * (_0x5f4ee9 - _0x55047e + 1) + _0x55047e, 10);
}
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), a = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(a, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t) { let e = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))); let h = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; h.push(e), s && h.push(s), i && h.push(i), console.log(h.join("\n")), this.logs = this.logs.concat(h) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
