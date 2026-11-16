import * as THREE from 'three';
import { W, D, TEXTS, BOOK, AUTHOR, PAGE_TINTS } from '@/config/book';

const PW = 1360;
const PH = Math.round((PW * D) / W);
const cache = {};

function cv(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function tex(c, repeat = false) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export async function ensureFonts() {
  try {
    if (document.fonts) await Promise.all([document.fonts.load('800 90px Vazirmatn'), document.fonts.load('500 46px Vazirmatn')]);
  } catch {
    /* فونت پیش‌فرض */
  }
}

// برجستگیِ ریزِ الیاف کاغذ
export function paperBump() {
  if (cache.bump) return cache.bump;
  const S = 256;
  const c = cv(S);
  const g = c.getContext('2d');
  g.fillStyle = '#808080';
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 900; i++) {
    const v = 90 + Math.floor(Math.random() * 110);
    g.strokeStyle = `rgba(${v},${v},${v},0.35)`;
    g.lineWidth = 0.6 + Math.random() * 1.2;
    const x = Math.random() * S;
    const y = Math.random() * S;
    const a = Math.random() * Math.PI;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * (6 + Math.random() * 18), y + Math.sin(a) * (6 + Math.random() * 18));
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  cache.bump = t;
  return t;
}

export function getPaperMaterial(color, rough = 0.92) {
  const key = color + rough;
  if (cache[key]) return cache[key];
  cache[key] = new THREE.MeshStandardMaterial({ color, roughness: rough, bumpMap: paperBump(), bumpScale: 0.4 });
  return cache[key];
}

function speckle(g, w, h, n = 900) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = Math.random() < 0.5 ? 'rgba(120,90,50,0.05)' : 'rgba(255,255,255,0.18)';
    g.beginPath();
    g.arc(Math.random() * w, Math.random() * h, 0.8 + Math.random() * 2, 0, 7);
    g.fill();
  }
}

function frame(g, w, h, col = '#C9A66B') {
  g.lineWidth = 5;
  g.strokeStyle = col;
  g.strokeRect(40, 40, w - 80, h - 80);
  g.lineWidth = 2;
  g.strokeStyle = 'rgba(201,166,107,0.55)';
  g.strokeRect(56, 56, w - 112, h - 112);
  [[40, 40], [w - 40, 40], [40, h - 40], [w - 40, h - 40]].forEach(([x, y]) => {
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(x, y - 14);
    g.lineTo(x + 14, y);
    g.lineTo(x, y + 14);
    g.lineTo(x - 14, y);
    g.fill();
  });
}

function star(g, cx, cy, r, fill) {
  g.fillStyle = fill;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  g.closePath();
  g.fill();
}

function wrap(g, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  words.forEach((w) => {
    const t = cur ? cur + ' ' + w : w;
    if (g.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  });
  if (cur) lines.push(cur);
  return lines;
}

const FA = '۰۱۲۳۴۵۶۷۸۹';
const faNum = (n) => String(n).replace(/\d/g, (d) => FA[d]);

// صفحه‌ی متن (پشتِ برگ i) - برای صفحه‌ی راست، همون‌طور که خونده می‌شه
export function makeTextPage(i) {
  const key = 'text' + i;
  if (cache[key]) return cache[key];
  const { title, body } = TEXTS[i];
  const c = cv(PW, PH);
  const g = c.getContext('2d');
  g.fillStyle = '#F6EEDC';
  g.fillRect(0, 0, PW, PH);
  speckle(g, PW, PH);
  frame(g, PW, PH);

  g.direction = 'rtl';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#3A2A55';
  g.font = '800 92px Vazirmatn, Tahoma, sans-serif';
  g.fillText(title, PW / 2, 175);
  g.strokeStyle = '#C9A66B';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(PW / 2 - 240, 250);
  g.lineTo(PW / 2 - 40, 250);
  g.moveTo(PW / 2 + 40, 250);
  g.lineTo(PW / 2 + 240, 250);
  g.stroke();
  star(g, PW / 2, 250, 16, '#C9A66B');

  g.textAlign = 'right';
  g.fillStyle = '#3B3346';
  g.font = '500 50px Vazirmatn, Tahoma, sans-serif';
  const lines = wrap(g, body, PW - 340);
  lines.forEach((l, k) => g.fillText(l, PW - 170, 350 + k * 92));

  if (i === TEXTS.length - 1) {
    g.textAlign = 'center';
    g.fillStyle = '#3A2A55';
    g.font = '800 54px Vazirmatn, Tahoma, sans-serif';
    g.fillText(AUTHOR.name, PW / 2, PH - 260);
    g.fillStyle = '#6A5F7A';
    g.font = '500 36px Vazirmatn, Tahoma, sans-serif';
    g.fillText(AUTHOR.role, PW / 2, PH - 205);
    g.font = '500 30px Vazirmatn, Tahoma, sans-serif';
    g.fillText(AUTHOR.note, PW / 2, PH - 150);
  }
  g.textAlign = 'center';
  g.fillStyle = '#9A8A6C';
  g.font = '500 34px Vazirmatn, Tahoma, sans-serif';
  g.fillText(faNum(i * 2 + 2), PW / 2, PH - 85);

  cache[key] = tex(c);
  return cache[key];
}

// صفحه‌ی زیر پاپ‌آپ (روی برگ i، i از ۱ تا ۴) - برای روی‌ِ برگ که آینه می‌شه
export function makePopupPage(i) {
  const key = 'popup' + i;
  if (cache[key]) return cache[key];
  const tint = PAGE_TINTS[i - 1] || '#2A3A5A';
  const c = cv(PW, PH);
  const g = c.getContext('2d');
  g.translate(PW, 0);
  g.scale(-1, 1);
  g.fillStyle = '#F6EEDC';
  g.fillRect(0, 0, PW, PH);
  const grad = g.createLinearGradient(0, PH, 0, 0);
  grad.addColorStop(0, tint);
  grad.addColorStop(0.55, tint + '88');
  grad.addColorStop(1, 'rgba(246,238,220,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, PW, PH);
  speckle(g, PW, PH, 700);
  frame(g, PW, PH, 'rgba(246,238,220,0.75)');
  cache[key] = tex(c);
  return cache[key];
}

// جلد
export function makeCover() {
  if (cache.cover) return cache.cover;
  const c = cv(PW, PH);
  const g = c.getContext('2d');
  g.translate(PW, 0);
  g.scale(-1, 1);
  g.fillStyle = '#1F4E5A';
  g.fillRect(0, 0, PW, PH);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)';
    g.fillRect(Math.random() * PW, Math.random() * PH, 2 + Math.random() * 3, 1 + Math.random() * 2);
  }
  frame(g, PW, PH, '#E2B65A');
  g.direction = 'rtl';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.shadowColor = 'rgba(0,0,0,0.45)';
  g.shadowBlur = 8;
  g.shadowOffsetY = 4;
  g.fillStyle = '#EBC36B';
  g.font = '800 150px Vazirmatn, Tahoma, sans-serif';
  g.fillText(BOOK.title, PW / 2, PH / 2 - 60);
  g.font = '500 56px Vazirmatn, Tahoma, sans-serif';
  g.fillStyle = '#F2DDAA';
  g.fillText(BOOK.subtitle, PW / 2, PH / 2 + 80);
  g.shadowColor = 'transparent';
  [[PW / 2, PH / 2 - 250, 34], [PW / 2 - 130, PH / 2 - 220, 18], [PW / 2 + 130, PH / 2 - 220, 18]].forEach(([x, y, r]) => star(g, x, y, r, '#EBC36B'));
  cache.cover = tex(c);
  return cache.cover;
}

// صفحه‌ی خالیِ پشتِ جلد
export function makeEndpaper() {
  if (cache.end) return cache.end;
  const c = cv(PW, PH);
  const g = c.getContext('2d');
  g.translate(PW, 0);
  g.scale(-1, 1);
  g.fillStyle = '#F2E8D2';
  g.fillRect(0, 0, PW, PH);
  speckle(g, PW, PH);
  for (let x = 120; x < PW; x += 170) for (let y = 110; y < PH; y += 170) star(g, x + ((y / 170) % 2) * 85, y, 9, 'rgba(201,166,107,0.35)');
  frame(g, PW, PH);
  cache.end = tex(c);
  return cache.end;
}
