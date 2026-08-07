<template>
	<view class="ux-bg-grey6" style="min-height: 100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>
		<view class="ux-padding-large">
			<view class="ux-mt-large">
				<text class="ux-h1">配置服务源</text><br><br>
				<text class="ux-h6">请为每个服务选择一个 API 来源。</text>
			</view>
		</view>

		<view class="ux-padding">
			<!-- 加载中 -->
			<view v-if="loading" class="ux-text-center ux-padding ux-mt">
				<text class="ux-color-grey2">正在获取服务列表...</text>
			</view>

			<!-- 加载失败 -->
			<view v-if="loadError" class="ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
				<text class="ux-text-small" style="color: #e74c3c;">获取服务列表失败，请检查网络后重试。</text>
				<view class="ux-text-center ux-mt">
					<text class="ux-text-small" style="color: #114598; text-decoration: underline;" @click="fetchServiceEndpoints">点击重试</text>
				</view>
			</view>
			<!-- 服务卡片列表 -->
			<view v-for="(service, index) in serviceList" :key="service.code" class="ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
				<view class="ux-flex ux-space-between ux-align-items-center">
					<view>
						<text class="ux-text-small ux-bold">{{ service.name }}</text>
						<br>
						<text class="ux-text-small ux-color-grey2">{{ service.code }}</text>
					</view>
				</view>

				<view class="ux-mt-small" v-if="service.endpoints.length > 0">
					<picker mode="selector" :range="service.endpointLabels" :value="service.selectedIndex" @change="onEndpointChange($event, service.code)">
						<view class="ux-flex ux-space-between ux-align-items-center" style="border-bottom: 2rpx solid #eee; padding: 16rpx 0;">
							<text class="ux-text-small" :class="service.selectedIndex >= 0 ? '' : 'ux-color-grey2'">
								{{ service.selectedIndex >= 0 ? service.endpointLabels[service.selectedIndex] : '请选择服务源' }}
							</text>
							<text class="icon ux-color-grey1" style="font-size: 36rpx;">&#xe5c8;</text>
						</view>
					</picker>
				</view>
				<view v-else class="ux-mt-small">
					<text class="ux-text-small ux-color-grey2" style="border-bottom: 2rpx solid #eee; display: block; padding: 16rpx 0;">暂无可用服务源</text>
				</view>

				<!-- 已选择的服务源提示 -->
				<view v-if="service.selectedIndex >= 0" class="ux-mt-small">
					<text class="ux-text-small" style="color: #27ae60;">已选择：{{ service.endpointLabels[service.selectedIndex] }}</text>
				</view>
			</view>

			<view v-if="!loading && serviceList.length === 0 && !loadError" class="ux-text-center ux-padding ux-mt">
				<text class="ux-color-grey2">暂无可用服务</text>
			</view>

			<!-- 底部留空给按钮 -->
			<view style="height: 220rpx;"></view>
		</view>

		<!-- 浮动按钮组 -->
		<view class="ux-flex" style="flex-direction: column; align-items: flex-end; position: fixed; right: 40rpx; bottom: 60rpx;">
			<button class="primary-button" style="margin-bottom: 20rpx;" @click="randomSelectAll">
				<text class="icon">&#xe0b8;</text>
			</button>
			<button class="primary-button" @click="goNext">
				<text class="icon">&#xe5c8;</text>
			</button>
		</view>
	</view>
</template>

<script>
	import { uniGet } from "@/scripts/req";

	const serviceNameMap = {
		train: '车次查询',
		train_v2: '车次查询v2',
		station: '车站查询',
		emu_run: '动车组担当',
		emu_assignment: '动车组配属',
		icon: '图标兑换',
		update_pack: '软件升级',
		update_db: '数据库升级',
		bigScreen: '车站大屏',
		trainDelay: '列车正晚点',
		exit: '检票口、停台、出站口',
		coach: '车厢图',
		mapLine: '线路点',
		notice: '通知',
		tp: '图片'
	};

	export default {
		data() {
			return {
				loading: false,
				loadError: false,
				serviceList: []
			};
		},
		onShow() {
			// #ifdef APP-PLUS
			plus.navigator.setStatusBarBackground('#114598');
			// #endif
			this.fetchServiceEndpoints();
		},
		methods: {
			async fetchServiceEndpoints() {
				this.loading = true;
				this.loadError = false;
				try {
					const resp = await uniGet('https://gateway.zenglingkun.cn/api/v2/service_endpoints');
					if (resp && resp.data && Array.isArray(resp.data)) {
						const rawList = resp.data;
						const list = [];

						for (const item of rawList) {
							const code = Object.keys(item)[0];
							if (!code) continue;

							const endpoints = item[code] || [];
							const name = serviceNameMap[code] || code;

							const savedUrl = uni.getStorageSync('service_source_' + code);

							const endpointLabels = endpoints.map(ep => `${ep.desc}（${ep.url}）`);
							const endpointUrls = endpoints.map(ep => ep.url);

							let selectedIndex = -1;
							if (savedUrl) {
								const foundIndex = endpointUrls.indexOf(savedUrl);
								if (foundIndex >= 0) {
									selectedIndex = foundIndex;
								}
							}

							list.push({
								code: code,
								name: name,
								endpoints: endpoints,
								endpointLabels: endpointLabels,
								endpointUrls: endpointUrls,
								selectedIndex: selectedIndex
							});
						}

						this.serviceList = list;
					} else {
						this.loadError = true;
					}
				} catch (e) {
					console.error('获取服务端点失败:', e);
					this.loadError = true;
				} finally {
					this.loading = false;
				}
			},
			onEndpointChange(event, code) {
				const index = event.detail.value;
				const service = this.serviceList.find(s => s.code === code);
				if (!service) return;

				service.selectedIndex = index;
				const selectedUrl = service.endpointUrls[index];

				uni.setStorageSync('service_source_' + code, selectedUrl);

				uni.showToast({
					title: '已保存',
					icon: 'success',
					duration: 1000
				});
			},
			randomSelectAll() {
				for (const service of this.serviceList) {
					if (service.endpoints.length > 0) {
						service.selectedIndex = 0;
						const selectedUrl = service.endpointUrls[0];
						uni.setStorageSync('service_source_' + service.code, selectedUrl);
					}
				}
				uni.showToast({
					title: '已全部选择首个服务源',
					position:"bottom"
				});
			},
			goNext() {
				// 检查是否所有服务都已选择
				const emptyServices = this.serviceList.filter(s => s.selectedIndex < 0 && s.endpoints.length > 0);
				if (emptyServices.length > 0) {
					uni.showModal({
						title: '提示',
						content: `还有 ${emptyServices.length} 个服务未选择服务源，确定跳转吗？`,
						success: (res) => {
							if (res.confirm) {
								uni.reLaunch({
									url: '/pages/index/index'
								});
							}
						}
					});
				} else {
					uni.reLaunch({
						url: '/pages/index/index'
					});
				}
			}
		}
	};
</script>

<style>
	.primary-button {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		text-align: center;
		line-height: 100rpx;
		background-color: #114598;
		color: #fff;
	}

	.icon {
		font-size: 40rpx;
	}
</style>
