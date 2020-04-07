loader.define(function(require, exports, module) {
  var pageview = {
    name: "历史告警",
    request: null,
    deviceer: null,
    deviceor: null,
    signaler: null,
    leveler: null,
    starter: null,
    ender: null,
    submit: null
  };

  pageview.init = function() {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.deviceer) === true) {
      this.deviceer = _getselect($appAuthLevel);
      if (isNull(this.deviceer) === false) {
        this.deviceer.on("lastchange", function() {});
      }
    }

    if (isNull(this.deviceor) === true) {
      this.deviceor = router.$("#pylon-app-alarmreport-deviceer");
      this.deviceor.on("click", function() {
        pageview.deviceer.show();
      });
    }

    if (isNull(this.signaler) === true) {
      this.signaler = bui.select({
        trigger: "#pylon-app-alarmreport-signal",
        title: "信号列表",
        type: "checkbox",
        height: 300,
        data: [
          {
            name: "广东",
            value: "11"
          },
          {
            name: "广西",
            value: "22"
          },
          {
            name: "上海",
            value: "33"
          },
          {
            name: "北京",
            value: "44"
          },
          {
            name: "深圳",
            value: "55"
          },
          {
            name: "南京",
            value: "66"
          },
          {
            name: "广东",
            value: "111"
          },
          {
            name: "广西",
            value: "221"
          },
          {
            name: "上海",
            value: "331"
          },
          {
            name: "北京",
            value: "441"
          },
          {
            name: "深圳",
            value: "551"
          },
          {
            name: "南京",
            value: "661"
          },
          {
            name: "广东",
            value: "112"
          },
          {
            name: "广西",
            value: "222"
          },
          {
            name: "上海",
            value: "332"
          },
          {
            name: "北京",
            value: "442"
          },
          {
            name: "深圳",
            value: "552"
          },
          {
            name: "南京",
            value: "662"
          }
        ],
        placeholder: "全部信号",
        buttons: [
          { name: "重置", className: "" },
          { name: "确定", className: "primary-reverse" }
        ],
        callback: function(e) {
          var text = $(e.target).text();
          if (text == "重置") {
            pageview.signaler.selectNone();
          } else {
            pageview.signaler.hide();
          }
        }
      });

      pageview.signaler.on("show", function() {
        var content = this.widget().dialog.$(".bui-dialog-main");
        content.height(content.height() - 15);
        this.off("show");
      });
    }

    if (isNull(this.leveler) === true) {
      this.leveler = bui.select({
        trigger: "#pylon-app-alarmreport-level",
        title: "告警等级",
        type: "checkbox",
        height: 300,
        data: [
          {
            name: "一级告警",
            value: 1
          },
          {
            name: "二级告警",
            value: 2
          },
          {
            name: "三级告警",
            value: 3
          },
          {
            name: "四级告警",
            value: 4
          }
        ],
        placeholder: "全部告警",
        buttons: [
          { name: "重置", className: "" },
          { name: "确定", className: "primary-reverse" }
        ],
        callback: function(e) {
          var text = $(e.target).text();
          if (text == "重置") {
            pageview.leveler.selectNone();
          } else {
            pageview.leveler.hide();
          }
        }
      });

      pageview.leveler.on("show", function() {
        var content = this.widget().dialog.$(".bui-dialog-main");
        content.height(content.height() - 15);
        this.off("show");
      });
    }

    if (isNull(this.starter) === true) {
      this.starter = bui.pickerdate({
        bindValue: true,
        handle: "#pylon-app-alarmreport-start",
        formatValue: "yyyy-MM-dd hh:mm:ss",
        value: moment().format("YYYY/MM/DD")
      });
    }

    if (isNull(this.ender) === true) {
      this.ender = bui.pickerdate({
        bindValue: true,
        handle: "#pylon-app-alarmreport-end",
        formatValue: "yyyy-MM-dd hh:mm:ss",
        value: moment().format("YYYY/MM/DD HH:mm:ss")
      });
    }

    if (isNull(this.submit) === true) {
      this.submit = bui.btn("#pylon-app-alarmreport-ok");
      this.submit.submit(
        function(loading) {
          loading.stop();
          router.load({
            url: "pages/main/alarmdetail.html",
            param: {
              id: 1,
              name: "TEST",
              device: 2,
              start: "2020-01-01 12:00:00",
              end: "2020-01-01 13:00:00"
            }
          });
        },
        { text: "正在查询..." }
      );
    }
  };

  pageview.load = function() {};

  pageview.dispose = function() {};

  function _getselect(level) {
    if (level === $auth.Area) {
      var areas = getAreas();
      var stations = getStations();
      var devcies = getDevices();
      var _options = [];
      var _areamap = {};
      var _statmap = {};
      for (var i = 0; i < areas.length; i++) {
        var current = areas[i];
        _areamap[current["Id"]] = { d: current.Id, n: current.Name, c: [] };
      }

      for (var i = 0; i < stations.length; i++) {
        var current = stations[i];
        _statmap[current["Id"]] = { d: current.Id, n: current.Name, c: [] };
      }

      $.each(devcies, function(index, item) {
        var parent = _statmap[item.PID];
        if (parent) {
          parent["c"].push({ d: item.Id, n: item.Name });
        }
      });

      $.each(stations, function(index, item) {
        var parent = _areamap[item.AreaId];
        if (parent) {
          parent["c"].push(_statmap[item.Id]);
        }
      });

      $.each(areas, function(index, item) {
        var current = _areamap[item.Id];
        if (current) {
          _options.push(current);
        }
      });

      router.$("#pylon-app-alarmreport-deviceer .selector").html('<div class="selected-val"></div><div class="selected-val"></div><div class="selected-val"></div>');
      return bui.levelselect({
        data: _options,
        title: "筛选范围",
        trigger: "#pylon-app-alarmreport-deviceer .selected-val",
        placeholder: "请选择",
        level: 3,
        field: {
          name: "n",
          value: "d",
          data: ["c", "a"]
        }
      });
    } else if (level === $auth.Station) {
      var stations = getStations();
      var devcies = getDevices();
      var _options = [];
      var _statmap = {};
      for (var i = 0; i < stations.length; i++) {
        var current = stations[i];
        _statmap[current["Id"]] = { d: current.Id, n: current.Name, c: [] };
      }

      $.each(devcies, function(index, item) {
        var parent = _statmap[item.PID];
        if (parent) {
          parent["c"].push({ d: item.Id, n: item.Name });
        }
      });

      $.each(stations, function(index, item) {
        var current = _statmap[item.Id];
        if (current) {
          _options.push(current);
        }
      });

      router.$("#pylon-app-alarmreport-deviceer .selector").html('<div class="selected-val"></div><div class="selected-val"></div>');
      return bui.levelselect({
        data: _options,
        title: "筛选范围",
        trigger: "#pylon-app-alarmreport-deviceer .selected-val",
        placeholder: "请选择",
        level: 2,
        field: {
          name: "n",
          value: "d",
          data: ["c", "a"]
        }
      });
    }

    return null;
  }

  pageview.init();
  return pageview;
});
