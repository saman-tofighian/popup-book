let ctx = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const A = window.AudioContext || window.webkitAudioContext;
    if (!A) return null;
    ctx = new A();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// صدای ورق‌خوردن (نویز فیلترشده)
export function playTurn() {
  const c = getCtx();
  if (!c) return;
  const len = Math.floor(c.sampleRate * 0.5);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(2200, c.currentTime);
  f.frequency.exponentialRampToValueAtTime(900, c.currentTime + 0.45);
  f.Q.value = 0.7;
  const g = c.createGain();
  g.gain.value = 0.22;
  src.connect(f).connect(g).connect(c.destination);
  src.start();
}

// «پوف» کوچولوی بلندشدنِ پاپ‌آپ
export function playPop() {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(420, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(760, c.currentTime + 0.12);
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.13, c.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.25);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.3);
}
