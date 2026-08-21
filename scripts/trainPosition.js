/**
 * 列车实时位置计算工具
 * 根据时刻表和路线数据，计算列车当前应处的地理位置
 */

/**
 * 解析时间字符串为分钟数（支持跨日，如 "25:30" → 1530）
 * @param {string} timeStr - 时间字符串 "HH:mm"
 * @returns {number|null} 分钟数，解析失败返回 null
 */
export function parseTimeToMinutes(timeStr) {
	if (!timeStr || timeStr === '-' || timeStr === '') return null;
	const parts = timeStr.split(':');
	if (parts.length < 2) return null;
	const hours = parseInt(parts[0], 10);
	const minutes = parseInt(parts[1], 10);
	if (isNaN(hours) || isNaN(minutes)) return null;
	return hours * 60 + minutes;
}

/**
 * 获取当前时间的分钟数（当天 00:00 起）
 * @returns {number}
 */
export function getCurrentTimeMinutes() {
	const now = new Date();
	return now.getHours() * 60 + now.getMinutes();
}

/**
 * 根据时刻表生成带跨日偏移的数值化站点序列
 * 使用 dayOffset 累计跨日，而不是只比较相邻两站
 *
 * @param {Array} timetable - 时刻表，每项含 { station, arrive, depart }
 * @returns {Array}
 */
function normalizeTimetable(timetable) {
	const stations = timetable.map((s, i) => {
		let arriveMin = parseTimeToMinutes(s.arrive);
		let departMin = parseTimeToMinutes(s.depart);
		return {
			index: i,
			name: s.station || '',
			arriveMin,
			departMin,
			dayOffset: 0,
			originalArrive: arriveMin,
			originalDepart: departMin,
		};
	});

	let dayOffset = 0;
	for (let i = 1; i < stations.length; i++) {
		const prev = stations[i - 1];
		const cur = stations[i];

		// 如果下一站到达时间比上一站出发时间小，说明列车跨日运行到下一站
		if (cur.arriveMin !== null && prev.departMin !== null && cur.arriveMin < prev.departMin) {
			dayOffset += 1;
		}
		cur.dayOffset = dayOffset;

		if (cur.arriveMin !== null) {
			cur.arriveMin += dayOffset * 1440;
		}

		if (cur.departMin !== null) {
			// 同一站内部跨日：depart 比 arrive 小，需要再额外加一天
			const baseDepart = cur.originalDepart + dayOffset * 1440;
			if (cur.arriveMin !== null && baseDepart < cur.arriveMin) {
				cur.departMin = baseDepart + 1440;
			} else {
				cur.departMin = baseDepart;
			}
		}
	}

	return stations;
}

/**
 * 根据列车发车日期，推测当前时间应映射到哪个运行日
 * 返回值会以首站发车时间为参考对齐到最近的一天
 *
 * @param {Array} timetable - 原始时刻表
 * @param {number} todayMinutes - 当天 00:00 起的分钟数
 * @returns {number} 对齐后的分钟数
 */
export function alignCurrentMinutesToTrainDate(timetable, todayMinutes) {
	const firstDepart = parseTimeToMinutes(timetable[0]?.depart);
	if (firstDepart === null) return todayMinutes;

	// 候选：昨天、今天、明天
	const candidates = [
		todayMinutes - 1440,
		todayMinutes,
		todayMinutes + 1440,
	];

	let best = todayMinutes;
	let minDiff = Infinity;
	for (const c of candidates) {
		const diff = Math.abs(c - firstDepart);
		if (diff < minDiff) {
			minDiff = diff;
			best = c;
		}
	}
	return best;
}

/**
 * 使用梯形速度模型将时间进度转换为空间进度
 * 考虑加减速阶段，使列车位置更贴近真实运行过程
 *
 * @param {number} timeProgress - 时间进度 0~1
 * @param {number} avgSpeed - 区间平均速度 (km/h)
 * @returns {number} 空间进度 0~1
 */
export function timeProgressToDistanceProgress(timeProgress, avgSpeed) {
	if (timeProgress <= 0) return 0;
	if (timeProgress >= 1) return 1;

	// 加减速时间占比：速度越快加速越慢，占比越大
	let accelRatio;
	if (avgSpeed >= 250) accelRatio = 0.18;
	else if (avgSpeed >= 160) accelRatio = 0.15;
	else if (avgSpeed >= 120) accelRatio = 0.12;
	else if (avgSpeed >= 80) accelRatio = 0.10;
	else accelRatio = 0.08;

	const decelRatio = accelRatio;
	const cruiseRatio = 1 - accelRatio - decelRatio;
	if (cruiseRatio <= 0) return timeProgress;

	// 匀速阶段速度（高于平均速度，因为要抵消加减速阶段低速）
	// 总距离 = 0.5 * v_cruise * t_acc + v_cruise * t_cruise + 0.5 * v_cruise * t_dec
	//       = v_cruise * t * (0.5 * accelRatio + cruiseRatio + 0.5 * decelRatio)
	// avgSpeed * t = v_cruise * t * (accelRatio/2 + cruiseRatio + decelRatio/2)
	const speedFactor = accelRatio / 2 + cruiseRatio + decelRatio / 2;
	const cruiseSpeed = avgSpeed / speedFactor;

	const t = 1; // 归一化时间
	const tAcc = accelRatio * t;
	const tCruise = cruiseRatio * t;
	const tDec = decelRatio * t;

	// 总距离（归一化）
	const totalDist = 0.5 * cruiseSpeed * tAcc
		+ cruiseSpeed * tCruise
		+ 0.5 * cruiseSpeed * tDec;

	// 当前时刻累计走过的距离
	let traveled;
	if (timeProgress <= tAcc) {
		// 匀加速
		const ratio = timeProgress / tAcc;
		traveled = 0.5 * cruiseSpeed * timeProgress * ratio;
	} else if (timeProgress <= tAcc + tCruise) {
		// 匀速
		const cruiseElapsed = timeProgress - tAcc;
		traveled = 0.5 * cruiseSpeed * tAcc + cruiseSpeed * cruiseElapsed;
	} else {
		// 匀减速
		const decElapsed = timeProgress - tAcc - tCruise;
		const decRatio = decElapsed / tDec;
		traveled = 0.5 * cruiseSpeed * tAcc
			+ cruiseSpeed * tCruise
			+ cruiseSpeed * decElapsed * (1 - 0.5 * decRatio);
	}

	return Math.max(0, Math.min(1, traveled / totalDist));
}

/**
 * 根据时刻表计算列车当前所在区间和进度
 *
 * @param {Array} timetable - 时刻表，每项含 { station, arrive, depart }
 * @param {number} currentMinutes - 当前时间的分钟数
 * @returns {Object|null}
 *   { currentStation, nextStation, progress, status, avgSpeed }
 *   status: 'running' | 'stopped' | 'not_departed' | 'arrived'
 */
export function calculateTrainProgress(timetable, currentMinutes) {
	if (!timetable || timetable.length < 2) return null;

	const stations = normalizeTimetable(timetable);

	// 检查是否停靠在某站（到达 ≤ 当前 ≤ 出发）
	for (const s of stations) {
		if (s.arriveMin !== null && s.departMin !== null) {
			if (s.arriveMin <= currentMinutes && currentMinutes <= s.departMin) {
				return {
					currentStation: s.name,
					nextStation: stations[s.index + 1]?.name || '',
					progress: 0,
					status: 'stopped',
					avgSpeed: 0,
				};
			}
		}
	}

	// 查找运行中的区间（出发 ≤ 当前 ≤ 到达下一站）
	for (let i = 0; i < stations.length - 1; i++) {
		const depart = stations[i].departMin;
		const arrive = stations[i + 1].arriveMin;
		if (depart === null || arrive === null) continue;

		if (depart <= currentMinutes && currentMinutes <= arrive) {
			const totalTime = arrive - depart;
			const elapsed = currentMinutes - depart;
			const progress = totalTime > 0 ? elapsed / totalTime : 0;

			// 估算区间平均速度（辅助梯形模型）
			let avgSpeed = 120;
			const arriveRaw = stations[i + 1].originalArrive;
			const departRaw = stations[i].originalDepart;
			if (arriveRaw !== null && departRaw !== null) {
				const runMinutes = (stations[i + 1].arriveMin - stations[i].departMin);
				if (runMinutes > 0) {
					// 默认假设站间距离近似，速度用 runMinutes 反推
					// 这里用一个简单经验公式，有 mileage 数据后可替换
					avgSpeed = Math.min(350, Math.max(40, 60 / (runMinutes / 60) * 5));
				}
			}

			return {
				currentStation: stations[i].name,
				nextStation: stations[i + 1].name,
				progress: Math.max(0, Math.min(1, progress)),
				status: 'running',
				avgSpeed,
			};
		}
	}

	// 在首站之前
	const first = stations[0];
	if (first.departMin !== null && currentMinutes < first.departMin) {
		return {
			currentStation: first.name,
			nextStation: stations[1]?.name || '',
			progress: 0,
			status: 'not_departed',
			avgSpeed: 0,
		};
	}

	// 在末站之后
	const last = stations[stations.length - 1];
	if (last.arriveMin !== null && currentMinutes > last.arriveMin) {
		return {
			currentStation: last.name,
			nextStation: '',
			progress: 1,
			status: 'arrived',
			avgSpeed: 0,
		};
	}

	return null;
}

/**
 * 根据车站名和时间进度在路线路径上插值计算坐标
 * （只依赖时刻表顺序和路径几何，不依赖 mileage）
 *
 * @param {Object} mapLines - 路线段 { "站A-站B": { index, line: [[lng,lat],...] } }
 * @param {Array} mapStations - 站点坐标 [{ "站名": [lng,lat] }]
 * @param {string} stationA - 当前车站（起点）
 * @param {string} stationB - 下一车站（终点）
 * @param {number} timeProgress - 时间进度 0~1
 * @returns {Object|null} { lng, lat }
 */
export function interpolatePositionOnRoute(mapLines, mapStations, stationA, stationB, timeProgress) {
	if (!mapLines || !stationA || !stationB) return null;

	// 1. 构建站名 → 坐标映射
	const stationCoordMap = {};
	if (mapStations) {
		mapStations.forEach(s => {
			const entries = Object.entries(s);
			if (entries.length > 0) {
				stationCoordMap[entries[0][0]] = {
					lng: entries[0][1][0],
					lat: entries[0][1][1]
				};
			}
		});
	}

	// 2. 按段 index 排序
	const segmentEntries = Object.entries(mapLines)
		.filter(([key]) => key.includes('-'))
		.sort((a, b) => a[1].index - b[1].index);

	if (segmentEntries.length === 0) return null;

	// 3. 构建平坦路径 = 站坐标嵌入段路径中
	const flatPath = [];   // [{lng, lat}]
	const stationNameAtIdx = {}; // idx → stationName

	segmentEntries.forEach(([key, segData], segIdx) => {
		const parts = key.split('-');
		const nameA = parts[0];
		const nameB = parts[1];
		const ca = stationCoordMap[nameA];
		const cb = stationCoordMap[nameB];

		if (segIdx === 0 && ca) {
			const idx = flatPath.length;
			flatPath.push({ lng: ca.lng, lat: ca.lat });
			stationNameAtIdx[idx] = nameA;
		}

		(segData.line || []).forEach(pt => {
			flatPath.push({ lng: pt[0], lat: pt[1] });
		});

		if (cb) {
			const idx = flatPath.length;
			flatPath.push({ lng: cb.lng, lat: cb.lat });
			stationNameAtIdx[idx] = nameB;
		}
	});

	if (flatPath.length < 2) return null;

	// 4. 在 flatPath 中找到 stationA 和 stationB 的索引
	let startIdx = -1;
	let endIdx = -1;
	Object.entries(stationNameAtIdx).forEach(([idxStr, name]) => {
		const idx = parseInt(idxStr);
		if (name === stationA) startIdx = idx;
		if (name === stationB) endIdx = idx;
	});

	if (startIdx === -1 || endIdx === -1) {
		return null;
	}

	// 5. 确定方向并切片
	const isReversed = startIdx > endIdx;
	const lo = Math.min(startIdx, endIdx);
	const hi = Math.max(startIdx, endIdx);
	let segmentPoints = flatPath.slice(lo, hi + 1);
	if (isReversed) {
		segmentPoints = segmentPoints.slice().reverse();
	}

	if (segmentPoints.length < 2) {
		return { lng: segmentPoints[0].lng, lat: segmentPoints[0].lat };
	}

	// 6. 沿路径计算累积距离
	let totalDistance = 0;
	const cumulativeDistances = [0];

	for (let i = 1; i < segmentPoints.length; i++) {
		const dist = Math.sqrt(
			Math.pow(segmentPoints[i].lng - segmentPoints[i - 1].lng, 2) +
			Math.pow(segmentPoints[i].lat - segmentPoints[i - 1].lat, 2)
		);
		totalDistance += dist;
		cumulativeDistances.push(totalDistance);
	}

	if (totalDistance === 0) {
		return { lng: segmentPoints[0].lng, lat: segmentPoints[0].lat };
	}

	// 7. 用 timeProgress 直接插值（等价于 server.py 的 ArcLengthInterpolator）
	const p = Math.max(0, Math.min(1, timeProgress));
	const targetDistance = totalDistance * p;

	for (let i = 0; i < cumulativeDistances.length - 1; i++) {
		if (cumulativeDistances[i] <= targetDistance && targetDistance <= cumulativeDistances[i + 1]) {
			const segD = cumulativeDistances[i + 1] - cumulativeDistances[i];
			const segP = segD > 0 ? (targetDistance - cumulativeDistances[i]) / segD : 0;
			return {
				lng: segmentPoints[i].lng + (segmentPoints[i + 1].lng - segmentPoints[i].lng) * segP,
				lat: segmentPoints[i].lat + (segmentPoints[i + 1].lat - segmentPoints[i].lat) * segP,
			};
		}
	}

	return {
		lng: segmentPoints[segmentPoints.length - 1].lng,
		lat: segmentPoints[segmentPoints.length - 1].lat
	};
}

/**
 * 便捷函数：一次计算列车当前位置坐标（纯时间进度方式）
 *
 * @param {Array} timetable - 时刻表
 * @param {Object} mapLines - 路线段数据
 * @param {Array} mapStations - 站点坐标
 * @param {number} [currentMinutes] - 当前分钟数，缺省使用系统时间
 * @returns {Object|null} { lng, lat, currentStation, nextStation, status, progress }
 */
export function getTrainPosition(timetable, mapLines, mapStations, currentMinutes) {
	let mins = currentMinutes !== undefined ? currentMinutes : getCurrentTimeMinutes();

	// 自动对齐当前时间到列车运行日期（处理跨日车次）
	mins = alignCurrentMinutesToTrainDate(timetable, mins);

	const prog = calculateTrainProgress(timetable, mins);
	if (!prog) {
		return null;
	}

	// 非 running 状态：直接返回车站坐标
	if (prog.status !== 'running') {
		const stationCoordMap = {};
		if (mapStations) {
			mapStations.forEach(s => {
				const entries = Object.entries(s);
				if (entries.length > 0) {
					stationCoordMap[entries[0][0]] = {
						lng: entries[0][1][0],
						lat: entries[0][1][1]
					};
				}
			});
		}
		const stationName = prog.status === 'not_departed' ? prog.currentStation
			: prog.status === 'arrived' ? timetable[timetable.length - 1].station
			: prog.currentStation;
		const coord = stationCoordMap[stationName];
		if (coord) {
			return {
				...coord,
				currentStation: prog.currentStation,
				nextStation: prog.nextStation,
				status: prog.status,
				progress: prog.progress,
			};
		}
		return null;
	}

	// running 状态：梯形速度模型将时间进度转为空间进度
	const distanceProgress = timeProgressToDistanceProgress(prog.progress, prog.avgSpeed);

	const coord = interpolatePositionOnRoute(mapLines, mapStations,
		prog.currentStation, prog.nextStation, distanceProgress);
	if (!coord) {
		return null;
	}

	return {
		...coord,
		currentStation: prog.currentStation,
		nextStation: prog.nextStation,
		status: prog.status,
		progress: prog.progress,
	};
}
