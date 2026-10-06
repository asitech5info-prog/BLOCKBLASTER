// Medal & Achievement System for Block Blaster
// Dynamic milestone tracking with real goals and real progress

export const AWARDS_DEFINITIONS = [
  {
    id: 'score_champion',
    name: 'Score Champion',
    statKey: 'bestScore',
    tier1: 500,
    tier2: 2000,
    tier3: 5000,
    icon: 'target',
    desc: 'Reach legendary high scores in Classic mode'
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    statKey: 'highestCombo',
    tier1: 3,
    tier2: 5,
    tier3: 8,
    icon: 'gems',
    desc: 'Seize maximum combo chains and multiple line clears'
  },
  {
    id: 'block_master',
    name: 'Block Master',
    statKey: 'piecesPlaced',
    tier1: 25,
    tier2: 100,
    tier3: 300,
    icon: 'blocks',
    desc: 'Place puzzle pieces onto the board with precision'
  },
  {
    id: 'line_blaster',
    name: 'Line Blaster',
    statKey: 'linesCleared',
    tier1: 10,
    tier2: 50,
    tier3: 150,
    icon: 'play',
    desc: 'Blast full rows and columns simultaneously'
  },
  {
    id: 'adventure_explorer',
    name: 'Adventurer',
    statKey: 'levelsCompleted',
    tier1: 1,
    tier2: 5,
    tier3: 15,
    icon: 'map',
    desc: 'Conquer challenging puzzle levels in Adventure mode'
  },
  {
    id: 'perseverance',
    name: 'Perseverance',
    statKey: 'rounds',
    tier1: 3,
    tier2: 10,
    tier3: 25,
    icon: 'calendar',
    desc: 'Play Block Blaster across multiple rounds'
  },
  {
    id: 'master_cleaner',
    name: 'Master Cleaner',
    statKey: 'allClears',
    tier1: 1,
    tier2: 3,
    tier3: 5,
    icon: 'broom',
    desc: 'Clear the entire grid for dynamic theme transformations'
  },
  {
    id: 'unwavering',
    name: 'Unwavering',
    statKey: 'bestScore',
    tier1: 1000,
    tier2: 3000,
    tier3: 8000,
    icon: 'crown',
    desc: 'Maintain unwavering streaks without game over'
  },
  {
    id: 'invincible_legend',
    name: 'Invincible Legend',
    statKey: 'bestScore',
    tier1: 10000,
    tier2: 25000,
    tier3: 50000,
    icon: 'diamond',
    desc: 'Surpass monumental scores in a single game'
  }
];

export class MedalManager {
  constructor() {
    this.rounds = parseInt(localStorage.getItem('bb_stat_rounds') || '0', 10);
    this.highestCombo = parseInt(localStorage.getItem('bb_stat_highest_combo') || '0', 10);
    this.bestScore = parseInt(localStorage.getItem('bb_stat_best_score') || localStorage.getItem('block_blaster_best') || '0', 10);
    this.piecesPlaced = parseInt(localStorage.getItem('bb_stat_pieces_placed') || '0', 10);
    this.linesCleared = parseInt(localStorage.getItem('bb_stat_lines_cleared') || '0', 10);
    this.levelsCompleted = parseInt(localStorage.getItem('bb_stat_levels_cleared') || '0', 10);
    this.allClears = parseInt(localStorage.getItem('bb_stat_all_clears') || '0', 10);
    this.loginDays = parseInt(localStorage.getItem('bb_stat_login_days') || '1', 10);

    this.checkLoginDay();
  }

  checkLoginDay() {
    const today = new Date().toISOString().slice(0, 10);
    const lastLogin = localStorage.getItem('bb_last_login_date');
    if (lastLogin !== today) {
      if (lastLogin) {
        this.loginDays++;
        localStorage.setItem('bb_stat_login_days', String(this.loginDays));
      }
      localStorage.setItem('bb_last_login_date', today);
    }
  }

  recordPiecePlaced() {
    this.piecesPlaced++;
    localStorage.setItem('bb_stat_pieces_placed', String(this.piecesPlaced));
  }

  recordLinesCleared(count) {
    this.linesCleared += count;
    localStorage.setItem('bb_stat_lines_cleared', String(this.linesCleared));
  }

  recordAllClear() {
    this.allClears++;
    localStorage.setItem('bb_stat_all_clears', String(this.allClears));
  }

  recordLevelCompleted(levelNum) {
    if (levelNum > this.levelsCompleted) {
      this.levelsCompleted = levelNum;
      localStorage.setItem('bb_stat_levels_cleared', String(this.levelsCompleted));
    }
  }

  recordRound(score, combo) {
    this.rounds++;
    localStorage.setItem('bb_stat_rounds', String(this.rounds));

    if (combo > this.highestCombo) {
      this.highestCombo = combo;
      localStorage.setItem('bb_stat_highest_combo', String(this.highestCombo));
    }

    if (score > this.bestScore) {
      this.bestScore = score;
      localStorage.setItem('bb_stat_best_score', String(this.bestScore));
      localStorage.setItem('block_blaster_best', String(this.bestScore));
    }
  }

  getStats(bestScoreOverride = null) {
    const activeBest = bestScoreOverride !== null ? Math.max(this.bestScore, bestScoreOverride) : this.bestScore;
    return {
      highestCombo: this.highestCombo,
      bestScore: activeBest,
      rounds: this.rounds,
      loginDays: this.loginDays,
      piecesPlaced: this.piecesPlaced,
      linesCleared: this.linesCleared,
      levelsCompleted: this.levelsCompleted,
      allClears: this.allClears
    };
  }

  getAwardsList(bestScoreOverride = null) {
    const stats = this.getStats(bestScoreOverride);

    return AWARDS_DEFINITIONS.map(def => {
      const val = stats[def.statKey] || 0;
      let tier = 'locked';
      let progress = '';
      let hasRedDot = false;

      if (val >= def.tier3) {
        tier = 'gold';
        progress = `${val}/${def.tier3}`;
        hasRedDot = true;
      } else if (val >= def.tier2) {
        tier = 'silver';
        progress = `${val}/${def.tier3}`;
        hasRedDot = true;
      } else if (val >= def.tier1) {
        tier = 'bronze';
        progress = `${val}/${def.tier2}`;
      } else {
        tier = 'locked';
        progress = `${val}/${def.tier1}`;
      }

      return {
        id: def.id,
        name: def.name,
        progress,
        tier,
        icon: def.icon,
        hasRedDot: hasRedDot && tier !== 'locked',
        desc: def.desc,
        currentVal: val,
        targetVal: def.tier3
      };
    });
  }
}

export const medalManager = new MedalManager();
export const AWARDS_LIST = medalManager.getAwardsList();
