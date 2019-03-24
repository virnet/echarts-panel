import { EChartsCtrl } from './echarts_ctrl';
import { loadPluginCss } from 'app/plugins/sdk';

loadPluginCss({ // 加载插件CSS
  dark: 'plugins/virnet-echarts-panel/css/echarts.dark.css',
  light: 'plugins/virnet-echarts-panel/css/echarts.light.css',
});

export { EChartsCtrl as PanelCtrl };
