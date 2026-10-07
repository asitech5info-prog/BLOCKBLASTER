// Daily Challenge & Mystery Chest Reward Engine for Block Blaster
// Players tackle daily objectives and earn mystery chests containing BB Coins scaled to complexity

import { wallet } from './coins.js';
import { sound } from './audio.js';
import { haptics } from './haptics.js';
import { fireVictoryCelebration } from './particles.js';

export const CHEST_TIERS = {
  bronze: {
    tier: 'bronze',
    name: 'Bronze Chest',
    color: '#cd7f32',
    coins: 100,
    icon: '📦',
    gemEmoji: '🥉',
    glowColor: 'rgba(205, 127, 50, 0.6)'
  },
  silver: {
    tier: 'silver',
    name: 'Silver Chest',
    color: '#e2e8f0',
    coins: 250,
    icon: '🎁',
    gemEmoji: '🥈',
    glowColor: 'rgba(226, 232, 240, 0.7)'
  },
  gold: {
    tier: 'gold',
    name: 'Gold Chest',
    color: '#fbbf24',
    coins: 500,
    icon: '👑',
    gemEmoji: '🥇',
    glowColor: 'rgba(251, 191, 36, 0.8)'
  },
  diamond: {
    tier: 'diamond',
    name: 'Diamond Chest',
    color: '#38bdf8',
    coins: 1000,
    icon: '💎',
    gemEmoji: '💎',
    glowColor: 'rgba(56, 189, 248, 0.9)'
  }
};

class DailyChallengeManager {
  constructor() {
    this.todayKey = this.getTodayDateKey();
    this.challenges = this.generateDailyChallenges();
    this.loadState();
  }

  getTodayDateKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  // Deterministic seed based on date string
  hashDate(dateStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  generateDailyChallenges() {
    const seed = this.hashDate(this.todayKey);
    const dayIndex = seed % 100;

    return [
      {
        id: 'daily_easy',
        complexity: 'Easy',
        title: 'Block Placer',
        desc: 'Place 40 blocks on the grid',
        target: 40,
        type: 'blocksPlaced',
        chest: CHEST_TIERS.bronze
      },
      {
        id: 'daily_med',
        complexity: 'Medium',
        title: 'Line Demolisher',
        desc: 'Blast 12 lines in any mode',
        target: 12,
        type: 'linesCleared',
        chest: CHEST_TIERS.silver
      },
      {
        id: 'daily_hard',
        complexity: 'Hard',
        title: 'Score Crusher',
        desc: `Reach ${1000 + (dayIndex % 5) * 200} points in Classic`,
        target: 1000 + (dayIndex % 5) * 200,
        type: 'scoreSingle',
        chest: CHEST_TIERS.gold
      },
      {
        id: 'daily_extreme',
        complexity: 'Extreme',
        title: 'Combo Maestro',
        desc: 'Achieve a 4x or higher combo chain',
        target: 4,
        type: 'comboChain',
        chest: CHEST_TIERS.diamond
      }
    ];
  }

  loadState() {
    const saved = JSON.parse(localStorage.getItem(`bb_daily_${this.todayKey}`) || '{}');
    this.progress = saved.progress || {
      daily_easy: 0,
      daily_med: 0,
      daily_hard: 0,
      daily_extreme: 0
    };
    this.claimed = saved.claimed || {
      daily_easy: false,
      daily_med: false,
      daily_hard: false,
      daily_extreme: false
    };
  }

  saveState() {
    localStorage.setItem(`bb_daily_${this.todayKey}`, JSON.stringify({
      progress: this.progress,
      claimed: this.claimed
    }));
  }

  getChallenges() {
    return this.challenges.map(c => {
      const current = this.progress[c.id] || 0;
      const isCompleted = current >= c.target;
      const isClaimed = !!this.claimed[c.id];
      return {
        ...c,
        current: Math.min(current, c.target),
        isCompleted,
        isClaimed
      };
    });
  }

  recordEvent(eventType, value = 1) {
    let changed = false;
    this.challenges.forEach(c => {
      if (this.claimed[c.id]) return;

      if (c.type === eventType) {
        if (eventType === 'scoreSingle' || eventType === 'comboChain') {
          if (value > (this.progress[c.id] || 0)) {
            this.progress[c.id] = value;
            changed = true;
          }
        } else {
          this.progress[c.id] = (this.progress[c.id] || 0) + value;
          changed = true;
        }
      }
    });

    if (changed) {
      this.saveState();
      this.updateBadges();
    }
  }

  claimChest(challengeId) {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge) return { success: false, reason: 'Invalid challenge' };

    const current = this.progress[challengeId] || 0;
    if (current < challenge.target) {
      return { success: false, reason: 'Challenge not completed yet' };
    }
    if (this.claimed[challengeId]) {
      return { success: false, reason: 'Chest already claimed' };
    }

    this.claimed[challengeId] = true;
    this.saveState();

    // Reward BB Coins according to complexity of challenge
    const coinsWon = challenge.chest.coins;
    wallet.addCoins(coinsWon, `Daily Chest: ${challenge.title} (${challenge.complexity})`);

    // Increment career stats
    const totalChests = parseInt(localStorage.getItem('bb_stat_chests_opened') || '0', 10) + 1;
    localStorage.setItem('bb_stat_chests_opened', String(totalChests));

    const totalDaily = parseInt(localStorage.getItem('bb_stat_daily_challenges_completed') || '0', 10) + 1;
    localStorage.setItem('bb_stat_daily_challenges_completed', String(totalDaily));

    haptics.fanfare();
    if (typeof sound?.playMedalCelebration === 'function') {
      sound.playMedalCelebration();
    } else if (typeof sound?.playComboFanfare === 'function') {
      sound.playComboFanfare();
    }
    fireVictoryCelebration();

    this.updateBadges();
    return {
      success: true,
      coins: coinsWon,
      chest: challenge.chest,
      challenge
    };
  }

  hasUnclaimedRewards() {
    return this.getChallenges().some(c => c.isCompleted && !c.isClaimed);
  }

  updateBadges() {
    const unclaimed = this.hasUnclaimedRewards();
    document.querySelectorAll('.daily-reward-badge').forEach(el => {
      if (unclaimed) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  }
}

export const dailyChallenge = new DailyChallengeManager();
