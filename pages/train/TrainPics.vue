<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<back-header></back-header>

		<view class="ux-pl ux-pr ux-pb"><br>
			
			<view v-if="loading" class="ux-flex ux-justify-content-center ux-pt-large">
				<text class="ux-text-small ux-opacity-5">正在获取 {{trainCode}} 车型数据...</text>
			</view>

			<view v-if="coachData && !loading" class="ux-mt-normal">
				
				<view class="ux-bg-white ux-border-radius ux-padding ux-mb-small">
					<view class="ux-flex ux-align-items-center ux-space-between">
						<view>
							<text class="ux-h4 ux-bold">{{coachData.trainStyle || '未知车型'}}</text><br/>
							<text class="ux-text-small ux-color-grey">今日担当 {{coachData.carCode || '暂无车号'}}</text>
						</view>
						<view class="ux-text-right">
							<text class="ux-badge ux-text-small ux-color-white" style="background-color:#114598; padding:5rpx 15rpx;">
								{{coachData.carType || '动车组'}}
							</text>
						</view>
					</view>
				</view>

				<view class="ux-mt-normal">
					<view v-for="(item, index) in coachData.coachPicList" :key="index" class="ux-mb-normal">
						<view class="ux-bg-white ux-border-radius" style="overflow: hidden; line-height: 0; margin-top: 15rpx; ">
							<image 
								:src="getImageUrl(item.pictureUrl)" 
								mode="widthFix" 
								style="width: 100%; height: auto;"
								@click="preview(index)"
							></image>
						</view>
						<view class="ux-text-center ux-pt-small">
							<text class="ux-text-small ux-opacity-5">{{item.pictureName}}</text>
						</view>
					</view>
				</view>
			</view>

			<view v-if="!loading && (!coachData || !coachData.coachPicList || coachData.coachPicList.length === 0)" class="ux-flex ux-justify-content-center ux-pt-large">
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
				return picName;
			},
			async getData() {
				this.loading = true;
				this.coachData = null; // 请求前先清空旧数据，避免上一次的结果残留导致视觉闪烁
				try {
					const coachBase = uni.getStorageSync('service_source_coach') || 'https://rg-api.zenglingkun.cn';
					const apiUrl = coachBase + `/api/v2/getCoachPic?train=${this.trainCode}`;
					// 使用 UniGet 发起请求
					const res = await uniGet(apiUrl);
					
					// 核心修复：严格验证返回的 data 是否有内容
					if (res && res.data && res.data.data && Object.keys(res.data.data).length > 0) {
						this.coachData = res.data.data;
					} else {
						// 即使网络请求成功(200)，但 data 项目为空白或 null
						this.coachData = null;
						console.warn("未获取到有效的车型图片数据：data 为空");
					}
				} catch (e) {
					this.coachData = null;
					console.error("请求异常", e);
				} finally {
					this.loading = false;
				}
			},
			// 图片预览功能
			preview(index) {
				if (!this.coachData || !this.coachData.coachPicList) return;
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