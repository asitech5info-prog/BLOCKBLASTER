import { test, expect } from '@playwright/test';

test.describe('Block Blaster Game E2E Feature Verification', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Feature 1: Grid and Game UI Initial State', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Block Blaster/i);

    // Verify 8x8 Grid (64 cells)
    const cells = page.locator('#game-board .cell');
    await expect(cells).toHaveCount(64);

    // Verify 3 Tray Slots exist
    const slots = page.locator('.tray-slot');
    await expect(slots).toHaveCount(3);

    // Verify shapes are spawned in all 3 slots
    for (let i = 0; i < 3; i++) {
      const shapeGrid = slots.nth(i).locator('.shape-grid');
      await expect(shapeGrid).toBeVisible();
      const filledBlocks = shapeGrid.locator('.shape-cell.filled');
      const count = await filledBlocks.count();
      expect(count).toBeGreaterThan(0);
    }

    // Verify Scoreboard starts at 0
    const scoreVal = page.locator('#current-score');
    await expect(scoreVal).toHaveText('0');
  });

  test('Feature 2: Sound Toggle button works and updates state', async ({ page }) => {
    const soundBtn = page.locator('#sound-btn');
    await expect(soundBtn).toBeVisible();
    await expect(soundBtn).toHaveText('🔊');

    await soundBtn.click();
    await expect(soundBtn).toHaveText('🔇');

    // Toggle back
    await soundBtn.click();
    await expect(soundBtn).toHaveText('🔊');
  });

  test('Feature 3: Piece Selection and Board Placement via Click', async ({ page }) => {
    const slot0 = page.locator('.tray-slot[data-slot="0"]');

    // Click slot 0 to select it
    await slot0.click();
    await expect(slot0).toHaveClass(/selected/);

    // Click cell (0, 0) on the board
    const cell00 = page.locator('.cell[data-row="0"][data-col="0"]');
    await cell00.click();

    // Verify score increases above 0
    const currentScore = page.locator('#current-score');
    await expect(async () => {
      const text = await currentScore.textContent();
      expect(parseInt(text || '0', 10)).toBeGreaterThan(0);
    }).toPass();

    // Verify slot 0 is now empty
    await expect(slot0.locator('.shape-grid')).toHaveCount(0);
  });

  test('Feature 4: Drag and Drop Placement', async ({ page }) => {
    const slot1 = page.locator('.tray-slot[data-slot="1"]');
    const slotBox = await slot1.boundingBox();
    expect(slotBox).toBeTruthy();

    const cell33 = page.locator('.cell[data-row="3"][data-col="3"]');
    const cellBox = await cell33.boundingBox();
    expect(cellBox).toBeTruthy();

    // Simulate pointer drag from tray slot to board cell
    await page.mouse.move(slotBox.x + slotBox.width / 2, slotBox.y + slotBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(cellBox.x + cellBox.width / 2, cellBox.y + cellBox.height / 2, { steps: 5 });
    await page.mouse.up();

    // Verify placement occurred: board cells should be filled
    const filledCells = page.locator('#game-board .cell.filled');
    await expect(async () => {
      const count = await filledCells.count();
      expect(count).toBeGreaterThan(0);
    }).toPass();
  });

  test('Feature 5: Row Clear and Combo Blast', async ({ page }) => {
    // Programmatically fill row 0 except col 7 to test line clear reliably
    await page.evaluate(() => {
      const g = window.__game;
      for (let c = 0; c < 7; c++) {
        g.board[0][c] = 'color-cyan';
      }
      // Fill the 7th col to trigger clear
      g.board[0][7] = 'color-cyan';
      g.renderBoard();
      g.checkAndClearLines();
    });

    // Check combo badge appears
    const comboBadge = page.locator('#combo-badge');
    await expect(comboBadge).toBeVisible();
    await expect(comboBadge).toContainText('COMBO x1');

    // Wait for clearing animation (350ms) to empty row 0
    await page.waitForTimeout(450);

    // Verify row 0 cells are cleared
    for (let c = 0; c < 8; c++) {
      const cell = page.locator(`.cell[data-row="0"][data-col="${c}"]`);
      await expect(cell).not.toHaveClass(/filled/);
    }
  });

  test('Feature 6: Game Over Modal and Restart functionality', async ({ page }) => {
    // Fill the board so no piece can fit
    await page.evaluate(() => {
      const g = window.__game;
      // Fill board in checkerboard / tight pattern with no 1x1 holes
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          g.board[r][c] = 'color-red';
        }
      }
      g.currentPieces = [
        { id: 'p1', name: 'square-3', color: 'color-red', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
        { id: 'p2', name: 'square-3', color: 'color-red', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
        { id: 'p3', name: 'square-3', color: 'color-red', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] }
      ];
      g.checkGameOver();
    });

    // Game over modal should appear
    const modal = page.locator('#game-over-modal');
    await expect(modal).toBeVisible({ timeout: 4000 });

    // Click Play Again
    const playAgainBtn = page.locator('#modal-restart-btn');
    await playAgainBtn.click();

    // Verify modal is hidden and new game reset
    await expect(modal).toBeHidden();
    const currentScore = page.locator('#current-score');
    await expect(currentScore).toHaveText('0');
  });

});
