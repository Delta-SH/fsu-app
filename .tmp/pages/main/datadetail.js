"use strict";

loader.define(function (require, exports, module) {
  var pageview = {
    name: "历史数据详单",
    request: null,
    pull: null,
    params: null
  };

  pageview.init = function () {
    if (isNull(this.params) === true) {
      var xparams = router.getPageParams();
      this.params = {
        id: parseInt(xparams.id),
        name: xparams.name,
        type: parseInt(xparams.type),
        desc: xparams.desc,
        begin: xparams.begin,
        end: xparams.end
      };
    }

    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.pull) === true) {
      this.pull = this.request.GetList({
        id: "#pylon-app-datadetail-scroll",
        url: "GetMeasure",
        data: {
          begin: this.params.begin,
          end: this.params.end,
          id: this.params.id
        },
        template: function template(data) {
          var html = "";

          if (isNull(data) === true) {
            return html;
          }

          if (data.length === 0) {
            return html;
          }

          $.each(data, function (index, el) {
            html += "<li class=\"bui-btn bui-box\">\n                        <div class=\"signal-icon state0\"><i class=\"appiconfont appicon-signal\"></i></div>\n                        <div class=\"span1\">\n                          <div class=\"item-title\">".concat(pageview.params.name, "</div>\n                          <div class=\"item-text\">").concat(el.T, "</div>\n                        </div>\n                        <div class=\"item-val\">").concat(getNodeValue(pageview.params.type, el.V, pageview.params.desc), "</div>\n                    </li>");
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