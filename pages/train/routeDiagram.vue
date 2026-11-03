<template>
	<view class="rd-page">
		<back-header use-px background="#f5f5f5"></back-header>

		<view class="rd-body">
			<view v-if="error" class="rd-empty">
				<text class="rd-empty-text">{{ error }}</text>
			</view>

			<view v-else-if="size.width > 0" class="rd-card">
				<movable-area class="rd-area" :style="'width:' + stage.width + 'px;height:' + stage.height + 'px;'">
					<movable-view direction="all" :scale="true" :scale-min="0.4" :scale-max="3" :scale-value="1"
						:x="0" :y="0" :style="'width:' + size.width + 'px;height:' + size.height + 'px;'">
						<canvas canvas-id="routeDiagram" id="routeDiagram"
							:style="'width:' + size.width + 'px;height:' + size.height + 'px;'"></canvas>
					</movable-view>
				</movable-area>
				<view class="rd-foot">
					<text class="rd-hint-text">拖动查看，双指缩放</text>
					<button class="ux-color-white ux-bg-primary rd-save" size="mini" :disabled="exporting"
						@click="exportImage">
						<view class="rd-save-inner">
							<text class="icon rd-save-icon">&#xe2c4;</text>
							<text class="rd-save-text">{{ exporting ? '保存中' : '保存图片' }}</text>
						</view>
					</button>
				</view>
			</view>
		</view>
		<railgo-loader></railgo-loader>
	</view>
</template>

<script>
	import { uniGet } from "@/scripts/req";
	import { doQuery } from "@/scripts/sqlite.js";
	import { buildRouteTemplate, renderRouteDiagram, diagramSize } from "@/scripts/routeDiagram.js";
	import { showLoader, hideLoader } from "@/scripts/loader.js";
	import RailgoLoader from "@/components/railgo-loader/railgo-loader.vue";

	const HEADER_HEIGHT = 44;
	const BODY_PADDING = 6;
	const CARD_PADDING = 8;
	const HINT_HEIGHT = 38;

	export default {
		components: {
			RailgoLoader
		},
		data() {
			return {
				train: '',
				error: '',
				tripCount: 0,
				stationCount: 0,
				exporting: false,
				size: { width: 0, height: 0 },
				// plus 转屏是异步的，窗口尺寸要等转完再量
				win: { statusBar: 0, windowWidth: 667, windowHeight: 375, pixelRatio: 1 }
			}
		},
		computed: {
			// 横屏可视窗口：图尽量占满剩余高度，超出部分在 movable-view 里拖动查看
			stage() {
				const { statusBar, windowWidth, windowHeight } = this.win;
				const availableWidth = windowWidth - (BODY_PADDING + CARD_PADDING) * 2;
				const availableHeight = windowHeight - statusBar - HEADER_HEIGHT - (BODY_PADDING + CARD_PADDING) * 2 - HINT_HEIGHT;
				return {
					width: Math.max(280, availableWidth),
					height: Math.max(180, Math.min(this.size.height, availableHeight))
				};
			}
		},
		onLoad(options) {
			// #ifdef APP-PLUS
			plus.screen.lockOrientation('landscape-primary');
			// #endif
			this.readWindow();

			const keyword = options.train ? String(options.train).split('/')[0].toUpperCase() : '';
			if (!/^[A-Z0-9]{1,8}$/.test(keyword)) {
				this.error = '车次参数有误';
				return;
			}
			this.train = keyword;
			this.getData();
		},
		onShow() {
			// #ifdef APP-PLUS
			plus.screen.lockOrientation('landscape-primary');
			// #endif
			this.readWindow();
		},
		onResize() {
			this.readWindow();
		},
		onUnload() {
			// #ifdef APP-PLUS
			plus.screen.lockOrientation('portrait-primary');
			// #endif
		},
		methods: {
			readWindow() {
				const info = uni.getSystemInfoSync();
				this.win = {
					statusBar: info.statusBarHeight || 0,
					windowWidth: info.windowWidth || 667,
					windowHeight: info.windowHeight || 375,
					pixelRatio: Math.min(2, info.pixelRatio || 1)
				};
			},
			async getData() {
				showLoader('正在汇总 ' + this.train + ' 的交路数据...');
				try {
					const main = await this.loadTrain(this.train);
					if (!main.timetable || main.timetable.length < 2) {
						throw new Error('未获取到 ' + this.train + ' 的时刻表');
					}

					const items = (main.diagram || []).filter(item => item && (item.train_num || item.number));
					const firstCode = item => String(item.train_num || item.number || '').split('/')[0].toUpperCase();
					if (items.length === 0 || items.every(item => firstCode(item) !== this.train)) {
						items.push({ train_num: this.train });
					}

					const codes = [];
					items.forEach(item => {
						const code = firstCode(item);
						if (/^[A-Z0-9]{1,8}$/.test(code) && codes.indexOf(code) < 0) codes.push(code);
					});

					const timetables = {};
					await Promise.all(codes.map(code =>
						(code === this.train
							? Promise.resolve(main.timetable)
							: this.loadTrain(code).then(res => res.timetable).catch(() => null)
						).then(timetable => { timetables[code] = timetable; })
					));

					const trips = items.map(item => ({
						train_code: String(item.train_num || item.number || '').toUpperCase(),
						from: item.from,
						to: item.to,
						timetable: timetables[firstCode(item)] || []
					}));

					const template = buildRouteTemplate(trips);
					if (template.train_sequence.length === 0 || template.station_positions.length < 2) {
						throw new Error('暂无可绘制的交路时刻数据');
					}

					this.tripCount = template.train_sequence.length;
					this.stationCount = template.station_positions.length;
					this.drawTemplate(template);
				} catch (e) {
					console.error('交路图加载失败', e);
					this.error = (e && e.message) ? e.message : '交路图加载失败';
				} finally {
					hideLoader();
				}
			},
			// 画布取自然尺寸（不缩字号），超出可视窗口的部分在 movable-view 里拖动/缩放查看
			drawTemplate(template) {
				this.size = diagramSize(template);
				this.$nextTick(() => {
					renderRouteDiagram(uni.createCanvasContext('routeDiagram', this), template, {
						caption: this.buildCaption()
					});
				});
			},
			// 画布比可视窗口大得多，导出走画布位图而不是截屏
			exportImage() {
				if (this.exporting || this.size.width <= 0) return;
				this.exporting = true;
				const ratio = this.win.pixelRatio;
				uni.canvasToTempFilePath({
					canvasId: 'routeDiagram',
					x: 0,
					y: 0,
					width: this.size.width,
					height: this.size.height,
					destWidth: Math.round(this.size.width * ratio),
					destHeight: Math.round(this.size.height * ratio),
					fileType: 'png',
					success: res => this.saveImage(res.tempFilePath),
					fail: e => {
						console.error('交路图导出失败', e);
						uni.showToast({ title: '生成图片失败', icon: 'none' });
					},
					complete: () => {
						this.exporting = false;
					}
				}, this);
			},
			saveImage(filePath) {
				// 运行时判平台：uniPlatform 以 web 开头（H5、浏览器预览）没有相册可写，改用浏览器下载
				if (String(uni.getSystemInfoSync().uniPlatform || '').indexOf('web') === 0) {
					this.downloadInBrowser(filePath);
					return;
				}
				uni.saveImageToPhotosAlbum({
					filePath,
					success: () => uni.showToast({ title: '已保存到相册', icon: 'none' }),
					fail: e => {
						console.error('交路图保存失败', e);
						uni.showToast({ title: '保存到相册失败', icon: 'none' });
					}
				});
			},
			downloadInBrowser(href) {
				const link = document.createElement('a');
				link.href = href;
				link.download = this.train + ' 交路图.png';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				uni.showToast({ title: '已开始下载', icon: 'none' });
			},
			// 网络模式取 V1 时刻表与交路，本地模式读 SQLite
			async loadTrain(code) {
				if (uni.getStorageSync('mode') !== 'network') {
					const rows = await doQuery(
						"SELECT timetable, diagram FROM trains WHERE number='" + code + "'",
						['timetable', 'diagram']
					);
					const row = (rows && rows.length) ? rows[0] : {};
					return {
						timetable: this.parseJson(row.timetable) || [],
						diagram: this.parseJson(row.diagram) || []
					};
				}

				const trainBase = uni.getStorageSync('service_source_train') || 'https://data.railgo.zenglingkun.cn';
				const res = await uniGet(trainBase + `/api/train/query?train=${encodeURIComponent(code)}`);
				const data = res && res.data;
				if (!data || data.error) {
					throw new Error('未获取到 ' + code + ' 的交路数据');
				}
				return {
					timetable: data.timetable || [],
					diagram: Array.isArray(data.diagram) ? data.diagram : []
				};
			},
			parseJson(value) {
				if (typeof value !== 'string') return value;
				try {
					return JSON.parse(value);
				} catch (e) {
					return null;
				}
			},
			formatGenDate() {
				const now = new Date();
				const month = String(now.getMonth() + 1).padStart(2, '0');
				const day = String(now.getDate()).padStart(2, '0');
				return `${now.getFullYear()}年${month}月${day}日`;
			},
			buildCaption() {
				if (uni.getStorageSync('mode') !== 'network') {
					const version = uni.getStorageSync('offlineDataVersionText')
						|| uni.getStorageSync('offlineDataVersion') || '未知';
					return `基于${version}版本数据库生成，交路图仅供参考`;
				}
				return `${this.formatGenDate()}生成，交路图仅供参考`;
			}
		}
	}
</script>

<style scoped>
	.rd-page {
		width: 100%;
		height: 100vh;
		background-color: #f5f5f5;
		overflow: hidden;
	}

	.rd-body {
		padding: 6px;
	}

	.rd-card {
		background-color: #fff;
		border-radius: 8px;
		padding: 8px;
	}

	.rd-area {
		display: block;
	}

	.rd-foot {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		height: 34px;
		padding-top: 4px;
	}

	.rd-hint-text {
		font-size: 12px;
		color: rgba(0, 0, 0, 0.4);
	}

	.rd-save {
		margin: 0;
		padding: 0 10px;
		height: 28px;
		line-height: 28px;
		border-radius: 14px;
	}

	.rd-save-inner {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.rd-save-icon {
		font-size: 14px;
	}

	.rd-save-text {
		margin-left: 4px;
		font-size: 12px;
		line-height: 28px;
	}

	.rd-empty {
		background-color: #fff;
		border-radius: 8px;
		padding: 20px;
		text-align: center;
	}

	.rd-empty-text {
		font-size: 14px;
		color: rgba(0, 0, 0, 0.6);
	}
</style>
