// 全局自定义加载动画状态（替代 uni.showLoading）
// 用计数支持嵌套调用：多次 show 需要等量的 hide 才会真正关闭
// 状态通过 uni.$emit 广播：项目里 @vue/reactivity 与 Vue 运行时各有一份实例，
// 跨模块共享 reactive 对象不会触发组件重新渲染。
const state = {
	depth: 0,
	title: '加载中'
};

function broadcast() {
	uni.$emit('railgo-loader', {
		visible: state.depth > 0,
		title: state.title
	});
}

export function showLoader(title = '加载中') {
	state.depth++;
	state.title = title;
	broadcast();
}

export function hideLoader() {
	if (state.depth > 0) {
		state.depth--;
	}
	broadcast();
}

// 强制关闭，用于页面卸载等兜底场景
export function forceHideLoader() {
	state.depth = 0;
	broadcast();
}

// 组件挂载时同步当前状态，避免挂载前已发起的加载看不到
export function getLoaderState() {
	return {
		visible: state.depth > 0,
		title: state.title
	};
}
