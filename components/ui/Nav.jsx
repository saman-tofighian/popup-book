'use client';

import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

import state, { LAST_PAGE } from '@/store';
import { next, prev, goto } from '@/store/actions';
import { BOOK } from '@/config/book';

export default function Nav() {
  const snap = useSnapshot(state);

  // کلیدهای جهت‌دار (کتاب راست‌به‌چپه: چپ = ورق بعدی)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <nav className="right-0 bottom-0 left-0 z-20 fixed flex flex-col items-center gap-2 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none" aria-label="ناوبری کتاب">
      {snap.page === 0 && (
        <p className="bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-paper/80 text-xs animate-pulse">{BOOK.hint} ←</p>
      )}
      <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 border border-white/10 rounded-full h-14 pointer-events-auto">
        <button
          onClick={prev}
          disabled={snap.page === 0}
          aria-label="ورق قبلی"
          className="flex justify-center items-center bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-full w-10 h-10 text-paper cursor-pointer"
        >
          <HiChevronRight size={20} />
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: LAST_PAGE + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => goto(i)}
              aria-label={`صفحه ${i}`}
              className={`rounded-full transition-all cursor-pointer ${snap.page === i ? 'bg-amber w-6 h-2.5' : 'bg-white/30 hover:bg-white/50 w-2.5 h-2.5'}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          disabled={snap.page === LAST_PAGE}
          aria-label="ورق بعدی"
          className="flex justify-center items-center bg-amber hover:bg-amber/90 disabled:opacity-30 rounded-full w-10 h-10 text-ink cursor-pointer"
        >
          <HiChevronLeft size={20} />
        </button>
      </div>
    </nav>
  );
}
