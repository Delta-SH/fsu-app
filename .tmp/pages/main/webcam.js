"use strict";loader.define(function(i,e,s){var n={name:"摄像机列表",request:null,loading:null,params:null,search:null,devices:null,list:null};function t(i){if(0!==i.length){var e,s="";s+='<ul class="bui-list detail-list">',$.each(i,function(i,e){s+='\n              <li class="bui-btn bui-box" href="pages/main/camera.html?id='.concat(e.ID,'">\n                <div class="bui-icon round primary"><i class="appiconfont appicon-video"></i></div>\n                <div class="span1">').concat(e.Name,'</div>\n                <i class="icon-listright"></i>\n              </li>\n              ')}),e=s+="</ul>",n.list.html(e),n.list.append('<div class="nomore">没有更多内容</div>')}else n.list.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>')}return n.init=function(){if(!0===isNull(this.params)){var i=router.getPageParams();this.params=parseInt(i.id)}var e,s,t;!0===isNull(this.request)&&(this.request=getAppRequest()),!0===isNull(this.loading)&&(this.loading=bui.loading({appendTo:".webcam-page",text:"正在加载"})),!0===isNull(this.search)&&(this.search=bui.searchbar({id:"#pylon-app-webcam-search",onInput:function(){},onRemove:function(i,e){n.filter(e)},callback:function(i,e){n.filter(e)}})),!0===isNull(this.list)&&(this.list=router.$("#pylon-app-webcam-list")),e=router.$("#pylon-app-webcam").height(),s=router.$("header").height(),t=router.$("#pylon-app-webcam-search").height(),n.list.height(e-s-t)},n.load=function(){this.devices=[],this.loading.show(),getVDevicesByPid(this.params,null,function(i){t(n.devices=i)},function(i){warning(i.message)},function(){n.loading.hide()})},n.dispose=function(){},n.filter=function(e){!0===isNullOrEmpty(e,!0)?t(this.devices):(e=e.toLowerCase(),t(this.devices.filter(function(i){return-1<i.Name.toLowerCase().indexOf(e)})))},n.init(),n.load(),n});