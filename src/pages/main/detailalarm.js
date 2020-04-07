loader.define(function(require, exports, module) {
  var pageview = { name: "告警详情" };

  pageview.init = function() {
    _empty();
    var params = router.getPageParams();
    if (isNull(params) === true) {
      return;
    }

    var alarms = getAlarms();
    var alarm = _.find(alarms, function(item) {
      return item.SerialNO == params.id;
    });
    if (isNull(alarm) === true) return;

    var devices = getDevices();
    var device = _.find(devices, function(item) {
      return item.ID === alarm.DeviceID;
    });
    _fill(alarm, device);
  };

  pageview.load = function() {};

  pageview.dispose = function() {};

  function _empty() {
    router.$("#pylon-app-alarm-id").html("");
    router.$("#pylon-app-alarm-name").html("");
    router.$("#pylon-app-alarm-level").html("");
    router.$("#pylon-app-alarm-time").html("");
    router.$("#pylon-app-alarm-interval").html("");
    router.$("#pylon-app-alarm-value").html("");
    router.$("#pylon-app-alarm-desc").html("");
    router.$("#pylon-app-alarm-device").html("");
    router.$("#pylon-app-alarm-device-type").html("");
    router.$("#pylon-app-alarm-room").html("");
  }

  function _fill(alarm, device) {
    if (isNull(alarm) === false) {
      router.$("#pylon-app-alarm-id").html(alarm.SerialNO);
      router.$("#pylon-app-alarm-name").html(alarm.SignalName);
      router.$("#pylon-app-alarm-level").html(getAlarmName(alarm.AlarmLevel));
      router.$("#pylon-app-alarm-time").html(alarm.StartTime);
      router.$("#pylon-app-alarm-interval").html(getTimespan(alarm.StartTime));
      router.$("#pylon-app-alarm-value").html(alarm.StartValue);
      router.$("#pylon-app-alarm-desc").html(alarm.AlarmDesc);
    }

    if (isNull(device) === false) {
      router.$("#pylon-app-alarm-device").html(device.Name);
      router.$("#pylon-app-alarm-device-type").html(device.Type);
      router.$("#pylon-app-alarm-room").html(device.Room);
    }
  }

  pageview.init();
  return pageview;
});
