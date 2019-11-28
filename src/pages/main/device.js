loader.define(function () {
    var pageview = {name: "设备详情"},
    _maintab, _loading, _ticket, _current, 
    _ainodes, _aonodes, _dinodes, _donodes,
    _dilist, _diview, _disearch,
    _ailist, _aiview, _aisearch,
    _aolist, _aoview, _aosearch,
    _dolist, _doview, _dosearch,
    _aodialog, _dodialog, _dialarmdialog, _divaluedialog, 
    _timer, _timeout = 15000;

    pageview.init = function () {
        if (!_loading) {
            _loading = bui.loading({
                appendTo: ".device-page",
                text: "正在加载"
            });
        }

        if (!_maintab) {
            _maintab = bui.tab({
                id: "#pylon-app-device-tab",
                swipe: false,
                scroll: true
            });

            _maintab.on("to", _auto);
        }

        if (!_dilist) {
            _dilist = bui.pullrefresh({
                id: "#pylon-app-di-scroll",
                onRefresh: function () {
                    _refresh([$node.DI.id], _dilist);
                }
            });

            _diview = bui.listview({
                id: "#pylon-app-di-listview",
                callback: _dimenu
            });

            _disearch = bui.searchbar({
                id: "#pylon-app-di-search",
                delayTime: 1000,
                onInput: function (e, keyword) { },
                onRemove: function (e, keyword) {
                    _search(_dinodes, $node.DI.id, null);
                },
                callback: function (e, keyword) {
                    keyword = keyword.trim().toLowerCase();
                    _search(_dinodes, $node.DI.id, keyword);
                }
            });
        }

        if (!_ailist) {
            _ailist = bui.pullrefresh({
                id: "#pylon-app-ai-scroll",
                onRefresh: function () {
                    _refresh([$node.AI.id], _ailist);
                }
            });

            // _aiview = bui.listview({
            //     id: "#pylon-app-ai-listview",
            //     callback: function(e, menu) {

            //         menu.close();
            //         e.stopPropagation();
            //     }
            // });

            _aisearch = bui.searchbar({
                id: "#pylon-app-ai-search",
                delayTime: 1000,
                onInput: function (e, keyword) { },
                onRemove: function (e, keyword) {
                    _search(_ainodes, $node.AI.id, null);
                },
                callback: function (e, keyword) {
                    keyword = keyword.trim().toLowerCase();
                    _search(_ainodes, $node.AI.id, keyword);
                }
            });
        }

        if (!_aolist) {
            _aolist = bui.pullrefresh({
                id: "#pylon-app-ao-scroll",
                onRefresh: function () {
                    _refresh([$node.AO.id], _aolist);
                }
            });

            _aoview = bui.listview({
                id: "#pylon-app-ao-listview",
                callback: _aomenu
            });

            _aosearch = bui.searchbar({
                id: "#pylon-app-ao-search",
                delayTime: 1000,
                onInput: function (e, keyword) { },
                onRemove: function (e, keyword) {
                    _search(_aonodes, $node.AO.id, null);
                },
                callback: function (e, keyword) {
                    keyword = keyword.trim().toLowerCase();
                    _search(_aonodes, $node.AO.id, keyword);
                }
            });
        }

        if (!_dolist) {
            _dolist = bui.pullrefresh({
                id: "#pylon-app-do-scroll",
                onRefresh: function () {
                    _refresh([$node.DO.id], _dolist);
                }
            });

            _doview = bui.listview({
                id: "#pylon-app-do-listview",
                callback: _domenu
            });

            _dosearch = bui.searchbar({
                id: "#pylon-app-do-search",
                delayTime: 1000,
                onInput: function (e, keyword) { },
                onRemove: function (e, keyword) {
                    _search(_donodes, $node.DO.id, null);
                },
                callback: function (e, keyword) {
                    keyword = keyword.trim().toLowerCase();
                    _search(_donodes, $node.DO.id, keyword);
                }
            });
        }

        if (!_aodialog) {
            _aodialog = bui.dialog({
                id: "#pylon-app-ao-dialog",
                effect: "fadeInUp",
                position: "bottom",
                fullscreen: false
            });

            router.$("#pylon-app-aoctrl-cancel").on("click", function (e) {
                _aodialog.close();
            });
            router.$("#pylon-app-aoctrl-ok").on("click", function (e) {
                var dev = _current.ID;
                var id = router.$("#pylon-app-aoctrl-id").val();
                var val = router.$("#pylon-app-aoctrl-param").val();
                _ctrl(dev, id, val);
            });
        }

        if (!_dodialog) {
            _dodialog = bui.dialog({
                id: "#pylon-app-do-dialog",
                effect: "fadeInUp",
                position: "bottom",
                fullscreen: false
            });

            router.$("#pylon-app-doctrl-cancel").on("click", function (e) {
                _dodialog.close();
            });
            router.$("#pylon-app-doctrl-ok").on("click", function (e) {
                var dev = _current.ID;
                var id = router.$("#pylon-app-doctrl-id").val();
                var val = router.$("#pylon-app-do-dialog").find('input:radio[name=doparam]:checked').val();
                _ctrl(dev, id, val);
            });
        }

        if (!_dialarmdialog) {
            _dialarmdialog = bui.dialog({
                id: "#pylon-app-di-alarm-dialog",
                effect: "fadeInUp",
                position: "bottom",
                fullscreen: false
            });

            router.$("#pylon-app-dialarm-cancel").on("click", function (e) {
                _dialarmdialog.close();
            });
            router.$("#pylon-app-dialarm-ok").on("click", function (e) {
                var dev = _current.ID;
                var id = router.$("#pylon-app-dialarm-id").val();
                var val = router.$("#pylon-app-di-alarm-dialog").find("input:radio[name='dialarmparam']:checked").val();
                _level(dev, id, val, function (value) {
                    if (isNull(_dialarmdialog.target) === false) {
                        _dialarmdialog.target.attr("value", value);
                    }
                });
            });
        }

        if (!_divaluedialog) {
            _divaluedialog = bui.dialog({
                id: "#pylon-app-di-value-dialog",
                effect: "fadeInUp",
                position: "bottom",
                fullscreen: false
            });

            router.$("#pylon-app-divalue-cancel").on("click", function (e) {
                _divaluedialog.close();
            });
            router.$("#pylon-app-divalue-ok").on("click", function (e) {
                var dev = _current.ID;
                var id = router.$("#pylon-app-divalue-id").val();
                var val = router.$("#pylon-app-divalue-param").val();
                _limit(dev, id, val, function (value) {
                    if (isNull(_divaluedialog.target) === false) {
                        _divaluedialog.target.attr("value", value);
                    }
                });
            });
        }

        _ticket = getTicket();
    }

    pageview.load = function () {
        _loadbase();
        _loadnodes();
    }

    pageview.dispose = function(){
        if (isNull(_timer) === false) {
            clearTimeout(_timer);
            _timer = null;
        }
    }

    function _loadbase() {
        _emptybase();
        _current = null;
        var params = router.getPageParams();
        if (isNull(params)) return;
        if (_.has(params, "id") === false) return;
        var devices = getDevices();
        if (isNull(devices) === true) return;
        if (devices.length === 0) return;
        _current = _.find(devices, function (item) {
            return item.ID == params.id
        });
        if (isNull(_current) === true) return;
        _initbase(_current);
    }

    function _emptybase() {
        router.$("#pylon-app-device-base-id").html("--");
        router.$("#pylon-app-device-base-name").html("--");
        router.$("#pylon-app-device-base-type").html("--");
        router.$("#pylon-app-device-base-brand").html("--");
        router.$("#pylon-app-device-base-model").html("--");
        router.$("#pylon-app-device-base-room").html("--");
        router.$("#pylon-app-device-base-begin").html("--");
    }

    function _initbase(data) {
        router.$("#pylon-app-device-base-id").html(data.ID);
        router.$("#pylon-app-device-base-name").html(data.Name);
        router.$("#pylon-app-device-base-type").html(data.Type);
        router.$("#pylon-app-device-base-brand").html(data.Brand);
        router.$("#pylon-app-device-base-model").html(data.Model + " " + data.Version);
        router.$("#pylon-app-device-base-room").html(data.Room);
        router.$("#pylon-app-device-base-begin").html(data.BeginTime);
    }

    function _loadnodes() {
        try {
            _emptynodes($node.DI.id);
            _emptynodes($node.AI.id);
            _emptynodes($node.AO.id);
            _emptynodes($node.DO.id);

            if (isNull(_current) === true)
                return;

            $.ajax({
                type: 'POST',
                url: String.format("{0}getsignals?{1}&{2}", $requestURI, _ticket.token, _current.ID),
                data: null,
                dataType: "text",
                timeout: 20000,
                success: function (data, status) {
                    if (data.startWith('Error') === true) {
                        warning(data);
                        return;
                    }

                    var nodes = [];
                    if (isNullOrEmpty(data) === false) {
                        nodes = JSON.parse(data);
                    }

                    _ainodes = [], _aonodes = [], _dinodes = [], _donodes = [];
                    $.each(nodes, function (index, el) {
                        if (el.Type === $node.DO.name || el.Type == $node.DO.id) {
                            _donodes.push(el);
                        } else if (el.Type === $node.AO.name || el.Type == $node.AO.id) {
                            _aonodes.push(el);
                        } else if (el.Type === $node.AI.name || el.Type == $node.AI.id) {
                            _ainodes.push(el);
                        } else if (el.Type === $node.DI.name || el.Type == $node.DI.id) {
                            _dinodes.push(el);
                        }
                    });

                    if (_dinodes.length > 0) {
                        _initnodes(_dinodes, $node.DI.id);
                    }

                    if (_ainodes.length > 0) {
                        _initnodes(_ainodes, $node.AI.id);
                    }

                    if (_aonodes.length > 0) {
                        _initnodes(_aonodes, $node.AO.id);
                    }

                    if (_donodes.length > 0) {
                        _initnodes(_donodes, $node.DO.id);
                    }
                },
                error: function (xhr, errorType, error) {
                    warning("信号加载失败,请重试。");
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    function _emptynodes(type) {
        if (type === $node.DO.id) {
            _donodes = [];
            router.$("#pylon-app-do-listview").html("");
        } else if (type === $node.AO.id) {
            _aonodes = [];
            router.$("#pylon-app-ao-listview").html("");
        } else if (type === $node.AI.id) {
            _ainodes = [];
            router.$("#pylon-app-ai-listview").html("");
        } else if (type === $node.DI.id) {
            _dinodes = [];
            router.$("#pylon-app-di-listview").html("");
        }

        _footempty(type);
    }

    function _initnodes(data, type) {
        if (data.length === 0)
            return;

        if (type === $node.DO.id) {
            var content = _template(data, type);
            router.$("#pylon-app-do-listview").html(content);
        } else if (type === $node.AO.id) {
            var content = _template(data, type);
            router.$("#pylon-app-ao-listview").html(content);
        } else if (type === $node.AI.id) {
            var content = _template(data, type);
            router.$("#pylon-app-ai-listview").html(content);
        } else if (type === $node.DI.id) {
            var content = _template(data, type);
            router.$("#pylon-app-di-listview").html(content);
        }

        _footmore(type);
    }

    function _footempty(type) {
        if (type === $node.DO.id) {
            router.$("#pylon-app-do-scroll .bui-scroll-foot").html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
        } else if (type === $node.AO.id) {
            router.$("#pylon-app-ao-scroll .bui-scroll-foot").html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
        } else if (type === $node.AI.id) {
            router.$("#pylon-app-ai-scroll .bui-scroll-foot").html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
        } else if (type === $node.DI.id) {
            router.$("#pylon-app-di-scroll .bui-scroll-foot").html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
        }
    }

    function _footmore(type) {
        if (type === $node.DO.id) {
            router.$("#pylon-app-do-scroll .bui-scroll-foot").html('<div class="nomore">没有更多内容</div>');
        } else if (type === $node.AO.id) {
            router.$("#pylon-app-ao-scroll .bui-scroll-foot").html('<div class="nomore">没有更多内容</div>');
        } else if (type === $node.AI.id) {
            router.$("#pylon-app-ai-scroll .bui-scroll-foot").html('<div class="nomore">没有更多内容</div>');
        } else if (type === $node.DI.id) {
            router.$("#pylon-app-di-scroll .bui-scroll-foot").html('<div class="nomore">没有更多内容</div>');
        }
    }

    function _dimenu(e, menu){
        var me = router.$(e.target);
        var li = me.parent().parent();
        if (li.length > 0) {
            if (me.hasClass("alarm")) {
                router.$("#pylon-app-dialarm-id").val(li.attr("data-id"));
                var title = li.find(".item-title");
                if (title.length > 0) {
                    router.$("#pylon-app-dialarm-name").html(title.html());
                }

                router.$("#pylon-app-di-alarm-dialog").find("input:radio[name='dialarmparam'][value='" + me.attr("value") + "']").prop("checked", "checked");
                _dialarmdialog.target = me;
                _dialarmdialog.open();
            } else if (me.hasClass("value")) {
                router.$("#pylon-app-divalue-id").val(li.attr("data-id"));
                var title = li.find(".item-title");
                if (title.length > 0) {
                    router.$("#pylon-app-divalue-name").html(title.html());
                }

                router.$("#pylon-app-divalue-param").val(me.attr("value"));
                _divaluedialog.target = me;
                _divaluedialog.open();
            }
        }
        menu.close();
        e.stopPropagation();
    }

    function _aomenu(e, menu){
        var li = router.$(e.target).parent().parent();
        if (li.length > 0) {
            router.$("#pylon-app-aoctrl-id").val(li.attr("data-id"));
            router.$("#pylon-app-aoctrl-unit").html(li.attr("data-unit"));

            var title = li.find(".item-title");
            if (title.length > 0) {
                router.$("#pylon-app-aoctrl-name").html(title.html());
            }

            router.$("#pylon-app-aoctrl-param").val(0);
            _aodialog.open();
        }

        menu.close();
        e.stopPropagation();
    }

    function _domenu(e, menu){
        var li = router.$(e.target).parent().parent();
        if (li.length > 0) {
            var id = li.attr("data-id");
            var unit = li.attr("data-unit");
            router.$("#pylon-app-doctrl-id").val(id);

            var title = li.find(".item-title");
            if (title.length > 0) {
                router.$("#pylon-app-doctrl-name").html(title.html());
            }

            var options = _dooption(unit);
            router.$("#pylon-app-doctrl-param").html(options);
            _dodialog.open();
        }

        menu.close();
        e.stopPropagation();
    }

    function _dooption(unit){
        var options = [];
        var units = getUnits(unit);
        if (units.length > 0) {
            $.each(units, function (index, item) {
                options.push(`
                <li class="bui-btn bui-box">
                    <div class="span1">
                        <label for="pylon-app-doctrl-dooption${index}">${String.format("{0}-{1}", item.name, item.id)}</label>
                    </div>
                    <input id="pylon-app-doctrl-dooption${index}" type="radio" class="bui-choose" name="doparam" value="${item.id}" ${index === 0 ? 'checked="checked"' : ''}>
                </li>`);
            });
        } else {
            options.push(`
            <li class="bui-btn bui-box">
                <div class="span1">
                    <label for="pylon-app-doctrl-dooption0">常开控制-0</label>
                </div>
                <input id="pylon-app-doctrl-dooption0" type="radio" class="bui-choose" name="doparam" checked="checked" value="0">
            </li>`);
            options.push(`
            <li class="bui-btn bui-box">
                <div class="span1">
                    <label for="pylon-app-doctrl-dooption1">常闭控制-1</label>
                </div>
                <input id="pylon-app-doctrl-dooption1" type="radio" class="bui-choose" name="doparam" value="1">
            </li>`);
            options.push(`
            <li class="bui-btn bui-box">
                <div class="span1">
                    <label for="pylon-app-doctrl-dooption4">脉冲控制-4</label>
                </div>
                <input id="pylon-app-doctrl-dooption4" type="radio" class="bui-choose" name="doparam" value="4">
            </li>`);
        }

        return options.join("");
    }

    function _template(data, type) {
        var html = "";
        $.each(data, function (index, el) {
            html += `<li id="pylon-app-signal-${el.ID}" status="1" data-id="${el.ID}" data-unit="${el.ValueDesc}">
                <div class="bui-btn bui-box item-box">
                    <div class="signal-icon state0"><i class="appiconfont appicon-signal"></i></div>
                    <div class="span1">
                        <div class="bui-box item-title-box">
                            <div class="span1 item-title">${el.Name}</div>
                            <div class="item-text item-sub-title state0">${getStateName($state.S0)}</div>
                        </div>
                        <div class="bui-box item-text-box">
                            <div class="span1 item-text">
                                <span class="item-value">--</span> 
                            </div>
                            <div class="item-text">
                                <span class="item-time">2019-01-01 00:00:00</span>
                            </div>
                        </div>
                    </div>
                </div>`

            if (type === $node.DO.id) {
                html += '<div class="bui-listview-menu swipeleft"><div class="bui-btn primary">远程控制</div></div></li>';
            } else if (type === $node.AO.id) {
                html += '<div class="bui-listview-menu swipeleft"><div class="bui-btn primary">远程设定</div></div></li>';
            } else if (type === $node.AI.id) {
                html += '</li>';
            } else if (type === $node.DI.id) {
                if (el.AlarmLevel > 0) {
                    html += `<div class="bui-listview-menu swipeleft"><div class="bui-btn danger alarm" value="${el.AlarmLevel}">告警</div><div class="bui-btn primary value" value="${el.Threshold}">阈值</div></div>`
                }
                html += '</li>';
            }
        });
        return html;
    }

    function _refresh(types, pull) {
        try {
            if (isNull(_current) === true)
                return;

            if (isNull(_timer) === false) {
                clearTimeout(_timer);
                _timer = null;
            }

            $.ajax({
                type: 'POST',
                url: String.format("{0}getsignalvalues?{1}&{2}", $requestURI, _ticket.token, _current.ID),
                data: null,
                dataType: "text",
                timeout: 20000,
                success: function (data, status) {
                    if (data.startWith('Error') === true) {
                        warning(data);
                        return;
                    }

                    var values = [];
                    if (isNullOrEmpty(data) === false) {
                        values = JSON.parse(data);
                    }

                    $.each(types, function (index, item) {
                        _update(values, item);
                    });

                    if (isNull(pull) === false) {
                        pull.reverse();
                    }

                    _timer = setTimeout(_auto, _timeout);
                },
                error: function (xhr, errorType, error) {
                    warning("测值加载失败,请重试。");
                    if (isNull(pull) === false) {
                        pull.fail();
                    }
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    function _update(data, type) {
        if (data.length === 0)
            return;

        if (type === $node.DO.id) {
            if (_donodes.length === 0)
                return;

            _draw(_donodes, data, type);
        } else if (type === $node.AO.id) {
            if (_aonodes.length === 0)
                return;

            _draw(_aonodes, data, type);
        } else if (type === $node.AI.id) {
            if (_ainodes.length === 0)
                return;

            _draw(_ainodes, data, type);
        } else if (type === $node.DI.id) {
            if (_dinodes.length === 0)
                return;

            _draw(_dinodes, data, type);
        }
    }

    function _draw(nodes, data, type) {
        $.each(nodes, function (index, node) {
            var value = _.find(data, function (v) {
                return v.ID == node.ID
            });
            if (isNull(value) === false) {
                var li = router.$(String.format("#pylon-app-signal-{0}", node.ID));
                if (li.length === 0) return true;

                var stateCls = getStateCls1(value.State);
                var icon = li.find(".signal-icon");
                if (icon.length > 0) {
                    icon.attr("class", function (i, cls) {
                        return cls.replace(/state\d+/g, "").trim();
                    });
                    icon.addClass(stateCls);
                }

                var subtitle = li.find(".item-sub-title");
                if (subtitle.length > 0) {
                    subtitle.attr("class", function (i, cls) {
                        return cls.replace(/state\d+/g, "").trim();
                    });
                    subtitle.addClass(stateCls);
                    subtitle.html(getStateName(value.State));
                }

                var itemvalue = li.find(".item-value");
                if (itemvalue.length > 0) {
                    itemvalue.html(getUnit(value.Value, type, li.attr("data-unit")));
                }

                var itemtime = li.find(".item-time");
                if (itemtime.length > 0) {
                    itemtime.html(value.Time);
                }
            }
        });
    }

    function _auto(index) {
        index = index || _maintab.index();
        switch (index) {
            case 0:
                break;
            case 1:
                _refresh([$node.DI.id], null);
                break;
            case 2:
                _refresh([$node.AI.id], null);
                break;
            case 3:
                _refresh([$node.AO.id], null);
                break;
            case 4:
                _refresh([$node.DO.id], null);
                break;
        }
    }

    function _search(nodes, type, keyword) {
        var emptyed = true;
        $.each(nodes, function (index, node) {
            var li = router.$(String.format("#pylon-app-signal-{0}", node.ID));
            if (li.length === 0) return true;
            if (isNullOrEmpty(keyword) === false) {
                var title = li.find(".item-title");
                if (title.length > 0) {
                    var text = title.html();
                    if (text.toLowerCase().indexOf(keyword) !== -1) {
                        li.slideDown(300);
                        emptyed = false;
                    } else {
                        li.slideUp(300);
                    }
                }
            } else {
                li.slideDown(300);
                emptyed = false;
            }
        });

        if (emptyed === true) {
            _footempty(type);
        } else {
            _footmore(type);
        }
    }

    function _ctrl(device, signal, value) {
        try {
            $.ajax({
                type: 'POST',
                url: String.format("{0}setsignalvalue?{1}&{2}@{3}&{4}", $requestURI, _ticket.token, signal, device, value),
                data: null,
                dataType: "text",
                timeout: 20000,
                beforeSend: function (xhr, settings) {
                    _loading.option("text", "下发命令");
                    _loading.show();
                },
                success: function (data, status) {
                    if (data.startWith('Error') === true) {
                        warningdialog(data, "接口发生错误");
                        return;
                    }

                    if (data === 'true') {
                        successdialog("设置成功", "请刷新列表查看最新数据");
                    } else {
                        warningdialog("设置失败", "请确保操作有效，然后重试。");
                    }
                },
                error: function (xhr, errorType, error) {
                    warningdialog("设置失败", "请确保操作有效，然后重试。");
                },
                complete: function (xhr, status) {
                    _loading.hide();
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    function _level(device, signal, value, success) {
        try {
            $.ajax({
                type: 'POST',
                url: String.format("{0}setalarmlevel?{1}&{2}@{3}&{4}", $requestURI, _ticket.token, signal, device, value),
                data: null,
                dataType: "text",
                timeout: 20000,
                beforeSend: function (xhr, settings) {
                    _loading.option("text", "下发命令");
                    _loading.show();
                },
                success: function (data, status) {
                    if (data.startWith('Error') === true) {
                        warningdialog(data, "接口发生错误");
                        return;
                    }

                    if (data === 'true') {
                        success(value);
                        successdialog("设置成功", "请刷新列表查看最新数据");
                    } else {
                        warningdialog("设置失败", "请确保操作有效，然后重试。");
                    }
                },
                error: function (xhr, errorType, error) {
                    warningdialog("设置失败", "请确保操作有效，然后重试。");
                },
                complete: function (xhr, status) {
                    _loading.hide();
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    function _limit(device, signal, value, success) {
        try {
            $.ajax({
                type: 'POST',
                url: String.format("{0}setthreashold?{1}&{2}@{3}&{4}", $requestURI, _ticket.token, signal, device, value),
                data: null,
                dataType: "text",
                timeout: 20000,
                beforeSend: function (xhr, settings) {
                    _loading.option("text", "下发命令");
                    _loading.show();
                },
                success: function (data, status) {
                    if (data.startWith('Error') === true) {
                        warningdialog(data, "接口发生错误");
                        return;
                    }

                    if (data === 'true') {
                        success(value);
                        successdialog("设置成功", "请刷新列表查看最新数据");
                    } else {
                        warningdialog("设置失败", "请确保操作有效，然后重试。");
                    }
                },
                error: function (xhr, errorType, error) {
                    warningdialog("设置失败", "请确保操作有效，然后重试。");
                },
                complete: function (xhr, status) {
                    _loading.hide();
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    pageview.init();
    pageview.load();

    return pageview;
})