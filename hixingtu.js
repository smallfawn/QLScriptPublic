/**
 * Hi星途(APP)
 * cron 10 10 * * *  hixingtu.js
 * 下载地址
 * https://xt-manage.exeedcars.com/exeedCC/retainedCapital.html?id=&invitationCode=0100810357443031730176
 * 果园在我的左上角-梦想星球
 * ========= 青龙--配置文件 ===========
 * # 项目名称
 * export hixingtu_data='token @ token'
 * 
 * 多账号用 换行 或 @ 分割
 * 抓包 https://starway.exeedcars.com , 找到 Authorization 去掉Bearer 去掉Bearer 去掉Bearer
 * ====================================
 *   
 */



const $ = new Env("Hi星途");
const ckName = "hixingtu_data";
//-------------------- 一般不动变量区域 -------------------------------------
const Notify = 1;		 //0为关闭通知,1为打开通知,默认为1
let debug = 1;           //Debug调试   0关闭  1开启
let envSplitor = ["@", "\n"]; //多账号分隔符
let ck = msg = '';       //let ck,msg
let host, hostname;
let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
let userList = [];
let userIdx = 0;
let userCount = 0;
//---------------------- 自定义变量区域 -----------------------------------
//---------------------------------------------------------

async function start() {

    await script_notice()
    DoubleLog(' Hi星途 ');
    DoubleLog('\n================== 用户信息 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.user_info());
        await $.wait(2000);
    }
    await Promise.all(taskall);
    DoubleLog('\n================== 执行评论 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_comment());
        await $.wait(5000);
    }
    await Promise.all(taskall);
    DoubleLog('\n================== 发布文章 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_art());
        await $.wait(10000);
    }
    await Promise.all(taskall);
    DoubleLog('\n================== 发布文章 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.task_share());
        await $.wait(10000);
    }
    await Promise.all(taskall);
    DoubleLog('\n================== 水滴签到 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.tree_signin());
        await $.wait(10000);
    }
    await Promise.all(taskall);
    DoubleLog('\n================== 果园浇水 ==================\n');
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.tree_water());
        await $.wait(10000);
    }
    await Promise.all(taskall);



}


class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split('&')[0]; //单账号多变量分隔符
        //let ck = str.split('&')
        //this.data1 = ck[0] //今天好开心哦  //大家晚上好  //早上好  //中午好 //帅哥  //元宵节快来
        this.artTextArr = [
            { "appId": "star", "nonceStr": "aa62020a-fa16-49b4-8c86-64f22bccbbbe", "content": "RhaULxJxCcBQEEJrM3yeIm8q55E3KplbwLmhE6nGl99bgz34NJ10Kjy1aIEeNiW28hAaxPhMN6FdOulFyeGYooxBqRiYq/hOns1HC6mgEwbGoY11U5+/+rUUzXpX5HzuEo2/Z0RvkNZKPHdm0NdLTv33E1tXHFcv0qMhJhKKwZFCBFoppsEreKeTWs17UefhgncA0cpbch+1Ju5XraxfNVlBLr5EU9J6+S9QvO+JFSPz84ZTjxuabEMpxA72CzBHMsb0D4d3c1OJNfSjQg6rkbJYgHOBmsDgpC/Kihc/lg4H11KI224DKpqDIDT7EdIAn+23TymiRJqMUp6DnLq13SdpSQG29DNJvjO/ndcxFPagneUrpdepyHYK47VsWeimumEsMzXk8THeay7WveThBwdeQoOpnZRdPwgYFiPOOBhPOQAHOuEzHwOF2PZ4NgiF7SV3Zx6HHGk6KlQsBUH5pvlldVAud/F73WIS2Y0reaq8Nt+I42c9ghxnfG0pWaxM", "timestamp": "1675337171349" },
            { "appId": "star", "nonceStr": "e7591a78-1280-471f-b72a-d1708bd7fb63", "content": "bdRfIsZAg8JtzrGytJicrlGU2d8pV4QervOwSswh9CFgyDr68vJHXpWA5XGQigkJMg37qkoBzC9ZZVA56GmsnYYI2B2zhbMiuLojFuHKXvPcs/dGQ9tns4SDiaovFGuTjtrDgbA/cvGB+A4bD8VkS7DKSzjMaR/tbPK9Jx/wWx5pca+IUufeM49vf8M0s1njJ2Cg39tRbbZVwhY1FKou1zePPGqI4D0qRbmwOw1z1wODJhJUnRSYGn2at74Uip7jAPxV7vpkf0iU8/T9sfl1DwUFAzaN1OEgFf+ZtxhLhMx17yHTDCpT/7KYn7dlbIEeJHImv/G2Xc9njoqG/yF51S2OTL+UTESw8Q483/5FdRb0eqh41QFf3h7W+Rv0LkC1LQOmTHIctjuYXIN2PL3i2Hc+ZCNJRSQH9LO2ux4+7NOYL5eLre8ZQeP+1C9AF40HBtj2YKcppdJkoj3kT1xnvfGb7DoHU9QHXEjwDYDpzQ0C0k6r4hNNbUEee9uiJVQWJbGuKqnNA6R18t9CUcFoCdlmWAt1d1zfhBEdYuZ+hb4suHyOdofyoZeNgK+FAPSMHSamy42UGd4bb0zshqM+e+eieTgv+pmjjeqBJpuIyBgX/qUj3q+0ovBXbOyxEbWQoekMTExTCYRPLf5JZhfCMOcCPhRUfjIjA8ei2s5fabA=", "timestamp": "1675328557316" },
            { "appId": "star", "nonceStr": "3ea78a1e-d0b2-4d14-97f4-217f1e2a1843", "content": "IayW7N3NExhAvUJ3jRMRH51qVpGA+HLGwktW1ObZyJLK3wKfRkUpm4SiGnrpyWAAY61hj+/XFobnzpDw5S/kescRgcgmB13t4qlNJymQWkyr7xSpPCQe+mYXpUgGzUIlKNLSVWLody02cAF9GH+eVkMCBAJXJzccZGXE9aPkOVgR9jSxzGePxDyxJ27nTRvYmYZ3a/zxhJgjneFhthWbNm4l6xafVTt0rVxpQzdNOAlaVKGHCVXKSz7S/tZ3nypDE68q5nTu/gODEpDgygtaKaYhDwyoo2uNhoujKm8K/8D/b6Uu/es0tTD3ZyDbWgsrcZY4yrPa7D5ufjwdGJUzRzuoSkA3Ovl2MsnLHDwBpBITqx6lJbAsAtW5Fguibu46KI97ZIebrIPHwsvSUST5fNBPA7LETLk0uv+e9MWrPg1rX8clyc/KrXc3dzTflD5jwcr3z4WOw8pEPXpHxjFBxZREic/QZidRBnkClMo8I7ji3bTIY4JFQPE46LK8zOWOWw6Uoqp7t2RhH8qCD80P+aYoykWvB6KkAD+jObRqQvFf1zbLYqfzMpndldmTFimIdKeMIzhEAKouMiiJUrm2m2sh5TLUmRwmcfC6Z025W1c31MRRfttRJcjfWIAnFyio6JNyXmwF0h5O1jeWvxf1Ay/7y5ZZ2PbV79HXN8/PW+A=", "timestamp": "1675337418581" },
            { "appId": "star", "nonceStr": "c103f465-5fb5-4f98-a707-a8c18f440a56", "content": "EmGYqtBnGft6+vLGT4Jt0xDzRnYkysV2vMFYhw7fzOKz9dsucMYqTgpm5BfWcgCBPSMaBrbihAaNbt6qjFO2uuXbgWe2y9pjdib/Nee2ldZA8FnpEz9vtFlv4vMczvAlYOWLLduBqQ4kM+3b+QBumr5mfSA6GACrFR05wZH/ZsB2Mjulwtf7wo/pOT/M4rHFaESRt6qPJQpCl3c8ZHn2rCJSw2x8D6xaepfo26trtMSZ7gh5jn/p4QB2gq36uSIBoQU6S2cjy5URWH/3qYocc/kUiWBM5uRT2rUOiudUgFfuAJlDAWGpipCYnla39eL9PIi8453Mcr7bDMSftrgDVDau/CPapJ7v9JBNL6DQ02QWt24EHyOB/eOjTvcn1jd+6QdoM5paWpfm4yKhMPP7S/nvht8mMfAnmnnNN9gyVQbiH2IrhTGjKz0E9RPpjzhKZH7FgQq075RWc40pLnH6Hoz6SdUi/D55Mc8KxGWTIXIjQYlIjcWtE3qdDKi9npMzUV1hfed2Jarkug+fQ0ohl+elGqn8kAuITOFXwl1Bm0exbwNPfRz/bpuOWtufOhgt0lzymIggTjGyvjx2uSGoiGjBfSQJwcBYk65cbT6Vup3LYNpNSe4lkxjSlmq2YLLkcdT2TlKScelqb3iDmNVn0msrxnEkRi0X25rRNSWEW28=", "timestamp": "1675337496754" },
            { "appId": "star", "nonceStr": "f51eded0-700e-4102-a942-5a6ffd60f467", "content": "CitXR+WjblhdaRawuhXOpmzI6+6cpET1E3780dGkKl1x0sJsyRRl+pJquYKltUumN4KbMjq9sRSf6KV4xg7WRPn9FDxOIKSvbVRfsMcjdQuaOaOM0Pm6gFXwKLQYqcsi+ypkisa3qKHanhuq/63epv+tkd4gMRIUxskeX8oHWVaNdv8NcDKLS23tfPioS5sNYmAgFvzifI4RwQx7/05UKVq1ths8X9NCvfISpSnZTJV4mCKE+v7GM73rgnpq9x0CKroZpUgmQGqDv5jDbkmYRJSv+/fg+G2BSecP0Ka3mH9oAr13MvyGZMMUDxeaO1+1YiR2UAnBl0MgHr8atnvgq3plqauqwekBRNpq/1FEjyOYiI/1P4Th5oG32u3mfnHKExL100YMxjQZIfWbEbc8PgADA7eEklP14iB1sGOtS7pGTWBZgOF/nbeEpLmXqVgqYMV3BN4J332F3olZ4e4ZsYZrtxjLKCAxcfLXPCtPtpoo2yCNTwymGCeB5oJmzQ+Wen0qOOdMZ8D9Hl426WMC1vC1+FCa+vYlYvmcYaV3uCWUkPVNJHFHmZ+DjsiShwb98M0ZgvvLmqw5ciP8Z61b1nSxR7hks27re7cV7g3AoPOQw7qNs+3ql1qZ8YST9vl7Q4t4DtrMqp83RngELoSQFpFWNx/kVe9Jc4LOIkustgQ=", "timestamp": "1675337638031" },
            { "appId": "star", "content": "NP\/EedtWbrFOAKf7mff5tMXjWLMJ5b5tKtssExV+cIeG8jKfQYym+KGYDp0x18pJOlOn\/mtn7Ha4PAZ83isDM57vYXbW+jE+4xXjnF5nhT9sNeFmdotEy645GM2SkNCMGuUCAtee1DlUUFqro2cCSBgBV29001w8RadetznJ9BBTrvkSeKmhYEYm1Y4eoEiTEl1D64hLdqaZgMPwCqCzLuvrqjIEKoQzaeGoEOjQij9etuUdOGkftzFirx6+MhlEH7HZ5WqUNarMOSKcK2zscJCLO5ONoxz72ht4PklPxfN4Ax93C0nnTg4scSiB5TiUlSkb1NgnaVPKujM2yB0lFlLr4TS\/fZMyX5hddOejFWx\/KFUCOdwcpByguxdarZhjU78Y530JgSElSJGoUFBNpUgPnfkxiZXE\/YrDx6PAYbhzj1lHNYmsJuDqTEILNi0pMoZ0A7o+YY+HkXrLL6AGYFKw6hcSbJGi2P\/ZLa5HUoxLhNkn\/wX8grK9fsScuUgBhlMXMya0mZbFVw0vwLrqTMog6ubsXSwORdxX633PSDDSwKrUOeQ6+CqvgYvE1Ic\/wWgnSmn4rOeQo\/gqg1mE6FX7\/n\/Pa3a+gYXU3jbzUsxEDykQJPxvclMhHtRY3lMfuswmT3UhPYdHUvPecr1hb2s\/3eS\/1plCJFZAYoPxd70=", "timestamp": "1675338112598", "nonceStr": "uCCUQlzNeTB2j10JIiNKBrnKxfLBVBFB" },
            { "appId": "star", "content": "WVcRQf86d3Jb33O7V3+y+Q36saXXwDSrYWuC3A6L19QliSEuSKO6AJjX4sicNvdhQGckQ2UOY1aDjjZnptJS7sXc3mXgaCDhwTmGUxG42vt287lDXu\/aZ4yyKy3BZeMg5EmBukGgriI85Wm7tU0uX1cou+Z10QJ\/zxASHsHU\/RQpu9y1VW2Ld4xxZMxwuVq5lr3XtCQ1aQ6ylDi61ivt4jylA9xUpsFhBLg\/lx+8FDZrZlvuEtxJ9DDVvFF6K1GE7a7kKCt+CXspeIqz8XLMA2H9kkg7GzbAbMc50ZTu8f96ZdBjTTxfG+VJ+cuNYaA+IRFDfsVfyWADywO4xYQV3w1hYuvoEAn4wToZdnB4ExHZghh31ZLe6q88VpYN\/aoF7FmoQz2XHklZJcfrtNkrhcSiGwnMKUihAXXVH6coagKknnLys1HmtP7XBT91F9hlb2Aq223IFfboiL\/lbzXbhH97BQrD3ytghVtZgUCzgDdpY9aNxXuSPQSAVRrW0He6k8cFlFzUJZpOnSasNzGKsGb\/ivze5jzpw3MSdF1BBlb8jYPRSqDus0wXvpm8BpBO8x6x8fekb1IhHZWgD\/mPKg\/N8PnjoUbF01s47Ede4m61nDmEXrSlZ\/KJemiyc4aUFMhPyzOm4vW8FVK7fR+6QYlQQed6QTedHQiDnO5IZd4=", "timestamp": "1675338398682", "nonceStr": "AVluFMJ066DUHyphznobsizl3bCQS218" }

        ]
        //this.randomArt = 
        this.artText = this.artTextArr[randomInt(0, this.artTextArr.length)]
        this.commentTextArr = [
            { "appId": "star", "content": "kB8S2U+NcnV4YZ6S0fjiiQviGqAG6tVf6mGckaGVM+PeffCnyDs8\/j93xZZjawDzk\/j1Y2nHAJaTMo322e4c\/S49U8COp54n2vvzt6B7qS1mdDt3Xl2OISGktZnyBS+F\/2rbu0LqaF+Yf0RSEbTwh4ZTnCR5qmfKD0buFVtvp5sr+CZKJpASBdrelsmsD6yeALsYjdBbX4RZbTZvLdprURWbKOdBvYL9CPznyylEaMSUuKn3qYoXvMjpCWHuXrJN2+YN+4PkBXa2KVI50ktQbg4zrg34hHx8Zcv\/3kp4JZNhAVvDWmv38vxo6PGsg8cRW+pSPhQzb4L594H0Z9heglZr5ScDIZkCcQ4UWv9n+peVRoMMu0geRxm3Hgw5tskh6emE+MzxdArIRO1Ki8HJetNkUAmua3AE2tDeO9dtvd6otXt5PGZcZVnjF8uK\/WUedeA2ak3D2GUojBKzG4hqaYmZq+YTFJzbKAIxubYjlR\/KVQa2pG\/UhmcSa55I\/MqL", "timestamp": "1675338546461", "nonceStr": "VqcxLc1iolJcCG7UTv7J7MvwwBbzitGr" },
            { "appId": "star", "nonceStr": "e428fa67-6218-4ad9-a5c8-c8713a62a4d4", "content": "h8v8WqsYnlRJv8TbLqRPjYVcpaAtddIDD/7Ex4debi36EzX4v5DCAQcJMEqOZmQrTE07s4RlAPecPPSuTVssDjMVNVXUU4DxHoU2nadxH+2O9nCBL1bcENId4yXENB+mvoS0JhlAZeoD7GFookJmy1/VuEL2cNEUxEda5QuIu8orYO/TKNTDwMjytPOffXhR61uVwKkExu20pNoThB9fPQS55K8a4e9laZ1bcB54FISW8rVKx5Py/cXgmTSXCAZwsLQMr1EzgPoQgaL9GBScBvcU9lHGyEzR7YjRVm11DzT3WZDWIqCo9D5kNMv+QqQp7ITwlRL6QtwyOoESZLQkA2PSy8hS6wr7grHJIwxAEB6NqQUoQWZ49VbIvg2qDfurjeboXuGtCz1Q2ifJ4RP5UCEBN7tQKJXal9qf5+dmliSrlujSQIQTObKaXoRfKDzgFXGIgLVHRWdQZjHRDY2bVORLvPKJNo9bSW5Eg4ityKIbOoxgr80KiNGYVmlEtVj4eOgN/O/HbgSGcXKz3gj9MmSrGXIlfZaMd7yKJeFvsplNIjB6w1k+Brs4RN8UlePy3vcUfR1rEJffRAio0et9mSipG2BHFmFDQDsXhmcDMpdewk7hlgJIr6fmucRgN4LTsD4vHwJscytef9LOVmpYwofTCHhNpNjNvKAQv5NKhRE=", "timestamp": "1675323598092" },
            { "appId": "star", "content": "Z9wr5YfsSRChcIM1ndgKDGX+jbhWcqAbkWSUWk5H7Jvo9EOyH2EiRuCg2N2Lr5GtA3Q\/Dsn6JOWkrEeHFmSVe\/5zK+8upAxsIHpWAT3IFP8FRilH9kqb7sLPag4Kw6rFSx6UxNJXbl7BAIB6NyAnFNni2wNjZ7eQRAc3IzxzSvtkKeToq1eNpVA79N\/pIST+8\/K5xxJqOv+Gk\/AN\/ZmavosE9AW7RKxDmBKtUox1PKgzMK1RBCahN4hEdALO6LUGB\/ERoLLEY0dMpLQEicr0bXvmhjqEydOvZQXgGcYMWUXn3EU4VB0NtbW57KgQz\/Jhzwvc7ekERROJsW\/Dy0kKwzgP+VmBk+ohtY9HOxpINmK7HgpBvBvh+WN1Q1bo7Kx6ydc6VBGikoJwHAROR0V1Pb4lEdjnynT21BhWi8PT+AUYzJO5+8p+AyO49kFkPtRQpHa8vhVmjC5p7qSiwH4HyWj5VvOz6Q0rH3yoyfvalMI6Owt9ZRAniGfJAfRm+dqp", "timestamp": "1675338628480", "nonceStr": "a1QjO5cdVm1kkLEyweFKjkcK4JhRet3r" }
        ]
        this.commentText = this.commentTextArr[randomInt(0, this.commentTextArr.length)]
        this.shareArr = [
            { "appId": "star", "nonceStr": "a13ccef8-5d25-49a1-80cf-ea07b5d2ea39", "content": "UUst3QEGrxyNSlmLVQKa9BIW636gNd7TCl9LNuONtjKWa0UDMoJqP2d2VELaz0oBqCYimsUU+N0PtfP/4rYCM0bH9hWOjvn/o5+PjPZTSD3IA8EtBqxbjVJ+FVqO7ijZ/cDIk8f4auy7IV7kOMd6C4VX2VjuJ3KxdcXFqoJWKGYstBfmDpWU7bHwHK2yxWzMth5EgSZaCAE0vZr2Chlc2DuwMB2y1lTAtOexaGpH3WfdD/JQI8avMj1TTWbsvm+7+FJLkHXzzI/VS8a8+jSNgdrRRmTCPFubpRu/PSKj/67Ni7tijjU+xztVwmqgWEA0ZmeKOKfv9n7yYfsnY1pFelNlU6Ue22SRJd++MbakIDIQ9OOpcWPiFCjmehCSR+2PMDfgFfxASPgYkhPYcNPUo411BrW3c/WpqVGCa8ldSx6hcuCWm3SZ7Eh7xAQHBr1GgPeMM6yD2gmzSx/VkToX0C7xibBDJJhcJ54aIszUbhgmh40Fd7/Li/1KkuwNDtbY", "timestamp": "1675340479120" },
            { "appId": "star", "nonceStr": "d2a475ac-c394-4f7c-adf2-6344e79fed52", "content": "TlipV2m95x/Q9OvTIRR/2h6vmQ6hqv2J1rLfPWZnpe1O0eBBO8xJZdyREsPu39/HJDk+3aiGR5tv6x9jj4CUIf4elIT8e6mFgSR9FuFW5aC4+p4fuprtVk2IUl41LkBuECUZpEFZRlnCbX1j3xTZSFQaiHkU7O0lUlCg5rdTRw5m39eoOQ35clVpCYt24nYt261/Z6S5p8/7CMG1uhyblUdH2rDu+gQewRVrhnO1BUQ5NEW0nR/9TqyxuPku/YJEpGXVV9sDFUt84AgMqZvr7Z7P2CLhZX1GVQguNhmXc6yPVVojf7Yewk03V7qwwu1bmM7WhKt5sSpwwX+rQL9LCVSvZMcKKG73OeB4pJjcy2ORjXkyH0Y0yvtdabuQUFhEsQ/kGp2oxCPcD6B49QZcmEbXoFoaE7ZOywx2F46jINx8o82UEEgKSOFNg3HC7pV75FchD6284yDJE+d3kCSHUC+L0/aHzn8un5rOMv24LbLtf33xhPSoeyXAws4lztm5", "timestamp": "1675340666556" },
            { "appId": "star", "nonceStr": "750a8ac4-e1ed-40b8-8eba-b02a299bfe0d", "content": "MGT8NkxBG++0SCw5nTqWz7OcF1TlLF/Cvj1ZNpk3/SaDiy84DLIA5kgb8JHsiSRpj4NThr1cEw8PxpxBVWPoU2IWDJxXRUGZhl/9jJwxxwyDN7zr1vjV0LN3i/fRK1WUnsYkMZGUnHoUM5/e9dv4eVn9cZYBhLMTkQsWV0mQZ6xf2vowQcc901F33+p/vre4PXB3DDkIGVSwsFYLKW/EWcGo0gtVhntUs8RTg2NdlP+yGzYGlnzXR0zzeLFIl4BiMi9DjenOGmQqSiCV5Gan1wjaISEqPPHi/d95d0aGBXYyXCiE2F7H9a9XSeFFH03aG1DR1YGKYHND7vyZxLMLkg1cNTrge6xqAJCoZbYEvAltoDdL/F/5eWnS6OBN9wkVZDxI+92jC/l1EmYz7kou6G21ARFQyXss8A/iS5ExMv+BLZrYFsohu45+DrwOGaiCxwMpdTc5ShuGz566fL1AFDyls0opvHkF7t9J+B1ChIVBNMLMvEdB+tTo9tgFOFNH", "timestamp": "1675340720916" },
            { "appId": "star", "nonceStr": "5ebbee7a-0102-488e-8f7c-4934c578a91a", "content": "PO/SDn+oEPRFGCAL3qSHILpeVlDkgw8JcqFIXyPRTD01jV+lx7Bf6PHZY7Y4zmPnq17HHKtT7HZo1Fw9C+1237ghnD1QnD1vQJt2x15c+6avfMHhEa91z7ugQA594VJkUzSSUJ9phaYFmnUNt2P5Um0XMKHDpSDypPuB3wmPjIl455/XmfKg8nfJHawTm5zGmZ35vvh3beMZa4LgxNYfIIKnIltLYmcp19BfIyDO59Xvo2yNKPjvotBTVZZs8ZlDkDOACioKg3RbiVgmLWcVaDY0IMkz/H+aX/iqgGP148+5N3MpBx7jaePrTIWLtIqGbRmzP7LiFrhj4InopnR/8E9emcnH4gImZofALK+z8jH0LJl8vi/ED+vMpaP6cdkfVT7WlBLt9xjUCRRvbCqEMgLzKuioMiujIqAMgfpv0SASmdV6J0tvbSc37FavtXpihW7d8N6mxKQI7073F3R0LlZMxdJabT1+kDBClAwTgdE4y1f4prvmX6do7NbiNW8t", "timestamp": "1675340760908" }
        ]
        this.share = this.shareArr[randomInt(0, this.shareArr.length)]
    }

    async user_info() {
        try {
            let options = {
                url: `https://starway.exeedcars.com/api-user/user/queryById`,
                headers: {
                    'Authorization': 'Bearer ' + this.ck,
                    'client_id': 'app',
                    'client_secret': 'app',
                    'Client-Agent': 'device:Xiaomi MI 8 Lite;os:Android 10;version:V1.0.47',
                    'Host': 'starway.exeedcars.com',
                    'Connection': 'Keep-Alive',
                    //'Accept-Encoding': 'gzip'
                    'User-Agent': 'okhttp/4.8.1'
                }
            }
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  欢迎用户: ${result.data.nickName}`);
            } else {
                DoubleLog(`账号[${this.index}]  用户查询:失败 ❌ 了呢,原因未知！`);
                DoubleLog(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_comment() { //评论
        try {
            let options = {
                url: `https://starway.exeedcars.com/api-social/ec/social/comment/submit`,
                headers: {
                    'Authorization': 'Bearer ' + this.ck,
                    'client_id': 'app',
                    'client_secret': 'app',
                    'Client-Agent': 'device:Xiaomi MI 8 Lite;os:Android 10;version:V1.0.47',
                    'Host': 'starway.exeedcars.com',
                    'Connection': 'Keep-Alive',
                    //'Accept-Encoding': 'gzip'
                    'User-Agent': 'okhttp/4.8.1',
                    'Content-Type': 'application/json; charset=utf-8',
                    //'Content-Length':700
                },
                body: this.commentText
            }
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  评论: ${result.ok}`);
            } else {
                DoubleLog(`账号[${this.index}]  评论:失败 ❌ 了呢,原因未知！`);
                DoubleLog(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_art() { //文章
        try {
            let options = {
                url: `https://starway.exeedcars.com/api-social/ec/social/dync/submit`,
                headers: {
                    'Authorization': 'Bearer ' + this.ck,
                    'client_id': 'app',
                    'client_secret': 'app',
                    'Client-Agent': 'device:Xiaomi MI 8 Lite;os:Android 10;version:V1.0.47',
                    'Host': 'starway.exeedcars.com',
                    'Connection': 'Keep-Alive',
                    //'Accept-Encoding': 'gzip'
                    'User-Agent': 'okhttp/4.8.1',
                    'Content-Type': 'application/json; charset=utf-8',
                    //'Content-Length':700
                },
                body: this.commentText
            }
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  发布文章成功: ${result.ok}`);
            } else {
                DoubleLog(`账号[${this.index}]  发布:失败 ❌ 了呢,原因未知！`);
                DoubleLog(result);

            }
        } catch (e) {
            console.log(e);
        }
    }
    async task_share() { //分享
        try {
            let options = {
                url: `https://starway.exeedcars.com/api-social/ec/social/share/submit`,
                headers: {
                    'Authorization': 'Bearer ' + this.ck,
                    'client_id': 'app',
                    'client_secret': 'app',
                    'Client-Agent': 'device:Xiaomi MI 8 Lite;os:Android 10;version:V1.0.47',
                    'Host': 'starway.exeedcars.com',
                    'Connection': 'Keep-Alive',
                    //'Accept-Encoding': 'gzip'
                    'User-Agent': 'okhttp/4.8.1',
                    'Content-Type': 'application/json; charset=utf-8',
                    //'Content-Length':700
                },
                body: this.share
            }
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  分享文章成功: ${result.ok}`);
            } else {
                DoubleLog(`账号[${this.index}]  分享:失败 ❌ 了呢,原因未知！`);
                DoubleLog(result);

            }
        } catch (e) {
            console.log(e);
        }
    }
    async tree_signin() { //水滴签到
        try {
            let options = {
                url: `https://starway.exeedcars.com/api-marking/tree/event/trigger/event`,
                headers: {
                    'Authorization': 'Bearer ' + this.ck,
                    'client_id': 'app',
                    'client_secret': 'app',
                    'Client-Agent': 'device:Xiaomi MI 8 Lite;os:Android 10;version:V1.0.47',
                    'Host': 'starway.exeedcars.com',
                    'Connection': 'Keep-Alive',
                    //'Accept-Encoding': 'gzip'
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36',
                    'Content-Type': 'application/json; charset=utf-8',
                    //'Content-Length':700
                    'Origin': 'https://xt-manage.exeedcars.com',
                    'X-Requested-With': 'com.qirui.exeedlife',
                    'Sec-Fetch-Site': 'same-site',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Dest': 'empty',
                    'Referer': 'https://xt-manage.exeedcars.com/exeedC-tree/index.html',
                },
                body: { "id": 1 }
            }
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  水滴签到成功: ${result.data}g`);
            } else if (result.code == 801) {
                DoubleLog(`账号[${this.index}]  水滴签到:失败 ❌ 了呢,原因${result.message}`);
                //DoubleLog(result);
            } else {
                DoubleLog(result);
            }
        } catch (e) {
            console.log(e);
        }
    }
    async tree_water() { //浇水
        try {
            let options = {
                url: `https://starway.exeedcars.com/api-marking/tree/user/water/get/water`,
                headers: {
                    'Authorization': 'Bearer ' + this.ck,
                    'client_id': 'app',
                    'client_secret': 'app',
                    'Client-Agent': 'device:Xiaomi MI 8 Lite;os:Android 10;version:V1.0.47',
                    'Host': 'starway.exeedcars.com',
                    'Connection': 'Keep-Alive',
                    //'Accept-Encoding': 'gzip'
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36',
                    'Origin': 'https://xt-manage.exeedcars.com',
                    'X-Requested-With': 'com.qirui.exeedlife',
                    'Sec-Fetch-Site': 'same-site',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Dest': 'empty',
                    'Referer': 'https://xt-manage.exeedcars.com/exeedC-tree/index.html',
                },
            }
            options = changeCode(options)
            //console.log(options);
            let result = await httpRequest(options);
            //console.log(result);
            if (result.code == 200) {
                DoubleLog(`账号[${this.index}]  浇水成功: ${result.data}g`);
            } else if (result.code == 500) {
                DoubleLog(`账号[${this.index}]  浇水:失败 ❌ 了呢,原因${result.message}`);
                //DoubleLog(result);
            } else {
                DoubleLog(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

}

!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        await start();
    }
    await SendMsg(msg);
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());


//********************************************************
// 变量检查与处理
async function checkEnv() {
    if (userCookie) {
        // console.log(userCookie);
        let e = envSplitor[0];
        for (let o of envSplitor)
            if (userCookie.indexOf(o) > -1) {
                e = o;
                break;
            }
        for (let n of userCookie.split(e)) n && userList.push(new UserInfo(n));
        userCount = userList.length;
    } else {
        console.log("未找到CK");
        return;
    }
    return console.log(`共找到${userCount}个账号`), true;//true == !0
}
/////////////////////////////////////////////////////////////////////////////////////
async function script_notice() {
    try {
        let options = {
            url: `https://gitee.com/smallfawn/api/raw/master/notice.json`,
            //https://gh.api.99988866.xyz/https://raw.githubusercontent.com/smallfawn/api/main/notice.json
            //https://gitee.com/smallfawn/api/raw/master/notice.json
            //https://ghproxy.com/https://raw.githubusercontent.com/smallfawn/api/main/notice.json
            headers: {
                'user-agent': ''
            }
        }
        options = changeCode(options) //把某软件生成的代码(request或axios或jquery)转换为got通用
        //console.log(options);
        let result = await httpRequest(options);
        //console.log(result);
        if (result) {
            DoubleLog(result.notice)
        } else {
            console.log(result)
        }
    } catch (e) {
        console.log(e);
    }
}
/**
 * 随机整数生成
 */
function randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
function changeCode(oldoptions) {
    let newoptions = new Object(),
        urlTypeArr = ['qs', 'params'],
        bodyTypeArr = ['body', 'data', 'form', 'formData']
    for (let e in urlTypeArr) {
        urlTypeArr[e] in oldoptions ? newoptions.url = changeUrl(urlTypeArr[e]) : newoptions.url = oldoptions.url
    }
    'content-type' in oldoptions.headers ? newoptions.headers = changeHeaders(oldoptions.headers) : newoptions.headers = oldoptions.headers
    function changeUrl(type) {
        url = oldoptions.url + '?'
        for (let key in oldoptions[type]) { url += key + '=' + oldoptions[type][key] + '&' }
        url = url.substring(0, url.length - 1)
        return url
    }
    function changeHeaders(headers) {
        let tmp = headers['content-type']
        delete headers['content-type']
        headers['Content-Type'] = tmp
        return headers
    }
    for (let o in bodyTypeArr) {
        if (bodyTypeArr[o] in oldoptions) {
            (Object.prototype.toString.call(oldoptions[bodyTypeArr[o]]) === '[object Object]') ? newoptions.body = JSON.stringify(oldoptions[bodyTypeArr[o]]) : newoptions.body = oldoptions[bodyTypeArr[o]]
        }
    }
    return newoptions
}
function httpRequest(options, method) {
    //options = changeCode(options)
    typeof (method) === 'undefined' ? ('body' in options ? method = 'post' : method = 'get') : method = method
    return new Promise((resolve) => {
        $[method](options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${method}请求失败`);
                    //console.log(JSON.parse(err));
                    $.logErr(err);
                    //throw new Error(err);
                    //console.log(err);
                } else {
                    //httpResult = data;
                    //httpResponse = resp;
                    if (data) {
                        //console.log(data);
                        data = JSON.parse(data);
                        resolve(data)
                    } else {
                        console.log(`请求api返回数据为空，请检查自身原因`)
                    }
                }
            } catch (e) {
                //console.log(e, resp);
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}
// 等待 X 秒
function wait(n) {
    return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000)
    })
}
// 双平台log输出
function DoubleLog(data) {
    if ($.isNode()) {
        if (data) {
            console.log(`${data}`);
            msg += `\n${data}`
        }
    } else {
        console.log(`${data}`);
        msg += `\n${data}`
    }
}
// 发送消息
async function SendMsg(message) {
    if (!message) return;
    if (Notify > 0) {
        if ($.isNode()) {
            var notify = require("./sendNotify");
            await notify.sendNotify($.name, message)
        } else {
            $.msg($.name, '', message)
        }
    } else {
        console.log(message)
    }
}
// 完整 Env
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
