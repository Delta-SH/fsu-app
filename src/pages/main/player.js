loader.define(function(require, exports, module) {
  var pageview = {
    name: "实时视频",
    request: null,
    loading: null,
    player: null
  };

  pageview.init = function() {
    if (isNull(this.params) === true) {
      this.params = router.getPageParams();
    }

    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: "#pylon-app-player",
        text: "正在加载",
      });
    }

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
  };

  pageview.load = function() {
    this.loading.show();
    this.request.Post(
      {
        url: "SubscribeLiveVideo",
        data: pageview.params,
      },
      function (result) {
        pageview.player.src({
          src: result.data,
          type: "application/x-mpegURL",
          overrideNative: true
        });
      },
      function (err) {
        warning(err.message);
      },
      function () {
        pageview.loading.hide();
      }
    );
  };

  pageview.dispose = function() {
    if (isNull(this.player) === false) {
      this.player.dispose();
      this.player = null;
    }

    this.request.Post(
      {
        url: "UnsubscribeLiveVideo",
        data: this.params,
      },
      function (result) {
      },
      function (err) {
      },
      function () {
      }
    );
  };

  loader.import(["css/video.min.css", "js/video.min.js"], function() {
    pageview.init();
    pageview.load();
  });
  return pageview;
});
