loader.define(function(require, exports, module) {
    var pageview = {name: '测值曲线图表'}, _ticket, _loading, _params, _chart, 
    _options={
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                if (_options.series.length > 0) {
                    if (!$.isArray(params))
                        params = [params];
    
                    var tips = [];
                    $.each(params, function(index, item) {
                        tips.push(String.format('<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:{0}"></span>{1}<br/>信号测值：{2} {3}<br/>测值时间：{4}', item.color, item.seriesName, item.value[1], item.data.unit, item.value[0]));
                    });
    
                    return tips.join('<br/>');
                }
    
                return '无数据';
            },
            extraCssText: '-webkit-transform: rotate(90deg);-moz-transform: rotate(90deg);-o-transform: rotate(90deg);-ms-transform: rotate(90deg);transform: rotate(90deg);'
        },
        grid: {
            top: 10,
            left: 10,
            right: 40,
            bottom: 30,
            containLabel: true
        },
        xAxis: [{
            type: 'value',
            position: 'top',
            nameRotate: -90,
            scale: true,
            axisLabel:{
                rotate : 90
            }
        }],
        yAxis: [{
            type: 'time',
            boundaryGap: false,
            inverse: 'true',
            axisLabel: {
                rotate : -90
            },
            splitLine: {
                show: false
            }
        }],
        series: []
    };
           
    pageview.init = function () {
        _ticket = getTicket();
        if (!_loading) {
            _loading = bui.loading({
                appendTo: ".curvereportdetail-page",
                text: "正在加载"
            }); 
        }

        if(!_chart){
            _chart = echarts.init(document.getElementById("pylon-app-curvereportdetail-chart"), 'shine');
            _chart.setOption(_options);
        }

        _params = router.getPageParams();
        if(isNull(_params) === true)
            return;
        
        router.$(".bui-bar-main").html(_params.name);
    }

    pageview.load = function(){
        if(isNull(_params) === true)
            return;
        
        _loading.show();
        _request(function(data){
            _draw(data);
        },function(err){},function(status){
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

                success(JSON.parse(data));
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

    function _draw(data){
        var models = [];
        $.each(data, function(index, item) {
            models.push({
                value: [item.Value ,item.Time],
                unit: ""
            });
        });
    
        _options.series.push({
            name: _params.name,
            type: 'line',
            smooth: true,
            showSymbol: false,
            itemStyle: {
                normal: {
                    color: '#0892cd'
                }
            },
            data: models
        });
    
        _chart.setOption(_options, true);
    }

    loader.import(["js/echarts.common.min.js","js/echarts.theme.shine.min.js"],function(){
        pageview.init();
        pageview.load();
    });

    return pageview;
});