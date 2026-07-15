"use client";

/**
 * "Rancangan & Backlog" — the single master planning document for ULYAH.COM,
 * living inside the product instead of scattered across chat history. Three
 * explicit product owner instructions drove this tab's existence:
 *
 *   1. "catat dulu di portal admin agar bisa di kerjakan secara bertahap dan
 *      kasih tanda mana yg sudah dan yg belum secara berurutan dan yg paling
 *      penting dahulu" — track everything here, ordered, most important first.
 *   2. "bikin yang jelas rancangannya biar AI berikutnya yg meneruskan tau
 *      yg di kerjakan... ini harus tercatat di portal admin, AI berikutnya
 *      harus di arahkan dengan benar, karena ini sangat penting" — whichever
 *      AI picks up this project next must be able to read this page and know
 *      exactly what's done, in progress, still under review, or blocked —
 *      without needing the original chat transcript.
 *   3. "jika ada kemiripan kitab 100% jgn d serap" — a standing dedup rule
 *      for every future ingestion pass, recorded once here rather than
 *      re-explained per PR.
 *
 * Deliberately static/no-backend, same pattern as RoadmapTab/WidgetStoreTab:
 * this is a planning surface, not live data. Update the arrays below as work
 * actually happens — this file IS the backlog, not a mirror of one.
 */

import Image from "next/image";

type Status = "done" | "partial" | "todo" | "skip" | "concept";

const STATUS_META: Record<Status, { label: string; cls: string }> = {
  done: { label: "✅ Selesai", cls: "border-success/40 bg-success/15 text-success" },
  partial: { label: "🟡 Sebagian", cls: "border-warning/40 bg-warning/15 text-warning" },
  todo: { label: "⬜ Belum dikerjakan", cls: "border-[var(--color-border)] bg-black/5 text-[var(--color-text-secondary)]" },
  skip: { label: "🚫 Sengaja dilewati", cls: "border-danger/30 bg-danger/10 text-danger" },
  concept: { label: "💡 Konsep", cls: "border-accent/40 bg-accent/15 text-accent" },
};

function Pill({ status }: { status: Status }) {
  const m = STATUS_META[status];
  return <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${m.cls}`}>{m.label}</span>;
}

// ── 1. Sumber terbuka (kedua edisi ULYAH_Open_Source_Reference) ──────────
// Satu baris per kategori dari dokumen referensi, status serapan + repo mana
// saja yang sudah/​belum/​sengaja dilewati dan kenapa.
interface RefCategory {
  key: string;
  title: string;
  status: Status;
  note: string;
}

const REFERENCE_CATEGORIES: RefCategory[] = [
  {
    key: "quran",
    title: "1. Al-Qur'an",
    status: "partial",
    note:
      "Teks, terjemah 8 bahasa, tafsir (spa5k), asbabun nuzul, audio murottal & radio sudah jalan (data awal dari paket quran-json, bukan repo di daftar). Alternatif API (Gading, Semarketir, Bachors, dll.) TIDAK diserap — sudah punya sumber yang jalan, redundant. Tajwid berwarna, Hifz/AI Pronunciation (ISSAAM11, mostafa-adel, Tikrar) masih konsep — proyek sumber masih kecil/riset, baru cocok jadi referensi arsitektur bukan produk siap pakai. Islamic Radio API (uthumany) belum diserap — radio ULYAH pakai CDN qori sendiri.",
  },
  {
    key: "hadits",
    title: "2. Hadits",
    status: "partial",
    note:
      "fawazahmed0/hadith-api diserap penuh (9 kitab + Arba'in + Qudsi + Ahmad + Darimi). irsyadulibad/hadits-database diserap sebagian (Riyadhus Shalihin, 371 hadits — lihat catatan bug di bawah). BELUM diserap: AhmedElTabarani/dorar-hadith-api — PALING PENTING untuk tahap berikut, karena ini satu-satunya sumber dengan field grade/rawi (perawi) terisi nyata, dibutuhkan untuk sistem klasifikasi di bawah. IslamHouse API Hub & hadis-api-id (renomureza) belum diserap — kemungkinan besar isinya sama dengan yang sudah ada (cek 100% kemiripan dulu sebelum serap, jangan duplikat).",
  },
  {
    key: "tafsir",
    title: "3. Tafsir",
    status: "done",
    note: "spa5k/tafsir_api (118 edisi) + asbabun nuzul (mostafaahmed97) sudah diserap dan bisa dipilih di pembaca Qur'an. h9-tec/uloom-quran belum dipakai (ilmu Qur'an dasar, kandidat untuk materi Al-Qur'an Kids nanti).",
  },
  {
    key: "kitab",
    title: "4. Maktabah / Kitab",
    status: "partial",
    note:
      "Katalog Shamela (~4.9k judul, metadata + terjemah on-demand) sudah jalan tapi konsistensi terbatas (lihat catatan). Kitab pesantren lengkap (Arab+terjemah utuh per bait) baru 1 kitab: Aqidatul Awam (wahyu9kdl/islami, terverifikasi bersih). shamelaws_books_download, shamela (ragaeeb), shamela2epub BELUM diserap — berpotensi menambah teks lengkap kitab, tapi format tiap kitab tidak seragam (sudah dicoba scan beberapa, hasil bervariasi) — perlu verifikasi manual per kitab sebelum impor massal, jangan asal parse.",
  },
  {
    key: "kisah",
    title: "5. Kisah Islam",
    status: "partial",
    note:
      "5 seri kisah ditulis internal & bersumber (Yusuf, Musa, Dzulqarnain, Ashabul Kahfi, Nuh) — task lama #81 'Import kisah content from 6 repos' masih PENDING. maulanashalihin/quran-stories SENGAJA DILEWATI — bukan tafsir netral, tapi kerangka interpretatif satu penulis ('100 Kisah Al-Uqdah al-Kubra') yang mengaitkan Qur'an dengan kosmologi; butuh tinjauan sebelum dipakai. AzharRivaldi/Kisah-25-Nabi, islamic-story-android, Saimon8420/islamic-prophets-stories (revisi 2) belum dinilai. abdullah-R197/Complete-Islamic-History-Timeline (revisi 3, BARU) belum disentuh — kandidat kuat untuk fitur 'Tarikh Islam' yang belum ada sama sekali.",
  },
  {
    key: "awesome",
    title: "6. Aplikasi Islam (awesome list)",
    status: "done",
    note: "Dipakai sebagai peta pencarian (discovery), bukan sumber data langsung — sudah selesai fungsinya untuk riset ini.",
  },
  {
    key: "widget-ui",
    title: "7. Widget (komponen UI)",
    status: "todo",
    note: "Nodlik/StPageFlip (efek balik halaman) direncanakan untuk 'Kitab Digital' page-flip — masih status building di Widget Store, animasi belum dibangun.",
  },
  {
    key: "sholat-kiblat-hijri",
    title: "8. Jadwal Sholat, Kiblat, Kalender Hijriyah, Masjid, Haji/Umrah",
    status: "partial",
    note:
      "Jadwal Sholat: SELESAI, app terpisah sendiri. Kiblat: SELESAI — /kiblat, bearing lingkaran-besar ke Ka'bah dari lokasi IP (rumus tervalidasi terhadap bearing publik: Jakarta ~295°, New York ~58°, London ~119°), kompas statis (bukan jarum magnetometer live — presisi IP geolocation sekelas kota, bukan GPS persis; kompas live berbasis device-orientation dicatat sebagai peningkatan lanjutan, belum dibangun). Kalender Hijriyah: SELESAI — /kalender-hijriyah, grid bulan memakai Intl.DateTimeFormat('islamic-umalqura') yang SUDAH ADA di codebase (lib/hijri.ts, dipakai juga oleh countdown Ramadhan) — kalender resmi Arab Saudi, bukan tabular buatan sendiri, dengan disclaimer eksplisit soal potensi beda 1 hari dari rukyat lokal. Imsakiyah Ramadhan: SELESAI — /imsakiyah, tabel Imsak/Subuh/Maghrib per hari untuk Ramadhan berjalan/berikutnya, pakai mesin adhan.js yang sama dengan Jadwal Sholat (bukan hitungan kedua terpisah). Masjid Finder: belum ada. Haji/Umrah (GEMA audio tour): dicatat tapi OSS di kategori ini memang tipis — prioritas rendah.",
  },
  {
    key: "doa-dzikir",
    title: "9. Doa, Dzikir & Asmaul Husna",
    status: "partial",
    note: "Amalan Harian (doa bangun-tidur, dzikir, thibbun nabawi) sudah jalan dengan suara. PERLU DIVERIFIKASI: apakah 99 Asmaul Husna lengkap sudah masuk di dalamnya atau belum — kalau belum, Sidd42144/Asmaul-Husna (JSON ringan) siap pakai.",
  },
  {
    key: "zakat-waris",
    title: "10. Zakat, Waris & Keuangan Syariah",
    status: "partial",
    note:
      "Kalkulator Zakat (Maal 2.5% + Fitrah) SELESAI — /zakat, client-side murni, nisab emas & perak ditampilkan berdampingan (bukan memilih satu pendapat). Kalkulator Waris (Faraid) SELESAI (cakupan umum) — /waris, menghitung pasangan+anak+orang tua+saudara kandung/seibu (kalalah), dengan Aul/Radd/Gharrawain-Umariyyatain. SENGAJA TIDAK mencakup kakek/nenek, saudara seayah, dan cucu pengganti — kasus itu punya khilafiyah nyata antar mazhab (terutama kakek+saudara), disclaimer eksplisit di halaman mengarahkan ke ahli faraid/Pengadilan Agama untuk kasus tersebut atau harta bernilai besar — JANGAN tambahkan kakek/nenek tanpa tinjauan fiqih waris yang cermat. Halal Stock Screener & Sadaqah Kiosk — prioritas rendah, di luar misi inti Ulyah.",
  },
  {
    key: "arabic",
    title: "11. Bahasa Arab & Linguistik Qur'an",
    status: "todo",
    note: "Kamus Arab-Indonesia (oong26/arabic_dictionary_model, revisi 3, BARU, sumber Al-Munawwir) belum diserap — fitur 'Kamus Arab' di checklist masih kosong sepenuhnya.",
  },
  {
    key: "dataset-ai",
    title: "12. Dataset & AI/NLP Islam",
    status: "concept",
    note: "Referensi untuk fitur AI (OCR Kitab, Klasifikasi Hadits) yang masih di tahap ide — belum ada implementasi nyata, lihat bagian 'Fitur AI Hadits' di bawah.",
  },
  {
    key: "pesantren",
    title: "13. Web Pesantren",
    status: "skip",
    note:
      "zackymh/webpesantrenquran, NavanKen/Santri-Verse, akusopo1945/santriq SEMUA adalah sistem MANAJEMEN pesantren (data santri, LMS, perizinan) — bukan sumber konten kitab. Di luar misi Ulyah (perpustakaan & audio Islami), sengaja tidak diserap.",
  },
  {
    key: "apis",
    title: "14. API Islam siap pakai (non-GitHub)",
    status: "skip",
    note:
      "AlAdhan, EQuran.id, MyQuran, Tanzil, Sunnah.com — semua alternatif yang tumpang tindih dengan sumber yang sudah dipakai (quran-json + fawazahmed0 + perhitungan sendiri). Tidak mendesak; simpan sebagai cadangan bila sumber utama bermasalah.",
  },
];

// ── 2. Sistem klasifikasi hadits — taksonomi lengkap dari permintaan owner ──
interface TaxonomyTerm {
  term: string;
  ar?: string;
  status: Status;
}
interface TaxonomyGroup {
  group: string;
  terms: TaxonomyTerm[];
}

const HADITH_TAXONOMY: TaxonomyGroup[] = [
  {
    group: "Berdasarkan Tingkat Penerimaan",
    terms: [
      { term: "Shahih", ar: "صحيح", status: "done" },
      { term: "Shahih li Dzatihi", status: "todo" },
      { term: "Shahih li Ghairihi", status: "todo" },
      { term: "Hasan", ar: "حسن", status: "done" },
      { term: "Hasan li Dzatihi", status: "todo" },
      { term: "Hasan li Ghairihi", status: "todo" },
      { term: "Dha'if", ar: "ضعيف", status: "done" },
      { term: "Dha'if Jiddan (sangat lemah)", status: "todo" },
      { term: "Maudhu'", ar: "موضوع", status: "done" },
      { term: "Munkar", ar: "منكر", status: "partial" },
      { term: "Matruk", ar: "متروك", status: "todo" },
      { term: "Mardud", ar: "مردود", status: "todo" },
      { term: "Syadz", ar: "شاذ", status: "todo" },
      { term: "Mu'allal / Mu'all", ar: "معلل", status: "todo" },
    ],
  },
  {
    group: "Berdasarkan Jumlah Perawi",
    terms: [
      { term: "Mutawatir", ar: "متواتر", status: "done" },
      { term: "Ahad", ar: "آحاد", status: "todo" },
      { term: "Masyhur", status: "todo" },
      { term: "Aziz", status: "todo" },
      { term: "Gharib", status: "todo" },
    ],
  },
  {
    group: "Berdasarkan Sandaran Hadits",
    terms: [
      { term: "Qudsi", ar: "قدسي", status: "done" },
      { term: "Marfu'", ar: "مرفوع", status: "todo" },
      { term: "Mauquf", ar: "موقوف", status: "todo" },
      { term: "Maqthu'", ar: "مقطوع", status: "todo" },
    ],
  },
  {
    group: "Berdasarkan Ketersambungan Sanad",
    terms: [
      { term: "Musnad", status: "todo" },
      { term: "Muttashil", status: "todo" },
      { term: "Musalsal", status: "todo" },
      { term: "Mu'allaq", status: "todo" },
      { term: "Mursal", status: "todo" },
      { term: "Munqathi'", status: "todo" },
      { term: "Mu'dhal", status: "todo" },
      { term: "Mudallas", status: "todo" },
    ],
  },
  {
    group: "Berdasarkan Perawi",
    terms: [
      { term: "Tsiqah", status: "todo" },
      { term: "Shaduq", status: "todo" },
      { term: "Majhul", status: "todo" },
      { term: "Mastur", status: "todo" },
      { term: "Dhabit", status: "todo" },
      { term: "Laysa bihi ba's", status: "todo" },
      { term: "Matruk", status: "todo" },
      { term: "Kadzdzab", status: "todo" },
      { term: "Da'if (perawi)", status: "todo" },
      { term: "Mudallis", status: "todo" },
    ],
  },
  {
    group: "Berdasarkan Matan",
    terms: [
      { term: "Mahfuzh", status: "todo" },
      { term: "Syadz (matan)", status: "todo" },
      { term: "Munkar (matan)", status: "todo" },
      { term: "Mudraj", status: "todo" },
      { term: "Maqlub", status: "todo" },
      { term: "Mudhtharib", status: "todo" },
      { term: "Mushahhaf", status: "todo" },
      { term: "Muharraf", status: "todo" },
      { term: "Ziyadah ats-Tsiqah", status: "todo" },
    ],
  },
  {
    group: "Berdasarkan Penggunaan",
    terms: [
      { term: "Hadits Hukum", status: "todo" },
      { term: "Hadits Aqidah", status: "todo" },
      { term: "Hadits Akhlak", status: "todo" },
      { term: "Hadits Targhib", status: "todo" },
      { term: "Hadits Tarhib", status: "todo" },
      { term: "Hadits Fadhail A'mal", status: "todo" },
      { term: "Hadits Tafsir", status: "todo" },
      { term: "Hadits Sirah", status: "todo" },
      { term: "Hadits Thibbun Nabawi", status: "todo" },
      { term: "Hadits Adab", status: "todo" },
      { term: "Hadits Muamalah", status: "todo" },
    ],
  },
  {
    group: "Penilaian Ulama",
    terms: [
      { term: "Shahih menurut Al-Bukhari", status: "todo" },
      { term: "Shahih menurut Muslim", status: "todo" },
      { term: "Shahih menurut Al-Albani", status: "todo" },
      { term: "Dha'if menurut Al-Albani", status: "todo" },
      { term: "Hasan menurut At-Tirmidzi", status: "todo" },
      { term: "Shahih menurut Ibnu Hibban", status: "todo" },
      { term: "Shahih menurut Al-Hakim", status: "todo" },
      { term: "Pendapat Adz-Dzahabi", status: "todo" },
      { term: "Pendapat Ibnu Hajar", status: "todo" },
      { term: "Pendapat Asy-Syaukani", status: "todo" },
    ],
  },
  {
    group: "Metadata Hadits",
    terms: [
      { term: "Derajat Hadits", status: "done" },
      { term: "Takhrij", status: "todo" },
      { term: "Sanad Lengkap", status: "partial" },
      { term: "Jalur Riwayat", status: "partial" },
      { term: "Pohon Sanad", status: "done" },
      { term: "Perawi", status: "partial" },
      { term: "Biografi Perawi", status: "partial" },
      { term: "Tahun Wafat Perawi", status: "partial" },
      { term: "Kitab Asal", status: "done" },
      { term: "Bab", status: "partial" },
      { term: "Nomor Hadits", status: "done" },
      { term: "Kata Kunci", status: "todo" },
      { term: "Sebab Wurud Hadits", status: "todo" },
      { term: "Syarah Hadits", status: "todo" },
      { term: "Ikhtilaf Ulama", status: "todo" },
      { term: "Status Hadits", status: "done" },
      { term: "Referensi Kitab", status: "partial" },
    ],
  },
];

// ── 3. Fitur AI hadits yang disarankan (belum dikerjakan sama sekali) ─────
interface AiIdea {
  title: string;
  desc: string;
}
const AI_HADITH_IDEAS: AiIdea[] = [
  { title: "Perbandingan Penilaian Ulama", desc: "Satu hadits, tampilkan berdampingan penilaian Al-Bukhari, Al-Albani, Ibnu Hajar, dll." },
  { title: "Grafik Jalur Riwayat", desc: "Peta visual jalur periwayatan sebuah hadits melalui berbagai kitab." },
  {
    title: "Filter Otomatis Multi-Kriteria",
    desc: "Saring hadits sekaligus berdasarkan Shahih/Hasan/Dha'if/Maudhu', Mutawatir/Ahad, Marfu'/Mauquf/Maqthu', Mursal/Mu'allaq/Mudallas, dst.",
  },
  { title: "Widget Statistik Derajat", desc: "Jumlah hadits shahih/hasan/dha'if/maudhu' dan distribusinya per kitab — perluasan dari tab Perpustakaan yang sudah ada." },
];

export function BacklogTab() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-accent/40 bg-[var(--color-card)] p-4">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/ulyah-logo-dark.webp"
            alt="Ulyah"
            width={72}
            height={72}
            className="h-10 w-10 shrink-0 rounded-full shadow-sm"
          />
          <p className="font-heading text-lg">🗂️ Rancangan &amp; Backlog — Baca Ini Dulu</p>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          Halaman ini adalah <b>satu-satunya sumber kebenaran</b> untuk status pengerjaan ULYAH.COM. Setiap AI/developer
          yang melanjutkan proyek ini wajib membaca halaman ini dulu sebelum mengerjakan apa pun — supaya tidak
          mengulang riset, tidak menduplikasi kitab/hadits yang sama, dan tahu urutan prioritas yang benar (paling
          penting dulu, seperti diminta pemilik produk). Perbarui status di file ini setiap kali sebuah item selesai.
        </p>
        <div className="mt-3 grid gap-2 rounded-lg bg-black/5 p-3 text-[11px] leading-relaxed sm:grid-cols-2">
          <p>
            <b>Aturan baku #1 — dedup:</b> jika sebuah kitab/hadits yang mau diserap 100% identik (isi sama persis)
            dengan yang sudah ada di database, JANGAN diserap ulang.
          </p>
          <p>
            <b>Aturan baku #2 — konsistensi:</b> setiap konten wajib bisa diterjemah ke 8 bahasa yang didukung, wajib
            bisa dibacakan suara (multi-bahasa sesuai pilihan pembaca), dan wajib bisa diunduh sebagai PDF bila
            berupa kitab/artikel panjang — bukan hanya sebagian.
          </p>
        </div>
      </div>

      {/* ── Sumber terbuka ── */}
      <section>
        <h2 className="font-heading text-base">📚 Sumber Terbuka — Status Serapan per Kategori</h2>
        <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          Berdasarkan ULYAH_Open_Source_Reference_Expanded.txt (edisi awal &amp; Revisi 3) — 130+ repo di 14 kategori.
        </p>
        <div className="mt-3 space-y-2">
          {REFERENCE_CATEGORIES.map((c) => (
            <div key={c.key} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{c.title}</p>
                <Pill status={c.status} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">{c.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Taksonomi hadits ── */}
      <section>
        <h2 className="font-heading text-base">🕌 Sistem Klasifikasi Hadits — Rancangan Taksonomi Lengkap</h2>
        <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          Permintaan eksplisit pemilik produk: seluruh istilah ilmu hadits di bawah ini harus menjadi rancangan resmi.
          Baru bagian "Tingkat Penerimaan" (dasar) dan sebagian kecil "Metadata" yang sudah terpasang (lihat
          <code className="mx-1 rounded bg-black/10 px-1">apps/web/src/lib/hadith-grade.ts</code>) — sisanya (sanad,
          perawi, matan, penggunaan, penilaian ulama) BELUM ADA field-nya sama sekali di skema database. Menambah
          field-field ini butuh migrasi skema baru + sumber data dengan sanad/rawi terisi (lihat AhmedElTabarani/
          dorar-hadith-api di atas) — jangan dikarang, harus dari sumber bersanad nyata.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {HADITH_TAXONOMY.map((g) => (
            <div key={g.group} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <p className="text-xs font-semibold text-primary dark:text-accent">{g.group}</p>
              <ul className="mt-2 space-y-1">
                {g.terms.map((t) => (
                  <li key={t.term} className="flex items-center justify-between gap-2 text-[11px]">
                    <span>
                      {t.term}
                      {t.ar && <span className="ml-1 text-[var(--color-text-secondary)]"> · {t.ar}</span>}
                    </span>
                    <Pill status={t.status} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ide fitur AI hadits ── */}
      <section>
        <h2 className="font-heading text-base">🤖 Fitur AI Hadits yang Disarankan (Belum Dikerjakan)</h2>
        <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          Semua item ini butuh data sanad/rawi/penilaian-ulama terisi dulu (lihat taksonomi di atas) sebelum bisa
          dibangun — urutkan setelah taksonomi metadata sanad tersedia, bukan sebelum.
        </p>
        <p className="mt-2 rounded-lg bg-success/10 p-2 text-[11px] leading-relaxed text-success">
          ✅ <b>Pohon Sanad</b> DAN <b>AI Analisis Sanad</b> (dua ide yang tadinya di sini) sudah dibangun: rantai
          isnad diekstrak deterministik langsung dari teks hadits Bukhari &amp; Muslim yang sudah ada di database
          (tokenisasi kata sambung periwayatan — bukan dari dorar-hadith-api, yang belum diserap), menghasilkan
          10.903 rantai &amp; 7.699 perawi unik. Semuanya berstatus <code>pending_review</code> sampai ditinjau
          manual di tab Sanad admin (ekstraksi heuristik, bukan 100% dijamin akurat) — baru yang{" "}
          <code>published</code> tampil di halaman publik <code>/sanad</code>. Biografi perawi (bio_id/bio_en,
          tahun wafat, tingkat kepercayaan) masih sebagian besar kosong — lihat status &quot;Perawi&quot; &amp;
          &quot;Biografi Perawi&quot; di taksonomi atas, PR selanjutnya bisa mengisi ini secara bertahap.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {AI_HADITH_IDEAS.map((idea) => (
            <div key={idea.title} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <p className="text-sm font-medium text-accent">💡 {idea.title}</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{idea.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Fitur besar di luar 14 kategori sumber terbuka ── */}
      <section>
        <h2 className="font-heading text-base">✨ Fitur Besar Lain yang Sudah Dibangun</h2>
        <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          Tidak masuk salah satu dari 14 kategori sumber terbuka di atas — dicatat terpisah di sini supaya AI
          berikutnya tidak menganggapnya belum ada.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Mushaf Utsmani (/quran/mushaf)</p>
              <Pill status="done" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              604 halaman mushaf dari alquran.cloud (teks Utsmani), animasi balik halaman 3D CSS murni (tanpa
              library), lompat ke surah/juz, audio murottal via player queue yang sudah ada, panel tafsir (spa5k +
              Kemenag/equran.id). Cache 1 tahun via KV per halaman.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Kisah Anak (/kisah-anak)</p>
              <Pill status="partial" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              Storybook animasi karakter (SVG + CSS, boy/girl, 7 aksi) untuk anak, dinarasikan oleh mesin TTS
              browser yang sama dipakai di seluruh situs, caption ID/EN. Baru 3 kisah tayang (Jujur Itu Hebat,
              Sabar Membawa Berkah, Berbagi Itu Indah) — belum ada tab moderasi admin khusus (kisah ditulis manual
              lalu di-seed langsung sebagai <code>published</code>, bukan lewat pipeline AI/review seperti Sanad).
              Tambah kisah baru dengan pola yang sama di <code>packages/db-schema/seed/kids_stories.sql</code>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Catatan untuk AI berikutnya ── */}
      <section className="rounded-xl border border-accent/40 bg-accent/5 p-4">
        <h2 className="font-heading text-base">📝 Catatan untuk AI/Developer Berikutnya — Baca Sebelum Mulai</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          <li>
            <b>Pohon Sanad sudah dibangun</b> (lihat "✨ Fitur Besar Lain" di atas), tapi lewat jalur berbeda dari
            rencana semula: bukan dorar-hadith-api (masih belum diserap), melainkan ekstraksi deterministik
            langsung dari teks Bukhari &amp; Muslim yang SUDAH ada di database (tokenisasi kata sambung
            periwayatan — حدثنا/أخبرنا/عن/سمعت, dll., lihat <code>scripts/extract-sanad-chains.ts</code>). Hasilnya
            10.903 rantai berstatus <code>pending_review</code>, ditinjau bertahap di tab Sanad admin sebelum
            tampil publik. <b>Prioritas berikutnya:</b> (a) isi bio_id/bio_en/tahun-wafat/tingkat-kepercayaan
            perawi yang masih kosong, (b) tinjau &amp; publish antrean pending_review, (c) baru pertimbangkan
            dorar-hadith-api sebagai sumber TAMBAHAN kalau butuh penilaian ulama per-perawi yang lebih kaya —
            jangan re-ekstrak dari nol, field yang sudah ada harus dilengkapi dulu.
          </li>
          <li>
            <b>Kitab pesantren:</b> baru 1 dari ~13 kitab (Aqidatul Awam) yang teksnya LENGKAP (Arab+terjemah utuh per
            bait). Sisanya masih ringkasan. Setiap kitab baru wajib diverifikasi format sumbernya dulu (Arab+terjemah
            berpasangan bersih) sebelum diparse massal — jangan asumsikan semua kitab di satu repo punya struktur
            sama; setiap kitab kuning punya skema HTML sendiri-sendiri (sudah dibuktikan saat mengecek wahyu9kdl/islami:
            9 kitab dites, hanya 1 yang bersih).
          </li>
          <li>
            <b>Kitab Shamela (katalog ~4.9k):</b> ini metadata + terjemah on-demand (bukan teks lengkap) — inkonsistensi
            yang pernah dikeluhkan pemilik produk sebagian besar berasal dari sini karena kualitas terjemah live-MT
            bervariasi per judul. Solusi jangka panjang: prioritaskan menambah kitab BERTEKS LENGKAP dari sumber
            terverifikasi (seperti Aqidatul Awam) daripada terus mengandalkan katalog metadata-saja.
          </li>
          <li>
            <b>Deploy pipeline:</b> import konten (hadits/kisah/kitab bulk) sekarang <code>continue-on-error</code> di
            deploy.yml — kalau satu seed korup, app tetap ke-deploy, tapi CEK LOG tiap deploy karena step itu bisa
            gagal diam-diam. Setiap seed SQL wajib divalidasi lokal dulu (baca dengan Python sqlite3 in-memory) sebelum
            di-commit — pernah ada insiden statement SQL 167KB melebihi batas D1 (SQLITE_TOOBIG) yang membatalkan
            seluruh deploy tanpa disadari sampai user melapor situs tidak update.
          </li>
          <li>
            <b>Radio Qur'an:</b> reciter TIDAK BOLEH bisa dipilih manual di widget Radio Qori Dunia (sengaja dihapus)
            — itu siaran bersama, bukan milik satu pendengar. Kalau ada permintaan "pilih qori" lagi khusus untuk
            radio, konfirmasi dulu ke pemilik produk — ini keputusan eksplisit, bukan bug.
          </li>
          <li>
            <b>Widget Store:</b> tab ini masih katalog arsitektur (data statis), BELUM app terpisah yang benar-benar
            live dengan manifest sendiri-sendiri kecuali Jadwal Sholat. Kalau melanjutkan widget baru (Kiblat, Zakat,
            Kalender Hijriyah), ikuti pola yang sama: manifest dinamis per-locale (lihat
            <code className="mx-1 rounded bg-black/10 px-1">manifest-sholat.webmanifest/route.ts</code>) — bukan file
            statis dengan start_url yang di-hardcode ke satu locale.
          </li>
          <li>
            <b>Fitur yang belum ada sama sekali</b> (urutan disarankan setelah taksonomi hadits): Kamus Arab-Indonesia
            (oong26/arabic_dictionary_model, sumber Al-Munawwir — BUTUH data leksikal nyata dari repo tersebut, bukan
            dikarang; sesi ini belum menyerapnya karena scope GitHub sesi hanya mengizinkan p2nshooter/ulyah.com,
            AI berikutnya dengan akses lebih luas atau file data yang diunggah owner bisa langsung lanjutkan), Masjid
            Finder (butuh data lokasi masjid, sumber eksternal), Tarikh Islam (timeline sejarah — kandidat sumber:
            abdullah-R197/Complete-Islamic-History-Timeline). Zakat, Waris (Faraid), Kalender Hijriyah, Kompas
            Kiblat, dan Imsakiyah Ramadhan SUDAH SELESAI (cakupan umum, lihat Widget Store) — kelimanya sengaja
            dikerjakan lebih dulu karena tidak butuh data eksternal (murni hitungan + data yang sudah ada di
            codebase), sebelum fitur yang butuh dataset dari repo lain.
          </li>
        </ol>
      </section>
    </div>
  );
}
