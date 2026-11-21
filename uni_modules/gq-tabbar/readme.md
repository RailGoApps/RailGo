# gq-tabbar 自定义底部导航栏

## 📱 组件简介

一个美观现代的自定义底部导航栏组件，采用圆角卡片式设计，支持中间凸起按钮，适用于外卖、商城、扫码等多种场景。

### ✨ 特性

- 🎨 **现代设计** - 圆角卡片式底栏，悬浮阴影效果
- 🔘 **凸起按钮** - 支持中间按钮凸起设计，突出核心功能
- 🎯 **双色切换** - 自动切换激活/未激活图标
- 🛠️ **高度可配置** - 支持自定义颜色、圆角等样式
- 📦 **开箱即用** - 简单配置即可使用
- 🚀 **性能优秀** - 使用 Vue 3 Composition API
- 📱 **多端支持** - 支持微信小程序、H5、App 等多个平台

## 📦 安装

### 方式一：通过插件市场导入（推荐）

1. 打开 [DCloud 插件市场](https://ext.dcloud.net.cn/)
2. 搜索 `gq-tabbar`
3. 点击 **使用 HBuilderX 导入插件**

### 方式二：手动导入

将 `uni_modules/gq-tabbar` 文件夹复制到你的项目根目录下的 `uni_modules` 文件夹中。

## 🚀 快速开始

### 1. 配置 pages.json

在 `pages.json` 中配置 tabBar 页面：

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    },
    {
      "path": "pages/order/order",
      "style": {
        "navigationBarTitleText": "点单"
      }
    },
    {
      "path": "pages/scan/scan",
      "style": {
        "navigationBarTitleText": "扫码"
      }
    },
    {
      "path": "pages/orders/orders",
      "style": {
        "navigationBarTitleText": "订单"
      }
    },
    {
      "path": "pages/mine/mine",
      "style": {
        "navigationBarTitleText": "我的"
      }
    }
  ],
  "tabBar": {
    "custom": true,
    "list": [
      { "pagePath": "pages/index/index" },
      { "pagePath": "pages/order/order" },
      { "pagePath": "pages/scan/scan" },
      { "pagePath": "pages/orders/orders" },
      { "pagePath": "pages/mine/mine" }
    ]
  }
}
```

**注意：** `custom: true` 表示使用自定义 tabBar。

### 2. 在每个 TabBar 页面中使用组件

在每个需要显示 tabBar 的页面中引入组件：

```vue
<template>
  <view class="page">
    <!-- 你的页面内容 -->
    <view class="content">
      <text>首页内容</text>
    </view>
    
    <!-- 自定义 TabBar -->
    <gq-tabbar :tab-list="tabList" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tabList = ref([
  {
    pagePath: '/pages/index/index',
    text: '首页',
    iconPath: '/static/tabbar/home.png',
    selectedIconPath: '/static/tabbar/home-active.png'
  },
  {
    pagePath: '/pages/order/order',
    text: '点单',
    iconPath: '/static/tabbar/order.png',
    selectedIconPath: '/static/tabbar/order-active.png'
  },
  {
    pagePath: '/pages/scan/scan',
    iconPath: '/static/tabbar/scan.png',
    isCenter: true  // 标记为中间凸起按钮
  },
  {
    pagePath: '/pages/orders/orders',
    text: '订单',
    iconPath: '/static/tabbar/orders.png',
    selectedIconPath: '/static/tabbar/orders-active.png'
  },
  {
    pagePath: '/pages/mine/mine',
    text: '我的',
    iconPath: '/static/tabbar/mine.png',
    selectedIconPath: '/static/tabbar/mine-active.png'
  }
])
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 160rpx; /* 为 tabbar 预留空间 */
}
</style>
```

## 📖 API 文档

### Props

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| tabList | TabItem[] | - | 是 | TabBar 配置数组 |
| activeColor | String | `#000000` | 否 | 激活时文字颜色 |
| normalColor | String | `#999999` | 否 | 未激活时文字颜色 |
| backgroundColor | String | `#FFFFFF` | 否 | TabBar 背景色 |
| centerButtonColor | String | `#C8C8C8` | 否 | 中间按钮背景色 |
| borderRadius | String | `60rpx` | 否 | TabBar 圆角大小 |

### TabItem 配置项

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pagePath | String | 是 | 页面路径（必须以 / 开头） |
| text | String | 否 | 按钮文字（中间按钮可不填） |
| iconPath | String | 是 | 未选中时的图标路径 |
| selectedIconPath | String | 否 | 选中时的图标路径 |
| isCenter | Boolean | 否 | 是否为中间凸起按钮 |

### 暴露的方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| switchTab | index: number | void | 切换到指定索引的 Tab |
| getCurrentIndex | - | number | 获取当前选中的 Tab 索引 |

## 🎨 自定义样式示例

### 修改主题色

```vue
<gq-tabbar 
  :tab-list="tabList"
  active-color="#FF6B6B"
  normal-color="#CCCCCC"
  background-color="#F8F8F8"
  center-button-color="#FF6B6B"
  border-radius="80rpx"
/>
```

### 使用 ref 调用方法

```vue
<template>
  <gq-tabbar ref="tabbarRef" :tab-list="tabList" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tabbarRef = ref()

// 跳转到第 3 个 Tab
const goToOrders = () => {
  tabbarRef.value.switchTab(3)
}

// 获取当前索引
const getCurrentTab = () => {
  const index = tabbarRef.value.getCurrentIndex()
  console.log('当前 Tab 索引:', index)
}
</script>
```

## 📝 注意事项

1. **图标资源**  
   - 建议图标尺寸：88rpx × 88rpx（@2x）或 132rpx × 132rpx（@3x）
   - 支持格式：png、jpg、svg
   - 建议使用透明背景的 PNG 图标

2. **页面底部留白**  
   - 需要为每个 TabBar 页面底部预留空间（建议 160rpx）
   - 避免内容被 TabBar 遮挡

3. **路径配置**  
   - `pagePath` 必须以 `/` 开头
   - 路径要与 `pages.json` 中配置的路径一致

4. **中间按钮**  
   - 使用 `isCenter: true` 标记中间按钮
   - 中间按钮可以不设置 `text` 属性
   - 建议只设置一个中间按钮

## 📸 效果预览

![TabBar 效果图](https://via.placeholder.com/750x300?text=TabBar+Preview)

## 🔧 常见问题

### Q: TabBar 不显示？
A: 检查 pages.json 中是否配置了 `"custom": true`

### Q: 点击无反应？
A: 确认 `pagePath` 是否正确，是否在 pages.json 的 tabBar.list 中配置

### Q: 中间按钮位置不对？
A: 确保中间按钮在 tabList 数组的中间位置（建议 5 个按钮时放在索引 2）

### Q: 如何修改 TabBar 高度？
A: 修改组件中的 `.tabbar` 样式的 `height` 属性

## 📄 更新日志

查看 [CHANGELOG.md](./changelog.md)

## 📜 开源协议

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 💬 联系作者

如有问题或建议，欢迎通过以下方式联系：

- 插件市场评论区留言
- 提交 Issue

---

**如果这个插件对你有帮助，请给个 ⭐️ Star 支持一下！**

