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
BOOK_SET = BOOKS_ROUND2 if os.environ.get("ROUND") == "2" else BOOKS
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
