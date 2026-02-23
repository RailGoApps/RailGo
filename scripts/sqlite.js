// @/scripts/sqlite.js

// #ifdef H5
import {uniGet} from "@/scripts/req.js";
// #endif

export async function loadDB() {
	// #ifdef APP-PLUS
	await plus.sqlite.openDatabase({
		name: 'railgo',
		path: '_doc/railgo.sqlite',
		fail: () => {
			console.log("Error when loading SQLite database");
		}
	});
	// #endif
}

export async function doQuery(sql, struct) {
	// #ifdef APP-PLUS
	if (!plus.sqlite.isOpenDatabase({
			name: 'railgo',
			path: '_doc/railgo.sqlite'
		})) {
		throw new Error("SQLite DB hasn't opened yet");
	}
	return new Promise((resolve, reject) => {
		plus.sqlite.selectSql({
			name: 'railgo',
			sql: sql,
			success: data => {
				let res = [];
				data.forEach((v, i) => {
					for (let k in v) {
						try {
							if (v[k].includes("[") || v[k].includes("{")) {
								v[k] = JSON.parse(v[k]);
							}
						} catch (e) {
							;
						}
					}
					res.push(v);
				});
				resolve(res);
			},
			fail: (e) => {
				console.error("SQL查询失败:", e);
				reject(e);
			}
		})
	});
	// #endif
	// #ifdef H5
	let res = (await uniGet("http://127.0.0.1:5000/query", {
		params: {
			"sql": sql
		}
	})).data;
	res.forEach((v, i) => {
		let item = {};
		for (var x = 0; x < v.length; x++) {
			try {
				if (v[x].includes("[") || v[x].includes("{")) {
					v[x] = JSON.parse(v[x]);
				}
			} catch (e) {
				;
			}
			item[struct[x]] = v[x];
		}
		res[i] = item;
	});
	return res;
	// #endif
}

export async function doExecute(sql) {
	// #ifdef APP-PLUS
	if (!plus.sqlite.isOpenDatabase({
			name: 'railgo',
			path: '_doc/railgo.sqlite'
		})) {
		throw new Error("SQLite DB hasn't opened yet");
	}
	return new Promise((resolve, reject) => {
		plus.sqlite.executeSql({
			name: 'railgo',
			sql: sql,
			success: () => {
				resolve(true);
			},
			fail: (e) => {
				console.error("SQL执行失败:", e);
				reject(e);
			}
		})
	});
	// #endif
	// #ifdef H5
	console.error("H5端不支持直接执行SQL语句");
	return false;
	// #endif
}

export async function close() {
	// #ifdef APP-PLUS
	await plus.sqlite.closeDatabase({
		name: "railgo"
	});
	// #endif
}