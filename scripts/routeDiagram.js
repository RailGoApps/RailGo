/**
 * 交路运行图：里程归一 + Canvas 绘制
 * 绘制逻辑参照 railway-cc 的 RouteDiagram，去掉原版水印，改为居中的 RailGo 标识底图 + 右下角说明文字（由调用方通过 options.caption 传入）
 */

const TOP_MARGIN = 30;
const BOTTOM_MARGIN = 25;
const VERTICAL_PADDING = 20;
const LEFT_MARGIN = 100;
const RIGHT_MARGIN = 30;
const MIN_DRAWING_HEIGHT = 240;
const MAX_DRAWING_HEIGHT = 900;
const STATION_ROW_SPACING = 62;
// 相邻两条车站横线至少留出的像素高度，站距过密时靠加高画布解决
const MIN_ROW_GAP = 34;
const DAY_COLUMN_WIDTH = 620;
const MIN_CANVAS_WIDTH = 760;
const MAX_CANVAS_WIDTH = 1500;
// 段里程缺失时的兜底间隔，避免两个站叠在同一条横线上
const DEFAULT_GAP = 120;
const LOGO_PATH = '/static/index-logo.png';
const LOGO_ASPECT = 1248 / 352;

// 画布按天数取自然宽度（可宽于屏幕，由页面提供拖动/缩放），字号边距一律不缩
function computeLayout(stationCount, totalDays, minGapRatio, maxWidth) {
	const cap = Math.min(MAX_CANVAS_WIDTH, maxWidth || MAX_CANVAS_WIDTH);
	const natural = LEFT_MARGIN + RIGHT_MARGIN + DAY_COLUMN_WIDTH * Math.max(1, totalDays);
	const width = Math.max(MIN_CANVAS_WIDTH, Math.min(cap, natural));

	const byCount = Math.max(1, stationCount - 1) * STATION_ROW_SPACING;
	const byGap = minGapRatio > 0 ? MIN_ROW_GAP / minGapRatio : 0;
	const drawing = Math.round(Math.max(MIN_DRAWING_HEIGHT,
		Math.min(MAX_DRAWING_HEIGHT, Math.max(byCount, byGap))));

	return {
		width,
		drawing,
		leftMargin: LEFT_MARGIN,
		rightMargin: RIGHT_MARGIN,
		topMargin: TOP_MARGIN,
		verticalPadding: VERTICAL_PADDING,
		totalDays: Math.max(1, totalDays),
		height: drawing + TOP_MARGIN + BOTTOM_MARGIN + VERTICAL_PADDING * 2,
		dayWidth: (width - LEFT_MARGIN - RIGHT_MARGIN) / Math.max(1, totalDays)
	};
}

function layoutOf(routeTemplate, maxWidth) {
	const minGapRatio = normalizeStations(routeTemplate.station_positions);
	return computeLayout(routeTemplate.station_positions.length,
		countDays(routeTemplate.train_sequence), minGapRatio, maxWidth);
}

// 同时兼容 canvas type="2d" 的原生上下文与 uni 旧版 canvas 上下文
function createPainter(target) {
	const native = !!(target && typeof target.fillStyle === 'string');

	function style(prop, uniMethod, value) {
		if (native) target[prop] = value;
		else target[uniMethod](value);
	}

	return {
		setFill(color) { style('fillStyle', 'setFillStyle', color); },
		setStroke(color) { style('strokeStyle', 'setStrokeStyle', color); },
		setLine(width) { style('lineWidth', 'setLineWidth', width); },
		setFont(size, bold) {
			if (native) target.font = `${bold ? 'bold ' : ''}${size}px Arial`;
			else target.setFontSize(size);
		},
		setAlign(align) { style('textAlign', 'setTextAlign', align); },
		setBaseline(baseline) { style('textBaseline', 'setTextBaseline', baseline); },
		beginPath() { target.beginPath(); },
		moveTo(x, y) { target.moveTo(x, y); },
		lineTo(x, y) { target.lineTo(x, y); },
		stroke() { target.stroke(); },
		fillRect(x, y, w, h) { target.fillRect(x, y, w, h); },
		fillText(text, x, y) { target.fillText(text, x, y); },
		drawImage(src, x, y, w, h) { target.drawImage(src, x, y, w, h); },
		setAlpha(alpha) {
			if (native) target.globalAlpha = alpha;
			else if (typeof target.setGlobalAlpha === 'function') target.setGlobalAlpha(alpha);
		},
		flush() { if (!native && typeof target.draw === 'function') target.draw(); }
	};
}

// 旧版 canvas 的 measureText 各端实现不一，按字符类型估算宽度
function measure(text, size) {
	let width = 0;
	const str = String(text);
	for (let i = 0; i < str.length; i++) {
		const char = str[i];
		const code = str.charCodeAt(i);
		if (char === ':' || char === '.' || char === ',') width += 0.3;
		else if (char === '/') width += 0.33;
		else if (code >= 0x20 && code <= 0x7e) width += 0.6;
		else width += 1;
	}
	return width * size;
}

export function diagramSize(routeTemplate, maxWidth) {
	if (!routeTemplate || !routeTemplate.train_sequence || !routeTemplate.station_positions) {
		return { width: MAX_CANVAS_WIDTH, height: MIN_DRAWING_HEIGHT + TOP_MARGIN + BOTTOM_MARGIN + VERTICAL_PADDING * 2 };
	}
	const layout = layoutOf(routeTemplate, maxWidth);
	return { width: layout.width, height: layout.height };
}

export function renderRouteDiagram(canvasTarget, routeTemplate, options = {}) {
	if (!canvasTarget) throw new Error('renderRouteDiagram: canvas 上下文不能为空');
	if (!routeTemplate || !routeTemplate.train_sequence || !routeTemplate.station_positions) {
		throw new Error('renderRouteDiagram: routeTemplate 缺少 train_sequence 或 station_positions');
	}

	const painter = createPainter(canvasTarget);
	const trainSequence = routeTemplate.train_sequence;
	const stationPositions = routeTemplate.station_positions;

	const layout = computeLayout(stationPositions.length, countDays(trainSequence),
		normalizeStations(stationPositions), options.maxWidth);

	painter.setFill('#fff');
	painter.fillRect(0, 0, layout.width, layout.height);

	// 里程 → Y 坐标（上北下南：里程大在上方）
	function distanceToY(normalizedDistance) {
		return layout.topMargin + layout.verticalPadding + (1 - normalizedDistance) * layout.drawing;
	}

	drawWatermark(painter, layout, options.logoImage);
	drawGrid(painter, stationPositions, layout, distanceToY);
	drawStations(painter, mirrorSameMileageOrder(stationPositions), layout, distanceToY);
	drawTrainLines(painter, trainSequence, stationPositions, layout, distanceToY);
	drawFooter(painter, options.caption || '', layout);
	painter.flush();

	return { width: layout.width, height: layout.height };
}

// 里程归一化：同里程错开 + 过近拉开，返回归一化后的最小站间间隔（用于保证行距）
function normalizeStations(stationPositions) {
	const distances = stationPositions.map(s => s.distance);
	const minDistance = Math.min(...distances);
	const maxDistance = Math.max(...distances);
	const distanceRange = maxDistance - minDistance;

	stationPositions.forEach(station => {
		station.normalizedDistance = distanceRange > 0
			? (station.distance - minDistance) / distanceRange
			: 0.5;
	});

	const sortedStations = [...stationPositions].sort((a, b) => a.normalizedDistance - b.normalizedDistance);

	// 起点处多个同里程车站依次错开 0.01
	let minCount = 0;
	for (let i = 0; i < sortedStations.length; i++) {
		if (Math.abs(sortedStations[i].normalizedDistance) < 0.0001) {
			minCount++;
			if (minCount > 1) sortedStations[i].normalizedDistance = (minCount - 1) * 0.01;
		} else break;
	}

	// 终点处多个同里程车站依次错开 0.01
	let maxCount = 0;
	for (let i = sortedStations.length - 1; i >= 0; i--) {
		if (Math.abs(sortedStations[i].normalizedDistance - 1) < 0.0001) {
			maxCount++;
			if (maxCount > 1) sortedStations[i].normalizedDistance = 1 - (maxCount - 1) * 0.01;
		} else break;
	}

	// 过近车站拉开：最小间距 0.08，向后推移后重新归一化
	const minGapRatio = 0.08;
	let hasCloseStations = false;
	for (let i = 1; i < sortedStations.length; i++) {
		if (sortedStations[i].normalizedDistance - sortedStations[i - 1].normalizedDistance < minGapRatio) {
			hasCloseStations = true;
			break;
		}
	}

	if (hasCloseStations) {
		const closePairs = [];
		for (let i = 1; i < sortedStations.length; i++) {
			const gap = sortedStations[i].normalizedDistance - sortedStations[i - 1].normalizedDistance;
			if (gap < minGapRatio) closePairs.push({ index: i, deficit: minGapRatio - gap });
		}
		closePairs.forEach(pair => {
			for (let j = pair.index; j < sortedStations.length; j++) {
				sortedStations[j].normalizedDistance += pair.deficit;
			}
		});

		const newMin = sortedStations[0].normalizedDistance;
		const newMax = sortedStations[sortedStations.length - 1].normalizedDistance;
		const newRange = newMax - newMin;
		if (newRange > 0) {
			sortedStations.forEach(s => {
				s.normalizedDistance = (s.normalizedDistance - newMin) / newRange;
			});
		}
	}

	let minGap = 1;
	for (let i = 1; i < sortedStations.length; i++) {
		minGap = Math.min(minGap, sortedStations[i].normalizedDistance - sortedStations[i - 1].normalizedDistance);
	}
	return sortedStations.length > 1 ? minGap : 1;
}

// 逐段推算所属“天”：显式 day_offset 优先，否则按前后段时刻是否回拨判断跨天
function countDays(trainSequence) {
	let currentDay = 1;
	let maxEndDay = 1;
	for (let i = 0; i < trainSequence.length; i++) {
		const item = trainSequence[i];
		if (i > 0) {
			const prevItem = trainSequence[i - 1];
			if (prevItem.day_offset >= 1) {
				currentDay += prevItem.day_offset;
			} else if (toMinutes(prevItem.end_time) > toMinutes(item.start_time)) {
				currentDay++;
			}
		}
		maxEndDay = Math.max(maxEndDay, currentDay + (item.day_offset || 0));
	}
	return Math.max(1, maxEndDay);
}

function trainDays(trainSequence) {
	let currentDay = 1;
	const days = [1];
	for (let i = 1; i < trainSequence.length; i++) {
		const prevItem = trainSequence[i - 1];
		const currItem = trainSequence[i];
		if (prevItem.day_offset >= 1) {
			currentDay += prevItem.day_offset;
		} else if (toMinutes(prevItem.end_time) > toMinutes(currItem.start_time)) {
			currentDay++;
		}
		days.push(currentDay);
	}
	return days;
}

function toMinutes(timeStr) {
	const parts = String(timeStr || '').split(':');
	const hour = Number(parts[0]);
	const minute = Number(parts[1]);
	if (isNaN(hour) || isNaN(minute)) return NaN;
	return hour * 60 + minute;
}

// 同里程车站顺序镜像，让上行/下行车站标签不重叠
function mirrorSameMileageOrder(stationPositions) {
	const processedStations = [...stationPositions];
	let i = 0;
	while (i < processedStations.length - 1) {
		let j = i + 1;
		while (j < processedStations.length && processedStations[i].distance === processedStations[j].distance) j++;
		if (j > i + 1) {
			for (let k = 0; k < (j - i) / 2; k++) {
				const temp = processedStations[i + k].normalizedDistance;
				processedStations[i + k].normalizedDistance = processedStations[j - 1 - k].normalizedDistance;
				processedStations[j - 1 - k].normalizedDistance = temp;
			}
		}
		i = j;
	}
	return processedStations;
}

function drawGrid(painter, stationPositions, layout, distanceToY) {
	painter.setStroke('#000');
	painter.setLine(1);

	const firstStationY = distanceToY(stationPositions[0].normalizedDistance);
	const lastStationY = distanceToY(stationPositions[stationPositions.length - 1].normalizedDistance);
	const dayFontSize = 15;

	for (let day = 0; day <= layout.totalDays; day++) {
		const dayX = layout.leftMargin + day * layout.dayWidth;
		painter.beginPath();
		painter.moveTo(dayX, firstStationY);
		painter.lineTo(dayX, lastStationY);
		painter.stroke();

		if (day > 0) {
			painter.setFill('#000');
			painter.setFont(dayFontSize);
			painter.setAlign('center');
			painter.setBaseline('top');
			painter.fillText(day.toString(), dayX, layout.topMargin - dayFontSize);
		}
	}

	stationPositions.forEach(station => {
		const y = distanceToY(station.normalizedDistance);
		painter.beginPath();
		painter.moveTo(layout.leftMargin, y);
		painter.lineTo(layout.width - 10, y);
		painter.stroke();
	});
}

function drawStations(painter, stationPositions, layout, distanceToY) {
	painter.setFill('#000');
	painter.setFont(18);
	painter.setAlign('right');
	painter.setBaseline('middle');

	stationPositions.forEach(station => {
		painter.fillText(station.name, layout.leftMargin - 8, distanceToY(station.normalizedDistance));
	});
}

function drawTrainLines(painter, trainSequence, stationPositions, layout, distanceToY) {
	const stationDistanceMap = {};
	stationPositions.forEach(station => {
		stationDistanceMap[station.name] = station.normalizedDistance;
	});

	// 车次显示简化：G1234/G1235 → G1234/5
	function formatTrainCode(code) {
		if (!code || code.indexOf('/') < 0) return code;
		const parts = code.split('/');
		if (parts.length !== 2) return code;
		const firstMatch = parts[0].match(/^([A-Z]+)(\d+)$/);
		const secondMatch = parts[1].match(/^([A-Z]+)(\d+)$/);
		if (!firstMatch || !secondMatch || firstMatch[1] !== secondMatch[1]) return code;

		const firstNumber = firstMatch[2];
		const secondNumber = secondMatch[2];
		let commonLength = 0;
		const minLength = Math.min(firstNumber.length, secondNumber.length);
		for (let k = 0; k < minLength; k++) {
			if (firstNumber[k] === secondNumber[k]) commonLength++;
			else break;
		}
		if (commonLength === 0) return code;
		return `${parts[0]}/${secondNumber.substring(commonLength)}`;
	}

	function timeToX(day, timeMinutes) {
		return layout.leftMargin + (day - 1) * layout.dayWidth + (timeMinutes / 1440) * layout.dayWidth;
	}

	const codeSize = 11;
	const timeSize = 10;
	const pad = 6;
	const waitBoxHeight = 10;

	const days = trainDays(trainSequence);
	const trainLabels = [];
	const timeLabels = [];

	trainSequence.forEach((item, index) => {
		const startDistance = stationDistanceMap[item.start_station_name];
		const endDistance = stationDistanceMap[item.end_station_name];
		if (startDistance === undefined || endDistance === undefined) return;

		const startMinutes = toMinutes(item.start_time);
		const endMinutes = toMinutes(item.end_time);
		if (isNaN(startMinutes) || isNaN(endMinutes)) return;

		const startX = timeToX(days[index], startMinutes);
		const startY = distanceToY(startDistance);
		const endX = timeToX(days[index] + (item.day_offset || 0), endMinutes);
		const endY = distanceToY(endDistance);
		const direction = endY < startY ? 'up' : 'down';

		// 车次标签：沿线段取 7 个候选点，用第一个不碰撞的位置
		const displayCode = formatTrainCode(item.train_code);
		const codeHeight = codeSize * 1.2;
		const ratios = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875];
		const lineTop = Math.min(startY, endY);
		const lineBottom = Math.max(startY, endY);
		let codePos = null;

		// 碰撞判断只看纵向：线段区间内、且不压到任一车站横线
		function collides(y) {
			if (y < lineTop || y + codeHeight > lineBottom) return true;
			for (let s = 0; s < stationPositions.length; s++) {
				if (Math.abs(y - distanceToY(stationPositions[s].normalizedDistance)) < codeHeight / 2) return true;
			}
			return false;
		}

		for (let r = 0; r < ratios.length && !codePos; r++) {
			const baseY = startY + (endY - startY) * ratios[r] - codeHeight / 2;
			if (!collides(baseY)) {
				codePos = { x: startX + (endX - startX) * ratios[r] + pad, y: baseY };
			}
		}
		if (!codePos) {
			codePos = { x: (startX + endX) / 2 + pad, y: (startY + endY) / 2 - codeHeight / 2 };
		}

		trainLabels.push({ displayCode, startX, startY, endX, endY, codeX: codePos.x, codeY: codePos.y });

		const startTimeText = item.start_time;
		const endTimeText = item.end_time;
		if (startTimeText) {
			const height = timeSize * 1.2;
			timeLabels.push({
				text: startTimeText,
				type: 'start',
				targetX: startX,
				x: startX,
				y: direction === 'up' ? startY + pad : startY - height - pad,
				width: measure(startTimeText, timeSize),
				height
			});
		}
		if (endTimeText) {
			const height = timeSize * 1.2;
			timeLabels.push({
				text: endTimeText,
				type: 'end',
				targetX: endX,
				x: endX - measure(endTimeText, timeSize),
				y: direction === 'up' ? endY - height - pad : endY + pad,
				width: measure(endTimeText, timeSize),
				height
			});
		}
	});

	// 同站等待（折返/过夜）：上一段终到站 = 下一段始发站时，用矩形框出这段停留
	const bottomRowY = distanceToY(Math.min(...stationPositions.map(s => s.normalizedDistance)));
	const waitBoxes = [];
	trainSequence.forEach((item, index) => {
		const next = trainSequence[index + 1];
		if (!next || item.end_station_name !== next.start_station_name) return;

		const distance = stationDistanceMap[item.end_station_name];
		const fromMinutes = toMinutes(item.end_time);
		const toMinutesNext = toMinutes(next.start_time);
		if (distance === undefined || isNaN(fromMinutes) || isNaN(toMinutesNext)) return;

		const x1 = timeToX(days[index] + (item.day_offset || 0), fromMinutes);
		const x2 = timeToX(days[index + 1], toMinutesNext);
		if (!(x2 > x1)) return;
		// 最下面一行往下画，其余往上，避免压到相邻横线
		waitBoxes.push({ x1, x2, y: distanceToY(distance), down: distanceToY(distance) >= bottomRowY });
	});

	// 时刻标签按行分组做水平避让
	const labelsByRow = {};
	timeLabels.forEach(label => {
		const rowKey = Math.round(label.y);
		if (!labelsByRow[rowKey]) labelsByRow[rowKey] = [];
		labelsByRow[rowKey].push(label);
	});

	Object.keys(labelsByRow).forEach(key => {
		const rowLabels = labelsByRow[key];
		rowLabels.sort((a, b) => a.targetX - b.targetX);
		rowLabels.forEach(label => {
			label.level = 0;
			label.x = label.type === 'start' ? label.targetX : label.targetX - label.width;
		});

		const gap = 4;
		for (let i = 0; i < rowLabels.length - 1; i++) {
			const current = rowLabels[i];
			const next = rowLabels[i + 1];
			if (current.x + current.width + gap > next.x) next.x = current.x + current.width + gap;
		}
		for (let i = rowLabels.length - 1; i > 0; i--) {
			const current = rowLabels[i];
			const prev = rowLabels[i - 1];
			if (current.type === 'end') {
				const idealX = current.targetX - current.width;
				if (idealX >= prev.x + prev.width + gap && current.x > idealX) current.x = idealX;
			}
		}

		// 窄屏推完还是挤，就往下错一行重新摆
		for (let level = 0; level < 3; level++) {
			let moved = false;
			for (let i = 1; i < rowLabels.length; i++) {
				const current = rowLabels[i];
				const prev = rowLabels[i - 1];
				if (current.level === prev.level && current.x < prev.x + prev.width + gap) {
					current.level = prev.level + 1;
					current.y += current.height + 2;
					current.x = current.type === 'start' ? current.targetX : current.targetX - current.width;
					moved = true;
				}
			}
			if (!moved) break;
		}
	});

	painter.setStroke('#000');
	painter.setLine(2);
	trainLabels.forEach(({ startX, startY, endX, endY }) => {
		painter.beginPath();
		painter.moveTo(startX, startY);
		painter.lineTo(endX, endY);
		painter.stroke();

		const arrowBaseX = endX - (endX - startX) * 0.05;
		const arrowBaseY = endY - (endY - startY) * 0.05;
		const angle = Math.atan2(endY - startY, endX - startX);
		painter.beginPath();
		painter.moveTo(arrowBaseX, arrowBaseY);
		painter.lineTo(arrowBaseX - 5 * Math.cos(angle - Math.PI / 6), arrowBaseY - 5 * Math.sin(angle - Math.PI / 6));
		painter.moveTo(arrowBaseX, arrowBaseY);
		painter.lineTo(arrowBaseX - 5 * Math.cos(angle + Math.PI / 6), arrowBaseY - 5 * Math.sin(angle + Math.PI / 6));
		painter.stroke();
	});

	// 等待矩形画三条边，横线本身封底
	painter.setLine(2);
	waitBoxes.forEach(({ x1, x2, y, down }) => {
		const offset = down ? waitBoxHeight : -waitBoxHeight;
		painter.beginPath();
		painter.moveTo(x1, y);
		painter.lineTo(x1, y + offset);
		painter.lineTo(x2, y + offset);
		painter.lineTo(x2, y);
		painter.stroke();
	});

	// 先车次标签后时刻标签；画布放不下或与其它标签相交的直接舍弃，避免糊成一片
	const occupied = [];
	function fits(box) {
		if (box.x < layout.leftMargin || box.x + box.w > layout.width - 4) return false;
		if (box.y < 0 || box.y + box.h > layout.height) return false;
		return !occupied.some(other =>
			box.x < other.x + other.w && other.x < box.x + box.w &&
			box.y < other.y + other.h && other.y < box.y + box.h);
	}

	painter.setFill('#000');
	trainLabels.forEach(({ displayCode, codeX, codeY }) => {
		const box = { x: codeX, y: codeY, w: measure(displayCode, codeSize), h: codeSize * 1.2 };
		if (!fits(box)) return;
		occupied.push(box);
		painter.setFont(codeSize, true);
		painter.setAlign('left');
		painter.setBaseline('top');
		painter.fillText(displayCode, codeX, codeY);
	});

	timeLabels.forEach(({ text, x, y, width, height }) => {
		const box = { x, y, w: width, h: height };
		if (!fits(box)) return;
		occupied.push(box);
		painter.setFont(timeSize);
		painter.setAlign('left');
		painter.setBaseline('top');
		painter.fillText(text, x, y);
	});
}

function drawWatermark(painter, layout, logoImage) {
	const plotTop = layout.topMargin + layout.verticalPadding;
	const plotLeft = layout.leftMargin;
	const plotWidth = layout.width - plotLeft - 10;

	// 以宽为主、高度兜底，保证标识完整落在横线区域内
	const logoWidth = Math.min(plotWidth * 0.58, layout.drawing * LOGO_ASPECT * 0.86);
	const logoHeight = logoWidth / LOGO_ASPECT;

	painter.setAlpha(0.12);
	// 原生 2D 上下文只能画 Image 对象，旧版上下文传路径
	painter.drawImage(logoImage || LOGO_PATH,
		plotLeft + (plotWidth - logoWidth) / 2,
		plotTop + (layout.drawing - logoHeight) / 2,
		logoWidth, logoHeight);
	painter.setAlpha(1);
}

function drawFooter(painter, caption, layout) {
	if (!caption) return;
	const captionSize = 12;

	painter.setFill('#000');
	painter.setFont(captionSize);
	painter.setAlign('right');
	painter.setBaseline('bottom');
	painter.fillText(caption, layout.width - 8, layout.height - 6);
}


/**
 * 交路图数据：每段只取起讫站作为横线，里程轴按车次单双号指示的南北/东西朝向累加里程编号
 * trips: [{ train_code, from, to, timetable: [{ station, arrive, depart, distance, day }] }]，顺序即交路循环顺序
 */
export function buildRouteTemplate(trips) {
	const segments = [];
	const seen = {};

	(trips || []).forEach(trip => {
		const code = String(trip.train_code || '').toUpperCase();
		if (!code || seen[code]) return;
		seen[code] = true;
		const segment = parseSegment(code, trip.from, trip.to, trip.timetable);
		if (segment) segments.push(segment);
	});

	if (segments.length === 0) return { train_sequence: [], station_positions: [] };

	const axis = buildMileageAxis(segments);
	const stationPositions = Object.keys(axis)
		.map(name => ({ name, distance: axis[name] }))
		.filter(s => !isNaN(s.distance))
		.sort((a, b) => a.distance - b.distance);

	const trainSequence = segments
		.filter(segment => axis[segment.start_station_name] !== undefined &&
			axis[segment.end_station_name] !== undefined)
		.map(segment => ({
			train_code: segment.train_code,
			start_station_name: segment.start_station_name,
			end_station_name: segment.end_station_name,
			start_time: segment.start_time,
			end_time: segment.end_time,
			// 本段自身跨过的天数，供绘制时推算所属日
			day_offset: segment.day_offset
		}));

	return { train_sequence: trainSequence, station_positions: stationPositions };
}

// 从整张时刻表里切出这一段：起讫站取交路项的 from/to，缺省回落到该车次的首末站
function parseSegment(code, from, to, timetable) {
	const rows = (timetable || []).filter(row => row && row.station);
	if (rows.length < 2) return null;

	const fromIndex = indexOfStation(rows, pickStation(from, rows), 0);
	const toIndex = indexOfStation(rows, pickStation(to, rows), rows.length - 1);
	if (fromIndex === toIndex) return null;

	const start = rows[fromIndex];
	const end = rows[toIndex];
	const startTime = toTime(start.depart || start.arrive);
	const endTime = toTime(end.arrive || end.depart);
	if (!startTime || !endTime) return null;

	const startMileage = toNumber(start.distance);
	const endMileage = toNumber(end.distance);
	const mileage = startMileage !== null && endMileage !== null
		? Math.abs(endMileage - startMileage)
		: null;

	return {
		train_code: code,
		start_station_name: start.station,
		end_station_name: end.station,
		start_time: startTime,
		end_time: endTime,
		day_offset: Math.max(0, (toNumber(end.day) || 0) - (toNumber(start.day) || 0)),
		mileage
	};
}

// from/to 可能是站名、站名数组或“站名+时刻”，取第一个能在时刻表里匹配上的站名
function pickStation(value, rows) {
	const list = (Array.isArray(value) ? value : [value])
		.map(item => (item && typeof item === 'object')
			? (item.station || item.name || '')
			: String(item || ''))
		.map(name => name.split('/')[0].trim())
		.filter(name => name && rows.some(row => row.station === name));
	return list.length > 0 ? list[0] : '';
}

function indexOfStation(rows, name, fallback) {
	if (!name) return fallback;
	const index = rows.findIndex(row => row.station === name);
	return index < 0 ? fallback : index;
}

/**
 * 里程轴：每段的朝向由车次单双号决定（双号上行=发站在南、终到站在北，单号相反，
 * 即南→北、西→东为上行），据此在交路图上逐站累加里程编号；渲染时 distance 大者在上，
 * 所以同一线路走廊上的站自然相邻，折返段只是往回画。判不出朝向的（复车次）挂在区间较近的端头外侧。
 */
function buildMileageAxis(segments) {
	const adjacency = buildAdjacency(segments);
	const axis = {};

	connectedGroups(adjacency).sort((a, b) => b.length - a.length).forEach(group => {
		const known = Object.keys(axis);
		placeGroup(group, adjacency, axis);
		if (known.length === 0) return;
		// 与干线不连通的整组，接在全图最南端之下
		const placed = group.filter(name => axis[name] !== undefined);
		const groupMax = Math.max(...placed.map(name => axis[name]));
		const delta = Math.min(...known.map(name => axis[name])) - DEFAULT_GAP - groupMax;
		placed.forEach(name => {
			axis[name] += delta;
		});
	});

	return axis;
}

// 一对站之间的上/下行车合并成两条有向边：里程取大者，朝向保留能判出来的那个
function buildAdjacency(segments) {
	const adjacency = {};

	function addEdge(from, to, mileage, ascends) {
		const list = adjacency[from] || (adjacency[from] = []);
		const existing = list.find(edge => edge.to === to);
		if (existing) {
			existing.mileage = Math.max(existing.mileage, mileage);
			if (existing.ascends === null) existing.ascends = ascends;
			return;
		}
		list.push({ to, mileage, ascends });
	}

	segments.forEach(segment => {
		const from = segment.start_station_name;
		const to = segment.end_station_name;
		if (!from || !to || from === to) return;
		const mileage = segment.mileage || DEFAULT_GAP;
		const up = trainDirectionUp(segment.train_code);
		const ascends = up === 0 ? null : up > 0;
		addEdge(from, to, mileage, ascends);
		addEdge(to, from, mileage, ascends === null ? null : !ascends);
	});

	return adjacency;
}

// 双号为上行。复车次（K56/57、G1806/7）在线路分界处换向，整段方向判不准，按未知处理
function trainDirectionUp(code) {
	const digits = String(code || '').match(/\d+/g);
	if (!digits || digits.length === 0) return 0;
	const first = Number(digits[0]) % 2;
	if (digits.length > 1 && Number(digits[1]) % 2 !== first) return 0;
	return first === 0 ? 1 : -1;
}

function connectedGroups(adjacency) {
	const seen = {};
	const groups = [];

	Object.keys(adjacency).forEach(name => {
		if (seen[name]) return;
		const group = [];
		const queue = [name];
		while (queue.length > 0) {
			const current = queue.shift();
			if (seen[current]) continue;
			seen[current] = true;
			group.push(current);
			(adjacency[current] || []).forEach(edge => {
				if (!seen[edge.to]) queue.push(edge.to);
			});
		}
		groups.push(group);
	});

	return groups;
}

// 判得出方向里里程最大的那段，用来先框住轴向
function longestKnownEdge(group, adjacency) {
	let best = null;
	group.forEach(name => {
		(adjacency[name] || []).forEach(edge => {
			if (edge.ascends === null) return;
			if (!best || edge.mileage > best.mileage) {
				best = { from: name, to: edge.to, mileage: edge.mileage, ascends: edge.ascends };
			}
		});
	});
	return best;
}

// 判不出方向的那段往已排布区间的较近端头外侧挂，避免挤在中间
function signOf(axis, fromValue) {
	const values = Object.keys(axis).map(name => axis[name]);
	const min = Math.min(...values);
	const max = Math.max(...values);
	return fromValue - min >= max - fromValue ? 1 : -1;
}

function placeGroup(group, adjacency, axis) {
	const anchor = longestKnownEdge(group, adjacency);
	// 根取该段的南端：上行段的发站在南，下行段的终到站在南
	const root = anchor ? (anchor.ascends ? anchor.from : anchor.to) : group[0];

	axis[root] = 0;
	const queue = [root];
	while (queue.length > 0) {
		const name = queue.shift();
		(adjacency[name] || []).forEach(edge => {
			if (axis[edge.to] !== undefined) return;
			const sign = edge.ascends === null ? signOf(axis, axis[name]) : (edge.ascends ? 1 : -1);
			axis[edge.to] = axis[name] + sign * edge.mileage;
			queue.push(edge.to);
		});
	}
}

function toNumber(value) {
	if (value === null || value === undefined || value === '') return null;
	const raw = typeof value === 'object' ? value.parsedValue : value;
	const parsed = Number(String(raw).replace(/[^\d.\-]/g, ''));
	return isNaN(parsed) ? null : parsed;
}

function toTime(value) {
	if (!value) return '';
	const matched = String(value).match(/(\d{1,2})[:：]?(\d{2})/);
	if (!matched) return '';
	const hour = Number(matched[1]);
	const minute = Number(matched[2]);
	if (hour > 23 || minute > 59) return '';
	return `${hour < 10 ? '0' : ''}${hour}:${matched[2]}`;
}
