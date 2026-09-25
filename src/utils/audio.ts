// Web Audio API Synthesizer for Gym Workout sounds (Countdown beeps, Rest timer finish, Set completion)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Short beep for countdown ticks (e.g. 3, 2, 1) */
export function playCountdownTick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (err) {
    console.debug('Audio playback suppressed', err);
  }
}

/** Bright resonant chime when rest period is complete */
export function playRestCompleteSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Dual bell chord (A5 + E6)
    const freqs = [880, 1318.5, 1760];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + 1.0);
    });
  } catch (err) {
    console.debug('Audio error', err);
  }
}

/** Subtle crisp tick when set is marked completed */
export function playSetCompleteSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15); // C6

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (err) {
    console.debug('Audio error', err);
  }
}

/** Victory fanfare when finishing full workout */
export function playWorkoutFinishSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [
      { f: 523.25, d: 0.15, delay: 0 },     // C5
      { f: 659.25, d: 0.15, delay: 0.15 },  // E5
      { f: 783.99, d: 0.2, delay: 0.3 },    // G5
      { f: 1046.50, d: 0.5, delay: 0.5 },   // C6
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, ctx.currentTime + note.delay);

      gain.gain.setValueAtTime(0.25, ctx.currentTime + note.delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.delay + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + note.delay);
      osc.stop(ctx.currentTime + note.delay + note.d + 0.05);
    });
  } catch (err) {
    console.debug('Audio error', err);
  }
}
