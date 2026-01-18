<template>
	<view class="ux-bg-primary" style="height:  var(--status-bar-height);">&nbsp;</view>
	<view class="ux-padding ux-bg-grey5" style="min-height: 100vh;">
		<view class="ux-flex ux-space-between ux-align-items-center">
			<view>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</view>
			<image class="ux-mb-small" src="/static/index-logo.png" mode="widthFix" style="width:250rpx;"></image>
			<view hover-class="ux-tap">
				<navigator class="ux-border-radius" url="/pages/about/about">
					<text class="icon section-icon ux-pt-small">&#xe5d4;</text>
				</navigator>
			</view>
		</view>

		<view class="ux-border-radius-large notice">
			<!-- 公告栏，提供官方通知，文字（公益）广告 -->
			<view class="left">
				<text class="icon" :class="[isWarning ? 'ux-color-red' : 'ux-color-primary']">&#xe0b9;</text>
				<text class="text" :class="{'text-ad': isAdTitle, 'text-red': isWarning}">
					&nbsp;{{ noticeTitle }}
				</text>
			</view>
			<view class="center">
				<swiper vertical autoplay interval="3000" duration="300" circular @change="onNoticeChange">
					<swiper-item v-for="(item, index) in items" :key="index"
						class="ux-pl-small ux-opacity-8 notice-item-text">
						{{ formatNoticeContent(item) }}
					</swiper-item>
				</swiper>
			</view>
		</view>

		<view class="ux-mt-small ux-flex1">
			<view class="ux-flex ux-rows ux-wrap ux-space-between">
				<navigator class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mr-small"
					style="flex:auto;width:1rpx;" hover-class="ux-tap" url="/pages/train/query">
					<text class="icon section-icon ux-color-purple">&#xe192;</text>
					<br>
					<text class="ux-text">车次</text>
					<br>
					<text class="ux-text-small ux-opacity-8">查询时刻、开行日等信息。</text>
					<br><br>
					<view class="ux-text-right ux-mr-small">
						<text class="icon">&#xe5c8;</text>
					</view>
				</navigator>
				<navigator class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-ml-small"
					style="flex:auto;width:1rpx;" hover-class="ux-tap" url="/pages/station/query">
					<text class="icon section-icon ux-color-cyan1">&#xe88a;</text>
					<br>
					<text class="ux-text">车站</text>
					<br>
					<text class="ux-text-small ux-opacity-8">查询通过车次、线路等信息。</text>
					<br><br>
					<view class="ux-text-right ux-mr-small">
						<text class="icon">&#xe5c8;</text>
					</view>
				</navigator>
			</view>
			<br>
			<view class="ux-flex ux-rows ux-wrap ux-space-between">		
				<navigator class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mr-small"
					style="flex:auto;width:1rpx;" hover-class="ux-tap" url="/pages/speed/speed">
					<text class="icon section-icon ux-color-brown">&#xe55e;</text>
					<br>
					<text class="ux-text">实时测速</text>
					<br>
					<text class="ux-text-small ux-opacity-8">实时使用GPS进行速度测试。</text>
					<br><br>
					<view class="ux-text-right ux-mr-small">
						<text class="icon">&#xe5c8;</text>
					</view>
				</navigator>
				<view class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-ml-small"
					style="flex:auto;width:1rpx;">
					<text class="icon section-icon ux-color-blue">&#xe1b7;</text>
					<br>
					<text class="ux-text">雷达</text>
					<br>
					<text class="ux-text-small ux-opacity-8">实时预测附近经过的列车。</text>
					<br><br>
					<view class="ux-text-right ux-mr-small"></view>
					<text class="ux-text-small">施工中 请静候佳音</text>
				</view>
			</view><br>
			<view class="ux-flex ux-rows ux-wrap ux-space-between">
				<navigator class="ux-th ux-bg-white ux-border-radius-large ux-padding"
					style="flex:auto;width:1rpx;" hover-class="ux-tap" url="/pages/emu/query">
					<text class="icon section-icon ux-color-orange1">&#xe570;</text>
					<br>
					<text class="ux-text">动车组</text>
					<br>
					<text class="ux-text-small ux-opacity-8">查询动车组配属和运行交路。</text>
					<br><br>
					<view class="ux-text-right ux-mr-small">
						<text class="icon">&#xe5c8;</text>
					</view>
				</navigator>
			</view>
		</view>
		<br>
		<!-- 图片广告 -->
		<swiper v-if="bannerImages.length > 0" class="ux-border-radius-large" :style="{height: swiperHeight}" indicator-dots circular autoplay>
			<swiper-item v-for="(url, index) in bannerImages" :key="index">
				<image :src="url" mode="widthFix" class="ux-border-radius-large" style="width: 100%;" @load="onImageLoad"></image>
			</swiper-item>
		</swiper>
		<image v-else class="ux-border-radius-large" src="/static/overlay/index_banner_1.png" style="width:100%;" mode="widthFix"></image>
	</view>
</template>

<script>
	import { uniGet } from "@/scripts/req.js";

	export default {
		data() {
			return {
				items: ['暂无公告'],
				currentIndex: 0,
				bannerImages: [],
				swiperHeight: '210rpx'
			};
		},
		computed: {
			activeItem() {
				return this.items[this.currentIndex] || '';
			},
			noticeTitle() {
				if (this.activeItem.startsWith('[AD]')) return '广告';
				if (this.activeItem.startsWith('[PSAD]')) return '公益广告';
				return '公告';
			},
			isAdTitle() {
				return this.activeItem.startsWith('[PSAD]');
			},
			isWarning() {
				return this.activeItem.startsWith('[WAR]');
			}
		},
		mounted() {
			this.fetchRemoteData();
		},
		methods: {
			formatNoticeContent(content) {
				if (!content) return '';
				return content.replace(/^\[AD\]|^\[PSAD\]|^\[WAR\]/, '');
			},
			onNoticeChange(e) {
				this.currentIndex = e.detail.current;
			},
			async fetchRemoteData() {
				try {
					const noticeResponse = await uniGet("https://api.state.railgo.zenglingkun.cn/notice");
					if (noticeResponse.data && noticeResponse.data.length > 0) {
						this.items = noticeResponse.data;
					}
					const picResponse = await uniGet("https://api.state.railgo.zenglingkun.cn/pic");
					this.bannerImages = picResponse.data;
				} catch (error) {
					console.error('Fetch error:', error);
				}
			},
			onImageLoad(e) {
				const { width, height } = e.detail;
				const screenWidth = uni.getSystemInfoSync().windowWidth;
				this.swiperHeight = `${(screenWidth * height) / width}px`;
			}
		}
	};
</script>

<style lang="scss">
	.ux-color-red { color: #B71C1C !important; }
	.section-icon { font-size: 50rpx; }

	.notice {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		background: #fdfdfd;
		margin-top: 10px;
		display: flex;
		overflow: hidden;

		.left {
			min-width: 140rpx;
			padding: 0 10rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			.text {
				color: #114598;
				font-weight: 600;
				font-size: 28rpx;
				white-space: nowrap;
				
				&.text-ad {
					font-size: 22rpx;
				}
				&.text-red {
					color: #ff4d4f;
				}
			}
		}

		.center {
			flex: 1;
			overflow: hidden;

			swiper {
				height: 100%;

				.notice-item-text {
					height: 100%;
					font-size: 24rpx;
					color: #666;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis; 
					display: flex;
					align-items: center;
				}
			}
		}
	}
</style>