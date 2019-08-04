const axios = require('axios');
const { log } = require('@or-change/tdk');
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

function normalize(config) {
	if (!config) {
		return;
	}

	if (typeof config !== 'object') {
		throw new Error('The config must be an object');
	}

	const {
		url, method, baseURL,
		headers, timeout, 
		params, data, auth,
		responseType, responseEncoding, maxContentLength,
		withCredentials
	} = config;

	return {
		url,
		method,
		baseURL,
		headers: headers ? headers : axios.defaults.headers,
		timeout, 
		params,
		data,
		auth,
		responseType,
		responseEncoding,
		maxContentLength,
		withCredentials
	}
}

exports.Agent = function (options) {
	const http = axios.create(normalize(options));
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

	function request(config) {
		const start = Date.now();
		const baseURL = http.defaults.baseURL;
		config = normalize(config);
	
		agentLog({
			type: TYPE.REQUEST.START,
			method: config.method,
			url: config.url,
			timeStamp: start
		});

		const cookie = attachCookie(`${baseURL}${config.url}`);

		config.headers.Cookie = cookie;

		return http.request(config)
			.then(response => {
				const { status, statusText, headers } = response;
				const end = Date.now();
	
				agentLog({
					type: TYPE.REQUEST.SUCCESSED,
					method: config.method,
					url: config.url,
					status, statusText, headers,
					timeStamp: end
				});
	
				agentLog({
					type: TYPE.REQUEST.DURSTION,
					duration: end - start,
					method: config.method,
					url: config.url
				});

				saveCookie(response);
	
				return response;
			});
	}

	return {
		request,
		get(url, config) {
			return request(Object.assign({}, config, {
				url, method: 'get'
			}));
		},
		delete(url, config) {
			return request(Object.assign({}, config, {
				url, method: 'delete'
			}));
		},
		head(url, config) {
			return request(Object.assign({}, config, {
				url, method: 'head'
			}));
		},
		options(url, config) {
			return request(Object.assign({}, config, {
				url, method: 'options'
			}));
		},
		post(url, data, config) {
			return request(Object.assign({}, config, {
				url, method: 'post', data
			}));
		},
		put(url, data, config) {
			return request(Object.assign({}, config, {
				url, method: 'put', data
			}));
		},
		patch(url, data, config) {
			return request(Object.assign({}, config, {
				url, method: 'patch', data
			}));
		}
	}
};