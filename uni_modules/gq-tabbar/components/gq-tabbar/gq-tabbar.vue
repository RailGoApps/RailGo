<template>
  <view class="tabbar-container">
    <view class="tabbar" :style="tabbarStyle">
      <view 
        v-for="(item, index) in tabList" 
        :key="index"
        :class="['tabbar-item', item.isCenter ? 'tabbar-item-center' : '']" 
        @tap="switchTab(index)"
      >
        <!-- 中间扫码按钮 -->
        <view v-if="item.isCenter" class="scan-button" :style="centerButtonStyle">
          <image 
            class="scan-icon" 
            :src="item.iconPath" 
            mode="aspectFit"
          />
        </view>
        
        <!-- 普通按钮 -->
        <template v-else>
          <view class="icon-wrap">
            <image 
              class="icon" 
              :src="current === index ? item.selectedIconPath : item.iconPath" 
              mode="aspectFit"
            />
          </view>
          <text 
            class="tabbar-text" 
            :class="current === index ? 'text-active' : ''"
            :style="current === index ? activeTextStyle : normalTextStyle"
          >
            {{ item.text }}
          </text>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface TabItem {
  pagePath: string
  text?: string
  iconPath: string
  selectedIconPath?: string
  isCenter?: boolean
}

interface Props {
  tabList: TabItem[]
  activeColor?: string
  normalColor?: string
  backgroundColor?: string
  centerButtonColor?: string
  borderRadius?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeColor: '#000000',
  normalColor: '#999999',
  backgroundColor: '#FFFFFF',
  centerButtonColor: '#C8C8C8',
  borderRadius: '60rpx'
})

const current = ref(0)

// 动态样式
const tabbarStyle = computed(() => ({
  backgroundColor: props.backgroundColor,
  borderRadius: props.borderRadius
}))

const centerButtonStyle = computed(() => ({
  backgroundColor: props.centerButtonColor
}))

const activeTextStyle = computed(() => ({
  color: props.activeColor
}))

const normalTextStyle = computed(() => ({
  color: props.normalColor
}))

// 切换Tab
const switchTab = (index: number) => {
  current.value = index
  uni.switchTab({
    url: props.tabList[index].pagePath
  })
}

// 页面加载时，根据当前页面设置选中状态
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const route = '/' + currentPage.route
  
  const index = props.tabList.findIndex(item => item.pagePath === route)
  if (index !== -1) {
    current.value = index
  }
})

// 暴露方法供外部调用
defineExpose({
  switchTab,
  getCurrentIndex: () => current.value
})
</script>

<style scoped>
.tabbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 24rpx 20rpx;
  background: transparent;
  z-index: 999;
}

.tabbar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 120rpx;
  background: #FFFFFF;
  border-radius: 60rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  padding: 0 20rpx;
  position: relative;
}

.tabbar::before {
  content: '';
  position: absolute;
  top: -32rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 130rpx;
  height: 130rpx;
  background: #FFFFFF;
  border-radius: 50%;
  z-index: -1;
  opacity: 1;
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tabbar-item-center {
  flex: 0 0 120rpx;
  margin: 0 10rpx;
  position: relative;
}

.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;
}

.icon {
  width: 44rpx;
  height: 44rpx;
}

.tabbar-text {
  font-size: 20rpx;
  color: #999999;
  transition: color 0.3s;
}

.text-active {
  font-weight: 500;
}

/* 中间扫码按钮样式 */
.scan-button {
  width: 100rpx;
  height: 100rpx;
  background: #C8C8C8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -80rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.scan-icon {
  width: 50rpx;
  height: 50rpx;
}
</style>

