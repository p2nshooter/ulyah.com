/**
 * Menghasilkan `seed/seed.sql` berisi:
 *   1. katalog model bodi & barang bawaan,
 *   2. satu akun administrator, dan
 *   3. satu akun pemilik (peran `bos`).
 *
 * Password di-hash PBKDF2 dengan parameter yang sama persis seperti
 * `src/lib/auth/password.ts` (versi Web Crypto) — kalau parameter di sana
 * berubah, ubah juga di sini. Password plaintext tidak pernah masuk ke file.
 *
 * Sumber password, berurutan:
 *   1. env `ADMIN_BOOTSTRAP_PASSWORD` / `OWNER_BOOTSTRAP_PASSWORD` bila diisi;
 *   2. hash bawaan di bawah, yang plaintext-nya diserahkan langsung ke pemilik.
 *
 * Sengaja TIDAK ADA lagi jalur "password acak dicetak ke layar": repositori ini
 * publik, dan log GitHub Actions ikut publik — password yang tercetak di sana
 * sama saja dengan dibocorkan. Karena itu yang tersimpan di repo hanya hash.
 *
 * Seluruh INSERT memakai `OR IGNORE` sehingga menjalankan seed berulang kali
 * (mis. tiap deploy) tidak menimpa data yang sudah diubah lewat panel —
 * termasuk password yang sudah diganti sendiri oleh pemiliknya.
 */
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { BODY_MODEL_PRESETS, ITEM_PRESETS } from '../src/lib/karoseri/constants';

// Harus sama dengan src/lib/auth/password.ts — Cloudflare Workers menolak
// PBKDF2 di atas 100.000 iterasi saat verifikasi.
const ITERATIONS = 100_000;
const KEY_LENGTH_BYTES = 32;
const SALT_BYTES = 16;

function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES);
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH_BYTES, 'sha256');
  return `pbkdf2$${ITERATIONS}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function sqlString(value: string | null): string {
  if (value === null) return 'NULL';
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Hash bawaan untuk dua akun pertama. Aman berada di repositori publik: ini
 * PBKDF2-SHA256 100.000 iterasi dengan garam acak, dan plaintext-nya panjang
 * serta acak. Plaintext-nya diserahkan langsung ke pemilik bengkel, tidak
 * pernah ditulis di sini maupun di log.
 */
const DEFAULT_ADMIN_HASH =
  'pbkdf2$100000$E5zkZUdwakqMQEuUF8XPBw==$2rdBxNhY66C/xH5/2/muCKosozOTlqtVcQtlq5RLXfw=';
const DEFAULT_OWNER_HASH =
  'pbkdf2$100000$Jj+DgdbbernP4zSwI0lI+A==$TMcpmqZmRvfrNzjKoGvU+ew8T8UarP2UUkdC4PBwFjY=';

type SeedAccount = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'bos';
  passwordHash: string;
};

function accountFromEnv(
  prefix: 'ADMIN' | 'OWNER',
  fallback: Omit<SeedAccount, 'passwordHash'> & { defaultHash: string }
): SeedAccount {
  const password = process.env[`${prefix}_BOOTSTRAP_PASSWORD`]?.trim();
  return {
    id: fallback.id,
    name: fallback.name,
    username: (process.env[`${prefix}_BOOTSTRAP_USERNAME`] || fallback.username).trim().toLowerCase(),
    email: (process.env[`${prefix}_BOOTSTRAP_EMAIL`] || fallback.email).trim().toLowerCase(),
    role: fallback.role,
    passwordHash: password ? hashPassword(password) : fallback.defaultHash
  };
}

function main() {
  // Id tetap agar seed yang dijalankan ulang mengenali baris yang sama dan
  // OR IGNORE benar-benar melewatinya, bukan membuat akun kedua.
  const accounts: SeedAccount[] = [
    accountFromEnv('ADMIN', {
      id: 'usr_bootstrap_admin',
      name: 'Administrator',
      username: 'admin.quantum',
      email: 'admin@quantumkaryabersama.co.id',
      role: 'admin',
      defaultHash: DEFAULT_ADMIN_HASH
    }),
    accountFromEnv('OWNER', {
      id: 'usr_bootstrap_owner',
      name: 'Pemilik',
      username: 'bos.quantum',
      email: 'bos@quantumkaryabersama.co.id',
      role: 'bos',
      defaultHash: DEFAULT_OWNER_HASH
    })
  ];

  const lines: string[] = [
    '-- Dihasilkan oleh `npm run generate:seed`. Jangan diedit manual.',
    '-- Aman dijalankan berulang: semua INSERT memakai OR IGNORE.',
    ''
  ];

  lines.push('-- Akun awal: administrator + pemilik');
  for (const account of accounts) {
    lines.push(
      `INSERT OR IGNORE INTO users (id, name, username, email, password_hash, role, active) VALUES (${sqlString(
        account.id
      )}, ${sqlString(account.name)}, ${sqlString(account.username)}, ${sqlString(account.email)}, ${sqlString(
        account.passwordHash
      )}, ${sqlString(account.role)}, 1);`
    );
  }
  lines.push('');

  lines.push('-- Katalog model bodi bawaan');
  for (const preset of BODY_MODEL_PRESETS) {
    const id = `mdl_seed_${preset.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    lines.push(
      `INSERT OR IGNORE INTO body_models (id, code, name, unit_type, description, base_price_idr, estimated_days, active) VALUES (${sqlString(
        id
      )}, ${sqlString(preset.code)}, ${sqlString(preset.name)}, ${sqlString(preset.unitType)}, ${sqlString(
        preset.description
      )}, ${preset.basePriceIdr}, ${preset.estimatedDays}, 1);`
    );
  }
  lines.push('');

  lines.push('-- Katalog barang & jasa bawaan (dipakai order servis dan daftar harga publik)');
  for (const preset of ITEM_PRESETS) {
    const id = `mdl_item_${preset.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    lines.push(
      `INSERT OR IGNORE INTO items (id, code, name, kind, unit, cost_price_idr, sell_price_idr, stock_qty, min_stock_qty, show_on_landing, active) VALUES (${sqlString(
        id
      )}, ${sqlString(preset.code)}, ${sqlString(preset.name)}, ${sqlString(preset.kind)}, ${sqlString(
        preset.unit
      )}, ${preset.costPriceIdr}, ${preset.sellPriceIdr}, 0, ${preset.kind === 'barang' ? 5 : 0}, ${
        preset.showOnLanding ? 1 : 0
      }, 1);`
    );
  }
  lines.push('');

  const outPath = resolve(process.cwd(), 'seed/seed.sql');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, lines.join('\n'), 'utf8');

  console.log(
    `✔ seed/seed.sql dibuat (${BODY_MODEL_PRESETS.length} model bodi + ${ITEM_PRESETS.length} barang/jasa + ${accounts.length} akun).`
  );
  for (const account of accounts) {
    // Yang dicetak hanya identitas akunnya. Password tidak pernah dicetak,
    // karena keluaran ini ikut tersimpan di log GitHub Actions yang publik.
    console.log(`  ${account.role.padEnd(5)} : ${account.username} (${account.email})`);
  }
}

main();
