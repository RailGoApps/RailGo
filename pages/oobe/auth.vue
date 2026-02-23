<template>
	<view class="ux-bg-grey6" style="min-height:100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>
			<uni-popup ref="message" type="message">
				<uni-popup-message :duration="3000" :type="msgType" :message="messageText"></uni-popup-message>
			</uni-popup>
		<view class="ux-padding-large">
			<view class="ux-mt-large">
						<text class=" ux-h1">公测版鉴权</text><br><br>
						<text class="ux-h6">您正在使用一个测试版本。</text><br><br>
						<text class="ux-h6">本版本可能包含未被修复的漏洞或未完全实现的功能，并非最终发行效果。</text><br><br>
						<text class="ux-h6">因此，本版本不应当用于日常使用。若您不想使用未完成的内容，则请重新下载正式版。</text><br><br>
						<text class="ux-h6 ux-bold">本品品质无保障，请慎重使用。</text><br><br>
						<text class=" ux-h6">为避免出现不可预料的后果，需要进行鉴权。</text><br><br>
						<text class=" ux-h6 ux-bold">公测码可在RailGo Center免费获取，如有售卖情况，请向我们举报。</text><br><br>
						
						<view class="ux-flex" style="align-items: center; margin-bottom: 10px;">
						  <text style="width: 80px; text-align: right;" class="">公测码：</text>
						  <uni-easyinput placeholder="请输入公测码" @input="inputCode" style="min-width: 200px; flex-grow: 1;"></uni-easyinput>
						</view>
						<view class="ux-flex " style="align-items: center;">
						  <text style="width: 80px; text-align: right;" class="">注册邮箱：</text>
						  <uni-easyinput placeholder="请输入邮箱" @input="inputQQ" style="min-width: 200px; flex-grow: 1;"></uni-easyinput>
						</view>
					</view>
			<br>
			<br>
			<br>
			<button class="primary-button ux-mt-large" style="position: fixed; right: 20px; " @click="check" hover-class="">
			  <text class="icon">&#xe5c8;</text>
			</button>
		</view>
	</view>
</template>

<script>
import {uniGet} from "@/scripts/req.js";
	export default {
		data() {
			return {
				"code": "",
				"qq": "",
				"load": false,
				"ver": uni.getStorageSync("version"),
				"valid": false,
				"msgType": "success",
				"messageText": "",
				"err": ""
			}
		},
		methods: {
			inputCode(e){
				this.code = e
			},
			inputQQ(e){
				this.qq = e
			},
				
			async check(){
				if (this.code == "" || this.qq == ""){
					this.msgType = "error"
					this.messageText = "值不能为空"
					this.$refs.message.open()
					return
				}
				this.load=true;
				try {
					const Response = await uniGet("https://center.zenglingkun.cn/beta/api/check/" + this.ver + "?userid=" + this.qq + "&key=" + this.code);
					this.valid = Response.data.valid;
					if (this.valid) {
						uni.setStorageSync("qq", this.qq)
						uni.setStorageSync("key", this.code)
						uni.setStorageSync("AuthTime", new Date().getTime())
						this.msgType = "success"
						this.messageText = "验证成功！"
						this.$refs.message.open()
						uni.navigateTo({url: '/pages/oobe/mode'})
						
					} else {
						this.msgType = "error"
						this.messageText = "请检查公测码与邮箱是否正确"
						this.$refs.message.open()
					}
					this.load=false;
				} catch (error) {
					console.error('Error fetching data:', error);
					this.load=false;
					this.msgType = "error"
					this.err = error
					this.messageText = "请求错误"
					this.$refs.message.open()
				}
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