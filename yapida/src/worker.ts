/**
 * Titik masuk Worker: situs (index.ts) + entrypoint RPC bernama `Jam` untuk detak tiap menit (src/detak.ts).
 * `Jam` hanya bisa dipanggil lewat service binding dari Worker lain di akun ini, tidak lewat internet.
 */
import { WorkerEntrypoint } from 'cloudflare:workers';
import situs from './index.ts';
import type { Env } from './env.ts';
import { detak } from './detak.ts';

export class Jam extends WorkerEntrypoint<Env> {
  async menit(): Promise<Record<string, string>> {
    return detak(this.env);
  }
}

export default situs;
