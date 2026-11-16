'use client';

import { createContext, useContext, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import { W, D } from '@/config/book';
import { getPaperMaterial } from '@/lib/paper';

export const NX = 28;
// curve: Float32Array [x, y, phi] برای هر گره‌ی صفحه  |  fold: عددِ فنری ۰ (تخت) تا ۱ (ایستاده)
export const PopupCtx = createContext(null);

function useExtruded(shapes, depth) {
  return useMemo(() => {
    if (!shapes || !shapes.length) return null;
    const g = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: false, curveSegments: 10 });
    g.computeBoundingBox();
    return g;
  }, [shapes, depth]);
}

// فقط یه تکه‌ی کاغذیِ ثابت (برای قراردادن داخل گروه‌های متحرک)
export function PaperShape({ shapes, color = '#ffffff', depth = 0.014, position, rotation, scale }) {
  const geo = useExtruded(shapes, depth);
  const mat = useMemo(() => getPaperMaterial(color), [color]);
  if (!geo) return null;
  return <mesh geometry={geo} material={mat} position={position} rotation={rotation} scale={scale} castShadow receiveShadow />;
}

// یک لایه‌ی پاپ‌آپ: لولا روی صفحه، با باز شدنِ کتاب از حالت تخت بلند می‌شه (فنری)
export function Paper({ shapes, color = '#ffffff', x = W / 2, z = 0, order = 0, depth = 0.014, h = 1.4, children }) {
  const ctx = useContext(PopupCtx);
  const outer = useRef();
  const inner = useRef();
  const geo = useExtruded(shapes, depth);
  const mat = useMemo(() => getPaperMaterial(color), [color]);
  const height = geo ? geo.boundingBox.max.y : h;

  const dir = useMemo(() => {
    const plus = D / 2 - 0.05 - z;
    const minus = z + D / 2 - 0.05;
    const okP = plus >= height;
    const okM = minus >= height;
    if (okP && okM) return z <= 0.2 ? 1 : -1;
    if (okP) return 1;
    if (okM) return -1;
    return plus > minus ? 1 : -1;
  }, [z, height]);

  useFrame(() => {
    if (!ctx || !outer.current) return;
    const nodes = ctx.curve.current;
    const f = ctx.fold.current;
    const eff = THREE.MathUtils.clamp(f * 1.3 - 0.3 * order, -0.05, 1.12);
    const u = THREE.MathUtils.clamp(x / W, 0, 1) * NX;
    const i0 = Math.min(Math.floor(u), NX - 1);
    const fr = u - i0;
    const a = i0 * 3;
    const b = a + 3;
    outer.current.position.set(
      nodes[a] + (nodes[b] - nodes[a]) * fr,
      nodes[a + 1] + (nodes[b + 1] - nodes[a + 1]) * fr,
      z
    );
    outer.current.rotation.z = nodes[a + 2] + (nodes[b + 2] - nodes[a + 2]) * fr;
    const e = Math.min(Math.max(eff, 0), 1);
    inner.current.position.y = 0.006 + (1 - e) * order * 0.05;
    inner.current.rotation.x = dir * (Math.PI / 2) * (1 - eff);
  });

  return (
    <group ref={outer}>
      <group ref={inner}>
        {geo && <mesh geometry={geo} material={mat} castShadow receiveShadow />}
        {children}
      </group>
    </group>
  );
}
