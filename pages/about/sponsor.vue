<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<!-- headers begin -->
		<view class="ux-bg-primary" style="height:  var(--status-bar-height);">&nbsp;</view>

		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">赞助我们</text>
		</view>
		<!-- headers end -->
		<!-- Main content -->
		<view class="ux-padding">
			<text class="ux-text-center ux-bold">
				软件的运营需要消耗较多资金，如果您有能力，欢迎赞助我们以补贴运营费用！亦或支持一下我们的周边~
			</text><br><br>
			<image src="/static/wx.png" mode="aspectFit"></image><br><br>
			<text>纪念车票文创：ts.railgo.dev<br>文创店：shop.railgo.dev<br>赞助平台：zz.railgo.dev（此平台赞助会被添加进鸣谢)</text>
		</view>

	</view>
</template>

<script>
	uni.setStorage({
		"key": "Funnyegg",
		"data": true
	})
	export default {
		methods: {
			back: function() {
				uni.navigateBack()
			}
		}
	}
</script>

<style>

</style>
