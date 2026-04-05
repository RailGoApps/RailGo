<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<!-- headers begin -->
		<view class="ux-bg-primary" style="height: var(--status-bar-height);">&nbsp;</view>
		<view class="ux-padding">
			<view hover-class="ux-bg-grey8" @click="back">
				<text class="icon" style="font-size: 45rpx;">&#xe5c4;</text>
			</view>
			<br>
			<text class="ux-h2">隐私政策</text>
		</view>
		<!-- headers end -->
		<!-- Main content -->
		<view class="ux-padding">
			<text>
				<p><strong>最后更新日期：2026年3月17日</strong></p>
				<br>
				<p>RailGo 是由 AZ Studio （以下简称“我们”）为您提供的，用于便捷铁路信息查询的应用。本隐私声明由我们为处理您的个人信息而制定。</p>
				<p>我们非常重视您的个人信息和隐私保护，将会按照法律要求和业界成熟的安全标准，为您的个人信息提供相应的安全保护措施。</p>
				<br>
				<p><strong>1. 我们如何收集和使用您的个人信息</strong></p>
				<p>我们仅在有合法性基础的情形下才会使用您的个人信息。根据适用的法律，我们可能会基于您的同意、为履行/订立您与我们的合同所必需、履行法定义务所必需等合法性基础，使用您的个人信息。</p>
				<br>
				<p><strong>1.1 我们为您提供下述信息查询功能</strong></p>
				<p>在您使用相关业务的过程中，我们会处理所必需的信息，以便履行我们的合同义务。若您不提供相关信息，会影响到您使用本应用的相关功能/服务。</p>
				<ul>
					<li>为了用于分析：基于履行我们的合同义务，我们需要收集您的文字信息、搜索词、浏览记录、应用基本信息、应用运行日志。</li>
					<li>为了实现应用功能：在获取您的同意后，我们需要收集您的GPS 位置、其他大致位置信息。</li>
				</ul>
				<br>
				<p><strong>2. 管理您的个人信息</strong></p>
				<p>如您对您的数据主体权利有进一步要求或存在任何疑问、意见或建议，可通过本声明中“如何联系我们”章节中所述方式与我们取得联系，并行使您的相关权利。</p>
				<br>
				<p><strong>3. 信息存储地点及期限</strong></p>
				<p><strong>3.1 存储期限</strong><br>我们承诺，除法律法规另有规定外，我们对您的信息的保存期限应当为实现处理目的所必要的最短时间。</p>
				<p><strong>3.2 存储地点</strong><br>上述信息将会传输并保存至中国大陆的服务器。</p>
				<br>
				<p><strong>4. 如何联系我们</strong></p>
				<p>您可通过以下方式联系我们，并行使您的相关权利，我们会尽快回复。</p>
				<ul><li>邮箱：ChenMo@smart-teach.cn</li></ul>
				<p>如果您对我们的回复不满意，特别是当个人信息处理行为损害了您的合法权益时，您还可以通过向有管辖权的人民法院提起诉讼、向行业自律协会或政府相关管理机构投诉等外部途径进行解决。您也可以向我们了解可能适用的相关投诉途径的信息。</p>
				<br>
				<p><strong>生效日期：2026年3月17日</strong></p>
				<br>
				<br>
			</text>
		</view>
	</view>
</template>

<script>
	export default {
		methods: {
			back: function() {
				uni.navigateBack()
			}
		}
	}
</script>

<style>

</style>