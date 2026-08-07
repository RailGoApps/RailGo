/**
 * 地图工具类
 * 提供地图相关的工具函数
 * 地址格式参考: http://lbs.tianditu.gov.cn/server/geocoding.html
 */

/**
 * 逆地理编码 - 根据坐标获取地址
 * @param {Number} lon - 经度
 * @param {Number} lat - 纬度
 * @param {String} mapKey - 天地图 API Key（必填）
 * @returns {Promise<String>} 返回地址字符串
 */
export function getAddressByLocation(lon, lat, mapKey) {
	return new Promise((resolve, reject) => {
		const url = `https://api.tianditu.gov.cn/geocoder?postStr={'lon':${lon},'lat':${lat},'ver':1}&type=geocode&tk=${mapKey}`;
		
		uni.request({
			url: url,
			method: 'GET',
			success: (res) => {
				console.log('逆地理编码结果:', res);
				
				if (res.data && res.data.result) {
					const result = res.data.result;
					// const address = result.addressComponent;	//地址格式参考 http://lbs.tianditu.gov.cn/server/geocoding.html
					resolve(result);
				} else {
					reject(new Error('无法获取地址信息'));
				}
			},
			fail: (err) => {
				console.error('逆地理编码请求失败:', err);
				reject(err);
			}
		});
	});
}

/**
 * 正地理编码 - 根据地址获取坐标
 * @param {String} address - 地址
 * @param {String} mapKey - 天地图 API Key（必填）
 * @returns {Promise<Object>} 返回坐标对象 {lon, lat}
 */
export function getLocationByAddress(address, mapKey) {
	return new Promise((resolve, reject) => {
		const url = `https://api.tianditu.gov.cn/geocoder?ds={'keyWord':'${encodeURIComponent(address)}'}&tk=${mapKey}`;
		
		uni.request({
			url: url,
			method: 'GET',
			success: (res) => {
				console.log('正地理编码结果:', res);
				
				if (res.data && res.data.location) {
					const location = res.data.location;
					resolve({
						lon: location.lon,
						lat: location.lat
					});
				} else {
					reject(new Error('无法获取坐标信息'));
				}
			},
			fail: (err) => {
				console.error('正地理编码请求失败:', err);
				reject(err);
			}
		});
	});
}

/**
 * WGS84 转 GCJ02（火星坐标系）
 * @param {Number} lon - WGS84 经度
 * @param {Number} lat - WGS84 纬度
 * @returns {Object} GCJ02 坐标 {lon, lat}
 */
export function wgs84ToGcj02(lon, lat) {
	const a = 6378245.0;
	const ee = 0.00669342162296594323;
	
	const dLat = transformLat(lon - 105.0, lat - 35.0);
	const dLon = transformLon(lon - 105.0, lat - 35.0);
	const radLat = lat / 180.0 * Math.PI;
	let magic = Math.sin(radLat);
	magic = 1 - ee * magic * magic;
	const sqrtMagic = Math.sqrt(magic);
	
	const mgLat = lat + (dLat * 180.0) / ((a / sqrtMagic) * Math.PI);
	const mgLon = lon + (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
	
	return { lon: mgLon, lat: mgLat };
}

/**
 * GCJ02 转 WGS84
 * @param {Number} lon - GCJ02 经度
 * @param {Number} lat - GCJ02 纬度
 * @returns {Object} WGS84 坐标 {lon, lat}
 */
export function gcj02ToWgs84(lon, lat) {
	const a = 6378245.0;
	const ee = 0.00669342162296594323;
	
	const dLat = transformLat(lon - 105.0, lat - 35.0);
	const dLon = transformLon(lon - 105.0, lat - 35.0);
	const radLat = lat / 180.0 * Math.PI;
	let magic = Math.sin(radLat);
	magic = 1 - ee * magic * magic;
	const sqrtMagic = Math.sqrt(magic);
	
	const mgLat = (dLat * 180.0) / ((a / sqrtMagic) * Math.PI);
	const mgLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
	
	return { lon: lon - mgLon, lat: lat - mgLat };
}

// 辅助函数：纬度转换
function transformLat(x, y) {
	let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
	ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
	ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
	ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
	return ret;
}

// 辅助函数：经度转换
function transformLon(x, y) {
	let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
	ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
	ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
	ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
	return ret;
}

/**
 * 计算两点之间的距离（米）
 * @param {Number} lon1 - 第一个点的经度
 * @param {Number} lat1 - 第一个点的纬度
 * @param {Number} lon2 - 第二个点的经度
 * @param {Number} lat2 - 第二个点的纬度
 * @returns {Number} 距离（米）
 */
export function getDistance(lon1, lat1, lon2, lat2) {
	const R = 6371000; // 地球半径（米）
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

/**
 * 地点搜索 - 根据关键词搜索地点
 * @param {String} keyword - 搜索关键词
 * @param {String} mapKey - 天地图 API Key（必填）
 * @param {Object} options - 可选参数 {lon, lat, radius}
 * @returns {Promise<Array>} 返回搜索结果列表
 */
export function searchPlace(keyword, mapKey, options = {}) {
	return new Promise((resolve, reject) => {
		if (!keyword || !keyword.trim()) {
			reject(new Error('搜索关键词不能为空'));
			return;
		}
		
		// 构建搜索参数（使用一般搜索服务 queryType: 1，支持全国范围搜索）
			
		const searchParams = {
			keyWord: keyword,
			level: 12,
			queryType: 1,  // 一般搜索（全国范围）
			mapBound: '73.66,3.86,135.05,53.55',  // 全国范围边界
			start: 0,
			count: 50
		};
		
		// 使用GET方法，postStr参数传递JSON字符串（需要URL编码）
		const postStr = encodeURIComponent(JSON.stringify(searchParams));
		const url = `http://api.tianditu.gov.cn/v2/search?postStr=${postStr}&type=query&tk=${mapKey}`;
		
		uni.request({
			url: url,
			method: 'GET',
			success: (res) => {
				console.log('地点搜索结果:', res);
				
				if (res.data && res.data.pois) {
					const pois = res.data.pois.map(poi => ({
						name: poi.name,
						address: poi.address,
						lon: poi.lonlat.split(',')[0],
						lat: poi.lonlat.split(',')[1],
						distance: poi.distance || '',
						hotPointID: poi.hotPointID
					}));
					resolve(pois);
				} else {
					resolve([]);
				}
			},
			fail: (err) => {
				console.error('地点搜索失败:', err);
				reject(err);
			}
		});
	});
}

/**
 * 周边搜索 - 搜索指定位置周边的POI
 * @param {Number} lon - 中心点经度
 * @param {Number} lat - 中心点纬度
 * @param {String} mapKey - 天地图 API Key（必填）
 * @param {Object} options - 可选参数 {keyword, radius, count}
 * @returns {Promise<Array>} 返回周边POI列表
 */
export function searchNearby(lon, lat, mapKey, options = {}) {
	return new Promise((resolve, reject) => {
		const keyword = options.keyword || '地点';  // 默认使用"地点"作为关键词
		const radius = options.radius || 1000; // 默认1公里
		const count = options.count || 10;
		
		// 构建周边搜索参数
		const searchParams = {
			keyWord: keyword,
			level: 12,
			queryType: 3,
			pointLonlat: `${lon},${lat}`,
			queryRadius: radius,
			start: 0,
			count: count
		};
		
		// 使用GET方法，postStr参数传递JSON字符串（需要URL编码）
		const postStr = encodeURIComponent(JSON.stringify(searchParams));
		const url = `http://api.tianditu.gov.cn/v2/search?postStr=${postStr}&type=query&tk=${mapKey}`;
		
		uni.request({
			url: url,
			method: 'GET',
			success: (res) => {
				console.log('周边搜索结果:', res);
				
				if (res.data && res.data.pois) {
					const pois = res.data.pois.map(poi => ({
						name: poi.name,
						address: poi.address,
						lon: poi.lonlat.split(',')[0],
						lat: poi.lonlat.split(',')[1],
						distance: poi.distance || '',
						hotPointID: poi.hotPointID
					}));
					resolve(pois);
				} else {
					resolve([]);
				}
			},
			fail: (err) => {
				console.error('周边搜索失败:', err);
				reject(err);
			}
		});
	});
}

export default {
	getAddressByLocation,
	getLocationByAddress,
	searchPlace,
	searchNearby,
	wgs84ToGcj02,
	gcj02ToWgs84,
	getDistance
};
