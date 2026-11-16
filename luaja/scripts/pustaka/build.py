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
                  f'Buku kerja bab {k} Deutsch im Blick yang diurai dari PDF menjadi halaman yang bisa dibaca, dibacakan dan diketuk per kata.')
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


def build_tatoeba():
    res = []
    ind = {r[0]: r[2] for r in tsv_bz2(TAT + 'ind/ind_sentences.tsv.bz2') if len(r) >= 3}
    names = {'deu': ('de', 'Jerman'), 'eng': ('en', 'Inggris'), 'jpn': ('ja', 'Jepang')}
    lv_names = {'de': ['a1', 'a2', 'b1', 'b2'], 'en': ['beginner', 'elementary', 'pre-intermediate', 'intermediate'], 'ja': ['n5', 'n4', 'n3', 'n2']}
    for code, (lang, nm) in names.items():
        links = tsv_bz2(f'{TAT}{code}/{code}-ind_links.tsv.bz2')
        want = {a for a, b in links}
        src = {r[0]: r[2] for r in tsv_bz2(f'{TAT}{code}/{code}_sentences.tsv.bz2') if len(r) >= 3 and r[0] in want}
        pairs, seen = [], set()
        for a, b in links:
            t, tr = src.get(a), ind.get(b)
            if not t or not tr or t in seen:
                continue
            seen.add(t)
            pairs.append((a, t, tr))
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
    write_catalog(cat)
