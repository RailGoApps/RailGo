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
						:style="'background-color:'+cardColor">{{carData.diagramType || ''}} {{carData.type || ''}}</text>
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

				<!-- 只有今天的日期才显示正晚点和停台信息 -->
				<view v-if="isTodayDate">
					<uni-section title="正晚点" type="line" style="background-color: transparent;"
						title-font-size="28rpx"></uni-section>

					<view v-if="showLoadAllButton" class="ux-pb-small">
						<button @click="loadAllPlatforms" type="primary" size="mini"
							style="margin: 0; padding: 0 15px; font-size: 14px; line-height: 30px;">
							一键全部加载停台信息 (共{{carData.timetable.length}}站)
						</button>
					</view>

					<view v-for="(item,index) in combinedDelayData" :key="index" 
						class="ux-bg-white ux-border-radius ux-mt-small" 
						@click="item.platform ? showPlatformDetails(item, index) : null"
						hover-class="ux-tap">
						<view class="ux-flex">
							<view style="border-bottom-left-radius: 10rpx; border-top-left-radius:10rpx; width: 12rpx;"
								:style="getDelayStatusBackground(item.delayStatusCode)">
							</view>
							<view class="ux-flex ux-space-between ux-pt ux-pl ux-pr ux-align-items-center" style="width: 100%;">
								<text class="ux-bold" style="font-size: 32rpx;">{{item.stationName || ''}}</text>
								<text :style="getDelayStatusColor(item.delayStatusCode, item.delayTime)" class="ux-bold" style="font-size: 28rpx;">
									{{formatDelayStatus(item.delayStatusCode, item.delayTime)}}
								</text>
							</view>
						</view>
						<view class="ux-pl ux-pr ux-pb">
							<view class="ux-flex ux-space-between ux-mt-small">
								<text class="ux-text-small ux-opacity-7">预计时间</text>
								<text class="ux-text-small">{{item.arrivalTime || '-'}}/{{item.departureTime || '-'}}</text>
							</view>
							<view class="ux-flex ux-space-between ux-mt">
								<text class="ux-text-small ux-opacity-7">实际时间</text>
								<text class="ux-text-small">{{calculateActualTime(item.arrivalTime, item.delayStatusCode, item.delayTime)}}/{{calculateActualTime(item.departureTime, item.delayStatusCode, item.delayTime)}}</text>
							</view>
							<view class="ux-flex ux-space-between ux-mt">
								<text class="ux-text-small ux-opacity-7">停台</text>
								<text class="ux-text-small">
									<!-- 停台信息 -->
									<text v-if="item.platform">{{item.platform}} 站台</text>
									<button v-else-if="item.platform === null && showLoadAllButton" 
										@click.stop="loadPlatformByStationName(item.stationName)" 
										size="mini" type="primary" 
										style="margin: 0; padding: 0 5px; font-size: 10px; line-height: 20px; display: inline;">
										查询
									</button>
									<text v-else>-</text>
								</text>
							</view>
						</view>
					</view>
					<view v-if="delay.length === 0" v-for="(item,index) in (carData.timetable || [])" :key="index" 
						class="ux-bg-white ux-border-radius ux-mt-small"
						@click="item.platform ? showPlatformDetails(item, index) : null"
						hover-class="ux-tap">
						<view class="ux-flex">
							<view style="border-bottom-left-radius: 10rpx; border-top-left-radius:10rpx; width: 12rpx;"
								:style="'background-color: #606266;'">
							</view>
							<view class="ux-flex ux-space-between ux-pt ux-pl ux-pr ux-align-items-center" style="width: 100%;">
								<text class="ux-bold" style="font-size: 32rpx;">{{item.station || ''}}</text>
								<text :style="'color: #606266; font-weight: bold;'" class="ux-bold" style="font-size: 28rpx;">
									未维护
								</text>
							</view>
						</view>
						<view class="ux-pl ux-pr ux-pb">
							<view class="ux-flex ux-space-between ux-mt-small">
								<text class="ux-text-small ux-opacity-7">预计时间</text>
								<text class="ux-text-small">{{item.arrive || '-'}}/{{item.depart || '-'}}</text>
							</view>
							<view class="ux-flex ux-space-between ux-mt">
								<text class="ux-text-small ux-opacity-7">停台</text>
								<text class="ux-text-small">
									<!-- 停台信息 -->
									<text v-if="item.platform">{{item.platform}}</text>
									<button v-else-if="item.platform === null && showLoadAllButton" 
										@click.stop="loadPlatformByStationName(item.station)" 
										size="mini" type="primary" 
										style="margin: 0; padding: 0 5px; font-size: 10px; line-height: 20px; display: inline;">
										查询
									</button>
									<text v-else>-</text>
								</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view v-if="selectIndex==1">
				<uni-section title="担当" type="line" style="background-color: transparent;"
					title-font-size="28rpx"></uni-section>
				<view class="ux-bg-white ux-border-radius"
					v-if="(carData.carOwner || '')+(carData.runner || '')+(carData.car || '')!=''">

					<view v-if="carData.car && ['G','D','C','S'].includes(carData.numberKind) && carImageUrl">
						<view class="ux-flex ux-justify-content-center">
							<image :src="carImageUrl" @error="onImageError" mode="widthFix"
								style="width:100%; height: auto; border-top-left-radius: 10rpx; border-top-right-radius: 10rpx; border-bottom-left-radius: 0; border-bottom-right-radius: 0;"></image>
						</view>
						<view class="ux-flex ux-space-between ux-pt-small ux-pb-small ux-pl ux-pr ux-color-white"
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

				<view class="ux-padding">
					<button class="ux-color-white ux-bg-primary" size="mini" style="width:100%;"
						@click="addToMyRoute" 
						hover-class="ux-tap">
						<view class="ux-flex ux-align-items-center ux-justify-content-center">
							<text class="icon" style="font-size: 24rpx;">&#xe1b7;</text>
							<text style="margin-left: 8rpx;">加入我的行程</text>
						</view>
					</button>
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

			<view v-if="selectIndex==2">
				<view style="position:relative; margin-top: 10rpx;" :style="{height: mapHeightPx}">
					<siji-tianditu
						ref="sijiMapRef"
						:map-key="tdtMapKey"
						:lonlat="[118.05, 24.621]"
						:zoom="6"
						:on-loaded="onMapReady"
						style="width:100%;height:100%;"
					></siji-tianditu>
					<!-- 图例 -->
					<view style="position:absolute;bottom:20rpx;right:20rpx;background:rgba(255,255,255,0.92);border-radius:8rpx;padding:12rpx 20rpx;z-index:10;display:flex;flex-direction:column;gap:6rpx;">
						<view style="display:flex;align-items:center;gap:10rpx;">
							<view style="width:16rpx;height:16rpx;border-radius:50%;background:#114598;border:2rpx solid #fff;"></view>
							<text style="font-size:22rpx;color:#333;">站点</text>
						</view>
						<view style="display:flex;align-items:center;gap:10rpx;">
							<view style="width:12rpx;height:12rpx;border-radius:50%;background:#d70f19;border:2rpx solid #fff;"></view>
							<text style="font-size:22rpx;color:#333;">路径点</text>
						</view>
						<view style="display:flex;align-items:center;gap:10rpx;">
							<view style="width:18rpx;height:18rpx;border-radius:50%;background:#10b981;border:2rpx solid #fff;"></view>
							<text style="font-size:22rpx;color:#333;">列车实时位置</text>
						</view>
					</view>
				</view>
			</view>

			<br>
			<view class="ux-flex ux-row ux-justify-content-center">
				<text class="ux-text-small ux-opacity-4">—— · ——</text>
			</view>
		</view>
	</view>
	
	<!-- 自定义停台详情模态框 -->
	<view v-if="showPlatformModal" class="modal-overlay" @click="hidePlatformDetails">
		<view class="modal-content" @click.stop>
			<view class="modal-header">
				<text class="modal-title">详情</text>
				<text class="modal-close icon" @click="hidePlatformDetails">&#xe5cd;</text>
			</view>
			<view class="modal-body">
				<view v-if="selectedStationIndex >= 0 && carData.timetable[selectedStationIndex]" class="ux-padding">
					<!-- 车站名称 -->
					<view class="ux-mb-small">
						<text class="ux-bold" style="font-size: 36rpx;">{{carData.timetable[selectedStationIndex].station}}</text>
					</view>
					
					<!-- 停台信息 -->
					<view class="detail-item ux-bg-grey8 ux-border-radius ux-mt-small ux-padding-small">
						<view class="ux-mb-small">
							<text class="ux-text-small ux-opacity-5">停台</text>
						</view>
						<text class="ux-bold ux-text" style="font-size: 40rpx;">{{carData.timetable[selectedStationIndex].platform || '未查询'}}</text>
					</view>
					
					<!-- 检票口信息 -->
					<view class="detail-item ux-bg-grey8 ux-border-radius ux-mt-small ux-padding-small">
						<view class="ux-mb-small">
							<text class="ux-text-small ux-opacity-5">检票口</text>
						</view>
						<view v-if="carData.timetable[selectedStationIndex].entrance && carData.timetable[selectedStationIndex].entrance.length > 0">
							<text v-for="(entrance, idx) in carData.timetable[selectedStationIndex].entrance" :key="idx" class="ux-text ux-mr-small">
								{{entrance}}
							</text>
						</view>
						<text v-else class="ux-text-small ux-opacity-5">暂无数据</text>
					</view>
					
					<!-- 出站口信息 -->
					<view class="detail-item ux-bg-grey8 ux-border-radius ux-mt-small ux-padding-small">
						<view class="ux-mb-small">
							<text class="ux-text-small ux-opacity-5">出站口</text>
						</view>
						<view v-if="carData.timetable[selectedStationIndex].exit && carData.timetable[selectedStationIndex].exit.length > 0">
							<text v-for="(exit, idx) in carData.timetable[selectedStationIndex].exit" :key="idx" class="ux-text ux-mr-small">
								{{exit}}
							</text>
						</view>
						<text v-else class="ux-text-small ux-opacity-5">暂无数据</text>
					</view>
				</view>
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
	import SijiTianditu from '@/uni_modules/siji-tianditu/components/siji-tianditu/siji-tianditu.vue';
	import { gcj02ToWgs84 } from "@/scripts/coord_transform";
	import { getTrainPosition } from "@/scripts/trainPosition";

	export default {
		components: {
			calendar,
			SijiTianditu
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
					diagramType: ''
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
				"platformLoadThreshold": 15, 
				"allPlatformLoaded": false, 
				"showLoadAllButton": false, 
				// 停台详情模态框相关状态
				"showPlatformModal": false, 
				"selectedStationIndex": -1, 
				// 日期判断：是否是今天的日期
				"isTodayDate": true,
				// 天地图地图 key
				"tdtMapKey": "416cfaff76398b8567f8b7e48a933651",
				// 地图路径数据
				"mapStations": [],
				"mapLines": [],
				"mapReady": false,
				"mapDataReady": false,
				"mapHeightPx": "600px",
				"mapPointData": [],		// 存储绘制的站点+端点，用于实时刷新列车位置
				"trainPositionTimer": null, // 实时位置更新定时器
				"currentTrainPos": null,	// 当前列车实时位置 { lng, lat, status, currentStation }
			}
		},
		computed: {
			/**
			 * 结合正晚点数据 (this.delay) 和时刻表数据 (this.carData.timetable)
			 */
			combinedDelayData() {
				if (!this.delay || this.delay.length === 0) {
					return this.delay;
				}

				const timetableMap = new Map();
				// 建立车站名到时刻表信息的映射，包含时间等信息
				this.carData.timetable.forEach((item, index) => {
					timetableMap.set(item.station, {
						arrive: item.arrive,
						depart: item.depart,
						day: item.day,
						platform: item.platform,
						entrance: item.entrance,
						exit: item.exit,
						// 存储索引，用于单点查询时定位
						index: index, 
					});
				});

				// 合并数据
				return this.delay.map(delayItem => {
					const timetableInfo = timetableMap.get(delayItem.stationName);
					if (timetableInfo) {
						return {
							...delayItem,
							// 从时刻表获取时间信息
							arrivalTime: timetableInfo.arrive,
							departureTime: timetableInfo.depart,
							arrivalDate: timetableInfo.day,
							platform: timetableInfo.platform,
							entrance: timetableInfo.entrance,
							exit: timetableInfo.exit,
							stopMinutes: delayItem.stopMinutes, // 保留从API获取的停站时间
							// 携带索引以便于单点查询
							_index: timetableInfo.index
						};
					}
					// 即使找不到匹配，也返回原始 delayItem，但时间等字段为 null
					return {
						...delayItem,
						arrivalTime: null,
						departureTime: null,
						arrivalDate: null,
						platform: null,
						entrance: [],
						exit: [],
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

			// 判断日期是否是今天
			const today = new Date();
			const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
			// 支持两种格式：YYYYMMDD 或 YYYY-MM-DD
			const dateStr = this.date.replace(/-/g, '');
			this.isTodayDate = dateStr === todayStr || this.date === '';

			const mode = uni.getStorageSync("mode");
			this.isOnlyOfflineMode = uni.getStorageSync("ol") === true;

			// 计算地图高度：全屏剩余空间
			this.$nextTick(() => {
				this.calcMapHeight();
			});

			const c = uni.getStorageSync("search");
			uni.setStorage({
				key: 'search',
				data: c + 1
			});
			this.fillInData(mode);
		},
		onShow() {
			// #ifdef APP-PLUS
			plus.navigator.setStatusBarBackground('#114598');
			// #endif
		},
		onUnload() {
			this.stopTrainTracking();
		},
		methods: {
			/**
			 * 计算地图高度，占满屏幕剩余空间
			 */
			calcMapHeight() {
				const sysInfo = uni.getSystemInfoSync();
				// 使用系统信息估算顶部元素总高度（px）
				// 状态栏 + 返回按钮区域(60rpx) + 车次卡片(220rpx) + 提示(60rpx) + tabs(90rpx) + 间距
				const ratio = sysInfo.windowWidth / 750;
				const statusBarPx = sysInfo.statusBarHeight || 44;
				const headerRpx = 60 + 220 + 60 + 90 + 30;
				const offsetPx = statusBarPx + headerRpx * ratio;
				const availableHeight = sysInfo.windowHeight - offsetPx;
				this.mapHeightPx = Math.max(availableHeight, 400) + 'px';
			},
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
						title: '无法匹配车站信息'
					});
				}
			},
			/**
			 * 停台查询方法 (单个车站)
			 * @param {object} item 时刻表行数据 (carData.timetable中的元素)
			 * @param {number} index 时刻表行索引
			 * @param {boolean} silent 是否不显示 Toast 提示 (用于批量加载)
			 */
			/**
			 * 停台查询方法 (单个车站) - 使用 V2 API
			 * @param {object} item 时刻表行数据 (carData.timetable中的元素)
			 * @param {number} index 时刻表行索引
			 * @param {boolean} silent 是否不显示 Toast 提示 (用于批量加载)
			 */
			async loadPlatform(item, index, silent = false) {
				if (!item.stationTelecode || !this.date || !this.train) {
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

				// 确定 kind 参数：始发站（第一个站，index=0）使用 'departure'，其余使用 'arrival'
				const requestKind = index === 0 ? 'departure' : 'arrival';
				let result = { 
					success: false, 
					platform: '查询失败', 
					entrance: [], 
					exit: [] 
				};

				try {
					const currentItem = this.carData.timetable[index]; 
					
					// 使用新的 V2 API
					const exitBase = uni.getStorageSync('service_source_exit') || 'https://rg-api.zenglingkun.cn';
					const response = await uniGet(
						exitBase + `/api/v2/getExit?trainNum=${encodeURIComponent(this.train)}&stationTelecode=${item.stationTelecode}&date=${this.date}&kind=${requestKind}`
					);

					if (response.data && response.data.success === true && response.data.data) {
						result.success = true;
						result.platform = response.data.data.platform || '未知';
						result.entrance = response.data.data.entrance || [];
						result.exit = response.data.data.exit || [];
						
						// Success: Update the timetable item
						this.$set(this.carData.timetable, index, {
							...currentItem,
							platform: result.platform,
							entrance: result.entrance,
							exit: result.exit
						});
						
						if (!silent) {
							uni.showToast({
								title: '获取成功'
							});
						}
					} else {
						// Failure 
						if (!silent) {
							uni.showToast({
								title: response.data.msg || '查询失败'
							});
						}
						this.$set(this.carData.timetable, index, {
							...currentItem,
							platform: '查询失败',
							entrance: [],
							exit: []
						});
					}
				} catch (error) {
					console.error("查询停台数据出错:", error);
					if (!silent) {
						uni.showToast({
							title: '网络请求失败'
						});
					}
					const currentItem = this.carData.timetable[index];
					this.$set(this.carData.timetable, index, {
						...currentItem,
						platform: '网络错误',
						entrance: [],
						exit: []
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
				if (this.allPlatformLoaded) return;
				
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
					
					this.allPlatformLoaded = true;
					this.showLoadAllButton = false;
					
					uni.showToast({
						title: `加载完成！成功${successCount} / ${totalCount}站`,
						duration: 2000,
						position: 'bottom',
					});
					
				} catch (e) {
					uni.showToast({
						title: '批量加载出错'
					});
				} finally {
					uni.hideLoading();
				}
			},

			/**
			 * 计算实际到达/发车时间 (HH:mm)
			 */
			calculateActualTime: function(estimatedTime, delayStatus, delayTime) {
				if (!estimatedTime || estimatedTime === '-' || delayStatus === null || delayStatus === undefined) {
					return '-';
				}
				if (typeof delayTime !== 'number' || isNaN(delayTime) || delayTime === null) {
					return '-';
				}
				if (delayStatus === 'ON_TIME' || delayTime === 0) {
					return estimatedTime;
				}

				const parts = estimatedTime.split(':');
				let hours = parseInt(parts[0]);
				let minutes = parseInt(parts[1]);

				// 根据状态调整时间：早点需要减去时间，晚点需要加上时间
				let adjustedDelayTime = delayTime;
				if (delayStatus === 'EARLY') {
					// 早点：实际时间是预计时间减去延迟时间（延迟时间为负值或需要转为负值）
					// 根据API规范，早点delayTime应为负值，但若为正值则转为负值
					adjustedDelayTime = delayTime > 0 ? -delayTime : delayTime;
				} else if (delayStatus === 'DELAY') {
					// 晚点：实际时间是预计时间加上延迟时间（延迟时间应为正值）
					adjustedDelayTime = delayTime < 0 ? -delayTime : delayTime;
				}

				let totalMinutes = hours * 60 + minutes + adjustedDelayTime;

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
			 * 根据正晚点数据计算实际时间字符串（不约束在 0-24h，允许 "25:30" 跨日）
			 * @param {string} estimatedTime - 预计时间 "HH:mm"
			 * @param {string} delayStatus - 正晚点状态码
			 * @param {number} delayTime - 延迟分钟数
			 * @returns {string} 实际时间 "HH:mm"（小时可能 > 23）
			 */
			getAdjustedTimeStr(estimatedTime, delayStatus, delayTime) {
				if (!estimatedTime || estimatedTime === '-' || !delayStatus || typeof delayTime !== 'number') {
					return estimatedTime;
				}
				if (delayStatus === 'ON_TIME' || delayTime === 0) {
					return estimatedTime;
				}

				const parts = estimatedTime.split(':');
				let hours = parseInt(parts[0]);
				let minutes = parseInt(parts[1]);

				let adjustedDelay = delayTime;
				if (delayStatus === 'EARLY' || delayStatus === 'EARLY_PREDICTION') {
					adjustedDelay = -Math.abs(delayTime);
				} else if (delayStatus === 'DELAY' || delayStatus === 'DELAY_PREDICTION') {
					adjustedDelay = Math.abs(delayTime);
				} else {
					return estimatedTime;
				}

				let totalMinutes = hours * 60 + minutes + adjustedDelay;
				if (totalMinutes < 0) totalMinutes = 0;

				const finalHours = Math.floor(totalMinutes / 60);
				const finalMin = totalMinutes % 60;
				return `${String(finalHours).padStart(2, '0')}:${String(finalMin).padStart(2, '0')}`;
			},

			/**
			 * 基于正晚点数据构建修正时刻表，用实际时间替换预计时间
			 * @returns {Array|null} 修正后的时刻表，无正晚点数据返回 null
			 */
			buildActualTimetable() {
				if (!this.delay || this.delay.length === 0 || !this.carData.timetable) return null;

				// 建立正晚点数据索引：stationName → delayItem
				const delayMap = new Map();
				(this.combinedDelayData || []).forEach(item => {
					delayMap.set(item.stationName, item);
				});

				return this.carData.timetable.map(s => {
					const delay = delayMap.get(s.station);
					if (delay && delay.delayStatusCode) {
						const adjArrive = this.getAdjustedTimeStr(s.arrive, delay.delayStatusCode, delay.delayTime);
						const adjDepart = this.getAdjustedTimeStr(s.depart, delay.delayStatusCode, delay.delayTime);
						return { ...s, arrive: adjArrive, depart: adjDepart };
					}
					return s;
				});
			},

			/**
			 * 根据车次类型代码推断车次类型文本
			 * @param {string} numberKind 车次类型代码（G, D, C, Z, T, K等）
			 * @returns {string} 车次类型文本
			 */
			getTypeByNumberKind: function(numberKind) {
				switch (numberKind) {
					case 'G':
						return '高速';
					case 'D':
						return '动车';
					case 'C':
						return '城际';
					case 'Z':
						return '直达';
					case 'T':
						return '特快';
					case 'K':
						return '快速';
					case 'Y':
						return '旅游';
					case 'L':
						return '临客';
					case 'S':
						return '市郊';
					default:
						return '普客';
				}
			},

			/**
			 * 根据状态判断并返回状态文本
			 */
			/**
			 * 格式化正晚点状态文本
			 */
			formatDelayStatus: function(delayStatus, delayTime) {
				if (delayStatus === null || delayStatus === undefined) {
					return '-';
				}
				
				// 根据状态码返回对应的文本
				switch (delayStatus) {
					case 'ON_TIME':
						return '正点';
					case 'ON_TIME_PREDICTION':
						return '预计正点';
					case 'EARLY':
						return `早点${Math.abs(delayTime)}分`;
					case 'EARLY_PREDICTION':
						return `预计早点${Math.abs(delayTime)}分`;
					case 'DELAY':
						return `晚点${delayTime}分`;
					case 'DELAY_PREDICTION':
						return `预计晚点${delayTime}分`;
					case 'MAINTAINCE_MISSING':
						return '未维护';
					default:
						return '-';
				}
			},

			/**
			 * 根据状态返回对应的 CSS 颜色
			 */
			getDelayStatusColor: function(delayStatus, delayTime) {
				// 早点系列：绿色
				if (delayStatus === 'EARLY' || delayStatus === 'EARLY_PREDICTION') {
					return 'color: #27ae60; font-weight: bold;';
				}
				// 晚点系列：红色
				if (delayStatus === 'DELAY' || delayStatus === 'DELAY_PREDICTION') {
					return 'color: #c0392b; font-weight: bold;';
				}
				// 正点系列：蓝色（主题色）
				if (delayStatus === 'ON_TIME' || delayStatus === 'ON_TIME_PREDICTION') {
					return 'color: #114598; font-weight: bold;';
				}
				// 未维护或其他：灰色
				return 'color: #606266; font-weight: bold;';
			},

			/**
			 * 根据状态返回对应的背景色
			 */
			getDelayStatusBackground: function(delayStatus) {
				// 早点系列：绿色
				if (delayStatus === 'EARLY' || delayStatus === 'EARLY_PREDICTION') {
					return 'background-color: #27ae60;';
				}
				// 晚点系列：红色
				if (delayStatus === 'DELAY' || delayStatus === 'DELAY_PREDICTION') {
					return 'background-color: #c0392b;';
				}
				// 正点系列：蓝色（主题色）
				if (delayStatus === 'ON_TIME' || delayStatus === 'ON_TIME_PREDICTION') {
					return 'background-color: #114598;';
				}
				// 未维护：灰色
				if (delayStatus === 'MAINTAINCE_MISSING') {
					return 'background-color: #606266;';
				}
				// 默认：主题色
				return 'background-color: #114598;';
			},

			/**
			 * 图片加载失败时的处理函数，实现 Fallback 逻辑
			 */
			onImageError: function(e) {
			    this.carImageUrl = '';
			    console.error("Image load failed, hiding image container.");
			},

			/**
			 * NEW: Fetch image source from JSON API
			 */
			async fetchImageSource() {
			    const carModel = this.carData.car ? this.carData.car.replace(' 重联', '') : null;
			    if (!carModel) {
			        this.carImageUrl = ''; // 没有车型直接清空
			        this.isImageLoading = false;
			        return;
			    }
			
			    try {
			        const tpBase = uni.getStorageSync('service_source_tp') || 'https://tp.railgo.zenglingkun.cn';
			        const url = tpBase + `/api/${encodeURIComponent(carModel)}.json`;
			        const resp = await uniGet(url);
			
			        if (resp.data && resp.data.success && resp.data.data && resp.data.data.image_url) {
			            this.carImageUrl = resp.data.data.image_url;
			            this.imageUploaderUsername = resp.data.data.uploader_username || '匿名';
			        } else {
			            this.carImageUrl = '';
			        }
			    } catch (e) {
			        this.carImageUrl = '';
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
						// ===== 第一步：调用 V2 接口获取主数据 =====
						const trainV2Base = uni.getStorageSync('service_source_train_v2') || 'https://rg-api.zenglingkun.cn';
						const v2Resp = await uniGet(
							trainV2Base + `/api/v2/getTrainMain?trainNum=${encodeURIComponent(this.train)}&date=${encodeURIComponent(this.date || '')}`
						);
						const v2Result = v2Resp.data;

						// V2 接口失败，直接跳转 404，不再继续
						if (!v2Result.success || !v2Result.data || !v2Result.data.timetable || v2Result.data.timetable.length === 0) {
							this.carData = { /* ... reset data ... */ };
							this.cardColor = '#114598';
							uni.showToast({
								title: '车次不存在或当日不开行'
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

						// ===== 第二步：调用 V1 接口获取交路数据 =====
						let diagramData = [];
						let diagramType = '';
						let v1Timetable = null; // 用于补全 distance/speed
						try {
							const trainBase = uni.getStorageSync('service_source_train') || 'https://data.railgo.zenglingkun.cn';
							const v1Resp = await uniGet(
								trainBase + `/api/train/query?train=${encodeURIComponent(this.train)}`
							);
							const v1Result = v1Resp.data;
							
							if (!v1Result.error) {
								// 保存 V1 时刻表用于补全 distance/speed
								v1Timetable = v1Result.timetable || null;
								
								// 获取交路数据
								if (v1Result.diagram) {
									diagramData = Array.isArray(v1Result.diagram) ? v1Result.diagram.map(item => ({
										...item,
										from: Array.isArray(item.from) ? item.from : [],
										to: Array.isArray(item.to) ? item.to : []
									})) : [];
									diagramType = v1Result.diagramType || '';
								}
							}
						} catch (v1Error) {
							console.warn("获取V1数据失败（不影响主数据显示）", v1Error);
							// V1 失败，交路数据留空，不影响主数据显示
							diagramData = [];
							diagramType = '';
							v1Timetable = null;
						}

						// ===== 第三步：合并数据 =====
						// 成功处理，使用 V2 主数据 + V1 交路数据 + V1 时刻表补全
						
						// 构建 V1 时刻表查询映射（按 stationTelecode 匹配）
						const v1TimetableMap = {};
						if (v1Timetable) {
							v1Timetable.forEach(item => {
								if (item.stationTelecode) {
									v1TimetableMap[item.stationTelecode] = item;
								}
							});
						}
						
						this.carData = {
							numberKind: v2Result.data.numberKind || '',
							numberFull: Array.isArray(v2Result.data.numberFull) ? v2Result.data.numberFull : [],
							type: '', // V2 没有 type 字段，根据 numberKind 推断
							timetable: (v2Result.data.timetable || []).map(item => {
								const v1Match = v1TimetableMap[item.stationTelecode];
								return {
									station: '',
									stationTelecode: '',
									trainCode: '',
									arrive: '',
									depart: '',
									distance: v1Match && v1Match.distance ? v1Match.distance : '-',
									speed: v1Match && v1Match.speed ? v1Match.speed : 0,
									day: '-',
									platform: null, 
									entrance: [], 
									exit: [], 
									...item
								};
							}),
							bureauName: v2Result.data.bureauShortName || '', // 使用 bureauShortName
							bureau: v2Result.data.bureau || '', // 新字段：担当局代码
							runner: v2Result.data.runner || '',
							carOwner: v2Result.data.carOwner || '',
							car: v2Result.data.car || '',
							rundays: Array.isArray(v2Result.data.rundays) ? v2Result.data.rundays : [],
							spend: v2Result.data.spend || 0, // 新字段：总运行时间
							diagram: diagramData, // V1 的交路数据
							diagramType: diagramType // V1 的交路类型
						};
						
						// 根据 numberKind 推断 type
						this.carData.type = this.getTypeByNumberKind(this.carData.numberKind);
						
						this.cardColor = this.colorMap[this.carData.numberKind] || '#114598';
						loadSuccess = true; 

						// 异步获取运行线路点
						this.fetchMapLine();

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
								entrance: [], 
								exit: [], 
								...item
							}));
							this.cardColor = this.colorMap[this.carData.numberKind] || '#114598';
							loadSuccess = true;

						} else {
							this.carData = { /* ... reset data ... */ };
							this.cardColor = '#114598';
							uni.showToast({
								title: '车次不存在'
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
					// if (carModel) {
					// 	this.carImageUrl = `https://tp.railgo.zenglingkun.cn/api/${encodeURIComponent(carModel)}.png`;
					// } else {
					// 	this.carImageUrl = '';
					// }
                    
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
					// 只有今天的日期才加载正晚点数据
					let delayLoadSuccess = false;
					if (loadSuccess && this.carData.timetable.length > 0 && this.isTodayDate) {
						if (this.train && this.date) {
							uni.showLoading({
								title: '加载正晚点数据'
							}) // [2] 正晚点加载开始
							try {
								const delayBase = uni.getStorageSync('service_source_trainDelay') || 'https://rg-api.zenglingkun.cn';
								const delayResp = await uniGet(
									delayBase + `/api/v2/getTrainDelayAll?trainNum=${encodeURIComponent(this.train)}`
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
					// 只有今天的日期才加载停台信息
					if (loadSuccess && this.carData.timetable.length > 0 && this.isTodayDate) {
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
			addToMyRoute: function() {
				// 将车次信息保存到行程中
				const routeData = {
					trainNum: this.train,
					numberKind: this.carData.numberKind,
					from: this.carData.timetable && this.carData.timetable.length > 0 ? this.carData.timetable[0].station : '',
					to: this.carData.timetable && this.carData.timetable.length > 0 ? this.carData.timetable[this.carData.timetable.length - 1].station : '',
					date: this.date,
					seat: '',
					fromStation: this.carData.timetable && this.carData.timetable.length > 0 ? this.carData.timetable[0].station : '',
					toStation: this.carData.timetable && this.carData.timetable.length > 0 ? this.carData.timetable[this.carData.timetable.length - 1].station : '',
					bureauName: this.carData.bureauName,
					car: this.carData.car,
					runner: this.carData.runner,
					timetable: this.carData.timetable // 保存完整的时刻表
				};
				
				uni.navigateTo({
					url: `/pages/route/addRoute?trainNum=${this.train}&date=${this.date}`
				});
			},
			tabChange: function(e) {
				this.selectIndex = e.index;
			},
			
			/**
			 * 显示停台详情模态框
			 */
			showPlatformDetails: function(item, index) {
				this.selectedStationIndex = index;
				this.showPlatformModal = true;
			},
			
			/**
			 * 隐藏停台详情模态框
			 */
			hidePlatformDetails: function() {
				this.showPlatformModal = false;
				this.selectedStationIndex = -1;
			},
			/**
			 * 获取列车运行线路点
			 */
			async fetchMapLine() {
				try {
					const mapLineBase = uni.getStorageSync('service_source_mapLine') || 'https://rg-api.zenglingkun.cn';
					const resp = await uniGet(mapLineBase + '/api/v2/mapLine', {
						params: { train: this.train }
					});
					if (resp && resp.data && resp.data.data) {
						// GCJ-02 → WGS-84 坐标转换
						const raw = resp.data.data;
						// 转换站点坐标
						const stations = (raw.stations || []).map(s => {
							const entries = Object.entries(s);
							const name = entries[0][0];
							const coords = entries[0][1];
							const wgs = gcj02ToWgs84(parseFloat(coords[0]), parseFloat(coords[1]));
							return { [name]: [wgs.lng, wgs.lat] };
						});
						// 转换线路坐标
						const lines = {};
						if (raw.train) {
							Object.keys(raw.train).forEach(key => {
								const seg = raw.train[key];
								lines[key] = {
									index: seg.index,
									line: seg.line.map(pt => {
										const wgs = gcj02ToWgs84(parseFloat(pt[0]), parseFloat(pt[1]));
										return [wgs.lng, wgs.lat];
									})
								};
							});
						}
						this.mapStations = stations;
						this.mapLines = lines;
						this.mapDataReady = true;
						this.drawRouteOnMap();
					}
				} catch (e) {
					console.warn('获取运行线路点失败', e);
				}
			},
			/**
			 * 在地图上绘制线路和站点
			 */
			drawRouteOnMap() {
				if (!this.mapReady || !this.mapDataReady || !this.$refs.sijiMapRef) return;

				// 1. 绘制各区间线路
				const segments = Object.values(this.mapLines).sort((a, b) => a.index - b.index);
				const allCoords = [];
				const routeSegments = [];
				segments.forEach(seg => {
					if (seg.line && seg.line.length > 0) {
						seg.line.forEach(pt => allCoords.push(pt));
						routeSegments.push({
							points: seg.line,
							style: { color: '#114598', width: 4 }
						});
					}
				});

				// 2. 收集所有站点名称（去重）
				const stationMap = {};
				this.mapStations.forEach(s => {
					const entries = Object.entries(s);
					const name = entries[0][0];
					const coords = entries[0][1];
					stationMap[name] = { lng: coords[0], lat: coords[1], name };
				});

				// 3. 收集路径段端点（排除已存在的站点）
				const endpointMap = {};
				Object.keys(this.mapLines).forEach(key => {
					const parts = key.split('-');
					if (parts.length >= 2) {
						const seg = this.mapLines[key];
						if (seg.line && seg.line.length > 0) {
							const start = seg.line[0];
							const end = seg.line[seg.line.length - 1];
							[parts[0], parts[1]].forEach((name, idx) => {
								const pt = idx === 0 ? start : end;
								if (pt && !stationMap[name]) {
									endpointMap[name] = { lng: pt[0], lat: pt[1], name };
								}
							});
						}
					}
				});

				// 4. 合并站点和路径端点
				const allPoints = [];
				Object.values(stationMap).forEach(p => {
					allPoints.push({ ...p, fill: '#114598', radius: 10, stroke: '#fff' });
				});
				Object.values(endpointMap).forEach(p => {
					allPoints.push({ ...p, fill: '#d70f19', radius: 8, stroke: '#fff' });
				});

				// 保存点位数据用于实时位置更新
				this.mapPointData = allPoints;

				// 5. 绘制：先清空，再画路线，再画站点
				this.$refs.sijiMapRef.clearAll();
				if (routeSegments.length > 0) {
					this.$refs.sijiMapRef.drawRoute(routeSegments);
				}
				if (allPoints.length > 0) {
					this.$refs.sijiMapRef.drawMarkers(allPoints);
				}

				// 启动实时位置追踪
				this.$nextTick(() => this.startTrainTracking());

				// 6. 缩放至路线范围
				if (allCoords.length > 0) {
					// 取路线中心点，设合适的缩放级别展示全貌
					const lngs = allCoords.map(c => c[0]);
					const lats = allCoords.map(c => c[1]);
					const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
					const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
					// 根据路线跨度估算缩放级别
					const lngSpan = Math.max(...lngs) - Math.min(...lngs);
					const latSpan = Math.max(...lats) - Math.min(...lats);
					const maxSpan = Math.max(lngSpan, latSpan);
					let zoom = 6;
					if (maxSpan > 10) zoom = 5;
					else if (maxSpan > 5) zoom = 6;
					else if (maxSpan > 2) zoom = 7;
					else if (maxSpan > 1) zoom = 8;
					else zoom = 9;
					this.$refs.sijiMapRef.setCenter(centerLng, centerLat, zoom);
				}

			},
			/**
			 * 启动实时位置追踪（每10秒更新一次，非今天日期或当日不开行不追踪）
			 */
			startTrainTracking() {
				this.stopTrainTracking();
				if (!this.isTodayDate) return;
				// 当日不开行也不追踪
				if (this.carData.rundays && !this.carData.rundays.includes(this.date)) return;
				// 立即更新一次
				this.updateTrainPosition();
				// 每10秒刷新
				this.trainPositionTimer = setInterval(() => {
					this.updateTrainPosition();
				}, 10000);
			},
			/**
			 * 停止实时位置追踪
			 */
			stopTrainTracking() {
				if (this.trainPositionTimer) {
					clearInterval(this.trainPositionTimer);
					this.trainPositionTimer = null;
				}
			},
			/**
			 * 更新列车实时位置标记
			 */
			updateTrainPosition() {
				if (!this.mapDataReady || !this.mapReady || !this.$refs.sijiMapRef) return;
				// 非今天日期或当日不开行不计算实时位置
				if (!this.isTodayDate) return;
				if (this.carData.rundays && !this.carData.rundays.includes(this.date)) return;
				// 有正晚点数据时，用实际时间构建修正时刻表
				const timetable = (this.delay && this.delay.length > 0)
					? (this.buildActualTimetable() || this.carData.timetable)
					: this.carData.timetable;
				if (!timetable || timetable.length < 2) return;

				const pos = getTrainPosition(timetable, this.mapLines, this.mapStations);
				if (!pos || !pos.lng || !pos.lat) return;

				this.currentTrainPos = pos;

				// 构建实时位置圆点
				let fillColor = '#10b981'; // 运行中绿色
				let label = '运行中';
				if (pos.status === 'stopped') {
					fillColor = '#f59e0b'; // 停站橙色
					label = '停站·' + (pos.currentStation || '');
				} else if (pos.status === 'not_departed') {
					fillColor = '#94a3b8'; // 未出发灰色
					label = '未出发';
				} else if (pos.status === 'arrived') {
					fillColor = '#64748b'; // 已到达灰色
					label = '已到达';
				}

				const trainPoint = {
					lng: pos.lng,
					lat: pos.lat,
					name: this.train + ' ' + label,
					fill: fillColor,
					radius: 14,
					stroke: '#fff',
					strokeWidth: 3,
				};

				// 合并已有站点/端点 + 列车位置，一次重绘
				const allPoints = [...(this.mapPointData || [])];
				// 替换已有的列车点或追加
				const existingIdx = allPoints.findIndex(p => p._isTrain);
				if (existingIdx >= 0) {
					allPoints[existingIdx] = { ...trainPoint, _isTrain: true };
				} else {
					allPoints.push({ ...trainPoint, _isTrain: true });
				}

				this.$refs.sijiMapRef.drawMarkers(allPoints);
			},
			/**
			 * 地图组件就绪，绘制路线
			 */
			onMapReady() {
				this.mapReady = true;
				if (this.$refs.sijiMapRef) {
					// 给地图留时间初始化后再绘制
					setTimeout(() => this.drawRouteOnMap(), 500);
				}
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
	
	/* 自定义模态框样式 */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
	}
	
	.modal-content {
		width: 85%;
		max-width: 600rpx;
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		background-color: #114598;
		color: #fff;
	}
	
	.modal-title {
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.modal-close {
		font-size: 40rpx;
		cursor: pointer;
	}
	
	.modal-body {
		padding: 20rpx;
		max-height: 60vh;
		overflow-y: auto;
	}
	
	.detail-item {
		margin-bottom: 20rpx;
	}
</style>