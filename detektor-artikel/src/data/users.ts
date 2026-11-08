/** Akun member & admin di R2: dokumen per user + penjaga e-mail unik (create-once). */
import type { Store } from '../lib/store.ts';
import { invTs } from '../lib/store.ts';
import { hashPassword, newId, sha256Hex, type Sealed } from '../lib/crypto.ts';
import type { Lang } from '../lib/i18n.ts';

export type Role = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  lang: Lang;
  pass: string;
  sv: number;
  createdAt: number;
  lastLoginAt?: number;
  suspended?: boolean;
  totp?: Sealed;
  totpPending?: Sealed;
  retentionDays?: number;
  org?: string;
  /** uid pemberi referal (diikat sekali saat daftar). */
  ref?: string;
  /** Hash IP terakhir (anti referal-diri), bukan IP mentahnya. */
  ipHash?: string;
  /** Tingkat dari pembelian (1 Starter … 6 Super Enterprise) dan ubahan admin — MASTER-BLUEPRINT §28.3. */
  tier?: number;
  tierOverride?: number;
  /** Negara terdeteksi saat daftar (ISO-2, dari jaringan Cloudflare) — bahasa & mata uang bawaan. */
  country?: string;
  /** Profil penagihan untuk invoice (perorangan/perusahaan, dalam & luar negeri) — MASTER-BLUEPRINT §28.5. */
  billing?: BillingProfile;
  /** Mesin tujuan yang dipilih saat menukar deposit (mode internal) — jadi pilihan bawaan formulir periksa (§28.7). */
  preferredMode?: string;
}

export interface BillingProfile {
  company?: string;
  taxId?: string;
  address?: string;
  city?: string;
  postal?: string;
  country?: string;
  email?: string;
  po?: string;
}

export const userKey = (id: string) => `c/users/${id}.json`;

export async function emailGuardKey(email: string): Promise<string> {
  return `u/email/${await sha256Hex(email.trim().toLowerCase())}`;
}

export async function findByEmail(store: Store, email: string): Promise<User | null> {
  const g = await store.get<{ id: string }>(await emailGuardKey(email));
  if (!g) return null;
  return store.get<User>(userKey(g.id));
}

export async function getUser(store: Store, id: string): Promise<User | null> {
  return store.get<User>(userKey(id));
}

export class EmailTakenError extends Error {}

export async function createUser(store: Store, input: { email: string; name: string; password: string; lang: Lang; role?: Role; ref?: string; ipHash?: string; country?: string }): Promise<User> {
  const id = newId('usr');
  const email = input.email.trim().toLowerCase();
  const won = await store.createOnce(await emailGuardKey(email), { id });
  if (!won) throw new EmailTakenError('E-mail sudah terdaftar.');
  const user: User = {
    id,
    email,
    name: input.name.trim().slice(0, 80) || email.split('@')[0]!,
    role: input.role ?? 'member',
    lang: input.lang,
    pass: await hashPassword(input.password),
    sv: 1,
    createdAt: Date.now(),
    country: input.country && /^[A-Z]{2}$/.test(input.country) ? input.country : undefined,
    ref: input.ref,
    ipHash: input.ipHash,
  };
  await store.put(userKey(id), user);
  await store.createOnce(`i/users/${invTs(user.createdAt)}~${id}`, {}, { email, name: user.name, role: user.role });
  return user;
}

export async function updateUser(store: Store, id: string, fn: (u: User) => User | null): Promise<User | null> {
  return store.cas<User>(userKey(id), (cur) => (cur ? fn(cur) : null), 'Akun');
}

export const isAdmin = (u: User | null | undefined): boolean => Boolean(u && (u.role === 'owner' || u.role === 'admin'));
