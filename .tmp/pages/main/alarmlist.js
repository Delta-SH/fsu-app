"use strict";

loader.define(["pages/main/alarmreport"], function (report, require, exports, module) {
  var pageview = {
    name: "历史告警列表",
    request: null,
    pull: null,
    params: null
  };

  pageview.init = function () {
    if (isNull(this.params) === true) {
      this.params = report.getoptions();
    }

    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.pull) === true) {
      var conf = {
        sortAttribute: 7,
        sortMode: 2,
        begin: this.params.begin,
        end: this.params.end,
        alarmLevel: this.params.levels
      };

      if (this.params.ids.length > 0) {
        conf.signalId = this.params.ids;
      } else {
        conf.area = null;
        conf.station = null;
        conf.device = null;
        conf.signal = null;
        conf.alarmDesc = null;

        if (isNullOrEmpty(this.params.area) === false) {
          conf.area = [this.params.area];
        }

        if (isNullOrEmpty(this.params.station) === false) {
          conf.station = [this.params.station];
        }

        if (isNullOrEmpty(this.params.device) === false) {
          conf.device = [this.params.device];
        }
      }

      this.pull = this.request.GetList({
        id: "#pylon-app-alarmdetail-scroll",
        url: "GetHistAlarms",
        data: conf,
        template: function template(data) {
          var html = "";

          if (isNull(data) === true) {
            return html;
          }

          if (data.length === 0) {
            return html;
          }

          $.each(data, function (index, el) {
            html += "<li class=\"bui-btn bui-box\" href=\"pages/main/alarmdetail.html?Area=".concat(el.Area, "&Station=").concat(el.Station, "&Device=").concat(el.Device, "&Signal=").concat(el.Signal, "&SignalID=").concat(el.SignalID, "&AlarmLevel=").concat(el.AlarmLevel, "&AlarmDesc=").concat(el.AlarmDesc, "&StartTime=").concat(el.StartTime, "&EndTime=").concat(el.EndTime, "&ConfirmTime=").concat(el.ConfirmTime || "", "&Confirmer=").concat(el.Confirmer || "", "&StartValue=").concat(el.StartValue, "&EndValue=").concat(el.EndValue, "\">\n                        <div class=\"alarm-icon ").concat(getAlarmCls1(el.AlarmLevel), "\"><i class=\"appiconfont appicon-bell\"></i></div>\n                        <div class=\"span1\">\n                            <div class=\"bui-box item-title-box\">\n                                <div class=\"span1 item-title\">").concat(el.Signal, "</div>\n                                <div class=\"item-text item-sub-title ").concat(getAlarmCls1(el.AlarmLevel), "\">").concat(getAlarmName(el.AlarmLevel), "</div>\n                            </div>\n                            <div class=\"bui-box item-text-box\">\n                                <div class=\"span1 item-text\">\n                                    <span class=\"item-time\">").concat(el.StartTime, "</span> \n                                </div>\n                                <div class=\"item-spliter\">~</div>\n                                <div class=\"span1 item-text bui-align-right\">\n                                    <span class=\"item-time\">").concat(el.EndTime, "</span>\n                                </div>\n                            </div>\n                        </div>\n                        <i class=\"icon-listright\"></i>\n                    </li>");
          });
          return html;
        }
      }, function (data) {}, function (err) {
        warning(err.message);
      });
    }
  };

  pageview.load = function () {};

  pageview.dispose = function () {};

  pageview.init();
  pageview.load();
  return pageview;
});