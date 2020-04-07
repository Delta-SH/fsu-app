loader.define(function(require, exports, module) {
  var pageview = {
    name: "实时视频",
    player: null
  };

  pageview.init = function() {
    if (isNull(this.player) === true) {
      this.player = videojs("pylon-app-video-player", {
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
    if (isNull(params) === false) {
      this.player.src({
        src: decodeURI(params.url),
        type: "application/x-mpegURL",
        overrideNative: true
      });
    }

    // 销毁播放器,释放资源
    $("#pylon-app-player").on("click", ".btn-back", function(e) {
      pageview.dispose();
    });
  };

  pageview.load = function() {};

  pageview.dispose = function() {
    if (isNull(this.player) === false) {
      this.player.dispose();
      this.player = null;
    }
  };

  loader.import(["css/video.min.css", "js/video.min.js"], function() {
    pageview.init();
  });
  return pageview;
});
