loader.define(function (require, exports, module) {
  var pageview = {
    name: "测值曲线图表",
    request: null,
    loading: null,
    chart: null,
    params: null,
    options: {
      tooltip: {
        trigger: "axis",
        formatter: function (data) {
          if (pageview.options.series.length > 0) {
            if (!$.isArray(data)) {
              data = [data];
            }

            var tips = [];
            $.each(data, function (index, item) {
              tips.push(String.format('<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:{0}"></span>{1}<br/>信号测值：{2} {3}<br/>测值时间：{4}', item.color, item.seriesName, item.value[0], item.data.unit, item.value[1]));
            });

            return tips.join("<br/>");
          }

          return "无数据";
        },
        extraCssText: "-webkit-transform: rotate(90deg);-moz-transform: rotate(90deg);-o-transform: rotate(90deg);-ms-transform: rotate(90deg);transform: rotate(90deg);",
      },
      grid: {
        top: 10,
        left: 10,
        right: 40,
        bottom: 30,
        containLabel: true,
      },
      xAxis: [
        {
          type: "value",
          position: "top",
          nameRotate: -90,
          scale: true,
          axisLabel: {
            rotate: 90,
          },
          splitLine: {
            show: false,
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ["rgba(21, 127, 204,0.2)", "rgba(255,255,255,0.2)"],
            },
          },
        },
      ],
      yAxis: {
        type: "time",
        boundaryGap: false,
        inverse: "true",
        axisLabel: {
          rotate: -90,
        },
        splitLine: {
          show: false,
        },
      },
      series: [],
    },
  };

  pageview.init = function () {
    if (isNull(this.params) === true) {
      var xparams = router.getPageParams();
      this.params = {
        id: parseInt(xparams.id),
        name: xparams.name,
        desc: xparams.desc,
        begin: xparams.begin,
        end: xparams.end,
      };
    }

    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: "#pylon-app-curvedetail",
        text: "正在加载",
      });
    }

    if (isNull(this.chart) === true) {
      this.chart = echarts.init(document.getElementById("pylon-app-curvedetail-chart"), "shine");
      this.chart.setOption(this.options);
    }
  };

  pageview.load = function () {
    this.loading.show();
    this.request.Post(
      {
        url: "GetMeasure",
        data: {
          begin: this.params.begin,
          end: this.params.end,
          id: this.params.id,
        },
      },
      function (result) {
        pageview.draw(result.data);
      },
      function (err) {
        warning(err.message);
      },
      function () {
        pageview.loading.hide();
      }
    );
  };

  pageview.dispose = function () {};

  pageview.draw = function (data) {
    var models = [];
    var _this = this;
    $.each(data, function (index, item) {
      models.push({
        value: [item.V, item.T],
        unit: _this.params.desc,
      });
    });

    this.options.series.push({
      name: _this.params.name,
      type: "line",
      smooth: true,
      showSymbol: false,
      itemStyle: {
        normal: {
          color: "#0892cd",
        },
      },
      data: models,
    });

    this.chart.setOption(_this.options, true);
  };

  loader.import("js/echarts.common.min.js", function () {
    pageview.init();
    pageview.load();
  });

  return pageview;
});
