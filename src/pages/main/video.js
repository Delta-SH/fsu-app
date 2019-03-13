loader.define(function(require, exports, module) {
    var pageview = {name: '实时视频'}, _player;
    
    pageview.init = function () {
        if(!_player){
        	_player = videojs('video-player', {
	        	html5: {
                    hls: {
                        overrideNative: true
                    }
                },
	            controlBar: {
	                volumePanel: {
	                    inline: false
	                }
	            },
	            liveui: true
	        });
        }

        var params = router.getPageParams();
        if(isNull(params) === false){
            _player.src({
                src: decodeURI(params.url),
                type: 'application/x-mpegURL',
                overrideNative: true
            });
        }

        // 销毁播放器,释放资源
        $("#video-container").on("click", ".btn-back", function (e) {
            pageview.dispose();
        });
    }

    pageview.load = function(){
    }

    pageview.dispose = function(){
        if(isNull(_player) === false){
            _player.dispose();
            _player = null;
        }
    }

    loader.import(["css/video.min.css", "js/video.min.js"],function(){
        pageview.init();
    });

    return pageview;
});