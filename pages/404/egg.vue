<template>
	<view class="easter-egg-page">
		<view class="firework-stage">
			<view v-for="f in fireworks" :key="f.id" 
				class="firework-bundle" 
				:style="{ left: f.x + 'px', top: f.y + 'px' }">
				
				<view v-for="n in 36" :key="n" 
					class="spark-rotation" 
					:style="{ transform: 'rotate(' + (n * 10) + 'deg)' }">
					<view class="spark-line" :style="{ '--color': f.color, '--delay': (Math.random() * 0.4) + 's' }"></view>
				</view>
				
			</view>
		</view>

		<view class="content-box">
			<view class="typewriter">
				<view v-for="(line, index) in displayLines" :key="index" class="text-line">
					{{ line }}
				</view>
				<text v-if="isTyping" class="cursor">|</text>
			</view>
		</view>

		<view class="footer-action" :class="{ 'fade-in': showBtn }">
			<button class="back-btn" @click="goBack">返回旅途</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				count: 0,
				displayLines: [],
				isTyping: false,
				showBtn: false,
				fireworks: [],
				colors: ['#FF1493', '#00BFFF', '#ADFF2F', '#FFD700', '#FF4500', '#FFFFFF', '#00FFFF']
			}
		},
		onLoad() {
			this.count = uni.getStorageSync('search') || 0;
			this.startTyping();
			this.loopFirework();
		},
		methods: {
			loopFirework() {
				const sys = uni.getSystemInfoSync();
				const add = () => {
					const newFirework = {
						id: Date.now() + Math.random(),
						x: Math.random() * (sys.windowWidth - 100) + 50,
						y: Math.random() * (sys.windowHeight * 0.4) + 100,
						color: this.colors[Math.floor(Math.random() * this.colors.length)]
					};
					this.fireworks.push(newFirework);
					if (this.fireworks.length > 4) this.fireworks.shift();
				};
				add();
				setInterval(add, 1500);
			},
			async startTyping() {
				const fullText = [
					"Hi there！",
					"很高兴你来到了这里，与铁路行相伴",
					`你总共用铁路行查询了 ${this.count} 次`,
					"新的一年，还希望有你的陪伴！",
					"愿每一程山河，都如你所愿",
					"哪怕轨道再长，也有星光为你引路",
					"红包封面口令：星光不负赶路人 / 时光不负有心人"
				];
				this.isTyping = true;
				for (let i = 0; i < fullText.length; i++) {
					this.$set(this.displayLines, i, "");
					let currentLine = "";
					for (let char of fullText[i]) {
						currentLine += char;
						this.$set(this.displayLines, i, currentLine);
						await new Promise(r => setTimeout(r, 150));
					}
					await new Promise(r => setTimeout(r, 600));
				}
				this.isTyping = false;
				this.showBtn = true;
			},
			goBack() {
				uni.navigateTo({
					url: "/pages/index/index"
				})
			}
		}
	}
</script>

<style scoped>
	.easter-egg-page {
		background-color: #000;
		min-height: 100vh;
		width: 100vw;
		overflow: hidden;
		position: relative;
	}

	.firework-stage {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	.firework-bundle {
		position: absolute;
		width: 2rpx;
		height: 2rpx;
	}

	/* 旋转层：只负责角度 */
	.spark-rotation {
		position: absolute;
		top: 0;
		left: 0;
		width: 20rpx;
		height: 20rpx;
	}

	/* 动画层：负责冲出去和变颜色 */
	.spark-line {
		position: absolute;
		width: 6rpx;
		height: 20rpx; /* 长条状火花，更有动感 */
		border-radius: 10rpx;
		background: linear-gradient(to top, var(--color), #fff);
		box-shadow: 0 0 20rpx var(--color);
		opacity: 0;
		/* 使用 ease-out 产生瞬间爆发感 */
		animation: explode-animation 1.5s ease-out infinite;
		animation-delay: var(--delay);
	}

	@keyframes explode-animation {
		0% {
			transform: translateY(0) scaleY(1);
			opacity: 1;
		}
		40% {
			opacity: 1;
		}
		100% {
			/* 强制产生大幅度位移 */
			transform: translateY(-250rpx) scaleY(0.5);
			opacity: 0;
		}
	}

	.content-box {
		position: relative;
		z-index: 10;
		padding: 100rpx 60rpx;
		height: 85vh;
		display: flex;
		align-items: center;
		pointer-events: none;
	}

	.text-line {
		color: #ffffff;
		font-size: 34rpx;
		line-height: 2.2;
		min-height: 70rpx;
		text-shadow: 0 0 15rpx rgba(255, 255, 255, 0.7);
		font-weight: bold;
	}

	.cursor {
		color: #114598;
		font-weight: bold;
		animation: blink 0.8s infinite;
		margin-left: 10rpx;
	}

	@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

	.footer-action {
		position: absolute;
		bottom: 100rpx;
		width: 100%;
		z-index: 20;
		text-align: center;
		opacity: 0;
		transition: opacity 1.5s;
	}
	.fade-in { opacity: 1; }
	.back-btn {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 50rpx;
		width: 260rpx;
		font-size: 26rpx;
	}
</style>