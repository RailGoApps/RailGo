<template>
	<view>
		<view class="bh-status" :style="{ backgroundColor: barColor }">&nbsp;</view>
		<view class="bh-btn" :class="{ 'bh-btn-px': usePx }"
			:style="{ backgroundColor: background }"
			hover-class="bh-btn-hover" @click="goBack">
			<text class="icon" :style="{ fontSize: usePx ? '22px' : '45rpx' }">&#xe5c4;</text>
			<text v-if="title" class="bh-title" :class="{ 'bh-title-px': usePx }">{{title}}</text>
		</view>
		<view class="bh-placeholder" :class="{ 'bh-placeholder-px': usePx }"></view>
	</view>
</template>

<script>
	export default {
		name: 'back-header',
		props: {
			// 状态栏背景色
			barColor: { type: String, default: '#114598' },
			// 返回按钮区域背景色（跟随页面背景）
			background: { type: String, default: '#EEEEEE' },
			// 可选标题文字，空则不显示
			title: { type: String, default: '' },
			// 横屏页 rpx 按长边换算会被放大，此模式下头部尺寸固定用 px
			usePx: { type: Boolean, default: false }
		},
		methods: {
			goBack() {
				uni.navigateBack();
			}
		}
	}
</script>

<style scoped>
	.bh-status {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: var(--status-bar-height, 0px);
		z-index: 999;
	}
	.bh-placeholder {
		height: calc(var(--status-bar-height, 0px) + 90rpx + 24px);
	}
	.bh-placeholder-px {
		height: calc(var(--status-bar-height, 0px) + 68px);
	}
	.bh-btn {
		top: calc(var(--status-bar-height, 0px) + 12px);
		position: fixed;
		left: 0;
		right: 0;
		height: 90rpx;
		display: flex;
		align-items: center;
		padding-left: 30rpx;
		z-index: 999;
	}
	.bh-btn-hover {
		background-color: #eef0f4;
	}
	.bh-btn-px {
		height: 44px;
		padding-left: 12px;
	}
	.bh-title {
		margin-left: 20rpx;
		font-size: 34rpx;
		font-weight: bold;
		color: #373737;
	}
	.bh-title-px {
		margin-left: 10px;
		font-size: 16px;
	}
</style>
