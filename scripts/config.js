export const TRAIN_KIND_COLOR_MAP = {
	"": "#a9dfbf", // 普慢
	"1": "#a9dfbf", // 普慢
	"2": "#a9dfbf", // 普慢
	"3": "#a9dfbf", // 普慢
	"4": "#a9dfbf", // 普慢
	"5": "#a9dfbf", // 普慢
	"6": "#a9dfbf", // 普慢
	"7": "#a9dfbf", // 普慢
	"8": "#a9dfbf", // 普慢
	"K": "#eeba67", // 快速
	"T": "#459811", // 特快
	"Z": "#114598", // 直特
	"G": "#c0392b", // 高动
	"D": "#5499c7", // 动车+城际
	"C": "#2e9f9c",
	"S": "#8e44ad", // 市域
	"L": "#a9dfbf", // 临客
	"Y": "#eeba67" // 旅游
};

export const CAR_PERFORMANCE = {
	"CRH1A (200)": ["8", "5M3T", "4/5车 有座", "200", "/static/trainHead/CRH1A.png"],
	"CRH1A (250)": ["8", "5M3T", "4/5车 有座", "250", "/static/trainHead/CRH1A.png"],
	"CRH1B": ["16", "10M6T", "9车 有座", "250", "/static/trainHead/CRH1B.png"],
	"CRH1B (1E头型)": ["16", "10M6T", "9车 有座", "250", "/static/trainHead/CRH1E.png"],
	"CRH1E": ["16", "10M6T", "9车 有座(旧)/无座(统)", "250", "/static/trainHead/CRH1E.png"],
	"CRH1E-NG": ["16", "10M6T", "9车 无座", "250", "/static/trainHead/CRH1A-A.png"],
	"CRH1A-A": ["8", "5M3T", "5车 无座", "250", "/static/trainHead/CRH1A-A.png"],
	"CRH2A (旧型)": ["8", "4M4T", '5车 有座', "250", "/static/trainHead/CRH2A.png"],
	"CRH2A (统型)": ["8", "4M4T", '5车 无座', "250", "/static/trainHead/CRH2A.png"],
	"CRH2B (旧型)": ["16", "8M8T", "8车 有座", "250", "/static/trainHead/CRH2B.png"],
	"CRH2B (统型)": ["16", "8M8T", "8车 有座", "250", "/static/trainHead/CRH2A.png"],
	"CRH2C (一阶)": ["8", "6M2T", "5车 有座", "300", "/static/trainHead/CRH2C.png"],
	"CRH2C (二阶)": ["8", "6M2T", "5车 有座", "300", "/static/trainHead/CRH2C.png"],
	"CRH2E": ["16", "8M8T", "8/9车 有座", "250", "/static/trainHead/CRH2A.png"],
	"CRH2G": ["8", "4M4T", "5车 无座", "250", "/static/trainHead/CRH2G.png"],
	"CRH3A": ["8", "4M4T", "5车 无座", "250", "/static/trainHead/CRH3A.png"],
	"CRH3C (一阶)": ["8", "4M4T", "4车 有座", "320", "/static/trainHead/CRH3C.png"],
	"CRH3C (二阶)": ["8", "4M4T", "4车 有座", "320", "/static/trainHead/CRH3C.png"],
	"CRH3A-A": ["4", "2M2T", "不设餐车", "200", "/static/trainHead/missing.png"],
	"CRH5A": ["8", "5M3T", "6车 无座", "250", "/static/trainHead/CRH5A.png"],
	"CRH5E": ["8", "10M6T", "9车 无座", "250", "/static/trainHead/CRH5E.png"],
	"CRH5G (旧型)": ["8", "5M3T", "5车 无座", "250", "/static/trainHead/CRH5A.png"],
	"CRH5G (技术提升)": ["8", "5M3T", "5车 无座", "250", "/static/trainHead/CRH5G.png"],
	"CRH6A": ["8", "4M4T", "不设餐车", "200", "/static/trainHead/CRH6.png"],
	"CRH6A-A": ["4", "2M2T", "不设餐车", "200", "/static/trainHead/CRH6.png"],
	"CRH6F": ["8", "4M4T", "不设餐车", "200", "/static/trainHead/CRH6.png"],
	"CRH6F-A": ["4", "2M2T", "不设餐车", "200", "/static/trainHead/CRH6.png"],
	"CRH380A (旧型)": ["8", "6M2T", "5车 有座", "350", "/static/trainHead/CRH380A.png"],
	"CRH380A (统型)": ["8", "6M2T", "5车 无座", "350", "/static/trainHead/CRH380A.png"],
	"CRH380AL (一阶)": ["16", "14M2T", "9车 有座", "350", "/static/trainHead/CRH380A.png"],
	"CRH380AL (二阶)": ["16", "14M2T", "9车 有座", "350", "/static/trainHead/CRH380A.png"],
	"CRH380AN": ["8", "4M4T", "5车 有座", "350", "/static/trainHead/CRH380A.png"],
	"CRH380B": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CRH380B.png"],
	"CRH380BL": ["16", "8M8T", "9车 有座", "350", "/static/trainHead/CRH380B.png"],
	"CRH380BG": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CRH380B.png"],
	"CRH380CL": ["16", "8M8T", "9车 有座", "350", "/static/trainHead/CRH380C.png"],
	"CRH380D (旧型)": ["8", "4M4T", "5车 有座", "350", "/static/trainHead/CRH380D.png"],
	"CRH380D (统型)": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CRH380D.png"],
	"CR400AF": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CR400AF.png"],
	"CR400AF-A": ["16", "8M8T", "9车 无座", "350", "/static/trainHead/CR400AF.png"],
	"CR400AF-AE": ["16", "8M8T", "8车 无座", "350", "/static/trainHead/CR400AF.png"],
	"CR400AF-B": ["17", "8M9T", "9车 无座", "350", "/static/trainHead/CR400AF.png"],
	"CR400AF-C": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CR400AF.png"],
	"CR400AF-G": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CR400AF.png"],
	"CR400AF-Z": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CR400AF-Z.png"],
	"CR400AF-AZ": ["16", "8M8T", "9车 无座", "350", "/static/trainHead/CR400AF-Z.png"],
	"CR400AF-BZ": ["17", "8M9T", "9车 无座", "350", "/static/trainHead/CR400AF-Z.png"],
	"CR400AF-S": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CR400AF-Z.png"],
	"CR400AF-AS": ["16", "8M8T", "9车 无座", "350", "/static/trainHead/CR400AF-Z.png"],
	"CR400AF-BS": ["17", "8M9T", "9车 无座", "350", "/static/trainHead/CR400AF-Z.png"],
	"CR400BF": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CR400BF.png"],
	"CR400BF-A": ["16", "8M8T", "9车 无座", "350", "/static/trainHead/CR400BF.png"],
	"CR400BF-B": ["17", "8M9T", "9车 无座", "350", "/static/trainHead/CR400BF.png"],
	"CR400BF-G": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CR400BF.png"],
	"CR400BF-C": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CR400BF-C.png"],
	"CR400BF-C “瑞雪迎春”": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CR400BF-C.png"],
	"CR400BF-Z": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CR400BF-Z.png"],
	"CR400BF-AZ": ["16", "8M8T", "9车 无座", "350", "/static/trainHead/CR400BF-Z.png"],
	"CR400BF-BZ": ["17", "8M9T", "9车 无座", "350", "/static/trainHead/CR400BF-Z.png"],
	"CR400BF-GZ": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CR400BF-Z.png"],
	"CR400BF-S": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CR400BF-Z.png"],
	"CR400BF-AS": ["16", "8M8T", "9车 无座", "350", "/static/trainHead/CR400BF-Z.png"],
	"CR400BF-BS": ["17", "8M9T", "9车 无座", "350", "/static/trainHead/CR400BF-Z.png"],
	"CR400BF-GS": ["8", "4M4T", "5车 无座", "350", "/static/trainHead/CR400BF-Z.png"],
	"CR300AF": ["8", "4M4T", "5车 无座", "250", "/static/trainHead/CR300AF.png"],
	"CR300BF": ["8", "4M4T", "5车 无座", "250", "/static/trainHead/CR300BF.png"],
	"CR200J (短编)": ["9", "1M8T", "4车 无座", "160", "/static/trainHead/CR200JA.png"],
	"CR200J (长编)": ["18", "2M16T", "9车 无座", "160", "/static/trainHead/CR200JA.png"],
	"CR200JS-G": ["12", "3M9T", "4车 无座", "160", "/static/trainHead/CR200JB.png"],
	"CR200J1-C (短编)": ["9", "1M8T", "4车 无座", "160", "/static/trainHead/CR200JC.png"],
	"CR200J1-C (长编)": ["18", "2M16T", "9车 无座", "160", "/static/trainHead/CR200JC.png"],
	"CR200J1-D": ["9", "1M8T", "4车 无座", "160", "/static/trainHead/CR200JC.png"],
	"CR200J3-C (短编)": ["9", "1M8T", "4车 无座", "160", "/static/trainHead/CR200JC.png"],
	"CR200J3-C (长编)": ["18", "2M16T", "9车 无座", "160", "/static/trainHead/CR200JC.png"]
}

export const KEYS_STRUCT_TRAINS = ["code", "number", "numberFull", "numberKind", "bureau", "bureauName", "type",
	"runner", "car", "carOwner", "diagram", "timetable", "spend", "rundays", "route", "isTemp", "isFuxing"
]

export const KEYS_STRUCT_STATIONS = ["telecode", "pinyin", "pinyinTriple", "tmism", "name", "bureau", "belong", "lines",
	"type", "trainList", "level", "city", "province"
]