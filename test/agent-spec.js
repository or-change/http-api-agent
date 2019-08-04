const { Agent } = require('../index');
const { tdkAssert } = require('@or-change/tdk')

describe('agent test', () => {
	const agent = Agent({
		baseURL: 'http://localhost:80/api'
	});

	it('method: request', (done) => {
		agent.request({
			method: 'post',
			url: '/session/principal',
			data: {
				username: 'lichao',
				password: 'lichao@or-change.cn'
			}
		}).then((res) => {
			done()
		})
	});

	it('method: get', (done) => {
		agent.get('/project').then(() => {
			done();
		});
	});

	let project;

	it('method: get', (done) => {
		agent.get('/project/1').then((res) => {
			project = res.data;

			done();
		});
	});

	it('method: delete', (done) => {
		agent.delete(`/project/${project.id}`).then(() => {
			done();
		});
	});

	it('method: put', (done) => {
		agent.put(`/project/${project.id}`, {
			name: 'new project 1'
		}).then(() => {
			done();
		});
	});

	it('method: post', (done) => {
		agent.post('/project', {
			name: 'project 2'
		}).then(() => {
			done();
		});
	});

	it('method: head', (done) => {
		agent.head('/project').then(() => {
			done();
		}).catch((e) => {
			tdkAssert.equal(e.message, 'Request failed with status code 404');
		});
	});

	it('method: options', (done) => {
		agent.options('/project').then(() => {
			done();
		}).catch((e) => {
			tdkAssert.equal(e.message, 'Request failed with status code 404');
		});
	});

	it('method: patch', (done) => {
		agent.patch('/project').then(() => {
			done();
		}).catch((e) => {
			tdkAssert.equal(e.message, 'Request failed with status code 404');
		});
	});
});