#!/usr/bin/env python3
"""
Kamus LUAJA — kamus lengkap Jerman · Inggris · Jepang · Indonesia dengan arti dalam bahasa antarmuka (Indonesia, Inggris,
Jepang). Pemilik, 16 Nov 2026: „website ini wajib punya kamus besar kumplit 3 bahasa … langsung di tampilkan arti dari kata
yg di pilih … larikan ke kamus nya agar lebih banyak arti“; „Sy berikan ke keluasan 100gb R2“.

Sumber terbuka (atribusi di /kredit dan di setiap halaman kamus):
  • Wiktionary bahasa Inggris, Jerman, Jepang, Indonesia — CC BY-SA 4.0 (ekstraksi wiktextract/kaikki.org, Tatu Ylonen)
  • Princeton WordNet 3.0 — lisensi WordNet 3.0 (bebas dipakai dengan pemberitahuan hak cipta)
  • Wordnet Bahasa (Francis Bond dkk.) — MIT
  • Japanese WordNet (NICT) — lisensi Japanese WordNet (bebas dipakai dengan pemberitahuan hak cipta)
  • Daftar kosakata JLPT Jonathan Waller (CC BY) lewat open-anki-jlpt-decks — label jenjang N5–N1
  • FrequencyWords (Hermit Dave, CC BY-SA 4.0) — hanya untuk mengurutkan arti dari yang paling umum

Pemakaian: python3 -I scripts/kamus/build.py <folder sumber> <folder keluaran>
  Folder sumber (diisi scripts/kamus/fetch.sh): en-English.jsonl.gz en-German.jsonl.gz en-Japanese.jsonl.gz
  en-Indonesian.jsonl.gz de-extract.jsonl.gz ja-extract.jsonl.gz id-extract.jsonl.gz omw-1.4.zip wordnet.zip jlpt-n1..5.csv freq-{id,ja,de,en}.txt

Keluaran (diunggah ke R2 MEDIA di kamus/<versi>/ oleh .github/workflows/kamus-luaja.yml):
  <bhs>/e-<n>.txt   baris terurut „kunci<TAB>[entri,…]“ (kunci = kata huruf kecil, NFC; urutan byte UTF-8)
  <bhs>/e.idx.json  {parts, blocks: [[kunci pertama blok, bagian, offset, panjang], …]} — Worker membaca satu blok (range read)
  <bhs>/f-<n>.txt   „bentuk<TAB>[lema,…]“ (bentuk berubah, cara baca kana, romaji → lema)
  <bhs>/f.idx.json
  meta.json         jumlah entri dan cakupan arti per bahasa, daftar sumber
"""
import csv
import heapq
import glob
import gzip
import io
import json
import os
import re
import subprocess
import sys
import time
import unicodedata
import zipfile

LANGS = ('de', 'en', 'ja', 'id')
EDITION_FILE = {'en': 'en-English.jsonl.gz', 'de': 'en-German.jsonl.gz', 'ja': 'en-Japanese.jsonl.gz', 'id': 'en-Indonesian.jsonl.gz'}
BLOCK = 48 * 1024
PART = 90 * 1024 * 1024
SKIP_POS = {'name', 'character', 'symbol', 'punct', 'romanization', 'hanzi', 'kanji'}
KEEP_TAGS = {
    'colloquial', 'informal', 'formal', 'archaic', 'obsolete', 'dated', 'slang', 'vulgar', 'rare', 'regional', 'dialectal',
    'Austria', 'Switzerland', 'Southern-Germany', 'British', 'US', 'UK', 'Australia', 'transitive', 'intransitive', 'reflexive',
    'separable', 'inseparable', 'countable', 'uncountable', 'humble', 'honorific', 'polite', 'figuratively', 'idiomatic',
    'literary', 'poetic', 'derogatory', 'offensive', 'humorous', 'impersonal', 'godan', 'ichidan', 'auxiliary', 'abbreviation',
    'plural-only', 'singular-only', 'childish', 'technical', 'law', 'medicine', 'finance', 'computing',
}
JA_KANA = re.compile(r'^[぀-ヿー・]+$')
PAREN = re.compile(r'\([^()]*\)|\[[^\[\]]*\]|（[^（）]*）')
ART = re.compile(r"^(to|a|an|the|one's|someone's|something)\s+", re.I)
WORDS = re.compile(r"[a-z][a-z'-]+")
STOP = set('a an the of to in on for and or with by from as at be is are something someone one person thing that which who'.split())
SRC = OUT = TMP = ''


def log(*a):
    print(time.strftime('%H:%M:%S'), *a, flush=True)


def jsonl(name):
    with gzip.open(os.path.join(SRC, name), 'rt', encoding='utf-8') as fh:
        for line in fh:
            try:
                yield json.loads(line)
            except ValueError:
                continue


def nfc(s):
    return unicodedata.normalize('NFC', s).strip()


def keyof(w):
    return re.sub(r'[\t\n\r]', ' ', nfc(w).lower())


def push(lst, x, cap):
    if x and x not in lst and len(lst) < cap:
        lst.append(x)


def short(g, n=90):
    g = g.strip().rstrip('.。').strip()
    return g if len(g) <= n else g[: n - 1].rstrip() + '…'


def heads(gloss):
    """Glos Inggris → kata kepala: „to go, to walk“ → [go, walk]; „house (building)“ → [house]."""
    out = []
    for part in re.split(r'[;,]', PAREN.sub('', gloss)):
        p = part.strip().strip('.').strip().lower()
        while ART.match(p):
            p = ART.sub('', p, 1)
        if p and len(p.split()) <= 3 and len(p) <= 40:
            push(out, p, 3)
    return out


def bag(text):
    return {w for w in WORDS.findall(text.lower()) if w not in STOP}


# ── WordNet ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
class WN:
    def __init__(self):
        self.en = {}        # lema Inggris → [sinset] (urut kekerapan)
        self.syn_en = {}    # sinset → ([lema Inggris], definisi)
        self.syn = {'id': {}, 'ja': {}}       # sinset → [lema]
        self.defs = {'id': {}, 'ja': {}}      # sinset → definisi
        self.rev = {'id': {}, 'ja': {}}       # lema → [sinset]

    def load(self):
        with zipfile.ZipFile(os.path.join(SRC, 'wordnet.zip')) as z:
            for pos, p in (('noun', 'n'), ('verb', 'v'), ('adj', 'a'), ('adv', 'r')):
                for line in io.TextIOWrapper(z.open(f'wordnet/data.{pos}'), encoding='utf-8'):
                    if line.startswith(' '):
                        continue
                    head, _, gloss = line.partition(' | ')
                    f = head.split()
                    n = int(f[3], 16)
                    lemmas = [re.sub(r'\([a-z]+\)$', '', f[4 + 2 * i].replace('_', ' ')) for i in range(n)]
                    self.syn_en[f'{f[0]}-{p}'] = (lemmas, gloss.split(';')[0].strip())
                for line in io.TextIOWrapper(z.open(f'wordnet/index.{pos}'), encoding='utf-8'):
                    if line.startswith(' '):
                        continue
                    f = line.split()
                    cnt = int(f[2])
                    self.en.setdefault(f[0].replace('_', ' '), []).extend(f'{o}-{p}' for o in f[-cnt:])
        with zipfile.ZipFile(os.path.join(SRC, 'omw-1.4.zip')) as z:
            for name, lang, tag in (('omw-1.4/msa/wn-data-ind.tab', 'id', 'ind'), ('omw-1.4/jpn/wn-data-jpn.tab', 'ja', 'jpn')):
                for line in io.TextIOWrapper(z.open(name), encoding='utf-8'):
                    f = line.rstrip('\n').split('\t')
                    if len(f) < 3 or f[0].startswith('#'):
                        continue
                    syn = f[0].replace('-s', '-a')
                    if f[1] == f'{tag}:lemma':
                        w = nfc(f[2].replace('_', ' '))
                        push(self.syn[lang].setdefault(syn, []), w, 40)
                        push(self.rev[lang].setdefault(w, []), syn, 12)
                    elif f[1] == f'{tag}:def' and len(f) >= 4 and f[2] == '0':
                        self.defs[lang].setdefault(syn, f[3].strip())
        log('wordnet', len(self.en), 'lema Inggris;', len(self.syn['id']), 'sinset id;', len(self.syn['ja']), 'sinset ja')

    def best(self, head, ctx):
        """Sinset terbaik untuk kata Inggris `head` dalam konteks glos `ctx` (tumpang tindih kata; seri → yang paling sering)."""
        syns = self.en.get(head)
        if not syns:
            return []
        if not ctx:
            return syns[:2]
        scored = []
        for i, s in enumerate(syns[:12]):
            lem, d = self.syn_en.get(s, ([], ''))
            scored.append((-len(ctx & (bag(d) | bag(' '.join(lem)))), i, s))
        scored.sort()
        return [s for _, _, s in scored[:2]]


# ── Kamus pendamping dari edisi Wiktionary lain ─────────────────────────────────────────────────────────────────────────
def clean_gloss_list(senses, cap=6):
    out = []
    for s in senses or []:
        if s.get('form_of') or 'form-of' in (s.get('tags') or []):
            continue
        g = [x for x in (s.get('glosses') or []) if x]
        if g:
            push(out, short(g[-1], 140), cap)
    return out


def load_aux():
    jaw, idw, ja_tr = {}, {}, {}
    for e in jsonl('ja-extract.jsonl.gz'):
        lc, w = e.get('lang_code'), e.get('word')
        if lc not in LANGS or not w:
            continue
        for g in clean_gloss_list(e.get('senses')):
            push(jaw.setdefault((lc, nfc(w)), []), g, 8)
        if lc == 'ja':
            for t in e.get('translations') or []:
                code = t.get('lang_code') or t.get('code')
                if code in ('id', 'de', 'en') and t.get('word'):
                    push(ja_tr.setdefault(nfc(w), {}).setdefault(code, []), nfc(t['word']), 8)
    log('wiktionary jepang', len(jaw), 'entri;', len(ja_tr), 'tabel terjemahan')
    for e in jsonl('id-extract.jsonl.gz'):
        lc, w = e.get('lang_code'), e.get('word')
        if lc not in LANGS or not w:
            continue
        for g in clean_gloss_list(e.get('senses')):
            push(idw.setdefault((lc, nfc(w)), []), g, 8)
    log('wiktionary indonesia', len(idw), 'entri')
    dew = {}
    for e in jsonl('de-extract.jsonl.gz'):
        if e.get('lang_code') != 'de' or not e.get('word') or e.get('pos') in SKIP_POS:
            continue
        w = nfc(e['word'])
        defs = clean_gloss_list(e.get('senses'), 4)
        trs = {}
        for t in e.get('translations') or []:
            code = t.get('lang_code') or t.get('code')
            if code in ('id', 'ja', 'en') and t.get('word'):
                push(trs.setdefault(code, []), nfc(t['word']), 8)
        if not defs and not trs:
            continue
        cur = dew.setdefault(w, {'d': [], 't': {}, 'p': []})
        for d in defs:
            push(cur['d'], d, 4)
        for code, lst in trs.items():
            for x in lst:
                push(cur['t'].setdefault(code, []), x, 8)
        push(cur['p'], e.get('pos'), 4)
    log('wiktionary jerman', len(dew), 'entri')
    return jaw, idw, ja_tr, dew


# Partikel dan kata bantu Jepang paling umum — penjelasan ditulis manual dalam tiga bahasa antarmuka.
JA_GRAMMAR = {
    'は': (['penanda topik kalimat („adapun …“), dibaca wa'], ['主題を示す助詞（「わ」と読む）'], ['topic marker particle (read “wa”)']),
    'が': (['penanda subjek; juga „tetapi“ di antara dua kalimat'], ['主語を示す助詞／逆接「けれども」'], ['subject marker; also “but” between clauses']),
    'を': (['penanda objek langsung (dibaca o)'], ['目的語を示す助詞（「お」と読む）'], ['direct-object marker (read “o”)']),
    'に': (['ke, di, pada (tujuan, tempat keberadaan, waktu)'], ['目的地・存在の場所・時を示す助詞'], ['to, at, in (destination, location of existence, time)']),
    'で': (['di (tempat kegiatan); dengan (alat, cara)'], ['動作の場所・手段を示す助詞'], ['at (place of action); by, with (means)']),
    'へ': (['ke, menuju (arah), dibaca e'], ['方向を示す助詞（「え」と読む）'], ['to, toward (direction), read “e”']),
    'と': (['dan (kata benda); bersama; kutipan „…“'], ['並列・相手・引用を示す助詞'], ['and (nouns); with; quotation marker']),
    'も': (['juga; bahkan'], ['「…もまた」を表す助詞'], ['also, too; even']),
    'の': (['milik, dari („-nya“); penghubung kata benda'], ['所有・所属を示す助詞'], ['possessive “’s”, “of”; links nouns']),
    'や': (['dan (daftar tidak lengkap), seperti'], ['例を挙げて並べる助詞'], ['and (non-exhaustive list), such as']),
    'から': (['dari (waktu, tempat); karena'], ['起点・理由を示す助詞'], ['from (time, place); because']),
    'まで': (['sampai, hingga'], ['終点・限度を示す助詞'], ['until, up to, as far as']),
    'より': (['daripada (perbandingan); dari'], ['比較の基準・起点を示す助詞'], ['than (comparison); from']),
    'か': (['partikel tanya di akhir kalimat; atau'], ['疑問・選択を示す助詞'], ['question particle; or']),
    'ね': (['ya kan?, bukan? (meminta persetujuan)'], ['同意を求める終助詞'], ['isn’t it?, right? (seeking agreement)']),
    'よ': (['lho, loh (menegaskan informasi baru)'], ['相手に知らせる終助詞'], ['emphasis: “I tell you”']),
    'だけ': (['hanya, saja'], ['限定を表す助詞'], ['only, just']),
    'しか': (['hanya (dengan bentuk negatif)'], ['否定と共に限定を表す助詞'], ['only (used with a negative verb)']),
    'など': (['dan lain-lain, seperti'], ['例示を表す助詞'], ['and so on, such as']),
    'ので': (['karena, oleh sebab itu'], ['理由を表す接続助詞'], ['because, since']),
    'のに': (['padahal; supaya'], ['逆接・目的を表す接続助詞'], ['although, even though; in order to']),
    'けど': (['tetapi (lisan)'], ['逆接の接続助詞（話し言葉）'], ['but, although (spoken)']),
    'けれども': (['tetapi, meskipun'], ['逆接の接続助詞'], ['but, although']),
    'ながら': (['sambil'], ['同時に行うことを表す接続助詞'], ['while (doing two things at once)']),
    'たり': (['… dan … (contoh kegiatan)'], ['動作を例として並べる助詞'], ['doing things like … and …']),
    'です': (['adalah (sopan); kata bantu penutup kalimat'], ['丁寧な断定の助動詞'], ['to be (polite copula)']),
    'ます': (['akhiran kata kerja bentuk sopan'], ['丁寧を表す助動詞'], ['polite verb ending']),
    'だ': (['adalah (bentuk biasa)'], ['断定の助動詞（普通体）'], ['to be (plain copula)']),
    'でした': (['adalah (lampau, sopan)'], ['「です」の過去形'], ['was, were (polite past copula)']),
    'ました': (['akhiran kata kerja sopan bentuk lampau'], ['「ます」の過去形'], ['polite past verb ending']),
    'ません': (['akhiran kata kerja sopan bentuk negatif'], ['「ます」の否定形'], ['polite negative verb ending']),
    'ください': (['tolong …, silakan …'], ['丁寧な依頼を表す'], ['please (do …)']),
}


def load_jlpt():
    """Kosakata JLPT → (jenjang, cara baca). Cara baca JLPT dipakai sebagai cara baca utama (私 → わたし, bukan し)."""
    lv, rd = {}, {}
    for n in (5, 4, 3, 2, 1):
        p = os.path.join(SRC, f'jlpt-n{n}.csv')
        if os.path.exists(p):
            with open(p, encoding='utf-8') as fh:
                for row in csv.DictReader(fh):
                    w = nfc(row['expression'])
                    lv.setdefault(w, f'N{n}')
                    r = (row.get('reading') or '').strip()
                    if r and JA_KANA.match(r):
                        rd.setdefault(w, r)
    return lv, rd


# ── Entri edisi Inggris ─────────────────────────────────────────────────────────────────────────────────────────────────
def gender_of(e):
    for h in e.get('head_templates') or []:
        m = re.match(r'^([mfn])\b', (h.get('args') or {}).get('1', ''))
        if m and h.get('name', '').startswith('de-noun'):
            return m.group(1)
    tags = set()
    for s in e.get('senses') or []:
        tags.update(s.get('tags') or [])
    for g, c in (('masculine', 'm'), ('feminine', 'f'), ('neuter', 'n')):
        if g in tags:
            return c
    return None


def reading_of(e):
    rs = []
    for h in e.get('head_templates') or []:
        for k in ('1', '2', '3', 'kana', 'hira'):
            v = ((h.get('args') or {}).get(k) or '').replace(' ', '')
            if v and JA_KANA.match(v):
                push(rs, v, 3)
    return rs


def form_list(e, lang):
    out, seen = [], set()
    for f in e.get('forms') or []:
        form = (f.get('form') or '').strip()
        raw = set(f.get('tags') or [])
        if not form or form in seen or form.startswith(('-', 'de-', 'no-', 'ja-')) or form == e.get('word'):
            continue
        if raw & {'table-tags', 'inflection-template', 'class', 'auxiliary'}:
            continue
        if lang == 'ja' and 'romanization' in raw and len(form) > 40:
            continue
        seen.add(form)
        out.append([form, ' '.join(t for t in (f.get('tags') or []) if t != 'canonical')[:60]])
        if len(out) >= 80:
            break
    return out


def entry_record(e, lang):
    """Satu baris kaikki → rekaman ringkas (per kelas kata) atau None; plus pemetaan bentuk → lema."""
    w = nfc(e.get('word') or '')
    pos = e.get('pos') or ''
    forms_map = []
    if not w or pos in SKIP_POS or len(w) > 80:
        return None, forms_map
    senses = []
    for s in e.get('senses') or []:
        tags = s.get('tags') or []
        if s.get('form_of') or 'form-of' in tags:
            for fo in s.get('form_of') or []:
                if fo.get('word'):
                    forms_map.append((w, nfc(fo['word'])))
            continue
        g = [x for x in (s.get('glosses') or []) if x]
        if not g or 'no-gloss' in tags:
            continue
        rec = {'g': g[-1][:400]}
        t = [x for x in tags if x in KEEP_TAGS][:4]
        if t:
            rec['t'] = t
        for x in s.get('examples') or []:
            tx = (x.get('text') or '').strip()
            if tx and len(tx) <= 200:
                rec['x'] = [tx, (x.get('english') or x.get('translation') or '')[:240]]
                break
        senses.append(rec)
        if len(senses) >= 24:
            break
    if not senses:
        return None, forms_map
    r = {'w': w, 'p': pos, 's': senses}
    ipa = next((s['ipa'] for s in e.get('sounds') or [] if s.get('ipa')), None)
    if ipa:
        r['ipa'] = ipa
    fl = form_list(e, lang)
    if fl:
        r['f'] = fl
    if lang == 'de' and pos == 'noun':
        g = gender_of(e)
        if g:
            r['g'] = g
        pl = next((f[0] for f in fl if f[1] == 'plural' or f[1].startswith('nominative plural')), None)
        if pl:
            r['pl'] = pl
    if lang == 'ja':
        rd = reading_of(e)
        if rd:
            r['r'] = rd
        ro = [f[0] for f in fl if f[1] == 'romanization']
        if ro:
            r['ro'] = ro[:2]
    syn = [x['word'] for x in (e.get('synonyms') or []) if x.get('word')][:8]
    if syn:
        r['syn'] = syn
    for form, _ in fl:
        if ' ' not in form and len(form) <= 60:
            forms_map.append((form, w))
    if lang == 'ja':
        for rd in r.get('r', []):
            forms_map.append((rd, w))
        for ro in r.get('ro', []):
            forms_map.append((ro.lower(), w))
    return r, forms_map


def sense_rank(sense_text, glosses):
    """Nomor makna (0 = makna pertama) yang paling cocok dengan teks kelompok terjemahan; tak cocok → 20."""
    b = bag(sense_text)
    best, at = 0, 20
    for i, g in enumerate(glosses):
        n = len(b & bag(g))
        if n > best:
            best, at = n, i
    return at


def translations_of(e):
    """
    Tabel terjemahan entri Inggris → [(makna, {id, ja, de})], diurutkan dari kelompok yang paling banyak diterjemahkan
    (semua bahasa) — itulah makna utama; urutan kelompok di sumber bukan urutan makna.
    """
    groups, count, order = {}, {}, []

    def add(key, t):
        code = t.get('lang_code') or t.get('code')
        if not t.get('word'):
            return
        if key not in count:
            count[key] = 0
            order.append(key)
        count[key] += 1
        if code in ('id', 'ja', 'de'):
            push(groups.setdefault(key, {}).setdefault(code, []), nfc(t['word']), 6)

    for s in e.get('senses') or []:
        for t in s.get('translations') or []:
            add(t.get('sense') or (s.get('glosses') or [''])[-1], t)
    for t in e.get('translations') or []:
        add(t.get('sense') or '', t)
    ranked = sorted(order, key=lambda k: -count[k])
    return [(k, groups[k], count[k]) for k in ranked if k in groups]


class Cands:
    """
    Calon arti dengan skor: untuk setiap sumber diambil suara tertinggi (bobot × peluruhan urutan makna), suara dari
    sumber yang berbeda dijumlahkan, lalu ditambah bonus kata umum. Jadi satu sumber tidak bisa „memborong“ suara.
    """

    def __init__(self, common):
        self.common, self.sc, self.order = common, {}, []

    def add(self, word, weight, sense_i=0, src='x'):
        word = nfc(word).strip(' .。;,')
        if not word or len(word) > 40:
            return
        if word not in self.sc:
            self.sc[word] = {}
            self.order.append(word)
        v = weight / (1 + 0.6 * sense_i)
        if v > self.sc[word].get(src, 0.0):
            self.sc[word][src] = v

    def top(self, n):
        """Calon terbaik; calon yang skornya jauh di bawah yang teratas (lemah, hanya satu sumber) dibuang."""
        score = {w: sum(v.values()) + self.common(w) for w, v in self.sc.items()}
        ranked = sorted(self.order, key=lambda w: -score[w])
        if not ranked:
            return []
        floor = max(2.2, 0.4 * score[ranked[0]])
        return [w for i, w in enumerate(ranked[:n]) if i == 0 or score[w] >= floor]


def commonness(rank, jlpt=None):
    """Bonus kata umum: peringkat daftar kekerapan (1 = paling sering) → 0…2,5; kata tak dikenal → −0,4."""
    import math

    def score(w):
        r = rank.get(w) or rank.get(w.lower())
        if r:
            return 2.5 * (1 - math.log(r) / math.log(60000))
        if ' ' in w:
            parts = [rank.get(p) for p in w.lower().split()]
            if all(parts):
                return 0.8 * min(2.5 * (1 - math.log(p) / math.log(60000)) for p in parts)
        if jlpt and w in jlpt:
            return {'N5': 1.8, 'N4': 1.4, 'N3': 1.0, 'N2': 0.7, 'N1': 0.4}[jlpt[w]]
        return -1.2

    def with_jlpt(w):
        base = score(w)
        if jlpt and w in jlpt:
            return max(base, {'N5': 1.8, 'N4': 1.4, 'N3': 1.0, 'N2': 0.7, 'N1': 0.4}[jlpt[w]])
        return base
    return with_jlpt


def load_freq(lang):
    p = os.path.join(SRC, f'freq-{lang}.txt')
    rank = {}
    if os.path.exists(p):
        with open(p, encoding='utf-8') as fh:
            for i, line in enumerate(fh, 1):
                w = line.split(' ', 1)[0].strip()
                if w and w not in rank:
                    rank[nfc(w)] = i
    return rank


class Packer:
    """Baris terurut → bagian ≤ 90 MB berisi blok ±48 KB, plus indeks [kunci pertama, bagian, offset, panjang]."""

    def __init__(self, d, prefix):
        self.d, self.prefix = d, prefix
        self.idx, self.part, self.fh, self.pos = [], -1, None, 0
        self.block_start, self.block_key, self.block_len, self.total = 0, None, 0, 0
        for f in glob.glob(os.path.join(d, f'{prefix}-*.txt')) + glob.glob(os.path.join(d, f'{prefix}.idx.json')):
            os.remove(f)
        self._next_part()

    def _next_part(self):
        if self.fh:
            self.fh.close()
        self.part += 1
        self.fh = open(os.path.join(self.d, f'{self.prefix}-{self.part}.txt'), 'wb')
        self.pos = 0

    def _close_block(self):
        if self.block_key is not None and self.block_len:
            self.idx.append([self.block_key, self.part, self.block_start, self.block_len])
        self.block_key, self.block_len = None, 0

    def add(self, key, value):
        b = f'{key}\t{value}\n'.encode('utf-8')
        if self.block_len and self.block_len + len(b) > BLOCK:
            self._close_block()
            if self.pos >= PART:
                self._next_part()
        if self.block_key is None:
            self.block_key, self.block_start = key, self.pos
        self.fh.write(b)
        self.pos += len(b)
        self.block_len += len(b)
        self.total += len(b)

    def close(self):
        self._close_block()
        self.fh.close()
        with open(os.path.join(self.d, f'{self.prefix}.idx.json'), 'w', encoding='utf-8') as fh:
            json.dump({'parts': self.part + 1, 'blocks': self.idx}, fh, ensure_ascii=False, separators=(',', ':'))


def sort_file(src, dst, unique=False):
    cmd = ['sort', '-t', '\t', '-k1,1', '-k2,2', '-S', '1G', '-T', TMP, '-o', dst, src]
    cmd.insert(1, '-u' if unique else '-s')
    subprocess.run(cmd, check=True, env={**os.environ, 'LC_ALL': 'C'})
    os.remove(src)


class Builder:
    def __init__(self):
        self.wn = WN()
        self.en_tr = {}       # kata Inggris (huruf kecil) → [(jumlah terjemahan, teks makna, {id, ja, de})]
        self.rev = {'id': {}, 'ja': {}, 'en': {}}  # kata arti → [(bahasa, lema)]
        self.stats = {}
        self.aux = None
        self.jlpt = {}
        self.jlpt_read = {}
        self.common = {'id': lambda w: 0.0, 'ja': lambda w: 0.0}
        self.common_src = {}

    def rev_add(self, code, word, score, lang, lemma):
        h = self.rev[code].setdefault(word, [])
        item = (round(score, 3), lang, lemma)
        if len(h) < 24:
            heapq.heappush(h, item)
        elif item > h[0]:
            heapq.heapreplace(h, item)

    def pivot_word(self, hd, ctx, code, cand, weight, i, src):
        """Satu kata Inggris → calon arti: kelompok terjemahan yang paling cocok dan sinset WordNet pertama yang berisi."""
        got = False
        groups = [x for x in self.en_tr.get(hd, []) if x[2].get(code)]
        if groups:
            groups = sorted(groups, key=lambda x: (-len(ctx & bag(x[1])), -x[0]))
            for x in groups[0][2][code][:3]:
                cand.add(x, weight, i, src + 't')
            got = True
        for syn in self.wn.best(hd, ctx)[:3]:
            lem = self.wn.syn[code].get(syn, [])
            if lem:
                for x in lem[:16]:
                    cand.add(x, weight, i, src + 'w')
                got = True
                break
        return got

    def pivot(self, glosses, code, cand):
        """Calon arti lewat bahasa Inggris untuk setiap glos; „dining table“ tanpa hasil → kata intinya „table“."""
        for i, g in enumerate(glosses[:8]):
            for hd in heads(g):
                ctx = bag(g) - bag(hd)
                if not self.pivot_word(hd, ctx, code, cand, 2.0, i, 'p') and ' ' in hd:
                    self.pivot_word(hd.split()[-1], ctx, code, cand, 1.6, i, 'p')

    def stream_edition(self, lang):
        """Tulis rekaman entri & bentuk ke berkas sementara (diurutkan dengan `sort` — hemat memori)."""
        n = 0
        with open(os.path.join(TMP, f'{lang}.e'), 'w', encoding='utf-8') as ef, open(os.path.join(TMP, f'{lang}.f'), 'w', encoding='utf-8') as ff:
            for e in jsonl(EDITION_FILE[lang]):
                if e.get('lang_code') != lang:
                    continue
                tr = translations_of(e) if lang == 'en' else None
                if tr:
                    self.en_tr.setdefault(keyof(e['word']), []).extend((cnt, sx, m) for sx, m, cnt in tr[:14])
                r, fm = entry_record(e, lang)
                for form, lemma in fm:
                    k = keyof(form)
                    if k and k != keyof(lemma):
                        ff.write(f'{k}\t{lemma}\n')
                if r:
                    if tr:
                        r['tr'] = [[cnt, sx[:80], m] for sx, m, cnt in tr[:10]]
                    r['pp'] = len(e.get('senses') or []) + sum(x[2] for x in tr or []) / 8
                    ef.write(f"{keyof(r['w'])}\t{r['w']}\t{json.dumps(r, ensure_ascii=False, separators=(',', ':'))}\n")
                    n += 1
        log(lang, 'rekaman Wiktionary', n)

    def extra_entries(self, lang, known):
        """Lema yang tidak ada di Wiktionary bahasa Inggris tetapi ada di sumber lain (Wiktionary Jerman, WordNet)."""
        dew = self.aux[3]
        n = 0
        with open(os.path.join(TMP, f'{lang}.e'), 'a', encoding='utf-8') as ef:
            def put(w, r):
                nonlocal n
                ef.write(f"{keyof(w)}\t{w}\t{json.dumps(r, ensure_ascii=False, separators=(',', ':'))}\n")
                n += 1
            if lang == 'de':
                for w, v in dew.items():
                    if w not in known and ' ' not in w and len(w) <= 60 and (v['t'].get('en') or v['t'].get('id') or v['t'].get('ja')):
                        put(w, {'w': w, 'p': (v['p'] or ['noun'])[0], 's': [], 'x': 1})
            if lang in ('id', 'ja'):
                for w, syns in self.wn.rev[lang].items():
                    if w not in known and len(w) <= 60:
                        put(w, {'w': w, 'p': {'n': 'noun', 'v': 'verb', 'a': 'adj', 'r': 'adv'}[syns[0][-1]], 's': [], 'x': 1})
        log(lang, 'lema tambahan', n)

    def meanings(self, lang, w, recs):
        """
        Arti singkat per bahasa antarmuka (id, ja, en) untuk satu lema. Semua calon dari semua sumber dikumpulkan lalu
        diberi skor: banyaknya sumber yang setuju, urutan makna (makna pertama lebih berat) dan seberapa umum kata itu
        (daftar kekerapan kata; untuk Jepang juga jenjang JLPT). Definisi dari Wiktionary berbahasa antarmuka itu sendiri
        selalu didahulukan.
        """
        jaw, idw, ja_tr, dew = self.aux
        glosses = [s['g'] for r in recs for s in r['s']]
        m = {'en': []}
        for g in glosses:
            push(m['en'], short(g), 6)
        cid, cja = Cands(self.common['id']), Cands(self.common['ja'])
        if lang == 'en':
            groups = sorted((g for r in recs for g in r.get('tr', [])), key=lambda g: -g[0])
            for at, (_, _, t) in enumerate(groups[:10]):
                for x in t.get('id', [])[:3]:
                    cid.add(x, 3.0, at, 'tr')
                for x in t.get('ja', [])[:3]:
                    cja.add(x, 3.0, at, 'tr')
            lw = w.lower()
            ctx = bag(' '.join(glosses[:2]))
            for i, syn in enumerate(self.wn.en.get(lw, [])[:5]):
                for x in self.wn.syn['id'].get(syn, [])[:16]:
                    cid.add(x, 2.5, i, 'wn')
                for x in self.wn.syn['ja'].get(syn, [])[:16]:
                    cja.add(x, 2.5, i, 'wn')
        if lang == 'de':
            dv = dew.get(w)
            if dv:
                for i, x in enumerate(dv['t'].get('id', [])):
                    cid.add(x, 3.0, i // 2, 'de')
                for i, x in enumerate(dv['t'].get('ja', [])):
                    cja.add(x, 3.0, i // 2, 'de')
                if not m['en']:
                    for x in dv['t'].get('en', []):
                        push(m['en'], x, 6)
                # terjemahan Inggris langsung dari Wiktionary Jerman = poros yang kuat
                for i, x in enumerate(dv['t'].get('en', [])[:4]):
                    for code, cand in (('id', cid), ('ja', cja)):
                        self.pivot_word(x.lower(), set(), code, cand, 2.5, i, 'd')
        if lang == 'ja':
            for i, x in enumerate(ja_tr.get(w, {}).get('id', [])):
                cid.add(x, 3.0, i // 2, 'jt')
            heads_en = {h for g in glosses for h in heads(g)}
            syns = self.wn.rev['ja'].get(w, [])
            good = [s for s in syns if heads_en & {x.lower() for x in self.wn.syn_en.get(s, ([], ''))[0]}] or syns[:2]
            for i, s in enumerate(good[:3]):
                for x in self.wn.syn['id'].get(s, [])[:16]:
                    cid.add(x, 2.5, i, 'wn')
                if not glosses:
                    for x in self.wn.syn_en.get(s, ([], ''))[0][:2]:
                        push(m['en'], x, 6)
        if lang == 'id':
            for i, s in enumerate(self.wn.rev['id'].get(w, [])[:3]):
                if not glosses:
                    for x in self.wn.syn_en.get(s, ([], ''))[0][:2]:
                        push(m['en'], x, 6)
                for x in self.wn.syn['ja'].get(s, [])[:16]:
                    cja.add(x, 2.5, i, 'wn')
        src_gl = m['en'] or glosses
        if lang != 'id':
            self.pivot(src_gl, 'id', cid)
        if lang != 'ja':
            self.pivot(src_gl, 'ja', cja)
        own_ja, own_id = jaw.get((lang, w), []), idw.get((lang, w), [])
        if lang != 'id':
            for i, x in enumerate(own_id[:4]):
                if len(x) <= 40:
                    cid.add(x, 3.5, i, 'own')
        m['id'] = [short(x, 60) for x in own_id[:2]] if lang == 'id' else []
        for x in cid.top(6):
            push(m['id'], x, 6)
        m['ja'] = [short(x, 60) for x in own_ja[:2]]
        for x in cja.top(6):
            push(m['ja'], x, 6)
        return {k: v for k, v in m.items() if v}

    def merge(self, lang, key, words):
        jaw, idw, ja_tr, dew = self.aux
        arr = []
        for w, recs in words:
            recs = [r for r in recs if not r.get('x')] or recs
            recs = sorted(recs, key=lambda r: -r.get('pp', len(r['s'])))
            ent = {'w': w}
            for k in ('ipa', 'g', 'pl'):
                v = next((r[k] for r in recs if r.get(k)), None)
                if v:
                    ent[k] = v
            rd, ro, syn = [], [], []
            for r in recs:
                for x in r.get('r', []):
                    push(rd, x, 3)
                for x in r.get('ro', []):
                    push(ro, x, 3)
                for x in r.get('syn', []):
                    push(syn, x, 10)
            if lang == 'ja' and self.jlpt_read.get(w) and self.jlpt_read[w] != w:
                rd = [self.jlpt_read[w]] + [x for x in rd if x != self.jlpt_read[w]][:2]
            if rd:
                ent['r'] = rd
            if ro:
                ent['ro'] = ro
            blocks = {}
            for r in recs:
                b = blocks.setdefault(r['p'], {'p': r['p'], 's': []})
                b['s'].extend(r['s'][: max(0, 30 - len(b['s']))])
                if r.get('f') and 'f' not in b:
                    b['f'] = r['f']
            ent['b'] = list(blocks.values())
            if syn:
                ent['syn'] = syn
            m = self.meanings(lang, w, recs)
            if lang == 'ja' and w in JA_GRAMMAR:
                gid, gja, gen = JA_GRAMMAR[w]
                m = {'id': gid + [x for x in m.get('id', []) if x not in gid][:0], 'ja': gja, 'en': gen + m.get('en', [])[:2]}
            if m:
                ent['m'] = m
            if lang == 'de' and w in dew and dew[w]['d']:
                ent['d'] = dew[w]['d']
            if lang == 'ja':
                defs = [d for d in (self.wn.defs['ja'].get(s) for s in self.wn.rev['ja'].get(w, [])[:3]) if d]
                if jaw.get(('ja', w)) or defs:
                    ent['jd'] = (jaw.get(('ja', w)) or defs)[:6]
                if self.jlpt.get(w):
                    ent['lv'] = self.jlpt[w]
            if lang == 'id':
                defs = [d for d in (self.wn.defs['id'].get(s) for s in self.wn.rev['id'].get(w, [])[:3]) if d]
                if idw.get(('id', w)) or defs:
                    ent['idd'] = (idw.get(('id', w)) or defs)[:6]
            if lang in ('id', 'ja', 'en'):
                to = {}
                for _, L2, lemma in sorted(self.rev[lang].get(w if lang != 'en' else w.lower(), []), reverse=True):
                    push(to.setdefault(L2, []), lemma, 12)
                if to:
                    ent['to'] = to
            # arah balik (kata Indonesia/Jepang/Inggris → lema ini) untuk bahasa yang diproses sesudahnya; per kata arti
            # disimpan 24 lema terbaik: kata arti itu muncul paling depan dan lemanya kata yang umum
            pop = self.common_src.get(lang, lambda x: 0.0)(w) - 1.5 * max(0, len(w.split()) - 1)
            if lang in ('de', 'en', 'ja'):
                for pos, x in enumerate((m.get('id') or [])[:4]):
                    if len(x) <= 30:
                        self.rev_add('id', x, 3 - pos + pop, lang, w)
            if lang in ('de', 'en'):
                for pos, x in enumerate((m.get('ja') or [])[:4]):
                    if len(x) <= 20:
                        self.rev_add('ja', x, 3 - pos + pop, lang, w)
            if lang == 'de':
                for pos, x in enumerate((m.get('en') or [])[:4]):
                    for hd in heads(x)[:1]:
                        self.rev_add('en', hd, 3 - pos + pop, lang, w)
            if not any(b['s'] for b in ent['b']) and not (ent.get('m') or ent.get('d') or ent.get('jd') or ent.get('idd')):
                continue
            if not any(b['s'] for b in ent['b']):
                ent['b'] = [{'p': ent['b'][0]['p'], 's': []}]
            arr.append(ent)
        return arr

    def finish(self, lang):
        """Urutkan, gabungkan rekaman per kata, hitung arti, tulis bagian & indeks."""
        src = os.path.join(TMP, f'{lang}.e')
        sort_file(src, src + '.s')
        out_dir = os.path.join(OUT, lang)
        os.makedirs(out_dir, exist_ok=True)
        pk = Packer(out_dir, 'e')
        st = {'entries': 0, 'id': 0, 'ja': 0, 'en': 0}

        def flush(key, words):
            arr = self.merge(lang, key, words)
            for ent in arr:
                st['entries'] += 1
                for code in ('id', 'ja', 'en'):
                    if (ent.get('m') or {}).get(code):
                        st[code] += 1
            if arr:
                pk.add(key, json.dumps(arr, ensure_ascii=False, separators=(',', ':')))

        cur_key, cur_word, words = None, None, []
        with open(src + '.s', encoding='utf-8') as fh:
            for line in fh:
                k, w, js = line.rstrip('\n').split('\t', 2)
                if k != cur_key:
                    if cur_key is not None:
                        flush(cur_key, words)
                    cur_key, cur_word, words = k, None, []
                if w != cur_word:
                    words.append((w, []))
                    cur_word = w
                words[-1][1].append(json.loads(js))
        if cur_key is not None:
            flush(cur_key, words)
        pk.close()
        os.remove(src + '.s')
        # bentuk → lema
        fsrc = os.path.join(TMP, f'{lang}.f')
        sort_file(fsrc, fsrc + '.s', unique=True)
        fp = Packer(out_dir, 'f')
        nf, cur, lem = 0, None, []
        with open(fsrc + '.s', encoding='utf-8') as fh:
            for line in fh:
                k, w = line.rstrip('\n').split('\t', 1)
                if k != cur:
                    if cur is not None and lem:
                        fp.add(cur, json.dumps(lem, ensure_ascii=False, separators=(',', ':')))
                        nf += 1
                    cur, lem = k, []
                push(lem, w, 6)
        if cur is not None and lem:
            fp.add(cur, json.dumps(lem, ensure_ascii=False, separators=(',', ':')))
            nf += 1
        fp.close()
        os.remove(fsrc + '.s')
        st['forms'] = nf
        st['bytes'] = pk.total + fp.total
        self.stats[lang] = st
        log(lang, 'selesai', st)

    def run(self):
        os.makedirs(TMP, exist_ok=True)
        self.wn.load()
        self.aux = load_aux()
        self.jlpt, self.jlpt_read = load_jlpt()
        self.common = {'id': commonness(load_freq('id')), 'ja': commonness(load_freq('ja'), self.jlpt)}
        self.common_src = {'de': commonness(load_freq('de')), 'en': commonness(load_freq('en')), 'ja': self.common['ja']}
        log('jlpt', len(self.jlpt))
        for lang in LANGS:
            self.stream_edition(lang)
        for lang in ('de', 'ja', 'id'):
            known = set()
            with open(os.path.join(TMP, f'{lang}.e'), encoding='utf-8') as fh:
                for line in fh:
                    known.add(line.split('\t', 2)[1])
            self.extra_entries(lang, known)
        # urutan penting: arah balik Indonesia/Jepang/Inggris dikumpulkan dari bahasa sebelumnya
        for lang in ('de', 'en', 'ja', 'id'):
            self.finish(lang)
        os.rmdir(TMP)
        meta = {
            'built': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'langs': self.stats,
            'sources': [
                {'name': 'Wiktionary (en, de, ja, id)', 'licence': 'CC BY-SA 4.0', 'url': 'https://www.wiktionary.org/'},
                {'name': 'Princeton WordNet 3.0', 'licence': 'WordNet 3.0 License', 'url': 'https://wordnet.princeton.edu/'},
                {'name': 'Wordnet Bahasa', 'licence': 'MIT', 'url': 'https://wn-msa.sourceforge.net/'},
                {'name': 'Japanese WordNet (NICT)', 'licence': 'Japanese WordNet License', 'url': 'https://bond-lab.github.io/wnja/'},
                {'name': 'JLPT vocabulary lists (Jonathan Waller)', 'licence': 'CC BY', 'url': 'https://github.com/jamsinclair/open-anki-jlpt-decks'},
            {'name': 'FrequencyWords (Hermit Dave) — word ranking', 'licence': 'CC BY-SA 4.0', 'url': 'https://github.com/hermitdave/FrequencyWords'},
            ],
        }
        with open(os.path.join(OUT, 'meta.json'), 'w', encoding='utf-8') as fh:
            json.dump(meta, fh, ensure_ascii=False, indent=1)
        log('selesai', json.dumps(self.stats))


if __name__ == '__main__':
    SRC = os.path.abspath(sys.argv[1])
    OUT = os.path.abspath(sys.argv[2])
    TMP = os.path.join(OUT, '_tmp')
    Builder().run()
