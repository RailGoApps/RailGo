<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>

		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<view
				class="ux-bg-white ux-border-radius-small ux-padding-small ux-flex ux-align-items-center ux-mt-small ux-mb-small">
				<text class="icon">&#xe8b6;</text>
				&nbsp;
				<input type="text" class="ux-form-input" style="width:100%;margin:0 0;" placeholder="搜索车站名"
					@input="inputData" v-model="keyword" />
			</view>
			<view class="ux-border-radius">
			<uni-list>
				<uni-list-item v-for="(item,index) in stationsList" :key="index" class="ux-bg-white" clickable
					@click="clickToSelect(item, $event)">
					<template v-slot:header>
						<text class="ux-flex ux-align-items-center ux-flex1">{{item.name}}站</text>
					</template>
					<template v-slot:body>
						<view class="ux-flex ux-align-items-center ux-justify-content-center" style="flex-direction: row; margin-right: 20rpx;">
							<text v-for="(tag,i) in item.type" :key="i"
								class="ux-badge ux-color-white ux-ml-small"
								:style="'background-color:'+this.badgeFlag[tag]">{{tag}}</text>
						</view>
					</template>
					<template v-slot:footer>
						<view class="ux-flex ux-align-items-center ux-justify-content-end"
							style="flex-direction: row;">
							<text class="ux-text-small ux-opacity-5">{{item.pinyinTriple}}/-{{item.telecode}}</text>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
			</view>
		</view>
		</view>
</template>

<script>
	import {
		doQuery,
	} from "@/scripts/sqlite.js";
	import {
		toRaw
	} from "@vue/reactivity";
	import {
		KEYS_STRUCT_STATIONS,
		KEYS_STRUCT_TRAINS
	} from "@/scripts/config.js";
import {uniGet} from "@/scripts/req";

	export default {
		data() {
			return {
				stationsUsed: [],
				stationsList: [],
				keyword: "",
				badgeFlag: {
					"客": "#114598",
					"货": "#eeba67",
					"高": "#c0392b",
					"行": "#459811",
					"运": "#5499c7"
				},
				resultPlace: ""
			};
		},
		onLoad(options) {
			this.resultPlace = options.resultPlace;
			const mode = uni.getStorageSync("mode");
			this.fillInData(mode);
		},
		methods: {
			back: function() {
				uni.navigateBack()
			},
			inputData: function(e) {
				this.keyword = e.detail.value;
				const mode = uni.getStorageSync("mode");
				this.fillInData(mode);
			},
			fillInData: async function(mode) {
				if (this.keyword == "" || this.keyword == null) {
					this.stationsList = [];
					return;
				}
				if (mode == "network") {
					try {
						const resp = await uniGet(`https://data.railgo.zenglingkun.cn/api/station/preselect?keyword=${encodeURIComponent(this.keyword)}`);
						this.stationsList = resp.data;
					} catch (error) {
						console.error("网络加载失败", error);
						uni.showToast({
							title: '网络加载失败',
							icon: 'none'
						});
					}
				} else { // 本地模式
					try {
						this.stationsList = toRaw(await doQuery(
							"SELECT name, telecode, pinyin, pinyinTriple, type FROM stations WHERE name LIKE '%" + this
							.keyword + "%' OR pinyin LIKE '%" + this.keyword + "%'", ["name", "telecode", "pinyin", "pinyinTriple", "type"])).sort((a, b) => {
							if (a.pinyin < b.pinyin) {
								return -1;
							}
							if (a.pinyin > b.pinyin) {
								return 1;
							}
							return 0;
						});
					} catch (error) {
						console.error("本地加载失败", error);
						uni.showToast({
							title: '本地加载失败',
							icon: 'none'
						});
					}
				}
			},
			clickToSelect: function(item, e) {
				uni.setStorageSync(this.resultPlace, item);
				uni.navigateBack();
			}
		}
	}
</script>

<style>
</style>