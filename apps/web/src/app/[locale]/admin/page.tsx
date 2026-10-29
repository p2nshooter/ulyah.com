"use client";

import { use as usePromise, useCallback, useEffect, useState } from "react";
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
import { NetworkTraffic } from "@/components/admin/NetworkTraffic";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { MediaTab } from "@/components/admin/MediaTab";
import { RoadmapTab } from "@/components/admin/RoadmapTab";
import { LibraryTab } from "@/components/admin/LibraryTab";
import { WidgetStoreTab } from "@/components/admin/WidgetStoreTab";
import { StoreTab } from "@/components/admin/StoreTab";
import { LiveStreamsTab } from "@/components/admin/LiveStreamsTab";
import { KaggleGuideTab } from "@/components/admin/KaggleGuideTab";
import { KidsChannelsTab } from "@/components/admin/KidsChannelsTab";
import { KidsAudioTab } from "@/components/admin/KidsAudioTab";
import { HajjTab } from "@/components/admin/HajjTab";
import { SaleTab } from "@/components/admin/SaleTab";
import { TENANT } from "@/lib/tenant";
import { MonitorTab } from "@/components/admin/MonitorTab";
import { BacklogTab } from "@/components/admin/BacklogTab";
import { OrchestraTab } from "@/components/admin/OrchestraTab";
import { SanadTab } from "@/components/admin/SanadTab";
import { GrantTab } from "@/components/admin/GrantTab";
import { SitePagesTab } from "@/components/admin/SitePagesTab";
import { LanguagesTab } from "@/components/admin/LanguagesTab";
import { AdOpsTab } from "@/components/admin/AdOpsTab";
import { PromoHub } from "@/components/admin/PromoHub";
import { YoutubePromoTab } from "@/components/admin/YoutubePromoTab";
import { KidsYoutubeTab } from "@/components/admin/KidsYoutubeTab";
import { SitePicker } from "@/components/admin/SitePicker";
import { adminWords } from "@/lib/admin-i18n";
import { toAdminSites, type AdminSite } from "@/lib/admin-sites";
import { routePath } from "@/lib/paths";
import { AdminAuthModal } from "@/components/AdminTrigger";

type Tab = "promo" | "youtube" | "kids-youtube" | "dashboard" | "monitor" | "backlog" | "orchestra" | "sanad" | "grant" | "analytics" | "adops" | "traffic-ext" | "keys" | "content" | "donations" | "proofs" | "log" | "clients" | "scaling" | "account" | "settings" | "media" | "roadmap" | "library" | "widgets" | "live" | "kids" | "kids-audio" | "kaggle" | "pages" | "hajj" | "languages" | "store" | "sale";

interface Dashboard {
  keys: { total: number; healthy: number };
  jobs: { queued: number; failed: number };
  donations: { total_this_month: number };
  clients: { total: number };
}

interface Me { role?: string; tenant?: string | null; readOnly?: boolean; site?: string; siteName?: string; domain?: string }

/**
 * The admin portal of every site (docs/ADSENSE-BLUEPRINT.md §18): branded with the site it
 * belongs to, opening on Promotions — Hajj & Umrah, YouTube promos, kids' YouTube — in the
 * site's own language. Who sees what:
 *  - the ulyah owner (tenant null): everything, for any site (the site picker; §18.4);
 *  - a site's own admin: its promotions, its pages and its account;
 *  - a demo login (shown to buyers): the same promotion pages, read-only.
 * The API enforces the same split (worker-api lib/auth-middleware.ts).
 */
export default function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = usePromise(params);
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = adminWords(locale);
  const router = useRouter();

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("promo");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [siteId, setSiteId] = useState("");

  const loadMe = useCallback(() => {
    api
      .get<Me>("/admin/auth/me")
      .then((r) => {
        setMe(r);
        setSiteId((cur) => cur || (typeof r?.site === "string" ? r.site : TENANT.id));
        setAuthed(true);
      })
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe, locale]);

  const owner = !!me && !me.tenant && !me.readOnly;

  useEffect(() => {
    if (!authed) return;
    api.get<{ sites?: unknown }>("/admin/promo").then((r) => setSites(toAdminSites(r?.sites))).catch(() => {});
    if (owner) api.get<Dashboard>("/admin/dashboard").then(setDashboard).catch(() => {});
  }, [authed, owner]);

  async function logout() {
    await api.post("/admin/auth/logout").catch(() => {});
    router.push(routePath(locale, "/"));
  }

  if (authed === null) return null;
  if (authed === false) {
    // After signing in, read who this is (role, site) before showing anything.
    return <AdminAuthModal locale={locale} standalone onSuccess={loadMe} />;
  }

  const site: AdminSite =
    sites.find((s) => s.id === siteId) ?? {
      id: siteId || TENANT.id,
      domain: me?.domain ?? TENANT.siteUrl.replace(/^https?:\/\//, ""),
      name: me?.siteName ?? TENANT.siteName,
      lang: locale,
    };
  const readOnly = !!me?.readOnly;
  const siteAdmin = !!me?.tenant && !readOnly;

  const groups: { key: string; label: string; tabs: [Tab, string][] }[] = [
    { key: "promo", label: t.groups.promo, tabs: [["promo", `✨ ${t.tabs.promo}`], ["hajj", `🕋 ${t.tabs.hajj}`], ["youtube", `📺 ${t.tabs.youtube}`], ["kids-youtube", `🧒 ${t.tabs.kids}`]] },
    {
      key: "site",
      label: t.groups.site,
      tabs: owner
        ? [["pages", `🧭 ${t.tabs.pages}`], ["live", "📡 Kanal live dunia"], ["kids", "🎬 Film anak (daftar bersama)"], ["kids-audio", "🔊 Al-Qur'an Kids"], ["media", "🖼️ Media"], ["library", "📚 Perpustakaan"], ["widgets", "🧩 Widget Store"], ["store", "🛒 Toko Amazon"]]
        : [["pages", `🧭 ${t.tabs.pages}`], ...(siteAdmin ? ([["account", `👤 ${t.tabs.account}`]] as [Tab, string][]) : [])],
    },
    ...(owner
      ? [
          {
            key: "business",
            label: t.groups.business,
            tabs: [
              ["dashboard", `📊 ${dict.admin.dashboardTitle}`], ["sale", "🏷️ Situs Dijual"], ["analytics", "📈 Analytics"], ["adops", "💹 Ad Manager"],
              ["traffic-ext", "🌍 Trafik Luar Ekosistem"], ["donations", `🤲 ${dict.admin.donations}`], ["proofs", `📜 ${dict.cert.sectionTitle}`],
              ["grant", "🤝 Grant & Donatur"], ["clients", `👥 ${dict.admin.clients}`],
            ] as [Tab, string][],
          },
          {
            key: "system",
            label: t.groups.system,
            tabs: [
              ["keys", `🔑 ${dict.admin.keyPool}`], ["content", `📝 ${dict.admin.content}`], ["orchestra", "🎻 Orchestra Core"], ["backlog", "🗂️ Rancangan & Backlog"],
              ["sanad", "🔗 Sanad Explorer"], ["monitor", "🖥️ Monitor"], ["scaling", `⚙️ ${dict.admin.scaling}`], ["languages", "🈯 Kesiapan Bahasa"],
              ["kaggle", "🎓 Kaggle GPU"], ["roadmap", "🗺️ Konsep"], ["log", `🧾 ${dict.admin.auditLog}`], ["settings", "🛠️ Settings"], ["account", `👤 ${t.tabs.account}`],
            ] as [Tab, string][],
          },
        ]
      : []),
  ];
  const promoTab = tab === "promo" || tab === "hajj" || tab === "youtube" || tab === "kids-youtube";
  const roleLabel = readOnly ? t.role.demo : me?.role === "owner" || owner ? t.role.owner : t.role.admin;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" data-testid="admin-portal">
      {/* A <section>, not a <header>: every sibling theme styles `header` as the site header (styles/themes/*.css). */}
      <section aria-label={t.portal} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-primary px-5 py-4 text-[#f4efe3] shadow-lg sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Image src={TENANT.logoIcon} alt="" width={96} height={96} className="h-11 w-11 shrink-0 rounded-2xl bg-white/10 object-contain p-1" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-(--color-accent-light)">{t.portal}</p>
            <h1 className="truncate font-heading text-xl leading-tight sm:text-2xl" data-testid="admin-site-name">
              {site.name} <span className="text-sm font-normal text-[#f4efe3]/70">· {site.domain}</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${readOnly ? "bg-amber-400/20 text-amber-200" : "bg-accent/25 text-(--color-accent-xl)"}`} data-testid="admin-role">{roleLabel}</span>
          <button type="button" onClick={logout} className="rounded-full border border-[#f4efe3]/30 px-4 py-1.5 text-sm transition hover:border-accent">{t.logout}</button>
        </div>
      </section>

      {readOnly && (
        <p className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300" data-testid="admin-demo-banner">
          👁️ {t.demoBanner}
        </p>
      )}

      <div className="mt-6 grid gap-6 desktop:grid-cols-[230px_minmax(0,1fr)] desktop:gap-8">
        <nav aria-label={t.menu} className="desktop:sticky desktop:top-24 desktop:self-start">
          <div className="space-y-4 rounded-3xl border border-(--color-border) p-4">
            {groups.map((g) => (
              <div key={g.key}>
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">{g.label}</p>
                <div className="mt-2 flex flex-wrap gap-1.5 desktop:flex-col desktop:gap-0.5">
                  {g.tabs.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTab(key)}
                      aria-current={tab === key ? "page" : undefined}
                      data-testid={`admin-tab-${key}`}
                      className={`rounded-full px-3 py-1.5 text-left text-xs transition desktop:rounded-xl desktop:text-sm ${
                        tab === key ? "bg-primary text-white dark:bg-accent dark:text-primary" : "border border-(--color-border) hover:border-accent desktop:border-transparent desktop:hover:bg-primary/5 dark:desktop:hover:bg-white/5"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <main className="min-w-0 space-y-6">
          {promoTab && owner && <SitePicker label={t.site} sites={sites} site={site.id} onChange={setSiteId} />}

          {tab === "promo" && <PromoHub t={t} site={site} sites={sites} owner={owner} go={(k) => setTab(k === "kids" ? "kids-youtube" : k)} />}
          {tab === "hajj" && <HajjTab t={t} site={site} readOnly={readOnly} />}
          {tab === "youtube" && <YoutubePromoTab t={t} site={site} readOnly={readOnly} />}
          {tab === "kids-youtube" && <KidsYoutubeTab t={t} site={site} readOnly={readOnly} />}
          {tab === "pages" && <SitePagesTab />}
          {tab === "account" && !readOnly && <AccountTab />}

          {owner && (
            <>
              {tab === "dashboard" && dashboard && (
                <div className="grid grid-cols-2 gap-3 desktop:grid-cols-4">
                  <Tile label={dict.admin.activeKeys} value={`${dashboard.keys.healthy ?? 0} / ${dashboard.keys.total ?? 0}`} />
                  <Tile label={dict.admin.queuedJobs} value={String(dashboard.jobs.queued ?? 0)} />
                  <Tile label={dict.admin.monthDonations} value={`$${dashboard.donations.total_this_month ?? 0}`} />
                  <Tile label={dict.admin.registeredClients} value={String(dashboard.clients.total ?? 0)} />
                </div>
              )}
              {tab === "backlog" && <BacklogTab />}
              {tab === "orchestra" && <OrchestraTab />}
              {tab === "sanad" && <SanadTab />}
              {tab === "grant" && <GrantTab />}
              {tab === "monitor" && <MonitorTab locale={locale} />}
              {tab === "analytics" && <AnalyticsTab />}
              {tab === "adops" && <AdOpsTab />}
              {tab === "languages" && <LanguagesTab />}
              {tab === "traffic-ext" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-heading text-lg">🌍 Trafik Situs di Luar Ekosistem ulyah.com</h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      Menu terpisah untuk memantau trafik situs non-dakwah (axto, profity, oldco, xaa, xad, jai, lie).
                      Semua layanan iklan AdSense &amp; fitur worker AI/non-AI situs ini tetap dikendalikan dari portal
                      admin ulyah.com ini (tab 💰 AdSense, 🎻 Orchestra Core, KeyPool, Scaling).
                    </p>
                  </div>
                  <NetworkTraffic scope="external" />
                </div>
              )}
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
              {tab === "widgets" && <WidgetStoreTab />}
              {tab === "store" && <StoreTab />}
              {tab === "live" && <LiveStreamsTab />}
              {tab === "kids" && <KidsChannelsTab />}
              {tab === "kids-audio" && <KidsAudioTab />}
              {tab === "sale" && <SaleTab />}
              {tab === "kaggle" && <KaggleGuideTab />}
              {tab === "roadmap" && <RoadmapTab />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-card) p-4">
      <p className="font-heading text-xl">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </div>
  );
}
