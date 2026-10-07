<template>
	<view :class="indexStyle === 'bento' ? 'status-bar bento-status' : 'ux-bg-primary status-bar'">&nbsp;</view>

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

	<view :class="indexStyle === 'bento' ? 'page-bento' : 'ux-padding ux-bg-grey5'" style="min-height: 100vh;">
		<!-- 渐变卡片风格：全屏斜切渐变头部（logo 与设置入口并入渐变区） -->
		<view v-if="indexStyle === 'bento'" class="bento-header">
			<view class="bento-header-grad"></view>
			<view class="bento-header-glow"></view>
			<view class="bento-header-pulse"></view>
			<view class="bento-nav">
				<view class="bento-brand">
					<image class="bento-brand-logo" src="/static/index-logo.svg" mode="widthFix"></image>
					<text class="bento-brand-name">RailGo</text>
				</view>
				<navigator class="bento-setting" url="/pages/about/about" hover-class="ux-tap">
					<text class="icon">&#xe5d4;</text>
				</navigator>
			</view>
			<!-- 斜向柔和淡出（边缘像水面轻微起伏） -->
			<view class="bento-fade bento-fade--back"></view>
			<view class="bento-fade"></view>
		</view>
		<!-- 其他风格：原页头 -->
		<view v-else class="ux-flex ux-space-between ux-align-items-center">
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

		<!-- 风格：经典大卡 -->
		<view v-if="indexStyle === 'card'" class="ux-mt-small">
			<view v-for="(pair, pi) in featurePairs" :key="pi" class="ux-flex ux-rows ux-wrap ux-space-between"
				:style="pi > 0 ? 'margin-top: 24rpx;' : ''">
				<navigator v-for="(f, fi) in pair" :key="f.url"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding"
					:class="fi % 2 === 0 ? 'ux-mr-small' : 'ux-ml-small'"
					style="flex:auto;width:1rpx;" hover-class="ux-tap" :url="f.url">
					<text class="icon section-icon" :class="f.colorClass">{{ f.icon }}</text>
					<br>
					<text class="ux-text">{{ f.name }}</text>
					<br>
					<text class="ux-text-small ux-opacity-8">{{ f.desc }}。</text>
					<br><br>
					<view class="ux-text-right ux-mr-small">
						<text class="icon">&#xe5c8;</text>
					</view>
				</navigator>
			</view>
		</view>

		<!-- 风格：渐变卡片（全屏白底：核心大卡 + 工具小宫格） -->
		<view v-else-if="indexStyle === 'bento'" class="bento-body">
			<!-- 核心功能大卡：车次+车站一行，动车组单独一行 -->
			<view class="bento-core-row">
				<navigator v-for="f in coreFeatures.slice(0, 2)" :key="f.url" class="bento-card" :url="f.url" hover-class="ux-tap">
					<text class="icon section-icon" :class="f.colorClass">{{ f.icon }}</text>
					<br>
					<text class="ux-text">{{ f.name }}</text>
					<br>
					<text class="ux-text-small ux-opacity-8">{{ f.desc }}。</text>
					<br><br>
					<view class="ux-text-right ux-mr-small">
						<text class="icon">&#xe5c8;</text>
					</view>
				</navigator>
			</view>
			<navigator class="bento-card bento-card--full" :url="coreFeatures[2].url" hover-class="ux-tap">
				<text class="icon section-icon" :class="coreFeatures[2].colorClass">{{ coreFeatures[2].icon }}</text>
				<br>
				<text class="ux-text">{{ coreFeatures[2].name }}</text>
				<br>
				<text class="ux-text-small ux-opacity-8">{{ coreFeatures[2].desc }}。</text>
				<br><br>
				<view class="ux-text-right ux-mr-small">
					<text class="icon">&#xe5c8;</text>
				</view>
			</navigator>

			<view class="bento-tools">
				<navigator v-for="t in toolFeatures" :key="t.url" class="bento-tool" :url="t.url" hover-class="ux-tap">
					<text class="icon bento-tool-icon" :class="t.colorClass">{{ t.icon }}</text>
					<text class="bento-tool-name">{{ t.name }}</text>
				</navigator>
			</view>
		</view>

		<!-- 风格：铁路线路图 -->
		<view v-else class="rail-line ux-mt-small">
			<!-- 贯穿全页的铁路线 -->
			<view class="rail-track"></view>

			<!-- 起点 -->
			<view class="rail-terminal">
				<view class="rail-terminal-dot"></view>
			</view>

			<!-- 功能车站：站名牌左右交错 -->
			<navigator v-for="(f, i) in features" :key="f.url" :url="f.url" hover-class="ux-tap"
				class="rail-row" :class="{ 'rail-row--right': i % 2 === 1 }">
				<view class="rail-card ux-bg-white ux-border-radius-large">
					<view class="rail-card-head">
						<text class="icon rail-card-icon" :class="f.colorClass">{{ f.icon }}</text>
						<text class="ux-text rail-card-title">{{ f.name }}</text>
					</view>
					<text class="ux-text-small ux-opacity-8 rail-card-desc">{{ f.desc }}</text>
				</view>
				<view class="rail-station">
					<view class="rail-station-dot" :style="{ background: f.dot }"></view>
				</view>
				<view class="rail-spacer"></view>
			</navigator>

			<!-- 终点 -->
			<view class="rail-terminal">
				<view class="rail-terminal-dot"></view>
			</view>
		</view>
		<br>
		<!-- 图片广告 -->
		<view :class="indexStyle === 'bento' ? 'bento-banner' : ''">
			<swiper v-if="bannerImages.length > 0" class="ux-border-radius-large" :style="{height: swiperHeight}" indicator-dots circular autoplay>
				<swiper-item v-for="(item, index) in bannerImages" :key="index">
					<image :src="item.img" mode="widthFix" class="ux-border-radius-large" style="width: 100%;" @load="onImageLoad" @click="openBannerLink(item.jump)"></image>
				</swiper-item>
			</swiper>
			<image v-else class="ux-border-radius-large" src="/static/overlay/index_banner_1.png" style="width:100%;" mode="widthFix"></image>
		</view>
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
				updateVersion: '',
				// 主页风格：rail(线路图) / card(经典大卡) / bento(渐变卡片)
				indexStyle: 'bento',
				// 每个功能入口的数据（key 用于风格布局分组）
				features: [
					{ key: 'train', name: '车次', desc: '查询时刻、开行日等信息', icon: '\ue192', colorClass: 'ux-color-purple', dot: '#9C27B0', url: '/pages/train/query' },
					{ key: 'station', name: '车站', desc: '查询通过车次、线路等信息', icon: '\ue88a', colorClass: 'ux-color-cyan1', dot: '#0097A7', url: '/pages/station/query' },
					{ key: 'speed', name: '实时测速', desc: '实时使用GPS进行速度测试', icon: '\ue55e', colorClass: 'ux-color-brown', dot: '#5D4037', url: '/pages/speed/speed' },
					{ key: 'route', name: '行程 (Beta)', desc: '帮您记录您的美好行程足迹', icon: '\ue1b7', colorClass: 'ux-color-cyan1', dot: '#0097A7', url: '/pages/route/route' },
					{ key: 'emu', name: '动车组', desc: '查询动车组配属和运行交路', icon: '\ue570', colorClass: 'ux-color-orange1', dot: '#FF6E40', url: '/pages/emu/query' },
					{ key: 'gallery', name: '列车图鉴', desc: '看见火车迷们拍摄的列车图片', icon: '\ue3b3', colorClass: 'ux-color-green6', dot: '#9CCC65', url: '/pages/gallery/query' }
				]
			};
		},
		computed: {
			// 经典大卡风格：每行两个功能入口
			featurePairs() {
				const pairs = [];
				for (let i = 0; i < this.features.length; i += 2) {
					pairs.push(this.features.slice(i, i + 2));
				}
				return pairs;
			},
			// 渐变卡片风格：核心功能（车次/车站/动车组）
			coreFeatures() {
				return this.features.filter(f => ['train', 'station', 'emu'].includes(f.key));
			},
			// 渐变卡片风格：次要工具（行程/测速/图鉴）；关于入口在右上角
			toolFeatures() {
				return this.features.filter(f => ['route', 'speed', 'gallery'].includes(f.key));
			},
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
			// 从个性化设置读取主页风格
			this.indexStyle = uni.getStorageSync('indexStyle') || 'bento';
			
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

	/* 铁路线路图布局 */
	.rail-line {
		position: relative;
		padding: 10rpx 0;
	}
	.rail-track {
		position: absolute;
		left: 50%;
		top: 0;
		bottom: 0;
		width: 8rpx;
		margin-left: -4rpx;
		background: #b9cee8;
		border-radius: 4rpx;
	}
	.rail-terminal {
		position: relative;
		z-index: 1;
		display: flex;
		justify-content: center;
		padding: 8rpx 0;
	}
	.rail-terminal-dot {
		width: 22rpx;
		height: 22rpx;
		border-radius: 50%;
		background: #114598;
		border: 4rpx solid #fff;
		box-shadow: 0 2rpx 8rpx rgba(17, 69, 152, 0.35);
	}
	.rail-row {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		margin: 24rpx 0;
	}
	.rail-row--right {
		flex-direction: row-reverse;
	}
	.rail-card {
		flex: 0 0 41%;
		padding: 22rpx 26rpx;
		box-shadow: 0 4rpx 18rpx rgba(17, 69, 152, 0.08);
	}
	.rail-card-head {
		display: flex;
		align-items: center;
		margin-bottom: 6rpx;
	}
	.rail-card-icon { font-size: 40rpx; margin-right: 12rpx; }
	.rail-card-title { font-weight: 600; }
	.rail-card-desc { display: block; line-height: 1.5; }
	.rail-station {
		flex: 0 0 18%;
		display: flex;
		justify-content: center;
	}
	.rail-station-dot {
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		border: 6rpx solid #fff;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.18);
	}
	.rail-spacer { flex: 1; }

	/* 渐变卡片风格（全屏、背景同其他页 ux-bg-grey5） */
	.page-bento { background: #EEEEEE; }
	.bento-header {
		position: relative;
		height: 300rpx;
		overflow: hidden;
	}
	/* 状态栏与渐变顶部同色系，视觉无缝 */
	.bento-status {
		background: linear-gradient(90deg, #114598 0%, #3f7ac4 55%, #a9cdf0 100%);
	}
	/* 柔焦渐变：以左上角为圆心的同心弧分层，最深 #114598，往右下逐层接近背景色 */
	.bento-header-grad {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background:
			linear-gradient(to bottom, rgba(238, 238, 238, 0) 45%, rgba(238, 238, 238, 0.6) 78%, #EEEEEE 100%),
			radial-gradient(130% 190% at 0% 0%,
				#114598 0%,
				#1d55ab 22%,
				#3f7ac4 42%,
				#79a9de 62%,
				#bcd7f3 80%,
				#dfe6ee 90%,
				#EEEEEE 100%);
	}
	/* 缓慢漂移的柔光 = 斜向光流 */
	.bento-header-glow {
		position: absolute;
		left: 45%;
		top: -40%;
		width: 70%;
		height: 110%;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(120, 210, 255, 0.35) 0%, rgba(120, 210, 255, 0) 70%);
		animation: bentoGlow 7s ease-in-out infinite alternate;
	}
	@keyframes bentoGlow {
		from { transform: translate(0, 0); }
		to { transform: translate(-30%, 20%); }
	}
	/* 左上微光呼吸：透明度+缩放的极缓慢变化，让渐变“活”起来 */
	.bento-header-pulse {
		position: absolute;
		left: -20%;
		top: -45%;
		width: 80%;
		height: 120%;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 70%);
		animation: bentoPulse 5s ease-in-out infinite alternate;
	}
	@keyframes bentoPulse {
		from { opacity: 0.15; transform: scale(0.92); }
		to { opacity: 1; transform: scale(1.28); }
	}
	.bento-nav {
		position: relative;
		z-index: 2;
		padding: 30rpx 30rpx 0;
	}
	/* 关于入口：右上角绝对定位，与品牌共用 66rpx 等高行盒保证垂直对齐 */
	.bento-setting {
		position: absolute;
		right: 30rpx;
		top: 50rpx;
		z-index: 3;
		height: 66rpx;
		padding: 0 10rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.bento-setting .icon { color: #ffffff; font-size: 40rpx; line-height: 1; }
	/* 品牌：白色 SVG logo + DIN 字体 RailGo，水平居中；与关于入口共用 66rpx 等高行盒 */
	.bento-brand {
		position: absolute;
		left: 50%;
		top: 50rpx;
		height: 66rpx;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
	}
	.bento-brand-logo { width: 66rpx; margin-right: 14rpx; }
	.bento-brand-name {
		font-family: "DIN1451";
		color: #ffffff;
		font-size: 36rpx;
		font-weight: 700;
		letter-spacing: 1rpx;
	}
	/* 斜向柔和淡出：两层不同角度叠加，边缘像水面轻微起伏 */
	.bento-fade {
		position: absolute;
		left: -20%;
		right: -20%;
		bottom: -2rpx;
		height: 44rpx;
		transform: rotate(-3deg);
		background: linear-gradient(to bottom, rgba(238, 238, 238, 0) 0%, rgba(238, 238, 238, 0.5) 50%, #EEEEEE 92%);
		animation: bentoFadeBob 4.5s ease-in-out infinite alternate;
	}
	.bento-fade--back {
		bottom: 8rpx;
		height: 64rpx;
		transform: rotate(-2deg);
		opacity: 0.35;
		animation: none;
	}
	@keyframes bentoFadeBob {
		from { transform: rotate(-3deg) translateY(0); }
		to { transform: rotate(-3deg) translateY(8rpx); }
	}
	/* 公告栏悬浮在渐变下缘 */
	.page-bento .notice {
		position: relative;
		z-index: 3;
		width: auto;
		margin: -160rpx 30rpx 0;
		background: rgba(255, 255, 255, 0.88);
		-webkit-backdrop-filter: blur(12px);
		backdrop-filter: blur(12px);
		box-shadow: 0 10rpx 36rpx rgba(17, 69, 152, 0.16);
	}
	.bento-body {
		position: relative;
		z-index: 2;
		padding: 20rpx 30rpx 10rpx;
	}
	/* 核心大卡：沿用旧版主页大卡样式（白卡 + 右下箭头） */
	.bento-card {
		padding: 30rpx;
		border-radius: 24rpx;
		background: rgba(255, 255, 255, 0.88);
		-webkit-backdrop-filter: blur(12px);
		backdrop-filter: blur(12px);
		border: 1rpx solid #eef1f5;
		box-shadow: 0 4rpx 16rpx rgba(17, 69, 152, 0.06);
	}
	.bento-core-row { display: flex; }
	.bento-core-row .bento-card {
		flex: 1;
		margin: 0 10rpx;
	}
	.bento-core-row .bento-card:first-child { margin-left: 0; }
	.bento-core-row .bento-card:last-child { margin-right: 0; }
	.bento-card--full { margin-top: 20rpx; }
	/* 更多工具：一行两张小卡，左 icon 右名称 */
	.bento-tools { display: flex; flex-wrap: wrap; padding: 30rpx 0 10rpx; }
	.bento-tool {
		width: calc(50% - 10rpx);
		margin: 0 20rpx 20rpx 0;
		display: flex;
		align-items: center;
		padding: 26rpx 24rpx;
		box-sizing: border-box;
		border-radius: 20rpx;
		background: rgba(255, 255, 255, 0.88);
		-webkit-backdrop-filter: blur(12px);
		backdrop-filter: blur(12px);
		border: 1rpx solid #eef1f5;
		box-shadow: 0 4rpx 16rpx rgba(17, 69, 152, 0.06);
	}
	.bento-tool:nth-child(even) { margin-right: 0; }
	/* 自动补全：奇数张时最后一张独卡占满整行 */
	.bento-tool:last-child:nth-child(odd) { width: 100%; margin-right: 0; }
	.bento-tool-icon {
		display: inline-block;
		vertical-align: middle;
		width: 48rpx;
		height: 48rpx;
		line-height: 48rpx;
		text-align: center;
		font-size: 44rpx;
		margin-right: 18rpx;
	}
	.bento-tool-name {
		display: inline-block;
		vertical-align: middle;
		color: #333;
		font-size: 26rpx;
		height: 48rpx;
		line-height: 48rpx;
	}
	.bento-banner { padding: 10rpx 30rpx 30rpx; }

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