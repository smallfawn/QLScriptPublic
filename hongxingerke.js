
/*
    name: "鸿星尔克"
    cron: 10 30 9 * * *

*/
const logo0 = "logo0"
const logo = "logo"    
let sheetNameSubConfig = "hxek"; // 分配置表名称（修改这里，这里填表的名称，需要和UPDATE文件中的一致，自定义的）
let pushHeader = "【鸿星尔克】";    //（修改这里，这里给自己看的，随便填）
let sheetNameConfig = "CONFIG"; // 总配置表
let sheetNamePush = "PUSH"; // 推送表名称
let sheetNameEmail = "EMAIL"; // 邮箱表
let flagSubConfig = 0; // 激活分配置工作表标志
let flagConfig = 0; // 激活主配置工作表标志
let flagPush = 0; // 激活推送工作表标志
let line = 21; // 指定读取从第2行到第line行的内容
var message = ""; // 待发送的消息
var messageArray = [];  // 待发送的消息数据，每个元素都是某个账号的消息。目的是将不同用户消息分离，方便个性化消息配置
var messageOnlyError = 0; // 0为只推送失败消息，1则为推送成功消息。
var messageNickname = 0; // 1为推送位置标识（昵称/单元格Ax（昵称为空时）），0为不推送位置标识
var messageHeader = []; // 存放每个消息的头部，如：单元格A3。目的是分离附加消息和执行结果消息
var messagePushHeader = pushHeader; // 存放在总消息的头部，默认是pushHeader,如：【xxxx】

var jsonPush = [
  { name: "bark", key: "xxxxxx", flag: "0" },
  { name: "pushplus", key: "xxxxxx", flag: "0" },
  { name: "ServerChan", key: "xxxxxx", flag: "0" },
  { name: "email", key: "xxxxxx", flag: "0" },
  { name: "dingtalk", key: "xxxxxx", flag: "0" },
  { name: "discord", key: "xxxxxx", flag: "0" },
]; // 推送数据，flag=1则推送
var jsonEmail = {
  server: "",
  port: "",
  sender: "",
  authorizationCode: "",
}; // 有效邮箱配置

// =================青龙适配开始===================

// 艾默库青龙适配代码
// v2.4.1  

var userContent=[["\u0063\u006f\u006f\u006b\u0069\u0065\u0028\u9ed8\u8ba4\u0032\u0030\u4e2a\u0029",")\u5426/\u662F(\u884C\u6267\u5426\u662F".split("").reverse().join(""),"\u8d26\u53f7\u540d\u79f0\u0028\u53ef\u4e0d\u586b\u5199\u0029"]];var configContent=[["\u79F0\u540D\u7684\u8868\u4F5C\u5DE5".split("").reverse().join(""),"\u6CE8\u5907".split("").reverse().join(""),"\u53ea\u63a8\u9001\u5931\u8d25\u6d88\u606f\uff08\u662f\u002f\u5426\uff09","\uFF09\u5426/\u662F\uFF08\u79F0\u6635\u9001\u63A8".split("").reverse().join("")],[sheetNameSubConfig,pushHeader,"\u5426","\u662f"]];var qlpushFlag=0x3a049^0x3a049;var qlSheet=[];var colNum=["\u0041",'B',"\u0043",'D',"\u0045","\u0046",'G','H','I',"\u004a",'K',"\u004c","\u004d","\u004e","\u004f",'P',"\u0051"];qlConfig={'CONFIG':configContent,'SUBCONFIG':userContent};var posHttp=0x7f376^0x7f376;var flagFinish=0x688a5^0x688a5;var flagResultFinish=0x34666^0x34666;var HTTPOverwrite={'get':function get(_0x58ee64,_0x23e74e){_0x23e74e=_0x23e74e['headers'];let _0xad7bf=userContent["\u006c\u0065\u006e\u0067\u0074\u0068"]-qlpushFlag;method="teg".split("").reverse().join("");resp=fetch(_0x58ee64,{"\u006d\u0065\u0074\u0068\u006f\u0064":method,'headers':_0x23e74e})["\u0074\u0068\u0065\u006e"](function(_0x1c5326){return _0x1c5326['text']()['then'](_0x38f13f=>{return{'status':_0x1c5326['status'],"\u0068\u0065\u0061\u0064\u0065\u0072\u0073":_0x1c5326["\u0068\u0065\u0061\u0064\u0065\u0072\u0073"],"\u0074\u0065\u0078\u0074":_0x38f13f,'response':_0x1c5326,"\u0070\u006f\u0073":_0xad7bf};});})["\u0074\u0068\u0065\u006e"](function(_0x5824b7){try{data=JSON["\u0070\u0061\u0072\u0073\u0065"](_0x5824b7['text']);return{"\u0073\u0074\u0061\u0074\u0075\u0073":_0x5824b7['status'],"\u0068\u0065\u0061\u0064\u0065\u0072\u0073":_0x5824b7["\u0068\u0065\u0061\u0064\u0065\u0072\u0073"],'json':function _0xe8691(){return data;},'text':function _0x29967f(){return _0x5824b7['text'];},'pos':_0x5824b7["\u0070\u006f\u0073"]};}catch(_0x1c7983){return{"\u0073\u0074\u0061\u0074\u0075\u0073":_0x5824b7["\u0073\u0074\u0061\u0074\u0075\u0073"],'headers':_0x5824b7["\u0068\u0065\u0061\u0064\u0065\u0072\u0073"],'json':null,"\u0074\u0065\u0078\u0074":function _0x489a51(){return _0x5824b7["\u0074\u0065\u0078\u0074"];},"\u0070\u006f\u0073":_0x5824b7['pos']};}})['then'](_0x377aa8=>{_0xad7bf=_0x377aa8['pos'];flagResultFinish=resultHandle(_0x377aa8,_0xad7bf);if(flagResultFinish==(0x425f6^0x425f7)){i=_0xad7bf+(0x41450^0x41451);for(;i<=line;i++){var _0xf812eb=Application["\u0052\u0061\u006e\u0067\u0065"]('A'+i)["\u0054\u0065\u0078\u0074"];var _0x5c1cff=Application['Range']("\u0042"+i)["\u0054\u0065\u0078\u0074"];if(_0xf812eb=="".split("").reverse().join("")){break;}if(_0x5c1cff=="\u662f"){console['log']("\uFF1A\u6237\u7528\u884C\u6267\u59CB\u5F00 \uDDD1\uD83E".split("").reverse().join("")+(parseInt(i)-(0x2920c^0x2920d)));flagResultFinish=0x9ee2d^0x9ee2d;execHandle(_0xf812eb,i);break;}}}if(_0xad7bf==userContent['length']&&flagResultFinish==(0xa66cc^0xa66cd)){flagFinish=0xb4227^0xb4226;}if(qlpushFlag==(0x559b4^0x559b4)&&flagFinish==0x1){console["\u006c\u006f\u0067"]("\u9001\u63A8\u8D77\u53D1\u9F99\u9752 \uDE80\uD83D".split("").reverse().join(""));message=messageMerge();const{sendNotify:_0x581347}=require('./sendNotify.js');_0x581347(pushHeader,message);qlpushFlag=-0x64;}})['catch'](_0x347133=>{console['error']('Fetch\x20error:',_0x347133);});},'post':function post(_0x1f5035,_0x2d96f9,_0x2aa230,_0x226f44){_0x2aa230=_0x2aa230['headers'];contentType=_0x2aa230["\u0043\u006f\u006e\u0074\u0065\u006e\u0074\u002d\u0054\u0079\u0070\u0065"];contentType2=_0x2aa230['content-type'];var _0x3db254='';if(contentType!=undefined&&contentType!="".split("").reverse().join("")||contentType2!=undefined&&contentType2!="".split("").reverse().join("")){if(contentType=="\u0061\u0070\u0070\u006c\u0069\u0063\u0061\u0074\u0069\u006f\u006e\u002f\u0078\u002d\u0077\u0077\u0077\u002d\u0066\u006f\u0072\u006d\u002d\u0075\u0072\u006c\u0065\u006e\u0063\u006f\u0064\u0065\u0064"){console["\u006c\u006f\u0067"]("\u5F0F\u683C\u5355\u8868 :\u4E3A\u4F53\u6C42\u8BF7\u9001\u53D1\u5230\u6D4B\u68C0 \uDF73\uD83C".split("").reverse().join(""));_0x3db254=dataToFormdata(_0x2d96f9);}else{try{console["\u006c\u006f\u0067"]('🍳\x20检测到发送请求体为:\x20JSON格式');_0x3db254=JSON["\u0073\u0074\u0072\u0069\u006e\u0067\u0069\u0066\u0079"](_0x2d96f9);}catch{console['log']("\u5F0F\u683C\u5355\u8868 :\u4E3A\u4F53\u6C42\u8BF7\u9001\u53D1\u5230\u6D4B\u68C0 \uDF73\uD83C".split("").reverse().join(""));_0x3db254=_0x2d96f9;}}}else{console["\u006c\u006f\u0067"]('🍳\x20检测到发送请求体为:\x20JSON格式');_0x3db254=JSON["\u0073\u0074\u0072\u0069\u006e\u0067\u0069\u0066\u0079"](_0x2d96f9);}if(_0x226f44=='get'||_0x226f44=="\u0047\u0045\u0054"){let _0x335b35=userContent["\u006c\u0065\u006e\u0067\u0074\u0068"]-qlpushFlag;method='get';resp=fetch(_0x1f5035,{'method':method,"\u0068\u0065\u0061\u0064\u0065\u0072\u0073":_0x2aa230})['then'](function(_0x5d662a){return _0x5d662a['text']()['then'](_0x4888be=>{return{'status':_0x5d662a["\u0073\u0074\u0061\u0074\u0075\u0073"],'headers':_0x5d662a["\u0068\u0065\u0061\u0064\u0065\u0072\u0073"],"\u0074\u0065\u0078\u0074":_0x4888be,'response':_0x5d662a,"\u0070\u006f\u0073":_0x335b35};});})['then'](function(_0xb8dfc3){try{_0x2d96f9=JSON["\u0070\u0061\u0072\u0073\u0065"](_0xb8dfc3["\u0074\u0065\u0078\u0074"]);return{'status':_0xb8dfc3["\u0073\u0074\u0061\u0074\u0075\u0073"],"\u0068\u0065\u0061\u0064\u0065\u0072\u0073":_0xb8dfc3["\u0068\u0065\u0061\u0064\u0065\u0072\u0073"],'json':function _0x393c21(){return _0x2d96f9;},'text':function _0x36f803(){return _0xb8dfc3['text'];},"\u0070\u006f\u0073":_0xb8dfc3['pos']};}catch(_0x2baa13){return{'status':_0xb8dfc3['status'],'headers':_0xb8dfc3['headers'],"\u006a\u0073\u006f\u006e":null,'text':function _0x276181(){return _0xb8dfc3['text'];},'pos':_0xb8dfc3['pos']};}})["\u0074\u0068\u0065\u006e"](_0x170faf=>{_0x335b35=_0x170faf["\u0070\u006f\u0073"];flagResultFinish=resultHandle(_0x170faf,_0x335b35);if(flagResultFinish==0x1){i=_0x335b35+0x1;for(;i<=line;i++){var _0xcda32e=Application['Range']('A'+i)['Text'];var _0x163d26=Application['Range']('B'+i)['Text'];if(_0xcda32e=="".split("").reverse().join("")){break;}if(_0x163d26=='是'){console['log']("\uFF1A\u6237\u7528\u884C\u6267\u59CB\u5F00 \uDDD1\uD83E".split("").reverse().join("")+(parseInt(i)-(0x4ef16^0x4ef17)));flagResultFinish=0x0;execHandle(_0xcda32e,i);break;}}}if(_0x335b35==userContent['length']&&flagResultFinish==0x1){flagFinish=0x1;}if(qlpushFlag==(0x82d29^0x82d29)&&flagFinish==0x1){console['log']('青龙发起推送');message=messageMerge();const{sendNotify:_0x153845}=require("\u002e\u002f\u0073\u0065\u006e\u0064\u004e\u006f\u0074\u0069\u0066\u0079\u002e\u006a\u0073");_0x153845(pushHeader,message);qlpushFlag=-0x64;}})['catch'](_0x2e0a9a=>{console['error'](":rorre hcteF".split("").reverse().join(""),_0x2e0a9a);});}else{let _0x29e224=userContent['length']-qlpushFlag;method="tsop".split("").reverse().join("");resp=fetch(_0x1f5035,{'method':method,'headers':_0x2aa230,'body':_0x3db254})['then'](function(_0x5b997d){return _0x5b997d['text']()['then'](_0x3935fa=>{return{'status':_0x5b997d['status'],"\u0068\u0065\u0061\u0064\u0065\u0072\u0073":_0x5b997d['headers'],'text':_0x3935fa,'response':_0x5b997d,'pos':_0x29e224};});})['then'](function(_0x514309){try{_0x2d96f9=JSON["\u0070\u0061\u0072\u0073\u0065"](_0x514309['text']);return{"\u0073\u0074\u0061\u0074\u0075\u0073":_0x514309['status'],'headers':_0x514309['headers'],'json':function _0x1028f0(){return _0x2d96f9;},'text':function _0x9d25d(){return _0x514309['text'];},'pos':_0x514309['pos']};}catch(_0x147532){return{"\u0073\u0074\u0061\u0074\u0075\u0073":_0x514309['status'],"\u0068\u0065\u0061\u0064\u0065\u0072\u0073":_0x514309['headers'],'json':null,'text':function _0x5831a3(){return _0x514309['text'];},'pos':_0x514309["\u0070\u006f\u0073"]};}})['then'](_0x331df2=>{_0x29e224=_0x331df2['pos'];flagResultFinish=resultHandle(_0x331df2,_0x29e224);if(flagResultFinish==0x1){i=_0x29e224+0x1;for(;i<=line;i++){var _0x10c723=Application['Range']('A'+i)['Text'];var _0x32dcc8=Application["\u0052\u0061\u006e\u0067\u0065"]('B'+i)["\u0054\u0065\u0078\u0074"];if(_0x10c723==''){break;}if(_0x32dcc8=='是'){console['log']('🧑\x20开始执行用户：'+(parseInt(i)-0x1));flagResultFinish=0x69161^0x69161;execHandle(_0x10c723,i);break;}}}if(_0x29e224==userContent['length']&&flagResultFinish==0x1){flagFinish=0xbc4a2^0xbc4a3;}if(qlpushFlag==(0xab48a^0xab48a)&&flagFinish==0x1){console['log']("\u9001\u63A8\u8D77\u53D1\u9F99\u9752 \uDE80\uD83D".split("").reverse().join(""));let _0x4e8d15=messageMerge();const{sendNotify:_0x3b25a5}=require('./sendNotify.js');_0x3b25a5(pushHeader,_0x4e8d15);qlpushFlag=-(0x3426d^0x34209);}})['catch'](_0x1368d1=>{console['error'](":rorre hcteF".split("").reverse().join(""),_0x1368d1);});}}};var ApplicationOverwrite={'Range':function Range(_0x778d77){charFirst=_0x778d77['substring'](0x0,0x8132b^0x8132a);qlRow=_0x778d77['substring'](0x1,_0x778d77['length']);qlCol=0x1;for(num in colNum){if(colNum[num]==charFirst){break;}qlCol+=0x1;}try{result=qlSheet[qlRow-(0xc5d1c^0xc5d1d)][qlCol-(0x78bbf^0x78bbe)];}catch{result='';}dict={'Text':result};return dict;},'Sheets':{"\u0049\u0074\u0065\u006d":function(_0xa89467){return{"\u004e\u0061\u006d\u0065":_0xa89467,'Activate':function(){flag=0x1;qlSheet=qlConfig[_0xa89467];if(qlSheet==undefined){qlSheet=qlConfig["\u0053\u0055\u0042\u0043\u004f\u004e\u0046\u0049\u0047"];}console["\u006c\u006f\u0067"]('🍳\x20青龙激活工作表：'+_0xa89467);return flag;}};}}};var CryptoOverwrite={'createHash':function createHash(_0xbffd3c){return{'update':function _0x5c6593(_0x4028c9,_0x51656e){return{'digest':function _0x1c0ac8(_0x3c1125){return{'toUpperCase':function _0x4da1a3(){return{"\u0074\u006f\u0053\u0074\u0072\u0069\u006e\u0067":function _0xa609c(){let _0xd7f56d=require('crypto-js');let _0x5ef11e=_0xd7f56d['MD5'](_0x4028c9)['toString']();_0x5ef11e=_0x5ef11e['toUpperCase']();return _0x5ef11e;}};},'toString':function _0x2cf532(){const _0x3f0262=require('crypto-js');const _0x1158ca=_0x3f0262['MD5'](_0x4028c9)['toString']();return _0x1158ca;}};}};}};}};function dataToFormdata(_0x94b66c){result='';values=Object['values'](_0x94b66c);values['forEach']((_0x4fc62a,_0x665433)=>{key=Object['keys'](_0x94b66c)[_0x665433];content=key+'='+_0x4fc62a+'&';result+=content;});result=result['substring'](0x35095^0x35095,result['length']-(0xf3ca1^0xf3ca0));return result;}function cookiesTocookieMin(_0x5e662f){let _0x497b41=_0x5e662f;let _0x45a30b=[];var _0x355b81=_0x497b41['split']('#');for(let _0x39e20d in _0x355b81){_0x45a30b[_0x39e20d]=_0x355b81[_0x39e20d];}return _0x45a30b;}function checkEscape(_0x5eaa5a,_0x3b5175){cookieArrynew=[];j=0x8c1b2^0x8c1b2;for(i=0xd6308^0xd6308;i<_0x5eaa5a['length'];i++){result=_0x5eaa5a[i];lastChar=result['substring'](result['length']-(0xd697e^0xd697f),result['length']);if(lastChar=='\x5c'&&i<=_0x5eaa5a['length']-0x2){console['log']('🍳\x20检测到转义字符');cookieArrynew[j]=result['substring'](0x86976^0x86976,result['length']-0x1)+_0x3b5175+_0x5eaa5a[parseInt(i)+(0x4c713^0x4c712)];i+=0x1;}else{cookieArrynew[j]=_0x5eaa5a[i];}j+=0x1;}return cookieArrynew;}function cookiesTocookie(_0x507369){let _0x2e90ba=_0x507369;let _0x2f4298=[];let _0x426ccb=[];let _0x1cc909=_0x2e90ba['split']('@');_0x1cc909=checkEscape(_0x1cc909,'@');for(let _0x44b7a2 in _0x1cc909){_0x426ccb=[];let _0x350c7f=Number(_0x44b7a2)+(0x6fbdb^0x6fbda);_0x2f4298=cookiesTocookieMin(_0x1cc909[_0x44b7a2]);_0x2f4298=checkEscape(_0x2f4298,'#');_0x426ccb['push'](_0x2f4298[0xbaa7a^0xbaa7a]);_0x426ccb['push']('是');_0x426ccb['push']("\u79F0\u6635".split("").reverse().join("")+_0x350c7f);if(_0x2f4298["\u006c\u0065\u006e\u0067\u0074\u0068"]>(0x33cd8^0x33cd8)){for(let _0x59b30f=0x3;_0x59b30f<_0x2f4298['length']+(0xdfa43^0xdfa41);_0x59b30f++){_0x426ccb['push'](_0x2f4298[_0x59b30f-0x2]);}}userContent["\u0070\u0075\u0073\u0068"](_0x426ccb);}qlpushFlag=userContent['length']-0x1;}var qlSwitch=0xf0960^0xf0960;try{qlSwitch=process["\u0065\u006e\u0076"][sheetNameSubConfig];qlSwitch=0x1;console['log']('♻️\x20当前环境为青龙');console['log']("\u7801\u4EE3\u9F99\u9752\u884C\u6267\uFF0C\u5883\u73AF\u9F99\u9752\u914D\u9002\u59CB\u5F00 \uFE0F\u267B".split("").reverse().join(""));try{fetch=require('node-fetch');console["\u006c\u006f\u0067"]('♻️\x20系统无fetch，已进行node-fetch引入');}catch{console['log']('♻️\x20系统已有原生fetch');}Crypto=CryptoOverwrite;let flagwarn=0x0;const a='da11990c';const b="0b854f216a9662fb".split("").reverse().join("");encode=getsign(logo);let len=encode['length'];if(a+'ec4dce09'==encode['substring'](0xf3ac2^0xf3ac2,len/0x2)&&b==encode["\u0073\u0075\u0062\u0073\u0074\u0072\u0069\u006e\u0067"](0x4*(0x40675^0x40671),len)){console["\u006c\u006f\u0067"]('✨\x20'+logo);cookies=process['env'][sheetNameSubConfig];}else{console['log']('日志');flagwarn=0x1;}let flagwarn2=0x2ca7c^0x2ca7d;const welcome="edoc UKOM esu ot emocleW".split("").reverse().join("");const mo=welcome['slice'](0xb9607^0xb9608,0xe8f0f^0xe8f1e)['toLowerCase']();const ku=welcome['split']('\x20')[(0x99b1b^0x99b1f)-0x1]['slice'](0x2,0x4);if(mo['substring'](0x0,0x1)=='m'){if(ku=='KU'){if(mo['substring'](0x1,0x84877^0x84875)==String['fromCharCode'](0x371f7^0x37198)){cookiesTocookie(cookies);flagwarn2=0x0;console['log']('💗\x20'+welcome);}}}let t=Date["\u006e\u006f\u0077"]();if(t>0xaa*0x186a0*0x186a0+0x45f34a08e){console['log']("\u63A5\u94FEnoiton\u5E93\u4ED3\u770B\u67E5\u8BF7\u7A0B\u6559\u7528\u4F7F \uDDFE\uD83E".split("").reverse().join(""));Application=ApplicationOverwrite;}else{flagwarn=0x1;}if(Date["\u006e\u006f\u0077"]()<(0x51d0b^0x51dc3)*0x186a0*0x186a0){console['log']('日志');HTTP=HTTPOverwrite;}else{flagwarn2=0x1;}if(flagwarn==0x1||flagwarn2==(0x2b39b^0x2b39a)){console['log']('🔨\x20请使用艾');}}catch{qlSwitch=0x0;console["\u006c\u006f\u0067"]("\u6863\u6587\u5C71\u91D1\u4E3A\u5883\u73AF\u524D\u5F53 \uFE0F\u267B".split("").reverse().join(""));console['log']('♻️\x20开始适配金山文档，执行金山文档代码');}

// =================青龙适配结束===================

// =================金山适配开始===================
// 总推送
function push(message) {
  if (message != "") {
    // message = messagePushHeader + message // 消息头最前方默认存放：【xxxx】
    let length = jsonPush.length;
    let name;
    let key;
    for (let i = 0; i < length; i++) {
      if (jsonPush[i].flag == 1) {
        name = jsonPush[i].name;
        key = jsonPush[i].key;
        if (name == "bark") {
          bark(message, key);
        } else if (name == "pushplus") {
          pushplus(message, key);
        } else if (name == "ServerChan") {
          serverchan(message, key);
        } else if (name == "email") {
          email(message);
        } else if (name == "dingtalk") {
          dingtalk(message, key);
        } else if (name == "discord") {
          discord(message, key);
        }
      }
    }
  } else {
    console.log("🍳 消息为空不推送");
  }
}


// 推送bark消息
function bark(message, key) {
    if (key != "") {
      message = messagePushHeader + message // 消息头最前方默认存放：【xxxx】
      message = encodeURIComponent(message)
      BARK_ICON = "https://s21.ax1x.com/2025/01/11/p.png"
    let url = "https://api.day.app/" + key + "/" + message + "/" + "?icon=" + BARK_ICON;
    // 若需要修改推送的分组，则将上面一行改为如下的形式
    // let url = 'https://api.day.app/' + bark_id + "/" + message + "?group=分组名";
    let resp = HTTP.get(url, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    sleep(5000);
    }
}

// 推送pushplus消息
function pushplus(message, key) {
  if (key != "") {
      message = encodeURIComponent(message)
    // url = "http://www.pushplus.plus/send?token=" + key + "&content=" + message;
    url = "http://www.pushplus.plus/send?token=" + key + "&content=" + message + "&title=" + pushHeader;  // 增加标题
    let resp = HTTP.fetch(url, {
      method: "get",
    });
    sleep(5000);
  }
}

// 推送serverchan消息
function serverchan(message, key) {
  if (key != "") {
    url =
      "https://sctapi.ftqq.com/" +
      key +
      ".send" +
      "?title=" + messagePushHeader +
      "&desp=" +
      message;
    let resp = HTTP.fetch(url, {
      method: "get",
    });
    sleep(5000);
  }
}

// email邮箱推送
function email(message) {
  var myDate = new Date(); // 创建一个表示当前时间的 Date 对象
  var data_time = myDate.toLocaleDateString(); // 获取当前日期的字符串表示
  let server = jsonEmail.server;
  let port = parseInt(jsonEmail.port); // 转成整形
  let sender = jsonEmail.sender;
  let authorizationCode = jsonEmail.authorizationCode;

  let mailer;
  mailer = SMTP.login({
    host: server,
    port: port,
    username: sender,
    password: authorizationCode,
    secure: true,
  });
  mailer.send({
    from: pushHeader + "<" + sender + ">",
    to: sender,
    subject: pushHeader + " - " + data_time,
    text: message,
  });
  // console.log("🍳 已发送邮件至：" + sender);
  console.log("🍳 已发送邮件");
  sleep(5000);
}

// 邮箱配置
function emailConfig() {
  console.log("🍳 开始读取邮箱配置");
  let length = jsonPush.length; // 因为此json数据可无序，因此需要遍历
  let name;
  for (let i = 0; i < length; i++) {
    name = jsonPush[i].name;
    if (name == "email") {
      if (jsonPush[i].flag == 1) {
        let flag = ActivateSheet(sheetNameEmail); // 激活邮箱表
        // 邮箱表存在
        // var email = {
        //   'email':'', 'port':'', 'sender':'', 'authorizationCode':''
        // } // 有效配置
        if (flag == 1) {
          console.log("🍳 开始读取邮箱表");
          for (let i = 2; i <= 2; i++) {
            // 从工作表中读取推送数据
            jsonEmail.server = Application.Range("A" + i).Text;
            jsonEmail.port = Application.Range("B" + i).Text;
            jsonEmail.sender = Application.Range("C" + i).Text;
            jsonEmail.authorizationCode = Application.Range("D" + i).Text;
            if (Application.Range("A" + i).Text == "") {
              // 如果为空行，则提前结束读取
              break;
            }
          }
          // console.log(jsonEmail)
        }
        break;
      }
    }
  }
}

// 推送钉钉机器人
function dingtalk(message, key) {
  message = messagePushHeader + message // 消息头最前方默认存放：【xxxx】
  let url = "https://oapi.dingtalk.com/robot/send?access_token=" + key;
  let resp = HTTP.post(url, { msgtype: "text", text: { content: message } });
  // console.log(resp.text())
  sleep(5000);
}

// 推送Discord机器人
function discord(message, key) {
  message = messagePushHeader + message // 消息头最前方默认存放：【xxxx】
  let url = key;
  let resp = HTTP.post(url, { content: message });
  //console.log(resp.text())
  sleep(5000);
}

// =================金山适配结束===================

// =================共用开始===================
flagConfig = ActivateSheet(sheetNameConfig); // 激活推送表
// 主配置工作表存在
if (flagConfig == 1) {
  console.log("🍳 开始读取主配置表");
  let name; // 名称
  let onlyError;
  let nickname;
  for (let i = 2; i <= 100; i++) {
    // 从工作表中读取推送数据
    name = Application.Range("A" + i).Text;
    onlyError = Application.Range("C" + i).Text;
    nickname = Application.Range("D" + i).Text;
    if (name == "") {
      // 如果为空行，则提前结束读取
      break; // 提前退出，提高效率
    }
    if (name == sheetNameSubConfig) {
      if (onlyError == "是") {
        messageOnlyError = 1;
        console.log("🍳 只推送错误消息");
      }

      if (nickname == "是") {
        messageNickname = 1;
        console.log("🍳 单元格用昵称替代");
      }

      break; // 提前退出，提高效率
    }
  }
}

flagPush = ActivateSheet(sheetNamePush); // 激活推送表
// 推送工作表存在
if (flagPush == 1) {
  console.log("🍳 开始读取推送工作表");
  let pushName; // 推送类型
  let pushKey;
  let pushFlag; // 是否推送标志
  for (let i = 2; i <= line; i++) {
    // 从工作表中读取推送数据
    pushName = Application.Range("A" + i).Text;
    pushKey = Application.Range("B" + i).Text;
    pushFlag = Application.Range("C" + i).Text;
    if (pushName == "") {
      // 如果为空行，则提前结束读取
      break;
    }
    jsonPushHandle(pushName, pushFlag, pushKey);
  }
  // console.log(jsonPush)
}

// 邮箱配置函数
emailConfig();

flagSubConfig = ActivateSheet(sheetNameSubConfig); // 激活分配置表
if (flagSubConfig == 1) {
  console.log("🍳 开始读取分配置表");

    if(qlSwitch != 1){  // 金山文档
        for (let i = 2; i <= line; i++) {
            var cookie = Application.Range("A" + i).Text;
            var exec = Application.Range("B" + i).Text;
            if (cookie == "") {
                // 如果为空行，则提前结束读取
                break;
            }
            if (exec == "是") {
                execHandle(cookie, i);
            }
        }   
        message = messageMerge()// 将消息数组融合为一条总消息
        push(message); // 推送消息
    }else{
        for (let i = 2; i <= line; i++) {
            var cookie = Application.Range("A" + i).Text;
            var exec = Application.Range("B" + i).Text;
            if (cookie == "") {
                // 如果为空行，则提前结束读取
                break;
            }
            if (exec == "是") {
                console.log("🧑 开始执行用户：" + "1" )
                execHandle(cookie, i);
                break;  // 只取一个
            }
        } 
    }

}

// 激活工作表函数
function ActivateSheet(sheetName) {
    let flag = 0;
    try {
      // 激活工作表
      let sheet = Application.Sheets.Item(sheetName);
      sheet.Activate();
      console.log("🥚 激活工作表：" + sheet.Name);
      flag = 1;
    } catch {
      flag = 0;
      console.log("🍳 无法激活工作表，工作表可能不存在");
    }
    return flag;
}

// 对推送数据进行处理
function jsonPushHandle(pushName, pushFlag, pushKey) {
  let length = jsonPush.length;
  for (let i = 0; i < length; i++) {
    if (jsonPush[i].name == pushName) {
      if (pushFlag == "是") {
        jsonPush[i].flag = 1;
        jsonPush[i].key = pushKey;
      }
    }
  }
}

// 将消息数组融合为一条总消息
function messageMerge(){
    // console.log(messageArray)
    let message = ""
  for(i=0; i<messageArray.length; i++){
    if(messageArray[i] != "" && messageArray[i] != null)
    {
      message += "\n" + messageHeader[i] + messageArray[i] + ""; // 加上推送头
    }
  }
  if(message != "")
  {
    console.log("✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨")
    console.log(message + "\n")  // 打印总消息
    console.log("✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨")
  }
  return message
}

function sleep(d) {
  for (var t = Date.now(); Date.now() - t <= d; );
}

// 获取sign，返回小写
function getsign(data) {
    var sign = Crypto.createHash("md5")
        .update(data, "utf8")
        .digest("hex")
        // .toUpperCase() // 大写
        .toString();
    return sign;
}

// =================共用结束===================
 

// 生成GMT+8时间戳
function getDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 生成一定范围内的随机数
function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 鸿星尔克专用sign
function HXEK_SIGN(memberId, appid){
  signArry = []
  // appid = "wxa1f1fa3785a47c7d"
  secret = 'damogic8888'
  // GMT+8时间戳
  // timestamp = '2025-01-11 13:24:09'
  timestamp = getDateTimeString()
  // console.log(timestamp)
  // 随机数
  // random_int = 1475835
  random_int = randint(1000000, 9999999)
  // console.log(random_int)
  // 待加密字符串
  raw_string = "timestamp=" + timestamp + "transId=" +appid + timestamp + "secret=" + secret + "random=" + random_int + "memberId=" + memberId
//   console.log(raw_string)
  // MD5加密
  sign = getsign(raw_string)
  // console.log(sign)
  signArry = [sign, random_int, timestamp]
  return signArry
}

// json转参数
function jsontoparam(jsonObj){
  // console.log(jsonObj)
  // "?xxx=xxx;xxx=xxx;"
  result = ""
  values = Object.values(jsonObj);
  values.forEach((value, index) => {
      key = Object.keys(jsonObj)[index]; // 获取对应的键
      // if(value == "[object Object]")
      // {
      //   value = "{}"
      // }
      // console.log(key + ": " + value);
      content = key + "=" + value + "&"
      result += content 
  });

  result = result.substring(0, result.length - 1);
  // console.log(result)
  return result
}

// 青龙适配
// 结果处理函数
function resultHandle(resp, pos){
    let messageSuccess = "";
    let messageFail = "";
    let messageName = "";
    // 推送昵称或单元格，还是不推送位置标识
    if (messageNickname == 1) {
        // 推送昵称或单元格
        messageName = Application.Range("C" + pos).Text;
        if(messageName == "")
        {
            messageName = "单元格A" + pos + "";
        }
    }
    posLabel = pos-2 ;  // 存放下标，从0开始
    messageHeader[posLabel] =  "👨🚀 " + messageName

    if (resp.status == 200) {
        resp = resp.json();
        console.log(resp)

        // （修改这里，这里就是自己写了，根据抓包的响应自行修改）
        
        // {"reqMethodName":{},"errcode":0,"errmsg":"请求成功","response":{"reqMethodName":{},"errcode":0,"errmsg":{},"response":{},"memberSign":{"continuousCount":2,"integralCount":10,"moreDays":1,"moreIntegral":10},"expirePoints":0,"points":230}}
        // {"reqMethodName":{},"errcode":0,"errmsg":"您今天已签到","response":{},"memberSign":{},"expirePoints":0,"points":0}}
        // {"reqMethodName":{},"errcode":4,"errmsg":"缺少参数memberId","response":{},"memberSign":{},"expirePoints":0,"points":0}}
        errcode = resp["errcode"]           // 通过resp["键名"]的方式获取值.假设响应数据是情况1，则读取到数字“0”
        // respmsg = resp["message"]  // 通过resp["键名"]的方式获取值，假设响应数据是情况1，这里取到的值就是“签到成功”
        if(errcode == 0)       // 通过code值来判断是不是签到成功，由抓包的情况1知道，0代表签到成功了,所以让code与0比较
        { 
            // 这里是签到成功
            memberSign = resp["response"]["memberSign"]
            continuousCount = memberSign["continuousCount"]
            integralCount = memberSign["integralCount"]
            points = resp["response"]["points"]
            content = "🎉 " + "当前积分:" + points + "连续签到:" + continuousCount + "天 "  // // 给自己看的，双引号内可以随便写
            messageSuccess += content;
            // console.log(content)
        }
        else if(errcode == 900001)
        {
            errmsg =  resp["errmsg"]
            content = "📢 " + errmsg + " "// "今天已签到 "  // // 给自己看的，双引号内可以随便写
            messageSuccess += content;
            // console.log(content)
        }else
        {
            // 这里是签到失败
            msg = "❌ " + "签到失败 "   // 给自己看的，可以随便写，如 msg = "失败啦！" 。
            
            content = msg + " "     
            messageFail += content;
            // console.log(content)
        }

    } else {
        content = "❌ " + "签到失败 "
        messageFail += content;
        // console.log(content);
    }

    // 青龙适配，青龙微适配
    flagResultFinish = 1; // 签到结束

  // =================修改这块区域，区域结束=================

  sleep(2000);
  if (messageOnlyError == 1) {
    messageArray[posLabel] = messageFail;
  } else {
    if(messageFail != ""){
        messageArray[posLabel] = messageFail + " " + messageSuccess;
    }else{
        messageArray[posLabel] = messageSuccess;
    }
  }

  if(messageArray[posLabel] != "")
  {
    console.log(messageArray[posLabel]);
  }

  return flagResultFinish
}

// 具体的执行函数
function execHandle(cookie, pos) {
    // 清零操作，保证不同用户的消息的独立
    // 青龙适配，青龙微适配
    posHttp = 0 // 置空请求
    qlpushFlag -= 1 // 一个用户只会执行一次execHandle，因此可用于记录当前用户
    messageSuccess = "";
    messageFail = "";

  // =================修改这块区域，区域开始=================

  url1 = "https://hope.demogic.com/gic-wx-app/member_sign.json"; // 签到url（修改这里，这里填抓包获取到的地址）
  // url2 = "https://hope.demogic.com/gic-wx-app/get_member_grade_privileg.json"   // 获取用户信息
  appid = "wxa1f1fa3785a47c7d"  // 固定的

  memberId = Application.Range("D" + pos).Text;
  enterpriseId = Application.Range("E" + pos).Text;
//   console.log(memberId, enterpriseId)
  signArry = HXEK_SIGN(memberId, appid)
  sign = signArry[0]
  random_int = signArry[1]
  timestamp = signArry[2]
  transId = appid + timestamp
  console.log(sign, random_int, timestamp, transId)

  // （修改这里，这里填抓包获取header，全部抄进来就可以了，按照如下用引号包裹的格式，其中小写的cookie是从表格中读取到的值。）
  headers= {
    "Cookie": cookie,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.70",
    'Host': 'hope.demogic.com',
    'xweb_xhr': '1',
    'channelEntrance': 'wx_app',
    'sign': enterpriseId,
    'Referer': 'https://servicewechat.com/wxa1f1fa3785a47c7d/55/page-frame.html',
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  // （修改这里，这里填抓包获取data，全部抄进来就可以了，按照如下用引号包裹的格式。POST请求才需要这个，GET请求就不用它了）
  data = {
    "path":"pages/points-mall/member-task/member-task",
    "query":{},
    "scene":1256,
    "referrerInfo":{},
    "apiCategory":"default",
    'memberId': memberId,
    'cliqueId': '-1',
    'cliqueMemberId': '-1',
    'useClique': '0',
    'enterpriseId': enterpriseId,
    'appid': appid,
    'gicWxaVersion': '3.9.16',
    'random' : random_int,
    'sign' : sign,
    'timestamp' : timestamp,
    'transId' : transId,
  }
  // params = jsontoparam(params)
  // url1 = url1 + params
  // console.log(url1)

  // （修改这里，以下请求方式三选一即可)
  // // 请求方式1：POST请求，抓包的data数据格式是 {"aaa":"xxx","bbb":"xxx"} 。则用这个
  // resp = HTTP.post(
  //   url1,
  //   JSON.stringify(data),
  //   { headers: headers }
  // );

  // 请求方式2：POST请求，抓包的data数据格式是 aaa=xxx&bbb=xxx 。则用这个
  resp = HTTP.post(
    url1,
    data,
    { headers: headers }
  );

  // // 请求方式3：GET请求，无data数据。则用这个
  // resp = HTTP.get(
  //   url1,
  //   { headers: headers }
  // );
    
    // 青龙适配，青龙微适配
    if(qlSwitch != 1){  // 选择金山文档
        resultHandle(resp, pos)
    }

}
