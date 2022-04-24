(function (root, factory) {
  /* CommonJS */
  if (typeof exports == "object") module.exports = factory();
  /* AMD module */
  else if (typeof define == "function" && define.amd) define(factory);

  /*第一处修改，将wwtemplate改为元素名(data-wwclass的值)*/
  else root.wwtemplate = factory();
}(this, function () {
  "use strict";

  /*第二处修改，将wwtemplate改为元素名(data-wwclass的值)*/
  var wwclassName = /*INSBEGIN:WWCLSNAME*/
    "baidumap"
    /*INSEND:WWCLSNAME*/
    ;

  /*默认没有依赖资源
    function loadDependence( fncallback ) {
        if ( typeof fncallback === "function" ) {
            fncallback();
        }
    }
 //*/

  //* 加载依赖资源, 如没有依赖资源可直接回调
  var loadDependence = function (fncallback) {
    // 这里依赖具体的依赖对象，由于可能从其它元素中被加载，因此名称需要使用依赖库的名称，并需要settimeout来等待。
    // 本模板只支持一个依赖库，如果需要多个依赖库，需要改进。
    if (!window.wwload.baidumap) {
      // window.wwload.baidumap = "wait";
      // requirejs.config( {
      // 	paths: {
      // 		"baidumap": ""
      // 	},
      // 	// "shim": {
      // 	//   "baidumap": {
      // 	//     deps: ["jquery"]
      // 	//   }
      // 	// }
      // } );
      var csssrc, jssrc;
      var cssstr = "//api.map.baidu.com/library/TrafficControl/1.4/src/TrafficControl_min.css";
      var jsstr = "//api.map.baidu.com/library/TrafficControl/1.4/src/TrafficControl_min.js";
      var protocol = window.location.protocol;
      if (protocol == "https:") {
        csssrc = "css!" + protocol + cssstr;
        jssrc = protocol + jsstr;
      } else {
        csssrc = "css!http:" + cssstr;
        jssrc = "http:" + jsstr;
      }
      require([csssrc, jssrc], function () {
        window.wwload.baidumap = true;
        replace();
        fncallback();
      });
    } else if (window.wwload.baidumap === "wait") {
      setTimeout(function () {
        loadDependence(fncallback);
      }, 100);
    } else {
      replace();
      fncallback();
    }

    function replace() {
      loadDependence = function (fncallback) {
        fncallback();
      };
    }
  };
  //*/


  // 本函数处理元素初始化动作
  var init = function () {
    init = function () {
      return true;
    };

    $.wwclass.addEvtinHandler(wwclassName, evtInHandler);

    // 如有其他初始化动作, 请继续在下方添加
  };

  function isTrue(data) {
    if (data == "false") {
      return false;
    }
    return !!data;
  }

  function getTypedValue(value) {
    if (value == "false") {
      return false;
    } else if (!!!value) {
      return false;
    }
    var i = undefined;
    try {
      i = JSON.parse(value);
    } catch (e) {
      //console.error("getJSONprop error");
    }
    if (i) {
      return i;
    } else {
      return true;
    }
  }

  function localSearchFuc($ele, local, results) {
    if (local.getStatus() == BMAP_STATUS_SUCCESS) {
      // console.log(results);
      var data = [];
      if ($.isArray(results)) {
        for (var i = 0, l = results.length; i < l; i++) {
          for (var i1 = 0; i1 < results[i].getCurrentNumPois(); i1++) {
            data.push(results[i].getPoi(i1));
          }
        }
      } else {
        for (var i2 = 0; i2 < results.getCurrentNumPois(); i2++) {
          data.push(results.getPoi(i2));
        }
      }
      // console.log(data);
      $.wwclass.helper.anijsTrigger($ele, "LocalSearchSuccess.baidu");
      $.wwclass.runCommand([{
        "command": "updatelv",
        "params": [{
          getposui_result: data
        }]
      }]);
    } else {
      switch (local.getStatus()) {
        case BMAP_STATUS_CITY_LIST:
          console.error("BMAP_STATUS_CITY_LIST:城市列表。对应数值“1”");
          break;
        case BMAP_STATUS_UNKNOWN_LOCATION:
          console.error("BMAP_STATUS_UNKNOWN_LOCATION:位置结果未知。对应数值“2”");
          break;
        case BMAP_STATUS_UNKNOWN_ROUTE:
          console.error("BMAP_STATUS_UNKNOWN_ROUTE:导航结果未知。对应数值“3”");
          break;
        case BMAP_STATUS_INVALID_KEY:
          console.error("BMAP_STATUS_INVALID_KEY:非法密钥。对应数值“4”");
          break;
        case BMAP_STATUS_INVALID_REQUEST:
          console.error("BMAP_STATUS_INVALID_REQUEST:非法请求。对应数值“5”");
          break;
        case BMAP_STATUS_PERMISSION_DENIED:
          console.error("BMAP_STATUS_PERMISSION_DENIED:没有权限。对应数值“6”");
          break;
        case BMAP_STATUS_SERVICE_UNAVAILABLE:
          console.error("BMAP_STATUS_SERVICE_UNAVAILABLE:服务不可用。对应数值“7”");
          break;
        case BMAP_STATUS_TIMEOUT:
          console.error("BMAP_STATUS_TIMEOUT:超时。对应数值“8”");
          break;
        default:
          console.error("");
      }
      console.error("位置检索失败");
      $.wwclass.helper.anijsTrigger($ele, "LocalSearchError.baidu");
    }
  }

  var remarkerPoints = [];

  // 元素初始化——每个wwclass元素只会被初始化一次。, 传入了元素对象($前缀表明是一个jquery对象).
  function processElement($ele) {
    if (!$ele.attr("id")) {
      $ele.attr("id", "map-" + $.wwclass.helper.randomNumber());
    }
    // 对 $ele 元素做对应处理
    $.wwclass.helper.onVisibleDo($ele, function ($ele) {
      // 地图配置设置-----------------------
      var zoom = $ele.attr("data--zoom") || 11; // 缩放级别
      var centerPoint = $ele.attr("data--center") ? JSON.parse($ele.attr("data--center")) : {
        "lng": 116.404,
        "lat": 39.915
      };
      var city = $ele.attr("data--city") || "北京";
      var mapType = "";
      var i;
      var dragging = $ele.attr("data--dragging") || true; // 启用地图拖拽，默认启用。
      var scrollWheelZoom = $ele.attr("data--scroll-wheel-zoom") || false; // 启用滚轮放大缩小，默认禁用。
      var doubleClickZoom = $ele.attr("data--double-click-zoom") || true; // 启用双击放大，默认启用。
      var keyboard = $ele.attr("data--keyboard") || false; // 启用键盘操作，默认禁用。键盘的上、下、左、右键可连续移动地图。同时按下其中两个键可使地图进行对角移动。PgUp、PgDn、Home和End键会使地图平移其1/2的大小。+、-键会使地图放大或缩小一级。
      var inertialDragging = $ele.attr("data--inertial-dragging") || false; // 启用地图惯性拖拽，默认禁用。
      var continuousZoom = $ele.attr("data--continuous-zoom") || false; // 启用连续缩放效果，默认禁用。
      var pinchToZoom = $ele.attr("data--pinch-to-zoom") || true; // 启用双指操作缩放，默认启用。
      var autoResize = $ele.attr("data--auto-resize") || true; // 启用自动适应容器尺寸变化，默认启用。
      var defaultCursor = $ele.attr("data--default-cursor") || false; // 设置地图默认的鼠标指针样式。参数cursor应符合CSS的cursor属性规范。
      var draggingCursor = $ele.attr("data--dragging-cursor") || false; // 设置拖拽地图时的鼠标指针样式。参数cursor应符合CSS的cursor属性规范。
      var minZoom = $ele.attr("data--min-zoom") || 3; // 设置地图允许的最小级别。取值不得小于地图类型所允许的最小级别。
      var maxZoom = $ele.attr("data--max-zoom") || 19; // 设置地图允许的最大级别。取值不得大于地图类型所允许的最大级别。
      var mapStyle = $ele.attr("data--map-style") || false; // 设置地图样式，样式包括地图底图颜色和地图要素是否展示两部分。
      var draggingPoint = $ele.attr("data--dragging-point") || false; // 设置地图样式，样式包括地图底图颜色和地图要素是否展示两部分。
      var isdrag = $ele.attr("data-dragging") || false;
      var searchPoint = $ele.attr("data--search-point");
      var searchArray = $ele.attr("data--search-array");
      var transitPolicy = $ele.attr("data--transit-policy");
      var drivingPolicy = $ele.attr("data--driving-policy");
      var openTransitRoute = $ele.attr("data--open-transit-route");
      var openWalkingRoute = $ele.attr("data--open-walking-route");
      var openDrivingRoute = $ele.attr("data--open-driving-route");
      var routeStart = $ele.attr("data--route-start");
      var routeEnd = $ele.attr("data--route-end");
      var markerPoints = $ele.attr("data--marker-points");

      // 地图控件设置-----------------------
      /* 地图类型控件
      {
        type: BMAP_MAPTYPE_CONTROL_HORIZONTAL, // BMAP_MAPTYPE_CONTROL_HORIZONTAL 按钮水平方式展示，默认采用此类型展示。BMAP_MAPTYPE_CONTROL_DROPDOWN 按钮呈下拉列表方式展示。BMAP_MAPTYPE_CONTROL_MAP  以图片方式展示类型控件，设置该类型后无法指定maptypes属性。
        mapTypes: [
          BMAP_NORMAL_MAP, // 此地图类型展示普通街道视图。
          BMAP_PERSPECTIVE_MAP, // 此地图类型展示透视图像视图。
          BMAP_SATELLITE_MAP, //此地图类型展示卫星视图。
          BMAP_HYBRID_MAP // 此地图类型展示卫星和路网的混合视图。
        ],
        anchor: BMAP_ANCHOR_TOP_LEFT // BMAP_ANCHOR_TOP_LEFT  控件将定位到地图的左上角。BMAP_ANCHOR_TOP_RIGHT 控件将定位到地图的右上角。BMAP_ANCHOR_BOTTOM_LEFT 控件将定位到地图的左下角。BMAP_ANCHOR_BOTTOM_RIGHT  控件将定位到地图的右下角。
      }*/
      var mapTypeControl = $ele.attr("data--map-type-control") || false;

      /* 缩略图
      {
        size: 50, // 缩略地图控件的大小。
        isOpen: false, // 缩略地图添加到地图后的开合状态，默认为关闭。
        offset: { // 控件的偏移值。
          width: 10,
          height: 10
        },
        anchor: BMAP_ANCHOR_TOP_LEFT // BMAP_ANCHOR_TOP_LEFT  控件将定位到地图的左上角。BMAP_ANCHOR_TOP_RIGHT 控件将定位到地图的右上角。BMAP_ANCHOR_BOTTOM_LEFT 控件将定位到地图的左下角。BMAP_ANCHOR_BOTTOM_RIGHT  控件将定位到地图的右下角。
      }*/
      var overviewMapControl = $ele.attr("data--overview-map-control") || false;

      /* 定位控件
      {
        showAddressBar: true, // 是否显示定位信息面板。默认显示定位信息面板。
        enableAutoLocation: false, // 添加控件时是否进行定位。默认添加控件时不进行定位。
        locationIcon: { // 可自定义定位中心点的Icon样式。
          url: url,
          width: 10,
          height: 10
        }
        offset: { // 控件的偏移值。
          width: 10,
          height: 10
        },
        anchor: BMAP_ANCHOR_TOP_LEFT // BMAP_ANCHOR_TOP_LEFT  控件将定位到地图的左上角。BMAP_ANCHOR_TOP_RIGHT 控件将定位到地图的右上角。BMAP_ANCHOR_BOTTOM_LEFT 控件将定位到地图的左下角。BMAP_ANCHOR_BOTTOM_RIGHT  控件将定位到地图的右下角。
      }*/
      var GeolocationControl = $ele.attr("data--geolocation-control") || false;

      /* 地图的平移缩放控件，可以对地图进行上下左右四个方向的平移和缩放操作。
      {
        enableGeolocation: false, // 控件是否集成定位功能，默认为false。
        showZoomInfo: false, // 是否显示级别提示信息。
        type: BMAP_NAVIGATION_CONTROL_LARGE, // BMAP_NAVIGATION_CONTROL_LARGE 标准的平移缩放控件（包括平移、缩放按钮和滑块）。BMAP_NAVIGATION_CONTROL_SMALL 仅包含平移和缩放按钮。BMAP_NAVIGATION_CONTROL_PAN 仅包含平移按钮。BMAP_NAVIGATION_CONTROL_ZOOM  仅包含缩放按钮。
        offset: { // 控件的偏移值。
          width: 10,
          height: 10
        },
        anchor: BMAP_ANCHOR_TOP_LEFT // BMAP_ANCHOR_TOP_LEFT  控件将定位到地图的左上角。BMAP_ANCHOR_TOP_RIGHT 控件将定位到地图的右上角。BMAP_ANCHOR_BOTTOM_LEFT 控件将定位到地图的左下角。BMAP_ANCHOR_BOTTOM_RIGHT  控件将定位到地图的右下角。
      }*/
      var navigationControl = $ele.attr("data--navigation-control") || false;

      /* 第三方版权控件
      {
        copyright: {
          id: 123, // 该版权信息的唯一标识符。
          content: asd, // 该版权的文本信息，用于显示在地图上，支持HTML内容。
          bounds: { // 该版权信息所适用的地理区域。
 
          }
        }
      }*/
      var copyrightControl = $ele.attr("data--copyright-control") || false;

      /* 城市列表控件
      {
        offset: { // 控件的偏移值。
          width: 10,
          height: 10
        },
        anchor: BMAP_ANCHOR_TOP_LEFT // BMAP_ANCHOR_TOP_LEFT  控件将定位到地图的左上角。BMAP_ANCHOR_TOP_RIGHT 控件将定位到地图的右上角。BMAP_ANCHOR_BOTTOM_LEFT 控件将定位到地图的左下角。BMAP_ANCHOR_BOTTOM_RIGHT  控件将定位到地图的右下角。
      }*/
      var cityListControl = $ele.attr("data--city-list-control") || false;

      /* 比例尺控件
      {
        offset: { // 控件的偏移值。
          width: 10,
          height: 10
        },
        anchor: BMAP_ANCHOR_TOP_LEFT // BMAP_ANCHOR_TOP_LEFT  控件将定位到地图的左上角。BMAP_ANCHOR_TOP_RIGHT 控件将定位到地图的右上角。BMAP_ANCHOR_BOTTOM_LEFT 控件将定位到地图的左下角。BMAP_ANCHOR_BOTTOM_RIGHT  控件将定位到地图的右下角。
      }*/
      var scaleControl = $ele.attr("data--scale-control") || false;

      /* 全景控件
      {
        offset: { // 控件的偏移值。
          width: 10,
          height: 10
        },
        anchor: BMAP_ANCHOR_TOP_LEFT // BMAP_ANCHOR_TOP_LEFT  控件将定位到地图的左上角。BMAP_ANCHOR_TOP_RIGHT 控件将定位到地图的右上角。BMAP_ANCHOR_BOTTOM_LEFT 控件将定位到地图的左下角。BMAP_ANCHOR_BOTTOM_RIGHT  控件将定位到地图的右下角。
      }*/
      var panoramaControl = $ele.attr("data--panorama-control") || false;

      /* 路况信息控件
      {
        showPanel: false, // 是否显示路况提示面板
        offset: { // 控件的偏移值。
          width: 10,
          height: 10
        },
        anchor: BMAP_ANCHOR_TOP_LEFT // BMAP_ANCHOR_TOP_LEFT  控件将定位到地图的左上角。BMAP_ANCHOR_TOP_RIGHT 控件将定位到地图的右上角。BMAP_ANCHOR_BOTTOM_LEFT 控件将定位到地图的左下角。BMAP_ANCHOR_BOTTOM_RIGHT  控件将定位到地图的右下角。
      }*/
      var trafficControl = $ele.attr("data--traffic-control") || false;



      // 地图图层设置-----------------------
      /* 交通流量图层。*/
      var trafficLayer = $ele.attr("data--traffic-layer") || false;

      /* 全景覆盖的区域图层。*/
      var panoramaCoverageLayer = $ele.attr("data--panorama-coverage-layer") || false;

      //地图其他功能设置-----------------------
      /* 周边检索功能
      {
                map:map,
                panel:"",
                selectFirstResult:true,
                autoViewport:true,
                highlightMode:BMAP_HIGHLIGHT_STEP	//驾车结果展现中点击列表后的展现点步骤、BMAP_HIGHLIGHT_ROUTE	驾车结果展现中点击列表后的展现路段
 
      }*/
      var localSearch = $ele.attr("data--local-search") || false;
      //地图线路功能
      /* 公交、地铁线路
      {
            renderOptions: {
                map: map,
                panel:"",
                autoViewport:false,
            },
            policy:BMAP_TRANSIT_POLICY_LEAST_TIME, //公交导航的策略参数
            pageCapacity:2,
      }
      */
      var transitRoute = $ele.attr("data--transit-route") || false;
      /* 驾车线路
      {
            renderOptions: {
                map: map,
                panel:"",
                autoViewport:false,
            },
            policy:BMAP_DRIVING_POLICY_LEAST_TIME, //驾车的策略参数
      }
      */
      var drivingRoute = $ele.attr("data--driving-route") || false;
      /* 步行线路
      {
            renderOptions: {
                map: map,
                panel:"",
                autoViewport:false,
            }
      }
      */
      var walkingRoute = $ele.attr("data--walking-route") || false;

      var map = new BMap.Map($ele.attr("id")); // 创建Map实例


      var opensearch = $ele.attr("data-opensearch");
      if (opensearch == "true") {
          //添加地址输出当前地址坐标
          var localSearch1 = new BMap.LocalSearch(map);
          localSearch1.enableAutoViewport(); //允许自动调节窗体大小
          var chaxuan = document.getElementById("searchid");
          chaxuan.onclick = function () {
              map.clearOverlays();//清空原来的标注
              var keyword = document.getElementById("address").value;
              $.wwclass.helper.updateProp($ele, "data-x-address", keyword);
              localSearch1.setSearchCompleteCallback(function (searchResult) {
                  var poi = searchResult.getPoi(0);
                  var zuobiao = document.getElementById("coordinate").value = poi.point.lng + "," + poi.point.lat;
                  $.wwclass.helper.updateProp($ele, "data-x-searchpoint", zuobiao);
                  map.centerAndZoom(poi.point, 13);
                  var marker = new BMap.Marker(new BMap.Point(poi.point.lng, poi.point.lat));  // 创建标注，为要查询的地方对应的经纬度
                  map.addOverlay(marker);
              });
              localSearch1.search(keyword);
          }
     
      }

      var opensearchaddress = $ele.attr("data-opensearchaddress");
      if (opensearchaddress == "true") {
        //添加搜索框start
        function G(id) {
          return document.getElementById(id);
        }

        var ac = new BMap.Autocomplete(    //建立一个自动完成的对象
          {
            "input": "suggestId"
            , "location": map
          });

        ac.addEventListener("onhighlight", function (e) {  //鼠标放在下拉列表上的事件
          var str = "";
          var _value = e.fromitem.value;
          var value = "";
          if (e.fromitem.index > -1) {
            value = _value.province + _value.city + _value.district + _value.street + _value.business;
          }
          str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

          value = "";
          if (e.toitem.index > -1) {
            _value = e.toitem.value;
            value = _value.province + _value.city + _value.district + _value.street + _value.business;
          }
          str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
          G("searchResultPanel").innerHTML = str;
          $.wwclass.helper.updateProp($ele, "data-x-searchaddress", value);
          // console.log(value);
          // console.log(str);
        });

        var myValue;
        ac.addEventListener("onconfirm", function (e) {    //鼠标点击下拉列表后的事件
          var _value = e.item.value;
          myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
          G("searchResultPanel").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;

          setPlace();
        });

        function setPlace() {
          map.clearOverlays();    //清除地图上所有覆盖物
          function myFun() {
            var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
            map.centerAndZoom(pp, 18);
            map.addOverlay(new BMap.Marker(pp));    //添加标注
          }
          var local = new BMap.LocalSearch(map, { //智能搜索
            onSearchComplete: myFun
          });
          local.search(myValue);
        }
      }
      //结束搜索框end






      $ele.data("map", map); // 保存示例
      map.centerAndZoom(new BMap.Point(centerPoint.lng, centerPoint.lat), zoom); // 初始化地图,设置中心点坐标和地图级别
      map.setCurrentCity(city); // 设置地图显示的城市 此项是必须设置的

      if (isTrue(dragging)) {
        map.enableDragging();
      } else {
        map.disableDragging();
      }

      if (isTrue(scrollWheelZoom)) {
        map.enableScrollWheelZoom();
      } else {
        map.disableScrollWheelZoom();
      }

      if (isTrue(doubleClickZoom)) {
        map.enableDoubleClickZoom();
      } else {
        map.disableDoubleClickZoom();
      }

      if (isTrue(keyboard)) {
        map.enableKeyboard();
      } else {
        map.disableKeyboard();
      }

      if (isTrue(inertialDragging)) {
        map.enableInertialDragging();
      } else {
        map.disableInertialDragging();
      }

      if (isTrue(continuousZoom)) {
        map.enableContinuousZoom();
      } else {
        map.disableContinuousZoom();
      }

      if (isTrue(pinchToZoom)) {
        map.enablePinchToZoom();
      } else {
        map.disablePinchToZoom();
      }

      if (isTrue(autoResize)) {
        map.enableAutoResize();
      } else {
        map.disableAutoResize();
      }

      if (isTrue(defaultCursor)) {
        map.setDefaultCursor(defaultCursor);
      }

      if (isTrue(draggingCursor)) {
        map.setDraggingCursor(draggingCursor);
      }

      if (isTrue(minZoom)) {
        map.setMinZoom(minZoom);
      }

      if (isTrue(maxZoom)) {
        map.setMaxZoom(maxZoom);
      }

      if (isTrue(mapStyle)) {
        map.setMapStyle(mapStyle);
      }

      // // 控件类初始化
      mapTypeControl = getTypedValue(mapTypeControl);
      // overviewMapControl = getTypedValue(overviewMapControl);
      GeolocationControl = getTypedValue(GeolocationControl);
      navigationControl = getTypedValue(navigationControl);
      // copyrightControl = getTypedValue(copyrightControl);
      // cityListControl = getTypedValue(cityListControl);
      // scaleControl = getTypedValue(scaleControl);
      // panoramaControl = getTypedValue(panoramaControl);
      trafficControl = getTypedValue(trafficControl);
      if (mapTypeControl) {
        mapTypeControl.mapTypes = [];
        if (mapTypeControl === true) {
          i = new BMap.MapTypeControl();
          map.addControl(i);
        } else {
          if (mapTypeControl.anchor) {
            mapTypeControl.anchor = eval(mapTypeControl.anchor);
          }
          if (mapTypeControl.type) {
            mapTypeControl.type = eval(mapTypeControl.type);
          }
          if (mapTypeControl.maptypes) {
            for (var i = 0; i < mapTypeControl.maptypes.length; i++) {
              mapTypeControl.mapTypes[i] = eval(mapTypeControl.maptypes[i]);
            }
          }
          if (mapTypeControl.mapTypes.length === 0) {
            delete mapTypeControl.mapTypes;
            delete mapTypeControl.maptypes;
          }
          i = new BMap.MapTypeControl(mapTypeControl);
          map.addControl(i);
        }
      }
      if (GeolocationControl) {
        if (GeolocationControl === true) {
          i = new BMap.GeolocationControl();
          map.addControl(i);
        } else {
          if (GeolocationControl.anchor) {
            GeolocationControl.anchor = eval(GeolocationControl.anchor);
          }
          if (GeolocationControl.offset) {
            GeolocationControl.offset = new BMap.Size(GeolocationControl.offset.width, GeolocationControl.offset.height);
          }
          if (GeolocationControl.locationIcon) {
            GeolocationControl.locationIcon = new BMap.Icon(
              GeolocationControl.locationIcon.url,
              new BMap.Size(GeolocationControl.locationIcon.width, GeolocationControl.locationIcon.height));
          }
          i = new BMap.GeolocationControl(GeolocationControl);
          i.addEventListener("locationSuccess", function (e) {
            // 定位成功事件
            // console.log(e);
            var address = '';
            address += e.addressComponent.province;
            address += e.addressComponent.city;
            address += e.addressComponent.district;
            address += e.addressComponent.street;
            address += e.addressComponent.streetNumber;
            console.log("当前定位地址为：" + address);
            $.wwclass.helper.updateProp($ele, "data-x-geoaddress", JSON.stringify(e.addressComponent));
            $.wwclass.helper.updateProp($ele, "data-x-geopoint", JSON.stringify(e.points));
            // $.wwclass.helper.anijsTrigger($ele,"baidumapgeosuccess");
          });
          i.addEventListener("locationError", function (e) {
            // 定位失败事件
            $.wwclass.helper.anijsTrigger($ele, "baidumapgeoerror");
            // console.log(e.message);
          });
          map.addControl(i);
        }
        var ii = 0;
        map.addEventListener("tilesloaded", function (e) {
          if (ii === 0) {
            if (GeolocationControl.enableAutoLocation) {
              $ele.find(".BMap_geolocationIcon").trigger("click");
            }
          }
          ii++;
        });
      }
      if (navigationControl) {
        if (navigationControl === true) {
          i = new BMap.NavigationControl();
          map.addControl(i);
        } else {
          if (navigationControl.anchor) {
            navigationControl.anchor = eval(navigationControl.anchor);
          }
          if (navigationControl.type) {
            navigationControl.type = eval(navigationControl.type);
          }
          i = new BMap.NavigationControl(navigationControl);
          map.addControl(i);
        }
      }
      if (trafficControl) {
        if (trafficControl === true) {
          i = new BMapLib.TrafficControl();
          map.addControl(i);
        } else {
          if (trafficControl.anchor) {
            trafficControl.anchor = eval(trafficControl.anchor);
          }
          i = new BMapLib.TrafficControl(trafficControl.showPanel);
          map.addControl(i);
          i.setAnchor(trafficControl.anchor);
        }
      }
      // 其他初始化
      if (isTrue(draggingPoint)) {
        try {
          draggingPoint = JSON.parse(draggingPoint);
        } catch (e) {
          console.info('拖拽点属性 data--dragging-point 的值格式非地图的位置格式, 如:{"lng": 116.404,"lat": 39.915}, 因此将默认处理为当前视口的中心点.');
          draggingPoint = map.getCenter();
        }
        $ele.attr("data-x-point", JSON.stringify(draggingPoint));
        var point = new BMap.Point(draggingPoint.lng, draggingPoint.lat);
        var marker = new BMap.Marker(point); // 创建标注
        map.addOverlay(marker); // 将标注添加到地图中
        if (isTrue(dragging)) {
          marker.enableDragging(); // 可拖拽
        } else {
          marker.disableDragging(); // 不可拖拽
        }
        $ele.data("dragging-point", marker);
        marker.addEventListener("dragend", function (data) {
          $.wwclass.helper.updateProp($ele, "data-x-point", JSON.stringify(data.point));
          $.wwclass.helper.updateProp($ele, "data--dragging-point", JSON.stringify(data.point));
        });
        marker.addEventListener("click", function () {
          var p = this.getPosition(); //获取marker的位置
          // alert("marker的位置是" + p.lng + "," + p.lat);
          $.wwclass.helper.updateProp($ele, "data-x-clickpoint", JSON.stringify(p));
          $.wwclass.helper.anijsTrigger($ele, "markerallclick");
        });
      }

      //周边检索初始化
      if (localSearch) {
        var LocalSearchSuccess = {};
        if (searchArray) {
          LocalSearchSuccess = {
            renderOptions: {
              map: map
            },
            onSearchComplete: function (results) {
              localSearchFuc($ele, local, results);
            }
          };
        } else {
          LocalSearchSuccess = {
            onSearchComplete: function (results) {
              localSearchFuc($ele, local, results);
            }
          };
        }
        var LocalSearchOptions = $.extend(LocalSearchSuccess.renderOptions, getTypedValue(localSearch));

        // console.log(LocalSearchSuccess);
        var local = new BMap.LocalSearch(map, LocalSearchSuccess);
        $ele.data("local", local);
        if (searchArray) {
          if (searchPoint) {
            searchPoint = JSON.parse(searchPoint);
            // console.log(new BMap.Point(searchPoint.lng, searchPoint.lat));
            local.searchNearby(JSON.parse(searchArray), new BMap.Point(searchPoint.lng, searchPoint.lat), 1000);
          } else {
            var geolocation = new BMap.Geolocation();
            geolocation.getCurrentPosition(function (pos) {
              // console.log(new BMap.Point(parseFloat(pos.longitude), parseFloat(pos.latitude)));
              local.searchNearby(JSON.parse(searchArray), new BMap.Point(parseFloat(pos.longitude), parseFloat(pos.latitude)), 1000);
            });
          }
        } else {
          if (searchPoint) {
            searchPoint = JSON.parse(searchPoint);
            var array = ["美食", "购物", "景点", "公园", "运动健身", "电影", "医院", "学校", "酒店"];
            // map.setCenter(new BMap.Point(pos.longitude, pos.latitude));
            // map.setZoom(12);
            local.searchNearby(array, new BMap.Point(searchPoint.lng, searchPoint.lat), 1000);
          } else {
            var geolocation = new BMap.Geolocation();
            geolocation.getCurrentPosition(function (pos) {
              var array = ["美食", "购物", "景点", "公园", "运动健身", "电影", "医院", "学校", "酒店"];
              map.setCenter(new BMap.Point(pos.longitude, pos.latitude));
              var point = '{"lng":' + pos.longitude + ',"lat":' + pos.latitude + '}';
              $.wwclass.helper.updateProp($ele, "data--dragging-point", point);
              local.searchNearby(array, new BMap.Point(pos.longitude, pos.latitude), 1000);
            });
          }
        }
      }

      //路线初始化
      //公交路线
      if (transitRoute) {
        transitRoute = getTypedValue(transitRoute);
        var transitRouteSuccess;
        var renderOptions = {
          map: map,
        };
        if (transitRoute.render) {
          transitRouteSuccess = $.extend(renderOptions, transitRoute.render);
        }
        if (transitPolicy) {
          transitPolicy = eval(transitPolicy);
        }
        var transitRouteOptions = {
          renderOptions: transitRouteSuccess,
          policy: transitPolicy,
          pageCapacity: transitRoute.pageCapacity
        };
        // console.log(transitRouteOptions);
        var transit = new BMap.TransitRoute(map, transitRouteOptions);
        $ele.data("transitRoute", transit);
        if (isTrue(openTransitRoute)) {
          map.clearOverlays();
          transit.setPolicy(transitPolicy);
          transit.search(routeStart, routeEnd);
        }
      }
      //驾车路线
      if (drivingRoute) {
        drivingRoute = getTypedValue(drivingRoute);
        var drivingRouteSuccess;
        var drivingRender = {
          map: map,
        };
        drivingRouteSuccess = $.extend(drivingRender, drivingRoute);
        if (drivingPolicy) {
          drivingPolicy = eval(drivingPolicy);
        }
        var drivingRouteOptions = {
          renderOptions: drivingRouteSuccess,
          policy: drivingPolicy
        };
        // console.log(drivingRouteOptions);
        var driving = new BMap.DrivingRoute(map, drivingRouteOptions);
        $ele.data("drivingRoute", driving);
        if (isTrue(openDrivingRoute)) {
          map.clearOverlays();
          driving.setPolicy(drivingPolicy);
          driving.search(routeStart, routeEnd);
        }
      }
      //步行路线
      if (walkingRoute) {
        walkingRoute = getTypedValue(walkingRoute);
        var walkingRouteSuccess;
        var walkingRender = {
          map: map,
        };
        walkingRouteSuccess = $.extend(walkingRender, walkingRoute);
        var walkingRouteOptions = {
          renderOptions: walkingRouteSuccess
        };
        // console.log(walkingRouteOptions);
        var walking = new BMap.WalkingRoute(map, walkingRouteOptions);
        $ele.data("walkingRoute", walking);
        if (isTrue(openWalkingRoute)) {
          map.clearOverlays();
          walking.search(routeStart, routeEnd);
        }
      }
      // 标注
      if (markerPoints) {
        for (var re = 0; re < remarkerPoints.length; re++) {
          map.removeOverlay(remarkerPoints[re]);
        }
        remarkerPoints = [];
        markerPoints = getTypedValue(markerPoints);
        // console.log(markerPoints);
        var markerpoint, markerobject, markers, markericon, markersize;
        for (var n = 0; n < markerPoints.length; n++) {
          markers = markerPoints[n];
          for (var k = 0; k < markers.length; k++) {
            markerpoint = new BMap.Point(markers[k].lng, markers[k].lat);
            if (markers[k].icon && markers[k].height && markers[k].width) {
              markersize = new BMap.Size(parseInt(markers[k].width), parseInt(markers[k].height));
              markericon = new BMap.Icon(markers[k].icon, markersize);
            } else if (markers[k].icon) {
              markericon = new BMap.Icon(markers[k].icon, new BMap.Size(25, 25));
            } else {
              markericon = false;
            }
            markerobject = new BMap.Marker(markerpoint, {
              icon: markericon
            }); // 创建标注
            map.addOverlay(markerobject); // 将标注添加到地图中
            remarkerPoints.push(markerobject);
            markerobject.addEventListener("click", function (type, target) {
              var p = this.getPosition(); //获取marker的位置
              // alert("marker的位置是" + p.lng + "," + p.lat);
              $.wwclass.helper.updateProp($ele, "data-x-clickpoint", JSON.stringify(p));
              $.wwclass.helper.anijsTrigger($ele, "markerallclick");
              // $.wwclass.helper.anijsTrigger($ele, "markerclick" + n);
            });
          }
        }
      }

      // 事件监听
      map.addEventListener("moveend", function (e) {
        var center = map.getCenter();
        $.wwclass.helper.updateProp($ele, "data--center", JSON.stringify(center));
      });
      map.addEventListener("zoomend", function (e) {
        // $.wwclass.helper.updateProp($ele, "data--zoom", map.getZoom());
        $.wwclass.helper.updateProp($ele, "data--zoom", map.getZoom());
      });
      map.addEventListener("click", function (e) {
        $.wwclass.helper.updateProp($ele, "data-x-point", JSON.stringify(e.point));
        // console.log(e.point.lng + "," + e.point.lat);
        var geoc = new BMap.Geocoder();
        var pt = e.point;
        geoc.getLocation(pt, function (rs) {
          var addComp = rs.addressComponents;
          // alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
          // console.log(addComp.province);
          $.wwclass.helper.updateProp($ele, "data-x-pointprovince", addComp.province);   //点击当前坐标点输出省
          // console.log(addComp.city);
          $.wwclass.helper.updateProp($ele, "data-x-pointcity", addComp.city);       // 点击当前坐标点输出市
          // console.log(addComp.district);
          $.wwclass.helper.updateProp($ele, "data-x-pointdistrict", addComp.district);   //点击当前坐标点输出区
          // console.log(addComp.street);
          $.wwclass.helper.updateProp($ele, "data-x-pointstreet", addComp.street);     //点击当前坐标点输出街道
          // console.log(addComp.streetNumber);
          $.wwclass.helper.updateProp($ele, "data-x-pointstreetNumber", addComp.streetNumber); //点击当前坐标点输出街牌号码

        });



      });
    });

  }

  // 元素析构——每个wwclass元素只会被析构一次。, 传入了元素对象($前缀表明是一个jquery对象).
  function finalizeElement($ele) {
    // 对 $ele 元素做对应处理
  }

  // 监听属性相关处理
  var evtInHandler = function ($ele, attribute, value) {
    // 处理代码
    var map = $ele.data("map");
    var local, i;
    var transitObject, drivingObject, walkingObject;
    if (map) {
      var transitPolicy = $ele.attr("data--transit-policy");
      var drivingPolicy = $ele.attr("data--driving-policy");
      var openTransitRoute = $ele.attr("data--open-transit-route");
      var openWalkingRoute = $ele.attr("data--open-walking-route");
      var openDrivingRoute = $ele.attr("data--open-driving-route");
      var routeStart = $ele.attr("data--route-start");
      var routeEnd = $ele.attr("data--route-end");
      var transitRoute = $ele.attr("data--transit-route");
      var drivingRoute = $ele.attr("data--driving-route");
      var walkingRoute = $ele.attr("data--walking-route");
      $.wwclass.helper.onVisibleDo($ele, function ($ele) {
        switch (attribute) {
          // case "data--move-center":
          //   if (isTrue(value)) {
          //     var centerLat = $ele.attr("data-center-lat") || 39.915;
          //     var centerLng = $ele.attr("data-center-lng") || 116.404;
          //     console.log(map.panTo(new BMap.Point(centerLng, centerLat)));
          //     $ele.attr("data--move-center", "");
          //   }
          //   break;
          // case "data--set-zoom":
          //   if (isTrue(value)) {
          //     var zoom = $ele.attr("data-zoom") || 11;
          //     console.log(map.setZoom(zoom));
          //     $ele.attr("data--set-zoom", "");
          //   }
          //   break;
          case "data--get-current-data":
            if (value == "get") {
              var data = {};
              data.bounds = map.getBounds(); // 返回地图可视区域，以地理坐标表示。
              data.center = map.getCenter(); // 返回地图当前中心点。
              data.mapType = map.getMapType(); // 返回地图类型。
              data.size = map.getSize(); // 返回地图视图的大小，以像素表示。
              data.zoom = map.getZoom(); // 返回地图当前缩放级别。
              $ele.attr("data--get-current-data", JSON.stringify(data));
              $ele.data("value", data);
              $ele.trigger("baiduMapGetData");
            }
            break;
          case "data--center":
            if (value) {
              value = JSON.parse(value);
              // var centerPoint = JSON.parse($ele.attr("data--center"));
              var centerPoint = map.getCenter();
              if (centerPoint.lng != value.lng || centerPoint.lat != value.lat) {
                // map.panTo(new BMap.Point(value.lng, value.lat));
                map.setCenter(new BMap.Point(value.lng, value.lat));
              }
            }
            break;
          case "data--zoom":
            var zoom = parseInt(value, 10);
            if (zoom && map.getZoom() !== zoom) {
              map.setZoom(zoom);
            }
            break;
          case "data--city":
            if (value) {
              map.setCurrentCity(city);
            }
            break;
          case "data--dragging":
            if (isTrue(value)) {
              map.enableDragging();
            } else {
              map.disableDragging();
            }
            break;
          case "data--scroll-wheel-zoom":
            if (isTrue(value)) {
              map.enableScrollWheelZoom();
            } else {
              map.disableScrollWheelZoom();
            }
            break;
          case "data--double-click-zoom":
            if (isTrue(value)) {
              map.enableDoubleClickZoom();
            } else {
              map.disableDoubleClickZoom();
            }
            break;
          case "data--keyboard":
            if (isTrue(value)) {
              map.enableKeyboard();
            } else {
              map.disableKeyboard();
            }
            break;
          case "data--inertial-dragging":
            if (isTrue(value)) {
              map.enableInertialDragging();
            } else {
              map.disableInertialDragging();
            }
            break;
          case "data--continuous-zoom":
            if (isTrue(value)) {
              map.enableContinuousZoom();
            } else {
              map.disableContinuousZoom();
            }
            break;
          case "data--pinch-to-zoom":
            if (isTrue(value)) {
              map.enableDragging();
            } else {
              map.disableDragging();
            }
            break;
          case "data--auto-resize":
            if (isTrue(value)) {
              map.enableAutoResize();
            } else {
              map.disableAutoResize();
            }
            break;
          case "data--default-cursor":
            if (isTrue(value)) {
              map.setDefaultCursor(value);
            }
            break;
          case "data--dragging-cursor":
            if (isTrue(value)) {
              map.setDraggingCursor(value);
            }
            break;
          case "data--min-zoom":
            if (isTrue(value) && parseInt(value, 10)) {
              map.setMinZoom(parseInt(value, 10));
            }
            break;
          case "data--max-zoom":
            if (isTrue(value) && parseInt(value, 10)) {
              map.setMaxZoom(parseInt(value, 10));
            }
            break;
          case "data--map-style":
            if (isTrue(value)) {
              map.setMapStyle(JSON.parse(mapStyle));
            }
            break;
          case "data--dragging-point":
            if (isTrue(value)) {
              // 判断值是否正确
              var dragging = $ele.attr("data-dragging");
              try {
                value = JSON.parse(value);
              } catch (e) {
                value = map.getCenter();
              }
              if (!value.lat || !value.lng) {
                console.info('拖拽点属性 data--dragging-point 的值格式非地图的位置格式, 如:{"lng": 116.404,"lat": 39.915}, 因此将默认处理为当前视口的中心点.');
                value = map.getCenter();
              }
              var point = new BMap.Point(value.lng, value.lat);

              var marker = $ele.data("dragging-point");
              if (marker) { // 已有mark则改变位置
                marker.setPosition(point);
                $.wwclass.helper.updateProp($ele, "data-x-point", JSON.stringify(point));
              } else { // 无则新建
                marker = new BMap.Marker(point); // 创建标注
                map.addOverlay(marker); // 将标注添加到地图中
                if (isTrue(dragging)) {
                  marker.enableDragging(); // 可拖拽
                } else {
                  marker.disableDragging(); // 不可拖拽
                }
                marker.addEventListener("dragend", function (data) {
                  $.wwclass.helper.updateProp($ele, "data-x-point", JSON.stringify(data.point));
                  $.wwclass.helper.updateProp($ele, "data--dragging-point", JSON.stringify(data.point));
                });
                $ele.data("dragging-point", marker);
              }
            } else {
              if ($ele.data("dragging-point")) {
                map.removeOverlay($ele.data("dragging-point"));
              }
              $ele.removeData("dragging-point");
            }
            break;
          case "data--map-type-control":
            value = getTypedValue(value);
            if (value) {
              if (value === true) {
                i = new BMap.MapTypeControl();
                map.addControl(i);
              } else {
                if (value.anchor) {
                  value.anchor = eval(value.anchor);
                }
                if (value.type) {
                  value.type = eval(value.type);
                }
                if (value.mapTypes) {
                  for (var k = 0; k < value.mapTypes.length; k++) {
                    value.mapTypes[k] = eval(value.mapTypes[k]);
                  }
                }
                i = new BMap.MapTypeControl(value);
                map.addControl(i);
              }
            }
            break;
          case "data--geolocation-control":
            value = getTypedValue(value);
            if (value) {
              if (value === true) {
                i = new BMap.GeolocationControl();
                map.addControl(i);
              } else {
                if (value.anchor) {
                  value.anchor = eval(value.anchor);
                }
                if (value.offset) {
                  value.offset = new BMap.Size(value.offset.width, value.offset.height);
                }
                if (value.locationIcon) {
                  value.locationIcon = new BMap.Icon(
                    value.locationIcon.url,
                    new BMap.Size(value.locationIcon.width, value.locationIcon.height));
                }
                i = new BMap.GeolocationControl(value);
                i.addEventListener("locationSuccess", function (e) {
                  // 定位成功事件
                  // console.log(e);
                  $.wwclass.helper.updateProp($ele, "data-x-geoaddress", JSON.stringify(e.addressComponent));
                  $.wwclass.helper.updateProp($ele, "data-x-geopoint", JSON.stringify(e.points));
                  // $.wwclass.helper.anijsTrigger($ele,"baidumapgeosuccess");
                });
                i.addEventListener("locationError", function (e) {
                  // 定位失败事件
                  $.wwclass.helper.anijsTrigger($ele, "baidumapgeoerror");
                  // console.log(e.message);
                });
                map.addControl(i);
              }
              var ii = 0;
              map.addEventListener("tilesloaded", function (e) {
                if (ii === 0) {
                  if (GeolocationControl.enableAutoLocation) {
                    $ele.find(".BMap_geolocationIcon").trigger("click");
                  }
                }
                ii++;
              });
            }
            break;
          case "data--navigation-control":
            value = getTypedValue(value);
            if (value) {
              if (value === true) {
                i = new BMap.NavigationControl();
                map.addControl(i);
              } else {
                if (value.anchor) {
                  value.anchor = eval(value.anchor);
                }
                if (value.type) {
                  value.type = eval(value.type);
                }
                i = new BMap.NavigationControl(value);
                map.addControl(i);
              }
            }
            break;
          case "data--traffic-control":
            value = getTypedValue(value);
            if (value) {
              if (value === true) {
                i = new BMapLib.TrafficControl();
                map.addControl(i);
              } else {
                if (value.anchor) {
                  value.anchor = eval(value.anchor);
                }
                i = new BMapLib.TrafficControl(value.showPanel);
                map.addControl(i);
                i.setAnchor(value.anchor);
              }
            }
            break;
          case "data--local-search":
            var LocalSearchSuccess = {
              renderOptions: {
                map: map
              },
              onSearchComplete: function (results) {
                if (local.getStatus() == BMAP_STATUS_SUCCESS) {
                  // console.log(results);
                  $.wwclass.helper.anijsTrigger($ele, "LocalSearchSuccess.baidu");
                } else {
                  switch (local.getStatus()) {
                    case BMAP_STATUS_CITY_LIST:
                      console.error("BMAP_STATUS_CITY_LIST");
                      break;
                    case BMAP_STATUS_UNKNOWN_LOCATION:
                      console.error("BMAP_STATUS_UNKNOWN_LOCATION");
                      break;
                    case BMAP_STATUS_UNKNOWN_ROUTE:
                      console.error("BMAP_STATUS_UNKNOWN_ROUTE");
                      break;
                    case BMAP_STATUS_INVALID_KEY:
                      console.error("BMAP_STATUS_INVALID_KEY");
                      break;
                    case BMAP_STATUS_INVALID_REQUEST:
                      console.error("BMAP_STATUS_INVALID_REQUEST");
                      break;
                    case BMAP_STATUS_PERMISSION_DENIED:
                      console.error("BMAP_STATUS_PERMISSION_DENIED");
                      break;
                    case BMAP_STATUS_SERVICE_UNAVAILABLE:
                      console.error("BMAP_STATUS_SERVICE_UNAVAILABLE");
                      break;
                    case BMAP_STATUS_TIMEOUT:
                      console.error("BMAP_STATUS_TIMEOUT");
                      break;
                    default:
                      console.error("");
                  }
                  console.error("位置检索失败");
                  $.wwclass.helper.anijsTrigger($ele, "LocalSearchError.baidu");
                }
              }
            };
            if (value) {
              var LocalSearchOptions = $.extend(LocalSearchSuccess.renderOptions, getTypedValue(value));
            }
            var local = new BMap.LocalSearch(map, LocalSearchSuccess);
            $ele.data("local", local);
            break;
          case "data--search-array":
            local = $ele.data("local");
            var searchPoint = $ele.attr("data--search-point");
            if (value) {
              value = JSON.parse(value);
              if (searchPoint) {
                searchPoint = JSON.parse(searchPoint);
                local.searchNearby(value, new BMap.Point(searchPoint.lng, searchPoint.lat), 1000);
                // searchByPoint(map,value,local, JSON.parse(searchPoint));
              } else {
                var geolocation = new BMap.Geolocation();
                geolocation.getCurrentPosition(function (pos) {
                  local.searchNearby(value, new BMap.Point(parseFloat(pos.longitude), parseFloat(pos.latitude)), 1000);
                });
              }
            }
            break;
          case "data--search-point":
            local = $ele.data("local");
            var searchArray = $ele.attr("data--search-array");
            if (searchArray) {
              searchArray = JSON.parse(searchArray);
              if (value) {
                value = JSON.parse(value);
                local.searchNearby(searchArray, new BMap.Point(value.lng, value.lat), 1000);
              } else {
                var geolocation = new BMap.Geolocation();
                geolocation.getCurrentPosition(function (pos) {
                  local.searchNearby(searchArray, new BMap.Point(parseFloat(pos.longitude), parseFloat(pos.latitude)), 1000);
                });
              }
            }
            break;
          case "data--transit-route":
            var transitRouteSuccess;
            if (value) {
              value = getTypedValue(value);
              var renderOptions = {
                map: map,
              };
              if (value.render) {
                transitRouteSuccess = $.extend(renderOptions, value.render);
              }
              if (transitPolicy) {
                transitPolicy = eval(transitPolicy);
              }
              var transitRouteOptions = {
                renderOptions: transitRouteSuccess,
                policy: transitPolicy,
                pageCapacity: value.pageCapacity
              };
              // console.log(transitRouteOptions);
              var transit = new BMap.TransitRoute(map, transitRouteOptions);
              $ele.data("transitRoute", transit);
            }
            break;
          case "data--transit-policy":
            transitObject = $ele.data("transitRoute");
            if (value) {
              transitObject.setPolicy(eval(value));
            }
            break;
          case "data--open-transit-route":
            transitObject = $ele.data("transitRoute");
            if (isTrue(value)) {
              map.clearOverlays();
              transitObject.setPolicy(transitPolicy);
              transitObject.search(routeStart, routeEnd);
              transitObject.setPolylinesSetCallback(function () {
                $.wwclass.helper.updateProp($ele, "data--open-transit-route", "");
              });
            }
            break;
          case "data--driving-route":
            var drivingRouteSuccess;
            if (value) {
              value = getTypedValue(value);
              var drivingRender = {
                map: map,
              };
              drivingRouteSuccess = $.extend(drivingRender, value);
              if (drivingPolicy) {
                drivingPolicy = eval(drivingPolicy);
              }
              var drivingRouteOptions = {
                renderOptions: drivingRouteSuccess,
                policy: drivingPolicy
              };
              // console.log(drivingRouteOptions);
              var driving = new BMap.DrivingRoute(map, drivingRouteOptions);
              $ele.data("drivingRoute", driving);
            }
            break;
          case "data--driving-policy":
            drivingObject = $ele.data("drivingRoute");
            if (value) {
              drivingObject.setPolicy(eval(value));
            }
            break;
          case "data--open-driving-route":
            drivingObject = $ele.data("drivingRoute");
            if (isTrue(value)) {
              map.clearOverlays();
              drivingObject.setPolicy(drivingPolicy);
              drivingObject.search(routeStart, routeEnd);
              drivingObject.setPolylinesSetCallback(function () {
                $.wwclass.helper.updateProp($ele, "data--open-driving-route", "");
              });
            }
            break;
          case "data--walking-route":
            var walkingRouteSuccess;
            if (value) {
              value = getTypedValue(value);
              var walkingRender = {
                map: map,
              };
              walkingRouteSuccess = $.extend(walkingRender, value);
              var walkingRouteOptions = {
                renderOptions: walkingRouteSuccess
              };
              // console.log(walkingRouteOptions);
              var walking = new BMap.WalkingRoute(map, walkingRouteOptions);
              $ele.data("walkingRoute", walking);
            }
            break;
          case "data--open-walking-route":
            walkingObject = $ele.data("walkingRoute");
            if (isTrue(value)) {
              map.clearOverlays();
              walkingObject.search(routeStart, routeEnd);
              walkingObject.setPolylinesSetCallback(function () {
                $.wwclass.helper.updateProp($ele, "data--open-walking-route", "");
              });
            }
            break;
          case "data--route-start":
            transitObject = $ele.data("transitRoute");
            drivingObject = $ele.data("drivingRoute");
            walkingObject = $ele.data("walkingRoute");
            if (transitRoute && isTrue(openTransitRoute)) {
              map.clearOverlays();
              transitObject.setPolicy(transitPolicy);
              transitObject.search(value, routeEnd);
            }
            if (drivingRoute && isTrue(openDrivingRoute)) {
              map.clearOverlays();
              drivingObject.setPolicy(drivingPolicy);
              drivingObject.search(value, routeEnd);
            }
            if (walkingRoute && isTrue(openWalkingRoute)) {
              map.clearOverlays();
              walkingObject.search(value, routeEnd);
            }
            break;
          case "data--route-end":
            transitObject = $ele.data("transitRoute");
            drivingObject = $ele.data("drivingRoute");
            walkingObject = $ele.data("walkingRoute");
            if (transitRoute && isTrue(openTransitRoute)) {
              map.clearOverlays();
              transitObject.setPolicy(transitPolicy);
              transitObject.search(routeStart, value);
            }
            if (drivingRoute && isTrue(openDrivingRoute)) {
              map.clearOverlays();
              drivingObject.setPolicy(drivingPolicy);
              drivingObject.search(routeStart, value);
            }
            if (walkingRoute && isTrue(openWalkingRoute)) {
              map.clearOverlays();
              walkingObject.search(routeStart, value);
            }
            break;
          case "data--marker-points":
            if (value) {
              for (var re = 0; re < remarkerPoints.length; re++) {
                map.removeOverlay(remarkerPoints[re]);
              }
              remarkerPoints = [];
              var newp = $ele.attr("data--marker-points");
              value = getTypedValue(newp);
              // console.log(value);
              var markerpoint, markerobject, markers, markericon, markersize;
              for (var n = 0; n < value.length; n++) {
                markers = value[n];
                for (var k = 0; k < markers.length; k++) {
                  markerpoint = new BMap.Point(markers[k].lng, markers[k].lat);
                  if (markers[k].icon && markers[k].height && markers[k].width) {
                    markersize = new BMap.Size(parseInt(markers[k].width), parseInt(markers[k].height));
                    markericon = new BMap.Icon(markers[k].icon, markersize);
                  } else if (markers[k].icon) {
                    markericon = new BMap.Icon(markers[k].icon, new BMap.Size(25, 25));
                  } else {
                    markericon = false;
                  }
                  markerobject = new BMap.Marker(markerpoint, {
                    icon: markericon
                  }); // 创建标注
                  markerobject.zIndex = 29000000;//add by zhushuangxin on 2018-08-09  //让用户的标注自己显示在最上层
                  map.addOverlay(markerobject); // 将标注添加到地图中
                  remarkerPoints.push(markerobject);
                  markerobject.addEventListener("click", function () {
                    var p = this.getPosition(); //获取marker的位置
                    // alert("marker的位置是" + p.lng + "," + p.lat);
                    $.wwclass.helper.updateProp($ele, "data-x-clickpoint", JSON.stringify(p));
                    $.wwclass.helper.anijsTrigger($ele, "markerallclick");
                    // $.wwclass.helper.anijsTrigger($ele, "markerclick" + n);
                  });
                }
              }
            }
            break;
          case "finalize":
            finalizeElement($ele);
            break;
          default:
            console.info("监听到 " + attribute + " 属性值改变为 " + value + ", 但是没找到对应处理动作.");
        }
      });
    }
  };

  // 以下部分不需要修改
  if (!$.wwclass) {
    console.error("Can not use without wwclass.js");
    return false;
  }

  var ret = /*INSBEGIN:WWCLSHANDLER*/
    function (set) {
      if (set.length > 0) {
        loadDependence(function () {
          init();
          $(set).each(function (index, targetDom) {
            processElement($(targetDom));
          });
        });
      }
    }
    /*INSEND:WWCLSHANDLER*/
    ;

  return ret;

}));
