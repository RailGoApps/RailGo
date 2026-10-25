<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<back-header></back-header>

		<view class="ux-padding" style="padding-top: 0px;">
			<text class="ux-h2">调图数据查询</text>
		</view>

		<view class="ux-padding">
			<!-- 头部卡片骨架屏 -->
			<view v-if="loading" class="ux-bg-white ux-border-radius sk-header">
				<view class="sk-row sk-header-top" style="justify-content: space-between;">
					<view>
						<skeleton w="180rpx" h="40rpx" />
						<skeleton w="240rpx" h="22rpx" mt="16rpx" />
					</view>
					<skeleton w="120rpx" h="24rpx" mt="16rpx" mr="0" />
				</view>
				<view class="sk-header-bar">
					<skeleton w="100%" h="100%" radius="0" mr="0" tone="dark" />
				</view>
			</view>

			<view v-else class="ux-bg-white ux-border-radius">
				<view class="ux-pl ux-pr ux-pb-small ux-pt ux-flex ux-align-items-center ux-justify-content-center">
					<view>
						<view class="ux-mr-small ux-text-right">
							<br>
						</view>
					</view>
					<view>
						<text class="ux-h3">{{stationName || '未知'}}站</text><br>
						<text class="ux-text-small">{{stationCode || '未知'}} · {{dateText}}</text>
					</view>
				</view>
				<view class="ux-flex ux-space-between ux-color-white ux-pt-small ux-pb-small ux-pl ux-pr ux-text-small"
					style="border-bottom-left-radius:10rpx;border-bottom-right-radius:10rpx;background-color:#114598;">
					<text></text>
					<text>共 {{trains.length}} 趟经停列车</text>
				</view>
			</view>

			<view class="ux-pt">
				<!-- 车次列表骨架屏 -->
				<view v-if="loading" class="sk-list">
					<view v-for="i in 5" :key="i" class="sk-train">
						<skeleton w="12rpx" h="104rpx" radius="10rpx 0 0 10rpx" mr="20rpx" />
						<view style="flex:1;">
							<skeleton w="45%" h="36rpx" />
							<skeleton w="65%" h="22rpx" mt="16rpx" />
						</view>
						<view class="sk-row">
							<skeleton w="64rpx" h="26rpx" mr="16rpx" mt="4rpx" />
							<skeleton w="64rpx" h="26rpx" mr="16rpx" mt="4rpx" />
							<skeleton w="44rpx" h="26rpx" mr="0" mt="4rpx" />
						</view>
					</view>
				</view>

				<view v-else-if="trains.length > 0">
					<view class="ux-mt-small">
						<text class="ux-text-small ux-opacity-5">共查询到 {{trains.length}} 个车次</text>
						<br>
					</view>
					<view v-for="(item, index) in trains" :key="item.key"
						class="ux-bg-white ux-border-radius ux-mt-small ux-flex">
						<view style="border-bottom-left-radius: 10rpx; border-top-left-radius:10rpx;"
							:style="'background-color:'+item.barColor">
							&nbsp;&nbsp;
						</view>
						<view class="ux-flex ux-align-items-center ux-pr ux-pt ux-pb ux-pl-small"
							style="width:100%;">
							<view style="width:100%;">
								<view class="ux-flex ux-space-between">
									<view>
										<text class="consolas" style="font-size:40rpx;">{{item.trainCode}}</text>
										<br>
										<text class="ux-text-small">{{item.startStationName}} ⋙ {{item.endStationName}}</text>
									</view>
									<view class="ux-flex" style="padding-top:8rpx;">
										<view class="ux-text-center ux-mr-small" style="min-width:80rpx">
											<text class="ux-text">{{item.arriveTime}}</text>
											<br>
											<text class="ux-text-small ux-opacity-5">到达</text>
										</view>
										<view class="ux-text-center ux-mr-small" style="min-width:80rpx">
											<text class="ux-text">{{item.departTime}}</text>
											<br>
											<text class="ux-text-small ux-opacity-5">出发</text>
										</view>
										<view class="ux-text-center" style="min-width:80rpx">
											<text class="ux-text">{{item.stopTime}}</text>
											<br>
											<text class="ux-text-small ux-opacity-5">停车</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view v-else>
					<view class="ux-padding ux-text-center">{{errorMsg || '该站所选日期暂无调图数据'}}</view>
				</view>

				<br>
				<view class="ux-text-center ux-padding-small ux-mb ux-h6"
					style="background-color:#e9eef5;border:1px solid #114598;border-radius:10rpx;color:#114598;">
					<text class="ux-bold">信息仅供参考 请以铁路运营企业实际运用为准</text>
				</view>
				<br>
				<view class="ux-flex ux-row ux-justify-content-center">
					<text class="ux-text-small ux-opacity-4">—— 数据来源: 12306 WiFi ——</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { uniGet } from "@/scripts/req";
	import { TRAIN_KIND_COLOR_MAP } from "@/scripts/config.js";

	export default {
		data() {
			return {
				stationCode: "",
				stationName: "",
				date: "",
				trains: [],
				loading: true,
				errorMsg: "",
				colorMap: TRAIN_KIND_COLOR_MAP
			}
		},
		computed: {
			dateText() {
				if (!this.date) return '未知';
				if (/^\d{8}$/.test(this.date)) {
					return this.date.slice(0, 4) + '-' + this.date.slice(4, 6) + '-' + this.date.slice(6, 8);
				}
				return this.date;
			}
		},
		onLoad(options) {
			this.stationCode = (options.stationCode || '').toUpperCase();
			this.stationName = options.stationName ? decodeURIComponent(options.stationName) : '';
			this.date = options.date || '';
			this.fillInData();
		},
		methods: {
			fillInData: async function() {
				if (!this.stationCode || !this.date) {
					this.errorMsg = '缺少车站或日期参数';
					this.loading = false;
					return;
				}
				try {
					const base = uni.getStorageSync('service_source_tiaotu') || 'https://next.railgo.zenglingkun.cn';
					const resp = await uniGet(base + '/api/v2/queryTiaotuByStation', {
						params: {
							stationCode: this.stationCode,
							date: this.date
						}
					});
					const result = resp.data || {};
					if (result.success !== true) {
						this.errorMsg = result.msg || '调图数据加载失败';
						this.trains = [];
						return;
					}
					const list = result.data && Array.isArray(result.data.data) ? result.data.data : [];
					this.trains = list.map((item, index) => this.normalize(item, index)).sort((a, b) => {
						const timeA = a.sortTime;
						const timeB = b.sortTime;
						return timeA.localeCompare(timeB);
					});
					if (!this.stationName && list.length > 0 && list[0].stationName) {
						this.stationName = list[0].stationName;
					}
				} catch (error) {
					console.error("调图数据加载失败", error);
					this.errorMsg = '调图数据加载失败';
					this.trains = [];
				} finally {
					this.loading = false;
				}
			},
			normalize: function(item, index) {
				const trainCode = (item.trainCode || '').toUpperCase();
				const arriveTime = item.arriveTime || '未知';
				const departTime = item.departTime || '未知';
				const sortTime = departTime !== '未知' ? departTime : (arriveTime !== '未知' ? arriveTime : '99:99');
				return {
					key: (item.trainNo || trainCode || 'train') + '_' + index,
					trainCode: trainCode || '未知',
					startStationName: item.startStationName || '未知',
					endStationName: item.endStationName || '未知',
					arriveTime: arriveTime,
					departTime: departTime,
					stopTime: this.calcStopTime(item.arriveTime, item.departTime),
					sortTime: sortTime,
					barColor: this.colorMap[trainCode.charAt(0)] || '#a9dfbf'
				};
			},
			calcStopTime: function(arrive, depart) {
				const toMin = t => {
					if (!t || String(t).indexOf(':') < 0) return -1;
					const p = String(t).split(':');
					const h = parseInt(p[0], 10);
					const m = parseInt(p[1], 10);
					if (isNaN(h) || isNaN(m)) return -1;
					return h * 60 + m;
				};
				const a = toMin(arrive);
				const d = toMin(depart);
				// 始发/终到车次上游常把到发时间填成同一个值，此时无法判断真实停时
				if (a < 0 || d < 0 || a === d) return '未知';
				return String((d - a + 1440) % 1440);
			}
		}
	}
</script>

<style>
	.sk-list {
		display: flex;
		flex-direction: column;
	}
	.sk-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.sk-header {
		overflow: hidden;
		margin-bottom: 24rpx;
	}
	.sk-header-top {
		padding: 30rpx 24rpx 26rpx;
	}
	.sk-header-bar {
		width: 100%;
		height: 52rpx;
	}
	.sk-train {
		display: flex;
		flex-direction: row;
		align-items: center;
		background-color: #ffffff;
		border-radius: 10rpx;
		padding: 16rpx;
		margin-top: 20rpx;
	}
</style>
