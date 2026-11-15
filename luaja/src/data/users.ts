/** Akun member & admin di R2: dokumen per user + penjaga e-mail unik (create-once). Hanya hash sandi yang disimpan. */
import type { Store } from '../lib/store.ts';
import { invTs } from '../lib/store.ts';
import { hashPassword, newId, sha256Hex } from '../lib/crypto.ts';
import type { Course, Role, Subs, User } from './model.ts';

export const userKey = (id: string) => `c/users/${id}.json`;
export const subsKey = (id: string) => `c/subs/${id}.json`;

export async function emailGuardKey(email: string): Promise<string> {
  return `u/email/${await sha256Hex(email.trim().toLowerCase())}`;
}

export async function findByEmail(store: Store, email: string): Promise<User | null> {
  const g = await store.get<{ id: string }>(await emailGuardKey(email));
  return g ? store.get<User>(userKey(g.id)) : null;
}

export const getUser = (store: Store, id: string) => store.get<User>(userKey(id));

export class EmailTakenError extends Error {}

export async function createUser(store: Store, input: { email: string; name: string; password: string; role?: Role }): Promise<User> {
  const id = newId('usr');
  const email = input.email.trim().toLowerCase();
  const won = await store.createOnce(await emailGuardKey(email), { id });
  if (!won) throw new EmailTakenError('E-mail sudah terdaftar.');
  const user: User = {
    id,
    email,
    name: input.name.trim().slice(0, 80) || email.split('@')[0]!,
    role: input.role ?? 'member',
    pass: await hashPassword(input.password),
    sv: 1,
    createdAt: Date.now(),
  };
  await store.put(userKey(id), user);
  await store.createOnce(`i/users/${invTs(user.createdAt)}~${id}`, {}, { email, name: user.name, role: user.role });
  return user;
}

export async function updateUser(store: Store, id: string, fn: (u: User) => User | null): Promise<User | null> {
  return store.cas<User>(userKey(id), (cur) => (cur ? fn(cur) : null), 'Akun');
}

export const isAdmin = (u: User | null | undefined): boolean => Boolean(u && (u.role === 'owner' || u.role === 'admin'));

export async function getSubs(store: Store, userId: string): Promise<Subs> {
  return (await store.get<Subs>(subsKey(userId))) ?? {};
}

/** Akses ke sebuah bahasa: langganan aktif, atau admin. */
export function hasAccess(subs: Subs, course: Course, user: User | null, now = Date.now()): boolean {
  if (isAdmin(user)) return true;
  const s = subs[course];
  return Boolean(s && s.until > now);
}

/** Perpanjang langganan: dimulai dari sisa masa aktif bila masih aktif, kalau tidak dari sekarang. Idempoten per tagihan. */
export async function grantSubs(store: Store, userId: string, courses: Course[], days: number, tier: Subs[Course] extends infer S ? (S extends { tier: infer T } ? T : never) : never, invoiceId: string): Promise<Subs> {
  const now = Date.now();
  const r = await store.cas<Subs>(subsKey(userId), (cur) => {
    const next: Subs = { ...(cur ?? {}) };
    for (const c of courses) {
      const prev = next[c];
      if (prev && prev.invoiceId === invoiceId) continue; // sudah diberikan oleh tagihan ini
      const base = prev && prev.until > now ? prev.until : now;
      next[c] = { until: base + days * 86_400_000, tier, invoiceId };
    }
    return next;
  }, 'Langganan');
  return r ?? {};
}
