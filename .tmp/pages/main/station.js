"use strict";

loader.define(function () {
  var pageview = {
    name: "站点详情",
    params: null,
    request: null,
    maintab: null,
    search: null,
    refkeys: null,
    station: null,
    devices: null
  };

  pageview.init = function () {
    if (isNull(this.params) === true) {
      this.params = router.getPageParams();
      router.$("#pylon-app-station-webcam").attr("href", String.format("pages/main/webcam.html?id={0}", this.params.id));
    }

    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.maintab) === true) {
      this.maintab = bui.tab({
        id: "#pylon-app-station-tab",
        swipe: false,
        scroll: true
      });
    }

    if (isNull(this.search) === true) {
      this.search = bui.searchbar({
        id: "#pylon-app-device-search",
        onInput: function onInput(e, keyword) {},
        onRemove: function onRemove(e, keyword) {
          pageview.filter(keyword);
        },
        callback: function callback(e, keyword) {
          pageview.filter(keyword);
        }
      });
    }

    _resize();
  };

  pageview.load = function () {
    var id = pageview.params.id;
    $.when(getStationTask(id), getXDevicesByPidTask(id)).done(function (v1, v2) {
      if (isNull(v1) === false) {
        pageview.station = v1;

        _inittab0(v1);
      }

      if (isNull(v2) === false) {
        pageview.devices = v2;

        _inittab1(v2);

        pageview.refresh();
      }
    }).fail(function (err) {
      warning(err);
    });
  };

  pageview.dispose = function () {};

  pageview.refresh = function () {
    if (isNull(this.refkeys) === true) {
      return;
    }

    if (this.refkeys.length === 0) {
      return;
    }

    this.request.Post({
      url: "GetNodeStates",
      data: {
        id: this.refkeys
      }
    }, function (result) {
      $.each(result.data, function (index, item) {
        var current = router.$(String.format("#pylon-data-device-{0}", item.ID));
        var icon = current.children(".bui-icon");
        var badges = current.find(".span1 > .bui-badges");
        icon.attr("class", String.format("bui-icon round {0}", getStateCls2(item.State)));
        badges.html(item.AlarmCount);

        if (item.AlarmCount > 0) {
          badges.show();
        } else {
          badges.hide();
        }
      });
    }, function (err) {
      warning(err);
    });
  };

  pageview.filter = function (text) {
    var _devices = this.devices;

    if (isNullOrEmpty(text, true) === false) {
      text = text.toLowerCase();
      _devices = _devices.filter(function (v) {
        return v.Name.toLowerCase().indexOf(text) > -1;
      });
    }

    _inittab1(_devices);

    this.refresh();
  };

  function _inittab0(data) {
    router.$("#pylon-app-station-base-id").html(data.ID);
    router.$("#pylon-app-station-base-name").html(data.Name);
    router.$("#pylon-app-station-base-type").html(data.Type);
    router.$("#pylon-app-station-base-lonlat").html(data.Longitude + "," + data.Latitude);
    router.$("#pylon-app-station-base-mid").html(data.MID);
  }

  function _inittab1(data) {
    var container = router.$("#pylon-app-device-list");

    if (data.length === 0) {
      pageview.refkeys = [];
      container.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
      return;
    }

    var keys = [];
    var html = '<ul class="bui-list detail-list">';
    $.each(data, function (index, item) {
      keys.push(item.ID);
      html += "\n          <li id=\"pylon-data-device-".concat(item.ID, "\" class=\"bui-btn bui-box\" href=\"pages/main/device.html?id=").concat(item.ID, "\">\n            <div class=\"bui-icon round success\"><i class=\"appiconfont appicon-server\"></i></div>\n            <div class=\"span1\">").concat(item.Name, " <span class=\"bui-badges hidden\">0</span></div>\n            <i class=\"icon-listright\"></i>\n          </li>\n          ");
    });
    html += '</ul><div class="nomore">没有更多内容</div>';
    pageview.refkeys = keys;
    container.html(html);
  }

  function _resize() {
    var viewport = router.$("#pylon-app-station-detail li.overlist");
    var search = router.$("#pylon-app-device-search");
    var list = router.$("#pylon-app-device-list");
    list.height(viewport.height() - search.height());
  }

  pageview.init();
  pageview.load();
  return pageview;
});