"use client";

import { Suspense, use as usePromise } from "react";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { PaypalCaptureStatus } from "@/components/PaypalCaptureStatus";

export default function ThankYouPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = usePromise(params);
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <div className="text-5xl">🤲</div>
      <h1 className="mt-4 font-heading text-2xl">{dict.donation.thankYouTitle}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{dict.donation.thankYouDesc}</p>
      <Suspense fallback={null}>
        <PaypalCaptureStatus dict={dict} />
      </Suspense>
      <Link href={`/${locale}`} className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm text-white dark:bg-accent dark:text-primary">
        {dict.common.back}
      </Link>
    </div>
  );
}
