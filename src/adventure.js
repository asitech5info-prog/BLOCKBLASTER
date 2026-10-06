// Adventure Mode Manager for Block Blaster
// Authentic handcrafted puzzle layouts & 96-Level progression matching reference screenshots

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

export class AdventureManager {
  constructor() {
    this.unlockedLevel = parseInt(localStorage.getItem('bb_unlocked_level') || '1', 10);
    this.currentLevel = parseInt(localStorage.getItem('bb_current_level') || '1', 10);
    this.levelStars = JSON.parse(localStorage.getItem('bb_level_stars') || '{}');
  }

  getCurrentLevel() {
    return Math.min(96, Math.max(1, this.currentLevel));
  }

  setCurrentLevel(lvl) {
    this.currentLevel = Math.min(96, Math.max(1, lvl));
    localStorage.setItem('bb_current_level', String(this.currentLevel));
  }

  getLevelData(levelNum) {
    const lvl = Math.min(96, Math.max(1, levelNum));
    const initialBoard = Array.from({ length: 8 }, () => Array(8).fill(null));

    // Level 1: Tree / Anchor Shape with 90 Blue Diamonds (WhatsApp Image 2026-10-05 at 10.22.09 AM.jpeg)
    if (lvl === 1) {
      const treeCoords = [
        [0, 3],
        [1, 2], [1, 3], [1, 4],
        [2, 1], [2, 2], [2, 3], [2, 4], [2, 5],
        [3, 2], [3, 3], [3, 4],
        [4, 1], [4, 2], [4, 3], [4, 4], [4, 5],
        [5, 0], [5, 1], [5, 2], [5, 4], [5, 5], [5, 6],
        [6, 3],
        [7, 3]
      ];
      treeCoords.forEach(([r, c]) => {
        initialBoard[r][c] = {
          color: 'color-gold',
          hasDiamond: true,
          diamondType: 'diamond-blue'
        };
      });

      return {
        level: 1,
        type: 'diamonds',
        targetGems: { blue: 90, orange: 0, star: 0 },
        totalTarget: 90,
        initialBoard,
        description: 'Collect 90 Blue Diamonds'
      };
    }

    // Level 2: Wings / Cat Pattern with Red Stars (56) & Orange Pentagons (54) (WhatsApp Image 2026-10-05 at 10.22.09 AM (2).jpeg)
    if (lvl === 2) {
      // Golden outer frame with embedded red and orange gems + purple eyes
      const goldFrame = [
        [0, 0], [0, 7],
        [1, 0], [1, 1], [1, 5], [1, 6], [1, 7],
        [2, 0], [2, 2], [2, 3], [2, 4], [2, 5], [2, 7],
        [3, 0], [3, 7],
        [4, 0], [4, 7],
        [5, 0], [5, 7],
        [6, 1], [6, 2], [6, 5], [6, 6]
      ];
      goldFrame.forEach(([r, c]) => {
        initialBoard[r][c] = { color: 'color-gold', hasDiamond: false };
      });

      // Red star gems
      const redStarCoords = [
        [0, 5], [1, 5], [1, 6], [2, 6], [2, 7], [3, 6]
      ];
      redStarCoords.forEach(([r, c]) => {
        if (r < 8 && c < 8) {
          initialBoard[r][c] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-star' };
        }
      });

      // Orange pentagon gems at bottom
      initialBoard[6][3] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-orange' };
      initialBoard[6][4] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-orange' };

      // Purple eye blocks
      initialBoard[3][2] = { color: 'color-purple', hasDiamond: false };
      initialBoard[3][5] = { color: 'color-purple', hasDiamond: false };

      return {
        level: 2,
        type: 'diamonds',
        targetGems: { blue: 0, orange: 54, star: 56 },
        totalTarget: 110,
        initialBoard,
        description: 'Collect 56 Stars & 54 Pentagons'
      };
    }

    // Level 3: Pillars & Cross Pattern with Red Stars (18) & Orange Pentagons (19) (WhatsApp Image 2026-10-05 at 10.22.10 AM.jpeg)
    if (lvl === 3) {
      // Top corner block
      initialBoard[0][7] = { color: 'color-gold', hasDiamond: false };

      // Left pillar with orange pentagons and green core
      initialBoard[1][0] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-orange' };
      initialBoard[2][0] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-orange' };
      initialBoard[2][1] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-orange' };
      initialBoard[3][0] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-orange' };

      // Green center block
      initialBoard[4][1] = { color: 'color-green', hasDiamond: false };
      initialBoard[5][0] = { color: 'color-green', hasDiamond: false };
      initialBoard[5][2] = { color: 'color-green', hasDiamond: false };
      initialBoard[6][1] = { color: 'color-green', hasDiamond: false };

      // Red star accents on left
      initialBoard[4][0] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-star' };
      initialBoard[4][2] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-star' };
      initialBoard[5][1] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-star' };
      initialBoard[6][0] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-star' };
      initialBoard[6][2] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-star' };

      // Right pillar with orange pentagon & red stars
      initialBoard[2][6] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-orange' };
      initialBoard[3][6] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-star' };
      initialBoard[4][6] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-star' };
      initialBoard[5][6] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-star' };
      initialBoard[6][6] = { color: 'color-gold', hasDiamond: false };

      return {
        level: 3,
        type: 'diamonds',
        targetGems: { blue: 0, orange: 19, star: 18 },
        totalTarget: 37,
        initialBoard,
        description: 'Collect 18 Stars & 19 Pentagons'
      };
    }

    // Level 4: Butterfly / Wings Pattern with 3 Gem Types (WhatsApp Image 2026-10-05 at 10.22.10 AM (1).jpeg)
    if (lvl === 4) {
      // Cyan wing tips
      const cyanWings = [
        [1, 1], [1, 6],
        [2, 0], [2, 1], [2, 6], [2, 7],
        [3, 0], [3, 1], [3, 6], [3, 7],
        [4, 1], [4, 6]
      ];
      cyanWings.forEach(([r, c]) => {
        initialBoard[r][c] = { color: 'color-cyan', hasDiamond: false };
      });

      // Gold center body with orange pentagon and star gems
      initialBoard[2][3] = { color: 'color-gold', hasDiamond: false };
      initialBoard[2][4] = { color: 'color-gold', hasDiamond: false };

      // Gems in center
      initialBoard[3][1] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-blue' };
      initialBoard[3][3] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-orange' };
      initialBoard[3][4] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-star' };
      initialBoard[3][6] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-blue' };

      initialBoard[4][2] = { color: 'color-gold', hasDiamond: false };
      initialBoard[4][3] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-star' };
      initialBoard[4][4] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-orange' };
      initialBoard[4][5] = { color: 'color-gold', hasDiamond: false };

      initialBoard[5][3] = { color: 'color-gold', hasDiamond: false };
      initialBoard[5][4] = { color: 'color-gold', hasDiamond: false };

      // Bottom bar with blue gems & green blocks
      initialBoard[6][1] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-blue' };
      initialBoard[6][2] = { color: 'color-green', hasDiamond: false };
      initialBoard[6][3] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-blue' };
      initialBoard[6][4] = { color: 'color-green', hasDiamond: false };
      initialBoard[6][5] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-blue' };

      return {
        level: 4,
        type: 'diamonds',
        targetGems: { blue: 22, orange: 20, star: 20 },
        totalTarget: 62,
        initialBoard,
        description: 'Collect 22 Diamonds, 20 Pentagons, 20 Stars'
      };
    }

    // Procedural Handcrafted Layouts for Level 5 to 96
    const patternType = lvl % 5;
    const blueGoal = 15 + Math.floor(lvl * 1.5);
    const orangeGoal = 12 + Math.floor(lvl * 1.2);
    const starGoal = lvl % 2 === 0 ? 10 + Math.floor(lvl * 1.1) : 0;

    if (patternType === 0) {
      // Pyramid layout
      for (let r = 2; r <= 6; r++) {
        const start = 4 - (r - 2);
        const end = 3 + (r - 2);
        for (let c = start; c <= end; c++) {
          if (c >= 0 && c < 8) {
            const hasGem = (r + c) % 2 === 0;
            const gem = (c % 2 === 0) ? 'diamond-blue' : 'diamond-orange';
            initialBoard[r][c] = {
              color: hasGem ? 'color-gold' : 'color-cyan',
              hasDiamond: hasGem,
              diamondType: hasGem ? gem : null
            };
          }
        }
      }
    } else if (patternType === 1) {
      // Checkerboard Fortress layout
      for (let r = 1; r < 7; r++) {
        for (let c = 1; c < 7; c++) {
          if ((r === 1 || r === 6 || c === 1 || c === 6 || (r === 3 && c === 3) || (r === 4 && c === 4))) {
            const hasGem = (r + c) % 3 !== 0;
            const gem = (r % 2 === 0) ? 'diamond-blue' : 'diamond-star';
            initialBoard[r][c] = {
              color: 'color-gold',
              hasDiamond: hasGem,
              diamondType: hasGem ? gem : null
            };
          }
        }
      }
    } else if (patternType === 2) {
      // Diamond Ring layout
      const ringCoords = [
        [1, 3], [1, 4],
        [2, 2], [2, 5],
        [3, 1], [3, 6],
        [4, 1], [4, 6],
        [5, 2], [5, 5],
        [6, 3], [6, 4]
      ];
      ringCoords.forEach(([r, c]) => {
        const gem = ((r + c) % 2 === 0) ? 'diamond-orange' : 'diamond-blue';
        initialBoard[r][c] = {
          color: 'color-gold',
          hasDiamond: true,
          diamondType: gem
        };
      });
    } else if (patternType === 3) {
      // Twin Towers layout
      for (let r = 2; r <= 6; r++) {
        initialBoard[r][1] = { color: 'color-gold', hasDiamond: r % 2 === 0, diamondType: 'diamond-blue' };
        initialBoard[r][2] = { color: 'color-cyan', hasDiamond: false };
        initialBoard[r][5] = { color: 'color-cyan', hasDiamond: false };
        initialBoard[r][6] = { color: 'color-gold', hasDiamond: r % 2 === 0, diamondType: 'diamond-star' };
      }
      initialBoard[6][3] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-orange' };
      initialBoard[6][4] = { color: 'color-gold', hasDiamond: true, diamondType: 'diamond-orange' };
    } else {
      // Cross / Star layout
      for (let i = 1; i <= 6; i++) {
        initialBoard[i][3] = { color: 'color-gold', hasDiamond: i % 2 !== 0, diamondType: 'diamond-blue' };
        initialBoard[i][4] = { color: 'color-gold', hasDiamond: i % 2 !== 0, diamondType: 'diamond-orange' };
        initialBoard[3][i] = { color: 'color-gold', hasDiamond: i % 2 === 0, diamondType: 'diamond-star' };
        initialBoard[4][i] = { color: 'color-gold', hasDiamond: i % 2 === 0, diamondType: 'diamond-blue' };
      }
    }

    return {
      level: lvl,
      type: 'diamonds',
      targetGems: { blue: blueGoal, orange: orangeGoal, star: starGoal },
      totalTarget: blueGoal + orangeGoal + starGoal,
      initialBoard,
      description: `Collect ${blueGoal} Blue, ${orangeGoal} Orange${starGoal ? `, ${starGoal} Stars` : ''}`
    };
  }

  completeLevel(levelNum, score) {
    this.levelStars[levelNum] = 3;
    localStorage.setItem('bb_level_stars', JSON.stringify(this.levelStars));

    const nextLvl = Math.min(96, levelNum + 1);
    if (nextLvl > this.unlockedLevel) {
      this.unlockedLevel = nextLvl;
      localStorage.setItem('bb_unlocked_level', String(this.unlockedLevel));
    }
    this.currentLevel = nextLvl;
    localStorage.setItem('bb_current_level', String(this.currentLevel));
  }

  isLevelUnlocked(levelNum) {
    return levelNum <= this.unlockedLevel;
  }
}

export const adventure = new AdventureManager();
