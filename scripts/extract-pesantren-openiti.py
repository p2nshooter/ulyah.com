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

# ── Round 4 parsers (structures verified by inspection, 2026-07-16) ───────
def parse_pipe_headers(path, is_bab=lambda h: True, chunk=3500):
    """Books marked with '# | Heading' lines (Fath al-Mu'in, Kifayat
    al-Akhyar, Waraqat, Nukhbat al-Fikar): '# |' (optionally '# |1') is a
    header; '# $' is the book title (skipped); other '# '/'~~' lines are
    content, merged then chunked."""
    with open(path, encoding="utf-8") as f:
        body = f.read().split("#META#Header#End#", 1)[-1]
    babs, cur_bab, cur_title, cur_text = [], None, None, []
    def flush():
        nonlocal cur_title, cur_text
        text = "\n\n".join(cur_text).strip()
        if cur_bab is not None and (text or cur_title):
            for i, ch in enumerate(_chunk(text, target=2500, hard=chunk) or [""]):
                cur_bab[1].append((cur_title if i == 0 else None, ch))
        cur_title, cur_text = [None, []][0], []
    for line in body.splitlines():
        s = line.strip()
        if s.startswith("# $"):
            continue
        if s.startswith("# |"):
            h = clean(re.sub(r"^# \|\d*", "", s)).strip("|() ").strip()
            h = re.sub(r"^\d+\s*[-ـ]?\s*", "", h).strip() or None
            if h and is_bab(h):
                flush()
                if cur_bab and cur_bab[1]:
                    babs.append(cur_bab)
                cur_bab = (h, [])
            else:
                flush()
                if cur_bab is None:
                    cur_bab = ("مقدمة", [])
                cur_title = h
        elif s.startswith("#") or s.startswith("~~"):
            t = clean(s)
            t = re.sub(r"^\d+\s", "", t)
            if t:
                if cur_bab is None:
                    cur_bab = ("مقدمة", [])
                if s.startswith("~~") and cur_text:
                    cur_text[-1] += " " + t
                else:
                    cur_text.append(t)
    flush()
    if cur_bab and cur_bab[1]:
        babs.append(cur_bab)
    return [(name, None, matns) for name, matns in babs if matns]

def parse_poem_lines(path, bab_name):
    """One-verse-per-'# ' line poems (Tuhfat al-Atfal): strip parens, keep
    the % half-verse divider as ' * '. Single bab."""
    verses = []
    for kind, text in body_lines(path):
        if kind != "p":
            continue
        for para in text.split("\n\n"):
            v = para.strip().strip("()").replace("%", "*").strip()
            v = re.sub(r"\s+", " ", v)
            if len(v) > 3:
                verses.append((None, v))
    return [(bab_name, None, verses)] if verses else []

def parse_star_poem(path, bab_name):
    """Poems written as a running text with '*' between half-verses
    (Bayquniyya): pair consecutive halves into verses. Raw-line read —
    clean() strips asterisks, which are exactly the delimiter here."""
    with open(path, encoding="utf-8") as f:
        body = f.read().split("#META#Header#End#", 1)[-1]
    parts = []
    for line in body.splitlines():
        s = line.strip()
        if s.startswith("#") or s.startswith("~~"):
            s = re.sub(r"PageV\d+P\d+", "", s)
            s = re.sub(r"^[#~ ]+", "", s).strip()
            if s:
                parts.append(s)
    text = " ".join(parts)
    halves = [h.strip() for h in text.split("*") if h.strip()]
    verses = []
    for i in range(0, len(halves) - 1, 2):
        verses.append((None, halves[i] + " * " + halves[i + 1]))
    if len(halves) % 2:
        verses.append((None, halves[-1]))
    return [(bab_name, None, verses)] if verses else []

def parse_hikam(path):
    """Al-Hikam: aphorisms in flowing paragraphs — single bab, ~700-char
    chunks so each screenful is a handful of hikmah."""
    text = "\n\n".join(t for k, t in body_lines(path) if k == "p")
    return [("متن الحكم العطائية", None, [(None, c) for c in _chunk(text, target=700, hard=1400)])]

def parse_qatr(path):
    """Qatr al-Nada: real '### |' section headers mixed with bare numbered
    ones ('1-') that are list markers, not bab."""
    babs = parse_by_headers(path, lambda h: not re.match(r"^\d+\s*[-ـ]?\s*$", h.strip()))
    out = []
    for name, _, matns in babs:
        clean_matns = []
        for title, text in matns:
            if title and re.match(r"^\d+\s*[-ـ]?\s*$", title.strip()):
                title = None
            clean_matns.append((title, text))
        out.append((name, None, clean_matns))
    return out

BOOKS_ROUND4 = [
    ("arbainnawawi", "arbainnawawi.md", parse_sirah, "0676Nawawi.ArbacunaNawawiyya.Shamela0012836-ara1"),
    ("tuhfatulathfal", "tuhfatulathfal.md", lambda p: parse_poem_lines(p, "متن تحفة الأطفال"), "1208SulaymanJamzuriAffandi.TuhfatAtfal.JK000963-ara1"),
    ("jazariyyah", "jazariyyah.md", parse_imrithi, "0833IbnJazari.ManzumaJazariyya.Shamela0012093-ara1"),
    ("bayquniyyah", "bayquniyyah.md", lambda p: parse_star_poem(p, "متن المنظومة البيقونية"), "1080IbnMuhammadBayquniDimashqi.ManzumaBayquniyya.JK010967-ara1"),
    ("nukhbatulfikar", "nukhbatulfikar.md", lambda p: parse_pipe_headers(p, lambda h: False), "0852IbnHajarCasqalani.NukhbatFikar.JK000434-ara1"),
    ("waraqat", "waraqat.md", parse_pipe_headers, "0478ImamHaramaynJuwayni.Waraqat.JK000308-ara1"),
    ("qatrunnada", "qatrunnada.md", parse_qatr, "0761JamalDinIbnHisham.MatnQatrNada.Shamela0011376-ara1"),
    ("mulhatulirab", "mulhatulirab.md", lambda p: parse_pipe_headers(p, lambda h: len(h) > 3), "0516IbnCaliHariri.MulhatIcrab.JK009281-ara1"),
    ("hikam", "hikam.md", parse_hikam, "0709IbnCataAllahSikandari.HikamCataiyya.JK009323-ara1"),
    ("fathulmuin", "fathulmuin.md", parse_pipe_headers, "0987ZaynDinMalibari.FathMucin.JK000228-ara1"),
    ("kifayatulakhyar", "kifayatulakhyar.md", parse_pipe_headers, "0829TaqiDinDimashqiHisni.KifayatAkhyar.JK000119-ara1"),
    ("tarikhkhulafa", "tarikhkhulafa.md", parse_sirah, "0911Suyuti.TarikhKhulafa.Shamela0011997-ara1"),
]

HEADER_ROUND4 = """
INSERT OR IGNORE INTO pesantren_category (slug, name_id, name_ar, icon, sort_order) VALUES ('tajwid', 'Tajwid', 'التجويد', '🎙️', 8);
INSERT OR IGNORE INTO pesantren_category (slug, name_id, name_ar, icon, sort_order) VALUES ('ulumul-hadits', 'Ulumul Hadits', 'مصطلح الحديث', '🔎', 9);
INSERT OR IGNORE INTO pesantren_category (slug, name_id, name_ar, icon, sort_order) VALUES ('usul-fiqih', 'Ushul Fiqih', 'أصول الفقه', '🏛️', 10);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('arbainnawawi', 'hadits', 'الأَرْبَعُونَ النَّوَوِيَّةُ', 'Arba''in Nawawi', 'Imam An-Nawawi', '676H', 'Empat puluh dua hadits pilihan Imam An-Nawawi (w. 676 H) yang menghimpun pokok-pokok agama — niat, rukun Islam-iman-ihsan, halal-haram, zuhud, hingga wali Allah. Kitab hafalan hadits pertama di pesantren dan pengajian di seluruh dunia, dengan puluhan syarah masyhur.', 2);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('tuhfatulathfal', 'tajwid', 'تُحْفَةُ الْأَطْفَالِ', 'Tuhfatul Athfal', 'Syaikh Sulaiman Al-Jamzuri', '1208H', 'Nazham 61 bait tentang hukum nun sukun & tanwin, mim sukun, dan mad — pelajaran tajwid pertama santri di seluruh dunia. Ringkas, mudah dihafal, dan menjadi dasar sebelum naik ke Al-Jazariyyah.', 1);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('jazariyyah', 'tajwid', 'الْمُقَدِّمَةُ الْجَزَرِيَّةُ', 'Matan Al-Jazariyyah', 'Imam Ibnul Jazari', '833H', 'Nazham tajwid tingkat lanjut karya imam qiraat Ibnul Jazari (w. 833 H): makharijul huruf, sifat huruf, tafkhim-tarqiq, hingga waqaf-ibtida. Matan induk ilmu tajwid yang dihafal para qari dan huffazh.', 2);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('bayquniyyah', 'ulumul-hadits', 'الْمَنْظُومَةُ الْبَيْقُونِيَّةُ', 'Manzhumah Bayquniyyah', 'Imam Al-Bayquni', '1080H', 'Nazham 34 bait yang merangkum jenis-jenis hadits (shahih, hasan, dhaif, marfu'', maqthu'', musnad, muttashil, dst.) — pintu masuk ilmu mustholah hadits di pesantren dan universitas.', 1);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('nukhbatulfikar', 'ulumul-hadits', 'نُخْبَةُ الْفِكَرِ', 'Nukhbatul Fikar', 'Al-Hafizh Ibnu Hajar Al-Asqalani', '852H', 'Risalah mustholah hadits paling berpengaruh karya Ibnu Hajar (w. 852 H): klasifikasi khabar, syarat shahih, jenis cacat, hingga istilah jarh-ta''dil — ringkas namun menjadi induk kurikulum ilmu hadits, dengan syarah beliau sendiri Nuzhatun Nazhar.', 2);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('waraqat', 'usul-fiqih', 'الْوَرَقَاتُ', 'Al-Waraqat', 'Imam Al-Haramain Al-Juwaini', '478H', 'Risalah ushul fiqih dasar karya Imam Al-Haramain (w. 478 H): hukum taklifi, amr-nahi, ''am-khash, nasakh, ijma'', qiyas, ijtihad. Matan pertama santri dalam memahami cara hukum Islam diistinbath, dengan syarah masyhur Al-Mahalli.', 1);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('qatrunnada', 'nahwu-shorof', 'قَطْرُ النَّدَى وَبَلُّ الصَّدَى', 'Qatrun Nada', 'Ibnu Hisyam Al-Anshari', '761H', 'Matan nahwu tingkat menengah karya Ibnu Hisyam (w. 761 H), jembatan antara Jurumiyyah dan Alfiyyah: kalimat dan i''rab, nawasikh, ''amil, hingga tawabi'' — ringkas dengan definisi yang sangat presisi.', 3);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('mulhatulirab', 'nahwu-shorof', 'مُلْحَةُ الْإِعْرَابِ', 'Mulhatul I''rab', 'Al-Hariri Al-Bashri', '516H', 'Nazham nahwu karya Al-Hariri (w. 516 H), penulis Maqamat: kaidah i''rab disajikan dalam bait-bait indah yang mudah dihafal — pendamping nazham bagi santri penghafal selain Imrithi dan Alfiyyah.', 4);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('hikam', 'akhlak', 'الْحِكَمُ الْعَطَائِيَّةُ', 'Al-Hikam', 'Ibnu Atha''illah As-Sakandari', '709H', 'Untaian hikmah tasawuf paling termasyhur karya Ibnu Atha''illah As-Sakandari (w. 709 H) — kalimat-kalimat pendek yang menembus hati tentang tauhid, tawakal, ikhlas, dan ma''rifah. Dikaji rutin di pesantren dengan berbagai syarah.', 3);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('fathulmuin', 'fiqih', 'فَتْحُ الْمُعِينِ', 'Fathul Mu''in', 'Syaikh Zainuddin Al-Malibari', '987H', 'Kitab fiqih Syafi''i karya Zainuddin Al-Malibari (w. 987 H), murid Ibnu Hajar Al-Haitami — syarah atas Qurratul ''Ain miliknya sendiri. Standar kajian fiqih menengah-atas pesantren Nusantara; induk hasyiyah I''anatut Thalibin.', 5);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('kifayatulakhyar', 'fiqih', 'كِفَايَةُ الْأَخْيَارِ', 'Kifayatul Akhyar', 'Imam Taqiyuddin Al-Hishni', '829H', 'Syarah lengkap atas Matan Taqrib karya Taqiyuddin Al-Hishni (w. 829 H) — fiqih Syafi''i dengan dalil Al-Qur''an dan hadits pada tiap masalah, dari thaharah hingga peradilan. Melengkapi jenjang Taqrib → Fathul Qarib di rak ini.', 6);
INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order) VALUES ('tarikhkhulafa', 'sirah', 'تَارِيخُ الْخُلَفَاءِ', 'Tarikh Khulafa', 'Imam Jalaluddin As-Suyuthi', '911H', 'Sejarah para khalifah karya As-Suyuthi (w. 911 H): Khulafaur Rasyidin, Bani Umayyah, hingga Abbasiyah — biografi, keutamaan, dan peristiwa penting tiap masa kekhalifahan, melanjutkan rak sejarah setelah Sirah Ibnu Hisham.', 2);
"""

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
BOOK_SET = BOOKS_ROUND4 if _round == "4" else BOOKS_ROUND3 if _round == "3" else BOOKS_ROUND2 if _round == "2" else BOOKS
if _round == "3":
    rows.append(HEADER_ROUND3)
if _round == "4":
    rows.append(HEADER_ROUND4)
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
