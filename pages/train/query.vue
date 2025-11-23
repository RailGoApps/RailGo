<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<view class="ux-bg-primary" style="height:  var(--status-bar-height);">&nbsp;</view>

		<view class="ux-pl ux-pr ux-pt">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">车次查询</text>
		</view>
		<view class="ux-pl ux-pr ux-pb">
			<view class="ux-flex ux-justify-content-center">
				<uv-tabs :list="topTabList" lineWidth="60" lineColor="#114598" :activeStyle="{
						color: '#303133',
						fontWeight: 'bold',
						transform: 'scale(1.05)'
			    	}" :inactiveStyle="{
						color: '#606266',
						transform: 'scale(1)'
					}" itemStyle="height: 34px;padding-left:30px;padding-right:30px;" class="ux-mt-small"
					@click="tabChange"></uv-tabs>
			</view>
			<view v-if="selectIndex==0">
				<view class="ux-pt-small ux-bg-grey5">
					<text class="ux-h6">车次</text>
					<view style="position:relative;">
						<view
							class="ux-bg-white ux-border-radius-small ux-padding-small ux-flex ux-align-items-center ux-mt-small ux-mb-small"
							@click="showTrainKeyboard"
						>
							<text class="icon">&#xe8b6;</text>
							&nbsp;
							<input 
								type="text" 
								class="ux-form-input" 
								placeholder="车次号码" 
								style="width:100%;margin:0 0;"
								:value="keyword" 
								:disabled="isCustomKeyboardEnabled" 
								@input="e => keyword = e.detail.value"/>
						</view>
						<view v-if="shouldShowPlacehold()"
							style="position:absolute;z-index:114514;margin-top:-0.78125rem;width:100%;"
							class="ux-bg-white ux-box-shadow ux-text">
							<scroll-view scroll-y="true" style="max-height:7rem;">
								<view v-for="(item,index) in placeholderData" :key="index"
									class="ux-flex ux-space-between ux-align-items-center"
									style="padding:0.4rem 0.5rem;" hover-class="ux-bg-grey5"
									@click='inputPlacehold(item.numberFull.join("/"))'>
									<view class="ux-flex ux-space-around">
										<view style="font-size:0.96rem;">
											{{item.numberFull.join("/")}}
										</view>
									</view>
								</view>
							</scroll-view>
						</view>
					</view>

				</view>
			</view>
			<view v-if="selectIndex==1">
				<view class="ux-pt-small ux-bg-grey5">
					<view class="ux-flex ux-space-around ux-align-items-center">
						<view class="ux-mr-small" style="width:100%">
							<text class="ux-h6">发站</text>
							<navigator url="/pages/station/commonSelect?resultPlace=train_sts_fieldA">
								<view
									class="ux-bg-white ux-border-radius-small ux-padding-small ux-flex ux-align-items-center ux-mt-small ux-mb-small">
									{{this.stsSelectionA}}
								</view>
							</navigator>
						</view>
						<view>
							<text class="ux-h6"></text>
							<br>
							<view class="ux-flex ux-align-items-center ux-justify-content-center"
								style="border:5rpx solid #114598;border-radius:50%;width:50rpx;height:50rpx;"
								hover-class="ux-bg-grey4" @click="swapSts">
								<text class="icon ux-color-primary ux-text-bold"
									style="font-size:40rpx;">&#xe8be;</text>
							</view>
						</view>
						<view class="ux-pl-small" style="width:100%">
							<text class="ux-h6">到站</text>
							<navigator url="/pages/station/commonSelect?resultPlace=train_sts_fieldB">
								<view
									class="ux-bg-white ux-border-radius-small ux-padding-small ux-flex ux-align-items-center ux-mt-small ux-mb-small">
									{{this.stsSelectionB}}
								</view>
							</navigator>
						</view>
					</view>
					</view>
			</view>
			
			<text class="ux-h6">日期</text>
			<view class="ux-bg-white ux-border-radius-small ux-mb-small ux-mt-small">
				<uni-datetime-picker type="date" v-model="today" start="2007-04-18" end="2099-01-01"
					@change="inputDate" />
			</view>
			
			<view v-if="selectIndex==1 && isNetworkMode" class="ux-flex ux-align-items-center ux-mb-small">
				<switch class="ux-pb-small" color="#114598" style="transform:scale(0.7);margin-left:-1vh;"
					@change="vague" :checked="isVague"/>
				<text class="va">查询同城车站</text>
			</view>
			<br v-if="selectIndex==0">
			<button type="primary" style="background-color:#114598;color:#ffffff;" hover-class="ux-tap"
				@click="jumpToResult()">查询</button>
			<br>
			<view class="ux-text-center ux-padding-small ux-mb ux-h6"
				style="background-color:#e9eef5;border:1px solid #114598;border-radius:10rpx;color:#114598;">
				<text class="ux-bold">信息仅供参考 请以铁路运营企业实际运用为准</text>
			</view>
			<br>
			<view class="ux-flex ux-row ux-justify-content-center">
				<text class="ux-text-small ux-opacity-4">—— 数据来源: RailGo.Parser ——</text>
			</view>
		</view>
		
		<view class="train-keyboard" v-if="showKeyboard && selectIndex == 0 && isCustomKeyboardEnabled">
			<view class="confirm-area">
				<text class="confirm-btn" @click="toggleSystemKeyboard" style="margin-right: 20rpx; color: #f90;">切换系统键盘</text>
				<text class="confirm-btn" @click="hideTrainKeyboard">确认</text>
			</view>

			<view class="keyboard-body">
				
				<view class="key letter-key" style="grid-row: 1; grid-column: 1;" @touchstart="onLetterClick('G')"><text>G</text></view>
				<view class="key letter-key" style="grid-row: 1; grid-column: 2;" @touchstart="onLetterClick('D')"><text>D</text></view>
				
				<view class="key number-key" style="grid-row: 1; grid-column: 3;" @touchstart="onNumberClick(1)"><text>1</text></view>
				<view class="key number-key" style="grid-row: 1; grid-column: 4;" @touchstart="onNumberClick(2)"><text>2</text></view>
				<view class="key number-key" style="grid-row: 1; grid-column: 5;" @touchstart="onNumberClick(3)"><text>3</text></view>
				
				<view class="key letter-key" style="grid-row: 2; grid-column: 1;" @touchstart="onLetterClick('C')"><text>C</text></view>
				<view class="key letter-key" style="grid-row: 2; grid-column: 2;" @touchstart="onLetterClick('K')"><text>K</text></view>
				
				<view class="key number-key" style="grid-row: 2; grid-column: 3;" @touchstart="onNumberClick(4)"><text>4</text></view>
				<view class="key number-key" style="grid-row: 2; grid-column: 4;" @touchstart="onNumberClick(5)"><text>5</text></view>
				<view class="key number-key" style="grid-row: 2; grid-column: 5;" @touchstart="onNumberClick(6)"><text>6</text></view>
				
				<view class="key letter-key" style="grid-row: 3; grid-column: 1;" @touchstart="onLetterClick('L')"><text>L</text></view>
				<view class="key letter-key" style="grid-row: 3; grid-column: 2;" @touchstart="onLetterClick('T')"><text>T</text></view>
				
				<view class="key number-key" style="grid-row: 3; grid-column: 3;" @touchstart="onNumberClick(7)"><text>7</text></view>
				<view class="key number-key" style="grid-row: 3; grid-column: 4;" @touchstart="onNumberClick(8)"><text>8</text></view>
				<view class="key number-key" style="grid-row: 3; grid-column: 5;" @touchstart="onNumberClick(9)"><text>9</text></view>
				
				
				<view class="key letter-key" style="grid-row: 4; grid-column: 1;" @touchstart="onLetterClick('Z')"><text>Z</text></view>
				<view class="key letter-key" style="grid-row: 4; grid-column: 2;" @touchstart="onLetterClick('Y')"><text>Y</text></view>
				<view class="key letter-key" style="grid-row: 4; grid-column: 3;" @touchstart="onLetterClick('S')"><text>S</text></view>
				<view class="key number-key" style="grid-row: 4; grid-column: 4;" @touchstart="onNumberClick(0)"><text>0</text></view>
				<view class="key function-key delete-key" style="grid-row: 4; grid-column: 5;" 
					@click="onDelete"
					@longpress="onLongPressDelete"
					@touchstart="deleteTouchStart"
					@touchend="deleteTouchEnd"
				>
					<text class="icon-x">×</text> 
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		query
	} from "@/scripts/jsonDB.js";
	import {
		doQuery,
	} from "@/scripts/sqlite.js";
	import {
		KEYS_STRUCT_STATIONS,
		KEYS_STRUCT_TRAINS
	} from "@/scripts/config.js";
	import {
		toRaw
	} from "@vue/reactivity";
	import {
		TRAIN_KIND_COLOR_MAP
	} from "@/scripts/config.js";
	import {
		uniGet
	} from "../../scripts/req";
	
	// import TrainKeyboard from '/pages/train/keyboard.vue';
	
	export default {
		data() {
			return {
				"keyword": "",
				"colorMap": TRAIN_KIND_COLOR_MAP,
				"date": new Date().toISOString().slice(0, 10).replace("-", "").replace("-", ""),
				"today": new Date().toISOString().slice(0, 10),
				"placeholderData": [],
				"placeholderCollapsed": false,
				"topTabList": [{
					name: '车次',
				}, {
					name: '站站',
				}],
				"selectIndex": 0,
				"stsSelectionA": "",
				"stsSelectionB": "",
				"isVague": false,
				"isNetworkMode": false,
				"showKeyboard": false,
				// 新增状态：控制当前是否处于自定义键盘模式
				"isCustomKeyboardEnabled": true, 
				// 新增：用于长按删除的计时器
				deleteTimer: null,
				longPressThreshold: 500, // 500ms for long press
                // 移除 lastLetterClickTarget，改为全局替换
			}
		},
		onShow() {
			this.isNetworkMode = uni.getStorageSync("mode") === "network";
			
			let selectionA = uni.getStorageSync("train_sts_fieldA");
			let selectionB = uni.getStorageSync("train_sts_fieldB");
			if (!selectionA || !selectionB) {
				uni.setStorageSync("train_sts_fieldA", {
					name: "北京",
					telecode: "BJP",
					city: "北京"
				});
				uni.setStorageSync("train_sts_fieldB", {
					name: "上海",
					telecode: "SHH",
					city: "上海"
				});
				this.stsSelectionA = "北京";
				this.stsSelectionB = "上海";
			} else {
				if(!selectionA.city || !selectionB.city) {
					selectionA.city = selectionA.city || selectionA.name; 
					selectionB.city = selectionB.city || selectionB.name;
					uni.setStorageSync("train_sts_fieldA", selectionA);
					uni.setStorageSync("train_sts_fieldB", selectionB);
				}
				this.stsSelectionA = selectionA.name;
				this.stsSelectionB = selectionB.name;
			}
			
			// 每次 onShow 时，恢复为自定义键盘模式
			this.isCustomKeyboardEnabled = true;
			this.showKeyboard = false;
		},
		methods: {
			// 键盘
			isLetter(char) { return /^[A-Z]$/i.test(char); },
			
			// 修正：字母点击逻辑 - 全局替换所有部分的第一个字母
			onLetterClick(letter) {
				// 逻辑立即执行，实现无延迟输入
				let currentNumber = this.keyword;
				let parts = currentNumber.split('/');
				let updatedParts = [];
                
                // 遍历所有部分（例如：G1017 和 G1020）
				parts.forEach(part => {
					if (part.length === 0) {
                        // 如果部分为空，直接插入字母 (例如: "1017/" + "G" -> "1017/G")
						updatedParts.push(letter);
					} else if (this.isLetter(part.charAt(0))) {
                        // 如果第一个字符是字母，则替换它 (例如: "G1017" + "D" -> "D1017")
						updatedParts.push(letter + part.substring(1));
					} else {
                        // 如果第一个字符不是字母 (是数字)，则在前面插入字母 (例如: "1017" + "G" -> "G1017")
						updatedParts.push(letter + part);
					}
				});
				
				this.keyword = updatedParts.join('/');
			},
			
			onNumberClick(number) { 
				// 逻辑立即执行，实现无延迟输入
				this.keyword = this.keyword + String(number);
			},
			
			onDelete() {
				if (this.keyword.length > 0) {
					this.keyword = this.keyword.substring(0, this.keyword.length - 1);
				}
			},
			
			// 长按删除清空
			onLongPressDelete() {
				this.keyword = "";
				// 清除定时器
				if (this.deleteTimer) {
					clearTimeout(this.deleteTimer);
					this.deleteTimer = null;
				}
			},
			
			// 处理长按事件 (touchstart/touchend 保持不变)
			deleteTouchStart() {
				this.deleteTimer = setTimeout(() => {
					// 达到长按阈值时执行清空操作
					if (this.keyword.length > 0) {
						this.keyword = "";
					}
					this.deleteTimer = null; 
				}, this.longPressThreshold);
			},
			deleteTouchEnd() {
				// 如果在长按阈值内抬起，则清除定时器，避免触发长按操作
				if (this.deleteTimer) {
					clearTimeout(this.deleteTimer);
					this.deleteTimer = null;
				}
			},
			
			showTrainKeyboard: function() {
				// 只有在自定义键盘启用时才显示自定义键盘
				if (this.isCustomKeyboardEnabled) {
					this.showKeyboard = true;
				}
			},
			hideTrainKeyboard: function() {
				this.showKeyboard = false;
			},
			
			// 新增方法：切换到系统键盘
			toggleSystemKeyboard: function() {
				// 1. 隐藏自定义键盘
				this.showKeyboard = false;
				// 2. 禁用自定义键盘模式，解除 input 的 disabled 属性
				this.isCustomKeyboardEnabled = false;
				// 此时 input 允许聚焦，系统键盘会弹出
			},
			
			back: function() {
				uni.navigateBack()
			},
			jumpToResult: function() {
				this.hideTrainKeyboard();
				if (this.selectIndex == 0) {
					if (this.keyword == "" || this.date == "") {
						uni.showToast({
							icon: "none",
							title: "不允许输入空值"
						});
						return;
					}
					uni.navigateTo({
						url: "/pages/train/trainResult?keyword=" + this.keyword + "&date=" + this.date
					});
				} else {
					let url = "/pages/train/stsResult?from=" + uni.getStorageSync("train_sts_fieldA").telecode +
						"&to=" + uni.getStorageSync("train_sts_fieldB").telecode + "&date=" + this.date;

					if (this.isVague) {
						url += "&city=true";
					}

					uni.navigateTo({
						url: url
					});
				}
			},
			fetchPlaceholder: function() {
				const mode = uni.getStorageSync("mode");
				if (this._debounceTimer) clearTimeout(this._debounceTimer);
				
				if (this.keyword.length >= 2) {
					this._debounceTimer = setTimeout(async () => {
						try {
							if (mode == "network") {
								const resp = await uniGet(`https://data.railgo.zenglingkun.cn/api/train/preselect?keyword=${encodeURIComponent(this.keyword)}`);
								const result = resp.data;
								this.placeholderData = result.map(item => ({
									numberFull: typeof item === 'string' ? item.split('/') : [],
									fromStation: item.fromStation || {},
									toStation: item.toStation || {}
								}));
							} else {
								if (this.keyword[0] >= '0' && this.keyword[0] <= '9') {
									this.placeholderData = toRaw(await doQuery(
										"SELECT code, numberFull, timetable FROM trains WHERE numberFull LIKE '%\"_" +
										this.keyword + "%\"%' OR numberFull LIKE '%\"" + this.keyword + "%\"'",
										["code", "numberFull", "timetable"]));
								} else {
									this.placeholderData = toRaw(await doQuery(
										"SELECT code, numberFull, timetable FROM trains WHERE numberFull LIKE '%" +
										this.keyword + "%'", ["code", "numberFull", "timetable"]));
								}
								this.placeholderData = this.placeholderData.sort((a, b) => parseInt(a.numberFull.join("/").match(/\d+/)[0]) - parseInt(b.numberFull.join("/").match(/\d+/)[0]));
							}
							this.placeholderCollapsed = false;
						} catch (error) {
							console.error("预选词加载失败", error);
						}
					}, 200);
				} else {
					this.placeholderData = [];
				}
			},
			inputDate: function(e) {
				this.date = e.replace("-", "").replace("-", "");
			},
			shouldShowPlacehold: function() {
				return this.keyword.length >= 2 && !this.placeholderCollapsed && this.placeholderData.length != 0;
			},
			inputPlacehold: function(ph) {
				this.keyword = ph;
				this.placeholderCollapsed = true;
				this.hideTrainKeyboard();
			},
			swapSts: function(e) {
				let selectionA = uni.getStorageSync("train_sts_fieldA");
				let selectionB = uni.getStorageSync("train_sts_fieldB");
				uni.setStorageSync("train_sts_fieldA", selectionB);
				uni.setStorageSync("train_sts_fieldB", selectionA);
				this.stsSelectionA = selectionB.name;
				this.stsSelectionB = selectionA.name;
			},
			tabChange: function(e) {
				this.selectIndex = e.index;
				this.hideTrainKeyboard();
			},
			vague: function(e) {
				this.isVague = e.detail.value;
			}
		},
		watch: {
			keyword: {
				handler() {
					this.fetchPlaceholder();
				}
			}
		}
	}
</script>


<style scoped>
/* 仿12306键盘样式 */
.train-keyboard {
  position: fixed; 
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 9999; 
  
  background-color: #f7f7f7; 
  padding: 0; 
  box-sizing: border-box;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.confirm-area {
    width: 100%;
    display: flex;
    justify-content: flex-end; 
    padding: 20rpx 0 0 0; 
    background-color: #fff; 
}
.confirm-btn {
    font-size: 30rpx;
    color: #007aff; 
    font-weight: bold;
    padding: 10rpx 0;
    margin-right: 45rpx; 
}
.keyboard-body {
  display: grid;
  grid-template-columns: repeat(5, 1fr); 
  grid-template-rows: repeat(4, 1fr);
  width: 100%;
  background-color: #fff; 
  gap: 0; 
}
.key {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100rpx; 
  font-size: 48rpx; 
  font-weight: bold;
  box-sizing: border-box; 
  background-color: #fff; 
  /* 【优化】：移除 transition，实现瞬间的视觉反馈（无延迟动画） */
  /* transition: background-color 0.08s ease; */
  border-right: 1rpx solid #e0e0e0;
  border-bottom: 1rpx solid #e0e0e0;
}
.key:active {
  background-color: #f0f0f0; 
  opacity: 0.9;
}
.key[style*='grid-column: 5'] {
    border-right: none !important;
}

.key[style*='grid-row: 4'] {
    border-bottom: none !important;
}

.letter-key {
    color: #114598; 
}

.delete-key {
    background-color: #d1d5db; 
    color: #4b5563;
    font-weight: normal; 
}
.delete-key:active {
    background-color: #a0a0a0;
}
.icon-x {
    font-size: 40rpx;
}
</style>