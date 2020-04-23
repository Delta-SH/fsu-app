loader.define(function (require, exports, module) {
  var pageview = {
    name: "摄像头列表",
    request: null,
    params: null,
    loading: null,
    list: null,
    nodes: null,
    src: [
      {
        name: "测试#1",
        src: "http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8",
      },
      {
        name: "测试#2",
        src: "http://ivi.bupt.edu.cn/hls/cctv2.m3u8",
      },
      {
        name: "测试#3",
        src: "http://ivi.bupt.edu.cn/hls/cctv3hd.m3u8",
      },
      {
        name: "测试#4",
        src: "http://ivi.bupt.edu.cn/hls/cctv4.m3u8",
      },
      {
        name: "测试#5",
        src: "http://ivi.bupt.edu.cn/hls/cctv5phd.m3u8",
      },
      {
        name: "测试#6",
        src: "http://ivi.bupt.edu.cn/hls/cctv6hd.m3u8",
      },
      {
        name: "测试#7",
        src: "http://ivi.bupt.edu.cn/hls/cctv7.m3u8",
      },
      {
        name: "测试#8",
        src: "http://ivi.bupt.edu.cn/hls/cctv8hd.m3u8",
      },
      {
        name: "测试#9",
        src: "http://ivi.bupt.edu.cn/hls/cctv9.m3u8",
      },
      {
        name: "测试#10",
        src: "http://ivi.bupt.edu.cn/hls/cctv10.m3u8",
      },
    ],
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
        appendTo: ".camera-page",
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
        if (xnodes.length > 0) {
          var html = '<ul class="bui-nav-icon bui-fluid-4">';
          $.each(xnodes, function (index, item) {
            html += `
            <li class="bui-btn" href="pages/main/player.html?url=${encodeURI(item.ValueDesc)}">
                <div class="bui-icon primary round"><i class="appiconfont appicon-camera"></i></div>
                <div class="span1 camera-title">${item.Name}</div>
            </li>`;
          });
          html += "</ul>";
          pageview.list.html(html);
        } else {
          pageview.list.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>未找到记录~</span></div>');
        }
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

  pageview.init();
  pageview.load();
  return pageview;
});
