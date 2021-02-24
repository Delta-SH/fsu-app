"use strict";

loader.define(function (require, exports, module) {
  var pageview = {
    name: "实时视频",
    request: null,
    areas: null,
    stations: null,
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
        id: "#pylon-app-video-search",
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
      this.accordior = router.$("#pylon-app-video-accordion");
    }

    if (isNull(this.accordion) === true && this.areas.length > 0) {
      this.accordion = bui.accordion({
        id: "#pylon-app-video-accordion",
        single: true
      });
    }

    _drawui(this.areas, this.stations);

    _resize();
  };

  pageview.load = function () {};

  pageview.dispose = function () {};

  pageview.filter = function (text) {
    if (isNullOrEmpty(text, true) === true) {
      _drawui(this.areas, this.stations);
    } else {
      text = text.toLowerCase();

      var _stations = this.stations.filter(function (v) {
        return v.Name.toLowerCase().indexOf(text) > -1;
      });

      if (_stations.length == 0) {
        this.accordior.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
      } else {
        _drawui([], _stations);
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
            html += "\n              <li id=\"pylon-video-station-".concat(sta.ID, "\" class=\"bui-btn bui-box\" href=\"pages/main/webcam.html?id=").concat(sta.ID, "\">\n                <div class=\"bui-icon round primary\"><i class=\"appiconfont appicon-station\"></i></div>\n                <div class=\"span1\">").concat(sta.Name, "</div>\n                <i class=\"icon-listright\"></i>\n              </li>\n              ");
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
        html += "\n              <li id=\"pylon-video-station-".concat(sta.ID, "\" class=\"bui-btn bui-box\" href=\"pages/main/webcam.html?id=").concat(sta.ID, "\">\n                <div class=\"bui-icon round primary\"><i class=\"appiconfont appicon-station\"></i></div>\n                <div class=\"span1\">").concat(sta.Name, "</div>\n                <i class=\"icon-listright\"></i>\n              </li>\n              ");
      });
      html += '</ul><div class="nomore">没有更多内容</div>';
      pageview.accordior.html(html);
    }
  }

  function _resize() {
    var viewport = router.$("#pylon-app-video");
    var height1 = viewport.height();
    var height2 = router.$("header").height();
    var height3 = router.$("#pylon-app-video-search").height();
    router.$(".data-list-container").height(height1 - height2 - height3);
  }

  pageview.init();
  pageview.load();
  return pageview;
});