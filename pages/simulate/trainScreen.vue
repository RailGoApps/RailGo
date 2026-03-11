<template>
	<view class="ux-bg-grey5" style="min-height: 100vh;">
		<!-- 状态栏 -->
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<!-- 头部 -->
		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">列车信息屏</text>
		</view>

		<!-- 主内容区域 -->
		<view class="ux-padding">
			<!-- 列车屏幕预览卡片 (点击全屏) -->
			<view class="train-screen-container" @click="openFullScreen">
				<view class="train-screen-bg"></view>
				<view class="train-screen-content">
					<!-- 第一行：车厢号 + 跑马灯文字 + 实时时间 -->
					<view class="train-screen-top">
						<view class="train-car-number">{{ screen.carNumber }}</view>
						<view class="train-top-text-wrapper">
							<view class="train-top-text" :key="screen.topText">{{ screen.topText }}</view>
						</view>
						<view class="train-time">{{ currentTime }}</view>
					</view>
					
					<!-- 分割线 -->
					<view class="train-screen-divider"></view>
					
					<!-- 第二行：温度 + 图标 -->
					<view class="train-screen-bottom">
						<view class="train-temp">
							<view v-html="screen.inTempText"></view>
							<view v-html="screen.outTempText"></view>
						</view>
						<view class="train-icons">
							<view>🚻</view>
							<view class="no-smoking">🚭</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 设置卡片 -->
			<view class="ux-bg-white ux-border-radius-large ux-padding ux-mb-small">
				<view class="ux-flex ux-align-items-center ux-mb-small">
					<text class="icon ux-color-primary" style="font-size: 40rpx;">&#xe8b6;</text>
					<text class="ux-h4 ux-bold ux-ml-small">基础信息</text>
				</view>
				
				<!-- 车厢号 -->
				<view class="setting-item">
					<text class="setting-label">车厢号</text>
					<view class="setting-value">
						<input 
							type="number" 
							:value="settings.carNumber" 
							@input="e => updateSetting('carNumber', e.detail.value)"
							placeholder="例: 5"
							confirm-type="done"
						/>
					</view>
				</view>
				
				<!-- 中文顶部文字 -->
				<view class="setting-item">
					<text class="setting-label">中文顶部文字</text>
					<view class="setting-value">
						<input 
							type="text" 
							:value="settings.topTextCN" 
							@input="e => updateSetting('topTextCN', e.detail.value)"
							placeholder="感谢您乘坐“复兴号”"
							confirm-type="done"
						/>
					</view>
				</view>
				
				<!-- 英文顶部文字 -->
				<view class="setting-item">
					<text class="setting-label">英文顶部文字</text>
					<view class="setting-value">
						<input 
							type="text" 
							:value="settings.topTextEN" 
							@input="e => updateSetting('topTextEN', e.detail.value)"
							placeholder="Thank you for taking the train"
							confirm-type="done"
						/>
					</view>
				</view>
			</view>
			
			<!-- 温度信息卡片 -->
			<view class="ux-bg-white ux-border-radius-large ux-padding ux-mb-small">
				<view class="ux-flex ux-align-items-center ux-mb-small">
					<text class="icon ux-color-primary" style="font-size: 40rpx;">&#xe55e;</text>
					<text class="ux-h4 ux-bold ux-ml-small">温度信息</text>
				</view>
				
				<!-- 内温 -->
				<view class="setting-item">
					<text class="setting-label">内温 (°C)</text>
					<view class="setting-value">
						<input 
							type="number" 
							:value="settings.inTemp" 
							@input="e => updateSetting('inTemp', e.detail.value)"
							placeholder="22"
							confirm-type="done"
						/>
					</view>
				</view>
				
				<!-- 外温 -->
				<view class="setting-item">
					<text class="setting-label">外温 (°C)</text>
					<view class="setting-value">
						<input 
							type="number" 
							:value="settings.outTemp" 
							@input="e => updateSetting('outTemp', e.detail.value)"
							placeholder="10"
							confirm-type="done"
						/>
					</view>
				</view>
			</view>
			
			<!-- 语言切换 - 简单列表 -->
			<view class="ux-bg-white ux-border-radius-large ux-padding ux-mb-small">
				<view class="nav-item" @click="switchToCN">
					<view class="nav-left">
						<text style="margin-right: 20rpx;">🇨🇳</text>
						<text class="ux-text-small">中文显示</text>
					</view>
					<view class="nav-right">
						<view class="radio-dot" :class="{ active: isChinese }"></view>
					</view>
				</view>
				
				<view class="nav-item" @click="switchToEN" style="border-top: 2rpx solid #f0f0f0;">
					<view class="nav-left">
						<text style="margin-right: 20rpx;">🇬🇧</text>
						<text class="ux-text-small">English</text>
					</view>
					<view class="nav-right">
						<view class="radio-dot" :class="{ active: !isChinese }"></view>
					</view>
				</view>
			</view>
			
			<!-- 普通按钮 -->
			<button @click="updateScreen">应用设置</button>
			
			<!-- 底部提示 -->
			<view style="margin-top: 40rpx; text-align: center;">
				<text class="ux-color-grey2" style="font-size: 22rpx;">点击屏幕可全屏旋转显示</text>
			</view>
		</view>
		
		<!-- 全屏旋转层 - 无返回区域 -->
		<view v-if="fullscreenVisible" class="fullscreen-train" @click="closeFullTrain">
			<view class="train-screen-content">
				<!-- 第一行：车厢号 + 跑马灯文字 + 实时时间 -->
				<view class="train-screen-top">
					<view class="train-car-number">{{ screen.carNumber }}</view>
					<view class="train-top-text-wrapper">
						<view class="train-top-text" :key="screen.topText">{{ screen.topText }}</view>
					</view>
					<view class="train-time">{{ currentTime }}</view>
				</view>
				
				<!-- 分割线 -->
				<view class="train-screen-divider"></view>
				
				<!-- 第二行：温度 + 图标 -->
				<view class="train-screen-bottom">
					<view class="train-temp">
						<view v-html="screen.inTempText"></view>
						<view v-html="screen.outTempText"></view>
					</view>
					<view class="train-icons">
						<view>🚻</view>
						<view class="no-smoking">🚭</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 屏幕当前显示数据
			screen: {
				carNumber: '1',
				topText: '感谢您乘坐“复兴号”',
				inTempText: '内温 22 °C',
				outTempText: '外温 10 °C',
			},
			// 设置面板数据
			settings: {
				carNumber: '1',
				topTextCN: '感谢您乘坐“复兴号”',
				topTextEN: 'Thank you for taking the train',
				inTemp: '22',
				outTemp: '10',
			},
			// 当前语言
			isChinese: true,
			// 全屏可见
			fullscreenVisible: false,
			// 实时时间
			currentTime: '',
			// 定时器
			timer: null,
			// 窗口尺寸
			windowWidth: 0,
			windowHeight: 0,
		};
	},
	onLoad() {
		// #ifdef APP-PLUS
		plus.navigator.setStatusBarBackground('#114598');
		// #endif
		
		// 获取窗口尺寸
		const sys = uni.getSystemInfoSync();
		this.windowWidth = sys.windowWidth;
		this.windowHeight = sys.windowHeight;
		
		// 初始化时间
		this.updateTime();
		this.startTimer();
		
		// 初始化屏幕
		this.updateScreen();
	},
	onUnload() {
		this.stopTimer();
	},
	methods: {
		back() {
			uni.navigateBack();
		},
		
		// 时间相关
		updateTime() {
			const now = new Date();
			const hours = String(now.getHours()).padStart(2, '0');
			const minutes = String(now.getMinutes()).padStart(2, '0');
			this.currentTime = `${hours}:${minutes}`;
		},
		startTimer() {
			this.timer = setInterval(() => {
				this.updateTime();
			}, 1000);
		},
		stopTimer() {
			if (this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}
		},
		
		// 更新设置项
		updateSetting(key, value) {
			this.settings[key] = value;
		},
		
		// 应用设置到屏幕
		updateScreen() {
			const s = this.settings;
			
			// 更新屏幕数据
			this.screen.carNumber = String(s.carNumber || '1');
			this.screen.topText = this.isChinese ? (s.topTextCN || '感谢您乘坐“复兴号”') : (s.topTextEN || 'Thank you for taking the train');
			
			const inTemp = Number(s.inTemp) || 22;
			const outTemp = Number(s.outTemp) || 10;
			
			if (this.isChinese) {
				this.screen.inTempText = `内温 ${inTemp} °C`;
				this.screen.outTempText = `外温 ${outTemp} °C`;
			} else {
				this.screen.inTempText = `IN ${inTemp} °C`;
				this.screen.outTempText = `OUT ${outTemp} °C`;
			}
			
			uni.showToast({
				title: '屏幕已更新',
				icon: 'none',
				duration: 1000
			});
		},
		
		// 切换到中文
		switchToCN() {
			this.isChinese = true;
			this.updateScreen();
		},
		
		// 切换到英文
		switchToEN() {
			this.isChinese = false;
			this.updateScreen();
		},
		
		// 打开全屏旋转
		openFullScreen() {
			this.fullscreenVisible = true;
			
			this.$nextTick(() => {
				const query = uni.createSelectorQuery().in(this);
				query.select('.fullscreen-train').boundingClientRect(data => {
					if (!data) return;
					
					// 直接操作DOM设置样式
					const fullTrain = document.querySelector('.fullscreen-train');
					if (fullTrain) {
						const winW = this.windowWidth;
						const winH = this.windowHeight;
						
						fullTrain.style.transform = 'rotate(90deg)';
						fullTrain.style.width = winH + 'px';
						fullTrain.style.height = winW + 'px';
						fullTrain.style.left = -(winH - winW) / 2 + 'px';
						fullTrain.style.top = (winH - winW) / 2 + 'px';
						fullTrain.style.display = 'flex';
					}
				}).exec();
			});
		},
		
		// 关闭全屏
		closeFullTrain() {
			this.fullscreenVisible = false;
		}
	},
	watch: {
		// 监听语言变化自动更新
		isChinese() {
			this.updateScreen();
		}
	}
}
</script>

<style scoped>
/* 基础样式 - 复用原项目样式 */
.ux-bg-grey5 { background-color: #f5f5f5; }
.ux-bg-primary { background-color: #114598; }
.ux-bg-white { background-color: #ffffff; }
.ux-border-radius-large { border-radius: 24rpx; }
.ux-padding { padding: 30rpx; }
.ux-mb-small { margin-bottom: 20rpx; }
.ux-ml-small { margin-left: 20rpx; }
.ux-flex { display: flex; }
.ux-align-items-center { align-items: center; }
.ux-h2 { font-size: 40rpx; font-weight: bold; color: #333; }
.ux-h4 { font-size: 32rpx; }
.ux-text-small { font-size: 28rpx; color: #666; }
.ux-color-grey2 { color: #ccc; }
.ux-color-primary { color: #114598; }
.ux-bold { font-weight: bold; }

/* 设置项样式 */
.setting-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 2rpx solid #f0f0f0;
}
.setting-item:last-child {
	border-bottom: none;
}
.setting-label {
	font-size: 28rpx;
	color: #333;
}
.setting-value input {
	text-align: right;
	font-size: 28rpx;
	color: #666;
	padding: 0;
	min-width: 200rpx;
}

/* 导航项样式 */
.nav-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 0;
}
.nav-left {
	display: flex;
	align-items: center;
}

/* 单选点样式 */
.radio-dot {
	width: 32rpx;
	height: 32rpx;
	border-radius: 16rpx;
	border: 2rpx solid #ddd;
	background-color: #fff;
}
.radio-dot.active {
	background-color: #114598;
	border-color: #114598;
}

/* ===== 原始列车屏幕样式 ===== */
.train-screen-container {
	background: #000;
	border-radius: 16px;
	padding: 30px 20px;
	margin-bottom: 20px;
	border: 4px solid #333;
	position: relative;
	overflow: hidden;
	cursor: pointer;
}
.train-screen-bg {
	position: absolute;
	top:0; left:0; right:0; bottom:0;
	background: linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.05) 50%, transparent 100%);
	animation: scanline 3s linear infinite;
}
@keyframes scanline {
	0% { transform: translateX(-100%); }
	100% { transform: translateX(100%); }
}
.train-screen-content {
	position: relative;
	z-index: 2;
	display: flex;
	flex-direction: column;
	color: #00ffff;
	font-family: "PingFang SC","Microsoft YaHei",sans-serif;
	text-shadow: 0 0 10px rgba(0,255,255,0.8);
}
.train-screen-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}
.train-car-number {
	font-size: 120px;
	font-weight: bold;
	line-height: 1;
}
.train-top-text-wrapper {
	flex: 1;
	overflow: hidden;
	margin: 0 20px;
}
.train-top-text {
	font-size: 48px;
	font-weight: 50;
	white-space: nowrap;
	animation: trainMarquee 15s linear infinite;
}
@keyframes trainMarquee {
	0% { transform: translateX(100%); }
	100% { transform: translateX(-100%); }
}
.train-time {
	font-size: 60px;
	font-weight: bold;
}
.train-screen-divider {
	height:4px;
	background: linear-gradient(90deg, transparent, #00ffff, transparent);
	margin-bottom:20px;
}
.train-screen-bottom {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 80px;
}
.train-temp {
	display: flex;
	gap: 60px;
	font-size: 32px;
}
.train-icons {
	display: flex;
	gap: 20px;
	font-size: 48px;
}
.no-smoking {
	color: #ff0000;
	text-shadow: 0 0 10px rgba(255,0,0,0.8);
}

/* 全屏样式 - 无返回区域 */
.fullscreen-train {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: #000;
	z-index: 9999;
	display: none;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.fullscreen-train .train-screen-content {
	width: 100%;
	height: auto;
	padding: 0 5%;
}

.fullscreen-train .train-car-number {
	font-size: 120px !important;
}

.fullscreen-train .train-top-text {
	font-size: 40px;
}

.fullscreen-train .train-time {
	font-size: 50px;
	text-align: right;
}

.fullscreen-train .train-screen-divider {
	width: 93%;
	margin: 22px auto;
}

.fullscreen-train .train-temp {
	font-size: 34px;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	gap: 60px;
}

.fullscreen-train .train-temp span {
	white-space: nowrap;
}

.fullscreen-train .train-icons {
	font-size: 36px;
	display: flex;
	gap: 20px;
	justify-content: flex-end;
}

.fullscreen-train .train-screen-bottom {
	position: relative;
	display: flex;
	justify-content: flex-end;
	margin-top: 16px;
}
</style>