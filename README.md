## 安装
### 安装到全局插件目录
```
git clone https://github.com/virnet/echarts-panel.git
sudo service grafana-server restart
```


### 安装到自定义目录
如果你想把插件放到你自己的目录，可以在grafana.ini配置文件中追加如下语句
```ini
[plugin.echarts]
path = /home/your/clone/dir/echarts-panel
```

## 截图
### 柱状图
![avatar](public/plugins/virnet-echarts-panel/img/echarts_bar.png)

### 线图
![avatar](public/plugins/virnet-echarts-panel/img/echarts_line.png)

### 地图
![avatar](public/plugins/virnet-echarts-panel/img/echarts_map.png)

### 饼图
![avatar](public/plugins/virnet-echarts-panel/img/echarts_pie.png)

### 选项
![avatar](public/plugins/virnet-echarts-panel/img/echarts_options.png)