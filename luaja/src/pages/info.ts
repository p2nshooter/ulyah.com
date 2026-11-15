/** Halaman informasi: harga & promo, tentang, kontak, privasi, syarat, sumber & lisensi. Bisa ditimpa admin lewat site.pages. */
import { html, raw, type Raw } from '../lib/html.ts';
import { renderMarkdown } from '../lib/markdown.ts';
import { COURSE_META, COURSES, type Pricing, type SiteContent, type Tier } from '../data/model.ts';
import { rp } from '../lib/i18n.ts';
import { icon, breadcrumbs } from './layout.ts';

export function pricingPage(o: { site: SiteContent; pricing: Pricing }): Raw {
  const p = o.pricing, tiers = (Object.keys(p.tiers) as Tier[]).filter((t) => p.tiers[t].enabled);
  return html`<section class="section"><div class="wrap">
  ${breadcrumbs([['Harga & promo', '/harga']])}
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">Harga & promo</p><h1 style="font-size:var(--fs-6)">Investasi satu tahun untuk kemampuan seumur hidup</h1><p class="lead">Satu harga mencakup seluruh jenjang bahasa yang dipilih, seluruh paket latihan soal dan kosakata — tanpa biaya tambahan per modul.</p></div>
  <div class="table-wrap reveal" style="margin-top:28px"><table class="table compare"><tr><th>Kategori</th><th>1 bahasa / tahun</th><th>2 bahasa / tahun</th><th>3 bahasa / tahun</th><th>Syarat</th></tr>
    ${tiers.map((t) => html`<tr><td><b>${p.tiers[t].label}</b><br><small class="muted">${p.tiers[t].note}</small></td><td class="num">${rp(p.tiers[t].one)}</td><td class="num">${rp(p.tiers[t].one * 2)}</td><td class="num">${rp(p.tiers[t].three)}</td><td>${p.tiers[t].requires ?? '—'}</td></tr>`)}
  </table></div>
  <div class="grid g3" style="margin-top:28px">
    <div class="card feature reveal"><span class="icon-tile">${icon('kartu')}</span><h3>Termasuk dalam setiap paket</h3><ul class="goals"><li>Seluruh jenjang bahasa yang dipilih</li><li>Bank latihan soal + prediksi nilai</li><li>Kunci, pembahasan & laporan latihan</li><li>Akses ${p.days} hari di semua perangkat</li></ul></div>
    <div class="card feature reveal" data-delay="1"><span class="icon-tile">${icon('sekolah')}</span><h3>Harga pelajar</h3><p>Untuk pelajar sampai kelas 12 / 3 SMK sederajat. Unggah surat keterangan pelajar terbaru saat konfirmasi pembayaran.</p></div>
    <div class="card feature reveal" data-delay="2"><span class="icon-tile">${icon('piala')}</span><h3>Harga juara kelas</h3><p>Untuk juara 1, 2 atau 3 di kelas. Unggah bukti juara kelas tahun berjalan (rapor atau piagam). Berlaku per tahun.</p></div>
  </div>
  <div class="card reveal" style="margin-top:28px"><h2 style="font-size:var(--fs-4);margin-top:0">Cara berlangganan</h2><ol class="recap"><li>Buat akun gratis, lalu pilih bahasa dan kategori di portal.</li><li>Tagihan menampilkan rekening resmi LUAJA dan nominal yang tepat.</li><li>Transfer, lalu unggah bukti pembayaran (dan dokumen promo bila memilih harga khusus).</li><li>Setelah terverifikasi, seluruh materi terbuka otomatis selama satu tahun.</li></ol>
    <div class="row" style="margin-top:16px"><a class="btn btn-gold btn-lg" href="/daftar?paket=1">Mulai berlangganan</a><a class="btn btn-ghost btn-lg" href="/coba">Ikuti pelajaran gratis dulu</a></div></div>
  <div class="grid g3" style="margin-top:28px">${COURSES.map((k) => html`<a class="card lift" href="/${COURSE_META[k].slug}" style="text-decoration:none;color:inherit"><h3 style="margin:0">${COURSE_META[k].name}</h3><p class="muted small" style="margin:6px 0 0">${COURSE_META[k].levels.map((l) => l.name).join(' · ')}${k === 'en' ? ' · TOEFL · IELTS' : ''}</p></a>`)}</div>
</div></section>`;
}

const DEFAULT_PAGES: Record<string, { title: string; desc: string; body: string }> = {
  tentang: {
    title: 'Tentang LUAJA', desc: 'LUAJA — Learning Universal for Achievement, Journey & Advancement: platform belajar bahasa Jerman, Inggris dan Jepang untuk penutur Indonesia.',
    body: `**LUAJA** — *Learning Universal for Achievement, Journey & Advancement* — adalah platform belajar bahasa Jerman, Inggris dan Jepang yang dirancang khusus untuk penutur Indonesia.\n\n## Cara kami mengajar\n\nSetiap jalur tersusun runtut: jenjang → modul → pelajaran → sepuluh langkah. Penjelasan selalu dalam bahasa Indonesia, setiap kalimat dapat didengar dengan suara berlogat asli, dan pelajaran berikutnya baru terbuka setelah pelajaran sebelumnya dikuasai. Dengan begitu fondasi peserta selalu kokoh.\n\n## Latihan yang terukur\n\nBank latihan soal mengikuti format ujian resmi setiap jenjang — Goethe-Zertifikat, Cambridge, TOEFL ITP, IELTS dan JLPT. Setiap paket dilengkapi kunci jawaban, pembahasan dan prediksi nilai, sehingga peserta tahu persis sejauh mana kesiapannya.\n\n## Untuk siapa\n\nPelajar dan mahasiswa, calon peserta Ausbildung dan magang ke Jepang, pencari beasiswa, tenaga kesehatan dan profesional — siapa pun yang ingin menguasai bahasa asing dengan cara yang rapi dan menyenangkan.`,
  },
  kontak: {
    title: 'Kontak', desc: 'Hubungi tim LUAJA untuk pertanyaan seputar kursus, pembayaran dan kerja sama.',
    body: `Kami senang membantu.\n\n- **E-mail:** [halo@luaja.com](mailto:halo@luaja.com)\n- **Jam layanan:** Senin–Sabtu, 08.00–20.00 WIB\n\nUntuk pertanyaan pembayaran, sertakan nomor tagihan (contoh: LJ-2026-000123) agar kami dapat membantu lebih cepat.`,
  },
  privasi: {
    title: 'Kebijakan privasi', desc: 'Bagaimana LUAJA mengumpulkan, memakai dan melindungi data peserta.',
    body: `Kebijakan ini menjelaskan data yang kami kumpulkan saat Anda memakai luaja.com.\n\n## Data yang kami simpan\n\n- **Akun:** nama, e-mail dan kata sandi dalam bentuk *hash* (kata sandi asli tidak pernah disimpan).\n- **Belajar:** kemajuan pelajaran, hasil kuis dan riwayat latihan soal.\n- **Pembayaran:** tagihan, bukti transfer dan dokumen promo yang Anda unggah — disimpan privat dan hanya dapat dibuka tim verifikasi.\n\n## Penggunaan data\n\nData dipakai untuk menyediakan layanan, memverifikasi pembayaran, dan menampilkan kemajuan belajar Anda. Kami tidak menjual data pribadi.\n\n## Iklan\n\nHalaman publik dapat menampilkan iklan Google AdSense. Google dapat memakai cookie untuk menayangkan iklan berdasarkan kunjungan Anda; Anda dapat mengatur preferensi di [Setelan Iklan Google](https://adssettings.google.com). Portal member, halaman pelajaran berbayar dan pembayaran tidak menampilkan iklan.\n\n## Hak Anda\n\nAnda dapat meminta salinan atau penghapusan data akun melalui [halo@luaja.com](mailto:halo@luaja.com).`,
  },
  syarat: {
    title: 'Syarat & ketentuan', desc: 'Syarat penggunaan layanan dan langganan LUAJA.',
    body: `Dengan memakai luaja.com, Anda menyetujui ketentuan berikut.\n\n## Langganan\n\n- Langganan berlaku per bahasa (atau paket tiga bahasa) selama masa aktif yang tertera di tagihan, dihitung sejak pembayaran terverifikasi.\n- Harga khusus pelajar dan juara kelas memerlukan dokumen yang sah dan terbaru; dokumen yang tidak sesuai dapat ditolak.\n- Akun bersifat pribadi dan tidak boleh dipakai bersama.\n\n## Materi\n\n- Materi LUAJA hanya untuk penggunaan pribadi dan dipelajari di dalam platform; materi tidak disediakan untuk diunduh. Yang dapat diunduh adalah laporan latihan milik peserta sendiri.\n\n## Prediksi nilai\n\nPrediksi nilai pada latihan adalah perkiraan berdasarkan hasil latihan dan bukan skor resmi lembaga penguji.\n\n## Pembayaran & pengembalian dana\n\nPembayaran yang telah terverifikasi tidak dapat dikembalikan, kecuali terjadi kesalahan dari pihak kami.`,
  },
  kredit: {
    title: 'Sumber & lisensi', desc: 'Sumber materi, lisensi dan atribusi di LUAJA.',
    body: `## Materi orisinal\n\nSeluruh pelajaran, dialog, penjelasan tata bahasa dan bank latihan soal LUAJA disusun oleh tim LUAJA. Soal latihan mengikuti deskripsi format ujian resmi dan bukan salinan soal ujian lembaga mana pun.\n\n## Nama ujian\n\nGoethe-Zertifikat (Goethe-Institut), Cambridge English (Cambridge University Press & Assessment), TOEFL® (ETS), IELTS™ (British Council, IDP, Cambridge) dan JLPT (Japan Foundation & JEES) adalah merek milik pemiliknya masing-masing. LUAJA tidak berafiliasi dengan lembaga tersebut.\n\n## Huruf\n\nFraunces dan Plus Jakarta Sans — SIL Open Font License 1.1.`,
  },
};

export function infoPage(site: SiteContent, slug: string): { title: string; desc: string; body: Raw } | null {
  const over = site.pages[slug];
  const base = DEFAULT_PAGES[slug];
  if (!over && !base) return null;
  const title = over?.title ?? base!.title;
  const md = over?.body ?? base!.body;
  return {
    title, desc: base?.desc ?? title,
    body: html`<section class="section"><div class="wrap-narrow">${breadcrumbs([[title, `/${slug}`]])}<h1 style="font-size:var(--fs-6)">${title}</h1><div class="article">${raw(renderMarkdown(md))}</div>${over?.updated ? html`<p class="small muted">Diperbarui ${over.updated}</p>` : ''}</div></section>`,
  };
}
export const INFO_SLUGS = Object.keys(DEFAULT_PAGES);
