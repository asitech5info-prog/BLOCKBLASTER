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
 * Celebratory fireworks confetti disabled as requested: only sound plays on victory or game over
 */
export function fireVictoryCelebration() {
  // No confetti effect - audio only
}

