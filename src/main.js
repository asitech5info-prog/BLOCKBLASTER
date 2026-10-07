import { BlockBlasterGame } from './game.js';
import { adventure } from './adventure.js';
import { wallet } from './coins.js';
import { skinManager } from './skins.js';
import { profileManager } from './profile.js';
import { haptics } from './haptics.js';
import { dailyChallenge } from './daily.js';
import { careerStats } from './career.js';

document.addEventListener('DOMContentLoaded', () => {
  const game = new BlockBlasterGame();
  game.init();

  // Expose for Playwright verification and debugging
  window.__game = game;
  window.__adventure = adventure;
  window.__wallet = wallet;
  window.__skinManager = skinManager;
  window.__profileManager = profileManager;
  window.__haptics = haptics;
  window.__dailyChallenge = dailyChallenge;
  window.__careerStats = careerStats;
});
