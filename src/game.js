import { SHAPE_DEFINITIONS, canFitAt, canFitAnywhere, generateThreePieces } from './shapes.js';
import { sound } from './audio.js';
import { fireBlockBlast, fireVictoryCelebration } from './particles.js';

export class BlockBlasterGame {
  constructor() {
    this.boardSize = 8;
    this.board = Array.from({ length: this.boardSize }, () => Array(this.boardSize).fill(null));
    this.currentPieces = [null, null, null];
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('block_blaster_best') || '0', 10);
    this.combo = 0;
    this.isGameOver = false;

    // Drag / Touch State
    this.activeDrag = null;
    this.selectedSlotIndex = null;

    // DOM Elements
    this.boardEl = document.getElementById('game-board');
    this.traySlots = document.querySelectorAll('.tray-slot');
    this.currentScoreEl = document.getElementById('current-score');
    this.bestScoreEl = document.getElementById('best-score');
    this.comboBadgeEl = document.getElementById('combo-badge');
    this.comboTextEl = document.getElementById('combo-text');
    this.dragAvatarEl = document.getElementById('drag-avatar');
    this.floaterContainerEl = document.getElementById('floater-container');
    this.gameOverModalEl = document.getElementById('game-over-modal');
    this.modalFinalScoreEl = document.getElementById('modal-final-score');
    this.newHighScoreBannerEl = document.getElementById('new-high-score-banner');
    this.modalRestartBtn = document.getElementById('modal-restart-btn');
    this.restartBtn = document.getElementById('theme-btn');
    this.soundBtn = document.getElementById('sound-btn');
  }

  init() {
    this.createBoardGrid();
    this.updateScoreUI();
    this.setupEventListeners();
    this.startNewGame();
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

  startNewGame() {
    this.board = Array.from({ length: this.boardSize }, () => Array(this.boardSize).fill(null));
    this.score = 0;
    this.combo = 0;
    this.isGameOver = false;
    this.selectedSlotIndex = null;

    this.renderBoard();
    this.updateScoreUI();
    this.updateComboUI();
    this.hideGameOverModal();
    this.spawnNewPieces();
  }

  renderBoard() {
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const cell = this.getCellEl(r, c);
        if (!cell) continue;

        const val = this.board[r][c];
        // Reset classes
        cell.className = 'cell';
        if (val) {
          cell.classList.add('filled', val);
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
    this.currentScoreEl.textContent = this.score;
    this.bestScoreEl.textContent = this.bestScore;
  }

  bumpScoreUI() {
    this.currentScoreEl.classList.remove('bump');
    void this.currentScoreEl.offsetWidth; // Trigger reflow
    this.currentScoreEl.classList.add('bump');
    setTimeout(() => {
      this.currentScoreEl.classList.remove('bump');
    }, 200);
  }

  addScore(pts, floaterPos = null, isCombo = false, textOverride = null) {
    this.score += pts;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('block_blaster_best', String(this.bestScore));
    }
    this.updateScoreUI();
    this.bumpScoreUI();

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

  updateComboUI() {
    if (this.combo >= 1) {
      this.comboBadgeEl.classList.remove('hidden');
      this.comboTextEl.textContent = `COMBO x${this.combo}`;
    } else {
      this.comboBadgeEl.classList.add('hidden');
    }
  }

  // --- Interaction & Drag and Drop Handling ---
  setupEventListeners() {
    // Sound Toggle
    this.soundBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      this.soundBtn.querySelector('.sound-icon').textContent = isMuted ? '🔇' : '🔊';
      sound.playClick();
    });

    // Top Restart Button
    this.restartBtn.addEventListener('click', () => {
      sound.playClick();
      this.startNewGame();
    });

    // Modal Restart Button
    this.modalRestartBtn.addEventListener('click', () => {
      sound.playClick();
      this.startNewGame();
    });

    // Setup Tray Pointer Events (Mouse, Touch, Stylus)
    this.traySlots.forEach((slot, index) => {
      slot.addEventListener('pointerdown', (e) => this.handleTrayPointerDown(e, index));
      slot.addEventListener('click', (e) => this.handleTrayClick(e, index));
    });

    // Board Pointer & Click Events
    this.boardEl.addEventListener('click', (e) => this.handleBoardClick(e));

    // Global Pointer Move & Up (for smooth drag)
    window.addEventListener('pointermove', (e) => this.handleGlobalPointerMove(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.handleGlobalPointerUp(e));
    window.addEventListener('pointercancel', (e) => this.handleGlobalPointerCancel(e));
  }

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

    // Prevent scrolling during drag
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

    // Trigger drag mode after slight movement
    if (!drag.isDragging && Math.hypot(dx, dy) > 6) {
      drag.isDragging = true;
      this.selectedSlotIndex = null;
      this.traySlots.forEach(s => s.classList.remove('selected'));
      this.traySlots[drag.slotIndex].style.opacity = '0.3';
      this.createDragAvatar(drag.piece);
    }

    if (drag.isDragging) {
      e.preventDefault();
      // On touch, offset vertical position so player's finger doesn't obscure the placement preview
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
    const innerHeight = boardRect.height - padding * 2;
    const cellSize = innerWidth / this.boardSize;

    const rows = piece.matrix.length;
    const cols = piece.matrix[0].length;

    // Center the piece matrix around the pointer
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

  // --- Place Piece & Clear Lines ---
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

    // Reward placement points (10 pts per block placed)
    const boardRect = this.boardEl.getBoundingClientRect();
    const placementPos = {
      x: boardRect.left + (startC + cols / 2) * (boardRect.width / this.boardSize),
      y: boardRect.top + (startR + rows / 2) * (boardRect.height / this.boardSize)
    };
    this.addScore(blockCount * 10, placementPos);

    // Consume piece from tray slot
    this.currentPieces[slotIndex] = null;
    this.traySlots[slotIndex].innerHTML = '';

    // Check lines
    this.checkAndClearLines();

    // If all tray slots are empty, generate 3 new pieces
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

      // Trigger line blast animation & audio
      sound.playClear(this.combo);
      if (this.combo >= 3) {
        sound.playComboFanfare();
      }

      // Collect unique cells to clear
      const cellsToClear = new Set();
      fullRows.forEach(r => {
        for (let c = 0; c < this.boardSize; c++) cellsToClear.add(`${r},${c}`);
      });
      fullCols.forEach(c => {
        for (let r = 0; r < this.boardSize; r++) cellsToClear.add(`${r},${c}`);
      });

      // Animate clearing cells & trigger particle blasts
      cellsToClear.forEach(coord => {
        const [r, c] = coord.split(',').map(Number);
        const cell = this.getCellEl(r, c);
        if (cell) {
          cell.classList.add('clearing');
          const rect = cell.getBoundingClientRect();
          fireBlockBlast(rect.left + rect.width / 2, rect.top + rect.height / 2, '#ff4757');
        }
      });

      // Calculate score bonus:
      // Base: 100 points per line
      // Multi-line bonus: 2 lines = +300, 3 lines = +600, etc.
      // Combo multiplier: combo * 50
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

      // Remove cells from board state after animation completes
      setTimeout(() => {
        cellsToClear.forEach(coord => {
          const [r, c] = coord.split(',').map(Number);
          this.board[r][c] = null;
        });
        this.renderBoard();
        this.checkGameOver();
      }, 350);
    } else {
      // No lines cleared in this move -> reset combo
      this.combo = 0;
      this.updateComboUI();
    }
  }

  checkGameOver() {
    const remainingPieces = this.currentPieces.filter(p => p !== null);
    if (remainingPieces.length === 0) return;

    // Check if at least one remaining piece can fit anywhere on current board
    const canAnyFit = remainingPieces.some(p => canFitAnywhere(this.board, p.matrix, this.boardSize));

    if (!canAnyFit) {
      this.triggerGameOver();
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    sound.playGameOver();

    const isNewHigh = this.score === this.bestScore && this.score > 0;
    this.modalFinalScoreEl.textContent = this.score;

    if (isNewHigh) {
      this.newHighScoreBannerEl.classList.remove('hidden');
      fireVictoryCelebration();
    } else {
      this.newHighScoreBannerEl.classList.add('hidden');
    }

    setTimeout(() => {
      this.gameOverModalEl.classList.remove('hidden');
    }, 600);
  }

  hideGameOverModal() {
    this.gameOverModalEl.classList.add('hidden');
    this.newHighScoreBannerEl.classList.add('hidden');
  }
}
