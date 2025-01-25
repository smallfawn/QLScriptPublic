
/*
朴朴超市 v1.01每天跑一两次即可

使用扫码或自己想办法捉refreshToken
扫码获取token: (先微信进入朴朴超市小程序并登录注册过账号再扫码)
https://service.leafxxx.win/pupu/login.html
把获取的refreshToken和备注(非必须)填到文件pupuCookie.txt里(第一次运行会自动创建), 多账号换行或&或@隔开
export pupuCookie="refreshToken#备注"

cron: 26 8,19 * * *
const $ = new Env("朴朴超市");
*/

//Sat Jan 25 2025 08:19:48 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action

const _0x37cb99 = _0x128935("朴朴超市"),
    _0x2561d9 = require("fs"),
    _0x493a69 = require("got"),
    _0x5e14f3 = "pupu",
    _0x464627 = _0x5e14f3 + "Cookie.txt",
    _0x10d311 = 20000,
    _0x229b73 = 3,
    _0x452dab = 1.01,
    _0x13e27e = "pupu",
    _0x198ea4 = "https://leafxcy.coding.net/api/user/leafxcy/project/validcode/shared-depot/validCode/git/blob/master/code.json",
    _0x4b9874 = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.46(0x18002e2c) NetType/WIFI Language/zh_CN miniProgram/wx122ef876a7132eb4",
    _0x5b285d = 2000,
    _0x592e57 = 5;
class _0x5dc3bb {
    constructor() {
        this.index = _0x37cb99.userIdx++;
        this.name = "";
        this.valid = false;
        const _0x342f7b = {
            "limit": 0
        },
            _0x260c9f = {
                "Connection": "keep-alive"
            },
            _0x183859 = {
                "retry": _0x342f7b,
                "timeout": _0x10d311,
                "followRedirect": false,
                "headers": _0x260c9f
            };
        this.got = _0x493a69.extend(_0x183859);
    }
    ["get_prefix"](_0x466d81 = {}) {
        var _0x25bcfe = "",
            _0x58253a = _0x37cb99.userCount.toString().length;
        if (this.index) {
            _0x25bcfe += "账号[" + _0x37cb99.padStr(this.index, _0x58253a) + "]";
        }
        this.name && (_0x25bcfe += "[" + this.name + "]");
        return _0x25bcfe;
    }
    ["log"](_0x2823be, _0x505d2b = {}) {
        let _0x58575f = this.get_prefix();
        _0x37cb99.log(_0x58575f + _0x2823be, _0x505d2b);
    }
    async ["request"](_0x255811) {
        const _0x294299 = ["RequestError"],
            _0x3a5f49 = ["TimeoutError"];
        let _0x32629d = _0x37cb99.copy(_0x255811),
            _0x5c5716 = {};
        try {
            let _0x18c492 = null,
                _0x79cf4 = 0,
                _0xb07dc5 = _0x32629d.fn || _0x32629d.url,
                _0x2273dc = _0x32629d.valid_code || [200];
            if (_0x32629d.form) {
                for (let _0x44c099 in _0x32629d.form) {
                    typeof _0x32629d.form[_0x44c099] == "object" && (_0x32629d.form[_0x44c099] = JSON.stringify(_0x32629d.form[_0x44c099]));
                }
            }
            _0x32629d.method = _0x32629d?.["method"]?.["toUpperCase"]() || "GET";
            if (_0x32629d.searchParams) {
                for (let _0x1849ad in _0x32629d.searchParams) {
                    typeof _0x32629d.searchParams[_0x1849ad] == "object" && (_0x32629d.searchParams[_0x1849ad] = JSON.stringify(_0x32629d.searchParams[_0x1849ad]));
                }
            }
            let _0x57abb8 = _0x32629d.got_client || this.got;
            _0x32629d.debug_in && console.log(_0x32629d);
            while (_0x79cf4 < _0x229b73) {
                {
                    if (_0x79cf4 > 0) {
                        {
                            await _0x37cb99.wait(_0x5b285d * _0x79cf4);
                            let _0x206c9d = _0x37cb99.get(_0x32629d, "retryer", null);
                            if (_0x206c9d) {
                                {
                                    let _0xea2977 = _0x37cb99.get(_0x32629d, "retryer_opt", {});
                                    await _0x206c9d(_0x32629d, _0xea2977);
                                }
                            }
                        }
                    }
                    _0x79cf4++;
                    let _0x4099ee = null;
                    try {
                        {
                            let _0x53cb34 = Number(_0x32629d?.["timeout"]?.["request"] || _0x32629d?.["timeout"] || _0x10d311),
                                _0xc7e067 = false,
                                _0x4c54be = Date.now(),
                                _0x2cebd4 = _0x57abb8(_0x32629d),
                                _0x47999c = setTimeout(() => {
                                    _0xc7e067 = true;
                                    _0x2cebd4.cancel();
                                }, _0x53cb34);
                            await _0x2cebd4.then(_0x35805b => {
                                _0x18c492 = _0x35805b;
                            }, _0x588975 => {
                                _0x4099ee = _0x588975;
                                _0x18c492 = _0x588975.response;
                            }).finally(() => clearTimeout(_0x47999c));
                            let _0x4208c7 = Date.now(),
                                _0x5964c4 = _0x4208c7 - _0x4c54be,
                                _0x367073 = _0x18c492?.["statusCode"] || null;
                            if (_0xc7e067 || _0x3a5f49.includes(_0x4099ee?.["name"])) {
                                let _0x51e18e = "";
                                _0x4099ee?.["code"] && (_0x51e18e += "(" + _0x4099ee.code, _0x4099ee?.["event"] && (_0x51e18e += ":" + _0x4099ee.event), _0x51e18e += ")");
                                this.log("[" + _0xb07dc5 + "]请求超时" + _0x51e18e + "(" + _0x5964c4 + "ms)，重试第" + _0x79cf4 + "次");
                            } else {
                                if (_0x294299.includes(_0x4099ee?.["name"])) this.log("[" + _0xb07dc5 + "]请求错误(" + _0x4099ee.code + ")(" + _0x5964c4 + "ms)，重试第" + _0x79cf4 + "次"); else {
                                    if (_0x367073) _0x4099ee && !_0x2273dc.includes(_0x367073) && this.log("请求[" + _0xb07dc5 + "]返回[" + _0x367073 + "]"); else {
                                        {
                                            let {
                                                code = "unknown",
                                                name = "unknown"
                                            } = _0x4099ee || {};
                                            this.log("请求[" + _0xb07dc5 + "]错误[" + code + "][" + name + "]");
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    } catch (_0x331f48) {
                        this.log("[" + _0xb07dc5 + "]请求错误(" + _0x331f48.message + ")，重试第" + _0x79cf4 + "次");
                    }
                }
            }
            if (_0x18c492 === null || _0x18c492 === undefined) {
                const _0x101fe9 = {
                    "statusCode": -1,
                    "headers": null,
                    "result": null
                };
                return _0x101fe9;
            }
            let {
                statusCode: _0x222546,
                headers: _0x1c90a6,
                body: _0x8a6fcb
            } = _0x18c492,
                _0x3dfa2d = _0x37cb99.get(_0x32629d, "decode_json", true);
            if (_0x8a6fcb && _0x3dfa2d) try {
                _0x8a6fcb = JSON.parse(_0x8a6fcb);
            } catch { }
            const _0x599d2a = {
                "statusCode": _0x222546,
                "headers": _0x1c90a6,
                "result": _0x8a6fcb
            };
            _0x5c5716 = _0x599d2a;
            _0x32629d.debug_out && console.log(_0x5c5716);
        } catch (_0x1f4ea0) {
            console.log(_0x1f4ea0);
        } finally {
            return _0x5c5716;
        }
    }
}
let _0x2f36fb = new _0x5dc3bb();
class _0x5f4758 extends _0x5dc3bb {
    constructor(_0xd62677) {
        super();
        let _0x437f12 = _0xd62677.split("#");
        this.refresh_token = _0x437f12[0];
        this.remark = _0x437f12?.[1] || "";
        this.team_code = "";
        this.team_need_help = false;
        this.team_can_help = true;
        this.team_max_help = 0;
        this.team_helped_count = 0;
        const _0x3b21d0 = {
            "User-Agent": _0x4b9874
        },
            _0x3cc29f = {
                "headers": _0x3b21d0
            };
        this.got = this.got.extend(_0x3cc29f);
    }
    async ["user_refresh_token"](_0x3f839b = {}) {
        let _0x57f045 = false;
        try {
            const _0xcfd606 = {
                "refresh_token": this.refresh_token
            },
                _0x129563 = {
                    "fn": "user_refresh_token",
                    "method": "put",
                    "url": "https://cauth.pupuapi.com/clientauth/user/refresh_token",
                    "json": _0xcfd606
                };
            let {
                result: _0x17b9bc,
                statusCode: _0x552fe2
            } = await this.request(_0x129563),
                _0xa4b7a2 = _0x37cb99.get(_0x17b9bc, "errcode", _0x552fe2);
            if (_0xa4b7a2 == 0) {
                this.valid = true;
                let {
                    access_token: _0x18168d,
                    refresh_token: _0x6e7d9c,
                    user_id: _0x5aa331,
                    nick_name: _0x1e294a
                } = _0x17b9bc?.["data"];
                this.access_token = _0x18168d;
                this.refresh_token = _0x6e7d9c;
                this.user_id = _0x5aa331;
                this.name = this.remark || _0x1e294a;
                this.got = this.got.extend({
                    "headers": {
                        "Authorization": "Bearer " + _0x18168d,
                        "pp-userid": _0x5aa331
                    }
                });
                _0x57f045 = true;
                await this.user_info();
                _0x163725();
            } else {
                {
                    let _0x1ee005 = _0x37cb99.get(_0x17b9bc, "errmsg", "");
                    this.log("刷新token失败[" + _0xa4b7a2 + "]: " + _0x1ee005);
                }
            }
        } catch (_0x16f7bf) {
            console.log(_0x16f7bf);
        } finally {
            return _0x57f045;
        }
    }
    async ["user_info"](_0x37e9d7 = {}) {
        try {
            {
                const _0x41f1e7 = {
                    "fn": "user_info",
                    "method": "get",
                    "url": "https://cauth.pupuapi.com/clientauth/user/info"
                };
                let {
                    result: _0x282576,
                    statusCode: _0x2322fa
                } = await this.request(_0x41f1e7),
                    _0x37b606 = _0x37cb99.get(_0x282576, "errcode", _0x2322fa);
                if (_0x37b606 == 0) {
                    {
                        let {
                            phone: _0x3a0b9d,
                            invite_code: _0x5d7d43
                        } = _0x282576?.["data"];
                        this.phone = _0x3a0b9d;
                        this.name = this.remark || _0x3a0b9d || this.name;
                        this.invite_code = _0x5d7d43;
                        this.log("登录成功");
                    }
                } else {
                    {
                        let _0x1de728 = _0x37cb99.get(_0x282576, "errmsg", "");
                        this.log("查询用户信息失败[" + _0x37b606 + "]: " + _0x1de728);
                    }
                }
            }
        } catch (_0x25386f) {
            console.log(_0x25386f);
        }
    }
    async ["near_location_by_city"](_0xd9db95 = {}) {
        try {
            let _0x590682 = {
                "fn": "near_location_by_city",
                "method": "get",
                "url": "https://j1.pupuapi.com/client/store/place/near_location_by_city/v2",
                "searchParams": {
                    "lng": "119.31" + _0x37cb99.randomString(4, _0x37cb99.ALL_DIGIT),
                    "lat": "26.06" + _0x37cb99.randomString(4, _0x37cb99.ALL_DIxxx)
                }
            },
                {
                    result: _0x497e92,
                    statusCode: _0x4904b7
                } = await this.request(_0x590682),
                _0x51d54e = _0x37cb99.get(_0x497e92, "errcode", _0x4904b7);
            if (_0x51d54e == 0) {
                let _0x17d37e = _0x497e92?.["data"];
                this.location = _0x37cb99.randomList(_0x17d37e);
                let {
                    service_store_id: _0x21f4da,
                    city_zip: _0x47ff14,
                    lng_x: _0x354923,
                    lat_y: _0x56e13f
                } = this.location;
                this.store_id = _0x21f4da;
                this.zip = _0x47ff14;
                this.lng = _0x354923;
                this.lat = _0x56e13f;
                const _0x21dcb6 = {
                    "pp_storeid": _0x21f4da,
                    "pp-cityzip": _0x47ff14
                },
                    _0x3653b1 = {
                        "headers": _0x21dcb6
                    };
                this.got = this.got.extend(_0x3653b1);
            } else {
                let _0x486379 = _0x37cb99.get(_0x497e92, "errmsg", "");
                this.log("选取随机地点失败[" + _0x51d54e + "]: " + _0x486379);
            }
        } catch (_0x42ba02) {
            console.log(_0x42ba02);
        }
    }
    async ["sign_index"](_0x1df67a = {}) {
        try {
            {
                const _0x40887f = {
                    "fn": "sign_index",
                    "method": "get",
                    "url": "https://j1.pupuapi.com/client/game/sign/v2/index"
                };
                let {
                    result: _0x436794,
                    statusCode: _0x1e17d9
                } = await this.request(_0x40887f),
                    _0x2f89de = _0x37cb99.get(_0x436794, "errcode", _0x1e17d9);
                if (_0x2f89de == 0) {
                    let {
                        is_signed: _0x27aff5
                    } = _0x436794?.["data"];
                    _0x27aff5 ? this.log("今天已签到") : await this.do_sign();
                } else {
                    let _0x2eb155 = _0x37cb99.get(_0x436794, "errmsg", "");
                    this.log("查询签到信息失败[" + _0x2f89de + "]: " + _0x2eb155);
                }
            }
        } catch (_0x426dcb) {
            console.log(_0x426dcb);
        }
    }
    async ["do_sign"](_0x27be4a = {}) {
        try {
            {
                const _0x47dfdc = {
                    "supplement_id": ""
                },
                    _0x524760 = {
                        "fn": "do_sign",
                        "method": "post",
                        "url": "https://j1.pupuapi.com/client/game/sign/v2",
                        "searchParams": _0x47dfdc
                    };
                let {
                    result: _0x26654d,
                    statusCode: _0x4a962a
                } = await this.request(_0x524760),
                    _0x4dc165 = _0x37cb99.get(_0x26654d, "errcode", _0x4a962a);
                if (_0x4dc165 == 0) {
                    let {
                        daily_sign_coin: _0x396d3a,
                        coupon_list = []
                    } = _0x26654d?.["data"],
                        _0x36902b = [];
                    _0x36902b.push(_0x396d3a + "积分");
                    for (let _0x38da97 of coupon_list) {
                        let _0x47bcc8 = (_0x38da97.condition_amount / 100).toFixed(2),
                            _0x1f50ce = (_0x38da97.discount_amount / 100).toFixed(2);
                        _0x36902b.push("满" + _0x47bcc8 + "减" + _0x1f50ce + "券");
                    }
                    this.log("签到成功: " + _0x36902b.join(", "));
                } else {
                    let _0x186f1e = _0x37cb99.get(_0x26654d, "errmsg", "");
                    this.log("签到失败[" + _0x4dc165 + "]: " + _0x186f1e);
                }
            }
        } catch (_0x2f2635) {
            console.log(_0x2f2635);
        }
    }
    async ["get_team_code"](_0x5a9711 = {}) {
        try {
            const _0x594529 = {
                "fn": "get_team_code",
                "method": "post",
                "url": "https://j1.pupuapi.com/client/game/coin_share/team"
            };
            let {
                result: _0x180ac5,
                statusCode: _0x2f6b4a
            } = await this.request(_0x594529),
                _0x5663a6 = _0x37cb99.get(_0x180ac5, "errcode", _0x2f6b4a);
            if (_0x5663a6 == 0) {
                this.team_code = _0x180ac5?.["data"] || "";
                await this.check_my_team();
            } else {
                let _0x18bee7 = _0x37cb99.get(_0x180ac5, "errmsg", "");
                this.log("获取组队码失败[" + _0x5663a6 + "]: " + _0x18bee7);
            }
        } catch (_0x40a25c) {
            console.log(_0x40a25c);
        }
    }
    async ["check_my_team"](_0x4cfbe7 = {}) {
        try {
            const _0x52ef47 = {
                "fn": "check_my_team",
                "method": "get",
                "url": "https://j1.pupuapi.com/client/game/coin_share/teams/" + this.team_code
            };
            let {
                result: _0x109ef3,
                statusCode: _0x59e5ac
            } = await this.request(_0x52ef47),
                _0x50be1f = _0x37cb99.get(_0x109ef3, "errcode", _0x59e5ac);
            if (_0x50be1f == 0) {
                let {
                    status: _0x568d34,
                    target_team_member_num: _0x35b6d0,
                    current_team_member_num: _0x4dbf5e,
                    current_user_reward_coin: _0xb760e0
                } = _0x109ef3?.["data"];
                switch (_0x568d34) {
                    case 10:
                        {
                            this.team_need_help = true;
                            this.team_max_help = _0x35b6d0;
                            this.team_helped_count = _0x4dbf5e;
                            this.log("组队未完成: " + _0x4dbf5e + "/" + _0x35b6d0);
                            break;
                        }
                    case 30:
                        {
                            {
                                this.log("已组队成功, 获得了" + _0xb760e0 + "积分");
                                break;
                            }
                        }
                    default:
                        {
                            this.log("组队状态[" + _0x568d34 + "]");
                            this.log(": " + JSON.stringify(_0x109ef3?.["data"]));
                        }
                }
            } else {
                let _0x14267a = _0x37cb99.get(_0x109ef3, "errmsg", "");
                this.log("查询组队信息失败[" + _0x50be1f + "]: " + _0x14267a);
            }
        } catch (_0x449624) {
            console.log(_0x449624);
        }
    }
    async ["join_team"](_0xe8e195, _0x2413f5 = {}) {
        try {
            const _0xba4af9 = {
                "fn": "join_team",
                "method": "post",
                "url": "https://j1.pupuapi.com/client/game/coin_share/teams/" + _0xe8e195.team_code + "/join"
            };
            let {
                result: _0x24d532,
                statusCode: _0x5158c4
            } = await this.request(_0xba4af9),
                _0x6bd189 = _0x37cb99.get(_0x24d532, "errcode", _0x5158c4);
            if (_0x6bd189 == 0) {
                this.team_can_help = false;
                _0xe8e195.team_helped_count += 1;
                this.log("加入账号[" + _0xe8e195.index + "][" + _0xe8e195.name + "]队伍成功: " + _0xe8e195.team_helped_count + "/" + _0xe8e195.team_max_help);
                _0xe8e195.team_helped_count >= _0xe8e195.team_max_help && (_0xe8e195.team_need_help = false, _0xe8e195.log("组队已满"));
            } else {
                let _0x2679d1 = _0x37cb99.get(_0x24d532, "errmsg", "");
                this.log("加入账号[" + _0xe8e195.index + "][" + _0xe8e195.name + "]队伍失败[" + _0x6bd189 + "]: " + _0x2679d1);
                switch (_0x6bd189) {
                    case 100007:
                        {
                            _0xe8e195.team_need_help = false;
                            break;
                        }
                    case 100009:
                        {
                            this.team_can_help = false;
                            break;
                        }
                }
            }
        } catch (_0x3628ee) {
            console.log(_0x3628ee);
        }
    }
    async ["query_coin"](_0x58cb1c = {}) {
        try {
            const _0x4dbbef = {
                "fn": "query_coin",
                "method": "get",
                "url": "https://j1.pupuapi.com/client/coin"
            };
            let {
                result: _0x5005ab,
                statusCode: _0x3eff61
            } = await this.request(_0x4dbbef),
                _0x1a1a65 = _0x37cb99.get(_0x5005ab, "errcode", _0x3eff61);
            if (_0x1a1a65 == 0) {
                let {
                    balance: _0xbc080f,
                    expiring_coin: _0x765d14,
                    expire_time: _0x5ac40e
                } = _0x5005ab?.["data"];
                const _0x256dad = {
                    "notify": true
                };
                this.log("朴分: " + _0xbc080f, _0x256dad);
                if (_0x765d14 && _0x5ac40e) {
                    let _0xc30380 = _0x37cb99.time("yyyy-MM-dd", _0x5ac40e);
                    const _0x4aecf0 = {
                        "notify": true
                    };
                    this.log("有" + _0x765d14 + "朴分将于" + _0xc30380 + "过期", _0x4aecf0);
                }
            } else {
                let _0x4e9401 = _0x37cb99.get(_0x5005ab, "errmsg", "");
                const _0x7aa566 = {
                    "notify": true
                };
                this.log("查询朴分失败[" + _0x1a1a65 + "]: " + _0x4e9401, _0x7aa566);
            }
        } catch (_0x2555f1) {
            console.log(_0x2555f1);
        }
    }
    async ["userTask"](_0x148947 = {}) {
        await this.user_info();
        await this.near_location_by_city();
        await this.sign_index();
        await this.get_team_code();
    }
}
function _0x3a159d() {
    if (_0x2561d9.existsSync("./" + _0x464627)) {
        {
            const _0x3873e5 = {
                "flag": "r",
                "encoding": "utf-8"
            };
            let _0x8b4d57 = _0x2561d9.readFileSync("./" + _0x464627, _0x3873e5);
            _0x8b4d57 = _0x8b4d57?.["replace"](/\r/g, "")?.["split"]("\n")?.["filter"](_0x147e39 => _0x147e39) || [];
            for (let _0x38c8a8 of _0x8b4d57) {
                _0x37cb99.userList.push(new _0x5f4758(_0x38c8a8));
            }
        }
    } else {
        const _0x512a6f = {
            "flag": "w",
            "encoding": "utf-8"
        };
        _0x2561d9.writeFileSync("./" + _0x464627, "", _0x512a6f);
        _0x37cb99.log("CK文件[" + _0x464627 + "]不存在, 默认为你新建一个, 如有需要请填入ck");
    }
    _0x37cb99.userCount = _0x37cb99.userList.length;
    if (!_0x37cb99.userCount) {
        const _0x571655 = {
            "notify": true
        };
        _0x37cb99.log("未找到变量，请检查文件[" + _0x464627 + "]", _0x571655);
        return false;
    }
    _0x37cb99.log("共找到" + _0x37cb99.userCount + "个账号");
    return true;
}
function _0x163725() {
    let _0x197ba7 = [];
    for (let _0x100649 of _0x37cb99.userList) {
        let _0xe8f3c8 = _0x100649.remark || _0x100649.mobile || _0x100649.name || "",
            _0x5c22cf = _0x100649.refresh_token;
        _0x197ba7.push(_0x5c22cf + "#" + _0xe8f3c8);
    }
    if (_0x197ba7.length) {
        {
            const _0x5001d9 = {
                "flag": "w",
                "encoding": "utf-8"
            };
            _0x2561d9.writeFileSync("./" + _0x464627, _0x197ba7.join("\n"), _0x5001d9);
        }
    }
}
!(async () => {
    if (!_0x3a159d()) return;
    _0x37cb99.log("\n------------------- 登录 -------------------");
    for (let _0x4bce87 of _0x37cb99.userList) {
        await _0x4bce87.user_refresh_token();
    }
    let _0x2bff96 = _0x37cb99.userList.filter(_0x46c21f => _0x46c21f.valid);
    _0x37cb99.log("\n------------------- 签到组队 -------------------");
    for (let _0x1aba85 of _0x2bff96) {
        await _0x1aba85.userTask();
    }
    _0x37cb99.log("\n------------------- 助力 -------------------");
    for (let _0x2919b6 of _0x2bff96.filter(_0x191825 => _0x191825.team_need_help)) {
        for (let _0x4ffbb1 of _0x2bff96.filter(_0xb62fdc => _0xb62fdc.team_can_help && _0xb62fdc.index != _0x2919b6.index)) {
            {
                if (!_0x2919b6.team_need_help) break;
                await _0x4ffbb1.join_team(_0x2919b6);
            }
        }
    }
    _0x37cb99.log("\n------------------- 查询 -------------------");
    for (let _0xdb80ed of _0x2bff96) {
        await _0xdb80ed.query_coin();
    }
})().catch(_0x1b424f => _0x37cb99.log(_0x1b424f)).finally(() => _0x37cb99.exitNow());
async function _0x5d7660(_0x1b8190 = 0) {
    let _0xdaab27 = false;
    try {
        const _0x27f9dc = {
            "fn": "auth",
            "method": "get",
            "url": _0x198ea4,
            "timeout": 20000
        };
        let {
            statusCode: _0x52b798,
            result: _0x1736ff
        } = await _0x2f36fb.request(_0x27f9dc);
        if (_0x52b798 != 200) return _0x1b8190++ < _0x592e57 && (_0xdaab27 = await _0x5d7660(_0x1b8190)), _0xdaab27;
        if (_0x1736ff?.["code"] == 0) {
            _0x1736ff = JSON.parse(_0x1736ff.data.file.data);
            if (_0x1736ff?.["commonNotify"] && _0x1736ff.commonNotify.length > 0) {
                {
                    const _0x5eb35d = {
                        "notify": true
                    };
                    _0x37cb99.log(_0x1736ff.commonNotify.join("\n") + "\n", _0x5eb35d);
                }
            }
            _0x1736ff?.["commonMsg"] && _0x1736ff.commonMsg.length > 0 && _0x37cb99.log(_0x1736ff.commonMsg.join("\n") + "\n");
            if (_0x1736ff[_0x13e27e]) {
                let _0x512139 = _0x1736ff[_0x13e27e];
                _0x512139.status == 0 ? _0x452dab >= _0x512139.version ? (_0xdaab27 = true, _0x37cb99.log(_0x512139.msg[_0x512139.status]), _0x37cb99.log(_0x512139.updateMsg), _0x37cb99.log("现在运行的脚本版本是：" + _0x452dab + "，最新脚本版本：" + _0x512139.latestVersion)) : _0x37cb99.log(_0x512139.versionMsg) : _0x37cb99.log(_0x512139.msg[_0x512139.status]);
            } else _0x37cb99.log(_0x1736ff.errorMsg);
        } else _0x1b8190++ < _0x592e57 && (_0xdaab27 = await _0x5d7660(_0x1b8190));
    } catch (_0x15684c) {
        _0x37cb99.log(_0x15684c);
    } finally {
        return _0xdaab27;
    }
}
function _0x128935(_0x133fcf) {
    return new class {
        constructor(_0x22f2f1) {
            this.name = _0x22f2f1;
            this.startTime = Date.now();
            const _0x4329c4 = {
                "time": true
            };
            this.log("[" + this.name + "]开始运行\n", _0x4329c4);
            this.notifyStr = [];
            this.notifyFlag = true;
            this.userIdx = 0;
            this.userList = [];
            this.userCount = 0;
            this.default_timestamp_len = 13;
            this.default_wait_interval = 1000;
            this.default_wait_limit = 3600000;
            this.default_wait_ahead = 0;
            this.ALL_DIGIT = "0123456789";
            this.ALL_ALPHABET = "qwertyuiopasdfghjklzxcvbnm";
            this.ALL_CHAR = this.ALL_DIGIT + this.ALL_ALPHABET + this.ALL_ALPHABET.toUpperCase();
        }
        ["log"](_0x5ed9bd, _0xa31129 = {}) {
            {
                const _0x40ab3a = {
                    "console": true
                };
                Object.assign(_0x40ab3a, _0xa31129);
                if (_0x40ab3a.time) {
                    {
                        let _0x4158c7 = _0x40ab3a.fmt || "hh:mm:ss";
                        _0x5ed9bd = "[" + this.time(_0x4158c7) + "]" + _0x5ed9bd;
                    }
                }
                if (_0x40ab3a.notify) {
                    this.notifyStr.push(_0x5ed9bd);
                }
                _0x40ab3a.console && console.log(_0x5ed9bd);
            }
        }
        ["get"](_0x4a0197, _0x5bc0e3, _0x65088b = "") {
            {
                let _0x3a8752 = _0x65088b;
                _0x4a0197?.["hasOwnProperty"](_0x5bc0e3) && (_0x3a8752 = _0x4a0197[_0x5bc0e3]);
                return _0x3a8752;
            }
        }
        ["pop"](_0x5b3b03, _0x2e0b21, _0x26b148 = "") {
            let _0x130cdb = _0x26b148;
            _0x5b3b03?.["hasOwnProperty"](_0x2e0b21) && (_0x130cdb = _0x5b3b03[_0x2e0b21], delete _0x5b3b03[_0x2e0b21]);
            return _0x130cdb;
        }
        ["copy"](_0xb07980) {
            return Object.assign({}, _0xb07980);
        }
        ["read_env"](_0x2c60e8) {
            let _0x339a04 = ckNames.map(_0x438ba7 => process.env[_0x438ba7]);
            for (let _0x433e1a of _0x339a04.filter(_0x48e3b9 => !!_0x48e3b9)) {
                for (let _0x18bd74 of _0x433e1a.split(envSplitor).filter(_0x4cea01 => !!_0x4cea01)) {
                    this.userList.push(new _0x2c60e8(_0x18bd74));
                }
            }
            this.userCount = this.userList.length;
            if (!this.userCount) {
                {
                    const _0x3061bb = {
                        "notify": true
                    };
                    this.log("未找到变量，请检查变量" + ckNames.map(_0x208341 => "[" + _0x208341 + "]").join("或"), _0x3061bb);
                    return false;
                }
            }
            this.log("共找到" + this.userCount + "个账号");
            return true;
        }
        ["time"](_0x52e5de, _0x4f7f33 = null) {
            {
                let _0x5f10bb = _0x4f7f33 ? new Date(_0x4f7f33) : new Date(),
                    _0x3f41ab = {
                        "M+": _0x5f10bb.getMonth() + 1,
                        "d+": _0x5f10bb.getDate(),
                        "h+": _0x5f10bb.getHours(),
                        "m+": _0x5f10bb.getMinutes(),
                        "s+": _0x5f10bb.getSeconds(),
                        "q+": Math.floor((_0x5f10bb.getMonth() + 3) / 3),
                        "S": this.padStr(_0x5f10bb.getMilliseconds(), 3)
                    };
                /(y+)/.test(_0x52e5de) && (_0x52e5de = _0x52e5de.replace(RegExp.$1, (_0x5f10bb.getFullYear() + "").substr(4 - RegExp.$1.length)));
                for (let _0x1b559f in _0x3f41ab) new RegExp("(" + _0x1b559f + ")").test(_0x52e5de) && (_0x52e5de = _0x52e5de.replace(RegExp.$1, 1 == RegExp.$1.length ? _0x3f41ab[_0x1b559f] : ("00" + _0x3f41ab[_0x1b559f]).substr(("" + _0x3f41ab[_0x1b559f]).length)));
                return _0x52e5de;
            }
        }
        async ["showmsg"]() {
            {
                if (!this.notifyFlag) return;
                if (!this.notifyStr.length) return;
                try {
                    var _0x22b9af = require("./sendNotify");
                    this.log("\n============== 推送 ==============");
                    await _0x22b9af.sendNotify(this.name, this.notifyStr.join("\n"));
                } catch {
                    this.log("\n=================================");
                    this.log("读取推送依赖[sendNotify.js]失败, 请检查同目录下是否有依赖");
                }
            }
        }
        ["padStr"](_0x4ae638, _0x1c7784, _0xe2f31e = {}) {
            let _0x770f27 = _0xe2f31e.padding || "0",
                _0x1d1c49 = _0xe2f31e.mode || "l",
                _0x62f962 = String(_0x4ae638),
                _0x20beba = _0x1c7784 > _0x62f962.length ? _0x1c7784 - _0x62f962.length : 0,
                _0x172728 = "";
            for (let _0x410f80 = 0; _0x410f80 < _0x20beba; _0x410f80++) {
                _0x172728 += _0x770f27;
            }
            _0x1d1c49 == "r" ? _0x62f962 = _0x62f962 + _0x172728 : _0x62f962 = _0x172728 + _0x62f962;
            return _0x62f962;
        }
        ["json2str"](_0x2da2cd, _0x2b612b, _0x214672 = false) {
            let _0x2ea7fe = [];
            for (let _0x5b44d0 of Object.keys(_0x2da2cd).sort()) {
                let _0x24381e = _0x2da2cd[_0x5b44d0];
                _0x24381e && _0x214672 && (_0x24381e = encodeURIComponent(_0x24381e));
                _0x2ea7fe.push(_0x5b44d0 + "=" + _0x24381e);
            }
            return _0x2ea7fe.join(_0x2b612b);
        }
        ["str2json"](_0x84ca70, _0x258dfd = false) {
            let _0x585f03 = {};
            for (let _0x933506 of _0x84ca70.split("&")) {
                {
                    if (!_0x933506) continue;
                    let _0x5e7143 = _0x933506.indexOf("=");
                    if (_0x5e7143 == -1) {
                        continue;
                    }
                    let _0x132718 = _0x933506.substr(0, _0x5e7143),
                        _0x27fab0 = _0x933506.substr(_0x5e7143 + 1);
                    _0x258dfd && (_0x27fab0 = decodeURIComponent(_0x27fab0));
                    _0x585f03[_0x132718] = _0x27fab0;
                }
            }
            return _0x585f03;
        }
        ["randomPattern"](_0xe4ee69, _0x307c10 = "abcdef0123456789") {
            let _0x5a9be2 = "";
            for (let _0x12c4d1 of _0xe4ee69) {
                _0x12c4d1 == "x" ? _0x5a9be2 += _0x307c10.charAt(Math.floor(Math.random() * _0x307c10.length)) : _0x12c4d1 == "X" ? _0x5a9be2 += _0x307c10.charAt(Math.floor(Math.random() * _0x307c10.length)).toUpperCase() : _0x5a9be2 += _0x12c4d1;
            }
            return _0x5a9be2;
        }
        ["randomUuid"]() {
            return this.randomPattern("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
        }
        ["randomString"](_0x1b0986, _0x86ce03 = "abcdef0123456789") {
            let _0x523de8 = "";
            for (let _0x1bb6dc = 0; _0x1bb6dc < _0x1b0986; _0x1bb6dc++) {
                _0x523de8 += _0x86ce03.charAt(Math.floor(Math.random() * _0x86ce03.length));
            }
            return _0x523de8;
        }
        ["randomList"](_0x40dcc2) {
            {
                let _0x4bf2a9 = Math.floor(Math.random() * _0x40dcc2.length);
                return _0x40dcc2[_0x4bf2a9];
            }
        }
        ["wait"](_0xe226a) {
            return new Promise(_0x4431b5 => setTimeout(_0x4431b5, _0xe226a));
        }
        async ["exitNow"]() {
            await this.showmsg();
            let _0x2902d9 = Date.now(),
                _0x40d1e7 = (_0x2902d9 - this.startTime) / 1000;
            this.log("");
            const _0x2c3a93 = {
                "time": true
            };
            this.log("[" + this.name + "]运行结束，共运行了" + _0x40d1e7 + "秒", _0x2c3a93);
            console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
            console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
            console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
            console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
            console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
            console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
            console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
            console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
            console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
            console.log("=>=>=>=>____来自 By 幼稚园小妹妹 (顶级插件售后服务951584089)丨Autman订阅源:Lxg-021002丨期待为您服务<=<=<=<=");
            process.exit(0);
        }
        ["normalize_time"](_0x32340e, _0x664105 = {}) {
            let _0x1ec72c = _0x664105.len || this.default_timestamp_len;
            _0x32340e = _0x32340e.toString();
            let _0x2315f8 = _0x32340e.length;
            while (_0x2315f8 < _0x1ec72c) {
                _0x32340e += "0";
            }
            _0x2315f8 > _0x1ec72c && (_0x32340e = _0x32340e.slice(0, 13));
            return parseInt(_0x32340e);
        }
        async ["wait_until"](_0x1aa220, _0x1eb17d = {}) {
            {
                let _0xab0674 = _0x1eb17d.logger || this,
                    _0x5e3682 = _0x1eb17d.interval || this.default_wait_interval,
                    _0x2d5861 = _0x1eb17d.limit || this.default_wait_limit,
                    _0xf356ab = _0x1eb17d.ahead || this.default_wait_ahead;
                if (typeof _0x1aa220 == "string" && _0x1aa220.includes(":")) {
                    {
                        if (_0x1aa220.includes("-")) _0x1aa220 = new Date(_0x1aa220).getTime(); else {
                            let _0x33b76b = this.time("yyyy-MM-dd ");
                            _0x1aa220 = new Date(_0x33b76b + _0x1aa220).getTime();
                        }
                    }
                }
                let _0x122583 = this.normalize_time(_0x1aa220) - _0xf356ab,
                    _0x49a222 = this.time("hh:mm:ss.S", _0x122583),
                    _0x344296 = Date.now();
                _0x344296 > _0x122583 && (_0x122583 += 86400000);
                let _0x4224c2 = _0x122583 - _0x344296;
                if (_0x4224c2 > _0x2d5861) {
                    const _0x1110a1 = {
                        "time": true
                    };
                    _0xab0674.log("离目标时间[" + _0x49a222 + "]大于" + _0x2d5861 / 1000 + "秒,不等待", _0x1110a1);
                } else {
                    const _0x496b47 = {
                        "time": true
                    };
                    _0xab0674.log("离目标时间[" + _0x49a222 + "]还有" + _0x4224c2 / 1000 + "秒,开始等待", _0x496b47);
                    while (_0x4224c2 > 0) {
                        let _0xfd1a7b = Math.min(_0x4224c2, _0x5e3682);
                        await this.wait(_0xfd1a7b);
                        _0x344296 = Date.now();
                        _0x4224c2 = _0x122583 - _0x344296;
                    }
                    const _0x183ff5 = {
                        "time": true
                    };
                    _0xab0674.log("已完成等待", _0x183ff5);
                }
            }
        }
        async ["wait_gap_interval"](_0x4982ab, _0x2439a0) {
            let _0x5340bd = Date.now() - _0x4982ab;
            _0x5340bd < _0x2439a0 && (await this.wait(_0x2439a0 - _0x5340bd));
        }
    }(_0x133fcf);
}