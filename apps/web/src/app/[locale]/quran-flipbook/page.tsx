import { redirect } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";

// The install-app surfaces were removed sitewide (owner: only the header
// install button remains), which made this page a duplicate of the real
// Mushaf reader — so it now simply redirects there. The route is kept so old
// links, bookmarks, and any previously-installed widget shortcuts keep
// working instead of 404ing.
export default async function QuranFlipbookRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  redirect(`/${locale}/quran/mushaf`);
}
