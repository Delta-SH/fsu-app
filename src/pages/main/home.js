loader.define(function (require, exports, module) {
  var pageview = {
    name: "数据机房监控系统",
    request: null,
    pull: null,
    slide: null,
    tips: null,
    wsdicon: null,
    sdzticon: null,
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

    if (isNull(this.wsdicon) === true) {
      this.wsdicon = router.$("#pylon-home-icon-wsd");
    }

    if (isNull(this.sdzticon) === true) {
      this.sdzticon = router.$("#pylon-home-icon-sdwt");
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
    var xwsd = [], xsdzt = [];
    $.each($wsd, function (a, device) {
      $.each(device.nodes, function (s, item) {
        xwsd.push(item.id);
      });
    });

    $.each($sdzt, function (a, device) {
      $.each(device.nodes, function (s, item) {
        xsdzt.push(item.id);
      });
    });
    
    getActAlarms(
    {signalId: xwsd.concat(xsdzt)},
    function(data){
      var xkeys = [];
      $.each(data, function (index, el) {
        xkeys.push(el.SignalID);
      });

      var _xwsd = xwsd.filter(function(v){ return xkeys.indexOf(v) > -1 });
      var _xsdzt = xsdzt.filter(function(v){ return xkeys.indexOf(v) > -1 });
      pageview.wsdicon.html(_xwsd.length > 0 ? `<span class="bui-badges">${_xwsd.length}</span>` : '');
      pageview.sdzticon.html(_xsdzt.length > 0 ? `<span class="bui-badges">${_xsdzt.length}</span>` : '');
    },function(err){
    },function(){
      pageview.refreshing = false;
    });
  };

  pageview.dispose = function () {
  };

  pageview.init();
  return pageview;
});
