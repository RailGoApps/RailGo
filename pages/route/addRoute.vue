<template>
	<view class="ux-bg-grey5" style="min-height: 100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<view class="ux-pl ux-pr ux-pt">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">添加行程</text>
		</view>
		<br>
		<view class="ux-pl ux-pr ux-pb">
			<view class="ux-bg-white ux-border-radius">
				<view class="ux-flex ux-space-between ux-pt ux-pl ux-pr ux-align-items-center">
					<view>
						<text class="ux-bold consolas" style="font-size:60rpx;" :style="'color:'+cardColor">{{ trainNum.charAt(0) }}</text>
						<text class="consolas" style="font-size:50rpx;padding-left:5rpx;">{{ trainNum.substring(1) }}</text>
					</view>
					<text class="ux-badge ux-text-small ux-color-white" style="padding:5rpx 15rpx;" :style="'background-color:'+cardColor">{{ trainTypeDesc }}</text>
				</view>
				<view class="ux-flex ux-space-between ux-mt-small ux-pl ux-pr ux-pt-small ux-color-white" :style="'background-color:'+cardColor">
					<text class="ux-text-small">{{ from }} ⋙ {{ to }}</text>
					<text class="ux-text-small">{{ bureauName }}{{ runner }}&nbsp;&nbsp;</text>
				</view>
				<view class="ux-pb-small" style="border-bottom-left-radius:10rpx; border-bottom-right-radius:10rpx;" :style="'background-color:'+cardColor">
				</view>
			</view>
			
			<view v-if="loading" class="ux-bg-white ux-padding ux-mt ux-border-radius">
				<view class="ux-flex ux-justify-content-center ux-align-items-center" style="height: 200rpx;">
					<text>正在加载车次信息...</text>
				</view>
			</view>
			
			<view v-else class="ux-bg-white ux-mt ux-border-radius">
				<uni-section title="行程信息" type="line" style="background-color: transparent;" title-font-size="28rpx"></uni-section>
				
				<view class="ux-padding">
					<view class="ux-mb">
						<text class="ux-text-small ux-mb-small ux-opacity-7">选择日期</text>
						<uni-datetime-picker :value="selectedDate" @change="dateChange" type="date" :border="false" style="background-color: #f5f5f5; padding: 20rpx; border-radius: 10rpx;" />
					</view>
					
					<view class="ux-mb">
						<text class="ux-text-small ux-mb-small ux-opacity-7">车厢座位 (可选)</text>
						<input type="text" class="ux-input" v-model="seat" placeholder="如: 03车15A" style="background-color: #f5f5f5; padding: 20rpx; border-radius: 10rpx; font-size: 28rpx;" />
					</view>
					
					<view>
						<text class="ux-text-small ux-mb-small ux-opacity-7">选择区间</text>
						<view class="ux-flex ux-space-between ux-mb-small">
							<view class="ux-flex-1 ux-mr-small">
								<picker @change="fromStationChange" :range="stationList" range-key="stationName">
									<view class="ux-input" style="background-color: #f5f5f5; padding: 20rpx; border-radius: 10rpx; display: flex; justify-content: space-between; align-items: center; font-size: 28rpx;">
										<text v-if="selectedFromStation" :class="selectedFromStation.length > 6 ? 'ux-text-small' : ''">{{ selectedFromStation }}</text>
										<text v-else class="ux-color-grey2">选择始发站</text>
										<text class="icon">&#xe5c8;</text>
									</view>
								</picker>
							</view>
							<view style="display: flex; align-items: center; justify-content: center; width: 60rpx;">
								<text class="ux-text-small ux-opacity-7">至</text>
							</view>
							<view class="ux-flex-1 ux-ml-small">
								<picker @change="toStationChange" :range="toStationList" range-key="stationName">
									<view class="ux-input" style="background-color: #f5f5f5; padding: 20rpx; border-radius: 10rpx; display: flex; justify-content: space-between; align-items: center; font-size: 28rpx;">
										<text v-if="selectedToStation" :class="selectedToStation.length > 6 ? 'ux-text-small' : ''">{{ selectedToStation }}</text>
										<text v-else class="ux-color-grey2">选择终点站</text>
										<text class="icon">&#xe5c8;</text>
									</view>
								</picker>
							</view>
						</view>
					</view>
				</view>
			</view>
			<br>
			<button class="ux-color-white ux-bg-primary" 
				@click="addRoute" 
				:disabled="!isValidRoute || loading"
				hover-class="ux-tap">
				确认添加
			</button>
		</view>
	</view>
</template>

<script>
import { getTrainTypeColor, getTrainTypeDescription } from "@/scripts/config.js";
import { doQuery } from "@/scripts/sqlite.js";
import { uniGet } from "@/scripts/req.js";
import { toRaw } from "@vue/reactivity";

export default {
	data() {
		return {
			trainNum: '',
			from: '',
			to: '',
			date: '',
			timetable: [],
			bureauName: '',
			car: '',
			runner: '',
			loading: false,
			selectedDate: '',
			seat: '',
			stationList: [],
			selectedFromStation: '',
			selectedToStation: '',
			isValidRoute: false,
			cardColor: '#114598'
		}
	},
	computed: {
		trainTypeDesc() {
			return getTrainTypeDescription(this.trainNum);
		},
		toStationList() {
			if (!this.selectedFromStation) return this.stationList;
			
			// 获取始发站之后的车站列表
			const fromIndex = this.stationList.findIndex(s => s.stationName === this.selectedFromStation);
			if (fromIndex === -1) return this.stationList;
			
			return this.stationList.slice(fromIndex + 1);
		}
	},
	onLoad(options) {
		// #ifdef APP
		plus.navigator.setStatusBarBackground('#114598');
		// #endif
		
		// 从URL参数获取车次号和日期
		if (options.trainNum && options.date) {
			this.trainNum = options.trainNum;
			this.date = options.date;
			this.selectedDate = options.date;
			
			// 加载车次详细信息
			this.loadTrainDetail();
		}
	},
	watch: {
		selectedFromStation() {
			this.validateRoute();
		},
		selectedToStation() {
			this.validateRoute();
		}
	},
	methods: {
		back() {
			uni.navigateBack();
		},
		async loadTrainDetail() {
			this.loading = true;
			try {
				const mode = uni.getStorageSync("mode");
				
				if (mode === "network") {
					// 网络模式：从API获取数据
					const resp = await uniGet(
						`https://data.railgo.zenglingkun.cn/api/train/query?train=${encodeURIComponent(this.trainNum)}`
					);
					const result = resp.data;

					if (result.error || !result.timetable || result.timetable.length === 0) {
						uni.showToast({
							title: '车次不存在',
							icon: 'error'
						});
						return;
					}

					// 保存车次详细数据
					this.from = result.timetable && result.timetable.length > 0 ? result.timetable[0].station : '';
					this.to = result.timetable && result.timetable.length > 0 ? result.timetable[result.timetable.length - 1].station : '';
					this.timetable = (result.timetable || []).map(item => ({
						stationName: item.station || '',
						stationTelecode: item.stationTelecode || '',
						trainCode: item.trainCode || '',
						arrive: item.arrive || '',
						depart: item.depart || '',
						distance: item.distance || '-',
						speed: item.speed || 0,
						day: item.day || '-',
						isStart: item.isStart || false,
						isEnd: item.isEnd || false
					}));
					this.bureauName = result.bureauName || '';
					this.car = result.car || '';
					this.runner = result.runner || '';
					// 设置卡片颜色
					this.cardColor = getTrainTypeColor(this.trainNum);
				} else {
					// 离线模式：从本地数据库获取数据
					const result = await doQuery("SELECT * FROM trains WHERE number='" + this.trainNum + "'", ["numberFull", "type", "timetable", "bureauName", "runner", "car", "carOwner", "diagram", "spend", "rundays", "route", "isTemp", "isFuxing"]);
					
					if (result && result.length > 0) {
						let rawData = toRaw(result[0]);
						
						// 解析JSON字符串
						if (typeof rawData.timetable === 'string') {
							try {
								rawData.timetable = JSON.parse(rawData.timetable);
							} catch (e) {
								console.error("Failed to parse timetable JSON string:", e);
								rawData.timetable = [];
							}
						}
						if (typeof rawData.numberFull === 'string') {
							try {
								rawData.numberFull = JSON.parse(rawData.numberFull);
							} catch (e) {
								console.error("Failed to parse numberFull JSON string:", e);
								rawData.numberFull = [];
							}
						}

						// 保存车次详细数据
						this.from = rawData.timetable && rawData.timetable.length > 0 ? rawData.timetable[0].station : '';
						this.to = rawData.timetable && rawData.timetable.length > 0 ? rawData.timetable[rawData.timetable.length - 1].station : '';
						this.timetable = (rawData.timetable || []).map(item => ({
							stationName: item.station || '',
							stationTelecode: item.stationTelecode || '',
							trainCode: item.trainCode || '',
							arrive: item.arrive || '',
							depart: item.depart || '',
							distance: item.distance || '-',
							speed: item.speed || 0,
							day: item.day || '-',
							isStart: item.isStart || false,
							isEnd: item.isEnd || false
						}));
						this.bureauName = rawData.bureauName || '';
						this.car = rawData.car || '';
						this.runner = rawData.runner || '';
						// 设置卡片颜色
						this.cardColor = getTrainTypeColor(this.trainNum);
					} else {
						uni.showToast({
							title: '车次不存在',
							icon: 'error'
						});
						return;
					}
				}
				
				// 设置车站列表
				this.stationList = this.timetable.map(item => ({
					stationName: item.stationName,
					isStart: item.isStart,
					isEnd: item.isEnd
				}));
				
				// 设置默认始发站和终点站
				if (this.stationList.length > 0) {
					this.selectedFromStation = this.stationList[0].stationName;
					if (this.stationList.length > 1) {
						this.selectedToStation = this.stationList[this.stationList.length - 1].stationName;
					}
				}
				
			} catch (error) {
				console.error("加载车次信息失败", error);
				uni.showToast({
					title: '加载车次信息失败',
					icon: 'error'
				});
			} finally {
				this.loading = false;
			}
		},
		dateChange(e) {
			this.selectedDate = e;
		},
		fromStationChange(e) {
			const index = parseInt(e.detail.value);
			this.selectedFromStation = this.stationList[index].stationName;
			
			// 确保终点站在始发站之后
			const fromIndex = this.stationList.findIndex(s => s.stationName === this.selectedFromStation);
			const toIndex = this.stationList.findIndex(s => s.stationName === this.selectedToStation);
			
			// 如果当前终点站不在始发站之后，则将终点站设为始发站之后的第一个站
			if (toIndex <= fromIndex && this.toStationList.length > 0) {
				this.selectedToStation = this.toStationList[0].stationName;
			}
		},
		toStationChange(e) {
			const index = parseInt(e.detail.value);
			this.selectedToStation = this.toStationList[index].stationName;
		},
		validateRoute() {
			// 验证始发站必须在终点站之前
			const fromIndex = this.stationList.findIndex(s => s.stationName === this.selectedFromStation);
			const toIndex = this.stationList.findIndex(s => s.stationName === this.selectedToStation);
			
			this.isValidRoute = this.selectedFromStation && this.selectedToStation && 
				this.selectedFromStation !== this.selectedToStation && fromIndex < toIndex;
		},
		async addRoute() {
			if (this.loading) {
				return; // 如果还在加载数据，不允许添加
			}
			
			// 再次验证路线是否有效
			const fromIndex = this.stationList.findIndex(s => s.stationName === this.selectedFromStation);
			const toIndex = this.stationList.findIndex(s => s.stationName === this.selectedToStation);
			
			if (!this.selectedFromStation || !this.selectedToStation || fromIndex >= toIndex) {
				uni.showToast({
					title: '请选择正确的区间（始发站必须在终点站之前）',
					icon: 'none'
				});
				return;
			}
			
			// 创建行程数据
			const routeData = {
				trainNum: this.trainNum,
				numberKind: this.trainNum.charAt(0),
				from: this.from,
				to: this.to,
				date: this.selectedDate,
				seat: this.seat,
				fromStation: this.selectedFromStation,
				toStation: this.selectedToStation,
				bureauName: this.bureauName,
				car: this.car,
				runner: this.runner,
				timetable: this.timetable // 保存完整的时刻表
			};
			
			// 保存到存储 - 使用JSON文件方式
			// #ifdef H5
			let routes = [];
			const routesData = uni.getStorageSync('myRoutes') || '[]';
			routes = JSON.parse(routesData);
			routes.push(routeData);
			uni.setStorageSync('myRoutes', JSON.stringify(routes));
			// #endif
			
			// #ifdef APP-PLUS
			// 直接使用本地存储保存JSON数据
			let routes = [];
			const routesData = plus.storage.getItem('myRoutes') || '[]';
			try {
				routes = JSON.parse(routesData);
			} catch (e) {
				console.error('解析行程数据失败:', e);
				routes = [];
			}
			routes.push(routeData);
			plus.storage.setItem('myRoutes', JSON.stringify(routes));
			// #endif
			
			uni.showToast({
				title: '行程已添加',
				icon: 'success'
			});
			
			// 延迟返回，让用户看到成功提示
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		}
	}
}
</script>

<style>
	.ux-button-primary {
		background-color: #114598;
		color: #ffffff;
		font-size: 32rpx;
		margin-top: 60rpx;
	}
</style>