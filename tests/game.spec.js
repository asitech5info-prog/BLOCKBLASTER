import { test, expect } from '@playwright/test';

test.describe('Block Blaster Full Feature Verification', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial loading animation to transition to homepage
    await page.waitForSelector('#screen-home.active', { timeout: 8000 });
  });

  test('Feature 1: Loading Screen Transitions to Homepage (Image 1)', async ({ page }) => {
    // Check 3D Block Blast Logo elements
    const logoBlock = page.locator('.home-hero .block-word');
    await expect(logoBlock).toBeVisible();
    await expect(logoBlock).toContainText('B');
    await expect(logoBlock).toContainText('K');

    const blastWord = page.locator('.home-hero .blast-word');
    await expect(blastWord).toBeVisible();
    await expect(blastWord).toHaveText('BLAST');

    // Check Crown icon on O
    const crown = page.locator('.home-hero .crown-icon');
    await expect(crown).toBeVisible();

    // Check Adventure and Classic buttons
    const btnAdv = page.locator('#btn-mode-adventure');
    const btnClassic = page.locator('#btn-mode-classic');
    await expect(btnAdv).toBeVisible();
    await expect(btnClassic).toBeVisible();
  });

  test('Feature 2: Settings Modal with Sound and Trophies (Image 2)', async ({ page }) => {
    const settingsBtn = page.locator('#home-settings-btn');
    await settingsBtn.click();

    const modal = page.locator('#settings-modal');
    await expect(modal).toBeVisible();

    // Verify sound button toggles
    const soundToggle = page.locator('#settings-sound-btn');
    await soundToggle.click();
    await expect(soundToggle).toHaveClass(/muted/);

    // Close settings modal
    const closeBtn = page.locator('#settings-close-btn');
    await closeBtn.click();
    await expect(modal).toBeHidden();
  });

  test('Feature 3: Adventure Map with 500 Levels & 5 Trophies (Image 5)', async ({ page }) => {
    const btnAdv = page.locator('#btn-mode-adventure');
    await btnAdv.click();

    const mapScreen = page.locator('#screen-adventure-map');
    await expect(mapScreen).toBeVisible();

    // Verify 5 Trophy Tabs (100 levels each)
    const trophyTabs = page.locator('.trophy-tab');
    await expect(trophyTabs).toHaveCount(5);

    // Verify 100 level cells in the trophy grid
    const levelCells = page.locator('.level-cell');
    await expect(levelCells).toHaveCount(100);

    // Click Level 1 Play button
    const playBtn = page.locator('#map-play-level-btn');
    await expect(playBtn).toBeVisible();
    await playBtn.click();

    // Gameplay screen with Adventure Objective HUD should be visible
    const gameScreen = page.locator('#screen-gameplay');
    await expect(gameScreen).toBeVisible();
    const objectiveHud = page.locator('#adventure-objective-hud');
    await expect(objectiveHud).toBeVisible();
  });

  test('Feature 4: Classic Mode Gameplay, Block Placement and Score (Image 3)', async ({ page }) => {
    const btnClassic = page.locator('#btn-mode-classic');
    await btnClassic.click();

    const gameScreen = page.locator('#screen-gameplay');
    await expect(gameScreen).toBeVisible();

    // Verify 64 grid cells
    const cells = page.locator('#game-board .cell');
    await expect(cells).toHaveCount(64);

    // Select slot 0 and place on board
    const slot0 = page.locator('.tray-slot[data-slot="0"]');
    await slot0.click();
    await expect(slot0).toHaveClass(/selected/);

    const cell00 = page.locator('.cell[data-row="0"][data-col="0"]');
    await cell00.click();

    // Score should increase
    const scoreVal = page.locator('#game-score-display');
    await expect(async () => {
      const text = await scoreVal.textContent();
      expect(parseInt(text || '0', 10)).toBeGreaterThan(0);
    }).toPass();
  });

  test('Feature 5: Full Board Clean / All Clear Changes Theme Dynamically', async ({ page }) => {
    const btnClassic = page.locator('#btn-mode-classic');
    await btnClassic.click();

    // Trigger an All Clear programmatically
    await page.evaluate(() => {
      const g = window.__game;
      // Put a single row 0 full
      for (let c = 0; c < 8; c++) {
        g.board[0][c] = 'color-cyan';
      }
      g.renderBoard();
      // Clear line, leaving board completely empty -> triggers handlePerfectClear()
      g.checkAndClearLines();
    });

    // Wait for clear animation
    await page.waitForTimeout(500);

    // Announcement banner should appear
    const allClearBanner = page.locator('#all-clear-banner');
    await expect(allClearBanner).toBeVisible();

    // Body class should have changed from theme-blue to theme-teal
    const body = page.locator('body');
    await expect(body).toHaveClass(/theme-teal/);
  });

  test('Feature 6: Game Over Screen Displays Death Score and High Score (Image 4)', async ({ page }) => {
    const btnClassic = page.locator('#btn-mode-classic');
    await btnClassic.click();

    // Trigger Game Over
    await page.evaluate(() => {
      const g = window.__game;
      g.score = 56911;
      g.bestScore = 423506;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          g.board[r][c] = 'color-red';
        }
      }
      g.currentPieces = [
        { id: 'p1', name: 'square-3', color: 'color-red', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] }
      ];
      g.triggerGameOver();
    });

    // Game Over screen (Image 4) should be visible
    const gameOverScreen = page.locator('#screen-game-over');
    await expect(gameOverScreen).toBeVisible({ timeout: 4000 });

    const scoreNum = page.locator('#death-final-score');
    await expect(scoreNum).toHaveText('56911');

    const bestNum = page.locator('#death-best-score');
    await expect(bestNum).toHaveText('423506');

    // Click Green Play button to restart
    const playBtn = page.locator('#death-restart-btn');
    await playBtn.click();

    const gameplay = page.locator('#screen-gameplay');
    await expect(gameplay).toBeVisible();
  });

});
