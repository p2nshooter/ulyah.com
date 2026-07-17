"use client";

/**
 * "Konsep & Rencana" — an admin-only roadmap board for features that are
 * designed but not yet built, so the plan lives inside the product rather
 * than in a chat log. First resident: Al-Qur'an Kids, which the site owner
 * asked to scope as a concept first (a fully separate section + its own
 * widget, with kid-friendly video content) before any implementation.
 *
 * Deliberately static/no-backend: this is a planning surface, not live data.
 * When a concept graduates to "in build", its card moves to `status: building`
 * and the real feature work begins in its own PR.
 */

type Status = "concept" | "building" | "shipped";

interface Concept {
  key: string;
  emoji: string;
  title: string;
  status: Status;
  audience: string;
  summary: string;
  separateMenu: string;
  widget: string;
  sources: { label: string; note: string }[];
  contentPlan: string[];
  safety: string[];
}

const CONCEPTS: Concept[] = [
  {
    key: "alquran-kids",
    emoji: "🧒",
    title: "Al-Qur'an Kids",
    status: "concept",
    audience: "Anak-anak & keluarga muslim (usia 3–12)",
    summary:
      "Menu terpisah khusus anak: hafalan surat-surat pendek, kisah nabi versi ramah anak, adab & doa harian, dan huruf hijaiyah — semuanya dengan video pendek, suara lembut, dan visual cerah. Bukan bagian dari reader dewasa; punya beranda, warna, dan navigasi sendiri agar aman & fokus untuk anak.",
    separateMenu:
      "Rute /kids terpisah (bukan sub-menu Qur'an dewasa). Beranda sendiri, tema warna cerah, ikon besar, tanpa iklan yang tidak sesuai untuk anak, tanpa tombol yang membawa keluar ke konten dewasa tanpa konfirmasi.",
    widget:
      "Widget 'Al-Qur'an Kids' yang bisa dipasang sebagai app tersendiri (manifest sendiri, seperti Jadwal Sholat) — memutar video/audio hafalan surat pendek berurutan (An-Nas → Al-Falaq → …) dengan mode ulang-ulang untuk menghafal, mirip Radio Qori tapi untuk anak.",
    sources: [
      { label: "maulanashalihin/quran-stories", note: "Kisah-kisah Al-Qur'an naratif — bahan cerita ramah anak" },
      { label: "AzharRivaldi/Kisah-25-Nabi", note: "Struktur 25 nabi — sudah punya taksonomi 'Kisah Para Nabi' di sini" },
      { label: "elthobhy-studio/islamic-story-android", note: "Kumpulan cerita Islami — referensi alur & pemilihan kisah" },
      { label: "h9-tec/uloom-quran", note: "Ilmu Al-Qur'an dasar — disederhanakan jadi materi anak" },
      { label: "Surat pendek Juz 30", note: "Audio murottal sudah ada di CDN qori (qori-cdn.ts) — dipakai ulang" },
      { label: "Doa & adab harian", note: "Dataset doa harian pilihan (makan, tidur, dll.) — kurasi manual" },
    ],
    contentPlan: [
      "Modul 1 — Hafalan Juz 30: An-Nas s/d An-Naba, tiap surat = 1 kartu video + audio ulang-ulang + arti sederhana.",
      "Modul 2 — Kisah 25 Nabi versi anak: 1 kisah = 1 video pendek (2–4 menit), bahasa sederhana, hikmah 1 kalimat.",
      "Modul 3 — Adab & Doa harian: doa sebelum makan/tidur/masuk kamar mandi, dengan gerakan & suara.",
      "Modul 4 — Hijaiyah: kenal huruf ا ب ت … dengan bunyi & contoh kata, mode kuis ringan.",
      "Modul 5 — Akhlak mulia: jujur, sayang orang tua, berbagi — lewat cerita pendek.",
    ],
    safety: [
      "Konten hanya dari sumber tervalidasi (lihat docs/CONTENT-POLICY.md) — tidak ada fabrikasi ayat/hadits.",
      "Tanpa komentar publik / input bebas dari anak.",
      "Video dibuat internal (bukan embed YouTube acak) agar tidak ada rekomendasi keluar yang tak terkontrol.",
      "Iklan (bila aktif) disaring family-safe; idealnya halaman /kids bebas iklan.",
    ],
  },
];

const STATUS_STYLE: Record<Status, string> = {
  concept: "bg-warning/15 text-warning border-warning/30",
  building: "bg-accent/15 text-accent border-accent/30",
  shipped: "bg-success/15 text-success border-success/30",
};

const STATUS_LABEL: Record<Status, string> = {
  concept: "Konsep — akan datang",
  building: "Sedang dibangun",
  shipped: "Sudah rilis",
};

export function RoadmapTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="font-heading text-lg">🗺️ Konsep & Fitur yang Akan Datang</p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Papan rencana internal. Setiap kartu adalah fitur yang sudah dirancang tetapi belum dibangun — supaya rencananya
          tersimpan di dalam produk, bukan hanya di percakapan. Saat sebuah konsep siap dikerjakan, statusnya berubah jadi
          "Sedang dibangun".
        </p>
      </div>

      {CONCEPTS.map((c) => (
        <div key={c.key} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-heading text-xl">
              {c.emoji} {c.title}
            </p>
            <span className={`rounded-full border px-3 py-1 text-[11px] font-medium ${STATUS_STYLE[c.status]}`}>
              {STATUS_LABEL[c.status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-accent">{c.audience}</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{c.summary}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--color-border)] p-3">
              <p className="text-xs font-semibold text-primary dark:text-accent">📂 Menu terpisah</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{c.separateMenu}</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] p-3">
              <p className="text-xs font-semibold text-primary dark:text-accent">🧩 Widget khusus</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{c.widget}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-primary dark:text-accent">📚 Sumber database (untuk diserap)</p>
            <ul className="mt-2 space-y-1">
              {c.sources.map((s) => (
                <li key={s.label} className="text-xs text-[var(--color-text-secondary)]">
                  <code className="rounded bg-black/10 px-1">{s.label}</code> — {s.note}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-primary dark:text-accent">🎬 Rencana konten & video</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              {c.contentPlan.map((p, i) => (
                <li key={i} className="text-xs text-[var(--color-text-secondary)]">
                  {p}
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-primary dark:text-accent">🛡️ Prinsip keamanan konten anak</p>
            <ul className="mt-2 space-y-1">
              {c.safety.map((s, i) => (
                <li key={i} className="text-xs text-[var(--color-text-secondary)]">
                  • {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
