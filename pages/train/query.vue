<template>
	<view class="ux-bg-grey5" style="min-height:100vh;" @click="hideTrainKeyboard">
		<back-header></back-header>

		<view class="ux-pl ux-pr ux-pt" style="padding-top: 0px;">
			<text class="ux-h2">车次查询</text>
		</view>
		<view class="ux-pl ux-pr ux-pb" :style="showKeyboard && selectIndex == 0 && isCustomKeyboardEnabled ? 'padding-bottom: 700rpx;' : ''">
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
							@click.stop="showTrainKeyboard"
						>
							<text class="icon">&#xe8b6;</text>
							&nbsp;
							<input 
								type="text" 
								class="ux-form-input" 
								placeholder="车次号码" 
								:style="{
									width: '100%',
									margin: '0 0',
									pointerEvents: isCustomKeyboardEnabled ? 'none' : 'auto'
								}" 
								:value="keyword" 
								:disabled="isCustomKeyboardEnabled" 
								@input="e => { keyword = e.detail.value; fetchPlaceholder(); }"/>
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
			<view v-if="selectIndex==2">
				<view class="ux-pt-small ux-bg-grey5">
					<text class="ux-h6">车站</text>
					<navigator url="/pages/station/commonSelect?resultPlace=train_tiaotu_field">
						<view
							class="ux-bg-white ux-border-radius-small ux-padding-small ux-mt-small ux-mb-small ux-flex ux-align-items-center ux-space-between">
							<text>{{tiaotuStationName}}</text>
							<text class="icon">&#xe5c8;</text>
						</view>
					</navigator>
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
			<br v-if="selectIndex==0 || selectIndex==2">
			<button type="primary" style="background-color:#114598;color:#ffffff;" hover-class="ux-tap"
				@click="jumpToResult()">查询</button>
			<br>

			<view class="ux-text-center ux-padding-small ux-mb ux-h6"
				style="background-color:#e9eef5;border:1px solid #114598;border-radius:10rpx;color:#114598;">
				<text class="ux-bold">信息仅供参考 请以铁路运营企业实际运用为准</text><br>
				<text class="ux-bold">V2版本日期极其敏感，请注意选择正确开行日期</text><br>
				<text class="ux-bold">调图数据来源于公开信息 可能随时发生变动</text>
			
			</view>
			<br>
			<view v-if="trainHistory && trainHistory.length > 0" class="ux-mb-small">
				<view class="ux-flex ux-space-between ux-align-items-center ux-mb-small">
					<text class="ux-h6 ux-bold">历史记录</text>
					<text class="ux-text-small ux-color-primary" style="color: #114598;" @click="clearHistory">清空</text>
				</view>
			
				<view class="history-list">
					<view v-for="(item, index) in trainHistory" :key="index" class="history-item" 
						  @click="selectFromHistory(item.trainNumber)">
						<view class="ux-flex ux-align-items-center ux-justify-content-center ux-text-center"
							  style="padding: 10rpx 20rpx; background-color: #f0f5ff; border-radius: 30rpx; margin: 10rpx 10rpx 0 0; border: 1px solid #d0ddf0;">
							<text class="ux-text-small" style="color: #114598; font-weight: 500;">{{item.trainNumber}}</text>
						</view>
					</view>
				</view>
			
			</view>
			<br>
			<view class="ux-flex ux-row ux-justify-content-center">
				<text class="ux-text-small ux-opacity-4">—— 数据来源: RailGo.Parser ——</text>
			</view>
		</view>
		
		<view class="train-keyboard" :class="{ 'train-keyboard-open': showKeyboard && selectIndex == 0 && isCustomKeyboardEnabled }" @click.stop>
			<view class="keyboard-head">
				<text class="switch-system" @click="toggleSystemKeyboard">切换系统键盘</text>
			</view>

			<view class="keyboard-body">
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key letter-key" @touchstart="onLetterClick('G')"><text>G</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key letter-key" @touchstart="onLetterClick('T')"><text>T</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key letter-key" @touchstart="onLetterClick('K')"><text>K</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key letter-key" @touchstart="onLetterClick('D')"><text>D</text></view>

				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key letter-key" @touchstart="onLetterClick('C')"><text>C</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key letter-key" @touchstart="onLetterClick('S')"><text>S</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key letter-key" @touchstart="onLetterClick('Z')"><text>Z</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key letter-key" @touchstart="onLetterClick('N')"><text>N</text></view>

				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key number-key" @touchstart="onNumberClick(1)"><text>1</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key number-key" @touchstart="onNumberClick(2)"><text>2</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key number-key" @touchstart="onNumberClick(3)"><text>3</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key letter-key" @touchstart="onLetterClick('V')"><text>V</text></view>

				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key number-key" @touchstart="onNumberClick(4)"><text>4</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key number-key" @touchstart="onNumberClick(5)"><text>5</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key number-key" @touchstart="onNumberClick(6)"><text>6</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key letter-key" @touchstart="onLetterClick('Y')"><text>Y</text></view>

				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key number-key" @touchstart="onNumberClick(7)"><text>7</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key number-key" @touchstart="onNumberClick(8)"><text>8</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key number-key" @touchstart="onNumberClick(9)"><text>9</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key letter-key" @touchstart="onLetterClick('L')"><text>L</text></view>

				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key number-key key-wide" @touchstart="onNumberClick(0)"><text>0</text></view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key delete-key"
					@click="onDelete"
					@longpress="onLongPressDelete"
					@touchstart="deleteTouchStart"
					@touchend="deleteTouchEnd"
					@touchcancel="deleteTouchEnd">
					<view class="backspace-icon"></view>
				</view>
				<view hover-class="key-pressed" :hover-start-time="0" :hover-stay-time="100" class="key confirm-key" @click="hideTrainKeyboard"><text>确认</text></view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		doQuery,
	} from "@/scripts/sqlite.js";
	import {
		TRAIN_KIND_COLOR_MAP
	} from "@/scripts/config.js";
	import {
		uniGet
	} from "../../scripts/req";
    import {
		toRaw
	} from "@vue/reactivity";
	
	// 防抖定时器定义在外部，防止被 Vue 深度监听劫持造成 UI 渲染阻塞
	let debounceTimer = null;

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
				}, {
					name: '调图',
				}],
				"selectIndex": 0,
				"stsSelectionA": "",
				"stsSelectionB": "",
				"tiaotuStationName": "",
				"isVague": false,
				"isNetworkMode": false,
				"showKeyboard": false,
				"isCustomKeyboardEnabled": true, 
				"trainHistory": [],
				deleteTimer: null,
				longPressThreshold: 500,
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
			
			let tiaotuSelection = uni.getStorageSync("train_tiaotu_field");
			if (!tiaotuSelection) {
				tiaotuSelection = {
					name: "北京",
					telecode: "BJP",
					city: "北京"
				};
				uni.setStorageSync("train_tiaotu_field", tiaotuSelection);
			}
			this.tiaotuStationName = tiaotuSelection.name;
			
			this.trainHistory = uni.getStorageSync('trainHistory') || [];
			
			this.isCustomKeyboardEnabled = true;
			this.showKeyboard = false;
		},
		onHide() {
			this.hideTrainKeyboard();
		},
		onUnload() {
			this.deleteTouchEnd();
			clearTimeout(debounceTimer);
		},
		methods: {
			isLetter(char) { return /^[A-Z]$/i.test(char); },
			onLetterClick(letter) {
				let currentNumber = this.keyword;
				let parts = currentNumber.split('/');
				let updatedParts = [];
                
				parts.forEach(part => {
					if (part.length === 0) {
						updatedParts.push(letter);
					} else if (this.isLetter(part.charAt(0))) {
						updatedParts.push(letter + part.substring(1));
					} else {
						updatedParts.push(letter + part);
					}
				});
				this.keyword = updatedParts.join('/');
				// 核心修复：按键时主动请求，不依赖全局 watch
				this.fetchPlaceholder();
			},
			onNumberClick(number) { 
				this.keyword = this.keyword + String(number);
				this.fetchPlaceholder();
			},
			onDelete() {
				if (this.keyword.length > 0) {
					this.keyword = this.keyword.substring(0, this.keyword.length - 1);
					this.fetchPlaceholder();
				}
			},
			onLongPressDelete() {
				this.keyword = "";
				this.placeholderData = [];
				if (this.deleteTimer) {
					clearTimeout(this.deleteTimer);
					this.deleteTimer = null;
				}
			},
			deleteTouchStart() {
				this.deleteTimer = setTimeout(() => {
					if (this.keyword.length > 0) {
						this.keyword = "";
						this.placeholderData = [];
					}
					this.deleteTimer = null; 
				}, this.longPressThreshold);
			},
			deleteTouchEnd() {
				if (this.deleteTimer) {
					clearTimeout(this.deleteTimer);
					this.deleteTimer = null;
				}
			},
			showTrainKeyboard: function() {
				if (this.isCustomKeyboardEnabled) {
					this.showKeyboard = true;
					this.placeholderCollapsed = false;
				}
			},
			hideTrainKeyboard: function() {
				this.showKeyboard = false;
				this.placeholderCollapsed = true;
				this.deleteTouchEnd();
			},
			toggleSystemKeyboard: function() {
				this.hideTrainKeyboard();
				this.isCustomKeyboardEnabled = false;
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
					if (this.keyword == "2026" || this.keyword == "RailGo" || this.keyword == "新年快乐"){
						uni.navigateTo({url: "/pages/404/newYear"})
						return
					}
					this.saveToHistory(this.keyword);
					uni.navigateTo({
						url: "/pages/train/trainResult?keyword=" + this.keyword + "&date=" + this.date
					});
				} else if (this.selectIndex == 1) {
					let url = "/pages/train/stsResult?from=" + uni.getStorageSync("train_sts_fieldA").telecode +
						"&to=" + uni.getStorageSync("train_sts_fieldB").telecode + "&date=" + this.date;
					if (this.isVague) {
						url += "&city=true";
					}
					uni.navigateTo({
						url: url
					});
				} else {
					const station = uni.getStorageSync("train_tiaotu_field");
					if (!station || !station.telecode || this.date == "") {
						uni.showToast({
							icon: "none",
							title: "不允许输入空值"
						});
						return;
					}
					uni.navigateTo({
						url: "/pages/train/tiaotuResult?stationCode=" + station.telecode +
							"&stationName=" + encodeURIComponent(station.name) + "&date=" + this.date
					});
				}
			},
			fetchPlaceholder: function() {
				this.placeholderCollapsed = false;
				const mode = uni.getStorageSync("mode");
				if (debounceTimer) clearTimeout(debounceTimer);
				
				if (this.keyword.length >= 2) {
					// 略微调高防抖缓冲（260ms），确保高频点击自定义键盘不拥堵主线程
					debounceTimer = setTimeout(async () => {
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
								let queryResult = [];
								const kw = this.keyword.trim();
								if (kw[0] >= '0' && kw[0] <= '9') {
									queryResult = await doQuery(
										"SELECT code, numberFull, timetable FROM trains WHERE numberFull LIKE '%\"_" +
										kw + "%\"%' OR numberFull LIKE '%\"" + kw + "%\"'",
										["code", "numberFull", "timetable"]);
								} else {
									queryResult = await doQuery(
										"SELECT code, numberFull, timetable FROM trains WHERE numberFull LIKE '%" +
										kw + "%'", ["code", "numberFull", "timetable"]);
								}
								
								const rawData = toRaw(queryResult) || [];
								this.placeholderData = rawData.sort((a, b) => {
									const numA = a.numberFull && a.numberFull.join("/").match(/\d+/);
									const numB = b.numberFull && b.numberFull.join("/").match(/\d+/);
									return parseInt(numA ? numA[0] : 0) - parseInt(numB ? numB[0] : 0);
								});
							}
						} catch (error) {
							console.error("预选词加载失败", error);
						}
					}, 260);
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
				this.saveToHistory(ph);
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
			},
			saveToHistory: function(trainNumber) {
				if (!trainNumber) return;
				this.trainHistory = this.trainHistory.filter(item => item.trainNumber !== trainNumber);
			
				const newHistoryItem = {
					trainNumber: trainNumber.toUpperCase(),
					date: this.today, 
					timestamp: Date.now() 
				};
				this.trainHistory.unshift(newHistoryItem);
				if (this.trainHistory.length > 10) {
					this.trainHistory = this.trainHistory.slice(0, 10);
				}
				
				uni.setStorageSync('trainHistory', this.trainHistory);
			},
			selectFromHistory: function(trainNumber) {
				this.keyword = trainNumber;
				this.fetchPlaceholder();
			},
			clearHistory: function() {
				uni.showModal({
					title: '确认清除',
					content: '确定要清除所有历史记录吗？',
					success: (res) => {
						if (res.confirm) {
							this.trainHistory = [];
							uni.removeStorageSync('trainHistory');
						}
					}
				});
			}
		}
	}
</script>

<style scoped>
.train-keyboard {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 9999;
  background-color: #f2f3f5;
  box-sizing: border-box;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  padding: 8rpx 12rpx 12rpx;
  padding-bottom: calc(12rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
  transform: translateY(100%);
  visibility: hidden;
  pointer-events: none;
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0s 280ms;
  box-shadow: 0 -8rpx 32rpx rgba(17, 69, 152, 0.08);
}
.train-keyboard-open {
  transform: translateY(0);
  visibility: visible;
  pointer-events: auto;
  transition-delay: 0s;
}
.keyboard-head {
  display: flex;
  justify-content: flex-end;
  padding: 4rpx 6rpx 8rpx 0;
}
.switch-system {
  font-size: 24rpx;
  color: #9aa0a6;
  padding: 8rpx 12rpx;
  margin: -8rpx -12rpx 0 0;
}
.keyboard-body {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 92rpx;
  gap: 10rpx;
  width: 100%;
}
.key {
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 14rpx;
  font-size: 40rpx;
  font-weight: 400;
  line-height: 1;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 3rpx 0 rgba(25, 40, 65, 0.12);
  transition: background-color 80ms ease, transform 80ms ease, box-shadow 80ms ease;
}
.key:active,
.key.key-pressed {
  background-color: #dde7f5;
  transform: translateY(3rpx) scale(0.96);
  box-shadow: 0 0 0 transparent;
}
.letter-key {
  color: #e58a2f;
}
.number-key {
  color: #1c1c1c;
}
.key-wide {
  grid-column: span 2;
}
.confirm-key {
  color: #2f7cf6;
  font-size: 32rpx;
  font-weight: 500;
}
.confirm-key:active {
  background-color: #e9f1ff;
}
.backspace-icon {
  position: relative;
  width: 42rpx;
  height: 30rpx;
  border: 2.5rpx solid #424242;
  border-radius: 8rpx;
  box-sizing: border-box;
}
.backspace-icon::before,
.backspace-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 17rpx;
  height: 2.5rpx;
  background-color: #424242;
  border-radius: 2rpx;
}
.backspace-icon::before {
  transform: translate(-50%, -50%) rotate(45deg);
}
.backspace-icon::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}
/* 历史记录项目样式 */
.history-list {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}
.history-item {
  transition: all 0.2s ease;
}
.history-item:active {
  transform: scale(0.95);
  opacity: 0.7;
}
</style>