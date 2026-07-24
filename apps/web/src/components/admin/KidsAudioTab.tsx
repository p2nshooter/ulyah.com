"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { KIDS_AUDIO_CATALOG, type AudioSlot } from "@/lib/kids-audio";
import { kidsAudioUrl } from "@/lib/kids-audio-play";

/**
 * Admin "Al-Qur'an Kids" audio console. Fills the 112 recordable slots — 28
 * hijaiyah letters + 84 letter×harakat syllables — with REAL audio, either by
 * uploading a file or recording straight from the microphone (preview, then
 * keep or re-record). The kids pages play these recordings and fall back to an
 * Arabic voice only for slots that are still empty.
 */

interface Row {
  code: string;
  content_type: string;
  source: string | null;
  updated_at: string;
  updated_by: string | null;
}

const HARAKAT_LABEL: Record<string, string> = { a: "Fathah (a)", i: "Kasrah (i)", u: "Dhammah (u)" };

interface WikiHit {
  title: string;
  url: string;
  mime: string;
  license: string;
  author: string;
}

// Search Wikimedia Commons for openly-licensed audio (browser-side; the Commons
// API is CORS-enabled). Returns audio files only.
async function searchCommonsAudio(query: string): Promise<WikiHit[]> {
  const api =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
    "&generator=search&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|mime|extmetadata" +
    `&gsrsearch=${encodeURIComponent(query + " filetype:audio")}`;
  const res = await fetch(api);
  if (!res.ok) throw new Error(`Commons ${res.status}`);
  const data = (await res.json()) as { query?: { pages?: Record<string, any> } };
  const pages = data.query?.pages ? Object.values(data.query.pages) : [];
  const hits: WikiHit[] = [];
  for (const p of pages) {
    const info = p.imageinfo?.[0];
    if (!info) continue;
    const mime: string = info.mime ?? "";
    if (!/^audio\//.test(mime) && mime !== "application/ogg") continue;
    hits.push({
      title: String(p.title ?? "").replace(/^File:/, ""),
      url: info.url,
      mime,
      license: info.extmetadata?.LicenseShortName?.value ?? "?",
      author: (info.extmetadata?.Artist?.value ?? "").replace(/<[^>]+>/g, "").slice(0, 40),
    });
  }
  return hits;
}

export function KidsAudioTab() {
  const [filled, setFilled] = useState<Map<string, Row>>(new Map());
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // One active recorder at a time.
  const [rec, setRec] = useState<{ code: string; status: "recording" | "preview"; url?: string; blob?: Blob } | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const previewRef = useRef<HTMLAudioElement | null>(null);

  // Wikimedia Commons picker (browser-side, CORS-enabled) — find an openly
  // licensed recording for a letter, listen to it, then import the chosen one.
  const [wiki, setWiki] = useState<{ slot: AudioSlot; query: string; results: WikiHit[]; loading: boolean; err?: string } | null>(null);

  const hijaiyah = useMemo(() => KIDS_AUDIO_CATALOG.filter((s) => s.group === "hijaiyah"), []);
  const iqroByLetter = useMemo(() => {
    const m = new Map<number, AudioSlot[]>();
    for (const s of KIDS_AUDIO_CATALOG.filter((x) => x.group === "iqro")) {
      const arr = m.get(s.letterIndex) ?? [];
      arr.push(s);
      m.set(s.letterIndex, arr);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get<{ audio: Row[] }>("/admin/kids-audio");
      setFilled(new Map(r.audio.map((a) => [a.code, a])));
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);

  function preview(code: string) {
    previewRef.current?.pause();
    const a = new Audio(`${kidsAudioUrl(code)}?t=${Date.now()}`);
    previewRef.current = a;
    void a.play().catch(() => setMsg("Tidak bisa memutar audio."));
  }

  async function uploadBlob(code: string, blob: Blob, source: string) {
    setBusy(code);
    setMsg(null);
    try {
      const type = (blob.type || "audio/webm").split(";")[0];
      const ext = type.split("/")[1] ?? "webm";
      const form = new FormData();
      form.append("file", new File([blob], `${code}.${ext}`, { type }));
      form.append("source", source);
      await api.upload(`/admin/kids-audio/${code}`, form);
      await load();
      setMsg(`Tersimpan: ${code}`);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function onPickFile(code: string, file: File | undefined) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMsg("File terlalu besar (maks 2MB).");
      return;
    }
    void uploadBlob(code, file, "upload");
  }

  async function importUrl(code: string) {
    const url = window.prompt(
      `Tempel URL audio berlisensi untuk ${code} (mis. file Wikimedia Commons yang boleh dipakai).\nHanya https, maks 3MB.`
    );
    if (!url) return;
    setBusy(code);
    setMsg(null);
    try {
      await api.post(`/admin/kids-audio/${code}/import`, { url: url.trim() });
      await load();
      setMsg(`Terimpor: ${code}`);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function del(code: string) {
    setBusy(code);
    try {
      await api.del(`/admin/kids-audio/${code}`);
      await load();
      setMsg(`Dihapus: ${code}`);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function openWiki(slot: AudioSlot) {
    setWiki({ slot, query: `${slot.latin} arabic letter`, results: [], loading: false });
  }
  async function runWikiSearch() {
    if (!wiki) return;
    setWiki({ ...wiki, loading: true, err: undefined });
    try {
      const results = await searchCommonsAudio(wiki.query);
      setWiki((w) => (w ? { ...w, results, loading: false } : w));
    } catch (e) {
      setWiki((w) => (w ? { ...w, loading: false, err: (e as Error).message } : w));
    }
  }
  async function useWiki(code: string, url: string) {
    setBusy(code);
    setMsg(null);
    try {
      await api.post(`/admin/kids-audio/${code}/import`, { url });
      await load();
      setWiki(null);
      setMsg(`Terimpor dari Wikimedia: ${code}`);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function startRecord(code: string) {
    setMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        setRec({ code, status: "preview", url: URL.createObjectURL(blob), blob });
      };
      mr.start();
      setRec({ code, status: "recording" });
    } catch {
      setMsg("Mikrofon tidak bisa diakses. Izinkan akses mic, lalu coba lagi.");
    }
  }
  function stopRecord() {
    recorderRef.current?.stop();
  }
  function cancelRecord() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stream?.getTracks?.().forEach?.((t) => t.stop());
      recorderRef.current.stop();
    }
    if (rec?.url) URL.revokeObjectURL(rec.url);
    setRec(null);
  }

  const total = KIDS_AUDIO_CATALOG.length;
  const done = filled.size;

  const SlotCard = ({ slot, label, showWiki }: { slot: AudioSlot; label?: string; showWiki?: boolean }) => {
    const has = filled.has(slot.code);
    const isBusy = busy === slot.code;
    return (
      <div
        className={`flex flex-col gap-1 rounded-xl border p-2 text-center ${
          has ? "border-emerald-400/50 bg-emerald-500/5" : "border-[var(--color-border)]"
        }`}
      >
        {label && <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">{label}</span>}
        <span dir="rtl" className="font-arabic text-2xl leading-none">{slot.ar}</span>
        <span className="text-[10px] text-[var(--color-text-secondary)]">
          {slot.latin} {has ? "✓" : "•"}
        </span>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-1">
          {has && (
            <button onClick={() => preview(slot.code)} title="Putar" className="rounded px-1.5 py-0.5 text-xs hover:bg-black/5">
              ▶
            </button>
          )}
          <button
            onClick={() => startRecord(slot.code)}
            disabled={isBusy || !!rec}
            title="Rekam"
            className="rounded px-1.5 py-0.5 text-xs hover:bg-black/5 disabled:opacity-40"
          >
            ●
          </button>
          <label title="Unggah" className="cursor-pointer rounded px-1.5 py-0.5 text-xs hover:bg-black/5">
            ⬆
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                onPickFile(slot.code, e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <button
            onClick={() => importUrl(slot.code)}
            disabled={isBusy || !!rec}
            title="Impor dari URL (mis. Wikimedia)"
            className="rounded px-1.5 py-0.5 text-xs hover:bg-black/5 disabled:opacity-40"
          >
            🔗
          </button>
          {showWiki && (
            <button
              onClick={() => openWiki(slot)}
              disabled={isBusy || !!rec}
              title="Cari audio di Wikimedia Commons"
              className="rounded px-1.5 py-0.5 text-xs hover:bg-black/5 disabled:opacity-40"
            >
              🔎
            </button>
          )}
          {has && (
            <button onClick={() => del(slot.code)} disabled={isBusy} title="Hapus" className="rounded px-1.5 py-0.5 text-xs text-danger hover:bg-danger/10 disabled:opacity-40">
              🗑
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-lg">🧒 Al-Qur'an Kids — Audio</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Isi audio asli untuk huruf hijaiyah & suku kata Iqro — unggah file atau rekam langsung dari mikrofon (bisa
          didengarkan dulu sebelum disimpan). Slot kosong otomatis pakai suara Arab (TTS) sampai diisi.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent">
            {done} / {total} terisi
          </span>
          <button onClick={() => void load()} className="text-xs text-[var(--color-text-secondary)] underline">
            Muat ulang
          </button>
        </div>
        {msg && <p className="mt-2 text-sm text-accent">{msg}</p>}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--color-text-secondary)]">Memuat…</p>
      ) : (
        <>
          <section>
            <h3 className="mb-2 font-heading text-base">Huruf Hijaiyah ({hijaiyah.length})</h3>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {hijaiyah.map((s) => (
                <SlotCard key={s.code} slot={s} showWiki />
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-heading text-base">Iqro — Huruf × Harakat ({total - hijaiyah.length})</h3>
            <div className="space-y-2">
              {iqroByLetter.map(([letterIndex, slots]) => (
                <div key={letterIndex} className="grid grid-cols-3 gap-2">
                  {slots
                    .slice()
                    .sort((a, b) => "aiu".indexOf(a.harakat!) - "aiu".indexOf(b.harakat!))
                    .map((s) => (
                      <SlotCard key={s.code} slot={s} label={HARAKAT_LABEL[s.harakat!]} />
                    ))}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Recorder overlay */}
      {rec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--color-card)] p-5 text-center shadow-xl">
            <p className="font-heading text-base">Rekam: {rec.code}</p>
            {rec.status === "recording" ? (
              <>
                <p className="mt-3 animate-pulse text-danger">● Merekam… ucapkan dengan jelas</p>
                <div className="mt-4 flex justify-center gap-2">
                  <button onClick={stopRecord} className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-primary">
                    ⏹ Selesai
                  </button>
                  <button onClick={cancelRecord} className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm">
                    Batal
                  </button>
                </div>
              </>
            ) : (
              <>
                <audio src={rec.url} controls className="mt-4 w-full" />
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => {
                      if (rec.blob) void uploadBlob(rec.code, rec.blob, "record");
                      if (rec.url) URL.revokeObjectURL(rec.url);
                      setRec(null);
                    }}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white"
                  >
                    ✓ Simpan
                  </button>
                  <button onClick={() => startRecord(rec.code)} className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm">
                    ↺ Rekam ulang
                  </button>
                  <button onClick={cancelRecord} className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm">
                    Batal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Wikimedia Commons picker */}
      {wiki && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--color-card)] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="font-heading text-base">
                Wikimedia — {wiki.slot.latin} <span dir="rtl" className="font-arabic">{wiki.slot.ar}</span>
              </p>
              <button onClick={() => setWiki(null)} className="text-sm text-[var(--color-text-secondary)]">✕</button>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={wiki.query}
                onChange={(e) => setWiki((w) => (w ? { ...w, query: e.target.value } : w))}
                onKeyDown={(e) => e.key === "Enter" && void runWikiSearch()}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm"
                placeholder="cari audio…"
              />
              <button onClick={() => void runWikiSearch()} className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-primary">
                Cari
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              Dengarkan dulu, pastikan pengucapannya benar & lisensinya boleh dipakai (CC/PD) sebelum dipakai.
              File OGG mungkin tak berbunyi di iPhone — utamakan MP3.
            </p>
            {wiki.err && <p className="mt-2 text-sm text-danger">{wiki.err}</p>}
            {wiki.loading && <p className="mt-3 text-sm">Mencari…</p>}
            <div className="mt-3 space-y-2">
              {wiki.results.map((h) => (
                <div key={h.url} className="rounded-xl border border-[var(--color-border)] p-2">
                  <p className="truncate text-xs font-medium" title={h.title}>{h.title}</p>
                  <p className="text-[10px] text-[var(--color-text-secondary)]">
                    {h.mime} · {h.license}
                    {h.author ? ` · ${h.author}` : ""}
                  </p>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio src={h.url} controls preload="none" className="mt-1 h-8 w-full" />
                  <button
                    onClick={() => void useWiki(wiki.slot.code, h.url)}
                    disabled={busy === wiki.slot.code}
                    className="mt-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white disabled:opacity-40"
                  >
                    ✓ Pakai untuk {wiki.slot.code}
                  </button>
                </div>
              ))}
              {!wiki.loading && wiki.results.length === 0 && !wiki.err && (
                <p className="text-sm text-[var(--color-text-secondary)]">Klik “Cari” untuk mencari audio.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
