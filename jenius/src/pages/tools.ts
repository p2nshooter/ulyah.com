/**
 * Alat gratis (docs/JENIUS-BLUEPRINT.md §11 „alat yang autentik“): uji kecepatan baca, rencana baca mingguan, pemilih buku
 * menurut usia & minat, kartu kosakata cetak. Semua berjalan di peramban; tidak ada data pengunjung yang dikirim.
 */
import { html, jsonScript, type Raw } from '../lib/html.ts';
import { tr, pick, toolPath, bookPath, lanePath, minutesLabel, type Lang, type Pair } from '../lib/i18n.ts';
import { LANES, SHELVES, type Lane } from '../catalog/lanes.ts';
import { pageHead } from './layout.ts';
import type { Card } from './catalog.ts';

export interface Tool {
  key: 'speed' | 'plan' | 'picker' | 'vocab';
  slug: Pair;
  icon: string;
  name: Pair;
  blurb: Pair;
}

export const TOOLS: Tool[] = [
  { key: 'speed', slug: ['uji-kecepatan-baca', 'reading-speed-test'], icon: '⏱', name: ['Uji kecepatan baca', 'Reading speed test'], blurb: ['Ukur kata per menit saat membaca nyaring atau dalam hati, lengkap dengan panduan per jenjang.', 'Measure words per minute reading aloud or silently, with guidance for each level.'] },
  { key: 'plan', slug: ['rencana-baca-mingguan', 'weekly-reading-plan'], icon: '🗓', name: ['Rencana baca mingguan', 'Weekly reading plan'], blurb: ['Susun jadwal baca beberapa minggu dari buku di jalur pilihan, siap dicetak dan ditempel.', 'Build a multi-week reading schedule from books in your chosen lane, ready to print.'] },
  { key: 'picker', slug: ['pemilih-buku', 'book-picker'], icon: '🧭', name: ['Pemilih buku', 'Book picker'], blurb: ['Usia, minat, dan waktu luang → jalur yang cocok dan buku yang bisa langsung didengarkan.', 'Age, interests and free time → the right lane and books to start listening to now.'] },
  { key: 'vocab', slug: ['kartu-kosakata', 'vocabulary-cards'], icon: '🃏', name: ['Kartu kosakata', 'Vocabulary cards'], blurb: ['Tulis kata dan artinya, cetak kartu bolak-balik untuk latihan di rumah atau kelas.', 'Write words and meanings, print two-sided cards to practise at home or in class.'] },
];

export const toolBySlug = (slug: string) => TOOLS.find((t) => t.slug[0] === slug || t.slug[1] === slug);

export function toolsIndex(L: Lang): Raw {
  return html`${pageHead(tr(L, 'Alat gratis untuk orang tua & guru', 'Free tools for parents & teachers'), tr(L, 'Alat kecil yang benar-benar dipakai: mengukur kelancaran membaca, membuat rencana baca, memilih buku, dan membuat kartu kosakata. Semuanya berjalan di peramban Anda.', 'Small tools people actually use: measure reading fluency, plan reading, choose books and make vocabulary cards. Everything runs in your browser.'))}
  <section class="section"><div class="wrap"><div class="grid g2">${TOOLS.map((t) => html`<a class="tool-card big reveal" data-tilt href="${toolPath(L, t.slug)}"><span class="feature-ic">${t.icon}</span><b>${pick(L, t.name)}</b><span class="muted">${pick(L, t.blurb)}</span></a>`)}</div></div></section>`;
}

const PASSAGES = {
  id: 'Pagi itu hujan baru saja reda. Raka membuka jendela kamarnya dan mencium bau tanah basah. Di halaman, seekor burung pipit melompat-lompat di antara genangan air, mencari remah roti yang tadi malam dijatuhkan adiknya. Raka tersenyum. Ia mengambil buku catatan kecil dan mulai menggambar burung itu. Setiap kali burung itu berhenti, Raka ikut berhenti menggambar, menunggu sampai burung itu bergerak lagi. Ibunya memanggil dari dapur, tetapi Raka ingin menyelesaikan gambarnya dulu. Ketika gambar itu selesai, burung pipit terbang ke dahan pohon mangga, seolah-olah tahu bahwa tugasnya sudah selesai. Raka menutup buku catatannya dan berlari ke dapur, membawa cerita baru untuk sarapan pagi.',
  en: 'The rain had only just stopped that morning. Raka opened his bedroom window and smelled the wet earth. In the yard, a sparrow hopped between the puddles, looking for the bread crumbs his little sister had dropped the night before. Raka smiled. He picked up a small notebook and began to draw the bird. Every time the sparrow stopped, Raka stopped drawing too, waiting until it moved again. His mother called from the kitchen, but Raka wanted to finish his drawing first. When the drawing was done, the sparrow flew up to a branch of the mango tree, as if it knew its job was finished. Raka closed his notebook and ran to the kitchen, carrying a new story to share at breakfast.',
};

const SPEED_BANDS = [
  { max: 40, id: 'Mulai membaca (TK–kelas 1): fokus pada mengenal huruf dan suku kata; dengarkan buku jalur Tunas setiap hari.', en: 'Beginning reader (K–grade 1): focus on letters and syllables; listen to Sprout lane books every day.' },
  { max: 90, id: 'Pembaca awal (kelas 2–3): latih membaca nyaring kalimat pendek; ikuti sorotan kata di mode Dengar-Baca.', en: 'Early reader (grades 2–3): practise reading short sentences aloud; follow the highlighted words in listen-and-read mode.' },
  { max: 140, id: 'Pembaca lancar (kelas 4–6): mulai cerita bab; perlambat suara ke 0,75× untuk kata sulit.', en: 'Fluent reader (grades 4–6): start chapter books; slow the voice to 0.75× for hard words.' },
  { max: 200, id: 'Pembaca mandiri (SMP–SMA): tantang diri dengan novel jalur Jelajah dan buat ringkasan per bab.', en: 'Independent reader (middle–high school): challenge yourself with Explore lane novels and summarise each chapter.' },
  { max: 9999, id: 'Pembaca mahir (dewasa): pakai kecepatan 1,25–1,5× untuk mendengar sambil beraktivitas; coba jalur Kampus atau Cendekia.', en: 'Skilled reader (adult): use 1.25–1.5× to listen on the go; try the Campus or Scholar lanes.' },
];

export function toolPage(L: Lang, t: Tool, data: { books: Record<string, Card[]> }): Raw {
  const head = pageHead(pick(L, t.name), pick(L, t.blurb), tr(L, 'Alat gratis', 'Free tool'));
  if (t.key === 'speed') {
    return html`${head}<section class="section"><div class="wrap narrow">
      <div class="card tool" data-tool="speed">
        <p class="muted">${tr(L, 'Tekan Mulai, baca teks di bawah (nyaring atau dalam hati), lalu tekan Selesai.', 'Press Start, read the passage below (aloud or silently), then press Done.')}</p>
        <div class="btn-row"><button class="btn btn-primary" type="button" data-speed-start>▶ ${tr(L, 'Mulai', 'Start')}</button><button class="btn btn-ghost" type="button" data-speed-stop disabled>■ ${tr(L, 'Selesai', 'Done')}</button></div>
        <blockquote class="passage" data-speed-text>${L === 'en' ? PASSAGES.en : PASSAGES.id}</blockquote>
        <div class="result" data-speed-out hidden></div>
      </div>
      ${jsonScript('speed-bands', SPEED_BANDS.map((b) => ({ max: b.max, text: L === 'en' ? b.en : b.id })))}
      <div class="prose">
        <h2>${tr(L, 'Cara membaca hasilnya', 'How to read the result')}</h2>
        <p>${tr(L, 'Kata per menit (KPM) hanyalah satu sisi kelancaran. Membaca yang baik juga berarti memahami isi, membaca dengan intonasi yang wajar, dan tahu kapan harus melambat. Ulangi uji ini setiap dua minggu dengan teks yang belum pernah dibaca, lalu catat perkembangannya.', 'Words per minute (WPM) is only one side of fluency. Good reading also means understanding, natural expression, and knowing when to slow down. Repeat the test every two weeks with an unseen passage and note the progress.')}</p>
        <ul>${SPEED_BANDS.map((b) => html`<li>${L === 'en' ? b.en : b.id}</li>`)}</ul>
        <p class="muted small">${tr(L, 'Angka acuan bersifat umum dan berbeda antarbahasa; gunakan sebagai pengamatan, bukan diagnosis.', 'Reference figures are general and differ between languages; use them as an observation, not a diagnosis.')}</p>
      </div>
    </div></section>`;
  }
  if (t.key === 'plan') {
    return html`${head}<section class="section"><div class="wrap narrow">
      <form class="card tool form" data-tool="plan">
        <div class="grid g2">
          <label class="field"><span>${tr(L, 'Jalur baca', 'Reading lane')}</span><select name="lane">${LANES.map((l) => html`<option value="${l.id}">${l.icon} ${pick(L, l.name)} — ${pick(L, l.levels)}</option>`)}</select></label>
          <label class="field"><span>${tr(L, 'Menit per hari', 'Minutes per day')}</span><input name="minutes" type="number" min="5" max="120" value="20"></label>
          <label class="field"><span>${tr(L, 'Hari per minggu', 'Days per week')}</span><input name="days" type="number" min="1" max="7" value="5"></label>
          <label class="field"><span>${tr(L, 'Jumlah minggu', 'Number of weeks')}</span><input name="weeks" type="number" min="1" max="12" value="4"></label>
        </div>
        <label class="field"><span>${tr(L, 'Nama pembaca (opsional)', 'Reader’s name (optional)')}</span><input name="who" maxlength="40"></label>
        <div class="btn-row"><button class="btn btn-primary" type="submit">${tr(L, 'Buat rencana', 'Make the plan')}</button><button class="btn btn-ghost" type="button" data-print>🖨 ${tr(L, 'Cetak', 'Print')}</button></div>
      </form>
      <div class="plan-out" data-plan-out></div>
      ${jsonScript('plan-books', Object.fromEntries(Object.entries(data.books).map(([k, v]) => [k, v.map((b) => ({ id: b.id, title: b.meta.title, minutes: b.meta.minutes, href: bookPath(L, b.id) }))])))}
      ${jsonScript('plan-i18n', { week: tr(L, 'Minggu', 'Week'), day: tr(L, 'Hari', 'Day'), minutes: tr(L, 'menit', 'min'), book: tr(L, 'Buku', 'Book'), plan: tr(L, 'Rencana baca', 'Reading plan'), done: tr(L, 'Selesai ✓', 'Done ✓'), none: tr(L, 'Belum ada buku di jalur ini — pilih jalur lain.', 'No books in this lane yet — choose another lane.') })}
      <div class="prose"><h2>${tr(L, 'Tips menjalankan rencana', 'Tips for following the plan')}</h2>
      <ul><li>${tr(L, 'Pilih waktu yang sama setiap hari, misalnya setelah makan malam.', 'Pick the same time every day, for example after dinner.')}</li><li>${tr(L, 'Biarkan anak memilih buku berikutnya dari daftar — rasa memiliki membuat kebiasaan bertahan.', 'Let children pick the next book from the list — ownership makes the habit stick.')}</li><li>${tr(L, 'Tempel rencana di kulkas dan beri tanda setiap hari yang selesai.', 'Stick the plan on the fridge and tick off every finished day.')}</li></ul></div>
    </div></section>`;
  }
  if (t.key === 'picker') {
    return html`${head}<section class="section"><div class="wrap narrow">
      <form class="card tool form" data-tool="picker" method="get">
        <div class="grid g2">
          <label class="field"><span>${tr(L, 'Usia pembaca', 'Reader’s age')}</span><input name="age" type="number" min="3" max="99" value="8" required></label>
          <label class="field"><span>${tr(L, 'Minat', 'Interest')}</span><select name="minat"><option value="">${tr(L, 'Apa saja', 'Anything')}</option>${Object.entries(SHELVES).map(([k, v]) => html`<option value="${k}">${pick(L, v)}</option>`)}</select></label>
          <label class="field"><span>${tr(L, 'Waktu dengar sekali duduk', 'Listening time per sitting')}</span><select name="durasi"><option value="15">≤ 15 ${tr(L, 'menit', 'min')}</option><option value="60">≤ 1 ${tr(L, 'jam', 'h')}</option><option value="99999">${tr(L, 'Bebas', 'Any')}</option></select></label>
          <label class="check"><input type="checkbox" name="belajar" value="1"> <span>${tr(L, 'Sedang belajar bahasa Inggris', 'Learning English')}</span></label>
        </div>
        <button class="btn btn-primary" type="submit">${tr(L, 'Cari buku', 'Find books')}</button>
      </form>
      <div data-picker-out></div>
      ${jsonScript('picker-data', { lanes: LANES.map((l) => ({ id: l.id, name: pick(L, l.name), icon: l.icon, href: lanePath(L, l.slug) })), books: Object.fromEntries(Object.entries(data.books).map(([k, v]) => [k, v.map((b) => ({ id: b.id, title: b.meta.title, author: b.meta.author, shelf: b.meta.shelf, minutes: b.meta.minutes, label: minutesLabel(L, b.meta.minutes), href: bookPath(L, b.id) }))])), i18n: { lane: tr(L, 'Jalur yang cocok', 'Suggested lane'), none: tr(L, 'Belum ada buku yang cocok persis — coba minat lain.', 'No exact match yet — try another interest.'), longer: tr(L, 'Buku di bawah lebih panjang dari waktu yang dipilih — dengarkan per bab; posisi baca tersimpan otomatis.', 'These books are longer than the time you chose — listen one chapter at a time; your place is saved automatically.'), listen: tr(L, 'Dengarkan', 'Listen') } })}
    </div></section>`;
  }
  return html`${head}<section class="section"><div class="wrap narrow">
    <form class="card tool form" data-tool="vocab">
      <label class="field"><span>${tr(L, 'Satu kata per baris: kata = arti (contoh: brave = berani)', 'One word per line: word = meaning (e.g. brave = berani)')}</span><textarea name="words" rows="8">brave = berani
curious = ingin tahu
journey = perjalanan
whisper = berbisik</textarea></label>
      <div class="btn-row"><button class="btn btn-primary" type="submit">${tr(L, 'Buat kartu', 'Make cards')}</button><button class="btn btn-ghost" type="button" data-print>🖨 ${tr(L, 'Cetak', 'Print')}</button><button class="btn btn-ghost" type="button" data-vocab-say>🔊 ${tr(L, 'Dengarkan semua', 'Hear them all')}</button></div>
    </form>
    <div class="vocab-grid" data-vocab-out></div>
    <div class="prose"><h2>${tr(L, 'Cara memakai kartu', 'How to use the cards')}</h2><p>${tr(L, 'Cetak, lipat di tengah sehingga kata di depan dan arti di belakang. Latih lima kata per hari: ucapkan, dengarkan, lalu buat satu kalimat sendiri. Kata yang sudah dikuasai disimpan di amplop „sudah bisa“.', 'Print and fold in the middle so the word is on the front and the meaning on the back. Practise five words a day: say it, hear it, then make your own sentence. Mastered words go into a “got it” envelope.')}</p></div>
  </div></section>`;
}

export const laneOfAge = (age: number, english: boolean): Lane['id'] => (english ? 'lintas' : age <= 7 ? 'tunas' : age <= 11 ? 'tumbuh' : age <= 17 ? 'jelajah' : age <= 23 ? 'kampus' : 'santai');
