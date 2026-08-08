<template>
	<view class="ux-bg-grey5" style="height:100vh;">
		<!-- headers begin -->
		<back-header></back-header>
		<view class="ux-padding" style="padding-top: 0px;">
			<text class="ux-h2">列车图鉴</text>
		</view>
		<!-- headers end -->
		<view class="ux-padding ux-bg-grey5">
			<text class="ux-h6">关键词</text>
			<view class="ux-bg-white ux-border-radius-small">
				<input type="text" class="ux-form-input ux-padding-small" placeholder="CR400BF"
					@input="inputData" />
			</view>
			<button type="primary" style="background-color:#114598;color:#ffffff;margin-top: 20rpx;" hover-class="ux-tap"
				@click="jumpToResult()">搜索</button>
			<br>
			<!-- <view class="ux-padding-small ux-mb ux-h6 ux-text-center"
				style="background-color:#e9eef5;border:1px solid #114598;border-radius:10rpx;color:#114598;">
				<text class="ux-bold">看见火车迷们拍摄的列车图片</text>
			</view>
			<br> -->
			<view class="ux-flex ux-row ux-justify-content-center">
				<text class="ux-text-small ux-opacity-4">—— 图库合作方: CT Photos ——</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				"keyword": ""
			}
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
			jumpToResult: function() {
				if (this.keyword == "") {
					uni.showToast({
						icon: "none",
						title: "不允许输入空值"
					});
					return;
				}
				uni.navigateTo({
					url: "/pages/gallery/result?keyword=" + this.keyword 
				});
			},
			inputData: function(e) {
				this.keyword = e.detail.value;
			},
		}
	}
</script>

<style>

</style>