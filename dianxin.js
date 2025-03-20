//变量名chinaTelecomAccount

(function (_0x1398c0) {
    process.env.NODE_OPTIONS = "--max-old-space-size=4096 --openssl-legacy-provider";
    process.env.NODE_OPTIONS += " --tls-cipher-list=DEFAULT@SECLEVEL=0";
    const {
      "DOMParser": _0x3f8ba3
    } = require("xmldom");
    delete __filename;
    delete __dirname;
    var _0x3b0b0e = new _0x3f8ba3({
      "locator": {},
      "errorHandler": {
        "warning": function (_0x43074f) {},
        "error": function (_0x4b694d) {},
        "fatalError": function (_0x5172b4) {}
      }
    });
    _0x1398c0 = 7;
    const _0x1a907b = _0xf189dd("电信营业厅"),
      _0x221366 = require("got"),
      _0x7c8459 = require("path"),
      {
        "exec": _0x1a8673
      } = require("child_process"),
      _0x4c9506 = require("fs"),
      _0x150775 = require("crypto-js"),
      _0xd3111e = "moceleTanihc".split("").reverse().join(""),
      _0xed67c1 = new RegExp("[\\n\\&\\@]", ""),
      _0x5dcb01 = [_0xd3111e + "Account"],
      _0x18914c = 30000,
      _0x80a14f = 3,
      _0x1104ee = _0xd3111e + "cpR".split("").reverse().join(""),
      _0x51e8a6 = process.env[_0x1104ee],
      _0x2a1f65 = 6.02,
      _0x26154c = "moceleTanihc".split("").reverse().join(""),
      _0x14c4e5 = "https://leafxcy.coding.net/api/user/leafxcy/project/validcode/shared-depot/validCode/git/blob/master/code.json",
      _0x4b73f5 = "JinDouMall";
    let _0x4f8ac1 = {};
    const _0x15d9a8 = "./chinaTelecom_cache.json",
      _0x932305 = "Mozilla/5.0 (Linux; U; Android 12; zh-cn; ONEPLUS A9000 Build/QKQ1.190716.003) AppleWebKit/533.1 (KHTML, like Gecko) Version/5.0 Mobile Safari/533.1",
      _0x49b65a = "34d7cb0bcdf07523",
      _0x53d03f = "swedrftghyuiok09`7654321".split("").reverse().join(""),
      _0x36ee2c = "\0\0\0\0\0\0\0\0",
      _0x5d0e03 = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDBkLT15ThVgz6/NOl6s8GNPofdWzWbCkWnkaAm7O2LjkM1H7dMvzkiqdxU02jamGRHLX/ZNMCXHnPcW/sDhiFCBN18qFvy8g6VYb9QtroI09e176s+ZCtiv7hbin2cCTj99iUpnEloZm19lwHyo69u5UMiPMpq0/XKBO8lYhN/gwIDAQAB",
      _0x5de718 = "\n-----YEK CILBUP NIGEB-----".split("").reverse().join("") + _0x5d0e03 + "\n-----END PUBLIC KEY-----",
      _0xe715f9 = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+ugG5A8cZ3FqUKDwM57GM4io6JGcStivT8UdGt67PEOihLZTw3P7371+N47PrmsCpnTRzbTgcupKtUv8ImZalYk65dU8rjC/ridwhw9ffW2LBwvkEnDkkKKRi2liWIItDftJVBiWOh17o6gfbPoNrWORcAdcbpk2L+udld5kZNwIDAQAB",
      _0x35f8a5 = "-----BEGIN PUBLIC KEY-----\n" + _0xe715f9 + "\n-----END PUBLIC KEY-----",
      _0x23ffb7 = "BAQADIwry6othbBwEfpYLPbk3Boa5/NunPU8NsXm0ZtqES1tZyzMKA+K6quE36W8o59OoqJpolcJAEKLX5Hcezws1DEhbiNzMAYiOIKHJPsUxI4HSal98qQKlqmyFZwvEWmcplcy+8C6UbEcd/BJ4TyvEkYsSE+xrvFplTs4p6sjtHOPIDQgBKQiBCDANG4AAUQABEQD3bISGqSCG0AMfGIM".split("").reverse().join(""),
      _0x5bd516 = "-----BEGIN PUBLIC KEY-----\n" + _0x23ffb7 + "\n-----END PUBLIC KEY-----",
      _0x53ed7d = require("node-rsa");
    let _0x253d66 = new _0x53ed7d(_0x5de718);
    const _0x9eb7bd = {
      "encryptionScheme": "pkcs1"
    };
    _0x253d66.setOptions(_0x9eb7bd);
    let _0x40e903 = new _0x53ed7d(_0x35f8a5);
    const _0x370ad7 = {
      "encryptionScheme": "pkcs1"
    };
    _0x40e903.setOptions(_0x370ad7);
    let _0x30d16a = new _0x53ed7d(_0x5bd516);
    const _0x4f845c = {
      "encryptionScheme": "pkcs1"
    };
    _0x30d16a.setOptions(_0x4f845c);
    const _0x59860f = [202201, 202202, 202203],
      _0x503087 = 5;
    function _0x164663(_0x4a6465, _0x375482, _0x35afe0, _0xa2a707, _0x136543, _0x13f587) {
      return _0x150775[_0x4a6465].encrypt(_0x150775.enc.Utf8.parse(_0xa2a707), _0x150775.enc.Utf8.parse(_0x136543), {
        "mode": _0x150775.mode[_0x375482],
        "padding": _0x150775.pad[_0x35afe0],
        "iv": _0x150775.enc.Utf8.parse(_0x13f587)
      }).ciphertext.toString(_0x150775.enc.Hex);
    }
    function _0x134cec(_0x26c7d5, _0x463040, _0x4a6336, _0x35c8a7, _0x199ce3, _0x423a3f) {
      return _0x150775[_0x26c7d5].decrypt({
        "ciphertext": _0x150775.enc.Hex.parse(_0x35c8a7)
      }, _0x150775.enc.Utf8.parse(_0x199ce3), {
        "mode": _0x150775.mode[_0x463040],
        "padding": _0x150775.pad[_0x4a6336],
        "iv": _0x150775.enc.Utf8.parse(_0x423a3f)
      }).toString(_0x150775.enc.Utf8);
    }
    function _0x592882() {
      try {
        _0x4c9506.writeFileSync(_0x15d9a8, JSON.stringify(_0x4f8ac1, null, 4), "8-ftu".split("").reverse().join(""));
      } catch (_0x3fef2f) {
        console.log("错出存缓存保".split("").reverse().join(""));
      }
    }
    function _0x5c3daa() {
      try {
        _0x4f8ac1 = JSON.parse(_0x4c9506.readFileSync(_0x15d9a8, "8-ftu".split("").reverse().join("")));
      } catch (_0x149e2f) {
        console.log("存缓nekot个一建新 ,错出存缓取读".split("").reverse().join(""));
        _0x592882();
      }
    }
    let _0x1ae409 = 0,
      _0x2668bb = 0;
    function _0xebac22() {
      {
        _0x2668bb = 1;
        process.on("SIGTERM", () => {
          _0x2668bb = 2;
          process.exit(0);
        });
        const _0x1990e8 = _0x7c8459.basename(process.argv[1]),
          _0x45daf2 = ["bash", "timeout", "grep"];
        let _0x2275af = ["ps afx"];
        _0x2275af.push("grep " + _0x1990e8);
        _0x2275af = _0x2275af.concat(_0x45daf2.map(_0x24fde1 => "grep -v \"" + _0x24fde1 + "\" ".split("").reverse().join("")));
        _0x2275af.push("l- cw".split("").reverse().join(""));
        const _0x1fce35 = _0x2275af.join("|"),
          _0x290fca = () => {
            _0x1a8673(_0x1fce35, (_0x2a6abb, _0x1d3b15, _0x2bdb23) => {
              if (_0x2a6abb || _0x2bdb23) {
                return;
              }
              _0x1ae409 = parseInt(_0x1d3b15.trim(), 10);
            });
            _0x2668bb == 1 && setTimeout(_0x290fca, 2000);
          };
        _0x290fca();
      }
    }
    class _0x252e78 {
      constructor() {
        this.index = _0x1a907b.userIdx++;
        this.name = "";
        this.valid = false;
        const _0x4c8c9 = {
            "limit": 0
          },
          _0x220c3a = {
            "Connection": "keep-alive"
          },
          _0xc0d89d = {
            "retry": _0x4c8c9,
            "timeout": _0x18914c,
            "followRedirect": false,
            "ignoreInvalidCookies": true,
            "headers": _0x220c3a
          };
        this.got = _0x221366.extend(_0xc0d89d);
        _0x2668bb == 0 && _0xebac22();
      }
      ["log"](_0x1b8189, _0x9c4426 = {}) {
        var _0x1ac632 = "",
          _0xad7cd9 = _0x1a907b.userCount.toString().length;
        this.index && (_0x1ac632 += "[号账".split("").reverse().join("") + _0x1a907b.padStr(this.index, _0xad7cd9) + "]");
        this.name && (_0x1ac632 += "[" + this.name.slice(0, 3) + "****".split("").reverse().join("") + this.name.slice(-4) + "]");
        _0x1a907b.log(_0x1ac632 + _0x1b8189, _0x9c4426);
      }
      ["get_rscode"](_0x4681d6, _0x41b5cd, _0x4ecab9, _0x1ff39b) {
        let _0x138011,
          _0x17a8be = "\n        null_function = function () {}\n        content=\"" + _0x4681d6 + "\";\n        tsID=\"" + _0x1ff39b + "\"\n        delete __dirname \n        delete __filename \n        ActiveXObject = undefined;\n        \n        Window = null_function\n        window = self = parent = top = globalThis;\n        addEventListener = null_function\n        \n        attachEvent = null_function\n        navigator = {userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'}\n        HTMLCollection = []\n        HTMLCollection.length = 0\n        div = {\n            getElementsByTagName() {\n                return HTMLCollection\n            },\n            innerHTML: '',\n        \n        }\n        getAttribute = function () {\n            if (arguments[0] == 'r') {\n                return 'm'\n            }\n        }\n        meta = {\n            content: \"text/html; charset=utf-8\",\n            http_Equiv: \"Content-Type\",\n            id:tsID,\n            getAttribute: function (arg) {\n                if (arg === 'r') {\n                    return 'm'\n                }\n            },\n            parentNode: {\n                removeChild: function () {}\n            }\n        }\n        getElementsByTagNameObj = {}\n        metav={\n            id:tsID,\n            content:content,\n            r:\"m\",\n            getAttribute: function (arg) {\n                if (arg === 'r') {\n                    return 'm'\n                }\n            },\n            parentNode: {\n                removeChild: null_function\n            }\n        }\n        \n        documentElement = {\n            addEventListener: addEventListener\n        }\n        document = {\n            characterSet: 'UTF-8',\n            charset: 'UTF-8',\n            createElement() {\n                if (arguments[0] === 'div') {\n                    return div\n                }\n                return {}\n            },\n            getElementsByTagName: function (arg) {\n                if (arg === 'script') {\n                    return {}\n                }\n                if (arg === 'base') {\n                    return {length: 0}\n                }\n            },\n            documentElement: documentElement,\n            addEventListener: addEventListener,\n            attachEvent: attachEvent,\n            getElementById: function () {\n                if (arguments[0] === tsID) {\n                    return metav\n                }\n                if (arguments[0] == 'root-hammerhead-shadow-ui') {\n                    return null\n                }\n                return {}\n            },\n            appendChild:null_function,\n            removeChild: null_function\n        }\n        location={\n            \"href\": \"https://\",\n            \"origin\": \"\",\n            \"protocol\": \"\",\n            \"host\": \"\",\n            \"hostname\": \"\",\n            \"port\": \"\",\n            \"pathname\": \"\",\n            \"search\": \"\",\n            \"hash\": \"\"\n        }\n        //setTimeout = null_function\n        setInterval = null_function\n        " + _0x41b5cd + "\n        " + _0x4ecab9 + "\n        function getck() {\n            return document.cookie\n        }\n        return {getck};\n        ";
        _0x138011 = 13;
        const _0x16483e = new Function(_0x17a8be),
          _0x26187b = _0x16483e();
        var _0x16bc4c = 14;
        const _0x5b8c01 = _0x26187b.getck();
        _0x16bc4c = 10;
        this.rsFun = _0x16483e;
        this.getrsCk = _0x5b8c01;
        return _0x16483e;
      }
      async ["parseCookies"](_0x1ece13, _0x3c1e28) {
        {
          let _0x4cba26 = {},
            _0x2ea51f = _0x1ece13.split(";");
          _0x2ea51f.forEach(_0x167de8 => {
            _0x167de8 = _0x167de8.trim();
            if (_0x167de8.includes("=")) {
              let [_0x15b1dc, _0x59adc6] = _0x167de8.split("=", 2);
              !_0x15b1dc.toLowerCase().includes("path") && !_0x15b1dc.toLowerCase().includes("seripxe".split("").reverse().join("")) && !_0x15b1dc.toLowerCase().includes("eruces".split("").reverse().join("")) && !_0x15b1dc.toLowerCase().includes("etisemas".split("").reverse().join("")) && (_0x4cba26[_0x15b1dc] = _0x59adc6);
            }
          });
          if (_0x3c1e28) {
            _0x4cba26.yiUIIlbdQT3fO = _0x3c1e28.split("=")[1];
          }
          return _0x4cba26;
        }
      }
      async ["request"](_0x190a2b) {
        {
          let _0x25513b = _0x190a2b?.["ckvalue"] || "";
          const _0xb9ee29 = ["ECONNRESET", "EADDRINUSE", "DNUOFTONE".split("").reverse().join(""), "EAI_AGAIN"],
            _0x268e93 = ["TimeoutError"],
            _0x45beb9 = ["EPROTO"],
            _0x53d45c = [];
          var _0x1983cd = null,
            _0x3192a9 = 0,
            _0x4dd0e7 = _0x190a2b.fn || _0x190a2b.url;
          let _0x4a98af = _0x1a907b.get(_0x190a2b, "valid_code", _0x53d45c);
          _0x190a2b.method = _0x190a2b?.["dohtem".split("").reverse().join("")]?.["esaCreppUot".split("").reverse().join("")]() || "TEG".split("").reverse().join("");
          _0x190a2b?.["ckvalue"] && (_0x190a2b.headers = _0x190a2b?.["headers"] || {
            "Cookie": "=Pf3TQdblIIUiy".split("").reverse().join("") + (_0x25513b.yiUIIlbdQT3fP || "") + "; yiUIIlbdQT3fO=" + (_0x25513b.yiUIIlbdQT3fO || "")
          });
          let _0x16d92d, _0x3dc0a8;
          while (_0x3192a9 < _0x80a14f) {
            try {
              {
                _0x3192a9++;
                _0x16d92d = "";
                _0x3dc0a8 = "";
                let _0x194be3 = null,
                  _0x34816a = _0x190a2b?.["tuoemit".split("").reverse().join("")] || this.got?.["stluafed".split("").reverse().join("")]?.["options"]?.["timeout"]?.["request"] || _0x18914c,
                  _0x247d00 = false,
                  _0x57a0dd = Math.max(this.index - 2, 0),
                  _0x118618 = Math.min(Math.max(this.index - 3, 1), 3),
                  _0x5e0eab = Math.min(Math.max(this.index - 4, 1), 4),
                  _0x5003fd = _0x57a0dd * _0x118618 * _0x5e0eab * 400,
                  _0x177928 = _0x57a0dd * _0x118618 * _0x5e0eab * 1800,
                  _0x31d3fb = _0x5003fd + Math.floor(Math.random() * _0x177928),
                  _0x5845c2 = _0x1ae409 * (_0x1ae409 - 1) * 2000,
                  _0x2396f5 = (_0x1ae409 - 1) * (_0x1ae409 - 1) * 2000,
                  _0x5da990 = _0x5845c2 + Math.floor(Math.random() * _0x2396f5),
                  _0x4d75f1 = Math.max(_0x1a907b.userCount - 2, 0),
                  _0x529ee2 = Math.max(_0x1a907b.userCount - 3, 0),
                  _0x43dcc1 = _0x4d75f1 * 200,
                  _0x5873a4 = _0x529ee2 * 400,
                  _0x3a27f6 = _0x43dcc1 + Math.floor(Math.random() * _0x5873a4),
                  _0x2473ec = _0x31d3fb + _0x5da990 + _0x3a27f6;
                await new Promise(async _0x1e79c1 => {
                  {
                    setTimeout(() => {
                      _0x247d00 = true;
                      _0x1e79c1();
                    }, _0x34816a);
                    var _0x22e3f1 = 9;
                    let _0xd1fef1 = _0x1e79c1?.["ckvalue"] || "";
                    _0x22e3f1 = 17;
                    _0x190a2b?.["ckvalue"] && (_0x190a2b.headers = _0x190a2b?.["sredaeh".split("").reverse().join("")] || {
                      "Cookie": "=Pf3TQdblIIUiy".split("").reverse().join("") + (_0xd1fef1.yiUIIlbdQT3fP || "") + "; yiUIIlbdQT3fO=" + (_0xd1fef1.yiUIIlbdQT3fO || "")
                    });
                    try {
                      var _0x301943 = 17;
                      const _0x51b7d4 = await this.got(_0x190a2b);
                      _0x301943 = "gcepbq".split("").reverse().join("");
                      _0x1983cd = _0x51b7d4;
                    } catch (_0x154715) {
                      if (_0x154715.response?.["statusCode"] == 412) {
                        {
                          const {
                            "contentCODE": _0x5516eb,
                            "tsCODE": _0x47e590,
                            "srcAttribute": _0x4b6a23,
                            "tsID": _0x3373ed
                          } = _0x1a907b.get(_0x154715, "resoultCode", _0x154715.response?.["statusCode"]);
                          var _0x2812fb = 4;
                          const _0x5e923a = {
                            "fn": "getrs",
                            "method": "get",
                            "url": "https://wappark.189.cn" + _0x4b6a23
                          };
                          _0x2812fb = 9;
                          let {
                            "result": _0x3ebf1f,
                            "statusCode": _0x2ead5e
                          } = await this.request(_0x5e923a);
                          var _0x376a46 = 6;
                          let _0x2ec177 = "";
                          _0x376a46 = 11;
                          if (_0x154715.response && _0x154715.response.headers) {
                            var _0x594dfa = 10;
                            const _0x5cc77d = _0x154715.response.headers["set-cookie"];
                            _0x594dfa = 13;
                            Array.isArray(_0x5cc77d) && (_0x2ec177 = _0x5cc77d.map(_0x259e52 => _0x259e52.split(";")[0]).join("; "));
                          }
                          this.get_rscode(_0x5516eb, _0x47e590, _0x3ebf1f, _0x3373ed);
                          var _0x3471a2 = 6;
                          let _0x411b9a = this.getrsCk;
                          _0x3471a2 = "chleng".split("").reverse().join("");
                          _0x411b9a = this.rsFun().getck();
                          _0xd1fef1 = await this.parseCookies(_0x411b9a, _0x2ec177);
                          if (_0xd1fef1) {
                            {
                              _0x190a2b.headers = {
                                "Cookie": "yiUIIlbdQT3fP=" + (_0xd1fef1.yiUIIlbdQT3fP || "") + "=Of3TQdblIIUiy ;".split("").reverse().join("") + (_0xd1fef1.yiUIIlbdQT3fO || "")
                              };
                              try {
                                let _0x1a0f23;
                                const _0x16f9e8 = await this.got(_0x190a2b);
                                _0x1a0f23 = 4;
                                _0x1983cd = _0x16f9e8;
                              } catch (_0x21ba32) {
                                _0x194be3 = _0x21ba32;
                                _0x1983cd = _0x21ba32.response;
                                _0x16d92d = _0x21ba32.response?.["code"] || "";
                                _0x3dc0a8 = _0x21ba32.response?.["name"] || "";
                                console.log(_0x16d92d, "deliaf yrteR".split("").reverse().join(""));
                              }
                            }
                          }
                        }
                      } else _0x194be3 = _0x154715, _0x1983cd = _0x154715.response, _0x16d92d = _0x154715.response?.["code"] || "", _0x3dc0a8 = _0x154715.response?.["name"] || "";
                    }
                    _0x1e79c1();
                  }
                });
                if (_0x247d00) this.log("[" + _0x4dd0e7 + "(时超求请]".split("").reverse().join("") + _0x34816a / 1000 + "第试重，)秒".split("").reverse().join("") + _0x3192a9 + "次");else {
                  if (_0x45beb9.includes(_0x16d92d)) {
                    this.log("[" + _0x4dd0e7 + "[误错求请]".split("").reverse().join("") + _0x16d92d + "[]".split("").reverse().join("") + _0x3dc0a8 + "]");
                    _0x194be3?.["message"] && console.log(_0x194be3.message);
                    break;
                  } else {
                    if (_0x268e93.includes(_0x3dc0a8)) this.log("[" + _0x4dd0e7 + "[误错求请]".split("").reverse().join("") + _0x16d92d + "][" + _0x3dc0a8 + "第试重，]".split("").reverse().join("") + _0x3192a9 + "次");else {
                      if (_0xb9ee29.includes(_0x16d92d)) this.log("[" + _0x4dd0e7 + "[误错求请]".split("").reverse().join("") + _0x16d92d + "][" + _0x3dc0a8 + "]，重试第" + _0x3192a9 + "次");else {
                        {
                          if (_0x1983cd?.["edoCsutats".split("").reverse().join("")] == 412) break;
                          let _0x1ebbf7 = _0x1983cd?.["edoCsutats".split("").reverse().join("")] || "",
                            _0x359dc7 = _0x1ebbf7 / 100 | 0;
                          if (_0x1ebbf7) {
                            _0x359dc7 > 3 && !_0x4a98af.includes(_0x1ebbf7) && (_0x1ebbf7 ? this.log("[求请".split("").reverse().join("") + _0x4dd0e7 + "]返回[" + _0x1ebbf7 + "]") : this.log("请求[" + _0x4dd0e7 + "[误错]".split("").reverse().join("") + _0x16d92d + "][" + _0x3dc0a8 + "]"));
                            if (_0x359dc7 <= 4) break;
                          } else this.log("请求[" + _0x4dd0e7 + "]错误[" + _0x16d92d + "][" + _0x3dc0a8 + "]");
                        }
                      }
                    }
                  }
                }
              }
            } catch (_0x1b27b0) {
              _0x1b27b0.name == "rorrEtuoemiT".split("").reverse().join("") ? this.log("[" + _0x4dd0e7 + "第试重，时超求请]".split("").reverse().join("") + _0x3192a9 + "次") : this.log("[" + _0x4dd0e7 + "(误错求请]".split("").reverse().join("") + _0x1b27b0.message + "第试重，)".split("").reverse().join("") + _0x3192a9 + "次");
            }
          }
          const _0x5c5b0c = {
            "statusCode": _0x16d92d || -1,
            "headers": null,
            "result": null
          };
          if (_0x1983cd == null) return Promise.resolve(_0x5c5b0c);
          let {
            "statusCode": _0x253af7,
            "headers": _0x40c367,
            "body": _0x2369c1
          } = _0x1983cd;
          if (_0x2369c1) try {
            _0x2369c1 = JSON.parse(_0x2369c1);
          } catch {}
          const _0x2fc606 = {
            "statusCode": _0x253af7,
            "headers": _0x40c367,
            "result": _0x2369c1
          };
          return Promise.resolve(_0x2fc606);
        }
      }
    }
    let _0x2ecb9a = _0x252e78;
    try {
      let _0x345d48 = require("./LocalBasic");
      _0x2ecb9a = _0x345d48;
    } catch {}
    let _0x42ec34 = new _0x2ecb9a(_0x1a907b);
    class _0x173a90 extends _0x2ecb9a {
      constructor(_0x8df40d) {
        {
          super(_0x1a907b);
          let _0x547fe0 = _0x8df40d.split("#");
          this.name = _0x547fe0[0];
          this.passwd = _0x547fe0?.[1] || "";
          this.uuid = [_0x1a907b.randomPattern("xxxxxxxx"), _0x1a907b.randomPattern("xxxx"), _0x1a907b.randomPattern("xxx4".split("").reverse().join("")), _0x1a907b.randomPattern("xxxx"), _0x1a907b.randomPattern("xxxxxxxxxxxx".split("").reverse().join(""))];
          this.can_feed = true;
          this.jml_tokenFlag = "";
          this.mall_token = "";
          const _0x25e486 = {
            "Connection": "keep-alive",
            "User-Agent": _0x932305,
            "123456789": "987654321"
          };
        }
      }
      ["load_token"]() {
        {
          let _0x40ebac = false;
          _0x4f8ac1[this.name] && (this.userId = _0x4f8ac1[this.name].userId, this.token = _0x4f8ac1[this.name].token, this.log("nekot存缓到取读".split("").reverse().join("")), _0x40ebac = true);
          return _0x40ebac;
        }
      }
      ["encode_phone"]() {
        let _0x5c8413 = this.name.split("");
        for (let _0x4fd72e in _0x5c8413) {
          _0x5c8413[_0x4fd72e] = String.fromCharCode(_0x5c8413[_0x4fd72e].charCodeAt(0) + 2);
        }
        return _0x5c8413.join("");
      }
      ["encode_aes"](_0x3613e9) {
        return _0x164663("SEA".split("").reverse().join(""), "ECB", "Pkcs7", _0x3613e9, _0x49b65a, 0);
      }
      ["get_mall_headers"]() {
        return {
          "Content-Type": "application/json;charset=utf-8",
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "Authorization": this.mall_token ? "Bearer " + this.mall_token : "",
          "X-Requested-With": "XMLHttpRequest"
        };
      }
      async ["rsCk"](_0x17c90e, _0x2ba627) {
        {
          const _0x240960 = await rs(_0x17c90e, _0x2ba627);
          console.log(_0x240960);
        }
      }
      async ["login"](_0x5d1438 = {}) {
        {
          let _0x440c66 = false;
          try {
            let _0x57e9cb = _0x1a907b.time("yyyyMMddhhmmss"),
              _0x1d01a9 = "iPhone 14 15.4." + this.uuid.slice(0, 2).join("") + this.name + _0x57e9cb + this.passwd + "0$$$0.",
              _0x2f95b7 = {
                "fn": "login",
                "method": "post",
                "url": "https://appgologin.189.cn:9031/login/client/userLoginNormal",
                "json": {
                  "headerInfos": {
                    "code": "userLoginNormal",
                    "timestamp": _0x57e9cb,
                    "broadAccount": "",
                    "broadToken": "",
                    "clientType": "#9.6.1#channel50#iPhone 14 Pro Max#",
                    "shopId": "20002",
                    "source": "110003",
                    "sourcePassword": "Sid98s",
                    "token": "",
                    "userLoginName": this.name
                  },
                  "content": {
                    "attach": "test",
                    "fieldData": {
                      "loginType": "4",
                      "accountType": "",
                      "loginAuthCipherAsymmertric": _0x253d66.encrypt(_0x1d01a9, "46esab".split("").reverse().join("")),
                      "deviceUid": this.uuid.slice(0, 3).join(""),
                      "phoneNum": this.encode_phone(),
                      "isChinatelecom": "0",
                      "systemVersion": "15.4.0",
                      "authentication": this.passwd
                    }
                  }
                }
              },
              {
                "result": _0x544bd4,
                "statusCode": _0x16ceb3
              } = await this.request(_0x2f95b7),
              _0x166f37 = _0x1a907b.get(_0x544bd4?.["ataDesnopser".split("").reverse().join("")], "resultCode", -1);
            if (_0x166f37 == "0000") {
              {
                let {
                  "userId": _0x3484c5 = "",
                  "token": _0x249f1a = ""
                } = _0x544bd4?.["ataDesnopser".split("").reverse().join("")]?.["data"]?.["loginSuccessResult"] || {};
                this.userId = _0x3484c5;
                this.token = _0x249f1a;
                this.log("功成录登码密务服用使".split("").reverse().join(""));
                _0x4f8ac1[this.name] = {
                  "token": _0x249f1a,
                  "userId": _0x3484c5,
                  "t": Date.now()
                };
                _0x592882();
                _0x440c66 = true;
              }
            } else {
              {
                let _0x5807dc = _0x544bd4?.["gsm".split("").reverse().join("")] || _0x544bd4?.["responseData"]?.["cseDtluser".split("").reverse().join("")] || _0x544bd4?.["headerInfos"]?.["nosaer".split("").reverse().join("")] || "";
                this.log("服务密码登录失败[" + _0x166f37 + " :]".split("").reverse().join("") + _0x5807dc);
              }
            }
          } catch (_0x143d05) {
            console.log(_0x143d05);
          } finally {
            return _0x440c66;
          }
        }
      }
      async ["get_ticket"](_0x3407e5 = {}) {
        let _0x3dbd0c = "";
        try {
          {
            let _0x44f191 = "\n            <Request>\n                <HeaderInfos>\n                    <Code>getSingle</Code>\n                    <Timestamp>" + _0x1a907b.time("yyyyMMddhhmmss") + ">nekoT<                    \n>drowssaPecruoS/<s89diS>drowssaPecruoS<                    \n>ecruoS/<300011>ecruoS<                    \n>dIpohS/<20002>dIpohS<                    \n>epyTtneilC/<#xaM orP 41 enohPi#05lennahc#1.6.9#>epyTtneilC<                    \n>nekoTdaorB/<>nekoTdaorB<                    \n>tnuoccAdaorB/<>tnuoccAdaorB<                    \n>pmatsemiT/<".split("").reverse().join("") + this.token + "</Token>\n                    <UserLoginName>" + this.name + "</UserLoginName>\n                </HeaderInfos>\n                <Content>\n                    <Attach>test</Attach>\n                    <FieldData>\n                        <TargetId>" + _0x164663("TripleDES", "CBC", "7sckP".split("").reverse().join(""), this.userId, _0x53d03f, _0x36ee2c) + ">tseuqeR/<            \n>tnetnoC/<                \n>ataDdleiF/<                    \n>lrU/<154b5384722686a4>lrU<                        \n>dItegraT/<".split("").reverse().join("");
            const _0x425216 = {
              "fn": "get_ticket",
              "method": "post",
              "url": "https://appgologin.189.cn:9031/map/clientXML",
              "body": _0x44f191
            };
            let {
              "result": _0x4d1ded,
              "statusCode": _0x61cf7a
            } = await this.request(_0x425216);
            if (_0x4d1ded) {
              let _0x1c2c31 = _0x4d1ded.match(new RegExp(">\\tekciT/\\<\\)+w\\(>\\tekciT<\\".split("").reverse().join(""), ""));
              if (_0x1c2c31) {
                let _0x2b9602 = _0x1c2c31[1];
                _0x3dbd0c = _0x134cec("SEDelpirT".split("").reverse().join(""), "CBC", "Pkcs7", _0x2b9602, _0x53d03f, _0x36ee2c);
                this.ticket = _0x3dbd0c;
              }
            }
            !_0x3dbd0c && (!_0x3407e5.retry && (await this.login()) ? (_0x3407e5.retry = true, _0x3dbd0c = await this.get_ticket(_0x3407e5)) : (this.log("没有获取到ticket[" + _0x61cf7a + "]: "), _0x4d1ded && this.log(" :".split("").reverse().join("") + JSON.stringify(_0x4d1ded))));
          }
        } catch (_0x47f1aa) {
          console.log(_0x47f1aa);
        } finally {
          return _0x3dbd0c;
        }
      }
      async ["get_sign"](_0x1ed70f = {}) {
        var _0x5f50b2 = 12;
        let _0x1cb2f1 = this.rsCkk;
        _0x5f50b2 = "ejjogf";
        let _0x2d6db1 = false;
        try {
          const _0xc6d6af = {
              "ticket": this.ticket
            },
            _0x438f3f = {
              "ckvalue": _0x1cb2f1,
              "fn": "login",
              "method": "get",
              "url": "https://wapside.189.cn:9001/jt-sign/ssoHomLogin",
              "searchParams": _0xc6d6af
            };
          let {
              "result": _0x48a0a2,
              "statusCode": _0x44aa12
            } = await this.request(_0x438f3f),
            _0x22cc7a = _0x1a907b.get(_0x48a0a2, "resoultCode", _0x44aa12);
          _0x22cc7a == 0 ? (_0x2d6db1 = _0x48a0a2?.["ngis".split("").reverse().join("")], this.sign = _0x2d6db1, this.got = this.got.extend({
            "headers": {
              "sign": this.sign
            }
          })) : this.log("[败失ngis取获".split("").reverse().join("") + _0x22cc7a + "]: " + _0x48a0a2);
        } catch (_0x15ece2) {
          console.log(_0x15ece2);
        } finally {
          return _0x2d6db1;
        }
      }
      async ["get_rsValue"](_0x293dc9 = {}) {
        {
          let _0x1bf8ad,
            _0x494487 = false;
          _0x1bf8ad = "dginpe".split("").reverse().join("");
          try {
            const _0xc2eba5 = {
              "fn": "login",
              "method": "get",
              "url": _0x293dc9
            };
            let {
              "result": _0x10ffd4,
              "statusCode": _0x58dbfc,
              "headers": _0x45a4fc
            } = await this.request(_0xc2eba5);
            const {
              "contentCODE": _0x32104d,
              "tsCODE": _0x204130,
              "srcAttribute": _0x34e10d,
              "tsID": _0x48a003
            } = _0x1a907b.get(_0x10ffd4, "resoultCode", _0x58dbfc);
            var _0x5711e3 = 14;
            const _0x4a2e01 = {
              "fn": "getrs",
              "method": "get",
              "url": "https://wapside.189.cn:9001" + _0x34e10d
            };
            _0x5711e3 = 8;
            let {
              "result": _0x117052,
              "statusCode": _0x316dce
            } = await this.request(_0x4a2e01);
            var _0x7c56cc = 3;
            let _0x13bf8e = "";
            _0x7c56cc = 0;
            if (_0x45a4fc && _0x45a4fc["set-cookie"]) {
              const _0x5e227b = _0x45a4fc["set-cookie"];
              Array.isArray(_0x5e227b) && (_0x13bf8e = _0x5e227b.map(_0x13a5c4 => _0x13a5c4.split(";")[0]).join("; "));
            }
            this.get_rscode(_0x32104d, _0x204130, _0x117052, _0x48a003);
            this.rsCkk = _0x13bf8e;
          } catch (_0x127d3f) {
            console.log(_0x127d3f);
          } finally {
            return _0x494487;
          }
        }
      }
      async ["get_rs"](_0x95f64d = {}) {
        ck = await rs();
        console.log(ck);
      }
      ["encrypt_para"](_0x52a9fe) {
        let _0x5c49d9 = typeof _0x52a9fe == "gnirts".split("").reverse().join("") ? _0x52a9fe : JSON.stringify(_0x52a9fe);
        return _0x40e903.encrypt(_0x5c49d9, "xeh".split("").reverse().join(""));
      }
      async ["userCoinInfo"](_0x24b368 = false, _0x3ed9c1 = {}) {
        var _0x5458f0 = 2;
        let _0x2f5510 = this.rsCkk;
        _0x5458f0 = 2;
        var _0x171c9f = 8;
        let _0x3eafc4 = this.getrsCk;
        _0x171c9f = 2;
        _0x3eafc4 = this.rsFun().getck();
        _0x2f5510 = await this.parseCookies(_0x3eafc4, _0x2f5510);
        try {
          {
            const _0xf92b01 = {
              "phone": this.name
            };
            let _0x981fd5 = {
                "ckvalue": _0x2f5510,
                "fn": "userCoinInfo",
                "method": "post",
                "url": "https://wapside.189.cn:9001/jt-sign/api/home/userCoinInfo",
                "json": {
                  "para": this.encrypt_para(_0xf92b01)
                }
              },
              {
                "result": _0x1ee9d7,
                "statusCode": _0x405522
              } = await this.request(_0x981fd5),
              _0x590219 = _0x1a907b.get(_0x1ee9d7, "edoCtluoser".split("").reverse().join(""), _0x405522);
            if (_0x590219 == 0) {
              this.coin = _0x1ee9d7?.["totalCoin"] || 0;
              if (_0x24b368) {
                {
                  const _0x3adef5 = {
                    "notify": true
                  };
                  this.log("金豆余额: " + this.coin, _0x3adef5);
                  if (_0x1ee9d7.amountEx) {
                    {
                      let _0x3bf5ea = _0x1a907b.time("yyyy-MM-dd", _0x1ee9d7.expireDate);
                      const _0x441a4c = {
                        "notify": true
                      };
                      _0x1a907b.log("-- [" + _0x3bf5ea + "期过将]".split("").reverse().join("") + _0x1ee9d7.amountEx + "金豆", _0x441a4c);
                    }
                  }
                }
              }
            } else {
              let _0x1ad282 = _0x1ee9d7?.["msg"] || _0x1ee9d7?.["gsMtluoser".split("").reverse().join("")] || _0x1ee9d7?.["error"] || "";
              this.log("查询账户金豆余额错误[" + _0x590219 + "]: " + _0x1ad282);
            }
          }
        } catch (_0xcf41e0) {
          console.log(_0xcf41e0);
        }
      }
      async ["userStatusInfo"](_0x5dea2e = {}) {
        {
          var _0x38b7d4 = 7;
          let _0x5b8aeb = this.rsCkk;
          _0x38b7d4 = 7;
          let _0x43091c = this.getrsCk;
          _0x43091c = this.rsFun().getck();
          _0x5b8aeb = await this.parseCookies(_0x43091c, _0x5b8aeb);
          try {
            const _0x31d8c6 = {
              "phone": this.name
            };
            let _0x360cee = {
              "ckvalue": _0x5b8aeb,
              "fn": "userStatusInfo",
              "method": "post",
              "url": "https://wapside.189.cn:9001/jt-sign/api/home/userStatusInfo",
              "json": {
                "para": this.encrypt_para(_0x31d8c6)
              }
            };
            {
              let {
                  "result": _0x29b4d0,
                  "statusCode": _0x593323
                } = await this.request(_0x1a907b.copy(_0x360cee)),
                _0x1d75ff = _0x1a907b.get(_0x29b4d0, "resoultCode", _0x593323);
              if (_0x1d75ff == 0) {
                let {
                  "isSign": _0x79ff71
                } = _0x29b4d0?.["data"];
                _0x79ff71 ? this.log("到签已天今".split("").reverse().join("")) : await this.doSign();
              } else {
                {
                  let _0x354719 = _0x29b4d0?.["msg"] || _0x29b4d0?.["resoultMsg"] || _0x29b4d0?.["rorre".split("").reverse().join("")] || "";
                  this.log("查询账户签到状态错误[" + _0x1d75ff + "]: " + _0x354719);
                }
              }
            }
            {
              {
                let {
                    "result": _0xa88b12,
                    "statusCode": _0x4030ee
                  } = await this.request(_0x1a907b.copy(_0x360cee)),
                  _0x5beae4 = _0x1a907b.get(_0xa88b12, "edoCtluoser".split("").reverse().join(""), _0x4030ee);
                if (_0x5beae4 == 0) {
                  let {
                    "continuousDay": _0x2871e0,
                    "signDay": _0x972416,
                    "isSeven": _0x1869b5
                  } = _0xa88b12?.["data"];
                  this.log("到签已".split("").reverse().join("") + _0x972416 + "天, 连签" + _0x2871e0 + "天");
                  _0x1869b5 && (await this.exchangePrize());
                } else {
                  let _0x113594 = _0xa88b12?.["msg"] || _0xa88b12?.["resoultMsg"] || _0xa88b12?.["error"] || "";
                  this.log("查询账户签到状态错误[" + _0x5beae4 + " :]".split("").reverse().join("") + _0x113594);
                }
              }
            }
          } catch (_0x5a3227) {
            console.log(_0x5a3227);
          }
        }
      }
      async ["continueSignDays"](_0x420f05 = {}) {
        {
          let _0x4b17f = this.rsCkk,
            _0x254853 = this.getrsCk;
          _0x254853 = this.rsFun().getck();
          _0x4b17f = await this.parseCookies(_0x254853, _0x4b17f);
          try {
            const _0x219e1a = {
              "phone": this.name
            };
            let _0x250b6a = {
                "ckvalue": _0x4b17f,
                "fn": "continueSignDays",
                "method": "post",
                "url": "https://wapside.189.cn:9001/jt-sign/webSign/continueSignDays",
                "json": {
                  "para": this.encrypt_para(_0x219e1a)
                }
              },
              {
                "result": _0x2141a4,
                "statusCode": _0x56a2fc
              } = await this.request(_0x250b6a),
              _0x5bfa03 = _0x1a907b.get(_0x2141a4, "resoultCode", _0x56a2fc);
            if (_0x5bfa03 == 0) {
              {
                this.log("抽奖连签天数: " + (_0x2141a4?.["continueSignDays"] || 0) + "天");
                if (_0x2141a4?.["continueSignDays"] == 15) {
                  const _0x119e49 = {
                    "type": "15"
                  };
                  await this.exchangePrize(_0x119e49);
                } else {
                  if (_0x2141a4?.["continueSignDays"] == 28) {
                    const _0x27728a = {
                      "type": "28"
                    };
                    await this.exchangePrize(_0x27728a);
                  }
                }
              }
            } else {
              {
                let _0x581494 = _0x2141a4?.["msg"] || _0x2141a4?.["resoultMsg"] || _0x2141a4?.["rorre".split("").reverse().join("")] || "";
                this.log("[误错数天签连奖抽询查".split("").reverse().join("") + _0x5bfa03 + "]: " + _0x581494);
              }
            }
          } catch (_0x5473b9) {
            console.log(_0x5473b9);
          }
        }
      }
      async ["continueSignRecords"](_0x56e506 = {}) {
        {
          let _0x10265a,
            _0x3c00be = this.rsCkk;
          _0x10265a = 5;
          let _0x334d0c = this.getrsCk;
          _0x334d0c = this.rsFun().getck();
          _0x3c00be = await this.parseCookies(_0x334d0c, _0x3c00be);
          try {
            {
              const _0x5df56a = {
                "phone": this.name
              };
              let _0x43cd99 = {
                  "ckvalue": _0x3c00be,
                  "fn": "continueSignRecords",
                  "method": "post",
                  "url": "https://wapside.189.cn:9001/jt-sign/webSign/continueSignRecords",
                  "json": {
                    "para": this.encrypt_para(_0x5df56a)
                  }
                },
                {
                  "result": _0x359bd8,
                  "statusCode": _0xe30af6
                } = await this.request(_0x43cd99),
                _0x25608a = _0x1a907b.get(_0x359bd8, "edoCtluoser".split("").reverse().join(""), _0xe30af6);
              if (_0x25608a == 0) {
                if (_0x359bd8?.["tsiL51eunitnoc".split("").reverse().join("")]?.["htgnel".split("").reverse().join("")]) {
                  const _0x3bf060 = {
                    "type": "15"
                  };
                  await this.exchangePrize(_0x3bf060);
                }
                if (_0x359bd8?.["continue28List"]?.["htgnel".split("").reverse().join("")]) {
                  const _0x29bedf = {
                    "type": "28"
                  };
                  await this.exchangePrize(_0x29bedf);
                }
              } else {
                {
                  let _0x534645 = _0x359bd8?.["msg"] || _0x359bd8?.["gsMtluoser".split("").reverse().join("")] || _0x359bd8?.["error"] || "";
                  this.log("查询连签抽奖状态错误[" + _0x25608a + "]: " + _0x534645);
                }
              }
            }
          } catch (_0x10aad9) {
            console.log(_0x10aad9);
          }
        }
      }
      async ["doSign"](_0x4825b4 = {}) {
        let _0x31122f = this.rsCkk;
        var _0x2c67f2 = 8;
        let _0x4217db = this.getrsCk;
        _0x2c67f2 = 1;
        _0x4217db = this.rsFun().getck();
        _0x31122f = await this.parseCookies(_0x4217db, _0x31122f);
        try {
          let _0x218f39 = {
              "phone": this.name,
              "date": Date.now(),
              "sysType": "20002"
            },
            _0x4662df = {
              "ckvalue": _0x31122f,
              "fn": "doSign",
              "method": "post",
              "url": "https://wapside.189.cn:9001/jt-sign/webSign/sign",
              "json": {
                "encode": this.encode_aes(JSON.stringify(_0x218f39))
              }
            },
            {
              "result": _0x55f042,
              "statusCode": _0x4e5989
            } = await this.request(_0x4662df),
            _0x104d49 = _0x1a907b.get(_0x55f042, "edoCtluoser".split("").reverse().join(""), _0x4e5989);
          if (_0x104d49 == 0) {
            {
              let _0xc95937 = _0x1a907b.get(_0x55f042?.["atad".split("").reverse().join("")], "code", -1);
              if (_0xc95937 == 1) {
                {
                  const _0x1d08e3 = {
                    "notify": true
                  };
                  this.log("签到成功，获得" + (_0x55f042?.["data"]?.["coin"] || 0) + "豆金".split("").reverse().join(""), _0x1d08e3);
                  await this.userStatusInfo();
                }
              } else {
                {
                  const _0x14ef4a = {
                    "notify": true
                  };
                  this.log("[败失到签".split("").reverse().join("") + _0xc95937 + "]: " + _0x55f042.data.msg, _0x14ef4a);
                }
              }
            }
          } else {
            let _0x541039 = _0x55f042?.["msg"] || _0x55f042?.["gsMtluoser".split("").reverse().join("")] || _0x55f042?.["error"] || "";
            this.log("[误错到签".split("").reverse().join("") + _0x104d49 + "]: " + _0x541039);
          }
        } catch (_0x1d9780) {
          console.log(_0x1d9780);
        }
      }
      async ["exchangePrize"](_0x51d651 = {}) {
        let _0x400dc7,
          _0x10e174 = this.rsCkk;
        _0x400dc7 = 11;
        let _0x315800 = this.getrsCk;
        _0x315800 = this.rsFun().getck();
        _0x10e174 = await this.parseCookies(_0x315800, _0x10e174);
        try {
          let _0x5571bc = _0x1a907b.pop(_0x51d651, "epyt".split("").reverse().join(""), "7");
          const _0x1f9f9e = {
            "phone": this.name,
            "type": _0x5571bc
          };
          let _0x77c0eb = {
              "ckvalue": _0x10e174,
              "fn": "exchangePrize",
              "method": "post",
              "url": "https://wapside.189.cn:9001/jt-sign/webSign/exchangePrize",
              "json": {
                "para": this.encrypt_para(_0x1f9f9e)
              }
            },
            {
              "result": _0xccdcfb,
              "statusCode": _0x2c0e72
            } = await this.request(_0x77c0eb),
            _0x220066 = _0x1a907b.get(_0xccdcfb, "resoultCode", _0x2c0e72);
          if (_0x220066 == 0) {
            {
              let _0x1a8342 = _0x1a907b.get(_0xccdcfb?.["liateDezirp".split("").reverse().join("")], "edoc".split("").reverse().join(""), -1);
              if (_0x1a8342 == 0) {
                {
                  const _0x30dfec = {
                    "notify": true
                  };
                  this.log("连签" + _0x5571bc + "天抽奖: " + _0xccdcfb?.["prizeDetail"]?.["biz"]?.["eltiTniw".split("").reverse().join("")], _0x30dfec);
                }
              } else {
                let _0x32bcbc = _0xccdcfb?.["liateDezirp".split("").reverse().join("")]?.["rre".split("").reverse().join("")] || "";
                const _0x3544f2 = {
                  "notify": true
                };
                this.log("连签" + _0x5571bc + "天抽奖失败[" + _0x1a8342 + "]: " + _0x32bcbc, _0x3544f2);
              }
            }
          } else {
            {
              let _0x474fe0 = _0xccdcfb?.["gsm".split("").reverse().join("")] || _0xccdcfb?.["resoultMsg"] || _0xccdcfb?.["error"] || "";
              this.log("连签" + _0x5571bc + "[误错奖抽天".split("").reverse().join("") + _0x220066 + " :]".split("").reverse().join("") + _0x474fe0);
            }
          }
        } catch (_0x220e9d) {
          console.log(_0x220e9d);
        }
      }
      async ["homepage"](_0x12d2b5, _0x5240fc = {}) {
        var _0x2f987c = 14;
        let _0xe6f98c = this.rsCkk;
        _0x2f987c = "lidkch".split("").reverse().join("");
        var _0xb98d87 = 9;
        let _0xbd2bb4 = this.getrsCk;
        _0xb98d87 = "hiamhj";
        _0xbd2bb4 = this.rsFun().getck();
        _0xe6f98c = await this.parseCookies(_0xbd2bb4, _0xe6f98c);
        try {
          const _0x389651 = {
            "phone": this.name,
            "shopId": "20001",
            "type": _0x12d2b5
          };
          let _0x3c9174 = {
              "ckvalue": _0xe6f98c,
              "fn": "homepage",
              "method": "post",
              "url": "https://wapside.189.cn:9001/jt-sign/webSign/homepage",
              "json": {
                "para": this.encrypt_para(_0x389651)
              }
            },
            {
              "result": _0x49f4fc,
              "statusCode": _0x116999
            } = await this.request(_0x3c9174),
            _0x107703 = _0x1a907b.get(_0x49f4fc, "resoultCode", _0x116999);
          if (_0x107703 == 0) {
            let _0xe52288 = _0x1a907b.get(_0x49f4fc?.["atad".split("").reverse().join("")]?.["daeh".split("").reverse().join("")], "code", -1);
            if (_0xe52288 == 0) for (let _0x16bb06 of _0x49f4fc?.["atad".split("").reverse().join("")]?.["zib".split("").reverse().join("")]?.["adItems"] || []) {
              if (["0", "1"].includes(_0x16bb06?.["taskState"])) {
                switch (_0x16bb06.contentOne) {
                  case "3":
                    {
                      {
                        _0x16bb06?.["dIdrawer".split("").reverse().join("")] && (await this.receiveReward(_0x16bb06));
                        break;
                      }
                    }
                  case "5":
                    {
                      await this.openMsg(_0x16bb06);
                      break;
                    }
                  case "6":
                    {
                      await this.sharingGetGold();
                      break;
                    }
                  case "10":
                  case "31".split("").reverse().join(""):
                    {
                      !this.xtoken && (await this.get_usercode());
                      this.xtoken && (await this.watchLiveInit());
                      break;
                    }
                  case "81".split("").reverse().join(""):
                    {
                      {
                        await this.polymerize(_0x16bb06);
                        break;
                      }
                    }
                  default:
                    {
                      break;
                    }
                }
              }
            } else {
              let _0x4a4e2d = _0x49f4fc?.["data"]?.["daeh".split("").reverse().join("")]?.["err"] || "";
              this.log("获取任务列表失败[" + _0xe52288 + " :]".split("").reverse().join("") + _0x4a4e2d);
            }
          } else this.log("获取任务列表错误[" + _0x107703 + "]");
        } catch (_0x1b64c4) {
          console.log(_0x1b64c4);
        }
      }
      async ["receiveReward"](_0x5b0aef, _0x4a06a5 = {}) {
        {
          let _0x3afcd1 = this.rsCkk,
            _0x43acda = this.getrsCk;
          _0x43acda = this.rsFun().getck();
          _0x3afcd1 = await this.parseCookies(_0x43acda, _0x3afcd1);
          try {
            let _0x298887 = _0x5b0aef?.["title"]?.["split"](" ")?.[0];
            const _0x10b838 = {
              "phone": this.name,
              "rewardId": _0x5b0aef?.["rewardId"] || ""
            };
            let _0x5c2dd2 = {
                "ckvalue": _0x3afcd1,
                "fn": "receiveReward",
                "method": "post",
                "url": "https://wapside.189.cn:9001/jt-sign/paradise/receiveReward",
                "json": {
                  "para": this.encrypt_para(_0x10b838)
                }
              },
              {
                "result": _0x360d46,
                "statusCode": _0x4f0e11
              } = await this.request(_0x5c2dd2),
              _0x19bcfa = _0x1a907b.get(_0x360d46, "resoultCode", _0x4f0e11);
            if (_0x19bcfa == 0) this.log("[务任取领".split("").reverse().join("") + _0x298887 + "]奖励成功: " + _0x360d46?.["gsMtluoser".split("").reverse().join("")]);else {
              let _0x1d74a9 = _0x360d46?.["msg"] || _0x360d46?.["resoultMsg"] || _0x360d46?.["rorre".split("").reverse().join("")] || "";
              this.log("[务任取领".split("").reverse().join("") + _0x298887 + "[误错励奖]".split("").reverse().join("") + _0x19bcfa + " :]".split("").reverse().join("") + _0x1d74a9);
            }
          } catch (_0x87d7ca) {
            console.log(_0x87d7ca);
          }
        }
      }
      async ["openMsg"](_0x3f3428, _0x21565e = {}) {
        {
          let _0x5ae01e = this.rsCkk;
          var _0x5672c8 = 9;
          let _0x17284d = this.getrsCk;
          _0x5672c8 = "fennhp";
          _0x17284d = this.rsFun().getck();
          _0x5ae01e = await this.parseCookies(_0x17284d, _0x5ae01e);
          try {
            {
              let _0x559622 = _0x3f3428?.["title"]?.["split"](" ")?.[0];
              const _0x1febad = {
                "phone": this.name
              };
              let _0x3f8902 = {
                  "ckvalue": _0x5ae01e,
                  "fn": "openMsg",
                  "method": "post",
                  "url": "https://wapside.189.cn:9001/jt-sign/paradise/openMsg",
                  "json": {
                    "para": this.encrypt_para(_0x1febad)
                  }
                },
                {
                  "result": _0x3fcc57,
                  "statusCode": _0x17815c
                } = await this.request(_0x3f8902),
                _0x5edf25 = _0x1a907b.get(_0x3fcc57, "edoCtluoser".split("").reverse().join(""), _0x17815c);
              if (_0x5edf25 == 0) this.log("完成任务[" + _0x559622 + "]成功: " + _0x3fcc57?.["resoultMsg"]);else {
                {
                  let _0x2d17da = _0x3fcc57?.["msg"] || _0x3fcc57?.["resoultMsg"] || _0x3fcc57?.["error"] || "";
                  this.log("完成任务[" + _0x559622 + "]错误[" + _0x5edf25 + " :]".split("").reverse().join("") + _0x2d17da);
                }
              }
            }
          } catch (_0x23c4a1) {
            console.log(_0x23c4a1);
          }
        }
      }
      async ["polymerize"](_0x47b1b0, _0x2602a8 = {}) {
        let _0x58a2f0 = this.rsCkk;
        var _0x5858a5 = 16;
        let _0x58ecd8 = this.getrsCk;
        _0x5858a5 = "pnbjcb".split("").reverse().join("");
        _0x58ecd8 = this.rsFun().getck();
        _0x58a2f0 = await this.parseCookies(_0x58ecd8, _0x58a2f0);
        try {
          {
            let _0x10342e = _0x47b1b0?.["eltit".split("").reverse().join("")]?.["split"](" ")?.[0];
            const _0x5ea9e4 = {
              "phone": this.name,
              "jobId": _0x47b1b0.taskId
            };
            let _0x2120e2 = {
                "ckvalue": _0x58a2f0,
                "fn": "polymerize",
                "method": "post",
                "url": "https://wapside.189.cn:9001/jt-sign/webSign/polymerize",
                "json": {
                  "para": this.encrypt_para(_0x5ea9e4)
                }
              },
              {
                "result": _0x1d8e9c,
                "statusCode": _0x1b93af
              } = await this.request(_0x2120e2),
              _0x8e8602 = _0x1a907b.get(_0x1d8e9c, "resoultCode", _0x1b93af);
            if (_0x8e8602 == 0) this.log("[务任成完".split("").reverse().join("") + _0x10342e + " :功成]".split("").reverse().join("") + _0x1d8e9c?.["resoultMsg"]);else {
              {
                let _0x5a9935 = _0x1d8e9c?.["msg"] || _0x1d8e9c?.["resoultMsg"] || _0x1d8e9c?.["error"] || "";
                this.log("完成任务[" + _0x10342e + "[误错]".split("").reverse().join("") + _0x8e8602 + " :]".split("").reverse().join("") + _0x5a9935);
              }
            }
          }
        } catch (_0x627041) {
          console.log(_0x627041);
        }
      }
      async ["food"](_0x3ffcd3, _0x527ce7 = {}) {
        var _0x53bf53 = 12;
        let _0x5086d1 = this.rsCkk;
        _0x53bf53 = 9;
        let _0x49aa48 = this.getrsCk;
        _0x49aa48 = this.rsFun().getck();
        _0x5086d1 = await this.parseCookies(_0x49aa48, _0x5086d1);
        try {
          const _0x28fe9f = {
            "phone": this.name
          };
          let _0x22f12d = {
              "ckvalue": _0x5086d1,
              "fn": "food",
              "method": "post",
              "url": "https://wapside.189.cn:9001/jt-sign/paradise/food",
              "json": {
                "para": this.encrypt_para(_0x28fe9f)
              }
            },
            {
              "result": _0x139702,
              "statusCode": _0x270d92
            } = await this.request(_0x22f12d),
            _0x26bb72 = _0x1a907b.get(_0x139702, "edoCtluoser".split("").reverse().join(""), _0x270d92);
          if (_0x26bb72 == 0) {
            this.log("第" + _0x3ffcd3 + "次喂食: " + (_0x139702?.["gsMtluoser".split("").reverse().join("")] || "成功"));
            if (_0x139702?.["pUlevel".split("").reverse().join("")]) {
              {
                let _0x5ee413 = _0x139702?.["currLevelRightList"][0]?.["level"];
                const _0x498e3d = {
                  "notify": true
                };
                this.log("宠物已升级到[LV." + _0x5ee413 + " :得获 ,]".split("").reverse().join("") + _0x139702?.["currLevelRightList"][0]?.["emaNtshgir".split("").reverse().join("")], _0x498e3d);
              }
            }
          } else {
            {
              let _0x69b941 = _0x139702?.["msg"] || _0x139702?.["gsMtluoser".split("").reverse().join("")] || _0x139702?.["error"] || "";
              this.log("第" + _0x3ffcd3 + "[败失食喂次".split("").reverse().join("") + _0x26bb72 + " :]".split("").reverse().join("") + _0x69b941);
              _0x69b941?.["includes"]("最大喂食次数") && (this.can_feed = false);
            }
          }
        } catch (_0x55c71c) {
          console.log(_0x55c71c);
        }
      }
      async ["getParadiseInfo"](_0x5d0afa = {}) {
        let _0x360373 = this.rsCkk;
        var _0x506265 = 18;
        let _0x65e9ea = this.getrsCk;
        _0x506265 = 6;
        _0x65e9ea = this.rsFun().getck();
        _0x360373 = await this.parseCookies(_0x65e9ea, _0x360373);
        try {
          {
            const _0x46eba0 = {
              "phone": this.name
            };
            let _0x441cb8 = {
              "ckvalue": _0x360373,
              "fn": "getParadiseInfo",
              "method": "post",
              "url": "https://wapside.189.cn:9001/jt-sign/paradise/getParadiseInfo",
              "json": {
                "para": this.encrypt_para(_0x46eba0)
              }
            };
            {
              {
                let {
                    "result": _0x5ca580,
                    "statusCode": _0x5122a3
                  } = await this.request(_0x441cb8),
                  _0x4d452c = _0x1a907b.get(_0x5ca580, "resoultCode", _0x5122a3);
                if (_0x4d452c == 0) {
                  {
                    let _0x1aca35 = _0x5ca580?.["userInfo"]?.["levelInfoMap"];
                    this.level = _0x1aca35?.["level"];
                    for (let _0x1c9e42 = 1; _0x1c9e42 <= 10 && this.can_feed; _0x1c9e42++) {
                      await this.food(_0x1c9e42);
                    }
                  }
                } else {
                  let _0x21d421 = _0x5ca580?.["gsm".split("").reverse().join("")] || _0x5ca580?.["resoultMsg"] || _0x5ca580?.["rorre".split("").reverse().join("")] || "";
                  this.log("查询宠物等级失败[" + _0x4d452c + "]: " + _0x21d421);
                  return;
                }
              }
            }
            {
              {
                _0x360373 = this.rsCkk;
                _0x65e9ea = this.getrsCk;
                _0x65e9ea = this.rsFun().getck();
                _0x360373 = await this.parseCookies(_0x65e9ea, _0x360373);
                let _0x3441c9 = {
                    "ckvalue": _0x360373,
                    "fn": "getParadiseInfo",
                    "method": "post",
                    "url": "https://wapside.189.cn:9001/jt-sign/paradise/getParadiseInfo",
                    "json": {
                      "para": this.encrypt_para(_0x46eba0)
                    }
                  },
                  {
                    "result": _0x43dc05,
                    "statusCode": _0x285e3a
                  } = await this.request(_0x3441c9),
                  _0x3fec10 = _0x1a907b.get(_0x43dc05, "edoCtluoser".split("").reverse().join(""), _0x285e3a);
                if (_0x3fec10 == 0) {
                  {
                    let _0x36ee1f = _0x43dc05?.["userInfo"]?.["levelInfoMap"];
                    this.level = _0x36ee1f?.["level"];
                    const _0x3fbf8e = {
                      "notify": true
                    };
                    this.log("宠物等级[Lv." + _0x36ee1f?.["level"] + " :度进级升 ,]".split("").reverse().join("") + _0x36ee1f?.["growthValue"] + "/" + _0x36ee1f?.["fullGrowthCoinValue"], _0x3fbf8e);
                  }
                } else {
                  {
                    let _0x42c291 = _0x43dc05?.["gsm".split("").reverse().join("")] || _0x43dc05?.["resoultMsg"] || _0x43dc05?.["error"] || "";
                    this.log("[败失级等物宠询查".split("").reverse().join("") + _0x3fec10 + "]: " + _0x42c291);
                    return;
                  }
                }
              }
            }
          }
        } catch (_0x431d56) {
          console.log(_0x431d56);
        }
      }
      async ["getLevelRightsList"](_0x313581 = {}) {
        {
          let _0x32ef46 = this.rsCkk;
          var _0x40290a = 5;
          let _0x3747df = this.getrsCk;
          _0x40290a = "pmlkhn";
          _0x3747df = this.rsFun().getck();
          _0x32ef46 = await this.parseCookies(_0x3747df, _0x32ef46);
          try {
            const _0x5562b1 = {
              "phone": this.name
            };
            let _0x598a01 = {
                "ckvalue": _0x32ef46,
                "fn": "getLevelRightsList",
                "method": "post",
                "url": "https://wapside.189.cn:9001/jt-sign/paradise/getLevelRightsList",
                "json": {
                  "para": this.encrypt_para(_0x5562b1)
                }
              },
              {
                "result": _0x446a1b,
                "statusCode": _0x19041d
              } = await this.request(_0x598a01);
            if (_0x446a1b?.["currentLevel"]) {
              let _0xaec461 = _0x446a1b?.["leveLtnerruc".split("").reverse().join("")] || 6,
                _0x3fe3bd = false,
                _0xfc6c13 = "V" + _0xaec461;
              for (let _0x25f158 of _0x446a1b[_0xfc6c13] || []) {
                {
                  let _0x59f64f = _0x25f158?.["emaNtshgir".split("").reverse().join("")] || "";
                  if (this.coin < _0x25f158.costCoin) {
                    continue;
                  }
                  (_0x59f64f?.["match"](new RegExp("\\d+元话费", "")) || _0x59f64f?.["hctam".split("").reverse().join("")](new RegExp("豆金+d\\享专".split("").reverse().join(""), ""))) && (await this.getConversionRights(_0x25f158, _0x3fe3bd)) && (_0x3fe3bd = true);
                }
              }
            } else {
              {
                let _0x246b4f = _0x446a1b?.["msg"] || _0x446a1b?.["gsMtluoser".split("").reverse().join("")] || _0x446a1b?.["error"] || "";
                this.log(" :败失益权换兑物宠询查".split("").reverse().join("") + _0x246b4f);
              }
            }
          } catch (_0x179b0e) {
            console.log(_0x179b0e);
          }
        }
      }
      async ["getConversionRights"](_0x1ce06c, _0x4fabbb, _0x45e01c = {}) {
        let _0x32aac3 = this.rsCkk,
          _0xa7161d,
          _0x37bf7f = this.getrsCk;
        _0xa7161d = 1;
        _0x37bf7f = this.rsFun().getck();
        _0x32aac3 = await this.parseCookies(_0x37bf7f, _0x32aac3);
        let _0x1efb76 = false;
        try {
          {
            let _0x247a79 = _0x1ce06c?.["righstName"] || "";
            const _0x1d34e2 = {
              "phone": this.name,
              "rightsId": _0x1ce06c.id,
              "receiveCount": _0x1ce06c.receiveType
            };
            let _0x59716c = {
                "ckvalue": _0x32aac3,
                "fn": "getConversionRights",
                "method": "post",
                "url": "https://wapside.189.cn:9001/jt-sign/paradise/getConversionRights",
                "json": {
                  "para": this.encrypt_para(_0x1d34e2)
                }
              },
              {
                "result": _0x216422,
                "statusCode": _0x41de38
              } = await this.request(_0x59716c),
              _0x3f7b73 = _0x1a907b.get(_0x216422, "edoc".split("").reverse().join(""), _0x1a907b.get(_0x216422, "edoCtluoser".split("").reverse().join(""), _0x41de38));
            if (_0x3f7b73 == 200) {
              if (!(_0x216422?.["rightsStatus"]?.["sedulcni".split("").reverse().join("")]("已兑换") || _0x216422?.["rightsStatus"]?.["sedulcni".split("").reverse().join("")]("取领已".split("").reverse().join("")))) {
                _0x1efb76 = true;
                if (_0x4fabbb) {
                  await _0x1a907b.wait(3000);
                }
                await this.conversionRights(_0x1ce06c);
              }
            } else {
              let _0x1f31c7 = _0x216422?.["msg"] || _0x216422?.["resoultMsg"] || _0x216422?.["error"] || "";
              this.log("[益权询查".split("").reverse().join("") + _0x247a79 + "[败失]".split("").reverse().join("") + _0x3f7b73 + " :]".split("").reverse().join("") + _0x1f31c7);
            }
          }
        } catch (_0x1cd7c3) {
          console.log(_0x1cd7c3);
        } finally {
          return _0x1efb76;
        }
      }
      async ["conversionRights"](_0x4d2734, _0x3840bb = {}) {
        {
          let _0x394922 = this.rsCkk,
            _0x1ee9c5,
            _0x527353 = this.getrsCk;
          _0x1ee9c5 = 6;
          _0x527353 = this.rsFun().getck();
          _0x394922 = await this.parseCookies(_0x527353, _0x394922);
          try {
            let _0x10bd41 = _0x4d2734?.["emaNtshgir".split("").reverse().join("")] || "";
            const _0x83522b = {
              "phone": this.name,
              "rightsId": _0x4d2734.id
            };
            let _0x290aba = {
                "ckvalue": _0x394922,
                "fn": "conversionRights",
                "method": "post",
                "url": "https://wapside.189.cn:9001/jt-sign/paradise/conversionRights",
                "json": {
                  "para": this.encrypt_para(_0x83522b)
                }
              },
              {
                "result": _0x502012,
                "statusCode": _0x29f40d
              } = await this.request(_0x290aba),
              _0x7effe1 = _0x1a907b.get(_0x502012, "edoCtluoser".split("").reverse().join(""), _0x29f40d);
            if (_0x7effe1 == 0) this.log("兑换权益[" + _0x10bd41 + "功成]".split("").reverse().join(""));else {
              let _0x31092d = _0x502012?.["msg"] || _0x502012?.["resoultMsg"] || _0x502012?.["error"] || "";
              this.log("[益权换兑".split("").reverse().join("") + _0x10bd41 + "]失败[" + _0x7effe1 + " :]".split("").reverse().join("") + _0x31092d);
            }
          } catch (_0x58a778) {
            console.log(_0x58a778);
          }
        }
      }
      async ["get_usercode"](_0x314be8 = {}) {
        {
          let _0x37903f = this.rsCkk,
            _0x1ab94b = this.getrsCk;
          _0x1ab94b = this.rsFun().getck();
          _0x37903f = await this.parseCookies(_0x1ab94b, _0x37903f);
          try {
            {
              const _0x16e04a = {
                "ckvalue": _0x37903f,
                "fn": "get_usercode",
                "method": "get",
                "url": "https://xbk.189.cn/xbkapi/api/auth/jump",
                "searchParams": {}
              };
              _0x16e04a.searchParams.userID = this.ticket;
              _0x16e04a.searchParams.version = "9.3.3";
              _0x16e04a.searchParams.type = "room";
              _0x16e04a.searchParams.l = "renwu";
              let {
                  "statusCode": _0x4b85f9,
                  "headers": _0x35a931
                } = await this.request(_0x16e04a),
                _0x247c50 = _0x35a931?.["location"]?.["match"](new RegExp("usercode=(\\w+)", ""));
              _0x247c50 ? await this.codeToken(_0x247c50[1]) : this.log("获取code失败[" + _0x4b85f9 + "]");
            }
          } catch (_0x10af19) {
            console.log(_0x10af19);
          }
        }
      }
      async ["codeToken"](_0xdedb3c, _0xcf349 = {}) {
        {
          let _0x3ae053 = this.rsCkk,
            _0x1f567e = this.getrsCk;
          _0x1f567e = this.rsFun().getck();
          _0x3ae053 = await this.parseCookies(_0x1f567e, _0x3ae053);
          try {
            {
              const _0x5b22db = {
                  "usercode": _0xdedb3c
                },
                _0x158c4b = {
                  "ckvalue": _0x3ae053,
                  "fn": "codeToken",
                  "method": "post",
                  "url": "https://xbk.189.cn/xbkapi/api/auth/userinfo/codeToken",
                  "json": _0x5b22db
                };
              let {
                  "result": _0x5db701,
                  "statusCode": _0x4633a6
                } = await this.request(_0x158c4b),
                _0x2ec0e9 = _0x1a907b.get(_0x5db701, "edoc".split("").reverse().join(""), -1);
              if (_0x2ec0e9 == 0) this.xtoken = _0x5db701?.["data"]?.["nekot".split("").reverse().join("")], this.got = this.got.extend({
                "headers": {
                  "Authorization": "Bearer " + _0x30d16a.encrypt(this.xtoken, "base64")
                }
              });else {
                let _0x4ea71e = _0x5db701?.["msg"] || _0x5db701?.["resoultMsg"] || _0x5db701?.["error"] || _0x5db701?.["gsm".split("").reverse().join("")] || "";
                this.log("获取token失败[" + _0x2ec0e9 + "]: " + _0x4ea71e);
              }
            }
          } catch (_0x4fd3ae) {
            console.log(_0x4fd3ae);
          }
        }
      }
      async ["watchLiveInit"](_0x4ff089 = {}) {
        let _0xb4a547 = this.rsCkk,
          _0x4940db,
          _0x520588 = this.getrsCk;
        _0x4940db = 12;
        _0x520588 = this.rsFun().getck();
        _0xb4a547 = await this.parseCookies(_0x520588, _0xb4a547);
        try {
          let _0x29c1b8 = Math.floor(Math.random() * 1000) + 1000;
          const _0x53ed48 = {
              "period": 1,
              "liveId": _0x29c1b8
            },
            _0x415a4a = {
              "ckvalue": _0xb4a547,
              "fn": "watchLiveInit",
              "method": "post",
              "url": "https://xbk.189.cn/xbkapi/lteration/liveTask/index/watchLiveInit",
              "json": _0x53ed48
            };
          let {
              "result": _0x233a2a,
              "statusCode": _0x38a917
            } = await this.request(_0x415a4a),
            _0x114319 = _0x1a907b.get(_0x233a2a, "code", -1);
          if (_0x114319 == 0) {
            await _0x1a907b.wait(15000);
            await this.watchLive(_0x29c1b8, _0x233a2a?.["data"]);
          } else {
            let _0x346c86 = _0x233a2a?.["gsm".split("").reverse().join("")] || _0x233a2a?.["gsMtluoser".split("").reverse().join("")] || _0x233a2a?.["rorre".split("").reverse().join("")] || _0x233a2a?.["gsm".split("").reverse().join("")] || "";
            this.log("[播直看观始开".split("").reverse().join("") + _0x29c1b8 + "]失败[" + _0x114319 + "]: " + _0x346c86);
          }
        } catch (_0x25a8e8) {
          console.log(_0x25a8e8);
        }
      }
      async ["watchLive"](_0x37f1a7, _0x3101aa, _0x40985a = {}) {
        var _0x3f5092 = 17;
        let _0x454bd3 = this.rsCkk;
        _0x3f5092 = 0;
        let _0x47d645 = this.getrsCk;
        _0x47d645 = this.rsFun().getck();
        _0x454bd3 = await this.parseCookies(_0x47d645, _0x454bd3);
        try {
          {
            const _0x3d2d8d = {
                "period": 1,
                "liveId": _0x37f1a7,
                "key": _0x3101aa
              },
              _0x36f81f = {
                "ckvalue": _0x454bd3,
                "fn": "watchLive",
                "method": "post",
                "url": "https://xbk.189.cn/xbkapi/lteration/liveTask/index/watchLive",
                "json": _0x3d2d8d
              };
            let {
                "result": _0x32f975,
                "statusCode": _0x40e6de
              } = await this.request(_0x36f81f),
              _0x54187e = _0x1a907b.get(_0x32f975, "code", -1);
            if (_0x54187e == 0) this.log("观看直播[" + _0x37f1a7 + "功成]".split("").reverse().join("")), await this.watchLiveInit();else {
              let _0x5945ed = _0x32f975?.["msg"] || _0x32f975?.["gsMtluoser".split("").reverse().join("")] || _0x32f975?.["rorre".split("").reverse().join("")] || _0x32f975?.["gsm".split("").reverse().join("")] || "";
              this.log("观看直播[" + _0x37f1a7 + "[败失]".split("").reverse().join("") + _0x54187e + "]: " + _0x5945ed);
            }
          }
        } catch (_0x59b019) {
          console.log(_0x59b019);
        }
      }
      async ["watchVideo"](_0x2e6ab4, _0x1a0ab9 = {}) {
        let _0x3016fd = this.rsCkk,
          _0x11fdbc = this.getrsCk;
        _0x11fdbc = this.rsFun().getck();
        _0x3016fd = await this.parseCookies(_0x11fdbc, _0x3016fd);
        try {
          const _0x4533d5 = {
              "articleId": _0x2e6ab4
            },
            _0x2c788c = {
              "ckvalue": _0x3016fd,
              "fn": "watchVideo",
              "method": "post",
              "url": "https://xbk.189.cn/xbkapi/lteration/liveTask/index/watchVideo",
              "json": _0x4533d5
            };
          let {
              "result": _0x19a463,
              "statusCode": _0xc3f51e
            } = await this.request(_0x2c788c),
            _0x58b0b8 = _0x1a907b.get(_0x19a463, "edoc".split("").reverse().join(""), -1);
          if (_0x58b0b8 == 0) this.log("观看短视频[" + _0x2e6ab4 + "]成功");else {
            {
              let _0x2d4f03 = _0x19a463?.["msg"] || _0x19a463?.["resoultMsg"] || _0x19a463?.["error"] || _0x19a463?.["msg"] || "";
              this.log("观看短视频[" + _0x2e6ab4 + "]失败[" + _0x58b0b8 + "]: " + _0x2d4f03);
            }
          }
        } catch (_0x4b6e2e) {
          console.log(_0x4b6e2e);
        }
      }
      async ["like"](_0x29115e, _0x2a697c = {}) {
        let _0x318fce = this.rsCkk,
          _0x205955 = this.getrsCk;
        _0x205955 = this.rsFun().getck();
        _0x318fce = await this.parseCookies(_0x205955, _0x318fce);
        try {
          {
            const _0x8606f5 = {
                "account": this.name,
                "liveId": _0x29115e
              },
              _0x1dacfc = {
                "ckvalue": _0x318fce,
                "fn": "like",
                "method": "post",
                "url": "https://xbk.189.cn/xbkapi/lteration/room/like",
                "json": _0x8606f5
              };
            let {
                "result": _0x22c771,
                "statusCode": _0x562c24
              } = await this.request(_0x1dacfc),
              _0x2e47a1 = _0x1a907b.get(_0x22c771, "edoc".split("").reverse().join(""), -1);
            if (_0x2e47a1 == 0) {
              this.log("[间播直赞点".split("").reverse().join("") + _0x29115e + "]成功");
            } else {
              {
                let _0x5b1fb2 = _0x22c771?.["msg"] || _0x22c771?.["gsMtluoser".split("").reverse().join("")] || _0x22c771?.["rorre".split("").reverse().join("")] || _0x22c771?.["msg"] || "";
                this.log("[间播直赞点".split("").reverse().join("") + _0x29115e + "[败失]".split("").reverse().join("") + _0x2e47a1 + "]: " + _0x5b1fb2);
              }
            }
          }
        } catch (_0x51f02a) {
          console.log(_0x51f02a);
        }
      }
      async ["sharingGetGold"](_0x280742 = {}) {
        let _0xdd9b48 = this.rsCkk,
          _0x2c29e0 = this.getrsCk;
        _0x2c29e0 = this.rsFun().getck();
        _0xdd9b48 = await this.parseCookies(_0x2c29e0, _0xdd9b48);
        try {
          let _0x2148d2 = {
              "ckvalue": _0xdd9b48,
              "fn": "sharingGetGold",
              "method": "post",
              "url": "https://appfuwu.189.cn:9021/query/sharingGetGold",
              "json": {
                "headerInfos": {
                  "code": "sharingGetGold",
                  "timestamp": _0x1a907b.time("yyyyMMddhhmmss"),
                  "broadAccount": "",
                  "broadToken": "",
                  "clientType": "#9.6.1#channel50#iPhone 14 Pro Max#",
                  "shopId": "20002",
                  "source": "110003",
                  "sourcePassword": "Sid98s",
                  "token": this.token,
                  "userLoginName": this.name
                },
                "content": {
                  "attach": "test",
                  "fieldData": {
                    "shareSource": "3",
                    "userId": this.userId,
                    "account": this.encode_phone()
                  }
                }
              }
            },
            {
              "result": _0x5691a6,
              "statusCode": _0x3d9213
            } = await this.request(_0x2148d2),
            _0x7781f1 = _0x1a907b.get(_0x5691a6?.["responseData"], "resultCode", -1);
          if (_0x7781f1 == "0000") this.log("功成享分".split("").reverse().join(""));else {
            {
              let _0x788cc4 = _0x5691a6?.["msg"] || _0x5691a6?.["ataDesnopser".split("").reverse().join("")]?.["resultDesc"] || _0x5691a6?.["rorre".split("").reverse().join("")] || _0x5691a6?.["gsm".split("").reverse().join("")] || "";
              this.log("分享失败[" + _0x7781f1 + " :]".split("").reverse().join("") + _0x788cc4);
            }
          }
        } catch (_0x24702a) {
          console.log(_0x24702a);
        }
      }
      async ["month_jml_login"](_0x3495c5 = {}) {
        let _0x46dace = this.rsCkk,
          _0x18399d = this.getrsCk;
        _0x18399d = this.rsFun().getck();
        _0x46dace = await this.parseCookies(_0x18399d, _0x46dace);
        try {
          const _0x519f42 = {
            "ticket": this.ticket
          };
          let _0x2c5273 = {
              "ckvalue": _0x46dace,
              "fn": "month_jml_login",
              "method": "get",
              "url": "https://wappark.189.cn/jt-sign/ssoHomLoginCommon",
              "searchParams": _0x519f42
            },
            {
              "result": _0x80b0ed,
              "statusCode": _0x41466b
            } = await this.request(_0x2c5273),
            _0x330b93 = _0x1a907b.get(_0x80b0ed, "resoultCode", _0x41466b);
          if (_0x330b93 == 0) {
            this.log("城翼yb-功成录登礼面见".split("").reverse().join(""));
            let _0x3795bd = _0x1a907b.get(_0x80b0ed, "resoultMsg") || "功成录登".split("").reverse().join("");
            await this.month_jml_getInfo(_0x3795bd);
            await this.month_jml_check(_0x1a907b.get(_0x80b0ed, "dIcca".split("").reverse().join("")));
            await this.month_jml_getCount(_0x1a907b.get(_0x80b0ed, "dIcca".split("").reverse().join("")));
            await this.month_jml_refresh(_0x1a907b.get(_0x80b0ed, "accId"));
            await this.month_jml_lotteryrefresh(_0x1a907b.get(_0x80b0ed, "accId"));
          } else {
            let _0x47eb8d = _0x80b0ed?.["gsm".split("").reverse().join("")] || _0x80b0ed?.["resoultMsg"] || _0x80b0ed?.["rorre".split("").reverse().join("")] || "";
            this.log("[败失录登礼面见月每".split("").reverse().join("") + _0x330b93 + " :]".split("").reverse().join("") + _0x47eb8d);
          }
        } catch (_0x35a93f) {
          console.log(_0x35a93f);
        }
      }
      async ["month_jml_check"](_0x3a5e59, _0x510f6e = {}) {
        var _0xf8c9ae = 14;
        let _0x5dfb2f = this.rsCkk;
        _0xf8c9ae = 7;
        var _0x30620e = 5;
        let _0x61990b = this.getrsCk;
        _0x30620e = "bnbbpq";
        _0x61990b = this.rsFun().getck();
        _0x5dfb2f = await this.parseCookies(_0x61990b, _0x5dfb2f);
        try {
          const _0x310acd = {
            "phone": _0x3a5e59
          };
          let _0xcdcff2 = {
              "ckvalue": _0x5dfb2f,
              "fn": "month_jml_check",
              "method": "post",
              "url": "https://wappark.189.cn/jt-sign/welfare/check",
              "json": {
                "para": this.encrypt_para(_0x310acd)
              }
            },
            {
              "result": _0x5a7a54,
              "statusCode": _0x4eae22
            } = await this.request(_0xcdcff2),
            _0x4206ab = _0x1a907b.get(_0x5a7a54, "resoultCode", _0x4eae22);
          if (_0x4206ab == 0) this.jml_tokenFlag = _0x5a7a54?.["atad".split("").reverse().join("")]?.["flag"], this.log("见面礼 " + _0x5a7a54.resoultMsg), await this.month_jml_receive(_0x3a5e59);else {
            let _0xba31ac = _0x5a7a54?.["msg"] || _0x5a7a54?.["resoultMsg"] || _0x5a7a54?.["rorre".split("").reverse().join("")] || "";
            this.jml_tokenFlag = _0x5a7a54?.["data"]?.["galf".split("").reverse().join("")];
            this.log("领取每月见面礼失败[" + _0x4206ab + "]: " + _0xba31ac);
          }
        } catch (_0x11f235) {
          console.log(_0x11f235);
        }
      }
      async ["month_jml_getInfo"](_0x7f140, _0x2054b3 = {}) {
        {
          let _0x34b567 = this.rsCkk,
            _0x238dbd = this.getrsCk;
          _0x238dbd = this.rsFun().getck();
          _0x34b567 = await this.parseCookies(_0x238dbd, _0x34b567);
          try {
            const _0x38a988 = {
              "configCode": "nxflb"
            };
            let _0x43f2bf = {
                "ckvalue": _0x34b567,
                "fn": "month_jml_getInfo",
                "method": "post",
                "url": "https://wappark.189.cn/jt-sign/welfare/getInfo",
                "json": {
                  "para": this.encrypt_para(_0x38a988)
                }
              },
              {
                "result": _0x3e535f,
                "statusCode": _0x1aef69
              } = await this.request(_0x43f2bf),
              _0x15cf8a = _0x1a907b.get(_0x3e535f, "resoultCode", _0x1aef69);
            if (_0x15cf8a == 0) {
              let _0x5160ca = _0x3e535f.data.map(_0x3a8d8a => _0x3a8d8a.title) || [];
              this.jml_tokenFlag = _0x3e535f?.["data"]?.["flag"];
              this.log("见面礼" + _0x7f140 + ": " + _0x5160ca.join(" ,".split("").reverse().join("")));
            } else {
              let _0x1dd2e9 = _0x3e535f?.["gsm".split("").reverse().join("")] || _0x3e535f?.["gsMtluoser".split("").reverse().join("")] || _0x3e535f?.["error"] || "";
              this.log("领取每月见面礼失败[" + _0x15cf8a + " :]".split("").reverse().join("") + _0x1dd2e9);
            }
          } catch (_0x4a8bf0) {
            console.log(_0x4a8bf0);
          }
        }
      }
      async ["month_jml_receive"](_0x41871e, _0x33741d = {}) {
        var _0x3b5bbf = 6;
        let _0x28d366 = this.rsCkk;
        _0x3b5bbf = 6;
        let _0x41751d = this.getrsCk;
        _0x41751d = this.rsFun().getck();
        _0x28d366 = await this.parseCookies(_0x41751d, _0x28d366);
        try {
          {
            const _0x238b48 = {
              "phone": _0x41871e,
              "flag": this.jml_tokenFlag
            };
            let _0x337c6f = {
                "ckvalue": _0x28d366,
                "fn": "month_jml_receive",
                "method": "post",
                "url": "https://wappark.189.cn/jt-sign/welfare/receive",
                "json": {
                  "para": this.encrypt_para(_0x238b48)
                }
              },
              {
                "result": _0x44ffb4,
                "statusCode": _0x35e0ee
              } = await this.request(_0x337c6f),
              _0x85b1d5 = _0x1a907b.get(_0x44ffb4, "resoultCode", -1);
            if (_0x85b1d5 == 0) this.log("见面礼:" + _0x44ffb4?.["resoultMsg"]);else {
              {
                let _0x343ed1 = _0x44ffb4?.["msg"] || _0x44ffb4?.["resoultMsg"] || _0x44ffb4?.["error"] || "";
                this.log("领取APP抽奖次数失败[" + _0x85b1d5 + "]: " + _0x343ed1);
              }
            }
          }
        } catch (_0x364a95) {
          console.log(_0x364a95);
        }
      }
      async ["month_jml_getCount"](_0x3a8f24, _0x200ed1 = {}) {
        {
          let _0x5ea68f,
            _0x4c2ebd = this.rsCkk;
          _0x5ea68f = "iefjco".split("").reverse().join("");
          var _0x62fb17 = 11;
          let _0x24f64b = this.getrsCk;
          _0x62fb17 = 7;
          _0x24f64b = this.rsFun().getck();
          _0x4c2ebd = await this.parseCookies(_0x24f64b, _0x4c2ebd);
          try {
            const _0x5c0fc1 = {
              "phone": _0x3a8f24,
              "flag": this.jml_tokenFlag
            };
            let _0x4a22b5 = {
                "ckvalue": _0x4c2ebd,
                "fn": "month_jml_getCount",
                "method": "post",
                "url": "https://wappark.189.cn/jt-sign/lottery/getCount",
                "json": {
                  "para": this.encrypt_para(_0x5c0fc1)
                }
              },
              {
                "result": _0x4b70e4,
                "statusCode": _0x1e351
              } = await this.request(_0x4a22b5),
              _0x25282e = _0x1a907b.get(_0x4b70e4, "edoc".split("").reverse().join(""), -1);
            if (_0x25282e == 0) {
              {
                let _0x123ff0 = _0x4b70e4?.["video"]?.["pam".split("").reverse().join("")](_0x21e024 => _0x21e024.videoType) || [],
                  _0x136cfa = _0x59860f.filter(_0x10009e => !_0x123ff0.includes(_0x10009e)),
                  _0x172d12 = false;
                for (let _0x165bd4 of _0x136cfa) {
                  {
                    if (_0x172d12) {
                      let _0x391f3e = Math.floor(Math.random() * 5000) + 5000;
                      await _0x1a907b.wait(_0x391f3e);
                    }
                    await this.month_jml_addVideoCount(_0x3a8f24, _0x165bd4);
                    _0x172d12 = true;
                  }
                }
              }
            } else {
              let _0x1ccd7a = _0x4b70e4?.["msg"] || _0x4b70e4?.["gsMtluoser".split("").reverse().join("")] || _0x4b70e4?.["error"] || "";
              this.log("[败失数次会机奖抽得频视看询查".split("").reverse().join("") + _0x25282e + " :]".split("").reverse().join("") + _0x1ccd7a);
            }
          } catch (_0x1a8397) {
            console.log(_0x1a8397);
          }
        }
      }
      async ["month_jml_addVideoCount"](_0x3588dd, _0x2e8637, _0x43a1b7 = {}) {
        let _0xa50529 = this.rsCkk;
        var _0x43c847 = 11;
        let _0x4338c1 = this.getrsCk;
        _0x43c847 = 1;
        _0x4338c1 = this.rsFun().getck();
        _0xa50529 = await this.parseCookies(_0x4338c1, _0xa50529);
        try {
          const _0x17baec = {
            "phone": _0x3588dd,
            "videoType": _0x2e8637,
            "flag": this.jml_tokenFlag
          };
          let _0x48ea21 = {
              "ckvalue": _0xa50529,
              "fn": "month_jml_addVideoCount",
              "method": "post",
              "url": "https://wappark.189.cn/jt-sign/lottery/addVideoCount",
              "json": {
                "para": this.encrypt_para(_0x17baec)
              }
            },
            {
              "result": _0x25ea16,
              "statusCode": _0x2ee8b8
            } = await this.request(_0x48ea21),
            _0x3c6225 = _0x1a907b.get(_0x25ea16, "edoc".split("").reverse().join(""), -1);
          if (_0x3c6225 == 0) this.log("[频视看".split("").reverse().join("") + _0x2e8637 + "]得抽奖机会成功");else {
            {
              let _0x34bda3 = _0x25ea16?.["gsm".split("").reverse().join("")] || _0x25ea16?.["gsMtluoser".split("").reverse().join("")] || _0x25ea16?.["error"] || "";
              this.log("[频视看".split("").reverse().join("") + _0x2e8637 + "[败失会机奖抽得]".split("").reverse().join("") + _0x3c6225 + "]: " + _0x34bda3);
            }
          }
        } catch (_0x1b6d99) {
          console.log(_0x1b6d99);
        }
      }
      async ["month_jml_refresh"](_0x336f0c, _0x4fea48 = {}) {
        let _0x25b074,
          _0x587292 = this.rsCkk;
        _0x25b074 = 12;
        let _0x14fe49 = this.getrsCk;
        _0x14fe49 = this.rsFun().getck();
        _0x587292 = await this.parseCookies(_0x14fe49, _0x587292);
        try {
          const _0x2d9be4 = {
            "phone": _0x336f0c
          };
          let _0x4cb729 = {
              "ckvalue": _0x587292,
              "fn": "month_jml_refresh",
              "method": "post",
              "url": "https://wappark.189.cn/jt-sign/welfare/receiveInfo",
              "json": {
                "para": this.encrypt_para(_0x2d9be4)
              }
            },
            {
              "result": _0x1bde01,
              "statusCode": _0x4a7ac8
            } = await this.request(_0x4cb729),
            _0xe586bc = _0x1a907b.get(_0x1bde01, "resoultCode", -1);
          if (_0xe586bc == "0") this.log("见面礼包领取到:" + _0x1bde01.data.map(_0xd849f5 => _0xd849f5.prizeName) || []);else {
            let _0xa3cff = _0x1bde01?.["msg"] || _0x1bde01?.["resoultMsg"] || _0x1bde01?.["error"] || "";
            this.log("查询抽奖次数失败[" + _0xe586bc + "]: " + _0xa3cff);
          }
        } catch (_0x13cced) {
          console.log(_0x13cced);
        }
      }
      async ["month_jml_lotteryRevice"](_0x90043e, _0x50d070 = {}) {
        {
          var _0x238e72 = 6;
          let _0x48a96e = this.rsCkk;
          _0x238e72 = 10;
          let _0x23bb35 = this.getrsCk;
          _0x23bb35 = this.rsFun().getck();
          _0x48a96e = await this.parseCookies(_0x23bb35, _0x48a96e);
          try {
            const _0x21bcee = {
              "phone": _0x90043e,
              "flag": this.jml_tokenFlag
            };
            let _0x102aed = {
                "ckvalue": _0x48a96e,
                "fn": "month_jml_lotteryRevice",
                "method": "post",
                "url": "https://wapside.189.cn:9001/jt-sign/lottery/lotteryRevice",
                "json": {
                  "para": this.encrypt_para(_0x21bcee)
                }
              },
              {
                "result": _0x3b42ac,
                "statusCode": _0x16206b
              } = await this.request(_0x102aed),
              _0x2fade7 = _0x1a907b.get(_0x3b42ac, "edoc".split("").reverse().join(""), -1);
            if (_0x2fade7 == 0) {
              let {
                "rname": _0xc04c84,
                "id": _0xd95992
              } = _0x3b42ac;
              const _0x5cefa0 = {
                "notify": true
              };
              this.log("app抽奖: " + _0xc04c84, _0x5cefa0);
            } else {
              {
                let _0x48f7d0 = _0x3b42ac?.["msg"] || _0x3b42ac?.["resoultMsg"] || _0x3b42ac?.["error"] || "";
                this.log("[奖抽ppa".split("").reverse().join("") + _0x2fade7 + " :]".split("").reverse().join("") + _0x48f7d0);
              }
            }
          } catch (_0x2873f8) {
            console.log(_0x2873f8);
          }
        }
      }
      async ["month_jml_lotteryrefresh"](_0xd47f09, _0x45de11 = {}) {
        var _0x127c16 = 5;
        let _0x261187 = this.rsCkk;
        _0x127c16 = 16;
        let _0xc13f02 = this.getrsCk;
        _0xc13f02 = this.rsFun().getck();
        _0x261187 = await this.parseCookies(_0xc13f02, _0x261187);
        try {
          {
            const _0x30527d = {
              "phone": _0xd47f09,
              "flag": this.jml_tokenFlag
            };
            let _0x450457 = {
                "ckvalue": _0x261187,
                "fn": "month_jml_refresh",
                "method": "post",
                "url": "https://wappark.189.cn/jt-sign/lottery/refresh",
                "json": {
                  "para": this.encrypt_para(_0x30527d)
                }
              },
              {
                "result": _0x4f5aa0,
                "statusCode": _0x201c76
              } = await this.request(_0x450457),
              _0x46deea = _0x1a907b.get(_0x4f5aa0, "resoultCode", -1);
            if (_0x46deea == -1 || _0x46deea == "1-".split("").reverse().join("")) {
              let _0x563c6a = _0x4f5aa0?.["rNumber"] || 0;
              this.log("可以抽奖" + _0x563c6a + "次");
              let _0x384df8 = false;
              while (_0x563c6a-- > 0) {
                if (_0x384df8) {
                  let _0x145134 = Math.floor(Math.random() * 5000) + 3000;
                  await _0x1a907b.wait(_0x145134);
                }
                await this.month_jml_lotteryRevice(_0xd47f09);
                _0x384df8 = true;
              }
            } else {
              let _0x5a93ca = _0x4f5aa0?.["msg"] || _0x4f5aa0?.["resoultMsg"] || _0x4f5aa0?.["error"] || "";
              this.log("[败失数次奖抽询查".split("").reverse().join("") + _0x46deea + "]: " + _0x5a93ca);
            }
          }
        } catch (_0x2b29df) {
          console.log(_0x2b29df);
        }
      }
      async ["rpc_request"](_0x57a466, _0x4a841c = "teg".split("").reverse().join(""), _0x14f9f0 = null) {
        const _0xe2ea84 = new Error(),
          _0x2637e9 = _0xe2ea84.stack,
          _0x232c77 = _0x2637e9.split("\n"),
          _0x476021 = _0x232c77?.[2]?.["match"](new RegExp(")+w\\(.\\ssalCresU".split("").reverse().join(""), ""))?.[1] || "cpr".split("").reverse().join("");
        let _0x108fff = {
          "fn": _0x476021,
          "method": "post",
          "url": _0x51e8a6,
          "json": {
            "key": _0x4b73f5,
            "method": _0x4a841c,
            "url": _0x57a466.toString(),
            "headers": this.get_mall_headers(),
            "data": JSON.stringify(_0x14f9f0)
          }
        };
        return await this.request(_0x108fff);
      }
      async ["auth_login"](_0x305c76 = {}) {
        let _0x29ab06 = false;
        try {
          let _0x20e5e5 = this.ticket,
            _0x9c040f = new URL("https://wapact.189.cn:9001/unified/user/login"),
            _0x471647 = {
              "ticket": _0x20e5e5,
              "backUrl": encodeURIComponent("https://wapact.189.cn:9001/JinDouMall/JinDouMall_luckDraw.html?ticket=" + _0x20e5e5),
              "platformCode": "P201010301",
              "loginType": 2
            },
            {
              "result": _0x318649,
              "statusCode": _0x427b0a
            } = await this.rpc_request(_0x9c040f, "TSOP".split("").reverse().join(""), _0x471647),
            _0x3bb842 = _0x1a907b.get(_0x318649, "edoc".split("").reverse().join(""), _0x427b0a);
          if (_0x3bb842 == 0) {
            let {
              "token": _0x1c90d7,
              "sessionId": _0x34a1ea
            } = _0x318649?.["biz"];
            this.mall_token = _0x1c90d7;
            _0x29ab06 = true;
          } else {
            {
              let _0x33543a = _0x1a907b.get(_0x318649, "message", "");
              this.log("[败失录登城商".split("").reverse().join("") + _0x3bb842 + "]: " + _0x33543a);
            }
          }
        } catch (_0x22ecd6) {
          console.log(_0x22ecd6);
        } finally {
          return _0x29ab06;
        }
      }
      async ["queryInfo"](_0x5196aa = {}) {
        let _0x540aa = this.rsCkk,
          _0x177e1 = this.getrsCk;
        _0x177e1 = this.rsFun().getck();
        _0x540aa = await this.parseCookies(_0x177e1, _0x540aa);
        try {
          {
            let _0x244386 = new URL("ofnIyreuq/ipa/nedlog/yawetag/1009:nc.981.tcapaw//:sptth".split("").reverse().join(""));
            _0x244386.searchParams.append("_", Date.now().toString());
            let {
                "result": _0x1609b1,
                "statusCode": _0x31ebe5
              } = await this.rpc_request(_0x244386),
              _0x3fcf26 = _0x1a907b.get(_0x1609b1, "code", _0x31ebe5);
            if (_0x3fcf26 == 0) this.coin = _0x1609b1?.["biz"]?.["latoTtnuoma".split("").reverse().join("")] || this.coin, await this.queryTurnTable();else {
              let _0x460eec = _0x1a907b.get(_0x1609b1, "egassem".split("").reverse().join(""), "");
              this.log("[败失态状城商询查".split("").reverse().join("") + _0x3fcf26 + " :]".split("").reverse().join("") + _0x460eec);
            }
          }
        } catch (_0x10a6a1) {
          console.log(_0x10a6a1);
        }
      }
      async ["queryTurnTable"](_0x13e9b2 = {}) {
        try {
          {
            let _0x207904 = new URL("https://wapact.189.cn:9001/gateway/golden/api/queryTurnTable");
            _0x207904.searchParams.append("epyTresu".split("").reverse().join(""), "1");
            _0x207904.searchParams.append("_", Date.now().toString());
            let {
                "result": _0x418797,
                "statusCode": _0x33f510
              } = await this.rpc_request(_0x207904),
              _0x234989 = _0x1a907b.get(_0x418797, "code", _0x33f510);
            if (_0x234989 == 0) {
              {
                let _0x2478c7 = _0x418797?.["zib".split("").reverse().join("")]?.["tnuoCoaHoaix".split("").reverse().join("")] || 20,
                  _0x3d2007 = _0x418797?.["biz"]?.["wzTurntable"]?.["code"] || "";
                _0x3d2007 ? await this.lottery_check(_0x3d2007, _0x2478c7) : this.log("DI奖抽盘转到取获有没".split("").reverse().join(""));
              }
            } else {
              let _0x441c18 = _0x1a907b.get(_0x418797, "message", "");
              this.log("获取转盘抽奖活动失败[" + _0x234989 + "]: " + _0x441c18);
            }
          }
        } catch (_0x53d3e6) {
          console.log(_0x53d3e6);
        }
      }
      async ["lottery_check"](_0x5144b5, _0x239f8b, _0x27fbba = {}) {
        try {
          let _0x52b610 = new URL("kcehc/liated/dnats/yawetag/1009:nc.981.tcapaw//:sptth".split("").reverse().join(""));
          _0x52b610.searchParams.append("activityId", _0x5144b5);
          _0x52b610.searchParams.append("_", Date.now().toString());
          let {
              "result": _0x9a83dd,
              "statusCode": _0x5333c5
            } = await this.rpc_request(_0x52b610),
            _0x3a983d = _0x1a907b.get(_0x9a83dd, "edoc".split("").reverse().join(""), _0x5333c5);
          if (_0x3a983d == 0) {
            let _0x4c2b07 = _0x9a83dd?.["zib".split("").reverse().join("")]?.["ofnItluser".split("").reverse().join("")]?.["chanceCount"] || 0;
            this.log("转盘可以抽奖" + _0x4c2b07 + "次, 消耗金豆" + _0x239f8b + "/" + this.coin);
            let _0x2dfc6f = false;
            while (_0x4c2b07-- > 0 && this.coin >= _0x239f8b) {
              _0x2dfc6f && (await _0x1a907b.wait(3000));
              _0x2dfc6f = true;
              await this.lottery_do(_0x5144b5, _0x239f8b);
            }
          } else {
            {
              let _0x5ce2c1 = _0x1a907b.get(_0x9a83dd, "message", "");
              this.log("[败失数次奖抽盘转询查".split("").reverse().join("") + _0x3a983d + " :]".split("").reverse().join("") + _0x5ce2c1);
            }
          }
        } catch (_0x3d0a2c) {
          console.log(_0x3d0a2c);
        }
      }
      async ["lottery_do"](_0xf447fc, _0x2d0b83 = {}) {
        try {
          {
            let _0x28e248 = new URL("https://wapact.189.cn:9001/gateway/golden/api/lottery");
            const _0x594e1d = {
              "activityId": _0xf447fc
            };
            let {
                "result": _0x29a9e6,
                "statusCode": _0x41c5a5
              } = await this.rpc_request(_0x28e248, "POST", _0x594e1d),
              _0xefa201 = _0x1a907b.get(_0x29a9e6, "code", _0x41c5a5);
            if (_0xefa201 == 0) {
              {
                this.coin = _0x29a9e6?.["zib".split("").reverse().join("")]?.["amountTotal"] || this.coin - xiaoHaoCount;
                let _0x2a89e2 = _0x29a9e6?.["biz"]?.["resultCode"],
                  _0x873825 = "";
                switch (_0x2a89e2) {
                  case "0":
                    {
                      let _0x3d49ea = _0x29a9e6?.["biz"]?.["resultInfo"]?.["eltiTniw".split("").reverse().join("")] || "空气";
                      const _0x3da76d = {
                        "notify": true
                      };
                      this.log("转盘抽奖: " + _0x3d49ea, _0x3da76d);
                      return;
                    }
                  case "412":
                    {
                      _0x873825 = "抽奖次数已达上限";
                      break;
                    }
                  case "413":
                  case "420":
                    {
                      _0x873825 = "金豆不足";
                      break;
                    }
                  default:
                    {
                      {
                        this.log(": " + JSON.stringify(_0x29a9e6));
                        _0x873825 = "未知原因";
                        break;
                      }
                    }
                }
                this.log("转盘抽奖失败[" + _0x2a89e2 + "]: " + _0x873825);
              }
            } else {
              let _0x323f95 = _0x1a907b.get(_0x29a9e6, "message", "");
              this.log("[误错奖抽盘转".split("").reverse().join("") + _0xefa201 + " :]".split("").reverse().join("") + _0x323f95);
            }
          }
        } catch (_0x1a5486) {
          console.log(_0x1a5486);
        }
      }
      async ["userTask"]() {
        console.time("[号账".split("").reverse().join("") + this.index + "]" + "耗时");
        const _0x331d29 = {
          "notify": true
        };
        let _0x4cf85d,
          _0x1e8b64 = this.name;
        _0x4cf85d = "ocmgng";
        _0x1a907b.log("\n======= 账号[" + this.index + "[]".split("").reverse().join("") + _0x1e8b64.slice(0, 3) + "****".split("").reverse().join("") + _0x1e8b64.slice(-4) + "] =======", _0x331d29);
        if (!this.load_token() && !(await this.login())) {
          return;
        }
        if (!(await this.get_ticket())) return;
        await this.get_sign();
        await this.get_ticket();
        await this.userCoinInfo();
        await this.getLevelRightsList();
        await this.month_jml_login();
        await this.userStatusInfo();
        await this.continueSignRecords();
        await this.homepage("djzwrz_dq_gh".split("").reverse().join(""));
        await this.getParadiseInfo();
        _0x51e8a6 && (await this.userLotteryTask());
        await this.userCoinInfo(true);
        await _0x1a907b.wait(3000);
        console.timeEnd("账号[" + this.index + "]" + "时耗".split("").reverse().join(""));
      }
      async ["userLotteryTask"]() {
        if (!(await this.auth_login())) return;
        await this.queryInfo();
      }
    }
    !(async () => {
      {
        _0x1a907b.read_env(_0x173a90);
        _0x5c3daa();
        for (let _0x14b12a of _0x1a907b.userList) {
          await _0x14b12a.userTask();
        }
      }
    })().catch(_0x1b56c2 => _0x1a907b.log(_0x1b56c2)).finally(() => _0x1a907b.exitNow());
    async function _0x42f36f(_0x3c60e7 = 0) {
      {
        let _0x27f4b7 = [];
        try {
          const _0x208967 = {
            "fn": "auth",
            "method": "get",
            "url": _0x14c4e5,
            "timeout": 20000
          };
          let {
            "statusCode": _0x5cd022,
            "result": _0x198999
          } = await _0x42ec34.request(_0x208967);
          if (_0x5cd022 != 200) return _0x3c60e7++ < _0x503087 && (_0x27f4b7 = await _0x42f36f(_0x3c60e7)), _0x27f4b7;
          if (_0x198999?.["edoc".split("").reverse().join("")] == 0) {
            _0x198999 = JSON.parse(_0x198999.data.file.data);
            if (_0x198999?.["commonNotify"] && _0x198999.commonNotify.length > 0) {
              const _0x395fa2 = {
                "notify": true
              };
              _0x1a907b.log(_0x198999.commonNotify.join("\n") + "\n", _0x395fa2);
            }
            _0x198999?.["gsMnommoc".split("").reverse().join("")] && _0x198999.commonMsg.length > 0 && _0x1a907b.log(_0x198999.commonMsg.join("\n") + "\n");
            if (_0x198999[_0x26154c]) {
              {
                let _0x18f4fa = _0x198999[_0x26154c];
                _0x18f4fa.status == 0 ? _0x2a1f65 >= _0x18f4fa.version ? (_0x27f4b7 = true, _0x1a907b.log(_0x18f4fa.msg[_0x18f4fa.status]), _0x1a907b.log(_0x18f4fa.updateMsg), _0x1a907b.log("：是本版本脚的行运在现".split("").reverse().join("") + _0x2a1f65 + "，最新脚本版本：" + _0x18f4fa.latestVersion)) : _0x1a907b.log(_0x18f4fa.versionMsg) : _0x1a907b.log(_0x18f4fa.msg[_0x18f4fa.status]);
              }
            } else {
              _0x1a907b.log(_0x198999.errorMsg);
            }
          } else _0x3c60e7++ < _0x503087 && (_0x27f4b7 = await _0x42f36f(_0x3c60e7));
        } catch (_0xb3a78e) {
          _0x1a907b.log(_0xb3a78e);
        } finally {
          return _0x27f4b7;
        }
      }
    }
    function _0xf189dd(_0x58fdd8) {
      return new class {
        constructor(_0x35e98f) {
          {
            this.name = _0x35e98f;
            this.startTime = Date.now();
            const _0x2f9e2a = {
              "time": true
            };
            this.log("[" + this.name + "]开始运行\n", _0x2f9e2a);
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
        }
        ["log"](_0x3a25ce, _0x250d9c = {}) {
          const _0x53456a = {
            "console": true
          };
          Object.assign(_0x53456a, _0x250d9c);
          if (_0x53456a.time) {
            {
              let _0x52a2dc = _0x53456a.fmt || "ss:mm:hh".split("").reverse().join("");
              _0x3a25ce = "[" + this.time(_0x52a2dc) + "]" + _0x3a25ce;
            }
          }
          if (_0x53456a.notify) {
            this.notifyStr.push(_0x3a25ce);
          }
          _0x53456a.console && console.log(_0x3a25ce);
        }
        ["get"](_0x175a36, _0x26ff7a, _0x222b0e = "") {
          {
            let _0x745ed7 = _0x222b0e;
            if (_0x745ed7 === 412) {
              let _0x51e64 = _0x3b0b0e.parseFromString(_0x175a36, "lmx/noitacilppa".split("").reverse().join(""));
              _0x51e64 == undefined && (_0x51e64 = _0x3b0b0e.parseFromString(_0x175a36.response.body, "application/xml"));
              var _0x2ea96e = 15;
              const _0x1ab896 = _0x51e64.getElementsByTagName("meta")[1]?.["getAttribute"]("tnetnoc".split("").reverse().join(""));
              _0x2ea96e = 5;
              const _0x12706b = _0x51e64.getElementsByTagName("meta")[1]?.["getAttribute"]("id"),
                _0x33d574 = _0x51e64.getElementsByTagName("script");
              var _0x283812 = 15;
              const _0x1c9de1 = Array.from(_0x33d574).find(_0x6c5341 => {
                var _0x28f145 = 10;
                const _0x5f1bb6 = _0x6c5341.textContent || _0x6c5341.text;
                _0x28f145 = 5;
                return _0x5f1bb6.includes("$_ts=window['$_ts']");
              });
              _0x283812 = "lkfdbl".split("").reverse().join("");
              const _0x3b5a1a = Array.from(_0x33d574).find(_0x51d827 => _0x51d827.getAttribute("crs".split("").reverse().join("")));
              if (_0x1c9de1 && _0x3b5a1a) {
                let _0x97e26d;
                const _0x484c30 = _0x1c9de1.textContent || _0x1c9de1.text;
                _0x97e26d = 4;
                const _0x520857 = _0x3b5a1a.getAttribute("crs".split("").reverse().join(""));
                return {
                  "contentCODE": _0x1ab896,
                  "tsCODE": _0x484c30,
                  "srcAttribute": _0x520857,
                  "tsID": _0x12706b
                };
              }
              return {
                "contentCODE": null,
                "tsCODE": null,
                "srcAttribute": null
              };
            }
            _0x175a36?.["hasOwnProperty"](_0x26ff7a) && (_0x745ed7 = _0x175a36[_0x26ff7a]);
            return _0x745ed7;
          }
        }
        ["pop"](_0x4ce15d, _0x2120b0, _0x272aea = "") {
          {
            let _0x3af129 = _0x272aea;
            _0x4ce15d?.["ytreporPnwOsah".split("").reverse().join("")](_0x2120b0) && (_0x3af129 = _0x4ce15d[_0x2120b0], delete _0x4ce15d[_0x2120b0]);
            return _0x3af129;
          }
        }
        ["copy"](_0x3d5675) {
          return Object.assign({}, _0x3d5675);
        }
        ["read_env"](_0x4bcb87) {
          let _0x1a7889 = _0x5dcb01.map(_0x4310e6 => process.env[_0x4310e6]);
          for (let _0x606e30 of _0x1a7889.filter(_0x453b93 => !!_0x453b93)) {
            for (let _0x198550 of _0x606e30.split(_0xed67c1).filter(_0x3bf24a => !!_0x3bf24a)) {
              if (this.userList.includes(_0x198550)) {
                continue;
              }
              this.userList.push(new _0x4bcb87(_0x198550));
            }
          }
          this.userCount = this.userList.length;
          if (!this.userCount) {
            const _0x49da5b = {
              "notify": true
            };
            this.log("未找到变量，请检查变量" + _0x5dcb01.map(_0x1b005b => "[" + _0x1b005b + "]").join("或"), _0x49da5b);
            return false;
          }
          this.log("到找共".split("").reverse().join("") + this.userCount + "个账号");
          return true;
        }
        ["time"](_0x49ad16, _0x2b5063 = null) {
          {
            let _0x31a923 = _0x2b5063 ? new Date(_0x2b5063) : new Date(),
              _0x55fc08 = {
                "M+": _0x31a923.getMonth() + 1,
                "d+": _0x31a923.getDate(),
                "h+": _0x31a923.getHours(),
                "m+": _0x31a923.getMinutes(),
                "s+": _0x31a923.getSeconds(),
                "q+": Math.floor((_0x31a923.getMonth() + 3) / 3),
                "S": this.padStr(_0x31a923.getMilliseconds(), 3)
              };
            new RegExp(")+y(".split("").reverse().join(""), "").test(_0x49ad16) && (_0x49ad16 = _0x49ad16.replace(RegExp.$1, (_0x31a923.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let _0x301ea9 in _0x55fc08) new RegExp("(" + _0x301ea9 + ")").test(_0x49ad16) && (_0x49ad16 = _0x49ad16.replace(RegExp.$1, 1 == RegExp.$1.length ? _0x55fc08[_0x301ea9] : ("00" + _0x55fc08[_0x301ea9]).substr(("" + _0x55fc08[_0x301ea9]).length)));
            return _0x49ad16;
          }
        }
        async ["showmsg"]() {
          if (!this.notifyFlag) return;
          if (!this.notifyStr.length) return;
          var _0x5b49dd = require("./sendNotify");
          this.log("\n============== 推送 ==============");
          await _0x5b49dd.sendNotify(this.name, this.notifyStr.join("\n"));
        }
        ["padStr"](_0x512e4d, _0x1b10cc, _0x42a247 = {}) {
          let _0x2d42d6 = _0x42a247.padding || "0",
            _0x451531 = _0x42a247.mode || "l",
            _0x5a8b0c = String(_0x512e4d),
            _0x1903c4 = _0x1b10cc > _0x5a8b0c.length ? _0x1b10cc - _0x5a8b0c.length : 0,
            _0x585dc1 = "";
          for (let _0x3a78c2 = 0; _0x3a78c2 < _0x1903c4; _0x3a78c2++) {
            _0x585dc1 += _0x2d42d6;
          }
          _0x451531 == "r" ? _0x5a8b0c = _0x5a8b0c + _0x585dc1 : _0x5a8b0c = _0x585dc1 + _0x5a8b0c;
          return _0x5a8b0c;
        }
        ["json2str"](_0x3eed1a, _0x2277e1, _0x2069f6 = false) {
          {
            let _0x3af26c = [];
            for (let _0x301b83 of Object.keys(_0x3eed1a).sort()) {
              let _0x4baceb = _0x3eed1a[_0x301b83];
              if (_0x4baceb && _0x2069f6) {
                _0x4baceb = encodeURIComponent(_0x4baceb);
              }
              _0x3af26c.push(_0x301b83 + "=" + _0x4baceb);
            }
            return _0x3af26c.join(_0x2277e1);
          }
        }
        ["str2json"](_0x45d5f2, _0x2ce388 = false) {
          {
            let _0x2c969d = {};
            for (let _0x576f5e of _0x45d5f2.split("&")) {
              if (!_0x576f5e) continue;
              let _0x2c2045 = _0x576f5e.indexOf("=");
              if (_0x2c2045 == -1) {
                continue;
              }
              let _0x5057c3 = _0x576f5e.substr(0, _0x2c2045),
                _0x1775cc = _0x576f5e.substr(_0x2c2045 + 1);
              _0x2ce388 && (_0x1775cc = decodeURIComponent(_0x1775cc));
              _0x2c969d[_0x5057c3] = _0x1775cc;
            }
            return _0x2c969d;
          }
        }
        ["randomPattern"](_0x17c712, _0x20d7b2 = "abcdef0123456789") {
          let _0x1e24a4 = "";
          for (let _0x437e45 of _0x17c712) {
            {
              if (_0x437e45 == "x") _0x1e24a4 += _0x20d7b2.charAt(Math.floor(Math.random() * _0x20d7b2.length));else {
                _0x437e45 == "X" ? _0x1e24a4 += _0x20d7b2.charAt(Math.floor(Math.random() * _0x20d7b2.length)).toUpperCase() : _0x1e24a4 += _0x437e45;
              }
            }
          }
          return _0x1e24a4;
        }
        ["randomUuid"]() {
          return this.randomPattern("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
        }
        ["randomString"](_0x50286f, _0x4e74ca = "9876543210fedcba".split("").reverse().join("")) {
          {
            let _0x20743d = "";
            for (let _0x2d3169 = 0; _0x2d3169 < _0x50286f; _0x2d3169++) {
              _0x20743d += _0x4e74ca.charAt(Math.floor(Math.random() * _0x4e74ca.length));
            }
            return _0x20743d;
          }
        }
        ["randomList"](_0x161639) {
          let _0x5ac11c = Math.floor(Math.random() * _0x161639.length);
          return _0x161639[_0x5ac11c];
        }
        ["wait"](_0x518432) {
          return new Promise(_0x3b888a => setTimeout(_0x3b888a, _0x518432));
        }
        async ["exitNow"]() {
          await this.showmsg();
          let _0x1b5003 = Date.now(),
            _0x45c91d = (_0x1b5003 - this.startTime) / 1000;
          this.log("");
          const _0x170131 = {
            "time": true
          };
          this.log("[" + this.name + "了行运共，束结行运]".split("").reverse().join("") + _0x45c91d + "秒", _0x170131);
          process.exit(0);
        }
        ["normalize_time"](_0x52a126, _0xea5f47 = {}) {
          {
            let _0x54f8e5 = _0xea5f47.len || this.default_timestamp_len;
            _0x52a126 = _0x52a126.toString();
            let _0x2a4248 = _0x52a126.length;
            while (_0x2a4248 < _0x54f8e5) {
              _0x52a126 += "0";
            }
            _0x2a4248 > _0x54f8e5 && (_0x52a126 = _0x52a126.slice(0, 13));
            return parseInt(_0x52a126);
          }
        }
        async ["wait_until"](_0x549baf, _0xbd7457 = {}) {
          let _0x35f3ea = _0xbd7457.logger || this,
            _0x475b69 = _0xbd7457.interval || this.default_wait_interval,
            _0x5ed611 = _0xbd7457.limit || this.default_wait_limit,
            _0x17e7fa = _0xbd7457.ahead || this.default_wait_ahead;
          if (typeof _0x549baf == "string" && _0x549baf.includes(":")) {
            if (_0x549baf.includes("-")) _0x549baf = new Date(_0x549baf).getTime();else {
              {
                let _0x4619cd = this.time("yyyy-MM-dd ");
                _0x549baf = new Date(_0x4619cd + _0x549baf).getTime();
              }
            }
          }
          let _0x1cd343 = this.normalize_time(_0x549baf) - _0x17e7fa,
            _0x50d161 = this.time("S.ss:mm:hh".split("").reverse().join(""), _0x1cd343),
            _0x3628a2 = Date.now();
          _0x3628a2 > _0x1cd343 && (_0x1cd343 += 86400000);
          let _0x2fb0c8 = _0x1cd343 - _0x3628a2;
          if (_0x2fb0c8 > _0x5ed611) {
            const _0x2e3e5c = {
              "time": true
            };
            _0x35f3ea.log("[间时标目离".split("").reverse().join("") + _0x50d161 + "于大]".split("").reverse().join("") + _0x5ed611 / 1000 + "秒,不等待", _0x2e3e5c);
          } else {
            const _0xe9ac59 = {
              "time": true
            };
            _0x35f3ea.log("[间时标目离".split("").reverse().join("") + _0x50d161 + "]还有" + _0x2fb0c8 / 1000 + "待等始开,秒".split("").reverse().join(""), _0xe9ac59);
            while (_0x2fb0c8 > 0) {
              {
                let _0x2b13e7 = Math.min(_0x2fb0c8, _0x475b69);
                await this.wait(_0x2b13e7);
                _0x3628a2 = Date.now();
                _0x2fb0c8 = _0x1cd343 - _0x3628a2;
              }
            }
            const _0x4fbb80 = {
              "time": true
            };
            _0x35f3ea.log("待等成完已".split("").reverse().join(""), _0x4fbb80);
          }
        }
        async ["wait_gap_interval"](_0x3610c9, _0x1513c8) {
          let _0x4fcaad = Date.now() - _0x3610c9;
          _0x4fcaad < _0x1513c8 && (await this.wait(_0x1513c8 - _0x4fcaad));
        }
      }(_0x58fdd8);
    }
  })();