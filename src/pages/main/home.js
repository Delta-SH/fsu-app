loader.define(function (require, exports, module) {
  var pageview = {
    name: "数据机房监控系统",
    request: null,
    pull: null,
    slide: null,
    tips: null,
    refreshing: false
  };

  pageview.init = function () {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.pull) === true) {
      this.pull = bui.pullrefresh({
        id: "#pylon-app-home-pull",
        onRefresh: function () {
          if (pageview.pull !== null) {
            loader.require(["main"], function (mod) {
              mod.refresh(
                function (data) {},
                function (err) {
                  warning(err);
                },
                function () {
                  pageview.pull.reverse();
                }
              );
            });
          }
        },
      });
    }

    if (isNull(this.slide) === true) {
      this.slide = bui.slide({
        id: "#pylon-app-home-slide",
        height: 350,
        autoplay: true,
        autopage: true,
        loop: true,
      });
    }

    if (isNull(this.tips) === true) {
      this.tips = router.$(".alarm-dashboard > li");
      this.tips.on("click", function () {
        var level = $(this).attr("data-level");
        loader.require(["main"], function (mod) {
          mod.setparams({ once: true, data: { level: [parseInt(level)] } });
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
    this.refresh();
  };

  pageview.refresh = function(){
    if(this.refreshing === true)
      return;
    
    this.refreshing = true;
    var xkeys = [];
    $.each($shows, function (a, node) {
      xkeys.push(node.id);
    });

    if (xkeys.length === 0) {
      this.refreshing = false;
      return false;
    }

    this.request.Post(
      {
        url: "GetSignalDatas",
        data: { id: xkeys },
      },
      function (result) {
        $.each(result.data, function (index, item) {
          var current = router.$(String.format("#pylon-home-first-show-{0}", item.ID));
          if(current.length > 0){
            var type = parseInt(current.attr("data-type"));
            var desc = current.attr("data-desc");
  
            current.attr("class", getStateCls1(item.State));
            current.html(getNodeValue(type, item.Value, desc));
          }
        });
      },
      function (err) {},
      function () {
        pageview.refreshing = false;
      }
    );
  };

  pageview.dispose = function () {
  };

  pageview.init();
  return pageview;
});
