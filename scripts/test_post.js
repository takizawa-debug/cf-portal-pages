const http = require('http');

async function test() {
    try {
        const loginPayload = JSON.stringify({ username: 'admin', password: 'password' });

        // 1. Login
        const loginOpts = {
            hostname: 'localhost',
            port: 8788,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginPayload)
            }
        };

        const loginReq = http.request(loginOpts, (res) => {
            const setCookie = res.headers['set-cookie'];
            const cookie = setCookie ? setCookie[0].split(';')[0] : '';

            // 2. Post Keyword
            const postPayload = JSON.stringify({ keyword: 'test', priority: 5 });
            const postOpts = {
                hostname: 'localhost',
                port: 8788,
                path: '/api/keywords',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postPayload),
                    'Cookie': cookie
                }
            };

            const postReq = http.request(postOpts, (res2) => {
                let data = '';
                res2.on('data', chunk => data += chunk);
                res2.on('end', () => {
                    console.log('Status:', res2.statusCode);
                    console.log('Response:', data);
                });
            });
            postReq.write(postPayload);
            postReq.end();
        });

        loginReq.write(loginPayload);
        loginReq.end();
    } catch (e) {
        console.error(e);
    }
}

test();
