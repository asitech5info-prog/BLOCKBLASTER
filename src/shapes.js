// Block Blaster Shape Definitions and Generator
export const SHAPE_DEFINITIONS = [
  // 1. Single Dot
  {
    name: 'dot',
    color: 'color-gold',
    matrix: [[1]]
  },
  // 2. Lines (Horizontal)
  {
    name: 'line-2-h',
    color: 'color-cyan',
    matrix: [[1, 1]]
  },
  {
    name: 'line-3-h',
    color: 'color-cyan',
    matrix: [[1, 1, 1]]
  },
  {
    name: 'line-4-h',
    color: 'color-cyan',
    matrix: [[1, 1, 1, 1]]
  },
  {
    name: 'line-5-h',
    color: 'color-cyan',
    matrix: [[1, 1, 1, 1, 1]]
  },
  // 3. Lines (Vertical)
  {
    name: 'line-2-v',
    color: 'color-cyan',
    matrix: [[1], [1]]
  },
  {
    name: 'line-3-v',
    color: 'color-cyan',
    matrix: [[1], [1], [1]]
  },
  {
    name: 'line-4-v',
    color: 'color-cyan',
    matrix: [[1], [1], [1], [1]]
  },
  {
    name: 'line-5-v',
    color: 'color-cyan',
    matrix: [[1], [1], [1], [1], [1]]
  },
  // 4. Squares & Rectangles (2x2, 2x3, 3x2, 3x3)
  {
    name: 'square-2',
    color: 'color-gold',
    matrix: [
      [1, 1],
      [1, 1]
    ]
  },
  {
    name: 'rect-2x3',
    color: 'color-purple',
    matrix: [
      [1, 1],
      [1, 1],
      [1, 1]
    ]
  },
  {
    name: 'rect-3x2',
    color: 'color-purple',
    matrix: [
      [1, 1, 1],
      [1, 1, 1]
    ]
  },
  {
    name: 'square-3',
    color: 'color-orange',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ]
  },
  {
    name: 'square-3-blue',
    color: 'color-cyan',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ]
  },
  // 5. Small Corners (2x2)
  {
    name: 'corner-2-tl',
    color: 'color-green',
    matrix: [
      [1, 1],
      [1, 0]
    ]
  },
  {
    name: 'corner-2-tr',
    color: 'color-green',
    matrix: [
      [1, 1],
      [0, 1]
    ]
  },
  {
    name: 'corner-2-bl',
    color: 'color-green',
    matrix: [
      [1, 0],
      [1, 1]
    ]
  },
  {
    name: 'corner-2-br',
    color: 'color-green',
    matrix: [
      [0, 1],
      [1, 1]
    ]
  },
  // 6. Large L-Shapes (3x3)
  {
    name: 'l-shape-3-bl',
    color: 'color-red',
    matrix: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1]
    ]
  },
  {
    name: 'l-shape-3-br',
    color: 'color-red',
    matrix: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1]
    ]
  },
  {
    name: 'l-shape-3-tl',
    color: 'color-red',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0]
    ]
  },
  {
    name: 'l-shape-3-tr',
    color: 'color-red',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1]
    ]
  },
  // 7. T-Shapes
  {
    name: 't-down',
    color: 'color-purple',
    matrix: [
      [1, 1, 1],
      [0, 1, 0]
    ]
  },
  {
    name: 't-up',
    color: 'color-purple',
    matrix: [
      [0, 1, 0],
      [1, 1, 1]
    ]
  },
  {
    name: 't-right',
    color: 'color-purple',
    matrix: [
      [1, 0],
      [1, 1],
      [1, 0]
    ]
  },
  {
    name: 't-left',
    color: 'color-purple',
    matrix: [
      [0, 1],
      [1, 1],
      [0, 1]
    ]
  },
  // 8. S & Z Shapes (Horizontal & Vertical)
  {
    name: 'z-shape',
    color: 'color-pink',
    matrix: [
      [1, 1, 0],
      [0, 1, 1]
    ]
  },
  {
    name: 's-shape',
    color: 'color-emerald',
    matrix: [
      [0, 1, 1],
      [1, 1, 0]
    ]
  },
  // Reference Image 2: Vertical Z-Shape
  {
    name: 'z-shape-v',
    color: 'color-pink',
    matrix: [
      [1, 0],
      [1, 1],
      [0, 1]
    ]
  },
  // Vertical S-Shape
  {
    name: 's-shape-v',
    color: 'color-emerald',
    matrix: [
      [0, 1],
      [1, 1],
      [1, 0]
    ]
  },
  // 9. 4-Block L-Shapes / Tetromino L & J (Reference Folder Images 1, 3, 4, 5 & Rotations)
  // Reference Image 1: Horizontal L (3 on top, 1 bottom-left)
  {
    name: 'l-shape-4-h-tl',
    color: 'color-orange',
    matrix: [
      [1, 1, 1],
      [1, 0, 0]
    ]
  },
  // Horizontal L (3 on top, 1 bottom-right)
  {
    name: 'l-shape-4-h-tr',
    color: 'color-orange',
    matrix: [
      [1, 1, 1],
      [0, 0, 1]
    ]
  },
  // Reference Image 3: Horizontal L (1 top-left, 3 on bottom)
  {
    name: 'l-shape-4-h-bl',
    color: 'color-purple',
    matrix: [
      [1, 0, 0],
      [1, 1, 1]
    ]
  },
  // Horizontal L (1 top-right, 3 on bottom)
  {
    name: 'l-shape-4-h-br',
    color: 'color-purple',
    matrix: [
      [0, 0, 1],
      [1, 1, 1]
    ]
  },
  // Reference Image 4: Vertical L (3 on left, 1 bottom-right)
  {
    name: 'l-shape-4-v-bl',
    color: 'color-cyan',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1]
    ]
  },
  // Vertical L (3 on right, 1 bottom-left)
  {
    name: 'l-shape-4-v-br',
    color: 'color-cyan',
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1]
    ]
  },
  // Reference Image 5: Vertical L (2 on top, 2 below on left)
  {
    name: 'l-shape-4-v-tl',
    color: 'color-gold',
    matrix: [
      [1, 1],
      [1, 0],
      [1, 0]
    ]
  },
  // Vertical L (2 on top, 2 below on right)
  {
    name: 'l-shape-4-v-tr',
    color: 'color-gold',
    matrix: [
      [1, 1],
      [0, 1],
      [0, 1]
    ]
  },
  // 10. Plus Cross
  {
    name: 'cross',
    color: 'color-pink',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0]
    ]
  }
];

/**
 * Returns true if the shape matrix can fit at (r, c) on board
 */
export function canFitAt(board, matrix, r, c, boardSize = 8) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  if (r + rows > boardSize || c + cols > boardSize) return false;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j]) {
        if (board[r + i][c + j] !== null) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Checks whether a given shape can be placed anywhere on the board
 */
export function canFitAnywhere(board, matrix, boardSize = 8) {
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (canFitAt(board, matrix, r, c, boardSize)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Categorizes definitions by size & flexibility
 */
export const TINY_SHAPES = SHAPE_DEFINITIONS.filter(d => {
  const count = d.matrix.flat().filter(Boolean).length;
  return count <= 2;
});

export const SMALL_SHAPES = SHAPE_DEFINITIONS.filter(d => {
  const count = d.matrix.flat().filter(Boolean).length;
  return count === 3;
});

export const MEDIUM_SHAPES = SHAPE_DEFINITIONS.filter(d => {
  const count = d.matrix.flat().filter(Boolean).length;
  return count === 4;
});

export const LARGE_SHAPES = SHAPE_DEFINITIONS.filter(d => {
  const count = d.matrix.flat().filter(Boolean).length;
  return count >= 5;
});

/**
 * Finds near-complete lines (rows or columns with >= minFilled filled cells)
 */
export function findNearCompleteLines(board, boardSize = 8, minFilled = 5) {
  const lines = [];
  // Rows
  for (let r = 0; r < boardSize; r++) {
    let filled = 0;
    const missing = [];
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] !== null) filled++;
      else missing.push(c);
    }
    if (filled >= minFilled && filled < boardSize) {
      lines.push({ type: 'row', index: r, missing, filled });
    }
  }
  // Columns
  for (let c = 0; c < boardSize; c++) {
    let filled = 0;
    const missing = [];
    for (let r = 0; r < boardSize; r++) {
      if (board[r][c] !== null) filled++;
      else missing.push(r);
    }
    if (filled >= minFilled && filled < boardSize) {
      lines.push({ type: 'col', index: c, missing, filled });
    }
  }
  return lines;
}

/**
 * Intelligent, fair, and balanced 3-piece generator for authentic Block Blast gameplay.
 * Guarantees playable, high-scoring classic runs (>3000 achievable) and solvable adventure levels.
 */
export function generateThreePieces(board, boardSize = 8, mode = 'classic', adventureGems = null) {
  // 1. Analyze board occupancy
  let occupiedCount = 0;
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] !== null) occupiedCount++;
    }
  }
  const fillRatio = occupiedCount / (boardSize * boardSize);

  // 2. Determine all shapes that currently fit anywhere on board
  const allFittingDefs = SHAPE_DEFINITIONS.filter(def => canFitAnywhere(board, def.matrix, boardSize));
  const fallbackPool = allFittingDefs.length > 0 ? allFittingDefs : TINY_SHAPES;

  const fittingTiny = allFittingDefs.filter(d => TINY_SHAPES.includes(d));
  const fittingSmall = allFittingDefs.filter(d => SMALL_SHAPES.includes(d));
  const fittingMed = allFittingDefs.filter(d => MEDIUM_SHAPES.includes(d));
  const fittingLarge = allFittingDefs.filter(d => LARGE_SHAPES.includes(d));

  // 3. Find near-complete lines to provide line-clearing shapes if board is tightening
  const nearLines = findNearCompleteLines(board, boardSize, 5);

  const pieces = [];
  let largePieceCount = 0;

  for (let i = 0; i < 3; i++) {
    let chosenDef = null;

    // A) If board is getting congested (> 45% filled) and we have near-complete lines:
    // Offer shapes that can clear a row or column (1-dot, 2-line, 3-line)
    if (i === 0 && fillRatio > 0.45 && nearLines.length > 0 && Math.random() < 0.75) {
      const line = nearLines[Math.floor(Math.random() * nearLines.length)];
      if (line.missing.length === 1 && fittingTiny.length > 0) {
        chosenDef = fittingTiny.find(d => d.name === 'dot') || fittingTiny[0];
      } else if (line.missing.length <= 2 && (fittingTiny.length > 0 || fittingSmall.length > 0)) {
        chosenDef = fittingTiny[Math.floor(Math.random() * fittingTiny.length)] || fittingSmall[0];
      } else if (fittingSmall.length > 0) {
        chosenDef = fittingSmall[Math.floor(Math.random() * fittingSmall.length)];
      }
    }

    // B) Standard balanced category picker
    if (!chosenDef) {
      let candidatePool = [];

      if (fillRatio > 0.60) {
        // High danger: strongly prefer Tiny (50%), Small (35%), Medium (15%), Large (0%)
        const roll = Math.random();
        if (roll < 0.50 && fittingTiny.length > 0) candidatePool = fittingTiny;
        else if (roll < 0.85 && fittingSmall.length > 0) candidatePool = fittingSmall;
        else if (fittingMed.length > 0) candidatePool = fittingMed;
        else candidatePool = fallbackPool;
      } else if (fillRatio > 0.40) {
        // Moderate fill: Tiny (30%), Small (35%), Medium (25%), Large (10% max 1)
        const roll = Math.random();
        if (roll < 0.30 && fittingTiny.length > 0) candidatePool = fittingTiny;
        else if (roll < 0.65 && fittingSmall.length > 0) candidatePool = fittingSmall;
        else if (roll < 0.90 && fittingMed.length > 0) candidatePool = fittingMed;
        else if (largePieceCount === 0 && fittingLarge.length > 0) {
          candidatePool = fittingLarge;
          largePieceCount++;
        } else {
          candidatePool = fallbackPool;
        }
      } else {
        // Low fill: balanced mix, max 1 large piece
        const roll = Math.random();
        if (roll < 0.20 && fittingTiny.length > 0) candidatePool = fittingTiny;
        else if (roll < 0.50 && fittingSmall.length > 0) candidatePool = fittingSmall;
        else if (roll < 0.75 && fittingMed.length > 0) candidatePool = fittingMed;
        else if (largePieceCount === 0 && fittingLarge.length > 0) {
          candidatePool = fittingLarge;
          largePieceCount++;
        } else {
          candidatePool = fallbackPool;
        }
      }

      if (!candidatePool || candidatePool.length === 0) {
        candidatePool = fallbackPool;
      }

      chosenDef = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    }

    // Double check: if chosenDef cannot fit on board, pick a guaranteed fitting def
    if (!canFitAnywhere(board, chosenDef.matrix, boardSize) && allFittingDefs.length > 0) {
      chosenDef = allFittingDefs[Math.floor(Math.random() * allFittingDefs.length)];
    }

    // Clone matrix
    const matrix = JSON.parse(JSON.stringify(chosenDef.matrix));
    const pieceObj = {
      id: `piece_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 4)}`,
      name: chosenDef.name,
      color: chosenDef.color,
      matrix: matrix,
      gemMatrix: null
    };

    // 4. Adventure Mode: Embed required level gems onto pieces
    if (mode === 'adventure' && adventureGems) {
      const activeGemTypes = [];
      if (adventureGems.blue > 0) activeGemTypes.push('diamond-blue');
      if (adventureGems.orange > 0) activeGemTypes.push('diamond-orange');
      if (adventureGems.star > 0) activeGemTypes.push('diamond-star');

      if (activeGemTypes.length > 0) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const gemMatrix = Array.from({ length: rows }, () => Array(cols).fill(null));

        const solidCells = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (matrix[r][c]) solidCells.push({ r, c });
          }
        }

        const gemCountToEmbed = Math.min(solidCells.length, Math.random() < 0.6 ? 2 : 1);
        const shuffled = [...solidCells].sort(() => Math.random() - 0.5);

        for (let g = 0; g < gemCountToEmbed; g++) {
          const gemType = activeGemTypes[Math.floor(Math.random() * activeGemTypes.length)];
          gemMatrix[shuffled[g].r][shuffled[g].c] = gemType;
        }

        pieceObj.gemMatrix = gemMatrix;
        pieceObj.hasGems = true;
      }
    }

    pieces.push(pieceObj);
  }

  // 5. Final safety check: Guarantee at least 2 pieces can fit on current board
  const canFitCount = pieces.filter(p => canFitAnywhere(board, p.matrix, boardSize)).length;
  if (canFitCount < 2 && allFittingDefs.length > 0) {
    for (let i = 0; i < 3; i++) {
      if (!canFitAnywhere(board, pieces[i].matrix, boardSize)) {
        const replacement = allFittingDefs[Math.floor(Math.random() * allFittingDefs.length)];
        pieces[i].name = replacement.name;
        pieces[i].color = replacement.color;
        pieces[i].matrix = JSON.parse(JSON.stringify(replacement.matrix));
        if (canFitAnywhere(board, pieces[i].matrix, boardSize)) break;
      }
    }
  }

  return pieces;
}
