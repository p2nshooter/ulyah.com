/** Jejak audit tindakan admin & keamanan dan log kejadian: hanya-tambah di R2; statistik dihitung dari sini. */
import type { Store } from '../lib/store.ts';
import { wibDate } from '../lib/i18n.ts';

export async function audit(store: Store, by: string, action: string, data: Record<string, unknown>): Promise<void> {
  const at = Date.now();
  await store.append(`audit/${wibDate(at)}`, { at, by, action, data }, { by, action });
}

export async function event(store: Store, kind: string, data: Record<string, unknown>): Promise<void> {
  const at = Date.now();
  await store.append(`events/${wibDate(at)}`, { at, kind, data }, { kind });
}
