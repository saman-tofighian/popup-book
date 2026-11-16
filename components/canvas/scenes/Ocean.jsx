'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

import * as S from '@/lib/shapes';
import { Paper, PaperShape } from '../popup';

function Slide({ shapes, color, amp = 0.15, speed = 0.5, phase = 0 }) {
  const g = useRef();
  useFrame((st) => {
    if (g.current) g.current.position.x = Math.sin(st.clock.elapsedTime * speed + phase) * amp;
  });
  return (
    <group ref={g}>
      <PaperShape shapes={shapes} color={color} />
    </group>
  );
}

function Whale() {
  const g = useRef();
  const drops = useRef([]);
  const body = useMemo(() => [S.toShape(S.whale(), 0, 0, 1.0)], []);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    if (g.current) {
      g.current.position.y = 0.25 + Math.sin(t * 0.9) * 0.06;
      g.current.rotation.z = Math.sin(t * 0.7) * 0.04;
    }
    drops.current.forEach((m, i) => {
      if (!m) return;
      const u = (t * 0.7 + i * 0.2) % 1;
      m.position.set(-0.3 + Math.sin(i * 2.1) * 0.06 * u, 0.6 + u * 0.55 - u * u * 0.25, 0.01);
      m.scale.setScalar(0.6 + (1 - u) * 0.6);
      m.visible = true;
    });
  });
  return (
    <group ref={g} position={[0, 0.25, 0]}>
      <PaperShape shapes={body} color="#33608F" />
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} ref={(el) => (drops.current[i] = el)}>
          <circleGeometry args={[0.035, 10]} />
          <meshStandardMaterial color="#D9F3FF" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Boat() {
  const g = useRef();
  const hull = useMemo(() => [S.toShape(S.boatHull())], []);
  const sailA = useMemo(() => [S.toShape(S.sail(0.34, 0.6, 1), 0.02, 0.16)], []);
  const sailB = useMemo(() => [S.toShape(S.sail(0.22, 0.42, -1), -0.02, 0.16)], []);
  const mast = useMemo(() => [S.toShape(S.rect(0.02, 0.7), 0, 0.14)], []);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    if (!g.current) return;
    g.current.position.y = 0.16 + Math.sin(t * 1.3) * 0.045;
    g.current.rotation.z = Math.sin(t * 1.1) * 0.07;
  });
  return (
    <group ref={g} position={[0, 0.16, 0]}>
      <PaperShape shapes={hull} color="#D9534F" />
      <PaperShape shapes={mast} color="#6B4A2B" position={[0, 0, 0.012]} />
      <PaperShape shapes={sailA} color="#FFF6E5" position={[0, 0, 0.026]} />
      <PaperShape shapes={sailB} color="#FFE3B5" position={[0, 0, 0.026]} />
    </group>
  );
}

export default function Ocean() {
  const d = useMemo(
    () => ({
      sky: [S.toShape(S.rect(3.34, 2.5))],
      sun: [S.toShape(S.disc(0.42), 0.9, 1.75)],
      clouds: [S.toShape(S.cloud(0.95, 0.4), -0.7, 1.75), S.toShape(S.cloud(0.65, 0.28), 0.1, 1.35), S.toShape(S.cloud(0.5, 0.22), 1.25, 1.2)],
      far: [S.toShape(S.waves(3.34, 0.05, 3, 0.4, 0.62))],
      mid: [S.toShape(S.waves(3.7, 0.08, 2.6, 0, 0.45))],
      front: [S.toShape(S.waves(3.7, 0.1, 2.2, 1.6, 0.34))],
    }),
    []
  );
  return (
    <>
      <Paper shapes={d.sky} color="#8FD3EE" z={-1.22} order={0} h={2.5} />
      <Paper shapes={d.sun} color="#FFD35A" z={-1.19} order={0.04} h={2.3} />
      <Paper shapes={d.clouds} color="#FFFFFF" z={-1.15} order={0.08} h={2.2} />
      <Paper shapes={d.far} color="#56B4D3" z={-0.95} order={0.2} h={0.8} />
      <Paper shapes={null} x={1.0} z={-0.6} order={0.35} h={1}>
        <Whale />
      </Paper>
      <Paper shapes={null} x={1.7} z={-0.3} order={0.5} h={0.6}>
        <Slide shapes={d.mid} color="#3290B8" amp={0.15} speed={0.5} />
      </Paper>
      <Paper shapes={null} x={2.35} z={0.08} order={0.65} h={0.9}>
        <Boat />
      </Paper>
      <Paper shapes={null} x={1.7} z={0.5} order={0.85} h={0.5}>
        <Slide shapes={d.front} color="#1F77A6" amp={0.15} speed={0.6} phase={2} />
      </Paper>
    </>
  );
}
