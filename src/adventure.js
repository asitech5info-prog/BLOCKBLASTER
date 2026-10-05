// Adventure Mode Manager for Block Blaster
// 96-Level Character/Trophy Silhouette Map & Multi-Objective System

export const ADVENTURE_SILHOUETTE_ROWS = [
  [94, 95, 96],
  [88, 89, 90, 91, 92, 93],
  [81, 82, 83, 84, 85, 86, 87],
  [73, 74, 75, 76, 77, 78, 79, 80],
  [65, 66, 67, 68, 69, 70, 71, 72],
  [56, 57, 58, 59, 60, 61, 62, 63, 64],
  [48, 49, 50, 51, 52, 53, 54, 55],
  [41, 42, 43, 44, 45, 46, 47],
  [35, 36, 37, 38, 39, 40],
  [29, 30, 31, 32, 33, 34],
  [21, 22, 23, 24, 25, 26, 27, 28],
  [12, 13, 14, 15, 16, 17, 18, 19, 20],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
];

export const TROPHIES = [
  { id: 1, name: "Adventure Champion Trophy", icon: "🏆", startLevel: 1, endLevel: 96, theme: "theme-blue" }
];

export class AdventureManager {
  constructor() {
    this.unlockedLevel = parseInt(localStorage.getItem('bb_unlocked_level') || '1', 10);
    this.currentLevel = parseInt(localStorage.getItem('bb_current_level') || '1', 10);
    this.levelStars = JSON.parse(localStorage.getItem('bb_level_stars') || '{}');
  }

  getLevelData(levelNum) {
    // Determine level objective: alternate between 'score' and 'diamonds'
    // Odd levels (or level 1, 2, 3, 5) can be score target levels, level 4 and others have diamond objectives
    const isScoreLevel = (levelNum % 2 !== 0) || levelNum === 2;
    const type = isScoreLevel ? 'score' : 'diamonds';

    // Target calculation: realistic and fun
    let target = 0;
    if (type === 'score') {
      // e.g. Level 1: 300, Level 2: 368 (like in reference picture!), Level 3: 500, etc.
      if (levelNum === 1) target = 300;
      else if (levelNum === 2) target = 368;
      else target = 300 + levelNum * 45;
    } else {
      // Diamond collection target
      target = Math.min(60, 15 + Math.floor(levelNum * 2.5));
    }

    // Initial board layout for adventure level
    const initialBoard = Array.from({ length: 8 }, () => Array(8).fill(null));
    const diamondPositions = [];

    // Pre-populate board for interesting puzzle layouts
    const seed = levelNum * 31;
    const blockTypes = ['diamond-blue', 'diamond-orange', 'diamond-star', 'color-cyan', 'color-gold', 'color-purple'];

    // Generate puzzle patterns based on level
    if (type === 'diamonds' || levelNum >= 2) {
      const patternChoice = levelNum % 4;
      if (patternChoice === 0) {
        // Tree / Anchor shape like WhatsApp Image 4.06.43 AM.jpeg
        const coords = [
          [0, 3], [1, 2], [1, 3], [1, 4], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5],
          [3, 2], [3, 3], [3, 4], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5],
          [5, 0], [5, 1], [5, 2], [5, 4], [5, 5], [5, 6], [6, 3], [7, 3]
        ];
        coords.forEach(([r, c]) => {
          const isDiamond = Math.random() < 0.6;
          const gemType = ['diamond-blue', 'diamond-orange', 'diamond-star'][Math.floor(Math.random() * 3)];
          initialBoard[r][c] = {
            color: isDiamond ? gemType : 'color-gold',
            hasDiamond: isDiamond,
            diamondType: isDiamond ? gemType : null
          };
          if (isDiamond) diamondPositions.push({ r, c });
        });
      } else if (patternChoice === 1) {
        // Wing / Crest shape like WhatsApp Image 4.06.41 AM (2).jpeg
        const coords = [
          [1, 1], [1, 6], [2, 0], [2, 1], [2, 3], [2, 4], [2, 6], [2, 7],
          [3, 0], [3, 1], [3, 3], [3, 4], [3, 6], [3, 7],
          [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6],
          [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6]
        ];
        coords.forEach(([r, c]) => {
          const gemType = ['diamond-blue', 'diamond-orange', 'diamond-star'][(r + c) % 3];
          const isDiamond = (r + c) % 2 === 0;
          initialBoard[r][c] = {
            color: isDiamond ? gemType : 'color-cyan',
            hasDiamond: isDiamond,
            diamondType: isDiamond ? gemType : null
          };
          if (isDiamond) diamondPositions.push({ r, c });
        });
      } else if (patternChoice === 2) {
        // Sprout / Plant shape like WhatsApp Image 4.06.43 AM (2).jpeg
        const coords = [
          [2, 0], [2, 1], [2, 5], [2, 6],
          [3, 0], [3, 1], [3, 2], [3, 4], [3, 5], [3, 6],
          [4, 1], [4, 2], [4, 3], [4, 4],
          [5, 3], [6, 3], [7, 3]
        ];
        coords.forEach(([r, c]) => {
          initialBoard[r][c] = {
            color: 'color-green',
            hasDiamond: false
          };
        });
      } else {
        // Scatter layout
        const count = 12 + (levelNum % 6);
        for (let i = 0; i < count; i++) {
          const r = (seed + i * 3) % 8;
          const c = (seed + i * 5 + 1) % 8;
          if (!initialBoard[r][c]) {
            const isDiamond = i % 2 === 0;
            const gemType = ['diamond-blue', 'diamond-orange', 'diamond-star'][i % 3];
            initialBoard[r][c] = {
              color: isDiamond ? gemType : blockTypes[i % blockTypes.length],
              hasDiamond: isDiamond,
              diamondType: isDiamond ? gemType : null
            };
            if (isDiamond) diamondPositions.push({ r, c });
          }
        }
      }
    }

    return {
      level: levelNum,
      type,
      target,
      initialBoard,
      diamondPositions,
      description: type === 'score'
        ? `Reach ${target} Score`
        : `Collect ${target} Diamonds`
    };
  }

  completeLevel(levelNum, score) {
    this.levelStars[levelNum] = 3;
    localStorage.setItem('bb_level_stars', JSON.stringify(this.levelStars));

    if (levelNum >= this.unlockedLevel && this.unlockedLevel < 96) {
      this.unlockedLevel = levelNum + 1;
      localStorage.setItem('bb_unlocked_level', String(this.unlockedLevel));
    }
    this.currentLevel = Math.min(96, levelNum + 1);
    localStorage.setItem('bb_current_level', String(this.currentLevel));
  }

  isLevelUnlocked(levelNum) {
    return levelNum <= this.unlockedLevel;
  }
}

export const adventure = new AdventureManager();
