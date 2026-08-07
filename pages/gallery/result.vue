<template>
	<view class="ux-bg-grey5" style="min-height: 100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<view class="ux-pl ux-pr ux-pt">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">{{ keyword }}</text>
		</view>

		<!-- 加载中 -->
		<view v-if="loading" class="ux-text-center ux-padding ux-mt">
			<text class="ux-color-grey2">搜索中...</text>
		</view>

		<!-- 无结果 -->
		<view v-if="!loading && searched && modelList.length === 0 && !loadError" class="ux-text-center ux-padding ux-mt">
			<text class="ux-h6 ux-color-grey2">未找到相关车型</text>
		</view>

		<!-- 错误提示 -->
		<view v-if="loadError" class="ux-pl ux-pr">
			<view class="ux-bg-white ux-border-radius-large ux-padding ux-text-center ux-mt">
				<text class="ux-text-small" style="color: #e74c3c;">搜索失败，请检查网络后重试</text>
				<view class="ux-mt-small">
					<text class="ux-text-small" style="color: #114598; text-decoration: underline;" @click="doSearch">点击重试</text>
				</view>
			</view>
		</view>

		<!-- 结果数 -->
		<view v-if="!loading && searched && modelList.length > 0" class="ux-pl ux-pr ux-pb-small">
			<text class="ux-text-small ux-color-grey2">共找到 {{ modelList.length }} 个车型</text>
		</view>

		<!-- 瀑布流结果 -->
		<view v-if="modelList.length > 0 && !loading" class="ux-pl ux-pr" style="padding-bottom: 40rpx;">
			<custom-waterfalls-flow
				ref="waterfallsFlowRef"
				:value="modelList"
				:column="2"
				:columnSpace="1.5"
				:seat="2"
				@wapperClick="onModelClick"
				@imageClick="onModelClick"
			>
				<!-- #ifdef MP-WEIXIN -->
				<view class="item" v-for="(item, index) in modelList" :key="index" slot="slot{{index}}">
					<view class="item-title">{{ item.model_name }}</view>
					<view class="item-desc">共 {{ item.total_photos }} 张照片</view>
				</view>
				<!-- #endif -->
				<!-- #ifndef MP-WEIXIN -->
				<template v-slot:default="item">
					<view class="item">
						<view class="item-title" style="margin-left: 10rpx;">{{ item.model_name }}</view>
						<view class="item-desc" style="margin-left: 10rpx;">共 {{ item.total_photos }} 张照片</view>
					</view>
				</template>
				<!-- #endif -->
			</custom-waterfalls-flow>
		</view>
	</view>
</template>

<script>
	import { uniGet } from "@/scripts/req";
	import customWaterfallsFlow from "@/uni_modules/custom-waterfalls-flow/components/custom-waterfalls-flow/custom-waterfalls-flow.vue";

	const API_BASE = 'https://train.idcmoss.cn/api';

	export default {
		components: {
			customWaterfallsFlow
		},
		data() {
			return {
				keyword: '',
				loading: false,
				searched: false,
				loadError: false,
				modelList: []
			};
		},
		onLoad(options) {
			if (options.keyword) {
				this.keyword = options.keyword;
			}
		},
		onShow() {
			// #ifdef APP-PLUS
			plus.navigator.setStatusBarBackground('#114598');
			// #endif
			if (this.keyword && !this.searched && !this.loading) {
				this.doSearch();
			}
		},
		methods: {
			back() {
				uni.navigateBack();
			},
			async doSearch() {
				const q = this.keyword.trim();
				if (!q) return;

				this.loading = true;
				this.loadError = false;
				this.searched = true;

				try {
					const resp = await uniGet(`${API_BASE}/model_search.php`, {
						params: {
							q: q,
							page: 1,
							per_page: 100
						}
					});

					if (resp && resp.data && resp.data.success && Array.isArray(resp.data.models)) {
						this.modelList = resp.data.models.map(model => {
							const firstPhoto = model.reference_photos && model.reference_photos.length > 0
								? model.reference_photos[0]
								: null;
							return {
								image: firstPhoto ? firstPhoto.thumbnail_url : '',
								model_name: model.model_name || model.model_code,
								model_code: model.model_code,
								model_type: model.model_type,
								manufacturer: model.manufacturer,
								total_photos: model.total_photos || 0,
								description: model.description || '',
								id: model.id
							};
						});
					} else {
						this.modelList = [];
					}
				} catch (e) {
					console.error('车型搜索失败:', e);
					this.loadError = true;
					this.modelList = [];
				} finally {
					this.loading = false;
				}
			},
			onModelClick(item) {
				// 保存车型信息到 storage，供 gallery 页面读取
				uni.setStorageSync('gallery_model_info', {
					model_code: item.model_code,
					model_name: item.model_name,
					description: item.description,
					manufacturer: item.manufacturer,
					model_type: item.model_type
				});
				uni.navigateTo({
					url: '/pages/gallery/gallery?code=' + encodeURIComponent(item.model_code)
				});
			}
		}
	};
</script>

<style lang="scss">
	/* 瀑布流单项内容 */
	.item {
		padding: 10rpx 10rpx 20rpx;
		.item-title {
			line-height: 48rpx;
			font-size: 26rpx;
			font-weight: 600;
			color: #222;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.item-desc {
			font-size: 22rpx;
			color: #888;
		}
	}
</style>
