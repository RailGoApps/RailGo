<template>
	<view class="ux-bg-grey5 root-container">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);"></view>

		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back" style="display: inline-block; padding: 10rpx;">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<view style="margin-top: 20rpx;">
				<text class="ux-h2">鸣谢</text>
			</view>
		</view>

		<view class="ux-pl ux-pr ux-pb">
			<uni-section title="开发" type="line" title-font-size="35rpx" class="no-bg-section"></uni-section>
			<view class="ux-flex ux-row ux-justify-content-center">
				<view class="developer-item" v-for="user in developers" :key="user.name">
					<image mode="scaleToFill" :src="user.avatar" class="avatar-lg"></image>
					<view class="name-container">
						<text class="ux-text-small">{{ user.name }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="ux-pl ux-pr ux-pb">
			<uni-section title="特别鸣谢" type="line" title-font-size="35rpx" class="no-bg-section"></uni-section>
			<view class="ux-flex ux-row ux-justify-content-center">
				<view class="developer-item" v-for="user in specialThanks" :key="user.name">
					<image mode="scaleToFill" :src="user.avatar" class="avatar-lg"></image>
					<view class="name-container">
						<text class="ux-text-small">{{ user.name }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="ux-pl ux-pr ux-pb">
			<uni-section title="数据源" type="line" title-font-size="35rpx" class="no-bg-section"></uni-section>
			<uni-table border stripe>
				<uni-tr>
					<uni-th align="center" width="100rpx">数据源</uni-th>
					<uni-th align="center">官网</uni-th>
					<uni-th align="left">相关功能</uni-th>
				</uni-tr>
				<uni-tr v-for="(item, index) in dataSources" :key="index">
					<uni-td align="center">{{ item.source }}</uni-td>
					<uni-td align="center">
						<text class="link-text" @click="openLink(item.website)">{{ item.website }}</text>
					</uni-td>
					<uni-td>{{ item.function }}</uni-td>
				</uni-tr>
			</uni-table>
		</view>

		<view class="ux-pl ux-pr ux-pb">
			<uni-section title="其他" type="line" title-font-size="35rpx" class="no-bg-section"></uni-section>
			<view class="ux-text-center ux-padding-sm">
				<text class="ux-text-grey7" style="font-size: 24rpx;">慈云数据 (zovps.com) 提供云计算支持</text>
			</view>
		</view>

		<view class="ux-pl ux-pr ux-pb" v-if="zz.length > 0">
			<uni-section title="赞助" type="line" title-font-size="35rpx" class="no-bg-section"></uni-section>
			<view class="avatar-group">
				<image mode="scaleToFill" v-for="(nk, index) in zz" :key="index"
					:src="`https://q1.qlogo.cn/g?b=qq&s=100&nk=${nk}`" class="avatar-sm"></image>
			</view>
		</view>

		<view class="ux-pl ux-pr ux-pb">
			<uni-section title="动车组图片" type="line" title-font-size="35rpx" class="no-bg-section"></uni-section>
			<view class="avatar-group">
				<image mode="scaleToFill" v-for="(nk, index) in picgive" :key="index"
					:src="`https://q1.qlogo.cn/g?b=qq&s=100&nk=${nk}`" class="avatar-sm"></image>
			</view>
			<view class="ux-mt-small">
				<text class="ux-bold ux-text-primary tip-text">可在 tp.railgo.zenglingkun.cn 提交车图</text>
			</view>
		</view>

		<view class="ux-pl ux-pr ux-pb">
			<uni-section title="反馈" type="line" title-font-size="35rpx" class="no-bg-section"></uni-section>
			<view class="avatar-group">
				<image mode="scaleToFill" v-for="(nk, index) in items" :key="index"
					:src="`https://q1.qlogo.cn/g?b=qq&s=100&nk=${nk}`" class="avatar-xs"></image>
			</view>
			<view class="ux-mt-small">
				<text class="ux-bold ux-text-primary tip-text">可在 center.railgo.dev 进行反馈</text>
			</view>
		</view>
		
		<view style="height: 60rpx;"></view>
	</view>
</template>

<script>
	import { uniGet } from "@/scripts/req.js";

	export default {
		data() {
			return {
				items: [],
				developers: [
					{ name: '辰墨', avatar: 'https://q1.qlogo.cn/g?b=qq&s=100&nk=1316280182' },
					{ name: 'TKP30', avatar: 'https://q1.qlogo.cn/g?b=qq&s=100&nk=572747232' },
					{ name: '姜胤', avatar: 'https://q1.qlogo.cn/g?b=qq&s=100&nk=1219439938' },
					{ name: 'mstouk57g', avatar: 'https://q1.qlogo.cn/g?b=qq&s=100&nk=3776473661' }
				],
				specialThanks: [
					{ name: 'XieXiLin', avatar: 'https://q1.qlogo.cn/g?b=qq&s=100&nk=3068342155' },
					{ name: 'bcdt', avatar: 'https://q1.qlogo.cn/g?b=qq&s=100&nk=2396807944' }
				],
				picgive: ["1972867189", "2151235831", "1069943593", "525637945", "3596323062", "2377807972", "982588465",
					"1779378782", "516127399", "2533221373", "2387845184", "365736548", "1983163227", "3111737636"
				],
				zz: [],
				dataSources: [
					{ source: 'RailGo.Parser', website: 'railgo.dev', function: '车次、车站、正晚点' },
					{ source: 'MoeFactory车厢', website: 'rail.moefactory.com', function: '配属' },
					{ source: 'rail.re', website: 'rail.re', function: '动车组担当' },
					{ source: '车站小屏', website: '12036.com', function: '车站大屏' }
				]
			};
		},
		mounted() {
			this.fetchData();
			this.fetchPicgiveUsers();
			this.fetchsUsers();
		},
		methods: {
			back() {
				uni.navigateBack();
			},
			openLink(url) {
				
				uni.setClipboardData({
					data: 'https://' + url,
					success: () => uni.showToast({ title: '链接已复制', icon: 'none' })
				});
				
			},
			async fetchData() {
				try {
					const res = await uniGet("https://feedback.railgo.dev/api/get_users");
					if (res.data && res.data.users) this.items = res.data.users;
				} catch (e) { console.error(e); }
			},
			async fetchPicgiveUsers() {
				try {
					const res = await uniGet('https://tp.railgo.zenglingkun.cn/api/user');
					if (res.data && Array.isArray(res.data.data)) {
						const remote = res.data.data.map(String);
						this.picgive = Array.from(new Set([...this.picgive, ...remote]));
					}
				} catch (e) { console.warn(e); }
			},
			async fetchsUsers() {
				try {
					const res = await uniGet('https://zz.railgo.dev/api/sponsors');
					if (res.data && Array.isArray(res.data)) {
						this.zz = res.data.map(String);
					}
				} catch (e) { console.warn(e); }
			}
		}
	};
</script>

<style>
	page {
		background-color: #F8F8F8; 
	}

	.root-container {
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.no-bg-section {
		background-color: transparent !important;
	}

	.developer-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 160rpx; 
		margin-bottom: 20rpx;
	}

	.name-container {
		margin-top: 10rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-lg {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background-color: #eee;
		border: 2rpx solid #fff;
	}

	.avatar-sm {
		width: 90rpx;
		height: 90rpx;
		border-radius: 50%;
		margin: 8rpx;
	}

	.avatar-xs {
		width: 70rpx;
		height: 70rpx;
		border-radius: 50%;
		margin: 6rpx;
	}

	.avatar-group {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		padding-left: 10rpx;
	}

	.link-text {
		color: #114598;
		text-decoration: underline;
		font-size: 24rpx;
	}
	
	.tip-text {
		font-size: 24rpx;
		opacity: 0.8;
	}
	
	.ux-mt-small { margin-top: 10rpx; }
	.ux-pb { padding-bottom: 30rpx; }
</style>