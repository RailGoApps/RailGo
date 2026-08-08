<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<back-header></back-header>
		<view class="ux-pl ux-pr ux-pt ux-pb-none" style="padding-top: 0px;"> 
			<text class="ux-h2">动车组综合查询</text>
		</view>
		
		<view class="ux-pl ux-pr ux-pb" style="margin-top: 20rpx;"> 
			
			<view style="margin-top: 15rpx;">
				<text class="ux-h6 ux-mt-medium">关键字</text>
				<view class="ux-bg-white ux-border-radius-small">
					<input 
						type="text" 
						class="ux-form-input ux-padding-small" 
						placeholder="G1202、CR400BF 或 5033"
						:value="keyword"
						@input="inputData" 
					/>
				</view>
			</view>
			
			<button type="primary" style="background-color:#114598;color:#ffffff;margin-top: 40rpx;" hover-class="ux-tap"
				@click="jumpToResult()">查询</button>
			<br>
			
			<view class="ux-padding-small ux-mb ux-h6 ux-text-center info-box">
				<text>本功能支持车组/车型配属信息、担当查询<br>支持重联车组合并展示<br></text>
				<text class="ux-bold">信息仅供参考，请以铁路运营企业实际运用为准</text><br>
			</view>

			<br>
			<view class="ux-flex ux-row ux-justify-content-center">
				<text class="ux-text-small ux-opacity-4">—— 数据来源: crh.lihugang.top & RailGo ——</text>
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
			plus.navigator.setStatusBarBackground('#114598'); 
			// #endif
		},
		methods: {
			back: function() {
				uni.navigateBack()
			},
			jumpToResult: function() {
				if (this.keyword.trim() == "") {
					uni.showToast({
						icon: "none",
						title: "不允许输入空值"
					});
					return;
				}
				// 检查离线模式
				if (uni.getStorageSync("ol")) {
					uni.showToast({
						icon: "none",
						title: "仅离线模式无法使用该功能" 
					});
					return;
				}

				
				let url = "";	
				
				url = "/pages/emu/result?keyword=" + this.keyword;
				
				uni.navigateTo({
					url: url
				});
			},
			inputData: function(e) {
				this.keyword = e.detail.value.toUpperCase();
			},
		}
	}
</script>

<style scoped>
.info-box {
	background-color:#e9eef5;
	border:1px solid #114598;
	border-radius:10rpx;
	color:#114598;
	line-height: 1.6;
}
</style>