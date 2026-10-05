import { SHAPE_DEFINITIONS, canFitAt, canFitAnywhere, generateThreePieces } from './shapes.js';
import { sound } from './audio.js';
import { fireVictoryCelebration } from './particles.js';
import { adventure, ADVENTURE_SILHOUETTE_ROWS } from './adventure.js';
import { medalManager, AWARDS_LIST } from './medals.js';

export class BlockBlasterGame {
  constructor() {
    this.boardSize = 8;
    this.board = Array.from({ length: this.boardSize }, () => Array(this.boardSize).fill(null));
    this.currentPieces = [null, null, null];
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('block_blaster_best') || '423506', 10);
    this.combo = 0;
    this.isGameOver = false;

    // Mode: 'classic' or 'adventure'
    this.mode = 'classic';
    this.currentLevelNum = 1;
    this.levelObjective = null;
    this.objectiveProgress = 0;
    this.selectedLevelOnMap = 1;

    // Adventure Gem Counts
    this.adventureGems = {
      blue: 0,
      orange: 0,
      star: 0
    };

    // Themes (switches dynamically when grid is completely cleared)
    this.themes = ['theme-teal', 'theme-pink', 'theme-slate', 'theme-purple', 'theme-knit', 'theme-egg'];
    this.currentThemeIndex = 0;

    // 5-Second Game Over Countdown Timer
    this.countdownTimer = null;
    this.countdownSeconds = 5;

    // Drag State
    this.activeDrag = null;
    this.selectedSlotIndex = null;
    this.isRafScheduled = false;
    this.pendingAvatarPos = { x: 0, y: 0 };

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
    this.adventureScoreTargetHud = document.getElementById('adventure-score-target-hud');
    this.adventureCurrentScoreEl = document.getElementById('adventure-current-score');
    this.adventureTargetScoreEl = document.getElementById('adventure-target-score');
    this.adventureTargetFillEl = document.getElementById('adventure-target-fill');

    this.adventureGemsHud = document.getElementById('adventure-gems-hud');
    this.gemCountBlueEl = document.getElementById('gem-count-blue');
    this.gemCountOrangeEl = document.getElementById('gem-count-orange');
    this.gemCountStarEl = document.getElementById('gem-count-star');

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

    // Audio & Settings Elements
    this.soundToggleBtn = document.getElementById('settings-sound-btn');
    this.bgmToggleBtn = document.getElementById('settings-bgm-btn');
  }

  init() {
    this.createBoardGrid();
    this.setupEventListeners();
    this.setupAdventureMap();
    this.setupMedalsScreen();
    this.applyTheme(this.themes[this.currentThemeIndex]);
    this.startLoadingSequence();
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
      progress += 20;
      if (bar) bar.style.width = `${Math.min(100, progress)}%`;
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.showScreen('screen-home');
        }, 250);
      }
    }, 70);
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
    this.adventureScoreTargetHud.classList.add('hidden');
    this.adventureGemsHud.classList.add('hidden');
    this.classicBestHud.classList.remove('hidden');

    // Check for saved in-progress classic game
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
    this.levelObjective = adventure.getLevelData(levelNum);
    this.objectiveProgress = 0;

    this.classicBestHud.classList.add('hidden');

    // Check for saved in-progress adventure game for this level
    const saved = this.loadSavedGameState('adventure');
    if (saved && saved.inProgress && saved.level === levelNum && saved.board) {
      this.board = saved.board;
      this.score = saved.score || 0;
      this.objectiveProgress = saved.objectiveProgress || 0;
      this.currentPieces = saved.currentPieces || generateThreePieces(this.board, this.boardSize);
      this.isGameOver = false;
    } else {
      this.board = JSON.parse(JSON.stringify(this.levelObjective.initialBoard));
      this.score = 0;
      this.objectiveProgress = 0;
      this.currentPieces = generateThreePieces(this.board, this.boardSize);
      this.isGameOver = false;
    }

    // Configure Adventure HUD based on objective type
    if (this.levelObjective.type === 'score') {
      this.adventureScoreTargetHud.classList.remove('hidden');
      this.adventureGemsHud.classList.add('hidden');
      this.adventureTargetScoreEl.textContent = this.levelObjective.target;
      this.updateScoreTargetUI();
    } else {
      this.adventureScoreTargetHud.classList.add('hidden');
      this.adventureGemsHud.classList.remove('hidden');
      this.adventureGems = {
        blue: Math.max(0, Math.floor(this.levelObjective.target / 3) + 2),
        orange: Math.max(0, Math.floor(this.levelObjective.target / 3)),
        star: Math.max(0, Math.floor(this.levelObjective.target / 3))
      };
      this.updateGemsUI();
    }

    this.renderBoard();
    this.renderTray();
    this.updateScoreUI();
    this.updateComboUI();
    this.saveGameState();
    this.showScreen('screen-gameplay');
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

  // Save current game state to localStorage
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
        objectiveProgress: this.objectiveProgress,
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
            cell.classList.add(val.color || 'color-cyan');
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
    const pieces = generateThreePieces(this.board, this.boardSize);
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

    if (this.mode === 'adventure' && this.levelObjective) {
      if (this.levelObjective.type === 'score') {
        this.objectiveProgress = this.score;
        this.updateScoreTargetUI();
        if (this.score >= this.levelObjective.target) {
          this.triggerLevelWin();
        }
      }
    }
  }

  updateScoreTargetUI() {
    if (!this.levelObjective) return;
    const target = this.levelObjective.target;
    const current = this.score;
    if (this.adventureCurrentScoreEl) this.adventureCurrentScoreEl.textContent = current;
    if (this.adventureTargetScoreEl) this.adventureTargetScoreEl.textContent = target;

    const pct = Math.min(100, Math.round((current / target) * 100));
    if (this.adventureTargetFillEl) this.adventureTargetFillEl.style.width = `${pct}%`;
  }

  updateGemsUI() {
    if (this.gemCountBlueEl) this.gemCountBlueEl.textContent = Math.max(0, this.adventureGems.blue);
    if (this.gemCountOrangeEl) this.gemCountOrangeEl.textContent = Math.max(0, this.adventureGems.orange);
    if (this.gemCountStarEl) this.gemCountStarEl.textContent = Math.max(0, this.adventureGems.star);

    if (this.adventureGems.blue <= 0 && this.adventureGems.orange <= 0 && this.adventureGems.star <= 0) {
      this.triggerLevelWin();
    }
  }

  updateComboUI() {
    if (this.combo >= 1) {
      this.comboBadgeEl.classList.remove('hidden');
      this.comboTextEl.textContent = `COMBO x${this.combo}`;
    } else {
      this.comboBadgeEl.classList.add('hidden');
    }
  }

  addScore(pts, floaterPos = null, isCombo = false, textOverride = null) {
    this.score += pts;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('block_blaster_best', String(this.bestScore));
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

    const boardRect = this.boardEl.getBoundingClientRect();
    const relX = Math.max(20, Math.min(boardRect.width - 20, x - boardRect.left));
    const relY = Math.max(20, Math.min(boardRect.height - 20, y - boardRect.top));

    floater.style.left = `${relX}px`;
    floater.style.top = `${relY}px`;

    this.floaterContainerEl.appendChild(floater);
    setTimeout(() => {
      floater.remove();
    }, 850);
  }

  // --- 5. Dynamic Theme Switching on Board Clear ---
  applyTheme(themeName) {
    document.body.className = themeName;

    // Update Score Backdrop Motif based on active theme
    if (this.scoreMotifEl) {
      this.scoreMotifEl.className = 'score-motif';
      if (themeName === 'theme-pink' || themeName === 'theme-purple') {
        this.scoreMotifEl.classList.add('motif-heart');
      } else if (themeName === 'theme-slate') {
        this.scoreMotifEl.classList.add('motif-diamond');
      } else if (themeName === 'theme-knit') {
        this.scoreMotifEl.classList.add('motif-knit');
      } else if (themeName === 'theme-egg') {
        this.scoreMotifEl.classList.add('motif-egg');
      } else {
        this.scoreMotifEl.classList.add('motif-heart');
      }
    }
  }

  switchNextTheme() {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    const nextTheme = this.themes[this.currentThemeIndex];
    this.applyTheme(nextTheme);

    // Display banner
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

    // Switch theme dynamically! (Confetti removed per prompt requirement)
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
          this.board[startR + r][startC + c] = piece.color;
          blockCount++;
        }
      }
    }

    sound.playDrop();
    this.renderBoard();

    // Score points
    const boardRect = this.boardEl.getBoundingClientRect();
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

      // Update Adventure gem objectives if applicable
      if (this.mode === 'adventure' && this.levelObjective && this.levelObjective.type === 'diamonds') {
        this.adventureGems.blue -= blueBlasted;
        this.adventureGems.orange -= orangeBlasted;
        this.adventureGems.star -= starBlasted;
        this.updateGemsUI();
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

      const boardRect = this.boardEl.getBoundingClientRect();
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
      }, 350);
    } else {
      this.combo = 0;
      this.updateComboUI();
    }
  }

  // --- 7. Adventure 96-Level Silhouette Map ---
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
    sound.playComboFanfare();

    // Confetti on Adventure Level Complete
    fireVictoryCelebration();

    setTimeout(() => {
      if (this.levelWinModal) {
        this.levelWinModal.classList.remove('hidden');
      }
    }, 600);
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

    // Confetti effect ONLY on Classic game over
    if (this.mode === 'classic') {
      fireVictoryCelebration();
    }

    // Populate Game Over screen
    this.deathFinalScoreEl.textContent = this.score;
    this.deathBestScoreEl.textContent = this.bestScore;

    const isNewBest = this.score === this.bestScore && this.score > 0;
    if (isNewBest) {
      this.deathNewRecordEl.classList.remove('hidden');
    } else {
      this.deathNewRecordEl.classList.add('hidden');
    }

    // Start 5-second countdown timer before Retry option unlocks
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

    // Lock Retry button during countdown
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

        // Unlock Retry button
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

    AWARDS_LIST.forEach(award => {
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

      // Gold ribbon tails
      if (award.tier === 'gold') {
        const tails = document.createElement('div');
        tails.className = 'gold-ribbon-tails';
        tails.innerHTML = '<div class="ribbon-tail-l"></div><div class="ribbon-tail-r"></div>';
        badgeWrap.appendChild(tails);
      }

      // Red notification dot
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

    document.getElementById('btn-mode-adventure').addEventListener('click', () => {
      sound.playClick();
      this.selectedLevelOnMap = adventure.unlockedLevel;
      this.setupAdventureMap();
      this.showScreen('screen-adventure-map');
    });

    // Adventure Map Navigation
    document.getElementById('map-back-btn').addEventListener('click', () => {
      sound.playClick();
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

    // In-Game Back & Settings Buttons
    document.getElementById('game-back-btn').addEventListener('click', () => {
      sound.playClick();
      this.saveGameState();
      if (this.mode === 'adventure') {
        this.showScreen('screen-adventure-map');
      } else {
        this.showScreen('screen-home');
      }
    });

    const openSettings = () => {
      sound.playClick();
      this.settingsModal.classList.remove('hidden');
      this.soundToggleBtn.classList.toggle('muted', sound.isMuted);
    };

    document.getElementById('game-settings-btn').addEventListener('click', openSettings);
    document.getElementById('home-settings-btn').addEventListener('click', openSettings);

    document.getElementById('settings-close-btn').addEventListener('click', () => {
      sound.playClick();
      this.settingsModal.classList.add('hidden');
    });

    // Sound Toggle (White Icon + Red Slash Line when muted)
    this.soundToggleBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      this.soundToggleBtn.classList.toggle('muted', isMuted);
      sound.playClick();
    });

    // BGM Toggle (White Icon + Red Slash Line when muted)
    this.bgmToggleBtn.addEventListener('click', () => {
      sound.playClick();
      this.bgmToggleBtn.classList.toggle('muted');
    });

    // Medal Button in Settings -> Opens Achievement Screen
    document.getElementById('settings-medal-btn').addEventListener('click', () => {
      sound.playClick();
      this.settingsModal.classList.add('hidden');
      this.setupMedalsScreen();
      this.showScreen('screen-achievement');
    });

    // More Settings Button in Settings -> Opens More Settings Modal
    document.getElementById('settings-more-btn').addEventListener('click', () => {
      sound.playClick();
      this.settingsModal.classList.add('hidden');
      this.moreSettingsModal.classList.remove('hidden');
    });

    document.getElementById('more-settings-close-btn').addEventListener('click', () => {
      sound.playClick();
      this.moreSettingsModal.classList.add('hidden');
    });

    // More Settings Menu: Contact Us
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

    // More Settings Menu: Share with Friends
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

    // More Settings Menu: Terms of Service
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

    // More Settings Menu: Privacy Policy
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

    // More Settings Menu: About Us (Only accessed from More Settings)
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
      this.showScreen('screen-home');
    });

    // Level Win Modal Actions
    document.getElementById('win-next-btn').addEventListener('click', () => {
      sound.playClick();
      this.levelWinModal.classList.add('hidden');
      if (this.currentLevelNum < 96) {
        this.startAdventureLevel(this.currentLevelNum + 1);
      } else {
        this.showScreen('screen-adventure-map');
      }
    });

    document.getElementById('win-map-btn').addEventListener('click', () => {
      sound.playClick();
      this.levelWinModal.classList.add('hidden');
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
    if (this.activeDrag) return;
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

    if (!drag.isDragging && Math.hypot(dx, dy) > 5) {
      drag.isDragging = true;
      this.selectedSlotIndex = null;
      this.traySlots.forEach(s => s.classList.remove('selected'));
      this.traySlots[drag.slotIndex].style.opacity = '0.25';
      this.createDragAvatar(drag.piece);
    }

    if (drag.isDragging) {
      e.preventDefault();
      const touchOffsetY = drag.isTouch ? -60 : 0;
      const posX = e.clientX;
      const posY = e.clientY + touchOffsetY;

      this.pendingAvatarPos.x = posX;
      this.pendingAvatarPos.y = posY;

      if (!this.isRafScheduled) {
        this.isRafScheduled = true;
        requestAnimationFrame(() => {
          this.updateDragAvatarPosition(this.pendingAvatarPos.x, this.pendingAvatarPos.y);
          this.updateBoardGhost(this.pendingAvatarPos.x, this.pendingAvatarPos.y, drag.piece);
          this.isRafScheduled = false;
        });
      }
    }
  }

  handleGlobalPointerUp(e) {
    if (!this.activeDrag) return;

    const drag = this.activeDrag;
    this.traySlots[drag.slotIndex].style.opacity = '1';

    if (drag.isDragging) {
      const touchOffsetY = drag.isTouch ? -60 : 0;
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
  }

  handleGlobalPointerCancel() {
    if (this.activeDrag) {
      this.traySlots[this.activeDrag.slotIndex].style.opacity = '1';
      this.clearDragAvatar();
      this.clearGhostHighlights();
      this.activeDrag = null;
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
    const boardRect = this.boardEl.getBoundingClientRect();
    if (
      x < boardRect.left - 40 ||
      x > boardRect.right + 40 ||
      y < boardRect.top - 40 ||
      y > boardRect.bottom + 40
    ) {
      return null;
    }

    const padding = 6;
    const innerWidth = boardRect.width - padding * 2;
    const cellSize = innerWidth / this.boardSize;

    const rows = piece.matrix.length;
    const cols = piece.matrix[0].length;

    const piecePixelW = cols * cellSize;
    const piecePixelH = rows * cellSize;

    const pieceTopLeftX = x - piecePixelW / 2;
    const pieceTopLeftY = y - piecePixelH / 2;

    const relX = pieceTopLeftX - (boardRect.left + padding);
    const relY = pieceTopLeftY - (boardRect.top + padding);

    const c = Math.round(relX / cellSize);
    const r = Math.round(relY / cellSize);

    if (r >= 0 && r + rows <= this.boardSize && c >= 0 && c + cols <= this.boardSize) {
      return { r, c };
    }
    return null;
  }

  updateBoardGhost(x, y, piece) {
    this.clearGhostHighlights();
    const coords = this.calculateBoardGridCoords(x, y, piece);
    if (!coords) return;

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
