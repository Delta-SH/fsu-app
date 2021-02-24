"use strict";

loader.define(function (require, exports, module) {
  var pageview = {
    name: "数据机房监控系统",
    request: null,
    pull: null,
    slide: null,
    tips: null
  };

  pageview.init = function () {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.pull) === true) {
      this.pull = bui.pullrefresh({
        id: "#pylon-app-home-pull",
        onRefresh: function onRefresh() {
          if (pageview.pull !== null) {
            loader.require(["main"], function (mod) {
              mod.refresh(function (data) {}, function (err) {
                warning(err);
              }, function () {
                pageview.pull.reverse();
              });
            });
          }
        }
      });
    }

    if (isNull(this.slide) === true) {
      this.slide = bui.slide({
        id: "#pylon-app-home-slide",
        height: 350,
        autoplay: true,
        autopage: true,
        loop: true
      });
    }

    if (isNull(this.tips) === true) {
      this.tips = router.$(".alarm-dashboard > li");
      this.tips.on("click", function () {
        var level = $(this).attr("data-level");

        loader.require(["main"], function (mod) {
          mod.setparams({
            once: true,
            data: {
              level: [parseInt(level)]
            }
          });
          mod.totab(2);
        });
      });
    }
  };

  pageview.load = function (data) {
    var lct1 = router.$("#pylon-app-home-lct1"),
        lct2 = router.$("#pylon-app-home-lct2"),
        lct3 = router.$("#pylon-app-home-lct3"),
        lct4 = router.$("#pylon-app-home-lct4");
    lct1.html(data.level1);
    lct2.html(data.level2);
    lct3.html(data.level3);
    lct4.html(data.level4);
  };

  pageview.dispose = function () {};

  pageview.init();
  return pageview;
});