loader.define(function (require, exports, module) {
  var _request = null;
  var _session = true;
  var pageview = {
    name: "登录",
    ip: null,
    user: null,
    password: null,
    loading: null,
  };

  // 模块初始化
  pageview.init = function () {
    this.ip = router.$("#app-login-ip");
    this.user = router.$("#app-login-user");
    this.password = router.$("#app-login-password");
    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: "#pylon-app-login",
        text: "正在加载",
      });
    }

    bui.input({
      id: ".user-input",
      showIcon: false,
      onFocus: function (e) {
        $(e.target).closest(".bui-btn").addClass("onfocus");
      },
      onBlur: function (e) {
        $(e.target).closest(".bui-btn").removeClass("onfocus");
      },
    });

    bui.input({
      id: ".password-input",
      iconClass: ".appicon-eyeclose",
      callback: function (e) {
        this.toggleType();
        $(e.target).toggleClass("appicon-eyeopen");
      },
      onFocus: function (e) {
        $(e.target).closest(".bui-btn").addClass("onfocus");
      },
      onBlur: function (e) {
        $(e.target).closest(".bui-btn").removeClass("onfocus");
      },
    });

    router.$("#app-login-login").on("click", function (e) {
      var iptext = pageview.ip.val().trim(),
        usertext = pageview.user.val().trim(),
        pwdtext = pageview.password.val().trim();

      if (isEmpty(iptext) === true) {
        warning("服务器地址不能为空");
        return;
      }

      if (isEmpty(usertext) === true) {
        warning("用户名不能为空");
        return;
      }

      if (isEmpty(pwdtext) === true) {
        warning("密码不能为空");
        return;
      }

      //记住我
      setRemember({ ip: iptext, user: usertext });

      //初始化请求对象
      _request = new AppRequest(iptext, usertext, "");

      //获取token
      _reqakey(usertext, pwdtext);
    });

    router.$("#app-login-forgot").on("click", function (e) {
      bui.alert("请与系统管理员联系~");
    });
  };

  // 模块加载
  pageview.load = function () {
    var remeber = getRemember();
    if (isNull(remeber) === false) {
      this.ip.val(remeber.ip);
      this.user.val(remeber.user);
    }
  };

  // 销毁资源
  pageview.dispose = function () {};

  // 获取token
  function _reqakey(uid, pwd) {
    var _loading = pageview.loading;
    _loading.option("text", "请求令牌");
    _loading.show();
    _request.Post(
      {
        url: "GetToken",
        baseUrl: _request.GetAuthPath(),
        timeout: 5000,
      },
      function (result) {
        var token = result.token;
        _request.SetToken(token);
        loader.import("js/md5.min.js", function () {
          _reqatu(uid, md5(token + "2" + md5(pwd)));
        });
      },
      function (err) {
        warning(err.message);
      },
      function () {
        _loading.hide();
      }
    );
  }

  // 用户验证
  function _reqatu(uid, pwd) {
    var _loading = pageview.loading;
    _loading.option("text", "验证用户");
    _loading.show();
    _request.Post(
      {
        url: "Login",
        baseUrl: _request.GetAuthPath(),
        timeout: 10000,
        data: {
          uid: uid,
          pwd: pwd,
        },
      },
      function (result) {
        $appRequest = _request;
        if (_session === true) {
          setAppRequest({
            ip: _request.GetIP(),
            user: _request.GetUser(),
            token: _request.GetToken(),
          });
        }

        if (router.isLoad("main")) {
          router.back({
            name: "main",
            callback: function (mod) {
              mod.init();
              mod.load();
              success("欢迎回来", 1500);
            },
          });
        } else {
          router.load({
            url: "main",
            effect: "zoom",
            callback: function (mod) {
              success("欢迎使用", 1500);
            },
          });
        }
      },
      function (err) {
        warning(err.message);
      },
      function () {
        _loading.hide();
      }
    );
  }

  // 初始化
  pageview.init();
  pageview.load();

  // 输出模块
  return pageview;
});
