/**
 * Artikel (daftar per kluster, halaman artikel dengan daftar isi & artikel terkait), halaman informasi Markdown, dan halaman
 * publik „Untuk Guru“.
 */
import { html, raw, type Raw } from '../lib/html.ts';
import { tr, pick, P, articlePath, fmtDate, toolPath, lanePath, type Lang } from '../lib/i18n.ts';
import { renderMarkdown } from '../lib/markdown.ts';
import { ARTICLES, CLUSTERS, type ArticleMeta, type ClusterId } from '../content/articles.ts';
import { pageHead } from './layout.ts';
import { TOOLS } from './tools.ts';
import { LANES } from '../catalog/lanes.ts';

export function articlesIndex(L: Lang, cluster: ClusterId | null): Raw {
  const list = ARTICLES.filter((a) => !cluster || a.cluster === cluster).sort((a, b) => b.date.localeCompare(a.date) || a.key.localeCompare(b.key));
  return html`${pageHead(tr(L, 'Artikel', 'Articles'), tr(L, 'Panduan praktis tentang membaca untuk orang tua, guru, pelajar, dan pembaca umum — disusun dari sumber tepercaya, ditulis dalam bahasa Indonesia dan Inggris.', 'Practical guides on reading for parents, teachers, students and general readers — built on trusted sources, written in Indonesian and English.'))}
  <section class="section"><div class="wrap">
    <nav class="chips" aria-label="${tr(L, 'Kluster', 'Topics')}"><a class="chip ${cluster ? '' : 'on'}" href="${P(L, 'articles')}">${tr(L, 'Semua', 'All')}</a>${(Object.keys(CLUSTERS) as ClusterId[]).map((k) => html`<a class="chip ${cluster === k ? 'on' : ''}" href="${P(L, 'articles')}?topik=${k}">${pick(L, CLUSTERS[k])}</a>`)}</nav>
    <div class="grid g3">${list.map((a) => html`<a class="art-card reveal" href="${articlePath(L, a.slug)}"><span class="eyebrow">${pick(L, a.clusterName)}</span><b>${pick(L, a.title)}</b><span class="muted">${pick(L, a.description)}</span><small class="muted">${fmtDate(L, a.date)} · ${readTime(L, a)}</small></a>`)}</div>
  </div></section>`;
}

export function readTime(L: Lang, a: ArticleMeta): string {
  const w = renderMarkdown(L === 'en' ? a.body.en : a.body.id).words;
  return tr(L, `${Math.max(3, Math.round(w / 200))} menit baca`, `${Math.max(3, Math.round(w / 220))} min read`);
}

export function articlePage(L: Lang, a: ArticleMeta): Raw {
  const md = renderMarkdown(L === 'en' ? a.body.en : a.body.id);
  const related = ARTICLES.filter((x) => x.key !== a.key).sort((x, y) => Number(y.cluster === a.cluster) - Number(x.cluster === a.cluster)).slice(0, 3);
  return html`<article class="article">
  <header class="art-head"><div class="wrap narrow">
    <nav class="crumbs"><a href="${P(L, 'articles')}">${tr(L, 'Artikel', 'Articles')}</a> › <a href="${P(L, 'articles')}?topik=${a.cluster}">${pick(L, a.clusterName)}</a></nav>
    <h1>${pick(L, a.title)}</h1>
    <p class="lead">${pick(L, a.description)}</p>
    <p class="muted small">${tr(L, 'Tim Redaksi jenius.es', 'jenius.es Editorial Team')} · ${fmtDate(L, a.date)} · ${readTime(L, a)}</p>
    <div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-listen-article>🔊 ${tr(L, 'Dengarkan artikel ini', 'Listen to this article')}</button></div>
  </div></header>
  <div class="wrap narrow art-body">
    ${md.toc.length > 2 ? html`<nav class="toc card" aria-label="${tr(L, 'Daftar isi', 'Contents')}"><b>${tr(L, 'Daftar isi', 'Contents')}</b><ol>${md.toc.map((t) => html`<li><a href="#${t.id}">${t.text}</a></li>`)}</ol></nav>` : ''}
    <div class="prose" data-article-text>${raw(md.html)}</div>
    <aside class="card note">${tr(L, 'Artikel ini adalah informasi umum dan bukan pengganti nasihat profesional. Ada koreksi atau masukan? Tulis ke', 'This article is general information, not a substitute for professional advice. Corrections or feedback? Write to')} <a href="mailto:halo@jenius.es">halo@jenius.es</a>.</aside>
    <section class="related"><h2>${tr(L, 'Baca juga', 'Read next')}</h2><div class="grid g3">${related.map((x) => html`<a class="art-card" href="${articlePath(L, x.slug)}"><span class="eyebrow">${pick(L, x.clusterName)}</span><b>${pick(L, x.title)}</b></a>`)}</div></section>
  </div>
</article>`;
}

export function articleJsonLd(origin: string, L: Lang, a: ArticleMeta): unknown {
  return {
    '@context': 'https://schema.org', '@type': 'Article', headline: pick(L, a.title), description: pick(L, a.description), inLanguage: L,
    datePublished: a.date, dateModified: a.date, mainEntityOfPage: `${origin}${articlePath(L, a.slug)}`,
    author: { '@type': 'Organization', name: tr(L, 'Tim Redaksi jenius.es', 'jenius.es Editorial Team'), url: origin },
    publisher: { '@type': 'Organization', name: 'jenius.es', logo: { '@type': 'ImageObject', url: `${origin}/assets/logo-main-600.webp` } },
    image: `${origin}/assets/logo-main-1200.webp`,
  };
}

export function infoPage(title: string, lead: string, md: string): Raw {
  return html`${pageHead(title, lead)}<section class="section"><div class="wrap narrow prose">${raw(renderMarkdown(md).html)}</div></section>`;
}

export function teachersPage(L: Lang): Raw {
  return html`${pageHead(tr(L, 'Untuk guru dan sekolah', 'For teachers and schools'), tr(L, 'jenius.es gratis untuk kelas: buku bersuara di setiap jenjang, mode slide untuk layar kelas, alat siap cetak, dan ruang kelas digital.', 'jenius.es is free for classrooms: voiced books at every level, slide mode for the class screen, printable tools and a digital classroom.'))}
  <section class="section"><div class="wrap">
    <div class="grid g3">
      ${[
        ['📚', tr(L, 'Buku untuk setiap jenjang', 'Books for every level'), tr(L, 'Jalur Tunas sampai Cendekia mencatat jenjang sekolah (TK, SD, SMP, SMA, mahasiswa, S2–S3), sehingga Anda cepat memilih buku untuk kelas.', 'Lanes from Sprout to Scholar note school levels (pre-K to postgraduate), so you can quickly pick books for your class.')],
        ['🖥', tr(L, 'Mode slide untuk layar kelas', 'Slide mode for the class screen'), tr(L, 'Buku bergambar tampil layar penuh dan dibacakan otomatis — cocok untuk membaca bersama di proyektor.', 'Picture books go full screen and are read aloud automatically — ideal for shared reading on a projector.')],
        ['🧾', tr(L, 'Alat siap cetak', 'Printable tools'), tr(L, 'Uji kecepatan baca, rencana baca mingguan, dan kartu kosakata siap dipakai hari ini.', 'Reading speed test, weekly reading plan and vocabulary cards are ready to use today.')],
      ].map(([ic, t, d]) => html`<article class="feature reveal"><span class="feature-ic">${ic}</span><h3>${t}</h3><p class="muted">${d}</p></article>`)}
    </div>
    <h2 class="section-sub">${tr(L, 'Ruang kelas digital — dibuka bertahap', 'Digital classroom — opening in stages')}</h2>
    <p class="muted">${classroomNote(L)}</p>
    <div class="grid g3">
      ${[
        ['🏫', tr(L, 'Kelas dengan nama unik', 'Classes with a unique name'), tr(L, 'Buat kelas, undang murid lewat tautan, kode, atau QR — anak tidak perlu e-mail. Orang tua menyetujui untuk anak di bawah umur.', 'Create a class and invite students by link, code or QR — children need no email. Parents approve for minors.')],
        ['💬', tr(L, 'Grup, rak, tugas & nilai', 'Group, shelf, tasks & grades'), tr(L, 'Chat kelas yang dimoderasi guru, rak buku kelas, soal dan tugas, nilai, serta rapor baca per murid yang bisa diekspor.', 'Teacher-moderated class chat, a class shelf, questions and tasks, grades, and per-student reading reports you can export.')],
        ['✍️', tr(L, 'Tugas lanjutan', 'Follow-up tasks'), tr(L, 'Periksa tulisan murid dengan xscan.es dan analisis artikel atau situs dengan ascan.es langsung dari ruang guru.', 'Check student writing with xscan.es and analyse articles or sites with ascan.es straight from the teacher room.')],
      ].map(([ic, t, d]) => html`<article class="feature reveal"><span class="feature-ic">${ic}</span><h3>${t}</h3><p class="muted">${d}</p></article>`)}
    </div>
    <div class="cta-row center">${classroomCta(L)}<a class="btn btn-ghost btn-lg" href="${P(L, 'lanes')}">${tr(L, 'Jelajahi buku', 'Browse books')}</a></div>
    <div class="grid g2 section-sub">
      <div class="card"><h3>${tr(L, 'Pilih jalur untuk kelas Anda', 'Pick a lane for your class')}</h3><ul class="clean">${LANES.map((l) => html`<li><a href="${lanePath(L, l.slug)}">${l.icon} ${pick(L, l.name)}</a> — <span class="muted">${pick(L, l.levels)}</span></li>`)}</ul></div>
      <div class="card"><h3>${tr(L, 'Alat untuk kelas', 'Tools for class')}</h3><ul class="clean">${TOOLS.map((t) => html`<li><a href="${toolPath(L, t.slug)}">${t.icon} ${pick(L, t.name)}</a></li>`)}</ul>
      <p><a href="${articlePath(L, ['tantangan-membaca-kelas', 'class-reading-challenge'])}">${tr(L, 'Panduan: menyusun tantangan membaca kelas', 'Guide: designing a class reading challenge')} →</a></p></div>
    </div>
  </div></section>`;
}

/** Ruang kelas (fase J-B): selama belum dibuka, halaman ini tidak menautkan ke pendaftaran yang belum ada. */
export let CLASSROOM_OPEN = false;
export const setClassroomOpen = (v: boolean) => { CLASSROOM_OPEN = v; };
const classroomNote = (L: Lang) => (CLASSROOM_OPEN
  ? tr(L, 'Semua fitur di bawah sudah bisa dipakai gratis setelah membuat akun guru.', 'Every feature below is available free once you create a teacher account.')
  : tr(L, 'Fitur di bawah sedang dibuka bertahap. Sementara itu, semua buku, mode slide, dan alat cetak di atas sudah bisa dipakai tanpa akun.', 'The features below are opening in stages. Meanwhile, all books, slide mode and the printable tools above work without an account.'));
const classroomCta = (L: Lang) => (CLASSROOM_OPEN
  ? html`<a class="btn btn-primary btn-lg" href="${L === 'en' ? '/en/signup?as=teacher' : '/daftar?sebagai=guru'}">${tr(L, 'Buat akun guru gratis', 'Create a free teacher account')}</a>`
  : html`<a class="btn btn-primary btn-lg" href="${P(L, 'contact')}">${tr(L, 'Minta akses awal ruang kelas', 'Request early classroom access')}</a>`);
