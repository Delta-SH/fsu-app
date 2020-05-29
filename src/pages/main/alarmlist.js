loader.define(["pages/main/alarmreport"], function (report, require, exports, module) {
  var pageview = {
    name: "历史告警列表",
    request: null,
    pull: null,
    params: null,
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
        alarmLevel: this.params.levels,
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

      this.pull = this.request.GetList(
        {
          id: "#pylon-app-alarmdetail-scroll",
          url: "GetHistAlarms",
          data: conf,
          template: function (data) {
            var html = "";
            if (isNull(data) === true) {
              return html;
            }

            if (data.length === 0) {
              return html;
            }

            $.each(data, function (index, el) {
              html += `<li class="bui-btn bui-box" href="pages/main/alarmdetail.html?Area=${el.Area}&Station=${el.Station}&Device=${el.Device}&Signal=${el.Signal}&SignalID=${el.SignalID}&AlarmLevel=${el.AlarmLevel}&AlarmDesc=${el.AlarmDesc}&StartTime=${el.StartTime}&EndTime=${el.EndTime}&ConfirmTime=${el.ConfirmTime || ""}&Confirmer=${el.Confirmer || ""}&StartValue=${el.StartValue}&EndValue=${el.EndValue}">
                        <div class="alarm-icon ${getAlarmCls1(el.AlarmLevel)}"><i class="appiconfont appicon-bell"></i></div>
                        <div class="span1">
                            <div class="bui-box item-title-box">
                                <div class="span1 item-title">${el.Signal}</div>
                                <div class="item-text item-sub-title ${getAlarmCls1(el.AlarmLevel)}">${getAlarmName(el.AlarmLevel)}</div>
                            </div>
                            <div class="bui-box item-text-box">
                                <div class="span1 item-text">
                                    <span class="item-time">${el.StartTime}</span> 
                                </div>
                                <div class="item-spliter">~</div>
                                <div class="span1 item-text bui-align-right">
                                    <span class="item-time">${el.EndTime}</span>
                                </div>
                            </div>
                        </div>
                        <i class="icon-listright"></i>
                    </li>`;
            });

            return html;
          },
        },
        function (data) {},
        function (err) {
          warning(err.message);
        }
      );
    }
  };

  pageview.load = function () {};

  pageview.dispose = function () {};

  pageview.init();
  pageview.load();
  return pageview;
});
