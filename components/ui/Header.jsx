'use client';

import { useSnapshot } from 'valtio';
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark, HiOutlineCamera } from 'react-icons/hi2';

import state from '@/store';
import { toggleSound } from '@/store/actions';
import { downloadSnapshot } from '@/lib/capture';
import { BOOK } from '@/config/book';

export default function Header() {
  const snap = useSnapshot(state);
  return (
    <header className="top-0 right-0 left-0 z-20 fixed flex justify-between items-center px-4 sm:px-8 h-14 pointer-events-none">
      <div className="flex items-center gap-x-2.5">
        <span className="flex justify-center items-center bg-white/10 backdrop-blur rounded-xl w-9 h-9 text-xl">📖</span>
        <h1 className="font-extrabold text-paper text-base sm:text-lg">{BOOK.title}</h1>
      </div>
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={downloadSnapshot}
          aria-label="ذخیره‌ی عکس"
          className="flex justify-center items-center bg-white/10 hover:bg-white/20 backdrop-blur rounded-full w-10 h-10 text-paper cursor-pointer"
        >
          <HiOutlineCamera size={19} />
        </button>
        <button
          onClick={toggleSound}
          aria-label={snap.sound ? 'قطع صدا' : 'وصل صدا'}
          className="flex justify-center items-center bg-white/10 hover:bg-white/20 backdrop-blur rounded-full w-10 h-10 text-paper cursor-pointer"
        >
          {snap.sound ? <HiOutlineSpeakerWave size={19} /> : <HiOutlineSpeakerXMark size={19} />}
        </button>
      </div>
    </header>
  );
}
