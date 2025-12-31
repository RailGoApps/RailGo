<template>
	<view class="ux-bg-grey5" style="min-height: 100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">更新日志</text>
		</view>
		
		<view class="ux-padding">
			<view class="ux-bg-white ux-border-radius-large ux-padding">
				<view class="ux-flex ux-align-items-center">
					<image class="ux-box-shadow ux-border-radius-large" 
						:src="logoSrc"
						style="width: 100rpx; height: 100rpx;">
					</image>
					<view class="ux-pl">
						<text class="ux-bold ux-h4">RailGo</text>
						<br>
						<text style="font-size: 12px; color: grey;">版本 {{version}}</text>
					</view>
				</view>
			</view>
			
			<view class="ux-mt">
				<view v-for="(log, index) in updateLogs" :key="index" class="ux-mb-small">
					<view class="ux-bg-white ux-border-radius-large ux-padding">
						<view class="ux-flex ux-space-between ux-align-items-center ux-mb-small">
							<text class="ux-bold" style="color: #114598; font-size: 32rpx;">{{ log.version }}</text>
							<text style="font-size: 24rpx; color: #888;">{{ log.date }}</text>
						</view>
						<view v-for="(item, idx) in log.items" :key="idx" class="ux-flex ux-mb-small">
							<text style="color: #114598; margin-right: 10rpx;">•</text>
							<text style="font-size: 28rpx;">{{ item }}</text>
						</view>
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
				version: uni.getStorageSync("versionText"),
				nowIcon: uni.getStorageSync("nowIcon") || 'crh',
				updateLogs: [
					{
						version: "v1.0.7.1",
						date: "2025-12-23",
						items: [
							"Feature：站到站查询新增复兴号、智能动车组徽章显示，以及显示车型"
						]
					},
					{
						version: "v1.0.7",
						date: "2025-12-21",
						items: [
							"Feature：新增座位图显示功能"
						]
					},
					{
						version: "v1.0.6",
						date: "2025-12-03",
						items: [
							"Feature：车站查询新增车站周边交通信息"
						]
					}
				]
			}
		},
		computed: {
			logoSrc() {
				return `/static/icons/rg-${this.nowIcon}.png`;
			}
		},
		onShow() {
			// #ifdef APP
			plus.navigator.setStatusBarBackground('#114598');
			// #endif
		},
		methods: {
			back: function() {
				uni.navigateBack();
			}
		}
	}
</script>

<style>
</style>
