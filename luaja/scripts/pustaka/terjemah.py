#!/usr/bin/env python3
"""
Penjelasan buku pustaka dalam bahasa Indonesia (pemilik, 16 Nov 2026: „ini kursus dari Indonesia, penjelasanya,
terjemahnya make bahasa indonesia“).

Buku sumber terbuka (Grimm Grammar, Deutsch von Anfang an, …) menjelaskan tata bahasa dalam bahasa Inggris. Teks Inggris
itu diterjemahkan ke bahasa Indonesia (diterjemahkan dan diperiksa satu per satu, bukan mesin penerjemah otomatis) dan
disimpan di scripts/pustaka/terjemah-id.json sebagai {teks Inggris: teks Indonesia}. Skrip ini:

  ekstrak <folder luaja> <folder kerja>   — kumpulkan teks Inggris yang belum diterjemahkan ke batch-NN.json
  terapkan <folder luaja>                  — tulis t_id / g_id / q_id / o_id ke buku dari terjemah-id.json

Pembaca menampilkan terjemahan Indonesia bila bahasa antarmuka Indonesia; teks asli tetap disimpan.
"""
import glob
import json
import math
import os
import re
import sys

EN = set('the a an and or of to in is are was were be been this that these those it its with for on at by from as you your '
         'they them their he she we our not can will would should must which who what when where how there here if than then '
         'into also only each other some any all both use used verb noun nouns verbs sentence word words example examples'.split())
DE = set('der die das und ist sind nicht ein eine einen dem den des zu mit auf für von im in es er sie wir ihr ich du sich '
         'auch noch nur wie was wer wo wann aber oder wenn dann bei nach aus um am zum zur'.split())


def english(text):
    ws = re.findall(r"[A-Za-zÄÖÜäöüß']+", text.lower())
    if len(ws) < 2:
        return False
    en = sum(w in EN for w in ws)
    de = sum(w in DE for w in ws)
    return en >= 2 and en > de * 1.5


def _kata(name):
    """20.000 kata terbanyak (FrequencyWords, Hermit Dave, CC BY-SA 4.0) → peringkat; untuk memilah sel Inggris dan Jerman."""
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), name)
    with open(path, encoding='utf-8') as fh:
        return {w.strip(): i + 1 for i, w in enumerate(fh) if w.strip()}


RANK_EN, RANK_DE = _kata('kata-en.txt'), _kata('kata-de.txt')
TAK_ADA = 60000
IPA = re.compile(r'^\s*[/\[][^/\]]+[/\]]\s*$|[ːəɛɪʊʏøœɐçʃʒŋ]')


LABEL_EN = set('''masculine feminine neuter plural singular nominative accusative dative genitive infinitive present past perfect
future imperative subjunctive participle pronoun pronouns verb verbs noun nouns adjective adjectives adverb adverbs article articles
definite indefinite preposition prepositions conjunction conjunctions ending endings stem tense case cases gender number person
meaning example examples english german translation formal informal question answer statement negation subject object possessive
reflexive modal auxiliary separable inseparable prefix suffix first second third 1st 2nd 3rd word order the a an of and or with
without in on for to used use when where how what which who after before time place reason positive comparative superlative
masc fem neut pl sg nom acc dat gen sing infin pres part'''.split())


def skor_en(text):
    ws = re.findall(r"[a-zäöüß']+", text.lower())
    return sum(math.log(RANK_DE.get(w, TAK_ADA)) - math.log(RANK_EN.get(w, TAK_ADA)) for w in ws) - 3 * len(re.findall('[äöüßÄÖÜ]', text))


def label_en(text):
    """Label tata bahasa Inggris di kolom kata (mis. „masculine“, „1st person singular“, „definite article“)."""
    ws = re.findall(r"[a-z0-9']+", text.lower().replace('.', ' '))
    return bool(ws) and all(w in LABEL_EN for w in ws) and any(w not in {'the', 'a', 'an', 'of', 'and', 'or', 'in', 'on', 'to', 'for', 'with'} for w in ws)


def en_cell(text, kolom=1):
    """Sel berbahasa Inggris (bukan Jerman, bukan Jepang, bukan lambang bunyi)? Kolom 0 tabel Jerman = kata Jerman, jadi
    perlu bukti lebih kuat; kolom arti (1) memang biasanya Inggris."""
    if not text or not re.search(r'[A-Za-z]', text) or re.search(r'[぀-ヿ一-鿿]', text) or IPA.search(text):
        return False
    ws = re.findall(r"[a-zäöüß']+", text.lower())
    # huruf/abjad („A a“, „qu“) dan kata yang tidak dikenal di kedua daftar (mis. „siebzehn“) bukan bukti bahasa Inggris
    if not ws or all(len(w) < 3 for w in ws) or not any(w in RANK_EN or w in RANK_DE for w in ws):
        return False
    skor = sum(math.log(RANK_DE.get(w, TAK_ADA)) - math.log(RANK_EN.get(w, TAK_ADA)) for w in ws) - 3 * len(re.findall('[äöüßÄÖÜ]', text))
    hanya_en = all(w in RANK_EN and w not in RANK_DE for w in ws)
    if kolom == 1:
        return skor > -1.5 or hanya_en
    return skor > (2.5 if kolom == 0 else 1.0) or hanya_en


def tr_id(b, n):
    t = (b.get('tr') or {}).get('id') or []
    return t[n] if n < len(t) else ''


def units(doc):
    """(blok, medan, teks Inggris) yang perlu terjemahan Indonesia."""
    if doc['lang'] == 'en':
        return
    for pg in doc['pages']:
        for b in pg['b']:
            k = b['k']
            # arti kosakata, tabel kata dan kanji (pemilik, 17 Nov 2026: „penjelasan dan terjemahan beserta kamusnya jg wajib
            # bahasa Indonesia, bukan campur2“) — arti dari Kamus LUAJA yang sudah ada tidak ditimpa
            if k == 'voc':
                for n, it in enumerate(b['i']):
                    if len(it) > 1 and it[1] and not tr_id(b, n) and en_cell(it[1], 1):
                        yield b, ('tr', n), it[1]
            elif k == 'tbl':
                for n, r in enumerate(b['r']):
                    for j, c in enumerate(r):
                        if not c or (j == 0 and (doc['lang'] == 'ja' or len(r) < 2)) or (j == 1 and tr_id(b, n)):
                            continue
                        lain = r[1] if j == 0 else r[0]
                        if c.strip().lower() == lain.strip().lower():
                            continue
                        if j == 0:
                            # kolom kata Jerman: hanya label tata bahasa Inggris atau baris judul yang seluruhnya Inggris
                            judul = n == 0 and all(en_cell(x, 2) for x in r[1:] if x) and skor_en(c) > 0
                            if not (en_cell(c, 0) or label_en(c) or judul):
                                continue
                        elif not en_cell(c, min(j, 2)):
                            continue
                        yield b, (('tr', n) if j == 1 else ('ri', n, j)), c
            elif k == 'kj':
                if not tr_id(b, 0) and b.get('m'):
                    yield b, ('tr', 0), b['m']
                for i, x in enumerate(b.get('ex') or []):
                    if len(x) > 2 and x[2] and (len(x) < 4 or not x[3]):
                        yield b, ('kjx', i), x[2]
    for pg in doc['pages']:
        for b in pg['b']:
            k = b['k']
            if k in ('p', 'tip') and b.get('l') == 'en' and b.get('t'):
                yield b, 't', b['t']
            elif k == 'h' and b.get('t') and english(b['t']):
                yield b, 't', b['t']
            elif k == 'ex' and b.get('g'):
                yield b, 'g', b['g']
            elif k == 'mc' and b.get('q') and english(b['q']):
                yield b, 'q', b['q']
            if k in ('mc', 'lmc') and b.get('o') and all(english(o) or len(o.split()) >= 3 and re.search(r'[a-z]', o) and not any(w in DE for w in o.lower().split()) for o in b['o']) and doc['lang'] == 'de':
                for i, o in enumerate(b['o']):
                    yield b, ('o', i), o


def load_tr(root):
    p = os.path.join(root, 'scripts', 'pustaka', 'terjemah-id.json')
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}


def ekstrak(root, work):
    tr = load_tr(root)
    os.makedirs(work, exist_ok=True)
    seen, todo = set(), []
    order = ['de-dva-a1', 'de-gg-a1', 'de-gg-a2', 'de-gg-b1']
    files = sorted(glob.glob(os.path.join(root, 'public', 'p', 'b', '*.json')), key=lambda f: (order.index(os.path.basename(f)[:-5]) if os.path.basename(f)[:-5] in order else 99, f))
    for f in files:
        doc = json.load(open(f, encoding='utf-8'))
        for _, _, text in units(doc):
            if text not in tr and text not in seen:
                seen.add(text)
                todo.append(text)
    batch, size, n = [], 0, 0
    for t in todo:
        batch.append(t)
        size += len(t)
        if size >= 9000:
            json.dump(batch, open(os.path.join(work, f'batch-{n:02d}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
            n, batch, size = n + 1, [], 0
    if batch:
        json.dump(batch, open(os.path.join(work, f'batch-{n:02d}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
        n += 1
    print(f'{len(todo)} teks belum diterjemahkan ({sum(map(len, todo))} huruf) → {n} batch di {work}')


def terapkan(root):
    tr = load_tr(root)
    # arti kanji (sudah ada dari Kamus LUAJA lewat annotate_books.py) dipakai untuk pilihan ganda kanji
    kanji = {}
    for f in glob.glob(os.path.join(root, 'public', 'p', 'b', 'ja-kanji-*.json')):
        for pg in json.load(open(f, encoding='utf-8'))['pages']:
            for b in pg['b']:
                if b['k'] == 'kj' and b.get('m'):
                    t = (b.get('tr', {}).get('id') or [''])[0] or tr.get(b['m'], '')
                    if t:
                        kanji[b['m']] = t

    def kanji_id(o):
        """Pilihan ganda kanji memotong arti di 60 huruf: cocokkan juga dengan awalan."""
        if o in kanji:
            return kanji[o]
        cut = o.rstrip(', ').strip()
        hits = [v for k, v in kanji.items() if k.startswith(cut)] if len(cut) >= 12 else []
        return hits[0] if len(hits) == 1 or (hits and all(h == hits[0] for h in hits)) else tr.get(o, '')
    n_set = n_miss = 0
    for f in sorted(glob.glob(os.path.join(root, 'public', 'p', 'b', '*.json'))):
        doc = json.load(open(f, encoding='utf-8'))
        changed = False
        for b, field, text in units(doc):
            t = tr.get(text)
            if not t:
                n_miss += 1
                continue
            if isinstance(field, tuple) and field[0] == 'tr':
                lst = b.setdefault('tr', {}).setdefault('id', [])
                n = field[1]
                while len(lst) <= n:
                    lst.append('')
                lst[n] = t
            elif isinstance(field, tuple) and field[0] == 'ri':
                rows = b.setdefault('ri', [[''] * len(r) for r in b['r']])
                rows[field[1]][field[2]] = t
            elif isinstance(field, tuple) and field[0] == 'kjx':
                x = b['ex'][field[1]]
                while len(x) < 4:
                    x.append('')
                x[3] = t
            elif isinstance(field, tuple):
                b.setdefault('o_id', list(b['o']))[field[1]] = t
            else:
                b[f'{field}_id'] = t
            n_set += 1
            changed = True
        if doc['id'].startswith('ja-kanji'):
            for pg in doc['pages']:
                for b in pg['b']:
                    if b['k'] == 'mc' and b.get('o'):
                        ids = [kanji_id(o) for o in b['o']]
                        if all(ids) and ids != b.get('o_id'):
                            b['o_id'] = ids
                            changed = True
        if changed:
            json.dump(doc, open(f, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f'terjemahan dipasang: {n_set}; belum ada terjemahan: {n_miss}')


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'ekstrak':
        ekstrak(os.path.abspath(sys.argv[2]), os.path.abspath(sys.argv[3]))
    else:
        terapkan(os.path.abspath(sys.argv[2]))
