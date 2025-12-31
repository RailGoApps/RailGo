<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<view class="ux-bg-primary" style="height:  var(--status-bar-height);">&nbsp;</view>

		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">车次查询</text>
			<br><br>
			<text class="ux-text-small ux-opacity-5">共查询到 {{this.showData.length}} 个车次</text>
			<view v-if="isVague" class="ux-text-small ux-opacity-5 ux-color-primary ux-mt-small">
				<text class="icon">&#xe88e;</text>&nbsp;当前查询结果包含同城所有车站间的列车
			</view>
		</view>
		<view class="ux-pl ux-pr ux-pb">
			<view class="ux-padding-small ux-h6 ux-text-center"
				style="background-color:#e9eef5;border:1px solid #114598;border-radius:10rpx;color:#114598;">
				<text class="ux-bold">信息仅供参考 请以铁路运营企业实际运用为准</text>
			</view>
			<br>
			<view class="ux-flex">
				<button class="ux-flex1 ux-mr-small ux-bg-primary ux-color-white" size="mini" @click="openSortMenu()">
					<view class="ux-flex ux-align-items-center ux-justify-content-center">
						<text class="icon">&#xe164;</text>&nbsp;排序
					</view>
				</button>
				<button class="ux-flex1 ux-ml-small ux-bg-primary ux-color-white" size="mini" @click="openFilterMenu()">
					<view class="ux-flex ux-align-items-center ux-justify-content-center">
						<text class="icon">&#xe06d;</text>&nbsp;筛选
					</view>
				</button>
			</view>
			<br>
			<navigator v-for="(item, index) in this.showData" :key="index"
				:url="'/pages/train/trainResult?keyword='+item.number+'&date='+this.date">
				<view class="ux-bg-white ux-border-radius ux-mb-small ux-flex">
					<view style="border-bottom-left-radius: 10rpx; border-top-left-radius:10rpx;"
						:style="'background-color:'+this.colorMap[item.number[0]]">
						&nbsp;&nbsp;
					</view>
					<view class="ux-flex ux-align-items-center ux-space-between ux-pr ux-pt ux-pb ux-pl-small"
						style="width:100%;">
						<view>
							<text class="consolas" style="font-size:45rpx;">
								{{item.timetable[item.fromPos].depart}}
							</text>
							<br>
							<text class="ux-text-small">
								{{item.timetable[item.fromPos].station}}
							</text>
						</view>
						<view class="ux-text-center">
							<view class="ux-flex ux-align-items-center ux-justify-content-center">
								<text class="consolas" style="font-size:40rpx;">
									{{item.numberKind + item.numberFull.join("/").replace(item.numberKind, "").replace(item.numberKind, "")}}
								</text>
								<view v-if="getFuxingColor(item.car)" 
									:style="{backgroundColor: getFuxingColor(item.car)}"
									style="width: 32rpx; height: 32rpx; line-height: 32rpx; border-radius: 4rpx; margin-left: 8rpx; display: flex; align-items: center; justify-content: center;">
									<text style="color: white; font-size: 20rpx; font-weight: bold;">复</text>
								</view>
								<view v-if="isSmartTrain(item.car)" 
									style="background-color: #FFD700; width: 32rpx; height: 32rpx; line-height: 32rpx; border-radius: 4rpx; margin-left: 4rpx; display: flex; align-items: center; justify-content: center;">
									<text style="color: #432c00; font-size: 20rpx; font-weight: bold;">智</text>
								</view>
							</view>
							<view style="border-top: 0.1rpx solid #757575;width:30vw;margin: 5rpx 0;"></view>
							
							<view class="ux-flex ux-justify-content-center ux-align-items-center ux-opacity-5">
								<text class="ux-text-small">{{item.passTime}}</text>
								<text v-if="item.car" class="consolas ux-ml-small ux-opacity-9" style="font-size: 24rpx;">{{item.car}}</text>
							</view>
						</view>
						<view>
							<view class="ux-flex ux-align-items-start">
								<text class="consolas" style="font-size:45rpx;">
									{{item.timetable[item.toPos].arrive}}
								</text>
								<text v-if="item.timetable[item.toPos].day - item.timetable[item.fromPos].day!=0"
									style="font-size:20rpx">
									+{{item.timetable[item.toPos].day - item.timetable[item.fromPos].day}}
								</text>
							</view>
							<text class="ux-text-small">
								{{item.timetable[item.toPos].station}}
							</text>
						</view>
					</view>
				</view>
			</navigator>
			<br>
			<view class="ux-flex ux-row ux-justify-content-center">
				<text class="ux-text-small ux-opacity-4">—— 数据来源: RailGo.Parser ——</text>
			</view>
		</view>
	</view>
	<uni-popup ref="error_noky" border-radius="10rpx 10rpx 0 0">
		<uni-popup-dialog title="未查询到符合条件的车次" content="发站或到站中有车站不办理客运业务或无列车停靠。" @close="back"
			@confirm="back"></uni-popup-dialog>
	</uni-popup>
	<uni-popup ref="error_nosuch" border-radius="10rpx 10rpx 0 0">
		<uni-popup-dialog title="未查询到符合条件的车次" content="两站间在选定日期不存在直达列车。" @close="back"
			@confirm="back"></uni-popup-dialog>
	</uni-popup>
	<uni-popup ref="menu_sort" border-radius="10rpx 10rpx 0 0">
		<view class="popup-content">
			<view class="ux-bg-white ux-padding ux-border-radius" style="width:70vw;">
				<text class="ux-h4">车次排序</text>
				<br>
				<radio-group class="ux-mt-small" @change="radioSortChange">
					<radio color="#114598" value="departure" class="ux-mr ux-mt-small"
						:checked="this.sortState=='departure'">
						<text class="ux-text-small">按发车时间</text>
					</radio>
					<br>
					<radio color="#114598" value="arrival" class="ux-mr ux-mt-small"
						:checked="this.sortState=='arrival'">
						<text class="ux-text-small">按到达时间</text>
					</radio>
					<br>
					<radio color="#114598" value="speed" class="ux-mr ux-mt-small" :checked="this.sortState=='speed'">
						<text class="ux-text-small">按速度</text>
					</radio>
				</radio-group>
			</view>
		</view>
	</uni-popup>
	<uni-popup ref="menu_filter" border-radius="10rpx 10rpx 0 0">
		<view class="popup-content">
			<view class="ux-bg-white ux-padding ux-border-radius" style="width:70vw;">
				<text class="ux-h4">车次筛选</text>
				<br>
				<checkbox-group class="ux-mt-small" @change="radioFilterChange">
					<view class="ux-flex ux-space-between">
						<checkbox color="#114598" value="G" class="ux-mr ux-mt-small"
							:checked="this.filterTypeState.includes('G')">
							<text class="ux-text-small">高速</text>
						</checkbox>
						<checkbox color="#114598" value="D" class="ux-mr ux-mt-small"
							:checked="this.filterTypeState.includes('D')">
							<text class="ux-text-small">动车</text>
						</checkbox>
						<checkbox color="#114598" value="C" class="ux-mr ux-mt-small"
							:checked="this.filterTypeState.includes('C')">
							<text class="ux-text-small">城际</text>
						</checkbox>
					</view>
					<view class="ux-flex ux-space-between">
						<checkbox color="#114598" value="Z" class="ux-mr ux-mt-small"
							:checked="this.filterTypeState.includes('Z')">
							<text class="ux-text-small">直达</text>
						</checkbox>
						<checkbox color="#114598" value="T" class="ux-mr ux-mt-small"
							:checked="this.filterTypeState.includes('T')">
							<text class="ux-text-small">特快</text>
						</checkbox>
						<checkbox color="#114598" value="K" class="ux-mr ux-mt-small"
							:checked="this.filterTypeState.includes('K')">
							<text class="ux-text-small">快速</text>
						</checkbox>
					</view>
					<view class="ux-flex ux-space-between">
						<checkbox color="#114598" value="12345678" class="ux-mr ux-mt-small"
							:checked="this.filterTypeState.includes('1')">
							<text class="ux-text-small">普客</text>
						</checkbox>
						<checkbox color="#114598" value="S" class="ux-mr ux-mt-small"
							:checked="this.filterTypeState.includes('S')">
							<text class="ux-text-small">市域</text>
						</checkbox>
						<checkbox color="#114598" value="LY" class="ux-mr ux-mt-small"
							:checked="this.filterTypeState.includes('L')">
							<text class="ux-text-small">其他</text>
						</checkbox>
					</view>
				</checkbox-group>
			</view>
		</view>
	</uni-popup>
</template>

<script>
	import { queryMainKey } from "@/scripts/jsonDB.js";
	import { doQuery } from "@/scripts/sqlite.js";
	import { toRaw } from "@vue/reactivity";
	import { KEYS_STRUCT_STATIONS, KEYS_STRUCT_TRAINS, TRAIN_KIND_COLOR_MAP } from "@/scripts/config.js";
	import { uniGet } from "@/scripts/req";

	export default {
		data() {
			return {
				"keyword": "",
				"date": "",
				"from": "",
				"to": "",
				"data": [],
				"showData": [],
				"colorMap": TRAIN_KIND_COLOR_MAP,
				"sortState": "departure",
				"filterTypeState": "GDCZTK12345678SLY",
				"isVague": false 
			}
		},
		onLoad(options) {
			this.from = options.from;
			this.to = options.to;
			this.date = options.date;
			this.isVague = options.city === 'true'; 
			const c = uni.getStorageSync("search");
			uni.setStorage({ key: 'search', data: c + 1 });
			this.fillInData();
		},
		onShow() {
			// #ifdef APP
			plus.navigator.setStatusBarBackground('#114598');
			// #endif
		},
		methods: {
			back: function() { uni.navigateBack() },
			getFuxingColor: function(car) {
				if (!car) return null;
				const match = car.match(/^CR(\d+)/);
				if (!match) return null;
				const num = parseInt(match[1]);
				if (num === 400 || num === 450) return '#e53935';
				if (num === 300 || num === 350) return '#fb8c00';
				if (num === 200 || num === 250) return '#43a047';
				return '#fbc02d';
			},
			isSmartTrain: function(car) {
				if (!car) return false;
				const smartModels = [
					'CR400AF-S', 'CR400AF-Z', 'CR400AF-AS', 'CR400AF-AE', 
					'CR400AF-BS', 'CR400BF-BS', 'CR400BF-S'
				];
				return smartModels.some(model => car.includes(model));
			},
			fillInData: async function() {
				const mode = uni.getStorageSync("mode");
				if (mode == "network") {
					try {
						uni.showLoading({ title: "加载中" });
						let apiUrl = `https://data.railgo.zenglingkun.cn/api/train/sts_query?from=${this.from}&to=${this.to}&date=${this.date}`;
						if (this.isVague) apiUrl += "&city=true";
						const resp = await uniGet(apiUrl);
						if (resp.data.error) {
							uni.hideLoading();
							this.$refs.error_noky.open();
							return;
						}
						this.data = resp.data;
						this.showData = this.data;
						this.radioSortChange({ detail: { value: "departure" } });
						uni.hideLoading();
					} catch (e) { uni.hideLoading(); }
				} else {
					try {
						uni.showLoading({ title: "加载中" });
						let fromStn = toRaw(await doQuery("SELECT trainList FROM stations WHERE telecode='" + this.from + "'", ["trainList"]))[0];
						let toStn = toRaw(await doQuery("SELECT trainList FROM stations WHERE telecode='" + this.to + "'", ["trainList"]))[0];
						if (!fromStn || !toStn) { uni.hideLoading(); this.$refs.error_noky.open(); return; }
						let all = toRaw(await doQuery(
							"SELECT code, number, numberFull, numberKind, timetable, rundays, car FROM trains WHERE number IN ('" +
							fromStn.trainList.filter(i => toStn.trainList.includes(i)).join("','") + "')", 
							["code", "number", "numberFull", "numberKind", "timetable", "rundays", "car"]
						));
						all.forEach((k) => {
							let fromPos = -1; let toPos = -1;
							if (!k.rundays.includes(this.date)) return;
							for (let i = 0; i < k.timetable.length; i++) {
								if (k.timetable[i].stationTelecode == this.from) fromPos = i;
								if (k.timetable[i].stationTelecode == this.to) { toPos = i; break; }
							}
							if (fromPos != -1 && toPos != -1) {
								k.fromPos = fromPos; k.toPos = toPos;
								k.passTime = this.calculateTimeDifference(k.timetable[k.fromPos].depart, k.timetable[k.toPos].arrive, k.timetable[k.toPos].day - k.timetable[k.fromPos].day);
								this.data.push(k);
							}
						});
						this.showData = this.data;
						this.radioSortChange({ detail: { value: "departure" } });
						uni.hideLoading();
					} catch (e) { uni.hideLoading(); }
				}
			},
			calculateTimeDifference: function(startTime, endTime, daysLater) {
				const [sH, sM] = startTime.split(':').map(Number);
				const [eH, eM] = endTime.split(':').map(Number);
				let diff = (eH * 60 + eM + (daysLater * 1440)) - (sH * 60 + sM);
				return `${Math.floor(diff / 60)}h${(diff % 60).toString().padStart(2, '0')}m`;
			},
			openSortMenu: function() { this.$refs.menu_sort.open(); },
			openFilterMenu: function() { this.$refs.menu_filter.open(); },
			radioSortChange: function(e) {
				this.sortState = e.detail.value;
				if (this.sortState === "speed") {
					this.showData = this.data.sort((a, b) => a.passTime > b.passTime ? 1 : -1);
				} else if (this.sortState === "departure") {
					this.showData = this.data.sort((a, b) => a.timetable[a.fromPos].depart > b.timetable[b.fromPos].depart ? 1 : -1);
				} else if (this.sortState === "arrival") {
					this.showData = this.data.sort((a, b) => {
						const aT = this.timeToMinutes(a.timetable[a.toPos].arrive) + (a.timetable[a.toPos].day * 1440);
						const bT = this.timeToMinutes(b.timetable[b.toPos].arrive) + (b.timetable[b.toPos].day * 1440);
						return aT - bT;
					});
				}
				if(this.$refs.menu_sort) this.$refs.menu_sort.close();
			},
			timeToMinutes: function(t) {
				const [h, m] = t.split(':').map(Number);
				return h * 60 + m;
			},
			radioFilterChange: function(e) {
				this.filterTypeState = e.detail.value.join("");
				this.showData = this.data.filter(i => e.detail.value.includes(i.number.charAt(0)));
			}
		}
	}
</script>