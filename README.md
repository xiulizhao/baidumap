# baidumap
百度地图元素用于绘制地图信息<br>
<img src="http://www.wware.org/img/baidumap2.png?_1287" width="600px"><br>
普通属性<br>
data-dragging	当设置拖拽点时,可通过此属性设置拖拽点是否可以拖拽.设置为true时可拖拽,不设置或设置为false不可拖拽.不可拖拽时,可用来设置地图单个标注	"true"<br>
data-opensearchaddress	添加搜索框检索地址时，需要将该属性设置为true	true/false<br>
控制属性<br>
data--get-current-data	获取地图的一些数据，当设置为`true`时，获取地图的一些数据，例如：中心点坐标、缩放级别等	"{"bounds":{"ul":{"lng":116.743775,"lat":40.088769},"Ll":{"lng":116.064225,"lat":39.740786},"Ke":39.740786,"Le":116.064225,"Fe":40.088769,"Ge":116.743775},"center":{"lng":116.404,"lat":39.915},"mapType":{"cf":"地图","ir":[{"th":{},"IV":null,"R_":false,"ww":true,"zIndex":0,"ba":2,"f_":true}],"k":{"B_":"显示普通地图","yE":"","gc":3,"$b":19,"Z2":3,"Y2":19,"Pb":256,"FF":"black","lD":"","xe":{},"tips":"显示普通地图","maxZoom":19}},"size":{"width":591,"height":393},"zoom":11}"<br>
data--center	地图中心点坐标，即中心点的经纬度值	"{"lng": 116.404,"lat": 39.915}"<br>
data--city	地图显示的城市,如不设置则为默认值，默认值为：北京	"北京"<br>
data--zoom	这里设置地图的缩放级别。缩放级别就是地图的比例尺，必须赋值，范围3-19级。如不设置则为默认值，默认值为：11	11<br>
data--dragging	启用地图拖拽。如果不启用地图拖拽, 则不能使用鼠标拖拽地图。默认开启.	"1"<br>
data--scroll-wheel-zoom	启用滚轮放大缩小，默认禁用。	"0"<br>
data--double-click-zoom	启用双击放大，默认启用。	"1"<br>
data--keyboard	启用键盘操作，默认禁用。键盘的上、下、左、右键可连续移动地图。同时按下其中两个键可使地图进行对角移动。PgUp、PgDn、Home和End键会使地图平移其1/2的大小。+、-键会使地图放大或缩小一级。	"1"<br>
data--inertial-dragging	启用地图惯性拖拽，默认禁用。	"0"<br>
data--continuous-zoom	启用连续缩放效果，默认禁用。	"0"<br>
data--pinch-to-zoom	启用双指操作缩放，默认启用。	"1"<br>
data--default-cursor	设置地图默认的鼠标指针样式。参数cursor应符合CSS的cursor属性规范。例如：‘default’,默认光标（通常是一个箭头）；‘pointer’，光标呈现为指示链接的指针(一只手)；‘crosshair’，光标呈现为十字线.可以查看`http://www.w3school.com.cn/cssref/pr_class_cursor.asp`了解更多	"default"<br>
data--dragging-cursor	设置拖拽地图时的鼠标指针样式。参数cursor应符合CSS的cursor属性规范。例如：‘default’,默认光标（通常是一个箭头）；‘pointer’，光标呈现为指示链接的指针(一只手)；‘crosshair’，光标呈现为十字线.可以查看`http://www.w3school.com.cn/cssref/pr_class_cursor.asp`了解更多	"default"<br>
data--min-zoom	设置地图允许的最小级别。取值不得小于地图类型所允许的最小级别。级别范围3-19级。	3<br>
data--max-zoom	设置地图允许的最大级别。取值不得大于地图类型所允许的最大级别。级别范围3-19级。	19<br>
data--dragging-point	地图元素的拖拽点的位置.当该拖拽点被拖动后, 该属性的值为拖拽结束位置坐标	"{"lng": 116.404,"lat": 39.915}"<br>
data--map-type-control	地图类型控件	"{"type":"BMAP_MAPTYPE_CONTROL_HORIZONTAL","mapTypes":["BMAP_NORMAL_MAP","BMAP_PERSPECTIVE_MAP","BMAP_SATELLITE_MAP","BMAP_HYBRID_MAP"],"anchor":"BMAP_ANCHOR_TOP_RIGHT"}"<br>
data--geolocation-control	地图定位控件	"{"showAddressBar":true,"enableAutoLocation":false,"anchor":"BMAP_ANCHOR_TOP_LEFT"}"<br>
data--navigation-control	地图平移缩放控件	"{"anchor":"BMAP_ANCHOR_TOP_LEFT","type":"BMAP_NAVIGATION_CONTROL_LARGE","enableGeolocation":false}"<br>
data--traffic-control	地图路况控件	"{"anchor":"BMAP_ANCHOR_TOP_LEFT","showPanel":true}"<br>
data--local-search	地图周边搜索设置	"{"panel":"aaa"}"<br>
data--search-point	地图上的坐标点是由经度和纬度创建的。这里设置坐标点中的经度值。如不设置则为默认值，默认值为：116.404(北京在地图上的经度)	"{"lng": 116.404,"lat": 39.915}"<br>
data--search-array	设置周边检索的关键字，即想要获得周围与什么相关的地点，例如：景点、美食等。可设置多个关键字。	"["美食"，"景点"]"<br>
data--transit-policy	设置公交路线的方案的策略	"BMAP_TRANSIT_POLICY_LEAST_TIME"<br>
data--open-transit-route	开启公交路线检索。设置为true时，则根据起点终点开始检索公交路线	"true"<br>
data--transit-route	公交路线检索设置	"{"render":{"panel":"aaa","autoViewport":true,},"pageCapacity":2}"<br>
data--driving-policy	设置公交路线的方案的策略	"BMAP_DRIVING_POLICY_LEAST_TIME"<br>
data--open-driving-route	开启驾车路线检索。设置为true时，则根据起点终点开始检索驾车路线	"true"<br>
data--driving-route	驾车路线检索设置	"{"panel":"aaa","autoViewport":true}"<br>
data--open-walking-route	开启步行路线检索。设置为true时，则根据起点终点开始检索步行路线	"true"<br>
data--walking-route	步行路线检索设置	"{"panel":"aaa","autoViewport":true}"<br>
data--route-start	设置路线检索起点	"火器营地铁站"<br>
data--route-end	设置路线检索终点	"中关村"<br>
data--marker-points	设置地图上的标注。值为数组形式。可创建多组标注，标注可修改图片并且修改图片大小	"[[{"lng":116.404,"lat":39.915},{"lng":116.467816,"lat":39.858751},{"lng":116.226351,"lat":40.024266}], [{"lng":116.535656,"lat":39.979165,"icon":"/img/demo.jpg","width":10,"height":10},{"lng":116.414923,"lat":40.047246,"icon":"/img/demo.jpg","width":10,"height":10},{"lng":116.245898,"lat":39.79048,"icon":"/img/demo.jpg","width":10,"height":10}]]"<br>
输出属性<br>
data-x-geoaddress	地图添加定位控件，使用定位控件定位成功后，返回的定位信息	"{"province":"北京市","city":"北京市","district":"","street":"","streetNumber":""}"<br>
data-x-point	点击某处输出当前坐标点	"{"lng":116.362031,"lat":39.933149}"<br>
data-x-pointprovince	点击某处输出当前坐标点的省	北京市<br>
data-x-pointcity	点击某处输出当前坐标点的市	北京市<br>
data-x-pointdistrict	点击某处输出当前坐标点的区	西城区<br>
data-x-pointstreet	点击某处输出当前坐标点的街道	阜成门北大街<br>
data-x-pointstreetNumber	点击某处返回当前坐标点街牌号码	15-6<br>
data-x-clickpoint	当地图设置标注时，点击标注，返回当前标注坐标点	"{"lng":116.467816,"lat":39.858751}"<br>
data-x-searchaddress	输出检索搜索框中选中的值	北京市海淀区如家酒店(蓝靛厂店)<br>
发出事件<br>
markerallclick	当点击标注图标时发出此事件<br>	
markerclick+下标	当点击标注图标时发出此事件。此事件按照标注的分组名字有所不同。同一组标注的点击事件相同，事件名称为`markerclick`+该组标注在数组中的下标<br>
