"use strict";

System.register(["app/plugins/sdk", "lodash", "app/core/utils/kbn", "app/core/time_series", "./rendering", "moment"], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, kbn, TimeSeries, rendering, moment, EChartsCtrl;

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_rendering) {
      rendering = _rendering.default;
    }, function (_moment) {
      moment = _moment.default;
    }],
    execute: function () {
      _export("EChartsCtrl", EChartsCtrl =
      /*#__PURE__*/
      function (_MetricsPanelCtrl) {
        _inherits(EChartsCtrl, _MetricsPanelCtrl);

        function EChartsCtrl($scope, $injector, $rootScope) {
          var _this;

          _classCallCheck(this, EChartsCtrl);

          // 初始化
          _this = _possibleConstructorReturn(this, _getPrototypeOf(EChartsCtrl).call(this, $scope, $injector));
          _this.$rootScope = $rootScope;
          _this.hiddenSeries = {};
          var panelDefaults = {
            // 设置默认值
            show: {
              stack: true,
              legend: true,
              tooltip: true,
              label: true
            },
            chartsType: 'bar',
            legend: {
              show: true,
              // disable/enable legend
              values: true,
              position: 'right'
            },
            label: {
              show: false,
              fontSize: 12
            },
            xlabel: {
              rotate: 0
            },
            stack: false,
            tooltip: {
              show: true
            },
            links: [],
            datasource: null,
            maxDataPoints: 3,
            interval: null,
            targets: [{}],
            cacheTimeout: null,
            breakPoint: '50%',
            aliasColors: {},
            format: 'short',
            valueName: 'current',
            strokeWidth: 1,
            fontSize: '80%',
            combine: {
              threshold: 0.0,
              label: 'Others'
            }
          };

          _.defaults(_this.panel, panelDefaults);

          _.defaults(_this.panel.legend, panelDefaults.legend);

          _this.events.on('render', _this.onRender.bind(_assertThisInitialized(_this)));

          _this.events.on('data-received', _this.onDataReceived.bind(_assertThisInitialized(_this)));

          _this.events.on('data-error', _this.onDataError.bind(_assertThisInitialized(_this)));

          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_assertThisInitialized(_this)));

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_assertThisInitialized(_this)));

          return _this;
        }

        _createClass(EChartsCtrl, [{
          key: "onInitEditMode",
          value: function onInitEditMode() {
            // 初始化编辑模块
            this.addEditorTab('Options', "public/plugins/virnet-echarts-panel/editor.html", 2); // 配置选项页

            this.unitFormats = kbn.getUnitFormats(); //从Grafana中获取内置单位选项

            this.changeChartsType();
          }
        }, {
          key: "setUnitFormat",
          value: function setUnitFormat(subItem) {
            // 选中单位事件触发该函数
            this.panel.format = subItem.value;
            this.render();
          }
        }, {
          key: "changeChartsType",
          value: function changeChartsType() {
            if (this.panel.chartsType === 'pie') {
              this.panel.show.label = true;
              this.panel.show.legend = true;
              this.panel.show.stack = false;
              this.panel.isBar = this.panel.isMap = this.panel.isLine = true;
              this.panel.isPie = true;
            } else if (this.panel.chartsType === 'bar') {
              this.panel.show.label = true;
              this.panel.show.legend = true;
              this.panel.show.stack = true;
              this.panel.isPie = this.panel.isMap = this.panel.isLine = false;
              this.panel.isBar = true;
            } else if (this.panel.chartsType === 'line') {
              this.panel.show.label = false;
              this.panel.show.legend = true;
              this.panel.show.stack = true;
              this.panel.isPie = this.panel.isMap = this.panel.isBar = false;
              this.panel.isLine = true;
            } else if (this.panel.chartsType === 'map') {
              this.panel.show.label = true;
              this.panel.show.legend = false;
              this.panel.show.stack = false;
              this.panel.isPie = this.panel.isLine = this.panel.isBar = false;
              this.panel.isMap = true;
            }

            this.render();
          }
        }, {
          key: "onDataError",
          value: function onDataError() {
            // 数据错误事件触发该函数
            this.series = [];
            this.render();
          }
        }, {
          key: "changeSeriesColor",
          value: function changeSeriesColor(series, color) {
            series.color = color;
            this.panel.aliasColors[series.alias] = series.color;
            this.render();
          }
        }, {
          key: "onRender",
          value: function onRender() {
            // 刷新事件函数
            this.data = this.parseSeries(this.series);
          }
        }, {
          key: "getValue",
          value: function getValue(valueList) {
            if (this.panel.valueName === "max") {
              return Math.max.apply(null, valueList);
            } else if (this.panel.valueName === "min") {
              return Math.min.apply(null, valueList);
            } else if (this.panel.valueName === "current") {
              for (var i = valueList.length - 1; i >= 0; i--) {
                if (valueList[i] !== undefined) {
                  return valueList[i];
                }
              }

              return valueList[-1];
            } else if (this.panel.valueName === "avg") {
              var sum = 0;

              for (var _i = 0; _i < valueList.length; _i++) {
                sum += valueList[_i];
              }

              return ~~(sum / valueList.length * 100) / 100;
            } else if (this.panel.valueName === "total") {
              return valueList.length;
            } else if (this.panel.valueName === "sum") {
              var _sum = 0;

              for (var _i2 = 0; _i2 < valueList.length; _i2++) {
                _sum += valueList[_i2];
              }

              return _sum;
            }
          }
        }, {
          key: "parseSignalMetricSeries",
          value: function parseSignalMetricSeries(series) {
            // 数据格式化
            var serieMap = {};
            var data = {
              "metrics": [],
              "series": [],
              "color": []
            };
            var serieList = [].concat.apply([], series);
            serieList.map(function (serie, i) {
              serie.datapoints.map(function (datapoint, i) {
                if (!serieMap[serie.target]) {
                  serieMap[serie.target] = [];
                }

                serieMap[serie.target].push(datapoint[1]);
              });
            });
            var idx = 0;

            for (var name in serieMap) {
              data["data"].push({
                "name": name,
                value: this.getValue(serieMap[name][metric])
              });
              data.color.push(this.$rootScope.colors[idx++]);
            }

            return data;
          }
        }, {
          key: "parseSeries",
          value: function parseSeries(series) {
            // 数据格式化
            if (this.panel.chartsType === 'pie') {
              return this.parseMultipleReversalSeries(series);
            } else if (this.panel.chartsType === 'bar' || this.panel.chartsType === 'line') {
              return this.parseMultipleMetricSeries(series);
            } else if (this.panel.chartsType === 'map') {
              return this.parseMultipleMetricSeries(series);
            }
          }
        }, {
          key: "parseMultipleMetricSeries",
          value: function parseMultipleMetricSeries(series) {
            var _this2 = this;

            var metrics = new Set();
            var targets = new Set();
            var data = {
              "metrics": [],
              "series": [],
              "color": [],
              "textColor": $(".navbar-page-btn").css("color")
            };
            var serieList = [].concat.apply([], series); // 降低数组维度

            var serieMap = {};
            serieList.map(function (serie, i) {
              if (serie.type === 'time_series') {
                data.type = "time";
              }

              targets.add(serie.target);
              serie.datapoints.map(function (datapoint, i) {
                if (datapoint[0] === null) {
                  return;
                }

                var metric;

                if (_this2.panel.dateFormat) {
                  metric = moment(datapoint[1]).format(_this2.panel.dateFormat);
                } else if (serie.type === 'time_series') {
                  metric = moment(datapoint[1]).format("YYYY-MM-DD HH:mm:ss");
                } else {
                  metric = datapoint[1];
                }

                if (!serieMap[serie.target]) {
                  serieMap[serie.target] = {};
                }

                if (!serieMap[serie.target][metric]) {
                  metrics.add(metric);
                  serieMap[serie.target][metric] = [];
                }

                serieMap[serie.target][metric].push(datapoint[0]);
              });
            });
            data["targets"] = Array.from(targets);
            data["metrics"] = Array.from(metrics);
            var idx = 0;

            for (var name in serieMap) {
              var _data = {};
              _data["name"] = name;
              _data["data"] = [];

              for (var _metric in serieMap[name]) {
                _data["data"].push({
                  "name": _metric,
                  value: [_metric, this.getValue(serieMap[name][_metric])]
                });
              }

              data.color.push(this.$rootScope.colors[idx++]);
              data.series.push(_data);
            }

            return data;
          }
        }, {
          key: "parseMultipleReversalSeries",
          value: function parseMultipleReversalSeries(series) {
            var _this3 = this;

            //序列反转
            var metrics = new Set();
            var targets = new Set();
            var data = {
              "metrics": [],
              "series": [],
              "color": []
            };
            var serieList = [].concat.apply([], series); // 降低数组维度

            var serieMap = {};
            serieList.map(function (serie, i) {
              if (serie.type === 'time_series') {
                data.type = "time";
              }

              targets.add(serie.target);
              serie.datapoints.map(function (datapoint, i) {
                if (datapoint[0] === null) {
                  return;
                }

                var metric;

                if (_this3.panel.dateFormat) {
                  metric = moment(datapoint[1]).format(_this3.panel.dateFormat);
                } else if (serie.type === 'time_series') {
                  metric = moment(datapoint[1]).format("YYYY-MM-DD HH:mm:ss");
                } else {
                  metric = datapoint[1];
                }

                if (!serieMap[metric]) {
                  serieMap[metric] = {};
                }

                if (!serieMap[metric][serie.target]) {
                  metrics.add(metric);
                  serieMap[metric][serie.target] = [];
                }

                serieMap[metric][serie.target].push(datapoint[0]);
              });
            });
            data["targets"] = Array.from(targets);
            data["metrics"] = Array.from(metrics);
            var idx = 0;

            for (var _metric2 in serieMap) {
              var _data = {};
              _data["name"] = _metric2;
              _data["data"] = [];

              for (var name in serieMap[_metric2]) {
                _data["data"].push({
                  "name": name,
                  value: [name, this.getValue(serieMap[_metric2][name])]
                });
              }

              data.color.push(this.$rootScope.colors[idx++]);
              data.series.push(_data);
            }

            return data;
          }
        }, {
          key: "onDataReceived",
          value: function onDataReceived(dataList) {
            this.series = dataList.map(this.seriesHandler.bind(this));
            this.data = this.parseSeries(this.series);
            this.render(this.data);
          }
        }, {
          key: "seriesHandler",
          value: function seriesHandler(seriesData) {
            // 元数据处理
            var series = [];

            if (seriesData.type === "table") {
              var nameKey = "name";
              var metricKey = "metric";
              var valueKey = "value";
              var seriesDataMap = {};
              seriesData.rows.map(function (item) {
                var _item = {};

                for (var index in seriesData.columns) {
                  var key = seriesData.columns[index].text;
                  _item[key] = item[index];
                }

                if (!seriesDataMap[_item[nameKey]]) {
                  seriesDataMap[_item[nameKey]] = {
                    "target": _item[nameKey],
                    "datapoints": []
                  };
                }

                seriesDataMap[_item[nameKey]].datapoints.push([_item[valueKey], _item[metricKey]]);

                return _item;
              });

              for (var key in seriesDataMap) {
                series.push(seriesDataMap[key]);
              }
            } else {
              seriesData.type = 'time_series';
              series.push(seriesData);
            } //SELECT name as name,item as metric,value FROM monitor.test;


            return series;
          }
        }, {
          key: "getDecimalsForValue",
          value: function getDecimalsForValue(value) {
            if (_.isNumber(this.panel.decimals)) {
              return {
                decimals: this.panel.decimals,
                scaledDecimals: null
              };
            }

            var delta = value / 2;
            var dec = -Math.floor(Math.log(delta) / Math.LN10);
            var magn = Math.pow(10, -dec);
            var norm = delta / magn; // norm is between 1.0 and 10.0

            var size;

            if (norm < 1.5) {
              size = 1;
            } else if (norm < 3) {
              size = 2; // special case for 2.5, requires an extra decimal

              if (norm > 2.25) {
                size = 2.5;
                ++dec;
              }
            } else if (norm < 7.5) {
              size = 5;
            } else {
              size = 10;
            }

            size *= magn; // reduce starting decimals if not needed

            if (Math.floor(value) === value) {
              dec = 0;
            }

            var result = {};
            result.decimals = Math.max(0, dec);
            result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;
            return result;
          }
        }, {
          key: "formatValue",
          value: function formatValue(value) {
            var decimalInfo = this.getDecimalsForValue(value);
            var formatFunc = kbn.valueFormats[this.panel.format];

            if (formatFunc) {
              return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
            }

            return value;
          }
        }, {
          key: "link",
          value: function link(scope, elem, attrs, ctrl) {
            rendering(scope, elem, attrs, ctrl);
          }
        }, {
          key: "toggleSeries",
          value: function toggleSeries(serie) {
            if (this.hiddenSeries[serie.label]) {
              delete this.hiddenSeries[serie.label];
            } else {
              this.hiddenSeries[serie.label] = true;
            }

            this.render();
          }
        }]);

        return EChartsCtrl;
      }(MetricsPanelCtrl));

      EChartsCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=echarts_ctrl.js.map
