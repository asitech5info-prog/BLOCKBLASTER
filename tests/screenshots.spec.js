import { test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Capture All New Screenshots for Verification', async ({ page }) => {
  // 1. Home Screen (Matching Reference WhatsApp Image 2026-10-05 at 10.22.43 AM.jpeg)
  await page.goto('/');
  await page.waitForSelector('#screen-home.active', { timeout: 10000 });
  await page.screenshot({ path: path.join(rootDir, 'screenshot_home_new.png') });

  // 2. Settings Modal from Home (Exit to Home button is HIDDEN)
  await page.locator('#home-settings-btn').click();
  await page.waitForSelector('#settings-modal:not(.hidden)');
  await page.locator('#settings-sound-btn').click();
  await page.locator('#settings-bgm-btn').click();
  await page.screenshot({ path: path.join(rootDir, 'screenshot_settings_new.png') });
  await page.locator('#settings-close-btn').click();

  // 3. More Settings Modal
  await page.locator('#home-settings-btn').click();
  await page.locator('#settings-more-btn').click();
  await page.waitForSelector('#more-settings-modal:not(.hidden)');
  await page.screenshot({ path: path.join(rootDir, 'screenshot_more_settings_new.png') });
  await page.locator('#more-settings-close-btn').click();

  // 4. Medals / Achievement Screen
  await page.locator('#home-settings-btn').click();
  await page.locator('#settings-medal-btn').click();
  await page.waitForSelector('#screen-achievement.active');
  await page.screenshot({ path: path.join(rootDir, 'screenshot_medals_new.png') });
  await page.locator('#achievement-back-btn').click();

  // 5. Adventure Level 1 Gameplay with Tree Layout and 90 Gems (Matching Reference Image 1)
  await page.locator('#btn-mode-adventure').click();
  await page.waitForSelector('#screen-gameplay.active');
  await page.screenshot({ path: path.join(rootDir, 'screenshot_gameplay_new.png') });

  // 6. In-Game Settings Modal (Exit to Home button is SHOWN!)
  await page.locator('#game-settings-btn').click();
  await page.waitForSelector('#settings-modal:not(.hidden)');
  await page.screenshot({ path: path.join(rootDir, 'screenshot_ingame_settings.png') });
  await page.locator('#settings-close-btn').click();

  // 7. Adventure 96-Level Silhouette Map
  await page.locator('#game-back-btn').click();
  await page.locator('#home-map-pin-btn').click();
  await page.waitForSelector('#screen-adventure-map.active');
  await page.screenshot({ path: path.join(rootDir, 'screenshot_adventure_map_new.png') });
  await page.locator('#map-back-btn').click();

  // 7b. Adventure Level Win Trophy Presentation Modal
  await page.evaluate(() => {
    window.__game.triggerLevelWin();
  });
  await page.waitForSelector('#level-win-modal:not(.hidden)');
  await page.screenshot({ path: path.join(rootDir, 'screenshot_level_win_trophy_new.png') });
  await page.locator('#win-map-btn').click();
  await page.waitForSelector('#screen-adventure-map.active');
  await page.locator('#map-back-btn').click();
  await page.waitForSelector('#screen-home.active');

  // 8. Classic Mode Gameplay (Score Hero & High Score starting at 0)
  await page.locator('#btn-mode-classic').click();
  await page.waitForSelector('#screen-gameplay.active');
  await page.evaluate(() => {
    window.__game.addScore(340);
  });
  await page.screenshot({ path: path.join(rootDir, 'screenshot_classic_pink_new.png') });

  // 9. Game Over Screen with 5-Second Timer
  await page.evaluate(() => {
    window.__game.triggerGameOver();
  });
  await page.waitForSelector('#screen-game-over.active', { timeout: 3000 });
  await page.screenshot({ path: path.join(rootDir, 'screenshot_game_over_new.png') });
});
