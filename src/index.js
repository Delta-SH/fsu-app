// 全局变量
//bui.isWebapp = false; 
window.router = bui.router();
window.storage = bui.storage();
window.$level = {
    L0: 0,
    L1: 1,
    L2: 2,
    L3: 3,
    L4: 4
};
window.$state = {
    S0: 0,
    S1: 1,
    S2: 2,
    S3: 3,
    S4: 4,
    S5: 5,
    S6: 6,
    S7: 7
};
window.$node = {
    DO: {
        id: 2,
        name: "遥控"
    },
    AO: {
        id: 3,
        name: "遥调"
    },
    AI: {
        id: 1,
        name: "遥测"
    },
    DI: {
        id: 0,
        name: "遥信"
    }
};
window.$requestURI = "http://127.0.0.1/api/bi/";
window.$requestUid = "ius";
window.$rememberKey = "pylon.app.login.remember";
window.$ticketKey = "pylon.app.auth.ticket";
window.$deviceKey = "pylon.app.setting.device";
window.$alarmKey = "pylon.app.setting.alarm";
window.$retryKey = "pylon.app.setting.retry";
window.$maxretry = 3;

bui.ready(function () {
    router.init({
        id: "#bui-router",
        firstAnimate: true,
        progress: true,
        reloadCache: false
    });

    router.on("loadfail", function () {
        bui.load({
            url: "404.html"
        })
    });

    bui.btn({
        id: "#bui-router",
        handle: ".bui-btn,a"
    }).load();

    $("#bui-router").on("click", ".btn-back", function (e) {
        bui.back({
            beforeBack: function (e) {
                if (isNull(e.target) === true)
                    return false;

                dispose(e.target);
                return true;
            }
        });
    });

    setRequest();

    if (window.plus) {
        plusReady();
    } else {
        document.addEventListener("plusready", plusReady, false);
    }

    function plusReady() {
        plus.key.addEventListener("backbutton", function () {
            if (plus.os.name === "Android") {
                bui.back({
                    beforeBack: function (e) {
                        if (isNull(e.target) === true)
                            return false;

                        dispose(e.target);
                        if (e.target.pid === "pages/login/login") {
                            plus.runtime.quit();
                            return false;
                        }

                        return true;
                    }
                });
            } else {
                plus.nativeUI.toast("请按Home键切换应用");
            }
        });
    }
})

// BUI函数
function setRequest(remeber) {
    if (isNull(remeber) === true) {
        remeber = storage.get($rememberKey, 0);
    }

    if (isNull(remeber) === false) {
        $requestURI = String.format("http://{0}/api/bi/", remeber.ip);
        $requestUid = remeber.user;
    }
}

function getTicket() {
    var ticket = storage.get($ticketKey, 0);
    if (isNull(ticket) === true)
        return null;

    return ticket;
}

function initRetry(){
    setRetry(1);
}

function maxRetry(){
    var count = getRetry();
    if(count >= $maxretry){
        return true;
    } else {
        count++;
        setRetry(count);
        return false;
    }
}

function getRetry() {
    var count = storage.get($retryKey, 0);
    if (isNull(count) === true)
        return 1;

    return count;
}

function setRetry(count) {
    storage.set($retryKey, count);
}

function getDevices() {
    var devices = storage.get($deviceKey, 0);
    if (isNull(devices) === true)
        return null;

    return devices;
}

function setDevices(data) {
    if (isNull(data) === true)
        data = [];

    storage.set($deviceKey, data);
}

function getAlarms() {
    var alarms = storage.get($alarmKey, 0);
    if (isNull(alarms) === true)
        return null;

    return alarms;
}

function setAlarms(data) {
    if (isNull(data) === true)
        data = [];

    storage.set($alarmKey, data);
}

function success(message, timeout) {
    bui.hint({
        content: String.format("<i class='icon-success'></i>{0}", message),
        timeout: timeout || 2000,
        skin: "success"
    })
}

function warning(message, timeout) {
    bui.hint({
        content: String.format("<i class='icon-info'></i>{0}", message),
        timeout: timeout || 2000,
        skin: "danger"
    })
}

function successdialog(message, detail) {
    bui.confirm({
        "title": "",
        "height": 400,
        "autoClose": true,
        "content": `<div class="bui-box-center"><i class="icon-successfill success"></i><h3>${message}</h3><p>${detail}</p></div>`,
        "buttons": [{
            name: "我知道了",
            className: "primary-reverse"
        }]
    });
}

function warningdialog(message, detail) {
    bui.confirm({
        "title": "",
        "height": 400,
        "autoClose": true,
        "content": `<div class="bui-box-center"><i class="icon-errorfill danger"></i><h3>${message}</h3><p>${detail}</p></div>`,
        "buttons": [{
            name: "我知道了",
            className: "primary-reverse"
        }]
    });
}

function dispose(target) {
    loader.require(target.pid, function (mod) {
        mod.dispose();
    });
}

// 自定义函数
function getAlarmCls1(level) {
    if (level === $level.L1)
        return 'level1';
    else if (level === $level.L2)
        return 'level2';
    else if (level === $level.L3)
        return 'level3';
    else if (level === $level.L4)
        return 'level4';
    else
        return 'level0';
}

function getAlarmCls2(level) {
    if (level === $level.L1)
        return 'level1-bg';
    else if (level === $level.L2)
        return 'level2-bg';
    else if (level === $level.L3)
        return 'level3-bg';
    else if (level === $level.L4)
        return 'level4-bg';
    else
        return 'level0-bg';
}

function getAlarmName(level) {
    if (level === $level.L1)
        return '一级告警';
    else if (level === $level.L2)
        return '二级告警';
    else if (level === $level.L3)
        return '三级告警';
    else if (level === $level.L4)
        return '四级告警';
    else
        return '正常数据';
}

function getStateCls1(state) {
    if (state === $state.S1) {
        return 'state1';
    } else if (state === $state.S2) {
        return 'state2';
    } else if (state === $state.S3) {
        return 'state3';
    } else if (state === $state.S4) {
        return 'state4';
    } else if (state === $state.S5) {
        return 'state5';
    } else if (state === $state.S6) {
        return 'state6';
    } else if (state === $state.S7) {
        return 'state7';
    } else {
        return 'state0';
    }
}

function getStateCls2(state) {
    if (state === $state.S1) {
        return 'state1-bg';
    } else if (state === $state.S2) {
        return 'state2-bg';
    } else if (state === $state.S3) {
        return 'state3-bg';
    } else if (state === $state.S4) {
        return 'state4-bg';
    } else if (state === $state.S5) {
        return 'state5-bg';
    } else if (state === $state.S6) {
        return 'state6-bg';
    } else if (state === $state.S7) {
        return 'state7-bg';
    } else {
        return 'state0-bg';
    }
}

function getStateName(state) {
    if (state === $state.S1) {
        return '一级告警';
    } else if (state === $state.S2) {
        return '二级告警';
    } else if (state === $state.S3) {
        return '三级告警';
    } else if (state === $state.S4) {
        return '四级告警';
    } else if (state === $state.S5) {
        return '操作事件';
    } else if (state === $state.S6) {
        return '无效数据';
    } else if (state === $state.S7) {
        return '通信中断';
    } else {
        return '正常数据';
    }
}

function getUnit(value, type, desc) {
    if (type == $node.DI.name || type == $node.DI.id ||
        type == $node.DO.name || type == $node.DO.id) {
        var unit = "";
        var keys = desc.split(";");
        $.each(keys, function (index, item) {
            var values = item.split("&");
            if (values.length !== 2) return true;

            if (values[0].trim() == value) {
                unit = values[1].trim();
                return false;
            }
        });
        return unit;
    }

    return String.format("{0} {1}", value, desc);
}

function getUnits(desc) {
    var data = [];
    var pairs = desc.split(';');
    $.each(pairs, function (index, item) {
        var _values = item.split('&');
        if (_values.length !== 2) return true;

        data.push({
            id: _values[0].trim(),
            name: _values[1].trim()
        });
    });

    return data;
}

function onInput(option) {
    var opt = option || {};
    opt.id = option.id || "";
    opt.target = option.target || "input";
    opt.event = option.event || "keyup";
    opt.icon = option.icon || "icon-remove";
    opt.onInput = option.onInput || function () {};
    opt.callback = option.callback || function () {};
    if (opt.id == "" || opt.id === null) {
        return;
    }

    var $id = $(opt.id),
        $target = $id.find(opt.target),
        iconClass = '.' + opt.icon;

    $target.on(opt.event, bui.unit.debounce(function () {
        var val = $(this).val(),
            $parent = $(this).parent(),
            $btnRemove = $parent.find(iconClass);
        if (val.length > 0) {
            if ($btnRemove && $btnRemove.length) {
                $btnRemove.css("display", "block");
            } else {
                $parent.append('<i class="' + opt.icon + '"></i>');
                $btnRemove = $target.find(iconClass);
            }
        } else {
            $btnRemove && $btnRemove.css("display", "none");
        }
        opt.onInput && opt.onInput.call(this);
    }, 100))
    $target.on("focus", function () {
        $id.find(iconClass).css("display", "none")
        $(this).next().css("display", "block")
    })
    $id.on("click", iconClass, function () {
        opt.callback && opt.callback.call(this);
    })
}

function isNull(value) {
    return typeof value == "undefined" || value == null;
}

function isEmpty(value, whitespace) {
    return (whitespace || false) === true ? value.trim() === "" : value === "";
}

function isNullOrEmpty(value, whitespace) {
    if (isNull(value) === true) return true;
    return isEmpty(value, whitespace);
}

function getTimespan(start, end) {
    var from = moment(start);
    var to = isNull(end) ? moment() : moment(end);
    var diff = to.diff(from);
    if (diff < 0) diff = 0;
    var duration = moment.duration(diff);
    return parseInt(duration.asHours(), 10) + ':' + moment([2000, 1, 1]).add(duration).format("mm:ss");
}

// 扩展方法
String.format = function () {
    if (arguments.length == 0)
        return null;

    var str = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        str = str.replace(re, arguments[i]);
    }

    return str;
}
String.prototype.startWith = function (value, ignoreCase) {
    if (value == null || value == "" || this.length == 0 || value.length > this.length) {
        return false;
    }

    ignoreCase = ignoreCase || false;
    if (ignoreCase === true) {
        return this.substr(0, value.length).toLowerCase() === value.toLowerCase();
    }

    return this.substr(0, value.length) === value;
}
String.prototype.endWith = function (value, ignoreCase) {
    if (value == null || value == "" || this.length == 0 || value.length > this.length) {
        return false;
    }

    ignoreCase = ignoreCase || false;
    if (ignoreCase === true) {
        return this.substr(this.length - value.length).toLowerCase() === value.toLowerCase();
    }

    return this.substr(this.length - value.length) === value;
}