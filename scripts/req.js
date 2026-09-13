// /scripts/req.js

/**
 * 模拟 axios.get 请求，使用 uni.request 实现，并支持 await。
 *
 * @param {string} url 请求的 URL。
 * @param {object} [config] 请求配置，目前仅支持 params（查询参数）。
 * @param {object} [config.params] 将作为 URL 查询参数附加到请求中的对象。
 * @returns {Promise<object>} 返回一个 Promise，成功时解析为一个对象，
 * 其结构模拟 axios.get 的响应：
 * { data: {}, status: 200, statusText: 'OK', headers: {}, config: {} }
 * 失败时解析为一个模拟 axios 错误的 Error 对象。
 */
const uniGet = (url, config = {}) => {
  return new Promise((resolve, reject) => {
    let requestUrl = url;

    // 处理查询参数
    if (config.params) {
      const params = Object.keys(config.params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(config.params[key])}`)
        .join('&');
        
      requestUrl = `${url}${url.includes('?') ? '&' : '?'}${params}`;
    }

    uni.request({
      url: requestUrl,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        ...(config.headers || {})  
      },
      success: (res) => {
        resolve({
          data: res.data,
          status: res.statusCode,
          statusText: 'OK',  
          headers: res.header,
          config: config,
          request: {}
        });
      },
      fail: (err) => {
        reject({
          message: err.errMsg || 'Network Error',
          name: 'Error',
          stack: new Error().stack,
          config: config,
          code: err.errno || null,
          request: {},
          response: {
            data: err.data || null,
            status: err.statusCode || null,
            statusText: err.errMsg || 'Network Error',
            headers: err.header || {}
          }
        });
      }
    });
  });
};

/**
 * 模拟 axios.post 请求 (表单提交格式: application/x-www-form-urlencoded)，使用 uni.request 实现。
 *
 * @param {string} url 请求的 URL。
 * @param {object} [data] 将作为请求体发送到服务器的数据（将转换为表单格式）。
 * @param {object} [config] 请求配置。
 * @param {object} [config.headers] 自定义请求头。
 * @returns {Promise<object>} 返回一个 Promise，成功时解析为一个对象。
 */
const uniPost = (url, data, config = {}) => {
  return new Promise((resolve, reject) => {
    
    // 设置默认请求头为表单格式
    const defaultHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    // 将数据对象转换为 URL 查询字符串格式 (a=1&b=2)
    let postData = data;
    if (typeof data === 'object' && data !== null) {
        postData = Object.keys(data)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
            .join('&');
    }

    uni.request({
      url: url,
      method: 'POST',
      data: postData, // 发送表单字符串
      header: {
        ...defaultHeaders,
        ...(config.headers || {})  
      },
      success: (res) => {
        resolve({
          data: res.data,
          status: res.statusCode,
          statusText: 'OK',  
          headers: res.header,
          config: config,
          request: {}
        });
      },
      fail: (err) => {
        reject({
          message: err.errMsg || 'Network Error',
          name: 'Error',
          stack: new Error().stack,
          config: config,
          code: err.errno || null,
          request: {},
          response: {
            data: err.data || null,
            status: err.statusCode || null,
            statusText: err.errMsg || 'Network Error',
            headers: err.header || {}
          }
        });
      }
    });
  });
};

// 云端服务端点列表地址
const SERVICE_ENDPOINTS_URL = 'https://gateway.zenglingkun.cn/api/v2/service_endpoints';

/**
 * 获取云端服务端点列表。
 * @returns {Promise<Array|null>} 成功返回原始数组（每项形如 { code: [{ desc, url }, ...] }），失败返回 null。
 */
const fetchServiceEndpoints = async () => {
  try {
    const resp = await uniGet(SERVICE_ENDPOINTS_URL);
    if (resp && resp.data && Array.isArray(resp.data)) {
      return resp.data;
    }
  } catch (e) {
    console.error('获取服务端点失败:', e);
  }
  return null;
};

/**
 * 为全部服务选择第一个可用端点并写入本地存储（service_source_<code>）。
 * @param {Array} rawList fetchServiceEndpoints 返回的原始数组。
 */
const applyFirstServiceSources = (rawList) => {
  for (const item of rawList) {
    const code = Object.keys(item)[0];
    if (!code) continue;
    const endpoints = item[code] || [];
    if (endpoints.length > 0 && endpoints[0].url) {
      uni.setStorageSync('service_source_' + code, endpoints[0].url);
    }
  }
};

// 使用命名导出，与您的导入方式 (import { uniGet, uniPost } from ...) 匹配
export { uniGet, uniPost, fetchServiceEndpoints, applyFirstServiceSources };