loader.define(function(require, exports, module) {
  var pageview = {
    name: "数据机房监控系统",
    request: null,
    maintab: null,
    loading: null,
    timer: null,
    params: null
  };

  pageview.init = function() {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: ".main-page",
        text: "正在加载"
      });
    }

    if (isNull(this.maintab) === true) {
      this.maintab = bui.tab({
        id: "#app-main-tab-container",
        menu: "#app-main-tab-nav",
        animate: false,
        swipe: false,
        autoload: true,
        onBeforeTo: function(e) {
          switch (e.prevIndex) {
            case 0:
              _dishome();
              break;
            case 1:
              _disactdata();
              break;
            case 2:
              _disalarm();
              break;
            case 3:
              _disuser();
              break;
          }
        }
      });

      this.maintab.on("to", function(index) {
        switch (index) {
          case 0:
            _loadhome();
            break;
          case 1:
            _loadactdata();
            break;
          case 2:
            _loadalarm();
            break;
          case 3:
            _loaduser();
            break;
        }
      });
    }
  };

  pageview.load = function() {
    if (this.request == null) {
      return false;
    }

    _cleartimer();
    _hidebadges(true);
    _loaddata(
      function(data) {
        _settimer();
        _loadhome();
      },
      function(err) {
        warning(err);
      }
    );
  };

  pageview.refresh = function(success, failure, done) {
    _cleartimer();
    _hidebadges(true);
    _loaddata(
      function(data) {
        _settimer();
        success(data);
      },
      function(err) {
        failure(err);
      },
      done
    );
  };

  pageview.dispose = function() {
    this.totab(0, "none");
    this.params = null;
    _cleartimer();
  };

  pageview.incalarm = function() {
    this.request.Post(
      "getrealalarm",
      null,
      function(result) {
        var increment = result.data;
        if ($.isArray(increment) === false) {
          return;
        }

        if (increment.length === 0) {
          return;
        }

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
          pageview.updalarm(alarms);
        }
      },
      function(err) {},
      function() {
        _cleartimer();
        _settimer();
      }
    );
  };

  pageview.updalarm = function(total) {
    _hidebadges(false);
    if (isNull(this.maintab) === false) {
      var index = this.maintab.index();
      if (index === 0) {
        loader.require(["pages/main/home"], function(mod) {
          mod.load(total);
        });
      } else if (index === 2) {
        loader.require(["pages/main/alarm"], function(mod) {
          mod.reload(total);
        });
      }
    }
  };

  pageview.totab = function(index, transition) {
    if (isNull(transition) === true) {
      this.maintab.to(index);
    } else {
      this.maintab.to(index, transition);
    }
  };

  pageview.setparams = function(params) {
    if (isNull(params) === false) {
      this.params = params;
    } else {
      this.params = null;
    }
  };

  function _loaddata(success, failure, done) {
    var _loading = pageview.loading;
    loadData(
      function() {
        _loading.show();
      },
      success,
      failure,
      function() {
        _loading.hide();
        if (done && typeof done == "function") {
          done();
        }
      }
    );
  }

  function _settimer() {
    pageview.timer = setTimeout(function() {
      pageview.incalarm();
    }, 10000);
  }

  function _cleartimer() {
    if (isNull(pageview.timer) === false) {
      clearTimeout(pageview.timer);
      pageview.timer = null;
    }
  }

  function _hidebadges(hidden) {
    if (hidden === true) {
      $("#pylon-app-main-alarm > span.bui-badges").remove();
    } else {
      $("#pylon-app-main-alarm").html('<span class="bui-badges"></span>');
    }
  }

  function _loadhome() {
    loader.require(["pages/main/home"], function(mod) {
      mod.load();
    });
  }

  function _dishome() {
    loader.require(["pages/main/home"], function(mod) {
      mod.dispose();
    });
  }

  function _loadactdata() {
    loader.require(["pages/main/data"], function(mod) {
      mod.refresh();
    });
  }

  function _disactdata() {
    loader.require(["pages/main/data"], function(mod) {
      mod.dispose();
    });
  }

  function _loadalarm() {
    _hidebadges(true);
    loader.require(["pages/main/alarm"], function(mod) {
      if (isNull(pageview.params) === false) {
        mod.condition(pageview.params.data);
        if (pageview.params.once === true) {
          pageview.params = null;
        }
      }

      mod.load();
    });
  }

  function _disalarm() {
    loader.require(["pages/main/alarm"], function(mod) {
      mod.dispose();
    });
  }

  function _loaduser() {
    loader.require(["pages/main/user"], function(mod) {
      mod.load();
    });
  }

  function _disuser() {
    loader.require(["pages/main/user"], function(mod) {
      mod.dispose();
    });
  }

  pageview.init();
  pageview.load();
  return pageview;
});
