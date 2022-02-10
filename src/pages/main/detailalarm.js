loader.define(function (require, exports, module) {
  var pageview = {
    name: "活动告警详情",
    request: null,
    id: null,
    confirmbtn: null,
  };

  pageview.init = function () {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    var params = router.getPageParams();
    if (isNull(params) === true) {
      return;
    }

    if (!isNullOrEmpty(params.ID)) {
      pageview.id = parseInt(params.ID);
    }

    if (isNull(this.confirmbtn) === true) {
      this.confirmbtn = bui.btn("#pylon-app-alarm-confirmbtn");
      var confirmbtn2 = router.$("pylon-app-alarm-confirmbtn");
      if (isNullOrEmpty(params.ConfirmTime) === false) {
        confirmbtn2.html("已确认").addClass("disabled");
      } else {
        this.confirmbtn.submit(
          function (loading) {
            if (pageview.id == null) {
              warning("服务不支持该功能，请升级。");
              loading.stop();
              return false;
            }

            confirmAlarms(
              { id: [pageview.id] },
              function () {
                router
                  .$("#pylon-app-alarm-confirmer")
                  .html(pageview.request.GetUser());
                router
                  .$("#pylon-app-alarm-confirmtime")
                  .html(new Date().Format("yyyy-MM-dd hh:mm:ss"));

                pageview.confirmbtn.off();
                confirmbtn2.html("已确认").addClass("disabled");
              },
              function (err) {
                warning(err);
              },
              function () {
                loading.stop();
              }
            );
          },
          { text: "确认中，请稍后..." }
        );
      }
    }

    router.$("#pylon-app-signal-id").html(params.SignalID);
    router.$("#pylon-app-signal-name").html(params.Signal);
    router
      .$("#pylon-app-alarm-level")
      .html(getAlarmName(parseInt(params.AlarmLevel)));
    router.$("#pylon-app-alarm-desc").html(params.AlarmDesc);
    router.$("#pylon-app-alarm-time").html(params.StartTime);
    router.$("#pylon-app-alarm-interval").html(getTimespan(params.StartTime));
    router.$("#pylon-app-alarm-value").html(params.StartValue);
    router.$("#pylon-app-alarm-confirmer").html(params.Confirmer);
    router.$("#pylon-app-alarm-confirmtime").html(params.ConfirmTime);
    router.$("#pylon-app-alarm-device").html(params.Device);
    router.$("#pylon-app-alarm-station").html(params.Station);
    router.$("#pylon-app-alarm-area").html(params.Area);
  };

  pageview.load = function () {};

  pageview.dispose = function () {
    loader.require(["pages/main/alarm"], function (mod) {
      setTimeout(function () {
        mod.reload();
      }, 1000);
    });
  };

  pageview.init();
  return pageview;
});
