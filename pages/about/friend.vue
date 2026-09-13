<template>
	<view class="ux-bg-grey5" style="min-height: 100vh;">
		<back-header></back-header>

		<view class="ux-padding" style="padding-top: 0px;">
			<text class="ux-h2">伙伴应用</text>
		</view>

		<view class="ux-pl ux-pr ux-pb">
			<view class="friend-card ux-bg-white ux-border-radius-large ux-flex ux-align-items-center"
				v-for="(app, index) in partnerApps" :key="index"
				@click="openUrl(app.url)" hover-class="ux-tap">
				<image :src="app.logo" mode="aspectFill" class="friend-logo"></image>
				<view class="friend-info">
					<text class="friend-name">{{ app.name }}</text>
					<text class="friend-desc">{{ app.desc }}</text>
				</view>
				<text class="icon ux-color-grey1" style="font-size: 32rpx;">&#xe5c8;</text>
			</view>

			<view v-if="partnerApps.length === 0" class="ux-padding ux-text-center">
				<text class="ux-color-grey2 ux-text-small">暂无伙伴应用</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				partnerApps: [
					{
						name: 'RailLog 轨记',
						desc: '一款个人行程记录与可视化应用',
						logo: '/static/friend/raillog.png',
						url: 'https://www.raillog.top/'
					},
					{
						name: 'RailTrack',
						desc: '视觉效果最好的火车记录App',
						logo: '/static/friend/railtrack.png',
						url: 'https://railtrack.top/'
					}
				]
			};
		},
		methods: {
			openUrl(url) {
				if (!url) return;
				uni.openURL(url);
			}
		}
	};
</script>

<style>
	.friend-card {
		padding: 24rpx;
		margin-bottom: 16rpx;
	}

	.friend-logo {
		width: 100rpx;
		height: 100rpx;
		border-radius: 16rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
		background-color: #f0f0f0;
	}

	.friend-info {
		flex: 1;
		min-width: 0;
	}

	.friend-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 6rpx;
	}

	.friend-desc {
		font-size: 24rpx;
		color: #999;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
