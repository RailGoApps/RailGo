<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<!-- headers begin -->
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2" @click="openDebugMenu" style="cursor: pointer;">Debug</text>
		</view>
		<!-- headers end -->
		<view class="ux-padding ux-bg-grey5">
			
			<!-- 应用信息 -->
			<view class="info-card">
				<text class="card-title">应用信息</text>
				<view class="info-row">
					<text class="info-label">App ID</text>
					<text class="info-value">{{ systemInfo.appId }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">App 名称</text>
					<text class="info-value">{{ systemInfo.appName }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">App 版本</text>
					<text class="info-value">{{ systemInfo.appVersion }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">App 版本号</text>
					<text class="info-value">{{ systemInfo.appVersionCode }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">App 语言</text>
					<text class="info-value">{{ systemInfo.appLanguage }}</text>
				</view>
			</view>

			<!-- 设备信息 -->
			<view class="info-card">
				<text class="card-title">设备信息</text>
				<view class="info-row">
					<text class="info-label">设备品牌</text>
					<text class="info-value">{{ systemInfo.deviceBrand }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">设备型号</text>
					<text class="info-value">{{ systemInfo.deviceModel }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">设备类型</text>
					<text class="info-value">{{ systemInfo.deviceType }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">设备 ID</text>
					<text class="info-value">{{ systemInfo.deviceId }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">手机品牌</text>
					<text class="info-value">{{ systemInfo.brand }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">手机型号</text>
					<text class="info-value">{{ systemInfo.model }}</text>
				</view>
			</view>

			<!-- 设备详细信息 -->
			<view class="info-card">
				<text class="card-title">设备详细信息</text>
				<view class="info-row" v-if="deviceInfo.isRoot !== undefined">
					<text class="info-label">是否 Root</text>
					<text class="info-value">{{ deviceInfo.isRoot ? '是' : '否' }}</text>
				</view>
				<view class="info-row" v-if="deviceInfo.isSimulator !== undefined">
					<text class="info-label">是否模拟器</text>
					<text class="info-value">{{ deviceInfo.isSimulator ? '是' : '否' }}</text>
				</view>
				<view class="info-row" v-if="deviceInfo.isUSBDebugging !== undefined">
					<text class="info-label">ADB 调试</text>
					<text class="info-value">{{ deviceInfo.isUSBDebugging ? '开启' : '关闭' }}</text>
				</view>
				<view class="info-row" v-if="deviceInfo.idfa">
					<text class="info-label">IDFA</text>
					<text class="info-value">{{ deviceInfo.idfa }}</text>
				</view>
			</view>

			<!-- 系统信息 -->
			<view class="info-card">
				<text class="card-title">系统信息</text>
				<view class="info-row">
					<text class="info-label">平台</text>
					<text class="info-value">{{ systemInfo.platform }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">操作系统</text>
					<text class="info-value">{{ systemInfo.osName }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">系统版本</text>
					<text class="info-value">{{ systemInfo.osVersion }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">系统语言</text>
					<text class="info-value">{{ systemInfo.osLanguage }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">系统</text>
					<text class="info-value">{{ systemInfo.system }}</text>
				</view>
				<view class="info-row" v-if="systemInfo.osAndroidAPILevel">
					<text class="info-label">Android API</text>
					<text class="info-value">{{ systemInfo.osAndroidAPILevel }}</text>
				</view>
				<view class="info-row" v-if="systemInfo.romName">
					<text class="info-label">ROM 名称</text>
					<text class="info-value">{{ systemInfo.romName }}</text>
				</view>
				<view class="info-row" v-if="systemInfo.romVersion">
					<text class="info-label">ROM 版本</text>
					<text class="info-value">{{ systemInfo.romVersion }}</text>
				</view>
				<view class="info-row" v-if="systemInfo.oaid">
					<text class="info-label">OAID</text>
					<text class="info-value">{{ systemInfo.oaid }}</text>
				</view>
			</view>

			<!-- 屏幕信息 -->
			<view class="info-card">
				<text class="card-title">屏幕信息</text>
				<view class="info-row">
					<text class="info-label">屏幕宽度</text>
					<text class="info-value">{{ systemInfo.screenWidth }}px</text>
				</view>
				<view class="info-row">
					<text class="info-label">屏幕高度</text>
					<text class="info-value">{{ systemInfo.screenHeight }}px</text>
				</view>
				<view class="info-row">
					<text class="info-label">窗口宽度</text>
					<text class="info-value">{{ systemInfo.windowWidth }}px</text>
				</view>
				<view class="info-row">
					<text class="info-label">窗口高度</text>
					<text class="info-value">{{ systemInfo.windowHeight }}px</text>
				</view>
				<view class="info-row">
					<text class="info-label">窗口顶部</text>
					<text class="info-value">{{ systemInfo.windowTop }}px</text>
				</view>
				<view class="info-row">
					<text class="info-label">窗口底部</text>
					<text class="info-value">{{ systemInfo.windowBottom }}px</text>
				</view>
				<view class="info-row">
					<text class="info-label">像素比</text>
					<text class="info-value">{{ systemInfo.pixelRatio }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">设备像素比</text>
					<text class="info-value">{{ systemInfo.devicePixelRatio }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">屏幕方向</text>
					<text class="info-value">{{ systemInfo.deviceOrientation }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">状态栏高度</text>
					<text class="info-value">{{ systemInfo.statusBarHeight }}px</text>
				</view>
				<view class="info-row">
					<text class="info-label">安全区域</text>
					<text class="info-value">{{ formatSafeArea(systemInfo.safeArea) }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">安全区域插入</text>
					<text class="info-value">{{ formatSafeAreaInsets(systemInfo.safeAreaInsets) }}</text>
				</view>
			</view>

			<!-- 运行环境信息 -->
			<view class="info-card">
				<text class="card-title">运行环境</text>
				<view class="info-row">
					<text class="info-label">uni-app 平台</text>
					<text class="info-value">{{ systemInfo.uniPlatform }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">uni 运行时版本</text>
					<text class="info-value">{{ systemInfo.uniRuntimeVersion }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">uni 运行时版本号</text>
					<text class="info-value">{{ systemInfo.uniRuntimeVersionCode }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">uni 编译器版本</text>
					<text class="info-value">{{ systemInfo.uniCompileVersion }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">uni 编译器版本号</text>
					<text class="info-value">{{ systemInfo.uniCompileVersionCode }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">SDK 版本</text>
					<text class="info-value">{{ systemInfo.SDKVersion }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">引擎版本</text>
					<text class="info-value">{{ systemInfo.version }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">浏览器名称</text>
					<text class="info-value">{{ systemInfo.browserName }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">浏览器版本</text>
					<text class="info-value">{{ systemInfo.browserVersion }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">语言</text>
					<text class="info-value">{{ systemInfo.language }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">UA</text>
					<text class="info-value">{{ systemInfo.ua }}</text>
				</view>
			</view>

			<!-- 其他信息 -->
			<view class="info-card">
				<text class="card-title">其他信息</text>
				<view class="info-row">
					<text class="info-label">网络类型</text>
					<text class="info-value">{{ networkType }}</text>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				systemInfo: {},
				deviceInfo: {},
				networkType: ''
			}
		},
		onLoad() {
			// #ifdef APP-PLUS
			plus.navigator.setStatusBarBackground('#eeeeee');
			// #endif
			
			this.loadSystemInfo();
			this.loadDeviceInfo();
			this.loadNetworkInfo();
		},
		onShow() {
			// #ifdef APP-PLUS
			plus.navigator.setStatusBarBackground('#eeeeee');
			// #endif
		},
		methods: {
			back: function() {
				uni.navigateBack()
			},
			openDebugMenu: function() {
				// 显示输入框让用户输入口令
				uni.showModal({
					title: '输入口令',
					editable: true,
					placeholderText: '请输入调试口令',
					success: (res) => {
						if (res.confirm && res.content) {
							if (res.content === 'Debugger') {
								// 口令正确，跳转到调试菜单
								uni.navigateTo({
									url: '/pages/debug/menu'
								});
							} else {
								uni.showToast({
									title: '口令错误',
									icon: 'error'
								});
							}
						}
					}
				});
			},
			loadSystemInfo() {
				try {
					this.systemInfo = uni.getSystemInfoSync();
				} catch (e) {
					console.error('获取系统信息失败:', e);
					this.systemInfo = { platform: '获取失败' };
				}
			},
			loadDeviceInfo() {
				try {
					this.deviceInfo = uni.getDeviceInfo();
				} catch (e) {
					console.error('获取设备信息失败:', e);
					this.deviceInfo = {};
				}
			},
			loadNetworkInfo() {
				uni.getNetworkType({
					success: (res) => {
						this.networkType = res.networkType || '未知';
					},
					fail: () => {
						this.networkType = '获取失败';
					}
				});
			},
			formatSafeArea(safeArea) {
				if (!safeArea) return '未知';
				return `L:${safeArea.left}, R:${safeArea.right}, T:${safeArea.top}, B:${safeArea.bottom}, W:${safeArea.width}, H:${safeArea.height}`;
			},
			formatSafeAreaInsets(insets) {
				if (!insets) return '未知';
				return `L:${insets.left}, R:${insets.right}, T:${insets.top}, B:${insets.bottom}`;
			}
		}
	}
</script>

<style>
	.info-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		padding: 24rpx;
		margin-bottom: 20rpx;
	}

	.card-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #114598;
		margin-bottom: 20rpx;
		display: block;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.info-row:last-child {
		border-bottom: none;
	}

	.info-label {
		font-size: 28rpx;
		color: #666;
		flex-shrink: 0;
		margin-right: 20rpx;
	}

	.info-value {
		font-size: 26rpx;
		color: #333;
		font-weight: 500;
		word-break: break-all;
		text-align: right;
	}
</style>