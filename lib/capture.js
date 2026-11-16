// عکس از صفحه‌ی فعلی کتاب
export function downloadSnapshot() {
  const gl = document.querySelector('canvas');
  if (!gl) return;
  const out = document.createElement('canvas');
  out.width = gl.width;
  out.height = gl.height;
  const ctx = out.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, out.height);
  grad.addColorStop(0, '#2E2740');
  grad.addColorStop(1, '#1C1829');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(gl, 0, 0);
  out.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'popup-book.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }, 'image/png');
}
