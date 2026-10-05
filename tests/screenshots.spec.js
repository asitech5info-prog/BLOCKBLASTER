import { test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Capture All New Screenshots for Verification', async ({ page }) => {
  // 1. Home Screen
  await page.goto('/');
  await page.waitForSelector('#screen-home.active', { timeout: 10000 });
  await page.screenshot({ path: path.join(rootDir, 'screenshot_home_new.png') });

  // 2. Settings Modal with Muted Red Slash Lines
  await page.locator('#home-settings-btn').click();
  await page.waitForSelector('#settings-modal:not(.hidden)');
  await page.locator('#settings-sound-btn').click();
  await page.locator('#settings-bgm-btn').click();
  await page.screenshot({ path: path.join(rootDir, 'screenshot_settings_new.png') });

  // 3. More Settings Modal
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

  // 5. Adventure 96-Level Silhouette Map
  await page.locator('#btn-mode-adventure').click();
  await page.waitForSelector('#screen-adventure-map.active');
  await page.screenshot({ path: path.join(rootDir, 'screenshot_adventure_map_new.png') });

  // 6. Gameplay Screen with Score Target HUD (Adventure)
  await page.locator('#map-play-level-btn').click();
  await page.waitForSelector('#screen-gameplay.active');
  await page.screenshot({ path: path.join(rootDir, 'screenshot_gameplay_new.png') });

  // 7. Classic Gameplay with Crown Best Score & Pink Theme
  await page.locator('#game-back-btn').click();
  await page.locator('#map-back-btn').click();
  await page.locator('#btn-mode-classic').click();
  await page.waitForSelector('#screen-gameplay.active');
  await page.evaluate(() => {
    window.__game.applyTheme('theme-pink');
    window.__game.score = 35971;
    window.__game.bestScore = 423506;
    window.__game.board[7][0] = 'color-cyan';
    window.__game.board[7][1] = 'color-cyan';
    window.__game.board[7][2] = 'color-cyan';
    window.__game.board[6][0] = 'color-cyan';
    window.__game.renderBoard();
    window.__game.updateScoreUI();
  });
  await page.screenshot({ path: path.join(rootDir, 'screenshot_classic_pink_new.png') });

  // 8. Game Over Screen with 5-Second Timer
  await page.evaluate(() => {
    window.__game.triggerGameOver();
  });
  await page.waitForSelector('#screen-game-over.active', { timeout: 3000 });
  await page.screenshot({ path: path.join(rootDir, 'screenshot_game_over_new.png') });
});
