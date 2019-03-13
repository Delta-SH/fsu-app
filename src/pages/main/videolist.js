loader.define(function (require, exports, module) {
    var pageview = { name: '摄像机列表' }, _pullRefresh, _searchBar, _ticket, _devices = [{
            "ID":"001",
            "Name":"测试摄像机#01",
            "IP":"192.168.10.220",
            "Room":"苏无锡太科园3楼北机房01"
        },{
            "ID":"002",
            "Name":"测试摄像机#02",
            "IP":"192.168.10.221",
            "Room":"苏无锡太科园3楼北机房01"
        },{
            "ID":"003",
            "Name":"测试摄像机#03",
            "IP":"192.168.10.222",
            "Room":"苏无锡太科园3楼北机房01"
        },{
            "ID":"004",
            "Name":"测试摄像机#04",
            "IP":"192.168.10.223",
            "Room":"苏无锡太科园3楼北机房01"
        },{
            "ID":"005",
            "Name":"测试摄像机#05",
            "IP":"192.168.10.224",
            "Room":"苏无锡太科园3楼北机房01"
        }];;

    pageview.init = function () {
        _ticket = getTicket();
        if (!_pullRefresh) {
            _pullRefresh = bui.pullrefresh({
                id: "#pylon-app-videolist-scroll",
                autoLoad: false,
                onRefresh: _request
            });
        }

        if (!_searchBar) {
            _searchBar = bui.searchbar({
                id: "#pylon-app-videolist-search",
                onInput: function (e, keyword) {},
                onRemove: function (e, keyword) {
                    _searchBar.keyword = null;
                    _search(_searchBar.keyword);
                },
                callback: function (e, keyword) {
                    _searchBar.keyword = keyword.trim().toLowerCase();
                    _search(_searchBar.keyword);
                }
            });
        }
    }

    pageview.load = function () {
        _empty();
        var devices = _devices;
        if (isNullOrEmpty(_searchBar.keyword) === false) {
            var keyword = _searchBar.keyword;
            devices = _.filter(devices, function (item) {
                return item.Name.toLowerCase().indexOf(keyword) !== -1;
            });
            if (devices.length === 0)
                return;
        }

        var html = "";
        $.each(devices, function (index, el) {
            html += `<li id="pylon-app-videolist-${el.ID}" class="bui-btn bui-box" href="pages/main/cameralist.html?id=${el.ID}&name=${el.Name}">
                <div class="bui-icon primary"><i class="appiconfont appicon-video"></i></div>
                <div class="span1">
                    <h3 class="item-title">${el.Name}</h3>
                    <p class="item-text">${el.IP}</p>
                </div>
                <i class="icon-listright"></i>
            </li>`
        });

        if (html !== "") {
            _more(html);
        }
    }

    pageview.dispose = function(){
    }

    function _request() {
        try {
            _pullRefresh.reverse();
        } catch (error) {
            console.error(error);
        }
    }

    function _empty() {
        router.$("#pylon-app-videolist-list").html("");
        _footempty();
    }

    function _footempty() {
        router.$(".overlist .bui-scroll-foot").html('<div class="nodata"><i class="appiconfont appicon-empty-face"></i> <span>列表空空如也~</span></div>');
    }

    function _more(content) {
        router.$("#pylon-app-videolist-list").html(content);
        _footmore();
    }

    function _footmore() {
        router.$(".overlist .bui-scroll-foot").html('<div class="nomore">没有更多内容</div>');
    }

    function _search(keyword) {
        var devices = _devices;
        var emptyed = true;
        $.each(devices, function (index, node) {
            var li = router.$(String.format("#pylon-app-videolist-{0}", node.ID));
            if (li.length === 0) return true;
            if (isNullOrEmpty(keyword) === false) {
                var title = li.find("h3.item-title");
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
            _footempty();
        } else {
            _footmore();
        }
    }

    pageview.init();
    pageview.load();

    return pageview;
});