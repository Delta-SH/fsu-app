// 全局变量
//bui.isWebapp = false;
window.router = bui.router();
window.storage = bui.storage();
window.session = {
  driver: function () {
    return window.sessionStorage;
  },
  get: function (key) {
    return this.driver().getItem(key);
  },
  set: function (key, data) {
    return this.driver().setItem(key, data);
  },
  remove: function (key) {
    return this.driver().removeItem(key);
  },
  clear: function () {
    return this.driver().clear();
  },
  each: function (fn) {
    for (var i = this.driver().length - 1; i >= 0; i--) {
      var key = this.driver().key(i);
      fn(this.get(key), key);
    }
  },
};
window.$level = {
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
};
window.$state = {
  S0: 0,
  S1: 1,
  S2: 2,
  S3: 3,
  S4: 4,
  S5: 5,
  S6: 6,
  S7: 7,
};
window.$node = {
  DI: {
    id: 0,
    name: "遥信信号",
  },
  AI: {
    id: 1,
    name: "遥测信号",
  },
  DO: {
    id: 2,
    name: "遥控信号",
  },
  AO: {
    id: 3,
    name: "遥调信号",
  },
  CI: {
    id: 4,
    name: "计数信号",
  },
  SI: {
    id: 5,
    name: "字符输入",
  },
  SO: {
    id: 6,
    name: "字符输出",
  },
  VI: {
    id: 7,
    name: "视频输入",
  },
  VO: {
    id: 8,
    name: "视频输出",
  },
  ADI: {
    id: 9,
    name: "音频输入",
  },
  ADO: {
    id: 10,
    name: "音频输出",
  },
};
window.$ssh = {
  Area: 0,
  Station: 1,
  Storey: 2,
  Room: 3,
  Frame: 4,
  Device: 5,
};
window.$appRequest = null;
window.$appAuthType = null;
window.$appAuthTypeKey = "pylon.app.session.appauthtype";
window.$appRequestKey = "pylon.app.session.apprequest";
window.$areaKey = "pylon.app.session.area";
window.$stationKey = "pylon.app.session.station";
window.$rememberKey = "pylon.app.local.remember";

bui.ready(function () {
  router.init({
    id: "#bui-router",
    firstAnimate: true,
    progress: true,
    hash: true,
    errorPage: "404.html",
  });

  bui
    .btn({
      id: "#bui-router",
      handle: ".bui-btn,a",
    })
    .load();

  $("#bui-router").on("click", ".btn-back", function (e) {
    bui.back({
      beforeBack: function (e) {
        if (isNull(e.target) === true) {
          return false;
        }

        dispose(e.target);
        return true;
      },
    });
  });

  if (window.plus) {
    plusReady();
  } else {
    document.addEventListener("plusready", plusReady, false);
  }

  function plusReady() {
    plus.key.addEventListener("backbutton", function () {
      if (plus.os.name === "Android") {
        bui.back({
          beforeBack: function (e) {
            if (isNull(e.target) === true) {
              return false;
            }

            dispose(e.target);
            if (e.target.name === "pages/login/login") {
              plus.runtime.quit();
              return false;
            }

            return true;
          },
        });
      } else {
        plus.nativeUI.toast("请按Home键切换应用");
      }
    });
  }
});

// 自定义函数
function AppRequest(ip, user, token) {
  var _this = this;
  var _ip = ip;
  var _user = user;
  var _token = token;

  _this.GetUser = function () {
    return _user;
  };
  _this.SetUser = function (val) {
    _user = val;
  };
  _this.GetIP = function () {
    return _ip;
  };
  _this.SetIP = function (val) {
    _ip = val;
  };
  _this.GetToken = function () {
    return _token;
  };
  _this.SetToken = function (val) {
    _token = val;
  };
  _this.GetPath = function () {
    return String.format("http://{0}/api/app/", _ip);
  };
  _this.GetList = function (params, resolve, reject, done) {
    var config = {
      url: "",
      data: {},
      baseUrl: _this.GetPath(),
      method: "POST",
      timeout: 30000,
      pageSize: 20,
      contentType: "application/json",
      cache: false,
      needJsonString: true,
      headers: {
        "X-Token": _token,
      },
      field: {
        page: "page",
        size: "limit",
        data: "data",
      },
      onLoad: function (me, data) {
        try {
          if (data.code === 4002) {
            logout();
            return;
          }

          if (data.code !== 0) {
            throw new Error(data.msg || getCodeName(data.code));
          }

          resolve(data);
        } catch (err) {
          reject(err);
        } finally {
          if (isFunction(done) === true) {
            done();
          }
        }
      },
      onFail: function () {
        try {
          reject(new Error("系统开小差啦~"));
        } finally {
          if (isFunction(done) === true) {
            done();
          }
        }
      },
    };

    return bui.list($.extend(config, params || {}));
  };
  _this.Get = function (params, resolve, reject, done) {
    var config = {
      url: "",
      data: {},
      baseUrl: _this.GetPath(),
      method: "GET",
      headers: {
        "X-Token": _token,
      },
      timeout: 30000,
      dataType: "text",
      cache: false,
    };

    bui
      .ajax($.extend(config, params || {}))
      .done(function (data) {
        try {
          if (isNullOrEmpty(data, true) === true) {
            throw new Error("无效的响应");
          }

          var result = JSON.parse(data);
          if (result.code === 4002) {
            logout();
            return;
          }

          if (result.code !== 0) {
            throw new Error(result.msg || getCodeName(result.code));
          }

          resolve(result);
        } catch (err) {
          reject(err);
        }
      })
      .fail(function (xhr, status) {
        reject(new Error(status + ":" + xhr.status));
      })
      .always(function () {
        if (isFunction(done) === true) {
          done();
        }
      });
  };
  _this.Post = function (params, resolve, reject, done) {
    var config = {
      url: "",
      data: {},
      baseUrl: _this.GetPath(),
      method: "POST",
      headers: {
        "X-Token": _token,
      },
      timeout: 30000,
      dataType: "text",
      contentType: "application/json",
      cache: false,
      needJsonString: true,
    };

    bui
      .ajax($.extend(config, params || {}))
      .done(function (data) {
        try {
          if (isNullOrEmpty(data, true) === true) {
            throw new Error("无效的响应");
          }

          var result = JSON.parse(data);
          if (result.code === 4002) {
            logout();
            return;
          }

          if (result.code !== 0) {
            throw new Error(result.msg || getCodeName(result.code));
          }

          resolve(result);
        } catch (err) {
          reject(err);
        }
      })
      .fail(function (xhr, status) {
        reject(new Error("系统开小差啦~"));
      })
      .always(function () {
        if (isFunction(done) === true) {
          done();
        }
      });
  };
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
    setTimeout(function () {
      logout();
    }, 200);
  }

  return $appRequest;
}

function setAppRequest(data) {
  session.set($appRequestKey, JSON.stringify(data));
}

function getAppAuthType() {
  if (isNull($appAuthType) === false) {
    return $appAuthType;
  }

  var data = session.get($appAuthTypeKey);
  if (isNullOrEmpty(data, true) === false) {
    return ($appAuthType = parseInt(data));
  }

  return $ssh.Area;
}

function setAppAuthType(auth) {
  session.set($appAuthTypeKey, auth);
}

function removeAppRequest() {
  $appRequest = null;
  session.remove($appRequestKey);
}

function removeAppAuthType() {
  $appAuthType = null;
  session.remove($appAuthTypeKey);
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

  setAppAuthType(($appAuthType = data.length > 0 ? $ssh.Area : $ssh.Station));
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

function loadData(before, done, fail, always) {
  if (isFunction(before) === true) {
    if (before() === false) {
      return false;
    }
  }

  $.when(getAllAreasTask(), getAllStationsTask())
    .done(function (v1, v2) {
      setAreas(v1);
      setStations(v2);
      done({ data1: v1, data2: v2 });
    })
    .fail(fail)
    .always(function () {
      if (isFunction(always) === true) {
        always();
      }
    });
}

function getAllAreas(params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest();
    appRequest.Post(
      $.extend(
        {
          url: "GetAreas",
          data: { id: null },
        },
        params || {}
      ),
      function (result) {
        resolve(result.data);
      },
      function (err) {
        reject(err.message);
      },
      done
    );
  } catch (err) {
    reject(err.message);
  }
}

function getAllAreasTask(params) {
  var dtd = $.Deferred();
  try {
    getAllAreas(
      params || {},
      function (data) {
        dtd.resolve(data);
      },
      function (err) {
        dtd.reject(err.message);
      }
    );
  } catch (err) {
    dtd.reject(err.message);
  }

  return dtd.promise();
}

function getAllStations(params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest();
    appRequest.Post(
      $.extend(
        {
          url: "GetStations",
          data: { id: null },
        },
        params || {}
      ),
      function (result) {
        resolve(result.data);
      },
      function (err) {
        reject(err.message);
      },
      done
    );
  } catch (err) {
    reject(err.message);
  }
}

function getAllStationsTask(params) {
  var dtd = $.Deferred();
  try {
    getAllStations(
      params || {},
      function (data) {
        dtd.resolve(data);
      },
      function (err) {
        dtd.reject(err.message);
      }
    );
  } catch (err) {
    dtd.reject(err.message);
  }

  return dtd.promise();
}

function getStation(id, params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest();
    appRequest.Post(
      $.extend(
        {
          url: "GetStations",
          data: { id: [id] },
        },
        params || {}
      ),
      function (result) {
        if (result.data.length > 0) {
          resolve(result.data[0]);
        } else {
          throw new Error("未查找到对象");
        }
      },
      function (err) {
        reject(err.message);
      },
      done
    );
  } catch (err) {
    reject(err.message);
  }
}

function getStationTask(id, params) {
  var dtd = $.Deferred();
  try {
    getStation(
      id,
      params || {},
      function (data) {
        dtd.resolve(data);
      },
      function (err) {
        dtd.reject(err.message);
      }
    );
  } catch (err) {
    dtd.reject(err.message);
  }

  return dtd.promise();
}

function getDevice(id, params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest();
    appRequest.Post(
      $.extend(
        {
          url: "GetDevices",
          data: { id: [id] },
        },
        params || {}
      ),
      function (result) {
        if (result.data.length > 0) {
          resolve(result.data[0]);
        } else {
          throw new Error("未查找到对象");
        }
      },
      function (err) {
        reject(err.message);
      },
      done
    );
  } catch (err) {
    reject(err.message);
  }
}

function getDeviceTask(id, params) {
  var dtd = $.Deferred();
  try {
    getDevice(
      id,
      params || {},
      function (data) {
        dtd.resolve(data);
      },
      function (err) {
        dtd.reject(err.message);
      }
    );
  } catch (err) {
    dtd.reject(err.message);
  }

  return dtd.promise();
}

function getAllDevices(params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest();
    appRequest.Post(
      $.extend(
        {
          url: "GetDevices",
          data: { id: null },
        },
        params || {}
      ),
      function (result) {
        resolve(result.data);
      },
      function (err) {
        reject(err.message);
      },
      done
    );
  } catch (err) {
    reject(err.message);
  }
}

function getVDevices(params, resolve, reject, done) {
  try {
    getAllDevices(
      params,
      function (data) {
        var devices = [];
        $.each(data, function (index, item) {
          if (item.Type === "影音设备") {
            devices.push(item);
          }
        });
        resolve(devices);
      },
      reject,
      done
    );
  } catch (err) {
    reject(err.message);
  }
}

function getXDevices(params, resolve, reject, done) {
  try {
    getAllDevices(
      params,
      function (data) {
        var devices = [];
        $.each(data, function (index, item) {
          if (item.Type !== "影音设备") {
            devices.push(item);
          }
        });
        resolve(devices);
      },
      reject,
      done
    );
  } catch (err) {
    reject(err.message);
  }
}

function getVDevicesTask(params) {
  var dtd = $.Deferred();
  try {
    getVDevices(
      params || {},
      function (data) {
        dtd.resolve(data);
      },
      function (err) {
        dtd.reject(err.message);
      }
    );
  } catch (err) {
    dtd.reject(err.message);
  }

  return dtd.promise();
}

function getXDevicesTask(params) {
  var dtd = $.Deferred();
  try {
    getXDevices(
      params || {},
      function (data) {
        dtd.resolve(data);
      },
      function (err) {
        dtd.reject(err.message);
      }
    );
  } catch (err) {
    dtd.reject(err.message);
  }

  return dtd.promise();
}

function getAllDevicesByPid(pid, params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest();
    appRequest.Post(
      $.extend(
        {
          url: "GetDevicesByPID",
          data: { id: pid },
        },
        params || {}
      ),
      function (result) {
        resolve(result.data);
      },
      function (err) {
        reject(err.message);
      },
      done
    );
  } catch (err) {
    reject(err.message);
  }
}

function getVDevicesByPid(pid, params, resolve, reject, done) {
  try {
    getAllDevicesByPid(
      pid,
      params,
      function (data) {
        var devices = [];
        $.each(data, function (index, item) {
          if (item.Type === "影音设备") {
            devices.push(item);
          }
        });
        resolve(devices);
      },
      reject,
      done
    );
  } catch (err) {
    reject(err.message);
  }
}

function getXDevicesByPid(pid, params, resolve, reject, done) {
  try {
    getAllDevicesByPid(
      pid,
      params,
      function (data) {
        var devices = [];
        $.each(data, function (index, item) {
          if (item.Type !== "影音设备") {
            devices.push(item);
          }
        });
        resolve(devices);
      },
      reject,
      done
    );
  } catch (err) {
    reject(err.message);
  }
}

function getVDevicesByPidTask(pid, params) {
  var dtd = $.Deferred();
  try {
    getVDevicesByPid(
      pid,
      params || {},
      function (data) {
        dtd.resolve(data);
      },
      function (err) {
        dtd.reject(err.message);
      }
    );
  } catch (err) {
    dtd.reject(err.message);
  }

  return dtd.promise();
}

function getXDevicesByPidTask(pid, params) {
  var dtd = $.Deferred();
  try {
    getXDevicesByPid(
      pid,
      params || {},
      function (data) {
        dtd.resolve(data);
      },
      function (err) {
        dtd.reject(err.message);
      }
    );
  } catch (err) {
    dtd.reject(err.message);
  }

  return dtd.promise();
}

function getAllSignalsByPid(pid, params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest();
    appRequest.Post(
      $.extend(
        {
          url: "GetSignalsByPID",
          data: { id: pid },
        },
        params || {}
      ),
      function (result) {
        resolve(result.data);
      },
      function (err) {
        reject(err.message);
      },
      done
    );
  } catch (err) {
    reject(err.message);
  }
}

function getAllSignalsByPidTask(pid, params) {
  var dtd = $.Deferred();
  try {
    getAllSignalsByPid(
      pid,
      params || {},
      function (data) {
        dtd.resolve(data);
      },
      function (err) {
        dtd.reject(err.message);
      }
    );
  } catch (err) {
    dtd.reject(err.message);
  }

  return dtd.promise();
}

function getAllAlarms(params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest();
    appRequest.Post(
      {
        url: "GetActAlarms",
        data: $.extend(
          {
            sortAttribute: 7,
            sortMode: 2,
            id: 0,
            area: null,
            station: null,
            device: null,
            signal: null,
            alarmLevel: null,
            alarmDesc: null,
          },
          params || {}
        ),
      },
      function (result) {
        resolve(result.data);
      },
      function (err) {
        reject(err.message);
      },
      done
    );
  } catch (err) {
    reject(err.message);
  }
}

function success(message, timeout) {
  bui.hint({
    content: String.format("<i class='appiconfont appicon-ok'></i><span>{0}</span>", message),
    timeout: timeout || 2000,
    skin: "success",
  });
}

function warning(message, timeout) {
  bui.hint({
    content: String.format("<i class='appiconfont appicon-delete'></i><span>{0}</span>", message),
    timeout: timeout || 2000,
    skin: "danger",
  });
}

function successdialog(message, detail) {
  detail = isNullOrEmpty(detail) === true ? "" : String.format("<p>{0}</p>", detail);
  bui.confirm({
    title: "",
    height: 400,
    autoClose: true,
    content: `<div><i class="appiconfont appicon-confirmed success"></i><h3>${message}</h3>${detail}</div>`,
    buttons: [
      {
        name: "我知道了",
        className: "primary-reverse",
      },
    ],
  });
}

function warningdialog(message, detail) {
  detail = isNullOrEmpty(detail) === true ? "" : String.format("<p>{0}</p>", detail);
  bui.confirm({
    title: "",
    height: 400,
    autoClose: true,
    content: `<div><i class="appiconfont appicon-error danger"></i><h3>${message}</h3>${detail}</div>`,
    buttons: [
      {
        name: "我知道了",
        className: "danger-reverse",
      },
    ],
  });
}

function dispose(target) {
  loader.require(target.name, function (mod) {
    mod.dispose();
  });
}

function logout() {
  loader.require(["main"], function (mod) {
    mod.dispose();
    sayGoodbye();
    session.clear();
    bui.load({
      url: "pages/login/login",
      effect: "zoom",
      callback: function () {
        window.setTimeout(function () {
          window.location.reload();
        }, 100);
      },
    });
  });
}

function sayGoodbye() {
  var request = getAppRequest(false);
  if (request != null) {
    request.Post(
      {
        url: "Logout",
        timeout: 5000,
      },
      function (result) {},
      function (err) {}
    );
  }
}

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

function getNodeName(node) {
  switch (node) {
    case 0:
      return "区域";
    case 1:
      return "站点";
    case 2:
      return "楼层";
    case 3:
      return "机房";
    case 4:
      return "机架";
    case 5:
      return "设备";
    case 6:
      return "信号";
    default:
      return "未定义";
  }
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

function getNodeValue(type, value, desc) {
  if (type === $node.AI.id || type === $node.AO.id || type === $node.CI.id) {
    return String.format("{0} {1}", value, desc);
  }

  if (type === $node.DI.id || type === $node.DO.id) {
    var unit = "未定义";
    var keys = desc.split(";");
    $.each(keys, function (index, item) {
      var values = item.split("&");
      if (values.length !== 2) return true;

      if (values[0].trim() == value) {
        unit = values[1].trim();
        return false;
      }
    });
    return unit;
  }

  return value;
}

function getUnits(desc) {
  var data = [];
  var pairs = desc.split(";");
  $.each(pairs, function (index, item) {
    var _values = item.split("&");
    if (_values.length !== 2) return true;

    data.push({
      id: _values[0].trim(),
      name: _values[1].trim(),
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
  opt.onInput = option.onInput || function () {};
  opt.callback = option.callback || function () {};
  if (opt.id == "" || opt.id === null) {
    return;
  }

  var $id = $(opt.id),
    $target = $id.find(opt.target),
    iconClass = "." + opt.icon;

  $target.on(
    opt.event,
    bui.unit.debounce(function () {
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
  $target.on("focus", function () {
    $id.find(iconClass).css("display", "none");
    $(this).next().css("display", "block");
  });
  $id.on("click", iconClass, function () {
    opt.callback && opt.callback.call(this);
  });
}

function getTimespan(start, end) {
  var from = bui.date.convert(start);
  var to = isNull(end) ? new Date() : bui.date.convert(end);
  var diff = (to - from) / 1000;
  if (diff < 0) diff = 0;

  var hours = parseInt(diff / 3600);
  var minutes = parseInt((diff % 3600) / 60);
  var seconds = parseInt(diff % 60);
  return String.format("{0}小时{1}分{2}秒", hours, minutes > 9 ? minutes : "0" + minutes, seconds > 9 ? seconds : "0" + seconds);
}
