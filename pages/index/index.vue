<template>
	<view class="ux-bg-primary status-bar">&nbsp;</view>

	<!-- 版本更新欢迎弹窗 -->
	<view v-if="showUpdatePopup" class="update-popup-overlay" @click="closeUpdatePopup">
		<view class="update-popup-card" @click.stop>
			<view class="update-popup-header">
				<text class="update-popup-title">欢迎来到 RailGo 新版本</text>
			</view>
			<view class="update-popup-version" v-if="updateVersion">
				<text class="ux-text-small">Version {{ updateVersion }}</text>
			</view>
			<view class="update-popup-body">
				<text class="ux-text-small ux-color-grey2">我们带来了新的功能和改进，快来看看吧！</text>
			</view>
			<text class="ux-text-small ux-color-grey3">点击阴影区域可关闭此窗口</text>
			
			<button class="update-popup-btn" @click="goUpdateLog">查看更新日志</button>
		</view>
	</view>

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
				<navigator class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-ml-small"
					style="flex:auto;width:1rpx;" hover-class="ux-tap" url="/pages/route/route">
					<text class="icon section-icon ux-color-cyan1">&#xe1b7;</text>
					<br>
					<text class="ux-text">行程 (Beta)</text>
					<br>
					<text class="ux-text-small ux-opacity-8">帮您记录您的美好行程足迹。</text>
					<br><br>
					<view class="ux-text-right ux-mr-small">
						<text class="icon">&#xe5c8;</text>
					</view>
				</navigator>
			</view><br>
			<view class="ux-flex ux-rows ux-wrap ux-space-between">
				<navigator class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mr-small"
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
				<navigator class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-ml-small"
					style="flex:auto;width:1rpx;" hover-class="ux-tap" url="/pages/gallery/query">
					<text class="icon section-icon ux-color-green6">&#xe3b3;</text>
					<br>
					<text class="ux-text">列车图鉴</text>
					<br>
					<text class="ux-text-small ux-opacity-8">看见火车迷们拍摄的列车图片。</text>
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
			<swiper-item v-for="(item, index) in bannerImages" :key="index">
				<image :src="item.img" mode="widthFix" class="ux-border-radius-large" style="width: 100%;" @load="onImageLoad" @click="openBannerLink(item.jump)"></image>
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
				swiperHeight: '0px',
				showUpdatePopup: false,
				updateVersion: ''
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
		onShow() {
			this.checkUpdatePopup();
		},
		methods: {
			checkUpdatePopup() {
				const popupData = uni.getStorageSync('showCustomUpdatePopup');
				if (popupData && popupData.show) {
					this.updateVersion = popupData.version || '';
					this.showUpdatePopup = true;
					// 消费标记，防止重复弹出
					uni.setStorageSync('showCustomUpdatePopup', { show: false });
				}
			},
			closeUpdatePopup() {
				this.showUpdatePopup = false;
			},
			goUpdateLog() {
				this.showUpdatePopup = false;
				uni.navigateTo({
					url: '/pages/about/UpdateInfo'
				});
			},
			formatNoticeContent(content) {
				if (!content) return '';
				return content.replace(/^\[AD\]|^\[PSAD\]|^\[WAR\]/, '');
			},
			onNoticeChange(e) {
				this.currentIndex = e.detail.current;
			},
			async fetchRemoteData() {
				try {
					const noticeBase = uni.getStorageSync('service_source_notice') || 'https://gateway.zenglingkun.cn';
					const noticeResponse = await uniGet(noticeBase + "/api/v2/notice");
					if (noticeResponse.data && noticeResponse.data.length > 0) {
						this.items = noticeResponse.data;
					}
					const picBase = uni.getStorageSync('service_source_notice') || 'https://gateway.zenglingkun.cn';
					const picResponse = await uniGet(picBase + "/api/v2/pic_ad");
					if (picResponse.data && Array.isArray(picResponse.data)) {
						this.bannerImages = picResponse.data;
						// 预加载所有图片，取最大高宽比设置 swiper 高度
						this.preloadBannerSizes(picResponse.data);
					}
				} catch (error) {
					console.error('Fetch error:', error);
				}
			},
			preloadBannerSizes(images) {
				let maxRatio = 0;
				let loaded = 0;
				images.forEach(item => {
					if (!item.img) {
						loaded++;
						return;
					}
					uni.getImageInfo({
						src: item.img,
						success: (res) => {
							const ratio = res.height / res.width;
							if (ratio > maxRatio) maxRatio = ratio;
						},
						complete: () => {
							loaded++;
							if (loaded === images.length && maxRatio > 0) {
								const screenWidth = uni.getSystemInfoSync().windowWidth;
								this.swiperHeight = `${(screenWidth * maxRatio)}px`;
							}
						}
					});
				});
			},
			onImageLoad(e) {
				// 兜底：预加载完成后 @load 不再覆盖已设置的高度
				if (this.swiperHeight === '0px') {
					const { width, height } = e.detail;
					const screenWidth = uni.getSystemInfoSync().windowWidth;
					this.swiperHeight = `${(screenWidth * height) / width}px`;
				}
			},
			openBannerLink(jumpUrl) {
				if (jumpUrl) {
					// #ifdef APP-PLUS
					plus.runtime.openURL(jumpUrl);
					// #endif
					// #ifdef H5
					window.open(jumpUrl, '_blank');
					// #endif
				}
			}
		}
	};
</script>

<style lang="scss">
	.ux-color-red { color: #B71C1C !important; }
	.section-icon { font-size: 50rpx; }

	/* 版本更新弹窗 */
	.update-popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}
	.update-popup-card {
		width: 580rpx;
		background: #ffffff;
		border-radius: 24rpx;
		padding: 50rpx 40rpx 40rpx;
		text-align: center;
		box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
	}
	.update-popup-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}
	.update-popup-icon {
		font-size: 80rpx;
		color: #114598;
	}
	.update-popup-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #114598;
	}
	.update-popup-version {
		margin-top: 12rpx;
	}
	.update-popup-body {
		margin-top: 24rpx;
		line-height: 1.6;
	}
	.update-popup-btn {
		margin-top: 40rpx;
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background: #114598;
		color: #ffffff;
		font-size: 30rpx;
		border-radius: 12rpx;
		border: none;
		padding: 0;
	}
	.update-popup-btn::after {
		border: none;
	}

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