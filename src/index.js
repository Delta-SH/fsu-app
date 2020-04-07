// 全局变量
//bui.isWebapp = false;
window.router = bui.router();
window.storage = bui.storage();
window.session = {
  driver: function() {
    return window.sessionStorage;
  },
  get: function(key) {
    return this.driver().getItem(key);
  },
  set: function(key, data) {
    return this.driver().setItem(key, data);
  },
  remove: function(key) {
    return this.driver().removeItem(key);
  },
  clear: function() {
    return this.driver().clear();
  },
  each: function(fn) {
    for (var i = this.driver().length - 1; i >= 0; i--) {
      var key = this.driver().key(i);
      fn(this.get(key), key);
    }
  }
};
window.$level = {
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4
};
window.$state = {
  S0: 0,
  S1: 1,
  S2: 2,
  S3: 3,
  S4: 4,
  S5: 5,
  S6: 6,
  S7: 7
};
window.$node = {
  DO: {
    id: 2,
    name: "遥控"
  },
  AO: {
    id: 3,
    name: "遥调"
  },
  AI: {
    id: 1,
    name: "遥测"
  },
  DI: {
    id: 0,
    name: "遥信"
  }
};
window.$auth = {
  Area: 0,
  Station: 1
};
window.$appRequest = null;
window.$appAuthLevel = 0;
window.$appRequestKey = "pylon.app.session.apprequest";
window.$areaKey = "pylon.app.session.area";
window.$stationKey = "pylon.app.session.station";
window.$deviceKey = "pylon.app.session.device";
window.$alarmKey = "pylon.app.session.alarm";
window.$rememberKey = "pylon.app.local.remember";

bui.ready(function() {
  router.init({
    id: "#bui-router",
    firstAnimate: true,
    progress: true,
    reloadCache: false
  });

  // router.on("loadfail", function() {
  //   router.load({ url: "404.html" });
  // });

  bui
    .btn({
      id: "#bui-router",
      handle: ".bui-btn,a"
    })
    .load();

  $("#bui-router").on("click", ".btn-back", function(e) {
    bui.back({
      beforeBack: function(e) {
        if (isNull(e.target) === true) return false;

        dispose(e.target);
        return true;
      }
    });
  });

  if (window.plus) {
    plusReady();
  } else {
    document.addEventListener("plusready", plusReady, false);
  }

  function plusReady() {
    plus.key.addEventListener("backbutton", function() {
      if (plus.os.name === "Android") {
        bui.back({
          beforeBack: function(e) {
            if (isNull(e.target) === true) return false;

            dispose(e.target);
            if (e.target.pid === "pages/login/login") {
              plus.runtime.quit();
              return false;
            }

            return true;
          }
        });
      } else {
        plus.nativeUI.toast("请按Home键切换应用");
      }
    });
  }
});

// BUI函数
function AppRequest(ip, user, token) {
  var _this = this;
  var _ip = ip;
  var _user = user;
  var _token = token;
  var _path = "";
  var _auth = "X-Token";
  var _timeout = 30000;

  _this.GetUser = function() {
    return _user;
  };
  _this.SetUser = function(val) {
    _user = val;
  };
  _this.GetIP = function() {
    return _ip;
  };
  _this.SetIP = function(val) {
    _ip = val;
    setPath();
  };
  _this.GetToken = function() {
    return _token;
  };
  _this.SetToken = function(val) {
    _token = val;
  };
  _this.GetPath = function() {
    return _path;
  };
  var setPath = function() {
    _path = String.format("http://{0}/api/app", _ip);
  };
  _this.Get = function(api, params, resolve, reject, done) {
    var config = {
      url: String.format("{0}/{1}", _path, api),
      timeout: _timeout,
      type: "get",
      dataType: "text",
      crossDomain: true,
      contentType: "application/json;charset=UTF-8",
      beforeSend: function(xhr) {
        xhr.setRequestHeader(_auth, _token);
      },
      success: function(data) {
        try {
          if (isNullOrEmpty(data, true) === true) {
            throw new Error("无效的响应");
          }

          var result = JSON.parse(data);
          if (result.code === 4002) {
            logout();
          }

          if (result.code !== 0) {
            throw new Error(result.msg || getCodeName(result.code));
          }

          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      error: function(xhr, status, error) {
        reject(new Error(xhr.status + ":" + xhr.statusText + " " + xhr.responseText));
      }
    };

    $.ajax($.extend(config, params || {})).always(function() {
      if (done && typeof done == "function") {
        done();
      }
    });
  };
  _this.Post = function(api, params, resolve, reject, done) {
    var config = {
      url: String.format("{0}/{1}", _path, api),
      timeout: _timeout,
      type: "post",
      dataType: "text",
      crossDomain: true,
      contentType: "application/json;charset=UTF-8",
      beforeSend: function(xhr) {
        xhr.setRequestHeader(_auth, _token);
      },
      success: function(data) {
        try {
          if (isNullOrEmpty(data, true) === true) {
            throw new Error("无效的响应");
          }

          var result = JSON.parse(data);
          if (result.code === 4002) {
            logout();
          }

          if (result.code !== 0) {
            throw new Error(result.msg || getCodeName(result.code));
          }

          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      error: function(xhr, status, error) {
        reject(new Error(xhr.status + ":" + xhr.statusText + " " + xhr.responseText));
      }
    };

    $.ajax($.extend(config, params || {})).always(function() {
      if (done && typeof done == "function") {
        done();
      }
    });
  };

  setPath();
}

function getAppRequest(nologout) {
  if (isNull($appRequest) === false) {
    return $appRequest;
  }

  var data = session.get($appRequestKey);
  if (isNullOrEmpty(data, true) === false) {
    var val = JSON.parse(data);
    $appRequest = new AppRequest(val.ip, val.user, val.token);
    return $appRequest;
  }

  $appRequest = null;
  if (nologout !== false) {
    setTimeout(function() {
      logout();
    }, 200);
  }

  return $appRequest;
}

function setAppRequest(data) {
  session.set($appRequestKey, JSON.stringify(data));
}

function removeAppRequest() {
  $appRequest = null;
  session.remove($appRequestKey);
}

function getRemember() {
  return storage.get($rememberKey, 0);
}

function setRemember(data) {
  storage.set($rememberKey, data);
}

function getAreas() {
  var data = session.get($areaKey);
  if (isNullOrEmpty(data, true) === true) {
    return [];
  }

  return JSON.parse(data);
}

function setAreas(data) {
  if (isNull(data) === true) {
    data = [];
  }

  $appAuthLevel = data.length > 0 ? $auth.Area : $auth.Station;
  session.set($areaKey, JSON.stringify(data));
}

function getStations() {
  var data = session.get($stationKey);
  if (isNullOrEmpty(data, true) === true) {
    return [];
  }

  return JSON.parse(data);
}

function setStations(data) {
  if (isNull(data) === true) {
    data = [];
  }

  session.set($stationKey, JSON.stringify(data));
}

function getDevices() {
  var data = session.get($deviceKey);
  if (isNullOrEmpty(data, true) === true) {
    return [];
  }

  return JSON.parse(data);
}

function setDevices(data) {
  if (isNull(data) === true) {
    data = [];
  }

  session.set($deviceKey, JSON.stringify(data));
}

function getAlarms() {
  var data = session.get($alarmKey);
  if (isNullOrEmpty(data, true) === true) {
    return [];
  }

  return JSON.parse(data);
}

function setAlarms(data) {
  if (isNull(data) === true) {
    data = [];
  }

  session.set($alarmKey, JSON.stringify(data));
}

function loadData(before, done, fail, always) {
  before();
  $.when(areaTask(), stationTask(), deviceTask(), alarmTask())
    .done(function(v1, v2, v3, v4) {
      done({
        data1: v1,
        data2: v2,
        data3: v3,
        data4: v4
      });
    })
    .fail(fail)
    .always(always);
}

function areaTask() {
  var dtd = $.Deferred();
  try {
    var appRequest = getAppRequest();
    storage.remove($areaKey);
    appRequest.Post(
      "getareas",
      null,
      function(result) {
        setAreas(result.data);
        dtd.resolve(result.data);
      },
      function(err) {
        dtd.reject(err.message);
      }
    );
  } catch (err) {
    dtd.reject(err.message);
  }

  return dtd.promise();
}

function stationTask() {
  var dtd = $.Deferred();
  try {
    var appRequest = getAppRequest();
    storage.remove($stationKey);
    appRequest.Post(
      "getstations",
      null,
      function(result) {
        setStations(result.data);
        dtd.resolve(result.data);
      },
      function(err) {
        dtd.reject(err.message);
      }
    );
  } catch (err) {
    dtd.reject(err.message);
  }

  return dtd.promise();
}

function deviceTask() {
  var dtd = $.Deferred();
  try {
    var appRequest = getAppRequest();
    storage.remove($deviceKey);
    appRequest.Post(
      "getdevices",
      null,
      function(result) {
        setDevices(result.data);
        dtd.resolve(result.data);
      },
      function(err) {
        dtd.reject(err.message);
      }
    );
  } catch (err) {
    dtd.reject(err.message);
  }

  return dtd.promise();
}

function alarmTask() {
  var dtd = $.Deferred();
  try {
    var appRequest = getAppRequest();
    storage.remove($alarmKey);
    appRequest.Post(
      "getactalarm",
      null,
      function(result) {
        setAlarms(result.data);
        dtd.resolve(result.data);
      },
      function(err) {
        dtd.reject(err.message);
      }
    );
  } catch (err) {
    dtd.reject(err.message);
  }

  return dtd.promise();
}

function success(message, timeout) {
  bui.hint({
    content: String.format("<i class='icon-success'></i>{0}", message),
    timeout: timeout || 2000,
    skin: "success"
  });
}

function warning(message, timeout) {
  bui.hint({
    content: String.format("<i class='icon-info'></i>{0}", message),
    timeout: timeout || 2000,
    skin: "danger"
  });
}

function successdialog(message, detail) {
  bui.confirm({
    title: "",
    height: 400,
    autoClose: true,
    content: `<div class="bui-box-center"><i class="icon-successfill success"></i><h3>${message}</h3><p>${detail}</p></div>`,
    buttons: [
      {
        name: "我知道了",
        className: "primary-reverse"
      }
    ]
  });
}

function warningdialog(message, detail) {
  bui.confirm({
    title: "",
    height: 400,
    autoClose: true,
    content: `<div class="bui-box-center"><i class="icon-errorfill danger"></i><h3>${message}</h3><p>${detail}</p></div>`,
    buttons: [
      {
        name: "我知道了",
        className: "primary-reverse"
      }
    ]
  });
}

function dispose(target) {
  loader.require(target.pid, function(mod) {
    mod.dispose();
  });
}

function logout() {
  loader.require(["main"], function(mod) {
    mod.dispose();
    bui.load({
      url: "pages/login/login",
      effect: "zoom"
    });
  });
}

// 自定义函数
function getAlarmCls1(level) {
  if (level === $level.L1) return "level1";
  else if (level === $level.L2) return "level2";
  else if (level === $level.L3) return "level3";
  else if (level === $level.L4) return "level4";
  else return "level0";
}

function getAlarmCls2(level) {
  if (level === $level.L1) return "level1-bg";
  else if (level === $level.L2) return "level2-bg";
  else if (level === $level.L3) return "level3-bg";
  else if (level === $level.L4) return "level4-bg";
  else return "level0-bg";
}

function getAlarmName(level) {
  if (level === $level.L1) return "一级告警";
  else if (level === $level.L2) return "二级告警";
  else if (level === $level.L3) return "三级告警";
  else if (level === $level.L4) return "四级告警";
  else return "正常数据";
}

function getStateCls1(state) {
  if (state === $state.S1) {
    return "state1";
  } else if (state === $state.S2) {
    return "state2";
  } else if (state === $state.S3) {
    return "state3";
  } else if (state === $state.S4) {
    return "state4";
  } else if (state === $state.S5) {
    return "state5";
  } else if (state === $state.S6) {
    return "state6";
  } else if (state === $state.S7) {
    return "state7";
  } else {
    return "state0";
  }
}

function getStateCls2(state) {
  if (state === $state.S1) {
    return "state1-bg";
  } else if (state === $state.S2) {
    return "state2-bg";
  } else if (state === $state.S3) {
    return "state3-bg";
  } else if (state === $state.S4) {
    return "state4-bg";
  } else if (state === $state.S5) {
    return "state5-bg";
  } else if (state === $state.S6) {
    return "state6-bg";
  } else if (state === $state.S7) {
    return "state7-bg";
  } else {
    return "state0-bg";
  }
}

function getStateName(state) {
  if (state === $state.S1) {
    return "一级告警";
  } else if (state === $state.S2) {
    return "二级告警";
  } else if (state === $state.S3) {
    return "三级告警";
  } else if (state === $state.S4) {
    return "四级告警";
  } else if (state === $state.S5) {
    return "操作事件";
  } else if (state === $state.S6) {
    return "无效数据";
  } else if (state === $state.S7) {
    return "通信中断";
  } else {
    return "正常数据";
  }
}

function getUnit(value, type, desc) {
  if (type == $node.DI.name || type == $node.DI.id || type == $node.DO.name || type == $node.DO.id) {
    var unit = "";
    var keys = desc.split(";");
    $.each(keys, function(index, item) {
      var values = item.split("&");
      if (values.length !== 2) return true;

      if (values[0].trim() == value) {
        unit = values[1].trim();
        return false;
      }
    });
    return unit;
  }

  return String.format("{0} {1}", value, desc);
}

function getUnits(desc) {
  var data = [];
  var pairs = desc.split(";");
  $.each(pairs, function(index, item) {
    var _values = item.split("&");
    if (_values.length !== 2) return true;

    data.push({
      id: _values[0].trim(),
      name: _values[1].trim()
    });
  });

  return data;
}

function getCodeName(code) {
  if (code === -1) {
    return "系统繁忙";
  } else if (code === 0) {
    return "请求成功";
  } else if (code === 4000) {
    return "请求失败";
  } else if (code === 4001) {
    return "鉴权失败";
  } else if (code === 4002) {
    return "Token已过期";
  } else if (code === 4003) {
    return "非法参数";
  } else if (code === 4004) {
    return "并发调用超限";
  } else if (code === 4005) {
    return "无调用权限";
  } else {
    return "未知错误";
  }
}

function onInput(option) {
  var opt = option || {};
  opt.id = option.id || "";
  opt.target = option.target || "input";
  opt.event = option.event || "keyup";
  opt.icon = option.icon || "icon-remove";
  opt.onInput = option.onInput || function() {};
  opt.callback = option.callback || function() {};
  if (opt.id == "" || opt.id === null) {
    return;
  }

  var $id = $(opt.id),
    $target = $id.find(opt.target),
    iconClass = "." + opt.icon;

  $target.on(
    opt.event,
    bui.unit.debounce(function() {
      var val = $(this).val(),
        $parent = $(this).parent(),
        $btnRemove = $parent.find(iconClass);
      if (val.length > 0) {
        if ($btnRemove && $btnRemove.length) {
          $btnRemove.css("display", "block");
        } else {
          $parent.append('<i class="' + opt.icon + '"></i>');
          $btnRemove = $target.find(iconClass);
        }
      } else {
        $btnRemove && $btnRemove.css("display", "none");
      }
      opt.onInput && opt.onInput.call(this);
    }, 100)
  );
  $target.on("focus", function() {
    $id.find(iconClass).css("display", "none");
    $(this)
      .next()
      .css("display", "block");
  });
  $id.on("click", iconClass, function() {
    opt.callback && opt.callback.call(this);
  });
}

function isNull(value) {
  return typeof value == "undefined" || value === null;
}

function isEmpty(value, whitespace) {
  return (whitespace || false) === true ? value.trim() === "" : value === "";
}

function isNullOrEmpty(value, whitespace) {
  if (isNull(value) === true) return true;
  return isEmpty(value, whitespace);
}

function getTimespan(start, end) {
  var from = moment(start);
  var to = isNull(end) ? moment() : moment(end);
  var diff = to.diff(from);
  if (diff < 0) diff = 0;
  var duration = moment.duration(diff);
  return (
    parseInt(duration.asHours(), 10) +
    ":" +
    moment([2000, 1, 1])
      .add(duration)
      .format("mm:ss")
  );
}

// 扩展方法
String.format = function() {
  if (arguments.length == 0) return null;

  var str = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    var re = new RegExp("\\{" + (i - 1) + "\\}", "gm");
    str = str.replace(re, arguments[i]);
  }

  return str;
};
String.prototype.startWith = function(value, ignoreCase) {
  if (value == null || value == "" || this.length == 0 || value.length > this.length) {
    return false;
  }

  ignoreCase = ignoreCase || false;
  if (ignoreCase === true) {
    return this.substr(0, value.length).toLowerCase() === value.toLowerCase();
  }

  return this.substr(0, value.length) === value;
};
String.prototype.endWith = function(value, ignoreCase) {
  if (value == null || value == "" || this.length == 0 || value.length > this.length) {
    return false;
  }

  ignoreCase = ignoreCase || false;
  if (ignoreCase === true) {
    return this.substr(this.length - value.length).toLowerCase() === value.toLowerCase();
  }

  return this.substr(this.length - value.length) === value;
};
