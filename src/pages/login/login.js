loader.define(function(require,exports,module) {
    var pageview = { name: "登录" };
    var _ip, _user, _password, _loading;
    
    // 模块初始化
    pageview.init = function () {
        _ip = router.$("#app-login-ip");
        _user = router.$("#app-login-user");
        _password = router.$("#app-login-password");

        if(!_loading) {
            _loading = bui.loading({
                appendTo: ".login-page",
                text: "正在加载"
            });
        }

        this.bind();
        this.logout();
        this.rememberme();
    }

    // 模块加载
    pageview.load = function(){

    }

    // 模块事件绑定
    pageview.bind = function () {
        bui.input({
            id: ".user-input",
            iconClass: ".icon-remove",
            callback: function(e) {
                this.empty();
                $(e.target).hide();
            }
        });

        bui.input({
            id: ".password-input",
            iconClass: ".icon-eye",
            callback: function(e) {
                this.toggleType();
                $(e.target).toggleClass("active");
            }
        });

        router.$("#app-login-login").on('click', function(e){
            var iptext = _ip.val(),
                usertext = _user.val(),
                pwdtext = _password.val();

            if(isEmpty(iptext) === true){
                warning("设备IP不能为空");
                return;
            }

            if(isEmpty(usertext) === true){
                warning("用户名不能为空");
                return;
            }

            if(isEmpty(pwdtext) === true){
                warning("密码不能为空");
                return;
            }

            var remeber = {"ip": _ip.val(), "user": _user.val()};
            storage.set($rememberKey, remeber);
            setRequest(remeber);

            //获取token
            pageview.reqakey(usertext, pwdtext);

            //TEST
            // storage.set($ticketKey, {"token":'X', "time":new Date().getTime()});
            // router.back({
            //     name: "main",
            //     callback: function(){
            //         loader.require(["main"],function(main){
            //             main.init();
            //             success("欢迎回来", 1500);
            //         })
            //     }
            // });
        });
    }

    // 获取token
    pageview.reqakey = function(uid, pwd) {
        try {
            $.ajax({
                type: 'POST',
                url: String.format("{0}reqakey?", $requestURI),
                data: null,
                dataType: "text",
                timeout: 10000,
                beforeSend: function(xhr, settings) {
                    _loading.option("text", "请求令牌");
                    _loading.show();
                },
                success: function(data, status) {
                    var token = data.replace(/\"/g, '');
                    if (isNullOrEmpty(token) === true) {
                        warning("获取令牌失败,请重试。");
                        return;
                    }

                    if (token.startWith('Error') === true) {
                        warning(token);
                        return;
                    }

                    loader.import("js/jquery.md5.min.js", function(){
                        pageview.reqatu(token, uid, pwd);
                    });
                },
                error: function(xhr, errorType, error){
                    warning("获取令牌失败,请重试。");
                },
                complete: function(xhr, status){
                    _loading.hide();
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    // 用户验证
    pageview.reqatu = function(token, uid, pwd){
        try {
            $.ajax({
                type: 'POST',
                url: String.format("{0}atu?{1}&{2}&{3}", $requestURI, token, uid, $.md5(token + pwd)),
                data: null,
                dataType: "text",
                timeout: 10000,
                beforeSend: function(xhr, settings) {
                    _loading.option("text","验证用户");
                    _loading.show();
                },
                success: function(data, status) {
                    if(data !== "true"){
                        warning("用户名或密码错误");
                        return;
                    }
    
                    storage.set($ticketKey, {"uid":uid, "token":token, "time":new Date().getTime()});
                    router.back({
                        name: "main",
                        callback: function(){
                            loader.require(["main"], function(mod){
                                mod.init();
                                mod.load();
                                success("欢迎回来", 1500);
                            })
                        }
                    });
                },
                error: function(xhr, errorType, error){
                    warning("验证用户失败,请重试。");
                },
                complete: function(xhr, status){
                    _loading.hide();
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    // 用户注销
    pageview.logout = function(){
        setRetry(0);
        var ticket = getTicket();
        if(isNull(ticket) === false) {
            storage.remove($ticketKey);
            $.ajax({
                type: 'POST',
                url: String.format("{0}logout?{1}", $requestURI, ticket.token),
                data: null,
                dataType: "text",
                timeout: 10000,
                success: function(data, status) {
                }
            });
        }
    }

    // 记住我
    pageview.rememberme = function(){
        var remeber = storage.get($rememberKey, 0);
        if(isNull(remeber) === false) {
            _ip.val(remeber.ip);
            _user.val(remeber.user);
        }
    }

    // 销毁资源
    pageview.dispose = function(){

    }
    
    // 初始化
    pageview.init();

    // 输出模块
    return pageview;
})