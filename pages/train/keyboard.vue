<template>
	<!-- 仿12306车次键盘的实现，分文件来写好像输不进去（？  先整合到一起 -->
  <view class="train-keyboard">
    
    <view class="confirm-area">
        <text class="confirm-btn" @click="$emit('confirm')">确认</text>
    </view>

    <view class="keyboard-body">
      
      <view class="key letter-key" style="grid-row: 1; grid-column: 1;" @click="onLetterClick('G')"><text>G</text></view>
      <view class="key letter-key" style="grid-row: 1; grid-column: 2;" @click="onLetterClick('D')"><text>D</text></view>
      
      <view class="key number-key" style="grid-row: 1; grid-column: 3;" @click="onNumberClick(1)"><text>1</text></view>
      <view class="key number-key" style="grid-row: 1; grid-column: 4;" @click="onNumberClick(2)"><text>2</text></view>
      <view class="key number-key" style="grid-row: 1; grid-column: 5;" @click="onNumberClick(3)"><text>3</text></view>
      
      <view class="key letter-key" style="grid-row: 2; grid-column: 1;" @click="onLetterClick('C')"><text>C</text></view>
      <view class="key letter-key" style="grid-row: 2; grid-column: 2;" @click="onLetterClick('K')"><text>K</text></view>
      
      <view class="key number-key" style="grid-row: 2; grid-column: 3;" @click="onNumberClick(4)"><text>4</text></view>
      <view class="key number-key" style="grid-row: 2; grid-column: 4;" @click="onNumberClick(5)"><text>5</text></view>
      <view class="key number-key" style="grid-row: 2; grid-column: 5;" @click="onNumberClick(6)"><text>6</text></view>
      
      <view class="key letter-key" style="grid-row: 3; grid-column: 1;" @click="onLetterClick('L')"><text>L</text></view>
      <view class="key letter-key" style="grid-row: 3; grid-column: 2;" @click="onLetterClick('T')"><text>T</text></view>
      
      <view class="key number-key" style="grid-row: 3; grid-column: 3;" @click="onNumberClick(7)"><text>7</text></view>
      <view class="key number-key" style="grid-row: 3; grid-column: 4;" @click="onNumberClick(8)"><text>8</text></view>
      <view class="key number-key" style="grid-row: 3; grid-column: 5;" @click="onNumberClick(9)"><text>9</text></view>
      
      
      <view class="key letter-key" style="grid-row: 4; grid-column: 1;" @click="onLetterClick('Z')"><text>Z</text></view>
      <view class="key letter-key" style="grid-row: 4; grid-column: 2;" @click="onLetterClick('Y')"><text>Y</text></view>
      <view class="key letter-key" style="grid-row: 4; grid-column: 3;" @click="onLetterClick('S')"><text>S</text></view>
      <view class="key number-key" style="grid-row: 4; grid-column: 4;" @click="onNumberClick(0)"><text>0</text></view>
      <view class="key function-key delete-key" style="grid-row: 4; grid-column: 5;" @click="onDelete">
          <text class="icon-x">×</text> 
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    value: { type: String, default: '' }
  },
  methods: {
    isLetter(char) { return /^[A-Z]$/i.test(char); },
    
    onLetterClick(letter) {
      let currentNumber = this.value;
      let newValue;
      if (!currentNumber || !this.isLetter(currentNumber.charAt(0))) {
        newValue = letter + currentNumber;
      } else {
        newValue = letter + currentNumber.substring(1);
      }
      this.$emit('input', newValue);
    },
    
    onNumberClick(number) { 
      this.$emit('input', this.value + String(number)); 
    },
    
    onDelete() {
      if (this.value.length > 0) {
        this.$emit('input', this.value.substring(0, this.value.length - 1));
      }
    },
  }
};
</script>

<style scoped>
.train-keyboard {
  position: fixed; 
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 9999; 
  background-color: #f7f7f7; 
  padding: 0; 
  box-sizing: border-box;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
.confirm-area {
    width: 100%;
    display: flex;
    justify-content: flex-end; 
    padding: 20rpx 0 0 0;
    background-color: #fff; 
}
.confirm-btn {
    font-size: 30rpx;
    color: #007aff; 
    font-weight: bold;
    padding: 10rpx 0;
    margin-right: 45rpx; 
}
.keyboard-body {
  display: grid;
  grid-template-columns: repeat(5, 1fr); 
  grid-template-rows: repeat(4, 1fr);
  width: 100%;
  background-color: #fff; 
  gap: 0; 
}
.key {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100rpx; 
  font-size: 48rpx; 
  font-weight: bold;
  box-sizing: border-box; 
  background-color: #fff; 
  transition: background-color 0.08s ease;
  border-right: 1rpx solid #e0e0e0;
  border-bottom: 1rpx solid #e0e0e0;
}
.key:active {
  background-color: #f0f0f0; 
  opacity: 0.9;
}
.key[style*='grid-column: 5'] {
    border-right: none !important;
}
.key[style*='grid-row: 4'] {
    border-bottom: none !important;
}
.letter-key {
    color: #114598; 
}
.delete-key {
    background-color: #d1d5db; 
    color: #4b5563;
    font-weight: normal; 
}
.delete-key:active {
    background-color: #a0a0a0;
}
.icon-x {
    font-size: 40rpx;
}
</style>