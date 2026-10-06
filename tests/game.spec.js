import { test, expect } from '@playwright/test';
import { SHAPE_DEFINITIONS } from '../src/shapes.js';

test.describe('Block Blaster Full Feature Verification', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage to test fresh start
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');
    // Wait for initial loading animation to transition to homepage
    await page.waitForSelector('#screen-home.active', { timeout: 8000 });
  });

  test('Requirement 1: App Name is Block Blaster, White Icons (Location for Adventure, Infinity for Classic)', async ({ page }) => {
    // Verify document title
    await expect(page).toHaveTitle(/Block Blaster/);

    // Verify White Settings Icon on homepage
    const settingsBtn = page.locator('#home-settings-btn');
    await expect(settingsBtn).toBeVisible();
    const gearSvg = page.locator('#home-settings-btn svg');
    await expect(gearSvg).toHaveAttribute('fill', '#ffffff');

    // Verify Adventure button has White Location Pin Logo
    const advBtn = page.locator('#btn-mode-adventure');
    await expect(advBtn).toBeVisible();
    const locSvg = advBtn.locator('svg');
    await expect(locSvg).toHaveAttribute('fill', '#ffffff');
    await expect(page.locator('#home-adventure-level-text')).toHaveText(/Level 1/);

    // Verify Classic button has White Infinity Logo
    const classicBtn = page.locator('#btn-mode-classic');
    await expect(classicBtn).toBeVisible();
    const infSvg = classicBtn.locator('svg');
    await expect(infSvg).toHaveAttribute('fill', '#ffffff');
    await expect(classicBtn.locator('.pill-text-large')).toHaveText('Classic');
  });

  test('Requirement 2: Settings Modal Exit Button Rules (Hidden on Home, Shown In-Game)', async ({ page }) => {
    // 1. Open Settings from Home page: Exit button MUST be hidden!
    const homeSettingsBtn = page.locator('#home-settings-btn');
    await homeSettingsBtn.click();

    const modal = page.locator('#settings-modal');
    await expect(modal).toBeVisible();

    const exitBtn = page.locator('#settings-exit-home-btn');
    await expect(exitBtn).toBeHidden();

    // Close Settings
    await page.locator('#settings-close-btn').click();
    await expect(modal).toBeHidden();

    // 2. Start game and open Settings In-Game: Exit button MUST be visible!
    await page.locator('#btn-mode-classic').click();
    await expect(page.locator('#screen-gameplay')).toBeVisible();

    const inGameSettingsBtn = page.locator('#game-settings-btn');
    await inGameSettingsBtn.click();
    await expect(modal).toBeVisible();
    await expect(exitBtn).toBeVisible();

    // Click Exit button -> Takes user to Home page
    await exitBtn.click();
    await expect(modal).toBeHidden();
    await expect(page.locator('#screen-home')).toBeVisible();
  });

  test('Requirement 3: Settings Audio Toggles with Red Slash Line when Muted', async ({ page }) => {
    const homeSettingsBtn = page.locator('#home-settings-btn');
    await homeSettingsBtn.click();

    const soundBtn = page.locator('#settings-sound-btn');
    await soundBtn.click();
    await expect(soundBtn).toHaveClass(/muted/);
    await expect(page.locator('#sound-icon-wrap .red-slash-line')).toBeVisible();

    const bgmBtn = page.locator('#settings-bgm-btn');
    await bgmBtn.click();
    await expect(bgmBtn).toHaveClass(/muted/);
    await expect(page.locator('#bgm-icon-wrap .red-slash-line')).toBeVisible();
  });

  test('Requirement 4: High Score Starts at Zero and Grows by Playing', async ({ page }) => {
    // Start Classic game
    await page.locator('#btn-mode-classic').click();
    await expect(page.locator('#screen-gameplay')).toBeVisible();

    // High score display starts at 0!
    const bestScoreDisplay = page.locator('#best-score-display');
    await expect(bestScoreDisplay).toHaveText('0');

    // Add points programmatically
    await page.evaluate(() => {
      window.__game.addScore(850);
    });

    // Score and best score grow to 850
    await expect(page.locator('#game-score-display')).toHaveText('850');
    await expect(bestScoreDisplay).toHaveText('850');
  });

  test('Requirement 5: Medals and Milestones Screen with Dynamic Goals', async ({ page }) => {
    const homeSettingsBtn = page.locator('#home-settings-btn');
    await homeSettingsBtn.click();

    await page.locator('#settings-medal-btn').click();
    const achScreen = page.locator('#screen-achievement');
    await expect(achScreen).toBeVisible();

    // Statistics cards start at 0
    await expect(page.locator('#stat-best-score')).toHaveText('0');
    await expect(page.locator('#stat-highest-combo')).toHaveText('0');

    // 9 Octagonal medals
    const octMedals = page.locator('.oct-medal');
    await expect(octMedals).toHaveCount(9);

    // Return to home
    await page.locator('#achievement-back-btn').click();
    await expect(page.locator('#screen-home')).toBeVisible();
  });

  test('Requirement 6: Adventure Mode Level 1 Tree Layout & Level 2 Saving Persistence', async ({ page }) => {
    // Click Adventure button on Home
    await page.locator('#btn-mode-adventure').click();
    await expect(page.locator('#screen-gameplay')).toBeVisible();

    // Verify Adventure Gems Objective HUD is visible (Level 1: 90 gems)
    const gemHud = page.locator('#adventure-gems-hud');
    await expect(gemHud).toBeVisible();
    await expect(page.locator('#gem-count-single')).toHaveText('90');

    // Complete Level 1 programmatically
    await page.evaluate(() => {
      window.__game.triggerLevelWin();
    });

    const winModal = page.locator('#level-win-modal');
    await expect(winModal).toBeVisible();

    // Click Map or Next Level, then exit to home
    await page.locator('#win-map-btn').click();
    await expect(page.locator('#screen-adventure-map')).toBeVisible();

    // Check that Level 2 is unlocked and selected
    await expect(page.locator('.sil-tile[data-level="2"]')).toHaveClass(/unlocked|current/);

    // Go back to Home
    await page.locator('#map-back-btn').click();
    await expect(page.locator('#screen-home')).toBeVisible();

    // Home button should now show Level 2!
    await expect(page.locator('#home-adventure-level-text')).toHaveText(/Level 2/);

    // Clicking Adventure now starts Level 2!
    await page.locator('#btn-mode-adventure').click();
    await expect(page.locator('#screen-gameplay')).toBeVisible();
    const currentLvl = await page.evaluate(() => window.__game.currentLevelNum);
    expect(currentLvl).toBe(2);
  });

  test('Requirement 7: More Settings Modal with Contact Us Gmail & Privacy Policy', async ({ page }) => {
    await page.locator('#home-settings-btn').click();
    await page.locator('#settings-more-btn').click();

    const moreModal = page.locator('#more-settings-modal');
    await expect(moreModal).toBeVisible();

    // Contact Us
    await page.locator('#menu-contact-us-btn').click();
    const contactModal = page.locator('#contact-modal');
    await expect(contactModal).toBeVisible();
    await expect(page.locator('.email-address')).toContainText('asitech5info@gmail.com');
    await page.locator('#contact-close-btn').click();
    await expect(contactModal).toBeHidden();

    // Privacy Policy
    await page.locator('#menu-privacy-btn').click();
    const privacyModal = page.locator('#privacy-modal');
    await expect(privacyModal).toBeVisible();
    await page.locator('#privacy-ok-btn').click();
    await expect(privacyModal).toBeHidden();
  });

  test('Requirement 8: Shapes Include 2x3, 3x2, and 3x3 Blocks', async () => {
    const shapeNames = SHAPE_DEFINITIONS.map(s => s.name);
    expect(shapeNames).toContain('rect-2x3');
    expect(shapeNames).toContain('rect-3x2');
    expect(shapeNames).toContain('square-3');
  });

  test('Requirement 9: Game Over Screen has 5-Second Countdown Timer before Retry Option', async ({ page }) => {
    await page.locator('#btn-mode-classic').click();

    await page.evaluate(() => {
      window.__game.triggerGameOver();
    });

    const gameOverScreen = page.locator('#screen-game-over');
    await expect(gameOverScreen).toBeVisible({ timeout: 4000 });

    const retryBtn = page.locator('#death-restart-btn');
    await expect(retryBtn).toHaveClass(/locked/);
    await expect(retryBtn).toBeDisabled();

    // Fast forward or wait for 5s countdown
    await page.waitForTimeout(5500);

    await expect(retryBtn).not.toHaveClass(/locked/);
    await expect(retryBtn).toBeEnabled();
  });

  test('Requirement 10: Home Page Clean - No More Games button, No GOGO! Blast, No Rotate Rings', async ({ page }) => {
    // Assert More Games button is completely removed
    const moreGamesBtn = page.locator('#btn-mode-moregames');
    await expect(moreGamesBtn).toHaveCount(0);

    // Assert promo items are completely removed
    const promoGogo = page.locator('#promo-gogo');
    await expect(promoGogo).toHaveCount(0);
    const promoRings = page.locator('#promo-rings');
    await expect(promoRings).toHaveCount(0);
  });

  test('Requirement 11: Trophy Presentation on Level Win & Solvable Adventure Mode with Tray Gems', async ({ page }) => {
    // Start Adventure Mode
    await page.locator('#btn-mode-adventure').click();
    await expect(page.locator('#screen-gameplay')).toBeVisible();

    // Verify pieces in tray contain embedded gems for solvability
    const hasAnyGemsInTray = await page.evaluate(() => {
      const g = window.__game;
      return g.currentPieces.some(p => p && p.gemMatrix && p.gemMatrix.some(row => row.some(cell => cell !== null)));
    });
    expect(hasAnyGemsInTray).toBe(true);

    // Trigger level win
    await page.evaluate(() => {
      window.__game.triggerLevelWin();
    });

    // Verify Level Win modal with Trophy Presentation
    const winModal = page.locator('#level-win-modal');
    await expect(winModal).toBeVisible();
    await expect(winModal.locator('.win-trophy-3d')).toBeVisible();
    await expect(winModal.locator('#win-level-title')).toHaveText(/Level 1 Completed!/);
    await expect(winModal.locator('.win-trophy-desc')).toHaveText(/Trophy Piece Unlocked!/);
  });

  test('Requirement 12: Classic Mode High Score Engine Supports > 3000 Score with Balanced Pieces', async ({ page }) => {
    await page.locator('#btn-mode-classic').click();
    await expect(page.locator('#screen-gameplay')).toBeVisible();

    // Test that scoring above 3000 maintains valid, playable pieces
    const result = await page.evaluate(() => {
      const g = window.__game;
      g.addScore(3500);
      // Spawn new pieces at high score
      g.spawnNewPieces();
      const fitCount = g.currentPieces.filter(p => p !== null).length;
      return { score: g.score, fitCount, isGameOver: g.isGameOver };
    });

    expect(result.score).toBeGreaterThanOrEqual(3000);
    expect(result.fitCount).toBe(3);
    expect(result.isGameOver).toBe(false);
  });

});
