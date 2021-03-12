loader.define(function (require, exports, module) {
  var _request = null
  var pageview = {
    name: '登录',
    ip: null,
    user: null,
    password: null,
    rembck: null,
    loading: null,
  }

  // 模块初始化
  pageview.init = function () {
    this.ip = router.$('#app-login-ip')
    this.user = router.$('#app-login-user')
    this.password = router.$('#app-login-password')
    this.rembck = router.$('#app-login-remember')
    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: '#pylon-app-login',
        text: '正在加载',
      })
    }

    bui.input({
      id: '.user-input',
      showIcon: false,
      onFocus: function (e) {
        $(e.target).closest('.bui-btn').addClass('onfocus')
      },
      onBlur: function (e) {
        $(e.target).closest('.bui-btn').removeClass('onfocus')
      },
    })

    bui.input({
      id: '.password-input',
      iconClass: '.appicon-eyeclose',
      callback: function (e) {
        this.toggleType()
        $(e.target).toggleClass('appicon-eyeopen')
      },
      onFocus: function (e) {
        $(e.target).closest('.bui-btn').addClass('onfocus')
      },
      onBlur: function (e) {
        $(e.target).closest('.bui-btn').removeClass('onfocus')
      },
    })

    router.$('#app-login-login').on('click', function (e) {
      var iptext = pageview.ip.val().trim(),
        usertext = pageview.user.val().trim(),
        pwdtext = pageview.password.val().trim(),
        remtext = pageview.rembck.prop("checked");

      if (isEmpty(iptext) === true) {
        warning('服务器地址不能为空')
        return
      }

      if (isEmpty(usertext) === true) {
        warning('用户名不能为空')
        return
      }

      if (isEmpty(pwdtext) === true) {
        warning('密码不能为空')
        return
      }

      //记住我
      setRemember({ ip: iptext, user: usertext, pwd: remtext === true ? pwdtext : '', remb: remtext })

      //初始化请求对象
      _request = new AppRequest(iptext, usertext, pwdtext)

      //登录系统
      var _loading = pageview.loading
      _loading.option('text', '认证登录')
      _loading.show()
      _request.Login(
        function (token) {
          $appRequest = _request
          router.load({
            url: 'main',
            effect: 'zoom',
            callback: function (mod) {
              success('欢迎使用', 1500)
            },
          })
        },
        function (err) {
          warning(err.message)
        },
        function () {
          _loading.hide()
        }
      )
    })

    router.$('#app-login-forgot').on('click', function (e) {
      bui.alert('请与系统管理员联系~')
    })
  }

  // 模块加载
  pageview.load = function () {
    var remeber = getRemember()
    if (isNull(remeber) === false) {
      this.ip.val(remeber.ip)
      this.user.val(remeber.user)
      this.password.val(remeber.pwd)
      this.rembck.prop("checked",remeber.remb)
    }
  }

  // 销毁资源
  pageview.dispose = function () {}

  // 初始化
  pageview.init()
  pageview.load()

  // 输出模块
  return pageview
})
