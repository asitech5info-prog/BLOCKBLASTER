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
  // 8. S & Z Shapes
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
  // 9. Plus Cross
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
 * Generates 3 pieces, ensuring that at least one of them can fit on the current board
 */
export function generateThreePieces(board, boardSize = 8) {
  const pieces = [];

  // Pick pieces
  for (let i = 0; i < 3; i++) {
    const randomDef = SHAPE_DEFINITIONS[Math.floor(Math.random() * SHAPE_DEFINITIONS.length)];
    pieces.push({
      id: `piece_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 4)}`,
      name: randomDef.name,
      color: randomDef.color,
      matrix: JSON.parse(JSON.stringify(randomDef.matrix))
    });
  }

  // Verify at least one piece can fit
  const canAnyFit = pieces.some(p => canFitAnywhere(board, p.matrix, boardSize));
  if (!canAnyFit) {
    // Find all shapes that CAN fit on the current board
    const fittingDefs = SHAPE_DEFINITIONS.filter(def => canFitAnywhere(board, def.matrix, boardSize));
    if (fittingDefs.length > 0) {
      const luckyDef = fittingDefs[Math.floor(Math.random() * fittingDefs.length)];
      pieces[0] = {
        id: `piece_${Date.now()}_0_${Math.random().toString(36).substr(2, 4)}`,
        name: luckyDef.name,
        color: luckyDef.color,
        matrix: JSON.parse(JSON.stringify(luckyDef.matrix))
      };
    }
  }

  return pieces;
}
