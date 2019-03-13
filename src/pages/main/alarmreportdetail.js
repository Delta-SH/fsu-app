loader.define(function(require, exports, module) {
    var pageview = {name: '历史告警详情'}, _ticket, _loading, _params, _pullRefresh;
           
    pageview.init = function () {
        _ticket = getTicket();
        if (!_loading) {
            _loading = bui.loading({
                appendTo: ".alarmreportdetail-page",
                text: "正在加载"
            }); 
        }

        if (!_pullRefresh) {
            _pullRefresh = bui.pullrefresh({
                id: "#pylon-app-alarmreportdetail-scroll",
                autoLoad: false,
                onRefresh: function(){
                    if(isNull(_params) === true) {
                        _pullRefresh.reverse();
                        return;
                    } 
                    
                    _request(function(data){
                        _pullRefresh.reverse();
                    },function(err){
                        _pullRefresh.fail();
                    },function(status){});
                }
            });
        }

        _params = router.getPageParams();
        if(isNull(_params) === true)
            return;
        
        router.$(".bui-bar-main").html(_params.name);
    }

    pageview.load = function(){
        _empty();

        if(isNull(_params) === true)
            return;
        
        _loading.show();
        _request(function(data){},function(err){},function(status){
            _loading.hide();
        });
    }

    pageview.dispose = function(){
    }

    function _request(success,failure,complete){
        $.ajax({
            type: 'POST',
            url: String.format("{0}gethistalarm?{1}&{2}&{3}&{4}", $requestURI, _ticket.token, _params.start, _params.end, isNullOrEmpty(_params.id, true) === true ? _params.device : (_params.id+"@"+_params.device)),
            data: null,
            dataType: "text",
            timeout: 30000,
            success: function (data, status) {
                if (isNullOrEmpty(data) === true) {
                    warning("数据获取失败");
                    return;
                }

                if (data.startWith('Error') === true) {
                    warning(data);
                    return;
                }

                var items = JSON.parse(data);
                var html = "";
                $.each(items, function (index, el) {
                    if(index >= _params.limit) return false;
                    html += `<li id="pylon-app-alarm-${el.SerialNO}" class="bui-btn bui-box">
                        <div class="bui-icon ${getAlarmCls2(el.AlarmLevel)}"><i class="appiconfont appicon-level2"></i></div>
                        <div class="span1">
                            <div class="bui-box item-title-box">
                                <div class="span1 item-title">${el.SignalName}</div>
                                <div class="item-text item-sub-title">${getAlarmName(el.AlarmLevel)}</div>
                            </div>
                            <div class="bui-box item-text-box">
                                <div class="span1 item-text">
                                    <span class="item-time">${el.StartTime}</span> 
                                </div>
                                <div class="item-spliter">~</div>
                                <div class="span1 item-text bui-align-right">
                                    <span class="item-time">${el.EndTime}</span>
                                </div>
                            </div>
                        </div>
                    </li>`
                });

                if (html !== "") {
                    _more(html);
                }

                success(items);
            },
            error: function (xhr, status, error) {
                warning("数据获取失败");
                failure(status||error);
            },
            complete: function(xhr, status){
                complete(status);
            }
        });
    }

    function _empty() {
        router.$("#pylon-app-alarmreportdetail-list").html("");
        _footempty();
    }

    function _footempty() {
        router.$(".overlist .bui-scroll-foot").html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
    }

    function _more(content) {
        router.$("#pylon-app-alarmreportdetail-list").html(content);
        _footmore();
    }

    function _footmore() {
        router.$(".overlist .bui-scroll-foot").html('<div class="nomore">没有更多内容</div>');
    }

    pageview.init();
    pageview.load();

    return pageview;
});