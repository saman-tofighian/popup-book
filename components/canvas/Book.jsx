'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSnapshot } from 'valtio';

import state from '@/store';
import { next, prev } from '@/store/actions';
import { W, D } from '@/config/book';
import { ensureFonts, makeTextPage, makePopupPage, makeCover, makeEndpaper } from '@/lib/paper';
import { NX, PopupCtx } from './popup';
import Forest from './scenes/Forest';
import City from './scenes/City';
import Ocean from './scenes/Ocean';
import Space from './scenes/Space';

const L = 5; // تعداد برگ‌ها (برگِ ۰ = جلد)
const K = L - 1;
const H_STEP = 0.09; // فاصله‌ی لولای برگ‌ها از هم
const FAN = 0.02; // بازشدگیِ زاویه‌ای پشته
const BASE_Y = 0.06;
const SCENES = { 1: Forest, 2: City, 3: Ocean, 4: Space };
const clamp = THREE.MathUtils.clamp;

function makeLeafGeometry() {
  const g = new THREE.BufferGeometry();
  const n = (NX + 1) * 2;
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const uv = new Float32Array(n * 2);
  for (let k = 0; k <= NX; k++) {
    uv[k * 4] = k / NX;
    uv[k * 4 + 1] = 1;
    uv[k * 4 + 2] = k / NX;
    uv[k * 4 + 3] = 0;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const idx = [];
  for (let k = 0; k < NX; k++) {
    const a = k * 2;
    idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }
  g.setIndex(idx);
  return g;
}

function computeNodes(nodes, theta, curl) {
  const dx = W / NX;
  let x = 0;
  let y = 0;
  nodes[0] = 0;
  nodes[1] = 0;
  nodes[2] = theta;
  for (let k = 1; k <= NX; k++) {
    const p0 = theta - curl * Math.pow((k - 1) / NX, 1.4);
    const p1 = theta - curl * Math.pow(k / NX, 1.4);
    const pm = (p0 + p1) / 2;
    x += dx * Math.cos(pm);
    y += dx * Math.sin(pm);
    nodes[k * 3] = x;
    nodes[k * 3 + 1] = y;
    nodes[k * 3 + 2] = p1;
  }
}

function updateLeafGeometry(geo, nodes) {
  const pos = geo.attributes.position.array;
  for (let k = 0; k <= NX; k++) {
    const x = nodes[k * 3];
    const y = nodes[k * 3 + 1];
    const i = k * 6;
    pos[i] = x;
    pos[i + 1] = y;
    pos[i + 2] = -D / 2;
    pos[i + 3] = x;
    pos[i + 4] = y;
    pos[i + 5] = D / 2;
  }
  geo.attributes.position.needsUpdate = true;
  geo.computeVertexNormals();
}

// بلوکِ ضخامتِ دسته‌ی صفحه‌ها (گوِه‌ای شکل)
function makeWedge() {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(36 * 3), 3));
  return g;
}
function setWedge(g, X, hs, he) {
  const z0 = -D / 2;
  const z1 = D / 2;
  const b0 = [0, 0, z0], b1 = [X, 0, z0], b2 = [X, 0, z1], b3 = [0, 0, z1];
  const t0 = [0, hs, z0], t1 = [X, he, z0], t2 = [X, he, z1], t3 = [0, hs, z1];
  const quads = [[b0, b1, b2, b3], [t0, t3, t2, t1], [b3, b2, t2, t3], [b0, t0, t1, b1], [b1, t1, t2, b2], [b0, b3, t3, t0]];
  const arr = g.attributes.position.array;
  let o = 0;
  quads.forEach(([a, b, c, d]) => {
    [a, b, c, a, c, d].forEach((v) => {
      arr[o++] = v[0];
      arr[o++] = v[1];
      arr[o++] = v[2];
    });
  });
  g.attributes.position.needsUpdate = true;
  g.computeVertexNormals();
}

export default function Book() {
  const snap = useSnapshot(state);
  const ready = snap.ready;

  useEffect(() => {
    let alive = true;
    ensureFonts().then(() => alive && (state.ready = true));
    return () => {
      alive = false;
    };
  }, []);

  const sim = useRef(null);
  if (!sim.current) {
    sim.current = {
      prev: 0,
      leaves: Array.from({ length: L }, () => {
        const nodes = new Float32Array((NX + 1) * 3);
        computeNodes(nodes, 0, 0);
        return { t: 0, v: 0, fold: 0, foldV: 0, target: 0, sched: null, nodes, ctx: { curve: { current: nodes }, fold: { current: 0 } } };
      }),
    };
  }

  const groups = useRef([]);
  const geos = useMemo(() => Array.from({ length: L }, (_, i) => (i === 0 ? null : makeLeafGeometry())), []);
  const wedgeR = useMemo(() => makeWedge(), []);
  const wedgeL = useMemo(() => makeWedge(), []);
  const wedgeRMesh = useRef();
  const wedgeLMesh = useRef();

  const flat = useMemo(() => {
    const g = new THREE.PlaneGeometry(W + 0.12, D + 0.14);
    g.rotateX(-Math.PI / 2);
    g.translate(W / 2 + 0.02, 0, 0);
    return g;
  }, []);

  useFrame((_, delta) => {
    if (!state.ready) return;
    const dt = Math.min(delta, 0.05);
    const now = performance.now() / 1000;
    const S = sim.current;
    const s = state.page;

    if (S.prev !== s) {
      const a = S.prev;
      if (s > a) for (let i = a; i < s; i++) S.leaves[i].sched = { to: 1, at: now + (i - a) * 0.13 };
      else for (let i = a - 1; i >= s; i--) S.leaves[i].sched = { to: 0, at: now + (a - 1 - i) * 0.13 };
      S.prev = s;
    }

    let rightCount = 0;
    let leftCount = 0;
    S.leaves.forEach((lf, i) => {
      if (lf.sched && now >= lf.sched.at) {
        lf.target = lf.sched.to;
        lf.sched = null;
      }
      lf.v += (34 * (lf.target - lf.t) - 11 * lf.v) * dt;
      lf.t += lf.v * dt;
      if (lf.t < 0) { lf.t = 0; lf.v = 0; }
      if (lf.t > 1) { lf.t = 1; lf.v = 0; }

      if (i >= 1) {
        const p = S.leaves[i - 1];
        const settled = lf.t < 0.015 && Math.abs(lf.v) < 0.05 && p.t > 0.985 && Math.abs(p.v) < 0.05 && !lf.sched;
        const want = i === s && settled && lf.target === 0 ? 1 : 0;
        const k = want ? 80 : 160;
        const c = want ? 11 : 22;
        lf.foldV += (k * (want - lf.fold) - c * lf.foldV) * dt;
        lf.fold = clamp(lf.fold + lf.foldV * dt, -0.05, 1.15);
        lf.ctx.fold.current = lf.fold;
      }

      const t = lf.t;
      const hingeY = BASE_Y + ((1 - t) * (K - i) + t * i) * H_STEP;
      const theta = Math.PI * t + (1 - t) * (K - i) * FAN - t * i * FAN;
      const g = groups.current[i];
      if (g) {
        g.position.y = hingeY;
        if (i === 0) g.rotation.z = theta;
      }
      if (i >= 1) {
        const curl = clamp(lf.v * 0.32, -0.75, 0.75) * Math.sin(Math.PI * t);
        computeNodes(lf.nodes, theta, curl);
        updateLeafGeometry(geos[i], lf.nodes);
      }
      rightCount += 1 - t;
      leftCount += t;
    });

    const wr = wedgeRMesh.current;
    const wl = wedgeLMesh.current;
    if (wr) {
      wr.visible = rightCount > 0.03;
      if (wr.visible) {
        const hs = Math.max(0.03, BASE_Y + (rightCount - 1) * H_STEP - 0.014);
        const fan = Math.max(rightCount - 1, 0) * FAN;
        setWedge(wedgeR, W, hs, hs + W * Math.tan(fan));
      }
    }
    if (wl) {
      wl.visible = leftCount > 0.03;
      if (wl.visible) {
        const hs = Math.max(0.03, BASE_Y + (leftCount - 1) * H_STEP - 0.014);
        const fan = Math.max(leftCount - 1, 0) * FAN;
        setWedge(wedgeL, -W, hs, hs + W * Math.tan(fan));
      }
    }
  });

  const mats = useMemo(() => {
    if (!ready) return null;
    const m = (map, side) => new THREE.MeshStandardMaterial({ map, roughness: 0.9, side });
    return {
      cover: m(makeCover(), THREE.FrontSide),
      coverBack: m(makeTextPage(0), THREE.BackSide),
      end: m(makeEndpaper(), THREE.FrontSide),
      front: [null, 1, 2, 3, 4].map((i) => (i ? m(makePopupPage(i), THREE.FrontSide) : null)),
      back: [null, 1, 2, 3, 4].map((i) => (i ? m(makeTextPage(i), THREE.BackSide) : null)),
    };
  }, [ready]);

  if (!ready || !mats) return null;

  const turnClick = (i) => (e) => {
    if (e.delta > 8) return;
    e.stopPropagation();
    if (sim.current.leaves[i].t < 0.5) next();
    else prev();
  };

  return (
    <group scale={[-1, 1, 1]}>
      {/* جلدِ پشت (ثابت) */}
      <mesh position={[W / 2 + 0.02, 0.0225, 0]} receiveShadow castShadow>
        <boxGeometry args={[W + 0.12, 0.045, D + 0.14]} />
        <meshStandardMaterial color="#1F4E5A" roughness={0.85} />
      </mesh>
      <mesh geometry={flat} position={[0, 0.0465, 0]} material={mats.end} receiveShadow />

      <mesh ref={wedgeRMesh} receiveShadow castShadow>
        <primitive object={wedgeR} attach="geometry" />
        <meshStandardMaterial color="#EADFC8" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={wedgeLMesh} receiveShadow castShadow>
        <primitive object={wedgeL} attach="geometry" />
        <meshStandardMaterial color="#EADFC8" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* جلدِ جلو (برگِ ۰) */}
      <group ref={(el) => (groups.current[0] = el)} position={[0, BASE_Y, 0]}>
        <mesh geometry={flat} position={[0, 0.002, 0]} material={mats.cover} castShadow receiveShadow onClick={turnClick(0)} />
        <mesh geometry={flat} position={[0, -0.05, 0]} material={mats.coverBack} receiveShadow onClick={turnClick(0)} />
        <mesh position={[W / 2 + 0.02, -0.024, 0]} castShadow receiveShadow>
          <boxGeometry args={[W + 0.12, 0.048, D + 0.14]} />
          <meshStandardMaterial color="#1F4E5A" roughness={0.85} />
        </mesh>
      </group>

      {[1, 2, 3, 4].map((i) => {
        const Scene = SCENES[i];
        const show = Math.abs(i - snap.page) <= 1;
        return (
          <group key={i} ref={(el) => (groups.current[i] = el)} position={[0, BASE_Y, 0]}>
            <mesh geometry={geos[i]} material={mats.front[i]} castShadow receiveShadow frustumCulled={false} onClick={turnClick(i)} />
            <mesh geometry={geos[i]} material={mats.back[i]} castShadow receiveShadow frustumCulled={false} onClick={turnClick(i)} />
            {show && (
              <PopupCtx.Provider value={sim.current.leaves[i].ctx}>
                <Scene />
              </PopupCtx.Provider>
            )}
          </group>
        );
      })}
    </group>
  );
}
