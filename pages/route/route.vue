<template>
	<view class="ux-bg-grey5" style="min-height: 100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<view class="ux-pl ux-pr ux-pt">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">旅途</text>
		</view>
		
		<view class="ux-pl ux-pr" style="margin-top: 15rpx;">
			<view v-if="routes && routes.length > 0">
				<!-- 显示记录总数 -->
				<text class="ux-opacity-5" style="font-size: 20rpx;">共有 {{ routes.length }} 趟行程记录</text>
				<view style="margin-top: 20rpx;"></view> 
				<view v-for="(route, index) in routes" :key="index" 
					class="ux-bg-white ux-border-radius ux-mb-small ux-flex"
					hover-class="ux-bg-grey8" 
					@click="viewRouteDetail(route)"
					@longpress="confirmDeleteRoute(route, index)">
					<view style="border-bottom-left-radius: 10rpx; border-top-left-radius:10rpx;"
						:style="'background-color:'+getTrainTypeColor(route.trainNum)">
						&nbsp;&nbsp;
					</view>
					<view class="ux-flex ux-align-items-center ux-space-between ux-pr ux-pt ux-pb ux-pl-small"
						style="width:100%;">
						<view>
							<text class="consolas" style="font-size:45rpx;">
								{{getDepartureTime(route)}}
							</text>
							<br>
							<text class="ux-text-small">
								{{route.fromStation || route.from}}
							</text>
						</view>
						<view class="ux-text-center">
							<view class="ux-flex ux-align-items-center ux-justify-content-center">
								<text class="consolas" style="font-size:40rpx;">
									{{route.numberKind + route.trainNum.replace(route.numberKind, "")}}
								</text>
							</view>
							<view style="border-top: 0.1rpx solid #757575;width:30vw;margin: 5rpx 0;"></view>
							
							<view class="ux-flex ux-justify-content-center ux-align-items-center ux-opacity-5">
								<text class="ux-text-small">{{route.date || ''}}</text>
								<text v-if="route.car" class="consolas ux-ml-small ux-opacity-9" style="font-size: 24rpx;">{{route.car}}</text>
							</view>
						</view>
						<view>
							<view class="ux-flex ux-align-items-start">
								<text class="consolas" style="font-size:45rpx;">
									{{getArrivalTime(route)}}
								</text>
							</view>
							<text class="ux-text-small">
								{{route.toStation || route.to}}
							</text>
						</view>
					</view>
				</view>
			</view>
			<view v-else class="ux-text-center ux-mt-large">
				<text class="ux-color-grey2">暂无行程记录，可在车次查询页面添加哦</text>
			</view>
		</view>
		
		<!-- 底部提示 -->
		<view style="padding: 30rpx; text-align: center; margin-top: 20rpx;">
			<text class="ux-color-grey2" style="font-size: 22rpx;">长按可删除数据<br>如果想要更好的记录体验，欢迎使用我们的伙伴产品 RailLog</text>
		</view>
	</view>
</template>

<script>
import { getTrainTypeColor } from "@/scripts/config.js";

export default {
	data() {
		return {
			routes: [],
		}
	},
	onLoad() {
		// #ifdef APP
		plus.navigator.setStatusBarBackground('#114598');
		// #endif
	},
	onShow() {
		this.loadRoutes();
	},
	methods: {
		back() {
			uni.navigateBack();
		},
		getTrainTypeColor,
		// 获取出发时间
		getDepartureTime(route) {
			if (route.timetable && route.fromStation) {
				const stationIndex = route.timetable.findIndex(s => s.stationName === route.fromStation || s.station === route.fromStation);
				if (stationIndex !== -1) {
					return route.timetable[stationIndex].depart || route.timetable[stationIndex].departTime || '';
				}
			}
			// 如果没有找到对应站点，返回第一个站的出发时间
			if (route.timetable && route.timetable.length > 0) {
				return route.timetable[0].depart || route.timetable[0].departTime || '';
			}
			return '';
		},
		// 获取到达时间
		getArrivalTime(route) {
			if (route.timetable && route.toStation) {
				const stationIndex = route.timetable.findIndex(s => s.stationName === route.toStation || s.station === route.toStation);
				if (stationIndex !== -1) {
					return route.timetable[stationIndex].arrive || route.timetable[stationIndex].arriveTime || '';
				}
			}
			// 如果没有找到对应站点，返回最后一个站的到达时间
			if (route.timetable && route.timetable.length > 0) {
				const lastIndex = route.timetable.length - 1;
				return route.timetable[lastIndex].arrive || route.timetable[lastIndex].arriveTime || '';
			}
			return '';
		},
		// 计算旅行时间
		getTravelTime(route) {
			if (!route.timetable || !route.fromStation || !route.toStation) {
				return '';
			}
			
			const fromIndex = route.timetable.findIndex(s => s.stationName === route.fromStation || s.station === route.fromStation);
			const toIndex = route.timetable.findIndex(s => s.stationName === route.toStation || s.station === route.toStation);
			
			if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
				const fromTime = route.timetable[fromIndex].depart || route.timetable[fromIndex].departTime;
				const toTime = route.timetable[toIndex].arrive || route.timetable[toIndex].arriveTime;
				
				if (fromTime && toTime) {
					const [fH, fM] = fromTime.split(':').map(Number);
					const [tH, tM] = toTime.split(':').map(Number);
					// 考虑跨日情况
					let diff = (tH * 60 + tM) - (fH * 60 + fM);
					if (diff < 0) diff += 24 * 60; // 加上24小时（如果跨日）
					
					const hours = Math.floor(diff / 60);
					const minutes = diff % 60;
					return `${hours}h${minutes.toString().padStart(2, '0')}m`;
				}
			}
			return '';
		},
		async loadRoutes() {
			// 从存储加载行程数据
			// #ifndef APP-PLUS
			const routesData = uni.getStorageSync('myRoutes') || '[]';
			this.routes = JSON.parse(routesData);
			// #endif
			
			// #ifdef APP-PLUS
			// 直接从本地存储加载JSON数据
			const routesData = plus.storage.getItem('myRoutes') || '[]';
			try {
				this.routes = JSON.parse(routesData);
			} catch (e) {
				console.error('解析行程数据失败:', e);
				this.routes = [];
			}
			// #endif
		},
		viewRouteDetail(route) {
			// 跳转到行程详情页面
			uni.navigateTo({
				url: `/pages/route/routeDetail?routeData=${encodeURIComponent(JSON.stringify(route))}`
			});
		},
		// 确认删除行程
		confirmDeleteRoute(route, index) {
			uni.showModal({
				title: '确认删除',
				content: `确定要删除 ${route.fromStation || route.from} 到 ${route.toStation || route.to} 的行程记录吗？`,
				confirmText: '删除',
				confirmColor: '#ff0000',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						this.deleteRoute(index);
					}
				}
			});
		},
		// 删除行程
		deleteRoute(index) {
			this.routes.splice(index, 1);
			// 更新存储
			const routesData = JSON.stringify(this.routes);
			// #ifndef APP-PLUS 
			uni.setStorageSync('myRoutes', routesData);
			// #endif
			
			// #ifdef APP-PLUS
			plus.storage.setItem('myRoutes', routesData);
			// #endif
			
			uni.showToast({
				title: '删除成功',
				icon: 'success',
				duration: 1500
			});
		}
	}
}
</script>

<style>
</style>