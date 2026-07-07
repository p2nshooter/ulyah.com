// Shared row/DTO types mirroring packages/db-schema/migrations/0001_init.sql.
// Kept hand-written (not codegen'd) so both Workers and Next.js can import
// without a build step.

export interface Surah {
  id: number;
  name_ar: string;
  name_id: string;
  name_transliteration: string;
  revelation_place: "meccan" | "medinan";
  ayah_count: number;
}

export interface Ayah {
  id: number;
  surah_id: number;
  number: number;
  text_ar: string;
  text_translit: string | null;
}

export interface Translation {
  id: number;
  ayah_id: number;
  lang: string;
  text: string;
  source: string;
}

export interface Tafsir {
  id: number;
  ayah_id: number;
  source: string;
  text: string;
  ai_generated: 0 | 1;
  status: ContentStatus;
  created_at: string;
}

export interface AsbabunNuzul {
  id: number;
  ayah_id: number;
  text: string;
  source: string;
}

export interface Hadits {
  id: number;
  text_ar: string | null;
  text_id: string;
  narrator: string | null;
  grade: string | null;
  source: string;
}

export type ContentStatus = "draft" | "pending_review" | "published" | "rejected";
export type QcStatus = "draft_audio" | "qc_pending" | "published";
export type SourceFormat = "pdf_native" | "pdf_scan" | "epub" | "docx" | "html" | "ai_original";

export interface Story {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
  body: string;
  audio_r2_key: string | null;
  ai_generated: 0 | 1;
  voice_persona_id: number | null;
  qc_status: QcStatus;
  source_format: SourceFormat;
  status: ContentStatus;
  confidence_score: number | null;
  related_ayah_id: number | null;
  created_at: string;
  published_at: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  auto_created: 0 | 1;
}

export interface Ebook {
  id: number;
  title: string;
  author: string | null;
  r2_key: string;
  cover_r2_key: string | null;
  category_id: number | null;
  license_status: "unverified" | "public_domain" | "cc_licensed" | "original" | "rejected";
  license_note: string | null;
  created_at: string;
}

export type KeyStatus =
  | "pending_verification"
  | "active"
  | "slow"
  | "rate_limited"
  | "exhausted"
  | "revoked"
  | "rejected";

export type KeyScope = "text" | "tts" | "gpu" | "image";

export interface AiKeyPoolEntry {
  id: number;
  provider: string;
  scope: KeyScope;
  status: KeyStatus;
  quota_used: number;
  quota_limit: number | null;
  latency_ms: number | null;
  priority: number;
  donated_by_client_id: number | null;
  donor_label: string | null;
  last_health_check: string | null;
  created_at: string;
}

export type DonationProvider = "paypal" | "nowpayments" | "api_key";
export type DonationType = "fiat" | "crypto" | "api_key_donation";
export type DonationStatus = "pending" | "confirmed" | "failed" | "refunded";

export interface DonationLog {
  id: number;
  provider: DonationProvider;
  amount: number | null;
  currency: string | null;
  type: DonationType;
  status: DonationStatus;
  donor_name: string | null;
  donor_email: string | null;
  client_id: number | null;
  provider_ref: string | null;
  message: string | null;
  created_at: string;
}

export interface GenerationJob {
  id: number;
  job_type: "story" | "tafsir_summary" | "categorize" | "tts" | "fact_check";
  prompt_template_id: string | null;
  target_table: string | null;
  target_id: number | null;
  status: "queued" | "running" | "pending_review" | "done" | "failed";
  key_id: number | null;
  priority: number;
  output_ref: string | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Client {
  id: number;
  email: string;
  name: string | null;
  email_verified: 0 | 1;
  created_at: string;
  last_login_at: string | null;
}

/** Full "satu ayat terpadu" payload for the interactive reader. */
export interface AyahBundle {
  ayah: Ayah;
  translation: Translation | null;
  tafsir: Tafsir[];
  asbabun_nuzul: AsbabunNuzul[];
  hadits: (Hadits & { relevance_note: string | null })[];
  stories: Story[];
}
