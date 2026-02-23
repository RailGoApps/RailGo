
<template>
	<view class="ux-bg-grey6" style="min-height:100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>
		<view class="ux-padding-large">
			<view class="ux-mt-large">
				<text class="ux-h1">马上开始...</text><br><br>
				<text class="ux-h6">正在下载离线数据库。</text><br><br>
				<text>{{err}}</text>
				<progress :percent="downloadProgress" show-info stroke-width="3" activeColor="#114598" />
			</view>
		</view>
	</view>
</template>
<script>
import {uniGet} from "@/scripts/req.js";
	import {
		loadDB
	} from "@/scripts/sqlite.js";
	const saveFileAsync = (tempFilePath) => {
		return new Promise((resolve, reject) => {
			uni.saveFile({
				tempFilePath: tempFilePath,
				success: res => resolve(res),
				fail: err => reject(err)
			});
		});
	};

	const decompressAsync = (filePath, targetDir) => {
		return new Promise((resolve, reject) => {
			plus.zip.decompress(filePath, targetDir, resolve, reject);
		});
	};

	export default {
		data() {
			return {
				downloadProgress: 0,
				err: ""
			}
		},
		async onReady() {
		    // #ifdef APP-PLUS
		    try {
		        const dbUrlResponse = await uniGet("https://api.state.railgo.zenglingkun.cn/api/v1/url/db");
		        const downloadUrl = dbUrlResponse.data.url;
		
		        const downloadResult = await new Promise((resolve, reject) => {
		            const downloadTask = uni.downloadFile({
		                url: downloadUrl,
		                success: res => {
		                    if (res.statusCode === 200) {
		                        resolve(res);
		                    } else {
		                        reject(new Error(`下载失败，状态码: ${res.statusCode}`));
		                    }
		                },
		                fail: err => reject(err)
		            });
		            downloadTask.onProgressUpdate((res) => {
		                this.downloadProgress = res.progress;
		            });
		        });
		
		        // 确保临时文件存在
		        if (!downloadResult.tempFilePath) {
		            throw new Error("未获取到临时文件路径");
		        }
		
		        // 保存文件
		        this.err = "正在保存文件...";
		        const savedFile = await saveFileAsync(downloadResult.tempFilePath);
		        
		        // 解压文件
		        this.err = "正在解压文件...";
		        await decompressAsync(savedFile.savedFilePath, "_doc/");
		        
		        // 获取数据库信息
		        this.err = "正在获取数据库信息...";
		        const finalInfoResponse = await uniGet("https://api.state.railgo.zenglingkun.cn/api/v1/info");
		        
		        if (finalInfoResponse.status === 200) {
		            uni.setStorageSync("offlineDataVersion", finalInfoResponse.data.latest_db);
		            uni.setStorageSync("offlineDataVersionText", finalInfoResponse.data.db);
		        } else {
		            throw new Error("获取数据库信息失败: " + JSON.stringify(finalInfoResponse.data));
		        }
		
		        // 加载数据库
		        this.err = "正在加载数据库...";
		        await loadDB();

		
		        // 设置完成标志并跳转
		        uni.setStorageSync("oobe", true);
		        uni.setStorageSync("mode", "local");
		        uni.reLaunch({ 
		            url: '/pages/index/index' 
		        });
		
		    } catch (e) {
		        console.error("下载或初始化过程中发生错误:", e);
		        this.err = "发生错误: " + (e.message || JSON.stringify(e));
		        uni.showModal({
		            title: "错误",
		            content: "下载或加载数据库失败: " + e.message,
		            showCancel: false
		        });
		    }
		    // #endif
		
		    // #ifdef H5
		    uni.setStorageSync("oobe", true);
		    uni.setStorageSync("mode", "network");
		    uni.reLaunch({ 
		        url: '/pages/index/index' 
		    });
		    // #endif
		},
		methods: {
		}
	}
</script>

<style>
	.primary-button {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		text-align: center;
		line-height: 100rpx;
		background-color: #114598;
		color: #fff;
		margin-top: 80rpx;
	}

	.icon {
		font-size: 40rpx;
	}
</style>
