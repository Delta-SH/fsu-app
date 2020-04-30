loader.define(function (require, exports, module) {
  var pageview = {
    name: "摄像头列表",
    request: null,
    params: null,
    loading: null,
    list: null,
    nodes: null,
  };

  pageview.init = function () {
    if (isNull(this.params) === true) {
      this.params = router.getPageParams();
    }

    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: "#pylon-app-camera",
        text: "正在加载",
      });
    }

    if (isNull(this.list) === true) {
      this.list = router.$("#camera-container");
    }
  };

  pageview.load = function () {
    this.nodes = [];
    this.loading.show();
    getAllSignalsByPid(
      this.params,
      null,
      function (data) {
        var xnodes = [];
        $.each(data, function (index, item) {
          if (item.Type === $node.VI.id || item.Type === $node.VO.id) {
            xnodes.push(item);
          }
        });

        pageview.nodes = xnodes;
        _drawui(xnodes);
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

  function _drawui(data) {
    if (data.length === 0) {
      _empty();
      return;
    }

    var html = "";
    html += '<ul class="bui-nav-icon bui-fluid-4">';
    $.each(data, function (index, item) {
      html += `
            <li class="bui-btn" href="pages/main/player.html?url=${encodeURI(item.ValueDesc)}">
                <div class="bui-icon primary round"><i class="appiconfont appicon-camera"></i></div>
                <div class="span1 camera-title">${item.Name}</div>
            </li>`;
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

  pageview.init();
  pageview.load();
  return pageview;
});
