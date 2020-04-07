loader.define(function(require, exports, module) {
  var pageview = {
    name: "历史数据",
    request: null,
    deviceer: null,
    deviceor: null,
    signaler: null,
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
        this.deviceer.on("lastchange", function() {
          alert(1);
        });
      }
    }

    if (isNull(this.deviceor) === true) {
      this.deviceor = router.$("#pylon-app-datareport-deviceer");
      this.deviceor.on("click", function() {
        pageview.deviceer.show();
      });
    }

    if (isNull(this.signaler) === true) {
      this.signaler = bui.select({
        trigger: "#pylon-app-datareport-signal",
        title: "信号列表",
        type: "radio",
        height: 300,
        autoClose: true,
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
        placeholder: "请选择"
      });

      pageview.signaler.on("show", function() {
        var content = this.widget().dialog.$(".bui-dialog-main");
        content.height(content.height() - 15);
        this.off("show");
      });
    }

    if (isNull(this.starter) === true) {
      this.starter = bui.pickerdate({
        bindValue: true,
        handle: "#pylon-app-datareport-start",
        formatValue: "yyyy-MM-dd hh:mm:ss",
        value: moment().format("YYYY/MM/DD")
      });
    }

    if (isNull(this.ender) === true) {
      this.ender = bui.pickerdate({
        bindValue: true,
        handle: "#pylon-app-datareport-end",
        formatValue: "yyyy-MM-dd hh:mm:ss",
        value: moment().format("YYYY/MM/DD HH:mm:ss")
      });
    }

    if (isNull(this.submit) === true) {
      this.submit = bui.btn("#pylon-app-datareport-ok");
      this.submit.submit(
        function(loading) {
          loading.stop();
          router.load({
            url: "pages/main/datadetail.html",
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

      router.$("#pylon-app-datareport-deviceer .selector").html('<div class="selected-val"></div><div class="selected-val"></div><div class="selected-val"></div>');
      return bui.levelselect({
        data: _options,
        title: "筛选范围",
        trigger: "#pylon-app-datareport-deviceer .selected-val",
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

      router.$("#pylon-app-datareport-deviceer .selector").html('<div class="selected-val"></div><div class="selected-val"></div>');
      return bui.levelselect({
        data: _options,
        title: "筛选范围",
        trigger: "#pylon-app-datareport-deviceer .selected-val",
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
