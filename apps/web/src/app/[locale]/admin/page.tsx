"use client";

import { use as usePromise, useEffect, useState } from "react";
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
import { AdminAuthModal } from "@/components/AdminTrigger";

type Tab = "dashboard" | "analytics" | "keys" | "content" | "donations" | "proofs" | "log" | "clients" | "scaling" | "account" | "settings" | "media" | "roadmap" | "library" | "adsense" | "widgets";

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

  useEffect(() => {
    api
      .get("/admin/auth/me")
      .then(() => setAuthed(true))
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
    ["roadmap", "🗺️ Konsep"],
    ["account", "Account"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">{dict.admin.dashboardTitle}</h1>
        <button onClick={logout} className="text-sm text-danger">
          {dict.admin.logout}
        </button>
      </div>

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
