loader.define(function(require, exports, module) {
    var pageview = {name: '我的'}, _ticket;
    
    pageview.init = function () {
        router.$("#pylon-app-user-logout").on("click",function(e){
            loader.require(["main"], function (mod) {
                mod.dispose();
                bui.load({ 
                    url: "pages/login/login", 
                    effect: "zoom" 
                });
            })
        });
    }

    pageview.load = function(){
        _ticket = getTicket(); 
        router.$("pylon-app-user-uid").html(isNull(_ticket) === false ? _ticket.uid : "User");
    }

    pageview.dispose = function(){
    }

    pageview.init();

    return pageview;
});