loader.define(function (require, exports, module) {
  var pageview = {
    name: "数据机房监控系统",
    request: null,
    maintab: null,
    loading: null,
    timer: null,
    params: null,
    increment: 0,
  };

  pageview.init = function () {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: ".main-page",
        text: "正在加载",
      });
    }

    if (isNull(this.maintab) === true) {
      this.maintab = bui.tab({
        id: "#app-main-tab-container",
        menu: "#app-main-tab-nav",
        animate: false,
        swipe: false,
        autoload: true,
        onBeforeTo: function (e) {
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
        },
      });

      this.maintab.on("to", function (index) {
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

  pageview.load = function () {
    if (this.request == null) {
      return false;
    }

    _cleartimer();
    _hidebadges(true);
    _loaddata(
      function (data) {
        _settimer(200);
        _loadhome();
      },
      function (err) {
        warning(err);
      }
    );
  };

  pageview.refresh = function (success, failure, done) {
    _cleartimer();
    _hidebadges(true);
    _loaddata(
      function (data) {
        _settimer(200);
        success(data);
      },
      function (err) {
        failure(err);
      },
      done
    );
  };

  pageview.dispose = function () {
    this.totab(0, "none");
    this.params = null;
    _cleartimer();
  };

  pageview.message = function () {
    this.request.Post(
      { url: "GetRealMessage" },
      function (result) {
        var counter = result.data.TotalCountor;
        if (isNull(counter) === false) {
          loader.require(["pages/main/home"], function (mod) {
            mod.load({
              level1: counter.AL1Count,
              level2: counter.AL2Count,
              level3: counter.AL3Count,
              level4: counter.AL4Count,
            });
          });
        }

        var index = pageview.maintab.index();
        if (index !== 2) {
          pageview.increment += result.data.NewAlarmNumber;
          _hidebadges(pageview.increment <= 0);
        }
      },
      function (err) {},
      function () {
        _cleartimer();
        _settimer();
      }
    );
  };

  pageview.totab = function (index, transition) {
    if (isNull(transition) === true) {
      this.maintab.to(index);
    } else {
      this.maintab.to(index, transition);
    }
  };

  pageview.setparams = function (params) {
    if (isNull(params) === false) {
      this.params = params;
    } else {
      this.params = null;
    }
  };

  function _loaddata(success, failure, done) {
    loadData(
      function () {
        pageview.loading.show();
      },
      success,
      failure,
      function () {
        pageview.loading.hide();
        if (isFunction(done) === true) {
          done();
        }
      }
    );
  }

  function _settimer(timeout) {
    pageview.timer = setTimeout(function () {
      pageview.message();
    }, timeout || 10000);
  }

  function _cleartimer() {
    if (isNull(pageview.timer) === false) {
      clearTimeout(pageview.timer);
      pageview.timer = null;
    }
  }

  function _hidebadges(hidden, num) {
    router.$("#pylon-app-main-alarm").html(hidden === true ? "" : String.format('<span class="bui-badges">{0}</span>', _getbadges(num)));
  }

  function _loadhome() {
    loader.require(["pages/main/home"], function (mod) {});
  }

  function _dishome() {
    loader.require(["pages/main/home"], function (mod) {
      mod.dispose();
    });
  }

  function _loadactdata() {
    loader.require(["pages/main/data"], function (mod) {
      mod.load();
    });
  }

  function _disactdata() {
    loader.require(["pages/main/data"], function (mod) {
      mod.dispose();
    });
  }

  function _loadalarm() {
    _hidebadges(true);
    pageview.increment = 0;
    loader.require(["pages/main/alarm"], function (mod) {
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
    loader.require(["pages/main/alarm"], function (mod) {
      mod.dispose();
    });
  }

  function _loaduser() {
    loader.require(["pages/main/user"], function (mod) {
      mod.load();
    });
  }

  function _disuser() {
    loader.require(["pages/main/user"], function (mod) {
      mod.dispose();
    });
  }

  function _getbadges(num) {
    if (isNull(num) === true) {
      return "";
    }

    if (num <= 0) {
      return "";
    }

    if (num > 99) {
      return "99+";
    }

    return num.toString();
  }

  pageview.init();
  pageview.load();
  return pageview;
});
