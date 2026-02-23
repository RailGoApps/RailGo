<template>
	<view class="ux-bg-grey6" style="min-height:100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>
		<view class="ux-padding-large">
			<view class="ux-mt-large">
				<text class="ux-h1">测试版本警告</text><br><br>
				<text class="ux-h6">您正在使用一个测试版本。</text><br><br>
				<text class="ux-h6">本版本可能包含未被修复的漏洞或未完全实现的功能，也可能包含未确认或暂未取得第三方授权的物料，并非最终发行效果。</text><br><br>
				<text class="ux-h6">因此，本版本不应当用于日常使用。若您不想使用未完成的内容，则请重新下载正式版。</text><br><br>
				<text class="ux-h6 ux-bold">本品品质无保障，请慎重使用。</text><br><br>
			</view>
			<br>
			<br>
			<br>
			<br>
			<br>
			<view class="ux-flex ux-justify-content-end">
				<navigator url="/pages/oobe/mode" hover-class="">
					<button class="primary-button ux-mt-large">
						<text class="icon">&#xe5c8;</text>
					</button>
				</navigator>
			</view>
		</view>
	</view>
</template>

<script>
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
	}
	
	.icon {
		font-size: 40rpx;
	}
</style>