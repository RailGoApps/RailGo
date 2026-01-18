<template>
	<view class="ux-bg-grey5" style="height:100vh;">
		<view class="ux-bg-primary" style="height:  var(--status-bar-height);">&nbsp;</view>

		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">鸣谢</text>
		</view>
		<view class="ux-pl ux-pr">
			<uni-section title="开发" type="line" style="background-color: transparent;"
				title-font-size="35rpx"></uni-section>
			<view class="ux-flex ux-space-around ux-justify-content-center">
				<view class="ux-text-center ux-pl ux-pr">
					<image mode="scaleToFill" src="https://q1.qlogo.cn/g?b=qq&s=100&nk=1316280182"
						style="width:100rpx;height:100rpx;border-radius:50%;"></image>
					<br>
					<text class="ux-text-small">辰墨</text>
				</view>
				<view class="ux-text-center ux-pl ux-pr">
					<image mode="scaleToFill" src="https://q1.qlogo.cn/g?b=qq&s=100&nk=572747232"
						style="width:100rpx;height:100rpx;border-radius:50%;"></image>
					<br>
					<text class="ux-text-small">TKP30</text>
				</view>
				<view class="ux-text-center ux-pl ux-pr">
					<image mode="scaleToFill" src="https://q1.qlogo.cn/g?b=qq&s=100&nk=1219439938"
						style="width:100rpx;height:100rpx;border-radius:50%;"></image>
					<br>
					<text class="ux-text-small">姜胤</text>
				</view>
				<view class="ux-text-center ux-pl ux-pr">
					<image mode="scaleToFill" src="https://q1.qlogo.cn/g?b=qq&s=100&nk=3776473661"
						style="width:100rpx;height:100rpx;border-radius:50%;"></image>
					<br>
					<text class="ux-text-small">mstouk57g</text>
				</view>
			</view>
		</view>
		<view class="ux-pl ux-pr">
			<uni-section title="特别鸣谢" type="line" style="background-color: transparent;"
				title-font-size="35rpx"></uni-section>
			<view class="ux-flex ux-space-around ux-justify-content-center">
				<view class="ux-text-center ux-pl ux-pr">
					<image mode="scaleToFill" src="https://q1.qlogo.cn/g?b=qq&s=100&nk=3068342155"
						style="width:100rpx;height:100rpx;border-radius:50%;"></image>
					<br>
					<text class="ux-text-small">XieXiLin</text>
				</view>
				<view class="ux-text-center ux-pl ux-pr">
					<image mode="scaleToFill" src="https://q1.qlogo.cn/g?b=qq&s=100&nk=2396807944"
						style="width:100rpx;height:100rpx;border-radius:50%;"></image>
					<br>
					<text class="ux-text-small">bcdt</text>
				</view>
			</view>
		</view>

		<view class="ux-pl ux-pr">
			<uni-section title="数据源" type="line" style="background-color: transparent;"
				title-font-size="35rpx"></uni-section>
			<uni-table border stripe>
				<uni-tr>
					<uni-th align="center">数据源</uni-th>
					<uni-th align="center">官网</uni-th>
					<uni-th align="left">相关功能</uni-th>
				</uni-tr>
				<uni-tr v-for="(item,index) in dataSources" :key="index">
					<uni-td>{{item.source}}</uni-td>
					<uni-td>
						<navigator :url="'https://' + item.website" hover-class="none" open-type="navigate">
							<text class="ux-text-primary" style="color:#114598;">{{item.website}}</text>
						</navigator>
					</uni-td>
					<uni-td>{{item.function}}</uni-td>
				</uni-tr>
			</uni-table>
		</view>
		<view class="ux-pl ux-pr">
			<uni-section title="其他" type="line" style="background-color: transparent;"
				title-font-size="35rpx"></uni-section>
			<view class="ux-flex ux-space-around ux-justify-content-center">
				<view class="ux-text-center ux-pl ux-pr">
					慈云数据 (zovps.com) <br> 提供云计算支持
				</view>
			</view>
		</view>

		<view class="ux-pl ux-pr">
			<uni-section title="动车组图片" type="line" style="background-color: transparent;"
				title-font-size="35rpx"></uni-section>
			<image mode="scaleToFill" v-for="(nk, index) in picgive" :key="nk"
				:src="`https://q1.qlogo.cn/g?b=qq&s=100&nk=${nk}`" style="width:90rpx;height:90rpx;border-radius:50%;"
				class="ux-ml-small ux-r-small"></image><br><text class="ux-bold">可在tp.railgo.zenglingkun.cn提交车图</text>
		</view>
		
		<view class="ux-pl ux-pr">
			<br><text class="ux-bold">可在center.railgo.dev进行反馈</text>
			<uni-section title="反馈" type="line" style="background-color: transparent;"
				title-font-size="35rpx"></uni-section>
			<image mode="scaleToFill" v-for="(nk, index) in items" :key="nk"
				:src="`https://q1.qlogo.cn/g?b=qq&s=100&nk=${nk}`" style="width:80rpx;height:80rpx;border-radius:50%;"
				class="ux-ml-small ux-r-small"></image>
		</view>
	</view>
</template>
<script>
	import {
		uniGet
	} from "@/scripts/req.js";

	export default {
		// Railgo Code
		data() {
			return {
				items: [],
				picgive: ["1972867189", "2151235831", "1069943593", "525637945", "3596323062", "2377807972", "982588465",
					"1779378782", "516127399", "2533221373", "2387845184", "365736548", "1983163227", "3111737636"
				],
				// 数据源列表
				dataSources: [{
						source: 'RailGo.Parser',
						website: 'railgo.dev',
						function: '车次、车站'
					},
					{
						source: 'MoeFactory车厢',
						website: 'rail.moefactory.com',
						function: '正晚点、配属'
					},
					{
						source: 'rail.re',
						website: 'rail.re',
						function: '动车组担当'
					},
					{
						source: '车站小屏',
						website: '12036.com',
						function: '车站大屏'
					}
				]
			};
		},
		mounted() {
			this.fetchData(); // 获取反馈列表
			this.fetchPicgiveUsers(); // 获取动车组图片贡献者列表
		},
		methods: {
			back: function() {
				uni.navigateBack()
			},
			async fetchData() {
				try {
					const Response = await uniGet("https://feedback.railgo.dev/api/get_users");
					this.items = Response.data.users;
				} catch (error) {
					console.error('Error fetching data:', error);
					this.items = [];
				}
			},

			// 新增方法：获取并合并动车组图片贡献者列表
			async fetchPicgiveUsers() {
				try {
					const apiUrl = 'https://tp.railgo.zenglingkun.cn/api/user';
					// 使用 uniGet 请求新接口
					const response = await uniGet(apiUrl);

					let remoteUsers = [];
					// 检查响应格式是否符合预期：{ code: 200, data: [id1, id2, ...] }
					if (response.data && Array.isArray(response.data.data)) {
						remoteUsers = response.data.data.map(String); // 确保所有ID都是字符串
					}

					// 1. 合并本地和远程列表
					const combinedList = [...this.picgive, ...remoteUsers];

					// 2. 去重并更新 picgive
					this.picgive = Array.from(new Set(combinedList));

					console.log("动车组图片用户列表更新成功");

				} catch (error) {
					console.warn("获取动车组图片用户列表失败，使用本地默认列表", error);
					// 失败时，this.picgive 保持 data() 中定义的本地列表不变
				}
			}
		}
	};
</script>

<style>
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
</style>