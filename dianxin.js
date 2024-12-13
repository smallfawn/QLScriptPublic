//变量名chinaTelecomAccount
//let ruishuApi = 'http://192.168.31.197:1257'
//搭建DOCKER  瑞数API
//docker run -d --name ruishu -p 1257:1257 yanyu.icu/smallfawn/ruishu
//改为自己的DOCKER地址  
//青龙环境防止SSL报错
//export NODE_OPTIONS="${NODE_OPTIONS} --tls-cipher-list=DEFAULT@SECLEVEL=0"
let ruishuApi = 'http://192.168.31.197:1257'




const _0x49dfef = _0x5370a4("电信营业厅");
const _0x8e0885 = require("got");
const _0x203c4a = require("path");
const {
    exec: _0x3898d1
} = require("child_process");
const {
    CookieJar: _0x4f58d7
} = require("tough-cookie");
let cookieString
const _0x5336b3 = require("fs");
const _0x5e650c = require("crypto-js");
const _0x22f09c = "chinaTelecom";
const _0x1876a7 = /[\n\&\@]/;
const _0x4aec53 = [_0x22f09c + "Account"];
const _0x128624 = 30000;
const _0x5a04a9 = 3;
const _0x1736e2 = _0x22f09c + "Rpc";
const _0x16d3ea = process.env[_0x1736e2];
const _0xf4231c = 6.02;
const _0x14f289 = "chinaTelecom";
const _0x100b57 = "https://leafxcy.coding.net/api/user/leafxcy/project/validcode/shared-depot/validCode/git/blob/master/code.json";
const _0x344953 = "JinDouMall";
let _0x1d3d6d = {};
const _0x5370da = "./chinaTelecom_cache.json";
const _0x3ed712 = "Mozilla/5.0 (Linux; U; Android 12; zh-cn; ONEPLUS A9000 Build/QKQ1.190716.003) AppleWebKit/533.1 (KHTML, like Gecko) Version/5.0 Mobile Safari/533.1";
const _0x75a069 = "34d7cb0bcdf07523";
const _0x2304b1 = "1234567`90koiuyhgtfrdewsaqaqsqde";
const _0x1110eb = "\0\0\0\0\0\0\0\0";
const _0x3c561e = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDBkLT15ThVgz6/NOl6s8GNPofdWzWbCkWnkaAm7O2LjkM1H7dMvzkiqdxU02jamGRHLX/ZNMCXHnPcW/sDhiFCBN18qFvy8g6VYb9QtroI09e176s+ZCtiv7hbin2cCTj99iUpnEloZm19lwHyo69u5UMiPMpq0/XKBO8lYhN/gwIDAQAB";
const _0x1e9565 = "-----BEGIN PUBLIC KEY-----\n" + _0x3c561e + "\n-----END PUBLIC KEY-----";
const _0x516f15 = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+ugG5A8cZ3FqUKDwM57GM4io6JGcStivT8UdGt67PEOihLZTw3P7371+N47PrmsCpnTRzbTgcupKtUv8ImZalYk65dU8rjC/ridwhw9ffW2LBwvkEnDkkKKRi2liWIItDftJVBiWOh17o6gfbPoNrWORcAdcbpk2L+udld5kZNwIDAQAB";
const _0x4995b7 = "-----BEGIN PUBLIC KEY-----\n" + _0x516f15 + "\n-----END PUBLIC KEY-----";
const _0x51cf70 = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDIPOHtjs6p4sTlpFvrx+ESsYkEvyT4JB/dcEbU6C8+yclpcmWEvwZFymqlKQq89laSH4IxUsPJHKIOiYAMzNibhED1swzecH5XLKEAJclopJqoO95o8W63Euq6K+AKMzyZt1SEqtZ0mXsN8UPnuN/5aoB3kbPLYpfEwBbhto6yrwIDAQAB";
const _0x2e5ddf = "-----BEGIN PUBLIC KEY-----\n" + _0x51cf70 + "\n-----END PUBLIC KEY-----";
const _0xc38e90 = require("node-rsa");
let _0x13a631 = new _0xc38e90(_0x1e9565);
const _0x4386dc = {
    encryptionScheme: "pkcs1"
};
_0x13a631.setOptions(_0x4386dc);
let _0x47bb4b = new _0xc38e90(_0x4995b7);
const _0xe2cacf = {
    encryptionScheme: "pkcs1"
};
_0x47bb4b.setOptions(_0xe2cacf);
let _0x5b4189 = new _0xc38e90(_0x2e5ddf);
const _0x3ab892 = {
    encryptionScheme: "pkcs1"
};
_0x5b4189.setOptions(_0x3ab892);
const _0x131d2d = [202201, 202202, 202203];
const _0x3c685e = 5;
function _0x1519a6(_0xa8ae5c, _0x459aac, _0x58d61f, _0xa81bc3, _0x5af061, _0x3eaf32) {
    return _0x5e650c[_0xa8ae5c].encrypt(_0x5e650c.enc.Utf8.parse(_0xa81bc3), _0x5e650c.enc.Utf8.parse(_0x5af061), {
        mode: _0x5e650c.mode[_0x459aac],
        padding: _0x5e650c.pad[_0x58d61f],
        iv: _0x5e650c.enc.Utf8.parse(_0x3eaf32)
    }).ciphertext.toString(_0x5e650c.enc.Hex);
}
function _0x436a1e(_0x5007ed, _0x18814d, _0x38ebb6, _0x4281ff, _0x1bafc9, _0x3aac70) {
    return _0x5e650c[_0x5007ed].decrypt({
        ciphertext: _0x5e650c.enc.Hex.parse(_0x4281ff)
    }, _0x5e650c.enc.Utf8.parse(_0x1bafc9), {
        mode: _0x5e650c.mode[_0x18814d],
        padding: _0x5e650c.pad[_0x38ebb6],
        iv: _0x5e650c.enc.Utf8.parse(_0x3aac70)
    }).toString(_0x5e650c.enc.Utf8);
}
function _0x4e4355() {
    try {
        _0x5336b3.writeFileSync(_0x5370da, JSON.stringify(_0x1d3d6d, null, 4), "utf-8");
    } catch (_0x1c3791) {
        console.log("保存缓存出错");
    }
}
function _0xa0ff1b() {
    try {
        _0x1d3d6d = JSON.parse(_0x5336b3.readFileSync(_0x5370da, "utf-8"));
    } catch (_0x125821) {
        console.log("读取缓存出错, 新建一个token缓存");
        _0x4e4355();
    }
}
let _0x300c8e = 0;
let _0xdb6efe = 0;
function _0x11cae0() {
    _0xdb6efe = 1;
    process.on("SIGTERM", () => {
        _0xdb6efe = 2;
        process.exit(0);
    });
    const _0x377b8a = _0x203c4a.basename(process.argv[1]);
    const _0x39bc5b = ["bash", "timeout", "grep"];
    let _0x4fe84e = ["ps afx"];
    _0x4fe84e.push("grep " + _0x377b8a);
    _0x4fe84e = _0x4fe84e.concat(_0x39bc5b.map(_0x425dac => "grep -v \"" + _0x425dac + " \""));
    _0x4fe84e.push("wc -l");
    const _0x401932 = _0x4fe84e.join("|");
    const _0x134226 = () => {
        _0x3898d1(_0x401932, (_0x26b41f, _0x817890, _0x4eca1a) => {
            if (_0x26b41f || _0x4eca1a) {
                return;
            }
            _0x300c8e = parseInt(_0x817890.trim(), 10);
        });
        if (_0xdb6efe == 1) {
            setTimeout(_0x134226, 2000);
        }
    };
    _0x134226();
}
class _0x9d1851 {
    constructor() {
        this.index = _0x49dfef.userIdx++;
        this.name = "";
        this.valid = false;
        const _0x46f57a = {
            limit: 0
        };
        const _0x42e66e = {
            Connection: "keep-alive"
        };
        const _0x1612bd = {
            retry: _0x46f57a,
            timeout: _0x128624,
            followRedirect: false,
            ignoreInvalidCookies: true,
            headers: _0x42e66e
        };
        this.got = _0x8e0885.extend(_0x1612bd);
        if (_0xdb6efe == 0) {
            _0x11cae0();
        }
    }
    log(_0x42a357, _0x32d0cc = {}) {
        var _0x58117c = "";
        var _0x9ca0e2 = _0x49dfef.userCount.toString().length;
        if (this.index) {
            _0x58117c += "账号[" + _0x49dfef.padStr(this.index, _0x9ca0e2) + "]";
        }
        if (this.name) {
            _0x58117c += "[" + this.name + "]";
        }
        _0x49dfef.log(_0x58117c + _0x42a357, _0x32d0cc);
    }
    set_cookie(_0x309397, _0x3ab012, _0x4a8547, _0x1320cb, _0x482400 = {}) {
        this.cookieJar.setCookieSync(_0x309397 + "=" + _0x3ab012 + "; Domain=" + _0x4a8547 + ";", "" + _0x1320cb);
    }
    async request(_0x29ad8a) {
        const _0x58b4a1 = ["ECONNRESET", "EADDRINUSE", "ENOTFOUND", "EAI_AGAIN"];
        const _0x497c09 = ["TimeoutError"];
        const _0x54807f = ["EPROTO"];
        const _0x30eee7 = [];
        var _0x208a74 = null;
        var _0x3a35d0 = 0;
        var _0x1684d3 = _0x29ad8a.fn || _0x29ad8a.url;
        let _0x25d788 = _0x49dfef.get(_0x29ad8a, "valid_code", _0x30eee7);
        _0x29ad8a.method = _0x29ad8a?.["method"]?.["toUpperCase"]() || "GET";




        let _0x19ce7b;
        let _0x5c8c40;
        while (_0x3a35d0 < _0x5a04a9) {
            try {
                _0x3a35d0++;
                _0x19ce7b = "";
                _0x5c8c40 = "";
                let _0x1fa216 = null;
                let _0x123eec = _0x29ad8a?.["timeout"] || this.got?.["defaults"]?.["options"]?.["timeout"]?.["request"] || _0x128624;
                let _0x34e77b = false;
                let _0x5397b0 = Math.max(this.index - 2, 0);
                let _0x5d25e7 = Math.min(Math.max(this.index - 3, 1), 3);
                let _0x52755a = Math.min(Math.max(this.index - 4, 1), 4);
                let _0x15d328 = _0x5397b0 * _0x5d25e7 * _0x52755a * 400;
                let _0x2c4c80 = _0x5397b0 * _0x5d25e7 * _0x52755a * 1800;
                let _0x4cfee0 = _0x15d328 + Math.floor(Math.random() * _0x2c4c80);
                let _0x15dce7 = _0x300c8e * (_0x300c8e - 1) * 2000;
                let _0x5ca50a = (_0x300c8e - 1) * (_0x300c8e - 1) * 2000;
                let _0x333735 = _0x15dce7 + Math.floor(Math.random() * _0x5ca50a);
                let _0x573d35 = Math.max(_0x49dfef.userCount - 2, 0);
                let _0x25871d = Math.max(_0x49dfef.userCount - 3, 0);
                let _0x34f531 = _0x573d35 * 200;
                let _0x1bd293 = _0x25871d * 400;
                let _0x4845e7 = _0x34f531 + Math.floor(Math.random() * _0x1bd293);
                let _0x5dc50f = _0x4cfee0 + _0x333735 + _0x4845e7;
                await _0x49dfef.wait(1000);
                await new Promise(async _0x45b1d3 => {
                    setTimeout(() => {
                        _0x34e77b = true;
                        _0x45b1d3();
                    }, _0x123eec);
                    let Cookie = await this.got({
                        method: "post",
                        url: ruishuApi+"/get_cookies",
                        body: JSON.stringify({ response: "", url: "" })
                    })
                    let c = JSON.parse(Cookie['body'])
                    cookieString = Object.entries(c)
                        .map(([key, value]) => `${key}=${value}`)
                        .join('; ');
                    _0x29ad8a['headers'] = {}
                    _0x29ad8a['headers']['cookie'] = cookieString

                    await this.got(_0x29ad8a).then(_0x284c2a => {
                        _0x208a74 = _0x284c2a;
                    }, _0x55b6b8 => {
                        _0x1fa216 = _0x55b6b8;
                        _0x208a74 = _0x55b6b8.response;
                        _0x19ce7b = _0x1fa216?.["code"] || "";
                        _0x5c8c40 = _0x1fa216?.["name"] || "";
                    });
                    _0x45b1d3();
                });
                if (_0x34e77b) {
                    this.log("[" + _0x1684d3 + "]请求超时(" + _0x123eec / 1000 + "秒)，重试第" + _0x3a35d0 + "次");
                } else {
                    if (_0x54807f.includes(_0x19ce7b)) {
                        this.log("[" + _0x1684d3 + "]请求错误[" + _0x19ce7b + "][" + _0x5c8c40 + "]");
                        if (_0x1fa216?.["message"]) {
                            console.log(_0x1fa216.message);
                        }
                        break;
                    } else {
                        if (_0x497c09.includes(_0x5c8c40)) {
                            this.log("[" + _0x1684d3 + "]请求错误[" + _0x19ce7b + "][" + _0x5c8c40 + "]，重试第" + _0x3a35d0 + "次");
                        } else {
                            if (_0x58b4a1.includes(_0x19ce7b)) {
                                this.log("[" + _0x1684d3 + "]请求错误[" + _0x19ce7b + "][" + _0x5c8c40 + "]，重试第" + _0x3a35d0 + "次");
                            } else {
                                let _0x42b498 = _0x208a74?.["statusCode"] || "";
                                let _0x2ef704 = _0x42b498 / 100 | 0;
                                if (_0x42b498) {
                                    _0x2ef704 > 3 && !_0x25d788.includes(_0x42b498) && (_0x42b498 ? this.log("请求[" + _0x1684d3 + "]返回[" + _0x42b498 + "]") : this.log("请求[" + _0x1684d3 + "]错误[" + _0x19ce7b + "][" + _0x5c8c40 + "]"));
                                    if (_0x2ef704 <= 4) {
                                        break;
                                    }
                                } else {
                                    this.log("请求[" + _0x1684d3 + "]错误[" + _0x19ce7b + "][" + _0x5c8c40 + "]");
                                }
                            }
                        }
                    }
                }
            } catch (_0xa3ad4) {
                _0xa3ad4.name == "TimeoutError" ? this.log("[" + _0x1684d3 + "]请求超时，重试第" + _0x3a35d0 + "次") : this.log("[" + _0x1684d3 + "]请求错误(" + _0xa3ad4.message + ")，重试第" + _0x3a35d0 + "次");
            }
        }
        const _0x14f89a = {
            statusCode: _0x19ce7b || -1,
            headers: null,
            result: null
        };
        if (_0x208a74 == null) {
            return Promise.resolve(_0x14f89a);
        }
        let {
            statusCode: _0x4f50c8,
            headers: _0x4fdc35,
            body: _0x4bfa21
        } = _0x208a74;
        if (_0x4bfa21) {
            try {
                _0x4bfa21 = JSON.parse(_0x4bfa21);
            } catch { }
        }
        const _0x5d1199 = {
            statusCode: _0x4f50c8,
            headers: _0x4fdc35,
            result: _0x4bfa21
        };
        return Promise.resolve(_0x5d1199);
    }
}
let _0x280825 = _0x9d1851;
try {
    let _0x236d58 = require("./LocalBasic");
    _0x280825 = _0x236d58;
} catch { }
let _0x3b1630 = new _0x280825(_0x49dfef);
class _0x3f433d extends _0x280825 {
    constructor(_0x5669ce) {
        super(_0x49dfef);
        let _0x28f602 = _0x5669ce.split("#");
        this.name = _0x28f602[0];
        this.passwd = _0x28f602?.[1] || "";
        this.uuid = [_0x49dfef.randomPattern("xxxxxxxx"), _0x49dfef.randomPattern("xxxx"), _0x49dfef.randomPattern("4xxx"), _0x49dfef.randomPattern("xxxx"), _0x49dfef.randomPattern("xxxxxxxxxxxx")];
        this.cookieJar = new _0x4f58d7();
        this.can_feed = true;
        this.jml_tokenFlag = "";
        this.mall_token = "";
        const _0x1effd8 = {
            Connection: "keep-alive",
            "User-Agent": _0x3ed712
        };
        this.got = this.got.extend({
            cookieJar: this.cookieJar,
            headers: _0x1effd8
        });
    }
    load_token() {
        let _0x2f4a66 = false;
        _0x1d3d6d[this.name] && (this.userId = _0x1d3d6d[this.name].userId, this.token = _0x1d3d6d[this.name].token, this.log("读取到缓存token"), _0x2f4a66 = true);
        return _0x2f4a66;
    }
    encode_phone() {
        let _0xd2389f = this.name.split("");
        for (let _0x51660a in _0xd2389f) {
            _0xd2389f[_0x51660a] = String.fromCharCode(_0xd2389f[_0x51660a].charCodeAt(0) + 2);
        }
        return _0xd2389f.join("");
    }
    encode_aes(_0x53e9bb) {
        return _0x1519a6("AES", "ECB", "Pkcs7", _0x53e9bb, _0x75a069, 0);
    }
    get_mall_headers() {
        return {
            "Content-Type": "application/json;charset=utf-8",
            Accept: "application/json, text/javascript, */*; q=0.01",
            Authorization: this.mall_token ? "Bearer " + this.mall_token : "",
            "X-Requested-With": "XMLHttpRequest"
        };
    }
    async login(_0x2971d3 = {}) {
        let _0x22cd07 = false;
        try {
            let _0x3ae9d0 = _0x49dfef.time("yyyyMMddhhmmss");
            let _0x16bc9b = "iPhone 14 15.4." + this.uuid.slice(0, 2).join("") + this.name + _0x3ae9d0 + this.passwd + "0$$$0.";
            let _0x807c6e = {
                fn: "login",
                method: "post",
                url: "https://appgologin.189.cn:9031/login/client/userLoginNormal",
                json: {
                    headerInfos: {
                        code: "userLoginNormal",
                        timestamp: _0x3ae9d0,
                        broadAccount: "",
                        broadToken: "",
                        clientType: "#9.6.1#channel50#iPhone 14 Pro Max#",
                        shopId: "20002",
                        source: "110003",
                        sourcePassword: "Sid98s",
                        token: "",
                        userLoginName: this.name
                    },
                    content: {
                        attach: "test",
                        fieldData: {
                            loginType: "4",
                            accountType: "",
                            loginAuthCipherAsymmertric: _0x13a631.encrypt(_0x16bc9b, "base64"),
                            deviceUid: this.uuid.slice(0, 3).join(""),
                            phoneNum: this.encode_phone(),
                            isChinatelecom: "0",
                            systemVersion: "15.4.0",
                            authentication: this.passwd
                        }
                    }
                }
            };

            let {
                result: _0x3cbd6a,
                statusCode: _0x4338ff
            } = await this.request(_0x807c6e);
            let _0x107431 = _0x49dfef.get(_0x3cbd6a?.["responseData"], "resultCode", -1);
            if (_0x107431 == "0000") {
                let {
                    userId = "",
                    token = ""
                } = _0x3cbd6a?.["responseData"]?.["data"]?.["loginSuccessResult"] || {};
                this.userId = userId;
                this.token = token;
                this.log("使用服务密码登录成功");
                _0x1d3d6d[this.name] = {
                    token: token,
                    userId: userId,
                    t: Date.now()
                };
                _0x4e4355();
                _0x22cd07 = true;
            } else {
                let _0xf8ba30 = _0x3cbd6a?.["msg"] || _0x3cbd6a?.["responseData"]?.["resultDesc"] || _0x3cbd6a?.["headerInfos"]?.["reason"] || "";
                this.log("服务密码登录失败[" + _0x107431 + "]: " + _0xf8ba30);
            }
        } catch (_0x576f6c) {
            console.log(_0x576f6c);
        } finally {
            return _0x22cd07;
        }
    }
    async get_ticket(_0x3e5067 = {}) {
        let _0x252ee2 = "";
        try {
            let _0x21dd20 = "\n            <Request>\n                <HeaderInfos>\n                    <Code>getSingle</Code>\n                    <Timestamp>" + _0x49dfef.time("yyyyMMddhhmmss") + "</Timestamp>\n                    <BroadAccount></BroadAccount>\n                    <BroadToken></BroadToken>\n                    <ClientType>#9.6.1#channel50#iPhone 14 Pro Max#</ClientType>\n                    <ShopId>20002</ShopId>\n                    <Source>110003</Source>\n                    <SourcePassword>Sid98s</SourcePassword>\n                    <Token>" + this.token + "</Token>\n                    <UserLoginName>" + this.name + "</UserLoginName>\n                </HeaderInfos>\n                <Content>\n                    <Attach>test</Attach>\n                    <FieldData>\n                        <TargetId>" + _0x1519a6("TripleDES", "CBC", "Pkcs7", this.userId, _0x2304b1, _0x1110eb) + "</TargetId>\n                        <Url>4a6862274835b451</Url>\n                    </FieldData>\n                </Content>\n            </Request>";
            let _0x2990d1 = {
                fn: "get_ticket",
                method: "post",
                url: "https://appgologin.189.cn:9031/map/clientXML",
                body: _0x21dd20
            };
            let {
                result: _0x9f4220,
                statusCode: _0x1e891f
            } = await this.request(_0x2990d1);
            if (_0x9f4220) {
                let _0x18f397 = _0x9f4220.match(/\<Ticket\>(\w+)\<\/Ticket\>/);
                if (_0x18f397) {
                    let _0x2c4653 = _0x18f397[1];
                    _0x252ee2 = _0x436a1e("TripleDES", "CBC", "Pkcs7", _0x2c4653, _0x2304b1, _0x1110eb);
                    this.ticket = _0x252ee2;
                }
            }
            !_0x252ee2 && (!_0x3e5067.retry && (await this.login()) ? (_0x3e5067.retry = true, _0x252ee2 = await this.get_ticket(_0x3e5067)) : (this.log("没有获取到ticket[" + _0x1e891f + "]: "), _0x9f4220 && this.log(": " + JSON.stringify(_0x9f4220))));
        } catch (_0x1c9e54) {
            console.log(_0x1c9e54);
        } finally {
            return _0x252ee2;
        }
    }
    async get_sign(_0x9b96be = {}) {

        let _0x10c0cb = false;
        try {
            const _0x59fe75 = {
                ticket: this.ticket
            };
            let _0x269bf2 = {
                fn: "login",
                method: "get",
                url: "https://wapside.189.cn:9001/jt-sign/ssoHomLogin",

                searchParams: _0x59fe75
            };
            let {
                result: _0x36bbb6,
                statusCode: _0x3a8945
            } = await this.request(_0x269bf2);
            let _0xe3542d = _0x49dfef.get(_0x36bbb6, "resoultCode", _0x3a8945);
            _0xe3542d == 0 ? (_0x10c0cb = _0x36bbb6?.["sign"], this.sign = _0x10c0cb, this.got = this.got.extend({
                headers: {
                    sign: this.sign
                }
            })) : this.log("获取sign失败[" + _0xe3542d + "]: " + _0x36bbb6);

        } catch (_0x44161f) {
            console.log(_0x44161f);
        } finally {
            return _0x10c0cb;
        }
    }
    encrypt_para(_0x217db5) {
        let _0x1c768f = typeof _0x217db5 == "string" ? _0x217db5 : JSON.stringify(_0x217db5);
        return _0x47bb4b.encrypt(_0x1c768f, "hex");
    }
    async userCoinInfo(_0x3a27b0 = false, _0x2a9f2e = {}) {

        try {
            let _0x12feeb = {
                phone: this.name
            };
            let _0x55424b = {
                fn: "userCoinInfo",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/api/home/userCoinInfo",
                json: {
                    para: this.encrypt_para(_0x12feeb)
                }
            };
            let {
                result: _0x18ad00,
                statusCode: _0x3e695c
            } = await this.request(_0x55424b);
            let _0x474131 = _0x49dfef.get(_0x18ad00, "resoultCode", _0x3e695c);

            if (_0x474131 == 0) {
                this.coin = _0x18ad00?.["totalCoin"] || 0;
                if (_0x3a27b0) {
                    const _0x3a5985 = {
                        notify: true
                    };
                    this.log("金豆余额: " + this.coin, _0x3a5985);
                    if (_0x18ad00.amountEx) {
                        let _0x5b7bde = _0x49dfef.time("yyyy-MM-dd", _0x18ad00.expireDate);
                        const _0x359049 = {
                            notify: true
                        };
                        _0x49dfef.log("-- [" + _0x5b7bde + "]将过期" + _0x18ad00.amountEx + "金豆", _0x359049);
                    }
                }
            } else {
                let _0x4e7123 = _0x18ad00?.["msg"] || _0x18ad00?.["resoultMsg"] || _0x18ad00?.["error"] || "";
                this.log("查询账户金豆余额错误[" + _0x474131 + "]: " + _0x4e7123);
            }
        } catch (_0x4d1b75) {
            console.log(_0x4d1b75);
        }
    }
    async userStatusInfo(_0x10c627 = {}) {
        try {
            let _0x219924 = {
                phone: this.name
            };
            let _0x16b897 = {
                fn: "userStatusInfo",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/api/home/userStatusInfo",
                json: {
                    para: this.encrypt_para(_0x219924)
                }
            };
            {
                let {
                    result: _0x39cfe5,
                    statusCode: _0x5e556e
                } = await this.request(_0x49dfef.copy(_0x16b897));
                let _0x509ab0 = _0x49dfef.get(_0x39cfe5, "resoultCode", _0x5e556e);
                if (_0x509ab0 == 0) {
                    let {
                        isSign: _0x1d403c
                    } = _0x39cfe5?.["data"];
                    _0x1d403c ? this.log("今天已签到") : await this.doSign();
                } else {
                    let _0x11bda2 = _0x39cfe5?.["msg"] || _0x39cfe5?.["resoultMsg"] || _0x39cfe5?.["error"] || "";
                    this.log("查询账户签到状态错误[" + _0x509ab0 + "]: " + _0x11bda2);
                }
            }
            {
                let {
                    result: _0xf4c969,
                    statusCode: _0x34b777
                } = await this.request(_0x49dfef.copy(_0x16b897));
                let _0x4d9c85 = _0x49dfef.get(_0xf4c969, "resoultCode", _0x34b777);
                if (_0x4d9c85 == 0) {
                    let {
                        continuousDay: _0x33365d,
                        signDay: _0x128cf2,
                        isSeven: _0x3fa455
                    } = _0xf4c969?.["data"];
                    this.log("已签到" + _0x128cf2 + "天, 连签" + _0x33365d + "天");
                    _0x3fa455 && (await this.exchangePrize());
                } else {
                    let _0xc36b81 = _0xf4c969?.["msg"] || _0xf4c969?.["resoultMsg"] || _0xf4c969?.["error"] || "";
                    this.log("查询账户签到状态错误[" + _0x4d9c85 + "]: " + _0xc36b81);
                }
            }
        } catch (_0x103f04) {
            console.log(_0x103f04);
        }
    }
    async continueSignDays(_0x3e553e = {}) {
        try {
            let _0x124dfb = {
                phone: this.name
            };
            let _0x215fff = {
                fn: "continueSignDays",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/webSign/continueSignDays",
                json: {
                    para: this.encrypt_para(_0x124dfb)
                }
            };
            let {
                result: _0x6e6187,
                statusCode: _0x257d59
            } = await this.request(_0x215fff);
            let _0x912371 = _0x49dfef.get(_0x6e6187, "resoultCode", _0x257d59);
            if (_0x912371 == 0) {
                this.log("抽奖连签天数: " + (_0x6e6187?.["continueSignDays"] || 0) + "天");
                if (_0x6e6187?.["continueSignDays"] == 15) {
                    const _0x207b02 = {
                        type: "15"
                    };
                    await this.exchangePrize(_0x207b02);
                } else {
                    if (_0x6e6187?.["continueSignDays"] == 28) {
                        const _0x1f691c = {
                            type: "28"
                        };
                        await this.exchangePrize(_0x1f691c);
                    }
                }
            } else {
                let _0x311a52 = _0x6e6187?.["msg"] || _0x6e6187?.["resoultMsg"] || _0x6e6187?.["error"] || "";
                this.log("查询抽奖连签天数错误[" + _0x912371 + "]: " + _0x311a52);
            }
        } catch (_0xfe7972) {
            console.log(_0xfe7972);
        }
    }
    async continueSignRecords(_0x716c04 = {}) {
        try {
            let _0x353f90 = {
                phone: this.name
            };
            let _0x3db199 = {
                fn: "continueSignRecords",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/webSign/continueSignRecords",
                json: {
                    para: this.encrypt_para(_0x353f90)
                }
            };
            let {
                result: _0xcdce9f,
                statusCode: _0x167568
            } = await this.request(_0x3db199);
            let _0xd160b5 = _0x49dfef.get(_0xcdce9f, "resoultCode", _0x167568);
            if (_0xd160b5 == 0) {
                if (_0xcdce9f?.["continue15List"]?.["length"]) {
                    const _0x4ddf3a = {
                        type: "15"
                    };
                    await this.exchangePrize(_0x4ddf3a);
                }
                if (_0xcdce9f?.["continue28List"]?.["length"]) {
                    const _0x24d413 = {
                        type: "28"
                    };
                    await this.exchangePrize(_0x24d413);
                }
            } else {
                let _0xa1a8c7 = _0xcdce9f?.["msg"] || _0xcdce9f?.["resoultMsg"] || _0xcdce9f?.["error"] || "";
                this.log("查询连签抽奖状态错误[" + _0xd160b5 + "]: " + _0xa1a8c7);
            }
        } catch (_0x696f49) {
            console.log(_0x696f49);
        }
    }
    async doSign(_0x3d1e97 = {}) {
        try {
            let _0x2c6ae2 = {
                phone: this.name,
                date: Date.now(),
                sysType: "20002"
            };
            let _0x32b4a2 = {
                fn: "doSign",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/webSign/sign",
                json: {
                    encode: this.encode_aes(JSON.stringify(_0x2c6ae2))
                }
            };
            let {
                result: _0x4a380a,
                statusCode: _0x39f295
            } = await this.request(_0x32b4a2);
            let _0x66dfe4 = _0x49dfef.get(_0x4a380a, "resoultCode", _0x39f295);
            if (_0x66dfe4 == 0) {
                let _0x3199d0 = _0x49dfef.get(_0x4a380a?.["data"], "code", -1);
                if (_0x3199d0 == 1) {
                    const _0x241cc1 = {
                        notify: true
                    };
                    this.log("签到成功，获得" + (_0x4a380a?.["data"]?.["coin"] || 0) + "金豆", _0x241cc1);
                    await this.userStatusInfo();
                } else {
                    const _0x16b3bf = {
                        notify: true
                    };
                    this.log("签到失败[" + _0x3199d0 + "]: " + _0x4a380a.data.msg, _0x16b3bf);
                }
            } else {
                let _0x48eddc = _0x4a380a?.["msg"] || _0x4a380a?.["resoultMsg"] || _0x4a380a?.["error"] || "";
                this.log("签到错误[" + _0x66dfe4 + "]: " + _0x48eddc);
            }
        } catch (_0x3c07a4) {
            console.log(_0x3c07a4);
        }
    }
    async exchangePrize(_0x503199 = {}) {
        try {
            let _0x15d8af = _0x49dfef.pop(_0x503199, "type", "7");
            let _0x2a4555 = {
                phone: this.name,
                type: _0x15d8af
            };
            let _0x275dee = {
                fn: "exchangePrize",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/webSign/exchangePrize",
                json: {
                    para: this.encrypt_para(_0x2a4555)
                }
            };
            let {
                result: _0x122edb,
                statusCode: _0x7493f8
            } = await this.request(_0x275dee);
            let _0x32ecff = _0x49dfef.get(_0x122edb, "resoultCode", _0x7493f8);
            if (_0x32ecff == 0) {
                let _0xfbfebb = _0x49dfef.get(_0x122edb?.["prizeDetail"], "code", -1);
                if (_0xfbfebb == 0) {
                    const _0x51aac0 = {
                        notify: true
                    };
                    this.log("连签" + _0x15d8af + "天抽奖: " + _0x122edb?.["prizeDetail"]?.["biz"]?.["winTitle"], _0x51aac0);
                } else {
                    let _0x36ea79 = _0x122edb?.["prizeDetail"]?.["err"] || "";
                    const _0x513b8a = {
                        notify: true
                    };
                    this.log("连签" + _0x15d8af + "天抽奖失败[" + _0xfbfebb + "]: " + _0x36ea79, _0x513b8a);
                }
            } else {
                let _0x2f0e88 = _0x122edb?.["msg"] || _0x122edb?.["resoultMsg"] || _0x122edb?.["error"] || "";
                this.log("连签" + _0x15d8af + "天抽奖错误[" + _0x32ecff + "]: " + _0x2f0e88);
            }
        } catch (_0x57662f) {
            console.log(_0x57662f);
        }
    }
    async homepage(_0x5a7e8f, _0x26d9a1 = {}) {
        try {
            let _0x60744a = {
                phone: this.name,
                shopId: "20001",
                type: _0x5a7e8f
            };
            let _0x5a9f66 = {
                fn: "homepage",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/webSign/homepage",
                json: {
                    para: this.encrypt_para(_0x60744a)
                }
            };
            let {
                result: _0x3462ae,
                statusCode: _0x17c9d0
            } = await this.request(_0x5a9f66);
            let _0x59fe3c = _0x49dfef.get(_0x3462ae, "resoultCode", _0x17c9d0);
            if (_0x59fe3c == 0) {
                let _0x52a59b = _0x49dfef.get(_0x3462ae?.["data"]?.["head"], "code", -1);
                if (_0x52a59b == 0) {
                    for (let _0x3e6107 of _0x3462ae?.["data"]?.["biz"]?.["adItems"] || []) {
                        let _0x27e7ab = _0x3e6107.title;
                        if (["0", "1"].includes(_0x3e6107?.["taskState"])) {
                            switch (_0x3e6107.contentOne) {
                                case "3":
                                    {
                                        if (_0x3e6107?.["rewardId"]) {
                                            await this.receiveReward(_0x3e6107);
                                        }
                                        break;
                                    }
                                case "5":
                                    {
                                        await this.openMsg(_0x3e6107);
                                        break;
                                    }
                                case "6":
                                    {
                                        await this.sharingGetGold();
                                        break;
                                    }
                                case "10":
                                case "13":
                                    {
                                        if (!this.xtoken) {
                                            await this.get_usercode();
                                        }
                                        this.xtoken && (await this.watchLiveInit());
                                        break;
                                    }
                                case "18":
                                    {
                                        await this.polymerize(_0x3e6107);
                                        break;
                                    }
                                default:
                                    {
                                        break;
                                    }
                            }
                        }
                    }
                } else {
                    let _0xf9bca1 = _0x3462ae?.["data"]?.["head"]?.["err"] || "";
                    this.log("获取任务列表失败[" + _0x52a59b + "]: " + _0xf9bca1);
                }
            } else {
                this.log("获取任务列表错误[" + _0x59fe3c + "]");
            }
        } catch (_0x1713d1) {
            console.log(_0x1713d1);
        }
    }
    async receiveReward(_0x1f06a0, _0x27d046 = {}) {
        try {
            let _0x408e82 = _0x1f06a0?.["title"]?.["split"](" ")?.[0];
            let _0x12889d = {
                phone: this.name,
                rewardId: _0x1f06a0?.["rewardId"] || ""
            };
            let _0x4db2f8 = {
                fn: "receiveReward",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/paradise/receiveReward",
                json: {
                    para: this.encrypt_para(_0x12889d)
                }
            };
            let {
                result: _0x514940,
                statusCode: _0x5641f8
            } = await this.request(_0x4db2f8);
            let _0x1559d6 = _0x49dfef.get(_0x514940, "resoultCode", _0x5641f8);
            if (_0x1559d6 == 0) {
                this.log("领取任务[" + _0x408e82 + "]奖励成功: " + _0x514940?.["resoultMsg"]);
            } else {
                let _0xa69dbc = _0x514940?.["msg"] || _0x514940?.["resoultMsg"] || _0x514940?.["error"] || "";
                this.log("领取任务[" + _0x408e82 + "]奖励错误[" + _0x1559d6 + "]: " + _0xa69dbc);
            }
        } catch (_0x2a40e0) {
            console.log(_0x2a40e0);
        }
    }
    async openMsg(_0x51c539, _0x46c92d = {}) {
        try {
            let _0x4b897b = _0x51c539?.["title"]?.["split"](" ")?.[0];
            let _0x18e652 = {
                phone: this.name
            };
            let _0x1c217b = {
                fn: "openMsg",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/paradise/openMsg",
                json: {
                    para: this.encrypt_para(_0x18e652)
                }
            };
            let {
                result: _0xb6f7bf,
                statusCode: _0x41e108
            } = await this.request(_0x1c217b);
            let _0x1377ff = _0x49dfef.get(_0xb6f7bf, "resoultCode", _0x41e108);
            if (_0x1377ff == 0) {
                this.log("完成任务[" + _0x4b897b + "]成功: " + _0xb6f7bf?.["resoultMsg"]);
            } else {
                let _0x59d65d = _0xb6f7bf?.["msg"] || _0xb6f7bf?.["resoultMsg"] || _0xb6f7bf?.["error"] || "";
                this.log("完成任务[" + _0x4b897b + "]错误[" + _0x1377ff + "]: " + _0x59d65d);
            }
        } catch (_0x574cb0) {
            console.log(_0x574cb0);
        }
    }
    async polymerize(_0x2beade, _0x3610fd = {}) {
        try {
            let _0x27bccc = _0x2beade?.["title"]?.["split"](" ")?.[0];
            let _0x2caf2f = {
                phone: this.name,
                jobId: _0x2beade.taskId
            };
            let _0x493039 = {
                fn: "polymerize",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/webSign/polymerize",
                json: {
                    para: this.encrypt_para(_0x2caf2f)
                }
            };
            let {
                result: _0x2c3e91,
                statusCode: _0x3c5244
            } = await this.request(_0x493039);
            let _0x43d9c9 = _0x49dfef.get(_0x2c3e91, "resoultCode", _0x3c5244);
            if (_0x43d9c9 == 0) {
                this.log("完成任务[" + _0x27bccc + "]成功: " + _0x2c3e91?.["resoultMsg"]);
            } else {
                let _0x402f9a = _0x2c3e91?.["msg"] || _0x2c3e91?.["resoultMsg"] || _0x2c3e91?.["error"] || "";
                this.log("完成任务[" + _0x27bccc + "]错误[" + _0x43d9c9 + "]: " + _0x402f9a);
            }
        } catch (_0xc860ab) {
            console.log(_0xc860ab);
        }
    }
    async food(_0x7cbaa1, _0x4b0ab1 = {}) {
        try {
            let _0x5c6c6d = {
                phone: this.name
            };
            let _0x587fa4 = {
                fn: "food",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/paradise/food",
                json: {
                    para: this.encrypt_para(_0x5c6c6d)
                }
            };
            let {
                result: _0x156b8d,
                statusCode: _0x191b9d
            } = await this.request(_0x587fa4);
            let _0x117b58 = _0x49dfef.get(_0x156b8d, "resoultCode", _0x191b9d);
            if (_0x117b58 == 0) {
                this.log("第" + _0x7cbaa1 + "次喂食: " + (_0x156b8d?.["resoultMsg"] || "成功"));
                if (_0x156b8d?.["levelUp"]) {
                    let _0x265b8d = _0x156b8d?.["currLevelRightList"][0]?.["level"];
                    const _0x2eec5b = {
                        notify: true
                    };
                    this.log("宠物已升级到[LV." + _0x265b8d + "], 获得: " + _0x156b8d?.["currLevelRightList"][0]?.["righstName"], _0x2eec5b);
                }
            } else {
                let _0x14117b = _0x156b8d?.["msg"] || _0x156b8d?.["resoultMsg"] || _0x156b8d?.["error"] || "";
                this.log("第" + _0x7cbaa1 + "次喂食失败[" + _0x117b58 + "]: " + _0x14117b);
                _0x14117b?.["includes"]("最大喂食次数") && (this.can_feed = false);
            }
        } catch (_0x523284) {
            console.log(_0x523284);
        }
    }
    async getParadiseInfo(_0x4c16d3 = {}) {
        try {
            let _0x1c882e = {
                phone: this.name
            };
            let _0x2d8a6c = {
                fn: "getParadiseInfo",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/paradise/getParadiseInfo",
                json: {
                    para: this.encrypt_para(_0x1c882e)
                }
            };
            {
                let {
                    result: _0x13b7df,
                    statusCode: _0x1e6dfd
                } = await this.request(_0x2d8a6c);
                let _0x54514a = _0x49dfef.get(_0x13b7df, "resoultCode", _0x1e6dfd);
                if (_0x54514a == 0) {
                    let _0xdb66c = _0x13b7df?.["userInfo"]?.["levelInfoMap"];
                    this.level = _0xdb66c?.["level"];
                    for (let _0x33d3a3 = 1; _0x33d3a3 <= 10 && this.can_feed; _0x33d3a3++) {
                        await this.food(_0x33d3a3);
                    }
                } else {
                    let _0x4e4dd5 = _0x13b7df?.["msg"] || _0x13b7df?.["resoultMsg"] || _0x13b7df?.["error"] || "";
                    this.log("查询宠物等级失败[" + _0x54514a + "]: " + _0x4e4dd5);
                    return;
                }
            }
            {
                let {
                    result: _0x1334dd,
                    statusCode: _0x363378
                } = await this.request(_0x2d8a6c);
                let _0xf71230 = _0x49dfef.get(_0x1334dd, "resoultCode", _0x363378);
                if (_0xf71230 == 0) {
                    let _0x41df23 = _0x1334dd?.["userInfo"]?.["levelInfoMap"];
                    this.level = _0x41df23?.["level"];
                    const _0x268241 = {
                        notify: true
                    };
                    this.log("宠物等级[Lv." + _0x41df23?.["level"] + "], 升级进度: " + _0x41df23?.["growthValue"] + "/" + _0x41df23?.["fullGrowthCoinValue"], _0x268241);
                } else {
                    let _0x1036a5 = _0x1334dd?.["msg"] || _0x1334dd?.["resoultMsg"] || _0x1334dd?.["error"] || "";
                    this.log("查询宠物等级失败[" + _0xf71230 + "]: " + _0x1036a5);
                    return;
                }
            }
        } catch (_0x94c5b4) {
            console.log(_0x94c5b4);
        }
    }
    async getLevelRightsList(_0x3ea0a7 = {}) {
        try {
            let _0x1fd8f0 = {
                phone: this.name
            };
            let _0x5a0971 = {
                fn: "getLevelRightsList",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/paradise/getLevelRightsList",
                json: {
                    para: this.encrypt_para(_0x1fd8f0)
                }
            };
            let {
                result: _0x4cf13d,
                statusCode: _0x5e92a4
            } = await this.request(_0x5a0971);
            if (_0x4cf13d?.["currentLevel"]) {
                let _0x3b50bb = _0x4cf13d?.["currentLevel"] || 6;
                let _0x1f1006 = false;
                let _0x53ddf4 = "V" + _0x3b50bb;
                for (let _0x1ab325 of _0x4cf13d[_0x53ddf4] || []) {
                    let _0x59ef49 = _0x1ab325?.["righstName"] || "";
                    if (this.coin < _0x1ab325.costCoin) {
                        continue;
                    }
                    (_0x59ef49?.["match"](/\d+元话费/) || _0x59ef49?.["match"](/专享\d+金豆/)) && (await this.getConversionRights(_0x1ab325, _0x1f1006)) && (_0x1f1006 = true);
                }
            } else {
                let _0x4ff776 = _0x4cf13d?.["msg"] || _0x4cf13d?.["resoultMsg"] || _0x4cf13d?.["error"] || "";
                this.log("查询宠物兑换权益失败: " + _0x4ff776);
            }
        } catch (_0xcfd2ba) {
            console.log(_0xcfd2ba);
        }
    }
    async getConversionRights(_0xca19ef, _0x28066a, _0x21f772 = {}) {
        let _0x21db60 = false;
        try {
            let _0x5d6f72 = _0xca19ef?.["righstName"] || "";
            let _0x268d4d = {
                phone: this.name,
                rightsId: _0xca19ef.id,
                receiveCount: _0xca19ef.receiveType
            };
            let _0x5ed3b5 = {
                fn: "getConversionRights",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/paradise/getConversionRights",
                json: {
                    para: this.encrypt_para(_0x268d4d)
                }
            };
            let {
                result: _0x409ea1,
                statusCode: _0x3fb426
            } = await this.request(_0x5ed3b5);
            let _0x17b3d0 = _0x49dfef.get(_0x409ea1, "code", _0x49dfef.get(_0x409ea1, "resoultCode", _0x3fb426));
            if (_0x17b3d0 == 200) {
                if (!(_0x409ea1?.["rightsStatus"]?.["includes"]("已兑换") || _0x409ea1?.["rightsStatus"]?.["includes"]("已领取"))) {
                    _0x21db60 = true;
                    if (_0x28066a) {
                        await _0x49dfef.wait(3000);
                    }
                    await this.conversionRights(_0xca19ef);
                }
            } else {
                let _0x267dcb = _0x409ea1?.["msg"] || _0x409ea1?.["resoultMsg"] || _0x409ea1?.["error"] || "";
                this.log("查询权益[" + _0x5d6f72 + "]失败[" + _0x17b3d0 + "]: " + _0x267dcb);
            }
        } catch (_0x1c9805) {
            console.log(_0x1c9805);
        } finally {
            return _0x21db60;
        }
    }
    async conversionRights(_0x1258fb, _0x5ee37a = {}) {
        try {
            let _0x285002 = _0x1258fb?.["righstName"] || "";
            let _0x2e0b22 = {
                phone: this.name,
                rightsId: _0x1258fb.id
            };
            let _0x259df8 = {
                fn: "conversionRights",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/paradise/conversionRights",
                json: {
                    para: this.encrypt_para(_0x2e0b22)
                }
            };
            let {
                result: _0x24b720,
                statusCode: _0x2867ce
            } = await this.request(_0x259df8);
            let _0x1caee2 = _0x49dfef.get(_0x24b720, "resoultCode", _0x2867ce);
            if (_0x1caee2 == 0) {
                this.log("兑换权益[" + _0x285002 + "]成功");
            } else {
                let _0x58c8d6 = _0x24b720?.["msg"] || _0x24b720?.["resoultMsg"] || _0x24b720?.["error"] || "";
                this.log("兑换权益[" + _0x285002 + "]失败[" + _0x1caee2 + "]: " + _0x58c8d6);
            }
        } catch (_0x2f6eb8) {
            console.log(_0x2f6eb8);
        }
    }
    async get_usercode(_0x410326 = {}) {
        try {
            const _0x4ad8d0 = {
                fn: "get_usercode",
                method: "get",
                url: "https://xbk.189.cn/xbkapi/api/auth/jump",
                searchParams: {}
            };
            _0x4ad8d0.searchParams.userID = this.ticket;
            _0x4ad8d0.searchParams.version = "9.3.3";
            _0x4ad8d0.searchParams.type = "room";
            _0x4ad8d0.searchParams.l = "renwu";
            let _0x3ed428 = _0x4ad8d0;
            let {
                statusCode: _0x1897af,
                headers: _0xab67f2
            } = await this.request(_0x3ed428);
            let _0x40ae2f = _0xab67f2?.["location"]?.["match"](/usercode=(\w+)/);
            _0x40ae2f ? await this.codeToken(_0x40ae2f[1]) : this.log("获取code失败[" + _0x1897af + "]");
        } catch (_0x3b0319) {
            console.log(_0x3b0319);
        }
    }
    async codeToken(_0x5551c8, _0x4c3418 = {}) {
        try {
            const _0x3ed11c = {
                usercode: _0x5551c8
            };
            let _0x2259ef = {
                fn: "codeToken",
                method: "post",
                url: "https://xbk.189.cn/xbkapi/api/auth/userinfo/codeToken",
                json: _0x3ed11c
            };
            let {
                result: _0x1e1031,
                statusCode: _0x4829ec
            } = await this.request(_0x2259ef);
            let _0xb6579f = _0x49dfef.get(_0x1e1031, "code", -1);
            if (_0xb6579f == 0) {
                this.xtoken = _0x1e1031?.["data"]?.["token"];
                this.got = this.got.extend({
                    headers: {
                        Authorization: "Bearer " + _0x5b4189.encrypt(this.xtoken, "base64")
                    }
                });
            } else {
                let _0x2cb0f8 = _0x1e1031?.["msg"] || _0x1e1031?.["resoultMsg"] || _0x1e1031?.["error"] || _0x1e1031?.["msg"] || "";
                this.log("获取token失败[" + _0xb6579f + "]: " + _0x2cb0f8);
            }
        } catch (_0x324945) {
            console.log(_0x324945);
        }
    }
    async watchLiveInit(_0x410248 = {}) {
        try {
            let _0x28a798 = Math.floor(Math.random() * 1000) + 1000;
            const _0x1e7374 = {
                period: 1,
                liveId: _0x28a798
            };
            let _0x3e4085 = {
                fn: "watchLiveInit",
                method: "post",
                url: "https://xbk.189.cn/xbkapi/lteration/liveTask/index/watchLiveInit",
                json: _0x1e7374
            };
            let {
                result: _0x15080d,
                statusCode: _0x39b570
            } = await this.request(_0x3e4085);
            let _0x488aa2 = _0x49dfef.get(_0x15080d, "code", -1);
            if (_0x488aa2 == 0) {
                await _0x49dfef.wait(15000);
                await this.watchLive(_0x28a798, _0x15080d?.["data"]);
            } else {
                let _0x641985 = _0x15080d?.["msg"] || _0x15080d?.["resoultMsg"] || _0x15080d?.["error"] || _0x15080d?.["msg"] || "";
                this.log("开始观看直播[" + _0x28a798 + "]失败[" + _0x488aa2 + "]: " + _0x641985);
            }
        } catch (_0x58939a) {
            console.log(_0x58939a);
        }
    }
    async watchLive(_0x2df12e, _0x578beb, _0x1de0d1 = {}) {
        try {
            const _0xae75fa = {
                period: 1,
                liveId: _0x2df12e,
                key: _0x578beb
            };
            let _0x363af1 = {
                fn: "watchLive",
                method: "post",
                url: "https://xbk.189.cn/xbkapi/lteration/liveTask/index/watchLive",
                json: _0xae75fa
            };
            let {
                result: _0x5c4954,
                statusCode: _0x1ad01d
            } = await this.request(_0x363af1);
            let _0x4e4cbf = _0x49dfef.get(_0x5c4954, "code", -1);
            if (_0x4e4cbf == 0) {
                this.log("观看直播[" + _0x2df12e + "]成功");
                await this.watchLiveInit();
            } else {
                let _0x132d1d = _0x5c4954?.["msg"] || _0x5c4954?.["resoultMsg"] || _0x5c4954?.["error"] || _0x5c4954?.["msg"] || "";
                this.log("观看直播[" + _0x2df12e + "]失败[" + _0x4e4cbf + "]: " + _0x132d1d);
            }
        } catch (_0x32ce3f) {
            console.log(_0x32ce3f);
        }
    }
    async watchVideo(_0x37b577, _0x3a94a2 = {}) {
        try {
            const _0x15cc23 = {
                articleId: _0x37b577
            };
            let _0x54a72d = {
                fn: "watchVideo",
                method: "post",
                url: "https://xbk.189.cn/xbkapi/lteration/liveTask/index/watchVideo",
                json: _0x15cc23
            };
            let {
                result: _0x3d06a2,
                statusCode: _0xa801d9
            } = await this.request(_0x54a72d);
            let _0x33f743 = _0x49dfef.get(_0x3d06a2, "code", -1);
            if (_0x33f743 == 0) {
                this.log("观看短视频[" + _0x37b577 + "]成功");
            } else {
                let _0x597186 = _0x3d06a2?.["msg"] || _0x3d06a2?.["resoultMsg"] || _0x3d06a2?.["error"] || _0x3d06a2?.["msg"] || "";
                this.log("观看短视频[" + _0x37b577 + "]失败[" + _0x33f743 + "]: " + _0x597186);
            }
        } catch (_0x42a411) {
            console.log(_0x42a411);
        }
    }
    async like(_0x3605f0, _0x42d468 = {}) {
        try {
            const _0x551814 = {
                account: this.name,
                liveId: _0x3605f0
            };
            let _0x3f3d2b = {
                fn: "like",
                method: "post",
                url: "https://xbk.189.cn/xbkapi/lteration/room/like",
                json: _0x551814
            };
            let {
                result: _0x15cd63,
                statusCode: _0x550c11
            } = await this.request(_0x3f3d2b);
            let _0x3cb60d = _0x49dfef.get(_0x15cd63, "code", -1);
            if (_0x3cb60d == 0) {
                this.log("点赞直播间[" + _0x3605f0 + "]成功");
            } else {
                let _0x12573c = _0x15cd63?.["msg"] || _0x15cd63?.["resoultMsg"] || _0x15cd63?.["error"] || _0x15cd63?.["msg"] || "";
                this.log("点赞直播间[" + _0x3605f0 + "]失败[" + _0x3cb60d + "]: " + _0x12573c);
            }
        } catch (_0x33a0d8) {
            console.log(_0x33a0d8);
        }
    }
    async sharingGetGold(_0x5cc2cd = {}) {
        try {
            let _0x5957b6 = {
                fn: "sharingGetGold",
                method: "post",
                url: "https://appfuwu.189.cn:9021/query/sharingGetGold",
                json: {
                    headerInfos: {
                        code: "sharingGetGold",
                        timestamp: _0x49dfef.time("yyyyMMddhhmmss"),
                        broadAccount: "",
                        broadToken: "",
                        clientType: "#9.6.1#channel50#iPhone 14 Pro Max#",
                        shopId: "20002",
                        source: "110003",
                        sourcePassword: "Sid98s",
                        token: this.token,
                        userLoginName: this.name
                    },
                    content: {
                        attach: "test",
                        fieldData: {
                            shareSource: "3",
                            userId: this.userId,
                            account: this.encode_phone()
                        }
                    }
                }
            };
            let {
                result: _0x36023a,
                statusCode: _0x5ade7c
            } = await this.request(_0x5957b6);
            let _0x3bb612 = _0x49dfef.get(_0x36023a?.["responseData"], "resultCode", -1);
            if (_0x3bb612 == "0000") {
                this.log("分享成功");
            } else {
                let _0x1fc39a = _0x36023a?.["msg"] || _0x36023a?.["responseData"]?.["resultDesc"] || _0x36023a?.["error"] || _0x36023a?.["msg"] || "";
                this.log("分享失败[" + _0x3bb612 + "]: " + _0x1fc39a);
            }
        } catch (_0x221821) {
            console.log(_0x221821);
        }
    }
    async month_jml_preCost(_0x3e12ef = {}) {
        try {
            let _0x54e4a2 = {
                fn: "month_jml_preCost",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/short/message/preCost",
                json: {
                    phone: this.encode_aes(this.name),
                    activityCode: "shortMesssge"
                }
            };
            let {
                result: _0x19ae9b,
                statusCode: _0x219a77
            } = await this.request(_0x54e4a2);
            let _0xb89634 = _0x49dfef.get(_0x19ae9b, "resoultCode", _0x219a77);
            if (_0xb89634 == 0) {
                let _0x1709f5 = _0x19ae9b?.["data"]?.["resoultMsg"] || "领取成功";
                this.jml_tokenFlag = _0x19ae9b?.["resoultMsg"];
                await this.month_jml_userCost(_0x1709f5);
                await this.month_jml_receive();
                await this.month_jml_getCount();
                await this.month_jml_refresh();
            } else {
                let _0x2dde86 = _0x19ae9b?.["msg"] || _0x19ae9b?.["resoultMsg"] || _0x19ae9b?.["error"] || "";
                this.log("每月见面礼登录失败[" + _0xb89634 + "]: " + _0x2dde86);
            }
        } catch (_0xf5ea71) {
            console.log(_0xf5ea71);
        }
    }
    async month_jml_userCost(_0x5b6d73, _0x434031 = {}) {
        try {
            let _0x223f5d = {
                fn: "month_jml_userCost",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/short/message/userCost",
                json: {
                    phone: this.encode_aes(this.name),
                    activityCode: "shortMesssge",
                    flag: this.jml_tokenFlag
                }
            };
            let {
                result: _0x2add96,
                statusCode: _0x4c7beb
            } = await this.request(_0x223f5d);
            let _0x55ebaa = _0x49dfef.get(_0x2add96, "resoultCode", _0x4c7beb);
            if (_0x55ebaa == 0) {
                let _0x39f674 = _0x2add96?.["data"]?.["map"](_0x475613 => "[" + _0x475613.pizeName + "]") || [];
                this.log("见面礼" + _0x5b6d73 + ": " + _0x39f674.join(", "));
            } else {
                let _0x1c5716 = _0x2add96?.["msg"] || _0x2add96?.["resoultMsg"] || _0x2add96?.["error"] || "";
                this.log("领取每月见面礼失败[" + _0x55ebaa + "]: " + _0x1c5716);
            }
        } catch (_0x3eb9f8) {
            console.log(_0x3eb9f8);
        }
    }
    async month_jml_receive(_0x5aaffc = {}) {
        try {
            let _0x3d08a6 = {
                phone: this.name,
                flag: this.jml_tokenFlag
            };
            let _0x4fe3a1 = {
                fn: "month_jml_receive",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/lottery/receive",
                json: {
                    para: this.encrypt_para(_0x3d08a6)
                }
            };
            let {
                result: _0x16a4a1,
                statusCode: _0x389615
            } = await this.request(_0x4fe3a1);
            let _0x4924bc = _0x49dfef.get(_0x16a4a1, "code", -1);
            if (_0x4924bc == 0) {
                this.log("领取APP抽奖次数成功");
            } else {
                let _0x5ef8a4 = _0x16a4a1?.["msg"] || _0x16a4a1?.["resoultMsg"] || _0x16a4a1?.["error"] || "";
                this.log("领取APP抽奖次数失败[" + _0x4924bc + "]: " + _0x5ef8a4);
            }
        } catch (_0x209a71) {
            console.log(_0x209a71);
        }
    }
    async month_jml_getCount(_0x1eebce = {}) {
        try {
            let _0x431dad = {
                phone: this.name,
                flag: this.jml_tokenFlag
            };
            let _0x1d2de9 = {
                fn: "month_jml_getCount",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/lottery/getCount",
                json: {
                    para: this.encrypt_para(_0x431dad)
                }
            };
            let {
                result: _0xf1b29a,
                statusCode: _0x4204df
            } = await this.request(_0x1d2de9);
            let _0x4704a8 = _0x49dfef.get(_0xf1b29a, "code", -1);
            if (_0x4704a8 == 0) {
                let _0x141535 = _0xf1b29a?.["video"]?.["map"](_0x33886d => _0x33886d.videoType) || [];
                let _0x2fb772 = _0x131d2d.filter(_0x5bb71b => !_0x141535.includes(_0x5bb71b));
                let _0x22a4b1 = false;
                for (let _0x38b1de of _0x2fb772) {
                    if (_0x22a4b1) {
                        let _0x296e0d = Math.floor(Math.random() * 5000) + 3000;
                        await _0x49dfef.wait(_0x296e0d);
                    }
                    await this.month_jml_addVideoCount(_0x38b1de);
                    _0x22a4b1 = true;
                }
            } else {
                let _0x330a5e = _0xf1b29a?.["msg"] || _0xf1b29a?.["resoultMsg"] || _0xf1b29a?.["error"] || "";
                this.log("查询看视频得抽奖机会次数失败[" + _0x4704a8 + "]: " + _0x330a5e);
            }
        } catch (_0x1c46ec) {
            console.log(_0x1c46ec);
        }
    }
    async month_jml_addVideoCount(_0x10070c, _0x588069 = {}) {
        try {
            let _0x13e584 = {
                phone: this.name,
                videoType: _0x10070c,
                flag: this.jml_tokenFlag
            };
            let _0x2b00ee = {
                fn: "month_jml_addVideoCount",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/lottery/addVideoCount",
                json: {
                    para: this.encrypt_para(_0x13e584)
                }
            };
            let {
                result: _0x8dff4,
                statusCode: _0x6fd216
            } = await this.request(_0x2b00ee);
            let _0x3f6886 = _0x49dfef.get(_0x8dff4, "code", -1);
            if (_0x3f6886 == 0) {
                this.log("看视频[" + _0x10070c + "]得抽奖机会成功");
            } else {
                let _0x238dbf = _0x8dff4?.["msg"] || _0x8dff4?.["resoultMsg"] || _0x8dff4?.["error"] || "";
                this.log("看视频[" + _0x10070c + "]得抽奖机会失败[" + _0x3f6886 + "]: " + _0x238dbf);
            }
        } catch (_0x2d129d) {
            console.log(_0x2d129d);
        }
    }
    async month_jml_refresh(_0xcca85f = {}) {
        try {
            let _0x14cad3 = {
                phone: this.name,
                flag: this.jml_tokenFlag
            };
            let _0x5ab84e = {
                fn: "month_jml_refresh",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/lottery/refresh",
                json: {
                    para: this.encrypt_para(_0x14cad3)
                }
            };
            let {
                result: _0x764f77,
                statusCode: _0x2cc71c
            } = await this.request(_0x5ab84e);
            let _0x5ecd1e = _0x49dfef.get(_0x764f77, "code", -1);
            if (_0x5ecd1e == -1) {
                let _0x58362e = _0x764f77?.["rNumber"] || 0;
                this.log("可以抽奖" + _0x58362e + "次");
                let _0x31275f = false;
                while (_0x58362e-- > 0) {
                    if (_0x31275f) {
                        let _0x33dd5d = Math.floor(Math.random() * 5000) + 3000;
                        await _0x49dfef.wait(_0x33dd5d);
                    }
                    await this.month_jml_lotteryRevice();
                    _0x31275f = true;
                }
            } else {
                let _0x15024f = _0x764f77?.["msg"] || _0x764f77?.["resoultMsg"] || _0x764f77?.["error"] || "";
                this.log("查询抽奖次数失败[" + _0x5ecd1e + "]: " + _0x15024f);
            }
        } catch (_0x14d546) {
            console.log(_0x14d546);
        }
    }
    async month_jml_lotteryRevice(_0x5bf2d6 = {}) {
        try {
            let _0x489867 = {
                phone: this.name,
                flag: this.jml_tokenFlag
            };
            let _0x57d2e2 = {
                fn: "month_jml_lotteryRevice",
                method: "post",
                url: "https://wapside.189.cn:9001/jt-sign/lottery/lotteryRevice",
                json: {
                    para: this.encrypt_para(_0x489867)
                }
            };
            let {
                result: _0x361574,
                statusCode: _0x1225b9
            } = await this.request(_0x57d2e2);
            let _0x4ec03c = _0x49dfef.get(_0x361574, "code", -1);
            if (_0x4ec03c == 0) {
                let {
                    rname: _0x232c3b,
                    id: _0x23684c
                } = _0x361574;
                const _0x16b601 = {
                    notify: true
                };
                this.log("每月见面礼抽奖: " + _0x232c3b, _0x16b601);
            } else {
                let _0x97a723 = _0x361574?.["msg"] || _0x361574?.["resoultMsg"] || _0x361574?.["error"] || "";
                this.log("每月见面礼抽奖失败[" + _0x4ec03c + "]: " + _0x97a723);
            }
        } catch (_0x3b1aef) {
            console.log(_0x3b1aef);
        }
    }
    async rpc_request(_0x390ce7, _0x48b512 = "get", _0x46e01b = null) {
        let _0x2aec3e = _0x390ce7.toString();
        let _0x4b4d49 = this.get_mall_headers();
        let _0x10b963 = _0x46e01b ? JSON.stringify(_0x46e01b) : null;
        const _0x433f30 = new Error();
        const _0xafbbac = _0x433f30.stack;
        const _0x27601e = _0xafbbac.split("\n");
        const _0x17aebc = _0x27601e?.[2]?.["match"](/UserClass\.(\w+)/)?.[1] || "rpc";
        let _0x50ab7c = {
            fn: _0x17aebc,
            method: "post",
            url: _0x16d3ea,
            json: {
                key: _0x344953,
                method: _0x48b512,
                url: _0x390ce7.toString(),
                headers: this.get_mall_headers(),
                data: JSON.stringify(_0x46e01b)
            }
        };
        return await this.request(_0x50ab7c);
    }
    async auth_login(_0x16dd5f = {}) {
        let _0x4b632d = false;
        try {
            let _0x59ca25 = this.ticket;
            let _0xa64474 = new URL("https://wapact.189.cn:9001/unified/user/login");
            let _0x28641d = {
                ticket: _0x59ca25,
                backUrl: encodeURIComponent("https://wapact.189.cn:9001/JinDouMall/JinDouMall_luckDraw.html?ticket=" + _0x59ca25),
                platformCode: "P201010301",
                loginType: 2
            };
            let {
                result: _0x16b3c5,
                statusCode: _0x3b6fb9
            } = await this.rpc_request(_0xa64474, "POST", _0x28641d);
            let _0x25f5c8 = _0x49dfef.get(_0x16b3c5, "code", _0x3b6fb9);
            if (_0x25f5c8 == 0) {
                let {
                    token: _0x202a28,
                    sessionId: _0x274600
                } = _0x16b3c5?.["biz"];
                this.mall_token = _0x202a28;
                _0x4b632d = true;
            } else {
                let _0x1c4e69 = _0x49dfef.get(_0x16b3c5, "message", "");
                this.log("商城登录失败[" + _0x25f5c8 + "]: " + _0x1c4e69);
            }
        } catch (_0x3b74e2) {
            console.log(_0x3b74e2);
        } finally {
            return _0x4b632d;
        }
    }
    async queryInfo(_0x3da8a0 = {}) {
        try {
            let _0xc5f478 = new URL("https://wapact.189.cn:9001/gateway/golden/api/queryInfo");
            _0xc5f478.searchParams.append("_", Date.now().toString());
            let {
                result: _0x3bab08,
                statusCode: _0x42dda4
            } = await this.rpc_request(_0xc5f478);
            let _0x69d0a7 = _0x49dfef.get(_0x3bab08, "code", _0x42dda4);
            if (_0x69d0a7 == 0) {
                this.coin = _0x3bab08?.["biz"]?.["amountTotal"] || this.coin;
                await this.queryTurnTable();
            } else {
                let _0x401a81 = _0x49dfef.get(_0x3bab08, "message", "");
                this.log("查询商城状态失败[" + _0x69d0a7 + "]: " + _0x401a81);
            }
        } catch (_0xd507ac) {
            console.log(_0xd507ac);
        }
    }
    async queryTurnTable(_0x12dce0 = {}) {
        try {
            let _0x5dccd4 = new URL("https://wapact.189.cn:9001/gateway/golden/api/queryTurnTable");
            _0x5dccd4.searchParams.append("userType", "1");
            _0x5dccd4.searchParams.append("_", Date.now().toString());
            let {
                result: _0x2ad2d5,
                statusCode: _0x5a8d92
            } = await this.rpc_request(_0x5dccd4);
            let _0x2b1c98 = _0x49dfef.get(_0x2ad2d5, "code", _0x5a8d92);
            if (_0x2b1c98 == 0) {
                let _0x2b2dfc = _0x2ad2d5?.["biz"]?.["xiaoHaoCount"] || 20;
                let _0x15becc = _0x2ad2d5?.["biz"]?.["wzTurntable"]?.["code"] || "";
                _0x15becc ? await this.lottery_check(_0x15becc, _0x2b2dfc) : this.log("没有获取到转盘抽奖ID");
            } else {
                let _0x96a1c8 = _0x49dfef.get(_0x2ad2d5, "message", "");
                this.log("获取转盘抽奖活动失败[" + _0x2b1c98 + "]: " + _0x96a1c8);
            }
        } catch (_0x3408eb) {
            console.log(_0x3408eb);
        }
    }
    async lottery_check(_0x217d19, _0x372f7b, _0x4f6c97 = {}) {
        try {
            let _0xa49a58 = new URL("https://wapact.189.cn:9001/gateway/stand/detail/check");
            _0xa49a58.searchParams.append("activityId", _0x217d19);
            _0xa49a58.searchParams.append("_", Date.now().toString());
            let {
                result: _0x2d69c8,
                statusCode: _0x242328
            } = await this.rpc_request(_0xa49a58);
            let _0x2cccad = _0x49dfef.get(_0x2d69c8, "code", _0x242328);
            if (_0x2cccad == 0) {
                let _0x157881 = _0x2d69c8?.["biz"]?.["resultInfo"]?.["chanceCount"] || 0;
                this.log("转盘可以抽奖" + _0x157881 + "次, 消耗金豆" + _0x372f7b + "/" + this.coin);
                let _0x30a5ac = false;
                while (_0x157881-- > 0 && this.coin >= _0x372f7b) {
                    if (_0x30a5ac) {
                        await _0x49dfef.wait(3000);
                    }
                    _0x30a5ac = true;
                    await this.lottery_do(_0x217d19, _0x372f7b);
                }
            } else {
                let _0x3cd934 = _0x49dfef.get(_0x2d69c8, "message", "");
                this.log("查询转盘抽奖次数失败[" + _0x2cccad + "]: " + _0x3cd934);
            }
        } catch (_0x957f54) {
            console.log(_0x957f54);
        }
    }
    async lottery_do(_0x5149a7, _0xc5a8fd = {}) {
        try {
            let _0x1794f8 = new URL("https://wapact.189.cn:9001/gateway/golden/api/lottery");
            let _0xe8218a = {
                activityId: _0x5149a7
            };
            let {
                result: _0x50d02f,
                statusCode: _0x69dd47
            } = await this.rpc_request(_0x1794f8, "POST", _0xe8218a);
            let _0x301247 = _0x49dfef.get(_0x50d02f, "code", _0x69dd47);
            if (_0x301247 == 0) {
                this.coin = _0x50d02f?.["biz"]?.["amountTotal"] || this.coin - xiaoHaoCount;
                let _0x3d75c1 = _0x50d02f?.["biz"]?.["resultCode"];
                let _0x2f6e42 = "";
                switch (_0x3d75c1) {
                    case "0":
                        {
                            let _0x420d18 = _0x50d02f?.["biz"]?.["resultInfo"]?.["winTitle"] || "空气";
                            const _0x580cdf = {
                                notify: true
                            };
                            this.log("转盘抽奖: " + _0x420d18, _0x580cdf);
                            return;
                        }
                    case "412":
                        {
                            _0x2f6e42 = "抽奖次数已达上限";
                            break;
                        }
                    case "413":
                    case "420":
                        {
                            _0x2f6e42 = "金豆不足";
                            break;
                        }
                    default:
                        {
                            this.log(": " + JSON.stringify(_0x50d02f));
                            _0x2f6e42 = "未知原因";
                            break;
                        }
                }
                this.log("转盘抽奖失败[" + _0x3d75c1 + "]: " + _0x2f6e42);
            } else {
                let _0x1e463b = _0x49dfef.get(_0x50d02f, "message", "");
                this.log("转盘抽奖错误[" + _0x301247 + "]: " + _0x1e463b);
            }
        } catch (_0x3f560e) {
            console.log(_0x3f560e);
        }
    }
    async userTask() {

        const _0x4d55e5 = {
            notify: true
        };
        _0x49dfef.log("\n======= 账号[" + this.index + "][" + this.name + "] =======", _0x4d55e5);
        if (!this.load_token() && !(await this.login())) {
            return;
        }
        if (!(await this.get_ticket())) {
            return;
        }
        if (!(await this.get_sign())) {
            return;
        }

        await this.userCoinInfo();

        await this.getLevelRightsList();
        await this.month_jml_preCost();
        await this.userStatusInfo();
        await this.continueSignRecords();
        await this.homepage("hg_qd_zrwzjd");
        await this.getParadiseInfo();
        if (_0x16d3ea) {
            await this.userLotteryTask();
        }
        await this.userCoinInfo(true);
    }
    async userLotteryTask() {
        if (!(await this.auth_login())) {
            return;
        }
        await this.queryInfo();
    }
}
!(async () => {

    _0x49dfef.read_env(_0x3f433d);
    _0xa0ff1b();
    for (let _0x28b102 of _0x49dfef.userList) {
        await _0x28b102.userTask();
    }
})().catch(_0x3fccb3 => _0x49dfef.log(_0x3fccb3)).finally(() => _0x49dfef.exitNow());

function _0x5370a4(_0x24412c) {
    return new class {
        constructor(_0x198bc4) {
            this.name = _0x198bc4;
            this.startTime = Date.now();
            const _0x555858 = {
                time: true
            };
            this.log("[" + this.name + "]开始运行\n", _0x555858);
            this.notifyStr = [];
            this.notifyFlag = true;
            this.userIdx = 0;
            this.userList = [];
            this.userCount = 0;
            this.default_timestamp_len = 13;
            this.default_wait_interval = 1000;
            this.default_wait_limit = 3600000;
            this.default_wait_ahead = 0;
        }
        log(_0x25f67c, _0x45847d = {}) {
            let _0x192e11 = {
                console: true
            };
            Object.assign(_0x192e11, _0x45847d);
            if (_0x192e11.time) {
                let _0x58f096 = _0x192e11.fmt || "hh:mm:ss";
                _0x25f67c = "[" + this.time(_0x58f096) + "]" + _0x25f67c;
            }
            if (_0x192e11.notify) {
                this.notifyStr.push(_0x25f67c);
            }
            if (_0x192e11.console) {
                console.log(_0x25f67c);
            }
        }
        get(_0x2ecf4d, _0x5800fb, _0x1ff76e = "") {
            let _0x5a663b = _0x1ff76e;
            _0x2ecf4d?.["hasOwnProperty"](_0x5800fb) && (_0x5a663b = _0x2ecf4d[_0x5800fb]);
            return _0x5a663b;
        }
        pop(_0x2ae8ec, _0xbb54f6, _0x9c8563 = "") {
            let _0x213044 = _0x9c8563;
            _0x2ae8ec?.["hasOwnProperty"](_0xbb54f6) && (_0x213044 = _0x2ae8ec[_0xbb54f6], delete _0x2ae8ec[_0xbb54f6]);
            return _0x213044;
        }
        copy(_0x1fbe5b) {
            return Object.assign({}, _0x1fbe5b);
        }
        read_env(_0x412e83) {
            let _0x1267c5 = _0x4aec53.map(_0x166c56 => process.env[_0x166c56]);
            for (let _0x2b0da2 of _0x1267c5.filter(_0x22b120 => !!_0x22b120)) {
                for (let _0x4465a3 of _0x2b0da2.split(_0x1876a7).filter(_0x3c7dca => !!_0x3c7dca)) {
                    if (this.userList.includes(_0x4465a3)) {
                        continue;
                    }
                    this.userList.push(new _0x412e83(_0x4465a3));
                }
            }
            this.userCount = this.userList.length;
            if (!this.userCount) {
                const _0x3d5d5 = {
                    notify: true
                };
                this.log("未找到变量，请检查变量" + _0x4aec53.map(_0x56423f => "[" + _0x56423f + "]").join("或"), _0x3d5d5);
                return false;
            }
            this.log("共找到" + this.userCount + "个账号");
            return true;
        }
        time(_0x43e381, _0x1822e0 = null) {
            let _0x1de2f7 = _0x1822e0 ? new Date(_0x1822e0) : new Date();
            let _0x180e96 = {
                "M+": _0x1de2f7.getMonth() + 1,
                "d+": _0x1de2f7.getDate(),
                "h+": _0x1de2f7.getHours(),
                "m+": _0x1de2f7.getMinutes(),
                "s+": _0x1de2f7.getSeconds(),
                "q+": Math.floor((_0x1de2f7.getMonth() + 3) / 3),
                S: this.padStr(_0x1de2f7.getMilliseconds(), 3)
            };
            /(y+)/.test(_0x43e381) && (_0x43e381 = _0x43e381.replace(RegExp.$1, (_0x1de2f7.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let _0x2cfbd9 in _0x180e96) new RegExp("(" + _0x2cfbd9 + ")").test(_0x43e381) && (_0x43e381 = _0x43e381.replace(RegExp.$1, 1 == RegExp.$1.length ? _0x180e96[_0x2cfbd9] : ("00" + _0x180e96[_0x2cfbd9]).substr(("" + _0x180e96[_0x2cfbd9]).length)));
            return _0x43e381;
        }
        async showmsg() {
            if (!this.notifyFlag) {
                return;
            }
            if (!this.notifyStr.length) {
                return;
            }
            var _0x2264e = require("./sendNotify");
            this.log("\n============== 推送 ==============");
            await _0x2264e.sendNotify(this.name, this.notifyStr.join("\n"));
        }
        padStr(_0x397014, _0x4fcca2, _0x1abd3c = {}) {
            let _0x10354b = _0x1abd3c.padding || "0";
            let _0x39ed4e = _0x1abd3c.mode || "l";
            let _0x3b33af = String(_0x397014);
            let _0x26e87b = _0x4fcca2 > _0x3b33af.length ? _0x4fcca2 - _0x3b33af.length : 0;
            let _0x3bb60f = "";
            for (let _0x30ac41 = 0; _0x30ac41 < _0x26e87b; _0x30ac41++) {
                _0x3bb60f += _0x10354b;
            }
            _0x39ed4e == "r" ? _0x3b33af = _0x3b33af + _0x3bb60f : _0x3b33af = _0x3bb60f + _0x3b33af;
            return _0x3b33af;
        }
        json2str(_0x123637, _0x402c90, _0x46e6c5 = false) {
            let _0x75d972 = [];
            for (let _0x2a0f42 of Object.keys(_0x123637).sort()) {
                let _0x2bc1ca = _0x123637[_0x2a0f42];
                if (_0x2bc1ca && _0x46e6c5) {
                    _0x2bc1ca = encodeURIComponent(_0x2bc1ca);
                }
                _0x75d972.push(_0x2a0f42 + "=" + _0x2bc1ca);
            }
            return _0x75d972.join(_0x402c90);
        }
        str2json(_0x32e5fc, _0x43a064 = false) {
            let _0x4cd4ad = {};
            for (let _0x520529 of _0x32e5fc.split("&")) {
                if (!_0x520529) {
                    continue;
                }
                let _0x1dc4e6 = _0x520529.indexOf("=");
                if (_0x1dc4e6 == -1) {
                    continue;
                }
                let _0x4998d0 = _0x520529.substr(0, _0x1dc4e6);
                let _0x3ac012 = _0x520529.substr(_0x1dc4e6 + 1);
                if (_0x43a064) {
                    _0x3ac012 = decodeURIComponent(_0x3ac012);
                }
                _0x4cd4ad[_0x4998d0] = _0x3ac012;
            }
            return _0x4cd4ad;
        }
        randomPattern(_0x369f7e, _0x4006d8 = "abcdef0123456789") {
            let _0x3140cf = "";
            for (let _0x8e9314 of _0x369f7e) {
                if (_0x8e9314 == "x") {
                    _0x3140cf += _0x4006d8.charAt(Math.floor(Math.random() * _0x4006d8.length));
                } else {
                    _0x8e9314 == "X" ? _0x3140cf += _0x4006d8.charAt(Math.floor(Math.random() * _0x4006d8.length)).toUpperCase() : _0x3140cf += _0x8e9314;
                }
            }
            return _0x3140cf;
        }
        randomUuid() {
            return this.randomPattern("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
        }
        randomString(_0x33254d, _0x5f4306 = "abcdef0123456789") {
            let _0x440af6 = "";
            for (let _0x475f61 = 0; _0x475f61 < _0x33254d; _0x475f61++) {
                _0x440af6 += _0x5f4306.charAt(Math.floor(Math.random() * _0x5f4306.length));
            }
            return _0x440af6;
        }
        randomList(_0x4242c3) {
            let _0x35c76e = Math.floor(Math.random() * _0x4242c3.length);
            return _0x4242c3[_0x35c76e];
        }
        wait(_0x1dc9b5) {
            return new Promise(_0x54d822 => setTimeout(_0x54d822, _0x1dc9b5));
        }
        async exitNow() {
            await this.showmsg();
            let _0x4210ea = Date.now();
            let _0x52abd1 = (_0x4210ea - this.startTime) / 1000;
            this.log("");
            const _0x4bb8d6 = {
                time: true
            };
            this.log("[" + this.name + "]运行结束，共运行了" + _0x52abd1 + "秒", _0x4bb8d6);
            process.exit(0);
        }
        normalize_time(_0x2e4fd9, _0x6f3e21 = {}) {
            let _0x2a3018 = _0x6f3e21.len || this.default_timestamp_len;
            _0x2e4fd9 = _0x2e4fd9.toString();
            let _0x54eeae = _0x2e4fd9.length;
            while (_0x54eeae < _0x2a3018) {
                _0x2e4fd9 += "0";
            }
            _0x54eeae > _0x2a3018 && (_0x2e4fd9 = _0x2e4fd9.slice(0, 13));
            return parseInt(_0x2e4fd9);
        }
        async wait_until(_0x3145a4, _0x3938d8 = {}) {
            let _0x155654 = _0x3938d8.logger || this;
            let _0x808a8f = _0x3938d8.interval || this.default_wait_interval;
            let _0x1929a1 = _0x3938d8.limit || this.default_wait_limit;
            let _0x4fa992 = _0x3938d8.ahead || this.default_wait_ahead;
            if (typeof _0x3145a4 == "string" && _0x3145a4.includes(":")) {
                if (_0x3145a4.includes("-")) {
                    _0x3145a4 = new Date(_0x3145a4).getTime();
                } else {
                    let _0xbcf425 = this.time("yyyy-MM-dd ");
                    _0x3145a4 = new Date(_0xbcf425 + _0x3145a4).getTime();
                }
            }
            let _0x44ad11 = this.normalize_time(_0x3145a4) - _0x4fa992;
            let _0x213d55 = this.time("hh:mm:ss.S", _0x44ad11);
            let _0x64f4d7 = Date.now();
            _0x64f4d7 > _0x44ad11 && (_0x44ad11 += 86400000);
            let _0x539462 = _0x44ad11 - _0x64f4d7;
            if (_0x539462 > _0x1929a1) {
                const _0x533822 = {
                    time: true
                };
                _0x155654.log("离目标时间[" + _0x213d55 + "]大于" + _0x1929a1 / 1000 + "秒,不等待", _0x533822);
            } else {
                const _0x436e20 = {
                    time: true
                };
                _0x155654.log("离目标时间[" + _0x213d55 + "]还有" + _0x539462 / 1000 + "秒,开始等待", _0x436e20);
                while (_0x539462 > 0) {
                    let _0x5a2288 = Math.min(_0x539462, _0x808a8f);
                    await this.wait(_0x5a2288);
                    _0x64f4d7 = Date.now();
                    _0x539462 = _0x44ad11 - _0x64f4d7;
                }
                const _0x179ceb = {
                    time: true
                };
                _0x155654.log("已完成等待", _0x179ceb);
            }
        }
        async wait_gap_interval(_0x5caf3a, _0x373b08) {
            let _0x5561b7 = Date.now() - _0x5caf3a;
            _0x5561b7 < _0x373b08 && (await this.wait(_0x373b08 - _0x5561b7));
        }
    }(_0x24412c);
}
