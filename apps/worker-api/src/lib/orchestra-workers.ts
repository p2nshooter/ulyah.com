import type { Env } from "../env.js";
import { orchestrate, answerGrounded, type Capability, type OrchestraResult, type GroundedAnswer } from "./orchestra.js";

/**
 * ORCHESTRA CORE — Worker Registry.
 *
 * Turns the "one worker, one job" grouping from the blueprint into concrete
 * code: each named worker declares its capability + how it builds its prompt,
 * and delegates the actual provider routing/failover to orchestrate(). Even
 * though several workers may run on the same underlying model, their prompt,
 * scope, and job are separated so each behaves like a specialist — exactly the
 * owner's "walaupun modelnya sama, pengetahuan & promptnya berbeda" rule.
 *
 * Adding a worker = one entry here. The provider a worker actually lands on is
 * decided by the capability's failover chain in orchestra.ts, never hardcoded.
 */

export interface WorkerDef {
  name: string;
  label: string;
  capability: Capability;
  desc: string;
  /** Required input field names, for validation + the admin UI. */
  inputs: string[];
  build: (input: Record<string, string>) => string;
}

export const WORKERS: WorkerDef[] = [
  {
    name: "translate",
    label: "Translate Worker",
    capability: "translate",
    desc: "Terjemah teks ke bahasa target, istilah syar'i tetap ditransliterasi.",
    inputs: ["text", "targetLang"],
    build: (i) =>
      `Translate the text into language code "${i.targetLang}". Preserve meaning faithfully, keep Arabic religious terms transliterated, and output ONLY the translation:\n\n${i.text}`,
  },
  {
    name: "summarize",
    label: "Summary Worker",
    capability: "summarize",
    desc: "Ringkas teks panjang tanpa menambah klaim baru.",
    inputs: ["text"],
    build: (i) =>
      `Ringkas teks berikut menjadi maksimal 3 kalimat Bahasa Indonesia tanpa menambah klaim baru:\n\n${i.text}`,
  },
  {
    name: "classify-grade",
    label: "Hadith Grade Classifier",
    capability: "classify",
    desc: "Kelompokkan istilah derajat yang DISEBUT dalam teks (struktural, bukan fatwa keshahihan baru).",
    inputs: ["text"],
    build: (i) =>
      `Dari teks hadits/keterangan berikut, sebutkan HANYA istilah derajat/klasifikasi yang secara eksplisit tertulis (mis. shahih, hasan, dha'if, marfu', mauquf, mutawatir). Jangan menilai sendiri keshahihan. OUTPUT JSON: { "terms": ["..."] }\n\nTEKS: ${i.text}`,
  },
  {
    name: "sanad",
    label: "Sanad Worker",
    capability: "sanad",
    desc: "Ekstrak rantai perawi (isnad) yang tertulis menjadi urutan terstruktur.",
    inputs: ["text"],
    build: (i) =>
      `Dari teks berikut, ekstrak rantai sanad (urutan perawi dari yang meriwayatkan pertama hingga terakhir) HANYA jika tertulis. Jangan mengarang perawi. OUTPUT JSON: { "chain": ["perawi1", "perawi2", ...], "found": true|false }\n\nTEKS: ${i.text}`,
  },
  {
    name: "keywords",
    label: "Keyword/SEO Worker",
    capability: "classify",
    desc: "Buat kata kunci ringkas untuk metadata/SEO dari sebuah judul & isi.",
    inputs: ["title", "body"],
    build: (i) =>
      `Buat 5-8 kata kunci SEO Bahasa Indonesia yang relevan & sopan untuk konten Islami ini. OUTPUT JSON: { "keywords": ["..."] }\n\nJUDUL: ${i.title}\nISI: ${(i.body ?? "").slice(0, 600)}`,
  },
];

export function listWorkers(): { name: string; label: string; capability: string; desc: string; inputs: string[] }[] {
  return WORKERS.map(({ name, label, capability, desc, inputs }) => ({ name, label, capability, desc, inputs }));
}

/**
 * Dispatch a named worker. "answer" is special-cased to the RAG-grounded
 * pipeline (retrieve-from-DB-first); everything else builds its prompt and
 * goes straight through the capability failover chain.
 */
export async function runWorker(
  env: Env,
  name: string,
  input: Record<string, string>
): Promise<OrchestraResult | GroundedAnswer> {
  if (name === "answer") {
    return answerGrounded(env, { question: input.question ?? "", locale: input.locale });
  }
  const def = WORKERS.find((w) => w.name === name);
  if (!def) {
    return { ok: false, text: null, servedBy: null, capability: "answer", attempts: [{ provider: "-", keyId: null, ok: false, detail: `unknown worker "${name}"` }] };
  }
  const missing = def.inputs.filter((f) => !input[f]);
  if (missing.length) {
    return { ok: false, text: null, servedBy: null, capability: def.capability, attempts: [{ provider: "-", keyId: null, ok: false, detail: `missing input: ${missing.join(", ")}` }] };
  }
  return orchestrate(env, { capability: def.capability, prompt: def.build(input) });
}
