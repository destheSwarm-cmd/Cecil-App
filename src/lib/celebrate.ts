import confetti from 'canvas-confetti';

/**
 * Triggers a crisp tavern green checkmark celebration burst
 */
export function triggerSuccessBurst(title?: string) {
  // Fire green and amber confetti particles
  try {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#0A4A35', '#1D9E75', '#EF9F27', '#D4AF37'],
      disableForReducedMotion: true,
    });
  } catch (err) {
    console.debug('Confetti burst note:', err);
  }
}
