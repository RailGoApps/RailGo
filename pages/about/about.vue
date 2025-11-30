<template>
	<view class="ux-bg-grey5" style="height: 100vh; position: relative;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<uni-popup ref="reset_oobe_dialog" type="dialog">
			<uni-popup-dialog cancelText="取消" confirmText="确定" title="提示" :content="`您确定要销毁设置吗？这将重启程序并跳转到OOBE页面.`"
				@confirm="confirmResetOobe"></uni-popup-dialog>
		</uni-popup>

		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">关于</text>
		</view>
		<view class="ux-padding">
			<view class="ux-bg-white ux-border-radius-large ux-padding">
				<view class="ux-flex ux-align-items-center">
					<image class="ux-box-shadow ux-border-radius-large" :src="logoSrc"
						style="width: 140rpx; height: 140rpx;"></image><br />
					<view class="ux-pl">
						<text class="ux-bold ux-h4">RailGo</text>
						<br>
						<text style="font-size: 12px; color: grey;" @click="add">Version {{version}}</text><br>
					</view>
				</view>
				<uv-divider></uv-divider>
				<text style="font-size: 12px; color: grey;">离线数据版本 {{offline}}</text><br>
				<text style="font-size: 12px; color: red;">{{error}}</text>
			</view>

			<view class="ux-bg-grey5">
<!-- 				<view
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-flex ux-space-between ux-padding ux-mt-small">
					<text class="ux-text-left ux-text-small">QQ交流群</text>
					<text class="ux-text-right ux-text-small ux-color-grey1">652032716</text>
				</view>
				<view
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-flex ux-space-between ux-padding ux-mt-small">
					<text class="ux-text-left ux-text-small">开源协议</text>
					<text class="ux-text-right ux-text-small ux-color-grey1">MIT</text>
				</view> -->
				<navigator url="/pages/about/eula"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-small">使用协议</text>
						<text class="ux-text-small ux-color-grey1"><text class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>
				<navigator url="/pages/about/privacy"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-small">隐私政策</text>
						<text class="ux-text-small ux-color-grey1"><text class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>
				<!-- #ifdef APP -->
				<navigator url="/pages/about/individuation"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-left ux-text-small">个性化</text>
						<text class="ux-text-right ux-text-small ux-color-grey1"><text
								class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>
				<!-- #endif -->
				<!-- #ifdef APP -->
				<navigator url="/pages/about/mode"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-left ux-text-small">更改模式</text>
						<text class="ux-text-right ux-text-small ux-color-grey1"><text
								class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>				
				<!-- #endif -->
				<view @click="resetOobe"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-left ux-text-small">重置</text>
						<text class="ux-text-right ux-text-small ux-color-grey1"><text
								class="icon">&#xe5c8;</text></text>
					</view>
				</view>
				<navigator url="/pages/about/member"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-small">鸣谢</text>
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
				<!-- #ifdef APP -->
				<navigator url="/pages/update/db"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-left ux-text-small">更新</text>
						<text class="ux-text-right ux-text-small ux-color-grey1"><text
								class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>				
				<!-- #endif -->
				<navigator v-if="count >= 10" url="/pages/about/egg"
					class="ux-th ux-bg-white ux-border-radius-large ux-padding ux-mt-small">
					<view class="ux-flex ux-space-between">
						<text class="ux-text-left ux-text-small">达速跨越北京北站！</text>
						<text class="ux-text-right ux-text-small ux-color-grey1"><text
								class="icon">&#xe5c8;</text></text>
					</view>
				</navigator>
			</view>

			<view style="margin-top: 50rpx; text-align: center;">
				<text class="ux-color-grey2" style="font-size: 23rpx;">赣ICP备2023000786号-2A</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				count: 0,
				version: uni.getStorageSync("versionText"),
				offline: uni.getStorageSync("offlineDataVersionText"),
				error: uni.getStorageSync("DBerror"),
				qq: '',
				key: '',
				nowIcon: uni.getStorageSync("nowIcon") || 'crh'
			};
		},
		computed: {
			logoSrc() {
				return `/static/icons/rg-${this.nowIcon}.png`;
			}
		},
		onShow() {
			// #ifdef APP
			plus.navigator.setStatusBarBackground('#114598');
			// #endif
			
			this.qq = uni.getStorageSync('qq');
			this.key = uni.getStorageSync('key');
			this.nowIcon = uni.getStorageSync("nowIcon") || 'crh';
		},
		methods: {
			back: function() {
				uni.navigateBack()
			},
			add: function() {
				this.count += 1
			},
			resetOobe: function() {
				this.$refs.reset_oobe_dialog.open();
			},
			confirmResetOobe: function() {
				uni.setStorageSync("oobe", false);
				uni.reLaunch({
					url: '/pages/oobe/welcome'
				});
			}
		}
	}
</script>

<style>
</style>