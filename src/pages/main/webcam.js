loader.define(function(require, exports, module) {
  var pageview = {
    name: "摄像机列表",
    request: null,
    search: null,
    list: null
  };

  pageview.init = function() {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.search) === true) {
      this.search = bui.searchbar({
        id: "#pylon-app-webcam-search",
        onInput: function(e, keyword) {},
        onRemove: function(e, keyword) {},
        callback: function(e, keyword) {}
      });
    }

    if (isNull(this.list) === true) {
      this.list = router.$("#pylon-app-webcam-list");
    }

    _resize();
  };

  pageview.load = function() {};

  pageview.dispose = function() {};

  pageview.refresh = function() {};

  function _resize() {
    var viewport = router.$("#pylon-app-webcam");
    var height1 = viewport.height();
    var height2 = router.$("header").height();
    var height3 = router.$("#pylon-app-webcam-search").height();
    pageview.list.height(height1 - height2 - height3 - 15);
  }

  pageview.init();
  pageview.load();
  return pageview;
});
