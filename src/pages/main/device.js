loader.define(function () {
  var pageview = {
    name: "设备信号",
    params: null,
    loading: null,
    request: null,
    maintab: null,
    dropdown: null,
    timer: null,
    device: null,
    nodes: null,
    xnodes: null,
    xkeys: null,
    search: null,
    pull: null,
    view: null,
    aodialog: null,
    aosignal: null,
    aoadjust: null,
    aounit: null,
    dodialog: null,
    amdialog: null,
    amparam: null,
    amalarm: null,
    amtriger: null,
    amstart: null,
    amend: null,
  };

  pageview.init = function () {
    if (isNull(this.params) === true) {
      this.params = router.getPageParams();
    }

    if (isNull(this.loading) === true) {
      this.loading = bui.loading({
        appendTo: "#pylon-app-device-detail",
        text: "正在执行",
      });
    }

    if (isNull(this.request) === true) {
      this.request = getAppRequest();
    }

    if (isNull(this.maintab) === true) {
      this.maintab = bui.tab({
        id: "#pylon-app-device-tab",
        swipe: false,
        scroll: true,
      });
    }

    if (isNull(this.dropdown) === true) {
      this.dropdown = bui.dropdown({
        id: "#pylon-data-signal-dropdown",
        data: [
          {
            name: $node.DI.name,
            value: $node.DI.id.toString(),
          },
          {
            name: $node.AI.name,
            value: $node.AI.id.toString(),
          },
          {
            name: $node.DO.name,
            value: $node.DO.id.toString(),
          },
          {
            name: $node.AO.name,
            value: $node.AO.id.toString(),
          },
          {
            name: $node.CI.name,
            value: $node.CI.id.toString(),
          },
          {
            name: $node.SI.name,
            value: $node.SI.id.toString(),
          },
        ],
        showArrow: true,
        showActive: true,
        relative: false,
        value: $node.DI.name,
        callback: function (el) {
          _inittab1();
          pageview.refresh();
        },
      });
    }

    if (isNull(this.pull) === true) {
      this.search = bui.searchbar({
        id: "#pylon-app-node-search",
        onInput: function (e, keyword) {},
        onRemove: function (e, keyword) {
          _inittab1(keyword);
          pageview.refresh();
        },
        callback: function (e, keyword) {
          _inittab1(keyword);
          pageview.refresh();
        },
      });

      this.pull = bui.pullrefresh({
        id: "#pylon-app-node-scroll",
        autoLoad: false,
        onRefresh: function () {
          pageview.refresh(function () {
            pageview.pull.reverse();
          });
        },
      });

      this.view = bui.listview({
        id: "#pylon-app-node-listview",
        callback: function (e, menu) {
          var _this = router.$(e.target);
          var _id = parseInt(_this.attr("data-id"));
          var _type = parseInt(_this.attr("data-type"));
          var _nodes = pageview.xnodes.filter(function (v) {
            return v.ID === _id;
          });

          if (_nodes.length > 0) {
            var _current = _nodes[0];
            if (_type === $node.DI.id || _type === $node.AI.id) {
              _openam(_current);
            } else if (_type === $node.AO.id) {
              _openao(_current);
            } else if (_type === $node.DO.id) {
              _opendo(_current);
            } else if (_type === $node.CI.id) {
              _openci(_current);
            }
          }

          menu.close();
          e.stopPropagation();
        },
      });
    }

    if (isNull(this.aodialog) === true) {
      this.aodialog = bui.dialog({
        id: "#pylon-app-ao-dialog",
        effect: "fadeInUp",
        position: "bottom",
        fullscreen: false,
        height: "60%",
        buttons: [],
        callback: function (e, me) {
          var button = $(e.target);
          var _this = this;
          if (button.attr("data-cmd") === "ok") {
            bui.confirm("您确定要执行吗?", function (e) {
              var text = $(e.target).text();
              if (text == "确定") {
                _reqctrl(_this.target.ID, pageview.aoadjust.val());
              }
              this.close();
            });
          } else {
            _this.close();
          }

          return false;
        },
      });

      this.aosignal = router.$("pylon-app-data-ao-name");
      this.aounit = router.$("pylon-app-ao-unit");
      this.aoadjust = router.$("pylon-app-ao-adjust");
    }

    if (isNull(this.dodialog) === true) {
      this.dodialog = bui.dialog({
        id: "#pylon-app-do-dialog",
        effect: "fadeInUp",
        position: "bottom",
        fullscreen: false,
        height: "60%",
        buttons: [],
        callback: function (e, me) {
          var button = $(e.target);
          var _this = this;
          if (button.attr("data-cmd") === "ok") {
            bui.confirm("您确定要执行吗?", function (e) {
              var text = $(e.target).text();
              if (text == "确定") {
                _reqctrl(_this.target.ID, pageview.doption.value());
              }
              this.close();
            });
          } else {
            _this.close();
          }

          return false;
        },
      });

      this.dosignal = router.$("pylon-app-data-do-name");
      this.doption = bui.select({
        id: "#pylon-app-data-do-option",
        type: "radio",
        popup: false,
        direction: "right",
        data: [],
      });
    }

    if (isNull(this.amdialog) === true) {
      this.amdialog = bui.dialog({
        id: "#pylon-app-alarm-dialog",
        effect: "fadeInUp",
        position: "bottom",
        fullscreen: false,
        height: "80%",
        buttons: [],
        callback: function (e, me) {
          var button = $(e.target);
          var _this = this;
          if (button.attr("data-cmd") === "ok") {
            bui.confirm("您确定要执行吗?", function (e) {
              var text = $(e.target).text();
              if (text == "确定") {
                _reqam();
              }
              this.close();
            });
          } else {
            _this.close();
          }

          return false;
        },
      });

      this.amsignal = router.$("pylon-app-data-signal-name");
      this.amstart = router.$("pylon-app-data-threshold-start");
      this.amend = router.$("pylon-app-data-threshold-end");
      this.amstart.on("change", function () {
        if (isNull(pageview.amparam.current) === false) {
          var val = $(this).val();
          pageview.amparam.current.Threshold = isNullOrEmpty(val, true) === true ? 0 : parseFloat(val);
        }
      });
      this.amend.on("change", function () {
        if (isNull(pageview.amparam.current) === false) {
          var val = $(this).val();
          pageview.amparam.current.BandThreshold = isNullOrEmpty(val, true) === true ? 0 : parseFloat(val);
        }
      });
      this.amparam = bui.dropdown({
        id: "#pylon-app-data-param-num",
        data: [],
        showArrow: true,
        showActive: true,
        relative: false,
        callback: function (e) {
          var val = parseInt(this.value());
          if (isNull(this.map) === false) {
            _settam((this.current = this.map[val]));
          }
        },
      });

      this.amalarm = bui.dropdown({
        id: "#pylon-app-data-alarm-level",
        showArrow: true,
        showActive: true,
        relative: false,
        callback: function (e) {
          if (isNull(pageview.amparam.current) === false) {
            pageview.amparam.current.Level = parseInt(this.value());
          }
        },
      });

      this.amtriger = bui.dropdown({
        id: "#pylon-app-data-trigger-model",
        showArrow: true,
        showActive: true,
        relative: false,
        callback: function (e) {
          if (isNull(pageview.amparam.current) === false) {
            pageview.amparam.current.TriggerMode = parseInt(this.value());
          }
        },
      });
    }
  };

  pageview.load = function () {
    this.device = null;
    this.nodes = [];
    this.xnodes = [];
    this.xkeys = [];

    var id = pageview.params.id;
    $.when(getDeviceTask(id), getAllSignalsByPidTask(id))
      .done(function (v1, v2) {
        if (isNull(v1) === false) {
          pageview.device = v1;
          _inittab0(v1);
        }

        if (isNull(v2) === false) {
          pageview.nodes = v2;
          _inittab1();
          _settimer(200);
        }
      })
      .fail(function (err) {
        warning(err);
      });
  };

  pageview.refresh = function (done) {
    if (this.xkeys.length === 0) {
      if (isFunction(done) === true) {
        done();
      }
      return false;
    }

    pageview.request.Post(
      {
        url: "GetSignalDatas",
        data: { id: pageview.xkeys },
      },
      function (result) {
        $.each(result.data, function (index, item) {
          var current = router.$(String.format("#pylon-data-signal-{0}", item.ID));
          var type = parseInt(current.attr("data-type"));
          var desc = current.attr("data-desc");
          var icon = current.find(".item-box > .signal-icon");
          var subtitle = current.find(".item-box > .span1 > .item-title-box > .item-sub-title");
          var value = current.find(".item-box >.span1 > .item-text-box .item-value");
          var time = current.find(".item-box >.span1 > .item-text-box .item-time");

          icon.attr("class", String.format("signal-icon {0}", getStateCls1(item.State)));
          subtitle.attr("class", String.format("item-text item-sub-title {0}", getStateCls1(item.State)));
          subtitle.html(getStateName(item.State));
          value.html(getNodeValue(type, item.Value, desc));
          time.html(item.Time);
        });
      },
      function (err) {},
      function () {
        if (isFunction(done) === true) {
          done();
        }
      }
    );
  };

  pageview.dispose = function () {
    _cleartimer();
  };

  function _settimer(timeout) {
    pageview.timer = setTimeout(function () {
      pageview.refresh(function () {
        _cleartimer();
        _settimer();
      });
    }, timeout || 10000);
  }

  function _cleartimer() {
    if (isNull(pageview.timer) === false) {
      clearTimeout(pageview.timer);
      pageview.timer = null;
    }
  }

  function _inittab0(data) {
    router.$("#pylon-app-device-base-id").html(data.ID);
    router.$("#pylon-app-device-base-name").html(data.Name);
    router.$("#pylon-app-device-base-type").html(data.Type);
    router.$("#pylon-app-device-base-model").html(data.Model);
    router.$("#pylon-app-device-base-brand").html(data.Brand);
    router.$("#pylon-app-device-base-capacity").html(data.RatedCapacity);
    router.$("#pylon-app-device-base-version").html(data.Version);
    router.$("#pylon-app-device-base-begin").html(data.BeginTime);
  }

  function _inittab1(text) {
    var _nodes = pageview.nodes;
    var _type = parseInt(pageview.dropdown.value());
    var _xnodes = [];
    var _xkeys = [];

    if (isNullOrEmpty(text, true) === false) {
      text = text.toLowerCase();
    } else {
      text = null;
    }

    $.each(_nodes, function (index, item) {
      if (item.Type === _type) {
        if (isNull(text) === false && item.Name.toLowerCase().indexOf(text) === -1) {
          return true;
        }

        _xnodes.push(item);
        _xkeys.push(item.ID);
      }
    });

    pageview.xnodes = _xnodes;
    pageview.xkeys = _xkeys;
    if (_type === $node.DI.id) {
      _initdi(_xnodes);
    } else if (_type === $node.AI.id) {
      _initai(_xnodes);
    } else if (_type === $node.AO.id) {
      _initao(_xnodes);
    } else if (_type === $node.DO.id) {
      _initdo(_xnodes);
    } else if (_type === $node.CI.id) {
      _initci(_xnodes);
    } else if (_type === $node.SI.id) {
      _initsi(_xnodes);
    }
  }

  function _initdi(nodes) {
    var footer = router.$("#pylon-app-node-scroll > .bui-scroll-foot");
    var container = router.$("#pylon-app-node-listview");
    if (nodes.length === 0) {
      container.html("");
      footer.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
      return;
    }

    var html = "";
    $.each(nodes, function (index, item) {
      html += `<li id="pylon-data-signal-${item.ID}" status="1" data-id="${item.ID}" data-type="${item.Type}" data-desc="${item.ValueDesc}">
                <div class="bui-btn bui-box item-box">
                    <div class="signal-icon ${getStateCls1(item.State)}"><i class="appiconfont appicon-signal"></i></div>
                    <div class="span1">
                        <div class="bui-box item-title-box">
                            <div class="span1 item-title">${item.Name}</div>
                            <div class="item-text item-sub-title ${getStateCls1(item.State)}">${getStateName(item.State)}</div>
                        </div>
                        <div class="bui-box item-text-box">
                            <div class="span1 item-text">
                                <span class="item-value">${getNodeValue(item.Type, item.Value, item.ValueDesc)}</span> 
                            </div>
                            <div class="item-text">
                                <span class="item-time">${item.Time}</span>
                            </div>
                        </div>
                    </div>
                </div>`;

      if (isNull(item.AlarmSets) == false && item.AlarmSets.length > 0) {
        html += `<div class="bui-listview-menu swipeleft"><div class="bui-btn danger" data-id="${item.ID}" data-type="${item.Type}">告警设定</div></div>`;
      }

      html += "</li>";
    });

    container.html(html);
    footer.html('<div class="nomore">没有更多内容</div>');
  }

  function _initai(nodes) {
    var footer = router.$("#pylon-app-node-scroll > .bui-scroll-foot");
    var container = router.$("#pylon-app-node-listview");
    if (nodes.length === 0) {
      container.html("");
      footer.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
      return;
    }

    var html = "";
    $.each(nodes, function (index, item) {
      html += `<li id="pylon-data-signal-${item.ID}" status="1" data-id="${item.ID}" data-type="${item.Type}" data-desc="${item.ValueDesc}">
                <div class="bui-btn bui-box item-box">
                    <div class="signal-icon ${getStateCls1(item.State)}"><i class="appiconfont appicon-signal3"></i></div>
                    <div class="span1">
                        <div class="bui-box item-title-box">
                            <div class="span1 item-title">${item.Name}</div>
                            <div class="item-text item-sub-title ${getStateCls1(item.State)}">${getStateName(item.State)}</div>
                        </div>
                        <div class="bui-box item-text-box">
                            <div class="span1 item-text">
                                <span class="item-value">${getNodeValue(item.Type, item.Value, item.ValueDesc)}</span> 
                            </div>
                            <div class="item-text">
                                <span class="item-time">${item.Time}</span>
                            </div>
                        </div>
                    </div>
                </div>`;

      if (isNull(item.AlarmSets) == false && item.AlarmSets.length > 0) {
        html += `<div class="bui-listview-menu swipeleft"><div class="bui-btn danger" data-id="${item.ID}" data-type="${item.Type}">告警设定</div></div>`;
      }

      html += "</li>";
    });

    container.html(html);
    footer.html('<div class="nomore">没有更多内容</div>');
  }

  function _initao(nodes) {
    var footer = router.$("#pylon-app-node-scroll > .bui-scroll-foot");
    var container = router.$("#pylon-app-node-listview");
    if (nodes.length === 0) {
      container.html("");
      footer.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
      return;
    }

    var html = "";
    $.each(nodes, function (index, item) {
      html += `<li id="pylon-data-signal-${item.ID}" status="1" data-id="${item.ID}" data-type="${item.Type}" data-desc="${item.ValueDesc}">
                <div class="bui-btn bui-box item-box">
                    <div class="signal-icon ${getStateCls1(item.State)}"><i class="appiconfont appicon-wifi"></i></div>
                    <div class="span1">
                        <div class="bui-box item-title-box">
                            <div class="span1 item-title">${item.Name}</div>
                            <div class="item-text item-sub-title ${getStateCls1(item.State)}">${getStateName(item.State)}</div>
                        </div>
                        <div class="bui-box item-text-box">
                            <div class="span1 item-text">
                                <span class="item-value">${getNodeValue(item.Type, item.Value, item.ValueDesc)}</span> 
                            </div>
                            <div class="item-text">
                                <span class="item-time">${item.Time}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bui-listview-menu swipeleft"><div class="bui-btn primary"  data-id="${item.ID}" data-type="${item.Type}">远程设定</div></div></li>
                </li>`;
    });

    container.html(html);
    footer.html('<div class="nomore">没有更多内容</div>');
  }

  function _initdo(nodes) {
    var footer = router.$("#pylon-app-node-scroll > .bui-scroll-foot");
    var container = router.$("#pylon-app-node-listview");
    if (nodes.length === 0) {
      container.html("");
      footer.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
      return;
    }

    var html = "";
    $.each(nodes, function (index, item) {
      html += `<li id="pylon-data-signal-${item.ID}" status="1" data-id="${item.ID}" data-type="${item.Type}" data-desc="${item.ValueDesc}">
                <div class="bui-btn bui-box item-box">
                    <div class="signal-icon ${getStateCls1(item.State)}"><i class="appiconfont appicon-wifi"></i></div>
                    <div class="span1">
                        <div class="bui-box item-title-box">
                            <div class="span1 item-title">${item.Name}</div>
                            <div class="item-text item-sub-title ${getStateCls1(item.State)}">${getStateName(item.State)}</div>
                        </div>
                        <div class="bui-box item-text-box">
                            <div class="span1 item-text">
                                <span class="item-value">${getNodeValue(item.Type, item.Value, item.ValueDesc)}</span> 
                            </div>
                            <div class="item-text">
                                <span class="item-time">${item.Time}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bui-listview-menu swipeleft"><div class="bui-btn primary" data-id="${item.ID}" data-type="${item.Type}">远程控制</div></div></li>
                </li>`;
    });

    container.html(html);
    footer.html('<div class="nomore">没有更多内容</div>');
  }

  function _initci(nodes) {
    var footer = router.$("#pylon-app-node-scroll > .bui-scroll-foot");
    var container = router.$("#pylon-app-node-listview");
    if (nodes.length === 0) {
      container.html("");
      footer.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
      return;
    }

    var html = "";
    $.each(nodes, function (index, item) {
      html += `<li id="pylon-data-signal-${item.ID}" status="1" data-id="${item.ID}" data-type="${item.Type}" data-desc="${item.ValueDesc}">
                <div class="bui-btn bui-box item-box">
                    <div class="signal-icon ${getStateCls1(item.State)}"><i class="appiconfont appicon-signal2"></i></div>
                    <div class="span1">
                        <div class="bui-box item-title-box">
                            <div class="span1 item-title">${item.Name}</div>
                            <div class="item-text item-sub-title ${getStateCls1(item.State)}">${getStateName(item.State)}</div>
                        </div>
                        <div class="bui-box item-text-box">
                            <div class="span1 item-text">
                                <span class="item-value">${getNodeValue(item.Type, item.Value, item.ValueDesc)}</span> 
                            </div>
                            <div class="item-text">
                                <span class="item-time">${item.Time}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bui-listview-menu swipeleft"><div class="bui-btn danger" data-id="${item.ID}" data-type="${item.Type}">复位</div></div>
                </li>`;
    });

    container.html(html);
    footer.html('<div class="nomore">没有更多内容</div>');
  }

  function _initsi(nodes) {
    var footer = router.$("#pylon-app-node-scroll > .bui-scroll-foot");
    var container = router.$("#pylon-app-node-listview");
    if (nodes.length === 0) {
      container.html("");
      footer.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
      return;
    }

    var html = "";
    $.each(nodes, function (index, item) {
      html += `<li id="pylon-data-signal-${item.ID}" status="1" data-id="${item.ID}" data-type="${item.Type}" data-desc="${item.ValueDesc}">
                <div class="bui-btn bui-box item-box">
                    <div class="signal-icon ${getStateCls1(item.State)}"><i class="appiconfont appicon-signal"></i></div>
                    <div class="span1">
                        <div class="bui-box item-title-box">
                            <div class="span1 item-title">${item.Name}</div>
                            <div class="item-text item-sub-title ${getStateCls1(item.State)}">${getStateName(item.State)}</div>
                        </div>
                        <div class="bui-box item-text-box">
                            <div class="span1 item-text">
                                <span class="item-value">${getNodeValue(item.Type, item.Value, item.ValueDesc)}</span> 
                            </div>
                            <div class="item-text">
                                <span class="item-time">${item.Time}</span>
                            </div>
                        </div>
                    </div>
                </div>
                </li>`;
    });

    container.html(html);
    footer.html('<div class="nomore">没有更多内容</div>');
  }

  function _openam(node) {
    var data = [];
    var map = {};
    $.each(node.AlarmSets, function (index, item) {
      map[index.toString()] = $.extend({}, item);
      data.push({
        name: "告警设定" + (index + 1).toString(),
        value: index.toString(),
      });
    });

    pageview.amsignal.val(node.Name);
    pageview.amparam.option("data", data);
    pageview.amparam.map = map;
    pageview.amparam.current = map["0"];
    pageview.amparam.active(0);
    _settam(pageview.amparam.current);

    pageview.amdialog.target = node;
    pageview.amdialog.open();
  }

  function _settam(param) {
    pageview.amalarm.value(param.Level.toString());
    pageview.amtriger.value(param.TriggerMode.toString());
    pageview.amstart.val(param.Threshold);
    pageview.amend.val(param.BandThreshold);
  }

  function _reqam() {
    var data = [];
    var map = pageview.amparam.map;
    var node = pageview.amdialog.target;
    $.each(Object.keys(map), function (index, key) {
      data.push(map[key]);
    });

    pageview.loading.show();
    pageview.request.Post(
      {
        url: "SetSigAlarmSet",
        timeout: 10000,
        data: { id: node.ID, value: data },
      },
      function (result) {
        node.AlarmSets = data;
        successdialog(isNullOrEmpty(result.msg, true) ? "执行成功" : result.msg);
      },
      function (err) {
        warningdialog("执行失败", err.message);
      },
      function () {
        pageview.loading.hide();
      }
    );
  }

  function _openao(node) {
    pageview.aosignal.val(node.Name);
    pageview.aounit.html(node.ValueDesc);
    pageview.aoadjust.val(0);

    pageview.aodialog.target = node;
    pageview.aodialog.open();
  }

  function _opendo(node) {
    var data = [];
    $.each(getUnits(node.ValueDesc), function (index, item) {
      data.push({ name: String.format("{0}-{1}", item.name, item.id), value: item.id });
    });

    if (data.length === 0) {
      data.push({ name: "常开控制-0", value: "0" });
      data.push({ name: "常闭控制-1", value: "1" });
      data.push({ name: "脉冲控制-4", value: "4" });
    }

    pageview.dosignal.val(node.Name);
    pageview.doption.option("data", data);
    pageview.doption.active(0);

    pageview.dodialog.target = node;
    pageview.dodialog.open();
  }

  function _openci(node) {
    bui.confirm("您确定要复位吗?", function (e) {
      var text = $(e.target).text();
      if (text == "确定") {
        _reqctrl(node.ID);
      }
      this.close();
    });
  }

  function _reqctrl(id, value) {
    var data = 0;
    if (isNullOrEmpty(value) === false) {
      data = parseFloat(value);
    }

    pageview.loading.show();
    pageview.request.Post(
      {
        url: "SetSignalValue",
        timeout: 10000,
        data: { id: id, value: data },
      },
      function (result) {
        successdialog(isNullOrEmpty(result.msg, true) ? "执行成功" : result.msg);
      },
      function (err) {
        warningdialog("执行失败", err.message);
      },
      function () {
        pageview.loading.hide();
      }
    );
  }

  pageview.init();
  pageview.load();
  return pageview;
});
