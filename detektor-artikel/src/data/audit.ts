/** Jejak audit tindakan admin & keamanan: log hanya-tambah di R2. */
import type { Store } from '../lib/store.ts';
import { wibDate } from './settings.ts';

export interface AuditEntry {
  at: number;
  by: string;
  action: string;
  data: Record<string, unknown>;
}

export async function audit(store: Store, by: string, action: string, data: Record<string, unknown>): Promise<void> {
  const at = Date.now();
  await store.append(`audit/${wibDate(at)}`, { at, by, action, data } satisfies AuditEntry, { by, action });
}
