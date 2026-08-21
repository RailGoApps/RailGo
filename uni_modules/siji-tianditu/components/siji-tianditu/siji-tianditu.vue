<template>
	<view class="siji-tianditu-wrapper">
		<!-- 地图展示 -->
		<view :id="mapId" :config="config" :change:config="SijiTianditu.init" :call="option" :change:call="SijiTianditu.call"
			class="siji-tianditu" />
		<!-- 中心图标 -->
		<image v-if="showCenterIcon" :src="centerIcon||defCenterIcon" class="siji-center-icon" />
		<!-- 定位图标 -->
		<view v-if="showLocationIcon" class="siji-location-icon" @click="onLocationClick">
			<image :src="locationIcon" class="icon" />
		</view>
	</view>
</template>

<script>
	import centerIcon from '../../static/siji-tianditu/center.png';
	import locationIcon from '../../static/siji-tianditu/location.png';
	import * as mapUtils from './mapUtils.js';

	export default {
		props: {
			// 地图key
			mapKey: {
				type: String,
				default: ''
			},
			// 经纬度
			lonlat: {
				type: Array,
				default: () => ([116.411794, 39.9068]),
			},
			// 缩放
			zoom: {
				type: Number,
				default: 16,
			},
			// 是否显示中心定位图标
			showCenterIcon: {
				type: Boolean,
				default: false,
			},
			// 中心点图标
			centerIcon: {
				type: String,
				default: "",
			},
			// 是否显示用户定位图标
			showLocationIcon: {
				type: Boolean,
				default: false,
			},
			// 点击地图定位按钮回调
			onLocation: {
				type: Function,
				default: () => {}
			},
			// 地图加载完成回调
			onLoaded: {
				type: Function,
				default: () => {}
			},
			// 地图拖拽结束回调
			onEndDrag: {
				type: Function,
				default: () => {}
			},
			// 地址变化回调
			onAddressChange: {
				type: Function,
				default: () => {}
			},
			// 是否自动获取地址
			autoGetAddress: {
				type: Boolean,
				default: false
			},
		},
		data() {
			return {
				mapId: this.genId(),
				option: {},
				config: {},
				event: [],
				timer: null,
				defCenterIcon: centerIcon,
				locationIcon: locationIcon,
			}
		},
		mounted() {
			this.config = {
				mapId: this.mapId,
				mapKey: this.mapKey,
				lonlat: this.lonlat,
				zoom: this.zoom,
			};
		},
		methods: {
			// 生成唯一ID
			genId() {
				return Date.now() + Math.random().toString(36).substr(2, 9);
			},
			// 调用渲染层方法
			call() {
				if (this.timer) return;
				this.timer = setInterval(() => {
					if (this.event.length) {
						this.option = this.event.shift();
					} else {
						clearInterval(this.timer);
						this.timer = null;
					}
				}, 10);
			},
			// 添加事件队列（H5 / App 统一走 renderjs 数据监听机制）
			addEvent(name, data) {
				const option = {
					id: this.genId(),
					name: `_${name}`,
					data
				};
				this.event.push(option);
				this.call();
			},
			// 设置中心位置
			setCenter(lon, lat, zoom) {
				this.addEvent("setCenter", { lon, lat, zoom });
			},
			// 绘制多条折线（路线），segments: [{ points: [[lng,lat]...], style: { color, width, opacity } }]
			drawRoute(segments) {
				this.addEvent("drawRoute", { segments });
			},
			// 绘制多个圆点标记，markers: [{ lng, lat, name, fill, radius, stroke, strokeWidth }]
			drawMarkers(markers) {
				this.addEvent("drawMarkers", { markers });
			},
			// 绘制纯文字标签（无圆点），labels: [{ lng, lat, text, color }]
			drawLabels(labels) {
				this.addEvent("drawLabels", { labels });
			},
			// 清除所有覆盖物（折线 + 标记）
			clearAll() {
				this.addEvent("clearAll", {});
			},
			// 地图加载完成
			onMapLoad(data) {
				this.onLoaded && this.onLoaded(data);
			},
			// 点击标记点回调（由渲染层 callMethod 触发）
			onMarkerClick(data) {
				if (data && data.name) {
					uni.showToast({ title: data.name, icon: 'none', duration: 2000 });
				}
			},
			// 点击定位按钮
			onLocationClick() {
				this.onLocation && this.onLocation();
			},
			// 地图拖拽结束
			onMapEndDrag(pos) {
				this.onEndDrag && this.onEndDrag(pos.lon, pos.lat);
				// 如果开启自动获取地址
				if (this.autoGetAddress) {
					this.getAddress(pos.lon, pos.lat);
				}
			},
			// 获取地址（逆地理编码）
			async getAddress(lon, lat) {
				try {
					const data = await mapUtils.getAddressByLocation(lon, lat, this.mapKey);
					if (this.onAddressChange) {
						this.onAddressChange({ data });
					}
					return data;
				} catch (error) {
					console.error('逆地理编码失败:', error);
					if (this.onAddressChange) {
						this.onAddressChange({ data: '地址获取失败', error });
					}
					return '地址获取失败';
				}
			},
		},
	}
</script>

<script module="SijiTianditu" lang="renderjs">
	const TDT_API = "https://api.tianditu.gov.cn/api?v=4.0&tk=";

	export default {
		data() {
			return {
				_config: {},
				_mapInstance: {},
				_event: {},
				_lineOverlays: [],
				_markerOverlays: [],
				_labelOverlays: [],
			};
		},
		methods: {
			// 初始化
			init(newValue, oldValue, ownerInstance, instance) {
				if (!Object.keys(newValue).length) return;
				this._config = newValue;
				
				if (typeof window.T === 'object') {
					this._createMap();
				} else {
					const script = document.createElement('script');
					script.src = TDT_API + newValue.mapKey;
					script.onload = this._createMap.bind(this);
					document.head.appendChild(script);
				}
			},
			// 通过监听call来调用渲染层方法
			call(newValue, oldValue, ownerInstance, instance) {
				if (this[newValue.name] && typeof this[newValue.name] === "function") {
					this[newValue.name](newValue.data);
				}
			},
			// 创建地图
			_createMap() {
				try {
					this._mapInstance = new T.Map(this._config.mapId);
					this._mapInstance.addEventListener('load', () => {
						this.$ownerInstance.callMethod('onMapLoad', this._config);
					});
					setTimeout(() => {
						this._mapInstance.centerAndZoom(
							new T.LngLat(this._config.lonlat[0], this._config.lonlat[1]), 
							this._config.zoom
						);
					}, 100);
					this._bindEvent();
				} catch (err) {
					console.error('地图创建失败:', err);
				}
			},
			// 绑定事件
			_bindEvent() {
				try {
					this._event = {};
					// 绑定拖拽结束事件（惯性结束后回调）
					let checkTimer;
					let lastCenter;
					this._event.moveend = (type, target) => {
						if (checkTimer) clearInterval(checkTimer);
						lastCenter = this._mapInstance.getCenter();
						// 每隔一段时间检查地图中心位置是否改变
						checkTimer = setInterval(() => {
							const currentCenter = this._mapInstance.getCenter();
							if (currentCenter.lng === lastCenter.lng && currentCenter.lat === lastCenter.lat) {
								clearInterval(checkTimer);
								this.$ownerInstance.callMethod('onMapEndDrag', {
									lon: currentCenter.getLng(),
									lat: currentCenter.getLat()
								});
							} else {
								lastCenter = currentCenter;
							}
						}, 100);
					};
					this._mapInstance.addEventListener('moveend', this._event.moveend.bind(this));
				} catch (err) {
					console.error('事件绑定失败:', err);
				}
			},
			// 设置中心点
			_setCenter(data) {
				try {
					this._mapInstance.panTo(
						new T.LngLat(Number(data.lon), Number(data.lat)), 
						data.zoom || this._mapInstance.getZoom()
					);
				} catch (err) {
					console.error('设置中心点失败:', err);
				}
			},
			// 绘制多条折线（先移除旧折线，不影响标记点）
			_drawRoute(data) {
				if (!this._mapInstance) return;
				try {
					(this._lineOverlays || []).forEach(ov => this._mapInstance.removeOverLay(ov));
					this._lineOverlays = [];
					const segments = data.segments || [];
					segments.forEach(seg => {
						const pts = (seg.points || []).map(p => new T.LngLat(Number(p[0]), Number(p[1])));
						if (pts.length < 2) return;
						const style = seg.style || {};
						// 绘制可见线段
						const polyline = new T.Polyline(pts, {
							color: style.color || '#114598',
							weight: style.width || 4,
							opacity: style.opacity !== undefined ? style.opacity : 1
						});
						this._mapInstance.addOverLay(polyline);
						this._lineOverlays.push(polyline);
						// 有名称时，叠加一条更宽的透明线用于接收点击
						if (seg.name) {
							const hitArea = new T.Polyline(pts, {
								color: style.color || '#114598',
								weight: 20,
								opacity: 0.01
							});
							hitArea.addEventListener('click', () => {
								this.$ownerInstance.callMethod('onLineClick', { name: seg.name });
							});
							this._mapInstance.addOverLay(hitArea);
							this._lineOverlays.push(hitArea);
						}
					});
				} catch (err) {
					console.error('绘制路线失败:', err);
				}
			},
			// 绘制多个圆点标记（先移除旧标记，不影响折线）
			_drawMarkers(data) {
				if (!this._mapInstance) return;
				try {
					(this._markerOverlays || []).forEach(ov => this._mapInstance.removeOverLay(ov));
					this._markerOverlays = [];
					const markers = data.markers || [];
					markers.forEach(m => {
						const lnglat = new T.LngLat(Number(m.lng), Number(m.lat));
						const icon = this._makeCircleIcon(m);
						const marker = new T.Marker(lnglat, { icon });
						if (m.name) {
							marker.addEventListener('click', () => {
								this.$ownerInstance.callMethod('onMarkerClick', { name: m.name });
							});
							// 添加文字标签（居中显示在点上方）
							const label = new T.Label({
								text: `<b style="font-size:12px;color:#333;background:rgba(255,255,255,0.9);padding:1px 5px;border-radius:3px;white-space:nowrap;">${m.name}</b>`,
								position: lnglat,
								offset: new T.Point(-(m.name.length * 7), -(m.radius || 10) - 16)
							});
							this._mapInstance.addOverLay(label);
							this._markerOverlays.push(label);
						}
						this._mapInstance.addOverLay(marker);
						this._markerOverlays.push(marker);
					});
				} catch (err) {
					console.error('绘制标记点失败:', err);
				}
			},
			// 用 canvas 生成圆形图标
			_makeCircleIcon(m) {
				const radius = (m.radius || 10) + 2;
				const size = radius * 2 + 4;
				const canvas = document.createElement('canvas');
				canvas.width = size;
				canvas.height = size;
				const ctx = canvas.getContext('2d');
				const cx = size / 2;
				const cy = size / 2;
				ctx.beginPath();
				ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
				ctx.fillStyle = m.fill || '#114598';
				ctx.fill();
				ctx.lineWidth = m.strokeWidth || 2;
				ctx.strokeStyle = m.stroke || '#ffffff';
				ctx.stroke();
				// 天地图 v4 的 T.Icon 需用对象参数形式，否则图标 DOM 创建失败
				return new T.Icon({
					iconUrl: canvas.toDataURL('image/png'),
					iconSize: new T.Point(size, size),
					iconAnchor: new T.Point(cx, cy)
				});
			},
			// 绘制纯文字标签（不影响其他覆盖物）
			_drawLabels(data) {
				if (!this._mapInstance) return;
				try {
					(this._labelOverlays || []).forEach(ov => this._mapInstance.removeOverLay(ov));
					this._labelOverlays = [];
					const labels = data.labels || [];
					labels.forEach(lb => {
						const lnglat = new T.LngLat(Number(lb.lng), Number(lb.lat));
						const color = lb.color || '#333';
						const label = new T.Label({
							text: `<b style="font-size:13px;color:${color};background:rgba(255,255,255,0.95);padding:2px 8px;border-radius:4px;white-space:nowrap;border:1px solid ${color};">${lb.text}</b>`,
							position: lnglat,
							offset: new T.Point(-40, -14)
						});
						this._mapInstance.addOverLay(label);
						this._labelOverlays.push(label);
					});
				} catch (err) {
					console.error('绘制标签失败:', err);
				}
			},
			// 清除所有覆盖物
			_clearAll() {
				if (!this._mapInstance) return;
				try {
					(this._lineOverlays || []).forEach(ov => this._mapInstance.removeOverLay(ov));
					(this._markerOverlays || []).forEach(ov => this._mapInstance.removeOverLay(ov));
					(this._labelOverlays || []).forEach(ov => this._mapInstance.removeOverLay(ov));
					this._lineOverlays = [];
					this._markerOverlays = [];
					this._labelOverlays = [];
				} catch (err) {
					console.error('清除覆盖物失败:', err);
				}
			},
		},
	};
</script>

<style lang="scss" scoped>
	.siji-tianditu-wrapper {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden;
		background: #f0f0f0;

		.siji-tianditu {
			width: 100%;
			height: 100%;
		}

		.siji-center-icon {
			position: absolute;
			z-index: 401;
			left: 50%;
			top: 50%;
			transform: translateX(-50%) translateY(-100%);
			width: 64rpx;
			height: 64rpx;
		}

		.siji-location-icon {
			position: absolute;
			z-index: 401;
			right: 24rpx;
			bottom: 24rpx;
			width: 72rpx;
			height: 72rpx;
			background: #ffffff;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 0 8rpx rgba(0, 0, 0, .15);

			.icon {
				width: 44rpx;
				height: 44rpx;
			}
		}
	}
</style>
