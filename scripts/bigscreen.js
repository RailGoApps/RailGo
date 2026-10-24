// /scripts/bigscreen.js

/**
 * 车站大屏共用逻辑：v2(ver=3) 拉取、UTC+8 次日排序、状态着色与文案
 * 竖屏表格（pages/station/result.vue）与横屏大屏页（pages/station/bigscreen.vue）共用。
 */
import { uniGet } from './req.js';

/** 'HH:mm' → 分钟，非法返回 -1 */
const timeToMinutes = t => {
  if (!t || String(t).indexOf(':') < 0) return -1;
  const p = String(t).split(':');
  const h = parseInt(p[0], 10);
  const m = parseInt(p[1], 10);
  if (isNaN(h) || isNaN(m)) return -1;
  return h * 60 + m;
};

/** 当前 UTC+8 时刻的分钟数（不依赖设备时区） */
const nowMinutesUTC8 = () => {
  const utcMs = Date.now() + new Date().getTimezoneOffset() * 60000;
  const t = new Date(utcMs + 8 * 3600000);
  return t.getHours() * 60 + t.getMinutes();
};

/**
 * 按时间升序；早于当前 UTC+8 时刻且仍是「候车」的是次日车次，挪到队尾
 */
const sortBigScreenByTime = list => {
  const nowMin = nowMinutesUTC8();
  const isNextDay = item => {
    const m = timeToMinutes(item.time);
    return m >= 0 && m < nowMin && item.bigScreenStatusCode === 'WAITING';
  };
  return [...list].sort((a, b) => {
    const na = isNextDay(a) ? 1 : 0;
    const nb = isNextDay(b) ? 1 : 0;
    if (na !== nb) return na - nb;
    const ma = timeToMinutes(a.time);
    const mb = timeToMinutes(b.time);
    if (ma < 0 && mb < 0) return 0;
    if (ma < 0) return 1;
    if (mb < 0) return -1;
    return ma - mb;
  });
};

/** 拉取并排序大屏数据；网络异常或结构异常时抛错，由调用方兜底 */
const fetchStationBigScreen = async (telecode, kind) => {
  const base = uni.getStorageSync('service_source_bigScreen') || 'https://rg-api.zenglingkun.cn';
  const url = base + `/api/v2/getStationBigScreen?stationTelecode=${encodeURIComponent(telecode)}&kind=${encodeURIComponent(kind)}&ver=3`;
  const resp = await uniGet(url);
  const result = resp.data;
  if (!result || result.success !== true || !Array.isArray(result.data)) {
    throw new Error('大屏数据格式异常');
  }
  return sortBigScreenByTime(result.data);
};

/** 状态文字颜色（深色底） */
const getBigScreenStatusColor = statusCode => {
  if (!statusCode) return 'white';

  switch (statusCode) {
    case 'WAITING':      // 候车
      return 'white';
    case 'CANCELED':     // 取消
      return '#e74c3c';
    case 'CHECK_BEGIN':  // 出发开检
      return '#27ae60';
    case 'CHECK_STOP':   // 出发停检
      return '#e74c3c';
    case 'ON_TIME':      // 到达正点
      return 'white';
    case 'DELAY':        // 到达晚点
      return '#e74c3c';
    case 'EARLY':        // 到达早点
      return '#27ae60';
    default:
      return 'white';
  }
};

/** 状态文案（结合晚点/早点分钟数） */
const formatBigScreenStatus = (kind, status, statusCode, timeDelay) => {
  if (!status) return '-';

  const delay = Number(timeDelay);
  const hasDelay = delay > 0;

  if (kind === 'arrival') {
    if (statusCode === 'ON_TIME') return '正点';
    if (statusCode === 'DELAY' && hasDelay) return `晚点${delay}分`;
    if (statusCode === 'EARLY' && hasDelay) return `早点${delay}分`;
    return status;
  }

  if (statusCode === 'DELAY' && hasDelay) return `晚点${delay}分`;
  if (statusCode === 'EARLY' && hasDelay) return `早点${delay}分`;
  return status;
};

export { timeToMinutes, nowMinutesUTC8, sortBigScreenByTime, fetchStationBigScreen, getBigScreenStatusColor, formatBigScreenStatus };
