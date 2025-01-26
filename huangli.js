/*APP：黄历 （安卓任务多，苹果任务少）变量名：hlck变量值：找到http://python001.smallsword.cn/integral/account_info?将？后面的内容作为变量，多账号换行功能：完成日常任务，每天1块钱左右，满1元可以自动提现定时：1小时一次，吃饭的点要覆盖，建议7-22*/
NAME = "黄历"; VALY = ["hlck"]; CK = ""; LOGS = 0; usid = 0; nowhour = Math.round(new Date().getHours()).toString(); Notify = 1;
const fs = require("fs");
function gogogo(_0x30a068, _0x46d66f, _0x1039f2) {
    const _0x30deee = new URL("http://test.com?" + _0x1039f2);
    for (let _0xfe1a9e = 0; _0xfe1a9e < _0x46d66f.length; _0xfe1a9e++) { const _0x333dd8 = _0x46d66f[_0xfe1a9e]; _0x30a068[_0x333dd8] = _0x30deee.searchParams.get(_0x333dd8); }
}
class Bar {
    constructor(_0x7e48f6) { this._ = ++usid; this.f = "账号 [" + this._ + "] "; let _0xe420f1 = ["market", "openudid", "dev_uuid", "oaid", "user_id"]; gogogo(this, _0xe420f1, _0x7e48f6); this.message = ""; this.logs = true; }
    async login() {
        let _0x191445 = $.time(13), _0x2e8cab = $.MD5Encrypt(0, "appname=chinesealmanac_android&cert_key=9jt6vo23r3ws090n2b3n2h63g8k4ng30axw18&client=android&dev_uuid=" + this.dev_uuid + "&device=android&idfa=android&imei=&jbk=0&lang=zh_cn&market=" + this.market + "&oaid=" + this.oaid + "&openudid=" + this.openudid + "&timestamp=" + _0x191445 + "&user_id=" + this.user_id + "&ver=1.9.1"), _0x336ab0 = await $.task("get", "http://python001.smallsword.cn/integral/account_info?lang=zh_cn&jbk=0&device=android&timestamp=" + _0x191445 + "&ver=1.9.1&appname=chinesealmanac_android&client=android&idfa=android&market=" + this.market + "&openudid=" + this.openudid + "&dev_uuid=" + this.dev_uuid + "&oaid=" + this.oaid + "&imei=&user_id=" + this.user_id + "&sign=" + _0x2e8cab, {});
        if (_0x336ab0.code == "E00000000") {
            console.log(this.f + "登陆成功，当前金币" + _0x336ab0.data.now_score + ",当前余额" + _0x336ab0.data.cash_num + "元"); this.message += this.f + "登陆成功，当前金币" + _0x336ab0.data.now_score + ",当前余额" + _0x336ab0.data.cash_num + "元";
            if (_0x336ab0.data.cash_num >= 1) { await this.tixian(); }
            this.logs = true;
        } else { this.logs = false; }
    }
    async signinlist() {
        let _0x5110db = $.time(13), _0x364f86 = $.MD5Encrypt(0, "appname=chinesealmanac_android&cert_key=9jt6vo23r3ws090n2b3n2h63g8k4ng30axw18&client=android&dev_uuid=" + this.dev_uuid + "&device=android&idfa=android&imei=&jbk=0&lang=zh_cn&market=" + this.market + "&oaid=" + this.oaid + "&openudid=" + this.openudid + "&timestamp=" + _0x5110db + "&user_id=" + this.user_id + "&ver=1.9.1"), _0x364613 = await $.task("get", "http://python001.smallsword.cn/integral/sign_task?lang=zh_cn&jbk=0&device=android&timestamp=" + _0x5110db + "&ver=1.9.1&appname=chinesealmanac_android&client=android&idfa=android&market=" + this.market + "&openudid=" + this.openudid + "&dev_uuid=" + this.dev_uuid + "&oaid=" + this.oaid + "&imei=&user_id=" + this.user_id + "&sign=" + _0x364f86, {});
        for (let _0x27dec5 of _0x364613.data.list) { for (let _0x1e37ca of _0x27dec5.videos) { if (_0x1e37ca.status == 0) { let _0x20407e = "刷金币"; await this.signinvideo(_0x1e37ca.task_id, _0x1e37ca.score, _0x20407e); } } }
        if (_0x364613.code == "E00000000" && _0x364613.data.is_today_sign == 0) {
            let _0x3631e6 = _0x364613.data.list.find(_0x12c4ea => _0x12c4ea.status === "0"), _0x42ea26 = "签到";
            await this.signin(_0x3631e6.task_id, _0x3631e6.score, _0x42ea26);
            for (let _0xf3e7e1 of _0x3631e6.videos) { let _0x11599d = "签到"; await this.signinvideo(_0xf3e7e1.task_id, _0xf3e7e1.score, _0x11599d); }
        }
    }
    async signin(_0x26dfe1, _0x3a6636, _0x19a836) {
        let _0x43050e = $.time(13), _0x6930f3 = $.MD5Encrypt(0, "appname=chinesealmanac_android&cert_key=9jt6vo23r3ws090n2b3n2h63g8k4ng30axw18&client=android&dev_uuid=" + this.dev_uuid + "&device=android&idfa=android&imei=&is_video=0&jbk=0&lang=zh_cn&market=" + this.market + "&oaid=" + this.oaid + "&openudid=" + this.openudid + "&score=" + _0x3a6636 + "&task_id=" + _0x26dfe1 + "&timestamp=" + _0x43050e + "&user_id=" + this.user_id + "&ver=1.9.1"), _0x4a34e2 = "lang=zh_cn&jbk=0&device=android&timestamp=" + _0x43050e + "&ver=1.9.1&appname=chinesealmanac_android&client=android&idfa=android&market=" + this.market + "&openudid=" + this.openudid + "&dev_uuid=" + this.dev_uuid + "&oaid=" + this.oaid + "&imei=&user_id=" + this.user_id + "&task_id=" + _0x26dfe1 + "&is_video=0&score=" + _0x3a6636 + "&sign=" + _0x6930f3, _0x2960b9 = await $.task("post", "http://python001.smallsword.cn/integral/do_task", {}, _0x4a34e2);
        if (_0x2960b9.code == "E00000000") { console.log("" + this.f + _0x19a836 + "成功，获得" + _0x3a6636 + "金币"); await $.wait(35000, 40000); } else { console.log("" + this.f + _0x19a836 + "失败，原因:" + _0x2960b9.msg); }
    }
    async signinvideo(_0x2c8db3, _0x40c50d, _0x25457e) {
        let _0x697c22 = $.time(13), _0x2970b6 = $.MD5Encrypt(0, "appname=chinesealmanac_android&cert_key=9jt6vo23r3ws090n2b3n2h63g8k4ng30axw18&client=android&dev_uuid=" + this.dev_uuid + "&device=android&idfa=android&imei=&is_video=1&jbk=0&lang=zh_cn&market=" + this.market + "&oaid=" + this.oaid + "&openudid=" + this.openudid + "&score=" + _0x40c50d + "&task_id=" + _0x2c8db3 + "&timestamp=" + _0x697c22 + "&user_id=" + this.user_id + "&ver=1.9.1"), _0x14bf91 = "lang=zh_cn&jbk=0&device=android&timestamp=" + _0x697c22 + "&ver=1.9.1&appname=chinesealmanac_android&client=android&idfa=android&market=" + this.market + "&openudid=" + this.openudid + "&dev_uuid=" + this.dev_uuid + "&oaid=" + this.oaid + "&imei=&user_id=" + this.user_id + "&task_id=" + _0x2c8db3 + "&is_video=1&score=" + _0x40c50d + "&sign=" + _0x2970b6, _0xc57fbe = await $.task("post", "http://python001.smallsword.cn/integral/do_task", {}, _0x14bf91);
        if (_0xc57fbe.code == "E00000000") { console.log("" + this.f + _0x25457e + "视频观看成功，获得" + _0x40c50d + "金币"); await $.wait(35000, 40000); } else { console.log("" + this.f + _0x25457e + "视频观看失败，原因:" + _0xc57fbe.msg); }
    }
    async videolist() {
        let _0xe18dae = $.time(13), _0x224ee0 = $.MD5Encrypt(0, "appname=chinesealmanac_android&cert_key=9jt6vo23r3ws090n2b3n2h63g8k4ng30axw18&client=android&dev_uuid=" + this.dev_uuid + "&device=android&idfa=android&imei=&jbk=0&lang=zh_cn&market=" + this.market + "&oaid=" + this.oaid + "&openudid=" + this.openudid + "&timestamp=" + _0xe18dae + "&user_id=" + this.user_id + "&ver=1.9.1"), _0x2544ff = await $.task("get", "http://python001.smallsword.cn/integral/video_task?lang=zh_cn&jbk=0&device=android&timestamp=" + _0xe18dae + "&ver=1.9.1&appname=chinesealmanac_android&client=android&idfa=android&market=" + this.market + "&openudid=" + this.openudid + "&dev_uuid=" + this.dev_uuid + "&oaid=" + this.oaid + "&imei=&user_id=" + this.user_id + "&sign=" + _0x224ee0, {});
        if (_0x2544ff.code == "E00000000") { for (let _0x4d36dd of _0x2544ff.data) { if (_0x4d36dd.status == 0) { let _0x45a023 = "完成看视频任务"; await this.signin(_0x4d36dd.task_id, _0x4d36dd.score, _0x45a023); } } }
    }
    async boxlist() {
        let _0x4a0c89 = $.time(13), _0x377adc = $.MD5Encrypt(0, "appname=chinesealmanac_android&cert_key=9jt6vo23r3ws090n2b3n2h63g8k4ng30axw18&client=android&dev_uuid=" + this.dev_uuid + "&device=android&idfa=android&imei=&jbk=0&lang=zh_cn&market=" + this.market + "&oaid=" + this.oaid + "&openudid=" + this.openudid + "&timestamp=" + _0x4a0c89 + "&user_id=" + this.user_id + "&ver=1.9.1"), _0xaf37e3 = await $.task("get", "http://python001.smallsword.cn/integral/chest_task?lang=zh_cn&jbk=0&device=android&timestamp=" + _0x4a0c89 + "&ver=1.9.1&appname=chinesealmanac_android&client=android&idfa=android&market=" + this.market + "&openudid=" + this.openudid + "&dev_uuid=" + this.dev_uuid + "&oaid=" + this.oaid + "&imei=&user_id=" + this.user_id + "&sign=" + _0x377adc, {});
        if (_0xaf37e3.code == "E00000000" && _0xaf37e3.data.status == 0) {
            let _0x3ba053 = "开宝箱"; await this.signin(_0xaf37e3.data.task_id, _0xaf37e3.data.score, _0x3ba053);
            for (let _0x5668e3 of _0xaf37e3.data.videos) { let _0x34080f = "宝箱"; await this.signinvideo(_0x5668e3.task_id, _0x5668e3.score, _0x34080f); }
        }
    }
    async meallist() {
        let _0x158eea = $.time(13), _0x50e532 = $.MD5Encrypt(0, "appname=chinesealmanac_android&cert_key=9jt6vo23r3ws090n2b3n2h63g8k4ng30axw18&client=android&dev_uuid=" + this.dev_uuid + "&device=android&idfa=android&imei=&jbk=0&lang=zh_cn&market=" + this.market + "&oaid=" + this.oaid + "&openudid=" + this.openudid + "&timestamp=" + _0x158eea + "&user_id=" + this.user_id + "&ver=1.9.1"), _0x5c9195 = await $.task("get", "http://python001.smallsword.cn/integral/meal_task?lang=zh_cn&jbk=0&device=android&timestamp=" + _0x158eea + "&ver=1.9.1&appname=chinesealmanac_android&client=android&idfa=android&market=" + this.market + "&openudid=" + this.openudid + "&dev_uuid=" + this.dev_uuid + "&oaid=" + this.oaid + "&imei=&user_id=" + this.user_id + "&sign=" + _0x50e532, {});
        if (_0x5c9195.code == "E00000000") {
            let _0x253019 = $.getCurrentTask(_0x5c9195.data);
            if (_0x253019.status == 1) {
                let _0x337f38 = "完成吃饭任务"; await this.signin(_0x253019.task_id, _0x253019.score, _0x337f38);
                for (let _0x7a7750 of _0x253019.videos) { let _0x40d1a9 = "完成吃饭视频任务"; await this.signinvideo(_0x7a7750.task_id, _0x7a7750.score, _0x40d1a9); }
            }
        }
    }
    async commonlist() {
        let _0x225714 = $.time(13), _0xbef148 = $.MD5Encrypt(0, "appname=chinesealmanac_android&cert_key=9jt6vo23r3ws090n2b3n2h63g8k4ng30axw18&client=android&dev_uuid=" + this.dev_uuid + "&device=android&idfa=android&imei=&jbk=0&lang=zh_cn&market=" + this.market + "&oaid=" + this.oaid + "&openudid=" + this.openudid + "&timestamp=" + _0x225714 + "&user_id=" + this.user_id + "&ver=1.9.1"), _0x16e06a = await $.task("get", "http://python001.smallsword.cn/integral/common_task?lang=zh_cn&jbk=0&device=android&timestamp=" + _0x225714 + "&ver=1.9.1&appname=chinesealmanac_android&client=android&idfa=android&market=" + this.market + "&openudid=" + this.openudid + "&dev_uuid=" + this.dev_uuid + "&oaid=" + this.oaid + "&imei=&user_id=" + this.user_id + "&sign=" + _0xbef148, {});
        if (_0x16e06a.code == "E00000000") {
            for (let _0x190295 of _0x16e06a.data) {
                if (_0x190295.title) {
                    for (let _0x151fa6 of _0x190295.list) {
                        if (_0x151fa6.status == 0) {
                            let _0x145e2f = "完成" + _0x151fa6.task_name + "任务";
                            await this.signin(_0x151fa6.task_id, _0x151fa6.score, _0x145e2f); await this.receive(_0x151fa6.task_id, _0x151fa6.score, _0x145e2f);
                        }
                    }
                }
            }
        }
    }
    async receive(_0x14f592, _0x57f640) { let _0x544f86 = $.time(13), _0x28fd10 = $.MD5Encrypt(0, "appname=chinesealmanac_android&cert_key=9jt6vo23r3ws090n2b3n2h63g8k4ng30axw18&client=android&dev_uuid=" + this.dev_uuid + "&device=android&idfa=android&imei=&jbk=0&lang=zh_cn&market=" + this.market + "&oaid=" + this.oaid + "&openudid=" + this.openudid + "&score=" + _0x57f640 + "&task_id=" + _0x14f592 + "&timestamp=" + _0x544f86 + "&user_id=" + this.user_id + "&ver=1.9.1"); }
    async walklist() {
        let _0x59d03c = $.time(13), _0x2627f1 = $.RT(10000, 15000), _0x27160a = $.MD5Encrypt(0, "appname=chinesealmanac_android&cert_key=9jt6vo23r3ws090n2b3n2h63g8k4ng30axw18&client=android&dev_uuid=" + this.dev_uuid + "&device=android&idfa=android&imei=&jbk=0&lang=zh_cn&market=" + this.market + "&oaid=" + this.oaid + "&openudid=" + this.openudid + "&steps=" + _0x2627f1 + "&timestamp=" + _0x59d03c + "&user_id=" + this.user_id + "&ver=1.9.1"), _0x277a85 = await $.task("get", "http://python001.smallsword.cn/integral/walk_task?lang=zh_cn&jbk=0&device=android&timestamp=" + _0x59d03c + "&ver=1.9.1&appname=chinesealmanac_android&client=android&idfa=android&market=" + this.market + "&openudid=" + this.openudid + "&dev_uuid=" + this.dev_uuid + "&oaid=" + this.oaid + "&imei=&user_id=" + this.user_id + "&steps=" + _0x2627f1 + "&sign=" + _0x27160a, {});
        if (_0x277a85.code == "E00000000") {
            let _0x4c0677 = _0x277a85.data.list, _0x21836c = _0x4c0677.map(_0x330f63 => _0x330f63.task_id).join(",");
            if (_0x4c0677[4].status == 0) {
                await this.steps(_0x21836c);
                for (let _0x3a01b0 of _0x277a85.data.task_video) { let _0x3844f8 = "完成走路视频任务"; await this.signinvideo(_0x3a01b0.task_id, _0x3a01b0.score, _0x3844f8); }
            }
        }
    }
    async steps(_0xb7d378) {
        let _0x73c907 = encodeURIComponent(_0xb7d378), _0x6a412 = $.time(13), _0x5e50ed = $.MD5Encrypt(0, "appname=chinesealmanac_android&cert_key=9jt6vo23r3ws090n2b3n2h63g8k4ng30axw18&client=android&dev_uuid=" + this.dev_uuid + "&device=android&idfa=android&imei=&is_video=0&jbk=0&lang=zh_cn&market=" + this.market + "&oaid=" + this.oaid + "&openudid=" + this.openudid + "&score=550&task_id=&task_ids=" + _0xb7d378 + "&timestamp=" + _0x6a412 + "&user_id=" + this.user_id + "&ver=1.9.1"), _0x34aad5 = "lang=zh_cn&jbk=0&device=android&timestamp=" + _0x6a412 + "&ver=1.9.1&appname=chinesealmanac_android&client=android&idfa=android&market=" + this.market + "&openudid=" + this.openudid + "&dev_uuid=" + this.dev_uuid + "&oaid=" + this.oaid + "&imei=&user_id=" + this.user_id + "&task_ids=" + _0x73c907 + "&task_id=&is_video=0&score=550&sign=" + _0x5e50ed, _0x23df4d = await $.task("post", "http://python001.smallsword.cn/integral/do_task", {}, _0x34aad5);
        _0x23df4d.code == "E00000000" ? console.log(this.f + "领取步数奖励成功，获得550金币") : console.log(this.f + "领取步数奖励失败，原因:" + _0x23df4d.msg);
    }
    async tixian() {
        let _0x2329e9 = $.time(13), _0x3d5ad0 = $.MD5Encrypt(0, this.user_id + "19jt6vo23r3ws090n2b3n2h63g8k4ng30axw18"), _0x41ae4c = "lang=zh_cn&jbk=0&device=android&timestamp=" + _0x2329e9 + "&ver=1.9.1&appname=chinesealmanac_android&client=android&idfa=android&market=" + this.market + "&openudid=" + this.openudid + "&dev_uuid=" + this.dev_uuid + "&oaid=" + this.oaid + "&imei=&user_id=" + this.user_id + "&type=1&app_secret=" + _0x3d5ad0, _0x4c2825 = await $.task("post", "http://python001.smallsword.cn/cash_out", {}, _0x41ae4c);
        _0x4c2825.code == "E00000000" ? console.log(this.f + "提现1元成功") : console.log(this.f + " " + _0x4c2825.msg);
    }
    async plantlist() {
        let _0x1e24b7 = $.time(13), _0x26e421 = $.MD5Encrypt(0, "appname=chinesealmanac_android&cert_key=9jt6vo23r3ws090n2b3n2h63g8k4ng30axw18&client=android&dev_uuid=" + this.dev_uuid + "&device=android&idfa=android&imei=&jbk=0&lang=zh_cn&market=" + this.market + "&oaid=" + this.oaid + "&openudid=" + this.openudid + "&timestamp=" + _0x1e24b7 + "&user_id=" + this.user_id + "&ver=1.9.1"), _0x4d24e7 = await $.task("get", "http://python001.smallsword.cn/tree/integral_list?lang=zh_cn&jbk=0&device=android&timestamp=" + _0x1e24b7 + "&ver=1.9.1&appname=chinesealmanac_android&client=android&idfa=android&market=" + this.market + "&openudid=" + this.openudid + "&dev_uuid=" + this.dev_uuid + "&oaid=" + this.oaid + "&imei=&user_id=" + this.user_id + "&sign=" + _0x26e421, {});
        if (_0x4d24e7.code == "E00000000") { let _0xe17338 = "种树气泡金币"; _0x4d24e7.data.left.is_countdown == 0 && (await this.receive2(_0x4d24e7.data.left.task_id, _0x4d24e7.data.left.multiple_score, _0xe17338)); await $.wait(3000, 10000); _0x4d24e7.data.right.is_countdown == 0 && (await this.receive2(_0x4d24e7.data.right.task_id, _0x4d24e7.data.right.score, _0xe17338)); }
    }
    async receive2(_0x688ca1, _0x472ddf, _0x7db0f0) {
        let _0x32bbe2 = $.time(13), _0x3cc42e = $.MD5Encrypt(0, "appname=chinesealmanac_android&cert_key=9jt6vo23r3ws090n2b3n2h63g8k4ng30axw18&client=android&dev_uuid=" + this.dev_uuid + "&device=android&idfa=android&imei=&jbk=0&lang=zh_cn&market=" + this.market + "&oaid=" + this.oaid + "&openudid=" + this.openudid + "&score=" + _0x472ddf + "&task_id=" + _0x688ca1 + "&timestamp=" + _0x32bbe2 + "&user_id=" + this.user_id + "&ver=1.9.1"), _0x3106ca = "lang=zh_cn&jbk=0&device=android&timestamp=" + _0x32bbe2 + "&ver=1.9.1&appname=chinesealmanac_android&client=android&idfa=android&market=" + this.market + "&openudid=" + this.openudid + "&dev_uuid=" + this.dev_uuid + "&oaid=" + this.oaid + "&imei=&user_id=" + this.user_id + "&task_id=" + _0x688ca1 + "&score=" + _0x472ddf + "&sign=" + _0x3cc42e, _0x1e9c44 = await $.task("post", "http://python001.smallsword.cn/tree/receive_integral", {}, _0x3106ca);
        if (_0x1e9c44.code == "E00000000") { console.log(this.f + "收取" + _0x7db0f0 + "奖励成功，获得" + _0x472ddf + "金币"); } else { console.log(this.f + "收取" + _0x7db0f0 + "奖励失败，原因：" + _0x1e9c44.msg); }
    }
}
$ = DD(); !(async () => {
    console.log(NAME);
    await $.ExamineCookie();
    await $.Multithreading("login");
    let _0xd3f276 = $.cookie_list.filter(_0x4b9b31 => _0x4b9b31.logs == true);
    if (_0xd3f276.length == 0) { console.log("Cookie格式错误 或 账号被禁封"); return; } else { await $.Multithreading("signinlist"); await $.Multithreading("videolist"); await $.Multithreading("boxlist"); await $.Multithreading("meallist"); await $.Multithreading("commonlist"); await $.Multithreading("walklist"); await $.Multithreading("plantlist"); }
    let _0x1804b3 = [];
    for (let _0x542165 of $.cookie_list) { if (_0x542165.message) { _0x1804b3.push(_0x542165.message); } }
    if (_0x1804b3.length > 0) { await $.SendMsg(_0x1804b3.join("\n")); }
})().catch(_0x48ede4 => { console.log(_0x48ede4); }).finally(() => { });

function DD() {
    return new class {
        constructor() { this.cookie_list = []; this.message = ""; this.CryptoJS = require("crypto-js"); this.NodeRSA = require("node-rsa"); this.request = require("request"); this.Sha_Rsa = require("jsrsasign"); }
        async Multithreading(_0x1eb074, _0x795eaf, _0x1585ff) {
            let _0x945005 = []; !_0x1585ff && (_0x1585ff = 1);
            while (_0x1585ff--) { for (let _0x2f2d1c of $.cookie_list) { _0x945005.push(_0x2f2d1c[_0x1eb074](_0x795eaf)); } }
            await Promise.allSettled(_0x945005);
        }
        ExamineCookie() {
            let _0x5e8b90 = process.env[VALY] || CK, _0x3bdd5d = 0;
            if (_0x5e8b90) {
                for (let _0x59842b of _0x5e8b90.split("\n").filter(_0x45f5a1 => !!_0x45f5a1)) { $.cookie_list.push(new Bar(_0x59842b)); }
                _0x3bdd5d = $.cookie_list.length;
            } else { console.log("\n【" + NAME + "】：未填写变量: " + VALY); }
            console.log("共找到" + _0x3bdd5d + "个账号"); return $.cookie_list;
        }
        task(_0xbb09ee, _0x5bb002, _0x3182d5, _0x52c8dc, _0x5ec08e) {
            _0xbb09ee == "delete" ? _0xbb09ee = _0xbb09ee.toUpperCase() : _0xbb09ee = _0xbb09ee;
            if (_0xbb09ee == "post") { delete _0x3182d5["content-type"]; delete _0x3182d5["Content-type"]; delete _0x3182d5["content-Type"]; $.safeGet(_0x52c8dc) ? _0x3182d5["Content-Type"] = "application/json;charset=UTF-8" : _0x3182d5["Content-Type"] = "application/x-www-form-urlencoded"; _0x52c8dc && (_0x3182d5["Content-Length"] = $.lengthInUtf8Bytes(_0x52c8dc)); }
            _0xbb09ee == "get" && (delete _0x3182d5["content-type"], delete _0x3182d5["Content-type"], delete _0x3182d5["content-Type"], delete _0x3182d5["Content-Length"]); _0x3182d5.Host = _0x5bb002.replace("//", "/").split("/")[1]; return new Promise(async _0x550df7 => {
                if (_0xbb09ee.indexOf("T") < 0) { var _0x1360c5 = { url: _0x5bb002, headers: _0x3182d5, body: _0x52c8dc, proxy: "http://" + _0x5ec08e }; } else { var _0x1360c5 = { url: _0x5bb002, headers: _0x3182d5, form: JSON.parse(_0x52c8dc), proxy: "http://" + _0x5ec08e }; }
                if (!_0x5ec08e) { delete _0x1360c5.proxy; }
                this.request[_0xbb09ee.toLowerCase()](_0x1360c5, (_0x1f4f4b, _0x409069, _0x51251b) => {
                    try {
                        if (_0x51251b) {
                            if (LOGS == 1) {
                                console.log("================ 请求 ================"); console.log(_0x1360c5); console.log("================ 返回 ================");
                                if ($.safeGet(_0x51251b)) { console.log(JSON.parse(_0x51251b)); } else { console.log(_0x51251b); }
                            }
                        }
                    } catch (_0x3b6beb) { console.log(_0x3b6beb, _0x5bb002 + "\n" + _0x3182d5); } finally {
                        let _0x7dead5 = "";
                        if (!_0x1f4f4b) { if ($.safeGet(_0x51251b)) { _0x7dead5 = JSON.parse(_0x51251b); } else { _0x51251b.indexOf("/") != -1 && _0x51251b.indexOf("+") != -1 ? _0x7dead5 = _0x51251b : _0x7dead5 = _0x51251b; } } else { _0x7dead5 = _0x5bb002 + "   API请求失败，请检查网络重试\n" + _0x1f4f4b; }
                        return _0x550df7(_0x7dead5);
                    }
                });
            });
        }
        async readUUID() {
            const _0x46a57f = "uuid.txt"; await $.generateUUID(_0x46a57f);
            try {
                const _0x45baea = fs.readFileSync(_0x46a57f, "utf8"), _0x3586cf = _0x45baea.trim();
                return _0x3586cf;
            } catch (_0x50dcbe) { return null; }
        }
        generateUUID(_0x24d8e7) {
            if (fs.existsSync(_0x24d8e7)) { return; }
            const _0x131970 = uuidv4();
            fs.writeFile(_0x24d8e7, _0x131970, "utf8", _0x15fd3c => {
                if (_0x15fd3c) { console.error("写入文件出错: " + _0x15fd3c.message); return; }
                console.log("uuid.txt 文件已创建并写入 UUID。");
            });
        }
        async getkami() {
            let _0x1fae1e = await $.readUUID(), _0x40d9c8 = await $.task("get", "http://" + dcfhost + ":5705/query?dcf=" + dcfkey + "&MA=" + _0x1fae1e, {});
            return _0x40d9c8;
        }
        async SendMsg(_0x37963b) {
            if (!_0x37963b) { return; }
            if (Notify == 1) {
                var _0x427c10 = require("./sendNotify");
                await _0x427c10.sendNotify(NAME, _0x37963b);
            }
        }
        lengthInUtf8Bytes(_0x5bea6d) {
            let _0x5c614f = encodeURIComponent(_0x5bea6d).match(/%[89ABab]/g);
            return _0x5bea6d.length + (_0x5c614f ? _0x5c614f.length : 0);
        }
        randomArr(_0x5a3e78) { return _0x5a3e78[parseInt(Math.random() * _0x5a3e78.length, 10)]; }
        wait(_0x1cf974) { return new Promise(_0x47513a => setTimeout(_0x47513a, _0x1cf974)); }
        time(_0x4d3818) { if (_0x4d3818 == 10) { return Math.round(+new Date() / 1000); } else { return +new Date(); } }
        timenow(_0x504efd) {
            let _0x30bb30 = new Date();
            if (_0x504efd == undefined) {
                let _0x4a9944 = new Date(), _0x1a08dd = _0x4a9944.getFullYear() + "-", _0xf4248c = (_0x4a9944.getMonth() + 1 < 10 ? "0" + (_0x4a9944.getMonth() + 1) : _0x4a9944.getMonth() + 1) + "-", _0x162e22 = _0x4a9944.getDate() + " ", _0x1e7941 = _0x4a9944.getHours() + ":", _0x65e6f5 = _0x4a9944.getMinutes() + ":", _0x595250 = _0x4a9944.getSeconds() + 1 < 10 ? "0" + _0x4a9944.getSeconds() : _0x4a9944.getSeconds();
                return _0x1a08dd + _0xf4248c + _0x162e22 + _0x1e7941 + _0x65e6f5 + _0x595250;
            } else { if (_0x504efd == 0) { return _0x30bb30.getFullYear(); } else { if (_0x504efd == 1) { return _0x30bb30.getMonth() + 1 < 10 ? "0" + (_0x30bb30.getMonth() + 1) : _0x30bb30.getMonth() + 1; } else { if (_0x504efd == 2) { return _0x30bb30.getDate(); } else { if (_0x504efd == 3) { return _0x30bb30.getHours(); } else { if (_0x504efd == 4) { return _0x30bb30.getMinutes(); } else { if (_0x504efd == 5) { return _0x30bb30.getSeconds() + 1 < 10 ? "0" + _0x30bb30.getSeconds() : _0x30bb30.getSeconds(); } } } } } } }
        }
        safeGet(_0x5b424e) { try { if (typeof JSON.parse(_0x5b424e) == "object") { return true; } } catch (_0x49db7a) { return false; } }
        SJS(_0x491407, _0x14f4c5) {
            if (_0x14f4c5 == 0) {
                let _0x24fbf4 = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm01234567890123456789", _0x402e8 = _0x24fbf4.length, _0x50cdc8 = "";
                for (let _0x260b78 = 0; _0x260b78 < _0x491407; _0x260b78++) { _0x50cdc8 += _0x24fbf4.charAt(Math.floor(Math.random() * _0x402e8)); }
                return _0x50cdc8;
            } else {
                if (_0x14f4c5 == 1) {
                    let _0x3780a1 = "qwertyuiopasdfghjklzxcvbnm0123456789", _0x44a59c = _0x3780a1.length, _0x223007 = "";
                    for (let _0xf85624 = 0; _0xf85624 < _0x491407; _0xf85624++) { _0x223007 += _0x3780a1.charAt(Math.floor(Math.random() * _0x44a59c)); }
                    return _0x223007;
                } else {
                    let _0x16ef8e = "0123456789", _0x2927cb = _0x16ef8e.length, _0x36f3c8 = "";
                    for (let _0x5a688c = 0; _0x5a688c < _0x491407; _0x5a688c++) { _0x36f3c8 += _0x16ef8e.charAt(Math.floor(Math.random() * _0x2927cb)); }
                    return _0x36f3c8;
                }
            }
        }
        getCurrentTask(_0x2fb03c) {
            const _0xd46aee = new Date();
            for (let _0x12eca3 = 0; _0x12eca3 < _0x2fb03c.length; _0x12eca3++) {
                const _0x48394f = _0x2fb03c[_0x12eca3], [_0x4dbb7c, _0x49ca7c] = _0x48394f.time_frame.split("-").map(_0xb75fe0 => {
                    const [_0x431e3b, _0x423334] = _0xb75fe0.split(":");
                    return new Date(_0xd46aee.getFullYear(), _0xd46aee.getMonth(), _0xd46aee.getDate(), _0x431e3b, _0x423334);
                });
                if (_0x4dbb7c <= _0x49ca7c) { if (_0x4dbb7c <= _0xd46aee && _0xd46aee <= _0x49ca7c) { return _0x48394f; } } else { if (_0x4dbb7c <= _0xd46aee || _0xd46aee <= _0x49ca7c) { return _0x48394f; } }
            }
            return null;
        }
        udid(_0x38ce6f) {
            function _0x527705() { return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1); }
            let _0x7b9404 = _0x527705() + _0x527705() + "-" + _0x527705() + "-" + _0x527705() + "-" + _0x527705() + "-" + _0x527705() + _0x527705() + _0x527705();
            return _0x38ce6f == 0 ? _0x7b9404.toUpperCase() : _0x7b9404.toLowerCase();
        }
        encodeUnicode(_0x4d33a5) {
            var _0x7b4cc0 = [];
            for (var _0x38d6f7 = 0; _0x38d6f7 < _0x4d33a5.length; _0x38d6f7++) { _0x7b4cc0[_0x38d6f7] = ("00" + _0x4d33a5.charCodeAt(_0x38d6f7).toString(16)).slice(-4); }
            return "\\u" + _0x7b4cc0.join("\\u");
        }
        decodeUnicode(_0x30ecdd) { _0x30ecdd = _0x30ecdd.replace(/\\u/g, "%u"); return unescape(unescape(_0x30ecdd)); }
        RT(_0x391502, _0x319e5e) { return Math.round(Math.random() * (_0x319e5e - _0x391502) + _0x391502); }
        arrNull(_0x110d8e) {
            var _0x44a5f7 = _0x110d8e.filter(_0x54f54c => { return _0x54f54c && _0x54f54c.trim(); });
            return _0x44a5f7;
        }
        nowtime() { return new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 28800000); }
        timecs() {
            let _0x3dc311 = $.nowtime();
            JSON.stringify(_0x3dc311).indexOf(" ") >= 0 && (_0x3dc311 = _0x3dc311.replace(" ", "T")); return new Date(_0x3dc311).getTime() - 28800000;
        }
        rtjson(_0x452429, _0x1c7dae, _0x44a9cf, _0x16e554) {
            return _0x16e554 == 0 ? JSON.stringify(_0x452429.split(_0x1c7dae).reduce((_0x6a5f78, _0x3b5045) => {
                let _0x3a81bb = _0x3b5045.split(_0x44a9cf);
                _0x6a5f78[_0x3a81bb[0].trim()] = _0x3a81bb[1].trim(); return _0x6a5f78;
            }, {})) : _0x452429.split(_0x1c7dae).reduce((_0xe2c149, _0x1a49c1) => {
                let _0x263614 = _0x1a49c1.split(_0x44a9cf);
                _0xe2c149[_0x263614[0].trim()] = _0x263614[1].trim(); return _0xe2c149;
            }, {});
        }
        MD5Encrypt(_0x4c88f0, _0x29f7ca) { if (_0x4c88f0 == 0) { return this.CryptoJS.MD5(_0x29f7ca).toString().toLowerCase(); } else { if (_0x4c88f0 == 1) { return this.CryptoJS.MD5(_0x29f7ca).toString().toUpperCase(); } else { if (_0x4c88f0 == 2) { return this.CryptoJS.MD5(_0x29f7ca).toString().substring(8, 24).toLowerCase(); } else { if (_0x4c88f0 == 3) { return this.CryptoJS.MD5(_0x29f7ca).toString().substring(8, 24).toUpperCase(); } } } } }
        SHA_Encrypt(_0x26801e, _0x30a1ac, _0x55c0fa) { return _0x26801e == 0 ? this.CryptoJS[_0x30a1ac](_0x55c0fa).toString(this.CryptoJS.enc.Base64) : this.CryptoJS[_0x30a1ac](_0x55c0fa).toString(); }
        HmacSHA_Encrypt(_0x33aa00, _0x4398d3, _0x9b83e5, _0x4f724e) { if (_0x33aa00 == 0) { return this.CryptoJS[_0x4398d3](_0x9b83e5, _0x4f724e).toString(this.CryptoJS.enc.Base64); } else { return this.CryptoJS[_0x4398d3](_0x9b83e5, _0x4f724e).toString(); } }
        Base64(_0x63a29, _0x3834c4) { return _0x63a29 == 0 ? this.CryptoJS.enc.Base64.stringify(this.CryptoJS.enc.Utf8.parse(_0x3834c4)) : this.CryptoJS.enc.Utf8.stringify(this.CryptoJS.enc.Base64.parse(_0x3834c4)); }
        DecryptCrypto(_0x5a1eca, _0x21ae3a, _0x2a5f40, _0x50d64d, _0x4ece84, _0x56b84f, _0x107ba7) {
            if (_0x5a1eca == 0) {
                const _0x14060c = this.CryptoJS[_0x21ae3a].encrypt(this.CryptoJS.enc.Utf8.parse(_0x4ece84), this.CryptoJS.enc.Utf8.parse(_0x56b84f), { iv: this.CryptoJS.enc.Utf8.parse(_0x107ba7), mode: this.CryptoJS.mode[_0x2a5f40], padding: this.CryptoJS.pad[_0x50d64d] });
                return _0x14060c.toString();
            } else {
                const _0x52b220 = this.CryptoJS[_0x21ae3a].decrypt(_0x4ece84, this.CryptoJS.enc.Utf8.parse(_0x56b84f), { iv: this.CryptoJS.enc.Utf8.parse(_0x107ba7), mode: this.CryptoJS.mode[_0x2a5f40], padding: this.CryptoJS.pad[_0x50d64d] });
                return _0x52b220.toString(this.CryptoJS.enc.Utf8);
            }
        }
        RSA(_0x4cf2fb, _0x481bb1) {
            const _0x449dd7 = require("node-rsa");
            let _0x5b2f3c = new _0x449dd7("-----BEGIN PUBLIC KEY-----\n" + _0x481bb1 + "\n-----END PUBLIC KEY-----");
            _0x5b2f3c.setOptions({ encryptionScheme: "pkcs1" });
            return _0x5b2f3c.encrypt(_0x4cf2fb, "base64", "utf8");
        }
        SHA_RSA(_0x46d850, _0xb07503) {
            let _0x839841 = this.Sha_Rsa.KEYUTIL.getKey("-----BEGIN PRIVATE KEY-----\n" + $.getNewline(_0xb07503, 76) + "\n-----END PRIVATE KEY-----"), _0x3b547b = new this.Sha_Rsa.KJUR.crypto.Signature({ alg: "SHA256withRSA" });
            _0x3b547b.init(_0x839841);
            _0x3b547b.updateString(_0x46d850);
            let _0x259a48 = _0x3b547b.sign(), _0x34eae3 = this.Sha_Rsa.hextob64u(_0x259a48);
            return _0x34eae3;
        }
    }();
}