"use strict";loader.define(function(t,u,i){var l={name:"我的",request:null,outbtn:null,uidlbl:null,init:function(){!0===isNull(this.request)&&(this.request=getAppRequest()),!0===isNull(this.logout)&&(this.outbtn=router.$("#pylon-app-user-logout"),this.outbtn.on("click",function(t){logout()})),!0===isNull(this.uidlbl)&&(this.uidlbl=router.$("#pylon-app-user-uid"))},load:function(){this.uidlbl.html(!1===isNull(this.request)?this.request.GetUser():"User")},dispose:function(){}};return l.init(),l});