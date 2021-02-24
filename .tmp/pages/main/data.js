"use strict";

loader.define(function (require, exports, module) {
  var pageview = {
    name: "实时数据",
    request: null,
    areas: null,
    stations: null,
    refkeys: null,
    search: null,
    accordion: null,
    accordior: null
  };

  pageview.init = function () {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.search) === true) {
      this.search = bui.searchbar({
        id: "#pylon-app-data-search",
        onInput: function onInput(e, keyword) {},
        onRemove: function onRemove(e, keyword) {
          pageview.filter(keyword);
        },
        callback: function callback(e, keyword) {
          pageview.filter(keyword);
        }
      });
    }

    if (isNull(this.accordior) === true) {
      this.areas = getAreas();
      this.stations = getStations();
      this.accordior = router.$("#pylon-app-data-accordion");
      this.refkeys = this.stations.map(function (value, index, array) {
        return value.ID;
      });
    }

    if (isNull(this.accordion) === true && this.areas.length > 0) {
      this.accordion = bui.accordion({
        id: "#pylon-app-data-accordion",
        single: true
      });
    }

    _drawui(this.areas, this.stations);

    _resize();
  };

  pageview.load = function () {
    this.refresh();
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
        var current = router.$(String.format("#pylon-data-station-{0}", item.ID));
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
    if (isNullOrEmpty(text, true) === true) {
      this.refkeys = this.stations.map(function (value, index, array) {
        return value.ID;
      });

      _drawui(this.areas, this.stations);

      this.refresh();
    } else {
      text = text.toLowerCase();

      var _stations = this.stations.filter(function (v) {
        return v.Name.toLowerCase().indexOf(text) > -1;
      });

      if (_stations.length == 0) {
        this.accordior.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
      } else {
        this.refkeys = _stations.map(function (value, index, array) {
          return value.ID;
        });

        _drawui([], _stations);

        this.refresh();
      }
    }
  };

  function _drawui(areas, stations) {
    var html = "";

    if (areas.length > 0) {
      $.each(areas, function (a, area) {
        html += "\n          <dt id=\"pylon-data-area-".concat(area.ID, "\" class=\"bui-btn bui-box\">\n            <div class=\"span1\">").concat(area.Name, "</div>\n            <i class=\"icon-accordion\"></i>\n          </dt>\n          <dd><ul class=\"bui-list accordion-details\">\n        ");
        $.each(stations, function (s, sta) {
          if (sta.PID === area.ID) {
            html += "\n              <li id=\"pylon-data-station-".concat(sta.ID, "\" class=\"bui-btn bui-box\" href=\"pages/main/station.html?id=").concat(sta.ID, "\">\n                <div class=\"bui-icon round success\"><i class=\"appiconfont appicon-station\"></i></div>\n                <div class=\"span1\">").concat(sta.Name, " <span class=\"bui-badges hidden\">0</span></div>\n                <i class=\"icon-listright\"></i>\n              </li>\n              ");
          }
        });
        html += "</ul></dd>";
      });
      pageview.accordior.html(html);
      pageview.accordion.init();
      pageview.accordion.showFirst();
    } else {
      html += '<ul class="bui-list">';
      $.each(stations, function (s, sta) {
        html += "\n              <li id=\"pylon-data-station-".concat(sta.ID, "\" class=\"bui-btn bui-box\" href=\"pages/main/station.html?id=").concat(sta.ID, "\">\n                <div class=\"bui-icon round success\"><i class=\"appiconfont appicon-station\"></i></div>\n                <div class=\"span1\">").concat(sta.Name, " <span class=\"bui-badges hidden\">0</span></div>\n                <i class=\"icon-listright\"></i>\n              </li>\n              ");
      });
      html += '</ul><div class="nomore">没有更多内容</div>';
      pageview.accordior.html(html);
    }
  }

  function _resize() {
    var viewport = router.$("#app-main-tab-data");
    var height1 = viewport.height();
    var height2 = router.$("header").height();
    var height3 = router.$("#pylon-app-data-search").height();
    router.$(".data-list-container").height(height1 - height2 - height3);
  }

  pageview.init();
  pageview.load();
  return pageview;
});