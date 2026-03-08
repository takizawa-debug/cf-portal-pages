const https = require('https');
require('dotenv').config({ path: '.dev.vars' });

const key = process.env.GEMINI_API_KEY;
https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => console.log(JSON.parse(data).models.map(m => m.name)));
});
