loader.define(function(require, exports, module) {
    var pageview = {name: '时间同步'}, _ticket, _datePicker;
           
    pageview.init = function () {
        _ticket = getTicket();

        if(!_datePicker) {
            _datePicker = bui.pickerdate({
                id:"#pylon-app-time-datepicker",
                formatValue: "yyyy-MM-dd hh:mm:ss",
                popup: false,
                onChange: function(value) {
                    router.$("#pylon-app-time-val").val(value);
                }
            });
        }

        bui.btn("#pylon-app-time-save").submit(function (loading) {
            _save(loading);
        },{ text: "正在保存..." });
    }

    pageview.load = function(){
    }

    pageview.dispose = function(){
    }

    function _save(loading) {
        var time = router.$("#pylon-app-time-val").val();
    
        if (isNullOrEmpty(time) === true) {
            warning('系统时间不能为空');
            loading.stop();
            return false;
        }
    
        $.ajax({
            type: 'POST',
            url: String.format("{0}settime?{1}&{2}", $requestURI, _ticket.token, time),
            data: null,
            dataType: "text",
            timeout: 30000,
            success: function (data, status) {
                if (data === 'true') {
                    successdialog('时间同步成功', '');
                } else {
                    warningdialog('时间同步失败', data);
                }
            },
            error: function (xhr, status, error) {
                warningdialog("时间同步失败", status || error);
            },
            complete: function(xhr, status){
                loading.stop();
            }
        });
    }

    pageview.init();

    return pageview;
});