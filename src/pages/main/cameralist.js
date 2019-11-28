loader.define(function (require, exports, module) {
    var pageview = {
            name: '摄像头列表'
        },
        _ticket,
        _id,
        _sources = [{
                name: '测试#1',
                src: 'http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8'
            },
            {
                name: '测试#2',
                src: 'http://ivi.bupt.edu.cn/hls/cctv2.m3u8'
            },
            {
                name: '测试#3',
                src: 'http://ivi.bupt.edu.cn/hls/cctv3hd.m3u8'
            },
            {
                name: '测试#4',
                src: 'http://ivi.bupt.edu.cn/hls/cctv4.m3u8'
            },
            {
                name: '测试#5',
                src: 'http://ivi.bupt.edu.cn/hls/cctv5phd.m3u8'
            },
            {
                name: '测试#6',
                src: 'http://ivi.bupt.edu.cn/hls/cctv6hd.m3u8'
            },
            {
                name: '测试#7',
                src: 'http://ivi.bupt.edu.cn/hls/cctv7.m3u8'
            },
            {
                name: '测试#8',
                src: 'http://ivi.bupt.edu.cn/hls/cctv8hd.m3u8'
            },
            {
                name: '测试#9',
                src: 'http://ivi.bupt.edu.cn/hls/cctv9.m3u8'
            },
            {
                name: '测试#10',
                src: 'http://ivi.bupt.edu.cn/hls/cctv10.m3u8'
            },
            {
                name: '测试#11',
                src: 'http://ivi.bupt.edu.cn/hls/cctv11.m3u8'
            },
            {
                name: '测试#12',
                src: 'http://ivi.bupt.edu.cn/hls/cctv12.m3u8'
            }
        ];

    pageview.init = function () {
        _ticket = getTicket();

        var params = router.getPageParams();
        if (isNull(params) === false) {
            _id = params.id;
            router.$(".bui-bar > .bui-bar-main").html(params.name);
        }
    }

    pageview.load = function () {
        var html = "";
        for (var i = 1; i <= _sources.length; i++) {
            html += `
            <li class="bui-btn" href="pages/main/video.html?url=${encodeURI(_sources[i-1].src)}">
                <div class="bui-icon primary round"><i class="appiconfont appicon-camera"></i></div>
                <div class="span1 camera-title">${_sources[i-1].name}</div>
            </li>`;
        }

        router.$("#camera-container").html(html);
        if (html !== "") {
            _more();
        } else {
            _empty();
        }
    }

    pageview.dispose = function () {}

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