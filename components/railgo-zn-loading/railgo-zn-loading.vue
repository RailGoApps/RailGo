<template>
	<view class="loading-container" v-if="visible">
		<view class="loading-mask"></view>
		<view class="loading-content">
			<canvas class="loading-canvas" canvas-id="loadingCanvas" style="width: 200rpx; height:200rpx;"></canvas>
		</view>
	</view>
</template>

<script>
	export default {
		name: "railgoZnLoading",
		props: {
			visible: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				canvasContext: null,
				animationId: null,
				canvasSize: uni.upx2px(200),
				rotations: [0, 0, 0]
			};
		},
		watch: {
			visible(newVal) {
				if (newVal) {
					this.$nextTick(() => {
						this.startAnimation();
					});
				} else {
					this.stopAnimation();
				}
			}
		},
		mounted() {
			if (this.visible) {
				this.$nextTick(() => {
					this.startAnimation();
				});
			}
		},
		beforeUnmount() {
			this.stopAnimation();
		},
		methods: {
			startAnimation() {
				if (!this.canvasContext) {
					// 组件内取画布必须带 this，否则多页面同名 canvas 会串
					this.canvasContext = uni.createCanvasContext('loadingCanvas', this);
				}
				if (!this.canvasContext) return;
				this.drawAnimationFrame();
			},
			stopAnimation() {
				if (this.animationId === null) return;
				if (typeof cancelAnimationFrame === 'function') {
					cancelAnimationFrame(this.animationId);
				} else {
					clearTimeout(this.animationId);
				}
				this.animationId = null;
			},
			nextFrame(cb) {
				if (typeof requestAnimationFrame === 'function') {
					this.animationId = requestAnimationFrame(cb);
				} else {
					this.animationId = setTimeout(cb, 16);
				}
			},
			drawAnimationFrame() {
				this.canvasContext.clearRect(0, 0, this.canvasSize, this.canvasSize);

				this.drawLoadingAnimation();
				this.canvasContext.draw();

				this.nextFrame(() => {
					this.drawAnimationFrame();
				});
			},

			drawLoadingAnimation() {
				// 画布固定 200rpx，圆心和半径都以画布自身尺寸为准，
				// 用 screenWidth 推算会让整组弧线偏离画布
				const size = this.canvasSize;
				const centerX = size / 2;
				const centerY = size / 2;
				const ratio = size / 400;

				const arcs = [{
						radius: 120 * ratio,
						startAngle: 0,
						endAngle: Math.PI * 1.3,
						rotationSpeed: 0.08
					}, // 内层
					{
						radius: 130 * ratio,
						startAngle: Math.PI * 0.1,
						endAngle: Math.PI * 1.4,
						rotationSpeed: 0.12
					}, // 中层
					{
						radius: 140 * ratio,
						startAngle: Math.PI * 0.2,
						endAngle: Math.PI * 1.5,
						rotationSpeed: 0.04
					} // 外层
				];

				this.canvasContext.strokeStyle = "#114598";
				this.canvasContext.lineWidth = 3 * ratio;

				this.canvasContext.drawImage("/static/logo.png", 100 * ratio, 100 * ratio, 200 * ratio, 200 * ratio);

				// 绘制每层圆弧
				arcs.forEach((arc, index) => {
					this.canvasContext.beginPath();

					// 应用旋转
					const currentRotation = this.rotations[index];

					// 绘制圆弧
					this.canvasContext.arc(
						centerX,
						centerY,
						arc.radius,
						arc.startAngle + currentRotation,
						arc.endAngle + currentRotation
					);

					this.canvasContext.stroke();
					this.rotations[index] += arc.rotationSpeed;
				});

				this.canvasContext.beginPath();
				this.canvasContext.lineWidth = 4 * ratio;
				this.canvasContext.arc(
					centerX,
					centerY,
					170 * ratio,
					0,
					2 * Math.PI
				);
				this.canvasContext.stroke();

				this.canvasContext.beginPath();
				this.canvasContext.lineWidth = 8 * ratio;
				this.canvasContext.arc(
					centerX,
					centerY,
					155 * ratio,
					0,
					2 * Math.PI
				);
				this.canvasContext.stroke();
			}
		}
	};
</script>

<style scoped>
	.loading-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 9999;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.loading-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.3);
	}

	.loading-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		z-index: 999999;
	}

	.loading-canvas {
		background-color: transparent;
	}
</style>
