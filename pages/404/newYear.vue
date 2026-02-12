<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back" class="back-icon-area">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">Error</text>
		</view>
		
		<view class="ux-padding content-area">
			<view class="ux-text-center"><br>
				<text class="ux-h0 ux-text-primary">404</text>
				<br>
				<text class="ux-h4 ux-bold" style="color: #B22222;">你来到了没有轨道的荒原\n但没关系，铁路行祝您新年快乐！</text>
				
				<br><br><br>
				
				<view class="poem-container">
					<text class="ux-h5 ux-text-grey7">
						“爆竹声中一岁除，
						春风送暖入屠苏。”
					</text>
					<br><br>
					<text class="ux-text-small ux-text-grey6">— 王安石《元日》</text>
				</view>
			</view>
			
			<br><br>
			<view class="video-placeholder"></view>
			<br>

			<button type="primary" style="background-color:#B22222;color:#ffffff;" hover-class="ux-tap"
				@click="back()">彩蛋</button>
			<br><br>
		</view>
		
		<web-view v-if="randomVideoUrl" :src="randomVideoUrl" class="video-webview" :style="videoStyle"></web-view>
	</view>
</template>

<script>
	// 定义常量用于计算 web-view 尺寸
	const ASPECT_RATIO = 9 / 16; // 16:9 比例
	
	export default {
		data() {
			return {
				videoUrls: [
					"//player.bilibili.com/player.html?isOutside=true&aid=393018479&bvid=BV1ad4y1V7wb&cid=971466390&p=1"
				],
				randomVideoUrl: "",
				videoStyle: {},
			}
		},
		onLoad() {
			this.selectRandomVideo();
			// 延迟计算，确保 DOM 渲染完成
			setTimeout(() => {
				this.calculateVideoPosition();
			}, 300);
		},
		onResize() {
			this.calculateVideoPosition();
		},
		methods: {
			selectRandomVideo() {
				const randomIndex = Math.floor(Math.random() * this.videoUrls.length);
				let selectedUrl = this.videoUrls[randomIndex];
				if (selectedUrl.startsWith("//")) {
					selectedUrl = "https:" + selectedUrl;
				}
				this.randomVideoUrl = selectedUrl;
			},
			
			/**
			 * 核心方法：计算 web-view 位置并执行 App 端原生修复
			 */
			calculateVideoPosition() {
				// 1. 获取占位符的位置和尺寸
				uni.createSelectorQuery().in(this).select('.video-placeholder').boundingClientRect(rect => {
					if (rect) {
						// 计算 web-view 的高度 (16:9 比例)
						const videoHeightPx = rect.width * ASPECT_RATIO;
						
						// 2. 更新 Vue 绑定的 style (适用于 H5/小程序，并作为 App 端备用)
						this.videoStyle = {
							top: `${rect.top}px`,
							left: `${rect.left}px`,
							width: `${rect.width}px`,
							height: `${videoHeightPx}px`,
						};
						
						// 3. **App 端修复：通过原生 API 强制定位**
						// #ifdef APP-PLUS
						// 使用 setTimeout 延迟执行，确保 web-view 组件已渲染
						setTimeout(() => {  
							// 获取当前页面的 web-view 原生容器
							let currentWebview = this.$scope.$getAppWebview(); 
							
							// 获取 web-view 的原生控件（通常是第一个子节点）
							let wv = currentWebview.children()[0];  
							
							if (wv) {
								console.log("App端修复：强制设置 web-view 样式以精确定位");  
								// 使用动态计算出的位置和尺寸来设置原生控件样式
								wv.setStyle({  
									// HBuilderX App 端的 setStyle 接受数值（px）
									top: rect.top, 
									left: rect.left, 
									width: rect.width, 
									height: videoHeightPx, 
								});  
							}
						}, 100); // 100ms 延迟确保组件挂载
						// #endif
					}
				}).exec();
			},
			
			back: function() {
				uni.reLaunch({
					url: '/pages/404/egg'
				});
			}
		}
	}
</script>

<style>
	/* 404 数字的特大样式 */
	.ux-h0 {
		font-size: 200rpx;
		font-weight: 900;
		line-height: 1.2;
	}
	
	/* 诗词容器样式 */
	.poem-container {
		margin: 20rpx auto;
		padding: 20rpx 40rpx;
		border-left: 5rpx solid #114598;
		width: max-content;
		text-align: left;
	}
	
	/* 返回图标区域，增加点击范围 */
	.back-icon-area {
		width: 60rpx;
		padding: 10rpx;
	}
	
	/* 确保粗体生效 */
	.ux-bold {
		font-weight: bold;
	}

	/* 视频占位符（用于定位 web-view） */
	.video-placeholder {
		/* 占位符宽度，用于计算 web-view 的实际尺寸和位置 */
		width: 90vw;
		max-width: 600rpx;
		margin-left: auto;
		margin-right: auto;
		/* 使用 padding-bottom hack 来确保占位符的高度是 16:9 比例 */
		padding-bottom: calc(90vw * 0.5625);
		max-height: 337.5rpx; /* 最大高度 */
	}

	/* web-view 组件：设置为 fixed 定位，并由 JS 赋予精确的 top/left/width/height */
	.video-webview {
		position: fixed;
		/* z-index 设高，虽然 web-view 默认就高，但保留以防万一 */
		z-index: 999;
	}
	
	/* 确保主体内容区域可以滚动 */
	.content-area {
		/* 确保内容区域能撑开，并且可以滚动 */
		padding-bottom: 20rpx;
	}
</style>