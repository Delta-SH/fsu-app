loader.define(function(require, exports, module) {
  var pageview = {
    name: "历史告警详单",
    request: null,
    loading: null,
    pull: null,
    params: null
  };

  pageview.init = function() {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: ".datareportdetail-page",
        text: "正在加载"
      });
    }

    if (isNull(this.pull) === true) {
      this.pull = bui.list({
        id: "#pylon-app-alarmdetail-scroll",
        url: String.format("{0}/gethisalarms", this.request.GetPath()),
        method: "POST",
        headers: [{ "X-Token": this.request.GetToken() }],
        pageSize: 20,
        data: {
          device: null,
          signal: [],
          level: [],
          start: null,
          end: null
        },
        field: {
          page: "page",
          size: "limit",
          data: "data"
        },
        template: function(data) {
          var html = "";
          if (isNull(data) === true) {
            return html;
          }

          if (data.length === 0) {
            return html;
          }

          $.each(data, function(index, el) {
            html += `<li class="bui-btn bui-box">
                        <div class="alarm-icon ${getAlarmCls1(el.Level)}"><i class="appiconfont appicon-bell"></i></div>
                        <div class="span1">
                            <div class="bui-box item-title-box">
                                <div class="span1 item-title">${el.Signal}</div>
                                <div class="item-text item-sub-title ${getAlarmCls1(el.Level)}">${getAlarmName(el.Level)}</div>
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
                    </li>`;
          });

          return html;
        },
        onFail: function() {
          warning("数据加载失败");
        }
      });
    }

    if (isNull(this.params) === true) {
      this.params = router.getPageParams();
    }
  };

  pageview.load = function() {};

  pageview.dispose = function() {};

  pageview.init();
  pageview.load();
  return pageview;
});
