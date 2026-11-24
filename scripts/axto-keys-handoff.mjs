/**
 * Serah-terima kunci API ke axto.io — pemilik, 24 Nov 2026: „Copy aja API GPU dari ulyah.com, biar ga terhubung ke
 * ulyah.com" · „Ambil semua apinya yg aktif bukanya hanya GPU, siapa tau berguna".
 *
 * Membaca kolam kunci donasi (R2 ulyah-media `c/ai_key_pool/<id>.json`, sandi AES-256-GCM), mengambil SEMUA kunci yang
 * aktif (status active / slow, semua penyedia), membukanya dengan KEY_ENCRYPTION_SECRET, lalu langsung menyegelnya ke
 * kunci publik saluran privat axto.io (RSA-OAEP-256 + AES-256-GCM, sama dengan ops/seal-private.mjs di repo axto).
 * Hasil: `ulyah-media/axto-handoff/keys.sealed.json` — hanya axto.io (kunci privatnya di vault axto) yang bisa membuka;
 * axto.io menyimpannya ulang di vault-nya sendiri dan sejak itu tidak membutuhkan ulyah.com untuk merender.
 *
 * Tidak ada kunci terbuka yang dicetak, ditulis ke disk, atau ke repo. Data donor (nama, email, id klien) tidak ikut —
 * hanya penyedia, cakupan, status, prioritas dan kuncinya. Log hanya berisi jumlah per penyedia.
 *
 * ENV: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, KEY_ENCRYPTION_SECRET, [R2_BUCKET=ulyah-media]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createCipheriv, createDecipheriv, publicEncrypt, randomBytes, constants } from "node:crypto";

/** Kunci publik saluran privat axto.io (bukan rahasia; dicetak workflow private-bundle repo axto). */
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
-----END PUBLIC KEY-----
`;
export const HANDOFF_KEY = "axto-handoff/keys.sealed.json";
const LIVE = new Set(["active", "slow"]);

/** Buka satu kunci (sama dengan packages/shared/src/crypto.ts decryptApiKey: AES-256-GCM, tag 16 byte di ujung). */
export function openKey(doc, secretB64) {
  const key = Buffer.from(secretB64, "base64");
  if (key.length !== 32) throw new Error("KEY_ENCRYPTION_SECRET harus 32 byte (base64)");
  const ct = Buffer.from(doc.key_ref, "base64");
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(doc.key_iv, "base64"));
  d.setAuthTag(ct.subarray(ct.length - 16));
  return Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]).toString("utf8");
}

/** Segel untuk axto.io: AES-256-GCM untuk isi, kuncinya dibungkus RSA-OAEP-256 (format ops/seal-private.mjs axto). */
export function sealForAxto(text, pubPem = AXTO_PUBLIC_KEY) {
  const k = randomBytes(32);
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", k, iv);
  const ct = Buffer.concat([c.update(text, "utf8"), c.final()]);
  const ek = publicEncrypt({ key: pubPem, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" }, k);
  return JSON.stringify({ v: 1, alg: "RSA-OAEP-256+A256GCM", ek: ek.toString("base64"), iv: iv.toString("base64"), tag: c.getAuthTag().toString("base64"), ct: ct.toString("base64") });
}

/** Pilih kunci yang hidup, buka, buang data donor. docs: dokumen kolam kunci apa adanya. */
export function collect(docs, secretB64) {
  const keys = [];
  const skipped = { status: 0, broken: 0 };
  for (const d of docs) {
    if (!d || !d.key_ref || !d.key_iv) { skipped.broken += 1; continue; }
    if (!LIVE.has(String(d.status))) { skipped.status += 1; continue; }
    try {
      keys.push({ id: d.id, provider: d.provider, scope: d.scope ?? null, status: d.status, priority: d.priority ?? null, quota_limit: d.quota_limit ?? null, key: openKey(d, secretB64) });
    } catch {
      skipped.broken += 1;
    }
  }
  return { keys, skipped };
}

async function main() {
  const { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account, KEY_ENCRYPTION_SECRET: secret } = process.env;
  const bucket = process.env.R2_BUCKET || "ulyah-media";
  if (!token || !account) throw new Error("CLOUDFLARE_API_TOKEN dan CLOUDFLARE_ACCOUNT_ID wajib");
  if (!secret) throw new Error("KEY_ENCRYPTION_SECRET belum ada di GitHub Secrets — kunci tidak bisa dibuka");
  const api = `https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/${bucket}/objects`;
  const auth = { Authorization: `Bearer ${token}` };
  const tmpGet = mkdtempSync(join(tmpdir(), "axto-keys-"));
  const getDoc = (name) => {
    const f = join(tmpGet, "d.json");
    try {
      execFileSync("npx", ["--yes", "wrangler@4.156.0", "r2", "object", "get", `${bucket}/${name}`, "--file", f, "--remote"], { stdio: "pipe" });
      return JSON.parse(readFileSync(f, "utf8"));
    } catch {
      return null;
    } finally {
      rmSync(f, { force: true });
    }
  };
  // daftar dokumen: API akun (bila token boleh mendaftar), selain itu id berurutan sampai 40 kosong berturut-turut
  let ids = [];
  try {
    let cursor = "";
    do {
      const r = await fetch(`${api}?prefix=${encodeURIComponent("c/ai_key_pool/")}&per_page=1000${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`, { headers: auth });
      const j = await r.json();
      if (!j.success) throw new Error("list");
      for (const o of j.result ?? []) { const m = /^c\/ai_key_pool\/(\d+)\.json$/.exec(o.key); if (m) ids.push(Number(m[1])); }
      cursor = j.result_info?.cursor || "";
    } while (cursor);
  } catch {
    ids = [];
  }
  const docs = [];
  try {
    if (ids.length) {
      for (const id of ids) { const d = getDoc(`c/ai_key_pool/${id}.json`); if (d) docs.push({ id, ...d }); }
    } else {
      for (let id = 1, miss = 0; miss < 40 && id < 5000; id += 1) {
        const d = getDoc(`c/ai_key_pool/${id}.json`);
        if (d) { docs.push({ id, ...d }); miss = 0; } else miss += 1;
      }
    }
  } finally {
    rmSync(tmpGet, { recursive: true, force: true });
  }
  const { keys, skipped } = collect(docs, secret);
  const byProvider = keys.reduce((a, k) => ({ ...a, [k.provider]: (a[k.provider] ?? 0) + 1 }), {});
  const sealed = sealForAxto(JSON.stringify({ v: 1, from: "ulyah.com", at: new Date().toISOString(), keys }));
  const tmp = mkdtempSync(join(tmpdir(), "axto-handoff-"));
  try {
    writeFileSync(join(tmp, "s.json"), sealed);
    execFileSync("npx", ["--yes", "wrangler@4.156.0", "r2", "object", "put", `${bucket}/${HANDOFF_KEY}`, "--file", join(tmp, "s.json"), "--content-type", "application/json", "--remote"], { stdio: "pipe" });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  const line = `Kunci aktif disegel untuk axto.io: ${keys.length} (${Object.entries(byProvider).map(([p, n]) => `${p} ${n}`).join(", ") || "—"}) · dilewati: status ${skipped.status}, rusak ${skipped.broken}`;
  console.log(line);
  if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, `## Serah-terima kunci ke axto.io\n\n${line}\n`, { flag: "a" });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((e) => { console.error(String(e?.message ?? e).slice(0, 300)); process.exit(1); });
}
