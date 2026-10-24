<template>
	<view class="bs-page">
		<view class="bs-head">
			<text class="bs-title">{{ stationName }}站</text>
			<view class="bs-kind">
				<view class="bs-kind-item" :class="{ 'bs-kind-on': kind === 'departure' }"
					@click="switchKind('departure')"><text>出发</text></view>
				<view class="bs-kind-item" :class="{ 'bs-kind-on': kind === 'arrival' }"
					@click="switchKind('arrival')"><text>到达</text></view>
			</view>
			<view class="bs-exit" hover-class="bs-exit-hover" @click="close"><text class="icon bs-exit-glyph">&#xe5d1;</text></view>
		</view>

		<view class="bs-row bs-thead">
			<text class="bs-c-num">车次</text>
			<text class="bs-c-status">状态</text>
			<text class="bs-c-from">始发站</text>
			<text class="bs-c-to">终到站</text>
			<text class="bs-c-time">时间</text>
			<text class="bs-c-platform">站台</text>
			<text class="bs-c-room">候车室</text>
			<text class="bs-c-port">{{ kind === 'arrival' ? '出站口' : '检票口' }}</text>
		</view>

		<scroll-view class="bs-body" scroll-y @scrolltolower="loadMore">
			<view v-if="loading && displayed.length === 0">
				<view v-for="i in 8" :key="i" class="bs-row">
					<skeleton v-for="c in 8" :key="c" flex w="0" h="24rpx" radius="6rpx" mr="10rpx" tone="on-dark" />
				</view>
			</view>
			<view v-else>
				<view v-for="item in displayed" :key="item.key" class="bs-row">
					<text class="bs-c-num">{{ item.trainNum }}</text>
					<text class="bs-c-status" :style="{ color: statusColor(item.bigScreenStatusCode) }">
						{{ statusText(item) }}
					</text>
					<text class="bs-c-from">{{ item.trainStartStation }}</text>
					<text class="bs-c-to">{{ item.trainEndStation }}</text>
					<text class="bs-c-time">{{ item.time || '--:--' }}</text>
					<text class="bs-c-platform">{{ item.platform || '-' }}</text>
					<text class="bs-c-room">{{ joinPorts(item.ticketWaitingRoom) }}</text>
					<text class="bs-c-port">{{ joinPorts(kind === 'arrival' ? item.exitPort : item.ticketPort) }}</text>
				</view>
				<view v-if="displayed.length === 0" class="bs-empty">
					<text>本站暂无大屏数据</text>
				</view>
			</view>
		</scroll-view>

		<view class="bs-foot">
			<text>信息仅供参考 请以车站现场公告为准 · 已显示 {{ displayed.length }}/{{ list.length }} 条</text>
		</view>
	</view>
</template>

<script>
	import {
		fetchStationBigScreen,
		getBigScreenStatusColor,
		formatBigScreenStatus
	} from '@/scripts/bigscreen.js';

	export default {
		data() {
			return {
				telecode: '',
				stationName: '',
				kind: 'departure',
				list: [],
				displayed: [],
				showIndex: 0,
				pageSize: 30,
				loading: false,
				refreshTimer: null,
				refreshInterval: 180000
			}
		},
		onLoad(options) {
			this.telecode = options.telecode || '';
			this.stationName = options.name ? decodeURIComponent(options.name) : '';
			this.kind = options.kind === 'arrival' ? 'arrival' : 'departure';
			this.getData();
		},
		onShow() {
			if (this.list.length > 0 && !this.refreshTimer) {
				this.startAutoRefresh();
			}
		},
		onHide() {
			this.stopAutoRefresh();
		},
		onUnload() {
			this.stopAutoRefresh();
		},
		methods: {
			close: function() {
				uni.navigateBack({
					fail: () => {
						uni.reLaunch({ url: '/pages/index/index' });
					}
				});
			},
			switchKind: async function(kind) {
				if (this.kind === kind) return;
				this.kind = kind;
				await this.getData();
			},
			getData: async function() {
				if (!this.telecode) return;
				this.loading = true;
				this.displayed = [];
				this.showIndex = 0;
				this.list = [];
				try {
					this.list = await fetchStationBigScreen(this.telecode, this.kind);
					this.startAutoRefresh();
				} catch (error) {
					console.error('大屏数据加载失败', error);
				}
				this.loading = false;
				this.loadMore();
			},
			loadMore: function() {
				if (this.loading || this.showIndex >= this.list.length) return;
				const next = Math.min(this.showIndex + this.pageSize, this.list.length);
				this.displayed = this.displayed.concat(this.list.slice(this.showIndex, next));
				this.showIndex = next;
			},
			startAutoRefresh: function() {
				this.stopAutoRefresh();
				this.refreshTimer = setInterval(() => {
					this.getData();
				}, this.refreshInterval);
			},
			stopAutoRefresh: function() {
				if (this.refreshTimer) {
					clearInterval(this.refreshTimer);
					this.refreshTimer = null;
				}
			},
			joinPorts: function(arr) {
				return (arr && arr.length > 0) ? arr.join('、') : '-';
			},
			statusColor: function(code) {
				return getBigScreenStatusColor(code);
			},
			statusText: function(item) {
				return formatBigScreenStatus(this.kind, item.bigScreenStatus, item.bigScreenStatusCode, item.timeDelay);
			}
		}
	}
</script>

<style>
	/* 横屏页面统一用 px：rpx 按屏宽换算，横屏下会整体放大导致纵向放不下 */
	.bs-page {
		position: fixed;
		left: 0;
		top: 0;
		width: 100vw;
		height: 100vh;
		background-color: #16232f;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.bs-head {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 8px 14px;
		background-color: #1b2a38;
	}

	.bs-title {
		color: #ffffff;
		font-size: 18px;
		font-weight: bold;
		flex: 1;
	}

	.bs-kind {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-right: 10px;
	}

	.bs-kind-item {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 5px 18px;
		margin-left: 8px;
		border-radius: 16px;
		background-color: #2c3e50;
	}

	.bs-kind-item text {
		color: #bdc3c7;
		font-size: 14px;
		line-height: 1;
	}

	.bs-kind-on {
		background-color: #114598;
	}

	.bs-kind-on text {
		color: #ffffff;
	}

	.bs-exit {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 16px;
		background-color: #2c3e50;
	}

	.bs-exit-hover {
		background-color: #3b506b;
	}

	.bs-exit-glyph {
		color: #ffffff;
		font-size: 19px;
		line-height: 1;
	}

	.bs-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 8px 14px;
		border-bottom: 1px solid #22303e;
	}

	.bs-row text {
		color: #ffffff;
		font-size: 15px;
		line-height: 1.25;
		text-align: center;
	}

	.bs-thead {
		background-color: #1f3041;
		padding: 7px 14px;
	}

	.bs-thead text {
		color: #9fb0c0;
		font-size: 13px;
	}

	.bs-c-num {
		flex: 1;
	}

	.bs-c-status {
		flex: 1.2;
	}

	.bs-c-from,
	.bs-c-to {
		flex: 1.2;
	}

	.bs-c-time {
		flex: 1;
	}

	.bs-c-platform {
		flex: 0.7;
	}

	.bs-c-room {
		flex: 1.3;
	}

	.bs-c-port {
		flex: 1.7;
	}

	.bs-body {
		flex: 1;
		min-height: 0;
	}

	.bs-empty {
		padding: 26px 0;
		text-align: center;
	}

	.bs-empty text {
		color: #ffffff;
		opacity: 0.6;
		font-size: 15px;
	}

	.bs-foot {
		padding: 6px 14px;
		text-align: center;
		background-color: #1b2a38;
	}

	.bs-foot text {
		color: #9fb0c0;
		font-size: 12px;
	}
</style>
