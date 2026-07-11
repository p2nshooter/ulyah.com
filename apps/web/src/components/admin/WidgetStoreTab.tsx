"use client";

/**
 * "Widget Store" — the single source in the admin portal for every installable
 * ULYAH widget (present and planned). The public landing "widget collection"
 * is meant to render from this same catalogue, and clients will later pick
 * which widget (with which kitab content) to buy. Each widget is designed as a
 * SEPARATE app — its own manifest + install identity — so widgets never need
 * to know whether another widget is installed, and each indexes independently.
 *
 * Deliberately data-driven and self-contained (no backend yet): it captures
 * the architecture — status, what each widget is, its own manifest/scope, its
 * ULYAH identity, its AdSense placement, and the open-source repos it draws
 * from — so the plan lives in the product. Widgets graduate concept →
 * building → live here as they ship.
 */

type Status = "live" | "building" | "concept";

interface Widget {
  key: string;
  emoji: string;
  name: string;
  status: Status;
  route: string;
  manifest: string;
  summary: string;
  adsense: string;
  sources: string[];
}

const STATUS: Record<Status, { label: string; cls: string }> = {
  live: { label: "Sudah live", cls: "border-success/40 bg-success/15 text-success" },
  building: { label: "Sedang dibangun", cls: "border-accent/40 bg-accent/15 text-accent" },
  concept: { label: "Konsep", cls: "border-warning/40 bg-warning/15 text-warning" },
};

const WIDGETS: Widget[] = [
  {
    key: "jadwal-sholat",
    emoji: "🕌",
    name: "Jadwal Sholat & Radio Qori",
    status: "live",
    route: "/id/jadwal-sholat",
    manifest: "manifest-sholat.json (scope /id/jadwal-sholat)",
    summary:
      "Jadwal sholat sesuai lokasi, hitung mundur waktu sholat, jam dunia, Radio Qori Dunia. Installable sebagai app tersendiri.",
    adsense: "AdSlot di bawah widget (aktif setelah ACC).",
    sources: ["metinkale38/prayer-times-android (referensi metode & koreksi waktu)", "mahmoodhamdi/wirdak (dzikir)"],
  },
  {
    key: "quran-digital",
    emoji: "📖",
    name: "Al-Qur'an Digital",
    status: "live",
    route: "/id/quran",
    manifest: "pakai manifest utama",
    summary:
      "Pembaca Al-Qur'an interaktif: terjemah, tafsir (pemilih sumber), asbabun nuzul, murottal per qori, audio berlapis.",
    adsense: "AdSlot di bawah info surah & setelah tiap 10 ayat (sesuai panduan).",
    sources: [
      "quran/quran_android (arsitektur pembaca)",
      "IsmailHosenIsmailJames/al_quran_v3 (data & UI)",
      "spa5k/tafsir_api (tafsir — sudah diserap)",
    ],
  },
  {
    key: "kitab-digital",
    emoji: "📚",
    name: "Kitab Digital (Buku Page-Flip)",
    status: "building",
    route: "/id/kitab-pesantren (reader)",
    manifest: "rencana: manifest-kitab.json (scope /id/kitab-pesantren)",
    summary:
      "Kitab pesantren tampil seperti buku fisik dengan efek balik halaman (page-flip): Arab asli + terjemah + penjelasan, bisa didengarkan. Tiap kitab bisa dijual terpisah.",
    adsense: "AdSlot setelah judul, tiap 25%/50%/75% isi, dan sebelum footer (sesuai panduan Kitab).",
    sources: [
      "Nodlik/StPageFlip (efek balik halaman — web, paling relevan)",
      "bizz84/page_flip_builder, saeedahmed725/turnable_page (referensi animasi)",
      "yshalsager/shamela2epub (konversi kitab Syamela → epub/terstruktur)",
      "bismillah-100/Maktabah (koleksi kitab)",
    ],
  },
  {
    key: "quran-tajwid",
    emoji: "🎨",
    name: "Al-Qur'an Tajwid Berwarna",
    status: "concept",
    route: "rencana: /id/quran/tajwid",
    manifest: "rencana: manifest-tajwid.json",
    summary:
      "Mushaf dengan pewarnaan hukum tajwid (ikhfa, idgham, qalqalah, dll) + audio per ayat, untuk belajar bacaan yang benar.",
    adsense: "AdSlot di bawah mushaf & di bawah panel tajwid.",
    sources: ["rovshan-b/Quran-flutter-tajweed (data pewarnaan tajwid)"],
  },
  {
    key: "qibla",
    emoji: "🧭",
    name: "Arah Kiblat (Kompas)",
    status: "concept",
    route: "rencana: /id/kiblat",
    manifest: "rencana: manifest-kiblat.json",
    summary:
      "Kompas penunjuk arah kiblat berbasis lokasi & sensor perangkat, dengan jarak ke Ka'bah. App ringan tersendiri.",
    adsense: "AdSlot di bawah kompas.",
    sources: ["metinkale38/prayer-times-android (perhitungan arah kiblat)"],
  },
  {
    key: "wirdak",
    emoji: "📿",
    name: "Wirid & Dzikir Harian (Wirdak)",
    status: "concept",
    route: "sebagian sudah di /id/amalan",
    manifest: "rencana: manifest-wirid.json",
    summary:
      "Penghitung tasbih digital + wirid pagi/petang & setelah shalat dengan pengingat. Melengkapi menu Amalan Harian yang sudah ada.",
    adsense: "AdSlot di bawah penghitung.",
    sources: ["mahmoodhamdi/wirdak (struktur wirid & counter)"],
  },
  {
    key: "kids",
    emoji: "🧒",
    name: "Al-Qur'an Kids",
    status: "concept",
    route: "rencana: /id/kids",
    manifest: "rencana: manifest-kids.json",
    summary:
      "Menu anak terpisah: hafalan surat pendek, kisah nabi ramah anak, doa & adab, hijaiyah — video pendek & suara lembut. (Detail di tab Konsep.)",
    adsense: "Halaman anak: iklan disaring family-safe / idealnya bebas iklan.",
    sources: ["maulanashalihin/quran-stories", "AzharRivaldi/Kisah-25-Nabi"],
  },
];

const REFERENCE_REPOS: { url: string; use: string }[] = [
  { url: "yshalsager/shamela2epub", use: "Konversi kitab Syamela → epub terstruktur (bahan Kitab Digital)" },
  { url: "mhashim6/Open-Hadith-Data", use: "Dataset hadits terbuka (pelengkap koleksi hadits)" },
  { url: "mahmoodhamdi/wirdak", use: "Struktur wirid & penghitung dzikir (widget Wirdak)" },
  { url: "metinkale38/prayer-times-android", use: "Metode perhitungan waktu sholat & arah kiblat" },
  { url: "Nodlik/StPageFlip", use: "Efek balik halaman untuk web (Kitab Digital page-flip)" },
  { url: "bizz84/page_flip_builder", use: "Referensi animasi page-flip (Flutter)" },
  { url: "saeedahmed725/turnable_page", use: "Referensi animasi halaman buku" },
  { url: "Roaa94/flutter_airbnb_ui", use: "Referensi UI/UX halus & elegan" },
  { url: "quran/quran_android", use: "Arsitektur pembaca Al-Qur'an matang" },
  { url: "IsmailHosenIsmailJames/al_quran_v3", use: "Data & UI Al-Qur'an" },
  { url: "rovshan-b/Quran-flutter-tajweed", use: "Data pewarnaan tajwid (widget Tajwid)" },
  { url: "bismillah-100/Maktabah", use: "Koleksi kitab (bahan perpustakaan)" },
];

export function WidgetStoreTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="font-heading text-lg">🧩 Widget Store — Sumber Tunggal</p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Semua widget (yang sudah live &amp; yang akan datang) terdaftar di sini. Landing "koleksi widget" nanti
          tampil dari daftar ini. Tiap widget dirancang sebagai <b>app terpisah</b> (manifest &amp; identitas install
          sendiri) — jadi tidak perlu saling tahu apakah widget lain sudah dipasang, dan masing-masing terindeks
          sendiri. Semua beridentitas ulyah.com &amp; memuat AdSense.
        </p>
      </div>

      {WIDGETS.map((w) => (
        <div key={w.key} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-heading text-lg">
              {w.emoji} {w.name}
            </p>
            <span className={`rounded-full border px-3 py-1 text-[11px] font-medium ${STATUS[w.status].cls}`}>
              {STATUS[w.status].label}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{w.summary}</p>
          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            <p>
              <span className="font-semibold text-primary dark:text-accent">Rute:</span>{" "}
              <code className="rounded bg-black/10 px-1">{w.route}</code>
            </p>
            <p>
              <span className="font-semibold text-primary dark:text-accent">Manifest:</span> {w.manifest}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-primary dark:text-accent">AdSense:</span> {w.adsense}
            </p>
          </div>
          <div className="mt-2">
            <p className="text-[11px] font-semibold text-primary dark:text-accent">Sumber / referensi:</p>
            <ul className="mt-1 space-y-0.5">
              {w.sources.map((s) => (
                <li key={s} className="text-[11px] text-[var(--color-text-secondary)]">
                  • {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <p className="font-heading text-base">📦 Repo referensi (arsitektur)</p>
        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          Bahan open-source yang dipelajari untuk membangun widget. Konten kitab tetap disaring sesuai
          docs/CONTENT-POLICY.md; UI diberi identitas ulyah.com agar tidak mirip aslinya.
        </p>
        <div className="mt-3 space-y-1.5">
          {REFERENCE_REPOS.map((r) => (
            <div key={r.url} className="text-xs">
              <code className="rounded bg-black/10 px-1 text-accent">{r.url}</code>{" "}
              <span className="text-[var(--color-text-secondary)]">— {r.use}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
