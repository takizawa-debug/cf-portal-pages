const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.route('**/api/auth/me', route => route.fulfill({ status: 200, body: JSON.stringify({ user: { username: 'test', role: 'contributor' } }) }));
    await page.route('**/api/posts', route => route.fulfill({ status: 200, body: JSON.stringify([]) }));

    let navigated = false;
    page.on('framenavigated', () => { navigated = true; });

    await page.goto('http://localhost:8080/admin.html');
    await page.waitForTimeout(1000);
    navigated = false; // Reset after initial load

    await page.evaluate(() => {
        document.getElementById('navBusinessProfile').classList.remove('d-none');
        document.getElementById('navBusinessProfile').click();
    });
    await page.waitForTimeout(500);

    console.log("Found buttons:", await page.$$eval('button', btns => btns.map(b => b.textContent.trim()).filter(t => t.includes('追加する'))));

    // click the button natively
    await page.click('button:has-text("お店・施設を追加する")');

    await page.waitForTimeout(1000);

    const isVisible = await page.evaluate(() => {
        const el = document.getElementById('subEntityModal');
        return el ? {
            display: window.getComputedStyle(el).display,
            classes: el.className
        } : 'No Modal Found';
    });
    console.log("Modal state after native click:", isVisible);
    console.log("Did page navigate after click?", navigated);

    await browser.close();
})();
