<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">更新管理</text>
		</view>
		
		<view class="ux-padding">
			<block v-if="isAndroid">
				<uni-section style="background-color:#eeeeee;margin-left:-1.2vh;" type="line" title="软件本体" title-font-size="34rpx"></uni-section>
				
				<view v-if="loading" class="card">
					<text class="card-title ux-text-center">{{ statusMessage }}</text><br><br>
					<view class="indeterminate-progress-container ux-progress-mt">
						<view class="indeterminate-progress-bar"></view>
					</view>
				</view>
				
				<view v-else class="card">
					<view class="ux-flex ux-align-items-center ux-space-between ux-pb-small">
						<view>
							<text class="card-title">{{ appUpdateStatusText }}</text>
							<view v-if="hasAppUpdate" class="card-subtitle">快去更新吧</view>
							<view v-else-if="isBeta" class="card-subtitle">您正在使用测试版软件</view>
							<view v-else class="card-subtitle">已是最新</view>
						</view>
						<text class="status-icon" :class="hasAppUpdate ? 'has-update-color' : 'no-update-color'">
							{{ hasAppUpdate ? '&#xe05e;' : '&#xe834;' }}
						</text>
					</view>
					
					<view class="line-divider"></view>
					
					<view class="version-row">
						<text class="label-bold">当前版本</text>
						<text class="version-value">{{ currentAppVersionText }}</text>
					</view>
					<view v-if="hasAppUpdate" class="version-row">
						<text class="label-bold">最新版本</text>
						<text class="version-value">{{ latestAppVersionText }}</text>
					</view>
				</view>
				
				<button v-if="hasAppUpdate" class="ux-button-primary ux-mt-large" @click="gotoDownloadApp">立即更新软件</button>
				<button v-else-if="isBeta" class="ux-button-disabled ux-mt-large" disabled>测试版本</button>
				<button v-else class="ux-button-disabled ux-mt-large" disabled>软件已是最新</button>
				
				<br>
				<uv-divider text="·" :hairline="false"></uv-divider>
			</block>

			<uni-section style="background-color:#eeeeee;margin-left:-1.2vh;" type="line" title="数据库" title-font-size="34rpx"></uni-section>
			
			<view v-if="loading" class="card">
				<text class="card-title ux-text-center">{{ statusMessage }}</text><br><br>
				<view class="indeterminate-progress-container ux-progress-mt">
					<view class="indeterminate-progress-bar"></view>
				</view>
			</view>

			<view v-else class="card">
				<view class="ux-flex ux-align-items-center ux-space-between ux-pb-small">
					<view>
						<text class="card-title">{{ updateStatusText }}</text>
						<view class="card-subtitle">{{ hasDbUpdate ? '快去更新吧' : '已拥有最新数据' }}</view>
					</view>
					<text class="status-icon" :class="hasDbUpdate ? 'has-update-color' : 'no-update-color'">
						{{ hasDbUpdate ? '&#xe05e;' : '&#xe834;' }}
					</text>
				</view>
				
				<view class="line-divider"></view>
				
				<view class="version-row">
					<text class="label-bold">当前版本</text>
					<text class="version-value">{{ currentDbVersionText }}</text>
				</view>
				<view v-if="hasDbUpdate" class="version-row">
					<text class="label-bold">最新版本</text>
					<text class="version-value">{{ latestDbVersionText }}</text>
				</view>
			</view>
			
			<button v-if="hasDbUpdate" class="ux-button-primary ux-mt-large" @click="gotoDownload">立即更新数据库</button>
			<button v-else class="ux-button-disabled ux-mt-large" disabled>数据库已是最新</button>
		</view>
	</view>
</template>

<script>
import { uniGet } from "@/scripts/req.js";
	
	export default {
		data() {
			return {
				loading: true,
				statusMessage: "正在检查更新...",
				hasDbUpdate: false,
				currentDbVersion: 0,
				currentDbVersionText: "",
				latestDbVersion: 0,
				latestDbVersionText: "",
				updateStatusText: "",
				hasAppUpdate: false,
				isBeta: false,
				currentAppVersion: 0,
				currentAppVersionText: "",
				latestAppVersion: 0,
				latestAppVersionText: "",
				appUpdateStatusText: "",
			}
		},
		computed: {
			// 核心判断：是否为安卓
			isAndroid() {
				// #ifdef APP-PLUS
				return uni.getSystemInfoSync().platform === 'android';
				// #endif
				// #ifndef APP-PLUS
				return false; // H5或小程序默认不显示APP更新
				// #endif
			}
		},
		async onShow() {
			this.checkAllUpdates();
		},
		methods: {
			back() {
				uni.navigateBack();
			},
			async checkAllUpdates() {
				this.loading = true;
				this.statusMessage = "正在检查更新...";
				
				this.currentDbVersion = parseInt(uni.getStorageSync("offlineDataVersion")) || 0;
				this.currentDbVersionText = uni.getStorageSync("offlineDataVersionText") || "未知版本";
				this.currentAppVersion = parseInt(uni.getStorageSync("version")) || 0;
				this.currentAppVersionText = uni.getStorageSync("versionText") || "未知版本";

				try {
					const finalInfoResponse = await uniGet("https://api.state.railgo.zenglingkun.cn/api/v1/info");
					
					if (finalInfoResponse.status === 200 && finalInfoResponse.data) {
						const data = finalInfoResponse.data;

						// 数据库逻辑
						this.latestDbVersion = parseInt(data.latest_db);
						this.latestDbVersionText = data.db;
						this.hasDbUpdate = this.latestDbVersion > this.currentDbVersion;
						this.updateStatusText = this.hasDbUpdate ? "发现新版本数据库" : "已是最新版本";
						
						// 软件本体逻辑（虽然非安卓不显示，但逻辑保留以维持数据完整性）
						this.latestAppVersion = parseInt(data.latest_pack);
						this.latestAppVersionText = data.pack;
						
						if (this.latestAppVersion > this.currentAppVersion) {
							this.hasAppUpdate = true;
							this.isBeta = false;
							this.appUpdateStatusText = "发现新版本软件";
						} else if (this.latestAppVersion < this.currentAppVersion) {
							this.hasAppUpdate = false;
							this.isBeta = true;
							this.appUpdateStatusText = "测试版本";
						} else {
							this.hasAppUpdate = false;
							this.isBeta = false;
							this.appUpdateStatusText = "已是最新版本";
						}

					} else {
						throw new Error("获取失败");
					}
				} catch (e) {
					this.statusMessage = "检查更新失败";
				} finally {
					this.loading = false;
				}
			},
			gotoDownload() {
				uni.navigateTo({ url: '/pages/oobe/download' });
			},
			async gotoDownloadApp() {
				// 仅限安卓执行此方法
				if (!this.isAndroid) return;
				
				uni.showLoading({ title: '正在获取下载地址...', mask: true });
				try {
					const res = await uniGet("https://api.state.railgo.zenglingkun.cn/api/v1/url/pack/android");
					uni.hideLoading();
					if (res.data && res.data.url) {
						plus.runtime.openURL(res.data.url);
					}
				} catch (e) {
					uni.hideLoading();
				}
			}
		}
	}
</script>

<style>
	/* 通用样式 */
	
	.ux-button-primary {
		background-color: #114598;
		color: #ffffff;
		font-size: 32rpx;
		margin-top: 60rpx;
	}
	.ux-button-disabled {
		background-color: #c0c0c0;
		color: #ffffff;
		font-size: 32rpx;
		border-radius: 50rpx;
		margin-top: 60rpx;
	}
	
	/* 卡片样式 */
	.card {
		background-color: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		padding: 40rpx;
		margin-top: 30rpx;
	}
	
	.card-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #114598;
	}
	
	.card-subtitle {
		font-size: 28rpx;
		color: #999;
		margin-top: 5rpx;
	}
	
	.line-divider {
		height: 1px;
		background-color: #eee;
		margin: 30rpx 0;
	}
	
	.version-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.label-bold {
		font-weight: bold;
		color: #333;
		font-size: 30rpx;
	}
	
	.version-value {
		font-size: 28rpx;
		color: #666;
	}
	
	/* 状态图标样式 */
	.status-icon {
		font-family: 'Material Icons';
		font-size: 100rpx;
	}
	
	.has-update-color {
		color: #114598;
	}
	
	.no-update-color {
		color: #4cd964; /* 绿色 */
	}
	
	.ux-disclaimer {
		background-color:#e9eef5;
		border:1px solid #114598;
		border-radius:10rpx;
		color:#114598;
		padding: 20rpx;
	}
	
	/* 不确定进度条样式 */
	.indeterminate-progress-container {
		width: 100%;
		height: 6rpx;
		background-color: #ddd;
		border-radius: 3rpx;
		overflow: hidden;
	}
	
	.indeterminate-progress-bar {
		height: 100%;
		width: 30%;
		background-color: #114598;
		animation: scrollAnimation 1.5s linear infinite;
	}
	
	@keyframes scrollAnimation {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(433%);
		}
	}
</style>