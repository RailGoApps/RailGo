<template>
	<view class="skeleton-block" :class="'skeleton-block--' + tone" :style="blockStyle"></view>
</template>

<script>
	export default {
		name: 'skeleton',
		props: {
			w: {
				type: [String, Number],
				default: '100%'
			},
			h: {
				type: [String, Number],
				default: '28rpx'
			},
			radius: {
				type: [String, Number],
				default: '8rpx'
			},
			mr: {
				type: [String, Number],
				default: '0'
			},
			mt: {
				type: [String, Number],
				default: '0'
			},
			flex: {
				type: Boolean,
				default: false
			},
			// light：白底卡片；dark：白底上需要更强对比的色块；on-dark：深色底（如大屏表格）
			tone: {
				type: String,
				default: 'light'
			}
		},
		computed: {
			blockStyle() {
				const size = (v) => typeof v === 'number' ? v + 'rpx' : v;
				let s = 'width:' + (this.flex ? 'auto' : size(this.w)) + ';';
				if (this.flex) s += 'flex:1 1 0;';
				s += 'height:' + size(this.h) + ';';
				s += 'border-radius:' + size(this.radius) + ';';
				s += 'margin-right:' + size(this.mr) + ';';
				s += 'margin-top:' + size(this.mt) + ';';
				return s;
			}
		}
	}
</script>

<style scoped>
	.skeleton-block {
		flex-shrink: 0;
		background-color: #e9edf2;
		background-image: linear-gradient(90deg, #e9edf2 25%, #f5f7fa 37%, #e9edf2 63%);
		background-size: 400% 100%;
		animation: skeleton-shimmer 1.4s ease-in-out infinite;
	}

	@keyframes skeleton-shimmer {
		0% {
			background-position: 100% 50%;
		}

		100% {
			background-position: 0 50%;
		}
	}

	.skeleton-block--light {
		background-color: #e9edf2;
		background-image: linear-gradient(90deg, #e9edf2 25%, #f5f7fa 37%, #e9edf2 63%);
	}

	/* 白底卡片上需要更强对比的色块 */
	.skeleton-block--dark {
		background-color: #ccd6e3;
		background-image: linear-gradient(90deg, #ccd6e3 25%, #e2e8f0 37%, #ccd6e3 63%);
	}

	/* 深色底（大屏表格）上的占位块 */
	.skeleton-block--on-dark {
		background-color: #8fa4bb;
		background-image: linear-gradient(90deg, #8fa4bb 25%, #a9bcd0 37%, #8fa4bb 63%);
	}
</style>
