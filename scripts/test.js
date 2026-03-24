const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('public/admin.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });

try {
    dom.window.openSubEntityModal('shop');
    console.log("Success! DOM test passed.");
} catch (e) {
    console.log("Error:", e.message);
}
