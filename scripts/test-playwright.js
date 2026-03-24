const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  await page.route('**/api/auth/me', route => route.fulfill({ status: 200, body: JSON.stringify({ user: { username: 'test', role: 'contributor' } }) }));
  await page.route('**/api/posts', route => route.fulfill({ status: 200, body: JSON.stringify([]) }));

  await page.goto('http://localhost:8080/admin.html');
  await page.waitForTimeout(1000);

  // Click on the business panel nav item so it displays
  await page.evaluate(() => {
    document.getElementById('navBusinessProfile').classList.remove('d-none'); // Just in case
    switchMainPanel('business-panel', document.getElementById('navBusinessProfile'));
  });
  await page.waitForTimeout(500);

  // Take a screenshot before
  await page.screenshot({ path: '/tmp/before_click.png' });

  await page.evaluate(() => {
    try {
      openSubEntityModal('shop');
    } catch (e) { }
  });

  await page.waitForTimeout(500);

  // Take a screenshot after
  await page.screenshot({ path: '/tmp/after_click.png' });

  await browser.close();
})();
