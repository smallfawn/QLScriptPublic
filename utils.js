/* 
*	感谢yml大佬js封装库  当前版本V0.0.5
*   22/11/21 随机生成GUID
*   22/11/23 随机生成MAC网络地址
*   22/11/28 随机一言 自建和其他 gitee版和github版 优先gitee 速度快
*/
let utilsVersion = "0.0.5"
module.exports = {
    version: version,//版本
    txt_api: txt_api,//获取随机文案 一言api // "a"动画, "b"漫画, "c"游戏, "d"文学, "e"原创, "f"来自网络, "g"其他, "h"影视, "i"诗词, "j"网易云, "k"哲学 ,"l"抖机灵
    txt_api_self_gitee: txt_api_self_gitee,//获取随机文案 gitee版本 自建 // 古诗, 动画, 心情 ······
    txt_api_self_github: txt_api_self_github,//获取随机文案 github版本 自建 // 古诗, 动画, 心情 ······
    randomMac: randomMac,//随机MAC网络地址
    guid: guid,//根据时间戳生成GUID 8-4-4-4-12
    phone_num: phone_num,//手机号中间遮挡
    randomszdx: randomszdx,//随机 数字 + 大写字母 生成
    randomszxx: randomszxx,//随机 数字 + 小写字母 生成
    randomInt: randomInt,//随机整数生成
    ts13: ts13,//时间戳 13位
    ts10: ts10,//时间戳 10位
    tmtoDate: tmtoDate,//时间戳 转 日期
    local_hours: local_hours,//获取当前小时数
    local_minutes: local_minutes,//获取当前分钟数
    local_year: local_year,//获取当前年份 2022
    local_month: local_month,//获取当前月份(数字)  5月
    local_month_two: local_month_two,//获取当前月份(数字)  05月 补零
    local_day: local_day,//获取当前天数(数字)  5日
    local_day_two: local_day_two,//获取当前天数  05日 补零
    RSA_Encrypt: RSA_Encrypt,//RSA公钥加密  传参(数据,key) , 返回 base64格式
    base64_encode: base64_encode,//base64 编码
    base64_decode: base64_decode,//base64 解码
    SHA1_Encrypt: SHA1_Encrypt,//SHA1加密
    SHA256_Encrypt: SHA256_Encrypt,//SHA256加密
    MD5_Encrypt: MD5_Encrypt,//md5 加密
};

/**
 * 版本号
 */
function version() {
    return utilsVersion;
}

/**
 * 获取随机文案 一言api
 */
function txt_api(i) {
    return new Promise((resolve) => {
        try {
            var request = require('request');
            let options = {
                method: 'GET',
                url: 'https://v1.hitokoto.cn/',
                qs: { c: i },
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                //console.log(body);
                let result = JSON.parse(body);
                let txt = result.hitokoto
                //console.log(result.id);
                resolve(txt)
                return txt
            });
        } catch (error) {
            console.log(error);
        }
    })
}

/**
 * 获取随机文案 自建 gitee仓库
 */
function txt_api_self_gitee(type) {
    return new Promise((resolve) => {
        try {
            var request = require('request');
            let options = {
                method: 'GET',
                url: 'https://gitee.com/smallfawn/api/raw/master/txt.txt',
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                let txtbody = body
                //console.log(body);
                let txtv = txtbody.match(type)
                //console.log(txtv.input.slice(3, 14));
                let lineArr = txtv.input.slice(3, 14)//截取行段文本
                let lineStar = lineArr.slice(1, 5)//首行
                let lineEnd = lineArr.slice(6, 10)//尾行
                let randomline = randomInt(Number(lineStar) - 1, Number(lineEnd) - 1)//随机行 因为JS的索引号是0,和行号不一致所以就-1 检测行数比实际行数大1
                let txt = txtbody.split("\n")[randomline]
                //console.log(lineArr);
                //console.log(lineStar, lineEnd);
                //console.log(Number(lineStar) -1, Number(lineEnd) -1);
                //console.log(randomline);
                //console.log(txt);
                resolve(txt)
                return txt
            });
        } catch (error) {
            console.log(error);
        }
    })
}

/**
 * 获取随机文案 自建 github仓库
 */
function txt_api_self_github(type) {
    return new Promise((resolve) => {
        function txtline(type) {
            switch (type) {
                case "古诗": //古诗
                    return [2, 5]
                case "动画": //动画
                    return [3, 8]
                case "心情": //心情
                    return [3, 8]
            }
        }
        try {
            var request = require('request');
            let options = {
                method: 'GET',
                url: 'https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/api/main/txt.txt',//https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/api/main/txt.txt
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                let txtbody = body
                //console.log(body);
                let line = txtline(type)
                let randomline = randomInt(line[0] - 1, line[1] - 1)//随机行 因为JS的索引号是0,和行号不一致所以就-1 检测行数比实际行数大1
                //console.log(txt.split("\n")[randomline])
                let txt = txtbody.split("\n")[randomline]
                //console.log(txt);
                resolve(txt)
                return txt
            });
        } catch (error) {
            console.log(error);
        }
    })
}

/**
 * 随机MAC网络地址
 */
function randomMac() {
    return "XX:XX:XX:XX:XX:XX".replace(/X/g, function () {
        return "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16))
    });
}

/**
 * 随机UUID(由时间戳生成) 8-4-4-4-12
 */
function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

/**
 * 手机号中间遮挡
 */
function phone_num(phone_num) {
    if (phone_num.length == 11) {
        let data = phone_num.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
        return data;
    } else {
        return phone_num;
    }
}

/**
 * 随机 数字 + 大写字母 生成
 */
function randomszdx(e) {
    e = e || 32;
    var t = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890",
        a = t.length,
        n = "";

    for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n;
}

/**
 * 随机 数字 + 小写字母 生成
 */
function randomszxx(e) {
    e = e || 32;
    var t = "qwertyuioplkjhgfdsazxcvbnm1234567890",
        a = t.length,
        n = "";

    for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n;
}

/**
 * 随机整数生成
 */
function randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

/**
 * 时间戳 13位
 */
function ts13() {
    return Math.round(new Date().getTime()).toString();
}

/**
 * 时间戳 10位
 */
function ts10() {
    return Math.round(new Date().getTime() / 1000).toString();
}

/**
 * 时间戳 转 日期
 */
function tmtoDate(time = +new Date()) {
    if (time.toString().length == 13) {
        var date = new Date(time + 8 * 3600 * 1000);
        return date.toJSON().substr(0, 19).replace("T", " ");
    } else if (time.toString().length == 10) {
        time = time * 1000;
        var date = new Date(time + 8 * 3600 * 1000);
        return date.toJSON().substr(0, 19).replace("T", " ");
    }
}

/**
 * 获取当前小时数
 */
function local_hours() {
    let myDate = new Date();
    let h = myDate.getHours();
    return h;
}

/**
 * 获取当前分钟数
 */
function local_minutes() {
    let myDate = new Date();
    let m = myDate.getMinutes();
    return m;
}

/**
 * 获取当前年份 2022
 */
function local_year() {
    let myDate = new Date();
    y = myDate.getFullYear();
    return y;
}

/**
 * 获取当前月份(数字)  5月
 */
function local_month() {
    let myDate = new Date();
    let m = myDate.getMonth();
    return m;
}

/**
 * 获取当前月份(数字)  05月 补零
 */
function local_month_two() {
    let myDate = new Date();
    let m = myDate.getMonth();
    if (m.toString().length == 1) {
        m = `0${m}`;
    }
    return m;
}

/**
 * 获取当前天数(数字)  5日
 */
function local_day() {
    let myDate = new Date();
    let d = myDate.getDate();
    return d;
}

/**
 * 获取当前天数  05日 补零
 */
function local_day_two() {
    let myDate = new Date();
    let d = myDate.getDate();
    if (d.toString().length == 1) {
        d = `0${d}`;
    }
    return d;
}

/**
 * RSA公钥加密  传参(数据,key) , 返回 base64格式
 */
function RSA_Encrypt(msg, key) {
    global.navigator = { appName: 'nodejs' }; // fake the navigator object
    global.window = {}; // fake the window object
    const JSEncrypt = require('jsencrypt')
    let enc = new JSEncrypt();
    enc.setPublicKey(key)
    return enc.encrypt(msg).toString();
}

/**
 * base64 编码  
 */
function base64_encode(data) {
    let a = Buffer.from(data, 'utf-8').toString('base64')
    return a
}

/**
 * base64 解码  
 */
function base64_decode(data) {
    let a = Buffer.from(data, 'base64').toString('utf8')
    return a
}

/**
 * SHA1 加密  
 */
function SHA1_Encrypt(s) {
    var data = new Uint8Array(encodeUTF8(s))
    var i, j, t;
    var l = ((data.length + 8) >>> 6 << 4) + 16, s = new Uint8Array(l << 2);
    s.set(new Uint8Array(data.buffer)), s = new Uint32Array(s.buffer);
    for (t = new DataView(s.buffer), i = 0; i < l; i++)s[i] = t.getUint32(i << 2);
    s[data.length >> 2] |= 0x80 << (24 - (data.length & 3) * 8);
    s[l - 1] = data.length << 3;
    var w = [], f = [
        function () { return m[1] & m[2] | ~m[1] & m[3]; },
        function () { return m[1] ^ m[2] ^ m[3]; },
        function () { return m[1] & m[2] | m[1] & m[3] | m[2] & m[3]; },
        function () { return m[1] ^ m[2] ^ m[3]; }
    ], rol = function (n, c) { return n << c | n >>> (32 - c); },
        k = [1518500249, 1859775393, -1894007588, -899497514],
        m = [1732584193, -271733879, null, null, -1009589776];
    m[2] = ~m[0], m[3] = ~m[1];
    for (i = 0; i < s.length; i += 16) {
        var o = m.slice(0);
        for (j = 0; j < 80; j++)
            w[j] = j < 16 ? s[i + j] : rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1),
                t = rol(m[0], 5) + f[j / 20 | 0]() + m[4] + w[j] + k[j / 20 | 0] | 0,
                m[1] = rol(m[1], 30), m.pop(), m.unshift(t);
        for (j = 0; j < 5; j++)m[j] = m[j] + o[j] | 0;
    };
    t = new DataView(new Uint32Array(m).buffer);
    for (var i = 0; i < 5; i++)m[i] = t.getUint32(i << 2);

    var hex = Array.prototype.map.call(new Uint8Array(new Uint32Array(m).buffer), function (e) {
        return (e < 16 ? "0" : "") + e.toString(16);
    }).join("");
    return hex;
}
function encodeUTF8(s) {
    var i, r = [], c, x;
    for (i = 0; i < s.length; i++)
        if ((c = s.charCodeAt(i)) < 0x80) r.push(c);
        else if (c < 0x800) r.push(0xC0 + (c >> 6 & 0x1F), 0x80 + (c & 0x3F));
        else {
            if ((x = c ^ 0xD800) >> 10 == 0) //对四字节UTF-16转换为Unicode
                c = (x << 10) + (s.charCodeAt(++i) ^ 0xDC00) + 0x10000,
                    r.push(0xF0 + (c >> 18 & 0x7), 0x80 + (c >> 12 & 0x3F));
            else r.push(0xE0 + (c >> 12 & 0xF));
            r.push(0x80 + (c >> 6 & 0x3F), 0x80 + (c & 0x3F));
        };
    return r;
}

/**
 * SHA256 加密  
 */
function SHA256_Encrypt(data) {
    sha256_init();
    sha256_update(data, data.length);
    sha256_final();
    return sha256_encode_hex();
}
/* SHA256 logical functions */ function rotateRight(n, x) { return (x >>> n) | (x << (32 - n)); } function choice(x, y, z) { return (x & y) ^ (~x & z); } function majority(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); } function sha256_Sigma0(x) { return rotateRight(2, x) ^ rotateRight(13, x) ^ rotateRight(22, x); } function sha256_Sigma1(x) { return rotateRight(6, x) ^ rotateRight(11, x) ^ rotateRight(25, x); } function sha256_sigma0(x) { return rotateRight(7, x) ^ rotateRight(18, x) ^ (x >>> 3); } function sha256_sigma1(x) { return rotateRight(17, x) ^ rotateRight(19, x) ^ (x >>> 10); } function sha256_expand(W, j) { return (W[j & 0x0f] += sha256_sigma1(W[(j + 14) & 0x0f]) + W[(j + 9) & 0x0f] + sha256_sigma0(W[(j + 1) & 0x0f])); } /* Hash constant words K: */ var K256 = new Array(0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2); /* global arrays */ var ihash, count, buffer; var sha256_hex_digits = "0123456789abcdef"; /* Add 32-bit integers with 16-bit operations (bug in some JS-interpreters: overflow) */ function safe_add(x, y) { var lsw = (x & 0xffff) + (y & 0xffff); var msw = (x >> 16) + (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xffff); } /* Initialise the SHA256 computation */ function sha256_init() { ihash = new Array(8); count = new Array(2); buffer = new Array(64); count[0] = count[1] = 0; ihash[0] = 0x6a09e667; ihash[1] = 0xbb67ae85; ihash[2] = 0x3c6ef372; ihash[3] = 0xa54ff53a; ihash[4] = 0x510e527f; ihash[5] = 0x9b05688c; ihash[6] = 0x1f83d9ab; ihash[7] = 0x5be0cd19; } /* Transform a 512-bit message block */ function sha256_transform() { var a, b, c, d, e, f, g, h, T1, T2; var W = new Array(16); /* Initialize registers with the previous intermediate value */ a = ihash[0]; b = ihash[1]; c = ihash[2]; d = ihash[3]; e = ihash[4]; f = ihash[5]; g = ihash[6]; h = ihash[7]; /* make 32-bit words */ for (var i = 0; i < 16; i++) W[i] = buffer[(i << 2) + 3] | (buffer[(i << 2) + 2] << 8) | (buffer[(i << 2) + 1] << 16) | (buffer[i << 2] << 24); for (var j = 0; j < 64; j++) { T1 = h + sha256_Sigma1(e) + choice(e, f, g) + K256[j]; if (j < 16) T1 += W[j]; else T1 += sha256_expand(W, j); T2 = sha256_Sigma0(a) + majority(a, b, c); h = g; g = f; f = e; e = safe_add(d, T1); d = c; c = b; b = a; a = safe_add(T1, T2); } /* Compute the current intermediate hash value */ ihash[0] += a; ihash[1] += b; ihash[2] += c; ihash[3] += d; ihash[4] += e; ihash[5] += f; ihash[6] += g; ihash[7] += h; } /* Read the next chunk of data and update the SHA256 computation */ function sha256_update(data, inputLen) { var i, index, curpos = 0; /* Compute number of bytes mod 64 */ index = (count[0] >> 3) & 0x3f; var remainder = inputLen & 0x3f; /* Update number of bits */ if ((count[0] += inputLen << 3) < inputLen << 3) count[1]++; count[1] += inputLen >> 29; /* Transform as many times as possible */ for (i = 0; i + 63 < inputLen; i += 64) { for (var j = index; j < 64; j++) buffer[j] = data.charCodeAt(curpos++); sha256_transform(); index = 0; } /* Buffer remaining input */ for (var j = 0; j < remainder; j++) buffer[j] = data.charCodeAt(curpos++); } /* Finish the computation by operations such as padding */ function sha256_final() { var index = (count[0] >> 3) & 0x3f; buffer[index++] = 0x80; if (index <= 56) { for (var i = index; i < 56; i++) buffer[i] = 0; } else { for (var i = index; i < 64; i++) buffer[i] = 0; sha256_transform(); for (var i = 0; i < 56; i++) buffer[i] = 0; } buffer[56] = (count[1] >>> 24) & 0xff; buffer[57] = (count[1] >>> 16) & 0xff; buffer[58] = (count[1] >>> 8) & 0xff; buffer[59] = count[1] & 0xff; buffer[60] = (count[0] >>> 24) & 0xff; buffer[61] = (count[0] >>> 16) & 0xff; buffer[62] = (count[0] >>> 8) & 0xff; buffer[63] = count[0] & 0xff; sha256_transform(); } /* Split the internal hash values into an array of bytes */ function sha256_encode_bytes() { var j = 0; var output = new Array(32); for (var i = 0; i < 8; i++) { output[j++] = (ihash[i] >>> 24) & 0xff; output[j++] = (ihash[i] >>> 16) & 0xff; output[j++] = (ihash[i] >>> 8) & 0xff; output[j++] = ihash[i] & 0xff; } return output; } /* Get the internal hash as a hex string */ function sha256_encode_hex() { var output = new String(); for (var i = 0; i < 8; i++) { for (var j = 28; j >= 0; j -= 4) output += sha256_hex_digits.charAt((ihash[i] >>> j) & 0x0f); } return output; }

/**
 * md5 加密
 */
function MD5_Encrypt(a) { function b(a, b) { return (a << b) | (a >>> (32 - b)); } function c(a, b) { var c, d, e, f, g; return ((e = 2147483648 & a), (f = 2147483648 & b), (c = 1073741824 & a), (d = 1073741824 & b), (g = (1073741823 & a) + (1073741823 & b)), c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f : g ^ e ^ f); } function d(a, b, c) { return (a & b) | (~a & c); } function e(a, b, c) { return (a & c) | (b & ~c); } function f(a, b, c) { return a ^ b ^ c; } function g(a, b, c) { return b ^ (a | ~c); } function h(a, e, f, g, h, i, j) { return (a = c(a, c(c(d(e, f, g), h), j))), c(b(a, i), e); } function i(a, d, f, g, h, i, j) { return (a = c(a, c(c(e(d, f, g), h), j))), c(b(a, i), d); } function j(a, d, e, g, h, i, j) { return (a = c(a, c(c(f(d, e, g), h), j))), c(b(a, i), d); } function k(a, d, e, f, h, i, j) { return (a = c(a, c(c(g(d, e, f), h), j))), c(b(a, i), d); } function l(a) { for (var b, c = a.length, d = c + 8, e = (d - (d % 64)) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i = 0; c > i;) (b = (i - (i % 4)) / 4), (h = (i % 4) * 8), (g[b] = g[b] | (a.charCodeAt(i) << h)), i++; return ((b = (i - (i % 4)) / 4), (h = (i % 4) * 8), (g[b] = g[b] | (128 << h)), (g[f - 2] = c << 3), (g[f - 1] = c >>> 29), g); } function m(a) { var b, c, d = "", e = ""; for (c = 0; 3 >= c; c++) (b = (a >>> (8 * c)) & 255), (e = "0" + b.toString(16)), (d += e.substr(e.length - 2, 2)); return d; } function n(a) { a = a.replace(/\r\n/g, "\n"); for (var b = "", c = 0; c < a.length; c++) { var d = a.charCodeAt(c); 128 > d ? (b += String.fromCharCode(d)) : d > 127 && 2048 > d ? ((b += String.fromCharCode((d >> 6) | 192)), (b += String.fromCharCode((63 & d) | 128))) : ((b += String.fromCharCode((d >> 12) | 224)), (b += String.fromCharCode(((d >> 6) & 63) | 128)), (b += String.fromCharCode((63 & d) | 128))); } return b; } var o, p, q, r, s, t, u, v, w, x = [], y = 7, z = 12, A = 17, B = 22, C = 5, D = 9, E = 14, F = 20, G = 4, H = 11, I = 16, J = 23, K = 6, L = 10, M = 15, N = 21; for (a = n(a), x = l(a), t = 1732584193, u = 4023233417, v = 2562383102, w = 271733878, o = 0; o < x.length; o += 16) (p = t), (q = u), (r = v), (s = w), (t = h(t, u, v, w, x[o + 0], y, 3614090360)), (w = h(w, t, u, v, x[o + 1], z, 3905402710)), (v = h(v, w, t, u, x[o + 2], A, 606105819)), (u = h(u, v, w, t, x[o + 3], B, 3250441966)), (t = h(t, u, v, w, x[o + 4], y, 4118548399)), (w = h(w, t, u, v, x[o + 5], z, 1200080426)), (v = h(v, w, t, u, x[o + 6], A, 2821735955)), (u = h(u, v, w, t, x[o + 7], B, 4249261313)), (t = h(t, u, v, w, x[o + 8], y, 1770035416)), (w = h(w, t, u, v, x[o + 9], z, 2336552879)), (v = h(v, w, t, u, x[o + 10], A, 4294925233)), (u = h(u, v, w, t, x[o + 11], B, 2304563134)), (t = h(t, u, v, w, x[o + 12], y, 1804603682)), (w = h(w, t, u, v, x[o + 13], z, 4254626195)), (v = h(v, w, t, u, x[o + 14], A, 2792965006)), (u = h(u, v, w, t, x[o + 15], B, 1236535329)), (t = i(t, u, v, w, x[o + 1], C, 4129170786)), (w = i(w, t, u, v, x[o + 6], D, 3225465664)), (v = i(v, w, t, u, x[o + 11], E, 643717713)), (u = i(u, v, w, t, x[o + 0], F, 3921069994)), (t = i(t, u, v, w, x[o + 5], C, 3593408605)), (w = i(w, t, u, v, x[o + 10], D, 38016083)), (v = i(v, w, t, u, x[o + 15], E, 3634488961)), (u = i(u, v, w, t, x[o + 4], F, 3889429448)), (t = i(t, u, v, w, x[o + 9], C, 568446438)), (w = i(w, t, u, v, x[o + 14], D, 3275163606)), (v = i(v, w, t, u, x[o + 3], E, 4107603335)), (u = i(u, v, w, t, x[o + 8], F, 1163531501)), (t = i(t, u, v, w, x[o + 13], C, 2850285829)), (w = i(w, t, u, v, x[o + 2], D, 4243563512)), (v = i(v, w, t, u, x[o + 7], E, 1735328473)), (u = i(u, v, w, t, x[o + 12], F, 2368359562)), (t = j(t, u, v, w, x[o + 5], G, 4294588738)), (w = j(w, t, u, v, x[o + 8], H, 2272392833)), (v = j(v, w, t, u, x[o + 11], I, 1839030562)), (u = j(u, v, w, t, x[o + 14], J, 4259657740)), (t = j(t, u, v, w, x[o + 1], G, 2763975236)), (w = j(w, t, u, v, x[o + 4], H, 1272893353)), (v = j(v, w, t, u, x[o + 7], I, 4139469664)), (u = j(u, v, w, t, x[o + 10], J, 3200236656)), (t = j(t, u, v, w, x[o + 13], G, 681279174)), (w = j(w, t, u, v, x[o + 0], H, 3936430074)), (v = j(v, w, t, u, x[o + 3], I, 3572445317)), (u = j(u, v, w, t, x[o + 6], J, 76029189)), (t = j(t, u, v, w, x[o + 9], G, 3654602809)), (w = j(w, t, u, v, x[o + 12], H, 3873151461)), (v = j(v, w, t, u, x[o + 15], I, 530742520)), (u = j(u, v, w, t, x[o + 2], J, 3299628645)), (t = k(t, u, v, w, x[o + 0], K, 4096336452)), (w = k(w, t, u, v, x[o + 7], L, 1126891415)), (v = k(v, w, t, u, x[o + 14], M, 2878612391)), (u = k(u, v, w, t, x[o + 5], N, 4237533241)), (t = k(t, u, v, w, x[o + 12], K, 1700485571)), (w = k(w, t, u, v, x[o + 3], L, 2399980690)), (v = k(v, w, t, u, x[o + 10], M, 4293915773)), (u = k(u, v, w, t, x[o + 1], N, 2240044497)), (t = k(t, u, v, w, x[o + 8], K, 1873313359)), (w = k(w, t, u, v, x[o + 15], L, 4264355552)), (v = k(v, w, t, u, x[o + 6], M, 2734768916)), (u = k(u, v, w, t, x[o + 13], N, 1309151649)), (t = k(t, u, v, w, x[o + 4], K, 4149444226)), (w = k(w, t, u, v, x[o + 11], L, 3174756917)), (v = k(v, w, t, u, x[o + 2], M, 718787259)), (u = k(u, v, w, t, x[o + 9], N, 3951481745)), (t = c(t, p)), (u = c(u, q)), (v = c(v, r)), (w = c(w, s)); var O = m(t) + m(u) + m(v) + m(w); return O.toLowerCase(); }
