<template>
	<view>
		<!-- #ifdef APP || H5 -->
		<view id="zMap" class="map-container" :style="{ height: mapHeightStr }" :map-center-location="mapCenterLocation"
			:change:map-center-location="ol.handleMapCenterLocation" :init-config="initConfig"
			:change:init-config="ol.initMap" :center-icon-config="centerIconConfig"
			:change:center-icon-config="ol.handleCenterIcon" :batch-icon-config="batchIconConfig"
			:change:batch-icon-config="ol.handleDrawBatchIcon" :circle-list-config="circleListConfig"
			:change:circle-list-config="ol.handleDrawCircle" :polygon-path-config="polygonPathConfig"
			:change:polygon-path-config="ol.handlePolygonPath" :line-path-config="linePathConfig"
			:change:line-path-config="ol.handleLinePath" :geo-json-config="geoJsonConfig"
			:change:geo-json-config="ol.handleGeoJsonData" :hot-map-config="hotMapConfig"
			:change:hot-map-config="ol.handleHotMapData" :zoom-to-extent-config="zoomToExtentConfig"
			:change:zoom-to-extent-config="ol.handleZoomToExtent"></view>
		<!-- #endif -->
		<!-- #ifdef MP -->
		<view class="unsupported">
			<text class="unsupported-text">当前平台暂不支持地图组件，请在 App 或 H5 端使用</text>
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
	/**
	 * ZMap - 基于 OpenLayers 的 uni-app 地图组件
	 * @description 支持多端（H5、App）的地图组件，提供图标绘制、路径绘制、热力图等功能
	 * @author DescartesZ
	 * @version 2.0.0
	 * @date 2026.03.30
	 */

	/** 严格空值检查 */
	const isEmptyStrict = (obj) => {
		if (obj === null || obj === undefined) return true;
		if (typeof obj === 'string') return obj.trim() === '';
		if (typeof obj === 'object') return Object.keys(obj).length === 0;
		return false;
	};

	export default {
		name: 'ZMap',

		props: {
			/**
			 * 地图高度
			 * @type {Number|String}
			 */
			mapHeight: {
				type: [Number, String],
				default: '100vh'
			},
			/**
			 * 是否自动初始化
			 */
			autoInit: {
				type: Boolean,
				default: true
			}
		},

		data() {
			return {
				// 地图中心位置
				mapCenterLocation: {},
				// 初始化地图配置
				initConfig: null,
				// 中心点图标配置
				centerIconConfig: null,
				// 批量渲染图标配置
				batchIconConfig: null,
				// 多边形路径配置
				polygonPathConfig: null,
				// 圆形配置
				circleListConfig: null,
				// 线段路径配置
				linePathConfig: null,
				// geoJson数据配置
				geoJsonConfig: null,
				// 热力图配置
				hotMapConfig: null,
				// 缩放至范围配置
				zoomToExtentConfig: null
			};
		},

		computed: {
			/**
			 * 地图高度字符串
			 */
			mapHeightStr() {
				const isNumber = (val) => typeof val === 'number' && Number.isFinite(val);
				return isNumber(this.mapHeight) ? `${this.mapHeight}rpx` : this.mapHeight;
			}
		},

		mounted() {
			if (this.autoInit) {
				this.$emit('ready');
			}
		},

		beforeDestroy() {
			// 通知 renderjs 清理资源
			this.initConfig = 'destroy';
		},

		methods: {

			/**
			 * 初始化地图
			 * @param {Object} mapConfig - 地图配置
			 * @param {Object} mapConfig.sourceParams - 瓦片源配置
			 * @param {Object} mapConfig.mapOptions - 地图选项
			 * @param {Object} mapConfig.controlOptions - 控件选项
			 */
			mapInit(mapConfig) {
				if (isEmptyStrict(mapConfig)) {
					console.error('[ZMap] 初始化配置不能为空');
					return;
				}
				this.initConfig = mapConfig;
			},

			/**
			 * 调整地图中心点
			 * @param {Object} params
			 * @param {number} params.lat - 纬度
			 * @param {number} params.lng - 经度
			 * @param {string} [params.projection='EPSG:4326'] - 坐标系
			 * @param {number} [params.zoom=15] - 缩放级别
			 */
			mapChangeCenter({
				lat,
				lng,
				projection = 'EPSG:4326',
				zoom = 15
			}) {
				if (lat == null || lng == null) {
					console.warn('[ZMap] 经纬度参数无效');
					return;
				}
				this.mapCenterLocation = {
					lat,
					lng,
					projection,
					zoom
				};
			},

			/**
			 * 绘制地图中心点图标
			 * @param {Object} iconConfig - 图标配置
			 * @param {number} iconConfig.lng - 经度
			 * @param {number} iconConfig.lat - 纬度
			 * @param {string} iconConfig.url - 图标地址
			 * @param {number} [iconConfig.scale=0.5] - 缩放比例
			 */
			mapDrawCenterPoint(iconConfig) {
				this.centerIconConfig = iconConfig;
			},

			/**
			 * 批量绘制图标
			 * @param {Object} listConfig - 列表配置
			 * @param {Array} listConfig.list - 点位列表
			 * @param {Object} listConfig.config - 全局配置
			 */
			mapDrawBatchIcon(listConfig) {
				this.batchIconConfig = listConfig;
			},

			/**
			 * 绘制多边形路径
			 * @param {Object} pathConfig - 路径配置
			 * @param {Array} pathConfig.path - 坐标点数组
			 * @param {Object} pathConfig.style - 样式配置
			 */
			mapDrawPolygonPath(pathConfig) {
				this.polygonPathConfig = pathConfig;
			},

			/**
			 * 绘制圆形
			 * @param {Object} circleConfig - 圆形配置
			 * @param {Array} circleConfig.list - 圆心列表
			 * @param {Object} circleConfig.style - 样式配置
			 */
			mapDrawCircle(circleConfig) {
				this.circleListConfig = circleConfig;
			},

			/**
			 * 绘制线段路径
			 * @param {Object} lineConfig - 线段配置
			 * @param {Array} lineConfig.path - 路径坐标数组
			 * @param {Object} lineConfig.style - 样式配置
			 */
			mapDrawLinePath(lineConfig) {
				this.linePathConfig = lineConfig;
			},

			/**
			 * 绘制 GeoJSON 数据
			 * @param {Object} geoJsonConfig - GeoJSON 配置
			 * @param {Object} geoJsonConfig.geoJsonData - GeoJSON 数据
			 * @param {Object} geoJsonConfig.style - 样式配置
			 */
			mapDrawGeoJson(geoJsonConfig) {
				this.geoJsonConfig = geoJsonConfig;
			},

			/**
			 * 绘制热力图
			 * @param {Object} hotMapConfig - 热力图配置
			 * @param {Object} hotMapConfig.hotMapData - 热力数据
			 * @param {Object} hotMapConfig.options - 热力图选项
			 */
			mapDrawHotMap(hotMapConfig) {
				this.hotMapConfig = hotMapConfig;
			},

			/**
			 * 触发点位点击事件
			 * @param {Object} value - 点击的点位数据
			 * @emits click-point
			 */
			handleEmitClickPoint(value) {
				this.$emit('click-point', value);
			},

			/**
			 * 触发路径距离变化事件
			 * @param {Object} distanceInfo - 距离信息
			 * @param {number} distanceInfo.distance - 距离值
			 * @param {string} distanceInfo.unit - 单位
			 * @emits path-distance-change
			 */
			handleEmitPathDistance(distanceInfo) {
				this.$emit('path-distance-change', distanceInfo);
			},

			/**
			 * 触发多边形面积变化事件
			 * @param {Object} areaInfo - 面积信息
			 * @param {number} areaInfo.area - 面积值
			 * @param {string} areaInfo.unit - 单位
			 * @param {number} areaInfo.pointCount - 顶点数量
			 * @emits polygon-area-change
			 */
			handleEmitPolygonArea(areaInfo) {
				this.$emit('polygon-area-change', areaInfo);
			},

			/**
			 * 缩放至指定范围
			 * @param {Object} extentConfig - 范围配置
			 * @param {Array} extentConfig.coordinates - 坐标数组
			 * @param {string} [extentConfig.projection='EPSG:4326'] - 坐标系
			 * @param {number} [extentConfig.padding=0] - 内边距
			 */
			mapZoomToExtent(extentConfig) {
				this.zoomToExtentConfig = extentConfig;
			}
		}
	};
</script>

<script module="ol" lang="renderjs">
	import {
		zMapOl,
		DEFAULT_CONFIG
	} from './z-map-ol.js';
	import Feature from 'ol/Feature';
	import {
		Point
	} from 'ol/geom';
	import {
		fromLonLat
	} from 'ol/proj';

	/** 严格空值检查 */
	const isEmptyStrict = (obj) => {
		if (obj === null || obj === undefined) return true;
		if (typeof obj === 'string') return obj.trim() === '';
		if (typeof obj === 'object') return Object.keys(obj).length === 0;
		return false;
	};

	export default {
		name: 'ZMapRender',

		data() {
			return {
				// 地图实例
				map: null,
				// 当前定位
				gps: null,
				// 中心点图标
				centerIconLayer: null,
				centerIconFeature: null,
				// 标记图标
				iconLayer: null,
				iconFeature: null,
				// 批量绘制点位
				pointIconList: [],
				// 圆形
				circleLayer: null,
				// 多边形路径
				polygonPathLayer: null,
				// 线段路径
				linePathLayer: null,
				// geoJson
				geoJsonLayer: null,
				// 热力图
				hotMapLayer: null,
				// 监听位置
				watchPosition: null,
				// 当前缩放级别
				currentZoom: DEFAULT_CONFIG.ZOOM.DEFAULT,
				// Resize 监听器
				resizeObserver: null
			};
		},

		methods: {
			/**
			 * 初始化地图
			 * @param {Object} config - 配置对象
			 */
			initMap(config) {
				if (config === 'destroy') {
					this.destroyMap();
					return;
				}

				if (isEmptyStrict(config)) return;

				const {
					sourceParams,
					mapOptions,
					controlOptions
				} = config;

				try {
					this.map = zMapOl.initMap('zMap', sourceParams, mapOptions, controlOptions);
					if (!this.map) {
						console.error('[ZMap] 地图初始化失败');
						return;
					}

					this.currentZoom = mapOptions?.zoom || DEFAULT_CONFIG.ZOOM.DEFAULT;
					this.setupZoomListener();
					this.setupClickListener();
					this.setupResizeObserver();
				} catch (err) {
					console.error('[ZMap] 初始化异常:', err);
				}
			},

			/**
			 * 销毁地图
			 */
			destroyMap() {
				// 清理所有图层
				this.removeCenterIcon();
				this.removeIcon();
				this.removeCircle();
				this.handleRemovePolygonPath();
				this.handleRemoveLinePath();
				this.handleRemoveGeoJsonData();
				this.handleRemoveHotMapData();

				// 清理 ResizeObserver
				if (this.resizeObserver) {
					this.resizeObserver.disconnect();
					this.resizeObserver = null;
				}
				window.removeEventListener('resize', this.handleResize);

				// 清理地图实例
				if (this.map) {
					this.map.setTarget(null);
					this.map = null;
				}

				// 清理定时器
				if (this.watchPosition) {
					clearInterval(this.watchPosition);
					this.watchPosition = null;
				}
			},

			/**
			 * 设置点击监听
			 */
			setupClickListener() {
				if (!this.map) return;

				this.map.on('singleclick', (event) => {
					const feature = this.map.forEachFeatureAtPixel(event.pixel, (f) => f);
					if (feature) {
						this.$ownerInstance.callMethod('handleEmitClickPoint', feature.values_);
					}
				});
			},

			/**
			 * 设置缩放监听
			 */
			setupZoomListener() {
				if (!this.map) return;

				let debounceTimer = null;

				this.map.getView().on('change:resolution', (res) => {
					const zoom = res.target.getZoom();
					this.currentZoom = zoom;

					clearTimeout(debounceTimer);
					debounceTimer = setTimeout(() => {
						this.updateIconScale(zoom);
					}, 50);
				});
			},

			/**
			 * 设置容器尺寸变化监听
			 */
			setupResizeObserver() {
				if (!this.map) return;
				const target = document.getElementById('zMap');
				if (!target) return;

				if (window.ResizeObserver) {
					this.resizeObserver = new ResizeObserver(() => {
						this.map.updateSize();
					});
					this.resizeObserver.observe(target);
				} else {
					window.addEventListener('resize', this.handleResize);
				}
			},

			/**
			 * 窗口 resize 降级处理
			 */
			handleResize() {
				if (this.map) {
					this.map.updateSize();
				}
			},

			/**
			 * 更新图标缩放比例
			 * @param {number} zoom - 当前缩放级别
			 */
			updateIconScale(zoom) {
				const {
					BASE_ZOOM,
					SCALE_MIN,
					SCALE_MAX,
					DEFAULT_SCALE
				} = DEFAULT_CONFIG.ICON;
				const scaleRatio = Math.max(SCALE_MIN, Math.min(SCALE_MAX, zoom / BASE_ZOOM));
				const finalScale = scaleRatio * DEFAULT_SCALE;

				// 更新中心图标
				if (this.centerIconFeature) {
					const style = this.centerIconFeature.getStyle();
					if (style?.getImage()) {
						style.getImage().setScale(finalScale);
						this.centerIconFeature.setStyle(style);
					}
				}

				// 更新批量图标
				if (this.pointIconList.length > 0) {
					this.pointIconList.forEach(item => {
						const style = item.getStyle();
						if (style?.getImage()) {
							style.getImage().setScale(finalScale);
							item.setStyle(style);
						}
					});
				}
			},

			/**
			 * 调整地图中心
			 * @param {Object} gps - 坐标对象
			 * @param {number} zoom - 缩放级别
			 */
			changeMapCenter(gps, zoom = DEFAULT_CONFIG.ZOOM.CENTER_ZOOM) {
				if (this.map) {
					zMapOl.changeCenter(this.map, gps, zoom);
				}
			},

			/**
			 * 处理中心图标
			 * @param {Object} iconConfig - 图标配置
			 */
			handleCenterIcon(iconConfig) {
				if (isEmptyStrict(iconConfig)) return;

				this.removeCenterIcon();

				if (iconConfig === 'remove') return;

				const drawResult = zMapOl.drawIcon(this.map, iconConfig);
				if (drawResult) {
					this.centerIconLayer = drawResult.iconLayer;
					this.centerIconFeature = drawResult.iconFeature;
				}
			},

			/**
			 * 移除中心点图标
			 */
			removeCenterIcon() {
				if (this.centerIconLayer && this.map) {
					this.map.removeLayer(this.centerIconLayer);
					this.centerIconLayer = null;
					this.centerIconFeature = null;
				}
			},

			/**
			 * 批量绘制图标
			 * @param {Object} listConfig - 列表配置
			 */
			handleDrawBatchIcon(listConfig) {
				if (isEmptyStrict(listConfig)) return;

				this.removeIcon();

				if (listConfig === 'remove') return;

				const pointList = listConfig.list || [];
				const config = listConfig.config || {};

				const result = zMapOl.drawBatchIcon(this.map, pointList, config);
				if (result) {
					this.pointIconList = result.iconList || [];
					this.iconLayer = result.iconLayer;
				}
			},

			/**
			 * 移除批量图标
			 */
			removeIcon() {
				if (this.iconLayer && this.map) {
					this.map.removeLayer(this.iconLayer);
					this.iconLayer = null;
					this.pointIconList = [];
				}
			},

			/**
			 * 绘制圆形
			 * @param {Object} circleConfig - 圆形配置
			 */
			handleDrawCircle(circleConfig) {
				if (isEmptyStrict(circleConfig)) return;

				this.removeCircle();

				if (circleConfig === 'remove') return;

				const pointList = circleConfig.list || [];
				const style = circleConfig.style || {};

				const result = zMapOl.drawCircle(this.map, pointList, style);
				if (result) {
					this.circleLayer = result.circleLayer;
				}
			},

			/**
			 * 移除圆形
			 */
			removeCircle() {
				if (this.circleLayer && this.map) {
					this.map.removeLayer(this.circleLayer);
					this.circleLayer = null;
				}
			},

			/**
			 * 绘制多边形
			 * @param {Object} pathConfig - 路径配置
			 */
			handlePolygonPath(pathConfig) {
				if (isEmptyStrict(pathConfig)) return;

				this.handleRemovePolygonPath();

				if (pathConfig === 'remove') return;

				this.polygonPathLayer = zMapOl.drawArea(
					this.map,
					pathConfig.path,
					pathConfig.style,
					pathConfig.projection
				);

				// 处理中心点
				if (pathConfig.polygonCenter) {
					let center = null;

					if (pathConfig.polygonCenter === true) {
						center = zMapOl.calculateCenter(pathConfig.path);
					} else if (
						typeof pathConfig.polygonCenter.lat === 'number' &&
						typeof pathConfig.polygonCenter.lng === 'number'
					) {
						center = {
							lat: pathConfig.polygonCenter.lat,
							lng: pathConfig.polygonCenter.lng
						};
					}

					if (center) {
						this.changeMapCenter(center, pathConfig.polygonCenterZoom || DEFAULT_CONFIG.ZOOM.CENTER_ZOOM);
					}
				}

				// 计算面积并发送
				if (pathConfig.calculateArea && this.polygonPathLayer) {
					const source = this.polygonPathLayer.getSource();
					const features = source.getFeatures();
					if (features.length > 0) {
						const polygon = features[0].getGeometry();
						const unit = pathConfig.areaUnit || 'm²';
						const area = zMapOl.computedPolygonArea(polygon, unit);

						this.$ownerInstance.callMethod('handleEmitPolygonArea', {
							area,
							unit,
							pointCount: pathConfig.path.length
						});
					}
				}
			},

			/**
			 * 移除多边形
			 */
			handleRemovePolygonPath() {
				if (this.polygonPathLayer && this.map) {
					this.map.removeLayer(this.polygonPathLayer);
					this.polygonPathLayer = null;
				}
			},

			/**
			 * 绘制线段
			 * @param {Object} lineConfig - 线段配置
			 */
			handleLinePath(lineConfig) {
				if (isEmptyStrict(lineConfig)) return;

				this.handleRemoveLinePath();

				if (lineConfig === 'remove') return;

				const drawResult = zMapOl.drawPath(this.map, lineConfig.path, lineConfig.style);
				if (!drawResult) return;

				this.linePathLayer = drawResult.pathLayer;

				// 计算距离
				const unit = lineConfig.distanceUnit || 'm';
				const distance = zMapOl.computedPathLength(drawResult.lineString, unit);

				this.$ownerInstance.callMethod('handleEmitPathDistance', {
					distance,
					unit
				});
			},

			/**
			 * 移除线段
			 */
			handleRemoveLinePath() {
				if (this.linePathLayer && this.map) {
					this.map.removeLayer(this.linePathLayer);
					this.linePathLayer = null;
				}
			},

			/**
			 * 处理 GeoJSON 数据
			 * @param {Object} geoJsonConfig - GeoJSON 配置
			 */
			handleGeoJsonData(geoJsonConfig) {
				if (isEmptyStrict(geoJsonConfig)) return;

				this.handleRemoveGeoJsonData();

				if (geoJsonConfig === 'remove') return;

				this.geoJsonLayer = zMapOl.addGeoJsonLayer(
					this.map,
					geoJsonConfig.geoJsonData,
					geoJsonConfig.style
				);
			},

			/**
			 * 移除 GeoJSON 数据
			 */
			handleRemoveGeoJsonData() {
				if (this.geoJsonLayer && this.map) {
					this.map.removeLayer(this.geoJsonLayer);
					this.geoJsonLayer = null;
				}
			},

			/**
			 * 处理热力图数据
			 * @param {Object} hotMapConfig - 热力图配置
			 */
			handleHotMapData(hotMapConfig) {
				if (isEmptyStrict(hotMapConfig)) return;

				this.handleRemoveHotMapData();

				if (hotMapConfig === 'remove') return;

				this.hotMapLayer = zMapOl.addHotmapLayer(
					this.map,
					hotMapConfig.hotMapData,
					hotMapConfig.options
				);
			},

			/**
			 * 移除热力图
			 */
			handleRemoveHotMapData() {
				if (this.hotMapLayer && this.map) {
					this.map.removeLayer(this.hotMapLayer);
					this.hotMapLayer = null;
				}
			},

			/**
			 * 缩放至范围
			 * @param {Object} config - 配置
			 */
			handleZoomToExtent(config) {
				if (isEmptyStrict(config)) return;
				if (!this.map) return;
				const { coordinates, maxZoom = 16 } = config;
				if (!coordinates || coordinates.length === 0) return;
				const features = coordinates.map(c => new Feature(new Point(fromLonLat(c))));
				zMapOl.zoomToFeatures(this.map, features, maxZoom);
			},

			/**
			 * 处理地图中心位置变化
			 * @param {Object} location - 位置对象
			 */
			handleMapCenterLocation(location) {
				if (isEmptyStrict(location)) return;
				if (!location || !this.map) return;
				const {
					lat,
					lng,
					zoom,
					projection
				} = location;
				this.changeMapCenter({
					lat,
					lng,
					projection
				}, zoom || DEFAULT_CONFIG.ZOOM.CENTER_ZOOM);
			}
		}
	};
</script>

<style lang="scss" scoped>
	.map-container {
		width: 100%;
		height: 100%;
	}

	.unsupported {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background-color: #f5f5f5;
	}

	.unsupported-text {
		font-size: 28rpx;
		color: #999;
		text-align: center;
	}

	/* Popup 样式 - 使用 CSS 变量支持暗黑模式 */
	:root {
		--popup-bg: #ffffff;
		--popup-border: #e0e0e0;
		--popup-text: #333;
		--popup-closer: #999;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--popup-bg: #1e1e1e;
			--popup-border: #3a3a3a;
			--popup-text: #e0e0e0;
			--popup-closer: #aaa;
		}
	}

	.ol-popup {
		position: absolute;
		background-color: var(--popup-bg);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		padding: 15px;
		border-radius: 8px;
		border: 1px solid var(--popup-border);
		bottom: 12px;
		left: -50px;
		min-width: 280px;
		color: var(--popup-text);

		&::after,
		&::before {
			top: 100%;
			border: solid transparent;
			content: '';
			height: 0;
			width: 0;
			position: absolute;
			pointer-events: none;
		}

		&::after {
			border-top-color: var(--popup-bg);
			border-width: 10px;
			left: 48px;
			margin-left: -10px;
		}

		&::before {
			border-top-color: var(--popup-border);
			border-width: 11px;
			left: 48px;
			margin-left: -11px;
		}

		&-closer {
			text-decoration: none;
			position: absolute;
			top: 8px;
			right: 8px;
			color: var(--popup-closer);
			font-size: 16px;
			cursor: pointer;

			&:hover {
				color: var(--popup-text);
			}

			&::after {
				content: '✕';
			}
		}
	}
</style>