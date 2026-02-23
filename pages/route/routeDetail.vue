<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
		</view>
		<view class="ux-pl ux-pr ux-pb">

			<view class="ux-bg-white ux-border-radius">
				<view class="ux-flex ux-space-between ux-pt ux-pl ux-pr ux-align-items-center">
					<view>
						<text class="ux-bold consolas" style="font-size:60rpx;"
							:style="'color:'+cardColor">{{routeData.numberKind || routeData.trainNum.charAt(0)}}</text>
						<text class="consolas"
							style="font-size:50rpx;padding-left:5rpx;">{{routeData.trainNum.substring(1) || (routeData.numberFull || []).join("/").replace(routeData.numberKind, "").replace(routeData.numberKind, "")}}</text>
					</view>
					<text class="ux-badge ux-text-small ux-color-white" style="padding:5rpx 15rpx;"
						:style="'background-color:'+cardColor">{{trainTypeDesc}}</text>
				</view>
				<view class="ux-flex ux-space-between ux-mt-small ux-pl ux-pr ux-pt-small ux-color-white"
					:style="'background-color:'+cardColor">
					<text
						class="ux-text-small">{{(filteredTimetable && filteredTimetable.length > 0 ? filteredTimetable[0].stationName || filteredTimetable[0].station : routeData.from) || ''}}
						⋙
						{{(filteredTimetable && filteredTimetable.length > 0 ? filteredTimetable[filteredTimetable.length-1].stationName || filteredTimetable[filteredTimetable.length-1].station : routeData.to) || ''}}</text>
					<text class="ux-text-small">{{routeData.bureauName || ''}}{{routeData.runner || ''}}&nbsp;&nbsp;</text>
				</view>
				<view class="ux-pb-small" style="border-bottom-left-radius:10rpx; border-bottom-right-radius:10rpx;"
					:style="'background-color:'+cardColor">
				</view>
			</view>
			<br>
			<view class="ux-padding-small ux-h6 ux-text-center"
				style="background-color:#e9eef5;border:1px solid #114598;border-radius:10rpx;color:#114598;">
				<text class="ux-bold">信息仅代表保存行程日数据 无时效性</text>
			</view>
			<view>
				<view class="ux-padding-small ux-h6 ux-text-center ux-mt-small"
					style="background-color:#f8eceb;border:1px solid #c0392b;border-radius:10rpx;color:#c0392b;">
					<text class="ux-bold">时刻表为乘车区间时刻表 并非车次完整时刻表</text>
				</view>
			</view>
			<view class="ux-flex ux-justify-content-center">
				<uv-tabs :list="topTabList" lineWidth="60" lineColor="#114599" :activeStyle="{
							color: '#303133',
							fontWeight: 'bold',
							transform: 'scale(1.05)'
				    	}" :inactiveStyle="{
							color: '#606266',
							transform: 'scale(1)'
						}" itemStyle="height: 34px;padding-left:30px;padding-right:30px;" class="ux-mt-small"
					@click="tabChange"></uv-tabs>
			</view>

			<view v-if="selectIndex==0">
				<uni-section title="时刻表" type="line" style="background-color: transparent;"
					title-font-size="28rpx"></uni-section>
				<uni-table style="border:none">
					<uni-tr style="border:none">
						<uni-th style="border:none" width="10">
							<image style="width:1px;height:1px;transform:translateY(10px) scale(40);" mode="aspectFit"
								src="@/static/station-mark-th.png"></image>
						</uni-th>
						<uni-th>车站名</uni-th>
						<uni-th width="70">车次</uni-th>
						<uni-th width="60">到达</uni-th>
						<uni-th width="60">出发</uni-th>
						<uni-th width="80">里程</uni-th>
						<uni-th width="100">区间均速</uni-th>
						<uni-th width="60">日期</uni-th>
						</uni-tr>
					<uni-tr v-for="(item,index) in filteredTimetable" :key="index" style="border:none"
						hover-class="ux-bg-grey5">
						<uni-td style="border:none">
							<image style="width:1px;height:1px;transform:translateY(-5px) scale(40)" mode="aspectFit"
								src="@/static/station-mark-stop.png"></image>
						</uni-td>
						<uni-td style="border:none">
							{{item.stationName || item.station || ''}}
						</uni-td>
						<uni-td style="border:none">{{item.trainCode || routeData.trainNum || ''}}</uni-td>
						<uni-td style="border:none">{{item.arrive || item.arriveTime || ''}}</uni-td>
						<uni-td style="border:none">{{item.depart || item.departTime || ''}}</uni-td>
						<uni-td style="border:none">{{item.distance || '0'}} km</uni-td>
						<uni-td style="border:none">{{item.speed ? item.speed.toFixed(1) : '-'}} km/h</uni-td>
						<uni-td style="border:none">{{item.day || '当'}}日</uni-td>
						</uni-tr>
				</uni-table>
			</view>

			<view v-if="selectIndex==1">
				<uni-section title="担当" type="line" style="background-color: transparent;"
					title-font-size="28rpx"></uni-section>
				<view class="ux-bg-white ux-border-radius"
					v-if="(routeData.car || routeData.runner || routeData.carOwner)">

					<view v-if="routeData.car && ['G','D','C','S'].includes((routeData.numberKind || routeData.trainNum.charAt(0)))">
						<view class="ux-flex ux-justify-content-center">
							<image v-if="carImageUrl" :src="carImageUrl" @error="onImageError" mode="widthFix"
								style="width:100%; height: auto; border-top-left-radius: 10rpx; border-top-right-radius: 10rpx; border-bottom-left-radius: 0; border-bottom-right-radius: 0;"></image>
						</view>
						<view v-if="carImageUrl" class="ux-flex ux-space-between ux-pt-small ux-pb-small ux-pl ux-pr ux-color-white"
							:style="'background-color:'+cardColor" style="border-bottom-left-radius: 10rpx; border-bottom-right-radius: 10rpx;">
							<text class="ux-text-small ux-bold">
								{{routeData.car || ''}}
							</text>
							<text class="ux-text-small ux-opacity-8">
								图源：{{ imageUploaderUsername }}
							</text>
						</view>
					</view>
					<view class="ux-padding">

						<view class="ux-flex ux-space-between" v-if="routeData.runner || routeData.carOwner">
							<view class="ux-flex ux-align-items-center" v-if="routeData.runner">
								<text class="ux-color-primary icon" style="font-size:60rpx;">&#xe7fd;</text>
								<view class="ux-pl-small">
									<text class="ux-text-small ux-opacity-5">值乘单位</text><br>
									<text>{{routeData.runner || ''}}</text>
								</view>
							</view>
							
							<view class="ux-flex ux-align-items-center" v-if="routeData.carOwner">
								<text class="ux-color-primary icon" style="font-size:60rpx;">&#xe570;</text>
								<view class="ux-pl-small">
									<text class="ux-text-small ux-opacity-5">车辆归属</text><br>
									<text>{{routeData.carOwner || ''}}</text>
								</view>
							</view>
						</view>

						<!-- 针对非G、D、C、S类型的车次显示车型 -->
						<view class="ux-flex ux-space-between" v-if="routeData.car && !['G','D','C','S'].includes((routeData.numberKind || routeData.trainNum.charAt(0)))">
							<view class="ux-flex ux-align-items-center">
								<text class="ux-color-primary icon" style="font-size:60rpx;">&#xe570;</text>
								<view class="ux-pl-small">
									<text class="ux-text-small ux-opacity-5">车型</text><br>
									<text>{{routeData.car || ''}}</text>
								</view>
							</view>
						</view>

						<uv-divider v-if="routeData.carOwner || routeData.runner" />

						<view v-if="routeData.car && ['G','D','C','S'].includes((routeData.numberKind || routeData.trainNum.charAt(0)))" class="ux-mt-normal">
							
							<view class="ux-flex ux-flex-wrap ux-space-between">
								<view class="ux-flex ux-align-items-center ux-mb-small" style="width: 48%;">
									<text class="ux-color-primary icon" style="font-size:50rpx;">&#xe642;</text>
									<view class="ux-pl-small ux-text-small">
										<text class="ux-opacity-5">编组</text><br/>
										<text>{{carMap[routeData.car.replace(" 重联","")] ? carMap[routeData.car.replace(" 重联","")][0] : '-'}}节</text>&thinsp;
										<text>{{carMap[routeData.car.replace(" 重联","")] ? carMap[routeData.car.replace(" 重联","")][1] : '-'}}</text>
									</view>
								</view>
								
								<view class="ux-flex ux-align-items-center ux-mb-small" style="width: 48%;">
									<text class="ux-color-primary icon" style="font-size:50rpx;">&#xe569;</text>
									<view class="ux-pl-small ux-text-small">
										<text class="ux-opacity-5">速度</text><br/>
										<text>{{carMap[routeData.car.replace(" 重联","")] ? carMap[routeData.car.replace(" 重联","")][3] : '-'}}km/h</text>
									</view>
								</view>

								
								<view class="ux-flex ux-align-items-center ux-mb-small" style="width: 48%;">
									<text class="ux-color-primary icon" style="font-size:50rpx;">&#xe556;</text>
									<view class="ux-pl-small ux-text-small">
										<text class="ux-opacity-5">餐车</text><br/>
										<text>{{carMap[routeData.car.replace(" 重联","")] ? carMap[routeData.car.replace(" 重联","")][2] : '-'}}</text>
									</view>
								</view>
							</view>

						</view>
					</view>
				</view>
				<view v-if="!(routeData.car || routeData.runner || routeData.carOwner)"
					class="ux-padding ux-text-center">
					暂无担当信息
				</view>
			</view>

			<view class="ux-padding ux-text-center" v-if="selectIndex==2">
				<!-- 座位号显示 -->
				<view v-if="routeData.seat" class="ux-bg-white ux-border-radius ux-padding ux-mt">
					<view class="ux-flex ux-space-between ux-align-items-center">
						<text class="ux-bold" style="font-size: 32rpx;">座位号</text>
						<text class="ux-text-small ux-color-primary">{{ routeData.seat }}</text>
					</view>
				</view>
			</view>

			<br>
			<view class="ux-flex ux-row ux-justify-content-center">
				<text class="ux-text-small ux-opacity-4">—— · ——</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getTrainTypeColor, getTrainTypeDescription } from "@/scripts/config.js";
import { CAR_PERFORMANCE } from "@/scripts/config.js";
import { uniGet } from "@/scripts/req.js";

export default {
	data() {
		return {
			routeData: {},
			filteredTimetable: [],
			cardColor: "#114598",
			topTabList: [{
				name: '时刻',
			}, {
				name: '运行',
			}, {
				name: '其他'
			}],
			selectIndex: 0,
			carMap: CAR_PERFORMANCE,
			carImageUrl: "", 
			defaultImageUrl: "",
			imageUploaderUsername: "暂缺图片",
			isImageLoading: true,
		}
	},
	computed: {
		bureauLogo() {
			if (!this.routeData.bureau) return '';
			return `/static/bureauLogo/${this.routeData.bureau}.png`;
		},
		trainTypeDesc() {
			return getTrainTypeDescription(this.routeData.trainNum);
		}
	},
	onLoad(options) {
		// #ifdef APP
		plus.navigator.setStatusBarBackground('#114598');
		// #endif
		
		if (options.routeData) {
			this.routeData = JSON.parse(decodeURIComponent(options.routeData));
			// 根据保存的区间信息过滤时刻表
			if (this.routeData.timetable && this.routeData.fromStation && this.routeData.toStation) {
				// 找到始发站和终点站在时刻表中的索引
				const fromIndex = this.routeData.timetable.findIndex(s => 
					s.stationName === this.routeData.fromStation || s.station === this.routeData.fromStation);
				const toIndex = this.routeData.timetable.findIndex(s => 
					s.stationName === this.routeData.toStation || s.station === this.routeData.toStation);
				
				// 如果找到了始发站和终点站，则过滤出这两个站之间的时刻表
				if (fromIndex !== -1 && toIndex !== -1 && fromIndex <= toIndex) {
					this.filteredTimetable = this.routeData.timetable.slice(fromIndex, toIndex + 1);
				} else {
					// 如果没找到，则显示全部时刻表
					this.filteredTimetable = this.routeData.timetable || [];
				}
			} else {
				this.filteredTimetable = this.routeData.timetable || [];
			}
			
			// 设置卡片颜色
			this.cardColor = getTrainTypeColor(this.routeData.trainNum);
			
			// 初始化图片
			const carModel = this.routeData.car ? this.routeData.car.replace(' 重联', '') : null;
			if (carModel) {
				this.carImageUrl = `https://tp.railgo.zenglingkun.cn/api/${encodeURIComponent(carModel)}.png`;
				// 尝试获取图片信息
				this.fetchImageSource();
			} else {
				this.carImageUrl = '';
				this.isImageLoading = false;
			}
		}
	},
	methods: {
		back() {
			uni.navigateBack();
		},
		getTrainTypeColor,
		tabChange(e) {
			this.selectIndex = e.index;
		},
		onImageError: function(e) {
			const carModel = this.routeData.car ? this.routeData.car.replace(' 重联', '') : null;
		    
			// 如果当前加载的是 JSON 里的图片且失败了，尝试切换到默认 PNG 接口
			if (this.carImageUrl !== this.defaultImageUrl && this.defaultImageUrl) {
				this.carImageUrl = this.defaultImageUrl;
				return;
			}
		
			// 如果默认 PNG 也失败了，尝试使用本地 config.js 里的兜底图
			if (carModel && this.carMap[carModel] && this.carMap[carModel][4]) {
				this.carImageUrl = this.carMap[carModel][4];
			} else {
				this.carImageUrl = '';
			}
			console.error("All image sources failed.");
		},
		async fetchImageSource() {
			const carModel = this.routeData.car ? this.routeData.car.replace(' 重联', '') : null;
			if (!carModel) {
				this.isImageLoading = false;
				return;
			}
		
			// 设置默认的备用地址（原有的 .png 接口）
			this.defaultImageUrl = `https://tp.railgo.zenglingkun.cn/api/${encodeURIComponent(carModel)}.png`;
		
			try {
				const url = `https://tp.railgo.zenglingkun.cn/api/${encodeURIComponent(carModel)}.json`;
				const resp = await uniGet(url);
		
				if (resp.data && resp.data.success && resp.data.data) {
					// 优先使用 JSON 中的 image_url
					if (resp.data.data.image_url) {
						this.carImageUrl = resp.data.data.image_url;
					} else {
						// 如果 JSON 成功但没返回 image_url，走默认 PNG
						this.carImageUrl = this.defaultImageUrl;
					}
					// 更新上传者信息
					this.imageUploaderUsername = resp.data.data.uploader_username || '未知';
				} else {
					// JSON 接口返回 success: false
					this.carImageUrl = this.defaultImageUrl;
					this.imageUploaderUsername = '暂缺图片';
				}
			} catch (e) {
				// 网络请求失败（如 404），走默认 PNG
				console.warn("JSON metadata not found, using default png.");
				this.carImageUrl = this.defaultImageUrl;
				this.imageUploaderUsername = '暂缺图片';
			} finally {
				this.isImageLoading = false;
			}
		},
	}
}
</script>

<style>
	.page {
		min-height: 100vh;
	}

	.status-bar {
		height: var(--status-bar-height);
	}
</style>