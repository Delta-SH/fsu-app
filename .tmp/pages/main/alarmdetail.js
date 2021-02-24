"use strict";

loader.define(function (require, exports, module) {
  var pageview = {
    name: "历史告警详情"
  };

  pageview.init = function () {
    var params = router.getPageParams();

    if (isNull(params) === true) {
      return;
    }

    router.$("#pylon-app-signal-id").html(params.SignalID);
    router.$("#pylon-app-signal-name").html(params.Signal);
    router.$("#pylon-app-alarm-level").html(getAlarmName(parseInt(params.AlarmLevel)));
    router.$("#pylon-app-alarm-desc").html(params.AlarmDesc);
    router.$("#pylon-app-alarm-start").html(params.StartTime);
    router.$("#pylon-app-alarm-end").html(params.EndTime);
    router.$("#pylon-app-alarm-interval").html(getTimespan(params.StartTime, params.EndTime));
    router.$("#pylon-app-alarm-startval").html(params.StartValue);
    router.$("#pylon-app-alarm-endval").html(params.EndValue);
    router.$("#pylon-app-alarm-confirmer").html(params.Confirmer);
    router.$("#pylon-app-alarm-confirmtime").html(params.ConfirmTime);
    router.$("#pylon-app-alarm-device").html(params.Device);
    router.$("#pylon-app-alarm-station").html(params.Station);
    router.$("#pylon-app-alarm-area").html(params.Area);
  };

  pageview.load = function () {};

  pageview.dispose = function () {};

  pageview.init();
  return pageview;
});