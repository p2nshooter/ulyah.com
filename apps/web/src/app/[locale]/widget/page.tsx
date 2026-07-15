import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";

interface WidgetCard {
  emoji: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  href: string;
}

const WIDGETS: WidgetCard[] = [
  {
    emoji: "📖",
    titleId: "Al-Qur'an Flipbook",
    titleEn: "Qur'an Flipbook",
    descId: "Mushaf yang bisa dibalik halamannya seperti buku asli, langsung di browser.",
    descEn: "A page-turning Mushaf you can read right in the browser.",
    href: "quran-flipbook",
  },
  {
    emoji: "📻",
    titleId: "Radio Qur'an Dunia",
    titleEn: "World Qur'an Radio",
    descId: "Al-Qur'an dibacakan tanpa henti 24 jam oleh para qori dunia.",
    descEn: "The Qur'an recited nonstop, 24 hours a day, by reciters from around the world.",
    href: "radio",
  },
  {
    emoji: "🕌",
    titleId: "Jadwal Sholat & Radio",
    titleEn: "Prayer Times & Radio",
    descId: "Jadwal sholat sesuai lokasi Anda, plus Radio Qori Dunia yang selalu hidup.",
    descEn: "Prayer times for your location, plus the always-on World Qur'an Radio.",
    href: "jadwal-sholat",
  },
  {
    emoji: "🧒",
    titleId: "Kisah Anak Muslim",
    titleEn: "Muslim Kids' Stories",
    descId: "Kisah pendek berurutan untuk anak, aman ditonton, tanpa gambar yang dilarang.",
    descEn: "Short, sequential stories for children — safe to watch, no prohibited imagery.",
    href: "anak",
  },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const title = locale === "id" ? "Widget Store — ULYAH.COM" : "Widget Store — ULYAH.COM";
  const description =
    locale === "id"
      ? "Semua widget ULYAH.COM yang bisa dipasang mandiri di layar utama HP Anda — Qur'an, Radio, Jadwal Sholat, dan lainnya."
      : "Every installable ULYAH.COM widget in one place — Qur'an, Radio, Prayer Times, and more.";
  return { title, description, alternates: { canonical: `/${locale}/widget` } };
}

export default async function WidgetHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const isId = locale === "id";

  return (
    <div className="relative overflow-hidden px-4 py-14 sm:px-6">
      {/* Soft decorative geometric Islamic pattern glow — no figurative imagery */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgba(184,137,43,0.9), transparent 45%), radial-gradient(circle at 85% 30%, rgba(11,61,46,0.9), transparent 50%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-4xl">🕌 ✨ 🕋</p>
          <h1 className="mt-3 font-heading text-3xl sm:text-4xl">{isId ? "Widget Store ULYAH" : "ULYAH Widget Store"}</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-text-secondary)]">
            {isId
              ? "Setiap widget bisa dipasang mandiri ke layar utama HP Anda — seperti aplikasi sendiri, terpisah dari yang lain."
              : "Every widget installs independently to your home screen — like its own app, separate from the rest."}
          </p>
        </div>

        <div className="mt-6">
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {WIDGETS.map((w, i) => (
            <Link
              key={w.href}
              href={`/${locale}/${w.href}`}
              className="group relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-br from-[#06251b] to-[#0B3D2E] p-6 text-[#f4efe3] shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-accent/10 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100"
              />
              <span className="text-4xl transition duration-300 group-hover:scale-110">{w.emoji}</span>
              <p className="mt-3 font-heading text-lg">{isId ? w.titleId : w.titleEn}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#f4efe3]/70">{isId ? w.descId : w.descEn}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent">
                {isId ? "Buka & pasang" : "Open & install"}
                <span className="transition group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10">
        </div>
      </div>
    </div>
  );
}
