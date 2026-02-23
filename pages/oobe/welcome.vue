<template>
	<view class="ux-bg-grey6" style="min-height:100vh;">
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>
		<view class="ux-padding-large">
			<view class="ux-mt-large">
				<view class="ux-mt-large">
					<text class="ux-h1">欢迎使用!</text><br><br>
					<text class="ux-h6">在使用之前，让我们先进行一些设置。</text>
				</view>
				<br>
				<br>
				<br>
				<br>
				<br>
				<view class="ux-flex ux-justify-content-end">
					<navigator url="/pages/oobe/protocol" hover-class="">
						<button class="primary-button ux-mt-large">
							<text class="icon">&#xe5c8;</text>
						</button>
					</navigator>
				</view>
			</view>
		</view>
	</view>
</template>

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