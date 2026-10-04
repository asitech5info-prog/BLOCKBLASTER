import { preview } from 'vite';
import { chromium } from '@playwright/test';

(async () => {
  const server = await preview({ preview: { port: 5196 } });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5196');
  await page.waitForSelector('#screen-home.active', { timeout: 8000 });
  await page.waitForTimeout(400);

  // 1. Homepage (Image 1)
  await page.screenshot({ path: 'screenshot_home.png' });
  console.log('Saved screenshot_home.png');

  // 2. Settings Modal (Image 2)
  await page.click('#home-settings-btn');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshot_settings.png' });
  console.log('Saved screenshot_settings.png');
  await page.click('#settings-close-btn');
  await page.waitForTimeout(200);

  // 3. Adventure Map (Image 5)
  await page.click('#btn-mode-adventure');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshot_adventure_map.png' });
  console.log('Saved screenshot_adventure_map.png');

  // 4. In-Game Gameplay (Image 3)
  await page.click('#map-play-level-btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot_ingame.png' });
  console.log('Saved screenshot_ingame.png');

  // 5. Game Over / Death Screen (Image 4)
  await page.evaluate(() => {
    const g = window.__game;
    g.score = 56911;
    g.bestScore = 423506;
    g.triggerGameOver();
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'screenshot_game_over.png' });
  console.log('Saved screenshot_game_over.png');

  await browser.close();
  await server.httpServer.close();
  process.exit(0);
})();
