"use client";

/**
 * "Orchestra Core" — the recorded blueprint for ULYAH.COM's AI architecture,
 * living inside the admin portal exactly as the product owner asked ("catat di
 * portal admin", "kelompok2an AI", "AI berikutnya harus diarahkan dengan
 * benar", "design dulu sebelum coding"). This is a PLANNING SURFACE, not a
 * running engine: it distinguishes, honestly, what is actually implemented
 * today from what is still vision, so no future AI/developer mistakes the
 * blueprint for shipped code. Same static, data-driven pattern as
 * BacklogTab / WidgetStoreTab.
 *
 * Guiding rule recorded here: Anthropic (Opus/Sonnet) must NEVER be a single
 * point of failure. Every capability has a provider fallback chain ending in
 * Cloudflare Workers AI (free) and then a retry queue.
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface HealthRow {
  provider: string;
  scope: string;
  status: string;
  keys: number;
  avg_latency_ms: number | null;
  quota_used: number | null;
}

function LiveHealth() {
  const [rows, setRows] = useState<HealthRow[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    api
      .get<{ health: HealthRow[] }>("/ai/orchestra/health")
      .then((d) => setRows(d.health))
      .catch(() => setErr(true));
  }, []);

  const statusCls = (s: string) =>
    s === "active"
      ? "text-success"
      : s === "rate_limited"
        ? "text-danger"
        : s === "slow"
          ? "text-warning"
          : "text-[var(--color-text-secondary)]";

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="font-heading text-sm">📡 Status Engine Langsung (Key Pool)</p>
      {err && <p className="mt-2 text-xs text-danger">Gagal memuat status (butuh login admin).</p>}
      {!err && rows === null && <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Memuat…</p>}
      {rows !== null && rows.length === 0 && (
        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
          Belum ada API key di pool. Tambahkan di tab Key Pool — Orchestra Core akan langsung memakainya sesuai
          capability &amp; rantai failover di bawah.
        </p>
      )}
      {rows !== null && rows.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-[11px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
                <th className="px-2 py-1 font-medium">Provider</th>
                <th className="px-2 py-1 font-medium">Scope</th>
                <th className="px-2 py-1 font-medium">Status</th>
                <th className="px-2 py-1 text-right font-medium">Key</th>
                <th className="px-2 py-1 text-right font-medium">Latency</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-2 py-1">{r.provider}</td>
                  <td className="px-2 py-1 text-[var(--color-text-secondary)]">{r.scope}</td>
                  <td className={`px-2 py-1 font-medium ${statusCls(r.status)}`}>{r.status}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{r.keys}</td>
                  <td className="px-2 py-1 text-right tabular-nums">
                    {r.avg_latency_ms != null ? `${Math.round(r.avg_latency_ms)}ms` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

interface WorkerMeta {
  name: string;
  label: string;
  capability: string;
  desc: string;
  inputs: string[];
}
interface RunResult {
  ok?: boolean;
  text?: string | null;
  answer?: string;
  translation?: string;
  summary?: string;
  servedBy?: string | null;
  error?: string;
  attempts?: { provider: string; ok: boolean; detail?: string }[];
}

function WorkerRunner() {
  const [workers, setWorkers] = useState<WorkerMeta[] | null>(null);
  const [sel, setSel] = useState<string>("");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<{ workers: WorkerMeta[] }>("/ai/orchestra/workers")
      .then((d) => {
        setWorkers(d.workers);
        if (d.workers[0]) setSel(d.workers[0].name);
      })
      .catch(() => setWorkers([]));
  }, []);

  const current = workers?.find((w) => w.name === sel);

  async function run() {
    if (!current) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await api.post<RunResult>("/ai/orchestra/worker", { name: sel, input: inputs });
      setResult(r);
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "gagal" });
    } finally {
      setBusy(false);
    }
  }

  const output = result?.text ?? result?.answer ?? result?.translation ?? result?.summary ?? null;

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="font-heading text-sm">🧪 Coba Worker (uji engine langsung)</p>
      {workers === null && <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Memuat…</p>}
      {workers && workers.length === 0 && (
        <p className="mt-2 text-xs text-danger">Gagal memuat daftar worker (butuh login admin).</p>
      )}
      {current && (
        <div className="mt-3 space-y-3">
          <select
            value={sel}
            onChange={(e) => {
              setSel(e.target.value);
              setInputs({});
              setResult(null);
            }}
            className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          >
            {workers!.map((w) => (
              <option key={w.name} value={w.name}>
                {w.label} — {w.capability}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[var(--color-text-secondary)]">{current.desc}</p>
          {current.inputs.map((f) => (
            <label key={f} className="block text-xs">
              <span className="text-[var(--color-text-secondary)]">{f}</span>
              <input
                value={inputs[f] ?? ""}
                onChange={(e) => setInputs((p) => ({ ...p, [f]: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              />
            </label>
          ))}
          <button
            onClick={run}
            disabled={busy}
            className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
          >
            {busy ? "Menjalankan…" : "▶ Jalankan"}
          </button>

          {result && (
            <div className="rounded-lg bg-black/5 p-3 text-xs">
              {output != null && <p className="whitespace-pre-wrap">{output}</p>}
              {result.error && <p className="text-danger">{result.error}</p>}
              {result.servedBy && (
                <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">Dilayani: {result.servedBy}</p>
              )}
              {result.attempts && result.attempts.length > 0 && (
                <div className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
                  {result.attempts.map((a, i) => (
                    <span key={i} className={a.ok ? "text-success" : "text-danger"}>
                      {a.provider}
                      {a.ok ? "✓" : "✗"}
                      {i < result.attempts!.length - 1 ? " → " : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

type Status = "live" | "partial" | "planned";

const STATUS_META: Record<Status, { label: string; cls: string }> = {
  live: { label: "✅ Sudah nyata", cls: "border-success/40 bg-success/15 text-success" },
  partial: { label: "🟡 Sebagian", cls: "border-warning/40 bg-warning/15 text-warning" },
  planned: { label: "💡 Rencana", cls: "border-accent/40 bg-accent/15 text-accent" },
};

function Pill({ status }: { status: Status }) {
  const m = STATUS_META[status];
  return <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${m.cls}`}>{m.label}</span>;
}

// ── Provider failover hierarchy (Anthropic is never the single point of failure) ──
const PROVIDER_TIERS: { tier: string; role: string; providers: string; status: Status; note: string }[] = [
  {
    tier: "Tier 1 — Chief Architect",
    role: "Reasoning kompleks, desain sistem, review arsitektur",
    providers: "Anthropic (Opus 4.8 / Sonnet)",
    status: "partial",
    note: "Dipakai untuk membangun & mereview (sesi ini). Bukan untuk melayani pengunjung. Jika limit habis → Tier 2.",
  },
  {
    tier: "Tier 2 — Acting Chief",
    role: "Melanjutkan rancangan, koordinasi, coding harian, widget",
    providers: "Gemini Pool (Flash/Pro)",
    status: "planned",
    note: "Pool API key Gemini gratis. Mengambil alih saat Anthropic limit/off. Belum ada pool engine nyata.",
  },
  {
    tier: "Tier 3 — Execution Manager",
    role: "Routing, queue, scheduler, retry, health-check, fast reasoning",
    providers: "Groq Pool",
    status: "planned",
    note: "Cepat & murah untuk tugas operasional berulang.",
  },
  {
    tier: "Tier 4 — Specialist",
    role: "Image, video, voice, OCR, embedding, avatar",
    providers: "NVIDIA NIM · HuggingFace · Cloudflare Workers AI",
    status: "partial",
    note: "NVIDIA & OpenRouter key sudah masuk Key Pool (Durable Object). CF Workers AI toggle default OFF, prefer NVIDIA dulu.",
  },
  {
    tier: "Tier 5 — Non-AI (eksekusi)",
    role: "Cron, queue, D1, R2, KV, cache, git/deploy",
    providers: "Cloudflare Workers (tanpa AI)",
    status: "live",
    note: "Sudah berjalan: worker-api (Hono), D1, R2, KV, GitHub Actions deploy pipeline.",
  },
];

// ── AI worker grouping the owner explicitly asked to see clearly ("kelompok2an AI") ──
const AI_GROUPS: { group: string; capability: string; chain: string; status: Status }[] = [
  { group: "Translate Worker", capability: "Terjemah multi-bahasa (8 bahasa)", chain: "Gemini → Groq → CF AI", status: "partial" },
  { group: "Voice Worker", capability: "TTS multi-bahasa, audiobook, narasi", chain: "NVIDIA TTS → Gemini TTS → Piper/eSpeak (offline)", status: "partial" },
  { group: "Sanad Worker", capability: "Pisah sanad, perawi, pohon sanad (D3 hierarchy)", chain: "Gemini reasoning + dorar-hadith-api (data)", status: "planned" },
  { group: "Kisah Worker", capability: "Tulis kisah nabi/sahabat bersumber", chain: "Anthropic/Gemini → review manusia", status: "partial" },
  { group: "Answer/Chat Worker", capability: "Jawab pertanyaan (dalil + sitasi + link Ulyah)", chain: "Gemini → Groq, wajib RAG database dulu", status: "planned" },
  { group: "Search Worker", capability: "Cari cepat Qur'an/hadits/kitab/kisah", chain: "D1 FTS + Vector (embedding)", status: "partial" },
  { group: "Widget/Animation Builder", capability: "Bangun widget siap-build di portal admin", chain: "Anthropic (desain) → Groq (skeleton)", status: "planned" },
  { group: "Image Worker", capability: "Ilustrasi Islami (tanpa wajah nabi)", chain: "NVIDIA SDXL/FLUX → CF AI → Replicate", status: "planned" },
  { group: "OCR Worker", capability: "Baca kitab kuning → teks terstruktur", chain: "Gemini Vision → GOT-OCR (HF)", status: "planned" },
  { group: "Knowledge Worker", capability: "Perkaya database tiap malam (self-learning)", chain: "Scan DB → embedding → D1/R2", status: "planned" },
  { group: "Git/Deploy Worker", capability: "Commit, PR, merge, deploy, rollback", chain: "GitHub API + Actions (token)", status: "live" },
  { group: "SEO/AdSense Worker", capability: "Sitemap, schema.org, posisi iklan aman", chain: "Non-AI + Gemini saran", status: "partial" },
];

// ── Health signals recorded per API key (the "Health Score" the owner asked for) ──
const HEALTH_SIGNALS = [
  "🟢 Latency", "🟢 Success rate", "🟢 Requests/menit", "🟡 Sisa kuota",
  "🔴 Rate limited", "🔴 Error terakhir", "⏳ Estimasi wake-up (cooldown)", "⭐ Skor kualitas",
];

// ── Access tiers for the premium AI chat (Portal Client/Donatur) ──
const ACCESS_TIERS = [
  { tier: "Guest (landing)", access: "Maks 15 pertanyaan/jam, jawaban singkat → lalu diarahkan Register", status: "planned" as Status },
  { tier: "Free Member", access: "Perkenalan singkat saja (apa itu tafsir/hadits/fiqih); diskusi panjang → Upgrade", status: "planned" as Status },
  { tier: "Premium / Client / Donatur", access: "AI Chat spesialis unlimited (dibuka Admin per akun, sistem deposit/langganan)", status: "planned" as Status },
];

export function OrchestraTab() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-accent/40 bg-[var(--color-card)] p-4">
        <div className="flex items-center gap-3">
          <Image src="/brand/ulyah-logo-dark.webp" alt="Ulyah" width={72} height={72} className="h-10 w-10 shrink-0 rounded-full shadow-sm" />
          <p className="font-heading text-lg">🎻 Orchestra Core — Blueprint AI (Baca Sebelum Menyentuh AI)</p>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          Ini <b>rancangan</b>, bukan mesin yang sudah jalan penuh. Tujuannya: setiap AI/developer berikutnya tahu arah
          arsitektur AI Ulyah.com tanpa menebak. <b>Aturan inti:</b> Anthropic (Opus/Sonnet) TIDAK BOLEH jadi titik
          kegagalan tunggal — setiap kemampuan punya rantai cadangan yang berakhir di Cloudflare Workers AI (gratis) lalu
          antrean retry. Semua AI dikelompokkan per tugas (satu worker satu spesialisasi) agar hemat token, cepat, dan
          tidak campur konteks.
        </p>
        <div className="mt-3 rounded-lg bg-danger/10 p-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          <b>Realita saat ini vs visi:</b> yang SUDAH NYATA &amp; live: Key Pool (Durable Object) untuk NVIDIA/OpenRouter,
          toggle CF Workers AI (default OFF), pipeline deploy Cloudflare, dan — baru — <b>router Orchestra Core sungguhan</b>
          di worker-api (<code className="rounded bg-black/10 px-1">lib/orchestra.ts</code>): Capability Registry
          (capability → rantai provider), failover otomatis lintas key donasi, pencatatan health per-key, cooldown
          auto-wake key yang kena rate-limit, plus endpoint <code className="rounded bg-black/10 px-1">/ai/translate</code>,
          <code className="mx-1 rounded bg-black/10 px-1">/ai/summarize</code>, dan
          <code className="rounded bg-black/10 px-1">/ai/orchestra/*</code>. Tabel "Status Engine Langsung" di atas membaca
          key pool nyata. Yang MASIH rancangan: worker/co-worker hierarki penuh, self-learning malam, RAG bersanad, billing
          premium. Angka "±4.400 worker" = peran logis, BUKAN 4.400 Worker fisik (realistis ±150–300 fisik).
        </div>
      </div>

      <LiveHealth />
      <WorkerRunner />

      {/* Provider failover hierarchy */}
      <section>
        <h2 className="font-heading text-base">🛡️ Hirarki Provider &amp; Failover (Anthropic bukan satu-satunya)</h2>
        <div className="mt-3 space-y-2">
          {PROVIDER_TIERS.map((t) => (
            <div key={t.tier} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{t.tier}</p>
                <Pill status={t.status} />
              </div>
              <p className="mt-1 text-xs text-primary dark:text-accent">{t.providers}</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{t.role}</p>
              <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]/80">{t.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI worker grouping */}
      <section>
        <h2 className="font-heading text-base">🧩 Pengelompokan AI Worker (satu worker, satu tugas)</h2>
        <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          Meski modelnya sama (mis. Gemini yang sama), prompt, pengetahuan, dan tugasnya dipisah agar tiap AI "ahli" di
          bidangnya. Kolom rantai = urutan provider yang dicoba (failover).
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full min-w-[560px] text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-black/5">
                <th className="px-3 py-2 text-left font-medium">Worker</th>
                <th className="px-3 py-2 text-left font-medium">Tugas</th>
                <th className="px-3 py-2 text-left font-medium">Rantai provider</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {AI_GROUPS.map((g) => (
                <tr key={g.group} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-3 py-2 font-medium">{g.group}</td>
                  <td className="px-3 py-2 text-[var(--color-text-secondary)]">{g.capability}</td>
                  <td className="px-3 py-2 text-[var(--color-text-secondary)]">{g.chain}</td>
                  <td className="px-3 py-2"><Pill status={g.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Health engine */}
      <section>
        <h2 className="font-heading text-base">❤️ Health Engine per API Key (pilih yang paling sehat)</h2>
        <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          Orchestra Core tidak hanya memilih API yang aktif, tetapi yang paling sehat &amp; cepat setiap saat. Key yang
          kena rate-limit masuk cooldown queue lalu <b>dibangunkan otomatis</b> begitu pulih (jangan diam). Sinyal yang
          dilacak per key:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {HEALTH_SIGNALS.map((s) => (
            <span key={s} className="rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1 text-[11px]">{s}</span>
          ))}
        </div>
      </section>

      {/* Access tiers */}
      <section>
        <h2 className="font-heading text-base">🔑 Hak Akses AI Chat Premium (Portal Client/Donatur)</h2>
        <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          AI Chat spesialis (Quran/Tafsir/Hadits/Sanad/Fiqih/Curhat Islami/dst) adalah layanan premium yang dibuka Admin
          per akun. Landing page tetap lebih banyak halaman (SEO + AdSense), AI dibatasi agar pengunjung membuka lebih
          banyak halaman. Prinsip: AI wajib belajar dari database Ulyah dulu (RAG) sebelum sumber luar, dan setiap
          jawaban wajib berdalil + sitasi + link Ulyah.
        </p>
        <div className="mt-3 space-y-2">
          {ACCESS_TIERS.map((a) => (
            <div key={a.tier} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3">
              <div>
                <p className="text-sm font-medium">{a.tier}</p>
                <p className="text-[11px] text-[var(--color-text-secondary)]">{a.access}</p>
              </div>
              <Pill status={a.status} />
            </div>
          ))}
        </div>
      </section>

      {/* Note to next AI */}
      <section className="rounded-xl border border-accent/40 bg-accent/5 p-4">
        <h2 className="font-heading text-base">📝 Langkah Berikut (urut, jangan lompat)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          <li><b>Capability Registry + Router:</b> tabel kemampuan → rantai provider (di atas) diwujudkan sebagai config di worker-api, bukan hardcode nama provider. Ganti provider = ganti config saja.</li>
          <li><b>Key Pool health + auto wake-up:</b> perluas KeyPoolCoordinator (Durable Object yang sudah ada) untuk melacak sinyal health di atas + cooldown queue + heartbeat re-test.</li>
          <li><b>RAG dulu, AI belakangan:</b> setiap Answer Worker cek Cache → D1 → Vector → Knowledge Graph SEBELUM memanggil AI (hemat token, jawaban konsisten & bersitasi).</li>
          <li><b>Premium AI Chat:</b> bangun di Portal Client/Donatur dengan deposit/langganan + free-access override oleh Admin. Default semua LOCKED.</li>
          <li><b>Jangan over-claim:</b> perbarui status di file ini tiap sebuah bagian benar-benar jadi. Angka worker = peran logis.</li>
        </ol>
      </section>
    </div>
  );
}
