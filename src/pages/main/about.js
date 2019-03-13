loader.define(function(require, exports, module) {
    var pageview = {name: '版本信息'};
    
    pageview.init = function () {
        bui.btn("#about-check-version").submit(function (loading) {
            setTimeout(function (argument) {
                bui.alert("已经是最新版本咯！",function(){
                    this.close();
                    loading.stop();
                })
            }, 500);
        },{ text: "正在检查..." });
    }

    pageview.load = function(){
    }

    pageview.dispose = function(){
    }

    pageview.init();
    
    return pageview;
});