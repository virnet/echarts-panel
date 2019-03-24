"use strict";

System.register(["./echarts_ctrl", "app/plugins/sdk"], function (_export, _context) {
  "use strict";

  var EChartsCtrl, loadPluginCss;
  return {
    setters: [function (_echarts_ctrl) {
      EChartsCtrl = _echarts_ctrl.EChartsCtrl;
    }, function (_appPluginsSdk) {
      loadPluginCss = _appPluginsSdk.loadPluginCss;
    }],
    execute: function () {
      loadPluginCss({
        // 加载插件CSS
        dark: 'plugins/virnet-echarts-panel/css/echarts.dark.css',
        light: 'plugins/virnet-echarts-panel/css/echarts.light.css'
      });

      _export("PanelCtrl", EChartsCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
