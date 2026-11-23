/**
 * Figur penyemangat belajar yapida.sch.id (beranda & menu Prestasi) dibangkitkan dengan renderer MODEL repo axto
 * (engine/src/render/model.js, seri „Pendidikan“) — pemilik, 23 Nov 2026: „ambil animasi2 nya dari model orang yg ada di
 * axto.io di repo axto, ambil yg cocok buat ajakan belajar, atau semangat belajar“.
 * Kepala SELALU ilustrasi (tanpa ctx.head): potret model axto hanya berizin untuk karya axto dan disimpan privat.
 * Label seri dan tanda AXTO dibuang. Hasil: public/assets/figur/{membaca,wisuda,melambai,semangat}.svg (gerak CSS di dalam SVG).
 *
 *   AXTO_ENGINE=/jalur/ke/axto/engine node scripts/figur-axto.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENGINE = process.env.AXTO_ENGINE ?? '/home/user/axto/engine';
const { modelSvg } = await import(join(ENGINE, 'src/render/model.js'));
const { POSES, SERIES, LOOK, PROP, SETTING, LIGHT, MOTION, ACCESSORY, PALETTE } = await import(join(ENGINE, 'src/catalog/model.js'));
const KELUAR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'figur');
const cari = (arr, id) => arr.find((x) => x[0] === id);
// nama, busana, properti, latar, cahaya, gerak, aksesori, palet
const FIGUR = [
  ['membaca', 0, 0, 0, 'pagi', 'read', 'backpack', 'emerald'],
  ['wisuda', 1, 3, 2, 'emas', 'cheer', 'none', 'gold'],
  ['melambai', 2, 2, 1, 'siang', 'wave', 'satchel', 'rose'],
  ['semangat', 3, 1, 0, 'pagi', 'cheer', 'none', 'sapphire'],
];
for (const [nama, look, prop, setting, light, motion, acc, pal] of FIGUR) {
  const d = { seed: 7, id: 1, pick: [POSES[0], SERIES[0], LOOK[look], PROP[prop], SETTING[setting], cari(LIGHT, light), cari(MOTION, motion), cari(ACCESSORY, acc), cari(PALETTE, pal)] };
  let svg = modelSvg(d, {});
  svg = svg.replace(/<g><rect x="36" y="36"[^>]*\/><text[^>]*>[^<]*<\/text><\/g>/, '').replace(/<text x="978" y="982"[^>]*>[^<]*<\/text>/, '').replace(' width="1000" height="1000"', '');
  if (/EDUCATION|AXTO/.test(svg)) throw new Error(`${nama}: label belum terbuang`);
  writeFileSync(join(KELUAR, `${nama}.svg`), svg);
  console.log(nama, svg.length);
}
