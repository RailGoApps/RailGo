<template>
	<view class="ux-bg-primary" style="height:  var(--status-bar-height);">&nbsp;</view>
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
		<br>
		<text class="ux-pl-small ux-opacity-6 ux-text-small">{{this.title}}</text>
		<view class="ux-border-radius-large notice">
			<view class="left">
				<text class="icon ux-color-primary">&#xe0b9;</text>
				<text class="text">&nbsp;公告</text>
			</view>
			<view class="center">
				<swiper vertical autoplay interval="2500" duration="300" circular>
					<swiper-item v-for="(item, index) in items" :key="index" style="font-size: 24rpx;"
						class="ux-pl-small ux-opacity-8">
						{{ item }}
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
					<br>
					<br>
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
					<br>
					<br>
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
					<br>
					<br>
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
					<br>
					<br>
					<view class="ux-text-right ux-mr-small">
						</view>
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
					<br>
					<br>
					<view class="ux-text-right ux-mr-small">
						<text class="icon">&#xe5c8;</text>
					</view>
				</navigator>
			</view>
		</view>
		<br>
		<swiper v-if="bannerImages.length > 0" class="ux-border-radius-large" :style="{height: swiperHeight}" indicator-dots circular autoplay>
			<swiper-item v-for="(url, index) in bannerImages" :key="index">
				<image :src="url" mode="widthFix" class="ux-border-radius-large" style="width: 100%;" @load="onImageLoad"></image>
			</swiper-item>
		</swiper>
		<image v-else class="ux-border-radius-large" src="/static/overlay/index_banner_1.png" style="width:100%;" mode="widthFix"></image>
	</view>
	
	<!-- 更新欢迎弹窗 -->
	<view v-if="showUpdatePopup" class="update-popup-overlay" @click="closeUpdatePopup">
		<view class="update-popup" @click.stop="() => {}">
			<view class="update-popup-content">
				<text class="update-popup-title">🎉 欢迎使用新版本</text>
				<text class="update-popup-message">欢迎来到 RailGo {{ updateVersion }} 版本<br>可去更新日志看看哦！</text>
			</view>
		</view>
	</view>
</template>

<script>
	// 导入本地 JSON 文件
	import hitokotoData from '@/static/i.json';

	async function check() {
		if (uni.getStorageSync("jqok")) {
			return
		}
		try {
			const Response = await uniGet("https://center.zenglingkun.cn/beta/api/check/" + uni.getStorageSync(
				'version') + "?userid=" + uni.getStorageSync('qq') + "&key=" + uni.getStorageSync('key'));
			if (Response.data.valid) {
				uni.setStorageSync("AuthTime", new Date().getTime())
				console.log("鉴权成功")
				uni.showToast({
					title: '鉴权成功',
					position: 'bottom',
				})
				uni.setStorage({
					key: 'jqok',
					data: true
				});
			} else {
				uni.showToast({
					title: '鉴权无效',
					position: 'bottom',
				})
				uni.setStorageSync("oobe", false)
				uni.reLaunch({
					url: '/pages/oobe/welcome'
				})
			}

		} catch (error) {
			if (checkTime(uni.getStorageSync("AuthTime"), new Date().getTime())) {
				uni.showToast({
					title: '鉴权超时，请重新鉴权',
					position: 'bottom',
				})
				uni.setStorageSync("oobe", false)
				uni.reLaunch({
					url: '/pages/oobe/welcome'
				})
			} else {
				console.log("无网络但未超时")
				uni.showToast({
					title: '离线鉴权成功',
					position: 'bottom',
				})
			}
		}
	}
import {uniGet} from "@/scripts/req.js";
	import {
		loadDB
	} from "@/scripts/sqlite.js";
	import {
		doQuery,
	} from "@/scripts/sqlite.js";
	import {
		KEYS_STRUCT_STATIONS,
		KEYS_STRUCT_TRAINS
	} from "@/scripts/config.js";
	export default {
		// Railgo Code
		data() {
			return {
				title: '海内存知己，天涯若比邻。', // 默认值
				visit: 0,
				query: 0,
				items: ['暂无公告'],
				bannerImages: [],
				swiperHeight: '210rpx', // Initialize with a default height
				showUpdatePopup: false,
				updateVersion: ''
			};
		},
		mounted() {
			this.setHitokoto();
			this.fetchRemoteData();
		},
		onShow() {
			// #ifdef APP
			plus.navigator.setStatusBarBackground('#114598');
			plus.navigator.setFullscreen(false);
			plus.navigator.showSystemNavigation();
			// #endif
			// 鉴权
			if (uni.getStorageSync("NeedAuth")) {
				check()
			}
			
			const navigateToUpdates = uni.getStorageSync('navigateToUpdates');
			if (navigateToUpdates) {
				uni.removeStorageSync('navigateToUpdates'); 
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/about/UpdateInfo'
					});
				}, 300);
			}
			
			// 检查是否需要显示更新欢迎弹窗
			const customPopupData = uni.getStorageSync('showCustomUpdatePopup');
			if (customPopupData && customPopupData.show) {
				uni.removeStorageSync('showCustomUpdatePopup'); // 清除标记
				this.showUpdatePopup = true;
				this.updateVersion = customPopupData.version;
			}
		},
		methods: {
			setHitokoto() {
				const maxAttempts = 20;
				for (let i = 0; i < maxAttempts; i++) {
					const randomIndex = Math.floor(Math.random() * hitokotoData.length);
					const hitokoto = hitokotoData[randomIndex].hitokoto;

					if (hitokoto.length <= 18) {
						this.title = hitokoto;
						return;
					}
				}
				this.title = '海内存知己，天涯若比邻。';
			},

			async fetchRemoteData() {
				try {
					const statsResponse = await uniGet('https://api.state.railgo.zenglingkun.cn/state');
					this.visit = statsResponse.data.visits;
					this.query = statsResponse.data.queries;

					const noticeResponse = await uniGet("https://api.state.railgo.zenglingkun.cn/notice");
					this.items = noticeResponse.data;

					const picResponse = await uniGet("https://api.state.railgo.zenglingkun.cn/pic");
					this.bannerImages = picResponse.data;

					await uniGet("https://api.state.railgo.zenglingkun.cn/visit");
				} catch (error) {
					console.error('Error fetching remote data:', error);
					this.visit = 0;
					this.query = 0;
					this.items = ['暂无公告'];
					this.bannerImages = [];
				}
			},
			onImageLoad(e) {
				// We only need to set the height once for the first image
				if (this.swiperHeight === '210rpx' && this.bannerImages.length > 0) {
					const {
						width,
						height
					} = e.detail;
					const screenWidth = uni.getSystemInfoSync().windowWidth;
					const newHeight = (screenWidth * height) / width;
					this.swiperHeight = `${newHeight}px`;
				}
			},
			
			closeUpdatePopup() {
				this.showUpdatePopup = false;
			},
			
			goToUpdateLog() {
				this.showUpdatePopup = false;
				uni.navigateTo({
					url: '/pages/about/UpdateInfo'
				});
			}
		}
	};
</script>

<style lang="scss">
	.section-icon {
		font-size: 50rpx;
	}

	.main {
		.box {
			background: #ffffff;
			box-sizing: border-box;
			font-family: "钉钉进步体";
			overflow: hidden;

			.desc {
				margin-left: 23px;
				font-size: 14px;
				position: absolute;
				margin-top: -5px;
			}

			.data {
				margin-left: 23px;
				font-size: 13px;
				position: absolute;
				margin-top: 13px;
				color: gray
			}
		}
	}

	.notice {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		background: #f9f9f9;
		margin: 0 auto;
		margin-top: 10px;
		display: flex;

		.left {
			width: 140rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			.text {
				color: #114598;
				font-weight: 600;
				font-size: 28rpx;
			}
		}

		.center {
			flex: 1;

			swiper {
				height: 100%;

				&-item {
					height: 100%;
					font-size: 30rpx;
					color: #666;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
			}
		}

		.right {
			width: 70rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
	
	/* 更新欢迎弹窗样式 */
	.update-popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
	}
	
	.update-popup {
		width: 80%;
		max-width: 500rpx;
		background: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		animation: popupScaleIn 0.3s ease-out;
	}
	
	@keyframes popupScaleIn {
		0% {
			transform: scale(0.7);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
	
	.update-popup-content {
		padding: 40rpx;
		text-align: center;
	}
	
	.update-popup-header {
		margin-bottom: 20rpx;
	}
	
	.update-popup-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #114598;
		display: block;
	}
	
	.update-popup-body {
		margin: 30rpx 0;
	}
	.update-popup-message {
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
	}
</style>