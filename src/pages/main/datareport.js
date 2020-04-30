loader.define(function (require, exports, module) {
  var pageview = {
    name: "历史数据",
    request: null,
    loading: null,
    deviceer: null,
    deviceor: null,
    signaler: null,
    starter: null,
    ender: null,
    submit: null,
    nodes: null,
  };

  pageview.init = function () {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: "#pylon-app-datareport",
        text: "正在加载",
      });
    }

    if (isNull(this.deviceer) === true) {
      _initselect();
    }

    if (isNull(this.deviceor) === true) {
      this.deviceor = router.$("#pylon-app-datareport-deviceer");
      this.deviceor.on("click", function () {
        pageview.deviceer.show();
      });
    }

    if (isNull(this.signaler) === true) {
      this.nodes = [];
      this.signaler = bui.select({
        trigger: "#pylon-app-datareport-signal",
        title: "信号列表",
        type: "radio",
        height: "60%",
        autoClose: true,
        data: [],
        placeholder: "请选择",
      });
    }

    if (isNull(this.starter) === true) {
      this.starter = bui.pickerdate({
        bindValue: true,
        handle: "#pylon-app-datareport-start",
        formatValue: "yyyy-MM-dd hh:mm:ss",
        value: bui.date.format(new Date(), "yyyy-MM-dd"),
      });
    }

    if (isNull(this.ender) === true) {
      this.ender = bui.pickerdate({
        bindValue: true,
        handle: "#pylon-app-datareport-end",
        formatValue: "yyyy-MM-dd hh:mm:ss",
        value: new Date(),
      });
    }

    if (isNull(this.submit) === true) {
      this.submit = bui.btn("#pylon-app-datareport-ok");
      this.submit.submit(_submit, { text: "正在查询..." });
    }
  };

  pageview.load = function () {};

  pageview.dispose = function () {};

  function _initselect() {
    pageview.loading.show();
    getXDevices(
      null,
      function (data) {
        _bindselect(data);
      },
      function (err) {
        warning(err.message);
      },
      function () {
        pageview.loading.hide();
      }
    );
  }

  function _bindselect(devcies) {
    var authType = getAppAuthType();
    if (authType === $ssh.Station) {
      var stations = getStations();
      var _options = [];
      var _statmap = {};
      for (var i = 0; i < stations.length; i++) {
        var current = stations[i];
        _statmap[current["ID"]] = { d: current.ID, n: current.Name, c: [] };
      }

      $.each(devcies, function (index, item) {
        var parent = _statmap[item.PID];
        if (parent) {
          parent["c"].push({ d: item.ID, n: item.Name });
        }
      });

      $.each(stations, function (index, item) {
        var current = _statmap[item.ID];
        if (current) {
          _options.push(current);
        }
      });

      router.$("#pylon-app-datareport-deviceer .selector").html('<div class="selected-val"></div><div class="selected-val"></div>');
      pageview.deviceer = bui.levelselect({
        data: _options,
        title: "筛选范围",
        trigger: "#pylon-app-datareport-deviceer .selected-val",
        level: 2,
        field: {
          name: "n",
          value: "d",
          data: ["c", "a"],
        },
      });
    } else {
      var areas = getAreas();
      var stations = getStations();
      var _options = [];
      var _areamap = {};
      var _statmap = {};
      for (var i = 0; i < areas.length; i++) {
        var current = areas[i];
        _areamap[current["ID"]] = { d: current.ID, n: current.Name, c: [] };
      }

      for (var i = 0; i < stations.length; i++) {
        var current = stations[i];
        _statmap[current["ID"]] = { d: current.ID, n: current.Name, c: [] };
      }

      $.each(devcies, function (index, item) {
        var parent = _statmap[item.PID];
        if (parent) {
          parent["c"].push({ d: item.ID, n: item.Name });
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

      router.$("#pylon-app-datareport-deviceer .selector").html('<div class="selected-val"></div><div class="selected-val"></div><div class="selected-val"></div>');
      pageview.deviceer = bui.levelselect({
        data: _options,
        title: "筛选范围",
        trigger: "#pylon-app-datareport-deviceer .selected-val",
        level: 3,
        field: {
          name: "n",
          value: "d",
          data: ["c", "a"],
        },
      });
    }

    if (isNull(pageview.deviceer) === false) {
      pageview.deviceer.on("lastchange", function (e, current, next) {
        var values = this.value();
        var authType = getAppAuthType();
        if (authType === $ssh.Station) {
          if (values.length >= 2) {
            _initnode(parseInt(values[1].value));
            return true;
          }
        } else {
          if (values.length >= 3) {
            _initnode(parseInt(values[2].value));
            return true;
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
    getAllSignalsByPid(
      device,
      null,
      function (data) {
        _bindnode(data);
      },
      function (err) {
        warning(err.message);
      },
      function () {
        pageview.loading.hide();
      }
    );
  }

  function _bindnode(nodes) {
    var points = [];
    var xnodes = [];
    $.each(nodes, function (index, item) {
      if (item.Type === $node.AI.id || item.Type === $node.DI.id) {
        xnodes.push(item);
        points.push({ name: item.Name, value: item.ID });
      }
    });

    pageview.nodes = xnodes;
    pageview.signaler.option("data", points);
    pageview.signaler.selectNone();
  }

  function _submit(loading) {
    var _id = pageview.signaler.value();
    if (isNullOrEmpty(_id) === true) {
      warning("请选择信号哦");
      loading.stop();
      return false;
    }

    var _xid = parseInt(_id);
    var _nodes = pageview.nodes.filter(function (v) {
      return v.ID === _xid;
    });

    if (_nodes.length <= 0) {
      warning("无效的信号~");
      loading.stop();
      return false;
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

    loading.stop();
    router.load({
      url: "pages/main/datadetail.html",
      param: {
        id: _nodes[0].ID,
        name: _nodes[0].Name,
        type: _nodes[0].Type,
        desc: _nodes[0].ValueDesc,
        begin: _start,
        end: _end,
      },
    });
  }

  pageview.init();
  return pageview;
});
