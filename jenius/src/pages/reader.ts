/**
 * Pembaca AUTO (docs/JENIUS-BLUEPRINT.md §0.3): tekan Putar sekali → suara membacakan halaman, kata disorot, halaman berganti
 * sendiri dengan animasi, berlanjut sampai akhir bab atau seluruh buku. Mode slide untuk buku bergambar. Tanpa iklan.
 * Isi halaman dimuat dari /api/book/{id}/ch/{n} (dibagi per halaman di server menurut ukuran halaman jalur).
 */
import { html, jsonScript, type Raw } from '../lib/html.ts';
import { tr, pick, bookPath, readPath, type Lang } from '../lib/i18n.ts';
import { LANES, laneById } from '../catalog/lanes.ts';
import type { BookMeta } from '../catalog/books.ts';

export function readerPage(L: Lang, b: BookMeta, n: number): Raw {
  const lane = laneById(b.lanes[0] ?? 'santai') ?? LANES[6]!;
  const ch = b.chapters.find((c) => c.n === n) ?? b.chapters[0]!;
  const prev = b.chapters.find((c) => c.n === ch.n - 1);
  const next = b.chapters.find((c) => c.n === ch.n + 1);
  return html`<div class="reader-app ${b.picture ? 'is-picture' : ''}" data-reader data-book="${b.id}" data-ch="${ch.n}" data-lang="${b.lang}" style="--lane:${lane.color}">
  <header class="r-top">
    <a class="r-back" href="${bookPath(L, b.id)}" aria-label="${tr(L, 'Kembali ke halaman buku', 'Back to the book page')}">←</a>
    <div class="r-title"><b>${b.title}</b><small>${ch.title}</small></div>
    <button class="r-icon" type="button" data-r-settings aria-label="${tr(L, 'Pengaturan baca', 'Reading settings')}" aria-expanded="false">Aa</button>
  </header>
  <div class="r-progress" aria-hidden="true"><i data-r-bar></i></div>
  <main class="r-stage" id="main">
    <article class="r-page" data-r-page aria-live="polite"><p class="muted">${tr(L, 'Memuat halaman…', 'Loading the page…')}</p></article>
    <noscript><p class="wrap">${tr(L, 'Pembaca bersuara memerlukan JavaScript. Teks bab tetap bisa dibaca di', 'The voiced reader needs JavaScript. The chapter text is still available at')} <a href="/api/book/${b.id}/ch/${ch.n}">/api/book/${b.id}/ch/${ch.n}</a>.</p></noscript>
  </main>
  <footer class="r-controls">
    <button class="r-btn" type="button" data-r-prev aria-label="${tr(L, 'Halaman sebelumnya', 'Previous page')}">⟨</button>
    <button class="r-play" type="button" data-r-play aria-label="${tr(L, 'Putar', 'Play')}"><span data-r-play-ic>▶</span></button>
    <button class="r-btn" type="button" data-r-next aria-label="${tr(L, 'Halaman berikutnya', 'Next page')}">⟩</button>
    <span class="r-count" data-r-count>–</span>
    <label class="r-speed"><span class="sr">${tr(L, 'Kecepatan', 'Speed')}</span><select data-r-rate>${[0.75, 0.9, 1, 1.25, 1.5].map((r) => html`<option value="${r}" ${r === 1 ? 'selected' : ''}>${r}×</option>`)}</select></label>
  </footer>
  <aside class="r-panel" data-r-panel hidden>
    <h2>${tr(L, 'Pengaturan baca', 'Reading settings')}</h2>
    <label class="field"><span>${tr(L, 'Suara pembaca (sintetis)', 'Reader voice (synthetic)')}</span><select data-r-voice>
      <option value="child">${tr(L, 'Anak', 'Child')}</option><option value="teacher-f">${tr(L, 'Guru perempuan', 'Female teacher')}</option><option value="teacher-m">${tr(L, 'Guru laki-laki', 'Male teacher')}</option><option value="narrator">${tr(L, 'Narator', 'Narrator')}</option>
    </select></label>
    <label class="field"><span>${tr(L, 'Lanjut otomatis sampai', 'Keep going until')}</span><select data-r-until><option value="chapter">${tr(L, 'akhir bab', 'the end of the chapter')}</option><option value="book">${tr(L, 'akhir buku', 'the end of the book')}</option></select></label>
    <label class="field"><span>${tr(L, 'Mode', 'Mode')}</span><select data-r-mode><option value="listen">${tr(L, 'Dengar-Baca (suara + sorot kata)', 'Listen & read (voice + highlight)')}</option><option value="silent">${tr(L, 'Baca sendiri (halaman berganti sesuai kecepatan baca)', 'Read alone (pages turn at reading speed)')}</option></select></label>
    <label class="field"><span>${tr(L, 'Ukuran huruf', 'Text size')}</span><input type="range" min="16" max="34" step="1" value="21" data-r-size></label>
    <label class="check"><input type="checkbox" data-r-dys> <span>${tr(L, 'Huruf ramah disleksia', 'Dyslexia-friendly font')}</span></label>
    <label class="check"><input type="checkbox" data-r-night> <span>${tr(L, 'Mode malam', 'Night mode')}</span></label>
    <label class="check"><input type="checkbox" data-r-contrast> <span>${tr(L, 'Kontras tinggi', 'High contrast')}</span></label>
    <p class="muted small">${tr(L, 'Suara berasal dari perangkat Anda (gratis, bisa tanpa internet). Pilihan suara tergantung perangkat.', 'Voices come from your device (free, works offline). Available voices depend on the device.')}</p>
    <nav class="r-chapters"><h3>${tr(L, 'Bab', 'Chapters')}</h3><ol>${b.chapters.map((c) => html`<li><a href="${readPath(L, b.id, c.n)}" ${c.n === ch.n ? 'aria-current="page"' : ''}>${c.title}</a></li>`)}</ol></nav>
    <button class="btn btn-ghost" type="button" data-r-close>${tr(L, 'Tutup', 'Close')}</button>
  </aside>
  ${jsonScript('reader-data', {
    id: b.id, ch: ch.n, lang: b.lang, picture: b.picture, voice: lane.voice, chapters: b.chapters.map((c) => c.n),
    prev: prev ? readPath(L, b.id, prev.n) : null, next: next ? readPath(L, b.id, next.n) : null, book: bookPath(L, b.id),
    i18n: {
      play: tr(L, 'Putar', 'Play'), pause: tr(L, 'Jeda', 'Pause'), page: tr(L, 'Hlm', 'Page'), of: tr(L, 'dari', 'of'),
      chapterDone: tr(L, 'Bab selesai 🎉', 'Chapter finished 🎉'), bookDone: tr(L, 'Buku selesai! Hebat 🎉', 'Book finished! Well done 🎉'),
      noVoice: tr(L, 'Perangkat ini belum punya suara untuk bahasa buku ini — mode baca sendiri dipakai.', 'This device has no voice for the book’s language yet — read-alone mode is used.'),
      tapVoice: tr(L, 'Peramban meminta sentuhan untuk suara — ketuk ▶ sekali lagi.', 'The browser needs a tap for sound — press ▶ once more.'),
      voiceFail: tr(L, 'Suara tidak bisa diputar di perangkat ini (periksa volume & mesin suara di pengaturan HP). Mode baca sendiri dipakai.', 'Speech could not play on this device (check the volume and the text-to-speech engine in your phone settings). Read-alone mode is used.'),
      backToBook: tr(L, '← Kembali ke buku', '← Back to the book'),
      resume: tr(L, 'Lanjutkan dari halaman', 'Resume from page'), next: tr(L, 'Bab berikutnya', 'Next chapter'), loadErr: tr(L, 'Halaman belum bisa dimuat. Periksa koneksi lalu coba lagi.', 'The page could not be loaded. Check your connection and try again.'),
      title: pick(L, lane.name),
    },
  })}
</div>`;
}
