<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<view class="ux-bg-primary" style="height:  var(--status-bar-height);">&nbsp;</view>

		<view class="ux-pl ux-pr ux-pt ux-pb-none"> 
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view><br>
			<text class="ux-h2">动车组查询</text>
		</view>
		
		<view class="ux-pl ux-pr ux-pb" style="margin-top: 20rpx;"> 
			
			<view class="ux-flex ux-justify-content-center">
				<uv-tabs 
					:list="tabList" 
					lineWidth="60" 
					lineColor="#114598" 
					:activeStyle="{
						color: '#303133',
						fontWeight: 'bold',
						transform: 'scale(1.05)'
			    	}" 
					:inactiveStyle="{
						color: '#606266',
						transform: 'scale(1)'
					}" 
					itemStyle="height: 34px;padding-left:30px;padding-right:30px;" 
					class="ux-mt-none" @click="tabChange">
				</uv-tabs>
			</view>
			
			<view v-if="selectIndex === 0" style="margin-top: 15rpx;">
				<text class="ux-h6 ux-mt-medium">车次/车组号</text>
				<view class="ux-bg-white ux-border-radius-small">
					<input type="text" class="ux-form-input ux-padding-small" placeholder="G1202 或 CR400BF-5033"
						@input="inputData" />
				</view>
			</view>

			<view v-if="selectIndex === 1" style="margin-top: 15rpx;">
				<text class="ux-h6 ux-mt-medium">车型/车号</text>
				<view class="ux-bg-white ux-border-radius-small">
					<input type="text" class="ux-form-input ux-padding-small" placeholder="CR400BF 或 5033"
						@input="inputData" />
				</view>
			</view>
			
			<button type="primary" style="background-color:#114598;color:#ffffff;margin-top: 20rpx;" hover-class="ux-tap"
				@click="jumpToResult()">查询</button>
			<br>
			
			<view v-if="selectIndex === 0" class="ux-padding-small ux-mb ux-h6 ux-text-center info-box">
				<text>本功能支持车组模糊查询及未来车次查询功能<br>支持重连车组合并展示<br></text>
				<text class="ux-bold">信息仅供参考，请以铁路运营企业实际运用为准</text><br>
				<text class="ux-bold">仅离线模式不可用该功能</text>
			</view>
			<view v-if="selectIndex === 1" class="ux-padding-small ux-mb ux-h6 ux-text-center info-box">
				<text>本功能支持查询动车组配属信息</text><br>
				<text class="ux-bold">信息仅供参考</text><br>
				<text class="ux-bold">仅离线模式不可用该功能</text>
			</view>

			<br>
			<view class="ux-flex ux-row ux-justify-content-center">
				<text class="ux-text-small ux-opacity-4">—— 数据来源: {{ selectIndex === 0 ? 'RAIL.RE（临时）' : 'MoeFactory' }} ——</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				"keyword": "",
				"selectIndex": 0, // 0: 担当查询, 1: 配属查询
				"tabList": [{
					name: '担当', 
				}, {
					name: '配属',
				}],
			}
		},
		onShow() {
			// uni-app H5/App平台设置状态栏背景
			// #ifdef APP-PLUS
			plus.navigator.setStatusBarBackground('#eeeeee'); 
			// #endif
		},
		methods: {
			back: function() {
				uni.navigateBack()
			},
			tabChange: function(e) {
				const index = e.index; 
				this.selectIndex = index;
				this.keyword = ""; 
			},
			jumpToResult: function() {
				if (this.keyword == "") {
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
				if (this.selectIndex === 0) {
					// 担当
					url = "/pages/emu/result?keyword=" + this.keyword;
				} else {
					// 配属
					url = "/pages/assignment/result?keyword=" + this.keyword;
				}
				
				uni.navigateTo({
					url: url
				});
			},
			inputData: function(e) {
				this.keyword = e.detail.value;
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
}
</style>