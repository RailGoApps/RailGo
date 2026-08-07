<template>
	<view class="ux-bg-grey5" style="min-height: 100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<view class="ux-pl ux-pr ux-pt">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">{{ modelName }}</text>
			<view class="ux-mt-small ux-mb-small" v-if="modelDesc">
				<text class="ux-text-small ux-color-grey3">{{ modelDesc }}</text>
			</view>
		</view>

		<!-- 筛选栏 -->
		<view v-if="filterOptions.length > 0" class="ux-pl ux-pr">
			<view class="ux-flex ux-row" style="gap: 12rpx;">
				<view
					v-for="(opt, idx) in filterOptions"
					:key="opt.key"
					class="ux-padding-small"
					:class="currentFilter === opt.key ? 'filter-tab-active' : 'filter-tab'"
					@click="switchFilter(opt.key)"
				>
					<text class="ux-text-small" :class="currentFilter === opt.key ? 'ux-color-white' : 'ux-color-grey2'">
						{{ filterLabel(opt.key) }}（{{ opt.count }}）
					</text>
				</view>
			</view>
		</view>

		<!-- 加载中（首次/切换筛选） -->
		<view v-if="loading" class="ux-text-center ux-padding ux-mt">
			<text class="ux-color-grey2">加载中...</text>
		</view>

		<!-- 无结果 -->
		<view v-if="!loading && photoList.length === 0 && !loadError" class="ux-text-center ux-padding ux-mt">
			<text class="ux-h6 ux-color-grey2">暂无照片</text>
		</view>

		<!-- 错误提示 -->
		<view v-if="loadError" class="ux-pl ux-pr">
			<view class="ux-bg-white ux-border-radius-large ux-padding ux-text-center ux-mt">
				<text class="ux-text-small" style="color: #e74c3c;">加载失败，请检查网络后重试</text>
				<view class="ux-mt-small">
					<text class="ux-text-small" style="color: #114598; text-decoration: underline;" @click="resetAndFetch">点击重试</text>
				</view>
			</view>
		</view>

		<!-- 瀑布流结果 -->
		<view v-if="photoList.length > 0 && !loading" class="ux-pl ux-pr" style="padding-bottom: 40rpx; margin-top: 35rpx">
			<custom-waterfalls-flow
				ref="waterfallsFlowRef"
				:value="photoList"
				:column="2"
				:columnSpace="1.5"
				:seat="2"
				@wapperClick="onPhotoClick"
				@imageClick="onPhotoClick"
			>
				<!-- #ifdef MP-WEIXIN -->
				<view class="item" v-for="(item, index) in photoList" :key="index" slot="slot{{index}}">
					<view class="photo-title">{{ item.title }}</view>
					<view class="photo-author">
						<image style="margin-left: 10rpx;" class="author-avatar" :src="item.author_avatar" mode="aspectFill"></image>
						<text style="margin-left: 10rpx;" class="author-name">{{ item.author_name }}</text>
					</view>
				</view>
				<!-- #endif -->
				<!-- #ifndef MP-WEIXIN -->
				<template v-slot:default="item">
					<view class="item">
						<view class="photo-title">{{ item.title }}</view>
						<view class="photo-author">
							<image class="author-avatar" :src="item.author_avatar" mode="aspectFill"></image>
							<text class="author-name">{{ item.author_name }}</text>
						</view>
					</view>
				</template>
				<!-- #endif -->
			</custom-waterfalls-flow>

			<!-- 加载更多提示 -->
			<view v-if="loadingMore" class="ux-text-center ux-padding ux-mt-small">
				<text class="ux-color-grey2">加载更多...</text>
			</view>

			<!-- 已全部加载 -->
			<view v-if="!hasMore && photoList.length > 0 && !loadingMore" class="ux-text-center ux-padding ux-mt-small">
				<text class="ux-color-grey2 ux-text-small">—— 已经到底了 ——</text>
			</view>
		</view>

		<!-- 图片预览遮罩 -->
		<view class="preview-overlay" v-if="previewPhoto" @click="closePreview">
			<view class="preview-container" @click.stop>
				<image
					class="preview-image"
					:src="previewFullUrl"
					mode="widthFix"
					@click="closePreview"
				></image>
				<view class="preview-info">
					<text class="preview-title">{{ previewPhoto.title }}</text>
					<text class="preview-author">{{ previewPhoto.author_name }}</text>
				</view>
				<view class="preview-close" @click="closePreview">
					<text class="icon" style="color: #fff; font-size: 48rpx;">&#xe5cd;</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { uniGet } from "@/scripts/req";
	import customWaterfallsFlow from "@/uni_modules/custom-waterfalls-flow/components/custom-waterfalls-flow/custom-waterfalls-flow.vue";

	const API_BASE = 'https://train.idcmoss.cn/api';

	const FILTER_LABELS = {
		all: '全部',
		interior: '车厢内部',
		exterior: '车厢外部'
	};

	export default {
		components: {
			customWaterfallsFlow
		},
		data() {
			return {
				modelCode: '',
				modelName: '',
				modelDesc: '',
				loading: false,
				loadingMore: false,
				loadError: false,
				photoList: [],
				filterOptions: [],
				currentFilter: 'all',
				page: 1,
				hasMore: true,
				searched: false,
				previewPhoto: null,
				previewFullUrl: ''
			};
		},
		onLoad(options) {
			if (options.code) {
				this.modelCode = options.code;
			}
			// 从 storage 读取车型信息
			const modelInfo = uni.getStorageSync('gallery_model_info');
			if (modelInfo && modelInfo.model_code === this.modelCode) {
				this.modelName = modelInfo.model_name || modelInfo.model_code;
				this.modelDesc = modelInfo.description || modelInfo.manufacturer || '';
			} else {
				this.modelName = this.modelCode;
			}
		},
		onShow() {
			// #ifdef APP-PLUS
			plus.navigator.setStatusBarBackground('#114598');
			// #endif
			if (this.modelCode && !this.searched && !this.loading) {
				this.resetAndFetch();
			}
		},
		onReachBottom() {
			if (this.hasMore && !this.loadingMore && !this.loading) {
				this.loadMore();
			}
		},
		methods: {
			back() {
				uni.navigateBack();
			},
			filterLabel(key) {
				return FILTER_LABELS[key] || key;
			},
			async switchFilter(key) {
				if (this.currentFilter === key) return;
				this.currentFilter = key;
				this.resetAndFetch();
			},
			resetAndFetch() {
				this.page = 1;
				this.hasMore = true;
				this.photoList = [];
				this.fetchPhotos(true);
			},
			async fetchPhotos(reset = false) {
				if (!this.modelCode) return;

				if (reset) {
					this.loading = true;
				} else {
					this.loadingMore = true;
				}
				this.loadError = false;
				this.searched = true;

				try {
					const resp = await uniGet(`${API_BASE}/model_photos.php`, {
						params: {
							model: this.modelCode,
							filter: this.currentFilter,
							page: this.page,
							per_page: 16
						}
					});

					if (resp && resp.data && resp.data.success) {
						this.filterOptions = resp.data.filter_options || [];

						const photos = Array.isArray(resp.data.photos) ? resp.data.photos : [];
						const mapped = photos.map(photo => ({
							image: photo.thumbnail_url || '',
							title: photo.title || '',
							author_name: photo.author ? photo.author.nickname : '',
							author_avatar: photo.author ? (photo.author.avatar || '').replace('ctphotos.idcmoss.cn', 'train.idcmoss.cn') : '',
							photo_id: photo.photo_id,
							full_image: photo.image_url || photo.watermarked_url || '',
							share_url: photo.share_url || ''
						}));

						if (reset) {
							this.photoList = mapped;
						} else {
							this.photoList = this.photoList.concat(mapped);
						}

						// 如果返回数量不足 15，说明已全部加载完毕
						if (photos.length < 15) {
							this.hasMore = false;
						}
					} else {
						if (reset) {
							this.photoList = [];
							this.filterOptions = [];
						}
						// 接口失败也视为没有更多了
						this.hasMore = false;
					}
				} catch (e) {
					console.error('获取照片失败:', e);
					if (reset) {
						this.loadError = true;
						this.photoList = [];
					}
					this.hasMore = false;
				} finally {
					this.loading = false;
					this.loadingMore = false;
				}
			},
			async loadMore() {
				if (this.loadingMore || !this.hasMore) return;
				this.page++;
				await this.fetchPhotos(false);
			},
			onPhotoClick(item) {
				// 显示图片预览，加载完整 image_url
				this.previewPhoto = item;
				this.previewFullUrl = item.full_image || item.image;
			},
			closePreview() {
				this.previewPhoto = null;
				this.previewFullUrl = '';
			}
		}
	};
</script>

<style lang="scss">
	.filter-tab {
		background-color: #f0f0f0;
		border-radius: 8rpx;
		border: 1rpx solid #ddd;
	}
	.filter-tab-active {
		background-color: #114598;
		border-radius: 8rpx;
		border: 1rpx solid #114598;
	}

	/* 瀑布流单项内容 */
	.item {
		padding: 10rpx 10rpx 20rpx;
		.photo-title {
			line-height: 44rpx;
			font-size: 24rpx;
			font-weight: 600;
			color: #222;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.photo-author {
			display: flex;
			align-items: center;
			margin-top: 8rpx;
			.author-avatar {
				width: 36rpx;
				height: 36rpx;
				border-radius: 50%;
				flex-shrink: 0;
				background-color: #eee;
			}
			.author-name {
				margin-left: 8rpx;
				font-size: 20rpx;
				color: #999;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}

	/* 图片预览遮罩 */
	.preview-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.9);
		z-index: 9999;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.preview-container {
		width: 90%;
		max-height: 80vh;
		position: relative;
	}
	.preview-image {
		width: 100%;
		border-radius: 12rpx;
	}
	.preview-info {
		margin-top: 16rpx;
		text-align: center;
		.preview-title {
			font-size: 28rpx;
			color: #fff;
			font-weight: 500;
			display: block;
		}
		.preview-author {
			font-size: 24rpx;
			color: #ccc;
			margin-top: 6rpx;
			display: block;
		}
	}
	.preview-close {
		position: absolute;
		top: -80rpx;
		right: 0;
		padding: 10rpx;
	}
</style>
