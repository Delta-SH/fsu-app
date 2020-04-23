loader.define(function (require, exports, module) {
  var pageview = { name: "版本信息" };

  pageview.init = function () {
    bui.btn("#about-check-version").submit(
      function (loading) {
        setTimeout(function () {
          bui.hint({
            content: "<i class='appiconfont appicon-ok'></i><div>已经是最新版本</div>",
            position: "center",
            effect: "fadeInDown",
          });
          loading.stop();
        }, 500);
      },
      { text: "正在检查..." }
    );
  };

  pageview.load = function () {};

  pageview.dispose = function () {};

  pageview.init();
  return pageview;
});
