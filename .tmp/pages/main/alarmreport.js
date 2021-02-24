"use strict";

loader.define(function (require, exports, module) {
  var pageview = {
    name: "历史告警",
    request: null,
    loading: null,
    deviceer: null,
    deviceor: null,
    signaler: null,
    leveler: null,
    starter: null,
    ender: null,
    submit: null,
    options: null
  };

  pageview.init = function () {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: "#pylon-app-alarmreport",
        text: "正在加载"
      });
    }

    if (isNull(this.deviceer) === true) {
      _initselect();
    }

    if (isNull(this.deviceor) === true) {
      this.deviceor = router.$("#pylon-app-alarmreport-deviceer");
      this.deviceor.on("click", function () {
        pageview.deviceer.show();
      });
    }

    if (isNull(this.signaler) === true) {
      this.signaler = bui.select({
        trigger: "#pylon-app-alarmreport-signal",
        title: "信号列表",
        type: "checkbox",
        height: "60%",
        data: [],
        placeholder: "全部信号",
        buttons: [{
          name: "重置",
          className: ""
        }, {
          name: "确定",
          className: "primary-reverse"
        }],
        callback: function callback(e) {
          var text = $(e.target).text();

          if (text == "重置") {
            pageview.signaler.selectNone();
          } else {
            pageview.signaler.hide();
          }
        }
      });
    }

    if (isNull(this.leveler) === true) {
      this.leveler = bui.select({
        trigger: "#pylon-app-alarmreport-level",
        title: "告警等级",
        type: "checkbox",
        height: "60%",
        data: [{
          name: "一级告警",
          value: 1
        }, {
          name: "二级告警",
          value: 2
        }, {
          name: "三级告警",
          value: 3
        }, {
          name: "四级告警",
          value: 4
        }],
        placeholder: "全部告警",
        buttons: [{
          name: "重置",
          className: ""
        }, {
          name: "确定",
          className: "primary-reverse"
        }],
        callback: function callback(e) {
          var text = $(e.target).text();

          if (text == "重置") {
            pageview.leveler.selectNone();
          } else {
            pageview.leveler.hide();
          }
        }
      });
    }

    if (isNull(this.starter) === true) {
      this.starter = bui.pickerdate({
        bindValue: true,
        handle: "#pylon-app-alarmreport-start",
        formatValue: "yyyy-MM-dd hh:mm:ss",
        value: bui.date.format(new Date(), "yyyy-MM-dd")
      });
    }

    if (isNull(this.ender) === true) {
      this.ender = bui.pickerdate({
        bindValue: true,
        handle: "#pylon-app-alarmreport-end",
        formatValue: "yyyy-MM-dd hh:mm:ss",
        value: new Date()
      });
    }

    if (isNull(this.submit) === true) {
      this.submit = bui.btn("#pylon-app-alarmreport-ok");
      this.submit.submit(_submit, {
        text: "正在查询..."
      });
    }
  };

  pageview.load = function () {};

  pageview.dispose = function () {};

  pageview.getoptions = function () {
    return this.options;
  };

  function _initselect() {
    pageview.loading.show();
    getXDevices(null, function (data) {
      _bindselect(data);
    }, function (err) {
      warning(err.message);
    }, function () {
      pageview.loading.hide();
    });
  }

  function _bindselect(devcies) {
    var authType = getAppAuthType();

    if (authType === $ssh.Station) {
      var stations = getStations();
      var _options = [];
      var _statmap = {};

      for (var i = 0; i < stations.length; i++) {
        var current = stations[i];
        _statmap[current["ID"]] = {
          d: current.ID,
          n: current.Name,
          c: []
        };
      }

      $.each(devcies, function (index, item) {
        var parent = _statmap[item.PID];

        if (parent) {
          parent["c"].push({
            d: item.ID,
            n: item.Name
          });
        }
      });
      $.each(stations, function (index, item) {
        var current = _statmap[item.ID];

        if (current) {
          _options.push(current);
        }
      });
      router.$("#pylon-app-alarmreport-deviceer .selector").html('<div class="selected-val"></div><div class="selected-val"></div>');
      pageview.deviceer = bui.levelselect({
        data: _options,
        title: "筛选范围",
        trigger: "#pylon-app-alarmreport-deviceer .selected-val",
        level: 2,
        field: {
          name: "n",
          value: "d",
          data: ["c", "a"]
        }
      });
    } else {
      var areas = getAreas();
      var stations = getStations();
      var _options = [];
      var _areamap = {};
      var _statmap = {};

      for (var i = 0; i < areas.length; i++) {
        var current = areas[i];
        _areamap[current["ID"]] = {
          d: current.ID,
          n: current.Name,
          c: []
        };
      }

      for (var i = 0; i < stations.length; i++) {
        var current = stations[i];
        _statmap[current["ID"]] = {
          d: current.ID,
          n: current.Name,
          c: []
        };
      }

      $.each(devcies, function (index, item) {
        var parent = _statmap[item.PID];

        if (parent) {
          parent["c"].push({
            d: item.ID,
            n: item.Name
          });
        }
      });
      $.each(stations, function (index, item) {
        var parent = _areamap[item.PID];

        if (parent) {
          parent["c"].push(_statmap[item.ID]);
        }
      });
      $.each(areas, function (index, item) {
        var current = _areamap[item.ID];

        if (current) {
          _options.push(current);
        }
      });
      router.$("#pylon-app-alarmreport-deviceer .selector").html('<div class="selected-val"></div><div class="selected-val"></div><div class="selected-val"></div>');
      pageview.deviceer = bui.levelselect({
        data: _options,
        title: "筛选范围",
        trigger: "#pylon-app-alarmreport-deviceer .selected-val",
        level: 3,
        field: {
          name: "n",
          value: "d",
          data: ["c", "a"]
        }
      });
    }

    if (isNull(pageview.deviceer) === false) {
      pageview.deviceer.on("lastchange", function (e, current, next) {
        var values = this.value();
        var authType = getAppAuthType();

        if (authType === $ssh.Station) {
          if (values.length >= 2) {
            var device = parseInt(values[1].value);

            if (device != -1) {
              _initnode(device);

              return true;
            }
          }
        } else {
          if (values.length >= 3) {
            var device = parseInt(values[2].value);

            if (device != -1) {
              _initnode(device);

              return true;
            }
          }
        }

        _initnode();
      });
    }
  }

  function _initnode(device) {
    if (isNull(device) === true) {
      _bindnode([]);

      return;
    }

    pageview.loading.show();
    getAllSignalsByPid(device, null, function (data) {
      _bindnode(data);
    }, function (err) {
      warning(err.message);
    }, function () {
      pageview.loading.hide();
    });
  }

  function _bindnode(nodes) {
    var points = [];
    var xnodes = [];
    $.each(nodes, function (index, item) {
      if (item.Type === $node.AI.id || item.Type === $node.DI.id) {
        xnodes.push(item);
        points.push({
          name: item.Name,
          value: item.ID
        });
      }
    });
    pageview.nodes = xnodes;
    pageview.signaler.option("data", points);
    pageview.signaler.selectNone();
  }

  function _submit(loading) {
    var _devices = pageview.deviceer.value();

    if (_devices.length === 0) {
      warning("请选择设备哦");
      loading.stop();
      return false;
    }

    var _area = null;
    var _station = null;
    var _device = null;
    var authType = getAppAuthType();

    if (authType === $ssh.Station) {
      if (_devices.length >= 2) {
        _station = _devices[_devices.length - 2].name;
        _device = _devices[_devices.length - 1].name;
      } else {
        warning("请选择设备哦");
        loading.stop();
        return false;
      }
    } else {
      if (_devices.length >= 3) {
        _area = _devices[_devices.length - 3].name;
        _station = _devices[_devices.length - 2].name;
        _device = _devices[_devices.length - 1].name;
      } else {
        warning("请选择设备哦");
        loading.stop();
        return false;
      }
    }

    var _nodes = [];

    var _selectedValues = pageview.signaler.values();

    if (_selectedValues.length > 0) {
      $.each(_selectedValues, function (index, item) {
        _nodes.push(parseInt(item.value));
      });
    }

    var _levels = [];

    var _selectedLevels = pageview.leveler.values();

    if (_selectedLevels.length > 0) {
      $.each(_selectedLevels, function (index, item) {
        _levels.push(parseInt(item.value));
      });
    }

    var _start = pageview.starter.value();

    var _end = pageview.ender.value();

    if (isNullOrEmpty(_start) === true) {
      warning("请选择开始时间");
      loading.stop();
      return false;
    }

    if (isNullOrEmpty(_end) === true) {
      warning("请选择结束时间");
      loading.stop();
      return false;
    }

    pageview.options = {
      area: _area,
      station: _station,
      device: _device,
      ids: _nodes,
      levels: _levels,
      begin: _start,
      end: _end
    };
    loading.stop();
    router.load({
      url: "pages/main/alarmlist.html"
    });
  }

  pageview.init();
  return pageview;
});