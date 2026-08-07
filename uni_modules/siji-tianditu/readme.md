# 私集天地图组件 siji-tianditu

基于天地图 API 的 uni-app 地图组件，支持地图显示、定位、地址解析等功能。

私集官网 www.sijicms.com

## 📦 组件说明

本插件包含两个核心组件：

### 1. `siji-tianditu` - 基础地图组件
用于直接在页面中显示地图，支持地图交互、定位、拖拽等功能。

### 2. `siji-tianditu-picker` - 地图选择器组件
带弹窗的地图选择器，用于位置选择场景，内置定位、地址解析、确认/取消等完整交互流程。

---

## 🔑 坐标系说明

### 默认坐标系

天地图使用 **WGS84 坐标系**。

如果您使用的是其他坐标系（如百度坐标 BD09、火星坐标 GCJ02），需要先进行坐标转换。

---

## 💡 使用示例

### 完整示例：位置选择页面

```vue
<template>
	<view class="page">
		<view class="header">
			<view class="title-row">
				<text class="title">使用方法一：切换城市</text>
				<text class="current-city" v-if="currentCity">当前：{{currentCity}}</text>
			</view>
			<button class="switch-city-btn" @tap="getCity">切换城市</button>
		</view>
		<view class="header" style="margin-top: 50rpx;">
			<view class="title-row">
				<text class="title">使用方法二：选择定位</text>
			</view>
		</view>
		<view class="input-section">
			<view class="input-wrapper">
				<input 
					class="location-input" 
					v-model="selectedLocation"
					placeholder="请点击右侧按钮选择位置"
					disabled
				/>
				<button class="location-btn" @tap="openLocationPicker">
					<text>定位</text>
				</button>
			</view>	
			<view class="info-panel" v-if="locationData">
				<text class="info-title">已选位置信息</text>
				<text>经度: {{locationData.lon}}</text>
				<text>纬度: {{locationData.lat}}</text>
				<view v-if="locationData.data && locationData.data.formatted_address">
					<text>省市区: {{locationData.data.addressComponent.province}}-{{locationData.data.addressComponent.city}}-{{locationData.data.addressComponent.county}}</text>
					<text>地址: {{locationData.data.formatted_address}}</text>
				</view>
			</view>
		</view>	
		<!-- 使用地图选择器组件 -->
		<siji-tianditu-picker
			ref="mapPicker"
			:map-key="mapKey"
			:center="center"
			:zoom="zoom"
			:on-confirm="handleConfirm"
			:on-cancel="handleCancel">
		</siji-tianditu-picker>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				mapKey: '************************',   //你的天地图API Key
				selectedLocation: '',
				locationData: null,
				center: [116.411794, 39.9068],
				zoom: 18,
				currentCity: ''
			}
		},
		methods: {
			// 打开地图选择器
			openLocationPicker() {
				this.$refs.mapPicker.show();
			},
			
			// 确认选择
			handleConfirm(data) {
				console.log('选择的位置:', data);
				this.locationData = data;
				
				// 更新输入框显示
				if (data.data && data.data.formatted_address) {
					this.selectedLocation = data.data.formatted_address;
				} else {
					this.selectedLocation = `${data.lon}, ${data.lat}`;
				}
				
				uni.showToast({
					title: '位置已选择',
					icon: 'success'
				});
			},
			
			// 取消选择
			handleCancel() {
				console.log('取消选择');
			},
			
			// 直接获取城市
			async getCity() {
				try {
					const data = await this.$refs.mapPicker.getLocationDirectly();
					this.locationData = data;
					
					if (data.data && data.data.formatted_address) {
						this.selectedLocation = data.data.formatted_address;
						// 更新当前城市显示
						const addressComponent = data.data.addressComponent;
						this.currentCity = addressComponent.city || addressComponent.province || '未知城市';
					} else {
						this.selectedLocation = `${data.lon}, ${data.lat}`;
						this.currentCity = '未知城市';
					}
				} catch (error) {
					console.error('获取位置失败:', error);
				}
			}
		}
	}
</script>
```

**使用方法：**

### 方式一：直接获取当前位置

适用于需要快速获取用户当前位置的场景，无需显示地图界面，直接返回坐标和地址信息。如 切换当前城市 

**特点：**
- ✅ 无需显示地图弹窗
- ✅ 自动获取当前坐标
- ✅ 自动进行逆地理编码
- ✅ 返回完整的位置和地址信息
- ✅ 内置加载提示和错误处理

---

### 方式二：使用地图选择器

适用于需要用户手动选择位置的场景，如填写地址、获取坐标等。

**特点：**
- ✅ 显示地图弹窗界面
- ✅ 支持地图拖拽选择
- ✅ 自动定位到当前位置
- ✅ 实时显示地址信息
- ✅ 内置确认/取消按钮
- ✅ **全国范围搜索**：支持跨区域搜索（如在杭州搜索襄阳的"古隆中"）
- ✅ **智能关键词提取**：拖动地图时自动提取POI作为搜索关键词
- ✅ **附近地点推荐**：自动搜索并显示附近的POI，按距离排序
- ✅ **距离计算**：所有搜索结果自动显示与当前位置的距离
- ✅ **搜索框交互**：支持关键词搜索，拖动地图自动清空搜索关键词

---

## API 文档

### siji-tianditu-picker（地图选择器）

#### Props

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|:-----|:-----|:-----|:------|:-----|
| `map-key` | String | 是 | - | 天地图 API Key |
| `center` | Array | 否 | `[116.411794, 39.9068]` | 地图初始中心点 [经度, 纬度] |
| `zoom` | Number | 否 | `18` | 地图初始缩放级别（1-18） |
| `on-confirm` | Function | 否 | - | 确认选择回调，返回 `{ lon, lat, address }` |
| `on-cancel` | Function | 否 | - | 取消选择回调 |

#### Methods

| 方法 | 说明 |
|:-----|:-----|
| `show()` | 显示地图选择器弹窗 |
| `hide()` | 隐藏地图选择器弹窗 |
| `getLocationDirectly()` | 直接获取当前位置（不显示弹窗），返回 Promise<{ lon, lat, data }> |

#### 使用场景

**1. 地图选择模式（调用 `show()` 方法）**
- ✅ 自动定位：每次打开弹窗自动定位到当前位置
- ✅ 地址解析：拖拽地图自动获取当前位置的地址
- ✅ 完整交互：内置确认/取消按钮，提供完整的选择流程
- ✅ 位置信息：实时显示当前位置的经纬度和地址
- ✅ **全国搜索**：支持全国范围的地点搜索，不受当前位置限制
- ✅ **智能推荐**：自动搜索并显示附近POI，使用逆地理编码结果作为关键词
- ✅ **距离排序**：搜索结果和附近地点均按距离从近到远排序
- ✅ **交互优化**：拖动地图自动清空搜索关键词，点击列表项不触发搜索

**2. 直接获取模式（调用 `getLocationDirectly()` 方法）**
- ✅ 无界面：不显示地图弹窗，直接获取结果
- ✅ 自动定位：自动获取当前设备位置
- ✅ 逆地理编码：自动将坐标转换为地址信息
- ✅ Promise 返回：支持 async/await 语法
- ✅ 错误处理：内置加载提示和错误提示

---

### siji-tianditu（基础地图组件）

#### Props

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|:-----|:-----|:-----|:------|:-----|
| `map-key` | String | 是 | - | 天地图 API Key（**必填**） |
| `lonlat` | Array | 否 | `[116.411794, 39.9068]` | 地图中心点 [经度, 纬度] |
| `zoom` | Number | 否 | `16` | 地图缩放级别（1-18） |
| `show-center-icon` | Boolean | 否 | `false` | 是否显示中心定位图标 |
| `center-icon` | String | 否 | - | 自定义中心图标路径 |
| `show-location-icon` | Boolean | 否 | `false` | 是否显示定位按钮 |
| `auto-get-address` | Boolean | 否 | `false` | 是否自动获取地址（拖拽后） |
| `on-loaded` | Function | 否 | - | 地图加载完成回调 |
| `on-location` | Function | 否 | - | 点击定位按钮回调 |
| `on-end-drag` | Function | 否 | - | 地图拖拽结束回调，返回 `(lon, lat)` |
| `on-address-change` | Function | 否 | - | 地址变化回调，返回 `{ lon, lat, address }` |

#### Methods

| 方法 | 参数 | 说明 |
|:-----|:-----|:-----|
| `setCenter(lon, lat, zoom)` | `lon`: 经度<br>`lat`: 纬度<br>`zoom`: 缩放级别（可选） | 设置地图中心点 |
| `getAddress(lon, lat)` | `lon`: 经度<br>`lat`: 纬度 | 获取指定坐标的地址（异步） |

---

## 🔧 工具函数

组件内置了地图工具函数，位于 `mapUtils.js`：

### getAddressByLocation  逆地理编码 - 根据坐标获取地址
console.log(addressData.formatted_address); // 完整地址
console.log(addressData.addressComponent); // 地址组件（省市区等）
```

**参数：**
- `lon` (Number): 经度
- `lat` (Number): 纬度
- `mapKey` (String): 天地图 API Key（**必填**）

**返回：** Promise<Object> - 地址对象，包含 `formatted_address`、`addressComponent` 等字段

> **注意：**如果您不需要直接使用工具函数，推荐使用 `siji-tianditu-picker` 组件的 `getLocationDirectly()` 方法，它已经封装了完整的定位和逆地理编码逻辑。

### getLocationByAddress 正地理编码 - 根据地址获取坐标
console.log(location); // { lon: 116.404, lat: 39.915 }
```

**参数：**
- `address` (String): 地址
- `mapKey` (String): 天地图 API Key（**必填**）

**返回：** Promise<Object> - `{ lon, lat }`

### searchPlace 全国范围地点搜索

支持全国范围的地点搜索，不受当前位置限制。

**参数：**
- `keyword` (String): 搜索关键词（必填）
- `mapKey` (String): 天地图 API Key（必填）
- `options` (Object): 可选参数（可选）

**返回：** Promise<Array> - POI列表，每个POI包含 `name`、`address`、`lon`、`lat`、`distance` 等字段

**特点：**
- ✅ 全国范围搜索（queryType: 1）
- ✅ 自动计算距离（如果提供了当前位置）
- ✅ 结果按距离排序

### searchNearby 周边POI搜索

搜索指定位置周边的POI。

**参数：**
- `lon` (Number): 中心点经度（必填）
- `lat` (Number): 中心点纬度（必填）
- `mapKey` (String): 天地图 API Key（必填）
- `options` (Object): 可选参数
  - `keyword` (String): 搜索关键词，默认 "地点"
  - `radius` (Number): 搜索半径（米），默认 1000
  - `count` (Number): 返回数量，默认 10

**返回：** Promise<Array> - POI列表，包含 `name`、`address`、`lon`、`lat`、`distance` 等字段

**特点：**
- ✅ 周边搜索（queryType: 3）
- ✅ 自动计算距离
- ✅ 支持自定义搜索半径

### getDistance 计算两点距离

计算两个坐标点之间的距离（米）。

**参数：**
- `lon1` (Number): 起点经度
- `lat1` (Number): 起点纬度
- `lon2` (Number): 终点经度
- `lat2` (Number): 终点纬度

**返回：** Number - 距离（米）

---

## 🔐 安全建议

### API Key 安全

**不推荐：** 将 API Key 直接写在前端代码中

```javascript
// ❌ 不安全
data() {
  return {
    mapKey: '******************************'
  }
}
```

**推荐方案：**

#### 1. 使用后端代理（最安全）

前端不直接调用天地图 API，而是通过自己的后端服务转发请求。

#### 2. 设置域名白名单

在天地图开发者平台设置"域名白名单"，限制只有您的域名可以使用该 Key。

---

## 📝 注意事项

1. **API Key 必填**：组件需要天地图 API Key 才能正常工作，请前往 [天地图开放平台](https://www.tianditu.gov.cn/) 申请。

2. **坐标系转换**：天地图使用 WGS84 坐标系，如果使用其他坐标系需要先转换。

3. **定位权限**：使用定位功能需要在 `manifest.json` 中配置定位权限。

4. **网络请求**：地址解析功能需要网络请求，请确保网络畅通。

5. **性能优化**：
   - 地图组件较重，建议按需加载
   - 避免在列表中使用多个地图组件
   - 使用 `v-if` 而不是 `v-show` 来控制地图显示

---

## 🐛 常见问题

### Q: 地图不显示？
A: 请检查：
- API Key 是否正确
- 网络是否正常
- 是否给地图容器设置了高度

### Q: 定位失败？
A: 请检查：
- 是否配置了定位权限
- 用户是否授权了定位权限
- 设备定位服务是否开启

### Q: 地址获取失败？
A: 请检查：
- API Key 是否有效
- 网络请求是否正常
- 坐标是否在中国境内（天地图主要覆盖中国）

---