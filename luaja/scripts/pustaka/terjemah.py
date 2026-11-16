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


def units(doc):
    """(blok, medan, teks Inggris) yang perlu terjemahan Indonesia."""
    if doc['lang'] == 'en':
        return
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
                if b['k'] == 'kj' and b.get('tr', {}).get('id', [''])[0]:
                    kanji[b['m']] = b['tr']['id'][0]
    n_set = n_miss = 0
    for f in sorted(glob.glob(os.path.join(root, 'public', 'p', 'b', '*.json'))):
        doc = json.load(open(f, encoding='utf-8'))
        changed = False
        for b, field, text in units(doc):
            t = tr.get(text)
            if not t:
                n_miss += 1
                continue
            if isinstance(field, tuple):
                b.setdefault('o_id', list(b['o']))[field[1]] = t
            else:
                b[f'{field}_id'] = t
            n_set += 1
            changed = True
        if doc['id'].startswith('ja-kanji'):
            for pg in doc['pages']:
                for b in pg['b']:
                    if b['k'] == 'mc' and b.get('o') and all(o in kanji for o in b['o']):
                        b['o_id'] = [kanji[o] for o in b['o']]
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
