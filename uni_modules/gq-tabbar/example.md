# 使用示例

## 基础示例

### 完整页面示例

```vue
<template>
  <view class="page">
    <!-- 页面内容区域 -->
    <view class="content">
      <text class="title">首页</text>
      <text class="desc">这是首页内容</text>
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
    isCenter: true
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
  padding-bottom: 160rpx;
  background-color: #f5f5f5;
}

.content {
  padding: 40rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.desc {
  font-size: 28rpx;
  color: #666;
  display: block;
}
</style>
```

## 高级示例

### 自定义主题色

```vue
<template>
  <gq-tabbar 
    :tab-list="tabList"
    active-color="#FF6B6B"
    normal-color="#999999"
    background-color="#FFFFFF"
    center-button-color="#FF6B6B"
    border-radius="80rpx"
  />
</template>
```

### 使用 ref 调用方法

```vue
<template>
  <view class="page">
    <button @click="goToOrders">跳转到订单页</button>
    <button @click="getCurrentTab">获取当前Tab</button>
    
    <gq-tabbar ref="tabbarRef" :tab-list="tabList" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tabbarRef = ref()

const tabList = ref([
  // ... tabList 配置
])

// 跳转到订单页（索引3）
const goToOrders = () => {
  tabbarRef.value.switchTab(3)
}

// 获取当前选中的 Tab 索引
const getCurrentTab = () => {
  const index = tabbarRef.value.getCurrentIndex()
  console.log('当前选中的 Tab 索引:', index)
  uni.showToast({
    title: `当前在第 ${index + 1} 个Tab`,
    icon: 'none'
  })
}
</script>
```

### 动态修改 TabBar 配置

```vue
<template>
  <gq-tabbar :tab-list="dynamicTabList" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const hasNewOrder = ref(false) // 是否有新订单

// 动态计算 tabList
const dynamicTabList = computed(() => [
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
    isCenter: true
  },
  {
    pagePath: '/pages/orders/orders',
    text: hasNewOrder.value ? '订单(新)' : '订单',
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

// 模拟接收到新订单
setTimeout(() => {
  hasNewOrder.value = true
}, 3000)
</script>
```

### 不同主题配置

#### 主题1：红色主题（外卖风格）

```vue
<gq-tabbar 
  :tab-list="tabList"
  active-color="#FF4444"
  center-button-color="#FF4444"
  border-radius="60rpx"
/>
```

#### 主题2：蓝色主题（商务风格）

```vue
<gq-tabbar 
  :tab-list="tabList"
  active-color="#1890FF"
  center-button-color="#1890FF"
  border-radius="40rpx"
/>
```

#### 主题3：绿色主题（清新风格）

```vue
<gq-tabbar 
  :tab-list="tabList"
  active-color="#52C41A"
  center-button-color="#52C41A"
  border-radius="100rpx"
/>
```

#### 主题4：深色模式

```vue
<gq-tabbar 
  :tab-list="tabList"
  active-color="#FFFFFF"
  normal-color="#666666"
  background-color="#1F1F1F"
  center-button-color="#333333"
  border-radius="60rpx"
/>
```

## 完整项目集成示例

### 1. pages.json 配置

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
  },
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "商城小程序",
    "navigationBarBackgroundColor": "#FFFFFF",
    "backgroundColor": "#F5F5F5"
  }
}
```

### 2. 创建公共 TabBar 配置文件

**config/tabbar.ts**

```typescript
export const tabBarConfig = [
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
    isCenter: true
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
]
```

### 3. 在页面中使用

**pages/index/index.vue**

```vue
<template>
  <view class="page">
    <view class="content">
      <!-- 你的页面内容 -->
    </view>
    
    <gq-tabbar :tab-list="tabBarConfig" />
  </view>
</template>

<script setup lang="ts">
import { tabBarConfig } from '@/config/tabbar'
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 160rpx;
}
</style>
```

## 注意事项

1. **每个 TabBar 页面都需要引入组件**
2. **为页面底部预留空间**（建议 160rpx）
3. **确保路径配置正确**
4. **图标资源建议放在 static 目录下**

