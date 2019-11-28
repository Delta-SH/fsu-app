loader.define(function (require, exports, module) {
    var _maintab = null,
        _ticket = null,
        _loading = null,
        _steps = 2,
        _finish = [],
        _timer = null,
        _realtimer = null,
        _timeout = 30,
        _realtimeout = 15,
        _params = null,
        _maxretry = 3,
        _devretry = 1,
        _almretry = 1;

    function _init() {
        if (isNull(_loading) === true) {
            _loading = bui.loading({
                appendTo: ".main-page",
                text: "正在加载"
            });
        }

        if (isNull(_maintab) === true) {
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
                            if (isNull(_params) === false) {
                                var params = _params;
                                if (_params.once === true) {
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

        if (isNull(_timer) === true) {
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

    function _dispose() {
        if (isNull(_realtimer) === false) {
            clearTimeout(_realtimer);
            _realtimer = null;
        }
    }

    function _devices() {
        try {
            $.ajax({
                type: 'POST',
                url: String.format("{0}getdevices?{1}", $requestURI, _ticket.token),
                data: null,
                dataType: "text",
                timeout: 10000,
                beforeSend: function (xhr, settings) {
                    storage.remove($deviceKey);
                },
                success: function (data, status) {
                    try {
                        if (data.startWith('Error') === true)
                            throw new Error(data);

                        _devretry = 1;
                        var result = [];
                        if (isNullOrEmpty(data) === false) {
                            result = JSON.parse(data);
                        }

                        setDevices(result);
                        _finish.push("load devices success.");
                    } catch (err) {
                        _loaddeverr(err.message);
                    }
                },
                error: function (xhr, errorType, error) {
                    _loaddeverr("设备加载失败");
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    function _loaddeverr(err) {
        if (_devretry >= _maxretry) {
            _devretry = 1;
            warning(err);
            _finish.push(err);
        } else {
            _devretry++;
            setTimeout(function () {
                _devices();
            }, 3000);
        }
    }

    function _alarms() {
        try {
            $.ajax({
                type: 'POST',
                url: String.format("{0}getactalarm?{1}", $requestURI, _ticket.token),
                data: null,
                dataType: "text",
                timeout: 10000,
                beforeSend: function (xhr, settings) {
                    storage.remove($alarmKey);
                },
                success: function (data, status) {
                    try {
                        if (data.startWith('Error') === true)
                            throw new Error(data);

                        _almretry = 1;
                        var result = [];
                        if (isNullOrEmpty(data) === false) {
                            result = JSON.parse(data);
                        }

                        setAlarms(result);
                        _finish.push("init alarms success.");
                        _realtimer = setTimeout(function () {
                            _realalarm();
                        }, _realtimeout * 1000);
                    } catch (err) {
                        _loadalmerr(err.message);
                    }
                },
                error: function (xhr, errorType, error) {
                    _loadalmerr("告警加载失败");
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    function _loadalmerr(err) {
        if (_almretry >= _maxretry) {
            _almretry = 1;
            warning(err);
            _finish.push(err);
            _logout();
        } else {
            _almretry++;
            setTimeout(function () {
                _alarms();
            }, 5000);
        }
    }

    function _realalarm() {
        try {
            $.ajax({
                type: 'POST',
                url: String.format("{0}getrealalarm?{1}", $requestURI, _ticket.token),
                data: null,
                dataType: "text",
                timeout: 15000,
                success: function (data, status) {
                    var ok = data.startWith('Error') === false;
                    if (ok === true) {
                        initRetry();
                        if (isNullOrEmpty(data) === false) {
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
                        }
                    }

                    if (ok === true || maxRetry() === false) {
                        _realtimer = setTimeout(function () {
                            _realalarm();
                        }, _realtimeout * 1000);
                    } else {
                        warning("获取实时告警失败");
                        _logout();
                    }
                },
                error: function (xhr, errorType, error) {
                    if (maxRetry() === false) {
                        _realtimer = setTimeout(function () {
                            _realalarm();
                        }, _realtimeout * 1000);
                    } else {
                        warning("获取实时告警失败");
                        _logout();
                    }
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

    function _setparams(params) {
        if (isNull(params) === false)
            _params = params;
        else
            _params = null;
    }

    function _logout() {
        _dispose();
        router.load({
            url: "pages/login/login",
            effect: "zoom"
        });
    }

    function _update(total, increment) {
        if ($.isArray(increment) !== true)
            return;

        if (increment.length === 0)
            return;

        _badges(false);

        if (isNull(_maintab) === false) {
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