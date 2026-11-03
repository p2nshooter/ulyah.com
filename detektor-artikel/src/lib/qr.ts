/** QR verifikasi sebagai SVG (dirender di server, ikut tercetak tanpa JavaScript). */
import qrcode from 'qrcode-generator';

export function qrSvg(text: string, size = 92): string {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const margin = 2;
  const dim = n + margin * 2;
  let d = '';
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (qr.isDark(r, c)) d += `M${c + margin} ${r + margin}h1v1h-1z`;
    }
  }
  return `<svg class="qr-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="QR"><rect width="${dim}" height="${dim}" fill="#fff"/><path d="${d}" fill="#0b1026"/></svg>`;
}
