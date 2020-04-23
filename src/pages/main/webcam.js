loader.define(function (require, exports, module) {
  var pageview = {
    name: "摄像机列表",
    request: null,
    loading: null,
    params: null,
    search: null,
    devices: null,
    list: null,
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
        appendTo: ".webcam-page",
        text: "正在加载",
      });
    }

    if (isNull(this.search) === true) {
      this.search = bui.searchbar({
        id: "#pylon-app-webcam-search",
        onInput: function (e, keyword) {},
        onRemove: function (e, keyword) {
          pageview.filter(keyword);
        },
        callback: function (e, keyword) {
          pageview.filter(keyword);
        },
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
    getVDevicesByPid(
      this.params,
      null,
      function (data) {
        pageview.devices = data;
        _drawui(data);
      },
      function (err) {
        warning(err.message);
      },
      function () {
        pageview.loading.hide();
      }
    );
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

      if (_devices.length == 0) {
        this.list.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>未找到记录~</span></div>');
      } else {
        _drawui(_devices);
      }
    }
  };

  function _drawui(data) {
    var html = "";
    html += '<ul class="bui-list detail-list">';
    $.each(data, function (index, item) {
      html += `
              <li class="bui-btn bui-box" href="pages/main/camera.html?id=${item.ID}">
                <div class="bui-icon round primary"><i class="appiconfont appicon-video"></i></div>
                <div class="span1">${item.Name}</div>
                <i class="icon-listright"></i>
              </li>
              `;
    });
    html += "</ul>";
    pageview.list.html(html);
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
