import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api, ebookDownloadUrl } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { AdSlot } from "@/components/AdSlot";

interface EbookRow {
  id: number;
  title: string;
  author: string | null;
  license_status: string;
}

export default async function KitabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  let ebooks: EbookRow[] = [];
  try {
    const res = await api.get<{ ebooks: EbookRow[] }>("/content/ebooks");
    ebooks = res.ebooks;
  } catch {
    ebooks = [];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <PageHero icon="📗" title={dict.explore.kitab.title} subtitle={dict.explore.kitab.desc} />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {ebooks.length === 0 && (
          <p className="col-span-2 text-center text-sm text-[var(--color-text-secondary)]">{dict.reader.noContentYet}</p>
        )}
        {ebooks.map((e, i) => (
          <div key={e.id} className={i === 3 && ebooks.length > 4 ? "sm:col-span-2" : ""}>
            {i === 3 && ebooks.length > 4 && <AdSlot minHeight={100} className="mb-4" />}
            <a
              href={ebookDownloadUrl(e.id)}
              className="card-premium relative flex items-start gap-4 overflow-hidden p-5"
            >
              <span className="grid h-14 w-11 shrink-0 place-items-center rounded-sm border border-accent/30 bg-gradient-to-b from-accent/15 to-accent/5 text-lg">
                📖
              </span>
              <div className="min-w-0">
                <p className="font-heading text-base leading-snug">{e.title}</p>
                {e.author && <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{e.author}</p>}
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent">⬇ PDF</p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
