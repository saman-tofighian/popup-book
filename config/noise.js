export function seededRandom(seed) {
  let s = Math.floor(Math.abs(seed) * 1000) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
