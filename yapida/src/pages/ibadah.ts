/**
 * Aplikasi ibadah (pemilik, 14 Nov 2026: „Masukin beberapa app kaya radio quran, arah kiblat, jadwal sholat, kalender,
 * hitung mundur puasa, tp kembangin lg biar lebih interaktif, ambil dr ulyah.com“). Hitungannya berjalan di peramban:
 * waktu sholat dengan pustaka adhan (dipakai juga ulyah.com), kiblat dengan trigonometri bola, kalender hijriah
 * Umm al-Qura bawaan peramban, murottal dari CDN qari yang sama dengan radio ulyah.com. Server hanya mengirim kerangka
 * dan titik lokasi bawaan (pengaturan situs).
 */
import { html, raw, type Raw } from '../lib/html.ts';
import type { Situs } from '../data/model.ts';
import { hiasan, icon } from './layout.ts';
import { kepalaHalaman } from './public.ts';

export const LOKASI_BAWAAN = { lat: -6.13, lng: 107.17, nama: 'Sukakarya, Kabupaten Bekasi' };
export const lokasi = (s: Situs) => s.lokasi ?? LOKASI_BAWAAN;

const dataLokasi = (s: Situs): Raw => raw(` data-lat="${lokasi(s).lat}" data-lng="${lokasi(s).lng}" data-tempat="${lokasi(s).nama.replace(/"/g, '&quot;')}"`);

export interface Aplikasi { href: string; nama: string; ringkas: string; ikon: string; hidup?: string }
export const APLIKASI: Aplikasi[] = [
  { href: '/quran', nama: 'Al-Qur’an Mushaf Utsmani', ringkas: '604 halaman persis mushaf Madinah, terjemah, tafsir Kemenag, dan murottal per ayat.', ikon: 'buku' },
  { href: '/jadwal-sholat', nama: 'Jadwal Sholat', ringkas: 'Waktu sholat hari ini, hitung mundur ke adzan berikutnya, dan jadwal sebulan.', ikon: 'surya', hidup: 'sholat' },
  { href: '/kiblat', nama: 'Arah Kiblat', ringkas: 'Kompas kiblat dari tempat Anda berdiri, lengkap dengan jarak ke Ka’bah.', ikon: 'pin', hidup: 'kiblat' },
  { href: '/kalender-hijriah', nama: 'Kalender Hijriah', ringkas: 'Tanggal hijriah, hari besar Islam, dan hari-hari puasa sunnah.', ikon: 'bulan', hidup: 'hijri' },
  { href: '/kalender-hijriah#ramadhan', nama: 'Hitung Mundur Ramadhan', ringkas: 'Berapa hari, jam, dan menit lagi menuju 1 Ramadhan.', ikon: 'bintang', hidup: 'ramadhan' },
  { href: '/radio-quran', nama: 'Radio Qur’an', ringkas: 'Murottal 114 surah tanpa henti, dengan pilihan qari dan pengatur tidur.', ikon: 'buku' },
];

/** Kartu hitung mundur Ramadhan — dipakai di beranda, pusat aplikasi, dan kalender. */
export const hitungMundur: Raw = html`<div class="mundur muncul" data-ramadhan id="ramadhan">
  <div class="mundur-teks"><p class="kicker kicker-emas" data-ramadhan-kicker>Menuju Ramadhan</p><h2 data-ramadhan-judul>Hitung mundur 1 Ramadhan</h2><p data-ramadhan-ket>Menurut kalender hijriah Umm al-Qura. Awal Ramadhan yang resmi mengikuti sidang isbat Kementerian Agama.</p></div>
  <div class="mundur-angka" aria-live="off">
    <div><strong data-ramadhan-hari>—</strong><span>hari</span></div><div><strong data-ramadhan-jam>—</strong><span>jam</span></div><div><strong data-ramadhan-menit>—</strong><span>menit</span></div><div><strong data-ramadhan-detik>—</strong><span>detik</span></div>
  </div>
</div>`;

export function kartuAplikasi(a: Aplikasi): Raw {
  return html`<a class="kartu-app muncul" href="${a.href}" data-miring>
    <span class="medali" aria-hidden="true">${icon(a.ikon)}</span>
    <strong>${a.nama}</strong>
    <span class="kartu-app-ringkas">${a.ringkas}</span>
    ${a.hidup ? html`<span class="kartu-app-hidup" data-hidup="${a.hidup}" aria-live="off"></span>` : ''}
    <span class="kartu-unit-lanjut">Buka ${icon('panah')}</span>
  </a>`;
}

/** Pita aplikasi untuk beranda. */
export function pitaAplikasi(s: Situs): Raw {
  return html`<section class="bagian bagian-gading" id="ibadah"${dataLokasi(s)} data-ibadah><div class="wadah">
    <header class="bagian-kepala muncul"><p class="kicker">Aplikasi ibadah</p><h2>Teman ibadah sehari-hari</h2><p class="lead">Waktu sholat, kiblat, kalender hijriah, dan murottal — langsung di sini, tanpa memasang apa pun.</p>${hiasan}</header>
    <div class="kisi-app">${APLIKASI.map(kartuAplikasi)}<button class="kartu-app muncul" type="button" data-tasbih-buka data-miring><span class="medali" aria-hidden="true">${icon('tasbih')}</span><strong>Tasbih Digital</strong><span class="kartu-app-ringkas">Hitung dzikir 33 dan 100 dengan getar di setiap ketukan.</span><span class="kartu-unit-lanjut">Buka ${icon('panah')}</span></button></div>
    ${hitungMundur}
  </div></section>`;
}

export function ibadahPage(s: Situs): Raw {
  return html`${kepalaHalaman('Aplikasi Ibadah', 'Jadwal sholat, arah kiblat, kalender hijriah, hitung mundur Ramadhan, radio Qur’an, dan tasbih — gratis, tanpa iklan yang mengganggu ibadah.', [['Aplikasi Ibadah', '/ibadah']], 'Teman ibadah')}
<section class="bagian"${dataLokasi(s)} data-ibadah><div class="wadah">
  <div class="kisi-app">${APLIKASI.map(kartuAplikasi)}<button class="kartu-app muncul" type="button" data-tasbih-buka data-miring><span class="medali" aria-hidden="true">${icon('tasbih')}</span><strong>Tasbih Digital</strong><span class="kartu-app-ringkas">Hitung dzikir 33 dan 100 dengan getar di setiap ketukan.</span><span class="kartu-unit-lanjut">Buka ${icon('panah')}</span></button></div>
  ${hitungMundur}
  <div class="prosa sempit-tengah muncul"><h2>Cara kerjanya</h2><p>Semua hitungan berjalan di perangkat Anda. Waktu sholat dan arah kiblat dihitung dari titik ${lokasi(s).nama}; bila Anda mengizinkan, hitungan memakai lokasi perangkat Anda sendiri, dan lokasi itu tidak dikirim ke server kami.</p><p>Murottal diputar langsung dari server para qari. Aplikasi ini bisa dipasang di layar utama HP lewat tombol “Pasang aplikasi”.</p></div>
</div></section>`;
}

export function jadwalPage(s: Situs): Raw {
  return html`${kepalaHalaman('Jadwal Sholat', `Waktu sholat hari ini untuk ${lokasi(s).nama} — atau untuk lokasi Anda sendiri.`, [['Aplikasi Ibadah', '/ibadah'], ['Jadwal Sholat', '/jadwal-sholat']], 'Aplikasi ibadah')}
<section class="bagian"${dataLokasi(s)} data-ibadah data-jadwal><div class="wadah">
  <div class="lokasi-bar muncul">${icon('pin')}<span data-lokasi-nama>${lokasi(s).nama}</span><button class="tbl tbl-garis tbl-kecil" type="button" data-lokasi-saya>Gunakan lokasi saya</button><button class="tbl-teks" type="button" data-lokasi-bawaan hidden>Kembali ke ${lokasi(s).nama}</button></div>
  <div class="sholat-atas">
    <div class="sholat-berikut muncul">
      <svg class="sholat-cincin" viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="98" class="cincin-jalur"/><circle cx="110" cy="110" r="98" class="cincin-maju" data-sholat-cincin/></svg>
      <div class="sholat-berikut-isi"><span data-sholat-label>Sholat berikutnya</span><strong data-sholat-nama>—</strong><b data-sholat-jam>--.--</b><em data-sholat-sisa aria-live="off">menghitung…</em></div>
    </div>
    <div class="langit muncul" data-langit-hari>
      <svg viewBox="0 0 600 306" role="img" aria-label="Perjalanan matahari hari ini dari terbit sampai terbenam"><defs><linearGradient id="lg-busur" x1="0" x2="1"><stop offset="0" stop-color="#f3b45c"/><stop offset=".5" stop-color="#fff3c4"/><stop offset="1" stop-color="#e8744a"/></linearGradient></defs>
        <path d="M70 262 A230 230 0 0 1 530 262" class="langit-busur"/><path d="M70 262 A230 230 0 0 1 530 262" class="langit-jejak" data-langit-jejak/>
        <line x1="14" y1="262" x2="586" y2="262" class="langit-ufuk"/>
        <g data-langit-tanda></g>
        <g class="langit-matahari" data-langit-matahari><circle r="26" class="halo"/><circle r="14" class="inti"/></g>
      </svg>
      <p class="langit-ket" data-langit-ket>Matahari bergerak dari terbit ke terbenam; titik-titik emas adalah waktu sholat.</p>
    </div>
  </div>
  <ol class="sholat-daftar muncul" data-sholat-daftar aria-label="Waktu sholat hari ini"></ol>
  <div class="sholat-bulan muncul"><div class="sholat-bulan-kepala"><h2>Jadwal <span data-bulan-judul>30 hari</span></h2><button class="tbl tbl-garis tbl-kecil" type="button" data-bulan-cetak>Cetak</button></div><div class="tabel"><table data-sholat-tabel><thead><tr><th>Tanggal</th><th>Imsak</th><th>Subuh</th><th>Terbit</th><th>Dzuhur</th><th>Ashar</th><th>Maghrib</th><th>Isya</th></tr></thead><tbody></tbody></table></div></div>
  <div class="prosa sempit-tengah muncul"><h2>Tentang hitungan ini</h2><p>Waktu sholat dihitung dari posisi matahari untuk titik lokasi di atas: Subuh saat matahari 20° di bawah ufuk dan Isya 18° di bawah ufuk — kriteria yang dipakai Kementerian Agama RI — dengan Ashar menurut mazhab Syafi’i dan tambahan dua menit ihtiyat (kehati-hatian). Imsak ditampilkan sepuluh menit sebelum Subuh.</p><p>Hasil hisab bisa berselisih satu-dua menit dari jadwal yang diumumkan masjid setempat. Untuk adzan dan iqamah, ikuti pengumuman ${s.nama} dan masjid terdekat.</p></div>
</div></section>`;
}

export function kiblatPage(s: Situs): Raw {
  return html`${kepalaHalaman('Arah Kiblat', `Kompas kiblat dari ${lokasi(s).nama} atau dari tempat Anda berdiri sekarang.`, [['Aplikasi Ibadah', '/ibadah'], ['Arah Kiblat', '/kiblat']], 'Aplikasi ibadah')}
<section class="bagian"${dataLokasi(s)} data-ibadah data-kiblat><div class="wadah sempit">
  <div class="lokasi-bar muncul">${icon('pin')}<span data-lokasi-nama>${lokasi(s).nama}</span><button class="tbl tbl-garis tbl-kecil" type="button" data-lokasi-saya>Gunakan lokasi saya</button><button class="tbl-teks" type="button" data-lokasi-bawaan hidden>Kembali ke ${lokasi(s).nama}</button></div>
  <div class="kompas-wadah muncul">
    <div class="kompas" data-kompas>
      <svg viewBox="0 0 320 320" aria-hidden="true">
        <circle cx="160" cy="160" r="150" class="kompas-tepi"/><circle cx="160" cy="160" r="128" class="kompas-dalam"/>
        <g data-kompas-piringan class="kompas-piringan"><g class="kompas-angka"><text x="160" y="80">U</text><text x="246" y="167">T</text><text x="160" y="254">S</text><text x="74" y="167">B</text></g><g data-kompas-garis></g>
          <g data-kompas-kiblat class="kompas-kiblat"><line x1="160" y1="160" x2="160" y2="44"/><g transform="translate(160 34)"><rect x="-13" y="-13" width="26" height="26" rx="3" class="kabah"/><rect x="-13" y="-6" width="26" height="4" class="kabah-pita"/></g></g>
        </g>
        <path d="M160 6l9 18h-18z" class="kompas-penunjuk"/><circle cx="160" cy="160" r="7" class="kompas-pusat"/>
      </svg>
    </div>
    <div class="kompas-info"><p class="kompas-derajat"><strong data-kiblat-derajat>—</strong><span>dari utara, searah jarum jam</span></p><p data-kiblat-jarak class="kompas-jarak"></p><button class="tbl tbl-emas" type="button" data-kompas-aktif>Aktifkan kompas HP</button><p class="p-kecil" data-kompas-status>Tanpa kompas: putar badan sampai arah utara ada di depan Anda, lalu ikuti tanda Ka’bah.</p></div>
  </div>
  <div class="prosa muncul"><h2>Cara memakai</h2><ol><li>Tekan <strong>Gunakan lokasi saya</strong> supaya sudutnya dihitung dari tempat Anda berdiri.</li><li>Tekan <strong>Aktifkan kompas HP</strong>, pegang HP mendatar, lalu putar badan sampai tanda Ka’bah berada di puncak lingkaran.</li><li>Jauhkan HP dari besi, magnet, dan pengeras suara. Bila jarum melenceng, gerakkan HP membentuk angka delapan untuk mengkalibrasi.</li></ol><p>Sudut dihitung dengan rumus lingkaran besar menuju Ka’bah (21,4225° LU, 39,8262° BT). Kompas HP menunjuk utara magnet, yang di Jawa bagian barat berselisih sekitar satu derajat dari utara sebenarnya — cukup untuk menentukan arah shalat.</p></div>
</div></section>`;
}

export function kalenderPage(s: Situs): Raw {
  return html`${kepalaHalaman('Kalender Hijriah', 'Tanggal hijriah hari ini, hari besar Islam, puasa sunnah, dan hitung mundur menuju Ramadhan.', [['Aplikasi Ibadah', '/ibadah'], ['Kalender Hijriah', '/kalender-hijriah']], 'Aplikasi ibadah')}
<section class="bagian"${dataLokasi(s)} data-ibadah data-kalender><div class="wadah">
  <div class="kal muncul">
    <div class="kal-kepala"><button class="tbl-ikon" type="button" data-kal-mundur aria-label="Bulan sebelumnya">‹</button><div><h2 data-kal-judul>—</h2><p data-kal-masehi></p></div><button class="tbl-ikon" type="button" data-kal-maju aria-label="Bulan berikutnya">›</button></div>
    <div class="kal-hari" aria-hidden="true"><span>Ahad</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span></div>
    <div class="kal-kisi" data-kal-kisi role="grid" aria-label="Kalender hijriah"></div>
    <p class="kal-legenda"><span class="kal-l kal-l-besar"></span>Hari besar <span class="kal-l kal-l-puasa"></span>Puasa sunnah <span class="kal-l kal-l-kini"></span>Hari ini <button class="tbl-teks" type="button" data-kal-kini>Ke bulan ini</button></p>
    <p class="kal-detail" data-kal-detail aria-live="polite"></p>
  </div>
  ${hitungMundur}
  <div class="kal-bawah"><div class="panel muncul"><h2>Hari besar terdekat</h2><ul class="kal-daftar" data-kal-besar></ul></div>
  <div class="prosa muncul"><h2>Tentang kalender ini</h2><p>Kalender memakai hisab Umm al-Qura yang tersedia di peramban Anda. Awal bulan di Indonesia ditetapkan Kementerian Agama melalui sidang isbat dan dapat berbeda satu hari dari hisab ini — terutama untuk Ramadhan, Syawal, dan Dzulhijjah.</p><p>Tanda puasa sunnah mencakup Senin dan Kamis, Ayyamul Bidh (13–15 tiap bulan), Tasu’a dan Asyura (9–10 Muharram), serta Arafah (9 Dzulhijjah). Hari tasyrik dan dua hari raya tidak ditandai sebagai hari puasa.</p></div></div>
</div></section>`;
}

/** Radio Qur'an LIVE 24 jam (§5c): tanpa pilihan surah/qari — hanya nyala/mati di perangkat masing-masing. */
export function radioPage(): Raw {
  return html`${kepalaHalaman('Radio Qur’an LIVE 24 Jam', 'Murottal yang tidak pernah berhenti: surah 1 sampai 114 berurutan, setiap surah dibacakan qari pilihan acak dari seluruh dunia — dan setiap putaran adalah satu khatam.', [['Aplikasi Ibadah', '/ibadah'], ['Radio Qur’an', '/radio-quran']], 'Aplikasi ibadah')}
<section class="bagian" data-radio-live><div class="wadah">
  <div class="radio-live muncul">
    <div class="radio-piring" data-radio-piring aria-hidden="true"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" class="piring-tepi"/><g class="piring-bintang"><path d="M100 14l22 30 37-6-6 37 30 22-30 22 6 37-37-6-22 30-22-30-37 6 6-37-30-22 30-22-6-37 37 6z"/></g><circle cx="100" cy="100" r="34" class="piring-tengah"/></svg><div class="radio-eq"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
    <div class="radio-live-isi">
      <p class="radio-lencana"><b>LIVE</b> <span data-rl-status>Menyambung ke siaran…</span></p>
      <p class="radio-arab" lang="ar" dir="rtl" data-rl-surah-ar></p>
      <h2 data-rl-surah>Radio Qur’an</h2>
      <p class="radio-qari"><span>Dibacakan oleh</span> <strong data-rl-qari>—</strong> <span class="radio-qari-ar" lang="ar" dir="rtl" data-rl-qari-ar></span></p>
      <div class="radio-maju" aria-hidden="true"><span data-rl-kini>0.00</span><span class="radio-bilah"><i data-rl-bilah></i></span><span data-rl-lama>0.00</span></div>
      <button class="radio-nyala" type="button" data-rl-nyala aria-pressed="false"><span aria-hidden="true">▶</span> <span data-rl-nyala-label>Dengarkan LIVE</span></button>
      <p class="radio-ket">Siaran berjalan di server tanpa henti — yang bisa diatur hanyalah menyalakan atau mematikannya di perangkat ini.</p>
    </div>
  </div>
  <div class="radio-angka muncul">
    <div><b data-rl-khatam>0</b><span>kali khatam sejak radio mengudara</span></div>
    <div><b data-rl-putaran>1</b><span>putaran sekarang</span></div>
    <div><b data-rl-surah-ke>1</b><span>surah ke- dari 114</span></div>
    <div><b data-rl-berikut>—</b><span>surah berikutnya</span></div>
  </div>
  <div class="prosa sempit-tengah muncul"><h2>Tentang radio ini</h2><p>Radio ini seperti siaran radio sungguhan: semua pendengar mendengar bacaan yang sama pada saat yang sama. Setiap surah dibacakan oleh qari yang dipilih acak dari puluhan qari dunia (riwayat Hafs ‘an ‘Ashim, rekaman murattal yang dipublikasikan untuk umum oleh mp3quran.net); setelah An-Nas, siaran kembali ke Al-Fatihah dan hitungan khatam bertambah satu.</p><p>Nama qari tampil di layar kunci HP saat radio menyala. Di tab peramban biasa, suara baru berbunyi setelah satu ketukan pertama (aturan peramban); aplikasi Yapida yang sudah dipasang di HP langsung bersuara.</p></div>
</div></section>`;
}
