"use client";

import { use as usePromise, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";
import { TENANT, tenantTagline } from "@/lib/tenant";

interface Certificate {
  id: number;
  sender_name: string;
  amount: number | null;
  currency: string | null;
  method: string;
  cert_no: string;
  reviewed_at: string | null;
  created_at: string;
}

export default function CertificatePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: raw, id } = usePromise(params);
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const c = dict.cert;
  const router = useRouter();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get<{ certificate: Certificate }>(`/client/certificate/${id}`)
      .then((r) => setCert(r.certificate))
      .catch(() => setError(true));
  }, [id]);

  if (error)
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">{c.registerFirst}</p>
        <button onClick={() => router.push(`/${locale}/akun`)} className="mt-4 text-sm text-accent">
          ← {dict.auth.myDashboard}
        </button>
      </div>
    );
  if (!cert) return <div className="px-6 py-20 text-center text-sm">{dict.common.loading}</div>;

  const dateStr = new Date(cert.reviewed_at ?? cert.created_at).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-[var(--color-surface)] px-4 py-10 dark:bg-black/40 sm:px-6 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl">
        {/* toolbar — hidden when printing */}
        <div className="mb-4 flex items-center justify-between print:hidden">
          <button onClick={() => router.push(`/${locale}/akun`)} className="text-sm text-[var(--color-text-secondary)]">
            ← {dict.auth.myDashboard}
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-primary"
          >
            ⬇ {c.printButton}
          </button>
        </div>
        <p className="mb-4 text-center text-xs text-[var(--color-text-secondary)] print:hidden">{c.printHint}</p>

        {/* The certificate */}
        <article className="certificate relative overflow-hidden rounded-none bg-[#fbf7ee] p-10 text-center text-[#232323] shadow-2xl sm:p-14 print:shadow-none">
          <div className="pointer-events-none absolute inset-3 rounded-sm border-[3px] border-double border-[#C9A84C]" />
          <div className="pointer-events-none absolute inset-5 rounded-sm border border-[#C9A84C]/50" />

          <div className="relative">
            <p className="font-arabic text-3xl text-[#0B3D2E]">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
            <p className="mt-6 font-heading text-2xl uppercase tracking-[0.2em] text-[#C9A84C]">{TENANT.siteName}</p>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#0B3D2E]/60">{tenantTagline(locale, "Listen to Islam")}</p>

            <h1 className="mt-8 font-heading text-3xl text-[#0B3D2E] sm:text-4xl">{c.certTitle}</h1>
            <p className="mt-6 text-sm text-[#232323]/70">{c.certPresentedTo}</p>
            <p className="mt-2 font-heading text-2xl text-[#0B3D2E] sm:text-3xl">{cert.sender_name}</p>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[#232323]/80">{c.certBody}</p>

            <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3 text-xs">
              {cert.amount != null && (
                <div>
                  <p className="text-[#232323]/50">{c.certAmountLabel}</p>
                  <p className="mt-0.5 font-semibold text-[#0B3D2E]">
                    {cert.amount} {cert.currency ?? ""}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[#232323]/50">{c.certDateLabel}</p>
                <p className="mt-0.5 font-semibold text-[#0B3D2E]">{dateStr}</p>
              </div>
              <div>
                <p className="text-[#232323]/50">{c.certNoLabel}</p>
                <p className="mt-0.5 font-semibold text-[#0B3D2E]">{cert.cert_no}</p>
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-xl border-t border-[#C9A84C]/40 pt-6 text-xs italic leading-relaxed text-[#0B3D2E]/80">
              {c.certDua}
            </p>

            <p className="mt-8 text-[11px] uppercase tracking-widest text-[#232323]/50">{c.certIssuedBy}</p>
          </div>
        </article>
      </div>

      <style jsx global>{`
        @media print {
          header,
          footer,
          nav {
            display: none !important;
          }
          .certificate {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
