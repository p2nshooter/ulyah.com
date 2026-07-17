// Prompt library — arsitektur doc §21. Every prompt is grounded ONLY in
// data already present in D1 (ayah/tafsir/hadits) — the model is explicitly
// told not to invent new religious claims, per §14.3 (Kontrol Kualitas).

export interface OutlineInput {
  surah: string;
  ayah: number;
  ayahText: string;
  tafsirSummary: string;
  relatedHadits: string;
}

export function outlinePrompt(i: OutlineInput): string {
  return `SYSTEM: Anda adalah penulis konten dakwah yang akurat dan berhati-hati.
Gunakan HANYA rujukan yang diberikan di bawah — jangan mengarang dalil baru.

INPUT:
- Ayat acuan: ${i.surah}:${i.ayah}
- Teks ayat: ${i.ayahText}
- Tafsir tersedia: ${i.tafsirSummary}
- Hadits terkait (jika ada): ${i.relatedHadits || "(tidak ada)"}

TUGAS: Buat outline kisah/hikmah 5 poin (maks 15 kata/poin) yang relevan
dengan ayat di atas, cocok untuk pembaca umum.

OUTPUT (JSON, tanpa markdown code fence): { "outline": ["...", "..."] }`;
}

export function draftingPrompt(outline: string[], i: OutlineInput): string {
  return `SYSTEM: Anda adalah penulis konten dakwah. Tulis narasi lengkap
berdasarkan kerangka berikut, tenang dan tidak berlebihan (bukan gaya
audiobook hiburan), sesuai adab penulisan Islami.

INPUT:
- Ayat acuan: ${i.surah}:${i.ayah}
- Outline: ${JSON.stringify(outline)}
- Tafsir tersedia: ${i.tafsirSummary}

TUGAS: Tulis narasi 300-500 kata dalam Bahasa Indonesia, mengikuti outline,
tanpa menambah dalil/klaim yang tidak didukung tafsir/hadits di atas.

OUTPUT (JSON, tanpa markdown code fence): { "title": "...", "body": "..." }`;
}

export function factCheckPrompt(draftText: string, sourceSnippets: string): string {
  return `SYSTEM: Periksa setiap klaim di draf berikut. Tandai klaim yang TIDAK
didukung oleh tafsir/hadits pada database internal yang disediakan.
Jangan mencari rujukan dari luar sumber yang diberikan.

INPUT: draf=${JSON.stringify(draftText)} | rujukan_tersedia=${JSON.stringify(sourceSnippets)}
OUTPUT (JSON, tanpa markdown code fence): { "unsupported_claims": [...], "verdict": "pass|revise" }`;
}

export function autoCategorizePrompt(existingCategories: { id: number; name: string }[], draftTitle: string, draftSummary: string): string {
  return `SYSTEM: Anda adalah pustakawan konten Islami. Tugas Anda mengkategorikan
konten baru ke struktur kategori yang sudah ada, atau mengusulkan kategori
baru bila benar-benar belum ada yang cocok.

INPUT:
- Kategori yang sudah ada: ${JSON.stringify(existingCategories)}
- Judul draf konten: ${draftTitle}
- Ringkasan konten: ${draftSummary}

OUTPUT (JSON, tanpa markdown code fence):
{
  "title": "...", "slug": "...",
  "category_existing_id": "... atau null",
  "category_new_name": "... atau null",
  "tags": ["..."], "confidence": 0.0-1.0
}`;
}

export function tafsirSummarizePrompt(longTafsir: string): string {
  return `SYSTEM: Ringkas tafsir berikut menjadi maksimal 3 kalimat, Bahasa
Indonesia, tanpa menghilangkan makna inti, tanpa menambah klaim baru.

INPUT: ${longTafsir}

OUTPUT (JSON, tanpa markdown code fence): { "summary": "..." }`;
}
