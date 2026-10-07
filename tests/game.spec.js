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

  test('Requirement 8b: Includes all reference folder blocks (vertical Z and 4-block L shapes)', async () => {
    const shapeMap = new Map(SHAPE_DEFINITIONS.map(s => [s.name, s.matrix]));

    // Image 1: [ [1, 1, 1], [1, 0, 0] ]
    expect(shapeMap.has('l-shape-4-h-tl')).toBe(true);
    expect(shapeMap.get('l-shape-4-h-tl')).toEqual([[1, 1, 1], [1, 0, 0]]);

    // Image 2: [ [1, 0], [1, 1], [0, 1] ]
    expect(shapeMap.has('z-shape-v')).toBe(true);
    expect(shapeMap.get('z-shape-v')).toEqual([[1, 0], [1, 1], [0, 1]]);

    // Image 3: [ [1, 0, 0], [1, 1, 1] ]
    expect(shapeMap.has('l-shape-4-h-bl')).toBe(true);
    expect(shapeMap.get('l-shape-4-h-bl')).toEqual([[1, 0, 0], [1, 1, 1]]);

    // Image 4: [ [1, 0], [1, 0], [1, 1] ]
    expect(shapeMap.has('l-shape-4-v-bl')).toBe(true);
    expect(shapeMap.get('l-shape-4-v-bl')).toEqual([[1, 0], [1, 0], [1, 1]]);

    // Image 5: [ [1, 1], [1, 0], [1, 0] ]
    expect(shapeMap.has('l-shape-4-v-tl')).toBe(true);
    expect(shapeMap.get('l-shape-4-v-tl')).toEqual([[1, 1], [1, 0], [1, 0]]);
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

  test('Requirement 13: Homepage Title is BLOCK BLASTER, Adventure Progress starts at 0% and increases dynamically', async ({ page }) => {
    // 1. Verify Homepage Title has BLASTER (not BLAST)
    const blastWord = page.locator('.home-hero .blast-word');
    await expect(blastWord).toHaveText('BLASTER');

    // 2. Verify Favicon links in document head
    const svgFavicon = page.locator('link[rel="icon"][type="image/svg+xml"]');
    await expect(svgFavicon).toHaveAttribute('href', '/favicon.svg');
    const pngFavicon32 = page.locator('link[rel="icon"][sizes="32x32"]');
    await expect(pngFavicon32).toHaveAttribute('href', '/favicon-32x32.png');

    // 3. Verify Adventure percentage starts at 0% before any levels solved
    const pctText = page.locator('#home-adventure-pct-text');
    await expect(pctText).toHaveText('0%');
    const progressFill = page.locator('#home-adventure-progress-fill');
    await expect(progressFill).toHaveCSS('width', '0px');

    // 4. Complete 1 level programmatically and verify progress increases dynamically
    await page.evaluate(() => {
      // Simulate completing level 1
      window.__game.triggerLevelWin();
    });

    // Go to Map then Back to Home
    await page.locator('#win-map-btn').click();
    await expect(page.locator('#screen-adventure-map')).toBeVisible();
    await page.locator('#map-back-btn').click();
    await expect(page.locator('#screen-home')).toBeVisible();

    // Verify Level text is Level 2 and progress is > 0% (1% for level 1 completed)
    await expect(page.locator('#home-adventure-level-text')).toHaveText('Level 2');
    await expect(pctText).toHaveText('1%');

    // Simulate completing 4 levels
    await page.evaluate(() => {
      // Complete level 2, 3, 4
      const adv = window.__adventure;
      adv.completeLevel(2);
      adv.completeLevel(3);
      adv.completeLevel(4);
      window.__game.updateHomeUI();
    });

    // Now Level 5 unlocked (4 levels solved: 4/96 -> 4%)
    await expect(page.locator('#home-adventure-level-text')).toHaveText('Level 5');
    await expect(pctText).toHaveText('4%');
  });

  test('Requirement 14: Skin Shop & BB Coin Economy (Earn, Buy, Equip Skins)', async ({ page }) => {
    // 1. Verify Home screen displays BB Coin counter
    const coinsPill = page.locator('#home-coins-pill');
    await expect(coinsPill).toBeVisible();
    await expect(page.locator('.bb-coin-amount').first()).toBeVisible();

    // 2. Open Skin Shop
    await page.locator('#btn-skin-shop').click();
    const shopModal = page.locator('#skin-shop-modal');
    await expect(shopModal).toBeVisible();

    // 3. Verify skins grid rendered with skins (Classic, Biscuit, Cheese, Candy, etc.)
    const skinCards = page.locator('.skin-card');
    await expect(skinCards).toHaveCount(8);

    // 4. Buy and equip the Crispy Biscuit skin (150 coins)
    await page.evaluate(() => {
      window.__wallet.addCoins(200); // Ensure ample balance
      window.__skinManager.buySkin('biscuit');
    });

    // Verify Biscuit skin applied to document body
    const bodyClass = await page.evaluate(() => document.body.className);
    expect(bodyClass).toContain('skin-biscuit');

    // 5. Close Skin Shop
    await page.locator('#skin-shop-close-btn').click();
    await expect(shopModal).toBeHidden();
  });

  test('Requirement 15: Adventure Levels Scaled to 1000 & Earns BB Coins', async ({ page }) => {
    // 1. Verify AdventureManager maxLevel is 1000
    const maxLevel = await page.evaluate(() => window.__adventure.maxLevel);
    expect(maxLevel).toBe(1000);

    // 2. Verify level data generation for high levels up to 1000
    const lvl1000 = await page.evaluate(() => window.__adventure.getLevelData(1000));
    expect(lvl1000.level).toBe(1000);
    expect(lvl1000.totalTarget).toBeGreaterThan(0);
    expect(lvl1000.initialBoard).toHaveLength(8);

    // 3. Verify completing an Adventure level awards BB Coins
    const initialCoins = await page.evaluate(() => window.__wallet.getBalance());
    await page.evaluate(() => {
      window.__adventure.completeLevel(5, 500);
    });
    const updatedCoins = await page.evaluate(() => window.__wallet.getBalance());
    expect(updatedCoins).toBeGreaterThan(initialCoins);
  });

  test('Requirement 16: Revive Option Restores Board Space on Game Over', async ({ page }) => {
    // Start classic game
    await page.locator('#btn-mode-classic').click();
    await expect(page.locator('#screen-gameplay')).toBeVisible();

    // Trigger game over programmatically
    await page.evaluate(() => {
      window.__game.triggerGameOver();
    });

    await expect(page.locator('#screen-game-over')).toBeVisible();
    const reviveBtn = page.locator('#death-revive-btn');
    await expect(reviveBtn).toBeVisible();

    // Click Revive
    await reviveBtn.click();

    // Gameplay screen is restored
    await expect(page.locator('#screen-gameplay')).toBeVisible();
    await expect(page.locator('#screen-game-over')).toBeHidden();

    // Verify center 4x4 area was cleared for fresh moves
    const centerEmpty = await page.evaluate(() => {
      const g = window.__game;
      return g.board[3][3] === null && g.board[4][4] === null;
    });
    expect(centerEmpty).toBe(true);
  });

  test('Requirement 17: Tactile Haptic Vibration and Controls Settings', async ({ page }) => {
    // Open Settings
    await page.locator('#home-settings-btn').click();
    await expect(page.locator('#settings-modal')).toBeVisible();

    // 1. Verify Haptics toggle button exists and functions
    const hapticBtn = page.locator('#settings-haptics-btn');
    await expect(hapticBtn).toBeVisible();

    // Toggle haptics
    await hapticBtn.click();
    const isMuted = await hapticBtn.evaluate(el => el.classList.contains('muted'));
    expect(isMuted).toBe(true);

    // 2. Verify Intensity Buttons
    const strongBtn = page.locator('#btn-intensity-heavy');
    await strongBtn.click();
    const intensity = await page.evaluate(() => window.__haptics.getIntensity());
    expect(intensity).toBe('heavy');

    // 3. Verify Touch Drag Offset Setting
    const directBtn = page.locator('#btn-offset-direct');
    await directBtn.click();
    const offsetMode = await page.evaluate(() => window.__haptics.getTouchOffsetMode());
    expect(offsetMode).toBe('direct');

    await page.locator('#settings-close-btn').click();
  });

  test('Requirement 18: Daily Challenge & Mystery Chest Scaled to Complexity', async ({ page }) => {
    // Open Daily Challenge
    await page.locator('#btn-daily-challenge').click();
    const dailyModal = page.locator('#daily-challenge-modal');
    await expect(dailyModal).toBeVisible();

    // Verify 4 challenge missions exist (Easy, Medium, Hard, Extreme)
    const missionCards = page.locator('.daily-item-card');
    await expect(missionCards).toHaveCount(4);

    // Programmatically complete the easy challenge and claim bronze chest
    await page.evaluate(() => {
      const daily = window.__dailyChallenge;
      daily.recordEvent('blocksPlaced', 100);
      window.__game.renderDailyChallenge();
    });

    const claimBtn = page.locator('.btn-claim-ready').first();
    await expect(claimBtn).toBeVisible();
    await claimBtn.click();

    // Mystery chest modal appears
    const chestModal = page.locator('#chest-open-modal');
    await expect(chestModal).toBeVisible();

    // Open chest action
    const chestActionBtn = page.locator('#chest-action-btn');
    await chestActionBtn.click();
    await expect(page.locator('#chest-reward-display')).toBeVisible();

    // Collect reward
    await chestActionBtn.click();
    await expect(chestModal).toBeHidden();

    // Close daily modal
    await page.locator('#daily-challenge-close-btn').click();
  });

  test('Requirement 19: Player Profile Custom Name and 8 Boy + 6 Girl Animated PFPs', async ({ page }) => {
    // Open profile modal via topbar profile pill
    await page.locator('#home-profile-pill').click();
    const profileModal = page.locator('#profile-modal');
    await expect(profileModal).toBeVisible();

    // 1. Change Player Name
    const nameInput = page.locator('#profile-name-input');
    await nameInput.fill('Super Blaster');
    await page.locator('#profile-name-save-btn').click();

    const storedName = await page.evaluate(() => window.__profileManager.getName());
    expect(storedName).toBe('Super Blaster');

    // 2. Verify all 14 animated character PFPs rendered
    const avatarTiles = page.locator('.avatar-choice-tile');
    await expect(avatarTiles).toHaveCount(14);

    // 3. Filter by Boys: Exactly 8 Boy avatars
    await page.locator('#tab-avatar-boys').click();
    const boyTiles = page.locator('.avatar-choice-tile');
    await expect(boyTiles).toHaveCount(8);

    // 4. Filter by Girls: Exactly 6 Girl avatars
    await page.locator('#tab-avatar-girls').click();
    const girlTiles = page.locator('.avatar-choice-tile');
    await expect(girlTiles).toHaveCount(6);

    // 5. Select a girl avatar (e.g. girl_cyber)
    await girlTiles.first().click();
    const pfp = await page.evaluate(() => window.__profileManager.getPfp());
    expect(pfp).toBe('girl_cyber');

    await page.locator('#profile-close-btn').click();
    await expect(profileModal).toBeHidden();
  });

  test('Requirement 20: Career Statistics & Lifetime Records Display', async ({ page }) => {
    // Open Career Records
    await page.locator('#btn-career-stats').click();
    const careerModal = page.locator('#career-modal');
    await expect(careerModal).toBeVisible();

    // Verify career stat cards exist and display numbers
    await expect(page.locator('#c-stat-best-score')).toBeVisible();
    await expect(page.locator('#c-stat-highest-combo')).toBeVisible();
    await expect(page.locator('#c-stat-rounds')).toBeVisible();
    await expect(page.locator('#c-stat-blocks')).toBeVisible();
    await expect(page.locator('#c-stat-lines')).toBeVisible();
    await expect(page.locator('#c-stat-adventure')).toContainText('1000');
    await expect(page.locator('#c-stat-coins')).toBeVisible();

    await page.locator('#career-close-btn').click();
    await expect(careerModal).toBeHidden();
  });

});
