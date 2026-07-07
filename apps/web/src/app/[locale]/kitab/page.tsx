import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api, ebookDownloadUrl } from "@/lib/api";

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
      <h1 className="font-heading text-3xl">{dict.explore.kitab.title}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{dict.explore.kitab.desc}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {ebooks.length === 0 && <p className="text-sm text-[var(--color-text-secondary)]">{dict.reader.noContentYet}</p>}
        {ebooks.map((e) => (
          <a
            key={e.id}
            href={ebookDownloadUrl(e.id)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 hover:border-accent"
          >
            <p className="font-heading text-base">{e.title}</p>
            {e.author && <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{e.author}</p>}
            <p className="mt-2 text-xs font-medium text-accent">📄 PDF</p>
          </a>
        ))}
      </div>
    </div>
  );
}
