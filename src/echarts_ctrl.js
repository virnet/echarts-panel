import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import TimeSeries from 'app/core/time_series';
import rendering from './rendering';
import moment from 'moment';

export class EChartsCtrl extends MetricsPanelCtrl {
    constructor($scope, $injector, $rootScope) { // 初始化
        super($scope, $injector);
        this.$rootScope = $rootScope;
        this.hiddenSeries = {};
        var panelDefaults = { // 设置默认值
            show: {
                stack: true,
                legend: true,
                tooltip: true,
                label: true,
            },
            chartsType: 'bar',
            legend: {
                show: true, // disable/enable legend
                values: true,
                position: 'right',
            },
            label:{
                show: false,
                fontSize:12,
            },
            stack:false,
            tooltip:{
                show: true,
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

        _.defaults(this.panel, panelDefaults);
        _.defaults(this.panel.legend, panelDefaults.legend);

        this.events.on('render', this.onRender.bind(this));
        this.events.on('data-received', this.onDataReceived.bind(this));
        this.events.on('data-error', this.onDataError.bind(this));
        this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));

    }

    onInitEditMode() {  // 初始化编辑模块
        this.addEditorTab('Options', "public/plugins/virnet-echarts-panel/editor.html", 2);  // 配置选项页
        this.unitFormats = kbn.getUnitFormats();  //从Grafana中获取内置单位选项
        this.changeChartsType()
    }

    setUnitFormat(subItem) {   // 选中单位事件触发该函数
        this.panel.format = subItem.value;
        this.render();
    }
    changeChartsType(){
        if(this.panel.chartsType==='pie'){
            this.panel.show.label=true;
            this.panel.show.legend=true;
            this.panel.show.stack=false;
        }else if(this.panel.chartsType==='bar'){
            this.panel.show.label=true;
            this.panel.show.legend=true;
            this.panel.show.stack=true;
        }else if(this.panel.chartsType==='line'){
            this.panel.show.label=false;
            this.panel.show.legend=true;
            this.panel.show.stack=true;
        }else if(this.panel.chartsType==='map'){
            this.panel.show.label=true;
            this.panel.show.legend=false;
            this.panel.show.stack=false;
        }
        this.render();
    }
    onDataError() {  // 数据错误事件触发该函数
        this.series = [];
        this.render();
    }

    changeSeriesColor(series, color) {
        series.color = color;
        this.panel.aliasColors[series.alias] = series.color;
        this.render();
    }

    onRender() {  // 刷新事件函数
        this.data = this.parseSeries(this.series);
    }

    getValue(valueList) {
        if (this.panel.valueName === "max") {
            return Math.max.apply(null, valueList)
        } else if (this.panel.valueName === "min") {
            return Math.min.apply(null, valueList)
        } else if (this.panel.valueName === "current") {
            for(let i=valueList.length-1; i>=0;i--){
                if(valueList[i]!==undefined){
                    return valueList[i];
                }
            }
            return valueList[-1]
        } else if (this.panel.valueName === "avg") {
            let sum = 0;
            for (let i = 0; i < valueList.length; i++) {
                sum += valueList[i];
            }
            return ~~(sum / valueList.length * 100) / 100;
        } else if (this.panel.valueName === "total") {
            return valueList.length;
        } else if (this.panel.valueName === "sum") {
            let sum = 0;
            for (let i = 0; i < valueList.length; i++) {
                sum += valueList[i];
            }
            return sum;
        }
    }
    parseSignalMetricSeries(series) { // 数据格式化
        let serieMap = {};
        let data = {"metrics": [], "series": [],"color":[]};
        let serieList = [].concat.apply([], series);
        serieList.map((serie, i) => {
            serie.datapoints.map((datapoint, i) => {
                if (!serieMap[serie.target]) {
                    serieMap[serie.target] = []
                }
                serieMap[serie.target].push(datapoint[1])
            })
        });
        let idx=0;
        for (let name in serieMap) {
            data["data"].push({"name":name,value:this.getValue(serieMap[name][metric])})
            data.color.push(this.$rootScope.colors[idx++]);
        }
        return data;
    }
    parseSeries(series) { // 数据格式化

        if(this.panel.chartsType==='pie'){
            return this.parseMultipleReversalSeries(series)
        }else if(this.panel.chartsType==='bar' ||this.panel.chartsType==='line' ){
            return this.parseMultipleMetricSeries(series)
        }else if(this.panel.chartsType==='map'){
            return this.parseMultipleMetricSeries(series);
        }
    }
    parseMultipleMetricSeries(series){
        var metrics = new Set();
        var targets = new Set();
        var data = {"metrics": [], "series": [],"color":[]};
        var serieList = [].concat.apply([], series); // 降低数组维度
        var serieMap = {};

        serieList.map((serie, i) => {
            if(serie.type==='time_series'){
                data.type="time";
            }
            targets.add(serie.target);
            serie.datapoints.map((datapoint, i) => {
                if(datapoint[0]===null){
                    return
                }
                let metric;
                if (this.panel.dateFormat) {
                    metric = moment(datapoint[1]).format(this.panel.dateFormat)
                } else if(serie.type==='time_series'){
                    metric = moment(datapoint[1]).format("YYYY-MM-DD HH:mm:ss")
                }else{
                    metric = datapoint[1]
                }
                if (!serieMap[serie.target]) {
                    serieMap[serie.target] = {}
                }
                if (!serieMap[serie.target][metric]) {
                    metrics.add(metric);
                    serieMap[serie.target][metric] = [];
                }
                serieMap[serie.target][metric].push(datapoint[0]);
            })
        });
        data["targets"] = targets.toJSON().sort();
        data["metrics"] = metrics.toJSON().sort();
        var idx=0;
        for (var name in serieMap) {
            var _data = {}
            _data["name"] = name
            _data["data"] = []
            for (let metric in serieMap[name]){
                _data["data"].push({"name":metric,value:[metric,this.getValue(serieMap[name][metric])]})
            }
            data.color.push(this.$rootScope.colors[idx++]);
            data.series.push(_data);
        }
        return data;
    }
    parseMultipleReversalSeries(series){ //序列反转
        var metrics = new Set();
        var targets = new Set();
        var data = {"metrics": [], "series": [],"color":[]};
        var serieList = [].concat.apply([], series); // 降低数组维度
        var serieMap = {};

        serieList.map((serie, i) => {
            if(serie.type==='time_series'){
                data.type="time";
            }
            targets.add(serie.target);
            serie.datapoints.map((datapoint, i) => {
                if(datapoint[0]===null){
                    return
                }
                let metric;
                if (this.panel.dateFormat) {
                    metric = moment(datapoint[1]).format(this.panel.dateFormat)
                } else if(serie.type==='time_series'){
                    metric = moment(datapoint[1]).format("YYYY-MM-DD HH:mm:ss")
                }else{
                    metric = datapoint[1]
                }
                if (!serieMap[metric]) {
                    serieMap[metric] = {}
                }
                if (!serieMap[metric][serie.target]) {
                    metrics.add(metric);
                    serieMap[metric][serie.target] = [];
                }
                serieMap[metric][serie.target].push(datapoint[0]);
            })
        });
        data["metrics"] = metrics.toJSON().sort();
        data["targets"] = targets.toJSON().sort();
        let idx=0;
        for (let metric in serieMap) {
            let _data = {}
            _data["name"] = metric;
            _data["data"] = []
            for (let name in serieMap[metric]){
                _data["data"].push({"name":name,value:[name,this.getValue(serieMap[metric][name])]})
            }
            data.color.push(this.$rootScope.colors[idx++]);
            data.series.push(_data);
        }
        return data;
    }

    onDataReceived(dataList) {
        this.series = dataList.map(this.seriesHandler.bind(this));
        this.data = this.parseSeries(this.series);
        this.render(this.data);
    }

    seriesHandler(seriesData) { // 元数据处理
        var series = [];
        if (seriesData.type === "table") {
            var nameKey = "name";
            var metricKey = "metric";
            var valueKey = "value";
            var seriesDataMap = {}
            seriesData.rows.map(item => {
                var _item = {};
                for (var index in seriesData.columns) {
                    var key = seriesData.columns[index].text
                    _item[key] = item[index]
                }
                if (!seriesDataMap[_item[nameKey]]) {
                    seriesDataMap[_item[nameKey]] = {"target": _item[nameKey], "datapoints": []}
                }
                seriesDataMap[_item[nameKey]].datapoints.push([_item[valueKey], _item[metricKey]])
                return _item
            });
            for (var key in seriesDataMap) {
                series.push(seriesDataMap[key])
            }
        } else {
            seriesData.type='time_series'
            series.push(seriesData)
        }
        //SELECT name as name,item as metric,value FROM monitor.test;
        return series;
    }

    getDecimalsForValue(value) {
        if (_.isNumber(this.panel.decimals)) {
            return {decimals: this.panel.decimals, scaledDecimals: null};
        }

        var delta = value / 2;
        var dec = -Math.floor(Math.log(delta) / Math.LN10);

        var magn = Math.pow(10, -dec);
        var norm = delta / magn; // norm is between 1.0 and 10.0
        var size;

        if (norm < 1.5) {
            size = 1;
        } else if (norm < 3) {
            size = 2;
            // special case for 2.5, requires an extra decimal
            if (norm > 2.25) {
                size = 2.5;
                ++dec;
            }
        } else if (norm < 7.5) {
            size = 5;
        } else {
            size = 10;
        }

        size *= magn;

        // reduce starting decimals if not needed
        if (Math.floor(value) === value) {
            dec = 0;
        }

        var result = {};
        result.decimals = Math.max(0, dec);
        result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;

        return result;
    }

    formatValue(value) {
        var decimalInfo = this.getDecimalsForValue(value);
        var formatFunc = kbn.valueFormats[this.panel.format];
        if (formatFunc) {
            return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
        }
        return value;
    }

    link(scope, elem, attrs, ctrl) {
        rendering(scope, elem, attrs, ctrl);
    }

    toggleSeries(serie) {
        if (this.hiddenSeries[serie.label]) {
            delete this.hiddenSeries[serie.label];
        } else {
            this.hiddenSeries[serie.label] = true;
        }
        this.render();
    }

}

EChartsCtrl.templateUrl = 'module.html';
