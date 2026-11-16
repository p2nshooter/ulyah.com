#!/usr/bin/env python3
"""
Beri arti bahasa antarmuka (Indonesia & Jepang) pada daftar kosakata, tabel kata dan kartu kanji di buku pustaka,
dari Kamus LUAJA (pemilik, 16 Nov 2026: „mana terjemahan bahasa Indonesia nya … tergantung pelajar memilih bahasa induk“).

Sumber asli buku menyertakan arti bahasa Inggris; skrip ini menambahkan `tr: {id: [...], ja: [...]}` sejajar dengan
butir blok `voc` (b.i), baris `tbl` (b.r) dan arti kanji `kj` (b.m). Pembaca menampilkan arti dalam bahasa antarmuka,
arti Inggris tetap tampil kecil di bawahnya.

Pemakaian (setelah scripts/kamus/build.py): python3 -I scripts/kamus/annotate_books.py <folder luaja> <folder keluaran kamus>
"""
import bisect
import glob
import json
import os
import re
import sys
import unicodedata

ROOT, PACK = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
_idx, _keys, _blocks = {}, {}, {}


def nfc(s):
    return unicodedata.normalize('NFC', s).strip()


def keyof(s):
    return re.sub(r'[\t\n\r]', ' ', nfc(s).lower())


def find(lang, kind, key):
    ik = (lang, kind)
    if ik not in _idx:
        p = os.path.join(PACK, lang, f'{kind}.idx.json')
        _idx[ik] = json.load(open(p, encoding='utf-8'))['blocks'] if os.path.exists(p) else []
        _keys[ik] = [b[0].encode('utf-8') for b in _idx[ik]]
    i = bisect.bisect_right(_keys[ik], key.encode('utf-8')) - 1
    if i < 0:
        return None
    _, part, off, ln = _idx[ik][i]
    bk = (lang, kind, part, off)
    if bk not in _blocks:
        with open(os.path.join(PACK, lang, f'{kind}-{part}.txt'), 'rb') as fh:
            fh.seek(off)
            _blocks[bk] = fh.read(ln).decode('utf-8')
        if len(_blocks) > 4000:
            _blocks.pop(next(iter(_blocks)))
    txt = _blocks[bk]
    needle = key + '\t'
    at = 0 if txt.startswith(needle) else txt.find('\n' + needle)
    if at < 0:
        return None
    at = at + 1 if at > 0 else 0
    end = txt.find('\n', at)
    return json.loads(txt[at + len(needle): end if end >= 0 else None])


WEAK = {'obsolete', 'archaic', 'dated', 'rare'}


def weak(e):
    ss = [s for b in e.get('b', []) for s in b.get('s', [])]
    return bool(ss) and all(set(s.get('t') or []) & WEAK or re.search(r'\b(form|tense|participle|spelling) of\b', s['g']) for s in ss)


def entry(lang, term):
    """Entri terbaik untuk istilah: persis, lalu dari bentuk berubah; entri usang dikesampingkan."""
    k = keyof(term)
    if not k:
        return None
    ents = list(find(lang, 'e', k) or [])
    for lem in (find(lang, 'f', k) or [])[:2]:
        ents += [e for e in (find(lang, 'e', keyof(lem)) or []) if e['w'] == lem]
    ents = [e for e in ents if not weak(e)] or ents
    raw = nfc(term)
    ents.sort(key=lambda e: (e['w'] != raw if lang == 'de' else e['w'] != raw.lower(), -sum(len(b.get('s', [])) for b in e.get('b', []))))
    return ents[0] if ents else None


ART = re.compile(r'^(der|die|das|ein|eine|einen|dem|den|des|the|a|an|to)\s+', re.I)
POS_PREFIX = re.compile(r'^(n|v|ad|adj|adv|prep|pron|conj|intj|int)\.\s+', re.I)


def clean_term(t):
    t = re.sub(r'[!?.。！？…]+$', '', nfc(t)).strip()
    return re.sub(r'\s*\([^)]*\)', '', t).strip()


def english_heads(g):
    g = POS_PREFIX.sub('', g or '')
    g = re.sub(r'\([^)]*\)|“[^”]*”|"[^"]*"', '', g)
    out = []
    for part in re.split(r'[;,/]', g):
        p = ART.sub('', part.strip().strip('.').lower()).strip()
        if p and len(p.split()) <= 4 and p not in out:
            out.append(p)
    return out[:3]


def by_term(lang, term, code):
    t = clean_term(term)
    for cand in (t, ART.sub('', t)):
        e = entry(lang, cand) if cand else None
        if e and (e.get('m') or {}).get(code):
            return e['m'][code][:3]
    return []


def by_gloss(english, code):
    out = []
    for hd in english_heads(english)[:2]:
        e = entry('en', re.sub(r'[!?.]+$', '', hd))
        if e and (e.get('m') or {}).get(code):
            for x in e['m'][code][:2]:
                if x not in out:
                    out.append(x)
    return out[:3]


def meanings(lang, term, english, code):
    """
    Arti `code` (id/ja). Buku Jerman/Jepang: glos Inggris di buku adalah terjemahan yang sesuai konteks, jadi itu yang
    diterjemahkan lebih dulu („Hallo“ → hello → halo); kamus kata sasaran hanya cadangan. Buku Inggris: glosnya definisi,
    jadi kata sasarannya sendiri yang dicari.
    """
    if lang == 'en':
        return by_term(lang, term, code) or by_gloss(english, code)
    return by_gloss(english, code) or by_term(lang, term, code)


HEADER = re.compile(r'^(german|english|japanese|meaning|translation|deutsch|englisch|word|example|singular|plural|case)$', re.I)


def main():
    n_books = n_items = n_id = 0
    for f in sorted(glob.glob(os.path.join(ROOT, 'public', 'p', 'b', '*.json'))):
        doc = json.load(open(f, encoding='utf-8'))
        lang, changed = doc['lang'], False
        for pg in doc['pages']:
            for b in pg['b']:
                rows = None
                if b['k'] == 'voc':
                    rows = [(it[0], it[1] if len(it) > 1 else '') for it in b['i']]
                elif b['k'] == 'tbl' and b.get('r') and all(len(r) >= 2 for r in b['r']):
                    rows = [(r[0], r[1]) for r in b['r']]
                elif b['k'] == 'kj':
                    rows = [(b['c'], b.get('m', ''))]
                if not rows:
                    continue
                tr = {'id': [], 'ja': []}
                for term, en in rows:
                    if b['k'] == 'tbl' and (HEADER.match(term.strip()) or HEADER.match(en.strip())):
                        tr['id'].append('')
                        tr['ja'].append('')
                        continue
                    for code in ('id', 'ja'):
                        if code == lang:
                            tr[code].append('')
                            continue
                        # kanji: arti lewat glos Inggrisnya (karakter tunggal bukan entri kata)
                        m = meanings('en', '', en, code) if b['k'] == 'kj' else meanings(lang, term, en, code)
                        tr[code].append(', '.join(m))
                    n_items += 1
                    n_id += bool(tr['id'][-1])
                if any(tr['id']) or any(tr['ja']):
                    b['tr'] = {k: v for k, v in tr.items() if any(v)}
                    changed = True
        if changed:
            with open(f, 'w', encoding='utf-8') as fh:
                json.dump(doc, fh, ensure_ascii=False, separators=(',', ':'))
            n_books += 1
    print(f'buku diberi arti: {n_books}; butir: {n_items}; ber-arti Indonesia: {n_id} ({100 * n_id // max(1, n_items)}%)')


if __name__ == '__main__':
    main()
