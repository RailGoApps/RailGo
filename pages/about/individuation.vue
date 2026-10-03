<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<back-header></back-header>
		<view class="ux-padding" style="padding-top: 0px;">
			<text class="ux-h2">个性化</text>
			<!-- #ifdef APP-IOS -->
			<view style="margin-top: 5rpx;">
				<text class="ux-color-grey3" style="font-size: 22rpx;">Apple端暂仅支持修改应用内的图标。</text>
			</view>
			<!-- #endif -->
		</view>
		<view class="ux-pl ux-pr">
			<uni-section type="line" style="background-color: transparent;" title-font-size="35rpx" title="图标"></uni-section>
			
			<view class="icon-flex-container">
				<view class="icon-item">
					<image mode="scaleToFill" src="/static/icons/rg-crh.png"></image>
					<text class="icon-text">CRH</text>
					<button class="ux-btn" @click="selectIcon('crh')" :disabled="nowIcon === 'crh'">
						{{ nowIcon === 'crh' ? '已使用' : '使用' }}
					</button>
				</view>

				<!-- #ifndef APP-HARMONY -->
				<view class="icon-item">
					<image mode="scaleToFill" src="/static/icons/rg-red.png"></image>
					<text class="icon-text">红神龙</text>
					<button class="ux-btn" @click="selectIcon('red')" :disabled="nowIcon === 'red'">
						{{ nowIcon === 'red' ? '已使用' : '使用' }}
					</button>
				</view>

				<view class="icon-item">
					<image mode="scaleToFill" src="/static/icons/rg-gold.png"></image>
					<text class="icon-text">金凤凰</text>
					<button class="ux-btn" @click="selectIcon('gold')" :disabled="nowIcon === 'gold'">
						{{ nowIcon === 'gold' ? '已使用' : '使用' }}
					</button>
				</view>

				<view class="icon-item">
					<image mode="scaleToFill" :src="'/static/icons/rg-green.png'"
						:class="{'grayscale': !cr200jUnlock && !greenUnlock}" @click="showIconHelp('立及甬', 'greenUnlock')"></image>
					<text class="icon-text">立及甬</text>
					<button class="ux-btn" :disabled="!(cr200jUnlock || greenUnlock) || nowIcon === 'green'" @click="selectIcon('green')">
						{{ nowIcon === 'green' ? '已使用' : ((cr200jUnlock || greenUnlock) ? '使用' : '未解锁') }}
					</button>
				</view>

				<view class="icon-item">
					<image mode="scaleToFill" :src="'/static/icons/rg-purple.png'"
						:class="{'grayscale': !searchUnlock1 && !purpleUnlock}" @click="showIconHelp('大茄子', 'purpleUnlock')"></image>
					<text class="icon-text">大茄子</text>
					<button class="ux-btn" :disabled="!(searchUnlock1 || purpleUnlock) || nowIcon === 'purple'" @click="selectIcon('purple')">
						{{ nowIcon === 'purple' ? '已使用' : ((searchUnlock1 || purpleUnlock) ? '使用' : '未解锁') }}
					</button>
				</view>
				<!-- #endif -->

				<view class="icon-item">
					<image mode="scaleToFill" src="/static/icons/rg-first.png"
						:class="{'grayscale': !firstAnniversaryUnlock}" @click="showIconHelp('周年庆', 'firstAnniversaryUnlock')"></image>
					<text class="icon-text">周年庆</text>
					<button class="ux-btn" :disabled="!firstAnniversaryUnlock || nowIcon === 'first'" @click="selectIcon('first')">
						{{ nowIcon === 'first' ? '已使用' : (firstAnniversaryUnlock ? '使用' : '未解锁') }}
					</button>
				</view>

				<view class="icon-item">
					<image mode="scaleToFill" src="/static/icons/rg-girl.png" :class="{'grayscale': !girlUnlock && !railgoGirlUnlock}" @click="showGirlHelp"></image>
					<text class="icon-text">露星</text>
					<button class="ux-btn" @click="selectIcon('girl')" :disabled="!(girlUnlock || railgoGirlUnlock) || nowIcon === 'girl'">
						{{ nowIcon === 'girl' ? '已使用' : ((girlUnlock || railgoGirlUnlock) ? '使用' : '未解锁') }}
					</button>
				</view>

				<view class="icon-item">
					<image mode="scaleToFill" :src="'/static/icons/rg-passion.png'"
						:class="{'grayscale': !searchUnlock2 && !passionUnlock}" @click="showIconHelp('百香果', 'passionUnlock')"></image>
					<text class="icon-text">百香果</text>
					<button class="ux-btn" :disabled="!(searchUnlock2 || passionUnlock) || nowIcon === 'passion'" @click="selectIcon('passion')">
						{{ nowIcon === 'passion' ? '已使用' : ((searchUnlock2 || passionUnlock) ? '使用' : '未解锁') }}
					</button>
				</view>
			</view>
		</view>

		<view class="ux-pl ux-pr">
			<uni-section type="line" style="background-color: transparent;" title-font-size="35rpx" title="主页风格"></uni-section>
			<view class="icon-flex-container">
				<view class="icon-item" v-for="s in homeStyles" :key="s.key">
					<view class="style-preview" :class="{ 'style-preview--active': nowIndexStyle === s.key }" @click="selectIndexStyle(s.key)">
						<!-- 线路图缩略图 -->
						<view v-if="s.key === 'rail'">
							<view class="preview-rail-line"></view>
							<view class="preview-rail-block preview-rail-block--l" style="top: 20rpx;"></view>
							<view class="preview-rail-block preview-rail-block--r" style="top: 56rpx;"></view>
							<view class="preview-rail-block preview-rail-block--l" style="top: 92rpx;"></view>
						</view>
						<!-- 大卡缩略图 -->
						<view v-else-if="s.key === 'card'" class="preview-card">
							<view class="preview-card-cell"></view>
							<view class="preview-card-cell"></view>
							<view class="preview-card-cell"></view>
							<view class="preview-card-cell"></view>
						</view>
						<!-- 渐变卡片缩略图 -->
						<view v-else class="preview-bento">
							<view class="preview-bento-grad"></view>
							<view class="preview-bento-hero"></view>
							<view class="preview-bento-row">
								<view class="preview-bento-cell"></view>
								<view class="preview-bento-cell"></view>
							</view>
						</view>
					</view>
					<text class="icon-text">{{ s.name }}</text>
					<button class="ux-btn" :disabled="nowIndexStyle === s.key" @click="selectIndexStyle(s.key)">
						{{ nowIndexStyle === s.key ? '已使用' : '使用' }}
					</button>
				</view>
			</view>
		</view>
		
		<view class="ux-pl ux-pr">
			<uni-section type="line" style="background-color: transparent;" title-font-size="35rpx" title="加载动画"></uni-section>
			<view class="icon-flex-container">
				<view class="icon-item" v-for="s in loaderStyles" :key="s.key">
					<view class="style-preview" :class="{ 'style-preview--active': nowLoaderStyle === s.key }" @click="selectLoaderStyle(s.key)">
						<!-- 智动旋转：旋转三环抱 logo -->
						<view v-if="s.key === 'zn'" class="preview-loader-zn">
							<view class="preview-loader-ring"></view>
							<view class="preview-loader-arc preview-loader-arc--1"></view>
							<view class="preview-loader-arc preview-loader-arc--2"></view>
							<view class="preview-loader-logo"></view>
						</view>
						<!-- 水波纹：标志自底部逐渐填满 -->
						<view v-else class="preview-loader-wave">
							<view class="preview-loader-box">
								<view class="preview-loader-water"></view>
							</view>
						</view>
					</view>
					<text class="icon-text">{{ s.name }}</text>
					<button class="ux-btn" :disabled="nowLoaderStyle === s.key" @click="selectLoaderStyle(s.key)">
						{{ nowLoaderStyle === s.key ? '已使用' : '使用' }}
					</button>
				</view>
			</view>
		</view>
		
		<view class="custom-modal-overlay" v-if="showCustomRedeemModal">
		    <view class="custom-modal-content">
		        <text class="modal-title">图标兑换</text>
		        <text class="modal-subtitle">请输入兑换码 CODE</text>
		        <input 
		            class="modal-input" 
		            type="text" 
		            v-model="redeemCodeInput" 
		            placeholder="在此输入兑换码..."
		        />
		        <view class="modal-buttons">
		            <button class="ux-btn modal-cancel-btn" @click="showCustomRedeemModal = false">取消</button>
		            <button class="ux-btn modal-confirm-btn" @click="handleCustomRedeemConfirm" :disabled="!redeemCodeInput.trim()">兑换</button>
		        </view>
		    </view>
		</view>
		<railgo-loader></railgo-loader>
	</view>
</template>

<script>
	// #ifdef APP-PLUS
	import { getSwitchList, switchIcons, restoreIcons } from "@/uni_modules/ima-icons";
	// #endif
	// #ifdef APP-HARMONY
	import "@/uni_modules/railgo-dynamic-icon";
	// #endif
import {uniGet} from "@/scripts/req.js"; 
import {showLoader, hideLoader} from "@/scripts/loader.js";
import RailgoLoader from "@/components/railgo-loader/railgo-loader.vue";

	export default {
		components: {
			RailgoLoader
		},
		data() {
			return {
				items: [],
				search: uni.getStorageSync("search"),
				nowIcon: uni.getStorageSync("nowIcon"),
				// 主页风格选择：rail(线路图) / card(经典大卡) / bento(渐变卡片)
				nowIndexStyle: uni.getStorageSync("indexStyle") || 'bento',
				homeStyles: [
					{ key: 'rail', name: '线路图' },
					{ key: 'card', name: '经典大卡' },
					{ key: 'bento', name: '渐变卡片' }
				],
				// 加载动画样式：zn(智动旋转) / wave(水波纹)
				nowLoaderStyle: uni.getStorageSync("loaderStyle") || 'zn',
				loaderStyles: [
					{ key: 'zn', name: '智动旋转' },
					{ key: 'wave', name: '水波纹' }
				],
							
				// 默认解锁状态 (通过原有方式)
				searchUnlock1: false, 
				searchUnlock2: false, 
				searchUnlock3: false, 
				girlUnlock: false, 
		
				greenUnlock: uni.getStorageSync("greenUnlock") || false, // 立及甬（兑换码）
				cr200jUnlock: uni.getStorageSync("cr200jUnlock") || false, // 立及甬（图鉴搜索CR200J）
				purpleUnlock: uni.getStorageSync("purpleUnlock") || false, // 大茄子
				passionUnlock: uni.getStorageSync("passionUnlock") || false, // 百香果
				railgoGirlUnlock: uni.getStorageSync("railgoGirlUnlock") || false, // 露星
				firstAnniversaryUnlock: uni.getStorageSync("firstAnniversaryUnlock") || false, // 周年庆
							
				dfh: uni.getStorageSync("dfh"), 
				tys: uni.getStorageSync("tys"), 
		
				// 兑换码自定义模态框状态
				showCustomRedeemModal: false, 
				redeemCodeInput: '', 
		
				// 兑换图标映射表
				exchangeIconsMap: [
					{ name: '立及甬', iconKey: 'green', storageKey: 'greenUnlock' },
					{ name: '大茄子', iconKey: 'purple', storageKey: 'purpleUnlock' },
					{ name: '百香果', iconKey: 'passion', storageKey: 'passionUnlock' },
					{ name: '露星', iconKey: 'girl', storageKey: 'railgoGirlUnlock' },
					{ name: '周年庆', iconKey: 'first', storageKey: 'firstAnniversaryUnlock' }
				],
				apiUrl: '',
			};
		},
		mounted() {
			this.updateUnlockStatus();
			this.apiUrl = (uni.getStorageSync('service_source_icon') || 'https://gateway.zenglingkun.cn') + '/api/v2/cc';
		},
		onShow() {
			// 重新读取解锁状态（如图鉴搜索CR200J解锁可能在其他页面触发）
			this.updateUnlockStatus();
		},
		methods: {
			back: function() {
				uni.navigateBack()
			},
			// 切换主页风格，首页在 onShow 时读取生效
			selectIndexStyle(key) {
				if (this.nowIndexStyle === key) return;
				uni.setStorageSync('indexStyle', key);
				this.nowIndexStyle = key;
				uni.showToast({ title: '已切换主页风格', icon: 'none' });
			},
			selectLoaderStyle(key) {
				if (this.nowLoaderStyle === key) return;
				uni.setStorageSync('loaderStyle', key);
				this.nowLoaderStyle = key;
				uni.showToast({ title: '已切换加载动画', icon: 'none', duration: 1500 });
			},
			updateUnlockStatus() {
				// 原有解锁逻辑（重新读取图鉴搜索解锁状态）
				this.cr200jUnlock = uni.getStorageSync("cr200jUnlock") || false;
				this.searchUnlock1 = this.search >= 300; 
				this.searchUnlock2 = this.search >= 1000;
			},
			selectIcon(iconName) {
				uni.setStorage({
					"key": "nowIcon",
					"data": iconName
				});
				this.nowIcon = iconName;
				// #ifdef APP-HARMONY
				this.applyHarmonyDynamicIcon(iconName);
				// #endif
				// #ifdef APP-PLUS
				switchIcons(iconName);
				// #endif
				// #ifndef H5
				uni.showToast({
					title: "切换成功！",
					icon: 'none'
				});
				// #endif
			},
			applyHarmonyDynamicIcon(iconName) {
				const deviceType = uni.getSystemInfoSync().deviceType;
				const isPad = deviceType === 'tablet' || deviceType === 'pad';
				const iconMap = {
					'girl': isPad ? 'rg_girl_pad' : 'rg_girl',
					'first': isPad ? 'rg_1st_pad' : 'rg_1st',
					'passion': isPad ? 'rg_passion_pad' : 'rg_passion'
				};
				const applySuccess = () => {
					uni.setStorage({
						"key": "nowIcon",
						"data": iconName
					});
					this.nowIcon = iconName;
				};
				if (iconName === 'crh') {
					uni.disableDynamicIcon({
						success: () => {
							applySuccess();
							uni.showToast({
								title: "已恢复默认图标",
								icon: 'none'
							});
						},
						fail: (err) => {
							uni.showToast({
								title: "恢复失败：" + err.errMsg,
								icon: 'none'
							});
						}
					});
				} else if (iconMap[iconName]) {
					uni.selectDynamicIcon({
						iconId: iconMap[iconName],
						success: () => {
							applySuccess();
							uni.showToast({
								title: "切换成功！",
								icon: 'none'
							});
						},
						fail: (err) => {
							uni.showToast({
								title: "切换失败：" + err.errMsg,
								icon: 'none'
							});
						}
					});
				}
			},
			
			// 修改：图标解锁提示
			showIconHelp(icon, storageKey) {
				// 检查是否已解锁
				const isUnlocked = this[storageKey] || 
				  (icon === '立及甬' && this.cr200jUnlock) ||
				  (icon === '大茄子' && this.searchUnlock1) ||
				  (icon === '百香果' && this.searchUnlock2) ||
				  (icon === '露星' && this.girlUnlock);

				if (isUnlocked) {
					return;
				}
				
				let content = '';
				switch(icon) {
					case '立及甬':
						content = '立及甬在图鉴页面输入特定车型解锁，或通过兑换码兑换。';
						break;
					case '大茄子':
						content = '大茄子在查询300次后解锁，或通过兑换码兑换。';
						break;
					case '百香果':
						content = '百香果在查询1000次后可解锁，或通过兑换码兑换。';
						break;
					case '露星':
						content = '该图标仅通过特殊活动或兑换码兑换解锁。';
						break;
					case '周年庆':
						content = '该图标仅通过特殊活动或兑换码兑换解锁。';
						break;
					default:
						content = '该图标可通过特定方式或兑换码兑换。';
				}

				uni.showModal({
					title: `解锁 ${icon}`,
					content: content,
					showCancel: true,
					cancelText: '我知道了',
					confirmText: '兑换码解锁', 
					success: (res) => {
						if (res.confirm) {
							// 使用延迟调用自定义模态框
							setTimeout(() => {
								this.promptForCodeAndUnlock();
							}, 300); 
						}
					}
				});
			},

			showGirlHelp() {
				this.showIconHelp('露星', 'railgoGirlUnlock');
			},
			
			// 启用自定义兑换码输入模态框
			promptForCodeAndUnlock() {
				this.redeemCodeInput = ''; // 清空上次输入
			    this.showCustomRedeemModal = true;
			},

			// 处理自定义模态框的兑换按钮点击
			handleCustomRedeemConfirm() {
			    const code = this.redeemCodeInput.trim();
			    if (!code) {
			        uni.showToast({ title: '兑换码不能为空', icon: 'none' });
			        return;
			    }
			    
			    // 立即隐藏自定义模态框
			    this.showCustomRedeemModal = false;
			    // 调用兑换逻辑
			    this.exchangeIcon(code);
			},
			
			// 修改：处理用户选择解锁哪个图标（移除自动切换）
			unlockSelectedIcon(iconIndex) {
				if (iconIndex === -1) {
					// 用户取消选择
					uni.showToast({ title: '已取消解锁', icon: 'none' });
					return;
				}
				
				const selectedIcon = this.exchangeIconsMap[iconIndex];
				const { storageKey, name } = selectedIcon;
				
				// 检查是否已经解锁
				if (this[storageKey]) {
					uni.showToast({ title: `${name} 已解锁，请重新选择`, icon: 'none', duration: 3000 });
					// 再次弹出选择框让用户重新选择
					this.showIconSelection(); 
					return;
				}

				// 1. 设置兑换码解锁状态为 true
				this[storageKey] = true; 
				// 2. 持久化解锁状态
				uni.setStorageSync(storageKey, true);
				// 3. 刷新视图状态
				this.updateUnlockStatus(); 

				// 仅提示解锁成功，不自动切换
				uni.showModal({
					title: '解锁成功',
					content: `恭喜您解锁了「${name}」图标！您现在可以手动点击“使用”来切换图标。`,
					showCancel: false,
					confirmText: '确定'
				});
			},

			// 新增：弹出选择器让用户选择要解锁的图标
			showIconSelection() {
				// 准备可选项，并过滤掉已解锁的图标
				const availableIcons = this.exchangeIconsMap.filter(item => {
					// 检查是否已通过兑换码或原有方式解锁
					const isUnlockedByRedeem = this[item.storageKey];
					const isUnlockedByOldMethod = 
						(item.iconKey === 'green' && this.cr200jUnlock) ||
						(item.iconKey === 'purple' && this.searchUnlock1) ||
						(item.iconKey === 'passion' && this.searchUnlock2) ||
						(item.iconKey === 'girl' && this.girlUnlock);
						
					return !(isUnlockedByRedeem || isUnlockedByOldMethod);
				});
				
				if (availableIcons.length === 0) {
					uni.showToast({ title: '所有特殊图标均已解锁', icon: 'none' });
					return;
				}

				const itemList = availableIcons.map(item => item.name);
				
				uni.showActionSheet({
					itemList: itemList, 
					title: '兑换成功！请选择要解锁的图标',
					success: (res) => {
						// 找到用户选择的图标在 availableIcons 中的对应项
						const selectedName = itemList[res.tapIndex];
						const selectedIcon = availableIcons.find(item => item.name === selectedName);
						
						// 找到用户选择的图标在原始 exchangeIconsMap 中的索引
						const originalIndex = this.exchangeIconsMap.findIndex(item => item.iconKey === selectedIcon.iconKey);
						
						this.unlockSelectedIcon(originalIndex);
					},
					fail: () => {
						// 用户点击了取消按钮或模态框外部
						this.unlockSelectedIcon(-1); 
					}
				});
			},

			// 兑换码逻辑，接收 code 参数
			async exchangeIcon(code) {
				showLoader('兑换中...');

				try {
					const response = await uniGet(this.apiUrl, {
						params: {
							CODE: code // 使用传入的 CODE 参数
						}
					});

					hideLoader();

					// 仅检查 success 是否为 true
					if (response.data && response.data.success === true) {
						
						// 检查是否有未解锁的图标
						const hasAvailableIcons = this.exchangeIconsMap.some(item => {
							const isUnlockedByRedeem = this[item.storageKey];
							const isUnlockedByOldMethod = 
								(item.iconKey === 'green' && this.cr200jUnlock) ||
								(item.iconKey === 'purple' && this.searchUnlock1) ||
								(item.iconKey === 'passion' && this.searchUnlock2) ||
								(item.iconKey === 'girl' && this.girlUnlock);
								
							return !(isUnlockedByRedeem || isUnlockedByOldMethod);
						});
						
						if (!hasAvailableIcons) {
							uni.showModal({
								title: '兑换成功',
								content: '您已成功兑换，但所有特殊图标均已解锁。',
								showCancel: false,
								confirmText: '确定'
							});
							return;
						}
						
						// 弹出选择框让用户选择要解锁的图标
						this.showIconSelection();

					} else {
						// 兑换失败
						uni.showModal({
							title: '兑换失败',
							content: response.data && response.data.msg ? response.data.msg : '兑换码无效或网络错误。',
							showCancel: false
						});
					}

				} catch (error) {
					hideLoader();
					console.error('兑换码请求失败:', error);
					uni.showModal({
						title: '网络错误',
						content: '无法连接到兑换服务器，请稍后再试。',
						showCancel: false
					});
				}
			}
		}
	};
</script>

<style>
	/* 样式部分保持不变 */
	.content {
		padding: 20px;
		text-align: center;
	}

	.thanks-text {
		font-size: 32px;
		font-weight: bold;
		color: #333;
		margin-top: 30px;
	}

	.developer-list {
		margin-top: 20px;
	}

	.developer-name {
		display: block;
		font-size: 18px;
		color: #555;
		margin: 5px 0;
	}
	
	.section-title-container {
		display: flex;
		align-items: center;
	}
	
	.uni-section-title {
		font-size: 35rpx;
		font-weight: bold;
		margin-right: 10rpx;
	}

	.icon-flex-container {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		justify-content: center;
		padding: 20px 0;
	}

	.icon-item {
		flex: 1 1 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		min-width: 150rpx;
	}

	.icon-item image {
		width: 150rpx;
		height: 150rpx;
		margin-bottom: 5px;
		transition: filter 0.3s ease;
	}

	.icon-text {
		font-size: 24rpx;
		color: #666;
	}

	.ux-btn {
		width: 150rpx;
		margin-top: 10px;
		font-size: 24rpx;
		line-height: 2;
	}

	.grayscale {
		filter: grayscale(100%);
	}

	/* 主页风格缩略图 */
	.style-preview {
		width: 130rpx;
		height: 130rpx;
		background: #fff;
		border: 2rpx solid #e5e9f0;
		border-radius: 16rpx;
		position: relative;
		overflow: hidden;
		margin-bottom: 5px;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}
	.style-preview--active {
		border-color: #114598;
		box-shadow: 0 0 0 4rpx rgba(17, 69, 152, 0.15);
	}

	/* 线路图缩略图 */
	.preview-rail-line {
		position: absolute;
		left: 50%;
		top: 8rpx;
		bottom: 8rpx;
		width: 4rpx;
		margin-left: -2rpx;
		background: #b9cee8;
		border-radius: 2rpx;
	}
	.preview-rail-block {
		position: absolute;
		width: 42rpx;
		height: 20rpx;
		background: #e8eef7;
		border-radius: 6rpx;
	}
	.preview-rail-block--l { left: 12rpx; }
	.preview-rail-block--r { right: 12rpx; }

	/* 大卡缩略图 */
	.preview-card {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-wrap: wrap;
		padding: 12rpx;
	}
	.preview-card-cell {
		width: 46%;
		height: 42%;
		margin: 2%;
		background: #e8eef7;
		border-radius: 8rpx;
	}

	/* 渐变卡片缩略图 */
	.preview-bento {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #EEEEEE;
		overflow: hidden;
	}
	.preview-bento-grad {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 45%;
		background:
			radial-gradient(130% 190% at 0% 0%, #114598 0%, #1d55ab 25%, #3f7ac4 45%, #79a9de 65%, #bcd7f3 82%, #EEEEEE 100%);
	}
	.preview-bento-hero {
		position: absolute;
		left: 12rpx;
		right: 12rpx;
		top: 106rpx;
		height: 26rpx;
		background: #ffffff;
		border: 1rpx solid #eef1f5;
		border-radius: 6rpx;
	}
	.preview-bento-row {
		position: absolute;
		left: 12rpx;
		right: 12rpx;
		top: 76rpx;
		display: flex;
	}
	.preview-bento-cell {
		flex: 1;
		height: 20rpx;
		margin: 0 3rpx;
		background: #f2f4f8;
		border-radius: 6rpx;
	}

	.ux-btn[disabled] {
		background-color: #ccc;
		color: #666;
	}
	
	/* --- 自定义模态框样式优化 --- */
	
	.custom-modal-overlay {
	    position: fixed;
	    top: 0;
	    left: 0;
	    right: 0;
	    bottom: 0;
	    background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
	    display: flex;
	    justify-content: center;
	    align-items: center;
	    z-index: 1000; /* 确保在最上层 */
	}
	
	.custom-modal-content {
	    background-color: #fff;
	    width: 80%;
	    max-width: 600rpx;
	    border-radius: 12rpx; /* 圆角 */
	    padding: 40rpx;
	    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	    display: flex;
	    flex-direction: column;
	    align-items: center;
	}
	
	.modal-title {
	    font-size: 38rpx;
	    font-weight: bold;
	    color: #333;
	    margin-bottom: 10rpx;
	}
	
	.modal-subtitle {
	    font-size: 28rpx;
	    color: #666;
	    margin-bottom: 30rpx;
	}
	
	.modal-input {
	    width: 100%;
	    height: 80rpx;
	    line-height: 80rpx;
	    padding: 0 20rpx;
	    border: 1px solid #eee;
	    border-radius: 8rpx;
	    font-size: 30rpx;
	    background-color: #f8f8f8;
	    margin-bottom: 40rpx;
	}
	
	.modal-buttons {
	    display: flex;
	    width: 100%;
	    justify-content: space-between;
	}
	
	.modal-cancel-btn {
	    flex: 1;
	    margin: 0 10rpx 0 0;
	    background-color: #f0f0f0;
	    color: #666;
	    height: 80rpx;
	    line-height: 80rpx;
		font-size: 30rpx;
	}
	
	.modal-confirm-btn {
	    flex: 1;
	    margin: 0 0 0 10rpx;
	    background-color: #007aff; /* 蓝色，代表主要操作 */
	    color: #fff;
	    height: 80rpx;
	    line-height: 80rpx;
		font-size: 30rpx;
	}
	/* 加载动画缩略图 */
	.preview-loader-zn,
	.preview-loader-wave {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.preview-loader-ring {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 92rpx;
		height: 92rpx;
		margin: -46rpx 0 0 -46rpx;
		border: 4rpx solid #114598;
		border-radius: 50%;
	}

	.preview-loader-arc {
		position: absolute;
		left: 50%;
		top: 50%;
		border: 4rpx solid transparent;
		border-top-color: rgba(17, 69, 152, 0.75);
		border-radius: 50%;
	}

	.preview-loader-arc--1 {
		width: 62rpx;
		height: 62rpx;
		margin: -31rpx 0 0 -31rpx;
		transform: rotate(25deg);
	}

	.preview-loader-arc--2 {
		width: 76rpx;
		height: 76rpx;
		margin: -38rpx 0 0 -38rpx;
		transform: rotate(-45deg);
	}

	.preview-loader-logo {
		position: relative;
		width: 40rpx;
		height: 40rpx;
		border-radius: 8rpx;
		background: rgba(17, 69, 152, 0.16);
		border: 2rpx solid #114598;
	}

	.preview-loader-box {
		position: relative;
		width: 68rpx;
		height: 52rpx;
		border: 2rpx dashed rgba(17, 69, 152, 0.45);
		border-radius: 10rpx;
		overflow: hidden;
	}

	.preview-loader-water {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 46%;
		background: #114598;
		opacity: 0.8;
	}
</style>