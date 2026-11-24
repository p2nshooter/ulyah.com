import { decryptApiKey } from "@ulyah/shared/crypto";
import type { Env } from "../env.js";
import { getKeyRow, listKeySummaries } from "./keypool-store.js";

/**
 * Serah-terima kunci API ke axto.io — pemilik, 24 Nov 2026: „Copy aja API GPU dari ulyah.com, biar ga terhubung ke
 * ulyah.com" · „Ambil semua apinya yg aktif bukanya hanya GPU, siapa tau berguna".
 *
 * KEY_ENCRYPTION_SECRET hanya ada di Worker ini (tidak di GitHub Secrets), jadi penyegelan terjadi di sini: sekali sehari
 * SEMUA kunci aktif kolam donasi (status active / slow, semua penyedia) dibuka lalu langsung disegel ke kunci publik saluran
 * privat axto.io — AES-256-GCM untuk isi, kuncinya dibungkus RSA-OAEP-256 (format ops/seal-private.mjs di repo axto) —
 * dan disimpan di `axto-handoff/keys.sealed.json`. Hanya axto.io (kunci privatnya di vault axto) yang bisa membukanya;
 * axto.io menyimpannya ulang di vault-nya sendiri dan merender seri G- tanpa ulyah.com. Data donor tidak ikut; kunci
 * terbuka tidak pernah ditulis atau dicatat.
 */
export const AXTO_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAwF7gN5r6xYJ+KFopeJ26
jOQHj9ppqnTa5a9ko5DuXg7JqirW62RBUCEE1dreFA8G/7PNLVBVKmCEgiUEh9QR
gIBFA8+bePsNgZ2BctHn3HMCjLD5eRmc557nnqQEtiWkaSuEjvOUgXAlWEdl4bvL
uQmpdB8qQLVdKEfbdEBpOxidYiRlLVfyxOgcIDTtBJpmhc12APtNEeY3KP9mMxnw
n/IbUq0GNRvSINw5WudSAgGWXzYeAHDAI9mqcYoXylGxNTv439k/DygocoSc+fHR
K72uQGdCZ1xOievO36PUy8/1a4Z5Gk39wybiky7+l3OOhGAXQ9c6EgrBA7WFjqDF
XIeuEh2i5KKTtcdRBKR94aXKiwGwU9suMJ4Z8owvAOTkWsoOKaTPMzSEALT1NjSb
eIZvTNryNIsw3UW4AlZYvEVuni2f7ZG/O037kC5/gpG6NAw0HitJ/l1YhClTqIjs
4da6Q+apXNv/2WDrepuYdEuc1hLBS2ETNsJlkZXhJNl2XNRi+m3yVwY3hie/0WuC
vUqjkuP9t/DZinY00LlnMBkUQd6FgvjpuYG2l/joM50ExwCwm4XrwG7IMEXfDdjH
bvYVJaD72OuHqIJ+TUD27EEG7wEkiXF9qZ4QpriAK9MbN8V2w2FFPOgubzhNMDo2
ZLEj7pOyPDHZG90svrVFJjkCAwEAAQ==
-----END PUBLIC KEY-----`;
export const HANDOFF_KEY = "axto-handoff/keys.sealed.json";
const EVERY_MS = 24 * 3600_000;

const b64 = (u: Uint8Array): string => {
  let s = "";
  for (const x of u) s += String.fromCharCode(x);
  return btoa(s);
};
const pemBytes = (pem: string): ArrayBuffer => {
  const bin = atob(pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, ""));
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) u[i] = bin.charCodeAt(i);
  return u.buffer;
};

/** Segel teks untuk axto.io (RSA-OAEP-256 + AES-256-GCM; ct tanpa tag, tag terpisah — sama dengan segel Node). */
export async function sealForAxto(text: string, pubPem: string = AXTO_PUBLIC_KEY): Promise<string> {
  const pub = await crypto.subtle.importKey("spki", pemBytes(pubPem), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
  const raw = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aes = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt"]);
  const out = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aes, new TextEncoder().encode(text)));
  const ek = new Uint8Array(await crypto.subtle.encrypt({ name: "RSA-OAEP" }, pub, raw));
  return JSON.stringify({ v: 1, alg: "RSA-OAEP-256+A256GCM", ek: b64(ek), iv: b64(iv), tag: b64(out.subarray(out.length - 16)), ct: b64(out.subarray(0, out.length - 16)) });
}

/** Sekali sehari (atau `force`): segel semua kunci aktif untuk axto.io. Mengembalikan jumlah kunci yang disegel. */
export async function axtoHandoffTick(env: Env, opts: { force?: boolean; now?: number } = {}): Promise<number> {
  if (!env.MEDIA_R2 || !env.KEY_ENCRYPTION_SECRET) return 0;
  const now = opts.now ?? Date.now();
  if (!opts.force) {
    const head = await env.MEDIA_R2.head(HANDOFF_KEY);
    if (head && now - head.uploaded.getTime() < EVERY_MS) return 0;
  }
  const rows = (await listKeySummaries(env, { fresh: true })).filter((k) => k.status === "active" || k.status === "slow");
  const keys: { id: number; provider: string; scope: string | null; status: string; priority: number | null; key: string }[] = [];
  for (const r of rows) {
    try {
      const row = await getKeyRow(env, r.id);
      if (!row) continue;
      const key = await decryptApiKey({ ciphertext: row.key_ref, iv: row.key_iv }, env.KEY_ENCRYPTION_SECRET);
      keys.push({ id: r.id, provider: String(r.provider), scope: (r.scope as string | null) ?? null, status: String(r.status), priority: (r.priority as number | null) ?? null, key });
    } catch {
      // kunci rusak dilewati
    }
  }
  const sealed = await sealForAxto(JSON.stringify({ v: 1, from: "ulyah.com", at: new Date(now).toISOString(), keys }));
  await env.MEDIA_R2.put(HANDOFF_KEY, sealed, { httpMetadata: { contentType: "application/json" }, customMetadata: { n: String(keys.length) } });
  return keys.length;
}
