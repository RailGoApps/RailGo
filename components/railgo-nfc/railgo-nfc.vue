<template>
	<!-- 右上角 NFC 入口（仅 Android 显示） -->
	<view v-if="showEntry">
		<view class="rgnfc-bar" :style="{ top: statusBarHeight + 'px' }">
			<view class="rgnfc-entry" hover-class="rgnfc-entry-hover" :hover-stay-time="80" @click="openModal">
				<view class="rgnfc-entry-glyph"></view>
			</view>
		</view>

		<view class="rgnfc-mask" v-if="visible" @click="onMaskClick">
			<view class="rgnfc-panel" @click.stop>
				<!-- 公交卡样式卡片：外层为动态描边环，内层卡面 -->
				<view class="rgnfc-ring" :style="ringStyle">
					<view class="rgnfc-card" @click="previewCycle">
						<view v-if="phase === 'scan' || phase === 'writing'" class="rgnfc-glyph"></view>
						<view v-else-if="phase === 'fail'" class="rgnfc-glyph rgnfc-glyph-fail"></view>
						<view v-else-if="phase === 'done' || phase === 'settling'" class="rgnfc-check">
							<text class="rgnfc-check-t">✓</text>
						</view>
						<view v-else class="rgnfc-glyph rgnfc-glyph-dim"></view>
						<text class="rgnfc-brand">RailGo</text>
					</view>
				</view>
				<text class="rgnfc-tip" :class="phase === 'fail' ? 'rgnfc-tip-fail' : (phase === 'done' || phase === 'settling' ? 'rgnfc-tip-ok' : '')">{{ tipText }}</text>
				<view v-if="phase === 'nfcOff'" class="rgnfc-btn" hover-class="rgnfc-btn-hover" @click="openNfcSettings">
					<text class="rgnfc-btn-t">去开启</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// #ifdef APP-PLUS
	import * as nfc from "@/uni_modules/railgo-nfc";
	// #endif

	export default {
		name: 'railgo-nfc',
		props: {
			// 临时预览开关：H5/模拟器调试卡片效果用，正式版勿开（Android 判断走运行时 osName）
			preview : { type : Boolean, default : false }
		},
		data() {
			return {
				showEntry: false,
				visible: false,
				// scan | writing | settling | done | fail | nfcOff | unsupported
				phase: 'scan',
				angle: 0,
				speed: 2.4,
				// 0~1：渐变尾部向纯色的混合度（写入成功后平滑过渡到静态描边）
				floor: 0,
				timer: null,
				closeTimer: null,
				failTimer: null,
				pollTimer: null,
				scanning: false,
				pkgName: '',
				statusBarHeight: 44
			}
		},
		computed: {
			tipText() {
				if (this.phase === 'scan') return '请靠近NFC Tag';
				if (this.phase === 'writing') return '正在写入…';
				if (this.phase === 'fail') return '写入失败，请重新靠近NFC Tag';
				if (this.phase === 'done' || this.phase === 'settling') return '写入成功';
				if (this.phase === 'nfcOff') return 'NFC 未开启，请开启后重试';
				return '该设备不支持NFC';
			},
			ringStyle() {
				if (this.phase === 'done') {
					return 'background-color:#114598;';
				}
				const c = this.phase === 'fail' ? '208,48,48' : '17,69,152';
				const f = this.floor;
				const op = (v) => (v + f * (1 - v)).toFixed(3);
				// 顺时针旋转：360deg 端为领跑头部（#114598 实色），向身后(0deg 方向)渐隐
				return 'background-image:conic-gradient(from ' + this.angle + 'deg,' +
					'rgba(' + c + ',' + op(0) + ') 0deg,' +
					'rgba(' + c + ',' + op(0) + ') 150deg,' +
					'rgba(' + c + ',' + op(0.08) + ') 200deg,' +
					'rgba(' + c + ',' + op(0.35) + ') 270deg,' +
					'rgba(' + c + ',' + op(0.85) + ') 330deg,' +
					'rgba(' + c + ',' + op(1) + ') 360deg);';
			}
		},
		created() {
			try {
				const sys = uni.getSystemInfoSync();
				this.statusBarHeight = sys.statusBarHeight || 44;
				const os = String(sys.osName || sys.platform || '').toLowerCase();
				this.showEntry = this.preview || os === 'android';
			} catch (e) {
				this.showEntry = this.preview;
			}
		},
		beforeUnmount() {
			this.cleanup();
		},
		// Vue2 兼容
		beforeDestroy() {
			this.cleanup();
		},
		methods: {
			cleanup() {
				if (this.timer) clearInterval(this.timer);
				this.timer = null;
				if (this.closeTimer) clearTimeout(this.closeTimer);
				this.closeTimer = null;
				if (this.failTimer) clearTimeout(this.failTimer);
				this.failTimer = null;
				if (this.pollTimer) clearInterval(this.pollTimer);
				this.pollTimer = null;
				this.stopScan();
			},
			stopScan() {
				// #ifdef APP-PLUS
				if (this.scanning) {
					try { nfc.stopScan(); } catch (e) { /* 忽略 */ }
					this.scanning = false;
				}
				// #endif
			},
			openModal() {
				this.visible = true;
				this.phase = 'scan';
				this.angle = 0;
				this.speed = 2.4;
				this.floor = 0;
				if (this.failTimer) { clearTimeout(this.failTimer); this.failTimer = null; }
				// #ifdef APP-PLUS
				let st = { supported: false, enabled: false };
				try {
					st = nfc.checkStatus();
				} catch (e) {
					this.phase = 'unsupported';
					return;
				}
				if (!st.supported) {
					this.phase = 'unsupported';
					return;
				}
				if (!st.enabled) {
					this.phase = 'nfcOff';
					return;
				}
				try {
					this.pkgName = nfc.getPackageName() || '';
				} catch (e) {
					this.pkgName = '';
				}
				this.scanning = nfc.startScan(null);
				if (!this.scanning) {
					this.phase = 'nfcOff';
					return;
				}
				// 轮询消费插件队列：hasStartupTag 走 boolean 桥可靠；
				// 不传任何跨调用回调（插件端已禁止存储 JS 回调，避免"回调已释放"崩溃）
				this.pollTimer = setInterval(() => {
					if (!nfc.hasStartupTag()) return;
					const t = nfc.takeStartupTag();
					if (t != null && t.uid != null && String(t.uid).length > 0) this.onTagDiscovered(t);
				}, 250);
				// #endif
				this.startAnim();
			},
			startAnim() {
				if (this.timer) clearInterval(this.timer);
				this.timer = setInterval(() => {
					this.angle = (this.angle + this.speed) % 360;
					if (this.phase === 'writing') {
						// 越加越快
						this.speed = Math.min(this.speed + 0.35, 42);
					} else if (this.phase === 'settling') {
						// 尾部渐实 + 减速，平滑“沉入”静态描边
						this.floor = Math.min(this.floor + 0.05, 1);
						this.speed *= 0.85;
						if (this.floor >= 1) {
							this.phase = 'done';
							clearInterval(this.timer);
							this.timer = null;
						}
					} else {
						// scan / fail：自然回落到匀速
						this.speed += (2.4 - this.speed) * 0.08;
						if (this.floor > 0) this.floor = Math.max(this.floor - 0.1, 0);
					}
				}, 16);
			},
			onTagDiscovered(tagInfo) {
				if (this.phase !== 'scan' && this.phase !== 'fail') return;
				if (this.failTimer) { clearTimeout(this.failTimer); this.failTimer = null; }
				this.floor = 0;
				this.phase = 'writing';
				// #ifdef APP-PLUS
				const uri = this.buildTagUri();
				// 移出 UTS 回调栈再调用：避免 "UTS→JS→UTS→JS" 同栈重入桥接导致崩溃/回调失效
				setTimeout(() => {
					if (!this.visible || this.phase !== 'writing') return;
					// URI + AAR：AAR 让系统贴标调起时直跳本 App，不再弹"选择应用"
					const records = [nfc.uriRecord(uri)];
					if (this.pkgName.length > 0) {
						records.push(nfc.aarRecord(this.pkgName));
					}
					nfc.writeNdef(records, {
						success: () => {
							// 先走 settling 平滑过渡，最终落到静态描边
							this.phase = 'settling';
							this.stopScan();
							this.closeTimer = setTimeout(() => { this.closeModal(); }, 2500);
						},
						fail: (code, msg) => {
							// 红色描边提示失败，短暂停留后回到等待重贴
							this.phase = 'fail';
							this.failTimer = setTimeout(() => {
								if (this.phase === 'fail') this.phase = 'scan';
							}, 1800);
						}
					});
				}, 0);
				// #endif
			},
			// railgo://当前页面路径?当前参数（去除 date）
			buildTagUri() {
				const pages = getCurrentPages();
				const cur = pages[pages.length - 1];
				const route = (cur && cur.route) ? cur.route : '';
				const opts = (cur && cur.options) ? cur.options : {};
				const parts = [];
				Object.keys(opts).forEach(key => {
					if (key.toLowerCase() === 'date') return;
					parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(opts[key]));
				});
				const qs = parts.length > 0 ? ('?' + parts.join('&')) : '';
				return 'railgo://' + route + qs;
			},
			openNfcSettings() {
				// #ifdef APP-PLUS
				try {
					const Intent = plus.android.importClass('android.content.Intent');
					const intent = new Intent('android.settings.NFC_SETTINGS');
					plus.android.runtimeMainActivity().startActivity(intent);
				} catch (e) {
					uni.showToast({ title: '请手动到系统设置开启NFC', icon: 'none' });
				}
				// #endif
			},
			onMaskClick() {
				this.closeModal();
			},
			closeModal() {
				if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; }
				if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
				this.visible = false;
				if (this.timer) { clearInterval(this.timer); this.timer = null; }
				this.stopScan();
			},
			// 临时预览：preview 模式点卡片循环状态，便于 H5 查看动画效果
			previewCycle() {
				if (!this.preview) return;
				if (this.phase === 'scan') {
					this.floor = 0;
					this.phase = 'writing';
				} else if (this.phase === 'writing') {
					this.phase = 'settling';
				} else if (this.phase === 'settling' || this.phase === 'done') {
					this.phase = 'fail';
					this.floor = 0;
				} else {
					this.phase = 'scan';
				}
				if (this.timer == null) this.startAnim();
			}
		}
	}
</script>

<style scoped>
	/* 顶栏右侧入口，与 back-header 同高；整条透明仅图标可点 */
	.rgnfc-bar {
		position: fixed;
		left: 0;
		right: 0;
		height: 90rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		padding-right: 30rpx;
		z-index: 1000;
		pointer-events: none;
	}
	.rgnfc-entry {
		pointer-events: auto;
		width: 76rpx;
		height: 76rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.rgnfc-entry-hover {
		background-color: rgba(17, 69, 152, 0.08);
	}
	.rgnfc-entry-glyph {
		width: 52rpx;
		height: 52rpx;
		background-repeat: no-repeat;
		background-size: contain;
		background-position: center;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' fill='none' stroke='%23373737' stroke-width='64' stroke-linecap='round'%3E%3Cpath d='M288 112h448a96 96 0 0 1 96 96v608a96 96 0 0 1-96 96H288a96 96 0 0 1-96-96V208a96 96 0 0 1 96-96z'/%3E%3Cpath d='M500 388a176 176 0 0 1 0 248'/%3E%3Cpath d='M588 316a284 284 0 0 1 0 392'/%3E%3Ccircle cx='420' cy='512' r='40' fill='%23373737' stroke='none'/%3E%3C/svg%3E");
	}

	/* 模态框 */
	.rgnfc-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(16, 22, 32, 0.55);
		z-index: 1001;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	/* 模态框面板（浅色底，与卡面灰色形成差异） */
	.rgnfc-panel {
		width: 620rpx;
		background-color: #f2f4f8;
		border-radius: 36rpx;
		padding: 44rpx 40rpx 40rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	/* 动态描边环：紧贴卡片四周 */
	.rgnfc-ring {
		padding: 6rpx;
		border-radius: 30rpx;
		/* background 由 ringStyle 动态给出 */
	}
	/* 公交卡比例卡片（86:54 ≈ 1.59） */
	.rgnfc-card {
		position: relative;
		width: 528rpx;
		height: 332rpx;
		border-radius: 24rpx;
		background-color: #d4d9e2;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.rgnfc-glyph {
		width: 130rpx;
		height: 130rpx;
		background-repeat: no-repeat;
		background-size: contain;
		background-position: center;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' fill='none' stroke='%23114598' stroke-width='64' stroke-linecap='round'%3E%3Cpath d='M288 112h448a96 96 0 0 1 96 96v608a96 96 0 0 1-96 96H288a96 96 0 0 1-96-96V208a96 96 0 0 1 96-96z'/%3E%3Cpath d='M500 388a176 176 0 0 1 0 248'/%3E%3Cpath d='M588 316a284 284 0 0 1 0 392'/%3E%3Ccircle cx='420' cy='512' r='40' fill='%23114598' stroke='none'/%3E%3C/svg%3E");
	}
	.rgnfc-glyph-dim {
		opacity: 0.45;
	}
	.rgnfc-glyph-fail {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' fill='none' stroke='%23d03030' stroke-width='64' stroke-linecap='round'%3E%3Cpath d='M288 112h448a96 96 0 0 1 96 96v608a96 96 0 0 1-96 96H288a96 96 0 0 1-96-96V208a96 96 0 0 1 96-96z'/%3E%3Cpath d='M500 388a176 176 0 0 1 0 248'/%3E%3Cpath d='M588 316a284 284 0 0 1 0 392'/%3E%3Ccircle cx='420' cy='512' r='40' fill='%23d03030' stroke='none'/%3E%3C/svg%3E");
	}
	.rgnfc-tip-fail {
		color: #d03030;
	}
	.rgnfc-check {
		width: 120rpx;
		height: 120rpx;
		border-radius: 60rpx;
		background-color: #114598;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.rgnfc-check-t {
		color: #ffffff;
		font-size: 72rpx;
		font-weight: bold;
	}
	.rgnfc-tip {
		margin-top: 36rpx;
		font-size: 32rpx;
		color: #3b4351;
		font-weight: 600;
		text-align: center;
	}
	.rgnfc-tip-ok {
		color: #114598;
	}
	.rgnfc-btn {
		margin-top: 28rpx;
		padding: 14rpx 60rpx;
		border-radius: 40rpx;
		background-color: #114598;
	}
	.rgnfc-btn-hover {
		opacity: 0.85;
	}
	.rgnfc-btn-t {
		color: #ffffff;
		font-size: 28rpx;
	}
	/* 卡片左下角品牌 */
	.rgnfc-brand {
		position: absolute;
		left: 30rpx;
		bottom: 22rpx;
		font-size: 28rpx;
		font-weight: bold;
		color: #8b929d;
	}
</style>
