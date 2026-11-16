import state, { LAST_PAGE } from './index';
import { playTurn, playPop } from '@/lib/audio';

function go(to) {
  const t = Math.max(0, Math.min(LAST_PAGE, to));
  if (t === state.page) return;
  state.page = t;
  if (state.sound) {
    playTurn();
    if (t >= 1 && t <= 4) setTimeout(() => state.sound && playPop(), 700);
  }
}

export const next = () => go(state.page + 1);
export const prev = () => go(state.page - 1);
export const goto = (i) => go(i);
export const toggleSound = () => {
  state.sound = !state.sound;
};
