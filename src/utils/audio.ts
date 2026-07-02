/**
 * Utility to play high-fidelity synthesizer beeps and feedback sounds 
 * using the browser's built-in Web Audio API. No external files required.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a high-pitched positive beep indicating successful scanning
 */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Beep sound frequency (880Hz is A5 - clear and friendly)
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.type = 'sine';

    // Fade out elegantly
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (err) {
    console.warn("Could not play sound due to user interaction policies", err);
  }
}

/**
 * Play a low double buzz sound indicating error or student not found
 */
export function playErrorSound() {
  try {
    const ctx = getAudioContext();
    
    // Play two rapid descending low buzzes
    const playBuzz = (delay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(180, ctx.currentTime + delay);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + delay + 0.12);
      osc.type = 'sawtooth';

      gain.gain.setValueAtTime(0.12, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.12);
    };

    playBuzz(0);
    playBuzz(0.14);
  } catch (err) {
    console.warn("Could not play sound due to user interaction policies", err);
  }
}
