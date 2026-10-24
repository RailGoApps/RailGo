<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
	<back-header></back-header>
	<railgo-nfc></railgo-nfc><!-- TODO: preview 为 H5 临时预览开关，上线前移除 -->
		<view class="ux-pl ux-pr ux-pb">

			<view class="ux-bg-white ux-border-radius" style="overflow:hidden;">
				<view class="ux-flex ux-space-between ux-pl ux-pr ux-align-items-center" style="padding-top:36rpx;padding-bottom:28rpx;">
					<view>
						<text class="ux-bold consolas" style="font-size:60rpx;"
							:style="'color:'+cardColor">{{carData.numberKind || ''}}</text>
						<text class="consolas"
							style="font-size:50rpx;padding-left:5rpx;">{{(carData.numberFull || []).join("/").replace(carData.numberKind, "").replace(carData.numberKind, "")}}</text>
					</view>
					<!-- 胶囊：左=交路类型（透底描边），右=列车类型（实心），双边 -2px 重叠；无交路类型时单颗实心徽章 -->
					<view v-if="carData.diagramType">
						<text class="ux-text-small" style="padding:5rpx 5rpx 5rpx 10rpx;"
							:style="'border-top-left-radius:38rpx;border-bottom-left-radius:38rpx;border:solid '+cardColor+' 2px;color:'+cardColor">{{carData.diagramType || ''}}</text>
						<text class="ux-text-small" style="padding:5rpx 10rpx 5rpx 5rpx;margin-left:-2px;"
							:style="'border-top-right-radius:38rpx;border-bottom-right-radius:38rpx;color:#ffffff;background-color:'+cardColor+';border:solid '+cardColor+' 2px;'">{{carData.type || ''}}</text>
					</view>
					<view v-if="!carData.diagramType && carData.type">
						<text class="ux-badge ux-text-small ux-color-white" style="padding:5rpx 15rpx;"
							:style="'background-color:'+cardColor">{{carData.type || ''}}</text>
					</view>
				</view>
				<view class="ux-flex ux-space-between ux-pl ux-pr ux-color-white"
					style="padding-top:18rpx;padding-bottom:18rpx;"
					:style="'background-color:'+cardColor">
					<text
						class="ux-text-small">{{(carData.timetable && carData.timetable[0] ? carData.timetable[0].station : '')}}
						⋙
						{{(carData.timetable && carData.timetable.length > 0 ? carData.timetable[carData.timetable.length-1].station : '')}}</text>
					<text class="ux-text-small">{{carData.bureauName || ''}}{{carData.runner || ''}}&nbsp;&nbsp;</text>
				</view>
			</view>
			<!-- 按钮行：与原版对齐——等高、留间隙，左描边提示 + 右实心加入行程 -->
			<view class="ux-flex" style="margin-top:36rpx;align-items:stretch;">
				<view class="ux-flex1 ux-flex ux-align-items-center ux-justify-content-center ux-h6"
					style="height:76rpx;box-sizing:border-box;background-color:#e9eef5;border:2rpx solid #114598;border-radius:10rpx;color:#114598;">
					<text class="ux-bold">信息仅供参考 请以实际为准</text>
				</view>
				<button class="ux-color-white ux-bg-primary" size="mini"
					style="margin:0 0 0 20rpx;border-radius:10rpx;height:76rpx;padding:0 40rpx;box-sizing:border-box;"
					@click="addToMyRoute" hover-class="ux-tap">
					<view class="ux-flex ux-align-items-center ux-justify-content-center" style="height:100%;">
						<text class="icon" style="font-size: 24rpx;">&#xe1b7;</text>
						<text style="margin-left: 8rpx;">加入行程</text>
					</view>
				</button>
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

				<!-- 日期在±3天范围内才显示正晚点和停台信息 -->
				<view v-if="isWithinDelayDays">
					<uni-section title="正晚点" type="line" style="background-color: transparent;"
						title-font-size="28rpx"></uni-section>

					<!-- 大卡：卡片内直接展开明细，停台信息按站数自动/一键加载 -->
					<block v-if="delayCardStyle === 'big'">
						<view v-if="showLoadAllButton" class="ux-pb-small">
							<button @click="loadAllPlatforms" type="primary" size="mini"
								style="margin: 0; padding: 0 15px; font-size: 14px; line-height: 30px;">
								一键全部加载停台信息 (共{{(carData.timetable || []).length}}站)
							</button>
						</view>

						<view v-for="(item,index) in combinedDelayData" :key="index"
							class="ux-bg-white ux-border-radius ux-mt-small">
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
									<text class="ux-text-small ux-opacity-7">停站时间</text>
									<text class="ux-text-small">{{formatStopMinutes(item)}}</text>
								</view>
								<view class="ux-flex ux-space-between ux-mt">
									<text class="ux-text-small ux-opacity-7">停台/检票口</text>
									<text class="ux-text-small">
										<text v-if="item.platform">{{formatDelayPlatform(item)}}</text>
										<button v-else-if="showLoadAllButton"
											@click="loadPlatformByStationName(item.stationName)"
											size="mini" type="primary"
											style="margin: 0; padding: 0 5px; font-size: 10px; line-height: 20px; display: inline;">
											查询
										</button>
										<text v-else>-</text>
									</text>
								</view>
							</view>
						</view>

						<view v-if="delay.length === 0" class="ux-bg-white ux-border-radius ux-padding ux-text-center">
							<text v-if="isOnlyOfflineMode" class="ux-color-gray">仅离线模式下无法使用该功能</text>
							<text v-else>暂无正晚点信息或加载失败</text>
						</view>
					</block>

					<!-- 小卡：仅站点名与状态，点击后在底部弹层看明细 -->
					<block v-else>
					<view v-for="(item,index) in combinedDelayData" :key="index"
						class="ux-bg-white ux-border-radius ux-mt-small"
						@click="openDelaySheet(item, index)"
						hover-class="ux-tap">
						<view class="ux-flex">
							<view style="border-bottom-left-radius: 10rpx; border-top-left-radius:10rpx; width: 12rpx;"
								:style="getDelayStatusBackground(item.delayStatusCode)">
							</view>
							<view class="ux-flex ux-space-between ux-padding ux-align-items-center" style="width: 100%;">
								<text class="ux-bold" style="font-size: 32rpx;">{{item.stationName || ''}}</text>
								<text :style="getDelayStatusColor(item.delayStatusCode, item.delayTime)" class="ux-bold" style="font-size: 28rpx;">
									{{formatDelayStatus(item.delayStatusCode, item.delayTime)}}
								</text>
							</view>
						</view>
					</view>
					<view v-if="delay.length === 0" v-for="(item,index) in (carData.timetable || [])" :key="index"
						class="ux-bg-white ux-border-radius ux-mt-small"
						@click="openDelaySheet(item, index)"
						hover-class="ux-tap">
						<view class="ux-flex">
							<view style="border-bottom-left-radius: 10rpx; border-top-left-radius:10rpx; width: 12rpx;"
								:style="'background-color: #606266;'">
							</view>
							<view class="ux-flex ux-space-between ux-padding ux-align-items-center" style="width: 100%;">
								<text class="ux-bold" style="font-size: 32rpx;">{{item.station || ''}}</text>
								<text :style="'color: #606266; font-weight: bold;'" class="ux-bold" style="font-size: 28rpx;">
									未维护
								</text>
							</view>
						</view>
					</view>
					</block>
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
				<!-- 模式切换：地图 / 简图 -->
				<view class="path-toolbar">
					<view class="path-mode-tabs">
						<view class="path-mode-tab" :class="{ 'path-mode-tab--active': pathViewMode === 'map' }"
							@click="setPathViewMode('map')">
							<text class="icon path-mode-icon">&#xe642;</text>
							<text>地图模式</text>
						</view>
						<view class="path-mode-tab" :class="{ 'path-mode-tab--active': pathViewMode !== 'map' }"
							@click="setPathViewMode('schematic')">
							<text class="icon path-mode-icon">&#xe5c8;</text>
							<text>简图模式</text>
						</view>
					</view>
					<view class="path-toolbar-actions">
						<text v-if="pathLoading" class="path-toolbar-hint">算路中…</text>
						<view v-else class="path-recalc" hover-class="ux-tap" @click="fetchRoutePlan">
							<text>重算</text>
						</view>
					</view>
				</view>

				<!-- 失败提示 -->
				<view v-if="pathError" class="ux-bg-white ux-border-radius path-state path-state--error">
					<text class="path-state-title">算路失败</text>
					<text class="path-state-msg">{{pathError}}</text>
					<text class="path-state-sub">服务地址：{{pathApiBase}}</text>
					<view class="path-state-actions">
						<button size="mini" class="path-primary-btn" @click="fetchRoutePlan">重试</button>
					</view>
				</view>

				<block v-if="pathResult">
					<!-- 地图模式 -->
					<view v-if="pathViewMode === 'map'">
						<view class="path-map-box" :style="{height: mapHeightPx}">
							<siji-tianditu
								ref="sijiMapRef"
								:map-key="tdtMapKey"
								:lonlat="[118.05, 24.621]"
								:zoom="6"
								:on-loaded="onMapReady"
								style="width:100%;height:100%;"
							></siji-tianditu>
							<view class="path-map-legend">
								<view class="path-map-legend-item">
									<view class="path-legend-dot path-legend-dot--stop"></view>
									<text>停靠站</text>
								</view>
								<view class="path-map-legend-item">
									<view class="path-legend-dot path-legend-dot--change"></view>
									<text>换线站</text>
								</view>
								<view class="path-map-legend-item">
									<view class="path-legend-dot path-legend-dot--office"></view>
									<text>线路所</text>
								</view>
								<view class="path-map-legend-item">
									<view class="path-legend-dot path-legend-dot--train"></view>
									<text>列车实时位置</text>
								</view>
							</view>
						</view>
						<view v-if="pathRouteLegend.length" class="ux-bg-white ux-border-radius path-route-legend">
							<view v-for="(route, index) in pathRouteLegend" :key="index" class="path-route-legend-row">
								<view class="path-legend-swatch" :style="{backgroundColor: route.color}"></view>
								<text class="path-route-legend-name">{{route.routeName}}</text>
								<text class="path-route-legend-mileage">{{route.mileage}} km</text>
							</view>
						</view>
						<text class="path-time-note path-time-note--map">{{pathMapTimeNote}}</text>
					</view>

					<!-- 简图模式（蛇形线路图，参考 RailLog 经由图） -->
					<view v-else class="ux-bg-white ux-border-radius path-schematic-card">
						<uni-section class="path-schematic-section" title="经由简图" type="line"
							title-font-size="28rpx" style="background-color: transparent;">
							<template v-slot:right>
								<view class="path-schematic-toggle" hover-class="ux-tap" @click="toggleSchematicExpand">
									<text>{{schematicExpandIntermediate ? '仅看停靠站' : '展开中间站'}}</text>
								</view>
							</template>
						</uni-section>
						<view v-if="schematicRows.length === 0" class="path-state">
							<text class="path-state-sub">暂无简图数据</text>
						</view>
						<view v-else class="path-schematic">
							<view v-for="(row, rowIndex) in schematicRows" :key="rowIndex" class="path-row"
								:class="{ 'path-row--reverse': row.isReversed }">
								<view v-for="(item, colIndex) in row.items" :key="colIndex" class="path-cell"
									:class="{ 'path-cell--empty': !item }">
									<block v-if="item">
										<view v-if="item.chip" class="path-route-chip"
											:style="{ color: item.chip.color, borderColor: item.chip.color, maxWidth: item.chip.maxWidth + '%' }">
											{{item.chip.routeName}}
										</view>
										<view v-if="item.fromEdgeColor" class="path-line path-line--from-edge"
											:style="{backgroundColor: item.fromEdgeColor}"></view>
										<view v-if="item.toNextColor" class="path-line path-line--next"
											:style="{backgroundColor: item.toNextColor}"></view>
										<view v-if="item.toEdgeColor" class="path-line path-line--edge"
											:style="{backgroundColor: item.toEdgeColor}"></view>
										<view class="path-dot"
											:style="{'background-image': 'linear-gradient(90deg,' + item.leftColor + ' 50%,' + item.rightColor + ' 50%)'}"></view>
										<view class="path-station">
											<text class="path-station-name" :class="{ 'path-station-name--stop': item.isStop }">{{item.name}}</text>
											<text class="path-station-mileage">{{formatSchematicMileage(item.mileage)}}</text>
											<text v-if="item.time" class="path-station-time"
												:class="{ 'path-station-time--estimated': item.time.estimated }">{{item.time.label}}</text>
										</view>
									</block>
								</view>
								<view v-if="row.connector" class="path-connector"
									:class="{ 'path-connector--left': row.isReversed }"
									:style="{backgroundColor: row.connector.color, color: row.connector.color}"></view>
							</view>
						</view>
						<view v-if="pathRouteLegend.length" class="path-schematic-legend">
							<view v-for="(route, index) in pathRouteLegend" :key="index" class="path-schematic-legend-item">
								<view class="path-legend-swatch" :style="{backgroundColor: route.color}"></view>
								<text class="path-schematic-legend-name">{{route.routeName}}</text>
								<text class="path-schematic-legend-mileage">{{route.mileage}} km</text>
							</view>
						</view>
						<text class="path-time-note">{{pathTimeNote}}</text>
					</view>
				</block>
			</view>

			<br>
			<view class="ux-flex ux-row ux-justify-content-center">
				<text class="ux-text-small ux-opacity-4">—— · ——</text>
			</view>
		</view>
		<railgo-loader></railgo-loader>
	</view>
	
	<!-- 正晚点详情底部弹出卡片 -->
	<view v-if="sheetRender" class="sheet-overlay" :class="{ 'sheet-overlay--leave': sheetLeaving }" @click="closeDelaySheet">
		<view class="sheet-panel" @click.stop>
			<view class="sheet-handle"></view>
			<view class="sheet-head">
				<text class="sheet-station">{{ sheetData.stationName || '' }}</text>
				<text class="icon sheet-close" @click="closeDelaySheet">&#xe5cd;</text>
			</view>
			<!-- 三列：到达 / 停留 / 出发 -->
			<view class="sheet-times">
				<view class="sheet-time-col" :style="getDelayTintBackground(sheetData.delayStatusCode)">
					<text class="sheet-time-label">到达</text>
					<text class="sheet-time-main">{{ calculateActualTime(sheetData.arrivalTime, sheetData.delayStatusCode, sheetData.delayTime) }}</text>
					<text class="sheet-time-sub"
						:class="{ 'sheet-time-sub--diff': isTimeChanged(sheetData.arrivalTime, sheetData.delayStatusCode, sheetData.delayTime) }">{{ sheetData.arrivalTime || '-' }}</text>
				</view>
				<view class="sheet-time-col sheet-time-col--mid">
					<text class="sheet-time-label">停留</text>
					<text class="sheet-time-main">{{ isFirstOrLastStop(sheetData) ? '-' : getStopMinutesText(sheetData) }}</text>
					<text class="sheet-time-sub">STAY</text>
				</view>
				<view class="sheet-time-col" :style="getDelayTintBackground(sheetData.delayStatusCode)">
					<text class="sheet-time-label">出发</text>
					<text class="sheet-time-main">{{ calculateActualTime(sheetData.departureTime, sheetData.delayStatusCode, sheetData.delayTime) }}</text>
					<text class="sheet-time-sub"
						:class="{ 'sheet-time-sub--diff': isTimeChanged(sheetData.departureTime, sheetData.delayStatusCode, sheetData.delayTime) }">{{ sheetData.departureTime || '-' }}</text>
				</view>
			</view>
			<!-- 状态色条：单条通栏，颜色跟随正晚点状态（正点为主题蓝） -->
			<view class="sheet-bars">
				<view class="sheet-bar" :style="getDelayBarBackground(sheetData.delayStatusCode)">
					<text class="sheet-bar-text">{{ formatDelayStatus(sheetData.delayStatusCode, sheetData.delayTime) }}</text>
				</view>
			</view>
			<!-- 检票口 / 站台 -->
			<view class="sheet-cards">
				<view class="sheet-card sheet-card--gate">
					<text class="sheet-card-label">检票口</text>
					<view v-if="sheetStation.entrance && sheetStation.entrance.length > 0">
						<text v-for="(entrance, idx) in sheetStation.entrance" :key="idx"
							class="sheet-card-value sheet-card-value--gate">{{ entrance }}</text>
					</view>
					<text v-else class="sheet-card-value sheet-card-value--empty">-</text>
				</view>
				<view class="sheet-card sheet-card--platform">
					<text class="sheet-card-label">站台</text>
					<text v-if="sheetPlatformLoading" class="sheet-card-value sheet-card-value--empty">获取中…</text>
					<text v-else-if="sheetStation.platform && sheetStation.platform !== '查询失败' && sheetStation.platform !== '网络错误'"
						class="sheet-card-value sheet-card-value--platform">{{ sheetStation.platform }}</text>
					<button v-else
						@click="maybeFetchSheetPlatform"
						size="mini" type="primary"
						style="margin: 0; padding: 0 5px; font-size: 10px; line-height: 20px; display: inline;">
						查询
					</button>
					<text v-else class="sheet-card-value sheet-card-value--empty">-</text>
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
	import { getTrainPosition, getMinutesSinceDate } from "@/scripts/trainPosition";
	import { showLoader, hideLoader } from "@/scripts/loader.js";
	import RailgoLoader from "@/components/railgo-loader/railgo-loader.vue";

	export default {
		components: {
			calendar,
			SijiTianditu,
			RailgoLoader
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
				// 正晚点详情底部弹层相关状态
				"sheetRender": false, 
				"sheetLeaving": false, 
				"sheetData": {}, 
				"sheetPlatformLoading": false, 
				// 日期判断：是否是今天的日期
				"isTodayDate": true,
				// 日期判断：是否在今天的±3天范围内（用于正晚点/停台显示）
				"isWithinDelayDays": true,
				// 正晚点卡片风格：big(大卡，卡片内直接展开明细) / small(小卡，点击弹出详情)
				"delayCardStyle": uni.getStorageSync("delayCardStyle") || 'small',
				// 大卡风格的停台加载相关状态
				"platformLoadThreshold": 10,
				"allPlatformWicketLoaded": false,
				"showLoadAllButton": false,
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
				// ===== 路径 tab：本地算路 =====
				"pathViewMode": uni.getStorageSync('trainPathView') || 'schematic',
				"pathLoading": false,
				"pathError": "",
				"pathResult": null,
				"pathApiBase": "",
				"pathRequestToken": 0,
				"pathRouteColors": {},
				"pathRouteLegend": [],
				"pathStopNames": [],
				"pathChangeNames": [],
				"trackingTimetable": [],
				"pathStationTimes": [],
				"pathTimesFromDelay": false,
				"schematicRows": [],
				"schematicColumns": 4,
				"schematicSections": [],
				"schematicExpandIntermediate": false,
				"_onWindowResize": null
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
			},
			/**
			 * 途径站时间说明：停靠站用时刻表/正晚点，中间站与线路所为均速推算
			 */
			pathTimeBaseNote() {
				return this.pathTimesFromDelay
					? '停靠站时间已按正晚点修正，途经点按区间均速估算'
					: '停靠站取时刻表时间，途经点按区间均速估算';
			},
			pathTimeNote() {
				return this.pathTimeBaseNote + (this.schematicExpandIntermediate
					? '；当前显示全部途经点'
					: '；展开中间站可查看全部途经点');
			},
			pathMapTimeNote() {
				return this.pathTimeBaseNote + '；地图仅标注停靠站、换线站和线路所，线路所放大后显示名称和时间';
			},
			/**
			 * 弹层实时站台/检票口：弹层内单站查询后反映最新时刻表结果
			 */
			sheetStation() {
				const sd = this.sheetData;
				if (!sd || !sd.stationName) return {};
				const live = (this.combinedDelayData || []).find(x => x.stationName === sd.stationName);
				if (live) return live;
				const t = (this.carData.timetable || []).find(x => x.station === sd.stationName);
				if (t) return { platform: t.platform, entrance: t.entrance || [] };
				return {};
			}
		},
		onLoad(options) {
			// 在此统一处理 train_num 和 number
			this.train = options.keyword ? options.keyword.split("/")[0].toUpperCase() : '';
			this.keyword = options.keyword ? options.keyword.toUpperCase() : '';
			this.title = this.train;
			this.date = options.date || '';

			// 判断日期是否是今天，以及是否在今天的±3天范围内
			const today = new Date();
			const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
			// 支持两种格式：YYYYMMDD 或 YYYY-MM-DD
			const dateStr = this.date.replace(/-/g, '');
			this.isTodayDate = dateStr === todayStr || this.date === '';
			if (this.date === '' || dateStr === todayStr) {
				this.isWithinDelayDays = true;
			} else {
				const y = parseInt(dateStr.substr(0, 4));
				const m = parseInt(dateStr.substr(4, 2));
				const d = parseInt(dateStr.substr(6, 2));
				const targetDate = new Date(y, m - 1, d);
				const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
				const diffDays = Math.round((targetDate - todayZero) / 86400000);
				this.isWithinDelayDays = !isNaN(diffDays) && Math.abs(diffDays) <= 3;
			}

			const mode = uni.getStorageSync("mode");
			this.isOnlyOfflineMode = uni.getStorageSync("ol") === true;

			// 计算地图高度：全屏剩余空间
			this.$nextTick(() => {
				this.calcMapHeight();
			});
			this.updateSchematicColumns();
			if (typeof uni.onWindowResize === 'function') {
				this._onWindowResize = () => {
					this.updateSchematicColumns();
					if (this.pathResult) this.buildSchematic(this.pathResult);
				};
				uni.onWindowResize(this._onWindowResize);
			}

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
			// 从个性化页返回时同步正晚点卡片风格
			const cardStyle = uni.getStorageSync("delayCardStyle") || 'small';
			if (cardStyle !== this.delayCardStyle) {
				this.delayCardStyle = cardStyle;
				this.initBigCardPlatforms();
			}
		},
		onUnload() {
			this.stopTrainTracking();
			if (this._onWindowResize && typeof uni.offWindowResize === 'function') {
				uni.offWindowResize(this._onWindowResize);
				this._onWindowResize = null;
			}
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
							icon: 'none',
							position: 'bottom'
						});
					}
					return { success: false };
				}

				if (!silent) {
					showLoader('获取停台数据');
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
								title: response.data.msg || '查询失败',
								icon: 'none',
								position: 'bottom'
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
							title: '网络请求失败',
							icon: 'none',
							position: 'bottom'
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
						hideLoader();
					}
					return result;
				}
			},

			/**
			 * 大卡风格：站少自动全量加载停台，站多显示一键加载按钮
			 */
			initBigCardPlatforms: function() {
				if (this.delayCardStyle !== 'big') return;
				if (this.isOnlyOfflineMode || !this.isWithinDelayDays) return;
				if (!this.carData.timetable || this.carData.timetable.length === 0) return;
				if (this.carData.timetable.length < this.platformLoadThreshold) {
					this.loadAllPlatforms();
				} else {
					this.showLoadAllButton = true;
				}
			},

			/**
			 * 批量加载所有车站的停台信息（大卡风格的一键加载）
			 */
			async loadAllPlatforms() {
				if (this.allPlatformWicketLoaded) return;

				showLoader('一键加载中...');

				let successCount = 0;
				const totalCount = this.carData.timetable.length;

				try {
					for (let i = 0; i < totalCount; i++) {
						const item = this.carData.timetable[i];
						// 未查询或此前失败的才请求，避免重复请求
						if (!item.platform || item.platform === '查询失败' || item.platform === '网络错误') {
							const result = await this.loadPlatform(item, i, true);
							if (result.success) successCount++;
						} else {
							successCount++;
						}
					}

					this.allPlatformWicketLoaded = true;
					this.showLoadAllButton = false;

					uni.showToast({
						title: `加载完成！成功${successCount} / ${totalCount}站`,
						duration: 2000,
						position: 'bottom',
					});
				} catch (e) {
					uni.showToast({
						title: '批量加载出错',
						icon: 'none',
						position: 'bottom'
					});
				} finally {
					hideLoader();
				}
			},

			/**
			 * 大卡中按站名触发单站停台查询
			 */
			loadPlatformByStationName: function(stationName) {
				const targetIndex = (this.carData.timetable || []).findIndex(item => item.station === stationName);
				if (targetIndex === -1) {
					uni.showToast({
						title: '无法匹配车站信息'
					});
					return;
				}
				this.loadPlatform(this.carData.timetable[targetIndex], targetIndex, false);
			},

			/**
			 * 大卡的停站时间文本：优先接口返回值，否则由预计到达/出发推算
			 */
			formatStopMinutes: function(item) {
				const text = this.getStopMinutesText(item);
				return text === '-' ? '-' : text.replace('MIN', '分');
			},

			/**
			 * 大卡的停台/检票口文本：站台 + 检票口列表
			 */
			formatDelayPlatform: function(item) {
				const gates = (item.entrance || []).join('、');
				if (!item.platform) return gates || '-';
				return gates ? item.platform + '/' + gates : item.platform;
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

				showLoader("加载中"); // [1] 主数据加载开始
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
								title: '车次不存在或当日不开行',
								icon: none,
								position: "bottom"
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
								title: '车次不存在',
								icon: 'none',
								position: 'bottom'
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
					// 日期在±3天范围内才加载正晚点数据
					let delayLoadSuccess = false;
					if (loadSuccess && this.carData.timetable.length > 0 && this.isWithinDelayDays) {
						if (this.train && this.date) {
							showLoader('加载正晚点数据') // [2] 正晚点加载开始
							try {
								const delayBase = uni.getStorageSync('service_source_trainDelay') || 'https://rg-api.zenglingkun.cn';
								const delayResp = await uniGet(
									delayBase + `/api/v2/getTrainDelayAll?trainNum=${encodeURIComponent(this.train)}`
								);
								if (delayResp.data && Array.isArray(delayResp.data.data)) {
									this.delay = delayResp.data.data;
									delayLoadSuccess = true;
									// 算路结果可能先到，正晚点到齐后重算站点时间
									this.refreshPathTimes();
								} else {
									this.delay = [];
								}
							} catch (delayError) {
								console.warn("获取正晚点信息失败（网络可能断开或接口错误）", delayError);
								this.delay = []; 
							} finally {
								hideLoader() // [2] 正晚点加载结束 (确保隐藏)
							}
						}
					}
					// -------------------------------------------------------------------------
					
					// -------------------------------------------------------------------------
					// **停台加载逻辑**：小卡进入弹层卡片时按需获取；大卡按站数自动全量或显示一键加载按钮
					this.initBigCardPlatforms();
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
					hideLoader(); 
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
				const previous = this.selectIndex;
				this.selectIndex = e.index;
				if (e.index === 2) {
					// 首次进入路径 tab 才请求，之后切回来复用已有结果
					if (!this.pathResult && !this.pathLoading) {
						this.fetchRoutePlan();
					}
					// 地图是 v-if 重建的，重新挂载后等 onLoaded 再绘制
					if (this.pathViewMode === 'map') this.mapReady = false;
				} else {
					this.stopTrainTracking();
					if (previous === 2) this.mapReady = false;
				}
			},
			
			/**
			 * 打开正晚点详情底部弹层（兼容正晚点合并项 / 原始时刻表项两种数据形态）
			 */
			openDelaySheet: function(item, index) {
				this.sheetData = {
					stationName: item.stationName || item.station || '',
					delayStatusCode: (item.delayStatusCode !== undefined && item.delayStatusCode !== null) ? item.delayStatusCode : 'MAINTAINCE_MISSING',
					delayTime: (typeof item.delayTime === 'number') ? item.delayTime : 0,
					arrivalTime: item.arrivalTime || item.arrive || null,
					departureTime: item.departureTime || item.depart || null,
					platform: (item.platform !== undefined) ? item.platform : null,
					entrance: item.entrance || [],
					stopMinutes: item.stopMinutes,
					_index: (item._index !== undefined) ? item._index : index
				};
				this.sheetLeaving = false;
				this.sheetRender = true;
				// 进入卡片后再获取检票口/站台
				this.maybeFetchSheetPlatform();
			},

			/**
			 * 关闭正晚点详情底部弹层（先播退出动画再移除节点）
			 */
			closeDelaySheet: function() {
				if (this.sheetLeaving) return;
				this.sheetLeaving = true;
				setTimeout(() => {
					if (this.sheetLeaving) {
						this.sheetRender = false;
						this.sheetLeaving = false;
						this.sheetData = {};
					}
				}, 300);
			},

			/**
			 * 进入弹层后按需静默获取该站检票口/站台（未查询或查询失败时）
			 */
			maybeFetchSheetPlatform: async function() {
				const name = this.sheetData.stationName;
				if (!name || this.sheetPlatformLoading) return;
				const idx = (this.carData.timetable || []).findIndex(x => x.station === name);
				if (idx === -1) return;
				const item = this.carData.timetable[idx];
				if (item.platform && item.platform !== '查询失败' && item.platform !== '网络错误') return;
				this.sheetPlatformLoading = true;
				await this.loadPlatform(item, idx, true);
				this.sheetPlatformLoading = false;
			},

			/**
			 * 弹层时间列的状态底色（浅色渐变 tint）
			 */
			getDelayTintBackground: function(delayStatus) {
				let tint = 'rgba(17, 69, 152, 0.08)';
				if (delayStatus === 'EARLY' || delayStatus === 'EARLY_PREDICTION') {
					tint = 'rgba(39, 174, 96, 0.12)';
				} else if (delayStatus === 'DELAY' || delayStatus === 'DELAY_PREDICTION') {
					tint = 'rgba(192, 57, 43, 0.12)';
				} else if (delayStatus === 'MAINTAINCE_MISSING') {
					tint = 'rgba(96, 98, 102, 0.08)';
				}
				return 'background: linear-gradient(180deg, #fdfdfd 40%, ' + tint + ' 100%);';
			},

			/**
			 * 弹层状态色条渐变背景（正点为主题蓝渐变）
			 */
			getDelayBarBackground: function(delayStatus) {
				if (delayStatus === 'EARLY' || delayStatus === 'EARLY_PREDICTION') {
					return 'background: linear-gradient(90deg, #27ae60 0%, #67d98b 100%);';
				}
				if (delayStatus === 'DELAY' || delayStatus === 'DELAY_PREDICTION') {
					return 'background: linear-gradient(90deg, #c0392b 0%, #e67e22 100%);';
				}
				if (delayStatus === 'MAINTAINCE_MISSING') {
					return 'background: #606266;';
				}
				return 'background: linear-gradient(90deg, #114598 0%, #3f7ac4 100%);';
			},

			/**
			 * 实际时间是否与预计时间不同（用于弹层中给预计时间加删除线）
			 */
			isTimeChanged: function(scheduled, delayStatus, delayTime) {
				if (!scheduled || scheduled === '-') return false;
				const actual = this.calculateActualTime(scheduled, delayStatus, delayTime);
				return actual !== '-' && actual !== scheduled;
			},

			/**
			 * 是否本次列车的始发站/终到站（弹层里停留不显示时长）
			 */
			isFirstOrLastStop: function(sd) {
				if (!sd) return false;
				const tt = (this.carData && this.carData.timetable) || [];
				if (tt.length === 0) return false;
				let idx = sd._index;
				if (typeof idx !== 'number' || idx < 0) {
					idx = tt.findIndex(x => x.station === sd.stationName);
				}
				return idx === 0 || idx === tt.length - 1;
			},

			/**
			 * 停留分钟文本（优先 API stopMinutes，否则由预计到达/出发计算）
			 */
			getStopMinutesText: function(item) {
				if (typeof item.stopMinutes === 'number' && !isNaN(item.stopMinutes)) {
					return item.stopMinutes + 'MIN';
				}
				const a = item.arrivalTime;
				const d = item.departureTime;
				if (!a || !d || a === '-' || d === '-') return '-';
				const ap = a.split(':');
				const dp = d.split(':');
				let diff = (parseInt(dp[0]) * 60 + parseInt(dp[1])) - (parseInt(ap[0]) * 60 + parseInt(ap[1]));
				if (diff < 0) diff += 24 * 60;
				return diff + 'MIN';
			},
			/**
			 * 请求算路服务：按时刻表有效累计里程动态分组
			 */
			async fetchRoutePlan() {
				const timetable = (this.carData.timetable || [])
					.filter(item => item && String(item.station || '').trim());
				if (timetable.length < 2) {
					this.pathLoading = false;
					this.pathResult = null;
					this.pathError = '时刻表站数不足，无法计算路径';
					return;
				}
				const token = ++this.pathRequestToken;
				const base = 'https://next.railgo.zenglingkun.cn';
				this.pathApiBase = base;
				this.pathLoading = true;
				this.pathError = '';
				showLoader('正在计算经由');
				const stops = timetable.map(item => {
					const stop = { station: String(item.station).trim() };
					const mileage = this.parseTimetableMileage(item.distance);
					// 只把有效累计里程交给服务端；缺的站由前后锚点跨过去
					if (mileage !== null) stop.distance = mileage;
					return stop;
				});
				try {
					const response = await new Promise((resolve, reject) => {
						uni.request({
							url: base + '/api/v2/resolveTimetable',
							method: 'POST',
							timeout: 30000,
							header: { 'Content-Type': 'application/json' },
							data: {
								trainNumber: this.train,
								stops,
								datum: 'wgs84',
								order: 'lnglat',
								maxPoints: 100,
								includePolyline: true
							},
							success: resolve,
							fail: reject
						});
					});
					if (token !== this.pathRequestToken) return;
					const body = response && response.data ? response.data : {};
					if (!body.success || !body.data) {
						throw new Error(body.msg || '算路服务返回失败');
					}
					this.applyPathResult(body.data, timetable);
				} catch (error) {
					if (token !== this.pathRequestToken) return;
					const detail = error && (error.errMsg || error.message)
						? (error.errMsg || error.message)
						: '未知错误';
					this.pathError = '无法完成算路：' + detail;
					this.pathResult = null;
					this.mapDataReady = false;
					this.schematicRows = [];
					this.stopTrainTracking();
				} finally {
					if (token === this.pathRequestToken) this.pathLoading = false;
					hideLoader();
				}
			},
			parseTimetableMileage(value) {
				if (value === null || value === undefined || value === '' || value === '-') return null;
				const mileage = Number(value);
				return Number.isFinite(mileage) && mileage >= 0 ? mileage : null;
			},
			applyPathResult(data, timetable) {
				this.pathResult = data;
				this.pathRouteColors = this.buildRouteColors(data);
				this.pathRouteLegend = this.buildRouteLegend(data);
				this.pathStationTimes = this.buildStationTimes(data, timetable);
				this.buildSchematic(data);
				this.buildMapData(data);
				this.trackingTimetable = this.buildTrackingTimetable(timetable, data);
				this.$nextTick(() => {
					if (this.pathViewMode === 'map') this.drawRouteOnMap();
				});
			},
			/**
			 * 用相邻停靠站的区间均速和线路里程，估算途经站/线路所的到达时间。
			 * 停靠站优先用时刻表时间；有正晚点时按到发偏差修正。
			 */
			buildStationTimes(data, timetable) {
				const stations = (data && data.stations) || [];
				const mileages = (data && data.stationMileages) || [];
				const stops = (timetable || []).filter(item => item && String(item.station || '').trim());
				const count = stations.length;
				const result = new Array(count).fill(null);
				this.pathTimesFromDelay = false;
				if (count === 0 || stops.length === 0) return result;

				const stopIndexes = (data && data.stopStationIndexes) || [];
				const resolvedIndexes = stops.map((_, index) => {
					const direct = stopIndexes[index];
					if (typeof direct === 'number') return direct;
					const stop = ((data && data.stops) || [])[index];
					return stop && typeof stop.stationIndex === 'number' ? stop.stationIndex : null;
				});

				const delayMap = this.buildDelayMap();
				const normalized = this.normalizeTimetableTimes(stops);
				let delayApplied = false;
				// 正晚点接口通常只返回部分站；未返回或标记缺失的后续站沿用最近一次偏差，
				// 直到出现新的明确状态（含正点）再重新对齐
				const delayStatuses = {
					DELAY: true,
					EARLY: true,
					ON_TIME: true,
					DELAY_PREDICTION: true,
					EARLY_PREDICTION: true
				};
				let inheritedDelay = 0;
				normalized.forEach(item => {
					let delay = inheritedDelay;
					const entry = delayMap[item.station];
					if (entry && delayStatuses[entry.delayStatusCode]) {
						delay = this.getDelayMinutes(delayMap, item.station);
						inheritedDelay = delay;
					}
					if (item.arriveAbs != null) item.arriveAbs += delay;
					if (item.departAbs != null) item.departAbs += delay;
					if (delay !== 0) delayApplied = true;
				});
				this.pathTimesFromDelay = delayApplied;

				// 前站晚点后，后续站按计划时刻可能倒序；把后续时间整体后移，保证区间均速可算
				normalized.forEach((item, index) => {
					const previous = index > 0 ? normalized[index - 1] : null;
					const previousEnd = previous
						? (previous.departAbs != null ? previous.departAbs : previous.arriveAbs)
						: null;
					if (item.arriveAbs != null && previousEnd != null && item.arriveAbs < previousEnd) {
						const shift = previousEnd - item.arriveAbs;
						item.arriveAbs += shift;
						if (item.departAbs != null) item.departAbs += shift;
					} else if (item.arriveAbs == null && item.departAbs != null
						&& previousEnd != null && item.departAbs < previousEnd) {
						item.departAbs = previousEnd + Math.max(item.plannedDwell, 0);
					}
					if (item.arriveAbs != null && item.departAbs != null && item.departAbs < item.arriveAbs) {
						item.departAbs = item.arriveAbs + Math.max(item.plannedDwell, 1);
					}
				});

				normalized.forEach((item, index) => {
					const routeIndex = resolvedIndexes[index];
					if (!Number.isInteger(routeIndex) || routeIndex < 0 || routeIndex >= count) return;
					const isFirst = index === 0;
					const minutes = isFirst
						? (item.departAbs != null ? item.departAbs : item.arriveAbs)
						: (item.arriveAbs != null ? item.arriveAbs : item.departAbs);
					if (minutes == null || !Number.isFinite(minutes)) return;
					const mode = isFirst ? 'depart' : (item.arriveAbs != null ? 'arrive' : 'depart');
					result[routeIndex] = this.formatStationTime(minutes, false, mode);
				});

				for (let index = 0; index < normalized.length - 1; index++) {
					const from = normalized[index];
					const to = normalized[index + 1];
					const fromIndex = resolvedIndexes[index];
					const toIndex = resolvedIndexes[index + 1];
					if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex) || toIndex <= fromIndex) continue;
					const start = from.departAbs != null ? from.departAbs : from.arriveAbs;
					let end = to.arriveAbs != null ? to.arriveAbs : to.departAbs;
					const startMileage = Number(mileages[fromIndex]);
					const endMileage = Number(mileages[toIndex]);
					if (start == null || end == null
						|| !Number.isFinite(startMileage) || !Number.isFinite(endMileage)
						|| endMileage <= startMileage) continue;
					if (!(end > start)) {
						// 正晚点只覆盖部分站时，仍用计划运行时间兜底
						const plannedStart = from.plannedDepart != null ? from.plannedDepart : from.plannedArrive;
						const plannedEnd = to.plannedArrive != null ? to.plannedArrive : to.plannedDepart;
						if (plannedStart == null || plannedEnd == null || plannedEnd <= plannedStart) continue;
						end = start + (plannedEnd - plannedStart);
					}
					for (let routeIndex = fromIndex + 1; routeIndex < toIndex; routeIndex++) {
						const mileage = Number(mileages[routeIndex]);
						if (!Number.isFinite(mileage)) continue;
						const fraction = Math.min(Math.max(
							(mileage - startMileage) / (endMileage - startMileage), 0), 1);
						result[routeIndex] = this.formatStationTime(
							start + fraction * (end - start), true, 'pass');
					}
				}
				return result;
			},
			buildDelayMap() {
				const map = {};
				(this.delay || []).forEach(item => {
					if (!item) return;
					const name = item.stationName || item.station;
					if (name) map[name] = item;
				});
				return map;
			},
			getDelayMinutes(delayMap, station) {
				const item = delayMap && delayMap[station];
				if (!item || typeof item.delayTime !== 'number' || !Number.isFinite(item.delayTime)) return 0;
				if (item.delayStatusCode === 'DELAY' || item.delayStatusCode === 'DELAY_PREDICTION') {
					return Math.abs(item.delayTime);
				}
				if (item.delayStatusCode === 'EARLY' || item.delayStatusCode === 'EARLY_PREDICTION') {
					return -Math.abs(item.delayTime);
				}
				return 0;
			},
			/**
			 * 时刻表时间转成从始发日 00:00 起的绝对分钟，跨日按运行顺序递增
			 */
			normalizeTimetableTimes(timetable) {
				let dayOffset = 0;
				let previousEnd = null;
				return timetable.map((item, index) => {
					const arriveRaw = this.parseClockMinutes(item.arrive);
					const departRaw = this.parseClockMinutes(item.depart);
					if (index > 0 && arriveRaw != null && previousEnd != null) {
						while (arriveRaw + dayOffset * 1440 < previousEnd) dayOffset += 1;
					}
					const arriveAbs = arriveRaw == null ? null : arriveRaw + dayOffset * 1440;
					let departAbs = null;
					if (departRaw != null) {
						departAbs = departRaw + dayOffset * 1440;
						if (arriveAbs != null && departAbs < arriveAbs) departAbs += 1440;
					}
					const plannedArrive = arriveAbs;
					const plannedDepart = departAbs;
					const plannedDwell = plannedArrive != null && plannedDepart != null
						? Math.max(plannedDepart - plannedArrive, 0)
						: 0;
					previousEnd = departAbs != null ? departAbs : (arriveAbs != null ? arriveAbs : previousEnd);
					return {
						station: item.station,
						arriveAbs,
						departAbs,
						plannedArrive,
						plannedDepart,
						plannedDwell
					};
				});
			},
			parseClockMinutes(value) {
				if (value === null || value === undefined || value === '' || value === '-') return null;
				const match = String(value).trim().match(/^(\d{1,2}):(\d{2})/);
				if (!match) return null;
				const hours = parseInt(match[1], 10);
				const minutes = parseInt(match[2], 10);
				return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null;
			},
			formatStationTime(minutes, estimated, mode) {
				if (minutes == null || !Number.isFinite(minutes)) return null;
				const rounded = Math.max(Math.round(minutes), 0);
				const dayOffset = Math.floor(rounded / 1440);
				const minutesInDay = rounded % 1440;
				const timeText = String(Math.floor(minutesInDay / 60)).padStart(2, '0')
					+ ':' + String(minutesInDay % 60).padStart(2, '0');
				const dayPrefix = dayOffset > 0
					? (dayOffset === 1 ? '次日 ' : '+' + dayOffset + ' ')
					: '';
				const estimatePrefix = estimated ? '约 ' : '';
				const suffix = mode === 'depart' ? ' 发' : (mode === 'arrive' ? ' 到' : '');
				return {
					minutes: rounded,
					dayOffset,
					timeText,
					estimated,
					label: dayPrefix + estimatePrefix + timeText + suffix,
					mapLabel: dayPrefix + estimatePrefix + timeText
				};
			},
			refreshPathTimes() {
				if (!this.pathResult) return;
				const timetable = (this.carData.timetable || [])
					.filter(item => item && String(item.station || '').trim());
				this.pathStationTimes = this.buildStationTimes(this.pathResult, timetable);
				this.buildSchematic(this.pathResult);
				this.buildMapData(this.pathResult);
				if (this.selectIndex === 2 && this.pathViewMode === 'map' && this.mapReady) {
					this.$nextTick(() => this.drawRouteOnMap());
				}
			},
			buildRouteColors(data) {
				const palette = ['#005AC1', '#C43E00', '#006B5E', '#8E24AA', '#7A5900', '#B0005A'];
				const colors = {};
				let index = 0;
				const names = [
					...(data.legRouteNames || []),
					...(data.segments || []).map(item => item.routeName)
				];
				names.forEach(name => {
					const key = name || '未知线路';
					if (!colors[key]) {
						colors[key] = palette[index % palette.length];
						index++;
					}
				});
				return colors;
			},
			buildRouteLegend(data) {
				const totals = {};
				(data.segments || []).forEach(segment => {
					const key = segment.routeName || '未知线路';
					const entry = totals[key] || { routeName: key, mileage: 0, count: 0 };
					entry.mileage += Number(segment.mileageKm) || 0;
					entry.count += 1;
					totals[key] = entry;
				});
				return Object.keys(totals).map(key => ({
					routeName: totals[key].routeName,
					mileage: Math.round(totals[key].mileage * 10) / 10,
					count: totals[key].count,
					color: this.pathRouteColors[key] || '#114598'
				}));
			},
			buildTrackingTimetable(timetable, data) {
				const resolved = {};
				(data.stopStationIndexes || []).forEach((stationIndex, index) => {
					if (typeof stationIndex === 'number' && data.stations && data.stations[stationIndex]) {
						resolved[index] = data.stations[stationIndex];
					}
				});
				return timetable.map((item, index) => ({
					...item,
					station: resolved[index] || item.station
				}));
			},
			buildSchematic(data) {
				const stations = data.stations || [];
				if (stations.length === 0) {
					this.schematicRows = [];
					this.schematicSections = [];
					return;
				}
				const legNames = data.legRouteNames || [];
				const mileages = data.stationMileages || [];
				const stopIndexSet = new Set();
				(data.stopStationIndexes || []).forEach(index => {
					if (typeof index === 'number') stopIndexSet.add(index);
				});
				// 收起中间站时保留停靠站和换线站，保证每一笔都能用单一线路颜色画出来
				const routeChanges = new Set([0, stations.length - 1]);
				legNames.forEach((name, index) => {
					// 换线发生在线路 i 上（站 i → i+1），站 i 必须留下才能把两种颜色分开
					if (index > 0 && name !== legNames[index - 1]) routeChanges.add(index);
				});
				const visible = [];
				stations.forEach((name, index) => {
					if (this.schematicExpandIntermediate || stopIndexSet.has(index) || routeChanges.has(index)) {
						visible.push(index);
					}
				});
				if (visible.length === 0) return;
				if (visible[0] !== 0) visible.unshift(0);
				if (visible[visible.length - 1] !== stations.length - 1) {
					visible.push(stations.length - 1);
				}

				const defaultColor = this.pathRouteColors[legNames[0]] || '#114598';
				const legs = [];
				for (let index = 0; index < visible.length - 1; index++) {
					const from = visible[index];
					const to = visible[index + 1];
					const routeName = legNames[from] || '未知线路';
					const fromMileage = typeof mileages[from] === 'number' ? mileages[from] : 0;
					const toMileage = typeof mileages[to] === 'number' ? mileages[to] : fromMileage;
					legs.push({
						from,
						to,
						routeName,
						color: this.pathRouteColors[routeName] || defaultColor,
						mileage: Math.max(toMileage - fromMileage, 0)
					});
				}

				const sections = [];
				legs.forEach((leg, legIndex) => {
					const last = sections[sections.length - 1];
					if (last && last.routeName === leg.routeName) {
						last.to = leg.to;
						last.mileage += leg.mileage;
					} else {
						sections.push({
							routeName: leg.routeName,
							color: leg.color,
							from: leg.from,
							to: leg.to,
							mileage: leg.mileage,
							startOrder: legIndex
						});
					}
				});
				this.schematicSections = sections;

				const stopByIndex = {};
				(data.stops || []).forEach(stop => {
					if (typeof stop.stationIndex === 'number') stopByIndex[stop.stationIndex] = stop;
				});
				const items = visible.map((stationIndex, visibleOrder) => {
					const incoming = visibleOrder > 0 ? legs[visibleOrder - 1].color : defaultColor;
					const outgoing = visibleOrder < legs.length ? legs[visibleOrder].color : incoming;
					return {
						index: stationIndex,
						order: visibleOrder,
						name: stations[stationIndex],
						mileage: typeof mileages[stationIndex] === 'number' ? mileages[stationIndex] : null,
						time: this.pathStationTimes[stationIndex] || null,
						isStop: stopIndexSet.has(stationIndex),
						stop: stopByIndex[stationIndex] || null,
						incomingColor: incoming,
						outgoingColor: outgoing,
						leftColor: incoming,
						rightColor: outgoing,
						chip: null,
						toNextColor: null,
						toEdgeColor: null,
						fromEdgeColor: null
					};
				});

				const columns = Math.max(2, this.schematicColumns || 4);
				const rows = [];
				for (let index = 0; index < items.length; index += columns) {
					rows.push({ items: items.slice(index, index + columns) });
				}
				rows.forEach((row, rowIndex) => {
					const reversed = rowIndex % 2 === 1;
					row.isReversed = reversed;
					row.connector = null;
					row.connectorSide = reversed ? 'left' : 'right';
					while (row.items.length < columns) row.items.push(null);
					const realItems = row.items.filter(Boolean);
					realItems.forEach((item, position) => {
						const leg = legs[item.order];
						if (position < realItems.length - 1) {
							item.toNextColor = leg ? leg.color : null;
						} else if (rowIndex < rows.length - 1) {
							item.toEdgeColor = leg ? leg.color : null;
							row.connector = leg ? { color: leg.color } : null;
						}
						if (position === 0 && rowIndex > 0) {
							const incomingLeg = legs[item.order - 1];
							item.fromEdgeColor = incomingLeg ? incomingLeg.color : null;
						}
						item.leftColor = reversed ? item.outgoingColor : item.incomingColor;
						item.rightColor = reversed ? item.incomingColor : item.outgoingColor;
					});
				});

				sections.forEach(section => {
					const item = items[section.startOrder];
					if (item) item.chip = {
						routeName: section.routeName,
						color: section.color
					};
				});
				this.layoutSchematicChips(rows, columns);
				this.schematicRows = rows;
			},
			buildMapData(data) {
				const stations = data.stations || [];
				const points = data.points || [];
				const stationPoints = data.stationPoints || [];
				const stationCoords = {};
				const mapStations = [];
				stations.forEach((name, index) => {
					const point = stationPoints[index];
					if (!Array.isArray(point) || point.length < 2) return;
					const lng = Number(point[1]);
					const lat = Number(point[0]);
					if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
					stationCoords[name] = [lng, lat];
					const item = {};
					item[name] = [lng, lat];
					mapStations.push(item);
				});
				const lines = {};
				let lineIndex = 0;
				(data.segments || []).forEach(segment => {
					(segment.legs || []).forEach(leg => {
						const range = leg.pointRange;
						if (!range || range.length < 2) return;
						const slice = points.slice(range[0], range[1]);
						if (slice.length < 2) return;
						lines[leg.fromStation + '-' + leg.toStation] = {
							index: lineIndex++,
							line: slice,
							color: this.pathRouteColors[leg.routeName] || '#114598',
							routeName: leg.routeName
						};
					});
				});
				this.mapStations = mapStations;
				this.mapLines = lines;

				// 地图只标关键节点：停靠站、换线站、线路所；普通途经站留给简图展示
				const markers = [];
				const stopNames = [];
				const seen = new Set();
				const stopIndexSet = new Set();
				(data.stopStationIndexes || []).forEach(index => {
					if (typeof index === 'number') stopIndexSet.add(index);
				});
				const changeIndexSet = new Set();
				(data.legRouteNames || []).forEach((name, index) => {
					// 换线点在站 i（线路 i 与 i-1 的分界），不把起讫点误标成换线站
					if (index > 0 && name !== data.legRouteNames[index - 1]) {
						changeIndexSet.add(index);
					}
				});
				const addMarker = (name, kind, stationIndex) => {
					if (!name || seen.has(name) || !stationCoords[name]) return;
					seen.add(name);
					const coord = stationCoords[name];
					const time = this.pathStationTimes[stationIndex] || null;
					const marker = {
						name,
						lng: coord[0],
						lat: coord[1],
						fill: kind === 'stop' ? '#114598' : (kind === 'change' ? '#d70f19' : '#7f8794'),
						radius: kind === 'stop' ? 9 : (kind === 'change' ? 6 : 5),
						stroke: '#fff',
						strokeWidth: 2
					};
					if (kind === 'stop') stopNames.push(name);
					if (kind === 'office') marker.small = true;
					if (time) marker.time = time.mapLabel;
					markers.push(marker);
				};
				stations.forEach((name, index) => {
					if (stopIndexSet.has(index)) {
						addMarker(name, 'stop', index);
					} else if (changeIndexSet.has(index)) {
						addMarker(name, 'change', index);
					} else if (/所$/.test(name)) {
						addMarker(name, 'office', index);
					}
				});
				this.pathStopNames = stopNames;
				this.mapPointData = markers;
				this.mapDataReady = true;
			},
			updateSchematicColumns() {
				let width = 375;
				try {
					width = uni.getSystemInfoSync().windowWidth || width;
				} catch (e) {
					// 取不到窗口宽度时按手机宽度排 4 列
				}
				const available = Math.max(width - 28, 240);
				this.schematicColumns = Math.max(2, Math.min(7, Math.floor(available / 82)));
			},
			layoutSchematicChips(rows, columns) {
				// 标签始终居中于圆点；maxWidth 以格宽百分比表示，避免不同端 rpx 缩放差异导致偏移
				rows.forEach(row => {
					const indexes = [];
					row.items.forEach((item, domIndex) => {
						if (!item || !item.chip) return;
						indexes.push(row.isReversed ? columns - 1 - domIndex : domIndex);
					});
					if (!indexes.length) return;
					indexes.sort((a, b) => a - b);
					row.items.forEach((item, domIndex) => {
						if (!item || !item.chip) return;
						const visualIndex = row.isReversed ? columns - 1 - domIndex : domIndex;
						const at = indexes.indexOf(visualIndex);
						const leftChip = at > 0 ? indexes[at - 1] : null;
						const rightChip = at < indexes.length - 1 ? indexes[at + 1] : null;
						// 与相邻标签按中心距平分空间；无标签一侧可探入卡片内边距，仍保持居中
						const edgeAllow = 0.16;
						const leftLimit = leftChip === null ? 2 * (visualIndex + 0.5) + edgeAllow : visualIndex - leftChip;
						const rightLimit = rightChip === null ? 2 * (columns - 0.5 - visualIndex) + edgeAllow : rightChip - visualIndex;
						item.chip.maxWidth = Math.max(20, Math.floor(Math.min(leftLimit, rightLimit) * 100 - 4));
					});
				});
			},
			toggleSchematicExpand() {
				this.schematicExpandIntermediate = !this.schematicExpandIntermediate;
				if (this.pathResult) this.buildSchematic(this.pathResult);
			},
			setPathViewMode(mode) {
				if (mode === this.pathViewMode) return;
				this.pathViewMode = mode;
				uni.setStorageSync('trainPathView', mode);
				if (mode === 'map') {
					this.mapReady = false;
					this.$nextTick(() => {
						if (this.mapDataReady) this.drawRouteOnMap();
					});
				} else {
					this.stopTrainTracking();
				}
			},
			formatSchematicMileage(value) {
				if (typeof value !== 'number' || !Number.isFinite(value)) return '';
				const rounded = Math.round(value * 10) / 10;
				return (Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)) + ' km';
			},
			/**
			 * 在地图上绘制线路和站点
			 */
			drawRouteOnMap() {
				if (!this.mapReady || !this.mapDataReady || !this.$refs.sijiMapRef) return;
				if (this.selectIndex !== 2 || this.pathViewMode !== 'map') return;

				// 1. 绘制各区间线路（按经由线路配色）
				const segments = Object.values(this.mapLines).sort((a, b) => a.index - b.index);
				const allCoords = [];
				const routeSegments = [];
				segments.forEach(seg => {
					if (seg.line && seg.line.length > 0) {
						seg.line.forEach(pt => allCoords.push(pt));
						routeSegments.push({
							points: seg.line,
							style: { color: seg.color || '#114598', width: 4 }
						});
					}
				});

				// 2. 停靠站与换线站标记由 buildMapData 生成
				const allPoints = this.mapPointData || [];

				// 3. 绘制：先清空，再画路线，再画站点
				this.$refs.sijiMapRef.clearAll();
				if (routeSegments.length > 0) {
					this.$refs.sijiMapRef.drawRoute(routeSegments);
				}
				if (allPoints.length > 0) {
					this.$refs.sijiMapRef.drawMarkers(allPoints);
				}

				// 启动实时位置追踪
				this.$nextTick(() => this.startTrainTracking());

				// 4. 缩放至路线范围（没有折线时用站点坐标兜底）
				const fitCoords = allCoords.length > 0
					? allCoords
					: allPoints.map(point => [point.lng, point.lat]);
				if (fitCoords.length > 0) {
					const lngs = fitCoords.map(c => c[0]);
					const lats = fitCoords.map(c => c[1]);
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
				if (this.selectIndex !== 2 || this.pathViewMode !== 'map') return;
				if (!this.mapDataReady || !this.mapReady || !this.$refs.sijiMapRef) return;
				// 非今天日期或当日不开行不计算实时位置
				if (!this.isTodayDate) return;
				if (this.carData.rundays && !this.carData.rundays.includes(this.date)) return;
				// 有正晚点数据时，用实际时间构建修正时刻表
				let timetable = (this.delay && this.delay.length > 0)
					? (this.buildActualTimetable() || this.carData.timetable)
					: (this.trackingTimetable.length ? this.trackingTimetable : this.carData.timetable);
				if (!timetable || timetable.length < 2) return;
				// 地图上的站名是线路图解析后的规范名，插值前统一替换
				if (this.trackingTimetable.length === timetable.length) {
					timetable = timetable.map((item, index) => ({
						...item,
						station: this.trackingTimetable[index].station
					}));
				}

				// 第 0 日以查询日（发车日）为基准，避免跨日车次在发车前被误判为运行中
				const currentMinutes = getMinutesSinceDate(this.date);
				const pos = getTrainPosition(timetable, this.mapLines, this.mapStations,
					currentMinutes !== null ? currentMinutes : undefined);
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
	
	/* 正晚点详情底部弹出卡片 */
	.sheet-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: flex-end;
		z-index: 9999;
		animation: sheetFadeIn 0.3s ease both;
	}

	.sheet-overlay--leave {
		animation: sheetFadeOut 0.28s ease both;
	}

	.sheet-panel {
		width: 100%;
		box-sizing: border-box;
		padding: 20rpx 30rpx 50rpx;
		background-color: #f2f3f5;
		border-top-left-radius: 32rpx;
		border-top-right-radius: 32rpx;
		animation: sheetUp 0.34s cubic-bezier(0.32, 0.72, 0, 1) both;
	}

	.sheet-overlay--leave .sheet-panel {
		animation: sheetDown 0.28s ease-in both;
	}

	@keyframes sheetFadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes sheetFadeOut {
		from { opacity: 1; }
		to { opacity: 0; }
	}

	@keyframes sheetUp {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	@keyframes sheetDown {
		from { transform: translateY(0); }
		to { transform: translateY(100%); }
	}

	.sheet-handle {
		width: 80rpx;
		height: 8rpx;
		border-radius: 4rpx;
		background-color: #d0d3d9;
		margin: 0 auto 24rpx;
	}

	.sheet-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 10rpx 24rpx;
	}

	.sheet-station {
		font-size: 44rpx;
		font-weight: 700;
		color: #1c1e21;
	}

	.sheet-close {
		font-size: 40rpx;
		color: #9aa0a6;
	}

	.sheet-times {
		display: flex;
		border-top-left-radius: 24rpx;
		border-top-right-radius: 24rpx;
		overflow: hidden;
	}

	.sheet-time-col {
		flex: 1;
		padding: 28rpx 20rpx;
		text-align: center;
	}

	.sheet-time-col--mid {
		background: linear-gradient(180deg, #fdfdfd 0%, #f7f8fa 100%);
		border-left: 1rpx solid #f0f1f3;
		border-right: 1rpx solid #f0f1f3;
	}

	.sheet-time-label {
		display: block;
		font-size: 24rpx;
		color: #8a8f99;
	}

	.sheet-time-main {
		display: block;
		margin-top: 12rpx;
		font-size: 56rpx;
		font-weight: 700;
		color: #1c1e21;
		line-height: 1.1;
	}

	.sheet-time-sub {
		display: block;
		margin-top: 8rpx;
		font-size: 26rpx;
		color: #b6bac1;
	}

	.sheet-time-sub--diff {
		text-decoration: line-through;
	}

	.sheet-bars {
		display: flex;
		overflow: hidden;
		border-bottom-left-radius: 24rpx;
		border-bottom-right-radius: 24rpx;
	}

	.sheet-bar {
		flex: 1;
		padding: 14rpx 0;
		text-align: center;
	}

	.sheet-bar-text {
		font-size: 24rpx;
		color: #fff;
	}

	.sheet-cards {
		display: flex;
		margin-top: 24rpx;
	}

	.sheet-card {
		position: relative;
		overflow: hidden;
		flex: 1;
		padding: 28rpx 24rpx;
		border-radius: 24rpx;
	}

	/* 检票口卡：暖色粉彩渐变；站台卡：冷色粉彩渐变（参考设计） */
	.sheet-card--gate {
		background: linear-gradient(160deg, #fffdf8 0%, #fbf0dd 100%);
	}

	.sheet-card--platform {
		background: linear-gradient(160deg, #f8fbff 0%, #e3effc 100%);
	}

	/* 右下角半透明几何水印，模拟参考图插画装饰；弹层打开时从右下角滑入 */
	.sheet-card::after {
		content: '';
		position: absolute;
		right: -30rpx;
		bottom: -46rpx;
		width: 190rpx;
		height: 150rpx;
		border-radius: 28rpx;
		transform: translate(0, 0) rotate(-18deg);
		z-index: 0;
		animation: sheetCardMark 0.5s cubic-bezier(0.32, 0.72, 0, 1) 0.18s both;
	}

	.sheet-card--gate::after {
		background: linear-gradient(200deg, rgba(230, 162, 60, 0.16) 0%, rgba(230, 162, 60, 0.32) 100%);
	}

	.sheet-card--platform::after {
		background: linear-gradient(200deg, rgba(63, 122, 196, 0.14) 0%, rgba(17, 69, 152, 0.26) 100%);
	}

	@keyframes sheetCardMark {
		from {
			transform: translate(140rpx, 140rpx) rotate(-18deg);
			opacity: 0;
		}
		to {
			transform: translate(0, 0) rotate(-18deg);
			opacity: 1;
		}
	}

	.sheet-card+.sheet-card {
		margin-left: 24rpx;
	}

	.sheet-card-label {
		position: relative;
		z-index: 1;
		display: block;
		font-size: 24rpx;
		color: #8a8f99;
	}

	.sheet-card-value {
		position: relative;
		z-index: 1;
		display: block;
		margin-top: 16rpx;
		font-size: 44rpx;
		font-weight: 700;
		color: #1c1e21;
	}

	.sheet-card-value--gate {
		color: #e6a23c;
	}

	.sheet-card-value--platform {
		color: #114598;
	}

	.sheet-card-value--empty {
		color: #b6bac1;
	}

	/* ===== 路径 tab：模式切换 / 摘要 / 地图 / 简图 ===== */
	.path-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 20rpx;
	}

	.path-mode-tabs {
		display: flex;
		border: 2rpx solid #114598;
		border-radius: 10rpx;
		overflow: hidden;
	}

	.path-mode-tab {
		display: flex;
		align-items: center;
		padding: 12rpx 26rpx;
		font-size: 26rpx;
		color: #114598;
		line-height: 1.2;
	}

	.path-mode-tab + .path-mode-tab {
		border-left: 2rpx solid #114598;
	}

	.path-mode-tab--active {
		background-color: #114598;
		color: #ffffff;
	}

	.path-mode-icon {
		font-size: 24rpx;
		margin-right: 8rpx;
	}

	.path-toolbar-actions {
		display: flex;
		align-items: center;
	}

	.path-toolbar-hint {
		font-size: 24rpx;
		color: #8a8f99;
	}

	.path-recalc {
		padding: 12rpx 26rpx;
		font-size: 24rpx;
		color: #114598;
		border: 2rpx solid rgba(17, 69, 152, 0.45);
		border-radius: 10rpx;
		line-height: 1.2;
	}

	.path-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 20rpx;
		padding: 44rpx 32rpx;
		text-align: center;
	}

	.path-state-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #1c1e21;
	}

	.path-state-msg {
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #c0392b;
		word-break: break-all;
	}

	.path-state-sub {
		margin-top: 8rpx;
		font-size: 22rpx;
		color: #8a8f99;
		word-break: break-all;
	}

	.path-state--error {
		border-left: 8rpx solid #c0392b;
	}

	.path-state-actions {
		margin-top: 20rpx;
	}

	.path-primary-btn {
		margin: 0;
		padding: 0 36rpx;
		font-size: 24rpx;
		line-height: 56rpx;
		border-radius: 8rpx;
		background-color: #114598;
		color: #ffffff;
	}


	.path-map-box {
		position: relative;
		margin-top: 20rpx;
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #f0f0f0;
	}

	.path-map-legend {
		position: absolute;
		right: 20rpx;
		bottom: 20rpx;
		z-index: 10;
		display: flex;
		flex-direction: column;
		padding: 14rpx 20rpx;
		background-color: rgba(255, 255, 255, 0.94);
		border-radius: 8rpx;
		font-size: 22rpx;
		color: #333333;
	}

	.path-map-legend-item {
		display: flex;
		align-items: center;
		margin: 5rpx 0;
	}

	.path-legend-dot {
		margin-right: 10rpx;
		border: 2rpx solid #ffffff;
		border-radius: 50%;
		box-sizing: border-box;
	}

	.path-legend-dot--stop {
		width: 18rpx;
		height: 18rpx;
		background-color: #114598;
	}

	.path-legend-dot--change {
		width: 14rpx;
		height: 14rpx;
		background-color: #d70f19;
	}

	.path-legend-dot--office {
		width: 10rpx;
		height: 10rpx;
		background-color: #7f8794;
	}

	.path-legend-dot--train {
		width: 20rpx;
		height: 20rpx;
		background-color: #10b981;
	}

	.path-route-legend {
		margin-top: 20rpx;
		padding: 20rpx 28rpx;
	}

	.path-time-note {
		display: block;
		margin-top: 14rpx;
		padding: 0 4rpx;
		font-size: 20rpx;
		color: #8a8f99;
		line-height: 1.4;
	}

	.path-time-note--map {
		padding: 0 8rpx;
	}

	.path-route-legend-row {
		display: flex;
		align-items: center;
		padding: 10rpx 0;
	}

	.path-legend-swatch {
		width: 18rpx;
		height: 18rpx;
		margin-right: 14rpx;
		border-radius: 4rpx;
		flex-shrink: 0;
	}

	.path-route-legend-name {
		flex: 1;
		font-size: 26rpx;
		color: #303133;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.path-route-legend-mileage {
		margin-left: 16rpx;
		font-size: 24rpx;
		color: #606266;
		flex-shrink: 0;
	}

	.path-schematic-card {
		margin-top: 20rpx;
		padding: 24rpx 20rpx 18rpx;
	}

	.path-schematic-section {
		margin: -24rpx -20rpx 0;
	}

	.path-schematic-toggle {
		padding: 8rpx 18rpx;
		font-size: 22rpx;
		color: #114598;
		border: 2rpx solid rgba(17, 69, 152, 0.4);
		border-radius: 8rpx;
		line-height: 1.2;
	}

	.path-schematic {
		position: relative;
		margin-top: 8rpx;
	}

	.path-row {
		position: relative;
		display: flex;
		align-items: flex-start;
		height: 178rpx;
	}

	.path-row--reverse {
		flex-direction: row-reverse;
	}

	.path-cell {
		position: relative;
		display: flex;
		flex: 1 1 0;
		flex-direction: column;
		align-items: center;
		min-width: 0;
		height: 100%;
		padding-top: 44rpx;
		box-sizing: border-box;
	}

	.path-cell--empty {
		visibility: hidden;
	}

	.path-line {
		position: absolute;
		top: 56rpx;
		height: 6rpx;
		border-radius: 6rpx;
		z-index: 1;
	}

	.path-line--next {
		left: 50%;
		width: 100%;
	}

	.path-row--reverse .path-line--next {
		left: auto;
		right: 50%;
	}

	/* 伸进圆弧 6rpx，盖住圆端帽收口处的上下缺口 */
	.path-line--edge {
		left: 50%;
		width: calc(50% - 14rpx);
	}

	.path-row--reverse .path-line--edge {
		left: auto;
		right: 50%;
	}

	.path-line--from-edge {
		right: 50%;
		width: calc(50% - 14rpx);
	}

	.path-row--reverse .path-line--from-edge {
		right: auto;
		left: 50%;
	}

	.path-connector {
		position: absolute;
		top: 72rpx;
		right: 0;
		width: 6rpx;
		height: 152rpx;
		z-index: 1;
	}

	.path-connector--left {
		right: auto;
		left: 0;
	}

	/* 折返处用两段圆角包边接横竖线，避免直角拼接；高度比圆弧多 4rpx，盖住竖线接缝 */
	.path-connector::before,
	.path-connector::after {
		content: '';
		position: absolute;
		right: 0;
		width: 20rpx;
		height: 24rpx;
		border: 0 solid currentColor;
		border-radius: 0;
		box-sizing: border-box;
		pointer-events: none;
	}

	.path-connector::before {
		top: -16rpx;
		border-top-width: 6rpx;
		border-right-width: 6rpx;
		border-top-right-radius: 20rpx;
	}

	.path-connector::after {
		bottom: -16rpx;
		border-bottom-width: 6rpx;
		border-right-width: 6rpx;
		border-bottom-right-radius: 20rpx;
	}

	.path-connector--left::before,
	.path-connector--left::after {
		right: auto;
		left: 0;
	}

	.path-connector--left::before {
		border-right-width: 0;
		border-left-width: 6rpx;
		border-top-right-radius: 0;
		border-top-left-radius: 20rpx;
	}

	.path-connector--left::after {
		border-right-width: 0;
		border-left-width: 6rpx;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 20rpx;
	}

	.path-dot {
		position: relative;
		z-index: 2;
		width: 22rpx;
		height: 22rpx;
		border: 4rpx solid #ffffff;
		border-radius: 50%;
		box-sizing: content-box;
		box-shadow: 0 0 0 1rpx rgba(0, 0, 0, 0.06);
	}

	.path-route-chip {
		position: absolute;
		top: 0;
		left: 50%;
		z-index: 3;
		padding: 4rpx 12rpx;
		border: 2rpx solid #114598;
		border-radius: 6rpx;
		background-color: #ffffff;
		font-size: 20rpx;
		font-weight: 600;
		line-height: 1.25;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		box-sizing: border-box;
		transform: translateX(-50%);
	}

	.path-station {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		margin-top: 10rpx;
		padding: 0 4rpx;
		box-sizing: border-box;
	}

	.path-station-name {
		max-width: 100%;
		font-size: 24rpx;
		color: #303133;
		line-height: 1.3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.path-station-name--stop {
		font-weight: 700;
		color: #1c1e21;
	}

	.path-station-mileage {
		min-height: 24rpx;
		margin-top: 2rpx;
		font-size: 20rpx;
		color: #8a8f99;
		line-height: 1.2;
		white-space: nowrap;
	}

	.path-station-time {
		min-height: 24rpx;
		margin-top: 2rpx;
		font-size: 20rpx;
		font-weight: 600;
		color: #114598;
		line-height: 1.2;
		white-space: nowrap;
	}

	.path-station-time--estimated {
		font-weight: 400;
		color: #8a8f99;
	}

	.path-schematic-legend {
		display: flex;
		flex-wrap: wrap;
		margin-top: 18rpx;
		padding-top: 14rpx;
		border-top: 1rpx solid #eef1f5;
	}

	.path-schematic-legend-item {
		display: flex;
		align-items: center;
		margin: 6rpx 28rpx 6rpx 0;
	}

	.path-schematic-legend-name {
		font-size: 22rpx;
		color: #303133;
	}

	.path-schematic-legend-mileage {
		margin-left: 8rpx;
		font-size: 20rpx;
		color: #8a8f99;
	}
</style>