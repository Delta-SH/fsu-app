loader.define(function(require, exports, module) {
  var _condition;
  var pageview = {
    name: "实时告警",
    request: null,
    sidebar: null,
    pull: null,
    select: null,
    menubtn: null,
    resetbtn: null,
    okbtn: null,
    choose: null
  };

  pageview.init = function() {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.sidebar) === true) {
      this.sidebar = bui.sidebar({
        id: "#app-main-tab-alarm",
        handle: ".alarm-page",
        width: 640
      });

      this.sidebar.lock();
    }

    if (isNull(this.menubtn) === true) {
      this.menubtn = $("#pylon-app-alarm-menu");
      this.menubtn.on("click", function() {
        _reset(_condition);
        pageview.sidebar.open({ target: "swipeleft" });
      });
    }

    if (isNull(this.resetbtn) === true) {
      this.resetbtn = $("#pylon-app-alarm-reset");
      this.resetbtn.on("click", function() {
        _reset();
      });
    }

    if (isNull(this.okbtn) === true) {
      this.okbtn = $("#pylon-app-alarm-ok");
      this.okbtn.on("click", function() {
        _filter();
        pageview.sidebar.close();
      });
    }

    if (isNull(this.pull) === true) {
      this.pull = bui.pullrefresh({
        id: "#pylon-app-alarm-scroll",
        autoLoad: false,
        onRefresh: function() {
          pageview.refresh(
            function(data) {},
            function(err) {
              warning(err);
            },
            function() {
              pageview.pull.reverse();
            }
          );
        }
      });
    }

    if (isNull(this.select) === true) {
      this.select = _getselect($appAuthLevel);
    }

    if (isNull(this.choose) === true) {
      this.choose = $("#pylon-app-alarm-deviceer");
      this.choose.on("click", function() {
        pageview.select.show();
      });
    }

    _resize();
    _reset();
  };

  pageview.load = function() {
    if (this.sidebar.isActive()) {
      this.sidebar.close();
    }

    this.reload();
  };

  pageview.reload = function(data) {
    _empty();

    var alarms = data || getAlarms();
    if (isNull(alarms) === true) {
      alarms = [];
    }

    if (isNull(_condition) === false) {
      if (_condition.level.length > 0) {
        alarms = _.filter(alarms, function(item) {
          return _.contains(_condition.level, item.AlarmLevel);
        });
      }

      if (_condition.area !== -1) {
      }

      if (_condition.station !== -1) {
      }

      if (_condition.device !== -1) {
        alarms = _.filter(alarms, function(item) {
          return item.DeviceID === _condition.device;
        });
      }

      if (isNullOrEmpty(_condition.signal, true) === false) {
        var signal = _condition.signal.toLowerCase();
        alarms = _.filter(alarms, function(item) {
          return item.SignalName.toLowerCase().indexOf(signal) !== -1;
        });
      }
    }

    alarms = _.sortBy(alarms, function(item) {
      return moment(item.StartTime).valueOf() * -1;
    });

    var html = "";
    $.each(alarms, function(index, el) {
      html += `<li id="pylon-app-alarm-${el.SerialNO}" class="bui-btn bui-box" href="pages/main/detailalarm.html?id=${el.SerialNO}">
                <div class="alarm-icon ${getAlarmCls1(el.AlarmLevel)}"><i class="appiconfont appicon-bell"></i></div>
                <div class="span1">
                    <div class="bui-box item-title-box">
                        <div class="span1 item-title">${el.SignalName}</div>
                        <div class="item-text item-sub-title ${getAlarmCls1(el.AlarmLevel)}">${getAlarmName(el.AlarmLevel)}</div>
                    </div>
                    <div class="bui-box item-text-box">
                        <div class="span1 item-text">
                            <span class="item-value">${el.DeviceName}</span> 
                        </div>
                        <div class="item-text">
                            <span class="item-time">${el.StartTime}</span>
                        </div>
                    </div>
                </div>
                <i class="icon-listright"></i>
            </li>`;
    });

    if (html !== "") {
      _more(html);
    }
  };

  pageview.refresh = function(success, failure, done) {
    this.request.Post(
      "getrealalarm",
      null,
      function(result) {
        var increment = result.data;
        if ($.isArray(increment) === true && increment.length > 0) {
          var alarms = getAlarms();
          if (isNull(alarms) === false) {
            $.each(increment, function(index, item) {
              if (isNullOrEmpty(item.EndTime) === true) {
                var current = _.find(alarms, function(value) {
                  return item.DeviceID === value.DeviceID && item.SignalID === value.SignalID;
                });

                if (isNull(current) === true) {
                  alarms.push(item);
                }
              } else {
                var current = _.find(alarms, function(value) {
                  return item.DeviceID === value.DeviceID && item.SignalID === value.SignalID;
                });

                if (isNull(current) === false) {
                  alarms = _.without(alarms, current);
                }
              }
            });

            window.setAlarms(alarms);
            pageview.load(alarms);
          }
        }
        success(result);
      },
      failure,
      done
    );
  };

  pageview.dispose = function() {
    _reset();
    _empty();
  };

  pageview.destroy = function() {
    this.choose.off("click");
    this.menubtn.off("click");
    this.resetbtn.off("click");
    this.okbtn.off("click");
    loader.destroy("pages/main/alarm");
    router.destroy("pages/main/alarm");
  };

  pageview.condition = function(data) {
    _condition = data;
  };

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
        _areamap[current["Id"]] = { d: current.Id, n: current.Name, c: [{ d: -1, n: "全部", c: [{ d: -1, n: "全部" }] }] };
      }

      for (var i = 0; i < stations.length; i++) {
        var current = stations[i];
        _statmap[current["Id"]] = { d: current.Id, n: current.Name, c: [{ d: -1, n: "全部" }] };
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

      _options.push({ d: -1, n: "全部", c: [{ d: -1, n: "全部", c: [{ d: -1, n: "全部" }] }] });
      $.each(areas, function(index, item) {
        var current = _areamap[item.Id];
        if (current) {
          _options.push(current);
        }
      });

      router.$("#pylon-app-alarm-deviceer .selector").html('<div class="selected-val"></div><div class="selected-val"></div><div class="selected-val"></div>');
      return bui.levelselect({
        data: _options,
        title: "筛选范围",
        trigger: "#pylon-app-alarm-deviceer .selected-val",
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
        _statmap[current["Id"]] = { d: current.Id, n: current.Name, c: [{ d: -1, n: "全部" }] };
      }

      $.each(devcies, function(index, item) {
        var parent = _statmap[item.PID];
        if (parent) {
          parent["c"].push({ d: item.Id, n: item.Name });
        }
      });

      _options.push({ d: -1, n: "全部", c: [{ d: -1, n: "全部" }] });
      $.each(stations, function(index, item) {
        var current = _statmap[item.Id];
        if (current) {
          _options.push(current);
        }
      });

      router.$("#pylon-app-alarm-deviceer .selector").html('<div class="selected-val"></div><div class="selected-val"></div>');
      return bui.levelselect({
        data: _options,
        title: "筛选范围",
        trigger: "#pylon-app-alarm-deviceer .selected-val",
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

  function _reset(data) {
    var level1 = router.$("#pylon-app-alarm-level1");
    var level2 = router.$("#pylon-app-alarm-level2");
    var level3 = router.$("#pylon-app-alarm-level3");
    var level4 = router.$("#pylon-app-alarm-level4");
    var signal = router.$("#pylon-app-alarm-signal");
    var select = pageview.select;

    //初始化
    level1.removeAttr("checked");
    level2.removeAttr("checked");
    level3.removeAttr("checked");
    level4.removeAttr("checked");
    signal.val("");
    if ($appAuthLevel === $auth.Area) {
      select.value([{ value: -1 }, { value: -1 }, { value: -1 }]);
    } else if ($appAuthLevel === $auth.Station) {
      select.value([{ value: -1 }, { value: -1 }]);
    }

    if (isNull(data) === true) {
      _condition = { area: -1, station: -1, device: -1, signal: null, level: [] };
      return;
    }

    $.each(data.level, function(index, ll) {
      switch (ll) {
        case $level.L1:
          level1.prop("checked", true);
          break;
        case $level.L2:
          level2.prop("checked", true);
          break;
        case $level.L3:
          level3.prop("checked", true);
          break;
        case $level.L4:
          level4.prop("checked", true);
          break;
      }
    });

    if (isNullOrEmpty(data.signal, true) === false) {
      signal.val(data.signal);
    }

    if ($appAuthLevel === $auth.Area) {
      select.value([{ value: data.area }, { value: data.station }, { value: data.device }]);
    } else if ($appAuthLevel === $auth.Station) {
      select.value([{ value: data.station }, { value: data.device }]);
    }

    _condition = data;
  }

  function _resize() {
    var viewport = router.$("#app-main-tab-alarm");
    var parent = viewport.parent();
    viewport.height(parent.height());
  }

  function _filter() {
    var level1 = router.$("#pylon-app-alarm-level1");
    var level2 = router.$("#pylon-app-alarm-level2");
    var level3 = router.$("#pylon-app-alarm-level3");
    var level4 = router.$("#pylon-app-alarm-level4");
    var signal = router.$("#pylon-app-alarm-signal");
    var select = pageview.select;

    _condition = { area: -1, station: -1, device: -1, signal: null, level: [] };
    if (level1.is(":checked") === true) {
      _condition.level.push($level.L1);
    }
    if (level2.is(":checked") === true) {
      _condition.level.push($level.L2);
    }
    if (level3.is(":checked") === true) {
      _condition.level.push($level.L3);
    }
    if (level4.is(":checked") === true) {
      _condition.level.push($level.L4);
    }
    _condition.signal = signal.val().trim();

    var ranges = select.value();
    if ($appAuthLevel === $auth.Area) {
      if (ranges.length >= 1) _condition.area = parseInt(ranges[0].value);
      if (ranges.length >= 2) _condition.station = parseInt(ranges[1].value);
      if (ranges.length >= 3) _condition.device = parseInt(ranges[2].value);
    } else if ($appAuthLevel === $auth.Station) {
      if (ranges.length >= 1) _condition.station = parseInt(ranges[0].value);
      if (ranges.length >= 2) _condition.device = parseInt(ranges[1].value);
    }

    loader.require(["main"], function(mod) {
      mod.setparams({ once: false, data: _condition });
    });
    pageview.reload();
  }

  function _empty() {
    router.$("#pylon-app-alarm-list").html("");
    router.$(".overlist .bui-scroll-foot").html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
  }

  function _more(content) {
    router.$("#pylon-app-alarm-list").html(content);
    router.$(".overlist .bui-scroll-foot").html('<div class="nomore">没有更多内容</div>');
  }

  pageview.init();
  return pageview;
});
