const axios = require('axios');
const { log } = require('tdk');
const { CookieJar } = require('cookiejar');
const { CookieAccessInfo } = require('cookiejar');
const { parse } = require('url');

const TYPE = {
	REQUEST: {
		START: 0,
		SUCCESSED: 1,
		DURATION: 2
	}
}

function agentLog(message) {
	log('agent', JSON.stringify(message));
}

exports.agent = function (options) {
	const http = axios.create(options);
	const cookie = new CookieJar();

	function attachCookie(urlString) {
		const url = parse(urlString);

		const access = new CookieAccessInfo(
			url.hostname,
			url.pathname,
			url.protocol === 'https:'
		);
		
		return cookie.getCookies(access).toValueString();
	}
	
	function saveCookie(response) {
		const cookies = response.headers['set-cookie'];
  	if (cookies) {
			cookie.setCookies(cookies);
		}
	}

	return {
		request(config) {
			const start = Date.now();
			const baseURL = http.defaults.baseURL;
		
			agentLog({
				type: TYPE.REQUEST.START,
				method: config.method,
				url: config.url,
				timeStamp: start
			});

			const cookie = attachCookie(`${baseURL}${config.url}`);

			config.headers.cookies = cookie;

			return http.request(config)
				.then(response => {
					const { data, status, statusText, headers } = response;
					const end = Date.now();
		
					agentLog({
						type: TYPE.REQUEST.SUCCESSED,
						method: config.method,
						url: config.url,
						data, status, statusText, headers,
						timeStamp: end
					});
		
					agentLog({
						type: TYPE.REQUEST.DURSTION,
						duration: end - start,
						method: config.method,
						url: config.url,
						send: config.data
					});

					saveCookie(response);
		
					return response;
				});
		},
		get(url, config) {
			return request(Object.assign({}, config, { url }));
		},
		delete(url, config) {
			return request(Object.assign({}, config, { url }));
		},
		head(url, config) {
			return request(Object.assign({}, config, {
				url, method: 'head', url
			}));
		},
		options(url, config) {
			return request(Object.assign({}, config, {
				url, method: 'options', url
			}));
		},
		post(url, data, config) {
			return request(Object.assign({}, config, {
				url, method: 'post', url, data
			}));
		},
		put(url, data, config) {
			return request(Object.assign({}, config, {
				url, method: 'put', url, data
			}));
		},
		patch(url, data, config) {
			return request(Object.assign({}, config, {
				url, method: 'patch', url, data
			}));
		}
	}
};