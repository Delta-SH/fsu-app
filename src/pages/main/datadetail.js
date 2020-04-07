loader.define(function(require, exports, module) {
  var pageview = {
    name: "历史数据详单",
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
        id: "#pylon-app-datadetail-scroll",
        url: String.format("{0}/getvalues", this.request.GetPath()),
        method: "POST",
        headers: [{ "X-Token": this.request.GetToken() }],
        pageSize: 20,
        data: {
          id: null,
          device: null,
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
                      <div class="signal-icon ${getStateCls1(el.State)}"><i class="appiconfont appicon-signal"></i></div>
                      <div class="span1">
                        <div class="item-title">${el.SignalName}</div>
                        <div class="item-text">${el.Time}</div>
                      </div>
                      <div class="item-val">${el.Value}.234 VAC</div>
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
