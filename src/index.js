// 全局变量
window.$appRequest = null
window.$appAuthType = null
window.$appAuthTypeKey = 'pylon.app.session.appauthtype'
window.$appRequestKey = 'pylon.app.session.apprequest'
window.$areaKey = 'pylon.app.session.area'
window.$stationKey = 'pylon.app.session.station'
window.$rememberKey = 'pylon.app.local.remember'
window.router = bui.router()
window.storage = bui.storage()
window.session = {
  driver: function () {
    return window.sessionStorage
  },
  get: function (key) {
    return this.driver().getItem(key)
  },
  set: function (key, data) {
    return this.driver().setItem(key, data)
  },
  remove: function (key) {
    return this.driver().removeItem(key)
  },
  clear: function () {
    return this.driver().clear()
  },
  each: function (fn) {
    for (var i = this.driver().length - 1; i >= 0; i--) {
      var key = this.driver().key(i)
      fn(this.get(key), key)
    }
  },
}
window.$level = {
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
}
window.$state = {
  S0: 0,
  S1: 1,
  S2: 2,
  S3: 3,
  S4: 4,
  S5: 5,
  S6: 6,
  S7: 7,
}
window.$node = {
  DI: {
    id: 0,
    name: '遥信信号',
  },
  AI: {
    id: 1,
    name: '遥测信号',
  },
  DO: {
    id: 2,
    name: '遥控信号',
  },
  AO: {
    id: 3,
    name: '遥调信号',
  },
  CI: {
    id: 4,
    name: '计数信号',
  },
  SI: {
    id: 5,
    name: '字符输入',
  },
  SO: {
    id: 6,
    name: '字符输出',
  },
  VI: {
    id: 7,
    name: '视频输入',
  },
  VO: {
    id: 8,
    name: '视频输出',
  },
  ADI: {
    id: 9,
    name: '音频输入',
  },
  ADO: {
    id: 10,
    name: '音频输出',
  },
}
window.$ssh = {
  Area: 0,
  Station: 1,
  Storey: 2,
  Room: 3,
  Frame: 4,
  Device: 5,
}

// 全局函数
window.AppRequest = function (ip, user, passwd, token) {
  var _this = this
  var _ip = ip
  var _user = user
  var _pass = passwd
  var _token = token || ''

  _this.GetUser = function () {
    return _user
  }
  _this.GetIP = function () {
    return _ip
  }
  _this.GetToken = function () {
    return _token
  }
  _this.GetPass = function () {
    return _pass
  }
  _this.GetBasePath = function () {
    return String.format('http://{0}/api/ci/rsc/', _ip)
  }
  _this.GetAuthPath = function () {
    return String.format('http://{0}/api/ci/auth/', _ip)
  }
  _this.Login = function (resolve, reject, done) {
    try {
      var tokens = _getToken()
      if (isNullOrEmpty(tokens.token, true) === true) 
        throw new Error(tokens.message)

      bui
        .ajax({
          url: 'Login',
          data: {
            uid: _user,
            pwd: md5(tokens.token + '2' + md5(_pass)),
          },
          baseUrl: _this.GetAuthPath(),
          method: 'POST',
          headers: {
            'X-Token': tokens.token,
          },
          timeout: 10000,
          dataType: 'text',
          contentType: 'application/json',
          cache: false,
          needJsonString: true,
        })
        .done(function (data) {
          try {
            if (isNullOrEmpty(data, true) === true) {
              throw new Error('无效的响应')
            }

            var result = JSON.parse(data)
            if (result.code !== 0) {
              throw new Error(result.msg || getCodeName(result.code))
            }

            _token = tokens.token
            setAppRequest({ ip: _ip, user: _user, pass: _pass, token: tokens.token })
            resolve(tokens.token)
          } catch (err) {
            reject(err)
          }
        })
        .fail(function (xhr, status) {
          reject(new Error('系统开小差啦~'))
        })
        .always(function () {
          if (isFunction(done) === true) {
            done()
          }
        })
    } catch (err) {
      try {
        reject(err)
      } finally {
        if (isFunction(done) === true) {
          done()
        }
      }
    }
  }
  _this.GetList = function (params, resolve, reject, done) {
    var config = {
      url: '',
      data: {},
      baseUrl: _this.GetBasePath(),
      method: 'POST',
      timeout: 30000,
      pageSize: 20,
      contentType: 'application/json',
      cache: false,
      needJsonString: true,
      headers: {
        'X-Token': _token,
      },
      field: {
        page: 'page',
        size: 'limit',
        data: 'data',
      },
      onLoad: function (me, data) {
        try {
          if (data.code === 4002) {
            _this.Login(
              function (token) {
                _this.GetList(params, resolve, reject, done)
              },
              function (err) {
                logout()
              }
            )
            return
          }

          if (data.code !== 0) {
            throw new Error(data.msg || getCodeName(data.code))
          }

          resolve(data)
        } catch (err) {
          reject(err)
        } finally {
          if (isFunction(done) === true) {
            done()
          }
        }
      },
      onFail: function () {
        try {
          reject(new Error('系统开小差啦~'))
        } finally {
          if (isFunction(done) === true) {
            done()
          }
        }
      },
    }

    return bui.list($.extend(config, params || {}))
  }
  _this.Get = function (params, resolve, reject, done) {
    var config = {
      url: '',
      data: {},
      baseUrl: _this.GetBasePath(),
      method: 'GET',
      headers: {
        'X-Token': _token,
      },
      timeout: 30000,
      dataType: 'text',
      cache: false,
    }

    bui
      .ajax($.extend(config, params || {}))
      .done(function (data) {
        try {
          if (isNullOrEmpty(data, true) === true) {
            throw new Error('无效的响应')
          }

          var result = JSON.parse(data)
          if (result.code === 4002) {
            _this.Login(
              function (token) {
                _this.Get(params, resolve, reject, done)
              },
              function (err) {
                logout()
              }
            )
            return
          }

          if (result.code !== 0) {
            throw new Error(result.msg || getCodeName(result.code))
          }

          resolve(result)
        } catch (err) {
          reject(err)
        }
      })
      .fail(function (xhr, status) {
        reject(new Error(status + ':' + xhr.status))
      })
      .always(function () {
        if (isFunction(done) === true) {
          done()
        }
      })
  }
  _this.Post = function (params, resolve, reject, done) {
    var config = {
      url: '',
      data: {},
      baseUrl: _this.GetBasePath(),
      method: 'POST',
      headers: {
        'X-Token': _token,
      },
      timeout: 30000,
      dataType: 'text',
      contentType: 'application/json',
      cache: false,
      needJsonString: true,
    }

    bui
      .ajax($.extend(config, params || {}))
      .done(function (data) {
        try {
          if (isNullOrEmpty(data, true) === true) {
            throw new Error('无效的响应')
          }

          var result = JSON.parse(data)
          if (result.code === 4002) {
            _this.Login(
              function (token) {
                _this.Post(params, resolve, reject, done)
              },
              function (err) {
                logout()
              }
            )
            return
          }

          if (result.code !== 0) {
            throw new Error(result.msg || getCodeName(result.code))
          }

          resolve(result)
        } catch (err) {
          reject(err)
        }
      })
      .fail(function (xhr, status) {
        reject(new Error('系统开小差啦~'))
      })
      .always(function () {
        if (isFunction(done) === true) {
          done()
        }
      })
  }

  var _getToken = function () {
    var tokens = { token: null, message: '无效的Token' }
    bui
      .ajax({
        url: 'GetToken',
        baseUrl: _this.GetAuthPath(),
        data: {},
        method: 'POST',
        timeout: 5000,
        dataType: 'text',
        contentType: 'application/json',
        cache: false,
        needJsonString: true,
        async: false,
      })
      .done(function (data) {
        try {
          if (isNullOrEmpty(data, true) === true) {
            throw new Error('无效的响应')
          }

          var result = JSON.parse(data)
          if (result.code !== 0) {
            throw new Error(result.msg || getCodeName(result.code))
          }

          tokens.token = result.token
          tokens.message = ''
        } catch (err) {
          tokens.token = null
          tokens.message = err.message
        }
      })

    return tokens
  }
}

window.getAppRequest = function (nologout) {
  if (isNull($appRequest) === false) {
    return $appRequest
  }

  var data = session.get($appRequestKey)
  if (isNullOrEmpty(data, true) === false) {
    var val = JSON.parse(data)
    $appRequest = new AppRequest(val.ip, val.user, val.pass, val.token)
    return $appRequest
  }

  $appRequest = null
  if (nologout !== false) {
    setTimeout(function () {
      logout()
    }, 200)
  }

  return $appRequest
}

window.setAppRequest = function (data) {
  session.set($appRequestKey, JSON.stringify(data))
}

window.getAppAuthType = function () {
  if (isNull($appAuthType) === false) {
    return $appAuthType
  }

  var data = session.get($appAuthTypeKey)
  if (isNullOrEmpty(data, true) === false) {
    return ($appAuthType = parseInt(data))
  }

  return $ssh.Area
}

window.setAppAuthType = function (auth) {
  session.set($appAuthTypeKey, auth)
}

window.removeAppRequest = function () {
  $appRequest = null
  session.remove($appRequestKey)
}

window.removeAppAuthType = function () {
  $appAuthType = null
  session.remove($appAuthTypeKey)
}

window.getRemember = function () {
  return storage.get($rememberKey, 0)
}

window.setRemember = function (data) {
  storage.set($rememberKey, data)
}

window.getAreas = function () {
  var data = session.get($areaKey)
  if (isNullOrEmpty(data, true) === true) {
    return []
  }

  return JSON.parse(data)
}

window.setAreas = function (data) {
  if (isNull(data) === true) {
    data = []
  }

  setAppAuthType(($appAuthType = data.length > 0 ? $ssh.Area : $ssh.Station))
  session.set($areaKey, JSON.stringify(data))
}

window.getStations = function () {
  var data = session.get($stationKey)
  if (isNullOrEmpty(data, true) === true) {
    return []
  }

  return JSON.parse(data)
}

window.setStations = function (data) {
  if (isNull(data) === true) {
    data = []
  }

  session.set($stationKey, JSON.stringify(data))
}

window.loadData = function (before, done, fail, always) {
  if (isFunction(before) === true) {
    if (before() === false) {
      return false
    }
  }

  $.when(getAllAreasTask(), getAllStationsTask())
    .done(function (v1, v2) {
      setAreas(v1)
      setStations(v2)
      done({ data1: v1, data2: v2 })
    })
    .fail(fail)
    .always(function () {
      if (isFunction(always) === true) {
        always()
      }
    })
}

window.getAllAreas = function (params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest()
    appRequest.Post(
      $.extend(
        {
          url: 'GetAreas',
          data: { id: null },
        },
        params || {}
      ),
      function (result) {
        resolve(result.data)
      },
      function (err) {
        reject(err.message)
      },
      done
    )
  } catch (err) {
    reject(err.message)
  }
}

window.getAllAreasTask = function (params) {
  var dtd = $.Deferred()
  try {
    getAllAreas(
      params || {},
      function (data) {
        dtd.resolve(data)
      },
      function (err) {
        dtd.reject(err.message)
      }
    )
  } catch (err) {
    dtd.reject(err.message)
  }

  return dtd.promise()
}

window.getAllStations = function (params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest()
    appRequest.Post(
      $.extend(
        {
          url: 'GetStations',
          data: { id: null },
        },
        params || {}
      ),
      function (result) {
        resolve(result.data)
      },
      function (err) {
        reject(err.message)
      },
      done
    )
  } catch (err) {
    reject(err.message)
  }
}

window.getAllStationsTask = function (params) {
  var dtd = $.Deferred()
  try {
    getAllStations(
      params || {},
      function (data) {
        dtd.resolve(data)
      },
      function (err) {
        dtd.reject(err.message)
      }
    )
  } catch (err) {
    dtd.reject(err.message)
  }

  return dtd.promise()
}

window.getStation = function (id, params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest()
    appRequest.Post(
      $.extend(
        {
          url: 'GetStations',
          data: { id: [id] },
        },
        params || {}
      ),
      function (result) {
        if (result.data.length > 0) {
          resolve(result.data[0])
        } else {
          throw new Error('未查找到对象')
        }
      },
      function (err) {
        reject(err.message)
      },
      done
    )
  } catch (err) {
    reject(err.message)
  }
}

window.getStationTask = function (id, params) {
  var dtd = $.Deferred()
  try {
    getStation(
      id,
      params || {},
      function (data) {
        dtd.resolve(data)
      },
      function (err) {
        dtd.reject(err.message)
      }
    )
  } catch (err) {
    dtd.reject(err.message)
  }

  return dtd.promise()
}

window.getDevice = function (id, params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest()
    appRequest.Post(
      $.extend(
        {
          url: 'GetDevices',
          data: { id: [id] },
        },
        params || {}
      ),
      function (result) {
        if (result.data.length > 0) {
          resolve(result.data[0])
        } else {
          throw new Error('未查找到对象')
        }
      },
      function (err) {
        reject(err.message)
      },
      done
    )
  } catch (err) {
    reject(err.message)
  }
}

window.getDeviceTask = function (id, params) {
  var dtd = $.Deferred()
  try {
    getDevice(
      id,
      params || {},
      function (data) {
        dtd.resolve(data)
      },
      function (err) {
        dtd.reject(err.message)
      }
    )
  } catch (err) {
    dtd.reject(err.message)
  }

  return dtd.promise()
}

window.getAllDevices = function (params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest()
    appRequest.Post(
      $.extend(
        {
          url: 'GetDevices',
          data: { id: null },
        },
        params || {}
      ),
      function (result) {
        resolve(result.data)
      },
      function (err) {
        reject(err.message)
      },
      done
    )
  } catch (err) {
    reject(err.message)
  }
}

window.getVDevices = function (params, resolve, reject, done) {
  try {
    getAllDevices(
      params,
      function (data) {
        var devices = []
        $.each(data, function (index, item) {
          if (item.Type === '影音设备') {
            devices.push(item)
          }
        })
        resolve(devices)
      },
      reject,
      done
    )
  } catch (err) {
    reject(err.message)
  }
}

window.getXDevices = function (params, resolve, reject, done) {
  try {
    getAllDevices(
      params,
      function (data) {
        var devices = []
        $.each(data, function (index, item) {
          if (item.Type !== '影音设备') {
            devices.push(item)
          }
        })
        resolve(devices)
      },
      reject,
      done
    )
  } catch (err) {
    reject(err.message)
  }
}

window.getVDevicesTask = function (params) {
  var dtd = $.Deferred()
  try {
    getVDevices(
      params || {},
      function (data) {
        dtd.resolve(data)
      },
      function (err) {
        dtd.reject(err.message)
      }
    )
  } catch (err) {
    dtd.reject(err.message)
  }

  return dtd.promise()
}

window.getXDevicesTask = function (params) {
  var dtd = $.Deferred()
  try {
    getXDevices(
      params || {},
      function (data) {
        dtd.resolve(data)
      },
      function (err) {
        dtd.reject(err.message)
      }
    )
  } catch (err) {
    dtd.reject(err.message)
  }

  return dtd.promise()
}

window.getAllDevicesByPid = function (pid, params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest()
    appRequest.Post(
      $.extend(
        {
          url: 'GetDevicesByPID',
          data: { id: pid },
        },
        params || {}
      ),
      function (result) {
        resolve(result.data)
      },
      function (err) {
        reject(err.message)
      },
      done
    )
  } catch (err) {
    reject(err.message)
  }
}

window.getVDevicesByPid = function (pid, params, resolve, reject, done) {
  try {
    getAllDevicesByPid(
      pid,
      params,
      function (data) {
        var devices = []
        $.each(data, function (index, item) {
          if (item.Type === '影音设备') {
            devices.push(item)
          }
        })
        resolve(devices)
      },
      reject,
      done
    )
  } catch (err) {
    reject(err.message)
  }
}

window.getXDevicesByPid = function (pid, params, resolve, reject, done) {
  try {
    getAllDevicesByPid(
      pid,
      params,
      function (data) {
        var devices = []
        $.each(data, function (index, item) {
          if (item.Type !== '影音设备') {
            devices.push(item)
          }
        })
        resolve(devices)
      },
      reject,
      done
    )
  } catch (err) {
    reject(err.message)
  }
}

window.getVDevicesByPidTask = function (pid, params) {
  var dtd = $.Deferred()
  try {
    getVDevicesByPid(
      pid,
      params || {},
      function (data) {
        dtd.resolve(data)
      },
      function (err) {
        dtd.reject(err.message)
      }
    )
  } catch (err) {
    dtd.reject(err.message)
  }

  return dtd.promise()
}

window.getXDevicesByPidTask = function (pid, params) {
  var dtd = $.Deferred()
  try {
    getXDevicesByPid(
      pid,
      params || {},
      function (data) {
        dtd.resolve(data)
      },
      function (err) {
        dtd.reject(err.message)
      }
    )
  } catch (err) {
    dtd.reject(err.message)
  }

  return dtd.promise()
}

window.getAllSignalsByPid = function (pid, params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest()
    appRequest.Post(
      $.extend(
        {
          url: 'GetSignalsByPID',
          data: { id: pid },
        },
        params || {}
      ),
      function (result) {
        resolve(result.data)
      },
      function (err) {
        reject(err.message)
      },
      done
    )
  } catch (err) {
    reject(err.message)
  }
}

window.getAllSignalsByPidTask = function (pid, params) {
  var dtd = $.Deferred()
  try {
    getAllSignalsByPid(
      pid,
      params || {},
      function (data) {
        dtd.resolve(data)
      },
      function (err) {
        dtd.reject(err.message)
      }
    )
  } catch (err) {
    dtd.reject(err.message)
  }

  return dtd.promise()
}

window.getAllAlarms = function (params, resolve, reject, done) {
  try {
    var appRequest = getAppRequest()
    appRequest.Post(
      {
        url: 'GetActAlarms',
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
        resolve(result.data)
      },
      function (err) {
        reject(err.message)
      },
      done
    )
  } catch (err) {
    reject(err.message)
  }
}

window.success = function (message, timeout) {
  bui.hint({
    content: String.format("<i class='appiconfont appicon-ok'></i><span>{0}</span>", message),
    timeout: timeout || 2000,
    skin: 'success',
  })
}

window.warning = function (message, timeout) {
  bui.hint({
    content: String.format("<i class='appiconfont appicon-delete'></i><span>{0}</span>", message),
    timeout: timeout || 2000,
    skin: 'danger',
  })
}

window.successdialog = function (message, detail) {
  detail = isNullOrEmpty(detail) === true ? '' : String.format('<p>{0}</p>', detail)
  bui.confirm({
    title: '',
    height: 400,
    autoClose: true,
    content: `<div><i class="appiconfont appicon-confirmed success"></i><h3>${message}</h3>${detail}</div>`,
    buttons: [
      {
        name: '我知道了',
        className: 'primary-reverse',
      },
    ],
  })
}

window.warningdialog = function (message, detail) {
  detail = isNullOrEmpty(detail) === true ? '' : String.format('<p>{0}</p>', detail)
  bui.confirm({
    title: '',
    height: 400,
    autoClose: true,
    content: `<div><i class="appiconfont appicon-error danger"></i><h3>${message}</h3>${detail}</div>`,
    buttons: [
      {
        name: '我知道了',
        className: 'danger-reverse',
      },
    ],
  })
}

window.dispose = function (target) {
  loader.require(target.name, function (mod) {
    mod.dispose()
  })
}

window.logout = function () {
  var currentModule = router.currentModule()
  if (currentModule.name === 'pages/login/login') {
    return false
  }

  loader.require(['main'], function (mod) {
    mod.dispose()
    sayGoodbye()
    session.clear()
    bui.load({
      url: 'pages/login/login',
      effect: 'zoom',
      callback: function () {
        window.setTimeout(function () {
          window.location.reload()
        }, 100)
      },
    })
  })
}

window.sayGoodbye = function () {
  var request = getAppRequest(false)
  if (request != null) {
    request.Post(
      {
        url: 'Logout',
        timeout: 5000,
      },
      function (result) {},
      function (err) {}
    )
  }
}

window.getAlarmCls1 = function (level) {
  if (level === $level.L1) return 'level1'
  else if (level === $level.L2) return 'level2'
  else if (level === $level.L3) return 'level3'
  else if (level === $level.L4) return 'level4'
  else return 'level0'
}

window.getAlarmCls2 = function (level) {
  if (level === $level.L1) return 'level1-bg'
  else if (level === $level.L2) return 'level2-bg'
  else if (level === $level.L3) return 'level3-bg'
  else if (level === $level.L4) return 'level4-bg'
  else return 'level0-bg'
}

window.getAlarmName = function (level) {
  if (level === $level.L1) return '一级告警'
  else if (level === $level.L2) return '二级告警'
  else if (level === $level.L3) return '三级告警'
  else if (level === $level.L4) return '四级告警'
  else return '正常数据'
}

window.getNodeName = function (node) {
  switch (node) {
    case 0:
      return '区域'
    case 1:
      return '站点'
    case 2:
      return '楼层'
    case 3:
      return '机房'
    case 4:
      return '机架'
    case 5:
      return '设备'
    case 6:
      return '信号'
    default:
      return '未定义'
  }
}

window.getStateCls1 = function (state) {
  if (state === $state.S1) {
    return 'state1'
  } else if (state === $state.S2) {
    return 'state2'
  } else if (state === $state.S3) {
    return 'state3'
  } else if (state === $state.S4) {
    return 'state4'
  } else if (state === $state.S5) {
    return 'state5'
  } else if (state === $state.S6) {
    return 'state6'
  } else if (state === $state.S7) {
    return 'state7'
  } else {
    return 'state0'
  }
}

window.getStateCls2 = function (state) {
  if (state === $state.S1) {
    return 'state1-bg'
  } else if (state === $state.S2) {
    return 'state2-bg'
  } else if (state === $state.S3) {
    return 'state3-bg'
  } else if (state === $state.S4) {
    return 'state4-bg'
  } else if (state === $state.S5) {
    return 'state5-bg'
  } else if (state === $state.S6) {
    return 'state6-bg'
  } else if (state === $state.S7) {
    return 'state7-bg'
  } else {
    return 'state0-bg'
  }
}

window.getStateName = function (state) {
  if (state === $state.S1) {
    return '一级告警'
  } else if (state === $state.S2) {
    return '二级告警'
  } else if (state === $state.S3) {
    return '三级告警'
  } else if (state === $state.S4) {
    return '四级告警'
  } else if (state === $state.S5) {
    return '操作事件'
  } else if (state === $state.S6) {
    return '无效数据'
  } else if (state === $state.S7) {
    return '通信中断'
  } else {
    return '正常数据'
  }
}

window.getNodeValue = function (type, value, desc) {
  if (type === $node.AI.id || type === $node.AO.id || type === $node.CI.id) {
    return String.format('{0} {1}', value, desc)
  }

  if (type === $node.DI.id || type === $node.DO.id) {
    var unit = '未定义'
    var keys = desc.split(';')
    $.each(keys, function (index, item) {
      var values = item.split('&')
      if (values.length !== 2) return true

      if (values[0].trim() == value) {
        unit = values[1].trim()
        return false
      }
    })
    return unit
  }

  return value
}

window.getUnits = function (desc) {
  var data = []
  var pairs = desc.split(';')
  $.each(pairs, function (index, item) {
    var _values = item.split('&')
    if (_values.length !== 2) return true

    data.push({
      id: _values[0].trim(),
      name: _values[1].trim(),
    })
  })

  return data
}

window.getCodeName = function (code) {
  if (code === -1) {
    return '系统繁忙'
  } else if (code === 0) {
    return '请求成功'
  } else if (code === 4000) {
    return '请求失败'
  } else if (code === 4001) {
    return '鉴权失败'
  } else if (code === 4002) {
    return 'Token已过期'
  } else if (code === 4003) {
    return '非法参数'
  } else if (code === 4004) {
    return '并发调用超限'
  } else if (code === 4005) {
    return '无调用权限'
  } else {
    return '未知错误'
  }
}

window.onInput = function (option) {
  var opt = option || {}
  opt.id = option.id || ''
  opt.target = option.target || 'input'
  opt.event = option.event || 'keyup'
  opt.icon = option.icon || 'icon-remove'
  opt.onInput = option.onInput || function () {}
  opt.callback = option.callback || function () {}
  if (opt.id == '' || opt.id === null) {
    return
  }

  var $id = $(opt.id),
    $target = $id.find(opt.target),
    iconClass = '.' + opt.icon

  $target.on(
    opt.event,
    bui.unit.debounce(function () {
      var val = $(this).val(),
        $parent = $(this).parent(),
        $btnRemove = $parent.find(iconClass)
      if (val.length > 0) {
        if ($btnRemove && $btnRemove.length) {
          $btnRemove.css('display', 'block')
        } else {
          $parent.append('<i class="' + opt.icon + '"></i>')
          $btnRemove = $target.find(iconClass)
        }
      } else {
        $btnRemove && $btnRemove.css('display', 'none')
      }
      opt.onInput && opt.onInput.call(this)
    }, 100)
  )
  $target.on('focus', function () {
    $id.find(iconClass).css('display', 'none')
    $(this).next().css('display', 'block')
  })
  $id.on('click', iconClass, function () {
    opt.callback && opt.callback.call(this)
  })
}

window.getTimespan = function (start, end) {
  var from = bui.date.convert(start)
  var to = isNullOrEmpty(end, true) ? new Date() : bui.date.convert(end)
  var diff = (to - from) / 1000
  if (diff < 0) diff = 0

  var hours = parseInt(diff / 3600)
  var minutes = parseInt((diff % 3600) / 60)
  var seconds = parseInt(diff % 60)
  return String.format('{0}小时{1}分{2}秒', hours, minutes > 9 ? minutes : '0' + minutes, seconds > 9 ? seconds : '0' + seconds)
}

// 扩展方法
window.isNull = function (value) {
  return typeof value == 'undefined' || value === null
}

window.isEmpty = function (value, whitespace) {
  return (whitespace || false) === true ? value.trim() === '' : value === ''
}

window.isNullOrEmpty = function (value, whitespace) {
  if (isNull(value) === true) return true
  return isEmpty(value, whitespace)
}

window.isFunction = function (func) {
  return func && typeof func == 'function'
}

String.format = function () {
  if (arguments.length == 0) return null

  var str = arguments[0]
  for (var i = 1; i < arguments.length; i++) {
    var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm')
    str = str.replace(re, arguments[i])
  }

  return str
}

String.prototype.startWith = function (value, ignoreCase) {
  if (value == null || value == '' || this.length == 0 || value.length > this.length) {
    return false
  }

  ignoreCase = ignoreCase || false
  if (ignoreCase === true) {
    return this.substr(0, value.length).toLowerCase() === value.toLowerCase()
  }

  return this.substr(0, value.length) === value
}

String.prototype.endWith = function (value, ignoreCase) {
  if (value == null || value == '' || this.length == 0 || value.length > this.length) {
    return false
  }

  ignoreCase = ignoreCase || false
  if (ignoreCase === true) {
    return this.substr(this.length - value.length).toLowerCase() === value.toLowerCase()
  }

  return this.substr(this.length - value.length) === value
}

//初始化操作
bui.ready(function () {
  router.init({
    id: '#bui-router',
    firstAnimate: true,
    progress: true,
    hash: true,
    errorPage: '404.html',
  })

  bui
    .btn({
      id: '#bui-router',
      handle: '.bui-btn,a',
    })
    .load()

  $('#bui-router').on('click', '.btn-back', function (e) {
    bui.back({
      beforeBack: function (e) {
        if (isNull(e.target) === true) {
          return false
        }

        dispose(e.target)
        return true
      },
    })
  })

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
})
