<template>
	<view class="ux-bg-grey5" style="min-height:100vh; padding-bottom: 40rpx;">
		<back-header></back-header>

		<view class="ux-padding" style="padding-top: 0px;">
			<text class="ux-h2" style="display: block; margin-top: 10rpx;">{{keyword}}</text>
			<view class="ux-mt-small">
				<text class="custom-badge">
					{{ isQueryTypeRun ? '运行记录' : '配属信息' }}
				</text>
			</view>
		</view>
		
		<view class="ux-pl ux-pr ux-pb">
			<view class="ux-text-center ux-padding-small ux-mb ux-h6 info-bar" style="margin-bottom: 35rpx;">
				<text class="ux-bold">信息仅供参考 请以铁路运营企业实际运用为准</text>
			</view>
			
			<block v-if="isQueryTypeRun">
				<uni-table border="false" stripe="false" :loading="loading" class="custom-table-container" >
					<uni-tr v-for="(item,index) in displayData" :key="index" class="magic-card no-click">
						<uni-td align="left" class="card-cell">
							<view class="card-main">
								<view class="card-header">
									<text class="card-title">{{item.runDate}}</text>
									<text v-if="item.coupling" class="coupling-tag">重联</text>
								</view>
								<view class="card-body">
									<view class="info-row">
										<text class="label">担当车次：</text>
										<text class="value text-highlight">{{item.trainNum}}</text>
									</view>
									<view class="info-row" style="align-items: center;">
										<text class="label">担当车组：</text>
										<view class="value emu-list">
											<block v-for="(code, cIdx) in item.trainCode" :key="cIdx">
												<view class="emu-code-click-block" hover-class="emu-code-active" @click="goToInfo(code)">
													<text class="emu-code-text">{{code}}</text>
													<uni-icons type="right" size="12" color="#114598" style="margin-left: 6rpx;"></uni-icons>
												</view>
												<text v-if="cIdx < item.trainCode.length - 1" class="plus-split">+</text>
											</block>
										</view>
									</view>
								</view>
							</view>
							<view class="arrow-box placeholder-arrow">
								<uni-icons type="right" size="18" color="#dddddd"></uni-icons>
							</view>
						</uni-td>
					</uni-tr>
				</uni-table>
			</block>

			<block v-else>
				<uni-section style="background-color:#eeeeee;margin-left:-1.2vh;margin-bottom: 20rpx;" type="line" :title="'共查到 ' + totalCount + ' 条记录，已加载 ' + displayData.length + ' 条'"></uni-section>
				
				<uni-table border="false" stripe="false" :loading="loading" class="custom-table-container">
					<uni-tr v-for="(item,index) in displayData" :key="index" class="magic-card" hover-class="card-active" @click="goToInfo(item.id)">
						<uni-td align="left" class="card-cell">
							<view class="card-main">
								<view class="card-header">
									<text class="card-title emu-id">{{item.id}}</text>
									<text class="emu-model-tag">{{item.model}}</text>
								</view>
								<view class="card-body">
									<view class="info-row">
										<text class="label">局属：</text>
										<text class="value">{{item.bureau}}</text>
									</view>
									<view class="info-row">
										<text class="label">动车所：</text>
										<text class="value">{{item.depot}}</text>
									</view>
								</view>
							</view>
							<view class="arrow-box">
								<uni-icons type="right" size="18" color="#bbbbbb"></uni-icons>
							</view>
						</uni-td>
					</uni-tr>
				</uni-table>
				
				<view v-if="hasMore" class="ux-text-center ux-padding">
					<text class="ux-text-small ux-opacity-5">上拉加载更多...</text>
				</view>
			</block>

			<view v-if="displayData.length === 0 && !loading" class="ux-text-center ux-padding" style="margin-top: 60rpx;">
				<text class="ux-opacity-6">—— 暂无相关数据 ——</text>
			</view>
			
			<br>
			<view class="ux-flex ux-row ux-justify-content-center" style="margin-top: 30rpx;">
				<text class="ux-text-small ux-opacity-4">—— 数据来源: crh.lihugang.top & RailGo ——</text>
			</view>
		</view>
	</view>
</template>

<script>
import { uniGet } from "@/scripts/req.js";

export default {
	data() {
		return {
			keyword: "",
			isQueryTypeRun: true, 
			keywordType: "",     
			loading: false,
			displayData: [], 
			allServerData: [],   
			totalCount: 0,
			pageSize: 15,        
			currentPage: 1,      
			hasMore: false
		}
	},
	onLoad(options) {
		this.keyword = (options.keyword || "").trim();
		this.analyzeQueryType();
		this.fillInData();
		
		const c = uni.getStorageSync("search");
		uni.setStorage({
			key: 'search',
			data: (c || 0) + 1
		});
	},
	onShow() {
		// #ifdef APP-PLUS
		plus.navigator.setStatusBarBackground('#114598');
		// #endif
	},
	onReachBottom() {
		if (!this.isQueryTypeRun && this.hasMore && !this.loading) {
			this.loadNextLocalPage();
		}
	},
	methods: {
		back() {
			uni.navigateBack();
		},
		analyzeQueryType() {
			const kw = this.keyword;
			const trainNumReg = /^[A-Z]\d{1,4}$/i;
			const emuIdReg = /^[A-Z0-9]+(?:-[A-Z0-9]+)*-\d+/i;
			
			if (trainNumReg.test(kw) || emuIdReg.test(kw)) {
				this.isQueryTypeRun = true;
			} else {
				this.isQueryTypeRun = false;
				const pureNumberReg = /^\d+$/;
				if (pureNumberReg.test(kw)) {
					this.keywordType = "Number";
				} else {
					this.keywordType = "Model";
				}
			}
		},
		async fillInData() {
			this.loading = true;
			this.displayData = [];
			uni.showLoading({ title: '数据检索中...' });
			
			try {
				const runBase = uni.getStorageSync('service_source_emu_run') || 'https://emu.railgo.zenglingkun.cn';
				const assignmentBase = uni.getStorageSync('service_source_emu_assignment') || 'https://emu.railgo.zenglingkun.cn';
				let apiUrl = "";
				
				if (this.isQueryTypeRun) {
					apiUrl = runBase + `/api/query?keyword=${encodeURIComponent(this.keyword)}`;
					const response = await uniGet(apiUrl);
					
					if (response && response.data && response.data.success && response.data.data) {
						this.displayData = response.data.data;
					}
				} else {
					apiUrl = assignmentBase + `/api/car/query?keyword=${encodeURIComponent(this.keyword)}&keywordType=${this.keywordType}`;
					const response = await uniGet(apiUrl);
					
					if (response && response.data && response.data.success && response.data.data) {
						this.allServerData = response.data.data;
						this.totalCount = response.data.count || this.allServerData.length;
						this.currentPage = 1;
						this.renderLocalPage();
					}
				}
				
				if (this.displayData.length === 0) {
					uni.redirectTo({ url: '/pages/404/404' });
				}
				
			} catch (error) {
				console.error("接口聚合调取失败", error);
				uni.showToast({ title: "加载失败", icon: "none" });
				if (this.displayData.length === 0) {
					uni.redirectTo({ url: '/pages/404/404' });
				}
			} finally {
				uni.hideLoading();
				this.loading = false;
			}
		},
		renderLocalPage() {
			const start = 0;
			const end = this.currentPage * this.pageSize;
			this.displayData = this.allServerData.slice(start, end);
			this.hasMore = end < this.allServerData.length;
		},
		loadNextLocalPage() {
			this.loading = true;
			uni.showLoading({ title: '加载更多...' });
			setTimeout(() => {
				this.currentPage++;
				this.renderLocalPage();
				uni.hideLoading();
				this.loading = false;
			}, 200);
		},
		// 路由中继器：携带车号参数跳转到刚刚编写的 info 页面
		goToInfo(emuId) {
			if (!emuId) return;
			uni.navigateTo({
				url: `/pages/emu/info?emu=${encodeURIComponent(emuId)}`
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
	margin-bottom: 24rpx;
	font-size: 26rpx;
}

.custom-badge {
	display: inline-block;
	background-color: #114598; 
	color: #ffffff; 
	padding: 6rpx 20rpx; 
	border-radius: 8rpx; 
	font-size: 24rpx;
}

/* ================= 核心：uni-table 全新魔改卡片系统 ================= */
::v-deep .custom-table-container {
	background-color: transparent !important;
	border: none !important;
}
::v-deep .uni-table {
	background-color: transparent !important;
	border: none !important;
}

/* 统一卡片底色面板形态 */
::v-deep .magic-card {
	display: block !important;
	background-color: #ffffff !important;
	border-radius: 16rpx !important;
	margin-bottom: 24rpx !important;
	border-left: 10rpx solid #114598 !important; /* 经典深蓝色带 */
	box-shadow: 0 4rpx 16rpx rgba(17, 69, 152, 0.06) !important; 
	overflow: hidden !important;
	transition: all 0.1s ease-in-out !important;
}

/* 当整张卡片支持点击时的反馈（用于配属信息） */
.card-active {
	background-color: #f4f7fb !important;
	transform: scale(0.99) !important;
}

/* 当整张卡片不支持点击时的降级（用于运行记录） */
::v-deep .magic-card.no-click {
	background-color: #ffffff !important;
	transform: none !important;
}

::v-deep .card-cell {
	display: flex !important;
	flex-direction: row !important;
	align-items: center !important;
	padding: 24rpx 16rpx 24rpx 24rpx !important;
	border: none !important; 
	width: 100% !important;
	box-sizing: border-box !important;
}

.card-main {
	flex: 1 !important;
	display: flex !important;
	flex-direction: column !important;
	overflow: hidden !important;
}

/* 右侧大箭头框 */
.arrow-box {
	width: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
/* 运行记录里不需要这个大箭头，将其设为浅色占位，保持视觉对称平衡 */
.placeholder-arrow {
	opacity: 0.25;
}

/* 卡片公共内部排版 */
.card-header {
	display: flex !important;
	flex-direction: row !important;
	align-items: center !important;
	gap: 16rpx;
	border-bottom: 1rpx solid #f8f8f8 !important;
	padding-bottom: 12rpx !important;
	margin-bottom: 14rpx !important;
}
.card-title {
	font-size: 32rpx !important;
	font-weight: 700 !important;
	color: #333333 !important;
}
.emu-id {
	color: #114598 !important; 
}
.coupling-tag {
	background-color: #e1f5fe !important;
	color: #0288d1 !important;
	font-size: 22rpx !important;
	padding: 2rpx 12rpx !important;
	border-radius: 4rpx !important;
	font-weight: bold !important;
}
.emu-model-tag {
	background-color: #f5f5f5 !important;
	color: #555555 !important;
	font-size: 24rpx !important;
	padding: 2rpx 12rpx !important;
	border-radius: 6rpx !important;
}

.card-body {
	display: flex !important;
	flex-direction: column !important;
	gap: 12rpx !important;
}
.info-row {
	display: flex !important;
	flex-direction: row !important;
	align-items: flex-start !important;
	font-size: 28rpx !important;
	line-height: 1.4 !important;
}
.info-row .label {
	width: 145rpx !important;
	color: #888888 !important;
	flex-shrink: 0 !important;
}
.info-row .value {
	color: #333333 !important;
	font-weight: 600 !important;
	flex: 1 !important;
}
.text-highlight {
	color: #114598 !important;
	font-size: 29rpx !important;
}

/* 车组号列表弹性包裹区 */
.emu-list {
	display: flex !important;
	flex-direction: row !important;
	align-items: center !important;
	flex-wrap: wrap !important;
	gap: 12rpx !important;
}

/* ================= 核心高亮：每一个独立车号的胶囊按钮 ================= */
.emu-code-click-block {
	display: inline-flex !important;
	flex-direction: row !important;
	align-items: center !important;
	background-color: #f0f4fa !important; /* 浅品牌背景色 */
	padding: 6rpx 14rpx !important;
	border-radius: 8rpx !important;
	border: 1rpx solid #d0e0f5 !important;
	transition: all 0.1s ease-in-out;
}

/* 按钮点击下的气泡回弹反馈 */
.emu-code-active {
	background-color: #114598 !important; /* 点击时反转为深蓝色 */
	border-color: #114598 !important;
}
/* 点击反转时，文字和内置箭头的颜色补正 */
.emu-code-active .emu-code-text {
	color: #ffffff !important;
}
::v-deep .emu-code-active .uni-icons {
	color: #ffffff !important;
}

.emu-code-text {
	color: #114598 !important;
	font-size: 26rpx !important;
	font-weight: bold !important;
}
.plus-split {
	color: #bbbbbb !important;
	font-weight: bold !important;
	margin: 0 4rpx;
}
</style>