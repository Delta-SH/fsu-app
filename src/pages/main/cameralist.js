loader.define(function (require, exports, module) {
    var pageview = { name: '摄像头列表' }, _ticket, _id;

    pageview.init = function () {
        _ticket = getTicket();

        var params = router.getPageParams();
        if(isNull(params) === false){
            _id = params.id;
            router.$(".bui-bar > .bui-bar-main").html(params.name);
        }
    }

    pageview.load = function () {
        var html = "";
        for(var i=1;i<= 16;i++){
            html += `
            <li class="bui-btn" href="pages/main/video.html?url=${encodeURI("http://playertest.longtailvideo.com/adaptive/bipbop/gear4/prog_index.m3u8")}">
                <div class="bui-icon primary round"><i class="appiconfont appicon-camera"></i></div>
                <div class="span1 camera-title">摄像头#${i}</div>
            </li>`;
        }

        router.$("#camera-container").html(html);
        if (html !== "") {
            _more();
        } else {
            _empty();
        }
    }

    pageview.dispose = function(){
    }

    function _empty() {
        router.$("#camera-footer").html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
    }

    function _more() {
        router.$("#camera-footer").html('<div class="nomore">没有更多内容</div>');
    }

    pageview.init();
    pageview.load();

    return pageview;
});