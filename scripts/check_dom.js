const fs = require('fs');
const html = fs.readFileSync('public/admin.html', 'utf8');

// A very simple checker: let's use jsdom to parse and see parent tags
const { JSDOM } = require('/Users/takizawahiroki/Desktop/Cloudflaretest/node_modules/jsdom');
const dom = new JSDOM(html);
const doc = dom.window.document;

function printParents(id) {
    const el = doc.getElementById(id);
    if (!el) { console.log(id + " not found"); return; }
    let curr = el;
    let path = [];
    while (curr && curr.tagName) {
        let sid = curr.id ? '#' + curr.id : '';
        let cls = curr.className ? '.' + curr.className.replace(/\s+/g, '.') : '';
        path.push(curr.tagName.toLowerCase() + sid + cls);
        curr = curr.parentNode;
    }
    console.log("Path for " + id + ":\n  " + path.reverse().join("\n  -> "));
}

printParents('subEntityModal');
printParents('subEntityForm');
