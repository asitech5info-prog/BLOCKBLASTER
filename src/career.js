// Player Career Statistics and Records Engine for Block Blaster
// Tracks lifetime player achievements, game stats, and personal records

import { wallet } from './coins.js';

class CareerStatsManager {
  constructor() {}

  getStats() {
    const bestScore = parseInt(localStorage.getItem('block_blaster_best') || '0', 10);
    const highestCombo = parseInt(localStorage.getItem('bb_stat_highest_combo') || '0', 10);
    const rounds = parseInt(localStorage.getItem('bb_stat_rounds') || '0', 10);
    const blocksPlaced = parseInt(localStorage.getItem('bb_stat_pieces_placed') || '0', 10);
    const linesCleared = parseInt(localStorage.getItem('bb_stat_lines_cleared') || '0', 10);
    const multiClears = parseInt(localStorage.getItem('bb_stat_multiline_clears') || '0', 10);
    const allClears = parseInt(localStorage.getItem('bb_stat_all_clears') || '0', 10);
    const adventureLevel = parseInt(localStorage.getItem('bb_unlocked_level') || '1', 10);
    const dailyCompleted = parseInt(localStorage.getItem('bb_stat_daily_challenges_completed') || '0', 10);
    const chestsOpened = parseInt(localStorage.getItem('bb_stat_chests_opened') || '0', 10);
    const revivesUsed = parseInt(localStorage.getItem('bb_stat_revives_used') || '0', 10);
    const totalCoinsEarned = wallet.getTotalEarned();

    return {
      bestScore,
      highestCombo,
      rounds,
      blocksPlaced,
      linesCleared,
      multiClears,
      allClears,
      adventureLevel,
      dailyCompleted,
      chestsOpened,
      revivesUsed,
      totalCoinsEarned
    };
  }

  recordGameEnd(score, combo) {
    // Already linked with medalManager, but ensure stats stay in sync
    const currentBest = parseInt(localStorage.getItem('block_blaster_best') || '0', 10);
    if (score > currentBest) {
      localStorage.setItem('block_blaster_best', String(score));
    }

    const currentCombo = parseInt(localStorage.getItem('bb_stat_highest_combo') || '0', 10);
    if (combo > currentCombo) {
      localStorage.setItem('bb_stat_highest_combo', String(combo));
    }
  }

  recordBlockPlaced() {
    const current = parseInt(localStorage.getItem('bb_stat_pieces_placed') || '0', 10) + 1;
    localStorage.setItem('bb_stat_pieces_placed', String(current));
  }

  recordLinesCleared(count) {
    if (count <= 0) return;
    const current = parseInt(localStorage.getItem('bb_stat_lines_cleared') || '0', 10) + count;
    localStorage.setItem('bb_stat_lines_cleared', String(current));

    if (count > 1) {
      const multis = parseInt(localStorage.getItem('bb_stat_multiline_clears') || '0', 10) + 1;
      localStorage.setItem('bb_stat_multiline_clears', String(multis));
    }
  }

  recordAllClear() {
    const current = parseInt(localStorage.getItem('bb_stat_all_clears') || '0', 10) + 1;
    localStorage.setItem('bb_stat_all_clears', String(current));
  }

  recordRevive() {
    const current = parseInt(localStorage.getItem('bb_stat_revives_used') || '0', 10) + 1;
    localStorage.setItem('bb_stat_revives_used', String(current));
  }
}

export const careerStats = new CareerStatsManager();
