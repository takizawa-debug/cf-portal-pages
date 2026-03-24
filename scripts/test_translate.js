const http = require('http');

async function testTranslate() {
    const loginPayload = JSON.stringify({ username: 'admin', password: 'password123' });

    const loginOpts = {
        hostname: '127.0.0.1',
        port: 8788,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginPayload) }
    };

    const cookie = await new Promise((resolve, reject) => {
        const req = http.request(loginOpts, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : null));
        });
        req.on('error', reject);
        req.write(loginPayload);
        req.end();
    });

    console.log("Cookie:", cookie);

    const translatePayload = JSON.stringify({
        title: "飯綱町のシナノスイート",
        lead_text: "秋の味覚、シナノスイートは飯綱町が誇る最高級のりんごです。",
        body_text: "シナノスイートは、甘みが強く酸味が少ないのが特徴で、子供から大人まで大人気の品種です。牟礼地区で栽培されたものは特に絶品です。"
    });

    const reqOpts = {
        hostname: '127.0.0.1',
        port: 8788,
        path: '/api/translate',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie,
            'Content-Length': Buffer.byteLength(translatePayload)
        }
    };

    const req = http.request(reqOpts, (res) => {
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => console.log('Response:', res.statusCode, rawData));
    });

    req.on('error', (e) => console.error(e));
    req.write(translatePayload);
    req.end();
}

testTranslate();
