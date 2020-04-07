loader.define(function(require, exports, module) {
  var pageview = {
    name: "实时数据",
    request: null,
    search: null,
    accordion: null
  };

  pageview.init = function() {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.search) === true) {
      this.search = bui.searchbar({
        id: "#pylon-app-data-search",
        onInput: function(e, keyword) {},
        onRemove: function(e, keyword) {},
        callback: function(e, keyword) {}
      });
    }

    if (isNull(this.accordion) === true) {
      this.accordion = bui.accordion({
        id: "#pylon-app-data-accordion",
        single: true
      });

      this.accordion.showFirst();
    }

    _resize();
  };

  pageview.load = function(devices) {};

  pageview.dispose = function() {};

  pageview.refresh = function() {};

  function _resize() {
    var viewport = router.$("#app-main-tab-data");
    var height1 = viewport.height();
    var height2 = router.$("header").height();
    var height3 = router.$("#pylon-app-data-search").height();
    router.$(".data-list-container").height(height1 - height2 - height3 - 15);
  }

  pageview.init();
  pageview.load();
  return pageview;
});
