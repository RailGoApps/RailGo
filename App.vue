<script>
	const nauth = false;
	const version = "1.7.3 Build 10703"
	const version_number = 16
	import {uniGet} from "./scripts/req";
	// #ifndef H5
	// #ifndef APP-HARMONY
	var safeModule = uni.requireNativePlugin("Ionic-Safe");
	// #endif
	// #endif 
	// UXUI INIT
	import {
		loadDB
	} from "@/scripts/sqlite.js";

	function checkTime(timestamp1, timestamp2) {
		const interval = 72 * 60 * 60 * 1000;
		const difference = Math.abs(timestamp1 - timestamp2);
		return difference > interval;
	}
	async function check() {
		if (uni.getStorageSync("jqok")){
			return
		}
		try {
			const Response = await uniGet("https://center.zenglingkun.cn/beta/api/check/" + uni.getStorageSync(
				'version') + "?userid=" + uni.getStorageSync('qq') + "&key=" + uni.getStorageSync('key'));
			if (Response.data.valid) {
				uni.setStorageSync("AuthTime", new Date().getTime())
				console.log("鉴权成功")
				uni.showToast({
					title: '鉴权成功',
					position: 'bottom',
				})
				uni.setStorage({
					key: 'jqok',
					data: true
				});
			} else {
				uni.showToast({
					title: '鉴权无效',
					position: 'bottom',
				})
				uni.setStorageSync("oobe", false)
				uni.reLaunch({
					url: '/pages/oobe/welcome'
				})
			}

		} catch (error) {
			if (checkTime(uni.getStorageSync("AuthTime"), new Date().getTime())) {
				uni.showToast({
					title: '鉴权超时，请重新鉴权',
					position: 'bottom',
				})
				uni.setStorageSync("oobe", false)
				uni.reLaunch({
					url: '/pages/oobe/welcome'
				})
			} else {
				console.log("无网络但未超时")
				uni.showToast({
					title: '离线鉴权成功',
					position: 'bottom',
				})
			}
		}
	}

	// 新增签名校验函数
	async function checkSignature() {
		// #ifndef H5
		// #ifndef APP-HARMONY
		safeModule.getSignature(ret => {
			if (ret.state && ret.data) {
				const signatureSHA1 = ret.data;
				console.log("获取到的签名 SHA1:", signatureSHA1);
				if (signatureSHA1 === "44:BB:F4:8A:47:EA:1F:D7:DE:00:BD:78:F1:26:BB:35:83:2B:C8:E0"){
					console.log("验签成功")
				} else {
					console.error("验签失败");
					uni.showModal({
						title: '安全警告',
						content: '您可能正在使用修改版软件，请从官方渠道下载',
						showCancel: false,
						success: function (res) {
							uni.exit()
						}
					});
				}
			} else {
				console.error("无法获取应用签名 SHA1");
				uni.showModal({
					title: '安全警告',
					content: '诶怎么没有签名证书指纹？！',
					showCancel: false,
					success: function (res) {
						uni.exit();
		
					}
				});
			}
		});
		// #endif
		// #endif
	}

	// --- 【新增辅助函数：获取当前日期 YYYYMMDD】 ---
	function getTodayDate() {
	    const now = new Date();
	    const year = now.getFullYear();
	    const month = String(now.getMonth() + 1).padStart(2, '0');
	    const day = String(now.getDate()).padStart(2, '0');
	    return `${year}${month}${day}`;
	}
	
	let firstBackTime = 0;
	export default {
		onLaunch: async function() {

			checkSignature(); 

			const value = uni.getStorageSync('islaunched');
			uni.setStorage({
				key: 'DBerror',
				data: ""
			});
			uni.setStorage({
				key: 'beta',
				data: true
			});
			uni.setStorage({
				key: 'jqok',
				data: false
			});
			
			if (value) {
				// 检查版本更新
				const storedVersion = uni.getStorageSync('version');
				const storedVersionText = uni.getStorageSync('versionText');
				
				if (storedVersion !== version_number) {
					uni.setStorage({
						key: 'version',
						data: version_number
					});
					uni.setStorage({
						key: 'versionText',
						data: version
					});
					
					uni.setStorage({
						key: 'showUpdateWelcome',
						data: true
					});
				} else {
					uni.setStorage({
						key: 'version',
						data: version_number
					});
					uni.setStorage({
						key: 'versionText',
						data: version
					});
				}
				
				uni.setStorage({
					key: 'NeedAuth',
					data: nauth
				});
			} else {
				uni.setStorage({
					key: 'islaunched',
					data: true
				});
				uni.setStorage({
					key: 'offlineDataVersion',
					data: 0
				});
				uni.setStorage({
					key: 'offlineDataVersionText',
					data: "未下载"
				});
				uni.setStorage({
					key: 'version',
					data: version_number
				});
				uni.setStorage({
					key: 'versionText',
					data: version
				});
				uni.setStorage({
					key: 'NeedAuth',
					data: nauth
				});
				uni.setStorage({
					key: 'oobe',
					data: false
				});
				uni.setStorage({
					key: 'mode',
					data: ''
				});
				uni.setStorage({
					key: 'nowIcon',
					data: 'crh'
				});
				uni.setStorage({
					key: 'search',
					data: 0
				});
				uni.setStorage({
					key: 'Funnyegg',
					data: false
				});

			}

			// 鉴权
			if (uni.getStorageSync("NeedAuth")) {
				check()
			}

			if (uni.getStorageSync('oobe')) {
				//* 不操作 */
			} else {
				uni.reLaunch({
					url: '/pages/oobe/welcome'
				})
			}
			// #ifdef APP
			if (uni.getStorageSync('mode') == "local") {
				await loadDB()
			}
			// #endif



		},
		onShow: function() {
			// #ifdef APP
			// 获取 Url Scheme 启动参数
			const urlScheme = plus.runtime.arguments;
			
			if (urlScheme) {				
				// 假设 Url Scheme 格式为: railgo://pagePath?param1=value1&param2=value2
				const schemeRegex = /^railgo:\/\/([^\?]+)(\??.*)$/i;
				const match = urlScheme.match(schemeRegex);
				
				if (match) {
					let pagePath = match[1]; // /pages/train/trainResult
					let queryString = match[2]; // ?keyword=G1&date=20251125 或 空字符串
					
					// 1. 检查 'date' 参数是否存在
					const hasDate = queryString.includes('date=');
					
					if (!hasDate) {
						// 2. 如果不存在，获取当前日期并添加
						const todayDate = getTodayDate();
						const newParam = `date=${todayDate}`;
						
						if (queryString === '') {
							// 没有其他参数，直接加参
							queryString = `?${newParam}`;
						} else {
							// 加参
							queryString = `${queryString}&${newParam}`;
						}
						
						console.log("Missing date parameter, added:", newParam);
					}
					
					// 构造URL
					const targetUrl = `/${pagePath}${queryString}`; // uni-app 页面路径需要以 / 开头
					
					console.log("Target URL for jump:", targetUrl);
					
					// jump
					uni.reLaunch({
						url: targetUrl,
						fail: (res) => {
							console.error("Url Scheme 跳转失败:", res);
							uni.reLaunch({ url: '/pages/index/index' });
						}
					});
				} else {
					console.warn("Url Scheme 格式不符合 'railgo://pagePath' 规范:", urlScheme);
				}
				
				// 清空参数，防止 App 从后台激活时重复处理旧参数
				plus.runtime.arguments = '';
			}
			// #endif
			
			// 检查是否需要显示更新欢迎弹窗（移出APP条件编译）
			const showUpdateWelcome = uni.getStorageSync('showUpdateWelcome');
			const versionText = uni.getStorageSync('versionText');
			
			if (showUpdateWelcome && versionText) {
				// 清除标记，确保只显示一次
				uni.setStorage({
					key: 'showUpdateWelcome',
					data: false
				});
				
				// 设置标记，让首页显示自定义弹窗
				uni.setStorageSync('showCustomUpdatePopup', {
					show: true,
					version: versionText
				});
			}
		},
		onHide: function() {},
		onLastPageBackPress: function() {
			if (firstBackTime == 0) {
				uni.showToast({
					title: '再按一次退出应用',
					position: 'bottom',
				})
				firstBackTime = Date.now();
				setTimeout(() => {
					firstBackTime = 0
				}, 2000);
			} else if (Date.now() - firstBackTime < 2000) {
				firstBackTime = Date.now();
				uni.exit();
			}

		},
		onExit() {},
		
		methods: {
			onExit() {}
	}
		}
	
</script>

<style lang="scss">
	@font-face {
		font-family: "Material Icons";
		src: url("/static/fonts/mdicon.ttf");
	}

	@font-face {
		font-family: "DIN1451";
		src: url("/static/fonts/din1451.ttf");
	}

	@font-face {
		font-family: "HMSans";
		src: url("/static/fonts/hmsans.ttf");
	}

	page {
		font-family: "HMSans";
	}

	.consolas {
		font-family: "DIN1451";
	}

	.icon {
		font-family: "Material Icons";
		font-weight: 300;
	}

	.va {
		vertical-align: middle;
	}

	/* UXUI */

	/* 主体结构 */
	$ux-body-space: 30rpx;
	/* 主题色 */
	$primaryColor: #114598;
	/* 页面背景色 */
	$ux-page-color: #f7f9f9;
	/* 文本颜色 */
	$ux-primary-text-color: rgba(55, 55, 55, 1);
	$ux-secondary-text-color: rgba(116, 116, 116, 1);
	$ux-third-text-color: rgba(150, 150, 150, 1);
	/* 点击背景 */
	$ux-tap-color: rgba(239, 241, 246, 0.3);
	/* 圆角尺寸 */
	$ux-radius-sm: 6rpx;
	$ux-radius: 10rpx;
	$ux-radius-lg: 20rpx;
	/* 文本尺寸 */
	$ux-text: 30rpx;
	$ux-text-small: 24rpx;
	$ux-h1: 60rpx;
	$ux-h2: 50rpx;
	$ux-h3: 40rpx;
	$ux-h4: 36rpx;
	$ux-h5: 32rpx;
	$ux-h6: 30rpx;
	/* 通用间距 */
	$ux-space: 30rpx;
	$ux-space-large: 50rpx;
	$ux-space-small: 16rpx;
	/* 边框颜色 */
	$ux-border-color: #F5F7F8;
	/* 按钮尺寸 */
	$ux-button-text-size: 30rpx;
	$ux-button-size: 82rpx;
	$ux-button-border-radius: 8rpx;
	$ux-button-mini-text-size: 22rpx;
	$ux-button-mini-size: 66rpx;
	@import "@/uni_modules/unix-ui/uxui.scss";
</style>