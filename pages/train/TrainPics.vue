<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<view class="ux-pl ux-pr ux-pt">
			<view hover-class="ux-bg-grey8" @click="back" style="display: inline-block;">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
		</view>

		<view class="ux-pl ux-pr ux-pb"><br>
			
			<view v-if="loading" class="ux-flex ux-justify-content-center ux-pt-large">
				<text class="ux-text-small ux-opacity-5">正在获取 {{trainCode}} 车型数据...</text>
			</view>

			<view v-if="coachData && !loading" class="ux-mt-normal">
				
				<view class="ux-bg-white ux-border-radius ux-padding ux-mb-small">
					<view class="ux-flex ux-align-items-center ux-space-between">
						<view>
							<text class="ux-h4 ux-bold">{{coachData.trainStyle}}</text><br/>

						</view>
						<view class="ux-text-right">
							<text class="ux-badge ux-text-small ux-color-white" style="background-color:#114598; padding:5rpx 15rpx;">
								{{coachData.carType}}
							</text>
						</view>
					</view>
				</view>

				<view class="ux-mt-normal">
					<view v-for="(item, index) in coachData.coachPicList" :key="index" class="ux-mb-normal">
						<view class="ux-bg-white ux-border-radius" style="overflow: hidden; line-height: 0;">
							<image 
								:src="getImageUrl(item.pictureUrl)" 
								mode="widthFix" 
								style="width: 100%; height: auto;"
								@click="preview(index)"
							></image>
						</view>
						<!-- <view class="ux-text-center ux-pt-small">
							<text class="ux-text-small ux-opacity-5" style="font-size: 24rpx;">{{item.pictureName}}</text>
						</view> -->
					</view>
				</view>
			</view>

			<view v-if="!loading && !coachData" class="ux-flex ux-justify-content-center ux-pt-large">
				<text class="ux-text-small ux-opacity-3">暂无该车次车型图片信息</text>
			</view>

		</view>
	</view>
</template>

<script>
	// 引入你提供的 UniGet (req.js)
	import { uniGet } from "@/scripts/req";

	export default {
		data() {
			return {
				trainCode: '',
				coachData: null,
				loading: false,
				// 默认使用当前日期
				runningDay: new Date().toISOString().slice(0, 10).replace(/-/g, "")
			}
		},
		onLoad(options) {
			// 直接从查询字符串获取 train 参数
			if (options.train) {
				this.trainCode = options.train.toUpperCase();
				this.getData();
			} else {
				uni.showToast({ title: '参数缺失', icon: 'none' });
			}
		},
		methods: {
			back() {
				uni.navigateBack();
			},
			// 拼接12306图片完整地址
			getImageUrl(picName) {
				return `https://exservice.12306.cn/cxmadmin/images/${picName}`;
			},
			async getData() {
				this.loading = true;
				try {
					const apiUrl = `https://mobile.12306.cn/wxxcx/openplatform-inner/miniprogram/wifiapps/appFrontEnd/v2/lounge/open-smooth-common/trainStyleBatch/getCarDetail`;
					
					// 使用 UniGet 发起请求
					const res = await uniGet(apiUrl, {
						params: {
							carCode: '',
							trainCode: this.trainCode,
							runningDay: this.runningDay,
							reqType: 'form'
						}
					});

					// 根据你提供的返回格式解析
					if (res.data && res.data.content && res.data.content.data) {
						this.coachData = res.data.content.data;
					} else {
						console.error("数据解析失败", res);
					}
				} catch (e) {
					console.error("请求异常", e);
				} finally {
					this.loading = false;
				}
			},
			// 图片预览功能
			preview(index) {
				const urls = this.coachData.coachPicList.map(item => this.getImageUrl(item.pictureUrl));
				uni.previewImage({
					current: index,
					urls: urls
				});
			}
		}
	}
</script>

<style scoped>

</style>