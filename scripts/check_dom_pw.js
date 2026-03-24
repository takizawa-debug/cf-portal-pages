const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.route('**/api/auth/me', route => route.fulfill({ status: 200, body: JSON.stringify({ user: { username: 'test', role: 'contributor' } }) }));
    await page.route('**/api/posts', route => route.fulfill({ status: 200, body: JSON.stringify([]) }));

    await page.goto('http://localhost:8080/admin.html');
    await page.waitForTimeout(1000);

    const path = await page.evaluate(() => {
        const el = document.getElementById('subEntityModal');
        if (!el) return 'not found';
        let curr = el;
        let pathStr = [];
        while (curr && curr.tagName) {
            let sid = curr.id ? '#' + curr.id : '';
            let cls = curr.className ? '.' + Array.from(curr.classList).join('.') : '';
            pathStr.push(curr.tagName.toLowerCase() + sid + cls);
            curr = curr.parentNode;
        }
        return pathStr.reverse().join(" -> ");
    });
    console.log("Path:", path);

    await browser.close();
})();
