'use client';

import { useRef } from 'react';
import { useSnapshot } from 'valtio';

import state from '@/store';
import { next, prev } from '@/store/actions';
import { TEXTS, BOOK, AUTHOR } from '@/config/book';

// روی گوشیِ عمودی، متنِ صفحه‌ی راست به‌صورت کارتِ پایین نمایش داده می‌شه
export default function Caption() {
  const snap = useSnapshot(state);
  const start = useRef(null);
  const item = snap.page >= 1 ? TEXTS[snap.page - 1] : { title: BOOK.title, body: BOOK.subtitle };

  const onTouchStart = (e) => {
    start.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (start.current == null) return;
    const dx = e.changedTouches[0].clientX - start.current;
    start.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx > 0) next();
    else prev();
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="hidden portrait:block right-3 bottom-[5.25rem] left-3 z-10 fixed bg-paper/95 shadow-2xl backdrop-blur px-5 py-4 rounded-3xl max-h-[34dvh] overflow-y-auto"
    >
      <h2 className="mb-1 font-extrabold text-ink text-lg">{item.title}</h2>
      <p className="text-ink/75 text-[13px] leading-7">{item.body}</p>
      {snap.page === 5 && (
        <p className="mt-2 font-bold text-ink/80 text-xs">
          {AUTHOR.name} · {AUTHOR.role}
        </p>
      )}
    </div>
  );
}
