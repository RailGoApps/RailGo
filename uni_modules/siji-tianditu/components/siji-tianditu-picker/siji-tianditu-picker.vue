<template>
	<view>
		<!-- 寮圭獥閬僵 -->
		<view v-if="visible" class="map-modal">
			<view class="modal-content">
				<!-- 地图容器 -->
				<view class="map-container" :class="{ collapsed: isSearchFocused }">
					<siji-tianditu 
						ref="map"
						:map-key="mapKey" 
						:lonlat="currentCenter" 
						:zoom="zoom"
						:show-center-icon="true"
						:show-location-icon="true"
						:auto-get-address="false"
						:on-location="handleLocation"
						:on-loaded="handleMapLoaded"
						:on-end-drag="handleMapDrag">
					</siji-tianditu>
					
					<!-- 顶部按钮组 -->
					<view class="top-buttons">
						<view class="cancel-btn" @tap="handleCancel">
							<text>取消</text>
						</view>
						<view class="complete-btn" @tap="handleConfirm">
							<text>完成</text>
						</view>
					</view>
				</view>
				
				<!-- 搜索框 -->
				<view class="search-container">
					<view class="search-box">
						<image class="search-icon" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTExIDJDNi41ODEgMiAzIDUuNTgxIDMgMTBDMyAxNC40MTkgNi41ODEgMTggMTEgMThDMTIuODkgMTggMTQuNTcxIDE3LjMzNyAxNS44MjggMTYuMjQ1TDIwLjI5MiAyMC43MDlDMjAuNjgzIDIxLjEgMjEuMzE3IDIxLjEgMjEuNzA4IDIwLjcwOUMyMi4wOTggMjAuMzE4IDIyLjA5OCAxOS42ODQgMjEuNzA4IDE5LjI5M0wxNy4yNDQgMTQuODI5QzE4LjMzNiAxMy41NzIgMTkgMTEuODkxIDE5IDEwQzE5IDUuNTgxIDE1LjQxOSAyIDExIDJaTTUgMTBDNSA2LjY4NiA3LjY4NiA0IDExIDRDMTQuMzE0IDQgMTcgNi42ODYgMTcgMTBDMTcgMTMuMzE0IDE0LjMxNCAxNiAxMSAxNkM3LjY4NiAxNiA1IDEzLjMxNCA1IDEwWiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4K" mode="aspectFit"></image>
							<input 
								class="search-input" 
								v-model="searchKeyword"
								placeholder="搜索地点"
								@focus="handleSearchFocus"
								@blur="handleSearchBlur"
								@confirm="handleSearch"
								@input="handleSearchInput"
							/>
						<view v-if="searchKeyword" class="clear-btn" @tap="clearSearch">
							<text>×</text>
						</view>
					</view>
					<view v-if="isSearchFocused || searchKeyword" class="cancel-search-btn" @tap="clearSearch">
						<text>取消</text>
					</view>
				</view>
				
				<!-- 地址列表 -->
				<scroll-view class="address-list" scroll-y>
					<!-- 当前位置 -->
					<view v-if="currentAddress && !searchKeyword" class="address-item current" @tap="selectCurrentAddress">
						<view class="address-content">
							<view class="address-name">{{currentAddress.data.formatted_address}}</view>
							<view class="address-detail">
								<text class="distance">当前位置</text>
						<text class="address-text">{{currentAddress.data.formatted_address}}</text>
							</view>
						</view>
						<view v-if="selectedIndex === -1" class="check-icon">✓</view>
					</view>
					
					<!-- 搜索结果或附近地址 -->
					<view 
						v-for="(item, index) in addressList" 
						:key="index"
						class="address-item"
						:class="{selected: selectedIndex === index}"
						@tap="selectAddress(item, index)">
						<view class="address-content">
							<view class="address-name">{{item.name || item.address}}</view>
							<view class="address-detail">
								<text class="distance" v-if="item.distance">{{formatDistance(item.distance)}}</text>
								<text class="address-text">{{item.address}}</text>
							</view>
						</view>
						<view v-if="selectedIndex === index" class="check-icon">✓</view>
					</view>
					
					<!-- 空状态 -->
					<view v-if="addressList.length === 0 && !loading" class="empty-state">
						<text>{{searchKeyword ? '未找到相关地点' : '附近暂无地点'}}</text>
					</view>
					
					<!-- 加载状态 -->
					<view v-if="loading" class="loading-state">
						<text>加载中...</text>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getAddressByLocation, searchPlace, searchNearby, getDistance } from '../siji-tianditu/mapUtils.js';
	
	export default {
		props: {
			// 地图key
			mapKey: {
				type: String,
				required: true
			},
			center: {
				type: Array,
				default: () => ([116.411794, 39.9068])
			},
			zoom: {
				type: Number,
				default: 18
			},
			onConfirm: {
				type: Function,
				default: () => {}
			},
			// 取消回调
			onCancel: {
				type: Function,
				default: () => {}
			}
		},
		data() {
			return {
				visible: false,
				currentCenter: this.center,
				currentPosition: null,
				currentAddress: '',
				isAutoLocating: false,
				shouldAutoLocate: false,
				searchKeyword: '',
				addressList: [],
				selectedIndex: -1,
				selectedAddress: null,
				loading: false,
				searchTimer: null,
				isProgrammaticMove: false,
				isSearchFocused: false
			}
		},
		methods: {
			// 显示弹窗
			show() {
				this.visible = true;
				this.currentCenter = [...this.center];
				this.shouldAutoLocate = true; // 标记需要自动定位
				this.searchKeyword = '';  // 清空搜索关键词
			},
			
			// 隐藏弹窗
			hide() {
				this.visible = false;
			},
			
			// 地图加载完成
			handleMapLoaded() {
				console.log('地图加载完成');
				if (this.shouldAutoLocate) {
					this.shouldAutoLocate = false;
					this.autoLocation();
				}
			},
			
			// 点击定位按钮
			handleLocation() {
				console.log('点击定位按钮');
				this.autoLocation();
			},
			
			// 获取当前位置（通用方法）			
			_getCurrentLocation() {
				return new Promise((resolve, reject) => {
					uni.getLocation({
						type: 'WGS84',
						success: (res) => {
							const { longitude: lon, latitude: lat } = res;
							resolve({ lon, lat });
						},
						fail: reject
					});
				});
			},
			
			// 获取位置和地址（通用方法）			
			async _getLocationWithAddress() {
				const { lon, lat } = await this._getCurrentLocation();
				const addressData = await getAddressByLocation(lon, lat, this.mapKey);
				return { lon, lat, data: addressData };
			},
			
			// 鑷姩瀹氫綅
			async autoLocation() {
				console.log('开始自动定位');
				this.isAutoLocating = true;
				
				uni.showLoading({ title: '正在定位...' });
				
				try {
					const { lon, lat } = await this._getCurrentLocation();
					
					if (this.$refs.map) {
						this.$refs.map.setCenter(lon, lat);
					}
					
					this.currentPosition = { lon, lat };
					
					// 获取当前位置地址
					const addressData = await this.getCurrentAddress(lon, lat);
					
					// 搜索附近地点
					const keyword = addressData?.addressComponent?.poi || addressData?.addressComponent?.address || '居民区';
				this.searchNearbyPlaces(lon, lat, keyword);
					
					setTimeout(() => {
						this.isAutoLocating = false;
					}, 500);
					
					uni.hideLoading();
					uni.showToast({
						title: '定位成功',
						icon: 'none',
						duration: 1500
					});
				} catch (err) {
					console.error('定位失败', err);
					uni.hideLoading();
					uni.showModal({
						title: '定位失败',
						content: '请检查是否开启了定位权限',
						showCancel: false
					});
					this.isAutoLocating = false;
				}
			},
			
			// 地图拖拽
			async handleMapDrag(lon, lat) {
				console.log('地图拖拽结束', lon, lat);
				if (this.isProgrammaticMove) {
					this.isProgrammaticMove = false;
					return;
				}
				
				if (!this.isAutoLocating) {
					this.currentPosition = { lon, lat };
					// 获取当前位置地址
					const addressData = await this.getCurrentAddress(lon, lat);
					// 拖动地图时清空搜索关键词并搜索附近地点
					this.searchKeyword = '';
					const keyword = addressData?.addressComponent?.poi || addressData?.addressComponent?.address || '居民区';
					this.searchNearbyPlaces(lon, lat, keyword);
				}
			},
			
			// 获取当前地址
			async getCurrentAddress(lon, lat) {
				try {
					const data = await getAddressByLocation(lon, lat, this.mapKey);
					this.currentAddress = { data };
					this.selectedIndex = -1;
					this.selectedAddress = null;
					return data;
				} catch (error) {
					console.error('获取地址失败:', error);
					return null;
				}
			},
			
			// 搜索附近地点
			async searchNearbyPlaces(lon, lat, keyword = '居民区') {
				this.loading = true;
				console.log('搜索关键词:', keyword);
				try {
					const results = await searchNearby(lon, lat, this.mapKey, {
						keyword: keyword,
						radius: 1000,
						count: 20
					});
					// 过滤掉与当前位置地址相同的POI，避免重复显示
					const currentAddr = this.currentAddress?.data?.formatted_address;
					this.addressList = results.filter(item => {
						return !currentAddr || item.address !== currentAddr;
					});
				} catch (error) {
					console.error('搜索附近地点失败:', error);
					this.addressList = [];
				} finally {
					this.loading = false;
				}
			},
			
			// 搜索输入
			handleSearchInput(e) {
				const keyword = e.detail.value;
				if (this.searchTimer) {
					clearTimeout(this.searchTimer);
				}
				
				if (!keyword) {
					// 清空搜索，显示附近地点					
					if (this.currentPosition) {
						this.searchNearbyPlaces(this.currentPosition.lon, this.currentPosition.lat);
					}
					return;
				}
				
				// 延迟搜索
				this.searchTimer = setTimeout(() => {
					this.handleSearch();
				}, 500);
			},
			
			async handleSearch() {
				if (!this.searchKeyword.trim()) return;
				
				// 搜索时清除选中状态
				this.selectedIndex = -1;
				this.selectedAddress = null;
				
				this.loading = true;
				try {
					const options = {};
					if (this.currentPosition) {
						options.lon = this.currentPosition.lon;
						options.lat = this.currentPosition.lat;
						options.radius = 10000;
					}
					
					const results = await searchPlace(this.searchKeyword, this.mapKey, options);
					// 计算每个搜索结果与当前位置的距离
					if (this.currentPosition) {
						results.forEach(item => {
							const distance = getDistance(
								this.currentPosition.lon,
								this.currentPosition.lat,
								parseFloat(item.lon),
								parseFloat(item.lat)
							);
							item.distance = distance;
						});
						// 按距离从近到远排序
						results.sort((a, b) => a.distance - b.distance);
					}

					this.addressList = results;
				} catch (error) {
					console.error('搜索失败:', error);
					this.addressList = [];
				} finally {
					this.loading = false;
				}
			},
			
			// 清空搜索
			clearSearch() {
				this.searchKeyword = '';
				if (this.currentPosition) {
					this.searchNearbyPlaces(this.currentPosition.lon, this.currentPosition.lat);
				}
			},

					
		// 搜索框获得焦点
		handleSearchFocus() {
			this.isSearchFocused = true;
		},
		
		// 搜索框失去焦点
		handleSearchBlur() {
			setTimeout(() => {
				this.isSearchFocused = false;
			}, 200);
		},
			
			// 选择当前地址
			selectCurrentAddress() {
				this.selectedIndex = -1;
				this.selectedAddress = null;
				this.isSearchFocused = false;  // 添加这行
			},
			
			// 选择地址
			selectAddress(item, index) {
				this.selectedIndex = index;
				this.selectedAddress = item;
				
				// 移动地图到选中位置
				const lon = parseFloat(item.lon);
				const lat = parseFloat(item.lat);
				if (this.$refs.map) {
					this.isProgrammaticMove = true;
					this.$refs.map.setCenter(lon, lat);
				}
				// this.currentPosition = { lon, lat };
				this.isSearchFocused = false;  // 添加这行
			},
			
			// 格式化距离
			formatDistance(distance) {
				if (!distance || distance === 0) return '当前位置';
				const dist = parseFloat(distance);
				if (dist < 1000) {
					return `${Math.round(dist)}米`;
				} else {
					return `${(dist / 1000).toFixed(1)}公里`;
				}
			},
			
			handleConfirm() {
				if (!this.currentPosition) {
					uni.showToast({
						title: '请先选择位置',
						icon: 'none'
					});
					return;
				}
				
				let result;
				if (this.selectedAddress) {
					// 选择了列表中的地址
					result = {
						lon: parseFloat(this.selectedAddress.lon),
						lat: parseFloat(this.selectedAddress.lat),
						data: {
							formatted_address: this.selectedAddress.address || this.selectedAddress.name,
							addressComponent: {
								address: this.selectedAddress.address
							}
						}
					};
				} else if (this.currentAddress) {
					// 使用当前位置
					result = {
						lon: this.currentPosition.lon,
						lat: this.currentPosition.lat,
						data: this.currentAddress.data
					};
				} else {
					uni.showToast({
						title: '地址信息加载中',
						icon: 'none'
					});
					return;
				}
				
				this.onConfirm && this.onConfirm(result);
				this.hide();
			},
			
			// 取消选择
			handleCancel() {
				this.searchKeyword = '';  // 清空搜索关键词
				this.onCancel && this.onCancel();
				this.hide();
			},
			
			// 直接获取位置（不显示弹窗）			
			async getLocationDirectly() {
				uni.showLoading({ title: '正在定位...' });
				
				try {
					const result = await this._getLocationWithAddress();
					console.log('获取位置成功:', result);
					
					uni.hideLoading();
					uni.showToast({
						title: '获取成功',
						icon: 'success'
					});
					
					return result;
				} catch (error) {
					console.error('获取位置失败:', error);
					uni.hideLoading();
					
					const isLocationError = error.errMsg && error.errMsg.includes('getLocation');
					uni.showModal({
						title: isLocationError ? '定位失败' : '获取地址失败',
						content: isLocationError ? '请检查是否开启了定位权限' : '无法获取地址信息，请重试',
						showCancel: false
					});
					
					throw error;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.map-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #ffffff;
		z-index: 9999;
		
		.modal-content {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			
			.map-container {
				height: 50%;
				position: relative;
				overflow: hidden;
				transition: height 0.3s ease;
				
				&.collapsed {
					height: 25%;
				}
							
				.cancel-btn {
					// background: rgba(17, 17, 17, 0.1);
					color: #666;
					padding: 10rpx 32rpx;
					border-radius: 15rpx;
					font-size: 28rpx;
					box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
				}
				
				.complete-btn {
					background: #007aff;
					color: #ffffff;
					padding: 10rpx 32rpx;
					border-radius: 15rpx;
					font-size: 28rpx;
					box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
				}
				.top-buttons {
					position: absolute;
					top: 55rpx;
					left: 24rpx;
					right: 24rpx;
					z-index: 1000;
					display: flex;
					justify-content: space-between;
					align-items: center;
					font-size: 28rpx;
					border-radius: 15rpx;
				}
			}
			
			.search-container {
				padding: 24rpx 32rpx;
				background: #ffffff;
				border-bottom: 1px solid #f0f0f0;
				display: flex;
				align-items: center;
				gap: 16rpx;
				
				.search-box {
					flex: 1;
					display: flex;
					align-items: center;
					background: #f5f5f5;
					border-radius: 12rpx;
					padding: 0 24rpx;
					height: 72rpx;
					
					.search-icon {
						width: 36rpx;
						height: 36rpx;
						margin-right: 16rpx;
					}
					
					.search-input {
						flex: 1;
						font-size: 28rpx;
						color: #333;
						height: 100%;
					}
					
					.clear-btn {
						width: 40rpx;
						// height: 40rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 42rpx;
						color: #999;
					}
				}
				.cancel-search-btn {
					flex-shrink: 0;
					padding: 0 8rpx;
					font-size: 28rpx;
					color: #007aff;
				}
			}
			
			.address-list {
				flex: 1;
				background: #ffffff;
				overflow-y: auto;
				height: 0;
				
				.address-item {
					padding: 24rpx 32rpx;
					border-bottom: 1px solid #f5f5f5;
					display: flex;
					align-items: center;
					position: relative;
					transition: background 0.2s;
					
					&.current {
						background: #f8f9fa;
					}
					
					&.selected {
						background: #f0f7ff;
					}
					
					.address-content {
						flex: 1;
						display: flex;
						flex-direction: column;
						
						.address-name {
							font-size: 30rpx;
							color: #333;
							font-weight: 500;
							margin-bottom: 8rpx;
							line-height: 1.4;
						}
						
						.address-detail {
							font-size: 24rpx;
							color: #999;
							line-height: 1.5;
							
							.distance {
								display: inline;
								margin-right: 8rpx;
							}
							
							.address-text {
								display: inline;
								word-break: break-all;
							}
						}
					}
					
					.address-main {
						flex: 1;
						margin-right: 16rpx;
						
						.address-name {
							font-size: 30rpx;
							color: #333;
							font-weight: 500;
							display: block;
							margin-bottom: 8rpx;
							line-height: 1.4;
						}
					}
					
					.check-icon {
						width: 40rpx;
						height: 40rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 32rpx;
						color: #007aff;
						font-weight: bold;
						margin-left: 16rpx;
						flex-shrink: 0;
					}
				}
				
				.empty-state {
					padding: 120rpx 32rpx;
					text-align: center;
					
					text {
						font-size: 28rpx;
						color: #999;
					}
				}
				
				.loading-state {
					padding: 60rpx 32rpx;
					text-align: center;
					
					text {
						font-size: 28rpx;
						color: #999;
					}
				}
			}
		}
	}
</style>
