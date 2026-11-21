<template>
	<view class="overflow-marquee">
		<view class="marquee-track" :class="{ 'marquee-moving': distance > 0 }" :style="{ '--marquee-offset': '-' + distance + 'px', animationDuration: duration + 's' }">
			<text class="marquee-text">{{ text }}</text>
		</view>
	</view>
</template>

<script>
export default {
	props: { text: { type: [String, Number], default: '' } },
	data() { return { distance: 0, duration: 6 }; },
	watch: { text() { this.$nextTick(this.measure); } },
	mounted() {
		this.$nextTick(this.measure);
		uni.onWindowResize(this.measure);
	},
	beforeUnmount() { uni.offWindowResize(this.measure); },
	methods: {
		measure() {
			uni.createSelectorQuery().in(this).select('.overflow-marquee').boundingClientRect().select('.marquee-text').boundingClientRect().exec(rects => {
				if (!rects[0] || !rects[1]) return;
				this.distance = Math.max(0, Math.ceil(rects[1].width - rects[0].width));
				this.duration = Math.max(6, this.distance / 24 + 4);
			});
		}
	}
};
</script>

<style scoped>
.overflow-marquee { display: block; width: 100%; min-width: 0; overflow: hidden; line-height: inherit; }
.marquee-track { width: 100%; text-align: center; }
.marquee-text { display: inline-block; white-space: nowrap; font: inherit; color: inherit; }
.marquee-moving { text-align: left; animation: marquee-pan linear infinite alternate; }
@keyframes marquee-pan {
	0%, 20% { transform: translateX(0); }
	80%, 100% { transform: translateX(var(--marquee-offset)); }
}
@media (prefers-reduced-motion: reduce) { .marquee-moving { animation: none; } }
</style>
