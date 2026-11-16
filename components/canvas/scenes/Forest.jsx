'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

import * as S from '@/lib/shapes';
import { Paper } from '../popup';

function Fireflies() {
  const refs = useRef([]);
  const seeds = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ a: i * 1.7, b: i * 0.9 + 1, cx: -0.9 + (i % 5) * 0.55, cy: 0.35 + (i % 3) * 0.28 })), []);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    seeds.forEach((s, i) => {
      const m = refs.current[i];
      if (!m) return;
      m.position.set(s.cx + Math.sin(t * 0.7 + s.a) * 0.25, s.cy + Math.sin(t * 0.9 + s.b) * 0.12, 0.05);
      m.material.emissiveIntensity = 1.2 + Math.sin(t * 3 + s.a * 2) * 1.0;
    });
  });
  return (
    <group>
      {seeds.map((_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)}>
          <sphereGeometry args={[0.022, 10, 8]} />
          <meshStandardMaterial color="#FFF4B0" emissive="#FFE066" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export default function Forest() {
  const g = useMemo(() => {
    const stars = [[-1.2, 2.0, 0.07], [-0.6, 2.25, 0.05], [0.1, 2.05, 0.06], [0.7, 2.3, 0.05], [1.3, 1.95, 0.07], [-0.3, 1.7, 0.04], [0.95, 1.7, 0.045]];
    const pines = [-1.35, -0.9, -0.5, 0.05, 0.5, 0.95, 1.4].map((dx, i) => S.toShape(S.pine(0.42 + (i % 3) * 0.07, 0.95 + (i % 4) * 0.12), dx, 0));
    const front = [
      S.toShape(S.roundTree(0.8, 1.15, 4), -1.35, 0),
      S.toShape(S.roundTree(0.6, 0.85, 7), 1.35, 0),
    ];
    const foxD = S.fox();
    return {
      sky: [S.toShape(S.rect(3.34, 2.5))],
      moon: [S.toShape(S.crescent(0.34, 0.16, 0.28), 0.85, 1.85)],
      stars: stars.map(([x, y, r]) => S.toShape(S.star(r), x, y)),
      farHills: [S.toShape(S.hill(3.34, 1.1, 4, 2.4))],
      pines,
      hill: [S.toShape(S.hill(3.34, 0.75, 7, 2))],
      fox: [S.toShape(foxD, -0.42, 0, 0.9)],
      chest: [S.toShape(S.foxChest(), -0.42, 0, 0.9)],
      front: front.flat(),
      frontTrunk: [S.toShape(S.rect(0.07, 0.5), -1.35, 0), S.toShape(S.rect(0.06, 0.4), 1.35, 0)],
      mush: [S.toShape(S.mushroom(0.16), -0.55, 0), S.toShape(S.mushroom(0.11), -0.3, 0), S.toShape(S.mushroom(0.13), 0.25, 0)],
    };
  }, []);

  return (
    <>
      <Paper shapes={g.sky} color="#1E2A55" z={-1.22} order={0} h={2.5} />
      <Paper shapes={g.moon} color="#F8E9B5" z={-1.18} order={0.04} h={2.2} />
      <Paper shapes={g.stars} color="#FFF1B8" z={-1.16} order={0.06} h={2.4} />
      <Paper shapes={g.farHills} color="#2C4F73" z={-0.98} order={0.15} />
      <Paper shapes={g.pines} color="#1D4A4F" z={-0.7} order={0.3} />
      <Paper shapes={g.hill} color="#2F6B57" z={-0.35} order={0.45}>
        <Fireflies />
      </Paper>
      <Paper shapes={g.fox} color="#E98A3C" x={2.1} z={0.0} order={0.6} />
      <Paper shapes={g.chest} color="#FFF3E0" x={2.1} z={0.012} order={0.62} />
      <Paper shapes={g.front} color="#143D36" z={0.5} order={0.8} />
      <Paper shapes={g.frontTrunk} color="#0E2B27" z={0.49} order={0.78} />
      <Paper shapes={g.mush} color="#E4573D" z={0.78} order={0.92} />
    </>
  );
}
