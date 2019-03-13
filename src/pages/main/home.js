loader.define(function(require, exports, module) {
    var pageview = {name: '数据机房监控系统'}, _slide;
           
    pageview.init = function () {
        if(!_slide){
            _slide = bui.slide({
                id: "#pylon-app-home-slide",
                height: 350,
                autoplay: true,
                autopage: true,
                loop: true
            }); 
        }

        router.$("#pylon-app-home-tips > li").click(function(){
            var level = $(this).attr("data-level");
            loader.require(["main"],function (mod) {
                mod.setparams({ once: true, data: {level: parseInt(level) } });
                mod.to(2);
            });
        });
    }

    pageview.load = function(data) {
        data = data || getAlarms();
        var lct1 = router.$("pylon-app-home-lct1"),
            lct2 = router.$("pylon-app-home-lct2"),
            lct3 = router.$("pylon-app-home-lct3"),
            lct4 = router.$("pylon-app-home-lct4"),
            level1 = 0,level2 = 0,level3 = 0,level4 = 0;

            if(data !== null && $.isArray(data) && data.length > 0){
                $.each(data, function(name, value) {
                    if (value.AlarmLevel == 1)
                        level1++;
                    else if (value.AlarmLevel == 2)
                        level2++;
                    else if (value.AlarmLevel == 3)
                        level3++;
                    else if (value.AlarmLevel == 4)
                        level4++;
                });
            }

            lct1.html(level1);
            lct2.html(level2);
            lct3.html(level3);
            lct4.html(level4);
    }

    pageview.dispose = function(){
    }

    pageview.init();

    return pageview;
});