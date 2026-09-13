<template>
	<view class="ux-bg-grey5" style="min-height: 100vh; position: relative;">
		<back-header></back-header>

		<uni-popup ref="reset_oobe_dialog" type="dialog">
			<uni-popup-dialog cancelText="取消" confirmText="确定" title="提示" :content="`您确定要销毁设置吗？这将重启程序并跳转到OOBE页面.`"
				@confirm="confirmResetOobe"></uni-popup-dialog>
		</uni-popup>

		<view class="ux-padding" style="padding-top: 0px;">
			<text class="ux-h2">关于</text>
		</view>
		<view class="ux-padding">
			<view class="ux-flex ux-space-around">
				<view class="app-card-tab" :style="'background:' + appCardColor + ';border-top-left-radius:10rpx; border-bottom-left-radius:10rpx;'">
					&nbsp;&nbsp;
				</view>
				<view class="ux-padding ux-bg-white" style="width:99999rpx;">
					<view class="ux-flex ux-align-items-center">
						<view>
							<image src="@/static/index-logo.png" mode="widthFix" style="width:300rpx;"></image>
						</view>
						<view class="ux-pl">
							<text class="ux-bold app-card-ver" :style="'color:' + appCardColor">v{{ appVersion }}</text>
							<br>
							<text>Build {{ appVersionCode }}</text>
							<!--
										<view class="ux-flex ux-align-items-center">
											<image class="ux-box-shadow ux-border-radius-large" :src="logoSrc"
												style="width: 140rpx; height: 140rpx;"
												@click="onLogoClick"
												@longpress="onLogoLongPress"></image><br />
											<view class="ux-pl">
												<text class="ux-bold ux-h4">RailGo</text>
												<br>
												<text style="font-size: 12px; color: grey;" @click="add">Version {{version}}</text><br>
											</view>
						-->
						</view>
					</view>


				</view>
				<view class="app-card-tab" :style="'background:' + appCardColor + ';border-top-right-radius:10rpx; border-bottom-right-radius:10rpx;'">
					&nbsp;&nbsp;</view>
			</view>

			<view class="ux-bg-grey5">
				<uni-section title="设置" type="line" style="background-color: transparent;"
					title-font-size="28rpx"></uni-section>
				<view class="ux-th ux-bg-white ux-border-radius-large ux-padding">
					<text>优先查询模式</text>
					<view class="ux-flex ux-rows ux-wrap ux-space-between ux-mt-small">
						<view class="ux-th ux-border-radius-large ux-padding ux-mr-small" style="flex:auto;width:1rpx;"
							:style="modeDisplayOnline" @click="changeConfigBox({detail:{value:'ONLINE'}},'mode')">
							<text class="ux-text">在线模式</text>
							<br>
							<text class="ux-text-small ux-opacity-8">最新，无网络下不可用，数据可能缺失。</text>
							<br><br>
							<view class="ux-text-right">
								<radio :checked="this.config.mode == 'ONLINE'" active-background-color="#114598"
									active-border-color="#114598"
									@click="changeConfigBox({detail:{value:'ONLINE'}},'mode')"></radio>
							</view>
						</view>
						<view class="ux-th ux-border-radius-large ux-padding ux-ml-small" style="flex:auto;width:1rpx;"
							:style="modeDisplayLocal" @click="changeConfigBox({detail:{value:'LOCAL'}},'mode')">
							<text class="ux-text">离线模式</text>
							<br>
							<text class="ux-text-small ux-opacity-8">最全，随时可以使用，更新较缓。</text>
							<br><br>
							<view class="ux-text-right ux-mr-small">
								<radio :checked="this.config.mode == 'LOCAL'" active-background-color="#114598"
									active-border-color="#114598"
									@click="changeConfigBox({detail:{value:'LOCAL'}},'mode')"></radio>
							</view>
						</view>
					</view>
					<uv-divider></uv-divider>
					<view hover-class="ux-tap" @click="goIndividuation">
						<view class="ux-flex ux-space-between ux-align-items-center">
							<view>
								<text>个性化</text>
								<br>
								<text class="ux-text-small ux-color-grey1">主页风格、应用图标等外观设置。</text>
							</view>
							<text class="icon ux-color-grey1">&#xe5c8;</text>
						</view>
					</view>
					<uv-divider></uv-divider>
					<view hover-class="ux-tap" @click="goSource">
						<view class="ux-flex ux-space-between ux-align-items-center">
							<view>
								<text>服务源</text>
								<br>
								<text class="ux-text-small ux-color-grey1">高级设置，正常情况下无须修改。</text>
							</view>
							<text class="icon ux-color-grey1">&#xe5c8;</text>
						</view>
					</view>
				</view>
				<uni-section title="相关信息" type="line" style="background-color: transparent;"
					title-font-size="28rpx"></uni-section>
				<navigator url="/pages/about/eula" class="ux-th ux-bg-white ux-border-radius-large ux-padding">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-small">使用协议</text>
						<text class="ux-text-small ux-color-grey1"><text class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>
				<navigator url="/pages/about/privacy"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-small">隐私政策</text>
						<text class="ux-text-small ux-color-grey1"><text class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>
				<navigator url="/pages/about/member"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-small">鸣谢</text>
						<text class="ux-text-small ux-color-grey1"><text class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>
				<navigator url="/pages/about/friend"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-small">伙伴应用</text>
						<text class="ux-text-small ux-color-grey1"><text class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>
				<navigator url="/pages/about/sponsor"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-left ux-text-small">赞助</text>
						<text class="ux-text-right ux-text-small ux-color-grey1"><text
								class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>
				<navigator url="/pages/about/UpdateInfo"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-left ux-text-small">更新日志</text>
						<text class="ux-text-right ux-text-small ux-color-grey1"><text
								class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>
				<!-- #ifdef APP-PLUS -->
				<navigator url="/pages/update/db"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-left ux-text-small">更新</text>
						<text class="ux-text-right ux-text-small ux-color-grey1"><text
								class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>
				<!-- #endif -->
				<!--
				<navigator v-if="count >= 10" url="/pages/about/egg"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-left ux-text-small">达速跨越北京北站！</text>
						<text class="ux-text-right ux-text-small ux-color-grey1"><text
								class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>
				-->
			</view>

			<view style="margin-top: 50rpx; text-align: center;">
				<text class="ux-color-grey2" style="font-size: 23rpx;">赣ICP备2023000786号-2A</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		uniGet
	} from "@/scripts/req";

	// 读取 App 版本信息：getAppBaseInfo（uni-app 3.4.13+）优先，回退 getSystemInfoSync
	function readAppVersion() {
		try {
			const info = (typeof uni.getAppBaseInfo === 'function') ?
				uni.getAppBaseInfo() : uni.getSystemInfoSync();
			return {
				appVersion: info.appVersion || '',
				appVersionCode: info.appVersionCode || ''
			};
		} catch (e) {
			return {
				appVersion: '',
				appVersionCode: ''
			};
		}
	}

	export default {
		data() {
			const appVer = readAppVersion();
			return {
				appVersion: appVer.appVersion,
				appVersionCode: appVer.appVersionCode,
				count: 0,
				version: uni.getStorageSync("versionText"),
				offline: uni.getStorageSync("offlineDataVersionText"),
				error: uni.getStorageSync("DBerror"),
				qq: '',
				key: '',
				nowIcon: uni.getStorageSync("nowIcon") || 'crh',
				config: {
					mode: "LOCAL"
				},
				sources: {},
			};
		},
		computed: {
			logoSrc() {
				return `/static/icons/rg-${this.nowIcon}.png`;
			},
			// 顶部应用卡片配色：在线模式主题蓝，离线模式金色
			appCardColor: function() {
				return this.config.mode == 'ONLINE' ? '#114598' : '#eeba67';
			},
			modeDisplayOnline: function() {
				return 'border: 2rpx solid' + (this.config.mode == "ONLINE" ? '#114598;' : '#f5f7f8;');
			},
			modeDisplayLocal: function() {
				return 'border: 2rpx solid' + (this.config.mode == "LOCAL" ? '#114598;' : '#f5f7f8;');
			}
		},
		onShow() {
			// #ifdef APP
			plus.navigator.setStatusBarBackground('#114598');
			// #endif

			this.qq = uni.getStorageSync('qq');
			this.key = uni.getStorageSync('key');
			this.nowIcon = uni.getStorageSync("nowIcon") || 'crh';
			// 唯一数据源：独立 mode 键（'network'/'local'），不再依赖 config 对象
			const storedMode = uni.getStorageSync("mode");
			this.config.mode = storedMode === 'network' ? 'ONLINE' : 'LOCAL';

			this.fetchSources();
		},
		methods: {
			fetchSources: async function() {
				try {
					const resp = await uniGet('https://gateway.zenglingkun.cn/api/v2/service_endpoints');
					if (resp && resp.data && Array.isArray(resp.data)) {
						this.sources["main_v1"] = resp.data[0].train;
						this.sources["main_v2"] = resp.data[1].train_v2;
						this.sources["gateway"] = resp.data[13].notice;
						this.sources["resource"] = resp.data[14].tp;
					}
				} catch (e) {
					console.error('获取服务端点失败:', e);
				}
			},
			add: function() {
				this.count += 1
			},
			onLogoClick: function() {
				this.iconClickCount += 1;
				console.log('Icon 点击次数:', this.iconClickCount);
			},
			onLogoLongPress: function() {
				console.log('Icon 长按，当前点击次数:', this.iconClickCount);
				if (this.iconClickCount >= 3) {
					// 点击次数达到3次，显示警告提示
					uni.showToast({
						title: '本页面信息供开发者优化，请不要将本页信息发给你不信任的人',
						duration: 3000,
						position: 'bottom'
					});

					// 延迟跳转到 Debug 页面
					setTimeout(() => {
						uni.navigateTo({
							url: '/pages/debug/debug'
						});
					}, 500);
				}
				// 重置点击计数
				this.iconClickCount = 0;
			},
			resetOobe: function() {
				this.$refs.reset_oobe_dialog.open();
			},
			confirmResetOobe: function() {
				uni.setStorageSync("oobe", false);
				uni.reLaunch({
					url: '/pages/oobe/welcome'
				});
			},
			changeConfigBox: function(v, tag) {
				this.config[tag] = v.detail.value;
				// 统一写入独立 mode 键（查询链路 / OOBE / App.vue 均读此键）
				if (tag === 'mode') {
					uni.setStorageSync("mode", v.detail.value === 'ONLINE' ? 'network' : 'local');
				}
			},
			goIndividuation: function() {
				uni.navigateTo({
					url: '/pages/about/individuation'
				});
			},
			goSource: function() {
				uni.navigateTo({
					url: '/pages/about/source'
				});
			},
		}
	}
</script>

<style>
	/* 顶部应用卡片配色随模式动态过渡 */
	.app-card-tab {
		transition: background 0.8s ease;
	}
	.app-card-ver {
		transition: color 0.8s ease;
	}
</style>