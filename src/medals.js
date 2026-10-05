// Medal & Achievement System for Block Blaster
// Faithful recreation of WhatsApp Image 4.06.44 AM (3).jpeg

export const AWARDS_LIST = [
  {
    id: 'score_champion',
    name: 'Score Champion',
    progress: '12/12',
    tier: 'gold',
    icon: 'target',
    hasRedDot: true,
    desc: 'Reach legendary high scores in Classic mode'
  },
  {
    id: 'perseverance',
    name: 'Perseverance',
    progress: '6/10',
    tier: 'silver',
    icon: 'calendar',
    hasRedDot: true,
    desc: 'Play Block Blaster across consecutive days'
  },
  {
    id: 'block_master',
    name: 'Block Master',
    progress: '8/10',
    tier: 'silver',
    icon: 'blocks',
    hasRedDot: true,
    desc: 'Place 500+ puzzle pieces with precision'
  },
  {
    id: 'opportunist',
    name: 'Opportunist',
    progress: '10/10',
    tier: 'gold',
    icon: 'gems',
    hasRedDot: false,
    desc: 'Seize maximum combo chains and multiple line clears'
  },
  {
    id: 'unwavering',
    name: 'Unwavering',
    progress: '5/5',
    tier: 'gold',
    icon: 'crown',
    hasRedDot: false,
    desc: 'Maintain unwavering streaks without game over'
  },
  {
    id: 'master_cleaner',
    name: 'Master Cleaner',
    progress: '10/10',
    tier: 'gold',
    icon: 'broom',
    hasRedDot: false,
    desc: 'Clear the entire grid for dynamic theme transformations'
  },
  {
    id: 'invincible_legend',
    name: 'Invincible Legend',
    progress: 'Locked',
    tier: 'locked',
    icon: 'play',
    hasRedDot: false,
    desc: 'Surpass 100,000 points in a single round'
  },
  {
    id: 'jewelry_tycoon',
    name: 'Jewelry Tycoon',
    progress: 'Locked',
    tier: 'locked',
    icon: 'diamond',
    hasRedDot: false,
    desc: 'Collect 100+ diamond blocks in Adventure'
  },
  {
    id: 'adventurer',
    name: 'Adventurer',
    progress: 'Locked',
    tier: 'locked',
    icon: 'map',
    hasRedDot: false,
    desc: 'Complete all 96 levels in Adventure mode'
  }
];

export class MedalManager {
  constructor() {
    this.rounds = parseInt(localStorage.getItem('bb_stat_rounds') || '14', 10);
    this.highestCombo = parseInt(localStorage.getItem('bb_stat_highest_combo') || '12', 10);
    this.loginDays = parseInt(localStorage.getItem('bb_stat_login_days') || '3', 10);
  }

  recordRound(score, combo) {
    this.rounds++;
    localStorage.setItem('bb_stat_rounds', String(this.rounds));
    if (combo > this.highestCombo) {
      this.highestCombo = combo;
      localStorage.setItem('bb_stat_highest_combo', String(this.highestCombo));
    }
  }

  getStats(bestScore) {
    return {
      highestCombo: Math.max(this.highestCombo, 12),
      bestScore: bestScore || 423506,
      rounds: Math.max(this.rounds, 25),
      loginDays: Math.max(this.loginDays, 3)
    };
  }
}

export const medalManager = new MedalManager();
