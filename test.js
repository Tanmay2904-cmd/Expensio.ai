const http = require('http');

function request(path, method, body, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const req = http.request({
            hostname: 'localhost', port: 8080, path, method, headers
        }, res => {
            let resBody = '';
            res.on('data', d => resBody += d);
            res.on('end', () => resolve({ status: res.statusCode, body: resBody }));
        });
        if (body) req.write(data);
        req.end();
    });
}

(async () => {
    // 1. Register
    console.log('Registering...');
    const regRes = await request('/api/auth/register', 'POST', { name: 'DummyAdmin1232', password: 'test', role: 'ADMIN' });
    console.log('Reg Result:', regRes);

    // 2. Login
    const loginRes = await request('/api/auth/login', 'POST', { username: 'DummyAdmin1232', password: 'test' });
    let token = null;
    try {
        token = JSON.parse(loginRes.body).token;
    } catch (e) {
        console.log('Login failed', loginRes.body);
        process.exit(1);
    }

    // 3. Test API that threw 500
    const postRes = await request('/api/users', 'POST', { name: 'testduplicateornew', password: 'test', role: 'USER' }, token);
    console.log('POST /api/users:', postRes);

    const delRes = await request('/api/users/notreal', 'DELETE', null, token);
    console.log('DELETE /api/users/notreal:', delRes);
})();
