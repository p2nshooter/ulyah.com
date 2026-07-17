"use client";

import { useState } from "react";

/**
 * Panduan Kaggle GPU — static guide tab (RoadmapTab pattern, no backend).
 * The owner has a Kaggle account with free GPU hours and asked for a
 * dedicated admin menu walking them through using it to produce assets for
 * (a) the kids' animated films and (b) offline filler video for the /live
 * stream slots. Every code block is copy-paste runnable in a fresh Kaggle
 * notebook.
 */

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
