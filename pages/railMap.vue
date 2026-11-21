<template>
	<view class="rail-map-page" :style="{ '--map-status-height': statusBarHeight + 'px' }">
		<siji-tianditu ref="map" :map-key="mapKey" :lonlat="[104.5, 35.5]" :zoom="5" :on-loaded="onMapReady" class="rail-map" />
		<view class="map-toolbar">
			<view class="map-back" hover-class="ux-tap" @click="back"><text class="icon">&#xe5c4;</text></view>
			<view class="map-search">
				<input v-model="keyword" placeholder="搜索铁路线路" confirm-type="search" @focus="showLines = true" @input="showLines = true" />
				<text class="map-list-toggle" @click="showLines = !showLines">{{ showLines ? '收起' : '线路' }}</text>
			</view>
		</view>
		<view v-if="showLines" class="map-lines">
			<view class="map-list-title"><text>轨道地图</text><text class="map-muted">{{ filteredLines.length }} 条线路</text></view>
			<view v-if="linesLoading" class="map-message">正在加载线路…</view>
			<view v-else-if="linesError" class="map-message" @click="loadLines">{{ linesError }} · 点击重试</view>
			<scroll-view v-else scroll-y :show-scrollbar="false" class="map-line-scroll">
				<view v-for="line in filteredLines" :key="line.routeName" class="map-line-row" hover-class="ux-tap" @click="selectLine(line)">
					<text class="map-line-name">{{ line.routeName }}</text>
					<text class="map-muted">{{ line.startStation }} — {{ line.endStation }} · {{ line.totalMileageKm }} km</text>
				</view>
				<view v-if="!filteredLines.length" class="map-message">未找到匹配线路</view>
			</scroll-view>
		</view>
		<view v-if="selectedLine && !showLines" class="map-detail">
			<view class="map-detail-heading"><text class="map-line-name">{{ selectedLine.routeName }}</text><text class="map-action" @click="fitLine">定位全线</text></view>
			<text class="map-muted">{{ selectedLine.startStation }} — {{ selectedLine.endStation }} · {{ selectedLine.totalMileageKm }} km</text>
			<view v-if="lineLoading" class="map-message">正在加载轨道与车站…</view>
			<view v-else-if="lineError" class="map-message" @click="selectLine(selectedLine)">{{ lineError }} · 点击重试</view>
			<view v-else>
				<text class="map-track-note">{{ hasTrack ? '可滑动下方车站进行查找' : '站点连线示意，非实际轨道轨迹；可滑动下方车站进行查找' }}</text>
				<scroll-view scroll-x :show-scrollbar="false" class="map-stations">
					<view v-for="station in stations" :key="station.stationIndex" class="map-station" @click="focusStation(station)">
						<text>{{ station.stationName }}</text><text class="map-muted">{{ station.mileageKm }} km</text>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import SijiTianditu from '@/uni_modules/siji-tianditu/components/siji-tianditu/siji-tianditu.vue';
import { uniGet } from '@/scripts/req.js';

const API_BASE = 'https://next.railgo.zenglingkun.cn/api/v2';

export default {
	components: { SijiTianditu },
	data() {
		return {
			statusBarHeight: uni.getSystemInfoSync().statusBarHeight || 0,
			mapKey: '416cfaff76398b8567f8b7e48a933651',
			keyword: '', lines: [], linesLoading: false, linesError: '', showLines: true,
			selectedLine: null, stations: [], segments: [], fitCoordinates: [],
			lineLoading: false, lineError: '', hasTrack: false, mapReady: false, requestId: 0
		};
	},
	computed: {
		filteredLines() {
			const q = this.keyword.trim();
			return this.lines.filter(line => !q || [line.routeName, line.startStation, line.endStation].some(name => (name || '').includes(q)));
		}
	},
	onLoad() { this.loadLines(); },
	onUnload() { this.requestId++; },
	methods: {
		back() { uni.navigateBack(); },
		async loadLines() {
			this.linesLoading = true;
			this.linesError = '';
			try {
				const response = await uniGet(API_BASE + '/routeLines');
				if (!response.data?.success || !Array.isArray(response.data.data?.routes)) throw new Error('线路加载失败');
				this.lines = response.data.data.routes;
			} catch (error) { this.linesError = '线路加载失败'; }
			finally { this.linesLoading = false; }
		},
		onMapReady() { this.mapReady = true; this.drawLine(); },
		async selectLine(line) {
			const id = ++this.requestId;
			this.selectedLine = line;
			this.showLines = false;
			this.lineLoading = true;
			this.lineError = '';
			this.stations = [];
			this.segments = [];
			this.fitCoordinates = [];
			if (this.mapReady) this.$refs.map.clearAll();
			try {
				const response = await uniGet(API_BASE + '/routeLineDetail', { params: { routeName: line.routeName } });
				if (!response.data?.success || !Array.isArray(response.data.data?.stations)) throw new Error('线路加载失败');
				if (id !== this.requestId) return;
				const stations = response.data.data.stations;
				const track = await uniGet(API_BASE + '/routePolyline', { params: { routeName: line.routeName, fromStation: line.startStation, toStation: line.endStation } });
				if (!track.data?.success) throw new Error('轨道加载失败');
				if (id !== this.requestId) return;
				this.stations = stations;
				this.hasTrack = track.data.data.hasTrack === true;
				const coordinates = this.hasTrack ? track.data.data.points : stations.map(s => s.coordinates);
				const points = (coordinates || []).filter(p => Array.isArray(p) && p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1])).map(p => [p[1], p[0]]);
				this.fitCoordinates = points;
				this.segments = [{ points, style: { color: '#114598', width: 4, opacity: 0.9 } }];
				this.drawLine();
			} catch (error) { if (id === this.requestId) this.lineError = '线路地图加载失败'; }
			finally { if (id === this.requestId) this.lineLoading = false; }
		},
		drawLine() {
			if (!this.mapReady || !this.segments.length) return;
			this.$refs.map.drawRoute(JSON.parse(JSON.stringify(this.segments)));
			this.$refs.map.drawMarkers(this.stations.filter(s => Array.isArray(s.coordinates) && s.coordinates.length >= 2).map(s => ({ lng: s.coordinates[1], lat: s.coordinates[0], name: s.stationName, fill: '#ffffff', stroke: '#114598', radius: 4, strokeWidth: 2 })));
			this.fitLine();
		},
		fitLine() { if (this.mapReady && this.fitCoordinates.length) this.$refs.map.fitPoints(this.fitCoordinates); },
		focusStation(station) {
			if (this.mapReady && station.coordinates?.length >= 2) this.$refs.map.setCenter(station.coordinates[1], station.coordinates[0], 12);
		}
	}
};
</script>

<style scoped>
.rail-map-page { position: fixed; inset: 0; background: #e8edf1; }
.rail-map { width: 100%; height: 100%; }
.map-toolbar { position: absolute; top: calc(max(var(--map-status-height, 0px), var(--status-bar-height, 0px), env(safe-area-inset-top, 0px)) + 24px); left: 16px; right: 16px; display: flex; gap: 10px; }
.map-back, .map-search { background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #172f4d20; }
.map-back { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 23px; color: #114598; }
.map-search { flex: 1; min-width: 0; display: flex; align-items: center; padding: 0 14px; }
.map-search input { flex: 1; min-width: 0; font-size: 15px; height: 44px; }
.map-list-toggle, .map-action { font-size: 14px; color: #114598; padding: 10px 0 10px 12px; }
.map-lines { position: absolute; left: 16px; right: 16px; top: calc(max(var(--map-status-height, 0px), var(--status-bar-height, 0px), env(safe-area-inset-top, 0px)) + 80px); background: #fff; border-radius: 12px; box-shadow: 0 4px 20px #172f4d20; overflow: hidden; }
.map-list-title, .map-detail-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.map-list-title { padding: 16px; font-weight: bold; color: #114598; }
.map-line-scroll { height: 48vh; }
.map-line-row { padding: 13px 16px; border-top: 1px solid #edf0f4; }
.map-line-name { display: block; font-size: 17px; font-weight: bold; color: #263649; }
.map-muted { display: block; font-size: 12px; color: #687789; margin-top: 5px; font-weight: normal; }
.map-message { padding: 20px 16px; text-align: center; font-size: 14px; color: #687789; }
.map-detail { position: absolute; bottom: calc(16px + env(safe-area-inset-bottom)); left: 16px; right: 16px; background: #fff; padding: 12px 16px; border-radius: 12px; box-shadow: 0 4px 20px #172f4d20; }
.map-track-note { display: block; color: #114598; font-size: 12px; margin-top: 12px; }
.map-stations { white-space: nowrap; width: 100%; margin-top: 12px; }
.map-station { display: inline-flex; flex-direction: column; padding: 8px 16px 8px 0; font-size: 14px; color: #263649; }
@media (min-width: 840px) { .map-toolbar, .map-lines { right: auto; width: 360px; } .map-detail { left: auto; width: 380px; } .map-line-scroll { height: 65vh; } }
</style>
