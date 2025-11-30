<template>
  <view class="ux-bg-grey6" style="min-height:100vh;">
    <view class="ux-bg-primary" style="height:  var(--status-bar-height);">&nbsp;</view>
    <view class="ux-padding-large">
      <view class="ux-mt-large">
        <text class="ux-h1">用户协议</text><br><br>
        <text class="ux-h6">请您仔细阅读用户协议内容，并确保您充分知晓协议中规定的允许和不允许事项。</text><br><br>
        <scroll-view class="ux-bg-white ux-border ux-border-radius" scroll-y="true" style="max-height:40vh;">
          <view class="ux-padding">
            <text>
              <p>欢迎使用 <strong>RailGo</strong>（以下简称"本软件"）！为保障您的合法权益，在您使用本软件前，请仔细阅读并同意以下条款：</p>
              <br>
              <p>一、本软件非官方软件，与中国国家铁路集团总公司、中国铁道科学研究院集团有限公司等铁路运营企业及其下级企业单位<strong>无任何隶属关系。</strong></p>
              <br>
              <p>二、本软件系为相关人士提供信息收集与整理的软件，提供的所有数据均为计算机采集获得，仅供学习参考，不保证实时性、准确性或完整性。用户应自行核对信息并选择采信。</p>
              <br><br>
              <p>三、本软件系开放源代码软件，对用户的修改与使用<strong>无任何管辖和控制力</strong>。因依赖本软件数据所产生的一切纠纷、事件（包括但不限于误车、错乘等）及后果，由用户个人承担，软件开发组不负连带责任。</p>
              <br>
              <p>四、本软件所采集数据均来自合法公开的官方渠道，不涉及任何涉密或未公开内容。开发组已尽力对敏感信息进行消除，但因上述数据来源工作疏忽，导致信息错误或涉密信息被刊载上网，经由本软件传播的，本软件开发组不负连带责任。</p>
              <br><br>
              <p>五、禁止将本软件提供的数据、代码或衍生内容用于以下用途：</p>
              <ul>
                <li>从事违反中华人民共和国法律法规，违背公序良俗的行为。</li>
                <li>从事损害他人合法权利，损害任何主体名誉的行为。</li>
                <li>意图利用或引用本软件信息，分析涉密或未公开的关键交通基础设施信息。</li>
                <li>要求铁路营运企业以本软件所刊载信息数据为准进行任何形式的服务，无理取闹，扰乱铁路运营秩序。</li>
                <li>将数据、软件及上述两者的修改品用于商业盈利用途，包括但不限于售卖、广告、增值服务等。</li>
                <li>在不标明来源的情况下，转载本软件所载数据或作软件修改。</li>
                <li>法律法规规定的其他情况。</li>
              </ul>
              <br>
              <p>六、本软件为公益软件，<strong>无法对服务稳定性做出保证</strong>。本软件可能因政策、技术或不可抗力因素随时调整或终止服务，开发组将尽义务提供有关信息。</p>
              <br>
              <p>七、开发者保留对本协议的最终解释权及修改权，更新后的协议自发布即生效。开发组有义务及时明确公布修改后的条款。</p>
              <br>
              <p>继续使用本软件即视为您已阅读并同意上述条款。</p>
              <br><br>
              <p><strong>AZ Studio</strong></p>
            </text>
          </view>
        </scroll-view>
        <br>
        <label class="checkbox-container" @click="toggleCheck" >
          <checkbox :checked="checked" class="ux-color-primary" @click="toggleCheck" style="transform:scale(0.8)" />
          <text style="font-size: 27rpx;margin-left: 10rpx;">我已认真阅读并同意用户协议</text>
        </label>
      </view>
      <view class="ux-flex ux-justify-content-end">
        <navigator :url="url" hover-class="">
          <button class="primary-button" :style="'background-color:' + bgc">
            <text class="icon">&#xe5c8;</text>
          </button>
        </navigator>
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
    background-color: gray;
    color: #fff;
    margin-top: 80rpx;
  }

  .icon {
    font-size: 40rpx;
  }

  .checkbox-container {
    display: flex;
    align-items: center;
  }
</style>

<script>
  export default {
    data() {
      return {
        checked: false,
        url: "",
        bgc: "gray"
      }
    },
    methods: {
      toggleCheck() {
        this.checked = !this.checked;
        this.updateButtonState();
      },
      updateButtonState() {
        if (this.checked) {
          this.bgc = '#114598';
          this.url = "/pages/oobe/privacy";
        } else {
          this.bgc = 'gray';
          this.url = "";
        }
      }
    },
    mounted() {
      this.updateButtonState();
    }
  }
</script>