const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.route('**/api/auth/me', route => route.fulfill({ status: 200, body: JSON.stringify({ user: { username: 'test', role: 'contributor' } }) }));
  await page.route('**/api/posts', route => route.fulfill({ status: 200, body: JSON.stringify([]) }));

  await page.goto('http://localhost:8080/admin.html');
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    openSubEntityModal('shop');
  });

  await page.waitForTimeout(1000);

  const isVisible = await page.evaluate(() => {
    const el = document.getElementById('subEntityModal');
    return {
      display: window.getComputedStyle(el).display,
      classes: el.className
    };
  });
  console.log("Modal state:", isVisible);

  await browser.close();
})();
