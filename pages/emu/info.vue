<template>
	<view class="ux-bg-grey5" style="min-height:100vh; padding-bottom: 40rpx;">
		<back-header></back-header>

		<view class="ux-pl ux-pr ux-pb" v-if="!loading && emuData.id">
			<view class="ux-bg-white ux-border-radius">
				<view class="ux-flex ux-space-between ux-pt ux-pl ux-pr ux-align-items-center">
					<view>
						<text class="consolas"
							style="font-size:50rpx;padding-left:5rpx;">{{emuData.id}}</text>
					</view>
					<text v-if="emuData.sub_model && emuData.sub_model !== '-'" 
						  class="ux-badge ux-text-small ux-color-white" 
						  style="padding:5rpx 15rpx; background-color: #114598;">
						{{emuData.sub_model}}
					</text>			
				</view>
				<view class="ux-flex ux-space-between ux-mt-small ux-pl ux-pr ux-pt-small ux-color-white"
					style="background-color: #114598;">
					<text
						class="ux-text-small">{{emuData.bureau || ''}}
						·
						{{emuData.depot || ''}}</text>
					<text class="ux-text-small ux-color-grey5">{{emuData.train_depot || ''}}&nbsp;&nbsp;</text>
				</view>
				<view class="ux-pb-small" style="border-bottom-left-radius:10rpx; border-bottom-right-radius:10rpx; background-color: #114598;">
				</view>
			</view>

			<view class="ux-flex ux-row ux-mb" style="gap: 16rpx; margin-top: 25rpx;">
				<view v-if="emuData.railway_travel_code_enabled" class="status-mini-badge badge-green">
					<text class="icon" style="font-size: 24rpx; margin-right: 8rpx;">&#xe642;</text>铁路畅行扫码服务
				</view>
				<view v-if="emuData.is_public" class="status-mini-badge badge-blue">
					<text class="icon" style="font-size: 24rpx; margin-right: 8rpx;">&#xe7fd;</text>对外运营
				</view>
			</view>

			<view class="ux-text-center ux-padding-small ux-mb ux-h6 info-bar" style="margin-bottom: 35rpx;">
				<text class="ux-bold">信息仅供参考 请以实际为准</text>
			</view>

			<view class="ux-bg-white ux-border-radius" style="overflow: hidden; margin-bottom: 30rpx;" v-if="carImageUrl">
				<view class="image-wrapper">
					<image :src="carImageUrl" @error="onImageError" mode="widthFix" style="width: 100%; display: block; height: auto;"></image>
				</view>
				<view class="ux-flex ux-space-between ux-padding-small ux-color-white" style="background-color: #114598;">
					<text class="ux-text-small ux-bold">{{ emuData.model }}</text>
					<text class="ux-text-small" style="opacity: 0.8;">Copyright {{ imageUploaderUsername }}</text>
				</view>
			</view>

			<block v-if="recentRuns && recentRuns.length > 0">
				<uni-section title="最近运行动态" type="line" style="background-color: transparent;" title-font-size="28rpx" class="section-title"></uni-section>
				
				<view class="recent-run-container">
					<view v-for="(run, rIdx) in recentRuns" :key="rIdx" class="run-magic-card" hover-class="ux-bg-grey8" @click="goToResult(run.trainNum)">
						<view class="ux-flex ux-space-between ux-pt ux-pb ux-pl ux-pr ux-align-items-center">
							<view>
								<text class="consolas" style="font-size: 34rpx; font-weight: bold; color: #333333;">{{run.runDate}}</text>
							</view>
							<view class="train-code-click-block">
								<text class="train-code-text">{{run.trainNum}}</text>
								<uni-icons type="right" size="12" color="#114598" style="margin-left: 6rpx;"></uni-icons>
							</view>
						</view>
					</view>
				</view>
			</block>

			<uni-section title="车厢设施" type="line" style="background-color: transparent;" title-font-size="28rpx" class="section-title"></uni-section>
			
			<view class="facility-grid">
				<view class="facility-card">
					<view class="facility-header">
						<uni-icons type="link" size="16" color="#114598"></uni-icons>
						<text class="facility-title">电源/充电口位置</text>
					</view>
					<text class="facility-desc">{{ emuData.socket_location || '暂无数据' }}</text>
				</view>

				<view class="facility-card">
					<view class="facility-header">
						<uni-icons type="person" size="16" color="#114598"></uni-icons>
						<text class="facility-title">卫生间配置</text>
					</view>
					<text class="facility-desc">{{ emuData.toilet_status || '暂无数据' }}</text>
				</view>

				<view class="facility-card" v-if="emuData.business_seat_type && emuData.business_seat_type !== '-'">
					<view class="facility-header">
						<uni-icons type="vip" size="16" color="#114598"></uni-icons>
						<text class="facility-title">商务座舱类型</text>
					</view>
					<text class="facility-desc">{{ emuData.business_seat_type }}</text>
				</view>

				<view class="facility-card">
					<view class="facility-header">
						<uni-icons type="checkbox" size="16" :color="emuData.first_class_power_legrest ? '#27ae60' : '#bbbbbb'"></uni-icons>
						<text class="facility-title">一等座电动腿托</text>
					</view>
					<text class="facility-desc" :style="emuData.first_class_power_legrest ? 'color:#27ae60;' : 'color:#666666;'">
						{{ emuData.first_class_power_legrest ? '配备' : '未配备' }}
					</text>
				</view>
			</view>

			<uni-section title="生产与制造" type="line" style="background-color: transparent;" title-font-size="28rpx" class="section-title"></uni-section>
			
			<view class="ux-bg-white ux-border-radius ux-padding shadow-card">
				<view class="tech-row">
					<text class="label">动车制造厂</text>
					<text class="val">{{ emuData.trainset_manufacturer || '-' }}</text>
				</view>
				<view class="tech-divider"></view>
				<view class="tech-row">
					<text class="label">拖车制造厂</text>
					<text class="val">{{ emuData.trailer_manufacturer || '-' }}</text>
				</view>
				<view class="tech-divider"></view>
				<view class="tech-row">
					<text class="label">生产时间</text>
					<text class="val consolas">{{ emuData.manufacture_month || '-' }}</text>
				</view>
			</view>

			<block v-if="(emuData.remark && emuData.remark.model) || (emuData.remark && emuData.remark.car && emuData.remark.car.note)">
				<uni-section title="综合车组乘坐备注" type="line" style="background-color: transparent;" title-font-size="28rpx" class="section-title"></uni-section>
				
				<view class="ux-bg-white ux-border-radius ux-padding shadow-card ux-flex ux-flex-column" style="gap: 20rpx;">
					<view v-if="emuData.remark.model" class="remark-box box-blue">
						<text class="remark-title"><uni-icons type="info-filled" size="14" color="#114598" style="margin-right: 6rpx;"></uni-icons>车型备注：</text>
						<text class="remark-content">{{ emuData.remark.model }}</text>
					</view>
					
					<view v-if="emuData.remark.car && emuData.remark.car.note" class="remark-box box-orange">
						<text class="remark-title"><uni-icons type="warn-filled" size="14" color="#e65100" style="margin-right: 6rpx;"></uni-icons>本车备注：</text>
						<text class="remark-content">{{ emuData.remark.car.note }}</text>
					</view>
				</view>
			</block>

		</view>

		<view v-if="!loading && !emuData.id" class="ux-text-center ux-padding" style="margin-top: 100rpx;">
			<text class="ux-opacity-5">—— 未检索到该车组的详细档案 ——</text>
		</view>
		
		<view class="ux-flex ux-row ux-justify-content-center" style="margin-top: 60rpx;">
			<text class="ux-text-small ux-opacity-3">—— 数据来源: crh.lihugang.top & RailGo  ——</text>
		</view>
	</view>
</template>

<script>
import { uniGet } from "@/scripts/req.js";

export default {
	data() {
		return {
			emuId: "",
			loading: false,
			emuData: {},
			carTags: [],
			carImageUrl: "",
			imageUploaderUsername: "",
			recentRuns: [] // 用于存储截取后的最多3条最近运行历史
		}
	},
	onLoad(options) {
		this.emuId = options.emu ? options.emu.trim().toUpperCase() : "";
		if (this.emuId) {
			this.fetchCarInfo();
		} else {
			uni.showToast({ title: "车号参数丢失", icon: "none" });
		}
	},
	onShow() {
		// #ifdef APP-PLUS || APP
		plus.navigator.setStatusBarBackground('#114598');
		// #endif
	},
	methods: {
		back() {
			uni.navigateBack();
		},
		async fetchCarInfo() {
			this.loading = true;
			uni.showLoading({ title: "拉取档案中..." });
			
			try {
				const assignmentBase = uni.getStorageSync('service_source_emu_assignment') || 'https://emu.railgo.zenglingkun.cn';
				const apiUrl = assignmentBase + `/api/car/info?id=${encodeURIComponent(this.emuId)}`;
				const response = await uniGet(apiUrl);
				
				if (response && response.data && response.data.success && response.data.data) {
					this.emuData = response.data.data;
					
					// 严格解析车组附加 TAG
					if (this.emuData.remark && this.emuData.remark.car && this.emuData.remark.car.tags) {
						try {
							const tagsStr = this.emuData.remark.car.tags;
							this.carTags = typeof tagsStr === 'string' ? JSON.parse(tagsStr) : tagsStr;
							if (!Array.isArray(this.carTags)) this.carTags = [];
						} catch (e) {
							this.carTags = [];
						}
					}
					
					// 串行触发影像和最近运行动态
					this.initImageChain();
					this.fetchRecentRuns();
				} else {
					uni.redirectTo({ url: '/pages/404/404' });
				}
			} catch (error) {
				console.error("档案检索失败:", error);
				uni.redirectTo({ url: '/pages/404/404' });
			} finally {
				uni.hideLoading();
				this.loading = false;
			}
		},
		// 获取最近 3 条运行状态
		async fetchRecentRuns() {
			try {
				const runBase = uni.getStorageSync('service_source_emu_run') || 'https://emu.railgo.zenglingkun.cn';
				const runApiUrl = runBase + `/api/query?keyword=${encodeURIComponent(this.emuId)}`;
				const runResp = await uniGet(runApiUrl);
				if (runResp && runResp.data && runResp.data.success && runResp.data.data) {
					// 截取前 3 条最新数据展现
					this.recentRuns = runResp.data.data.slice(0, 3);
				} else {
					this.recentRuns = [];
				}
			} catch (e) {
				console.error("加载最近运行动态失败", e);
				this.recentRuns = [];
			}
		},
		async initImageChain() {
			const modelName = this.emuData.model || "";
			if (!modelName) {
				this.carImageUrl = "";
				return;
			}
			
			try {
				const tpBase = uni.getStorageSync('service_source_tp') || 'https://tp.railgo.zenglingkun.cn';
				const metaUrl = tpBase + `/api/${encodeURIComponent(modelName)}.json`;
				const resp = await uniGet(metaUrl);
				
				if (resp && resp.data && resp.data.success && resp.data.data && resp.data.data.image_url) {
					this.carImageUrl = resp.data.data.image_url;
					this.imageUploaderUsername = resp.data.data.uploader_username || '铁道迷';
				} else {
					this.carImageUrl = "";
				}
			} catch (err) {
				this.carImageUrl = "";
			}
		},
		onImageError(e) {
			this.carImageUrl = "";
		},
		// 点击车次中继器：跳转至对应车次的搜索结果页（result）
		goToResult(trainNum) {
			if (!trainNum) return;
			uni.navigateTo({
				url: `/pages/emu/result?keyword=${encodeURIComponent(trainNum)}`
			});
		}
	}
}
</script>

<style scoped>
/* 顶栏提示区 */
.info-bar {
	background-color: #e9eef5;
	border: 1px solid #114598;
	border-radius: 10rpx;
	color: #114598;
	padding: 16rpx;
	font-size: 26rpx;
}

/* 一体化特性胶囊微标 */
.status-mini-badge {
	display: inline-flex;
	align-items: center;
	font-size: 23rpx;
	padding: 6rpx 16rpx;
	border-radius: 30rpx;
	font-weight: 600;
}
.badge-green { background-color: #f0fff4; color: #38a169; border: 1rpx solid #c6f6d5; }
.badge-blue { background-color: #ebf8ff; color: #3182ce; border: 1rpx solid #bee3f8; }

/* 生产信息列表线 */
.tech-divider {
	height: 1rpx;
	background-color: #edf2f7;
	margin: 16rpx 0;
}

/* 小标题补正 */
.section-title {
	margin-top: 35rpx;
	margin-bottom: 15rpx;
}

/* ================= 纯正一模一样的运行卡片样式设计 ================= */
.recent-run-container {
	display: flex;
	flex-direction: column;
	width: 100%;
}
.run-magic-card {
	background-color: #ffffff !important;
	border-radius: 10rpx !important;
	margin-bottom: 20rpx !important;
	box-shadow: 0 4rpx 12rpx rgba(17, 69, 152, 0.03) !important;
	overflow: hidden !important;
}

/* 独立车次高亮胶囊外框（带点击指向箭头） */
.train-code-click-block {
	display: inline-flex !important;
	flex-direction: row !important;
	align-items: center !important;
	background-color: #f0f4fa !important;
	padding: 6rpx 16rpx !important;
	border-radius: 8rpx !important;
	border: 1rpx solid #d0e0f5 !important;
}
.train-code-text {
	color: #114598 !important;
	font-size: 26rpx !important;
	font-weight: bold !important;
}

/* ================= 设施卡片网格栅格布局 ================= */
.facility-grid {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 20rpx;
	width: 100%;
}
.facility-card {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 24rpx;
	width: 48%; 
	box-shadow: 0 4rpx 12rpx rgba(17, 69, 152, 0.03);
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}
.facility-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 10rpx;
}
.facility-title {
	font-size: 24rpx;
	color: #718096;
	font-weight: 500;
}
.facility-desc {
	font-size: 26rpx;
	color: #2d3748;
	line-height: 1.4;
	font-weight: 700;
}

/* 技术制造细节表格排版 */
.tech-row {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding: 8rpx 0;
	font-size: 28rpx;
}
.tech-row .label {
	color: #718096;
}
.tech-row .val {
	color: #1a202c;
	font-weight: 600;
}

/* ================= 避坑备注框设计 ================= */
.remark-box {
	padding: 20rpx 24rpx;
	border-radius: 12rpx;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	line-height: 1.5;
}
.box-blue {
	background-color: #f7fafc;
	border-left: 8rpx solid #114598;
}
.box-orange {
	background-color: #fffaf0;
	border-left: 8rpx solid #dd6b20;
}
.remark-title {
	font-size: 26rpx;
	font-weight: bold;
}
.box-blue .remark-title { color: #114598; }
.box-orange .remark-title { color: #dd6b20; }
.remark-content {
	font-size: 25rpx;
	color: #4a5568;
	text-align: justify;
}

.shadow-card {
	box-shadow: 0 4rpx 16rpx rgba(17, 69, 152, 0.04);
}
.opacity-5 { opacity: 0.5; }
.opacity-3 { opacity: 0.3; }
</style>