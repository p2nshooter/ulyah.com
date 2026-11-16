#!/usr/bin/env python3
"""
Pembangun Pustaka LUAJA (docs/LUAJA-BLUEPRINT.md §4, §6.2).

Menyerap sumber BERLISENSI TERBUKA saja, lalu mengubahnya menjadi buku interaktif (JSON per buku) untuk pembaca di
portal member. Tidak ada salinan materi berhak cipta penuh; setiap buku membawa sumber dan lisensinya.

  Grimm Grammar (COERLL, UT Austin)            CC BY 4.0     tata bahasa Jerman + seluruh latihan berkunci jawaban
  Deutsch im Blick (COERLL, UT Austin)         CC BY 4.0     kosakata 10 bab + audio penutur asli, video, buku kerja (PDF)
  Tatoeba                                      CC BY 2.0 FR  kalimat Jerman / Inggris / Jepang + terjemahan Indonesia

Pemakaian:  python3 -I scripts/pustaka/build.py <folder luaja> [<folder cache>]
Unduhan disimpan di folder cache (tidak masuk repo). Keluaran: public/p/b/<id>.json + src/library/catalog.gen.ts.
"""
import bz2
import hashlib
import html
import json
import os
import re
import subprocess
import sys
import time
import urllib.request

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
CACHE = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.path.expanduser('~/.cache/luaja-pustaka'))
OUT = os.path.join(ROOT, 'public', 'p', 'b')
UA = 'LUAJA-pustaka/1.0 (open-licence importer; +https://luaja.com/kredit)'
os.makedirs(CACHE, exist_ok=True)
os.makedirs(OUT, exist_ok=True)


def fetch(url: str, binary: bool = False):
    """Unduh sekali, simpan di cache. Sopan: jeda singkat antar-permintaan."""
    key = hashlib.sha1(url.encode()).hexdigest()[:20]
    path = os.path.join(CACHE, key)
    if not os.path.exists(path):
        for attempt in range(4):
            try:
                req = urllib.request.Request(url, headers={'User-Agent': UA})
                with urllib.request.urlopen(req, timeout=90) as r:
                    data = r.read()
                break
            except Exception as e:  # noqa: BLE001
                if attempt == 3:
                    raise RuntimeError(f'gagal mengunduh {url}: {e}')
                time.sleep(2 * (attempt + 1))
        with open(path + '.tmp', 'wb') as f:
            f.write(data)
        os.replace(path + '.tmp', path)
        time.sleep(0.25)
    with open(path, 'rb') as f:
        data = f.read()
    return data if binary else data.decode('utf-8', 'replace')


def text(s: str) -> str:
    """HTML → teks bersih satu baris."""
    s = re.sub(r'<br\s*/?>', ' ', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s).replace('\xa0', ' ')
    return re.sub(r'\s+', ' ', s).strip()


def weight(b: dict) -> int:
    """Perkiraan „berat“ blok untuk membagi halaman."""
    k = b['k']
    if k in ('vid', 'aud'):
        return 260
    if k == 'voc':
        return 70 * len(b['i']) + 80
    if k == 'tbl':
        return sum(len(' '.join(r)) + 20 for r in b['r'])
    if k == 'mc':
        return len(b['q']) + sum(len(o) for o in b['o']) + 80
    if k == 'gap':
        return sum(len(x) for x in b['s']) + 60
    if k == 'sen':
        return len(b['t']) + len(b.get('id', '')) + 40
    return len(b.get('t', '')) + 30


class Book:
    def __init__(self, id, lang, level, cat, title, sub, author, source, source_url, licence, licence_url, about):
        self.meta = dict(id=id, lang=lang, level=level, cat=cat, title=title, sub=sub, author=author, source=source,
                         sourceUrl=source_url, licence=licence, licenceUrl=licence_url, about=about)
        self.pages = []
        self.toc = []

    def chapter(self, title):
        self.toc.append([title, len(self.pages)])

    def add(self, title, blocks, limit=1500):
        """Tambah satu atau lebih halaman (dibagi menurut berat; judul diulang dengan penanda lanjutan)."""
        cur, w, part = [], 0, 0
        for b in blocks:
            bw = weight(b)
            if cur and w + bw > limit and b['k'] != 'h':
                self.pages.append({'t': title if part == 0 else f'{title} ({part + 1})', 'b': cur})
                cur, w, part = [], 0, part + 1
            cur.append(b)
            w += bw
        if cur:
            self.pages.append({'t': title if part == 0 else f'{title} ({part + 1})', 'b': cur})

    def save(self):
        if not self.pages:
            return None
        doc = dict(self.meta, toc=self.toc, pages=self.pages)
        with open(os.path.join(OUT, f"{self.meta['id']}.json"), 'w', encoding='utf-8') as f:
            json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))
        stats = dict(pages=len(self.pages), chapters=len(self.toc),
                     exercises=sum(1 for p in self.pages for b in p['b'] if b['k'] in ('mc', 'gap')),
                     media=sum(1 for p in self.pages for b in p['b'] if b['k'] in ('vid', 'aud')),
                     words=sum(len(b['i']) for p in self.pages for b in p['b'] if b['k'] == 'voc'),
                     sentences=sum(1 for p in self.pages for b in p['b'] if b['k'] == 'sen'))
        return dict(self.meta, toc=self.toc[:60], **stats)


# ───────────────────────────── Grimm Grammar ─────────────────────────────
GG = 'https://coerll.utexas.edu/gg/gr/'
GG_LIC = ('CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/')
GG_SRC = 'Grimm Grammar — Department of Germanic Studies, University of Texas at Austin (COERLL)'
# Kelompok topik → jenjang CEFR yang lazim (urutan buku teks tahun pertama/kedua).
GG_LEVEL = {'no': 'a1', 'det': 'a1', 'v': 'a1', 'vi': 'a1', 'vm': 'a2', 'vcp': 'a2', 'cas': 'a2', 'pro': 'a1', 'con': 'a2',
            'adj': 'a2', 'adv': 'b1', 'mis': 'b1', 'vp': 'b1', 'vs': 'b1', 'vk': 'b1', 'pas': 'b1', 'inf': 'b1'}


def gg_nav():
    s = fetch(GG + 'index.html')
    nav = s[s.find('<ul id="nav">'):s.find('</ul>\n</div>', s.find('<ul id="nav">'))]
    out, seen = [], set()
    for href, label in re.findall(r'<li><a href="([a-z_0-9]+\.html)">(.*?)</a></li>', nav):
        if href in seen or not re.match(r'^[a-z]+_\d+\.html$', href):
            continue
        seen.add(href)
        out.append((href, text(label)))
    return out


def gg_blocks(page_html: str):
    """Isi penjelasan satu topik: judul, paragraf (Inggris), contoh Jerman (dengan arti), tabel, audio."""
    a = page_html.find('<div id="content_wrapper">')
    b = page_html.find('<div id="ex_wrapper">')
    if b < 0:
        b = page_html.find('<div id="foo_wrapper">')
    body = page_html[a:b] if a >= 0 else ''
    body = re.sub(r'<script.*?</script>|<!--.*?-->', '', body, flags=re.S)
    blocks, title = [], ''
    for m in re.finditer(r'<span class="h_16_8a97b2">(.*?)</span>|<p[^>]*>(.*?)</p>|<table[^>]*>(.*?)</table>|<source src="([^"]+\.mp3)"', body, re.S):
        h, p, tb, au = m.groups()
        if h:
            t = text(h)
            if t and not title:
                title = t
            if t:
                blocks.append({'k': 'h', 't': t})
        elif p is not None:
            t = text(p)
            if t and 'browser does not support' not in t:
                blocks.append({'k': 'p', 't': t, 'l': 'en'})
        elif tb is not None:
            rows = []
            for row in re.findall(r'<tr[^>]*>(.*?)</tr>', tb, re.S):
                cells = [text(c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.S)]
                cells = [c for c in cells if c]
                if cells:
                    rows.append(cells)
            for r in rows:
                if len(r) == 1:
                    m2 = re.match(r'^(.*?)\s*\(([^()]*)\)\s*$', r[0])
                    if m2 and m2.group(1):
                        blocks.append({'k': 'ex', 't': m2.group(1), 'g': m2.group(2)})
                    else:
                        blocks.append({'k': 'ex', 't': r[0]})
            multi = [r for r in rows if len(r) > 1]
            if multi:
                blocks.append({'k': 'tbl', 'r': multi})
        elif au:
            src = au if au.startswith('http') else 'https://coerll.utexas.edu/gg/' + au.replace('../', '')
            blocks.append({'k': 'aud', 'src': src.replace('http://', 'https://').replace(':443/', '/'), 't': 'Audio contoh'})
    return title, blocks


def gg_exercises():
    """Semua latihan dari halaman kunci jawaban resmi Grimm Grammar → {topik: [(judul, petunjuk, [blok])]}."""
    s = fetch(GG + 'answer_key.html')
    out = {}
    parts = re.split(r'<a name="([a-z]+_\d+_\d+_[a-z]+)"></a>', s)
    for i in range(1, len(parts), 2):
        code, chunk = parts[i], parts[i + 1]
        end = chunk.find('<!-- end ')
        chunk = chunk[:end] if end > 0 else chunk[:60000]
        topic = re.match(r'([a-z]+_\d+)_', code).group(1)
        kind = code.rsplit('_', 1)[1]
        title = text((re.search(r'<span class="h_16_8a97b2">(.*?)<br', chunk, re.S) or re.search(r'<span class="h_16_8a97b2">(.*?)</span>', chunk, re.S) or [None, ''])[1])
        instr = text((re.search(r'<p class="bot_150">(.*?)</p>', chunk, re.S) or [None, ''])[1])
        items = []
        table = re.search(r'<table class="ex">(.*)</table>', chunk, re.S)
        if not table:
            continue
        if kind == 'fib':
            for row in re.findall(r'<tr>\s*<td class="qnum">.*?</td>\s*<td>(.*?)</td>\s*</tr>', table.group(1), re.S):
                segs = re.split(r'<span class="ans_fib">(.*?)</span>', row, flags=re.S)
                s_text = [text(x) if j % 2 == 0 else None for j, x in enumerate(segs)]
                answers = [text(x) for j, x in enumerate(segs) if j % 2 == 1]
                if not answers or any(not a for a in answers):
                    continue
                pieces = [x for j, x in enumerate(s_text) if j % 2 == 0]
                items.append({'k': 'gap', 's': pieces, 'a': [a.split('/')[0].strip() for a in answers], 'alt': [[y.strip() for y in a.split('/')] for a in answers]})
        elif kind.startswith('mc'):
            for row in re.findall(r'<td><b>\d+</b>\.</td>\s*<td>(.*?)</table>\s*</td>', table.group(1), re.S):
                q = text(row.split('<table', 1)[0])
                opts_html = re.findall(r'<td>(.*?)</td>', row.split('<table', 1)[1] if '<table' in row else '', re.S)
                opts, ans = [], -1
                for j, o in enumerate(opts_html):
                    if 'ans_mc' in o:
                        ans = j
                    opts.append(re.sub(r'^[a-h]\.\s*', '', text(o)))
                if q and len(opts) >= 2 and ans >= 0 and len(set(opts)) == len(opts):
                    items.append({'k': 'mc', 'q': q, 'o': opts, 'a': ans})
        if items:
            out.setdefault(topic, []).append((title or 'Übung', instr, items))
    return out


def build_grimm():
    nav = gg_nav()
    exercises = gg_exercises()
    books = {}
    for lv in ('a1', 'a2', 'b1'):
        books[lv] = Book(f'de-gg-{lv}', 'de', lv, 'grammatik', f'Grimm Grammar · Tata Bahasa Jerman {lv.upper()}',
                         'Penjelasan, contoh bersuara dan latihan berkunci jawaban', 'Department of Germanic Studies, UT Austin',
                         GG_SRC, 'https://coerll.utexas.edu/gg/', *GG_LIC,
                         'Referensi tata bahasa Jerman dari University of Texas at Austin: setiap topik dijelaskan dengan contoh kalimat '
                         'bersuara, lalu diuji dengan latihan isian dan pilihan ganda yang langsung dinilai.')
    for href, label in nav:
        code = href[:-5]
        grp = re.match(r'([a-z]+)_', code).group(1)
        lv = GG_LEVEL.get(grp, 'b1')
        title, blocks = gg_blocks(fetch(GG + href))
        if not blocks:
            continue
        bk = books[lv]
        name = f'{label[:1].upper()}{label[1:]}' + (f' · {title}' if title and title.lower() != label.lower() else '')
        bk.chapter(name)
        bk.add(name, blocks)
        for ex_title, instr, items in exercises.get(code, []):
            head = [{'k': 'h', 't': ex_title}] + ([{'k': 'tip', 't': instr, 'l': 'en'}] if instr else [])
            for n, it in enumerate(items, 1):
                it['n'] = n
            bk.add(f'Latihan · {label}', head + items, limit=1300)
    return [b.save() for b in books.values()]


# ───────────────────────────── Deutsch im Blick ─────────────────────────────
DIB = 'https://coerll.utexas.edu/dib/'
DIB_SRC = 'Deutsch im Blick — Department of Germanic Studies, University of Texas at Austin (COERLL)'


def dib_chapter(k: int):
    voc = fetch(f'{DIB}voc.php?k={k}')
    sections = []
    for sid, chunk in re.findall(r'<div id="vs_(\d+)"(.*?)(?=<div id="vs_\d+"|<div id="foo_wrapper"|$)', voc, re.S):
        au = re.search(r'<source src="([^"]+\.mp3)"', chunk)
        names = [text(x) for x in re.findall(r'<span class="hi_12_0057d1">(.*?)</span>', chunk, re.S)[:2]]
        items = []
        for row in re.findall(r'<tr[^>]*>(.*?)</tr>', chunk, re.S):
            cells = [text(c) for c in re.findall(r'<td[^>]*>(.*?)</td>', row, re.S)]
            if len(cells) >= 2 and cells[0] and cells[1]:
                items.append([cells[0], cells[1]])
        if items:
            sections.append({'de': names[0] if names else f'Teil {sid}', 'en': names[1] if len(names) > 1 else '',
                             'audio': au.group(1).replace(':443', '') if au else None, 'items': items})
    try:
        rss = fetch(f'{DIB}rss.php?k={k}&a=mp4')
    except RuntimeError:  # bab tanpa umpan video (mis. Kapitel 10 dialihkan) — kosakata & buku kerja tetap diimpor
        rss = ''
    title = text((re.search(r'<title>(.*?)</title>', voc, re.S) or [None, ''])[1]).split('::')
    chap = text((re.search(r'chapter: (.*?)&lt;', rss) or [None, ''])[1]) or (title[1].strip() if len(title) > 2 else f'Kapitel {k}')
    chap = chap.encode('latin-1', 'ignore').decode('utf-8', 'ignore') if 'Ã' in chap else chap
    videos = []
    for item in re.findall(r'<item>(.*?)</item>', rss, re.S):
        t = text((re.search(r'<title>(.*?)</title>', item, re.S) or [None, ''])[1])
        if 'Ã' in t:
            t = t.encode('latin-1', 'ignore').decode('utf-8', 'ignore')
        url = (re.search(r'<enclosure url="([^"]+)"', item) or [None, ''])[1]
        dur = (re.search(r'<itunes:duration>(.*?)</itunes:duration>', item) or [None, ''])[1]
        if url:
            videos.append({'t': re.sub(r'^Kapitel \d+ - ', '', t), 'src': url.replace('http://', 'https://'), 'd': dur})
    return chap, sections, videos


def pdf_pages(pdf_bytes: bytes):
    """Teks per halaman PDF (pdftotext), dibersihkan dari kepala/kaki halaman."""
    p = subprocess.run(['pdftotext', '-enc', 'UTF-8', '-', '-'], input=pdf_bytes, capture_output=True, check=True)
    pages = p.stdout.decode('utf-8', 'replace').split('\f')
    out = []
    for pg in pages:
        lines = [ln.strip() for ln in pg.splitlines()]
        lines = [ln for ln in lines if ln and not re.match(r'^(\d{4} COERLL|Page \d+ of \d+|University of Texas at Austin|Kapitel \d+$|\d+$)', ln)]
        if not lines:
            continue
        paras, cur = [], []
        for ln in lines:
            if re.match(r'^[•●▪\-–]\s*', ln) or (cur and (cur[-1].endswith(('.', '!', '?', ':')) and ln[:1].isupper())):
                if cur:
                    paras.append(' '.join(cur))
                cur = [re.sub(r'^[•●▪]\s*', '• ', ln)]
            else:
                cur.append(ln)
        if cur:
            paras.append(' '.join(cur))
        out.append([re.sub(r'\s+', ' ', x).strip() for x in paras if len(x.strip()) > 1])
    return out


def build_dib(pdf_dir: str):
    res = []
    vocab = {'a1': Book('de-dib-wortschatz-a1', 'de', 'a1', 'wortschatz', 'Deutsch im Blick · Wortschatz A1', 'Kosakata Kapitel 1–5 dengan audio penutur asli',
                        'Department of Germanic Studies, UT Austin', DIB_SRC, DIB, 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/',
                        'Kosakata tematik buku Deutsch im Blick (bab 1–5): setiap bagian dibacakan penutur asli Jerman; setiap kata bisa '
                        'didengar ulang, disembunyikan artinya untuk menguji diri, dan disimpan ke Kosakata saya.'),
             'a2': Book('de-dib-wortschatz-a2', 'de', 'a2', 'wortschatz', 'Deutsch im Blick · Wortschatz A2', 'Kosakata Kapitel 6–10 dengan audio penutur asli',
                        'Department of Germanic Studies, UT Austin', DIB_SRC, DIB, 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/',
                        'Kosakata tematik buku Deutsch im Blick (bab 6–10) dengan audio penutur asli Jerman.')}
    video = {'a1': Book('de-dib-video-a1', 'de', 'a1', 'video', 'Deutsch im Blick · Video A1', 'Wawancara & „Sprache im Kontext“ Kapitel 1–5',
                        'Department of Germanic Studies, UT Austin', DIB_SRC, DIB, 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/',
                        'Video asli dari Würzburg dan Austin: penutur Jerman, Austria dan Swiss berbicara tentang topik setiap bab.'),
             'a2': Book('de-dib-video-a2', 'de', 'a2', 'video', 'Deutsch im Blick · Video A2', 'Wawancara & „Sprache im Kontext“ Kapitel 6–10',
                        'Department of Germanic Studies, UT Austin', DIB_SRC, DIB, 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/',
                        'Video asli penutur Jerman untuk bab 6–10.')}
    for k in range(1, 11):
        lv = 'a1' if k <= 5 else 'a2'
        chap, sections, videos = dib_chapter(k)
        vb = vocab[lv]
        vb.chapter(f'Kapitel {k} · {chap}')
        for s in sections:
            blocks = [{'k': 'voc', 'a': s['audio'], 'i': s['items']}]
            name = f"{s['de']}" + (f" · {s['en']}" if s['en'] else '')
            vb.add(f'K{k} · {name}', blocks, limit=2400)
        if videos:
            vd = video[lv]
            vd.chapter(f'Kapitel {k} · {chap}')
            for v in videos:
                vd.add(f'K{k} · {v["t"]}', [{'k': 'vid', 'src': v['src'], 't': v['t'], 'd': v['d']}])
        pdf_path = os.path.join(pdf_dir, f'k_{k:02d}.pdf') if pdf_dir else ''
        data = open(pdf_path, 'rb').read() if pdf_path and os.path.exists(pdf_path) else fetch(f'{DIB}pdfs/k_{k:02d}.pdf', binary=True)
        wb = Book(f'de-dib-arbeitsbuch-{k:02d}', 'de', lv, 'arbeitsbuch', f'Deutsch im Blick · Arbeitsbuch Kapitel {k}', chap,
                  'Department of Germanic Studies, UT Austin', DIB_SRC, f'{DIB}toc.php?k={k}', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/',
                  f'Buku kerja bab {k} Deutsch im Blick: latihan, dialog dan bacaan bab ini — bisa dibaca, didengarkan, dan setiap katanya diketuk untuk melihat arti.')
        for n, paras in enumerate(pdf_pages(data), 1):
            if n == 1:
                wb.chapter('Überblick')
            heads = [p for p in paras if 3 < len(p) < 60 and not p.endswith('.') and p[:1].isupper() and not p.startswith('•')]
            if heads and n > 1 and len(wb.toc) < 40 and len(heads[0]) > 6:
                wb.chapter(heads[0])
            wb.add(f'Seite {n}', [{'k': 'p', 't': p} for p in paras], limit=99999)
        res.append(wb.save())
    return res + [b.save() for b in vocab.values()] + [b.save() for b in video.values()]


# ───────────────────────────── Tatoeba ─────────────────────────────
TAT = 'https://downloads.tatoeba.org/exports/per_language/'


def tsv_bz2(url: str):
    raw = bz2.decompress(fetch(url, binary=True)).decode('utf-8', 'replace')
    return [ln.split('\t') for ln in raw.splitlines() if ln]


_PAIRS = {}


def tatoeba_pairs(code: str):
    """(id, kalimat, terjemahan Indonesia) untuk satu bahasa Tatoeba (deu/eng/jpn), unik per kalimat."""
    if code in _PAIRS:
        return _PAIRS[code]
    if 'ind' not in _PAIRS:
        _PAIRS['ind'] = {r[0]: r[2] for r in tsv_bz2(TAT + 'ind/ind_sentences.tsv.bz2') if len(r) >= 3}
    ind = _PAIRS['ind']
    links = tsv_bz2(f'{TAT}{code}/{code}-ind_links.tsv.bz2')
    want = {a for a, b in links}
    src = {r[0]: r[2] for r in tsv_bz2(f'{TAT}{code}/{code}_sentences.tsv.bz2') if len(r) >= 3 and r[0] in want}
    pairs, seen = [], set()
    for a, b in links:
        t, tr = src.get(a), ind.get(b)
        if t and tr and t not in seen:
            seen.add(t)
            pairs.append((a, t, tr))
    _PAIRS[code] = pairs
    return pairs


def build_tatoeba():
    res = []
    names = {'deu': ('de', 'Jerman'), 'eng': ('en', 'Inggris'), 'jpn': ('ja', 'Jepang')}
    lv_names = {'de': ['a1', 'a2', 'b1', 'b2'], 'en': ['beginner', 'elementary', 'pre-intermediate', 'intermediate'], 'ja': ['n5', 'n4', 'n3', 'n2']}
    for code, (lang, nm) in names.items():
        pairs = list(tatoeba_pairs(code))
        size = (lambda t: len(t)) if lang == 'ja' else (lambda t: len(t.split()))
        # Seruan satu kata („Ah!“, „Go!“) tidak membentuk kalimat untuk dipelajari.
        pairs = [p for p in pairs if (size(p[1]) >= 5 if lang == 'ja' else size(p[1]) >= 2)]
        pairs.sort(key=lambda p: (size(p[1]), len(p[1]), p[1]))
        # Empat tingkat menurut panjang kalimat; setiap buku ≤ 1.000 kalimat (50 halaman × 20).
        n = len(pairs)
        cuts = [0, n // 4, n // 2, 3 * n // 4, n]
        for i in range(4):
            # Di dalam satu tingkat urutannya diacak tetap (menurut id) agar setiap halaman bervariasi.
            chunk = sorted(pairs[cuts[i]:cuts[i + 1]], key=lambda p: hashlib.md5(p[0].encode()).hexdigest())
            for vol in range(0, len(chunk), 1000):
                part = chunk[vol:vol + 1000]
                no = vol // 1000 + 1
                lv = lv_names[lang][i]
                bk = Book(f'{lang}-tatoeba-{i + 1}-{no}', lang, lv, 'kalimat', f'Kalimat {nm}–Indonesia · Tingkat {i + 1}' + (f' · Jilid {no}' if len(chunk) > 1000 else ''),
                          f'{len(part)} kalimat asli dengan terjemahan Indonesia', 'Kontributor Tatoeba', 'Tatoeba (tatoeba.org)', 'https://tatoeba.org',
                          'CC BY 2.0 FR', 'https://creativecommons.org/licenses/by/2.0/fr/',
                          f'Kalimat {nm} yang ditulis dan diperiksa komunitas Tatoeba, berpasangan dengan terjemahan Indonesia. Dengarkan, '
                          'tutup terjemahannya untuk menguji diri, lalu ucapkan ulang.')
                for p0 in range(0, len(part), 20):
                    page = part[p0:p0 + 20]
                    if p0 % 200 == 0:
                        bk.chapter(f'Kalimat {vol + p0 + 1}–{vol + min(p0 + 200, len(part))}')
                    bk.add(f'Kalimat {vol + p0 + 1}–{vol + p0 + len(page)}', [{'k': 'sen', 't': t, 'id': tr, 'n': int(a)} for a, t, tr in page], limit=99999)
                res.append(bk.save())
    return res


# ───────────────────────────── Project Gutenberg (domain publik) ─────────────────────────────
# Hanya penulis yang wafat ≤ 1955 (domain publik di Indonesia: hidup + 70 tahun, dihitung mulai 1 Januari berikutnya).
PG_PD = 'https://creativecommons.org/publicdomain/mark/1.0/'
GUTENBERG = [
    # (id, bahasa, jenjang, judul tampilan, penulis, tahun wafat)
    (17161, 'de', 'a1', 'Max und Moritz', 'Wilhelm Busch', 1908),
    (35794, 'de', 'a1', 'Märchen und Erzählungen für Anfänger I', 'H. A. Guerber', 1929),
    (45189, 'de', 'a2', 'Märchen und Erzählungen für Anfänger II', 'H. A. Guerber', 1929),
    (8392, 'de', 'a2', 'Hin und Her: Ein Buch für die Kinder', 'Henry H. Fick', 1935),
    (9860, 'de', 'a2', 'Moni der Geißbub', 'Johanna Spyri', 1901),
    (6651, 'de', 'b1', 'Immensee', 'Theodor Storm', 1888),
    (7858, 'de', 'b1', "L'Arrabbiata", 'Paul Heyse', 1914),
    (21917, 'de', 'b1', 'Eingeschneit: Eine Studentengeschichte', 'Emil Frommel', 1896),
    (49503, 'de', 'b1', 'Ährenlese: A German Reader with Practical Exercises', 'H. C. Bierwirth', 1940),
    (7500, 'de', 'b1', 'Heidis Lehr- und Wanderjahre', 'Johanna Spyri', 1901),
    (22367, 'de', 'b2', 'Die Verwandlung', 'Franz Kafka', 1924),
    (21593, 'de', 'b2', 'Das Urteil', 'Franz Kafka', 1924),
    (35312, 'de', 'b2', 'Aus dem Leben eines Taugenichts', 'Joseph von Eichendorff', 1857),
    (6638, 'de', 'b2', 'Märchen-Almanach auf das Jahr 1826', 'Wilhelm Hauff', 1827),
    (77905, 'de', 'b2', 'Deutsche Märchen (Brüder Grimm)', 'Jacob & Wilhelm Grimm', 1863),
    (5323, 'de', 'c1', 'Effi Briest', 'Theodor Fontane', 1898),
    (12108, 'de', 'c1', 'Der Tod in Venedig', 'Thomas Mann', 1955),
    (23313, 'de', 'c1', 'Tonio Kröger', 'Thomas Mann', 1955),
    (24249, 'de', 'c1', 'Die Harzreise', 'Heinrich Heine', 1856),
    (22627, 'de', 'c1', 'German Science Reader', 'Charles F. Kroeh', 1928),
    (2229, 'de', 'c2', 'Faust: Der Tragödie erster Teil', 'Johann Wolfgang von Goethe', 1832),
    (6498, 'de', 'c2', 'Kabale und Liebe', 'Friedrich Schiller', 1805),
    (69894, 'de', 'c2', 'Allerhand Sprachdummheiten', 'Gustav Wustmann', 1910),
    (13810, 'de', 'c2', 'Tristan', 'Thomas Mann', 1955),
    (14642, 'en', 'beginner', "McGuffey's Eclectic Primer", 'William H. McGuffey', 1873),
    (14640, 'en', 'beginner', "McGuffey's First Eclectic Reader", 'William H. McGuffey', 1873),
    (14304, 'en', 'beginner', 'The Tale of Peter Rabbit', 'Beatrix Potter', 1943),
    (68453, 'en', 'beginner', 'The Summers Readers: Primer', 'Maud Summers', 1940),
    (14668, 'en', 'elementary', "McGuffey's Second Eclectic Reader", 'William H. McGuffey', 1873),
    (19994, 'en', 'elementary', 'The Aesop for Children', 'Aesop / Milo Winter', 1956 - 1),
    (14407, 'en', 'elementary', 'The Tale of Benjamin Bunny', 'Beatrix Potter', 1943),
    (14766, 'en', 'pre-intermediate', "McGuffey's Third Eclectic Reader", 'William H. McGuffey', 1873),
    (55, 'en', 'pre-intermediate', 'The Wonderful Wizard of Oz', 'L. Frank Baum', 1919),
    (7010, 'en', 'pre-intermediate', 'Graded Lessons in English', 'Alonzo Reed & Brainerd Kellogg', 1920),
    (14880, 'en', 'intermediate', "McGuffey's Fourth Eclectic Reader", 'William H. McGuffey', 1873),
    (11, 'en', 'intermediate', "Alice's Adventures in Wonderland", 'Lewis Carroll', 1898),
    (236, 'en', 'intermediate', 'The Jungle Book', 'Rudyard Kipling', 1936),
    (7188, 'en', 'intermediate', 'Higher Lessons in English', 'Alonzo Reed & Brainerd Kellogg', 1920),
    (15040, 'en', 'upper-intermediate', "McGuffey's Fifth Eclectic Reader", 'William H. McGuffey', 1873),
    (1661, 'en', 'upper-intermediate', 'The Adventures of Sherlock Holmes', 'Arthur Conan Doyle', 1930),
    (215, 'en', 'upper-intermediate', 'The Call of the Wild', 'Jack London', 1916),
    (45814, 'en', 'upper-intermediate', 'An Advanced English Grammar with Exercises', 'G. L. Kittredge & F. E. Farley', 1941),
    (16751, 'en', 'advanced', "McGuffey's Sixth Eclectic Reader", 'William H. McGuffey', 1873),
    (120, 'en', 'advanced', 'Treasure Island', 'Robert Louis Stevenson', 1894),
    (43, 'en', 'advanced', 'The Strange Case of Dr Jekyll and Mr Hyde', 'Robert Louis Stevenson', 1894),
    (46, 'en', 'advanced', 'A Christmas Carol', 'Charles Dickens', 1870),
    (1342, 'en', 'proficiency', 'Pride and Prejudice', 'Jane Austen', 1817),
    (174, 'en', 'proficiency', 'The Picture of Dorian Gray', 'Oscar Wilde', 1900),
    (844, 'en', 'proficiency', 'The Importance of Being Earnest', 'Oscar Wilde', 1900),
]
CHAP = re.compile(r'^(CHAPTER|Chapter|KAPITEL|Kapitel|LESSON|Lesson|STORY|Erstes|Zweites|Drittes|Viertes|Fünftes|Sechstes|Siebentes|Achtes|Neuntes|Zehntes|ACT|Act|Scene|SCENE|Szene|[IVXLC]+\.?\s|[0-9]{1,3}\.\s+[A-ZÄÖÜ])')


def gutenberg_text(n: int) -> str:
    raw = fetch(f'https://www.gutenberg.org/cache/epub/{n}/pg{n}.txt')
    raw = raw.replace('\r\n', '\n')
    a = re.search(r'\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\n', raw)
    b = re.search(r'\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG', raw)
    return raw[a.end() if a else 0:b.start() if b else len(raw)]


def build_gutenberg():
    res = []
    for n, lang, lv, title, author, died in GUTENBERG:
        if died > 1955:
            continue
        body = gutenberg_text(n)
        paras = [re.sub(r'\s+', ' ', x).strip() for x in re.split(r'\n\s*\n', body)]
        paras = [re.sub(r'_([^_]+)_', r'\1', x) for x in paras if x and not re.match(r'^\[(Illustration|Ilustration|Abbildung)[^\]]*\]?$', x)]
        paras = [x for x in paras if not re.match(r'^(Produced by|E-text prepared|Transcriber|This e-?book|Updated editions|Note:)', x, re.I)]
        if len(paras) < 5:
            continue
        bk = Book(f'{lang}-pg-{n}', lang, lv, 'bacaan', title, f'{author} · bacaan domain publik', author,
                  'Project Gutenberg', f'https://www.gutenberg.org/ebooks/{n}', 'Public domain', PG_PD,
                  f'„{title}“ karya {author} — teks domain publik dari Project Gutenberg, dibaca per halaman: dengarkan setiap '
                  'paragraf, ketuk kata untuk mendengar dan menyimpannya, lalu lanjutkan ke bab berikutnya.')
        cur, w, page_title = [], 0, title
        bk.chapter(title if not paras or not CHAP.match(paras[0]) else paras[0][:70])

        def flush():
            nonlocal cur, w
            if cur:
                bk.add(page_title, cur, limit=99999)
            cur, w = [], 0
        for x in paras:
            heading = len(x) < 80 and not x.endswith(('.', ',', ';', '!', '?', '“', '"', '«', '»')) and (CHAP.match(x) or (x.isupper() and len(x) > 3))
            if heading:
                flush()
                page_title = x.title() if x.isupper() else x
                if len(bk.toc) < 120 and bk.pages:
                    bk.chapter(page_title[:80])
                cur.append({'k': 'h', 't': page_title})
                continue
            # Paragraf sangat panjang dibagi per kalimat agar satu halaman tetap nyaman dibaca.
            for chunk in (re.findall(r'.{1,1400}(?:[.!?]["“”»]?\s+|$)', x) if len(x) > 1500 else [x]):
                chunk = chunk.strip()
                if not chunk:
                    continue
                if w + len(chunk) > 1700 and cur:
                    flush()
                cur.append({'k': 'p', 't': chunk})
                w += len(chunk)
        flush()
        res.append(bk.save())
    return res


# ───────────────────────────── Aozora Bunko (domain publik Jepang) ─────────────────────────────
AOZORA = [
    # (folder penulis, nomor kartu, jenjang, judul, penulis, wafat)
    ('000121', 628, 'n3', 'ごんぎつね', '新美南吉 (Niimi Nankichi)', 1943),
    ('000121', 637, 'n3', '手袋を買いに', '新美南吉 (Niimi Nankichi)', 1943),
    ('000081', 43754, 'n3', '注文の多い料理店', '宮沢賢治 (Miyazawa Kenji)', 1933),
    ('000081', 46605, 'n3', 'やまなし', '宮沢賢治 (Miyazawa Kenji)', 1933),
    ('000879', 92, 'n3', '蜘蛛の糸', '芥川龍之介 (Akutagawa Ryūnosuke)', 1927),
    ('000879', 170, 'n2', '杜子春', '芥川龍之介 (Akutagawa Ryūnosuke)', 1927),
    ('000879', 42, 'n2', '鼻', '芥川龍之介 (Akutagawa Ryūnosuke)', 1927),
    ('000879', 127, 'n2', '羅生門', '芥川龍之介 (Akutagawa Ryūnosuke)', 1927),
    ('000035', 1567, 'n2', '走れメロス', '太宰治 (Dazai Osamu)', 1948),
    ('000148', 799, 'n2', '夢十夜', '夏目漱石 (Natsume Sōseki)', 1916),
    ('000081', 456, 'n1', '銀河鉄道の夜', '宮沢賢治 (Miyazawa Kenji)', 1933),
    ('000148', 752, 'n1', '坊っちゃん', '夏目漱石 (Natsume Sōseki)', 1916),
    ('000148', 773, 'n1', 'こころ', '夏目漱石 (Natsume Sōseki)', 1916),
]


def aozora_html(folder: str, card: int) -> str:
    cp = fetch(f'https://www.aozora.gr.jp/cards/{folder}/card{card}.html')
    m = re.search(r'\./files/(\d+_\d+)\.html', cp)
    if not m:
        raise RuntimeError(f'Aozora card{card}: berkas XHTML tidak ditemukan')
    return fetch(f'https://www.aozora.gr.jp/cards/{folder}/files/{m.group(1)}.html', binary=True).decode('cp932', 'replace')


def build_aozora():
    res = []
    for folder, card, lv, title, author, died in AOZORA:
        if died > 1955:
            continue
        h = aozora_html(folder, card)
        a = h.find('<div class="main_text">')
        b = h.find('<div class="bibliographical_information">')
        body = h[a:b if b > 0 else len(h)]
        body = re.sub(r'<ruby><rb>(.*?)</rb><rp>.*?</rp><rt>(.*?)</rt><rp>.*?</rp></ruby>', lambda m: f'｜{text(m.group(1))}《{text(m.group(2))}》', body, flags=re.S)
        body = re.sub(r'<h[3-5][^>]*>(.*?)</h[3-5]>', lambda m: '\n\x01' + text(m.group(1)) + '\n', body, flags=re.S)
        body = re.sub(r'<br\s*/?>', '\n', body)
        body = html.unescape(re.sub(r'<[^>]+>', '', body))
        lines = [ln.strip().replace('　', '') for ln in body.split('\n')]
        bk = Book(f'ja-aozora-{card}', 'ja', lv, 'bacaan', title, f'{author} · berfurigana', author, 'Aozora Bunko (青空文庫)',
                  f'https://www.aozora.gr.jp/cards/{folder}/card{card}.html', 'Public domain', PG_PD,
                  f'「{title}」 karya {author} — karya domain publik dari Aozora Bunko dengan furigana asli. Dengarkan setiap '
                  'paragraf, ketuk kalimat untuk mendengar ulang dan simpan ungkapan baru.')
        bk.chapter(title)
        cur, w, pt = [], 0, title
        for ln in lines:
            if not ln:
                continue
            if ln.startswith('\x01'):
                if cur:
                    bk.add(pt, cur, limit=99999)
                cur, w, pt = [], 0, ln[1:] or title
                if bk.pages:
                    bk.chapter(pt)
                cur.append({'k': 'h', 't': pt})
                continue
            plain = len(re.sub(r'《[^》]*》|｜', '', ln))
            if w + plain > 700 and cur:
                bk.add(pt, cur, limit=99999)
                cur, w = [], 0
            cur.append({'k': 'p', 't': ln})
            w += plain
        if cur:
            bk.add(pt, cur, limit=99999)
        res.append(bk.save())
    return res


# ───────────────────────────── JLPT: kosakata & kanji N5–N1 ─────────────────────────────
JLPT_VOC = 'https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n{}.csv'
KANJI_JSON = 'https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json'
KA_CSV = 'https://raw.githubusercontent.com/kanjialive/kanji-data-media/master/language-data/ka_data.csv'


def build_jlpt():
    import csv as _csv
    import io as _io
    res = []
    pairs = tatoeba_pairs('jpn')
    for n in (5, 4, 3, 2, 1):
        rows = list(_csv.DictReader(_io.StringIO(fetch(JLPT_VOC.format(n)))))
        words = []
        seen = set()
        for r in rows:
            e, rd, m = r['expression'].strip(), r['reading'].strip(), r['meaning'].strip()
            if e and m and e not in seen:
                seen.add(e)
                words.append([e, m, rd if rd != e else ''])
        bk = Book(f'ja-jlpt-vocab-n{n}', 'ja', f'n{n}', 'wortschatz', f'Kosakata JLPT N{n}', f'{len(words)} kata dengan bacaan, arti dan contoh kalimat',
                  'Jonathan Waller (tanos.co.uk) · JMdict/EDRDG · open-anki-jlpt-decks',
                  'Daftar kosakata JLPT Jonathan Waller (CC BY) dengan arti dari JMdict (EDRDG, CC BY-SA 4.0), disusun open-anki-jlpt-decks (MIT)',
                  'https://github.com/jamsinclair/open-anki-jlpt-decks', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/',
                  f'Kosakata yang lazim diujikan di JLPT N{n}: setiap kata dengan bacaan kana, arti dan contoh kalimat asli ber-terjemahan '
                  'Indonesia (Tatoeba). Dengarkan, uji diri dengan menyembunyikan arti, lalu latih dengan kartu hafalan.')
        for p0 in range(0, len(words), 20):
            chunk = words[p0:p0 + 20]
            if p0 % 200 == 0:
                bk.chapter(f'Kata {p0 + 1}–{min(p0 + 200, len(words))}')
            ex = []
            for e, _, _ in chunk:
                if len(ex) >= 3 or len(e) < 2:
                    continue
                hit = next((p for p in pairs if e in p[1] and len(p[1]) <= 40 and p[1] not in [x['t'] for x in ex]), None)
                if hit:
                    ex.append({'k': 'sen', 't': hit[1], 'id': hit[2], 'n': int(hit[0])})
            bk.add(f'N{n} · kata {p0 + 1}–{p0 + len(chunk)}', [{'k': 'voc', 'a': None, 'i': chunk}] + ex, limit=99999)
        res.append(bk.save())
    kj = json.loads(fetch(KANJI_JSON))
    ka = {r['kanji']: r for r in _csv.DictReader(_io.StringIO(fetch(KA_CSV)))}
    for n in (5, 4, 3, 2, 1):
        items = sorted([(c, v) for c, v in kj.items() if v.get('jlpt_new') == n], key=lambda x: (x[1].get('freq') or 9999, x[1].get('strokes') or 99))
        bk = Book(f'ja-kanji-n{n}', 'ja', f'n{n}', 'kamus', f'Kanji JLPT N{n}', f'{len(items)} kanji: arti, bacaan on/kun, jumlah goresan, contoh kata',
                  'KANJIDIC (EDRDG) · Kanji alive · Jonathan Waller (JLPT)',
                  'KANJIDIC2 (EDRDG, CC BY-SA 4.0), Kanji alive (CC BY 4.0), tingkat JLPT Jonathan Waller (CC BY) lewat kanji-data (MIT)',
                  'https://www.edrdg.org/wiki/index.php/KANJIDIC_Project', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/',
                  f'Semua kanji tingkat JLPT N{n}, diurutkan dari yang paling sering dipakai: arti, bacaan on & kun, jumlah goresan dan '
                  'contoh kata bersuara — lalu kuis kecil di setiap halaman.')
        for p0 in range(0, len(items), 5):
            chunk = items[p0:p0 + 5]
            if p0 % 50 == 0:
                bk.chapter(f'Kanji {p0 + 1}–{min(p0 + 50, len(items))}')
            blocks = []
            for c, v in chunk:
                exs = []
                if c in ka:
                    try:
                        exs = [[x[0].split('（')[0], (x[0].split('（')[1].rstrip('）') if '（' in x[0] else ''), x[1]] for x in json.loads(ka[c]['examples'])][:4]
                    except Exception:  # noqa: BLE001
                        exs = []
                blocks.append({'k': 'kj', 'c': c, 'm': ', '.join(m for m in v.get('meanings') or [] if 'Radical' not in m)[:120],
                               'on': '、'.join(v.get('readings_on') or []), 'kun': '、'.join(v.get('readings_kun') or []),
                               's': v.get('strokes') or 0, 'ex': exs})
            pool = [v for v in items]
            for j, (c, v) in enumerate(chunk[:3]):
                right = ', '.join(m for m in v.get('meanings') or [] if 'Radical' not in m)[:60]
                wrong = []
                for k in range(1, 40):
                    o = pool[(p0 + j * 7 + k * 11) % len(pool)][1]
                    om = ', '.join(m for m in o.get('meanings') or [] if 'Radical' not in m)[:60]
                    if om and om != right and om not in wrong:
                        wrong.append(om)
                    if len(wrong) == 3:
                        break
                if right and len(wrong) == 3:
                    pos = (p0 + j) % 4
                    opts = wrong[:pos] + [right] + wrong[pos:]
                    blocks.append({'k': 'mc', 'n': j + 1, 'q': f'「{c}」 = ?', 'o': opts, 'a': pos})
            bk.add(f'N{n} · {" ".join(c for c, _ in chunk)}', blocks, limit=99999)
        res.append(bk.save())
    return res


# ───────────────────────────── VOA Learning English (domain publik) ─────────────────────────────
VOA = 'https://learningenglish.voanews.com'
VOA_LIC = ('Public domain', 'https://learningenglish.voanews.com/p/6861.html')


def pdf_columns(pdf: bytes, first: int, last: int):
    """Teks dua kolom (kiri lalu kanan) per halaman PDF, memakai potongan area pdftotext."""
    import tempfile
    out = []
    with tempfile.NamedTemporaryFile(suffix='.pdf') as f:
        f.write(pdf)
        f.flush()
        info = subprocess.run(['pdfinfo', f.name], capture_output=True, text=True).stdout
        w, h = [float(x) for x in re.search(r'Page size:\s+([\d.]+) x ([\d.]+)', info).groups()]
        for pg in range(first, last + 1):
            for x0 in (0, w / 2):
                r = subprocess.run(['pdftotext', '-f', str(pg), '-l', str(pg), '-x', str(int(x0)), '-y', '0', '-W', str(int(w / 2)), '-H', str(int(h)), '-enc', 'UTF-8', f.name, '-'], capture_output=True)
                out.append(r.stdout.decode('utf-8', 'replace'))
    return out


def build_voa():
    res = []
    # 1) VOA Learning English Word Book: ±1.500 kata dasar dengan definisi bahasa Inggris sederhana.
    pdf = fetch('https://docs.voanews.eu/en-US-LEARN/2022/06/07/c4dbd6af-5f63-4f28-bc42-0bd175f4e4b4.pdf', binary=True)
    cols = pdf_columns(pdf, 12, 87)
    entries = []
    for col in cols:
        for ln in col.splitlines():
            ln = ln.strip()
            if not ln or re.match(r'^(learningenglish\.voanews\.com|\d+|[A-Z])$', ln):
                continue
            m = re.match(r"^([a-zA-Z][a-zA-Z'()\- ]{0,40}?) [–—-] (n\.|v\.|ad\.|adj\.|adv\.|prep\.|pro\.|conj\.)\s*(.*)$", ln)
            if m:
                entries.append([m.group(1).strip(), f'{m.group(2)} {m.group(3)}'.strip()])
            elif entries:
                entries[-1][1] = (entries[-1][1] + ' ' + ln).replace('- ', '').strip()
    entries = [[a, re.sub(r'\s+', ' ', b).replace(' .', '.').strip()] for a, b in entries if len(b) > 4]
    bk = Book('en-voa-wordbook', 'en', 'beginner', 'kamus', 'VOA Learning English Word Book', f'{len(entries)} kata inti bahasa Inggris dengan definisi sederhana',
              'VOA Learning English', 'VOA Learning English (Voice of America)', 'https://learningenglish.voanews.com', *VOA_LIC,
              'Kamus kata inti VOA Learning English: setiap kata dengan jenis kata dan definisi bahasa Inggris yang sangat sederhana — '
              'cocok untuk belajar memahami arti langsung dalam bahasa Inggris. Dengarkan, uji diri, dan pakai kartu hafalan.')
    for p0 in range(0, len(entries), 20):
        chunk = entries[p0:p0 + 20]
        if p0 % 200 == 0:
            bk.chapter(f'{chunk[0][0]} – …')
        bk.add(f'{chunk[0][0]} – {chunk[-1][0]}', [{'k': 'voc', 'a': None, 'i': chunk}], limit=99999)
    res.append(bk.save())
    # 2) Let's Learn English Level 1 & 2: video percakapan, latihan bicara & lafal, audio.
    for lv, level, start, total in (('beginner', 1, '/a/lets-learn-english-lesson-one/3111026.html', 52), ('elementary', 2, '/a/lets-learn-english-level-2-lesson1/3960391.html', 30)):
        bk = Book(f'en-voa-lle-{level}', 'en', lv, 'video', f"Let's Learn English · Level {level}", f'{total} pelajaran video VOA bersama Anna',
                  'VOA Learning English', 'VOA Learning English (Voice of America)', f'{VOA}{start}', *VOA_LIC,
                  f"Kursus video Let's Learn English Level {level} dari VOA: setiap pelajaran berisi video percakapan, latihan berbicara, "
                  'latihan lafal dan audio. Tonton, tirukan, lalu lanjutkan ke pelajaran berikutnya.')
        url, done = start, set()
        for i in range(1, total + 1):
            if not url or url in done:
                break
            done.add(url)
            try:
                page = fetch(VOA + url)
            except RuntimeError:
                break
            t = text((re.search(r'<title>(.*?)</title>', page, re.S) or [None, f'Lesson {i}'])[1])
            # Satu video bisa muncul dalam beberapa resolusi (_240p, _360p, _720p, _hq, _mobile): ambil satu per video.
            mp4, keys = [], []
            for v in re.findall(r'https://voa-video-ns\.akamaized\.net/[^"\s]+?\.mp4', page):
                key = re.sub(r'(_(\d+p|hq|mobile))?\.mp4$', '', v)
                pref = re.sub(r'\.mp4$', '', v).endswith(('_360p', '_720p'))
                if key not in keys:
                    keys.append(key)
                    mp4.append(v)
                elif pref and not mp4[keys.index(key)].endswith('_360p.mp4'):
                    mp4[keys.index(key)] = v
            mp3 = next(iter(re.findall(r'https://voa-audio(?:-ns)?\.voanews\.eu/[^"\s]+?(?<!_hq)\.mp3', page)), None)
            blocks = [{'k': 'vid', 'src': v, 't': ['Conversation', 'Speaking practice', 'Pronunciation', 'Video'][min(j, 3)]} for j, v in enumerate(mp4[:4])]
            if mp3:
                blocks.append({'k': 'aud', 'src': mp3, 't': 'Audio lesson'})
            if blocks:
                bk.chapter(t)
                bk.add(t, blocks, limit=99999)
            nxt = (re.search(r'href="(/a/[^"]+)"[^>]*>(?:\s*<[^>]+>)*\s*Lesson %d\b' % (i + 1), page)
                   or re.search(r'href="(/a/[^"]+)"[^>]*>(?:\s*<[^>]+>)*\s*Let.s Learn English[^<]{0,30}Lesson %d\b' % (i + 1), page))
            url = nxt.group(1) if nxt else None
        res.append(bk.save())
    return res



# ───────────────────────────── Deutsch von Anfang an (MIT) ─────────────────────────────
DVA_COMMIT = 'aa4095c8af4c9f68b261d2cb4682cc880c20d40e'
DVA = f'https://raw.githubusercontent.com/yashvikram30/german-course/{DVA_COMMIT}/content/book/'
CALLOUT = {'merke': 'Merke', 'tipp': 'Tipp', 'achtung': 'Achtung', 'kultur': 'Kultur', 'englisch': 'Englisch ↔ Deutsch'}


def md_inline(s):
    s = re.sub(r'\{#[^}]+\}', '', s)
    s = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'\1', s)
    s = re.sub(r'(?<![\w*])\*([^*]+)\*(?![\w*])', r'\1', s)
    s = re.sub(r'`([^`]+)`', r'\1', s)
    return re.sub(r'\s+', ' ', s).strip()


def dva_exercise(head, rows):
    ty = head.get('type', 'choice')
    out = [{'k': 'h', 't': md_inline(head.get('title', 'Übung'))}]
    if head.get('intro'):
        out.append({'k': 'tip', 't': md_inline(head['intro']), 'l': 'en'})
    n = 0
    for r in rows:
        cols = [c.strip() for c in r.split('|')]
        n += 1
        if ty in ('choice', 'listen') and len(cols) >= 3:
            opts = [md_inline(o) for o in cols[1].split(' / ')]
            ans = md_inline(cols[2])
            if ans not in opts or len(set(opts)) != len(opts):
                continue
            item = {'k': 'lmc' if ty == 'listen' else 'mc', 'n': n, 'q': md_inline(cols[0]), 'o': opts, 'a': opts.index(ans)}
            if ty == 'listen':
                item = {'k': 'lmc', 'n': n, 'au': md_inline(cols[0]), 'o': opts, 'a': opts.index(ans)}
            out.append(item)
        elif ty == 'gap' and len(cols) >= 2 and '___' in cols[0]:
            segs = [md_inline(x) for x in cols[0].split('___')]
            alts = [md_inline(a) for a in cols[1].split(' / ')]
            if len(segs) == 2 and alts and alts[0]:
                out.append({'k': 'gap', 'n': n, 's': segs, 'a': [alts[0]], 'alt': [alts]})
        elif ty in ('translate', 'order') and len(cols) >= 2:
            alts = [md_inline(a) for a in cols[1].split(' / ')]
            if alts and alts[0]:
                out.append({'k': 'gap', 'n': n, 's': [md_inline(cols[0]) + ' →', ''], 'a': [alts[0]], 'alt': [alts]})
        elif ty == 'match' and len(cols) >= 2:
            pass
        elif ty == 'write' and len(cols) >= 2:
            out.append({'k': 'tip', 't': md_inline(cols[0]), 'l': 'en'})
            for line in cols[1].split(' / '):
                out.append({'k': 'ex', 't': md_inline(line)})
    if ty == 'match':
        pairs = [[md_inline(c) for c in r.split('|')[:2]] for r in rows if '|' in r]
        meanings = [m for _, m in pairs]
        for i, (de, en) in enumerate(pairs):
            opts = meanings[i:] + meanings[:i]
            opts = sorted(set(opts), key=lambda x: hashlib.md5((x + de).encode()).hexdigest())
            out.append({'k': 'mc', 'n': i + 1, 'q': de, 'o': opts, 'a': opts.index(en)})
    return out if len(out) > 1 else []


def dva_chapter(md):
    front = re.match(r'^---\n(.*?)\n---\n', md, re.S)
    meta = {}
    if front:
        for ln in front.group(1).split('\n'):
            if ':' in ln and not ln.startswith('-'):
                k, v = ln.split(':', 1)
                meta[k.strip()] = v.strip()
        md = md[front.end():]
    sections, cur, title = [], [], None
    lines = md.split('\n')
    i, para = 0, []

    def flush_para():
        nonlocal para
        if para:
            t = md_inline(' '.join(para))
            if t:
                cur.append({'k': 'p', 't': t, 'l': 'en'})
            para = []
    while i < len(lines):
        ln = lines[i]
        m = re.match(r'^```([a-z]+)\s*$', ln)
        if m:
            flush_para()
            kind, head, rows, j, in_head = m.group(1), {}, [], i + 1, True
            while j < len(lines) and lines[j].strip() != '```':
                x = lines[j]
                if in_head and x.strip() == '---':
                    in_head = False
                elif in_head and kind in ('exercise', 'dialogue', 'vocab') and re.match(r'^[a-z]+:\s', x):
                    k, v = x.split(':', 1)
                    head[k.strip()] = v.strip()
                else:
                    in_head = False
                    if x.strip():
                        rows.append(x.strip())
                j += 1
            i = j + 1
            if kind == 'dialogue':
                if head.get('setting'):
                    cur.append({'k': 'tip', 't': md_inline(head['setting']), 'l': 'en'})
                for r in rows:
                    de, _, en = r.partition('|')
                    cur.append({'k': 'ex', 't': md_inline(de), 'g': md_inline(en)})
            elif kind == 'examples':
                for r in rows:
                    de, _, en = r.partition('|')
                    cur.append({'k': 'ex', 't': md_inline(de), 'g': md_inline(en)})
            elif kind == 'vocab':
                items = []
                for r in rows:
                    c = [x.strip() for x in r.split('|')]
                    if len(c) >= 3 and c[0] and c[2]:
                        items.append([md_inline(c[0]), md_inline(c[2]), md_inline(c[1])])
                if items:
                    if head.get('title'):
                        cur.append({'k': 'h', 't': md_inline(head['title'])})
                    cur.append({'k': 'voc', 'a': None, 'i': items})
            elif kind == 'exercise':
                cur.extend(dva_exercise(head, rows))
            elif kind in CALLOUT:
                cur.append({'k': 'tip', 't': f"{CALLOUT[kind]}: " + md_inline(' '.join(rows)), 'l': 'en'})
            continue
        if ln.startswith('## '):
            flush_para()
            if cur:
                sections.append((title or meta.get('title', ''), cur))
            title, cur = md_inline(ln[3:]), []
        elif ln.startswith('### '):
            flush_para()
            cur.append({'k': 'h', 't': md_inline(ln[4:])})
        elif ln.startswith('|'):
            flush_para()
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                cells = [md_inline(c) for c in lines[i].strip().strip('|').split('|')]
                if not all(re.match(r'^:?-{2,}:?$', c) for c in cells if c):
                    rows.append(cells)
                i += 1
            if rows:
                cur.append({'k': 'tbl', 'r': rows})
            continue
        elif ln.startswith('> '):
            flush_para()
            cur.append({'k': 'tip', 't': md_inline(ln[2:]), 'l': 'en'})
        elif re.match(r'^\s*[-*] ', ln):
            flush_para()
            cur.append({'k': 'p', 't': '• ' + md_inline(re.sub(r'^\s*[-*] ', '', ln)), 'l': 'en'})
        elif not ln.strip():
            flush_para()
        else:
            para.append(ln.strip())
        i += 1
    flush_para()
    if cur:
        sections.append((title or meta.get('title', ''), cur))
    return meta, sections


def build_dva():
    bk = Book('de-dva-a1', 'de', 'a1', 'kursus', 'Deutsch von Anfang an · Buku A1', '13 bab dari alfabet sampai Perfekt, dengan dialog bersuara, kosakata dan latihan',
              'Yash Vikram', 'Deutsch von Anfang an — © 2026 Yash Vikram (MIT License)', 'https://github.com/yashvikram30/german-course',
              'MIT', 'https://opensource.org/license/mit',
              'Buku pelajaran bahasa Jerman A1 lengkap: 13 bab bertahap dengan tujuan belajar, dialog bersuara, tabel tata bahasa, '
              'kosakata dengan lafal, dan latihan yang langsung dinilai — dari salam pertama sampai persiapan ujian Start Deutsch 1.')
    for k in range(1, 14):
        meta, sections = dva_chapter(fetch(f'{DVA}k{k:02d}.md'))
        bk.chapter(f"Kapitel {k} · {meta.get('title', '')}")
        for t, blocks in sections:
            if blocks:
                bk.add(f'K{k} · {t}', blocks)
    return [bk.save()]

# ───────────────────────────── Katalog ─────────────────────────────
def write_catalog(entries):
    entries = [e for e in entries if e]
    entries.sort(key=lambda e: (e['lang'], e['level'], e['cat'], e['id']))
    path = os.path.join(ROOT, 'src', 'library', 'catalog.gen.ts')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('/* Dibangkitkan oleh scripts/pustaka/build.py — jangan diubah tangan. Sumber & lisensi tiap buku ada di datanya. */\n')
        f.write("import type { BookMeta } from './types.ts';\n\n")
        f.write('export const BOOKS: BookMeta[] = ')
        f.write(json.dumps(entries, ensure_ascii=False, indent=0, separators=(',', ':')))
        f.write(';\n')
    total = sum(e['pages'] for e in entries)
    print(f'{len(entries)} buku · {total} halaman · {sum(e["exercises"] for e in entries)} soal · {sum(e["media"] for e in entries)} media · '
          f'{sum(e["words"] for e in entries)} kata · {sum(e["sentences"] for e in entries)} kalimat')


if __name__ == '__main__':
    pdf_dir = os.environ.get('DIB_PDF_DIR', '')
    for f in os.listdir(OUT):
        if f.endswith('.json'):
            os.remove(os.path.join(OUT, f))
    cat = []
    cat += build_grimm()
    cat += build_dib(pdf_dir)
    cat += build_tatoeba()
    for fn in (build_dva, build_gutenberg, build_aozora, build_jlpt, build_voa):
        try:
            cat += fn()
        except Exception as e:  # noqa: BLE001 — satu sumber gagal tidak menggagalkan yang lain; dilaporkan
            print(f'PERINGATAN {fn.__name__}: {e}')
    write_catalog(cat)
