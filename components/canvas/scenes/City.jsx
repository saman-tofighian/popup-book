'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import * as S from '@/lib/shapes';
import { seededRandom } from '@/config/noise';
import { Paper, PaperShape } from '../popup';

// پنجره‌های روشن (پشتِ بُرش‌ها) که چشمک می‌زنن
function WindowGlow({ centers, z = -0.03, w = 0.075, h = 0.105 }) {
  const ref = useRef();
  const rnd = useMemo(() => seededRandom(21), []);
  const phases = useMemo(() => centers.map(() => rnd() * 6), [centers, rnd]);
  const lit = useMemo(() => centers.map(() => rnd() > 0.3), [centers, rnd]);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const mat = new THREE.Matrix4();
    centers.forEach(([x, y], i) => {
      mat.makeTranslation(x, y, z);
      m.setMatrixAt(i, mat);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [centers, z]);
  useFrame((st) => {
    const m = ref.current;
    if (!m) return;
    const t = st.clock.elapsedTime;
    const c = new THREE.Color();
    centers.forEach((_, i) => {
      const k = lit[i] ? 0.75 + 0.25 * Math.sin(t * 1.4 + phases[i]) : 0.05;
      m.setColorAt(i, c.setRGB(1.0 * k, 0.78 * k, 0.34 * k));
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, centers.length]} frustumCulled={false}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function Tram() {
  const g = useRef();
  const shapes = useMemo(() => [S.toShape(S.tram())], []);
  useFrame((st) => {
    if (g.current) g.current.position.x = Math.sin(st.clock.elapsedTime * 0.45) * 1.15;
  });
  return (
    <group ref={g}>
      <PaperShape shapes={shapes} color="#E0574F" />
    </group>
  );
}

function Balloon() {
  const g = useRef();
  const body = useMemo(() => [S.toShape(S.balloon())], []);
  const bas = useMemo(() => [S.toShape(S.basket())], []);
  useFrame((st) => {
    if (!g.current) return;
    const t = st.clock.elapsedTime;
    g.current.position.y = 1.25 + Math.sin(t * 0.8) * 0.07;
    g.current.rotation.z = Math.sin(t * 0.6) * 0.05;
  });
  return (
    <group ref={g} position={[0, 1.25, 0]}>
      <PaperShape shapes={body} color="#F0675A" />
      <PaperShape shapes={bas} color="#7A4B2A" />
    </group>
  );
}

export default function City() {
  const d = useMemo(() => {
    const mid = S.skyline(3.3, 0.55, 1.3, 9, true);
    const tower = S.clockTower(0.36, 1.15);
    return {
      sky: [S.toShape(S.rect(3.34, 2.5))],
      sun: [S.toShape(S.disc(0.38), -0.95, 1.7)],
      clouds: [S.toShape(S.cloud(0.9, 0.35), 0.7, 1.9), S.toShape(S.cloud(0.6, 0.25), -0.3, 1.45)],
      far: [S.toShape(S.skyline(3.3, 0.7, 1.55, 3, false).outer ? S.skyline(3.3, 0.7, 1.55, 3, false) : mid)],
      mid: [S.toShape(mid)],
      midWin: mid.windows,
      tower: [S.toShape(tower)],
      street: [S.toShape(S.rect(3.34, 0.14))],
      lamps: [-1.2, -0.3, 0.7, 1.4].map((x) => S.toShape(S.lamp(), x, 0)),
      front: [S.toShape(S.building(0.55, 1.2, 0.3, 3, 4), -1.38, 0), S.toShape(S.building(0.45, 0.9, 0.22, 2, 3), 1.42, 0)],
    };
  }, []);

  return (
    <>
      <Paper shapes={d.sky} color="#5E4B8B" z={-1.22} order={0} h={2.5} />
      <Paper shapes={d.sun} color="#FFD8A8" z={-1.19} order={0.04} h={2.2} />
      <Paper shapes={d.clouds} color="#9A84BF" z={-1.15} order={0.08} h={2.2} />
      <Paper shapes={d.far} color="#493A78" z={-0.95} order={0.2} />
      <Paper shapes={d.mid} color="#352A63" z={-0.6} order={0.38}>
        <WindowGlow centers={d.midWin} />
      </Paper>
      <Paper shapes={d.tower} color="#2B2250" x={2.5} z={-0.3} order={0.55}>
        <mesh position={[0, 0.9, -0.03]}>
          <circleGeometry args={[0.1, 20]} />
          <meshBasicMaterial color="#FFE6A8" toneMapped={false} />
        </mesh>
      </Paper>
      <Paper shapes={d.street} color="#1B1632" z={0.1} order={0.7} h={0.2} />
      <Paper shapes={null} x={1.7} z={0.2} order={0.8} h={0.5}>
        <Tram />
      </Paper>
      <Paper shapes={d.lamps} color="#2A2147" z={0.4} order={0.85} h={0.5}>
        {[-1.2, -0.3, 0.7, 1.4].map((x) => (
          <mesh key={x} position={[x + 0.05, 0.46, 0.02]}>
            <sphereGeometry args={[0.04, 10, 8]} />
            <meshBasicMaterial color="#FFE08A" toneMapped={false} />
          </mesh>
        ))}
      </Paper>
      <Paper shapes={null} x={0.9} z={-0.45} order={0.45} h={2}>
        <Balloon />
      </Paper>
      <Paper shapes={d.front} color="#1A1530" z={0.75} order={0.95} />
    </>
  );
}
