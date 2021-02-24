"use strict";

loader.define(function (require, exports, module) {
  var pageview = {
    name: "我的",
    request: null,
    outbtn: null,
    uidlbl: null
  };

  pageview.init = function () {
    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.logout) === true) {
      this.outbtn = router.$("#pylon-app-user-logout");
      this.outbtn.on("click", function (e) {
        logout();
      });
    }

    if (isNull(this.uidlbl) === true) {
      this.uidlbl = router.$("#pylon-app-user-uid");
    }
  };

  pageview.load = function () {
    this.uidlbl.html(isNull(this.request) === false ? this.request.GetUser() : "User");
  };

  pageview.dispose = function () {};

  pageview.init();
  return pageview;
});