loader.define(function (require, exports, module) {
    var _maintab, _ticket, _loading, _steps = 2, _finish = [], _timer, _timeout = 20, _realtimer, _realtimeout = 15000, _params;

    function _init() {
        if (!_loading) {
            _loading = bui.loading({
                appendTo: ".main-page",
                text: "正在加载"
            });
        }

        if (!_maintab) {
            _maintab = bui.tab({
                id: "#app-main-tab-container",
                menu: "#app-main-tab-nav",
                animate: false,
                swipe: false,
                autoload: true
            });

            _maintab.on("to", function (index) {
                switch (index) {
                    case 0:
                        loader.require(["pages/main/home"], function (mod) {
                            mod.load();
                        })
                        break;
                    case 1:
                        loader.require(["pages/main/data"], function (mod) {
                            mod.refresh();
                        })
                        break;
                    case 2:
                        _badges(true);
                        loader.require(["pages/main/alarm"], function (mod) {
                            if(isNull(_params) === false){
                                var params = _params;
                                if(_params.once === true){
                                    _params = null;
                                }
                                
                                mod.setparams(params);
                            }

                            mod.load();
                        })
                        break;
                    case 3:
                        loader.require(["pages/main/user"], function (mod) {
                            mod.load();
                        })
                        break;
                }
            });
        }

        if (!_timer) {
            _timer = bui.timer({
                onProcess: function (arg) {
                    if (arg.count === _timeout) {
                        _loading.show();
                    }

                    if (_finish.length >= _steps) {
                        _timer.pause();
                        _timer.stop();
                    }
                },
                onEnd: function (arg) {
                    _loading.hide();
                    loader.require(["pages/main/home"], function (mod) {
                        mod.load();
                    })
                },
                times: _timeout
            });
        }
    }

    function _load() {
        if (isNull(_realtimer) === false) {
            clearTimeout(_realtimer);
            _realtimer = null;
        }

        _ticket = getTicket();
        _badges(true);
        _maintab.to(0, "none");

        _finish = [];
        _devices();
        _alarms();
        _timer.restart();
    }

    function _dispose(){
    }

    function _devices() {
        try {
            $.ajax({
                type: 'POST',
                url: String.format("{0}getdevices?{1}", $requestURI, _ticket.token),
                data: null,
                dataType: "text",
                timeout: 20000,
                beforeSend: function (xhr, settings) {
                    storage.remove($deviceKey);
                },
                success: function (data, status) {
                    if (data.startWith('Error') === true) {
                        _finish.push("init devices error.");
                        warning(data);
                        return;
                    }

                    var result = [];
                    if (isNullOrEmpty(data) === false) {
                        result = JSON.parse(data);
                    }

                    setDevices(result);
                    _finish.push("init devices success.");
                },
                error: function (xhr, errorType, error) {
                    _finish.push("init devices failure.");
                    warning("设备加载失败,请重试。");
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    function _alarms() {
        try {
            $.ajax({
                type: 'POST',
                url: String.format("{0}getactalarm?{1}", $requestURI, _ticket.token),
                data: null,
                dataType: "text",
                timeout: 20000,
                beforeSend: function (xhr, settings) {
                    storage.remove($alarmKey);
                },
                success: function (data, status) {
                    if (data.startWith('Error') === true) {
                        _finish.push("init alarms error.");
                        warning(data);
                        _logout();
                        return;
                    }

                    var result = [];
                    if (isNullOrEmpty(data) === false) {
                        result = JSON.parse(data);
                    }

                    setAlarms(result);
                    _finish.push("init alarms success.");
                    _realtimer = setTimeout(_realalarm, _realtimeout);
                },
                error: function (xhr, errorType, error) {
                    _finish.push("init alarms failure.");
                    warning("告警加载失败,请重试。");
                    _logout();
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    function _realalarm() {
        try {
            $.ajax({
                type: 'POST',
                url: String.format("{0}getrealalarm?{1}", $requestURI, _ticket.token),
                data: null,
                dataType: "text",
                timeout: 30000,
                success: function (data, status) {
                    if (isNullOrEmpty(data) === false 
                    && data.startWith('Error') === false) {
                        var alarms = getAlarms();
                        if (isNull(alarms) === false) {
                            var increment = JSON.parse(data);
                            $.each(increment, function (index, item) {
                                if (isNullOrEmpty(item.EndTime) === true) {
                                    var current = _.find(alarms, function (value) {
                                        return item.DeviceID === value.DeviceID && item.SignalID === value.SignalID;
                                    });

                                    if (isNull(current) === true) {
                                        alarms.push(item);
                                    }
                                } else {
                                    var current = _.find(alarms, function (value) {
                                        return item.DeviceID === value.DeviceID && item.SignalID === value.SignalID;
                                    });

                                    if (isNull(current) === false) {
                                        alarms = _.without(alarms, current);
                                    }
                                }
                            });

                            setAlarms(alarms);
                            _update(alarms, increment);
                        }

                        _realtimer = setTimeout(_realalarm, _realtimeout);
                        return;
                    }

                    _logout();
                },
                error: function (xhr, errorType, error) {
                    _logout();
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    function _to(index, transition) {
        if (isNull(transition) === true) {
            _maintab.to(index);
        } else {
            _maintab.to(index, transition);
        }
    }

    function _setparams(params){
        if(isNull(params) === false)
            _params = params;
        else 
            _params = null;
    } 

    function _logout() {
        var module = router.currentModule();
        if (module.pid !== "pages/login/login") {
            router.load({
                url: "pages/login/login.html",
                param: {},
                effect: "zoom"
            });
        }
    }

    function _update(total, increment) {
        if ($.isArray(increment) !== true)
            return;

        if (increment.length === 0)
            return;

        _badges(false);

        var module = router.currentModule();
        if (module.pid === "main") {
            var index = _maintab.index();
            if (index === 0) {
                loader.require(["pages/main/home"], function (mod) {
                    mod.load(total);
                })
            } else if (index === 2) {
                loader.require(["pages/main/alarm"], function (mod) {
                    mod.load(total);
                })
            }
        }
    }

    function _badges(hidden) {
        if (hidden === true) {
            $("#pylon-app-main-alarm > span.bui-badges").remove();
        } else {
            $("#pylon-app-main-alarm").html('<span class="bui-badges"></span>');
        }
    }

    exports.name = "数据机房监控系统";
    exports.init = _init;
    exports.load = _load;
    exports.dispose = _dispose;
    exports.to = _to;
    exports.setparams = _setparams;
    
    _ticket = getTicket();
    if (isNull(_ticket) === true) {
        _logout();
        return;
    }

    _init();
    _load();
})