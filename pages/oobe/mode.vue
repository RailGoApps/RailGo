<template>
	<view class="ux-bg-grey6" style="min-height:100vh;">
		<view class="ux-bg-primary" style="height:  var(--status-bar-height);">&nbsp;</view>

		<uni-popup ref="next_add" type="dialog">
			<uni-popup-dialog cancelText="取消" confirmText="继续" title="提示" content="需要现在下载离线数据库。"
				@confirm="confirmDownloadNow"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="error_no_internet" type="dialog">
			<uni-popup-dialog cancelText="关闭" title="提示" content="您未连接到网络，现在无法下载。"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="next_not_wifi" type="dialog">
			<uni-popup-dialog cancelText="取消" confirmText="继续" title="提示"
				content="您现在正在使用数据流量上网。下载数据库大约需要花费50M左右的流量，确定要下载吗？"
				@confirm="confirmDownloadNow"></uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="message" type="message">
			<uni-popup-message :duration="3000" type="error" message="该模式暂时无法使用"></uni-popup-message>
		</uni-popup>
		<view class="ux-padding-large">
			<view class="ux-mt-large">
				<text class="ux-h1">选择使用模式</text><br><br>
				<text class="ux-h6">您可以决定以什么方式进行查询。</text><br><br>
				<text class="ux-h6">不用担心，在设置里可以随心修改。</text><br><br>
				<uni-data-checkbox mode="button" v-model="checked" :localdata="ld"></uni-data-checkbox>
				<br>
				<view class="ux-border-radius ux-bg-white ux-padding" v-if="this.checked=='network'">
					优先请求网络服务器进行查询。速度会慢一些，但是时效性最强。
				</view>
				<view class="ux-border-radius ux-bg-white ux-padding" v-if="this.checked=='local'">
					优先通过本地数据库进行查询。速度最快，没网也能用，但是信息可能滞后。
				</view>
				<view class="ux-border-radius ux-bg-white ux-padding" v-if="this.checked=='ol'">
					仅通过本地数据库查询，无法使用在线功能。例如担当查询，正晚点信息等。
				</view>
			</view>
			<br>
			<br>
			<br>
			<br>
			<br>
			<button class="primary-button ux-mt-large" style="position: fixed; right: 20px; " @click="finish"
				hover-class="">
				<text class="icon">&#xe5c8;</text>
			</button>
		</view>
	</view>
</template>


<script>
	export default {
		// #ifdef APP
		data() {
			return {
				"ld": [{
						text: "优先在线",
						value: "network"
					},
					{
						text: "优先离线",
						value: "local"
					},
					{
						text: "仅离线",
						value: "ol"
					}
				],
				"checked": "network",
				"msgType": "success",
			}
		},
		// #endif
		// #ifdef H5
		data() {
			return {
				"ld": [{
						text: "优先在线",
						value: "network"
					}
				],
				"checked": "network",
				"msgType": "success",
			}
		},
		// #endif
		methods: {
			finish: function() {
				uni.setStorageSync("mode", this.checked)
				uni.setStorageSync("oobe", true)
				uni.setStorageSync("ol", false)
				if (this.checked == "local" || this.checked == "ol") {
					if (this.checked == "ol"){
						uni.setStorageSync("mode", "local")
						uni.setStorageSync("ol", true)
					}
					// #ifdef APP
					uni.getNetworkType({
						success: (res) => { 
							if (res.networkType === "none") {
								this.$refs.error_no_internet.open();
							} else if (res.networkType === "wifi" || res.networkType === "ethernet") {
								this.$refs.next_add.open();
							} else {
								this.$refs.next_not_wifi.open();
							}
						}
					});
					// #endif
					// #ifndef APP
					this.$refs.next_add.open();
					// #endif
				} else {
					uni.reLaunch({
						url: '/pages/index/index'
					})
				}
				
				

			},
			confirmDownloadNow: function() {
				uni.setStorageSync("mode", this.checked)
				uni.setStorageSync("oobe", true)
				uni.navigateTo({
					url: '/pages/oobe/download'
				})
			}
		}
	}
</script>

<style>
	.primary-button {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		text-align: center;
		line-height: 100rpx;
		background-color: #114598;
		color: #fff;
	}

	.icon {
		font-size: 40rpx;
	}
</style>