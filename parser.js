const register = [
	function ({
		method, url, timestamp
	}) {
		return `${method}请求${url}开始于${timestamp}`;
	},
	function ({
		method, url, status, statusText,
		headers, timestamp
	}) {
		return `${method}请求${url}成功结束于${timestamp}，状态码：${status}，状态描述：${statusText}
			请求头部为：${JSON.stringify(headers)}
		`;
	},
	function ({
		method, url, duration
	}) {
		return `${method}请求${url}耗时${duration}`;
	}
];

module.exports = function (parser) {
	if (parser.tdk) {
		return;
	}

	parser.agent = function (message) {
		const info = JSON.parse(message);

		if (register[info.type]) {
			return register[info.type](info);
		}
	}
};