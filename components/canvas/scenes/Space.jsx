'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

import * as S from '@/lib/shapes';
import { seededRandom } from '@/config/noise';
import { Paper, PaperShape } from '../popup';

function Twinkle({ shapes, color }) {
  const g = useRef();
  useFrame((st) => {
    if (g.current) g.current.scale.setScalar(0.92 + Math.sin(st.clock.elapsedTime * 2.2) * 0.08);
  });
  return (
    <group ref={g}>
      <PaperShape shapes={shapes} color={color} />
    </group>
  );
}

function Rocket() {
  const g = useRef();
  const flame = useRef();
  const body = useMemo(() => [S.toShape(S.rocket())], []);
  const finR = useMemo(() => [S.toShape(S.rocketFin())], []);
  const finL = useMemo(() => [S.toShape(S.rocketFin(), 0, 0, -1, 1)], []);
  const fl = useMemo(() => [S.toShape({ outer: [[-0.1, 0], [0.1, 0], [0, -0.32]], holes: [] })], []);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    if (g.current) {
      g.current.position.y = 0.5 + Math.sin(t * 1.4) * 0.07;
      g.current.rotation.z = -0.12 + Math.sin(t * 0.9) * 0.03;
    }
    if (flame.current) flame.current.scale.set(0.9 + Math.sin(t * 22) * 0.12, 0.85 + Math.sin(t * 17) * 0.25, 1);
  });
  return (
    <group ref={g} position={[0, 0.5, 0]}>
      <PaperShape shapes={finR} color="#E24B4B" position={[0, 0, -0.012]} />
      <PaperShape shapes={finL} color="#E24B4B" position={[0, 0, -0.012]} />
      <PaperShape shapes={body} color="#F1F1F4" />
      <group ref={flame} position={[0, 0.0, 0.004]}>
        <PaperShape shapes={fl} color="#FFA63D" depth={0.006} />
      </group>
    </group>
  );
}

export default function Space() {
  const d = useMemo(() => {
    const rnd = seededRandom(31);
    const starsA = Array.from({ length: 22 }, () => S.toShape(S.star(0.035 + rnd() * 0.03), -1.55 + rnd() * 3.1, 0.3 + rnd() * 2.0));
    const starsB = Array.from({ length: 14 }, () => S.toShape(S.star(0.03 + rnd() * 0.03), -1.55 + rnd() * 3.1, 0.3 + rnd() * 2.0));
    return {
      bg: [S.toShape(S.rect(3.34, 2.5))],
      starsA,
      starsB,
      planet: [S.toShape(S.disc(0.42))],
      ring: [S.toShape(S.ringShape(0.78, 0.24, 0.1))],
      moon: [S.toShape(S.moonDisc(0.3, 8))],
      rocks: [S.toShape(S.disc(0.07, 8), -1.1, 0.3), S.toShape(S.disc(0.05, 8), -0.7, 0.55), S.toShape(S.disc(0.09, 8), 1.35, 0.35)],
      ground: [S.toShape(S.hill(3.34, 0.36, 12, 1.6))],
    };
  }, []);
  return (
    <>
      <Paper shapes={d.bg} color="#171445" z={-1.22} order={0} h={2.5} />
      <Paper shapes={null} x={1.7} z={-1.18} order={0.05} h={2.4}>
        <Twinkle shapes={d.starsA} color="#FFF6C9" />
      </Paper>
      <Paper shapes={null} x={1.7} z={-1.1} order={0.1} h={2.4}>
        <Twinkle shapes={d.starsB} color="#C9D6FF" />
      </Paper>
      <Paper shapes={null} x={2.5} z={-0.85} order={0.25} h={1.6}>
        <group position={[0, 1.2, 0]} rotation={[0, 0, 0.35]}>
          <PaperShape shapes={d.ring} color="#F1CB93" />
          <PaperShape shapes={d.planet} color="#E58E4B" position={[0, 0, 0.03]} />
        </group>
      </Paper>
      <Paper shapes={d.moon} color="#C9CCDA" x={0.8} z={-0.5} order={0.4} h={1.9}>
        <group position={[0, 1.5, 0]} />
      </Paper>
      <Paper shapes={null} x={1.55} z={0.1} order={0.6} h={1.2}>
        <Rocket />
      </Paper>
      <Paper shapes={d.rocks} color="#8E88A8" z={0.5} order={0.8} h={0.7} />
      <Paper shapes={d.ground} color="#2D2A66" z={0.85} order={0.95} h={0.5} />
    </>
  );
}
