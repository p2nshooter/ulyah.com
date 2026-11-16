#!/usr/bin/env python3
"""
Simulasi Goethe-Zertifikat A1 (Start Deutsch 1) dari *Deutsch von Anfang an* (Yash Vikram, MIT License):
4 Modelltest lengkap — Hören 3 Teile (15), Lesen 3 Teile (15), Schreiben 2 Teile (formulir 5 + pesan ±30 kata),
Sprechen 3 Teile. Versi sumber dikunci pada satu commit agar hasilnya stabil.

Pemakaian: python3 -I scripts/exam/goethe_a1.py <folder luaja> <folder cache>
Keluaran:  src/exam/gen/goethe-a1.json
"""
import hashlib
import json
import os
import re
import sys
import time
import urllib.request

ROOT = os.path.abspath(sys.argv[1])
CACHE = os.path.abspath(sys.argv[2])
COMMIT = 'aa4095c8af4c9f68b261d2cb4682cc880c20d40e'
BASE = f'https://raw.githubusercontent.com/yashvikram30/german-course/{COMMIT}/content/tests/'
os.makedirs(CACHE, exist_ok=True)


def fetch(url):
    p = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest()[:20])
    if not os.path.exists(p):
        for i in range(4):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'LUAJA-exam/1.0'}), timeout=60) as r:
                    open(p, 'wb').write(r.read())
                break
            except Exception:  # noqa: BLE001
                if i == 3:
                    raise
                time.sleep(2 * (i + 1))
    return open(p, encoding='utf-8').read()


def inline(s):
    s = re.sub(r'\*\*([^*]+)\*\*', r'\1', s)
    s = re.sub(r'\*([^*]+)\*', r'\1', s)
    s = re.sub(r'`([^`]+)`', r'\1', s)
    return re.sub(r'\s+', ' ', s).strip()


def fences(md):
    """[(jenis, header{}, baris[], teks sebelum blok)] berurutan."""
    out, pre = [], []
    lines = md.split('\n')
    i = 0
    while i < len(lines):
        m = re.match(r'^```([a-z]+)\s*$', lines[i])
        if m:
            kind, head, rows, j = m.group(1), {}, [], i + 1
            in_head = True
            while j < len(lines) and lines[j].strip() != '```':
                ln = lines[j]
                if in_head and ln.strip() == '---':
                    in_head = False
                elif in_head and ':' in ln and kind in ('exercise', 'dialogue'):
                    k, v = ln.split(':', 1)
                    head[k.strip()] = v.strip()
                else:
                    in_head = False
                    if ln.strip():
                        rows.append(ln.strip())
                j += 1
            out.append((kind, head, rows, '\n'.join(pre)))
            pre = []
            i = j + 1
            continue
        pre.append(lines[i])
        i += 1
    return out


def german(row):
    return inline(row.split('|')[0])


def split_speakers(t):
    parts = [p.strip() for p in re.split(r'\s+–\s+', t) if p.strip()]
    return [{'s': 'F' if k % 2 == 0 else 'M', 't': p} for k, p in enumerate(parts)]


def mc_item(row, audio=False, statement=None):
    cols = [c.strip() for c in row.split('|')]
    stem, opts, ans = cols[0], [inline(o) for o in cols[1].split(' / ')], inline(cols[2])
    why = inline(cols[3]) if len(cols) > 3 else ''
    a = next(i for i, o in enumerate(opts) if o == ans)
    it = {'options': opts, 'answer': a, 'why': why or f'Jawaban: {ans}.'}
    if audio:
        it['stem'] = statement or 'Dengarkan, lalu pilih jawaban yang tepat.'
        it['audio'] = split_speakers(inline(stem))
        if statement:
            it['audio'] = [{'s': 'N', 't': inline(stem)}]
    else:
        it['stem'] = inline(re.sub(r'^\d+\.\s*', '', stem))
    return it


def parse_test(n):
    md = fetch(f'{BASE}test{n}.md')
    fs = fences(md)
    parts, passages = {}, {}
    ads = [f for f in fs if f[0] == 'dialogue' and 'Anzeigen' in f[1].get('title', '')]
    l1_texts = [f for f in fs if f[0] == 'dialogue' and f not in ads and 'Schild' not in f[1].get('title', '')]
    signs = [f for f in fs if f[0] == 'dialogue' and 'Schild' in f[1].get('title', '')]
    for kind, head, rows, pre in fs:
        if kind != 'exercise':
            continue
        eid = head.get('id')
        if eid in ('h1', 'h3'):
            parts[eid] = [mc_item(r, audio=True) for r in rows]
        elif eid == 'h2':
            stm = re.findall(r'-\s+\*\*\d+\.\*\*\s+(.+)', pre)
            parts['h2'] = [mc_item(r, audio=True, statement=inline(stm[k]) if k < len(stm) else None) for k, r in enumerate(rows)]
        elif eid == 'l1':
            key = f'ga1-{n}-l1'
            passages[key] = '\n\n'.join(f"{f[1].get('title', '')}\n" + '\n'.join(german(r) for r in f[2]) for f in l1_texts[:2]).strip()
            parts['l1'] = [dict(mc_item(r), passage=key) for r in rows]
        elif eid == 'l2':
            items = []
            for k, r in enumerate(rows):
                key = f'ga1-{n}-l2-{k}'
                if k < len(ads):
                    passages[key] = '\n'.join(german(x) for x in ads[k][2])
                items.append(dict(mc_item(r), passage=key))
            parts['l2'] = items
        elif eid == 'l3':
            key = f'ga1-{n}-l3'
            passages[key] = '\n'.join(german(r) for r in (signs[0][2] if signs else []))
            parts['l3'] = [dict(mc_item(r), passage=key) for r in rows]
        elif eid == 's1':
            text = ' '.join(l[1:].strip() for l in pre.split('\n') if l.startswith('>'))
            key = f'ga1-{n}-s1'
            passages[key] = inline(text)
            items = []
            for r in rows:
                cols = [c.strip() for c in r.split('|')]
                items.append({'kind': 'gap', 'stem': inline(cols[0].replace('___', '').rstrip(': ')), 'options': [], 'answer': -1,
                              'accept': [inline(x) for x in cols[1].split(' / ')], 'why': inline(cols[2]) if len(cols) > 2 else '', 'passage': key})
            parts['s1'] = items
        elif eid == 's2':
            quote = [l[1:].strip() for l in pre.split('\n') if l.startswith('>')]
            situation = inline(' '.join(q for q in quote if not q.startswith('–')))
            points = [inline(q.lstrip('– ').strip()) for q in quote if q.startswith('–')]
            model = inline(rows[0].split('|')[1]) if rows else ''
            rubric = [{'t': p, 'pts': 3} for p in points[:3]] + [{'t': 'Anrede & Gruß, ±30 Wörter, verständlich', 'pts': 1}]
            parts['s2'] = [{'kind': 'write', 'stem': situation, 'options': [], 'answer': -1, 'points': 10, 'rubric': rubric, 'model': model,
                            'why': 'Setiap poin isi bernilai 3 (lengkap & dapat dipahami); 1 poin untuk salam pembuka/penutup dan bentuk pesan.'}]
    # Sprechen: tiga bagian dengan kartu isyarat & contoh jawaban.
    sp = md.split('## Sprechen', 1)[1] if '## Sprechen' in md else ''
    blocks = re.findall(r'\*\*(Teil \d[^*]*)\*\*\s*([^\n]*)\n+```examples\n(.*?)\n```', sp, re.S)
    rub = {1: [('Memperkenalkan diri dengan kata kunci (Name, Alter, Land, Wohnort, Sprachen, Beruf, Hobby)', 1), ('Mengeja kata dengan benar', 1), ('Menyebut nomor/angka dengan benar', 1)],
           2: [('Mengajukan 2 pertanyaan dengan kartu kata', 3), ('Menjawab 2 pertanyaan pasangan', 3)],
           3: [('Membuat 2 permintaan dengan kartu gambar', 3), ('Menanggapi 2 permintaan pasangan', 3)]}
    for k, (title, desc, ex) in enumerate(blocks[:3], 1):
        cues = [german(r) for r in ex.strip().split('\n') if r.strip()]
        parts[f'sp{k}'] = [{'kind': 'speak', 'stem': inline(f'{title} {desc}'), 'options': [], 'answer': -1, 'points': sum(p for _, p in rub[k]),
                            'rubric': [{'t': t, 'pts': p} for t, p in rub[k]], 'model': ' / '.join(cues), 'cues': cues,
                            'why': 'Ucapkan setiap jawaban dengan suara keras, lalu nilai diri dengan jujur memakai daftar periksa.'}]
    return {'n': n, 'parts': parts, 'passages': passages}


if __name__ == '__main__':
    mocks = [parse_test(n) for n in (1, 2, 3, 4)]
    expect = {'h1': 6, 'h2': 4, 'h3': 5, 'l1': 5, 'l2': 5, 'l3': 5, 's1': 5, 's2': 1, 'sp1': 1, 'sp2': 1, 'sp3': 1}
    for m in mocks:
        got = {k: len(v) for k, v in m['parts'].items()}
        assert got == expect, (m['n'], got)
    out = {'source': 'Deutsch von Anfang an — Yash Vikram (MIT License)', 'commit': COMMIT, 'mocks': mocks}
    os.makedirs(os.path.join(ROOT, 'src', 'exam', 'gen'), exist_ok=True)
    json.dump(out, open(os.path.join(ROOT, 'src', 'exam', 'gen', 'goethe-a1.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('ok', len(mocks), 'simulasi Goethe A1')
