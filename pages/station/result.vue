<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<back-header></back-header>
		<view class="ux-padding">
			<view class="ux-bg-white ux-border-radius">
				<view class="ux-pl ux-pr ux-pb-small ux-pt ux-flex ux-align-items-center ux-justify-content-center">
					<view class="ux-flex ux-align-items-center">
						<view v-for="(tag,i) in data.type" :key="i">
							<text class="ux-badge ux-color-white ux-mr-small"
								:style="'background-color:'+badgeFlag[tag]">{{tag}}</text>
						</view>
					</view>
					<view>
						<text class="ux-h3">{{data.name}}站</text><br>
						<text v-if="data.province || (data.level && data.level !== '未知')" class="ux-text-small ux-opacity-7">
							<template v-if="data.province">
								{{ data.province === data.city ? data.province : (data.province + (data.city || '')) }}
							</template>
							
							<template v-if="data.province && data.level && data.level !== '未知'"> | </template>
							
							<template v-if="data.level && data.level !== '未知'">{{data.level}}</template>
							<br>
						</text>
						<text class="ux-text-small">{{data.pinyin}} Station</text>
					</view>
				</view>
				<view class="ux-flex ux-space-between ux-color-white ux-pt-small ux-pb-small ux-pl ux-pr ux-text-small"
					style="border-bottom-left-radius:10rpx;border-bottom-right-radius:10rpx;"
					:style="'background-color:'+(Array.isArray(data.type) && data.type.includes('客') ? '#114598' : '#eeba67')">
					<text>{{data.pinyinTriple}}/-{{data.telecode}}</text>
					<text>{{data.bureau}} {{data.belong}}辖</text>
				</view>
			</view>

			<view class="ux-flex ux-justify-content-center">
				<uv-tabs :list="topTabList" lineWidth="60" lineColor="#114598" :activeStyle="{
							color: '#303133',
							fontWeight: 'bold',
							transform: 'scale(1.05)'
				    	}" :inactiveStyle="{
							color: '#606266',
							transform: 'scale(1)'
						}" itemStyle="height: 34px;padding-left:30px;padding-right:30px;" class="ux-mt-small"
					@click="tabChange"></uv-tabs>
			</view>

			<view class="ux-pt" v-if="selectIndex==0">
				<view v-if="trains.length!=0">
					<view class="ux-flex">
						<button class="ux-flex1 ux-mr-small ux-bg-primary ux-color-white" size="mini"
							@click="openSortMenu()">
							<view class="ux-flex ux-align-items-center ux-justify-content-center">
								<text class="icon">&#xe164;</text>&nbsp;排序
							</view>
						</button>
						<button class="ux-flex1 ux-ml-small ux-bg-primary ux-color-white" size="mini"
							@click="openFilterMenu()">
							<view class="ux-flex ux-align-items-center ux-justify-content-center">
								<text class="icon">&#xe06d;</text>&nbsp;筛选
							</view>
						</button>
					</view>
					<view class="ux-mt-small">
						<text class="ux-text-small ux-opacity-5">共查询到 {{showTrains.length}} 个车次</text>
						<br>
					</view>
					<navigator v-for="(item,index) in showTrains" :key="index"
											:url="'/pages/train/trainResult?keyword='+(item.number || item.code)+'&date='+getToday()">
						<view class="ux-bg-white ux-border-radius ux-mt-small ux-flex">
							<view style="border-bottom-left-radius: 10rpx; border-top-left-radius:10rpx;"
								:style="'background-color:'+colorMap[item.number.charAt(0)]">
								&nbsp;&nbsp;
							</view>
							<view class="ux-flex ux-align-items-center ux-space-between ux-pr ux-pt ux-pb ux-pl-small"
								style="width:100%;">
								<view style="width:calc(100% - 60rpx);">
									<view class="ux-flex ux-space-between">
										<view>
											<text class="consolas" style="font-size:40rpx;">
												{{item.numberKind}}{{item.numberFull.join("/").replace(new RegExp(item.numberKind, 'g'), "")}}
											</text>
											<br>
											<text class="ux-text-small">{{getStationName(item, "from")}} ⋙ {{getStationName(item, "to")}}</text>
										</view>
										<view class="ux-flex" style="padding-top:8rpx;">
											<view class="ux-text-center ux-mr-small" style="min-width:80rpx">
												<text class="ux-text">{{getArriveTime(item) || '--:--'}}</text>
												<br>
												<text class="ux-text-small ux-opacity-5">到达</text>
											</view>
											<view class="ux-text-center ux-mr-small" style="min-width:80rpx">
												<text class="ux-text">{{getDepartTime(item) || '--:--'}}</text>
												<br>
												<text class="ux-text-small ux-opacity-5">出发</text>
											</view>
											<view class="ux-text-center">
												<text class="ux-text">{{getStopTime(item) || '-'}}</text>
												<br>
												<text class="ux-text-small ux-opacity-5">停车</text>
											</view>
										</view>
									</view>
								</view>
								<text class="ux-text"><text class="icon">&#xe5c8;</text></text>
							</view>
						</view>
					</navigator>
				</view>
				<view v-if="trains.length==0">
					<view class="ux-padding ux-text-center">本站不办理客运业务或无列车停靠</view>
				</view>
				<br>
				<view class="ux-flex ux-row ux-justify-content-center">
					<text class="ux-text-small ux-opacity-4">—— 数据来源: RailGo.Parser ——</text>
				</view>
			</view>
            <view class="ux-text-center ux-padding-small ux-mb ux-h6"  v-if="topTabList[selectIndex] && topTabList[selectIndex].name === '大屏'"
				style="background-color:#e9eef5;border:1px solid #114598;border-radius:10rpx;color:#114598; margin-top: 20rpx">
				<text class="ux-bold">信息仅供参考 请以车站现场公告为准</text>
			</view>
			
			<!-- 大屏类型选择按钮 -->
			<view v-if="topTabList[selectIndex] && topTabList[selectIndex].name === '大屏'" class="ux-flex ux-space-between ux-mt-small">
				<button 
					class="ux-flex1 ux-mr-small" 
					size="mini"
					:type="bigScreenKind === 'departure' ? 'primary' : 'default'"
					@click="switchBigScreenKind('departure')">
					出发
				</button>
				<button 
					class="ux-flex1 ux-ml-small" 
					size="mini"
					:type="bigScreenKind === 'arrival' ? 'primary' : 'default'"
					@click="switchBigScreenKind('arrival')">
					到达
				</button>
			</view>
			
			<view class="ux-pt dark-table-wrapper" v-if="topTabList[selectIndex] && topTabList[selectIndex].name === '大屏'" style="margin-top: 20rpx;">
				<uni-table :loading="bigScreenLoading" emptyText="暂无数据" class="dark-table">
					<uni-tr>
						<uni-th align="center">车次</uni-th>
						<uni-th align="center">状态</uni-th>
						<uni-th align="center">始发站</uni-th>
						<uni-th align="center">终到站</uni-th>
						<uni-th align="center">时间</uni-th>
						<uni-th align="center">{{ bigScreenKind === 'arrival' ? '出站口' : '检票口' }}</uni-th>
					</uni-tr>
					<uni-tr v-for="(item, index) in displayedBigScreenData" :key="item.key"> 
						<uni-td align="center">{{ item.trainNum }}</uni-td>
						<uni-td align="center">
							<text :style="{color: getStatusColor(item.bigScreenStatusCode)}">
								{{ formatBigScreenStatus(item.bigScreenStatus, item.bigScreenStatusCode, item.timeDelay) }}
							</text>
						</uni-td>
						<uni-td align="center">{{ item.trainStartStation }}</uni-td>
						<uni-td align="center">{{ item.trainEndStation }}</uni-td>
						<uni-td align="center">{{ formatDepartureTime(item.time) }}</uni-td>
						<uni-td align="center">
							<view v-if="item.bigScreenPort && item.bigScreenPort.length > 0">
								{{ item.bigScreenPort.join(', ') }}
							</view>
							<view v-else>-</view>
						</uni-td>
					</uni-tr>
				</uni-table>
				
				<view v-if="bigScreenData.length > 0 && currentDisplayIndex < bigScreenData.length && !bigScreenLoading" class="ux-padding-small ux-text-center">
					<text style="color: white; opacity: 0.8;">下拉加载更多...（已加载 {{currentDisplayIndex}}/{{bigScreenData.length}}）</text>
				</view>
				
				<view v-if="bigScreenData.length > 0 && currentDisplayIndex >= bigScreenData.length && !bigScreenLoading" class="ux-padding-small ux-text-center">
					<text style="color: white; opacity: 0.8;">已全部加载 {{bigScreenData.length}} 条</text>
				</view>
				
				<view v-if="bigScreenData.length==0 && !bigScreenLoading" class="ux-padding ux-text-center">
					<text style="color: white; opacity: 0.6;">本站暂无大屏数据</text>
				</view>

			</view>
			<!-- <view class="ux-padding ux-text-center" v-if="topTabList[selectIndex] && topTabList[selectIndex].name === '路线'">
				<text>暂未开放，敬请期待</text>
			</view> -->
			
			<!-- 交通选项卡 -->
			<view class="ux-pt" v-if="topTabList[selectIndex] && topTabList[selectIndex].name === '交通'">
				<view v-if="trafficData && trafficData.tabList && trafficData.nodeList && trafficData.nodeList.length > 0" class="traffic-container">
					<!-- 显示交通设施选项卡 -->
					<view class="traffic-tabs">
						<view 
							v-for="(tab, index) in trafficData.tabList" 
							:key="index"
							class="traffic-tab"
							:class="{ 'active': selectedTrafficTab === index || (selectedTrafficTab === 0 && index === 0) }"
							@click="selectTrafficTab(index)"
						>
							{{ tab.tabName }}
						</view>
					</view>
					
					<!-- 显示交通设施详情 -->
					<view class="traffic-content">
						<template 
							v-for="(node, index) in trafficData.nodeList" 
							:key="index"
						>
							<view 
								v-if="!trafficData.tabList[selectedTrafficTab] || node.nodeType === trafficData.tabList[selectedTrafficTab].tabType"
								class="traffic-item ux-bg-white ux-border-radius ux-mt-small"
							>
								<view class="ux-padding">
									<view class="ux-flex ux-space-between ux-align-items-center">
										<view>
											<text class="ux-h5">{{ node.nodeName }}</text>
											<text class="ux-text-small ux-opacity-7 ux-ml-small">{{ node.typeName }}</text>
											<br>
											<text class="ux-text-small ux-opacity-6">{{ node.des }}</text>
										</view>
									</view>
									
									<!-- 显示子节点信息（如地铁线路、公交线路等） -->
									<view v-if="node.nodeList && node.nodeList.length > 0" class="ux-mt-small">
										<view class="ux-flex ux-wrap">
											<view 
												v-for="(subNode, subIndex) in node.nodeList" 
												:key="subIndex"
												class="sub-node-item"
												:style="subNode.color ? 'background-color: ' + subNode.color + ';' : ''"
											>
												{{ subNode.nodeName }}
											</view>
										</view>
									</view>
								</view>
							</view>
						</template>
					</view>
				</view>

				
				<view v-else-if="trafficData === null" class="ux-padding ux-text-center">
					<text>正在加载交通信息...</text>
				</view>
				
				<view v-else-if="trafficData === false" class="ux-padding ux-text-center">
					<text>暂无本站交通信息</text>
				</view>
				
				<view v-else class="ux-padding ux-text-center">
					<text>暂无交通信息</text>
				</view>
			</view>
		</view>
	<uni-popup ref="menu_sort" border-radius="10rpx 10rpx 0 0">
		<view class="popup-content">
			<view class="ux-bg-white ux-padding ux-border-radius" style="width:70vw;">
				<text class="ux-h4">车次排序</text>
				<br>
				<radio-group class="ux-mt-small" @change="radioSortChange">
					<radio color="#114598" value="departure" class="ux-mr ux-mt-small"
						:checked="sortState=='departure'">
						<text class="ux-text-small">按发车时间</text>
					</radio>
					<br>
					<radio color="#114598" value="arrival" class="ux-mr ux-mt-small"
						:checked="sortState=='arrival'">
						<text class="ux-text-small">按到达时间</text>
					</radio>
					<br>
					<radio color="#114598" value="stop" class="ux-mr ux-mt-small" :checked="sortState=='stop'">
						<text class="ux-text-small">按停车时长</text>
					</radio>
				</radio-group>
			</view>
		</view>
	</uni-popup>
	<uni-popup ref="menu_filter" border-radius="10rpx 10rpx 0 0">
		<view class="popup-content">
			<view class="ux-bg-white ux-padding ux-border-radius" style="width:70vw;">
				<text class="ux-h4">车种筛选</text>
				<br>
				<checkbox-group class="ux-mt-small" @change="radioFilterChange">
					<view class="ux-flex ux-space-between">
						<checkbox color="#114598" value="G" class="ux-mr ux-mt-small"
							:checked="filterTypeState.includes('G')">
							<text class="ux-text-small">高速</text>
						</checkbox>
						<checkbox color="#114598" value="D" class="ux-mr ux-mt-small"
							:checked="filterTypeState.includes('D')">
							<text class="ux-text-small">动车</text>
						</checkbox>
						<checkbox color="#114598" value="C" class="ux-mr ux-mt-small"
							:checked="filterTypeState.includes('C')">
							<text class="ux-text-small">城际</text>
						</checkbox>
					</view>
					<view class="ux-flex ux-space-between">
						<checkbox color="#114598" value="Z" class="ux-mr ux-mt-small"
							:checked="filterTypeState.includes('Z')">
							<text class="ux-text-small">直达</text>
						</checkbox>
						<checkbox color="#114598" value="T" class="ux-mr ux-mt-small"
							:checked="filterTypeState.includes('T')">
							<text class="ux-text-small">特快</text>
						</checkbox>
						<checkbox color="#114598" value="K" class="ux-mr ux-mt-small"
							:checked="filterTypeState.includes('K')">
							<text class="ux-text-small">快速</text>
						</checkbox>
					</view>
					<view class="ux-flex ux-space-between">
						<checkbox color="#114598" value="12345678" class="ux-mr ux-mt-small"
							:checked="filterTypeState.includes('12345678')">
							<text class="ux-text-small">普客</text>
						</checkbox>
						<checkbox color="#114598" value="S" class="ux-mr ux-mt-small"
							:checked="filterTypeState.includes('S')">
							<text class="ux-text-small">市域</text>
						</checkbox>
						<checkbox color="#114598" value="LY" class="ux-mr ux-mt-small"
							:checked="filterTypeState.includes('LY')">
							<text class="ux-text-small">其他</text>
						</checkbox>
					</view>
				</checkbox-group>
				<uv-divider></uv-divider>
				<text class="ux-h4">到发筛选</text>
				<br>
				<checkbox-group class="ux-mt-small" @change="radioSourceChange">
					<view class="ux-flex ux-space-between">
						<checkbox color="#114598" value="P" class="ux-mr ux-mt-small"
							:checked="filterSourceState.includes('P')">
							<text class="ux-text-small">过路</text>
						</checkbox>
						<checkbox color="#114598" value="D" class="ux-mr ux-mt-small"
							:checked="filterSourceState.includes('D')">
							<text class="ux-text-small">本站始发</text>
						</checkbox>
						<checkbox color="#114598" value="A" class="ux-mr ux-mt-small"
							:checked="filterSourceState.includes('A')">
							<text class="ux-text-small">本站终到</text>
						</checkbox>
					</view>
				</checkbox-group>
			</view>
		</view>
	</uni-popup>
    </view>
</template>

<script>
	import {
		doQuery
	} from "@/scripts/sqlite.js";
	import {
		toRaw
	} from "@vue/reactivity";
	import {
		KEYS_STRUCT_STATIONS,
		KEYS_STRUCT_TRAINS,
		TRAIN_KIND_COLOR_MAP
	} from '@/scripts/config.js';
	import {uniGet, uniPost} from "../../scripts/req"; // 引入 uniPost 用于查询停台

	export default {
		data() {
			return {
				keyword: "",
				data: {},
				badgeFlag: {
					"客": "#114598",
					"货": "#eeba67",
					"高": "#c0392b",
					"行": "#459811",
					"运": "#5499c7"
				},
				// 默认只包含“车次”和“路线”，如果为客运站则在 fillInData 中添加“大屏”和“交通”
				topTabList: [{
					name: '车次',
				}, {
					name: '路线'
				}],
				selectIndex: 0,
				trains: [],
				showTrains: [],
				colorMap: TRAIN_KIND_COLOR_MAP,
				filterTypeState: ["G", "D", "C", "Z", "T", "K", "12345678", "S", "LY"],
				filterSourceState: ["P", "D", "A"],
				sortState: "departure",
				// --- 新增大屏数据和加载状态 ---
				bigScreenData: [],           // V2 API 返回的全部数据
				bigScreenLoading: false,
				bigScreenKind: 'departure',  // 大屏类型：departure（出发）或 arrival（到达）
				
				// --- 滚动加载控制 ---
				displayedBigScreenData: [], // 实际渲染到大屏表格的数据
				currentDisplayIndex: 0,     // 当前已加载到 displayedBigScreenData 的索引
				pageSize: 30,               // 每次加载的条数（改为30）
				
				// --- 停台信息缓存与查询状态（保留） ---
				platformWicketMap: new Map(), 
				platformWicketLoadingSet: new Set(),
				
				// --- 自动刷新机制 ---
				refreshTimer: null,          // 自动刷新定时器
				refreshInterval: 180000,     // 3分钟（毫秒）
				
				trafficData: null, // 交通数据
				selectedTrafficTab: 0, // 当前选中的交通选项卡
				trafficDataLoaded: false, // 标记交通数据是否已加载
			}
		},
		onLoad(options) {
			this.keyword = options.keyword;
			const mode = uni.getStorageSync("mode");
			const c = uni.getStorageSync("search");
			uni.setStorage({
				key: 'search',
				data: c + 1
			});

			this.fillInData(mode);
		},
		/**
		 * 监听页面滚动到底部，实现大屏数据加载
		 */
		onReachBottom() {
			// 确保当前选中的是"大屏"Tab
			const isBigScreenTab = this.topTabList[this.selectIndex] && this.topTabList[this.selectIndex].name === '大屏';
			if (isBigScreenTab) {
				this.loadMoreBigScreenData();
			}
		},
		/**
		 * 页面隐藏时停止自动刷新
		 */
		onHide() {
			this.stopAutoRefresh();
		},
		/**
		 * 页面卸载时停止自动刷新
		 */
		onUnload() {
			this.stopAutoRefresh();
		},
		methods: {
			back: function() {
				uni.navigateBack();
			},
			fillInData: async function(mode) {
				uni.showLoading({
					title: "加载中"
				});

				let success = false;
				if (mode == "network") {
					try {
						const stationBase = uni.getStorageSync('service_source_station') || 'https://data.railgo.zenglingkun.cn';
						const resp = await uniGet(stationBase + `/api/station/query?telecode=${this.keyword}`);
						const result = resp.data;
						if (result.error) {
							uni.showToast({
								title: '车站不存在'
							});
							const c = uni.getStorageSync("search");
							uni.setStorage({
								key: 'search',
								data: c - 1
							});
							uni.hideLoading();
							uni.redirectTo({
								url: '/pages/404/404'
							});
							return;
						}
						this.data = result.data || {};
						this.trains = result.trains || [];
						success = true;
					} catch (error) {
						uni.showToast({
							title: '加载失败'
						});
						console.error("车站数据加载失败", error);
						// #ifdef APP-PLUS
						plus.nativeUI.alert("调试错误：" + error);
						// #endif
					}
				} else { // 本地模式
					try {
						const stationData = (await doQuery("SELECT * FROM stations WHERE telecode='" + this.keyword + "'", KEYS_STRUCT_STATIONS))[0];
						this.data = toRaw(stationData);
						
						if (this.data.trainList && this.data.trainList.length > 0) {
							// 获取所有列车数据
							const rawTrains = await doQuery(
								"SELECT code, number, numberFull, numberKind, timetable FROM trains WHERE number IN ('" +
								this.data.trainList.join("','") + "')", ["code", "number", "numberFull", "numberKind",
									"timetable"
								]);
							
							// 遍历并处理每个列车对象，添加 arrive, depart, stopTime
							this.trains = rawTrains.map(item => {
								const stop = item.timetable.find(tt => tt.stationTelecode === this.keyword);
								if (stop) {
									return {
										...item,
										arrive: stop.arrive,
										depart: stop.depart,
										stopTime: stop.stopTime,
										fromStation: item.timetable[0],
										toStation: item.timetable[item.timetable.length - 1],
										indexStopThere: item.timetable.findIndex(tt => tt.stationTelecode === this.keyword)
									};
								}
								return item; // 如果没有找到匹配的站点，返回原始对象
							});

						} else {
							this.trains = [];
						}
						success = !!this.data.name; // 检查是否成功获取到车站数据
					} catch (error) {
						console.error("本地数据加载失败", error);
					}
				}
				uni.hideLoading();
				if (success) {
					// 1. 检查是否为客运站
					const isPassengerStation = Array.isArray(this.data.type) && this.data.type.includes("客");
                    // IMPORTANT: Reset topTabList to default before potentially adding '大屏' and '交通'
                    // this.topTabList = [{ name: '车次' }, { name: '路线' }];
                    this.topTabList = [{ name: '车次' }];
					if (isPassengerStation) {
						// 2. 如果是客运站，添加"大屏"tab到索引1（"车次"和"路线"之间）
						this.topTabList.splice(1, 0, { name: '大屏' });
						// 3. 获取任意一个列车作为参数用于交通数据API
						const trainForTraffic = this.trains.length > 0 ? this.trains[0].number : '';
						// 仅在非仅离线模式下添加交通tab（因为交通数据需要网络请求12306 API）
						// 当ol不为true时（即非仅离线模式）显示交通选项卡
						if (trainForTraffic && uni.getStorageSync("ol") !== true) {
							// 添加"交通"tab到索引2（"大屏"之后）
							this.topTabList.splice(2, 0, { name: '交通' });
						}
						uni.showLoading({
							title: '加载大屏数据'
						})
						// 4. 异步获取大屏数据
						await this.getBigScreenData();
						uni.hideLoading()
						
						// NEW: 初始化大屏数据的展示
						this.currentDisplayIndex = 0;
						this.displayedBigScreenData = [];
						this.loadMoreBigScreenData(); // 初始加载第一页数据

					}
					
					this.applySortingAndFiltering(); // 初始加载时应用一次排序和筛选
				}

				
			},
			tabChange: function(e) {
				this.selectIndex = e.index;
				// NEW: 切换到大屏时，如果尚未加载或数据为空，则触发加载
				if (this.topTabList[e.index].name === '大屏') {
					if (this.displayedBigScreenData.length === 0 && this.bigScreenData.length > 0) {
						this.currentDisplayIndex = 0;
						this.loadMoreBigScreenData();
					}
				}
				// NEW: 切换到交通时，加载交通数据（如果尚未加载）
				if (this.topTabList[e.index].name === '交通') {
					// 检查是否为客运站并有列车数据
					const isPassengerStation = Array.isArray(this.data.type) && this.data.type.includes("客");
					const trainForTraffic = this.trains.length > 0 ? this.trains[0].number : '';
					if (isPassengerStation && trainForTraffic) {
						// 只有当交通数据尚未加载时才加载
						if (!this.trafficDataLoaded) {
							this.trafficDataLoaded = true; // 标记为已加载
							this.getTrafficData();
						}
					} else {
						// 如果不是客运站或没有列车数据，设置为false显示无数据提示
						this.trafficData = false;
					}
				}
			},
			// --- 获取大屏数据的方法（V2 API） ---
			getBigScreenData: async function() {
				
				if (!this.data.telecode) {
					return; // 车站电报码不存在则不查询
				}
				
				this.bigScreenLoading = true;
				
				// 清空当前显示的数据
				this.displayedBigScreenData = [];
				this.currentDisplayIndex = 0;
				this.bigScreenData = []; // 先清空全部数据
				
				try {
					// 使用 V2 API
					const bigScreenBase = uni.getStorageSync('service_source_bigScreen') || 'https://rg-api.zenglingkun.cn';
					const url = bigScreenBase + `/api/v2/getStationBigScreen?stationTelecode=${encodeURIComponent(this.keyword)}&kind=${encodeURIComponent(this.bigScreenKind)}`;
					
					const resp = await uniGet(url);
					
					// 检查响应数据结构
					if (resp.data && resp.data.success === true && Array.isArray(resp.data.data)) {
						// 到达大屏和出发大屏都显示全部数据
						this.bigScreenData = resp.data.data;
						
						// 启动自动刷新定时器
						this.startAutoRefresh();
						
						// 先设置为 false，才能调用 loadMoreBigScreenData
						this.bigScreenLoading = false;
						
						// 初始加载第一页数据
						this.loadMoreBigScreenData();
					} else {
						this.bigScreenData = [];
						this.bigScreenLoading = false;
					}
				} catch (error) {
					this.bigScreenData = [];
					this.bigScreenLoading = false;
				}
			},
			
			// --- NEW: 滚动加载更多大屏数据（适配 V2 数据结构） ---
			/**
			 * 滚动加载更多大屏数据（分段加载）
			 */
			loadMoreBigScreenData: function() {
				if (this.bigScreenLoading || this.currentDisplayIndex >= this.bigScreenData.length) {
					// 正在加载或已加载全部
					return;
				}

				// 计算本次要加载的数据范围
				const startIndex = this.currentDisplayIndex;
				const nextIndex = Math.min(startIndex + this.pageSize, this.bigScreenData.length);
				const dataToLoad = this.bigScreenData.slice(startIndex, nextIndex);
				
				if (dataToLoad.length === 0) return; // 没有新数据可加载

				dataToLoad.forEach(item => {
					// V2 API 数据结构
					const displayItem = {
						trainNum: item.trainNum,             // 车次号
						trainStartStation: item.trainStartStation, // 始发站
						trainEndStation: item.trainEndStation,     // 终到站
						time: item.time,                     // 图定时间
						bigScreenPort: item.bigScreenPort || [],   // 检票口数组
						bigScreenStatus: item.bigScreenStatus,     // 状态文本
						bigScreenStatusCode: item.bigScreenStatusCode, // 状态代码
						timeDelay: item.timeDelay || 0,      // 延误/早点分钟
						key: `${item.trainNum}_${item.time}`,  // 唯一键
					};
					this.displayedBigScreenData.push(displayItem);
				});

				this.currentDisplayIndex = nextIndex;
			},
			
			// --- 自动刷新机制 ---
			/**
			 * 启动自动刷新定时器
			 */
			startAutoRefresh: function() {
				// 清除旧的定时器
				if (this.refreshTimer) {
					clearInterval(this.refreshTimer);
				}
				
				// 设置新的定时器
				this.refreshTimer = setInterval(() => {
					this.getBigScreenData();
				}, this.refreshInterval);
			},
			
			/**
			 * 停止自动刷新定时器
			 */
			stopAutoRefresh: function() {
				if (this.refreshTimer) {
					clearInterval(this.refreshTimer);
					this.refreshTimer = null;
				}
			},
			
			// --- 大屏类型切换 ---
			/**
			 * 切换大屏类型（出发/到达）
			 * @param {string} kind - departure 或 arrival
			 */
			switchBigScreenKind: async function(kind) {
				if (this.bigScreenKind === kind) return;
				
				this.bigScreenKind = kind;
				// 不要在这里清空数据，让 getBigScreenData 函数处理
				await this.getBigScreenData();
			},
			
			// -------------------------------
			
			// --- 时间格式化方法 ---
			formatDepartureTime(time) {
				if (!time) return '--:--';
				// V2 API 已经返回格式化的时间 HH:mm
				return time;
			},
			
			// --- 状态颜色逻辑（适配 V2 API） ---
			getStatusColor(statusCode) {
				if (!statusCode) return 'white'; // 默认白色
				
				switch (statusCode) {
					case 'WAITING':      // 候车
						return 'white';
					case 'CANCELED':     // 取消
						return '#e74c3c'; // 红色
					case 'CHECK_BEGIN':  // 出发开检
						return '#27ae60'; // 绿色
					case 'CHECK_STOP':   // 出发停检
						return '#e74c3c'; // 红色
					case 'ON_TIME':      // 到达正点
						return 'white'; // 白色（在深色背景上更清晰）
					case 'DELAY':        // 到达晚点
						return '#e74c3c'; // 红色
					case 'EARLY':        // 到达早点
						return '#27ae60'; // 绿色
					default:
						return 'white';
				}
			},
			
			// --- 格式化大屏状态文本（结合延迟信息） ---
			formatBigScreenStatus(status, statusCode, timeDelay) {
				if (!status) return '-';
				
				const delay = Number(timeDelay);
				const hasDelay = delay > 0;
				
				// 到达大屏
				if (this.bigScreenKind === 'arrival') {
					if (statusCode === 'ON_TIME') {
						return '正点';
					}
					if (statusCode === 'DELAY' && hasDelay) {
						return `晚点${delay}分`;
					}
					if (statusCode === 'EARLY' && hasDelay) {
						return `早点${delay}分`;
					}
					return status;
				}
				
				// 出发大屏
				if (statusCode === 'DELAY' && hasDelay) {
					return `晚点${delay}分`;
				}
				if (statusCode === 'EARLY' && hasDelay) {
					return `早点${delay}分`;
				}
				return status;
			},
			// -------------------------------
			// --- 获取交通数据的方法 ---
			getTrafficData: async function() {
				if (!this.data.name || !this.data.telecode) return; // 车站名或电报码不存在则不查询
				
				// 获取任意一个列车作为参数用于交通数据API
				const trainForTraffic = this.trains.length > 0 ? this.trains[0].number : '';
				if (!trainForTraffic) return; // 如果没有列车，则不显示交通选项卡
				
				uni.showLoading({
					title: '加载交通信息'
				});
				
				try {
					const params = {
						stationCode: this.data.telecode,
						trainCode: trainForTraffic,
						reqType: 'json'
					};
					
					// 请求12306的交通信息API
					const response = await uniGet('https://mobile.12306.cn/wxxcx/openplatform-inner/miniprogram/wifiapps/appFrontEnd/v2/lounge/open-smooth-common/navigation/listInfo', { params });
	
					if (response && response.data && response.data.content && response.data.content.data) {
						// 检查返回的数据是否具有正确的结构
						const apiData = response.data.content.data;
						if(apiData.tabList && apiData.nodeList && apiData.nodeList.length > 0) {
							this.trafficData = apiData;
						} else {
							console.error("API返回的content.data结构不正确或无数据");
							this.trafficData = false;
						}
					} else {
						console.error("API响应结构与预期不符");
						this.trafficData = false;
					}
					this.trafficDataLoaded = true;
				} catch (error) {
					console.error("交通数据加载失败", error);
					this.trafficData = null;
					uni.showToast({
						title: '交通信息加载失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			
			// --- 选择交通选项卡的方法 ---
			selectTrafficTab: function(index) {
				this.selectedTrafficTab = index;
			},
			
			openSortMenu: function() {
				this.$refs.menu_sort.open();
			},
			openFilterMenu: function() {
				this.$refs.menu_filter.open();
			},
			
			// 新增的集中处理排序和筛选的函数
			applySortingAndFiltering: function() {
				let filteredTrains = [...this.trains];

				// 1. 先进行筛选
				filteredTrains = filteredTrains.filter(i => {
					// 筛选车种
					const firstChar = i.number.charAt(0);
					let typeMatch = false;
					if (firstChar >= '1' && firstChar <= '8') {
						typeMatch = this.filterTypeState.includes("12345678");
					} else if (firstChar === 'L' || firstChar === 'Y') {
						typeMatch = this.filterTypeState.includes("LY");
					} else {
						typeMatch = this.filterTypeState.includes(firstChar);
					}
					
					// 筛选到发
					const fromCode = (i.fromStation && i.fromStation.stationTelecode) || (i.timetable && i.timetable[0] && i.timetable[0].stationTelecode) || '';
					const toCode = (i.toStation && i.toStation.stationTelecode) || (i.timetable && i.timetable[i.timetable.length - 1] && i.timetable[i.timetable.length - 1].stationTelecode) || '';
					
					const sourceMatch = (
						(fromCode !== this.keyword && toCode !== this.keyword && this.filterSourceState.includes("P")) ||
						(fromCode === this.keyword && this.filterSourceState.includes("D")) ||
						(toCode === this.keyword && this.filterSourceState.includes("A"))
					);
					
					return typeMatch && sourceMatch;
				});

				// 2. 然后进行排序
				switch (this.sortState) {
					case "stop":
						filteredTrains.sort((a, b) => {
							const stopStrA = this.getStopTime(a);
							const stopStrB = this.getStopTime(b);
							
							// 将 '-' 视为最大值 (Infinity)，确保无停车时长的排在最后
							const stopTimeA = stopStrA === '-' ? Infinity : parseInt(stopStrA) || 0;
							const stopTimeB = stopStrB === '-' ? Infinity : parseInt(stopStrB) || 0;
							
							return stopTimeA - stopTimeB;
						});
						break;
					case "departure":
						filteredTrains.sort((a, b) => {
							const departA = this.getDepartTime(a);
							const departB = this.getDepartTime(b);

							// 将 '--:--' 视为最大值 '99:99'，确保无出发时间的排在最后
							const timeA = departA === '--:--' ? '99:99' : departA;
							const timeB = departB === '--:--' ? '99:99' : departB;
							
							return timeA.localeCompare(timeB);
						});
						break;
					case "arrival":
						filteredTrains.sort((a, b) => {
							const arriveA = this.getArriveTime(a);
							const arriveB = this.getArriveTime(b);
							
							// 将 '--:--' 视为最大值 '99:99'，确保无到达时间的排在最后
							const timeA = arriveA === '--:--' ? '99:99' : arriveA;
							const timeB = arriveB === '--:--' ? '99:99' : arriveB;
							
							return timeA.localeCompare(timeB);
						});
						break;
				}

				// 3. 最后更新展示列表
				this.showTrains = filteredTrains;
			},
			
			// 修复了这三个方法，确保状态正确更新为数组，并调用 applySortingAndFiltering
			radioSortChange: function(e) {
			    this.sortState = e.detail.value;
			    this.applySortingAndFiltering();
			    this.$refs.menu_sort.close();
			},
			radioFilterChange: function(e) {
				this.filterTypeState = e.detail.value;
			    this.applySortingAndFiltering();
			},
			radioSourceChange: function(e) {
				this.filterSourceState = e.detail.value;
			    this.applySortingAndFiltering();
			},
			getToday: function() {
				const date = new Date();
				return `${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}`;
			},
			getStationName(item, type) {
				if (type === "from") {
					return item.fromStation?.station || item.timetable?.[0]?.station || '';
				} else {
					return item.toStation?.station || item.timetable?.[item.timetable.length - 1]?.station || '';
				}
			},
			getArriveTime(item) {
			    if (item.arrive) {
			        return item.arrive;
			    }
			    if (item.timetable) {
			        const stop = item.timetable.find(tt => tt.stationTelecode === this.keyword);
			        return stop ? stop.arrive : '--:--';
			    }
			    return '--:--';
			},
			
			getDepartTime(item) {
			    if (item.depart) {
			        return item.depart;
			    }
			    if (item.timetable) {
			        const stop = item.timetable.find(tt => tt.stationTelecode === this.keyword);
			        return stop ? stop.depart : '--:--';
			    }
			    return '--:--';
			},
			
			getStopTime(item) {
			    if (item.stopTime) {
			        return item.stopTime;
			    }
			    if (item.timetable) {
			        const stop = item.timetable.find(tt => tt.stationTelecode === this.keyword);
			        return stop ? stop.stopTime : '-';
			    }
			    return '-';
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
	
	.dark-table-wrapper {
		background-color: #2c3e50; 
		border-radius: 10rpx;
		padding: 10rpx;
	}

	.dark-table .uni-table-th,
	.dark-table .uni-table-td {
		color: white !important;
		background-color: #3b506b !important; 
		border-color: #3b506b !important; 
	}

	.dark-table .uni-table-th {
		background-color: #1f3041 !important;
	}
	
	.traffic-tabs {
		display: flex;
		background-color: #fff;
		border-radius: 10rpx;
		margin-top: 20rpx;
		overflow: hidden;
	}
	
	.traffic-tab {
		flex: 1;
		padding: 20rpx 10rpx;
		text-align: center;
		border-right: 1px solid #eee;
		font-size: 28rpx;
		color: #666;
	}
	
	.traffic-tab:last-child {
		border-right: none;
	}
	
	.traffic-tab.active {
		color: #114598;
		font-weight: bold;
		border-bottom: 4rpx solid #114598;
	}
	
	.traffic-content {
		margin-top: 20rpx;
	}
	
	.traffic-item {
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.sub-node-item {
		display: inline-block;
		padding: 10rpx 20rpx;
		margin: 10rpx 10rpx 0 0;
		border-radius: 30rpx;
		font-size: 24rpx;
		color: #fff;
		background-color: #114598;
	}
</style>