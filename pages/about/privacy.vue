<template>
	<view class="ux-bg-grey5" style="min-height:100vh;">
		<!-- headers begin -->
		<view class="ux-bg-primary" style="height:  var(--status-bar-height);">&nbsp;</view>
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
				<p>欢迎使用 <strong>RailGo</strong>（以下简称"本软件"）！为保障您的个人信息安全，在您使用本软件前，请仔细阅读并同意以下隐私政策：</p>
				<br>
				<p><strong>更新日期：2025/11/24</strong></p>
				<p><strong>生效日期：2025/11/24</strong></p>
				<br>
				<p>一、本软件由<strong>AZ Studio</strong>（以下简称"我们"）提供。您在使用我们的服务时，我们可能会收集和使用您的相关信息。</p>
				<br>
				<p>二、<strong>我们收集的信息</strong></p>
				<p>我们或我们的第三方合作伙伴提供服务时，可能会收集、储存和使用下列与您有关的信息：</p>
				<ul>
					<li><strong>位置信息</strong>：指您开启设备定位功能并使用我们基于位置提供的相关服务时，收集的有关您位置的信息。</li>
					<li>您通过具有定位功能的移动设备使用我们的服务时，通过GPS或WiFi等方式收集的您的地理位置信息。</li>
					<li>您可以通过关闭定位功能，停止对您的地理位置信息的收集。</li>
				</ul>
				<br>
				<p>三、<strong>信息的存储</strong></p>
				<ul>
					<li>我们会通过安全的方式存储您的信息，包括本地存储、数据库和服务器日志。</li>
					<li>一般情况下，我们只会在为实现服务目的所必需的时间内或法律法规规定的条件下存储您的个人信息。</li>
					<li>我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内。</li>
				</ul>
				<br>
				<p>四、<strong>信息安全</strong></p>
				<p>我们使用各种安全技术和程序，以防信息的丢失、不当使用、未经授权阅览或披露。但请您理解，由于技术的限制以及可能存在的各种恶意手段，在互联网行业，即便竭尽所能加强安全措施，也不可能始终保证信息百分之百的安全。</p>
				<br>
				<p>五、<strong>我们如何使用信息</strong></p>
				<p>我们可能将在向您提供服务的过程之中所收集的信息用作下列用途：</p>
				<ul>
					<li>向您提供服务；</li>
					<li>在我们提供服务时，用于身份验证、客户服务、安全防范、诈骗监测、存档和备份用途；</li>
					<li>帮助我们设计新服务，改善我们现有服务；</li>
					<li>使我们更加了解您如何接入和使用我们的服务，从而针对性地回应您的个性化需求。</li>
				</ul>
				<br>
				<p>六、<strong>信息共享</strong></p>
				<p>目前，我们不会主动共享或转让您的个人信息至第三方，如存在其他共享或转让您的个人信息或您需要我们将您的个人信息共享或转让至第三方情形时，我们会直接或确认第三方征得您对上述行为的明示同意。</p>
				<br>
				<p>七、<strong>您的权利</strong></p>
				<p>在您使用我们的服务期间，我们可能会视产品具体情况为您提供相应的操作设置，以便您可以查询、删除、更正或撤回您的相关个人信息。</p>
				<br>
				<p>八、<strong>变更</strong></p>
				<p>我们可能适时修订本《隐私政策》的条款。当变更发生时，我们会在版本更新时向您提示新的《隐私政策》，并向您说明生效日期。</p>
				<br>
				<p>九、<strong>未成年人保护</strong></p>
				<p>我们鼓励父母或监护人指导未满十八岁的未成年人使用我们的服务。我们建议未成年人鼓励他们的父母或监护人阅读本《隐私政策》，并建议未成年人在提交的个人信息之前寻求父母或监护人的同意和指导。</p>
				<br>
				<p>继续使用本软件即视为您已阅读并同意上述条款。</p>
				<br>
				<p>如对本《隐私政策》或相关事宜有任何问题，请通过 <strong>zenglingkun@zenglingkun.cn</strong> 与我们联系。</p>
				<br>
				<p><strong>AZ Studio</strong></p>
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