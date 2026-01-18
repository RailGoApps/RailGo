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
							:style="'color:'+cardColor">{{carData.numberKind || ''}}</text>
						<text class="consolas"
							style="font-size:50rpx;padding-left:5rpx;">{{(carData.numberFull || []).join("/").replace(carData.numberKind, "").replace(carData.numberKind, "")}}</text>
					</view>
					<text class="ux-badge ux-text-small ux-color-white" style="padding:5rpx 15rpx;"
						:style="'background-color:'+cardColor">{{carData.type || ''}}</text>
				</view>
				<view class="ux-flex ux-space-between ux-mt-small ux-pl ux-pr ux-pt-small ux-color-white"
					:style="'background-color:'+cardColor">
					<text
						class="ux-text-small">{{(carData.timetable && carData.timetable[0] ? carData.timetable[0].station : '')}}
						⋙
						{{(carData.timetable && carData.timetable.length > 0 ? carData.timetable[carData.timetable.length-1].station : '')}}</text>
					<text class="ux-text-small">{{carData.bureauName || ''}}{{carData.runner || ''}}&nbsp;&nbsp;</text>
				</view>
				<view class="ux-pb-small" style="border-bottom-left-radius:10rpx; border-bottom-right-radius:10rpx;"
					:style="'background-color:'+cardColor">
				</view>
			</view>
			<br>
			<view class="ux-padding-small ux-h6 ux-text-center"
				style="background-color:#e9eef5;border:1px solid #114598;border-radius:10rpx;color:#114598;">
				<text class="ux-bold">信息仅供参考 请以铁路运营企业实际运用为准</text>
			</view>
			<view v-if="carData.rundays && !carData.rundays.includes(date)">
				<view class="ux-padding-small ux-h6 ux-text-center ux-mt-small"
					style="background-color:#f8eceb;border:1px solid #c0392b;border-radius:10rpx;color:#c0392b;">
					<text class="ux-bold">此车次在选定日期计划不开行 请注意核对信息</text>
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
					<uni-tr v-for="(item,index) in (carData.timetable || [])" :key="index" style="border:none"
						hover-class="ux-bg-grey5">
						<uni-td style="border:none">
							<image style="width:1px;height:1px;transform:translateY(-5px) scale(40)" mode="aspectFit"
								src="@/static/station-mark-stop.png"></image>
						</uni-td>
						<uni-td style="border:none">
							<navigator
								:url="'/pages/station/result?keyword='+(item.stationTelecode || '')+'&vague=false'">
								{{item.station || ''}}
							</navigator>
						</uni-td>
						<uni-td style="border:none">{{item.trainCode || ''}}</uni-td>
						<uni-td style="border:none">{{item.arrive || ''}}</uni-td>
						<uni-td style="border:none">{{item.depart || ''}}</uni-td>
						<uni-td style="border:none">{{item.distance || '0'}} km</uni-td>
						<uni-td style="border:none">{{item.speed ? item.speed.toFixed(1) : '-'}} km/h</uni-td>
						<uni-td style="border:none">{{item.day || '当'}}日</uni-td>
						</uni-tr>
				</uni-table>

				<uni-section title="正晚点" type="line" style="background-color: transparent;"
					title-font-size="28rpx"></uni-section>

				<view v-if="showLoadAllButton" class="ux-pb-small">
					<button @click="loadAllPlatforms" type="primary" size="mini"
						style="margin: 0; padding: 0 15px; font-size: 14px; line-height: 30px;">
						一键全部加载停台信息 (共{{carData.timetable.length}}站)
					</button>
				</view>

				<uni-table style="border:none">
					<uni-tr style="border:none">
						<uni-th style="border:none" align="center">车站</uni-th>
						<uni-th style="border:none" align="center">状态</uni-th>
						<uni-th style="border:none" align="center">预计到达<br>发车</uni-th>
						<uni-th style="border:none" align="center">实际到达<br>发车</uni-th>
						<uni-th style="border:none" align="center">停站</uni-th>
						<uni-th style="border:none" align="center">日期</uni-th>
						<uni-th style="border:none" width="60" align="center">停台</uni-th>
						<uni-th style="border:none" width="80" align="center">检票口</uni-th>
					</uni-tr>
					<uni-tr v-for="(item,index) in combinedDelayData" :key="index" style="border:none" hover-class="ux-bg-grey5">
						<uni-td style="border:none" align="center">
							<view class="ux-flex ux-align-items-center ux-justify-content-center">
								<text>{{item.stationName || ''}}</text>
							</view>
						</uni-td>
						<uni-td style="border:none" align="center"
							:style="getDelayStatusColor(item.delayMinutes, item.status)">
							{{formatDelayStatus(item.delayMinutes, item.status)}}
						</uni-td>
						<uni-td style="border:none" align="center">{{item.arrivalTime || '-'}}<br>{{item.departureTime ||
							'-'}}</uni-td>
						<uni-td style="border:none" align="center">
							{{calculateActualTime(item.arrivalTime, item.delayMinutes, item.status)}}
							<br>
							{{calculateActualTime(item.departureTime, item.delayMinutes, item.status)}}
						</uni-td>
						<uni-td style="border:none" align="center">{{item.stopMinutes === null || item.stopMinutes ===
							undefined ? '-' : item.stopMinutes + "'"}}</uni-td>
						<uni-td style="border:none" align="center">{{item.arrivalDate || ''}}</uni-td>
						
						<uni-td style="border:none" align="center">
							<view v-if="item.platform">{{item.platform}}</view>
							<button v-else-if="item.platform === null && showLoadAllButton" 
								@click="loadPlatformByStationName(item.stationName)" 
								size="mini" type="primary" 
								style="margin: 0; padding: 0 5px; font-size: 10px; line-height: 20px;">
								查询
							</button>
							<view v-else>-</view>
						</uni-td>
						<uni-td style="border:none" align="center">
							<view v-if="item.wicket">{{item.wicket}}</view>
							<view v-else>-</view>
						</uni-td>
					</uni-tr>
					<uni-tr v-if="delay.length === 0" style="border:none">
						<uni-td style="border:none" colspan="8" align="center" v-if="isOnlyOfflineMode == false"> 暂无正晚点信息或加载失败
						</uni-td>
						<uni-td style="border:none" colspan="8" align="center" class="ux-color-gray"
							v-if="isOnlyOfflineMode">
							仅离线模式下无法使用该功能
						</uni-td>
					</uni-tr>
				</uni-table>
			</view>

			<view v-if="selectIndex==1">
				<uni-section title="担当" type="line" style="background-color: transparent;"
					title-font-size="28rpx"></uni-section>
				<view class="ux-bg-white ux-border-radius"
					v-if="(carData.carOwner || '')+(carData.runner || '')+(carData.car || '')!=''">

					<view v-if="carData.car, ['G','D','C','S'].includes(carData.numberKind)">
						<view class="ux-flex ux-justify-content-center">
							<image v-if="carImageUrl" :src="carImageUrl" @error="onImageError" mode="widthFix"
								style="width:100%; height: auto; border-top-left-radius: 10rpx; border-top-right-radius: 10rpx; border-bottom-left-radius: 0; border-bottom-right-radius: 0;"></image>
						</view>
						<view v-if="carImageUrl" class="ux-flex ux-space-between ux-pt-small ux-pb-small ux-pl ux-pr ux-color-white"
							:style="'background-color:'+cardColor" style="border-bottom-left-radius: 10rpx; border-bottom-right-radius: 10rpx;">
							<text class="ux-text-small ux-bold">
								{{carData.car || ''}}
							</text>
							<text class="ux-text-small ux-opacity-8">
								图源：{{ imageUploaderUsername }}
							</text>
						</view>
					</view>
					<view class="ux-padding">
		
						<view class="ux-flex ux-space-between" v-if="carData.runner || carData.carOwner">
							<view class="ux-flex ux-align-items-center" v-if="carData.runner">
								<text class="ux-color-primary icon" style="font-size:60rpx;">&#xe7fd;</text>
								<view class="ux-pl-small">
									<text class="ux-text-small ux-opacity-5">值乘单位</text><br>
									<text>{{carData.runner || ''}}</text>
								</view>
							</view>
							
							<view class="ux-flex ux-align-items-center" v-if="carData.carOwner">
								<text class="ux-color-primary icon" style="font-size:60rpx;">&#xe570;</text>
								<view class="ux-pl-small">
									<text class="ux-text-small ux-opacity-5">车辆归属</text><br>
									<text>{{carData.carOwner || ''}}</text>
								</view>
							</view>
							
							<view class="ux-flex ux-align-items-center" v-if="carData.car, !['G','D','C','S'].includes(carData.numberKind)">
								<text class="ux-color-primary icon" style="font-size:60rpx;">&#xe570;</text>
								<view class="ux-pl-small">
									<text class="ux-text-small ux-opacity-5">车型</text><br>
									<text>{{carData.car || ''}}</text>
								</view>
							</view>
						</view>

						<uv-divider v-if="(carData.carOwner || '')+(carData.runner || '')!='',['G','D','C','S'].includes(carData.numberKind)" />

						<view v-if="carData.car, ['G','D','C','S'].includes(carData.numberKind)" class="ux-mt-normal">
							
							<view class="ux-flex ux-flex-wrap ux-space-between">
								<view class="ux-flex ux-align-items-center ux-mb-small" style="width: 48%;">
									<text class="ux-color-primary icon" style="font-size:50rpx;">&#xe642;</text>
									<view class="ux-pl-small ux-text-small">
										<text class="ux-opacity-5">编组</text><br/>
										<text>{{carMap[carData.car.replace(" 重联","")] ? carMap[carData.car.replace(" 重联","")][0] : '-'}}节</text>&thinsp;
										<text>{{carMap[carData.car.replace(" 重联","")] ? carMap[carData.car.replace(" 重联","")][1] : '-'}}</text>
									</view>
								</view>
								
								<view class="ux-flex ux-align-items-center ux-mb-small" style="width: 48%;">
									<text class="ux-color-primary icon" style="font-size:50rpx;">&#xe569;</text>
									<view class="ux-pl-small ux-text-small">
										<text class="ux-opacity-5">速度</text><br/>
										<text>{{carMap[carData.car.replace(" 重联","")] ? carMap[carData.car.replace(" 重联","")][3] : '-'}}km/h</text>
									</view>
								</view>

								
								<view class="ux-flex ux-align-items-center ux-mb-small" style="width: 48%;">
									<text class="ux-color-primary icon" style="font-size:50rpx;">&#xe556;</text>
									<view class="ux-pl-small ux-text-small">
										<text class="ux-opacity-5">餐车</text><br/>
										<text>{{carMap[carData.car.replace(" 重联","")] ? carMap[carData.car.replace(" 重联","")][2] : '-'}}</text>
									</view>
								</view>
							</view>

							<view v-if="['G','D','C'].includes(carData.numberKind)">
							    <br>
							    <view class="ux-flex ux-align-items-center">
							        
							        <navigator :url="'/pages/emu/result?keyword='+train" style="flex: 1; margin-right: 10rpx;">
							            <button class="ux-color-white ux-bg-primary" size="mini" style="width:100%;">
							                <view class="ux-flex ux-align-items-center ux-justify-content-center">
							                    <text class="icon" style="font-size: 24rpx;">&#xe570;</text>
							                    <text style="margin-left: 8rpx;">查询担当</text>
							                </view>
							            </button>
							        </navigator>
							
							        <navigator :url="'/pages/train/TrainPics?train='+train" style="flex: 1; margin-left: 10rpx;">
							            <button class="ux-color-white ux-bg-primary" size="mini" style="width:100%;">
							                <view class="ux-flex ux-align-items-center ux-justify-content-center">
							                    <text class="icon" style="font-size: 24rpx;">&#xe570;</text>
							                    <text style="margin-left: 8rpx;">座位图</text>
							                </view>
							            </button>
							        </navigator>
							        
							    </view>
							</view>
						</view>
					</view>
				</view>
				<view v-if="(carData.carOwner || '')+(carData.runner || '')+(carData.car || '')==''"
					class="ux-padding ux-text-center">
					暂无担当
				</view>
				<uni-section title="交路" type="line" style="background-color: transparent;"
					title-font-size="28rpx"></uni-section>
				<navigator v-for="(item,index) in (carData.diagram || [])" :key="index"
					:url="'/pages/train/trainResult?keyword='+(item.train_num || item.number)+'&date='+date">
					<view class="ux-bg-white ux-border-radius ux-mt-small ux-flex">
						<view style="border-bottom-left-radius: 10rpx; border-top-left-radius:10rpx;"
							:style="'background-color:'+colorMap[(item.train_num || item.number)[0]]">
							&nbsp;&nbsp;
						</view>
						<view class="ux-flex ux-align-items-center ux-space-between ux-pr ux-pt ux-pb ux-pl-small"
							style="width:100%;">
							<view style="width:calc(100% - 70px);">
								<view class="ux-flex ux-align-items-center">
									<text class="consolas" style="font-size:40rpx;">{{item.train_num || item.number || ''}}</text>
								</view>
								<text class="ux-text-small">
									{{Array.isArray(item.from) && item.from.length > 0 ? item.from[0] : ''}}
									{{Array.isArray(item.from) && item.from.length > 1 ? item.from[1] : ''}}
									⋙ 
									{{Array.isArray(item.to) && item.to.length > 0 ? item.to[0] : ''}}
									{{Array.isArray(item.to) && item.to.length > 1 ? item.to[1] : ''}}
								</text>
							</view>
							<text class="ux-text"><text class="icon">&#xe5c8;</text></text>
						</view>
					</view>
				</navigator>
				<view v-if="(carData.diagram || []).length==0" class="ux-padding-large ux-text-center">
					暂无交路
				</view>
				<uni-section title="开行日" type="line" style="background-color: transparent;"
					title-font-size="28rpx"></uni-section>
				<calendar class="ux-bg-white ux-border-radius"
					:highlighted-dates="(()=>{var l=[]; (carData.rundays || []).forEach((i)=>{l.push({date: i.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3'), bgColor: '#114598'});});return l;})()">
				</calendar>
				<view class="ux-flex ux-space-between ux-pt-small">
					<text class="ux-text-small ux-opacity-4">*实际开行请以车站公告为准</text>
					<view class="ux-flex ux-align-items-center ux-nowrap">
						<view class="ux-bg-primary ux-padding-small" style="width:0.2vh;height:0.2vh;"></view>
						<text>&nbsp;当日开行</text>
					</view>
				</view>

			</view>

			<view class="ux-padding ux-text-center" v-if="selectIndex==2">
				<text>暂未开放，敬请期待</text>
			</view>

			<br>
			<view class="ux-flex ux-row ux-justify-content-center">
				<text class="ux-text-small ux-opacity-4">—— · ——</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		queryMainKey
	} from "@/scripts/jsonDB.js";
	import {
		doQuery,
	} from "@/scripts/sqlite.js";
	import {
		KEYS_STRUCT_STATIONS,
		KEYS_STRUCT_TRAINS,
		TRAIN_KIND_COLOR_MAP,
		CAR_PERFORMANCE
	} from "@/scripts/config.js";
	import calendar from "@/components/diagram-calendar/diagram-calendar.vue";
	import {
		toRaw
	} from "@vue/reactivity";
	// 确保从 req.js 导入 uniGet 和 uniPost
	import {
		uniGet,
		uniPost
	} from "@/scripts/req";

	export default {
		components: {
			calendar
		},
		data() {
			return {
				"carData": {
					numberKind: '',
					numberFull: [],
					type: '',
					timetable: [], 
					bureauName: '',
					runner: '',
					carOwner: '',
					car: '',
					rundays: [],
					diagram: [],
				},
				"colorMap": TRAIN_KIND_COLOR_MAP,
				"carMap": CAR_PERFORMANCE,
				"delay": [], 
				"title": '',
				"date": "",
				"train": "",
				"keyword": "",
				"cardColor": "#114598",
				"topTabList": [{
					name: '时刻',
				}, {
					name: '运行',
				}, {
					name: '路径'
				}],
				"selectIndex": 0,
				"isOnlyOfflineMode": false,
				"carImageUrl": "", 
				"defaultImageUrl": "",
				"imageUploaderUsername": "暂缺图片", // NEW: For dynamic image source
				"isImageLoading": true,
				// 停台加载逻辑相关状态
				"platformLoadThreshold": 10, 
				"allPlatformWicketLoaded": false, 
				"showLoadAllButton": false, 
			}
		},
		computed: {
			/**
			 * 结合正晚点数据 (this.delay) 和停台/检票口数据 (this.carData.timetable)
			 */
			combinedDelayData() {
				if (!this.delay || this.delay.length === 0) {
					return this.delay;
				}

				const timetableMap = new Map();
				// 建立车站名到停台/检票口信息的映射
				this.carData.timetable.forEach((item, index) => {
					timetableMap.set(item.station, {
						platform: item.platform,
						wicket: item.wicket,
						// 存储索引，用于单点查询时定位
						index: index, 
					});
				});

				// 合并数据
				return this.delay.map(delayItem => {
					const platformWicketInfo = timetableMap.get(delayItem.stationName);
					if (platformWicketInfo) {
						return {
							...delayItem,
							platform: platformWicketInfo.platform,
							wicket: platformWicketInfo.wicket,
							// 携带索引以便于单点查询
							_index: platformWicketInfo.index
						};
					}
					// 即使找不到匹配，也返回原始 delayItem，但停台/检票口字段为 null
					return {
						...delayItem,
						platform: null,
						wicket: null,
						_index: -1 
					};
				});
			}
		},
		onLoad(options) {
			// 在此统一处理 train_num 和 number
			this.train = options.keyword ? options.keyword.split("/")[0].toUpperCase() : '';
			this.keyword = options.keyword ? options.keyword.toUpperCase() : '';
			this.title = this.train;
			this.date = options.date || '';

			const mode = uni.getStorageSync("mode");
			this.isOnlyOfflineMode = uni.getStorageSync("ol") === true;

			const c = uni.getStorageSync("search");
			uni.setStorage({
				key: 'search',
				data: c + 1
			});
			this.fillInData(mode);
		},
		onShow() {
			// #ifdef APP
			plus.navigator.setStatusBarBackground('#114598');
			// #endif
		},
		methods: {
			back: function() {
				uni.navigateBack()
			},
			/**
			 * 根据车站名触发单个停台查询（用于正晚点表中的“查询”按钮）
			 * @param {string} stationName 车站名称
			 */
			loadPlatformByStationName: function(stationName) {
				// 在 carData.timetable 中找到对应的原始数据和索引
				const targetIndex = this.carData.timetable.findIndex(item => item.station === stationName);
				const targetItem = this.carData.timetable[targetIndex];
				
				if (targetItem && targetIndex !== -1) {
					// 调用核心加载逻辑
					this.loadPlatform(targetItem, targetIndex, false);
				} else {
					uni.showToast({
						title: '无法匹配车站信息',
						icon: 'error'
					});
				}
			},
			/**
			 * 停台查询方法 (单个车站)
			 * @param {object} item 时刻表行数据 (carData.timetable中的元素)
			 * @param {number} index 时刻表行索引
			 * @param {boolean} silent 是否不显示 Toast 提示 (用于批量加载)
			 */
			async loadPlatform(item, index, silent = false) {
				if (!item.stationTelecode || !this.date || !item.trainCode) {
					if (!silent) {
						uni.showToast({
							title: '缺少查询参数',
							icon: 'none'
						});
					}
					return { success: false };
				}

				if (!silent) {
					uni.showLoading({
						title: '获取停台数据'
					});
				}

				// 确定 type 参数：始发站（第一个站，index=0）使用 'D'，其余使用 'A'
				const requestType = index === 0 ? 'D' : 'A';
				let result = { success: false, platform: '查询失败', wicket: '查询失败' };

				try {
					const currentItem = this.carData.timetable[index]; 
					
					const response = await uniPost(
						'https://mobile.12306.cn/wxxcx/wechat/bigScreen/getExit',
						{
							stationCode: item.stationTelecode,
							trainDate: this.date, 
							type: requestType, 
							stationTrainCode: item.trainCode 
						}
					);

					if (response.data && response.data.status === true && response.data.data) {
						result.success = true;
						result.platform = response.data.data.platform || '未知';
						result.wicket = response.data.data.wicket || '未知';
						
						// Success: Update the timetable item (which feeds the computed property)
						this.$set(this.carData.timetable, index, {
							...currentItem,
							platform: result.platform,
							wicket: result.wicket
						});
						
						if (!silent) {
							uni.showToast({
								title: '获取成功',
								icon: 'success'
							});
						}
					} else {
						// Failure 
						if (!silent) {
							uni.showToast({
								title: response.data.errorMsg || '查询失败',
								icon: 'error'
							});
						}
						this.$set(this.carData.timetable, index, {
							...currentItem,
							platform: '查询失败',
							wicket: '查询失败'
						});
					}
				} catch (error) {
					console.error("查询停台数据出错:", error);
					if (!silent) {
						uni.showToast({
							title: '网络请求失败',
							icon: 'error'
						});
					}
					const currentItem = this.carData.timetable[index];
					this.$set(this.carData.timetable, index, {
						...currentItem,
						platform: '网络错误',
						wicket: '网络错误'
					});
				} finally {
					if (!silent) {
						uni.hideLoading();
					}
					return result;
				}
			},

			/**
			 * 批量加载所有车站的停台信息
			 */
			async loadAllPlatforms() {
				if (this.allPlatformWicketLoaded) return;
				
				uni.showLoading({ title: '一键加载中...' });
				
				let successCount = 0;
				let totalCount = this.carData.timetable.length;
				
				try {
					for (let i = 0; i < this.carData.timetable.length; i++) {
						const item = this.carData.timetable[i];
						// 检查是否已经查询过，避免重复请求
						if (item.platform === null || item.platform === '查询失败' || item.platform === '网络错误') {
							// 使用 silent 模式进行加载
							const result = await this.loadPlatform(item, i, true); 
							if (result.success) {
								successCount++;
							}
						} else if (item.platform) {
							// 已经有数据了，也算成功
							successCount++;
						}
					}
					
					this.allPlatformWicketLoaded = true;
					this.showLoadAllButton = false;
					
					uni.showToast({
						title: `加载完成！成功${successCount} / ${totalCount}站`,
						icon: 'success',
						duration: 2000
					});
					
				} catch (e) {
					uni.showToast({
						title: '批量加载出错',
						icon: 'error'
					});
				} finally {
					uni.hideLoading();
				}
			},

			/**
			 * 计算实际到达/发车时间 (HH:mm)
			 */
			calculateActualTime: function(estimatedTime, delayMinutes, status) {
				if (!estimatedTime || estimatedTime === '-' || status === null || status === undefined) {
					return '-';
				}
				if (typeof delayMinutes !== 'number' || isNaN(delayMinutes) || delayMinutes === null) {
					return '-';
				}
				if (status === 1 && delayMinutes === 0) {
					return estimatedTime;
				}

				const parts = estimatedTime.split(':');
				let hours = parseInt(parts[0]);
				let minutes = parseInt(parts[1]);

				let totalMinutes = hours * 60 + minutes + delayMinutes;

				const minutesInDay = 24 * 60;
				let finalMinutes = totalMinutes % minutesInDay;
				if (finalMinutes < 0) {
					finalMinutes += minutesInDay; 
				}

				let finalHours = Math.floor(finalMinutes / 60);
				let finalMin = finalMinutes % 60;

				const formattedHours = String(finalHours).padStart(2, '0');
				const formattedMinutes = String(finalMin).padStart(2, '0');

				return `${formattedHours}:${formattedMinutes}`;
			},

			/**
			 * 根据状态判断并返回状态文本
			 */
			formatDelayStatus: function(delayMinutes, status) {
				if (delayMinutes === null || status === null || delayMinutes === undefined || status === undefined) {
					return '-';
				}
				if (status === 1 && delayMinutes === 0) {
					return '正点';
				}
				if (status === 3 && delayMinutes < 0) {
					return `早点${Math.abs(delayMinutes)}分`;
				}
				if (status === 2 && delayMinutes > 0) {
					return `晚点${delayMinutes}分`;
				}
				return '-';
			},

			/**
			 * 根据状态返回对应的 CSS 颜色
			 */
			getDelayStatusColor: function(delayMinutes, status) {
				if (status === 3 && delayMinutes < 0) {
					return 'color: #27ae60; font-weight: bold;';
				}
				if (status === 2 && delayMinutes > 0) {
					return 'color: #c0392b; font-weight: bold;';
				}
				return '';
			},

			/**
			 * 图片加载失败时的处理函数，实现 Fallback 逻辑
			 */
			onImageError: function(e) {
			    const carModel = this.carData.car ? this.carData.car.replace(' 重联', '') : null;
			    
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

			/**
			 * NEW: Fetch image source from JSON API
			 */
			async fetchImageSource() {
			    const carModel = this.carData.car ? this.carData.car.replace(' 重联', '') : null;
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
			            this.imageUploaderUsername = resp.data.data.uploader_username || '匿名';
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

			fillInData: async function(mode) {

				uni.showLoading({
					title: "加载中"
				}); // [1] 主数据加载开始
				let loadSuccess = false; 

				try {
					if (!this.train) return;

					if (mode == "network") {
						const resp = await uniGet(
							`https://data.railgo.zenglingkun.cn/api/train/query?train=${encodeURIComponent(this.train)}`
						);
						const result = resp.data;

						if (result.error || !result.timetable || result.timetable.length === 0) {
							this.carData = { /* ... reset data ... */ };
							this.cardColor = '#114598';
							uni.showToast({
								title: '车次不存在',
								icon: 'error'
							})
							const c = uni.getStorageSync("search");
							uni.setStorage({
								key: 'search',
								data: c - 1
							});
							uni.redirectTo({
								url: '/pages/404/404'
							})
							return; // 结束执行
						}
                        
                        // 【网络模式的关键修正】：强制净化 diagram 数组的子元素
                        const processedDiagram = Array.isArray(result.diagram) ? result.diagram.map(item => ({
                            ...item,
                            // 确保 from 和 to 属性是数组，如果不是，则初始化为空数组
                            from: Array.isArray(item.from) ? item.from : [],
                            to: Array.isArray(item.to) ? item.to : []
                        })) : [];

						// 成功处理
						this.carData = {
							numberKind: result.numberKind || '',
							numberFull: Array.isArray(result.numberFull) ? result.numberFull : [],
							type: result.type || '',
							timetable: (result.timetable || []).map(item => ({
								station: '',
								stationTelecode: '',
								trainCode: '',
								arrive: '',
								depart: '',
								distance: '-',
								speed: 0,
								day: '-',
								platform: null, 
								wicket: null, 
								...item
							})),
							bureauName: result.bureauName || '',
							runner: result.runner || '',
							carOwner: result.carOwner || '',
							car: result.car || '',
							rundays: Array.isArray(result.rundays) ? result.rundays : [],
							diagram: processedDiagram // 使用强制净化的交路数据
						};
						this.cardColor = this.colorMap[this.carData.numberKind] || '#114598';
						loadSuccess = true; 

					} else {
						// --- 本地模式逻辑：获取车次详情 ---
						const result = await doQuery("SELECT * FROM trains WHERE number='" + this.keyword +
							"'", KEYS_STRUCT_TRAINS);

						if (result && result.length > 0) {
							// 成功处理
							let rawData = toRaw(result[0]);

							// 【本地模式修正】：如果 SQLite 中存储的是 JSON 字符串，需要进行解析
							if (typeof rawData.diagram === 'string') {
								try {
									rawData.diagram = JSON.parse(rawData.diagram);
								} catch (e) {
									console.error("Failed to parse diagram JSON string:", e);
									rawData.diagram = []; // 解析失败则置为空数组
								}
							}
                            
                            // 【本地模式修正】：timetable 也可能是字符串，同样需要解析
                            if (typeof rawData.timetable === 'string') {
								try {
									rawData.timetable = JSON.parse(rawData.timetable);
								} catch (e) {
									console.error("Failed to parse timetable JSON string:", e);
									rawData.timetable = []; // 解析失败则置为空数组
								}
							}
                            // 【本地模式修正】：numberFull 也可能是字符串，同样需要解析
                            if (typeof rawData.numberFull === 'string') {
								try {
									rawData.numberFull = JSON.parse(rawData.numberFull);
								} catch (e) {
									console.error("Failed to parse numberFull JSON string:", e);
									rawData.numberFull = []; // 解析失败则置为空数组
								}
							}

                            // 【本地模式的关键修正】：强制净化 diagram 数组的子元素
                            // 1. 确保 rawData.diagram 是一个数组 before proceeding
                            if (!Array.isArray(rawData.diagram)) {
                                rawData.diagram = [];
                            }

                            // 2. Process/purify the diagram array
                            rawData.diagram = rawData.diagram.map(item => ({
                                ...item,
                                // 确保 from 和 to 属性是数组，如果不是，则初始化为空数组
                                from: Array.isArray(item.from) ? item.from : [],
                                to: Array.isArray(item.to) ? item.to : []
                            }));


							this.carData = {
								numberKind: '',
								numberFull: [],
								type: '',
								timetable: [],
								bureauName: '',
								runner: '',
								carOwner: '',
								car: '',
								rundays: [],
								diagram: [],
								...rawData
							};
                            
							// 修正后的代码块：现在 this.carData.diagram 应该是一个数组
							for (var i = 0; i < this.carData.diagram.length; i++) {
								let dg = toRaw(await doQuery("SELECT code, numberFull FROM trains WHERE number='" + this
									.carData.diagram[i].train_num + "'"))[0];
								if (dg) {
									Object.assign(this.carData.diagram[i], dg);
								}
							}
                            
							this.carData.timetable = (this.carData.timetable || []).map(item => ({
								station: '',
								stationTelecode: '',
								trainCode: '',
								arrive: '',
								depart: '',
								distance: '-',
								speed: 0,
								day: '-',
								platform: null, 
								wicket: null, 
								...item
							}));
							this.cardColor = this.colorMap[this.carData.numberKind] || '#114598';
							loadSuccess = true;

						} else {
							this.carData = { /* ... reset data ... */ };
							this.cardColor = '#114598';
							uni.showToast({
								title: '车次不存在',
								icon: 'error'
							})
							const c = uni.getStorageSync("search");
							uni.setStorage({
								key: 'search',
								data: c - 1
							});
							uni.redirectTo({
								url: '/pages/404/404'
							})
							return;
						}
					}

					// -------------------------------------------------------------------------
					// **图片 URL 初始化逻辑**
					const carModel = this.carData.car ? this.carData.car.replace(' 重联', '') : null;
					if (carModel) {
						this.carImageUrl = `https://tp.railgo.zenglingkun.cn/api/${encodeURIComponent(carModel)}.png`;
					} else {
						this.carImageUrl = '';
					}
                    
                    // NEW: Fetch image source metadata
                    if (this.carData.car) {
                        this.fetchImageSource();
                    } else {
                        this.carImageUrl = '';
                        this.isImageLoading = false;
                    }
					// -------------------------------------------------------------------------

					if (this.isOnlyOfflineMode) {
						// 离线模式下，主数据已加载完毕，直接返回
						return
					}
					
					// -------------------------------------------------------------------------
					// **正晚点数据加载逻辑**
					let delayLoadSuccess = false;
					if (loadSuccess && this.carData.timetable.length > 0) {
						const timetable = this.carData.timetable;
						const fromStation = timetable[0].station;
						const toStation = timetable[timetable.length - 1].station;

						if (fromStation && toStation && this.date) {
							uni.showLoading({
								title: '加载正晚点数据'
							}) // [2] 正晚点加载开始
							try {
								const delayResp = await uniPost(
									'https://delay.data.railgo.zenglingkun.cn/api/trainDetails/queryTrainDelayDetails', {
										date: this.date,
										trainNumber: this.train,
										fromStationName: fromStation,
										toStationName: toStation
									}
								);
								if (delayResp.data && Array.isArray(delayResp.data.data)) {
									this.delay = delayResp.data.data;
									delayLoadSuccess = true;
								} else {
									this.delay = [];
								}
							} catch (delayError) {
								console.warn("获取正晚点信息失败（网络可能断开或接口错误）", delayError);
								this.delay = []; 
							} finally {
								uni.hideLoading() // [2] 正晚点加载结束 (确保隐藏)
							}
						}
					}
					// -------------------------------------------------------------------------
					
					// -------------------------------------------------------------------------
					// **停台自动/手动加载逻辑**
					if (loadSuccess && this.carData.timetable.length > 0) {
						if (this.carData.timetable.length < this.platformLoadThreshold) {
							// 车站少于阈值，自动加载所有停台信息
							this.loadAllPlatforms();
						} else {
							// 车站多于阈值，显示一键加载按钮
							this.showLoadAllButton = true;
						}
					}
					// -------------------------------------------------------------------------


				} catch (error) {
					console.error("数据加载失败", error);
					this.carData = {
						numberKind: '',
						numberFull: [],
						type: '',
						timetable: [],
						bureauName: '',
						runner: '',
						carOwner: '',
						car: '',
						rundays: [],
						diagram: []
					};
					this.cardColor = '#114598';
					this.delay = [];
					const c = uni.getStorageSync("search");
					uni.setStorage({
						key: 'search',
						data: c - 1
					});
				} finally {
					// [1] 主数据加载结束：无论成功、失败或提前返回（离线模式），都确保隐藏最初的“加载中”动画
					uni.hideLoading(); 
				}
			},
			tabChange: function(e) {
				this.selectIndex = e.index;
			}
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