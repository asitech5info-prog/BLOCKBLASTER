// Adventure Mode: 500 Levels across 5 Trophies
export const TROPHIES = [
  { id: 1, name: "Bronze Novice Trophy", icon: "🥉", startLevel: 1, endLevel: 100, theme: "theme-blue" },
  { id: 2, name: "Silver Champion Trophy", icon: "🥈", startLevel: 101, endLevel: 200, theme: "theme-teal" },
  { id: 3, name: "Gold Master Trophy", icon: "🥇", startLevel: 201, endLevel: 300, theme: "theme-purple" },
  { id: 4, name: "Diamond Legend Trophy", icon: "💎", startLevel: 301, endLevel: 400, theme: "theme-sunset" },
  { id: 5, name: "Crown Emperor Trophy", icon: "👑", startLevel: 401, endLevel: 500, theme: "theme-dark" }
];

export class AdventureManager {
  constructor() {
    this.currentLevel = parseInt(localStorage.getItem('bb_current_level') || '1', 10);
    this.unlockedLevel = parseInt(localStorage.getItem('bb_unlocked_level') || '1', 10);
    this.levelStars = JSON.parse(localStorage.getItem('bb_level_stars') || '{}');
  }

  getLevelData(levelNum) {
    const trophyIndex = Math.min(4, Math.floor((levelNum - 1) / 100));
    const trophy = TROPHIES[trophyIndex];
    const levelInTrophy = ((levelNum - 1) % 100) + 1;

    // Determine level objective: alternate between 'diamonds', 'score', and 'lines'
    let type = 'score';
    let target = 1000 + levelInTrophy * 50;
    let initialDiamonds = 0;

    if (levelNum % 3 === 1) {
      type = 'diamonds';
      target = 4 + Math.min(12, Math.floor(levelInTrophy / 10));
      initialDiamonds = target;
    } else if (levelNum % 3 === 2) {
      type = 'lines';
      target = 5 + Math.min(15, Math.floor(levelInTrophy / 8));
    } else {
      type = 'score';
      target = 800 + levelInTrophy * 60;
    }

    // Pre-populate board blocks for adventure levels (e.g. puzzle layout with embedded diamonds)
    const initialBoard = Array.from({ length: 8 }, () => Array(8).fill(null));
    const diamondPositions = [];

    if (type === 'diamonds' || levelNum % 4 === 0) {
      const diamondCount = type === 'diamonds' ? target : 4;
      const seed = levelNum * 37;
      let placed = 0;

      // Deterministic layout per level
      const presetRows = [1, 2, 5, 6];
      const presetCols = [1, 2, 5, 6];

      for (let i = 0; i < diamondCount && i < 16; i++) {
        const r = (seed + i * 3) % 8;
        const c = (seed + i * 5 + 2) % 8;
        if (!initialBoard[r][c]) {
          initialBoard[r][c] = {
            color: ['color-cyan', 'color-purple', 'color-gold', 'color-green', 'color-red', 'color-orange'][i % 6],
            hasDiamond: true
          };
          diamondPositions.push({ r, c });
          placed++;
        }
      }
    }

    return {
      level: levelNum,
      trophy,
      type,
      target,
      initialBoard,
      diamondPositions,
      description: type === 'diamonds'
        ? `Collect ${target} 💎 Diamonds`
        : type === 'lines'
        ? `Clear ${target} Lines`
        : `Score ${target} Points`
    };
  }

  completeLevel(levelNum, score) {
    this.levelStars[levelNum] = 3;
    localStorage.setItem('bb_level_stars', JSON.stringify(this.levelStars));

    if (levelNum >= this.unlockedLevel && this.unlockedLevel < 500) {
      this.unlockedLevel = levelNum + 1;
      localStorage.setItem('bb_unlocked_level', String(this.unlockedLevel));
    }
  }

  isLevelUnlocked(levelNum) {
    return levelNum <= this.unlockedLevel;
  }
}

export const adventure = new AdventureManager();
