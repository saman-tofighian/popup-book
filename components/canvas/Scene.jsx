'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { BackSide } from 'three';
import * as THREE from 'three';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';

import state from '@/store';
import { W } from '@/config/book';
import Book from './Book';

const BG = '#241F33';

// دوربین ریسپانسیو: صفحه‌ی فعال رو بر اساس نسبت صفحه و فضای UI قاب می‌کنه
function Rig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const mem = useRef({ auto: null, ox: 0, oy: 0 });
  const tmp = useRef(new THREE.Vector3());

  useFrame((st, delta) => {
    const controls = st.controls;
    if (!controls) return;
    const m = mem.current;
    const Wp = size.width;
    const Hp = size.height;
    const portrait = Wp / Hp < 1;
    const topIn = 56;
    const botIn = portrait ? 290 : 100;
    const availH = Math.max(160, Hp - topIn - botIn);
    const objW = portrait ? W + 0.7 : 2 * W + 0.8;
    const objH = 3.9;
    const s = state.page;

    // مرکزِ تصویر در مختصاتِ محلیِ کتاب (کتاب آینه‌ست پس علامت برعکس می‌شه)
    let lx = 0;
    if (s === 0) lx = W / 2;
    else if (portrait) lx = s <= 4 ? W / 2 : -W / 2;
    const wantTx = -lx;

    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const factor = Math.max(objH / (availH * 0.92), objW / (Wp * 0.94));
    const desired = THREE.MathUtils.clamp(((Hp / 2) / tan) * factor, 4, 30);
    const wantTy = 0.95;
    const wantOy = Hp / 2 - (topIn + availH / 2);

    if (m.auto === null) {
      m.auto = desired;
      m.oy = wantOy;
      controls.target.set(wantTx, wantTy, 0);
      tmp.current.copy(camera.position).sub(controls.target).normalize().multiplyScalar(desired);
      camera.position.copy(controls.target).add(tmp.current);
    }

    const prevAuto = m.auto;
    m.auto = THREE.MathUtils.damp(m.auto, desired, 3, delta);
    const dir = tmp.current.copy(camera.position).sub(controls.target);
    let dist = dir.length() + (m.auto - prevAuto);
    dist = THREE.MathUtils.clamp(dist, 3, 34);
    dir.normalize();

    const px = controls.target.x;
    controls.target.x = THREE.MathUtils.damp(px, wantTx, 3.2, delta);
    controls.target.y = THREE.MathUtils.damp(controls.target.y, wantTy, 4, delta);
    camera.position.copy(controls.target).addScaledVector(dir, dist);

    m.oy = THREE.MathUtils.damp(m.oy, wantOy, 6, delta);
    camera.setViewOffset(Wp, Hp, 0, m.oy, Wp, Hp);
  });
  return null;
}

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 6, 6.6], fov: 32, near: 0.1, far: 90 }}
      gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'none' }}
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 16, 40]} />
      <ambientLight intensity={0.45} color="#E9E2FF" />
      <directionalLight
        position={[-4.5, 8, 5.5]}
        intensity={2.6}
        color="#FFE3BC"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-6.5, 6.5, 5, -5, 1, 26]} />
      </directionalLight>
      <directionalLight position={[5, 4, -3]} intensity={0.5} color="#9DB4FF" />

      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <mesh scale={60}>
            <sphereGeometry args={[1, 32, 16]} />
            <meshBasicMaterial color="#6E6486" side={BackSide} />
          </mesh>
          <Lightformer form="rect" intensity={1.6} position={[0, 6, 0]} scale={[10, 10, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={1.0} color="#FFE6C2" position={[-6, 3, 4]} scale={[6, 6, 1]} target={[0, 1, 0]} />
        </Environment>

        {/* میز */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[120, 120]} />
          <meshStandardMaterial color="#3A3150" roughness={1} />
        </mesh>

        <Book />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={3}
        maxDistance={34}
        minPolarAngle={0.35}
        maxPolarAngle={1.3}
        minAzimuthAngle={-0.8}
        maxAzimuthAngle={0.8}
        rotateSpeed={0.6}
      />
      <Rig />
    </Canvas>
  );
}
