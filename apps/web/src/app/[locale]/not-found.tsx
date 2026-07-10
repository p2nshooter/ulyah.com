import Link from "next/link";

// Rendered inside the locale layout, so a 404 still carries the global
// <head> (AdSense meta + loader, canonical base) and the site chrome —
// satisfying "every crawlable page, including error pages" for AdSense.
// not-found.tsx receives no params in Next's App Router, so the copy is
// kept locale-neutral (Indonesian + English) and links back to the root.
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="font-heading text-6xl text-accent">404</p>
      <h1 className="mt-4 font-heading text-2xl">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Maaf, halaman yang Anda cari tidak ada. · Sorry, the page you’re looking for doesn’t exist.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white dark:bg-accent dark:text-primary"
      >
        ← Beranda / Home
      </Link>
    </div>
  );
}
