// Menulis yapida/public/assets/data/surat.json dari data yang sama dengan ulyah.com: nama surah
// (apps/web/src/lib/surah-names.ts) dan jumlah ayat mushaf Hafs/Madinah (apps/worker-api/src/lib/murottal-sources.ts).
//   node yapida/scripts/buat-surat.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../../', import.meta.url);
const nama = readFileSync(new URL('apps/web/src/lib/surah-names.ts', root), 'utf8');
const sumber = readFileSync(new URL('apps/worker-api/src/lib/murottal-sources.ts', root), 'utf8');
const names = [...nama.matchAll(/\{ id: (\d+), ar: "([^"]+)", latin: "([^"]+)" \}/g)].map((m) => ({ n: Number(m[1]), ar: m[2], latin: m[3] }));
const blok = sumber.match(/SURAH_AYAH_COUNTS: number\[\] = \[([\s\S]*?)\];/);
const ayat = blok[1].split(',').map((x) => Number(x.trim())).filter((x) => Number.isInteger(x) && x > 0);
if (names.length !== 114 || ayat.length !== 114) throw new Error(`harus 114 surah (nama ${names.length}, ayat ${ayat.length})`);
if (ayat.reduce((a, b) => a + b, 0) !== 6236) throw new Error('jumlah ayat harus 6236');
const out = names.map((s, i) => ({ ...s, ayat: ayat[i] }));
writeFileSync(new URL('yapida/public/assets/data/surat.json', root), JSON.stringify(out));
console.log(`surat.json: ${out.length} surah, ${ayat.reduce((a, b) => a + b, 0)} ayat`);
