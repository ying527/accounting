# 智能记账系统

这是一个静态HTML记账系统，适合嵌入Android WebView使用。系统完全基于前端技术栈（HTML, CSS, JavaScript）实现，所有数据存储在本地localStorage中。

## 功能特点

### 1. 智能记账模块

- **快速记账功能**
  - 时间输入：默认显示当前日期时间，支持日期选择器修改
  - 智能分类系统：
    - 预设分类（水果、买菜等），支持用户自己添加分类
    - 支持用户自定义二级标签
    - 输入时自动匹配历史分类
  - 金额校验：自动拦截负数输入，支持小数点后两位

- **备用金管理**
  - 发放记录登记：
    - 发放日期选择（支持历史日期录入）
    - 金额录入（自动校验正整数）
  - 发放历史列表：
    - 按时间倒序展示
    - 支持删除/修改

### 2. 智能看板系统

- **动态数据看板**
  - 时间筛选器：
    - 预设快捷选项（本周/本月/近三月）
    - 自定义日期范围
  - 多维度统计：
    - 支出分类环形图（占比+金额双显示）
    - 资金流动趋势图（备用金发放与支出对比）

- **实时资金状态**
  - 智能计算引擎：
    - 当前余额 = Σ备用金发放金额 - Σ有效支出金额
  - 状态可视化：
    - 余额状态：绿色进度条+金额（余额>0）
    - 垫付状态：红色警示条+金额（余额<0）
    - 临界预警：黄色提示（余额<发放总额的10%）

### 3. 高级功能模块

- **智能报表系统**
  - 周期对比报表：
    - 支持按月/季度/年度生成对比分析
    - 自动计算同比/环比变化率
  - 一键导出功能：
    - 导出格式：Excel/PDF（需在Android中实现原生接口）
    - 内容包含：明细账目+统计图表

## 技术实现

- **前端框架**：纯原生HTML, CSS, JavaScript
- **UI组件**：
  - flatpickr - 日期选择器
  - Chart.js - 图表库
- **数据存储**：localStorage
- **移动端适配**：响应式设计，适配各种屏幕尺寸

## 在Android中使用

1. 将项目文件（index.html, styles.css, app.js）放入Android项目的assets目录中
2. 使用WebView加载HTML页面

```java
WebView webView = findViewById(R.id.webView);
webView.getSettings().setJavaScriptEnabled(true);
webView.getSettings().setDomStorageEnabled(true);
webView.loadUrl("file:///android_asset/index.html");
```

3. 如需实现导出功能，可通过JavaScript接口(JavascriptInterface)进行原生API调用

## 本地测试

1. 下载项目文件
2. 直接在浏览器中打开index.html文件
3. 所有数据将存储在浏览器的localStorage中

## 注意事项

- 此系统为纯前端实现，数据仅存储在本地，如需云同步功能，需要另外开发服务端API
- 导出Excel/PDF功能在静态HTML中不可用，需在Android端实现对应原生接口 