/**
 * Halaman katalog: beranda, daftar jalur, satu jalur (rak tema), halaman buku, sampul tipografi, lisensi & atribusi.
 * Sampul buku tanpa gambar dari sumber dibuat dari tipografi (judul, penulis, warna jalur) — tanpa gambar makhluk bernyawa
 * buatan AI (aturan ekosistem).
 */
import { html, raw, esc, type Raw } from '../lib/html.ts';
import { tr, pick, P, bookPath, readPath, lanePath, articlePath, toolPath, fmtNum, minutesLabel, type Lang } from '../lib/i18n.ts';
import { LANES, SHELVES, LEVELS, laneById, type Lane, type LevelId, type ShelfId } from '../catalog/lanes.ts';
import type { BookMeta, LaneEntry } from '../catalog/books.ts';
import { pageHead } from './layout.ts';
import { ARTICLES, type ArticleMeta } from '../content/articles.ts';
import { TOOLS } from './tools.ts';

export interface Card {
  id: string;
  meta: LaneEntry;
}

export const coverUrl = (id: string, cover?: string) => (cover ? `/m/${id}/${encodeURIComponent(cover)}` : `/cover/${id}.svg`);

export function bookCard(L: Lang, b: Card, lane?: Lane): Raw {
  const ln = lane ?? LANES.find((x) => x.kids === false);
  return html`<a class="book-card" href="${bookPath(L, b.id)}" style="--lane:${ln?.color ?? '#0b4fd8'}">
    <span class="bk"><img class="cover" src="${coverUrl(b.id, b.meta.cover)}" alt="${tr(L, `Sampul ${b.meta.title}`, `Cover of ${b.meta.title}`)}" loading="lazy" width="180" height="270"></span>
    <span class="bc-title">${b.meta.title}</span>
    <span class="bc-author">${b.meta.author}</span>
    <span class="bc-meta">🎧 ${minutesLabel(L, b.meta.minutes)}${b.meta.picture ? html` · 🖼 ${tr(L, 'bergambar', 'picture book')}` : ''}</span>
  </a>`;
}

export function laneCard(L: Lang, lane: Lane, count: number): Raw {
  return html`<a class="lane-card reveal" data-tilt href="${lanePath(L, lane.slug)}" style="--lane:${lane.color}">
    <span class="lane-ic" aria-hidden="true">${lane.icon}</span>
    <span class="lane-name">${pick(L, lane.name)}</span>
    <span class="lane-who">${pick(L, lane.who)} · <small>${pick(L, lane.levels)}</small></span>
    <span class="lane-blurb">${pick(L, lane.blurb)}</span>
    <span class="lane-count">${count ? tr(L, `${fmtNum(L, count)} buku`, `${fmtNum(L, count)} books`) : tr(L, 'buku sedang ditambahkan', 'books being added')} →</span>
  </a>`;
}

const articleCard = (L: Lang, a: ArticleMeta) => html`<a class="art-card reveal" href="${articlePath(L, a.slug)}"><span class="eyebrow">${pick(L, a.clusterName)}</span><b>${pick(L, a.title)}</b><span class="muted">${pick(L, a.description)}</span></a>`;

export function homePage(L: Lang, counts: Record<string, number>, featured: { lane: Lane; books: Card[] }[]): Raw {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const latest = ARTICLES.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  return html`
  <section class="hero">
    <div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="wrap hero-in">
      <div class="hero-copy">
        <span class="eyebrow">${tr(L, 'Gratis untuk semua · Indonesia & English', 'Free for everyone · Indonesian & English')}</span>
        <h1>${tr(L, 'Tekan Putar sekali — buku membaca sendiri, halaman berganti sendiri.', 'Press Play once — the book reads itself and turns its own pages.')}</h1>
        <p class="lead">${tr(L, 'jenius.es adalah perpustakaan baca bersuara dari sumber terbuka. Suara pembaca membacakan setiap halaman, kata yang dibaca disorot, halaman berganti otomatis, dan terus berlanjut sampai akhir bab atau akhir buku — untuk anak TK sampai profesor.', 'jenius.es is a voiced reading library built from open sources. A reader voice reads every page, highlights each word, turns the page by itself and keeps going to the end of the chapter or the whole book — for preschoolers up to professors.')}</p>
        <div class="cta-row"><a class="btn btn-primary btn-lg" href="${P(L, 'lanes')}">▶ ${tr(L, 'Mulai mendengarkan', 'Start listening')}</a><a class="btn btn-ghost btn-lg" href="${P(L, 'teachers')}">${tr(L, 'Untuk guru & kelas', 'For teachers & classes')}</a></div>
        <ul class="trust"><li>✓ ${tr(L, `${fmtNum(L, total || 100)}+ buku berlisensi terbuka`, `${fmtNum(L, total || 100)}+ openly licensed books`)}</li><li>✓ ${tr(L, 'Halaman anak tanpa iklan', 'No ads on children’s pages')}</li><li>✓ ${tr(L, 'Bisa dibaca tanpa internet', 'Works offline')}</li></ul>
      </div>
      <div class="hero-demo" aria-hidden="true">
        <div class="hb">
          <div class="hb-glow"></div>
          <div class="hb-book">
            <div class="hb-page hb-left"><b>${tr(L, 'Bab 1', 'Chapter 1')}</b><i></i><i></i><i class="s"></i><i></i><i></i><i class="s"></i><i></i></div>
            <div class="hb-page hb-right"><p>${(L === 'en' ? 'Once upon a time a little girl planted a seed in the school garden' : 'Pada suatu pagi seorang anak menanam biji di kebun sekolah').split(' ').map((w, i) => html`<span class="w" style="--k:${i}">${w}</span> `)}</p><i></i><i></i><i class="s"></i></div>
            <div class="hb-leaf"><div class="hb-front"><i></i><i></i><i class="s"></i><i></i><i></i></div><div class="hb-back"><i></i><i></i><i class="s"></i><i></i></div></div>
            <div class="hb-spine"></div>
          </div>
          <div class="hb-bar"><span class="hb-play">▶</span><span class="demo-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="hb-speed">1×</span></div>
          <span class="hb-note n1">♪</span><span class="hb-note n2">♫</span><span class="hb-note n3">✦</span><span class="hb-note n4">A</span><span class="hb-note n5">b</span>
        </div>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="wrap">
      <div class="section-head reveal"><span class="eyebrow">${tr(L, 'Jalur Baca', 'Reading Lanes')}</span><h2>${tr(L, 'Delapan jalur, dari kata pertama sampai bacaan para profesor', 'Eight lanes, from first words to professors’ reading')}</h2><p class="lead">${tr(L, 'Pilih jalur yang sesuai — setiap jalur punya ukuran halaman, suara bawaan, dan rak tema sendiri.', 'Pick the lane that fits — each lane has its own page size, default voice and theme shelves.')}</p></div>
      <div class="grid g4">${LANES.map((l) => laneCard(L, l, counts[l.id] ?? 0))}</div>
    </div>
  </section>
  <section class="section alt">
    <div class="wrap">
      <div class="section-head reveal"><span class="eyebrow">${tr(L, 'Pengalaman AUTO', 'The AUTO experience')}</span><h2>${tr(L, 'Mendengar, melihat, dan membaca bersamaan', 'Listen, watch and read together')}</h2></div>
      <div class="grid g3">
        ${[
          ['🎧', tr(L, 'Suara yang sesuai pembacanya', 'A voice that suits the reader'), tr(L, 'Suara anak untuk buku bergambar, guru perempuan atau laki-laki yang tenang untuk cerita dan pelajaran, narator untuk novel. Kecepatan 0,75–1,5×.', 'A child’s voice for picture books, a calm female or male teacher for stories and lessons, a narrator for novels. Speed 0.75–1.5×.')],
          ['✨', tr(L, 'Kata disorot, halaman berganti sendiri', 'Words light up, pages turn themselves'), tr(L, 'Setiap kata yang dibacakan menyala. Saat halaman selesai, halaman berikutnya terbuka dengan animasi balik halaman.', 'Every spoken word lights up. When a page ends, the next one opens with a page-turn animation.')],
          ['📚', tr(L, 'Sampai akhir bab atau akhir buku', 'To the end of the chapter or the book'), tr(L, 'Pilih berhenti di akhir bab atau terus sampai buku habis. Posisi terakhir tersimpan: lanjutkan dari halaman yang sama kapan saja.', 'Choose to stop at the end of a chapter or carry on to the last page. Your place is saved: resume from the same page any time.')],
          ['🖼', tr(L, 'Mode slide untuk buku bergambar', 'Slide mode for picture books'), tr(L, 'Buku bergambar tampil layar penuh dan bergeser otomatis mengikuti suara — cocok untuk anak dan untuk kelas.', 'Picture books go full screen and slide on by themselves with the voice — great for children and for classrooms.')],
          ['♿', tr(L, 'Nyaman dibaca semua orang', 'Comfortable for everyone'), tr(L, 'Ukuran huruf, huruf ramah disleksia, mode malam, kontras tinggi, dan tanpa animasi bila perangkat meminta.', 'Text size, a dyslexia-friendly font, night mode, high contrast, and no animation when your device asks for it.')],
          ['🏫', tr(L, 'Kelas dan guru, gratis', 'Classes and teachers, free'), tr(L, 'Guru membuat kelas dengan nama unik, mengundang murid, membagikan rak buku dan tugas, lalu melihat laporan baca.', 'Teachers create classes with a unique name, invite students, share shelves and tasks, then see reading reports.')],
        ].map(([ic, t, d], i) => html`<article class="feature reveal" data-tilt style="--i:${i}"><span class="feature-ic">${ic}</span><h3>${t}</h3><p class="muted">${d}</p></article>`)}
      </div>
    </div>
  </section>
  ${featured.filter((f) => f.books.length).map((f) => html`
  <section class="section">
    <div class="wrap">
      <div class="section-head row reveal"><h2><span aria-hidden="true">${f.lane.icon}</span> ${pick(L, f.lane.name)} <small class="muted">${pick(L, f.lane.levels)}</small></h2><a href="${lanePath(L, f.lane.slug)}">${tr(L, 'Lihat semua', 'See all')} →</a></div>
      <div class="shelf-row">${f.books.map((b) => bookCard(L, b, f.lane))}</div>
    </div>
  </section>`)}
  <section class="section alt">
    <div class="wrap">
      <div class="section-head row reveal"><h2>${tr(L, 'Artikel untuk orang tua, guru, dan pembaca', 'Articles for parents, teachers and readers')}</h2><a href="${P(L, 'articles')}">${tr(L, 'Semua artikel', 'All articles')} →</a></div>
      <div class="grid g3">${latest.map((a) => articleCard(L, a))}</div>
    </div>
  </section>
  <section class="section">
    <div class="wrap">
      <div class="section-head row reveal"><h2>${tr(L, 'Alat gratis', 'Free tools')}</h2><a href="${P(L, 'tools')}">${tr(L, 'Semua alat', 'All tools')} →</a></div>
      <div class="grid g4">${TOOLS.map((t) => html`<a class="tool-card reveal" href="${toolPath(L, t.slug)}"><span class="feature-ic">${t.icon}</span><b>${pick(L, t.name)}</b><span class="muted">${pick(L, t.blurb)}</span></a>`)}</div>
    </div>
  </section>`;
}

export function lanesPage(L: Lang, counts: Record<string, number>): Raw {
  return html`${pageHead(tr(L, 'Jalur Baca', 'Reading Lanes'), tr(L, 'Delapan jalur untuk setiap tahap membaca. Jenjang sekolah tetap tercatat di setiap jalur supaya guru mudah memilih buku untuk kelasnya.', 'Eight lanes for every stage of reading. School levels are noted on each lane so teachers can easily pick books for their class.'))}
  <section class="section"><div class="wrap"><div class="grid g4">${LANES.map((l) => laneCard(L, l, counts[l.id] ?? 0))}</div>
  <div class="note card"><h3>${tr(L, 'Rak tema', 'Theme shelves')}</h3><p class="muted">${tr(L, 'Di dalam setiap jalur, buku dikelompokkan ke rak tema:', 'Inside every lane, books are grouped into theme shelves:')} ${Object.values(SHELVES).map((s) => pick(L, s)).join(' · ')}.</p></div></div></section>`;
}

export function lanePage(L: Lang, lane: Lane, books: Card[], shelf: ShelfId | null, level: LevelId | null = null): Raw {
  if (lane.id === 'pelajaran') return textbookLane(L, lane, books, level);
  const shelves = [...new Set(books.map((b) => b.meta.shelf))];
  const shown = shelf ? books.filter((b) => b.meta.shelf === shelf) : books;
  return html`<section class="page-head lane-head" style="--lane:${lane.color}"><div class="wrap"><span class="eyebrow">${pick(L, lane.levels)}</span><h1><span aria-hidden="true">${lane.icon}</span> ${pick(L, lane.name)}</h1><p class="lead">${pick(L, lane.blurb)}</p>
  <p class="muted">${pick(L, lane.who)} · ${tr(L, `${fmtNum(L, books.length)} buku`, `${fmtNum(L, books.length)} books`)} · ${tr(L, 'suara bawaan', 'default voice')}: ${voiceName(L, lane.voice)}${lane.kids ? html` · <b>${tr(L, 'tanpa iklan', 'ad-free')}</b>` : ''}</p></div></section>
  <section class="section"><div class="wrap">
    ${shelves.length > 1 ? html`<nav class="chips" aria-label="${tr(L, 'Rak tema', 'Theme shelves')}"><a class="chip ${shelf ? '' : 'on'}" href="${lanePath(L, lane.slug)}">${tr(L, 'Semua', 'All')}</a>${shelves.map((s) => html`<a class="chip ${shelf === s ? 'on' : ''}" href="${lanePath(L, lane.slug)}?rak=${s}">${pick(L, SHELVES[s])}</a>`)}</nav>` : ''}
    ${shown.length ? html`<div class="book-grid">${shown.map((b) => bookCard(L, b, lane))}</div>` : html`<div class="empty card"><p>${tr(L, 'Buku untuk jalur ini sedang diimpor dari sumber terbuka dan akan tampil sebentar lagi.', 'Books for this lane are being imported from open sources and will appear shortly.')}</p></div>`}
  </div></section>`;
}

/** Jalur Buku Pelajaran: pilihan jenjang (SD/MI … Perguruan Tinggi), buku dikelompokkan per kelas. */
function textbookLane(L: Lang, lane: Lane, books: Card[], level: LevelId | null): Raw {
  const levels = (Object.keys(LEVELS) as LevelId[]).filter((k) => books.some((b) => b.meta.level === k));
  const shown = level ? books.filter((b) => b.meta.level === level) : books;
  const groups = new Map<string, Card[]>();
  for (const b of shown) {
    const lv = b.meta.level ?? 'pt';
    const g = b.meta.grade ? tr(L, `${pick(L, LEVELS[lv].name)} · Kelas ${b.meta.grade}`, `${pick(L, LEVELS[lv].name)} · Grade ${b.meta.grade}`) : pick(L, LEVELS[lv].name);
    groups.set(g, [...(groups.get(g) ?? []), b]);
  }
  return html`<section class="page-head lane-head" style="--lane:${lane.color}"><div class="wrap"><span class="eyebrow">${pick(L, lane.levels)}</span><h1><span aria-hidden="true">${lane.icon}</span> ${pick(L, lane.name)}</h1><p class="lead">${pick(L, lane.blurb)}</p>
  <p class="muted">${tr(L, `${fmtNum(L, books.length)} buku`, `${fmtNum(L, books.length)} books`)} · ${tr(L, 'dibacakan suara sintetis', 'read by a synthetic voice')} · ${tr(L, 'madrasah (MI, MTs, MA, MAK) memakai buku mata pelajaran umum jenjangnya', 'madrasahs (MI, MTs, MA, MAK) use the general-subject books of their level')}</p></div></section>
  <section class="section"><div class="wrap">
    <nav class="chips level-chips" aria-label="${tr(L, 'Jenjang', 'Level')}"><a class="chip ${level ? '' : 'on'}" href="${lanePath(L, lane.slug)}">${tr(L, 'Semua jenjang', 'All levels')}</a>${(Object.keys(LEVELS) as LevelId[]).map((k) => html`<a class="chip ${level === k ? 'on' : ''} ${levels.includes(k) ? '' : 'soon'}" href="${lanePath(L, lane.slug)}?jenjang=${k}">${pick(L, LEVELS[k].name)}</a>`)}</nav>
    ${shown.length ? [...groups].map(([g, list]) => html`<h2 class="grade-head">${g} <small class="muted">${fmtNum(L, list.length)}</small></h2><div class="book-grid">${list.map((b) => bookCard(L, b, lane))}</div>`) : html`<div class="empty card"><p>${tr(L, 'Buku untuk jenjang ini sedang dikonversi dari sumber resmi yang mengizinkan buku dialihmediakan, dan akan tampil bertahap.', 'Books for this level are being converted from official sources that allow format-shifting, and will appear step by step.')}</p></div>`}
  </div></section>`;
}

export function voiceName(L: Lang, v: Lane['voice']): string {
  return {
    child: tr(L, 'suara anak (sintetis)', 'child voice (synthetic)'),
    'teacher-f': tr(L, 'guru perempuan (sintetis)', 'female teacher (synthetic)'),
    'teacher-m': tr(L, 'guru laki-laki (sintetis)', 'male teacher (synthetic)'),
    narrator: tr(L, 'narator (sintetis)', 'narrator (synthetic)'),
  }[v];
}

export function bookPage(L: Lang, b: BookMeta): Raw {
  const lane = laneById(b.lanes[0] ?? 'santai') ?? LANES[6]!;
  return html`<section class="book-hero" style="--lane:${lane.color}"><div class="wrap book-hero-in">
    <img class="cover big" src="${coverUrl(b.id, b.cover)}" alt="${tr(L, `Sampul ${b.title}`, `Cover of ${b.title}`)}" width="240" height="360">
    <div>
      <nav class="crumbs"><a href="${P(L, 'lanes')}">${tr(L, 'Jalur Baca', 'Reading Lanes')}</a> › <a href="${lanePath(L, lane.slug)}">${pick(L, lane.name)}</a></nav>
      <h1>${b.title}</h1>
      <p class="by">${b.author}${b.illustrator ? html` · ${tr(L, 'ilustrasi', 'illustrated by')} ${b.illustrator}` : ''}${b.translator ? html` · ${tr(L, 'terjemahan', 'translated by')} ${b.translator}` : ''}</p>
      <p class="pills">${b.lanes.map((id) => { const x = laneById(id); return x ? html`<a class="pill" style="--lane:${x.color}" href="${lanePath(L, x.slug)}">${x.icon} ${pick(L, x.name)}</a>` : ''; })}${b.level ? html`<a class="pill" href="${lanePath(L, laneById('pelajaran')!.slug)}?jenjang=${b.level}">🏫 ${pick(L, LEVELS[b.level].name)}${b.grade ? tr(L, ` · Kelas ${b.grade}`, ` · Grade ${b.grade}`) : ''}</a>` : ''}<span class="pill">${b.subject ?? pick(L, SHELVES[b.shelf])}</span><span class="pill">🎧 ${minutesLabel(L, b.minutes)}</span><span class="pill">${b.lang.toUpperCase()}</span></p>
      <div class="cta-row"><a class="btn btn-primary btn-lg" href="${readPath(L, b.id, 1)}" data-resume-link="${b.id}">▶ ${b.picture ? tr(L, 'Putar slide bersuara', 'Play voiced slides') : tr(L, 'Dengarkan dari awal', 'Listen from the start')}</a><span class="resume-hint muted" data-resume-hint="${b.id}"></span></div>
      ${b.description ? html`<p class="desc">${b.description}</p>` : ''}
    </div>
  </div></section>
  <section class="section"><div class="wrap two-col">
    <div>
      <h2>${b.picture ? tr(L, 'Isi buku', 'Contents') : tr(L, 'Daftar bab', 'Chapters')}</h2>
      <ol class="chapters">${b.chapters.map((c) => html`<li><a href="${readPath(L, b.id, c.n)}"><span>${c.title}</span><small class="muted">${minutesLabel(L, Math.max(1, Math.round(c.words / 150)))}</small></a></li>`)}</ol>
    </div>
    <aside class="card license-box">
      <h3>${tr(L, 'Lisensi & atribusi', 'Licence & credits')}</h3>
      <p>${b.attribution}</p>
      <p><a href="${b.licenseUrl}" rel="noopener license" target="_blank">${b.license}</a> · <a href="${b.sourceUrl}" rel="noopener" target="_blank">${tr(L, 'Sumber asli', 'Original source')}</a></p>
      <p class="muted small">${tr(L, 'Suara pembaca di jenius.es adalah suara sintetis dari perangkat Anda. Teks ditampilkan sesuai sumber, dibagi per halaman untuk dibacakan.', 'Reader voices on jenius.es are synthetic voices from your device. The text is shown as in the source, split into pages for reading aloud.')}</p>
    </aside>
  </div></section>`;
}

export function bookJsonLd(origin: string, L: Lang, b: BookMeta): unknown {
  return {
    '@context': 'https://schema.org', '@type': 'Book', name: b.title, author: { '@type': 'Person', name: b.author }, inLanguage: b.lang,
    url: `${origin}${bookPath(L, b.id)}`, image: `${origin}${coverUrl(b.id, b.cover)}`, license: b.licenseUrl, isAccessibleForFree: true,
    ...(b.illustrator ? { illustrator: { '@type': 'Person', name: b.illustrator } } : {}), ...(b.translator ? { translator: { '@type': 'Person', name: b.translator } } : {}),
    ...(b.description ? { description: b.description } : {}), numberOfPages: b.chapters.length,
  };
}

/** Sampul tipografi SVG: warna jalur, judul dibungkus per baris, penulis, merek kecil. */
export function coverSvg(b: Pick<BookMeta, 'title' | 'author' | 'lanes'>): string {
  const lane = laneById(b.lanes[0] ?? 'santai') ?? LANES[6]!;
  const words = b.title.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > 16 && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  const shown = lines.slice(0, 6);
  const size = shown.length > 4 ? 26 : 32;
  const startY = 150 - (shown.length * size * 1.15) / 2 + size;
  const title = shown.map((l, i) => `<text x="30" y="${(startY + i * size * 1.15).toFixed(0)}" font-size="${size}" font-weight="800" fill="#fff">${esc(l)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450" font-family="Georgia, 'Times New Roman', serif">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lane.color}"/><stop offset="1" stop-color="#0b1a3d"/></linearGradient></defs>
<rect width="300" height="450" fill="url(#g)"/><rect x="14" y="14" width="272" height="422" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2"/>
<circle cx="250" cy="70" r="26" fill="rgba(255,255,255,.14)"/><text x="250" y="80" font-size="26" text-anchor="middle">${lane.icon}</text>
${title}
<line x1="30" y1="${(startY + shown.length * size * 1.15 + 6).toFixed(0)}" x2="120" y2="${(startY + shown.length * size * 1.15 + 6).toFixed(0)}" stroke="#ffd36b" stroke-width="3"/>
<text x="30" y="${(startY + shown.length * size * 1.15 + 40).toFixed(0)}" font-size="18" fill="#e8eefc" font-family="Arial, Helvetica, sans-serif">${esc(b.author.slice(0, 34))}</text>
<text x="30" y="420" font-size="14" fill="rgba(255,255,255,.8)" font-family="Arial, Helvetica, sans-serif" letter-spacing="1">jenius.es · E-Book with Voice</text>
</svg>`;
}

export function licensesPage(L: Lang, books: { id: string; title: string }[], metas: BookMeta[]): Raw {
  const byId = new Map(metas.map((m) => [m.id, m]));
  return html`${pageHead(tr(L, 'Lisensi & atribusi', 'Licences & credits'), tr(L, 'Setiap buku di jenius.es berasal dari sumber yang lisensinya mengizinkan menyalin, membacakan, dan menampilkannya di situs yang beriklan. Inilah daftar lengkapnya.', 'Every book on jenius.es comes from a source whose licence allows copying, reading aloud and showing it on a site with ads. Here is the full list.'))}
  <section class="section"><div class="wrap prose">
    <h2>${tr(L, 'Sumber yang dipakai', 'Sources we use')}</h2>
    <ul>
      <li><b>Standard Ebooks</b> — ${tr(L, 'karya klasik domain publik; hasil penyuntingan Standard Ebooks dilepas ke domain publik (CC0 1.0). Kami hanya memuat judul yang penulis dan penerjemahnya sudah wafat lebih dari 70 tahun, sesuai UU Hak Cipta Indonesia No. 28/2014.', 'public-domain classics; Standard Ebooks’ own editing is dedicated to the public domain (CC0 1.0). We only include titles whose author and translator died more than 70 years ago, following Indonesian copyright law (Law No. 28/2014).')}</li>
      <li><b>Book Dash</b> — ${tr(L, 'buku bergambar anak berlisensi Creative Commons Attribution 4.0 (CC BY 4.0). Penulis, ilustrator, dan penyunting setiap buku disebut di halaman bukunya dan di bawah ini.', 'children’s picture books under Creative Commons Attribution 4.0 (CC BY 4.0). Each book’s writer, illustrator and editor are credited on the book page and below.')}</li>
    </ul>
    <p>${tr(L, 'Lisensi yang melarang pemakaian komersial (NC) atau turunan (ND) tidak dipakai. Suara pembaca adalah suara sintetis dari perangkat pengunjung.', 'Licences that forbid commercial use (NC) or derivatives (ND) are never used. Reader voices are synthetic voices from the visitor’s device.')}</p>
    <h2>${tr(L, `Daftar buku (${fmtNum(L, books.length)})`, `Book list (${fmtNum(L, books.length)})`)}</h2>
    <ol class="lic-list">${books.map((b) => { const m = byId.get(b.id); return html`<li><a href="${bookPath(L, b.id)}">${b.title}</a>${m ? html` — ${m.attribution} <a href="${m.licenseUrl}" rel="noopener license" target="_blank">${m.license}</a>` : ''}</li>`; })}</ol>
  </div></section>`;
}

export const laneBySlugOrNull = (slug: string): Lane | null => LANES.find((l) => l.slug[0] === slug || l.slug[1] === slug) ?? null;
export const isShelf = (s: string | undefined): s is ShelfId => Boolean(s && s in SHELVES);
export { raw };
