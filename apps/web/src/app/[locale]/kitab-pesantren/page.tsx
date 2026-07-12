import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { AdSlot } from "@/components/AdSlot";

// Revalidate periodically so newly-imported kitab appear without a redeploy,
// while still serving a cached page most of the time.
export const revalidate = 300;

interface Category {
  slug: string;
  name_id: string;
  name_ar: string | null;
  icon: string | null;
  kitab_count: number;
}
interface Kitab {
  slug: string;
  category_slug: string;
  title_ar: string;
  title_id: string;
  author: string | null;
  author_death_year: string | null;
  description_id: string | null;
  bab_count: number;
}

export function generateMetadata(): Metadata {
  return {
    title: "Kitab Pesantren — Perpustakaan Digital · ULYAH.COM",
    description:
      "Kitab klasik pesantren tersusun rapi per bidang: fiqih, akidah, akhlak, nahwu-shorof. Lengkap dengan nama pengarang, bab per bab, teks Arab, terjemah, dan penjelasan.",
  };
}

export default async function KitabPesantrenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;

  let categories: Category[] = [];
  let kitab: Kitab[] = [];
  try {
    const [cRes, kRes] = await Promise.all([
      api.get<{ categories: Category[] }>("/content/pesantren/categories"),
      api.get<{ kitab: Kitab[] }>("/content/pesantren/kitab"),
    ]);
    categories = cRes.categories;
    kitab = kRes.kitab;
  } catch {
    categories = [];
    kitab = [];
  }

  const total = kitab.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <PageHero
        icon="🏫"
        title="Kitab Pesantren"
        subtitle={
          total > 0
            ? `Perpustakaan digital kitab kuning — tersusun rapi per bidang, lengkap pengarang & bab. ${total} kitab.`
            : "Perpustakaan digital kitab kuning — tersusun rapi per bidang, lengkap pengarang & bab."
        }
      />

      <div className="mt-6">
        <AdSlot minHeight={110} format="horizontal" />
      </div>

      {categories.length === 0 && (
        <p className="mt-10 text-center text-sm text-[var(--color-text-secondary)]">
          Koleksi sedang disiapkan, coba muat ulang sebentar lagi.
        </p>
      )}

      {categories.map((cat) => {
        const inCat = kitab.filter((k) => k.category_slug === cat.slug);
        if (inCat.length === 0) return null;
        return (
          <section key={cat.slug} className="mt-12">
            <div className="flex items-baseline justify-between gap-3 border-b border-accent/20 pb-2">
              <h2 className="font-heading text-xl">
                <span className="mr-2">{cat.icon ?? "📗"}</span>
                {cat.name_id}
              </h2>
              {cat.name_ar && (
                <span dir="rtl" className="font-arabic text-sm text-[var(--color-text-secondary)]">
                  {cat.name_ar}
                </span>
              )}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 desktop:grid-cols-3">
              {inCat.map((k) => (
                <Link
                  key={k.slug}
                  href={`/${locale}/kitab-pesantren/${k.slug}`}
                  className="card-premium flex flex-col p-5"
                >
                  <p dir="rtl" className="font-arabic text-lg leading-tight text-primary dark:text-accent">
                    {k.title_ar}
                  </p>
                  <p className="mt-1 font-heading text-base">{k.title_id}</p>
                  {k.author && (
                    <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
                      ✍️ {k.author}
                      {k.author_death_year ? ` (w. ${k.author_death_year})` : ""}
                    </p>
                  )}
                  {k.description_id && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                      {k.description_id}
                    </p>
                  )}
                  <p className="mt-auto pt-3 text-xs font-medium text-accent">
                    {k.bab_count} bab →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-12 text-center text-xs text-[var(--color-text-secondary)]">
        Teks dikutip dari matan kitab klasik. Terjemah &amp; penjelasan disusun ringkas untuk memudahkan santri dan
        pembaca umum.
      </p>
    </div>
  );
}
