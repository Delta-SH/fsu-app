loader.define(function(require, exports, module) {
    var pageview = {name:'历史告警'}, _ticket, _deviceSelector, _pointSelector,_startPicker, _endPicker, _limitNumber;
    
    pageview.init = function () {
        _ticket = getTicket();
        if(!_deviceSelector){
            var data = _compute();
            _deviceSelector = bui.select({
                trigger: "#pylon-app-alarmreport-device",
                title: "选择设备",
                type: "radio",
                height: 400,
                data: data,
                placeholder: "请选择设备",
                onChange: function(e) {
                    _pointSelector.selectNone();
                    _request(this.value(),function(data){
                        _pointSelector.option("data", data);
                    });
                }
            });
        }

        if(!_pointSelector) {
            _pointSelector = bui.select({
                trigger: "#pylon-app-alarmreport-point",
                title: "选择信号",
                type: "radio",
                height: 400,
                data: [],
                toggle: true,
                placeholder: "默认全部",
                onChange: function(e) {
                }
            });
        }

        if(!_startPicker) {
            _startPicker = bui.pickerdate({
                handle: "#pylon-app-alarmreport-start",
                formatValue: "yyyy-MM-dd hh:mm:ss",
                value: moment().format("YYYY/MM/DD"),
                onChange: function(value) {
                    router.$("#pylon-app-alarmreport-start").val(value);
                }
            });
        }

        if(!_endPicker) {
            _endPicker = bui.pickerdate({
                handle:"#pylon-app-alarmreport-end",
                formatValue: "yyyy-MM-dd hh:mm:ss",
                value: moment().format("YYYY/MM/DD HH:mm:ss"),
                onChange: function(value) {
                    router.$("#pylon-app-alarmreport-end").val(value);
                }
            });
        }

        if(!_limitNumber){
            _limitNumber = bui.number({
                id:'#pylon-app-alarmreport-limit',
                min: 0,
                max: 200,
                value: 100,
                step: 10
            });
        }

        bui.btn("#pylon-app-alarmreport-query").submit(function (loading) {
            var id = _pointSelector.value();
            var device = _deviceSelector.value();
            var name = _deviceSelector.text();
            if(isNullOrEmpty(device,true) === true){
                warning("请选择设备");
                loading.stop();
                return;
            }

            var start = _startPicker.value();
            if(isNullOrEmpty(start,true) === true){
                warning("请选择开始时间");
                loading.stop();
                return;
            }

            var end = _endPicker.value();
            if(isNullOrEmpty(end,true) === true){
                warning("请选择结束时间");
                loading.stop();
                return;
            }

            var diff = moment(end).diff(start, "seconds") ;
            if(diff <= 0) {
                warning("结束时间必须大于开始时间");
                loading.stop();
                return;
            }

            // if(diff > 24 * 3600) {
            //     warning("时间段必须在24小时内");
            //     loading.stop();
            //     return;
            // }

            var limit = _limitNumber.value();

            loading.stop();
            router.load({ url: "pages/main/alarmreportdetail.html",param: {id:id,name:name,device:device,start:start,end:end,limit:limit} });
        },{ text: "正在查询..." });
    }

    pageview.load = function(){
    }

    pageview.dispose = function(){
    }

    function _compute(){
        var data = [];
        var devices = getDevices();
        if (isNull(devices) === true)
            return;

        if (devices.length === 0)
            return;

        $.each(devices, function(index,el){
            data.push({name:el.Name,value:el.ID});
        });
        
        return data;
    }

    function _request(device, success){
        $.ajax({
            type: 'POST',
            url: String.format("{0}getsignals?{1}&{2}", $requestURI, _ticket.token, device),
            data: null,
            dataType: "text",
            timeout: 30000,
            success: function (data, status) {
                if (isNullOrEmpty(data) === true) {
                    warning("信号获取失败");
                    return;
                }

                if (data.startWith('Error') === true) {
                    warning(data);
                    return;
                }

                var points = JSON.parse(data);
                var nodes = [];
                $.each(points, function(index, item) {
                    if ((item.Type === $node.DI.name || item.Type == $node.DI.id) && item.AlarmLevel > 0) {
                        nodes.push({
                            name: item.Name,
                            value: item.ID,
                            unit: item.ValueDesc
                        });
                    }
                });

                success(nodes);
            },
            error: function (xhr, status, error) {
                warning("信号获取失败");
            }
        });
    }

    pageview.init();

    return pageview;
});