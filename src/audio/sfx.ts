// Procedurally synthesized sound effects — no external audio files.
// Reserved for the physical actions (planting, picking); the Strand
// scene deliberately stays free of SFX, just the user's own music.

let ctx: AudioContext | null = null;

export function audioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

// Soil thud: low-pass-filtered noise burst + descending low sine (~220ms).
export function soilThud(): void {
  const c = audioContext();
  const t = c.currentTime;
  const dur = 0.22;

  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
  }
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(420, t);
  lp.frequency.exponentialRampToValueAtTime(80, t + dur);
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.55, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + dur);
  noise.connect(lp).connect(ng).connect(c.destination);
  noise.start(t);

  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);
  const og = c.createGain();
  og.gain.setValueAtTime(0.5, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.connect(og).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur);
}

// Fruit pluck/snap: high-pass-filtered noise transient + quick
// descending triangle pitch envelope (~180ms).
export function fruitPluck(): void {
  const c = audioContext();
  const t = c.currentTime;

  const nDur = 0.06;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * nDur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  }
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1800;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.35, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + nDur);
  noise.connect(hp).connect(ng).connect(c.destination);
  noise.start(t);

  const osc = c.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(620, t);
  osc.frequency.exponentialRampToValueAtTime(180, t + 0.15);
  const og = c.createGain();
  og.gain.setValueAtTime(0.4, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  osc.connect(og).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.18);
}
