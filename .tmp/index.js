"use strict";window.$appRequest=null,window.$appAuthType=null,window.$appAuthTypeKey="pylon.app.session.appauthtype",window.$appRequestKey="pylon.app.session.apprequest",window.$areaKey="pylon.app.session.area",window.$stationKey="pylon.app.session.station",window.$rememberKey="pylon.app.local.remember",window.router=bui.router(),window.storage=bui.storage(),window.session={driver:function(){return window.sessionStorage},get:function(e){return this.driver().getItem(e)},set:function(e,t){return this.driver().setItem(e,t)},remove:function(e){return this.driver().removeItem(e)},clear:function(){return this.driver().clear()},each:function(e){for(var t=this.driver().length-1;0<=t;t--){var n=this.driver().key(t);e(this.get(n),n)}}},window.$level={L0:0,L1:1,L2:2,L3:3,L4:4},window.$state={S0:0,S1:1,S2:2,S3:3,S4:4,S5:5,S6:6,S7:7},window.$node={DI:{id:0,name:"遥信信号"},AI:{id:1,name:"遥测信号"},DO:{id:2,name:"遥控信号"},AO:{id:3,name:"遥调信号"},CI:{id:4,name:"计数信号"},SI:{id:5,name:"字符输入"},SO:{id:6,name:"字符输出"},VI:{id:7,name:"视频输入"},VO:{id:8,name:"视频输出"},ADI:{id:9,name:"音频输入"},ADO:{id:10,name:"音频输出"}},window.$ssh={Area:0,Station:1,Storey:2,Room:3,Frame:4,Device:5},window.AppRequest=function(e,t,n){var s=this,i=e,o=t,a=n;s.GetUser=function(){return o},s.SetUser=function(e){o=e},s.GetIP=function(){return i},s.SetIP=function(e){i=e},s.GetToken=function(){return a},s.SetToken=function(e){a=e},s.GetPath=function(){return String.format("http://{0}/api/app/",i)},s.GetList=function(e,n,i,o){var t={url:"",data:{},baseUrl:s.GetPath(),method:"POST",timeout:3e4,pageSize:20,contentType:"application/json",cache:!1,needJsonString:!0,headers:{"X-Token":a},field:{page:"page",size:"limit",data:"data"},onLoad:function(e,t){try{if(4002===t.code)return void logout();if(0!==t.code)throw new Error(t.msg||getCodeName(t.code));n(t)}catch(e){i(e)}finally{!0===isFunction(o)&&o()}},onFail:function(){try{i(new Error("系统开小差啦~"))}finally{!0===isFunction(o)&&o()}}};return bui.list($.extend(t,e||{}))},s.Get=function(e,n,i,t){var o={url:"",data:{},baseUrl:s.GetPath(),method:"GET",headers:{"X-Token":a},timeout:3e4,dataType:"text",cache:!1};bui.ajax($.extend(o,e||{})).done(function(e){try{if(!0===isNullOrEmpty(e,!0))throw new Error("无效的响应");var t=JSON.parse(e);if(4002===t.code)return void logout();if(0!==t.code)throw new Error(t.msg||getCodeName(t.code));n(t)}catch(e){i(e)}}).fail(function(e,t){i(new Error(t+":"+e.status))}).always(function(){!0===isFunction(t)&&t()})},s.Post=function(e,n,i,t){var o={url:"",data:{},baseUrl:s.GetPath(),method:"POST",headers:{"X-Token":a},timeout:3e4,dataType:"text",contentType:"application/json",cache:!1,needJsonString:!0};bui.ajax($.extend(o,e||{})).done(function(e){try{if(!0===isNullOrEmpty(e,!0))throw new Error("无效的响应");var t=JSON.parse(e);if(4002===t.code)return void logout();if(0!==t.code)throw new Error(t.msg||getCodeName(t.code));n(t)}catch(e){i(e)}}).fail(function(e,t){i(new Error("系统开小差啦~"))}).always(function(){!0===isFunction(t)&&t()})}},window.getAppRequest=function(e){if(!1===isNull($appRequest))return $appRequest;var t=session.get($appRequestKey);if(!1!==isNullOrEmpty(t,!0))return $appRequest=null,!1!==e&&setTimeout(function(){logout()},200),$appRequest;var n=JSON.parse(t);return $appRequest=new AppRequest(n.ip,n.user,n.token),$appRequest},window.setAppRequest=function(e){session.set($appRequestKey,JSON.stringify(e))},window.getAppAuthType=function(){if(!1===isNull($appAuthType))return $appAuthType;var e=session.get($appAuthTypeKey);return!1===isNullOrEmpty(e,!0)?$appAuthType=parseInt(e):$ssh.Area},window.setAppAuthType=function(e){session.set($appAuthTypeKey,e)},window.removeAppRequest=function(){$appRequest=null,session.remove($appRequestKey)},window.removeAppAuthType=function(){$appAuthType=null,session.remove($appAuthTypeKey)},window.getRemember=function(){return storage.get($rememberKey,0)},window.setRemember=function(e){storage.set($rememberKey,e)},window.getAreas=function(){var e=session.get($areaKey);return!0===isNullOrEmpty(e,!0)?[]:JSON.parse(e)},window.setAreas=function(e){!0===isNull(e)&&(e=[]),setAppAuthType($appAuthType=0<e.length?$ssh.Area:$ssh.Station),session.set($areaKey,JSON.stringify(e))},window.getStations=function(){var e=session.get($stationKey);return!0===isNullOrEmpty(e,!0)?[]:JSON.parse(e)},window.setStations=function(e){!0===isNull(e)&&(e=[]),session.set($stationKey,JSON.stringify(e))},window.loadData=function(e,n,t,i){if(!0===isFunction(e)&&!1===e())return!1;$.when(getAllAreasTask(),getAllStationsTask()).done(function(e,t){setAreas(e),setStations(t),n({data1:e,data2:t})}).fail(t).always(function(){!0===isFunction(i)&&i()})},window.getAllAreas=function(e,t,n,i){try{getAppRequest().Post($.extend({url:"GetAreas",data:{id:null}},e||{}),function(e){t(e.data)},function(e){n(e.message)},i)}catch(e){n(e.message)}},window.getAllAreasTask=function(e){var t=$.Deferred();try{getAllAreas(e||{},function(e){t.resolve(e)},function(e){t.reject(e.message)})}catch(e){t.reject(e.message)}return t.promise()},window.getAllStations=function(e,t,n,i){try{getAppRequest().Post($.extend({url:"GetStations",data:{id:null}},e||{}),function(e){t(e.data)},function(e){n(e.message)},i)}catch(e){n(e.message)}},window.getAllStationsTask=function(e){var t=$.Deferred();try{getAllStations(e||{},function(e){t.resolve(e)},function(e){t.reject(e.message)})}catch(e){t.reject(e.message)}return t.promise()},window.getStation=function(e,t,n,i,o){try{getAppRequest().Post($.extend({url:"GetStations",data:{id:[e]}},t||{}),function(e){if(!(0<e.data.length))throw new Error("未查找到对象");n(e.data[0])},function(e){i(e.message)},o)}catch(e){i(e.message)}},window.getStationTask=function(e,t){var n=$.Deferred();try{getStation(e,t||{},function(e){n.resolve(e)},function(e){n.reject(e.message)})}catch(e){n.reject(e.message)}return n.promise()},window.getDevice=function(e,t,n,i,o){try{getAppRequest().Post($.extend({url:"GetDevices",data:{id:[e]}},t||{}),function(e){if(!(0<e.data.length))throw new Error("未查找到对象");n(e.data[0])},function(e){i(e.message)},o)}catch(e){i(e.message)}},window.getDeviceTask=function(e,t){var n=$.Deferred();try{getDevice(e,t||{},function(e){n.resolve(e)},function(e){n.reject(e.message)})}catch(e){n.reject(e.message)}return n.promise()},window.getAllDevices=function(e,t,n,i){try{getAppRequest().Post($.extend({url:"GetDevices",data:{id:null}},e||{}),function(e){t(e.data)},function(e){n(e.message)},i)}catch(e){n(e.message)}},window.getVDevices=function(e,t,n,i){try{getAllDevices(e,function(e){var n=[];$.each(e,function(e,t){"影音设备"===t.Type&&n.push(t)}),t(n)},n,i)}catch(e){n(e.message)}},window.getXDevices=function(e,t,n,i){try{getAllDevices(e,function(e){var n=[];$.each(e,function(e,t){"影音设备"!==t.Type&&n.push(t)}),t(n)},n,i)}catch(e){n(e.message)}},window.getVDevicesTask=function(e){var t=$.Deferred();try{getVDevices(e||{},function(e){t.resolve(e)},function(e){t.reject(e.message)})}catch(e){t.reject(e.message)}return t.promise()},window.getXDevicesTask=function(e){var t=$.Deferred();try{getXDevices(e||{},function(e){t.resolve(e)},function(e){t.reject(e.message)})}catch(e){t.reject(e.message)}return t.promise()},window.getAllDevicesByPid=function(e,t,n,i,o){try{getAppRequest().Post($.extend({url:"GetDevicesByPID",data:{id:e}},t||{}),function(e){n(e.data)},function(e){i(e.message)},o)}catch(e){i(e.message)}},window.getVDevicesByPid=function(e,t,i,n,o){try{getAllDevicesByPid(e,t,function(e){var n=[];$.each(e,function(e,t){"影音设备"===t.Type&&n.push(t)}),i(n)},n,o)}catch(e){n(e.message)}},window.getXDevicesByPid=function(e,t,i,n,o){try{getAllDevicesByPid(e,t,function(e){var n=[];$.each(e,function(e,t){"影音设备"!==t.Type&&n.push(t)}),i(n)},n,o)}catch(e){n(e.message)}},window.getVDevicesByPidTask=function(e,t){var n=$.Deferred();try{getVDevicesByPid(e,t||{},function(e){n.resolve(e)},function(e){n.reject(e.message)})}catch(e){n.reject(e.message)}return n.promise()},window.getXDevicesByPidTask=function(e,t){var n=$.Deferred();try{getXDevicesByPid(e,t||{},function(e){n.resolve(e)},function(e){n.reject(e.message)})}catch(e){n.reject(e.message)}return n.promise()},window.getAllSignalsByPid=function(e,t,n,i,o){try{getAppRequest().Post($.extend({url:"GetSignalsByPID",data:{id:e}},t||{}),function(e){n(e.data)},function(e){i(e.message)},o)}catch(e){i(e.message)}},window.getAllSignalsByPidTask=function(e,t){var n=$.Deferred();try{getAllSignalsByPid(e,t||{},function(e){n.resolve(e)},function(e){n.reject(e.message)})}catch(e){n.reject(e.message)}return n.promise()},window.getAllAlarms=function(e,t,n,i){try{getAppRequest().Post({url:"GetActAlarms",data:$.extend({sortAttribute:7,sortMode:2,id:0,area:null,station:null,device:null,signal:null,alarmLevel:null,alarmDesc:null},e||{})},function(e){t(e.data)},function(e){n(e.message)},i)}catch(e){n(e.message)}},window.success=function(e,t){bui.hint({content:String.format("<i class='appiconfont appicon-ok'></i><span>{0}</span>",e),timeout:t||2e3,skin:"success"})},window.warning=function(e,t){bui.hint({content:String.format("<i class='appiconfont appicon-delete'></i><span>{0}</span>",e),timeout:t||2e3,skin:"danger"})},window.successdialog=function(e,t){t=!0===isNullOrEmpty(t)?"":String.format("<p>{0}</p>",t),bui.confirm({title:"",height:400,autoClose:!0,content:'<div><i class="appiconfont appicon-confirmed success"></i><h3>'.concat(e,"</h3>").concat(t,"</div>"),buttons:[{name:"我知道了",className:"primary-reverse"}]})},window.warningdialog=function(e,t){t=!0===isNullOrEmpty(t)?"":String.format("<p>{0}</p>",t),bui.confirm({title:"",height:400,autoClose:!0,content:'<div><i class="appiconfont appicon-error danger"></i><h3>'.concat(e,"</h3>").concat(t,"</div>"),buttons:[{name:"我知道了",className:"danger-reverse"}]})},window.dispose=function(e){loader.require(e.name,function(e){e.dispose()})},window.logout=function(){loader.require(["main"],function(e){e.dispose(),sayGoodbye(),session.clear(),bui.load({url:"pages/login/login",effect:"zoom",callback:function(){window.setTimeout(function(){window.location.reload()},100)}})})},window.sayGoodbye=function(){var e=getAppRequest(!1);null!=e&&e.Post({url:"Logout",timeout:5e3},function(e){},function(e){})},window.getAlarmCls1=function(e){return e===$level.L1?"level1":e===$level.L2?"level2":e===$level.L3?"level3":e===$level.L4?"level4":"level0"},window.getAlarmCls2=function(e){return e===$level.L1?"level1-bg":e===$level.L2?"level2-bg":e===$level.L3?"level3-bg":e===$level.L4?"level4-bg":"level0-bg"},window.getAlarmName=function(e){return e===$level.L1?"一级告警":e===$level.L2?"二级告警":e===$level.L3?"三级告警":e===$level.L4?"四级告警":"正常数据"},window.getNodeName=function(e){switch(e){case 0:return"区域";case 1:return"站点";case 2:return"楼层";case 3:return"机房";case 4:return"机架";case 5:return"设备";case 6:return"信号";default:return"未定义"}},window.getStateCls1=function(e){return e===$state.S1?"state1":e===$state.S2?"state2":e===$state.S3?"state3":e===$state.S4?"state4":e===$state.S5?"state5":e===$state.S6?"state6":e===$state.S7?"state7":"state0"},window.getStateCls2=function(e){return e===$state.S1?"state1-bg":e===$state.S2?"state2-bg":e===$state.S3?"state3-bg":e===$state.S4?"state4-bg":e===$state.S5?"state5-bg":e===$state.S6?"state6-bg":e===$state.S7?"state7-bg":"state0-bg"},window.getStateName=function(e){return e===$state.S1?"一级告警":e===$state.S2?"二级告警":e===$state.S3?"三级告警":e===$state.S4?"四级告警":e===$state.S5?"操作事件":e===$state.S6?"无效数据":e===$state.S7?"通信中断":"正常数据"},window.getNodeValue=function(e,i,t){if(e===$node.AI.id||e===$node.AO.id||e===$node.CI.id)return String.format("{0} {1}",i,t);if(e!==$node.DI.id&&e!==$node.DO.id)return i;var o="未定义",n=t.split(";");return $.each(n,function(e,t){var n=t.split("&");return 2!==n.length||(n[0].trim()==i?(o=n[1].trim(),!1):void 0)}),o},window.getUnits=function(e){var i=[],t=e.split(";");return $.each(t,function(e,t){var n=t.split("&");if(2!==n.length)return!0;i.push({id:n[0].trim(),name:n[1].trim()})}),i},window.getCodeName=function(e){return-1===e?"系统繁忙":0===e?"请求成功":4e3===e?"请求失败":4001===e?"鉴权失败":4002===e?"Token已过期":4003===e?"非法参数":4004===e?"并发调用超限":4005===e?"无调用权限":"未知错误"},window.onInput=function(e){var i=e||{};if(i.id=e.id||"",i.target=e.target||"input",i.event=e.event||"keyup",i.icon=e.icon||"icon-remove",i.onInput=e.onInput||function(){},i.callback=e.callback||function(){},""!=i.id&&null!==i.id){var t=$(i.id),o=t.find(i.target),s="."+i.icon;o.on(i.event,bui.unit.debounce(function(){var e=$(this).val(),t=$(this).parent(),n=t.find(s);0<e.length?n&&n.length?n.css("display","block"):(t.append('<i class="'+i.icon+'"></i>'),n=o.find(s)):n&&n.css("display","none"),i.onInput&&i.onInput.call(this)},100)),o.on("focus",function(){t.find(s).css("display","none"),$(this).next().css("display","block")}),t.on("click",s,function(){i.callback&&i.callback.call(this)})}},window.getTimespan=function(e,t){var n=bui.date.convert(e),i=((isNull(t)?new Date:bui.date.convert(t))-n)/1e3;i<0&&(i=0);var o=parseInt(i/3600),s=parseInt(i%3600/60),a=parseInt(i%60);return String.format("{0}小时{1}分{2}秒",o,9<s?s:"0"+s,9<a?a:"0"+a)},window.isNull=function(e){return null==e},window.isEmpty=function(e,t){return!0===(t||!1)?""===e.trim():""===e},window.isNullOrEmpty=function(e,t){return!0===isNull(e)||isEmpty(e,t)},window.isFunction=function(e){return e&&"function"==typeof e},String.format=function(){if(0==arguments.length)return null;for(var e=arguments[0],t=1;t<arguments.length;t++){var n=new RegExp("\\{"+(t-1)+"\\}","gm");e=e.replace(n,arguments[t])}return e},String.prototype.startWith=function(e,t){return!(null==e||""==e||0==this.length||e.length>this.length)&&(!0===(t=t||!1)?this.substr(0,e.length).toLowerCase()===e.toLowerCase():this.substr(0,e.length)===e)},String.prototype.endWith=function(e,t){return!(null==e||""==e||0==this.length||e.length>this.length)&&(!0===(t=t||!1)?this.substr(this.length-e.length).toLowerCase()===e.toLowerCase():this.substr(this.length-e.length)===e)},bui.ready(function(){function e(){plus.key.addEventListener("backbutton",function(){"Android"===plus.os.name?bui.back({beforeBack:function(e){return!0!==isNull(e.target)&&(dispose(e.target),"pages/login/login"!==e.target.name||(plus.runtime.quit(),!1))}}):plus.nativeUI.toast("请按Home键切换应用")})}router.init({id:"#bui-router",firstAnimate:!0,progress:!0,hash:!0,errorPage:"404.html"}),bui.btn({id:"#bui-router",handle:".bui-btn,a"}).load(),$("#bui-router").on("click",".btn-back",function(e){bui.back({beforeBack:function(e){return!0!==isNull(e.target)&&(dispose(e.target),!0)}})}),window.plus?e():document.addEventListener("plusready",e,!1)});