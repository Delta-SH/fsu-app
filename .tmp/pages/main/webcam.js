"use strict";

loader.define(function (require, exports, module) {
  var pageview = {
    name: "摄像机列表",
    request: null,
    loading: null,
    params: null,
    search: null,
    devices: null,
    list: null
  };

  pageview.init = function () {
    if (isNull(this.params) === true) {
      var xparams = router.getPageParams();
      this.params = parseInt(xparams.id);
    }

    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: "#pylon-app-webcam",
        text: "正在加载"
      });
    }

    if (isNull(this.search) === true) {
      this.search = bui.searchbar({
        id: "#pylon-app-webcam-search",
        onInput: function onInput(e, keyword) {},
        onRemove: function onRemove(e, keyword) {
          pageview.filter(keyword);
        },
        callback: function callback(e, keyword) {
          pageview.filter(keyword);
        }
      });
    }

    if (isNull(this.list) === true) {
      this.list = router.$("#pylon-app-webcam-list");
    }

    _resize();
  };

  pageview.load = function () {
    this.devices = [];
    this.loading.show();
    getVDevicesByPid(this.params, null, function (data) {
      pageview.devices = data;

      _drawui(data);
    }, function (err) {
      warning(err.message);
    }, function () {
      pageview.loading.hide();
    });
  };

  pageview.dispose = function () {};

  pageview.filter = function (text) {
    if (isNullOrEmpty(text, true) === true) {
      _drawui(this.devices);
    } else {
      text = text.toLowerCase();

      var _devices = this.devices.filter(function (v) {
        return v.Name.toLowerCase().indexOf(text) > -1;
      });

      _drawui(_devices);
    }
  };

  function _drawui(data) {
    if (data.length === 0) {
      _empty();

      return;
    }

    var html = "";
    html += '<ul class="bui-list detail-list">';
    $.each(data, function (index, item) {
      html += "\n              <li class=\"bui-btn bui-box\" href=\"pages/main/camera.html?id=".concat(item.ID, "\">\n                <div class=\"bui-icon round primary\"><i class=\"appiconfont appicon-video\"></i></div>\n                <div class=\"span1\">").concat(item.Name, "</div>\n                <i class=\"icon-listright\"></i>\n              </li>\n              ");
    });
    html += "</ul>";

    _more(html);
  }

  function _empty() {
    pageview.list.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
  }

  function _more(content) {
    pageview.list.html(content);
    pageview.list.append('<div class="nomore">没有更多内容</div>');
  }

  function _resize() {
    var viewport = router.$("#pylon-app-webcam");
    var height1 = viewport.height();
    var height2 = router.$("header").height();
    var height3 = router.$("#pylon-app-webcam-search").height();
    pageview.list.height(height1 - height2 - height3);
  }

  pageview.init();
  pageview.load();
  return pageview;
});