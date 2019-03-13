loader.define(function(require, exports, module) {
    var pageview = {name: '修改密码'}, _ticket;
           
    pageview.init = function () {
        _ticket = getTicket();
        bui.input({
            id: ".user-input",
            iconClass: ".icon-remove",
            callback: function(e) {
                this.empty();
                $(e.target).hide();
            }
        });

        bui.btn("#pylon-app-network-save").submit(function (loading) {
            _save(loading);
        },{ text: "正在保存..." });
    }

    pageview.load = function(){
        $.ajax({
            type: 'POST',
            url: String.format("{0}getsnet?{1}", $requestURI, _ticket.token),
            data: null,
            dataType: "text",
            timeout: 30000,
            success: function (data, status) {
                if (data.startWith('Error') === true){
                    warning(data);
                    return;
                }

                if (isNullOrEmpty(data) === true){
                    warning("网络配置加载失败");
                    return;
                }

                _bind(data);
            },
            error: function (xhr, status, error) {
                warning("网络配置加载失败");
            }
        });
    }

    pageview.dispose = function(){
    }

    function _bind(data){
        var cfg = JSON.parse(data);
        var MainAddressIP = router.$('#pylon-app-network-main-ip'),
            MainAddressMask = router.$('#pylon-app-network-main-mask'),
            MainAddressGateway = router.$('#pylon-app-network-main-gateway'),
            AuxAddressIP = router.$('#pylon-app-network-aux-ip'),
            AuxAddressMask = router.$('#pylon-app-network-aux-mask'),
            DNS1 = router.$('#pylon-app-network-dns1'),
            DNS2 = router.$('#pylon-app-network-dns2');

        MainAddressIP.val('');
        MainAddressMask.val('');
        MainAddressGateway.val('');
        AuxAddressIP.val('');
        AuxAddressMask.val('');
        DNS1.val('');
        DNS2.val('');

        if (isNullOrEmpty(cfg.MainAddressIP) === false) {
            MainAddressIP.val(cfg.MainAddressIP);
        }

        if (isNullOrEmpty(cfg.MainAddressMask) === false) {
            MainAddressMask.val(cfg.MainAddressMask);
        }

        if (isNullOrEmpty(cfg.MainAddressGateway) === false) {
            MainAddressGateway.val(cfg.MainAddressGateway);
        }

        if (isNullOrEmpty(cfg.AuxAddressIP) === false) {
            AuxAddressIP.val(cfg.AuxAddressIP);
        }

        if (isNullOrEmpty(cfg.AuxAddressMask) === false) {
            AuxAddressMask.val(cfg.AuxAddressMask);
        }

        if (isNullOrEmpty(cfg.DNS1) === false) {
            DNS1.val(cfg.DNS1);
        }

        if (isNullOrEmpty(cfg.DNS2) === false) {
            DNS2.val(cfg.DNS2);
        }
    }

    function _save(loading) {
        var MainAddressIP = $('#pylon-app-network-main-ip'),
            MainAddressIPVal = MainAddressIP.val(),
            MainAddressMask = $('#pylon-app-network-main-mask'),
            MainAddressMaskVal = MainAddressMask.val(),
            MainAddressGateway = $('#pylon-app-network-main-gateway'),
            MainAddressGatewayVal = MainAddressGateway.val(),
            AuxAddressIP = $('#pylon-app-network-aux-ip'),
            AuxAddressIPVal = AuxAddressIP.val(),
            AuxAddressMask = $('#pylon-app-network-aux-mask'),
            AuxAddressMaskVal = AuxAddressMask.val(),
            DNS1 = $('#pylon-app-network-dns1'),
            DNS1Val = DNS1.val(),
            DNS2 = $('#pylon-app-network-dns2'),
            DNS2Val = DNS2.val();

        if (isNullOrEmpty(MainAddressIPVal) === true) {
            warning('主地址不能为空');
            loading.stop();
            return false;
        }

        if (isNullOrEmpty(MainAddressMaskVal) === true) {
            warning('主掩码不能为空');
            loading.stop();
            return false;
        }

        if (isNullOrEmpty(MainAddressGatewayVal) === true) {
            warning('默认网关不能为空');
            loading.stop();
            return false;
        }

        var netcfg = {
            MainAddressIP: MainAddressIPVal,
            MainAddressMask: MainAddressMaskVal,
            MainAddressGateway: MainAddressGatewayVal,
            AuxAddressIP: AuxAddressIPVal,
            AuxAddressMask: AuxAddressMaskVal,
            DNS1: DNS1Val,
            DNS2: DNS2Val
        };

        $.ajax({
            type: 'POST',
            url: String.format("{0}setsnet?{1}", $requestURI, _ticket.token),
            data: JSON.stringify(netcfg),
            dataType: "text",
            timeout: 30000,
            success: function (data, status) {
                if (data === 'true') {
                    successdialog('网络设置成功', '下次访问，请使用新配置。');
                } else {
                    warningdialog('网络设置失败', data);
                }
            },
            error: function (xhr, status, error) {
                warningdialog("网络设置失败", status || error);
            },
            complete: function(xhr, status){
                loading.stop();
            }
        });
    }

    pageview.init();
    pageview.load();

    return pageview;
});