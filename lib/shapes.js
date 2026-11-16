import * as THREE from 'three';
import { seededRandom } from '../config/noise.js';

// هر «شکل» یک توصیف ساده است: { outer: [[x,y],...], holes: [[[x,y],...], ...] }
// مبدأ هر شکل: وسطِ پایه‌اش (y=0 کفِ شکل)، تا موقع تاشدن دور همون خط بچرخه.

const pt = (x, y) => [x, y];

export function toShape(desc, dx = 0, dy = 0, sx = 1, sy = sx) {
  const s = new THREE.Shape();
  desc.outer.forEach(([x, y], i) => (i ? s.lineTo(x * sx + dx, y * sy + dy) : s.moveTo(x * sx + dx, y * sy + dy)));
  s.closePath();
  (desc.holes || []).forEach((h) => {
    const p = new THREE.Path();
    h.forEach(([x, y], i) => (i ? p.lineTo(x * sx + dx, y * sy + dy) : p.moveTo(x * sx + dx, y * sy + dy)));
    p.closePath();
    s.holes.push(p);
  });
  return s;
}

// منحنی بسته‌ی نرم از چندتا نقطه‌ی کلیدی (برای شکل‌های ارگانیک: روباه، نهنگ، ابر ...)
export function smooth(keys, n = 120) {
  const c = new THREE.CatmullRomCurve3(keys.map(([x, y]) => new THREE.Vector3(x, y, 0)), true, 'centripetal');
  const p = c.getPoints(n);
  p.pop();
  return { outer: p.map((v) => [v.x, v.y]), holes: [] };
}

export function disc(r, n = 48) {
  return { outer: Array.from({ length: n }, (_, i) => pt(Math.cos((i / n) * Math.PI * 2) * r, Math.sin((i / n) * Math.PI * 2) * r)), holes: [] };
}

export function rect(w, h) {
  return { outer: [pt(-w / 2, 0), pt(w / 2, 0), pt(w / 2, h), pt(-w / 2, h)], holes: [] };
}

function circlePts(cx, cy, r, n = 20) {
  return Array.from({ length: n }, (_, i) => pt(cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r));
}
function rectPts(cx, cy, w, h) {
  return [pt(cx - w / 2, cy - h / 2), pt(cx + w / 2, cy - h / 2), pt(cx + w / 2, cy + h / 2), pt(cx - w / 2, cy + h / 2)];
}

// تپه‌ی موج‌دار
export function hill(w, h, seed = 1, k = 3) {
  const rnd = seededRandom(seed);
  const ph = [rnd() * 6, rnd() * 6, rnd() * 6];
  const n = 70;
  const top = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = -w / 2 + u * w;
    const y = h * (0.62 + 0.22 * Math.sin(u * Math.PI * k + ph[0]) + 0.1 * Math.sin(u * Math.PI * k * 2.3 + ph[1]) + 0.05 * Math.sin(u * Math.PI * k * 5 + ph[2]));
    top.push(pt(x, Math.max(0.05, y)));
  }
  return { outer: [pt(-w / 2, 0), ...top, pt(w / 2, 0)], holes: [] };
}

// درخت کاج (مثلثِ پله‌پله)
export function pine(w, h) {
  const right = [];
  const tiers = 4;
  right.push(pt(w * 0.06, 0), pt(w * 0.06, h * 0.16));
  for (let t = 0; t < tiers; t++) {
    const yb = h * (0.14 + t * 0.2);
    const yt = h * (0.14 + t * 0.2 + 0.34);
    const hw = (w / 2) * (1 - t * 0.2);
    right.push(pt(hw, yb), pt(hw * 0.3, Math.min(yt, h) - h * 0.03));
  }
  right.push(pt(0, h));
  const left = right
    .slice(0, -1)
    .reverse()
    .map(([x, y]) => pt(-x, y));
  return { outer: [...right, ...left], holes: [] };
}

// درخت گرد (تنه + تاج پرپر)
export function roundTree(w, h, seed = 2) {
  const rnd = seededRandom(seed);
  const crown = [];
  const n = 18;
  const cy = h * 0.62;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = (w / 2) * (0.85 + 0.15 * Math.sin(i * 2.3) + rnd() * 0.08);
    crown.push(pt(Math.cos(a) * r, cy + Math.sin(a) * r * 0.9));
  }
  const crownShape = smooth(crown.map(([x, y]) => [x, y]), 90);
  // تنه رو هم می‌چسبونیم به تاج با یک چندضلعی ساده (تاج بالا، تنه پایین) - تنه از وسط تاج شروع می‌شه
  const tw = w * 0.07;
  const trunk = [pt(-tw, 0), pt(tw, 0), pt(tw * 0.8, cy), pt(-tw * 0.8, cy)];
  return { outer: crownShape.outer, holes: [], extra: [{ outer: trunk, holes: [] }] };
}

export function mushroom(r) {
  const cap = [];
  const n = 24;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI;
    cap.push(pt(Math.cos(a) * r, r * 0.55 + Math.sin(a) * r * 0.62));
  }
  const stem = [pt(r * 0.34, r * 0.55), pt(r * 0.28, 0), pt(-r * 0.28, 0), pt(-r * 0.34, r * 0.55)];
  return { outer: [...stem.slice(1, 3), pt(-r * 0.34, r * 0.55), ...cap.reverse().slice(0), pt(r * 0.34, r * 0.55)].filter(Boolean), holes: [] };
}

export function star(r, inner = 0.45) {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * inner;
    const a = Math.PI / 2 + (i / 10) * Math.PI * 2;
    p.push(pt(Math.cos(a) * rr, Math.sin(a) * rr));
  }
  return { outer: p, holes: [] };
}

// ماهِ هلالی
export function crescent(R, d, r, n = 40) {
  const xi = (d * d + R * R - r * r) / (2 * d);
  const yi = Math.sqrt(Math.max(R * R - xi * xi, 0.0001));
  const a0 = Math.atan2(yi, xi);
  const outer = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (i / n) * (Math.PI * 2 - 2 * a0);
    outer.push(pt(Math.cos(a) * R, Math.sin(a) * R));
  }
  const b0 = Math.atan2(-yi, xi - d);
  const b1 = Math.atan2(yi, xi - d);
  const inner = [];
  for (let i = 1; i < n; i++) {
    const a = b0 - (i / n) * ((b0 - b1 + Math.PI * 2) % (Math.PI * 2));
    inner.push(pt(d + Math.cos(a) * r, Math.sin(a) * r));
  }
  return { outer: [...outer, ...inner], holes: [] };
}

// ابر (کف صاف، بالا گرد)
export function cloud(w, h) {
  const bumps = [
    [-0.32, 0.45, 0.2], [-0.1, 0.62, 0.26], [0.16, 0.55, 0.22], [0.36, 0.4, 0.17],
  ];
  const pts = [];
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const x = -0.5 + i / n;
    let y = 0;
    bumps.forEach(([cx, cy, r]) => {
      const dx = x - cx;
      if (Math.abs(dx) < r) y = Math.max(y, cy - r * 0.3 + Math.sqrt(r * r - dx * dx));
    });
    pts.push(pt(x * w, Math.max(0.08, y) * h));
  }
  return { outer: [pt(-w / 2, 0), ...pts, pt(w / 2, 0)], holes: [] };
}

// خط افق شهر: ساختمان‌های پشت‌سرهم با ارتفاع‌های مختلف + پنجره‌های بُریده‌شده
export function skyline(w, hMin, hMax, seed = 3, windows = true) {
  const rnd = seededRandom(seed);
  const outer = [pt(-w / 2, 0)];
  const holes = [];
  const centers = [];
  let x = -w / 2;
  while (x < w / 2 - 0.12) {
    const bw = Math.min(0.28 + rnd() * 0.3, w / 2 - x);
    const bh = hMin + rnd() * (hMax - hMin);
    outer.push(pt(x, bh), pt(x + bw, bh));
    if (windows) {
      const cols = Math.max(1, Math.floor(bw / 0.13));
      const rows = Math.max(1, Math.floor((bh - 0.2) / 0.17));
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const cx = x + (bw / cols) * (c + 0.5);
          const cy = 0.18 + (r + 0.5) * ((bh - 0.2) / rows);
          holes.push(rectPts(cx, cy, 0.06, 0.09));
          centers.push([cx, cy]);
        }
      }
    }
    x += bw;
  }
  outer.push(pt(w / 2, 0));
  return { outer, holes, windows: centers };
}

// ساختمانِ تکی با سقف شیب‌دار
export function building(w, h, roof = 0.28, cols = 3, rows = 4) {
  const outer = [pt(-w / 2, 0), pt(w / 2, 0), pt(w / 2, h), pt(0, h + roof), pt(-w / 2, h)];
  const holes = [];
  const centers = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const cx = -w / 2 + (w / cols) * (c + 0.5);
      const cy = 0.2 + (r + 0.5) * ((h - 0.25) / rows);
      holes.push(rectPts(cx, cy, w / cols * 0.45, (h - 0.25) / rows * 0.55));
      centers.push([cx, cy]);
    }
  }
  return { outer, holes, windows: centers };
}

// برج ساعت: ساختمانِ باریک با سقف نوک‌تیز و ساعتِ گرد
export function clockTower(w, h) {
  const outer = [pt(-w / 2, 0), pt(w / 2, 0), pt(w / 2, h), pt(w * 0.28, h), pt(0, h + w * 1.3), pt(-w * 0.28, h), pt(-w / 2, h)];
  return { outer, holes: [circlePts(0, h * 0.78, w * 0.28, 24), rectPts(0, h * 0.28, w * 0.18, h * 0.22)] };
}

// موج: بالا سینوسی، پایین صاف
export function waves(w, amp, freq, phase, base = 0.3) {
  const n = 100;
  const top = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    top.push(pt(-w / 2 + u * w, base + amp * Math.sin(u * Math.PI * 2 * freq + phase) + amp * 0.35 * Math.sin(u * Math.PI * 2 * freq * 2.1 + phase * 1.7)));
  }
  return { outer: [pt(-w / 2, 0), ...top, pt(w / 2, 0)], holes: [] };
}

export function whale() {
  return smooth([
    [-0.9, 0.12], [-0.7, 0.34], [-0.45, 0.46], [-0.1, 0.5], [0.3, 0.44], [0.58, 0.3], [0.72, 0.18], [0.66, 0.06],
    [0.4, 0.0], [0.0, -0.04], [-0.4, 0.0], [-0.72, 0.06], [-0.92, 0.0], [-1.1, 0.2], [-1.02, 0.42], [-0.9, 0.3],
  ].map(([x, y]) => [x, y + 0.06]), 140);
}

export function boatHull(w = 0.7) {
  return { outer: [pt(-w / 2, 0.16), pt(w / 2, 0.16), pt(w * 0.36, 0), pt(-w * 0.36, 0)], holes: [] };
}
export function sail(w = 0.32, h = 0.55, flip = 1) {
  return { outer: [pt(0, 0), pt(0, h), pt(flip * w, 0)], holes: [] };
}

export function rocket() {
  const body = [];
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI;
    body.push(pt(Math.cos(a) * 0.16, 0.5 + Math.sin(a) * 0.34));
  }
  const outer = [pt(-0.16, 0.0), pt(0.16, 0.0), pt(0.16, 0.5), ...body.slice(1, -1).reverse().reverse(), pt(-0.16, 0.5)];
  return { outer: [pt(-0.16, 0.0), pt(0.16, 0.0), ...body.map(([x, y]) => pt(-x, y)).reverse().reverse()], holes: [circlePts(0, 0.5, 0.07, 18)] };
}
export function rocketFin() {
  return { outer: [pt(0.16, 0.0), pt(0.34, -0.14), pt(0.34, 0.2), pt(0.16, 0.36)], holes: [] };
}

export function ringShape(rx, ry, thick) {
  const n = 60;
  const outer = Array.from({ length: n }, (_, i) => pt(Math.cos((i / n) * Math.PI * 2) * rx, Math.sin((i / n) * Math.PI * 2) * ry));
  const inner = Array.from({ length: n }, (_, i) => pt(Math.cos((i / n) * Math.PI * 2) * (rx - thick), Math.sin((i / n) * Math.PI * 2) * (ry - thick * 0.45)));
  return { outer, holes: [inner] };
}

// دیسک با دهانه‌های ماه (سوراخ)
export function moonDisc(r, seed = 5) {
  const rnd = seededRandom(seed);
  const holes = [];
  for (let i = 0; i < 4; i++) {
    const a = rnd() * 6.28;
    const d = r * (0.2 + rnd() * 0.45);
    holes.push(circlePts(Math.cos(a) * d, Math.sin(a) * d, r * (0.07 + rnd() * 0.08), 12));
  }
  return { outer: disc(r).outer, holes };
}

export function balloon() {
  const top = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI * 0.12 + (i / n) * Math.PI * 0.76;
    top.push(pt(Math.cos(a) * 0.3, 0.42 + Math.sin(a) * 0.36));
  }
  const outer = [pt(0.07, 0.1), pt(0.07, 0.12), ...top.slice().reverse().map(([x, y]) => pt(x, y)), pt(-0.07, 0.12), pt(-0.07, 0.1)];
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = Math.PI * 0.12 + (i / n) * Math.PI * 0.76;
    pts.push(pt(-Math.cos(a) * 0.3 * -1, 0.42 + Math.sin(a) * 0.36));
  }
  return { outer: [pt(0.08, 0.1), pt(0.3, 0.46), ...Array.from({ length: 22 }, (_, i) => { const a = (i / 21) * Math.PI; return pt(Math.cos(a) * 0.3, 0.46 + Math.sin(a) * 0.36); }), pt(-0.3, 0.46), pt(-0.08, 0.1)], holes: [] };
}
export function basket() {
  return { outer: [pt(-0.09, 0), pt(0.09, 0), pt(0.1, 0.1), pt(-0.1, 0.1)], holes: [] };
}

export function tram() {
  const outer = [pt(-0.42, 0.04), pt(0.42, 0.04), pt(0.42, 0.34), pt(0.36, 0.4), pt(-0.36, 0.4), pt(-0.42, 0.34)];
  const holes = [];
  for (let i = 0; i < 4; i++) holes.push(rectPts(-0.27 + i * 0.18, 0.24, 0.1, 0.1));
  return { outer, holes };
}

export function lamp() {
  return { outer: [pt(-0.012, 0), pt(0.012, 0), pt(0.012, 0.42), pt(0.07, 0.44), pt(0.07, 0.47), pt(-0.012, 0.46)], holes: [] };
}

// روباه (نیم‌رخِ رو به راست)
export function fox() {
  return smooth([
    [1.0, 0.42], [0.9, 0.56], [0.86, 0.8], [0.8, 0.6], [0.72, 0.76], [0.66, 0.5], [0.46, 0.5], [0.3, 0.46],
    [0.2, 0.5], [0.08, 0.64], [0.0, 0.52], [0.1, 0.34], [0.24, 0.26], [0.26, 0.0], [0.34, 0.0], [0.36, 0.2],
    [0.5, 0.2], [0.6, 0.0], [0.68, 0.0], [0.7, 0.26], [0.8, 0.3], [0.92, 0.32],
  ], 220);
}
export function foxChest() {
  return smooth([[0.97, 0.38], [0.9, 0.36], [0.78, 0.32], [0.72, 0.28], [0.8, 0.26], [0.92, 0.3]], 40);
}
