#!/usr/bin/env python3
"""Parse OpenITI mARkdown texts into pesantren_bab/pesantren_matn seed SQL.

Each kitab has its OWN structure (verified by hand before writing this —
see the per-book config below), per the standing BacklogTab rule: never
assume two kitab share a format. Arabic text only; translation_id stays
NULL (never machine-filled). New bab rows start at bab_order 100 so they
can never collide with the existing hand-curated bab (UNIQUE constraint).

Provenance: OpenITI corpus (https://github.com/OpenITI), public-domain
classical texts digitised from Shamela/al-Maktaba al-Shamila editions.
"""
import re, sys, os

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/openiti"
OUT = sys.argv[2] if len(sys.argv) > 2 else "packages/db-schema/seed/pesantren_full_texts.sql"

def clean(line: str) -> str:
    line = re.sub(r"PageV\d+P\d+", "", line)
    line = line.replace("~~", " ").strip()
    line = re.sub(r"^#+ ?", "", line).strip()
    # OpenITI quote marker — redundant here (ayat are already brace-marked)
    line = re.sub(r"\s*>+\s*", " ", line).strip()
    line = re.sub(r"\*+", "", line).strip()
    return line

def body_lines(path):
    """Yield (kind, text): kind 'h' for ### | headers, 'p' for paragraphs."""
    with open(path, encoding="utf-8") as f:
        raw = f.read()
    body = raw.split("#META#Header#End#", 1)[-1]
    para = []
    for line in body.splitlines():
        if line.startswith("### |"):
            if para:
                yield ("p", " ".join(para)); para = []
            h = clean(line[5:])
            if h:
                yield ("h", h)
        elif line.startswith("# "):
            if para:
                yield ("p", " ".join(para)); para = []
            t = clean(line)
            if t:
                para = [t]
        elif line.startswith("~~"):
            t = clean(line)
            if t:
                para.append(t)
        else:
            if para:
                yield ("p", " ".join(para)); para = []
    if para:
        yield ("p", " ".join(para))

def esc(s): return s.replace("'", "''")

# ── Per-book parsing configs (structures verified by inspection) ──────────
def parse_safinah(path):
    """No ### headers; each '(فصل)' paragraph is one matn. One bab."""
    matn, current = [], []
    for kind, text in body_lines(path):
        if kind != "p":
            continue
        if re.match(r"^\(?\s*فصل\s*\)?", text) and current:
            matn.append(" ".join(current)); current = [text]
        else:
            current.append(text)
    if current:
        matn.append(" ".join(current))
    return [("متن سفينة النجاة — النص الكامل", "Teks Lengkap (66 Fasal)", [(None, m) for m in matn])]

def parse_by_headers(path, is_bab):
    """Generic: ### | headers; is_bab(header) says which start a new bab —
    other headers become titled matn inside the current bab; paragraphs
    accumulate into the current matn."""
    babs = []  # (name_ar, [(title_ar|None, text)])
    cur_bab = None
    cur_title = None
    cur_text = []
    def flush_matn():
        nonlocal cur_title, cur_text
        if cur_bab is not None and (cur_text or cur_title):
            cur_bab[1].append((cur_title, "\n\n".join(cur_text)))
        cur_title, cur_text = None, []
    for kind, text in body_lines(path):
        if kind == "h":
            if is_bab(text):
                flush_matn()
                if cur_bab and cur_bab[1]:
                    babs.append(cur_bab)
                cur_bab = (text, [])
            else:
                flush_matn()
                if cur_bab is None:
                    cur_bab = ("مقدمة", [])
                cur_title = text
        else:
            if cur_bab is None:
                cur_bab = ("مقدمة", [])
            cur_text.append(text)
    flush_matn()
    if cur_bab and cur_bab[1]:
        babs.append(cur_bab)
    return [(name, None, matns) for name, matns in babs]

def parse_imrithi(path):
    """34 bab headers; verses ('a ... b') one matn per verse line."""
    babs = parse_by_headers(path, lambda h: True)
    out = []
    for name, _, matns in babs:
        verses = []
        for _, text in matns:
            for v in text.split("\n\n"):
                v = v.strip()
                if v:
                    verses.append((None, v))
        if verses:
            out.append((name, None, verses))
    return out

# ── Round 3 parsers (structures verified by inspection, 2026-07-16) ───────
def _chunk(text, target=900, hard=3500):
    """Split a long text into ~target-char chunks at paragraph/space breaks."""
    out = []
    while len(text) > hard:
        cut = text.rfind("\n\n", 0, hard)
        if cut < hard // 2:
            cut = text.rfind(" ", 0, hard)
        if cut <= 0:
            cut = hard
        out.append(text[:cut].strip()); text = text[cut:].strip()
    paras, cur = text.split("\n\n"), ""
    for p in paras:
        if cur and len(cur) + len(p) > target:
            out.append(cur); cur = p
        else:
            cur = (cur + "\n\n" + p) if cur else p
    if cur:
        out.append(cur)
    return [c for c in (s.strip() for s in out) if c]

SURAH_RE = re.compile(r"=\s*(\d{1,3})\s*(سورة\s[^<=]+?)\s*<")

def parse_jalalayn(path):
    """No ### headers; surah delimiters appear INLINE as '= N سورة NAME <'
    within '# '/'~~' paragraphs. One bab per surah; paragraphs merged into
    ~900-char matn chunks (verse-by-verse tafsir snippets are tiny)."""
    babs = []          # (name_ar, [paras])
    cur = ("مقدمة", [])
    for kind, text in body_lines(path):
        if kind != "p":
            continue
        pos = 0
        for m in SURAH_RE.finditer(text):
            before = text[pos:m.start()].strip()
            if before:
                cur[1].append(before)
            if cur[1] or babs:
                babs.append(cur)
            cur = (m.group(2).strip(), [])
            pos = m.end()
        rest = text[pos:].strip()
        if rest:
            cur[1].append(rest)
    babs.append(cur)
    return [
        (name, None, [(None, c) for c in _chunk("\n\n".join(paras))])
        for name, paras in babs
        if paras
    ]

def parse_sirah(path):
    """'### |' = major section (bab, 264); '### ||' = subsection whose heading
    titles the matn; paragraphs under it merge into that matn (long ones
    chunked). Raw-line parse because body_lines can't tell | from ||."""
    with open(path, encoding="utf-8") as f:
        body = f.read().split("#META#Header#End#", 1)[-1]
    babs, cur_bab, cur_title, cur_text = [], None, None, []
    def flush():
        nonlocal cur_title, cur_text
        text = "\n\n".join(cur_text).strip()
        if cur_bab is not None and (text or cur_title):
            chunks = _chunk(text, target=2500) or [""]
            for i, ch in enumerate(chunks):
                cur_bab[1].append((cur_title if i == 0 else None, ch))
        cur_title, cur_text = None, []
    for line in body.splitlines():
        if line.startswith("### ||"):
            flush()
            t = clean(line[6:]).strip("()： :")
            cur_title = t or None
        elif line.startswith("### |"):
            flush()
            if cur_bab and cur_bab[1]:
                babs.append(cur_bab)
            cur_bab = (clean(line[5:]), [])
        elif line.startswith("# ") or line.startswith("~~"):
            t = clean(line)
            if t:
                if line.startswith("# "):
                    cur_text.append(t)
                elif cur_text:
                    cur_text[-1] += " " + t
                else:
                    cur_text.append(t)
    flush()
    if cur_bab and cur_bab[1]:
        babs.append(cur_bab)
    return [(name, None, matns) for name, matns in babs if matns]

HADITH_NUM_RE = re.compile(r"^\d{1,4}\s*[-ـ–]")
PAGE_REF_RE = re.compile(r"\[ص:\s*\d+\]")

def parse_bulugh(path):
    """Every '### |' line is a header token, but only 'كتاب…'/'باب…' are real
    bab; numbered '### | N -' lines start a hadith (one matn each); all other
    header lines are OCR-split text fragments belonging to the current
    hadith. '# '/'~~' lines continue the current hadith."""
    with open(path, encoding="utf-8") as f:
        body = f.read().split("#META#Header#End#", 1)[-1]
    babs, cur_bab, cur = [], None, []
    def flush():
        nonlocal cur
        text = PAGE_REF_RE.sub("", " ".join(cur)).strip()
        if cur_bab is not None and len(text) > 3:
            cur_bab[1].append((None, text))
        cur = []
    for line in body.splitlines():
        if line.startswith("### |"):
            t = clean(line[5:])
            if not t:
                continue
            if t.startswith("كتاب") or t.startswith("باب"):
                flush()
                if cur_bab and cur_bab[1]:
                    babs.append(cur_bab)
                cur_bab = (t, [])
            elif HADITH_NUM_RE.match(t):
                flush()
                cur.append(t)
            else:
                cur.append(t)
        elif line.startswith("# ") or line.startswith("~~"):
            t = clean(line)
            if t:
                cur.append(t)
    flush()
    if cur_bab and cur_bab[1]:
        babs.append(cur_bab)
    return [(name, None, matns) for name, matns in babs if matns]

BOOKS_ROUND3 = [
    ("jalalayn", "jalalayn.md", parse_jalalayn, "0911Suyuti.TafsirJalalayn.JK000818-ara1"),
    ("sirahibnhisham", "sirahibnhisham.md", parse_sirah, "0213IbnHisham.SiraNabawiyya.Shamela0023833-ara1"),
    ("bulughulmaram", "bulughulmaram.md", parse_bulugh, "0852IbnHajarCasqalani.BulughMaram.Shamela0009111-ara1"),
]

# Round 3 introduces three new shelves (tafsir/hadits/sirah) and their kitab
# rows — emitted at the top of the round-3 seed so bab/matn FKs resolve.
HEADER_ROUND3 = """
INSERT OR IGNORE INTO pesantren_category (slug, name_id, name_ar, icon, sort_order) VALUES ('tafsir', 'Tafsir', 'التفسير', '📖', 5);
INSERT OR IGNORE INTO pesantren_category (slug, name_id, name_ar, icon, sort_order) VALUES ('hadits', 'Hadits', 'الحديث', '📜', 6);
INSERT OR IGNORE INTO pesantren_category (slug, name_id, name_ar, icon, sort_order) VALUES ('sirah', 'Sirah & Tarikh', 'السيرة والتاريخ', '🕌', 7);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('jalalayn', 'tafsir', 'تَفْسِيرُ الْجَلَالَيْنِ', 'Tafsir Jalalain', 'Jalaluddin Al-Mahalli & Jalaluddin As-Suyuthi', '911H', 'Tafsir ringkas seluruh Al-Qur''an 30 juz karya dua Imam Jalaluddin — Al-Mahalli (w. 864 H) memulai dari Al-Kahfi sampai An-Nas plus Al-Fatihah, lalu As-Suyuthi (w. 911 H) menyempurnakan Al-Baqarah sampai Al-Isra. Gaya penjelasannya padat kata demi kata sehingga menjadi tafsir standar pengajian pesantren di seluruh Nusantara: santri membaca ayat lalu langsung melihat makna tiap potongannya. Naskah di sini lengkap 114 surah.', 1);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('bulughulmaram', 'hadits', 'بُلُوغُ الْمَرَامِ مِنْ أَدِلَّةِ الْأَحْكَامِ', 'Bulughul Maram', 'Al-Hafizh Ibnu Hajar Al-Asqalani', '852H', 'Himpunan sekitar 1.500 hadits hukum karya Al-Hafizh Ibnu Hajar Al-Asqalani (w. 852 H), tersusun mengikuti bab fiqih dari thaharah hingga adab, dan pada tiap hadits disebutkan perawi serta derajatnya secara ringkas. Menjadi jembatan santri dari fiqih ke dalilnya — kitab wajib pengajian hadits ahkam di pesantren, dengan syarah masyhur Subulus Salam karya Ash-Shan''ani.', 1);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('sirahibnhisham', 'sirah', 'السِّيرَةُ النَّبَوِيَّةُ لِابْنِ هِشَامٍ', 'Sirah Nabawiyah Ibnu Hisham', 'Abu Muhammad Abdul Malik bin Hisyam', '213H', 'Kitab sirah paling otoritatif yang sampai kepada kita: penyuntingan Ibnu Hisyam (w. 213 H) atas Sirah Ibnu Ishaq, menuturkan kehidupan Rasulullah ﷺ dari nasab dan kelahiran, masa kenabian di Makkah, hijrah, seluruh peperangan (maghazi), hingga wafat beliau — lengkap dengan riwayat, syair, dan silsilah. Menjadi induk hampir seluruh buku sirah sesudahnya.', 1);
"""

BOOKS_ROUND2 = [
    ("jurumiyah", "jurumiyah.md", lambda p: parse_by_headers(p, lambda h: True), "0723IbnAjrum.Ajrumiyya.Shamela0011371-ara1"),
    ("alfiyah", "alfiyah.md", parse_imrithi, "0672IbnMalik.Alfiyya.Shamela0008522-ara1"),
    ("taqrib", "taqrib.md", lambda p: parse_by_headers(p, lambda h: True), "0593IbnHusaynShihabDinIsbahani.GhayaWaTaqrib.Shamela0011370-ara1"),
]

BOOKS = [
    ("safinah", "safinah.md", parse_safinah, "1271SalimHadrami.MatnSafinatNaja.ShamAY0037367-ara1"),
    ("imrithi", "imrithi.md", parse_imrithi, "0989SharafDinCimriti.DurraBahiyya.Shamela0002084-ara1"),
    ("bidayatulhidayah", "bidayatulhidayah.md", lambda p: parse_by_headers(p, lambda h: True), "0505Ghazali.BidayatHidaya.Shamela0012718-ara1"),
    ("fathulqarib", "fathulqarib.md", lambda p: parse_by_headers(p, lambda h: not h.startswith("•")), "0918IbnQasimShamsDinGhazzi.FathQarib.Shamela0035120-ara1"),
    ("minhajultalibin", "minhajultalibin.md", lambda p: parse_by_headers(p, lambda h: h.startswith("كتاب") or h.startswith("مقدمة")), "0676Nawawi.MinhajTalibin.Shamela0012096-ara1"),
]

rows = ["""-- Full Arabic texts for the Kitab Pesantren library, parsed from the
-- OpenITI corpus (public-domain Shamela digitisations; per-book source URIs
-- in the comments below). Structure verified per book before parsing.
-- translation_id is NULL throughout: terjemah must come from a verified
-- source, never machine-filled here (the reader shows Arabic; narration
-- works in Arabic). New bab_order starts at 100 to never collide with the
-- existing hand-curated bab rows.
"""]
total_matn = 0
_round = os.environ.get("ROUND")
BOOK_SET = BOOKS_ROUND3 if _round == "3" else BOOKS_ROUND2 if _round == "2" else BOOKS
if _round == "3":
    rows.append(HEADER_ROUND3)
for slug, fname, parser, uri in BOOK_SET:
    babs = parser(os.path.join(SRC, fname))
    rows.append(f"\n-- ═══ {slug} — OpenITI {uri} ═══")
    for bi, (name_ar, name_id, matns) in enumerate(babs, start=100):
        nid = name_id or name_ar
        rows.append(
            f"INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) "
            f"VALUES ('{slug}', {bi}, '{esc(nid)}', '{esc(name_ar)}');"
        )
        for mi, (title_ar, text) in enumerate(matns, start=1):
            text = text.strip()
            if not text or len(text) < 3:
                continue
            total_matn += 1
            t_ar = f"'{esc(title_ar)}'" if title_ar else "NULL"
            rows.append(
                "INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) "
                f"SELECT id, {mi}, NULL, {t_ar}, '{esc(text)}', NULL, NULL, NULL, NULL "
                f"FROM pesantren_bab WHERE kitab_slug = '{slug}' AND bab_order = {bi};"
            )

with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(rows) + "\n")
print(f"wrote {OUT}: {total_matn} matn rows")
