#!/usr/bin/env python3
"""
Pembangkit soal kosakata JLPT (漢字読み · 表記 · 文脈規定) untuk simulasi penuh LUAJA.

Bahan (berlisensi terbuka, sama dengan pustaka): daftar kosakata JLPT (Jonathan Waller, CC BY; arti JMdict CC BY-SA 4.0,
disusun open-anki-jlpt-decks), KANJIDIC2 (kanji-data), kalimat Tatoeba Jepang ↔ Indonesia (CC BY 2.0 FR).
Setiap soal memakai kalimat asli Tatoeba yang memuat kata sasaran; pengecoh dibuat dengan pola kesalahan yang memang diuji
JLPT (dakuten, vokal panjang, っ kecil, ゃゅょ, kanji sebunyi). Pembahasan memuat arti kata dan terjemahan Indonesia kalimatnya.

Pemakaian: python3 -I scripts/exam/jlpt_vocab.py <folder luaja> <folder cache pustaka>
Keluaran: src/exam/gen/jlpt-vocab.json
"""
import csv
import hashlib
import importlib.util
import io
import json
import os
import re
import sys

ROOT = os.path.abspath(sys.argv[1])
CACHE = os.path.abspath(sys.argv[2])
spec = importlib.util.spec_from_file_location('pustaka_build', os.path.join(ROOT, 'scripts', 'pustaka', 'build.py'))
pb = importlib.util.module_from_spec(spec)
sys.argv = [sys.argv[0], ROOT, CACHE]
spec.loader.exec_module(pb)

KANJI = re.compile(r'[㐀-鿿]')
KANA = re.compile(r'^[ぁ-ゟ゠-ヿー]+$')
DAKU = dict(zip('かきくけこさしすせそたちつてとはひふへほ', 'がぎぐげござじずぜぞだぢづでどばびぶべぼ'))
UNDAKU = {v: k for k, v in DAKU.items()}
HANDAKU = dict(zip('はひふへほ', 'ぱぴぷぺぽ'))
SMALL = dict(zip('ゃゅょ', 'やゆよ'))
O_ROW = set('おこそとのほもよろごぞどぼぽょ')
E_ROW = set('えけせてねへめれげぜでべぺ')
U_ROW = set('うくすつぬふむゆるぐずづぶぷゅ')


def h(s: str) -> int:
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16)


def variants(r: str) -> list:
    """Bacaan keliru yang masuk akal (pola pengecoh JLPT)."""
    out = []
    for i, ch in enumerate(r):
        if ch in DAKU:
            out.append(r[:i] + DAKU[ch] + r[i + 1:])
        if ch in UNDAKU:
            out.append(r[:i] + UNDAKU[ch] + r[i + 1:])
        if ch in HANDAKU:
            out.append(r[:i] + HANDAKU[ch] + r[i + 1:])
        if ch in SMALL:
            out.append(r[:i] + SMALL[ch] + r[i + 1:])
        if ch == 'っ':
            out.append(r[:i] + r[i + 1:])
        if ch in O_ROW and r[i + 1:i + 2] != 'う' and i < len(r) - 1:
            out.append(r[:i + 1] + 'う' + r[i + 1:])
        if ch in O_ROW and r[i + 1:i + 2] == 'う':
            out.append(r[:i + 1] + r[i + 2:])
        if ch in E_ROW and r[i + 1:i + 2] == 'い':
            out.append(r[:i + 1] + r[i + 2:])
        if ch in U_ROW and r[i + 1:i + 2] == 'う':
            out.append(r[:i + 1] + r[i + 2:])
        if 0 < i < len(r) - 1 and ch in 'きくちつ' and r[i + 1] in 'かきくけこさしすせそたちつてとぱぴぷぺぽ':
            out.append(r[:i] + 'っ' + r[i + 1:])
    seen, res = set(), []
    for v in out:
        if v != r and v not in seen and len(v) >= 2:
            seen.add(v)
            res.append(v)
    return res


def four(answer: str, distract: list, key: str):
    """4 pilihan unik dengan posisi kunci deterministik."""
    d = [x for x in dict.fromkeys(distract) if x != answer][:3]
    if len(d) < 3:
        return None
    pos = h(key) % 4
    opts = d[:pos] + [answer] + d[pos:]
    return opts, pos


def main():
    pairs = pb.tatoeba_pairs('jpn')
    kj = json.loads(pb.fetch(pb.KANJI_JSON))
    by_reading = {}
    for c, v in kj.items():
        if not v.get('jlpt_new'):
            continue
        # Pengecoh 表記: kanji JLPT dengan bacaan on yang sama (homofon) — pola kesalahan yang diuji JLPT.
        for rd in (v.get('readings_on') or []):
            by_reading.setdefault(rd, []).append(c)
    out = {}
    used_sent = set()
    for n in (5, 4, 3, 2, 1):
        rows = list(csv.DictReader(io.StringIO(pb.fetch(pb.JLPT_VOC.format(n)))))
        words = []
        for r in rows:
            e, rd, m = r['expression'].strip(), r['reading'].strip(), r['meaning'].strip()
            if e and rd and m and KANA.match(rd):
                words.append((e, rd, m))
        lv = f'n{n}'
        yomi, hyoki, bun = [], [], []
        INTERJ = re.compile(r'^(ah|oh|um|uh|hey|yes|no|well|hello|thank|excuse|sorry|good|bye|please|eh)\b', re.I)
        nouns = [w for w in words if not w[2].lower().startswith('to ') and not INTERJ.match(w[2]) and len(w[0]) >= 2
                 and not w[0].endswith(('い', 'う', 'る', 'く', 'す', 'つ', 'む', 'ぶ', 'ぬ', 'ぐ'))]
        AFTER = re.compile(r'^(は|が|を|に|で|へ|と|も|の|や|から|まで|です|だ|でした|。|、|！|？|か)')
        for e, rd, m in words:
            sent = next((p for p in pairs if e in p[1] and 6 <= len(p[1]) <= 32 and p[1] not in used_sent), None)
            if not sent:
                continue
            gloss = m.split(',')[0].strip()
            tr = sent[2]
            if KANJI.search(e) and len(rd) >= 2:
                v = variants(rd)
                f = four(rd, v, 'y' + e)
                if f:
                    used_sent.add(sent[1])
                    yomi.append({'stem': sent[1].replace(e, f'【{e}】', 1), 'options': f[0], 'answer': f[1],
                                 'why': f'{e} = {rd} („{gloss}“). Kalimat: „{tr}“', 'src': int(sent[0])})
                    # 表記: tulis kata yang sama dari hiragananya. Pengecoh: satu kanji diganti kanji sebunyi.
                    ks = [i for i, ch in enumerate(e) if KANJI.match(ch)]
                    alts = []
                    for i in ks:
                        ch = e[i]
                        reads = kj.get(ch, {}).get('readings_on') or []
                        for rr in reads:
                            for alt in by_reading.get(rr, [])[:12]:
                                if alt != ch:
                                    alts.append(e[:i] + alt + e[i + 1:])
                    alts = sorted(set(alts), key=lambda x: h(x + e))
                    f2 = four(e, alts, 'h' + e)
                    if f2 and len(hyoki) < 400:
                        hyoki.append({'stem': sent[1].replace(e, f'【{rd}】', 1), 'options': f2[0], 'answer': f2[1],
                                      'why': f'{rd} ditulis {e} („{gloss}“). Kalimat: „{tr}“', 'src': int(sent[0])})
            k0 = sent[1].find(e)
            if (e, rd, m) in nouns and k0 >= 0 and AFTER.match(sent[1][k0 + len(e):]):
                others = [w for w in nouns if w[0] != e and w[2].split(',')[0] != gloss]
                others = sorted(others, key=lambda w: h(w[0] + e))[:3]
                f3 = four(e, [w[0] for w in others], 'b' + e)
                if f3 and len(bun) < 400:
                    bun.append({'stem': sent[1].replace(e, '（　　）', 1), 'options': f3[0], 'answer': f3[1],
                                'why': f'Jawaban: {e}（{rd}）= „{gloss}“. Kalimat lengkap: {sent[1]} — „{tr}“. '
                                       + ' · '.join(f'{w[0]} = {w[2].split(",")[0]}' for w in others), 'src': int(sent[0])})
        out[lv] = {'kanjiyomi': yomi[:400], 'hyoki': hyoki, 'bunmyaku': bun}
        print(lv, 'kanjiyomi', len(out[lv]['kanjiyomi']), 'hyoki', len(hyoki), 'bunmyaku', len(bun))
    os.makedirs(os.path.join(ROOT, 'src', 'exam', 'gen'), exist_ok=True)
    with open(os.path.join(ROOT, 'src', 'exam', 'gen', 'jlpt-vocab.json'), 'w', encoding='utf-8') as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))


if __name__ == '__main__':
    main()
