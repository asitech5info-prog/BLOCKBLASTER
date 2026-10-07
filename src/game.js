import { SHAPE_DEFINITIONS, canFitAt, canFitAnywhere, generateThreePieces } from './shapes.js';
import { sound } from './audio.js';
import { fireVictoryCelebration } from './particles.js';
import { adventure, ADVENTURE_SILHOUETTE_ROWS, MAX_ADVENTURE_LEVEL } from './adventure.js';
import { medalManager, AWARDS_DEFINITIONS } from './medals.js';
import { wallet } from './coins.js';
import { skinManager, SKINS_CATALOG } from './skins.js';
import { profileManager, AVATAR_DEFINITIONS } from './profile.js';
import { haptics } from './haptics.js';
import { dailyChallenge, CHEST_TIERS } from './daily.js';
import { careerStats } from './career.js';

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
    this.settingsRetryBtn = document.getElementById('settings-retry-btn');
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

    // New Features: Revive, Skin Shop, Daily Challenge, Profile, Career & Haptics
    this.deathReviveBtn = document.getElementById('death-revive-btn');
    this.skinShopModal = document.getElementById('skin-shop-modal');
    this.dailyChallengeModal = document.getElementById('daily-challenge-modal');
    this.chestOpenModal = document.getElementById('chest-open-modal');
    this.profileModal = document.getElementById('profile-modal');
    this.careerModal = document.getElementById('career-modal');
    this.settingsHapticsBtn = document.getElementById('settings-haptics-btn');
    this.hapticsIconWrap = document.getElementById('haptics-icon-wrap');
    this.activeAvatarFilter = 'all';
    this.activeShopTab = 'skins';
    this.activeShopPfpFilter = 'all';
    this.activeChestChallengeId = null;

    // High-performance cell caches & ghost tracking
    this.boardCellEls = [];
    this.activeGhostCells = [];
  }

  init() {
    this.createBoardGrid();
    this.setupEventListeners();
    this.setupNewFeatures();
    this.setupAdventureMap();
    this.setupMedalsScreen();
    this.updateHomeUI();
    this.applyTheme(this.themes[this.currentThemeIndex]);
    skinManager.applySkinToBody();
    profileManager.notify();
    this.updateCoinsDisplay();
    this.updateHapticsUI();
    this.startLoadingSequence();

    window.addEventListener('resize', () => {
      this.updateBoardDimensions();
    });
  }

  updateBoardDimensions() {
    if (this.boardEl) {
      this.cachedBoardRect = this.boardEl.getBoundingClientRect();
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

    // Dynamic progress strictly based on completed levels (0 completed = 0%, grows per level)
    const solvedLevels = Math.max(0, currentLvl - 1);
    const pct = Math.min(100, Math.round((solvedLevels / 96) * 100));
    if (this.homeAdventureProgressFill) {
      this.homeAdventureProgressFill.style.width = `${pct}%`;
    }
    if (this.homeAdventurePctText) {
      this.homeAdventurePctText.textContent = `${pct}%`;
    }
  }

  createBoardGrid() {
    this.boardEl.innerHTML = '';
    this.boardCellEls = Array.from({ length: this.boardSize }, () => Array(this.boardSize).fill(null));
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        this.boardEl.appendChild(cell);
        this.boardCellEls[r][c] = cell;
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

        const val = this.board[r][c];
        let targetClass = 'cell';
        if (val) {
          targetClass += ' filled';
          if (typeof val === 'string') {
            targetClass += ` ${val}`;
          } else if (typeof val === 'object') {
            targetClass += ` ${val.color || 'color-gold'}`;
            if (val.hasDiamond) {
              targetClass += ' has-diamond';
              if (val.diamondType) targetClass += ` ${val.diamondType}`;
            }
          }
        }

        if (cell.className !== targetClass) {
          cell.className = targetClass;
        }
      }
    }
  }

  getCellEl(r, c) {
    if (this.boardCellEls && this.boardCellEls[r] && this.boardCellEls[r][c]) {
      return this.boardCellEls[r][c];
    }
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

    dailyChallenge.recordEvent('scoreSingle', this.score);
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
    skinManager.applySkinToBody();
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
    haptics.fanfare();
    medalManager.recordAllClear();
    careerStats.recordAllClear();
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
    haptics.snapPiece();
    medalManager.recordPiecePlaced();
    careerStats.recordBlockPlaced();
    dailyChallenge.recordEvent('blocksPlaced', blockCount);
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
      careerStats.recordLinesCleared(totalLines);
      dailyChallenge.recordEvent('linesCleared', totalLines);
      dailyChallenge.recordEvent('comboChain', this.combo);
      haptics.lineClear(totalLines);
      if (this.combo > 1) {
        haptics.combo(this.combo);
      }

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
    this.updateCoinsDisplay();
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
      // Exit and Retry buttons are HIDDEN in home page setting!
      if (this.settingsExitHomeBtn) {
        this.settingsExitHomeBtn.classList.add('hidden');
      }
      if (this.settingsRetryBtn) {
        this.settingsRetryBtn.classList.add('hidden');
      }
      this.settingsModal.classList.remove('hidden');
      this.soundToggleBtn.classList.toggle('muted', sound.isMuted);
    });

    // Settings Opened In-Game (while playing)
    document.getElementById('game-settings-btn').addEventListener('click', () => {
      sound.playClick();
      // Exit and Retry buttons are SHOWN in in-game setting!
      if (this.settingsExitHomeBtn) {
        this.settingsExitHomeBtn.classList.remove('hidden');
      }
      if (this.settingsRetryBtn) {
        this.settingsRetryBtn.classList.remove('hidden');
      }
      this.settingsModal.classList.remove('hidden');
      this.soundToggleBtn.classList.toggle('muted', sound.isMuted);
    });

    // Settings Retry Button Action (Restarts current level or mode fresh)
    if (this.settingsRetryBtn) {
      this.settingsRetryBtn.addEventListener('click', () => {
        sound.playClick();
        this.settingsModal.classList.add('hidden');
        if (this.mode === 'adventure') {
          this.clearSavedGameState('adventure');
          this.startAdventureLevel(this.currentLevelNum);
        } else {
          this.clearSavedGameState('classic');
          this.startNewGame();
        }
      });
    }

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
      if (nextLvl <= 1000) {
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

  // --- 10b. New Features: Skins, Daily Challenges, Chests, Profile, Career & Haptics ---
  setupNewFeatures() {
    // Skin Shop Open & Close
    const btnSkinShop = document.getElementById('btn-skin-shop');
    if (btnSkinShop) {
      btnSkinShop.addEventListener('click', () => {
        sound.playClick();
        this.openSkinShop();
      });
    }

    const homeCoinsPill = document.getElementById('home-coins-pill');
    if (homeCoinsPill) {
      homeCoinsPill.addEventListener('click', () => {
        sound.playClick();
        this.openSkinShop();
      });
    }

    // Shop Tab switching (Block Skins vs Character PFPs)
    const tabSkins = document.getElementById('shop-tab-skins');
    const tabPfps = document.getElementById('shop-tab-pfps');
    const viewSkins = document.getElementById('shop-view-skins');
    const viewPfps = document.getElementById('shop-view-pfps');

    if (tabSkins && tabPfps) {
      tabSkins.addEventListener('click', () => {
        sound.playClick();
        tabSkins.classList.add('active');
        tabPfps.classList.remove('active');
        if (viewSkins) viewSkins.classList.remove('hidden');
        if (viewPfps) viewPfps.classList.add('hidden');
        this.activeShopTab = 'skins';
      });
      tabPfps.addEventListener('click', () => {
        sound.playClick();
        tabPfps.classList.add('active');
        tabSkins.classList.remove('active');
        if (viewPfps) viewPfps.classList.remove('hidden');
        if (viewSkins) viewSkins.classList.add('hidden');
        this.activeShopTab = 'pfps';
        this.renderShopPfps();
      });
    }

    // Shop PFP Gender Filters
    ['all', 'boys', 'girls'].forEach(filter => {
      const btn = document.getElementById(`shop-filter-${filter}`);
      if (btn) {
        btn.addEventListener('click', () => {
          sound.playClick();
          document.querySelectorAll('#shop-pfp-filters .avatar-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeShopPfpFilter = filter === 'boys' ? 'boy' : filter === 'girls' ? 'girl' : 'all';
          this.renderShopPfps();
        });
      }
    });

    const skinShopClose = document.getElementById('skin-shop-close-btn');
    if (skinShopClose) {
      skinShopClose.addEventListener('click', () => {
        sound.playClick();
        this.closeSkinShop();
      });
    }

    // Daily Challenge Open & Close
    const btnDaily = document.getElementById('btn-daily-challenge');
    if (btnDaily) {
      btnDaily.addEventListener('click', () => {
        sound.playClick();
        this.openDailyChallenge();
      });
    }

    const dailyClose = document.getElementById('daily-challenge-close-btn');
    if (dailyClose) {
      dailyClose.addEventListener('click', () => {
        sound.playClick();
        this.closeDailyChallenge();
      });
    }

    // Career Stats Open & Close
    const btnCareer = document.getElementById('btn-career-stats');
    if (btnCareer) {
      btnCareer.addEventListener('click', () => {
        sound.playClick();
        this.openCareerModal();
      });
    }

    const careerClose = document.getElementById('career-close-btn');
    if (careerClose) {
      careerClose.addEventListener('click', () => {
        sound.playClick();
        this.closeCareerModal();
      });
    }

    // Player Profile Open & Close
    const homeProfilePill = document.getElementById('home-profile-pill');
    if (homeProfilePill) {
      homeProfilePill.addEventListener('click', () => {
        sound.playClick();
        this.openProfileModal();
      });
    }

    const profileClose = document.getElementById('profile-close-btn');
    if (profileClose) {
      profileClose.addEventListener('click', () => {
        sound.playClick();
        this.closeProfileModal();
      });
    }

    // Player Profile Name Save
    const profileSaveBtn = document.getElementById('profile-name-save-btn');
    const profileInput = document.getElementById('profile-name-input');
    if (profileSaveBtn && profileInput) {
      profileSaveBtn.addEventListener('click', () => {
        sound.playClick();
        if (profileManager.setName(profileInput.value)) {
          profileSaveBtn.textContent = 'Saved! ✓';
          setTimeout(() => {
            if (profileSaveBtn) profileSaveBtn.textContent = '✓ Save';
          }, 1500);
        }
      });
      profileInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          profileSaveBtn.click();
        }
      });
    }

    // Avatar Filter Tabs
    ['all', 'boy', 'girl'].forEach(filter => {
      const tabId = filter === 'all' ? 'tab-avatar-all' : filter === 'boy' ? 'tab-avatar-boys' : 'tab-avatar-girls';
      const tab = document.getElementById(tabId);
      if (tab) {
        tab.addEventListener('click', () => {
          sound.playClick();
          document.querySelectorAll('.avatar-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.activeAvatarFilter = filter;
          this.renderProfileModal();
        });
      }
    });

    // Mystery Chest Action
    const chestActionBtn = document.getElementById('chest-action-btn');
    if (chestActionBtn) {
      chestActionBtn.addEventListener('click', () => {
        this.triggerChestOpen();
      });
    }

    // Game Over Revive Option
    if (this.deathReviveBtn) {
      this.deathReviveBtn.addEventListener('click', () => {
        this.reviveGame();
      });
    }

    // Haptics Toggle
    if (this.settingsHapticsBtn) {
      this.settingsHapticsBtn.addEventListener('click', () => {
        const current = haptics.isHapticsEnabled();
        haptics.setHapticsEnabled(!current);
        this.updateHapticsUI();
        sound.playClick();
      });
    }

    // Haptics Intensity Control
    const intensityBtns = document.querySelectorAll('#haptic-intensity-control .seg-btn');
    intensityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        intensityBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        haptics.setIntensity(btn.dataset.val);
        sound.playClick();
      });
    });

    // Touch Drag Offset Control
    const offsetBtns = document.querySelectorAll('#touch-offset-control .seg-btn');
    offsetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        offsetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        haptics.setTouchOffsetMode(btn.dataset.val);
        sound.playClick();
      });
    });
  }

  updateCoinsDisplay() {
    const bal = wallet.getBalance();
    document.querySelectorAll('.bb-coin-amount').forEach(el => {
      el.textContent = bal.toLocaleString();
    });
  }

  updateHapticsUI() {
    const enabled = haptics.isHapticsEnabled();
    if (this.settingsHapticsBtn) {
      this.settingsHapticsBtn.classList.toggle('muted', !enabled);
    }

    const currentIntensity = haptics.getIntensity();
    document.querySelectorAll('#haptic-intensity-control .seg-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.val === currentIntensity);
    });

    const currentOffset = haptics.getTouchOffsetMode();
    document.querySelectorAll('#touch-offset-control .seg-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.val === currentOffset);
    });
  }

  // --- Revive Logic ---
  reviveGame() {
    const cost = 5000;
    if (!wallet.canAfford(cost)) {
      alert(`Not enough BB Coins! Revive requires 5,000 BB Coins (You have ${wallet.getBalance().toLocaleString()} 🪙).`);
      return;
    }

    if (wallet.spendCoins(cost, 'Revive Game')) {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }

      careerStats.recordRevive();

      // Clear center 4x4 area (rows 2-5, cols 2-5)
      for (let r = 2; r <= 5; r++) {
        for (let c = 2; c <= 5; c++) {
          this.board[r][c] = null;
        }
      }

      this.isGameOver = false;
      this.renderBoard();
      this.spawnNewPieces();

      haptics.fanfare();
      if (typeof sound?.playMedalCelebration === 'function') {
        sound.playMedalCelebration();
      } else if (typeof sound?.playComboFanfare === 'function') {
        sound.playComboFanfare();
      }
      fireVictoryCelebration();

      this.showScreen('screen-gameplay');
    }
  }

  // --- Skin & PFP Shop ---
  openSkinShop() {
    this.renderSkinShop();
    this.renderShopPfps();
    if (this.skinShopModal) this.skinShopModal.classList.remove('hidden');
  }

  closeSkinShop() {
    if (this.skinShopModal) this.skinShopModal.classList.add('hidden');
  }

  renderSkinShop() {
    const grid = document.getElementById('skins-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const skins = skinManager.getAllSkins();
    const equippedId = skinManager.getEquippedSkin();

    skins.forEach(skin => {
      const card = document.createElement('div');
      card.className = `skin-card ${skin.id === equippedId ? 'equipped' : ''} ${skinManager.isSkinUnlocked(skin.id) ? 'unlocked' : 'locked'}`;

      const header = document.createElement('div');
      header.className = 'skin-card-header';
      header.innerHTML = `
        <span class="skin-badge-tag">${skin.tag}</span>
        <span class="skin-icon">${skin.icon}</span>
      `;

      // 4-cell block preview in skin style
      const previewGrid = document.createElement('div');
      previewGrid.className = `skin-preview-grid ${skin.cssClass}`;
      for (let i = 0; i < 4; i++) {
        const previewCell = document.createElement('div');
        previewCell.className = `cell filled skin-preview-cell preview-${i + 1}`;
        previewGrid.appendChild(previewCell);
      }

      const info = document.createElement('div');
      info.className = 'skin-info';
      info.innerHTML = `
        <strong class="skin-name">${skin.name}</strong>
        <p class="skin-desc">${skin.desc}</p>
      `;

      const actions = document.createElement('div');
      actions.className = 'skin-actions';

      const isUnlocked = skinManager.isSkinUnlocked(skin.id);
      const isEquipped = skin.id === equippedId;

      if (isEquipped) {
        actions.innerHTML = `<button class="skin-btn btn-equipped" disabled>Equipped ✓</button>`;
      } else if (isUnlocked) {
        const btn = document.createElement('button');
        btn.className = 'skin-btn btn-equip';
        btn.textContent = 'Equip';
        btn.addEventListener('click', () => {
          skinManager.equipSkin(skin.id);
          this.renderSkinShop();
          this.renderBoard();
          this.renderTray();
        });
        actions.appendChild(btn);
      } else {
        const btn = document.createElement('button');
        btn.className = 'skin-btn btn-buy';
        btn.innerHTML = `<span>Buy</span> <span>🪙 ${skin.price}</span>`;
        btn.addEventListener('click', () => {
          const res = skinManager.buySkin(skin.id);
          if (res.success) {
            this.renderSkinShop();
            this.renderBoard();
            this.renderTray();
          } else {
            alert(res.reason || 'Not enough BB Coins!');
          }
        });
        actions.appendChild(btn);
      }

      card.appendChild(header);
      card.appendChild(previewGrid);
      card.appendChild(info);
      card.appendChild(actions);
      grid.appendChild(card);
    });
  }

  renderShopPfps() {
    const grid = document.getElementById('shop-pfps-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const avatars = profileManager.getAvatars(this.activeShopPfpFilter || 'all');
    const currentPfpId = profileManager.getPfp();

    avatars.forEach(av => {
      const isUnlocked = profileManager.isAvatarUnlocked(av.id);
      const isEquipped = av.id === currentPfpId;

      const card = document.createElement('div');
      card.className = `shop-pfp-card ${isEquipped ? 'equipped' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`;

      const avatarWrap = document.createElement('div');
      avatarWrap.className = 'shop-pfp-avatar-wrap';
      avatarWrap.innerHTML = av.svg;

      const info = document.createElement('div');
      info.className = 'shop-pfp-info';
      info.innerHTML = `
        <strong class="shop-pfp-name">${av.name}</strong>
        <span class="shop-pfp-title">${av.title}</span>
        <span class="avatar-gender-tag tag-${av.gender}">${av.gender === 'boy' ? 'Boy' : 'Girl'}</span>
      `;

      const actions = document.createElement('div');
      actions.className = 'shop-pfp-actions';

      if (isEquipped) {
        actions.innerHTML = `<button class="pfp-shop-btn btn-equipped" disabled>Equipped ✓</button>`;
      } else if (isUnlocked) {
        const btn = document.createElement('button');
        btn.className = 'pfp-shop-btn btn-equip';
        btn.textContent = 'Equip';
        btn.addEventListener('click', () => {
          profileManager.setPfp(av.id);
          this.renderShopPfps();
          this.renderProfileModal();
        });
        actions.appendChild(btn);
      } else {
        const btn = document.createElement('button');
        btn.className = 'pfp-shop-btn btn-buy';
        btn.innerHTML = `<span>Buy</span> <span>🪙 ${av.price.toLocaleString()}</span>`;
        btn.addEventListener('click', () => {
          const res = profileManager.buyAvatar(av.id);
          if (res.success) {
            this.renderShopPfps();
            this.renderProfileModal();
          } else {
            alert(res.reason || 'Not enough BB Coins!');
          }
        });
        actions.appendChild(btn);
      }

      card.appendChild(avatarWrap);
      card.appendChild(info);
      card.appendChild(actions);
      grid.appendChild(card);
    });
  }

  // --- Daily Challenges ---
  openDailyChallenge() {
    this.renderDailyChallenge();
    if (this.dailyChallengeModal) this.dailyChallengeModal.classList.remove('hidden');
  }

  closeDailyChallenge() {
    if (this.dailyChallengeModal) this.dailyChallengeModal.classList.add('hidden');
  }

  renderDailyChallenge() {
    const list = document.getElementById('daily-challenges-list');
    if (!list) return;
    list.innerHTML = '';

    const challenges = dailyChallenge.getChallenges();

    challenges.forEach(c => {
      const card = document.createElement('div');
      card.className = `daily-item-card tier-${c.chest.tier} ${c.isCompleted ? 'completed' : ''} ${c.isClaimed ? 'claimed' : ''}`;

      const pct = Math.min(100, Math.round((c.current / c.target) * 100));

      card.innerHTML = `
        <div class="daily-item-left">
          <div class="daily-chest-icon-badge" style="background:${c.chest.glowColor}">
            <span class="daily-gem-emoji">${c.chest.gemEmoji}</span>
            <span class="daily-chest-icon">${c.chest.icon}</span>
          </div>
          <div class="daily-item-info">
            <div class="daily-title-row">
              <strong class="daily-title">${c.title}</strong>
              <span class="daily-complexity-badge tier-${c.chest.tier}">${c.complexity}</span>
            </div>
            <p class="daily-desc">${c.desc}</p>
            <div class="daily-prog-track">
              <div class="daily-prog-fill" style="width: ${pct}%"></div>
              <span class="daily-prog-text">${c.current} / ${c.target}</span>
            </div>
          </div>
        </div>
      `;

      const rightWrap = document.createElement('div');
      rightWrap.className = 'daily-item-right';

      if (c.isClaimed) {
        rightWrap.innerHTML = `<button class="daily-claim-btn btn-claimed" disabled>Claimed ✓</button>`;
      } else if (c.isCompleted) {
        const btn = document.createElement('button');
        btn.className = 'daily-claim-btn btn-claim-ready';
        btn.innerHTML = `<span>Claim</span> <span class="chest-bounce">${c.chest.icon}</span>`;
        btn.addEventListener('click', () => {
          this.openChestModal(c.id);
        });
        rightWrap.appendChild(btn);
      } else {
        rightWrap.innerHTML = `
          <div class="daily-reward-preview">
            <span class="reward-coin-tag">🪙 ${c.chest.coins}</span>
          </div>
        `;
      }

      card.appendChild(rightWrap);
      list.appendChild(card);
    });
  }

  // --- Mystery Chest Opening ---
  openChestModal(challengeId) {
    this.activeChestChallengeId = challengeId;
    const challenge = dailyChallenge.challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const chestTitle = document.getElementById('chest-title-text');
    const chestDesc = document.getElementById('chest-desc-text');
    const chestBoxIcon = document.getElementById('chest-box-icon');
    const chestActionBtn = document.getElementById('chest-action-btn');
    const rewardDisplay = document.getElementById('chest-reward-display');

    if (chestTitle) chestTitle.textContent = `${challenge.complexity} ${challenge.chest.name}!`;
    if (chestDesc) chestDesc.textContent = 'Tap to burst open and claim your BB Coins!';
    if (chestBoxIcon) {
      chestBoxIcon.textContent = challenge.chest.icon;
      chestBoxIcon.className = 'chest-box-icon chest-shaking';
    }
    if (rewardDisplay) rewardDisplay.classList.add('hidden');
    if (chestActionBtn) {
      chestActionBtn.textContent = 'Open Chest!';
      chestActionBtn.disabled = false;
    }

    if (this.chestOpenModal) this.chestOpenModal.classList.remove('hidden');
  }

  closeChestModal() {
    if (this.chestOpenModal) this.chestOpenModal.classList.add('hidden');
    this.activeChestChallengeId = null;
    this.renderDailyChallenge();
  }

  triggerChestOpen() {
    if (!this.activeChestChallengeId) return;

    const chestBoxIcon = document.getElementById('chest-box-icon');
    const chestActionBtn = document.getElementById('chest-action-btn');
    const rewardDisplay = document.getElementById('chest-reward-display');
    const rewardAmount = document.getElementById('chest-reward-amount');

    const result = dailyChallenge.claimChest(this.activeChestChallengeId);
    if (!result.success) return;

    if (chestBoxIcon) {
      chestBoxIcon.classList.remove('chest-shaking');
      chestBoxIcon.classList.add('chest-bursting');
    }

    if (rewardAmount) rewardAmount.textContent = `+${result.coins}`;
    if (rewardDisplay) rewardDisplay.classList.remove('hidden');

    if (chestActionBtn) {
      chestActionBtn.textContent = 'Awesome! Collect Coins';
      chestActionBtn.onclick = () => {
        chestActionBtn.onclick = null;
        this.closeChestModal();
      };
    }
  }

  // --- Player Profile ---
  openProfileModal() {
    const input = document.getElementById('profile-name-input');
    if (input) input.value = profileManager.getName();
    this.renderProfileModal();
    if (this.profileModal) this.profileModal.classList.remove('hidden');
  }

  closeProfileModal() {
    if (this.profileModal) this.profileModal.classList.add('hidden');
  }

  renderProfileModal() {
    const grid = document.getElementById('avatars-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const heroSlot = document.getElementById('profile-hero-avatar');
    if (heroSlot) heroSlot.innerHTML = profileManager.getCurrentAvatar().svg;

    const avatars = profileManager.getAvatars(this.activeAvatarFilter);
    const currentPfpId = profileManager.getPfp();

    avatars.forEach(av => {
      const isUnlocked = profileManager.isAvatarUnlocked(av.id);
      const isEquipped = av.id === currentPfpId;

      const tile = document.createElement('div');
      tile.className = `avatar-choice-tile ${isEquipped ? 'selected' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`;
      tile.title = `${av.name} (${av.gender})`;

      const svgWrap = document.createElement('div');
      svgWrap.className = 'avatar-svg-wrap';
      svgWrap.innerHTML = av.svg;

      const nameLabel = document.createElement('span');
      nameLabel.className = 'avatar-choice-name';
      nameLabel.textContent = av.name;

      const tagLabel = document.createElement('span');
      tagLabel.className = `avatar-gender-tag tag-${av.gender}`;
      tagLabel.textContent = av.gender === 'boy' ? 'Boy' : 'Girl';

      tile.appendChild(svgWrap);
      tile.appendChild(nameLabel);
      tile.appendChild(tagLabel);

      if (!isUnlocked) {
        const priceBadge = document.createElement('span');
        priceBadge.className = 'avatar-price-badge';
        priceBadge.textContent = `🪙 ${av.price.toLocaleString()}`;
        tile.appendChild(priceBadge);
      }

      tile.addEventListener('click', () => {
        sound.playClick();
        if (isUnlocked) {
          profileManager.setPfp(av.id);
          this.renderProfileModal();
          this.renderShopPfps();
        } else {
          const res = profileManager.buyAvatar(av.id);
          if (res.success) {
            this.renderProfileModal();
            this.renderShopPfps();
          } else {
            alert(res.reason || 'Not enough BB Coins!');
          }
        }
      });

      grid.appendChild(tile);
    });
  }

  // --- Career Stats ---
  openCareerModal() {
    this.renderCareerModal();
    if (this.careerModal) this.careerModal.classList.remove('hidden');
  }

  closeCareerModal() {
    if (this.careerModal) this.careerModal.classList.add('hidden');
  }

  renderCareerModal() {
    const stats = careerStats.getStats();
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = typeof val === 'number' ? val.toLocaleString() : val;
    };

    setVal('c-stat-best-score', stats.bestScore);
    setVal('c-stat-highest-combo', stats.highestCombo);
    setVal('c-stat-rounds', stats.rounds);
    setVal('c-stat-blocks', stats.blocksPlaced);
    setVal('c-stat-lines', stats.linesCleared);
    setVal('c-stat-multiline', stats.multiClears);
    setVal('c-stat-allclear', stats.allClears);
    setVal('c-stat-adventure', `${stats.adventureLevel} / 1000`);
    setVal('c-stat-daily', stats.dailyCompleted);
    setVal('c-stat-chests', stats.chestsOpened);
    setVal('c-stat-revives', stats.revivesUsed);
    setVal('c-stat-coins', stats.totalCoinsEarned);
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
    if (!this.cachedBoardRect) {
      this.updateBoardDimensions();
    }

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
    haptics.tapPiece();
  }

  handleGlobalPointerMove(e) {
    if (!this.activeDrag) return;

    const drag = this.activeDrag;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.isDragging && Math.hypot(dx, dy) > 2) {
      drag.isDragging = true;
      this.selectedSlotIndex = null;
      this.traySlots.forEach(s => s.classList.remove('selected'));
      this.traySlots[drag.slotIndex].style.opacity = '0.2';
      this.createDragAvatar(drag.piece);
    }

    if (drag.isDragging) {
      e.preventDefault();
      // Use user customizable touch drag offset (above finger vs direct)
      const touchOffsetY = drag.isTouch ? haptics.getTouchOffsetY() : 0;
      const posX = e.clientX;
      const posY = e.clientY + touchOffsetY;

      // Update avatar and board ghost in lockstep for buttery-smooth 60fps tracking!
      this.updateDragAvatarPosition(posX, posY);
      this.updateBoardGhost(posX, posY, drag.piece);
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
      const touchOffsetY = drag.isTouch ? haptics.getTouchOffsetY() : 0;
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
    const ghostClass = isValid ? 'ghost-valid' : 'ghost-invalid';

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (piece.matrix[i][j]) {
          const cell = this.getCellEl(r + i, c + j);
          if (cell) {
            cell.classList.add(ghostClass);
            this.activeGhostCells.push(cell);
          }
        }
      }
    }
  }

  clearGhostHighlights() {
    if (this.activeGhostCells && this.activeGhostCells.length > 0) {
      for (let i = 0; i < this.activeGhostCells.length; i++) {
        this.activeGhostCells[i].classList.remove('ghost-valid', 'ghost-invalid');
      }
      this.activeGhostCells = [];
    }
  }
}
