loader.define(function(require, exports, module) {
  var pageview = {
    name: "摄像头列表",
    request: null,
    params: null,
    list: null,
    sources: [
      {
        name: "测试#1",
        src: "http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8"
      },
      {
        name: "测试#2",
        src: "http://ivi.bupt.edu.cn/hls/cctv2.m3u8"
      },
      {
        name: "测试#3",
        src: "http://ivi.bupt.edu.cn/hls/cctv3hd.m3u8"
      },
      {
        name: "测试#4",
        src: "http://ivi.bupt.edu.cn/hls/cctv4.m3u8"
      },
      {
        name: "测试#5",
        src: "http://ivi.bupt.edu.cn/hls/cctv5phd.m3u8"
      },
      {
        name: "测试#6",
        src: "http://ivi.bupt.edu.cn/hls/cctv6hd.m3u8"
      },
      {
        name: "测试#7",
        src: "http://ivi.bupt.edu.cn/hls/cctv7.m3u8"
      },
      {
        name: "测试#8",
        src: "http://ivi.bupt.edu.cn/hls/cctv8hd.m3u8"
      },
      {
        name: "测试#9",
        src: "http://ivi.bupt.edu.cn/hls/cctv9.m3u8"
      },
      {
        name: "测试#10",
        src: "http://ivi.bupt.edu.cn/hls/cctv10.m3u8"
      },
      {
        name: "测试#11",
        src: "http://ivi.bupt.edu.cn/hls/cctv11.m3u8"
      },
      {
        name: "测试#12",
        src: "http://ivi.bupt.edu.cn/hls/cctv12.m3u8"
      },
      {
        name: "测试#1",
        src: "http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8"
      },
      {
        name: "测试#2",
        src: "http://ivi.bupt.edu.cn/hls/cctv2.m3u8"
      },
      {
        name: "测试#3",
        src: "http://ivi.bupt.edu.cn/hls/cctv3hd.m3u8"
      },
      {
        name: "测试#4",
        src: "http://ivi.bupt.edu.cn/hls/cctv4.m3u8"
      },
      {
        name: "测试#5",
        src: "http://ivi.bupt.edu.cn/hls/cctv5phd.m3u8"
      },
      {
        name: "测试#6",
        src: "http://ivi.bupt.edu.cn/hls/cctv6hd.m3u8"
      },
      {
        name: "测试#7",
        src: "http://ivi.bupt.edu.cn/hls/cctv7.m3u8"
      },
      {
        name: "测试#8",
        src: "http://ivi.bupt.edu.cn/hls/cctv8hd.m3u8"
      },
      {
        name: "测试#9",
        src: "http://ivi.bupt.edu.cn/hls/cctv9.m3u8"
      },
      {
        name: "测试#10",
        src: "http://ivi.bupt.edu.cn/hls/cctv10.m3u8"
      },
      {
        name: "测试#11",
        src: "http://ivi.bupt.edu.cn/hls/cctv11.m3u8"
      },
      {
        name: "测试#12",
        src: "http://ivi.bupt.edu.cn/hls/cctv12.m3u8"
      },
      {
        name: "测试#1",
        src: "http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8"
      },
      {
        name: "测试#2",
        src: "http://ivi.bupt.edu.cn/hls/cctv2.m3u8"
      },
      {
        name: "测试#3",
        src: "http://ivi.bupt.edu.cn/hls/cctv3hd.m3u8"
      },
      {
        name: "测试#4",
        src: "http://ivi.bupt.edu.cn/hls/cctv4.m3u8"
      },
      {
        name: "测试#5",
        src: "http://ivi.bupt.edu.cn/hls/cctv5phd.m3u8"
      },
      {
        name: "测试#6",
        src: "http://ivi.bupt.edu.cn/hls/cctv6hd.m3u8"
      },
      {
        name: "测试#7",
        src: "http://ivi.bupt.edu.cn/hls/cctv7.m3u8"
      },
      {
        name: "测试#8",
        src: "http://ivi.bupt.edu.cn/hls/cctv8hd.m3u8"
      },
      {
        name: "测试#9",
        src: "http://ivi.bupt.edu.cn/hls/cctv9.m3u8"
      },
      {
        name: "测试#10",
        src: "http://ivi.bupt.edu.cn/hls/cctv10.m3u8"
      },
      {
        name: "测试#11",
        src: "http://ivi.bupt.edu.cn/hls/cctv11.m3u8"
      },
      {
        name: "测试#12",
        src: "http://ivi.bupt.edu.cn/hls/cctv12.m3u8"
      }
    ]
  };

  pageview.init = function() {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.list) === true) {
      this.list = router.$("#camera-container");
    }

    if (isNull(this.params) === true) {
      this.params = router.getPageParams();
    }
  };

  pageview.load = function() {
    var html = "";
    for (var i = 1; i <= this.sources.length; i++) {
      html += `
            <li class="bui-btn" href="pages/main/player.html?url=${encodeURI(this.sources[i - 1].src)}">
                <div class="bui-icon primary round"><i class="appiconfont appicon-camera"></i></div>
                <div class="span1 camera-title">${this.sources[i - 1].name}</div>
            </li>`;
    }

    this.list.html(html);
  };

  pageview.dispose = function() {};

  pageview.init();
  pageview.load();
  return pageview;
});
