import { preview } from 'vite';
import { chromium } from '@playwright/test';

(async () => {
  const server = await preview({
    preview: { port: 5198 }
  });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5198');
  await page.waitForLoadState('networkidle');

  // Place some pieces and setup a thrilling combo state
  await page.evaluate(() => {
    const g = window.__game;
    // Set up a vibrant pattern
    const colors = ['color-cyan', 'color-purple', 'color-gold', 'color-green', 'color-red', 'color-orange'];
    for (let r = 2; r < 7; r++) {
      for (let c = 1; c < 7; c++) {
        if ((r + c) % 2 === 0) {
          g.board[r][c] = colors[(r * 3 + c) % colors.length];
        }
      }
    }
    // Set score and combo
    g.score = 1450;
    g.bestScore = 2380;
    g.combo = 3;
    g.updateScoreUI();
    g.updateComboUI();
    g.renderBoard();

    // Trigger a floater
    g.createScoreFloater('COMBO x3! +350', 206, 380, true);
  });

  await page.waitForTimeout(400);

  await page.screenshot({ path: 'screenshot_gameplay.png' });
  console.log('Gameplay screenshot saved to screenshot_gameplay.png');

  await browser.close();
  await server.httpServer.close();
  process.exit(0);
})();
