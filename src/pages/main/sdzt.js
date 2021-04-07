loader.define(function (require, exports, module) {
    var pageview = {
      name: "市电状态信号",
      request: null,
      pull: null,
      accordion: null,
      timer: null,
      nodes: null
    };
  
    pageview.init = function () {
      if (isNull(this.nodes) === true) {
        this.nodes = $sdzt;
      }

      if (isNull(this.request) === true) {
        this.request = getAppRequest();
      }

      if (isNull(this.pull) === true) {
        this.pull = bui.pullrefresh({
            id: "#pylon-app-sdzt-scroll",
            autoLoad: false,
            onRefresh: function () {
              pageview.refresh(function () {
                pageview.pull.reverse();
              });
            },
        });
      }
  
      if (isNull(this.accordion) === true) {
        this.accordion = bui.accordion({ id: "#pylon-app-sdzt-accordion", single: false });
      }

      _drawui(this.nodes);
      this.accordion.init();
      this.accordion.showAll();
    };
  
    pageview.load = function () {
      _settimer(200);
    };
  
    pageview.dispose = function () {
      _cleartimer();
    };
  
    pageview.refresh = function (done) {
      var xkeys = [];
      $.each(this.nodes, function (a, device) {
        $.each(device.nodes, function (s, item) {
          xkeys.push(item.id);
        });
      });

      if (xkeys.length === 0) {
        if (isFunction(done) === true) {
          done();
        }
        return false;
      }

      pageview.request.Post(
        {
          url: "GetSignalDatas",
          data: { id: xkeys },
        },
        function (result) {
          $.each(result.data, function (index, item) {
            var current = router.$(String.format("#pylon-sdzt-signal-{0}", item.ID));
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
  
    function _drawui(devices) {
      var footer = router.$("#pylon-app-sdzt-scroll > .bui-scroll-foot");
      var container = router.$("#pylon-app-sdzt-accordion");
      if (devices.length === 0) {
        container.html("");
        footer.html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
        return;
      }

      var html = "";
      $.each(devices, function (a, device) {
        html += `
          <dt id="pylon-sdzt-device-${device.id}" class="bui-btn bui-box">
            <div class="span1">${device.name}</div>
            <i class="icon-accordion"></i>
          </dt>
          <dd><ul class="bui-list accordion-details">
        `;

        $.each(device.nodes, function (s, item) {
            html += `<li id="pylon-sdzt-signal-${item.id}" status="1" data-id="${item.id}" data-type="${item.type}" data-desc="${item.desc}">
                <div class="bui-btn bui-box item-box">
                    <div class="signal-icon ${getStateCls1(item.state)}"><i class="appiconfont appicon-signal"></i></div>
                    <div class="span1">
                        <div class="bui-box item-title-box">
                            <div class="span1 item-title">${item.name}</div>
                            <div class="item-text item-sub-title ${getStateCls1(item.state)}">${getStateName(item.state)}</div>
                        </div>
                        <div class="bui-box item-text-box">
                            <div class="span1 item-text">
                                <span class="item-value">${getNodeValue(item.type, item.value, item.desc)}</span> 
                            </div>
                            <div class="item-text">
                                <span class="item-time">${item.time}</span>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        html += "</ul></dd>";
      });

      container.html(html);
      footer.html('<div class="nomore">没有更多内容</div>');
    };

    function _settimer(timeout) {
      pageview.timer = setTimeout(function () {
        pageview.refresh(function () {
          _cleartimer();
          _settimer();
        });
      }, timeout || 10000);
    };

    function _cleartimer() {
      if (isNull(pageview.timer) === false) {
        clearTimeout(pageview.timer);
        pageview.timer = null;
      }
    };
  
    pageview.init();
    pageview.load();
    return pageview;
  });
  