import { SHAPE_DEFINITIONS, canFitAt, canFitAnywhere, generateThreePieces } from './shapes.js';
import { sound } from './audio.js';
import { fireVictoryCelebration } from './particles.js';
import { adventure, ADVENTURE_SILHOUETTE_ROWS } from './adventure.js';
import { medalManager, AWARDS_DEFINITIONS } from './medals.js';

export class BlockBlasterGame {
  constructor() {
    this.boardSize = 8;
    this.board = Array.from({ length: this.boardSize }, () => Array(this.boardSize).fill(null));
    this.currentPieces = [null, null, null];
    this.score = 0;
    // High score starts at 0 and grows by playing
    this.bestScore = parseInt(localStorage.getItem('block_blaster_best') || '0', 10);
    this.combo = 0;
    this.isGameOver = false;

    // Mode: 'classic' or 'adventure'
    this.mode = 'classic';
    this.currentLevelNum = adventure.getCurrentLevel();
    this.levelObjective = null;
    this.objectiveProgress = 0;
    this.selectedLevelOnMap = adventure.getCurrentLevel();

    // Adventure Gem Counts
    this.adventureGems = {
      blue: 0,
      orange: 0,
      star: 0
    };
    this.adventureTotalGems = 0;

    // Themes (switches dynamically on full board clear)
    this.themes = ['theme-blue', 'theme-teal', 'theme-pink', 'theme-purple', 'theme-slate'];
    this.currentThemeIndex = 0;

    // 5-Second Game Over Countdown Timer
    this.countdownTimer = null;
    this.countdownSeconds = 5;

    // Drag & Drop State
    this.activeDrag = null;
    this.selectedSlotIndex = null;
    this.isRafScheduled = false;
    this.pendingAvatarPos = { x: 0, y: 0 };
    this.lastGhostCoords = null;
    this.cachedBoardRect = null;

    // Screen Elements
    this.screenLoading = document.getElementById('screen-loading');
    this.screenHome = document.getElementById('screen-home');
    this.screenAdventureMap = document.getElementById('screen-adventure-map');
    this.screenAchievement = document.getElementById('screen-achievement');
    this.screenGameplay = document.getElementById('screen-gameplay');
    this.screenGameOver = document.getElementById('screen-game-over');

    // Modals
    this.settingsModal = document.getElementById('settings-modal');
    this.moreSettingsModal = document.getElementById('more-settings-modal');
    this.contactModal = document.getElementById('contact-modal');
    this.privacyModal = document.getElementById('privacy-modal');
    this.termsModal = document.getElementById('terms-modal');
    this.aboutModal = document.getElementById('about-modal');
    this.levelWinModal = document.getElementById('level-win-modal');

    // Board & HUD Elements
    this.boardEl = document.getElementById('game-board');
    this.traySlots = document.querySelectorAll('.tray-slot');
    this.scoreHeroEl = document.getElementById('game-score-display');
    this.scoreMotifEl = document.getElementById('score-motif');
    this.classicBestHud = document.getElementById('classic-best-hud');
    this.bestScoreDisplayEl = document.getElementById('best-score-display');
    this.comboBadgeEl = document.getElementById('combo-badge');
    this.comboTextEl = document.getElementById('combo-text');
    this.dragAvatarEl = document.getElementById('drag-avatar');
    this.floaterContainerEl = document.getElementById('floater-container');
    this.allClearBannerEl = document.getElementById('all-clear-banner');

    // Adventure HUD Elements
    this.adventureGemsHud = document.getElementById('adventure-gems-hud');
    this.gemSingleWrap = document.getElementById('gem-single-wrap');
    this.gemCountSingle = document.getElementById('gem-count-single');
    this.gemMultiWrap = document.getElementById('gem-multi-wrap');
    this.gemCountBlueEl = document.getElementById('gem-count-blue');
    this.gemCountOrangeEl = document.getElementById('gem-count-orange');
    this.gemCountStarEl = document.getElementById('gem-count-star');
    this.gemBadgeBlue = document.getElementById('gem-badge-blue');
    this.gemBadgeOrange = document.getElementById('gem-badge-orange');
    this.gemBadgeStar = document.getElementById('gem-badge-star');

    // Home Elements
    this.homeAdventureLevelText = document.getElementById('home-adventure-level-text');
    this.homeAdventureProgressFill = document.getElementById('home-adventure-progress-fill');
    this.homeAdventurePctText = document.getElementById('home-adventure-pct-text');
    this.homeWinStreakNum = document.getElementById('home-win-streak-num');

    // Settings Modal Elements
    this.settingsExitHomeBtn = document.getElementById('settings-exit-home-btn');
    this.soundToggleBtn = document.getElementById('settings-sound-btn');
    this.bgmToggleBtn = document.getElementById('settings-bgm-btn');

    // Game Over Elements
    this.deathFinalScoreEl = document.getElementById('death-final-score');
    this.deathBestScoreEl = document.getElementById('death-best-score');
    this.deathNewRecordEl = document.getElementById('death-new-record');
    this.deathCountdownBox = document.getElementById('death-countdown-box');
    this.deathTimerNumEl = document.getElementById('death-timer-num');
    this.deathTimerSecTextEl = document.getElementById('death-timer-sec-text');
    this.deathRestartBtn = document.getElementById('death-restart-btn');
    this.deathHomeBtn = document.getElementById('death-home-btn');

    // Map Elements
    this.adventureSilhouetteGrid = document.getElementById('adventure-silhouette-grid');
    this.mapPlayLevelBtn = document.getElementById('map-play-level-btn');
  }

  init() {
    this.createBoardGrid();
    this.setupEventListeners();
    this.setupAdventureMap();
    this.setupMedalsScreen();
    this.updateHomeUI();
    this.applyTheme(this.themes[this.currentThemeIndex]);
    this.startLoadingSequence();

    window.addEventListener('resize', () => {
      this.updateBoardDimensions();
    });
  }

  updateBoardDimensions() {
    if (this.boardEl) {
      this.cachedBoardRect = this.boardEl.getBoundingClientRect();
      const cellSize = (this.cachedBoardRect.width - 16 - 7 * 4) / 8;
      document.documentElement.style.setProperty('--drag-cell-size', `${Math.max(28, cellSize)}px`);
    }
  }

  // --- 1. Screen Router ---
  showScreen(targetId) {
    const screens = [
      this.screenLoading,
      this.screenHome,
      this.screenAdventureMap,
      this.screenAchievement,
      this.screenGameplay,
      this.screenGameOver
    ];

    screens.forEach(s => {
      if (s) {
        if (s.id === targetId) {
          s.classList.remove('hidden');
          s.classList.add('active');
        } else {
          s.classList.add('hidden');
          s.classList.remove('active');
        }
      }
    });

    this.closeAllModals();

    if (targetId === 'screen-gameplay') {
      setTimeout(() => this.updateBoardDimensions(), 50);
    }
  }

  closeAllModals() {
    if (this.settingsModal) this.settingsModal.classList.add('hidden');
    if (this.moreSettingsModal) this.moreSettingsModal.classList.add('hidden');
    if (this.contactModal) this.contactModal.classList.add('hidden');
    if (this.privacyModal) this.privacyModal.classList.add('hidden');
    if (this.termsModal) this.termsModal.classList.add('hidden');
    if (this.aboutModal) this.aboutModal.classList.add('hidden');
    if (this.levelWinModal) this.levelWinModal.classList.add('hidden');
  }

  startLoadingSequence() {
    this.showScreen('screen-loading');
    const bar = document.getElementById('loading-bar-fill');
    let progress = 0;

    const interval = setInterval(() => {
      progress += 25;
      if (bar) bar.style.width = `${Math.min(100, progress)}%`;
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.updateHomeUI();
          this.showScreen('screen-home');
        }, 200);
      }
    }, 60);
  }

  updateHomeUI() {
    const currentLvl = adventure.getCurrentLevel();
    if (this.homeAdventureLevelText) {
      this.homeAdventureLevelText.textContent = `Level ${currentLvl}`;
    }
    if (this.homeWinStreakNum) {
      this.homeWinStreakNum.textContent = String(currentLvl);
    }

    const pct = Math.min(100, Math.round(((currentLvl - 1) / 96) * 100));
    if (this.homeAdventureProgressFill) {
      this.homeAdventureProgressFill.style.width = `${Math.max(15, pct)}%`;
    }
    if (this.homeAdventurePctText) {
      this.homeAdventurePctText.textContent = `${Math.max(15, pct)}%`;
    }
  }

  createBoardGrid() {
    this.boardEl.innerHTML = '';
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        this.boardEl.appendChild(cell);
      }
    }
  }

  // --- 2. Starting Modes & State Persistence ---
  startClassicMode() {
    this.mode = 'classic';
    this.adventureGemsHud.classList.add('hidden');
    this.classicBestHud.classList.remove('hidden');
    const heroEl = document.querySelector('.score-hero');
    if (heroEl) heroEl.classList.remove('hidden');

    const saved = this.loadSavedGameState('classic');
    if (saved && saved.inProgress && saved.board) {
      this.board = saved.board;
      this.score = saved.score || 0;
      this.combo = saved.combo || 0;
      this.currentPieces = saved.currentPieces || generateThreePieces(this.board, this.boardSize);
      if (saved.themeIndex !== undefined) {
        this.currentThemeIndex = saved.themeIndex;
        this.applyTheme(this.themes[this.currentThemeIndex]);
      }
      this.isGameOver = false;
      this.renderBoard();
      this.renderTray();
      this.updateScoreUI();
      this.updateComboUI();
    } else {
      this.startNewGame();
    }

    this.showScreen('screen-gameplay');
  }

  startAdventureLevel(levelNum) {
    this.mode = 'adventure';
    this.currentLevelNum = levelNum;
    adventure.setCurrentLevel(levelNum);
    this.levelObjective = adventure.getLevelData(levelNum);
    this.objectiveProgress = 0;

    this.classicBestHud.classList.add('hidden');
    this.adventureGemsHud.classList.remove('hidden');
    const heroEl = document.querySelector('.score-hero');
    if (heroEl) heroEl.classList.add('hidden');

    // Check for saved in-progress adventure game for this level
    const saved = this.loadSavedGameState('adventure');
    if (saved && saved.inProgress && saved.level === levelNum && saved.board) {
      this.board = saved.board;
      this.score = saved.score || 0;
      this.adventureGems = saved.adventureGems || { ...this.levelObjective.targetGems };
      this.adventureTotalGems = saved.adventureTotalGems || this.levelObjective.totalTarget;
      this.currentPieces = saved.currentPieces || generateThreePieces(this.board, this.boardSize, this.mode, this.adventureGems);
      this.isGameOver = false;
    } else {
      this.board = JSON.parse(JSON.stringify(this.levelObjective.initialBoard));
      this.score = 0;
      this.adventureGems = { ...this.levelObjective.targetGems };
      this.adventureTotalGems = this.levelObjective.totalTarget;
      this.currentPieces = generateThreePieces(this.board, this.boardSize, this.mode, this.adventureGems);
      this.isGameOver = false;
    }

    this.configureAdventureHUD();
    this.renderBoard();
    this.renderTray();
    this.updateScoreUI();
    this.updateComboUI();
    this.saveGameState();
    this.showScreen('screen-gameplay');
  }

  configureAdventureHUD() {
    const goals = this.adventureGems;
    const activeTypes = [];
    if (goals.blue > 0) activeTypes.push('blue');
    if (goals.orange > 0) activeTypes.push('orange');
    if (goals.star > 0) activeTypes.push('star');

    if (activeTypes.length <= 1) {
      // Single Gem Center View matching Reference Image 1 (Level 1: 90 gems)
      this.gemSingleWrap.classList.remove('hidden');
      this.gemMultiWrap.classList.add('hidden');
      this.gemCountSingle.textContent = String(this.adventureTotalGems);
    } else {
      // Multi-gem View matching Reference Images 2, 3, 4
      this.gemSingleWrap.classList.add('hidden');
      this.gemMultiWrap.classList.remove('hidden');

      if (this.gemBadgeBlue) {
        this.gemBadgeBlue.style.display = goals.blue > 0 ? 'flex' : 'none';
        this.gemCountBlueEl.textContent = String(Math.max(0, goals.blue));
      }
      if (this.gemBadgeOrange) {
        this.gemBadgeOrange.style.display = goals.orange > 0 ? 'flex' : 'none';
        this.gemCountOrangeEl.textContent = String(Math.max(0, goals.orange));
      }
      if (this.gemBadgeStar) {
        this.gemBadgeStar.style.display = goals.star > 0 ? 'flex' : 'none';
        this.gemCountStarEl.textContent = String(Math.max(0, goals.star));
      }
    }
  }

  startNewGame(presetBoard = null) {
    if (presetBoard) {
      this.board = JSON.parse(JSON.stringify(presetBoard));
    } else {
      this.board = Array.from({ length: this.boardSize }, () => Array(this.boardSize).fill(null));
    }

    this.score = 0;
    this.combo = 0;
    this.isGameOver = false;
    this.selectedSlotIndex = null;

    this.renderBoard();
    this.updateScoreUI();
    this.updateComboUI();
    this.spawnNewPieces();
    this.saveGameState();
  }

  saveGameState() {
    if (this.isGameOver) return;

    if (this.mode === 'classic') {
      const state = {
        inProgress: true,
        board: this.board,
        score: this.score,
        combo: this.combo,
        currentPieces: this.currentPieces,
        themeIndex: this.currentThemeIndex
      };
      localStorage.setItem('block_blaster_save_classic', JSON.stringify(state));
    } else if (this.mode === 'adventure') {
      const state = {
        inProgress: true,
        level: this.currentLevelNum,
        board: this.board,
        score: this.score,
        adventureGems: this.adventureGems,
        adventureTotalGems: this.adventureTotalGems,
        currentPieces: this.currentPieces
      };
      localStorage.setItem('block_blaster_save_adventure', JSON.stringify(state));
    }
  }

  loadSavedGameState(mode) {
    try {
      const raw = localStorage.getItem(`block_blaster_save_${mode}`);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  clearSavedGameState(mode = null) {
    const targetMode = mode || this.mode;
    localStorage.removeItem(`block_blaster_save_${targetMode}`);
  }

  // --- 3. Rendering Board & Tray ---
  renderBoard() {
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const cell = this.getCellEl(r, c);
        if (!cell) continue;

        cell.className = 'cell';
        const val = this.board[r][c];

        if (val) {
          cell.classList.add('filled');
          if (typeof val === 'string') {
            cell.classList.add(val);
          } else if (typeof val === 'object') {
            cell.classList.add(val.color || 'color-gold');
            if (val.hasDiamond) {
              cell.classList.add('has-diamond');
              if (val.diamondType) cell.classList.add(val.diamondType);
            }
          }
        }
      }
    }
  }

  getCellEl(r, c) {
    return this.boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
  }

  spawnNewPieces() {
    const pieces = generateThreePieces(this.board, this.boardSize, this.mode, this.adventureGems);
    this.currentPieces = pieces;
    this.renderTray();
    this.saveGameState();
    this.checkGameOver();
  }

  renderTray() {
    this.traySlots.forEach((slot, index) => {
      slot.innerHTML = '';
      slot.classList.remove('selected');
      const piece = this.currentPieces[index];

      if (!piece) return;

      const gridEl = document.createElement('div');
      gridEl.className = 'shape-grid';
      const rows = piece.matrix.length;
      const cols = piece.matrix[0].length;

      gridEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
      gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = document.createElement('div');
          cell.className = 'shape-cell';
          if (piece.matrix[r][c]) {
            cell.classList.add('filled', piece.color);
            if (piece.gemMatrix && piece.gemMatrix[r] && piece.gemMatrix[r][c]) {
              cell.classList.add('has-diamond', piece.gemMatrix[r][c]);
            }
          }
          gridEl.appendChild(cell);
        }
      }

      slot.appendChild(gridEl);
    });
  }

  // --- 4. Score Presenter & Objectives ---
  updateScoreUI() {
    if (this.scoreHeroEl) this.scoreHeroEl.textContent = this.score;
    if (this.bestScoreDisplayEl) this.bestScoreDisplayEl.textContent = this.bestScore;

    if (this.mode === 'adventure' && this.adventureTotalGems <= 0) {
      this.triggerLevelWin();
    }
  }

  updateGemsUI() {
    this.adventureTotalGems = Math.max(0, this.adventureGems.blue + this.adventureGems.orange + this.adventureGems.star);

    if (this.gemCountSingle) {
      this.gemCountSingle.textContent = String(this.adventureTotalGems);
    }
    if (this.gemCountBlueEl) {
      this.gemCountBlueEl.textContent = String(Math.max(0, this.adventureGems.blue));
    }
    if (this.gemCountOrangeEl) {
      this.gemCountOrangeEl.textContent = String(Math.max(0, this.adventureGems.orange));
    }
    if (this.gemCountStarEl) {
      this.gemCountStarEl.textContent = String(Math.max(0, this.adventureGems.star));
    }

    if (this.adventureTotalGems <= 0) {
      this.triggerLevelWin();
    }
  }

  updateComboUI() {
    if (this.combo >= 2) {
      this.comboBadgeEl.classList.remove('hidden');
      this.comboTextEl.textContent = `COMBO ${this.combo}`;
    } else {
      this.comboBadgeEl.classList.add('hidden');
    }
  }

  addScore(pts, floaterPos = null, isCombo = false, textOverride = null) {
    this.score += pts;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('block_blaster_best', String(this.bestScore));
      localStorage.setItem('bb_stat_best_score', String(this.bestScore));
    }
    this.updateScoreUI();
    this.saveGameState();

    if (floaterPos) {
      this.createScoreFloater(textOverride || `+${pts}`, floaterPos.x, floaterPos.y, isCombo);
    }
  }

  createScoreFloater(text, x, y, isCombo = false) {
    const floater = document.createElement('div');
    floater.className = `score-floater ${isCombo ? 'combo-floater' : ''}`;
    floater.textContent = text;

    const boardRect = this.cachedBoardRect || this.boardEl.getBoundingClientRect();
    const relX = Math.max(20, Math.min(boardRect.width - 20, x - boardRect.left));
    const relY = Math.max(20, Math.min(boardRect.height - 20, y - boardRect.top));

    floater.style.left = `${relX}px`;
    floater.style.top = `${relY}px`;

    this.floaterContainerEl.appendChild(floater);
    setTimeout(() => {
      floater.remove();
    }, 850);
  }

  // --- 5. Theme Switching on Perfect Clear ---
  applyTheme(themeName) {
    document.body.className = themeName;
  }

  switchNextTheme() {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    const nextTheme = this.themes[this.currentThemeIndex];
    this.applyTheme(nextTheme);

    if (this.allClearBannerEl) {
      this.allClearBannerEl.classList.remove('hidden');
      setTimeout(() => {
        this.allClearBannerEl.classList.add('hidden');
      }, 2500);
    }
  }

  handlePerfectClear() {
    this.addScore(1000, null, true, '🌟 ALL CLEAR! +1000');
    sound.playComboFanfare();
    medalManager.recordAllClear();
    this.switchNextTheme();
  }

  // --- 6. Piece Placement & Line Blast ---
  placePiece(piece, slotIndex, startR, startC) {
    let blockCount = 0;
    const rows = piece.matrix.length;
    const cols = piece.matrix[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (piece.matrix[r][c]) {
          if (piece.gemMatrix && piece.gemMatrix[r] && piece.gemMatrix[r][c]) {
            this.board[startR + r][startC + c] = {
              color: piece.color,
              hasDiamond: true,
              diamondType: piece.gemMatrix[r][c]
            };
          } else {
            this.board[startR + r][startC + c] = piece.color;
          }
          blockCount++;
        }
      }
    }

    sound.playDrop();
    medalManager.recordPiecePlaced();
    this.renderBoard();

    // Score placement points
    const boardRect = this.cachedBoardRect || this.boardEl.getBoundingClientRect();
    const placementPos = {
      x: boardRect.left + (startC + cols / 2) * (boardRect.width / this.boardSize),
      y: boardRect.top + (startR + rows / 2) * (boardRect.height / this.boardSize)
    };
    this.addScore(blockCount * 10, placementPos);

    // Consume piece from tray
    this.currentPieces[slotIndex] = null;
    this.traySlots[slotIndex].innerHTML = '';

    // Check row & column blast
    this.checkAndClearLines();

    // Check if tray is empty -> spawn next set
    if (this.currentPieces.every(p => p === null)) {
      this.spawnNewPieces();
    } else {
      this.saveGameState();
      this.checkGameOver();
    }
  }

  checkAndClearLines() {
    const fullRows = [];
    const fullCols = [];

    // Check rows
    for (let r = 0; r < this.boardSize; r++) {
      if (this.board[r].every(val => val !== null)) {
        fullRows.push(r);
      }
    }

    // Check columns
    for (let c = 0; c < this.boardSize; c++) {
      let isColFull = true;
      for (let r = 0; r < this.boardSize; r++) {
        if (this.board[r][c] === null) {
          isColFull = false;
          break;
        }
      }
      if (isColFull) {
        fullCols.push(c);
      }
    }

    const totalLines = fullRows.length + fullCols.length;

    if (totalLines > 0) {
      this.combo += 1;
      this.updateComboUI();
      medalManager.recordLinesCleared(totalLines);

      sound.playClear(this.combo);
      if (this.combo >= 3) {
        sound.playComboFanfare();
      }

      // Collect cells to clear & count diamond types
      const cellsToClear = new Set();
      let blueBlasted = 0;
      let orangeBlasted = 0;
      let starBlasted = 0;

      const inspectCell = (r, c) => {
        cellsToClear.add(`${r},${c}`);
        const cellVal = this.board[r][c];
        if (cellVal && typeof cellVal === 'object' && cellVal.hasDiamond) {
          if (cellVal.diamondType === 'diamond-orange') orangeBlasted++;
          else if (cellVal.diamondType === 'diamond-star') starBlasted++;
          else blueBlasted++;
        }
      };

      fullRows.forEach(r => {
        for (let c = 0; c < this.boardSize; c++) inspectCell(r, c);
      });
      fullCols.forEach(c => {
        for (let r = 0; r < this.boardSize; r++) inspectCell(r, c);
      });

      // Update Adventure gem objectives
      if (this.mode === 'adventure') {
        const totalBlasted = blueBlasted + orangeBlasted + starBlasted;
        if (this.adventureGems.blue > 0) {
          this.adventureGems.blue = Math.max(0, this.adventureGems.blue - blueBlasted);
        }
        if (this.adventureGems.orange > 0) {
          this.adventureGems.orange = Math.max(0, this.adventureGems.orange - orangeBlasted);
        }
        if (this.adventureGems.star > 0) {
          this.adventureGems.star = Math.max(0, this.adventureGems.star - starBlasted);
        }

        // Deduct blasted gems and update HUD
        if (totalBlasted > 0) {
          this.updateGemsUI();
        }
      }

      // Animate clearing cells
      cellsToClear.forEach(coord => {
        const [r, c] = coord.split(',').map(Number);
        const cell = this.getCellEl(r, c);
        if (cell) {
          cell.classList.add('clearing');
        }
      });

      const basePoints = totalLines * 100;
      const multiBonus = totalLines > 1 ? (totalLines - 1) * 150 : 0;
      const comboBonus = (this.combo - 1) * 80;
      const totalPoints = basePoints + multiBonus + comboBonus;

      const boardRect = this.cachedBoardRect || this.boardEl.getBoundingClientRect();
      const centerPos = {
        x: boardRect.left + boardRect.width / 2,
        y: boardRect.top + boardRect.height / 2
      };

      const floaterText = totalLines > 1 ? `MEGA CLEAR! +${totalPoints}` : `+${totalPoints}`;
      this.addScore(totalPoints, centerPos, this.combo > 1, floaterText);

      setTimeout(() => {
        cellsToClear.forEach(coord => {
          const [r, c] = coord.split(',').map(Number);
          this.board[r][c] = null;
        });
        this.renderBoard();

        // Check Perfect Board Clear
        const isBoardCleaned = this.board.every(row => row.every(val => val === null));
        if (isBoardCleaned) {
          this.handlePerfectClear();
        }

        this.saveGameState();
        this.checkGameOver();
      }, 320);
    } else {
      this.combo = 0;
      this.updateComboUI();
    }
  }

  // --- 7. Adventure Progression & Map ---
  setupAdventureMap() {
    if (!this.adventureSilhouetteGrid) return;
    this.adventureSilhouetteGrid.innerHTML = '';

    ADVENTURE_SILHOUETTE_ROWS.forEach(rowArr => {
      const rowEl = document.createElement('div');
      rowEl.className = 'silhouette-row';

      rowArr.forEach(lvl => {
        const tile = document.createElement('div');
        tile.className = 'sil-tile';
        tile.textContent = lvl;
        tile.dataset.level = lvl;

        const isUnlocked = adventure.isLevelUnlocked(lvl);
        const isCompleted = adventure.levelStars[lvl] !== undefined;

        if (isCompleted) {
          tile.classList.add('completed');
        } else if (isUnlocked) {
          tile.classList.add('unlocked');
        }

        if (lvl === this.selectedLevelOnMap) {
          tile.classList.add('current');
        }

        tile.addEventListener('click', () => {
          if (!isUnlocked) return;
          sound.playClick();
          this.selectedLevelOnMap = lvl;
          this.setupAdventureMap();
          if (this.mapPlayLevelBtn) {
            this.mapPlayLevelBtn.textContent = `Level ${lvl}`;
          }
        });

        rowEl.appendChild(tile);
      });

      this.adventureSilhouetteGrid.appendChild(rowEl);
    });

    if (this.mapPlayLevelBtn) {
      this.mapPlayLevelBtn.textContent = `Level ${this.selectedLevelOnMap}`;
    }
  }

  triggerLevelWin() {
    this.clearSavedGameState('adventure');
    adventure.completeLevel(this.currentLevelNum, this.score);
    medalManager.recordLevelCompleted(this.currentLevelNum);
    sound.playComboFanfare();

    const streakEl = document.getElementById('win-streak-count');
    if (streakEl) streakEl.textContent = `×${this.currentLevelNum}`;

    const winTitle = document.getElementById('win-level-title');
    if (winTitle) winTitle.textContent = `Level ${this.currentLevelNum} Completed!`;

    this.updateHomeUI();

    setTimeout(() => {
      if (this.levelWinModal) {
        this.levelWinModal.classList.remove('hidden');
      }
    }, 450);
  }

  // --- 8. Game Over Flow & 5-Second Countdown Timer ---
  checkGameOver() {
    const remainingPieces = this.currentPieces.filter(p => p !== null);
    if (remainingPieces.length === 0) return;

    const canAnyFit = remainingPieces.some(p => canFitAnywhere(this.board, p.matrix, this.boardSize));
    if (!canAnyFit) {
      this.triggerGameOver();
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    sound.playGameOver();
    medalManager.recordRound(this.score, this.combo);
    this.clearSavedGameState();

    // Confetti removed as requested - only game over sound plays!

    this.deathFinalScoreEl.textContent = this.score;
    this.deathBestScoreEl.textContent = this.bestScore;

    const isNewBest = this.score === this.bestScore && this.score > 0;
    if (isNewBest) {
      this.deathNewRecordEl.classList.remove('hidden');
    } else {
      this.deathNewRecordEl.classList.add('hidden');
    }

    this.startDeathCountdown();

    setTimeout(() => {
      this.showScreen('screen-game-over');
    }, 500);
  }

  startDeathCountdown() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);

    this.countdownSeconds = 5;
    this.deathCountdownBox.classList.remove('hidden');
    this.deathTimerNumEl.textContent = '5';
    this.deathTimerSecTextEl.textContent = '5s';

    this.deathRestartBtn.classList.add('locked');
    this.deathRestartBtn.disabled = true;

    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds > 0) {
        this.deathTimerNumEl.textContent = String(this.countdownSeconds);
        this.deathTimerSecTextEl.textContent = `${this.countdownSeconds}s`;
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.deathCountdownBox.classList.add('hidden');

        this.deathRestartBtn.classList.remove('locked');
        this.deathRestartBtn.disabled = false;
        sound.playClick();
      }
    }, 1000);
  }

  // --- 9. Medals & Achievements Screen ---
  setupMedalsScreen() {
    const stats = medalManager.getStats(this.bestScore);
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setTxt('stat-highest-combo', stats.highestCombo);
    setTxt('stat-best-score', stats.bestScore);
    setTxt('stat-rounds', stats.rounds);
    setTxt('stat-login-days', stats.loginDays);

    const medalsGrid = document.getElementById('medals-grid');
    if (!medalsGrid) return;
    medalsGrid.innerHTML = '';

    const iconSymbols = {
      target: '🎯',
      calendar: '📅',
      blocks: '🧱',
      gems: '💎',
      crown: '👑',
      broom: '🧹',
      play: '▶',
      diamond: '💎',
      map: '🗺️'
    };

    const awards = medalManager.getAwardsList(this.bestScore);

    awards.forEach(award => {
      const item = document.createElement('div');
      item.className = 'medal-item';

      const badgeWrap = document.createElement('div');
      badgeWrap.className = 'medal-badge-wrap';

      const octMedal = document.createElement('div');
      octMedal.className = `oct-medal tier-${award.tier}`;

      const innerRing = document.createElement('div');
      innerRing.className = 'oct-inner-ring';
      innerRing.textContent = iconSymbols[award.icon] || '⭐';
      octMedal.appendChild(innerRing);

      badgeWrap.appendChild(octMedal);

      if (award.tier === 'gold') {
        const tails = document.createElement('div');
        tails.className = 'gold-ribbon-tails';
        tails.innerHTML = '<div class="ribbon-tail-l"></div><div class="ribbon-tail-r"></div>';
        badgeWrap.appendChild(tails);
      }

      if (award.hasRedDot) {
        const dot = document.createElement('div');
        dot.className = 'medal-red-dot';
        badgeWrap.appendChild(dot);
      }

      const nameEl = document.createElement('span');
      nameEl.className = 'medal-name';
      nameEl.textContent = award.name;

      const progEl = document.createElement('span');
      progEl.className = 'medal-prog';
      progEl.textContent = award.progress;

      item.appendChild(badgeWrap);
      item.appendChild(nameEl);
      item.appendChild(progEl);

      medalsGrid.appendChild(item);
    });
  }

  // --- 10. Event Listeners ---
  setupEventListeners() {
    // Mode Buttons on Homepage
    document.getElementById('btn-mode-classic').addEventListener('click', () => {
      sound.playClick();
      this.startClassicMode();
    });

    // Adventure Button launches current level directly!
    document.getElementById('btn-mode-adventure').addEventListener('click', () => {
      sound.playClick();
      const targetLvl = adventure.getCurrentLevel();
      this.startAdventureLevel(targetLvl);
    });

    const mapPinBtn = document.getElementById('home-map-pin-btn');
    if (mapPinBtn) {
      mapPinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playClick();
        this.selectedLevelOnMap = adventure.unlockedLevel;
        this.setupAdventureMap();
        this.showScreen('screen-adventure-map');
      });
    }

    const moreGamesBtn = document.getElementById('btn-mode-moregames');
    if (moreGamesBtn) {
      moreGamesBtn.addEventListener('click', () => {
        sound.playClick();
        this.selectedLevelOnMap = adventure.unlockedLevel;
        this.setupAdventureMap();
        this.showScreen('screen-adventure-map');
      });
    }

    // Adventure Map Navigation
    document.getElementById('map-back-btn').addEventListener('click', () => {
      sound.playClick();
      this.updateHomeUI();
      this.showScreen('screen-home');
    });

    document.getElementById('map-play-level-btn').addEventListener('click', () => {
      sound.playClick();
      this.startAdventureLevel(this.selectedLevelOnMap);
    });

    // Achievement Screen Back Button
    document.getElementById('achievement-back-btn').addEventListener('click', () => {
      sound.playClick();
      this.showScreen('screen-home');
    });

    // In-Game Back Button
    document.getElementById('game-back-btn').addEventListener('click', () => {
      sound.playClick();
      this.saveGameState();
      this.updateHomeUI();
      this.showScreen('screen-home');
    });

    // Settings Opened from Home
    document.getElementById('home-settings-btn').addEventListener('click', () => {
      sound.playClick();
      // Exit button is HIDDEN in home page setting!
      if (this.settingsExitHomeBtn) {
        this.settingsExitHomeBtn.classList.add('hidden');
      }
      this.settingsModal.classList.remove('hidden');
      this.soundToggleBtn.classList.toggle('muted', sound.isMuted);
    });

    // Settings Opened In-Game (while playing)
    document.getElementById('game-settings-btn').addEventListener('click', () => {
      sound.playClick();
      // Exit button is SHOWN in in-game setting!
      if (this.settingsExitHomeBtn) {
        this.settingsExitHomeBtn.classList.remove('hidden');
      }
      this.settingsModal.classList.remove('hidden');
      this.soundToggleBtn.classList.toggle('muted', sound.isMuted);
    });

    // Settings Exit to Home Button Action
    if (this.settingsExitHomeBtn) {
      this.settingsExitHomeBtn.addEventListener('click', () => {
        sound.playClick();
        this.saveGameState();
        this.settingsModal.classList.add('hidden');
        this.updateHomeUI();
        this.showScreen('screen-home');
      });
    }

    document.getElementById('settings-close-btn').addEventListener('click', () => {
      sound.playClick();
      this.settingsModal.classList.add('hidden');
    });

    // Sound Toggle
    this.soundToggleBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      this.soundToggleBtn.classList.toggle('muted', isMuted);
      sound.playClick();
    });

    // BGM Toggle
    this.bgmToggleBtn.addEventListener('click', () => {
      sound.playClick();
      this.bgmToggleBtn.classList.toggle('muted');
    });

    // Medal Button in Settings
    document.getElementById('settings-medal-btn').addEventListener('click', () => {
      sound.playClick();
      this.settingsModal.classList.add('hidden');
      this.setupMedalsScreen();
      this.showScreen('screen-achievement');
    });

    // More Settings Button
    document.getElementById('settings-more-btn').addEventListener('click', () => {
      sound.playClick();
      this.settingsModal.classList.add('hidden');
      this.moreSettingsModal.classList.remove('hidden');
    });

    document.getElementById('more-settings-close-btn').addEventListener('click', () => {
      sound.playClick();
      this.moreSettingsModal.classList.add('hidden');
    });

    // More Settings Sub-modals
    document.getElementById('menu-contact-us-btn').addEventListener('click', () => {
      sound.playClick();
      this.contactModal.classList.remove('hidden');
    });

    document.getElementById('contact-close-btn').addEventListener('click', () => {
      sound.playClick();
      this.contactModal.classList.add('hidden');
    });

    const copyBtn = document.getElementById('copy-email-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        sound.playClick();
        navigator.clipboard.writeText('asitech5info@gmail.com').then(() => {
          const toast = document.getElementById('copy-toast');
          if (toast) {
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 2000);
          }
        });
      });
    }

    document.getElementById('menu-share-btn').addEventListener('click', () => {
      sound.playClick();
      if (navigator.share) {
        navigator.share({
          title: 'Block Blaster',
          text: 'Play Block Blaster - The ultimate block puzzle adventure!',
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('Game link copied to clipboard! Share it with friends.');
        });
      }
    });

    document.getElementById('menu-terms-btn').addEventListener('click', () => {
      sound.playClick();
      this.termsModal.classList.remove('hidden');
    });

    document.getElementById('terms-close-btn').addEventListener('click', () => {
      sound.playClick();
      this.termsModal.classList.add('hidden');
    });

    document.getElementById('terms-ok-btn').addEventListener('click', () => {
      sound.playClick();
      this.termsModal.classList.add('hidden');
    });

    document.getElementById('menu-privacy-btn').addEventListener('click', () => {
      sound.playClick();
      this.privacyModal.classList.remove('hidden');
    });

    document.getElementById('privacy-close-btn').addEventListener('click', () => {
      sound.playClick();
      this.privacyModal.classList.add('hidden');
    });

    document.getElementById('privacy-ok-btn').addEventListener('click', () => {
      sound.playClick();
      this.privacyModal.classList.add('hidden');
    });

    document.getElementById('menu-about-btn').addEventListener('click', () => {
      sound.playClick();
      this.aboutModal.classList.remove('hidden');
    });

    document.getElementById('about-close-btn').addEventListener('click', () => {
      sound.playClick();
      this.aboutModal.classList.add('hidden');
    });

    document.getElementById('about-gotit-btn').addEventListener('click', () => {
      sound.playClick();
      this.aboutModal.classList.add('hidden');
    });

    // Game Over Actions
    this.deathRestartBtn.addEventListener('click', () => {
      if (this.deathRestartBtn.disabled) return;
      sound.playClick();
      if (this.mode === 'adventure') {
        this.startAdventureLevel(this.currentLevelNum);
      } else {
        this.startClassicMode();
      }
    });

    this.deathHomeBtn.addEventListener('click', () => {
      sound.playClick();
      this.updateHomeUI();
      this.showScreen('screen-home');
    });

    // Level Win Modal Actions
    document.getElementById('win-next-btn').addEventListener('click', () => {
      sound.playClick();
      this.levelWinModal.classList.add('hidden');
      const nextLvl = this.currentLevelNum + 1;
      if (nextLvl <= 96) {
        this.startAdventureLevel(nextLvl);
      } else {
        this.showScreen('screen-adventure-map');
      }
    });

    document.getElementById('win-map-btn').addEventListener('click', () => {
      sound.playClick();
      this.levelWinModal.classList.add('hidden');
      this.selectedLevelOnMap = adventure.unlockedLevel;
      this.setupAdventureMap();
      this.showScreen('screen-adventure-map');
    });

    // Drag and Drop & Pointer Events
    this.traySlots.forEach((slot, index) => {
      slot.addEventListener('pointerdown', (e) => this.handleTrayPointerDown(e, index));
      slot.addEventListener('click', (e) => this.handleTrayClick(e, index));
    });

    this.boardEl.addEventListener('click', (e) => this.handleBoardClick(e));

    window.addEventListener('pointermove', (e) => this.handleGlobalPointerMove(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.handleGlobalPointerUp(e));
    window.addEventListener('pointercancel', (e) => this.handleGlobalPointerCancel(e));
  }

  // --- 11. Interaction & Smooth 60fps Drag Handling ---
  handleTrayClick(e, slotIndex) {
    if (this.activeDrag && this.activeDrag.isDragging) return;
    const piece = this.currentPieces[slotIndex];
    if (!piece) return;

    if (this.selectedSlotIndex === slotIndex) {
      this.selectedSlotIndex = null;
      this.traySlots[slotIndex].classList.remove('selected');
    } else {
      this.selectedSlotIndex = slotIndex;
      this.traySlots.forEach((s, idx) => {
        s.classList.toggle('selected', idx === slotIndex);
      });
      sound.playPickup();
    }
  }

  handleBoardClick(e) {
    if (this.selectedSlotIndex === null) return;
    const cell = e.target.closest('.cell');
    if (!cell) return;

    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);
    const piece = this.currentPieces[this.selectedSlotIndex];

    if (!piece) return;

    if (canFitAt(this.board, piece.matrix, r, c, this.boardSize)) {
      this.placePiece(piece, this.selectedSlotIndex, r, c);
      this.selectedSlotIndex = null;
      this.traySlots.forEach(s => s.classList.remove('selected'));
    }
  }

  handleTrayPointerDown(e, slotIndex) {
    const piece = this.currentPieces[slotIndex];
    if (!piece || this.isGameOver) return;

    e.preventDefault();
    this.updateBoardDimensions();

    const slot = this.traySlots[slotIndex];
    try {
      slot.setPointerCapture(e.pointerId);
    } catch (err) {}

    this.activeDrag = {
      slotIndex,
      piece,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      isDragging: false,
      isTouch: e.pointerType === 'touch'
    };

    sound.playPickup();
  }

  handleGlobalPointerMove(e) {
    if (!this.activeDrag) return;

    const drag = this.activeDrag;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.isDragging && Math.hypot(dx, dy) > 4) {
      drag.isDragging = true;
      this.selectedSlotIndex = null;
      this.traySlots.forEach(s => s.classList.remove('selected'));
      this.traySlots[drag.slotIndex].style.opacity = '0.2';
      this.createDragAvatar(drag.piece);
    }

    if (drag.isDragging) {
      e.preventDefault();
      // On touch devices, lift piece above finger so player sees exact drop position!
      const touchOffsetY = drag.isTouch ? -70 : 0;
      const posX = e.clientX;
      const posY = e.clientY + touchOffsetY;

      this.pendingAvatarPos.x = posX;
      this.pendingAvatarPos.y = posY;

      // Update avatar immediately for zero-latency 60fps tracking!
      this.updateDragAvatarPosition(posX, posY);

      if (!this.isRafScheduled) {
        this.isRafScheduled = true;
        requestAnimationFrame(() => {
          this.updateBoardGhost(this.pendingAvatarPos.x, this.pendingAvatarPos.y, drag.piece);
          this.isRafScheduled = false;
        });
      }
    }
  }

  handleGlobalPointerUp(e) {
    if (!this.activeDrag) return;

    const drag = this.activeDrag;
    const slot = this.traySlots[drag.slotIndex];
    slot.style.opacity = '1';

    try {
      slot.releasePointerCapture(drag.pointerId);
    } catch (err) {}

    if (drag.isDragging) {
      const touchOffsetY = drag.isTouch ? -70 : 0;
      const posX = e.clientX;
      const posY = e.clientY + touchOffsetY;

      const targetPos = this.calculateBoardGridCoords(posX, posY, drag.piece);

      if (targetPos && canFitAt(this.board, drag.piece.matrix, targetPos.r, targetPos.c, this.boardSize)) {
        this.placePiece(drag.piece, drag.slotIndex, targetPos.r, targetPos.c);
      }

      this.clearDragAvatar();
      this.clearGhostHighlights();
    }

    this.activeDrag = null;
    this.lastGhostCoords = null;
  }

  handleGlobalPointerCancel() {
    if (this.activeDrag) {
      this.traySlots[this.activeDrag.slotIndex].style.opacity = '1';
      try {
        this.traySlots[this.activeDrag.slotIndex].releasePointerCapture(this.activeDrag.pointerId);
      } catch (err) {}
      this.clearDragAvatar();
      this.clearGhostHighlights();
      this.activeDrag = null;
      this.lastGhostCoords = null;
    }
  }

  createDragAvatar(piece) {
    this.dragAvatarEl.innerHTML = '';
    const rows = piece.matrix.length;
    const cols = piece.matrix[0].length;

    this.dragAvatarEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    this.dragAvatarEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'avatar-cell';
        if (piece.matrix[r][c]) {
          cell.classList.add('filled', piece.color);
          if (piece.gemMatrix && piece.gemMatrix[r] && piece.gemMatrix[r][c]) {
            cell.classList.add('has-diamond', piece.gemMatrix[r][c]);
          }
        }
        this.dragAvatarEl.appendChild(cell);
      }
    }

    this.dragAvatarEl.classList.remove('hidden');
  }

  updateDragAvatarPosition(x, y) {
    this.dragAvatarEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0)`;
  }

  clearDragAvatar() {
    this.dragAvatarEl.classList.add('hidden');
    this.dragAvatarEl.innerHTML = '';
  }

  calculateBoardGridCoords(x, y, piece) {
    const boardRect = this.cachedBoardRect || this.boardEl.getBoundingClientRect();
    if (
      x < boardRect.left - 50 ||
      x > boardRect.right + 50 ||
      y < boardRect.top - 50 ||
      y > boardRect.bottom + 50
    ) {
      return null;
    }

    const padding = 8;
    const innerWidth = boardRect.width - padding * 2;
    const cellSize = (innerWidth - 7 * 4) / this.boardSize;

    const rows = piece.matrix.length;
    const cols = piece.matrix[0].length;

    const piecePixelW = cols * (cellSize + 4);
    const piecePixelH = rows * (cellSize + 4);

    const pieceTopLeftX = x - piecePixelW / 2;
    const pieceTopLeftY = y - piecePixelH / 2;

    const relX = pieceTopLeftX - (boardRect.left + padding);
    const relY = pieceTopLeftY - (boardRect.top + padding);

    const c = Math.round(relX / (cellSize + 4));
    const r = Math.round(relY / (cellSize + 4));

    if (r >= 0 && r + rows <= this.boardSize && c >= 0 && c + cols <= this.boardSize) {
      return { r, c };
    }
    return null;
  }

  updateBoardGhost(x, y, piece) {
    const coords = this.calculateBoardGridCoords(x, y, piece);

    if (!coords) {
      if (this.lastGhostCoords) {
        this.clearGhostHighlights();
        this.lastGhostCoords = null;
      }
      return;
    }

    if (this.lastGhostCoords && this.lastGhostCoords.r === coords.r && this.lastGhostCoords.c === coords.c) {
      return;
    }

    this.clearGhostHighlights();
    this.lastGhostCoords = coords;

    const { r, c } = coords;
    const isValid = canFitAt(this.board, piece.matrix, r, c, this.boardSize);
    const rows = piece.matrix.length;
    const cols = piece.matrix[0].length;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (piece.matrix[i][j]) {
          const cell = this.getCellEl(r + i, c + j);
          if (cell) {
            cell.classList.add(isValid ? 'ghost-valid' : 'ghost-invalid');
          }
        }
      }
    }
  }

  clearGhostHighlights() {
    this.boardEl.querySelectorAll('.cell.ghost-valid, .cell.ghost-invalid').forEach(el => {
      el.classList.remove('ghost-valid', 'ghost-invalid');
    });
  }
}
