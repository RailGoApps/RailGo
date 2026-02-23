<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<!-- headers begin -->
		<view class="ux-bg-primary" style="height:  var(--status-bar-height);">&nbsp;</view>

		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">调试菜单</text>
		</view>
		<!-- headers end -->
		<view class="ux-padding ux-bg-grey5">
			
			<!-- 车次查询 -->
			<view class="info-card">
				<text class="card-title">车次查询</text>
				<view class="info-row">
					<text class="info-label">接口</text>
					<text class="info-value">GET /api/train/query</text>
				</view>
				<view class="info-row">
					<text class="info-label">URL</text>
					<text class="info-value" style="word-break: break-all;">https://data.railgo.zenglingkun.cn/api/train/query</text>
				</view>
				<view class="info-row">
					<text class="info-label">说明</text>
					<text class="info-value">通过车次号查询列车信息</text>
				</view>
				<view class="param-section">
					<text class="param-label">请求参数</text>
					<view class="param-row">
						<text class="param-name">train</text>
						<input 
							class="param-input" 
							type="text" 
							v-model="trainParams.train" 
							placeholder="请输入车次号（如：G1）"
						/>
					</view>
				</view>
				<view class="result-section" v-if="trainResult">
					<text class="result-label">返回结果</text>
					<text class="result-content">{{ formatJSON(trainResult) }}</text>
				</view>
				<view class="button-section">
					<button class="debug-button" @click="testTrainQuery">调试</button>
				</view>
			</view>

			<!-- 车站查询 -->
			<view class="info-card">
				<text class="card-title">车站查询</text>
				<view class="info-row">
					<text class="info-label">接口</text>
					<text class="info-value">GET /api/station/query</text>
				</view>
				<view class="info-row">
					<text class="info-label">URL</text>
					<text class="info-value" style="word-break: break-all;">https://data.railgo.zenglingkun.cn/api/station/query</text>
				</view>
				<view class="info-row">
					<text class="info-label">说明</text>
					<text class="info-value">车站查询接口</text>
				</view>
				<view class="param-section">
					<text class="param-label">请求参数</text>
					<view class="param-row">
						<text class="param-name">telecode</text>
						<input 
							class="param-input" 
							type="text" 
							v-model="stationParams.telecode" 
							placeholder="请输入车站电报码（如：XBG）"
						/>
					</view>
				</view>
				<view class="result-section" v-if="stationResult">
					<text class="result-label">返回结果</text>
					<text class="result-content">{{ formatJSON(stationResult) }}</text>
				</view>
				<view class="button-section">
					<button class="debug-button" @click="testStationQuery">调试</button>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
import { uniGet } from "@/scripts/req.js";

export default {
	data() {
		return {
			trainParams: {
				train: ''
			},
			stationParams: {
				telecode: ''
			},
			trainResult: null,
			stationResult: null
		}
	},
	onLoad() {
		// #ifdef APP-PLUS
		plus.navigator.setStatusBarBackground('#eeeeee');
		// #endif
	},
	onShow() {
		// #ifdef APP-PLUS
		plus.navigator.setStatusBarBackground('#eeeeee');
		// #endif
	},
	methods: {
		back: function() {
			uni.navigateBack()
		},
		async testTrainQuery() {
			if (!this.trainParams.train) {
				uni.showToast({
					title: '请输入车次号',
					icon: 'none'
				});
				return;
			}
			
			uni.showLoading({
				title: '请求中...'
			});
			
			try {
				const response = await uniGet(
					`https://data.railgo.zenglingkun.cn/api/train/query?train=${encodeURIComponent(this.trainParams.train)}`
				);
				this.trainResult = response.data;
				uni.hideLoading();
			} catch (error) {
				uni.hideLoading();
				this.trainResult = { error: error.message || '请求失败' };
				uni.showToast({
					title: '请求失败',
					icon: 'error'
				});
			}
		},
		async testStationQuery() {
			if (!this.stationParams.telecode) {
				uni.showToast({
					title: '请输入车站电报码',
					icon: 'none'
				});
				return;
			}
			
			uni.showLoading({
				title: '请求中...'
			});
			
			try {
				const response = await uniGet(
					`https://data.railgo.zenglingkun.cn/api/station/query?telecode=${encodeURIComponent(this.stationParams.telecode)}`
				);
				this.stationResult = response.data;
				uni.hideLoading();
			} catch (error) {
				uni.hideLoading();
				this.stationResult = { error: error.message || '请求失败' };
				uni.showToast({
					title: '请求失败',
					icon: 'error'
				});
			}
		},
		formatJSON(obj) {
			if (!obj) return '';
			return JSON.stringify(obj, null, 2);
		}
	}
}
</script>

<style>
	.info-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		padding: 24rpx;
		margin-bottom: 20rpx;
	}

	.card-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #114598;
		margin-bottom: 20rpx;
		display: block;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.info-row:last-child {
		border-bottom: none;
	}

	.info-label {
		font-size: 28rpx;
		color: #666;
		flex-shrink: 0;
		margin-right: 20rpx;
	}

	.info-value {
		font-size: 26rpx;
		color: #333;
		font-weight: 500;
		word-break: break-all;
		text-align: right;
	}

	.param-section {
		margin-top: 20rpx;
		padding: 20rpx;
		background-color: #f9f9f9;
		border-radius: 12rpx;
	}

	.param-label {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 16rpx;
	}

	.param-row {
		display: flex;
		align-items: center;
	}

	.param-name {
		font-size: 28rpx;
		color: #666;
		width: 150rpx;
		flex-shrink: 0;
	}

	.param-input {
		flex: 1;
		padding: 16rpx;
		background-color: #ffffff;
		border: 1rpx solid #e0e0e0;
		border-radius: 8rpx;
		font-size: 28rpx;
	}

	.result-section {
		margin-top: 20rpx;
		padding: 20rpx;
		background-color: #f9f9f9;
		border-radius: 12rpx;
		max-height: 400rpx;
		overflow-y: auto;
	}

	.result-label {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 16rpx;
	}

	.result-content {
		font-size: 24rpx;
		color: #333;
		font-family: monospace;
		white-space: pre-wrap;
		word-break: break-all;
		display: block;
		line-height: 1.6;
	}

	.button-section {
		margin-top: 20rpx;
	}

	.debug-button {
		width: 100%;
		background-color: #114598;
		color: #ffffff;
		border: none;
		border-radius: 12rpx;
		padding: 24rpx;
		font-size: 30rpx;
	}
</style>