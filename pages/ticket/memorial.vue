<template>
	<view class="ux-bg-grey5 page-container" style="min-height: 100vh;">
		<back-header></back-header>

		<!-- 头部标题区 -->
		<view class="ux-padding page-header-area" style="padding-top: 10rpx;">
			<view class="header-badge">RailGo Exclusive</view>
			<text class="ux-h2 page-title">专属纪念票</text>
			<text class="page-subtitle">定制您的专属铁路记忆，留下每一次出发的感动</text>
			<text class="page-subtitle">下方总览区仅用于核对信息，点击生成后会生成对应图片</text>
		</view>

		<!-- 预览区：未生成时为实时模拟票面，生成后展示接口返回的图片 -->
		<view class="ux-pl ux-pr preview-section">
			<!-- 实时模拟票面 -->
			<view v-if="!ticketUrl" class="ticket-mock">
				<view class="tm-watermark">总览区</view>
				<view class="tm-top">
					<view class="tm-station">
						<text class="tm-station-zh">{{ fromZh || '出发站' }}</text>
						<text class="tm-station-en consolas">{{ fromEn || 'DEPARTURE' }}</text>
					</view>
					<view class="tm-mid">
						<view class="tm-train consolas">{{ train || 'G—' }}</view>
						<view class="tm-arrow-wrap">
							<view class="tm-dot"></view>
							<view class="tm-line"></view>
							<text class="icon tm-arrow">&#xe5c8;</text>
						</view>
					</view>
					<view class="tm-station tm-station-right">
						<text class="tm-station-zh">{{ toZh || '到达站' }}</text>
						<text class="tm-station-en consolas">{{ toEn || 'ARRIVAL' }}</text>
					</view>
				</view>

				<view class="tm-grid">
					<view class="tm-cell">
						<text class="tm-label">年月日</text>
						<text class="tm-value consolas">{{ date || '—' }}</text>
					</view>
					<view class="tm-cell">
						<text class="tm-label">开车时间</text>
						<text class="tm-value consolas">{{ time || '—' }}</text>
					</view>
					<view class="tm-cell">
						<text class="tm-label">检票口</text>
						<text class="tm-value consolas">{{ checkGate || '—' }}</text>
					</view>
					<view class="tm-cell">
						<text class="tm-label">坐席类别</text>
						<text class="tm-value">{{ seatClass || '—' }}</text>
					</view>
					<view class="tm-cell">
						<text class="tm-label">车厢 · 座位</text>
						<text class="tm-value consolas">{{ coachSeatText }}</text>
					</view>
					<view class="tm-cell">
						<text class="tm-label">铺别</text>
						<text class="tm-value">{{ berthText }}</text>
					</view>
				</view>

				<view class="tm-cut">
					<view class="tm-notch tm-notch-left"></view>
					<view class="tm-notch tm-notch-right"></view>
				</view>

				<view class="tm-foot">
					<view class="tm-passenger">
						<text class="tm-name">{{ passenger || '乘车人姓名' }}</text>
						<text class="tm-id consolas">{{ documentId || '证件号码' }}</text>
					</view>
					<view class="tm-amount">
						<text class="tm-amount-num consolas">{{ amountText }}</text>
						<text class="tm-no consolas">{{ ticketNo || '—' }}</text>
					</view>
				</view>

				<view class="tm-strip">
					<text class="consolas">RailGo · MEMORIAL TICKET · FOR SOUVENIR ONLY</text>
				</view>
			</view>

			<!-- 生成结果 -->
			<block v-else>
				<view v-if="imageError" class="result-error">
					<text class="re-text">纪念票生成失败，请检查网络后重试</text>
					<text class="re-retry" @click="generate">点击重试</text>
				</view>
				<view v-else class="result-card shadow-card" :style="imgLoading ? 'min-height: 420rpx;' : ''">
					<image :key="requestSeq" :src="ticketUrl" mode="widthFix"
						style="width: 100%; display: block;" @load="onImgLoad" @error="onImgError"
						@click="previewImage"></image>
					<view v-if="imgLoading" class="result-loading">
						<view class="loading-spinner"></view>
						<text class="ux-text-small ux-color-grey2" style="margin-top: 16rpx;">正在生成纪念票…</text>
					</view>
				</view>
				<view class="action-row">
					<button class="action-btn" hover-class="ux-tap" @click="saveImage">保存图片</button>
					<button class="action-btn action-btn-solid" hover-class="ux-tap" @click="generate">重新生成</button>
				</view>
			</block>
		</view>

		<!-- 表单区域 -->
		<view class="ux-pl ux-pr form-area">
			<view class="form-card shadow-card">
				<!-- 区间与车次 -->
				<view class="form-group">
					<view class="group-title">
						<view class="group-bar"></view>
						<text class="group-text">区间与车次</text>
					</view>
					<view class="fg-grid">
						<view class="fg-field">
							<text class="fg-label">出发站 · 中文</text>
							<input class="fg-input" v-model="fromZh" placeholder="如：上海" placeholder-class="fg-ph"
								maxlength="20" />
						</view>
						<view class="fg-field">
							<text class="fg-label">出发站 · 英文</text>
							<input class="fg-input" v-model="fromEn" placeholder="如：Shanghai" placeholder-class="fg-ph"
								maxlength="30" />
						</view>
						<view class="fg-field">
							<text class="fg-label">到达站 · 中文</text>
							<input class="fg-input" v-model="toZh" placeholder="如：北京" placeholder-class="fg-ph"
								maxlength="20" />
						</view>
						<view class="fg-field">
							<text class="fg-label">到达站 · 英文</text>
							<input class="fg-input" v-model="toEn" placeholder="如：Beijing" placeholder-class="fg-ph"
								maxlength="30" />
						</view>
						<view class="fg-field">
							<text class="fg-label">检票口</text>
							<input class="fg-input" v-model="checkGate" placeholder="如：A12" placeholder-class="fg-ph"
								maxlength="10" />
						</view>
						<view class="fg-field">
							<text class="fg-label">车次号</text>
							<input class="fg-input" v-model="train" placeholder="如：G1234" placeholder-class="fg-ph"
								maxlength="10" @blur="formatTrain" />
						</view>
					</view>
				</view>

				<!-- 席位信息 -->
				<view class="form-group">
					<view class="group-title">
						<view class="group-bar"></view>
						<text class="group-text">席位信息</text>
					</view>
					<view class="fg-grid">
						<view class="fg-field">
							<text class="fg-label">金额（元）</text>
							<input class="fg-input" type="digit" v-model="amount" placeholder="如：600.0"
								placeholder-class="fg-ph" maxlength="10" @blur="formatAmount" />
						</view>
						<view class="fg-field">
							<text class="fg-label">坐席类别</text>
							<input class="fg-input" v-model="seatClass" placeholder="如：硬卧" placeholder-class="fg-ph"
								maxlength="12" />
						</view>
						<view class="fg-field">
							<text class="fg-label">车厢号</text>
							<input class="fg-input" v-model="coach" placeholder="如：09" placeholder-class="fg-ph"
								maxlength="5" />
						</view>
						<view class="fg-field">
							<text class="fg-label">座位号</text>
							<input class="fg-input" v-model="seat" placeholder="如：015" placeholder-class="fg-ph"
								maxlength="10" />
						</view>
						<view class="fg-field">
							<text class="fg-label">铺别</text>
							<picker :range="berthList" @change="onBerthChange">
								<view class="fg-input fg-picker">
									<text :class="berth ? 'fg-picker-val' : 'fg-ph'">{{ berth || '请选择铺别' }}</text>
									<text class="icon fg-chev">&#xe5c8;</text>
								</view>
							</picker>
						</view>
						<view class="fg-field">
							<text class="fg-label">完整票号</text>
							<input class="fg-input" v-model="ticketNo" placeholder=""
								placeholder-class="fg-ph" maxlength="32" />
						</view>
					</view>
				</view>

				<!-- 乘车信息 -->
				<view class="form-group">
					<view class="group-title">
						<view class="group-bar"></view>
						<text class="group-text">乘车信息</text>
					</view>
					<view class="fg-grid">
						<view class="fg-field">
							<text class="fg-label">年月日</text>
							<picker mode="date" :value="date" @change="onDateChange">
								<view class="fg-input fg-picker">
									<text class="fg-picker-val consolas">{{ date }}</text>
									<text class="icon fg-chev">&#xe5c8;</text>
								</view>
							</picker>
						</view>
						<view class="fg-field">
							<text class="fg-label">开车时间</text>
							<picker mode="time" :value="time" @change="onTimeChange">
								<view class="fg-input fg-picker">
									<text :class="time ? 'fg-picker-val consolas' : 'fg-ph'">{{ time || '选择时间' }}</text>
									<text class="icon fg-chev">&#xe5c8;</text>
								</view>
							</picker>
						</view>
						<view class="fg-field">
							<text class="fg-label">乘车人姓名</text>
							<input class="fg-input" v-model="passenger" placeholder="如：张三" placeholder-class="fg-ph"
								maxlength="30" />
						</view>
						<view class="fg-field">
							<text class="fg-label">乘车人证件号</text>
							<input class="fg-input" type="idcard" v-model="documentId" placeholder="请输入证件号码"
								placeholder-class="fg-ph" maxlength="25" />
						</view>
					</view>
				</view>
			</view><br>
			<button type="primary" style="background-color:#114598;color:#ffffff;" hover-class="ux-tap"
				@click="generate">生成专属纪念票</button>

			<text class="disclaimer">生成的纪念票仅供个人纪念使用，无任何效力</text>
		</view>

		<railgo-loader></railgo-loader>
	</view>
</template>

<script>
	import { showLoader, hideLoader } from "@/scripts/loader.js";
	import RailgoLoader from "@/components/railgo-loader/railgo-loader.vue";

	const TICKET_API = 'https://next.railgo.zenglingkun.cn/api/v2/ticket?ticket=';

	export default {
		components: {
			RailgoLoader
		},
		data() {
			return {
				fromZh: '',
				fromEn: '',
				toZh: '',
				toEn: '',
				checkGate: '',
				train: '',
				amount: '',
				seatClass: '',
				coach: '',
				seat: '',
				berth: '',
				berthList: ['上铺', '中铺', '下铺', '无'],
				ticketNo: '',
				date: '',
				time: '',
				passenger: '',
				documentId: '',
				ticketUrl: '',
				imgLoading: false,
				imageError: false,
				requestSeq: 0
			};
		},
		computed: {
			coachSeatText() {
				const c = String(this.coach || '').trim();
				const s = String(this.seat || '').trim();
				if (c && s) return c + ' 车 ' + s + ' 号';
				if (c) return c + ' 车';
				if (s) return s + ' 号';
				return '—';
			},
			berthText() {
				if (!this.berth || this.berth === '无') return '—';
				return this.berth;
			},
			amountText() {
				return this.amount === '' ? '—' : '¥' + this.amount;
			}
		},
		onLoad() {
			const d = new Date();
			const p2 = (n) => (n < 10 ? '0' + n : '' + n);
			this.date = d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
		},
		onShow() {
			// #ifdef APP-PLUS
			plus.navigator.setStatusBarBackground('#114598');
			// #endif
		},
		onUnload() {
			hideLoader();
		},
		methods: {
			formatAmount() {
				const v = String(this.amount == null ? '' : this.amount).trim();
				if (v === '') return;
				const n = parseFloat(v);
				if (isNaN(n) || n < 0) {
					this.amount = '';
					return;
				}
				this.amount = n.toFixed(1);
			},
			formatTrain() {
				this.train = String(this.train || '').trim().toUpperCase();
			},
			onBerthChange(e) {
				this.berth = this.berthList[Number(e.detail.value)] || '';
			},
			onDateChange(e) {
				this.date = e.detail.value || '';
			},
			onTimeChange(e) {
				this.time = e.detail.value || '';
			},
			validate() {
				this.formatAmount();
				this.formatTrain();
				const required = [
					['出发站（中文）', this.fromZh],
					['出发站（英文）', this.fromEn],
					['到达站（中文）', this.toZh],
					['到达站（英文）', this.toEn],
					['检票口', this.checkGate],
					['车次号', this.train],
					['金额', this.amount],
					['坐席类别', this.seatClass],
					['车厢号', this.coach],
					['座位号', this.seat],
					['完整票号', this.ticketNo],
					['年月日', this.date],
					['开车时间', this.time],
					['乘车人姓名', this.passenger],
					['乘车人证件号', this.documentId]
				];
				const missing = required.filter(([label, val]) => {
					if (label === '金额') return String(val).trim() === '' || isNaN(parseFloat(val));
					return String(val || '').trim() === '';
				}).map(([label]) => label);
				return missing;
			},
			buildPayload() {
				return {
					from: { zh: this.fromZh.trim(), en: this.fromEn.trim() },
					to: { zh: this.toZh.trim(), en: this.toEn.trim() },
					checkGate: this.checkGate.trim(),
					train: this.train.trim(),
					amount: parseFloat(this.amount),
					seatClass: this.seatClass.trim(),
					coach: this.coach.trim(),
					seat: this.seat.trim(),
					berth: this.berth === '无' ? '' : this.berth,
					ticketNo: this.ticketNo.trim(),
					date: this.date,
					time: this.time,
					passenger: this.passenger.trim(),
					documentId: this.documentId.trim()
				};
			},
			generate() {
				if (this.imgLoading) return;
				const missing = this.validate();
				if (missing.length > 0) {
					const tip = missing.length === 1 ? missing[0] : missing[0] + ' 等' + missing.length + '项';
					uni.showToast({ icon: 'none', title: '请填写：' + tip });
					return;
				}

				this.imageError = false;
				this.imgLoading = true;
				this.requestSeq++;
				this.ticketUrl = TICKET_API + encodeURIComponent(JSON.stringify(this.buildPayload()));
				showLoader('正在生成纪念票...');

				this.$nextTick(() => {
					try {
						uni.pageScrollTo({ scrollTop: 0, duration: 260 });
					} catch (e) {}
				});
			},
			onImgLoad() {
				this.imgLoading = false;
				hideLoader();
			},
			onImgError() {
				this.imgLoading = false;
				this.imageError = true;
				hideLoader();
			},
			previewImage() {
				if (!this.ticketUrl || this.imageError || this.imgLoading) return;
				try {
					uni.previewImage({ urls: [this.ticketUrl] });
				} catch (e) {}
			},
			saveImage() {
				showLoader('正在保存...');
				uni.downloadFile({
					url: this.ticketUrl,
					success: (res) => {
						if (res.statusCode === 200) {
							this.saveImageToAlbum(res.tempFilePath);
						} else {
							hideLoader();
							uni.showToast({ title: '下载失败', icon: 'none' });
						}
					},
					fail: (err) => {
						hideLoader();
						console.error('下载纪念票失败:', err);
						uni.showToast({ title: '下载失败，请检查网络', icon: 'none' });
					}
				});
			},
			// 与交路图导出保存一致：运行时判平台，web 端改用浏览器下载
			saveImageToAlbum(filePath) {
				if (String(uni.getSystemInfoSync().uniPlatform || '').indexOf('web') === 0) {
					hideLoader();
					this.downloadInBrowser(filePath);
					return;
				}
				uni.saveImageToPhotosAlbum({
					filePath,
					success: () => {
						uni.showToast({ title: '已保存到相册', icon: 'none' });
					},
					fail: (e) => {
						console.error('纪念票保存失败', e);
						uni.showToast({ title: '保存到相册失败', icon: 'none' });
					},
					complete: () => {
						hideLoader();
					}
				});
			},
			downloadInBrowser(href) {
				const link = document.createElement('a');
				link.href = href;
				link.download = (this.train || 'RailGo') + ' 纪念票.png';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				uni.showToast({ title: '已开始下载', icon: 'none' });
			}
		}
	};
</script>

<style scoped>
	.page-container {
		padding-bottom: 80rpx;
	}

	.page-header-area {
		padding-bottom: 24rpx;
	}

	.header-badge {
		display: inline-block;
		font-size: 20rpx;
		font-weight: 600;
		color: #114598;
		background: rgba(17, 69, 152, 0.08);
		padding: 4rpx 14rpx;
		border-radius: 999rpx;
		margin-bottom: 8rpx;
		letter-spacing: 1rpx;
	}

	.page-title {
		display: block;
		font-size: 42rpx;
		font-weight: bold;
		color: #1a202c;
	}

	.page-subtitle {
		display: block;
		font-size: 24rpx;
		color: #718096;
		margin-top: 6rpx;
	}

	.shadow-card {
		box-shadow: 0 10rpx 30rpx -6rpx rgba(17, 69, 152, 0.08), 0 4rpx 12rpx -2rpx rgba(0, 0, 0, 0.03);
	}

	/* 实时模拟票面 */
	.ticket-mock {
		position: relative;
		background: linear-gradient(135deg, #ffffff 0%, #fcfdfd 100%);
		border-radius: 24rpx;
		overflow: hidden;
		border: 1px solid rgba(226, 232, 240, 0.8);
		box-shadow: 0 12rpx 32rpx rgba(17, 69, 152, 0.08);
	}

	.tm-watermark {
		position: absolute;
		right: 30rpx;
		bottom: 90rpx;
		font-size: 110rpx;
		font-weight: 900;
		color: rgba(17, 69, 152, 0.03);
		pointer-events: none;
		letter-spacing: 10rpx;
	}

	.tm-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 40rpx 36rpx 16rpx;
	}

	.tm-station {
		display: flex;
		flex-direction: column;
		max-width: 40%;
	}

	.tm-station-right {
		align-items: flex-end;
	}

	.tm-station-zh {
		font-size: 44rpx;
		font-weight: 800;
		color: #1a202c;
		line-height: 1.2;
	}

	.tm-station-en {
		font-size: 22rpx;
		color: #a0aec0;
		letter-spacing: 1.5rpx;
		margin-top: 6rpx;
	}

	.tm-mid {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.tm-train {
		font-size: 28rpx;
		font-weight: 700;
		color: #114598;
		background: rgba(17, 69, 152, 0.06);
		border-radius: 999rpx;
		padding: 6rpx 24rpx;
	}

	.tm-arrow-wrap {
		display: flex;
		align-items: center;
		margin-top: 12rpx;
	}

	.tm-dot {
		width: 6rpx;
		height: 6rpx;
		border-radius: 50%;
		background: #cbd5e0;
	}

	.tm-line {
		width: 40rpx;
		height: 2rpx;
		background: #cbd5e0;
	}

	.tm-arrow {
		font-size: 24rpx;
		color: #cbd5e0;
		margin-left: 4rpx;
	}

	.tm-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 8rpx 36rpx 28rpx;
	}

	.tm-cell {
		width: 33.33%;
		margin-top: 22rpx;
		display: flex;
		flex-direction: column;
	}

	.tm-label {
		font-size: 20rpx;
		color: #a0aec0;
		margin-bottom: 6rpx;
	}

	.tm-value {
		font-size: 26rpx;
		font-weight: 600;
		color: #2d3748;
	}

	.tm-cut {
		position: relative;
		margin: 0 36rpx;
		border-top: 2rpx dashed #cbd5e0;
	}

	.tm-notch {
		position: absolute;
		top: -19rpx;
		width: 38rpx;
		height: 38rpx;
		border-radius: 50%;
		background: #f4f6f8;
	}

	.tm-notch-left {
		left: -55rpx;
	}

	.tm-notch-right {
		right: -55rpx;
	}

	.tm-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 36rpx 32rpx;
	}

	.tm-passenger {
		display: flex;
		flex-direction: column;
		max-width: 55%;
	}

	.tm-name {
		font-size: 32rpx;
		font-weight: 700;
		color: #1a202c;
	}

	.tm-id {
		font-size: 22rpx;
		color: #a0aec0;
		margin-top: 6rpx;
		letter-spacing: 1rpx;
	}

	.tm-amount {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.tm-amount-num {
		font-size: 40rpx;
		font-weight: 800;
		color: #114598;
		line-height: 1.2;
	}

	.tm-no {
		font-size: 20rpx;
		color: #a0aec0;
		margin-top: 6rpx;
	}

	.tm-strip {
		background: linear-gradient(90deg, #114598 0%, #1a5ac8 100%);
		padding: 14rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tm-strip text {
		font-size: 20rpx;
		color: rgba(255, 255, 255, 0.9);
		letter-spacing: 3rpx;
	}

	/* 生成结果 */
	.result-card {
		position: relative;
		background: #ffffff;
		border-radius: 24rpx;
		overflow: hidden;
	}

	.result-loading {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.92);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.loading-spinner {
		width: 48rpx;
		height: 48rpx;
		border: 4rpx solid rgba(17, 69, 152, 0.15);
		border-top-color: #114598;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.result-error {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 70rpx 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		border: 1px solid rgba(231, 76, 60, 0.2);
	}

	.re-text {
		font-size: 26rpx;
		color: #e74c3c;
	}

	.re-retry {
		font-size: 26rpx;
		color: #114598;
		text-decoration: underline;
		margin-top: 24rpx;
		font-weight: 500;
	}

	.action-row {
		display: flex;
		gap: 20rpx;
		margin-top: 24rpx;
	}

	.action-btn {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		margin: 0;
		padding: 0;
		font-size: 28rpx;
		font-weight: 600;
		border-radius: 16rpx;
		background: #ffffff;
		color: #114598;
		border: 2rpx solid rgba(17, 69, 152, 0.3);
	}

	.action-btn::after {
		border: none;
	}

	.action-btn-solid {
		background: linear-gradient(135deg, #114598 0%, #1a5ac8 100%);
		color: #ffffff;
		border-color: transparent;
		box-shadow: 0 6rpx 16rpx rgba(17, 69, 152, 0.25);
	}

	/* 表单区域 */
	.form-area {
		margin-top: 36rpx;
	}

	.form-card {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx 32rpx;
	}

	.form-group+.form-group {
		margin-top: 48rpx;
		padding-top: 36rpx;
		border-top: 1px solid #f1f5f9;
	}

	.group-title {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.group-bar {
		width: 8rpx;
		height: 32rpx;
		border-radius: 4rpx;
		background: #114598;
		margin-right: 16rpx;
	}

	.group-text {
		font-size: 30rpx;
		font-weight: 700;
		color: #1a202c;
	}

	.fg-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.fg-field {
		width: 48%;
		margin-top: 24rpx;
	}

	.fg-label {
		display: block;
		font-size: 22rpx;
		font-weight: 600;
		color: #718096;
		margin-bottom: 10rpx;
		letter-spacing: 0.5rpx;
	}

	.fg-input {
		width: 100%;
		box-sizing: border-box;
		height: 80rpx;
		line-height: 80rpx;
		padding: 0 24rpx;
		background: #f8fafc;
		border: 2rpx solid #e2e8f0;
		border-radius: 14rpx;
		font-size: 26rpx;
		color: #2d3748;
		transition: all 0.2s;
	}

	.fg-input:focus-within {
		background: #ffffff;
		border-color: #114598;
		box-shadow: 0 0 0 4rpx rgba(17, 69, 152, 0.08);
	}

	.fg-ph {
		color: #cbd5e0;
		font-size: 26rpx;
	}

	.fg-picker {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		line-height: normal;
	}

	.fg-picker-val {
		font-size: 26rpx;
		color: #2d3748;
	}

	.fg-chev {
		font-size: 30rpx;
		color: #a0aec0;
	}

	.generate-btn {
		margin-top: 40rpx;
		height: 96rpx;
		line-height: 96rpx;
		background: linear-gradient(135deg, #114598 0%, #1a5ac8 100%);
		color: #ffffff;
		font-size: 32rpx;
		font-weight: 700;
		border-radius: 18rpx;
		box-shadow: 0 10rpx 24rpx rgba(17, 69, 152, 0.25);
	}

	.generate-btn::after {
		border: none;
	}

	.disclaimer {
		display: block;
		text-align: center;
		margin-top: 26rpx;
		font-size: 22rpx;
		color: #a0aec0;
	}
</style>