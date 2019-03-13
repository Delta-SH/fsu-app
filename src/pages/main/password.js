loader.define(function(require, exports, module) {
    var pageview = {name: '修改密码'}, _ticket;
    
    pageview.init = function () {
        _ticket = getTicket();
        bui.input({
            id: ".password-input",
            iconClass: ".icon-eye",
            callback: function(e) {
                this.toggleType();
                $(e.target).toggleClass("active");
            }
        });

        bui.btn("#pylon-app-password-save").submit(function (loading) {
            _save(loading);
        },{ text: "正在保存..." });
    }

    pageview.load = function(){
    }

    pageview.dispose = function(){
    }

    function _save(loading) {
        var pwd1 = router.$("#pylon-app-password-1").val(),
            pwd2 = router.$("#pylon-app-password-2").val(),
            pwd3 = router.$("#pylon-app-password-3").val();
    
        if (isNullOrEmpty(pwd1) === true) {
            warning('原始密码不能为空');
            loading.stop();
            return false;
        }
    
        if (isNullOrEmpty(pwd2) === true) {
            warning('新密码不能为空');
            loading.stop();
            return false;
        }
    
        if (isNullOrEmpty(pwd3) === true) {
            warning('确认密码不能为空');
            loading.stop();
            return false;
        }

        var rule = /^[0-9]{1,20}$/;
        if(!rule.test(pwd2) ){
            warning("新密码必须为纯数字",'');
            loading.stop();
            return false;
        }
    
        if (pwd2 !== pwd3) {
            warning('确认密码不一致');
            loading.stop();
            return false;
        }

        loader.import("js/jquery.base64.min.js", function(){
            _request(pwd1, pwd2, loading);
        });
    }

    function _request(oldPwd, newPwd, loading){
        $.ajax({
            type: 'POST',
            url: String.format("{0}setpd?{1}&{2}&{3}", $requestURI, _ticket.token, $.base64.btoa(newPwd), $.base64.btoa(oldPwd)),
            data: null,
            dataType: "text",
            timeout: 30000,
            success: function (data, status) {
                if (data === 'true') {
                    successdialog('密码修改成功', '下次登录系统，请使用新密码。');
                } else {
                    warningdialog('密码修改失败', data);
                }
            },
            error: function (xhr, status, error) {
                warningdialog("密码修改失败", status || error);
            },
            complete: function(xhr, status){
                loading.stop();
            }
        });
    }

    pageview.init();

    return pageview;
});