/*
手机QQ浏览器,福利中心

只有领存钱罐,其他的都搞不到
一天就500金币而已

抓包变量
抓包地址 https://ugpage.html5.qq.com/ugwelfare/api/qbff/tasks/acceptCoinBankWelfare
抓包请求体里面的 qbid、userId、token 这三个值

变量名:soy_qqllq_data
变量值:qbid&userId&token&默认不填是qq,如手机就填sj,微信就填wx
例手机登录:xxx&xxx&xxx&sj
例微信登录:xxx&xxx&xxx&wx
例qq登录:xxx&xxx&xxx或者xxx&xxx&xxx&qq

多号用 # @ 换行 其中一个

定时10分钟一次次
0/10 12,19 * * *

*/


const $ = new Env('企鹅浏览器');
const author = '作者TG_ID:@ls_soy';
const TG = "https://t.me/LjkwwdZZRPs5OWU1"
const notify = $.isNode() ? require('./sendNotify') : '';

var version_='jsjiami.com.v7';const _0x3b662b=_0x57c7;(function(_0x298f81,_0x50e62e,_0x1ca992,_0xcea0be,_0x2aabe9,_0x6164ae,_0x36145a){return _0x298f81=_0x298f81>>0x5,_0x6164ae='hs',_0x36145a='hs',function(_0x272a25,_0x87b306,_0x3bea96,_0x54492f,_0x2c5a0d){const _0x37b283=_0x57c7;_0x54492f='tfi',_0x6164ae=_0x54492f+_0x6164ae,_0x2c5a0d='up',_0x36145a+=_0x2c5a0d,_0x6164ae=_0x3bea96(_0x6164ae),_0x36145a=_0x3bea96(_0x36145a),_0x3bea96=0x0;const _0x24f6ea=_0x272a25();while(!![]&&--_0xcea0be+_0x87b306){try{_0x54492f=-parseInt(_0x37b283(0x202,'2q(y'))/0x1+parseInt(_0x37b283(0x38b,'FsUN'))/0x2+-parseInt(_0x37b283(0x1dd,'&VR0'))/0x3*(-parseInt(_0x37b283(0x1e9,'smVb'))/0x4)+-parseInt(_0x37b283(0x366,'3o$0'))/0x5*(-parseInt(_0x37b283(0x37c,'pA$d'))/0x6)+-parseInt(_0x37b283(0x232,'nBL&'))/0x7*(-parseInt(_0x37b283(0x311,'[Jc3'))/0x8)+-parseInt(_0x37b283(0x326,'hvqR'))/0x9*(-parseInt(_0x37b283(0x2a2,'8puf'))/0xa)+-parseInt(_0x37b283(0x20f,'OFlX'))/0xb;}catch(_0x335e19){_0x54492f=_0x3bea96;}finally{_0x2c5a0d=_0x24f6ea[_0x6164ae]();if(_0x298f81<=_0xcea0be)_0x3bea96?_0x2aabe9?_0x54492f=_0x2c5a0d:_0x2aabe9=_0x2c5a0d:_0x3bea96=_0x2c5a0d;else{if(_0x3bea96==_0x2aabe9['replace'](/[lFQpSONExkWGTtDBqKY=]/g,'')){if(_0x54492f===_0x87b306){_0x24f6ea['un'+_0x6164ae](_0x2c5a0d);break;}_0x24f6ea[_0x36145a](_0x2c5a0d);}}}}}(_0x1ca992,_0x50e62e,function(_0x21cba4,_0x3f866c,_0x21a0f6,_0x54cc5f,_0x52a83b,_0x4d2bc5,_0x1ea1aa){return _0x3f866c='\x73\x70\x6c\x69\x74',_0x21cba4=arguments[0x0],_0x21cba4=_0x21cba4[_0x3f866c](''),_0x21a0f6=`\x72\x65\x76\x65\x72\x73\x65`,_0x21cba4=_0x21cba4[_0x21a0f6]('\x76'),_0x54cc5f=`\x6a\x6f\x69\x6e`,(0x125985,_0x21cba4[_0x54cc5f](''));});}(0x19a0,0xc6c4c,_0x5562,0xcf),_0x5562)&&(version_=_0x5562);try{CryptoJs=$[_0x3b662b(0x34f,'4u(^')]()?require('crypto-js'):'';}catch(_0x50ba6e){throw new Error(_0x3b662b(0x261,'GP]N'));}try{axios=$[_0x3b662b(0x1d1,'$@p%')]()?require(_0x3b662b(0x27f,'X@uT')):'';}catch(_0x408678){throw new Error('\x0a找不到依赖\x20axios\x20,请自行安装\x0a');}let subTitle='',user_num=0x0,execAcList=[],user_data='',app_sj=![],up_token='',variable_style='',ql_id='',ql_secret='',ql_ip='';!(async()=>{const _0x57cad1=_0x3b662b,_0x392a73={'PhIkH':_0x57cad1(0x29e,'3o$0'),'vhDvs':function(_0x51e944,_0x1e61b2){return _0x51e944*_0x1e61b2;},'txAPG':function(_0x4ed5f3,_0x46dc95){return _0x4ed5f3+_0x46dc95;},'fIUTl':function(_0x69c6ad,_0x39b231){return _0x69c6ad+_0x39b231;},'UCROJ':function(_0x224bb9,_0x5aadc7){return _0x224bb9+_0x5aadc7;},'TaZzz':function(_0x3fefd8,_0x17d9d4){return _0x3fefd8<_0x17d9d4;},'tKWlA':function(_0x14ac95,_0x27589a){return _0x14ac95+_0x27589a;},'mLjSu':function(_0xb5baa9,_0x10b430){return _0xb5baa9+_0x10b430;},'OttKc':function(_0x2b640d,_0xa60435){return _0x2b640d+_0xa60435;},'qeSzF':function(_0x3ec041,_0x97d281){return _0x3ec041+_0x97d281;},'BZHtH':function(_0x589f81,_0x10804c){return _0x589f81+_0x10804c;},'Uelqd':function(_0x3c66ea,_0x323728){return _0x3c66ea!=_0x323728;},'qAjjA':function(_0x417b59,_0x20851e){return _0x417b59>_0x20851e;},'Djvbf':function(_0x24f363,_0x25fb58){return _0x24f363>_0x25fb58;},'GNcLM':function(_0x33b727,_0x5b572e){return _0x33b727===_0x5b572e;},'juiKX':_0x57cad1(0x2ba,']9p8'),'iIIXN':function(_0x72cf1b,_0x24d993){return _0x72cf1b>_0x24d993;},'kFHQQ':function(_0x505e22,_0x4d5eba){return _0x505e22!==_0x4d5eba;},'LVLPt':_0x57cad1(0x2bb,'C)R)'),'ljqVQ':'nGwPl','AFGAQ':function(_0xb04ccd,_0x1806cb){return _0xb04ccd+_0x1806cb;},'buIbE':function(_0x3a9d40,_0x42f8a5){return _0x3a9d40*_0x42f8a5;},'IpfJb':function(_0x524039){return _0x524039();},'rFZia':_0x57cad1(0x2cc,'$@p%'),'eLmLy':_0x57cad1(0x21a,'rV6w')};console[_0x57cad1(0x270,'OFlX')]('\x0a【soy脚本文件免责声明】：\x0a【发布的脚本文件及其中涉及的任何脚本，仅用于测试和学习研究，禁止用于商业或非法目的，否则后果自负，使用脚本行为均有封号风险】\x0a【不能保证其合法性、准确性、完整性和有效性，请根据情况自行判断】\x0a【本脚本文件，禁止任何公众号、论坛、群体以及任何形式的转载、发布,否则后果自负】\x0a【本人对任何脚本问题概不负责，包括但不限于由任何脚本错误导致的任何损失或损害】\x0a【直接或间接使用脚本包括不限制于破解脚本的任何用户，包括但不限于代挂或其他某些行为违反国家/地区法律或相关法规的情况下进行传播，本人对于由此引起的任何隐私泄漏或其他后果概不负责】\x0a【如果任何单位或个人认为该脚本可能涉嫌侵犯其权利，则应及时通知并提供身份证明、所有权证明，我们将在收到认证文件后删除相关脚本】\x0a【任何以任何方式查看此项目的人或直接或间接使用该仓库的任何脚本的使用者都应仔细阅读此声明。本人保留随时更改或补充此免责声明的权利。一旦使用并复制了任何相关脚本文件，则视为您已接受此免责声明】');if($[_0x57cad1(0x293,'5e(r')]()){try{Tips=author[_0x57cad1(0x1ca,'I]5I')](/(\S*)TG_ID:@ls_soy/)[0x1];}catch(_0x5ea1ba){throw new Error(_0x57cad1(0x33f,'lv2X'));}try{YZ=author[_0x57cad1(0x2f8,'GUZq')](/作者TG_ID:(\S*)/)[0x1]['replace'](/_/g,'><');if(_0x392a73['Uelqd'](TG[_0x57cad1(0x234,'Mtrv')](/t.me\/(\S*)/)[0x1],'LjkwwdZZRPs5OWU1'))throw new Error(_0x57cad1(0x37f,'s2yj'));}catch(_0x192da1){throw new Error('\x0a【作者提示】：验证脚本SHA失败,请勿修改脚本中任意内容\x0a');}if(process[_0x57cad1(0x324,'vwqw')]['soy_qqllq_data']&&_0x392a73[_0x57cad1(0x290,'vwqw')](process['env'][_0x57cad1(0x398,'s2yj')][_0x57cad1(0x2bd,'4u(^')]('@'),-0x1))user_data=process[_0x57cad1(0x21c,'2q(y')]['soy_qqllq_data'][_0x57cad1(0x285,'nBL&')]('@'),variable_style='@';else{if(process[_0x57cad1(0x313,'yEnN')][_0x57cad1(0x2ac,'kCLY')]&&_0x392a73[_0x57cad1(0x2b0,'4u(^')](process[_0x57cad1(0x2ae,'W1iE')]['soy_qqllq_data']['indexOf']('\x0a'),-0x1))_0x392a73[_0x57cad1(0x22a,'NddB')](_0x392a73['juiKX'],'nZrXM')?(_0x240d98=_0x392a73[_0x57cad1(0x1bc,'nBL&')],_0x4dc1cb='6',_0x2156e4=_0x57cad1(0x1cc,'OFlX')):(user_data=process[_0x57cad1(0x250,'dejF')][_0x57cad1(0x253,'y60y')]['split']('\x0a'),variable_style='\x0a');else process[_0x57cad1(0x36e,'smVb')]['soy_qqllq_data']&&_0x392a73[_0x57cad1(0x369,'C)R)')](process[_0x57cad1(0x2de,'!0F@')][_0x57cad1(0x36d,'OFlX')][_0x57cad1(0x362,'W1iE')]('#'),-0x1)?(user_data=process[_0x57cad1(0x310,'SBoI')][_0x57cad1(0x1fa,'!0F@')][_0x57cad1(0x289,'NddB')]('#'),variable_style='#'):_0x392a73[_0x57cad1(0x251,'D%59')](_0x57cad1(0x22e,'OFlX'),_0x392a73[_0x57cad1(0x36c,'6xq#')])?(_0x23a3bc[_0x57cad1(0x32a,'C)R)')]('\x0a【'+_0x47a5ac+_0x57cad1(0x223,'8puf')+_0x535021['num']+'\x20收取】:\x20返回\x20'+_0x351652),_0x2d5c71+='\x0a【'+_0x53a85b+_0x57cad1(0x314,'35WN')+_0x13ba80['num']+_0x57cad1(0x280,'smVb')+_0x14ab4f):user_data=process[_0x57cad1(0x231,'zy3i')]['soy_qqllq_data'][_0x57cad1(0x2fe,'GP]N')]();};user_num=user_data[_0x57cad1(0x397,'X@uT')];if(process[_0x57cad1(0x346,'rV6w')][_0x57cad1(0x1fd,'D%59')]){if(_0x392a73[_0x57cad1(0x2e7,'Wy@u')]===_0x57cad1(0x262,'e6YJ')){var _0x1c1347=process['env']['soy_ql_data'];ql_ip=_0x1c1347[_0x57cad1(0x2fe,'GP]N')]('&')[0x0],ql_id=_0x1c1347[_0x57cad1(0x252,']9p8')]('&')[0x1],ql_secret=_0x1c1347[_0x57cad1(0x252,']9p8')]('&')[0x2];}else{var _0x21a917=new _0x35faf6(_0x392a73['vhDvs'](_0x3823a8,0x3e8)),_0x493203=_0x392a73['txAPG'](_0x21a917['getFullYear'](),'-'),_0x1bb9e6=_0x392a73[_0x57cad1(0x282,'35WN')](_0x392a73[_0x57cad1(0x1de,'y60y')](_0x21a917[_0x57cad1(0x39a,'s2yj')](),0x1)<0xa?_0x392a73[_0x57cad1(0x1b9,'wvjy')]('0',_0x392a73['fIUTl'](_0x21a917[_0x57cad1(0x303,'Wy@u')](),0x1)):_0x392a73[_0x57cad1(0x282,'35WN')](_0x21a917['getMonth'](),0x1),'-'),_0x20720d=_0x392a73[_0x57cad1(0x354,'s2yj')](_0x21a917[_0x57cad1(0x1ff,'s2yj')](),'\x20'),_0x4af46f=_0x392a73[_0x57cad1(0x393,'4u(^')](_0x21a917['getHours'](),':'),_0x5134d8=_0x392a73[_0x57cad1(0x363,'OFlX')](_0x392a73[_0x57cad1(0x22d,'C)R)')](_0x21a917['getMinutes'](),0xa)?_0x392a73[_0x57cad1(0x29a,'lv2X')]('0',_0x21a917[_0x57cad1(0x216,'4u(^')]()):_0x21a917['getMinutes'](),':'),_0x57f468=_0x21a917['getSeconds']();let _0x338c32=_0x392a73['mLjSu'](_0x392a73[_0x57cad1(0x1d8,'dejF')](_0x392a73[_0x57cad1(0x23b,'1pCV')](_0x392a73['OttKc'](_0x493203,_0x1bb9e6),_0x20720d),_0x4af46f),_0x5134d8)+_0x57f468;return _0x392a73[_0x57cad1(0x254,'X@uT')](_0x392a73[_0x57cad1(0x272,'NddB')](_0x392a73['BZHtH'](_0x392a73['fIUTl'](_0x493203,_0x1bb9e6),_0x20720d),_0x4af46f),_0x5134d8)+_0x57f468;}}console[_0x57cad1(0x1f8,'kL6Q')]('\x0a===\x20脚本执行\x20-\x20北京时间：'+new Date(_0x392a73[_0x57cad1(0x2cd,'zy3i')](new Date()[_0x57cad1(0x275,'1pCV')](),_0x392a73[_0x57cad1(0x33b,'SBoI')](new Date()[_0x57cad1(0x1ea,'e6YJ')]()*0x3c,0x3e8))+_0x392a73['buIbE'](0x8*0x3c,0x3c)*0x3e8)[_0x57cad1(0x1c1,'!0F@')]()+_0x57cad1(0x20e,'1pCV')),console[_0x57cad1(0x378,'oxng')](_0x57cad1(0x2ff,'GyS)')+user_num+_0x57cad1(0x2cb,'2q(y')),subTitle='',await _0x392a73[_0x57cad1(0x394,'y60y')](get_zu);}else{if(_0x392a73[_0x57cad1(0x2b2,']94(')]!==_0x392a73[_0x57cad1(0x1c4,'1pCV')]){console[_0x57cad1(0x2b1,'W1iE')]('\x0a【脚本提示】：此脚本只能青龙环境跑');return;}else throw new _0x1b2ea5('\x0a找不到依赖\x20axios\x20,请自行安装\x0a');}})()[_0x3b662b(0x327,'D%59')](_0x3a1732=>$['logErr'](_0x3a1732))['finally'](()=>$[_0x3b662b(0x21e,'5e(r')]());function _0x57c7(_0x10d95b,_0x18baf6){const _0x556220=_0x5562();return _0x57c7=function(_0x57c75f,_0x43a863){_0x57c75f=_0x57c75f-0x1b7;let _0x58abd4=_0x556220[_0x57c75f];if(_0x57c7['zEyPRL']===undefined){var _0xf6da56=function(_0x28af22){const _0xad287e='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x5aa434='',_0x1f22f5='';for(let _0x42bcfb=0x0,_0x2fb030,_0x5b6962,_0x944454=0x0;_0x5b6962=_0x28af22['charAt'](_0x944454++);~_0x5b6962&&(_0x2fb030=_0x42bcfb%0x4?_0x2fb030*0x40+_0x5b6962:_0x5b6962,_0x42bcfb++%0x4)?_0x5aa434+=String['fromCharCode'](0xff&_0x2fb030>>(-0x2*_0x42bcfb&0x6)):0x0){_0x5b6962=_0xad287e['indexOf'](_0x5b6962);}for(let _0x2abc4=0x0,_0x4c99ca=_0x5aa434['length'];_0x2abc4<_0x4c99ca;_0x2abc4++){_0x1f22f5+='%'+('00'+_0x5aa434['charCodeAt'](_0x2abc4)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x1f22f5);};const _0x1f0af4=function(_0x490302,_0x341aac){let _0x46b108=[],_0x379343=0x0,_0x1b2ea5,_0x29272a='';_0x490302=_0xf6da56(_0x490302);let _0x4ab810;for(_0x4ab810=0x0;_0x4ab810<0x100;_0x4ab810++){_0x46b108[_0x4ab810]=_0x4ab810;}for(_0x4ab810=0x0;_0x4ab810<0x100;_0x4ab810++){_0x379343=(_0x379343+_0x46b108[_0x4ab810]+_0x341aac['charCodeAt'](_0x4ab810%_0x341aac['length']))%0x100,_0x1b2ea5=_0x46b108[_0x4ab810],_0x46b108[_0x4ab810]=_0x46b108[_0x379343],_0x46b108[_0x379343]=_0x1b2ea5;}_0x4ab810=0x0,_0x379343=0x0;for(let _0x15583e=0x0;_0x15583e<_0x490302['length'];_0x15583e++){_0x4ab810=(_0x4ab810+0x1)%0x100,_0x379343=(_0x379343+_0x46b108[_0x4ab810])%0x100,_0x1b2ea5=_0x46b108[_0x4ab810],_0x46b108[_0x4ab810]=_0x46b108[_0x379343],_0x46b108[_0x379343]=_0x1b2ea5,_0x29272a+=String['fromCharCode'](_0x490302['charCodeAt'](_0x15583e)^_0x46b108[(_0x46b108[_0x4ab810]+_0x46b108[_0x379343])%0x100]);}return _0x29272a;};_0x57c7['RiOwNr']=_0x1f0af4,_0x10d95b=arguments,_0x57c7['zEyPRL']=!![];}const _0x4ac60e=_0x556220[0x0],_0x5b18f9=_0x57c75f+_0x4ac60e,_0x43d167=_0x10d95b[_0x5b18f9];return!_0x43d167?(_0x57c7['aHlGxb']===undefined&&(_0x57c7['aHlGxb']=!![]),_0x58abd4=_0x57c7['RiOwNr'](_0x58abd4,_0x43a863),_0x10d95b[_0x5b18f9]=_0x58abd4):_0x58abd4=_0x43d167,_0x58abd4;},_0x57c7(_0x10d95b,_0x18baf6);}function _0x5562(){const _0x47a828=(function(){return[...[version_,'GOjsQFpjiqYaWmDDki.KBcoFmlE.DFOvx7xTQStN==','W4qkW6Pj','WRZdOCkcW6K','W757W5JcLXa','dKPcW6pcMq','x+wYKoIULUElVEwkU+ocOshdUEIpIow9GG','W6NcNMJdVSom','hWjwt2K','aHRdNSonWRFcTq','h8oEWRvSWOK','WO1xbhuM','W77cOCkybCop','W5DeECopjSowieRcLfjH','sfuRW4WY','ytJcG8o0sG','lcRdUSoJWPa','WOz1r3RcPq','ehVcI8oi','WOvYWPe','ngLKW5mRW71Z','WP3JG5VKViJOGj/MJ5ZNPANJGk3VVjJPQAJORAFOHkVMNBe4mXhLPQFOTzG16kYZ5yUi5lY05PAE6isx5PYj5lI35lIA5OsE5ys25AYdmG','D2SRW78a','W5HfWRPOmG','WRxcKfS','BGKPW4pcIYq2d0W','WQ9Jh0aBmwO8qIPMW4e8xfJcJvO','5O2556EjW5zyWPpOTixLJRtcJa','WRtcTCkOc8ko','pLzSW5JcQW','W6DtWO57cSoO','W7HbWOC','e8klWRK','W4hdKmoL','obFcJq','W4xcNmkC','hIOTp8kmWOKHDKeSumoc','oCoHWRjTWQS','W6jeW6m','WPJdG8olqCkkfxhcMeC','c3xcHq','WQqcW5aRuCkZWPRcSqi','WPPYWO9IW7OFsSkAW7NcUeFdTML2','WOBcKSkKC8oWj8kVWRKezmkQrCkSpCkwW5ujWRWiWRanybZdVxjkCh1xW6XGW49TW6b9uCk6wG','WRWedSkXqa','WR1uWQRdJCoIt3HfWQhcNCoU','W4ddS8oHzI/cO8kdoG','fZH1d8oCW6qy','W6mVW7ddLci','WQnKle4h','WPdcJSk0kSk3D8kmWOa3lmoanq','W4epW78EW6XPm2KdC8oqW7nUWR8gt0ddJhaiwrTZkhGLWPtdICkxWQ3dJuy','kHRcMmktbq','WQNcJmkwdSk3','g8ongSooW7i','EWRcOW','WQLEWQFdN8o6tvjvWQxcMG','W4xcPWDIxG','WQVcQSk8dmkn','WOmskG','sxvTDa','boEjQEAaNEobIJSU6l+Q5zMEWRa','WObwWQmv','WQH/WOVcKMBcGXhcLX3dImo3wrek','5O6v56sIpmkqB+I2TowpQSod','WRddNa/cQmoH','WRpcNxORWPa','W6ldJmoMAt8','WQHJiSoS','WRPsWRLLW4m','FmoAf8o9WRJdHSkJWQj8fG','W5qsW65n','cM9PW4NcQW','WRFdGXFcOmo5WR7dHSk4twqv','WOJcVCkGgSkx','iXRdJ8oCW7BdL2W4ASoLBWNdMqfxCCk+WP7dHSkOdNXLvCkfWOSIWRRdMmo+','W4hdKmoW','WRVdR8ksW60','ce4Tfq','W6ztWO16smoQW5RdRfDMyW','gSkkWR0','hK3cISo7WRS','zr7cVmoYya','5OYt56AwtSoSWRJOT5NLJzZdTW','eCo+lSod','WOiDpCkE','WR3dMCkCW7Tt','WQhcLmoAq8ks','gsOVna','dmknW7FdVCoqDhS9fuedWPWvW7LMW5JcLIhdPSkKWO/dHbFcVSoSfmoUW5HBWRJdT8k3lgddUa','WP7cSv8mWQ4','tNTRzG','WQ98aMrEFgSJsYHIW7O/','WOVdR8k8W7zO','W5WJW77dOW4','WRlcQSoNA8kb','W5LcWRHxlG','kbdcNW','AXm2iCkHWP5uW6ZcICkHWQ3dSG','hWnNEG','W47dVCo8AWu','u1e2gmk+','W6NcG0K','zXFcRCoPrW','WPFcL8o6Emo/AKWcWRZcJuZcTKm','C8oCWQCwxIbO','5OYl56E3W59YW6JOTlBLJkzJ','W5qGW4LeWPS','WQ7dNWq','WQbDqKRcPCkZsCoxgWpcOxS','WOP7gSoVxW','WOdLSAtORyVNIBpLI5RJGya5FoIoJEw/KG','WRNMLBJLJAZJGRvUWPpOV7dLMBTj','WQiDpmkzxW','WOZdRGZcJmoA','q3CxdCkS','hCkluW','lWVcHvBdIa','uv4n','W7BcQdD/FcD9B8klW5nFkq','qSklCq9B','hIHS','h8oBWOTuWQuPiSkI','WQzjW5qifa','W6VdJComFIK','WPbcjuW7','qxiKpCku','5O+056ELmxyS6lsO5y+jWQa','dHrH','WQv9WPVdG8oc','WQ5qsa3cSG','t0itW4meD0RdRmkmW5lcRfZdOM0','W5ZdR3ldRSkW','W7aaW71BW60','W71OWQDBba','WPb7oColtW','uN0JW7pcSa','oSkQWORdKSog','5O+m56w/WR4kW4lOTQ/LJPf/','FWSSy8o1W4zjWOJdN8oo','5O6D56weW4qzWO3OTA7LJQGx','e8oqWPnIWPa','cUEkRoAaNUoaLSkhWPJLUBFLUk/MNlRNTANKUOBVVPZMMR/LPidLHzNLTyhKVlRLKypVV4a','rwiCW6Kq','lMfDA8o8','h+AiGEs7G+wkSEs+MoI3Hmosx8kOuX0TW5ldGmoVW5hcPrZORO7OHyFOO63LR6ZOOytdLa','WQzbheqE','WOpcJmonWOvN','kL84jSoXWPzoW4ZdKmkoW43cNmo3hrrBWQ8X','kXlcH8kxnG','ba/cOL/dLq','W6lcL8kloSoT','gqFdV8olWQa','zcJcP0eo','WPxcTSovWOz4','BrBdILxcPa','hGfiW60xB0lcOSohWQ8','amk3BCoKWQ8','W4JdKCoH','W6xcRIDVycC','W7uHW50','rIhcGMm7','WR/cTMKuWO8','BoElGoAdTUodRu3cKEwUI+MrTEE9NEI+Sow7Lq'],...(function(){return[...['WOVdOXBcHCoz','W4CoW6P8WRm8zG','gwzdrSoD','CaVdLfxcLq','kbnMdCo1','sNq6W57cSmoqWPOTWQJdRmkzWRa5p2OQoMtcPCoqmbZdVHObWObhjCo5As4+gh53W4C','W5vmECom','k2PCW7SP','tx9Ru8ouW5ut','WQXTkmoyAG','WPxcISk/kSk3DSoJWPKYpSowbmo2','W4ZdSKJdU8kf','EUAuIowpJEocV8ojrUI+OowAHc4','l2aaeSoK','oa7cTSkSma','WQzZbG','p8kbx8oJWRa','lLDIE8oJ','cG3cJ0FdOq','WRFdPCk0W7Xv','W7pdV8o9yHO','WQRcJ1aPWPC','W44EW7m','bdZcJ8kodW','W40eW7Pn','cwWAbCol','W43cQvNdLSoI','5OY556sNW5SqWQBOTyJLJ5hdLG','WQ1BomoJwq','W6OQsxuepxSNx2y5WQX4fGNcHKFdLCo6WP1oxSkcxdFdQtmFq8oUd8kPWQ7cNsJcHYtdJW','Cqv7E8o5WO0xWOG','bvinh8oTWRi','yviCjmkZ','WPtcPCoJWQL7','W7q9W50','whTXy8osW5u','EheCW6pcUW','C1G+W7ZcNq','W6f5WRDZja','WQHQemoRta','W7ZcV2pdTSoccXRdTq','W5dML5VLJyxJGjNdQwO','rCovW6RcJq','WPxJG4dOHjdMNRtMJzdNPzdJGAxVVOtMR47OHABMNQFLJRxOG53PN4JPVlhNJ4xLORROTAy','W47dQ8ouvSop','WQ/cOSkzoSkR','W7hcNctcMmouWPldKCkJ','D8ofWQuwqXnZFxxdGa','hXtcLCk7fG','wwLlAmo1','egX3WOu','vJ7cH2q','raBcH8okra','bSknWRxdKmo7','W6FdUCkcWP9KW7tcOmokt2PEWQhdHCodW5FdI2FcISoXmeK','wKSIkXZcVGLtW6/dQgui','rJ7cL1u+jmoPwdK4WRpcHLRcSa','W67MLi3LJixJGOpcQqm','t3rP','AuqPW6VcRa','x8ovfCosWRC','rNv4','wvadW5pcTa','uCk4BdPMAXddQmoKWR5pW63cHMpcHmoDiGWd','pMNcSvpcLSo5a30D','WRldGa3cRmo3','W6hcGehcSmoGWP7cICoTgLOXWORdIJDfW5pcHMLHW7tcVYDCumoxWOZdLCoKW5BdKKpdRf/cTN7dVNytWPZcPCoAW4ddMCkZDmoKWOXQrmo6W7HVzXqEvYFdG8kiW6BdNSojwSkaas4claBdQmkXWQNcHmoVw0tcUCkNW7G6emoXECo1WOpcQCkbBSooFLZcKmktmsPjWRFdI8o1W6bUWPRcV2vEdKi+W4HGWPZcUXtdMIi','WOfdW68Saq','WOJcNmoZE8oOzmoHW7O','FKiDb8k3','WRzNDYhcVG','WPRdO8kIW4Ti','WPlcQxGPWRa','CSorb8ovWQNdP8kW','zcZcVmoOzG','aCkSWO7dPmoX','nXBdHhFdRMqLx2yQDhVcSNddQ8oHb8k1nMWcfSkIW6RcNSkls8orWRNdICooEvWNW6O','vmo1WPyIuW','WRffsGpcSLS','W7XEW63cQqK','hbRdNColWQRcSWJdLLyfW4yv','s8kyud1B','WRRcKfGL','WPXRgLaG','grjJkCoU','WRZcQmkgeSkQFSkLkW','zEEkRUAaKoocRhJcSG','WOtKUPtOTQdLJ6xJGPD7W6BdPq','W4tcRsbpqG','ddJcRNxdSq','W4lcMmkXaSok','a0PAW64P','budcO8omWOy','qaVcQmk5','gCkqqmoMWPFdICkTWOKdnSkjW5xcOCozzSobW6qWnSoCsHZcTqPRW5S','C0u1W7/cTW','v2eLbmk9','W47cN8kvi8oM','kuHDzSoLW4zdW40','W6RdJWXZ','WQ57pmoTD8ou','fmojnCoRW6O','WQtcT8odWOHQW7FcVSkahcixW6hcISozW5FdKhpcLSkGFH52sSkVmSoEcHZcPNOsWOabW6lcQ8oI','iGnwz8oLWRBdRSktgCkzwva','W4tcKSkpfSow','W7C7W5C','WOXZWOa','W7ecurFcO0eceLXBWQC','iq/dJCoZW7C','mrzKBei','dCo6mmotW5FdHa','5OYm56sGF8kKnEI2N+woPMC','WRpcUCkgl8k2kSo+BmoQsSonW54oW4S6CCkpWQOKtMVdLmkDEmkxyIdcTYbyzGtdNSk7WP8JcmoIW4GkiSk/ms7cSrOqW5JcV8knWOdcLNVdTKfAmxH5c8ocuZxdTK86W7ONWPWFk37cMSkx','W7esW5DJWPS','WQpcReqeWPi','smk1Bq1q','b8kwWOPFWOySkCk7t3tdHqFcU8oWWOhcGxxcUKxcGIG5WQv/vCkBWQVdKfiuqaJcTv4VW51NeuqOW4VcL8kBACoGbKhdU8owWPZdHSoqWPKsnYNdIghdHXTmW6BdUu3cKcGWDCoJAmoIavbMW7lcRmo+WOVcJM97W73dL8kZjmklW5nLhmkaccajW5DtWQ9/afD9i8k0hN7dLXxdQ8oPqSoAjfdcJffSWOT7jItcKsFdQSkXWPldMY3cOIdcJhPkC8oKW68WWO45dSoPlZ7cOmofW7XkCHFdJCoPW5q8WOxdIbWbW6JcTCkfWR/dOv7cHa5XWR3dQCojqs/dPstcKNvku8kgtCoxi3ldISkpWPqFeCkOWPNcSmkyaCoIx8o1nSkkW5vZWQ7cVmkyyIhdSSkfC3pcRCk3WPFcVSk1kazwWQBcR2BdQq9mW7tcICo/mmofyhf8W6ZcQCkBAmkGymo3WR/dSHRdLfZcGM7cTM4/W7y2WOFdJGhdJ1C7WPzuBCojWRzZWP/cHrTAWOddP8oIW4NdPYZdRZhcMSkt','fYDOo8krWRazlcKIesGv','lIZcTSkmba','mXXckCoq','W6dcQ8kvj8o7','prhcMKa','kr/cNvu','WOuvoCkxCmojjwNcGw0','W5/dR1ldOCkABG','WO9Rn8oVFG','vIRdL2lcNq','WQzBvwlcVmkPFCooequ','BdddOe8','W6KVW7bBWPq','5OYG56sPWO9KAoI2HEwoHXm','xmokW7a','W7lcSx7dU8oO','BZhdOu7cGCoUdZLE','nUAwHowmKUobTr1W','rwm0','W7O2le0ZmxuY','BoAvGowmOEodRu3cKq','zG/cOSoOCq','fNJcRHRJG7/LH7Hg','uI/cH8oQBG','WPX8W4u','W6hcHWX3qG','q8k6AbzUyeRdQa','WP5xcLil','ghLYW6xcQq','bGVdHmoAWRddP2BcLeWxW5GaW4n1WQvVw1SPqSkMu0ZdSLfAzmk6WRu7W5yyCG9MW5JcKs0QW5pdSmk6WRSUyCozW7lcICkPr0VcG8oCw2FdLNtdUCoLWOeYW5ZcUSkstHvBWRC','hb7dNSooWQZcSa','ueGeW7SbBG','EYddP2hcMSoLcGzcWO3cQa','tG1HbCo6WRldTSoEg8krC8kDW5VdIgO','W6bEW6K','rZtcG2SMo8oewsCsWRNcKW','hWZdSSoTWQ4','mWJdMCow','mMaNWOKKWQT+WOxdRHRcTSo3d3HefYSr','jWtdIq','i8keWQmiuZ99Cq','lb/dKG','WPxcG8oL','5O6C56wmW5RdKvROTPFLJktdPa','W5VcOt9TEZDMwmk2W7zcAcqSbCkN','W7BcUtrAW4ldKW','eSklwCk4WPdcG8oSWP8bkmkCWPZcQCkdEG'],...(function(){return['5OYn56sAcuNdQ+I0LEwoVfy','5O6n56sDiZ/cUUI2IEwpMSkk','aaRdNq','WRpdGXdcTq','eEocR+s8V+IcTEAmGEEMKUodH++/JoMQLEIUPoIeIEAEPSosWR/dHowLNUI1V13ORzBLIQNKV5dMLBtOHjhMNONKUQFKUyJMHj/LHBVLR7VdUa','WRXnWRL5W74','WQhcOmkybSki','pNCYgmoB','5O2956AWdmk5W5VOTlZLJyfb','WPFcImoNrCk8jfWp','5O6k56senSkdW57OTydLJOn6','W77dKSoCESoU','WRL0ja','W6tcNmkbhmostYlcG0bHWRr9C8kgDY9Mymk5W6lcGwe7WQfcuW9dFJLhW53dOmos','DIGPWO1XWQzlWPVcGHRdOSkz','WQ1AWQFdSCo7','WRL8W4GXhW','pmkDW64','WRpdOCkb','W53cTmk2amoX','wXKKEHNdP34ZWPtcTcrtWRVdVLej','W6RcQsO','W5RcMvVdK8o6','5OYp56A0W4VcOt/OTldLJPKH','gKaVgCoT','W63cTxNdRCoShG','WRTwdgZcM8oRCSostWFdSJ8cFKldRsH7ySoBWOhcTCkzW5RdH2RdH0BcVMhdMSoZhmovhG','W5e9W65GWPa','WQboWR4','FupcVSkzeSocWQpcHq','WOBcKSkKyCoTi8kIW7PmzmkYs8kSzCoBW5afWRfbW6ro','WQ3cHKWL','ib/cNvFdIa','WQ3dMq4','W7pdOCkyW585WQdcOmkUgquTW5q','naldU8ogW6W','WQddGWRcR8oxWP7dHCk8','WRb1nq','WOlcImo+ACk6jgKkWRxcLepcTG','WP/JGklKVRZOGjRMJRxNPR/JGRNVVP/PQRZOR47OHjFMNiTaWPre5AwU6lwyW7NORP/LIOVKVjtMLylOH4tMNkVKURBKUy3MH5NLHiBLRA7dUW','W5BdKCoZFmoI','pK4Vp8oB','yCoSg8o0WQa','5OYj56Efew3dJUI1IUwmPdm','WQJcVCkEnSkX','W7pcTwtdV8o0aG','WR7cO8ke','f8ksWRVdJmo6g248qem','W6xdJmo1sSoa','fmoUlMG1oWJcT8kOW6O','WRNdJXhcPSo0','WRJcQmkBmW','uSoYf8oEWP8','ctP7W4/cPSotWO8rWQ7dRCkxWRj2AYC','WP9bvWhdSaC','CSomlCoFWRxdJq','WPJdGSokq8kme3BcNGeaW4a3aCkj','W4tdUCo8xatcR8ki','WOBcKSkKzSo/nSk+W7Pm','n0bpESoU','fHruh8or','atHJaSos','p8o2WQe','aLqU','vUAxK+wmJoocR8kKEoIoTUw/GG','W5ZdU1tdUSkFDCoy','W4LDW7RcJcC','gYiVn8koW5uhAg0nAW','W5WXW5yOnSoiovD6smoadJ7cQ8kqWOpcUSoUgmkWW7BdMuxcRaCseSoqWQqkW4jIWOW2baZcGSk5W47dSSkgW6FdR1JdPCk+BguZBuultSk/WR8fW5ZcG8k8dmkcWRxcL8k8WRZdNwxdPCk8W6nlWPfduIFcH0vaz8khafZcH8kEgmkhfSkSrSkUW6CrW4RdICo3bSoHW74DkCozcxZdQmoXy8k2vqOiWPKsW4KvoCofW5ldTL3dLmo5CSkSWQuxbIdcJautnmo2BSoMW5dcRsvcdmoffSk0W4RdUXTbBmk0W4TvdSkDfsddTCo2BWS','hdjM','5O6856sBBL3cPoI3SEwnS8k/','WP9ZWQn8W4K','cH7dHmol','rg9Y','q3r7ySofW7Cq','W4WnW6JdQX4','sIldMglcOa','WP5LW4ajW61xrCkqWR3cHrlcOhXXWPhdImo1W5C','r8oqWPpdM8o7k3eu','g2T5ySoH','W5VdR8oKxbK','WRBdH8kVW5rC','mGVdJCodW7O','5O+b56sjq3RdU+I2PownJ8ol','WO1OBx/cOq','W6OHW4pdUYxdGKJdIrJdMmoxuJ8O','p1bT','r8kWDtvdB1ddQW','W7BdKSozxdS','WRhcI0GWWPbdW7XMWQG7WPtcPSkAW4hdKmkzWPtcKYhdRwytW7ZdPxXQ','ucRcNSowsq','aeqTf8o9WR8','Cu4YW5pcMa','WO/cPGpdTCkgASoFbCk8W4tdVq','WQRJGBVOHOtMNitMJiRNPAVJGjlVVyBMSPVMNyZOJztLJjhLIlROT7VLJPxMLiJMJjS','WP3cNSo0','aHddLW','nmkfv8oGWRC','W7qVW47dHZW','wItdV2RcRa','tSkUDSksWONcIfRcJtFcU8odiG','W6ZcQdnFW53cImkqASoAxxOIWQ/cKNVdNt/dUCkbj2LcWOxdOSomW5a','WRpcLh8kWO4','EUobJEs9NEIbJUAnREEMQUobRo+9K+MRG+IUJ+IfQUADScn+W6lLPz3OTzxdSUIVR+wlHEs8QEAvTUIgToAEREs4H+s5VUAgJ+wgP+wVLHu','W4ddS8oLjHNcP8kdmSkvW4bDW64acSoS','WQ1bvHFcOW','iGpcMG','jd7dKSoKW4u','tUAvIEwnPUocU8o5W70','5O2h56EXEtCH6lw15y+liG','FNa4W6pcKq','kv9/sSoD','hs5M','W7HjW7/cTI8','WRb/pmoUBmor','tCkaW5ScW5z4DmkiktBdUeBcOG','WOdcHCo8zSk2','muHP','5O6756waoJid6lAG5y6/jW','W7lcKZnMW5y','W7xcVI5l','5O6+56wfWP3cH8oU6lE75y6+WPS','vUEjK+AdM+ocR8kKEa','FCo2nSoKWR0','Dv0mW5yx','h8oBWOTu','WPD2W5yekSonbfS','W4hdR0/dS8kcCG','aZj4fmomW6erjt4rfd0evW','W6r4WO53dW','fZH1bSosW74jiq','WPNcMSowxSkQ','WQRcR8kBoW','r3K+','WRrbWQpdHCoq','WQBcUSonW4j7W7tcT8klecyiWQpcISodW4W','WRhcRCoHWRXi','WRHNgwCx','D8oNWRiCsW','du9hECoF','tmkVDsT2','WPpcGSo6zSkrk0ym','W61LWRHDaW','aJHYpSorW6q','WP1YWRPsW6GpsSktW5VcK1hdVNnW','W4/dS8oV','WROCq1RcPSkUzSoFbWxcHMSoFvNcUhD6fCoPW5NcP8obWPRcNrpcHKZcPttdN8oSfG','W4uNW7nKWQm','WR1AWR7dT8k+tfviWQFcGmoH','WORdUSkaWRq','W67LSltORiBNI4NLIPpJGliDaq','r2L4','cUwWLEIVIUEjNowkVEocQuWo','hmkfqmo1WOW','W4FdTmo/FJu','W6KMW5xdIJe','CSotWRaf','5O6G56wNlgBcKoI2TUwoIMK','W517WPLAda','fxxcL8osWPe','W77cUbP1Ady'];}())];}())];}());_0x5562=function(){return _0x47a828;};return _0x5562();};async function get_zu(){const _0xa43771=_0x3b662b,_0x1c7638={'JoDEr':function(_0x5db1b0,_0x1939cb){return _0x5db1b0(_0x1939cb);},'tpBbT':function(_0x4403fc,_0x17fbaa){return _0x4403fc-_0x17fbaa;},'ykzIe':function(_0x1aff8e,_0x30345e){return _0x1aff8e*_0x30345e;},'fTmTZ':function(_0x56e060,_0x49f209){return _0x56e060!==_0x49f209;},'RDyZz':_0xa43771(0x237,'GP]N'),'IXnRE':_0xa43771(0x300,'GP]N'),'hkRpG':_0xa43771(0x230,'lv2X'),'OBoMO':function(_0x56d510,_0x1b4c7f){return _0x56d510<_0x1b4c7f;},'ZxGNU':function(_0x2af3f7){return _0x2af3f7();}};let _0x23bed3=0x0,_0x4dfa27=[];for(let _0x28d7b3=0x0;_0x1c7638[_0xa43771(0x242,'8puf')](_0x28d7b3,user_num);_0x28d7b3++){_0x4dfa27[_0xa43771(0x2f4,'GyS)')]({'num':_0x28d7b3+0x1,'qbid':user_data[_0x28d7b3][_0xa43771(0x289,'NddB')]('&')[0x0],'uid':user_data[_0x28d7b3][_0xa43771(0x344,'rV6w')]('&')[0x1],'token':user_data[_0x28d7b3][_0xa43771(0x271,'kCLY')]('&')[0x2],'type':user_data[_0x28d7b3][_0xa43771(0x211,'8puf')]('&')[0x3]});}_0x4dfa27['forEach']((_0x1fb623,_0x5d62de)=>{const _0x129d7c=_0xa43771,_0x4b4433={'pocGl':function(_0xf338e,_0xeeece2){const _0x298fd5=_0x57c7;return _0x1c7638[_0x298fd5(0x29b,'vwqw')](_0xf338e,_0xeeece2);},'LOPlX':function(_0xcdd180,_0x8cc4e7){const _0x3270bc=_0x57c7;return _0x1c7638[_0x3270bc(0x258,']94(')](_0xcdd180,_0x8cc4e7);}};if(_0x1c7638[_0x129d7c(0x383,'SBoI')](_0x1c7638[_0x129d7c(0x243,'%Tf8')],_0x1c7638[_0x129d7c(0x2ec,'VDFU')]))execAcList[_0x23bed3]?execAcList[_0x23bed3]['push'](_0x1fb623):_0x1c7638[_0x129d7c(0x248,'Wy@u')](_0x1c7638[_0x129d7c(0x287,'C)R)')],'eXNgo')?execAcList[_0x23bed3]=[_0x1fb623]:_0x1c7638[_0x129d7c(0x2f2,'GyS)')](_0x94bf75,_0x3f1c18);else{let _0x21e30b=_0x233192['ceil'](_0x4b4433[_0x129d7c(0x2c3,'sB(U')](_0x4b4433[_0x129d7c(0x259,'3o$0')](_0x158bc5[_0x129d7c(0x297,'W1iE')](),_0x568dba[_0x129d7c(0x2c2,']9p8')]),0x1));_0x5009a5+=_0x34a167[_0x21e30b];}}),await _0x1c7638[_0xa43771(0x1fc,'&VR0')](implement);}async function implement(){const _0x35628a=_0x3b662b,_0x51f75d={'KFAcu':function(_0x45a8af,_0x1b27ac){return _0x45a8af!=_0x1b27ac;},'IDnsN':_0x35628a(0x315,'$@p%'),'nrMFk':_0x35628a(0x2bc,'NddB'),'HQDvD':function(_0x3f094f,_0x4a5b56){return _0x3f094f===_0x4a5b56;},'UPODu':_0x35628a(0x1df,'GP]N')};let _0x285baf=[];if(execAcList[_0x35628a(0x1d9,'oxng')]>0x0){if(_0x51f75d[_0x35628a(0x27b,'hvqR')]===_0x51f75d['nrMFk']){for(let _0x49ea9a of execAcList){await Promise['all'](_0x49ea9a['map'](_0x4f1a3b=>start(_0x4f1a3b)));}notify&&(subTitle&&(_0x51f75d[_0x35628a(0x24c,'Mtrv')](_0x35628a(0x32b,'VDFU'),_0x51f75d[_0x35628a(0x31d,'!0F@')])?await notify['sendNotify']($[_0x35628a(0x224,'pA$d')],subTitle):_0xd75004[_0x35628a(0x1e8,'NddB')]('\x0a【'+_0x135962+_0x35628a(0x319,'nBL&')+_0x54373e[_0x35628a(0x334,'D%59')]+_0x35628a(0x25e,'W1iE'))));}else{_0x26a247=_0x1ef14b[_0x35628a(0x37a,'OFlX')](/作者TG_ID:(\S*)/)[0x1]['replace'](/_/g,'><');if(_0x51f75d[_0x35628a(0x1e6,'y60y')](_0x28e6bb[_0x35628a(0x2dc,'VDFU')](/t.me\/(\S*)/)[0x1],_0x51f75d[_0x35628a(0x2f5,'1pCV')]))throw new _0x35d1c7(_0x35628a(0x31c,'4u(^'));}}else console[_0x35628a(0x1f3,'VDFU')](_0x35628a(0x376,'1pCV'));}async function start(_0x182e56){await BankTask(_0x182e56),await Sleep_time(0x1,0x2),await answer_game(_0x182e56);};function BankTask(_0x52e325){const _0x50d141=_0x3b662b,_0x55cf78={'FYmih':function(_0x1cd6bd,_0x461cff){return _0x1cd6bd==_0x461cff;},'dREpF':function(_0x171f00,_0x3e6da5){return _0x171f00==_0x3e6da5;},'IqKku':'AMfbf','RlSxR':_0x50d141(0x374,']94('),'RolOR':function(_0x4800f0,_0x375dc7){return _0x4800f0>=_0x375dc7;},'XSlEb':function(_0x173148,_0x2a2de8){return _0x173148>_0x2a2de8;},'Pcujw':_0x50d141(0x226,'C)R)'),'fgAjg':function(_0x106d80,_0x239010){return _0x106d80(_0x239010);},'GsfsA':_0x50d141(0x24d,'e6YJ'),'cerCh':_0x50d141(0x267,'VDFU'),'qlnmb':'qqunion','VgKEO':'valid','vNbfL':_0x50d141(0x236,'8puf'),'VaHfG':_0x50d141(0x1b8,'wvjy'),'TmqDR':_0x50d141(0x1c5,'D%59'),'VZvAQ':_0x50d141(0x238,'yEnN'),'ZlZhh':function(_0x51f3f7,_0x3c580a){return _0x51f3f7/_0x3c580a;},'duTkg':function(_0x1d4d51,_0x1a31f0){return _0x1d4d51==_0x1a31f0;},'UfaYD':_0x50d141(0x2a9,'3o$0'),'EltbB':function(_0x51a635,_0x509216){return _0x51a635==_0x509216;},'Blndu':_0x50d141(0x213,'Mtrv'),'oGLfZ':'kJsBZ','cBdRJ':_0x50d141(0x30f,'hvqR'),'BGiKZ':_0x50d141(0x1f9,'lv2X')};let _0x104012=Math[_0x50d141(0x1d0,'kL6Q')](_0x55cf78[_0x50d141(0x323,'2q(y')](new Date()['getTime'](),0x3e8))['toString'](),_0x415450='',_0x2eeeed='',_0x58eaeb='';if(_0x55cf78['duTkg'](_0x52e325['type'],'sj'))_0x415450=_0x50d141(0x2d7,'NddB'),_0x58eaeb='6',_0x2eeeed=_0x55cf78[_0x50d141(0x386,']94(')];else{if(_0x55cf78[_0x50d141(0x35a,'sB(U')](_0x52e325['type'],'wx')){if(_0x55cf78['Blndu']===_0x55cf78[_0x50d141(0x2c5,'Wy@u')]){let _0x28be4b=_0x1956ea[_0x50d141(0x294,'%Tf8')](_0x3a505e);_0x55cf78[_0x50d141(0x263,'wvjy')](_0x28be4b['code'],0x0)?_0x42f458[_0x50d141(0x38d,'nBL&')]('\x0a【'+_0x18d885+_0x50d141(0x24f,'Wy@u')+_0x40b651['num']+_0x50d141(0x358,'3o$0')+_0x28be4b[_0x50d141(0x360,'oxng')][_0x50d141(0x247,'$@p%')]+'金币'):(_0x5c528a['log']('\x0a【'+_0x52867f+_0x50d141(0x25a,'GyS)')+_0x2b5fc0[_0x50d141(0x207,'GP]N')]+_0x50d141(0x29d,'yEnN')+_0x28be4b['msg']),_0x3d03b5+='\x0a【'+_0x32e21c+_0x50d141(0x1eb,'VDFU')+_0x4541e4[_0x50d141(0x361,'W1iE')]+_0x50d141(0x2ad,'D%59')+_0x28be4b[_0x50d141(0x246,'y60y')]);}else _0x415450=_0x55cf78['cBdRJ'],_0x58eaeb='2',_0x2eeeed='wx';}else _0x415450=_0x55cf78[_0x50d141(0x305,'smVb')],_0x58eaeb='4',_0x2eeeed=_0x50d141(0x359,'X@uT');}var _0x1a7ec1='{\x22businessId\x22:701,\x22userInfo\x22:{\x22isLogin\x22:1,\x22mainAccount\x22:\x22'+_0x2eeeed+_0x50d141(0x26c,'y60y')+_0x52e325[_0x50d141(0x39c,'rV6w')]+_0x50d141(0x2b4,'GyS)')+_0x58eaeb+_0x50d141(0x292,'nBL&')+_0x52e325['uid']+_0x50d141(0x2aa,'wvjy')+_0x52e325['token']+_0x50d141(0x375,'X@uT')+_0x415450+_0x50d141(0x1fb,'2q(y')+_0x52e325['uid']+'\x22},\x22appInfo\x22:{\x22guid\x22:\x22a6d9c2af75bfc118112ba06b7ef988cb\x22,\x22qua\x22:\x22PP=com.tencent.mtt&PPVN=13.7.1.1041&TBSVC=45001\x22,\x22qimei36\x22:\x22\x22,\x22oaid\x22:\x22\x22}}';return new Promise(_0x4af339=>{const _0x9a20b=_0x50d141,_0x276070={'pgNSH':function(_0x3ed248,_0x65f1f5){return _0x3ed248(_0x65f1f5);},'IMtnN':'100446242','dRYhI':_0x55cf78[_0x9a20b(0x2b5,'8puf')]};let _0x5428f3={'url':_0x9a20b(0x306,'oxng'),'headers':{'Host':_0x9a20b(0x2b3,'Wy@u'),'content-length':_0x1a7ec1[_0x9a20b(0x373,'5e(r')],'sec-fetch-mode':'cors','origin':_0x9a20b(0x37d,'g1eM'),'ug-welfare':_0x55cf78[_0x9a20b(0x364,'GyS)')],'user-agent':'Mozilla/5.0\x20(Linux;\x20U;\x20Android\x2010)','Content-Type':_0x9a20b(0x21b,'SBoI'),'q-timestamp':_0x104012,'is-from':_0x9a20b(0x30e,'SBoI'),'accept':_0x55cf78[_0x9a20b(0x1d7,'GUZq')],'x-requested-with':_0x55cf78[_0x9a20b(0x23e,'vwqw')],'sec-fetch-site':_0x55cf78[_0x9a20b(0x2c7,'e6YJ')],'accept-encoding':_0x55cf78[_0x9a20b(0x24b,'H7]r')],'accept-language':_0x9a20b(0x332,'6xq#'),'Cookie':''},'body':_0x1a7ec1};$[_0x9a20b(0x2ed,'zy3i')](_0x5428f3,async(_0x20486e,_0x1dd666,_0xb17228)=>{const _0x35edc5=_0x9a20b;try{if(_0x20486e)console['log']('\x0a【'+Tips+'提示---账号\x20'+_0x52e325[_0x35edc5(0x2dd,'OFlX')]+'\x20状态】:\x20返回\x20'+_0x20486e),subTitle+='\x0a【'+Tips+_0x35edc5(0x38e,'dejF')+_0x52e325[_0x35edc5(0x32d,'g1eM')]+'\x20状态】:\x20返回\x20'+_0x20486e;else{let _0x4b510b=JSON['parse'](_0xb17228);if(_0x55cf78['dREpF'](_0x4b510b[_0x35edc5(0x1d3,'C)R)')],0x0)){if(_0x55cf78[_0x35edc5(0x266,'zy3i')]!==_0x55cf78[_0x35edc5(0x209,'$@p%')]){if(_0x55cf78[_0x35edc5(0x341,'5e(r')](_0x4b510b[_0x35edc5(0x225,'&VR0')][_0x35edc5(0x33c,'8puf')][_0x35edc5(0x219,'8puf')],_0x4b510b[_0x35edc5(0x1d2,'1pCV')][_0x35edc5(0x1fe,'Mtrv')]['maxTotalAmount']))_0x55cf78[_0x35edc5(0x2d3,']94(')](_0x4b510b[_0x35edc5(0x2ee,'zy3i')][_0x35edc5(0x1be,'yEnN')][_0x35edc5(0x30c,'kCLY')],0x0)?(_0x52e325['coin']=_0x4b510b[_0x35edc5(0x21d,'C)R)')][_0x35edc5(0x36f,'Wy@u')][_0x35edc5(0x2c4,'oxng')],await acceptCoin(_0x52e325)):console[_0x35edc5(0x35d,'s2yj')]('\x0a【'+Tips+_0x35edc5(0x320,'X@uT')+_0x52e325['num']+'\x20状态】:\x20币币机累了，明天再工作吧！');else{if(_0x4b510b[_0x35edc5(0x22b,'W1iE')][_0x35edc5(0x29c,'GUZq')]['maxRemainAmount']==_0x4b510b['data']['coinBank']['remainAmount'])_0x55cf78[_0x35edc5(0x288,'Mtrv')]===_0x55cf78[_0x35edc5(0x26a,'wvjy')]?(_0x52e325[_0x35edc5(0x2a7,'kCLY')]=0x24,await _0x55cf78['fgAjg'](acceptCoin,_0x52e325)):_0x276070[_0x35edc5(0x20a,'rV6w')](_0x16782c,_0x25aa67);else{if(_0x35edc5(0x299,']94(')===_0x35edc5(0x278,'s2yj'))console[_0x35edc5(0x378,'oxng')]('\x0a【'+Tips+_0x35edc5(0x32f,'C)R)')+_0x52e325[_0x35edc5(0x334,'D%59')]+_0x35edc5(0x273,'35WN')+_0x4b510b[_0x35edc5(0x1cd,'[Jc3')][_0x35edc5(0x24a,'FsUN')][_0x35edc5(0x33e,'yEnN')]+'/'+_0x4b510b[_0x35edc5(0x2ee,'zy3i')]['coinBank']['maxRemainAmount']);else throw new _0x13a0a2('\x0a【作者提示】：验证脚本SHA失败,请勿修改脚本中任意内容\x0a');}}}else _0x1035b0[_0x35edc5(0x301,'H7]r')]('\x0a【'+_0x10bcf6+'提示---账号\x20'+_0x567f7d[_0x35edc5(0x312,'SBoI')]+'\x20收取】:\x20'+_0x28af82['msg']),_0x1b4259+='\x0a【'+_0x3ee22a+_0x35edc5(0x32f,'C)R)')+_0x2e6832[_0x35edc5(0x339,'8puf')]+_0x35edc5(0x384,'oxng')+_0x327ffd[_0x35edc5(0x377,'yEnN')];}else console[_0x35edc5(0x39d,']94(')]('\x0a【'+Tips+_0x35edc5(0x210,'hvqR')+_0x52e325['num']+'\x20状态】:\x20'+_0x4b510b[_0x35edc5(0x23c,'8puf')]),subTitle+='\x0a【'+Tips+'提示---账号\x20'+_0x52e325[_0x35edc5(0x28a,'1pCV')]+_0x35edc5(0x392,'3o$0')+_0x4b510b[_0x35edc5(0x388,'s2yj')];}}catch(_0x1be1aa){}finally{_0x55cf78[_0x35edc5(0x286,'zy3i')]!==_0x55cf78[_0x35edc5(0x2e0,'SBoI')]?_0x4af339(_0x52e325):(_0x25e667=_0x276070[_0x35edc5(0x34c,'4u(^')],_0x33398f='4',_0x11a5da=_0x276070[_0x35edc5(0x206,'pA$d')]);};});});};function acceptCoin(_0x20d07a){const _0x2b0994=_0x3b662b,_0x43b1dc={'HIyEi':'100446242','IojxZ':'qqunion','EQoaT':_0x2b0994(0x2da,'wvjy'),'RySNb':function(_0x146356,_0x5030a0){return _0x146356<_0x5030a0;},'qVpHJ':function(_0x494659,_0x4da92f){return _0x494659-_0x4da92f;},'vnUAB':function(_0x38937c,_0x5ef757){return _0x38937c*_0x5ef757;},'wITZo':_0x2b0994(0x27a,'&VR0'),'WRcpq':_0x2b0994(0x1d4,'sB(U'),'kbGZu':function(_0x48a24b,_0x449c32){return _0x48a24b===_0x449c32;},'vLXmN':_0x2b0994(0x1e7,'lv2X'),'hpipw':function(_0x2b73d5,_0x4faebb){return _0x2b73d5==_0x4faebb;},'hZGDa':function(_0xb36a01,_0x2ddb0b){return _0xb36a01!==_0x2ddb0b;},'qebIo':_0x2b0994(0x221,'kL6Q'),'SOOXH':_0x2b0994(0x372,'GP]N'),'Zlssl':'ugpage.html5.qq.com','BGtcR':'cors','oqpUi':_0x2b0994(0x2d2,'I]5I'),'repEY':_0x2b0994(0x330,'5e(r'),'odqXw':'Mozilla/5.0\x20(Linux;\x20U;\x20Android\x2010)','SbbGa':_0x2b0994(0x329,'[Jc3'),'jURDI':_0x2b0994(0x317,'I]5I'),'NekuT':'same-origin','ssToH':_0x2b0994(0x229,'3o$0'),'wxOac':function(_0x164b19,_0x45dc84){return _0x164b19/_0x45dc84;},'QPGwF':function(_0x29f659,_0x3f6809){return _0x29f659==_0x3f6809;},'qJQEA':_0x2b0994(0x200,'OFlX'),'BbXOh':_0x2b0994(0x38c,'yEnN'),'Sqeff':function(_0x254042,_0x2c4a2b){return _0x254042==_0x2c4a2b;},'RVqhR':_0x2b0994(0x365,'!0F@')};let _0x5ac3d=Math['round'](_0x43b1dc[_0x2b0994(0x268,'oxng')](new Date()[_0x2b0994(0x27c,'W1iE')](),0x3e8))['toString'](),_0x2f3196='',_0x542930='',_0x3cc591='';if(_0x43b1dc['QPGwF'](_0x20d07a[_0x2b0994(0x233,'dejF')],'sj'))_0x2b0994(0x28b,'35WN')===_0x43b1dc['qJQEA']?(_0x79a2b=_0x43b1dc[_0x2b0994(0x1cf,'lv2X')],_0x488f1e='4',_0x218091=_0x2b0994(0x1e4,'hvqR')):(_0x2f3196=_0x2b0994(0x228,'W1iE'),_0x3cc591='6',_0x542930=_0x43b1dc[_0x2b0994(0x235,'%Tf8')]);else _0x43b1dc[_0x2b0994(0x2f1,'vwqw')](_0x20d07a[_0x2b0994(0x337,'NddB')],'wx')?(_0x2f3196=_0x43b1dc[_0x2b0994(0x31f,'5e(r')],_0x3cc591='2',_0x542930='wx'):(_0x2f3196=_0x43b1dc['HIyEi'],_0x3cc591='4',_0x542930=_0x43b1dc[_0x2b0994(0x328,'H7]r')]);var _0x334fd0=_0x2b0994(0x1c3,'6xq#')+_0x20d07a[_0x2b0994(0x395,'FsUN')]+_0x2b0994(0x35c,'H7]r')+_0x542930+_0x2b0994(0x25b,'nBL&')+_0x20d07a['qbid']+_0x2b0994(0x352,'2q(y')+_0x3cc591+_0x2b0994(0x2b8,'2q(y')+_0x20d07a[_0x2b0994(0x1f2,'zy3i')]+_0x2b0994(0x336,'2q(y')+_0x20d07a['token']+'\x22,\x22appid\x22:\x22'+_0x2f3196+_0x2b0994(0x291,'e6YJ')+_0x20d07a['uid']+'\x22},\x22appInfo\x22:{\x22guid\x22:\x22a6d9c2af75bfc118112ba06b7ef988cb\x22,\x22qua\x22:\x22PP=com.tencent.mtt&PPVN=13.7.1.1041&TBSVC=45001\x22,\x22qimei36\x22:\x22\x22,\x22oaid\x22:\x22\x22}}';return new Promise(_0x432cfd=>{const _0xd56c4b=_0x2b0994,_0x1bc1a3={'uUndn':function(_0x3d8374,_0x47ea6f){return _0x43b1dc['hpipw'](_0x3d8374,_0x47ea6f);}};let _0x47bdab={'url':_0xd56c4b(0x2e4,'rV6w'),'headers':{'Host':_0x43b1dc[_0xd56c4b(0x2e1,'dejF')],'content-length':_0x334fd0['length'],'sec-fetch-mode':_0x43b1dc[_0xd56c4b(0x22f,'yEnN')],'origin':_0x43b1dc['oqpUi'],'ug-welfare':_0x43b1dc['repEY'],'user-agent':_0x43b1dc[_0xd56c4b(0x25d,'FsUN')],'Content-Type':'application/json;charset=UTF-8','q-timestamp':_0x5ac3d,'is-from':'qbff','accept':_0x43b1dc[_0xd56c4b(0x2a4,'35WN')],'x-requested-with':_0x43b1dc[_0xd56c4b(0x2a0,'2q(y')],'sec-fetch-site':_0x43b1dc[_0xd56c4b(0x284,'I]5I')],'accept-encoding':_0xd56c4b(0x22c,'e6YJ'),'accept-language':_0x43b1dc[_0xd56c4b(0x2a5,'W1iE')],'Cookie':''},'body':_0x334fd0};$['post'](_0x47bdab,async(_0x2a8dfb,_0x332542,_0x1e2eb1)=>{const _0x3ffbdc=_0xd56c4b,_0x5949bc={'UTqkz':'100446242','kVvMQ':_0x43b1dc['IojxZ'],'BRpQy':_0x43b1dc[_0x3ffbdc(0x1db,'e6YJ')],'QpCEt':function(_0x2fb9ff,_0x2acb6c){const _0x2e317f=_0x3ffbdc;return _0x43b1dc[_0x2e317f(0x28e,'GUZq')](_0x2fb9ff,_0x2acb6c);},'pwDFQ':function(_0x31ebef,_0xc60c11){const _0x2b800a=_0x3ffbdc;return _0x43b1dc[_0x2b800a(0x333,'1pCV')](_0x31ebef,_0xc60c11);},'vbKMM':function(_0x2faa7a,_0x465f86){const _0x472161=_0x3ffbdc;return _0x43b1dc[_0x472161(0x35f,'!0F@')](_0x2faa7a,_0x465f86);},'oxZTK':_0x43b1dc[_0x3ffbdc(0x2bf,'3o$0')]};try{if(_0x43b1dc['WRcpq']===_0x43b1dc[_0x3ffbdc(0x1dc,'VDFU')]){if(_0x2a8dfb)_0x43b1dc[_0x3ffbdc(0x201,'e6YJ')]('MtmGX',_0x43b1dc[_0x3ffbdc(0x302,'$@p%')])?(_0x52f4dd=_0x5949bc['UTqkz'],_0x366715='4',_0x5c4985=_0x5949bc[_0x3ffbdc(0x2d9,'pA$d')]):(console['log']('\x0a【'+Tips+_0x3ffbdc(0x343,'NddB')+_0x20d07a[_0x3ffbdc(0x283,'e6YJ')]+'\x20收取】:\x20返回\x20'+_0x2a8dfb),subTitle+='\x0a【'+Tips+_0x3ffbdc(0x2e3,'vwqw')+_0x20d07a[_0x3ffbdc(0x32d,'g1eM')]+_0x3ffbdc(0x240,'OFlX')+_0x2a8dfb);else{let _0x2e07d3=JSON['parse'](_0x1e2eb1);if(_0x43b1dc[_0x3ffbdc(0x1bd,'Wy@u')](_0x2e07d3[_0x3ffbdc(0x2c6,'NddB')],0x0)){if(_0x43b1dc[_0x3ffbdc(0x256,'lv2X')]('yWhGN',_0x43b1dc[_0x3ffbdc(0x355,'s2yj')])){let _0x2d4718=_0x5949bc[_0x3ffbdc(0x2af,']94(')],_0x334d88='';for(let _0x1d51d5=0x0;_0x5949bc[_0x3ffbdc(0x295,'wvjy')](_0x1d51d5,_0x95eac6);_0x1d51d5++){let _0x22d514=_0x206a75['ceil'](_0x5949bc['pwDFQ'](_0x5949bc['vbKMM'](_0x5d0197[_0x3ffbdc(0x1ee,'lv2X')](),_0x2d4718[_0x3ffbdc(0x38a,'vwqw')]),0x1));_0x334d88+=_0x2d4718[_0x22d514];}return _0x334d88;}else console[_0x3ffbdc(0x33d,'vwqw')]('\x0a【'+Tips+_0x3ffbdc(0x25c,'zy3i')+_0x20d07a[_0x3ffbdc(0x382,'35WN')]+'\x20收取】:\x20获得'+_0x2e07d3['data'][_0x3ffbdc(0x23d,'6xq#')]+'金币');}else _0x3ffbdc(0x1f5,'FsUN')===_0x43b1dc[_0x3ffbdc(0x215,'!0F@')]?(console['log']('\x0a【'+Tips+_0x3ffbdc(0x385,'$@p%')+_0x20d07a['num']+_0x3ffbdc(0x2fa,'[Jc3')+_0x2e07d3[_0x3ffbdc(0x1ef,'lv2X')]),subTitle+='\x0a【'+Tips+_0x3ffbdc(0x28f,'!0F@')+_0x20d07a['num']+_0x3ffbdc(0x2fd,'35WN')+_0x2e07d3['msg']):(_0x34923b=_0x5949bc[_0x3ffbdc(0x1ec,'rV6w')],_0x400d4b='6',_0x56f443='phone');}}else{let _0x119b3d=_0x585eaf[_0x3ffbdc(0x222,'GP]N')](_0x1f5753);_0x1bc1a3['uUndn'](_0x119b3d[_0x3ffbdc(0x1c0,'s2yj')]['status'],0x1)?_0x2acffd[_0x3ffbdc(0x1e3,'!0F@')]('\x0a【'+_0xf4b11f+_0x3ffbdc(0x2f6,'H7]r')+_0x1abe93[_0x3ffbdc(0x357,'5e(r')]+_0x3ffbdc(0x23f,'1pCV')+_0x119b3d['result'][_0x3ffbdc(0x347,'3o$0')]+'金币'):(_0x59fde6['log']('\x0a【'+_0x56e9ee+_0x3ffbdc(0x23a,'rV6w')+_0x2b9023[_0x3ffbdc(0x1f6,'sB(U')]+'\x20小试牛刀】:\x20'+_0x119b3d[_0x3ffbdc(0x331,'GUZq')]['msg']),_0xe88492+='\x0a【'+_0x498690+'提示---账号\x20'+_0x5b0799[_0x3ffbdc(0x31a,'oxng')]+_0x3ffbdc(0x1c9,'W1iE')+_0x119b3d[_0x3ffbdc(0x316,'g1eM')][_0x3ffbdc(0x23c,'8puf')]);}}catch(_0x46520c){}finally{_0x432cfd(_0x20d07a);};});});};function answer_game(_0x12efac){const _0x5497a1=_0x3b662b,_0x39d812={'ArsXF':function(_0x21c85e,_0x121e3b){return _0x21c85e(_0x121e3b);},'zzpWC':'axios','oqsPa':_0x5497a1(0x264,'nBL&'),'EIQKz':function(_0x35cbec,_0x1b552e){return _0x35cbec===_0x1b552e;},'HOuDL':_0x5497a1(0x1cb,'Mtrv'),'jivBZ':_0x5497a1(0x241,'&VR0'),'LyxPd':'YgmDe','DAMTJ':function(_0x43d925,_0x858126){return _0x43d925===_0x858126;},'tTrAa':'qPMeD','xslTt':_0x5497a1(0x20c,'W1iE'),'jkCJm':_0x5497a1(0x371,'NddB'),'rAdQr':'valid','xuQPe':_0x5497a1(0x325,'VDFU'),'FLwpv':'application/json;charset=UTF-8','aUvxl':'qbff','EDuza':_0x5497a1(0x2f7,'3o$0'),'jbFks':_0x5497a1(0x21f,'lv2X'),'sFSyk':_0x5497a1(0x2c0,'zy3i'),'vOtIx':function(_0x2dc492,_0x3c2b15){return _0x2dc492==_0x3c2b15;},'iwEVy':function(_0x1e4a0d,_0x52019f){return _0x1e4a0d===_0x52019f;},'WVcaK':_0x5497a1(0x2c8,'s2yj'),'tiXRE':'3003','qJnhj':'phone','lNGrz':function(_0x1df25f,_0x408c18){return _0x1df25f==_0x408c18;},'BUJIS':_0x5497a1(0x2eb,'s2yj'),'XYAFw':function(_0x397b0e,_0x4a6ba3){return _0x397b0e!==_0x4a6ba3;},'LakBW':_0x5497a1(0x265,'35WN'),'jgAhy':_0x5497a1(0x28d,'5e(r'),'RYoWu':'qqunion'};let _0x507ff4=Math[_0x5497a1(0x340,'2q(y')](new Date()[_0x5497a1(0x351,'Mtrv')]()/0x3e8)[_0x5497a1(0x2d6,'nBL&')](),_0x17d78f='',_0x1fc6b8='',_0x4576be='';if(_0x39d812[_0x5497a1(0x38f,'g1eM')](_0x12efac[_0x5497a1(0x217,'1pCV')],'sj')){if(_0x39d812['iwEVy'](_0x39d812['WVcaK'],_0x39d812['WVcaK']))_0x17d78f=_0x39d812['tiXRE'],_0x4576be='6',_0x1fc6b8=_0x39d812[_0x5497a1(0x399,'lv2X')];else throw new _0x189466(_0x5497a1(0x1e5,'$@p%'));}else _0x39d812[_0x5497a1(0x277,'GyS)')](_0x12efac[_0x5497a1(0x214,'vwqw')],'wx')?_0x39d812[_0x5497a1(0x39b,'yEnN')](_0x5497a1(0x281,'5e(r'),_0x39d812[_0x5497a1(0x1e0,'oxng')])?(_0x17d78f=_0x39d812[_0x5497a1(0x2b9,'%Tf8')],_0x4576be='2',_0x1fc6b8='wx'):_0x4ecd72['log']('\x0a【'+_0x3bcac0+_0x5497a1(0x38e,'dejF')+_0xc9d18[_0x5497a1(0x249,'s2yj')]+'\x20小试牛刀】:\x20获得'+_0x321977[_0x5497a1(0x2f0,'X@uT')][_0x5497a1(0x2a3,'[Jc3')]+'金币'):_0x39d812['XYAFw'](_0x39d812[_0x5497a1(0x257,'vwqw')],_0x39d812[_0x5497a1(0x353,'nBL&')])?(_0x17d78f=_0x5497a1(0x1f7,'VDFU'),_0x4576be='4',_0x1fc6b8=_0x39d812['RYoWu']):_0x15583e=_0x2c0595[_0x5497a1(0x338,'zy3i')](/(\S*)TG_ID:@ls_soy/)[0x1];var _0x2e6250=_0x5497a1(0x2e8,'FsUN')+_0x12efac[_0x5497a1(0x390,'g1eM')]+_0x5497a1(0x2b6,'8puf')+_0x4576be+_0x5497a1(0x2df,']9p8')+_0x12efac['uid']+_0x5497a1(0x30a,'5e(r')+_0x17d78f+_0x5497a1(0x34d,']94(')+_0x12efac[_0x5497a1(0x2a1,'rV6w')]+'\x22}}';return new Promise(_0x3480fb=>{const _0x1caed4=_0x5497a1,_0x159413={'iUVuQ':_0x39d812['oqsPa'],'txqXJ':function(_0x41f2c4,_0x55db0c){const _0x28fa10=_0x57c7;return _0x39d812[_0x28fa10(0x32e,'GUZq')](_0x41f2c4,_0x55db0c);},'AFSPx':_0x39d812[_0x1caed4(0x274,'8puf')],'jjFGx':_0x39d812['jivBZ'],'eIUKM':function(_0x1ee7c5,_0x31d680){return _0x1ee7c5!==_0x31d680;},'qsBGm':_0x1caed4(0x2cf,'hvqR'),'zcrga':_0x39d812['LyxPd'],'UNQTV':_0x1caed4(0x25f,'y60y')};if(_0x39d812[_0x1caed4(0x276,'nBL&')](_0x39d812['tTrAa'],_0x1caed4(0x2b7,'H7]r'))){let _0xf17fe5={'url':'https://searchactivity.html5.qq.com/search_activity/answer_game/award_lightweight_answer','headers':{'Host':'searchactivity.html5.qq.com','content-length':_0x2e6250[_0x1caed4(0x308,'y60y')],'sec-fetch-mode':_0x39d812[_0x1caed4(0x368,'Mtrv')],'origin':_0x39d812[_0x1caed4(0x37e,'NddB')],'ug-welfare':_0x39d812[_0x1caed4(0x205,'rV6w')],'user-agent':_0x39d812['xuQPe'],'Content-Type':_0x39d812[_0x1caed4(0x367,'nBL&')],'q-timestamp':_0x507ff4,'is-from':_0x39d812[_0x1caed4(0x1bb,'[Jc3')],'accept':_0x39d812['EDuza'],'x-requested-with':_0x1caed4(0x380,'Mtrv'),'sec-fetch-site':_0x39d812[_0x1caed4(0x212,'NddB')],'accept-encoding':_0x1caed4(0x2e9,'s2yj'),'accept-language':_0x39d812[_0x1caed4(0x260,'nBL&')],'Cookie':''},'body':_0x2e6250};$[_0x1caed4(0x31b,'8puf')](_0xf17fe5,async(_0x2eba04,_0xd55ee2,_0xfca619)=>{const _0x52217b=_0x1caed4,_0x5b0b83={'znGsH':_0x159413['iUVuQ']};try{console[_0x52217b(0x26e,'2q(y')](_0xfca619);if(_0x2eba04)_0x159413[_0x52217b(0x387,'nBL&')](_0x159413['AFSPx'],_0x52217b(0x1ed,'smVb'))?(console[_0x52217b(0x30b,'sB(U')]('\x0a【'+Tips+_0x52217b(0x318,']9p8')+_0x12efac['num']+'\x20小试牛刀】:\x20返回\x20'+_0x2eba04),subTitle+='\x0a【'+Tips+'提示---账号\x20'+_0x12efac['num']+'\x20小试牛刀】:\x20返回\x20'+_0x2eba04):_0x10754a[_0x52217b(0x1c2,'Mtrv')]('\x0a【脚本提示】：没有获取到账号数据');else{if(_0x159413['jjFGx']==='DaufJ'){let _0x405a03=JSON['parse'](_0xfca619);_0x405a03[_0x52217b(0x26f,'$@p%')]['status']==0x1?_0x159413['eIUKM'](_0x159413[_0x52217b(0x30d,'oxng')],_0x52217b(0x2d4,'%Tf8'))?_0x3f5372[_0x7f9d37]=[_0x7a7b17]:console['log']('\x0a【'+Tips+_0x52217b(0x1ce,'s2yj')+_0x12efac['num']+_0x52217b(0x1d6,'pA$d')+_0x405a03['result']['awardCoins']+'金币'):_0x159413['eIUKM'](_0x159413[_0x52217b(0x34a,'8puf')],_0x52217b(0x245,'zy3i'))?(console[_0x52217b(0x1c2,'Mtrv')]('\x0a【'+Tips+_0x52217b(0x391,'oxng')+_0x12efac['num']+'\x20小试牛刀】:\x20'+_0x405a03['result']['msg']),subTitle+='\x0a【'+Tips+_0x52217b(0x319,'nBL&')+_0x12efac[_0x52217b(0x2fb,']94(')]+_0x52217b(0x1c7,'D%59')+_0x405a03[_0x52217b(0x2e2,'pA$d')][_0x52217b(0x1c8,'W1iE')]):(_0x2ab503=_0x5b0b83['znGsH'],_0x3e6a95='2',_0x5e2497='wx');}else{_0x97cd91[_0x52217b(0x244,'I]5I')](_0x52217b(0x29f,'GUZq'));return;}}}catch(_0x18046f){}finally{_0x159413[_0x52217b(0x389,'sB(U')](_0x52217b(0x1d5,'smVb'),_0x159413[_0x52217b(0x370,'Mtrv')])?(_0x524743[_0x52217b(0x220,'3o$0')]('\x0a【'+_0xb6b8fa+_0x52217b(0x322,'smVb')+_0xc48012['num']+'\x20状态】:\x20返回\x20'+_0x2d5fae),_0x30090d+='\x0a【'+_0x3ca3b4+'提示---账号\x20'+_0x46c17d['num']+_0x52217b(0x20d,'Wy@u')+_0x36e30d):_0x3480fb(_0x12efac);};});}else _0x490302=_0x341aac['isNode']()?_0x39d812[_0x1caed4(0x348,'2q(y')](_0x46b108,_0x39d812[_0x1caed4(0x1b7,'D%59')]):'';});};function encryptAes(_0x297544){const _0x7c7117=_0x3b662b,_0x34f690={'SgEYn':_0x7c7117(0x203,'1pCV'),'cjWVn':_0x7c7117(0x32c,'dejF')};let _0x36315c=CryptoJs['AES'][_0x7c7117(0x239,'[Jc3')](CryptoJs[_0x7c7117(0x20b,'&VR0')][_0x7c7117(0x2a6,'hvqR')][_0x7c7117(0x1ba,'e6YJ')](_0x297544),CryptoJs[_0x7c7117(0x1f1,'2q(y')][_0x7c7117(0x2d1,'GP]N')][_0x7c7117(0x36a,'SBoI')](_0x34f690[_0x7c7117(0x298,']94(')]),{'iv':CryptoJs[_0x7c7117(0x1f0,'3o$0')][_0x7c7117(0x1c6,'C)R)')][_0x7c7117(0x381,']9p8')](_0x34f690[_0x7c7117(0x1da,'FsUN')]),'mode':CryptoJs[_0x7c7117(0x28c,'1pCV')][_0x7c7117(0x356,'FsUN')],'padding':CryptoJs['pad'][_0x7c7117(0x255,'1pCV')]}),_0x474dd5=CryptoJs[_0x7c7117(0x1f0,'3o$0')][_0x7c7117(0x34e,']9p8')][_0x7c7117(0x2f9,'GyS)')](_0x36315c[_0x7c7117(0x2ef,'&VR0')]);return _0x474dd5;};async function Sleep_time(_0x33c517,_0x1d6600){const _0x57cb97=_0x3b662b,_0x52a937={'ijPHn':function(_0x32f96d,_0x5cc556){return _0x32f96d+_0x5cc556;},'PAJjB':function(_0x408709,_0x3f2cfd){return _0x408709-_0x3f2cfd;},'kkJwt':function(_0x411d0b,_0x2029db){return _0x411d0b*_0x2029db;},'FalMC':function(_0x2d21d3,_0x3bc823){return _0x2d21d3*_0x3bc823;}};await $[_0x57cb97(0x1e2,'kL6Q')](Math[_0x57cb97(0x204,'35WN')](Math['random']()*_0x52a937['ijPHn'](_0x52a937[_0x57cb97(0x24e,'%Tf8')](_0x52a937['kkJwt'](_0x1d6600,0x3e8),_0x52a937[_0x57cb97(0x2ce,'VDFU')](_0x33c517,0x3e8)),0x1))+_0x52a937[_0x57cb97(0x37b,'GyS)')](_0x33c517,0x3e8));}function getRandom(_0x3473ca){const _0x277f5b=_0x3b662b,_0x516634={'zFoop':_0x277f5b(0x279,']94('),'glnVX':function(_0x238ec3,_0x54b3f9){return _0x238ec3<_0x54b3f9;}};let _0x19a421=_0x516634['zFoop'],_0x217449='';for(let _0x57fd11=0x0;_0x516634[_0x277f5b(0x2d5,'VDFU')](_0x57fd11,_0x3473ca);_0x57fd11++){let _0x5b224f=Math[_0x277f5b(0x34b,'rV6w')](Math[_0x277f5b(0x2d8,'vwqw')]()*_0x19a421[_0x277f5b(0x345,'GUZq')]-0x1);_0x217449+=_0x19a421[_0x5b224f];}return _0x217449;}function getnum(_0x5b4eed){const _0x8f5d54=_0x3b662b,_0x2dfa12={'qSric':function(_0x123932,_0x14d158){return _0x123932<_0x14d158;},'EuAGv':function(_0x34d27f,_0xd80917){return _0x34d27f!==_0xd80917;},'taneI':_0x8f5d54(0x31e,'rV6w'),'BcrMu':_0x8f5d54(0x27d,'vwqw'),'dWpFt':function(_0x387363,_0x80603e){return _0x387363-_0x80603e;},'XpYHa':function(_0x3c624d,_0xdcb14c){return _0x3c624d*_0xdcb14c;}};let _0x54620e=_0x8f5d54(0x349,'Wy@u'),_0x140dbb='';for(let _0x5a6cc4=0x0;_0x2dfa12[_0x8f5d54(0x2be,'GP]N')](_0x5a6cc4,_0x5b4eed);_0x5a6cc4++){if(_0x2dfa12['EuAGv'](_0x2dfa12['taneI'],_0x2dfa12['BcrMu'])){let _0x421b57=Math['ceil'](_0x2dfa12['dWpFt'](_0x2dfa12['XpYHa'](Math[_0x8f5d54(0x307,'oxng')](),_0x54620e['length']),0x1));_0x140dbb+=_0x54620e[_0x421b57];}else _0x464fd6['log']('\x0a【'+_0x540215+_0x8f5d54(0x35e,'5e(r')+_0x5010f2['num']+_0x8f5d54(0x2ca,'hvqR')+_0x70a588[_0x8f5d54(0x296,'OFlX')]),_0x415a8e+='\x0a【'+_0x1b2ca9+_0x8f5d54(0x36b,'%Tf8')+_0x1f78aa[_0x8f5d54(0x357,'5e(r')]+'\x20状态】:\x20'+_0x4b400c['msg'];}return _0x140dbb;}function Format_time(_0xc4f618){const _0x57e44c=_0x3b662b,_0x88d04f={'yBliw':function(_0x57ca9b,_0x5c8194){return _0x57ca9b*_0x5c8194;},'zSxDq':function(_0x423b76,_0x3b6263){return _0x423b76+_0x3b6263;},'QyIKA':function(_0x1ff9f4,_0x33dbd8){return _0x1ff9f4+_0x33dbd8;},'VQaFy':function(_0x3e4ef2,_0x6d6ef1){return _0x3e4ef2<_0x6d6ef1;},'qSYrK':function(_0x1217ff,_0xbb2019){return _0x1217ff+_0xbb2019;},'BGRFt':function(_0x463e1b,_0xc62a90){return _0x463e1b+_0xc62a90;},'PQrgX':function(_0x4fe214,_0x3ce0a5){return _0x4fe214<_0x3ce0a5;},'GKfUp':function(_0x10096d,_0xa9fc7b){return _0x10096d+_0xa9fc7b;},'EacvS':function(_0x82b861,_0x280951){return _0x82b861+_0x280951;},'bZAps':function(_0x1de177,_0x5b0aed){return _0x1de177+_0x5b0aed;},'xWXBf':function(_0x214e3d,_0x19dd92){return _0x214e3d+_0x19dd92;}};var _0x166b69=new Date(_0x88d04f['yBliw'](_0xc4f618,0x3e8)),_0x597209=_0x88d04f[_0x57e44c(0x2e6,'NddB')](_0x166b69[_0x57e44c(0x309,'GyS)')](),'-'),_0x343ee6=_0x88d04f[_0x57e44c(0x2a8,'GP]N')](_0x88d04f[_0x57e44c(0x304,'e6YJ')](_0x166b69[_0x57e44c(0x2c9,'rV6w')]()+0x1,0xa)?_0x88d04f[_0x57e44c(0x227,'yEnN')]('0',_0x88d04f[_0x57e44c(0x26d,'I]5I')](_0x166b69[_0x57e44c(0x396,'H7]r')](),0x1)):_0x88d04f[_0x57e44c(0x2c1,'[Jc3')](_0x166b69[_0x57e44c(0x321,'yEnN')](),0x1),'-'),_0x3d0675=_0x88d04f[_0x57e44c(0x26b,'GyS)')](_0x166b69['getDate'](),'\x20'),_0xc9af26=_0x166b69['getHours']()+':',_0x4f4187=_0x88d04f['QyIKA'](_0x88d04f[_0x57e44c(0x218,'smVb')](_0x166b69[_0x57e44c(0x2f3,'6xq#')](),0xa)?'0'+_0x166b69[_0x57e44c(0x208,'D%59')]():_0x166b69['getMinutes'](),':'),_0x1df1b6=_0x166b69['getSeconds']();let _0x1657c3=_0x88d04f[_0x57e44c(0x1e1,'6xq#')](_0x88d04f[_0x57e44c(0x379,'I]5I')](_0x88d04f[_0x57e44c(0x2ea,'35WN')](_0x88d04f[_0x57e44c(0x342,'4u(^')](_0x597209,_0x343ee6),_0x3d0675),_0xc9af26)+_0x4f4187,_0x1df1b6);return _0x88d04f[_0x57e44c(0x1bf,'lv2X')](_0x88d04f[_0x57e44c(0x2d0,'kL6Q')](_0x88d04f['EacvS'](_0x88d04f[_0x57e44c(0x2e5,'1pCV')](_0x88d04f[_0x57e44c(0x269,'kCLY')](_0x597209,_0x343ee6),_0x3d0675),_0xc9af26),_0x4f4187),_0x1df1b6);}var version_ = 'jsjiami.com.v7';

function Env(t, e) {
  class s {
    constructor(t) {
      this.env = t
    }
    send(t, e = "GET") {
      t = "string" == typeof t ? {
        url: t
      } : t;
      let s = this.get;
      return "POST" === e && (s = this.post), new Promise((e, i) => {
        s.call(this, t, (t, s, r) => {
          t ? i(t) : e(s)
        })
      })
    }
    get(t) {
      return this.send.call(this.env, t)
    }
    post(t) {
      return this.send.call(this.env, t, "POST")
    }
  }
  return new class {
    constructor(t, e) {
      this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`)
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
    toObj(t, e = null) {
      try {
        return JSON.parse(t)
      } catch {
        return e
      }
    }
    toStr(t, e = null) {
      try {
        return JSON.stringify(t)
      } catch {
        return e
      }
    }
    getjson(t, e) {
      let s = e;
      const i = this.getdata(t);
      if (i) try {
        s = JSON.parse(this.getdata(t))
      } catch {}
      return s
    }
    setjson(t, e) {
      try {
        return this.setdata(JSON.stringify(t), e)
      } catch {
        return !1
      }
    }
    getScript(t) {
      return new Promise(e => {
        this.get({
          url: t
        }, (t, s, i) => e(i))
      })
    }
    runScript(t, e) {
      return new Promise(s => {
        let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
        i = i ? i.replace(/\n/g, "").trim() : i;
        let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
        r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
        const [o, h] = i.split("@"), a = {
          url: `http://${h}/v1/scripting/evaluate`,
          body: {
            script_text: t,
            mock_type: "cron",
            timeout: r
          },
          headers: {
            "X-Key": o,
            Accept: "*/*"
          }
        };
        this.post(a, (t, e, i) => s(i))
      }).catch(t => this.logErr(t))
    }
    loaddata() {
      if (!this.isNode()) return {}; {
        this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile),
          e = this.path.resolve(process.cwd(), this.dataFile),
          s = this.fs.existsSync(t),
          i = !s && this.fs.existsSync(e);
        if (!s && !i) return {}; {
          const i = s ? t : e;
          try {
            return JSON.parse(this.fs.readFileSync(i))
          } catch (t) {
            return {}
          }
        }
      }
    }
    writedata() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile),
          e = this.path.resolve(process.cwd(), this.dataFile),
          s = this.fs.existsSync(t),
          i = !s && this.fs.existsSync(e),
          r = JSON.stringify(this.data);
        s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
      }
    }
    lodash_get(t, e, s) {
      const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
      let r = t;
      for (const t of i)
        if (r = Object(r)[t], void 0 === r) return s;
      return r
    }
    lodash_set(t, e, s) {
      return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
    }
    getdata(t) {
      let e = this.getval(t);
      if (/^@/.test(t)) {
        const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
        if (r) try {
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
        const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}";
        try {
          const e = JSON.parse(h);
          this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
        } catch (e) {
          const o = {};
          this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
        }
      } else s = this.setval(t, e);
      return s
    }
    getval(t) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
    }
    setval(t, e) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
    }
    initGotEnv(t) {
      this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
    }
    get(t, e = (() => {})) {
      t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
        "X-Surge-Skip-Scripting": !1
      })), $httpClient.get(t, (t, s, i) => {
        !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
      })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
        hints: !1
      })), $task.fetch(t).then(t => {
        const {
          statusCode: s,
          statusCode: i,
          headers: r,
          body: o
        } = t;
        e(null, {
          status: s,
          statusCode: i,
          headers: r,
          body: o
        }, o)
      }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
        try {
          if (t.headers["set-cookie"]) {
            const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
            this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
          }
        } catch (t) {
          this.logErr(t)
        }
      }).then(t => {
        const {
          statusCode: s,
          statusCode: i,
          headers: r,
          body: o
        } = t;
        e(null, {
          status: s,
          statusCode: i,
          headers: r,
          body: o
        }, o)
      }, t => {
        const {
          message: s,
          response: i
        } = t;
        e(s, i, i && i.body)
      }))
    }
    post(t, e = (() => {})) {
      if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
        "X-Surge-Skip-Scripting": !1
      })), $httpClient.post(t, (t, s, i) => {
        !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
      });
      else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
        hints: !1
      })), $task.fetch(t).then(t => {
        const {
          statusCode: s,
          statusCode: i,
          headers: r,
          body: o
        } = t;
        e(null, {
          status: s,
          statusCode: i,
          headers: r,
          body: o
        }, o)
      }, t => e(t));
      else if (this.isNode()) {
        this.initGotEnv(t);
        const {
          url: s,
          ...i
        } = t;
        this.got.post(s, i).then(t => {
          const {
            statusCode: s,
            statusCode: i,
            headers: r,
            body: o
          } = t;
          e(null, {
            status: s,
            statusCode: i,
            headers: r,
            body: o
          }, o)
        }, t => {
          const {
            message: s,
            response: i
          } = t;
          e(s, i, i && i.body)
        })
      }
    }
    time(t) {
      let e = {
        "M+": (new Date).getMonth() + 1,
        "d+": (new Date).getDate(),
        "H+": (new Date).getHours(),
        "m+": (new Date).getMinutes(),
        "s+": (new Date).getSeconds(),
        "q+": Math.floor(((new Date).getMonth() + 3) / 3),
        S: (new Date).getMilliseconds()
      };
      /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length)));
      for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length)));
      return t
    }
    msg(e = t, s = "", i = "", r) {
      const o = t => {
        if (!t) return t;
        if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {
          "open-url": t
        } : this.isSurge() ? {
          url: t
        } : void 0;
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
      let h = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];
      h.push(e), s && h.push(s), i && h.push(i), console.log(h.join("\n")), this.logs = this.logs.concat(h)
    }
    log(...t) {
      t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
    }
    logErr(t, e) {
      const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
      s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t)
    }
    wait(t) {
      return new Promise(e => setTimeout(e, t))
    }
    done(t = {}) {
      const e = (new Date).getTime(),
        s = (e - this.startTime) / 1e3;
      this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
    }
  }(t, e)
}
