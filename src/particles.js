// Particle and Confetti Effects for Block Blaster
import confetti from 'canvas-confetti';

const confettiCanvas = document.getElementById('confetti-canvas');
let customConfetti = null;

if (confettiCanvas) {
  customConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });
}

/**
 * Fires a blast of particles at a specific viewport position (x, y)
 */
export function fireBlockBlast(x, y, color = '#ff4757') {
  if (!customConfetti) return;

  const nx = x / window.innerWidth;
  const ny = y / window.innerHeight;

  customConfetti({
    particleCount: 16,
    angle: 90,
    spread: 360,
    startVelocity: 14,
    decay: 0.88,
    gravity: 0.8,
    origin: { x: nx, y: ny },
    colors: [color, '#ffffff', '#ffbe3b']
  });
}

/**
 * Huge celebratory fireworks confetti for high scores or multi-combos
 */
export function fireVictoryCelebration() {
  if (!customConfetti) return;

  const duration = 2.2 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    customConfetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#00d2ff', '#ff4757', '#ffbe3b', '#2ed573', '#e056fd']
    });
    customConfetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#00d2ff', '#ff4757', '#ffbe3b', '#2ed573', '#e056fd']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
