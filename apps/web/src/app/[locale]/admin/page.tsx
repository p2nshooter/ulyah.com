"use client";

import { use as usePromise, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";
import { KeyPoolTab } from "@/components/admin/KeyPoolTab";
import { ContentTab } from "@/components/admin/ContentTab";
import { DonationsTab } from "@/components/admin/DonationsTab";
import { ProofsTab } from "@/components/admin/ProofsTab";
import { AuditLogTab } from "@/components/admin/AuditLogTab";
import { ClientsTab } from "@/components/admin/ClientsTab";
import { ScalingTab } from "@/components/admin/ScalingTab";
import { AccountTab } from "@/components/admin/AccountTab";
import { AnalyticsTab } from "@/components/admin/AnalyticsTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { MediaTab } from "@/components/admin/MediaTab";
import { RoadmapTab } from "@/components/admin/RoadmapTab";
import { LibraryTab } from "@/components/admin/LibraryTab";
import { AdsenseTab } from "@/components/admin/AdsenseTab";
import { WidgetStoreTab } from "@/components/admin/WidgetStoreTab";
import { LiveStreamsTab } from "@/components/admin/LiveStreamsTab";
import { KaggleGuideTab } from "@/components/admin/KaggleGuideTab";
import { KidsChannelsTab } from "@/components/admin/KidsChannelsTab";
import { HajjTab } from "@/components/admin/HajjTab";
import { MonitorTab } from "@/components/admin/MonitorTab";
import { BacklogTab } from "@/components/admin/BacklogTab";
import { OrchestraTab } from "@/components/admin/OrchestraTab";
import { SanadTab } from "@/components/admin/SanadTab";
import { GrantTab } from "@/components/admin/GrantTab";
import { SitePagesTab } from "@/components/admin/SitePagesTab";
import { AdminAuthModal } from "@/components/AdminTrigger";

type Tab = "dashboard" | "monitor" | "backlog" | "orchestra" | "sanad" | "grant" | "analytics" | "keys" | "content" | "donations" | "proofs" | "log" | "clients" | "scaling" | "account" | "settings" | "media" | "roadmap" | "library" | "adsense" | "widgets" | "live" | "kids" | "kaggle" | "pages" | "hajj";

interface Dashboard {
  keys: { total: number; healthy: number };
  jobs: { queued: number; failed: number };
  donations: { total_this_month: number };
  clients: { total: number };
}

export default function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = usePromise(params);
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const router = useRouter();

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [me, setMe] = useState<{ role?: string; tenant?: string | null; readOnly?: boolean } | null>(null);

  useEffect(() => {
    api
      .get<{ role?: string; tenant?: string | null; readOnly?: boolean }>("/admin/auth/me")
      .then((r) => {
        setMe(r);
        setAuthed(true);
      })
      .catch(() => setAuthed(false));
  }, [locale]);

  useEffect(() => {
    if (authed) api.get<Dashboard>("/admin/dashboard").then(setDashboard).catch(() => {});
  }, [authed]);

  async function logout() {
    await api.post("/admin/auth/logout");
    router.push(`/${locale}`);
  }

  if (authed === null) return null;
  if (authed === false) {
    return (
      <AdminAuthModal locale={locale} standalone onSuccess={() => setAuthed(true)} />
    );
  }

  const tabs: [Tab, string][] = [
    ["dashboard", dict.admin.dashboardTitle],
    ["backlog", "🗂️ Rancangan & Backlog"],
    ["orchestra", "🎻 Orchestra Core"],
    ["sanad", "🔗 Sanad Explorer"],
    ["grant", "🤝 Grant & Donatur"],
    ["monitor", "🖥️ Monitor"],
    ["analytics", "Analytics"],
    ["keys", dict.admin.keyPool],
    ["content", dict.admin.content],
    ["donations", dict.admin.donations],
    ["proofs", dict.cert.sectionTitle],
    ["clients", dict.admin.clients],
    ["scaling", dict.admin.scaling],
    ["log", dict.admin.auditLog],
    ["settings", "Settings"],
    ["media", "Media"],
    ["library", "📚 Perpustakaan"],
    ["adsense", "💰 AdSense"],
    ["widgets", "🧩 Widget Store"],
    ["pages", "🧭 Halaman Situs"],
    ["live", "📡 Live Streaming"],
    ["kids", "🎬 Film Anak"],
    ["hajj", "🕋 Haji & Umroh"],
    ["kaggle", "🎓 Kaggle GPU"],
    ["roadmap", "🗺️ Konsep"],
    ["account", "Account"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/ulyah-logo-light.webp"
            alt="Ulyah"
            width={72}
            height={72}
            className="block h-9 w-9 rounded-full shadow-sm dark:hidden"
          />
          <Image
            src="/brand/ulyah-logo-dark.webp"
            alt="Ulyah"
            width={72}
            height={72}
            className="hidden h-9 w-9 rounded-full shadow-sm dark:block"
          />
          <h1 className="font-heading text-2xl">{dict.admin.dashboardTitle}</h1>
        </div>
        <button onClick={logout} className="text-sm text-danger">
          {dict.admin.logout}
        </button>
      </div>

      {me?.readOnly && (
        <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-600 dark:text-amber-400">
          👁️ Demo (read-only) — you can view everything but changes are disabled.
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-3">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-3 py-1.5 text-xs ${tab === key ? "bg-accent text-white" : "border border-[var(--color-border)]"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && dashboard && (
        <div className="mt-6 grid grid-cols-2 gap-3 desktop:grid-cols-4">
          <Tile label={dict.admin.activeKeys} value={`${dashboard.keys.healthy ?? 0} / ${dashboard.keys.total ?? 0}`} />
          <Tile label={dict.admin.queuedJobs} value={String(dashboard.jobs.queued ?? 0)} />
          <Tile label={dict.admin.monthDonations} value={`$${dashboard.donations.total_this_month ?? 0}`} />
          <Tile label={dict.admin.registeredClients} value={String(dashboard.clients.total ?? 0)} />
        </div>
      )}

      <div className="mt-6">
        {tab === "backlog" && <BacklogTab />}
        {tab === "orchestra" && <OrchestraTab />}
        {tab === "sanad" && <SanadTab />}
        {tab === "grant" && <GrantTab />}
        {tab === "monitor" && <MonitorTab locale={locale} />}
        {tab === "analytics" && <AnalyticsTab />}
        {tab === "keys" && <KeyPoolTab />}
        {tab === "content" && <ContentTab />}
        {tab === "donations" && <DonationsTab />}
        {tab === "proofs" && <ProofsTab />}
        {tab === "clients" && <ClientsTab />}
        {tab === "scaling" && <ScalingTab />}
        {tab === "log" && <AuditLogTab />}
        {tab === "settings" && <SettingsTab />}
        {tab === "media" && <MediaTab />}
        {tab === "library" && <LibraryTab />}
        {tab === "adsense" && <AdsenseTab />}
        {tab === "widgets" && <WidgetStoreTab />}
        {tab === "pages" && <SitePagesTab />}
        {tab === "live" && <LiveStreamsTab />}
        {tab === "kids" && <KidsChannelsTab />}
        {tab === "hajj" && <HajjTab />}
        {tab === "kaggle" && <KaggleGuideTab />}
        {tab === "roadmap" && <RoadmapTab />}
        {tab === "account" && <AccountTab />}
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="font-heading text-xl">{value}</p>
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}
