loader.define(function (require, exports, module) {
  var pageview = {
    name: "实时告警",
    request: null,
    sidebar: null,
    pull: null,
    select: null,
    menubtn: null,
    resetbtn: null,
    okbtn: null,
    choose: null,
    timer: null,
    options: null,
  };

  pageview.init = function () {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.sidebar) === true) {
      this.sidebar = bui.sidebar({
        id: "#app-main-tab-alarm",
        handle: ".alarm-page",
        width: 640,
      });

      this.sidebar.lock();
    }

    if (isNull(this.menubtn) === true) {
      this.menubtn = $("#pylon-app-alarm-menu");
      this.menubtn.on("click", function () {
        _bindsidebar(pageview.options);
        pageview.sidebar.open({ target: "swipeleft" });
      });
    }

    if (isNull(this.resetbtn) === true) {
      this.resetbtn = $("#pylon-app-alarm-reset");
      this.resetbtn.on("click", function () {
        _initsidebar();
      });
    }

    if (isNull(this.okbtn) === true) {
      this.okbtn = $("#pylon-app-alarm-ok");
      this.okbtn.on("click", function () {
        _filter();
        pageview.sidebar.close();
      });
    }

    if (isNull(this.pull) === true) {
      this.pull = bui.pullrefresh({
        id: "#pylon-app-alarm-scroll",
        autoLoad: false,
        onRefresh: function () {
          pageview.refresh(
            null,
            function (err) {
              warning(err);
            },
            function () {
              pageview.pull.reverse();
            }
          );
        },
      });
    }

    if (isNull(this.select) === true) {
      _initselect();
    }

    if (isNull(this.choose) === true) {
      this.choose = $("#pylon-app-alarm-deviceer");
      this.choose.on("click", function () {
        if (isNull(pageview.select) === false) {
          pageview.select.show();
        }
      });
    }

    if (isNull(this.options) === true) {
      this.condition();
    }

    _resize();
  };

  pageview.load = function () {
    if (this.sidebar.isActive()) {
      this.sidebar.close();
    }

    _settimer(100);
  };

  pageview.refresh = function (conf, fail, done) {
    getAllAlarms(
      conf,
      function (data) {
        var html = "";
        $.each(data, function (index, el) {
          html += `<li class="bui-btn bui-box" href="pages/main/detailalarm.html?ID=${
            el.ID || ""
          }&Area=${el.Area}&Station=${el.Station}&Device=${el.Device}&Signal=${
            el.Signal
          }&SignalID=${el.SignalID}&AlarmLevel=${el.AlarmLevel}&AlarmDesc=${
            el.AlarmDesc
          }&StartTime=${el.StartTime}&EndTime=${el.EndTime || ""}&ConfirmTime=${
            el.ConfirmTime || ""
          }&Confirmer=${el.Confirmer || ""}&StartValue=${
            el.StartValue
          }&EndValue=${el.EndValue || ""}">
              <div class="alarm-icon ${getAlarmCls1(
                el.AlarmLevel
              )}"><i class="appiconfont appicon-bell"></i></div>
              <div class="span1">
                  <div class="bui-box item-title-box">
                      <div class="span1 item-title">${el.Signal}</div>
                      <div class="item-text item-sub-title ${getAlarmCls1(
                        el.AlarmLevel
                      )}">${
            isNullOrEmpty(el.ConfirmTime)
              ? ""
              : "<i class='appiconfont appicon-ok'></i> "
          }${getAlarmName(el.AlarmLevel)}</div>
                  </div>
                  <div class="bui-box item-text-box">
                      <div class="span1 item-text">
                          <span class="item-value">${el.Device}</span> 
                      </div>
                      <div class="item-text">
                          <span class="item-time">${el.StartTime}</span>
                      </div>
                  </div>
              </div>
              <i class="icon-listright"></i>
          </li>`;
        });

        if (isNullOrEmpty(html, true) === false) {
          _more(html);
        } else {
          _empty();
        }
      },
      function (err) {
        _empty();
        fail(err);
      },
      done
    );
  };

  pageview.dispose = function () {
    _cleartimer();
    _initsidebar();
  };

  pageview.condition = function (data) {
    this.options = $.extend(
      { area: null, station: null, device: null, signal: null, level: [] },
      data || {}
    );
  };

  function _settimer(timeout) {
    pageview.timer = setTimeout(function () {
      pageview.refresh(
        _getparams(),
        function (err) {},
        function () {
          _cleartimer();
          _settimer();
        }
      );
    }, timeout || 10000);
  }

  function _cleartimer() {
    if (isNull(pageview.timer) === false) {
      clearTimeout(pageview.timer);
      pageview.timer = null;
    }
  }

  function _initselect() {
    getXDevices(
      null,
      function (data) {
        _bindselect(data);
      },
      function (err) {
        warning(err.message);
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
        _statmap[current["ID"]] = {
          d: current.ID,
          n: current.Name,
          c: [{ d: "-1", n: "全部" }],
        };
      }

      $.each(devcies, function (index, item) {
        var parent = _statmap[item.PID];
        if (parent) {
          parent["c"].push({ d: item.ID, n: item.Name });
        }
      });

      _options.push({ d: "-1", n: "全部", c: [{ d: "-1", n: "全部" }] });
      $.each(stations, function (index, item) {
        var current = _statmap[item.ID];
        if (current) {
          _options.push(current);
        }
      });

      router
        .$("#pylon-app-alarm-deviceer .selector")
        .html(
          '<div class="selected-val"></div><div class="selected-val"></div>'
        );
      pageview.select = bui.levelselect({
        data: _options,
        title: "筛选范围",
        trigger: "#pylon-app-alarm-deviceer .selected-val",
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
        _areamap[current["ID"]] = {
          d: current.ID,
          n: current.Name,
          c: [{ d: "-1", n: "全部", c: [{ d: "-1", n: "全部" }] }],
        };
      }

      for (var i = 0; i < stations.length; i++) {
        var current = stations[i];
        _statmap[current["ID"]] = {
          d: current.ID,
          n: current.Name,
          c: [{ d: "-1", n: "全部" }],
        };
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

      _options.push({
        d: "-1",
        n: "全部",
        c: [{ d: "-1", n: "全部", c: [{ d: "-1", n: "全部" }] }],
      });
      $.each(areas, function (index, item) {
        var current = _areamap[item.ID];
        if (current) {
          _options.push(current);
        }
      });

      router
        .$("#pylon-app-alarm-deviceer .selector")
        .html(
          '<div class="selected-val"></div><div class="selected-val"></div><div class="selected-val"></div>'
        );
      pageview.select = bui.levelselect({
        data: _options,
        title: "筛选范围",
        trigger: "#pylon-app-alarm-deviceer .selected-val",
        level: 3,
        field: {
          name: "n",
          value: "d",
          data: ["c", "a"],
        },
      });
    }
  }

  function _initsidebar() {
    var level1 = router.$("#pylon-app-alarm-level1");
    var level2 = router.$("#pylon-app-alarm-level2");
    var level3 = router.$("#pylon-app-alarm-level3");
    var level4 = router.$("#pylon-app-alarm-level4");
    var signal = router.$("#pylon-app-alarm-signal");
    var select = pageview.select;

    //初始化
    level1.prop("checked", false);
    level2.prop("checked", false);
    level3.prop("checked", false);
    level4.prop("checked", false);
    signal.val("");

    var authType = getAppAuthType();
    if (authType === $ssh.Station) {
      select.value([
        { value: _getselectvalue() },
        { value: _getselectvalue() },
      ]);
    } else {
      select.value([
        { value: _getselectvalue() },
        { value: _getselectvalue() },
        { value: _getselectvalue() },
      ]);
    }

    pageview.condition();
    return {
      select: select,
      signal: signal,
      level1: level1,
      level2: level2,
      level3: level3,
      level4: level4,
    };
  }

  function _bindsidebar(data) {
    var sides = _initsidebar();
    $.each(data.level, function (index, item) {
      switch (item) {
        case $level.L1:
          sides.level1.prop("checked", true);
          break;
        case $level.L2:
          sides.level2.prop("checked", true);
          break;
        case $level.L3:
          sides.level3.prop("checked", true);
          break;
        case $level.L4:
          sides.level4.prop("checked", true);
          break;
      }
    });

    if (isNullOrEmpty(data.signal, true) === false) {
      sides.signal.val(data.signal);
    }

    var authType = getAppAuthType();
    if (authType === $ssh.Station) {
      sides.select.value([
        { value: _getselectvalue(data.station) },
        { value: _getselectvalue(data.device) },
      ]);
    } else {
      sides.select.value([
        { value: _getselectvalue(data.area) },
        { value: _getselectvalue(data.station) },
        { value: _getselectvalue(data.device) },
      ]);
    }

    pageview.options = data;
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

    var _options = {
      area: null,
      station: null,
      device: null,
      signal: null,
      level: [],
    };
    if (level1.is(":checked") === true) {
      _options.level.push($level.L1);
    }
    if (level2.is(":checked") === true) {
      _options.level.push($level.L2);
    }
    if (level3.is(":checked") === true) {
      _options.level.push($level.L3);
    }
    if (level4.is(":checked") === true) {
      _options.level.push($level.L4);
    }

    var text = signal.val().trim();
    if (isNullOrEmpty(text) === false) {
      _options.signal = text;
    }

    var ranges = select.value();
    var authType = getAppAuthType();
    if (authType === $ssh.Station) {
      if (ranges.length >= 1) {
        var id = parseInt(ranges[0].value);
        if (id !== -1) {
          _options.station = { id: id, name: ranges[0].name };
        }
      }

      if (ranges.length >= 2) {
        var id = parseInt(ranges[1].value);
        if (id !== -1) {
          _options.device = { id: id, name: ranges[1].name };
        }
      }
    } else {
      if (ranges.length >= 1) {
        var id = parseInt(ranges[0].value);
        if (id !== -1) {
          _options.area = { id: id, name: ranges[0].name };
        }
      }

      if (ranges.length >= 2) {
        var id = parseInt(ranges[1].value);
        if (id !== -1) {
          _options.station = { id: id, name: ranges[1].name };
        }
      }

      if (ranges.length >= 3) {
        var id = parseInt(ranges[2].value);
        if (id !== -1) {
          _options.device = { id: id, name: ranges[2].name };
        }
      }
    }

    pageview.options = _options;
    loader.require(["main"], function (mod) {
      mod.setparams({ once: false, data: _options });
    });

    pageview.refresh(_getparams(_options), function (err) {
      warning(err);
    });
  }

  function _getparams(data) {
    data = data || pageview.options;
    return {
      area: data.area == null ? null : [data.area.name],
      station: data.station == null ? null : [data.station.name],
      device: data.device == null ? null : [data.device.name],
      signal:
        data.signal == null ? null : [String.format("%{0}%", data.signal)],
      alarmLevel: data.level,
    };
  }

  function _getselectvalue(data) {
    return isNull(data) === true ? "-1" : data.id.toString();
  }

  function _empty() {
    router.$("#pylon-app-alarm-list").html("");
    router
      .$(".overlist .bui-scroll-foot")
      .html(
        '<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>'
      );
  }

  function _more(content) {
    router.$("#pylon-app-alarm-list").html(content);
    router
      .$(".overlist .bui-scroll-foot")
      .html('<div class="nomore">没有更多内容</div>');
  }

  pageview.init();
  return pageview;
});
