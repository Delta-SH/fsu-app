loader.define(function(require, exports, module) {
    var pageview = {name: '实时告警'}, _sidebar, _condition, _pullRefresh, _ticket, _params;
    
    pageview.init = function () {
        _ticket = getTicket();
        if(!_sidebar){
            _sidebar = bui.sidebar({
                id: "#app-main-tab-alarm",
                handle: ".alarm-page",
                width: 640
            });

            $("#pylon-app-alarm-menu").on("click",function () {
                _reset(true);
                _sidebar.open({target:"swipeleft"});
            });

            $("#pylon-app-alarm-reset").on("click",function () {
                _reset(false);
            });

            $("#pylon-app-alarm-ok").on("click",function () {
                _filter(function(condition){
                    pageview.load();
                });

                _sidebar.close();
            });
    
            _sidebar.lock();
        }

        if (!_pullRefresh) {
            _pullRefresh = bui.pullrefresh({
                id: "#pylon-app-alarm-scroll",
                autoLoad: false,
                onRefresh: _request
            });
        }

        var viewport = router.$("#app-main-tab-alarm"), parent = viewport.parent();
        viewport.height(parent.height());
    }

    pageview.load = function(total){
        _empty();

        var alarms = total || getAlarms();
        if (isNull(alarms) === true)
            return;

        if (alarms.length === 0)
            return;

        if(isNull(_params) === false){
            var params = _params;
            if(_params.once === true){
                _params = null;
            }
        
            _condition = {level:[params.data.level], device:null, signal:null};
            _reset(true);
        }

        if (isNull(_condition) === false) {
            if(isNull(_condition.level) === false && _condition.level.length > 0){
                alarms = _.filter(alarms, function(item){ return _.contains(_condition.level, item.AlarmLevel); });
            }

            if(isNullOrEmpty(_condition.device, true) === false){
                var device = _condition.device.toLowerCase();
                alarms = _.filter(alarms, function(item){ return item.DeviceName.toLowerCase().indexOf(device) !== -1; })
            }

            if(isNullOrEmpty(_condition.signal, true) === false){
                var signal = _condition.signal.toLowerCase();
                alarms = _.filter(alarms, function(item){ return item.SignalName.toLowerCase().indexOf(signal) !== -1; })
            }
        }

        alarms = _.sortBy(alarms, function(item) {
            return moment(item.StartTime).valueOf() * -1;
        });

        var html = "";
        $.each(alarms, function (index, el) {
            html += `<li id="pylon-app-alarm-${el.SerialNO}" class="bui-btn bui-box" href="pages/main/detailalarm.html?id=${el.SerialNO}">
                <div class="bui-icon ${getAlarmCls2(el.AlarmLevel)}"><i class="appiconfont appicon-level2"></i></div>
                <div class="span1">
                    <div class="bui-box item-title-box">
                        <div class="span1 item-title">${el.SignalName}</div>
                        <div class="item-text item-sub-title ${getAlarmCls1(el.AlarmLevel)}">${getAlarmName(el.AlarmLevel)}</div>
                    </div>
                    <div class="bui-box item-text-box">
                        <div class="span1 item-text">
                            <span class="item-value">${el.DeviceName}</span> 
                        </div>
                        <div class="item-text">
                            <span class="item-time">${el.StartTime}</span>
                        </div>
                    </div>
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

    pageview.setparams = function(params) {
        if(isNull(params) === false)
            _params = params;
        else 
            _params = null;
    }

    function _reset(force){
        var level1 = router.$("#pylon-app-alarm-level1"),
            level2 = router.$("#pylon-app-alarm-level2"),
            level3 = router.$("#pylon-app-alarm-level3"),
            level4 = router.$("#pylon-app-alarm-level4"),
            devinput = router.$("#pylon-app-alarm-device"),
            signalinput = router.$("#pylon-app-alarm-signal");

            level1.removeAttr("checked");
            level2.removeAttr("checked");
            level3.removeAttr("checked");
            level4.removeAttr("checked");
            devinput.val("");
            signalinput.val("");

        if(force !== true) return;

        if(isNull(_condition) === false){
            $.each(_condition.level,function(index,level){
                switch(level) {
                    case $level.L1:
                    level1.prop("checked", true);
                    break;
                    case $level.L2:
                    level2.prop("checked", true);
                    break;
                    case $level.L3:
                    level3.prop("checked", true);
                    break;
                    case $level.L4:
                    level4.prop("checked", true);
                    break;
                }
            });

            if(isNullOrEmpty(_condition.device, true) === false){
                devinput.val(_condition.device);
            }

            if(isNullOrEmpty(_condition.signal, true) === false){
                signalinput.val(_condition.signal);
            }
        }
    }

    function _filter(success){
        var level1 = router.$("#pylon-app-alarm-level1"),
            level2 = router.$("#pylon-app-alarm-level2"),
            level3 = router.$("#pylon-app-alarm-level3"),
            level4 = router.$("#pylon-app-alarm-level4"),
            devinput = router.$("#pylon-app-alarm-device"),
            signalinput = router.$("#pylon-app-alarm-signal"),
            condition = {level:[],device:null, signal:null};
        
        if(level1.is(":checked") === true){
            condition.level.push($level.L1);
        }
        if(level2.is(":checked") === true){
            condition.level.push($level.L2);
        }
        if(level3.is(":checked") === true){
            condition.level.push($level.L3);
        }
        if(level4.is(":checked") === true){
            condition.level.push($level.L4);
        }

        condition.device = devinput.val().trim();
        condition.signal = signalinput.val().trim();
        _condition = condition;
        success(condition);
    }

    function _request(){
        try {
            $.ajax({
                type: 'POST',
                url: String.format("{0}getrealalarm?{1}", $requestURI, _ticket.token),
                data: null,
                dataType: "text",
                timeout: 30000,
                success: function (data, status) {
                    if (data.startWith('Error') === true) {
                        _pullRefresh.fail();
                        warning(data);
                        return;
                    }

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
                            pageview.load(alarms);
                        }
                    }

                    _pullRefresh.reverse();
                },
                error: function (xhr, errorType, error) {
                    _pullRefresh.fail();
                    warning("告警加载失败,请重试。");
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    function _empty() {
        router.$("#pylon-app-alarm-list").html("");
        _footempty();
    }

    function _footempty() {
        router.$(".overlist .bui-scroll-foot").html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
    }

    function _more(content) {
        router.$("#pylon-app-alarm-list").html(content);
        _footmore();
    }

    function _footmore() {
        router.$(".overlist .bui-scroll-foot").html('<div class="nomore">没有更多内容</div>');
    }

    pageview.init();

    return pageview;
});