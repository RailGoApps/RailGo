<template>
	<view class="ux-bg-grey5" style="min-height: 100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>
		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">服务源选择</text>
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
		</view>
	</view>
</template>

<script>
	import { uniGet } from "@/scripts/req";

	// 服务代码 → 中文名称映射
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
			back() {
				uni.navigateBack();
			},
			async fetchServiceEndpoints() {
				this.loading = true;
				this.loadError = false;
				try {
					const resp = await uniGet('https://gateway.zenglingkun.cn/api/v2/service_endpoints');
					if (resp && resp.data && Array.isArray(resp.data)) {
						const rawList = resp.data;
						const list = [];

						for (const item of rawList) {
							// 每个 item 格式: { "train": [ { desc, url }, ... ] }
							const code = Object.keys(item)[0];
							if (!code) continue;

							const endpoints = item[code] || [];
							const name = serviceNameMap[code] || code;

							// 获取已保存的选择
							const savedUrl = uni.getStorageSync('service_source_' + code);

							// 构建 picker 的 labels 和对应的 URLs
							const endpointLabels = endpoints.map(ep => `${ep.desc}（${ep.url}）`);
							const endpointUrls = endpoints.map(ep => ep.url);

							// 查找已保存的选择索引
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

				// 更新选中状态
				service.selectedIndex = index;
				const selectedUrl = service.endpointUrls[index];

				// 保存到 uni storage
				uni.setStorageSync('service_source_' + code, selectedUrl);

				uni.showToast({
					title: '已保存',
					icon: 'success',
					duration: 1000
				});
			}
		}
	};
</script>

<style>
</style>
