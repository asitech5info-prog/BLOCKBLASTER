import { SHAPE_DEFINITIONS, canFitAt, canFitAnywhere, generateThreePieces } from './shapes.js';
import { sound } from './audio.js';
import { fireBlockBlast, fireVictoryCelebration } from './particles.js';
import { adventure, TROPHIES } from './adventure.js';

export class BlockBlasterGame {
  constructor() {
    this.boardSize = 8;
    this.board = Array.from({ length: this.boardSize }, () => Array(this.boardSize).fill(null));
    this.currentPieces = [null, null, null];
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('block_blaster_best') || '0', 10);
    this.combo = 0;
    this.isGameOver = false;

    // Mode: 'classic' or 'adventure'
    this.mode = 'classic';
    this.currentLevelNum = 1;
    this.levelObjective = null;
    this.objectiveProgress = 0;
    this.selectedTrophyIndex = 0;
    this.selectedLevelOnMap = 1;

    // Theme Management (cycles when board is completely cleared!)
    this.themes = ['theme-blue', 'theme-teal', 'theme-purple', 'theme-sunset', 'theme-dark'];
    this.currentThemeIndex = 0;

    // Drag State
    this.activeDrag = null;
    this.selectedSlotIndex = null;

    // Screen Elements
    this.screenLoading = document.getElementById('screen-loading');
    this.screenHome = document.getElementById('screen-home');
    this.screenAdventureMap = document.getElementById('screen-adventure-map');
    this.screenGameplay = document.getElementById('screen-gameplay');
    this.screenGameOver = document.getElementById('screen-game-over');

    // Modals
    this.settingsModal = document.getElementById('settings-modal');
    this.levelWinModal = document.getElementById('level-win-modal');

    // Board & Game Elements
    this.boardEl = document.getElementById('game-board');
    this.traySlots = document.querySelectorAll('.tray-slot');
    this.scoreHeroEl = document.getElementById('game-score-display');
    this.classicBestHud = document.getElementById('classic-best-hud');
    this.bestScoreDisplayEl = document.getElementById('best-score-display');
    this.comboBadgeEl = document.getElementById('combo-badge');
    this.comboTextEl = document.getElementById('combo-text');
    this.dragAvatarEl = document.getElementById('drag-avatar');
    this.floaterContainerEl = document.getElementById('floater-container');
    this.allClearBannerEl = document.getElementById('all-clear-banner');

    // Adventure HUD Elements
    this.adventureObjectiveHud = document.getElementById('adventure-objective-hud');
    this.objectiveIconEl = document.getElementById('objective-icon');
    this.objectiveTextEl = document.getElementById('objective-text');
    this.objectiveProgFillEl = document.getElementById('objective-prog-fill');

    // Game Over Elements (Image 4)
    this.deathFinalScoreEl = document.getElementById('death-final-score');
    this.deathBestScoreEl = document.getElementById('death-best-score');
    this.deathNewRecordEl = document.getElementById('death-new-record');
    this.deathRestartBtn = document.getElementById('death-restart-btn');
    this.deathHomeBtn = document.getElementById('death-home-btn');

    // Map Elements
    this.trophyTabsContainer = document.getElementById('trophy-tabs-container');
    this.levelsPyramidGrid = document.getElementById('levels-pyramid-grid');
    this.mapPlayLevelBtn = document.getElementById('map-play-level-btn');
    this.trophyIconEl = document.getElementById('trophy-icon');
    this.trophyNameEl = document.getElementById('trophy-name');
  }

  init() {
    this.createBoardGrid();
    this.setupEventListeners();
    this.setupAdventureMap();
    this.startLoadingSequence();
  }

  // --- 1. Screen Router ---
  showScreen(targetId) {
    const screens = [
      this.screenLoading,
      this.screenHome,
      this.screenAdventureMap,
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

    if (this.settingsModal) this.settingsModal.classList.add('hidden');
    if (this.levelWinModal) this.levelWinModal.classList.add('hidden');
  }

  startLoadingSequence() {
    this.showScreen('screen-loading');
    const bar = document.getElementById('loading-bar-fill');
    let progress = 0;

    const interval = setInterval(() => {
      progress += 15;
      if (bar) bar.style.width = `${Math.min(100, progress)}%`;
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.showScreen('screen-home');
        }, 300);
      }
    }, 90);
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

  // --- 2. Starting Modes ---
  startClassicMode() {
    this.mode = 'classic';
    this.adventureObjectiveHud.classList.add('hidden');
    this.classicBestHud.classList.remove('hidden');
    this.startNewGame();
    this.showScreen('screen-gameplay');
  }

  startAdventureLevel(levelNum) {
    this.mode = 'adventure';
    this.currentLevelNum = levelNum;
    this.levelObjective = adventure.getLevelData(levelNum);
    this.objectiveProgress = 0;

    this.classicBestHud.classList.add('hidden');
    this.adventureObjectiveHud.classList.remove('hidden');

    this.updateObjectiveUI();
    this.startNewGame(this.levelObjective.initialBoard);
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
  }

  renderBoard() {
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const cell = this.getCellEl(r, c);
        if (!cell) continue;

        cell.className = 'cell';
        const val = this.board[r][c];

        if (val) {
          if (typeof val === 'string') {
            cell.classList.add('filled', val);
          } else if (typeof val === 'object') {
            cell.classList.add('filled', val.color);
            if (val.hasDiamond) {
              cell.classList.add('has-diamond');
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

  updateScoreUI() {
    this.scoreHeroEl.textContent = this.score;
    this.bestScoreDisplayEl.textContent = this.bestScore;

    // If adventure mode with score objective:
    if (this.mode === 'adventure' && this.levelObjective.type === 'score') {
      this.objectiveProgress = this.score;
      this.updateObjectiveUI();
      if (this.score >= this.levelObjective.target) {
        this.triggerLevelWin();
      }
    }
  }

  updateObjectiveUI() {
    if (!this.levelObjective) return;
    const target = this.levelObjective.target;
    const current = Math.min(target, this.objectiveProgress);
    const pct = Math.min(100, Math.round((current / target) * 100));

    if (this.levelObjective.type === 'diamonds') {
      this.objectiveIconEl.textContent = '💎';
      this.objectiveTextEl.textContent = `${current} / ${target}`;
    } else if (this.levelObjective.type === 'lines') {
      this.objectiveIconEl.textContent = '⚡';
      this.objectiveTextEl.textContent = `${current} / ${target} Lines`;
    } else {
      this.objectiveIconEl.textContent = '🎯';
      this.objectiveTextEl.textContent = `${current} / ${target}`;
    }

    this.objectiveProgFillEl.style.width = `${pct}%`;
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
    }, 900);
  }

  // --- 3. Dynamic Theme Switch on Full Clean ---
  switchNextTheme() {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    const nextTheme = this.themes[this.currentThemeIndex];
    document.body.className = nextTheme;

    // Display banner
    if (this.allClearBannerEl) {
      this.allClearBannerEl.classList.remove('hidden');
      setTimeout(() => {
        this.allClearBannerEl.classList.add('hidden');
      }, 2500);
    }
  }

  // --- 4. Piece Placement & Line Blast ---
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

      // Collect cells to clear & count diamonds
      const cellsToClear = new Set();
      let diamondsBlasted = 0;

      fullRows.forEach(r => {
        for (let c = 0; c < this.boardSize; c++) {
          cellsToClear.add(`${r},${c}`);
          if (this.board[r][c] && this.board[r][c].hasDiamond) {
            diamondsBlasted++;
          }
        }
      });
      fullCols.forEach(c => {
        for (let r = 0; r < this.boardSize; r++) {
          cellsToClear.add(`${r},${c}`);
          if (this.board[r][c] && this.board[r][c].hasDiamond) {
            diamondsBlasted++;
          }
        }
      });

      // Update adventure mode objectives
      if (this.mode === 'adventure') {
        if (this.levelObjective.type === 'diamonds' && diamondsBlasted > 0) {
          this.objectiveProgress += diamondsBlasted;
          this.updateObjectiveUI();
          if (this.objectiveProgress >= this.levelObjective.target) {
            this.triggerLevelWin();
          }
        } else if (this.levelObjective.type === 'lines') {
          this.objectiveProgress += totalLines;
          this.updateObjectiveUI();
          if (this.objectiveProgress >= this.levelObjective.target) {
            this.triggerLevelWin();
          }
        }
      }

      // Animate clearing cells & particles
      cellsToClear.forEach(coord => {
        const [r, c] = coord.split(',').map(Number);
        const cell = this.getCellEl(r, c);
        if (cell) {
          cell.classList.add('clearing');
          const rect = cell.getBoundingClientRect();
          fireBlockBlast(rect.left + rect.width / 2, rect.top + rect.height / 2, '#ff4757');
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

        // 🌟 CHECK PERFECT CLEAR (ALL BLOCKS EMPTY -> CHANGE THEME!)
        const isBoardCleaned = this.board.every(row => row.every(val => val === null));
        if (isBoardCleaned) {
          this.handlePerfectClear();
        }

        this.checkGameOver();
      }, 350);
    } else {
      this.combo = 0;
      this.updateComboUI();
    }
  }

  handlePerfectClear() {
    // Extra bonus points
    this.addScore(1000, null, true, '🌟 ALL CLEAR! +1000');
    sound.playComboFanfare();
    fireVictoryCelebration();

    // Change theme dynamically!
    this.switchNextTheme();
  }

  // --- 5. Adventure Map & Trophies Logic (500 Levels across 5 Trophies) ---
  setupAdventureMap() {
    this.renderTrophyTabs();
    this.renderLevelGrid(this.selectedTrophyIndex);
  }

  renderTrophyTabs() {
    if (!this.trophyTabsContainer) return;
    this.trophyTabsContainer.innerHTML = '';

    TROPHIES.forEach((trophy, idx) => {
      const tabBtn = document.createElement('button');
      tabBtn.className = `trophy-tab ${idx === this.selectedTrophyIndex ? 'active' : ''}`;
      tabBtn.innerHTML = `${trophy.icon} Trophy ${trophy.id}<span class="tab-sub">${trophy.startLevel}-${trophy.endLevel}</span>`;
      tabBtn.addEventListener('click', () => {
        sound.playClick();
        this.selectedTrophyIndex = idx;
        this.renderTrophyTabs();
        this.renderLevelGrid(idx);
      });
      this.trophyTabsContainer.appendChild(tabBtn);
    });

    const activeTrophy = TROPHIES[this.selectedTrophyIndex];
    if (this.trophyIconEl) this.trophyIconEl.textContent = activeTrophy.icon;
    if (this.trophyNameEl) this.trophyNameEl.textContent = activeTrophy.name;
  }

  renderLevelGrid(trophyIndex) {
    if (!this.levelsPyramidGrid) return;
    this.levelsPyramidGrid.innerHTML = '';
    const trophy = TROPHIES[trophyIndex];

    for (let lvl = trophy.startLevel; lvl <= trophy.endLevel; lvl++) {
      const cell = document.createElement('div');
      cell.className = 'level-cell';
      cell.textContent = lvl;

      const isUnlocked = adventure.isLevelUnlocked(lvl);
      const isCompleted = adventure.levelStars[lvl] !== undefined;

      if (isCompleted) {
        cell.classList.add('completed');
      } else if (isUnlocked) {
        cell.classList.add('unlocked');
      }

      if (lvl === this.selectedLevelOnMap) {
        cell.classList.add('current');
      }

      cell.addEventListener('click', () => {
        if (!isUnlocked) return;
        sound.playClick();
        this.selectedLevelOnMap = lvl;
        this.renderLevelGrid(trophyIndex);
        if (this.mapPlayLevelBtn) {
          this.mapPlayLevelBtn.textContent = `Level ${lvl}`;
        }
      });

      this.levelsPyramidGrid.appendChild(cell);
    }

    if (this.mapPlayLevelBtn) {
      this.mapPlayLevelBtn.textContent = `Level ${this.selectedLevelOnMap}`;
    }
  }

  triggerLevelWin() {
    adventure.completeLevel(this.currentLevelNum, this.score);
    sound.playComboFanfare();
    fireVictoryCelebration();

    setTimeout(() => {
      if (this.levelWinModal) {
        this.levelWinModal.classList.remove('hidden');
      }
    }, 600);
  }

  // --- 6. Game Over Flow (Image 4) ---
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

    // Populate Game Over screen (Image 4)
    this.deathFinalScoreEl.textContent = this.score;
    this.deathBestScoreEl.textContent = this.bestScore;

    const isNewBest = this.score === this.bestScore && this.score > 0;
    if (isNewBest) {
      this.deathNewRecordEl.classList.remove('hidden');
      fireVictoryCelebration();
    } else {
      this.deathNewRecordEl.classList.add('hidden');
    }

    setTimeout(() => {
      this.showScreen('screen-game-over');
    }, 500);
  }

  // --- 7. Event Listeners ---
  setupEventListeners() {
    // Mode Buttons on Homepage (Image 1)
    document.getElementById('btn-mode-classic').addEventListener('click', () => {
      sound.playClick();
      this.startClassicMode();
    });

    document.getElementById('btn-mode-adventure').addEventListener('click', () => {
      sound.playClick();
      this.selectedLevelOnMap = adventure.unlockedLevel;
      this.selectedTrophyIndex = Math.min(4, Math.floor((this.selectedLevelOnMap - 1) / 100));
      this.renderTrophyTabs();
      this.renderLevelGrid(this.selectedTrophyIndex);
      this.showScreen('screen-adventure-map');
    });

    // Adventure Map Navigation (Image 5)
    document.getElementById('map-back-btn').addEventListener('click', () => {
      sound.playClick();
      this.showScreen('screen-home');
    });

    document.getElementById('map-play-level-btn').addEventListener('click', () => {
      sound.playClick();
      this.startAdventureLevel(this.selectedLevelOnMap);
    });

    // In-Game Back & Settings Buttons
    document.getElementById('game-back-btn').addEventListener('click', () => {
      sound.playClick();
      if (this.mode === 'adventure') {
        this.showScreen('screen-adventure-map');
      } else {
        this.showScreen('screen-home');
      }
    });

    document.getElementById('game-settings-btn').addEventListener('click', () => {
      sound.playClick();
      this.settingsModal.classList.remove('hidden');
    });

    document.getElementById('home-settings-btn').addEventListener('click', () => {
      sound.playClick();
      this.settingsModal.classList.remove('hidden');
    });

    // Settings Modal (Image 2)
    document.getElementById('settings-close-btn').addEventListener('click', () => {
      sound.playClick();
      this.settingsModal.classList.add('hidden');
    });

    const soundToggle = document.getElementById('settings-sound-btn');
    soundToggle.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      soundToggle.classList.toggle('muted', isMuted);
      document.getElementById('sound-icon-display').textContent = isMuted ? '🔇' : '🔊';
      sound.playClick();
    });

    const bgmToggle = document.getElementById('settings-bgm-btn');
    bgmToggle.addEventListener('click', () => {
      sound.playClick();
      bgmToggle.classList.toggle('muted');
    });

    document.getElementById('settings-trophies-btn').addEventListener('click', () => {
      sound.playClick();
      this.settingsModal.classList.add('hidden');
      this.showScreen('screen-adventure-map');
    });

    document.getElementById('settings-theme-btn').addEventListener('click', () => {
      sound.playClick();
      this.switchNextTheme();
    });

    // Game Over Actions (Image 4)
    this.deathRestartBtn.addEventListener('click', () => {
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
      if (this.currentLevelNum < 500) {
        this.startAdventureLevel(this.currentLevelNum + 1);
      } else {
        this.showScreen('screen-adventure-map');
      }
    });

    document.getElementById('win-map-btn').addEventListener('click', () => {
      sound.playClick();
      this.levelWinModal.classList.add('hidden');
      this.renderLevelGrid(this.selectedTrophyIndex);
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

  // --- Interaction & Drag Handling ---
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

    if (!drag.isDragging && Math.hypot(dx, dy) > 6) {
      drag.isDragging = true;
      this.selectedSlotIndex = null;
      this.traySlots.forEach(s => s.classList.remove('selected'));
      this.traySlots[drag.slotIndex].style.opacity = '0.3';
      this.createDragAvatar(drag.piece);
    }

    if (drag.isDragging) {
      e.preventDefault();
      const touchOffsetY = drag.isTouch ? -65 : 0;
      const posX = e.clientX;
      const posY = e.clientY + touchOffsetY;

      this.updateDragAvatarPosition(posX, posY);
      this.updateBoardGhost(posX, posY, drag.piece);
    }
  }

  handleGlobalPointerUp(e) {
    if (!this.activeDrag) return;

    const drag = this.activeDrag;
    this.traySlots[drag.slotIndex].style.opacity = '1';

    if (drag.isDragging) {
      const touchOffsetY = drag.isTouch ? -65 : 0;
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
    this.dragAvatarEl.style.left = `${x}px`;
    this.dragAvatarEl.style.top = `${y}px`;
  }

  clearDragAvatar() {
    this.dragAvatarEl.classList.add('hidden');
    this.dragAvatarEl.innerHTML = '';
  }

  calculateBoardGridCoords(x, y, piece) {
    const boardRect = this.boardEl.getBoundingClientRect();
    if (
      x < boardRect.left - 30 ||
      x > boardRect.right + 30 ||
      y < boardRect.top - 30 ||
      y > boardRect.bottom + 30
    ) {
      return null;
    }

    const padding = 8;
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
