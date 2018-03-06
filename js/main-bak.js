/**
 * Created by jo.chan on 2017/11/21.
 */

// window.onerror 错误sentry 上报
var __hasProp = {}.hasOwnProperty,
    __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };

window.Error = (function (_super) {
    __extends(_Class, _super);
    function _Class() {
        var error;
        error = _Class.__super__.constructor.apply(this, arguments);
        Raven.captureException(error);
        return error;
    }
    return _Class;
})(Error);

window.pg_config = {
    status: {
        300: 'not login',
        404: " ขาดข้อมูล ",
        406: "ไม่พบตัวละคร",
        405: " ไม่มีกิจกรรมนี้",
        402: "  กิจกรรมสิ้นสุดแล้ว",
        401: " กิจกรรมยังไม่เริ่มขึ้น",
        441: "กิจกรรมยังไม่เริ่มขึ้น",
        403: " หมดCdkey",
        200: "Success",
        400: "ยังไม่บรรลุ",
        1000: "ยังไม่ครบเงื่อนไข",
        1001: "จำนวนครั้งล็อกอินยังไม่ครบหรือบางวันไม่ได้ล็อกอิน",
        1005: "รับแล้ว",
        1003: "เวลาออนไลน์ยังไม่ครบ",
        1004: "จำนวนคำเชิญยังไม่ครบ",
        1101: "ข้อผิดพลาด API เกม",
        1002: "จำนวนผู้เข้าร่วมยังไม่ครบ"
    },
    api: {
        server: 'http://10.10.3.144:8081',
        //平台登录
        login: '/user/sdk/login',
        //fb登录
        fbLogin: '/user/fb/login',
        fb_redirect_uri: 'http://pokesaga.pocketgamesol.com/activity/oneyear',
        //获取区服
        zone: '/user/sdk/zones',
        //获取角色
        role: '/user/player/list'
    },
    data: {
        appId: 10052,
        fbId: '548408708701703',
        groupId: '5a0a94804fef391278268e5a',
        version: 'v3',
        actId1: '5a0a94804fef391278268e5d',
        actId2: '5a0a94804fef391278268e5b',
        actId3: '5a0a94804fef391278268e5c',
        //抽奖
        actId4: '5a1391e3422ebf0850a5fc44',
        //次数
        actId5: '5a139200422ebf0850a5fc45',
        //充值
        actId6: '5a139235422ebf0850a5fc46',
        //竞猜礼包
        giftId: ["5a0a94804fef391278268e60", "5a0a94804fef391278268e5f", "5a0a94804fef391278268e5e"],
        count: 0
    },
    tip: {
        //抱歉，你今天还没登录游戏，无法参与活动
        tip1: 'วันนี้ยังไม่ล็อกอินเกม เข้าร่วมกิจกรรมไม่ได้นะ',
        //领取成功，请到游戏中查看奖励
        tip2: 'ได้รับแล้ว กรุณาไปเช็คดูที่เกม',
        //等待开奖
        tip3: 'รอเปิดรอบ',
        //恭喜中奖竞猜
        tip4: 'ยินดีด้วยที่ได้รับ',
        //没有抽奖次数
        tip5: 'ขณะนี้คุณยังไม่มีสิทธิ์สุ่มรับรางวัล กรุณาล็อกอินเกมก่อนเพื่อได้รับสิทธิ์',
        //遗憾没奖
        tip6: 'ยินดีที่ได้รับรางวัล',
        //恭喜中奖
        tip7: 'ที่คุณไม่ได้รางวัล',
    }
};


function checkFBLogin() {
    var FB_CODE = $.trim(getParameterByName("code"));
    if (FB_CODE == "") {
        return;
    }
    var requestURL = pg_config.api.server + pg_config.api.fbLogin;
    $.ajax({
        type: "GET",
        async: true,
        url: requestURL,
        data: {
            clientId: pg_config.data.appId,
            redirectUrl: pg_config.api.fb_redirect_uri,
            code: FB_CODE
        },
        beforeSend: function () {
            $(".loadingBtn").show();
        },
        success: function (result) {
            $(".loadingBtn").hide();
            handleLogin(result);
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

function handleLogin(result) {
    if (result.code == 200) {
        localStorage.setItem('userId', result.state.userId);
        localStorage.setItem('username', result.state.userName);
        localStorage.setItem('token', result.state.token);
        var myTimer = new Date().getTime();
        localStorage.activetime = myTimer;
        hideLogin();
        showChannel();
        loadGameZones();
        if (localStorage.facebook == 1) {
            window.location.href = pg_config.fb_redirect_uri;
        }
    } else {
        $(".login-tip").show();
        $(".login-tip").text(pg_config.status[result.code]);
    }
}

/**
 * load GameZones
 */
function loadGameZones() {
    var zones = localStorage.getItem("zones");
    if (zones && zones.length > 2) {
        var data = JSON.parse(zones);
        setZones(data)
    } else {
        $.ajax({
            url: pg_config.api.server + pg_config.api.zone,
            type: "GET",
            data: {
                appId: pg_config.data.appId,
                token: localStorage.token
            },
            success: function (result) {
                if (result.code == 200) {
                    $(".tip").hide();
                    setZones(result.state);
                    localStorage.setItem("zones", JSON.stringify(result.state));
                }
                else {
                    $(".tip").show().text(pg_config.status[result.code]);
                }
            },
            error: function (err) {
                console.log(JSON.stringify(err));
            }
        });
    }
}

function setZones(data) {
    var list = data;
    var openList = [];
    for (var i = 0; i < list.length; i++) {
        openList.push(list[i]);
    }
}

function isLogin() {
    if (localStorage.userId && localStorage.token) {
        var active = new Date().getTime();
        active -= 1800000;
        if (active < parseInt(localStorage.activetime)) {
            return true;
        } else {
            localStorage.username = "";
            localStorage.token = "";
            return false;
        }
    } else {
        return false;
    }
}

//判断是否选择角色
function isChoose() {
    if (localStorage.zoneId) {
        {
            return true;
        }
    } else {
        return false;
    }
}


//寻找对应区服
function findZone(index) {
    var zones = JSON.parse(localStorage.getItem("zones"));
    var temp;
    for (temp = 0; temp < zones.length; temp++) {
        if (zones[temp].thirdGameZoneId == index) {
            break;
        }
    }
    if (temp == zones.length) {
        $(".tip").show().text('จงเลือกเซิร์ฟเวอร์ที่มีตัวละคร');
        localStorage.removeItem("playerId");
        localStorage.removeItem("playerName");
    } else {
        localStorage.setItem("zoneId", zones[temp].thirdGameZoneId);
        localStorage.setItem("gameZoneId", zones[temp].gameZoneId);
        $.ajax({
            url: pg_config.api.server + pg_config.api.role,
            type: "GET",
            data: {
                appId: pg_config.data.appId,
                gameZoneId: zones[temp].gameZoneId,
                token: localStorage.token
            },
            before: function () {
                $(".channel-loadingBtn").show();
            },
            success: function (result) {
                $(".channel-loadingBtn").hide();
                if (result.code == 200) {
                    if (result.state == '') {
                        $(".tip").show().text('จงเลือกเซิร์ฟเวอร์ที่มีตัวละคร');
                        localStorage.removeItem("playerId");
                        localStorage.removeItem("playerName");
                    } else {
                        $(".tip").hide();
                        var data = result.state[0];
                        localStorage.setItem("playerId", data.playerId);
                        localStorage.setItem("playerName", data.playerName);
                        showMessage();
                        initInfoActivity();
                        $(".black-bg").hide();
                        $(".choose-form").hide();
                    }
                }
                else {
                    $(".tip").show().text(pg_config.status[result.code]);
                }
            },
            error: function (err) {
                console.log(JSON.stringify(err));
            }
        });
    }
}

function saveInfo() {
    if (isLogin() && isChoose()) {
        $(".black-bg").hide();
        $(".choose-form").hide();
        showMessage();
    }
    else {
        $(".tip").show().text("จงเลือกเซิร์ฟเวอร์ที่มีตัวละคร");
    }
}

function showMessage() {
    $(".qf").html(localStorage.getItem("zoneId"));
    $(".js").html(localStorage.getItem("playerName"));
    $(".userMessage").show();
    $(".loginBtn").hide();
}

function showChannel() {
    $(".black-bg").show();
    $(".choose-form").show();
}

function showLogin() {
    $(".black-bg").show();
    $('.login-form').show();
}

function hideLogin() {
    $(".black-bg").hide();
    $('.login-form').hide();
}


var requestUrl = {
    //参与活动
    joinActivityUrl: pg_config.api.server + '/activity/join',
    //获取活动信息
    infoActivity: pg_config.api.server + '/activity/info',
    //历史奖励
    getHistroy: pg_config.api.server + '/activity/cdKeys'
};

//竞猜状态数组
//guessArr[1][2] 表示第二期下第三只宠物
var guessArr = new Array();

//转盘图标顺序
var rewards = {
    id: {
        "5a1398de422ebf0850a5fc8d": 0,
        "5a1398d1422ebf0850a5fc8b": 1,
        "5a13989f422ebf0850a5fc88": 2,
        "5a13991e422ebf0850a5fc95": 3,
        "5a1398fc422ebf0850a5fc91": 4,
        "5a1398ec422ebf0850a5fc8f": 5,
        "5a13990e422ebf0850a5fc93": 6,
        "5a139939422ebf0850a5fc97": 7
    },
    imgData: {
        "5a1398de422ebf0850a5fc8d": 'img/icon/dsmz1.png',
        "5a1398d1422ebf0850a5fc8b": 'img/icon/ssmz1.png',
        "5a13989f422ebf0850a5fc88": 'img/icon/ssp11.png',
        "5a13991e422ebf0850a5fc95": 'img/icon/thx21.png',
        "5a1398fc422ebf0850a5fc91": 'img/icon/ss1.png',
        "5a1398ec422ebf0850a5fc8f": 'img/icon/syqladn1.png',
        "5a13990e422ebf0850a5fc93": 'img/icon/thx11.png',
        "5a139939422ebf0850a5fc97": 'img/icon/gjzb1.png'
    }
};

//通用ajax
function ajaxDataController(url, params, successCallback) {
    $.ajax({
        url: url,
        type: "GET",
        data: params,
        beforeSend: function () {
            // loading();
        },
        success: function (result) {
            successCallback(result);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            Raven.captureException(new Error(url + ',' + JSON.stringify(XMLHttpRequest)));
            tip('request error');
        }
    });
}


//点击日累计登陆领取奖励
$(".getBtn").on("click", function () {
    if (isLogin() && isChoose()) {
        var dataActId = $(this).attr('data-rewardId');
        var index = $(this).attr('data-index');
        var params = {
            groupId: pg_config.data.groupId,
            actId: pg_config.data.actId1,
            rewardId: dataActId,
            token: localStorage.token
        };
        ajaxDataController(requestUrl.joinActivityUrl, params, function (result) {
            if (result.code == 200) {
                tip(pg_config.tip.tip2);
                $(".award-main li").eq(index).find("div.dayActive").show();
            }
            else {
                tip(pg_config.status[result.code]);
            }
        })
    }
    else {
        showLogin();
    }
});

//点击提交竞猜
$(".submitBtn").on("click", function () {
    if (isLogin() && isChoose()) {
        if ($(".submitBtn").hasClass("guessAward_btn")) {
            //领取竞猜奖励
            var data = {
                groupId: pg_config.data.groupId,
                actId: pg_config.data.actId2,
                rewardId: $(".menu-bar ul li.active").attr('data-rewardId'),//对应期数的rewardId
                token: localStorage.token,
                step: $(".menu-bar ul li.active").index()
            };
            ajaxDataController(requestUrl.joinActivityUrl, data, function (result) {
                if (result.code == 200 || result.code == 1005) {
                    $(".submitBtn").addClass('haveAward_btn');
                }
                else {
                    tip(pg_config.status[result.code]);
                }
            });
        } else {
            if (!$(".menu-bar ul li.active").hasClass("disClick")) {
                //如果是竞猜
                var dataActId = "";
                for (var i = 0; i < 10; i++) {
                    if ($(".act-box ul li").eq(i).hasClass("active")) {
                        dataActId += i;
                    }
                }
                if (dataActId.length < 5) {
                    tip('คุณยังไม่ได้เลือกให้ครบ5ตัว');
                } else {
                    var params = {
                        groupId: pg_config.data.groupId,
                        actId: pg_config.data.actId2,
                        ticket: dataActId,
                        token: localStorage.token,
                        step: $(".menu-bar ul li.active").index()
                    };
                    ajaxDataController(requestUrl.joinActivityUrl, params, function (result) {
                        if (result.code == 200) {
                            $(".submitBtn").addClass('wait_btn');
                            if (localStorage.canGuessCount < 3) {
                                localStorage.canGuessCount++;
                                $(".act-desc span").text(localStorage.canGuessCount);
                            }
                        }
                        else if (result.code == 1005) {
                            tip('ส่งไปแล้ว รอผลนะ');
                        }
                        else {
                            tip(pg_config.status[result.code]);
                        }
                    });
                }
            }
        }
    }
    else {
        showLogin();
    }
});

//点击活跃人数领奖按钮
$(".pointBtn").on("click", function () {
    if (isLogin() && isChoose()) {
        var dataActId = $(this).attr('data-rewardId');
        var index = $(this).attr('data-index');
        var params = {
            groupId: pg_config.data.groupId,
            actId: pg_config.data.actId3,
            rewardId: dataActId,
            token: localStorage.token
        };
        ajaxDataController(requestUrl.joinActivityUrl, params, function (result) {
            if (result.code == 200) {
                tip(pg_config.tip.tip2);
                $(".point-pic ul li").eq(index).find("div.pointActive").show();
            }
            else {
                tip(pg_config.status[result.code]);
            }
        });
    }
    else {
        showLogin();
    }
});

//点击抽奖
$(".startBtn").on("click", function () {
    var params = {
        groupId: pg_config.data.groupId,
        actId: pg_config.data.actId4,
        token: localStorage.token
    };
    if (isLogin() && isChoose()) {
        if (localStorage.canLotteryCount > 0) {
            $(this).attr("disabled", "disabled");
            setTimeout(function () {
                $(".startBtn").removeAttr("disabled");
            }, 3000);
            ajaxDataController(requestUrl.joinActivityUrl, params, function (result) {
                    if (result.code == 200) {
                        localStorage.canLotteryCount = $(".count-desc span").text();
                        var index = rewards.id[result.state.rewardBase.rewardId];
                        var icon = rewards.imgData[result.state.rewardBase.rewardId];
                        $(".lottery-bg").rotate({
                            angle: 0,
                            duration: 3000,
                            animateTo: 360 * 5 + (8 - index) * 45 + 22.5,
                            callback: function () {
                                localStorage.canLotteryCount--;
                                $(".count-desc span").text(localStorage.canLotteryCount);
                                var rewardName = result.state.rewardBase.rewardName;
                                showLotteryAward(pg_config.tip.tip4, icon, rewardName);
                            }
                        });
                    }
                    else {
                        tip(pg_config.status[result.code]);
                    }
                }
            );
        }
        else {
            showLotteryAward(pg_config.tip.tip5, '', '');
        }
    }
    else {
        showLogin();
    }
});

//点击抽奖获取历史获奖记录
$(".getHistroy-btn").on("click", function () {
    $(".black-bg").show();
    var params = {
        actId: pg_config.data.actId4,
        groupId: pg_config.data.groupId,
        token: localStorage.token
    };
    ajaxDataController(requestUrl.getHistroy, params, function (result) {
        if (result.code == 200) {
            if (result.state.length > 0) {
                var dom = '';
                var dataList = [];
                for (var i = 0; i < result.state.length; i++) {
                    dataList = result.state[i];
                    var icon = rewards.imgData[dataList.rewardId];
                    dom += '<li><p class="date">' +
                        dataList.getDate + '</p>' +
                        '<p class="name">' + dataList.rewardName + '</p>' +
                        '<p class="icon"><img src="' + icon + '">' + '</p></li>';
                }
                $(".histroyUl").append(dom);
                $(".black-bg").show();
                $(".show-histroy-box").show();
            } else {
                showLotteryAward(pg_config.tip.tip3, '', '');
            }
        }
        else {
        }
    })
});

//点击充值奖励
$(".charge-btn").on("click", function () {
    if (isLogin() && isChoose()) {
        var dataActId = $(this).attr('data-rewardId');
        var index = $(this).attr('data-index');
        var params = {
            groupId: pg_config.data.groupId,
            actId: pg_config.data.actId6,
            rewardId: dataActId,
            token: localStorage.token
        };
        ajaxDataController(requestUrl.joinActivityUrl, params, function (result) {
            if (result.code == 200) {
                $(".charge-box ul li").eq(index).find("div.chargeActive").show();
                tip(pg_config.tip.tip2);
            }
            else {
                tip(pg_config.status[result.code]);
            }
        });
    }
    else {
        showLogin();
    }
});
$(".lookAward-ul ul li").on("click", function () {
    $(".lookAward-ul ul li.active").removeClass("active");
    $(this).addClass("active");
    var rewardId = [""];
    var index = $(this).index();
    var k;
    for (k = 0; k < pg_config.data.guessHis.length; k++) {
        if (pg_config.data.guessHis[k].rewardId == rewardId[index]) {
            break;
        }
    }
    switch (pg_config.data.shutNum[index]) {
        case 3:
            $(".lookAwardbox p").hide();
            $(".lookAwardbox div").removeClass("award-img-1 award-img-2 award-img-3").addClass("award-img-1").show();
            break;
        case 4:
            $(".lookAwardbox p").hide();
            $(".lookAwardbox div").removeClass("award-img-1 award-img-2 award-img-3").addClass("award-img-2").show();
            break;
        case 5:
            $(".lookAwardbox p").hide();
            $(".lookAwardbox div").removeClass("award-img-1 award-img-2 award-img-3").addClass("award-img-3").show();
            break;
        default:
            $(".lookAwardbox div").removeClass("award-img-1 award-img-2 award-img-3").hide();
            var tips = pg_config.tip.tip3;
            for (var i = 0; i < 10; i++) {
                if (guessArr[index][i] > 1) {
                    tips = pg_config.tip.tip6
                }
            }
            $(".lookAwardbox p").text(tips).show();

            break;
    }
});

//点击获取竞猜历史
$(".getActBtn").on("click", function () {
    if (!guessGetHistory()) {
        showLogin();
    } else {
        $(".lookAward-ul ul li").eq(0).trigger("click");
        $(".black-bg").show();
        $(".show-award-box").show();
    }
});

$(".menu-bar ul li").on("click", function () {
    if ($(this).hasClass('step')) {
        tip('กิจกรรมยังไม่เริ่มขึ้น');
    }
    else {
        pg_config.data.count = 0;
        if (!$(this).hasClass("active")) {
            $(".menu-bar ul li").removeClass("active");
            $(this).addClass("active");
        }
        //我1分系统2分
        //0: 我没选系统没选 actItem-black
        //1: 我选了系统没选 actItem-out
        //2: 我没选系统选了
        //3: 我选了系统选了 actItem-win
        var index = $(this).index();//第几期
        //todo 更换状态
        var all = 0;
        var systemFlag = false; //系统是否出结果了
        var userFlag = false; //我是否选了
        for (var i = 0; i < 10; i++) {
            switch (guessArr[index][i]) {
                case 1:
                    $(".act-box ul li").eq(i).addClass("active").removeClass("out win");
                    break;
                case 2:
                    $(".act-box ul li").eq(i).addClass("out").removeClass("active win");
                    break;
                case 3:
                    $(".act-box ul li").eq(i).addClass("win").removeClass("out active");
                    break;
                default:
                    $(".act-box ul li").eq(i).removeClass("active out win");
                    break;
            }
            if (guessArr[index][i] > 1) {
                systemFlag = true;
            }
            if (guessArr[index][i] == 1 || guessArr[index][i] == 3) {
                userFlag = true;
            }

            all += guessArr[index][i];
        }

        var haveFlag = false;
        for (var x = 0; x < pg_config.data.guessHis.length; x++) {
            if (pg_config.data.guessHis[x].rewardId == pg_config.data.giftId[index]) {
                haveFlag = true;
                break;
            }
        }
        if (haveFlag) {
            $(".submitBtn").removeClass("guessAward_btn haveAward_btn noAward_btn").addClass("haveAward_btn");
        } else {
            if (userFlag && !systemFlag) {
                $(".submitBtn").removeClass("guessAward_btn haveAward_btn noAward_btn").addClass("wait_btn");
            }
            if (userFlag && systemFlag) {
                $(".submitBtn").removeClass("haveAward_btn noAward_btn wait_btn").addClass("guessAward_btn");
            }
            if (!userFlag) {
                $(".submitBtn").removeClass("guessAward_btn haveAward_btn noAward_btn wait_btn");
            }
        }
    }
});
$(".act-box ul li").on("click", function () {
    if (!$('.menu-bar li.active').hasClass("disClick")) {
        if (pg_config.data.count < 5 && !$(this).hasClass("active")) {
            pg_config.data.count++;
            $(this).addClass("active");
        } else if ($(this).hasClass("active")) {
            $(this).removeClass("active");
            pg_config.data.count--;
        }
    }
});
$(".click-desc").on("click", function () {
    $(".black-bg").show();
    $(".show-desc-box").show();
});
$(".menu ul li").click(function () {
    var index = this.title;
    var id = '#' + 'index_' + index;
    $("html,body").animate({scrollTop: $(id).offset().top - 100}, 600);
});
$(".loginBtn").on("click", function () {
    showLogin();
});

$(".closeBtn").on("click", function () {
    $(".black-bg").hide();
    $(".box").hide();
});

$('.user-init').on('click', function () {
    localStorage.clear();
    $('.qf').text("");
    $('.js').text("");
    $('.userMessage').hide();
    $(".loginBtn").show();
});
$(".changeQf").click(function () {
    showChannel();
    loadGameZones();
});
$(".closeBtn2").on("click", function () {
    saveInfo();
});

$(".channel-login").on("click", function () {
    var index = $(".server").val();
    findZone(index);
});

$('.btn-login').on('click', function () {
    var username = $(".username").val();
    var password = md5($(".password").val());
    var url = pg_config.api.server + pg_config.api.login;
    if (username == "" || password == "") {
        $(".login-tip").show();
        $(".login-tip").text("บัญชีหรือรหัสผ่านไม่ถูกต้อง");
        return;
    }
    $.ajax({
        type: "GET",
        url: url,
        data: {
            userName: username,
            password: password,
            version: 'v3'
        },
        beforeSend: function () {
            $(".loadingBtn").show();
        },
        success: function (result) {
            $(".loadingBtn").hide();
            handleLogin(result);
        },
        error: function (error) {
            console.log(error);
        }
    });
});
$('.fbBtn').on('click', function () {
    sessionStorage.setItem('facebook', 1);
    var random = Math.random() * 1000;
    var loginURL = "https://www.facebook.com/v2.6/dialog/oauth?client_id=" + pg_config.data.fbId
        + "&redirect_uri=" + encodeURIComponent(pg_config.api.fb_redirect_uri) + "&r=" + random;
    window.location.href = loginURL;
});


//日登陆 查奖励领取情况
function dayGetHistory() {
    var params = {
        actId: pg_config.data.actId1,
        groupId: pg_config.data.groupId,
        token: localStorage.token
    };
    ajaxDataController(requestUrl.getHistroy, params, function (result) {
        if (result.code == 200) {
            resultFun(result, ".award-main ul li", 'div.getBtn', 'div.dayActive');
        }
        else {
            Raven.captureException(new Error('dayGetHistory other code'));
            console.log('dayGetHistory' + pg_config.status[result.code]);
        }
    })
};

//活跃人数 查当前领奖情况
function peopleGetHistory() {
    var params = {
        actId: pg_config.data.actId3,
        groupId: pg_config.data.groupId,
        token: localStorage.token
    };
    ajaxDataController(requestUrl.getHistroy, params, function (result) {
        if (result.code == 200) {
            resultFun(result, ".point-pic ul li", 'div.pointBtn', 'div.pointActive');
        }
        else {
            Raven.captureException(new Error('peopleGetHistory other code'));
            console.log('peopleGetHistory' + pg_config.status[result.code]);
        }
    })
};

//活跃人数 查当前到达人数
function peopleJoinActivity() {
    var params = {
        actId: pg_config.data.actId3,
        groupId: pg_config.data.groupId,
        token: localStorage.token
    };
    ajaxDataController(requestUrl.joinActivityUrl, params, function (result) {
        if (result.code == 200) {
            var peopleNum = result.state.sumCount;
            $(".title-03 p").text(peopleNum);
            var peopleli = $(".point-bar li");
            for (var i = 0; i < peopleli.length; i++) {
                var dataNum = peopleli.eq(i).attr('data-num');
                if (peopleNum >= dataNum) {
                    peopleli.eq(i).addClass('active');
                    $(".point-pic li").eq(i).find('div.pointBtn').css('background', "url('img/getBtn2.png') no-repeat center").on("click");
                }
                else {
                    $(".point-pic li").eq(i).find('div.pointBtn').off("click");
                }
            }
            var len = [0, 5000, 10000, 20000, 30000, 50000, 80000, 100000];
            var temp;
            for (var temp = 0; temp < len.length; temp++) {
                if (peopleNum > len[temp] && peopleNum <= len[temp + 1]) {
                    break;
                }
            }
            if (temp < len.length) {
                if (temp == 0) {
                    $(".point-white-bar").height(peopleNum / 5000 * 9 + '%');
                } else if (temp <= len.length - 1) {
                    $(".point-white-bar").height(9 + (peopleNum - len[temp]) / (len[temp + 1] - len[temp]) * 15 + (temp - 1) * 15 + '%');
                }
            }
        }
        else {
            Raven.captureException(new Error('peopleJoinActivity other code'));
            console.log('peopleJoinActivity' + pg_config.status[result.code]);
        }
    })
};

//充值金额 查询当前已奖励领取情况
function chargeGetHistory() {
    var params = {
        actId: pg_config.data.actId6,
        groupId: pg_config.data.groupId,
        token: localStorage.token
    };
    ajaxDataController(requestUrl.getHistroy, params, function (result) {
        if (result.code == 200) {
            resultFun(result, ".charge-box ul li", 'div.charge-btn', 'div.chargeActive');
        }
        else {
            Raven.captureException(new Error('peopleJoinActivity other code'));
            console.log('chargeGetHistory' + pg_config.status[result.code]);
        }
    })
};

//充值金额 查询当前充值金额情况
function chargeInfoActivity() {
    var params = {
        actId: pg_config.data.actId6,
        groupId: pg_config.data.groupId,
        token: localStorage.token,
        rewardId: '5a139331422ebf0850a5fc55'
    };
    ajaxDataController(requestUrl.infoActivity, params, function (result) {
        if (result.code == 200) {
            var PayCharge = result.state.PayCharge;
            $(".title-06 p").text(PayCharge);
            var chargeBox = $(".charge-box ul li");
            for (var i = 0; i < chargeBox.length; i++) {
                var dataNum = chargeBox.eq(i).attr('data-num');
                if (PayCharge >= dataNum) {
                    chargeBox.eq(i).find('div.charge-btn').css('background', "url('img/chargeBtn.png') no-repeat center").on("click");
                }
                else {
                    chargeBox.eq(i).find('div.charge-btn').off("click");
                }
            }
            var len = [0, 500, 1200, 2500, 3800, 5000, 9000, 20000];
            var temp;
            for (var temp = 0; temp < len.length; temp++) {
                if (PayCharge > len[temp] && PayCharge <= len[temp + 1]) {
                    break;
                }
            }
            if (temp < len.length) {
                if (temp == 0) {
                    $(".charge-load").width(PayCharge / 500 * 10 + '%');
                } else if (temp <= len.length - 1) {
                    $(".charge-load").width(10 + (PayCharge - len[temp]) / (len[temp + 1] - len[temp]) * 16 + (temp - 1) * 16 + '%');
                }
            }
        }
        else {
            Raven.captureException(new Error('chargeInfoActivity other code'));
            console.log('chargeInfoActivity' + pg_config.status[result.code]);
        }

    })
};

//转盘 查转盘剩余抽奖次数
function countInfoActivity() {
    var params = {
        actId: pg_config.data.actId4,
        groupId: pg_config.data.groupId,
        token: localStorage.token,
        rewardId: '5a139939422ebf0850a5fc97'
    };
    ajaxDataController(requestUrl.infoActivity, params, function (result) {
        if (result.code == 200) {
            var sumCount = result.state.consumeResource.sumCount;
            var usedCount = result.state.consumeResource.usedCount;
            localStorage.setItem("canLotteryCount", sumCount - usedCount);
            var canLotteryCount = localStorage.getItem("canLotteryCount");
            $(".count-desc span").text(canLotteryCount);
        }
        else {
            Raven.captureException(new Error('countInfoActivity other code'));
            console.log('countInfoActivity' + pg_config.status[result.code]);
        }
    })
}

//查抽奖 领取次数
function getlotteryActivity() {
    var params = {
        actId: pg_config.data.actId5,
        groupId: pg_config.data.groupId,
        token: localStorage.token,
        rewardId: '5a139829422ebf0850a5fc85'
    };
    ajaxDataController(requestUrl.joinActivityUrl, params, function (result) {
        countInfoActivity();
    })
}

//获取消费金额
function getlotteryMoney() {
    var params = {
        actId: pg_config.data.actId5,
        groupId: pg_config.data.groupId,
        token: localStorage.token,
        rewardId: '5a139829422ebf0850a5fc85'
    };
    ajaxDataController(requestUrl.infoActivity, params, function (result) {
        if (result.code == 200) {
            $(".count-desc-2 span").text(result.state.comsumeCount);
        }
        else {
            console.log('getLotteryMoney' + pg_config.status[result.code]);
        }
    })
}

//查竞猜期数
function guessInfoActivity() {
    //我1分系统2分
    //0: 我没选系统没选
    //1: 我选了系统没选
    //2: 我没选系统选了
    //3: 我选了系统选了
    for (var i = 0; i < 3; i++) {
        guessArr[i] = new Array();
        for (var k = 0; k < 10; k++) {
            guessArr[i][k] = 0;
        }
    }
    var params = {
        actId: pg_config.data.actId2,
        groupId: pg_config.data.groupId,
        token: localStorage.token,
        rewardId: '5a0a94804fef391278268e5b'
    };
    ajaxDataController(requestUrl.infoActivity, params, function (result) {
        if (result.code == 200) {
            for (var z = 0; z < 3; z++) {
                if (result.state.SystemTicket[z]) {
                    for (var x = 0; x < 5; x++) {
                        var cur = result.state.SystemTicket[z][x];
                        guessArr[z][cur] += 2;
                    }
                }
                if (result.state.UserTicket[z]) {
                    $(".menu-bar ul li").eq(z).addClass("disClick");
                    for (var y = 0; y < 5; y++) {
                        var cur = result.state.UserTicket[z][y];
                        guessArr[z][cur] += 1;
                    }
                }
            }
            getJsonLength(result.state.UserTicket);
            var canGuessCount = localStorage.getItem("canGuessCount");
            $(".act-desc span").text(canGuessCount);
            $(".menu-bar ul li").eq(0).removeClass("step").trigger("click");
            if (result.state.SystemTicket[0]) {
                $(".menu-bar ul li").eq(1).removeClass("step").trigger("click");
            }
            if (result.state.SystemTicket[1]) {
                $(".menu-bar ul li").eq(2).removeClass("step").trigger("click");
            }
        }
        else {
            Raven.captureException(new Error('guessInfoActivity other code'));
            console.log('guessInfoActivity' + pg_config.status[result.code]);
        }
    })
};

//查竞猜历史
function guessGetHistory() {
    if (isLogin() && isChoose()) {
        $.ajax({
            type: "GET",
            url: requestUrl.getHistroy,
            async: false,
            data: {
                actId: pg_config.data.actId2,
                groupId: pg_config.data.groupId,
                token: localStorage.token
            },
            success: function (result) {
                pg_config.data.guessHis = result.state;
            },
            error: function (err) {
                console.log(err);
            }
        })
        pg_config.data.shutNum = new Array();
        for (var x = 0; x < 3; x++) {
            var shutNum = 0;
            for (var y = 0; y < 10; y++) {
                if (guessArr[x][y] > 2) {
                    shutNum += 1;
                }
            }
            pg_config.data.shutNum[x] = shutNum;
        }
        return true;
    }
    return false;
}

function resultFun(result, a, b, c) {
    for (var i = 0; i < $(a).length; i++) {
        for (var j = 0; j < result.state.length; j++) {
            var rewardId = result.state[j].rewardId;
            var dataRewardId = $(a).eq(i).find(b).attr('data-rewardId');
            if (rewardId == dataRewardId) {
                $(a).eq(i).find(c).show();
            }
        }
    }
}

function showLotteryAward(tip, icon, rewardName) {
    $(".black-bg").show();
    $(".show-lottery-box").show();
    $(".lottery-tip-1").text(tip);
    $(".lottery-tip-2").text(rewardName);
    $(".lottery-img img").attr("src", icon);
}
//提示
function tip(html) {
    $(".black-bg").show();
    $(".tip-box").show();
    $(".tishi").text(html);
}

//查json对象长度
function getJsonLength(jsonData) {
    var jsonLength = 0;
    if (jsonData) {
        for (var item in jsonData) {
            jsonLength++;
        }
    }
    localStorage.setItem("canGuessCount", jsonLength);
    return jsonLength;
}

//初始化
function initInfoActivity() {
    dayGetHistory();
    peopleGetHistory();
    peopleJoinActivity();
    chargeGetHistory();
    chargeInfoActivity();
    guessInfoActivity();
    getlotteryActivity();
    getlotteryMoney();
    guessGetHistory();
}


$(function () {
    Raven.context(function() {
        $('.menu-wraper').navbarscroll();
        if (isLogin()) {
            if (isChoose()) {
                showMessage();
                initInfoActivity();
            } else {
                $(".black-bg").show();
                $(".choose-form").show();
            }
        } else {
            checkFBLogin();
        }
    });

});