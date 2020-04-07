loader.define(function() {
  var pageview = {
    name: "站点详情",
    loading: null,
    maintab: null
  };

  pageview.init = function() {
    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: ".device-page",
        text: "正在加载"
      });
    }

    if (isNull(this.maintab) === true) {
      this.maintab = bui.tab({
        id: "#pylon-app-station-tab",
        swipe: false,
        scroll: true
      });

      this.maintab.on("to", function() {
        index = index || this.maintab.index();
        switch (index) {
          case 0:
            break;
          case 1:
            break;
        }
      });
    }

    this.resize();
  };

  pageview.load = function() {};

  pageview.dispose = function() {};

  pageview.resize = function() {
    var viewport = router.$("#pylon-app-station-detail li.overlist");
    var search = router.$("#pylon-app-device-search");
    var list = router.$("#pylon-app-device-list");
    list.height(viewport.height() - search.height() - 15);
  };

  pageview.init();
  pageview.load();
  return pageview;
});
