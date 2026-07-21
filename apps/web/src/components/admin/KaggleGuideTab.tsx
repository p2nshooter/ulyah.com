"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * Kaggle GPU tab — TWO things:
 *  1. A FUNCTIONAL Orchestra Core connection panel (real backend): register a
 *     running Kaggle notebook's OpenAI-compatible tunnel URL so Orchestra puts
 *     that FREE GPU at the front of every capability chain, and a "Test now"
 *     button that proves it actually answers (shows who served the reply). This
 *     is the honest answer to "apakah Kaggle benar-benar melayani ulyah.com,
 *     atau cuma tampilan" — the status here is live, not decorative.
 *  2. A copy-paste guide for producing assets (kids' film narration, offline
 *     stream filler) on free Kaggle GPU hours.
 */

interface KaggleStatus {
  configured: boolean;
  url?: string;
  model?: string | null;
  enabled?: boolean;
  hasToken?: boolean;
}
interface KaggleTest {
  ok: boolean;
  servedBy?: string;
  sample?: string;
  attempts?: { provider: string; ok: boolean; detail?: string }[];
}

function KaggleOrchestraConnect() {
  const [status, setStatus] = useState<KaggleStatus | null>(null);
  const [form, setForm] = useState({ url: "", model: "", token: "", enabled: true });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<KaggleTest | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function load() {
    api
      .get<KaggleStatus>("/ai/orchestra/kaggle")
      .then((s) => {
        setStatus(s);
        if (s.configured) setForm((f) => ({ ...f, url: s.url ?? "", model: s.model ?? "", enabled: s.enabled !== false }));
      })
      .catch(() => setStatus({ configured: false }));
  }
  useEffect(load, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await api.post("/ai/orchestra/kaggle", {
        url: form.url.trim(),
        model: form.model.trim() || undefined,
        token: form.token.trim() || undefined,
        enabled: form.enabled,
      });
      setMsg("Tersimpan. Orchestra akan memakai endpoint ini paling depan.");
      setForm((f) => ({ ...f, token: "" })); // never keep the bearer in the field
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function runTest() {
    setTesting(true);
    setTest(null);
    try {
      const r = await api.post<KaggleTest>("/ai/orchestra/kaggle-test");
      setTest(r);
    } catch (err) {
      setTest({ ok: false, sample: err instanceof Error ? err.message : "Gagal" });
    } finally {
      setTesting(false);
    }
  }

  const live = status?.configured && status.enabled !== false;
  const servedByKaggle = test?.servedBy?.startsWith("kaggle");

  return (
    <div className="rounded-xl border border-accent/40 bg-[var(--color-card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-base">⚡ Endpoint GPU Gratis Kaggle → Orchestra Core</p>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
            live ? "bg-success/15 text-success" : "bg-black/10 text-[var(--color-text-secondary)]"
          }`}
        >
          {status == null ? "…" : live ? "● Terhubung" : "○ Belum aktif"}
        </span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        Jalankan notebook Kaggle di bawah (SEL SERVER), lalu tempel URL tunnel + token yang tercetak ke sini.
        Saat aktif, seluruh ekosistem (ulyah.com, situs saudara, axto) memakai GPU gratis ini lebih dulu, dan
        otomatis balik ke API key donasi begitu notebook berhenti. <b>Status di atas nyata</b> — tekan “Tes
        sekarang” untuk membuktikan siapa yang benar-benar menjawab.
      </p>

      <form onSubmit={save} className="mt-3 grid gap-2 sm:grid-cols-2">
        <input
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          placeholder="https://xxxx.trycloudflare.com/v1/chat/completions"
          className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs sm:col-span-2"
        />
        <input
          value={form.model}
          onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
          placeholder="Model (mis. Qwen/Qwen2.5-3B-Instruct)"
          className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs"
        />
        <input
          type="password"
          value={form.token}
          onChange={(e) => setForm((f) => ({ ...f, token: e.target.value }))}
          placeholder={status?.hasToken ? "Token tersimpan — isi untuk ganti" : "Token bearer (opsional)"}
          className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs"
        />
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
          />
          Aktifkan endpoint ini
        </label>
        <div className="flex items-center gap-2">
          <button
            disabled={saving}
            className="rounded bg-primary px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-accent dark:text-primary"
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
          <button
            type="button"
            onClick={runTest}
            disabled={testing || !status?.configured}
            className="rounded border border-accent px-3 py-1.5 text-xs text-accent disabled:opacity-40"
          >
            {testing ? "Menguji…" : "Tes sekarang"}
          </button>
        </div>
      </form>
      {msg && <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">{msg}</p>}

      {test && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
            test.ok ? "border-success/40 bg-success/5" : "border-danger/40 bg-danger/5"
          }`}
        >
          <p className={test.ok ? "text-success" : "text-danger"}>
            {test.ok ? "✓ Orchestra menjawab" : "✗ Semua jalur gagal"}
            {test.servedBy && (
              <>
                {" "}
                — dilayani oleh <b>{test.servedBy}</b>{" "}
                {servedByKaggle ? "🎉 (GPU Kaggle Anda)" : "(fallback API key — Kaggle belum aktif/terjawab)"}
              </>
            )}
          </p>
          {test.sample && <p className="mt-1 opacity-70">Balasan: “{test.sample}”</p>}
        </div>
      )}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative mt-2">
      <button
        onClick={() => {
          navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="absolute right-2 top-2 rounded-full bg-accent px-3 py-1 text-[10px] font-medium text-primary"
      >
        {copied ? "✓ Tersalin" : "Salin"}
      </button>
      <pre className="scrollbar-thin overflow-x-auto rounded-xl bg-[#06251b] p-4 text-[11px] leading-relaxed text-[#d4e9dd]">
        {code}
      </pre>
    </div>
  );
}

const STEP_SERVER = `# ═══ SEL SERVER: GPU gratis Kaggle → Orchestra Core (LLM sungguhan) ═══
# Tempel SATU sel ini (Accelerator GPU T4 ON, Internet ON) lalu Run. Ia
# menyajikan LLM open lewat API OpenAI-compatible + tunnel Cloudflare, lalu
# mencetak URL + Token untuk ditempel ke panel di atas.
import os, secrets, subprocess, sys, time, urllib.request, re, threading
MODEL = os.environ.get("ORCHESTRA_MODEL", "Qwen/Qwen2.5-3B-Instruct")
PORT = 8000
API_TOKEN = os.environ.get("ORCHESTRA_TOKEN") or secrets.token_urlsafe(24)
def sh(c): print("$", c, flush=True); return subprocess.run(c, shell=True, check=False)
sh(f"{sys.executable} -m pip install --quiet --upgrade 'vllm==0.6.*' || {sys.executable} -m pip install --quiet vllm")
if not os.path.exists("/usr/local/bin/cloudflared"):
    sh("wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 "
       "-O /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared")
server = subprocess.Popen([sys.executable, "-m", "vllm.entrypoints.openai.api_server",
    "--model", MODEL, "--port", str(PORT), "--api-key", API_TOKEN,
    "--max-model-len", "8192", "--gpu-memory-utilization", "0.92"],
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
threading.Thread(target=lambda: [print(l, end="", flush=True) for l in server.stdout], daemon=True).start()
print("\\n⏳ Memuat model (unduhan pertama beberapa menit)…", flush=True)
for _ in range(180):
    try:
        req = urllib.request.Request(f"http://127.0.0.1:{PORT}/v1/models", headers={"Authorization": f"Bearer {API_TOKEN}"})
        if urllib.request.urlopen(req, timeout=3).status == 200: print("✅ Model siap.", flush=True); break
    except Exception: time.sleep(5)
tunnel = subprocess.Popen(["/usr/local/bin/cloudflared", "tunnel", "--url", f"http://127.0.0.1:{PORT}", "--no-autoupdate"],
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
for line in tunnel.stdout:
    print(line, end="", flush=True)
    m = re.search(r"https://[a-z0-9-]+\\.trycloudflare\\.com", line)
    if m:
        pub = m.group(0)
        print("\\n" + "="*60 + f"\\n  URL   : {pub}/v1/chat/completions\\n  Model : {MODEL}\\n  Token : {API_TOKEN}\\n" + "="*60, flush=True)
        break
tunnel.wait()  # biarkan sel ini berjalan agar endpoint tetap hidup`;

const STEP_SETUP = `# 1) Buka kaggle.com → Create → New Notebook
# 2) Panel kanan: "Session options" → Accelerator → pilih "GPU T4 x2" (gratis ±30 jam/minggu)
# 3) Internet → ON (perlu untuk unduh model)
# 4) Tempel sel-sel di bawah, jalankan berurutan (Shift+Enter)`;

const STEP_TTS = `# ═══ SEL A: Suara narasi berkualitas tinggi untuk Film Anak ═══
# Menghasilkan MP3 narasi per adegan dari teks kisah — jauh lebih halus
# daripada suara browser. Model: MMS-TTS bahasa Indonesia (Meta, open source).
!pip -q install transformers torch soundfile

from transformers import VitsModel, AutoTokenizer
import torch, soundfile as sf

model = VitsModel.from_pretrained("facebook/mms-tts-ind").cuda()
tok = AutoTokenizer.from_pretrained("facebook/mms-tts-ind")

# GANTI: tempel adegan kisah di sini (satu string per adegan)
adegan = [
    "Namanya Aiman. Ia anak yang ceria dan suka bermain di taman.",
    "Suatu sore, Aiman menemukan sebuah dompet kecil berwarna cokelat.",
]

for i, teks in enumerate(adegan, 1):
    inputs = tok(teks, return_tensors="pt").to("cuda")
    with torch.no_grad():
        wav = model(**inputs).waveform[0].cpu().numpy()
    sf.write(f"adegan_{i:02d}.wav", wav, model.config.sampling_rate)
    print(f"✓ adegan_{i:02d}.wav")

# Unduh hasil: panel kanan → Output → klik file → Download`;

const STEP_VIDEO = `# ═══ SEL B: Video pengisi offline untuk slot Live Streaming ═══
# Membuat MP4 loop elegan (logo ULYAH + teks kontak) yang bisa diputar
# sebagai video YouTube "rekaman" di slot umum saat tidak ada siaran.
!pip -q install pillow
import urllib.request
urllib.request.urlretrieve("https://ulyah.com/brand/ulyah-logo-dark.webp", "logo.webp")

from PIL import Image, ImageDraw, ImageFont
img = Image.new("RGB", (1920, 1080), "#06251b")
logo = Image.open("logo.webp").convert("RGBA").resize((360, 360))
img.paste(logo, (780, 220), logo)
d = ImageDraw.Draw(img)
d.text((960, 660), "ULYAH.COM", fill="#d4af4a", anchor="mm")
d.text((960, 740), "Ingin live streaming melalui ulyah.com?", fill="#f4efe3", anchor="mm")
d.text((960, 800), "Yusron Efendi · +62 856-9123-4561", fill="#d4af4a", anchor="mm")
img.save("frame.png")

# 10 menit video loop dari 1 frame + jeda senyap (ffmpeg sudah ada di Kaggle)
!ffmpeg -y -loop 1 -i frame.png -f lavfi -i anullsrc=r=44100:cl=stereo \\
  -t 600 -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest offline_ulyah.mp4
print("✓ offline_ulyah.mp4 — unggah ke YouTube (unlisted), lalu tempel linknya di tab Live Streaming")`;

const STEP_UPLOAD = `Cara memakai hasilnya di ULYAH.COM:

• Narasi film anak (WAV/MP3):
  Portal Admin → tab Media → unggah audio per adegan.
  (Tahap berikutnya: kolom audio_url per adegan kisah anak — sudah masuk backlog.)

• Video offline stream (MP4):
  1. Unggah offline_ulyah.mp4 ke channel YouTube Anda sebagai "Unlisted".
  2. Portal Admin → tab 📡 Live Streaming → slot YouTube 3/4/5 →
     tempel link video → centang LIVE → Simpan.
  3. Slot itu kini menayangkan video pengisi Anda di ulyah.com.

• Ingat: Slot YouTube 1 & 2 sudah otomatis menayangkan
  Masjidil Haram & Masjid Nabawi 24 jam saat tidak diisi.`;

export function KaggleGuideTab() {
  return (
    <div className="space-y-5">
      {/* FUNCTIONAL: register + live-test the free-GPU inference endpoint. */}
      <KaggleOrchestraConnect />

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-medium">SEL SERVER — sajikan LLM gratis lalu tempel URL &amp; Token ke panel di atas</p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Notebook GPU T4 ON + Internet ON. Setelah tercetak <code>URL</code>/<code>Token</code>, isi panel di atas
          dan tekan Simpan → Tes sekarang. Notebook harus tetap berjalan agar endpoint hidup.
        </p>
        <CodeBlock code={STEP_SERVER} />
      </div>

      <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
        <p className="font-heading text-lg">🎓 Panduan Kaggle GPU — Aset Film Anak &amp; Stream</p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          Akun Kaggle Anda memberi GPU gratis (±30 jam/minggu). Panduan ini memakainya untuk dua kebutuhan nyata
          ULYAH.COM: <b>(A)</b> suara narasi berkualitas tinggi untuk Film Animasi Anak, dan <b>(B)</b> video pengisi
          offline yang elegan untuk slot Live Streaming. Semua kode di bawah tinggal salin-tempel ke notebook Kaggle
          dan jalankan — hasilnya diunduh lalu dipakai lewat portal admin ini.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-medium">Langkah 0 — Siapkan notebook</p>
        <CodeBlock code={STEP_SETUP} />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-medium">A. Suara narasi Film Anak (TTS GPU, bahasa Indonesia)</p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Model MMS-TTS Indonesia dari Meta (open source, bebas dipakai). Ganti isi <code>adegan</code> dengan teks
          adegan kisah dari tab Konten.
        </p>
        <CodeBlock code={STEP_TTS} />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-medium">B. Video pengisi offline untuk slot Live</p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Membuat MP4 branded (logo + kontak Yusron Efendi) siap unggah ke YouTube sebagai video pengisi.
        </p>
        <CodeBlock code={STEP_VIDEO} />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="text-sm font-medium">C. Memasang hasilnya di situs</p>
        <CodeBlock code={STEP_UPLOAD} />
      </div>
    </div>
  );
}
