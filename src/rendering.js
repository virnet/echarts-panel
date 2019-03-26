import _ from 'lodash';
import $ from 'jquery';
import 'jquery.flot';
import 'jquery.flot.pie';
import echarts from './echarts/echarts.min';

export default function link(scope, elem, attrs, ctrl) {
    var data;
    var panel = ctrl.panel;
    elem = elem.find('.echarts-panel__chart');
    var $tooltip = $('<div id="tooltip">');

    ctrl.events.on('render', function () { // 触发刷新/重新加载事件
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

    function addecharts() { // 绘图
        let option;
        var width = elem.width();
        var height = ctrl.height;
        // var size = Math.min(width, height);
        const plotCanvas = $('<div style="height: 100%"></div>');
        elem.html(plotCanvas);
        const container = plotCanvas[0];

        var echartPanel = echarts.init(container);

        if (ctrl.panel.chartsType === 'pie') {
            option = pieChartsOptions(echartPanel)
        } else if (ctrl.panel.chartsType === 'bar' || ctrl.panel.chartsType === 'line') {
            option = barChartsOptions(echartPanel)
        } else if (ctrl.panel.chartsType === 'map') {
            option = mapChartsOptions(echartPanel);
        }
        if (option && typeof option === "object") {
            echartPanel.setOption(option, true);
        }
        let backgroundColor = $('body').css('background-color')

    }

    function mapChartsOptions(echartPanel) {
        let option = {};
        let seriesData = [];
        let valueList = [];
        data.series.map(item => {
            let value = item.data.pop().value[1];
            valueList.push(value);
            seriesData.push({
                name: item.name,
                value: value,
            })
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
                series: [
                    {
                        type: 'map',
                        mapType: 'china', // 自定义扩展图表类型
                        itemStyle: {
                            normal: {
                                label: {
                                    show: ctrl.panel.label.show,
                                    fontSize: ctrl.panel.label.fontSize
                                }
                            },
                            emphasis: {label: {show: true}}
                        },
                        data: seriesData
                    }
                ]

            };
            echartPanel.setOption(option, true);
        });
        return option;
    }

    function pieChartsOptions(echartPanel) {
        let labelOptions;
        let option = {
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
        let legendData = new Set();
        let maxRadius;
        if (ctrl.panel.label.show) {
            maxRadius = 80;
        } else {
            maxRadius = 100;
        }
        data.series = data.series.slice(0, 5);
        data.series.map((item, i) => {
            let radius = [
                maxRadius * (data.series.length - i - 1) / data.series.length + '%',
                maxRadius * (data.series.length - i) / data.series.length * 0.9 + '%'
            ];
            let itemData = item.data.map(i => {
                legendData.add(i.name);
                return {name: i.name, value: i.value[1]}
            });
            if (i !== 0) {
                labelOptions = {
                    normal: {
                        show: ctrl.panel.label.show,
                        position: 'inner'
                    }
                }
            } else {
                labelOptions = {
                    normal: {
                        show: ctrl.panel.label.show,
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
            }
            option.series.push({
                name: item.name,
                type: 'pie',
                radius: radius,
                label: labelOptions,
                data: itemData
            })
        });
        option.legend.data = Array.from(legendData);
        return option;
    }

    function barChartsOptions(echartPanel) {
        let option;

        let labelOption = {
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
            labelOption.normal.show = ctrl.panel.label.show
        }
        console.log(data.textColor);
        option = {
            color: data.color,
            legend: {
                type: 'scroll',
                show: ctrl.panel.legend.show,
                textStyle: {
                    color: data.textColor
                }
            },
            tooltip: { // 图例
                trigger: 'axis',
                show: ctrl.panel.tooltip.show,
                axisPointer: {
                    type: 'shadow'
                }
            },
            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    axisTick: {show: false},
                    data: data.metrics,
                    axisLabel: {
                        color: data.textColor,
                        rotate: ctrl.panel.xlabel.rotate
                    },
                    nameTextStyle: {
                        color: data.textColor,
                    },
                    axisLine: {lineStyle: {color: "#999"}},
                    splitLine: {lineStyle: {color: "#999"}},
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {color: data.textColor},
                    nameTextStyle: {color: data.textColor},
                    axisLine: {lineStyle: {color: "#999"}},
                    splitLine: {lineStyle: {color: "#999"}},
                }
            ],
            grid: [{"borderColor": "#F00", show: false},],
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

        data.series.map(item => {
            option.series.push({
                name: item.name,
                stack: ctrl.panel.stack,
                type: ctrl.panel.chartsType,
                label: labelOption,

                showSymbol: false,
                hoverAnimation: false,
                data: item.data
            })
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

