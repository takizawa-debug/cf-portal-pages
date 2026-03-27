const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8788/', { waitUntil: 'networkidle0' });
  // Wait for animation to finish
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: '/Users/takizawahiroki/.gemini/antigravity/brain/e13d5904-b5a9-4824-bf38-fc9ed36372b4/widget_desktop.png' });

  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.reload({ waitUntil: 'networkidle0' });
  // Wait for animation to finish
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: '/Users/takizawahiroki/.gemini/antigravity/brain/e13d5904-b5a9-4824-bf38-fc9ed36372b4/widget_mobile.png' });

  await browser.close();
  console.log('Screenshots captured');
})();
