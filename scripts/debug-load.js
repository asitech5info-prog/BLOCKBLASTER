import { preview } from 'vite';
import { chromium } from '@playwright/test';

(async () => {
  const server = await preview({ preview: { port: 5197 } });
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message, err.stack));

  await page.goto('http://localhost:5197');
  await page.waitForTimeout(2000);

  const homeClasses = await page.evaluate(() => {
    const el = document.getElementById('screen-home');
    return el ? el.className : 'NOT_FOUND';
  });
  console.log('SCREEN-HOME CLASSES:', homeClasses);

  await browser.close();
  await server.httpServer.close();
  process.exit(0);
})();
