"use client";

import { useState } from "react";
import type { KidsGamesLabels } from "@/lib/kids-games-labels";
import { hijaiyahMastered, saveProgress, type KidsProgress } from "@/lib/kids-progress";

/**
 * The hijaiyah certificate, awarded once every core game has been cleared at
 * its hardest tier. The child's name and age are typed here and kept ONLY in
 * this device's storage — nothing is sent anywhere, which is the right default
 * for a children's feature. Printable straight from the browser.
 */
export function KidsCertificate({
  t,
  locale,
  progress,
  setProgress,
}: {
  t: KidsGamesLabels;
  locale: string;
  progress: KidsProgress;
  setProgress: (p: KidsProgress) => void;
}) {
  const earned = hijaiyahMastered(progress);
  const [name, setName] = useState(progress.profile.name);
  const [age, setAge] = useState(progress.profile.age?.toString() ?? "");

  function persist(nextName: string, nextAge: string) {
    const p: KidsProgress = {
      ...progress,
      profile: { name: nextName, age: nextAge ? Number(nextAge) : null },
    };
    setProgress(p);
    saveProgress(p);
  }

  const today = new Date().toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });

  if (!earned) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-6 text-center dark:border-slate-600 dark:bg-slate-800/60">
        <p className="text-4xl">🔒</p>
        <p className="mt-2 font-heading text-base font-bold text-slate-700 dark:text-amber-100">{t.certificate}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t.certLocked}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 grid gap-2 sm:grid-cols-2 print:hidden">
        <label className="text-left text-xs font-bold text-slate-600 dark:text-slate-300">
          {t.yourName}
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              persist(e.target.value, age);
            }}
            className="mt-1 w-full rounded-lg border-2 border-amber-200 bg-white px-3 py-2 text-sm font-normal dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label className="text-left text-xs font-bold text-slate-600 dark:text-slate-300">
          {t.yourAge}
          <input
            type="number"
            min={2}
            max={18}
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              persist(name, e.target.value);
            }}
            className="mt-1 w-full rounded-lg border-2 border-amber-200 bg-white px-3 py-2 text-sm font-normal dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
      </div>

      {/* The certificate itself */}
      <div className="kitab-cover rounded-2xl bg-linear-to-br from-amber-50 to-amber-100 p-8 text-center text-[#4a3a12] shadow-lg print:shadow-none">
        <span aria-hidden className="kitab-cover-frame" />
        <p className="text-5xl">🏅</p>
        <p className="mt-3 font-heading text-xl font-extrabold">{t.certTitle}</p>
        <p className="font-arabic mt-1 text-2xl">شَهَادَة</p>

        <p className="mt-6 font-heading text-2xl font-bold">{name || "—"}</p>
        {age && (
          <p className="text-sm">
            {t.yourAge}: {age} {t.years}
          </p>
        )}

        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed">{t.certBody}</p>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs">
          <span>⭐ {progress.xp} XP</span>
          <span>{today}</span>
        </div>
        <p className="mt-3 text-[11px] opacity-70">ulyah.com — Al-Qur&apos;an Kids</p>
      </div>

      <button
        onClick={() => window.print()}
        className="mt-3 w-full rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white print:hidden"
      >
        🖨️ {t.print}
      </button>
    </div>
  );
}
