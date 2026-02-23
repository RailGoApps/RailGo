<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<!-- headers begin -->
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">车站查询</text>
		</view>
		<!-- headers end -->
		<view class="ux-padding ux-bg-grey5">
			<text class="ux-h6">选择车站</text>
			<navigator url="/pages/station/commonSelect?resultPlace=station_query_field">
				<view class="ux-bg-white ux-border-radius-small ux-padding-small ux-mt-small">
					<view class="ux-flex ux-space-between ux-align-items-center">
						<text>{{this.keyword}}</text>
						<text class="icon">&#xe5c8;</text>
					</view>
				</view>
			</navigator>
			<br>
			<!--
			<view>
				<switch class="ux-pb-small" color="#114598" style="transform:scale(0.7);margin-left:-1vh;" @change="vague"/>
				<text class="va">查询同城车站</text>
			</view>
			-->
			<button type="primary" style="background-color:#114598;color:#ffffff;" hover-class="ux-tap"
				@click="jumpToResult()">查询</button>
			<br>
			<view class="ux-text-center ux-padding-small ux-mb ux-h6"
				style="background-color:#e9eef5;border:1px solid #114598;border-radius:10rpx;color:#114598;">
				<text class="ux-bold">信息仅供参考 请以实际为准</text>
			</view>
			<br>
			<view class="ux-flex ux-row ux-justify-content-center">
				<text class="ux-text-small ux-opacity-4">—— 数据来源: RailGo.Parser ——</text>
			</view>
		</view>
		</view>
	
</template>

<script>
	export default {
		data() {
			return {
				"keyword": "",
				"callbackItem": {},
				"vagueData": false,
			}
		},
		onShow() {
			let selection = uni.getStorageSync("station_query_field");
			if(!selection){
				uni.setStorageSync("station_query_field", {name: "北京", telecode: "BJP"});
				this.keyword = "北京";
				this.callbackItem = {name: "北京", telecode: "BJP"};
			}
			this.keyword = selection.name;
			this.callbackItem = selection;
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
					})
				}
				uni.navigateTo({
					url: "/pages/station/result?keyword=" + String(this.callbackItem.telecode)
				})
			},
			vague: function(e) {
				this.vagueData = e.detail.value;
			}
		}
	}
</script>

<style>

</style>