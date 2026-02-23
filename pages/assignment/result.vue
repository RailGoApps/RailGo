<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
	<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>
		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">{{keyword}}</text>
		</view>
		<view class="ux-pl ux-pr ux-pb">
			<view v-if="!isValidKeyword" class="ux-text-center ux-padding-small ux-mb ux-h6 ux-text-center ux-text-red">
				<text class="ux-bold">输入值有误</text>
			</view>
			
			<uni-table border stripe :loading="loading" v-if="isValidKeyword">
				<uni-tr>
						<uni-th align="center" width="100px">车型</uni-th>
						<uni-th align="center" width="80px">车号</uni-th>
						<uni-th align="center">配属路局</uni-th>
						<uni-th align="center">配属动车所</uni-th>
						<uni-th align="center">生产厂家</uni-th>
						<uni-th align="left">备注</uni-th>
				</uni-tr>
					<uni-tr v-for="(item,index) in data" :key="index">
						<uni-td>{{item.trainModel}}</uni-td>
						<uni-td>{{item.trainSerialNumber}}</uni-td>
						<uni-td>{{item.bureau}}</uni-td>
						<uni-td>{{item.department}}</uni-td>
						<uni-td>{{item.manufacturer}}</uni-td>
						<uni-td>{{item.remark}}</uni-td>
					</uni-tr>
			</uni-table>
			
			<view v-if="data.length === 0 && !loading && isValidKeyword" class="ux-text-center ux-padding">
				<text class="ux-opacity-6">—— 暂无数据 ——</text>
			</view>

			<view v-if="data.length > 0" class="ux-flex ux-row ux-justify-content-center ux-mt">
				<button :disabled="cursor === 0" @click="prevPage" 
					class="ux-button ux-button-small ux-mr">上一页</button>
				<button :disabled="!hasMore" @click="nextPage" 
					class="ux-button ux-button-small ux-ml">下一页</button>
			</view>
			<view v-if="data.length > 0" class="ux-text-center ux-text-small ux-opacity-6 ux-mt-small">
				当前页 {{ currentPage }} / 总页数 {{ totalPages }} (总记录数 {{ totalCount }})
			</view>

			<br>
			<view class="ux-flex ux-row ux-justify-content-center">
				<text class="ux-text-small ux-opacity-4">—— 数据来源: Moefactory ——</text>
			</view>
		</view>
	</view>
</template>

<script>
import {uniPost} from "@/scripts/req.js"; 
	export default {
		data() {
			return {
				"keyword": "",
				"future": true,
				"data": [],
				"cursor": 0, 
				"count": 15, 
				"hasMore": false, 
				"totalCount": 0, 
				"loading": false, 
				"isValidKeyword": true 
			}
		},
		computed: {
			// 判断 keyword 是否为纯数字 (用于 trainSerialNumber)
			isPureNumber() {
				return /^\d+$/.test(this.keyword); 
			},
			// 判断 keyword 是否包含字母和数字 (用于 trainModel)
			isAlphanumeric() {
				// 匹配包含至少一个字母和至少一个数字的字符串
				return /[a-zA-Z]/.test(this.keyword) && /\d/.test(this.keyword);
			},
			// 计算当前页码
			currentPage() {
				return Math.floor(this.cursor / this.count) + 1;
			},
			// 计算总页数
			totalPages() {
				if (this.totalCount === 0) return 0;
				// Math.ceil(总数 / 每页数量)
				return Math.ceil(this.totalCount / this.count);
			}
		},
		onLoad(options) {
			this.keyword = options.keyword ? options.keyword.toUpperCase() : ''; // 统一转大写处理，以便匹配型号
			this.future = options.future;
			this.cursor = 0; 

			// 检查关键字是否有效，如果有效才进行数据填充
			if (this.isPureNumber || this.isAlphanumeric) {
				this.isValidKeyword = true;
				this.fillInData();
			} else {
				this.isValidKeyword = false;
			}
			
			// 保持原有的存储逻辑
			const c = uni.getStorageSync("search");
			uni.setStorage({
				key: 'search',
				data: (c || 0) + 1
			});
		},
		onShow() {
			// 保持原有的设置状态栏颜色
			plus.navigator.setStatusBarBackground('#eeeeee');
		},
		methods: {
			back: function() {
				uni.navigateBack()
			},
			// 切换到上一页
			prevPage() {
				if (this.cursor > 0) {
					this.cursor -= this.count;
					this.fillInData(true);
				}
			},
			// 切换到下一页
			nextPage() {
				if (this.hasMore) {
					this.cursor += this.count;
					this.fillInData(true);
				}
			},
			
			fillInData: async function(isPaging = false) {
				if (!this.isValidKeyword) return; 

				if (!isPaging) {
					uni.showLoading({ title: "加载中" });
				}
				this.loading = true;
				if (!isPaging) {
					this.data = []; // 首次查询和非翻页时清空数据
				}
				
				// 确定查询类型
				let queryType = '';
				if (this.isPureNumber) {
					queryType = 'trainSerialNumber';
				} else if (this.isAlphanumeric) {
					queryType = 'trainModel';
				} else {
					this.isValidKeyword = false;
					this.loading = false;
					uni.hideLoading();
					return;
				}
				
			    try {
			        const apiUrl = 'https://delay.data.railgo.zenglingkun.cn/api/trainAssignment/queryEmu';
			        
			        const postData = {
			            type: queryType, 
			            keyword: this.keyword,
			            trainCategory: 1, 
			            cursor: this.cursor,
			            count: this.count
			        };
			        
			        const response = await uniPost(apiUrl, postData);
			        
			        if (response.data.code === 200 && response.data.data) {
			            const result = response.data.data;
			            this.data = result.data || [];
			            this.hasMore = result.hasMore || false;
			            this.totalCount = result.totalCount || 0;

						// **新逻辑：首次查询无数据则跳转 404**
						if (!isPaging && this.cursor === 0 && this.data.length === 0) {
							uni.redirectTo({
								url: '/pages/404/404'
							});
						}

			        } else {
			            throw new Error(response.data.message || `查询失败，状态码: ${response.data.code}`);
			        }
			        
			    } catch (error) {
			        console.error("数据加载失败", error);
			        uni.showToast({
			            title: error.message || "数据加载失败，请检查网络",
			            icon: "none",
			            duration: 2000
			        });
			        this.data = []; // 清空数据
			    } finally {
			        uni.hideLoading(); 
			        this.loading = false;
			    }
			},
			
			// 原有的导航方法已无用
			getTrainNavigatorURL: function(item){ return ''; },
			getCarNavigatorURL: function(item, index){ return ''; }
		}
	}
</script>

<style>
/* 确保 ux-button 样式存在 */
.ux-button {
    background-color: #114598;
    color: white;
    padding: 5rpx 20rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    line-height: 1.5;
}
.ux-button-small {
    font-size: 26rpx;
    padding: 3rpx 15rpx;
}
.ux-button[disabled] {
    background-color: #cccccc;
    color: #666666;
}
.ux-text-red {
	color: #e54d42;
}
</style>