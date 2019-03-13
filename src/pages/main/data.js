loader.define(function (require, exports, module) {
    var pageview = {name: '实时数据'}, _pullRefresh, _searchBar, _ticket;

    pageview.init = function () {
        _ticket = getTicket();
        if (!_pullRefresh) {
            _pullRefresh = bui.pullrefresh({
                id: "#pylon-app-data-device-scroll",
                autoLoad: false,
                onRefresh: _request
            });
        }

        if (!_searchBar) {
            _searchBar = bui.searchbar({
                id: "#pylon-app-data-search",
                onInput: function (e, keyword) {},
                onRemove: function (e, keyword) {
                    _searchBar.keyword = null;
                    _search(_searchBar.keyword);
                },
                callback: function (e, keyword) {
                    _searchBar.keyword = keyword.trim().toLowerCase();
                    _search(_searchBar.keyword);
                }
            });
        }
    }

    pageview.load = function (devices) {
        _empty();

        if (isNull(devices) === true)
            devices = getDevices();

        if (isNull(devices) === true)
            return;

        if (devices.length === 0)
            return;

        if (isNullOrEmpty(_searchBar.keyword) === false) {
            var keyword = _searchBar.keyword;
            devices = _.filter(devices, function (item) {
                return item.Name.toLowerCase().indexOf(keyword) !== -1;
            });
            if (devices.length === 0)
                return;
        }

        var html = "",
            alarmGroup = null,
            alarms = getAlarms();
        if (isNull(alarms) === false && alarms.length > 0) {
            alarmGroup = _.groupBy(alarms, function (item) {
                return item.DeviceID;
            });
        }

        $.each(devices, function (index, el) {
            el.Status = $level.L0;
            if (alarmGroup !== null && _.has(alarmGroup, el.ID)) {
                el.Status = _.min(_.map(alarmGroup[el.ID], function (item) {
                    return item.AlarmLevel
                }));
            }

            html += `<li id="pylon-app-device-${el.ID}" class="bui-btn bui-box" href="pages/main/device.html?id=${el.ID}">
                <div class="bui-icon ${getAlarmCls2(el.Status)}"><i class="appiconfont appicon-device"></i></div>
                <div class="span1">
                    <h3 class="item-title">${el.Name}</h3>
                    <p class="item-text">${el.Type}</p>
                </div>
                <i class="icon-listright"></i>
            </li>`
        });

        if (html !== "") {
            _more(html);
        }
    }

    pageview.dispose = function(){
    }

    pageview.refresh = function () {
        var devices = getDevices();
        if (isNull(devices) === true)
            return;

        var alarmGroup = null,
            alarms = getAlarms();
        if (isNull(alarms) === false && alarms.length > 0) {
            alarmGroup = _.groupBy(alarms, function (alarm) {
                return alarm.DeviceID;
            });
        }

        $.each(devices, function (index, device) {
            var status = $level.L0;
            if (alarmGroup !== null && _.has(alarmGroup, device.ID)) {
                status = _.min(_.map(alarmGroup[device.ID], function (item) {
                    return item.AlarmLevel;
                }));
            }

            var li = router.$(String.format("#pylon-app-device-{0}", device.ID));
            if (li.length === 0) return true;

            var icon = li.find(".bui-icon");
            if (icon.length > 0) {
                icon.attr("class", function (i, cls) {
                    return cls.replace(/level\d-bg+/g, "").trim();
                });
                icon.addClass(getAlarmCls2(status));
            }
        });
    }

    function _request() {
        try {
            $.ajax({
                type: 'POST',
                url: String.format("{0}getdevices?{1}", $requestURI, _ticket.token),
                data: null,
                dataType: "text",
                timeout: 10000,
                success: function (data, status) {
                    if (data.startWith('Error') === true) {
                        _pullRefresh.fail();
                        warning(data);
                        return;
                    }

                    var result = [];
                    if (isNullOrEmpty(data) === false) {
                        result = JSON.parse(data);
                    }

                    setDevices(result);
                    pageview.load(result);
                    _pullRefresh.reverse();
                },
                error: function (xhr, errorType, error) {
                    _pullRefresh.fail();
                    warning("设备加载失败,请重试。");
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    function _empty() {
        router.$("#pylon-app-data-device-list").html("");
        _footempty();
    }

    function _footempty() {
        router.$(".overlist .bui-scroll-foot").html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
    }

    function _more(content) {
        router.$("#pylon-app-data-device-list").html(content);
        _footmore();
    }

    function _footmore() {
        router.$(".overlist .bui-scroll-foot").html('<div class="nomore">没有更多内容</div>');
    }

    function _search(keyword) {
        var devices = getDevices();
        if (isNull(devices) === true)
            return;

        var emptyed = true;
        $.each(devices, function (index, node) {
            var li = router.$(String.format("#pylon-app-device-{0}", node.ID));
            if (li.length === 0) return true;
            if (isNullOrEmpty(keyword) === false) {
                var title = li.find("h3.item-title");
                if (title.length > 0) {
                    var text = title.html();
                    if (text.toLowerCase().indexOf(keyword) !== -1) {
                        li.slideDown(300);
                        emptyed = false;
                    } else {
                        li.slideUp(300);
                    }
                }
            } else {
                li.slideDown(300);
                emptyed = false;
            }
        });

        if (emptyed === true) {
            _footempty();
        } else {
            _footmore();
        }
    }

    pageview.init();
    pageview.load();

    return pageview;
});