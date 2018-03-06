/**
 * Created by jo.chan on 2017/11/21.
 */


var requestUrl = {
    //参与活动
    joinActivityUrl: pg_config.api.server + '/activity/join',
    //获取活动信息
    infoActivity: pg_config.api.server + '/activity/info',
    //历史奖励
    getHistroy: pg_config.api.server + '/activity/cdKeys'
};

//转盘图标顺序
var rewards = {
    id: {
        "5a1398de422ebf0850a5fc8d": 0,
        "5a1398d1422ebf0850a5fc8b": 1,
        "5a1398de422ebf0850a5fc88": 2,
        "5a13991e422ebf0850a5fc95": 3,
        "5a1398fc422ebf0850a5fc91": 4,
        "5a1398ec422ebf0850a5fc8f": 5,
        "5a13990e422ebf0850a5fc93": 6,
        "5a139939422ebf0850a5fc97": 7
    },
    icon: {
        "5a1398de422ebf0850a5fc8d": 'img/dsmz.png',
        "5a1398d1422ebf0850a5fc8b": 'img/ssmz.png',
        "5a1398de422ebf0850a5fc88": 'img/ssp1.png',
        "5a13991e422ebf0850a5fc95": 'img/thx2.png',
        "5a1398fc422ebf0850a5fc91": 'img/ss.png',
        "5a1398ec422ebf0850a5fc8f": 'img/syqladn.png',
        "5a13990e422ebf0850a5fc93": 'img/thx1.png',
        "5a139939422ebf0850a5fc97": 'img/gjzb.png'
    }

};
/**
 *
 * @param url
 * @param params
 * @param successCallback
 * @param doComplete
 */
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
        error: function (err) {
            console.log(JSON.stringify(err));
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

// todo
//点击提交竞猜
$(".submitBtn").on("click", function () {
    if (isLogin() && isChoose()) {
        var dataActId = $(this).attr('data-rewardId');
        var params = {
            groupId: pg_config.data.groupId,
            actId: pg_config.data.actId2,
            rewardId: dataActId,
            token: localStorage.token
        };
        ajaxDataController(requestUrl.joinActivityUrl, params, function (result) {
            //todo  礼包界面
            if (result.state == index) {
                //皇冠 选中
            } else if (result.state > index) {
                //皇冠 +灰色 系统选中我未选中
            }
            else if (result.state < index) {
                //我选中系统未选中
            }
            else if (result.state == 0) {
                //灰色
            }
        });
    }
    else {
        showLogin();
    }
});

//点击活跃人数领奖按钮
$(".pointBtn").on("click", function () {
    if (isLogin() && isChoose()) {
        var dataActId = $(this).attr('data-rewardId');
        var params = {
            groupId: pg_config.data.groupId,
            actId: pg_config.data.actId3,
            rewardId: dataActId,
            token: localStorage.token
        };
        ajaxDataController(requestUrl.joinActivityUrl, params, function (result) {
            if (result.code == 200) {
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
                        var icon = rewards.id[result.state.rewardBase.rewardId];
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

//充值奖励
$(".charge-btn").on("click", function () {
    if (isLogin() && isChoose()) {
        var dataActId = $(this).attr('data-rewardId');
        var params = {
            groupId: pg_config.data.groupId,
            actId: pg_config.data.actId6,
            rewardId: dataActId,
            token: localStorage.token
        };
        ajaxDataController(requestUrl.joinActivityUrl, params, function (result) {
            if (result.code == 200) {
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

//初始化
function initInfoActivity() {
    dayGetHistroy();
    peopleGetHistroy();
    peopleInfoActivity();
    chargeGetHistroy();
    chargeInfoActivity();
    countInfoActivity();
}

//日登陆 查奖励领取情况
function dayGetHistroy() {
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
        }
    })
};

//活跃人数 查当前领奖情况
function peopleGetHistroy() {
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
        }
    })
};

//活跃人数 查当前到达人数
function peopleInfoActivity() {
    var params = {
        actId: pg_config.data.actId3,
        groupId: pg_config.data.groupId,
        token: localStorage.token
    };
    ajaxDataController(requestUrl.infoActivity, params, function (result) {
        // 已领取
        if (result.code == 200) {
            //todo 根据活跃人数弄用户进度条状态以及可否领取
            var peopleNum = result.state.ActJoin;
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
        }
    })
};

//充值金额 查询当前已奖励领取情况
function chargeGetHistroy() {
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
        // 已领取
        if (result.code == 200) {
            //todo 根据充值弄用户进度条状态
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
        }
        else {
        }
    })
};

//转盘 查转盘剩余抽奖次数
function countInfoActivity() {
    var params = {
        actId: pg_config.data.actId5,
        groupId: pg_config.data.groupId,
        token: localStorage.token,
        rewardId: '5a139829422ebf0850a5fc85'
    };
    ajaxDataController(requestUrl.infoActivity, params, function (result) {
        if (result.code == 200) {
            var sumCount = result.state.comsumeCount.sumCount;
            var usedCount = result.state.comsumeCount.usedCount;
            localStorage.setItem("canLotteryCount", sumCount - usedCount);
            var canLotteryCount = localStorage.getItem("canLotteryCount");
            $(".count-desc span").text(canLotteryCount);
        }
        else {
        }
    })
}

//提示
var tip = function (html) {
    $(".black-bg").show();
    $(".tip-box").show();
    $(".tishi").text(html);
};

//点击获取历史获奖记录
$(".getHistroy-btn").on("click", function () {
    $(".black-bg").show();
    var params = {
        actId: pg_config.data.actId4,
        groupId: pg_config.data.groupId,
        token: localStorage.token
    };
    ajaxDataController(requestUrl.infoActivity, params, function (result) {
        if (result.code == 200) {
            var dom = '';
            var dataList = [];
            for (var i = 0; i < result.state.length; i++) {
                dataList = result.state[i];
                var icon = rewards.icon[dataList.rewardId];
                dom += '<li><p class="date">' + dataList.getDate + '</p>' + '<p class="name">' + dataList.rewardName + '</p>' + '<p class="icon">' + icon + '</p></li>';
            }

        }
        else {
        }
    })
});


function resultFun(result, a, b, c) {
    for (var i = 0; i < result.state.length; i++) {
        var rewardId = result.state[i].rewardId;
        var dataRewardId = $(a).eq(i).find(b).attr('data-rewardId');
        if (rewardId == dataRewardId) {
            $(a).eq(i).find(c).show();
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

$(".lookAward-ul ul li").on("click", function () {
    var i = $(this).index();
    $(".lookAwardbox").hide();
    $(".lookAwardbox").eq(i).show();
});


//todo 1、进度条 活跃人数及充值的  2、竞猜