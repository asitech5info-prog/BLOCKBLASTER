import { test, expect } from '@playwright/test';
import { SHAPE_DEFINITIONS } from '../src/shapes.js';

test.describe('Block Blaster Full Feature Verification', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial loading animation to transition to homepage
    await page.waitForSelector('#screen-home.active', { timeout: 8000 });
  });

  test('Requirement 1: App Name is Block Blaster and Homepage Clean Topbar', async ({ page }) => {
    // Verify document title
    await expect(page).toHaveTitle(/Block Blaster/);

    // Verify no about button on home topbar
    const homeAbout = page.locator('#home-about-btn');
    await expect(homeAbout).toHaveCount(0);

    // Verify White Settings Icon on homepage
    const settingsBtn = page.locator('#home-settings-btn');
    await expect(settingsBtn).toBeVisible();
    const gearSvg = page.locator('#home-settings-btn svg');
    await expect(gearSvg).toHaveAttribute('fill', '#ffffff');

    // Verify Adventure & Classic Mode Buttons
    await expect(page.locator('#btn-mode-adventure')).toBeVisible();
    await expect(page.locator('#btn-mode-classic')).toBeVisible();
  });

  test('Requirement 2: Settings Modal with White Audio Icons and Red Line when Muted', async ({ page }) => {
    const settingsBtn = page.locator('#home-settings-btn');
    await settingsBtn.click();

    const modal = page.locator('#settings-modal');
    await expect(modal).toBeVisible();

    // Sound button has white icon
    const soundSvg = page.locator('#settings-sound-btn svg');
    await expect(soundSvg).toHaveAttribute('fill', '#ffffff');

    // BGM button has white icon
    const bgmSvg = page.locator('#settings-bgm-btn svg');
    await expect(bgmSvg).toHaveAttribute('fill', '#ffffff');

    // Pressing Sound: Red line appears
    const soundBtn = page.locator('#settings-sound-btn');
    await soundBtn.click();
    await expect(soundBtn).toHaveClass(/muted/);
    const soundRedLine = page.locator('#sound-icon-wrap .red-slash-line');
    await expect(soundRedLine).toBeVisible();

    // Pressing BGM: Red line appears
    const bgmBtn = page.locator('#settings-bgm-btn');
    await bgmBtn.click();
    await expect(bgmBtn).toHaveClass(/muted/);
    const bgmRedLine = page.locator('#bgm-icon-wrap .red-slash-line');
    await expect(bgmRedLine).toBeVisible();

    // Green Action Buttons: Medal and More Settings
    await expect(page.locator('#settings-medal-btn')).toBeVisible();
    await expect(page.locator('#settings-more-btn')).toBeVisible();
  });

  test('Requirement 3: Medal / Achievement Screen with Statistics & Octagonal Medals', async ({ page }) => {
    const settingsBtn = page.locator('#home-settings-btn');
    await settingsBtn.click();

    // Click Medal button
    const medalBtn = page.locator('#settings-medal-btn');
    await medalBtn.click();

    const achScreen = page.locator('#screen-achievement');
    await expect(achScreen).toBeVisible();

    // Check Statistics 4 Cards
    await expect(page.locator('#stat-highest-combo')).toBeVisible();
    await expect(page.locator('#stat-best-score')).toBeVisible();
    await expect(page.locator('#stat-rounds')).toBeVisible();
    await expect(page.locator('#stat-login-days')).toBeVisible();

    // Check Octagonal Medals
    const octMedals = page.locator('.oct-medal');
    await expect(octMedals).toHaveCount(9);

    // Verify Gold medals with ribbons and Red notification dots
    const goldRibbons = page.locator('.gold-ribbon-tails');
    await expect(goldRibbons.first()).toBeVisible();

    const redDots = page.locator('.medal-red-dot');
    await expect(redDots.first()).toBeVisible();

    // Back to home
    const backBtn = page.locator('#achievement-back-btn');
    await backBtn.click();
    await expect(page.locator('#screen-home')).toBeVisible();
  });

  test('Requirement 4: More Settings Modal with Contact Us Gmail, Friends Share, Privacy Policy', async ({ page }) => {
    const settingsBtn = page.locator('#home-settings-btn');
    await settingsBtn.click();

    // Click More Settings button
    const moreBtn = page.locator('#settings-more-btn');
    await moreBtn.click();

    const moreModal = page.locator('#more-settings-modal');
    await expect(moreModal).toBeVisible();
    await expect(page.locator('.app-profile-name')).toHaveText('Block Blaster');

    // 1. Contact Us
    const contactNav = page.locator('#menu-contact-us-btn');
    await contactNav.click();
    const contactModal = page.locator('#contact-modal');
    await expect(contactModal).toBeVisible();
    await expect(page.locator('.email-address')).toContainText('asitech5info@gmail.com');

    // Test Copy Email
    const copyEmailBtn = page.locator('#copy-email-btn');
    await copyEmailBtn.click();

    // Close Contact Modal
    await page.locator('#contact-close-btn').click();
    await expect(contactModal).toBeHidden();

    // 2. Privacy Policy
    const privacyNav = page.locator('#menu-privacy-btn');
    await privacyNav.click();
    const privacyModal = page.locator('#privacy-modal');
    await expect(privacyModal).toBeVisible();
    await page.locator('#privacy-ok-btn').click();
    await expect(privacyModal).toBeHidden();

    // 3. Terms of Service
    const termsNav = page.locator('#menu-terms-btn');
    await termsNav.click();
    const termsModal = page.locator('#terms-modal');
    await expect(termsModal).toBeVisible();
    await page.locator('#terms-ok-btn').click();
    await expect(termsModal).toBeHidden();

    // 4. About Us (Lives in More Settings)
    const aboutNav = page.locator('#menu-about-btn');
    await aboutNav.click();
    const aboutModal = page.locator('#about-modal');
    await expect(aboutModal).toBeVisible();
    await page.locator('#about-gotit-btn').click();
    await expect(aboutModal).toBeHidden();
  });

  test('Requirement 5: Shapes include 2x3, 3x2, and 3x3 Blocks', async () => {
    const shapeNames = SHAPE_DEFINITIONS.map(s => s.name);
    expect(shapeNames).toContain('rect-2x3');
    expect(shapeNames).toContain('rect-3x2');
    expect(shapeNames).toContain('square-3');

    // Verify matrix dimensions
    const rect2x3 = SHAPE_DEFINITIONS.find(s => s.name === 'rect-2x3');
    expect(rect2x3.matrix.length).toBe(3);
    expect(rect2x3.matrix[0].length).toBe(2);

    const rect3x2 = SHAPE_DEFINITIONS.find(s => s.name === 'rect-3x2');
    expect(rect3x2.matrix.length).toBe(2);
    expect(rect3x2.matrix[0].length).toBe(3);

    const square3 = SHAPE_DEFINITIONS.find(s => s.name === 'square-3');
    expect(square3.matrix.length).toBe(3);
    expect(square3.matrix[0].length).toBe(3);
  });

  test('Requirement 6: Adventure 96-Level Silhouette Map and Score Target HUD', async ({ page }) => {
    const btnAdv = page.locator('#btn-mode-adventure');
    await btnAdv.click();

    const mapScreen = page.locator('#screen-adventure-map');
    await expect(mapScreen).toBeVisible();

    // Check 96 level tiles
    const tiles = page.locator('.sil-tile');
    await expect(tiles).toHaveCount(96);

    // Check current level tile has crown
    const currentTile = page.locator('.sil-tile.current');
    await expect(currentTile).toBeVisible();

    // Start Level 1 (Score Target level)
    const playBtn = page.locator('#map-play-level-btn');
    await expect(playBtn).toBeVisible();
    await playBtn.click();

    const gameScreen = page.locator('#screen-gameplay');
    await expect(gameScreen).toBeVisible();

    // Check Score Target HUD with left circle (current) and right circle (target e.g. 300)
    const scoreHud = page.locator('#adventure-score-target-hud');
    await expect(scoreHud).toBeVisible();
    const currentScore = page.locator('#adventure-current-score');
    await expect(currentScore).toHaveText('0');
    const targetScore = page.locator('#adventure-target-score');
    await expect(targetScore).toHaveText('300');
  });

  test('Requirement 7: Gameplay Score Presenter & Dynamic Theme Change on Board Clear', async ({ page }) => {
    const btnClassic = page.locator('#btn-mode-classic');
    await btnClassic.click();

    const gameScreen = page.locator('#screen-gameplay');
    await expect(gameScreen).toBeVisible();

    // Check Score Presenter with Crown Best Score at top left
    await expect(page.locator('#classic-best-hud')).toBeVisible();
    await expect(page.locator('#best-score-display')).toContainText('423506');

    // Score hero number & motif backdrop
    await expect(page.locator('#game-score-display')).toBeVisible();
    await expect(page.locator('#score-motif')).toBeVisible();

    // Trigger full board clean programmatically
    await page.evaluate(() => {
      const g = window.__game;
      // Clear entire board except 1 line, then blast that line
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          g.board[r][c] = null;
        }
      }
      for (let c = 0; c < 8; c++) {
        g.board[0][c] = 'color-cyan';
      }
      g.renderBoard();
      g.checkAndClearLines();
    });

    await page.waitForTimeout(600);

    // Banner should announce Theme Changed
    const allClearBanner = page.locator('#all-clear-banner');
    await expect(allClearBanner).toBeVisible();

    // Theme should cycle to theme-pink
    const body = page.locator('body');
    await expect(body).toHaveClass(/theme-pink/);
  });

  test('Requirement 8: Game State Persistence (Resumes exactly where left off)', async ({ page }) => {
    const btnClassic = page.locator('#btn-mode-classic');
    await btnClassic.click();

    // Place a block or set specific score & board state
    await page.evaluate(() => {
      const g = window.__game;
      g.score = 1250;
      g.board[3][3] = 'color-gold';
      g.board[3][4] = 'color-gold';
      g.renderBoard();
      g.saveGameState();
    });

    // Navigate to Home screen
    const backBtn = page.locator('#game-back-btn');
    await backBtn.click();
    await expect(page.locator('#screen-home')).toBeVisible();

    // Re-enter Classic mode
    await page.locator('#btn-mode-classic').click();
    await expect(page.locator('#screen-gameplay')).toBeVisible();

    // Verify score was restored!
    await expect(page.locator('#game-score-display')).toHaveText('1250');

    // Verify cell was restored!
    const cell33 = page.locator('.cell[data-row="3"][data-col="3"]');
    await expect(cell33).toHaveClass(/filled/);
  });

  test('Requirement 9: Game Over Screen has 5-Second Countdown Timer before Retry Option', async ({ page }) => {
    const btnClassic = page.locator('#btn-mode-classic');
    await btnClassic.click();

    // Trigger Game Over
    await page.evaluate(() => {
      const g = window.__game;
      g.score = 25000;
      g.triggerGameOver();
    });

    const gameOverScreen = page.locator('#screen-game-over');
    await expect(gameOverScreen).toBeVisible({ timeout: 4000 });

    // Verify 5-second countdown timer box is visible
    const timerBox = page.locator('#death-countdown-box');
    await expect(timerBox).toBeVisible();

    // Verify retry button is locked and disabled during timer
    const retryBtn = page.locator('#death-restart-btn');
    await expect(retryBtn).toHaveClass(/locked/);
    await expect(retryBtn).toBeDisabled();

    // Fast forward or wait for timer to finish (5 seconds)
    await page.waitForTimeout(5500);

    // Retry button should now be unlocked and enabled!
    await expect(retryBtn).not.toHaveClass(/locked/);
    await expect(retryBtn).toBeEnabled();

    // Clicking retry resets and starts gameplay
    await retryBtn.click();
    await expect(page.locator('#screen-gameplay')).toBeVisible();
  });

});
