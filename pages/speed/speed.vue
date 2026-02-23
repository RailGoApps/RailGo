<template>
	<view class="ux-bg-grey5" style="height:100vh;">
	<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>
		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">实时测速</text>
		</view>

		<view class="ux-padding ux-bg-grey5">
			
			<view class="speed-card">
				<view class="accuracy-btn" @click="toggleAccuracy">
					<view class="btn-circle" :class="{'is-high-accuracy': isHighAccuracy}">
						<text v-if="!isHighAccuracy" class="btn-text">低</text>
						<text v-if="isHighAccuracy" class="btn-text">高</text>
					</view>
				</view>

				<text class="speed-text">{{speed}}</text>
				<text class="unit-text">km/h</text>
				<view class="label-text">您的速度</view>
			</view>

			<view class="info-card">
				<view class="info-item">
					<text class="label-bold">经度</text>
					<text class="info-value">{{longitude}}</text>
				</view>
				<view class="info-item">
					<text class="label-bold">纬度</text>
					<text class="info-value">{{latitude}}</text>
				</view>
				<view class="info-item">
					<text class="label-bold">海拔</text>
					<text class="info-value">{{altitude}}m</text>
				</view>
				<view class="info-item">
					<text class="label-bold">半球</text>
					<text class="info-value">{{hemisphere_lat}} {{hemisphere_lon}}</text>
				</view>
				<view class="info-item">
					<text class="label-bold">卫星数</text>
					<text class="info-value">{{satellites}}</text>
				</view>
				<view class="info-item">
					<text class="label-bold">定位方式</text>
					<text class="info-value">{{locationProvider}}</text>
				</view>
			</view>
			
			<br>
			<view class="ux-padding-small ux-mb ux-h6 ux-text-center"
				style="background-color:#e9eef5;border:1px solid #114598;border-radius:10rpx;color:#114598;">
				<text class="ux-bold">定位服务由系统提供，测速信息仅供参考</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				"speed": 0,
				"longitude": 0,
				"latitude": 0,
				"altitude": 0,
				"satellites": 0,
				"locationProvider": "未知",
				"hemisphere_lat": "未知",
				"hemisphere_lon": "未知",
				"isHighAccuracy": false,
				"speedHistory": [], 
				"HISTORY_SIZE": 10,
				"updateInterval": null
			}
		},
		onLoad() {
			this.getLocationSpeed();
			this.startSpeedUpdate();
		},
		onUnload() {
			this.stopSpeedUpdate();
		},
		methods: {
			back: function() {
				uni.navigateBack()
			},
			toggleAccuracy() {
				this.isHighAccuracy = !this.isHighAccuracy;
				this.stopSpeedUpdate();
				setTimeout(() => {
					this.startSpeedUpdate();
				}, 200);
				uni.showToast({
					title: this.isHighAccuracy ? '已切换至高精度模式' : '已切换至普通精度模式',
					icon: 'none'
				});
			},
			startSpeedUpdate() {
				const interval = 500;
				this.updateInterval = setInterval(() => {
					this.getLocationSpeed();
				}, interval);
			},
			stopSpeedUpdate() {
				if (this.updateInterval) {
					clearInterval(this.updateInterval);
					this.updateInterval = null;
				}
			},
			getLocationSpeed() {
				uni.getLocation({
					type: 'wgs84',
					isHighAccuracy: this.isHighAccuracy,
					altitudeAccuracy: true,
					success: (res) => {
						// 1. 将原始速度 m/s 转换为 km/h
						const rawSpeed = (res.speed * 3.6);
						
						// 2. 速度变化检测
						if (rawSpeed >= 0) {
							if (this.speedHistory.length > 0) {
								const lastSpeed = this.speedHistory[this.speedHistory.length - 1];
								const diff = Math.abs(rawSpeed - lastSpeed);
								if (diff > 50) {
									console.warn('速度变化过大，可能是异常数据:', rawSpeed, lastSpeed);
								} else {
									this.speedHistory.push(rawSpeed);
								}
							} else {
								this.speedHistory.push(rawSpeed);
							}
						}
			
						// 3. 维护历史记录的大小
						if (this.speedHistory.length > this.HISTORY_SIZE) {
							this.speedHistory.shift();
						}
			
						// 4. 计算平滑后的速度
						let smoothedSpeed = 0;
						if (this.speedHistory.length > 0) {
							const total = this.speedHistory.reduce((sum, current) => sum + current, 0);
							smoothedSpeed = total / this.speedHistory.length;
						}
						this.speed = smoothedSpeed.toFixed(2);
			
						// 5. 更新经纬度和半球信息
						this.longitude = res.longitude.toFixed(6);
						this.latitude = res.latitude.toFixed(6);
						this.hemisphere_lat = res.latitude >= 0 ? '北半球' : '南半球';
						this.hemisphere_lon = res.longitude >= 0 ? '东半球' : '西半球';
			
						// 6. 更新海拔、卫星数、定位方式
						this.altitude = res.altitude ? res.altitude.toFixed(1) : '0';
						
						// #ifdef APP-PLUS
						// Android 平台获取额外信息（卫星数、定位方式）
						this.getAndroidLocationInfo();
						// #endif
						
						// #ifndef APP-PLUS
						// 非 APP 平台使用系统提供的数据
						this.satellites = res.satellites || 0;
						this.locationProvider = '系统定位';
						// #endif
					},
					fail: (err) => {
						console.error('获取地理位置失败:', err);
						uni.showToast({
							title: '定位失败',
							icon: 'error'
						});
					}
				});
			},
			getAndroidLocationInfo() {
				// #ifdef APP-PLUS
				try {
					const systemInfo = uni.getSystemInfoSync();
					if (systemInfo.platform !== 'android') {
						return;
					}
					
					const main = plus.android.runtimeMainActivity();
					const LocationManager = plus.android.importClass("android.location.LocationManager");
					const locationManager = main.getSystemService(main.LOCATION_SERVICE);
					
					// 获取最后一次已知位置
					const providers = ['gps', 'network'];
					for (let provider of providers) {
						try {
							const lastLocation = locationManager.getLastKnownLocation(LocationManager[provider.toUpperCase() + '_PROVIDER']);
							if (lastLocation) {
								// 获取卫星数
								const bundle = plus.android.invoke(lastLocation, "getExtras");
								if (bundle != null) {
									const satellites = plus.android.invoke(bundle, "getInt", "satellites", 0);
									if (satellites > 0) {
										this.satellites = satellites;
									}
								}
								
								// 获取定位方式
								const locProvider = plus.android.invoke(lastLocation, "getProvider");
								if (locProvider) {
									this.locationProvider = locProvider === 'gps' ? 'GPS' : (locProvider === 'network' ? '网络' : locProvider);
								}
								break;
							}
						} catch (e) {
							console.warn('获取定位提供者 ' + provider + ' 信息失败:', e);
						}
					}
				} catch (e) {
					console.error('获取 Android 定位信息失败:', e);
				}
				// #endif
			}
		}
	}
</script>

<style>
	.speed-card {
		position: relative;
		background-color: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		padding: 60rpx 40rpx;
		text-align: center;
		margin-top: 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.speed-text {
		font-size: 140rpx;
		font-weight: bold;
		color: #114598;
	}

	.unit-text {
		font-size: 40rpx;
		color: #666;
		margin-left: 10rpx;
		margin-top: -20rpx;
	}

	.label-text {
		font-size: 28rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.accuracy-btn {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		z-index: 10;
		cursor: pointer;
	}

	.btn-circle {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background-color: #114598;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #ffffff;
		font-size: 24rpx;
		transition: background-color 0.3s;
	}

	.btn-circle.is-high-accuracy {
		background-color: gold;
	}

	.btn-text {
		font-weight: bold;
	}

	.info-card {
		background-color: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		padding: 32rpx;
		margin-top: 24rpx;
		display: flex;
		flex-wrap: wrap;
	}

	.info-item {
		text-align: center;
		flex: 0 0 33.33%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.info-item:nth-child(n+4) {
		margin-bottom: 0;
	}

	.label-bold {
		font-weight: bold;
		font-size: 28rpx;
	}

	.info-value {
		margin-top: 10rpx;
	}
</style>