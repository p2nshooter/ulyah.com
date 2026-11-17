/**
 * Versi aset (ASSET_V) = sidik isi CSS/JS. Setiap halaman memanggil /assets/<berkas>?v=<ASSET_V>, dan service worker
 * menyimpan aset itu per versi — bila isi CSS/JS berubah tetapi ASSET_V tidak, ponsel yang sudah memasang aplikasi terus
 * memakai CSS lama (kejadian 17 Nov 2026: panduan tampil tanpa gaya). Karena itu versinya dihitung dari isi berkas:
 *   npx tsx scripts/versi-aset.ts   → tulis ulang ASSET_V di src/pages/layout.ts
 * test/aset-versi.test.ts menolak perubahan CSS/JS yang lupa memperbarui versi (CI dan deploy menjalankannya).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/** Bundel buatan `npm run klien` tidak ikut dihitung (bisa berbeda antar versi esbuild) — sumbernya di src/klien yang dihitung. */
const BUATAN = new Set(['impor.js', 'panduan-siswa.js']);

function berkasDi(dir: string, cocok: (nama: string) => boolean): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? berkasDi(path.join(dir, e.name), cocok) : cocok(e.name) ? [path.join(dir, e.name)] : []));
}

export function berkasAset(akar = AKAR): string[] {
  const aset = path.join(akar, 'public', 'assets');
  const atas = fs.readdirSync(aset, { withFileTypes: true }).filter((e) => e.isFile() && /\.(css|js)$/.test(e.name) && !BUATAN.has(e.name)).map((e) => path.join(aset, e.name));
  return [...atas, ...berkasDi(path.join(aset, 'vendor'), (n) => /\.(css|js)$/.test(n)), ...berkasDi(path.join(akar, 'src', 'klien'), (n) => n.endsWith('.ts'))]
    .map((f) => path.relative(akar, f).split(path.sep).join('/'))
    .sort();
}

export function hitungVersiAset(akar = AKAR): string {
  const h = createHash('sha256');
  for (const rel of berkasAset(akar)) h.update(rel).update('\0').update(fs.readFileSync(path.join(akar, rel))).update('\0');
  return h.digest('hex').slice(0, 10);
}

const LAYOUT = path.join(AKAR, 'src', 'pages', 'layout.ts');
const POLA = /export const ASSET_V = '[^']*';/;

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const v = hitungVersiAset();
  const teks = fs.readFileSync(LAYOUT, 'utf8');
  if (!POLA.test(teks)) throw new Error('ASSET_V tidak ditemukan di src/pages/layout.ts');
  const baru = teks.replace(POLA, `export const ASSET_V = '${v}';`);
  if (baru !== teks) fs.writeFileSync(LAYOUT, baru);
  console.log(`ASSET_V = ${v}${baru === teks ? ' (tetap)' : ' (diperbarui)'}`);
}
