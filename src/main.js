import { BlockBlasterGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  const game = new BlockBlasterGame();
  game.init();

  // Expose for Playwright verification and debugging
  window.__game = game;
});
