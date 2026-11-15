/**
 * Pembaca file master di peramban (dibundel ke /assets/impor.js oleh `npm run klien`). Worker yapida berjalan di paket
 * Workers gratis (CPU ±10 ms per permintaan), jadi membongkar Excel ratusan baris — dan foto yang ditempel di dalamnya —
 * dikerjakan di perangkat pengguna dengan kode yang sama persis dengan server (src/lib/xlsx.ts, src/data/master.ts,
 * src/data/guru.ts). Hasilnya dikirim sebagai JSON di formulir yang sama; server tetap memeriksa ulang semuanya.
 * Tanpa JavaScript, formulir mengirim file mentah dan server yang membacanya.
 */
import { bacaCsv, bacaXlsx, gambarXlsx, type GambarSel } from '../lib/xlsx.ts';
import { bacaMaster } from '../data/master.ts';
import { bacaGuru } from '../data/guru.ts';

type Kirim = (b: Blob, jenis: 'gambar', unit: string) => Promise<{ f: string }>;
declare global { interface Window { YapidaUnggah?: { kirimBerkas: Kirim } } }

const lembarDari = async (f: File) => {
  const buf = new Uint8Array(await f.arrayBuffer());
  const csv = /\.csv$/i.test(f.name) || buf[0] !== 0x50;
  return { csv, buf, lembar: csv ? [{ nama: f.name.replace(/\.[^.]+$/, '') || 'CSV', baris: bacaCsv(new TextDecoder().decode(buf)) }] : await bacaXlsx(buf) };
};

function status(form: HTMLFormElement, teks: string): void {
  const el = form.querySelector<HTMLElement>('[data-foto-status], .p-form-kaki .p-kecil');
  if (el) el.textContent = teks;
}

function siapkan(form: HTMLFormElement, jenis: 'siswa' | 'guru'): void {
  let siap = false;
  form.addEventListener('submit', async (ev) => {
    if (siap) return;
    const inp = form.querySelector<HTMLInputElement>('input[name="berkas"]');
    const f = inp?.files?.[0];
    if (!f || !window.DecompressionStream) return; // peramban lama: biarkan server yang membaca
    ev.preventDefault();
    ev.stopImmediatePropagation();
    const tombol = form.querySelector<HTMLButtonElement>('button[type=submit]');
    if (tombol) tombol.disabled = true;
    try {
      status(form, 'Membaca file di perangkat Anda…');
      const { lembar, csv, buf } = await lembarDari(f);
      let hasil: unknown;
      if (jenis === 'siswa') hasil = bacaMaster(lembar);
      else {
        const gambar: GambarSel[] = csv ? [] : await gambarXlsx(buf);
        const h = bacaGuru(lembar, gambar);
        const kirim = window.YapidaUnggah?.kirimBerkas;
        const dipakai = h.guru.filter((g) => g.gambar !== undefined);
        let n = 0;
        for (const g of dipakai) {
          const gb = gambar[g.gambar!];
          n += 1;
          status(form, `Mengunggah foto dari Excel ${n} dari ${dipakai.length}…`);
          if (gb && kirim && gb.jenis !== 'lain') {
            try { g.foto = (await kirim(new Blob([gb.data as Uint8Array<ArrayBuffer>], { type: gb.jenis === 'png' ? 'image/png' : gb.jenis === 'webp' ? 'image/webp' : 'image/jpeg' }), 'gambar', '')).f; } catch { /* foto rusak dilewati */ }
          }
          delete g.gambar;
        }
        hasil = { guru: h.guru, laporan: h.laporan, gambar: gambar.length };
      }
      const wadah = document.createElement('textarea');
      wadah.name = 'hasil_json'; wadah.hidden = true; wadah.value = JSON.stringify(hasil);
      form.appendChild(wadah);
      const nama = document.createElement('input');
      nama.type = 'hidden'; nama.name = 'nama_berkas'; nama.value = f.name.slice(0, 120);
      form.appendChild(nama);
      if (inp) inp.disabled = true; // file tidak ikut dikirim — cukup hasil bacaannya
      status(form, 'Memeriksa data…');
      siap = true;
      // Foto banyak (guru) masih diunggah oleh portal.js lewat event submit berikutnya.
      if (jenis === 'guru' && form.querySelector<HTMLInputElement>('input[data-foto-banyak]')?.files?.length) form.requestSubmit();
      else form.submit();
    } catch (err) {
      if (tombol) tombol.disabled = false;
      status(form, `File tidak terbaca di perangkat ini (${err instanceof Error ? err.message : 'galat'}) — dikirim ke server untuk dibaca.`);
      siap = true;
      form.submit();
    }
  }, { capture: true });
}

document.querySelectorAll<HTMLFormElement>('form[data-impor-klien]').forEach((f) => siapkan(f, f.getAttribute('data-impor-klien') === 'guru' ? 'guru' : 'siswa'));
