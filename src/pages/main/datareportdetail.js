loader.define(function(require, exports, module) {
    var pageview = {name: '历史数据详情'}, _ticket, _loading, _params,_pullRefresh;
           
    pageview.init = function () {
        _ticket = getTicket();
        if (!_loading) {
            _loading = bui.loading({
                appendTo: ".datareportdetail-page",
                text: "正在加载"
            }); 
        }

        if (!_pullRefresh) {
            _pullRefresh = bui.pullrefresh({
                id: "#pylon-app-datareportdetail-scroll",
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
            url: String.format("{0}gethistvalue?{1}&{2}&{3}&{4}@{5}", $requestURI, _ticket.token, _params.start, _params.end, _params.id, _params.device),
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
                    html += `<li class="bui-btn bui-box">
                        <div class="item-title">${index+1}.</div>
                        <div class="span1 bui-value">${el.Value + _params.unit}</div>
                        <div class="bui-value">${el.Time}</div>
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
        router.$("#pylon-app-datareportdetail-list").html("");
        _footempty();
    }

    function _footempty() {
        router.$(".overlist .bui-scroll-foot").html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
    }

    function _more(content) {
        router.$("#pylon-app-datareportdetail-list").html(content);
        _footmore();
    }

    function _footmore() {
        router.$(".overlist .bui-scroll-foot").html('<div class="nomore">没有更多内容</div>');
    }

    pageview.init();
    pageview.load();

    return pageview;
});