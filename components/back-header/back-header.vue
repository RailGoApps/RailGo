<template>
	<view>
		<view class="bh-status" :style="{ backgroundColor: barColor }">&nbsp;</view>
		<view class="bh-btn" :class="{ 'bh-btn-px': usePx }"
			:style="{ top: backTop, backgroundColor: background }"
			hover-class="bh-btn-hover" @click="goBack">
			<text class="icon" :style="{ fontSize: usePx ? '22px' : '45rpx' }">&#xe5c4;</text>
			<text v-if="title" class="bh-title" :class="{ 'bh-title-px': usePx }">{{title}}</text>
		</view>
		<view class="bh-placeholder" :style="{ height: placeholderHeight + 'px' }"></view>
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
		data() {
			return {
				statusHeight: 44,
				backTop: '44px',
				placeholderHeight: 89 // 状态栏高度 + 按钮高度(90rpx≈45px)
			}
		},
		created() {
			try {
				const info = uni.getSystemInfoSync();
				this.statusHeight = info.statusBarHeight || 44;
				this.backTop = this.statusHeight + 'px';
				this.placeholderHeight = this.statusHeight + (this.usePx ? 44 : 45);
			} catch (e) {
				// 保持默认值
			}
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
		height: var(--status-bar-height);
		z-index: 999;
	}
	.bh-btn {
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
