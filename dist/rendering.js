"use strict";

System.register(["lodash", "jquery", "jquery.flot", "jquery.flot.pie", "./echarts/echarts.min"], function (_export, _context) {
  "use strict";

  var _, $, echarts;

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function link(scope, elem, attrs, ctrl) {
    var data;
    var panel = ctrl.panel;
    elem = elem.find('.echarts-panel__chart');
    var $tooltip = $('<div id="tooltip">');
    ctrl.events.on('render', function () {
      // 触发刷新/重新加载事件
      if (panel.legendType === 'Right side') {
        render(false);
        setTimeout(function () {
          render(true);
        }, 50);
      } else {
        render(true);
      }
    });

    function noDataPoints() {
      var html = '<div class="datapoints-warning"><span class="small">No data points</span></div>';
      elem.html(html);
    }

    function addecharts() {
      // 绘图
      var option;
      var width = elem.width();
      var height = ctrl.height; // var size = Math.min(width, height);

      var plotCanvas = $('<div style="height: 100%"></div>');
      elem.html(plotCanvas);
      var container = plotCanvas[0];
      var echartPanel = echarts.init(container);

      if (ctrl.panel.chartsType === 'pie') {
        option = pieChartsOptions(echartPanel);
      } else if (ctrl.panel.chartsType === 'bar' || ctrl.panel.chartsType === 'line') {
        option = barChartsOptions(echartPanel);
      } else if (ctrl.panel.chartsType === 'map') {
        option = mapChartsOptions(echartPanel);
      }

      if (option && _typeof(option) === "object") {
        echartPanel.setOption(option, true);
      }

      var backgroundColor = $('body').css('background-color');
    }

    function mapChartsOptions(echartPanel) {
      var option = {};
      var seriesData = [];
      var valueList = [];
      data.series.map(function (item) {
        var value = item.data.pop().value[1];
        valueList.push(value);
        seriesData.push({
          name: item.name,
          value: value
        });
      });
      $.get('public/plugins/virnet-echarts-panel/echarts/datav-china.json', function (geoJson) {
        echartPanel.hideLoading();
        echarts.registerMap('china', geoJson);
        option = {
          tooltip: {
            trigger: 'item',
            formatter: '{b}<br/>{c}'
          },
          visualMap: {
            min: 0,
            max: Math.max.apply(null, valueList) * 0.8,
            text: ['High', 'Low'],
            realtime: false,
            calculable: true,
            inRange: {
              color: ['rgb(200,255,255)', 'rgb(36,104,202)']
            }
          },
          series: [{
            type: 'map',
            mapType: 'china',
            // 自定义扩展图表类型
            itemStyle: {
              normal: {
                label: {
                  show: ctrl.panel.label.show,
                  fontSize: ctrl.panel.label.fontSize
                }
              },
              emphasis: {
                label: {
                  show: true
                }
              }
            },
            data: seriesData
          }]
        };
        echartPanel.setOption(option, true);
      });
      return option;
    }

    function pieChartsOptions(echartPanel) {
      var labelOptions = {
        normal: {
          show: false,
          formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
          backgroundColor: '#eee',
          borderColor: '#aaa',
          borderWidth: 1,
          borderRadius: 4,
          rich: {
            a: {
              color: '#999',
              lineHeight: 22,
              align: 'center'
            },
            hr: {
              borderColor: '#aaa',
              width: '100%',
              borderWidth: 0.5,
              height: 0
            },
            b: {
              fontSize: 16,
              lineHeight: 33
            },
            per: {
              color: '#eee',
              backgroundColor: '#334455',
              padding: [2, 4],
              borderRadius: 2
            }
          }
        }
      };
      var option = {
        tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
          type: 'scroll',
          show: ctrl.panel.legend.show,
          data: []
        },
        series: []
      };

      if (ctrl.panel.legend.position === "top") {
        option.legend.top = 10;
        option.legend.orient = "horizontal";
      } else if (ctrl.panel.legend.position === "bottom") {
        option.legend.bottom = 10;
        option.legend.orient = "horizontal";
      } else if (ctrl.panel.legend.position === "right") {
        option.legend.right = 10;
        option.legend.orient = "vertical";
      }

      var legendData = new Set();
      var maxRadius;

      if (ctrl.panel.label.show) {
        maxRadius = 80;
      } else {
        maxRadius = 100;
      }

      data.series = data.series.slice(0, 5);
      data.series.map(function (item, i) {
        var radius = [maxRadius * (data.series.length - i - 1) / data.series.length + '%', maxRadius * (data.series.length - i) / data.series.length * 0.9 + '%'];

        var _labelOptions;

        var itemData = item.data.map(function (i) {
          legendData.add(i.name);
          return {
            name: i.name,
            value: i.value[1]
          };
        });

        if (i === 0) {
          _labelOptions = JSON.parse(JSON.stringify(labelOptions));
          _labelOptions.normal.show = ctrl.panel.label.show;
        } else {
          _labelOptions = {
            normal: {
              position: 'inner'
            }
          };
        }

        option.series.push({
          name: item.name,
          type: 'pie',
          radius: radius,
          label: _labelOptions,
          data: itemData
        });
      });
      option.legend.data = legendData.toJSON();
      return option;
    }

    function barChartsOptions(echartPanel) {
      var option;
      var labelOption = {
        normal: {
          position: 'insideBottom',
          distance: 15,
          align: 'left',
          verticalAlign: 'middle',
          rotate: 90,
          formatter: '{c}  {a}',
          fontSize: 12,
          rich: {
            name: {
              textBorderColor: '#fff'
            }
          }
        }
      };

      if (ctrl.panel.show.label) {
        labelOption.normal.show = ctrl.panel.label.show;
      }

      option = {
        color: data.color,
        legend: {
          type: 'scroll',
          show: ctrl.panel.legend.show,
          textStyle: {
            color: '#999'
          }
        },
        tooltip: {
          // 图例
          trigger: 'axis',
          show: ctrl.panel.tooltip.show,
          axisPointer: {
            type: 'shadow'
          }
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          axisTick: {
            show: false
          },
          data: data.metrics,
          axisLabel: {
            color: "#999"
          },
          nameTextStyle: {
            color: "#999"
          },
          axisLine: {
            lineStyle: {
              color: "#999"
            }
          },
          splitLine: {
            lineStyle: {
              color: "#999"
            }
          }
        }],
        yAxis: [{
          type: 'value',
          axisLabel: {
            color: "#999"
          },
          nameTextStyle: {
            color: "#999"
          },
          axisLine: {
            lineStyle: {
              color: "#999"
            }
          },
          splitLine: {
            lineStyle: {
              color: "#999"
            }
          }
        }],
        grid: [{
          "borderColor": "#F00",
          show: false
        }],
        series: []
      };

      if (data.type) {
        option.xAxis[0].type = data.type;
      }

      if (ctrl.panel.legend.position === "top") {
        option.legend.top = 10;
        option.legend.orient = "horizontal";
      } else if (ctrl.panel.legend.position === "bottom") {
        option.legend.bottom = 10;
        option.legend.orient = "horizontal";
      } else if (ctrl.panel.legend.position === "right") {
        option.legend.right = 10;
        option.legend.orient = "vertical";
      }

      data.series.map(function (item) {
        option.series.push({
          name: item.name,
          stack: ctrl.panel.stack,
          type: ctrl.panel.chartsType,
          label: labelOption,
          showSymbol: false,
          hoverAnimation: false,
          data: item.data
        });
      });
      return option;
    }

    function render(incrementRenderCounter) {
      if (!ctrl.data) {
        return;
      }

      data = ctrl.data;

      if (0 === ctrl.data.length) {
        noDataPoints();
      } else {
        addecharts();
      }

      if (incrementRenderCounter) {
        ctrl.renderingCompleted();
      }
    }
  }

  _export("default", link);

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_jqueryFlot) {}, function (_jqueryFlotPie) {}, function (_echartsEchartsMin) {
      echarts = _echartsEchartsMin.default;
    }],
    execute: function () {}
  };
});
//# sourceMappingURL=rendering.js.map
