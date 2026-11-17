import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASSET_V } from '../src/pages/layout.ts';
import { berkasAset, hitungVersiAset } from '../scripts/versi-aset.ts';

test('versi aset mengikuti isi CSS/JS (service worker di ponsel tidak memakai CSS lama)', () => {
  const daftar = berkasAset();
  assert.ok(daftar.includes('public/assets/portal.css') && daftar.includes('public/assets/tur.js') && daftar.includes('src/klien/impor.ts'), 'berkas aset utama ikut dihitung');
  assert.ok(!daftar.includes('public/assets/impor.js'), 'bundel buatan tidak ikut dihitung');
  assert.equal(ASSET_V, hitungVersiAset(), 'CSS/JS berubah tetapi ASSET_V belum diperbarui — jalankan: npm run versi');
});
