loader.define(function() {
  var pageview = {
    name: "设备信号",
    request: null,
    maintab: null,
    loading: null,
    disearch: null,
    dipull: null,
    diview: null,
    aisearch: null,
    aipull: null,
    aiview: null,
    aosearch: null,
    aopull: null,
    aoview: null,
    dosearch: null,
    dopull: null,
    doview: null,
    aodialog: null,
    dodialog: null,
    dialarmdialog: null,
    divaluedialog: null
  };

  pageview.init = function() {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.maintab) === true) {
      this.maintab = bui.tab({
        id: "#pylon-app-device-tab",
        swipe: false,
        scroll: true
      });

      this.maintab.on("to", function() {
        var index = _maintab.index();
        switch (index) {
          case 0:
            break;
          case 1:
            break;
          case 2:
            break;
          case 3:
            break;
          case 4:
            break;
        }
      });
    }

    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: ".device-page",
        text: "正在加载"
      });
    }

    if (isNull(this.dipull) === true) {
      this.disearch = bui.searchbar({
        id: "#pylon-app-di-search",
        delayTime: 1000,
        onInput: function(e, keyword) {},
        onRemove: function(e, keyword) {},
        callback: function(e, keyword) {}
      });

      this.dipull = bui.pullrefresh({
        id: "#pylon-app-di-scroll",
        autoLoad: false,
        onRefresh: function() {}
      });

      this.diview = bui.listview({
        id: "#pylon-app-di-listview",
        callback: function() {}
      });
    }

    if (isNull(this.aipull) === true) {
      this.aisearch = bui.searchbar({
        id: "#pylon-app-ai-search",
        delayTime: 1000,
        onInput: function(e, keyword) {},
        onRemove: function(e, keyword) {},
        callback: function(e, keyword) {}
      });

      this.aipull = bui.pullrefresh({
        id: "#pylon-app-ai-scroll",
        autoLoad: false,
        onRefresh: function() {}
      });

      this.aiview = bui.listview({
        id: "#pylon-app-ai-listview",
        callback: function() {}
      });
    }

    if (isNull(this.aopull) === true) {
      this.aosearch = bui.searchbar({
        id: "#pylon-app-ao-search",
        delayTime: 1000,
        onInput: function(e, keyword) {},
        onRemove: function(e, keyword) {},
        callback: function(e, keyword) {}
      });

      this.aopull = bui.pullrefresh({
        id: "#pylon-app-ao-scroll",
        autoLoad: false,
        onRefresh: function() {}
      });

      this.aoview = bui.listview({
        id: "#pylon-app-ao-listview",
        callback: function() {}
      });
    }

    if (isNull(this.dopull) === true) {
      this.dosearch = bui.searchbar({
        id: "#pylon-app-do-search",
        delayTime: 1000,
        onInput: function(e, keyword) {},
        onRemove: function(e, keyword) {},
        callback: function(e, keyword) {}
      });

      this.dopull = bui.pullrefresh({
        id: "#pylon-app-do-scroll",
        autoLoad: false,
        onRefresh: function() {}
      });

      this.doview = bui.listview({
        id: "#pylon-app-do-listview",
        callback: function() {}
      });
    }

    if (isNull(this.aodialog) === true) {
      this.aodialog = bui.dialog({
        id: "#pylon-app-ao-dialog",
        effect: "fadeInUp",
        position: "bottom",
        fullscreen: false
      });

      router.$("#pylon-app-aoctrl-cancel").on("click", function(e) {
        pageview.aodialog.close();
      });
      router.$("#pylon-app-aoctrl-ok").on("click", function(e) {});
    }

    if (isNull(this.dodialog) === true) {
      this.dodialog = bui.dialog({
        id: "#pylon-app-do-dialog",
        effect: "fadeInUp",
        position: "bottom",
        fullscreen: false
      });

      router.$("#pylon-app-doctrl-cancel").on("click", function(e) {
        pageview.dodialog.close();
      });
      router.$("#pylon-app-doctrl-ok").on("click", function(e) {});
    }

    if (isNull(this.dialarmdialog) === true) {
      this.dialarmdialog = bui.dialog({
        id: "#pylon-app-di-alarm-dialog",
        effect: "fadeInUp",
        position: "bottom",
        fullscreen: false
      });

      router.$("#pylon-app-dialarm-cancel").on("click", function(e) {
        pageview.dialarmdialog.close();
      });
      router.$("#pylon-app-dialarm-ok").on("click", function(e) {});
    }

    if (isNull(this.divaluedialog) === true) {
      this.divaluedialog = bui.dialog({
        id: "#pylon-app-di-value-dialog",
        effect: "fadeInUp",
        position: "bottom",
        fullscreen: false
      });

      router.$("#pylon-app-divalue-cancel").on("click", function(e) {
        pageview.divaluedialog.close();
      });
      router.$("#pylon-app-divalue-ok").on("click", function(e) {});
    }
  };

  pageview.load = function() {};

  pageview.dispose = function() {};

  pageview.init();
  pageview.load();
  return pageview;
});
