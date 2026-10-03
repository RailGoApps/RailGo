<template>
	<view>
		<railgo-zn-loading v-if="style === 'zn'" :visible="visible"></railgo-zn-loading>
		<view v-else-if="visible" class="rl-mask">
			<view class="rl-panel">
				<view class="rl-logo">
					<image class="rl-img rl-img--ghost" src="/static/index-logo.svg" mode="scaleToFill" />
					<view class="rl-riser">
						<image class="rl-img" src="/static/index-logo.svg" mode="scaleToFill" />
					</view>
				</view>
				<text class="rl-text">{{ title }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { getLoaderState } from '@/scripts/loader.js';
	import RailgoZnLoading from '@/components/railgo-zn-loading/railgo-zn-loading.vue';

	export default {
		name: 'railgo-loader',
		components: {
			RailgoZnLoading
		},
		data() {
			return {
				visible: false,
				title: '加载中',
				style: uni.getStorageSync('loaderStyle') || 'zn'
			}
		},
		mounted() {
			uni.$on('railgo-loader', this.syncState);
			// 挂载前可能已经有请求，补一次当前状态
			this.syncState(getLoaderState());
		},
		beforeUnmount() {
			uni.$off('railgo-loader', this.syncState);
		},
		methods: {
			syncState(payload) {
				if (!payload) return;
				this.style = uni.getStorageSync('loaderStyle') || 'zn';
				this.visible = payload.visible;
				this.title = payload.title;
			}
		}
	}
</script>

<style scoped>
	.rl-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.06);
	}

	.rl-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx 30rpx 16rpx;
		border-radius: 14rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.14);
		background-color: rgba(28, 32, 40, 0.52);
		-webkit-backdrop-filter: blur(16px) saturate(160%);
		backdrop-filter: blur(16px) saturate(160%);
		box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.1);
	}

	/* logo 306.89 x 161.22，按 104rpx 宽等比缩放 */
	.rl-logo {
		position: relative;
		width: 104rpx;
		height: 55rpx;
		overflow: hidden;
	}

	.rl-img {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 104rpx;
		height: 55rpx;
	}

	.rl-img--ghost {
		opacity: 0.22;
	}

	/* 裁剪框自底部升高，内部图片底对齐，形成液面填满效果 */
	.rl-riser {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 104rpx;
		height: 0;
		overflow: hidden;
		animation: rl-rise 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}

	@keyframes rl-rise {
		0% {
			height: 0;
		}

		100% {
			height: 100%;
		}
	}

	.rl-text {
		margin-top: 12rpx;
		font-size: 20rpx;
		color: rgba(255, 255, 255, 0.8);
		letter-spacing: 1rpx;
	}
</style>
