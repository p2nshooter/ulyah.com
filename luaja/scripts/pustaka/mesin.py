#!/usr/bin/env python3
"""
Mesin terjemah LUAJA — seluruh isi buku pustaka diterjemahkan ke bahasa antarmuka dan ditampilkan langsung di bawah tiap
paragraf (pemilik, 17 Nov 2026: „Harusnya seluruh buku langsung di terjemahin di bawahnya“; perintah 22: „mesin terjemah
gratis di GitHub Actions … jalan otomatis 01.00, mutu baik, tanpa kuota Claude“).

Model: MADLAD-400 3B MT (Google, Apache-2.0) dalam format CTranslate2 int8 — berjalan di CPU runner GitHub Actions, gratis,
tanpa layanan berbayar, menerjemahkan langsung ja/de/en → id (tanpa poros bahasa Inggris).

Butir (kunci = "<halaman>.<blok>[.<bagian>]", sama persis dengan public/assets/pustaka.js):
  p, tip, h, sen  teks blok                                   → "<h>.<b>"
  ex              arti contoh (Inggris)                       → ".g"
  voc             arti kosakata (Inggris)                     → ".i<n>"
  tbl             sel berbahasa Inggris (terjemah.en_cell)    → ".r<n>.<j>"
  kj              arti kanji, arti contoh kata                → ".m", ".x<n>"
  mc              soal & pilihan berbahasa Inggris            → ".q", ".o<n>"
Terjemahan manusia yang sudah ada (t_id, g_id, q_id, o_id, kalimat Tatoeba berbahasa Indonesia) tidak diterjemahkan ulang.

Keluaran per potongan halaman (rumus potongan sama dengan src/library/index.ts mtChunkOf):
  <keluar>/<bahasa>/<buku>/<potongan>.json
  {"v":1,"m":"madlad400-3b","l":"id","b":"<buku>","c":<potongan>,"u":{"<kunci>":["<fnv sumber>","<terjemahan>"]}}
Pembaca hanya memakai terjemahan yang hash FNV-1a sumbernya sama dengan teks di buku.

Perintah (dipakai .github/workflows/terjemah-luaja.yml):
  rencana <luaja> <bahasa> <pecahan> <status.json> [buku,…]      → matrix JSON (hanya pecahan yang punya pekerjaan)
  tugas   <luaja> <bahasa> <i>/<n> <status.json> [buku,…]        → kunci R2 potongan milik pecahan ini (untuk unduh hasil lama)
  jalan   <luaja> <bahasa> <i>/<n> <status.json> <lama> <keluar> <menit> [buku,…]
  gabung  <status lama> <folder laporan> <status baru>
"""
import glob
import json
import os
import re
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import terjemah  # noqa: E402  (pemilah sel Inggris/Jerman yang sama dengan terjemahan manusia)

PREVIEW, CHUNK = 3, 25
MODEL_NAME = 'madlad400-3b'
RUBY = re.compile(r'｜([^《｜]+)《[^》]+》')
NOMOR_SAJA = re.compile(r'^[\s一二三四五六七八九十百千〇零0-9０-９IVXLCivxlc.、。()（）第章節部回話「」—–-]+$')
RUBY_LOOSE = re.compile(r'《[^》]*》')
# urutan pengerjaan: buku Jepang (sastra yang sedang dibaca pemilik), bahan kursus Jerman, kanji & kosakata, novel, sisanya
PRIORITAS = [r'^ja-aozora', r'^de-(dib|dva|gg)', r'^ja-(kanji|jlpt)', r'^de-pg', r'^en-pg', r'.']


def chunk_of(page):
    return 0 if page < PREVIEW else 1 + (page - PREVIEW) // CHUNK


def fnv(text):
    """FNV-1a 32-bit atas byte UTF-8 (sama dengan fnv() di pustaka.js)."""
    h = 0x811c9dc5
    for b in text.encode('utf-8'):
        h ^= b
        h = (h * 0x01000193) & 0xffffffff
    return f'{h:08x}'


def prioritas(book_id):
    return next(i for i, p in enumerate(PRIORITAS) if re.search(p, book_id))


def units(doc, tgt):
    """(kunci, teks sumber persis seperti di buku, bahasa sumber) yang perlu diterjemahkan ke `tgt`."""
    lang = doc['lang']
    for pi, pg in enumerate(doc['pages']):
        for bi, b in enumerate(pg['b']):
            k, key = b['k'], f'{pi}.{bi}'
            if k in ('p', 'tip'):
                src = b.get('l') or lang
                if src != tgt and b.get('t') and not (tgt == 'id' and b.get('t_id')):
                    yield key, b['t'], src
            elif k == 'h':
                if b.get('t') and not (tgt == 'id' and b.get('t_id')):
                    src = 'en' if terjemah.english(b['t']) else lang
                    # judul yang hanya nomor (一, 第三章, 12, IV) tidak perlu diterjemahkan
                    if src != tgt and re.search(r'[^\W\d_]', b['t']) and not NOMOR_SAJA.match(b['t']):
                        yield key, b['t'], src
            elif k == 'sen':
                if tgt != 'id' and lang != tgt and b.get('t'):
                    yield key, b['t'], lang
            elif tgt == 'en':
                continue  # arti di bawah ini sudah berbahasa Inggris
            elif k == 'ex':
                if b.get('g') and not (tgt == 'id' and b.get('g_id')):
                    yield key + '.g', b['g'], 'en'
            elif k == 'voc':
                # buku Jepang & Inggris: kolom arti selalu Inggris; buku Jerman: dipilah (ada kolom Jerman)
                for n, it in enumerate(b['i']):
                    if len(it) > 1 and it[1] and re.search(r'[A-Za-z]', it[1]) and (lang != 'de' or terjemah.en_cell(it[1], 1)):
                        yield f'{key}.i{n}', it[1], 'en'
            elif k == 'tbl':
                for n, r in enumerate(b['r']):
                    for j, c in enumerate(r):
                        if not c or (j == 0 and (lang == 'ja' or len(r) < 2)):
                            continue
                        lain = r[1] if j == 0 else r[0]
                        if c.strip().lower() == lain.strip().lower():
                            continue
                        if j == 0:
                            judul = n == 0 and all(terjemah.en_cell(x, 2) for x in r[1:] if x) and terjemah.skor_en(c) > 0
                            if not (terjemah.en_cell(c, 0) or terjemah.label_en(c) or judul):
                                continue
                        elif lang == 'de' and not terjemah.en_cell(c, min(j, 2)):
                            continue
                        elif lang != 'de' and not re.search(r'[A-Za-z]', c):
                            continue
                        yield f'{key}.r{n}.{j}', c, 'en'
            elif k == 'kj':
                if b.get('m'):
                    yield key + '.m', b['m'], 'en'
                for n, x in enumerate(b.get('ex') or []):
                    if len(x) > 2 and x[2]:
                        yield f'{key}.x{n}', x[2], 'en'
            elif k == 'mc':
                if b.get('q') and terjemah.english(b['q']) and not (tgt == 'id' and b.get('q_id')):
                    yield key + '.q', b['q'], 'en'
                opts = b.get('o') or []
                if opts and not (tgt == 'id' and b.get('o_id')) and all(terjemah.en_cell(o, 1) for o in opts):
                    for n, o in enumerate(opts):
                        yield f'{key}.o{n}', o, 'en'


def load_books(root, only=None):
    files = sorted(glob.glob(os.path.join(root, 'public', 'p', 'b', '*.json')))
    out = []
    for f in files:
        bid = os.path.basename(f)[:-5]
        if only and bid not in only:
            continue
        out.append((bid, f))
    out.sort(key=lambda x: (prioritas(x[0]), x[0]))
    return out


def chunks_of(root, tgt, only=None):
    """{(buku, potongan): {'sig': tanda sumber, 'units': [(kunci, teks, bahasa)], 'chars': n}}"""
    res = {}
    for bid, f in load_books(root, only):
        doc = json.load(open(f, encoding='utf-8'))
        if doc['lang'] == tgt:
            continue
        per = {}
        for key, text, src in units(doc, tgt):
            per.setdefault(chunk_of(int(key.split('.')[0])), []).append((key, text, src))
        for c, us in per.items():
            sig = fnv('\n'.join(f'{k}:{fnv(t)}' for k, t, _ in us))
            res[(bid, c)] = {'sig': sig, 'units': us, 'chars': sum(len(t) for _, t, _ in us)}
    return res


def load_status(path):
    try:
        return json.load(open(path, encoding='utf-8'))
    except (OSError, ValueError):
        return {}


def plan(root, tgt, n, status_path, only=None):
    """Bagi potongan yang belum selesai ke n pecahan (urut prioritas, beban huruf seimbang). Deterministik."""
    status = load_status(status_path).get('chunks', {})
    todo = []
    for (bid, c), ch in chunks_of(root, tgt, only).items():
        st = status.get(f'{bid}/{c}')
        if st and st.get('sig') == ch['sig'] and st.get('done', 0) >= len(ch['units']):
            continue
        sisa = max(1, ch['chars'] - int(st.get('chars_done', 0)) if st and st.get('sig') == ch['sig'] else ch['chars'])
        todo.append((prioritas(bid), bid, c, sisa))
    todo.sort()
    bins = [[0, []] for _ in range(n)]
    for _, bid, c, w in todo:
        b = min(bins, key=lambda x: x[0])
        b[0] += w
        b[1].append((bid, c))
    return [b[1] for b in bins]


ABBR = re.compile(r'(?:^|[\s(])(?:[A-ZÄÖÜ]|Dr|Mr|Mrs|Ms|Mt|St|Prof|Nr|Hr|Fr|Frl|Jr|Sr|vs|No|Abs|Kap|Bd|Jh|bzw|ca|vgl|usw|etc|evtl|'
                  r'z\.\s?B|d\.\s?h|u\.\s?a|o\.\s?ä|i\.\s?e|e\.\s?g)\.$')


def split_sentences(text, lang):
    """Kalimat-kalimat (dengan pemisahnya) agar masukan model tidak terlalu panjang; digabung lagi sesudah diterjemahkan."""
    if lang == 'ja':
        parts = re.split(r'(?<=[。！？!?])|\n+', text)
        limit, soft = 160, r'(?<=、)'
    else:
        parts = re.split(r'(?<=[.!?…:;])\s+(?=[„“"»«‚‘\'(\[A-ZÄÖÜ0-9¿¡—–-])|\n+', text)
        limit, soft = 420, r'(?<=[,;])\s+'
    # „Dr.“, „Mr.“, „z.B.“, inisial „J.“: bukan akhir kalimat — gabungkan lagi dengan potongan berikutnya
    merged = []
    for p in parts:
        p = (p or '').strip()
        if merged and ABBR.search(merged[-1]):
            merged[-1] = f'{merged[-1]} {p}'.strip()
        elif p:
            merged.append(p)
    out = []
    for p in merged:
        while len(p) > limit:
            pieces = re.split(soft, p)
            if len(pieces) < 2:
                out.append(p[:limit])
                p = p[limit:]
                continue
            acc = ''
            for piece in pieces:
                if acc and len(acc) + len(piece) > limit:
                    out.append(acc.strip())
                    acc = ''
                acc += piece + ('' if lang == 'ja' else ' ')
            p = acc.strip()
            if len(p) > limit and len(pieces) >= 2 and len(pieces[-1]) >= len(p):
                out.append(p[:limit])
                p = p[limit:]
        if p:
            out.append(p)
    return out


def clean_source(text, lang):
    t = RUBY.sub(r'\1', text)
    if lang == 'ja':
        t = RUBY_LOOSE.sub('', t)
    return re.sub(r'[ \t]+', ' ', t).strip()


class Mesin:
    """MADLAD-400 3B (CTranslate2) — satu proses, semua inti CPU."""

    def __init__(self, model_dir, tokenizer):
        import ctranslate2
        from transformers import AutoTokenizer
        self.tr = ctranslate2.Translator(model_dir, device='cpu', compute_type='int8', inter_threads=1, intra_threads=os.cpu_count() or 4)
        self.tok = AutoTokenizer.from_pretrained(tokenizer)
        self.n_tok = 0

    def translate(self, sents, tgt, batch=16):
        if not sents:
            return []
        enc = [self.tok.convert_ids_to_tokens(self.tok.encode(f'<2{tgt}> {s}')) for s in sents]
        order = sorted(range(len(enc)), key=lambda i: len(enc[i]))
        out = [''] * len(enc)
        for i in range(0, len(order), batch):
            idx = order[i:i + batch]
            longest = max(len(enc[j]) for j in idx)
            # arti pendek: beam 2 (murah, lebih tepat); kalimat panjang: greedy agar seluruh buku selesai dalam waktu wajar
            res = self.tr.translate_batch([enc[j] for j in idx], beam_size=2 if longest < 24 else 1, max_batch_size=batch,
                                          max_decoding_length=min(512, int(longest * 2.2) + 24), repetition_penalty=1.08)
            for j, r in zip(idx, res):
                toks = r.hypotheses[0]
                self.n_tok += len(toks)
                out[j] = self.tok.decode(self.tok.convert_tokens_to_ids(toks), skip_special_tokens=True).strip()
        return out


TITLE_LIST = re.compile(r"^[A-Z][\w'-]*(?:[ -][A-Za-z(][\w'()-]*)*(?:,\s*[A-Z(~-][\w'() -]*)*,?\s*$")


NAMA_DIRI = set('Jepang Cina Tiongkok Korea Asia Eropa Amerika Afrika India Buddha Tuhan Allah Shinto Tokyo Kyoto Osaka Edo '
                'Belanda Inggris Jerman Prancis Indonesia Konfusius Zen Kristen Islam Han Tang Ming Qing Meiji'.split())


def tidy(key, src, out):
    """Arti kanji ditulis seperti kamus Indonesia (huruf kecil, dipisah koma), bukan Huruf Besar Tiap Kata."""
    if re.search(r'\.(m|o\d+)$', key) and TITLE_LIST.match(src):
        def low(w):
            return w if w in NAMA_DIRI or (len(w) > 1 and w.isupper()) else w.lower()
        out = ', '.join(' '.join(low(w) for w in x.split()) for x in out.split(',') if x.strip())
    return out


def good(src, out):
    if not out or out == src:
        return False
    ratio = len(out) / max(1, len(src))
    return 0.15 < ratio < 6


def run(root, tgt, part, status_path, old_dir, out_dir, minutes, only=None, model_dir=None, tokenizer=None):
    i, n = (int(x) for x in part.split('/'))
    mine = plan(root, tgt, n, status_path, only)[i]
    if not mine:
        print('tidak ada pekerjaan untuk pecahan ini')
        return
    all_chunks = chunks_of(root, tgt, {b for b, _ in mine})
    deadline = time.time() + minutes * 60
    mesin = Mesin(model_dir, tokenizer)
    report = {}
    t0 = time.time()
    total_chars = 0
    for bid, c in mine:
        ch = all_chunks.get((bid, c))
        if not ch:
            continue
        old_path = os.path.join(old_dir, tgt, bid, f'{c}.json')
        old = {}
        if os.path.exists(old_path):
            try:
                old = json.load(open(old_path, encoding='utf-8')).get('u', {})
            except ValueError:
                old = {}
        keep, todo = {}, []
        for key, text, src in ch['units']:
            h = fnv(text)
            if key in old and old[key][0] == h:
                keep[key] = old[key]
            else:
                todo.append((key, text, src, h))
        # kalimat-kalimat semua butir dalam potongan ini, dikelompokkan per bahasa sumber; arti pendek tidak dipotong
        if todo and time.time() < deadline:
            for src in sorted({u[2] for u in todo}):
                group = [u for u in todo if u[2] == src]
                pieces, owners = [], []
                for gi, (key, text, _, _) in enumerate(group):
                    clean = clean_source(text, src)
                    sents = [clean] if len(clean) <= 90 and '\n' not in clean else split_sentences(clean, src)
                    for s in sents:
                        pieces.append(s)
                        owners.append(gi)
                done_pieces = []
                for s in range(0, len(pieces), 64):
                    if time.time() > deadline:
                        break
                    done_pieces += mesin.translate(pieces[s:s + 64], tgt)
                joined = {}
                for gi, piece in zip(owners, done_pieces):
                    joined.setdefault(gi, []).append(piece)
                complete = {gi for gi in joined if len(joined[gi]) == owners.count(gi)}
                for gi in complete:
                    key, text, _, h = group[gi]
                    sep = '' if tgt == 'ja' else ' '
                    out = tidy(key, text, sep.join(joined[gi]).strip())
                    if good(clean_source(text, src), out):
                        keep[key] = [h, out]
                        total_chars += len(text)
        if keep:
            path = os.path.join(out_dir, tgt, bid, f'{c}.json')
            os.makedirs(os.path.dirname(path), exist_ok=True)
            ordered = {k: keep[k] for k, _, _ in ch['units'] if k in keep}
            json.dump({'v': 1, 'm': MODEL_NAME, 'l': tgt, 'b': bid, 'c': c, 'u': ordered}, open(path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        done_chars = sum(len(t) for k, t, _ in ch['units'] if k in keep)
        report[f'{bid}/{c}'] = {'sig': ch['sig'], 'total': len(ch['units']), 'done': len(keep), 'chars': ch['chars'], 'chars_done': done_chars}
        el = time.time() - t0
        print(f'{bid} #{c}: {len(keep)}/{len(ch["units"])} butir · {total_chars:,} huruf baru · {mesin.n_tok / max(1, el):.1f} token/dtk', flush=True)
        if time.time() > deadline:
            print('batas waktu tercapai — sisa dikerjakan pada jalan berikutnya')
            break
    os.makedirs(out_dir, exist_ok=True)
    json.dump(report, open(os.path.join(out_dir, f'laporan-{i}.json'), 'w', encoding='utf-8'), ensure_ascii=False)


def merge(status_in, report_dir, status_out):
    st = load_status(status_in)
    chunks = st.get('chunks', {})
    for f in sorted(glob.glob(os.path.join(report_dir, '**', 'laporan-*.json'), recursive=True)):
        for k, v in json.load(open(f, encoding='utf-8')).items():
            chunks[k] = v
    st.update({'v': 1, 'm': MODEL_NAME, 'updated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'chunks': chunks})
    tot = sum(v['total'] for v in chunks.values())
    done = sum(min(v['done'], v['total']) for v in chunks.values())
    st['progress'] = {'units': tot, 'done': done}
    json.dump(st, open(status_out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f'{done:,}/{tot:,} butir selesai ({100 * done / max(1, tot):.1f}%)')


def main(argv):
    cmd = argv[1]
    if cmd == 'rencana':
        root, tgt, n, status = argv[2], argv[3], int(argv[4]), argv[5]
        only = set(argv[6].split(',')) if len(argv) > 6 and argv[6] else None
        bins = plan(root, tgt, n, status, only)
        work = [i for i, b in enumerate(bins) if b]
        print(json.dumps({'include': [{'pecahan': f'{i}/{n}'} for i in work]}))
    elif cmd == 'tugas':
        root, tgt, part, status = argv[2], argv[3], argv[4], argv[5]
        only = set(argv[6].split(',')) if len(argv) > 6 and argv[6] else None
        i, n = (int(x) for x in part.split('/'))
        for bid, c in plan(root, tgt, n, status, only)[i]:
            print(f'pustaka/terjemah/{tgt}/{bid}/{c}.json')
    elif cmd == 'jalan':
        root, tgt, part, status, old, out, minutes = argv[2], argv[3], argv[4], argv[5], argv[6], argv[7], float(argv[8])
        only = set(argv[9].split(',')) if len(argv) > 9 and argv[9] else None
        run(root, tgt, part, status, old, out, minutes, only, os.environ['MESIN_MODEL'], os.environ.get('MESIN_TOKENIZER', 'google/madlad400-3b-mt'))
    elif cmd == 'gabung':
        merge(argv[2], argv[3], argv[4])
    else:
        raise SystemExit(__doc__)


if __name__ == '__main__':
    main(sys.argv)
