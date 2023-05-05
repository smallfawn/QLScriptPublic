/*
极客:https://gitlab.com/soytool/script/-/raw/main/image/%E6%9E%81%E6%B0%AA.jpg
邀请码:BM1LF

汽车类的,只有签到,一天1积分,10积分=1元,只能用于购物

抓包数据
app抓包地址:https://mpaas-mgs.aliyuncs.com/mgw.htm
小程序抓包地址:https://mgw.mpaas.cn-hangzhou.aliyuncs.com/mgw.htm/
请求头上的authorization 值,不要路面的 Bearer 和空格

变量填写
变量名:抓包的token

多号 @ # 换行 三选一

一天一次
10 19 * * * *
*/


const $ = new Env('极氪');
const author = '作者TG_ID:@ls_soy';
const TG = "https://t.me/LjkwwdZZRPs5OWU1"
const notify = $.isNode() ? require('./sendNotify') : '';

var version_='jsjiami.com.v7';const _0x8d8881=_0x4719;(function(_0x256e31,_0x25c6b1,_0x1c4f68,_0x459d35,_0x5043fa,_0x2d07a3,_0x405535){return _0x256e31=_0x256e31>>0x3,_0x2d07a3='hs',_0x405535='hs',function(_0x3de66d,_0x3c42d4,_0x353cfe,_0x3c57bf,_0x26f2d4){const _0x402ab5=_0x4719;_0x3c57bf='tfi',_0x2d07a3=_0x3c57bf+_0x2d07a3,_0x26f2d4='up',_0x405535+=_0x26f2d4,_0x2d07a3=_0x353cfe(_0x2d07a3),_0x405535=_0x353cfe(_0x405535),_0x353cfe=0x0;const _0xd1c634=_0x3de66d();while(!![]&&--_0x459d35+_0x3c42d4){try{_0x3c57bf=-parseInt(_0x402ab5(0x116,'UGe6'))/0x1*(-parseInt(_0x402ab5(0x226,'NPQW'))/0x2)+-parseInt(_0x402ab5(0x170,'y((0'))/0x3+-parseInt(_0x402ab5(0x1ae,'0qrn'))/0x4*(-parseInt(_0x402ab5(0x184,'MV3@'))/0x5)+-parseInt(_0x402ab5(0x19a,'Xq6K'))/0x6+parseInt(_0x402ab5(0x146,'g^zg'))/0x7+parseInt(_0x402ab5(0x1ce,'lyqM'))/0x8*(parseInt(_0x402ab5(0x167,'X9R1'))/0x9)+-parseInt(_0x402ab5(0x205,'NPQW'))/0xa*(-parseInt(_0x402ab5(0x13f,'c!lH'))/0xb);}catch(_0xbfd7dc){_0x3c57bf=_0x353cfe;}finally{_0x26f2d4=_0xd1c634[_0x2d07a3]();if(_0x256e31<=_0x459d35)_0x353cfe?_0x5043fa?_0x3c57bf=_0x26f2d4:_0x5043fa=_0x26f2d4:_0x353cfe=_0x26f2d4;else{if(_0x353cfe==_0x5043fa['replace'](/[eDdQytpWfxXgOBIKkJS=]/g,'')){if(_0x3c57bf===_0x3c42d4){_0xd1c634['un'+_0x2d07a3](_0x26f2d4);break;}_0xd1c634[_0x405535](_0x26f2d4);}}}}}(_0x1c4f68,_0x25c6b1,function(_0x48eb2f,_0x3169c4,_0x537b92,_0x18cf8a,_0x1fabf6,_0x2bebe3,_0x2b2e88){return _0x3169c4='\x73\x70\x6c\x69\x74',_0x48eb2f=arguments[0x0],_0x48eb2f=_0x48eb2f[_0x3169c4](''),_0x537b92=`\x72\x65\x76\x65\x72\x73\x65`,_0x48eb2f=_0x48eb2f[_0x537b92]('\x76'),_0x18cf8a=`\x6a\x6f\x69\x6e`,(0x125212,_0x48eb2f[_0x18cf8a](''));});}(0x628,0x5351f,_0x3b23,0xc7),_0x3b23)&&(version_=_0x3b23);try{CryptoJs=$[_0x8d8881(0x1d0,'iN[8')]()?require(_0x8d8881(0x13a,'a(j5')):'';}catch(_0x254dd4){throw new Error(_0x8d8881(0x22f,'BzTu'));}try{axios=$['isNode']()?require('axios'):'';}catch(_0x50787f){throw new Error(_0x8d8881(0x11b,'pN&['));}let subTitle='',user_num=0x0,execAcList=[],user_data='',app_sj=![],up_token='',variable_style='',ql_id='',ql_secret='',ql_ip='';!(async()=>{const _0xe5f47c=_0x8d8881,_0x3a7390={'QwzPv':_0xe5f47c(0x140,'BzTu'),'nMuXI':function(_0x3744e6,_0x5cb8cb){return _0x3744e6(_0x5cb8cb);},'Qcuci':_0xe5f47c(0x19c,'y((0'),'Vqobf':function(_0x561750,_0x1d61e8){return _0x561750==_0x1d61e8;},'xYJzd':_0xe5f47c(0x1aa,'MV3@'),'piWRB':_0xe5f47c(0x107,'%f^n'),'IdbgG':_0xe5f47c(0x1b9,'Xq6K'),'OlZdD':function(_0x37a17e,_0xe4114a){return _0x37a17e!=_0xe4114a;},'mpSXg':function(_0x44b984,_0x5e3386){return _0x44b984!==_0x5e3386;},'UqYcy':_0xe5f47c(0x158,'CjkS'),'yoPaX':function(_0x23530c,_0x136158){return _0x23530c===_0x136158;},'EAnWd':'zBRYs','KJanU':function(_0x379b59,_0x18461d){return _0x379b59>_0x18461d;},'cclIG':function(_0x554068,_0x49f0ec){return _0x554068>_0x49f0ec;},'dpymI':_0xe5f47c(0x15d,'dpIz'),'ITPey':_0xe5f47c(0x15a,')^Ow'),'nqbUS':function(_0x2d7177,_0x147744){return _0x2d7177+_0x147744;},'Zfums':function(_0x4aa20a,_0x1936cd){return _0x4aa20a*_0x1936cd;},'nUOkp':function(_0x50fb2f,_0x5b723b){return _0x50fb2f*_0x5b723b;},'RVEIK':function(_0x48f895,_0x259678){return _0x48f895*_0x259678;},'WacQm':function(_0x212b8d){return _0x212b8d();},'ROrDy':'oWwqg'};console['log']('\x0a【soy脚本文件免责声明】：\x0a【发布的脚本文件及其中涉及的任何脚本，仅用于测试和学习研究，禁止用于商业或非法目的，否则后果自负，使用脚本行为均有封号风险】\x0a【不能保证其合法性、准确性、完整性和有效性，请根据情况自行判断】\x0a【本脚本文件，禁止任何公众号、论坛、群体以及任何形式的转载、发布,否则后果自负】\x0a【本人对任何脚本问题概不负责，包括但不限于由任何脚本错误导致的任何损失或损害】\x0a【直接或间接使用脚本包括不限制于破解脚本的任何用户，包括但不限于代挂或其他某些行为违反国家/地区法律或相关法规的情况下进行传播，本人对于由此引起的任何隐私泄漏或其他后果概不负责】\x0a【如果任何单位或个人认为该脚本可能涉嫌侵犯其权利，则应及时通知并提供身份证明、所有权证明，我们将在收到认证文件后删除相关脚本】\x0a【任何以任何方式查看此项目的人或直接或间接使用该仓库的任何脚本的使用者都应仔细阅读此声明。本人保留随时更改或补充此免责声明的权利。一旦使用并复制了任何相关脚本文件，则视为您已接受此免责声明】');if($[_0xe5f47c(0x111,'uF1)')]()){if(_0x3a7390[_0xe5f47c(0x1b5,'QkfB')]!==_0x3a7390['xYJzd']){let _0x570f53=_0x3a7390[_0xe5f47c(0x12b,'lyqM')],_0x59e46f='';for(let _0x18b560=0x0;_0x18b560<_0x3640a7;_0x18b560++){let _0x39e580=_0x1f9838['ceil'](_0x554e52['random']()*_0x570f53[_0xe5f47c(0x1ba,'%f^n')]-0x1);_0x59e46f+=_0x570f53[_0x39e580];}return _0x59e46f;}else{try{_0x3a7390[_0xe5f47c(0x1e0,'0bt@')]!==_0xe5f47c(0x145,'pN&[')?_0x43a6e3(_0x165a71):Tips=author[_0xe5f47c(0x1cf,'x4i7')](/(\S*)TG_ID:@ls_soy/)[0x1];}catch(_0x2f1440){throw new Error('\x0a【作者提示】：验证脚本SHA失败,请勿修改脚本中任意内容\x0a');}try{if(_0x3a7390['IdbgG']!=='FCbFF'){YZ=author[_0xe5f47c(0x1e3,'NPQW')](/作者TG_ID:(\S*)/)[0x1][_0xe5f47c(0xff,'X9R1')](/_/g,'><');if(_0x3a7390[_0xe5f47c(0x178,'t6oT')](TG[_0xe5f47c(0x1d3,'lyqM')](/t.me\/(\S*)/)[0x1],'LjkwwdZZRPs5OWU1')){if(_0x3a7390[_0xe5f47c(0x23d,'CjkS')](_0xe5f47c(0x20d,'bNo%'),_0x3a7390[_0xe5f47c(0x169,'^f]T')]))throw new _0xbe7025('\x0a【作者提示】：验证脚本SHA失败,请勿修改脚本中任意内容\x0a');else throw new Error(_0xe5f47c(0x1e7,'!nzR'));}}else _0xb52c8c=_0x337326[_0xe5f47c(0x16f,'@cdy')]()?_0x3a7390[_0xe5f47c(0x181,'g^zg')](_0xdf81c9,_0x3a7390['Qcuci']):'';}catch(_0x5b8e4a){if(_0x3a7390[_0xe5f47c(0x217,'lyqM')](_0x3a7390[_0xe5f47c(0x14b,'0qrn')],_0x3a7390[_0xe5f47c(0x117,'BzTu')]))throw new Error('\x0a【作者提示】：验证脚本SHA失败,请勿修改脚本中任意内容\x0a');else{var _0x2d78a6=_0x4586ca[_0xe5f47c(0x221,'uF1)')]['soy_ql_data'];_0x22f26c=_0x2d78a6[_0xe5f47c(0x22c,'UGe6')]('&')[0x0],_0x636399=_0x2d78a6[_0xe5f47c(0x171,'x4i7')]('&')[0x1],_0x54f967=_0x2d78a6[_0xe5f47c(0x239,'J%KW')]('&')[0x2];}}if(process[_0xe5f47c(0x130,'i8^w')][_0xe5f47c(0x23e,'^f]T')]&&_0x3a7390['KJanU'](process[_0xe5f47c(0x225,'iN[8')][_0xe5f47c(0x208,'uF1)')]['indexOf']('@'),-0x1))user_data=process[_0xe5f47c(0x1b7,'c!lH')]['soy_jk_data'][_0xe5f47c(0x122,'[V5U')]('@'),variable_style='@';else{if(process[_0xe5f47c(0x203,'g^zg')][_0xe5f47c(0x1f8,'CjkS')]&&_0x3a7390[_0xe5f47c(0x19f,'0qrn')](process['env']['soy_jk_data'][_0xe5f47c(0x12d,'8IF1')]('\x0a'),-0x1))user_data=process[_0xe5f47c(0x1df,'CjkS')][_0xe5f47c(0x1a4,'b&HP')][_0xe5f47c(0x1c9,'G6qr')]('\x0a'),variable_style='\x0a';else{if(process[_0xe5f47c(0x19d,'t6oT')][_0xe5f47c(0x1ef,'MV3@')]&&_0x3a7390[_0xe5f47c(0x215,'0]eY')](process[_0xe5f47c(0x1c7,'pN&[')][_0xe5f47c(0x191,'[V5U')][_0xe5f47c(0x190,']EGA')]('#'),-0x1))user_data=process[_0xe5f47c(0x14e,'BzTu')]['soy_jk_data'][_0xe5f47c(0x138,'4QHi')]('#'),variable_style='#';else{if(_0x3a7390[_0xe5f47c(0x21a,'bNo%')](_0x3a7390[_0xe5f47c(0x1bf,'^f]T')],_0x3a7390[_0xe5f47c(0x202,'^f]T')]))user_data=process[_0xe5f47c(0x243,'bNo%')]['soy_jk_data'][_0xe5f47c(0x1ed,']^wu')]();else{if(_0x3a7390[_0xe5f47c(0x11f,'a(j5')](_0x27e410['data'][_0xe5f47c(0x1bc,'O^oa')],![])){}else _0x219901[_0xe5f47c(0x1d4,'dpIz')]('\x0a【'+_0x18e234+'提示---账号\x20'+_0x9c2cb7[_0xe5f47c(0x14a,'TX^q')]+_0xe5f47c(0x164,']EGA')+_0x289884[_0xe5f47c(0x176,'G6qr')]['integral']+'积分');}}}};user_num=user_data[_0xe5f47c(0x24d,'DAdC')];if(process[_0xe5f47c(0x214,'lyqM')]['soy_ql_data']){var _0x54323e=process[_0xe5f47c(0x110,'O^oa')]['soy_ql_data'];ql_ip=_0x54323e['split']('&')[0x0],ql_id=_0x54323e[_0xe5f47c(0x1d2,']EGA')]('&')[0x1],ql_secret=_0x54323e[_0xe5f47c(0x1b0,'lyqM')]('&')[0x2];}console[_0xe5f47c(0x1f6,'MV3@')](_0xe5f47c(0x22d,'iN[8')+new Date(_0x3a7390[_0xe5f47c(0x161,'%f^n')](new Date()[_0xe5f47c(0x229,'G6qr')](),_0x3a7390[_0xe5f47c(0x224,'b&HP')](new Date()[_0xe5f47c(0x189,'CjkS')](),0x3c)*0x3e8)+_0x3a7390[_0xe5f47c(0x197,'lyqM')](_0x3a7390[_0xe5f47c(0x16d,'6Cuh')](_0x3a7390['Zfums'](0x8,0x3c),0x3c),0x3e8))[_0xe5f47c(0x20b,'TX^q')]()+'\x20==='),console[_0xe5f47c(0x1a5,'lyqM')](_0xe5f47c(0x112,')^Ow')+user_num+_0xe5f47c(0x1b4,'4QHi')),subTitle='',await _0x3a7390[_0xe5f47c(0x1b1,'bNo%')](get_zu);}}else{if(_0x3a7390[_0xe5f47c(0x1f5,')^Ow')]!=='QzdZl'){console['log'](_0xe5f47c(0x219,'[V5U'));return;}else _0x2bffd5['log']('\x0a【'+_0x46be1d+_0xe5f47c(0x249,'QXvl')+_0x3e1980[_0xe5f47c(0x1b6,'NPQW')]+_0xe5f47c(0x179,')^Ow')+_0x429412[_0xe5f47c(0x220,'0bt@')]),_0x4c3c04+='\x0a【'+_0x47324f+'提示---账号\x20'+_0x5355b7[_0xe5f47c(0x105,'G6qr')]+_0xe5f47c(0x207,'dpIz')+_0x58a912[_0xe5f47c(0x17e,'bNo%')];}})()[_0x8d8881(0x247,'MV3@')](_0xd3bbb6=>$['logErr'](_0xd3bbb6))['finally'](()=>$[_0x8d8881(0x1dd,'DAdC')]());async function get_zu(){const _0x271b16=_0x8d8881,_0x5e8036={'weEPd':function(_0x119ea0,_0x20ef3e){return _0x119ea0<_0x20ef3e;},'jMLem':function(_0xcaab19,_0x5ec490){return _0xcaab19(_0x5ec490);}};let _0x2886bd=0x0,_0x163228=[];for(let _0x99f439=0x0;_0x5e8036[_0x271b16(0x21f,'%f^n')](_0x99f439,user_num);_0x99f439++){_0x163228[_0x271b16(0x1f0,'X9R1')]({'num':_0x99f439+0x1,'token':user_data[_0x99f439]});}await _0x5e8036['jMLem'](start,_0x163228);}function _0x4719(_0x5adc27,_0x38c8ba){const _0x3b2395=_0x3b23();return _0x4719=function(_0x471996,_0x22103d){_0x471996=_0x471996-0xf8;let _0x3ab679=_0x3b2395[_0x471996];if(_0x4719['mcNGie']===undefined){var _0x7c51f2=function(_0x4db01f){const _0x481ef1='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0xb52c8c='',_0x337326='';for(let _0xdf81c9=0x0,_0xa424af,_0x5b0e3d,_0x14d5c1=0x0;_0x5b0e3d=_0x4db01f['charAt'](_0x14d5c1++);~_0x5b0e3d&&(_0xa424af=_0xdf81c9%0x4?_0xa424af*0x40+_0x5b0e3d:_0x5b0e3d,_0xdf81c9++%0x4)?_0xb52c8c+=String['fromCharCode'](0xff&_0xa424af>>(-0x2*_0xdf81c9&0x6)):0x0){_0x5b0e3d=_0x481ef1['indexOf'](_0x5b0e3d);}for(let _0x3a2ac6=0x0,_0x4002cd=_0xb52c8c['length'];_0x3a2ac6<_0x4002cd;_0x3a2ac6++){_0x337326+='%'+('00'+_0xb52c8c['charCodeAt'](_0x3a2ac6)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x337326);};const _0x29c09e=function(_0xfa8a19,_0x15fbc1){let _0x5a97d8=[],_0x5cc6bd=0x0,_0x4f50f9,_0x339c88='';_0xfa8a19=_0x7c51f2(_0xfa8a19);let _0x1eff97;for(_0x1eff97=0x0;_0x1eff97<0x100;_0x1eff97++){_0x5a97d8[_0x1eff97]=_0x1eff97;}for(_0x1eff97=0x0;_0x1eff97<0x100;_0x1eff97++){_0x5cc6bd=(_0x5cc6bd+_0x5a97d8[_0x1eff97]+_0x15fbc1['charCodeAt'](_0x1eff97%_0x15fbc1['length']))%0x100,_0x4f50f9=_0x5a97d8[_0x1eff97],_0x5a97d8[_0x1eff97]=_0x5a97d8[_0x5cc6bd],_0x5a97d8[_0x5cc6bd]=_0x4f50f9;}_0x1eff97=0x0,_0x5cc6bd=0x0;for(let _0x8afac4=0x0;_0x8afac4<_0xfa8a19['length'];_0x8afac4++){_0x1eff97=(_0x1eff97+0x1)%0x100,_0x5cc6bd=(_0x5cc6bd+_0x5a97d8[_0x1eff97])%0x100,_0x4f50f9=_0x5a97d8[_0x1eff97],_0x5a97d8[_0x1eff97]=_0x5a97d8[_0x5cc6bd],_0x5a97d8[_0x5cc6bd]=_0x4f50f9,_0x339c88+=String['fromCharCode'](_0xfa8a19['charCodeAt'](_0x8afac4)^_0x5a97d8[(_0x5a97d8[_0x1eff97]+_0x5a97d8[_0x5cc6bd])%0x100]);}return _0x339c88;};_0x4719['BQdNgd']=_0x29c09e,_0x5adc27=arguments,_0x4719['mcNGie']=!![];}const _0x48e1f6=_0x3b2395[0x0],_0x423c2a=_0x471996+_0x48e1f6,_0x3f1596=_0x5adc27[_0x423c2a];return!_0x3f1596?(_0x4719['JsDMWx']===undefined&&(_0x4719['JsDMWx']=!![]),_0x3ab679=_0x4719['BQdNgd'](_0x3ab679,_0x22103d),_0x5adc27[_0x423c2a]=_0x3ab679):_0x3ab679=_0x3f1596,_0x3ab679;},_0x4719(_0x5adc27,_0x38c8ba);}async function implement(){const _0x5e067d=_0x8d8881,_0x263d73={'TeXDu':_0x5e067d(0x246,'G6qr'),'FBrBn':function(_0x219bc3,_0x16143e){return _0x219bc3===_0x16143e;},'DKwxw':_0x5e067d(0x17c,'0qrn'),'NAyUD':function(_0x5300be,_0x4cdc4f){return _0x5300be!==_0x4cdc4f;},'DqQxS':_0x5e067d(0x254,'CjkS')};let _0x172be2=[];if(execAcList[_0x5e067d(0x231,'x4i7')]>0x0){for(let _0x1bc98b of execAcList){await Promise['all'](_0x1bc98b['map'](_0x1b6f7e=>start(_0x1b6f7e)));}if(notify){if(subTitle){if(_0x263d73[_0x5e067d(0x104,'g^zg')](_0x5e067d(0x200,'zQp8'),_0x263d73[_0x5e067d(0x20f,'b&HP')])){_0x3e6c14=_0x2f3031['match'](/作者TG_ID:(\S*)/)[0x1][_0x5e067d(0x1fe,'x4i7')](/_/g,'><');if(_0x359c05[_0x5e067d(0x1e3,'NPQW')](/t.me\/(\S*)/)[0x1]!=_0x263d73[_0x5e067d(0x230,']^wu')])throw new _0xb32b0a('\x0a【作者提示】：验证脚本SHA失败,请勿修改脚本中任意内容\x0a');}else await notify['sendNotify']($[_0x5e067d(0x23a,'ffL*')],subTitle);}}}else _0x263d73[_0x5e067d(0x233,'TX^q')](_0x5e067d(0x252,'cBAD'),_0x263d73['DqQxS'])?(_0x5d7c3b[_0x5e067d(0x22e,'qLXu')]('\x0a【'+_0x78cb75+'提示---账号\x20'+_0x280cf9['num']+_0x5e067d(0xfd,'zQp8')+_0x428235),_0x190511+='\x0a【'+_0x2ee314+_0x5e067d(0x16e,'4QHi')+_0x21b391['num']+_0x5e067d(0x1fb,'^f]T')+_0x4c91b6):console[_0x5e067d(0x156,'G6qr')]('\x0a【脚本提示】：没有获取到账号数据');}async function start(_0x4c25f9){const _0x2d1df3=_0x8d8881,_0xe19a41={'sGSBt':function(_0x47c44b,_0x14a273){return _0x47c44b<_0x14a273;},'OCaBY':function(_0x54b441,_0x22f927,_0x4b01c0){return _0x54b441(_0x22f927,_0x4b01c0);},'WCDTV':function(_0x2c353f,_0x4a58d3){return _0x2c353f(_0x4a58d3);}};for(let _0x18a430=0x0;_0xe19a41[_0x2d1df3(0x1a6,'%f^n')](_0x18a430,user_num);_0x18a430++){await _0xe19a41[_0x2d1df3(0x129,'t6oT')](Sleep_time,0x1,0x2),await _0xe19a41[_0x2d1df3(0x1c2,'t6oT')](info,_0x4c25f9[_0x18a430]);}};function info(_0xd2b20b){const _0x132ff5=_0x8d8881,_0x4955de={'AqqPm':function(_0x17d5dc,_0x33dd52){return _0x17d5dc*_0x33dd52;},'fOpJh':function(_0x1d05e2,_0x51c3cb){return _0x1d05e2+_0x51c3cb;},'PUzpG':function(_0x314fe2,_0x46b120){return _0x314fe2+_0x46b120;},'bKeAF':function(_0x4fb90f,_0x18aefe){return _0x4fb90f<_0x18aefe;},'KMHoU':function(_0x38cdbd,_0x1a1454){return _0x38cdbd+_0x1a1454;},'APDTO':function(_0x159873,_0x499ffe){return _0x159873+_0x499ffe;},'wjfhp':function(_0x24fe43,_0x58a6cc){return _0x24fe43+_0x58a6cc;},'XbDPt':function(_0x48fd40,_0x315803){return _0x48fd40!==_0x315803;},'gAeCJ':'TnbJi','TTpgn':_0x132ff5(0x1c5,'RK%e'),'OhgDF':_0x132ff5(0x14c,']EGA'),'pQqAl':function(_0x5ee2c5,_0x427b4d){return _0x5ee2c5==_0x427b4d;},'DNcHO':function(_0x14ba9d,_0x5176f2){return _0x14ba9d===_0x5176f2;},'rvDfq':_0x132ff5(0x185,'y((0'),'tibpT':function(_0x32de57,_0x1b64a6){return _0x32de57!==_0x1b64a6;},'pvfPf':_0x132ff5(0x155,'O^oa'),'vhzOU':function(_0xc60963,_0x24e4ac){return _0xc60963(_0x24e4ac);},'GqxIk':'pIxhE','cLHPb':'com.zeekrlife.micro.appuser.v1.user.info.home','CmNhR':function(_0x2c6583,_0x2ae3a0){return _0x2c6583(_0x2ae3a0);}};_0xd2b20b[_0x132ff5(0x125,'TX^q')]=_0x4955de[_0x132ff5(0x20e,']^wu')];var _0x4388a2=_0x4955de[_0x132ff5(0x1ee,'t6oT')](get_h,_0xd2b20b);return new Promise(_0x4afa6c=>{const _0x1418bd=_0x132ff5,_0x5b2a60={'EaREV':function(_0xbbd460,_0x2e1cda){const _0x4a077e=_0x4719;return _0x4955de[_0x4a077e(0x101,'O^oa')](_0xbbd460,_0x2e1cda);}};_0x4955de[_0x1418bd(0x1d5,'8IF1')]!=='IXdWL'?$[_0x1418bd(0x194,'QkfB')](_0x4388a2,async(_0xd15509,_0x362a40,_0x1e1c40)=>{const _0x197b0f=_0x1418bd,_0x4a8035={'rJZjd':function(_0x2ae4f7,_0x17ff72){const _0x1eaf4a=_0x4719;return _0x4955de[_0x1eaf4a(0x1e2,'Xq6K')](_0x2ae4f7,_0x17ff72);},'sWolX':function(_0x3ee55d,_0x1a3ca2){const _0x4a9ef9=_0x4719;return _0x4955de[_0x4a9ef9(0x131,'iN[8')](_0x3ee55d,_0x1a3ca2);},'FeGMQ':function(_0x5cc0dc,_0x1d141e){const _0xcef11e=_0x4719;return _0x4955de[_0xcef11e(0x188,'DAdC')](_0x5cc0dc,_0x1d141e);},'hMCmQ':function(_0x2a949b,_0x1c002c){const _0x4e2657=_0x4719;return _0x4955de[_0x4e2657(0x166,'DAdC')](_0x2a949b,_0x1c002c);},'MNkmR':function(_0x1c4746,_0x2c6ed5){return _0x4955de['fOpJh'](_0x1c4746,_0x2c6ed5);},'qXduW':function(_0x594cbe,_0x2a9fab){const _0x115b25=_0x4719;return _0x4955de[_0x115b25(0x1a0,')^Ow')](_0x594cbe,_0x2a9fab);},'DNStT':function(_0x446628,_0x30754d){return _0x446628+_0x30754d;},'rUqEe':function(_0x4c5359,_0x4a5b68){return _0x4955de['APDTO'](_0x4c5359,_0x4a5b68);},'PouCA':function(_0x20b611,_0x2799aa){return _0x20b611+_0x2799aa;},'wtsnt':function(_0x21f01f,_0x1f3576){return _0x21f01f+_0x1f3576;},'UbKcm':function(_0x223301,_0x1d041d){const _0x1ada9b=_0x4719;return _0x4955de[_0x1ada9b(0x137,'ffL*')](_0x223301,_0x1d041d);},'DMizK':function(_0x45f059,_0x44b22a){const _0x517b9b=_0x4719;return _0x4955de[_0x517b9b(0x199,'d]JI')](_0x45f059,_0x44b22a);}};if(_0x4955de[_0x197b0f(0x13b,'%f^n')](_0x4955de[_0x197b0f(0x109,'iN[8')],_0x4955de[_0x197b0f(0x18c,'8IF1')])){try{if(_0xd15509){if('xZKyL'===_0x4955de[_0x197b0f(0x236,'X9R1')])throw new _0x3e3f0a(_0x197b0f(0x24e,'8IF1'));else console[_0x197b0f(0x124,'NPQW')]('\x0a【'+Tips+_0x197b0f(0x222,'DAdC')+_0xd2b20b['num']+_0x197b0f(0x10d,'BzTu')+_0xd15509),subTitle+='\x0a【'+Tips+_0x197b0f(0x248,'6Cuh')+_0xd2b20b[_0x197b0f(0x14a,'TX^q')]+'\x20用户状态】:\x20返回\x20'+_0xd15509;}else{let _0x29e25b=JSON[_0x197b0f(0x10a,'G6qr')](_0x1e1c40);_0x4955de[_0x197b0f(0x177,'QXvl')](_0x29e25b[_0x197b0f(0x1fa,'TX^q')],0x0)?_0x4955de[_0x197b0f(0x14f,'Xq6K')](_0x4955de[_0x197b0f(0x168,'x4i7')],_0x4955de[_0x197b0f(0x174,'MV3@')])?_0x4955de[_0x197b0f(0x114,'MV3@')](_0x29e25b[_0x197b0f(0x14d,'NPQW')][_0x197b0f(0x1d8,'dpIz')],![])?_0x4955de[_0x197b0f(0x1dc,'RK%e')](_0x4955de['pvfPf'],_0x4955de[_0x197b0f(0x139,'i8^w')])?(_0x541694[_0x197b0f(0x1e9,'4QHi')]('\x0a【'+_0x3e824b+'提示---账号\x20'+_0x1f1c72['num']+_0x197b0f(0x1e6,'NPQW')+_0x4c5017),_0x951885+='\x0a【'+_0x141d12+_0x197b0f(0x150,'zQp8')+_0x19ed60['num']+_0x197b0f(0x135,'O^oa')+_0x8fd06e):await sign(_0xd2b20b):(console[_0x197b0f(0x23c,']^wu')]('\x0a【'+Tips+_0x197b0f(0xf9,'qLXu')+_0xd2b20b['num']+_0x197b0f(0x1c6,'G6qr')+_0x29e25b[_0x197b0f(0x115,'i8^w')][_0x197b0f(0x103,'!nzR')]),subTitle+='\x0a【'+Tips+_0x197b0f(0x238,'bNo%')+_0xd2b20b[_0x197b0f(0xfb,'MV3@')]+_0x197b0f(0x21e,'cBAD')+_0x29e25b['data'][_0x197b0f(0x212,'x4i7')]):_0x1966e3[_0x197b0f(0x1ab,'8IF1')]({'num':_0x5b2a60[_0x197b0f(0x22a,'Xq6K')](_0x5137a0,0x1),'token':_0x31d791[_0x1ea16a]}):(console['log']('\x0a【'+Tips+_0x197b0f(0x1e1,'t6oT')+_0xd2b20b[_0x197b0f(0x136,']^wu')]+_0x197b0f(0x251,'uF1)')+_0x29e25b[_0x197b0f(0x245,'[V5U')]),subTitle+='\x0a【'+Tips+_0x197b0f(0x24f,'MV3@')+_0xd2b20b['num']+_0x197b0f(0x1d9,'BzTu')+_0x29e25b['msg']);}}catch(_0x846155){}finally{_0x4955de[_0x197b0f(0x244,'NPQW')](_0x4afa6c,_0xd2b20b);};}else{var _0x184d68=new _0x44a4e5(_0x4a8035['rJZjd'](_0x362f5d,0x3e8)),_0x1d6e70=_0x4a8035[_0x197b0f(0x1f9,'CjkS')](_0x184d68[_0x197b0f(0x152,')^Ow')](),'-'),_0x1ce608=_0x4a8035['FeGMQ'](_0x4a8035[_0x197b0f(0x10b,'dpIz')](_0x4a8035[_0x197b0f(0x11d,'8IF1')](_0x184d68[_0x197b0f(0x17f,'t6oT')](),0x1),0xa)?_0x4a8035[_0x197b0f(0x1ca,'c!lH')]('0',_0x184d68[_0x197b0f(0x108,'pN&[')]()+0x1):_0x4a8035[_0x197b0f(0x204,'cBAD')](_0x184d68['getMonth'](),0x1),'-'),_0x3750d7=_0x184d68['getDate']()+'\x20',_0x91642c=_0x4a8035[_0x197b0f(0x12e,'UGe6')](_0x184d68[_0x197b0f(0x242,'NPQW')](),':'),_0x1270ce=_0x4a8035[_0x197b0f(0x162,'%f^n')](_0x184d68[_0x197b0f(0x192,'BzTu')]()<0xa?_0x4a8035[_0x197b0f(0x10e,']^wu')]('0',_0x184d68['getMinutes']()):_0x184d68[_0x197b0f(0x10f,'ffL*')](),':'),_0x4c9dae=_0x184d68['getSeconds']();let _0x1dc1f6=_0x4a8035[_0x197b0f(0x237,'y((0')](_0x4a8035[_0x197b0f(0x18f,'O^oa')](_0x4a8035[_0x197b0f(0x18d,'0]eY')](_0x4a8035['UbKcm'](_0x1d6e70,_0x1ce608)+_0x3750d7,_0x91642c),_0x1270ce),_0x4c9dae);return _0x4a8035['DMizK'](_0x4a8035['UbKcm'](_0x1d6e70+_0x1ce608+_0x3750d7+_0x91642c,_0x1270ce),_0x4c9dae);}}):_0x8afac4=_0x33c00a[_0x1418bd(0x24a,'0bt@')](/(\S*)TG_ID:@ls_soy/)[0x1];});};function sign(_0x1a63bb){const _0x4ae150=_0x8d8881,_0x225258={'lOpMw':function(_0x4d7b2b,_0x1e516d){return _0x4d7b2b(_0x1e516d);},'DCYjd':_0x4ae150(0x198,'MV3@'),'CIkCi':function(_0x54716d,_0x1b1bda){return _0x54716d===_0x1b1bda;},'njYrm':_0x4ae150(0x128,'CjkS'),'pkzrc':function(_0x51bd9b,_0xd6c13f){return _0x51bd9b!==_0xd6c13f;},'VtzdL':_0x4ae150(0x216,'Xq6K'),'MmjCh':function(_0x479f16,_0x16dd2e){return _0x479f16===_0x16dd2e;},'CvpCs':function(_0x10e636,_0x26d84d){return _0x10e636==_0x26d84d;},'bMPZU':_0x4ae150(0x149,'qLXu'),'tCrEI':'lfZbt','bhgkk':function(_0xe1efa8,_0x58a6f1){return _0xe1efa8(_0x58a6f1);},'habiG':_0x4ae150(0x223,'cBAD'),'NpWHo':function(_0x293a72,_0x5c0585){return _0x293a72(_0x5c0585);}};_0x1a63bb[_0x4ae150(0x15b,'@HVh')]=_0x225258[_0x4ae150(0x17d,'%f^n')];var _0x357ca6=_0x225258['NpWHo'](get_h,_0x1a63bb);return new Promise(_0x28ada=>{const _0x515cd3=_0x4ae150,_0x11668b={'RfmUe':function(_0x1bff8a,_0x42b6d5){const _0x45b7f4=_0x4719;return _0x225258[_0x45b7f4(0x100,'!nzR')](_0x1bff8a,_0x42b6d5);},'QnpNh':_0x225258[_0x515cd3(0x16b,'cBAD')],'HxFwQ':function(_0x5e7f78,_0x1231bb){const _0x342e30=_0x515cd3;return _0x225258[_0x342e30(0x211,'O^oa')](_0x5e7f78,_0x1231bb);},'rpofs':_0x225258[_0x515cd3(0x1d7,'@HVh')],'qYuEl':_0x515cd3(0x148,'x4i7'),'cjZiT':function(_0x304ae2,_0x48e30a){return _0x225258['pkzrc'](_0x304ae2,_0x48e30a);},'WrhQT':_0x225258[_0x515cd3(0x1ff,'J%KW')],'aAQiu':function(_0x11d9aa,_0x729693){const _0x5d4aa8=_0x515cd3;return _0x225258[_0x5d4aa8(0x175,'QXvl')](_0x11d9aa,_0x729693);},'ddXpq':function(_0x39effd,_0x18b432){return _0x39effd==_0x18b432;},'mWkco':function(_0x4c29ac,_0x12c8fe){const _0x583fec=_0x515cd3;return _0x225258[_0x583fec(0x20a,'X9R1')](_0x4c29ac,_0x12c8fe);},'yoyPY':_0x225258[_0x515cd3(0x141,'Xq6K')],'Zesjy':_0x225258['tCrEI'],'VOIyq':function(_0x450d16,_0x47a198){return _0x225258['bhgkk'](_0x450d16,_0x47a198);}};$['post'](_0x357ca6,async(_0x1db196,_0x45f562,_0x5c85db)=>{const _0x1de0b8=_0x515cd3,_0x234fb5={'FeIzw':_0x11668b[_0x1de0b8(0x11e,'BzTu')]};if(_0x11668b[_0x1de0b8(0x159,'[V5U')](_0x11668b[_0x1de0b8(0x228,'@cdy')],_0x11668b['qYuEl']))_0x4baac6['log']('\x0a【'+_0x4d0aaa+_0x1de0b8(0x118,'@cdy')+_0x274e3d[_0x1de0b8(0x1ad,'O^oa')]+'\x20签到】:\x20'+_0x51eebc[_0x1de0b8(0x106,']^wu')]),_0x3ff320+='\x0a【'+_0x17a6f4+_0x1de0b8(0x232,'BzTu')+_0x5254ae[_0x1de0b8(0x234,'y((0')]+_0x1de0b8(0xfa,'lyqM')+_0x572d29[_0x1de0b8(0x18e,'BzTu')];else{try{if(_0x11668b[_0x1de0b8(0x143,'0]eY')](_0x11668b['WrhQT'],_0x11668b[_0x1de0b8(0x253,'x4i7')]))_0x276ad6[_0x1de0b8(0x1a9,'uF1)')]('\x0a【'+_0x362af0+'提示---账号\x20'+_0x28ea78['num']+_0x1de0b8(0x235,'@HVh')+_0x380206[_0x1de0b8(0x10c,'bNo%')][_0x1de0b8(0xfe,'8IF1')]),_0x4fc8e4+='\x0a【'+_0x73215d+_0x1de0b8(0x157,'0]eY')+_0x510d29[_0x1de0b8(0x210,'a(j5')]+_0x1de0b8(0x15e,'CjkS')+_0x22792c[_0x1de0b8(0x123,'MV3@')][_0x1de0b8(0x153,'a(j5')];else{console[_0x1de0b8(0x22b,'DAdC')](_0x5c85db);if(_0x1db196){if(_0x11668b['aAQiu'](_0x1de0b8(0x1a3,'qLXu'),'IFolN'))console['log']('\x0a【'+Tips+'提示---账号\x20'+_0x1a63bb['num']+_0x1de0b8(0x1da,'RK%e')+_0x1db196),subTitle+='\x0a【'+Tips+_0x1de0b8(0x160,'ffL*')+_0x1a63bb['num']+'\x20签到】:\x20返回\x20'+_0x1db196;else throw new _0x5b0e3d(_0x234fb5[_0x1de0b8(0x209,'iN[8')]);}else{let _0x1a5817=JSON[_0x1de0b8(0x126,'QXvl')](_0x5c85db);if(_0x11668b[_0x1de0b8(0x241,'NPQW')](_0x1a5817[_0x1de0b8(0x1f1,'MV3@')],0x0)){if(_0x11668b[_0x1de0b8(0x1b3,'RK%e')](_0x1a5817[_0x1de0b8(0x1c4,']^wu')][_0x1de0b8(0x240,'t6oT')],![])){}else console['log']('\x0a【'+Tips+_0x1de0b8(0x196,'NPQW')+_0x1a63bb[_0x1de0b8(0x21c,'X9R1')]+'\x20签到】:\x20获得'+app_result[_0x1de0b8(0x115,'i8^w')][_0x1de0b8(0x19b,'0]eY')]+'积分');}else console[_0x1de0b8(0x12f,'QXvl')]('\x0a【'+Tips+_0x1de0b8(0x1b2,'8IF1')+_0x1a63bb['num']+_0x1de0b8(0x172,'@cdy')+_0x1a5817[_0x1de0b8(0x13c,'pN&[')]),subTitle+='\x0a【'+Tips+_0x1de0b8(0xf9,'qLXu')+_0x1a63bb[_0x1de0b8(0x23b,'6Cuh')]+'\x20签到】:\x20'+_0x1a5817[_0x1de0b8(0x1de,'zQp8')];}}}catch(_0x3889aa){}finally{_0x11668b[_0x1de0b8(0x20c,']EGA')](_0x11668b[_0x1de0b8(0xfc,'QXvl')],_0x11668b[_0x1de0b8(0x201,'BzTu')])?_0x11668b[_0x1de0b8(0x186,'O^oa')](_0x28ada,_0x1a63bb):_0x11668b[_0x1de0b8(0x163,'J%KW')](_0x2d3f13,_0x532260);};}});});};function get_h(_0xed4695){const _0x50be5e=_0x8d8881,_0xcecd57={'YqrKU':function(_0xc70684,_0x147712){return _0xc70684(_0x147712);},'xQqVi':_0x50be5e(0x1db,'TX^q'),'BEIUE':_0x50be5e(0x15c,'x4i7'),'abfAe':'zeekr-app','ldaBB':function(_0x4ce87b,_0xe94b42){return _0x4ce87b+_0xe94b42;},'lSFEa':_0x50be5e(0x1cb,'d]JI'),'WGHUr':_0x50be5e(0x1eb,'8IF1'),'WWbAi':_0x50be5e(0x1d1,'x4i7'),'WUgyE':_0x50be5e(0x134,'QkfB'),'UdrNZ':_0x50be5e(0x1e4,'Xq6K'),'aMPcQ':'zh-Hans','wbscI':_0x50be5e(0x132,'[V5U')};let _0x1ad364=new Date()[_0x50be5e(0x1f7,'DAdC')]();var _0x57aa75='[{\x22empty_param\x22:\x22\x22}]',_0x15d825=_0xcecd57[_0x50be5e(0xf8,'TX^q')](getnum,0x6),_0x4eff50=CryptoJs[_0x50be5e(0x1a7,'x4i7')](''+_0x1ad364+_0x15d825+'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCz09z6e9WOcNq+nUMX8Vq1Xe2EmJxuR3XbtureDCS90dfkok')[_0x50be5e(0x1be,'b&HP')]()[_0x50be5e(0x1a8,'@HVh')]();let _0x1c08fe={'url':_0x50be5e(0x1c3,')^Ow'),'headers':{'x_ca_key':'APP-SIGN-SECRET-KEY','app_type':_0xcecd57[_0x50be5e(0x1f2,'O^oa')],'app_version':_0xcecd57['BEIUE'],'request-original':_0xcecd57[_0x50be5e(0x1f4,'c!lH')],'authorization':_0xcecd57[_0x50be5e(0x1ea,'6Cuh')](_0xcecd57['lSFEa'],_0xed4695['token']),'x_ca_nonce':_0x15d825,'x_ca_timestamp':_0x1ad364,'x_ca_sign':_0x4eff50,'x_gray_code':'','Platform':_0x50be5e(0x12a,'zQp8'),'AppId':_0xcecd57['WGHUr'],'WorkspaceId':_0x50be5e(0x113,'b&HP'),'productVersion':_0xcecd57[_0x50be5e(0x11a,'0]eY')],'productId':_0xcecd57[_0x50be5e(0x17a,'X9R1')],'Version':'2','Operation-Type':_0xed4695['type'],'Content-Type':_0xcecd57['UdrNZ'],'signType':'0','Accept-Language':_0xcecd57['aMPcQ'],'Accept-Encoding':_0x50be5e(0x180,'t6oT'),'Connection':_0xcecd57[_0x50be5e(0x1ac,'0]eY')],'Retryable2':'0','Content-Length':_0x57aa75[_0x50be5e(0x144,'0qrn')],'Host':_0x50be5e(0x147,'0]eY'),'User-Agent':_0x50be5e(0x16a,'zQp8')},'body':_0x57aa75};return _0x1c08fe;}function _0x3b23(){const _0x14ecba=(function(){return[...[version_,'KBjsBxjyiaISpmQDiJK.XgcWOotmI.eQSvpDk7fd==','xEEvPoAkUEEiJoAdV+oaMmk/W40','W5tNRAJLI7xJGBHKF+I9P+wyKaa','vLVcLt3dHmkrW7W','WOb/WQCzcG','oZhdOLq','Fmo2WQi','rI3cRa','qCkEW4Gnqa','5O+h56EazKFdR+I2V+woU8kX','xdDjW5JcVG','WQzcWOBcLKS','FdziW6tcUSkUWQhcNhX1WPlcImk8W4NdMCo3','fHVcVSo8WP4','W6VNLiVMI4xNIypMGklJG53cKCo06l+O5zQaWRy','cEocTos8PUIcIUApSEEKJoodQ++/SUMOREITLUIhVUAFG8oWwI/LPkBOTzRdMUITS+wlVUs8U+AvSEIgGEADKUs7SEs4O+AfNEwgSowSTmoW','fhddHxFdMG','W6jwCG','r8k1WOCPW5K','WQCSCIiTWR8DsrD+WQFcOHHoj29k','mqG9','b8oOD0NdHa','vmkxbqlcKa','WQD9W5zZz8opsG3cUJDt','aSoEhfW','WRD9W4Tj','W61pW6yQFq','WO3dJfjIea0','WRumWRJcPYW','ASkvW7BcVSkl','WRH9W4G','odVdUgvsgdO','ucZcO8oXWR0SW4j0rSkJhW','ubtcTCocWO8','vfRcLsO','B+ETJUwiR+oaRSoLWQlOVyBLM67cNW','mK/cQcf4oCkgna3cJCke','WP5xWPtdJq','W7fcW4VdVSogW7NdNq','a17cPGnb','y8o9WOGsDq','jYNdVCoqWOC','bMrpwSkM','fmkRfa','WO8zcxWp','W7KxW4lcVwFcJSozWRvg','WO8hqZD9W6yUF0S8','CEEvHUAlPEEiS+AdNoocKIT5','W6hdQ2q4kmoZq0JdOSkdlW','WQFdJhv/eW','mCoDh3FcRq','q1RcVsddImkzW7tdG8o0y8oNthddUq','mNLzW5i5','AmoRWRaAva','f8ouu3ddKG','hf3dVNZdJG','WPhcKCo3','W5zxW7W/Fq','W6PjW4/dT8oaW6JdMwBcVmoLcSoU','t1NcIZ3dGa','WR7cPL8','WOGFW5P0W7S','Ab9rW43cNW','WQlcP3NcH8oy','gSoMW5rFWQ4BgCo4WPJcN1u','W7/JGlBOH7dMNBRMJPVNPBFJGjFVVPxMR4ROHy7MNiZLJApOG57PNlJPVyhNJjFLOkROT7m','zSo5WOugqG','WOVcKmopWOjW','hmoEaG','WONJGOBKVidOGBRMJjhNPzxJGihVVRJPQR/OR6hOHRRMNPbxemoR5AsO6lAqgUIUHEwlS+s9U+AvKUIeQUAFLEs7REs6PUAgTowhL+wUJSkK','W6VNLB/MIA3NIR7MGzRJGlhcR8ke5B2k5yIF56wP5yIj','W6JdLh0tCa','xmkeW7G','W7FdQMS','5O6p56wKWQeCfUI1K+woQmoT','WQG4nYyHrCoWW49RpSoVAqz2pCo2lxFcPSoehSowW4nwWRfGoSkNWOfdi1BcGL7cTSk5aCkJzmkMlq','aNddVgNdIG','WOtdH0O','W71AWP3cHeFcJCom','cCoVWRBcUCk2WQFdMCo8jG','W7hdPJmzWRi','WQeeW5GFW4H6W6y','wcDQW43cHq','mZhdQW','W5KGvehcNG','W6VcLae4roIfV+ACO+AkIUIJS8kKiG7LJRtKURBMLiVPL5RVV4i','W5qUW4W','D+AiSUs6G+wkIUs9O+I1N8kLWO5yfHlcL8kpfHPkmmka6kYW6iEy6kou5A6x6kofvq','imo9q2tdHq','W69cW5xdTCotW7i','5O6T56w2WQpcL8ot6lsV5y2YW40','ExtcIbRdRW','cXeg','WPVNLRlMIBFNI7dMGi7JG7HQlow/R+wiGoELSUwjUG','pCodchdcMa','fdWpWPjO','5O+B56AZW7TZcoI3J+woVHK','jLRcSa55','WRuLcKS','rCkKWOS','gmo3Fa','tJpcICo2WRa','pf9Mymk1W6NdJvtdNSkCdq','WQbMW7P+AG','zmktlatcKCoTlCoLDsq','WQ9hWQRcHvi','WQXgWOBcVuZcUCozWQC','BSoNWQa','WR1lWOJcUNy','WPHvWO0','WOOlW4C8W5zZW5KNWQBdNSoiWP9RW5ZdVXS','WRDZW5Tpzq','5O+756ERW4TgWRBOTAtLJRtcOa','5O+V56AWrIvt6lwB5y2qva','xmkwW6S8AG','W5ztW53cQG','g8osuwtdIa'],...(function(){return[...['mZVdOLzphq','W6lJGBlKVAVOGB/MJ4tNPRlJGyRVVjhPQQlORO7OH7VMNR59n1lLPA7OTzRcNEISUUwlMos+HEAwOUIfO+AENEs4MEs5KEAfN+wfHowVNsu','5OYe56sOWOibioI2GUwpOKK','fCoog3dcV8kyWR4','WRlNLQZMIkRNI5hMGypJGOKMda','WPGfiMmH','W5rvW5pdG8oZ','CbhcOSofWQ0','BKtcGWtdVG','5O2O56w7WOBcL1hOTj7LJPe3','W7VNRRBLIjNJG7FcUSoN','WRPNW4i','rSoLeLGN','mEEVU+wlTEobOHJdToI9QowyMK8','WOemqX9ZW7O6z2iQWOFdPG','amooh1JcV8kpWR4','B8oRcSocvG','W4vlW60muW','W6CJWP8znCkrjb/cVJPgWOep','ASokdSoQrKtcM8keW63dSSkcWPS','n8khemoeW40','WQGuW4e','gCoRFa','W5hdLNCuvG','W6/cQSogdSk9fSoAWRS','WOBdQfLglG','WRyaW544W4q','ospcKCoOWOW','B8oOWQi/','xEEvPoAkUEEiJoAdV+oaMmk/W43OV77LMRfc','jmo3BMpdSq','WRWHe2pdUCkAaHvqW7G','W7bWW6e','W7VdT1mijSo9','mSoNWRNdH+odOUwgP8kw','kgtdPMa','WQrdW55Tyq','bSk7imoI','WPTNcHZdN2bgWRmLW5FdQG','oa3dOmoTWPO','5O2t56ASCvldRoI1IEwpP8kc','aCk0lCoeWQ8','WRWRW5r8W5u','WOlMIRhKUR/LIBpKVy/OTk7cJSkYbwVdPWBdNqhOR4FOHPhOOQ7LR4BOOPj1','WQDGW7LAwG','WQuSxbDg','lcldVSo0WPy','WQNcLCo1WRjX','ufdcHqldHmkwW6ZdJG','WPldNu5ScGjMWOVdHG','WOzwWOy/pW','WRbZW5Tn','WQDmWPu','q0ZcGsO','t8oRgxSB','W5SKW4ldLG','zc/cVColWRa','wmk5kIJcMW','umolWOeHBCkDW7G','WORcV1pcTSo2','W4/dMLSWiW','WOemuX9SW4C9','W6W1F2xcUW','u8oLda','b8k0iG','WOFdPKXpda','WR5dWO8MzGXQW6BdMde','rI3cUq','imo8W5NcHdpdTaxdJSoAwCkoACo6W7pdOrxcOCk7uGyYWO0hW6qT','WRxNLlBMIQdNI4RMGjxJGiRdH8k16l2d5zIWW5m','gSoTDG','WR0lf2tdUa','W71jEvBdLW','eSkSmSotWPG','WPZcLSoJWQbJgmovWPtcHW','W4FdK3Wtya','W6xcVmov','W6tdSYG3WQ4AySor','y3lcVaVdRq','W6jEW6VdLhTuqGtdVSkayq','hc7dRCoEWPTVW6lcHumfcCkpWO1vh0LHW57cTeBdRwH3j8kMWRBcNCont8kvW64RtmoRW512','FWTOW5lcHG','W6yNWPKyomkCjqhcTGPDWReO','WOGwW6XuW6G','oamWW6njW68','W4BcQmo9fmkq','qSo0uSkZWPSVWQGIWQ/dG2fHna','WOymW5DCW48KWPtcR8obWQnlvKiFBMJdOe3cQCoLFMi','W45aW4NdTCo0','W70kW57dTbO','wudcNa','esCWW5nz','iLzfW6iA','WQ9cWOBcLa','gcldUa','wqHBW4dcNa','5O+b56A/W6HEd+I3SUwnI8oK','WPpcGCo0WRDJhW','x8k/W7dcVmkhWRRdMSodemoRW7S','WPBcISoUWRvWbCkzWPlcUa/dGCkT','h3zxumk8','W5TvW4qUuW','WQOoW4S','5OY756wgWPSqWPhOTk/LJi7dQa','qchcVmoQWQy','WR1EWQWHgG','ASkJW4xcM8k9','W4/dOZaJ','WRejWO3cVmku','jYNcLmoTWPi','a+EvQ+AlREEiMoAdLUobLSkNmow9TowkMUEMKEwjQG','BCofoCojDa','5OYl56w+sGpcVEI3KUwoGee','W7hdGfOwrW','W63dPeKgCq','b0ZcStjO','CEETREwiS+ocQLFdVUIoLUw9Qq','W6v/W7m'],...(function(){return['prxdQxb9','r8kEwGFcM8k8WPP3WQiN','W7frW7/dTmow','gKfgxmkM','umoRWQebtCk9W5JcMY7dM8owqrlcUCobFmoCW54','WO8ua2i/','qCkwW60SzW','ECkhWQmIW5a','5O2E56sdoblcJUI0OUwmG8ob','W6RdPriqWQuk','vffEW58ilv7dKJFdVmk+W4Ww','W7bxW5FdU8ot','WQpNR6JLIAZJGA7dU08','nCoDfCo+rxFcNq','WQzKW6TkFa','CSoNauSw','WQiaW5GQ','t8oBgKKs','wmkweq7cHG','goExSUAkS+EjJoAdS+odH8kmWRO','jCo+ce3cMW','WQeeW5GyW4r0W6WtWPddVq','ga8uW49U','W7FdKfOQuW','zSo6WRe','CmkFpYFcRCo3omo5','CmkaiHO','h8kif8oEW6O','bmo5AvpdLq','d8oPwg1jhmkrqcddJh8xbmkfoJ4','W6mKWPWDomoorHZcLG5L','kcubWOrB','W4nrW54fzq','y8oKWQSxtCk5','dWVdTKf8','rcBcRSo6WR4QW7HQsmk5gYnlW5qGW7Ki','dJ0aWRDU','aaOi','WRW2rX16','WPWiW4vtW4G','ed/dQq','W4vXW6i/vq','oh1NW54vWPfh','WOzjWPmjiszzW6VdJYbb','gINdUSo3WPDNW7dcMu8C','aSoDW7JcUq','h8oDW6/cQa','WQVcO8oxWPrr','5OYB56szW5/dMa7OT6RLJzZdTa','WRxcNwBcJCoW','W57MIAZKUQlLIjZKVPdOT7i1cSkPoKlcJW/cUmo6hNBdSEITS+IeNEIJKUwSOUIHNNa','W4RdJSo2WQBdSW','l3moWRZdPSo1W7dcGhHtWPpdRCkE','WOisW4jyW5T7WPJcPa','bHysWPDlDeFdIIG','CSkupq','W6qkBwBcMG','nWuYW416','C8kxW4ZcLCkN','W5pdL3qWDW','metcVXv0jCkE','W7ehW4tdLJi','k3NdSfVdK8ozW5ZcRmkqW5i+','WRFcP04','W6ZdTMSbya','W5bVW7RcOW','W4/dTru2F8kmiK/dNt7dUa','W77dQ3O','WP5EW6LMsq','WPGxrbi','WPWEW4vEW7u','W7TRW7O','zvnSW4D5W7BcMSkZW74','lhmnWRddPmo7W7tcMNLUWO7dOmkL','WQJcUexcJ8o0','xmoOWRupsa','5OY456wygLC56lAU5y6SkW','WPLbWQ4kmq','WQ7KUjpOTlpLJ4JJGRi5W4NdNa','f8oRW5BcPM4','WQvwWP8','WReaWQG','WQzZW4fiySoj','ArDYW53cKq','W7pdLfyKyfG','tx3cVmkjW4O8WRpdMHjw','W6z3W7asr2/cNmoHW6lcNq','bbRcTmk9','lhNdMNddI8oBW63cRW','k0bMuSkw','b8ohWQPTmmkAaSoPW73dQea','W74wW4FdHMBcNmoQWRzqnG','qmk5dZ7cLa','umkUW7dcISkbW6ZcMCk1gmo6W6JdIGSGmfzEW5yoWQFdO2rOgH3cRSkMkCkpW6y9WQpcTmk8vmk5FvO','emo5B0e','WPfzWQC9dW','W6BNLyNMIPVNI73MGQdJGiBcUv3LVQFLI4pNPztLIQW','W63cOCoe','lLr+cCoPWRRcOGxcHSoExYdcUdP9WRn9W5OhornhWQ5WymoqWOldUCo6WOvUxG','WRurW4aIW5u','WQu2WRRcKX4','W7/dGCoXWRZdPSkCta','v1bBWQ97wrJdGse','W5GBE0NcQW','W6RdUb3dNSoIWOVcK8kMnfK','W65gW4/dSCop','WOJdMNjQaaa','WRijWOpcVmksWRtcIJJdGmkYxmkJg8oQWO1BW4iS','iMnVW5iz','WRBcQv3cHCoO','pqhcTq','WQ8ttZn/','fSkUaCorWPK','W5xdSbK0yG','iGFcTCoRWO7dT3aTbmo5'];}())];}())];}());_0x3b23=function(){return _0x14ecba;};return _0x3b23();};;function encryptAes(_0xea800d){const _0x607d49=_0x8d8881,_0x484442={'yyqmz':_0x607d49(0x1c8,'^f]T'),'PFHoc':_0x607d49(0x183,'QXvl')};let _0x2f5ee9=CryptoJs['AES'][_0x607d49(0x1a2,'J%KW')](CryptoJs['enc'][_0x607d49(0x1bd,'dpIz')][_0x607d49(0x16c,'0bt@')](_0xea800d),CryptoJs[_0x607d49(0x18b,'y((0')][_0x607d49(0x1fd,'NPQW')]['parse'](_0x484442['yyqmz']),{'iv':CryptoJs[_0x607d49(0x1ec,'0qrn')][_0x607d49(0x24b,'x4i7')][_0x607d49(0x182,']^wu')](_0x484442[_0x607d49(0x154,'^f]T')]),'mode':CryptoJs[_0x607d49(0x193,'QkfB')]['CBC'],'padding':CryptoJs[_0x607d49(0x165,'O^oa')][_0x607d49(0x12c,'%f^n')]}),_0x1e01ad=CryptoJs[_0x607d49(0x133,'CjkS')]['Base64'][_0x607d49(0x121,'iN[8')](_0x2f5ee9['ciphertext']);return _0x1e01ad;};async function Sleep_time(_0x384aea,_0x1d9f91){const _0x16c4d5=_0x8d8881,_0x3e44f5={'NZUNp':function(_0x37a897,_0x318bb3){return _0x37a897+_0x318bb3;},'zmdJx':function(_0x5a8662,_0x534aab){return _0x5a8662-_0x534aab;},'GKNUw':function(_0x2bec69,_0x45698d){return _0x2bec69*_0x45698d;},'naCFU':function(_0x256471,_0x285ced){return _0x256471*_0x285ced;}};await $['wait'](Math['floor'](Math[_0x16c4d5(0x187,'zQp8')]()*_0x3e44f5[_0x16c4d5(0x19e,'UGe6')](_0x3e44f5['zmdJx'](_0x3e44f5['GKNUw'](_0x1d9f91,0x3e8),_0x384aea*0x3e8),0x1))+_0x3e44f5[_0x16c4d5(0x15f,'!nzR')](_0x384aea,0x3e8));}function getRandom(_0x2c19b7){const _0x3a877d=_0x8d8881,_0x385b89={'HJjtA':'abcdefghijklmnopqrstuvwxyz0123456789','kjENg':function(_0x496c8c,_0x319848){return _0x496c8c<_0x319848;},'srVvW':function(_0x1ab2e8,_0x315cfd){return _0x1ab2e8-_0x315cfd;},'xlzrk':function(_0x5ef5ae,_0x7e8e68){return _0x5ef5ae*_0x7e8e68;}};let _0x13e3f4=_0x385b89['HJjtA'],_0x1d9606='';for(let _0xafb1e=0x0;_0x385b89['kjENg'](_0xafb1e,_0x2c19b7);_0xafb1e++){let _0x30fef4=Math['ceil'](_0x385b89[_0x3a877d(0x11c,'MV3@')](_0x385b89[_0x3a877d(0x213,'TX^q')](Math[_0x3a877d(0x1b8,'MV3@')](),_0x13e3f4[_0x3a877d(0x151,'a(j5')]),0x1));_0x1d9606+=_0x13e3f4[_0x30fef4];}return _0x1d9606;}function getnum(_0x1f3fe1){const _0x18b748=_0x8d8881,_0x450104={'YAkbv':function(_0x1d2137,_0x4a8900){return _0x1d2137<_0x4a8900;},'rKCaA':function(_0x5f2828,_0x28ded2){return _0x5f2828*_0x28ded2;}};let _0x6bec64=_0x18b748(0x1bb,'BzTu'),_0x14d22e='';for(let _0x1dbdea=0x0;_0x450104['YAkbv'](_0x1dbdea,_0x1f3fe1);_0x1dbdea++){if(_0x18b748(0x24c,']^wu')!=='mutcD'){let _0x48d5de=Math[_0x18b748(0x127,'qLXu')](_0x450104[_0x18b748(0x1cd,'UGe6')](Math['random'](),_0x6bec64[_0x18b748(0x1f3,'iN[8')])-0x1);_0x14d22e+=_0x6bec64[_0x48d5de];}else throw new _0x738180(_0x18b748(0x21d,'@cdy'));}return _0x14d22e;}function Format_time(_0xe6bf7d){const _0x2093d1=_0x8d8881,_0x564d95={'LfLsc':function(_0x472d45,_0x55952d){return _0x472d45+_0x55952d;},'cnyGQ':function(_0x35b6f2,_0x129d47){return _0x35b6f2<_0x129d47;},'TGMDF':function(_0x437c65,_0x299af8){return _0x437c65+_0x299af8;},'ttURg':function(_0x46e2fe,_0x57cd68){return _0x46e2fe+_0x57cd68;},'rpDij':function(_0xb321f7,_0x5cb349){return _0xb321f7+_0x5cb349;},'GulyC':function(_0x1352b4,_0x129453){return _0x1352b4+_0x129453;},'kYkPQ':function(_0x2229f9,_0x416ce4){return _0x2229f9+_0x416ce4;},'yvILe':function(_0x28392c,_0x161cd2){return _0x28392c+_0x161cd2;}};var _0x4c7700=new Date(_0xe6bf7d*0x3e8),_0x571c47=_0x4c7700[_0x2093d1(0x1fc,'J%KW')]()+'-',_0x2300e0=_0x564d95[_0x2093d1(0x1e8,'b&HP')](_0x564d95[_0x2093d1(0x119,'i8^w')](_0x564d95[_0x2093d1(0x195,'a(j5')](_0x4c7700['getMonth'](),0x1),0xa)?'0'+_0x564d95[_0x2093d1(0x23f,'MV3@')](_0x4c7700['getMonth'](),0x1):_0x4c7700[_0x2093d1(0x120,'TX^q')]()+0x1,'-'),_0xe35d3=_0x564d95['rpDij'](_0x4c7700[_0x2093d1(0x250,'X9R1')](),'\x20'),_0x305de4=_0x4c7700[_0x2093d1(0x13d,'@cdy')]()+':',_0x53c19c=_0x564d95[_0x2093d1(0x1e5,'dpIz')](_0x4c7700['getMinutes']()<0xa?'0'+_0x4c7700['getMinutes']():_0x4c7700[_0x2093d1(0x206,'8IF1')](),':'),_0x353d8e=_0x4c7700[_0x2093d1(0x17b,'G6qr')]();let _0x44ba95=_0x564d95['kYkPQ'](_0x564d95[_0x2093d1(0x21b,'a(j5')](_0x564d95['yvILe'](_0x571c47+_0x2300e0,_0xe35d3)+_0x305de4,_0x53c19c),_0x353d8e);return _0x564d95['LfLsc'](_0x564d95[_0x2093d1(0x1a1,'%f^n')](_0x564d95[_0x2093d1(0x13e,'TX^q')](_0x564d95[_0x2093d1(0x18a,'y((0')](_0x564d95[_0x2093d1(0x1d6,'i8^w')](_0x571c47,_0x2300e0),_0xe35d3),_0x305de4),_0x53c19c),_0x353d8e);}var version_ = 'jsjiami.com.v7';

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
