loader.define(function (require, exports, module) {
  var pageview = {
    name: "修改密码",
    request: null,
    savebtn: null,
  };

  pageview.init = function () {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

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

    if (isNull(this.savebtn) === true) {
      this.savebtn = bui.btn("#pylon-app-password-save");
      this.savebtn.submit(
        function (loading) {
          _save(loading);
        },
        { text: "正在保存..." }
      );
    }
  };

  pageview.load = function () {};

  pageview.dispose = function () {};

  function _save(loading) {
    var pwd1 = router.$("#pylon-app-password-1").val(),
      pwd2 = router.$("#pylon-app-password-2").val(),
      pwd3 = router.$("#pylon-app-password-3").val();

    if (isNullOrEmpty(pwd1) === true) {
      warning("原始密码不能为空");
      loading.stop();
      return false;
    }

    if (isNullOrEmpty(pwd2) === true) {
      warning("新密码不能为空");
      loading.stop();
      return false;
    }

    if (isNullOrEmpty(pwd3) === true) {
      warning("确认密码不能为空");
      loading.stop();
      return false;
    }

    if (pwd2 !== pwd3) {
      warning("确认密码不一致");
      loading.stop();
      return false;
    }

    loader.import("js/md5.min.js", function () {
      _change(md5(pwd1), md5(pwd2), loading);
    });
  }

  function _change(oldPwd, newPwd, loading) {
    pageview.request.Post(
      {
        url: "SetPd",
        data: {
          p1: oldPwd,
          p2: newPwd,
        },
      },
      function (result) {
        successdialog(isNullOrEmpty(result.msg, true) ? "保存成功" : result.msg);
      },
      function (err) {
        warningdialog("操作失败", err.message);
      },
      function () {
        loading.stop();
      }
    );
  }

  pageview.init();
  return pageview;
});
