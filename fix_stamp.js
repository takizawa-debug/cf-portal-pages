const fs = require('fs');

// Fix index.html
let html = fs.readFileSync('public/sourapple/index.html', 'utf8');
html = html.replace(/https:\/\/via\.placeholder\.com\/600x600\/3e3e3e\/FFFFFF\/\?text=No\.(\d+)/g, (match, num) => {
    return `https://dummyimage.com/600x600/3e3e3e/ffffff&text=No.${num}`;
});
fs.writeFileSync('public/sourapple/index.html', html);

// Fix style.css
let css = fs.readFileSync('public/sourapple/style.css', 'utf8');
css = css.replace(/https:\/\/via\.placeholder\.com\/2000x800\/222222\/FFFFFF\/\?text=No\.(\d+)/g, (match, num) => {
    return `https://dummyimage.com/2000x800/222222/ffffff&text=No.${num}`;
});
fs.writeFileSync('public/sourapple/style.css', css);

console.log('Fixed placeholders!');
