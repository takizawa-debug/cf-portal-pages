const fs = require('fs');
const http = require('http');

async function uploadExcel() {
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
            res.on('end', () => resolve(res.headers['set-cookie'][0].split(';')[0]));
        });
        req.on('error', reject);
        req.write(loginPayload);
        req.end();
    });

    const boundary = '----WebKitFormBoundaryExcelTest123';
    let postData = '';
    postData += `--${boundary}\r\n`;
    postData += `Content-Disposition: form-data; name="title"\r\n\r\n`;
    postData += `ダミーエクセル\r\n`;
    postData += `--${boundary}\r\n`;
    postData += `Content-Disposition: form-data; name="file"; filename="dummy.xlsx"\r\n`;
    postData += `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`;

    const fileData = fs.readFileSync('dummy.xlsx');
    const endData = `\r\n--${boundary}--\r\n`;

    const requestOptions = {
        hostname: '127.0.0.1',
        port: 8788,
        path: '/api/knowledge',
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Cookie': cookie,
            'Content-Length': Buffer.byteLength(postData) + fileData.length + Buffer.byteLength(endData)
        }
    };

    const req = http.request(requestOptions, (res) => {
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => console.log('Response:', res.statusCode, rawData));
    });

    req.on('error', (e) => console.error(e));
    req.write(postData);
    req.write(fileData);
    req.write(endData);
    req.end();
}

uploadExcel();
