const fs = require('fs');
let html = fs.readFileSync('public/sourapple/index.html', 'utf8');
let count = 1;
html = html.replace(/<img[^>]+src="([^"]+)"/g, (match, src) => {
    // Keep the src, but append or replace.
    return match.replace(src, `https://via.placeholder.com/600x600/3e3e3e/FFFFFF/?text=No.${count++}`);
});
fs.writeFileSync('public/sourapple/index.html', html);
console.log('Stamping complete. ' + (count - 1) + ' images stamped.');
