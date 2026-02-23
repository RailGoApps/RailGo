<template>
	<view class="ux-bg-grey5" style="height:100vh;">
		<!-- headers begin -->
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>
		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">动车组配属查询</text>
		</view>
		<!-- headers end -->
		<view class="ux-padding ux-bg-grey5">
			<text class="ux-h6">车型/车号</text>
			<view class="ux-bg-white ux-border-radius-small">
				<input type="text" class="ux-form-input ux-padding-small" placeholder="CR400BF 或 5033"
					@input="inputData" />
			</view>
			<button type="primary" style="background-color:#114598;color:#ffffff;margin-top: 20rpx;" hover-class="ux-tap"
				@click="jumpToResult()">查询</button>
			<br>
			<view class="ux-padding-small ux-mb ux-h6 ux-text-center"
				style="background-color:#e9eef5;border:1px solid #114598;border-radius:10rpx;color:#114598;">
				<text>本功能支持查询动车组配属信息</text><br>
				<text class="ux-bold">信息仅供参考</text><br>
				<text class="ux-bold">仅离线模式不可用该功能</text>
			</view>
			<br>
			<view class="ux-flex ux-row ux-justify-content-center">
				<text class="ux-text-small ux-opacity-4">—— 数据来源: MoeFactory ——</text>
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
			plus.navigator.setStatusBarBackground('#eeeeee');
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
				if (uni.getStorageSync("ol")) {
					uni.showToast({
						icon: "none",
						title: "仅离线模式无法使用该功能"
					});
					return;
				}
				uni.navigateTo({
					url: "/pages/assignment/result?keyword=" + this.keyword 
				});
			},
			inputData: function(e) {
				this.keyword = e.detail.value;
			},
			futureData: function(e){
				this.future = e.detail.value;
			}
		}
	}
</script>

<style>

</style>