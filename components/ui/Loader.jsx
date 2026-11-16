'use client';

import { useSnapshot } from 'valtio';

import state from '@/store';

export default function Loader() {
  const snap = useSnapshot(state);
  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col justify-center items-center gap-3 bg-night transition-opacity duration-700 ${
        snap.ready ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <span className="text-5xl animate-bounce">📖</span>
      <p className="text-paper/60 text-sm">در حال باز کردن کتاب…</p>
    </div>
  );
}
